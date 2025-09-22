/**
 * LDesign Store 高级使用示例
 * 展示所有新功能的实际使用方法
 */

import {
  // 简化API
  store,
  $,
  createAsyncStore,
  combineStores,

  // 响应式系统
  batchUpdate,
  reactiveOptimizer,

  // Bug修复
  CircularDependencyDetector,
  MemoryLeakGuard,
  AsyncRaceConditionHandler,
  EnhancedErrorHandler,

  // 高级功能
  createTimeTravelDebugger,
  createSnapshotManager,
  createMiddlewareSystem,
  MiddlewareSystem,
  createStateSynchronizer
} from '@ldesign/store'

// ============================================
// 1. 简化API使用示例
// ============================================

// 使用链式调用创建Store
const userStore = store('user')
  .useState('name', 'John Doe')
  .useState('age', 30)
  .useState('email', 'john@example.com')
  .useStates({
    preferences: {
      theme: 'dark',
      language: 'en'
    },
    permissions: ['read', 'write']
  })
  .useComputed('displayName', (state) => `${state.name} (${state.age})`)
  .useComputed('isAdmin', (state) => state.permissions.includes('admin'))
  .useAction('updateName', function (name: string) {
    this.name = name
  })
  .useAction('birthday', function () {
    this.age++
  })
  .useActions({
    async login(email: string, password: string) {
      // 模拟API调用
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })
      const data = await response.json()

      this.name = data.name
      this.email = data.email
      this.permissions = data.permissions
    },

    logout() {
      this.$reset()
    }
  })
  .usePersist({
    key: 'user-store',
    paths: ['name', 'preferences']
  })
  .build()

// 使用超短别名
const todoStore = $('todos')
  .useState('items', [] as Array<{ id: string; text: string; done: boolean }>)
  .useState('filter', 'all' as 'all' | 'active' | 'completed')
  .useComputed('activeCount', (state) =>
    state.items.filter(item => !item.done).length)
  .useComputed('filteredItems', (state) => {
    switch (state.filter) {
      case 'active':
        return state.items.filter(item => !item.done)
      case 'completed':
        return state.items.filter(item => item.done)
      default:
        return state.items
    }
  })
  .useAction('addTodo', function (text: string) {
    this.items.push({
      id: Date.now().toString(),
      text,
      done: false
    })
  })
  .useAction('toggleTodo', function (id: string) {
    const todo = this.items.find(item => item.id === id)
    if (todo) {
      todo.done = !todo.done
    }
  })
  .build()

// ============================================
// 2. 性能优化示例
// ============================================

// 批量更新
function updateMultipleStores() {
  batchUpdate(() => {
    userStore.state.name = 'Jane Doe'
    userStore.state.age = 25
    todoStore.state.items = []
    todoStore.state.filter = 'all'
  })
}

// 使用响应式优化器
const optimizer = reactiveOptimizer

// 创建优化的响应式状态
const optimizedState = optimizer.createOptimizedReactive({
  counter: 0,
  data: [],
  nested: {
    deep: {
      value: 'test'
    }
  }
})

// 创建虚拟代理（延迟加载）
const heavyDataStore = optimizer.createVirtualProxy(async () => {
  // 模拟加载大量数据
  const response = await fetch('/api/heavy-data')
  return response.json()
})

// 创建优化的计算属性
const expensiveComputed = optimizer.createComputed(
  () => {
    // 昂贵的计算
    return optimizedState.data.reduce((sum, item: any) => sum + item.value, 0)
  }
)

// ============================================
// 3. Bug修复和错误处理示例
// ============================================

// 循环依赖检测
CircularDependencyDetector.startTracking('store-a')
CircularDependencyDetector.startTracking('store-b')
// 如果store-b又依赖store-a，会抛出错误
CircularDependencyDetector.endTracking('store-b')
CircularDependencyDetector.endTracking('store-a')

