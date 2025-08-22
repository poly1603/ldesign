# 迁移指南

本指南帮助你从其他状态管理库迁移到 @ldesign/store，或者在 @ldesign/store 版本之间进行升级。

## 从 Pinia 迁移

### 基础 Store 迁移

**Pinia 代码：**

```typescript
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    name: 'Counter',
  }),

  actions: {
    increment() {
      this.count++
    },

    async fetchData() {
      const response = await api.getData()
      this.data = response
    },
  },

  getters: {
    doubleCount: state => state.count * 2,
    displayText: state => `${state.name}: ${state.count}`,
  },
})
```

**@ldesign/store 代码：**

```typescript
import { Action, AsyncAction, BaseStore, Getter, State } from '@ldesign/store'

export class CounterStore extends BaseStore {
  @State({ default: 0 })
  count: number = 0

  @State({ default: 'Counter' })
  name: string = 'Counter'

  @Action()
  increment() {
    this.count++
  }

  @AsyncAction()
  async fetchData() {
    const response = await api.getData()
    this.data = response
  }

  @Getter()
  get doubleCount() {
    return this.count * 2
  }

  @Getter()
  get displayText() {
    return `${this.name}: ${this.count}`
  }
}

// 使用
const counterStore = new CounterStore('counter')
```

### 组合式 API 迁移

**Pinia 组合式 API：**

```typescript
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const name = ref('Counter')

  function increment() {
    count.value++
  }

  const doubleCount = computed(() => count.value * 2)

  return { count, name, increment, doubleCount }
})
```

**@ldesign/store Hook 方式：**

```typescript
import { createStore } from '@ldesign/store'
import { computed, ref } from 'vue'

export const useCounter = createStore('counter', () => {
  const count = ref(0)
  const name = ref('Counter')

  const increment = () => count.value++

  const doubleCount = computed(() => count.value * 2)

  return {
    state: { count, name },
    actions: { increment },
    getters: { doubleCount },
  }
})
```

## 从 Vuex 迁移

### 模块化 Store 迁移

**Vuex 代码：**

```typescript
const userModule = {
  namespaced: true,
  state: {
    currentUser: null,
    loading: false,
  },

  mutations: {
    SET_USER(state, user) {
      state.currentUser = user
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
  },

  actions: {
    async login({ commit }, credentials) {
      commit('SET_LOADING', true)
      try {
        const user = await authApi.login(credentials)
        commit('SET_USER', user)
      } finally {
        commit('SET_LOADING', false)
      }
    },
  },

  getters: {
    isLoggedIn: state => state.currentUser !== null,
    userName: state => state.currentUser?.name || 'Guest',
  },
}
```

**@ldesign/store 代码：**

```typescript
import { AsyncAction, BaseStore, Getter, State } from '@ldesign/store'

export class UserStore extends BaseStore {
  @State({ default: null })
  currentUser: User | null = null

  @State({ default: false })
  loading: boolean = false

  @AsyncAction()
  async login(credentials: LoginCredentials) {
    // loading 状态自动管理
    const user = await authApi.login(credentials)
    this.currentUser = user
  }

  @Getter()
  get isLoggedIn() {
    return this.currentUser !== null
  }

  @Getter()
  get userName() {
    return this.currentUser?.name || 'Guest'
  }
}
```

### 组件使用迁移

**Vuex 组件：**

```vue
<script>
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  computed: {
    ...mapState('user', ['loading']),
    ...mapGetters('user', ['userName']),
  },

  methods: {
    ...mapActions('user', ['login']),
  },
}
</script>

<template>
  <div>
    <p>{{ userName }}</p>
    <button :disabled="loading" @click="login">
      {{ loading ? '登录中...' : '登录' }}
    </button>
  </div>
</template>
```

**@ldesign/store 组件：**

```vue
<script setup lang="ts">
import { UserStore } from '@/stores/user'

const userStore = new UserStore('user')

async function handleLogin() {
  await userStore.login({ email: 'user@example.com', password: 'password' })
}
</script>

<template>
  <div>
    <p>{{ userStore.userName }}</p>
    <button :disabled="userStore.loading" @click="handleLogin">
      {{ userStore.loading ? '登录中...' : '登录' }}
    </button>
  </div>
</template>
```

