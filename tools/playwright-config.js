import { defineConfig, devices } from '@playwright/test'
import { resolve } from 'node:path'

/**
 * 创建标准化的Playwright配置
 * @param {Object} options 配置选项
 * @param {string} options.packageDir 包目录路径
 * @param {number} options.port 开发服务器端口
 * @param {string} options.baseURL 基础URL
 * @returns {Object} Playwright配置
 */
export function createPlaywrightConfig(options = {}) {
  const {
    packageDir = process.cwd(),
    port = 5173,
    baseURL = `http://localhost:${port}`
  } = options

  return defineConfig({
    testDir: resolve(packageDir, 'e2e'),
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
      ['html', { outputFolder: resolve(packageDir, 'playwright-report') }],
      ['json', { outputFile: resolve(packageDir, 'test-results/results.json') }],
      ['junit', { outputFile: resolve(packageDir, 'test-results/results.xml') }]
    ],
    use: {
      baseURL,
      trace: 'on-first-retry',
      screenshot: 'only-on-failure',
      video: 'retain-on-failure'
    },
    projects: [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] }
      },
      {
        name: 'firefox',
        use: { ...devices['Desktop Firefox'] }
      },
      {
        name: 'webkit',
        use: { ...devices['Desktop Safari'] }
      },
      {
        name: 'Mobile Chrome',
        use: { ...devices['Pixel 5'] }
      },
      {
        name: 'Mobile Safari',
        use: { ...devices['iPhone 12'] }
      }
    ],
    webServer: {
      command: 'pnpm dev',
      port,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000
    },
    outputDir: resolve(packageDir, 'test-results'),
    timeout: 30 * 1000,
    expect: {
      timeout: 5 * 1000
    },
    globalSetup: resolve(packageDir, 'e2e/global-setup.ts'),
    globalTeardown: resolve(packageDir, 'e2e/global-teardown.ts')
  })
}

/**
 * 默认Playwright配置
 */
export default createPlaywrightConfig()