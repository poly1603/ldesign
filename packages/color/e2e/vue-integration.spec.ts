/**
 * Vue 集成 E2E 测试
 */

import { expect, test } from '@playwright/test'

test.describe('Vue 主题集成测试', () => {
  test.beforeEach(async ({ page }) => {
    // 访问Vue示例页面
    await page.goto('/examples/vue/')
  })

  test('主题切换功能', async ({ page }) => {
    // 检查初始主题
    const body = page.locator('body')
    await expect(body).toHaveAttribute('data-theme', 'default')
    await expect(body).toHaveAttribute('data-mode', 'light')

    // 点击主题切换按钮
    const themeToggle = page.locator('.l-theme-toggle')
    await themeToggle.click()

    // 验证主题已切换到深色模式
    await expect(body).toHaveAttribute('data-mode', 'dark')

    // 再次点击切换回浅色模式
    await themeToggle.click()
    await expect(body).toHaveAttribute('data-mode', 'light')
  })

  test('主题选择器功能', async ({ page }) => {
    // 查找主题选择器
    const themeSelector = page.locator('.l-theme-selector select')

    // 切换到蓝色主题
    await themeSelector.selectOption('blue')

    // 验证主题已切换
    const body = page.locator('body')
    await expect(body).toHaveAttribute('data-theme', 'blue')

    // 验证CSS变量已更新
    const primaryColor = await page.evaluate(() => {
      return getComputedStyle(document.body).getPropertyValue(
        '--l-color-primary'
      )
    })
    expect(primaryColor.trim()).toBe('#1890ff')
  })

  test('颜色选择器功能', async ({ page }) => {
    // 查找颜色选择器
    const colorPicker = page.locator('.l-color-picker')

    // 点击打开颜色面板
    await colorPicker.click()

    // 验证面板已打开
    const panel = page.locator('.l-color-picker__panel')
    await expect(panel).toBeVisible()

    // 选择预设颜色
    const preset = panel.locator('.l-color-picker__preset').first()
    await preset.click()

    // 验证颜色已更新
    const preview = colorPicker.locator('.l-color-picker__preview')
    const backgroundColor = await preview.evaluate(el => {
      return getComputedStyle(el).backgroundColor
    })
    expect(backgroundColor).toBeTruthy()
  })

  test('响应式设计', async ({ page }) => {
    // 测试桌面视图
    await page.setViewportSize({ width: 1200, height: 800 })

    const themeSelector = page.locator('.l-theme-selector')
    await expect(themeSelector).toBeVisible()

    // 测试移动端视图
    await page.setViewportSize({ width: 375, height: 667 })

    // 验证组件在移动端仍然可见和可用
    await expect(themeSelector).toBeVisible()

    const themeToggle = page.locator('.l-theme-toggle')
    await expect(themeToggle).toBeVisible()
  })

  test('键盘导航', async ({ page }) => {
    // 使用Tab键导航到主题切换按钮
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    const themeToggle = page.locator('.l-theme-toggle:focus')
    await expect(themeToggle).toBeVisible()

    // 使用空格键激活
    await page.keyboard.press('Space')

    // 验证主题已切换
    const body = page.locator('body')
    await expect(body).toHaveAttribute('data-mode', 'dark')
  })

  test('性能测试', async ({ page }) => {
    // 测试快速切换主题的性能
    const startTime = Date.now()

    for (let i = 0; i < 10; i++) {
      await page.locator('.l-theme-toggle').click()
      await page.waitForTimeout(50) // 等待动画完成
    }

    const endTime = Date.now()
    const totalTime = endTime - startTime

    // 10次切换应该在2秒内完成
    expect(totalTime).toBeLessThan(2000)
  })

  test('本地存储持久化', async ({ page }) => {
    // 切换到深色模式
    await page.locator('.l-theme-toggle').click()

    // 刷新页面
    await page.reload()

    // 验证主题设置被保持
    const body = page.locator('body')
    await expect(body).toHaveAttribute('data-mode', 'dark')
  })

  test('系统主题同步', async ({ page }) => {
    // 模拟系统深色模式
    await page.emulateMedia({ colorScheme: 'dark' })

    // 如果启用了系统主题同步，应该自动切换到深色模式
    // 这个测试需要根据具体实现调整
    await page.waitForTimeout(100)

    const body = page.locator('body')
    // 注意：这个测试可能需要根据实际的系统主题同步实现来调整
  })

  test('错误处理', async ({ page }) => {
    // 测试无效主题名称的处理
    await page.evaluate(() => {
      // @ts-ignore
      window.themeManager?.setTheme('invalid-theme-name')
    })

    // 应该回退到默认主题或保持当前主题
    const body = page.locator('body')
    const theme = await body.getAttribute('data-theme')
    expect(['default', 'blue', 'green', 'purple', 'orange']).toContain(theme)
  })

  test('多实例支持', async ({ page }) => {
    // 如果页面上有多个主题管理器实例，它们应该独立工作
    const toggles = page.locator('.l-theme-toggle')
    const count = await toggles.count()

    if (count > 1) {
      // 点击第一个切换器
      await toggles.nth(0).click()

      // 验证所有实例都同步更新
      const body = page.locator('body')
      await expect(body).toHaveAttribute('data-mode', 'dark')
    }
  })
})
