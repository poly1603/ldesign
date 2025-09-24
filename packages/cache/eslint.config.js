/**
 * ESLint 配置文件
 *
 * 基于 @antfu/eslint-config 的严格配置，适用于 TypeScript 项目
 */
import antfu from '@antfu/eslint-config'

export default antfu({
  // 基础配置
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  vue: false,

  // 忽略文件和目录
  ignores: [
    // 构建输出
    'dist/**',
    'es/**',
    'lib/**',
    'types/**',
    'coverage/**',
    '.rollup.cache/**',

    // 依赖和配置
    'node_modules/**',
    '*.d.ts',
    'tsconfig*.json',
    '.ldesign/**',
    '*.config.*',

    // 文档和示例
    'docs/**/*',
    'examples/**/*',
    'summary/**/*',
    'mindmap.md',
    'README.md',
    'FEATURES.md',
    'codecov.yml',

    // 测试相关
    '__tests__/**/*',
    'tests/**/*',
    'test-results.json',
    'junit.xml',

    // 脚本和工具
    'scripts/**/*',
    'benchmark.config.js',
    'playwright.config.ts',
    'vitest.config*.ts',

    // 包管理和配置
    'package.json',
    'pnpm-lock.yaml',
    '.prettierrc.json',
    '.prettierignore',
    '.editorconfig',
    '.lintstagedrc.json',
    '.nycrc.json',
    '.size-limit.json',
  ],

  // Markdown 文件特殊规则
  markdown: {
    overrides: {
      'no-restricted-globals': 'off',
      'ts/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'off',
      'no-console': 'off',
    },
  },

  // 自定义规则
  rules: {
    // 代码风格
    'style/no-trailing-spaces': 'off',
    'style/no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1, maxBOF: 0 }],
    'style/indent': ['error', 2],
    'style/quotes': ['error', 'single'],
    'style/semi': ['error', 'never'],

    // TypeScript 规则
    'ts/no-explicit-any': 'warn',
    'ts/no-non-null-assertion': 'warn',
    'ts/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

    // 导入规则
    'import/order': ['error', {
      'groups': [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index',
      ],
      'newlines-between': 'always',
    }],
    'unused-imports/no-unused-imports': 'error',

    // 代码质量
    'no-console': 'warn',
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': 'error',
    'curly': 'error',

    // 注释规则
    'spaced-comment': ['error', 'always', {
      'line': { 'markers': ['/'] },
      'block': { 'markers': ['*'], 'balanced': true },
    }],
  },

  // 特定文件覆盖规则
  overrides: [
    {
      files: ['**/__tests__/**/*', '**/*.test.*', '**/*.spec.*'],
      rules: {
        'no-console': 'off',
        'ts/no-explicit-any': 'off',
        'ts/no-non-null-assertion': 'off',
      },
    },
    {
      files: ['**/*.config.*', '**/scripts/**/*'],
      rules: {
        'no-console': 'off',
        'ts/no-var-requires': 'off',
      },
    },
  ],
})
