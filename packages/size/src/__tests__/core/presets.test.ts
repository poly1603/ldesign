/**
 * 预设配置测试
 */

import { describe, it, expect } from 'vitest'
import {
  smallSizeConfig,
  mediumSizeConfig,
  largeSizeConfig,
  extraLargeSizeConfig,
  sizeConfigs,
  getSizeConfig,
  getAvailableModes,
} from '../../core/presets'
import type { SizeMode } from '../../types'

describe('presets', () => {
  describe('预设配置', () => {
    it('应该包含所有必需的配置属性', () => {
      const configs = [smallSizeConfig, mediumSizeConfig, largeSizeConfig, extraLargeSizeConfig]
      
      configs.forEach((config) => {
        expect(config).toHaveProperty('fontSize')
        expect(config).toHaveProperty('spacing')
        expect(config).toHaveProperty('component')
        expect(config).toHaveProperty('borderRadius')
        expect(config).toHaveProperty('shadow')
        
        // 检查字体大小配置
        expect(config.fontSize).toHaveProperty('xs')
        expect(config.fontSize).toHaveProperty('sm')
        expect(config.fontSize).toHaveProperty('base')
        expect(config.fontSize).toHaveProperty('lg')
        expect(config.fontSize).toHaveProperty('xl')
        expect(config.fontSize).toHaveProperty('xxl')
        expect(config.fontSize).toHaveProperty('h1')
        expect(config.fontSize).toHaveProperty('h2')
        expect(config.fontSize).toHaveProperty('h3')
        expect(config.fontSize).toHaveProperty('h4')
        expect(config.fontSize).toHaveProperty('h5')
        expect(config.fontSize).toHaveProperty('h6')
        
        // 检查间距配置
        expect(config.spacing).toHaveProperty('xs')
        expect(config.spacing).toHaveProperty('sm')
        expect(config.spacing).toHaveProperty('base')
        expect(config.spacing).toHaveProperty('lg')
        expect(config.spacing).toHaveProperty('xl')
        expect(config.spacing).toHaveProperty('xxl')
        
        // 检查组件配置
        expect(config.component).toHaveProperty('buttonHeight')
        expect(config.component).toHaveProperty('inputHeight')
        expect(config.component).toHaveProperty('iconSize')
        expect(config.component).toHaveProperty('avatarSize')
        
        // 检查边框圆角配置
        expect(config.borderRadius).toHaveProperty('none')
        expect(config.borderRadius).toHaveProperty('sm')
        expect(config.borderRadius).toHaveProperty('base')
        expect(config.borderRadius).toHaveProperty('lg')
        expect(config.borderRadius).toHaveProperty('xl')
        expect(config.borderRadius).toHaveProperty('full')
        
        // 检查阴影配置
        expect(config.shadow).toHaveProperty('none')
        expect(config.shadow).toHaveProperty('sm')
        expect(config.shadow).toHaveProperty('base')
        expect(config.shadow).toHaveProperty('lg')
        expect(config.shadow).toHaveProperty('xl')
      })
    })

    it('应该有正确的尺寸递增关系', () => {
      const baseSmall = parseFloat(smallSizeConfig.fontSize.base)
      const baseMedium = parseFloat(mediumSizeConfig.fontSize.base)
      const baseLarge = parseFloat(largeSizeConfig.fontSize.base)
      const baseExtraLarge = parseFloat(extraLargeSizeConfig.fontSize.base)
      
      expect(baseSmall).toBeLessThan(baseMedium)
      expect(baseMedium).toBeLessThan(baseLarge)
      expect(baseLarge).toBeLessThan(baseExtraLarge)
    })
  })

  describe('sizeConfigs', () => {
    it('应该包含所有尺寸模式', () => {
      expect(sizeConfigs).toHaveProperty('small')
      expect(sizeConfigs).toHaveProperty('medium')
      expect(sizeConfigs).toHaveProperty('large')
      expect(sizeConfigs).toHaveProperty('extra-large')
    })

    it('应该返回正确的配置对象', () => {
      expect(sizeConfigs.small).toBe(smallSizeConfig)
      expect(sizeConfigs.medium).toBe(mediumSizeConfig)
      expect(sizeConfigs.large).toBe(largeSizeConfig)
      expect(sizeConfigs['extra-large']).toBe(extraLargeSizeConfig)
    })
  })

  describe('getSizeConfig', () => {
    it('应该返回正确的配置', () => {
      expect(getSizeConfig('small')).toBe(smallSizeConfig)
      expect(getSizeConfig('medium')).toBe(mediumSizeConfig)
      expect(getSizeConfig('large')).toBe(largeSizeConfig)
      expect(getSizeConfig('extra-large')).toBe(extraLargeSizeConfig)
    })
  })

  describe('getAvailableModes', () => {
    it('应该返回所有可用的尺寸模式', () => {
      const modes = getAvailableModes()
      expect(modes).toEqual(['small', 'medium', 'large', 'extra-large'])
    })

    it('返回的模式应该都是有效的', () => {
      const modes = getAvailableModes()
      modes.forEach((mode) => {
        expect(sizeConfigs).toHaveProperty(mode)
      })
    })
  })
})
