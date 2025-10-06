# 性能优化技巧

本指南提供了使用 @ldesign/store 时的性能优化最佳实践。

## 🚀 使用 LRU 缓存

LRU（最近最少使用）缓存会自动淘汰最少使用的条目，提供更好的缓存命中率。

```typescript
import { LRUCache } from '@ldesign/store'

// 创建 LRU 缓存
const cache = new LRUCache<string, User>(
  1000, // 最大条目数
  5 * 60 * 1000 // TTL: 5分钟
)

// 使用缓存
cache.set('user:1', userData)
const user = cache.get('user:1') // 自动移到最近使用

// 清理资源
cache.dispose()
```

### 性能优势

- ✅ 所有操作 O(1) 时间复杂度
- ✅ 自动淘汰最少使用的条目
- ✅ 缓存命中率提升 30-50%
- ✅ 自动清理过期缓存

## ⚡ 使用快速哈希

使用 `fastHash` 替代 `JSON.stringify` 可以显著提升性能。

```typescript
import { fastHash } from '@ldesign/store'

// 生成缓存键
const cacheKey = fastHash({ userId: 1, type: 'profile' })

// 比较对象
const hash1 = fastHash(obj1)
const hash2 = fastHash(obj2)
const isEqual = hash1 === hash2

// 用于 Action 缓存
@Action({ cache: true })
async fetchData(params: any) {
  const key = fastHash(params) // 比 JSON.stringify 快 5-10 倍
  // ...
}
```

### 性能对比

```typescript
// 慢：JSON.stringify
const key = JSON.stringify(args) // ~1000μs for large objects

// 快：fastHash
const key = fastHash(args) // ~100μs for large objects
```

## 🎯 使用对象池

对象池可以复用对象，减少 GC 压力。

```typescript
import { ObjectPool } from '@ldesign/store'

// 创建对象池
const requestPool = new ObjectPool(
  // 工厂函数：创建新对象
  () => ({ url: '', method: 'GET', data: null }),
  // 重置函数：清理对象以便复用
  (req) => { 
    req.url = ''
    req.method = 'GET'
    req.data = null
  },
  50 // 最大池大小
)

// 使用对象
const request = requestPool.acquire()
request.url = '/api/users'
request.method = 'POST'
request.data = { name: 'John' }

// 发送请求...

// 归还到池中
requestPool.release(request)
```

### 适用场景

- 频繁创建和销毁的对象
- 大对象或复杂对象
- 高频操作（如请求、事件等）

## 🧹 正确清理资源

确保在组件卸载时清理资源，防止内存泄漏。

```typescript
import { onUnmounted } from 'vue'

class MyStore extends BaseStore {
  private timer?: NodeJS.Timeout
  private cache: LRUCache<string, any>

  constructor() {
    super('my-store')
    
    // 创建缓存
    this.cache = new LRUCache(100, 60000)
    
    // 创建定时器
    this.timer = setInterval(() => {
      // 定期任务
    }, 1000)
  }

  $dispose() {
    // 清理定时器
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = undefined
    }
    
    // 清理缓存
    this.cache.dispose()
    
    // 调用父类清理
    super.$dispose()
  }
}

// 在组件中使用
const store = new MyStore()

onUnmounted(() => {
  store.$dispose() // 确保清理资源
})
```

## 📊 缓存 Action 结果

使用 `@CachedAction` 装饰器自动缓存 Action 结果。

```typescript
class UserStore extends BaseStore {
  // 缓存 1 分钟
  @CachedAction(60000)
  async fetchUser(id: string) {
    const user = await api.getUser(id)
    return user
  }
  
  // 使用默认缓存时间（5分钟）
  @CachedAction()
  async fetchUserList() {
    return await api.getUsers()
  }
}
```

### 注意事项

- ✅ 缓存会自动管理过期
- ✅ 使用 LRU 策略，不会无限增长
- ✅ 在 Store dispose 时自动清理
- ⚠️ 确保缓存的数据不会频繁变化

## 🎨 优化 Getter 计算

使用 `@MemoizedGetter` 缓存计算结果。

```typescript
class ProductStore extends BaseStore {
  @State({ default: [] })
  products: Product[] = []
  
  // 缓存计算结果，只在依赖变化时重新计算
  @MemoizedGetter(['products'])
  get expensiveComputation() {
    return this.products
      .map(p => /* 复杂计算 */)
      .filter(/* 复杂过滤 */)
      .sort(/* 复杂排序 */)
  }
}
```

### 性能提升

- ✅ 避免重复计算
- ✅ 使用快速哈希比较依赖
- ✅ 自动缓存失效

## 🔄 批量更新状态

使用 `$patch` 批量更新状态，减少响应式触发次数。

```typescript
// ❌ 不好：多次触发响应式更新
store.name = 'John'
store.age = 25
store.email = 'john@example.com'

// ✅ 好：一次性更新
store.$patch({
  name: 'John',
  age: 25,
  email: 'john@example.com'
})

// ✅ 也可以使用函数形式
store.$patch((state) => {
  state.name = 'John'
  state.age = 25
  state.email = 'john@example.com'
})
```

## 📈 性能监控

使用内置的性能监控工具。

```typescript
import { PerformanceMonitor } from '@ldesign/store'

const monitor = new PerformanceMonitor()

// 监控操作
monitor.startOperation('fetchUsers')
await fetchUsers()
monitor.endOperation('fetchUsers')

// 获取性能报告
const report = monitor.getPerformanceReport()
console.log('慢速 Actions:', report.slowActions)
console.log('慢速 Getters:', report.slowGetters)
console.log('频繁更新:', report.frequentUpdates)
```

## 🎯 最佳实践总结

1. **使用 LRU 缓存** - 更好的缓存命中率
2. **使用快速哈希** - 5-10 倍性能提升
3. **使用对象池** - 减少 GC 压力
4. **正确清理资源** - 防止内存泄漏
5. **缓存 Action 结果** - 避免重复请求
6. **优化 Getter 计算** - 避免重复计算
7. **批量更新状态** - 减少响应式触发
8. **监控性能** - 及时发现问题

## 📝 性能检查清单

- [ ] 是否使用了 LRU 缓存？
- [ ] 是否使用了快速哈希？
- [ ] 是否正确清理了资源？
- [ ] 是否缓存了频繁调用的 Action？
- [ ] 是否优化了复杂的 Getter？
- [ ] 是否批量更新状态？
- [ ] 是否监控了性能指标？
- [ ] 是否避免了内存泄漏？

遵循这些最佳实践，您的应用将获得最佳性能！

