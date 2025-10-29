import chalk from 'chalk'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class Logger {
  private level: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info'

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    return levels.indexOf(level) >= levels.indexOf(this.level)
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString()
    const levelStr = level.toUpperCase().padEnd(5)
    return `[${timestamp}] ${levelStr} ${message} ${args.length > 0 ? JSON.stringify(args) : ''}`
  }

  debug(message: string, ...args: any[]) {
    if (this.shouldLog('debug')) {
      console.log(chalk.gray(this.formatMessage('debug', message, ...args)))
    }
  }

  info(message: string, ...args: any[]) {
    if (this.shouldLog('info')) {
      console.log(chalk.blue(this.formatMessage('info', message, ...args)))
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.shouldLog('warn')) {
      console.warn(chalk.yellow(this.formatMessage('warn', message, ...args)))
    }
  }

  error(message: string, ...args: any[]) {
    if (this.shouldLog('error')) {
      console.error(chalk.red(this.formatMessage('error', message, ...args)))
    }
  }
}

export const logger = new Logger()
