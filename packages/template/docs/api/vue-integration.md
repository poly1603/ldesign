# Vue 集成 API

`@ldesign/template` 为 Vue 3 提供了完整的集成支持，包括组件、组合式API、指令和插件。

## 组件

### TemplateRenderer

主要的模板渲染组件。

```vue
<TemplateRenderer
  template="login"
  :device-type="currentDevice"
  :template-props="{ title: '登录' }"
  :cache-config="{ enabled: true }"
  :loading-config="{ showLoading: true }"
  @template-loaded="onLoaded"
  @template-error="onError"
  @template-changed="onChanged"
  @device-changed="onDeviceChanged"
/>
```

#### Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `template` | `string` | - | 模板分类名称 |
| `deviceType` | `DeviceType` | `undefined` | 目标设备类型 |
| `scanPaths` | `string \| string[]` | `undefined` | 扫描路径 |
| `templateProps` | `Record<string, any>` | `{}` | 传递给模板的属性 |
| `cacheConfig` | `CacheConfig` | `{ enabled: true }` | 缓存配置 |
| `loadingConfig` | `LoadingConfig` | - | 加载配置 |

#### Events

| 事件 | 参数 | 描述 |
|------|------|------|
| `template-loaded` | `(component: Component)` | 模板加载成功 |
| `template-error` | `(error: Error)` | 模板加载失败 |
| `template-changed` | `(oldTemplate: string, newTemplate: string)` | 模板切换 |
| `device-changed` | `(oldDevice: DeviceType, newDevice: DeviceType)` | 设备类型变化 |
| `template-event` | `(event: any)` | 模板内部事件 |

#### 方法

通过 `ref` 访问组件实例方法：

```vue
<script setup>
import { ref } from 'vue'

const rendererRef = ref()

function refresh() {
  rendererRef.value.refresh()
}
</script>

<template>
  <TemplateRenderer ref="rendererRef" template="login" />
  <button @click="refresh">
    刷新
  </button>
</template>
```

可用方法：
- `retry()` - 重试加载
- `refresh()` - 刷新模板
- `preload(template?, deviceType?)` - 预加载
- `clearCache()` - 清空缓存

## 组合式 API

### useTemplate

核心的模板管理组合式函数。

```typescript
const {
  templateComponent,
  loading,
  error,
  currentDeviceType,
  templateInfo,
  loadTemplate,
  clearCache,
  preloadTemplate,
  manager
} = useTemplate(config?, options?)
```

#### 参数

**方式一：单参数（选项对象）**
```typescript
useTemplate({
  template: 'login',
  deviceType: 'mobile',
  autoLoad: true,
  config: { /* TemplateManagerConfig */ }
})
```

**方式二：双参数（配置 + 选项）**
```typescript
useTemplate(
  { /* TemplateManagerConfig */ },
  { template: 'login', autoLoad: true }
)
```

#### 返回值

| 属性 | 类型 | 描述 |
|------|------|------|
| `templateComponent` | `Ref<Component \| null>` | 当前模板组件 |
| `loading` | `Ref<boolean>` | 加载状态 |
| `error` | `Ref<Error \| null>` | 错误信息 |
| `currentDeviceType` | `Ref<DeviceType>` | 当前设备类型 |
| `templateInfo` | `Ref<TemplateInfo \| null>` | 模板信息 |
| `loadTemplate` | `Function` | 加载模板方法 |
| `clearCache` | `Function` | 清空缓存方法 |
| `preloadTemplate` | `Function` | 预加载方法 |
| `manager` | `TemplateManager` | 管理器实例 |

#### 示例

```vue
<script setup>
import { useTemplate } from '@ldesign/template/vue'

// 基础用法
const { templateComponent, loading, error } = useTemplate({
  template: 'login',
  autoLoad: true
})

// 手动加载
const { loadTemplate } = useTemplate()
await loadTemplate('dashboard', 'mobile')

// 监听设备变化
const { currentDeviceType } = useTemplate()
watch(currentDeviceType, (newDevice) => {
  console.log('设备变化:', newDevice)
})
</script>
```

### useTemplateScanner

模板扫描功能。

```typescript
const {
  scanning,
  templateIndex,
  scanError,
  rescan,
  getTemplateInfo,
  hasTemplate,
  getCategories,
  getAvailableDeviceTypes
} = useTemplateScanner(config?)
```

#### 示例

```vue
<script setup>
import { useTemplateScanner } from '@ldesign/template/vue'

const { scanning, rescan, getCategories } = useTemplateScanner()

// 重新扫描
async function handleRescan() {
  await rescan(['src/templates/**/*.vue'])
}

// 获取分类
const categories = getCategories()
</script>
```

### useTemplateCache

缓存管理功能。

```typescript
const {
  cacheStats,
  clearCache,
  getCacheStats,
  preloadTemplates
} = useTemplateCache(config?)
```

#### 示例

```vue
<script setup>
import { useTemplateCache } from '@ldesign/template/vue'

const { cacheStats, clearCache, preloadTemplates } = useTemplateCache()

// 预加载模板
await preloadTemplates([
  { category: 'login', deviceType: 'desktop' },
  { category: 'dashboard', deviceType: 'mobile' }
])

// 清空缓存
clearCache('login', 'mobile')
</script>
```

## 指令

### v-template

基础模板渲染指令。

```vue
<template>
  <!-- 字符串形式 -->
  <div v-template="'login'" />

  <!-- 对象形式 -->
  <div
    v-template="{
      template: 'dashboard',
      deviceType: 'mobile',
      props: { title: '仪表板' },
    }"
  />
</template>
```

