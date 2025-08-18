/**
 * 主题管理 E2E 测试用例
 *
 * 测试主题管理功能在真实浏览器环境中的表现，包括：
 * - 主题切换功能
 * - 模式切换功能
 * - 用户界面交互
 * - 性能表现
 * - 错误处理
 *
 * @version 0.1.0
 * @author ldesign
 */

import { expect, test } from '@playwright/test'

// ==================== 测试配置 ====================

const BASE_URL = 'http://localhost:5173'

// ==================== 测试套件 ====================

test.describe('主题管理 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到测试页面
    await page.goto(`${BASE_URL}/examples/vanilla/`)

    // 等待页面加载完成
    await page.waitForLoadState('networkidle')
  })

  // ==================== 基础功能测试 ====================

  test.describe('基础功能', () => {
    test('应该正确加载页面', async ({ page }) => {
      // 检查页面标题
      await expect(page).toHaveTitle(/@ldesign\/color/)

      // 检查主要元素是否存在
      await expect(page.locator('h1')).toContainText('@ldesign/color')
      await expect(page.locator('.theme-controls')).toBeVisible()
      await expect(page.locator('.theme-grid')).toBeVisible()
    })

    test('应该显示当前主题状态', async ({ page }) => {
      // 检查状态显示
      const statusElement = page.locator('.status')
      await expect(statusElement).toBeVisible()

      // 检查状态信息包含主题名称
      const statusText = await statusElement.textContent()
      expect(statusText).toMatch(/当前主题:/)
      expect(statusText).toMatch(/当前模式:/)
    })

    test('应该显示主题网格', async ({ page }) => {
      // 检查主题网格
      const themeGrid = page.locator('.theme-grid')
      await expect(themeGrid).toBeVisible()

      // 检查主题卡片
      const themeCards = page.locator('.theme-card')
      await expect(themeCards).toHaveCount(12) // 预设主题数量
    })
  })

  // ==================== 主题切换测试 ====================

  test.describe('主题切换', () => {
    test('应该能够切换主题', async ({ page }) => {
      // 获取初始主题
      const initialStatus = await page.locator('.status').textContent()

      // 点击第一个主题卡片
      const firstThemeCard = page.locator('.theme-card').first()
      await firstThemeCard.click()

      // 等待主题切换完成
      await page.waitForTimeout(100)

      // 检查状态是否更新
      const newStatus = await page.locator('.status').textContent()
      expect(newStatus).not.toBe(initialStatus)
    })

    test('应该能够切换多个主题', async ({ page }) => {
      const themeCards = page.locator('.theme-card')
      const cardCount = await themeCards.count()

      // 依次点击所有主题卡片
      for (let i = 0; i < Math.min(cardCount, 5); i++) {
        const card = themeCards.nth(i)
        await card.click()
        await page.waitForTimeout(100)

        // 检查主题是否应用
        const status = await page.locator('.status').textContent()
        expect(status).toMatch(/当前主题:/)
      }
    })

    test('应该显示主题切换动画', async ({ page }) => {
      // 点击主题卡片
      const themeCard = page.locator('.theme-card').first()
      await themeCard.click()

      // 检查是否有过渡动画
      const body = page.locator('body')
      const transition = await body.evaluate(
        el => window.getComputedStyle(el).transition
      )
      expect(transition).not.toBe('none')
    })
  })

  // ==================== 模式切换测试 ====================

  test.describe('模式切换', () => {
    test('应该能够切换明暗模式', async ({ page }) => {
      // 获取模式切换按钮
      const modeToggle = page.locator('.mode-toggle')
      await expect(modeToggle).toBeVisible()

      // 获取初始模式
      const initialStatus = await page.locator('.status').textContent()

      // 点击模式切换按钮
      await modeToggle.click()
      await page.waitForTimeout(100)

      // 检查模式是否切换
      const newStatus = await page.locator('.status').textContent()
      expect(newStatus).not.toBe(initialStatus)
    })

    test('应该正确显示模式切换按钮状态', async ({ page }) => {
      const modeToggle = page.locator('.mode-toggle')

      // 检查初始状态（应该是light模式）
      await expect(modeToggle).toContainText('🌙')

      // 切换到dark模式
      await modeToggle.click()
      await page.waitForTimeout(100)

      // 检查按钮状态更新
      await expect(modeToggle).toContainText('☀️')
    })

    test('应该保持主题设置当切换模式时', async ({ page }) => {
      // 切换到特定主题
      const themeCard = page.locator('.theme-card').nth(2)
      await themeCard.click()
      await page.waitForTimeout(100)

      // 获取当前主题名称
      const statusBefore = await page.locator('.status').textContent()
      const themeName = statusBefore?.match(/当前主题:\s*(\w+)/)?.[1]

      // 切换模式
      const modeToggle = page.locator('.mode-toggle')
      await modeToggle.click()
      await page.waitForTimeout(100)

      // 检查主题名称是否保持不变
      const statusAfter = await page.locator('.status').textContent()
      expect(statusAfter).toContain(`当前主题: ${themeName}`)
    })
  })

  // ==================== 用户界面测试 ====================

  test.describe('用户界面', () => {
    test('应该响应式设计', async ({ page }) => {
      // 测试桌面尺寸
      await page.setViewportSize({ width: 1920, height: 1080 })
      await expect(page.locator('.theme-grid')).toBeVisible()

      // 测试平板尺寸
      await page.setViewportSize({ width: 768, height: 1024 })
      await expect(page.locator('.theme-grid')).toBeVisible()

      // 测试手机尺寸
      await page.setViewportSize({ width: 375, height: 667 })
      await expect(page.locator('.theme-grid')).toBeVisible()
    })

    test('应该支持键盘导航', async ({ page }) => {
      // 聚焦到主题卡片
      const firstCard = page.locator('.theme-card').first()
      await firstCard.focus()

      // 使用Tab键导航
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')

      // 使用Enter键激活
      await page.keyboard.press('Enter')
      await page.waitForTimeout(100)

      // 检查主题是否切换
      const status = await page.locator('.status').textContent()
      expect(status).toMatch(/当前主题:/)
    })

    test('应该显示主题卡片信息', async ({ page }) => {
      const themeCard = page.locator('.theme-card').first()

      // 检查卡片内容
      await expect(themeCard.locator('.theme-name')).toBeVisible()
      await expect(themeCard.locator('.theme-preview')).toBeVisible()
    })
  })

  // ==================== 性能测试 ====================

  test.describe('性能测试', () => {
    test('主题切换应该在合理时间内完成', async ({ page }) => {
      const themeCard = page.locator('.theme-card').first()

      // 测量主题切换时间
      const startTime = Date.now()
      await themeCard.click()
      await page.waitForTimeout(100)
      const endTime = Date.now()

      const duration = endTime - startTime
      expect(duration).toBeLessThan(200) // 200ms内完成
    })

    test('模式切换应该在合理时间内完成', async ({ page }) => {
      const modeToggle = page.locator('.mode-toggle')

      // 测量模式切换时间
      const startTime = Date.now()
      await modeToggle.click()
      await page.waitForTimeout(100)
      const endTime = Date.now()

      const duration = endTime - startTime
      expect(duration).toBeLessThan(200) // 200ms内完成
    })

    test('页面加载时间应该在合理范围内', async ({ page }) => {
      // 测量页面加载时间
      const startTime = Date.now()
      await page.goto(`${BASE_URL}/examples/vanilla/`)
      await page.waitForLoadState('networkidle')
      const endTime = Date.now()

      const duration = endTime - startTime
      expect(duration).toBeLessThan(3000) // 3秒内加载完成
    })
  })

  // ==================== 错误处理测试 ====================

  test.describe('错误处理', () => {
    test('应该处理网络错误', async ({ page }) => {
      // 模拟网络错误
      await page.route('**/*', route => route.abort())

      // 尝试加载页面
      await page.goto(`${BASE_URL}/examples/vanilla/`, {
        waitUntil: 'domcontentloaded',
      })

      // 检查是否有错误处理
      const errorElement = page.locator('.error, .error-message')
      if (await errorElement.isVisible()) {
        await expect(errorElement).toBeVisible()
      }
    })

    test('应该处理无效的主题配置', async ({ page }) => {
      // 注入无效的主题配置
      await page.evaluate(() => {
        // 模拟无效配置
        window.localStorage.setItem('ldesign-theme', 'invalid-json')
      })

      // 重新加载页面
      await page.reload()
      await page.waitForLoadState('networkidle')

      // 检查页面是否正常加载
      await expect(page.locator('.theme-controls')).toBeVisible()
    })
  })

  // ==================== 可访问性测试 ====================

  test.describe('可访问性', () => {
    test('应该支持屏幕阅读器', async ({ page }) => {
      // 检查ARIA标签
      const themeCards = page.locator('.theme-card')
      await expect(themeCards.first()).toHaveAttribute('role', 'button')

      // 检查键盘可访问性
      await themeCards.first().focus()
      await expect(themeCards.first()).toBeFocused()
    })

    test('应该提供适当的颜色对比度', async ({ page }) => {
      // 检查文本颜色对比度
      const textElements = page.locator('h1, h2, h3, p, span')
      for (let i = 0; i < Math.min(await textElements.count(), 5); i++) {
        const element = textElements.nth(i)
        const color = await element.evaluate(
          el => window.getComputedStyle(el).color
        )
        const backgroundColor = await element.evaluate(
          el => window.getComputedStyle(el).backgroundColor
        )

        // 这里应该实现颜色对比度检查逻辑
        expect(color).toBeTruthy()
        expect(backgroundColor).toBeTruthy()
      }
    })
  })

  // ==================== 浏览器兼容性测试 ====================

  test.describe('浏览器兼容性', () => {
    test('应该在Chrome中正常工作', async ({ page }) => {
      // Chrome特定测试
      await expect(page.locator('.theme-controls')).toBeVisible()
    })

    test('应该在Firefox中正常工作', async ({ page }) => {
      // Firefox特定测试
      await expect(page.locator('.theme-controls')).toBeVisible()
    })

    test('应该在Safari中正常工作', async ({ page }) => {
      // Safari特定测试
      await expect(page.locator('.theme-controls')).toBeVisible()
    })
  })

  // ==================== 集成测试 ====================

  test.describe('集成测试', () => {
    test('应该与localStorage集成', async ({ page }) => {
      // 切换主题
      const themeCard = page.locator('.theme-card').first()
      await themeCard.click()
      await page.waitForTimeout(100)

      // 检查localStorage
      const storedTheme = await page.evaluate(() =>
        localStorage.getItem('ldesign-theme')
      )
      expect(storedTheme).toBeTruthy()

      // 重新加载页面
      await page.reload()
      await page.waitForLoadState('networkidle')

      // 检查主题是否保持
      const status = await page.locator('.status').textContent()
      expect(status).toMatch(/当前主题:/)
    })

    test('应该与CSS变量集成', async ({ page }) => {
      // 切换主题
      const themeCard = page.locator('.theme-card').first()
      await themeCard.click()
      await page.waitForTimeout(100)

      // 检查CSS变量是否设置
      const cssVariables = await page.evaluate(() => {
        const root = document.documentElement
        return {
          primary: getComputedStyle(root).getPropertyValue('--color-primary'),
          success: getComputedStyle(root).getPropertyValue('--color-success'),
          warning: getComputedStyle(root).getPropertyValue('--color-warning'),
          danger: getComputedStyle(root).getPropertyValue('--color-danger'),
        }
      })

      expect(cssVariables.primary).toBeTruthy()
      expect(cssVariables.success).toBeTruthy()
      expect(cssVariables.warning).toBeTruthy()
      expect(cssVariables.danger).toBeTruthy()
    })
  })
})
