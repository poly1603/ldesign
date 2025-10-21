/**
 * DatePicker E2E 测试
 */

import { test, expect } from '@playwright/test';

test.describe('DatePicker E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('应该显示正确的页面标题', async ({ page }) => {
    await expect(page).toHaveTitle(/LDesign DatePicker/);
  });

  test('应该有三个标签页', async ({ page }) => {
    const tabs = page.locator('.tab-btn');
    await expect(tabs).toHaveCount(3);
    
    await expect(tabs.nth(0)).toContainText('Vue 3');
    await expect(tabs.nth(1)).toContainText('React');
    await expect(tabs.nth(2)).toContainText('Lit');
  });

  test('应该能切换标签页', async ({ page }) => {
    // 点击 React 标签
    await page.click('[data-tab="react"]');
    await expect(page.locator('#react-tab')).toHaveClass(/active/);
    
    // 点击 Lit 标签
    await page.click('[data-tab="lit"]');
    await expect(page.locator('#lit-tab')).toHaveClass(/active/);
  });

  test('Vue: 应该能打开日期选择器', async ({ page }) => {
    // 确保在 Vue 标签页
    await page.click('[data-tab="vue"]');
    
    // 点击第一个日期选择器
    const input = page.locator('.ldate-input__inner').first();
    await input.click();
    
    // 应该显示弹出面板
    await expect(page.locator('.ldate-popper')).toBeVisible();
  });

  test('Vue: 应该能选择日期', async ({ page }) => {
    await page.click('[data-tab="vue"]');
    
    const input = page.locator('.ldate-input__inner').first();
    await input.click();
    
    // 选择一个日期单元格（不是上月或下月的）
    const cell = page.locator('.ldate-cell--normal').first();
    await cell.click();
    
    // 输入框应该有值
    await expect(input).not.toHaveValue('');
  });

  test('Vue: 应该能清空日期', async ({ page }) => {
    await page.click('[data-tab="vue"]');
    
    const input = page.locator('.ldate-input__inner').first();
    await input.click();
    
    // 选择日期
    await page.locator('.ldate-cell--normal').first().click();
    
    // 点击清空按钮
    await page.hover('.ldate-input');
    await page.click('.ldate-input__suffix');
    
    // 输入框应该为空
    await expect(input).toHaveValue('');
  });

  test('React: 应该能打开和关闭日期选择器', async ({ page }) => {
    await page.click('[data-tab="react"]');
    
    const input = page.locator('.ldate-input__inner').first();
    await input.click();
    
    // 应该显示
    await expect(page.locator('.ldate-popper')).toBeVisible();
    
    // 点击外部关闭
    await page.click('body');
    await expect(page.locator('.ldate-popper')).not.toBeVisible();
  });

  test('应该能在月份和年份视图之间切换', async ({ page }) => {
    await page.click('[data-tab="vue"]');
    
    const input = page.locator('.ldate-input__inner').first();
    await input.click();
    
    // 点击头部标签切换到月份视图
    await page.click('.ldate-panel__header-label');
    await expect(page.locator('.ldate-month-panel')).toBeVisible();
    
    // 再点击切换到年份视图
    await page.click('.ldate-panel__header-label');
    await expect(page.locator('.ldate-year-panel')).toBeVisible();
  });

  test('应该能使用导航按钮', async ({ page }) => {
    await page.click('[data-tab="vue"]');
    
    const input = page.locator('.ldate-input__inner').first();
    await input.click();
    
    // 获取当前月份
    const currentMonth = await page.locator('.ldate-panel__header-label').textContent();
    
    // 点击下一月
    await page.click('.ldate-panel__arrow:last-child');
    
    // 月份应该改变
    const newMonth = await page.locator('.ldate-panel__header-label').textContent();
    expect(newMonth).not.toBe(currentMonth);
  });

  test('范围选择器应该能选择范围', async ({ page }) => {
    await page.click('[data-tab="vue"]');
    
    // 找到范围选择器
    const rangeInputs = page.locator('.ldate-range-input__inner');
    await rangeInputs.first().click();
    
    // 选择开始日期
    const cells = page.locator('.ldate-cell--normal');
    await cells.first().click();
    
    // 选择结束日期
    await cells.nth(10).click();
    
    // 两个输入框都应该有值
    await expect(rangeInputs.first()).not.toHaveValue('');
    await expect(rangeInputs.last()).not.toHaveValue('');
  });
});




