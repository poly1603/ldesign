/**
 * 性能测试
 */

import { beforeEach, describe, expect, it } from 'vitest'
import { ThemeManager } from '../src/core/theme-manager'
import { presetThemes } from '../src/themes/presets'
import { ColorGeneratorImpl } from '../src/utils/color-generator'

describe('性能测试', () => {
  let themeManager: ThemeManager
  let colorGenerator: ColorGeneratorImpl

  beforeEach(() => {
    themeManager = new ThemeManager({
      themes: presetThemes,
    })
    colorGenerator = new ColorGeneratorImpl()
  })

  it('主题切换性能测试', async () => {
    await themeManager.init()

    const iterations = 100
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      await themeManager.setTheme('default')
      await themeManager.setTheme('green')
      await themeManager.setMode('dark')
      await themeManager.setMode('light')
    }

    const end = performance.now()
    const averageTime = (end - start) / (iterations * 4)

    // Theme switching performance tracked
    expect(averageTime).toBeLessThan(10) // 每次切换应该小于10ms
  })

  it('颜色生成性能测试', () => {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
    const iterations = 50

    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      colors.forEach((color) => {
        colorGenerator.generateColors(color)
      })
    }

    const end = performance.now()
    const averageTime = (end - start) / (iterations * colors.length)

    // Color generation performance tracked
    expect(averageTime).toBeLessThan(5) // 每次生成应该小于5ms
  })

  it('大量主题注册性能测试', () => {
    const start = performance.now()

    // 生成颜色数组（使用hex格式）
    const colors = [
      '#ff0000',
      '#ff4000',
      '#ff8000',
      '#ffbf00',
      '#ffff00',
      '#bfff00',
      '#80ff00',
      '#40ff00',
      '#00ff00',
      '#00ff40',
      '#00ff80',
      '#00ffbf',
      '#00ffff',
      '#00bfff',
      '#0080ff',
      '#0040ff',
      '#0000ff',
      '#4000ff',
      '#8000ff',
      '#bf00ff',
    ]

    // 注册20个主题（减少数量以快速测试）
    for (let i = 0; i < 20; i++) {
      themeManager.registerTheme({
        name: `test-theme-${i}`,
        displayName: `测试主题 ${i}`,
        light: {
          primary: colors[i % colors.length],
        },
      })
    }

    const end = performance.now()
    const averageTime = (end - start) / 20

    // Theme registration performance tracked
    expect(averageTime).toBeLessThan(5) // 每次注册应该小于5ms
  })

  it('内存使用测试', async () => {
    if (
      typeof window !== 'undefined'
      && 'performance' in window
      && 'memory' in (window.performance as any)
    ) {
      const memory = (window.performance as any).memory
      const initialMemory = memory.usedJSHeapSize

      // 执行一些操作
      await themeManager.init()
      for (let i = 0; i < 50; i++) {
        await themeManager.setTheme('default')
        await themeManager.setTheme('green')
        colorGenerator.generateColors('#ff0000')
      }

      const finalMemory = memory.usedJSHeapSize
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024 // MB

      // Memory increase tracked
      expect(memoryIncrease).toBeLessThan(5) // 内存增长应该小于5MB
    }
    else {
      // Browser doesn't support memory monitoring
    }
  })

  it('并发操作性能测试', async () => {
    await themeManager.init()

    const start = performance.now()

    // 并发执行多个操作
    const promises = []
    for (let i = 0; i < 20; i++) {
      promises.push(themeManager.setTheme('default'))
      promises.push(themeManager.setMode('dark'))
      promises.push(Promise.resolve(colorGenerator.generateColors('#ff0000')))
    }

    await Promise.all(promises)

    const end = performance.now()
    const totalTime = end - start

    // Concurrent operation timing tracked
    expect(totalTime).toBeLessThan(100) // 总时间应该小于100ms
  })

  it('缓存效果测试', () => {
    const color = '#ff0000'

    // 第一次生成（无缓存）
    const start1 = performance.now()
    colorGenerator.generateColors(color)
    const end1 = performance.now()
    const firstTime = end1 - start1

    // 第二次生成（有缓存）
    const start2 = performance.now()
    colorGenerator.generateColors(color)
    const end2 = performance.now()
    const secondTime = end2 - start2

    // Performance timing tracked for cache effectiveness

    // 缓存应该显著提升性能
    expect(secondTime).toBeLessThan(firstTime * 0.5)
  })
})
