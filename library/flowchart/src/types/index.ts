/**
 * 节点类型枚举
 */
export enum NodeType {
  START = 'start',           // 开始节点
  END = 'end',               // 结束节点
  APPROVAL = 'approval',     // 审批节点
  CONDITION = 'condition',   // 条件节点
  PROCESS = 'process',       // 处理节点
  PARALLEL = 'parallel',     // 并行节点
  MERGE = 'merge'            // 合并节点
}

/**
 * 节点状态
 */
export enum NodeStatus {
  PENDING = 'pending',       // 待处理
  PROCESSING = 'processing', // 处理中
  APPROVED = 'approved',     // 已通过
  REJECTED = 'rejected',     // 已拒绝
  COMPLETED = 'completed'    // 已完成
}

/**
 * 节点位置
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * 节点尺寸
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * 节点数据接口
 */
export interface NodeData {
  id: string;
  type: NodeType;
  label: string;
  position: Position;
  status?: NodeStatus;
  data?: Record<string, any>;
  style?: NodeStyle;
  manualPosition?: boolean;  // 是否手动设置位置（跳过自动布局）
}

/**
 * 边数据接口
 */
export interface EdgeData {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
  style?: EdgeStyle;
}

/**
 * 节点样式
 */
export interface NodeStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  textColor?: string;
  fontSize?: number;
  padding?: number;
  borderRadius?: number;
}

/**
 * 连线类型
 */
export enum EdgeType {
  STRAIGHT = 'straight',       // 直线
  BEZIER = 'bezier',           // 贝塞尔曲线
  SMOOTH = 'smooth',           // 平滑曲线
  POLYLINE = 'polyline',       // 折线
  STEP = 'step',               // 阶梯线
  ORTHOGONAL = 'orthogonal'    // 正交线（直角折线）
}

/**
 * 连线动画类型
 */
export enum EdgeAnimationType {
  NONE = 'none',               // 无动画
  FLOW = 'flow',               // 流动效果
  DASH = 'dash',               // 虚线流动
  PULSE = 'pulse',             // 脉冲效果
  GLOW = 'glow'                // 发光效果
}

/**
 * 边样式
 */
export interface EdgeStyle {
  strokeColor?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  arrowSize?: number;
  type?: EdgeType;                      // 连线类型
  animated?: boolean;                   // 是否启用动画
  animationType?: EdgeAnimationType;    // 动画类型
  animationDuration?: number;           // 动画持续时间（秒）
  radius?: number;                      // 折线圆角半径
  offset?: number;                      // 连线偏移量
}

/**
 * 编辑器模式
 */
export enum EditorMode {
  READONLY = 'readonly',   // 只读模式
  EDIT = 'edit'           // 编辑模式
}

/**
 * 视图初始位置类型
 */
export type ViewportAnchor = 
  | 'center'           // 完全居中（水平+垂直）
  | 'top-left'        // 左上角
  | 'top-center'      // 顶部居中（水平居中，垂直顶部）
  | 'top-right'       // 右上角
  | 'middle-left'     // 左侧居中（水平左对齐，垂直居中）
  | 'middle-right'    // 右侧居中（水平右对齐，垂直居中）
  | 'bottom-left'     // 左下角
  | 'bottom-center'   // 底部居中（水平居中，垂直底部）
  | 'bottom-right';   // 右下角

/**
 * 缩放配置
 */
export interface ZoomConfig {
  initialScale?: number;          // 初始缩放比例 (0.1-3)
  minScale?: number;              // 最小缩放比例
  maxScale?: number;              // 最大缩放比例
  scaleStep?: number;             // 缩放步长
  autoFit?: boolean;              // 自动适应画布
  fitPadding?: number;            // 自动适应时的内边距
  initialPosition?: ViewportAnchor | { x: number; y: number }; // 初始位置
  centerOnInit?: boolean;         // 初始化时居中内容
}

/**
 * 流程图配置
 */
export interface FlowChartConfig {
  container: HTMLElement | string;
  width?: number;
  height?: number;
  nodeGap?: number;
  levelGap?: number;
  primaryColor?: string;          // 主题色（hover时边的颜色）
  enableDrag?: boolean;          // 已废弃，使用 enablePan
  enableZoom?: boolean;           // 滚轮缩放
  enablePan?: boolean;            // 拖拽画布
  enableNodeDrag?: boolean;       // 拖动节点
  autoLayout?: boolean;
  zoom?: ZoomConfig;              // 缩放配置
  mode?: EditorMode;              // 编辑器模式
  onNodeClick?: (node: NodeData) => void;
  onEdgeClick?: (edge: EdgeData) => void;
  onNodeAdd?: (node: NodeData) => void;
  onNodeDelete?: (nodeId: string) => void;
  onEdgeAdd?: (edge: EdgeData) => void;
  onEdgeDelete?: (edgeId: string) => void;
  onModeChange?: (mode: EditorMode) => void;
  onZoomChange?: (scale: number) => void;  // 缩放变化回调
}

/**
 * 物料项配置
 */
export interface MaterialItem {
  type: NodeType;
  label: string;
  icon?: string;
  description?: string;
}

/**
 * 布局配置
 */
export interface LayoutConfig {
  direction: 'TB' | 'LR'; // TB: 从上到下, LR: 从左到右
  nodeGap: number;        // 同级节点间距
  levelGap: number;       // 层级间距
}

/**
 * 渲染配置
 */
export interface RenderConfig {
  nodeDefaultSize: Size;
  nodeStyles: Record<NodeType, NodeStyle>;
  edgeDefaultStyle: EdgeStyle;
}

