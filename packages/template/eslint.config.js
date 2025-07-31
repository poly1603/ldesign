import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
  jsx: true,
  ignores: [
    'dist',
    'es',
    'types',
    'node_modules',
    '*.d.ts',
    'README.md',
    'eslint.config.js',
    'rollup.config.js',
    'vitest.config.ts',
    'playwright.config.ts',
    'examples',
  ],
  rules: {
    // Vue 相关规则
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/component-definition-name-casing': ['error', 'PascalCase'],
    'vue/custom-event-name-casing': ['error', 'camelCase'],
    'vue/define-macros-order': ['error', {
      order: ['defineProps', 'defineEmits'],
    }],

    // TypeScript 相关规则
    '@typescript-eslint/consistent-type-imports': 'off',
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',

    // 代码风格
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'never'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],

    // 导入规则
    'import/order': ['error', {
      'groups': [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index',
      ],
      'newlines-between': 'never',
    }],

    // 禁用一些过于严格的规则
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-unsafe-function-type': 'off',
    'vue/require-default-prop': 'off',
    'vue/multi-word-component-names': 'off',
    'unused-imports/no-unused-imports': 'off',
    'unused-imports/no-unused-vars': 'off',
    'no-alert': 'off',
    'no-console': 'off',
    'node/prefer-global/process': 'off',
    'node/handle-callback-err': 'off',
    'no-restricted-globals': 'off',
    'test/prefer-lowercase-title': 'off',
    'style/comma-dangle': 'off',
    'style/no-trailing-spaces': 'off',
    'style/max-statements-per-line': 'off',
    'comma-dangle': 'off',
    'ts/no-use-before-define': 'off',
    'vue/no-template-shadow': 'off',
    'jsonc/sort-keys': 'off',
  },
})
