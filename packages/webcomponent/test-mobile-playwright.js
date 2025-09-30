const { chromium } = require('playwright');

(async () => {
  // 启动浏览器，模拟iPhone设备
  const browser = await chromium.launch({
    headless: false,
    devtools: true
  });

  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true
  });

  const page = await context.newPage();

  // 监听控制台消息
  page.on('console', msg => {
    console.log('浏览器控制台:', msg.text());
  });

  // 访问测试页面
  await page.goto('http://localhost:3333/demo/test-mobile-drawer.html');
  
  console.log('页面已加载，等待2秒...');
  await page.waitForTimeout(2000);

  // 测试左侧抽屉
  console.log('\n测试左侧抽屉...');
  await page.click('text=左侧抽屉');
  await page.waitForTimeout(1000);

  // 截图
  await page.screenshot({ path: 'mobile-drawer-left.png', fullPage: true });
  console.log('已截图: mobile-drawer-left.png');

  // 关闭抽屉
  const leftDrawer = await page.evaluateHandle(() => document.getElementById('leftDrawer'));
  await page.evaluate((drawer) => drawer.close(), leftDrawer);
  await page.waitForTimeout(500);

  // 测试右侧抽屉
  console.log('\n测试右侧抽屉...');
  await page.click('text=右侧抽屉');
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'mobile-drawer-right.png', fullPage: true });
  console.log('已截图: mobile-drawer-right.png');

  // 保持浏览器打开以便调试
  console.log('\n浏览器保持打开状态，按 Ctrl+C 退出...');
  
  // 防止脚本立即退出
  await new Promise(() => {});
})();