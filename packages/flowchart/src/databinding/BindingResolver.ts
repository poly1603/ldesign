/**
 * 绑定解析器
 * 
 * 解析和执行数据绑定表达式
 */

import type {
  BindingResolver as IBindingResolver,
  ExpressionResult,
  CompiledExpression
} from './types'

/**
 * 绑定解析器类
 */
export class BindingResolver implements IBindingResolver {
  private compiledExpressions: Map<string, CompiledExpression> = new Map()
  private expressionCache: Map<string, any> = new Map()

  /**
   * 解析表达式
   */
  resolveExpression(expression: string, data: any, context?: any): ExpressionResult {
    try {
      // 检查缓存
      const cacheKey = this.getCacheKey(expression, data, context)
      if (this.expressionCache.has(cacheKey)) {
        return {
          value: this.expressionCache.get(cacheKey),
          success: true,
          dependencies: this.getExpressionDependencies(expression)
        }
      }

      // 编译表达式（如果尚未编译）
      let compiled = this.compiledExpressions.get(expression)
      if (!compiled) {
        compiled = this.compileExpression(expression)
        this.compiledExpressions.set(expression, compiled)
      }

      if (!compiled.valid) {
        return {
          value: null,
          success: false,
          error: '表达式编译失败',
          dependencies: []
        }
      }

      // 执行表达式
      const value = compiled.execute(data, context)

      // 缓存结果
      this.expressionCache.set(cacheKey, value)

      return {
        value,
        success: true,
        dependencies: compiled.dependencies
      }
    } catch (error) {
      return {
        value: null,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        dependencies: []
      }
    }
  }

  /**
   * 验证表达式语法
   */
  validateExpression(expression: string): boolean {
    try {
      const compiled = this.compileExpression(expression)
      return compiled.valid
    } catch {
      return false
    }
  }

  /**
   * 获取表达式依赖
   */
  getExpressionDependencies(expression: string): string[] {
    const dependencies: string[] = []
    
    // 匹配 ${...} 格式的表达式
    const matches = expression.match(/\$\{([^}]+)\}/g)
    if (!matches) {
      return dependencies
    }

    for (const match of matches) {
      const path = match.slice(2, -1).trim() // 移除 ${ 和 }
      const cleanPath = this.extractPropertyPath(path)
      if (cleanPath && !dependencies.includes(cleanPath)) {
        dependencies.push(cleanPath)
      }
    }

