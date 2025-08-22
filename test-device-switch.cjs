const { chromium } = require('@playwright/test')

async function testDeviceSwitch() {
  console.log('🚀 启动设备切换测试...')

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000, // 慢速执行，便于观察
  })

  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 },
  })

  const page = await context.newPage()

  // 监听控制台日志
  page.on('console', (msg) => {
    const text = msg.text()
    if (text.includes('📱') || text.includes('🎨') || text.includes('🎯') || text.includes('🔄')) {
      console.log(`[浏览器] ${text}`)
    }
  })

  try {
    console.log('📱 导航到登录页面...')
    await page.goto('http://localhost:3008/login')

    // 等待页面加载
    await page.waitForTimeout(3000)

    console.log('🖥️ 测试桌面端 (1200x800)')
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.waitForTimeout(2000)

    // 点击模板选择器按钮
    console.log('🎯 点击模板选择器...')

    // 尝试多种选择器
    const selectors = [
      'button:has-text("选择模板")',
      'button:has-text("⚙️")',
      '.template-selector-button',
      '[data-testid="template-selector"]',
      'button[class*="selector"]',
      'button[class*="template"]',
    ]

    let selectorButton = null
    for (const selector of selectors) {
      const element = page.locator(selector).first()
      if (await element.isVisible()) {
        selectorButton = element
        console.log(`✅ 找到模板选择器按钮: ${selector}`)
        break
      }
    }

    if (selectorButton) {
      await selectorButton.click()
      await page.waitForTimeout(1000)

      // 检查显示的模板 - 尝试多种选择器
      const templateSelectors = [
        '.template-item',
        '.template-card',
        '[data-testid="template-item"]',
        '.template-option',
        '.template-list > *',
        '.modal .template',
      ]

      let templates = 0
      for (const selector of templateSelectors) {
        const count = await page.locator(selector).count()
        if (count > 0) {
          templates = count
          console.log(`✅ 找到模板项: ${selector} (${count} 个)`)
          break
        }
      }

      console.log(`📊 桌面端显示 ${templates} 个模板`)

      // 关闭模态框 - 直接使用 ESC 键，避免点击被遮挡的问题
      await page.keyboard.press('Escape')
      console.log('✅ 使用 ESC 键关闭模态框')

      await page.waitForTimeout(1000)
    }
    else {
      console.log('❌ 未找到模板选择器按钮')

      // 输出页面上所有按钮的信息
      const allButtons = await page.locator('button').all()
      console.log(`📋 页面上共有 ${allButtons.length} 个按钮:`)
      for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
        const text = await allButtons[i].textContent()
        const className = await allButtons[i].getAttribute('class')
        console.log(`  ${i + 1}. "${text}" (class: ${className})`)
      }
    }

    console.log('📱 切换到移动端 (375x667)')
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(3000) // 等待设备变化事件处理

    // 再次点击模板选择器
    console.log('🎯 再次点击模板选择器...')

    // 重新查找按钮（可能因为设备变化而重新渲染）
    let mobileSelectorButton = null
    for (const selector of selectors) {
      const element = page.locator(selector).first()
      if (await element.isVisible()) {
        mobileSelectorButton = element
        break
      }
    }

    if (mobileSelectorButton) {
      await mobileSelectorButton.click()
      await page.waitForTimeout(1000)

      // 检查显示的模板
      let templates = 0
      for (const selector of templateSelectors) {
        const count = await page.locator(selector).count()
        if (count > 0) {
          templates = count
          break
        }
      }

      console.log(`📊 移动端显示 ${templates} 个模板`)

      // 关闭模态框
      await page.keyboard.press('Escape')
      await page.waitForTimeout(1000)
    }
    else {
      console.log('❌ 移动端未找到模板选择器按钮')
    }

    console.log('📱 切换到平板端 (768x1024)')
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(3000) // 等待设备变化事件处理

    // 再次点击模板选择器
    console.log('🎯 第三次点击模板选择器...')

    // 重新查找按钮
    let tabletSelectorButton = null
    for (const selector of selectors) {
      const element = page.locator(selector).first()
      if (await element.isVisible()) {
        tabletSelectorButton = element
        break
      }
    }

    if (tabletSelectorButton) {
      await tabletSelectorButton.click()
      await page.waitForTimeout(1000)

      // 检查显示的模板
      let templates = 0
      for (const selector of templateSelectors) {
        const count = await page.locator(selector).count()
        if (count > 0) {
          templates = count
          break
        }
      }

      console.log(`📊 平板端显示 ${templates} 个模板`)
    }
    else {
      console.log('❌ 平板端未找到模板选择器按钮')
    }

    console.log('✅ 测试完成！')
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
testDeviceSwitch().catch(console.error)
