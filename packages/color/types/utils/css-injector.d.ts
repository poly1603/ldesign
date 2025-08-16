import {
  CSSInjector,
  ColorCategory,
  ColorScale,
  ColorValue,
} from '../core/types.js'

/**
 * CSS Variables 注入和管理系统
 */

/**
 * CSS 注入选项
 */
interface CSSInjectionOptions {
  /** CSS 变量前缀 */
  prefix?: string
  /** 目标选择器 */
  selector?: string
  /** 是否使用 !important */
  important?: boolean
  /** 样式标签 ID */
  styleId?: string
}
/**
 * CSS 注入器实现
 */
declare class CSSInjectorImpl implements CSSInjector {
  private options
  private styleElements
  constructor(options?: CSSInjectionOptions)
  /**
   * 注入 CSS 变量
   */
  injectVariables(variables: Record<string, ColorValue>, id?: string): void
  /**
   * 移除 CSS 变量
   */
  removeVariables(id?: string): void
  /**
   * 更新 CSS 变量
   */
  updateVariables(variables: Record<string, ColorValue>, id?: string): void
  /**
   * 生成 CSS 文本
   */
  private generateCSSText
  /**
   * 更新样式元素
   */
  private updateStyleElement
  /**
   * 获取所有已注入的样式 ID
   */
  getInjectedIds(): string[]
  /**
   * 清空所有注入的样式
   */
  clearAll(): void
  /**
   * 更新注入选项
   */
  updateOptions(options: Partial<CSSInjectionOptions>): void
  /**
   * 获取当前选项
   */
  getOptions(): Required<CSSInjectionOptions>
}
/**
 * CSS 变量生成器
 */
declare class CSSVariableGenerator {
  private prefix
  constructor(prefix?: string)
  /**
   * 从色阶生成 CSS 变量
   */
  generateFromScales(
    scales: Record<ColorCategory, ColorScale>,
    prefix?: string
  ): Record<string, ColorValue>
  /**
   * 生成语义化 CSS 变量
   */
  generateSemanticVariables(
    scales: Record<ColorCategory, ColorScale>,
    prefix?: string
  ): Record<string, ColorValue>
  /**
   * 更新前缀
   */
  updatePrefix(prefix: string): void
  /**
   * 获取当前前缀
   */
  getPrefix(): string
}
/**
 * 创建 CSS 注入器实例
 */
declare function createCSSInjector(options?: CSSInjectionOptions): CSSInjector
/**
 * 创建 CSS 变量生成器实例
 */
declare function createCSSVariableGenerator(
  prefix?: string
): CSSVariableGenerator
/**
 * 默认 CSS 注入器实例
 */
declare const defaultCSSInjector: CSSInjectorImpl
/**
 * 默认 CSS 变量生成器实例
 */
declare const defaultCSSVariableGenerator: CSSVariableGenerator
/**
 * 便捷函数：直接注入色阶变量
 */
declare function injectScaleVariables(
  scales: Record<ColorCategory, ColorScale>,
  options?: CSSInjectionOptions & {
    prefix?: string
    semantic?: boolean
  }
): void
/**
 * 便捷函数：移除所有颜色变量
 */
declare function removeAllColorVariables(): void

export {
  CSSInjectorImpl,
  CSSVariableGenerator,
  createCSSInjector,
  createCSSVariableGenerator,
  defaultCSSInjector,
  defaultCSSVariableGenerator,
  injectScaleVariables,
  removeAllColorVariables,
}
export type { CSSInjectionOptions }
