/**
 * ThemeManager 单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ThemeManager } from '../../src/core/theme-manager'
import { VideoPlayer } from '../../src/core/player'
import { defaultTheme } from '../../themes/default'
import { darkTheme } from '../../themes/dark'
import { lightTheme } from '../../themes/light'
import { createMockContainer, cleanup, mockMediaQuery } from '../setup'
import type { Theme } from '../../src/types'

describe('ThemeManager', () => {
  let container: HTMLElement
  let player: VideoPlayer
  let themeManager: ThemeManager

  beforeEach(async () => {
    container = createMockContainer()
    player = new VideoPlayer({
      container,
      src: 'test-video.mp4'
    })
    await player.initialize()
    themeManager = new ThemeManager(player)
  })

  afterEach(() => {
    if (player) {
      player.destroy()
    }
    cleanup()
  })

  describe('构造函数', () => {
    it('应该正确创建主题管理器实例', () => {
      expect(themeManager).toBeInstanceOf(ThemeManager)
      expect(themeManager.player).toBe(player)
    })

    it('应该注册默认主题', () => {
      expect(themeManager.has('default')).toBe(true)
      expect(themeManager.has('dark')).toBe(true)
      expect(themeManager.has('light')).toBe(true)
    })
  })

  describe('主题注册', () => {
    it('应该能够注册自定义主题', () => {
      const customTheme: Theme = {
        name: 'custom',
        colors: {
          primary: '#ff0000',
          background: '#000000',
          text: '#ffffff',
          control: '#333333'
        }
      }

      themeManager.register(customTheme)

      expect(themeManager.has('custom')).toBe(true)
      expect(themeManager.get('custom')).toBe(customTheme)
    })

    it('应该覆盖同名主题', () => {
      const customTheme1: Theme = {
        name: 'custom',
        colors: {
          primary: '#ff0000',
          background: '#000000',
          text: '#ffffff',
          control: '#333333'
        }
      }

      const customTheme2: Theme = {
        name: 'custom',
        colors: {
          primary: '#00ff00',
          background: '#111111',
          text: '#eeeeee',
          control: '#444444'
        }
      }

      themeManager.register(customTheme1)
      themeManager.register(customTheme2)

      expect(themeManager.get('custom')).toBe(customTheme2)
    })

    it('应该能够批量注册主题', () => {
      const themes: Theme[] = [
        {
          name: 'theme1',
          colors: {
            primary: '#ff0000',
            background: '#000000',
            text: '#ffffff',
            control: '#333333'
          }
        },
        {
          name: 'theme2',
          colors: {
            primary: '#00ff00',
            background: '#111111',
            text: '#eeeeee',
            control: '#444444'
          }
        }
      ]

      themeManager.registerAll(themes)

      expect(themeManager.has('theme1')).toBe(true)
      expect(themeManager.has('theme2')).toBe(true)
    })
  })

  describe('主题应用', () => {
    it('应该能够通过名称设置主题', () => {
      themeManager.setTheme('dark')

      expect(themeManager.currentTheme).toBe(darkTheme)
    })

    it('应该能够通过主题对象设置主题', () => {
      const customTheme: Theme = {
        name: 'custom',
        colors: {
          primary: '#ff0000',
          background: '#000000',
          text: '#ffffff',
          control: '#333333'
        }
      }

      themeManager.setTheme(customTheme)

      expect(themeManager.currentTheme).toBe(customTheme)
    })

    it('应该抛出错误当主题不存在时', () => {
      expect(() => {
        themeManager.setTheme('nonexistent')
      }).toThrow('Theme "nonexistent" is not registered')
    })

    it('应该应用主题的CSS变量', () => {
      const customTheme: Theme = {
        name: 'custom',
        colors: {
          primary: '#ff0000',
          background: '#000000',
          text: '#ffffff',
          control: '#333333'
        }
      }

      themeManager.setTheme(customTheme)

      const style = container.style
      expect(style.getPropertyValue('--lv-color-primary')).toBe('#ff0000')
      expect(style.getPropertyValue('--lv-color-background')).toBe('#000000')
      expect(style.getPropertyValue('--lv-color-text')).toBe('#ffffff')
      expect(style.getPropertyValue('--lv-color-control')).toBe('#333333')
    })

    it('应该应用主题的自定义CSS', () => {
      const customTheme: Theme = {
        name: 'custom',
        colors: {
          primary: '#ff0000',
          background: '#000000',
          text: '#ffffff',
          control: '#333333'
        },
        css: '.lv-player { border-radius: 10px; }'
      }

      themeManager.setTheme(customTheme)

      const styleElement = document.querySelector('style[data-theme="custom"]')
      expect(styleElement).toBeTruthy()
      expect(styleElement?.textContent).toContain('border-radius: 10px')
    })

    it('应该触发主题变化事件', () => {
      const handler = vi.fn()
      themeManager.on('themechange', handler)

      themeManager.setTheme('dark')

      expect(handler).toHaveBeenCalledWith({
        theme: darkTheme,
        previousTheme: defaultTheme
      })
    })
  })

  describe('响应式主题', () => {
    it('应该根据屏幕尺寸应用响应式样式', () => {
      const responsiveTheme: Theme = {
        name: 'responsive',
        colors: {
          primary: '#ff0000',
          background: '#000000',
          text: '#ffffff',
          control: '#333333'
        },
        responsive: {
          mobile: {
            fontSize: '14px',
            controlHeight: '40px'
          },
          tablet: {
            fontSize: '16px',
            controlHeight: '44px'
          },
          desktop: {
            fontSize: '18px',
            controlHeight: '48px'
          }
        }
      }

      // 模拟移动端
      mockMediaQuery('(max-width: 768px)', true)
      themeManager.setTheme(responsiveTheme)

      const style = container.style
      expect(style.getPropertyValue('--lv-font-size')).toBe('14px')
      expect(style.getPropertyValue('--lv-control-height')).toBe('40px')
    })

    it('应该监听媒体查询变化', () => {
      const responsiveTheme: Theme = {
        name: 'responsive',
        colors: {
          primary: '#ff0000',
          background: '#000000',
          text: '#ffffff',
          control: '#333333'
        },
        responsive: {
          mobile: {
            fontSize: '14px'
          },
          desktop: {
            fontSize: '18px'
          }
        }
      }

      themeManager.setTheme(responsiveTheme)

      // 模拟屏幕尺寸变化
      const mediaQuery = mockMediaQuery('(max-width: 768px)', false)
      themeManager.setTheme(responsiveTheme)

      // 触发媒体查询变化
      mediaQuery.matches = true
      if (mediaQuery.onchange) {
        mediaQuery.onchange(mediaQuery as any)
      }

      const style = container.style
      expect(style.getPropertyValue('--lv-font-size')).toBe('14px')
    })
  })

  describe('主题查询', () => {
    it('应该能够检查主题是否存在', () => {
      expect(themeManager.has('default')).toBe(true)
      expect(themeManager.has('dark')).toBe(true)
      expect(themeManager.has('light')).toBe(true)
      expect(themeManager.has('nonexistent')).toBe(false)
    })

    it('应该能够获取主题实例', () => {
      const theme = themeManager.get('dark')
      expect(theme).toBe(darkTheme)
    })

    it('应该返回undefined当主题不存在时', () => {
      const theme = themeManager.get('nonexistent')
      expect(theme).toBeUndefined()
    })

    it('应该能够获取所有主题', () => {
      const themes = themeManager.getAll()
      expect(themes).toHaveLength(3)
      expect(themes.map(t => t.name)).toEqual(['default', 'dark', 'light'])
    })

    it('应该能够获取当前主题', () => {
      expect(themeManager.currentTheme).toBe(defaultTheme)

      themeManager.setTheme('dark')
      expect(themeManager.currentTheme).toBe(darkTheme)
    })
  })

  describe('主题移除', () => {
    it('应该能够移除自定义主题', () => {
      const customTheme: Theme = {
        name: 'custom',
        colors: {
          primary: '#ff0000',
          background: '#000000',
          text: '#ffffff',
          control: '#333333'
        }
      }

      themeManager.register(customTheme)
      expect(themeManager.has('custom')).toBe(true)

      themeManager.unregister('custom')
      expect(themeManager.has('custom')).toBe(false)
    })

    it('应该不能移除内置主题', () => {
      expect(() => {
        themeManager.unregister('default')
      }).toThrow('Cannot unregister built-in theme "default"')

      expect(() => {
        themeManager.unregister('dark')
      }).toThrow('Cannot unregister built-in theme "dark"')

      expect(() => {
        themeManager.unregister('light')
      }).toThrow('Cannot unregister built-in theme "light"')
    })

    it('应该在移除当前主题时切换到默认主题', () => {
      const customTheme: Theme = {
        name: 'custom',
        colors: {
          primary: '#ff0000',
          background: '#000000',
          text: '#ffffff',
          control: '#333333'
        }
      }

      themeManager.register(customTheme)
      themeManager.setTheme('custom')

      expect(themeManager.currentTheme).toBe(customTheme)

      themeManager.unregister('custom')
      expect(themeManager.currentTheme).toBe(defaultTheme)
    })

    it('应该移除主题的样式元素', () => {
      const customTheme: Theme = {
        name: 'custom',
        colors: {
          primary: '#ff0000',
          background: '#000000',
          text: '#ffffff',
          control: '#333333'
        },
        css: '.lv-player { border-radius: 10px; }'
      }

      themeManager.register(customTheme)
      themeManager.setTheme('custom')

      let styleElement = document.querySelector('style[data-theme="custom"]')
      expect(styleElement).toBeTruthy()

      themeManager.unregister('custom')

      styleElement = document.querySelector('style[data-theme="custom"]')
      expect(styleElement).toBeFalsy()
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的主题对象', () => {
      expect(() => {
        themeManager.register({} as Theme)
      }).toThrow('Theme must have a name')

      expect(() => {
        themeManager.register({
          name: 'invalid'
        } as Theme)
      }).toThrow('Theme must have colors')
    })

    it('应该处理CSS应用错误', () => {
      const invalidTheme: Theme = {
        name: 'invalid',
        colors: {
          primary: '#ff0000',
          background: '#000000',
          text: '#ffffff',
          control: '#333333'
        },
        css: 'invalid css {'
      }

      // 应该不抛出错误，但会在控制台输出警告
      expect(() => {
        themeManager.setTheme(invalidTheme)
      }).not.toThrow()
    })
  })

  describe('销毁', () => {
    it('应该正确销毁主题管理器', () => {
      const customTheme: Theme = {
        name: 'custom',
        colors: {
          primary: '#ff0000',
          background: '#000000',
          text: '#ffffff',
          control: '#333333'
        },
        css: '.lv-player { border-radius: 10px; }'
      }

      themeManager.register(customTheme)
      themeManager.setTheme('custom')

      themeManager.destroy()

      // 检查样式元素是否被移除
      const styleElements = document.querySelectorAll('style[data-theme]')
      expect(styleElements).toHaveLength(0)

      // 检查CSS变量是否被清除
      const style = container.style
      expect(style.getPropertyValue('--lv-color-primary')).toBe('')
    })

    it('应该移除媒体查询监听器', () => {
      // 创建一个新的ThemeManager来测试媒体查询清理
      const mockMQ = mockMediaQuery('(prefers-color-scheme: dark)', false)

      // 创建新的播放器和主题管理器（这时会使用模拟的媒体查询）
      const testContainer = createMockContainer()
      const testPlayer = new VideoPlayer({
        container: testContainer,
        src: 'test-video.mp4'
      })

      // 手动初始化播放器状态
      testPlayer['_initialized'] = true
      testPlayer['_status'].state = 'loaded'

      const testThemeManager = new ThemeManager(testPlayer)

      testThemeManager.destroy()

      expect(mockMQ.removeEventListener).toHaveBeenCalled()
    })
  })
})
