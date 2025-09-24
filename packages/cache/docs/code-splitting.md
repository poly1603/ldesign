# 代码分割使用指南

## 不同入口的使用场景

### 1. 核心入口 (`@ldesign/cache/core`)
适用于只需要基础缓存功能的场景，体积最小。

```typescript
import { createCoreCache } from '@ldesign/cache/core'

const cache = createCoreCache('memory')
await cache.set('key', 'value')
const value = await cache.get('key')
```

### 2. 懒加载入口 (`@ldesign/cache/lazy`)
适用于需要按需加载功能的场景，初始体积小，功能完整。

```typescript
import { createLazyCacheManager, lazyModules } from '@ldesign/cache/lazy'

// 创建基础缓存管理器
const cache = await createLazyCacheManager()

// 按需加载性能监控
const { PerformanceMonitor } = await lazyModules.loadPerformanceMonitor()
const monitor = new PerformanceMonitor()

// 按需加载 Vue 集成
const { useCache } = await lazyModules.loadVue()
```

### 3. 功能模块入口
适用于只需要特定功能的场景。

```typescript
// 只使用性能监控
import { PerformanceMonitor } from '@ldesign/cache/performance'

// 只使用同步管理
import { SyncManager } from '@ldesign/cache/sync'

// 只使用预热管理
import { WarmupManager } from '@ldesign/cache/warmup'
```

### 4. 完整入口 (`@ldesign/cache`)
适用于需要所有功能的场景，功能最完整。

```typescript
import { CacheManager, PerformanceMonitor, SyncManager } from '@ldesign/cache'
```

## 性能优化建议

1. **按需选择入口**: 根据实际需求选择合适的入口
2. **懒加载**: 使用懒加载入口实现按需加载
3. **Tree Shaking**: 确保构建工具支持 Tree Shaking
4. **代码分割**: 在应用层面实现进一步的代码分割

## 体积对比

- 核心入口: ~30KB (gzip: ~8KB)
- 懒加载入口: ~50KB (gzip: ~12KB)
- 完整入口: ~100KB (gzip: ~25KB)
