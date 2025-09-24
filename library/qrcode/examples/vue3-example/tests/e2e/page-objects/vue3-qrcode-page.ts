import { Page, Locator, expect } from '@playwright/test'

/**
 * Vue3 QR码示例页面对象模型
 */
export class Vue3QRCodePage {
  readonly page: Page
  
  // 导航标签
  readonly basicTab: Locator
  readonly advancedTab: Locator
  readonly styleTab: Locator
  readonly datatypeTab: Locator
  readonly performanceTab: Locator
  
  // 基础示例元素
  readonly basicTextInput: Locator
  readonly basicSizeSlider: Locator
  readonly basicFormatSelect: Locator
  readonly basicGenerateButton: Locator
  readonly basicQRContainer: Locator
  
  // 高级功能元素
  readonly logoTextInput: Locator
  readonly logoFileInput: Locator
  readonly logoSizeSlider: Locator
  readonly logoShapeSelect: Locator
  readonly logoGenerateButton: Locator
  readonly logoQRContainer: Locator
  readonly batchTextarea: Locator
  readonly batchGenerateButton: Locator
  readonly batchContainer: Locator
  
  // 样式定制元素
  readonly styleTextInput: Locator
  readonly styleSizeSlider: Locator
  readonly styleForegroundColor: Locator
  readonly styleBackgroundColor: Locator
  readonly styleQRContainer: Locator
  
  // 数据类型元素
  readonly datatypeCards: Locator
  readonly datatypeContent: Locator
  readonly datatypeGenerateButton: Locator
  readonly datatypeQRContainer: Locator
  
  // 性能测试元素
  readonly performanceTestCount: Locator
  readonly performanceRunButton: Locator
  readonly performanceResults: Locator

  constructor(page: Page) {
    this.page = page
    
    // 导航标签
    this.basicTab = page.locator('button.nav-tab').filter({ hasText: '基础示例' })
    this.advancedTab = page.locator('button.nav-tab').filter({ hasText: '高级功能' })
    this.styleTab = page.locator('button.nav-tab').filter({ hasText: '样式定制' })
    this.datatypeTab = page.locator('button.nav-tab').filter({ hasText: '数据类型' })
    this.performanceTab = page.locator('button.nav-tab').filter({ hasText: '性能测试' })
    
    // 基础示例元素
    this.basicTextInput = page.locator('#basic-text')
    this.basicSizeSlider = page.locator('#basic-size')
    this.basicFormatSelect = page.locator('#basic-format')
    this.basicGenerateButton = page.locator('button').filter({ hasText: '生成二维码' }).first()
    this.basicQRContainer = page.locator('.qr-container').first()
    
    // 高级功能元素
    this.logoTextInput = page.locator('input[placeholder*="输入二维码内容"]').first()
    this.logoFileInput = page.locator('input[type="file"]')
    this.logoSizeSlider = page.locator('input[type="range"]').nth(1)
    this.logoShapeSelect = page.locator('select').first()
    this.logoGenerateButton = page.locator('button').filter({ hasText: '生成带Logo的二维码' })
    this.logoQRContainer = page.locator('.qr-container').nth(1)
    this.batchTextarea = page.locator('textarea')
    this.batchGenerateButton = page.locator('button').filter({ hasText: '批量生成' })
    this.batchContainer = page.locator('.batch-container')
    
    // 样式定制元素
    this.styleTextInput = page.locator('input[placeholder*="输入二维码内容"]').nth(1)
    this.styleSizeSlider = page.locator('input[type="range"]').nth(2)
    this.styleForegroundColor = page.locator('input[type="color"]').first()
    this.styleBackgroundColor = page.locator('input[type="color"]').nth(1)
    this.styleQRContainer = page.locator('.qr-container').nth(2)
    
    // 数据类型元素
    this.datatypeCards = page.locator('.type-card, .datatype-btn')
    this.datatypeContent = page.locator('textarea, .form-textarea')
    this.datatypeGenerateButton = page.locator('button').filter({ hasText: '生成二维码' }).nth(1)
    this.datatypeQRContainer = page.locator('.qr-container').nth(3)
    
    // 性能测试元素
    this.performanceTestCount = page.locator('input[type="number"]')
    this.performanceRunButton = page.locator('button').filter({ hasText: '开始测试' })
    this.performanceResults = page.locator('.test-results')
  }

  /**
   * 导航到页面
   */
  async goto() {
    await this.page.goto('/')
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * 切换到指定标签页
   */
  async switchToTab(tab: 'basic' | 'advanced' | 'style' | 'datatype' | 'performance') {
    const tabMap = {
      basic: this.basicTab,
      advanced: this.advancedTab,
      style: this.styleTab,
      datatype: this.datatypeTab,
      performance: this.performanceTab
    }
    
    await tabMap[tab].click()
    await this.page.waitForTimeout(500) // 等待标签页切换动画
  }

  /**
   * 等待二维码生成
   */
  async waitForQRCode(container: Locator, timeout = 10000) {
    await expect(container.locator('canvas, svg, img')).toBeVisible({ timeout })
  }

  /**
   * 检查控制台错误
   */
  async checkConsoleErrors() {
    const errors: string[] = []
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    this.page.on('pageerror', error => {
      errors.push(error.message)
    })
    
    return errors
  }

  /**
   * 上传测试图片文件
   */
  async uploadTestImage() {
    // 创建一个简单的测试图片数据URL
    const testImageDataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    
    // 将数据URL转换为文件
    const response = await fetch(testImageDataURL)
    const buffer = await response.arrayBuffer()
    
    await this.logoFileInput.setInputFiles({
      name: 'test-logo.png',
      mimeType: 'image/png',
      buffer: Buffer.from(buffer)
    })
  }

  /**
   * 获取二维码canvas元素
   */
  async getQRCodeCanvas(container: Locator) {
    return container.locator('canvas').first()
  }

  /**
   * 验证二维码是否已生成
   */
  async verifyQRCodeGenerated(container: Locator) {
    const canvas = await this.getQRCodeCanvas(container)
    await expect(canvas).toBeVisible()
    
    // 验证canvas有内容（不是空白）
    const canvasSize = await canvas.boundingBox()
    expect(canvasSize).toBeTruthy()
    expect(canvasSize!.width).toBeGreaterThan(0)
    expect(canvasSize!.height).toBeGreaterThan(0)
  }
}