// 内存泄漏防护
const scope = MemoryLeakGuard.createScope(userStore)
MemoryLeakGuard.runInScope(userStore, () => {
  // 在作用域内运行，自动清理资源
  const watcher = userStore.watch(
    () => userStore.state.name,
    (name) => console.log('Name changed:', name)
  )

  MemoryLeakGuard.addWatcher(userStore, watcher)
})

// 异步竞态条件处理
const searchStore = store('search')
  .useState('query', '')
  .useState('results', [])
  .useAction('search', async function (query: string) {
    this.query = query

    // 自动取消之前的请求
    const results = await AsyncRaceConditionHandler.execute(
      this,
      'search',
      async (signal) => {
        const response = await fetch(`/api/search?q=${query}`, { signal })
        return response.json()
      }
    )

    this.results = results
  })
  .build()

// 错误处理增强
EnhancedErrorHandler.setGlobalHandler((error, context) => {
  console.error('Global error:', error)

  // 发送到错误监控服务
  if (process.env.NODE_ENV === 'production') {
    // sendToSentry(error, context)
  }
})

// 包装函数以自动捕获错误
const safeAction = EnhancedErrorHandler.wrap(
  async () => {
    // 可能抛出错误的代码
    const response = await fetch('/api/data')
    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }
    return response.json()
  },
  { store: 'data', action: 'fetch' }
)

// ============================================
// 4. 高级功能示例
// ============================================

// 时间旅行调试
const timeTravel = createTimeTravelDebugger<typeof userStore.state>({
  maxHistorySize: 100
})

// 记录状态变化
userStore.$subscribe((mutation, state) => {
  timeTravel.record(state, {
    type: mutation.type,
    payload: mutation.payload
  })
})

// 时间旅行操作
function debugTimeTravel() {
  // 后退
  if (timeTravel.canUndo()) {
    const previousState = timeTravel.undo()
    if (previousState) {
      userStore.$patch(previousState)
    }
  }

  // 前进
  if (timeTravel.canRedo()) {
    const nextState = timeTravel.redo()
    if (nextState) {
      userStore.$patch(nextState)
    }
  }

  // 查看历史
  const history = timeTravel.getHistory()
  console.log('State history:', history)
}

// 状态快照管理
const snapshots = createSnapshotManager<typeof todoStore.state>()

// 创建快照
function saveSnapshot(name?: string) {
  const id = snapshots.create(
    todoStore.state,
    name || `Snapshot ${new Date().toISOString()}`,
    ['manual', 'backup']
  )
  console.log('Snapshot created:', id)
  return id
}

// 恢复快照
function restoreSnapshot(id: string) {
  const state = snapshots.restore(id)
  if (state) {
    todoStore.$patch(state)
    console.log('Snapshot restored:', id)
  }
}

// 比较快照
function compareSnapshots(id1: string, id2: string) {
  const diff = snapshots.compare(id1, id2)
  console.log('Snapshot diff:', diff)
}

// 中间件系统
const middleware = createMiddlewareSystem()

// 添加日志中间件
middleware.use(
  MiddlewareSystem.createLogger({
    collapsed: true,
    duration: true,
    diff: true
  })
)

// 添加性能监控中间件
middleware.use(
  MiddlewareSystem.createPerformanceMonitor(16) // 警告超过16ms的操作
)

// 添加自定义中间件
middleware.use(async (context, next) => {
  console.log('Before action:', context.action)

  await next()

  console.log('After action, new state:', context.state)

  // 可以在这里添加副作用
  if (context.action?.type === 'login') {
    // 触发分析事件
    // analytics.track('user_login')
  }
})

// 状态同步（多标签页/设备同步）
const synchronizer = createStateSynchronizer('app-state', async (remote, local) => {
  // 自定义冲突解决
  console.log('Conflict detected, merging states...')

  // 合并策略示例
  return {
    ...local,
    ...remote,
    // 保留本地的某些字段
    localOnly: local.localOnly
  }
})

// ============================================
// 5. 组合使用示例
// ============================================

