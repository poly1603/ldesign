/**
 * CSS变量生成器测试
 */

import { beforeEach, describe, expect, it } from 'vitest'
import {
  createCSSVariableGenerator,
  CSSVariableGenerator,
  defaultCSSVariableGenerator,
} from '../../core/css-generator'
import { mediumSizeConfig } from '../../core/presets'

describe('cSSVariableGenerator', () => {
  let generator: CSSVariableGenerator

  beforeEach(() => {
    generator = new CSSVariableGenerator('--test')
  })

  describe('构造函数', () => {
    it('应该使用默认前缀', () => {
      const defaultGenerator = new CSSVariableGenerator()
      expect(defaultGenerator.getPrefix()).toBe('--ls')
    })

    it('应该使用自定义前缀', () => {
      expect(generator.getPrefix()).toBe('--test')
    })
  })

  describe('generateVariables', () => {
    it('应该生成完整的CSS变量集合', () => {
      const variables = generator.generateVariables(mediumSizeConfig)

      // 检查字体大小变量
      expect(variables).toHaveProperty('--test-font-size-xs')
      expect(variables).toHaveProperty('--test-font-size-sm')
      expect(variables).toHaveProperty('--test-font-size-base')
      expect(variables).toHaveProperty('--test-font-size-lg')
      expect(variables).toHaveProperty('--test-font-size-xl')
      expect(variables).toHaveProperty('--test-font-size-xxl')
      expect(variables).toHaveProperty('--test-font-size-h1')
      expect(variables).toHaveProperty('--test-font-size-h2')
      expect(variables).toHaveProperty('--test-font-size-h3')
      expect(variables).toHaveProperty('--test-font-size-h4')
      expect(variables).toHaveProperty('--test-font-size-h5')
      expect(variables).toHaveProperty('--test-font-size-h6')

      // 检查间距变量
      expect(variables).toHaveProperty('--test-spacing-xs')
      expect(variables).toHaveProperty('--test-spacing-sm')
      expect(variables).toHaveProperty('--test-spacing-base')
      expect(variables).toHaveProperty('--test-spacing-lg')
      expect(variables).toHaveProperty('--test-spacing-xl')
      expect(variables).toHaveProperty('--test-spacing-xxl')

      // 检查padding和margin变量
      expect(variables).toHaveProperty('--test-padding-xs')
      expect(variables).toHaveProperty('--test-margin-xs')

      // 检查组件变量
      expect(variables).toHaveProperty('--test-button-height-small')
      expect(variables).toHaveProperty('--test-button-height-medium')
      expect(variables).toHaveProperty('--test-button-height-large')
      expect(variables).toHaveProperty('--test-input-height-small')
      expect(variables).toHaveProperty('--test-icon-size-small')
      expect(variables).toHaveProperty('--test-avatar-size-small')

      // 检查边框圆角变量
      expect(variables).toHaveProperty('--test-border-radius-none')
      expect(variables).toHaveProperty('--test-border-radius-sm')
      expect(variables).toHaveProperty('--test-border-radius-base')
      expect(variables).toHaveProperty('--test-border-radius-lg')
      expect(variables).toHaveProperty('--test-border-radius-xl')
      expect(variables).toHaveProperty('--test-border-radius-full')

      // 检查阴影变量
      expect(variables).toHaveProperty('--test-shadow-none')
      expect(variables).toHaveProperty('--test-shadow-sm')
      expect(variables).toHaveProperty('--test-shadow-base')
      expect(variables).toHaveProperty('--test-shadow-lg')
      expect(variables).toHaveProperty('--test-shadow-xl')
    })

    it('应该使用正确的值', () => {
      const variables = generator.generateVariables(mediumSizeConfig)

      expect(variables['--test-font-size-base']).toBe(
        mediumSizeConfig.fontSize.base
      )
      expect(variables['--test-spacing-base']).toBe(
        mediumSizeConfig.spacing.base
      )
      expect(variables['--test-button-height-medium']).toBe(
        mediumSizeConfig.component.buttonHeight.medium
      )
      expect(variables['--test-border-radius-base']).toBe(
        mediumSizeConfig.borderRadius.base
      )
      expect(variables['--test-shadow-base']).toBe(mediumSizeConfig.shadow.base)
    })
  })

  describe('generateCSSString', () => {
    it('应该生成正确的CSS字符串', () => {
      const variables = {
        '--test-font-size': '16px',
        '--test-spacing': '8px',
      }

      const cssString = generator.generateCSSString(variables)

      expect(cssString).toContain(':root {')
      expect(cssString).toContain('--test-font-size: 16px;')
      expect(cssString).toContain('--test-spacing: 8px;')
      expect(cssString).toContain('}')
    })

    it('应该支持自定义选择器', () => {
      const variables = { '--test-var': 'value' }
      const cssString = generator.generateCSSString(
        variables,
        '.custom-selector'
      )

      expect(cssString).toContain('.custom-selector {')
      expect(cssString).toContain('--test-var: value;')
      expect(cssString).toContain('}')
    })
  })

  describe('updatePrefix', () => {
    it('应该更新前缀', () => {
      generator.updatePrefix('--new-prefix')
      expect(generator.getPrefix()).toBe('--new-prefix')
    })

    it('更新前缀后生成的变量应该使用新前缀', () => {
      generator.updatePrefix('--new')
      const variables = generator.generateVariables(mediumSizeConfig)

      expect(variables).toHaveProperty('--new-font-size-base')
      expect(variables).not.toHaveProperty('--test-font-size-base')
    })
  })
})

describe('工厂函数', () => {
  describe('createCSSVariableGenerator', () => {
    it('应该创建新的生成器实例', () => {
      const generator = createCSSVariableGenerator('--custom')
      expect(generator).toBeInstanceOf(CSSVariableGenerator)
      expect(generator.getPrefix()).toBe('--custom')
    })

    it('应该使用默认前缀', () => {
      const generator = createCSSVariableGenerator()
      expect(generator.getPrefix()).toBe('--ls')
    })
  })

  describe('defaultCSSVariableGenerator', () => {
    it('应该是CSSVariableGenerator的实例', () => {
      expect(defaultCSSVariableGenerator).toBeInstanceOf(CSSVariableGenerator)
    })

    it('应该使用默认前缀', () => {
      expect(defaultCSSVariableGenerator.getPrefix()).toBe('--ls')
    })
  })
})
