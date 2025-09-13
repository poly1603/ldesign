import antfu from '@antfu/eslint-config'

export default antfu({
  // TypeScript 支持
  typescript: true,
  
  // Vue 支持（可选）
  vue: false,
  
  // 忽略文件
  ignores: [
    'dist',
    'es',
    'cjs',
    'coverage',
    'node_modules',
    '*.d.ts',
    'docs/.vitepress/dist'
  ],
  
  // 规则配置
  rules: {
    // 允许 console 语句（开发阶段）
    'no-console': 'warn',
    
    // TypeScript 相关规则
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    
    // 导入规则
    'import/order': ['error', {
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
    }],
    
    // 代码风格
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'never'],
    'comma-dangle': ['error', 'always-multiline'],
    
    // 函数和变量命名
    'camelcase': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    
    // 注释规则
    'spaced-comment': ['error', 'always', {
      'line': {
        'markers': ['/'],
        'exceptions': ['-', '+']
      },
      'block': {
        'markers': ['!'],
        'exceptions': ['*'],
        'balanced': true
      }
    }]
  }
})
