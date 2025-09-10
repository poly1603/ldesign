/**
 * 全栈集成测试
 * 测试多个模块之间的协�? */

import {
  CacheManager,
  ConfigManager,
  EventBus,
  FileSystem,
  Logger,
  MemoryCache,
  ValidationRules,
  Validator,
} from '../../src'

describe('全栈集成测试', () => {
  let tempDir: string
  let logger: Logger
  let cache: CacheManager
  let eventBus: EventBus
  let validator: Validator

  beforeEach(() => {
    tempDir = global.testUtils.createTempDir()

    // 设置日志�?    logger = Logger.create({
      level: 'info',
      transports: [{ type: 'console', silent: true }],
    })

    // 设置缓存
    cache = CacheManager.create()
    cache.addStore('memory', MemoryCache.create({ maxSize: 100 }))

    // 设置事件总线
    eventBus = EventBus.getInstance()

    // 设置验证�?    validator = Validator.create()
    validator.addRules({
      id: ValidationRules.required(),
      name: ValidationRules.required(),
      email: ValidationRules.email(),
      age: ValidationRules.range(0, 120),
    })
  })

  afterEach(async () => {
    await logger.destroy()
    await cache.clear()
    eventBus.clear()
    validator.clear()
    global.testUtils.cleanupTempDir(tempDir)
  })

  describe('用户管理系统', () => {
    interface User {
      id: string
      name: string
      email: string
      age: number
      createdAt: Date
    }

    class UserService {
      constructor(
        private logger: Logger,
        private cache: CacheManager,
        private eventBus: EventBus,
        private validator: Validator,
      ) {}

      async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
        this.logger.info('Creating user', { userData })

        // 验证用户数据
        const validationResult = await this.validator.validate(userData)
        if (!validationResult.valid) {
          this.logger.error('User validation failed', { errors: validationResult.errors })
          throw new Error(
            `Validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`,
          )
        }

        // 创建用户
        const user: User = {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...validationResult.data,
          createdAt: new Date(),
        }

        // 缓存用户
        await this.cache.set(`user:${user.id}`, user, 3600)
        this.logger.info('User cached', { userId: user.id })

        // 发布事件
        this.eventBus.emit('user:created', user)
        this.logger.info('User created event emitted', { userId: user.id })

        return user
      }

      async getUser(id: string): Promise<User | null> {
        this.logger.debug('Getting user', { userId: id })

        // 尝试从缓存获�?        const cached = await this.cache.get<User>(`user:${id}`)
        if (cached) {
          this.logger.debug('User found in cache', { userId: id })
          this.eventBus.emit('user:cache_hit', { userId: id })
          return cached
        }

        this.logger.debug('User not found in cache', { userId: id })
        this.eventBus.emit('user:cache_miss', { userId: id })

        // 在真实应用中，这里会从数据库获取
        return null
      }

      async updateUser(
        id: string,
        updates: Partial<Omit<User, 'id' | 'createdAt'>>,
      ): Promise<User | null> {
        this.logger.info('Updating user', { userId: id, updates })

        const user = await this.getUser(id)
        if (!user) {
          this.logger.warn('User not found for update', { userId: id })
          return null
        }

        // 验证更新数据
        const validationResult = await this.validator.validate({ ...user, ...updates })
        if (!validationResult.valid) {
          this.logger.error('User update validation failed', { errors: validationResult.errors })
          throw new Error(
            `Validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`,
          )
        }

        // 更新用户
        const updatedUser: User = {
          ...user,
          ...validationResult.data,
        }

        // 更新缓存
        await this.cache.set(`user:${id}`, updatedUser, 3600)
        this.logger.info('User updated in cache', { userId: id })

        // 发布事件
        this.eventBus.emit('user:updated', { user: updatedUser, changes: updates })
        this.logger.info('User updated event emitted', { userId: id })

        return updatedUser
      }

      async deleteUser(id: string): Promise<boolean> {
        this.logger.info('Deleting user', { userId: id })

        const user = await this.getUser(id)
        if (!user) {
          this.logger.warn('User not found for deletion', { userId: id })
          return false
        }

        // 从缓存删�?        await this.cache.delete(`user:${id}`)
        this.logger.info('User deleted from cache', { userId: id })

        // 发布事件
        this.eventBus.emit('user:deleted', { userId: id, user })
        this.logger.info('User deleted event emitted', { userId: id })

        return true
      }
    }

    let userService: UserService

    beforeEach(() => {
      userService = new UserService(logger, cache, eventBus, validator)
    })

    it('应该完整地创建、获取、更新和删除用户', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      }

      // 创建用户
      const user = await userService.createUser(userData)
      expect(user.id).toBeDefined()
      expect(user.name).toBe(userData.name)
      expect(user.email).toBe(userData.email)
      expect(user.age).toBe(userData.age)
      expect(user.createdAt).toBeInstanceOf(Date)

      // 获取用户（应该从缓存获取�?      const retrievedUser = await userService.getUser(user.id)
      expect(retrievedUser).toEqual(user)

      // 更新用户
      const updates = { name: 'Jane Doe', age: 31 }
      const updatedUser = await userService.updateUser(user.id, updates)
      expect(updatedUser!.name).toBe(updates.name)
      expect(updatedUser!.age).toBe(updates.age)
      expect(updatedUser!.email).toBe(userData.email) // 未更改的字段应保持不�?
      // 删除用户
      const deleted = await userService.deleteUser(user.id)
      expect(deleted).toBe(true)

      // 确认用户已删�?      const deletedUser = await userService.getUser(user.id)
      expect(deletedUser).toBeNull()
    })

    it('应该处理验证错误', async () => {
      const invalidUserData = {
        name: '', // 空名�?        email: 'invalid-email', // 无效邮箱
        age: 150, // 超出范围的年�?      }

      await expect(userService.createUser(invalidUserData)).rejects.toThrow('Validation failed')
    })

    it('应该发布正确的事�?, async () => {
      const events: Array<{ event: string, data: any }> = []

      eventBus.on('user:created', data => events.push({ event: 'user:created', data }))
      eventBus.on('user:cache_hit', data => events.push({ event: 'user:cache_hit', data }))
      eventBus.on('user:updated', data => events.push({ event: 'user:updated', data }))
      eventBus.on('user:deleted', data => events.push({ event: 'user:deleted', data }))

      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      }

      // 创建用户
      const user = await userService.createUser(userData)
      expect(events.some(e => e.event === 'user:created')).toBe(true)

      // 获取用户（缓存命中）
      await userService.getUser(user.id)
      expect(events.some(e => e.event === 'user:cache_hit')).toBe(true)

      // 更新用户
      await userService.updateUser(user.id, { name: 'Jane Doe' })
      expect(events.some(e => e.event === 'user:updated')).toBe(true)

      // 删除用户
      await userService.deleteUser(user.id)
      expect(events.some(e => e.event === 'user:deleted')).toBe(true)
    })
  })

  describe('配置驱动的应�?, () => {
    it('应该根据配置文件初始化应用组�?, async () => {
      // 创建配置文件
      const configFile = `${tempDir}/app.json`
      const config = {
        app: {
          name: 'Test App',
          version: '1.0.0',
        },
        logger: {
          level: 'debug',
          format: 'json',
        },
        cache: {
          maxSize: 500,
          defaultTTL: 1800,
        },
        validation: {
          stopOnFirstError: true,
          allowUnknownFields: false,
        },
      }

      await FileSystem.writeFile(configFile, config, 'json')

      // 加载配置
      const configManager = ConfigManager.create({
        configFile,
        schema: {
          app: {
            type: 'object',
            properties: {
              name: { type: 'string', required: true },
              version: { type: 'string', required: true },
            },
          },
          logger: {
            type: 'object',
            properties: {
              level: { type: 'string', default: 'info' },
              format: { type: 'string', default: 'text' },
            },
          },
        },
      })

      await configManager.load()

      // 根据配置初始化组�?      const appLogger = Logger.create({
        level: configManager.get('logger.level') as any,
        format: configManager.get('logger.format') as any,
        transports: [{ type: 'console', silent: true }],
      })

      const appCache = CacheManager.create()
      appCache.addStore(
        'memory',
        MemoryCache.create({
          maxSize: configManager.get('cache.maxSize'),
          defaultTTL: configManager.get('cache.defaultTTL'),
        }),
      )

      const appValidator = Validator.create({
        stopOnFirstError: configManager.get('validation.stopOnFirstError'),
        allowUnknownFields: configManager.get('validation.allowUnknownFields'),
      })

      // 验证组件配置
      expect(appLogger.getLevel()).toBe('debug')
      expect(configManager.get('app.name')).toBe('Test App')
      expect(configManager.get('cache.maxSize')).toBe(500)

      // 测试组件功能
      appLogger.info('Application initialized', {
        name: configManager.get('app.name'),
        version: configManager.get('app.version'),
      })

      await appCache.set('test-key', 'test-value')
      const cachedValue = await appCache.get('test-key')
      expect(cachedValue).toBe('test-value')

      appValidator.addRule('name', ValidationRules.required())
      const validationResult = await appValidator.validate({ name: 'test' })
      expect(validationResult.valid).toBe(true)

      // 清理
      await appLogger.destroy()
      await appCache.clear()
    })
  })

  describe('错误处理和恢�?, () => {
    it('应该优雅地处理组件故�?, async () => {
      const errors: Error[] = []

      // 设置错误监听
      logger.on('error', error => errors.push(error))
      eventBus.on('error', error => errors.push(error))

      // 模拟缓存故障
      const faultyCache = {
        async get() {
          throw new Error('Cache read error')
        },
        async set() {
          throw new Error('Cache write error')
        },
        async delete() {
          throw new Error('Cache delete error')
        },
        async clear() {
          throw new Error('Cache clear error')
        },
      }

      // 应用应该继续工作即使缓存失败
      try {
        await faultyCache.get('test')
      }
      catch (error) {
        logger.error('Cache operation failed', { error: (error as Error).message })
      }

      // 验证器应该继续工�?      validator.addRule('email', ValidationRules.email())
      const result = await validator.validate({ email: 'test@example.com' })
      expect(result.valid).toBe(true)

      // 事件系统应该继续工作
      let eventReceived = false
      eventBus.on('test-event', () => {
        eventReceived = true
      })
      eventBus.emit('test-event')
      expect(eventReceived).toBe(true)

      // 应该记录了错�?      expect(errors.length).toBeGreaterThan(0)
    })
  })

  describe('性能和扩展�?, () => {
    it('应该处理大量并发操作', async () => {
      const operations = 100
      const promises: Promise<any>[] = []

      // 并发缓存操作
      for (let i = 0; i < operations; i++) {
        promises.push(cache.set(`key-${i}`, `value-${i}`))
      }

      await Promise.all(promises)

      // 验证所有数据都已缓�?      const retrievePromises = []
      for (let i = 0; i < operations; i++) {
        retrievePromises.push(cache.get(`key-${i}`))
      }

      const results = await Promise.all(retrievePromises)

      for (let i = 0; i < operations; i++) {
        expect(results[i]).toBe(`value-${i}`)
      }
    })

    it('应该处理大量事件', () => {
      const eventCount = 1000
      let receivedCount = 0

      eventBus.on('bulk-test', () => {
        receivedCount++
      })

      for (let i = 0; i < eventCount; i++) {
        eventBus.emit('bulk-test', i)
      }

      expect(receivedCount).toBe(eventCount)
    })
  })
})


