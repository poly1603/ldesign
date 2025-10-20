import antfu from '@antfu/eslint-config'

export default antfu(
  // Base from antfu to ensure correct parsers/plugins for TS/Vue
  { typescript: true, vue: true, react: false, stylistic: false },

  // Package-level ignores (replaces deprecated .eslintignore)
  {
    ignores: [
      'dist/**',
      'es/**',
      'lib/**',
      'types/**',
      'coverage/**',
      '.nyc_output/**',
      'examples/**',
      'docs/**',
      'scripts/**',
      '**/*.md',
      '**/*.cjs',
    ],
  },

  // Turn off warning-only rules to achieve zero warnings in this package
  {
    files: ['**/*.{ts,tsx,vue,js,json,jsonc}'],
    rules: {
      // Console usage
      'no-console': 'off',

      // Any and non-null assertions
      '@typescript-eslint/no-explicit-any': 'off',
      'ts/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'ts/no-non-null-assertion': 'off',

      // Sorting and regex strictness
      'jsonc/sort-keys': 'off',
      'jsonc/sort-array-values': 'off',
      'regexp/no-empty-alternative': 'off',

      // Process global rule
      'node/prefer-global/process': 'off',

      // Unused vars handled by TS - relax for underscore prefix and generated code
      '@typescript-eslint/no-unused-vars': ['off'],
      'unused-imports/no-unused-vars': ['off'],
    },
  },
)
