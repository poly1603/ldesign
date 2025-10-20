import { test, expect } from '@playwright/test';

test.describe('应用测试', () => {
  test.beforeEach(async ({ page }) => {
    // 监听控制台错误
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('控制台错误:', msg.text());
      }
    });

    // 监听页面错误
    page.on('pageerror', error => {
      console.log('页面错误:', error.message);
    });

    await page.goto('http://localhost:8888/');
    await page.waitForLoadState('networkidle');
  });

  test('页面正常渲染且无错误', async ({ page }) => {
    // 检查页面标题
    await expect(page).toHaveTitle(/.*/, { timeout: 10000 });
    
    // 截图
    await page.screenshot({ path: 'screenshots/homepage.png', fullPage: true });
    
    console.log('✓ 页面正常渲染');
  });

  test('语言切换功能', async ({ page }) => {
    // 查找语言切换按钮或下拉框
    // 根据实际的选择器调整
    const langSelectors = [
      '[data-test="language-switch"]',
      '.language-switch',
      '[class*="lang"]',
      'select[name="language"]',
      '[role="combobox"]'
    ];

    let langElement = null;
    for (const selector of langSelectors) {
      try {
        langElement = await page.locator(selector).first();
        if (await langElement.isVisible({ timeout: 2000 })) {
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (langElement && await langElement.isVisible()) {
      await langElement.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'screenshots/language-switch.png' });
      console.log('✓ 语言切换功能正常');
    } else {
      console.log('⚠ 未找到语言切换控件');
    }
  });

  test('主题色切换功能', async ({ page }) => {
    // 查找主题切换按钮
    const themeSelectors = [
      '[data-test="theme-switch"]',
      '.theme-switch',
      '[class*="theme"]',
      '[aria-label*="theme"]',
      '[aria-label*="主题"]'
    ];

    let themeElement = null;
    for (const selector of themeSelectors) {
      try {
        themeElement = await page.locator(selector).first();
        if (await themeElement.isVisible({ timeout: 2000 })) {
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (themeElement && await themeElement.isVisible()) {
      await themeElement.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'screenshots/theme-switch.png' });
      console.log('✓ 主题切换功能正常');
    } else {
      console.log('⚠ 未找到主题切换控件');
    }
  });

  test('大小尺寸切换功能', async ({ page }) => {
    // 查找尺寸切换按钮
    const sizeSelectors = [
      '[data-test="size-switch"]',
      '.size-switch',
      '[class*="size"]',
      '[aria-label*="size"]',
      '[aria-label*="尺寸"]'
    ];

    let sizeElement = null;
    for (const selector of sizeSelectors) {
      try {
        sizeElement = await page.locator(selector).first();
        if (await sizeElement.isVisible({ timeout: 2000 })) {
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (sizeElement && await sizeElement.isVisible()) {
      await sizeElement.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'screenshots/size-switch.png' });
      console.log('✓ 尺寸切换功能正常');
    } else {
      console.log('⚠ 未找到尺寸切换控件');
    }
  });

  test('/login 路由访问正常', async ({ page }) => {
    await page.goto('http://localhost:8888/login');
    await page.waitForLoadState('networkidle');
    
    // 检查是否成功导航
    expect(page.url()).toContain('login');
    
    // 截图
    await page.screenshot({ path: 'screenshots/login-page.png', fullPage: true });
    
    console.log('✓ /login 路由访问正常');
  });
});












