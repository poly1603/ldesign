/**
 * ESLint 配置文件
 * 
 * @ldesign/launcher 包的代码规范配置
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    // TypeScript 相关规则
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    
    // 通用规则
    'no-console': 'off', // CLI 工具需要使用 console
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    'arrow-spacing': 'error',
    'comma-dangle': ['error', 'never'],
    'semi': ['error', 'never'],
    'quotes': ['error', 'single'],
    'indent': ['error', 2],
    'no-trailing-spaces': 'error',
    'eol-last': 'error',
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'computed-property-spacing': ['error', 'never'],
    'space-before-function-paren': ['error', 'never'],
    'keyword-spacing': 'error',
    'space-infix-ops': 'error',
    'space-unary-ops': 'error',
    'spaced-comment': ['error', 'always'],
    'brace-style': ['error', '1tbs', { allowSingleLine: true }],
    'curly': ['error', 'all'],
    'dot-notation': 'error',
    'eqeqeq': ['error', 'always'],
    'no-duplicate-imports': 'error',
    'no-useless-return': 'error',
    'prefer-template': 'error'
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.spec.ts'],
      env: {
        jest: true
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off'
      }
    },
    {
      files: ['bin/**/*.js'],
      env: {
        node: true
      },
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off'
      }
    }
  ],
  ignorePatterns: [
    'dist',
    'node_modules',
    '*.d.ts',
    'docs/.vitepress/cache',
    'docs/.vitepress/dist'
  ]
}
