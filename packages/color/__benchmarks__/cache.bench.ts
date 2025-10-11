/**
 * 缓存性能基准测试
 */

import { bench, describe } from 'vitest'
import { ThemeManager } from '../src/core/theme-manager'

describe('Cache Performance Benchmarks', () => {
  describe('ThemeManager Cache', () => {
    const themes = [
      { name: 'theme1', light: { primary: '#165DFF' } },
      { name: 'theme2', light: { primary: '#FF0000' } },
      { name: 'theme3', light: { primary: '#00FF00' } },
      { name: 'theme4', light: { primary: '#0000FF' } },
      { name: 'theme5', light: { primary: '#FFFF00' } },
    ]

    bench('preGenerate 5 themes', async () => {
      const manager = new ThemeManager({ themes })
      await manager.init()
      
      for (const theme of themes) {
        await manager.preGenerateTheme(theme.name)
      }
      
      manager.destroy()
    })

    bench('getGeneratedTheme (cache hit)', async () => {
      const manager = new ThemeManager({ themes })
      await manager.init()
      await manager.preGenerateTheme('theme1')
      
      // 测试缓存命中
      for (let i = 0; i < 1000; i++) {
        manager.getGeneratedTheme('theme1')
      }
      
      manager.destroy()
    })

    bench('applyTheme 100 times (cached)', async () => {
      const manager = new ThemeManager({ themes })
      await manager.init()
      await manager.preGenerateTheme('theme1')
      
      for (let i = 0; i < 100; i++) {
        manager.applyTheme('theme1', 'light')
      }
      
      manager.destroy()
    })

    bench('switch between 5 themes', async () => {
      const manager = new ThemeManager({ themes })
      await manager.init()
      
      // 预生成所有主题
      for (const theme of themes) {
        await manager.preGenerateTheme(theme.name)
      }
      
      // 在主题之间切换
      for (let i = 0; i < 100; i++) {
        const themeName = themes[i % themes.length].name
        await manager.setTheme(themeName, i % 2 === 0 ? 'light' : 'dark')
      }
      
      manager.destroy()
    })
  })

  describe('Cache Statistics', () => {
    const themes = Array.from({ length: 20 }, (_, i) => ({
      name: `theme${i}`,
      light: { primary: `#${i.toString(16).padStart(6, '0')}FF` },
    }))

    bench('getCacheStats 1000 times', async () => {
      const manager = new ThemeManager({ themes })
      await manager.init()
      
      for (let i = 0; i < 1000; i++) {
        manager.getCacheStats()
      }
      
      manager.destroy()
    })

    bench('cleanupCache after heavy usage', async () => {
      const manager = new ThemeManager({ themes, cache: { maxSize: 10 } })
      await manager.init()
      
      // 生成超过缓存限制的主题
      for (const theme of themes) {
        await manager.preGenerateTheme(theme.name)
      }
      
      // 测试清理性能
      manager.cleanupCache()
      
      manager.destroy()
    })
  })
})
