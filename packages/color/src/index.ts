/**
 * @ldesign/color - 现代颜色处理库
 *
 * 提供完整的颜色管理解决方案，包括：
 * - 颜色格式转换 (HEX, RGB, HSL, HSV)
 * - 智能调色板生成
 * - 可访问性检查 (WCAG 标准)
 * - 主题管理系统
 * - Vue 3 深度集成
 * - 主题导入/导出
 * - 性能监控工具
 *
 * @version 1.0.0
 * @author LDesign Team
 */

// 默认导出 - 延迟加载
export { ThemeManager as default } from './core/theme-manager'
export * from './exports/accessibility'
// 高级功能 - 按需导入
export type * from './exports/advanced'

export * from './exports/color-processing'
// 核心功能导出 - 支持 tree-shaking
export * from './exports/core'
// CSS 集成功能导出 - 包含 globalThemeApplier
export * from './exports/css-integration'

export type * from './exports/performance'

// 实用工具 - 按需导入
export * from './exports/utilities'

// 版本信息
export const version = '0.1.0'

// Vue 集成 - 按需导入
export type * from './exports/vue'
