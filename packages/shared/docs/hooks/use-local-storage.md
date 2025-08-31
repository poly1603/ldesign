# useLocalStorage

本地存储 Hook，提供响应式的本地存储功能，支持自动序列化、类型安全、SSR 兼容等特性。

## 概述

`useLocalStorage` 是一个强大的本地存储 Hook，提供以下核心功能：
- **响应式存储**：与 Vue 3 响应式系统完美集成
- **自动序列化**：支持对象、数组等复杂数据类型
- **类型安全**：完整的 TypeScript 类型支持
- **SSR 兼容**：服务端渲染环境下的安全处理
- **错误处理**：存储失败时的降级处理
- **自定义序列化器**：支持自定义数据序列化方式

## 安装和导入

```typescript
import { useLocalStorage } from '@ldesign/shared'
```

## API 参考

### 基础用法

**函数签名**
```typescript
interface StorageOptions<T> {
  defaultValue?: T
  serializer?: {
    read: (value: string) => T
    write: (value: T) => string
  }
  onError?: (error: Error) => void
  syncAcrossTabs?: boolean
}

function useLocalStorage<T>(
  key: string,
  defaultValue?: T,
  options?: StorageOptions<T>
): [Ref<T>, (value: T | ((prev: T) => T)) => void, () => void]
```

**参数说明**

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| key | string | ✓ | - | 存储键名 |
| defaultValue | T | ✗ | undefined | 默认值 |
| options | StorageOptions\<T\> | ✗ | {} | 配置选项 |

**选项说明**

| 选项 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| defaultValue | T | ✗ | undefined | 默认值（优先级低于参数） |
| serializer | object | ✗ | JSON | 自定义序列化器 |
| onError | Function | ✗ | console.error | 错误处理函数 |
| syncAcrossTabs | boolean | ✗ | true | 是否跨标签页同步 |

**返回值**

返回一个包含三个元素的数组：
- `[0]` - `Ref<T>` - 响应式存储值
- `[1]` - `(value: T | ((prev: T) => T)) => void` - 设置值的函数
- `[2]` - `() => void` - 移除存储的函数

## 使用示例

### 基础字符串存储

```vue
<template>
  <div>
    <h3>用户偏好设置</h3>
    
    <div class="setting-item">
      <label>用户名:</label>
      <input v-model="username" placeholder="请输入用户名" />
      <p>当前值: {{ username }}</p>
    </div>
    
    <div class="setting-item">
      <label>主题:</label>
      <select v-model="theme">
        <option value="light">浅色</option>
        <option value="dark">深色</option>
        <option value="auto">自动</option>
      </select>
      <p>当前主题: {{ theme }}</p>
    </div>
    
    <button @click="clearUsername">清除用户名</button>
    <button @click="clearTheme">重置主题</button>
  </div>
</template>

<script setup lang="ts">
import { useLocalStorage } from '@ldesign/shared'

// 基础字符串存储
const [username, setUsername, clearUsername] = useLocalStorage('username', '')

// 带默认值的存储
const [theme, setTheme, clearTheme] = useLocalStorage('theme', 'light')

// 响应式绑定
// username 和 theme 可以直接用于 v-model
</script>
```

### 对象和数组存储

