/**
 * 节点相关类型定义
 * 定义各种节点类型的数据结构和接口
 */

import type { NodeData, Point, Size, Style, Renderable, Selectable, Draggable, EventEmitter } from './core.js';

/**
 * 节点类型枚举
 */
export enum NodeType {
  /** 开始节点 */
  START = 'start',
  /** 结束节点 */
  END = 'end',
  /** 处理节点 */
  PROCESS = 'process',
  /** 决策节点 */
  DECISION = 'decision',
  /** 审批节点 */
  APPROVAL = 'approval',
  /** 子流程节点 */
  SUBPROCESS = 'subprocess',
  /** 并行网关 */
  PARALLEL_GATEWAY = 'parallel-gateway',
  /** 排他网关 */
  EXCLUSIVE_GATEWAY = 'exclusive-gateway',
  /** 包容网关 */
  INCLUSIVE_GATEWAY = 'inclusive-gateway',
  /** 事件节点 */
  EVENT = 'event',
  /** 任务节点 */
  TASK = 'task',
  /** 用户任务 */
  USER_TASK = 'user-task',
  /** 服务任务 */
  SERVICE_TASK = 'service-task',
  /** 脚本任务 */
  SCRIPT_TASK = 'script-task',
  /** 手工任务 */
  MANUAL_TASK = 'manual-task'
}

/**
 * 端口位置枚举
 */
export enum PortPosition {
  /** 顶部 */
  TOP = 'top',
  /** 右侧 */
  RIGHT = 'right',
  /** 底部 */
  BOTTOM = 'bottom',
  /** 左侧 */
  LEFT = 'left'
}

/**
 * 端口接口
 */
export interface Port {
  /** 端口ID */
  id: string;
  /** 端口位置 */
  position: PortPosition;
  /** 相对偏移（0-1之间的比例） */
  offset?: number;
  /** 端口标签 */
  label?: string;
  /** 是否可连接 */
  connectable?: boolean;
  /** 最大连接数（-1表示无限制） */
  maxConnections?: number;
  /** 当前连接数 */
  currentConnections?: number;
  /** 端口样式 */
  style?: Style;
}

/**
 * 节点状态枚举
 */
export enum NodeStatus {
  /** 未开始 */
  PENDING = 'pending',
  /** 进行中 */
  RUNNING = 'running',
  /** 已完成 */
  COMPLETED = 'completed',
  /** 已跳过 */
  SKIPPED = 'skipped',
  /** 失败 */
  FAILED = 'failed',
  /** 已取消 */
  CANCELLED = 'cancelled',
  /** 等待中 */
  WAITING = 'waiting',
  /** 暂停 */
  PAUSED = 'paused'
}

/**
 * 审批人信息
 */
export interface Approver {
  /** 用户ID */
  id: string;
  /** 用户名 */
  name: string;
  /** 用户头像 */
  avatar?: string;
  /** 用户角色 */
  role?: string;
  /** 部门 */
  department?: string;
}

/**
 * 审批配置
 */
export interface ApprovalConfig {
  /** 审批类型：单人审批、多人审批、会签、或签 */
  type: 'single' | 'multiple' | 'all' | 'any';
  /** 审批人列表 */
  approvers: Approver[];
  /** 是否允许委托 */
  allowDelegate?: boolean;
  /** 是否允许加签 */
  allowAddSign?: boolean;
  /** 超时时间（小时） */
  timeout?: number;
  /** 超时处理方式 */
  timeoutAction?: 'auto-approve' | 'auto-reject' | 'escalate';
  /** 升级处理人 */
  escalateApprovers?: Approver[];
}

/**
 * 条件配置
 */
export interface ConditionConfig {
  /** 条件表达式 */
  expression: string;
  /** 条件描述 */
  description?: string;
  /** 条件变量 */
  variables?: Record<string, any>;
}

/**
 * 基础节点接口
 */
