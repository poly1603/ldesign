import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: true,
  react: false,
  stylistic: false,
  ignores: [
    // build outputs
    '**/dist/**',
    '**/es/**',
    '**/lib/**',
    '**/cjs/**',
    '**/types/**',
    '**/coverage/**',
    '**/.rollup.cache/**',

    // dependencies
    '**/node_modules/**',

    // documentation and markdown
    '**/docs/**',
    '**/*.md',

    // tests and examples
    '**/__tests__/**',
    '**/tests/**',
    '**/*.test.*',
    '**/*.spec.*',
    '**/examples/**',

    // scripts and configs
    '**/scripts/**',
    '**/*.config.*',
    '.type-test.ts',
  ],
  rules: {
    // Silence warnings for this package
    'no-console': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'ts/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'ts/no-non-null-assertion': 'off',
    'jsdoc/check-param-names': 'off',
  },
})
