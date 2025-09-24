import { test, expect } from '@playwright/test'

/**
 * E2E测试 - 查询表单功能
 * 测试查询表单的展开收起、搜索重置等功能
 */

test.describe('查询表单功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // 切换到查询表单示例
    await page.click('[data-testid="query-form-tab"]')
  })

  test('查询表单 - 展开收起功能', async ({ page }) => {
    // 检查初始状态 - 应该只显示前几个字段
    const visibleFields = page.locator('.form-field:visible')
    const initialCount = await visibleFields.count()
    
    // 点击展开按钮
    await page.click('[data-testid="expand-button"]')
    
    // 检查展开后的字段数量
    const expandedFields = page.locator('.form-field:visible')
    const expandedCount = await expandedFields.count()
    
    expect(expandedCount).toBeGreaterThan(initialCount)
    
    // 检查展开按钮文本变化
    await expect(page.locator('[data-testid="expand-button"]')).toContainText('收起')
    
    // 点击收起按钮
    await page.click('[data-testid="expand-button"]')
    
    // 检查收起后的字段数量
    const collapsedFields = page.locator('.form-field:visible')
    const collapsedCount = await collapsedFields.count()
    
    expect(collapsedCount).toBe(initialCount)
    
    // 检查收起按钮文本变化
    await expect(page.locator('[data-testid="expand-button"]')).toContainText('展开')
  })

  test('查询表单 - 搜索功能', async ({ page }) => {
    // 填写查询条件
    await page.fill('input[name="keyword"]', '测试关键词')
    await page.selectOption('select[name="status"]', 'active')
    await page.fill('input[name="startDate"]', '2024-01-01')
    await page.fill('input[name="endDate"]', '2024-12-31')
    
    // 点击搜索按钮
    await page.click('[data-testid="search-button"]')
    
    // 检查搜索结果
    await expect(page.locator('[data-testid="search-result"]')).toBeVisible()
    await expect(page.locator('[data-testid="search-result"]')).toContainText('测试关键词')
    await expect(page.locator('[data-testid="search-result"]')).toContainText('active')
  })

  test('查询表单 - 重置功能', async ({ page }) => {
    // 填写查询条件
    await page.fill('input[name="keyword"]', '测试关键词')
    await page.selectOption('select[name="status"]', 'active')
    await page.fill('input[name="startDate"]', '2024-01-01')
    
    // 检查字段已填写
    await expect(page.locator('input[name="keyword"]')).toHaveValue('测试关键词')
    await expect(page.locator('select[name="status"]')).toHaveValue('active')
    await expect(page.locator('input[name="startDate"]')).toHaveValue('2024-01-01')
    
    // 点击重置按钮
    await page.click('[data-testid="reset-button"]')
    
    // 检查字段已清空
    await expect(page.locator('input[name="keyword"]')).toHaveValue('')
    await expect(page.locator('select[name="status"]')).toHaveValue('')
    await expect(page.locator('input[name="startDate"]')).toHaveValue('')
  })

  test('查询表单 - 按钮组位置', async ({ page }) => {
    // 检查按钮组是否在正确位置
    const buttonGroup = page.locator('[data-testid="button-group"]')
    await expect(buttonGroup).toBeVisible()
    
    // 检查按钮组包含的按钮
    await expect(buttonGroup.locator('[data-testid="search-button"]')).toBeVisible()
    await expect(buttonGroup.locator('[data-testid="reset-button"]')).toBeVisible()
    await expect(buttonGroup.locator('[data-testid="expand-button"]')).toBeVisible()
    
    // 检查按钮组的对齐方式
    const buttonGroupBox = await buttonGroup.boundingBox()
    const formBox = await page.locator('.query-form').boundingBox()
    
    // 按钮组应该在表单右侧
    expect(buttonGroupBox?.x).toBeGreaterThan((formBox?.x || 0) + (formBox?.width || 0) * 0.5)
  })
})

test.describe('查询表单响应式测试', () => {
  test('移动端查询表单布局', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.click('[data-testid="query-form-tab"]')
    
    // 检查移动端布局
    const form = page.locator('.query-form')
    await expect(form).toBeVisible()
    
    // 检查按钮组在移动端的布局
    const buttonGroup = page.locator('[data-testid="button-group"]')
    const buttonGroupBox = await buttonGroup.boundingBox()
    const formBox = await form.boundingBox()
    
    // 在移动端，按钮组应该在表单下方
    expect(buttonGroupBox?.y).toBeGreaterThan((formBox?.y || 0) + (formBox?.height || 0) * 0.5)
  })

  test('平板端查询表单布局', async ({ page }) => {
    // 设置平板端视口
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await page.click('[data-testid="query-form-tab"]')
    
    // 检查平板端布局
    const form = page.locator('.query-form')
    await expect(form).toBeVisible()
    
    // 检查字段排列
    const fields = page.locator('.form-field')
    const fieldCount = await fields.count()
    
    // 平板端应该有适中的字段排列
    expect(fieldCount).toBeGreaterThan(0)
  })
})

test.describe('查询表单性能测试', () => {
  test('大量字段的查询表单性能', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-testid="large-query-form-tab"]')
    
    // 记录开始时间
    const startTime = Date.now()
    
    // 等待表单完全渲染
    await page.waitForSelector('.query-form', { state: 'visible' })
    
    // 记录结束时间
    const endTime = Date.now()
    const renderTime = endTime - startTime
    
    // 渲染时间应该在合理范围内（小于2秒）
    expect(renderTime).toBeLessThan(2000)
    
    // 检查所有字段是否正确渲染
    const fields = page.locator('.form-field')
    const fieldCount = await fields.count()
    
    // 应该有大量字段
    expect(fieldCount).toBeGreaterThan(20)
  })

  test('展开收起动画性能', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-testid="query-form-tab"]')
    
    // 多次快速点击展开收起按钮
    for (let i = 0; i < 5; i++) {
      await page.click('[data-testid="expand-button"]')
      await page.waitForTimeout(100)
      await page.click('[data-testid="expand-button"]')
      await page.waitForTimeout(100)
    }
    
    // 检查表单仍然正常工作
    await expect(page.locator('.query-form')).toBeVisible()
    await expect(page.locator('[data-testid="expand-button"]')).toBeVisible()
  })
})
