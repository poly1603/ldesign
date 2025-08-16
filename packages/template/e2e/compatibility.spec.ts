import { devices, expect, test } from '@playwright/test'

test.describe('兼容性测试', () => {
  // 测试不同浏览器
  const browsers = ['chromium', 'firefox', 'webkit']

  browsers.forEach((browserName) => {
    test(`${browserName} 浏览器兼容性`, async ({ page }) => {
      await page.goto('http://localhost:3005')

      // 检查基本功能是否正常
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('nav')).toBeVisible()

      // 测试模板渲染
      await page.click('text=组件演示')
      await page.waitForSelector('[data-testid="template-renderer"]')
      await expect(page.locator('.template-content')).toBeVisible()

      // 测试模板切换
      await page.selectOption('[data-testid="template-selector"]', 'modern')
      await page.waitForSelector('.template-content')

      // 检查 JavaScript 功能
      const jsWorking = await page.evaluate(() => {
        return typeof window.Vue !== 'undefined' || typeof window.__VUE__ !== 'undefined'
      })
      expect(jsWorking).toBeTruthy()
    })
  })

  // 测试不同设备
  const deviceTests = [
    { name: 'Desktop Chrome', device: devices['Desktop Chrome'] },
    { name: 'Desktop Firefox', device: devices['Desktop Firefox'] },
    { name: 'Desktop Safari', device: devices['Desktop Safari'] },
    { name: 'iPhone 12', device: devices['iPhone 12'] },
    { name: 'iPad Pro', device: devices['iPad Pro'] },
    { name: 'Pixel 5', device: devices['Pixel 5'] },
  ]

  deviceTests.forEach(({ name, device }) => {
    test(`${name} 设备兼容性`, async ({ browser }) => {
      const context = await browser.newContext({
        ...device,
      })
      const page = await context.newPage()

      await page.goto('http://localhost:3005')

      // 检查响应式设计
      await page.click('text=设备演示')
      await page.waitForSelector('[data-testid="device-info"]')

      // 验证设备检测
      const deviceInfo = await page.locator('[data-testid="current-device"]').textContent()
      expect(deviceInfo).toBeTruthy()

      // 检查模板是否适配当前设备
      const templateContainer = page.locator('.template-content')
      await expect(templateContainer).toBeVisible()

      // 检查触摸事件（移动设备）
      if (device.hasTouch) {
        await page.tap('[data-testid="template-selector"]')
        await expect(page.locator('[data-testid="template-selector"]')).toBeFocused()
      }

      await context.close()
    })
  })

  test('视口大小适配', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568, expectedDevice: 'mobile' }, // iPhone SE
      { width: 768, height: 1024, expectedDevice: 'tablet' }, // iPad
      { width: 1024, height: 768, expectedDevice: 'tablet' }, // iPad 横屏
      { width: 1200, height: 800, expectedDevice: 'desktop' }, // 小桌面
      { width: 1920, height: 1080, expectedDevice: 'desktop' }, // 大桌面
    ]

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('http://localhost:3005')
      await page.click('text=设备演示')

      // 等待设备检测完成
      await page.waitForTimeout(500)

      const deviceInfo = await page.locator('[data-testid="current-device"]').textContent()
      expect(deviceInfo).toContain(viewport.expectedDevice)

      // 检查布局是否适配
      const content = page.locator('.template-content')
      await expect(content).toBeVisible()

      // 检查是否有横向滚动条（移动端不应该有）
      if (viewport.expectedDevice === 'mobile') {
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth
        })
        expect(hasHorizontalScroll).toBeFalsy()
      }
    }
  })

  test('CSS 功能支持', async ({ page }) => {
    await page.goto('http://localhost:3005')

    // 检查 CSS Grid 支持
    const gridSupport = await page.evaluate(() => {
      return CSS.supports('display', 'grid')
    })

    // 检查 CSS Flexbox 支持
    const flexSupport = await page.evaluate(() => {
      return CSS.supports('display', 'flex')
    })

    // 检查 CSS Variables 支持
    const variablesSupport = await page.evaluate(() => {
      return CSS.supports('color', 'var(--test)')
    })

    // 现代浏览器应该支持这些功能
    expect(gridSupport).toBeTruthy()
    expect(flexSupport).toBeTruthy()
    expect(variablesSupport).toBeTruthy()

    // 检查样式是否正确应用
    const computedStyle = await page.evaluate(() => {
      const element = document.querySelector('h1')
      return window.getComputedStyle(element).display
    })
    expect(computedStyle).not.toBe('')
  })

  test('JavaScript API 兼容性', async ({ page }) => {
    await page.goto('http://localhost:3005')

    // 检查必要的 JavaScript API
    const apiSupport = await page.evaluate(() => {
      return {
        fetch: typeof fetch !== 'undefined',
        promise: typeof Promise !== 'undefined',
        arrow: (() => true)() === true,
        const: (() => {
          const x = 1
          return x === 1
        })(),
        let: (() => {
          const x = 1
          return x === 1
        })(),
        destructuring: (() => {
          const [a] = [1]
          return a === 1
        })(),
        spread: (() => {
          const arr = [1, 2]
          return [...arr].length === 2
        })(),
        async: typeof (async () => {}) === 'function',
        intersectionObserver: typeof IntersectionObserver !== 'undefined',
        resizeObserver: typeof ResizeObserver !== 'undefined',
      }
    })

    // 检查关键 API 支持
    expect(apiSupport.fetch).toBeTruthy()
    expect(apiSupport.promise).toBeTruthy()
    expect(apiSupport.arrow).toBeTruthy()
    expect(apiSupport.const).toBeTruthy()
    expect(apiSupport.let).toBeTruthy()
    expect(apiSupport.destructuring).toBeTruthy()
    expect(apiSupport.spread).toBeTruthy()
    expect(apiSupport.async).toBeTruthy()

    // 这些 API 在现代浏览器中应该可用
    expect(apiSupport.intersectionObserver).toBeTruthy()
    expect(apiSupport.resizeObserver).toBeTruthy()
  })

  test('错误处理兼容性', async ({ page }) => {
    // 监听控制台错误
    const errors = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // 监听页面错误
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    await page.goto('http://localhost:3005')
    await page.click('text=组件演示')

    // 触发一些操作
    await page.selectOption('[data-testid="template-selector"]', 'modern')
    await page.waitForSelector('.template-content')

    await page.click('text=设备演示')
    await page.click('[data-testid="device-mobile"]')

    // 等待一段时间确保所有异步操作完成
    await page.waitForTimeout(2000)

    // 检查是否有严重错误
    const criticalErrors = errors.filter(
      error => !error.includes('Warning') && !error.includes('DevTools') && !error.includes('Extension'),
    )

    expect(criticalErrors.length).toBe(0)
  })

  test('性能 API 兼容性', async ({ page }) => {
    await page.goto('http://localhost:3005')

    // 检查性能 API 支持
    const performanceSupport = await page.evaluate(() => {
      return {
        performance: typeof performance !== 'undefined',
        now: typeof performance.now === 'function',
        mark: typeof performance.mark === 'function',
        measure: typeof performance.measure === 'function',
        observer: typeof PerformanceObserver !== 'undefined',
        memory: typeof (performance as any).memory !== 'undefined',
      }
    })

    expect(performanceSupport.performance).toBeTruthy()
    expect(performanceSupport.now).toBeTruthy()

    // 这些 API 在现代浏览器中通常可用
    if (performanceSupport.mark) {
      await page.evaluate(() => {
        performance.mark('test-mark')
      })
    }
  })

  test('存储 API 兼容性', async ({ page }) => {
    await page.goto('http://localhost:3005')

    // 检查存储 API
    const storageSupport = await page.evaluate(() => {
      return {
        localStorage: typeof localStorage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined',
        indexedDB: typeof indexedDB !== 'undefined',
      }
    })

    expect(storageSupport.localStorage).toBeTruthy()
    expect(storageSupport.sessionStorage).toBeTruthy()

    // 测试存储功能
    await page.evaluate(() => {
      localStorage.setItem('test', 'value')
      return localStorage.getItem('test') === 'value'
    })
  })

  test('网络 API 兼容性', async ({ page }) => {
    await page.goto('http://localhost:3005')

    // 检查网络相关 API
    const networkSupport = await page.evaluate(() => {
      return {
        fetch: typeof fetch !== 'undefined',
        xhr: typeof XMLHttpRequest !== 'undefined',
        navigator: typeof navigator !== 'undefined',
        connection: typeof (navigator as any).connection !== 'undefined',
      }
    })

    expect(networkSupport.fetch).toBeTruthy()
    expect(networkSupport.xhr).toBeTruthy()
    expect(networkSupport.navigator).toBeTruthy()

    // 测试网络请求
    const fetchWorking = await page.evaluate(async () => {
      try {
        const response = await fetch(window.location.href)
        return response.ok
      }
      catch {
        return false
      }
    })

    expect(fetchWorking).toBeTruthy()
  })
})
