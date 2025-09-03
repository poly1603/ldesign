/**
 * GitError 类测试
 */

import { describe, it, expect } from 'vitest'
import { GitError, GitErrorType } from '../src/errors/GitError.js'

describe('GitError', () => {
  describe('构造函数', () => {
    it('应该能够创建基本的 GitError', () => {
      const error = new GitError(
        GitErrorType.REPOSITORY_NOT_FOUND,
        'Repository not found'
      )
      
      expect(error).toBeInstanceOf(GitError)
      expect(error).toBeInstanceOf(Error)
      expect(error.name).toBe('GitError')
      expect(error.type).toBe(GitErrorType.REPOSITORY_NOT_FOUND)
      expect(error.code).toBe(GitErrorType.REPOSITORY_NOT_FOUND)
      expect(error.message).toBe('Repository not found')
      expect(error.timestamp).toBeInstanceOf(Date)
    })

    it('应该能够创建包含原始错误的 GitError', () => {
      const originalError = new Error('Original error message')
      const gitError = new GitError(
        GitErrorType.COMMAND_FAILED,
        'Command failed',
        originalError
      )
      
      expect(gitError.originalError).toBe(originalError)
    })

    it('应该能够创建包含输出的 GitError', () => {
      const output = 'Command output'
      const gitError = new GitError(
        GitErrorType.COMMAND_FAILED,
        'Command failed',
        undefined,
        output
      )
      
      expect(gitError.output).toBe(output)
    })
  })

  describe('getFormattedMessage', () => {
    it('应该返回格式化的错误消息', () => {
      const error = new GitError(
        GitErrorType.REPOSITORY_NOT_FOUND,
        'Repository not found'
      )
      
      const formatted = error.getFormattedMessage()
      
      expect(formatted).toContain('[REPOSITORY_NOT_FOUND]')
      expect(formatted).toContain('Repository not found')
    })

    it('应该包含输出信息', () => {
      const error = new GitError(
        GitErrorType.COMMAND_FAILED,
        'Command failed',
        undefined,
        'Command output'
      )
      
      const formatted = error.getFormattedMessage()
      
      expect(formatted).toContain('Output: Command output')
    })

    it('应该包含原始错误信息', () => {
      const originalError = new Error('Original error')
      const error = new GitError(
        GitErrorType.COMMAND_FAILED,
        'Command failed',
        originalError
      )
      
      const formatted = error.getFormattedMessage()
      
      expect(formatted).toContain('Original Error: Original error')
    })
  })

  describe('toJSON', () => {
    it('应该返回 JSON 格式的错误信息', () => {
      const originalError = new Error('Original error')
      const error = new GitError(
        GitErrorType.COMMAND_FAILED,
        'Command failed',
        originalError,
        'Command output'
      )
      
      const json = error.toJSON()
      
      expect(json).toHaveProperty('name', 'GitError')
      expect(json).toHaveProperty('type', GitErrorType.COMMAND_FAILED)
      expect(json).toHaveProperty('code', GitErrorType.COMMAND_FAILED)
      expect(json).toHaveProperty('message', 'Command failed')
      expect(json).toHaveProperty('output', 'Command output')
      expect(json).toHaveProperty('timestamp')
      expect(json).toHaveProperty('originalError')
    })
  })

  describe('静态工厂方法', () => {
    it('repositoryNotFound 应该创建正确的错误', () => {
      const error = GitError.repositoryNotFound('/path/to/repo')
      
      expect(error.type).toBe(GitErrorType.REPOSITORY_NOT_FOUND)
      expect(error.message).toContain('/path/to/repo')
    })

    it('repositoryExists 应该创建正确的错误', () => {
      const error = GitError.repositoryExists('/path/to/repo')
      
      expect(error.type).toBe(GitErrorType.REPOSITORY_EXISTS)
      expect(error.message).toContain('/path/to/repo')
    })

    it('branchNotFound 应该创建正确的错误', () => {
      const error = GitError.branchNotFound('feature-branch')
      
      expect(error.type).toBe(GitErrorType.BRANCH_NOT_FOUND)
      expect(error.message).toContain('feature-branch')
    })

    it('branchExists 应该创建正确的错误', () => {
      const error = GitError.branchExists('feature-branch')
      
      expect(error.type).toBe(GitErrorType.BRANCH_EXISTS)
      expect(error.message).toContain('feature-branch')
    })

    it('remoteNotFound 应该创建正确的错误', () => {
      const error = GitError.remoteNotFound('origin')
      
      expect(error.type).toBe(GitErrorType.REMOTE_NOT_FOUND)
      expect(error.message).toContain('origin')
    })

    it('commandFailed 应该创建正确的错误', () => {
      const error = GitError.commandFailed('git push', 'Permission denied')
      
      expect(error.type).toBe(GitErrorType.COMMAND_FAILED)
      expect(error.message).toContain('git push')
      expect(error.output).toBe('Permission denied')
    })

    it('networkError 应该创建正确的错误', () => {
      const error = GitError.networkError('Connection timeout')
      
      expect(error.type).toBe(GitErrorType.NETWORK_ERROR)
      expect(error.message).toContain('Connection timeout')
    })

    it('permissionDenied 应该创建正确的错误', () => {
      const error = GitError.permissionDenied('push', '/path/to/repo')
      
      expect(error.type).toBe(GitErrorType.PERMISSION_DENIED)
      expect(error.message).toContain('push')
      expect(error.message).toContain('/path/to/repo')
    })

    it('mergeConflict 应该创建正确的错误', () => {
      const conflictedFiles = ['file1.txt', 'file2.txt']
      const error = GitError.mergeConflict(conflictedFiles)
      
      expect(error.type).toBe(GitErrorType.MERGE_CONFLICT)
      expect(error.message).toContain('file1.txt')
      expect(error.message).toContain('file2.txt')
    })

    it('invalidArgument 应该创建正确的错误', () => {
      const error = GitError.invalidArgument('branchName', 'invalid:name')
      
      expect(error.type).toBe(GitErrorType.INVALID_ARGUMENT)
      expect(error.message).toContain('branchName')
      expect(error.message).toContain('invalid:name')
    })

    it('timeout 应该创建正确的错误', () => {
      const error = GitError.timeout('clone', 30000)
      
      expect(error.type).toBe(GitErrorType.TIMEOUT)
      expect(error.message).toContain('clone')
      expect(error.message).toContain('30000')
    })

    it('fromError 应该从普通错误创建 GitError', () => {
      const originalError = new Error('Original error')
      const gitError = GitError.fromError(originalError)
      
      expect(gitError.type).toBe(GitErrorType.UNKNOWN)
      expect(gitError.message).toBe('Original error')
      expect(gitError.originalError).toBe(originalError)
    })

    it('fromError 应该能够指定错误类型', () => {
      const originalError = new Error('Network error')
      const gitError = GitError.fromError(originalError, GitErrorType.NETWORK_ERROR)
      
      expect(gitError.type).toBe(GitErrorType.NETWORK_ERROR)
      expect(gitError.message).toBe('Network error')
      expect(gitError.originalError).toBe(originalError)
    })
  })

  describe('错误类型枚举', () => {
    it('应该包含所有预期的错误类型', () => {
      const expectedTypes = [
        'REPOSITORY_NOT_FOUND',
        'REPOSITORY_EXISTS',
        'BRANCH_NOT_FOUND',
        'BRANCH_EXISTS',
        'REMOTE_NOT_FOUND',
        'REMOTE_EXISTS',
        'COMMIT_FAILED',
        'PUSH_FAILED',
        'PULL_FAILED',
        'CLONE_FAILED',
        'MERGE_CONFLICT',
        'PERMISSION_DENIED',
        'NETWORK_ERROR',
        'CONFIG_ERROR',
        'COMMAND_FAILED',
        'INVALID_ARGUMENT',
        'TIMEOUT',
        'UNKNOWN'
      ]
      
      expectedTypes.forEach(type => {
        expect(GitErrorType).toHaveProperty(type)
      })
    })
  })

  describe('错误继承', () => {
    it('应该正确继承 Error 类', () => {
      const error = new GitError(
        GitErrorType.REPOSITORY_NOT_FOUND,
        'Test error'
      )
      
      expect(error instanceof Error).toBe(true)
      expect(error instanceof GitError).toBe(true)
    })

    it('应该能够被 try-catch 捕获', () => {
      let caughtError: any = null
      
      try {
        throw new GitError(GitErrorType.REPOSITORY_NOT_FOUND, 'Test error')
      } catch (error) {
        caughtError = error
      }
      
      expect(caughtError).toBeInstanceOf(GitError)
      expect(caughtError.type).toBe(GitErrorType.REPOSITORY_NOT_FOUND)
    })

    it('应该有正确的堆栈跟踪', () => {
      const error = new GitError(
        GitErrorType.REPOSITORY_NOT_FOUND,
        'Test error'
      )
      
      expect(error.stack).toBeDefined()
      expect(error.stack).toContain('GitError')
    })
  })
})
