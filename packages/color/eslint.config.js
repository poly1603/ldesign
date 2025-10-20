import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: true,
  react: false,
  stylistic: false,
  ignores: [
    '**/dist/**',
    '**/es/**',
    '**/lib/**',
    '**/types/**',
    '**/node_modules/**',
    '**/coverage/**',
    '**/*.d.ts',
    '**/examples/**',
    '**/*.min.js',
    '**/*.min.css',
  ],
  rules: {
    // 针对颜色处理库的特殊需求，允许必要的 any
    'ts/no-explicit-any': 'off',
    
    // 颜色计算中经常需要非空断言
    'ts/no-non-null-assertion': 'off',
    
    // JSDoc 对于内部函数不是必需的
    'jsdoc/check-param-names': 'off',
    'jsdoc/require-param': 'off',
    'jsdoc/require-returns': 'off',
    
    // 在某些优化场景中需要
    'no-self-compare': 'off',
    
    // 性能优化中可能需要
    'unicorn/no-new-array': 'off',
    
    // 允许在必要时使用 Function 类型
    'ts/no-unsafe-function-type': 'off',
    
    // 对于实用工具函数，允许更灵活的参数
    'ts/no-unsafe-argument': 'off',
    'ts/no-unsafe-assignment': 'off',
    'ts/no-unsafe-member-access': 'off',
    'ts/no-unsafe-return': 'off',
    
    // 在演示和开发组件中允许 console
    'no-console': ['warn', { 
      allow: ['warn', 'error', 'info', 'debug', 'time', 'timeEnd'] 
    }],
    
    // 允许在 Vue 组件中使用
    'no-alert': 'off',
    'no-confirm': 'off',
    
    // 导入排序规则调整
    'perfectionist/sort-imports': 'off',
    'perfectionist/sort-named-imports': 'off',
    
    // 使用前定义 - 对于某些递归或回调场景
    'ts/no-use-before-define': ['error', {
      functions: false,
      classes: true,
      variables: true,
      allowNamedExports: false
    }],
    
    // 对于库代码，某些未使用变量是 API 的一部分
    'ts/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_'
    }],
    'unused-imports/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }]
  },
  overrides: [
    {
      // 测试文件的特殊规则
      files: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        'ts/no-explicit-any': 'off',
        'no-console': 'off'
      }
    },
    {
      // 示例文件的特殊规则
      files: ['**/examples/**/*'],
      rules: {
        'ts/no-explicit-any': 'off',
        'no-console': 'off',
        'no-alert': 'off'
      }
    },
    {
      // Vue 组件文件
      files: ['**/*.vue'],
      rules: {
        'ts/no-explicit-any': 'off',
        'no-console': ['warn', { allow: ['warn', 'error'] }]
      }
    }
  ]
})
