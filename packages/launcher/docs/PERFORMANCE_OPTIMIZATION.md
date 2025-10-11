# 性能优化指南

本指南提供了全面的性能优化策略和最佳实践，帮助你最大化 Vite 构建和开发服务器的性能。

## 目录

- [快速开始](#快速开始)
- [构建优化](#构建优化)
- [开发服务器优化](#开发服务器优化)
- [缓存策略](#缓存策略)
- [代码分割](#代码分割)
- [依赖优化](#依赖优化)
- [性能监控](#性能监控)
- [常见问题](#常见问题)

## 快速开始

### 使用优化的构建命令

```bash
# 快速构建（跳过类型声明生成）
npm run build:fast

# 开发模式（增量构建 + 监听）
npm run dev:fast

# 清理缓存后重新构建
npm run clean:cache && npm run build
```

### 启用构建分析

```bash
# 构建并生成分析报告
launcher build --analyze

# 分析报告将生成在 dist/stats 目录
```

## 构建优化

### 1. 使用 Vite 优化插件

```typescript
import { createViteOptimizer } from '@ldesign/launcher/plugins/vite-optimizer'

export default defineConfig({
  plugins: [
    ...createViteOptimizer({
      analyze: true,              // 启用构建分析
      smartSplit: true,           // 智能代码分割
      chunkSizeLimit: 500,        // chunk 大小限制 (KB)
      gzipReport: true            // 生成 gzip 压缩报告
    })
  ]
})
```

### 2. 优化构建配置

```typescript
import { createOptimizedViteConfig } from '@ldesign/launcher/plugins/vite-optimizer'

export default defineConfig({
  ...createOptimizedViteConfig({
    optimizeDeps: true,    // 依赖预构建优化
    incremental: true      // 增量构建
  }),
  
  build: {
    // 使用 esbuild 压缩（比 terser 快 20-40 倍）
    minify: 'esbuild',
    
    // 禁用 sourcemap（生产环境）
    sourcemap: false,
    
    // 设置 chunk 大小警告限制
    chunkSizeWarningLimit: 500,
    
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    
    // Rollup 选项
    rollupOptions: {
      output: {
        // 手动代码分割
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 大型库单独分割
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react'
            }
            if (id.includes('vue')) {
              return 'vendor-vue'
            }
            return 'vendor'
          }
        }
      }
    }
  }
})
```

### 3. 构建性能追踪

```typescript
import { createPerformanceTracker } from '@ldesign/launcher/utils/performance-tracker'

const tracker = createPerformanceTracker()

// 在构建开始时
tracker.start('build')

// 在不同阶段追踪性能
await tracker.measure('dependency-optimization', async () => {
  // 依赖优化代码
})

await tracker.measure('code-transformation', async () => {
  // 代码转换
})

// 构建结束时
tracker.end('build')

// 生成报告
await tracker.saveReport('./dist/performance-report.json')

// 打印摘要
tracker.printSummary()
```

## 开发服务器优化

### 1. 启用依赖预构建

```typescript
export default defineConfig({
  optimizeDeps: {
    // 明确包含需要预构建的依赖
    include: [
      'vue',
      'react',
      'react-dom',
      'lodash-es'
    ],
    
    // 排除不需要预构建的依赖
    exclude: ['@vueuse/core'],
    
    // 使用 esbuild 优化
    esbuildOptions: {
      target: 'es2020'
    }
  }
})
```

### 2. 文件系统缓存

```typescript
export default defineConfig({
  cacheDir: 'node_modules/.vite',
  
  server: {
    fs: {
      strict: true,
      allow: ['.']
    },
    
    // 预热常用文件
    warmup: {
      clientFiles: [
        './src/main.ts',
        './src/App.vue',
        './src/router/index.ts'
      ]
    }
  }
})
```

### 3. 使用增量构建

在开发模式下，tsup 配置会自动启用增量构建：

```typescript
// tsup.config.ts
export default defineConfig({
  clean: !isDev,           // 开发模式不清理，支持增量
  sourcemap: isDev ? 'inline' : false,
  minify: !isDev,          // 只在生产模式压缩
  
  esbuildOptions(options) {
    options.incremental = isDev  // 开发模式增量构建
  }
})
```

## 缓存策略

### 1. 依赖预构建缓存

```typescript
// 强制重新预构建依赖
export default defineConfig({
  optimizeDeps: {
    force: false  // 默认使用缓存
  }
})
```

清理缓存：

```bash
# 清理 Vite 缓存
npm run clean:cache

# 或手动删除
rm -rf node_modules/.vite node_modules/.cache
```

### 2. 智能缓存管理

```typescript
import { cacheManager } from '@ldesign/launcher'

// 设置缓存
await cacheManager.set('build-config', config, {
  ttl: 3600000  // 1 小时
})

// 获取缓存
const cached = await cacheManager.get('build-config')

// 清除缓存
await cacheManager.clear()
```

## 代码分割

### 1. 路由级别代码分割

```typescript
// Vue Router
const routes = [
  {
    path: '/home',
    component: () => import('./views/Home.vue')
  }
]

// React Router
const Home = lazy(() => import('./views/Home'))
```

### 2. 组件级别代码分割

```typescript
// Vue
const AsyncComponent = defineAsyncComponent(() => 
  import('./components/HeavyComponent.vue')
)

// React
const HeavyComponent = lazy(() => 
  import('./components/HeavyComponent')
)
```

### 3. 智能 Chunk 分割

使用 Vite 优化插件自动配置：

```typescript
import { createViteOptimizer } from '@ldesign/launcher/plugins/vite-optimizer'

export default defineConfig({
  plugins: [
    ...createViteOptimizer({
      smartSplit: true,      // 自动智能分割
      chunkSizeLimit: 500    // 限制 chunk 大小
    })
  ]
})
```

## 依赖优化

### 1. 分析依赖大小

```bash
# 生成依赖分析报告
launcher build --analyze

# 查看报告
open dist/stats/stats.html
```

### 2. 使用 CDN 引入大型库

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['vue', 'react', 'react-dom'],
      output: {
        globals: {
          vue: 'Vue',
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
})
```

在 HTML 中引入 CDN：

```html
<script src="https://cdn.jsdelivr.net/npm/vue@3"></script>
```

### 3. Tree Shaking

确保使用 ES6 模块导入：

```typescript
// ✅ Good - Tree shakeable
import { debounce } from 'lodash-es'

// ❌ Bad - Not tree shakeable
import _ from 'lodash'
```

## 性能监控

### 1. 使用性能追踪器

```typescript
import { globalTracker } from '@ldesign/launcher/utils/performance-tracker'

// 追踪构建过程
globalTracker.start('build')

// ... 构建代码

globalTracker.end('build')
globalTracker.printSummary()
```

### 2. 构建报告分析

构建完成后，查看生成的报告：

- **dist/stats/stats.html** - 可视化构建分析
- **dist/stats/report.html** - 详细构建报告
- **dist/stats/report.json** - JSON 格式报告

### 3. 性能指标

关注以下关键指标：

- **构建时间** - 应该在合理范围内（小项目 < 30s，大项目 < 2min）
- **Bundle 大小** - 首屏加载应该 < 1MB
- **Chunk 数量** - 避免过多的小 chunk（建议 < 50 个）
- **依赖优化时间** - 如果过长，考虑预构建优化

## 最佳实践

### 1. 开发环境

- ✅ 使用 HMR（热模块替换）
- ✅ 启用缓存
- ✅ 使用增量构建
- ✅ 禁用 sourcemap 或使用 inline sourcemap
- ❌ 不要使用代码压缩
- ❌ 不要使用类型检查（单独运行）

### 2. 生产环境

- ✅ 使用代码分割
- ✅ 启用代码压缩（esbuild）
- ✅ 启用 Tree Shaking
- ✅ 优化资源文件（图片压缩、字体子集化）
- ✅ 使用 CDN
- ❌ 不要生成 sourcemap（除非必要）

### 3. CI/CD 优化

```yaml
# .github/workflows/build.yml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: |
      node_modules
      node_modules/.vite
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

- name: Build
  run: npm run build:fast
  env:
    NODE_OPTIONS: --max-old-space-size=8192
```

## 常见问题

### Q: 构建速度慢怎么办？

**A:** 

1. 启用缓存：`npm run clean:cache` 后重新构建
2. 使用快速构建：`npm run build:fast`
3. 分析性能瓶颈：`launcher build --analyze`
4. 检查依赖大小，移除不必要的依赖
5. 使用并行构建（tsup 默认启用）

### Q: 首屏加载慢怎么办？

**A:**

1. 启用代码分割
2. 使用懒加载
3. 优化图片和资源文件
4. 使用 CDN
5. 启用 gzip/brotli 压缩
6. 查看构建分析报告找出大文件

### Q: HMR 更新慢怎么办？

**A:**

1. 检查是否有循环依赖
2. 减少全局导入
3. 使用组件级别的代码分割
4. 清理缓存：`npm run clean:cache`

### Q: 内存溢出怎么办？

**A:**

1. 增加 Node.js 内存限制：`NODE_OPTIONS=--max-old-space-size=8192`
2. 使用增量构建
3. 分批构建大型项目
4. 检查内存泄漏

## 性能基准

以下是不同规模项目的预期性能指标：

| 项目规模 | 文件数量 | 开发启动 | 首次构建 | 增量构建 | Bundle 大小 |
|---------|---------|---------|---------|---------|------------|
| 小型    | < 100   | < 2s    | < 10s   | < 5s    | < 500KB    |
| 中型    | 100-500 | < 5s    | < 30s   | < 15s   | < 1MB      |
| 大型    | 500+    | < 10s   | < 60s   | < 30s   | < 2MB      |

## 更多资源

- [Vite 性能优化指南](https://vitejs.dev/guide/performance.html)
- [Rollup 优化配置](https://rollupjs.org/guide/en/#big-list-of-options)
- [esbuild 性能对比](https://esbuild.github.io/)
- [Web Vitals](https://web.dev/vitals/)

## 贡献

如果你有更好的优化建议，欢迎提交 PR 或 Issue！
