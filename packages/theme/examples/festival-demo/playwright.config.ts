/**
 * @ldesign/theme - Playwright E2E 测试配置
 */

import { defineConfig, devices } from '@playwright/test'

/**
 * 从环境变量读取配置
 */
const CI = !!process.env.CI
const PORT = process.env.PORT || 5173

export default defineConfig({
  testDir: './tests/e2e',

  /* 并行运行测试 */
  fullyParallel: true,

  /* 在 CI 环境中禁止重试失败的测试 */
  forbidOnly: CI,

  /* 在 CI 环境中重试失败的测试 */
  retries: CI ? 2 : 0,

  /* 在 CI 环境中限制并发数 */
  workers: CI ? 1 : undefined,

  /* 测试报告配置 */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    CI ? ['github'] : ['list'],
  ],

  /* 全局测试配置 */
  use: {
    /* 基础 URL */
    baseURL: `http://localhost:${PORT}`,

    /* 收集失败测试的追踪信息 */
    trace: 'on-first-retry',

    /* 截图配置 */
    screenshot: 'only-on-failure',

    /* 视频录制 */
    video: 'retain-on-failure',

    /* 浏览器上下文配置 */
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    /* 等待策略 */
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  /* 测试项目配置 */
  projects: [
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

    /* 移动端测试 */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* 平板端测试 */
    {
      name: 'Tablet',
      use: { ...devices['iPad Pro'] },
    },
  ],

  /* 开发服务器配置 */
  webServer: {
    command: 'npm run dev',
    port: Number(PORT),
    reuseExistingServer: !CI,
    timeout: 120000,
  },

  /* 输出目录 */
  outputDir: 'test-results/',

  /* 全局设置 */
  globalSetup: require.resolve('./tests/global-setup.ts'),
  globalTeardown: require.resolve('./tests/global-teardown.ts'),

  /* 测试超时 */
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
})
