/**
 * 水印系统主入口文件
 */

import type { WatermarkConfig, WatermarkInstance } from './types'

// 用于存储全局core实例和实例映射
const globalCoreMap = new Map<string, { core: any, instance: WatermarkInstance }>()

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

  const instance = await core.create(containerElement as HTMLElement, config)
  
  // 保存core和实例的映射关系
  globalCoreMap.set(instance.id, { core, instance })
  
  return instance
}

/**
 * 销毁水印实例的便捷函数
 */
export async function destroyWatermark(
  instance: WatermarkInstance,
): Promise<void> {
  // 使用保存的core实例
  const coreInfo = globalCoreMap.get(instance.id)
  if (coreInfo) {
    await coreInfo.core.destroy(instance.id)
    // 从全局映射中移除
    globalCoreMap.delete(instance.id)
  } else {
    // 如果找不到对应的core，尝试创建新的（向后兼容）
    const { WatermarkCore } = await import('./core')
    const core = new WatermarkCore()
    await core.init()
    await core.destroy(instance.id)
  }
}

/**
 * 获取水印系统版本
 */
export const VERSION = '1.0.0'

// Vue3 集成模块 (暂时禁用)
// export * from './vue'
