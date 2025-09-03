/**
 * @ldesign/builder - 智能零配置打包工具
 * 
 * 简化版本，直接使用 Rollup API 实现
 * 自动检测项目类型，生成优化的打包配置
 * 支持多种前端项目类型
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

// 导出核心构建器
export { SimpleBuilder, build } from './simple-builder'
export type { BuildOptions, Result } from './simple-builder'

// 导出 Vue 专用构建器
export { VueBuilder, buildVueProject } from './vue-builder'
export type { VueBuildOptions, VueBuildResult } from './vue-builder'

// 向后兼容导出
export { SimpleBuilder as SmartBuilder } from './simple-builder'
export type { BuildOptions as SmartBuilderOptions, Result as BuildResult } from './simple-builder'

// 导出默认实例 
import { SimpleBuilder } from './simple-builder'
export default SimpleBuilder
