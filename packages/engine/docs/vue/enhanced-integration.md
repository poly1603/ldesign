# Vue 3 增强集成指南

LDesign Engine 为 Vue 3 提供了全面的集成支持，包括丰富的组合式函数、类型安全的 API 和开发者友好的工具。

## 快速开始

### 1. 基础安装

```typescript
import { createVueEnginePlugin } from '@ldesign/engine'
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 使用增强的Vue插件
app.use(createVueEnginePlugin({
  config: {
    debug: true,
    app: { name: 'My App', version: '1.0.0' }
  },
  plugins: [
    // 引擎插件
  ]
}))

app.mount('#app')
```

### 2. 一键创建应用

```typescript
import { createAndMountApp } from '@ldesign/engine'
import App from './App.vue'

// 一键创建和挂载应用
const engine = await createAndMountApp(App, '#app', {
  config: {
    debug: true,
    app: { name: 'My App' }
  }
})

console.log('应用已启动:', engine.config.get('app.name'))
```

## 组合式函数

### 状态管理

```vue
<script setup>
import { useEngineState, usePersistentState, useStateHistory } from '@ldesign/engine'

// 基础状态管理
const [count, setCount] = useEngineState('counter', 0)

// 持久化状态
const [theme, setTheme] = usePersistentState('theme', 'light')

// 带历史记录的状态
const [content, history, { undo, redo, canUndo, canRedo }] = useStateHistory('editor', '')

function increment() {
  setCount(count.value + 1)
}

function toggleTheme() {
  setTheme(theme.value === 'light' ? 'dark' : 'light')
}
</script>

<template>
  <div>
    <p>计数: {{ count }}</p>
    <button @click="increment">
      +1
    </button>
    
    <p>主题: {{ theme }}</p>
    <button @click="toggleTheme">
      切换主题
    </button>
    
    <div>
      <button :disabled="!canUndo" @click="undo">
        撤销
      </button>
      <button :disabled="!canRedo" @click="redo">
        重做
      </button>
    </div>
  </div>
</template>
```

### 异步操作

```vue
<script setup>
import { useAsyncOperation, useDebouncedAsync, useRetry } from '@ldesign/engine'

// 基础异步操作
const { data: user, loading, error, execute: loadUser } = useAsyncOperation(
  async (id: string) => {
    const response = await fetch(`/api/users/${id}`)
    return response.json()
  }
)

// 带重试的异步操作
const { data: posts, execute: loadPosts, retryCount } = useRetry(
  async () => {
    const response = await fetch('/api/posts')
    if (!response.ok) throw new Error('Failed to fetch')
    return response.json()
  },
  3, // 最大重试3次
  1000 // 每次重试延迟1秒
)

// 防抖异步操作
const { data: searchResults, execute: search } = useDebouncedAsync(
  async (query: string) => {
    const response = await fetch(`/api/search?q=${query}`)
    return response.json()
  },
  300
)

function handleSearch(query: string) {
  if (query.trim()) {
    search(query)
  }
}
</script>

<template>
  <div>
    <div v-if="loading">
      加载中...
    </div>
    <div v-else-if="error">
      错误: {{ error.message }}
    </div>
    <div v-else-if="user">
      用户: {{ user.name }}
    </div>
    
    <input placeholder="搜索..." @input="handleSearch($event.target.value)">
    
    <div v-if="retryCount > 0">
      重试次数: {{ retryCount }}
    </div>
  </div>
</template>
```

### 表单处理

```vue
<script setup>
import { useForm } from '@ldesign/engine'

const { values, errors, touched, setFieldTouched, validate, handleSubmit, valid } = useForm({
  username: '',
  email: '',
  password: ''
}, {
  username: [
    { required: true, message: '用户名不能为空' },
    { min: 3, message: '用户名至少3个字符' }
  ],
  email: [
    { required: true, message: '邮箱不能为空' },
    { pattern: /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/, message: '邮箱格式不正确' }
  ],
  password: [
    { required: true, message: '密码不能为空' },
    { min: 6, message: '密码至少6个字符' }
  ]
})

const onSubmit = handleSubmit(async (values) => {
  console.log('提交数据:', values)
  // 提交逻辑
})
</script>

<template>
  <form @submit.prevent="onSubmit">
    <div>
      <input 
        v-model="values.username"
        placeholder="用户名"
        @blur="() => setFieldTouched('username', true)"
      >
      <span v-if="touched.username && errors.username" class="error">
        {{ errors.username }}
      </span>
    </div>
    
    <div>
      <input 
        v-model="values.email"
        placeholder="邮箱"
        @blur="() => setFieldTouched('email', true)"
      >
      <span v-if="touched.email && errors.email" class="error">
        {{ errors.email }}
      </span>
    </div>
    
    <div>
      <input 
        v-model="values.password"
        type="password"
        placeholder="密码"
        @blur="() => setFieldTouched('password', true)"
      >
      <span v-if="touched.password && errors.password" class="error">
        {{ errors.password }}
      </span>
    </div>
    
    <button type="submit" :disabled="!valid">
      提交
    </button>
  </form>
</template>
```

### UI 工具

