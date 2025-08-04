export { WatermarkCore } from './core/watermark-core.js';
export { ConfigManager } from './core/config-manager.js';
export { InstanceManager } from './core/instance-manager.js';
export { EventManager } from './core/event-manager.js';
export { ErrorManager } from './core/error-manager.js';
export { RendererFactory } from './renderers/renderer-factory.js';
export { DOMRendererImpl } from './renderers/dom-renderer.js';
export { CanvasRendererImpl } from './renderers/canvas-renderer.js';
export { SVGRendererImpl } from './renderers/svg-renderer.js';
export { SecurityManager } from './security/security-manager.js';
export { ResponsiveManager } from './responsive/responsive-manager.js';
export { AnimationEngine } from './animation/animation-engine.js';
export { DEFAULT_WATERMARK_CONFIG, RenderMode, WatermarkConfig, WatermarkContent, WatermarkImage, WatermarkLayout, WatermarkStyle } from './types/config.js';
export { AnimationConfig, AnimationType } from './types/animation.js';
export { isValidInput } from './utils/index.js';
export { generateId, generateNumericId, generateShortId, generateTimestampId, generateUUID } from './utils/id-generator.js';

/**
 * 水印系统主入口文件
 */

/**
 * 创建水印实例的便捷函数
 */
declare function createWatermark(container: Element | string, config: Partial<WatermarkConfig>): Promise<WatermarkInstance>;
/**
 * 销毁水印实例的便捷函数
 */
declare function destroyWatermark(instance: WatermarkInstance): Promise<void>;
/**
 * 获取水印系统版本
 */
declare const VERSION = "1.0.0";
/**
 * 默认导出水印核心类
 */
var WatermarkCore$1 = WatermarkCore;

export { VERSION, createWatermark, WatermarkCore$1 as default, destroyWatermark };