// 组合多个Store
const appStore = combineStores({
  user: userStore,
  todos: todoStore,
  search: searchStore
})

// 异步Store
const dataStore = createAsyncStore('remote-data', async () => {
  const response = await fetch('/api/data')
  return response.json()
})

// 完整应用示例
class TodoApp {
  private stores = appStore
  private timeTravel = timeTravel
  private snapshots = snapshots
  private middleware = middleware

  constructor() {
    this.initialize()
  }

  private initialize() {
    // 设置中间件
    this.setupMiddleware()

    // 设置错误处理
    this.setupErrorHandling()

    // 设置状态同步
    this.setupSync()

    // 加载初始数据
    this.loadData()
  }

  private setupMiddleware() {
    // 为每个action添加中间件
    this.stores.stores.todos.$onAction(async (action) => {
      await this.middleware.execute({
        type: 'action',
        state: this.stores.stores.todos.state,
        action: {
          type: action.name,
          payload: action.args
        }
      })
    })
  }

  private setupErrorHandling() {
    EnhancedErrorHandler.register('NetworkError', (error) => {
      console.error('Network error:', error)
      // 显示用户友好的错误消息
      this.showError('网络连接失败，请稍后重试')
    })
  }

  private setupSync() {
    // 监听状态变化并同步
    this.stores.stores.todos.$subscribe(async (mutation, state) => {
      await synchronizer.sync(state, {
        type: 'state_change',
        payload: mutation
      })
    })
  }

  private async loadData() {
    // 使用批量更新加载数据
    await dataStore.load()

    batchUpdate(() => {
      if (dataStore.data.value) {
        this.stores.stores.todos.state.items = dataStore.data.value.todos
        this.stores.stores.user.state.name = dataStore.data.value.user.name
      }
    })
  }

  private showError(message: string) {
    console.error(message)
    // 实际应用中会显示UI提示
  }

  // 公共API
  public addTodo(text: string) {
    this.stores.stores.todos.actions.addTodo(text)

    // 记录到时间旅行
    this.timeTravel.record(this.stores.state, {
      type: 'ADD_TODO',
      payload: { text }
    })
  }

  public undo() {
    const state = this.timeTravel.undo()
    if (state) {
      this.stores.restore(state)
    }
  }

  public redo() {
    const state = this.timeTravel.redo()
    if (state) {
      this.stores.restore(state)
    }
  }

  public createBackup() {
    return this.snapshots.create(
      this.stores.state,
      `Backup ${new Date().toLocaleString()}`,
      ['auto-backup']
    )
  }

  public restoreBackup(id: string) {
    const state = this.snapshots.restore(id)
    if (state) {
      this.stores.restore(state)
    }
  }
}

// 创建应用实例
const app = new TodoApp()

// 导出供外部使用
export {
  userStore,
  todoStore,
  searchStore,
  appStore,
  dataStore,
  app,

  // 工具函数
  updateMultipleStores,
  debugTimeTravel,
  saveSnapshot,
  restoreSnapshot,
  compareSnapshots
}

// ============================================
// 6. Vue组件中使用示例
// ============================================

/*
// 在Vue组件中使用
<template>
  <div>
    <h1>{{ user.displayName }}</h1>
    <div v-for="todo in todos.filteredItems" :key="todo.id">
      <input
        type="checkbox"
        :checked="todo.done"
        @change="todos.toggleTodo(todo.id)"
      />
      {{ todo.text }}
    </div>

    <button @click="undo" :disabled="!canUndo">撤销</button>
    <button @click="redo" :disabled="!canRedo">重做</button>
    <button @click="backup">备份</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { userStore, todoStore, app, timeTravel } from './store'

const user = userStore.state
const todos = todoStore.state

const canUndo = computed(() => timeTravel.canUndo())
const canRedo = computed(() => timeTravel.canRedo())

function undo() {
  app.undo()
}

function redo() {
  app.redo()
}

function backup() {
  const id = app.createBackup()
  console.log('Backup created:', id)
}
</script>
*/
