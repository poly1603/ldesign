/**
 * Logger 测试
 */


import { vi } from 'vitest'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { Logger } from '../../src/logger/logger'

describe('logger', () => {
  let tempDir: string
  let logger: Logger

  beforeEach(() => {
    tempDir = global.testUtils.createTempDir()
  })

  afterEach(async () => {
    if (logger) {
      await logger.destroy()
    }
    global.testUtils.cleanupTempDir(tempDir)
  })

  describe('基本日志记录', () => {
    beforeEach(() => {
      logger = Logger.create({
        level: 'debug',
        transports: [
          { type: 'console', silent: true }, // 静默控制台输出以避免测试噪音
        ],
      })
    })

    it('应该记录不同级别的日�?, () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      logger = Logger.create({
        level: 'debug',
        transports: [{ type: 'console' }],
      })

      logger.debug('Debug message')
      logger.info('Info message')
      logger.warn('Warning message')
      logger.error('Error message')

      expect(consoleSpy).toHaveBeenCalledTimes(4)
      consoleSpy.mockRestore()
    })

    it('应该根据日志级别过滤消息', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      logger = Logger.create({
        level: 'warn',
        transports: [{ type: 'console' }],
      })

      logger.debug('Debug message') // 不应该输�?      logger.info('Info message') // 不应该输�?      logger.warn('Warning message') // 应该输出
      logger.error('Error message') // 应该输出

      expect(consoleSpy).toHaveBeenCalledTimes(2)
      consoleSpy.mockRestore()
    })

    it('应该支持结构化日�?, () => {
      const messages: any[] = []

      logger.on('log', (entry) => {
        messages.push(entry)
      })

      logger.info('User action', {
        userId: 123,
        action: 'login',
        ip: '192.168.1.1',
      })

      expect(messages).toHaveLength(1)
      expect(messages[0].message).toBe('User action')
      expect(messages[0].metadata.userId).toBe(123)
      expect(messages[0].metadata.action).toBe('login')
      expect(messages[0].metadata.ip).toBe('192.168.1.1')
    })

    it('应该包含时间戳和级别', () => {
      const messages: any[] = []

      logger.on('log', (entry) => {
        messages.push(entry)
      })

      logger.info('Test message')

      expect(messages[0].timestamp).toBeInstanceOf(Date)
      expect(messages[0].level).toBe('info')
    })
  })

  describe('文件传输', () => {
    it('应该写入文件', async () => {
      const logFile = join(tempDir, 'app.log')

      logger = Logger.create({
        level: 'info',
        transports: [{ type: 'file', filename: logFile }],
      })

      logger.info('Test message')

      // 等待文件写入
      await global.testUtils.sleep(100)

      const content = await fs.readFile(logFile, 'utf8')
      expect(content).toContain('Test message')
      expect(content).toContain('"level":"info"')
    })

    it('应该支持日志轮转', async () => {
      const logFile = join(tempDir, 'app.log')

      logger = Logger.create({
        level: 'info',
        transports: [
          {
            type: 'rotating-file',
            filename: logFile,
            maxSize: 100, // 100 bytes
            maxFiles: 3,
          },
        ],
      })

      // 写入足够的日志以触发轮转
      for (let i = 0; i < 10; i++) {
        logger.info(`Long message ${i} with enough content to trigger rotation`)
        await global.testUtils.sleep(10)
      }

      // 检查是否创建了轮转文件
      const files = await fs.readdir(tempDir)
      const logFiles = files.filter(f => f.startsWith('app.log'))

      expect(logFiles.length).toBeGreaterThan(1)
    })

    it('应该创建目录如果不存�?, async () => {
      const logFile = join(tempDir, 'logs', 'nested', 'app.log')

      logger = Logger.create({
        level: 'info',
        transports: [{ type: 'file', filename: logFile }],
      })

      logger.info('Test message')

      await global.testUtils.sleep(100)

      expect(
        await fs
          .access(logFile)
          .then(() => true)
          .catch(() => false),
      ).toBe(true)
    })
  })

  describe('格式�?, () => {
    it('应该支持JSON格式', () => {
      const messages: string[] = []

      logger = Logger.create({
        level: 'info',
        format: 'json',
        transports: [
          {
            type: 'custom',
            write: message => messages.push(message),
          },
        ],
      })

      logger.info('Test message', { key: 'value' })

      const parsed = JSON.parse(messages[0])
      expect(parsed.message).toBe('Test message')
      expect(parsed.level).toBe('info')
      expect(parsed.metadata.key).toBe('value')
    })

    it('应该支持文本格式', () => {
      const messages: string[] = []

      logger = Logger.create({
        level: 'info',
        format: 'text',
        transports: [
          {
            type: 'custom',
            write: message => messages.push(message),
          },
        ],
      })

      logger.info('Test message')

      expect(messages[0]).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*INFO.*Test message/)
    })

    it('应该支持自定义格式化�?, () => {
      const messages: string[] = []

      logger = Logger.create({
        level: 'info',
        formatter: entry => `[${entry.level.toUpperCase()}] ${entry.message}`,
        transports: [
          {
            type: 'custom',
            write: message => messages.push(message),
          },
        ],
      })

      logger.info('Test message')

      expect(messages[0]).toBe('[INFO] Test message')
    })
  })

  describe('多传�?, () => {
    it('应该同时写入多个传输', async () => {
      const consoleMessages: string[] = []
      const fileMessages: string[] = []
      const logFile = join(tempDir, 'app.log')

      logger = Logger.create({
        level: 'info',
        transports: [
          {
            type: 'custom',
            write: message => consoleMessages.push(message),
          },
          {
            type: 'custom',
            write: message => fileMessages.push(message),
          },
        ],
      })

      logger.info('Test message')

      expect(consoleMessages).toHaveLength(1)
      expect(fileMessages).toHaveLength(1)
      expect(consoleMessages[0]).toContain('Test message')
      expect(fileMessages[0]).toContain('Test message')
    })

    it('应该支持不同传输的不同级�?, () => {
      const debugMessages: string[] = []
      const errorMessages: string[] = []

      logger = Logger.create({
        level: 'debug',
        transports: [
          {
            type: 'custom',
            level: 'debug',
            write: message => debugMessages.push(message),
          },
          {
            type: 'custom',
            level: 'error',
            write: message => errorMessages.push(message),
          },
        ],
      })

      logger.debug('Debug message')
      logger.info('Info message')
      logger.error('Error message')

      expect(debugMessages).toHaveLength(3) // debug传输接收所有消�?      expect(errorMessages).toHaveLength(1) // error传输只接收error消息
    })
  })

  describe('子日志器', () => {
    beforeEach(() => {
      logger = Logger.create({
        level: 'info',
        transports: [{ type: 'console', silent: true }],
      })
    })

    it('应该创建子日志器', () => {
      const child = logger.child({ module: 'auth' })

      const messages: any[] = []
      child.on('log', (entry) => {
        messages.push(entry)
      })

      child.info('Authentication successful')

      expect(messages[0].metadata.module).toBe('auth')
    })

    it('应该继承父日志器的配�?, () => {
      const child = logger.child({ service: 'api' })

      expect(child.getLevel()).toBe(logger.getLevel())
    })

    it('应该支持嵌套子日志器', () => {
      const child = logger.child({ module: 'auth' })
      const grandchild = child.child({ action: 'login' })

      const messages: any[] = []
      grandchild.on('log', (entry) => {
        messages.push(entry)
      })

      grandchild.info('User logged in')

      expect(messages[0].metadata.module).toBe('auth')
      expect(messages[0].metadata.action).toBe('login')
    })
  })

  describe('错误处理', () => {
    it('应该处理传输错误', () => {
      const errorSpy = vi.fn()

      logger = Logger.create({
        level: 'info',
        transports: [
          {
            type: 'custom',
            write: () => {
              throw new Error('Transport error')
            },
          },
        ],
      })

      logger.on('error', errorSpy)
      logger.info('Test message')

      expect(errorSpy).toHaveBeenCalled()
    })

    it('应该继续工作即使某个传输失败', () => {
      const successMessages: string[] = []
      const errorSpy = vi.fn()

      logger = Logger.create({
        level: 'info',
        transports: [
          {
            type: 'custom',
            write: () => {
              throw new Error('Transport error')
            },
          },
          {
            type: 'custom',
            write: message => successMessages.push(message),
          },
        ],
      })

      logger.on('error', errorSpy)
      logger.info('Test message')

      expect(errorSpy).toHaveBeenCalled()
      expect(successMessages).toHaveLength(1)
    })
  })

  describe('性能', () => {
    it('应该支持异步日志记录', async () => {
      const messages: string[] = []

      logger = Logger.create({
        level: 'info',
        async: true,
        transports: [
          {
            type: 'custom',
            write: async (message) => {
              await global.testUtils.sleep(10)
              messages.push(message)
            },
          },
        ],
      })

      logger.info('Message 1')
      logger.info('Message 2')
      logger.info('Message 3')

      // 异步日志应该立即返回
      expect(messages).toHaveLength(0)

      // 等待异步处理完成
      await global.testUtils.sleep(100)
      expect(messages).toHaveLength(3)
    })

    it('应该支持批量写入', async () => {
      const batches: string[][] = []

      logger = Logger.create({
        level: 'info',
        batchSize: 3,
        batchTimeout: 100,
        transports: [
          {
            type: 'custom',
            writeBatch: messages => batches.push([...messages]),
          },
        ],
      })

      logger.info('Message 1')
      logger.info('Message 2')
      logger.info('Message 3')

      await global.testUtils.sleep(150)

      expect(batches).toHaveLength(1)
      expect(batches[0]).toHaveLength(3)
    })
  })

  describe('配置', () => {
    it('应该动态更改日志级�?, () => {
      logger = Logger.create({
        level: 'info',
        transports: [{ type: 'console', silent: true }],
      })

      expect(logger.getLevel()).toBe('info')

      logger.setLevel('debug')
      expect(logger.getLevel()).toBe('debug')
    })

    it('应该添加和移除传�?, () => {
      logger = Logger.create({
        level: 'info',
        transports: [],
      })

      const transport = {
        type: 'custom' as const,
        write: () => {},
      }

      logger.addTransport(transport)
      expect(logger.getTransports()).toContain(transport)

      logger.removeTransport(transport)
      expect(logger.getTransports()).not.toContain(transport)
    })
  })

  describe('静态方�?, () => {
    it('应该创建默认日志�?, () => {
      const defaultLogger = Logger.getDefault()

      expect(defaultLogger).toBeInstanceOf(Logger)
      expect(Logger.getDefault()).toBe(defaultLogger) // 应该返回同一个实�?    })

    it('应该创建带配置的日志�?, () => {
      const customLogger = Logger.create({
        level: 'warn',
        format: 'json',
      })

      expect(customLogger.getLevel()).toBe('warn')
    })
  })

  describe('清理', () => {
    it('应该正确销毁日志器', async () => {
      const logFile = join(tempDir, 'app.log')

      logger = Logger.create({
        level: 'info',
        transports: [{ type: 'file', filename: logFile }],
      })

      logger.info('Before destroy')

      await logger.destroy()

      // 销毁后不应该再写入
      logger.info('After destroy')

      await global.testUtils.sleep(100)

      const content = await fs.readFile(logFile, 'utf8')
      expect(content).toContain('Before destroy')
      expect(content).not.toContain('After destroy')
    })
  })
})



