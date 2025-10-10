/**
 * 审批流程节点类型
 */
export enum ApprovalNodeType {
  /** 开始节点 */
  START = 'start',
  /** 审批节点 */
  APPROVAL = 'approval',
  /** 条件节点 */
  CONDITION = 'condition',
  /** 并行节点 */
  PARALLEL = 'parallel',
  /** 抄送节点 */
  CC = 'cc',
  /** 结束节点 */
  END = 'end',
}

/**
 * 审批模式
 */
export enum ApprovalMode {
  /** 单人审批 - 只需一人审批 */
  SINGLE = 'single',
  /** 会签 - 所有人都需审批 */
  ALL = 'all',
  /** 或签 - 任意一人审批即可 */
  ANY = 'any',
  /** 顺序审批 - 按顺序依次审批 */
  SEQUENCE = 'sequence',
}

/**
 * 审批人配置
 */
export interface ApproverConfig {
  /** 审批人ID */
  id: string;
  /** 审批人姓名 */
  name: string;
  /** 审批人角色 */
  role?: string;
  /** 审批人部门 */
  department?: string;
  /** 审批人头像 */
  avatar?: string;
}

/**
 * 条件配置
 */
export interface ConditionConfig {
  /** 条件ID */
  id: string;
  /** 条件名称 */
  name: string;
  /** 条件表达式 */
  expression: string;
  /** 条件描述 */
  description?: string;
  /** 优先级 */
  priority?: number;
}

/**
 * 节点数据
 */
export interface NodeData {
  /** 节点ID */
  id: string;
  /** 节点类型 */
  type: ApprovalNodeType;
  /** 节点名称 */
  name: string;
  /** 节点描述 */
  description?: string;
  /** 审批模式（仅审批节点） */
  approvalMode?: ApprovalMode;
  /** 审批人列表（仅审批节点） */
  approvers?: ApproverConfig[];
  /** 条件列表（仅条件节点） */
  conditions?: ConditionConfig[];
  /** 抄送人列表（仅抄送节点） */
  ccUsers?: ApproverConfig[];
  /** 自定义属性 */
  properties?: Record<string, any>;
}

/**
 * 边数据
 */
export interface EdgeData {
  /** 边ID */
  id: string;
  /** 源节点ID */
  sourceNodeId: string;
  /** 目标节点ID */
  targetNodeId: string;
  /** 边名称 */
  name?: string;
  /** 条件表达式（用于条件分支） */
  condition?: string;
  /** 自定义属性 */
  properties?: Record<string, any>;
}

/**
 * 流程图数据
 */
export interface FlowChartData {
  /** 节点列表 */
  nodes: NodeData[];
  /** 边列表 */
  edges: EdgeData[];
}

/**
 * 编辑器配置
 */
export interface EditorConfig {
  /** 容器元素 */
  container: HTMLElement | string;
  /** 是否只读模式 */
  readonly?: boolean;
  /** 宽度 */
  width?: number | string;
  /** 高度 */
  height?: number | string;
  /** 网格配置 */
  grid?: {
    /** 是否显示网格 */
    visible?: boolean;
    /** 网格大小 */
    size?: number;
    /** 网格类型 */
    type?: 'dot' | 'mesh';
  };
  /** 缩放配置 */
  zoom?: {
    /** 最小缩放比例 */
    minZoom?: number;
    /** 最大缩放比例 */
    maxZoom?: number;
    /** 默认缩放比例 */
    defaultZoom?: number;
  };
  /** 工具栏配置 */
  toolbar?: {
    /** 是否显示工具栏 */
    visible?: boolean;
    /** 工具栏位置 */
    position?: 'top' | 'left' | 'right' | 'bottom';
    /** 自定义工具 */
    tools?: string[];
  };
  /** 小地图配置 */
  miniMap?: {
    /** 是否显示小地图 */
    visible?: boolean;
    /** 小地图位置 */
    position?: 'left-top' | 'right-top' | 'left-bottom' | 'right-bottom';
  };
  /** 主题配置 */
  theme?: {
    /** 主题名称 */
    name?: string;
    /** 自定义颜色 */
    colors?: Record<string, string>;
  };
  /** 键盘快捷键配置 */
  keyboard?: {
    /** 是否启用键盘快捷键 */
    enabled?: boolean;
  };
  /** 对齐线配置 */
  snapline?: {
    /** 是否显示对齐线 */
    enabled?: boolean;
  };
}

/**
 * 编辑器事件
 */
export interface EditorEvents {
  /** 节点点击事件 */
  'node:click'?: (data: NodeData) => void;
  /** 节点双击事件 */
  'node:dblclick'?: (data: NodeData) => void;
  /** 节点添加事件 */
  'node:add'?: (data: NodeData) => void;
  /** 节点删除事件 */
  'node:delete'?: (data: NodeData) => void;
  /** 节点更新事件 */
  'node:update'?: (data: NodeData) => void;
  /** 边点击事件 */
  'edge:click'?: (data: EdgeData) => void;
  /** 边添加事件 */
  'edge:add'?: (data: EdgeData) => void;
  /** 边删除事件 */
  'edge:delete'?: (data: EdgeData) => void;
  /** 数据变化事件 */
  'data:change'?: (data: FlowChartData) => void;
  /** 画布缩放事件 */
  'canvas:zoom'?: (zoom: number) => void;
  /** 选中变化事件 */
  'selection:change'?: (selection: { nodes: NodeData[]; edges: EdgeData[] }) => void;
}

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误信息列表 */
  errors: Array<{
    /** 错误类型 */
    type: string;
    /** 错误消息 */
    message: string;
    /** 相关节点ID */
    nodeId?: string;
    /** 相关边ID */
    edgeId?: string;
  }>;
}

/**
 * 导出配置
 */
export interface ExportConfig {
  /** 导出类型 */
  type: 'png' | 'jpg' | 'svg' | 'json' | 'xml';
  /** 图片质量（仅 png、jpg） */
  quality?: number;
  /** 背景色（仅图片导出） */
  backgroundColor?: string;
  /** 文件名 */
  filename?: string;
}
