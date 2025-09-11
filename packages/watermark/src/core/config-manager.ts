/**
 * 配置管理器
 */

import type {
  AnimationConfig,
  ResponsiveConfig,
  SecurityConfig,
  WatermarkConfig,
  WatermarkLayout,
  WatermarkStyle,
} from '../types'

import { DEFAULT_WATERMARK_CONFIG } from '../types/config'
import {
  ErrorSeverity,
  WatermarkError,
  WatermarkErrorCode,
} from '../types/error'
import { isValidInput } from '../utils'

/**
 * 配置管理器
 * 负责配置的验证、合并、默认值处理等
 */
export class ConfigManager {
  private defaultConfig: Partial<WatermarkConfig>

  constructor() {
    this.defaultConfig = { ...DEFAULT_WATERMARK_CONFIG }
  }

  /**
   * 验证配置
   */
  async validate(config: WatermarkConfig): Promise<WatermarkConfig> {
    const errors: string[] = []

    // 验证基本配置
    if (config.content == null) {
      errors.push('Content is required')
    }
    // 验证文本内容
    else if (typeof config.content === 'string' && !isValidInput(config.content)) {
      errors.push('Text content cannot be empty')
    }

    // 验证数组内容
    if (Array.isArray(config.content)) {
      if (config.content.length === 0) {
        errors.push('Content array cannot be empty')
      }
      else {
        for (const item of config.content) {
          if (!isValidInput(item)) {
            errors.push('All content items must be valid')
            break
          }
        }
      }
    }

    // 验证图片内容
    if (config.content instanceof HTMLImageElement) {
      await this.validateImageConfig(config.content, errors)
    }
    else if (
      typeof config.content === 'object'
      && config.content
      && 'image' in config.content
      && config.content.image
    ) {
      await this.validateImageConfig(config.content.image, errors)
    }

    // 验证样式配置
    if (config.style) {
      this.validateStyleConfig(config.style, errors)
    }

    // 验证布局配置
    if (config.layout) {
      this.validateLayoutConfig(config.layout, errors)
    }

    // 验证安全配置
    if (config.security) {
      this.validateSecurityConfig(config.security, errors)
    }

    // 验证动画配置
    if (config.animation) {
      this.validateAnimationConfig(config.animation, errors)
    }

    // 验证响应式配置
    if (config.responsive) {
      this.validateResponsiveConfig(config.responsive, errors)
    }

    // 在合并之前检查错误
    if (errors.length > 0) {
      throw new WatermarkError(
        `Configuration validation failed: ${errors.join(', ')}`,
        WatermarkErrorCode.INVALID_CONFIG,
        ErrorSeverity.HIGH,
        { context: { errors, config } },
      )
    }

    // 只有在验证通过后才合并默认值
    return this.mergeWithDefaults(config)
  }

  /**
   * 合并配置
   */
  async merge(
    baseConfig: WatermarkConfig,
    updateConfig: Partial<WatermarkConfig>,
  ): Promise<WatermarkConfig> {
    const merged = this.deepMerge(baseConfig, updateConfig)
    return this.validate(merged)
  }

  /**
   * 检查是否有渲染相关的变更
   */
  hasRenderingChanges(
    oldConfig: WatermarkConfig,
    newConfig: WatermarkConfig,
  ): boolean {
    return (
      this.hasContentChanges(oldConfig, newConfig)
      || this.hasStyleChanges(oldConfig, newConfig)
      || this.hasLayoutChanges(oldConfig, newConfig)
    )
  }

  /**
   * 检查是否有动画相关的变更
   */
  hasAnimationChanges(
    oldConfig: WatermarkConfig,
    newConfig: WatermarkConfig,
  ): boolean {
    return !this.deepEqual(oldConfig.animation, newConfig.animation)
  }

  /**
   * 检查是否有安全相关的变更
   */
  hasSecurityChanges(
    oldConfig: WatermarkConfig,
    newConfig: WatermarkConfig,
  ): boolean {
    return !this.deepEqual(oldConfig.security, newConfig.security)
  }