export interface BaseNode extends Renderable, Selectable, Draggable, EventEmitter {
  /** 节点ID */
  id: string;
  /** 节点类型 */
  type: NodeType;
  /** 节点位置 */
  position: Point;
  /** 节点尺寸 */
  size: Size;
  /** 节点标签 */
  label: string;
  /** 节点样式 */
  style: Style;
  /** 节点端口 */
  ports: Port[];
  /** 节点状态 */
  status: NodeStatus;
  /** 是否可见 */
  visible: boolean;
  /** 是否锁定 */
  locked: boolean;
  /** 自定义属性 */
  properties: Record<string, any>;
  
  /** 更新节点数据 */
  updateData(data: Partial<NodeData>): void;
  /** 获取节点数据 */
  getData(): NodeData;
  /** 添加端口 */
  addPort(port: Port): void;
  /** 移除端口 */
  removePort(portId: string): void;
  /** 获取端口 */
  getPort(portId: string): Port | undefined;
  /** 获取端口在画布上的绝对位置 */
  getPortPosition(portId: string): Point | undefined;
  /** 克隆节点 */
  clone(): BaseNode;
  /** 销毁节点 */
  destroy(): void;
}

/**
 * 开始节点数据
 */
export interface StartNodeData extends NodeData {
  type: NodeType.START;
  /** 流程发起人 */
  initiator?: Approver;
  /** 发起条件 */
  startCondition?: ConditionConfig;
}

/**
 * 结束节点数据
 */
export interface EndNodeData extends NodeData {
  type: NodeType.END;
  /** 结束类型 */
  endType?: 'normal' | 'terminate' | 'error' | 'cancel';
  /** 结束消息 */
  endMessage?: string;
}

/**
 * 处理节点数据
 */
export interface ProcessNodeData extends NodeData {
  type: NodeType.PROCESS;
  /** 处理逻辑描述 */
  processLogic?: string;
  /** 执行人 */
  executor?: Approver;
  /** 预计耗时（分钟） */
  estimatedDuration?: number;
}

/**
 * 决策节点数据
 */
export interface DecisionNodeData extends NodeData {
  type: NodeType.DECISION;
  /** 决策条件列表 */
  conditions: ConditionConfig[];
  /** 默认分支 */
  defaultBranch?: string;
}

/**
 * 审批节点数据
 */
export interface ApprovalNodeData extends NodeData {
  type: NodeType.APPROVAL;
  /** 审批配置 */
  approvalConfig: ApprovalConfig;
  /** 审批表单字段 */
  formFields?: Array<{
    name: string;
    label: string;
    type: string;
    required?: boolean;
    options?: any[];
  }>;
}

/**
 * 任务节点数据
 */
export interface TaskNodeData extends NodeData {
  type: NodeType.TASK | NodeType.USER_TASK | NodeType.SERVICE_TASK | NodeType.SCRIPT_TASK | NodeType.MANUAL_TASK;
  /** 任务配置 */
  taskConfig?: {
    /** 任务类型 */
    taskType: string;
    /** 任务参数 */
    parameters?: Record<string, any>;
    /** 任务脚本（脚本任务） */
    script?: string;
    /** 服务地址（服务任务） */
    serviceUrl?: string;
    /** 表单定义（用户任务） */
    formDefinition?: any;
  };
  /** 执行人 */
  assignee?: Approver;
  /** 候选人 */
  candidates?: Approver[];
}

/**
 * 网关节点数据
 */
export interface GatewayNodeData extends NodeData {
  type: NodeType.PARALLEL_GATEWAY | NodeType.EXCLUSIVE_GATEWAY | NodeType.INCLUSIVE_GATEWAY;
  /** 网关条件 */
  gatewayConditions?: ConditionConfig[];
}

/**
 * 节点数据联合类型
 */
export type AnyNodeData = 
  | StartNodeData 
  | EndNodeData 
  | ProcessNodeData 
  | DecisionNodeData 
  | ApprovalNodeData 
  | TaskNodeData 
  | GatewayNodeData;

/**
 * 节点工厂接口
 */
export interface NodeFactory {
  /** 创建节点 */
  createNode(type: NodeType, data: Partial<NodeData>): BaseNode;
  /** 注册节点类型 */
  registerNodeType(type: NodeType, nodeClass: new (data: NodeData) => BaseNode): void;
  /** 获取支持的节点类型 */
  getSupportedTypes(): NodeType[];
}
