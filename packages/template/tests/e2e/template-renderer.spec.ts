/**
 * TemplateRenderer E2E 测试
 */

import { expect, test } from '@playwright/test'

test.describe('TemplateRenderer E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到测试页面
    await page.goto('/template-renderer-demo')
  })

  test('应该正确渲染模板渲染器', async ({ page }) => {
    // 等待组件加载
    await page.waitForSelector('.template-renderer')

    // 验证基本结构
    const renderer = page.locator('.template-renderer')
    await expect(renderer).toBeVisible()

    const content = page.locator('.template-renderer__content')
    await expect(content).toBeVisible()
  })

  test('应该显示加载状态', async ({ page }) => {
    // 模拟慢速网络
    await page.route('**/templates/**', (route) => {
      setTimeout(() => route.continue(), 2000)
    })

    // 触发模板加载
    await page.click('[data-testid="load-template-btn"]')

    // 验证加载状态
    const loading = page.locator('.template-loading')
    await expect(loading).toBeVisible()

    const loadingText = page.locator('.template-loading__text')
    await expect(loadingText).toHaveText('加载模板中...')

    // 等待加载完成
    await expect(loading).not.toBeVisible({ timeout: 5000 })
  })

  test('应该处理模板切换', async ({ page }) => {
    // 等待初始模板加载
    await page.waitForSelector('[data-testid="current-template"]')

    // 获取当前模板名称
    const initialTemplate = await page.textContent('[data-testid="current-template"]')

    // 切换到不同的模板
    await page.selectOption('[data-testid="template-selector"]', 'modern')

    // 等待模板切换完成
    await page.waitForFunction(
      (initial) => {
        const current = document.querySelector('[data-testid="current-template"]')?.textContent
        return current && current !== initial
      },
      initialTemplate,
    )

    // 验证模板已切换
    const newTemplate = await page.textContent('[data-testid="current-template"]')
    expect(newTemplate).not.toBe(initialTemplate)
  })

  test('应该显示错误状态并支持重试', async ({ page }) => {
    // 模拟网络错误
    await page.route('**/templates/error-template/**', (route) => {
      route.abort('failed')
    })

    // 尝试加载错误模板
    await page.selectOption('[data-testid="template-selector"]', 'error-template')

    // 验证错误状态
    const error = page.locator('.template-error')
    await expect(error).toBeVisible()

    const errorMessage = page.locator('.template-error__message')
    await expect(errorMessage).toBeVisible()

    // 点击重试按钮
    const retryBtn = page.locator('.template-error__retry')
    await expect(retryBtn).toBeVisible()
    await retryBtn.click()

    // 验证重试后的状态
    await expect(error).toBeVisible() // 由于仍然会失败
  })

  test('应该支持响应式设备切换', async ({ page }) => {
    // 设置桌面视口
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.reload()

    // 验证桌面模板
    await page.waitForSelector('[data-testid="device-type"]')
    let deviceType = await page.textContent('[data-testid="device-type"]')
    expect(deviceType).toBe('desktop')

    // 切换到移动视口
    await page.setViewportSize({ width: 375, height: 667 })

    // 等待设备类型更新
    await page.waitForFunction(() => {
      const element = document.querySelector('[data-testid="device-type"]')
      return element?.textContent === 'mobile'
    })

    deviceType = await page.textContent('[data-testid="device-type"]')
    expect(deviceType).toBe('mobile')
  })

  test('应该显示模板选择器', async ({ page }) => {
    // 启用模板选择器
    await page.check('[data-testid="show-selector-checkbox"]')

    // 验证选择器触发器显示
    const trigger = page.locator('.template-selector-trigger')
    await expect(trigger).toBeVisible()

    // 点击触发器
    const triggerBtn = page.locator('.template-selector-trigger__button')
    await triggerBtn.click()

    // 验证选择器对话框打开
    const dialog = page.locator('.template-selector')
    await expect(dialog).toBeVisible()

    // 验证对话框内容
    const title = page.locator('.template-selector__title')
    await expect(title).toHaveText('选择模板')

    // 关闭对话框
    const closeBtn = page.locator('.template-selector__close')
    await closeBtn.click()

    await expect(dialog).not.toBeVisible()
  })

  test('应该传递props给模板组件', async ({ page }) => {
    // 设置自定义props
    await page.fill('[data-testid="template-title-input"]', '自定义标题')
    await page.click('[data-testid="apply-props-btn"]')

    // 验证props传递到模板
    await page.waitForSelector('[data-testid="template-content"]')
    const templateContent = page.locator('[data-testid="template-content"]')
    await expect(templateContent).toContainText('自定义标题')
  })

  test('应该触发事件回调', async ({ page }) => {
    // 监听事件
    let templateChangeEvent = null
    let loadSuccessEvent = null

    await page.exposeFunction('onTemplateChange', (templateName) => {
      templateChangeEvent = templateName
    })

    await page.exposeFunction('onLoadSuccess', (template) => {
      loadSuccessEvent = template
    })

    // 绑定事件监听器
    await page.evaluate(() => {
      const renderer = document.querySelector('[data-testid="template-renderer"]')
      if (renderer) {
        renderer.addEventListener('template-change', (e) => {
          window.onTemplateChange(e.detail)
        })
        renderer.addEventListener('load-success', (e) => {
          window.onLoadSuccess(e.detail)
        })
      }
    })

    // 切换模板
    await page.selectOption('[data-testid="template-selector"]', 'classic')

    // 等待事件触发
    await page.waitForFunction(() => window.templateChangeEvent !== null)

    // 验证事件数据
    expect(templateChangeEvent).toBe('classic')
    expect(loadSuccessEvent).toBeTruthy()
  })

  test('应该支持键盘导航', async ({ page }) => {
    // 启用模板选择器
    await page.check('[data-testid="show-selector-checkbox"]')

    // 使用Tab键导航到选择器按钮
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // 使用Enter键打开选择器
    await page.keyboard.press('Enter')

    // 验证选择器打开
    const dialog = page.locator('.template-selector')
    await expect(dialog).toBeVisible()

    // 使用Escape键关闭选择器
    await page.keyboard.press('Escape')

    await expect(dialog).not.toBeVisible()
  })

  test('应该支持无障碍访问', async ({ page }) => {
    // 检查ARIA属性
    const renderer = page.locator('.template-renderer')
    await expect(renderer).toHaveAttribute('role', 'region')

    // 检查加载状态的ARIA属性
    await page.click('[data-testid="load-template-btn"]')

    const loading = page.locator('.template-loading')
    await expect(loading).toHaveAttribute('aria-live', 'polite')
    await expect(loading).toHaveAttribute('aria-busy', 'true')
  })

  test('应该在不同浏览器中正常工作', async ({ page, browserName }) => {
    // 基本功能测试
    await page.waitForSelector('.template-renderer')

    // 模板切换测试
    await page.selectOption('[data-testid="template-selector"]', 'modern')
    await page.waitForSelector('[data-testid="current-template"]')

    const templateName = await page.textContent('[data-testid="current-template"]')
    expect(templateName).toContain('modern')

    // 记录浏览器特定的行为
    console.log(`测试在 ${browserName} 浏览器中通过`)
  })
})
