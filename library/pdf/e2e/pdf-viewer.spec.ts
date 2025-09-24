/**
 * PDF Viewer 端到端测试
 * 测试 PDF 预览器的完整功能流程
 */

import { test, expect } from '@playwright/test'

test.describe('PDF Viewer E2E Tests', () => {
  test.setTimeout(60000) // 增加超时时间到60秒

  test.beforeEach(async ({ page }) => {
    // 监听控制台错误
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('Console error:', msg.text())
      }
    })
  })

  test('应该成功加载示例页面并渲染PDF', async ({ page }) => {
    // 访问示例页面
    await page.goto('/')

    // 验证页面标题
    await expect(page).toHaveTitle('@ldesign/pdf Vue3 Demo')

    // 验证页面基本元素存在
    await expect(page.getByRole('heading', { name: '@ldesign/pdf Vue3 示例' })).toBeVisible()
    await expect(page.getByText('功能完整的PDF预览器演示')).toBeVisible()

    // 验证示例PDF卡片存在
    const standardPdfCard = page.getByText('📄标准示例文档通用PDF测试文档156KB')
    await expect(standardPdfCard).toBeVisible()

    // 点击标准示例文档
    await standardPdfCard.click()

    // 等待PDF工具栏出现
    await expect(page.getByRole('button', { name: '←' })).toBeVisible()
    await expect(page.getByRole('button', { name: '→' })).toBeVisible()

    // 验证页码显示
    await expect(page.getByText('/ 1')).toBeVisible()

    // 验证缩放控件
    await expect(page.getByRole('button', { name: '-' })).toBeVisible()
    await expect(page.getByRole('button', { name: '+' })).toBeVisible()
    await expect(page.getByRole('combobox')).toBeVisible()

    // 等待PDF内容渲染（查找PDF文本内容）
    await expect(page.getByText('Dummy PDF file')).toBeVisible({ timeout: 10000 })

    // 验证缩略图区域
    await expect(page.getByText('页面缩略图')).toBeVisible()
  })

  test('应该正确加载PDF Worker', async ({ page }) => {
    // 监听网络请求
    const workerRequest = page.waitForRequest('**/pdf.worker.min.js')

    // 访问页面并点击PDF
    await page.goto('/')
    await page.getByText('📄标准示例文档通用PDF测试文档156KB').click()

    // 验证worker请求成功
    const request = await workerRequest
    expect(request.url()).toContain('/pdf.worker.min.js')

    // 验证响应成功
    const response = await request.response()
    expect(response?.status()).toBe(200)
  })

  test('应该无控制台错误', async ({ page }) => {
    const consoleErrors: string[] = []

    // 收集控制台错误
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // 访问页面并操作
    await page.goto('/')
    await page.getByText('📄标准示例文档通用PDF测试文档156KB').click()

    // 等待PDF加载完成
    await expect(page.getByText('Dummy PDF file')).toBeVisible({ timeout: 10000 })

    // 验证无控制台错误（排除Vite开发服务器的调试信息）
    const realErrors = consoleErrors.filter(error =>
      !error.includes('[vite]') &&
      !error.includes('connecting') &&
      !error.includes('connected')
    )

    expect(realErrors).toHaveLength(0)
  })

  test('应该支持基本的PDF交互功能', async ({ page }) => {
    // 访问页面并加载PDF
    await page.goto('/')
    await page.getByText('📄标准示例文档通用PDF测试文档156KB').click()

    // 等待PDF加载
    await expect(page.getByText('Dummy PDF file')).toBeVisible({ timeout: 10000 })

    // 测试缩放功能
    const zoomSelect = page.getByRole('combobox')
    await zoomSelect.selectOption('100%')
    await expect(zoomSelect).toHaveValue('100%')

    // 测试缩放按钮
    await page.getByRole('button', { name: '+' }).click()
    await page.getByRole('button', { name: '-' }).click()

    // 测试旋转功能
    await page.getByRole('button', { name: '↻' }).click()

    // 验证功能按钮可点击
    await expect(page.getByRole('button', { name: '🔍' })).toBeEnabled()
    await expect(page.getByRole('button', { name: '☰' })).toBeEnabled()
    await expect(page.getByRole('button', { name: '⤢' })).toBeEnabled()
    await expect(page.getByRole('button', { name: '↓' })).toBeEnabled()
    await expect(page.getByRole('button', { name: '🖨' })).toBeEnabled()
  })

  test('应该支持切换不同的示例PDF', async ({ page }) => {
    await page.goto('/')

    // 测试Lorem Ipsum文档
    await page.getByText('📝Lorem Ipsum 文档经典排版测试文档245KB').click()
    await expect(page.getByText('/ 1')).toBeVisible()

    // 切换到另一个文档
    await page.getByText('📋示例文档副本另一个测试PDF文档156KB').click()
    await expect(page.getByText('/ 1')).toBeVisible()
  })

  test('应该正确处理文件上传功能', async ({ page }) => {
    await page.goto('/')

    // 验证文件上传区域存在
    await expect(page.getByText('📁 或上传本地PDF')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Choose File' })).toBeVisible()
    await expect(page.getByText('选择一个PDF文件进行预览')).toBeVisible()
  })
})
