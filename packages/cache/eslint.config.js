import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: false,
  ignores: ['dist', 'es', 'lib', 'types', 'node_modules', 'coverage', '*.d.ts', 'summary/**/*.md', 'docs/**/*.md'],
  markdown: {
    overrides: {
      'no-restricted-globals': 'off',
      'ts/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'off',
    },
  },
})
