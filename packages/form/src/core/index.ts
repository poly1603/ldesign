/**
 * 核心模块入口文件
 * 
 * 导出所有核心功能模块，这些模块是与框架无关的纯逻辑实现
 */

// 导出核心引擎类
export { FormEngine } from './form-engine'
export { EventBus } from './event-bus'
export { StateManager } from './state-manager'
export { ValidationEngine } from './validation-engine'
export { LayoutEngine } from './layout-engine'
export { ConditionEngine } from './condition-engine'

// 导出工具函数
export * from './utils'

// 导出核心常量
export const CORE_VERSION = '1.0.0'

// 导出核心配置
export const CORE_CONFIG = {
  // 默认防抖延迟
  DEFAULT_DEBOUNCE_DELAY: 300,
  
  // 默认节流间隔
  DEFAULT_THROTTLE_INTERVAL: 100,
  
  // 默认缓存TTL
  DEFAULT_CACHE_TTL: 300000, // 5分钟
  
  // 默认缓存大小
  DEFAULT_CACHE_SIZE: 100,
  
  // 默认验证超时
  DEFAULT_VALIDATION_TIMEOUT: 5000,
  
  // 默认最小列宽
  DEFAULT_MIN_COLUMN_WIDTH: 300,
  
  // 默认最大列数
  DEFAULT_MAX_COLUMNS: 6,
  
  // 默认行高
  DEFAULT_ROW_HEIGHT: 60,
  
  // 默认间距
  DEFAULT_GAP: 16,
  
  // 默认断点
  DEFAULT_BREAKPOINTS: {
    xs: { value: 0, name: 'xs', columns: 1 },
    sm: { value: 576, name: 'sm', columns: 2 },
    md: { value: 768, name: 'md', columns: 3 },
    lg: { value: 992, name: 'lg', columns: 4 },
    xl: { value: 1200, name: 'xl', columns: 5 }
  }
} as const

// 导出核心工厂函数
export function createFormEngine(config: any) {
  return new FormEngine(config)
}

export function createEventBus() {
  return new EventBus()
}

export function createStateManager(eventBus: any) {
  return new StateManager(eventBus)
}

export function createValidationEngine(eventBus: any) {
  return new ValidationEngine(eventBus)
}

export function createLayoutEngine(eventBus: any) {
  return new LayoutEngine(eventBus)
}

export function createConditionEngine(eventBus: any) {
  return new ConditionEngine(eventBus)
}

// 导出核心类型（重新导出）
export type {
  FormConfig,
  FormState,
  FormInstance,
  FormFieldConfig,
  FormFieldItem,
  LayoutConfig,
  LayoutResult,
  ValidationConfig,
  ValidationResult,
  EventType,
  EventData,
  EventListener,
  EventBus as IEventBus,
  ValidationEngine as IValidationEngine,
  LayoutEngine as ILayoutEngine
} from '../types'
