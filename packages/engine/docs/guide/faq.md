# 常见问题

本文档收集了使用 LDesign Engine 时的常见问题和解答。

## 基础问题

### Q: LDesign Engine 与其他 Vue 框架有什么区别？

**A:** LDesign Engine 是一个专注于提供完整应用基础设施的引擎，而不仅仅是一个组件库或状态管理库。它提
供：

- 🔌 **插件化架构** - 模块化扩展能力
- ⚡ **中间件系统** - 请求/响应处理管道
- 📡 **事件系统** - 全局通信机制
- 💾 **状态管理** - 响应式状态管理
- 🛡️ **安全管理** - 内置安全防护
- ⚡ **性能监控** - 实时性能分析
- 🔧 **开发工具** - 完整的开发体验

### Q: 是否可以在现有的 Vue 项目中使用？

**A:** 是的，LDesign Engine 设计为渐进式采用：

```typescript
// 在现有项目中逐步引入
import { createEngine } from '@ldesign/engine'

// 只使用需要的功能
const engine = createEngine({
  config: { debug: true },
  // 只启用需要的模块
})

// 与现有 Vue 应用集成
app.use(engine)
```

### Q: 支持哪些 Vue 版本？

**A:** LDesign Engine 支持：

- ✅ Vue 3.3+ (推荐)
- ✅ Vue 3.2+ (部分功能)
- ❌ Vue 2.x (不支持)

### Q: 是否支持 TypeScript？

**A:** 完全支持！LDesign Engine 使用 TypeScript 开发，提供：

- 完整的类型定义
- 智能代码提示
- 编译时类型检查
- 泛型支持

```typescript
import type { Engine, EngineConfig, Plugin } from '@ldesign/engine'

const config: EngineConfig = {
  debug: true,
  appName: 'My App',
}

const plugin: Plugin = {
  name: 'my-plugin',
  install: (engine: Engine) => {
    // 类型安全的插件开发
  },
}
```

## 安装和配置

### Q: 如何选择合适的安装方式？

**A:** 根据项目需求选择：

```bash
# 完整安装（推荐）
pnpm add @ldesign/engine

# 按需安装（高级用户）
pnpm add @ldesign/engine-core
pnpm add @ldesign/engine-plugins
pnpm add @ldesign/engine-vue
```

### Q: 如何配置开发和生产环境？

**A:** 使用环境配置：

```typescript
import { createEngine, presets } from '@ldesign/engine'

// 开发环境
const devEngine = createEngine({
  ...presets.development(),
  config: {
    debug: true,
    logLevel: 'debug',
  },
})

// 生产环境
const prodEngine = createEngine({
  ...presets.production(),
  config: {
    debug: false,
    logLevel: 'error',
    enableErrorReporting: true,
  },
})
```

### Q: 如何处理包体积问题？

**A:** 使用 Tree Shaking 和按需加载：

```typescript
// 只导入需要的功能
import { createEngine } from '@ldesign/engine/core'
import { eventsPlugin } from '@ldesign/engine/events'
import { statePlugin } from '@ldesign/engine/state'

const engine = createEngine({
  plugins: [statePlugin, eventsPlugin],
})

// 动态导入大型插件
async function loadHeavyPlugin() {
  const { heavyPlugin } = await import('@ldesign/engine/heavy-plugin')
  engine.use(heavyPlugin)
}
```

## 功能使用

### Q: 如何在组件中访问引擎实例？

**A:** 有多种方式：

```typescript
import type { Engine } from '@ldesign/engine'
// 2. 使用 composable
import { useEngine } from '@ldesign/engine/vue'

// 1. 使用 inject (推荐)
import { inject } from 'vue'

export default {
  setup() {
    const engine = inject<Engine>('engine')
    return { engine }
  },
}

export default {
  setup() {
    const engine = useEngine()
    return { engine }
  },
}

// 3. 全局属性
export default {
  mounted() {
    this.$engine.logger.info('组件已挂载')
  },
}
```

### Q: 如何在插件之间共享数据？

**A:** 使用状态管理和事件系统：

