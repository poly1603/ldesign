import { expect, test } from '@playwright/test'

test.describe('Engine E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到示例页面
    await page.goto('/')
  })

  test('should load the engine correctly', async ({ page }) => {
    // 检查页面是否正确加载
    await expect(page).toHaveTitle(/engine/i)

    // 检查引擎是否已加载
    const engineLoaded = await page.evaluate(() => {
      return typeof window.LDesignEngine !== 'undefined'
    })
    expect(engineLoaded).toBe(true)
  })

  test('should initialize Vue app with engine', async ({ page }) => {
    await page.goto('/')

    // 检查Vue应用是否已挂载
    const vueApp = page.locator('#app')
    await expect(vueApp).toBeVisible()

    // 检查引擎是否已初始化
    const engineInitialized = await page.evaluate(() => {
      return window.__VUE_APP__?.$engine !== undefined
    })
    expect(engineInitialized).toBe(true)
  })

  test('should handle plugin system', async ({ page }) => {
    await page.goto('/')

    // 检查插件管理器是否可用
    const pluginManagerAvailable = await page.evaluate(() => {
      return typeof window.__VUE_APP__?.$engine?.plugins !== 'undefined'
    })
    expect(pluginManagerAvailable).toBe(true)
  })

  test('should handle middleware', async ({ page }) => {
    await page.goto('/')

    // 检查中间件系统是否可用
    const middlewareAvailable = await page.evaluate(() => {
      return typeof window.__VUE_APP__?.$engine?.middleware !== 'undefined'
    })
    expect(middlewareAvailable).toBe(true)
  })

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // 过滤掉一些已知的无害错误
    const filteredErrors = errors.filter(
      error => !error.includes('favicon.ico') && !error.includes('404'),
    )

    expect(filteredErrors).toHaveLength(0)
  })
})

test.describe('Engine Performance', () => {
  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime

    // 页面应该在3秒内加载完成
    expect(loadTime).toBeLessThan(3000)
  })

  test('should have good memory usage', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

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
      // 内存使用应该在合理范围内（小于50MB）
      expect(memoryInfo.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024)
    }
  })
})
