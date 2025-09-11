# 插件开发

LDesign Flowchart 提供了强大的插件系统，允许开发者扩展编辑器的功能。本指南将详细介绍如何开发自定义插件。

## 插件架构

插件系统基于以下核心概念：

- **BasePlugin** - 所有插件的基类
- **PluginManager** - 插件管理器
- **Plugin Interface** - 插件接口定义
- **生命周期钩子** - 插件安装/卸载钩子

## 创建基础插件

### 1. 继承 BasePlugin

```typescript
import { BasePlugin } from '@ldesign/flowchart'

export class MyCustomPlugin extends BasePlugin {
  // 插件名称（必须唯一）
  readonly name = 'my-custom-plugin'
  
  // 插件版本
  readonly version = '1.0.0'
  
  // 插件描述
  readonly description = '我的自定义插件'
  
  // 安装时调用
  protected onInstall(): void {
    console.log('插件安装成功')
    this.initializePlugin()
  }
  
  // 卸载时调用
  protected onUninstall(): void {
    console.log('插件卸载成功')
    this.cleanupPlugin()
  }
  
  private initializePlugin(): void {
    // 插件初始化逻辑
  }
  
  private cleanupPlugin(): void {
    // 插件清理逻辑
  }
}
```

### 2. 插件配置

插件可以接受配置参数：

```typescript
interface MyPluginConfig {
  enabled: boolean
  theme: 'light' | 'dark'
  position: 'top' | 'bottom'
}

export class MyCustomPlugin extends BasePlugin {
  readonly name = 'my-custom-plugin'
  
  private config: MyPluginConfig
  
  constructor(config: Partial<MyPluginConfig> = {}) {
    super()
    this.config = {
      enabled: true,
      theme: 'light',
      position: 'top',
      ...config
    }
  }
  
  protected onInstall(): void {
    if (!this.config.enabled) {
      console.log('插件已禁用')
      return
    }
    
    this.createUI()
  }
  
  private createUI(): void {
    // 根据配置创建UI
  }
}
```

## 插件功能开发

### 1. 访问编辑器实例

```typescript
export class MyCustomPlugin extends BasePlugin {
  readonly name = 'my-custom-plugin'
  
  protected onInstall(): void {
    // 获取编辑器实例
    const editor = this.getEditor()
    
    // 获取 LogicFlow 实例
    const lf = editor.getLogicFlow()
    
    // 监听事件
    lf.on('node:click', this.handleNodeClick.bind(this))
    lf.on('edge:click', this.handleEdgeClick.bind(this))
  }
  
  private handleNodeClick(data: any): void {
    console.log('节点点击:', data)
  }
  
  private handleEdgeClick(data: any): void {
    console.log('连接线点击:', data)
  }
  
  protected onUninstall(): void {
    const lf = this.getEditor().getLogicFlow()
    lf.off('node:click', this.handleNodeClick.bind(this))
    lf.off('edge:click', this.handleEdgeClick.bind(this))
  }
}
```

### 2. 创建UI组件

```typescript
export class ToolbarPlugin extends BasePlugin {
  readonly name = 'toolbar-plugin'
  
  private toolbarElement?: HTMLElement
  
  protected onInstall(): void {
    this.createToolbar()
  }
  
  private createToolbar(): void {
    const container = this.getEditor().getContainer()
    
    // 创建工具栏容器
    this.toolbarElement = document.createElement('div')
    this.toolbarElement.className = 'flowchart-toolbar'
    this.toolbarElement.style.cssText = `
      position: absolute;
      top: 10px;
      left: 10px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      z-index: 1000;
    `
    
    // 添加按钮
    this.addButton('保存', this.handleSave.bind(this))
    this.addButton('导出', this.handleExport.bind(this))
    this.addButton('清空', this.handleClear.bind(this))
    
    // 添加到容器
    container.appendChild(this.toolbarElement)
  }
  
  private addButton(text: string, onClick: () => void): void {
    const button = document.createElement('button')
    button.textContent = text
    button.style.cssText = `
      margin-right: 8px;
      padding: 4px 8px;
      border: 1px solid #722ED1;
      background: white;
      color: #722ED1;
      border-radius: 3px;
      cursor: pointer;
    `
    
    button.addEventListener('click', onClick)
    this.toolbarElement?.appendChild(button)
  }
  
  private handleSave(): void {
    const data = this.getEditor().getFlowchartData()
    localStorage.setItem('flowchart-data', JSON.stringify(data))
    alert('保存成功')
  }
  
  private handleExport(): void {
    const data = this.getEditor().getFlowchartData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'flowchart.json'
    link.click()
    URL.revokeObjectURL(url)
  }
  
  private handleClear(): void {
    if (confirm('确定要清空画布吗？')) {
      this.getEditor().setData({ nodes: [], edges: [] })
    }
  }
  
  protected onUninstall(): void {
    if (this.toolbarElement) {
      this.toolbarElement.remove()
      this.toolbarElement = undefined
    }
  }
}
```

