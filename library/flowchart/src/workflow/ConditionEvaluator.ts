/**
 * 条件评估器
 * 
 * 负责评估流程中的条件表达式
 */

import type { ConditionExpression, ExpressionType } from './types'

/**
 * 条件评估器
 */
export class ConditionEvaluator {
  private expressionCache: Map<string, CompiledExpression> = new Map()
  private functions: Map<string, Function> = new Map()

  constructor() {
    this.initializeBuiltinFunctions()
  }

  /**
   * 评估条件表达式
   */
  evaluate(expression: string, context: EvaluationContext): boolean {
    try {
      // 获取编译后的表达式
      const compiled = this.compileExpression(expression)
      
      // 执行表达式
      const result = compiled.execute(context)
      
      // 转换为布尔值
      return Boolean(result)
    } catch (error) {
      console.error(`条件表达式评估失败: ${expression}`, error)
      return false
    }
  }

  /**
   * 评估表达式并返回值
   */
  evaluateExpression(expression: string, context: EvaluationContext): any {
    try {
      const compiled = this.compileExpression(expression)
      return compiled.execute(context)
    } catch (error) {
      console.error(`表达式评估失败: ${expression}`, error)
      return null
    }
  }

  /**
   * 验证表达式语法
   */
  validateExpression(expression: string): ValidationResult {
    try {
      this.compileExpression(expression)
      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  /**
   * 编译表达式
   */
  private compileExpression(expression: string): CompiledExpression {
    // 检查缓存
    const cached = this.expressionCache.get(expression)
    if (cached) {
      return cached
    }

    // 编译新表达式
    const compiled = this.doCompileExpression(expression)
    
    // 缓存编译结果
    this.expressionCache.set(expression, compiled)
    
    return compiled
  }

  /**
   * 执行表达式编译
   */
  private doCompileExpression(expression: string): CompiledExpression {
    // 预处理表达式
    const processedExpression = this.preprocessExpression(expression)
    
    // 解析表达式
    const ast = this.parseExpression(processedExpression)
    
    // 创建执行函数
    const executeFunction = this.createExecuteFunction(ast)
    
    return {
      originalExpression: expression,
      processedExpression,
      ast,
      execute: executeFunction
    }
  }

  /**
   * 预处理表达式
   */
  private preprocessExpression(expression: string): string {
    // 移除多余空格
    let processed = expression.trim().replace(/\s+/g, ' ')
    
    // 替换变量引用 ${variable} -> variables.variable
    processed = processed.replace(/\$\{([^}]+)\}/g, (match, varPath) => {
      return `variables.${varPath}`
    })
    
    // 替换函数调用
    processed = this.replaceFunctionCalls(processed)
    
    return processed
  }

  /**
   * 替换函数调用
   */
  private replaceFunctionCalls(expression: string): string {
    // 匹配函数调用模式: functionName(args)
    return expression.replace(/(\w+)\s*\(/g, (match, funcName) => {
      if (this.functions.has(funcName)) {
        return `functions.${funcName}(`
      }
      return match
    })
  }

  /**
   * 解析表达式为AST
   */
  private parseExpression(expression: string): ExpressionAST {
    // 简单的表达式解析器
    // 这里实现一个基本的递归下降解析器
    
    const tokens = this.tokenize(expression)
    const parser = new ExpressionParser(tokens)
    return parser.parse()
  }

  /**
   * 词法分析
   */
  private tokenize(expression: string): Token[] {
    const tokens: Token[] = []
    const regex = /(\d+\.?\d*)|([a-zA-Z_]\w*(?:\.[a-zA-Z_]\w*)*)|([+\-*/()=!<>&|,])|(\s+)|(".*?")|('.*?')/g
    
    let match
    while ((match = regex.exec(expression)) !== null) {
      const [, number, identifier, operator, whitespace, doubleQuote, singleQuote] = match
      
      if (whitespace) continue // 跳过空格
      
      if (number) {
        tokens.push({ type: 'NUMBER', value: parseFloat(number) })
      } else if (identifier) {
        tokens.push({ type: 'IDENTIFIER', value: identifier })
      } else if (operator) {
        tokens.push({ type: 'OPERATOR', value: operator })
      } else if (doubleQuote || singleQuote) {
        const quote = doubleQuote || singleQuote
        tokens.push({ type: 'STRING', value: quote.slice(1, -1) })
      }
    }
    
    return tokens
  }

  /**
   * 创建执行函数
   */
  private createExecuteFunction(ast: ExpressionAST): (context: EvaluationContext) => any {
    return (context: EvaluationContext) => {
      const evaluator = new ASTEvaluator(context, this.functions)
      return evaluator.evaluate(ast)
    }
  }

  /**
   * 初始化内置函数
   */
  private initializeBuiltinFunctions(): void {
    // 字符串函数
    this.functions.set('upper', (str: string) => str.toUpperCase())
    this.functions.set('lower', (str: string) => str.toLowerCase())
    this.functions.set('trim', (str: string) => str.trim())
    this.functions.set('length', (str: string) => str.length)
    this.functions.set('substring', (str: string, start: number, end?: number) => str.substring(start, end))
    this.functions.set('indexOf', (str: string, search: string) => str.indexOf(search))
    this.functions.set('replace', (str: string, search: string, replace: string) => str.replace(search, replace))
    this.functions.set('startsWith', (str: string, prefix: string) => str.startsWith(prefix))
    this.functions.set('endsWith', (str: string, suffix: string) => str.endsWith(suffix))
    this.functions.set('contains', (str: string, search: string) => str.includes(search))

    // 数学函数
    this.functions.set('abs', Math.abs)
    this.functions.set('ceil', Math.ceil)
    this.functions.set('floor', Math.floor)
    this.functions.set('round', Math.round)
    this.functions.set('max', Math.max)
    this.functions.set('min', Math.min)
    this.functions.set('pow', Math.pow)
    this.functions.set('sqrt', Math.sqrt)

    // 数组函数
    this.functions.set('size', (arr: any[]) => arr.length)
    this.functions.set('isEmpty', (arr: any[]) => arr.length === 0)
    this.functions.set('contains', (arr: any[], item: any) => arr.includes(item))
    this.functions.set('first', (arr: any[]) => arr[0])
    this.functions.set('last', (arr: any[]) => arr[arr.length - 1])

    // 类型检查函数
    this.functions.set('isNull', (value: any) => value === null)
    this.functions.set('isUndefined', (value: any) => value === undefined)
    this.functions.set('isEmpty', (value: any) => {
      if (value === null || value === undefined) return true
      if (typeof value === 'string') return value.length === 0
      if (Array.isArray(value)) return value.length === 0
      if (typeof value === 'object') return Object.keys(value).length === 0
      return false
    })
    this.functions.set('isString', (value: any) => typeof value === 'string')
    this.functions.set('isNumber', (value: any) => typeof value === 'number')
    this.functions.set('isBoolean', (value: any) => typeof value === 'boolean')
    this.functions.set('isArray', Array.isArray)
    this.functions.set('isObject', (value: any) => typeof value === 'object' && value !== null && !Array.isArray(value))

    // 日期函数
    this.functions.set('now', () => Date.now())
    this.functions.set('today', () => new Date().toDateString())
    this.functions.set('formatDate', (date: Date | number | string, format?: string) => {
      const d = new Date(date)
      if (format) {
        // 简单的日期格式化
        return format
          .replace('YYYY', d.getFullYear().toString())
          .replace('MM', (d.getMonth() + 1).toString().padStart(2, '0'))
          .replace('DD', d.getDate().toString().padStart(2, '0'))
          .replace('HH', d.getHours().toString().padStart(2, '0'))
          .replace('mm', d.getMinutes().toString().padStart(2, '0'))
          .replace('ss', d.getSeconds().toString().padStart(2, '0'))
      }
      return d.toISOString()
    })

    // 逻辑函数
    this.functions.set('and', (...args: any[]) => args.every(Boolean))
    this.functions.set('or', (...args: any[]) => args.some(Boolean))
    this.functions.set('not', (value: any) => !value)
    this.functions.set('if', (condition: any, trueValue: any, falseValue: any) => condition ? trueValue : falseValue)
  }

  /**
   * 添加自定义函数
   */
  addFunction(name: string, func: Function): void {
    this.functions.set(name, func)
  }

  /**
   * 移除函数
   */
  removeFunction(name: string): void {
    this.functions.delete(name)
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.expressionCache.clear()
  }
}

/**
 * 评估上下文
 */
export interface EvaluationContext {
  /** 流程变量 */
  variables: Record<string, any>
  /** 令牌数据 */
  token?: any
  /** 流程实例 */
  instance?: any
  /** 任务数据 */
  task?: any
  /** 用户信息 */
  user?: any
  /** 自定义数据 */
  [key: string]: any
}

/**
 * 验证结果
 */
interface ValidationResult {
  /** 是否有效 */
  valid: boolean
  /** 错误信息 */
  error?: string
}

/**
 * 编译后的表达式
 */
interface CompiledExpression {
  /** 原始表达式 */
  originalExpression: string
  /** 处理后的表达式 */
  processedExpression: string
  /** 抽象语法树 */
  ast: ExpressionAST
  /** 执行函数 */
  execute: (context: EvaluationContext) => any
}

/**
 * 表达式AST节点
 */
interface ExpressionAST {
  type: 'binary' | 'unary' | 'literal' | 'identifier' | 'call' | 'member'
  [key: string]: any
}

/**
 * 词法单元
 */
interface Token {
  type: 'NUMBER' | 'STRING' | 'IDENTIFIER' | 'OPERATOR'
  value: any
}

/**
 * 表达式解析器
 */
class ExpressionParser {
  private tokens: Token[]
  private current: number = 0

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  parse(): ExpressionAST {
    return this.parseExpression()
  }

  private parseExpression(): ExpressionAST {
    return this.parseLogicalOr()
  }

  private parseLogicalOr(): ExpressionAST {
    let left = this.parseLogicalAnd()

    while (this.match('||')) {
      const operator = this.previous().value
      const right = this.parseLogicalAnd()
      left = {
        type: 'binary',
        operator,
        left,
        right
      }
    }

    return left
  }

  private parseLogicalAnd(): ExpressionAST {
    let left = this.parseEquality()

    while (this.match('&&')) {
      const operator = this.previous().value
      const right = this.parseEquality()
      left = {
        type: 'binary',
        operator,
        left,
        right
      }
    }

    return left
  }

  private parseEquality(): ExpressionAST {
    let left = this.parseComparison()

    while (this.match('==', '!=')) {
      const operator = this.previous().value
      const right = this.parseComparison()
      left = {
        type: 'binary',
        operator,
        left,
        right
      }
    }

    return left
  }

  private parseComparison(): ExpressionAST {
    let left = this.parseAddition()

    while (this.match('>', '>=', '<', '<=')) {
      const operator = this.previous().value
      const right = this.parseAddition()
      left = {
        type: 'binary',
        operator,
        left,
        right
      }
    }

    return left
  }

  private parseAddition(): ExpressionAST {
    let left = this.parseMultiplication()

    while (this.match('+', '-')) {
      const operator = this.previous().value
      const right = this.parseMultiplication()
      left = {
        type: 'binary',
        operator,
        left,
        right
      }
    }

    return left
  }

  private parseMultiplication(): ExpressionAST {
    let left = this.parseUnary()

    while (this.match('*', '/')) {
      const operator = this.previous().value
      const right = this.parseUnary()
      left = {
        type: 'binary',
        operator,
        left,
        right
      }
    }

    return left
  }

  private parseUnary(): ExpressionAST {
    if (this.match('!', '-')) {
      const operator = this.previous().value
      const right = this.parseUnary()
      return {
        type: 'unary',
        operator,
        operand: right
      }
    }

    return this.parseCall()
  }

  private parseCall(): ExpressionAST {
    let expr = this.parsePrimary()

    while (true) {
      if (this.match('(')) {
        expr = this.finishCall(expr)
      } else if (this.match('.')) {
        const name = this.consume('IDENTIFIER', '期望属性名').value
        expr = {
          type: 'member',
          object: expr,
          property: name
        }
      } else {
        break
      }
    }

    return expr
  }

  private finishCall(callee: ExpressionAST): ExpressionAST {
    const args: ExpressionAST[] = []

    if (!this.check(')')) {
      do {
        args.push(this.parseExpression())
      } while (this.match(','))
    }

    this.consume(')', '期望 ")"')

    return {
      type: 'call',
      callee,
      arguments: args
    }
  }

  private parsePrimary(): ExpressionAST {
    if (this.match('NUMBER')) {
      return {
        type: 'literal',
        value: this.previous().value
      }
    }

    if (this.match('STRING')) {
      return {
        type: 'literal',
        value: this.previous().value
      }
    }

    if (this.match('IDENTIFIER')) {
      return {
        type: 'identifier',
        name: this.previous().value
      }
    }

    if (this.match('(')) {
      const expr = this.parseExpression()
      this.consume(')', '期望 ")"')
      return expr
    }

    throw new Error(`意外的标记: ${this.peek().value}`)
  }

  private match(...types: string[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance()
        return true
      }
    }
    return false
  }

  private check(type: string): boolean {
    if (this.isAtEnd()) return false
    return this.peek().value === type || this.peek().type === type
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++
    return this.previous()
  }

  private isAtEnd(): boolean {
    return this.current >= this.tokens.length
  }

  private peek(): Token {
    return this.tokens[this.current] || { type: 'OPERATOR', value: 'EOF' }
  }

  private previous(): Token {
    return this.tokens[this.current - 1]
  }

  private consume(type: string, message: string): Token {
    if (this.check(type)) return this.advance()
    throw new Error(message)
  }
}

/**
 * AST评估器
 */
class ASTEvaluator {
  private context: EvaluationContext
  private functions: Map<string, Function>

