/**
 * FlowChart Approval Plugin
 * A powerful and easy-to-use approval flowchart plugin
 */

// 核心模块
export { FlowChart } from './core/FlowChart';
export { FlowNode } from './core/Node';
export { FlowEdge } from './core/Edge';

// 布局和渲染
export { LayoutEngine } from './layout/LayoutEngine';
export { DagreLayout } from './layout/DagreLayout';
export { ForceLayout, type ForceLayoutConfig } from './layout/ForceLayout';
export { Renderer } from './renderer/Renderer';
export { EdgeRenderer } from './renderer/EdgeRenderer';

// 编辑器
export {
  FlowChartEditor,
  type EditorConfig,
  Toolbar,
  type ToolbarConfig,
  MaterialPanel,
  type MaterialPanelConfig,
  DragManager,
  type DragManagerConfig,
  EdgeDrawer,
  type EdgeDrawerConfig
} from './editor';

// 类型定义
export {
  NodeType,
  NodeStatus,
  EdgeType,
  EdgeAnimationType,
  EditorMode,
  type NodeData,
  type EdgeData,
  type Position,
  type Size,
  type NodeStyle,
  type EdgeStyle,
  type FlowChartConfig,
  type LayoutConfig,
  type RenderConfig,
  type MaterialItem
} from './types';

// 样式配置
export { DEFAULT_NODE_STYLES, STATUS_COLORS } from './styles/defaultStyles';

// 工具函数
export {
  // 常量
  DEFAULT_CONFIG,
  NODE_SHAPES,
  LAYOUT_DIRECTION,
  // 验证器
  validateNodeData,
  validateEdgeData,
  hasCycle,
  // 辅助函数
  generateId,
  distance,
  midpoint,
  deepClone,
  merge,
  debounce,
  throttle,
  rectContainsPoint,
  calculateBounds,
  // 几何计算
  getNodeEdgePoint,
  // 工作流转换
  convertWorkflowToFlowChart,
  // 错误类
  FlowChartError,
  NodeError,
  EdgeError,
  ValidationError,
  LayoutError,
  RenderError,
  ConfigError
} from './utils';

// 事件管理
export { EventEmitter, FlowChartEvents } from './events';

// 性能监控
export { PerformanceMonitor, type PerformanceMetrics } from './performance';

// 主题系统
export { ThemeManager, THEMES, type ThemeConfig } from './theme';

// 组件系统
export { ComponentRegistry, type ComponentDefinition } from './components';

// 默认导出
export { FlowChart as default } from './core/FlowChart';
