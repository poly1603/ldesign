import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: true,
  react: false, // Disable react rules to avoid conflicts
  stylistic: false, // Disable stylistic rules to avoid stack overflow
'ignores': [
    'packages/device/package.json',
    '**/dist/**',
    '**/es/**',
    '**/lib/**',
    '**/types/**',
    '**/node_modules/**',
    '**/coverage/**',
    '**/*.d.ts',
    '**/build/**',
    '**/docs/**', // Ignore all documentation
    '**/*.md', // Ignore all markdown files
    '**/.augment_cache/**', // Ignore augment cache
    '**/.turbo/**',
    '**/.validation-temp/**',
    '**/test-*.html',
    '**/*.min.js',
    '**/*.min.css',
    '**/packages/webcomponent/**', // Temporarily ignore webcomponent package
    'packages/template/package.json', // Ignore package.json jsonc sorting in template package
    // Ignore test files
    '**/tests/**',
    '**/package.json',
    '**/e2e/**',
    '**/__tests__/**',
    '**/*.test.ts',
    '**/*.spec.ts',
    '**/*.bench.ts',
    // Ignore scripts
    '**/scripts/**',
    // Ignore examples
    '**/examples/**',
  ],
  rules: {
    // 自定义规则
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
'no-console': ['warn', { allow: ['warn', 'error', 'info', 'group', 'groupEnd', 'time', 'timeEnd', 'table', 'debug'] }],
    'prefer-const': 'error',
    'no-var': 'error',
    'no-debugger': 'error',
    'no-unused-vars': 'off', // Use @typescript-eslint/no-unused-vars instead
    // Disable problematic rules
    'style/indent': 'off',
    'indent': 'off',
  },
  overrides: [
    {
      files: ['packages/template/src/**/*.{ts,tsx,vue}'],
      rules: {
'@typescript-eslint/no-explicit-any': 'off',
        'ts/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'no-console': 'off',
        'unicorn/error-message': 'off',
      },
    },
    {
      files: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*'],
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
    {
      files: ['packages/device/src/utils/Logger.ts'],
      rules: {
        'no-console': 'off',
        'eslint-comments/no-duplicate-disable': 'off',
      },
    },
    {
      files: ['packages/device/package.json', 'package.json', '**/package.json'],
      rules: {
        'jsonc/sort-keys': 'off',
        'jsonc/sort-array-values': 'off',
      },
    },
    {
      files: ['packages/device/src/**/*.ts', 'packages/device/src/**/*.vue'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
'@typescript-eslint/no-non-null-assertion': 'off',
        'ts/no-non-null-assertion': 'off',
        'no-console': 'off',
      },
    },
    {
      files: ['packages/device/src/vue/directives/*.ts'],
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
    {
      files: ['packages/device/src/**/*.ts', 'packages/device/src/**/*.vue'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
})
