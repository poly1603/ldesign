import antfu from '@antfu/eslint-config'

export default antfu({
  // TypeScript支持
  typescript: true,
  
  // Vue支持（可选）
  vue: true,
  
  // React支持（可选）
  react: true,
  
  // 忽略文件
  ignores: [
    'dist',
    'es',
    'coverage',
    'node_modules',
    '*.d.ts'
  ],
  
  // 规则覆盖
  rules: {
    // TypeScript相关规则
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    
    // 代码风格
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'never'],
    'comma-dangle': ['error', 'never'],
    
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
      'newlines-between': 'always'
    }],
    
    // 注释规则
    'spaced-comment': ['error', 'always'],
    
    // 控制台输出
    'no-console': 'warn',
    'no-debugger': 'error',
    
    // 代码复杂度
    'complexity': ['warn', 10],
    'max-depth': ['warn', 4],
    'max-lines-per-function': ['warn', 50],
    
    // Vue特定规则（如果使用Vue）
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'warn',
    
    // React特定规则（如果使用React）
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off'
  }
})
