/**
 * Jest 配置文件
 * 
 * 为 Stencil 组件库配置 Jest 测试环境
 * 支持单元测试、集成测试和覆盖率报告
 */

module.exports = {
  // 测试环境
  testEnvironment: 'jsdom',
  
  // 模块文件扩展名
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // 转换配置
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  
  // 测试文件匹配模式
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx|js)',
  ],
  
  // 忽略的文件和目录
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/www/',
    '<rootDir>/loader/',
  ],
  
  // 模块路径映射
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
  },
  
  // 设置文件
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  
  // 覆盖率配置
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.spec.{ts,tsx}',
    '!src/**/*.e2e.{ts,tsx}',
    '!src/test-setup.ts',
    '!src/global/global.ts',
    '!src/index.ts',
  ],
  
  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  // 覆盖率报告格式
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  
  // 覆盖率输出目录
  coverageDirectory: 'coverage',
  
  // 全局变量
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  
  // 模块目录
  moduleDirectories: ['node_modules', 'src'],
  
  // 清除模拟
  clearMocks: true,
  
  // 恢复模拟
  restoreMocks: true,
  
  // 详细输出
  verbose: true,
  
  // 测试超时
  testTimeout: 10000,
  
  // 错误时停止
  bail: false,
  
  // 最大工作进程数
  maxWorkers: '50%',
  
  // 缓存目录
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',
};
