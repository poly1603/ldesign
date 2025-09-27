import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');
  
  // Launch browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for dev server to be ready
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';
    console.log(`⏳ Waiting for dev server at ${baseURL}...`);
    
    let retries = 30;
    while (retries > 0) {
      try {
        await page.goto(baseURL, { timeout: 5000 });
        console.log('✅ Dev server is ready!');
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw new Error(`Dev server not ready after 30 attempts: ${error}`);
        }
        await page.waitForTimeout(2000);
      }
    }
    
    // Perform any global setup tasks here
    // For example: seed test data, authenticate, etc.
    
  } finally {
    await browser.close();
  }
  
  console.log('✅ Global setup completed!');
}

export default globalSetup;
