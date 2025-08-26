# useTemplate

> 🎨 Vue 3 组合式 API，让模板管理变得简单优雅！

## 📖 概述

`useTemplate` 是专为 Vue 3 设计的组合式 API，提供了响应式的模板管理功能，让你可以在组件中轻松使用模板系统。

## 🚀 基础用法

### 简单使用

```vue
<script setup lang="ts">
import { useTemplate } from '@ldesign/template/vue'

const {
  currentTemplate,
  templates,
  isLoading,
  error,
  switchTemplate,
  scanTemplates
} = useTemplate()

// 切换模板
async function switchToModern() {
  await switchTemplate('login', 'desktop', 'modern')
}
</script>

<template>
  <div>
    <button @click="switchToModern">
      切换到现代风格
    </button>
    <component
      :is="currentTemplate?.component"
      v-if="currentTemplate && !isLoading"
    />
    <div v-else-if="isLoading">
      加载中...
    </div>
    <div v-else-if="error">
      {{ error.message }}
    </div>
  </div>
</template>
```

### 带配置的使用

```vue
<script setup lang="ts">
import { useTemplate } from '@ldesign/template/vue'

const {
  currentTemplate,
  templates,
  isLoading,
  error,
  switchTemplate
} = useTemplate({
  // 模板管理器配置
  enableCache: true,
  autoDetectDevice: true,
  defaultDevice: 'desktop',
  templatePaths: ['./src/templates']
}, {
  // Hook 配置
  autoScan: true, // 自动扫描模板
  autoLoad: true, // 自动加载默认模板
  defaultTemplate: {
    category: 'login',
    device: 'desktop',
    template: 'modern'
  }
})
</script>
```

## 📋 API 参考

### 函数签名

```typescript
function useTemplate(
  managerConfig?: TemplateManagerConfig,
  hookConfig?: UseTemplateConfig
): UseTemplateReturn
```

### 参数

#### managerConfig

模板管理器配置选项：

```typescript
interface TemplateManagerConfig {
  enableCache?: boolean // 启用缓存
  autoDetectDevice?: boolean // 自动检测设备
  defaultDevice?: DeviceType // 默认设备类型
  templatePaths?: string[] // 模板路径
  debug?: boolean // 调试模式

  // 缓存配置
  cacheConfig?: {
    memory?: MemoryCacheConfig
    localStorage?: LocalCacheConfig
    indexedDB?: IDBCacheConfig
  }

  // 事件回调
  onTemplateLoaded?: (template: Template) => void
  onTemplateError?: (error: Error) => void
  onDeviceChange?: (device: DeviceType) => void
}
```

#### hookConfig

Hook 配置选项：

```typescript
interface UseTemplateConfig {
  autoScan?: boolean // 自动扫描模板
  autoLoad?: boolean // 自动加载模板

  // 默认模板
  defaultTemplate?: {
    category: string
    device?: DeviceType
    template?: string
  }

  // 响应式配置
  reactive?: {
    templates?: boolean // 模板列表响应式
    currentTemplate?: boolean // 当前模板响应式
    loading?: boolean // 加载状态响应式
  }
}
```

### 返回值

```typescript
interface UseTemplateReturn {
  // 响应式状态
  currentTemplate: Ref<Template | null>
  templates: Ref<Template[]>
  isLoading: Ref<boolean>
  error: Ref<Error | null>

  // 模板操作
  switchTemplate: (category: string, device?: DeviceType, template?: string) => Promise<void>
  loadTemplate: (templateId: string) => Promise<Template>
  scanTemplates: () => Promise<ScanResult>

  // 模板查询
  getTemplatesByCategory: (category: string) => Template[]
  getTemplatesByDevice: (device: DeviceType) => Template[]
  findTemplate: (predicate: (template: Template) => boolean) => Template | undefined

  // 缓存操作
  clearCache: () => Promise<void>
  preloadTemplates: (templates: TemplateIdentifier[]) => Promise<void>

  // 工具方法
  refresh: () => Promise<void>
  reset: () => void
}
```

## 🎯 高级用法

### 响应式模板列表

```vue
<script setup lang="ts">
import { useTemplate } from '@ldesign/template/vue'
import { computed } from 'vue'

const { templates, currentTemplate, switchTemplate } = useTemplate()

// 按分类分组的模板
const templatesByCategory = computed(() => {
  const groups: Record<string, Template[]> = {}
  templates.value.forEach((template) => {
    if (!groups[template.category]) {
      groups[template.category] = []
    }
    groups[template.category].push(template)
  })
  return groups
})

// 当前设备的模板
const currentDeviceTemplates = computed(() => {
  const device = currentTemplate.value?.device || 'desktop'
  return templates.value.filter(t => t.device === device)
})
</script>

<template>
  <div class="template-selector">
    <div v-for="(categoryTemplates, category) in templatesByCategory" :key="category">
      <h3>{{ category }}</h3>
      <button
        v-for="template in categoryTemplates"
        :key="template.id"
        :class="{ active: currentTemplate?.id === template.id }"
        @click="switchTemplate(template.category, template.device, template.template)"
      >
        {{ template.name }}
      </button>
    </div>
  </div>
</template>
```

### 模板预加载

