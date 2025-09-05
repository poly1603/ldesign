import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: false,
  ignores: [
    'dist',
    'es',
    'lib',
    'types',
    'node_modules',
    'coverage',
    '*.d.ts',
    'summary/**/*.md',
    'docs/**/*.md',
    '__tests__/**/*',
    'scripts/**/*',
    'examples/**/*',
    'benchmark.config.js',
    'playwright.config.ts',
    'vitest.config*.ts',
    '*.config.ts',
    'mindmap.md',
    'codecov.yml',
  ],
  markdown: {
    overrides: {
      'no-restricted-globals': 'off',
      'ts/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'off',
    },
  },
  rules: {
    'style/no-trailing-spaces': 'off',
    'style/no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1, maxBOF: 0 }],
  },
})
