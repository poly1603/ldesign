# 节点类型

ApprovalFlow 提供了多种审批流程中常用的节点类型。

## 开始节点 (Start)

流程的起点，每个流程只能有一个开始节点。

```js
{
  id: 'start-1',
  type: 'start',
  name: '开始',
}
```

**特点**：
- 圆形节点，绿色背景
- 不能有输入连线
- 必须有输出连线

## 审批节点 (Approval)

用于审批操作的节点，支持多种审批模式。

```js
{
  id: 'approval-1',
  type: 'approval',
  name: '部门审批',
  approvalMode: 'single', // single | all | any | sequence
  approvers: [
    {
      id: '1',
      name: '张三',
      role: '部门经理',
      department: '技术部',
      avatar: 'https://...',
    },
  ],
}
```

### 审批模式

- **single**: 单人审批 - 只需一人审批
- **all**: 会签 - 所有人都需审批
- **any**: 或签 - 任意一人审批即可
- **sequence**: 顺序审批 - 按顺序依次审批

**特点**：
- 矩形节点，蓝色背景
- 必须配置至少一个审批人
- 支持多种审批模式

## 条件节点 (Condition)

根据条件表达式进行分支判断。

```js
{
  id: 'condition-1',
  type: 'condition',
  name: '金额判断',
  conditions: [
    {
      id: 'c1',
      name: '大于10000',
      expression: 'amount > 10000',
      description: '金额大于10000元',
      priority: 1,
    },
    {
      id: 'c2',
      name: '小于等于10000',
      expression: 'amount <= 10000',
      description: '金额小于等于10000元',
      priority: 2,
    },
  ],
}
```

**特点**：
- 菱形节点，橙色背景
- 必须配置条件表达式
- 支持多个分支
- 通过优先级控制条件判断顺序

## 并行节点 (Parallel)

用于并行执行多个分支。

```js
{
  id: 'parallel-1',
  type: 'parallel',
  name: '并行审批',
}
```

**特点**：
- 矩形节点，紫色背景
- 可以有多个输出连线
- 所有分支并行执行

## 抄送节点 (CC)

用于通知相关人员，不需要审批。

```js
{
  id: 'cc-1',
  type: 'cc',
  name: '抄送财务',
  ccUsers: [
    {
      id: '1',
      name: '李四',
      role: '财务',
      department: '财务部',
    },
  ],
}
```

**特点**：
- 矩形节点，青色背景
- 可以配置抄送人列表
- 不阻塞流程执行

## 结束节点 (End)

流程的终点，可以有多个结束节点。

```js
{
  id: 'end-1',
  type: 'end',
  name: '结束',
}
```

**特点**：
- 圆形节点，红色背景
- 不能有输出连线
- 必须有输入连线

## 节点通用属性

所有节点都支持以下通用属性：

```typescript
interface NodeData {
  // 必填属性
  id: string;          // 节点ID
  type: string;        // 节点类型
  name: string;        // 节点名称

  // 可选属性
  description?: string;              // 节点描述
  properties?: Record<string, any>;  // 自定义属性
}
```

## 自定义属性

你可以通过 `properties` 字段添加自定义属性：

```js
{
  id: 'approval-1',
  type: 'approval',
  name: '部门审批',
  properties: {
    timeout: 24 * 60 * 60 * 1000,  // 超时时间（毫秒）
    reminder: true,                 // 是否发送提醒
    reminderTime: 2 * 60 * 60 * 1000, // 提醒时间
    customData: {
      // 其他自定义数据
    },
  },
}
```
