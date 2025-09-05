import antfu from '@antfu/eslint-config'

const base = antfu({
  typescript: true,
  vue: true,
  // Use flat config ignores (ESLint v9+) to avoid linting build outputs, cache and markdown docs
  ignores: [
    'dist',
    'es',
    'lib',
    'cjs',
    'esm',
    'types',
    'node_modules',
    'coverage',
    'playwright-report',
    'test-results*',
    'docs/.vitepress/cache',
    'vite-test',
    'example',
    'examples',
    '*.d.ts',
    '**/*.md',
  ],
})

const extra = [
  // Global rule tweaks
  {
    rules: {
      // Allow using process directly in ESM/TS sources and configs
      'node/prefer-global/process': 'off',
      'n/prefer-global/process': 'off',
      // Keep console.warn / console.error, disallow others in source by default
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  // Scripts & config files
  {
    files: [
      'scripts/**/*',
      'scripts/*',
      'rollup*.js',
      'vitest.config.ts',
      'vite*.ts',
      'playwright.config.ts',
      'ldesign.config.js',
    ],
    rules: {
      'no-console': 'off',
      'node/prefer-global/process': 'off',
      'n/prefer-global/process': 'off',
      'unicorn/prefer-node-protocol': 'off',
      'perfectionist/sort-imports': 'off',
    },
  },
  // Tests
  {
    files: [
      'tests/**/*',
      'src/**/__tests__/**/*',
      '**/*.test.*',
      '**/*.spec.*',
    ],
    rules: {
      'test/prefer-lowercase-title': 'off',
      'no-console': 'off',
      'unused-imports/no-unused-imports': 'off',
      'unused-imports/no-unused-vars': 'off',
      'perfectionist/sort-named-imports': 'off',
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-exports': 'off',
      'ts/no-require-imports': 'off',
      'import/first': 'off',
    },
  },
  // Vue templates (demo)
  {
    files: ['src/templates/**/*.vue'],
    rules: {
      'no-alert': 'off',
      'no-console': 'off',
    },
  },
]

export default base
