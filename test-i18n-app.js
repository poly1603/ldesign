/**
 * 测试应用的多语言功能
 * 使用 Playwright 自动化测试语言切换
 */

import { chromium } from 'playwright';

async function testI18nApp() {
  console.log('🚀 开始测试应用的多语言功能...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // 减慢操作速度以便观察
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. 导航到应用
    console.log('📱 导航到应用...');
    await page.goto('http://localhost:8889/');
    await page.waitForLoadState('networkidle');
    
    // 2. 检查页面是否正确加载
    console.log('✅ 检查页面加载状态...');
    const title = await page.textContent('h1');
    console.log('页面标题:', title);
    
    // 3. 查找语言切换器
    console.log('🔍 查找语言切换器...');
    
    // 尝试不同的选择器来找到语言切换器
    const languageSwitchers = [
      '[data-testid="language-switcher"]',
      '.language-switcher',
      'button[aria-label*="language"]',
      'button[aria-label*="语言"]',
      'select[aria-label*="language"]',
      'select[aria-label*="语言"]',
      '.app-controls button',
      '.app-controls select'
    ];
    
    let switcher = null;
    for (const selector of languageSwitchers) {
      try {
        switcher = await page.$(selector);
        if (switcher) {
          console.log(`找到语言切换器: ${selector}`);
          break;
        }
      } catch (e) {
        // 继续尝试下一个选择器
      }
    }
    
    if (!switcher) {
      console.log('⚠️ 未找到语言切换器，尝试查找所有按钮...');
      const buttons = await page.$$('button');
      console.log(`找到 ${buttons.length} 个按钮`);
      
      for (let i = 0; i < buttons.length; i++) {
        const buttonText = await buttons[i].textContent();
        const buttonClass = await buttons[i].getAttribute('class');
        console.log(`按钮 ${i + 1}: "${buttonText}" (class: ${buttonClass})`);
      }
    }
    
    // 4. 截图当前状态
    console.log('📸 截图当前页面状态...');
    await page.screenshot({ path: 'app-initial-state.png', fullPage: true });
    
    // 5. 检查当前语言内容
    console.log('🌐 检查当前语言内容...');
    const navHome = await page.textContent('.nav-link[href="/"]').catch(() => '未找到');
    const navLogin = await page.textContent('.nav-link[href="/login"]').catch(() => '未找到');
    const footerText = await page.textContent('.app-footer p').catch(() => '未找到');
    
    console.log('导航-首页:', navHome);
    console.log('导航-登录:', navLogin);
    console.log('底部文本:', footerText);
    
    // 6. 尝试手动切换语言（如果找到了切换器）
    if (switcher) {
      console.log('🔄 尝试切换语言...');
      await switcher.click();
      await page.waitForTimeout(2000);
      
      // 检查语言切换后的内容
      const newNavHome = await page.textContent('.nav-link[href="/"]').catch(() => '未找到');
      const newNavLogin = await page.textContent('.nav-link[href="/login"]').catch(() => '未找到');
      const newFooterText = await page.textContent('.app-footer p').catch(() => '未找到');
      
      console.log('切换后-导航-首页:', newNavHome);
      console.log('切换后-导航-登录:', newNavLogin);
      console.log('切换后-底部文本:', newFooterText);
      
      // 截图切换后的状态
      await page.screenshot({ path: 'app-language-switched.png', fullPage: true });
    }
    
    // 7. 检查控制台错误
    console.log('🔍 检查控制台错误...');
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(`❌ 控制台错误: ${msg.text()}`);
      }
    });
    
    await page.waitForTimeout(3000);
    
    if (logs.length > 0) {
      console.log('发现控制台错误:');
      logs.forEach(log => console.log(log));
    } else {
      console.log('✅ 无控制台错误');
    }
    
    console.log('✅ 多语言功能测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  } finally {
    await browser.close();
  }
}

// 运行测试
testI18nApp().catch(console.error);
