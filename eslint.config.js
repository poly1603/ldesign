import antfu from '@antfu/eslint-config'

export default antfu(
  {
    typescript: true,
    vue: true,
    react: false,
    stylistic: false,
    ignores: [
      'packages/device/package.json',
      '**/dist/**',
      '**/es/**',
      '**/lib/**',
      '**/.rollup.cache/**',
      '**/types/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/*.d.ts',
      '**/build/**',
      '**/docs/**',
      '**/*.md',
      '**/.augment_cache/**',
      '**/.turbo/**',
      '**/.validation-temp/**',
      '**/test-*.html',
      '**/*.min.js',
      '**/*.min.css',
      '**/packages/webcomponent/**',
      'packages/template/package.json',
      '**/tests/**',
      '**/package.json',
      '**/e2e/**',
      '**/__tests__/**',
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/*.bench.ts',
      '**/scripts/**',
      '**/examples/**',
    ],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      'no-console': [
        'warn',
        {
          allow: [
            'warn',
            'error',
            'info',
            'group',
            'groupEnd',
            'time',
            'timeEnd',
            'table',
            'debug',
          ],
        },
      ],
      'prefer-const': 'error',
      'no-var': 'error',
      'no-debugger': 'error',
      'no-unused-vars': 'off',
      'style/indent': 'off',
      indent: 'off',
    },
  },
  // packages/template - 宽松规则
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
  // packages/device - 宽松规则
  {
    files: ['packages/device/src/**/*.ts', 'packages/device/src/**/*.vue'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'ts/no-non-null-assertion': 'off',
      'no-console': 'off',
    },
  },
  // Logger 文件
  {
    files: ['packages/device/src/utils/Logger.ts'],
    rules: {
      'no-console': 'off',
      'eslint-comments/no-duplicate-disable': 'off',
    },
  },
  // package.json 文件
  {
    files: ['packages/device/package.json', 'package.json', '**/package.json'],
    rules: {
      'jsonc/sort-keys': 'off',
      'jsonc/sort-array-values': 'off',
    },
  },
  // JS/CJS/MJS 文件
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  }
)
