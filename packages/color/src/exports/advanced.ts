/**
 * 高级功能导出模块
 * 包含 AI 引擎、协作、WebAssembly 等高级功能
 */

// 实时协作
export { RealtimeCollaboration } from '../collaboration/realtime-sync'

export type {
  CollaborationEvent,
  CollaborationSession,
  CollaborationState,
  CollaborationUser,
  ConflictResolution,
  SyncMessage,
} from '../collaboration/realtime-sync'

// 图像颜色提取
export * from '../extraction/image-color-extractor'

// 高级 UI 组件
export * from '../ui/color-picker-advanced'

// AI 颜色引擎
export { AIColorEngine } from '../utils/ai-color-engine'

export type {
  ColorInteraction,
  ColorRecommendation,
  ColorScheme,
  ColorTrend,
  UserPreference,
} from '../utils/ai-color-engine'

// 事件发射器
export { createEventEmitter, EventEmitterImpl } from '../utils/event-emitter'

// 通知系统
export * from '../utils/notification'

// WebAssembly 加速
export { getWasmLoader, loadWasm, WasmColorConverter, WasmLoader } from '../wasm/wasm-loader'

export type { WasmColorModule, WasmConfig } from '../wasm/wasm-loader'
