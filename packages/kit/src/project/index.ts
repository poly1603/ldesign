/**
 * @ldesign/kit - 项目管理模块
 *
 * 提供前端项目类型检测、依赖分析、构建工具识别等功能
 *
 * @author LDesign Team
 * @version 1.0.0
 */

export * from './build-tool-detector'

export * from './dependency-analyzer'
export * from './package-manager-detector'
// 导出项目管理类
export * from './project-detector'
// 默认导出主要类
export { ProjectDetector as default } from './project-detector'

// 导出项目类型定义
export * from './types'
