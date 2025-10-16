# Vue 3 集成指南

本指南详细介绍如何在 Vue 3 项目中使用 @ldesign/engine 的各种组合式函数。

## 🚀 快速开始

### 安装和配置

```typescript
import { createEngine } from '@ldesign/engine'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 创建引擎实例
const engine = createEngine({
  debug: true,
  performance: { enabled: true }
})

// 挂载引擎
await engine.mount(app)

app.mount('#app')
```

## 📊 核心组合式函数

### useEngine - 引擎核心访问

```vue
<script setup lang="ts">
import { useEngine } from '@ldesign/engine'

const { config, events, state, cache, plugins } = useEngine()

// 访问配置
console.log(config.get('appName'))

// 发送事件
events.emit('user-action', { action: 'click' })

// 访问全局状态
const userState = state.get('user')
</script>
```

### useEngineState - 全局状态管理

```vue
<script setup lang="ts">
import { useEngineState } from '@ldesign/engine'

const { state, setState, getState, subscribe } = useEngineState()

// 设置状态
setState('user', { name: 'John', age: 30 })

// 获取状态
const user = getState('user')

// 监听状态变化
subscribe('user', (newValue, oldValue) => {
  console.log('User changed:', newValue)
})
</script>
```

### useAsync - 异步操作管理

```vue
<script setup lang="ts">
import { useAsync } from '@ldesign/engine'

interface ApiData {
  title: string
  content: string
}

const { 
  data, 
  loading, 
  error, 
  execute: refresh 
} = useAsync<ApiData>(
  async () => {
    const response = await fetch('/api/data')
    if (!response.ok) throw new Error('请求失败')
    return response.json()
  },
  { 
    immediate: true,
    retry: 3,
    retryDelay: 1000
  }
)
</script>

<template>
  <div>
    <div v-if="loading">
      加载中...
    </div>
    <div v-else-if="error">
      错误: {{ error.message }}
    </div>
    <div v-else>
      <h1>{{ data?.title }}</h1>
      <p>{{ data?.content }}</p>
    </div>
    <button @click="refresh">
      刷新
    </button>
  </div>
</template>
```

### useForm - 表单管理

```vue
<script setup lang="ts">
import { useForm } from '@ldesign/engine'

const {
  values,
  errors,
  isValid,
  submitting,
  validateField,
  validate,
  reset,
  submit
} = useForm(
  {
    username: '',
    email: ''
  },
  {
    username: [
      { required: true, message: '用户名必填' },
      { minLength: 3, message: '用户名至少3个字符' }
    ],
    email: [
      { required: true, message: '邮箱必填' },
      { type: 'email', message: '邮箱格式错误' }
    ]
  }
)

const handleSubmit = async () => {
  const isValid = await validate()
  if (isValid) {
    await submit(async (data) => {
      // 提交逻辑
      await fetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify(data)
      })
    })
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <label>用户名:</label>
      <input 
        v-model="values.username" 
        :class="{ error: errors.username }"
        @blur="validateField('username')"
      >
      <span v-if="errors.username" class="error">{{ errors.username }}</span>
    </div>
    
    <div>
      <label>邮箱:</label>
      <input 
        v-model="values.email" 
        type="email"
        :class="{ error: errors.email }"
        @blur="validateField('email')"
      >
      <span v-if="errors.email" class="error">{{ errors.email }}</span>
    </div>
    
    <button type="submit" :disabled="!isValid || submitting">
      {{ submitting ? '提交中...' : '提交' }}
    </button>
  </form>
</template>
```

### usePerformance - 性能监控

```vue
<script setup lang="ts">
import { usePerformance } from '@ldesign/engine'

const { 
  startMeasure, 
  endMeasure, 
  metrics, 
  getReport 
} = usePerformance()

// 监控组件渲染性能
onMounted(() => {
  startMeasure('component-mount')
  // 模拟一些初始化工作
  setTimeout(() => {
    endMeasure('component-mount')
  }, 100)
})

// 监控API调用性能
const fetchData = async () => {
  startMeasure('api-call')
  try {
    await fetch('/api/data')
  } finally {
    endMeasure('api-call')
  }
}

// 获取性能报告
const generateReport = () => {
  const report = getReport()
  console.log('性能报告:', report)
}
</script>
```

### useMemoryManager - 内存管理

