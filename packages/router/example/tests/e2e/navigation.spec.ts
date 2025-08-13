import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('should navigate to home page', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/@ldesign\/router 示例应用/)
    await expect(page.locator('h1')).toContainText('@ldesign/router')
  })

  test('should navigate between pages', async ({ page }) => {
    await page.goto('/')

    // Navigate to basic routing
    await page.click('text=基础路由')
    await expect(page).toHaveURL('/basic')
    await expect(page.locator('h1')).toContainText('基础路由演示')

    // Navigate to nested routing
    await page.click('text=嵌套路由')
    await expect(page).toHaveURL('/nested')
    await expect(page.locator('h1')).toContainText('嵌套路由演示')

    // Navigate back to home
    await page.click('text=首页')
    await expect(page).toHaveURL('/')
  })

  test('should handle 404 pages', async ({ page }) => {
    await page.goto('/non-existent-page')

    await expect(page.locator('h1')).toContainText('页面未找到')
    await expect(page.locator('.error-code')).toContainText('404')
  })

  test('should display navigation menu', async ({ page }) => {
    await page.goto('/')

    const navLinks = [
      '首页',
      '基础路由',
      '嵌套路由',
      '动态路由',
      '路由守卫',
      '懒加载',
      '插件演示',
    ]

    for (const linkText of navLinks) {
      await expect(page.locator(`text=${linkText}`)).toBeVisible()
    }
  })

  test('should have responsive design', async ({ page }) => {
    await page.goto('/')

    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 })
    await expect(page.locator('.navbar')).toBeVisible()

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('.navbar')).toBeVisible()
  })
})
