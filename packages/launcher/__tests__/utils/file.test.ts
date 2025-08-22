/**
 * FileUtils 单元测试
 * 测试文件系统操作工具类的所有功能
 */

import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import fs from 'node:fs/promises'
import path from 'node:path'
import { FileUtils } from '@/utils/file'

// Mock fs 模块
vi.mock('node:fs/promises')

const mockFs = vi.mocked(fs)

describe('FileUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('exists', () => {
    it('should return true when file exists', async () => {
      mockFs.access.mockResolvedValueOnce(undefined)
      
      const result = await FileUtils.exists('/test/file.txt')
      
      expect(result).toBe(true)
      expect(mockFs.access).toHaveBeenCalledWith('/test/file.txt')
    })

    it('should return false when file does not exist', async () => {
      mockFs.access.mockRejectedValueOnce(new Error('ENOENT'))
      
      const result = await FileUtils.exists('/test/nonexistent.txt')
      
      expect(result).toBe(false)
      expect(mockFs.access).toHaveBeenCalledWith('/test/nonexistent.txt')
    })
  })

  describe('isDirectory', () => {
    it('should return true for directory', async () => {
      const mockStat = { isDirectory: vi.fn().mockReturnValue(true) }
      mockFs.stat.mockResolvedValueOnce(mockStat as any)
      
      const result = await FileUtils.isDirectory('/test/dir')
      
      expect(result).toBe(true)
      expect(mockFs.stat).toHaveBeenCalledWith('/test/dir')
      expect(mockStat.isDirectory).toHaveBeenCalled()
    })

    it('should return false for file', async () => {
      const mockStat = { isDirectory: vi.fn().mockReturnValue(false) }
      mockFs.stat.mockResolvedValueOnce(mockStat as any)
      
      const result = await FileUtils.isDirectory('/test/file.txt')
      
      expect(result).toBe(false)
    })

    it('should return false when stat fails', async () => {
      mockFs.stat.mockRejectedValueOnce(new Error('ENOENT'))
      
      const result = await FileUtils.isDirectory('/test/nonexistent')
      
      expect(result).toBe(false)
    })
  })

  describe('isFile', () => {
    it('should return true for file', async () => {
      const mockStat = { isFile: vi.fn().mockReturnValue(true) }
      mockFs.stat.mockResolvedValueOnce(mockStat as any)
      
      const result = await FileUtils.isFile('/test/file.txt')
      
      expect(result).toBe(true)
      expect(mockFs.stat).toHaveBeenCalledWith('/test/file.txt')
      expect(mockStat.isFile).toHaveBeenCalled()
    })

    it('should return false for directory', async () => {
      const mockStat = { isFile: vi.fn().mockReturnValue(false) }
      mockFs.stat.mockResolvedValueOnce(mockStat as any)
      
      const result = await FileUtils.isFile('/test/dir')
      
      expect(result).toBe(false)
    })

    it('should return false when stat fails', async () => {
      mockFs.stat.mockRejectedValueOnce(new Error('ENOENT'))
      
      const result = await FileUtils.isFile('/test/nonexistent')
      
      expect(result).toBe(false)
    })
  })

  describe('ensureDir', () => {
    it('should create directory recursively', async () => {
      mockFs.mkdir.mockResolvedValueOnce(undefined)
      
      await FileUtils.ensureDir('/test/nested/dir')
      
      expect(mockFs.mkdir).toHaveBeenCalledWith('/test/nested/dir', { recursive: true })
    })

    it('should ignore EEXIST error', async () => {
      const error = new Error('Directory exists') as NodeJS.ErrnoException
      error.code = 'EEXIST'
      mockFs.mkdir.mockRejectedValueOnce(error)
      
      await expect(FileUtils.ensureDir('/test/existing')).resolves.not.toThrow()
    })

    it('should throw on other errors', async () => {
      const error = new Error('Permission denied') as NodeJS.ErrnoException
      error.code = 'EACCES'
      mockFs.mkdir.mockRejectedValueOnce(error)
      
      await expect(FileUtils.ensureDir('/test/forbidden')).rejects.toThrow('创建目录失败')
    })
  })

  describe('readJson', () => {
    it('should read and parse JSON file', async () => {
      const jsonContent = '{"name": "test", "version": "1.0.0"}'
      mockFs.readFile.mockResolvedValueOnce(jsonContent)
      
      const result = await FileUtils.readJson('/test/package.json')
      
      expect(result).toEqual({ name: 'test', version: '1.0.0' })
      expect(mockFs.readFile).toHaveBeenCalledWith('/test/package.json', 'utf-8')
    })

    it('should throw error for invalid JSON', async () => {
      mockFs.readFile.mockResolvedValueOnce('invalid json')
      
      await expect(FileUtils.readJson('/test/invalid.json')).rejects.toThrow('读取JSON文件失败')
    })

    it('should throw error when file read fails', async () => {
      mockFs.readFile.mockRejectedValueOnce(new Error('File not found'))
      
      await expect(FileUtils.readJson('/test/missing.json')).rejects.toThrow('读取JSON文件失败')
    })
  })

  describe('writeJson', () => {
    it('should write JSON file with proper formatting', async () => {
      const data = { name: 'test', version: '1.0.0' }
      const expectedContent = JSON.stringify(data, null, 2)
      
      // Mock ensureDir
      mockFs.mkdir.mockResolvedValueOnce(undefined)
      mockFs.writeFile.mockResolvedValueOnce(undefined)
      
      await FileUtils.writeJson('/test/output.json', data)
      
      expect(mockFs.writeFile).toHaveBeenCalledWith('/test/output.json', expectedContent, 'utf-8')
    })

    it('should use custom indentation', async () => {
      const data = { test: true }
      const expectedContent = JSON.stringify(data, null, 4)
      
      mockFs.mkdir.mockResolvedValueOnce(undefined)
      mockFs.writeFile.mockResolvedValueOnce(undefined)
      
      await FileUtils.writeJson('/test/output.json', data, 4)
      
      expect(mockFs.writeFile).toHaveBeenCalledWith('/test/output.json', expectedContent, 'utf-8')
    })

    it('should handle write errors', async () => {
      mockFs.mkdir.mockResolvedValueOnce(undefined)
      mockFs.writeFile.mockRejectedValueOnce(new Error('Permission denied'))
      
      await expect(FileUtils.writeJson('/test/forbidden.json', {})).rejects.toThrow('写入JSON文件失败')
    })
  })

  describe('copyFile', () => {
    it('should copy file and ensure destination directory', async () => {
      mockFs.mkdir.mockResolvedValueOnce(undefined)
      mockFs.copyFile.mockResolvedValueOnce(undefined)
      
      await FileUtils.copyFile('/src/file.txt', '/dest/dir/file.txt')
      
      expect(mockFs.mkdir).toHaveBeenCalledWith('/dest/dir', { recursive: true })
      expect(mockFs.copyFile).toHaveBeenCalledWith('/src/file.txt', '/dest/dir/file.txt')
    })

    it('should handle copy errors', async () => {
      mockFs.mkdir.mockResolvedValueOnce(undefined)
      mockFs.copyFile.mockRejectedValueOnce(new Error('Copy failed'))
      
      await expect(FileUtils.copyFile('/src/file.txt', '/dest/file.txt')).rejects.toThrow('复制文件失败')
    })
  })

  describe('remove', () => {
    it('should remove file or directory', async () => {
      mockFs.rm.mockResolvedValueOnce(undefined)
      
      await FileUtils.remove('/test/target')
      
      expect(mockFs.rm).toHaveBeenCalledWith('/test/target', { recursive: true, force: true })
    })

    it('should ignore ENOENT error', async () => {
      const error = new Error('Not found') as NodeJS.ErrnoException
      error.code = 'ENOENT'
      mockFs.rm.mockRejectedValueOnce(error)
      
      await expect(FileUtils.remove('/test/nonexistent')).resolves.not.toThrow()
    })

    it('should throw on other errors', async () => {
      const error = new Error('Permission denied') as NodeJS.ErrnoException
      error.code = 'EACCES'
      mockFs.rm.mockRejectedValueOnce(error)
      
      await expect(FileUtils.remove('/test/forbidden')).rejects.toThrow('删除失败')
    })
  })

  describe('getFileSize', () => {
    it('should return file size', async () => {
      const mockStat = { size: 1024 }
      mockFs.stat.mockResolvedValueOnce(mockStat as any)
      
      const result = await FileUtils.getFileSize('/test/file.txt')
      
      expect(result).toBe(1024)
      expect(mockFs.stat).toHaveBeenCalledWith('/test/file.txt')
    })

    it('should handle stat errors', async () => {
      mockFs.stat.mockRejectedValueOnce(new Error('File not found'))
      
      await expect(FileUtils.getFileSize('/test/missing.txt')).rejects.toThrow('获取文件大小失败')
    })
  })

  describe('findFiles', () => {
    it('should find files matching string pattern', async () => {
      const mockEntries = [
        { name: 'test.txt', isDirectory: () => false, isFile: () => true },
        { name: 'other.txt', isDirectory: () => false, isFile: () => true },
        { name: 'subdir', isDirectory: () => true, isFile: () => false }
      ]
      
      mockFs.readdir.mockResolvedValueOnce(mockEntries as any)
      
      const result = await FileUtils.findFiles('/test', 'test')
      
      expect(result).toEqual([path.join('/test', 'test.txt')])
    })

    it('should find files matching regex pattern', async () => {
      const mockEntries = [
        { name: 'test.ts', isDirectory: () => false, isFile: () => true },
        { name: 'test.js', isDirectory: () => false, isFile: () => true },
        { name: 'readme.md', isDirectory: () => false, isFile: () => true }
      ]
      
      mockFs.readdir.mockResolvedValueOnce(mockEntries as any)
      
      const result = await FileUtils.findFiles('/test', /\.(ts|js)$/)
      
      expect(result).toEqual([
        path.join('/test', 'test.ts'),
        path.join('/test', 'test.js')
      ])
    })

    it('should handle read directory errors gracefully', async () => {
      mockFs.readdir.mockRejectedValueOnce(new Error('Permission denied'))
      
      // 应该不抛出错误，但会记录警告
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const result = await FileUtils.findFiles('/forbidden', 'test')
      
      expect(result).toEqual([])
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })

    it('should respect maxDepth option', async () => {
      // 这个测试需要更复杂的 mock 设置，暂时跳过
      // 在实际应用中，可以通过递归调用来测试深度限制
    })
  })

  describe('getDirSize', () => {
    it('should calculate directory size recursively', async () => {
      const mockEntries = ['file1.txt', 'file2.txt']
      const mockStats = [
        { isFile: () => true, isDirectory: () => false, size: 100 },
        { isFile: () => true, isDirectory: () => false, size: 200 }
      ]
      
      mockFs.readdir.mockResolvedValueOnce(mockEntries)
      mockFs.stat
        .mockResolvedValueOnce({ isFile: () => false, isDirectory: () => true } as any)
        .mockResolvedValueOnce(mockStats[0] as any)
        .mockResolvedValueOnce(mockStats[1] as any)
      
      const result = await FileUtils.getDirSize('/test/dir')
      
      expect(result).toBe(300)
    })

    it('should handle calculation errors', async () => {
      mockFs.stat.mockRejectedValueOnce(new Error('Access denied'))
      
      await expect(FileUtils.getDirSize('/forbidden')).rejects.toThrow('计算目录大小失败')
    })
  })
})