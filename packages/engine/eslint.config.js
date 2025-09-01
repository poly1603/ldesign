import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: true,
  ignores: ['dist', 'es', 'lib', 'types', 'node_modules', 'coverage', '*.d.ts', 'docs/**/*', 'summary/**/*', 'examples/**/*', 'e2e/**/*', 'scripts/**/*', 'cjs/**/*', 'esm/**/*'],
  formatters: false, // 禁用 antfu 的格式化规则，使用 Prettier
  rules: {
    // 禁用与 Prettier 冲突的样式规则
    'style/brace-style': 'off',
    'style/comma-dangle': 'off',
    'style/indent': 'off',
    'style/indent-binary-ops': 'off',
    'style/member-delimiter-style': 'off',
    'style/operator-linebreak': 'off',
    'style/arrow-parens': 'off',
    'style/quotes': 'off',
    'style/quote-props': 'off',
    'style/lines-between-class-members': 'off',

    // 保留一些重要的代码质量规则
    'antfu/if-newline': 'off', // 这个规则与 Prettier 冲突
    'antfu/consistent-chaining': 'off', // 这个规则与 Prettier 冲突
    'antfu/consistent-list-newline': 'off', // 这个规则与 Prettier 冲突

    // 允许 console 方法（在开发环境中）
    'no-console': 'off',

    // 允许未使用的变量（如果以 _ 开头）
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_'
    }],
  },
})