```vue
<template>
  <div>
    <h3>用户配置</h3>
    
    <div class="config-section">
      <h4>个人信息</h4>
      <input v-model="userProfile.name" placeholder="姓名" />
      <input v-model="userProfile.email" placeholder="邮箱" />
      <input 
        v-model.number="userProfile.age" 
        type="number" 
        placeholder="年龄" 
      />
    </div>
    
    <div class="config-section">
      <h4>兴趣爱好</h4>
      <div v-for="(hobby, index) in hobbies" :key="index">
        <input v-model="hobbies[index]" />
        <button @click="removeHobby(index)">删除</button>
      </div>
      <button @click="addHobby">添加兴趣</button>
    </div>
    
    <div class="config-section">
      <h4>应用设置</h4>
      <label>
        <input 
          v-model="appSettings.notifications" 
          type="checkbox" 
        />
        启用通知
      </label>
      <label>
        <input 
          v-model="appSettings.autoSave" 
          type="checkbox" 
        />
        自动保存
      </label>
      <label>
        语言:
        <select v-model="appSettings.language">
          <option value="zh-CN">中文</option>
          <option value="en-US">English</option>
        </select>
      </label>
    </div>
    
    <button @click="resetProfile">重置个人信息</button>
    <button @click="resetSettings">重置应用设置</button>
  </div>
</template>

<script setup lang="ts">
import { useLocalStorage } from '@ldesign/shared'

// 对象存储
interface UserProfile {
  name: string
  email: string
  age: number
}

const [userProfile, setUserProfile, clearProfile] = useLocalStorage<UserProfile>(
  'user-profile',
  {
    name: '',
    email: '',
    age: 0
  }
)

// 数组存储
const [hobbies, setHobbies] = useLocalStorage<string[]>('hobbies', [])

// 复杂对象存储
interface AppSettings {
  notifications: boolean
  autoSave: boolean
  language: string
}

const [appSettings, setAppSettings, clearSettings] = useLocalStorage<AppSettings>(
  'app-settings',
  {
    notifications: true,
    autoSave: false,
    language: 'zh-CN'
  }
)

// 数组操作方法
const addHobby = () => {
  setHobbies([...hobbies.value, ''])
}

const removeHobby = (index: number) => {
  setHobbies(hobbies.value.filter((_, i) => i !== index))
}

// 重置方法
const resetProfile = () => {
  setUserProfile({
    name: '',
    email: '',
    age: 0
  })
}

const resetSettings = () => {
  clearSettings()
}
</script>
```

### 自定义序列化器

```vue
<script setup lang="ts">
import { useLocalStorage } from '@ldesign/shared'

// 日期对象存储
const [lastLoginDate, setLastLoginDate] = useLocalStorage(
  'last-login',
  new Date(),
  {
    serializer: {
      read: (value: string) => new Date(value),
      write: (value: Date) => value.toISOString()
    }
  }
)

// Map 对象存储
const [userPreferences, setUserPreferences] = useLocalStorage(
  'user-preferences',
  new Map<string, any>(),
  {
    serializer: {
      read: (value: string) => new Map(JSON.parse(value)),
      write: (value: Map<string, any>) => JSON.stringify([...value])
    }
  }
)

// Set 对象存储
const [favoriteIds, setFavoriteIds] = useLocalStorage(
  'favorite-ids',
  new Set<number>(),
  {
    serializer: {
      read: (value: string) => new Set(JSON.parse(value)),
      write: (value: Set<number>) => JSON.stringify([...value])
    }
  }
)

// 使用示例
const updateLastLogin = () => {
  setLastLoginDate(new Date())
}

const addPreference = (key: string, value: any) => {
  const newMap = new Map(userPreferences.value)
  newMap.set(key, value)
  setUserPreferences(newMap)
}

const addFavorite = (id: number) => {
  const newSet = new Set(favoriteIds.value)
  newSet.add(id)
  setFavoriteIds(newSet)
}
</script>
```

### 错误处理和降级

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useLocalStorage } from '@ldesign/shared'

// 错误状态
const storageError = ref<string | null>(null)

// 带错误处理的存储
const [userData, setUserData] = useLocalStorage(
  'user-data',
  { name: '', settings: {} },
  {
    onError: (error) => {
      console.error('存储错误:', error)
      storageError.value = error.message
      
      // 可以在这里实现降级策略
      // 比如使用内存存储或显示错误提示
    }
  }
)

