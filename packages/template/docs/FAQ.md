# 常见问题 (FAQ)

本文档收集了使用 `@ldesign/template` 时最常见的问题和解决方案。

## 📑 目录

- [安装和配置](#安装和配置)
- [模板加载](#模板加载)
- [设备检测](#设备检测)
- [缓存相关](#缓存相关)
- [性能优化](#性能优化)
- [类型错误](#类型错误)
- [热更新](#热更新)
- [预渲染](#预渲染)
- [安全问题](#安全问题)
- [调试技巧](#调试技巧)

---

## 安装和配置

### Q1: 如何安装 @ldesign/template？

**A**: 使用包管理器安装：

```bash
# npm
npm install @ldesign/template

# pnpm (推荐)
pnpm add @ldesign/template

# yarn
yarn add @ldesign/template
```

### Q2: 最小配置是什么？

**A**: 最小配置只需要安装插件：

```typescript
import { createApp } from 'vue'
import TemplatePlugin from '@ldesign/template'
import App from './App.vue'

const app = createApp(App)
app.use(TemplatePlugin) // 使用默认配置
app.mount('#app')
```

### Q3: 如何自定义配置？

**A**: 传递配置对象：

```typescript
app.use(TemplatePlugin, {
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
```

参考：[完整配置指南](./OPTIMIZATION_GUIDE.md)

---

## 模板加载

### Q4: 模板加载失败怎么办？

**A**: 按以下步骤排查：

1. **检查模板路径**
```typescript
// 确保路径正确
const templatePath = '/templates/login/mobile/default'
```

2. **启用错误日志**
```typescript
app.use(TemplatePlugin, {
  errorHandling: {
    logErrors: true,
  },
})
```

3. **使用错误处理器**
```typescript
import { ErrorHandler } from '@ldesign/template'

const errorHandler = new ErrorHandler()
try {
  await loadTemplate('login', 'mobile')
} catch (error) {
  errorHandler.handle(error)
  console.log('错误详情:', errorHandler.getRecentErrors())
}
```

### Q5: 如何实现模板懒加载？

**A**: 使用 `lazy` 模式：

```typescript
import { useTemplate } from '@ldesign/template'

const { loadTemplate } = useTemplate()

// 在需要时加载
async function showLogin() {
  await loadTemplate('login', 'mobile')
}
```

### Q6: 加载速度慢怎么优化？

**A**: 使用以下优化策略：

```typescript
import { usePrerender, EnhancedCache } from '@ldesign/template'

// 1. 启用缓存
const cache = new EnhancedCache({ strategy: 'lru', maxSize: 100 })

// 2. 预渲染关键页面
const { prerenderTemplate } = usePrerender()
await prerenderTemplate('/login', 'mobile', { priority: 'critical' })

// 3. 预加载模板
await cache.warmup(['login', 'home'], loadTemplate, { type: 'immediate' })
```

---

## 设备检测

### Q7: 设备检测不准确？

**A**: 调整断点或手动设置：

```typescript
// 方法1: 调整断点
app.use(TemplatePlugin, {
  device: {
    breakpoints: {
      mobile: 640,  // 调小
      tablet: 1024,
      desktop: Infinity,
    },
  },
})

// 方法2: 手动设置
import { useDeviceDetection } from '@ldesign/template'
const { setDeviceType } = useDeviceDetection()
setDeviceType('mobile')
```

### Q8: 如何在服务端正确检测设备？

**A**: 使用 User-Agent 检测：

```typescript
// 服务端
import { detectDeviceFromUA } from '@ldesign/template'

const userAgent = req.headers['user-agent']
const device = detectDeviceFromUA(userAgent)
```

### Q9: Resize 时切换太频繁？

**A**: 增加防抖延迟：

```typescript
app.use(TemplatePlugin, {
  device: {
    debounceDelay: 500, // 从300ms增加到500ms
  },
})
```

---

## 缓存相关

### Q10: 缓存占用内存过大？

**A**: 调整缓存策略：

```typescript
import { EnhancedCache } from '@ldesign/template'

const cache = new EnhancedCache({
  strategy: 'lru',
  maxSize: 50,  // 减小大小
  ttl: 1800,    // 减少TTL
})

// 或使用内存监控
cache.on('memoryWarning', () => {
  cache.clear() // 清理缓存
})
```

### Q11: 如何清除特定模板的缓存？

**A**: 使用 `clearCache` 方法：

```typescript
import { EnhancedCache } from '@ldesign/template'

const cache = new EnhancedCache()

// 清除特定模板
cache.clearCache('/templates/login')

// 清除所有缓存
cache.clear()
```

### Q12: 缓存命中率低怎么办？

**A**: 分析和优化：

```typescript
const cache = new EnhancedCache()

// 查看统计
const stats = cache.getEnhancedStats()
console.log('命中率:', stats.hitRate)
console.log('驱逐次数:', stats.evictionCount)

// 调整策略
if (stats.hitRate < 50) {
  cache.updateConfig({
    strategy: 'lfu', // 改用 LFU
    maxSize: 150,    // 增加大小
  })
}
```

---

## 性能优化

### Q13: 首屏加载慢？

**A**: 使用预渲染：

```typescript
import { usePrerender } from '@ldesign/template'

const { prerenderTemplate } = usePrerender({
  mode: 'ssg',
  cache: true,
})

// 预渲染首屏
await prerenderTemplate('/home', 'mobile', {
  priority: 'critical',
})
```

### Q14: 如何监控性能？

**A**: 使用性能监控面板：

```vue
<template>
  <div id="app">
    <!-- 应用内容 -->
    
    <!-- 开发环境显示性能监控 -->
    <PerformanceMonitor v-if="isDev" />
  </div>
</template>

<script setup lang="ts">
import { PerformanceMonitor } from '@ldesign/template'

const isDev = import.meta.env.DEV
</script>
```

### Q15: 内存泄漏问题？

**A**: 使用 WeakMap 缓存：

```typescript
import { EnhancedCache } from '@ldesign/template'

const cache = new EnhancedCache({
  weakCache: {
    enabled: true,
    maxRefs: 500,
  },
})

// 对组件使用 WeakMap
const component = { /* 组件对象 */ }
cache.setWeak(component, templateData, 'component-id')
```

---

## 类型错误

### Q16: TypeScript 类型错误？

**A**: 确保正确导入类型：

```typescript
// ✅ 正确
import type { TemplateConfig, DeviceType } from '@ldesign/template'

// ❌ 错误
import { TemplateConfig } from '@ldesign/template'
```

### Q17: any 类型警告？

**A**: 使用类型守卫：

```typescript
import { isString, isObject } from '@ldesign/template'

function process(data: unknown) {
  if (isString(data)) {
    // data 自动推断为 string
    console.log(data.toUpperCase())
  }
  
  if (isObject(data)) {
    // data 自动推断为 object
    console.log(Object.keys(data))
  }
}
```

### Q18: 找不到模块声明？

**A**: 检查 tsconfig.json：

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "types": ["@ldesign/template"]
  }
}
```

---

## 热更新

### Q19: 热更新不生效？

**A**: 检查环境和配置：

```typescript
// 1. 检查是否在开发环境
console.log('DEV:', import.meta.env.DEV)
console.log('HMR:', import.meta.hot)

// 2. 启用热更新
app.use(TemplatePlugin, {
  devtools: {
    hotReload: true,
    debug: true,
  },
})

// 3. 确保 Vite 配置正确
// vite.config.ts
export default {
  server: {
    hmr: true,
  },
}
```

### Q20: 如何回滚失败的更新？

**A**: 使用回滚功能：

```typescript
import { useHotReload } from '@ldesign/template'

const { rollback, getHistory } = useHotReload()

// 查看历史
const history = getHistory()
console.log('版本历史:', history)

// 回滚到特定版本
await rollback('1.0.5')
```

---

## 预渲染

### Q21: SSR 渲染失败？

**A**: 检查组件兼容性：

```typescript
// 确保组件支持 SSR
export default {
  name: 'MyComponent',
  
  // 使用 onMounted 而不是直接操作 DOM
  mounted() {
    // DOM 操作
  },
  
  // 服务端可用的钩子
  setup() {
    // SSR 安全的逻辑
  },
}
```

### Q22: 预渲染超时？

**A**: 调整超时配置：

```typescript
import { usePrerender } from '@ldesign/template'

const { prerenderTemplate } = usePrerender({
  timeout: 30000, // 增加到 30 秒
  maxConcurrent: 2, // 减少并发
})
```

### Q23: SEO 标签不生效？

**A**: 配置 SEO 选项：

```typescript
import { usePrerender } from '@ldesign/template'

const { prerenderTemplate } = usePrerender({
  seo: {
    enabled: true,
    generateMeta: true,
    generateStructuredData: true,
    defaultTitle: '我的网站',
    defaultDescription: '网站描述',
  },
})
```

---

## 安全问题

### Q24: 如何防止 XSS 攻击？

**A**: 使用安全工具：

```typescript
import { sanitizeHTML, sanitizePath } from '@ldesign/template'

// 清理 HTML
const cleanHTML = sanitizeHTML(userInput)

// 清理路径
const safePath = sanitizePath(userPath)
```

### Q25: CSP 策略冲突？

**A**: 调整 CSP 配置：

```typescript
import { validateCSP, generateCSP } from '@ldesign/template'

const cspPolicy = generateCSP({
  'script-src': ["'self'", "'unsafe-inline'"],
  'style-src': ["'self'", "'unsafe-inline'"],
})

console.log('CSP Policy:', cspPolicy)
```

---

## 调试技巧

### Q26: 如何开启调试模式？

**A**: 启用 debug 选项：

```typescript
app.use(TemplatePlugin, {
  devtools: {
    enabled: true,
    debug: true,
  },
})
```

### Q27: 如何查看详细日志？

**A**: 使用 ErrorHandler：

```typescript
import { ErrorHandler } from '@ldesign/template'

const errorHandler = new ErrorHandler({
  logErrors: true,
  logLevel: 'verbose',
})

// 查看所有错误
console.log('错误历史:', errorHandler.getHistory())

// 查看统计
console.log('错误统计:', errorHandler.getStats())
```

### Q28: 性能分析工具？

**A**: 使用性能监控：

```typescript
import { usePerformance } from '@ldesign/template'

const { getMetrics, startMeasure, endMeasure } = usePerformance()

// 测量性能
startMeasure('template-load')
await loadTemplate('login', 'mobile')
endMeasure('template-load')

// 查看指标
const metrics = getMetrics()
console.log('性能指标:', metrics)
```

---

## 其他问题

### Q29: 在 Nuxt 3 中如何使用？

**A**: 创建插件：

```typescript
// plugins/template.client.ts
import TemplatePlugin from '@ldesign/template'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(TemplatePlugin, {
    // 配置
  })
})
```

### Q30: 如何贡献代码？

**A**: 欢迎提交 PR！

1. Fork 项目
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 提交代码：`git commit -m "Add feature"`
4. 推送分支：`git push origin feature/your-feature`
5. 提交 Pull Request

参考：[贡献指南](../CONTRIBUTING.md)

---

## 🆘 还有问题？

如果以上内容没有解决你的问题，可以：

1. 查看 [完整文档](./OPTIMIZATION_GUIDE.md)
2. 提交 [Issue](https://github.com/ldesign/template/issues)
3. 加入 [讨论](https://github.com/ldesign/template/discussions)
4. 查看 [示例项目](../examples)

---

## 📚 相关资源

- [快速开始](./QUICK_START.md)
- [优化指南](./OPTIMIZATION_GUIDE.md)
- [TypeScript 指南](./TYPESCRIPT_GUIDE.md)
- [热更新指南](./HOT_RELOAD_GUIDE.md)
- [最终报告](./FINAL_OPTIMIZATION_REPORT.md)

---

**最后更新**: 2025-10-10  
**版本**: v2.0.0
