import antfu from '@antfu/eslint-config'

export default antfu(
  {
    typescript: true,
    vue: true,
    ignores: [
      'dist',
      'es',
      'types',
      'node_modules',
      'coverage',
      'docs/.vitepress/dist',
      'docs/.vitepress/cache',
      'playwright-report',
      'test-results',
    ],
  },
  {
    rules: {
      'no-console': 'warn',
      'no-debugger': 'warn',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'vue/multi-word-component-names': 'off',
    },
  },
)