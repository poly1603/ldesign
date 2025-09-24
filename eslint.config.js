import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: true,
  react: true,
  ignores: [
    '**/dist/**',
    '**/es/**',
    '**/lib/**',
    '**/types/**',
    '**/node_modules/**',
    '**/coverage/**',
    '**/*.d.ts',
    '**/build/**',
    '**/docs/.vitepress/dist/**',
    '**/docs/.vitepress/cache/**',
  ],
  rules: {
    // 自定义规则
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
  overrides: [
    {
      files: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*'],
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
})