### 3. 注册自定义节点

```typescript
export class CustomNodePlugin extends BasePlugin {
  readonly name = 'custom-node-plugin'
  
  protected onInstall(): void {
    this.registerCustomNodes()
  }
  
  private registerCustomNodes(): void {
    const lf = this.getEditor().getLogicFlow()
    
    // 注册自定义节点
    lf.register({
      type: 'custom-rect',
      view: CustomRectNode,
      model: CustomRectNodeModel
    })
  }
}

// 自定义节点视图
class CustomRectNode extends RectNode {
  getShape() {
    const { model } = this.props
    const { x, y, width, height } = model
    
    return h('g', {}, [
      h('rect', {
        x: x - width / 2,
        y: y - height / 2,
        width,
        height,
        fill: '#ff6b6b',
        stroke: '#e55656',
        strokeWidth: 2,
        rx: 8,
        ry: 8
      }),
      h('text', {
        x,
        y,
        textAnchor: 'middle',
        dominantBaseline: 'middle',
        fill: 'white',
        fontSize: 12
      }, model.text?.value || '')
    ])
  }
}

// 自定义节点模型
class CustomRectNodeModel extends RectNodeModel {
  constructor(data: any, graphModel: any) {
    super(data, graphModel)
    this.width = 120
    this.height = 60
  }
}
```

## 高级功能

### 1. 插件间通信

```typescript
export class PublisherPlugin extends BasePlugin {
  readonly name = 'publisher-plugin'
  
  protected onInstall(): void {
    // 发布事件
    this.emit('custom-event', { message: 'Hello from publisher' })
  }
}

export class SubscriberPlugin extends BasePlugin {
  readonly name = 'subscriber-plugin'
  
  protected onInstall(): void {
    // 监听其他插件的事件
    this.on('custom-event', this.handleCustomEvent.bind(this))
  }
  
  private handleCustomEvent(data: any): void {
    console.log('收到自定义事件:', data)
  }
}
```

### 2. 异步插件

```typescript
export class AsyncPlugin extends BasePlugin {
  readonly name = 'async-plugin'
  
  protected async onInstall(): Promise<void> {
    try {
      // 异步初始化
      await this.loadExternalResources()
      await this.initializeAsyncFeatures()
      
      console.log('异步插件安装完成')
    } catch (error) {
      console.error('异步插件安装失败:', error)
      throw error
    }
  }
  
  private async loadExternalResources(): Promise<void> {
    // 加载外部资源
    return new Promise((resolve) => {
      setTimeout(resolve, 1000) // 模拟异步操作
    })
  }
  
  private async initializeAsyncFeatures(): Promise<void> {
    // 初始化异步功能
    return new Promise((resolve) => {
      setTimeout(resolve, 500)
    })
  }
}
```

### 3. 插件配置持久化

```typescript
export class ConfigurablePlugin extends BasePlugin {
  readonly name = 'configurable-plugin'
  
  private config: any
  
  protected onInstall(): void {
    this.loadConfig()
    this.createConfigUI()
  }
  
  private loadConfig(): void {
    const saved = localStorage.getItem(`plugin-config-${this.name}`)
    this.config = saved ? JSON.parse(saved) : this.getDefaultConfig()
  }
  
  private saveConfig(): void {
    localStorage.setItem(`plugin-config-${this.name}`, JSON.stringify(this.config))
  }
  
  private getDefaultConfig(): any {
    return {
      enabled: true,
      theme: 'light',
      autoSave: false
    }
  }
  
  private createConfigUI(): void {
    // 创建配置界面
    const configPanel = document.createElement('div')
    // ... 配置界面代码
  }
  
  public updateConfig(newConfig: any): void {
    this.config = { ...this.config, ...newConfig }
    this.saveConfig()
    this.applyConfig()
  }
  
  private applyConfig(): void {
    // 应用配置更改
  }
}
```

## 插件使用

### 1. 安装插件

