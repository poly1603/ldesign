# Vue3 集成示例

本页面展示如何在 Vue3 项目中深度集成 `@ldesign/template`，包括组件、组合式API、指令等各种用法。

## 完整的 Vue3 应用示例

### 项目结构

```
vue3-app/
├── src/
│   ├── main.ts                 # 应用入口
│   ├── App.vue                 # 根组件
│   ├── components/             # 通用组件
│   │   ├── TemplateWrapper.vue
│   │   └── DeviceIndicator.vue
│   ├── templates/              # 模板目录
│   │   ├── login/
│   │   ├── dashboard/
│   │   └── profile/
│   └── composables/            # 组合式函数
│       ├── useDeviceDetection.ts
│       └── useTemplateManager.ts
├── package.json
└── vite.config.ts
```

### 应用入口配置

```typescript
import { TemplatePlugin } from '@ldesign/template/vue'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 安装模板插件
app.use(TemplatePlugin, {
  // 组件配置
  componentName: 'TemplateRenderer',
  registerGlobalComponent: true,
  registerDirectives: true,
  provideGlobalProperties: true,

  // 模板管理器配置
  scanner: {
    scanPaths: [
      'src/templates/**/*.vue',
      'src/components/templates/**/*.vue'
    ],
    enableCache: true,
    watchMode: import.meta.env.DEV
  },

  loader: {
    enableCache: true,
    maxCacheSize: 100,
    preloadStrategy: 'critical'
  },

  deviceAdapter: {
    autoDetect: true,
    watchDeviceChange: true,
    customDetector: () => {
      // 自定义设备检测逻辑
      const width = window.innerWidth
      const height = window.innerHeight
      const ratio = width / height

      if (width <= 480)
        return 'mobile'
      if (width <= 768)
        return 'tablet'
      if (width <= 1024 && ratio < 1.5)
        return 'tablet'
      return 'desktop'
    }
  },

  cache: {
    enabled: true,
    strategy: 'lru',
    maxSize: 50,
    ttl: 30 * 60 * 1000 // 30分钟
  },

  performance: {
    enabled: true,
    sampleRate: 0.1,
    reportInterval: 60000
  },

  debug: import.meta.env.DEV
})

app.mount('#app')
```

### 根组件

