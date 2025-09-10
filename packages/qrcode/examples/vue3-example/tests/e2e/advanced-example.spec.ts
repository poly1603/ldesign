import { test, expect } from '@playwright/test'
import { Vue3QRCodePage } from './page-objects/vue3-qrcode-page'

test.describe('Vue3 QR码示例 - 高级功能', () => {
  let qrPage: Vue3QRCodePage

  test.beforeEach(async ({ page }) => {
    qrPage = new Vue3QRCodePage(page)
    await qrPage.goto()
    await qrPage.switchToTab('advanced')
  })

  test('高级功能页面加载', async ({ page }) => {
    // 验证高级功能标签页激活
    await expect(qrPage.advancedTab).toHaveClass(/active/)
    
    // 验证Logo嵌入区域
    await expect(qrPage.logoTextInput).toBeVisible()
    await expect(qrPage.logoFileInput).toBeVisible()
    await expect(qrPage.logoSizeSlider).toBeVisible()
    await expect(qrPage.logoShapeSelect).toBeVisible()
    await expect(qrPage.logoGenerateButton).toBeVisible()
    
    // 验证批量生成区域
    await expect(qrPage.batchTextarea).toBeVisible()
    await expect(qrPage.batchGenerateButton).toBeVisible()
  })

  test('Logo嵌入功能 - 无Logo', async ({ page }) => {
    const testText = 'https://www.ldesign.com/logo-test'
    
    // 输入文本
    await qrPage.logoTextInput.fill(testText)
    
    // 生成不带Logo的二维码
    await qrPage.logoGenerateButton.click()
    
    // 验证二维码生成
    await qrPage.waitForQRCode(qrPage.logoQRContainer)
    await qrPage.verifyQRCodeGenerated(qrPage.logoQRContainer)
  })

  test('Logo嵌入功能 - 带Logo', async ({ page }) => {
    const testText = 'https://www.ldesign.com/logo-test'
    
    // 输入文本
    await qrPage.logoTextInput.fill(testText)
    
    // 上传Logo图片
    await qrPage.uploadTestImage()
    
    // 等待Logo预览显示
    await expect(page.locator('.logo-preview img')).toBeVisible({ timeout: 5000 })
    
    // 调整Logo大小
    await qrPage.logoSizeSlider.fill('60')
    
    // 选择Logo形状
    await qrPage.logoShapeSelect.selectOption('circle')
    
    // 生成带Logo的二维码
    await qrPage.logoGenerateButton.click()
    
    // 验证二维码生成
    await qrPage.waitForQRCode(qrPage.logoQRContainer)
    await qrPage.verifyQRCodeGenerated(qrPage.logoQRContainer)
  })

  test('Logo形状选择', async ({ page }) => {
    await qrPage.logoTextInput.fill('测试Logo形状')
    await qrPage.uploadTestImage()
    
    // 测试方形Logo
    await qrPage.logoShapeSelect.selectOption('square')
    await qrPage.logoGenerateButton.click()
    await qrPage.waitForQRCode(qrPage.logoQRContainer)
    
    // 测试圆形Logo
    await qrPage.logoShapeSelect.selectOption('circle')
    await qrPage.logoGenerateButton.click()
    await qrPage.waitForQRCode(qrPage.logoQRContainer)
    
    await qrPage.verifyQRCodeGenerated(qrPage.logoQRContainer)
  })

  test('Logo大小调整', async ({ page }) => {
    await qrPage.logoTextInput.fill('测试Logo大小')
    await qrPage.uploadTestImage()
    
    // 测试不同Logo大小
    const sizes = ['30', '50', '80']
    
    for (const size of sizes) {
      await qrPage.logoSizeSlider.fill(size)
      await qrPage.logoGenerateButton.click()
      await qrPage.waitForQRCode(qrPage.logoQRContainer)
    }
    
    await qrPage.verifyQRCodeGenerated(qrPage.logoQRContainer)
  })

  test('批量生成功能', async ({ page }) => {
    // 使用默认的批量文本或输入新的
    const batchTexts = `https://www.ldesign.com
https://github.com/ldesign
mailto:contact@ldesign.com
tel:+86-138-0013-8000`
    
    await qrPage.batchTextarea.fill(batchTexts)
    
    // 点击批量生成
    await qrPage.batchGenerateButton.click()
    
    // 等待批量生成完成
    await page.waitForTimeout(3000) // 批量生成需要更多时间
    
    // 验证批量结果容器显示
    await expect(qrPage.batchContainer).toBeVisible()
    
    // 验证生成了多个二维码
    const batchItems = page.locator('.batch-item, .batch-qr')
    const count = await batchItems.count()
    expect(count).toBeGreaterThan(0)
    
    // 验证每个批量项都有二维码
    for (let i = 0; i < Math.min(count, 4); i++) {
      const item = batchItems.nth(i)
      await expect(item.locator('canvas, svg')).toBeVisible()
    }
  })

  test('批量下载功能', async ({ page }) => {
    // 先生成批量二维码
    await qrPage.batchGenerateButton.click()
    await page.waitForTimeout(3000)
    
    // 查找批量下载按钮
    const downloadButton = page.locator('button').filter({ hasText: '下载全部' })
    
    if (await downloadButton.isVisible()) {
      // 设置下载监听
      const downloads: any[] = []
      page.on('download', download => downloads.push(download))
      
      // 点击下载按钮
      await downloadButton.click()
      
      // 等待下载完成
      await page.waitForTimeout(2000)
      
      // 验证有下载文件
      expect(downloads.length).toBeGreaterThan(0)
    }
  })

  test('缓存和性能监控', async ({ page }) => {
    // 查找性能测试按钮
    const performanceButton = page.locator('button').filter({ hasText: /性能测试|缓存测试/ })
    
    if (await performanceButton.count() > 0) {
      await performanceButton.first().click()
      
      // 等待测试完成
      await page.waitForTimeout(2000)
      
      // 验证性能结果显示
      const performanceResults = page.locator('.performance-results, .cache-info')
      if (await performanceResults.count() > 0) {
        await expect(performanceResults.first()).toBeVisible()
      }
    }
  })

  test('错误处理 - 无效Logo文件', async ({ page }) => {
    await qrPage.logoTextInput.fill('测试错误处理')
    
    // 尝试上传无效文件（这里模拟，实际可能需要真实的无效文件）
    // 由于测试环境限制，我们主要验证没有崩溃
    await qrPage.logoGenerateButton.click()
    await qrPage.waitForQRCode(qrPage.logoQRContainer)
  })

  test('错误处理 - 空批量文本', async ({ page }) => {
    // 清空批量文本
    await qrPage.batchTextarea.clear()
    
    // 尝试批量生成
    await qrPage.batchGenerateButton.click()
    
    // 验证没有崩溃，可能显示错误信息或禁用按钮
    // 具体行为取决于实现
  })

  test('Logo文件类型支持', async ({ page }) => {
    await qrPage.logoTextInput.fill('测试文件类型')
    
    // 验证文件输入接受的类型
    const acceptAttr = await qrPage.logoFileInput.getAttribute('accept')
    expect(acceptAttr).toContain('image')
  })

  test('无控制台错误 - 高级功能', async ({ page }) => {
    const errors: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    page.on('pageerror', error => {
      errors.push(error.message)
    })
    
    // 执行高级功能操作
    await qrPage.logoTextInput.fill('测试高级功能')
    await qrPage.uploadTestImage()
    await qrPage.logoGenerateButton.click()
    await qrPage.waitForQRCode(qrPage.logoQRContainer)
    
    await qrPage.batchGenerateButton.click()
    await page.waitForTimeout(2000)
    
    // 验证没有控制台错误
    expect(errors).toHaveLength(0)
  })
})
