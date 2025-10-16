module.exports = {
  root: true,
  extends: [
    '@ldesign/eslint-config',
  ],
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  rules: {
    // 禁用 node 相关的 process 警告，因为我们的代码需要兼容浏览器和 Node 环境
    'node/prefer-global/process': 'off',
    
    // 允许使用 console 的某些方法
    'no-console': ['warn', { 
      allow: ['warn', 'error', 'info', 'table', 'time', 'timeEnd', 'group', 'groupEnd', 'clear'] 
    }],
    
    // 允许空代码块，但需要注释
    'no-empty': ['error', { allowEmptyCatch: true }],
    
    // 调整 TypeScript 相关规则
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    'ts/no-explicit-any': 'warn',
    'ts/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    
    // 调整 unused-imports 规则
    'unused-imports/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    
    // 对于 optional chain 的非空断言，降级为警告
    'ts/no-non-null-asserted-optional-chain': 'warn',
    
    // 禁用 unicorn/error-message，允许创建没有消息的错误（用于栈追踪）
    'unicorn/error-message': 'off',
  },
  overrides: [
    {
      files: ['*.tsx', '*.jsx'],
      rules: {
        // React/Vue 组件特定的规则调整
      },
    },
    {
      files: ['src/utils/logger.ts', 'src/debug/*.ts'],
      rules: {
        // 日志和调试文件允许更多的 console 使用
        'no-console': 'off',
      },
    },
  ],
}