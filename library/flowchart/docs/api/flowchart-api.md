# FlowchartAPI

`FlowchartAPI` 是 LDesign Flowchart 的核心 API 类，提供了简洁易用的静态方法来创建和管理流程图。

## 静态方法

### createEditor()

创建流程图编辑器实例。

```typescript
static createEditor(options: CreateEditorOptions): FlowchartEditor
```

#### 参数

- `options: CreateEditorOptions` - 编辑器配置选项

```typescript
interface CreateEditorOptions extends Partial<FlowchartEditorConfig> {
  /** 容器元素或选择器 */
  container: string | HTMLElement
  /** 是否启用插件 */
  plugins?: {
    /** 小地图插件 */
    minimap?: boolean | object
    /** 历史记录插件 */
    history?: boolean | object
    /** 导出插件 */
    export?: boolean | object
  }
}
```

#### 示例

```typescript
// 基础用法
const editor = FlowchartAPI.createEditor({
  container: '#editor',
  width: 800,
  height: 600
})

// 启用插件
const editor = FlowchartAPI.createEditor({
  container: document.getElementById('editor'),
  width: 800,
  height: 600,
  plugins: {
    minimap: true,
    history: { maxSize: 50 },
    export: { defaultFileName: 'my-flowchart' }
  }
})
```

### createViewer()

创建只读的流程图查看器实例。

```typescript
static createViewer(options: CreateViewerOptions): FlowchartViewer
```

#### 参数

- `options: CreateViewerOptions` - 查看器配置选项

```typescript
interface CreateViewerOptions extends Partial<FlowchartViewerConfig> {
  /** 容器元素或选择器 */
  container: string | HTMLElement
}
```

#### 示例

```typescript
const viewer = FlowchartAPI.createViewer({
  container: '#viewer',
  data: flowchartData,
  readonly: true
})
```

### createNode()

快速创建节点配置对象。

```typescript
static createNode(options: CreateNodeOptions): ApprovalNodeConfig
```

#### 参数

- `options: CreateNodeOptions` - 节点创建配置

```typescript
interface CreateNodeOptions {
  /** 节点类型 */
  type: ApprovalNodeType
  /** X 坐标 */
  x: number
  /** Y 坐标 */
  y: number
  /** 节点文本 */
  text?: string
  /** 节点属性 */
  properties?: Record<string, any>
}
```

#### 示例

```typescript
// 创建开始节点
const startNode = FlowchartAPI.createNode({
  type: 'start',
  x: 100,
  y: 100,
  text: '开始'
})

// 创建审批节点
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
```

### createEdge()

快速创建连接线配置对象。

```typescript
static createEdge(options: CreateEdgeOptions): ApprovalEdgeConfig
```

#### 参数

- `options: CreateEdgeOptions` - 连接线创建配置

```typescript
interface CreateEdgeOptions {
  /** 源节点 ID */
  source: string
  /** 目标节点 ID */
  target: string
  /** 边文本 */
  text?: string
  /** 边属性 */
  properties?: Record<string, any>
}
```

#### 示例

```typescript
const edge = FlowchartAPI.createEdge({
  source: 'node-1',
  target: 'node-2',
  text: '同意',
  properties: {
    condition: 'approved === true'
  }
})
```

### createApprovalTemplate()

创建审批流程模板。

```typescript
static createApprovalTemplate(options: {
  title?: string
  steps: string[]
  layout?: 'horizontal' | 'vertical'
}): FlowchartData
```

#### 参数

- `options.title?: string` - 流程标题
- `options.steps: string[]` - 审批步骤列表
- `options.layout?: 'horizontal' | 'vertical'` - 布局方向，默认 'horizontal'

#### 示例

```typescript
// 水平布局
const template = FlowchartAPI.createApprovalTemplate({
  title: '请假审批流程',
  steps: ['申请提交', '直属领导审批', 'HR审批', '总经理审批'],
  layout: 'horizontal'
})

// 垂直布局
const template = FlowchartAPI.createApprovalTemplate({
  steps: ['申请', '初审', '复审', '终审'],
  layout: 'vertical'
})
```

### validateData()

