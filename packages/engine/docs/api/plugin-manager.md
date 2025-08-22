# 插件管理器 API

插件管理器负责管理插件的注册、卸载、依赖解析和生命周期。

## 接口定义

```typescript
interface PluginManager {
  // 插件注册
  register: (plugin: Plugin) => Promise<void>
  unregister: (name: string) => Promise<void>

  // 插件查询
  isRegistered: (name: string) => boolean
  get: (name: string) => Plugin | undefined
  getAll: () => Plugin[]

  // 依赖管理
  resolveDependencies: (plugins: Plugin[]) => Plugin[]
  checkDependencies: (plugin: Plugin) => boolean

  // 生命周期
  enable: (name: string) => Promise<void>
  disable: (name: string) => Promise<void>
  isEnabled: (name: string) => boolean

  // 插件信息
  getInfo: (name: string) => PluginInfo | undefined
  getStats: () => PluginStats

  // 事件
  on: (event: string, handler: Function) => () => void
  emit: (event: string, data?: any) => void
}
```

## 方法详解

### register(plugin: Plugin)

注册一个插件到引擎中。

**参数：**

- `plugin: Plugin` - 要注册的插件对象

**返回值：**

- `Promise<void>` - 注册完成的 Promise

**示例：**

```typescript
const myPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  install: (engine) => {
    console.log('插件安装完成')
  },
}

await engine.plugins.register(myPlugin)
```

**错误：**

- `PluginError` - 插件名称冲突或格式错误
- `DependencyError` - 依赖插件未找到

### unregister(name: string)

卸载指定名称的插件。

**参数：**

- `name: string` - 插件名称

**返回值：**

- `Promise<void>` - 卸载完成的 Promise

**示例：**

```typescript
await engine.plugins.unregister('my-plugin')
```

**注意：**

- 卸载插件会调用其 `uninstall` 方法（如果存在）
- 如果其他插件依赖此插件，卸载会失败

### isRegistered(name: string)

检查插件是否已注册。

**参数：**

- `name: string` - 插件名称

**返回值：**

- `boolean` - 是否已注册

**示例：**

```typescript
if (engine.plugins.isRegistered('my-plugin')) {
  console.log('插件已注册')
}
```

### get(name: string)

获取指定名称的插件实例。

**参数：**

- `name: string` - 插件名称

**返回值：**

- `Plugin | undefined` - 插件实例或 undefined

**示例：**

```typescript
const plugin = engine.plugins.get('my-plugin')
if (plugin) {
  console.log('插件版本:', plugin.version)
}
```

### getAll()

获取所有已注册的插件。

**返回值：**

- `Plugin[]` - 插件数组

**示例：**

```typescript
const allPlugins = engine.plugins.getAll()
console.log('已注册插件数量:', allPlugins.length)
```

### resolveDependencies(plugins: Plugin[])

解析插件依赖关系，返回正确的加载顺序。

**参数：**

- `plugins: Plugin[]` - 插件数组

**返回值：**

- `Plugin[]` - 按依赖顺序排列的插件数组

**示例：**

```typescript
const plugins = [pluginB, pluginA] // pluginB 依赖 pluginA
const resolved = engine.plugins.resolveDependencies(plugins)
// 返回: [pluginA, pluginB]
```

### checkDependencies(plugin: Plugin)

检查插件的依赖是否满足。

**参数：**

- `plugin: Plugin` - 要检查的插件

**返回值：**

- `boolean` - 依赖是否满足

**示例：**

```typescript
const canInstall = engine.plugins.checkDependencies(myPlugin)
if (!canInstall) {
  console.log('插件依赖不满足')
}
```

### enable(name: string)

启用指定的插件。

**参数：**

- `name: string` - 插件名称

**返回值：**

- `Promise<void>` - 启用完成的 Promise

**示例：**

```typescript
await engine.plugins.enable('my-plugin')
```

### disable(name: string)

禁用指定的插件。

**参数：**

- `name: string` - 插件名称

**返回值：**

- `Promise<void>` - 禁用完成的 Promise

**示例：**

```typescript
await engine.plugins.disable('my-plugin')
```

### isEnabled(name: string)

检查插件是否已启用。

**参数：**

- `name: string` - 插件名称

**返回值：**

- `boolean` - 是否已启用

**示例：**

```typescript
if (engine.plugins.isEnabled('my-plugin')) {
  console.log('插件已启用')
}
```

### getInfo(name: string)

获取插件的详细信息。

**参数：**

- `name: string` - 插件名称

**返回值：**

- `PluginInfo | undefined` - 插件信息或 undefined

**示例：**

```typescript
const info = engine.plugins.getInfo('my-plugin')
if (info) {
  console.log('插件信息:', info)
}
```

### getStats()

获取插件管理器的统计信息。

**返回值：**

- `PluginStats` - 统计信息

**示例：**

```typescript
const stats = engine.plugins.getStats()
console.log('插件统计:', stats)
```

## 类型定义

### Plugin