```vue
<script setup lang="ts">
import { useTemplate } from '@ldesign/template/vue'
import { onMounted } from 'vue'

const { preloadTemplates, isLoading } = useTemplate()

onMounted(async () => {
  // 预加载常用模板
  await preloadTemplates([
    { category: 'login', device: 'desktop', template: 'modern' },
    { category: 'login', device: 'mobile', template: 'card' },
    { category: 'dashboard', device: 'desktop', template: 'admin' }
  ])
})
</script>
```

### 错误处理

```vue
<script setup lang="ts">
import { useTemplate } from '@ldesign/template/vue'
import { watch } from 'vue'

const { error, switchTemplate, reset } = useTemplate()

// 监听错误
watch(error, (newError) => {
  if (newError) {
    console.error('模板错误:', newError)
    // 显示错误提示
    showErrorNotification(newError.message)
  }
})

async function safeSwitch(category: string, device: string, template: string) {
  try {
    await switchTemplate(category, device, template)
  }
  catch (err) {
    console.error('切换失败:', err)
    // 重置到安全状态
    reset()
  }
}
</script>
```

### 设备响应式

```vue
<script setup lang="ts">
import { useDeviceDetection, useTemplate } from '@ldesign/template/vue'
import { watch } from 'vue'

const { switchTemplate } = useTemplate()
const { currentDevice } = useDeviceDetection()

// 设备变化时自动切换模板
watch(currentDevice, async (newDevice) => {
  await switchTemplate('login', newDevice, 'modern')
})
</script>
```

## 🔧 配置选项详解

### 缓存配置

```typescript
const { currentTemplate } = useTemplate({
  enableCache: true,
  cacheConfig: {
    memory: {
      maxSize: 50,
      ttl: 30 * 60 * 1000 // 30分钟
    },
    localStorage: {
      enabled: true,
      prefix: 'app_template_',
      maxSize: 5 * 1024 * 1024 // 5MB
    }
  }
})
```

### 调试配置

```typescript
const { currentTemplate } = useTemplate({
  debug: process.env.NODE_ENV === 'development',
  onTemplateLoaded: (template) => {
    console.log('模板已加载:', template.name)
  },
  onTemplateError: (error) => {
    console.error('模板错误:', error)
  }
})
```

### 自动化配置

```typescript
const { currentTemplate } = useTemplate({
  autoDetectDevice: true,
  defaultDevice: 'desktop'
}, {
  autoScan: true,
  autoLoad: true,
  defaultTemplate: {
    category: 'login',
    device: 'desktop',
    template: 'modern'
  }
})
```

## 🎨 与其他 Composables 结合

### 与 useDeviceDetection 结合

```vue
<script setup lang="ts">
import { useDeviceDetection, useTemplate } from '@ldesign/template/vue'
import { watch } from 'vue'

const { currentTemplate, switchTemplate } = useTemplate()
const { currentDevice, windowWidth } = useDeviceDetection()

// 设备变化时自动适配
watch(currentDevice, async (device) => {
  if (currentTemplate.value) {
    await switchTemplate(
      currentTemplate.value.category,
      device,
      currentTemplate.value.template
    )
  }
})
</script>

<template>
  <div>
    <div class="device-info">
      当前设备: {{ currentDevice }} ({{ windowWidth }}px)
    </div>
    <component :is="currentTemplate?.component" />
  </div>
</template>
```

### 与 useTheme 结合

```vue
<script setup lang="ts">
import { useTemplate, useTheme } from '@ldesign/template/vue'
import { watch } from 'vue'

const { currentTemplate } = useTemplate()
const { currentTheme, switchTheme } = useTheme()

// 根据模板自动切换主题
watch(currentTemplate, (template) => {
  if (template?.metadata.preferredTheme) {
    switchTheme(template.metadata.preferredTheme)
  }
})
</script>
```

## 💡 最佳实践

### 1. 性能优化

```vue
<script setup lang="ts">
import { useTemplate } from '@ldesign/template/vue'
import { shallowRef } from 'vue'

// 使用 shallowRef 优化大型模板列表
const { templates } = useTemplate({}, {
  reactive: {
    templates: false // 禁用深度响应式
  }
})

// 手动管理响应式
const shallowTemplates = shallowRef(templates.value)
</script>
```

### 2. 错误边界

```vue
<script setup lang="ts">
import { useTemplate } from '@ldesign/template/vue'
import { onErrorCaptured, ref } from 'vue'

const { currentTemplate, error } = useTemplate()
const hasError = ref(false)

onErrorCaptured((err) => {
  hasError.value = true
  console.error('模板渲染错误:', err)
  return false // 阻止错误传播
})
</script>

<template>
  <div>
    <div v-if="hasError" class="error-fallback">
      模板渲染失败，请刷新页面重试
    </div>
    <component :is="currentTemplate?.component" v-else />
  </div>
</template>
```

### 3. 类型安全

```typescript
// 定义模板类型
interface LoginTemplate {
  title: string
  subtitle: string
  onLogin: (credentials: any) => void
}

// 类型安全的使用
const { currentTemplate } = useTemplate()

const templateProps = computed<LoginTemplate>(() => ({
  title: '欢迎登录',
  subtitle: '请输入您的账号信息',
  onLogin: (credentials) => {
    console.log('登录:', credentials)
  }
}))
```

## 🔗 相关链接

- [TemplateRenderer](/api/template-renderer)
- [指令](/api/directives)
- [设备检测](/guide/device-detection)
- [Vue 集成](/api/vue-integration)
