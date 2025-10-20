module.exports = {
  root: true,
  ignorePatterns: ['package.json'],
  rules: {
    // 允许使用 any 类型（在某些情况下必要）
    '@typescript-eslint/no-explicit-any': 'off',
    'ts/no-explicit-any': 'off',
    
    // 允许使用非空断言
    '@typescript-eslint/no-non-null-assertion': 'off',
    
    // 允许未使用的变量（以下划线开头）
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],
    'unused-imports/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],
    'ts/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],
    
    // 允许使用 Function 类型（在某些动态场景中必要）
    '@typescript-eslint/no-unsafe-function-type': 'off',
    'ts/no-unsafe-function-type': 'off',
    
    // 允许 eval（在沙箱执行中必要，但应谨慎使用）
    'no-eval': 'warn',
    
    // 允许 Function 构造器（在沙箱中必要）
    'no-new-func': 'warn',
    
    // Node.js 全局变量
    'node/prefer-global/process': 'off',
    
    // 处理回调错误
    'node/handle-callback-err': ['error', '^(err|error)$'],
    
    // 正则表达式
    'regexp/no-super-linear-backtracking': 'warn',
    
    // 多行语法
'no-unexpected-multiline': 'off'
  },
  overrides: [
    {
      files: ['package.json'],
      rules: {
        'jsonc/sort-keys': 'off',
        'jsonc/sort-array-values': 'off'
      }
    }
  ]
}
