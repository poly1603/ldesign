/**
 * Lighthouse CI 配置
 * 用于性能监控和回归检测
 */

module.exports = {
  ci: {
    collect: {
      // 要测试的 URL
      url: [
        'http://localhost:5173',
        'http://localhost:5173/examples',
        'http://localhost:3000', // engine example
        'http://localhost:3001', // template example
      ],
      // 每个 URL 运行的次数
      numberOfRuns: process.env.CI ? 1 : 3,
      // 服务器启动配置
      startServerCommand: 'pnpm dev',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30000,
      // 设置
      settings: {
        // 使用桌面设备配置
        preset: process.env.CI ? 'perf' : 'desktop',
        // 禁用存储清理（加快测试速度）
        disableStorageReset: true,
        // 跳过某些审计以加快速度
        skipAudits: process.env.CI
          ? [
              'uses-http2',
              'uses-long-cache-ttl',
              'uses-text-compression',
              'render-blocking-resources',
            ]
          : [],
      },
    },
    assert: {
      // 性能断言
      assertions: {
        // 基本分数要求
        'categories:performance': [
          'warn',
          { minScore: process.env.CI ? 0.7 : 0.8 },
        ],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],

        // 性能指标
        'first-contentful-paint': [
          'error',
          { maxNumericValue: process.env.CI ? 3000 : 2000 },
        ],
        'largest-contentful-paint': [
          'error',
          { maxNumericValue: process.env.CI ? 4000 : 2500 },
        ],
        'speed-index': [
          'error',
          { maxNumericValue: process.env.CI ? 4000 : 3000 },
        ],
        'interactive': [
          'error',
          { maxNumericValue: process.env.CI ? 5000 : 3000 },
        ],
        'cumulative-layout-shift': [
          'error',
          { maxNumericValue: process.env.CI ? 0.15 : 0.1 },
        ],
        'total-blocking-time': [
          'error',
          { maxNumericValue: process.env.CI ? 500 : 300 },
        ],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
    server: {
      port: 9001,
      storage: {
        storageMethod: 'filesystem',
        storagePath: './lighthouse-results',
      },
    },
  },
}
