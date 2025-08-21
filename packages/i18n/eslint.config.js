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
    '*.d.ts',
    'docs/**/*.md',
    'examples/**',
    '**/*.md',
    'rollup.config.js',
    'vite.config.ts',
    'vitest.config.ts',
    'playwright.config.ts',
  ],
})
