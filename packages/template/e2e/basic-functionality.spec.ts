import { expect, test } from '@playwright/test'

test.describe('基础功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到示例应用
    await page.goto('http://localhost:3005')
  })

  test('应用正常启动', async ({ page }) => {
    // 检查页面标题
    await expect(page).toHaveTitle(/LDesign Template/)

    // 检查主要导航元素
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('h1')).toContainText('LDesign Template')
  })

  test('模板渲染器基础功能', async ({ page }) => {
    // 导航到组件演示页面
    await page.click('text=组件演示')

    // 等待页面加载
    await page.waitForSelector('[data-testid="template-renderer"]')

    // 检查模板渲染器是否正常显示
    const renderer = page.locator('[data-testid="template-renderer"]')
    await expect(renderer).toBeVisible()

    // 检查默认模板是否加载
    await expect(renderer.locator('.template-content')).toBeVisible()
  })

  test('模板切换功能', async ({ page }) => {
    await page.click('text=组件演示')
    await page.waitForSelector('[data-testid="template-selector"]')

    // 获取初始模板内容
    const initialContent = await page.locator('.template-content').textContent()

    // 切换到不同的模板
    await page.selectOption('[data-testid="template-selector"]', 'modern')

    // 等待模板切换完成
    await page.waitForTimeout(500)

    // 检查内容是否发生变化
    const newContent = await page.locator('.template-content').textContent()
    expect(newContent).not.toBe(initialContent)
  })

  test('设备类型切换', async ({ page }) => {
    await page.click('text=设备演示')
    await page.waitForSelector('[data-testid="device-simulator"]')

    // 检查桌面端模板
    await page.click('[data-testid="device-desktop"]')
    await expect(page.locator('.desktop-template')).toBeVisible()

    // 切换到移动端
    await page.click('[data-testid="device-mobile"]')
    await expect(page.locator('.mobile-template')).toBeVisible()

    // 切换到平板端
    await page.click('[data-testid="device-tablet"]')
    await expect(page.locator('.tablet-template')).toBeVisible()
  })

  test('响应式设计', async ({ page }) => {
    await page.click('text=设备演示')

    // 测试不同视口大小
    const viewports = [
      { width: 1200, height: 800, expectedDevice: 'desktop' },
      { width: 768, height: 1024, expectedDevice: 'tablet' },
      { width: 375, height: 667, expectedDevice: 'mobile' },
    ]

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.waitForTimeout(300) // 等待响应式检测

      const deviceInfo = await page.locator('[data-testid="current-device"]').textContent()
      expect(deviceInfo).toContain(viewport.expectedDevice)
    }
  })

  test('错误处理', async ({ page }) => {
    await page.click('text=组件演示')

    // 尝试加载不存在的模板
    await page.evaluate(() => {
      // 模拟加载错误
      window.dispatchEvent(
        new CustomEvent('template-error', {
          detail: { error: new Error('模板不存在') },
        }),
      )
    })

    // 检查错误信息是否显示
    await expect(page.locator('.error-message')).toBeVisible()
    await expect(page.locator('.error-message')).toContainText('模板不存在')
  })

  test('加载状态显示', async ({ page }) => {
    await page.click('text=组件演示')

    // 模拟慢速网络
    await page.route('**/*', (route) => {
      setTimeout(() => route.continue(), 1000)
    })

    // 触发模板加载
    await page.selectOption('[data-testid="template-selector"]', 'classic')

    // 检查加载状态
    await expect(page.locator('.loading-indicator')).toBeVisible()

    // 等待加载完成
    await expect(page.locator('.loading-indicator')).not.toBeVisible({ timeout: 5000 })
  })

  test('性能监控功能', async ({ page }) => {
    await page.click('text=性能演示')
    await page.waitForSelector('[data-testid="performance-monitor"]')

    // 检查性能指标是否显示
    await expect(page.locator('[data-testid="fps-metric"]')).toBeVisible()
    await expect(page.locator('[data-testid="memory-metric"]')).toBeVisible()

    // 检查指标数值是否合理
    const fpsText = await page.locator('[data-testid="fps-metric"]').textContent()
    const fps = Number.parseInt(fpsText?.match(/\d+/)?.[0] || '0')
    expect(fps).toBeGreaterThan(0)
    expect(fps).toBeLessThanOrEqual(60)
  })

  test('虚拟滚动功能', async ({ page }) => {
    await page.click('text=虚拟滚动演示')
    await page.waitForSelector('[data-testid="virtual-scroll"]')

    // 检查虚拟滚动容器
    const container = page.locator('[data-testid="virtual-scroll"]')
    await expect(container).toBeVisible()

    // 检查只渲染可见项目
    const visibleItems = await container.locator('.virtual-item').count()
    expect(visibleItems).toBeLessThan(100) // 应该少于总数据量

    // 测试滚动功能
    await container.scroll({ top: 1000 })
    await page.waitForTimeout(100)

    // 检查新的项目是否渲染
    const newVisibleItems = await container.locator('.virtual-item').count()
    expect(newVisibleItems).toBeGreaterThan(0)
  })

  test('缓存功能验证', async ({ page }) => {
    await page.click('text=组件演示')

    // 记录初始加载时间
    const startTime = Date.now()
    await page.selectOption('[data-testid="template-selector"]', 'modern')
    await page.waitForSelector('.template-content')
    const firstLoadTime = Date.now() - startTime

    // 切换到其他模板再切换回来
    await page.selectOption('[data-testid="template-selector"]', 'classic')
    await page.waitForSelector('.template-content')

    // 再次加载相同模板（应该从缓存加载）
    const cacheStartTime = Date.now()
    await page.selectOption('[data-testid="template-selector"]', 'modern')
    await page.waitForSelector('.template-content')
    const cacheLoadTime = Date.now() - cacheStartTime

    // 缓存加载应该更快
    expect(cacheLoadTime).toBeLessThan(firstLoadTime)
  })
})
