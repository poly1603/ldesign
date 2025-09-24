import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: true, // 启用 Vue 支持，因为项目包含 Vue 组件
  ignores: [
    'dist',
    'es',
    'lib',
    'types',
    'types-temp',
    'node_modules',
    'coverage',
    'temp_vue_files',
    'test-build',
    '*.d.ts'
  ],
  rules: {
    // TypeScript 相关规则
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',

    // 代码质量规则
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',

    // Vue 相关规则（如果有 Vue 文件）
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/component-definition-name-casing': ['error', 'PascalCase'],
    'vue/no-unused-components': 'warn'
  }
})