  /**
   * 检查是否有响应式相关的变更
   */
  hasResponsiveChanges(
    oldConfig: WatermarkConfig,
    newConfig: WatermarkConfig,
  ): boolean {
    return !this.deepEqual(oldConfig.responsive, newConfig.responsive)
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig(): WatermarkConfig {
    return {
      ...this.defaultConfig,
      content: this.defaultConfig.content ?? 'Watermark',
    } as WatermarkConfig
  }

  /**
   * 设置默认配置
   */
  setDefaultConfig(config: Partial<WatermarkConfig>): void {
    this.defaultConfig = this.deepMerge(this.defaultConfig, config)
  }

  // 私有方法

  private async validateImageConfig(
    imageConfig: { src: string, width?: number, height?: number },
    errors: string[],
  ): Promise<void> {
    if (!imageConfig.src) {
      errors.push('Image src is required')
      return
    }

    // 验证图片是否可以加载
    try {
      await this.validateImageSrc(imageConfig.src)
    }
    catch (error) {
      errors.push(`Invalid image src: ${imageConfig.src}`)
    }

    // 验证尺寸
    if (imageConfig.width !== undefined && imageConfig.width <= 0) {
      errors.push('Image width must be positive')
    }

    if (imageConfig.height !== undefined && imageConfig.height <= 0) {
      errors.push('Image height must be positive')
    }
  }

  private validateImageSrc(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = src
    })
  }

  private validateStyleConfig(style: WatermarkStyle, errors: string[]): void {
    // 验证字体大小
    if (style.fontSize !== undefined && style.fontSize <= 0) {
      errors.push('Font size must be positive')
    }

    // 验证透明度
    if (
      style.opacity !== undefined
      && (style.opacity < 0 || style.opacity > 1)
    ) {
      errors.push('Opacity must be between 0 and 1')
    }

    // 验证旋转角度
    if (
      style.rotate !== undefined
      && (style.rotate < -360 || style.rotate > 360)
    ) {
      errors.push('Rotation must be between -360 and 360 degrees')
    }

    // 验证颜色格式
    if (style.color && !this.isValidColor(style.color)) {
      errors.push('Invalid color format')
    }

    if (style.backgroundColor && !this.isValidColor(style.backgroundColor)) {
      errors.push('Invalid background color format')
    }
  }

  private validateLayoutConfig(
    layout: WatermarkLayout,
    errors: string[],
  ): void {
    // 验证间距
    if (layout.gapX !== undefined && layout.gapX < 0) {
      errors.push('Gap X must be non-negative')
    }

    if (layout.gapY !== undefined && layout.gapY < 0) {
      errors.push('Gap Y must be non-negative')
    }

    // 验证偏移
    if (layout.offsetX !== undefined && Math.abs(layout.offsetX) > 1000) {
      errors.push('Offset X is too large')
    }

    if (layout.offsetY !== undefined && Math.abs(layout.offsetY) > 1000) {
      errors.push('Offset Y is too large')
    }

    // 验证行列数
    if (layout.rows !== undefined && layout.rows <= 0) {
      errors.push('Rows must be positive')
    }

    if (layout.cols !== undefined && layout.cols <= 0) {
      errors.push('Columns must be positive')
    }
  }

  private validateSecurityConfig(
    security: SecurityConfig,
    errors: string[],
  ): void {
    // 验证安全级别
    const validLevels = ['none', 'low', 'medium', 'high']
    if (!validLevels.includes(security.level)) {
      errors.push('Invalid security level')
    }

    // 验证自定义规则配置
    if (security.customRules) {
      security.customRules.forEach((rule, index) => {
        if (!rule.name) {
          errors.push(`Rule ${index}: name is required`)
        }
        if (!rule.check) {
          errors.push(`Rule ${index}: check function is required`)
        }
      })
    }
  }

  private validateAnimationConfig(
    animation: AnimationConfig,
    errors: string[],
  ): void {
    // 验证动画类型
    const validTypes = [
      'none',
      'fade',
      'slide',
      'rotate',
      'scale',
      'bounce',
      'pulse',
      'swing',
      'custom',
    ]
    if (!validTypes.includes(animation.type)) {
      errors.push('Invalid animation type')
    }

    // 验证持续时间
    if (animation.duration !== undefined && animation.duration <= 0) {
      errors.push('Animation duration must be positive')
    }

    // 验证延迟
    if (animation.delay !== undefined && animation.delay < 0) {
      errors.push('Animation delay must be non-negative')
    }

    // 验证重复次数
    if (typeof animation.iteration === 'number' && animation.iteration < 0) {
      errors.push('Animation iteration must be non-negative')
    }
  }

  private validateResponsiveConfig(
    responsive: ResponsiveConfig,
    errors: string[],
  ): void {
    // 验证断点配置
    if (responsive.breakpoints) {
      Object.entries(responsive.breakpoints).forEach(([name, breakpoint]) => {
        // 验证断点配置是否为有效的水印配置
        if (typeof breakpoint !== 'object' || breakpoint === null) {
          errors.push(
            `Breakpoint ${name}: must be a valid configuration object`,
          )
        }
      })
    }

    // 验证防抖时间
    if (responsive.debounceTime !== undefined && responsive.debounceTime < 0) {
      errors.push('Debounce time must be non-negative')
    }
  }

  private isValidColor(color: string): boolean {
    // 简单的颜色格式验证
    const colorRegex = /^(#[0-9A-Fa-f]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|[a-zA-Z]+|transparent)$/
    return colorRegex.test(color)
  }

  private hasContentChanges(
    oldConfig: WatermarkConfig,
    newConfig: WatermarkConfig,
  ): boolean {
    return !this.deepEqual(oldConfig.content, newConfig.content)
  }

  private hasStyleChanges(
    oldConfig: WatermarkConfig,
    newConfig: WatermarkConfig,
  ): boolean {
    return !this.deepEqual(oldConfig.style, newConfig.style)
  }

  private hasLayoutChanges(
    oldConfig: WatermarkConfig,
    newConfig: WatermarkConfig,
  ): boolean {
    return !this.deepEqual(oldConfig.layout, newConfig.layout)
  }

  private mergeWithDefaults(config: Partial<WatermarkConfig>): WatermarkConfig {
    return this.deepMerge(this.defaultConfig, config) as WatermarkConfig
  }

  private deepMerge<T>(target: T, source: Partial<T>): T {
    const result = { ...target }

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key]
        const targetValue = result[key]

        if (this.isObject(sourceValue) && this.isObject(targetValue)) {
          result[key] = this.deepMerge(
            targetValue,
            sourceValue as Partial<
              T[Extract<keyof T, string>] & Record<string, any>
            >,
          ) as any
        }
        else if (sourceValue !== undefined) {
          result[key] = sourceValue as any
        }
      }
    }

    return result
  }

  private deepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) {
      return true
    }

    if (obj1 == null || obj2 == null) {
      return obj1 === obj2
    }

    if (typeof obj1 !== typeof obj2) {
      return false
    }

    if (typeof obj1 !== 'object') {
      return obj1 === obj2
    }

    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)

    if (keys1.length !== keys2.length) {
      return false
    }

    for (const key of keys1) {
      if (!keys2.includes(key)) {
        return false
      }

      if (!this.deepEqual(obj1[key], obj2[key])) {
        return false
      }
    }

    return true
  }

  private isObject(value: any): value is Record<string, any> {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
  }
}
