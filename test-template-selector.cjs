const { chromium } = require('@playwright/test')

async function testTemplateSelector() {
  console.log('🚀 启动模板选择器测试...')

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500,
  })

  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 },
  })

  const page = await context.newPage()

  // 监听控制台日志
  page.on('console', (msg) => {
    const text = msg.text()
    if (text.includes('🔍') || text.includes('filteredTemplates') || text.includes('TemplateSelector')) {
      console.log(`[浏览器] ${text}`)
    }
  })

  try {
    console.log('📱 导航到登录页面...')
    await page.goto('http://localhost:3008/login')

    // 等待页面加载
    await page.waitForTimeout(3000)

    console.log('🎯 点击模板选择器按钮...')
    const selectorButton = await page.locator('button:has-text("选择模板")').first()

    if (await selectorButton.isVisible()) {
      await selectorButton.click()
      await page.waitForTimeout(2000)

      // 检查模态框是否打开
      const modal = page.locator('.template-selector-modal')
      const isModalVisible = await modal.isVisible()
      console.log(`📋 模态框是否可见: ${isModalVisible}`)

      if (isModalVisible) {
        // 检查模态框内容
        const title = await page.locator('.template-selector__title').textContent()
        console.log(`📋 模态框标题: ${title}`)

        // 检查统计信息
        const stats = await page.locator('.template-selector__stats').textContent()
        console.log(`📊 统计信息: ${stats}`)

        // 检查是否有模板列表
        const templateList = page.locator('.template-selector__list')
        const hasTemplateList = await templateList.isVisible()
        console.log(`📋 模板列表是否可见: ${hasTemplateList}`)

        if (hasTemplateList) {
          const templateItems = await page.locator('.template-selector__list > *').count()
          console.log(`📊 模板项数量: ${templateItems}`)
        }

        // 检查是否显示空状态
        const emptyState = page.locator('.template-selector__empty')
        const hasEmptyState = await emptyState.isVisible()
        console.log(`📋 空状态是否可见: ${hasEmptyState}`)

        if (hasEmptyState) {
          const emptyText = await emptyState.textContent()
          console.log(`📋 空状态文本: ${emptyText}`)
        }

        // 检查是否有加载状态
        const loadingState = page.locator('.template-selector__loading')
        const hasLoadingState = await loadingState.isVisible()
        console.log(`📋 加载状态是否可见: ${hasLoadingState}`)

        // 检查是否有错误状态
        const errorState = page.locator('.template-selector__error')
        const hasErrorState = await errorState.isVisible()
        console.log(`📋 错误状态是否可见: ${hasErrorState}`)

        // 等待一段时间观察
        await page.waitForTimeout(3000)

        // 关闭模态框
        await page.keyboard.press('Escape')
        console.log('✅ 关闭模态框')
      }
    }
    else {
      console.log('❌ 未找到模板选择器按钮')
    }

    console.log('✅ 测试完成！')
  }
  catch (error) {
    console.error('❌ 测试失败:', error)
  }
  finally {
    await page.waitForTimeout(3000)
    await browser.close()
  }
}

// 运行测试
testTemplateSelector().catch(console.error)
