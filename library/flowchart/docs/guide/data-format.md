# 数据格式

ApprovalFlow 使用标准的 JSON 格式来表示流程图数据。

## 数据结构

流程图数据包含两个主要部分：

```typescript
interface FlowChartData {
  nodes: NodeData[];  // 节点列表
  edges: EdgeData[];  // 边列表
}
```

## 节点数据

### 基础结构

```typescript
interface NodeData {
  id: string;                      // 节点ID（必填）
  type: ApprovalNodeType;          // 节点类型（必填）
  name: string;                    // 节点名称（必填）
  description?: string;            // 节点描述（可选）
  approvalMode?: ApprovalMode;     // 审批模式（审批节点）
  approvers?: ApproverConfig[];    // 审批人列表（审批节点）
  conditions?: ConditionConfig[];  // 条件列表（条件节点）
  ccUsers?: ApproverConfig[];      // 抄送人列表（抄送节点）
  properties?: Record<string, any>; // 自定义属性（可选）
}
```

### 开始节点

```json
{
  "id": "start-1",
  "type": "start",
  "name": "开始"
}
```

### 审批节点

```json
{
  "id": "approval-1",
  "type": "approval",
  "name": "部门审批",
  "description": "部门经理审批",
  "approvalMode": "single",
  "approvers": [
    {
      "id": "user-1",
      "name": "张三",
      "role": "部门经理",
      "department": "技术部",
      "avatar": "https://example.com/avatar/zhangsan.jpg"
    }
  ]
}
```

审批模式 (`approvalMode`):
- `single`: 单人审批
- `all`: 会签（所有人）
- `any`: 或签（任意一人）
- `sequence`: 顺序审批

### 条件节点

```json
{
  "id": "condition-1",
  "type": "condition",
  "name": "金额判断",
  "conditions": [
    {
      "id": "c1",
      "name": "大于10000",
      "expression": "amount > 10000",
      "description": "金额大于10000元走领导审批",
      "priority": 1
    },
    {
      "id": "c2",
      "name": "小于等于10000",
      "expression": "amount <= 10000",
      "description": "金额小于等于10000元走快速通道",
      "priority": 2
    }
  ]
}
```

### 并行节点

```json
{
  "id": "parallel-1",
  "type": "parallel",
  "name": "并行审批",
  "description": "财务和法务同时审批"
}
```

### 抄送节点

```json
{
  "id": "cc-1",
  "type": "cc",
  "name": "抄送财务",
  "ccUsers": [
    {
      "id": "user-2",
      "name": "李四",
      "role": "财务",
      "department": "财务部"
    }
  ]
}
```

### 结束节点

```json
{
  "id": "end-1",
  "type": "end",
  "name": "结束"
}
```

## 边数据

### 基础结构

```typescript
interface EdgeData {
  id: string;              // 边ID（必填）
  sourceNodeId: string;    // 源节点ID（必填）
  targetNodeId: string;    // 目标节点ID（必填）
  name?: string;           // 边名称（可选）
  condition?: string;      // 条件表达式（可选）
  properties?: Record<string, any>; // 自定义属性（可选）
}
```

### 普通连线

```json
{
  "id": "edge-1",
  "sourceNodeId": "start-1",
  "targetNodeId": "approval-1"
}
```

### 条件连线

```json
{
  "id": "edge-2",
  "sourceNodeId": "condition-1",
  "targetNodeId": "approval-high",
  "name": "大于10000",
  "condition": "amount > 10000"
}
```

## 完整示例

以下是一个完整的请假审批流程示例：

```json
{
  "nodes": [
    {
      "id": "start-1",
      "type": "start",
      "name": "开始"
    },
    {
      "id": "condition-1",
      "type": "condition",
      "name": "请假天数判断",
      "conditions": [
        {
          "id": "c1",
          "name": "3天以内",
          "expression": "days <= 3",
          "priority": 1
        },
        {
          "id": "c2",
          "name": "超过3天",
          "expression": "days > 3",
          "priority": 2
        }
      ]
    },
    {
      "id": "approval-1",
      "type": "approval",
      "name": "部门经理审批",
      "approvalMode": "single",
      "approvers": [
        {
          "id": "manager-1",
          "name": "张三",
          "role": "部门经理"
        }
      ]
    },
    {
      "id": "approval-2",
      "type": "approval",
      "name": "总经理审批",
      "approvalMode": "single",
      "approvers": [
        {
          "id": "gm-1",
          "name": "李四",
          "role": "总经理"
        }
      ]
    },
    {
      "id": "cc-1",
      "type": "cc",
      "name": "抄送HR",
      "ccUsers": [
        {
          "id": "hr-1",
          "name": "王五",
          "role": "HR"
        }
      ]
    },
    {
      "id": "end-1",
      "type": "end",
      "name": "结束"
    }
  ],
  "edges": [
    {
      "id": "e1",
      "sourceNodeId": "start-1",
      "targetNodeId": "condition-1"
    },
    {
      "id": "e2",
      "sourceNodeId": "condition-1",
      "targetNodeId": "approval-1",
      "name": "3天以内",
      "condition": "days <= 3"
    },
    {
      "id": "e3",
      "sourceNodeId": "condition-1",
      "targetNodeId": "approval-2",
      "name": "超过3天",
      "condition": "days > 3"
    },
    {
      "id": "e4",
      "sourceNodeId": "approval-1",
      "targetNodeId": "cc-1"
    },
    {
      "id": "e5",
      "sourceNodeId": "approval-2",
      "targetNodeId": "cc-1"
    },
    {
      "id": "e6",
      "sourceNodeId": "cc-1",
      "targetNodeId": "end-1"
    }
  ]
}
```

## 数据导入导出

### 导出数据

```js
// 获取流程图数据
const data = editor.getData();

// 导出为 JSON 字符串
const json = JSON.stringify(data, null, 2);

// 下载为文件
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'flowchart.json';
a.click();
```

### 导入数据

```js
// 从 JSON 字符串导入
const json = '{"nodes":[],"edges":[]}';
const data = JSON.parse(json);
editor.setData(data);

// 从文件导入
const input = document.createElement('input');
input.type = 'file';
input.accept = '.json';
input.onchange = async (e) => {
  const file = e.target.files[0];
  const text = await file.text();
  const data = JSON.parse(text);
  editor.setData(data);
};
input.click();
```

## 数据验证

在导入数据之前，建议进行验证：

```js
function validateFlowData(data) {
  // 检查必填字段
  if (!data.nodes || !Array.isArray(data.nodes)) {
    throw new Error('nodes 必须是数组');
  }
  if (!data.edges || !Array.isArray(data.edges)) {
    throw new Error('edges 必须是数组');
  }

  // 检查节点
  data.nodes.forEach(node => {
    if (!node.id || !node.type || !node.name) {
      throw new Error('节点缺少必填字段');
    }
  });

  // 检查边
  data.edges.forEach(edge => {
    if (!edge.id || !edge.sourceNodeId || !edge.targetNodeId) {
      throw new Error('边缺少必填字段');
    }
  });

  return true;
}

// 使用验证
try {
  validateFlowData(data);
  editor.setData(data);
} catch (error) {
  console.error('数据验证失败:', error.message);
}
```

## 下一步

- [验证规则](/guide/validation) - 了解流程验证
- [导入导出](/guide/import-export) - 了解导入导出功能
