/**
 * 命令行参数解析器
 */

import type { CommandOptions, OptionDefinition, ParsedArgs, ParserOptions } from '../types'

/**
 * 命令行参数解析器
 */
export class CommandParser {
  private commands = new Map<string, CommandOptions>()
  private globalOptions: OptionDefinition[] = []
  private options: Required<ParserOptions>

  constructor(options: ParserOptions = {}) {
    this.options = {
      allowUnknownOptions: options.allowUnknownOptions ?? false,
      stopAtFirstUnknown: options.stopAtFirstUnknown ?? false,
      caseSensitive: options.caseSensitive ?? false,
      helpOption: options.helpOption ?? true,
      versionOption: options.versionOption ?? true,
      version: options.version ?? '1.0.0',
      description: options.description ?? '',
      ...options,
    }

    if (this.options.helpOption) {
      this.addGlobalOption({
        name: 'help',
        alias: 'h',
        description: '显示帮助信息',
        type: 'boolean',
      })
    }

    if (this.options.versionOption) {
      this.addGlobalOption({
        name: 'version',
        alias: 'v',
        description: '显示版本信息',
        type: 'boolean',
      })
    }
  }

  /**
   * 添加命令
   */
  addCommand(command: CommandOptions): void {
    this.commands.set(command.name, command)
  }

  /**
   * 添加全局选项
   */
  addGlobalOption(option: OptionDefinition): void {
    this.globalOptions.push(option)
  }

  /**
   * 解析命令行参数
   */
  parse(args: string[] = process.argv.slice(2)): ParsedArgs {
    const result: ParsedArgs = {
      command: null,
      options: {},
      args: [],
      unknown: [],
    }

    let i = 0
    let currentCommand: CommandOptions | null = null

    // 查找命令
    if (args.length > 0 && args[0] && !args[0].startsWith('-')) {
      const commandName = args[0]
      currentCommand = this.commands.get(commandName) || null

      if (currentCommand) {
        result.command = commandName
        i = 1
      }
    }

    // 获取可用选项
    const availableOptions = [...this.globalOptions, ...(currentCommand?.options || [])]

    // 解析选项和参数
    while (i < args.length) {
      const arg = args[i]
      if (!arg) {
        i++
        continue
      }

      if (arg.startsWith('--')) {
        // 长选项
        const [name, value] = arg.slice(2).split('=', 2)
        if (!name) {
          this.handleUnknownOption(result, arg)
        }
        else {
          const option = this.findOption(availableOptions, name)

          if (option) {
            const parsedValue = this.parseOptionValue(option, value, args, i)
            result.options[option.name] = parsedValue.value
            i += parsedValue.consumed
          }
          else {
            this.handleUnknownOption(result, arg)
          }
        }
      }
      else if (arg.startsWith('-') && arg.length > 1) {
        // 短选项
        const flags = arg.slice(1)

        for (let j = 0; j < flags.length; j++) {
          const flag = flags[j]
          if (!flag)
            continue
          const option = this.findOptionByAlias(availableOptions, flag)

          if (option) {
            if (option.type === 'boolean') {
              result.options[option.name] = true
            }
            else {
              // 非布尔选项需要值
              let value: string | undefined

              if (j === flags.length - 1) {
                // 最后一个标志，从下一个参数获取值
                if (i + 1 < args.length) {
                  const nextArg = args[i + 1]
                  if (nextArg && !nextArg.startsWith('-')) {
                    value = nextArg
                    i++
                  }
                }
              }
              else {
                // 中间的标志，从剩余字符获取值
                value = flags.slice(j + 1)
                j = flags.length // 结束循环
              }

              const parsedValue = this.parseOptionValue(option, value)
              result.options[option.name] = parsedValue.value
            }
          }
          else {
            this.handleUnknownOption(result, `-${flag}`)
          }
        }
      }
      else {
        // 位置参数
        result.args.push(arg)
      }

      i++
    }

    // 应用默认值
    this.applyDefaults(result, availableOptions)

    // 验证必需选项
    this.validateRequired(result, availableOptions)

    return result
  }

  /**
   * 查找选项
   */
  private findOption(options: OptionDefinition[], name: string): OptionDefinition | undefined {
    const searchName = this.options.caseSensitive ? name : name.toLowerCase()

    return options.find((opt) => {
      const optName = this.options.caseSensitive ? opt.name : opt.name.toLowerCase()
      return optName === searchName
    })
  }

  /**
   * 通过别名查找选项
   */
  private findOptionByAlias(
    options: OptionDefinition[],
    alias: string,
  ): OptionDefinition | undefined {
    const searchAlias = this.options.caseSensitive ? alias : alias.toLowerCase()

    return options.find((opt) => {
      if (!opt.alias)
        return false
      const optAlias = this.options.caseSensitive ? opt.alias : opt.alias.toLowerCase()
      return optAlias === searchAlias
    })
  }

