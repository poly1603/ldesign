import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: true,
  ignores: [
    'dist',
    'es',
    'lib',
    'types',
    'node_modules',
    '*.d.ts',
  ],
})
