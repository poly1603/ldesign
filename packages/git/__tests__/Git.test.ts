/**
 * Git 主类测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { promises as fs } from 'fs'
import { join } from 'path'
import { Git } from '../src/index.js'
import { generateTestDir, cleanupTestDir, createTestDir } from '../test/setup.js'

describe('Git', () => {
  let testDir: string
  let git: Git

  beforeEach(async () => {
    testDir = generateTestDir()
    await createTestDir(testDir)
    git = new Git(testDir)
  })

  afterEach(async () => {
    await cleanupTestDir(testDir)
  })

  describe('构造函数', () => {
    it('应该能够创建 Git 实例', () => {
      expect(git).toBeInstanceOf(Git)
      expect(git.repository).toBeDefined()
      expect(git.branch).toBeDefined()
      expect(git.status).toBeDefined()
      expect(git.remote).toBeDefined()
    })

    it('应该能够使用静态工厂方法创建实例', () => {
      const gitInstance = Git.create(testDir)
      
      expect(gitInstance).toBeInstanceOf(Git)
      expect(gitInstance.getBaseDir()).toBe(testDir)
    })

    it('应该能够使用自定义配置', () => {
      const options = { timeout: 60000, debug: true }
      const gitInstance = new Git(testDir, options)
      
      const retrievedOptions = gitInstance.getOptions()
      expect(retrievedOptions.timeout).toBe(60000)
      expect(retrievedOptions.debug).toBe(true)
    })
  })

  describe('基础操作', () => {
    it('应该能够初始化仓库', async () => {
      const result = await git.init()
      
      expect(result.success).toBe(true)
      expect(await git.isRepo()).toBe(true)
    })

    it('应该能够检查仓库状态', async () => {
      await git.init()
      
      expect(await git.isRepo()).toBe(true)
    })

    it('应该能够获取仓库路径', () => {
      expect(git.getBaseDir()).toBe(testDir)
    })
  })

  describe('快速操作方法', () => {
    beforeEach(async () => {
      await git.init()
    })

    it('应该能够快速添加文件', async () => {
      // 创建测试文件
      const testFile = join(testDir, 'test.txt')
      await fs.writeFile(testFile, 'test content')
      
      const result = await git.add('test.txt')
      
      expect(result.success).toBe(true)
    })

    it('应该能够快速提交', async () => {
      // 创建并添加文件
      const testFile = join(testDir, 'test.txt')
      await fs.writeFile(testFile, 'test content')
      await git.add('test.txt')
      
      const result = await git.commit('Test commit')
      
      expect(result.success).toBe(true)
      expect(result.data?.message).toBe('Test commit')
    })

    it('应该能够快速获取状态', async () => {
      const result = await git.getStatus()
      
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
    })

    it('应该能够快速获取日志', async () => {
      // 创建初始提交
      const testFile = join(testDir, 'test.txt')
      await fs.writeFile(testFile, 'test content')
      await git.add('test.txt')
      await git.commit('Initial commit')
      
      const result = await git.getLog(5)
      
      expect(result.success).toBe(true)
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data!.length).toBeGreaterThan(0)
    })

    it('应该能够快速创建分支', async () => {
      // 创建初始提交
      const testFile = join(testDir, 'test.txt')
      await fs.writeFile(testFile, 'test content')
      await git.add('test.txt')
      await git.commit('Initial commit')
      
      const result = await git.createBranch('feature/test')
      
      expect(result.success).toBe(true)
    })

    it('应该能够快速切换分支', async () => {
      // 创建初始提交和分支
      const testFile = join(testDir, 'test.txt')
      await fs.writeFile(testFile, 'test content')
      await git.add('test.txt')
      await git.commit('Initial commit')
      await git.createBranch('feature/test')
      
      const result = await git.checkoutBranch('feature/test')
      
      expect(result.success).toBe(true)
    })

    it('应该能够快速列出分支', async () => {
      // 创建初始提交
      const testFile = join(testDir, 'test.txt')
      await fs.writeFile(testFile, 'test content')
      await git.add('test.txt')
      await git.commit('Initial commit')
      
      const result = await git.listBranches()
      
      expect(result.success).toBe(true)
      expect(Array.isArray(result.data)).toBe(true)
    })

    it('应该能够快速添加远程仓库', async () => {
      const result = await git.addRemote('origin', 'https://github.com/test/repo.git')
      
      expect(result.success).toBe(true)
    })

    it('应该能够快速列出远程仓库', async () => {
      await git.addRemote('origin', 'https://github.com/test/repo.git')
      
      const result = await git.listRemotes()
      
      expect(result.success).toBe(true)
      expect(Array.isArray(result.data)).toBe(true)
    })
  })

  describe('集成测试', () => {
    it('应该能够完成完整的 Git 工作流', async () => {
      // 1. 初始化仓库
      let result = await git.init()
      expect(result.success).toBe(true)
      
      // 2. 创建文件
      const testFile = join(testDir, 'README.md')
      await fs.writeFile(testFile, '# Test Repository')
      
      // 3. 添加文件
      result = await git.add('README.md')
      expect(result.success).toBe(true)
      
      // 4. 提交文件
      result = await git.commit('Initial commit')
      expect(result.success).toBe(true)
      
      // 5. 创建分支
      result = await git.createBranch('feature/new-feature')
      expect(result.success).toBe(true)
      
      // 6. 切换分支
      result = await git.checkoutBranch('feature/new-feature')
      expect(result.success).toBe(true)
      
      // 7. 在新分支上添加文件
      const featureFile = join(testDir, 'feature.txt')
      await fs.writeFile(featureFile, 'Feature content')
      
      result = await git.add('feature.txt')
      expect(result.success).toBe(true)
      
      result = await git.commit('Add feature file')
      expect(result.success).toBe(true)
      
      // 8. 切换回主分支
      result = await git.checkoutBranch('master')
      expect(result.success).toBe(true)
      
      // 9. 合并分支
      result = await git.branch.merge('feature/new-feature')
      expect(result.success).toBe(true)
      
      // 10. 验证文件存在
      const featureFileExists = await fs.access(featureFile).then(() => true).catch(() => false)
      expect(featureFileExists).toBe(true)
      
      // 11. 获取日志
      const logResult = await git.getLog()
      expect(logResult.success).toBe(true)
      expect(logResult.data!.length).toBeGreaterThanOrEqual(2)
    })

    it('应该能够处理错误情况', async () => {
      // 尝试在未初始化的仓库上执行操作
      const result = await git.getStatus()
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('应该能够处理文件操作', async () => {
      await git.init()
      
      // 创建多个文件
      const files = ['file1.txt', 'file2.txt', 'file3.txt']
      for (const file of files) {
        const filePath = join(testDir, file)
        await fs.writeFile(filePath, `Content of ${file}`)
      }
      
      // 添加所有文件
      const addResult = await git.add('.')
      expect(addResult.success).toBe(true)
      
      // 检查状态
      const statusResult = await git.getStatus()
      expect(statusResult.success).toBe(true)
      expect(statusResult.data?.staged.length).toBe(files.length)
      
      // 提交所有文件
      const commitResult = await git.commit('Add multiple files')
      expect(commitResult.success).toBe(true)
      
      // 验证工作目录是否干净
      const isClean = await git.status.isClean()
      expect(isClean).toBe(true)
    })
  })

  describe('模块集成', () => {
    beforeEach(async () => {
      await git.init()
      
      // 创建初始提交
      const testFile = join(testDir, 'initial.txt')
      await fs.writeFile(testFile, 'initial content')
      await git.add('initial.txt')
      await git.commit('Initial commit')
    })

    it('repository 模块应该正常工作', async () => {
      expect(git.repository).toBeDefined()
      
      const statusResult = await git.repository.status()
      expect(statusResult.success).toBe(true)
    })

    it('branch 模块应该正常工作', async () => {
      expect(git.branch).toBeDefined()
      
      const listResult = await git.branch.list()
      expect(listResult.success).toBe(true)
      expect(Array.isArray(listResult.data)).toBe(true)
    })

    it('status 模块应该正常工作', async () => {
      expect(git.status).toBeDefined()
      
      const statusResult = await git.status.getStatus()
      expect(statusResult.success).toBe(true)
    })

    it('remote 模块应该正常工作', async () => {
      expect(git.remote).toBeDefined()
      
      const listResult = await git.remote.list()
      expect(listResult.success).toBe(true)
      expect(Array.isArray(listResult.data)).toBe(true)
    })
  })
})
