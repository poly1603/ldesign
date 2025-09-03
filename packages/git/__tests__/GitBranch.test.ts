/**
 * GitBranch 类测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { promises as fs } from 'fs'
import { join } from 'path'
import simpleGit from 'simple-git'
import { GitBranch } from '../src/core/GitBranch.js'
import { GitError, GitErrorType } from '../src/errors/index.js'
import { generateTestDir, cleanupTestDir, createTestDir } from '../test/setup.js'

describe('GitBranch', () => {
  let testDir: string
  let gitBranch: GitBranch
  let git: any

  beforeEach(async () => {
    testDir = generateTestDir()
    await createTestDir(testDir)
    
    // 初始化 Git 仓库
    git = simpleGit(testDir)
    await git.init()
    
    // 创建初始提交
    const testFile = join(testDir, 'README.md')
    await fs.writeFile(testFile, '# Test Repository')
    await git.add('README.md')
    await git.commit('Initial commit')
    
    gitBranch = new GitBranch(git, testDir)
  })

  afterEach(async () => {
    await cleanupTestDir(testDir)
  })

  describe('create', () => {
    it('应该能够创建新分支', async () => {
      const result = await gitBranch.create('feature/new-feature')
      
      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      
      // 验证分支是否存在
      const exists = await gitBranch.exists('feature/new-feature')
      expect(exists).toBe(true)
    })

    it('应该能够从指定起始点创建分支', async () => {
      // 先创建一个分支
      await gitBranch.create('develop')
      
      // 从 develop 分支创建新分支
      const result = await gitBranch.create('feature/from-develop', 'develop')
      
      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('应该在分支名无效时抛出错误', async () => {
      const result = await gitBranch.create('')
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('应该在分支名包含无效字符时抛出错误', async () => {
      const result = await gitBranch.create('feature/invalid:name')
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('checkout', () => {
    beforeEach(async () => {
      // 创建测试分支
      await gitBranch.create('test-branch')
    })

    it('应该能够切换到现有分支', async () => {
      const result = await gitBranch.checkout('test-branch')
      
      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      
      // 验证当前分支
      const currentResult = await gitBranch.current()
      expect(currentResult.success).toBe(true)
      expect(currentResult.data).toBe('test-branch')
    })

    it('应该能够切换回主分支', async () => {
      // 先切换到测试分支
      await gitBranch.checkout('test-branch')
      
      // 再切换回主分支
      const result = await gitBranch.checkout('master')
      
      expect(result.success).toBe(true)
      
      const currentResult = await gitBranch.current()
      expect(currentResult.data).toBe('master')
    })

    it('应该在分支不存在时返回错误', async () => {
      const result = await gitBranch.checkout('non-existent-branch')
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('delete', () => {
    beforeEach(async () => {
      // 创建测试分支
      await gitBranch.create('to-delete')
      // 切换回主分支以便删除测试分支
      await gitBranch.checkout('master')
    })

    it('应该能够删除分支', async () => {
      const result = await gitBranch.delete('to-delete')
      
      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      
      // 验证分支是否已删除
      const exists = await gitBranch.exists('to-delete')
      expect(exists).toBe(false)
    })

    it('应该能够强制删除分支', async () => {
      // 在分支上创建新提交
      await gitBranch.checkout('to-delete')
      const testFile = join(testDir, 'new-file.txt')
      await fs.writeFile(testFile, 'new content')
      await git.add('new-file.txt')
      await git.commit('New commit on branch')
      
      // 切换回主分支
      await gitBranch.checkout('master')
      
      // 强制删除分支
      const result = await gitBranch.delete('to-delete', true)
      
      expect(result.success).toBe(true)
    })

    it('应该在删除当前分支时返回错误', async () => {
      await gitBranch.checkout('to-delete')
      
      const result = await gitBranch.delete('to-delete')
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('list', () => {
    beforeEach(async () => {
      // 创建多个测试分支
      await gitBranch.create('feature/branch1')
      await gitBranch.create('feature/branch2')
      await gitBranch.create('hotfix/fix1')
    })

    it('应该能够列出本地分支', async () => {
      const result = await gitBranch.list()
      
      expect(result.success).toBe(true)
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data!.length).toBeGreaterThan(0)
      
      const branchNames = result.data!.map(b => b.name)
      expect(branchNames).toContain('master')
      expect(branchNames).toContain('feature/branch1')
      expect(branchNames).toContain('feature/branch2')
      expect(branchNames).toContain('hotfix/fix1')
    })

    it('应该能够识别当前分支', async () => {
      await gitBranch.checkout('feature/branch1')
      
      const result = await gitBranch.list()
      
      expect(result.success).toBe(true)
      
      const currentBranch = result.data!.find(b => b.current)
      expect(currentBranch?.name).toBe('feature/branch1')
    })

    it('应该能够列出包含远程分支的所有分支', async () => {
      const result = await gitBranch.list(true)
      
      expect(result.success).toBe(true)
      expect(Array.isArray(result.data)).toBe(true)
    })
  })

  describe('current', () => {
    it('应该能够获取当前分支名', async () => {
      const result = await gitBranch.current()
      
      expect(result.success).toBe(true)
      expect(result.data).toBe('master')
    })

    it('应该在切换分支后返回正确的当前分支', async () => {
      await gitBranch.create('test-current')
      await gitBranch.checkout('test-current')
      
      const result = await gitBranch.current()
      
      expect(result.success).toBe(true)
      expect(result.data).toBe('test-current')
    })
  })

  describe('rename', () => {
    beforeEach(async () => {
      await gitBranch.create('old-name')
    })

    it('应该能够重命名分支', async () => {
      const result = await gitBranch.rename('old-name', 'new-name')
      
      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      
      // 验证旧分支不存在，新分支存在
      expect(await gitBranch.exists('old-name')).toBe(false)
      expect(await gitBranch.exists('new-name')).toBe(true)
    })

    it('应该在旧分支不存在时返回错误', async () => {
      const result = await gitBranch.rename('non-existent', 'new-name')
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('应该在新分支名无效时抛出错误', async () => {
      const result = await gitBranch.rename('old-name', 'invalid:name')
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('merge', () => {
    beforeEach(async () => {
      // 创建并切换到功能分支
      await gitBranch.create('feature/merge-test')
      await gitBranch.checkout('feature/merge-test')
      
      // 在功能分支上创建新文件
      const featureFile = join(testDir, 'feature.txt')
      await fs.writeFile(featureFile, 'feature content')
      await git.add('feature.txt')
      await git.commit('Add feature file')
      
      // 切换回主分支
      await gitBranch.checkout('master')
    })

    it('应该能够合并分支', async () => {
      const result = await gitBranch.merge('feature/merge-test')
      
      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      
      // 验证文件是否存在
      const featureFile = join(testDir, 'feature.txt')
      const exists = await fs.access(featureFile).then(() => true).catch(() => false)
      expect(exists).toBe(true)
    })

    it('应该能够使用 no-ff 选项合并', async () => {
      const result = await gitBranch.merge('feature/merge-test', { noFf: true })
      
      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('应该在分支不存在时返回错误', async () => {
      const result = await gitBranch.merge('non-existent-branch')
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('exists', () => {
    beforeEach(async () => {
      await gitBranch.create('existing-branch')
    })

    it('应该能够检查分支是否存在', async () => {
      expect(await gitBranch.exists('existing-branch')).toBe(true)
      expect(await gitBranch.exists('non-existent-branch')).toBe(false)
    })

    it('应该能够检查主分支是否存在', async () => {
      expect(await gitBranch.exists('master')).toBe(true)
    })
  })

  describe('getLastCommit', () => {
    it('应该能够获取分支的最后提交', async () => {
      const result = await gitBranch.getLastCommit('master')
      
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(typeof result.data).toBe('string')
      expect(result.data!.length).toBeGreaterThan(0)
    })

    it('应该在分支不存在时返回错误', async () => {
      const result = await gitBranch.getLastCommit('non-existent-branch')
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('compare', () => {
    beforeEach(async () => {
      // 创建功能分支并添加内容
      await gitBranch.create('feature/compare-test')
      await gitBranch.checkout('feature/compare-test')
      
      const featureFile = join(testDir, 'compare.txt')
      await fs.writeFile(featureFile, 'feature content')
      await git.add('compare.txt')
      await git.commit('Add compare file')
      
      await gitBranch.checkout('master')
    })

    it('应该能够比较两个分支', async () => {
      const result = await gitBranch.compare('master', 'feature/compare-test')
      
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.baseBranch).toBe('master')
      expect(result.data?.compareBranch).toBe('feature/compare-test')
      expect(result.data?.hasChanges).toBe(true)
    })

    it('应该在分支不存在时返回错误', async () => {
      const result = await gitBranch.compare('master', 'non-existent-branch')
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('事件监听', () => {
    it('应该能够监听分支创建事件', async () => {
      const events: any[] = []
      
      gitBranch.on('branch', (event, data) => {
        events.push({ event, data })
      })
      
      await gitBranch.create('event-test-branch')
      
      expect(events.length).toBeGreaterThan(0)
      expect(events.some(e => e.data?.action === 'create')).toBe(true)
    })

    it('应该能够监听分支切换事件', async () => {
      const events: any[] = []
      
      await gitBranch.create('checkout-test')
      
      gitBranch.on('checkout', (event, data) => {
        events.push({ event, data })
      })
      
      await gitBranch.checkout('checkout-test')
      
      expect(events.length).toBeGreaterThan(0)
      expect(events.some(e => e.event === 'checkout')).toBe(true)
    })
  })
})
