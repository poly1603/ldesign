/**
 * ESLint 性能优化规则配置
 */
module.exports = {
  rules: {
    // 禁止在循环中使用函数表达式
    'no-loop-func': 'warn',
    
    // 优化正则表达式
    'prefer-regex-literals': 'warn',
    
    // 避免不必要的计算
    'no-extend-native': 'error',
    
    // 性能建议
    'prefer-const': 'error',
    'no-var': 'error',
    
    // 避免不必要的对象创建
    'no-object-constructor': 'error',
  }
}