## 从 Redux 迁移

### Action 和 Reducer 迁移

**Redux 代码：**

```typescript
// Actions
const INCREMENT = 'INCREMENT'
const DECREMENT = 'DECREMENT'
const SET_LOADING = 'SET_LOADING'

const increment = () => ({ type: INCREMENT })
const decrement = () => ({ type: DECREMENT })
const setLoading = loading => ({ type: SET_LOADING, payload: loading })

// Reducer
function counterReducer(state = { count: 0, loading: false }, action) {
  switch (action.type) {
    case INCREMENT:
      return { ...state, count: state.count + 1 }
    case DECREMENT:
      return { ...state, count: state.count - 1 }
    case SET_LOADING:
      return { ...state, loading: action.payload }
    default:
      return state
  }
}

// Async actions (with redux-thunk)
function fetchData() {
  return async dispatch => {
    dispatch(setLoading(true))
    try {
      const data = await api.getData()
      dispatch({ type: 'SET_DATA', payload: data })
    } finally {
      dispatch(setLoading(false))
    }
  }
}
```

**@ldesign/store 代码：**

```typescript
import { Action, AsyncAction, BaseStore, State } from '@ldesign/store'

export class CounterStore extends BaseStore {
  @State({ default: 0 })
  count: number = 0

  @State({ default: false })
  loading: boolean = false

  @State({ default: null })
  data: any = null

  @Action()
  increment() {
    this.count++
  }

  @Action()
  decrement() {
    this.count--
  }

  @AsyncAction()
  async fetchData() {
    // loading 状态自动管理
    const response = await api.getData()
    this.data = response
  }
}
```

## 版本升级指南

### 从 v1.x 升级到 v2.x

#### 1. 装饰器语法变化

**v1.x：**

```typescript
class UserStore extends BaseStore {
  @state({ default: null })
  user: User | null = null

  @action
  setUser(user: User) {
    this.user = user
  }

  @getter
  get isLoggedIn() {
    return this.user !== null
  }
}
```

**v2.x：**

```typescript
class UserStore extends BaseStore {
  @State({ default: null }) // 首字母大写
  user: User | null = null

  @Action() // 需要括号
  setUser(user: User) {
    this.user = user
  }

  @Getter() // 需要括号
  get isLoggedIn() {
    return this.user !== null
  }
}
```

#### 2. 持久化配置变化

**v1.x：**

```typescript
class SettingsStore extends BaseStore {
  @state({ default: 'light', persist: true })
  theme: string = 'light'
}
```

**v2.x：**

```typescript
class SettingsStore extends BaseStore {
  @PersistentState({ default: 'light' }) // 使用专门的装饰器
  theme: string = 'light'
}
```

#### 3. Hook API 变化

**v1.x：**

```typescript
export const useCounter = defineStore('counter', () => {
  const count = ref(0)
  const increment = () => count.value++

  return { count, increment }
})
```

**v2.x：**

```typescript
export const useCounter = createStore('counter', () => {
  const count = ref(0)
  const increment = () => count.value++

  return {
    state: { count },
    actions: { increment },
    getters: {},
  }
})
```

### 自动迁移工具

我们提供了自动迁移工具来帮助升级：

```bash
# 安装迁移工具
npm install -g @ldesign/store-migrate

# 迁移 Pinia 项目
ldesign-migrate pinia ./src/stores

# 迁移 Vuex 项目
ldesign-migrate vuex ./src/store

# 升级 @ldesign/store 版本
ldesign-migrate upgrade ./src/stores
```

### 手动迁移步骤

#### 1. 更新依赖

```bash
# 卸载旧的状态管理库
npm uninstall pinia vuex

# 安装 @ldesign/store
npm install @ldesign/store reflect-metadata
```

#### 2. 更新 TypeScript 配置

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "useDefineForClassFields": false
  }
}
```

#### 3. 更新应用入口

```typescript
import { createPinia } from 'pinia' // 仍然需要 Pinia 作为底层
import { createApp } from 'vue'
import App from './App.vue'
// main.ts
import 'reflect-metadata' // 添加这行

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
```

#### 4. 迁移 Store 文件

创建迁移脚本来批量转换：

```typescript
// migrate.js
const fs = require('node:fs')
const path = require('node:path')