```vue
<script setup>
import { 
  useClipboard, 
  useDialog, 
  useLocalStorage, 
  useNotifications 
} from '@ldesign/engine'

// 通知管理
const { success, error, warning, info } = useNotifications()

// 对话框管理
const { confirm, alert } = useDialog()

// 剪贴板操作
const { copy, copied } = useClipboard()

// 本地存储
const [settings, setSettings] = useLocalStorage('settings', { lang: 'zh' })

async function handleDelete() {
  const confirmed = await confirm('确定要删除吗？', {
    title: '确认删除',
    confirmText: '删除',
    cancelText: '取消'
  })
  
  if (confirmed) {
    success('删除成功！')
  }
}

function handleCopy() {
  copy('Hello, World!')
}

function showNotifications() {
  success('成功消息')
  error('错误消息')
  warning('警告消息')
  info('信息消息')
}
</script>

<template>
  <div>
    <button @click="handleDelete">
      删除
    </button>
    <button @click="handleCopy">
      {{ copied ? '已复制' : '复制文本' }}
    </button>
    <button @click="showNotifications">
      显示通知
    </button>
    
    <p>语言设置: {{ settings.lang }}</p>
    <button @click="setSettings({ ...settings, lang: settings.lang === 'zh' ? 'en' : 'zh' })">
      切换语言
    </button>
  </div>
</template>
```

### 性能监控

```vue
<script setup>
import { useComponentPerformance, useMemoryManager, usePerformance } from '@ldesign/engine'

// 全局性能监控
const { metrics, fps, memoryUsage, startMeasure, endMeasure } = usePerformance()

// 组件性能监控
const { renderTime, updateCount, trackUpdate } = useComponentPerformance('MyComponent')

// 内存管理
const { stats, registerResource, cleanup } = useMemoryManager()

function performHeavyTask() {
  startMeasure('heavy-task')
  
  // 执行重任务
  setTimeout(() => {
    endMeasure('heavy-task')
  }, 1000)
}

onMounted(() => {
  // 注册资源
  const resourceId = registerResource('my-resource', someResource)
  
  onUnmounted(() => {
    cleanup(resourceId)
  })
})
</script>

<template>
  <div>
    <div>FPS: {{ fps }}</div>
    <div>内存使用: {{ memoryUsage.used }}MB / {{ memoryUsage.total }}MB</div>
    <div>渲染时间: {{ renderTime }}ms</div>
    <div>更新次数: {{ updateCount }}</div>
    
    <button @click="performHeavyTask">
      执行重任务
    </button>
    <button @click="trackUpdate">
      跟踪更新
    </button>
  </div>
</template>
```

### 工具函数

```vue
<script setup>
import { 
  useArray, 
  useCounter, 
  useDebounce, 
  useRelativeTime, 
  useThrottle,
  useTimeFormat,
  useToggle
} from '@ldesign/engine'

// 防抖和节流
const searchQuery = ref('')
const debouncedQuery = useDebounce(searchQuery, 300)
const scrollY = ref(0)
const throttledScrollY = useThrottle(scrollY, 100)

// 计数器
const { count, increment, decrement, reset } = useCounter(0, { min: 0, max: 100 })

// 切换状态
const [isVisible, toggle, setVisible] = useToggle(false)

// 数组管理
const { array: items, push, remove, clear } = useArray([1, 2, 3])

// 时间格式化
const timestamp = ref(Date.now())
const formattedTime = useTimeFormat(timestamp, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})
const relativeTime = useRelativeTime(timestamp)

function addItem() {
  push(items.value.length + 1)
}
</script>

<template>
  <div>
    <input v-model="searchQuery" placeholder="搜索...">
    <p>防抖查询: {{ debouncedQuery }}</p>
    
    <div>
      <button @click="decrement">
        -
      </button>
      <span>{{ count }}</span>
      <button @click="increment">
        +
      </button>
      <button @click="reset">
        重置
      </button>
    </div>
    
    <button @click="toggle">
      {{ isVisible ? '隐藏' : '显示' }}
    </button>
    <div v-if="isVisible">
      内容
    </div>
    
    <div>
      <button @click="addItem">
        添加项目
      </button>
      <button @click="clear">
        清空
      </button>
      <ul>
        <li v-for="item in items" :key="item">
          {{ item }}
          <button @click="remove(item)">
            删除
          </button>
        </li>
      </ul>
    </div>
    
    <div>
      <p>格式化时间: {{ formattedTime }}</p>
      <p>相对时间: {{ relativeTime }}</p>
    </div>
  </div>
</template>
```

## TypeScript 支持

所有组合式函数都提供完整的 TypeScript 类型支持：

```typescript
import type { 
  UseAsyncReturn,
  UseEngineReturn,
  UseFormReturn,
  UsePerformanceReturn 
} from '@ldesign/engine'

// 类型安全的组合式函数
const engine: UseEngineReturn = useEngine()
const asyncOp: UseAsyncReturn<User, [string]> = useAsyncOperation(loadUser)
const form: UseFormReturn<LoginForm> = useForm(initialValues, rules)
```

## 开发工具集成

在开发环境下，引擎会自动集成到 Vue DevTools：

```typescript
import { setupDevtools } from '@ldesign/engine'

// 手动设置开发工具（通常自动完成）
setupDevtools(engine)
```

## 最佳实践

1. **使用 TypeScript** - 充分利用类型安全
2. **组合式函数** - 优先使用组合式函数而不是全局属性
3. **性能监控** - 在关键组件中启用性能监控
4. **内存管理** - 在组件卸载时清理资源
5. **错误处理** - 使用引擎的错误管理系统
6. **状态管理** - 使用引擎状态而不是本地状态（适当时）

这个增强的 Vue 集成提供了更好的开发体验、类型安全和性能优化，让您能够更轻松地构建高质量的 Vue 应用。
