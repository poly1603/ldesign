/**
 * 交互式询问管理器
 */

import type { Interface } from 'node:readline'
import type { ChoiceOption, InquirerOptions, InquirerValidationResult, Question } from '../types'
import { stdin, stdout } from 'node:process'
import { createInterface } from 'node:readline'

/**
 * 交互式询问管理器
 */
export class InquirerManager {
  private rl: Interface
  private options: Required<InquirerOptions>

  constructor(options: InquirerOptions = {}) {
    this.options = {
      input: options.input ?? stdin,
      output: options.output ?? stdout,
      colors: options.colors ?? true,
      ...options,
    }

    this.rl = createInterface({
      input: this.options.input,
      output: this.options.output,
      terminal: true,
    })
  }

  /**
   * 询问单个问题
   */
  async ask<T = unknown>(question: Question): Promise<T> {
    return new Promise((resolve, reject) => {
      this.askQuestion(
        question,
        (answer) => {
          resolve(answer as T)
        },
        reject,
      )
    })
  }

  /**
   * 询问多个问题
   */
  async askMany(questions: Question[]): Promise<Record<string, unknown>> {
    const answers: Record<string, unknown> = {}

    for (const question of questions) {
      // 检查条件
      if (question.when && !question.when(answers)) {
        continue
      }

      // 处理默认值
      if (question.default !== undefined) {
        if (typeof question.default === 'function') {
          question.default = question.default(answers)
        }
      }

      const answer = await this.ask(question)
      answers[question.name] = answer
    }

    return answers
  }

  /**
   * 文本输入
   */
  async input(options: {
    message: string
    default?: string
    validate?: (input: string) => InquirerValidationResult
    transform?: (input: string) => string
  }): Promise<string> {
    return this.ask({
      type: 'input',
      name: 'value',
      message: options.message,
      default: options.default,
      validate: options.validate,
      transform: options.transform,
    })
  }

  /**
   * 密码输入
   */
  async password(options: {
    message: string
    mask?: string
    validate?: (input: string) => InquirerValidationResult
  }): Promise<string> {
    return this.ask({
      type: 'password',
      name: 'value',
      message: options.message,
      mask: options.mask,
      validate: options.validate,
    })
  }

  /**
   * 确认询问
   */
  async confirm(options: { message: string, default?: boolean }): Promise<boolean> {
    return this.ask({
      type: 'confirm',
      name: 'value',
      message: options.message,
      default: options.default,
    })
  }

  /**
   * 单选列表
   */
  async select<T = unknown>(options: {
    message: string
    choices: ChoiceOption<T>[]
    default?: T
    pageSize?: number
  }): Promise<T> {
    return this.ask({
      type: 'list',
      name: 'value',
      message: options.message,
      choices: options.choices,
      default: options.default,
      pageSize: options.pageSize,
    })
  }

  /**
   * 多选列表
   */
  async multiSelect<T = unknown>(options: {
    message: string
    choices: ChoiceOption<T>[]
    default?: T[]
    pageSize?: number
    validate?: (selected: T[]) => InquirerValidationResult
  }): Promise<T[]> {
    return this.ask({
      type: 'checkbox',
      name: 'value',
      message: options.message,
      choices: options.choices,
      default: options.default,
      pageSize: options.pageSize,
      validate: options.validate,
    })
  }

  /**
   * 数字输入
   */
  async number(options: {
    message: string
    default?: number
    min?: number
    max?: number
    validate?: (input: number) => InquirerValidationResult
  }): Promise<number> {
    return this.ask({
      type: 'number',
      name: 'value',
      message: options.message,
      default: options.default,
      validate: (input: string) => {
        const num = Number.parseFloat(input)

        if (Number.isNaN(num)) {
          return '请输入有效的数字'
        }

        if (options.min !== undefined && num < options.min) {
          return `数字不能小于 ${options.min}`
        }

        if (options.max !== undefined && num > options.max) {
          return `数字不能大于 ${options.max}`
        }

        return options.validate ? options.validate(num) : true
      },
      transform: (input: string) => Number.parseFloat(input),
    })
  }

  /**
   * 编辑器输入
   */
  async editor(options: {
    message: string
    default?: string
    validate?: (input: string) => InquirerValidationResult
  }): Promise<string> {
    return this.ask({
      type: 'editor',
      name: 'value',
      message: options.message,
      default: options.default,
      validate: options.validate,
    })
  }

  /**
   * 自动完成输入
   */
  async autocomplete(options: {
    message: string
    source: (input: string) => Promise<string[]> | string[]
    default?: string
    validate?: (input: string) => InquirerValidationResult
  }): Promise<string> {
    return this.ask({
      type: 'autocomplete',
      name: 'value',
      message: options.message,
      source: options.source,
      default: options.default,
      validate: options.validate,
    })
  }

