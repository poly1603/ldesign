import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import * as parserVue from 'vue-eslint-parser'
import configTypescript from '@typescript-eslint/eslint-plugin'
import parserTypescript from '@typescript-eslint/parser'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  js.configs.recommended,

  ...pluginVue.configs['flat/recommended'],
  {
    name: 'app/vue-rules',
    files: ['**/*.vue'],
    languageOptions: {
      parser: parserVue,
      parserOptions: {
        parser: parserTypescript,
        sourceType: 'module',
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },

  {
    name: 'app/typescript-rules',
    files: ['**/*.{ts,mts,tsx}'],
    languageOptions: {
      parser: parserTypescript,
      parserOptions: {
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': configTypescript,
    },
    rules: {
      ...configTypescript.configs.recommended.rules,
    },
  },
]
