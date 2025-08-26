# 性能优化指南

本指南详细介绍如何优化 `@ldesign/template` 的性能表现。

## 📊 性能监控

### 启用性能监控

```typescript
const manager = new TemplateManager({
  performance: {
    enabled: true,
    sampleRate: 0.1, // 10% 采样率
    reportInterval: 60000, // 每分钟报告
    metrics: ['loadTime', 'memoryUsage', 'cacheHitRate']
  }
})
```

### 监控指标

```typescript
manager.on('performance:report', (report) => {
  console.log('性能报告:', {
    averageLoadTime: report.averageLoadTime,
    cacheHitRate: report.cacheHitRate,
    memoryUsage: report.memoryUsage,
    errorRate: report.errorRate
  })
})
```

## 🚀 缓存优化

### 多层缓存策略

```typescript
const config = {
  cache: {
    // 内存缓存
    memory: {
      enabled: true,
      strategy: 'lru',
      maxSize: 50,
      ttl: 30 * 60 * 1000
    },

    // 浏览器存储缓存
    storage: {
      enabled: true,
      type: 'localStorage',
      prefix: 'template_cache_',
      compression: true
    },

    // HTTP 缓存
    http: {
      enabled: true,
      headers: {
        'Cache-Control': 'public, max-age=3600'
      }
    }
  }
}
```

### 缓存预热

```typescript
// 应用启动时预热缓存
async function preloadCriticalTemplates() {
  const criticalTemplates = [
    { category: 'login', deviceType: 'desktop' },
    { category: 'dashboard', deviceType: 'desktop' },
    { category: 'navigation', deviceType: 'desktop' }
  ]

  await manager.preloadTemplates(criticalTemplates)
}
```

## ⚡ 加载优化

### 懒加载策略

```vue
<template>
  <!-- 视口内懒加载 -->
  <TemplateRenderer
    template="heavy-component"
    :lazy="true"
    :loading-threshold="200"
    :unload-threshold="500"
  />

  <!-- 交互时懒加载 -->
  <TemplateRenderer
    template="modal-content"
    :lazy="true"
    trigger="interaction"
  />
</template>
```

### 代码分割

```typescript
// 动态导入优化
async function loadTemplate(category: string, deviceType: string) {
  // 使用 Webpack 魔法注释
  const module = await import(
    /* webpackChunkName: "template-[request]" */
    /* webpackPrefetch: true */
    `./templates/${category}/${deviceType}/index.vue`
  )
  return module.default
}
```

### 预加载策略

```typescript
// 智能预加载
const smartPreload = {
  // 基于用户行为预测
  userBehavior: true,

  // 基于路由预测
  routeBased: true,

  // 基于时间预测
  timeBased: {
    enabled: true,
    patterns: [
      { time: '09:00', templates: ['dashboard'] },
      { time: '17:00', templates: ['reports'] }
    ]
  }
}
```

## 🎯 渲染优化

### 虚拟滚动

```vue
<template>
  <VirtualList
    v-slot="{ item, index }"
    :items="largeDataSet"
    :item-height="50"
    :container-height="400"
  >
    <TemplateRenderer
      :key="`${item.template}-${index}`"
      :template="item.template"
      :template-props="item.props"
    />
  </VirtualList>
</template>
```

### 组件复用

```typescript
// 组件池管理
class ComponentPool {
  private pool = new Map<string, any[]>()

  acquire(templateName: string) {
    const components = this.pool.get(templateName) || []
    return components.pop() || this.createComponent(templateName)
  }

  release(templateName: string, component: any) {
    const components = this.pool.get(templateName) || []
    if (components.length < 10) { // 限制池大小
      components.push(component)
      this.pool.set(templateName, components)
    }
  }
}
```

## 📱 移动端优化

### 触摸优化

```css
/* 优化触摸响应 */
.template-mobile {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* 减少重绘 */
.template-mobile .animated-element {
  will-change: transform;
  transform: translateZ(0);
}
```

### 内存管理

```typescript
// 移动端内存优化
const mobileConfig = {
  cache: {
    maxSize: 20, // 减少缓存大小
    ttl: 10 * 60 * 1000, // 缩短过期时间
    strategy: 'lru'
  },

  performance: {
    memoryThreshold: 50 * 1024 * 1024, // 50MB
    autoCleanup: true
  }
}
```

