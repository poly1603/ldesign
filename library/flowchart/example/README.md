# FlowChart Example - 真实的审批流程

展示如何使用真实的流程引擎数据结构来渲染审批流程图，支持完整的交互功能。

## 🚀 快速开始

```bash
npm install
npm run dev
```

浏览器会自动打开 `http://localhost:8000`

## 🎮 交互功能

### 1. 滚轮缩放
- 向上滚动：放大画布
- 向下滚动：缩小画布
- 缩放范围：10% - 300%
- 以鼠标位置为中心缩放

### 2. 拖拽画布
- 按住空白区域拖动：移动整个画布
- 松开鼠标：停止拖动
- 光标变化：抓取 → 抓取中

### 3. 拖动节点
- 按住节点拖动：改变节点位置
- 松开鼠标：固定位置
- 自动更新：连线自动跟随节点移动

### 4. 点击交互
- 点击节点：在控制台查看详细信息
- 点击连线：查看流转条件
- 不影响拖动操作

## 📊 数据结构说明

### 真实的流程定义格式

```json
{
  "processDefinitionId": "唯一标识",
  "processDefinitionKey": "流程键",
  "processDefinitionName": "流程名称",
  "version": 1,
  "nodes": [
    {
      "nodeId": "task_approval",
      "nodeName": "部门审批",
      "nodeType": "approval",
      "assignee": "${directLeader}",
      "actions": [
        {"action": "approve", "actionName": "同意", "next": "..."},
        {"action": "reject", "actionName": "拒绝", "next": "..."}
      ]
    }
  ]
}
```

### 自动生成连线

不需要手动定义 `edges`，系统会从节点的流转规则自动生成：

```javascript
// 从节点的 next 属性
"next": "next_node_id"

// 从审批动作
"actions": [
  {"action": "approve", "next": "node_a"},
  {"action": "reject", "next": "node_b"}
]

// 从条件分支
"conditions": [
  {"expression": "${amount > 5000}", "next": "node_a"},
  {"expression": "${amount <= 5000}", "next": "node_b"}
]
```

## 🎯 配置选项

```javascript
const flowChart = new FlowChart({
  container: '#flowchart-container',
  autoLayout: true,          // 自动布局
  nodeGap: 120,              // 节点间距
  levelGap: 150,             // 层级间距
  enableZoom: true,          // 启用滚轮缩放
  enablePan: true,           // 启用画布拖拽
  enableNodeDrag: true,      // 启用节点拖动
  onNodeClick: (node) => {}, // 节点点击回调
  onEdgeClick: (edge) => {}  // 连线点击回调
});
```

## 💡 使用技巧

### 1. 查看节点详情
点击任意节点，控制台会显示：
- 基本信息（ID、名称、类型）
- 处理人配置
- 表单字段
- 审批动作
- 条件分支
- 审核清单

### 2. 调整布局
- 拖动节点到合适位置
- 位置会实时保存到节点数据中
- 关闭自动布局以保持手动位置

### 3. 导出数据
```javascript
// 在控制台执行
const data = window.flowChart.toJSON();
console.log(JSON.stringify(data, null, 2));
```

### 4. 禁用某些功能
```javascript
const flowChart = new FlowChart({
  container: '#flowchart-container',
  enableZoom: false,       // 禁用缩放
  enablePan: false,        // 禁用拖拽
  enableNodeDrag: false,   // 禁用节点移动
});
```

## 🔧 调试工具

打开浏览器控制台：

```javascript
// 查看原始流程定义
window.processDefinition

// 查看转换后的图形数据
window.flowchartData

// 流程图实例
window.flowChart

// 获取所有节点
window.flowChart.getAllNodes()

// 获取所有边
window.flowChart.getAllEdges()

// 导出当前数据（包含位置）
window.flowChart.toJSON()

// 验证流程图
window.flowChart.validate()
```

## 🎨 自定义样式

### 修改节点样式

节点样式根据类型和状态自动设置：
- **类型样式**：不同节点类型有不同颜色
- **状态样式**：根据 `status` 字段动态变化

```javascript
{
  "nodeId": "task_approval",
  "status": "processing",  // pending, processing, approved, rejected, completed
  "style": {              // 可选：自定义样式
    "backgroundColor": "#fff",
    "borderColor": "#333",
    "textColor": "#000"
  }
}
```

### 修改连线样式

```javascript
{
  "edgeId": "edge_1",
  "style": {
    "strokeColor": "#666",
    "strokeWidth": 2,
    "strokeDasharray": "5,5"  // 虚线
  }
}
```

## 📚 真实应用场景

### 场景1：流程设计器

用户拖拽节点设计流程 → 导出流程定义 → 保存到数据库

```javascript
// 获取用户调整后的数据
const processDefinition = convertFlowChartToProcess(
  flowChart.toJSON()
);

// 保存
await saveProcessDefinition(processDefinition);
```

### 场景2：流程预览

从后端加载流程定义 → 渲染展示 → 用户查看

```javascript
// 加载
const response = await fetch('/api/process/get?id=xxx');
const processDefinition = await response.json();

// 渲染
const { nodes, edges } = convertWorkflowToFlowChart(processDefinition);
flowChart.load(nodes, edges);
```

### 场景3：流程监控

实时显示流程执行状态 → 更新节点状态

```javascript
// 更新节点状态
flowChart.updateNodeStatus('task_approval', NodeStatus.APPROVED);
```

## 🌟 最佳实践

1. **使用真实数据**：参考 `workflow-data.json` 的格式
2. **合理的间距**：nodeGap: 100-150, levelGap: 120-180
3. **启用交互**：提升用户体验
4. **添加回调**：处理业务逻辑
5. **验证数据**：使用 `validate()` 检查完整性

## 📝 示例流程说明

当前展示的是一个完整的**费用报销审批流程**：

1. 发起申请
2. 填写报销单（表单字段配置）
3. 部门主管审批（多审批动作）
4. 金额判断（条件网关）
   - ≤ 5000元 → 财务审核
   - > 5000元 → 总经理审批 → 财务审核
5. 财务付款
6. 完成通知
7. 流程结束

## 🔗 相关文档

- [../README.md](../README.md) - 完整API文档
- [../ARCHITECTURE.md](../ARCHITECTURE.md) - 架构说明
- [workflow-data.json](workflow-data.json) - 数据示例

---

享受交互式的流程图体验！🎉
