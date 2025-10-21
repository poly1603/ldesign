export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export class Logger {
  constructor(private prefix: string = 'LIB') {}

  private format(level: LogLevel, args: any[]) {
    const ts = new Date().toISOString()
    return [`[${ts}]`, `[${this.prefix}]`, `[${level.toUpperCase()}]`, ...args]
  }

  debug(...args: any[]) { console.debug(...this.format('debug', args)) }
  info(...args: any[]) { console.info(...this.format('info', args)) }
  warn(...args: any[]) { console.warn(...this.format('warn', args)) }
  error(...args: any[]) { console.error(...this.format('error', args)) }
}