```typescript
// 插件 A：设置共享数据
const pluginA = {
  name: 'plugin-a',
  install: (engine) => {
    engine.state.set('shared.data', { value: 42 })
    engine.events.emit('plugin-a:ready', { data: 'hello' })
  },
}

// 插件 B：使用共享数据
const pluginB = {
  name: 'plugin-b',
  dependencies: ['plugin-a'],
  install: (engine) => {
    // 获取共享状态
    const sharedData = engine.state.get('shared.data')

    // 监听其他插件事件
    engine.events.on('plugin-a:ready', (data) => {
      console.log('收到插件A的数据:', data)
    })
  },
}
```

### Q: 如何处理异步插件加载？

**A:** 使用异步插件模式：

```typescript
const asyncPlugin = {
  name: 'async-plugin',
  install: async (engine) => {
    // 异步初始化
    const config = await fetch('/api/plugin-config').then(r => r.json())

    engine.state.set('plugin.config', config)

    // 通知插件就绪
    engine.events.emit('async-plugin:ready')
  },
}

// 等待异步插件就绪
engine.events.once('async-plugin:ready', () => {
  console.log('异步插件已就绪')
})
```

### Q: 如何实现状态持久化？

**A:** 配置状态持久化：

```typescript
const engine = createEngine({
  state: {
    persistence: {
      enabled: true,
      storage: 'localStorage', // 或 'sessionStorage', 'indexedDB'
      keys: ['user', 'settings', 'preferences'],
      prefix: 'myapp:',

      // 自定义序列化
      serialize: data => JSON.stringify(data),
      deserialize: data => JSON.parse(data),

      // 加密存储
      encryption: {
        enabled: true,
        key: 'your-encryption-key',
      },
    },
  },
})
```

## 性能优化

### Q: 如何优化应用启动性能？

**A:** 使用以下策略：

```typescript
// 1. 延迟加载非关键插件
const engine = createEngine({
  plugins: [
    // 只加载关键插件
    corePlugin,
    authPlugin,
  ],
})

// 延迟加载其他插件
requestIdleCallback(() => {
  engine.use(analyticsPlugin)
  engine.use(chatPlugin)
})

// 2. 使用插件预加载
engine.preloadPlugins(['analytics', 'chat'])

// 3. 状态预热
engine.state.preload(['user', 'settings'])
```

### Q: 如何监控和优化内存使用？

**A:** 使用性能监控：

```typescript
// 启用内存监控
const engine = createEngine({
  performance: {
    enabled: true,
    memoryMonitoring: true,

    // 内存阈值警告
    memoryThreshold: 50 * 1024 * 1024, // 50MB

    // 自动清理
    autoCleanup: true,
  },
})

// 监听内存警告
engine.events.on('performance:memory-warning', (info) => {
  console.warn('内存使用过高:', info)

  // 执行清理操作
  engine.cache.cleanup()
  engine.state.cleanup()
})

// 手动内存分析
const memoryInfo = engine.performance.getMemoryInfo()
console.log('内存使用情况:', memoryInfo)
```

### Q: 如何优化事件系统性能？

**A:** 使用事件优化技巧：

```typescript
// 1. 使用事件命名空间
engine.events.on('user:*', handler) // 监听所有用户事件

// 2. 事件节流
const throttledHandler = engine.utils.throttle(handler, 100)
engine.events.on('scroll', throttledHandler)

// 3. 事件批处理
engine.events.batch('analytics', 10, 1000).on((events) => {
  // 批量处理分析事件
  sendAnalytics(events)
})

// 4. 及时清理监听器
const unsubscribe = engine.events.on('data:update', handler)
// 组件销毁时清理
onUnmounted(() => unsubscribe())
```

## 错误处理

### Q: 如何处理插件加载错误？

**A:** 使用错误处理策略：

