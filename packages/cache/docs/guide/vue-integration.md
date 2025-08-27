# Vue 3 集成

## 🎨 集成概述

@ldesign/cache 为 Vue 3 提供了深度集成支持，包括组合式函数、响应式缓存和全局状态管理。

## 🚀 快速开始

### 安装和配置

```typescript
import { CacheProvider } from '@ldesign/cache/vue'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 配置全局缓存
app.use(CacheProvider, {
  defaultEngine: 'localStorage',
  keyPrefix: 'myapp_',
  strategy: { enabled: true },
})

app.mount('#app')
```

### 基础使用

```vue
<template>
  <div>
    <input v-model="userName" placeholder="输入用户名" />
    <p>当前用户: {{ userName }}</p>
  </div>
</template>

<script setup>
import { useCache } from '@ldesign/cache/vue'

// 响应式缓存
const { value: userName } = useCache('user-name', {
  defaultValue: '',
  autoSave: true, // 自动保存到缓存
})
</script>
```

## 🎯 useCache 组合式函数

### 基础用法

```typescript
const {
  value, // 响应式缓存值
  loading, // 加载状态
  error, // 错误信息
  set, // 设置缓存
  get, // 获取缓存
  remove, // 删除缓存
  refresh, // 刷新缓存
} = useCache('cache-key', options)
```

### 配置选项

```typescript
interface UseCacheOptions {
  defaultValue?: any // 默认值
  autoSave?: boolean // 自动保存
  immediate?: boolean // 立即加载
  ttl?: number // 生存时间
  engine?: StorageEngine // 指定引擎
  serializer?: {
    // 自定义序列化
    serialize: (value: any) => string
    deserialize: (value: string) => any
  }
}
```

### 响应式缓存

```vue
<template>
  <div>
    <!-- 直接绑定缓存值 -->
    <input v-model="userConfig.theme" />
    <input v-model="userConfig.language" />

    <!-- 缓存状态显示 -->
    <div v-if="loading">加载中...</div>
    <div v-if="error">错误: {{ error.message }}</div>
  </div>
</template>

<script setup>
import { useCache } from '@ldesign/cache/vue'

// 响应式对象缓存
const {
  value: userConfig,
  loading,
  error,
} = useCache('user-config', {
  defaultValue: {
    theme: 'light',
    language: 'zh-CN',
  },
  autoSave: true,
  ttl: 7 * 24 * 60 * 60 * 1000, // 7天
})

// userConfig 的任何变化都会自动保存到缓存
</script>
```

### 手动操作

```vue
<script setup>
import { useCache } from '@ldesign/cache/vue'

const { value, set, get, remove, refresh } = useCache('user-data')

// 手动设置
const saveData = async () => {
  await set({
    name: '张三',
    age: 30,
  })
}

// 手动获取
const loadData = async () => {
  const data = await get()
  console.log('获取的数据:', data)
}

// 删除缓存
const clearData = async () => {
  await remove()
}

// 刷新缓存
const reloadData = async () => {
  await refresh()
}
</script>
```

## 📊 useCacheStats 性能监控

### 基础监控

```vue
<template>
  <div class="cache-stats">
    <div>总缓存项: {{ stats.totalItems }}</div>
    <div>总大小: {{ stats.totalSizeFormatted }}</div>
    <div>命中率: {{ stats.hitRatePercentage }}%</div>
  </div>
</template>

<script setup>
import { useCacheStats } from '@ldesign/cache/vue'

const {
  formattedStats: stats,
  refresh,
  startAutoRefresh,
  stopAutoRefresh,
} = useCacheStats({
  refreshInterval: 5000, // 每5秒刷新
})

// 开始自动刷新
onMounted(() => {
  startAutoRefresh()
})

// 停止自动刷新
onUnmounted(() => {
  stopAutoRefresh()
})
</script>
```

### 引擎使用情况

```vue
<template>
  <div class="engine-usage">
    <div v-for="engine in engineUsage" :key="engine.engine">
      <h4>{{ engine.engine }}</h4>
      <div>状态: {{ engine.available ? '可用' : '不可用' }}</div>
      <div>项目数: {{ engine.itemCount }}</div>
      <div>使用大小: {{ engine.sizeFormatted }}</div>
    </div>
  </div>
</template>

<script setup>
import { useCacheStats } from '@ldesign/cache/vue'

const { engineUsage } = useCacheStats()
</script>
```

## 🔄 CacheProvider 全局状态

### 提供者配置

```typescript
// main.ts
import { CacheProvider } from '@ldesign/cache/vue'

app.use(CacheProvider, {
  // 全局缓存配置
  defaultEngine: 'localStorage',
  keyPrefix: 'app_',
  strategy: { enabled: true },
  security: {
    encryption: { enabled: true },
    obfuscation: { enabled: true },
  },
})
```

### 注入使用

```vue
<script setup>
import { useCacheManager } from '@ldesign/cache/vue'

// 获取全局缓存管理器
const cacheManager = useCacheManager()

// 使用全局配置
const userData = await cacheManager.get('user-data')
</script>
```

