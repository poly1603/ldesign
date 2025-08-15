/**
 * @ldesign/theme - Playwright 全局测试设置
 */

import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 开始全局测试设置...')

  const { baseURL } = config.projects[0].use

  if (!baseURL) {
    throw new Error('baseURL is not defined in playwright config')
  }

  // 启动浏览器进行预检查
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    console.log(`📡 检查开发服务器: ${baseURL}`)

    // 等待开发服务器启动
    let retries = 0
    const maxRetries = 30

    while (retries < maxRetries) {
      try {
        await page.goto(baseURL, { waitUntil: 'networkidle' })
        console.log('✅ 开发服务器已就绪')
        break
      } catch (error) {
        retries++
        console.log(`⏳ 等待开发服务器启动... (${retries}/${maxRetries})`)
        await page.waitForTimeout(2000)

        if (retries === maxRetries) {
          throw new Error(`开发服务器在 ${maxRetries * 2} 秒后仍未就绪`)
        }
      }
    }

    // 预加载关键资源
    console.log('📦 预加载关键资源...')

    // 等待主要组件加载
    await page.waitForSelector('h2:has-text("节日主题挂件系统演示")', {
      timeout: 10000,
    })
    await page.waitForSelector('.theme-buttons', { timeout: 5000 })

    // 预加载所有主题
    console.log('🎨 预加载主题资源...')

    // 切换到春节主题并等待加载
    await page.click('button:has-text("春节主题")')
    await page.waitForTimeout(1000)
    await page.waitForSelector('[data-theme="spring-festival"]')

    // 切换到圣诞主题并等待加载
    await page.click('button:has-text("圣诞主题")')
    await page.waitForTimeout(1000)
    await page.waitForSelector('[data-theme="christmas"]')

    // 切换回默认主题
    await page.click('button:has-text("默认主题")')
    await page.waitForTimeout(1000)
    await page.waitForSelector('[data-theme="default"]')

    console.log('✅ 主题资源预加载完成')

    // 检查关键功能
    console.log('🔍 检查关键功能...')

    // 检查挂件系统是否正常工作
    const widgetElements = await page.locator('[data-widget-type]').count()
    if (widgetElements === 0) {
      console.warn('⚠️  警告: 未检测到挂件元素，可能存在问题')
    } else {
      console.log(`✅ 检测到 ${widgetElements} 个挂件元素`)
    }

    // 检查主题管理器
    await page.waitForSelector('.theme-manager')
    console.log('✅ 主题管理器正常')

    // 检查状态栏
    await page.waitForSelector('.status-bar')
    console.log('✅ 状态栏正常')

    // 清理测试数据
    console.log('🧹 清理测试环境...')
    await page.evaluate(() => {
      // 清除本地存储中的测试数据
      localStorage.removeItem('ldesign-festival-theme')
      localStorage.removeItem('test-theme')
    })

    console.log('✅ 全局测试设置完成')
  } catch (error) {
    console.error('❌ 全局测试设置失败:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup
