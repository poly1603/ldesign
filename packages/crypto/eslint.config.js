import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: true,
  ignores: [
    'dist',
    'es',
    'lib',
    'esm',
    'cjs',
    'types',
    'node_modules',
    'coverage',
    '*.d.ts',
    'docs/**/*',
    'examples/**/*',
    'test/**/*',
    '__tests__/**/*',
    'e2e/**/*',
    'summary/**/*',
    '*.md',
    '**/*.md',
    'debug-*.js',
    'temp',
    'tmp',
  ],
})