### v-template-lazy

懒加载指令，当元素进入视口时才加载模板。

```vue
<template>
  <div
    v-template-lazy="{
      template: 'heavy-component',
      deviceType: 'desktop',
    }"
  />
</template>
```

### v-template-preload

预加载指令，提前加载模板但不渲染。

```vue
<template>
  <div v-template-preload="'dashboard'" />
</template>
```

### v-template-cache

缓存控制指令。

```vue
<template>
  <!-- 清空缓存 -->
  <div v-template-cache:clear="'login'" />

  <!-- 预加载多个模板 -->
  <div v-template-cache:preload="['login', 'dashboard']" />
</template>
```

## 插件

### TemplatePlugin

Vue 插件，提供全局配置和组件注册。

```typescript
import { TemplatePlugin } from '@ldesign/template/vue'
import { createApp } from 'vue'

const app = createApp(App)

app.use(TemplatePlugin, {
  componentName: 'TemplateRenderer',
  registerGlobalComponent: true,
  registerDirectives: true,
  provideGlobalProperties: true,
  scanner: {
    scanPaths: ['src/templates/**/*.vue']
  },
  loader: {
    enableCache: true,
    preloadStrategy: 'critical'
  },
  deviceAdapter: {
    autoDetect: true,
    watchDeviceChange: true
  }
})
```

#### 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `componentName` | `string` | `'TemplateRenderer'` | 全局组件名称 |
| `registerGlobalComponent` | `boolean` | `true` | 是否注册全局组件 |
| `registerDirectives` | `boolean` | `true` | 是否注册指令 |
| `provideGlobalProperties` | `boolean` | `true` | 是否提供全局属性 |

#### 全局属性

安装插件后，可以在组件中使用全局属性：

```vue
<script setup>
// 通过 getCurrentInstance 访问
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance()
const templateManager = instance?.appContext.config.globalProperties.$templateManager

// 或者在选项式API中直接使用
export default {
  mounted() {
    this.$templateManager.render('login')
    this.$loadTemplate('dashboard', 'mobile')
    this.$clearTemplateCache()
  }
}
</script>
```

### createTemplatePlugin

创建自定义插件实例。

```typescript
import { createTemplatePlugin } from '@ldesign/template/vue'

const customPlugin = createTemplatePlugin({
  componentName: 'MyTemplateRenderer',
  scanner: {
    scanPaths: ['src/my-templates/**/*.vue']
  }
})

app.use(customPlugin)
```

## 类型定义

### 核心类型

```typescript
// 设备类型
type DeviceType = 'desktop' | 'tablet' | 'mobile'

// 模板信息
interface TemplateInfo {
  category: string
  deviceType: DeviceType
  templateFile: {
    path: string
    name: string
    size: number
  }
  metadata: TemplateMetadata
  status: 'pending' | 'loading' | 'loaded' | 'error' | 'cached'
}

// 加载结果
interface LoadResult {
  success: boolean
  component?: VueComponent
  templateInfo?: TemplateInfo
  error?: Error
  fromCache?: boolean
  loadTime?: number
}
```

### Vue 特定类型

```typescript
// 组件属性
interface TemplateRendererProps {
  template: string
  deviceType?: DeviceType
  scanPaths?: string | string[]
  templateProps?: Record<string, any>
  cacheConfig?: CacheConfig
  loadingConfig?: LoadingConfig
}

// 加载配置
interface LoadingConfig {
  showLoading?: boolean
  loadingComponent?: VueComponent
  errorComponent?: VueComponent
  loadingText?: string
  errorText?: string
}
```

## 最佳实践

### 1. 组件封装

```vue
<!-- MyTemplateWrapper.vue -->
<script setup lang="ts">
interface Props {
  template: string
  deviceType?: DeviceType
  templateProps?: Record<string, any>
}

defineProps<Props>()

function handleLoaded(component: any) {
  console.log('Template loaded:', component)
}

function handleError(error: Error) {
  console.error('Template error:', error)
}
</script>

<template>
  <div class="template-wrapper">
    <TemplateRenderer
      :template="template"
      :device-type="deviceType"
      :template-props="templateProps"
      @template-loaded="handleLoaded"
      @template-error="handleError"
    />
  </div>
</template>
```

### 2. 响应式设备适配

```vue
<script setup>
import { useTemplate } from '@ldesign/template/vue'
import { onMounted, onUnmounted, ref } from 'vue'

const currentDevice = ref('desktop')

const { templateComponent, loadTemplate } = useTemplate()

function updateDevice() {
  const width = window.innerWidth
  const newDevice = width <= 768
    ? 'mobile'
    : width <= 1024 ? 'tablet' : 'desktop'

  if (newDevice !== currentDevice.value) {
    currentDevice.value = newDevice
    loadTemplate('dashboard', newDevice)
  }
}

onMounted(() => {
  updateDevice()
  window.addEventListener('resize', updateDevice)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDevice)
})
</script>
```

### 3. 错误边界

```vue
<script setup>
import { onErrorCaptured } from 'vue'

onErrorCaptured((error) => {
  console.error('Template error captured:', error)
  return false // 阻止错误继续传播
})
</script>

<template>
  <div class="template-container">
    <Suspense>
      <template #default>
        <TemplateRenderer :template="template" />
      </template>
      <template #fallback>
        <div class="loading">
          加载中...
        </div>
      </template>
    </Suspense>
  </div>
</template>
```
