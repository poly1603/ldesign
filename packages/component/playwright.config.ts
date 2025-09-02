/**
 * Playwright E2E 测试配置
 * 
 * 配置端到端测试环境，支持多浏览器测试和视觉回归测试
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // 测试目录
  testDir: './src',
  
  // 测试文件匹配模式
  testMatch: '**/*.e2e.ts',
  
  // 全局设置
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // 报告配置
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['junit', { outputFile: 'playwright-report/results.xml' }],
    process.env.CI ? ['github'] : ['list'],
  ],
  
  // 全局配置
  use: {
    // 基础 URL
    baseURL: 'http://localhost:3333',
    
    // 浏览器配置
    headless: !!process.env.CI,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // 截图配置
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // 追踪配置
    trace: 'on-first-retry',
    
    // 等待配置
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  
  // 项目配置
  projects: [
    // 桌面浏览器
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // 移动设备
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    
    // 平板设备
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] },
    },
  ],
  
  // 输出目录
  outputDir: 'test-results/',
  
  // Web 服务器配置
  webServer: {
    command: 'npm run start',
    port: 3333,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  
  // 期望配置
  expect: {
    // 视觉比较阈值
    threshold: 0.2,
    
    // 超时配置
    timeout: 5000,
  },
  
  // 全局设置和清理
  globalSetup: require.resolve('./src/test/global-setup.ts'),
  globalTeardown: require.resolve('./src/test/global-teardown.ts'),
});
