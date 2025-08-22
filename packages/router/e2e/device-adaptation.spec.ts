/**
 * 设备适配功能 E2E 测试
 */

import { expect, test } from '@playwright/test'

test.describe('设备适配功能', () => {
  test.beforeEach(async ({ page }) => {
    // 假设有一个测试应用
    await page.goto('/device-test')
  })

  test.describe('设备检测', () => {
    test('应该在桌面端正确检测设备类型', async ({ page }) => {
      // 设置桌面端视口
      await page.setViewportSize({ width: 1200, height: 800 })

      // 检查设备类型显示
      const deviceType = await page
        .locator('[data-testid="current-device"]')
        .textContent()
      expect(deviceType).toContain('桌面设备')
    })

    test('应该在移动端正确检测设备类型', async ({ page }) => {
      // 设置移动端视口
      await page.setViewportSize({ width: 375, height: 667 })

      // 等待设备检测更新
      await page.waitForTimeout(100)

      const deviceType = await page
        .locator('[data-testid="current-device"]')
        .textContent()
      expect(deviceType).toContain('移动设备')
    })

    test('应该在平板端正确检测设备类型', async ({ page }) => {
      // 设置平板端视口
      await page.setViewportSize({ width: 768, height: 1024 })

      await page.waitForTimeout(100)

      const deviceType = await page
        .locator('[data-testid="current-device"]')
        .textContent()
      expect(deviceType).toContain('平板设备')
    })
  })

  test.describe('设备特定组件', () => {
    test('应该在不同设备上显示不同的组件', async ({ page }) => {
      // 访问有设备特定组件的页面
      await page.goto('/device-specific-page')

      // 桌面端
      await page.setViewportSize({ width: 1200, height: 800 })
      await page.waitForTimeout(100)

      let componentName = await page
        .locator('[data-testid="component-name"]')
        .textContent()
      expect(componentName).toContain('Desktop')

      // 移动端
      await page.setViewportSize({ width: 375, height: 667 })
      await page.waitForTimeout(100)

      componentName = await page
        .locator('[data-testid="component-name"]')
        .textContent()
      expect(componentName).toContain('Mobile')
    })

    test('应该正确处理组件回退', async ({ page }) => {
      // 访问只有桌面端组件的页面
      await page.goto('/desktop-only-component')

      // 在移动端访问，应该回退到桌面端组件
      await page.setViewportSize({ width: 375, height: 667 })
      await page.waitForTimeout(100)

      const componentName = await page
        .locator('[data-testid="component-name"]')
        .textContent()
      expect(componentName).toContain('Desktop')

      // 应该显示回退提示
      const fallbackIndicator = await page.locator(
        '[data-testid="fallback-indicator"]',
      )
      await expect(fallbackIndicator).toBeVisible()
    })
  })

  test.describe('设备访问控制', () => {
    test('应该阻止不支持的设备访问', async ({ page }) => {
      // 在移动端访问仅桌面端支持的页面
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/desktop-only-page')

      // 应该被重定向到设备不支持页面
      await expect(page).toHaveURL(/device-unsupported/)

      // 检查提示信息
      const message = await page
        .locator('[data-testid="unsupported-message"]')
        .textContent()
      expect(message).toContain('不支持')

      // 检查设备信息
      const deviceInfo = await page
        .locator('[data-testid="current-device-info"]')
        .textContent()
      expect(deviceInfo).toContain('移动设备')
    })

    test('应该允许支持的设备访问', async ({ page }) => {
      // 在桌面端访问仅桌面端支持的页面
      await page.setViewportSize({ width: 1200, height: 800 })
      await page.goto('/desktop-only-page')

      // 应该正常访问
      await expect(page.locator('[data-testid="page-content"]')).toBeVisible()

      // 不应该显示不支持提示
      await expect(
        page.locator('[data-testid="unsupported-message"]'),
      ).not.toBeVisible()
    })

    test('应该使用自定义重定向路由', async ({ page }) => {
      // 访问配置了自定义重定向的页面
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/custom-redirect-page')

      // 应该被重定向到自定义页面
      await expect(page).toHaveURL(/custom-unsupported/)
    })
  })

  test.describe('模板路由', () => {
    test('应该正确渲染模板组件', async ({ page }) => {
      await page.goto('/template-login')

      // 检查模板组件是否正确渲染
      const templateContent = await page.locator(
        '[data-testid="template-content"]',
      )
      await expect(templateContent).toBeVisible()

      const templateName = await page
        .locator('[data-testid="template-name"]')
        .textContent()
      expect(templateName).toContain('login')
    })

    test('应该根据设备类型渲染不同的模板', async ({ page }) => {
      await page.goto('/template-dashboard')

      // 桌面端模板
      await page.setViewportSize({ width: 1200, height: 800 })
      await page.waitForTimeout(100)

      let templateVariant = await page
        .locator('[data-testid="template-variant"]')
        .textContent()
      expect(templateVariant).toContain('desktop')

      // 移动端模板
      await page.setViewportSize({ width: 375, height: 667 })
      await page.waitForTimeout(100)

      templateVariant = await page
        .locator('[data-testid="template-variant"]')
        .textContent()
      expect(templateVariant).toContain('mobile')
    })
  })

  test.describe('设备不支持页面', () => {
    test('应该显示正确的设备信息', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/device-unsupported?device=mobile&from=/admin')

      // 检查当前设备显示
      const currentDevice = await page
        .locator('[data-testid="current-device"]')
        .textContent()
      expect(currentDevice).toContain('移动设备')

      // 检查来源页面
      const fromPage = await page
        .locator('[data-testid="from-page"]')
        .textContent()
      expect(fromPage).toContain('/admin')
    })

    test('应该显示支持的设备列表', async ({ page }) => {
      await page.goto('/device-unsupported?supportedDevices=desktop,tablet')

      const supportedDevices = await page
        .locator('[data-testid="supported-devices"]')
        .textContent()
      expect(supportedDevices).toContain('桌面设备')
      expect(supportedDevices).toContain('平板设备')
    })

    test('返回按钮应该正常工作', async ({ page }) => {
      await page.goto('/some-page')
      await page.goto('/device-unsupported')

      const backButton = page.locator('[data-testid="back-button"]')
      await backButton.click()

      // 应该返回到上一页
      await expect(page).toHaveURL(/some-page/)
    })

    test('刷新按钮应该正常工作', async ({ page }) => {
      await page.goto('/device-unsupported')

      const refreshButton = page.locator('[data-testid="refresh-button"]')
      await refreshButton.click()

      // 页面应该刷新
      await expect(
        page.locator('[data-testid="unsupported-container"]'),
      ).toBeVisible()
    })
  })

  test.describe('响应式变化', () => {
    test('应该响应窗口大小变化', async ({ page }) => {
      await page.goto('/responsive-test')

      // 开始时是桌面端
      await page.setViewportSize({ width: 1200, height: 800 })
      await page.waitForTimeout(100)

      let deviceType = await page
        .locator('[data-testid="current-device"]')
        .textContent()
      expect(deviceType).toContain('桌面设备')

      // 调整到移动端大小
      await page.setViewportSize({ width: 375, height: 667 })
      await page.waitForTimeout(100)

      deviceType = await page
        .locator('[data-testid="current-device"]')
        .textContent()
      expect(deviceType).toContain('移动设备')

      // 检查组件是否也相应变化
      const componentName = await page
        .locator('[data-testid="component-name"]')
        .textContent()
      expect(componentName).toContain('Mobile')
    })

    test('应该触发设备变化事件', async ({ page }) => {
      await page.goto('/event-test')

      // 监听设备变化事件
      const eventLog = page.locator('[data-testid="event-log"]')

      // 改变设备类型
      await page.setViewportSize({ width: 375, height: 667 })
      await page.waitForTimeout(100)

      // 检查事件是否被触发
      const logContent = await eventLog.textContent()
      expect(logContent).toContain('Device changed to: mobile')
    })
  })
})