## 🎭 高级用法

### 自定义序列化

```vue
<script setup>
import { useCache } from '@ldesign/cache/vue'

// 自定义序列化器
const { value } = useCache('complex-data', {
  serializer: {
    serialize: value => {
      // 自定义序列化逻辑
      return JSON.stringify(value, null, 2)
    },
    deserialize: value => {
      // 自定义反序列化逻辑
      return JSON.parse(value)
    },
  },
})
</script>
```

### 缓存同步

```vue
<script setup>
import { useCache } from '@ldesign/cache/vue'
import { watch } from 'vue'

const { value: sharedData } = useCache('shared-data', {
  syncAcrossTabs: true, // 跨标签页同步
})

// 监听其他标签页的变化
watch(sharedData, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    console.log('数据在其他标签页中被修改')
  }
})
</script>
```

### 条件缓存

```vue
<script setup>
import { useCache } from '@ldesign/cache/vue'
import { computed } from 'vue'

const { value, set } = useCache('conditional-cache')

// 条件性缓存
const shouldCache = computed(() => {
  // 根据某些条件决定是否缓存
  return user.value.isPremium
})

watch([data, shouldCache], ([newData, shouldCacheValue]) => {
  if (shouldCacheValue) {
    set(newData)
  }
})
</script>
```

## 🔧 TypeScript 支持

### 类型安全的缓存

```vue
<script setup lang="ts">
import { useCache } from '@ldesign/cache/vue'

interface UserProfile {
  id: number
  name: string
  email: string
  preferences: {
    theme: 'light' | 'dark'
    language: string
  }
}

// 类型安全的缓存
const { value: userProfile } = useCache<UserProfile>('user-profile', {
  defaultValue: {
    id: 0,
    name: '',
    email: '',
    preferences: {
      theme: 'light',
      language: 'zh-CN',
    },
  },
})

// TypeScript 会提供完整的类型检查和智能提示
userProfile.value.preferences.theme = 'dark' // ✅ 类型安全
userProfile.value.preferences.invalid = 'value' // ❌ 类型错误
</script>
```

### 泛型支持

```typescript
// 泛型缓存函数
function useTypedCache<T>(key: string, defaultValue: T) {
  return useCache<T>(key, { defaultValue })
}

// 使用
const { value: count } = useTypedCache('counter', 0) // number 类型
const { value: list } = useTypedCache('todo-list', []) // array 类型
const { value: config } = useTypedCache('config', {}) // object 类型
```

## 🎪 实际应用示例

### 用户偏好管理

```vue
<template>
  <div class="user-preferences">
    <h3>用户偏好设置</h3>

    <label>
      主题:
      <select v-model="preferences.theme">
        <option value="light">浅色</option>
        <option value="dark">深色</option>
      </select>
    </label>

    <label>
      语言:
      <select v-model="preferences.language">
        <option value="zh-CN">中文</option>
        <option value="en-US">English</option>
      </select>
    </label>

    <div v-if="loading">保存中...</div>
    <div v-if="error">保存失败: {{ error.message }}</div>
  </div>
</template>

<script setup>
import { useCache } from '@ldesign/cache/vue'

const {
  value: preferences,
  loading,
  error,
} = useCache('user-preferences', {
  defaultValue: {
    theme: 'light',
    language: 'zh-CN',
  },
  autoSave: true,
  ttl: 30 * 24 * 60 * 60 * 1000, // 30天
})
</script>
```

### 表单数据自动保存

```vue
<template>
  <form @submit="submitForm">
    <input v-model="formData.name" placeholder="姓名" />
    <input v-model="formData.email" placeholder="邮箱" />
    <textarea v-model="formData.message" placeholder="消息"></textarea>

    <button type="submit">提交</button>
    <button type="button" @click="clearDraft">清除草稿</button>

    <div v-if="draftSaved" class="draft-status">草稿已自动保存 {{ draftSaved }}</div>
  </form>
</template>

<script setup>
import { useCache } from '@ldesign/cache/vue'
import { watch, ref } from 'vue'

const { value: formData, remove: removeDraft } = useCache('form-draft', {
  defaultValue: {
    name: '',
    email: '',
    message: '',
  },
  autoSave: true,
})

const draftSaved = ref('')

// 监听表单变化，显示保存状态
watch(
  formData,
  () => {
    draftSaved.value = new Date().toLocaleTimeString()
  },
  { deep: true }
)

const submitForm = async () => {
  // 提交表单
  await submitToServer(formData.value)

  // 清除草稿
  await removeDraft()
}

const clearDraft = async () => {
  await removeDraft()
  // 重置表单
  Object.assign(formData.value, {
    name: '',
    email: '',
    message: '',
  })
}
</script>
```

## 🔗 相关文档

- [API 参考](/api/vue-integration.md) - Vue 集成 API
- [示例项目](/examples/) - 完整示例代码
- [最佳实践](./best-practices.md) - Vue 使用最佳实践
