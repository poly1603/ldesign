import { defineConfig } from '@playwright/test'

// 多框架示例应用的端到端测试配置（串行执行，逐个启动与关闭 dev server）
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 10_000 },
  use: {
    // 使用系统 Chrome，避免额外下载浏览器资源（若机器无 Chrome，请改为 chromium 并预装浏览器）
    channel: 'chrome',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    baseURL: 'http://localhost:3000',
  },
  projects: [
    {
      name: 'vue3',
      use: { baseURL: 'http://localhost:5174' },
      webServer: {
        command: 'pnpm --filter=vue3-engine-example run dev',
        url: 'http://localhost:5174',
        reuseExistingServer: true,
        timeout: 120_000,
      },
    },
    {
      name: 'vue2',
      use: { baseURL: 'http://localhost:5176' },
      webServer: {
        command: 'pnpm --filter=vue2-engine-example run dev',
        url: 'http://localhost:5176',
        reuseExistingServer: true,
        timeout: 120_000,
      },
    },
    {
      name: 'react',
      use: { baseURL: 'http://localhost:5175' },
      webServer: {
        command: 'pnpm --filter=react-engine-example run dev',
        url: 'http://localhost:5175',
        reuseExistingServer: true,
        timeout: 120_000,
      },
    },
    {
      name: 'angular',
      use: { baseURL: 'http://localhost:5179' },
      webServer: {
        command: 'pnpm --filter=@ldesign/engine-angular-example run dev',
        url: 'http://localhost:5179',
        reuseExistingServer: true,
        timeout: 180_000,
      },
    },
    {
      name: 'svelte',
      use: { baseURL: 'http://localhost:5177' },
      webServer: {
        command: 'pnpm --filter=@ldesign/engine-svelte-example run dev',
        url: 'http://localhost:5177',
        reuseExistingServer: true,
        timeout: 120_000,
      },
    },
    {
      name: 'solid',
      use: { baseURL: 'http://localhost:5178' },
      webServer: {
        command: 'pnpm --filter=@ldesign/engine-solid-example run dev',
        url: 'http://localhost:5178',
        reuseExistingServer: true,
        timeout: 120_000,
      },
    },
    {
      name: 'lit',
      use: { baseURL: 'http://localhost:5178' },
      webServer: {
        command: 'pnpm --filter=@ldesign/engine-lit-example run dev',
        url: 'http://localhost:5178',
        reuseExistingServer: true,
        timeout: 120_000,
      },
    },
    {
      name: 'preact',
      use: { baseURL: 'http://localhost:5181' },
      webServer: {
        command: 'pnpm --filter=@ldesign/engine-preact-example run dev',
        url: 'http://localhost:5181',
        reuseExistingServer: true,
        timeout: 120_000,
      },
    },
    {
      name: 'qwik',
      use: { baseURL: 'http://localhost:5180' },
      webServer: {
        command: 'pnpm --filter=@ldesign/engine-qwik-example run dev',
        url: 'http://localhost:5180',
        reuseExistingServer: true,
        timeout: 120_000,
      },
    },
  ],
})

