import { test, expect } from '@playwright/test'
import { Vue3QRCodePage } from './page-objects/vue3-qrcode-page'

test.describe('Vue3 QR码示例 - 基础示例', () => {
  let qrPage: Vue3QRCodePage

  test.beforeEach(async ({ page }) => {
    qrPage = new Vue3QRCodePage(page)
    await qrPage.goto()
    await qrPage.switchToTab('basic')
  })

  test('页面加载和基本元素显示', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle(/Vue 3 示例/)
    
    // 验证基础示例标签页激活
    await expect(qrPage.basicTab).toHaveClass(/active/)
    
    // 验证基本表单元素存在
    await expect(qrPage.basicTextInput).toBeVisible()
    await expect(qrPage.basicSizeSlider).toBeVisible()
    await expect(qrPage.basicFormatSelect).toBeVisible()
    await expect(qrPage.basicGenerateButton).toBeVisible()
  })

  test('默认二维码生成', async ({ page }) => {
    // 页面加载后应该自动生成默认二维码
    await qrPage.waitForQRCode(qrPage.basicQRContainer)
    await qrPage.verifyQRCodeGenerated(qrPage.basicQRContainer)
  })

  test('文本输入和二维码生成', async ({ page }) => {
    const testText = 'https://www.ldesign.com/test'
    
    // 清空并输入新文本
    await qrPage.basicTextInput.clear()
    await qrPage.basicTextInput.fill(testText)
    
    // 点击生成按钮
    await qrPage.basicGenerateButton.click()
    
    // 验证二维码生成
    await qrPage.waitForQRCode(qrPage.basicQRContainer)
    await qrPage.verifyQRCodeGenerated(qrPage.basicQRContainer)
  })

  test('尺寸调整功能', async ({ page }) => {
    // 调整二维码尺寸
    await qrPage.basicSizeSlider.fill('300')
    
    // 点击生成按钮
    await qrPage.basicGenerateButton.click()
    
    // 验证二维码生成
    await qrPage.waitForQRCode(qrPage.basicQRContainer)
    
    // 验证canvas尺寸
    const canvas = await qrPage.getQRCodeCanvas(qrPage.basicQRContainer)
    const canvasSize = await canvas.boundingBox()
    expect(canvasSize!.width).toBeCloseTo(300, 50) // 允许一定误差
  })

  test('格式选择功能', async ({ page }) => {
    // 测试canvas格式
    await qrPage.basicFormatSelect.selectOption('canvas')
    await qrPage.basicGenerateButton.click()
    await qrPage.waitForQRCode(qrPage.basicQRContainer)
    
    let element = qrPage.basicQRContainer.locator('canvas')
    await expect(element).toBeVisible()
    
    // 测试SVG格式
    await qrPage.basicFormatSelect.selectOption('svg')
    await qrPage.basicGenerateButton.click()
    await qrPage.waitForQRCode(qrPage.basicQRContainer)
    
    element = qrPage.basicQRContainer.locator('svg')
    await expect(element).toBeVisible()
  })

  test('快速示例功能', async ({ page }) => {
    // 查找快速示例按钮
    const quickExampleButtons = page.locator('button').filter({ hasText: /网站URL|联系方式|邮件地址|地理位置/ })
    
    if (await quickExampleButtons.count() > 0) {
      // 点击第一个快速示例
      await quickExampleButtons.first().click()
      
      // 验证文本输入框内容已更新
      const inputValue = await qrPage.basicTextInput.inputValue()
      expect(inputValue).toBeTruthy()
      expect(inputValue.length).toBeGreaterThan(0)
      
      // 验证二维码已生成
      await qrPage.waitForQRCode(qrPage.basicQRContainer)
      await qrPage.verifyQRCodeGenerated(qrPage.basicQRContainer)
    }
  })

  test('错误处理 - 空文本', async ({ page }) => {
    // 清空文本输入
    await qrPage.basicTextInput.clear()
    
    // 验证生成按钮被禁用
    await expect(qrPage.basicGenerateButton).toBeDisabled()
  })

  test('下载功能', async ({ page }) => {
    // 确保有二维码生成
    await qrPage.basicGenerateButton.click()
    await qrPage.waitForQRCode(qrPage.basicQRContainer)
    
    // 查找下载按钮
    const downloadButton = page.locator('button').filter({ hasText: '下载二维码' })
    
    if (await downloadButton.isVisible()) {
      // 设置下载监听
      const downloadPromise = page.waitForEvent('download')
      
      // 点击下载按钮
      await downloadButton.click()
      
      // 验证下载开始
      const download = await downloadPromise
      expect(download.suggestedFilename()).toMatch(/qrcode.*\.(png|svg)$/)
    }
  })

  test('响应式设计', async ({ page }) => {
    // 测试移动端视口
    await page.setViewportSize({ width: 375, height: 667 })
    
    // 验证元素仍然可见和可用
    await expect(qrPage.basicTextInput).toBeVisible()
    await expect(qrPage.basicGenerateButton).toBeVisible()
    
    // 验证二维码容器适应小屏幕
    const container = await qrPage.basicQRContainer.boundingBox()
    expect(container!.width).toBeLessThanOrEqual(375)
  })

  test('无控制台错误', async ({ page }) => {
    const errors: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    page.on('pageerror', error => {
      errors.push(error.message)
    })
    
    // 执行基本操作
    await qrPage.basicTextInput.fill('测试文本')
    await qrPage.basicGenerateButton.click()
    await qrPage.waitForQRCode(qrPage.basicQRContainer)
    
    // 验证没有控制台错误
    expect(errors).toHaveLength(0)
  })
})
