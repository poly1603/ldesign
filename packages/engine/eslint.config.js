import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'package.json',
      'dist/**',
      'lib/**',
      'es/**',
      'types/**',
      'coverage/**',
      'node_modules/**',
      'examples/**',
      'tests/**',
      'test/**',
      '__tests__/**',
      'e2e/**',
      'docs/**',
      'scripts/**',
      'src/security/**',
    ],
  },
  {
    plugins: {
      ts: tseslint.plugin,
    },
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
        'caughtErrorsIgnorePattern': '^_'
      }],
    },
  },
)
