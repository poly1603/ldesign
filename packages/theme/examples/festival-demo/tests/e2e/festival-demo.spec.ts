/**
 * @ldesign/theme - Festival Demo E2E 测试
 */

import { test, expect } from '@playwright/test'

test.describe('Festival Demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('应该正确加载页面', async ({ page }) => {
    // 检查页面标题
    await expect(page).toHaveTitle(/Festival Demo/)

    // 检查主要元素是否存在
    await expect(page.locator('h2')).toContainText('节日主题挂件系统演示')
    await expect(page.locator('.theme-buttons')).toBeVisible()
  })

  test('应该显示所有主题按钮', async ({ page }) => {
    // 检查三个主题按钮是否存在
    await expect(page.locator('button:has-text("春节主题")')).toBeVisible()
    await expect(page.locator('button:has-text("圣诞主题")')).toBeVisible()
    await expect(page.locator('button:has-text("默认主题")')).toBeVisible()
  })

  test('应该能够切换到春节主题', async ({ page }) => {
    // 点击春节主题按钮
    await page.click('button:has-text("春节主题")')

    // 等待主题切换完成
    await page.waitForTimeout(500)

    // 检查主题是否切换成功
    await expect(page.locator('[data-theme="spring-festival"]')).toBeVisible()

    // 检查主题管理器显示正确的主题
    await expect(page.locator('.theme-name')).toContainText('春节主题')
  })

  test('应该能够切换到圣诞主题', async ({ page }) => {
    // 点击圣诞主题按钮
    await page.click('button:has-text("圣诞主题")')

    // 等待主题切换完成
    await page.waitForTimeout(500)

    // 检查主题是否切换成功
    await expect(page.locator('[data-theme="christmas"]')).toBeVisible()

    // 检查主题管理器显示正确的主题
    await expect(page.locator('.theme-name')).toContainText('圣诞主题')
  })

  test('应该能够切换到默认主题', async ({ page }) => {
    // 先切换到其他主题
    await page.click('button:has-text("春节主题")')
    await page.waitForTimeout(300)

    // 再切换到默认主题
    await page.click('button:has-text("默认主题")')
    await page.waitForTimeout(500)

    // 检查主题是否切换成功
    await expect(page.locator('[data-theme="default"]')).toBeVisible()

    // 检查主题管理器显示正确的主题
    await expect(page.locator('.theme-name')).toContainText('默认主题')
  })

  test('应该显示所有演示组件', async ({ page }) => {
    // 检查按钮演示组件
    await expect(page.locator('h3:has-text("按钮挂件演示")')).toBeVisible()

    // 检查卡片演示组件
    await expect(page.locator('h3:has-text("卡片挂件演示")')).toBeVisible()

    // 检查表单演示组件
    await expect(page.locator('h3:has-text("表单挂件演示")')).toBeVisible()

    // 检查面板演示组件
    await expect(page.locator('h3:has-text("面板挂件演示")')).toBeVisible()

    // 检查背景演示组件
    await expect(page.locator('h3:has-text("背景挂件演示")')).toBeVisible()
  })

  test('应该能够控制挂件显示', async ({ page }) => {
    // 点击禁用挂件按钮
    await page.click('button:has-text("禁用挂件")')
    await page.waitForTimeout(300)

    // 检查按钮文本是否变化
    await expect(page.locator('button:has-text("启用挂件")')).toBeVisible()

    // 重新启用挂件
    await page.click('button:has-text("启用挂件")')
    await page.waitForTimeout(300)

    // 检查按钮文本是否恢复
    await expect(page.locator('button:has-text("禁用挂件")')).toBeVisible()
  })

  test('应该能够开启调试模式', async ({ page }) => {
    // 点击开启调试模式按钮
    await page.click('button:has-text("开启调试模式")')
    await page.waitForTimeout(300)

    // 检查调试模式是否开启
    await expect(page.locator('.ldesign-widget-debug')).toBeVisible()

    // 检查按钮文本是否变化
    await expect(page.locator('button:has-text("关闭调试模式")')).toBeVisible()
  })

  test('应该显示主题管理器', async ({ page }) => {
    // 检查主题管理器是否存在
    await expect(page.locator('.theme-manager')).toBeVisible()

    // 检查当前主题显示
    await expect(page.locator('.current-theme')).toBeVisible()
    await expect(page.locator('.theme-name')).toBeVisible()

    // 检查主题操作按钮
    await expect(page.locator('button:has-text("推荐主题")')).toBeVisible()
  })

  test('应该显示状态栏', async ({ page }) => {
    // 检查状态栏是否存在
    await expect(page.locator('.status-bar')).toBeVisible()

    // 检查主题状态
    await expect(page.locator('.theme-status')).toBeVisible()

    // 检查挂件统计
    await expect(page.locator('.widget-stats')).toBeVisible()

    // 检查性能信息
    await expect(page.locator('.performance-info')).toBeVisible()
  })

  test('应该能够获取推荐主题', async ({ page }) => {
    // 点击推荐主题按钮
    await page.click('button:has-text("推荐主题")')

    // 等待推荐信息显示
    await page.waitForTimeout(300)

    // 检查推荐信息是否显示
    await expect(page.locator('.recommendation')).toBeVisible()
    await expect(page.locator('strong:has-text("推荐主题")')).toBeVisible()
  })

  test('应该能够在按钮演示中应用和移除挂件', async ({ page }) => {
    // 滚动到按钮演示区域
    await page.locator('h3:has-text("按钮挂件演示")').scrollIntoViewIfNeeded()

    // 点击移除所有挂件按钮
    await page
      .locator('.widget-button-demo button:has-text("移除所有挂件")')
      .click()
    await page.waitForTimeout(300)

    // 点击应用所有挂件按钮
    await page
      .locator('.widget-button-demo button:has-text("应用所有挂件")')
      .click()
    await page.waitForTimeout(300)

    // 检查挂件是否重新应用
    await expect(
      page.locator('.widget-button-demo [data-widget-type="button"]')
    ).toHaveCount(13)
  })

  test('应该能够在表单演示中输入数据', async ({ page }) => {
    // 滚动到表单演示区域
    await page.locator('h3:has-text("表单挂件演示")').scrollIntoViewIfNeeded()

    // 填写表单
    await page.fill('#username', '测试用户')
    await page.fill('#email', 'test@example.com')
    await page.fill('#phone', '13800138000')
    await page.fill('#message', '这是一条测试留言')
    await page.selectOption('#category', 'feedback')

    // 检查表单数据预览是否显示
    await expect(page.locator('.form-preview')).toBeVisible()

    // 点击重置按钮
    await page.click('button:has-text("重置表单")')

    // 检查表单是否被清空
    await expect(page.locator('#username')).toHaveValue('')
  })

  test('应该能够在背景演示中调整设置', async ({ page }) => {
    // 滚动到背景演示区域
    await page.locator('h3:has-text("背景挂件演示")').scrollIntoViewIfNeeded()

    // 调整透明度
    await page.locator('.opacity-slider').fill('50')

    // 更改动画速度
    await page.selectOption('.speed-select', '1.5')

    // 更改显示模式
    await page.selectOption('.mode-select', 'main')

    // 点击刷新统计按钮
    await page.click('button:has-text("刷新统计")')

    // 检查统计数据是否更新
    await expect(page.locator('.stat-number')).not.toHaveText('1234')
  })

  test('应该在移动端正确显示', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 })

    // 检查页面是否正确适配
    await expect(page.locator('.app-container')).toBeVisible()

    // 检查主题按钮是否垂直排列
    const themeButtons = page.locator('.theme-buttons')
    await expect(themeButtons).toBeVisible()

    // 检查状态栏是否适配移动端
    await expect(page.locator('.status-bar')).toBeVisible()
  })

  test('应该保持主题状态在页面刷新后', async ({ page }) => {
    // 切换到春节主题
    await page.click('button:has-text("春节主题")')
    await page.waitForTimeout(500)

    // 刷新页面
    await page.reload()

    // 检查主题是否保持
    await expect(page.locator('[data-theme="spring-festival"]')).toBeVisible()
    await expect(page.locator('.theme-name')).toContainText('春节主题')
  })
})
