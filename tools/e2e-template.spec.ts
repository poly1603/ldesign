import { test, expect } from '@playwright/test'

test.describe('{{PACKAGE_NAME}} E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到示例页面
    await page.goto('/')
  })

  test('should load the library correctly', async ({ page }) => {
    // 检查页面是否正确加载
    await expect(page).toHaveTitle(/{{PACKAGE_NAME}}/i)
    
    // 检查库是否已加载
    const libraryLoaded = await page.evaluate(() => {
      return typeof window.LDesign{{PACKAGE_NAME_PASCAL}} !== 'undefined'
    })
    expect(libraryLoaded).toBe(true)
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
    const filteredErrors = errors.filter(error => 
      !error.includes('favicon.ico') &&
      !error.includes('404')
    )
    
    expect(filteredErrors).toHaveLength(0)
  })

  test('should be responsive', async ({ page }) => {
    // 测试桌面视图
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
    
    // 测试平板视图
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('body')).toBeVisible()
    
    // 测试移动视图
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('body')).toBeVisible()
  })

  test('should have accessible content', async ({ page }) => {
    await page.goto('/')
    
    // 检查页面是否有主要的语义元素
    const main = page.locator('main, [role="main"], #app')
    await expect(main).toBeVisible()
    
    // 检查是否有标题
    const heading = page.locator('h1, h2, [role="heading"]')
    await expect(heading.first()).toBeVisible()
  })
})

test.describe('{{PACKAGE_NAME}} Vue Integration', () => {
  test('should work with Vue components', async ({ page }) => {
    await page.goto('/')
    
    // 检查Vue是否已加载
    const vueLoaded = await page.evaluate(() => {
      return typeof window.Vue !== 'undefined'
    })
    
    if (vueLoaded) {
      // 检查Vue应用是否已挂载
      const vueApp = page.locator('#app, [data-v-app]')
      await expect(vueApp).toBeVisible()
    }
  })

  test('should handle Vue reactivity', async ({ page }) => {
    await page.goto('/')
    
    // 查找交互元素（按钮、输入框等）
    const interactiveElements = page.locator('button, input, select, [role="button"]')
    const count = await interactiveElements.count()
    
    if (count > 0) {
      // 测试第一个交互元素
      const firstElement = interactiveElements.first()
      await expect(firstElement).toBeVisible()
      
      // 如果是按钮，尝试点击
      const tagName = await firstElement.evaluate(el => el.tagName.toLowerCase())
      if (tagName === 'button' || await firstElement.getAttribute('role') === 'button') {
        await firstElement.click()
        // 等待可能的状态变化
        await page.waitForTimeout(100)
      }
    }
  })
})

test.describe('{{PACKAGE_NAME}} Performance', () => {
  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // 页面应该在3秒内加载完成
    expect(loadTime).toBeLessThan(3000)
  })

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 获取性能指标
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const vitals: Record<string, number> = {}
          
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              vitals.fcp = entry.startTime
            }
            if (entry.name === 'largest-contentful-paint') {
              vitals.lcp = entry.startTime
            }
          })
          
          resolve(vitals)
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] })
        
        // 超时保护
        setTimeout(() => resolve({}), 5000)
      })
    })
    
    // FCP 应该在 1.8 秒内
    if ((metrics as any).fcp) {
      expect((metrics as any).fcp).toBeLessThan(1800)
    }
    
    // LCP 应该在 2.5 秒内
    if ((metrics as any).lcp) {
      expect((metrics as any).lcp).toBeLessThan(2500)
    }
  })
})
