/**
 * 指令系统统一导出
 * 提供完整的指令系统功能
 */

// 导出原有的指令管理器（向后兼容）
// 便捷导入
// TODO: ModernDirectiveManager 文件缺失，暂时注释
// import { ModernDirectiveManager } from './modern-directive-manager'
import { directiveInstances, vueDirectives } from './modules'

// 导出基础类和适配器
export * from './base/directive-base'

export * from './base/vue-directive-adapter'
export {
  commonDirectives,
  createDirectiveManager,
  DirectiveManagerImpl,
} from './directive-manager'

// 导出现代化指令管理器
// TODO: ModernDirectiveManager 文件缺失，暂时注释
// export { ModernDirectiveManager } from './modern-directive-manager'

// export type { ModernDirectiveManagerConfig } from './modern-directive-manager'
// 导出所有指令模块
export * from './modules'

/**
 * 创建现代化指令管理器实例
 * TODO: ModernDirectiveManager 文件缺失，暂时返回 null
 */
export function createModernDirectiveManager(_config?: unknown) {
  // return new ModernDirectiveManager(config)
  return null
}

/**
 * 获取所有可用的指令实例
 */
export function getAllDirectiveInstances() {
  return directiveInstances
}

/**
 * 获取所有可用的Vue指令
 */
export function getAllVueDirectives() {
  return vueDirectives
}

// 默认导出现代化指令管理器
// TODO: ModernDirectiveManager 文件缺失，暂时导出 null
// export default ModernDirectiveManager
export default null
