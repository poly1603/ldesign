# HTTP 插件集成

这个目录包含了 HTTP 客户端插件的集成配置，为应用提供完整的 HTTP 请求功能。

## 📋 功能特性

### 🚀 核心功能
- **多适配器支持**: 支持 Fetch、Axios、Alova 等多种 HTTP 客户端
- **智能缓存系统**: 自动缓存管理，支持自定义缓存键生成
- **自动重试机制**: 智能重试条件，可配置重试次数和延迟
- **请求去重**: 自动识别和合并相同请求
- **错误处理**: 完善的错误恢复和处理机制
- **拦截器系统**: 请求/响应拦截器链
- **并发控制**: 请求队列和并发限制
- **Vue 3 集成**: 深度集成 Vue 3 组合式 API

### 🎯 配置特性
- **标准化插件**: 使用 `createHttpEnginePlugin` 标准插件创建函数
- **类型安全**: 完整的 TypeScript 类型支持
- **性能优化**: 智能缓存和请求优化
- **开发友好**: 详细的日志和调试信息
- **生产就绪**: 优化的生产环境配置

## 🔄 重构说明

### 标准化插件创建

本次重构将自定义的 HTTP 插件实现改为使用 `@ldesign/http` 包提供的标准 `createHttpEnginePlugin` 函数：

**重构前（自定义插件）:**
```typescript
export const httpPlugin: Plugin = {
  name: 'http',
  version: '1.0.0',
  dependencies: [],
  async install(engine) {
    // 自定义安装逻辑...
  }
}
```

**重构后（标准化插件）:**
```typescript
export const httpPlugin = createHttpEnginePlugin({
  name: 'http',
  version: '1.0.0',
  clientConfig: httpClientConfig,
  globalInjection: true,
  globalPropertyName: '$http',
  globalConfig: httpClientConfig,
})
```

### 重构优势

1. **一致性**: 与其他已集成包（如 `@ldesign/color`、`@ldesign/crypto`）保持相同的插件创建模式
2. **维护性**: 减少自定义代码，使用经过测试的标准实现
3. **功能完整**: 标准插件已处理了 Vue 应用生命周期、错误处理等复杂逻辑
4. **类型安全**: 完整的 TypeScript 类型支持，避免类型错误

## 🔧 配置说明

### 基础配置
```typescript
const httpClientConfig: HttpClientConfig = {
  baseURL: 'https://jsonplaceholder.typicode.com', // API 基础地址
  timeout: 10000, // 请求超时时间
  adapter: 'fetch', // 使用的适配器
}
```

### 缓存配置
```typescript
cache: {
  enabled: true, // 启用缓存
  ttl: 300000, // 缓存时间 (5分钟)
  keyGenerator: (config) => {
    // 自定义缓存键生成逻辑
    return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`
  }
}
```

### 重试配置
```typescript
retry: {
  retries: 3, // 最大重试次数
  retryDelay: 1000, // 重试延迟时间
  retryCondition: (error) => {
    // 自定义重试条件
    return !error.response || (error.response.status >= 500)
  }
}
```

### 并发控制配置
```typescript
concurrency: {
  maxConcurrent: 10, // 最大并发请求数
  maxQueueSize: 100, // 队列大小限制
  deduplication: true, // 启用请求去重
}
```

## 📖 使用方法

### 在组件中使用
```vue
<template>
  <div>
    <button @click="fetchData">获取数据</button>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">错误: {{ error.message }}</div>
    <div v-else>{{ data }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useHttp } from '@ldesign/http/vue'

const { get } = useHttp()
const data = ref(null)
const loading = ref(false)
const error = ref(null)

const fetchData = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await get('/posts/1')
    data.value = response.data
  } catch (err) {
    error.value = err
  } finally {
    loading.value = false
  }
}
</script>
```

### 全局属性使用
```vue
<script setup lang="ts">
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance()
const $http = instance?.appContext.config.globalProperties.$http

// 使用全局 HTTP 客户端
const response = await $http.get('/posts')
</script>
```

## 🧪 测试支持

插件包含完整的测试配置，支持：
- 单元测试
- 集成测试
- 错误场景测试
- 性能测试

## 🔍 调试信息

在开发环境下，插件会输出详细的调试信息：
- 🚀 请求开始
- ✅ 请求成功
- ❌ 请求失败
- 💾 缓存命中
- 🔄 重试请求

## 📊 性能监控

插件支持性能监控功能（生产环境可关闭）：
- 请求耗时统计
- 缓存命中率
- 重试成功率
- 错误率统计

## 🛠️ 自定义配置

可以通过修改 `index.ts` 文件来自定义配置：
- 更改 API 基础地址
- 调整缓存策略
- 配置重试参数
- 添加自定义拦截器
- 设置并发限制

## 📚 相关文档

- [@ldesign/http 包文档](../../../packages/http/README.md)
- [HTTP 客户端 API 文档](../../../packages/http/docs/)
- [Vue 3 集成指南](../../../packages/http/docs/vue.md)
