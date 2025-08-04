/**
 * 水印系统主入口文件
 */

// 核心模块
export {
  WatermarkCore,
  ConfigManager,
  InstanceManager,
  EventManager,
  ErrorManager
} from './core'

// 渲染器模块
export {
  RendererFactory,
  DOMRendererImpl,
  CanvasRendererImpl,
  SVGRendererImpl
} from './renderers'

// 安全模块
export { SecurityManager } from './security'

// 响应式模块
export { ResponsiveManager } from './responsive'

// 动画模块
export { AnimationEngine } from './animation'

// Vue3 集成模块（可选导入）
// 暂时注释掉 Vue 模块，避免构建问题
// export * from './vue'

// 类型定义
export type {
  // 基础类型
  WatermarkConfig,
  WatermarkStyle,
  WatermarkLayout,
  WatermarkImage,
  WatermarkContent,
  RenderMode,

  // 动画类型
  AnimationConfig,
  AnimationType
} from './types'

// 工具函数
export {
  isValidInput,
  generateId,
  generateUUID,
  generateShortId,
  generateNumericId,
  generateTimestampId
} from './utils'

// 默认配置
export {
  DEFAULT_WATERMARK_CONFIG
} from './types/config'

/**
 * 创建水印实例的便捷函数
 */
export async function createWatermark(
  container: Element | string,
  config: Partial<WatermarkConfig>
): Promise<WatermarkInstance> {
  const core = new WatermarkCore()
  await core.init()

  const containerElement = typeof container === 'string'
    ? document.querySelector(container)
    : container

  if (!containerElement) {
    throw new Error('Container element not found')
  }

  return core.create(containerElement, config)
}

/**
 * 销毁水印实例的便捷函数
 */
export async function destroyWatermark(instance: WatermarkInstance): Promise<void> {
  const core = new WatermarkCore()
  await core.destroy(instance.id)
}

/**
 * 获取水印系统版本
 */
export const VERSION = '1.0.0'

/**
 * 默认导出水印核心类
 */
export default WatermarkCore