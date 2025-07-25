import { expect, test } from '@playwright/test'

test.describe('LDesign E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display the homepage correctly', async ({ page }) => {
    // 检查页面标题
    await expect(page).toHaveTitle(/LDesign/)

    // 检查主要元素是否存在
    await expect(page.locator('h1')).toContainText('LDesign')
    await expect(page.locator('.hero')).toBeVisible()
  })

  test('should navigate to components page', async ({ page }) => {
    // 点击组件链接
    await page.click('text=查看组件')

    // 检查是否跳转到组件页面
    await expect(page).toHaveURL(/.*components/)
    await expect(page.locator('h1')).toContainText('组件')
  })

  test('should be responsive on mobile', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 })

    // 检查移动端布局
    await expect(page.locator('.hero')).toBeVisible()

    // 检查导航菜单在移动端的行为
    const menuButton = page.locator('[aria-label="menu"]')
    if (await menuButton.isVisible()) {
      await menuButton.click()
      await expect(page.locator('.mobile-menu')).toBeVisible()
    }
  })

  test('should support keyboard navigation', async ({ page }) => {
    // 使用 Tab 键导航
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // 检查焦点状态
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()

    // 使用 Enter 键激活链接
    await page.keyboard.press('Enter')

    // 检查是否正确导航
    await expect(page).not.toHaveURL('/')
  })

  test('should load components correctly', async ({ page }) => {
    await page.goto('/components/button')

    // 检查按钮组件示例
    await expect(page.locator('.demo-button')).toBeVisible()

    // 测试按钮交互
    const button = page.locator('button').first()
    await button.click()

    // 检查点击效果
    await expect(button).toHaveClass(/clicked|active/)
  })

  test('should handle theme switching', async ({ page }) => {
    // 查找主题切换按钮
    const themeToggle = page.locator('[aria-label*="theme"], [aria-label*="主题"]')

    if (await themeToggle.isVisible()) {
      // 获取当前主题
      const currentTheme = await page.evaluate(() =>
        document.documentElement.getAttribute('data-theme') || 'light',
      )

      // 切换主题
      await themeToggle.click()

      // 检查主题是否改变
      const newTheme = await page.evaluate(() =>
        document.documentElement.getAttribute('data-theme') || 'light',
      )

      expect(newTheme).not.toBe(currentTheme)
    }
  })

  test('should search functionality work', async ({ page }) => {
    // 查找搜索框
    const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"]')

    if (await searchInput.isVisible()) {
      // 输入搜索关键词
      await searchInput.fill('button')
      await page.keyboard.press('Enter')

      // 检查搜索结果
      await expect(page.locator('.search-results')).toBeVisible()
      await expect(page.locator('.search-results')).toContainText('button')
    }
  })

  test('should handle error states gracefully', async ({ page }) => {
    // 访问不存在的页面
    const response = await page.goto('/non-existent-page')

    // 检查 404 页面
    expect(response?.status()).toBe(404)
    await expect(page.locator('h1')).toContainText(/404|Not Found|页面不存在/)
  })
})
