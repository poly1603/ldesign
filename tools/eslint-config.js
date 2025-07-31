import antfu from '@antfu/eslint-config'

/**
 * LDesign统一ESLint配置
 * 用于所有包的代码规范统一
 */
export default antfu(
  {
    vue: true,
    typescript: true,
    formatters: true,
    ignores: [
      '**/dist/**',
      '**/es/**',
      '**/lib/**',
      '**/cjs/**',
      '**/types/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/.trae/**',
      '**/playwright-report/**',
      '**/test-results/**'
    ]
  },
  {
    rules: {
      // 基础规则
      'no-console': 'warn',
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      
      // TypeScript规则
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      
      // Vue规则
      'vue/multi-word-component-names': 'off',
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/component-definition-name-casing': ['error', 'PascalCase'],
      'vue/custom-event-name-casing': ['error', 'camelCase'],
      'vue/define-macros-order': 'error',
      'vue/no-empty-component-block': 'error',
      'vue/no-multiple-objects-in-class': 'error',
      'vue/no-static-inline-styles': 'error',
      'vue/no-useless-v-bind': 'error',
      'vue/prefer-separate-static-class': 'error',
      'vue/prefer-true-attribute-shorthand': 'error',
      
      // 导入规则
      'import/order': [
        'error',
        {
          'groups': [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index'
          ],
          'newlines-between': 'always',
          'alphabetize': {
            'order': 'asc',
            'caseInsensitive': true
          }
        }
      ],
      
      // 代码风格
      'curly': ['error', 'all'],
      'brace-style': ['error', '1tbs', { 'allowSingleLine': false }],
      'comma-dangle': ['error', 'never'],
      'quotes': ['error', 'single'],
      'semi': ['error', 'never'],
      
      // 注释规则
      'spaced-comment': ['error', 'always'],
      'multiline-comment-style': ['error', 'starred-block']
    }
  },
  {
    // 测试文件特殊规则
    files: ['**/*.test.{js,ts,vue}', '**/*.spec.{js,ts,vue}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },
  {
    // 配置文件特殊规则
    files: ['**/*.config.{js,ts}', '**/rollup.config.{js,ts}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    }
  }