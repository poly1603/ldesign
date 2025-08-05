/**
 * 性能测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ThemeManager } from '../src/core/theme-manager'
import { ColorGeneratorImpl } from '../src/utils/color-generator'
import { presetThemes } from '../src/themes/presets'

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
      await themeManager.setTheme('blue')
      await themeManager.setTheme('green')
      await themeManager.setMode('dark')
      await themeManager.setMode('light')
    }

    const end = performance.now()
    const averageTime = (end - start) / (iterations * 4)

    console.log(`主题切换平均耗时: ${averageTime.toFixed(2)}ms`)
    expect(averageTime).toBeLessThan(10) // 每次切换应该小于10ms
  })

  it('颜色生成性能测试', () => {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
    const iterations = 50

    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      colors.forEach(color => {
        colorGenerator.generateColors(color)
      })
    }

    const end = performance.now()
    const averageTime = (end - start) / (iterations * colors.length)

    console.log(`颜色生成平均耗时: ${averageTime.toFixed(2)}ms`)
    expect(averageTime).toBeLessThan(5) // 每次生成应该小于5ms
  })

  it('大量主题注册性能测试', () => {
    const start = performance.now()

    // 注册100个主题
    for (let i = 0; i < 100; i++) {
      themeManager.registerTheme({
        name: `test-theme-${i}`,
        displayName: `测试主题 ${i}`,
        colors: {
          primary: `hsl(${i * 3.6}, 70%, 50%)`,
          success: '#52c41a',
          warning: '#faad14',
          danger: '#f5222d',
          info: '#1890ff',
          gray: '#8c8c8c',
        },
      })
    }

    const end = performance.now()
    const averageTime = (end - start) / 100

    console.log(`主题注册平均耗时: ${averageTime.toFixed(2)}ms`)
    expect(averageTime).toBeLessThan(1) // 每次注册应该小于1ms
  })

  it('内存使用测试', async () => {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (window.performance as any)) {
      const memory = (window.performance as any).memory
      const initialMemory = memory.usedJSHeapSize

      // 执行一些操作
      await themeManager.init()
      for (let i = 0; i < 50; i++) {
        await themeManager.setTheme('blue')
        await themeManager.setTheme('green')
        colorGenerator.generateColors('#ff0000')
      }

      const finalMemory = memory.usedJSHeapSize
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024 // MB

      console.log(`内存增长: ${memoryIncrease.toFixed(2)}MB`)
      expect(memoryIncrease).toBeLessThan(5) // 内存增长应该小于5MB
    } else {
      console.log('浏览器不支持内存监控')
    }
  })

  it('并发操作性能测试', async () => {
    await themeManager.init()

    const start = performance.now()

    // 并发执行多个操作
    const promises = []
    for (let i = 0; i < 20; i++) {
      promises.push(themeManager.setTheme('blue'))
      promises.push(themeManager.setMode('dark'))
      promises.push(Promise.resolve(colorGenerator.generateColors('#ff0000')))
    }

    await Promise.all(promises)

    const end = performance.now()
    const totalTime = end - start

    console.log(`并发操作总耗时: ${totalTime.toFixed(2)}ms`)
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

    console.log(`首次生成耗时: ${firstTime.toFixed(2)}ms`)
    console.log(`缓存生成耗时: ${secondTime.toFixed(2)}ms`)

    // 缓存应该显著提升性能
    expect(secondTime).toBeLessThan(firstTime * 0.5)
  })
})
