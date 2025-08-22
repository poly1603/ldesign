# 开发工具

LDesign Engine 提供了丰富的开发工具，帮助你提高开发效率和调试体验。

## 开发者工具

### 浏览器扩展

安装 LDesign Engine 开发者工具浏览器扩展：

- [Chrome 扩展](https://chrome.google.com/webstore/detail/ldesign-engine-devtools)
- [Firefox 扩展](https://addons.mozilla.org/firefox/addon/ldesign-engine-devtools)
- [Edge 扩展](https://microsoftedge.microsoft.com/addons/detail/ldesign-engine-devtools)

### 启用开发者工具

```typescript
import { createEngine } from '@ldesign/engine'

const engine = createEngine({
  config: {
    debug: true,
    devtools: true, // 启用开发者工具
  },
})

// 全局暴露引擎实例（仅开发环境）
if (import.meta.env.DEV) {
  window.__LDESIGN_ENGINE__ = engine
}
```

### 开发者工具功能

#### 1. 状态检查器

```typescript
// 在浏览器控制台中使用
__LDESIGN_ENGINE__.state.getAll() // 查看所有状态
__LDESIGN_ENGINE__.state.get('user') // 查看特定状态
__LDESIGN_ENGINE__.state.keys() // 查看所有状态键

// 状态变化监控
__LDESIGN_ENGINE__.state.subscribe('*', (key, newValue, oldValue) => {
  console.log(`状态变化: ${key}`, { oldValue, newValue })
})
```

#### 2. 事件监控

```typescript
// 监控所有事件
__LDESIGN_ENGINE__.events.on('*', (eventName, data) => {
  console.log(`事件触发: ${eventName}`, data)
})

// 查看事件统计
__LDESIGN_ENGINE__.events.getStats()

// 查看已注册的事件
__LDESIGN_ENGINE__.events.getEventNames()
```

#### 3. 插件管理

```typescript
// 查看所有插件
__LDESIGN_ENGINE__.plugins.getAll()

// 查看插件信息
__LDESIGN_ENGINE__.plugins.getInfo('plugin-name')

// 查看插件统计
__LDESIGN_ENGINE__.plugins.getStats()

// 动态加载插件
__LDESIGN_ENGINE__.plugins.register(newPlugin)
```

#### 4. 性能分析

```typescript
// 查看性能指标
__LDESIGN_ENGINE__.performance.getMetrics()

// 查看内存使用
__LDESIGN_ENGINE__.performance.getMemoryInfo()

// 开始性能分析
__LDESIGN_ENGINE__.performance.startProfiling()
// ... 执行操作
const profile = __LDESIGN_ENGINE__.performance.stopProfiling()
```

## 调试功能

### 日志调试

```typescript
// 配置详细日志
const engine = createEngine({
  config: {
    debug: true,
    logLevel: 'debug',
  },

  logger: {
    transports: [
      {
        type: 'console',
        level: 'debug',
        format: 'detailed',
        colors: true,
      },
    ],
  },
})

// 自定义日志格式
engine.logger.addFormatter('custom', (entry) => {
  return `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`
})

// 日志过滤
engine.logger.addFilter((entry) => {
  // 过滤敏感信息
  if (entry.message.includes('password')) {
    entry.message = entry.message.replace(/password:\s*\S+/g, 'password: ***')
  }
  return entry
})
```

### 状态调试

```typescript
// 启用状态调试
const engine = createEngine({
  state: {
    debug: true,

    // 状态变化日志
    logChanges: true,

    // 状态历史记录
    history: {
      enabled: true,
      maxSize: 100,
    },

    // 状态验证
    validation: {
      enabled: true,
      strict: true,
    },
  },
})

// 状态快照
const snapshot = engine.state.createSnapshot()
console.log('状态快照:', snapshot)

// 状态回滚
engine.state.restoreSnapshot(snapshot)

// 状态历史
const history = engine.state.getHistory()
console.log('状态历史:', history)
```

### 事件调试

```typescript
// 启用事件调试
const engine = createEngine({
  events: {
    debug: {
      enabled: true,
      logAll: true, // 记录所有事件
      logPatterns: ['user:*', 'error:*'], // 只记录匹配的事件
      includeStack: true, // 包含调用栈
    },
  },
})

// 事件追踪
engine.events.enableTracing()

// 查看事件流
const eventFlow = engine.events.getEventFlow()
console.log('事件流:', eventFlow)
```

### 插件调试

```typescript
// 插件加载调试
engine.events.on('plugin:loading', ({ name }) => {
  console.log(`正在加载插件: ${name}`)
})

engine.events.on('plugin:loaded', ({ name, duration }) => {
  console.log(`插件 ${name} 加载完成，耗时: ${duration}ms`)
})

engine.events.on('plugin:error', ({ name, error }) => {
  console.error(`插件 ${name} 出错:`, error)
})

// 插件依赖图
const dependencyGraph = engine.plugins.getDependencyGraph()
console.log('插件依赖图:', dependencyGraph)
```

## 热重载

### 启用热重载

```typescript
// 开发环境配置
const engine = createEngine({
  config: {
    debug: true,
    hotReload: true,
  },
})

// 监听文件变化
if (import.meta.hot) {
  import.meta.hot.accept('./plugins/my-plugin.ts', (newModule) => {
    // 重新加载插件
    engine.plugins.reload('my-plugin', newModule.default)
  })

  import.meta.hot.accept('./middleware/auth.ts', (newModule) => {
    // 重新加载中间件
    engine.middleware.reload('auth', newModule.default)
  })
}
```

### 状态热重载

```typescript
// 保持状态的热重载
if (import.meta.hot) {
  // 保存当前状态
  const currentState = engine.state.getAll()

  import.meta.hot.accept(() => {
    // 重新创建引擎
    const newEngine = createEngine(config)

    // 恢复状态
    Object.entries(currentState).forEach(([key, value]) => {
      newEngine.state.set(key, value)
    })

    // 替换全局引擎实例
    window.__LDESIGN_ENGINE__ = newEngine
  })
}
```

## 测试工具

### 单元测试辅助

```typescript
import { createTestEngine } from '@ldesign/engine/testing'

describe('Engine Tests', () => {
  let engine: Engine

  beforeEach(() => {
    // 创建测试引擎
    engine = createTestEngine({
      config: { debug: false },
      mockPlugins: true,
      mockState: {
        user: { id: 1, name: 'Test User' },
      },
    })
  })

  afterEach(() => {
    // 清理测试引擎
    engine.destroy()
  })

  it('should handle user login', async () => {
    const loginSpy = vi.fn()
    engine.events.on('user:login', loginSpy)

    await engine.auth.login({ username: 'test', password: 'test' })

    expect(loginSpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'Test User' }))
  })
})
```

### 状态测试

```typescript
import { StateTestHelper } from '@ldesign/engine/testing'

describe('State Tests', () => {
  let stateHelper: StateTestHelper

  beforeEach(() => {
    stateHelper = new StateTestHelper(engine)
  })

  it('should update user state', () => {
    const userData = { id: 1, name: 'John' }

    // 监听状态变化
    const spy = stateHelper.watchState('user')

    // 更新状态
    engine.state.set('user', userData)

    // 验证状态变化
    expect(spy).toHaveBeenCalledWith(userData, undefined)
    expect(stateHelper.getState('user')).toEqual(userData)
  })

  it('should persist state', () => {
    engine.state.set('user.preferences.theme', 'dark')

    // 模拟页面刷新
    stateHelper.simulateReload()

    // 验证状态持久化
    expect(stateHelper.getState('user.preferences.theme')).toBe('dark')
  })
})
```

### 事件测试

```typescript
import { EventTestHelper } from '@ldesign/engine/testing'

describe('Event Tests', () => {
  let eventHelper: EventTestHelper

  beforeEach(() => {
    eventHelper = new EventTestHelper(engine)
  })

  it('should emit and handle events', () => {
    const handler = vi.fn()

    // 监听事件
    eventHelper.on('test:event', handler)

    // 触发事件
    eventHelper.emit('test:event', { data: 'test' })

    // 验证事件处理
    expect(handler).toHaveBeenCalledWith({ data: 'test' })
    expect(eventHelper.wasEmitted('test:event')).toBe(true)
  })

  it('should handle event priority', () => {
    const order: number[] = []

    eventHelper.on('priority:test', () => order.push(1), 1)
    eventHelper.on('priority:test', () => order.push(2), 2)
    eventHelper.on('priority:test', () => order.push(3), 3)

    eventHelper.emit('priority:test')

    expect(order).toEqual([3, 2, 1]) // 高优先级先执行
  })
})
```

## 性能分析

### 性能监控

```typescript
// 启用性能监控
const engine = createEngine({
  performance: {
    enabled: true,

    // 自动收集指标
    autoCollect: true,

    // 性能预算
    budget: {
      fcp: 1500, // 首次内容绘制
      lcp: 2500, // 最大内容绘制
      fid: 100, // 首次输入延迟
      cls: 0.1, // 累积布局偏移
      memory: 50, // 内存使用限制（MB）
    },
  },
})

// 监听性能警告
engine.events.on('performance:budget-exceeded', (metric) => {
  console.warn(`性能预算超标: ${metric.name}`, metric)
})
```

### 内存分析

```typescript
// 内存使用监控
setInterval(() => {
  const memoryInfo = engine.performance.getMemoryInfo()

  if (memoryInfo.usedJSHeapSize > 50 * 1024 * 1024) {
    // 50MB
    console.warn('内存使用过高:', memoryInfo)

    // 执行内存清理
    engine.cache.cleanup()
    engine.state.cleanup()
  }
}, 10000)

// 内存泄漏检测
engine.performance.detectMemoryLeaks({
  interval: 30000, // 30秒检测一次
  threshold: 10 * 1024 * 1024, // 10MB增长阈值
  callback: (leak) => {
    console.error('检测到内存泄漏:', leak)
  },
})
```

### 性能分析报告

```typescript
// 生成性能报告
const report = engine.performance.generateReport()

console.log('性能报告:', {
  startup: report.startup,
  runtime: report.runtime,
  memory: report.memory,
  events: report.events,
  plugins: report.plugins,
})

// 导出性能数据
const profileData = engine.performance.exportProfile()

// 可以导入到 Chrome DevTools 进行详细分析
console.log('性能分析数据:', profileData)
```

## 调试技巧

### 1. 状态调试

```typescript
// 状态变化断点
engine.state.subscribe('user', (newValue, oldValue) => {
  if (newValue?.id !== oldValue?.id) {
    debugger // 用户ID变化时触发断点
  }
})

// 状态验证
engine.state.addValidator('user', (value) => {
  if (value && !value.id) {
    console.error('用户对象缺少ID字段')
    return false
  }
  return true
})
```

### 2. 事件调试

```typescript
// 事件调用栈追踪
engine.events.on('*', (eventName, data) => {
  if (eventName.includes('error')) {
    console.trace(`错误事件触发: ${eventName}`, data)
  }
})

// 事件性能监控
engine.events.on('*', (eventName, data) => {
  const start = performance.now()

  // 监听事件处理完成
  setTimeout(() => {
    const duration = performance.now() - start
    if (duration > 100) {
      // 超过100ms
      console.warn(`事件处理耗时过长: ${eventName} (${duration}ms)`)
    }
  }, 0)
})
```

### 3. 插件调试

```typescript
// 插件加载时间监控
engine.events.on('plugin:registered', ({ name, loadTime }) => {
  if (loadTime > 1000) {
    // 超过1秒
    console.warn(`插件 ${name} 加载耗时过长: ${loadTime}ms`)
  }
})

// 插件依赖检查
engine.events.on('plugin:dependency-missing', ({ plugin, dependency }) => {
  console.error(`插件 ${plugin} 缺少依赖: ${dependency}`)
})
```

## 开发环境配置

### Vite 配置

```typescript
import { ldesignEngine } from '@ldesign/engine/vite'
import vue from '@vitejs/plugin-vue'
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue(),
    ldesignEngine({
      debug: true,
      hotReload: true,
      devtools: true,
    }),
  ],

  define: {
    __LDESIGN_DEBUG__: true,
  },

  server: {
    port: 3000,
    open: true,
  },
})
```

### TypeScript 配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "types": ["@ldesign/engine/types"],
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*", "@ldesign/engine/types"]
}
```

### ESLint 配置

```javascript
// .eslintrc.js
module.exports = {
  extends: ['@ldesign/engine/eslint-config'],
  rules: {
    '@ldesign/engine/no-direct-state-mutation': 'error',
    '@ldesign/engine/prefer-engine-events': 'warn',
  },
}
```

## VS Code 扩展

### LDesign Engine 扩展

安装官方 VS Code 扩展获得更好的开发体验：

- **语法高亮** - 插件和中间件代码高亮
- **智能提示** - 完整的 API 自动补全
- **代码片段** - 常用代码模板
- **错误检查** - 实时错误提示
- **调试支持** - 断点调试功能

### 推荐扩展

```json
// .vscode/extensions.json
{
  "recommendations": [
    "ldesign.engine-vscode",
    "vue.volar",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint"
  ]
}
```

### 工作区配置

```json
// .vscode/settings.json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.engine.ts": "typescript"
  }
}
```

## 命令行工具

### LDesign CLI

```bash
# 安装 CLI 工具
pnpm add -g @ldesign/cli

# 创建新项目
ldesign create my-app

# 生成插件
ldesign generate plugin my-plugin

# 生成中间件
ldesign generate middleware auth

# 运行开发服务器
ldesign dev

# 构建项目
ldesign build

# 分析包大小
ldesign analyze
```

### 项目模板

```bash
# 使用不同模板创建项目
ldesign create my-app --template=basic
ldesign create my-app --template=admin
ldesign create my-app --template=blog
ldesign create my-app --template=ecommerce
```

通过这些开发工具，你可以更高效地开发和调试 LDesign Engine 应用，快速定位问题并优化性能。
