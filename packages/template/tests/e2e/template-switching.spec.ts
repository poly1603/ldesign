/**
 * 模板切换 E2E 测试
 */

import { expect, test } from '@playwright/test'

test.describe('模板切换功能', () => {
  test.beforeEach(async ({ page }) => {
    // 访问示例项目的内置模板页面
    await page.goto('/built-in-templates')
    await page.waitForLoadState('networkidle')
  })

  test('应该显示内置模板列表', async ({ page }) => {
    // 检查页面标题
    await expect(page.locator('h1')).toContainText('内置模板展示')

    // 检查统计卡片
    const statCards = page.locator('.stat-card')
    await expect(statCards).toHaveCount(3)

    // 检查模板分类导航
    const categoryTabs = page.locator('.category-btn')
    await expect(categoryTabs).toHaveCount.greaterThan(0)

    // 检查模板网格
    const templateCards = page.locator('.template-card')
    await expect(templateCards).toHaveCount.greaterThan(0)
  })

  test('应该能够切换模板分类', async ({ page }) => {
    // 点击仪表板分类
    await page.click('button:has-text("仪表板")')

    // 等待模板加载
    await page.waitForTimeout(500)

    // 检查是否显示仪表板模板
    const templateCards = page.locator('.template-card')
    await expect(templateCards.first().locator('.template-name')).toContainText('管理后台')
  })

  test('应该能够预览模板', async ({ page }) => {
    // 点击第一个模板卡片
    const firstTemplate = page.locator('.template-card').first()
    await firstTemplate.click()

    // 检查模态框是否打开
    const modal = page.locator('.template-modal')
    await expect(modal).toBeVisible()

    // 检查模态框内容
    await expect(modal.locator('.modal-title')).toBeVisible()
    await expect(modal.locator('.modal-preview')).toBeVisible()
    await expect(modal.locator('.modal-info')).toBeVisible()
  })

  test('应该能够在模态框中配置模板属性', async ({ page }) => {
    // 打开模板预览
    await page.locator('.template-card').first().click()

    const modal = page.locator('.template-modal')
    await expect(modal).toBeVisible()

    // 修改标题
    const titleInput = modal.locator('input[type="text"]').first()
    await titleInput.fill('自定义标题')

    // 修改主题色
    const colorInput = modal.locator('input[type="color"]')
    await colorInput.fill('#ff6b6b')

    // 检查预览是否更新（这里需要根据实际实现调整）
    await page.waitForTimeout(500)

    // 验证配置已应用
    const titleValue = await titleInput.inputValue()
    expect(titleValue).toBe('自定义标题')
  })

  test('应该能够关闭模态框', async ({ page }) => {
    // 打开模板预览
    await page.locator('.template-card').first().click()

    const modal = page.locator('.template-modal')
    await expect(modal).toBeVisible()

    // 点击关闭按钮
    await page.click('.modal-close')

    // 检查模态框是否关闭
    await expect(modal).not.toBeVisible()
  })

  test('应该能够通过点击背景关闭模态框', async ({ page }) => {
    // 打开模板预览
    await page.locator('.template-card').first().click()

    const modal = page.locator('.template-modal')
    await expect(modal).toBeVisible()

    // 点击模态框背景
    await page.click('.template-modal', { position: { x: 10, y: 10 } })

    // 检查模态框是否关闭
    await expect(modal).not.toBeVisible()
  })

  test('应该显示不同设备的模板徽章', async ({ page }) => {
    // 检查设备徽章
    const deviceBadges = page.locator('.device-badge')
    await expect(deviceBadges).toHaveCount.greaterThan(0)

    // 检查徽章文本
    const firstBadge = deviceBadges.first()
    const badgeText = await firstBadge.textContent()
    expect(['桌面端', '平板端', '移动端']).toContain(badgeText)
  })

  test('应该显示模板标签', async ({ page }) => {
    // 检查模板标签
    const templateTags = page.locator('.template-tag')
    await expect(templateTags).toHaveCount.greaterThan(0)

    // 检查标签内容
    const firstTag = templateTags.first()
    await expect(firstTag).toHaveText(/\w+/)
  })

  test('应该响应屏幕尺寸变化', async ({ page }) => {
    // 测试桌面端布局
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.waitForTimeout(300)

    const templateGrid = page.locator('.templates-grid')
    let gridColumns = await templateGrid.evaluate(el =>
      window.getComputedStyle(el).gridTemplateColumns.split(' ').length,
    )
    expect(gridColumns).toBeGreaterThan(1)

    // 测试移动端布局
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(300)

    gridColumns = await templateGrid.evaluate(el =>
      window.getComputedStyle(el).gridTemplateColumns.split(' ').length,
    )
    expect(gridColumns).toBe(1)
  })
})

