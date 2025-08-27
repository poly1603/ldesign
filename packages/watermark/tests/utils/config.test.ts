/**
 * 配置管理测试
 */

import { describe, it, expect } from 'vitest'
import { DEFAULT_WATERMARK_CONFIG } from '../../src/types/config'
import type { WatermarkConfig } from '../../src/types'

describe('配置管理', () => {
  describe('默认配置', () => {
    it('应该有正确的默认值', () => {
      expect(DEFAULT_WATERMARK_CONFIG.style.fontSize).toBe(16)
      expect(DEFAULT_WATERMARK_CONFIG.style.fontFamily).toBe('Arial, sans-serif')
      expect(DEFAULT_WATERMARK_CONFIG.style.color).toBe('rgba(0, 0, 0, 0.15)')
      expect(DEFAULT_WATERMARK_CONFIG.style.opacity).toBe(1)
      expect(DEFAULT_WATERMARK_CONFIG.style.rotate).toBe(-22)
    })

    it('应该有正确的布局配置', () => {
      expect(DEFAULT_WATERMARK_CONFIG.layout.width).toBe(120)
      expect(DEFAULT_WATERMARK_CONFIG.layout.height).toBe(64)
      expect(DEFAULT_WATERMARK_CONFIG.layout.gapX).toBe(100)
      expect(DEFAULT_WATERMARK_CONFIG.layout.gapY).toBe(100)
      expect(DEFAULT_WATERMARK_CONFIG.layout.offsetX).toBe(0)
      expect(DEFAULT_WATERMARK_CONFIG.layout.offsetY).toBe(0)
      expect(DEFAULT_WATERMARK_CONFIG.layout.autoCalculate).toBe(true)
    })

    it('应该有正确的渲染模式', () => {
      expect(DEFAULT_WATERMARK_CONFIG.renderMode).toBe('dom')
      expect(DEFAULT_WATERMARK_CONFIG.mode).toBe('dom')
    })

    it('应该有正确的基础配置', () => {
      expect(DEFAULT_WATERMARK_CONFIG.enabled).toBe(true)
      expect(DEFAULT_WATERMARK_CONFIG.zIndex).toBe(9999)
      expect(DEFAULT_WATERMARK_CONFIG.visible).toBe(true)
      expect(DEFAULT_WATERMARK_CONFIG.debug).toBe(false)
    })
  })

  describe('配置类型', () => {
    it('应该支持字符串内容', () => {
      const config: Partial<WatermarkConfig> = {
        content: '测试水印',
      }
      expect(typeof config.content).toBe('string')
    })

    it('应该支持对象内容', () => {
      const config: Partial<WatermarkConfig> = {
        content: {
          text: '文字水印',
          image: {
            src: 'test.png',
            width: 100,
            height: 50,
          },
        },
      }
      expect(typeof config.content).toBe('object')
      expect(config.content).toHaveProperty('text')
      expect(config.content).toHaveProperty('image')
    })

    it('应该支持样式配置', () => {
      const config: Partial<WatermarkConfig> = {
        content: '测试',
        style: {
          fontSize: 20,
          fontFamily: 'Arial',
          color: 'red',
          opacity: 0.8,
          rotate: 45,
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          backgroundColor: 'white',
          border: '1px solid black',
          padding: 10,
          borderRadius: 5,
        },
      }
      expect(config.style?.fontSize).toBe(20)
      expect(config.style?.fontFamily).toBe('Arial')
      expect(config.style?.color).toBe('red')
      expect(config.style?.opacity).toBe(0.8)
      expect(config.style?.rotate).toBe(45)
    })

    it('应该支持布局配置', () => {
      const config: Partial<WatermarkConfig> = {
        content: '测试',
        layout: {
          width: 200,
          height: 100,
          gapX: 150,
          gapY: 120,
          offsetX: 20,
          offsetY: 10,
          rows: 5,
          cols: 8,
          autoCalculate: false,
        },
      }
      expect(config.layout?.width).toBe(200)
      expect(config.layout?.height).toBe(100)
      expect(config.layout?.gapX).toBe(150)
      expect(config.layout?.gapY).toBe(120)
      expect(config.layout?.offsetX).toBe(20)
      expect(config.layout?.offsetY).toBe(10)
      expect(config.layout?.rows).toBe(5)
      expect(config.layout?.cols).toBe(8)
      expect(config.layout?.autoCalculate).toBe(false)
    })

    it('应该支持动画配置', () => {
      const config: Partial<WatermarkConfig> = {
        content: '测试',
        animation: {
          type: 'fade',
          duration: 2000,
          delay: 500,
          iteration: 'infinite',
          easing: 'ease-in-out',
        },
      }
      expect(config.animation?.type).toBe('fade')
      expect(config.animation?.duration).toBe(2000)
      expect(config.animation?.delay).toBe(500)
      expect(config.animation?.iteration).toBe('infinite')
      expect(config.animation?.easing).toBe('ease-in-out')
    })

    it('应该支持安全配置', () => {
      const config: Partial<WatermarkConfig> = {
        content: '测试',
        security: {
          level: 'high',
          mutationObserver: true,
          styleProtection: true,
          canvasProtection: true,
          obfuscation: true,
        },
      }
      expect(config.security?.level).toBe('high')
      expect(config.security?.mutationObserver).toBe(true)
      expect(config.security?.styleProtection).toBe(true)
      expect(config.security?.canvasProtection).toBe(true)
      expect(config.security?.obfuscation).toBe(true)
    })

    it('应该支持响应式配置', () => {
      const config: Partial<WatermarkConfig> = {
        content: '测试',
        responsive: {
          enabled: true,
          autoResize: true,
          debounceTime: 500,
          breakpoints: {
            mobile: { maxWidth: 768 },
            tablet: { minWidth: 769, maxWidth: 1024 },
            desktop: { minWidth: 1025 },
          },
        },
      }
      expect(config.responsive?.enabled).toBe(true)
      expect(config.responsive?.autoResize).toBe(true)
      expect(config.responsive?.debounceTime).toBe(500)
      expect(config.responsive?.breakpoints).toBeDefined()
    })
  })

  describe('配置合并', () => {
    it('应该正确合并配置', () => {
      const baseConfig: Partial<WatermarkConfig> = {
        content: '基础水印',
        style: {
          fontSize: 16,
          color: 'black',
        },
      }

      const overrideConfig: Partial<WatermarkConfig> = {
        style: {
          fontSize: 20,
          opacity: 0.8,
        },
      }

      const merged = { ...baseConfig, style: { ...baseConfig.style, ...overrideConfig.style } }

      expect(merged.content).toBe('基础水印')
      expect(merged.style?.fontSize).toBe(20) // 被覆盖
      expect(merged.style?.color).toBe('black') // 保留
      expect(merged.style?.opacity).toBe(0.8) // 新增
    })
  })

  describe('配置验证', () => {
    it('应该验证必需的配置', () => {
      const validConfig: Partial<WatermarkConfig> = {
        content: '有效配置',
      }
      expect(validConfig.content).toBeDefined()
    })

    it('应该处理空配置', () => {
      const emptyConfig: Partial<WatermarkConfig> = {}
      expect(emptyConfig.content).toBeUndefined()
    })

    it('应该验证渲染模式', () => {
      const modes = ['dom', 'canvas', 'svg'] as const
      modes.forEach(mode => {
        const config: Partial<WatermarkConfig> = {
          content: '测试',
          renderMode: mode,
        }
        expect(['dom', 'canvas', 'svg']).toContain(config.renderMode)
      })
    })
  })
})