```vue
<!-- App.vue -->
<script setup lang="ts">
import { useTemplate, useTemplateCache, useTemplateScanner } from '@ldesign/template/vue'
import { computed, onMounted, provide, ref } from 'vue'
import DeviceIndicator from './components/DeviceIndicator.vue'
import ErrorToast from './components/ErrorToast.vue'
import PerformancePanel from './components/PerformancePanel.vue'

// 路由配置
const routes = [
  { name: 'login', label: '登录' },
  { name: 'dashboard', label: '仪表板' },
  { name: 'profile', label: '个人资料' },
  { name: 'settings', label: '设置' }
]

// 响应式状态
const currentRoute = ref('login')
const currentDevice = ref('desktop')
const error = ref<Error | null>(null)
const showPerformance = ref(false)

// 使用组合式API
const {
  templateComponent,
  loading,
  manager
} = useTemplate({
  autoLoad: false
})

const {
  cacheStats,
  clearCache,
  preloadTemplates
} = useTemplateCache()

const {
  scanning,
  rescan,
  getCategories
} = useTemplateScanner()

// 加载配置
const loadingConfig = {
  showLoading: true,
  loadingText: '正在加载模板...',
  errorText: '模板加载失败'
}

// 计算属性
const templateProps = computed(() => getTemplateProps(currentRoute.value))

// 方法
function getTemplateProps(route: string) {
  const baseProps = {
    title: routes.find(r => r.name === route)?.label || route
  }

  switch (route) {
    case 'dashboard':
      return {
        ...baseProps,
        showStats: true,
        refreshInterval: 30000
      }
    case 'profile':
      return {
        ...baseProps,
        editable: true,
        showAvatar: true
      }
    default:
      return baseProps
  }
}

function onTemplateLoaded(component: any) {
  console.log('模板加载成功:', component)
  error.value = null
}

function onTemplateError(err: Error) {
  console.error('模板加载失败:', err)
  error.value = err
}

function onDeviceChanged(oldDevice: string, newDevice: string) {
  console.log('设备变化:', oldDevice, '->', newDevice)
  currentDevice.value = newDevice
}

// 预加载关键模板
async function preloadCriticalTemplates() {
  try {
    await preloadTemplates([
      { category: 'login', deviceType: currentDevice.value },
      { category: 'dashboard', deviceType: currentDevice.value }
    ])
    console.log('关键模板预加载完成')
  }
  catch (err) {
    console.error('预加载失败:', err)
  }
}

// 性能监控
function setupPerformanceMonitoring() {
  manager.on('performance:warning', (data) => {
    console.warn('性能警告:', data)

    if (data.type === 'memory_high') {
      // 内存使用过高，清理缓存
      clearCache()
    }
  })

  manager.on('template:loaded', (data) => {
    console.log(`模板 ${data.template} 加载耗时: ${data.loadTime}ms`)
  })
}

// 键盘快捷键
function setupKeyboardShortcuts() {
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case '1':
          currentRoute.value = 'login'
          event.preventDefault()
          break
        case '2':
          currentRoute.value = 'dashboard'
          event.preventDefault()
          break
        case '3':
          currentRoute.value = 'profile'
          event.preventDefault()
          break
        case 'r':
          // 刷新当前模板
          manager.clearCache(currentRoute.value, currentDevice.value)
          location.reload()
          event.preventDefault()
          break
        case 'p':
          // 切换性能面板
          showPerformance.value = !showPerformance.value
          event.preventDefault()
          break
      }
    }
  }

  window.addEventListener('keydown', handleKeydown)

  return () => {
    window.removeEventListener('keydown', handleKeydown)
  }
}

// 提供全局状态
provide('templateManager', manager)
provide('currentDevice', currentDevice)
provide('cacheStats', cacheStats)

// 生命周期
onMounted(async () => {
  // 设置性能监控
  setupPerformanceMonitoring()

  // 设置键盘快捷键
  const cleanupKeyboard = setupKeyboardShortcuts()

  // 预加载关键模板
  await preloadCriticalTemplates()

  // 清理函数
  return () => {
    cleanupKeyboard()
  }
})
</script>

<template>
  <div id="app">
    <!-- 设备指示器 -->
    <DeviceIndicator :device="currentDevice" />

    <!-- 导航栏 -->
    <nav class="app-nav">
      <button
        v-for="route in routes"
        :key="route.name"
        :class="{ active: currentRoute === route.name }"
        @click="currentRoute = route.name"
      >
        {{ route.label }}
      </button>
    </nav>

    <!-- 主要内容区域 -->
    <main class="app-main">
      <!-- 使用模板渲染器 -->
      <TemplateRenderer
        :template="currentRoute"
        :device-type="currentDevice"
        :template-props="getTemplateProps(currentRoute)"
        :loading-config="loadingConfig"
        @template-loaded="onTemplateLoaded"
        @template-error="onTemplateError"
        @device-changed="onDeviceChanged"
      />
    </main>

    <!-- 性能监控面板 -->
    <PerformancePanel v-if="showPerformance" />

    <!-- 错误提示 -->
    <ErrorToast v-if="error" :error="error" @close="error = null" />
  </div>
</template>

<style scoped>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
  background: #f5f5f5;
}

.app-nav {
  background: white;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  gap: 1rem;
}

.app-nav button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.app-nav button:hover {
  background: #f0f0f0;
}

.app-nav button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.app-main {
  padding: 2rem;
}
</style>
```

### 自定义组合式函数

```typescript
// composables/useDeviceDetection.ts
import { onMounted, onUnmounted, ref } from 'vue'

export function useDeviceDetection() {
  const deviceType = ref<'desktop' | 'tablet' | 'mobile'>('desktop')
  const screenSize = ref({ width: 0, height: 0 })
  const orientation = ref<'portrait' | 'landscape'>('landscape')

  const updateDeviceInfo = () => {
    const width = window.innerWidth
    const height = window.innerHeight

    screenSize.value = { width, height }
    orientation.value = width > height ? 'landscape' : 'portrait'

    // 设备类型检测
    if (width <= 480) {
      deviceType.value = 'mobile'
    }
    else if (width <= 768) {
      deviceType.value = 'tablet'
    }
    else {
      deviceType.value = 'desktop'
    }
  }

  onMounted(() => {
    updateDeviceInfo()
    window.addEventListener('resize', updateDeviceInfo)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateDeviceInfo)
  })

  return {
    deviceType,
    screenSize,
    orientation
  }
}
```