```typescript
import { FlowchartAPI } from '@ldesign/flowchart'
import { MyCustomPlugin } from './MyCustomPlugin'

// 创建编辑器
const editor = FlowchartAPI.createEditor({
  container: '#editor',
  width: 800,
  height: 600
})

// 获取插件管理器
const pluginManager = editor.getPluginManager()

// 安装插件
const myPlugin = new MyCustomPlugin({
  enabled: true,
  theme: 'dark'
})

pluginManager.install(myPlugin)
```

### 2. 批量安装插件

```typescript
const plugins = [
  new ToolbarPlugin(),
  new CustomNodePlugin(),
  new AsyncPlugin()
]

pluginManager.installBatch(plugins)
```

### 3. 插件管理

```typescript
// 检查插件状态
console.log('已安装的插件:', pluginManager.getInstalledPlugins())
console.log('已注册的插件:', pluginManager.getRegisteredPlugins())

// 获取插件实例
const toolbar = pluginManager.getPlugin('toolbar-plugin')

// 卸载插件
pluginManager.uninstall('toolbar-plugin')

// 卸载所有插件
pluginManager.uninstallAll()
```

## 最佳实践

### 1. 插件命名

- 使用描述性的名称
- 避免与内置插件冲突
- 使用一致的命名约定

### 2. 错误处理

```typescript
export class RobustPlugin extends BasePlugin {
  readonly name = 'robust-plugin'
  
  protected onInstall(): void {
    try {
      this.initializeFeatures()
    } catch (error) {
      console.error(`插件 ${this.name} 安装失败:`, error)
      // 清理已创建的资源
      this.cleanup()
      throw error
    }
  }
  
  private initializeFeatures(): void {
    // 功能初始化
  }
  
  private cleanup(): void {
    // 清理资源
  }
}
```

### 3. 性能优化

```typescript
export class OptimizedPlugin extends BasePlugin {
  readonly name = 'optimized-plugin'
  
  private debounceTimer?: number
  
  protected onInstall(): void {
    const lf = this.getEditor().getLogicFlow()
    
    // 使用防抖处理高频事件
    lf.on('node:move', this.debouncedHandler.bind(this))
  }
  
  private debouncedHandler(data: any): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
    
    this.debounceTimer = window.setTimeout(() => {
      this.handleNodeMove(data)
    }, 100)
  }
  
  private handleNodeMove(data: any): void {
    // 处理节点移动
  }
  
  protected onUninstall(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
  }
}
```

### 4. 插件文档

为插件编写清晰的文档：

```typescript
/**
 * 工具栏插件
 * 
 * 为流程图编辑器添加工具栏功能
 * 
 * @example
 * ```typescript
 * const toolbar = new ToolbarPlugin({
 *   position: 'top',
 *   buttons: ['save', 'export', 'clear']
 * })
 * 
 * pluginManager.install(toolbar)
 * ```
 */
export class ToolbarPlugin extends BasePlugin {
  // 插件实现
}
```

## 调试插件

### 1. 开发模式

```typescript
export class DebugPlugin extends BasePlugin {
  readonly name = 'debug-plugin'
  
  private isDebugMode = process.env.NODE_ENV === 'development'
  
  protected onInstall(): void {
    if (this.isDebugMode) {
      this.enableDebugMode()
    }
  }
  
  private enableDebugMode(): void {
    console.log(`[DEBUG] 插件 ${this.name} 已启用调试模式`)
    
    // 添加调试信息
    const lf = this.getEditor().getLogicFlow()
    lf.on('*', (event: string, data: any) => {
      console.log(`[DEBUG] 事件: ${event}`, data)
    })
  }
}
```

### 2. 插件测试

```typescript
// 插件测试示例
describe('MyCustomPlugin', () => {
  let editor: FlowchartEditor
  let plugin: MyCustomPlugin
  
  beforeEach(() => {
    editor = FlowchartAPI.createEditor({
      container: document.createElement('div')
    })
    plugin = new MyCustomPlugin()
  })
  
  it('应该正确安装插件', () => {
    const pluginManager = editor.getPluginManager()
    pluginManager.install(plugin)
    
    expect(pluginManager.isInstalled('my-custom-plugin')).toBe(true)
  })
  
  it('应该正确卸载插件', () => {
    const pluginManager = editor.getPluginManager()
    pluginManager.install(plugin)
    pluginManager.uninstall('my-custom-plugin')
    
    expect(pluginManager.isInstalled('my-custom-plugin')).toBe(false)
  })
})
```
