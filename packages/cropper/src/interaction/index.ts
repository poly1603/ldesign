/**
 * @file 交互模块导出
 * @description 导出所有交互功能模块
 */

// 事件处理
export { EventHandler, PointerEventType } from './event-handler'
export type { PointerEventData, EventHandlerCallback, EventHandlerOptions } from './event-handler'

// 拖拽控制
export { DragController, DragState } from './drag-controller'
export type { DragEventData, DragCallback, DragControllerOptions } from './drag-controller'

// 控制点管理
export { ControlPointsManager, ControlPointType } from './control-points-manager'
export type { ControlPoint, ControlPointsManagerOptions } from './control-points-manager'

// 手势识别
export { GestureRecognizer, GestureType, GestureState } from './gesture-recognizer'
export type { GestureEventData, GestureCallback, GestureRecognizerOptions } from './gesture-recognizer'

// 交互控制器
export { InteractionController, InteractionMode, InteractionEventType } from './interaction-controller'
export type { InteractionEventData, InteractionCallback, InteractionControllerOptions } from './interaction-controller'
