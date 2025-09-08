/**
 * 交互式询问工具函数
 */

import type { ChoiceOption, InquirerValidationResult, Question } from '../types'
import { InquirerManager } from './inquirer-manager'

/**
 * 交互式询问工具类
 */
export class InquirerUtils {
  /**
   * 快速文本输入
   */
  static async input(message: string, defaultValue?: string): Promise<string> {
    const inquirer = InquirerManager.create()
    try {
      return await inquirer.input({ message, default: defaultValue })
    }
    finally {
      inquirer.close()
    }
  }

  /**
   * 快速密码输入
   */
  static async password(message: string): Promise<string> {
    const inquirer = InquirerManager.create()
    try {
      return await inquirer.password({ message })
    }
    finally {
      inquirer.close()
    }
  }

  /**
   * 快速确认询问
   */
  static async confirm(message: string, defaultValue = true): Promise<boolean> {
    const inquirer = InquirerManager.create()
    try {
      return await inquirer.confirm({ message, default: defaultValue })
    }
    finally {
      inquirer.close()
    }
  }

  /**
   * 快速选择
   */
  static async select<T = string>(
    message: string,
    choices: (string | ChoiceOption<T>)[],
  ): Promise<T> {
    const inquirer = InquirerManager.create()
    try {
      const normalizedChoices = choices.map(choice =>
        typeof choice === 'string' ? { name: choice, value: choice as T } : choice,
      )
      return await inquirer.select({ message, choices: normalizedChoices })
    }
    finally {
      inquirer.close()
    }
  }

  /**
   * 快速多选
   */
  static async multiSelect<T = string>(
    message: string,
    choices: (string | ChoiceOption<T>)[],
  ): Promise<T[]> {
    const inquirer = InquirerManager.create()
    try {
      const normalizedChoices = choices.map(choice =>
        typeof choice === 'string' ? { name: choice, value: choice as T } : choice,
      )
      return await inquirer.multiSelect({ message, choices: normalizedChoices })
    }
    finally {
      inquirer.close()
    }
  }

  /**
   * 快速数字输入
   */
  static async number(
    message: string,
    options: { min?: number, max?: number, default?: number } = {},
  ): Promise<number> {
    const inquirer = InquirerManager.create()
    try {
      return await inquirer.number({ message, ...options })
    }
    finally {
      inquirer.close()
    }
  }

  /**
   * 创建验证器
   */
  static validators = {
    /**
     * 必填验证器
     */
    required(message = '此字段为必填项'): (value: unknown) => InquirerValidationResult {
      return (value: unknown) => {
        if (value === undefined || value === null || value === '') {
          return message
        }
        return true
      }
    },

    /**
     * 最小长度验证器
     */
    minLength(min: number, message?: string): (value: string) => InquirerValidationResult {
      return (value: string) => {
        if (value.length < min) {
          return message || `最少需要 ${min} 个字符`
        }
        return true
      }
    },

    /**
     * 最大长度验证器
     */
    maxLength(max: number, message?: string): (value: string) => InquirerValidationResult {
      return (value: string) => {
        if (value.length > max) {
          return message || `最多允许 ${max} 个字符`
        }
        return true
      }
    },

    /**
     * 邮箱验证器
     */
    email(message = '请输入有效的邮箱地址'): (value: string) => InquirerValidationResult {
      return (value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          return message
        }
        return true
      }
    },

    /**
     * URL 验证器
     */
    url(message = '请输入有效的 URL'): (value: string) => InquirerValidationResult {
      return (value: string) => {
        try {
          const parsed = new URL(value)
          void parsed
          return true
        }
        catch {
          return message
        }
      }
    },

    /**
     * 数字范围验证器
     */
    range(min: number, max: number, message?: string): (value: number) => InquirerValidationResult {
      return (value: number) => {
        if (value < min || value > max) {
          return message || `数值必须在 ${min} 到 ${max} 之间`
        }
        return true
      }
    },

    /**
     * 正则表达式验证器
     */
    pattern(
      regex: RegExp,
      message = '输入格式不正确',
    ): (value: string) => InquirerValidationResult {
      return (value: string) => {
        if (!regex.test(value)) {
          return message
        }
        return true
      }
    },

    /**
     * 自定义验证器
     */
    custom(validator: (value: unknown) => boolean | string): (value: unknown) => InquirerValidationResult {
      return (value: unknown) => {
        const result = validator(value)
        return result === true ? true : typeof result === 'string' ? result : '验证失败'
      }
    },

