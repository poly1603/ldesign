/**
 * Git 模块测试
 */


import { vi } from 'vitest'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FileSystem } from '../src/filesystem'
import { GitManager, GitUtils } from '../src/git'

// Mock exec 函数
vi.mock('node:child_process', () => ({
  exec: vi.fn(),
}))

describe('gitManager', () => {
  let testDir: string
  let git: GitManager

  beforeEach(async () => {
    testDir = join(tmpdir(), `ldesign-git-test-${Date.now()}`)
    await FileSystem.createDir(testDir)
    git = new GitManager(testDir)
  })

  afterEach(async () => {
    try {
      await FileSystem.removeDir(testDir)
    }
    catch {
      // 忽略清理错误
    }
  })

  describe('基本操作', () => {
    it('应该能够检查是否为 Git 仓库', async () => {
      // Mock exec 返回成功
      const { exec } = await import('node:child_process')
      vi.mocked(exec).mockImplementation((command, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, { stdout: '.git', stderr: '' } as any)
        }
        return {} as any
      })

      const isRepo = await git.isRepository()
      expect(isRepo).toBe(true)
    })

    it('应该能够初始�?Git 仓库', async () => {
      const { exec } = await import('node:child_process')
      vi.mocked(exec).mockImplementation((command, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, { stdout: 'Initialized empty Git repository', stderr: '' } as any)
        }
        return {} as any
      })

      await expect(git.init()).resolves.not.toThrow()
    })

    it('应该能够添加文件到暂存区', async () => {
      const { exec } = await import('node:child_process')
      vi.mocked(exec).mockImplementation((command, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, { stdout: '', stderr: '' } as any)
        }
        return {} as any
      })

      await expect(git.add('.')).resolves.not.toThrow()
    })

    it('应该能够提交更改', async () => {
      const { exec } = await import('node:child_process')
      vi.mocked(exec).mockImplementation((command, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, { stdout: '[main abc1234] Initial commit', stderr: '' } as any)
        }
        return {} as any
      })

      const commitHash = await git.commit('Initial commit')
      expect(commitHash).toBe('abc1234')
    })
  })

  describe('状态操�?, () => {
    it('应该能够获取仓库状�?, async () => {
      const { exec } = await import('node:child_process')
      vi.mocked(exec).mockImplementation((command, options, callback) => {
        if (typeof callback === 'function') {
          const mockOutput = 'M  modified.txt\nA  added.txt\n?? untracked.txt'
          callback(null, { stdout: mockOutput, stderr: '' } as any)
        }
        return {} as any
      })

      const status = await git.status()
      expect(status.staged).toContain('added.txt')
      expect(status.unstaged).toContain('modified.txt')
      expect(status.untracked).toContain('untracked.txt')
      expect(status.clean).toBe(false)
    })

    it('应该能够获取提交历史', async () => {
      const { exec } = await import('node:child_process')
      vi.mocked(exec).mockImplementation((command, options, callback) => {
        if (typeof callback === 'function') {
          const mockOutput
            = 'abc1234|John Doe|john@example.com|2023-12-25 10:30:00 +0800|Initial commit'
          callback(null, { stdout: mockOutput, stderr: '' } as any)
        }
        return {} as any
      })

      const commits = await git.log({ limit: 1 })
      expect(commits).toHaveLength(1)
      expect(commits[0].hash).toBe('abc1234')
      expect(commits[0].author).toBe('John Doe')
      expect(commits[0].message).toBe('Initial commit')
    })
  })

  describe('分支操作', () => {
    it('应该能够获取分支列表', async () => {
      const { exec } = await import('node:child_process')
      vi.mocked(exec).mockImplementation((command, options, callback) => {
        if (typeof callback === 'function') {
          const mockOutput = '* main\n  feature/test\n  origin/main'
          callback(null, { stdout: mockOutput, stderr: '' } as any)
        }
        return {} as any
      })

      const branches = await git.branches()
      expect(branches).toHaveLength(3)
      expect(branches[0].name).toBe('main')
      expect(branches[0].current).toBe(true)
      expect(branches[1].name).toBe('feature/test')
      expect(branches[1].current).toBe(false)
    })

    it('应该能够创建分支', async () => {
      const { exec } = await import('node:child_process')
      vi.mocked(exec).mockImplementation((command, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, { stdout: '', stderr: '' } as any)
        }
        return {} as any
      })

      await expect(git.createBranch('feature/new')).resolves.not.toThrow()
    })

    it('应该能够切换分支', async () => {
      const { exec } = await import('node:child_process')
      vi.mocked(exec).mockImplementation((command, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, { stdout: 'Switched to branch feature/test', stderr: '' } as any)
        }
        return {} as any
      })

      await expect(git.checkout('feature/test')).resolves.not.toThrow()
    })

    it('应该能够合并分支', async () => {
      const { exec } = await import('node:child_process')
      vi.mocked(exec).mockImplementation((command, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, { stdout: 'Merge made by the recursive strategy', stderr: '' } as any)
        }
        return {} as any
      })

      await expect(git.merge('feature/test')).resolves.not.toThrow()
    })
  })

  describe('远程操作', () => {
    it('应该能够获取远程仓库列表', async () => {
      const { exec } = await import('node:child_process')
      vi.mocked(exec).mockImplementation((command, options, callback) => {
        if (typeof callback === 'function') {
          const mockOutput = 'origin\tupstream'
          callback(null, { stdout: mockOutput, stderr: '' } as any)
        }
        return {} as any
      })

      const remotes = await git.remotes()
      expect(remotes).toHaveLength(2)
      expect(remotes[0].name).toBe('origin')
      expect(remotes[1].name).toBe('upstream')
    })

    it('应该能够添加远程仓库', async () => {
      const { exec } = await import('node:child_process')
      vi.mocked(exec).mockImplementation((command, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, { stdout: '', stderr: '' } as any)
        }
        return {} as any
      })

      await expect(
        git.addRemote('upstream', 'https://github.com/user/repo.git'),
      ).resolves.not.toThrow()
    })

    it('应该能够推送到远程仓库', async () => {
      const { exec } = await import('node:child_process')
      vi.mocked(exec).mockImplementation((command, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, { stdout: 'Everything up-to-date', stderr: '' } as any)
        }
        return {} as any
      })

      await expect(git.push()).resolves.not.toThrow()
    })

    it('应该能够从远程仓库拉�?, async () => {
      const { exec } = await import('node:child_process')
      vi.mocked(exec).mockImplementation((command, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, { stdout: 'Already up to date', stderr: '' } as any)
        }
        return {} as any
      })

      await expect(git.pull()).resolves.not.toThrow()
    })
  })

  describe('配置操作', () => {
    it('应该能够获取配置', async () => {
      const { exec } = await import('node:child_process')
      vi.mocked(exec).mockImplementation((command, options, callback) => {
        if (typeof callback === 'function') {
          const mockOutput = 'user.name=John Doe\nuser.email=john@example.com'
          callback(null, { stdout: mockOutput, stderr: '' } as any)
        }
        return {} as any
      })

      const config = await git.getConfig()
      expect(config).toEqual({
        'user.name': 'John Doe',
        'user.email': 'john@example.com',
      })
    })

    it('应该能够设置配置', async () => {
      const { exec } = await import('node:child_process')
      vi.mocked(exec).mockImplementation((command, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, { stdout: '', stderr: '' } as any)
        }
        return {} as any
      })

      await expect(git.setConfig('user.name', 'Jane Doe')).resolves.not.toThrow()
    })
  })
})

describe('gitUtils', () => {
  describe('工具函数', () => {
    it('应该能够查找仓库根目�?, async () => {
      // Mock FileSystem.exists
      vi.spyOn(FileSystem, 'exists').mockImplementation(async (path) => {
        return path.includes('.git')
      })

      const root = await GitUtils.findRepositoryRoot('/some/project/subdir')
      expect(root).toBeTruthy()
    })

    it('应该能够检查文件是否被跟踪', async () => {
      const { exec } = await import('node:child_process')
      vi.mocked(exec).mockImplementation((command, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, { stdout: 'tracked-file.txt', stderr: '' } as any)
        }
        return {} as any
      })

      const isTracked = await GitUtils.isFileTracked('tracked-file.txt', '/repo')
      expect(isTracked).toBe(true)
    })

    it('应该能够获取文件状�?, async () => {
      const { exec } = await import('node:child_process')
      vi.mocked(exec).mockImplementation((command, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, { stdout: 'M  modified-file.txt', stderr: '' } as any)
        }
        return {} as any
      })

      const status = await GitUtils.getFileStatus('modified-file.txt', '/repo')
      expect(status?.status).toBe('modified')
      expect(status?.staged).toBe(true)
    })
  })
})



