/**
 * EventEmitter - 事件发射器
 * 
 * NOTE: 此文件重新导出 utils/event.ts 的 EventEmitter
 * utils/event.ts 版本支持泛型，类型安全性更好
 * 
 * 保留此文件是为了向后兼容，避免破坏现有导入
 */

export { EventEmitter } from '../utils/event'
export type { EventHandler, EventMap } from '../utils/event'

// 向后兼容：导出基础的事件处理器类型
export type { EventEmitter as BaseEventEmitter } from '../utils/event'
