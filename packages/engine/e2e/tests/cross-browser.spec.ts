/// <reference path="../global.d.ts" />
import { devices, expect, test } from '@playwright/test'

test.describe('跨浏览器兼容性测试', () => {
  const browsers = [
    { name: 'Chromium', device: devices['Desktop Chrome'] },
    { name: 'Firefox', device: devices['Desktop Firefox'] },
    { name: 'WebKit', device: devices['Desktop Safari'] },
  ]

  browsers.forEach(({ name, device }) => {
    test.describe(`${name} 浏览器`, () => {


      test('应该正确加载引擎', async ({ page }) => {
        await page.goto('/examples/basic/')

        // 等待引擎加载
        await page.waitForFunction(() => window.engine !== undefined)

        const engineLoaded = await page.evaluate(() => {
          return typeof window.engine === 'object' && window.engine !== null
        })

        expect(engineLoaded).toBe(true)
      })

      test('应该支持所有核心功能', async ({ page }) => {
        await page.goto('/examples/basic/')
        await page.waitForFunction(() => window.engine !== undefined)

        // 测试配置管理
        await page.evaluate(() => {
          window.engine.config.set('browser-test', name)
        })

        const configValue = await page.evaluate(() => {
          return window.engine.config.get('browser-test')
        })

        expect(configValue).toBe(name)

        // 测试事件系统
        const eventResult = await page.evaluate(() => {
          return new Promise((resolve) => {
            window.engine.events.on('browser-test', resolve)
            window.engine.events.emit('browser-test', 'success')
          })
        })

        expect(eventResult).toBe('success')

        // 测试状态管理
        await page.evaluate(() => {
          window.engine.state.set('browser', name)
        })

        const stateValue = await page.evaluate(() => {
          return window.engine.state.get('browser')
        })

        expect(stateValue).toBe(name)
      })

      test('应该正确检测浏览器环境', async ({ page }) => {
        await page.goto('/examples/basic/')
        await page.waitForFunction(() => window.engine !== undefined)

        const envInfo = await page.evaluate(() => {
          return window.engine.environment.detect()
        }) as any

        expect(envInfo.platform).toBe('browser')
        expect(envInfo.browser.name).toBeDefined()
        expect(envInfo.device.type).toBeDefined()
      })

      test('应该支持本地存储', async ({ page }) => {
        await page.goto('/examples/basic/')
        await page.waitForFunction(() => window.engine !== undefined)

        // 测试本地存储功能
        const storageSupported = await page.evaluate(() => {
          try {
            localStorage.setItem('test', 'value')
            const value = localStorage.getItem('test')
            localStorage.removeItem('test')
            return value === 'value'
          }
          catch {
            return false
          }
        })

        expect(storageSupported).toBe(true)
      })

      test('应该支持现代 JavaScript 特性', async ({ page }) => {
        await page.goto('/examples/basic/')

        const featuresSupported = await page.evaluate(() => {
          const features = {
            promises: typeof Promise !== 'undefined',
            asyncAwait: (async () => { })().constructor.name === 'AsyncFunction',
            arrow: (() => { }).constructor.name === 'Function',
            destructuring: (() => {
              try {
                const [a] = [1]
                const { b } = { b: 2 }
                return a === 1 && b === 2
              }
              catch {
                return false
              }
            })(),
            templateLiterals: (() => {
              try {
                const test = 'test'
                return `${test}` === 'test'
              }
              catch {
                return false
              }
            })(),
            classes: (() => {
              try {
                class Test { }
                return new Test() instanceof Test
              }
              catch {
                return false
              }
            })(),
            modules: typeof window !== 'undefined' && 'import' in window,
            fetch: typeof fetch !== 'undefined',
            webgl: (() => {
              try {
                const canvas = document.createElement('canvas')
                return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
              }
              catch {
                return false
              }
            })(),
          }

          return features
        })

        // 验证关键特性支持
        expect(featuresSupported.promises).toBe(true)
        expect(featuresSupported.arrow).toBe(true)
        expect(featuresSupported.destructuring).toBe(true)
        expect(featuresSupported.templateLiterals).toBe(true)
        expect(featuresSupported.classes).toBe(true)

        // 这些特性在某些浏览器中可能不支持，所以只记录结果
        console.log(`${name} 特性支持:`, featuresSupported)
      })
    })
  })

  test.describe('移动端兼容性', () => {
    const mobileDevices = [
      { name: 'iPhone 12', device: devices['iPhone 12'] },
      { name: 'Pixel 5', device: devices['Pixel 5'] },
      { name: 'iPad Pro', device: devices['iPad Pro'] },
    ]

    mobileDevices.forEach(({ name, device }) => {
      test.describe(`${name}`, () => {


        test('应该在移动设备上正确加载', async ({ page }) => {
          await page.goto('/examples/basic/')

          // 等待引擎加载
          await page.waitForFunction(() => window.engine !== undefined)

          const engineLoaded = await page.evaluate(() => {
            return typeof window.engine === 'object' && window.engine !== null
          })

          expect(engineLoaded).toBe(true)
        })

        test('应该正确检测移动设备', async ({ page }) => {
          await page.goto('/examples/basic/')
          await page.waitForFunction(() => window.engine !== undefined)

          const envInfo = await page.evaluate(() => {
            return window.engine.environment.detect()
          }) as any

          expect(envInfo.device.isMobile || envInfo.device.isTablet).toBe(true)
        })

        test('应该支持触摸事件', async ({ page }) => {
          await page.goto('/examples/todo-app/')
          await page.waitForSelector('[data-testid="todo-app"]')

          // 测试触摸添加待办事项
          await page.locator('[data-testid="todo-input"]').fill('移动端测试')
          await page.locator('[data-testid="add-todo"]').tap()

          const todoItem = page.locator('[data-testid="todo-item"]').first()
          await expect(todoItem).toContainText('移动端测试')
        })

        test('应该适配移动端界面', async ({ page }) => {
          await page.goto('/examples/todo-app/')
          await page.waitForSelector('[data-testid="todo-app"]')

          // 检查响应式布局
          const viewport = page.viewportSize()
          expect(viewport?.width).toBeLessThan(1024) // 移动端宽度

          // 验证界面元素可见性
          const todoInput = page.locator('[data-testid="todo-input"]')
          await expect(todoInput).toBeVisible()

          const addButton = page.locator('[data-testid="add-todo"]')
          await expect(addButton).toBeVisible()
        })
      })
    })
  })

  test.describe('性能测试', () => {
    test('应该在合理时间内加载', async ({ page }) => {
      const startTime = Date.now()

      await page.goto('/examples/basic/')
      await page.waitForFunction(() => window.engine !== undefined)

      const loadTime = Date.now() - startTime

      // 引擎应该在 5 秒内加载完成
      expect(loadTime).toBeLessThan(5000)
      console.log(`引擎加载时间: ${loadTime}ms`)
    })

    test('应该有良好的内存使用', async ({ page }) => {
      await page.goto('/examples/basic/')
      await page.waitForFunction(() => window.engine !== undefined)

      // 获取内存使用情况
      const memoryInfo = await page.evaluate(() => {
        return (performance as any).memory
          ? {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
            jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
          }
          : null
      })

      if (memoryInfo) {
        console.log('内存使用情况:', memoryInfo)

        // 内存使用应该在合理范围内（小于 50MB）
        expect(memoryInfo.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024)
      }
    })

    test('应该有良好的渲染性能', async ({ page }) => {
      await page.goto('/examples/todo-app/')
      await page.waitForSelector('[data-testid="todo-app"]')

      // 添加多个待办事项测试渲染性能
      const startTime = Date.now()

      for (let i = 0; i < 10; i++) {
        await page.locator('[data-testid="todo-input"]').fill(`性能测试 ${i}`)
        await page.locator('[data-testid="add-todo"]').click()
      }

      const renderTime = Date.now() - startTime

      // 渲染 10 个项目应该在 2 秒内完成
      expect(renderTime).toBeLessThan(2000)
      console.log(`渲染时间: ${renderTime}ms`)

      // 验证所有项目都已渲染
      const todoItems = page.locator('[data-testid="todo-item"]')
      await expect(todoItems).toHaveCount(10)
    })
  })
})