## 🔧 构建优化

### Webpack 配置

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        template: {
          test: /[\\/]templates[\\/]/,
          name: 'templates',
          chunks: 'all',
          priority: 10
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 5
        }
      }
    }
  }
}
```

### Vite 配置

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'template-core': ['@ldesign/template'],
          'template-vue': ['@ldesign/template/vue'],
          'templates-auth': [
            './src/templates/auth/login',
            './src/templates/auth/register'
          ]
        }
      }
    }
  },

  optimizeDeps: {
    include: ['@ldesign/template', '@ldesign/template/vue']
  }
})
```

## 📈 性能测试

### 基准测试

```typescript
// 性能基准测试
async function benchmark() {
  const startTime = performance.now()

  // 测试模板加载性能
  for (let i = 0; i < 100; i++) {
    await manager.loadTemplate('test-template', 'desktop')
  }

  const endTime = performance.now()
  const averageTime = (endTime - startTime) / 100

  console.log(`平均加载时间: ${averageTime}ms`)
}
```

### 内存泄漏检测

```typescript
// 内存泄漏检测
const memoryLeakDetector = {
  start() {
    this.initialMemory = performance.memory?.usedJSHeapSize || 0
    this.checkInterval = setInterval(() => {
      this.checkMemoryUsage()
    }, 5000)
  },

  checkMemoryUsage() {
    const currentMemory = performance.memory?.usedJSHeapSize || 0
    const growth = currentMemory - this.initialMemory

    if (growth > 50 * 1024 * 1024) { // 50MB
      console.warn('检测到可能的内存泄漏')
      this.reportMemoryLeak(growth)
    }
  }
}
```

## 🎛️ 性能调优

### 自动优化

```typescript
// 自适应性能调优
class PerformanceOptimizer {
  private metrics = new Map()

  optimize() {
    const avgLoadTime = this.getAverageLoadTime()
    const memoryUsage = this.getMemoryUsage()
    const cacheHitRate = this.getCacheHitRate()

    // 根据指标自动调整配置
    if (avgLoadTime > 500) {
      this.increaseCacheSize()
    }

    if (memoryUsage > 0.8) {
      this.enableCompression()
      this.reduceCacheTTL()
    }

    if (cacheHitRate < 0.7) {
      this.adjustPreloadStrategy()
    }
  }
}
```

### 性能预算

```typescript
// 设置性能预算
const performanceBudget = {
  loadTime: 200, // 200ms
  memoryUsage: 100 * 1024 * 1024, // 100MB
  cacheHitRate: 0.8, // 80%
  bundleSize: 500 * 1024 // 500KB
}

// 监控性能预算
manager.on('performance:budget-exceeded', (metric, value, budget) => {
  console.warn(`性能预算超标: ${metric} = ${value}, 预算: ${budget}`)
})
```

## 📊 性能分析工具

### Chrome DevTools 集成

```typescript
// 性能标记
function markPerformance(name: string, fn: Function) {
  performance.mark(`${name}-start`)
  const result = fn()
  performance.mark(`${name}-end`)
  performance.measure(name, `${name}-start`, `${name}-end`)
  return result
}

// 使用示例
const template = markPerformance('template-load', () => {
  return manager.loadTemplate('dashboard', 'desktop')
})
```

### 自定义性能面板

```vue
<template>
  <div class="performance-panel">
    <h3>性能监控</h3>

    <div class="metrics">
      <div class="metric">
        <label>平均加载时间</label>
        <span>{{ metrics.averageLoadTime }}ms</span>
      </div>

      <div class="metric">
        <label>缓存命中率</label>
        <span>{{ (metrics.cacheHitRate * 100).toFixed(1) }}%</span>
      </div>

      <div class="metric">
        <label>内存使用</label>
        <span>{{ formatBytes(metrics.memoryUsage) }}</span>
      </div>
    </div>

    <div class="actions">
      <button @click="clearCache">
        清空缓存
      </button>
      <button @click="runBenchmark">
        性能测试
      </button>
    </div>
  </div>
</template>
```
