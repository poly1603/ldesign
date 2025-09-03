/**
 * GitRepository 类测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { promises as fs } from 'fs'
import { join } from 'path'
import { GitRepository } from '../src/core/GitRepository.js'
import { GitError, GitErrorType } from '../src/errors/index.js'
import { generateTestDir, cleanupTestDir, createTestDir, TEST_CONFIG } from '../test/setup.js'

describe('GitRepository', () => {
  let testDir: string
  let gitRepo: GitRepository

  beforeEach(async () => {
    testDir = generateTestDir()
    await createTestDir(testDir)
    gitRepo = new GitRepository(testDir)
  })

  afterEach(async () => {
    await cleanupTestDir(testDir)
  })

  describe('构造函数', () => {
    it('应该能够创建 GitRepository 实例', () => {
      expect(gitRepo).toBeInstanceOf(GitRepository)
      expect(gitRepo.getBaseDir()).toBe(testDir)
    })

    it('应该使用默认配置', () => {
      const options = gitRepo.getOptions()
      expect(options).toBeDefined()
    })

    it('应该能够使用自定义配置', () => {
      const customOptions = {
        timeout: 60000,
        debug: true
      }
      const customRepo = new GitRepository(testDir, customOptions)
      const options = customRepo.getOptions()
      expect(options.timeout).toBe(60000)
      expect(options.debug).toBe(true)
    })

    it('应该在路径无效时抛出错误', () => {
      expect(() => new GitRepository('')).toThrow(GitError)
      expect(() => new GitRepository(null as any)).toThrow(GitError)
    })
  })

  describe('init', () => {
    it('应该能够初始化普通仓库', async () => {
      const result = await gitRepo.init()

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()

      // 验证 .git 目录是否存在
      const gitDir = join(testDir, '.git')
      const stats = await fs.stat(gitDir)
      expect(stats.isDirectory()).toBe(true)
    })

    it('应该能够初始化裸仓库', async () => {
      const result = await gitRepo.init(true)

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('应该能够检查是否为仓库', async () => {
      // 初始化后是仓库
      await gitRepo.init()
      expect(await gitRepo.isRepo()).toBe(true)
    })
  })

  describe('add', () => {
    beforeEach(async () => {
      await gitRepo.init()
    })

    it('应该能够添加单个文件', async () => {
      // 创建测试文件
      const testFile = join(testDir, 'test.txt')
      await fs.writeFile(testFile, 'test content')

      const result = await gitRepo.add('test.txt')

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('应该能够添加多个文件', async () => {
      // 创建测试文件
      const testFile1 = join(testDir, 'test1.txt')
      const testFile2 = join(testDir, 'test2.txt')
      await fs.writeFile(testFile1, 'test content 1')
      await fs.writeFile(testFile2, 'test content 2')

      const result = await gitRepo.add(['test1.txt', 'test2.txt'])

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('应该能够添加所有文件', async () => {
      // 创建测试文件
      const testFile = join(testDir, 'test.txt')
      await fs.writeFile(testFile, 'test content')

      const result = await gitRepo.add('.')

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('应该在文件路径无效时抛出错误', async () => {
      const result = await gitRepo.add('')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('commit', () => {
    beforeEach(async () => {
      await gitRepo.init()

      // 创建并添加测试文件
      const testFile = join(testDir, 'test.txt')
      await fs.writeFile(testFile, 'test content')
      await gitRepo.add('test.txt')
    })

    it('应该能够提交更改', async () => {
      const result = await gitRepo.commit('Initial commit')

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.message).toBe('Initial commit')
      expect(result.data?.hash).toBeDefined()
    })

    it('应该在提交消息为空时抛出错误', async () => {
      const result = await gitRepo.commit('')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('应该能够提交指定文件', async () => {
      // 创建另一个文件但不添加到暂存区
      const testFile2 = join(testDir, 'test2.txt')
      await fs.writeFile(testFile2, 'test content 2')

      const result = await gitRepo.commit('Commit specific file', ['test2.txt'])

      expect(result.success).toBe(true)
      expect(result.data?.files).toContain('test2.txt')
    })
  })

  describe('status', () => {
    beforeEach(async () => {
      await gitRepo.init()
    })

    it('应该能够获取仓库状态', async () => {
      const result = await gitRepo.status()

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.current).toBeDefined()
    })

    it('应该能够检测新文件', async () => {
      // 创建新文件
      const testFile = join(testDir, 'new-file.txt')
      await fs.writeFile(testFile, 'new content')

      const result = await gitRepo.status()

      expect(result.success).toBe(true)
      expect(result.data?.not_added).toContain('new-file.txt')
    })

    it('应该能够检测暂存的文件', async () => {
      // 创建并添加文件
      const testFile = join(testDir, 'staged-file.txt')
      await fs.writeFile(testFile, 'staged content')
      await gitRepo.add('staged-file.txt')

      const result = await gitRepo.status()

      expect(result.success).toBe(true)
      expect(result.data?.staged).toContain('staged-file.txt')
    })
  })

  describe('log', () => {
    beforeEach(async () => {
      await gitRepo.init()

      // 创建并提交测试文件
      const testFile = join(testDir, 'test.txt')
      await fs.writeFile(testFile, 'test content')
      await gitRepo.add('test.txt')
      await gitRepo.commit('Initial commit')
    })

    it('应该能够获取提交日志', async () => {
      const result = await gitRepo.log()

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data!.length).toBeGreaterThan(0)

      const firstCommit = result.data![0]
      expect(firstCommit.hash).toBeDefined()
      expect(firstCommit.message).toBe('Initial commit')
    })

    it('应该能够限制日志条数', async () => {
      // 创建多个提交
      for (let i = 1; i <= 3; i++) {
        const testFile = join(testDir, `test${i}.txt`)
        await fs.writeFile(testFile, `content ${i}`)
        await gitRepo.add(`test${i}.txt`)
        await gitRepo.commit(`Commit ${i}`)
      }

      const result = await gitRepo.log({ maxCount: 2 })

      expect(result.success).toBe(true)
      expect(result.data?.length).toBeLessThanOrEqual(2)
    })
  })

  describe('事件监听', () => {
    beforeEach(async () => {
      await gitRepo.init()
    })

    it('应该能够监听 init 事件', async () => {
      const events: any[] = []

      const newTestDir = generateTestDir()
      await createTestDir(newTestDir)
      const newRepo = new GitRepository(newTestDir)
      newRepo.on('init', (event, data) => {
        events.push({ event, data })
      })

      await newRepo.init()

      expect(events.length).toBeGreaterThan(0)
      expect(events.some(e => e.event === 'init')).toBe(true)

      // 清理
      await cleanupTestDir(newTestDir)
    })

    it('应该能够监听 commit 事件', async () => {
      const events: any[] = []

      gitRepo.on('commit', (event, data) => {
        events.push({ event, data })
      })

      // 创建并提交文件
      const testFile = join(testDir, 'test.txt')
      await fs.writeFile(testFile, 'test content')
      await gitRepo.add('test.txt')
      await gitRepo.commit('Test commit')

      expect(events.length).toBeGreaterThan(0)
      expect(events.some(e => e.event === 'commit')).toBe(true)
    })

    it('应该能够移除事件监听器', () => {
      const listener = () => { }

      gitRepo.on('init', listener)
      gitRepo.off('init', listener)

      // 验证监听器已被移除（通过内部状态检查）
      const listeners = (gitRepo as any).eventListeners.get('init')
      expect(listeners?.includes(listener)).toBe(false)
    })
  })
})