  /**
   * 关闭询问器
   */
  close(): void {
    this.rl.close()
  }

  /**
   * 询问单个问题的内部实现
   */
  private askQuestion(
    question: Question,
    onAnswer: (answer: unknown) => void,
    onError: (error: Error) => void,
  ): void {
    try {
      switch (question.type) {
        case 'input':
          this.handleInput(question, onAnswer, onError)
          break
        case 'password':
          this.handlePassword(question, onAnswer, onError)
          break
        case 'confirm':
          this.handleConfirm(question, onAnswer, onError)
          break
        case 'list':
          this.handleList(question, onAnswer, onError)
          break
        case 'checkbox':
          this.handleCheckbox(question, onAnswer, onError)
          break
        case 'number':
          this.handleNumber(question, onAnswer, onError)
          break
        case 'editor':
          this.handleEditor(question, onAnswer, onError)
          break
        case 'autocomplete':
          this.handleAutocomplete(question, onAnswer, onError)
          break
        default:
          onError(new Error(`Unsupported question type: ${question.type}`))
      }
    }
    catch (error) {
      onError(error as Error)
    }
  }

  /**
   * 处理文本输入
   */
  private handleInput(
    question: Question,
    onAnswer: (answer: unknown) => void,
    onError: (error: Error) => void,
  ): void {
    const prompt = this.formatPrompt(question)

    this.rl.question(prompt, async (input) => {
      try {
        const value = input.trim() || question.default || ''

        // 验证输入
        if (question.validate) {
          const validation = await this.validateInput(value, question.validate)
          if (validation !== true) {
            this.output(this.colorize(validation, 'red'))
            return this.handleInput(question, onAnswer, onError)
          }
        }

        // 转换输入
        const finalValue = question.transform ? question.transform(value) : value
        onAnswer(finalValue)
      }
      catch (error) {
        onError(error as Error)
      }
    })
  }

  /**
   * 处理密码输入
   */
  private handlePassword(
    question: Question,
    onAnswer: (answer: unknown) => void,
    onError: (error: Error) => void,
  ): void {
    const prompt = this.formatPrompt(question)
    this.output(prompt)

    // 隐藏输入
    type RawTTY = NodeJS.ReadStream & { setRawMode?: (mode: boolean) => void }
    const stdin = this.options.input as RawTTY
    if (typeof stdin.setRawMode === 'function') {
      stdin.setRawMode(true)
    }

    let password = ''
    const mask = question.mask || '*'

    const onData = (char: Buffer) => {
      const str = char.toString()

      if (str === '\n' || str === '\r' || str === '\u0004') {
        // 回车或 Ctrl+D
        if (typeof stdin.setRawMode === 'function') {
          stdin.setRawMode(false)
        }
        stdin.removeListener('data', onData)
        this.output('\n')

        // 验证密码
        this.validateInput(password, question.validate)
          .then((validation) => {
            if (validation === true) {
              onAnswer(password)
            }
            else {
              this.output(this.colorize(validation, 'red'))
              this.handlePassword(question, onAnswer, onError)
            }
          })
          .catch(onError)
      }
      else if (str === '\u0003') {
        // Ctrl+C
        if (typeof stdin.setRawMode === 'function') {
          stdin.setRawMode(false)
        }
        stdin.removeListener('data', onData)
        onError(new Error('User cancelled'))
      }
      else if (str === '\u007F' || str === '\b') {
        // 退格
        if (password.length > 0) {
          password = password.slice(0, -1)
          this.output('\b \b')
        }
      }
      else if (str.charCodeAt(0) >= 32) {
        // 可打印字符
        password += str
        this.output(mask)
      }
    }

    stdin.on('data', onData)
  }

  /**
   * 处理确认询问
   */
  private handleConfirm(
    question: Question,
    onAnswer: (answer: unknown) => void,
    onError: (error: Error) => void,
  ): void {
    const defaultValue = question.default !== undefined ? question.default : true
    const defaultText = defaultValue ? 'Y/n' : 'y/N'
    const prompt = `${question.message} (${defaultText}) `

    this.rl.question(prompt, (input) => {
      const value = input.trim().toLowerCase()

      if (value === '') {
        onAnswer(defaultValue)
      }
      else if (value === 'y' || value === 'yes') {
        onAnswer(true)
      }
      else if (value === 'n' || value === 'no') {
        onAnswer(false)
      }
      else {
        this.output(this.colorize('请输入 y 或 n', 'red'))
        this.handleConfirm(question, onAnswer, onError)
      }
    })
  }

