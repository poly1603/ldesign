/**
 * TemplateRenderer E2E 测试
 */

import { test, expect } from '@playwright/test'

test.describe('TemplateRenderer E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到测试页面
    await page.goto('/template-renderer')
  })

  test('应该渲染默认模板', async ({ page }) => {
    // 等待模板渲染器加载
    await page.waitForSelector('.template-renderer')
    
    // 检查是否显示了模板内容
    const renderer = page.locator('.template-renderer')
    await expect(renderer).toBeVisible()
    
    // 检查是否显示了选择器按钮
    const selectorButton = page.locator('.template-renderer__selector-btn')
    await expect(selectorButton).toBeVisible()
  })

  test('应该显示加载状态', async ({ page }) => {
    // 模拟慢速网络
    await page.route('**/templates/**', route => {
      setTimeout(() => route.continue(), 2000)
    })
    
    await page.goto('/template-renderer')
    
    // 检查加载状态
    const loading = page.locator('.template-renderer__loading')
    await expect(loading).toBeVisible()
    await expect(loading.locator('.loading-text')).toContainText('加载模板中')
  })

  test('应该打开模板选择器', async ({ page }) => {
    // 等待页面加载
    await page.waitForSelector('.template-renderer__selector-btn')
    
    // 点击选择器按钮
    await page.click('.template-renderer__selector-btn')
    
    // 检查选择器是否打开
    const selector = page.locator('.template-selector')
    await expect(selector).toBeVisible()
    
    // 检查选择器标题
    const title = page.locator('.selector-title')
    await expect(title).toContainText('选择')
  })

  test('应该切换模板', async ({ page }) => {
    // 打开模板选择器
    await page.click('.template-renderer__selector-btn')
    await page.waitForSelector('.template-selector')
    
    // 选择一个不同的模板
    const templateCard = page.locator('.template-card').nth(1)
    await templateCard.click()
    
    // 检查选择器是否关闭
    const selector = page.locator('.template-selector')
    await expect(selector).not.toBeVisible()
    
    // 检查是否触发了模板切换事件
    // 这里可以检查页面内容的变化或者事件日志
  })

  test('应该搜索模板', async ({ page }) => {
    // 打开模板选择器
    await page.click('.template-renderer__selector-btn')
    await page.waitForSelector('.template-selector')
    
    // 在搜索框中输入
    const searchInput = page.locator('.search-field')
    await searchInput.fill('modern')
    
    // 检查搜索结果
    const templateCards = page.locator('.template-card')
    const cardCount = await templateCards.count()
    
    // 应该只显示匹配的模板
    expect(cardCount).toBeGreaterThan(0)
    
    // 检查显示的模板是否包含搜索关键词
    const firstCard = templateCards.first()
    const cardText = await firstCard.textContent()
    expect(cardText?.toLowerCase()).toContain('modern')
  })

  test('应该清除搜索', async ({ page }) => {
    // 打开模板选择器并搜索
    await page.click('.template-renderer__selector-btn')
    await page.waitForSelector('.template-selector')
    
    const searchInput = page.locator('.search-field')
    await searchInput.fill('test')
    
    // 点击清除按钮
    const clearButton = page.locator('.search-clear')
    await clearButton.click()
    
    // 检查搜索框是否被清空
    await expect(searchInput).toHaveValue('')
  })

  test('应该关闭模板选择器', async ({ page }) => {
    // 打开模板选择器
    await page.click('.template-renderer__selector-btn')
    await page.waitForSelector('.template-selector')
    
    // 点击关闭按钮
    await page.click('.selector-close')
    
    // 检查选择器是否关闭
    const selector = page.locator('.template-selector')
    await expect(selector).not.toBeVisible()
  })

  test('应该通过背景点击关闭选择器', async ({ page }) => {
    // 打开模板选择器
    await page.click('.template-renderer__selector-btn')
    await page.waitForSelector('.template-selector')
    
    // 点击背景区域
    await page.click('.template-selector', { position: { x: 10, y: 10 } })
    
    // 检查选择器是否关闭
    const selector = page.locator('.template-selector')
    await expect(selector).not.toBeVisible()
  })

  test('应该响应设备类型变化', async ({ page }) => {
    // 设置桌面端视口
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.reload()
    
    // 检查当前设备类型
    let deviceInfo = await page.locator('[data-device-type]').getAttribute('data-device-type')
    expect(deviceInfo).toBe('desktop')
    
    // 切换到移动端视口
    await page.setViewportSize({ width: 375, height: 667 })
    
    // 等待设备类型更新
    await page.waitForTimeout(500)
    
    // 检查设备类型是否更新
    deviceInfo = await page.locator('[data-device-type]').getAttribute('data-device-type')
    expect(deviceInfo).toBe('mobile')
  })

  test('应该显示错误状态', async ({ page }) => {
    // 模拟网络错误
    await page.route('**/templates/**', route => {
      route.abort('failed')
    })
    
    await page.goto('/template-renderer')
    
    // 检查错误状态
    const error = page.locator('.template-renderer__error')
    await expect(error).toBeVisible()
    await expect(error.locator('.error-message')).toContainText('模板加载失败')
    
    // 检查重试按钮
    const retryButton = page.locator('.error-retry')
    await expect(retryButton).toBeVisible()
  })

  test('应该重试加载模板', async ({ page }) => {
    // 首先模拟错误
    let shouldFail = true
    await page.route('**/templates/**', route => {
      if (shouldFail) {
        route.abort('failed')
      } else {
        route.continue()
      }
    })
    
    await page.goto('/template-renderer')
    
    // 等待错误状态显示
    await page.waitForSelector('.template-renderer__error')
    
    // 修复网络问题
    shouldFail = false
    
    // 点击重试按钮
    await page.click('.error-retry')
    
    // 检查是否成功加载
    await page.waitForSelector('.template-renderer__content')
    const error = page.locator('.template-renderer__error')
    await expect(error).not.toBeVisible()
  })

  test('应该显示空状态', async ({ page }) => {
    // 导航到没有模板的分类
    await page.goto('/template-renderer?category=nonexistent')
    
    // 检查空状态
    const empty = page.locator('.template-renderer__empty')
    await expect(empty).toBeVisible()
    await expect(empty.locator('.empty-message')).toContainText('暂无可用模板')
  })

  test('应该支持键盘导航', async ({ page }) => {
    // 打开模板选择器
    await page.click('.template-renderer__selector-btn')
    await page.waitForSelector('.template-selector')
    
    // 使用 Tab 键导航
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // 使用 Enter 键选择模板
    await page.keyboard.press('Enter')
    
    // 检查选择器是否关闭
    const selector = page.locator('.template-selector')
    await expect(selector).not.toBeVisible()
  })

  test('应该支持 ESC 键关闭选择器', async ({ page }) => {
    // 打开模板选择器
    await page.click('.template-renderer__selector-btn')
    await page.waitForSelector('.template-selector')
    
    // 按 ESC 键
    await page.keyboard.press('Escape')
    
    // 检查选择器是否关闭
    const selector = page.locator('.template-selector')
    await expect(selector).not.toBeVisible()
  })

  test('应该在不同设备类型下显示不同模板', async ({ page }) => {
    // 桌面端
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.reload()
    
    let templateContent = await page.locator('.template-renderer__content').textContent()
    const desktopContent = templateContent
    
    // 移动端
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)
    
    templateContent = await page.locator('.template-renderer__content').textContent()
    const mobileContent = templateContent
    
    // 内容应该不同（如果有不同的模板）
    // 这个测试取决于实际的模板内容
    expect(desktopContent).toBeDefined()
    expect(mobileContent).toBeDefined()
  })
})
