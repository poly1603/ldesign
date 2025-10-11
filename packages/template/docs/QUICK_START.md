# @ldesign/template 快速开始

欢迎使用 `@ldesign/template` v2.0.0 - 企业级 Vue 3 多端模板管理系统！

## 📦 安装

```bash
npm install @ldesign/template
# 或
pnpm add @ldesign/template
# 或
yarn add @ldesign/template
```

## 🚀 5分钟快速上手

### 1. 基础使用

```typescript
// main.ts
import { createApp } from 'vue'
import TemplatePlugin from '@ldesign/template'
import App from './App.vue'

const app = createApp(App)

// 安装插件
app.use(TemplatePlugin, {
  // 基础配置
  device: {
    defaultDevice: 'mobile',
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: Infinity,
    },
  },
  cache: {
    enabled: true,
    strategy: 'lru',
    maxSize: 100,
  },
})

app.mount('#app')
```

### 2. 使用模板组件

```vue
<template>
  <TemplateRenderer 
    category="login" 
    :device="currentDevice"
    :initial-data="loginData"
  />
</template>

<script setup lang="ts">
import { TemplateRenderer } from '@ldesign/template'
import { useTemplate } from '@ldesign/template'

const { currentDevice } = useTemplate()

const loginData = {
  title: '欢迎登录',
  // ... 其他数据
}
</script>
```

### 3. 使用 Composables

```vue
<script setup lang="ts">
import { useTemplate, useDeviceDetection } from '@ldesign/template'

// 模板管理
const {
  currentTemplate,
  loadTemplate,
  switchTemplate,
} = useTemplate({
  category: 'login',
  initialDevice: 'mobile',
})

// 设备检测
const {
  deviceType,
  isMobile,
  isTablet,
  isDesktop,
  orientation,
} = useDeviceDetection()

// 加载模板
await loadTemplate('login', deviceType)
</script>
```

## 🎯 核心功能示例

### 增强缓存

```typescript
import { EnhancedCache } from '@ldesign/template'

// 创建缓存实例
const cache = new EnhancedCache({
  strategy: 'lru',
  maxSize: 100,
  ttl: 3600,
})

// 基础操作
cache.set('key', 'value')
const value = cache.get('key')
cache.delete('key')

// 事务操作
const tx = cache.transaction()
tx.set('key1', 'value1')
  .set('key2', 'value2')
  .delete('key3')
await tx.commit()

// 批量操作
await cache.batch([
  { type: 'set', key: 'a', value: 1 },
  { type: 'set', key: 'b', value: 2 },
])

// 缓存预热
await cache.warmup(
  ['template1', 'template2'],
  async (key) => await loadTemplate(key),
  { type: 'immediate', priority: 'high' }
)
```

### 类型守卫

```typescript
import { 
  isString, 
  isArray, 
  assertNumber,
  arrayOf,
} from '@ldesign/template'

function processData(data: unknown) {
  // 类型守卫
  if (isString(data)) {
    console.log(data.toUpperCase())
  }
  
  // 断言
  assertNumber(data, 'Data must be a number')
  console.log(data.toFixed(2))
  
  // 组合守卫
  const isStringArray = arrayOf(isString)
  if (isStringArray(data)) {
    data.forEach(s => console.log(s))
  }
}
```

### 错误处理

```typescript
import { 
  ErrorHandler, 
  TemplateLoadError,
  HandleError,
} from '@ldesign/template'

// 创建错误处理器
const errorHandler = new ErrorHandler({
  logErrors: true,
  reportErrors: true,
})

// 手动处理错误
try {
  await loadTemplate('login', 'mobile')
} catch (error) {
  errorHandler.handle(
    new TemplateLoadError('模板加载失败', {
      category: 'login',
      device: 'mobile',
      originalError: error,
    })
  )
}

// 使用装饰器自动处理
class TemplateService {
  @HandleError({ recovery: 'retry', maxRetries: 3 })
  async loadTemplate(id: string) {
    // 自动错误处理和重试
  }
}
```

### 热更新 (开发环境)

```typescript
import { useHotReload } from '@ldesign/template'

const {
  state,
  currentVersion,
  onUpdate,
  rollback,
} = useHotReload()

// 监听模板更新
onUpdate('template', (update) => {
  console.log('模板已更新:', update.path)
  // 重新加载模板
})

// 回滚到特定版本
await rollback('1.0.5')

// 查看版本信息
console.log('当前版本:', currentVersion.version)
```

### 预渲染 (SSR/SSG)

```typescript
import { usePrerender, useSSRPrerender } from '@ldesign/template'

// 通用预渲染
const { prerenderTemplate } = usePrerender({
  mode: 'hybrid',
  cache: true,
  seo: { enabled: true },
})

// 预渲染单个模板
const result = await prerenderTemplate(
  '/templates/login/mobile/default',
  'mobile',
  {
    priority: 'high',
    initialData: { title: '登录' },
  }
)

console.log('HTML:', result.html)
console.log('SEO:', result.seo)

// SSR专用
const { prerenderTemplate: ssrRender } = useSSRPrerender()
const ssrResult = await ssrRender('/login', 'mobile')
```

### 性能监控

```vue
<template>
  <div id="app">
    <!-- 你的应用 -->
    
    <!-- 开发环境显示性能监控 -->
    <PerformanceMonitor v-if="isDev" />
  </div>
</template>

<script setup lang="ts">
import { PerformanceMonitor } from '@ldesign/template'

const isDev = import.meta.env.DEV
</script>
```

## 🔧 配置选项

### 完整配置示例

