# 快速开始

欢迎使用 LDesign Flowchart！这是一个基于 LogicFlow 的专业审批流程图编辑器组件。

## 安装

::: code-group

```bash [pnpm]
pnpm add @ldesign/flowchart
```

```bash [npm]
npm install @ldesign/flowchart
```

```bash [yarn]
yarn add @ldesign/flowchart
```

:::

## 基础使用

### 1. 创建编辑器

使用 `FlowchartAPI` 提供的简洁接口快速创建编辑器：

```typescript
import { FlowchartAPI } from '@ldesign/flowchart'

// 创建编辑器实例
const editor = FlowchartAPI.createEditor({
  container: '#flowchart-container', // 容器选择器或 HTMLElement
  width: 800,
  height: 600,
  plugins: {
    minimap: true,    // 启用小地图
    history: true,    // 启用历史记录
    export: true      // 启用导出功能
  }
})
```

### 2. 添加节点

```typescript
// 使用 API 快速创建节点
const startNode = FlowchartAPI.createNode({
  type: 'start',
  x: 100,
  y: 100,
  text: '开始'
})

const approvalNode = FlowchartAPI.createNode({
  type: 'approval',
  x: 300,
  y: 100,
  text: '部门审批',
  properties: {
    approvers: ['张三', '李四'],
    deadline: '2025-12-31',
    status: 'pending'
  }
})

// 添加到编辑器
const startId = editor.addNode(startNode)
const approvalId = editor.addNode(approvalNode)
```

### 3. 连接节点

```typescript
// 创建连接线
const edge = FlowchartAPI.createEdge({
  source: startId,
  target: approvalId,
  text: '提交申请'
})

editor.addEdge(edge)
```

### 4. 使用模板

快速创建审批流程模板：

```typescript
// 创建审批流程模板
const template = FlowchartAPI.createApprovalTemplate({
  title: '请假审批流程',
  steps: ['申请提交', '直属领导审批', 'HR审批', '总经理审批'],
  layout: 'horizontal' // 或 'vertical'
})

// 加载模板
editor.setData(template)
```

## 只读查看器

创建只读的流程图查看器：

```typescript
import { FlowchartAPI } from '@ldesign/flowchart'

// 创建查看器
const viewer = FlowchartAPI.createViewer({
  container: '#flowchart-viewer',
  data: flowchartData
})

// 设置执行状态
viewer.setExecutionState({
  currentNode: 'approval-node-2',
  completedNodes: ['start-node', 'approval-node-1'],
  failedNodes: []
})
```

## 事件处理

监听编辑器事件：

```typescript
// 监听节点点击事件
editor.on('node:click', (data) => {
  console.log('节点被点击:', data)
})

// 监听数据变化事件
editor.on('data:change', (data) => {
  console.log('数据已变化:', data)
  // 自动保存数据
  saveFlowchartData(data)
})

// 监听边点击事件
editor.on('edge:click', (data) => {
  console.log('连接线被点击:', data)
})
```

## 主题切换

```typescript
// 切换到暗色主题
editor.setTheme('dark')

// 切换到蓝色主题
editor.setTheme('blue')

// 获取主题管理器
const themeManager = editor.getThemeManager()

// 注册自定义主题
themeManager.registerTheme('custom', {
  name: 'custom',
  nodes: {
    start: { fill: '#ff6b6b', stroke: '#e55656' },
    approval: { fill: '#4ecdc4', stroke: '#45b7b8' }
    // ... 更多节点样式
  },
  edges: {
    'approval-edge': { stroke: '#6c5ce7', strokeWidth: 2 }
  },
  canvas: {
    backgroundColor: '#f8f9fa'
  }
})

// 使用自定义主题
themeManager.setTheme('custom')
```

## 插件使用

```typescript
// 获取插件管理器
const pluginManager = editor.getPluginManager()

// 检查插件状态
console.log('已安装的插件:', pluginManager.getInstalledPlugins())

// 手动安装插件
import { MiniMapPlugin } from '@ldesign/flowchart'
pluginManager.install(new MiniMapPlugin({
  width: 200,
  height: 150
}))
```

## 数据操作

```typescript
// 获取流程图数据
const data = editor.getFlowchartData()

// 验证数据
const validation = FlowchartAPI.validateData(data)
if (!validation.valid) {
  console.error('数据验证失败:', validation.errors)
}

// 导出为 BPMN
const bpmn = FlowchartAPI.convertToBPMN(data)

// 导出为图片（需要导出插件）
const exportPlugin = pluginManager.getPlugin('export')
if (exportPlugin) {
  exportPlugin.exportAs('png', 'my-flowchart.png')
}
```

## 完整示例

```html
<!DOCTYPE html>
<html>
<head>
  <title>LDesign Flowchart 示例</title>
  <style>
    #flowchart-container {
      width: 100%;
      height: 600px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <div id="flowchart-container"></div>
  
  <script type="module">
    import { FlowchartAPI } from '@ldesign/flowchart'
    
    // 创建编辑器
    const editor = FlowchartAPI.createEditor({
      container: '#flowchart-container',
      width: 800,
      height: 600,
      plugins: {
        minimap: true,
        history: true,
        export: true
      }
    })
    
    // 创建审批流程
    const template = FlowchartAPI.createApprovalTemplate({
      title: '请假审批流程',
      steps: ['申请提交', '直属领导审批', 'HR审批']
    })
    
    editor.setData(template)
    
    // 监听事件
    editor.on('node:click', (data) => {
      console.log('节点点击:', data)
    })
  </script>
</body>
</html>
```

## 下一步

- 了解更多 [节点类型](/guide/node-types)
- 查看 [API 文档](/api/flowchart-api)
- 浏览 [示例代码](/examples/basic)
- 学习 [插件开发](/plugins/development)
