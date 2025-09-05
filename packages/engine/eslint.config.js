import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: true,
  ignores: [
    'dist', 'es', 'lib', 'types', 'node_modules', 'coverage', '*.d.ts',
    'docs/**/*', 'summary/**/*', 'examples/**/*', 'e2e/**/*', 'scripts/**/*', 'cjs/**/*', 'esm/**/*', 'tests/**/*', 'test/**/*', '__tests__/**/*'
  ],
  // 交给 Prettier 处理格式相关（若使用 Prettier）
  formatters: false,
  rules: {
    // 关闭与格式相关的风格规则，避免与 Prettier 冲突
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

    // 项目偏好
    'antfu/if-newline': 'off',
    'antfu/consistent-chaining': 'off',
    'antfu/consistent-list-newline': 'off',

    // 允许 console（开发期需要）
    'no-console': 'off',

    // 未使用变量：允许以下划线开头忽略
    '@typescript-eslint/no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_'
    }],

    // 逐步收敛 any 的使用，先改为警告
    '@typescript-eslint/no-explicit-any': 'warn',
  },
})
