import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: true,
  react: false, // Disable react to avoid plugin conflicts
  stylistic: false,
  ignores: [
    '**/dist/**',
    '**/es/**',
    '**/lib/**',
    '**/types/**',
    '**/node_modules/**',
    '**/coverage/**',
    '**/*.d.ts',
    '**/build/**',
    '**/docs/**',
    '**/*.md',
    '**/.turbo/**',
    '**/.validation-temp/**',
    '**/test-*.html',
    '**/*.min.js',
    '**/*.min.css',
    '**/tests/**',
    '**/e2e/**',
    '**/__tests__/**',
    '**/*.test.ts',
    '**/*.spec.ts',
    '**/*.bench.ts',
    '**/scripts/**',
    '**/examples/**',
  ],
  rules: {
    // TypeScript rules
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      destructuredArrayIgnorePattern: '^_'
    }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/consistent-type-imports': 'off',
    
    // Disable ts rules that conflict with custom patterns
    'ts/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    'ts/consistent-type-imports': 'off',
    
    // Unused imports
    'unused-imports/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    'unused-imports/no-unused-imports': 'error',
    
    // Console rules
    'no-console': 'off', // Allow all console methods for API debugging
    
    // General rules
    'prefer-const': 'error',
    'no-var': 'error',
    'no-debugger': 'error',
    'no-unused-vars': 'off',
    
    // Disable problematic rules
    'style/indent': 'off',
    'indent': 'off',
    'no-new': 'off', // Allow new for side effects in some cases
    'unicorn/no-new-array': 'off', // Allow new Array() for performance reasons
    'node/prefer-global/process': 'off', // Allow direct process access
    'regexp/no-unused-capturing-group': 'off', // Allow unused capturing groups
    
    // Import/Export rules
    'perfectionist/sort-exports': 'off',
    'perfectionist/sort-imports': 'off',
    'perfectionist/sort-named-exports': 'off',
    'perfectionist/sort-named-imports': 'off',
  },
  overrides: [
    {
      files: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*'],
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
    {
      files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
})