```typescript
import { useTemplate, useTemplateCache } from '@ldesign/template/vue'
// composables/useTemplateManager.ts
import { computed, ref } from 'vue'

export function useTemplateManager() {
  const currentTemplate = ref('')
  const templateProps = ref({})

  const {
    templateComponent,
    loading,
    error,
    loadTemplate,
    manager
  } = useTemplate()

  const {
    cacheStats,
    clearCache,
    preloadTemplates
  } = useTemplateCache()

  // 计算属性
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)
  const cacheHitRate = computed(() => cacheStats.value.hitRate)

  // 方法
  const switchTemplate = async (template: string, deviceType?: string, props?: any) => {
    currentTemplate.value = template
    templateProps.value = props || {}

    try {
      await loadTemplate(template, deviceType)
    }
    catch (err) {
      console.error('模板切换失败:', err)
      throw err
    }
  }

  const preloadCriticalTemplates = async (templates: string[]) => {
    const templateConfigs = templates.map(template => ({
      category: template,
      deviceType: 'desktop' as const
    }))

    await preloadTemplates(templateConfigs)
  }

  const getPerformanceReport = () => {
    return manager.getPerformanceReport?.() || {}
  }

  return {
    // 状态
    currentTemplate,
    templateProps,
    templateComponent,
    isLoading,
    hasError,
    error,
    cacheHitRate,

    // 方法
    switchTemplate,
    preloadCriticalTemplates,
    clearCache,
    getPerformanceReport,

    // 原始对象
    manager
  }
}
```

### 自定义组件

```vue
<!-- components/TemplateWrapper.vue -->
<script setup lang="ts">
import { useTemplate } from '@ldesign/template/vue'
import { computed } from 'vue'

interface Props {
  template: string
  deviceType?: string
  templateProps?: Record<string, any>
  loadingText?: string
}

const props = withDefaults(defineProps<Props>(), {
  loadingText: '加载中...'
})

const emit = defineEmits<{
  templateEvent: [event: any]
  error: [error: Error]
  loaded: [component: any]
}>()

const {
  templateComponent,
  loading,
  error,
  loadTemplate
} = useTemplate({
  template: props.template,
  deviceType: props.deviceType,
  autoLoad: true
})

// 方法
async function retry() {
  try {
    await loadTemplate(props.template, props.deviceType)
    emit('loaded', templateComponent.value)
  }
  catch (err) {
    emit('error', err as Error)
  }
}

function reportError() {
  // 发送错误报告
  console.error('用户报告模板错误:', {
    template: props.template,
    deviceType: props.deviceType,
    error: error.value
  })
}

function handleTemplateEvent(event: any) {
  emit('templateEvent', event)
}
</script>

<template>
  <div class="template-wrapper">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner" />
      <p>{{ loadingText }}</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">
        ⚠️
      </div>
      <h3>模板加载失败</h3>
      <p>{{ error.message }}</p>
      <div class="error-actions">
        <button @click="retry">
          重试
        </button>
        <button @click="reportError">
          报告问题
        </button>
      </div>
    </div>

    <!-- 模板内容 -->
    <div v-else-if="templateComponent" class="template-content">
      <component
        :is="templateComponent"
        v-bind="templateProps"
        @template-event="handleTemplateEvent"
      />
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <p>没有可用的模板</p>
    </div>
  </div>
</template>

<style scoped>
.template-wrapper {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-state {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding: 2rem;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

.error-actions button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.template-content {
  width: 100%;
}

.empty-state {
  text-align: center;
  color: #666;
}
</style>
```

### 指令使用示例

```vue
<template>
  <div class="directive-examples">
    <h2>指令使用示例</h2>

    <!-- 基础指令 -->
    <section>
      <h3>基础用法</h3>
      <div v-template="'login'" />
    </section>

    <!-- 指定设备类型 -->
    <section>
      <h3>指定设备类型</h3>
      <div v-template="{ template: 'dashboard', deviceType: 'mobile' }" />
    </section>

    <!-- 懒加载指令 -->
    <section>
      <h3>懒加载</h3>
      <div v-template-lazy="{ template: 'profile', deviceType: 'tablet' }" />
    </section>

    <!-- 预加载指令 -->
    <section>
      <h3>预加载</h3>
      <div v-template-preload="['dashboard', 'profile']" />
    </section>

    <!-- 缓存控制 -->
    <section>
      <h3>缓存控制</h3>
      <button v-template-cache:clear="'login'">
        清空登录模板缓存
      </button>
      <button v-template-cache:preload="['dashboard', 'profile']">
        预加载模板
      </button>
    </section>
  </div>
</template>

<style scoped>
.directive-examples {
  padding: 2rem;
}

.directive-examples section {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.directive-examples h3 {
  margin-top: 0;
  color: #333;
}
</style>
```

这个完整的 Vue3 集成示例展示了如何在实际项目中使用 `@ldesign/template` 的各种功能，包括插件配置、组合式API、自定义组件和指令等。
