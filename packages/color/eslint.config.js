import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: true,
  ignores: [
    'dist',
    'lib',
    'types',
    'node_modules',
    'coverage',
    'cjs',
    'esm',
    '**/*.d.ts',
    '**/*.md',
    'docs/**',
    'summary/**',
    'examples/**',
    '__tests__/**',
    '.rollup.cache',
    'playwright-report',
    'test-results',
  ],
},
// Project overrides
{
  rules: {
    // Allow console logs for debug output used in tests and dev
    'no-console': 'off',
    // Relax stylistic constraints that are noisy for this codebase
    'style/max-statements-per-line': 'off',
    'no-case-declarations': 'off',
    // Vue SFC scripts may define helpers not used in some modes; keep as warnings or disable
    'unused-imports/no-unused-vars': 'off',
    // Keep JSDoc param warnings as warnings (no fail)
    'jsdoc/check-param-names': 'warn',
  },
})
