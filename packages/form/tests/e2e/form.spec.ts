import { test, expect } from '@playwright/test'

/**
 * E2E测试 - 表单基础功能
 * 测试Vue、Lit、Vanilla JS三种技术栈的表单功能
 */

test.describe('表单基础功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('Vue表单 - 基础渲染和交互', async ({ page }) => {
    // 切换到Vue示例
    await page.click('[data-testid="vue-tab"]')
    
    // 检查表单是否正确渲染
    await expect(page.locator('[data-testid="vue-form"]')).toBeVisible()
    
    // 检查字段是否存在
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('select[name="gender"]')).toBeVisible()
    
    // 填写表单
    await page.fill('input[name="name"]', '张三')
    await page.fill('input[name="email"]', 'zhangsan@example.com')
    await page.selectOption('select[name="gender"]', 'male')
    
    // 检查表单值是否正确更新
    await expect(page.locator('input[name="name"]')).toHaveValue('张三')
    await expect(page.locator('input[name="email"]')).toHaveValue('zhangsan@example.com')
    await expect(page.locator('select[name="gender"]')).toHaveValue('male')
    
    // 提交表单
    await page.click('button[type="submit"]')
    
    // 检查提交结果
    await expect(page.locator('[data-testid="form-result"]')).toContainText('张三')
    await expect(page.locator('[data-testid="form-result"]')).toContainText('zhangsan@example.com')
  })

  test('Lit表单 - 基础渲染和交互', async ({ page }) => {
    // 切换到Lit示例
    await page.click('[data-testid="lit-tab"]')
    
    // 检查表单是否正确渲染
    await expect(page.locator('ldesign-form')).toBeVisible()
    
    // 检查字段是否存在
    await expect(page.locator('ldesign-form input[name="name"]')).toBeVisible()
    await expect(page.locator('ldesign-form input[name="email"]')).toBeVisible()
    await expect(page.locator('ldesign-form select[name="gender"]')).toBeVisible()
    
    // 填写表单
    await page.fill('ldesign-form input[name="name"]', '李四')
    await page.fill('ldesign-form input[name="email"]', 'lisi@example.com')
    await page.selectOption('ldesign-form select[name="gender"]', 'female')
    
    // 检查表单值是否正确更新
    await expect(page.locator('ldesign-form input[name="name"]')).toHaveValue('李四')
    await expect(page.locator('ldesign-form input[name="email"]')).toHaveValue('lisi@example.com')
    await expect(page.locator('ldesign-form select[name="gender"]')).toHaveValue('female')
    
    // 提交表单
    await page.click('ldesign-form button[type="submit"]')
    
    // 检查提交结果
    await expect(page.locator('[data-testid="form-result"]')).toContainText('李四')
    await expect(page.locator('[data-testid="form-result"]')).toContainText('lisi@example.com')
  })

  test('Vanilla JS表单 - 基础渲染和交互', async ({ page }) => {
    // 切换到Vanilla示例
    await page.click('[data-testid="vanilla-tab"]')
    
    // 检查表单是否正确渲染
    await expect(page.locator('[data-testid="vanilla-form"]')).toBeVisible()
    
    // 检查字段是否存在
    await expect(page.locator('[data-testid="vanilla-form"] input[name="name"]')).toBeVisible()
    await expect(page.locator('[data-testid="vanilla-form"] input[name="email"]')).toBeVisible()
    await expect(page.locator('[data-testid="vanilla-form"] select[name="gender"]')).toBeVisible()
    
    // 填写表单
    await page.fill('[data-testid="vanilla-form"] input[name="name"]', '王五')
    await page.fill('[data-testid="vanilla-form"] input[name="email"]', 'wangwu@example.com')
    await page.selectOption('[data-testid="vanilla-form"] select[name="gender"]', 'other')
    
    // 检查表单值是否正确更新
    await expect(page.locator('[data-testid="vanilla-form"] input[name="name"]')).toHaveValue('王五')
    await expect(page.locator('[data-testid="vanilla-form"] input[name="email"]')).toHaveValue('wangwu@example.com')
    await expect(page.locator('[data-testid="vanilla-form"] select[name="gender"]')).toHaveValue('other')
    
    // 提交表单
    await page.click('[data-testid="vanilla-form"] button[type="submit"]')
    
    // 检查提交结果
    await expect(page.locator('[data-testid="form-result"]')).toContainText('王五')
    await expect(page.locator('[data-testid="form-result"]')).toContainText('wangwu@example.com')
  })
})

test.describe('表单验证功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('必填字段验证', async ({ page }) => {
    // 切换到Vue示例
    await page.click('[data-testid="vue-tab"]')
    
    // 直接提交空表单
    await page.click('button[type="submit"]')
    
    // 检查验证错误信息
    await expect(page.locator('.field-error')).toContainText('姓名是必填项')
    await expect(page.locator('.field-error')).toContainText('邮箱是必填项')
  })

  test('邮箱格式验证', async ({ page }) => {
    // 切换到Vue示例
    await page.click('[data-testid="vue-tab"]')
    
    // 填写无效邮箱
    await page.fill('input[name="name"]', '测试用户')
    await page.fill('input[name="email"]', 'invalid-email')
    
    // 提交表单
    await page.click('button[type="submit"]')
    
    // 检查邮箱验证错误
    await expect(page.locator('.field-error')).toContainText('请输入有效的邮箱地址')
  })
})

test.describe('响应式布局测试', () => {
  test('移动端布局适配', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // 切换到Vue示例
    await page.click('[data-testid="vue-tab"]')
    
    // 检查移动端布局
    const form = page.locator('[data-testid="vue-form"]')
    await expect(form).toBeVisible()
    
    // 检查字段是否垂直排列
    const fields = page.locator('.form-field')
    const firstField = fields.first()
    const secondField = fields.nth(1)
    
    const firstBox = await firstField.boundingBox()
    const secondBox = await secondField.boundingBox()
    
    // 在移动端，第二个字段应该在第一个字段下方
    expect(secondBox?.y).toBeGreaterThan(firstBox?.y + firstBox?.height)
  })

  test('桌面端布局适配', async ({ page }) => {
    // 设置桌面端视口
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.goto('/')
    
    // 切换到Vue示例
    await page.click('[data-testid="vue-tab"]')
    
    // 检查桌面端布局
    const form = page.locator('[data-testid="vue-form"]')
    await expect(form).toBeVisible()
    
    // 检查字段是否水平排列（在同一行）
    const fields = page.locator('.form-field')
    const firstField = fields.first()
    const secondField = fields.nth(1)
    
    const firstBox = await firstField.boundingBox()
    const secondBox = await secondField.boundingBox()
    
    // 在桌面端，字段可能在同一行
    const isInSameRow = Math.abs((firstBox?.y || 0) - (secondBox?.y || 0)) < 10
    expect(isInSameRow).toBeTruthy()
  })
})
