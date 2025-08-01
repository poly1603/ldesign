import { defineConfig, devices, PlaywrightTestConfig } from '@playwright/test'

/**
 * 创建基础的 Playwright 配置
 * @param options 配置选项
 */
export function createPlaywrightConfig(options: {
  testDir?: string
  baseURL?: string
  webServer?: {
    command: string
    port: number
    cwd?: string
  }
  projects?: string[]
} = {}): PlaywrightTestConfig {
  const {
    testDir = './e2e',
    baseURL = 'http://localhost:5173',
    webServer,
    projects = ['chromium', 'firefox', 'webkit']
  } = options

  const projectConfigs = []

  // 桌面浏览器
  if (projects.includes('chromium')) {
    projectConfigs.push({
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    })
  }

  if (projects.includes('firefox')) {
    projectConfigs.push({
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    })
  }

  if (projects.includes('webkit')) {
    projectConfigs.push({
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    })
  }

  // 移动端浏览器
  if (projects.includes('mobile')) {
    projectConfigs.push(
      {
        name: 'Mobile Chrome',
        use: { ...devices['Pixel 5'] }
      },
      {
        name: 'Mobile Safari',
        use: { ...devices['iPhone 12'] }
      }
    )
  }

  const config: PlaywrightTestConfig = {
    testDir,
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
      ['html'],
      ['json', { outputFile: 'playwright-report/results.json' }],
      ['junit', { outputFile: 'playwright-report/results.xml' }]
    ],
    use: {
      baseURL,
      trace: 'on-first-retry',
      screenshot: 'only-on-failure',
      video: 'retain-on-failure'
    },
    projects: projectConfigs
  }

  // 添加 webServer 配置
  if (webServer) {
    config.webServer = {
      command: webServer.command,
      port: webServer.port,
      cwd: webServer.cwd,
      reuseExistingServer: !process.env.CI
    }
  }

  return config
}

/**
 * 默认配置
 */
export default defineConfig(createPlaywrightConfig())
