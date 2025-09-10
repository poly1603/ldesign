import { test, expect } from '@playwright/test'
import { Vue3QRCodePage } from './page-objects/vue3-qrcode-page'

test.describe('Vue3 QR码示例 - 样式定制', () => {
  let qrPage: Vue3QRCodePage

  test.beforeEach(async ({ page }) => {
    qrPage = new Vue3QRCodePage(page)
    await qrPage.goto()
    await qrPage.switchToTab('style')
  })

  test('样式定制页面加载', async ({ page }) => {
    // 验证样式定制标签页激活
    await expect(qrPage.styleTab).toHaveClass(/active/)
    
    // 验证样式控制元素
    await expect(qrPage.styleTextInput).toBeVisible()
    await expect(qrPage.styleSizeSlider).toBeVisible()
    await expect(qrPage.styleForegroundColor).toBeVisible()
    await expect(qrPage.styleBackgroundColor).toBeVisible()
  })

  test('默认样式二维码生成', async ({ page }) => {
    // 页面加载后应该自动生成默认样式的二维码
    await qrPage.waitForQRCode(qrPage.styleQRContainer, 15000)
    await qrPage.verifyQRCodeGenerated(qrPage.styleQRContainer)
  })

  test('文本输入实时更新', async ({ page }) => {
    const testText = 'https://www.ldesign.com/style-test'
    
    // 输入新文本
    await qrPage.styleTextInput.clear()
    await qrPage.styleTextInput.fill(testText)
    
    // 等待自动生成（由于watch监听器）
    await page.waitForTimeout(1000)
    await qrPage.waitForQRCode(qrPage.styleQRContainer)
    await qrPage.verifyQRCodeGenerated(qrPage.styleQRContainer)
  })

  test('尺寸调整实时更新', async ({ page }) => {
    // 调整尺寸
    await qrPage.styleSizeSlider.fill('300')
    
    // 等待自动生成
    await page.waitForTimeout(1000)
    await qrPage.waitForQRCode(qrPage.styleQRContainer)
    
    // 验证canvas尺寸
    const canvas = await qrPage.getQRCodeCanvas(qrPage.styleQRContainer)
    const canvasSize = await canvas.boundingBox()
    expect(canvasSize!.width).toBeCloseTo(300, 50)
  })

  test('前景色调整', async ({ page }) => {
    // 更改前景色
    await qrPage.styleForegroundColor.fill('#ff0000') // 红色
    
    // 等待自动生成
    await page.waitForTimeout(1000)
    await qrPage.waitForQRCode(qrPage.styleQRContainer)
    await qrPage.verifyQRCodeGenerated(qrPage.styleQRContainer)
  })

  test('背景色调整', async ({ page }) => {
    // 更改背景色
    await qrPage.styleBackgroundColor.fill('#ffff00') // 黄色
    
    // 等待自动生成
    await page.waitForTimeout(1000)
    await qrPage.waitForQRCode(qrPage.styleQRContainer)
    await qrPage.verifyQRCodeGenerated(qrPage.styleQRContainer)
  })

  test('颜色组合测试', async ({ page }) => {
    // 测试多种颜色组合
    const colorCombinations = [
      { fg: '#000000', bg: '#ffffff' }, // 黑白
      { fg: '#722ED1', bg: '#f1ecf9' }, // 品牌色
      { fg: '#ffffff', bg: '#000000' }, // 白黑
      { fg: '#ff0000', bg: '#00ff00' }  // 红绿
    ]
    
    for (const combo of colorCombinations) {
      await qrPage.styleForegroundColor.fill(combo.fg)
      await qrPage.styleBackgroundColor.fill(combo.bg)
      
      await page.waitForTimeout(1000)
      await qrPage.waitForQRCode(qrPage.styleQRContainer)
      await qrPage.verifyQRCodeGenerated(qrPage.styleQRContainer)
    }
  })

  test('预设样式功能', async ({ page }) => {
    // 查找预设样式按钮
    const presetButtons = page.locator('button').filter({ hasText: /经典|现代|渐变|优雅/ })
    
    if (await presetButtons.count() > 0) {
      // 测试每个预设样式
      const count = await presetButtons.count()
      
      for (let i = 0; i < count; i++) {
        await presetButtons.nth(i).click()
        
        // 等待样式应用和二维码生成
        await page.waitForTimeout(1000)
        await qrPage.waitForQRCode(qrPage.styleQRContainer)
        await qrPage.verifyQRCodeGenerated(qrPage.styleQRContainer)
      }
    }
  })

  test('渐变功能', async ({ page }) => {
    // 查找渐变相关控件
    const gradientToggle = page.locator('input[type="checkbox"]').filter({ hasText: /渐变|gradient/i })
    const gradientStartColor = page.locator('input[type="color"]').nth(2)
    const gradientEndColor = page.locator('input[type="color"]').nth(3)
    
    if (await gradientToggle.count() > 0) {
      // 启用渐变
      await gradientToggle.check()
      
      // 设置渐变颜色
      if (await gradientStartColor.count() > 0) {
        await gradientStartColor.fill('#ff0000')
      }
      if (await gradientEndColor.count() > 0) {
        await gradientEndColor.fill('#0000ff')
      }
      
      // 等待生成
      await page.waitForTimeout(1000)
      await qrPage.waitForQRCode(qrPage.styleQRContainer)
      await qrPage.verifyQRCodeGenerated(qrPage.styleQRContainer)
    }
  })

  test('边距调整', async ({ page }) => {
    // 查找边距控件
    const marginSlider = page.locator('input[type="range"]').filter({ hasText: /边距|margin/i })
    
    if (await marginSlider.count() > 0) {
      await marginSlider.first().fill('10')
      
      // 等待生成
      await page.waitForTimeout(1000)
      await qrPage.waitForQRCode(qrPage.styleQRContainer)
      await qrPage.verifyQRCodeGenerated(qrPage.styleQRContainer)
    }
  })

  test('样式对比功能', async ({ page }) => {
    // 查找样式对比区域
    const comparisonContainer = page.locator('.comparison-container, .preset-container')
    
    if (await comparisonContainer.count() > 0) {
      // 等待对比样式生成
      await page.waitForTimeout(2000)
      
      // 验证对比区域有内容
      const comparisonItems = comparisonContainer.locator('canvas, svg, .preset-item')
      const count = await comparisonItems.count()
      expect(count).toBeGreaterThan(0)
    }
  })

  test('颜色输入验证', async ({ page }) => {
    // 测试颜色输入框的文本输入
    const foregroundTextInput = page.locator('input[type="text"]').filter({ hasText: /前景|foreground/i })
    const backgroundTextInput = page.locator('input[type="text"]').filter({ hasText: /背景|background/i })
    
    if (await foregroundTextInput.count() > 0) {
      // 输入有效的十六进制颜色
      await foregroundTextInput.first().fill('#123456')
      await page.waitForTimeout(500)
      
      // 验证颜色选择器同步更新
      const colorValue = await qrPage.styleForegroundColor.inputValue()
      expect(colorValue.toLowerCase()).toBe('#123456')
    }
  })

  test('实时预览性能', async ({ page }) => {
    // 快速连续更改多个样式属性，测试性能
    const changes = [
      () => qrPage.styleSizeSlider.fill('200'),
      () => qrPage.styleForegroundColor.fill('#ff0000'),
      () => qrPage.styleBackgroundColor.fill('#00ff00'),
      () => qrPage.styleSizeSlider.fill('250'),
      () => qrPage.styleForegroundColor.fill('#0000ff')
    ]
    
    const startTime = Date.now()
    
    for (const change of changes) {
      await change()
      await page.waitForTimeout(200) // 短暂等待
    }
    
    // 等待最终生成完成
    await page.waitForTimeout(1000)
    await qrPage.waitForQRCode(qrPage.styleQRContainer)
    
    const endTime = Date.now()
    const totalTime = endTime - startTime
    
    // 验证响应时间合理（不超过10秒）
    expect(totalTime).toBeLessThan(10000)
  })

  test('无控制台错误 - 样式定制', async ({ page }) => {
    const errors: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    page.on('pageerror', error => {
      errors.push(error.message)
    })
    
    // 执行样式定制操作
    await qrPage.styleTextInput.fill('测试样式定制')
    await qrPage.styleSizeSlider.fill('280')
    await qrPage.styleForegroundColor.fill('#722ED1')
    await qrPage.styleBackgroundColor.fill('#f1ecf9')
    
    // 等待生成完成
    await page.waitForTimeout(2000)
    await qrPage.waitForQRCode(qrPage.styleQRContainer)
    
    // 验证没有控制台错误
    expect(errors).toHaveLength(0)
  })
})
