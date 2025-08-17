# 迁移指南

本指南帮助你从其他框架或旧版本迁移到 LDesign Engine。

## 从 Vue 2 迁移

### 基础迁移

如果你正在从 Vue 2 项目迁移，首先需要升级到 Vue 3：

```bash
# 升级 Vue
pnpm remove vue@2
pnpm add vue@3

# 安装 LDesign Engine
pnpm add @ldesign/engine
```

### 状态管理迁移

#### 从 Vuex 迁移

```typescript
// LDesign Engine (新)
import { createEngine } from '@ldesign/engine'

// Vuex (旧)
import { createStore } from 'vuex'

const store = createStore({
  state: {
    user: null,
    count: 0,
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    INCREMENT(state) {
      state.count++
    },
  },
  actions: {
    async login({ commit }, credentials) {
      const user = await api.login(credentials)
      commit('SET_USER', user)
    },
  },
})

const engine = createEngine({
  state: {
    initialState: {
      user: null,
      count: 0,
    },
  },
})

// 设置状态
engine.state.set('user', user)
engine.state.set('count', count + 1)

// 监听状态变化
engine.state.subscribe('user', (newUser) => {
  console.log('用户更新:', newUser)
})

// 异步操作
async function login(credentials) {
  try {
    const user = await api.login(credentials)
    engine.state.set('user', user)
    engine.events.emit('user:login', user)
  }
  catch (error) {
    engine.notifications.error('登录失败')
  }
}
```

### 事件系统迁移

#### 从 EventBus 迁移

```typescript
// LDesign Engine (新)
import { createEngine } from '@ldesign/engine'

// EventBus (旧)
import { createApp } from 'vue'
const eventBus = createApp({})

// 发送事件
eventBus.$emit('user-login', userData)

// 监听事件
eventBus.$on('user-login', (userData) => {
  console.log('用户登录:', userData)
})

const engine = createEngine()

// 发送事件
engine.events.emit('user:login', userData)

// 监听事件
engine.events.on('user:login', (userData) => {
  console.log('用户登录:', userData)
})

// 一次性监听
engine.events.once('app:ready', () => {
  console.log('应用就绪')
})

// 取消监听
const unsubscribe = engine.events.on('data:update', handler)
unsubscribe() // 取消监听
```

## 从其他框架迁移

### 从 React 迁移

#### 状态管理对比

```typescript
// React + Redux (旧)
import { createStore } from 'redux'

const initialState = {
  user: null,
  loading: false,
}

function reducer(state = initialState, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    default:
      return state
  }
}

const store = createStore(reducer)

// LDesign Engine (新)
const engine = createEngine({
  state: {
    initialState: {
      user: null,
      loading: false,
    },
  },
})

// 更简洁的状态更新
engine.state.set('user', userData)
engine.state.set('loading', true)

// 批量更新
engine.state.batch(() => {
  engine.state.set('user', userData)
  engine.state.set('loading', false)
})
```

#### 生命周期对比

```typescript
// React (旧)
import { useEffect, useState } from 'react'

function MyComponent() {
  const [data, setData] = useState(null)

  useEffect(() => {
    // 组件挂载
    fetchData().then(setData)

    return () => {
      // 组件卸载
      cleanup()
    }
  }, [])

  return <div>{data?.title}</div>
}

// Vue 3 + LDesign Engine (新)
import { ref, onMounted, onUnmounted } from 'vue'
import { useEngine } from '@ldesign/engine/vue'

export default {
  setup() {
    const engine = useEngine()
    const data = ref(null)

    onMounted(async () => {
      // 组件挂载
      data.value = await fetchData()
      engine.events.emit('component:mounted', 'MyComponent')
    })

    onUnmounted(() => {
      // 组件卸载
      cleanup()
      engine.events.emit('component:unmounted', 'MyComponent')
    })

    return { data }
  },
}
```

### 从 Angular 迁移

#### 服务注入对比

```typescript
// Angular (旧)
import { Injectable } from '@angular/core'

// 在组件中使用
import { Component } from '@angular/core'
import { useEngine } from '@ldesign/engine/vue'

// 在组件中使用
import { computed } from 'vue'
import { UserService } from './user.service'

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private user = null

  getUser() {
    return this.user
  }

  setUser(user) {
    this.user = user
  }
}

@Component({
  selector: 'app-user',
  template: '<div>{{ user?.name }}</div>',
})
export class UserComponent {
  user = this.userService.getUser()

  constructor(private userService: UserService) {}
}

// LDesign Engine (新)
// 创建用户插件
const userPlugin = {
  name: 'user',
  install: (engine) => {
    const userService = {
      getUser() {
        return engine.state.get('user')
      },

      setUser(user) {
        engine.state.set('user', user)
        engine.events.emit('user:updated', user)
      },
    }

    engine.userService = userService
  },
}

export default {
  setup() {
    const engine = useEngine()
    const user = computed(() => engine.userService.getUser())

    return { user }
  },
}
```