验证流程图数据的有效性。

```typescript
static validateData(data: FlowchartData): { valid: boolean; errors: string[] }
```

#### 参数

- `data: FlowchartData` - 要验证的流程图数据

#### 返回值

- `valid: boolean` - 是否验证通过
- `errors: string[]` - 错误信息列表

#### 示例

```typescript
const data = editor.getFlowchartData()
const validation = FlowchartAPI.validateData(data)

if (validation.valid) {
  console.log('数据验证通过')
} else {
  console.error('验证失败:', validation.errors)
  // 可能的错误：
  // - "节点 0 缺少 ID"
  // - "节点 ID "node1" 重复"
  // - "边 0 源节点 "nonexistent" 不存在"
}
```

### convertToBPMN()

将流程图数据转换为 BPMN XML 格式。

```typescript
static convertToBPMN(data: FlowchartData): string
```

#### 参数

- `data: FlowchartData` - 流程图数据

#### 返回值

- `string` - BPMN XML 字符串

#### 示例

```typescript
const data = editor.getFlowchartData()
const bpmn = FlowchartAPI.convertToBPMN(data)

// 下载 BPMN 文件
const blob = new Blob([bpmn], { type: 'application/xml' })
const url = URL.createObjectURL(blob)
const link = document.createElement('a')
link.href = url
link.download = 'flowchart.bpmn'
link.click()
```

### getVersion()

获取当前版本号。

```typescript
static getVersion(): string
```

#### 示例

```typescript
const version = FlowchartAPI.getVersion()
console.log('当前版本:', version) // "1.0.0"
```

### getSupportedNodeTypes()

获取支持的节点类型列表。

```typescript
static getSupportedNodeTypes(): ApprovalNodeType[]
```

#### 返回值

- `ApprovalNodeType[]` - 支持的节点类型数组

#### 示例

```typescript
const nodeTypes = FlowchartAPI.getSupportedNodeTypes()
console.log('支持的节点类型:', nodeTypes)
// ['start', 'approval', 'condition', 'end', 'process', 'parallel-gateway', 'exclusive-gateway']
```

## 类型定义

### ApprovalNodeType

```typescript
type ApprovalNodeType = 
  | 'start'              // 开始节点
  | 'approval'           // 审批节点
  | 'condition'          // 条件节点
  | 'end'                // 结束节点
  | 'process'            // 处理节点
  | 'parallel-gateway'   // 并行网关
  | 'exclusive-gateway'  // 排他网关
```

### FlowchartData

```typescript
interface FlowchartData {
  nodes: ApprovalNodeConfig[]
  edges: ApprovalEdgeConfig[]
}
```

### ApprovalNodeConfig

```typescript
interface ApprovalNodeConfig {
  id?: string
  type: ApprovalNodeType
  x: number
  y: number
  text: string
  properties: Record<string, any>
}
```

### ApprovalEdgeConfig

```typescript
interface ApprovalEdgeConfig {
  id?: string
  sourceNodeId: string
  targetNodeId: string
  text: string
  properties: Record<string, any>
}
```

## 最佳实践

### 1. 错误处理

```typescript
try {
  const editor = FlowchartAPI.createEditor({
    container: '#editor',
    width: 800,
    height: 600
  })
} catch (error) {
  console.error('创建编辑器失败:', error.message)
  // 处理错误，如显示错误提示
}
```

### 2. 数据验证

```typescript
// 在保存数据前验证
function saveFlowchart(data: FlowchartData) {
  const validation = FlowchartAPI.validateData(data)
  if (!validation.valid) {
    alert('流程图数据无效: ' + validation.errors.join(', '))
    return
  }
  
  // 保存数据
  localStorage.setItem('flowchart', JSON.stringify(data))
}
```

### 3. 插件配置

```typescript
// 根据需要配置插件
const editor = FlowchartAPI.createEditor({
  container: '#editor',
  plugins: {
    // 小地图：仅在大型流程图时启用
    minimap: data.nodes.length > 10,
    // 历史记录：根据用户权限决定
    history: user.canEdit,
    // 导出：根据功能需求决定
    export: features.includes('export')
  }
})
```
