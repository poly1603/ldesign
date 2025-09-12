import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  typescript: true,
  vue: true,
  react: true,
  formatters: {
    css: true,
    html: true,
    markdown: 'prettier',
  },
  stylistic: {
    indent: 2,
    quotes: 'single',
    semi: false,
  },
  ignores: [
    'dist',
    'node_modules',
    'coverage',
    '*.d.ts',
    'examples',
    'docs/.vitepress/cache',
    'docs/.vitepress/dist',
  ],
  rules: {
    // TypeScript 相关规则
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    
    // Vue 相关规则
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/component-definition-name-casing': ['error', 'PascalCase'],
    'vue/custom-event-name-casing': ['error', 'camelCase'],
    
    // React 相关规则
    'react/prop-types': 'off', // 使用 TypeScript 进行类型检查
    'react/react-in-jsx-scope': 'off', // React 17+ 不需要导入 React
    'react-hooks/exhaustive-deps': 'warn',
    
    // 通用规则
    'no-console': 'warn',
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    
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
      'newlines-between': 'always',
      'alphabetize': {
        'order': 'asc',
        'caseInsensitive': true,
      },
    }],
  },
})
