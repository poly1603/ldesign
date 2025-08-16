import { expect, test } from '@playwright/test'

test.describe('简单 E2E 测试', () => {
  test('应该能够访问首页', async ({ page }) => {
    await page.goto('/')

    // 检查页面是否加载
    await expect(page.locator('h1')).toBeVisible()

    // 检查是否包含路由器相关内容
    await expect(page.locator('h1')).toContainText('router')
  })

  test('应该能够点击导航链接', async ({ page }) => {
    await page.goto('/')

    // 等待页面加载完成
    await page.waitForLoadState('networkidle')

    // 查找并点击 About 链接
    const aboutLink = page.locator('a[href="/about"]').first()
    if (await aboutLink.isVisible()) {
      await aboutLink.click()

      // 检查 URL 是否变化
      await expect(page).toHaveURL(/\/about/)
    }
  })

  test('应该能够处理基本路由导航', async ({ page }) => {
    // 直接访问 about 页面
    await page.goto('/about')

    // 检查页面内容
    await expect(page.locator('h1')).toContainText('About')
  })

  test('应该能够处理动态路由', async ({ page }) => {
    // 访问用户页面
    await page.goto('/user/123')

    // 检查页面内容
    await expect(page.locator('h1')).toContainText('User')
  })

  test('应该能够处理 404 页面', async ({ page }) => {
    // 访问不存在的页面
    await page.goto('/nonexistent-page')

    // 检查是否重定向到 404 页面
    await expect(page).toHaveURL(/\/404/)
  })
})