    /**
     * 组合验证器
     */
    combine(
      ...validators: Array<(value: unknown) => InquirerValidationResult>
    ): (value: unknown) => InquirerValidationResult {
      return (value: unknown) => {
        for (const validator of validators) {
          const result = validator(value)
          if (result !== true) {
            return result
          }
        }
        return true
      }
    },
  }

  /**
   * 创建问题构建器
   */
  static createQuestionBuilder() {
    return new QuestionBuilder()
  }

  /**
   * 批量询问助手
   */
  static async askSeries(questions: Question[]): Promise<Record<string, unknown>> {
    const inquirer = InquirerManager.create()
    try {
      return await inquirer.askMany(questions)
    }
    finally {
      inquirer.close()
    }
  }

  /**
   * 条件询问助手
   */
  static async askConditional(
    condition: () => boolean | Promise<boolean>,
    question: Question,
  ): Promise<unknown> {
    const shouldAsk = await condition()
    if (!shouldAsk) {
      return question.default
    }

    const inquirer = InquirerManager.create()
    try {
      return await inquirer.ask(question)
    }
    finally {
      inquirer.close()
    }
  }

  /**
   * 循环询问助手
   */
  static async askLoop<T>(
    question: Question,
    condition: (answer: T, answers: T[]) => boolean | Promise<boolean>,
  ): Promise<T[]> {
    const answers: T[] = []
    const inquirer = InquirerManager.create()

    try {
      while (true) {
        const answer = await inquirer.ask<T>(question)
        answers.push(answer)

        const shouldContinue = await condition(answer, answers)
        if (!shouldContinue) {
          break
        }
      }
    }
    finally {
      inquirer.close()
    }

    return answers
  }

  /**
   * 表单询问助手
   */
  static async askForm(config: {
    title?: string
    fields: Array<Question & { label?: string }>
    validate?: (answers: Record<string, unknown>) => InquirerValidationResult
  }): Promise<Record<string, unknown>> {
    const inquirer = InquirerManager.create()

    try {
      if (config.title) {
        process.stdout.write(`\n=== ${config.title} ===\n`)
      }

      const answers = await inquirer.askMany(config.fields)

      // 表单级验证
      if (config.validate) {
        const validation = await config.validate(answers)
        if (validation !== true) {
          process.stdout.write(`\n错误: ${validation}\n`)
          return this.askForm(config) // 重新询问
        }
      }

      return answers
    }
    finally {
      inquirer.close()
    }
  }

  /**
   * 菜单询问助手
   */
  static async askMenu<T = string>(config: {
    title: string
    choices: Array<ChoiceOption<T> & { description?: string }>
    allowBack?: boolean
    allowExit?: boolean
  }): Promise<T | 'back' | 'exit'> {
    const choices = [...config.choices]

    if (config.allowBack) {
      choices.push({ name: '← 返回', value: 'back' as T })
    }

    if (config.allowExit) {
      choices.push({ name: '✕ 退出', value: 'exit' as T })
    }

    process.stdout.write(`\n=== ${config.title} ===\n`)

    // 显示选项描述
    config.choices.forEach((choice, index) => {
      if (choice.description) {
        process.stdout.write(`  ${index + 1}. ${choice.name} - ${choice.description}\n`)
      }
    })

    return this.select('请选择:', choices)
  }
}

/**
 * 问题构建器
 */
class QuestionBuilder {
  private question: Partial<Question> = {}

  type(type: Question['type']): this {
    this.question.type = type
    return this
  }

  name(name: string): this {
    this.question.name = name
    return this
  }

  message(message: string): this {
    this.question.message = message
    return this
  }

  default(defaultValue: unknown): this {
    this.question.default = defaultValue
    return this
  }

  choices(choices: ChoiceOption<unknown>[]): this {
    this.question.choices = choices
    return this
  }

  validate(validator: (value: unknown) => InquirerValidationResult): this {
    this.question.validate = validator
    return this
  }

  when(condition: (answers: Record<string, unknown>) => boolean): this {
    this.question.when = condition
    return this
  }

  transform(transformer: (value: unknown) => unknown): this {
    this.question.transform = transformer
    return this
  }

  build(): Question {
    if (!this.question.type || !this.question.name || !this.question.message) {
      throw new Error('Question must have type, name, and message')
    }
    return this.question as Question
  }
}