```typescript
interface Plugin {
  // 基本信息
  name: string
  version?: string
  description?: string
  author?: string

  // 依赖关系
  dependencies?: string[]
  peerDependencies?: string[]

  // 生命周期钩子
  install: (engine: Engine) => void | Promise<void>
  uninstall?: (engine: Engine) => void | Promise<void>

  // 配置
  config?: PluginConfig

  // 元数据
  meta?: Record<string, any>
}
```

### PluginConfig

```typescript
interface PluginConfig {
  enabled?: boolean
  priority?: number
  lazy?: boolean
  [key: string]: any
}
```

### PluginInfo

```typescript
interface PluginInfo {
  name: string
  version?: string
  description?: string
  author?: string
  enabled: boolean
  installed: boolean
  dependencies: string[]
  dependents: string[]
  installTime?: number
  loadTime?: number
  size?: number
}
```

### PluginStats

```typescript
interface PluginStats {
  total: number
  enabled: number
  disabled: number
  failed: number
  totalLoadTime: number
  averageLoadTime: number
  memoryUsage: number
}
```

## 事件

插件管理器会发出以下事件：

### plugin:registered

插件注册完成时触发。

**数据：**

```typescript
{
  plugin: Plugin
  loadTime: number
}
```

### plugin:unregistered

插件卸载完成时触发。

**数据：**

```typescript
{
  name: string
  plugin: Plugin
}
```

### plugin:enabled

插件启用时触发。

**数据：**

```typescript
{
  name: string
  plugin: Plugin
}
```

### plugin:disabled

插件禁用时触发。

**数据：**

```typescript
{
  name: string
  plugin: Plugin
}
```

### plugin:error

插件出错时触发。

**数据：**

```typescript
{
  name: string
  plugin: Plugin
  error: Error
  phase: 'install' | 'uninstall' | 'enable' | 'disable'
}
```

## 使用示例

### 基础插件注册

```typescript
// 定义插件
const loggerPlugin = {
  name: 'logger',
  version: '1.0.0',
  install: (engine) => {
    engine.logger.info('Logger plugin installed')
  },
}

// 注册插件
await engine.plugins.register(loggerPlugin)

// 检查插件状态
console.log('插件已注册:', engine.plugins.isRegistered('logger'))
console.log('插件已启用:', engine.plugins.isEnabled('logger'))
```

### 依赖插件

```typescript
// 基础插件
const basePlugin = {
  name: 'base',
  install: (engine) => {
    engine.state.set('base.ready', true)
  },
}

// 依赖插件
const dependentPlugin = {
  name: 'dependent',
  dependencies: ['base'],
  install: (engine) => {
    const baseReady = engine.state.get('base.ready')
    if (baseReady) {
      console.log('依赖插件安装成功')
    }
  },
}

// 批量注册（自动解析依赖顺序）
const plugins = [dependentPlugin, basePlugin]
const resolved = engine.plugins.resolveDependencies(plugins)

for (const plugin of resolved) {
  await engine.plugins.register(plugin)
}
```

### 异步插件

```typescript
const asyncPlugin = {
  name: 'async-plugin',
  install: async (engine) => {
    // 异步初始化
    const config = await fetch('/api/plugin-config').then(r => r.json())
    engine.state.set('async-plugin.config', config)

    console.log('异步插件安装完成')
  },

  uninstall: async (engine) => {
    // 异步清理
    await cleanup()
    engine.state.remove('async-plugin.config')
  },
}

await engine.plugins.register(asyncPlugin)
```

### 插件事件监听

```typescript
// 监听插件事件
engine.plugins.on('plugin:registered', ({ plugin, loadTime }) => {
  console.log(`插件 ${plugin.name} 注册完成，耗时 ${loadTime}ms`)
})

engine.plugins.on('plugin:error', ({ name, error, phase }) => {
  console.error(`插件 ${name} 在 ${phase} 阶段出错:`, error)
})

// 获取插件统计
const stats = engine.plugins.getStats()
console.log('插件统计:', stats)
```

### 动态插件管理

```typescript
// 动态加载插件
async function loadPlugin(pluginName: string) {
  try {
    const { default: plugin } = await import(`./plugins/${pluginName}`)
    await engine.plugins.register(plugin)
    console.log(`插件 ${pluginName} 加载成功`)
  }
  catch (error) {
    console.error(`插件 ${pluginName} 加载失败:`, error)
  }
}

// 动态卸载插件
async function unloadPlugin(pluginName: string) {
  if (engine.plugins.isRegistered(pluginName)) {
    await engine.plugins.unregister(pluginName)
    console.log(`插件 ${pluginName} 卸载成功`)
  }
}

// 插件热重载
async function reloadPlugin(pluginName: string) {
  await unloadPlugin(pluginName)
  await loadPlugin(pluginName)
}
```

## 最佳实践

1. **插件命名** - 使用描述性的名称，避免冲突
2. **版本管理** - 始终指定插件版本
3. **依赖声明** - 明确声明插件依赖
4. **错误处理** - 在插件中妥善处理错误
5. **资源清理** - 实现 uninstall 方法清理资源
6. **异步操作** - 合理使用异步插件避免阻塞
7. **配置验证** - 验证插件配置的有效性