## 版本升级

### 从 1.x 升级到 2.x

#### 破坏性变更

1. **API 重命名**

```typescript
// 1.x (旧)
engine.getState('user')
engine.setState('user', userData)

// 2.x (新)
engine.state.get('user')
engine.state.set('user', userData)
```

2. **插件格式变更**

```typescript
// 1.x (旧)
const plugin = {
  name: 'my-plugin',
  setup: (engine) => {
    // 插件逻辑
  },
}

// 2.x (新)
const plugin = {
  name: 'my-plugin',
  install: (engine) => {
    // 插件逻辑
  },
}
```

3. **事件系统变更**

```typescript
// 1.x (旧)
engine.on('event', handler)
engine.emit('event', data)

// 2.x (新)
engine.events.on('event', handler)
engine.events.emit('event', data)
```

#### 自动迁移工具

我们提供了自动迁移工具来帮助升级：

```bash
# 安装迁移工具
pnpm add -D @ldesign/engine-migrate

# 运行迁移
npx ldesign-migrate --from=1.x --to=2.x
```

### 配置迁移

#### 1.x 配置格式

```typescript
// 1.x
const engine = createEngine({
  debug: true,
  plugins: [plugin1, plugin2],
  initialState: {
    user: null,
  },
})
```

#### 2.x 配置格式

```typescript
// 2.x
const engine = createEngine({
  config: {
    debug: true,
  },
  plugins: [plugin1, plugin2],
  state: {
    initialState: {
      user: null,
    },
  },
})
```

## 迁移检查清单

### 代码迁移

- [ ] 更新依赖版本
- [ ] 修改 API 调用
- [ ] 更新插件格式
- [ ] 调整配置结构
- [ ] 更新类型定义

### 功能验证

- [ ] 状态管理正常工作
- [ ] 事件系统正常工作
- [ ] 插件正常加载
- [ ] 中间件正常执行
- [ ] 缓存功能正常

### 性能测试

- [ ] 应用启动时间
- [ ] 内存使用情况
- [ ] 运行时性能
- [ ] 包体积大小

### 兼容性测试

- [ ] 浏览器兼容性
- [ ] Vue 版本兼容性
- [ ] TypeScript 兼容性
- [ ] 构建工具兼容性

## 常见迁移问题

### Q: 迁移后应用启动失败

**A:** 检查以下几点：

1. Vue 版本是否 >= 3.3.0
2. 配置格式是否正确
3. 插件依赖是否满足
4. TypeScript 类型是否匹配

### Q: 状态数据丢失

**A:** 可能的原因：

1. 状态键名发生变化
2. 持久化配置不正确
3. 数据格式不兼容

解决方案：

```typescript
// 数据迁移
const oldData = localStorage.getItem('old-app-state')
if (oldData) {
  const parsed = JSON.parse(oldData)
  engine.state.set('user', parsed.user)
  engine.state.set('settings', parsed.settings)
}
```

### Q: 插件不兼容

**A:** 更新插件格式：

```typescript
// 旧格式
const plugin = {
  name: 'my-plugin',
  setup: (engine) => {},
}

// 新格式
const plugin = {
  name: 'my-plugin',
  version: '2.0.0',
  install: (engine) => {},
}
```

### Q: 性能下降

**A:** 优化建议：

1. 启用生产模式
2. 使用代码分割
3. 优化状态结构
4. 减少不必要的监听器

```typescript
// 性能优化配置
const engine = createEngine({
  config: {
    debug: false, // 生产环境关闭调试
  },
  performance: {
    enabled: true,
    autoOptimization: true,
  },
})
```

## 获取帮助

如果在迁移过程中遇到问题：

1. **查看文档** - [故障排除指南](./troubleshooting.md)
2. **搜索问题** - [GitHub Issues](https://github.com/ldesign/engine/issues)
3. **社区讨论** - [GitHub Discussions](https://github.com/ldesign/engine/discussions)
4. **联系支持** - [技术支持](mailto:support@ldesign.com)

我们致力于让迁移过程尽可能顺畅，如有任何问题请随时联系我们！
