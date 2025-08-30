import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json'
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        NodeJS: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': typescript
    },
    rules: {
      // TypeScript 规则
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-const': 'error',
      '@typescript-eslint/no-var-requires': 'error',
      
      // 通用规则
      'no-console': 'off',
      'no-debugger': 'error',
      'no-unused-vars': 'off', // 使用 TypeScript 版本
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-template': 'error',
      'template-curly-spacing': 'error',
      'arrow-spacing': 'error',
      'comma-dangle': ['error', 'always-multiline'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'never'],
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'eol-last': 'error',
      'no-trailing-spaces': 'error',
      'space-before-function-paren': ['error', 'never'],
      'keyword-spacing': 'error',
      'space-infix-ops': 'error',
      'comma-spacing': 'error',
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'curly': ['error', 'multi-line'],
      'handle-callback-err': 'error',
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'operator-linebreak': ['error', 'before']
    }
  },
  {
    files: ['**/*.test.{ts,js}', '**/*.spec.{ts,js}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off'
    }
  },
  {
    files: ['scripts/**/*.{ts,js}', 'tools/**/*.{ts,js}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-var-requires': 'off'
    }
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      '*.d.ts',
      'examples/**/*.js'
    ]
  }
]
