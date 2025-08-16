/**
 * 水印系统主入口文件
 */

import type { WatermarkConfig, WatermarkInstance } from './types'

// 动画模块
export { AnimationEngine } from './animation'

// 核心模块
export {
  ConfigManager,
  ErrorManager,
  EventManager,
  WatermarkCore,
} from './core'

/**
 * 默认导出水印核心类
 */
export { WatermarkCore as default } from './core'

export { InstanceManager } from './core/instance-manager'

// 渲染器模块
export {
  CanvasRendererImpl,
  DOMRendererImpl,
  RendererFactory,
  SVGRendererImpl,
} from './renderers'

// 响应式模块
export { ResponsiveManager } from './responsive'

// 安全模块
export { SecurityManager } from './security'

// 类型定义
export type {
  // 动画类型
  AnimationConfig,
  AnimationType,
  RenderMode,
  // 基础类型
  WatermarkConfig,
  WatermarkContent,
  WatermarkImage,

  // 实例类型
  WatermarkInstance,
  WatermarkInstanceState,
  WatermarkLayout,
  WatermarkStyle,
} from './types'

// 默认配置
export { DEFAULT_WATERMARK_CONFIG } from './types/config'

// 工具函数
export {
  generateId,
  generateNumericId,
  generateShortId,
  generateTimestampId,
  generateUUID,
  isValidInput,
} from './utils'

/**
 * 创建水印实例的便捷函数
 */
export async function createWatermark(
  container: Element | string,
  config: Partial<WatermarkConfig>,
): Promise<WatermarkInstance> {
  const { WatermarkCore } = await import('./core')
  const core = new WatermarkCore()
  await core.init()

  const containerElement
    = typeof container === 'string'
      ? document.querySelector(container)
      : container

  if (!containerElement) {
    throw new Error('Container element not found')
  }

  return core.create(containerElement as HTMLElement, config)
}

/**
 * 销毁水印实例的便捷函数
 */
export async function destroyWatermark(
  instance: WatermarkInstance,
): Promise<void> {
  const { WatermarkCore } = await import('./core')
  const core = new WatermarkCore()
  await core.destroy(instance.id)
}

/**
 * 获取水印系统版本
 */
export const VERSION = '1.0.0'

// Vue3 集成模块 (暂时禁用)
// export * from './vue'
