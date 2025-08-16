import {
  ColorConfig,
  ColorScale,
  NeutralColors,
  ColorMode,
} from '../core/types.js'

/**
 * CSS变量管理工具
 * 用于将生成的颜色注入到CSS自定义属性中
 */

/**
 * CSS变量注入器
 */
declare class CSSVariableInjector {
  private styleElement
  private currentVariables
  constructor()
  /**
   * 创建样式元素
   */
  private createStyleElement
  /**
   * 注入CSS变量
   */
  injectVariables(variables: Record<string, string>): void
  /**
   * 更新单个CSS变量
   */
  updateVariable(name: string, value: string): void
  /**
   * 批量更新CSS变量
   */
  updateVariables(variables: Record<string, string>): void
  /**
   * 移除CSS变量
   */
  removeVariable(name: string): void
  /**
   * 清除所有CSS变量
   */
  clearVariables(): void
  /**
   * 获取当前CSS变量
   */
  getCurrentVariables(): Record<string, string>
  /**
   * 生成CSS文本
   */
  private generateCSSText
  /**
   * 销毁注入器
   */
  destroy(): void
}
/**
 * 全局CSS变量注入器实例
 */
declare const globalCSSInjector: CSSVariableInjector
/**
 * 便捷函数：注入颜色主题CSS变量
 */
declare function injectThemeVariables(
  colors: ColorConfig,
  scales: Record<string, ColorScale>,
  neutralColors?: NeutralColors,
  mode?: ColorMode,
  prefix?: string
): void
/**
 * 便捷函数：切换主题模式
 */
declare function toggleThemeMode(
  colors: ColorConfig,
  scales: Record<string, ColorScale>,
  neutralColors?: NeutralColors,
  currentMode?: ColorMode,
  prefix?: string
): ColorMode
/**
 * 便捷函数：获取CSS变量值
 */
declare function getCSSVariableValue(name: string): string
/**
 * 便捷函数：设置CSS变量值
 */
declare function setCSSVariableValue(name: string, value: string): void

export {
  CSSVariableInjector,
  getCSSVariableValue,
  globalCSSInjector,
  injectThemeVariables,
  setCSSVariableValue,
  toggleThemeMode,
}