function migratePiniaStore(content) {
  // 替换 defineStore 为类定义
  content = content.replace(
    /export const (\w+) = defineStore\('(\w+)', \{/g,
    'export class $1 extends BaseStore {'
  )

  // 替换 state 定义
  content = content.replace(/state: \(\) => \(\{([\s\S]*?)\}\),/g, (match, stateContent) => {
    return stateContent.replace(/(\w+): (.+)/g, '@State({ default: $2 })\n  $1: any = $2')
  })

  // 替换 actions
  content = content.replace(/actions: \{([\s\S]*?)\},/g, (match, actionsContent) => {
    return actionsContent.replace(/(\w+)\((.*?)\) \{/g, '@Action()\n  $1($2) {')
  })

  return content
}

// 使用脚本迁移文件
const storeFiles = fs.readdirSync('./src/stores')
storeFiles.forEach(file => {
  if (file.endsWith('.ts')) {
    const content = fs.readFileSync(`./src/stores/${file}`, 'utf8')
    const migrated = migratePiniaStore(content)
    fs.writeFileSync(`./src/stores/${file}`, migrated)
  }
})
```

## 迁移检查清单

### 功能对比

| 功能         | Pinia | Vuex | @ldesign/store |
| ------------ | ----- | ---- | -------------- |
| 类型安全     | ✅    | ❌   | ✅             |
| 装饰器支持   | ❌    | ❌   | ✅             |
| 自动持久化   | 插件  | 插件 | ✅             |
| 性能优化     | 手动  | 手动 | ✅             |
| 多种使用方式 | ❌    | ❌   | ✅             |
| 开发工具     | ✅    | ✅   | ✅             |

### 迁移验证

创建测试来验证迁移结果：

```typescript
// tests/migration.test.ts
import { describe, expect, it } from 'vitest'
import { CounterStore } from '@/stores/counter'

describe('Migration Verification', () => {
  it('should maintain same functionality after migration', () => {
    const store = new CounterStore('counter')

    // 验证初始状态
    expect(store.count).toBe(0)

    // 验证 actions
    store.increment()
    expect(store.count).toBe(1)

    // 验证 getters
    expect(store.doubleCount).toBe(2)
  })

  it('should preserve data after migration', () => {
    // 如果有持久化数据，验证迁移后数据完整性
    const store = new CounterStore('counter')
    // 验证持久化数据是否正确加载
  })
})
```

## 常见问题

### Q: 迁移后性能如何？

A: @ldesign/store 基于 Pinia，性能相当。装饰器和额外功能带来的开销很小，而内置的缓存和优化功能通常能
提升整体性能。

### Q: 可以渐进式迁移吗？

A: 是的，@ldesign/store 与 Pinia 兼容，你可以在同一个项目中同时使用两者，逐步迁移。

### Q: 迁移工具支持哪些场景？

A: 迁移工具支持：

- Pinia defineStore 语法
- Vuex 模块语法
- 基础的 Redux 模式
- @ldesign/store 版本升级

### Q: 如何处理复杂的迁移场景？

A: 对于复杂场景，建议：

1. 先使用自动迁移工具处理基础部分
2. 手动调整复杂逻辑
3. 编写测试验证功能完整性
4. 逐步重构以利用新功能

## 获取帮助

如果在迁移过程中遇到问题：

1. 查看 [API 文档](/api/) 了解详细用法
2. 参考 [示例](/examples/) 查看最佳实践
3. 在 [GitHub Issues](https://github.com/ldesign/store/issues) 提问
4. 加入社区讨论群获取帮助

## 下一步

迁移完成后，建议：

1. 学习 [@ldesign/store 特有功能](/guide/decorators)
2. 优化性能使用 [缓存和优化功能](/guide/performance)
3. 采用 [最佳实践](/guide/best-practices) 重构代码
4. 探索 [高级功能](/guide/advanced) 提升开发效率
