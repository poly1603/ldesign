import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: true,
  react: false,
  stylistic: false,
  ignores: [
    'dist',
    'es',
    'lib',
    'types',
    'node_modules',
    '__tests__',
    'tests',
    'test',
    'e2e',
    'examples',
    'docs',
    '**/*.md',
    'package.json',
  ],
  rules: {
    'ts/no-explicit-any': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'ts/no-non-null-assertion': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'no-console': 'off',
  },
})