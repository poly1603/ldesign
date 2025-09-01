/// <reference path="../global.d.ts" />
import { expect, test } from '@playwright/test'

test.describe('LDesign Engine 基础功能', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到测试页面
    await page.goto('/examples/basic/')
  })

  test('应该成功加载引擎', async ({ page }) => {
    // 等待引擎加载完成
    await page.waitForFunction(() => window.engine !== undefined)

    // 检查引擎是否正确初始化
    const engineExists = await page.evaluate(() => {
      return typeof window.engine === 'object' && window.engine !== null
    })

    expect(engineExists).toBe(true)
  })

  test('应该显示引擎版本信息', async ({ page }) => {
    // 等待版本信息显示
    await page.waitForSelector('[data-testid="engine-version"]')

    const version = await page.textContent('[data-testid="engine-version"]')
    expect(version).toMatch(/\d+\.\d+\.\d+/)
  })

  test('应该正确初始化所有管理器', async ({ page }) => {
    // 等待管理器状态显示
    await page.waitForSelector('[data-testid="managers-status"]')

    const managersStatus = await page.evaluate(() => {
      return window.engine.getManagerStats()
    })

    expect(managersStatus).toBeDefined()
    expect(managersStatus.initialized).toBeGreaterThan(0)
  })

  test('应该支持配置管理', async ({ page }) => {
    // 测试配置设置
    await page.evaluate(() => {
      window.engine.config.set('test.key', 'test-value')
    })

    const configValue = await page.evaluate(() => {
      return window.engine.config.get('test.key')
    })

    expect(configValue).toBe('test-value')
  })

  test('应该支持事件系统', async ({ page }) => {
    // 测试事件监听和触发
    const eventResult = await page.evaluate(() => {
      return new Promise((resolve) => {
        window.engine.events.on('test-event', (data) => {
          resolve(data)
        })

        window.engine.events.emit('test-event', { message: 'hello' })
      })
    })

    expect(eventResult).toEqual({ message: 'hello' })
  })

  test('应该支持状态管理', async ({ page }) => {
    // 测试状态设置和获取
    await page.evaluate(() => {
      window.engine.state.set('user', { name: 'John', age: 30 })
    })

    const userState = await page.evaluate(() => {
      return window.engine.state.get('user')
    })

    expect(userState).toEqual({ name: 'John', age: 30 })
  })

  test('应该支持状态监听', async ({ page }) => {
    // 测试状态变化监听
    const stateChangeResult = await page.evaluate(() => {
      return new Promise((resolve) => {
        window.engine.state.watch('counter', (newValue) => {
          resolve(newValue)
        })

        window.engine.state.set('counter', 42)
      })
    })

    expect(stateChangeResult).toBe(42)
  })

  test('应该正确处理环境检测', async ({ page }) => {
    const envInfo = await page.evaluate(() => {
      return window.engine.environment.detect()
    }) as any

    expect(envInfo).toBeDefined()
    expect(envInfo.platform).toBe('browser')
    expect(envInfo.environment).toBeDefined()
    expect(envInfo.browser).toBeDefined()
    expect(envInfo.device).toBeDefined()
  })

  test('应该支持插件注册', async ({ page }) => {
    // 测试插件注册
    const pluginRegistered = await page.evaluate(async () => {
      const testPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: (context: any) => {
          ; (context.engine as any).testPluginInstalled = true
        },
      }

      await window.engine.plugins.register(testPlugin)
      return (window.engine as any).testPluginInstalled === true
    })

    expect(pluginRegistered).toBe(true)
  })

  test('应该支持通知显示', async ({ page }) => {
    // 测试通知显示
    await page.evaluate(() => {
      window.engine.notifications.show({
        type: 'info',
        message: 'Test notification',
        duration: 1000,
      })
    })

    // 等待通知出现
    await page.waitForSelector('.notification', { timeout: 2000 })

    const notificationText = await page.textContent('.notification')
    expect(notificationText).toContain('Test notification')
  })

  test('应该支持错误处理', async ({ page }) => {
    // 测试错误捕获
    const errorCaptured = await page.evaluate(() => {
      const testError = new Error('Test error')
      window.engine.errors.captureError(testError, {
        context: 'test',
        action: 'error-test',
      })

      const errors = window.engine.errors.getErrors()
      return errors.length > 0 && errors[0].message === 'Test error'
    })

    expect(errorCaptured).toBe(true)
  })

  test('应该支持生命周期钩子', async ({ page }) => {
    // 测试生命周期钩子
    const hookExecuted = await page.evaluate(() => {
      return new Promise((resolve) => {
        window.engine.lifecycle.on('test-phase', () => {
          resolve(true)
        })

        window.engine.lifecycle.execute('test-phase', window.engine)
      })
    })

    expect(hookExecuted).toBe(true)
  })

  test('应该支持性能监控', async ({ page }) => {
    // 测试性能监控
    const performanceData = await page.evaluate(() => {
      ; (window.engine.performance as any).recordEvent({
        type: 'custom',
        name: 'test-operation',
        startTime: Date.now(),
        duration: 100,
      })

      return window.engine.performance.getMetrics()
    })

    expect(performanceData).toBeDefined()
    expect(performanceData.events).toBeDefined()
  })

  test('应该支持缓存功能', async ({ page }) => {
    // 测试缓存功能
    await page.evaluate(() => {
      window.engine.cache.set('test-key', 'test-value', 60000)
    })

    const cachedValue = await page.evaluate(() => {
      return window.engine.cache.get('test-key')
    })

    expect(cachedValue).toBe('test-value')
  })

  test('应该支持安全验证', async ({ page }) => {
    // 测试安全验证
    const isValidInput = await page.evaluate(() => {
      return window.engine.security.validateInput('<script>alert("xss")</script>', 'html')
    })

    expect(isValidInput).toBe(false)
  })
})
