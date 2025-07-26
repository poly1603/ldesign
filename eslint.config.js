import antfu from '@antfu/eslint-config'

export default antfu(
  {
    vue: true,
    typescript: true,
    jsx: true,
    formatters: false, // 禁用格式化器，使用 Prettier
    ignores: [
      'dist',
      'node_modules',
      '*.d.ts',
      'coverage',
      'docs/.vitepress/cache',
      'docs/.vitepress/dist',
    ],
  },
  {
    rules: {
      // 通用规则
      'no-console': 'off', // 允许 console 语句
      'no-debugger': 'error',
      'prefer-const': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',

      // 禁用一些严格的规则
      'node/prefer-global/process': 'off',
      'style/indent': 'off',
      'jsonc/sort-keys': 'off',
      'no-fallthrough': 'off',
      'regexp/no-super-linear-backtracking': 'off',
      'antfu/no-top-level-await': 'off',
      'no-case-declarations': 'off',
      'unused-imports/no-unused-vars': 'off',
    },
  }
)
