import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import ts from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import jsdoc from 'eslint-plugin-jsdoc'
import perfectionist from 'eslint-plugin-perfectionist'
import regexp from 'eslint-plugin-regexp'
import unusedImports from 'eslint-plugin-unused-imports'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

export default [
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    ignores: [
      'dist/**/*',
      'lib/**/*',
      'es/**/*',
      'types/**/*',
      'node_modules/**/*',
      'coverage/**/*',
      '.nyc_output/**/*',
      'docs/.vitepress/cache/**/*',
      'docs/.vitepress/dist/**/*',
      '**/*.md',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': ts,
      '@stylistic': stylistic,
      perfectionist: perfectionist,
      'unused-imports': unusedImports,
      regexp: regexp,
      jsdoc: jsdoc,
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/method-signature-style': ['error', 'property'],

      // Style rules
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/quote-props': ['error', 'as-needed'],

      // Import sorting
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'natural',
          order: 'asc',
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
        },
      ],

      // Unused imports
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // Disable no-unused-vars for interface/type definitions
      'no-unused-vars': 'off',

      // Regex rules
      'regexp/no-super-linear-backtracking': 'error',
      'regexp/no-unused-capturing-group': 'error',

      // JSDoc rules
      'jsdoc/check-param-names': 'warn',

      // Console rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // Assignment in conditions
      'no-cond-assign': ['error', 'except-parens'],

      // Vue rules
      'vue/block-order': [
        'error',
        {
          order: ['script', 'template', 'style'],
        },
      ],
      'vue/no-v-text-v-html-on-component': 'error',
    },
  },
  {
    files: ['**/*.md'],
    rules: {
      // Disable most rules for markdown files
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'vue/no-v-text-v-html-on-component': 'off',
      'perfectionist/sort-imports': 'off',
      'unused-imports/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'off',
      'regexp/no-super-linear-backtracking': 'off',
      'regexp/no-unused-capturing-group': 'off',
      'jsdoc/check-param-names': 'off',
      '@stylistic/brace-style': 'off',
      '@stylistic/comma-dangle': 'off',
      '@stylistic/quote-props': 'off',
    },
  },
  {
    files: ['examples/**/*', '__tests__/**/*'],
    rules: {
      'no-console': 'off',
    },
  },
]
