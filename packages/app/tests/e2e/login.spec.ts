import { expect, test } from '@playwright/test'

test.describe('登录功能 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
  })

  test('应该显示登录页面', async ({ page }) => {
    // 导航到登录页面
    await page.click('a[href="/login"]')
    await expect(page.url()).toContain('/login')

    // 检查登录表单元素
    await expect(page.locator('h1')).toContainText('LDesign 登录')
    await expect(page.locator('input[type="text"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()

    // 检查提示信息
    await expect(page.locator('text=演示账号：admin / admin')).toBeVisible()
    await expect(page.locator('text=集成 @ldesign/template')).toBeVisible()
  })

  test('应该处理成功登录', async ({ page }) => {
    // 导航到登录页面
    await page.click('a[href="/login"]')

    // 填写正确的登录信息
    await page.fill('input[type="text"]', 'admin')
    await page.fill('input[type="password"]', 'admin')

    // 提交表单
    await page.click('button[type="submit"]')

    // 等待登录处理和页面跳转
    await page.waitForTimeout(1500)

    // 检查是否跳转到首页
    await expect(page.url()).toContain('/')
    await expect(page.url()).not.toContain('/login')
  })

  test('应该处理错误登录', async ({ page }) => {
    // 导航到登录页面
    await page.click('a[href="/login"]')

    // 填写错误的登录信息
    await page.fill('input[type="text"]', 'wrong')
    await page.fill('input[type="password"]', 'credentials')

    // 提交表单
    await page.click('button[type="submit"]')

    // 等待处理
    await page.waitForTimeout(1500)

    // 应该仍在登录页面
    await expect(page.url()).toContain('/login')
  })

  test('应该处理空表单提交', async ({ page }) => {
    // 导航到登录页面
    await page.click('a[href="/login"]')

    // 直接提交空表单
    await page.click('button[type="submit"]')

    // 应该仍在登录页面
    await expect(page.url()).toContain('/login')
  })

  test('应该显示加载状态', async ({ page }) => {
    // 导航到登录页面
    await page.click('a[href="/login"]')

    // 填写登录信息
    await page.fill('input[type="text"]', 'admin')
    await page.fill('input[type="password"]', 'admin')

    // 提交表单
    await page.click('button[type="submit"]')

    // 检查按钮文本变化（加载状态）
    await expect(page.locator('button[type="submit"]')).toContainText(
      '登录中...'
    )

    // 等待加载完成
    await page.waitForTimeout(1500)
  })

  test('应该支持键盘导航', async ({ page }) => {
    // 导航到登录页面
    await page.click('a[href="/login"]')

    // 使用 Tab 键导航
    await page.keyboard.press('Tab') // 聚焦到用户名输入框
    await page.keyboard.type('admin')

    await page.keyboard.press('Tab') // 聚焦到密码输入框
    await page.keyboard.type('admin')

    await page.keyboard.press('Tab') // 聚焦到提交按钮
    await page.keyboard.press('Enter') // 提交表单

    // 等待处理
    await page.waitForTimeout(1500)

    // 检查是否成功登录
    await expect(page.url()).toContain('/')
  })

  test('应该在不同设备上正确显示', async ({ page }) => {
    // 测试移动端
    await page.setViewportSize({ width: 375, height: 667 })
    await page.click('a[href="/login"]')
    await expect(page.locator('h1')).toContainText('LDesign 登录')

    // 测试平板端
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('h1')).toContainText('LDesign 登录')

    // 测试桌面端
    await page.setViewportSize({ width: 1200, height: 800 })
    await expect(page.locator('h1')).toContainText('LDesign 登录')
  })
})
