import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E 测试配置
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // 测试目录
  testDir: './tests/e2e',
  
  // 全局设置文件
  globalSetup: require.resolve('./tests/e2e/global-setup.ts'),
  globalTeardown: require.resolve('./tests/e2e/global-teardown.ts'),
  
  // 测试匹配模式
  testMatch: [
    '**/*.e2e.test.ts',
    '**/*.spec.ts'
  ],
  
  // 忽略模式
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**'
  ],
  
  // 并行运行测试的工作进程数
  workers: process.env.CI ? 1 : undefined,
  
  // 失败时重试次数
  retries: process.env.CI ? 2 : 0,
  
  // 单个测试的超时时间 (毫秒)
  timeout: 30 * 1000,
  
  // expect 断言的超时时间
  expect: {
    timeout: 5000
  },
  
  // 全局测试超时
  globalTimeout: 10 * 60 * 1000,
  
  // 测试输出目录
  outputDir: 'test-results/',
  
  // 是否保留视频和截图
  use: {
    // 基础 URL
    baseURL: 'http://localhost:3001',
    
    // 浏览器上下文配置
    viewport: { width: 1280, height: 720 },
    
    // 是否忽略 HTTPS 错误
    ignoreHTTPSErrors: true,
    
    // 截图配置
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true
    },
    
    // 视频录制
    video: {
      mode: 'retain-on-failure',
      size: { width: 640, height: 480 }
    },
    
    // 追踪配置
    trace: 'retain-on-failure',
    
    // 操作超时
    actionTimeout: 10 * 1000,
    
    // 导航超时
    navigationTimeout: 30 * 1000,
    
    // 用户代理
    userAgent: 'Playwright E2E Tests'
  },
  
  // 报告器配置
  reporter: [
    // 详细的控制台输出
    ['list'],
    
    // HTML 报告
    [
      'html',
      {
        outputFolder: 'playwright-report',
        open: 'never'
      }
    ],
    
    // JUnit XML 报告 (用于 CI)
    process.env.CI && [
      'junit',
      {
        outputFile: 'test-results/junit-results.xml'
      }
    ],
    
    // JSON 报告
    [
      'json',
      {
        outputFile: 'test-results/test-results.json'
      }
    ]
  ].filter(Boolean),
  
  // 项目配置 (不同浏览器/设备)
  projects: [
    // Desktop 浏览器
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
    
    // 移动端浏览器
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    
    // Microsoft Edge
    {
      name: 'Microsoft Edge',
      use: { 
        ...devices['Desktop Edge'], 
        channel: 'msedge' 
      },
    },
    
    // 自定义配置 - 高分辨率
    {
      name: 'Desktop Chrome HiDPI',
      use: {
        ...devices['Desktop Chrome HiDPI'],
        viewport: { width: 1920, height: 1080 }
      }
    }
  ],
  
  // Web 服务器配置 (如果需要启动开发服务器)
  webServer: {
    command: 'pnpm run dev:vite',
    port: 3001,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
    env: {
      NODE_ENV: 'test'
    }
  },
  
  // 测试文件的匹配选项
  forbidOnly: !!process.env.CI,
  
  // 更新快照
  updateSnapshots: 'missing',
  
  // 测试文件的元数据
  metadata: {
    package: '@ldesign/flowchart',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'test'
  }
})
