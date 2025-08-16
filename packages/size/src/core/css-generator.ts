/**
 * CSS变量生成器
 */

import type { SizeConfig } from '../types'

/**
 * CSS变量生成器类
 */
export class CSSVariableGenerator {
  private prefix: string

  constructor(prefix: string = '--ls') {
    this.prefix = prefix
  }

  /**
   * 生成完整的CSS变量集合
   */
  generateVariables(config: SizeConfig): Record<string, string> {
    const variables: Record<string, string> = {}

    // 生成字体大小变量
    this.generateFontSizeVariables(config.fontSize, variables)

    // 生成间距变量
    this.generateSpacingVariables(config.spacing, variables)

    // 生成组件尺寸变量
    this.generateComponentVariables(config.component, variables)

    // 生成边框圆角变量
    this.generateBorderRadiusVariables(config.borderRadius, variables)

    // 生成阴影变量
    this.generateShadowVariables(config.shadow, variables)

    return variables
  }

  /**
   * 生成字体大小变量
   */
  private generateFontSizeVariables(
    fontSize: SizeConfig['fontSize'],
    variables: Record<string, string>
  ): void {
    variables[`${this.prefix}-font-size-xs`] = fontSize.xs
    variables[`${this.prefix}-font-size-sm`] = fontSize.sm
    variables[`${this.prefix}-font-size-base`] = fontSize.base
    variables[`${this.prefix}-font-size-lg`] = fontSize.lg
    variables[`${this.prefix}-font-size-xl`] = fontSize.xl
    variables[`${this.prefix}-font-size-xxl`] = fontSize.xxl

    // 标题字体
    variables[`${this.prefix}-font-size-h1`] = fontSize.h1
    variables[`${this.prefix}-font-size-h2`] = fontSize.h2
    variables[`${this.prefix}-font-size-h3`] = fontSize.h3
    variables[`${this.prefix}-font-size-h4`] = fontSize.h4
    variables[`${this.prefix}-font-size-h5`] = fontSize.h5
    variables[`${this.prefix}-font-size-h6`] = fontSize.h6
  }

  /**
   * 生成间距变量
   */
  private generateSpacingVariables(
    spacing: SizeConfig['spacing'],
    variables: Record<string, string>
  ): void {
    variables[`${this.prefix}-spacing-xs`] = spacing.xs
    variables[`${this.prefix}-spacing-sm`] = spacing.sm
    variables[`${this.prefix}-spacing-base`] = spacing.base
    variables[`${this.prefix}-spacing-lg`] = spacing.lg
    variables[`${this.prefix}-spacing-xl`] = spacing.xl
    variables[`${this.prefix}-spacing-xxl`] = spacing.xxl

    // 生成常用的padding和margin变量
    variables[`${this.prefix}-padding-xs`] = spacing.xs
    variables[`${this.prefix}-padding-sm`] = spacing.sm
    variables[`${this.prefix}-padding-base`] = spacing.base
    variables[`${this.prefix}-padding-lg`] = spacing.lg
    variables[`${this.prefix}-padding-xl`] = spacing.xl
    variables[`${this.prefix}-padding-xxl`] = spacing.xxl

    variables[`${this.prefix}-margin-xs`] = spacing.xs
    variables[`${this.prefix}-margin-sm`] = spacing.sm
    variables[`${this.prefix}-margin-base`] = spacing.base
    variables[`${this.prefix}-margin-lg`] = spacing.lg
    variables[`${this.prefix}-margin-xl`] = spacing.xl
    variables[`${this.prefix}-margin-xxl`] = spacing.xxl
  }

  /**
   * 生成组件尺寸变量
   */
  private generateComponentVariables(
    component: SizeConfig['component'],
    variables: Record<string, string>
  ): void {
    // 按钮高度
    variables[`${this.prefix}-button-height-small`] =
      component.buttonHeight.small
    variables[`${this.prefix}-button-height-medium`] =
      component.buttonHeight.medium
    variables[`${this.prefix}-button-height-large`] =
      component.buttonHeight.large

    // 输入框高度
    variables[`${this.prefix}-input-height-small`] = component.inputHeight.small
    variables[`${this.prefix}-input-height-medium`] =
      component.inputHeight.medium
    variables[`${this.prefix}-input-height-large`] = component.inputHeight.large

    // 图标尺寸
    variables[`${this.prefix}-icon-size-small`] = component.iconSize.small
    variables[`${this.prefix}-icon-size-medium`] = component.iconSize.medium
    variables[`${this.prefix}-icon-size-large`] = component.iconSize.large

    // 头像尺寸
    variables[`${this.prefix}-avatar-size-small`] = component.avatarSize.small
    variables[`${this.prefix}-avatar-size-medium`] = component.avatarSize.medium
    variables[`${this.prefix}-avatar-size-large`] = component.avatarSize.large
  }

  /**
   * 生成边框圆角变量
   */
  private generateBorderRadiusVariables(
    borderRadius: SizeConfig['borderRadius'],
    variables: Record<string, string>
  ): void {
    variables[`${this.prefix}-border-radius-none`] = borderRadius.none
    variables[`${this.prefix}-border-radius-sm`] = borderRadius.sm
    variables[`${this.prefix}-border-radius-base`] = borderRadius.base
    variables[`${this.prefix}-border-radius-lg`] = borderRadius.lg
    variables[`${this.prefix}-border-radius-xl`] = borderRadius.xl
    variables[`${this.prefix}-border-radius-full`] = borderRadius.full
  }

  /**
   * 生成阴影变量
   */
  private generateShadowVariables(
    shadow: SizeConfig['shadow'],
    variables: Record<string, string>
  ): void {
    variables[`${this.prefix}-shadow-none`] = shadow.none
    variables[`${this.prefix}-shadow-sm`] = shadow.sm
    variables[`${this.prefix}-shadow-base`] = shadow.base
    variables[`${this.prefix}-shadow-lg`] = shadow.lg
    variables[`${this.prefix}-shadow-xl`] = shadow.xl
  }

  /**
   * 生成CSS字符串
   */
  generateCSSString(
    variables: Record<string, string>,
    selector: string = ':root'
  ): string {
    const cssRules = Object.entries(variables)
      .map(([name, value]) => `  ${name}: ${value};`)
      .join('\n')

    return `${selector} {\n${cssRules}\n}`
  }

  /**
   * 更新前缀
   */
  updatePrefix(prefix: string): void {
    this.prefix = prefix
  }

  /**
   * 获取当前前缀
   */
  getPrefix(): string {
    return this.prefix
  }
}

/**
 * 创建CSS变量生成器实例
 */
export function createCSSVariableGenerator(
  prefix?: string
): CSSVariableGenerator {
  return new CSSVariableGenerator(prefix)
}

/**
 * 默认CSS变量生成器实例
 */
export const defaultCSSVariableGenerator = new CSSVariableGenerator()
