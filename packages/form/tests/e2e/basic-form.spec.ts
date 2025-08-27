/**
 * 基础表单端到端测试
 */

import { test, expect } from '@playwright/test'

test.describe('基础表单功能', () => {
  test.beforeEach(async ({ page }) => {
    // 假设有一个测试页面
    await page.goto('/test-form')
  })

  test('应该正确渲染表单', async ({ page }) => {
    // 检查表单是否存在
    await expect(page.locator('.l-dynamic-form')).toBeVisible()
    
    // 检查字段是否存在
    await expect(page.locator('input[name="username"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('select[name="gender"]')).toBeVisible()
    
    // 检查按钮是否存在
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    await expect(page.locator('button[type="reset"]')).toBeVisible()
  })

  test('应该正确填写和提交表单', async ({ page }) => {
    // 填写表单
    await page.fill('input[name="username"]', 'testuser')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.selectOption('select[name="gender"]', 'male')
    
    // 提交表单
    await page.click('button[type="submit"]')
    
    // 检查提交结果
    await expect(page.locator('.success-message')).toBeVisible()
  })

  test('应该正确验证必填字段', async ({ page }) => {
    // 不填写必填字段直接提交
    await page.click('button[type="submit"]')
    
    // 检查错误信息
    await expect(page.locator('.l-form-field__error')).toBeVisible()
    await expect(page.locator('.l-form-field__error')).toContainText('用户名不能为空')
  })

  test('应该正确验证邮箱格式', async ({ page }) => {
    // 填写无效邮箱
    await page.fill('input[name="username"]', 'testuser')
    await page.fill('input[name="email"]', 'invalid-email')
    
    // 失焦触发验证
    await page.click('body')
    
    // 检查错误信息
    await expect(page.locator('.l-form-field__error')).toContainText('请输入有效的邮箱地址')
  })

  test('应该正确重置表单', async ({ page }) => {
    // 填写表单
    await page.fill('input[name="username"]', 'testuser')
    await page.fill('input[name="email"]', 'test@example.com')
    
    // 重置表单
    await page.click('button[type="reset"]')
    
    // 检查字段是否被清空
    await expect(page.locator('input[name="username"]')).toHaveValue('')
    await expect(page.locator('input[name="email"]')).toHaveValue('')
  })

  test('应该支持响应式布局', async ({ page }) => {
    // 检查桌面布局
    await page.setViewportSize({ width: 1200, height: 800 })
    const desktopColumns = await page.locator('.l-dynamic-form__fields').evaluate(
      el => getComputedStyle(el).gridTemplateColumns
    )
    expect(desktopColumns).toContain('repeat(3, 1fr)')
    
    // 检查移动端布局
    await page.setViewportSize({ width: 400, height: 800 })
    await page.waitForTimeout(100) // 等待布局调整
    const mobileColumns = await page.locator('.l-dynamic-form__fields').evaluate(
      el => getComputedStyle(el).gridTemplateColumns
    )
    expect(mobileColumns).toContain('repeat(1, 1fr)')
  })

  test('应该支持字段联动', async ({ page }) => {
    // 假设有一个显示/隐藏字段的联动
    await page.check('input[name="showAdvanced"]')
    
    // 检查高级字段是否显示
    await expect(page.locator('input[name="advancedField"]')).toBeVisible()
    
    // 取消选择
    await page.uncheck('input[name="showAdvanced"]')
    
    // 检查高级字段是否隐藏
    await expect(page.locator('input[name="advancedField"]')).toBeHidden()
  })

  test('应该支持文件上传', async ({ page }) => {
    // 创建测试文件
    const fileContent = 'test file content'
    const fileName = 'test.txt'
    
    // 上传文件
    await page.setInputFiles('input[type="file"]', {
      name: fileName,
      mimeType: 'text/plain',
      buffer: Buffer.from(fileContent)
    })
    
    // 检查文件是否上传成功
    await expect(page.locator('.l-form-upload__item')).toBeVisible()
    await expect(page.locator('.l-form-upload__item-name')).toContainText(fileName)
  })

  test('应该支持日期选择', async ({ page }) => {
    // 点击日期选择器
    await page.click('input[name="birthDate"]')
    
    // 检查日期面板是否显示
    await expect(page.locator('.l-form-date-picker__panel')).toBeVisible()
    
    // 选择今天
    await page.click('button:has-text("选择今天")')
    
    // 检查日期是否被设置
    const today = new Date().toISOString().split('T')[0]
    await expect(page.locator('input[name="birthDate"]')).toHaveValue(today)
  })

  test('应该支持开关组件', async ({ page }) => {
    // 检查开关初始状态
    const switchElement = page.locator('.l-form-switch input')
    await expect(switchElement).not.toBeChecked()
    
    // 点击开关
    await page.click('.l-form-switch')
    
    // 检查开关状态
    await expect(switchElement).toBeChecked()
    await expect(page.locator('.l-form-switch')).toHaveClass(/l-form-switch--checked/)
  })

  test('应该支持表单加载状态', async ({ page }) => {
    // 模拟加载状态
    await page.evaluate(() => {
      // 假设有一个设置加载状态的方法
      window.setFormLoading(true)
    })
    
    // 检查加载状态
    await expect(page.locator('.l-dynamic-form--loading')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeDisabled()
  })

  test('应该支持表单调试面板', async ({ page }) => {
    // 启用调试模式
    await page.evaluate(() => {
      window.enableFormDebug(true)
    })
    
    // 检查调试面板
    await expect(page.locator('.l-form-debug-panel')).toBeVisible()
    
    // 检查调试信息
    await expect(page.locator('.l-form-debug-panel__title')).toContainText('表单调试面板')
    
    // 切换到数据面板
    await page.click('button:has-text("数据")')
    await expect(page.locator('.l-form-debug-panel__code')).toBeVisible()
  })
})
