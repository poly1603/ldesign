const { chromium } = require('playwright');

(async () => {
  console.log('Starting simple mobile drawer test...');
  
  const browser = await chromium.launch({
    headless: false,
    devtools: true
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });

    const page = await context.newPage();
    
    // Navigate to test page
    console.log('Navigating to test page...');
    await page.goto('http://localhost:3333/demo/test-mobile-drawer.html');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Test left drawer with percentage size
    console.log('Testing left drawer (80% width)...');
    await page.click('#test-left');
    await page.waitForTimeout(2000);
    
    // Get drawer panel computed styles
    const leftDrawerStyles = await page.evaluate(() => {
      const drawer = document.querySelector('#drawer-left');
      if (!drawer) return null;
      const panel = drawer.shadowRoot?.querySelector('.drawer-panel');
      if (!panel) return null;
      const computed = window.getComputedStyle(panel);
      return {
        width: computed.width,
        height: computed.height,
        display: computed.display,
        position: computed.position,
        left: computed.left,
        transform: computed.transform,
        background: computed.backgroundColor
      };
    });
    
    console.log('Left drawer panel styles:', leftDrawerStyles);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'mobile-drawer-left.png',
      fullPage: true 
    });
    
    // Close drawer
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
    // Test right drawer with pixel size
    console.log('Testing right drawer (300px width)...');
    await page.click('#test-right');
    await page.waitForTimeout(2000);
    
    const rightDrawerStyles = await page.evaluate(() => {
      const drawer = document.querySelector('#drawer-right');
      if (!drawer) return null;
      const panel = drawer.shadowRoot?.querySelector('.drawer-panel');
      if (!panel) return null;
      const computed = window.getComputedStyle(panel);
      return {
        width: computed.width,
        height: computed.height,
        display: computed.display,
        position: computed.position,
        right: computed.right,
        transform: computed.transform,
        background: computed.backgroundColor
      };
    });
    
    console.log('Right drawer panel styles:', rightDrawerStyles);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'mobile-drawer-right.png',
      fullPage: true 
    });
    
    console.log('Test completed. Screenshots saved.');
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    // Keep browser open for manual inspection
    console.log('Browser will remain open for inspection. Press Ctrl+C to exit.');
  }
})();