```vue
<script setup lang="ts">
import { useMemoryManager } from '@ldesign/engine'

const { registerResource, cleanup, stats } = useMemoryManager()

onMounted(() => {
  // 注册定时器资源
  const timer = setInterval(() => {
    console.log('定时任务')
  }, 1000)
  
  registerResource(timer, (timer) => {
    clearInterval(timer)
    console.log('定时器已清理')
  })
  
  // 注册事件监听器
  const handleResize = () => console.log('窗口大小改变')
  window.addEventListener('resize', handleResize)
  
  registerResource(handleResize, () => {
    window.removeEventListener('resize', handleResize)
    console.log('事件监听器已清理')
  })
})

onUnmounted(() => {
  // 组件卸载时自动清理所有资源
  cleanup()
})

// 查看内存使用统计
watchEffect(() => {
  console.log('内存统计:', stats.value)
})
</script>
```

### useCache - 缓存管理

```vue
<script setup lang="ts">
import { useCache } from '@ldesign/engine'

const { get, set, has, remove, clear, stats } = useCache()

// 缓存数据
const cacheUserData = async (userId: string) => {
  const userData = await fetchUserData(userId)
  set(`user:${userId}`, userData, 300000) // 缓存5分钟
  return userData
}

// 获取缓存数据
const getUserData = async (userId: string) => {
  const cacheKey = `user:${userId}`
  
  if (has(cacheKey)) {
    return get(cacheKey)
  }
  
  return await cacheUserData(userId)
}

// 清理特定缓存
const clearUserCache = (userId: string) => {
  remove(`user:${userId}`)
}

// 查看缓存统计
watchEffect(() => {
  console.log('缓存统计:', stats.value)
})
</script>
```

## 🛠️ 工具函数

### 防抖和节流

```vue
<script setup lang="ts">
import { debounce, throttle } from '@ldesign/engine'

// 防抖搜索
const search = debounce(async (query: string) => {
  if (!query.trim()) return
  
  const results = await fetch(`/api/search?q=${query}`)
    .then(res => res.json())
  
  // 处理搜索结果
  console.log('搜索结果:', results)
}, 300)

// 节流滚动处理
const handleScroll = throttle(() => {
  console.log('滚动位置:', window.scrollY)
}, 100)

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
```

### 安全异步操作

```vue
<script setup lang="ts">
import { safeAsync } from '@ldesign/engine'

const handleRiskyOperation = async () => {
  const result = await safeAsync(async () => {
    // 可能失败的异步操作
    const response = await fetch('/api/risky-endpoint')
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return response.json()
  })
  
  if (result.success) {
    console.log('操作成功:', result.data)
  } else {
    console.error('操作失败:', result.error.message)
    // 优雅的错误处理
  }
}
</script>
```

## 🎯 最佳实践

### 1. 组件性能优化

```vue
<script setup lang="ts">
import { useComponentPerformance } from '@ldesign/engine'

// 自动监控组件性能
const { renderTime, updateCount } = useComponentPerformance('MyComponent')

// 监控渲染时间
watchEffect(() => {
  if (renderTime.value > 16) { // 超过一帧时间
    console.warn('组件渲染时间过长:', renderTime.value)
  }
})
</script>
```

### 2. 状态持久化

```vue
<script setup lang="ts">
import { usePersistentState } from '@ldesign/engine'

// 自动持久化到 localStorage
const { value: userSettings, setValue: setUserSettings } = usePersistentState(
  'user-settings',
  {
    theme: 'light',
    language: 'zh-CN',
    notifications: true
  }
)

// 状态变化时自动保存
const toggleTheme = () => {
  setUserSettings({
    ...userSettings.value,
    theme: userSettings.value.theme === 'light' ? 'dark' : 'light'
  })
}
</script>
```

### 3. 错误边界

```vue
<script setup lang="ts">
import { useErrorHandler } from '@ldesign/engine'

const { handleError, errors, clearErrors } = useErrorHandler()

// 全局错误处理
const riskyOperation = async () => {
  try {
    await someRiskyFunction()
  } catch (error) {
    handleError(error, {
      context: 'user-action',
      severity: 'high'
    })
  }
}

// 显示错误信息
watchEffect(() => {
  if (errors.value.length > 0) {
    // 显示错误提示
    console.log('当前错误:', errors.value)
  }
})
</script>
```

## 📚 更多资源

- [API 参考文档](../api/README.md)
- [性能优化指南](./performance-optimization.md)
- [最佳实践](./best-practices.md)
- [示例项目](../../examples/README.md)
