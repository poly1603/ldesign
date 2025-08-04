import { test, expect, type Page } from '@playwright/test'

/**
 * 测试 src 和 es 打包产物的功能一致性
 * 这个测试确保开发环境(src)和生产环境(es)的行为完全一致
 */

// 测试配置
const TEST_CONFIG = {
  // 开发环境配置 (使用 src)
  dev: {
    port: 3001,
    name: 'Development (src)',
    buildCommand: 'pnpm run dev:src',
  },
  // 生产环境配置 (使用 es)
  prod: {
    port: 3002,
    name: 'Production (es)',
    buildCommand: 'pnpm run dev:es',
  },
  // 测试超时时间
  timeout: 30000,
}

// 测试用例数据
const TEST_CASES = [
  {
    name: '登录模板 - 桌面端默认',
    category: 'login',
    device: 'desktop',
    template: 'default',
    expectedElements: [
      '[data-testid="login-form"]',
      '[data-testid="username-input"]',
      '[data-testid="password-input"]',
      '[data-testid="login-button"]',
    ],
  },
  {
    name: '登录模板 - 移动端简单',
    category: 'login',
    device: 'mobile',
    template: 'simple',
    expectedElements: [
      '[data-testid="mobile-login-form"]',
      '[data-testid="mobile-username"]',
      '[data-testid="mobile-password"]',
    ],
  },
  {
    name: '仪表盘模板 - 桌面端管理',
    category: 'dashboard',
    device: 'desktop',
    template: 'admin',
    expectedElements: [
      '[data-testid="dashboard-container"]',
      '[data-testid="sidebar"]',
      '[data-testid="main-content"]',
    ],
  },
]

/**
 * 启动测试服务器
 */
async function startTestServer(config: typeof TEST_CONFIG.dev | typeof TEST_CONFIG.prod) {
  // 这里应该启动对应的开发服务器
  // 实际实现中需要根据具体的构建配置来启动
  console.log(`Starting ${config.name} server on port ${config.port}`)
}

/**
 * 等待页面加载完成
 */
async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000) // 额外等待确保所有异步组件加载完成
}

/**
 * 测试模板加载功能
 */
async function testTemplateLoading(page: Page, testCase: typeof TEST_CASES[0]) {
  // 导航到模板选择页面
  await page.goto('/')
  await waitForPageLoad(page)

  // 选择分类
  await page.selectOption('[data-testid="category-select"]', testCase.category)
  await page.waitForTimeout(500)

  // 选择设备类型
  await page.selectOption('[data-testid="device-select"]', testCase.device)
  await page.waitForTimeout(500)

  // 选择模板
  await page.selectOption('[data-testid="template-select"]', testCase.template)
  await page.waitForTimeout(1000)

  // 验证模板是否正确加载
  for (const selector of testCase.expectedElements) {
    await expect(page.locator(selector)).toBeVisible({ timeout: 10000 })
  }
}

/**
 * 测试模板切换功能
 */
async function testTemplateSwitching(page: Page) {
  await page.goto('/')
  await waitForPageLoad(page)

  // 测试在不同模板之间切换
  const templates = ['default', 'classic', 'modern']
  
  for (const template of templates) {
    await page.selectOption('[data-testid="template-select"]', template)
    await page.waitForTimeout(1000)
    
    // 验证模板切换成功
    await expect(page.locator(`[data-template="${template}"]`)).toBeVisible()
  }
}

/**
 * 测试响应式功能
 */
async function testResponsiveFeatures(page: Page) {
  await page.goto('/')
  await waitForPageLoad(page)

  // 测试不同屏幕尺寸
  const viewports = [
    { width: 1920, height: 1080, device: 'desktop' },
    { width: 768, height: 1024, device: 'tablet' },
    { width: 375, height: 667, device: 'mobile' },
  ]

  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    await page.waitForTimeout(500)

    // 验证设备检测是否正确
    const detectedDevice = await page.evaluate(() => {
      return (window as any).__TEMPLATE_DEVICE_TYPE__
    })
    
    expect(detectedDevice).toBe(viewport.device)
  }
}

/**
 * 比较两个环境的DOM结构
 */
