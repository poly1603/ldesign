/**
 * 交互式提示管理器
 */

import type { Interface } from 'node:readline'
import type { PromptManagerOptions, PromptOptions } from '../types'
import { createInterface } from 'node:readline'

/**
 * 提示管理器
 */
export class PromptManager {
  private options: Required<PromptManagerOptions>
  private readline?: Interface

  constructor(options: PromptManagerOptions = {}) {
    this.options = {
      enabled: options.enabled ?? true,
      input: options.input ?? process.stdin,
      output: options.output ?? process.stdout,
      ...options,
    }

    if (this.options.enabled) {
      this.readline = createInterface({
        input: this.options.input,
        output: this.options.output,
      })
    }
  }

  /**
   * 通用提示方法
   */
  async prompt<T = unknown>(options: PromptOptions): Promise<T> {
    if (!this.options.enabled) {
      return options.initial as T
    }

    switch (options.type) {
      case 'text':
        return this.input(options.message, options.initial) as Promise<T>

      case 'password':
        return this.password(options.message) as Promise<T>

      case 'confirm':
        return this.confirm(options.message, options.initial) as Promise<T>

      case 'select':
        return this.select(options.message, options.choices || []) as Promise<T>

      case 'multiselect':
        return this.multiselect(options.message, options.choices || []) as Promise<T>

      case 'number':
        return this.number(options.message, options.initial) as Promise<T>

      default:
        throw new Error(`不支持的提示类型: ${options.type}`)
    }
  }

  /**
   * 文本输入
   */
  async input(message: string, defaultValue?: string): Promise<string> {
    if (!this.options.enabled) {
      return defaultValue || ''
    }

    return new Promise((resolve) => {
      const prompt = defaultValue ? `${message} (${defaultValue}): ` : `${message}: `

      this.readline!.question(prompt, (answer: string) => {
        resolve(answer.trim() || defaultValue || '')
      })
    })
  }

  /**
   * 密码输入
   */
  async password(message: string): Promise<string> {
    if (!this.options.enabled) {
      return ''
    }

    return new Promise((resolve) => {
      const prompt = `${message}: `

      // 隐藏输入
      type RawTTY = NodeJS.ReadStream & { setRawMode?: (mode: boolean) => void }
      const stdin = process.stdin as RawTTY
      const originalMode = stdin.isTTY && typeof stdin.setRawMode === 'function' ? stdin.setRawMode : null

      if (originalMode) {
        stdin.setRawMode!(true)
      }

      process.stdout.write(prompt)

      let password = ''

      const onData = (char: Buffer) => {
        const str = char.toString()

        switch (str) {
          case '\n':
          case '\r':
          case '\u0004': // Ctrl+D
            if (originalMode) {
              stdin.setRawMode!(false)
            }
            stdin.removeListener('data', onData)
            process.stdout.write('\n')
            resolve(password)
            break

          case '\u0003': // Ctrl+C
            if (originalMode) {
              stdin.setRawMode!(false)
            }
            stdin.removeListener('data', onData)
            process.stdout.write('\n')
            process.exit(1)
            break

          case '\u007F': // Backspace
            if (password.length > 0) {
              password = password.slice(0, -1)
              process.stdout.write('\b \b')
            }
            break

          default:
            password += str
            process.stdout.write('*')
            break
        }
      }

      stdin.on('data', onData)
    })
  }

  /**
   * 确认提示
   */
  async confirm(message: string, defaultValue = false): Promise<boolean> {
    if (!this.options.enabled) {
      return defaultValue
    }

    const defaultText = defaultValue ? 'Y/n' : 'y/N'
    const answer = await this.input(`${message} (${defaultText})`)

    if (!answer) {
      return defaultValue
    }

    return /^y(?:es)?$/i.test(answer)
  }

  /**
   * 选择提示
   */
  async select<T = string>(
    message: string,
    choices: Array<{ title: string, value: T, description?: string }>,
  ): Promise<T> {
    if (!this.options.enabled) {
      if (choices[0]?.value !== undefined) {
        return choices[0].value
      }
      throw new Error('No choices available and prompts are disabled')
    }

    this.options.output.write(`${message}\n`)
    choices.forEach((choice, index) => {
      const description = choice.description ? ` - ${choice.description}` : ''
      this.options.output.write(`  ${index + 1}. ${choice.title}${description}\n`)
    })

    while (true) {
      const answer = await this.input('请选择 (输入数字)')
      const index = Number.parseInt(answer) - 1

      if (index >= 0 && index < choices.length && choices[index]) {
        return choices[index].value
      }

      this.options.output.write('无效选择，请重试\n')
    }
  }

