const { chromium } = require('@playwright/test')

async function testDeviceChange() {
  console.log('🚀 启动设备切换最终测试...')

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
  })

  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 },
  })

  const page = await context.newPage()

  // 监听控制台日志
  page.on('console', (msg) => {
    const text = msg.text()
    if (text.includes('📱') || text.includes('🎨') || text.includes('🎯') || text.includes('🔄') || text.includes('TemplateRenderer')) {
      console.log(`[浏览器] ${text}`)
    }
  })

  try {
    console.log('📱 导航到登录页面...')
    await page.goto('http://localhost:3009/login')

    // 等待页面加载
    await page.waitForTimeout(3000)

    // 测试函数：检查模板选择器
    async function checkTemplateSelector(deviceName) {
      console.log(`\n🎯 检查 ${deviceName} 的模板选择器...`)

      const selectorButton = await page.locator('button:has-text("选择模板")').first()
      if (await selectorButton.isVisible()) {
        await selectorButton.click()
        await page.waitForTimeout(1000)

        // 获取模态框信息
        const title = await page.locator('.template-selector__title').textContent()
        const stats = await page.locator('.template-selector__stats').textContent()
        const templateItems = await page.locator('.template-selector__list > *').count()

        console.log(`📋 ${deviceName} - 标题: ${title}`)
        console.log(`📊 ${deviceName} - 统计: ${stats}`)
        console.log(`📊 ${deviceName} - 模板项: ${templateItems} 个`)

        // 关闭模态框
        await page.keyboard.press('Escape')
        await page.waitForTimeout(500)

        return { title, stats, templateItems }
      }
      else {
        console.log(`❌ ${deviceName} - 未找到模板选择器按钮`)
        return null
      }
    }

    // 1. 测试桌面端
    console.log('\n🖥️ 测试桌面端 (1200x800)')
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.waitForTimeout(2000)
    const desktopResult = await checkTemplateSelector('桌面端')

    // 2. 切换到移动端
    console.log('\n📱 切换到移动端 (375x667)')
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(3000) // 等待设备变化事件处理
    const mobileResult = await checkTemplateSelector('移动端')

    // 3. 切换到平板端
    console.log('\n📱 切换到平板端 (768x1024)')
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(3000) // 等待设备变化事件处理
    const tabletResult = await checkTemplateSelector('平板端')

    // 4. 切换回桌面端
    console.log('\n🖥️ 切换回桌面端 (1200x800)')
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.waitForTimeout(3000) // 等待设备变化事件处理
    const desktopResult2 = await checkTemplateSelector('桌面端(再次)')

    // 总结结果
    console.log('\n📊 测试结果总结:')
    console.log('=====================================')

    if (desktopResult) {
      console.log(`🖥️ 桌面端: ${desktopResult.templateItems} 个模板 - ${desktopResult.title}`)
    }

    if (mobileResult) {
      console.log(`📱 移动端: ${mobileResult.templateItems} 个模板 - ${mobileResult.title}`)
    }

    if (tabletResult) {
      console.log(`📱 平板端: ${tabletResult.templateItems} 个模板 - ${tabletResult.title}`)
    }

    if (desktopResult2) {
      console.log(`🖥️ 桌面端(再次): ${desktopResult2.templateItems} 个模板 - ${desktopResult2.title}`)
    }

    // 验证设备切换是否正确
    let success = true

    if (desktopResult && !desktopResult.title.includes('desktop')) {
      console.log('❌ 桌面端设备类型检测错误')
      success = false
    }

    if (mobileResult && !mobileResult.title.includes('mobile')) {
      console.log('❌ 移动端设备类型检测错误')
      success = false
    }

    if (tabletResult && !tabletResult.title.includes('tablet')) {
      console.log('❌ 平板端设备类型检测错误')
      success = false
    }

    if (success) {
      console.log('✅ 设备切换测试通过！模板选择器能正确响应设备变化')
    }
    else {
      console.log('❌ 设备切换测试失败！')
    }

    console.log('=====================================')
  }
  catch (error) {
    console.error('❌ 测试失败:', error)
  }
  finally {
    await page.waitForTimeout(5000) // 保持页面打开5秒便于观察
    await browser.close()
  }
}

// 运行测试
testDeviceChange().catch(console.error)
