/**
 * E2E 测试 - 交互式示例页面
 * 测试文档站点中的所有交互式示例功能
 */

import { test, expect } from '@playwright/test'

test.describe('Basic TypeScript Examples', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到示例页面
    await page.goto('/examples')
    
    // 等待库加载完成
    await page.waitForSelector('.demo-button', { timeout: 10000 })
    
    // 确保没有错误信息
    const errorMessage = page.locator('.error-message')
    await expect(errorMessage).not.toBeVisible()
  })

  test('应该成功加载库并显示示例按钮', async ({ page }) => {
    // 检查页面标题
    await expect(page.locator('h1')).toContainText('交互式示例')
    
    // 检查所有示例按钮都存在
    const buttons = page.locator('.demo-button')
    await expect(buttons).toHaveCount(5)
    
    // 检查初始输出显示
    const output = page.locator('.output-display')
    await expect(output).toContainText('点击上面的按钮运行示例')
  })

  test('示例 1: 创建用户功能', async ({ page }) => {
    // 点击第一个示例按钮
    await page.locator('.demo-button').first().click()
    
    // 等待输出更新
    await page.waitForTimeout(500)
    
    // 检查输出结果
    const output = page.locator('.output-display')
    await expect(output).toContainText('创建用户成功')
    await expect(output).toContainText('张三')
    await expect(output).toContainText('zhangsan@example.com')
    await expect(output).toContainText('25')
    await expect(output).toContainText('"id":')
  })

  test('示例 2: 邮箱验证功能', async ({ page }) => {
    // 点击第二个示例按钮
    await page.locator('.demo-button').nth(1).click()
    
    // 等待输出更新
    await page.waitForTimeout(500)
    
    // 检查输出结果
    const output = page.locator('.output-display')
    await expect(output).toContainText('邮箱验证结果')
    await expect(output).toContainText('valid@example.com')
    await expect(output).toContainText('true')
    await expect(output).toContainText('invalid-email')
    await expect(output).toContainText('false')
  })

  test('示例 3: 格式化用户信息功能', async ({ page }) => {
    // 点击第三个示例按钮
    await page.locator('.demo-button').nth(2).click()
    
    // 等待输出更新
    await page.waitForTimeout(500)
    
    // 检查输出结果
    const output = page.locator('.output-display')
    await expect(output).toContainText('格式化用户信息')
    await expect(output).toContainText('李四 (30岁) - lisi@example.com')
    await expect(output).toContainText('王五 - wangwu@example.com')
  })

  test('示例 4: 库信息功能', async ({ page }) => {
    // 点击第四个示例按钮
    await page.locator('.demo-button').nth(3).click()
    
    // 等待输出更新
    await page.waitForTimeout(500)
    
    // 检查输出结果
    const output = page.locator('.output-display')
    await expect(output).toContainText('库信息')
    await expect(output).toContainText('"version": "1.0.0"')
    await expect(output).toContainText('"libraryName": "basic-typescript-example"')
    await expect(output).toContainText('"defaultOptions"')
  })

  test('示例 5: 集成使用功能', async ({ page }) => {
    // 点击第五个示例按钮
    await page.locator('.demo-button').nth(4).click()
    
    // 等待输出更新
    await page.waitForTimeout(500)
    
    // 检查输出结果
    const output = page.locator('.output-display')
    await expect(output).toContainText('集成测试结果')
    await expect(output).toContainText('邮箱验证通过')
    await expect(output).toContainText('用户创建成功')
    await expect(output).toContainText('用户信息格式化完成')
    await expect(output).toContainText('集成测试用户')
    await expect(output).toContainText('integration@test.com')
  })

  test('所有示例按钮都应该正常工作', async ({ page }) => {
    const buttons = page.locator('.demo-button')
    const buttonCount = await buttons.count()
    
    // 依次点击每个按钮并验证输出
    for (let i = 0; i < buttonCount; i++) {
      await buttons.nth(i).click()
      await page.waitForTimeout(500)
      
      const output = page.locator('.output-display')
      const outputText = await output.textContent()
      
      // 确保输出不是初始状态且不包含错误
      expect(outputText).not.toContain('点击上面的按钮运行示例')
      expect(outputText).not.toContain('错误:')
      expect(outputText?.length).toBeGreaterThan(10)
    }
  })

  test('页面应该响应式设计', async ({ page }) => {
    // 测试不同屏幕尺寸
    const viewports = [
      { width: 1200, height: 800 }, // 桌面
      { width: 768, height: 1024 }, // 平板
      { width: 375, height: 667 }   // 手机
    ]
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      
      // 确保按钮仍然可见和可点击
      const firstButton = page.locator('.demo-button').first()
      await expect(firstButton).toBeVisible()
      
      // 确保输出区域仍然可见
      const output = page.locator('.output-display')
      await expect(output).toBeVisible()
    }
  })

  test('代码块应该正确显示', async ({ page }) => {
    // 检查代码块存在
    const codeBlocks = page.locator('pre code')
    await expect(codeBlocks.first()).toBeVisible()
    
    // 检查代码块包含正确的内容
    const firstCodeBlock = codeBlocks.first()
    await expect(firstCodeBlock).toContainText('createUser')
    await expect(firstCodeBlock).toContainText('import')
  })

  test('导航和链接应该正常工作', async ({ page }) => {
    // 检查导航链接
    const navLinks = page.locator('nav a')
    const linkCount = await navLinks.count()
    
    expect(linkCount).toBeGreaterThan(0)
    
    // 测试首页链接
    const homeLink = page.locator('nav a[href="/"]')
    if (await homeLink.count() > 0) {
      await homeLink.click()
      await expect(page.locator('h1')).toContainText('Basic TypeScript Example')
    }
  })
})