```typescript
// 1. 插件级错误处理
const robustPlugin = {
  name: 'robust-plugin',
  install: (engine) => {
    try {
      // 插件初始化逻辑
      initializePlugin()
    }
    catch (error) {
      engine.logger.error('插件初始化失败:', error)

      // 降级处理
      initializeFallback()
    }
  },
}

// 2. 全局插件错误处理
engine.events.on('plugin:error', ({ plugin, error }) => {
  console.error(`插件 ${plugin.name} 出错:`, error)

  // 可选择禁用有问题的插件
  engine.plugins.disable(plugin.name)
})

// 3. 插件依赖错误处理
const dependentPlugin = {
  name: 'dependent-plugin',
  dependencies: ['base-plugin'],
  install: (engine) => {
    if (!engine.plugins.isRegistered('base-plugin')) {
      throw new Error('依赖插件未找到')
    }
  },
}
```

### Q: 如何调试状态管理问题？

**A:** 使用调试工具：

```typescript
// 1. 启用状态调试
const engine = createEngine({
  config: { debug: true },
  state: {
    debug: true,

    // 状态变化日志
    logChanges: true,

    // 状态历史记录
    history: {
      enabled: true,
      maxSize: 50,
    },
  },
})

// 2. 监听所有状态变化
engine.state.subscribe('*', (key, newValue, oldValue) => {
  console.log(`状态变化: ${key}`, { oldValue, newValue })
})

// 3. 状态快照和回滚
const snapshot = engine.state.createSnapshot()
// ... 执行操作
engine.state.restoreSnapshot(snapshot)

// 4. 开发者工具集成
if (process.env.NODE_ENV === 'development') {
  window.__ENGINE_STATE__ = engine.state
}
```

## 部署和生产

### Q: 如何准备生产环境部署？

**A:** 使用生产环境配置：

```typescript
const productionEngine = createEngine({
  config: {
    debug: false,
    logLevel: 'error',
    enableErrorReporting: true,
    enablePerformanceMonitoring: true,
  },

  security: {
    xss: { enabled: true },
    csrf: { enabled: true },
    csp: { enabled: true },
  },

  performance: {
    enabled: true,
    autoOptimization: true,

    // 生产环境性能预算
    budget: {
      fcp: 1500,
      lcp: 2500,
      fid: 100,
    },
  },
})
```

### Q: 如何监控生产环境性能？

**A:** 配置监控和报告：

```typescript
const engine = createEngine({
  performance: {
    enabled: true,

    // 性能数据上报
    reporting: {
      enabled: true,
      endpoint: '/api/performance',
      interval: 30000,

      // 只上报关键指标
      metrics: ['fcp', 'lcp', 'fid', 'cls'],
    },
  },

  // 错误报告
  errorReporting: {
    enabled: true,
    endpoint: '/api/errors',

    // 错误过滤
    filter: (error) => {
      // 过滤掉网络错误等
      return !error.message.includes('Network Error')
    },
  },
})
```

### Q: 如何进行版本升级？

**A:** 遵循升级指南：

1. **检查变更日志** - 了解破坏性变更
2. **更新依赖** - 逐步更新相关依赖
3. **运行测试** - 确保功能正常
4. **渐进式部署** - 使用蓝绿部署或金丝雀发布

```bash
# 检查当前版本
pnpm list @ldesign/engine

# 查看可用版本
pnpm view @ldesign/engine versions --json

# 升级到最新版本
pnpm update @ldesign/engine

# 运行测试
pnpm test
```

## 社区和支持

### Q: 如何贡献代码？

**A:** 欢迎贡献！请查看 [贡献指南](https://github.com/ldesign/engine/blob/main/CONTRIBUTING.md)。

### Q: 如何报告 Bug？

**A:** 在 [GitHub Issues](https://github.com/ldesign/engine/issues) 提交，请包含：

- 详细的错误描述
- 重现步骤
- 环境信息
- 最小重现示例

### Q: 如何获取技术支持？

**A:** 多种方式获取帮助：

- 📖 [官方文档](https://ldesign.github.io/engine/)
- 💬 [GitHub Discussions](https://github.com/ldesign/engine/discussions)
- 🏷️ [Stack Overflow](https://stackoverflow.com/questions/tagged/ldesign-engine)
- 📧 [邮件支持](mailto:support@ldesign.com)

如果你的问题没有在这里找到答案，请查看 [故障排除指南](./troubleshooting.md) 或在社区寻求帮助。
