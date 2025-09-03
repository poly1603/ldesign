# Cache 插件集成

这个目录包含了 Cache 缓存插件的集成配置，为应用提供完整的缓存管理功能。

## 📋 功能特性

### 🚀 核心功能
- **多存储引擎支持**: 支持 Memory、LocalStorage、SessionStorage、IndexedDB、Cookie 等多种存储引擎
- **智能缓存策略**: 自动过期管理、LRU 淘汰策略、容量控制
- **数据安全**: 支持数据加密和压缩，保护敏感信息
- **性能优化**: 智能缓存和数据压缩，提升应用性能
- **统计监控**: 详细的缓存统计和性能监控
- **Vue 3 集成**: 深度集成 Vue 3 组合式 API

### 🎯 配置特性
- **标准化插件**: 使用 `createCacheEnginePlugin` 标准插件创建函数
- **类型安全**: 完整的 TypeScript 类型支持
- **环境适配**: 开发和生产环境的不同配置
- **开发友好**: 详细的日志和调试信息
- **生产就绪**: 优化的生产环境配置

## 🔧 配置说明

### 存储引擎配置

```typescript
const cacheConfig = {
  // 默认存储引擎
  defaultEngine: 'localStorage',
  
  // 安全配置
  enableEncryption: false, // 生产环境建议启用
  enableCompression: true, // 启用压缩节省空间
  
  // 容量配置
  maxSize: 50 * 1024 * 1024, // 50MB
  
  // 过期配置
  ttl: 7 * 24 * 60 * 60 * 1000, // 7天
}
```

### 环境配置

**开发环境:**
- 启用调试模式和性能监控
- 较短的过期时间（30分钟）
- 频繁的清理间隔（5分钟）

**生产环境:**
- 关闭调试模式
- 启用数据加密
- 较长的过期时间（30天）
- 较长的清理间隔（24小时）

## 📖 使用方法

### 在组件中使用

```vue
<template>
  <div>
    <h2>缓存示例</h2>
    <div>
      <input v-model="key" placeholder="缓存键" />
      <input v-model="value" placeholder="缓存值" />
      <button @click="setCache">设置缓存</button>
      <button @click="getCache">获取缓存</button>
      <button @click="deleteCache">删除缓存</button>
    </div>
    <div v-if="result">
      <h3>结果:</h3>
      <pre>{{ result }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCache } from '@ldesign/cache/vue'

const { get, set, delete: del, has, keys, clear } = useCache()

const key = ref('test-key')
const value = ref('test-value')
const result = ref('')

const setCache = async () => {
  try {
    await set(key.value, value.value)
    result.value = `缓存设置成功: ${key.value} = ${value.value}`
  } catch (error) {
    result.value = `设置失败: ${error}`
  }
}

const getCache = async () => {
  try {
    const data = await get(key.value)
    result.value = `缓存值: ${JSON.stringify(data)}`
  } catch (error) {
    result.value = `获取失败: ${error}`
  }
}

const deleteCache = async () => {
  try {
    await del(key.value)
    result.value = `缓存删除成功: ${key.value}`
  } catch (error) {
    result.value = `删除失败: ${error}`
  }
}
</script>
```

### 全局属性使用

```typescript
// 在组件中通过全局属性访问
export default {
  async mounted() {
    // 设置缓存
    await this.$cache.set('user', { name: 'John', age: 30 })
    
    // 获取缓存
    const user = await this.$cache.get('user')
    console.log('用户信息:', user)
    
    // 检查缓存是否存在
    const exists = await this.$cache.has('user')
    console.log('缓存存在:', exists)
    
    // 获取所有缓存键
    const allKeys = await this.$cache.keys()
    console.log('所有缓存键:', allKeys)
  }
}
```

### 高级用法

```typescript
import { useCacheManager } from '@ldesign/cache/vue'

// 获取缓存管理器实例
const cacheManager = useCacheManager()

// 切换存储引擎
await cacheManager.switchEngine('indexedDB')

// 批量操作
await cacheManager.setMultiple({
  'user:1': { name: 'Alice' },
  'user:2': { name: 'Bob' },
  'user:3': { name: 'Charlie' }
})

// 获取缓存统计
const stats = await cacheManager.getStats()
console.log('缓存统计:', stats)

// 清理过期缓存
await cacheManager.cleanup()
```

## 🔍 调试和监控

### 开发环境调试

在开发环境中，插件会输出详细的调试信息：

```typescript
// 查看缓存状态
console.log('缓存实例:', this.$cache)
console.log('缓存配置:', this.$cache.config)
console.log('缓存管理器:', this.$cache.manager)
```

### 性能监控

```typescript
import { useCacheStats } from '@ldesign/cache/vue'

const { stats, refresh } = useCacheStats()

// 监控缓存性能
watchEffect(() => {
  console.log('缓存统计:', stats.value)
  console.log('命中率:', stats.value.hitRate)
  console.log('缓存大小:', stats.value.size)
})
```

## 🚨 注意事项

1. **存储限制**: 不同存储引擎有不同的容量限制
2. **数据序列化**: 复杂对象会被自动序列化/反序列化
3. **过期管理**: 设置合理的 TTL 避免内存泄漏
4. **加密性能**: 启用加密会影响性能，根据需要选择
5. **浏览器兼容**: IndexedDB 在某些旧浏览器中可能不可用

## 🔗 相关链接

- [@ldesign/cache 文档](../../packages/cache/README.md)
- [Cache API 参考](../../packages/cache/docs/api.md)
- [缓存最佳实践](../../packages/cache/docs/best-practices.md)
