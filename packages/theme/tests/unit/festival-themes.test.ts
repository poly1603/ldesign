/**
 * @ldesign/theme - 节日主题测试
 */

import { describe, it, expect } from 'vitest'
import { springFestivalTheme } from '../../src/themes/spring-festival'
import { christmasTheme } from '../../src/themes/christmas'
import { halloweenTheme } from '../../src/themes/halloween'
import { valentinesDayTheme } from '../../src/themes/valentines-day'
import { midAutumnTheme } from '../../src/themes/mid-autumn'
import {
  presetThemes,
  festivalThemes,
  getPresetTheme,
  getFestivalTheme,
  getSeasonalThemes,
  searchThemes,
  validateTheme,
} from '../../src/themes/presets'
import type { ThemeConfig } from '../../src/core/types'

describe('节日主题', () => {
  describe('主题配置验证', () => {
    const themes = [
      { name: '春节主题', theme: springFestivalTheme },
      { name: '圣诞节主题', theme: christmasTheme },
      { name: '万圣节主题', theme: halloweenTheme },
      { name: '情人节主题', theme: valentineTheme },
      { name: '中秋节主题', theme: midAutumnTheme },
    ]

    themes.forEach(({ name, theme }) => {
      describe(name, () => {
        it('应该有正确的基本信息', () => {
          expect(theme.name).toBeTruthy()
          expect(theme.displayName).toBeTruthy()
          expect(theme.description).toBeTruthy()
          expect(theme.version).toBeTruthy()
          expect(theme.author).toBeTruthy()
        })

        it('应该有正确的分类', () => {
          expect(theme.category).toBe('festival')
          expect(theme.festival).toBeTruthy()
        })

        it('应该有完整的颜色配置', () => {
          expect(theme.colors).toBeTruthy()
          expect(theme.colors.name).toBeTruthy()
          expect(theme.colors.displayName).toBeTruthy()
          expect(theme.colors.light).toBeTruthy()
          expect(theme.colors.dark).toBeTruthy()

          // 检查必需的颜色
          const requiredColors = [
            'primary',
            'secondary',
            'accent',
            'background',
            'surface',
            'text',
            'textSecondary',
            'border',
            'success',
            'warning',
            'error',
            'info',
          ]

          requiredColors.forEach(color => {
            expect(theme.colors.light[color]).toBeTruthy()
            expect(theme.colors.dark[color]).toBeTruthy()
          })
        })

        it('应该有装饰元素配置', () => {
          expect(Array.isArray(theme.decorations)).toBe(true)

          theme.decorations.forEach(decoration => {
            expect(decoration.id).toBeTruthy()
            expect(decoration.name).toBeTruthy()
            expect(decoration.type).toBeTruthy()
            expect(decoration.position).toBeTruthy()
            expect(decoration.style).toBeTruthy()
          })
        })

        it('应该有动画配置', () => {
          expect(Array.isArray(theme.animations)).toBe(true)

          theme.animations.forEach(animation => {
            expect(animation.name).toBeTruthy()
            expect(animation.type).toBeTruthy()
            expect(animation.keyframes).toBeTruthy()
            expect(animation.options).toBeTruthy()
            expect(animation.options.duration).toBeGreaterThan(0)
          })
        })

        it('应该有资源配置', () => {
          expect(theme.resources).toBeTruthy()
          expect(Array.isArray(theme.resources.preload)).toBe(true)
        })

        it('应该有配置选项', () => {
          expect(theme.options).toBeTruthy()
          expect(typeof theme.options.autoActivate).toBe('boolean')
          expect(theme.options.performance).toBeTruthy()
        })

        it('应该有元数据', () => {
          expect(theme.metadata).toBeTruthy()
          expect(Array.isArray(theme.metadata.tags)).toBe(true)
          expect(Array.isArray(theme.metadata.keywords)).toBe(true)
        })

        it('应该通过主题验证', () => {
          const validation = validateTheme(theme)
          expect(validation.valid).toBe(true)
          expect(validation.errors).toHaveLength(0)
        })
      })
    })
  })

  describe('主题预设管理', () => {
    it('应该包含所有节日主题', () => {
      expect(presetThemes).toContain(springFestivalTheme)
      expect(presetThemes).toContain(christmasTheme)
      expect(presetThemes).toContain(halloweenTheme)
      expect(presetThemes).toContain(valentineTheme)
      expect(presetThemes).toContain(midAutumnTheme)
    })

    it('应该能够通过名称获取主题', () => {
      expect(getPresetTheme('spring-festival')).toBe(springFestivalTheme)
      expect(getPresetTheme('christmas')).toBe(christmasTheme)
      expect(getPresetTheme('halloween')).toBe(halloweenTheme)
      expect(getPresetTheme('valentine')).toBe(valentineTheme)
      expect(getPresetTheme('mid-autumn')).toBe(midAutumnTheme)
    })

    it('应该能够通过节日类型获取主题', () => {
      expect(getFestivalTheme('spring-festival')).toBe(springFestivalTheme)
      expect(getFestivalTheme('christmas')).toBe(christmasTheme)
      expect(getFestivalTheme('halloween')).toBe(halloweenTheme)
      expect(getFestivalTheme('valentine')).toBe(valentineTheme)
    })

    it('获取不存在的主题应该返回undefined', () => {
      expect(getPresetTheme('non-existent')).toBeUndefined()
      expect(getFestivalTheme('non-existent' as any)).toBeUndefined()
    })
  })

  describe('季节性主题推荐', () => {
    it('应该根据月份推荐正确的主题', () => {
      // 模拟不同月份
      const originalDate = Date

      // 12月 - 圣诞节
      global.Date = class extends originalDate {
        getMonth() {
          return 11
        } // 12月
      } as any
      expect(getSeasonalThemes()).toContain(christmasTheme)

      // 2月 - 春节
      global.Date = class extends originalDate {
        getMonth() {
          return 1
        } // 2月
      } as any
      expect(getSeasonalThemes()).toContain(springFestivalTheme)

      // 10月 - 万圣节
      global.Date = class extends originalDate {
        getMonth() {
          return 9
        } // 10月
      } as any
      expect(getSeasonalThemes()).toContain(halloweenTheme)

      // 恢复原始Date
      global.Date = originalDate
    })
  })

  describe('主题搜索', () => {
    it('应该能够按名称搜索主题', () => {
      const results = searchThemes('春节')
      expect(results).toContain(springFestivalTheme)
    })

    it('应该能够按描述搜索主题', () => {
      const results = searchThemes('圣诞')
      expect(results).toContain(christmasTheme)
    })

    it('应该能够按标签搜索主题', () => {
      const results = searchThemes('festival')
      expect(results.length).toBeGreaterThan(0)
    })

    it('搜索不存在的内容应该返回空数组', () => {
      const results = searchThemes('不存在的主题')
      expect(results).toHaveLength(0)
    })

    it('应该支持大小写不敏感搜索', () => {
      const results1 = searchThemes('CHRISTMAS')
      const results2 = searchThemes('christmas')
      expect(results1).toEqual(results2)
    })
  })

  describe('主题特性验证', () => {
    it('春节主题应该有红金配色', () => {
      const colors = springFestivalTheme.colors.light
      expect(colors.primary).toMatch(/#[dD][cC]2626|#[rR][eE][dD]/)
      expect(colors.secondary).toMatch(/#[fF]59[eE]0[bB]|#[gG][oO][lL][dD]/)
    })

    it('圣诞节主题应该有红绿配色', () => {
      const colors = christmasTheme.colors.light
      // 应该包含红色和绿色元素
      expect(
        colors.primary.toLowerCase().includes('16a34a') ||
        colors.secondary.toLowerCase().includes('dc2626')
      ).toBe(true)
    })

    it('情人节主题应该有粉红配色', () => {
      const colors = valentineTheme.colors.light
      expect(colors.primary).toMatch(/#[eE][cC]4899|#[pP][iI][nN][kK]/)
    })

    it('万圣节主题应该有橙黑配色', () => {
      const colors = halloweenTheme.colors.light
      // 应该包含橙色元素
      expect(
        colors.primary.toLowerCase().includes('ea580c') ||
        colors.secondary.toLowerCase().includes('f97316')
      ).toBe(true)
    })

    it('中秋节主题应该有金黄配色', () => {
      const colors = midAutumnTheme.colors.light
      expect(colors.primary).toMatch(/#[fF]59[eE]0[bB]|#[gG][oO][lL][dD]/)
    })
  })

  describe('装饰元素验证', () => {
    it('每个主题都应该有特色装饰元素', () => {
      // 春节主题应该有灯笼相关装饰
      expect(
        springFestivalTheme.decorations.some(
          d => d.name.includes('灯笼') || d.id.includes('lantern')
        )
      ).toBe(true)

      // 情人节主题应该有爱心装饰
      expect(
        valentineTheme.decorations.some(
          d => d.name.includes('爱心') || d.id.includes('heart')
        )
      ).toBe(true)

      // 中秋节主题应该有月亮装饰
      expect(
        midAutumnTheme.decorations.some(
          d => d.name.includes('月') || d.id.includes('moon')
        )
      ).toBe(true)
    })

    it('装饰元素应该有正确的位置配置', () => {
      presetThemes.forEach(theme => {
        theme.decorations.forEach(decoration => {
          expect(decoration.position.type).toMatch(
            /^(absolute|relative|fixed|sticky)$/
          )
          expect(decoration.position.position).toBeTruthy()
          expect(decoration.position.position.x).toBeTruthy()
          expect(decoration.position.position.y).toBeTruthy()
        })
      })
    })
  })

  describe('动画效果验证', () => {
    it('每个主题都应该有动画效果', () => {
      presetThemes.forEach(theme => {
        expect(theme.animations.length).toBeGreaterThan(0)
      })
    })

    it('动画应该有合理的持续时间', () => {
      presetThemes.forEach(theme => {
        theme.animations.forEach(animation => {
          expect(animation.options.duration).toBeGreaterThan(100)
          expect(animation.options.duration).toBeLessThan(10000)
        })
      })
    })

    it('动画应该有正确的关键帧配置', () => {
      presetThemes.forEach(theme => {
        theme.animations.forEach(animation => {
          expect(animation.keyframes).toBeTruthy()
          expect(typeof animation.keyframes).toBe('object')
        })
      })
    })
  })
})