  /**
   * 处理列表选择
   */
  private handleList(
    question: Question,
    onAnswer: (answer: unknown) => void,
    onError: (error: Error) => void,
  ): void {
    if (!question.choices || question.choices.length === 0) {
      onError(new Error('No choices provided'))
      return
    }

    this.output(question.message)
    question.choices.forEach((choice, index) => {
      const choiceText = typeof choice === 'string' ? choice : choice.name
      this.output(`  ${index + 1}) ${choiceText}`)
    })

    this.rl.question('请选择 (输入数字): ', (input) => {
      const index = Number.parseInt(input.trim()) - 1

      if (Number.isNaN(index) || index < 0 || index >= question.choices!.length) {
        this.output(this.colorize('无效的选择', 'red'))
        this.handleList(question, onAnswer, onError)
        return
      }

      const choice = question.choices![index]!
      const value = typeof choice === 'string' ? choice : (choice as { value?: unknown }).value
      onAnswer(value as unknown)
    })
  }

  /**
   * 处理多选
   */
  private handleCheckbox(
    question: Question,
    onAnswer: (answer: unknown) => void,
    onError: (error: Error) => void,
  ): void {
    if (!question.choices || question.choices.length === 0) {
      onError(new Error('No choices provided'))
      return
    }

    this.output(question.message)
    this.output('(使用空格分隔多个选择)')

    question.choices.forEach((choice, index) => {
      const choiceText = typeof choice === 'string' ? choice : choice.name
      this.output(`  ${index + 1}) ${choiceText}`)
    })

    this.rl.question('请选择 (输入数字，用空格分隔): ', async (input) => {
      try {
        const indices = input
          .trim()
          .split(/\s+/)
          .map(s => Number.parseInt(s) - 1)
        const selected: unknown[] = []

        for (const index of indices) {
          if (Number.isNaN(index) || index < 0 || index >= question.choices!.length) {
            this.output(this.colorize(`无效的选择: ${index + 1}`, 'red'))
            this.handleCheckbox(question, onAnswer, onError)
            return
          }

          const choice = question.choices![index]!
          const value = typeof choice === 'string' ? choice : (choice as { value?: unknown }).value
          selected.push(value as unknown)
        }

        // 验证选择
        if (question.validate) {
          const validation = await this.validateInput(selected, question.validate)
          if (validation !== true) {
            this.output(this.colorize(validation, 'red'))
            this.handleCheckbox(question, onAnswer, onError)
            return
          }
        }

        onAnswer(selected)
      }
      catch (error) {
        onError(error as Error)
      }
    })
  }

  /**
   * 处理数字输入
   */
  private handleNumber(
    question: Question,
    onAnswer: (answer: unknown) => void,
    onError: (error: Error) => void,
  ): void {
    // 复用文本输入处理，验证在 number() 方法中已处理
    this.handleInput(question, onAnswer, onError)
  }

  /**
   * 处理编辑器输入
   */
  private handleEditor(
    question: Question,
    onAnswer: (answer: unknown) => void,
    _onError: (error: Error) => void,
  ): void {
    // 简化实现，实际应该启动外部编辑器
    this.output(`${question.message} (按 Ctrl+D 结束输入):`)

    let content = ''
    const stdin = this.options.input as NodeJS.ReadStream

    const onData = (chunk: Buffer) => {
      const str = chunk.toString()
      if (str === '\u0004') {
        // Ctrl+D
        stdin.removeListener('data', onData)
        onAnswer(content.trim())
      }
      else {
        content += str
        this.output(str)
      }
    }

    stdin.on('data', onData)
  }

  /**
   * 处理自动完成输入
   */
  private handleAutocomplete(
    question: Question,
    onAnswer: (answer: unknown) => void,
    onError: (error: Error) => void,
  ): void {
    // 简化实现，实际应该实现实时自动完成
    this.handleInput(question, onAnswer, onError)
  }

  /**
   * 验证输入
   */
  private async validateInput<V>(
    value: V,
    validator?: (value: V) => InquirerValidationResult,
  ): Promise<string | true> {
    if (!validator)
      return true

    try {
      const result = await validator(value)
      return result === true ? true : result || 'Invalid input'
    }
    catch (error) {
      return (error as Error).message
    }
  }

  /**
   * 格式化提示符
   */
  private formatPrompt(question: Question): string {
    let prompt = question.message

    if (question.default !== undefined) {
      prompt += ` (${question.default})`
    }

    prompt += ': '
    return prompt
  }

  /**
   * 输出文本
   */
  private output(text: string): void {
    this.options.output.write(text)
  }

  /**
   * 着色文本
   */
  private colorize(text: string, color: string): string {
    if (!this.options.colors)
      return text

    const colors: Record<string, string> = {
      red: '\x1B[31m',
      green: '\x1B[32m',
      yellow: '\x1B[33m',
      blue: '\x1B[34m',
      magenta: '\x1B[35m',
      cyan: '\x1B[36m',
      reset: '\x1B[0m',
    }

    return `${colors[color] || ''}${text}${colors.reset}`
  }

  /**
   * 创建询问器实例
   */
  static create(options?: InquirerOptions): InquirerManager {
    return new InquirerManager(options)
  }
}