```typescript
app.use(TemplatePlugin, {
  // 设备检测配置
  device: {
    defaultDevice: 'mobile',
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: Infinity,
    },
    detectOnResize: true,
    debounceDelay: 300,
  },
  
  // 缓存配置
  cache: {
    enabled: true,
    strategy: 'lru', // 'lru' | 'lfu' | 'fifo' | 'ttl' | 'hybrid'
    maxSize: 100,
    ttl: 3600,
  },
  
  // 加载器配置
  loader: {
    maxConcurrent: 3,
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  
  // 预加载配置
  preload: {
    enabled: true,
    mode: 'eager', // 'eager' | 'lazy' | 'on-demand'
    templates: ['login', 'home'],
  },
  
  // 错误处理配置
  errorHandling: {
    logErrors: true,
    reportErrors: false,
    recovery: 'retry',
    maxRetries: 3,
  },
  
  // 安全配置
  security: {
    enableCSP: true,
    sanitizeHTML: true,
    validatePaths: true,
  },
  
  // 开发配置
  devtools: {
    enabled: import.meta.env.DEV,
    performanceMonitor: true,
    hotReload: true,
  },
})
```

## 📚 常用场景

### 场景1: 多端登录页面

```vue
<template>
  <TemplateRenderer 
    category="login"
    :device="deviceType"
    :initial-data="loginData"
    @template-loaded="onTemplateLoaded"
    @login-submit="handleLogin"
  />
</template>

<script setup lang="ts">
import { useDeviceDetection, useTemplate } from '@ldesign/template'

const { deviceType } = useDeviceDetection()

const loginData = {
  title: '欢迎登录',
  logo: '/logo.png',
  backgroundImage: '/bg.jpg',
}

function onTemplateLoaded() {
  console.log('模板加载完成')
}

async function handleLogin(credentials: any) {
  // 登录逻辑
}
</script>
```

### 场景2: 响应式设备切换

```vue
<script setup lang="ts">
import { watch } from 'vue'
import { useDeviceDetection, useTemplate } from '@ldesign/template'

const { deviceType } = useDeviceDetection()
const { switchTemplate } = useTemplate()

// 自动切换模板
watch(deviceType, async (newDevice, oldDevice) => {
  if (newDevice !== oldDevice) {
    console.log(`设备切换: ${oldDevice} → ${newDevice}`)
    await switchTemplate('login', newDevice)
  }
})
</script>
```

### 场景3: 性能优化

```typescript
import { 
  EnhancedCache, 
  usePrerender,
  useDeviceDetection,
} from '@ldesign/template'

// 1. 启用缓存
const cache = new EnhancedCache({
  strategy: 'lru',
  maxSize: 100,
})

// 2. 预渲染关键页面
const { prerenderTemplate } = usePrerender()
await prerenderTemplate('/login', 'mobile', { priority: 'critical' })
await prerenderTemplate('/home', 'mobile', { priority: 'high' })

// 3. 预加载模板
const { deviceType } = useDeviceDetection()
await cache.warmup(
  ['login', 'home', 'profile'],
  async (template) => await loadTemplate(template, deviceType),
  { type: 'lazy', priority: 'low' }
)
```

## 🎨 样式和主题

### 使用内置主题

```vue
<template>
  <TemplateRenderer 
    category="login"
    :theme="currentTheme"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const currentTheme = ref('light') // 'light' | 'dark'

function toggleTheme() {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
}
</script>
```

### 自定义样式

```scss
// 覆盖默认样式
.ldesign-template {
  --primary-color: #1890ff;
  --border-radius: 4px;
  --transition-duration: 0.3s;
}
```

## 🔍 调试技巧

### 1. 开启调试模式

```typescript
app.use(TemplatePlugin, {
  devtools: {
    enabled: true,
    debug: true,
  },
})
```

### 2. 使用性能监控

```vue
<template>
  <PerformanceMonitor 
    :auto-refresh="true"
    :refresh-interval="1000"
  />
</template>
```

### 3. 查看缓存统计

```typescript
import { EnhancedCache } from '@ldesign/template'

const cache = new EnhancedCache()
const stats = cache.getEnhancedStats()

console.log('缓存统计:', {
  命中率: `${stats.hitRate}%`,
  总数: stats.size,
  驱逐次数: stats.evictionCount,
})
```

## ⚠️ 常见问题

### Q: 模板加载失败？
**A**: 检查模板路径是否正确，确保文件存在。启用错误日志查看详细信息。

```typescript
app.use(TemplatePlugin, {
  errorHandling: {
    logErrors: true,
  },
})
```

### Q: 设备检测不准确？
**A**: 调整断点配置或手动指定设备类型。

```typescript
const { setDeviceType } = useDeviceDetection()
setDeviceType('mobile')
```

### Q: 缓存占用内存过大？
**A**: 调整缓存大小或启用自动清理。

```typescript
const cache = new EnhancedCache({
  maxSize: 50, // 减小缓存大小
  strategy: 'lru', // 使用LRU策略
})
```

### Q: 热更新不生效？
**A**: 确保在开发环境且 HMR 已启用。

```typescript
// 检查环境
console.log('开发环境:', import.meta.env.DEV)
console.log('HMR:', import.meta.hot)
```

## 📖 下一步

- [完整配置指南](./OPTIMIZATION_GUIDE.md)
- [TypeScript 使用指南](./TYPESCRIPT_GUIDE.md)
- [热更新指南](./HOT_RELOAD_GUIDE.md)
- [性能优化建议](./FINAL_OPTIMIZATION_REPORT.md)

## 🆘 获取帮助

- 查看 [FAQ](./FAQ.md)
- 提交 [Issue](https://github.com/ldesign/template/issues)
- 加入 [讨论](https://github.com/ldesign/template/discussions)

## 📄 许可证

MIT License

---

**祝你使用愉快！** 🎉
