module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
    worker: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    // TypeScript 严格规则
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/prefer-readonly': 'error',
    '@typescript-eslint/prefer-readonly-parameter-types': 'off', // 可能过于严格
    '@typescript-eslint/strict-boolean-expressions': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/require-await': 'error',
    '@typescript-eslint/return-await': 'error',

    // 禁止使用 Function 类型
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {
          'Function': {
            message: 'Use specific function type instead of Function',
            fixWith: '(...args: any[]) => any',
          },
          '{}': {
            message: 'Use Record<string, unknown> instead of {}',
            fixWith: 'Record<string, unknown>',
          },
          'object': {
            message: 'Use Record<string, unknown> instead of object',
            fixWith: 'Record<string, unknown>',
          },
        },
      },
    ],

    // 控制台使用规则
    'no-console': [
      'error',
      {
        allow: ['warn', 'error'],
      },
    ],

    // 代码质量规则
    'prefer-const': 'error',
    'no-var': 'error',
    'no-let-global': 'off',
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'brace-style': ['error', '1tbs'],
    'comma-dangle': ['error', 'never'],
    'quotes': ['error', 'single', { avoidEscape: true }],
    'semi': ['error', 'never'],
    'indent': ['error', 2],
    'max-len': [
      'error',
      {
        code: 100,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      },
    ],

    // 导入规则
    'sort-imports': [
      'error',
      {
        ignoreCase: true,
        ignoreDeclarationSort: true,
      },
    ],

    // 错误处理
    'no-throw-literal': 'error',
    'prefer-promise-reject-errors': 'error',

    // 性能相关
    'no-await-in-loop': 'warn',
    'require-atomic-updates': 'error',

    // 安全相关
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.spec.ts'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-any': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
      },
    },
    {
      files: ['**/*.worker.ts'],
      env: {
        worker: true,
        browser: false,
      },
      globals: {
        self: 'readonly',
        importScripts: 'readonly',
      },
    },
  ],
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.js',
    '*.d.ts',
  ],
}
