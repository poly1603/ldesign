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
  ],
})
