import antfu from '@antfu/eslint-config'

export default antfu(
  {
    typescript: true,
    vue: true,
    ignores: [
      'dist',
      'es',
      'lib',
      'types',
      'node_modules',
      'coverage',
      '*.d.ts',
      'scripts/**/*',
      'docs/**/*',
      'summary/**/*',
      'example/playwright.config.ts',
      'README.md',
      '*.md',
    ],
  },
  {
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-alert': 'error',
      'vue/no-template-shadow': 'warn',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
)