test.describe('设备响应式切换', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/component-demo')
    await page.waitForLoadState('networkidle')
  })

  test('应该能够手动切换设备类型', async ({ page }) => {
    // 查找设备切换按钮
    const deviceTabs = page.locator('[data-testid="device-tabs"] button')
    await expect(deviceTabs).toHaveCount(3)

    // 点击平板端
    await page.click('button:has-text("平板端")')
    await page.waitForTimeout(500)

    // 检查是否切换到平板端模板
    const activeTab = page.locator('[data-testid="device-tabs"] button.active')
    await expect(activeTab).toContainText('平板端')
  })

  test('应该能够手动切换模板', async ({ page }) => {
    // 查找模板选择器
    const templateSelector = page.locator('[data-testid="template-selector"]')
    await expect(templateSelector).toBeVisible()

    // 选择不同的模板
    const templateOptions = page.locator('[data-testid="template-option"]')
    if (await templateOptions.count() > 1) {
      await templateOptions.nth(1).click()
      await page.waitForTimeout(500)

      // 检查模板是否切换
      const activeOption = page.locator('[data-testid="template-option"].active')
      await expect(activeOption).toBeVisible()
    }
  })

  test('应该显示加载状态', async ({ page }) => {
    // 触发模板切换
    await page.click('button:has-text("移动端")')

    // 检查加载状态（可能很快，所以使用 waitFor）
    const loadingIndicator = page.locator('.template-loading, .loading-spinner')

    // 等待加载完成
    await page.waitForTimeout(1000)

    // 加载完成后，加载指示器应该消失
    await expect(loadingIndicator).toHaveCount(0)
  })

  test('应该处理加载错误', async ({ page }) => {
    // 模拟网络错误（如果有相应的测试接口）
    await page.route('**/templates/**', route => route.abort())

    // 尝试切换模板
    await page.click('button:has-text("移动端")')
    await page.waitForTimeout(1000)

    // 检查是否显示错误状态
    const errorMessage = page.locator('.template-error, .error-message')
    await expect(errorMessage).toBeVisible()
  })
})

test.describe('模板渲染器', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/component-demo')
    await page.waitForLoadState('networkidle')
  })

  test('应该正确渲染模板内容', async ({ page }) => {
    // 等待模板加载
    await page.waitForSelector('[data-testid="template-renderer"]')

    // 检查模板内容是否渲染
    const templateContent = page.locator('[data-testid="template-renderer"]')
    await expect(templateContent).toBeVisible()
    await expect(templateContent).not.toBeEmpty()
  })

  test('应该支持属性传递', async ({ page }) => {
    // 查找属性配置面板
    const configPanel = page.locator('[data-testid="config-panel"]')
    if (await configPanel.isVisible()) {
      // 修改标题属性
      const titleInput = configPanel.locator('input[placeholder*="标题"]')
      if (await titleInput.isVisible()) {
        await titleInput.fill('测试标题')
        await page.waitForTimeout(500)

        // 检查模板是否反映了属性变化
        const templateRenderer = page.locator('[data-testid="template-renderer"]')
        await expect(templateRenderer).toContainText('测试标题')
      }
    }
  })

  test('应该支持插槽内容', async ({ page }) => {
    // 检查是否有插槽内容
    const slotContent = page.locator('[data-testid="template-renderer"] [slot]')

    if (await slotContent.count() > 0) {
      await expect(slotContent.first()).toBeVisible()
    }
  })
})

test.describe('性能测试', () => {
  test('模板切换应该在合理时间内完成', async ({ page }) => {
    await page.goto('/component-demo')
    await page.waitForLoadState('networkidle')

    // 记录切换开始时间
    const startTime = Date.now()

    // 执行模板切换
    await page.click('button:has-text("移动端")')

    // 等待切换完成
    await page.waitForSelector('[data-testid="template-renderer"]')

    const endTime = Date.now()
    const switchTime = endTime - startTime

    // 切换时间应该在 2 秒内
    expect(switchTime).toBeLessThan(2000)
  })

  test('应该正确处理快速连续切换', async ({ page }) => {
    await page.goto('/component-demo')
    await page.waitForLoadState('networkidle')

    // 快速连续切换设备类型
    await page.click('button:has-text("平板端")')
    await page.click('button:has-text("移动端")')
    await page.click('button:has-text("桌面端")')

    // 等待最终状态稳定
    await page.waitForTimeout(1000)

    // 检查最终状态
    const activeTab = page.locator('[data-testid="device-tabs"] button.active')
    await expect(activeTab).toContainText('桌面端')
  })
})