// 检查存储可用性
const checkStorageAvailability = () => {
  try {
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

const isStorageAvailable = ref(checkStorageAvailability())

// 降级处理
const fallbackData = ref({ name: '', settings: {} })

const safeUserData = computed(() => {
  return isStorageAvailable.value ? userData.value : fallbackData.value
})

const safeSetter = (data: any) => {
  if (isStorageAvailable.value) {
    setUserData(data)
  } else {
    fallbackData.value = data
  }
}
</script>
```

### 跨标签页同步

```vue
<template>
  <div>
    <h3>跨标签页同步示例</h3>
    <p>在多个标签页中打开此页面，修改计数器值会自动同步</p>
    
    <div class="counter">
      <button @click="decrement">-</button>
      <span>{{ counter }}</span>
      <button @click="increment">+</button>
    </div>
    
    <div class="sync-status">
      <p>同步状态: {{ syncEnabled ? '已启用' : '已禁用' }}</p>
      <button @click="toggleSync">
        {{ syncEnabled ? '禁用' : '启用' }}同步
      </button>
    </div>
    
    <div class="shared-notes">
      <h4>共享笔记</h4>
      <textarea 
        v-model="sharedNotes" 
        placeholder="在这里输入笔记，会在所有标签页中同步"
        rows="4"
        cols="50"
      ></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLocalStorage } from '@ldesign/shared'

// 启用跨标签页同步的计数器
const [counter, setCounter] = useLocalStorage('sync-counter', 0, {
  syncAcrossTabs: true
})

// 共享笔记
const [sharedNotes, setSharedNotes] = useLocalStorage('shared-notes', '', {
  syncAcrossTabs: true
})

// 同步控制
const syncEnabled = ref(true)

const increment = () => {
  setCounter(counter.value + 1)
}

const decrement = () => {
  setCounter(counter.value - 1)
}

const toggleSync = () => {
  syncEnabled.value = !syncEnabled.value
  // 注意：这里只是演示，实际的同步控制需要重新创建 useLocalStorage
}

// 监听存储变化事件
onMounted(() => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'sync-counter' || e.key === 'shared-notes') {
      console.log('检测到其他标签页的存储变化:', e.key, e.newValue)
    }
  }
  
  window.addEventListener('storage', handleStorageChange)
  
  onUnmounted(() => {
    window.removeEventListener('storage', handleStorageChange)
  })
})
</script>
```

### 函数式更新

```vue
<script setup lang="ts">
import { useLocalStorage } from '@ldesign/shared'

interface TodoItem {
  id: number
  text: string
  completed: boolean
}

const [todos, setTodos] = useLocalStorage<TodoItem[]>('todos', [])

// 添加待办事项
const addTodo = (text: string) => {
  setTodos(prevTodos => [
    ...prevTodos,
    {
      id: Date.now(),
      text,
      completed: false
    }
  ])
}

// 切换完成状态
const toggleTodo = (id: number) => {
  setTodos(prevTodos =>
    prevTodos.map(todo =>
      todo.id === id
        ? { ...todo, completed: !todo.completed }
        : todo
    )
  )
}

// 删除待办事项
const removeTodo = (id: number) => {
  setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id))
}

// 批量操作
const markAllCompleted = () => {
  setTodos(prevTodos =>
    prevTodos.map(todo => ({ ...todo, completed: true }))
  )
}

const clearCompleted = () => {
  setTodos(prevTodos => prevTodos.filter(todo => !todo.completed))
}
</script>
```

## 高级特性

### SSR 兼容性

```typescript
// 服务端渲染环境下的安全处理
const [theme, setTheme] = useLocalStorage('theme', 'light')

// 在 SSR 环境下，初始值会是默认值
// 在客户端激活后，会自动从 localStorage 读取实际值

onMounted(() => {
  // 确保客户端激活后的逻辑
  console.log('客户端主题:', theme.value)
})
```

### 存储配额管理

```typescript
const checkStorageQuota = () => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    navigator.storage.estimate().then(estimate => {
      const used = estimate.usage || 0
      const quota = estimate.quota || 0
      const percentage = (used / quota) * 100
      
      console.log(`存储使用情况: ${percentage.toFixed(2)}%`)
      
      if (percentage > 80) {
        console.warn('存储空间不足，建议清理数据')
      }
    })
  }
}
```

## 注意事项

### 存储限制
- localStorage 通常有 5-10MB 的存储限制
- 超出限制时会抛出 QuotaExceededError
- 建议对大数据进行压缩或分片存储

### 性能考虑
- 避免存储过大的对象
- 频繁更新时考虑使用防抖
- 复杂对象的序列化可能影响性能

### 安全性
- 不要存储敏感信息（密码、令牌等）
- localStorage 数据可被同域脚本访问
- 考虑数据加密存储

### 浏览器兼容性
- 现代浏览器都支持 localStorage
- 隐私模式下可能禁用存储
- 提供降级方案

## 相关功能

- [useSessionStorage](/hooks/use-session-storage) - 会话存储 Hook
- [useAsyncData](/hooks/use-async-data) - 异步数据管理
- [通用工具](/utils/general) - 其他工具函数