async function compareDOMStructure(devPage: Page, prodPage: Page, testCase: typeof TEST_CASES[0]) {
  // 在两个环境中加载相同的模板
  for (const page of [devPage, prodPage]) {
    await page.goto('/')
    await waitForPageLoad(page)
    
    await page.selectOption('[data-testid="category-select"]', testCase.category)
    await page.selectOption('[data-testid="device-select"]', testCase.device)
    await page.selectOption('[data-testid="template-select"]', testCase.template)
    await waitForPageLoad(page)
  }

  // 比较关键元素的存在性
  for (const selector of testCase.expectedElements) {
    const devElement = await devPage.locator(selector).isVisible()
    const prodElement = await prodPage.locator(selector).isVisible()
    
    expect(devElement).toBe(prodElement)
  }

  // 比较计算样式（可选）
  for (const selector of testCase.expectedElements) {
    if (await devPage.locator(selector).isVisible()) {
      const devStyles = await devPage.locator(selector).evaluate(el => {
        const computed = window.getComputedStyle(el)
        return {
          display: computed.display,
          position: computed.position,
          width: computed.width,
          height: computed.height,
        }
      })

      const prodStyles = await prodPage.locator(selector).evaluate(el => {
        const computed = window.getComputedStyle(el)
        return {
          display: computed.display,
          position: computed.position,
          width: computed.width,
          height: computed.height,
        }
      })

      // 比较关键样式属性
      expect(devStyles.display).toBe(prodStyles.display)
      expect(devStyles.position).toBe(prodStyles.position)
    }
  }
}

// 主测试套件
test.describe('Template Package - Src vs Es Consistency', () => {
  test.beforeAll(async () => {
    // 启动开发和生产服务器
    await startTestServer(TEST_CONFIG.dev)
    await startTestServer(TEST_CONFIG.prod)
  })

  test.describe('Individual Environment Tests', () => {
    // 测试开发环境
    test.describe('Development Environment (src)', () => {
      TEST_CASES.forEach(testCase => {
        test(`should load ${testCase.name} correctly`, async ({ page }) => {
          await page.goto(`http://localhost:${TEST_CONFIG.dev.port}`)
          await testTemplateLoading(page, testCase)
        })
      })

      test('should handle template switching', async ({ page }) => {
        await page.goto(`http://localhost:${TEST_CONFIG.dev.port}`)
        await testTemplateSwitching(page)
      })

      test('should handle responsive features', async ({ page }) => {
        await page.goto(`http://localhost:${TEST_CONFIG.dev.port}`)
        await testResponsiveFeatures(page)
      })
    })

    // 测试生产环境
    test.describe('Production Environment (es)', () => {
      TEST_CASES.forEach(testCase => {
        test(`should load ${testCase.name} correctly`, async ({ page }) => {
          await page.goto(`http://localhost:${TEST_CONFIG.prod.port}`)
          await testTemplateLoading(page, testCase)
        })
      })

      test('should handle template switching', async ({ page }) => {
        await page.goto(`http://localhost:${TEST_CONFIG.prod.port}`)
        await testTemplateSwitching(page)
      })

      test('should handle responsive features', async ({ page }) => {
        await page.goto(`http://localhost:${TEST_CONFIG.prod.port}`)
        await testResponsiveFeatures(page)
      })
    })
  })

  test.describe('Cross-Environment Consistency', () => {
    TEST_CASES.forEach(testCase => {
      test(`${testCase.name} should behave identically in both environments`, async ({ browser }) => {
        const devContext = await browser.newContext()
        const prodContext = await browser.newContext()
        
        const devPage = await devContext.newPage()
        const prodPage = await prodContext.newPage()

        try {
          await compareDOMStructure(devPage, prodPage, testCase)
        } finally {
          await devContext.close()
          await prodContext.close()
        }
      })
    })
  })

  test.describe('Performance Comparison', () => {
    test('should have similar loading performance', async ({ browser }) => {
      const devContext = await browser.newContext()
      const prodContext = await browser.newContext()
      
      const devPage = await devContext.newPage()
      const prodPage = await prodContext.newPage()

      try {
        // 测量开发环境加载时间
        const devStartTime = Date.now()
        await devPage.goto(`http://localhost:${TEST_CONFIG.dev.port}`)
        await waitForPageLoad(devPage)
        const devLoadTime = Date.now() - devStartTime

        // 测量生产环境加载时间
        const prodStartTime = Date.now()
        await prodPage.goto(`http://localhost:${TEST_CONFIG.prod.port}`)
        await waitForPageLoad(prodPage)
        const prodLoadTime = Date.now() - prodStartTime

        console.log(`Dev load time: ${devLoadTime}ms`)
        console.log(`Prod load time: ${prodLoadTime}ms`)

        // 生产环境应该更快或相近（允许20%的差异）
        expect(prodLoadTime).toBeLessThanOrEqual(devLoadTime * 1.2)
      } finally {
        await devContext.close()
        await prodContext.close()
      }
    })
  })
})
