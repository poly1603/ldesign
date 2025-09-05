import antfu from '@antfu/eslint-config'

export default antfu(
  {
    vue: true,
    typescript: true,
    formatters: true,
    ignores: [
      '**/dist/**',
      '**/es/**',
      '**/cjs/**',
      '**/types/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/.trae/**',
      // 忽略所有 Markdown 文件中的代码块
      '**/*.md',
      // 仅对 kit 包额外忽略 docs 与 examples
      'packages/kit/docs/**',
      'packages/kit/examples/**',
    ],
  },
  {
    rules: {
      'no-console': 'warn',
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  // 针对 @ldesign/kit 的专属覆盖：关闭不合适的 Node 全局首选规则
  {
    files: ['packages/kit/**/*.{ts,js,tsx,jsx}'],
    rules: {
      'node/prefer-global/process': 'off',
      'node/prefer-global/buffer': 'off',
      'n/prefer-global/process': 'off',
      'n/prefer-global/buffer': 'off',
    },
  },
)
