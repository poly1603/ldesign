import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: true,
  ignores: [
    'dist',
    'es',
    'esm',
    'cjs',
    'lib',
    'types',
    'node_modules',
    'coverage',
    'playwright-report',
    'test-results',
    '*.d.ts',
    '**/*.js.map',
    '**/_virtual/**',
    'docs/**/*.md',
    'examples/**/*.md',
    'summary/**/*.md',
    'README.md',
    'DOCUMENTATION_SUMMARY.md',
  ],
  rules: {
    // 允许 console 在示例和测试中使用
    'no-console': 'off',
    // 允许 alert 在示例中使用
    'no-alert': 'off',
    // 允许空对象类型在类型定义中使用
    'ts/no-empty-object-type': 'off',
    // 允许 Function 类型在某些情况下使用
    'ts/no-unsafe-function-type': 'off',
    // 允许构造函数名小写（用于工厂函数）
    'new-cap': 'off',
    // 允许未使用的表达式（在测试中）
    'ts/no-unused-expressions': 'off',
    // 允许未使用的变量（在测试中）
    'unused-imports/no-unused-vars': 'off',
    // 允许方法签名风格
    'ts/method-signature-style': 'off',
    // 允许使用 process
    'node/prefer-global/process': 'off',
    // 关闭一些格式化规则，让 Prettier 处理
    'style/brace-style': 'off',
    'style/comma-dangle': 'off',
    'style/semi': 'off',
    'style/arrow-parens': 'off',
    'style/operator-linebreak': 'off',
    'style/member-delimiter-style': 'off',
    'style/lines-between-class-members': 'off',
    'style/spaced-comment': 'off',
    'style/indent': 'off',
    'style/no-multiple-empty-lines': 'off',
    // 关闭排序规则
    'perfectionist/sort-named-imports': 'off',
    'perfectionist/sort-imports': 'off',
    'perfectionist/sort-named-exports': 'off',
    'perfectionist/sort-exports': 'off',
    // 关闭 Vue 相关规则
    'vue/singleline-html-element-content-newline': 'off',
    // 关闭其他格式化规则
    'antfu/if-newline': 'off',
    'antfu/consistent-chaining': 'off',
    'object-shorthand': 'off',
    'jsonc/sort-keys': 'off',
  },
})
