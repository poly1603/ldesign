/**
 * 类型定义导出文件
 * 统一导出所有类型定义
 */

// 核心类型
export type {
  Point,
  Rectangle,
  Size,
  Viewport,
  Style,
  EventListener,
  EventEmitter,
  Renderable,
  Selectable,
  Draggable,
  Command,
  FlowchartOptions,
  FlowchartData,
  NodeData,
  EdgeData
} from './core.js';

export { EventType } from './core.js';

// 节点类型
export type {
  Port,
  Approver,
  ApprovalConfig,
  ConditionConfig,
  BaseNode,
  StartNodeData,
  EndNodeData,
  ProcessNodeData,
  DecisionNodeData,
  ApprovalNodeData,
  TaskNodeData,
  GatewayNodeData,
  AnyNodeData,
  NodeFactory
} from './nodes.js';

export { 
  NodeType,
  PortPosition,
  NodeStatus
} from './nodes.js';

// 连接线类型
export type {
  PathPoint,
  EdgePath,
  LabelConfig,
  BaseEdge,
  StraightEdgeData,
  BezierEdgeData,
  OrthogonalEdgeData,
  SmoothEdgeData,
  CustomEdgeData,
  ConditionalEdgeData,
  AnyEdgeData,
  EdgeFactory,
  PathCalculator,
  ArrowRenderer
} from './edges.js';

export {
  EdgeType,
  ArrowType,
  EdgeStatus
} from './edges.js';
