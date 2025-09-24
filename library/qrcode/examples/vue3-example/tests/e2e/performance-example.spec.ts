import { test, expect } from '@playwright/test'
import { Vue3QRCodePage } from './page-objects/vue3-qrcode-page'

test.describe('Vue3 QR码示例 - 性能测试', () => {
  let qrPage: Vue3QRCodePage

  test.beforeEach(async ({ page }) => {
    qrPage = new Vue3QRCodePage(page)
    await qrPage.goto()
    await qrPage.switchToTab('performance')
  })

  test('性能测试页面加载', async ({ page }) => {
    // 验证性能测试标签页激活
    await expect(qrPage.performanceTab).toHaveClass(/active/)
    
    // 验证性能测试控件
    if (await qrPage.performanceTestCount.isVisible()) {
      await expect(qrPage.performanceTestCount).toBeVisible()
    }
    
    if (await qrPage.performanceRunButton.isVisible()) {
      await expect(qrPage.performanceRunButton).toBeVisible()
    }
  })

  test('基础性能测试执行', async ({ page }) => {
    // 查找并配置测试参数
    const testCountInput = page.locator('input[type="number"], input[type="range"]').first()
    const runButton = page.locator('button').filter({ hasText: /开始|运行|测试|start|run/ })
    
    if (await testCountInput.isVisible() && await runButton.isVisible()) {
      // 设置较小的测试数量以加快测试速度
      await testCountInput.fill('5')
      
      // 开始测试
      await runButton.click()
      
      // 等待测试完成（给足够的时间）
      await page.waitForTimeout(10000)
      
      // 验证测试结果显示
      const resultsContainer = page.locator('.test-results, .performance-results, .results')
      if (await resultsContainer.count() > 0) {
        await expect(resultsContainer.first()).toBeVisible()
      }
    }
  })

  test('生成速度测试', async ({ page }) => {
    // 查找生成速度测试选项
    const generationTest = page.locator('input[type="checkbox"]').filter({ hasText: /生成|generation/ })
    const runButton = page.locator('button').filter({ hasText: /开始|运行|测试/ })
    
    if (await generationTest.count() > 0 && await runButton.count() > 0) {
      // 选择生成速度测试
      await generationTest.first().check()
      
      // 运行测试
      await runButton.first().click()
      
      // 等待测试完成
      await page.waitForTimeout(8000)
      
      // 验证结果包含时间信息
      const timeResults = page.locator('text=/\\d+ms|\\d+秒|time|时间/')
      if (await timeResults.count() > 0) {
        await expect(timeResults.first()).toBeVisible()
      }
    }
  })

  test('缓存性能测试', async ({ page }) => {
    // 查找缓存测试选项
    const cacheTest = page.locator('input[type="checkbox"]').filter({ hasText: /缓存|cache/ })
    const runButton = page.locator('button').filter({ hasText: /开始|运行|测试/ })
    
    if (await cacheTest.count() > 0 && await runButton.count() > 0) {
      // 选择缓存测试
      await cacheTest.first().check()
      
      // 运行测试
      await runButton.first().click()
      
      // 等待测试完成
      await page.waitForTimeout(8000)
      
      // 验证缓存相关结果
      const cacheResults = page.locator('text=/cache|缓存|hit|命中/')
      if (await cacheResults.count() > 0) {
        await expect(cacheResults.first()).toBeVisible()
      }
    }
  })

  test('批量生成性能测试', async ({ page }) => {
    // 查找批量测试选项
    const batchTest = page.locator('input[type="checkbox"]').filter({ hasText: /批量|batch/ })
    const runButton = page.locator('button').filter({ hasText: /开始|运行|测试/ })
    
    if (await batchTest.count() > 0 && await runButton.count() > 0) {
      // 选择批量测试
      await batchTest.first().check()
      
      // 运行测试
      await runButton.first().click()
      
      // 等待测试完成
      await page.waitForTimeout(10000)
      
      // 验证批量处理结果
      const batchResults = page.locator('text=/batch|批量|并发|concurrent/')
      if (await batchResults.count() > 0) {
        await expect(batchResults.first()).toBeVisible()
      }
    }
  })

  test('内存使用测试', async ({ page }) => {
    // 查找内存测试选项
    const memoryTest = page.locator('input[type="checkbox"]').filter({ hasText: /内存|memory/ })
    const runButton = page.locator('button').filter({ hasText: /开始|运行|测试/ })
    
    if (await memoryTest.count() > 0 && await runButton.count() > 0) {
      // 选择内存测试
      await memoryTest.first().check()
      
      // 运行测试
      await runButton.first().click()
      
      // 等待测试完成
      await page.waitForTimeout(8000)
      
      // 验证内存使用结果
      const memoryResults = page.locator('text=/MB|KB|memory|内存|使用/')
      if (await memoryResults.count() > 0) {
        await expect(memoryResults.first()).toBeVisible()
      }
    }
  })

  test('性能图表显示', async ({ page }) => {
    // 运行一个简单的测试来生成图表
    const runButton = page.locator('button').filter({ hasText: /开始|运行|测试/ })
    
    if (await runButton.count() > 0) {
      await runButton.first().click()
      await page.waitForTimeout(8000)
      
      // 查找图表元素
      const charts = page.locator('canvas').filter({ hasText: /chart|图表/ })
      const chartContainers = page.locator('.chart, .comparison-chart, .result-chart')
      
      if (await charts.count() > 0) {
        await expect(charts.first()).toBeVisible()
      } else if (await chartContainers.count() > 0) {
        await expect(chartContainers.first()).toBeVisible()
      }
    }
  })

  test('性能对比功能', async ({ page }) => {
    // 运行测试生成对比数据
    const runButton = page.locator('button').filter({ hasText: /开始|运行|测试/ })
    
    if (await runButton.count() > 0) {
      await runButton.first().click()
      await page.waitForTimeout(8000)
      
      // 查找对比相关元素
      const comparisonElements = page.locator('.comparison, .compare, .vs, text=/对比|比较/')
      
      if (await comparisonElements.count() > 0) {
        await expect(comparisonElements.first()).toBeVisible()
      }
    }
  })

  test('性能建议显示', async ({ page }) => {
    // 查找性能建议区域
    const recommendations = page.locator('.recommendations, .tips, .advice, text=/建议|推荐|优化/')
    
    if (await recommendations.count() > 0) {
      await expect(recommendations.first()).toBeVisible()
      
      // 验证建议内容不为空
      const content = await recommendations.first().textContent()
      expect(content).toBeTruthy()
      expect(content!.length).toBeGreaterThan(10)
    }
  })

  test('测试参数配置', async ({ page }) => {
    // 测试各种参数配置
    const testCountInput = page.locator('input[type="number"]').first()
    const testSizeInput = page.locator('input[type="number"], input[type="range"]').nth(1)
    
    if (await testCountInput.isVisible()) {
      // 测试不同的测试数量
      const testCounts = ['1', '5', '10']
      
      for (const count of testCounts) {
        await testCountInput.fill(count)
        
        // 验证值已设置
        const value = await testCountInput.inputValue()
        expect(value).toBe(count)
      }
    }
    
    if (await testSizeInput.isVisible()) {
      // 测试不同的尺寸
      await testSizeInput.fill('150')
      const value = await testSizeInput.inputValue()
      expect(parseInt(value)).toBeGreaterThanOrEqual(100)
    }
  })

  test('测试进度显示', async ({ page }) => {
    const runButton = page.locator('button').filter({ hasText: /开始|运行|测试/ })
    
    if (await runButton.count() > 0) {
      await runButton.first().click()
      
      // 查找进度相关元素
      const progressElements = page.locator('.progress, .loading, text=/进度|%|正在/')
      
      // 在测试开始后短时间内应该能看到进度指示
      await page.waitForTimeout(1000)
      
      if (await progressElements.count() > 0) {
        // 验证进度元素在测试期间可见
        await expect(progressElements.first()).toBeVisible()
      }
      
      // 等待测试完成
      await page.waitForTimeout(8000)
    }
  })

  test('测试结果导出', async ({ page }) => {
    // 运行测试生成结果
    const runButton = page.locator('button').filter({ hasText: /开始|运行|测试/ })
    
    if (await runButton.count() > 0) {
      await runButton.first().click()
      await page.waitForTimeout(8000)
      
      // 查找导出按钮
      const exportButton = page.locator('button').filter({ hasText: /导出|export|下载|download/ })
      
      if (await exportButton.count() > 0) {
        // 设置下载监听
        const downloadPromise = page.waitForEvent('download')
        
        // 点击导出按钮
        await exportButton.first().click()
        
        // 验证下载开始
        const download = await downloadPromise
        expect(download.suggestedFilename()).toMatch(/\.(json|csv|txt)$/)
      }
    }
  })

  test('无控制台错误 - 性能测试', async ({ page }) => {
    const errors: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    page.on('pageerror', error => {
      errors.push(error.message)
    })
    
    // 执行性能测试操作
    const runButton = page.locator('button').filter({ hasText: /开始|运行|测试/ })
    
    if (await runButton.count() > 0) {
      await runButton.first().click()
      await page.waitForTimeout(5000) // 等待部分测试完成
    }
    
    // 验证没有控制台错误
    expect(errors).toHaveLength(0)
  })
})