  /**
   * 多选提示
   */
  async multiselect<T = string>(
    message: string,
    choices: Array<{ title: string, value: T, description?: string }>,
  ): Promise<T[]> {
    if (!this.options.enabled) {
      return []
    }

    this.options.output.write(`${message}\n`)
    this.options.output.write('(使用空格分隔多个选择，例如: 1 3 5)\n')

    choices.forEach((choice, index) => {
      const description = choice.description ? ` - ${choice.description}` : ''
      this.options.output.write(`  ${index + 1}. ${choice.title}${description}\n`)
    })

    while (true) {
      const answer = await this.input('请选择 (输入数字，空格分隔)')
      const indices = answer
        .split(/\s+/)
        .map(s => Number.parseInt(s.trim()) - 1)
        .filter(i => i >= 0 && i < choices.length)

      if (indices.length > 0) {
        return indices
          .map(i => choices[i])
          .filter(choice => choice)
          .map(choice => choice!.value)
      }

      if (answer.trim() === '') {
        return []
      }

      this.options.output.write('无效选择，请重试\n')
    }
  }

  /**
   * 数字输入
   */
  async number(message: string, defaultValue?: number): Promise<number> {
    if (!this.options.enabled) {
      return defaultValue || 0
    }

    while (true) {
      const answer = await this.input(message, defaultValue?.toString())
      const num = Number(answer)

      if (!Number.isNaN(num)) {
        return num
      }

      this.options.output.write('请输入有效的数字\n')
    }
  }

  /**
   * 自动完成输入
   */
  async autocomplete(message: string, choices: string[], defaultValue?: string): Promise<string> {
    if (!this.options.enabled) {
      return defaultValue || choices[0] || ''
    }

    // 简化版自动完成，实际实现可能需要更复杂的逻辑
    this.options.output.write(`${message}\n`)
    this.options.output.write(`可选项: ${choices.join(', ')}\n`)

    while (true) {
      const answer = await this.input('请输入', defaultValue)

      // 精确匹配
      if (choices.includes(answer)) {
        return answer
      }

      // 模糊匹配
      const matches = choices.filter(choice => choice.toLowerCase().includes(answer.toLowerCase()))

      if (matches.length === 1 && matches[0]) {
        return matches[0]
      }
      else if (matches.length > 1) {
        this.options.output.write(`多个匹配项: ${matches.join(', ')}\n`)
        this.options.output.write('请输入更具体的内容\n')
      }
      else {
        this.options.output.write('没有匹配项，请重试\n')
      }
    }
  }

  /**
   * 列表选择（支持搜索）
   */
  async searchableSelect<T = string>(
    message: string,
    choices: Array<{ title: string, value: T, description?: string }>,
    searchPlaceholder = '搜索...',
  ): Promise<T> {
    if (!this.options.enabled) {
      if (choices[0]?.value !== undefined) {
        return choices[0].value
      }
      throw new Error('No choices available and prompts are disabled')
    }

    this.options.output.write(`${message}\n`)
    this.options.output.write(`输入关键词搜索，或直接输入数字选择\n`)

    while (true) {
      // 显示当前选项
      choices.forEach((choice, index) => {
        const description = choice.description ? ` - ${choice.description}` : ''
        this.options.output.write(`  ${index + 1}. ${choice.title}${description}\n`)
      })

      const answer = await this.input(searchPlaceholder)

      // 尝试数字选择
      const index = Number.parseInt(answer) - 1
      if (index >= 0 && index < choices.length && choices[index]) {
        return choices[index].value
      }

      // 搜索过滤
      const filtered = choices.filter(
        choice =>
          choice.title.toLowerCase().includes(answer.toLowerCase())
          || (choice.description && choice.description.toLowerCase().includes(answer.toLowerCase())),
      )

      if (filtered.length === 0) {
        this.options.output.write('没有找到匹配项，请重试\n')
        continue
      }
      else if (filtered.length === 1 && filtered[0]) {
        return filtered[0].value
      }
      else {
        this.options.output.write(`找到 ${filtered.length} 个匹配项:\n`)
        choices = filtered
      }
    }
  }

  /**
   * 关闭提示管理器
   */
  close(): void {
    if (this.readline) {
      this.readline.close()
    }
  }

  /**
   * 创建提示管理器实例
   */
  static create(options?: PromptManagerOptions): PromptManager {
    return new PromptManager(options)
  }
}
