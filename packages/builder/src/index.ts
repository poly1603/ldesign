/**
 * @ldesign/builder - 强大的前端库打包工具
 */

// 主构建器
export { LibraryBuilder } from './LibraryBuilder'
export type { LibraryBuilderConfig, BuildResult } from './LibraryBuilder'

// 项目分析器
export { ProjectAnalyzer, ProjectType } from './analyzer/ProjectAnalyzer'
export type { 
  ProjectAnalysis, 
  FileStats, 
  VueFileAnalysis 
} from './analyzer/ProjectAnalyzer'

// 预设系统
export {
  BasePreset,
  PureLessPreset,
  TsLibPreset,
  Vue2ComponentPreset,
  Vue3ComponentPreset,
  PresetFactory
} from './presets'
export type { PresetConfig } from './presets'

// 产物验证器
export { ArtifactValidator } from './validator/ArtifactValidator'
export type {
  ValidatorConfig,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ArtifactStats
} from './validator/ArtifactValidator'

// 样式插件
export { stylePlugin } from './plugins/style-plugin'
export type { StylePluginOptions } from './plugins/style-plugin'

// 快捷方法
import { LibraryBuilder } from './LibraryBuilder'
import { ProjectAnalyzer } from './analyzer/ProjectAnalyzer'
import { ArtifactValidator } from './validator/ArtifactValidator'
import type { LibraryBuilderConfig } from './LibraryBuilder'
import type { ValidatorConfig } from './validator/ArtifactValidator'

/**
 * 快速构建
 */
export async function build(config?: LibraryBuilderConfig) {
  return LibraryBuilder.build(config)
}

/**
 * 分析项目
 */
export async function analyze(rootDir?: string, srcDir = 'src') {
  const analyzer = new ProjectAnalyzer(rootDir || process.cwd(), srcDir)
  return analyzer.analyze()
}

/**
 * 验证产物
 */
export async function validate(config: ValidatorConfig) {
  const validator = new ArtifactValidator(config)
  const result = await validator.validate()
  console.log(validator.generateReport(result))
  return result
}

// 默认导出
export default LibraryBuilder
