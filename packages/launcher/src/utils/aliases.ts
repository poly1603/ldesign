/**
 * 别名工具函数
 *
 * 提供别名配置相关的类型定义
 * 基本别名（@ -> src）由 launcher 自动配置，用户无需手动调用
 *
 * @author LDesign Team
 * @since 1.0.0
 */

/**
 * 别名配置项 - 符合 Vite 标准
 */
export interface AliasEntry {
  find: string | RegExp
  replacement: string
}
