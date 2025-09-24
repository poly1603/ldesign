import { test, expect } from '@playwright/test'
import { Vue3QRCodePage } from './page-objects/vue3-qrcode-page'

test.describe('Vue3 QR码示例 - 综合集成测试', () => {
  let qrPage: Vue3QRCodePage

  test.beforeEach(async ({ page }) => {
    qrPage = new Vue3QRCodePage(page)
    await qrPage.goto()
  })

  test('完整用户流程测试', async ({ page }) => {
    // 1. 基础示例
    await qrPage.switchToTab('basic')
    await qrPage.basicTextInput.fill('https://www.ldesign.com/integration-test')
    await qrPage.basicGenerateButton.click()
    await qrPage.waitForQRCode(qrPage.basicQRContainer)
    
    // 2. 高级功能
    await qrPage.switchToTab('advanced')
    await qrPage.logoTextInput.fill('https://www.ldesign.com/logo-test')
    await qrPage.uploadTestImage()
    await qrPage.logoGenerateButton.click()
    await qrPage.waitForQRCode(qrPage.logoQRContainer)
    
    // 3. 样式定制
    await qrPage.switchToTab('style')
    await qrPage.styleTextInput.fill('样式测试')
    await qrPage.styleForegroundColor.fill('#722ED1')
    await page.waitForTimeout(1000)
    await qrPage.waitForQRCode(qrPage.styleQRContainer)
    
    // 4. 数据类型
    await qrPage.switchToTab('datatype')
    if (await qrPage.datatypeCards.count() > 0) {
      await qrPage.datatypeCards.first().click()
      await qrPage.datatypeContent.fill('数据类型测试')
      await page.waitForTimeout(1000)
      await qrPage.waitForQRCode(qrPage.datatypeQRContainer)
    }
    
    // 5. 性能测试
    await qrPage.switchToTab('performance')
    const runButton = page.locator('button').filter({ hasText: /开始|运行|测试/ })
    if (await runButton.count() > 0) {
      await runButton.first().click()
      await page.waitForTimeout(3000) // 简短的性能测试
    }
  })

  test('标签页切换稳定性', async ({ page }) => {
    const tabs = ['basic', 'advanced', 'style', 'datatype', 'performance'] as const
    
    // 快速切换所有标签页多次
    for (let round = 0; round < 3; round++) {
      for (const tab of tabs) {
        await qrPage.switchToTab(tab)
        await page.waitForTimeout(200)
        
        // 验证标签页正确激活
        const tabMap = {
          basic: qrPage.basicTab,
          advanced: qrPage.advancedTab,
          style: qrPage.styleTab,
          datatype: qrPage.datatypeTab,
          performance: qrPage.performanceTab
        }
        
        await expect(tabMap[tab]).toHaveClass(/active/)
      }
    }
  })

  test('多个二维码同时生成', async ({ page }) => {
    // 在不同标签页生成二维码，测试并发处理
    
    // 基础示例
    await qrPage.switchToTab('basic')
    await qrPage.basicTextInput.fill('并发测试1')
    await qrPage.basicGenerateButton.click()
    
    // 快速切换到样式定制
    await qrPage.switchToTab('style')
    await qrPage.styleTextInput.fill('并发测试2')
    await page.waitForTimeout(500)
    
    // 快速切换到数据类型
    await qrPage.switchToTab('datatype')
    if (await qrPage.datatypeCards.count() > 0) {
      await qrPage.datatypeCards.first().click()
      await qrPage.datatypeContent.fill('并发测试3')
    }
    
    // 等待所有生成完成
    await page.waitForTimeout(3000)
    
    // 验证所有二维码都正确生成
    await qrPage.switchToTab('basic')
    await qrPage.verifyQRCodeGenerated(qrPage.basicQRContainer)
    
    await qrPage.switchToTab('style')
    await qrPage.verifyQRCodeGenerated(qrPage.styleQRContainer)
    
    await qrPage.switchToTab('datatype')
    if (await qrPage.datatypeCards.count() > 0) {
      await qrPage.verifyQRCodeGenerated(qrPage.datatypeQRContainer)
    }
  })

  test('错误恢复能力', async ({ page }) => {
    // 测试各种错误情况下的恢复能力
    
    // 1. 空输入错误
    await qrPage.switchToTab('basic')
    await qrPage.basicTextInput.clear()
    // 应该禁用生成按钮或显示错误
    
    // 2. 恢复正常输入
    await qrPage.basicTextInput.fill('恢复测试')
    await qrPage.basicGenerateButton.click()
    await qrPage.waitForQRCode(qrPage.basicQRContainer)
    
    // 3. 样式定制中的无效颜色（如果有验证）
    await qrPage.switchToTab('style')
    await qrPage.styleTextInput.fill('颜色测试')
    await page.waitForTimeout(1000)
    await qrPage.verifyQRCodeGenerated(qrPage.styleQRContainer)
  })

  test('响应式布局测试', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080 }, // 桌面
      { width: 1024, height: 768 },  // 平板
      { width: 375, height: 667 }    // 手机
    ]
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      
      // 测试每个标签页在不同视口下的显示
      const tabs = ['basic', 'advanced', 'style', 'datatype'] as const
      
      for (const tab of tabs) {
        await qrPage.switchToTab(tab)
        
        // 验证主要元素可见
        const tabMap = {
          basic: qrPage.basicTab,
          advanced: qrPage.advancedTab,
          style: qrPage.styleTab,
          datatype: qrPage.datatypeTab
        }
        
        await expect(tabMap[tab]).toBeVisible()
        
        // 验证内容区域适应视口
        const content = page.locator('.tab-content, .example-content').first()
        if (await content.count() > 0) {
          const contentBox = await content.boundingBox()
          expect(contentBox!.width).toBeLessThanOrEqual(viewport.width)
        }
      }
    }
  })

  test('性能基准测试', async ({ page }) => {
    const startTime = Date.now()
    
    // 执行一系列操作并测量总时间
    await qrPage.switchToTab('basic')
    await qrPage.basicTextInput.fill('性能基准测试')
    await qrPage.basicGenerateButton.click()
    await qrPage.waitForQRCode(qrPage.basicQRContainer)
    
    await qrPage.switchToTab('style')
    await qrPage.styleTextInput.fill('性能基准测试')
    await qrPage.styleForegroundColor.fill('#ff0000')
    await page.waitForTimeout(1000)
    await qrPage.waitForQRCode(qrPage.styleQRContainer)
    
    await qrPage.switchToTab('datatype')
    if (await qrPage.datatypeCards.count() > 0) {
      await qrPage.datatypeCards.first().click()
      await qrPage.datatypeContent.fill('性能基准测试')
      await page.waitForTimeout(1000)
      await qrPage.waitForQRCode(qrPage.datatypeQRContainer)
    }
    
    const endTime = Date.now()
    const totalTime = endTime - startTime
    
    // 验证总时间在合理范围内（不超过30秒）
    expect(totalTime).toBeLessThan(30000)
    
    console.log(`完整流程耗时: ${totalTime}ms`)
  })

  test('内存泄漏检测', async ({ page }) => {
    // 重复执行操作，检测是否有明显的性能下降
    const iterations = 5
    const times: number[] = []
    
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now()
      
      // 执行标准操作序列
      await qrPage.switchToTab('basic')
      await qrPage.basicTextInput.fill(`内存测试 ${i}`)
      await qrPage.basicGenerateButton.click()
      await qrPage.waitForQRCode(qrPage.basicQRContainer)
      
      await qrPage.switchToTab('style')
      await qrPage.styleTextInput.fill(`内存测试 ${i}`)
      await page.waitForTimeout(1000)
      await qrPage.waitForQRCode(qrPage.styleQRContainer)
      
      const endTime = Date.now()
      times.push(endTime - startTime)
    }
    
    // 验证性能没有显著下降
    const firstTime = times[0]
    const lastTime = times[times.length - 1]
    
    // 最后一次执行时间不应该比第一次慢太多（允许50%的差异）
    expect(lastTime).toBeLessThan(firstTime * 1.5)
  })

  test('浏览器兼容性基础检查', async ({ page }) => {
    // 检查基本的Web API支持
    const canvasSupport = await page.evaluate(() => {
      const canvas = document.createElement('canvas')
      return !!(canvas.getContext && canvas.getContext('2d'))
    })
    
    const fileApiSupport = await page.evaluate(() => {
      return !!(window.File && window.FileReader && window.FileList && window.Blob)
    })
    
    expect(canvasSupport).toBeTruthy()
    expect(fileApiSupport).toBeTruthy()
    
    // 测试基本功能在当前浏览器中工作
    await qrPage.switchToTab('basic')
    await qrPage.basicTextInput.fill('兼容性测试')
    await qrPage.basicGenerateButton.click()
    await qrPage.waitForQRCode(qrPage.basicQRContainer)
    await qrPage.verifyQRCodeGenerated(qrPage.basicQRContainer)
  })

  test('全局错误处理', async ({ page }) => {
    const errors: string[] = []
    const warnings: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text())
      }
    })
    
    page.on('pageerror', error => {
      errors.push(error.message)
    })
    
    // 执行完整的用户流程
    await qrPage.switchToTab('basic')
    await qrPage.basicTextInput.fill('错误检测测试')
    await qrPage.basicGenerateButton.click()
    await qrPage.waitForQRCode(qrPage.basicQRContainer)
    
    await qrPage.switchToTab('advanced')
    await qrPage.logoTextInput.fill('错误检测测试')
    await qrPage.uploadTestImage()
    await qrPage.logoGenerateButton.click()
    await qrPage.waitForQRCode(qrPage.logoQRContainer)
    
    await qrPage.switchToTab('style')
    await qrPage.styleTextInput.fill('错误检测测试')
    await qrPage.styleForegroundColor.fill('#722ED1')
    await page.waitForTimeout(1000)
    await qrPage.waitForQRCode(qrPage.styleQRContainer)
    
    // 验证没有JavaScript错误
    expect(errors).toHaveLength(0)
    
    // 警告可以存在，但不应该太多
    expect(warnings.length).toBeLessThan(10)
  })
})
