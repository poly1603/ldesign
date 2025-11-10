/**
 * @ldesign/project-manager
 * 
 * 项目管理工具 - 项目扫描、类型识别、依赖分析
 * 
 * @packageDocumentation
 */

// 导出类型
export * from './types'

// 导出核心模块
export { ProjectDetector, getProjectTypeLabel } from './core/project-detector'
export { ProjectScanner } from './core/project-scanner'

// 版本信息
export const VERSION = '1.0.0'

