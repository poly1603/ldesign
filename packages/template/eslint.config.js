import antfu from '@antfu/eslint-config'

export default antfu(
  {
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
  },
  // Global tweaks: disable problematic TSX indent rule
  {
    rules: {
      'style/indent': 'off',
      '@stylistic/indent': 'off',
      // Keep only warn/error console allowed in sources; scripts/test configs override below
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
)
