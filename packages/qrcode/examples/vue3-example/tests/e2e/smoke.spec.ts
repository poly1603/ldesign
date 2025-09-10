import { test, expect } from '@playwright/test'

test.describe('Vue3 QR码示例 - 冒烟测试', () => {
  test('页面加载和基本功能', async ({ page }) => {
    // 导航到页面
    await page.goto('/')
    
    // 验证页面标题
    await expect(page).toHaveTitle(/Vue 3 示例/)
    
    // 验证导航标签存在
    await expect(page.locator('button.nav-tab').filter({ hasText: '基础示例' })).toBeVisible()
    await expect(page.locator('button.nav-tab').filter({ hasText: '高级功能' })).toBeVisible()
    await expect(page.locator('button.nav-tab').filter({ hasText: '样式定制' })).toBeVisible()
    await expect(page.locator('button.nav-tab').filter({ hasText: '数据类型' })).toBeVisible()
    await expect(page.locator('button.nav-tab').filter({ hasText: '性能测试' })).toBeVisible()
    
    // 验证基础示例标签页默认激活
    await expect(page.locator('button.nav-tab').filter({ hasText: '基础示例' })).toHaveClass(/active/)
    
    // 验证基础示例页面元素
    await expect(page.locator('input[placeholder*="输入二维码内容"]').first()).toBeVisible()
    await expect(page.locator('button').filter({ hasText: '生成二维码' }).first()).toBeVisible()
    
    // 验证默认二维码已生成
    await expect(page.locator('.qr-container canvas, .qr-container svg').first()).toBeVisible({ timeout: 10000 })
    
    // 测试基本二维码生成
    const textInput = page.locator('input[placeholder*="输入二维码内容"]').first()
    const generateButton = page.locator('button').filter({ hasText: '生成二维码' }).first()
    
    await textInput.clear()
    await textInput.fill('https://www.ldesign.com/test')
    await generateButton.click()
    
    // 验证新二维码生成
    await expect(page.locator('.qr-container canvas, .qr-container svg').first()).toBeVisible({ timeout: 10000 })
    
    // 测试标签页切换
    await page.locator('button.nav-tab').filter({ hasText: '样式定制' }).click()
    await expect(page.locator('button.nav-tab').filter({ hasText: '样式定制' })).toHaveClass(/active/)
    
    // 验证样式定制页面元素
    await expect(page.locator('input[type="color"]').first()).toBeVisible()
    
    // 等待样式定制页面的二维码生成
    await expect(page.locator('.qr-container canvas, .qr-container svg').nth(1)).toBeVisible({ timeout: 15000 })
    
    // 测试数据类型页面
    await page.locator('button.nav-tab').filter({ hasText: '数据类型' }).click()
    await expect(page.locator('button.nav-tab').filter({ hasText: '数据类型' })).toHaveClass(/active/)
    
    // 验证数据类型选择卡片
    const datatypeCards = page.locator('.type-card, .datatype-btn')
    if (await datatypeCards.count() > 0) {
      await expect(datatypeCards.first()).toBeVisible()
      
      // 点击第一个数据类型
      await datatypeCards.first().click()
      
      // 验证表单显示
      await expect(page.locator('textarea, .form-textarea').first()).toBeVisible()
    }
    
    // 检查控制台错误
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    page.on('pageerror', error => {
      errors.push(error.message)
    })
    
    // 等待一段时间收集可能的错误
    await page.waitForTimeout(2000)
    
    // 验证没有JavaScript错误
    expect(errors).toHaveLength(0)
  })

  test('响应式设计测试', async ({ page }) => {
    // 测试移动端视口
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // 验证在小屏幕下元素仍然可见
    await expect(page.locator('button.nav-tab').filter({ hasText: '基础示例' })).toBeVisible()
    await expect(page.locator('input[placeholder*="输入二维码内容"]').first()).toBeVisible()
    
    // 验证二维码容器适应小屏幕
    const container = page.locator('.qr-container').first()
    if (await container.isVisible()) {
      const containerBox = await container.boundingBox()
      expect(containerBox!.width).toBeLessThanOrEqual(375)
    }
  })

  test('基本性能测试', async ({ page }) => {
    const startTime = Date.now()
    
    // 导航到页面
    await page.goto('/')
    
    // 等待页面完全加载
    await page.waitForLoadState('networkidle')
    
    // 验证页面加载时间合理
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(10000) // 不超过10秒
    
    // 测试二维码生成性能
    const generationStartTime = Date.now()
    
    const textInput = page.locator('input[placeholder*="输入二维码内容"]').first()
    const generateButton = page.locator('button').filter({ hasText: '生成二维码' }).first()
    
    await textInput.clear()
    await textInput.fill('性能测试数据')
    await generateButton.click()
    
    // 等待二维码生成
    await expect(page.locator('.qr-container canvas, .qr-container svg').first()).toBeVisible({ timeout: 10000 })
    
    const generationTime = Date.now() - generationStartTime
    expect(generationTime).toBeLessThan(5000) // 二维码生成不超过5秒
    
    console.log(`页面加载时间: ${loadTime}ms, 二维码生成时间: ${generationTime}ms`)
  })
})
