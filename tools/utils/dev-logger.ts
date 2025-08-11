/**
 * 开发环境日志工具
 * 提供更好的错误提示和调试信息
 */

import chalk from 'chalk'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success'

export interface LogOptions {
  level?: LogLevel
  timestamp?: boolean
  prefix?: string
  group?: boolean
}

export class DevLogger {
  private static instance: DevLogger
  private level: LogLevel = 'info'
  private enableTimestamp = true

  static getInstance(): DevLogger {
    if (!DevLogger.instance) {
      DevLogger.instance = new DevLogger()
    }
    return DevLogger.instance
  }

  setLevel(level: LogLevel) {
    this.level = level
  }

  setTimestamp(enabled: boolean) {
    this.enableTimestamp = enabled
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = ['debug', 'info', 'warn', 'error', 'success']
    const currentIndex = levels.indexOf(this.level)
    const messageIndex = levels.indexOf(level)
    return messageIndex >= currentIndex
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    options: LogOptions = {}
  ): string {
    let formatted = ''

    // 时间戳
    if (this.enableTimestamp && options.timestamp !== false) {
      const timestamp = new Date().toLocaleTimeString()
      formatted += chalk.gray(`[${timestamp}] `)
    }

    // 级别标识
    const levelColors = {
      debug: chalk.blue,
      info: chalk.cyan,
      warn: chalk.yellow,
      error: chalk.red,
      success: chalk.green,
    }

    const levelIcons = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      success: '✅',
    }

    formatted += levelColors[level](
      `${levelIcons[level]} [${level.toUpperCase()}]`
    )

    // 前缀
    if (options.prefix) {
      formatted += chalk.magenta(` [${options.prefix}]`)
    }

    formatted += ` ${message}`