  constructor(context: EvaluationContext, functions: Map<string, Function>) {
    this.context = context
    this.functions = functions
  }

  evaluate(node: ExpressionAST): any {
    switch (node.type) {
      case 'literal':
        return node.value

      case 'identifier':
        return this.resolveIdentifier(node.name)

      case 'binary':
        return this.evaluateBinary(node)

      case 'unary':
        return this.evaluateUnary(node)

      case 'call':
        return this.evaluateCall(node)

      case 'member':
        return this.evaluateMember(node)

      default:
        throw new Error(`未知的AST节点类型: ${node.type}`)
    }
  }

  private resolveIdentifier(name: string): any {
    const parts = name.split('.')
    let value = this.context

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part]
      } else {
        return undefined
      }
    }

    return value
  }

  private evaluateBinary(node: any): any {
    const left = this.evaluate(node.left)
    const right = this.evaluate(node.right)

    switch (node.operator) {
      case '+': return left + right
      case '-': return left - right
      case '*': return left * right
      case '/': return left / right
      case '==': return left == right
      case '!=': return left != right
      case '>': return left > right
      case '>=': return left >= right
      case '<': return left < right
      case '<=': return left <= right
      case '&&': return left && right
      case '||': return left || right
      default:
        throw new Error(`未知的二元操作符: ${node.operator}`)
    }
  }

  private evaluateUnary(node: any): any {
    const operand = this.evaluate(node.operand)

    switch (node.operator) {
      case '-': return -operand
      case '!': return !operand
      default:
        throw new Error(`未知的一元操作符: ${node.operator}`)
    }
  }

  private evaluateCall(node: any): any {
    const callee = this.evaluate(node.callee)
    const args = node.arguments.map((arg: any) => this.evaluate(arg))

    if (typeof callee === 'function') {
      return callee(...args)
    }

    throw new Error(`${callee} 不是一个函数`)
  }

  private evaluateMember(node: any): any {
    const object = this.evaluate(node.object)
    
    if (object && typeof object === 'object') {
      return object[node.property]
    }

    return undefined
  }
}
