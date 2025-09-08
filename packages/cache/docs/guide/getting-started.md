# 快速开始

欢迎使用 @ldesign/cache！这个指南将帮助你在几分钟内上手这个强大的缓存管理器。

## 安装

::: code-group

```bash [pnpm]
pnpm add @ldesign/cache
```

```bash [npm]
npm install @ldesign/cache
```

```bash [yarn]
yarn add @ldesign/cache
```

:::

## 第一个示例

让我们从最简单的例子开始：

```typescript
import { createCache } from '@ldesign/cache'

// 创建缓存实例
const cache = createCache()

// 设置缓存
await cache.set('greeting', 'Hello, World!')

// 获取缓存
const greeting = await cache.get('greeting')
console.log(greeting) // "Hello, World!"
```

## 配置缓存管理器

```typescript
import { createCache } from '@ldesign/cache'

const cache = createCache({
  // 默认存储引擎
  defaultEngine: 'localStorage',

  // 默认过期时间（24小时）
  defaultTTL: 24 * 60 * 60 * 1000,

  // 键前缀
  keyPrefix: 'myapp_',

  // 启用调试模式
  debug: true,

  // 安全配置
  security: {
    encryption: {
      enabled: true,
      secretKey: 'your-secret-key',
    },
    obfuscation: {
      enabled: true,
      prefix: 'obf_',
    },
  },
})
```

## 基础操作

### 设置缓存

```typescript
// 简单值
await cache.set('username', '张三')

// 复杂对象
await cache.set('user', {
  id: 1,
  name: '张三',
  email: 'zhangsan@example.com',
  preferences: {
    theme: 'dark',
    language: 'zh-CN',
  },
})

// 带过期时间
await cache.set('session', 'abc123', {
  ttl: 30 * 60 * 1000, // 30分钟后过期
})

// 指定存储引擎
await cache.set('large-data', bigDataArray, {
  engine: 'indexedDB',
})
```

### 获取缓存

```typescript
// 获取字符串
const username = await cache.get('username')

// 获取对象（带类型）
interface User {
  id: number
  name: string
  email: string
}

const user = await cache.get<User>('user')
if (user) {
  console.log(`用户: ${user.name}`)
}

// 检查是否存在
if (await cache.has('session')) {
  console.log('用户已登录')
}
```

### 删除和清理

```typescript
// 删除单个项
await cache.remove('session')

// 清空所有缓存
await cache.clear()

// 清空特定引擎的缓存
await cache.clear('localStorage')

// 清理过期项
await cache.cleanup()
```

## Vue 3 集成

如果你在使用 Vue 3，可以使用我们提供的组合式函数：

```vue
<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">错误: {{ error.message }}</div>
    <div v-else>
      <h2>用户信息</h2>
      <p>姓名: {{ userInfo?.name }}</p>
      <p>邮箱: {{ userInfo?.email }}</p>

      <button @click="updateUser">更新用户</button>
      <button @click="clearCache">清空缓存</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCache } from '@ldesign/cache/vue'

interface UserInfo {
  name: string
  email: string
}

// 使用缓存
const { set, get, clear, loading, error } = useCache({
  defaultEngine: 'localStorage',
  keyPrefix: 'app_',
})

const userInfo = ref<UserInfo | null>(null)

// 加载用户信息
onMounted(async () => {
  userInfo.value = await get<UserInfo>('user-info')
})

// 更新用户信息
const updateUser = async () => {
  const newUserInfo: UserInfo = {
    name: '李四',
    email: 'lisi@example.com',
  }

  await set('user-info', newUserInfo)
  userInfo.value = newUserInfo
}

// 清空缓存
const clearCache = async () => {
  await clear()
  userInfo.value = null
}
</script>
```

## 智能存储策略

启用智能策略后，缓存管理器会根据数据特征自动选择最适合的存储引擎：

```typescript
const cache = createCache({
  strategy: {
    enabled: true,
    sizeThresholds: {
      small: 1024, // 1KB 以下
      medium: 64 * 1024, // 64KB 以下
      large: 1024 * 1024, // 1MB 以上
    },
    ttlThresholds: {
      short: 5 * 60 * 1000, // 5分钟以下
      medium: 24 * 60 * 60 * 1000, // 24小时以下
      long: 7 * 24 * 60 * 60 * 1000, // 7天以上
    },
  },
})

// 小数据，长期存储 → localStorage
await cache.set('config', { theme: 'dark' })

// 大数据，长期存储 → IndexedDB
await cache.set('dataset', largeArray)

// 小数据，短期存储 → Memory
await cache.set('temp', data, { ttl: 1000 })

// 中等数据，会话存储 → sessionStorage
await cache.set('form-data', formObject, { ttl: 30 * 60 * 1000 })
```

## 下一步

现在你已经掌握了基础用法，可以继续学习：

- [存储引擎详解](./storage-engines) - 了解各种存储引擎的特点
- [安全特性](./security) - 学习如何保护敏感数据
- [Vue 集成](./vue-integration) - 深入了解 Vue 3 集成功能
- [命名空间](./namespaces) - 通过命名空间组织与分区管理缓存
- [批量操作](../api/batch) - 高效处理大体量读写
- [缓存预热](../api/warmup) - 冷启动加速与批量导入
- [跨标签页同步](../api/sync) - 多页面一致性保障
- [示例：命名空间](../examples/namespaces) · [示例：命名空间迁移](../examples/namespace-migration)
- [API 参考](../api/cache-manager) - 查看完整的 API 文档
