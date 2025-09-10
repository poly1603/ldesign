# 插件系统

引擎提供了强大的插件系统，允许你扩展引擎的功能。

## 基本概念

插件是一个包含 `install` 方法的对象，当插件被注册时，`install` 方法会被调用。

```typescript
interface Plugin {
  name: string
  version?: string
  dependencies?: string[]
  install: (context: PluginContext) => void | Promise<void>
  uninstall?: (context: PluginContext) => void | Promise<void>
}

interface PluginContext {
  engine: Engine
  logger: Logger
  config: ConfigManager
  events: EventManager
}
```

## 创建插件

### 基本插件

```typescript
import { createEngine } from '@ldesign/engine'
import { createApp } from 'vue'
import App from './App.vue'

// 创建一个简单的插件
const myPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  install: (context) => {
    // 插件安装逻辑
    context.logger.info('My plugin installed!')

    // 注册全局状态
    context.engine.state.set('myPluginData', { count: 0 })

    // 监听事件
    context.events.on('my-event', (data) => {
      console.log('My event triggered:', data)
    })
  }
}

// 使用插件
const engine = createEngine({
  plugins: [myPlugin],
  config: {
    debug: true
  }
})

const app = createApp(App)
engine.install(app)
```

### 异步插件

```typescript
const asyncPlugin = {
  name: 'async-plugin',
  version: '1.0.0',
  install: async (context) => {
    // 异步初始化
    const data = await fetch('/api/plugin-config')
    const config = await data.json()

    context.engine.state.set('asyncPluginConfig', config)
    context.logger.info('Async plugin loaded with config:', config)
  }
}
```

### 带依赖的插件

```typescript
const dependentPlugin = {
  name: 'dependent-plugin',
  version: '1.0.0',
  dependencies: ['base-plugin'], // 依赖其他插件
  install: (context) => {
    // 确保依赖插件已安装
    if (!context.engine.plugins.isRegistered('base-plugin')) {
      throw new Error('base-plugin is required')
    }

    context.logger.info('Dependent plugin installed')
  },
}
```

## 插件生命周期

### 注册插件

```typescript
// 在创建引擎时注册
const engine = createEngine({
  plugins: [myPlugin, asyncPlugin],
  config: {
    debug: true
  }
})

// 动态注册插件
await engine.plugins.register(dependentPlugin)
```

### 卸载插件

```typescript
// 如果插件提供了 uninstall 方法
const removablePlugin = {
  name: 'removable-plugin',
  install: (engine) => {
    engine.logger.info('Plugin installed')
  },
  uninstall: (engine) => {
    engine.logger.info('Plugin uninstalled')
    // 清理资源
  },
}

// 卸载插件
await engine.plugins.unregister('removable-plugin')
```

## 插件管理

### 检查插件状态

```typescript
// 检查插件是否已注册
if (engine.plugins.isRegistered('my-plugin')) {
  console.log('Plugin is registered')
}

// 获取插件实例
const plugin = engine.plugins.get('my-plugin')
if (plugin) {
  console.log('Plugin info:', plugin.name, plugin.version)
}

// 获取所有插件
const allPlugins = engine.plugins.getAll()
console.log(
  'Registered plugins:',
  allPlugins.map(p => p.name)
)
```

## 插件通信

插件之间可以通过事件系统进行通信：

```typescript
// 插件A：发送事件
const pluginA = creators.plugin('plugin-a', (engine) => {
  // 发送数据给其他插件
  engine.events.emit('data-updated', { value: 42 })
})

// 插件B：监听事件
const pluginB = creators.plugin('plugin-b', (engine) => {
  // 监听来自其他插件的事件
  engine.events.on('data-updated', (data) => {
    console.log('Received data from plugin A:', data.value)
  })
})
```

## 插件最佳实践

### 1. 命名规范

```typescript
// 使用描述性的名称
const goodPlugin = creators.plugin('user-authentication', install)
const badPlugin = creators.plugin('plugin1', install) // ❌ 不好的命名
```

### 2. 错误处理

```typescript
const robustPlugin = creators.plugin('robust-plugin', (engine) => {
  try {
    // 插件逻辑
    engine.state.set('data', processData())
  }
  catch (error) {
    engine.logger.error('Plugin initialization failed:', error)
    // 优雅降级
    engine.state.set('data', getDefaultData())
  }
})
```

### 3. 资源清理

```typescript
const cleanPlugin = {
  name: 'clean-plugin',
  install: (engine) => {
    const timer = setInterval(() => {
      // 定期任务
    }, 1000)

    // 保存定时器引用以便清理
    engine.state.set('cleanPluginTimer', timer)
  },
  uninstall: (engine) => {
    // 清理资源
    const timer = engine.state.get('cleanPluginTimer')
    if (timer) {
      clearInterval(timer)
      engine.state.remove('cleanPluginTimer')
    }
  },
}
```

### 4. 配置管理

```typescript
interface MyPluginOptions {
  apiUrl: string
  timeout: number
}

function configurablePlugin(options: MyPluginOptions) {
  return creators.plugin('configurable-plugin', (engine) => {
    // 使用配置
    engine.state.set('apiConfig', {
      url: options.apiUrl,
      timeout: options.timeout,
    })
  })
}

// 使用配置化插件
const engine = createApp(App, {
  plugins: [
    configurablePlugin({
      apiUrl: 'https://api.example.com',
      timeout: 5000,
    }),
  ],
})
```

## 内置插件事件

引擎会自动发送插件相关的事件：

```typescript
// 监听插件注册事件
engine.events.on('plugin:registered', (plugin) => {
  console.log('Plugin registered:', plugin.name)
})

// 监听插件卸载事件
engine.events.on('plugin:unregistered', (pluginName) => {
  console.log('Plugin unregistered:', pluginName)
})
```

## 调试插件

在开发环境中，你可以启用调试模式来查看插件的详细信息：

```typescript
const engine = createApp(App, {
  config: {
    debug: true, // 启用调试模式
  },
  plugins: [myPlugin],
})

// 在浏览器控制台中查看插件信息
console.log('Registered plugins:', engine.plugins.getAll())
```

通过插件系统，你可以轻松地扩展引擎功能，创建可重用的模块，并构建强大的应用架构。