    return formatted
  }

  debug(message: string, options: LogOptions = {}) {
    if (this.shouldLog('debug')) {
      const formatted = this.formatMessage('debug', message, options)
      console.log(formatted)
    }
  }

  info(message: string, options: LogOptions = {}) {
    if (this.shouldLog('info')) {
      const formatted = this.formatMessage('info', message, options)
      console.log(formatted)
    }
  }

  warn(message: string, options: LogOptions = {}) {
    if (this.shouldLog('warn')) {
      const formatted = this.formatMessage('warn', message, options)
      console.warn(formatted)
    }
  }

  error(message: string, error?: Error, options: LogOptions = {}) {
    if (this.shouldLog('error')) {
      const formatted = this.formatMessage('error', message, options)
      console.error(formatted)

      if (error) {
        console.error(chalk.red('Stack trace:'))
        console.error(chalk.gray(error.stack))
      }
    }
  }

  success(message: string, options: LogOptions = {}) {
    if (this.shouldLog('success')) {
      const formatted = this.formatMessage('success', message, options)
      console.log(formatted)
    }
  }

  group(title: string, callback: () => void, options: LogOptions = {}) {
    if (options.group !== false) {
      const formatted = this.formatMessage('info', title, options)
      console.group(formatted)
      callback()
      console.groupEnd()
    } else {
      callback()
    }
  }

  table(data: any[], title?: string) {
    if (title) {
      this.info(title)
    }
    console.table(data)
  }

  progress(current: number, total: number, message: string) {
    const percentage = Math.round((current / total) * 100)
    const progressBar =
      '█'.repeat(Math.round(percentage / 5)) +
      '░'.repeat(20 - Math.round(percentage / 5))
    const formatted = `${chalk.cyan(
      '📊'
    )} ${message} [${progressBar}] ${percentage}% (${current}/${total})`

    // 清除当前行并打印新的进度
    process.stdout.clearLine(0)
    process.stdout.cursorTo(0)
    process.stdout.write(formatted)

    if (current === total) {
      process.stdout.write('\n')
    }
  }

  spinner(message: string, promise: Promise<any>): Promise<any> {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
    let i = 0

    const interval = setInterval(() => {
      process.stdout.clearLine(0)
      process.stdout.cursorTo(0)
      process.stdout.write(`${chalk.cyan(frames[i])} ${message}`)
      i = (i + 1) % frames.length
    }, 100)

    return promise
      .then(result => {
        clearInterval(interval)
        process.stdout.clearLine(0)
        process.stdout.cursorTo(0)
        this.success(message)
        return result
      })
      .catch(error => {
        clearInterval(interval)
        process.stdout.clearLine(0)
        process.stdout.cursorTo(0)
        this.error(`${message} 失败`, error)
        throw error
      })
  }

  banner(title: string, subtitle?: string) {
    const width = 60
    const border = '═'.repeat(width)

    console.log(chalk.blue(`╔${border}╗`))
    console.log(
      chalk.blue(
        `║${' '.repeat((width - title.length) / 2)}${chalk.bold.white(
          title
        )}${' '.repeat(Math.ceil((width - title.length) / 2))}║`
      )
    )

    if (subtitle) {
      console.log(
        chalk.blue(
          `║${' '.repeat((width - subtitle.length) / 2)}${chalk.gray(
            subtitle
          )}${' '.repeat(Math.ceil((width - subtitle.length) / 2))}║`
        )
      )
    }

    console.log(chalk.blue(`╚${border}╝`))
  }

  divider(title?: string) {
    const width = 60
    if (title) {
      const padding = Math.max(0, (width - title.length - 2) / 2)
      const line = `${'─'.repeat(Math.floor(padding))} ${title} ${'─'.repeat(
        Math.ceil(padding)
      )}`
      console.log(chalk.gray(line))
    } else {
      console.log(chalk.gray('─'.repeat(width)))
    }
  }

  clear() {
    console.clear()
  }

  // 包特定的日志方法
  package(packageName: string, message: string, level: LogLevel = 'info') {
    this[level](message, { prefix: packageName })
  }

  // 构建相关的日志方法
  build(message: string, level: LogLevel = 'info') {
    this[level](message, { prefix: 'BUILD' })
  }

  // 测试相关的日志方法
  test(message: string, level: LogLevel = 'info') {
    this[level](message, { prefix: 'TEST' })
  }

  // 开发服务器相关的日志方法
  server(message: string, level: LogLevel = 'info') {
    this[level](message, { prefix: 'SERVER' })
  }
}

// 创建全局实例
export const logger = DevLogger.getInstance()

// 便捷方法
export const log = {
  debug: (message: string, options?: LogOptions) =>
    logger.debug(message, options),
  info: (message: string, options?: LogOptions) =>
    logger.info(message, options),
  warn: (message: string, options?: LogOptions) =>
    logger.warn(message, options),
  error: (message: string, error?: Error, options?: LogOptions) =>
    logger.error(message, error, options),
  success: (message: string, options?: LogOptions) =>
    logger.success(message, options),
  group: (title: string, callback: () => void, options?: LogOptions) =>
    logger.group(title, callback, options),
  table: (data: any[], title?: string) => logger.table(data, title),
  progress: (current: number, total: number, message: string) =>
    logger.progress(current, total, message),
  spinner: (message: string, promise: Promise<any>) =>
    logger.spinner(message, promise),
  banner: (title: string, subtitle?: string) => logger.banner(title, subtitle),
  divider: (title?: string) => logger.divider(title),
  clear: () => logger.clear(),
  package: (packageName: string, message: string, level?: LogLevel) =>
    logger.package(packageName, message, level),
  build: (message: string, level?: LogLevel) => logger.build(message, level),
  test: (message: string, level?: LogLevel) => logger.test(message, level),
  server: (message: string, level?: LogLevel) => logger.server(message, level),
}

// 设置开发环境默认配置
if (process.env.NODE_ENV === 'development') {
  logger.setLevel('debug')
  logger.setTimestamp(true)
}
