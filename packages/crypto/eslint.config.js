import antfu from '@antfu/eslint-config'

export default antfu({
  // 启用 TypeScript 支持
  typescript: true,
  // 启用 Vue 支持
  vue: true,
  // 启用 JSON 支持
  jsonc: false,
  // 启用 YAML 支持
  yaml: false,
  // 启用 Markdown 支持
  markdown: false,
  // 启用格式化
  formatters: false,
  // 忽略文件
  ignores: [
    'dist',
    'es',
    'lib',
    'esm',
    'cjs',
    'types',
    'node_modules',
    'coverage',
    'scripts',
    '*.d.ts',
    '*.min.js',
    'docs/**/*',
    'examples/**/*',
    'test/**/*',
    '__tests__/**/*',
    'e2e/**/*',
    'summary/**/*',
    '*.md',
    '**/*.md',
    'debug-*.js',
    'debug-*.ts',
    'temp',
    'tmp',
    '*.tmp',
    '*.temp',
    '.ldesign/**/*',
    'scripts/**/*',
    '*.config.js',
    '*.config.ts',
  ],
  // 自定义规则
  rules: {
    // TypeScript 相关
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
    }],
    '@typescript-eslint/no-explicit-any': 'warn',

    // 通用规则
    'no-console': 'warn',
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'no-unused-vars': 'off', // 使用 TypeScript 版本

    // Vue 相关
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'warn',

    // 导入相关
    'import/order': ['error', {
      groups: [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index',
      ],
      'newlines-between': 'always',
    }],

    // 代码风格
    'curly': ['error', 'multi-line'],
    'brace-style': ['error', '1tbs', { allowSingleLine: true }],
    'comma-dangle': ['error', 'always-multiline'],
    'quotes': ['error', 'single', { avoidEscape: true }],
    'semi': ['error', 'never'],

    // 安全相关
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',

    // 性能相关
    'no-loop-func': 'error',
    'no-await-in-loop': 'warn',

    // 最佳实践
    'eqeqeq': ['error', 'always'],
    'no-param-reassign': 'warn',
    'prefer-template': 'error',
    'object-shorthand': 'error',
  },
}, {
  // 测试文件特殊规则
  files: ['**/*.test.ts', '**/*.spec.ts', 'test/**/*', 'tests/**/*'],
  rules: {
    'no-console': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
})
