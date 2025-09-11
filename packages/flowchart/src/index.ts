/**
 * 流程图编辑器主模块导出文件
 * 统一导出所有公共API和类型定义
 */

// 主要类
export { FlowchartEditor } from './FlowchartEditor.js';
export type { FlowchartEditorConfig } from './FlowchartEditor.js';

export { FlowchartViewer } from './FlowchartViewer.js';
export type { FlowchartViewerConfig, ProcessExecutionState } from './FlowchartViewer.js';

// 核心类型
export type {
  // 基础类型
  Point,
  Size,
  Rectangle,
  Viewport,
  Style,
  
  // 数据类型
  FlowchartData,
  NodeData,
  EdgeData,
  
  // 节点类型
  NodeType,
  NodeStatus,
  Port,
  StartNodeData,
  EndNodeData,
  ProcessNodeData,
  DecisionNodeData,
  ApprovalNodeData,
  
  // 连接线类型
  EdgeType,
  EdgeStatus,
  EdgePath,
  LabelConfig,
  ArrowType,
  StraightEdgeData,
  BezierEdgeData,
  OrthogonalEdgeData,
  
  // 事件类型
  EventType,
  EventEmitter,
  
  // 渲染类型
  Renderable,
  Selectable,
  Draggable,
  
  // 命令类型
  Command
} from './types/index.js';

// 核心组件
export { CanvasRenderer, DataManager } from './core/index.js';

// 节点相关
export { 
  BaseNode,
  StartNode,
  EndNode,
  ProcessNode,
  DecisionNode,
  ApprovalNode,
  NodeFactory
} from './nodes/index.js';

// 连接线相关
export {
  BaseEdge,
  StraightEdge,
  BezierEdge,
  OrthogonalEdge,
  EdgeFactory
} from './edges/index.js';

// 管理器
export {
  SelectionManager,
  InteractionManager,
  CommandManager,
  InteractionMode
} from './managers/index.js';
export type {
  SelectableItem,
  SelectionChangeEvent,
  SelectionBox
} from './managers/index.js';

// UI组件
export {
  Toolbar,
  PropertyPanel
} from './ui/index.js';
export type {
  ToolbarConfig,
  ToolConfig,
  PropertyPanelConfig,
  PropertyFieldConfig
} from './ui/index.js';

// 工具函数
export {
  // 几何工具
  distance,
  angle,
  pointInRectangle,
  pointInCircle,
  lineIntersection,
  circleIntersection,
  bezierPoint,
  cubicBezierPoint,
  pointToLineDistance,
  
  // Canvas工具
  createHighDPICanvas,
  applyStyle,
  getCanvasCoordinates,
  screenToWorld,
  worldToScreen,
  
  // 事件工具
  SimpleEventEmitter,
  preventDefault,
  stopPropagation,
  isKeyboardShortcut,
  getMousePosition,
  getTouchPosition,
  
  // 通用工具
  debounce,
  throttle,
  clamp,
  lerp,
  generateId,
  deepClone,
  createElement,
  addClass,
  removeClass,
  hasClass
} from './utils/index.js';

// 兼容层（@logicflow/core 常用 API）
export { LogicFlow } from './compat/logicflow-core/index.js';
export type { LogicFlowOptions, LFGraphData, LFNode, LFEdge } from './compat/logicflow-core/index.js';
