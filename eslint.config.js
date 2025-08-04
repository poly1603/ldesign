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
      // 忽略非 VitePress 的 Markdown 文件
      '**/*.md',
      '!docs/**/*.md',
      '!**/docs/**/*.md',
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
  {
    files: ['**/docs/**/*.md', 'docs/**/*.md'],
    rules: {
      'no-console': 'off', // 允许文档中的 console 语句
      '@typescript-eslint/no-explicit-any': 'off', // 允许文档示例中的 any 类型
    },
  },
)
