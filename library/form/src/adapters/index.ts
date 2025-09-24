/**
 * 适配器模块导出
 * 
 * 提供所有框架适配器的统一导出
 * 
 * @author LDesign Team
 * @since 2.0.0
 */

// 导出基础适配器
export { BaseAdapter } from './base-adapter'
export type { AdapterConfig, RenderOptions, FieldRenderer } from './base-adapter'

// 导出原生JavaScript适配器
export { VanillaAdapter } from './vanilla-adapter'

// 导出适配器工厂
export { AdapterFactory } from './adapter-factory'

// 导出适配器类型
export type { SupportedFramework, AdapterInstance } from './adapter-factory'
