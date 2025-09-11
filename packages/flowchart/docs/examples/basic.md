# 基本使用示例

本页面展示了 LDesign Flowchart 的基本使用方法和常见场景。

## 创建基础编辑器

最简单的编辑器创建方式：

```typescript
import { FlowchartAPI } from '@ldesign/flowchart'

// 创建编辑器
const editor = FlowchartAPI.createEditor({
  container: '#flowchart-container',
  width: 800,
  height: 600
})
```

## 完整的HTML示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LDesign Flowchart 基础示例</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #722ED1;
            margin-bottom: 10px;
        }
        
        .controls {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        
        .btn {
            padding: 8px 16px;
            border: 2px solid #722ED1;
            background: #fff;
            color: #722ED1;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s;
        }
        
        .btn:hover {
            background: #722ED1;
            color: #fff;
        }
        
        .btn.primary {
            background: #722ED1;
            color: #fff;
        }
        
        .btn.primary:hover {
            background: #5e2aa7;
        }
        
        #flowchart-container {
            width: 100%;
            height: 600px;
            border: 2px solid #e5e5e5;
            border-radius: 8px;
            background: #fff;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .info-panel {
            margin-top: 20px;
            padding: 20px;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .info-panel h3 {
            color: #333;
            margin-bottom: 10px;
        }
        
        .code-block {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            padding: 12px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            overflow-x: auto;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>LDesign Flowchart 基础示例</h1>
            <p>体验简洁易用的审批流程图编辑器</p>
        </div>
        
        <div class="controls">
            <button class="btn primary" onclick="createEditor()">创建编辑器</button>
            <button class="btn" onclick="addBasicFlow()">添加基础流程</button>
            <button class="btn" onclick="addApprovalFlow()">添加审批流程</button>
            <button class="btn" onclick="addComplexFlow()">添加复杂流程</button>
            <button class="btn" onclick="clearAll()">清空画布</button>
            <button class="btn" onclick="exportData()">导出数据</button>
        </div>
        
        <div id="flowchart-container">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #666; text-align: center;">
                <p>点击"创建编辑器"开始使用</p>
                <p style="font-size: 14px; margin-top: 10px;">支持拖拽、连接、编辑等操作</p>
            </div>
        </div>
        
        <div class="info-panel">
            <h3>当前数据</h3>
            <div id="data-display">暂无数据</div>
            
            <h3>操作日志</h3>
            <div id="log-display" class="code-block">等待操作...</div>
        </div>
    </div>

    <script type="module">
        import { FlowchartAPI } from '@ldesign/flowchart'
        
        let editor = null
        
        // 日志记录
        function log(message) {
            const logDisplay = document.getElementById('log-display')
            const timestamp = new Date().toLocaleTimeString()
            logDisplay.textContent += `[${timestamp}] ${message}\n`
            logDisplay.scrollTop = logDisplay.scrollHeight
        }
        
        // 更新数据显示
        function updateDataDisplay() {
            if (!editor) return
            
            const data = editor.getFlowchartData()
            const dataDisplay = document.getElementById('data-display')
            dataDisplay.innerHTML = `
                <div class="code-block">
                    节点数量: ${data.nodes.length}<br>
                    连接线数量: ${data.edges.length}<br>
                    <details style="margin-top: 10px;">
                        <summary>查看详细数据</summary>
                        <pre style="margin-top: 10px; font-size: 11px;">${JSON.stringify(data, null, 2)}</pre>
                    </details>
                </div>
            `
        }
        
        // 创建编辑器
        window.createEditor = function() {
            const container = document.getElementById('flowchart-container')
            container.innerHTML = '' // 清空容器
            
            try {
                editor = FlowchartAPI.createEditor({
                    container: container,
                    width: container.offsetWidth,
                    height: container.offsetHeight,
                    background: { color: '#fafafa' },
                    grid: { visible: true, size: 20 },
                    plugins: {
                        minimap: { width: 180, height: 120 },
                        history: { maxSize: 30 },
                        export: { defaultFileName: 'basic-example' }
                    }
                })
                
                // 监听事件
                editor.on('node:click', (data) => {
                    log(`节点点击: ${data.text || data.type}`)
                })
                
                editor.on('edge:click', (data) => {
                    log(`连接线点击: ${data.text || 'unnamed'}`)
                })
                
                editor.on('data:change', () => {
                    log('数据已变化')
                    updateDataDisplay()
                })
                
                log('编辑器创建成功')
                updateDataDisplay()
                
            } catch (error) {
                log(`创建编辑器失败: ${error.message}`)
            }
        }
        
        // 添加基础流程
        window.addBasicFlow = function() {
            if (!editor) {
                alert('请先创建编辑器')
                return
            }
            
            try {
                // 创建节点
                const startNode = FlowchartAPI.createNode({
                    type: 'start',
                    x: 100,
                    y: 200,
                    text: '开始'
                })
                
                const processNode = FlowchartAPI.createNode({
                    type: 'process',
                    x: 300,
                    y: 200,
                    text: '处理任务'
                })
                
                const endNode = FlowchartAPI.createNode({
                    type: 'end',
                    x: 500,
                    y: 200,
                    text: '结束'
                })
                
                // 添加节点
                const startId = editor.addNode(startNode)
                const processId = editor.addNode(processNode)
                const endId = editor.addNode(endNode)
                
                // 创建连接
                const edge1 = FlowchartAPI.createEdge({
                    source: startId,
                    target: processId,
                    text: '开始处理'
                })
                
                const edge2 = FlowchartAPI.createEdge({
                    source: processId,
                    target: endId,
                    text: '完成'
                })
                
                editor.addEdge(edge1)
                editor.addEdge(edge2)
                
                log('基础流程添加成功')
                
            } catch (error) {
                log(`添加基础流程失败: ${error.message}`)
            }
        }
        
        // 添加审批流程
        window.addApprovalFlow = function() {
            if (!editor) {
                alert('请先创建编辑器')
                return
            }
            
            try {
                const template = FlowchartAPI.createApprovalTemplate({
                    title: '请假审批流程',
                    steps: ['申请提交', '直属领导审批', 'HR审批'],
                    layout: 'horizontal'
                })
                
                editor.setData(template)
                log('审批流程模板加载成功')
                
            } catch (error) {
                log(`添加审批流程失败: ${error.message}`)
            }
        }
        
        // 添加复杂流程
        window.addComplexFlow = function() {
            if (!editor) {
                alert('请先创建编辑器')
                return
            }
            
            try {
                // 清空现有数据
                editor.setData({ nodes: [], edges: [] })
                
                // 创建复杂流程节点
                const nodes = [
                    { type: 'start', x: 100, y: 150, text: '开始' },
                    { type: 'approval', x: 250, y: 150, text: '初审', properties: { approvers: ['张三'] } },
                    { type: 'condition', x: 400, y: 150, text: '金额判断' },
                    { type: 'approval', x: 550, y: 100, text: '高级审批', properties: { approvers: ['李四', '王五'] } },
                    { type: 'approval', x: 550, y: 200, text: '普通审批', properties: { approvers: ['赵六'] } },
                    { type: 'parallel-gateway', x: 700, y: 150, text: '并行处理' },
                    { type: 'process', x: 850, y: 100, text: '发送通知' },
                    { type: 'process', x: 850, y: 200, text: '更新状态' },
                    { type: 'end', x: 1000, y: 150, text: '结束' }
                ]
                
                const nodeIds = []
                nodes.forEach((nodeConfig, index) => {
                    const node = FlowchartAPI.createNode(nodeConfig)
                    const id = editor.addNode(node)
                    nodeIds.push(id)
                })
                
                // 创建连接
                const edges = [
                    { source: 0, target: 1, text: '提交' },
                    { source: 1, target: 2, text: '审批通过' },
                    { source: 2, target: 3, text: '金额>10000' },
                    { source: 2, target: 4, text: '金额<=10000' },
                    { source: 3, target: 5, text: '高级审批通过' },
                    { source: 4, target: 5, text: '普通审批通过' },
                    { source: 5, target: 6, text: '分支1' },
                    { source: 5, target: 7, text: '分支2' },
                    { source: 6, target: 8, text: '通知完成' },
                    { source: 7, target: 8, text: '状态更新完成' }
                ]
                
                edges.forEach(edgeConfig => {
                    const edge = FlowchartAPI.createEdge({
                        source: nodeIds[edgeConfig.source],
                        target: nodeIds[edgeConfig.target],
                        text: edgeConfig.text
                    })
                    editor.addEdge(edge)
                })
                
                log('复杂流程添加成功')
                
            } catch (error) {
                log(`添加复杂流程失败: ${error.message}`)
            }
        }
        
        // 清空画布
        window.clearAll = function() {
            if (!editor) {
                alert('请先创建编辑器')
                return
            }
            
            editor.setData({ nodes: [], edges: [] })
            log('画布已清空')
        }
        
        // 导出数据
        window.exportData = function() {
            if (!editor) {
                alert('请先创建编辑器')
                return
            }
            
            try {
                const data = editor.getFlowchartData()
                const dataStr = JSON.stringify(data, null, 2)
                
                // 下载文件
                const blob = new Blob([dataStr], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = 'flowchart-data.json'
                link.click()
                URL.revokeObjectURL(url)
                
                log('数据导出成功')
                
            } catch (error) {
                log(`导出数据失败: ${error.message}`)
            }
        }
        
        // 页面加载完成后的初始化
        document.addEventListener('DOMContentLoaded', () => {
            log('页面加载完成，可以开始使用')
        })
    </script>
</body>
</html>
```

## 核心功能演示

### 1. 节点操作

```typescript
// 添加不同类型的节点
const nodes = [
  FlowchartAPI.createNode({ type: 'start', x: 100, y: 100, text: '开始' }),
  FlowchartAPI.createNode({ type: 'approval', x: 300, y: 100, text: '审批' }),
  FlowchartAPI.createNode({ type: 'condition', x: 500, y: 100, text: '条件' }),
  FlowchartAPI.createNode({ type: 'end', x: 700, y: 100, text: '结束' })
]

// 批量添加节点
const nodeIds = nodes.map(node => editor.addNode(node))
```

### 2. 连接线操作

```typescript
// 创建连接线
const edges = [
  FlowchartAPI.createEdge({ source: nodeIds[0], target: nodeIds[1], text: '提交' }),
  FlowchartAPI.createEdge({ source: nodeIds[1], target: nodeIds[2], text: '通过' }),
  FlowchartAPI.createEdge({ source: nodeIds[2], target: nodeIds[3], text: '完成' })
]

// 批量添加连接线
edges.forEach(edge => editor.addEdge(edge))
```

### 3. 事件监听

```typescript
// 监听各种事件
editor.on('node:click', (data) => {
  console.log('节点被点击:', data)
})

editor.on('edge:click', (data) => {
  console.log('连接线被点击:', data)
})

editor.on('data:change', (data) => {
  console.log('数据发生变化:', data)
  // 自动保存
  localStorage.setItem('flowchart', JSON.stringify(data))
})

editor.on('node:add', (data) => {
  console.log('节点已添加:', data)
})

editor.on('node:delete', (data) => {
  console.log('节点已删除:', data)
})
```

### 4. 数据操作

```typescript
// 获取数据
const data = editor.getFlowchartData()

// 设置数据
editor.setData(newData)

// 验证数据
const validation = FlowchartAPI.validateData(data)
if (!validation.valid) {
  console.error('数据无效:', validation.errors)
}

// 转换为BPMN
const bpmn = FlowchartAPI.convertToBPMN(data)
```

## 常见问题

### Q: 如何自定义节点样式？

A: 可以通过节点的 `properties.style` 属性自定义样式：

```typescript
const customNode = FlowchartAPI.createNode({
  type: 'approval',
  x: 200,
  y: 200,
  text: '自定义样式',
  properties: {
    style: {
      fill: '#e3f2fd',
      stroke: '#1976d2',
      strokeWidth: 2
    }
  }
})
```

### Q: 如何保存和加载流程图？

A: 使用 `getFlowchartData()` 和 `setData()` 方法：

```typescript
// 保存
const data = editor.getFlowchartData()
localStorage.setItem('flowchart', JSON.stringify(data))

// 加载
const savedData = JSON.parse(localStorage.getItem('flowchart'))
editor.setData(savedData)
```

### Q: 如何禁用某些功能？

A: 在创建编辑器时配置相关选项：

```typescript
const editor = FlowchartAPI.createEditor({
  container: '#editor',
  readonly: true,        // 只读模式
  plugins: {
    history: false,      // 禁用历史记录
    export: false        // 禁用导出功能
  }
})
```
