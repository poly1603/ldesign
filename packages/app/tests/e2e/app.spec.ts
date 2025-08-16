import { expect, test } from '@playwright/test'

test.describe('LDesign Engine Demo App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load the application successfully', async ({ page }) => {
    // Wait for the app to load
    await page.waitForSelector('.layout', { timeout: 10000 })

    // Check if the header is visible
    await expect(page.locator('.header')).toBeVisible()

    // Check if the sidebar is visible
    await expect(page.locator('.sidebar')).toBeVisible()

    // Check if the main content is visible
    await expect(page.locator('.main-content')).toBeVisible()
  })

  test('should display the correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/LDesign Engine 演示应用/)
  })

  test('should show overview demo by default', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('.demo-page')

    // Check if overview demo is displayed
    await expect(page.locator('h1')).toContainText('LDesign Engine 功能概览')
  })

  test('should toggle sidebar', async ({ page }) => {
    // Find and click the sidebar toggle button
    const toggleButton = page.locator('.sidebar-toggle')
    await expect(toggleButton).toBeVisible()

    // Click to collapse sidebar
    await toggleButton.click()

    // Check if sidebar is collapsed
    await expect(page.locator('.layout')).toHaveClass(
      /layout-sidebar-collapsed/,
    )

    // Click again to expand
    await toggleButton.click()

    // Check if sidebar is expanded
    await expect(page.locator('.layout')).not.toHaveClass(
      /layout-sidebar-collapsed/,
    )
  })

  test('should navigate between demos', async ({ page }) => {
    // Wait for sidebar to load
    await page.waitForSelector('.sidebar .nav-item')

    // Click on plugin demo
    await page.locator('.nav-item').filter({ hasText: '插件系统' }).click()

    // Check if plugin demo is displayed
    await expect(page.locator('h1')).toContainText('插件系统演示')

    // Click on state demo
    await page.locator('.nav-item').filter({ hasText: '状态管理' }).click()

    // Check if state demo is displayed
    await expect(page.locator('h1')).toContainText('状态管理演示')
  })

  test('should display feature cards in overview', async ({ page }) => {
    // Wait for overview page to load
    await page.waitForSelector('.features-grid')

    // Check if feature cards are displayed
    const featureCards = page.locator('.feature-card')
    await expect(featureCards).toHaveCount(10) // Should have 10 feature cards

    // Check if each card has required elements
    const firstCard = featureCards.first()
    await expect(firstCard.locator('.feature-icon')).toBeVisible()
    await expect(firstCard.locator('.feature-title')).toBeVisible()
    await expect(firstCard.locator('.feature-description')).toBeVisible()
  })

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check if layout adapts to mobile
    await expect(page.locator('.layout')).toBeVisible()

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })

    // Check if layout works on tablet
    await expect(page.locator('.layout')).toBeVisible()

    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 })

    // Check if layout works on desktop
    await expect(page.locator('.layout')).toBeVisible()
  })

  test('should show engine statistics', async ({ page }) => {
    // Wait for overview page to load
    await page.waitForSelector('.engine-stats')

    // Check if engine stats are displayed
    await expect(page.locator('.stat-item')).toHaveCount(5) // Should have 5 stat items

    // Check if stats have labels and values
    const statItems = page.locator('.stat-item')
    for (let i = 0; i < (await statItems.count()); i++) {
      const statItem = statItems.nth(i)
      await expect(statItem.locator('.stat-label')).toBeVisible()
      await expect(statItem.locator('.stat-value')).toBeVisible()
    }
  })

  test('should handle errors gracefully', async ({ page }) => {
    // Listen for console errors
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // Navigate through different demos
    const demoLinks = ['插件系统', '中间件', '状态管理', '事件系统', '日志系统']

    for (const demo of demoLinks) {
      await page.locator('.nav-item').filter({ hasText: demo }).click()
      await page.waitForTimeout(500) // Wait for navigation
    }

    // Check that no critical errors occurred
    const criticalErrors = errors.filter(
      error =>
        error.includes('TypeError')
        || error.includes('ReferenceError')
        || error.includes('Cannot read property'),
    )

    expect(criticalErrors).toHaveLength(0)
  })
})
