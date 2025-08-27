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
    'coverage',
    '*.d.ts',
    'cjs',
    'esm',
    'examples',
    'docs',
  ],
  rules: {
    // 在 Markdown 文件中禁用某些规则
    'markdown/no-html': 'off',
  },
  overrides: [
    {
      files: ['**/*.md/**'],
      rules: {
        'ts/no-unused-vars': 'off',
        'no-undef': 'off',
        'import/no-duplicates': 'off',
        'no-console': 'off',
        'unused-imports/no-unused-vars': 'off',
      },
    },
  ],
})
