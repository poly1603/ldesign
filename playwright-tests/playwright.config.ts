import { defineConfig, devices } from '@playwright/test'

// 独立的测试配置：不启动任何 webServer，直接命中已运行的 5179 / 5181
export default defineConfig({
  testDir: './',
  fullyParallel: true,
  reporter: 'list',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  // 仅跑桌面 Chrome，足够覆盖验证
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], headless: true },
    },
  ],
  use: {
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
})

