import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'lib',
    typescript: true,
    vue: true,
    formatters: true,
    stylistic: {
      indent: 2,
      quotes: 'single',
    },
  },
  {
    files: ['**/*.ts', '**/*.vue'],
    rules: {
      'no-console': 'warn',
      'no-debugger': 'warn',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      'vue/multi-word-component-names': 'off',
      // 装饰器相关规则
      '@typescript-eslint/no-unsafe-declaration-merging': 'off',
      '@typescript-eslint/ban-types': 'off',
    },
  },
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    ignores: [
      'dist',
      'es',
      'lib',
      'types',
      'node_modules',
      'coverage',
      'docs/.vitepress/dist',
      'examples/*/dist',
      'examples/*/node_modules',
    ],
  },
)
