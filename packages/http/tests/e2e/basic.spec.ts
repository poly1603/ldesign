import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const testPagePath = join(__dirname, 'test-page.html')

test.describe('HTTP Client E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`file://${testPagePath}`)
  })

  test('should load the test page', async ({ page }) => {
    await expect(page).toHaveTitle('HTTP Client Test Page')
    await expect(page.locator('h1')).toContainText('HTTP Client Test Page')
  })

  test('should make successful GET request', async ({ page }) => {
    // 点击 GET 请求按钮
    await page.click('[data-testid="send-get-request"]')

    // 等待加载状态显示
    await expect(page.locator('[data-testid="loading"]')).toBeVisible()

    // 等待响应显示
    await expect(page.locator('[data-testid="response"]')).toBeVisible({
      timeout: 10000,
    })

    // 检查响应内容
    const responseText = await page
      .locator('[data-testid="response"]')
      .textContent()
    expect(responseText).toContain('success')
    expect(responseText).toContain('GET')
  })

  test('should make successful POST request', async ({ page }) => {
    // 点击 POST 请求按钮
    await page.click('[data-testid="send-post-request"]')

    // 等待加载状态显示
    await expect(page.locator('[data-testid="loading"]')).toBeVisible()

    // 等待响应显示
    await expect(page.locator('[data-testid="response"]')).toBeVisible({
      timeout: 10000,
    })

    // 检查响应内容
    const responseText = await page
      .locator('[data-testid="response"]')
      .textContent()
    expect(responseText).toContain('success')
    expect(responseText).toContain('POST')
  })

  test('should handle errors gracefully', async ({ page }) => {
    // 点击错误请求按钮
    await page.click('[data-testid="send-error-request"]')

    // 等待加载状态显示
    await expect(page.locator('[data-testid="loading"]')).toBeVisible()

    // 等待错误显示
    await expect(page.locator('[data-testid="error"]')).toBeVisible({
      timeout: 10000,
    })

    // 检查错误内容
    const errorText = await page.locator('[data-testid="error"]').textContent()
    expect(errorText).toContain('Mock error response')
  })

  test('should work with Vue integration', async ({ page }) => {
    // 点击 Vue 请求按钮
    await page.click('[data-testid="vue-send-request"]')

    // 等待 Vue 加载状态显示
    await expect(page.locator('[data-testid="vue-loading"]')).toBeVisible()

    // 等待 Vue 响应显示
    await expect(page.locator('[data-testid="vue-response"]')).toBeVisible({
      timeout: 10000,
    })

    // 检查 Vue 响应内容
    const responseText = await page
      .locator('[data-testid="vue-response"]')
      .textContent()
    expect(responseText).toContain('success')
  })

  test('should show loading states correctly', async ({ page }) => {
    // 点击请求按钮
    const requestPromise = page.click('[data-testid="send-get-request"]')

    // 立即检查加载状态
    await expect(page.locator('[data-testid="loading"]')).toBeVisible()

    // 确保响应和错误元素隐藏
    await expect(page.locator('[data-testid="response"]')).toBeHidden()
    await expect(page.locator('[data-testid="error"]')).toBeHidden()

    // 等待请求完成
    await requestPromise

    // 等待响应显示，加载状态隐藏
    await expect(page.locator('[data-testid="response"]')).toBeVisible({
      timeout: 10000,
    })
    await expect(page.locator('[data-testid="loading"]')).toBeHidden()
  })
})
