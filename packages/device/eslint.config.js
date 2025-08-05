import antfu from '@antfu/eslint-config'

export default antfu(
  {
    vue: true,
    typescript: true,
    formatters: true,
    ignores: [
      '**/dist/**',
      '**/es/**',
      '**/cjs/**',
      '**/lib/**',
      '**/types/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/.trae/**',
      '**/docs/**',
      '**/README.md',
      '**/examples/**/README.md',
      '**/demo.html',
      '**/*.md',
    ],
  },
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'unused-imports/no-unused-vars': 'error',
      'jsdoc/check-param-names': 'warn',
    },
  },
)
