# 原生 JavaScript 使用指南

本指南介绍如何在原生 JavaScript 项目中使用 @ldesign/flowchart 包，无需 Vue、React 等框架。

## 快速开始

### 1. 安装

```bash
npm install @ldesign/flowchart
```

### 2. 基本使用

```javascript
import { FlowchartEditor } from '@ldesign/flowchart'

// 创建编辑器实例
const editor = new FlowchartEditor({
  container: '#flowchart-container',
  width: 800,
  height: 600,
  // 禁用内置UI组件，使用纯原生JS
  toolbar: { visible: false },
  nodePanel: { visible: false },
  propertyPanel: { visible: false }
})

// 渲染编辑器
editor.render()
```

## 完整示例

### HTML 结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>原生 JS 流程图编辑器</title>
</head>
<body>
    <div class="toolbar">
        <button id="addStartNode">添加开始节点</button>
        <button id="addApprovalNode">添加审批节点</button>
        <button id="exportData">导出数据</button>
    </div>
    
    <div id="flowchart-container" style="width: 100%; height: 600px;"></div>
    
    <script type="module" src="main.js"></script>
</body>
</html>
```

### JavaScript 实现

```javascript
import { FlowchartEditor, FlowchartAPI } from '@ldesign/flowchart'

let editor = null
let nodeCounter = 0

// 初始化编辑器
function initEditor() {
  editor = new FlowchartEditor({
    container: '#flowchart-container',
    width: 800,
    height: 600,
    // 禁用内置UI，使用原生JS实现
    toolbar: { visible: false },
    nodePanel: { visible: false },
    propertyPanel: { visible: false },
    // 基础配置
    theme: 'default',
    background: { color: '#fafafa' },
    grid: { visible: true, size: 20 }
  })

  // 监听事件
  editor.on('node:click', (data) => {
    console.log('节点被点击:', data)
  })

  editor.on('data:change', () => {
    console.log('数据已更新')
  })

  // 渲染编辑器
  editor.render()
}

// 添加节点
function addStartNode() {
  const id = editor.addNode({
    type: 'start',
    x: 100 + Math.random() * 200,
    y: 100 + Math.random() * 200,
    text: '开始'
  })
  console.log('添加开始节点:', id)
}

function addApprovalNode() {
  const id = editor.addNode({
    type: 'approval',
    x: 300 + Math.random() * 200,
    y: 100 + Math.random() * 200,
    text: '审批节点',
    properties: {
      approver: '审批人',
      department: '部门',
      status: 'pending'
    }
  })
  console.log('添加审批节点:', id)
}

// 导出数据
function exportData() {
  const data = editor.getData()
  console.log('流程图数据:', data)
  
  // 下载为文件
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'flowchart.json'
  a.click()
  URL.revokeObjectURL(url)
}

// 绑定事件
function bindEvents() {
  document.getElementById('addStartNode').addEventListener('click', addStartNode)
  document.getElementById('addApprovalNode').addEventListener('click', addApprovalNode)
  document.getElementById('exportData').addEventListener('click', exportData)
}

// 初始化应用
function init() {
  bindEvents()
  initEditor()
}

// 启动
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
```

## 核心 API

### FlowchartEditor

#### 构造函数

```javascript
const editor = new FlowchartEditor(config)
```

**配置选项：**

- `container`: 容器选择器或DOM元素
- `width`: 画布宽度
- `height`: 画布高度
- `toolbar`: 工具栏配置 `{ visible: boolean }`
- `nodePanel`: 物料面板配置 `{ visible: boolean }`
- `propertyPanel`: 属性面板配置 `{ visible: boolean }`
- `theme`: 主题 `'default' | 'dark' | 'blue'`
- `background`: 背景配置 `{ color: string }`
- `grid`: 网格配置 `{ visible: boolean, size: number }`

#### 主要方法

```javascript
// 渲染编辑器
editor.render()

// 添加节点
const nodeId = editor.addNode({
  type: 'start',
  x: 100,
  y: 100,
  text: '开始',
  properties: {}
})

// 添加连线
const edgeId = editor.addEdge({
  sourceNodeId: 'node1',
  targetNodeId: 'node2',
  text: '连接'
})

// 获取数据
const data = editor.getData()

// 设置数据
editor.setData(data)

// 清空数据
editor.clearData()

// 切换主题
editor.setTheme('dark')

// 设置只读模式
editor.setReadonly(true)
```

#### 事件监听

```javascript
// 节点点击
editor.on('node:click', (data) => {
  console.log('节点被点击:', data)
})

// 边点击
editor.on('edge:click', (data) => {
  console.log('边被点击:', data)
})

// 数据变化
editor.on('data:change', (data) => {
  console.log('数据已更新:', data)
})

// 主题变化
editor.on('theme:change', (theme) => {
  console.log('主题已切换:', theme)
})
```

## 节点类型

支持以下节点类型：

### 基础节点
- `start`: 开始节点
- `approval`: 审批节点
- `condition`: 条件节点
- `process`: 处理节点
- `end`: 结束节点

### 任务节点
- `user-task`: 用户任务
- `service-task`: 服务任务
- `script-task`: 脚本任务
- `manual-task`: 手工任务

### 网关节点
- `parallel-gateway`: 并行网关
- `exclusive-gateway`: 排他网关
- `inclusive-gateway`: 包容网关
- `event-gateway`: 事件网关

### 事件节点
- `timer-event`: 定时事件
- `message-event`: 消息事件
- `signal-event`: 信号事件

## UMD 版本使用

如果不使用构建工具，可以直接使用 UMD 版本：

```html
<!-- 引入依赖 -->
<script src="https://unpkg.com/@logicflow/core@1.2.26/dist/logic-flow.js"></script>

<!-- 引入 LDesign Flowchart UMD 版本 -->
<script src="https://unpkg.com/@ldesign/flowchart/dist/index.umd.js"></script>

<script>
  // 使用全局变量
  const editor = new LDesignFlowchart.FlowchartEditor({
    container: '#flowchart-container',
    width: 800,
    height: 600
  })
  
  editor.render()
</script>
```

## 最佳实践

### 1. 错误处理

```javascript
try {
  const editor = new FlowchartEditor(config)
  editor.render()
} catch (error) {
  console.error('编辑器初始化失败:', error)
}
```

### 2. 响应式布局

```javascript
function resizeEditor() {
  const container = document.getElementById('flowchart-container')
  editor.resize(container.offsetWidth, container.offsetHeight)
}

window.addEventListener('resize', resizeEditor)
```

### 3. 数据持久化

```javascript
// 保存到 localStorage
function saveToLocal() {
  const data = editor.getData()
  localStorage.setItem('flowchart-data', JSON.stringify(data))
}

// 从 localStorage 加载
function loadFromLocal() {
  const data = localStorage.getItem('flowchart-data')
  if (data) {
    editor.setData(JSON.parse(data))
  }
}
```

## 示例项目

完整的示例项目位于：
- `packages/flowchart/examples/js-example/` - 基于 Vite 的原生 JS 示例
- `packages/flowchart/examples/umd-example.html` - UMD 版本示例

## 常见问题

### Q: 如何自定义节点样式？
A: 可以通过 CSS 覆盖默认样式，或者使用主题系统。

### Q: 如何实现节点拖拽？
A: 编辑器内置了节点拖拽功能，无需额外配置。

### Q: 如何添加自定义节点类型？
A: 可以通过扩展节点注册系统来添加自定义节点类型。

### Q: 如何处理大量节点的性能问题？
A: 编辑器基于 LogicFlow，支持虚拟化渲染，可以处理大量节点。
