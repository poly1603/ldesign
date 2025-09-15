/**
 * Vitest性能测试配置
 */

import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    // 性能测试环境配置
    environment: 'node',
    
    // 测试文件匹配模式
    include: ['tests/performance/**/*.test.ts'],
    
    // 排除普通单元测试
    exclude: [
      'tests/unit/**/*',
      'tests/e2e/**/*',
      'node_modules/**/*'
    ],
    
    // 性能测试超时配置
    testTimeout: 60000, // 60秒
    hookTimeout: 30000, // 30秒
    
    // 性能测试不需要并发
    threads: false,
    
    // 性能测试报告配置
    reporter: [
      'verbose',
      'json',
      'html'
    ],
    
    // 输出目录
    outputFile: {
      json: './performance-test-results.json',
      html: './performance-test-results.html'
    },
    
    // 全局设置
    globals: true,
    
    // 性能测试不需要覆盖率
    coverage: {
      enabled: false
    },
    
    // 性能测试专用设置
    benchmark: {
      include: ['tests/performance/**/*.bench.ts'],
      exclude: ['node_modules/**/*'],
      reporter: ['verbose', 'json'],
      outputFile: './benchmark-results.json'
    }
  },
  
  // 解析配置
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@tests': resolve(__dirname, 'tests')
    }
  },
  
  // 定义全局变量
  define: {
    __PERFORMANCE_TEST__: true,
    __TEST_ENV__: '"performance"'
  }
})