    return dependencies
  }

  /**
   * 编译表达式
   */
  compileExpression(expression: string): CompiledExpression {
    try {
      const dependencies = this.getExpressionDependencies(expression)
      
      // 如果不包含绑定表达式，直接返回原值
      if (dependencies.length === 0) {
        return {
          source: expression,
          execute: () => expression,
          dependencies: [],
          valid: true
        }
      }

      // 创建执行函数
      const executeFunction = this.createExecuteFunction(expression)

      return {
        source: expression,
        execute: executeFunction,
        dependencies,
        valid: true
      }
    } catch (error) {
      return {
        source: expression,
        execute: () => null,
        dependencies: [],
        valid: false
      }
    }
  }

  /**
   * 创建表达式执行函数
   */
  private createExecuteFunction(expression: string): (data: any, context?: any) => any {
    return (data: any, context?: any) => {
      try {
        // 替换表达式中的绑定变量
        let result = expression

        // 匹配所有 ${...} 表达式
        const matches = expression.match(/\$\{([^}]+)\}/g)
        if (!matches) {
          return expression
        }

        for (const match of matches) {
          const path = match.slice(2, -1).trim() // 移除 ${ 和 }
          const value = this.evaluatePropertyPath(path, data, context)
          
          // 如果是字符串模板，替换为字符串值
          if (matches.length > 1 || expression !== match) {
            result = result.replace(match, String(value ?? ''))
          } else {
            // 如果整个表达式就是一个绑定，返回原始值
            return value
          }
        }

        return result
      } catch (error) {
        console.error('表达式执行失败:', error)
        return null
      }
    }
  }

  /**
   * 计算属性路径
   */
  private evaluatePropertyPath(path: string, data: any, context?: any): any {
    try {
      // 处理特殊变量
      if (path === 'data') {
        return data
      }
      if (path === 'context') {
        return context
      }

      // 处理函数调用
      if (path.includes('(') && path.includes(')')) {
        return this.evaluateFunction(path, data, context)
      }

      // 处理数组索引和对象属性
      const parts = this.parsePropertyPath(path)
      let current = data

      for (const part of parts) {
        if (current == null) {
          return null
        }

        if (part.type === 'property') {
          current = current[part.name]
        } else if (part.type === 'index') {
          const index = this.evaluateExpression(part.expression, data, context)
          current = current[index]
        }
      }

      return current
    } catch (error) {
      console.error('属性路径计算失败:', path, error)
      return null
    }
  }

  /**
   * 解析属性路径
   */
  private parsePropertyPath(path: string): Array<{type: 'property' | 'index', name?: string, expression?: string}> {
    const parts: Array<{type: 'property' | 'index', name?: string, expression?: string}> = []
    let current = ''
    let inBrackets = false
    let bracketContent = ''

    for (let i = 0; i < path.length; i++) {
      const char = path[i]

      if (char === '[' && !inBrackets) {
        if (current) {
          parts.push({ type: 'property', name: current })
          current = ''
        }
        inBrackets = true
        bracketContent = ''
      } else if (char === ']' && inBrackets) {
        parts.push({ type: 'index', expression: bracketContent })
        inBrackets = false
        bracketContent = ''
      } else if (char === '.' && !inBrackets) {
        if (current) {
          parts.push({ type: 'property', name: current })
          current = ''
        }
      } else if (inBrackets) {
        bracketContent += char
      } else {
        current += char
      }
    }

    if (current) {
      parts.push({ type: 'property', name: current })
    }

    return parts
  }

  /**
   * 计算函数调用
   */
  private evaluateFunction(expression: string, data: any, context?: any): any {
    try {
      // 解析函数名和参数
      const match = expression.match(/^(\w+)\((.*)\)$/)
      if (!match) {
        throw new Error('无效的函数表达式')
      }

      const [, functionName, argsString] = match
      const args = this.parseArguments(argsString, data, context)

      // 执行内置函数
      return this.executeBuiltinFunction(functionName, args, data, context)
    } catch (error) {
      console.error('函数执行失败:', expression, error)
      return null
    }
  }

  /**
   * 解析函数参数
   */
  private parseArguments(argsString: string, data: any, context?: any): any[] {
    if (!argsString.trim()) {
      return []
    }

    const args: any[] = []
    const parts = argsString.split(',')

    for (const part of parts) {
      const trimmed = part.trim()
      
      // 字符串字面量
      if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
          (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        args.push(trimmed.slice(1, -1))
      }
      // 数字字面量
      else if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
        args.push(Number(trimmed))
      }
      // 布尔字面量
      else if (trimmed === 'true' || trimmed === 'false') {
        args.push(trimmed === 'true')
      }
      // null 字面量
      else if (trimmed === 'null') {
        args.push(null)
      }
      // 属性路径
      else {
        args.push(this.evaluatePropertyPath(trimmed, data, context))
      }
    }

    return args
  }

  /**
   * 执行内置函数
   */
  private executeBuiltinFunction(name: string, args: any[], data: any, context?: any): any {
    switch (name) {
      case 'length':
        return args[0]?.length ?? 0

      case 'upper':
        return String(args[0] ?? '').toUpperCase()

      case 'lower':
        return String(args[0] ?? '').toLowerCase()

      case 'trim':
        return String(args[0] ?? '').trim()

      case 'substring':
        return String(args[0] ?? '').substring(args[1] ?? 0, args[2])

      case 'replace':
        return String(args[0] ?? '').replace(args[1] ?? '', args[2] ?? '')

      case 'split':
        return String(args[0] ?? '').split(args[1] ?? '')

      case 'join':
        return Array.isArray(args[0]) ? args[0].join(args[1] ?? '') : ''

      case 'filter':
        return Array.isArray(args[0]) ? args[0].filter(Boolean) : []

      case 'map':
        return Array.isArray(args[0]) ? args[0].map(item => item) : []

      case 'first':
        return Array.isArray(args[0]) && args[0].length > 0 ? args[0][0] : null

      case 'last':
        return Array.isArray(args[0]) && args[0].length > 0 ? args[0][args[0].length - 1] : null

      case 'sum':
        return Array.isArray(args[0]) ? args[0].reduce((sum, val) => sum + (Number(val) || 0), 0) : 0

      case 'avg':
        if (Array.isArray(args[0]) && args[0].length > 0) {
          const sum = args[0].reduce((sum, val) => sum + (Number(val) || 0), 0)
          return sum / args[0].length
        }
        return 0

      case 'min':
        return Array.isArray(args[0]) && args[0].length > 0 ? Math.min(...args[0].map(Number)) : null

      case 'max':
        return Array.isArray(args[0]) && args[0].length > 0 ? Math.max(...args[0].map(Number)) : null

      case 'format':
        return this.formatString(args[0], ...args.slice(1))

      case 'date':
        return args[0] ? new Date(args[0]).toLocaleDateString() : ''

      case 'time':
        return args[0] ? new Date(args[0]).toLocaleTimeString() : ''

      case 'datetime':
        return args[0] ? new Date(args[0]).toLocaleString() : ''

      case 'round':
        return Math.round(Number(args[0]) || 0)

      case 'floor':
        return Math.floor(Number(args[0]) || 0)

      case 'ceil':
        return Math.ceil(Number(args[0]) || 0)

      case 'abs':
        return Math.abs(Number(args[0]) || 0)

      default:
        throw new Error(`未知函数: ${name}`)
    }
  }

  /**
   * 格式化字符串
   */
  private formatString(template: string, ...args: any[]): string {
    if (typeof template !== 'string') {
      return String(template)
    }

    return template.replace(/\{(\d+)\}/g, (match, index) => {
      const argIndex = parseInt(index)
      return argIndex < args.length ? String(args[argIndex]) : match
    })
  }

  /**
   * 简单表达式求值
   */
  private evaluateExpression(expression: string, data: any, context?: any): any {
    // 简化实现，只支持基本的属性访问
    if (/^\d+$/.test(expression)) {
      return parseInt(expression)
    }
    
    if (expression.startsWith('"') && expression.endsWith('"')) {
      return expression.slice(1, -1)
    }
    
    return this.evaluatePropertyPath(expression, data, context)
  }

  /**
   * 提取属性路径
   */
  private extractPropertyPath(path: string): string {
    // 移除函数调用，只保留属性路径
    return path.replace(/\([^)]*\)/g, '').trim()
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(expression: string, data: any, context?: any): string {
    // 简化实现，实际应该考虑数据的哈希值
    return `${expression}_${JSON.stringify(data)}_${JSON.stringify(context)}`
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.expressionCache.clear()
  }

  /**
   * 清理编译缓存
   */
  clearCompiledExpressions(): void {
    this.compiledExpressions.clear()
  }
}
