import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  typescript: true,
  vue: true,
  ignores: [
    'dist',
    'esm',
    'cjs',
    'types',
    'coverage',
    'node_modules',
  ],
})
