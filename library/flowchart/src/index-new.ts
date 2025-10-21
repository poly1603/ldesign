/**
 * FlowChart 2.0 - 新架构主入口
 * 
 * 全新的分层架构 + 插件化设计
 */

// ========== 核心层 ==========
export { Graph } from './core/Graph';
export { NodeModel, EdgeModel, BaseModel } from './core/model';
export { Renderer, NodeView, EdgeView, Viewport } from './core/view';
export { EventController, SelectController } from './core/controller';

// ========== 编辑器层 ==========
export { FlowChartEditor, FlowChartEditorConfig } from './editor';
export { FlowChartViewer, FlowChartViewerConfig } from './editor';

// ========== 插件系统 ==========
export { DragNodePlugin, SelectNodePlugin } from './plugins/behavior';
export { HistoryPlugin, Command, BaseCommand } from './plugins/history';

// ========== 路由系统 ==========
export { RouterFactory, RouterType } from './router';
export { OrthogonalRouter, PolylineRouter, BezierRouter } from './router';
export type { BaseRouter, RouterConfig } from './router';

// ========== 几何计算 ==========
export { Point, Line, Rectangle, ConnectionPoint, ConnectionSide } from './geometry';

// ========== 工具函数 ==========
export { EventBus, IdGenerator, Validator } from './utils';

// ========== 类型定义 ==========
export * from './types';

// ========== 版本信息 ==========
export const VERSION = '2.0.0-alpha.1';

/**
 * 默认导出：编辑器
 */
export { FlowChartEditor as default } from './editor';
