import { test, expect } from '@playwright/test'
import { Vue3QRCodePage } from './page-objects/vue3-qrcode-page'

test.describe('Vue3 QR码示例 - 数据类型', () => {
  let qrPage: Vue3QRCodePage

  test.beforeEach(async ({ page }) => {
    qrPage = new Vue3QRCodePage(page)
    await qrPage.goto()
    await qrPage.switchToTab('datatype')
  })

  test('数据类型页面加载', async ({ page }) => {
    // 验证数据类型标签页激活
    await expect(qrPage.datatypeTab).toHaveClass(/active/)
    
    // 验证数据类型选择卡片
    await expect(qrPage.datatypeCards.first()).toBeVisible()
    
    // 验证至少有几种数据类型
    const cardCount = await qrPage.datatypeCards.count()
    expect(cardCount).toBeGreaterThanOrEqual(4) // URL, WiFi, 联系人, 邮件等
  })

  test('URL类型二维码生成', async ({ page }) => {
    // 查找并点击URL类型卡片
    const urlCard = qrPage.datatypeCards.filter({ hasText: /URL|网址|链接/ })
    
    if (await urlCard.count() > 0) {
      await urlCard.first().click()
      
      // 等待表单显示
      await expect(qrPage.datatypeContent).toBeVisible()
      
      // 输入URL
      await qrPage.datatypeContent.fill('https://www.ldesign.com/test')
      
      // 等待自动生成或点击生成按钮
      await page.waitForTimeout(1000)
      
      if (await qrPage.datatypeGenerateButton.isVisible()) {
        await qrPage.datatypeGenerateButton.click()
      }
      
      // 验证二维码生成
      await qrPage.waitForQRCode(qrPage.datatypeQRContainer)
      await qrPage.verifyQRCodeGenerated(qrPage.datatypeQRContainer)
    }
  })

  test('WiFi类型二维码生成', async ({ page }) => {
    // 查找并点击WiFi类型卡片
    const wifiCard = qrPage.datatypeCards.filter({ hasText: /WiFi|无线|网络/ })
    
    if (await wifiCard.count() > 0) {
      await wifiCard.first().click()
      
      // 等待表单显示
      await expect(qrPage.datatypeContent).toBeVisible()
      
      // 输入WiFi信息
      const wifiData = 'WIFI:T:WPA;S:TestNetwork;P:password123;H:false;'
      await qrPage.datatypeContent.fill(wifiData)
      
      // 等待自动生成
      await page.waitForTimeout(1000)
      
      // 验证二维码生成
      await qrPage.waitForQRCode(qrPage.datatypeQRContainer)
      await qrPage.verifyQRCodeGenerated(qrPage.datatypeQRContainer)
    }
  })

  test('联系人类型二维码生成', async ({ page }) => {
    // 查找并点击联系人类型卡片
    const contactCard = qrPage.datatypeCards.filter({ hasText: /联系人|名片|contact/ })
    
    if (await contactCard.count() > 0) {
      await contactCard.first().click()
      
      // 等待表单显示
      await expect(qrPage.datatypeContent).toBeVisible()
      
      // 输入联系人信息
      const contactData = `BEGIN:VCARD
VERSION:3.0
FN:测试联系人
ORG:LDesign
TEL:+86-138-0013-8000
EMAIL:test@ldesign.com
URL:https://www.ldesign.com
END:VCARD`
      
      await qrPage.datatypeContent.fill(contactData)
      
      // 等待自动生成
      await page.waitForTimeout(1000)
      
      // 验证二维码生成
      await qrPage.waitForQRCode(qrPage.datatypeQRContainer)
      await qrPage.verifyQRCodeGenerated(qrPage.datatypeQRContainer)
    }
  })

  test('邮件类型二维码生成', async ({ page }) => {
    // 查找并点击邮件类型卡片
    const emailCard = qrPage.datatypeCards.filter({ hasText: /邮件|email|mail/ })
    
    if (await emailCard.count() > 0) {
      await emailCard.first().click()
      
      // 等待表单显示
      await expect(qrPage.datatypeContent).toBeVisible()
      
      // 输入邮件信息
      const emailData = 'mailto:test@ldesign.com?subject=测试邮件&body=这是一封测试邮件'
      await qrPage.datatypeContent.fill(emailData)
      
      // 等待自动生成
      await page.waitForTimeout(1000)
      
      // 验证二维码生成
      await qrPage.waitForQRCode(qrPage.datatypeQRContainer)
      await qrPage.verifyQRCodeGenerated(qrPage.datatypeQRContainer)
    }
  })

  test('短信类型二维码生成', async ({ page }) => {
    // 查找并点击短信类型卡片
    const smsCard = qrPage.datatypeCards.filter({ hasText: /短信|SMS|消息/ })
    
    if (await smsCard.count() > 0) {
      await smsCard.first().click()
      
      // 等待表单显示
      await expect(qrPage.datatypeContent).toBeVisible()
      
      // 输入短信信息
      const smsData = 'sms:+86-138-0013-8000?body=这是一条测试短信'
      await qrPage.datatypeContent.fill(smsData)
      
      // 等待自动生成
      await page.waitForTimeout(1000)
      
      // 验证二维码生成
      await qrPage.waitForQRCode(qrPage.datatypeQRContainer)
      await qrPage.verifyQRCodeGenerated(qrPage.datatypeQRContainer)
    }
  })

  test('电话类型二维码生成', async ({ page }) => {
    // 查找并点击电话类型卡片
    const phoneCard = qrPage.datatypeCards.filter({ hasText: /电话|phone|tel/ })
    
    if (await phoneCard.count() > 0) {
      await phoneCard.first().click()
      
      // 等待表单显示
      await expect(qrPage.datatypeContent).toBeVisible()
      
      // 输入电话信息
      const phoneData = 'tel:+86-138-0013-8000'
      await qrPage.datatypeContent.fill(phoneData)
      
      // 等待自动生成
      await page.waitForTimeout(1000)
      
      // 验证二维码生成
      await qrPage.waitForQRCode(qrPage.datatypeQRContainer)
      await qrPage.verifyQRCodeGenerated(qrPage.datatypeQRContainer)
    }
  })

  test('地理位置类型二维码生成', async ({ page }) => {
    // 查找并点击地理位置类型卡片
    const locationCard = qrPage.datatypeCards.filter({ hasText: /地理|位置|location|geo/ })
    
    if (await locationCard.count() > 0) {
      await locationCard.first().click()
      
      // 等待表单显示
      await expect(qrPage.datatypeContent).toBeVisible()
      
      // 输入地理位置信息
      const locationData = 'geo:39.9042,116.4074?q=北京天安门'
      await qrPage.datatypeContent.fill(locationData)
      
      // 等待自动生成
      await page.waitForTimeout(1000)
      
      // 验证二维码生成
      await qrPage.waitForQRCode(qrPage.datatypeQRContainer)
      await qrPage.verifyQRCodeGenerated(qrPage.datatypeQRContainer)
    }
  })

  test('纯文本类型二维码生成', async ({ page }) => {
    // 查找并点击纯文本类型卡片
    const textCard = qrPage.datatypeCards.filter({ hasText: /文本|text|纯文本/ })
    
    if (await textCard.count() > 0) {
      await textCard.first().click()
      
      // 等待表单显示
      await expect(qrPage.datatypeContent).toBeVisible()
      
      // 输入纯文本
      const textData = '这是一段测试文本，用于生成纯文本类型的二维码。'
      await qrPage.datatypeContent.fill(textData)
      
      // 等待自动生成
      await page.waitForTimeout(1000)
      
      // 验证二维码生成
      await qrPage.waitForQRCode(qrPage.datatypeQRContainer)
      await qrPage.verifyQRCodeGenerated(qrPage.datatypeQRContainer)
    }
  })

  test('快速示例功能', async ({ page }) => {
    // 查找快速示例按钮
    const quickExampleButtons = page.locator('button').filter({ hasText: /示例|example|快速/ })
    
    if (await quickExampleButtons.count() > 0) {
      // 点击第一个快速示例
      await quickExampleButtons.first().click()
      
      // 验证内容已填充
      const contentValue = await qrPage.datatypeContent.inputValue()
      expect(contentValue).toBeTruthy()
      expect(contentValue.length).toBeGreaterThan(0)
      
      // 验证二维码已生成
      await qrPage.waitForQRCode(qrPage.datatypeQRContainer)
      await qrPage.verifyQRCodeGenerated(qrPage.datatypeQRContainer)
    }
  })

  test('数据类型切换', async ({ page }) => {
    // 测试在不同数据类型之间切换
    const cardCount = await qrPage.datatypeCards.count()
    
    if (cardCount > 1) {
      // 点击第一个类型
      await qrPage.datatypeCards.first().click()
      await page.waitForTimeout(500)
      
      // 验证第一个类型激活
      await expect(qrPage.datatypeCards.first()).toHaveClass(/active|selected/)
      
      // 点击第二个类型
      await qrPage.datatypeCards.nth(1).click()
      await page.waitForTimeout(500)
      
      // 验证第二个类型激活，第一个类型取消激活
      await expect(qrPage.datatypeCards.nth(1)).toHaveClass(/active|selected/)
      await expect(qrPage.datatypeCards.first()).not.toHaveClass(/active|selected/)
    }
  })

  test('数据验证和错误处理', async ({ page }) => {
    // 选择一个数据类型
    if (await qrPage.datatypeCards.count() > 0) {
      await qrPage.datatypeCards.first().click()
      
      // 清空内容
      await qrPage.datatypeContent.clear()
      
      // 验证生成按钮状态或错误提示
      if (await qrPage.datatypeGenerateButton.isVisible()) {
        const isDisabled = await qrPage.datatypeGenerateButton.isDisabled()
        // 空内容时按钮应该被禁用或显示错误
        expect(isDisabled).toBeTruthy()
      }
    }
  })

  test('复制功能', async ({ page }) => {
    // 生成一个二维码
    if (await qrPage.datatypeCards.count() > 0) {
      await qrPage.datatypeCards.first().click()
      await qrPage.datatypeContent.fill('测试复制功能')
      await page.waitForTimeout(1000)
      
      // 查找复制按钮
      const copyButton = page.locator('button').filter({ hasText: /复制|copy/ })
      
      if (await copyButton.isVisible()) {
        await copyButton.click()
        
        // 验证复制成功（可能显示提示信息）
        const successMessage = page.locator('.success, .message').filter({ hasText: /复制|成功/ })
        if (await successMessage.count() > 0) {
          await expect(successMessage.first()).toBeVisible()
        }
      }
    }
  })

  test('实时更新功能', async ({ page }) => {
    // 选择一个数据类型
    if (await qrPage.datatypeCards.count() > 0) {
      await qrPage.datatypeCards.first().click()
      
      // 输入初始内容
      await qrPage.datatypeContent.fill('初始内容')
      await page.waitForTimeout(1000)
      await qrPage.waitForQRCode(qrPage.datatypeQRContainer)
      
      // 修改内容
      await qrPage.datatypeContent.clear()
      await qrPage.datatypeContent.fill('修改后的内容')
      
      // 验证二维码自动更新
      await page.waitForTimeout(1000)
      await qrPage.waitForQRCode(qrPage.datatypeQRContainer)
      await qrPage.verifyQRCodeGenerated(qrPage.datatypeQRContainer)
    }
  })

  test('无控制台错误 - 数据类型', async ({ page }) => {
    const errors: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    page.on('pageerror', error => {
      errors.push(error.message)
    })
    
    // 执行数据类型操作
    if (await qrPage.datatypeCards.count() > 0) {
      await qrPage.datatypeCards.first().click()
      await qrPage.datatypeContent.fill('测试数据类型功能')
      await page.waitForTimeout(2000)
      await qrPage.waitForQRCode(qrPage.datatypeQRContainer)
    }
    
    // 验证没有控制台错误
    expect(errors).toHaveLength(0)
  })
})
