# 节点类型

LDesign Flowchart 提供了 7 种专为审批流程设计的节点类型，覆盖了各种审批场景的需求。

## 节点类型概览

| 类型 | 名称 | 图标 | 用途 | 特性 |
|------|------|------|------|------|
| `start` | 开始节点 | ⭕ | 流程起始点 | 只能有出口，无入口 |
| `approval` | 审批节点 | 📋 | 审批处理 | 支持多人审批、状态跟踪 |
| `condition` | 条件节点 | ◆ | 条件判断 | 支持条件分支 |
| `end` | 结束节点 | ⭕ | 流程结束点 | 只能有入口，无出口 |
| `process` | 处理节点 | ▭ | 一般处理步骤 | 通用的处理节点 |
| `parallel-gateway` | 并行网关 | ◆ | 并行分支 | 分支和汇聚并行流程 |
| `exclusive-gateway` | 排他网关 | ◆ | 互斥分支 | 互斥条件选择 |

## 开始节点 (start)

流程的起始点，每个流程图必须有且只有一个开始节点。

### 特性
- ✅ 只能有出口连接
- ✅ 不能有入口连接
- ✅ 圆形外观
- ✅ 通常标记为"开始"

### 使用示例

```typescript
const startNode = FlowchartAPI.createNode({
  type: 'start',
  x: 100,
  y: 100,
  text: '开始'
})
```

## 审批节点 (approval)

专为审批流程设计的核心节点，支持复杂的审批逻辑。

### 特性
- ✅ 支持多人审批
- ✅ 支持并行审批
- ✅ 审批状态跟踪
- ✅ 审批意见记录
- ✅ 审批人配置
- ✅ 截止时间设置

### 审批状态
- `pending` - 待审批（黄色）
- `approved` - 已通过（绿色）
- `rejected` - 已拒绝（红色）
- `processing` - 审批中（蓝色）

### 使用示例

```typescript
const approvalNode = FlowchartAPI.createNode({
  type: 'approval',
  x: 300,
  y: 100,
  text: '部门经理审批',
  properties: {
    approvers: ['张三', '李四'],           // 审批人列表
    approvalType: 'any',                  // 审批类型：any(任一) | all(全部)
    deadline: '2025-12-31T23:59:59',     // 截止时间
    status: 'pending',                    // 当前状态
    priority: 'high',                     // 优先级
    description: '请审批员工请假申请'      // 描述
  }
})
```

## 条件节点 (condition)

用于流程中的条件判断，根据条件结果选择不同的流程分支。

### 特性
- ✅ 支持条件表达式
- ✅ 多分支输出
- ✅ 菱形外观
- ✅ 条件逻辑配置

### 使用示例

```typescript
const conditionNode = FlowchartAPI.createNode({
  type: 'condition',
  x: 500,
  y: 100,
  text: '请假天数判断',
  properties: {
    conditions: [
      {
        expression: 'days <= 3',
        label: '3天以内',
        output: 'short-leave'
      },
      {
        expression: 'days > 3',
        label: '超过3天',
        output: 'long-leave'
      }
    ]
  }
})
```

## 结束节点 (end)

流程的结束点，表示流程执行完毕。

### 特性
- ✅ 只能有入口连接
- ✅ 不能有出口连接
- ✅ 圆形外观
- ✅ 通常标记为"结束"

### 使用示例

```typescript
const endNode = FlowchartAPI.createNode({
  type: 'end',
  x: 700,
  y: 100,
  text: '结束'
})
```

## 处理节点 (process)

通用的处理步骤节点，用于表示各种处理操作。

### 特性
- ✅ 矩形外观
- ✅ 支持自定义处理逻辑
- ✅ 可配置处理参数

### 使用示例

```typescript
const processNode = FlowchartAPI.createNode({
  type: 'process',
  x: 400,
  y: 200,
  text: '发送通知',
  properties: {
    action: 'sendNotification',
    recipients: ['申请人', '审批人'],
    template: 'approval-result'
  }
})
```

## 并行网关 (parallel-gateway)

用于创建并行分支或汇聚并行流程。

### 特性
- ✅ 分支：一个输入，多个输出
- ✅ 汇聚：多个输入，一个输出
- ✅ 并行执行
- ✅ 菱形外观，内含"+"符号

### 使用示例

```typescript
// 并行分支
const parallelSplit = FlowchartAPI.createNode({
  type: 'parallel-gateway',
  x: 300,
  y: 150,
  text: '并行审批',
  properties: {
    gatewayType: 'split',
    branches: ['部门审批', 'HR审批', '财务审批']
  }
})

// 并行汇聚
const parallelJoin = FlowchartAPI.createNode({
  type: 'parallel-gateway',
  x: 600,
  y: 150,
  text: '汇聚',
  properties: {
    gatewayType: 'join',
    waitForAll: true  // 等待所有分支完成
  }
})
```

## 排他网关 (exclusive-gateway)

用于互斥条件选择，只能选择一个分支执行。

### 特性
- ✅ 互斥分支选择
- ✅ 基于条件的路由
- ✅ 菱形外观，内含"×"符号

### 使用示例

```typescript
const exclusiveGateway = FlowchartAPI.createNode({
  type: 'exclusive-gateway',
  x: 400,
  y: 150,
  text: '审批结果',
  properties: {
    conditions: [
      {
        expression: 'result === "approved"',
        label: '通过',
        default: false
      },
      {
        expression: 'result === "rejected"',
        label: '拒绝',
        default: false
      },
      {
        expression: 'true',
        label: '其他',
        default: true  // 默认分支
      }
    ]
  }
})
```

## 节点样式定制

每种节点类型都支持样式定制：

```typescript
const customNode = FlowchartAPI.createNode({
  type: 'approval',
  x: 200,
  y: 200,
  text: '自定义审批',
  properties: {
    style: {
      fill: '#e3f2fd',           // 填充色
      stroke: '#1976d2',         // 边框色
      strokeWidth: 2,            // 边框宽度
      fontSize: 14,              // 字体大小
      fontColor: '#333333'       // 字体颜色
    }
  }
})
```

## 最佳实践

### 1. 节点命名
- 使用清晰、简洁的节点名称
- 避免使用技术术语，使用业务语言
- 保持命名一致性

### 2. 流程设计
- 每个流程必须有开始和结束节点
- 避免创建无法到达的节点
- 合理使用并行和排他网关

### 3. 审批节点配置
- 明确指定审批人
- 设置合理的截止时间
- 配置适当的审批类型（任一/全部）

### 4. 条件节点设计
- 确保条件表达式的完整性
- 提供默认分支处理异常情况
- 使用清晰的条件描述
