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
      '**/lib/**',
      '**/types/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/.trae/**',
      // 忽略文档构建产物
      'docs/.vitepress/dist/**',
      'docs/.vitepress/cache/**',
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
  // 文档文件特殊规则
  {
    files: ['docs/**/*.md', '**/*.md'],
    rules: {
      // 在文档中允许 console.log 和 any 类型
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'import/no-duplicates': 'off',
      'format/prettier': 'off',
      // 关闭一些在 Markdown 代码块中不适用的规则
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-vars': 'off',
      'node/handle-callback-err': 'off',
      'no-debugger': 'off',
      'regexp/strict': 'off',
      'regexp/no-super-linear-backtracking': 'off',
      'regexp/optimal-quantifier-concatenation': 'off',
      'ts/no-empty-object-type': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/block-order': 'off',
      'vue/first-attribute-linebreak': 'off',
      'vue/comma-dangle': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'import/no-duplicates': 'off',
      'style/brace-style': 'off',
    },
  },
  // 示例项目特殊规则
  {
    files: ['example/**/*'],
    rules: {
      // 在示例中允许一些演示用的代码
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'vue/no-unused-refs': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      'unused-imports/no-unused-vars': 'off',
      'no-prototype-builtins': 'off',
      // 允许在示例中使用 alert
      'no-alert': 'off',
    },
  },
  // 测试文件特殊规则
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx', 'tests/**/*'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-console': 'off',
      // 测试中允许使用 any 类型
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    },
  },
  // E2E 测试特殊规则
  {
    files: ['e2e/**/*'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },
)
