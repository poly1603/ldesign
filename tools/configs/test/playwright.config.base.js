import { defineConfig, devices } from '@playwright/test'

/**
 * 创建基础的 Playwright 配置
 * @param {object} options 配置选项
 * @param {string} [options.testDir] 测试目录
 * @param {string} [options.baseURL] 基础 URL
 * @param {object} [options.webServer] 开发服务器配置
 * @param {string[]} [options.projects] 测试项目（浏览器）
 * @param {number} [options.retries] 重试次数
 * @param {number} [options.workers] 并发数
 * @param {number} [options.timeout] 超时时间
 * @param {object} [options.use] 使用配置
 */
export function createPlaywrightConfig(options = {}) {
  const {
    testDir = './e2e',
    baseURL = 'http://localhost:5173',
    webServer,
    projects = ['chromium', 'firefox', 'webkit'],
    retries,
    workers,
    timeout = 30000,
    use = {},
  } = options

  const projectConfigs = []

  // 桌面浏览器
  if (projects.includes('chromium')) {
    projectConfigs.push({
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    })
  }

  if (projects.includes('firefox')) {
    projectConfigs.push({
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    })
  }

  if (projects.includes('webkit')) {
    projectConfigs.push({
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    })
  }

  // 移动端浏览器
  if (projects.includes('mobile')) {
    projectConfigs.push(
      {
        name: 'Mobile Chrome',
        use: { ...devices['Pixel 5'] },
      },
      {
        name: 'Mobile Safari',
        use: { ...devices['iPhone 12'] },
      },
    )
  }

  const config = {
    testDir,
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: retries ?? (process.env.CI ? 2 : 0),
    workers: workers ?? (process.env.CI ? 1 : undefined),
    timeout,
    reporter: [
      ['html'],
      ['json', { outputFile: 'playwright-report/results.json' }],
      ['junit', { outputFile: 'playwright-report/results.xml' }],
    ],
    use: {
      baseURL,
      trace: use.trace ?? 'on-first-retry',
      screenshot: use.screenshot ?? 'only-on-failure',
      video: use.video ?? 'retain-on-failure',
    },
    projects: projectConfigs,
  }

  // 添加 webServer 配置
  if (webServer) {
    config.webServer = {
      command: webServer.command,
      port: webServer.port,
      cwd: webServer.cwd,
      timeout: webServer.timeout ?? 120000,
      reuseExistingServer: !process.env.CI,
    }
  }

  return config
}

/**
 * 默认配置
 */
export default defineConfig(createPlaywrightConfig())