  /**
   * 解析选项值
   */
  private parseOptionValue(
    option: OptionDefinition,
    value: string | undefined,
    args?: string[],
    index?: number,
  ): { value: any, consumed: number } {
    let consumed = 1

    if (option.type === 'boolean') {
      return { value: value !== 'false', consumed }
    }

    if (value === undefined) {
      if (
        args
        && index !== undefined
        && index + 1 < args.length
      ) {
        const nextArg = args[index + 1]
        if (nextArg && !nextArg.startsWith('-')) {
          value = nextArg
          consumed = 2
        }
      }
      else if (option.required) {
        throw new Error(`选项 --${option.name} 需要一个值`)
      }
      else {
        return { value: option.default, consumed }
      }
    }

    switch (option.type) {
      case 'number': {
        const num = Number(value)
        if (Number.isNaN(num)) {
          throw new TypeError(`选项 --${option.name} 需要一个数字值，得到: ${value}`)
        }
        return { value: num, consumed }
      }

      case 'string':
      default:
        if (option.choices && value !== undefined && !option.choices.includes(value)) {
          throw new Error(`选项 --${option.name} 的值必须是以下之一: ${option.choices.join(', ')}`)
        }
        return { value, consumed }
    }
  }

  /**
   * 处理未知选项
   */
  private handleUnknownOption(result: ParsedArgs, option: string): void {
    if (this.options.allowUnknownOptions) {
      result.unknown.push(option)
    }
    else if (this.options.stopAtFirstUnknown) {
      throw new Error(`未知选项: ${option}`)
    }
    else {
      result.unknown.push(option)
    }
  }

  /**
   * 应用默认值
   */
  private applyDefaults(result: ParsedArgs, options: OptionDefinition[]): void {
    for (const option of options) {
      if (!(option.name in result.options) && option.default !== undefined) {
        result.options[option.name] = option.default
      }
    }
  }

  /**
   * 验证必需选项
   */
  private validateRequired(result: ParsedArgs, options: OptionDefinition[]): void {
    for (const option of options) {
      if (option.required && !(option.name in result.options)) {
        throw new Error(`缺少必需选项: --${option.name}`)
      }
    }
  }

  /**
   * 生成帮助信息
   */
  generateHelp(commandName?: string): string {
    if (commandName && this.commands.has(commandName)) {
      return this.generateCommandHelp(this.commands.get(commandName)!)
    }

    return this.generateGeneralHelp()
  }

  /**
   * 生成通用帮助信息
   */
  private generateGeneralHelp(): string {
    const lines: string[] = []

    if (this.options.description) {
      lines.push(this.options.description)
      lines.push('')
    }

    lines.push('用法:')
    lines.push('  <command> [options] [arguments]')
    lines.push('')

    if (this.commands.size > 0) {
      lines.push('可用命令:')
      const maxNameLength = Math.max(...Array.from(this.commands.keys()).map(name => name.length))

      for (const [name, command] of this.commands) {
        const padding = ' '.repeat(maxNameLength - name.length + 2)
        lines.push(`  ${name}${padding}${command.description}`)
      }
      lines.push('')
    }

    if (this.globalOptions.length > 0) {
      lines.push('全局选项:')
      lines.push(this.formatOptions(this.globalOptions))
    }

    return lines.join('\n')
  }

  /**
   * 生成命令帮助信息
   */
  private generateCommandHelp(command: CommandOptions): string {
    const lines: string[] = []

    lines.push(`命令: ${command.name}`)
    lines.push(command.description)
    lines.push('')

    if (command.usage) {
      lines.push('用法:')
      lines.push(`  ${command.usage}`)
      lines.push('')
    }

    if (command.options && command.options.length > 0) {
      lines.push('选项:')
      lines.push(this.formatOptions(command.options))
      lines.push('')
    }

    if (this.globalOptions.length > 0) {
      lines.push('全局选项:')
      lines.push(this.formatOptions(this.globalOptions))
      lines.push('')
    }

    if (command.examples && command.examples.length > 0) {
      lines.push('示例:')
      for (const example of command.examples) {
        lines.push(`  ${example}`)
      }
    }

    return lines.join('\n')
  }

  /**
   * 格式化选项列表
   */
  private formatOptions(options: OptionDefinition[]): string {
    const lines: string[] = []
    const maxLength = Math.max(
      ...options.map((opt) => {
        const name = `--${opt.name}`
        const alias = opt.alias ? `, -${opt.alias}` : ''
        return (name + alias).length
      }),
    )

    for (const option of options) {
      const name = `--${option.name}`
      const alias = option.alias ? `, -${option.alias}` : ''
      const nameStr = name + alias
      const padding = ' '.repeat(maxLength - nameStr.length + 2)

      let description = option.description
      if (option.required) {
        description += ' (必需)'
      }
      if (option.default !== undefined) {
        description += ` (默认: ${option.default})`
      }
      if (option.choices) {
        description += ` (选择: ${option.choices.join(', ')})`
      }

      lines.push(`  ${nameStr}${padding}${description}`)
    }

    return lines.join('\n')
  }

  /**
   * 获取所有命令
   */
  getCommands(): Map<string, CommandOptions> {
    return new Map(this.commands)
  }

  /**
   * 检查是否有命令
   */
  hasCommand(name: string): boolean {
    return this.commands.has(name)
  }

  /**
   * 获取命令
   */
  getCommand(name: string): CommandOptions | undefined {
    return this.commands.get(name)
  }

  /**
   * 创建解析器实例
   */
  static create(options?: ParserOptions): CommandParser {
    return new CommandParser(options)
  }
}
