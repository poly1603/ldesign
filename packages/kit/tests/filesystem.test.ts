/**
 * FileSystem 模块测试
 */

import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { FileSystem } from '../src/filesystem'

describe('fileSystem', () => {
  let testDir: string

  beforeEach(async () => {
    testDir = join(tmpdir(), `ldesign-test-${Date.now()}`)
    await FileSystem.createDir(testDir)
  })

  afterEach(async () => {
    try {
      await FileSystem.removeDir(testDir)
    }
    catch {
      // 忽略清理错误
    }
  })

  describe('文件操作', () => {
    it('应该能够写入和读取文�?, async () => {
      const filePath = join(testDir, 'test.txt')
      const content = 'Hello, World!'

      await FileSystem.writeFile(filePath, content)
      const readContent = await FileSystem.readFile(filePath)

      expect(readContent).toBe(content)
    })

    it('应该能够检查文件是否存�?, async () => {
      const filePath = join(testDir, 'test.txt')

      expect(await FileSystem.exists(filePath)).toBe(false)

      await FileSystem.writeFile(filePath, 'test')
      expect(await FileSystem.exists(filePath)).toBe(true)
    })

    it('应该能够删除文件', async () => {
      const filePath = join(testDir, 'test.txt')

      await FileSystem.writeFile(filePath, 'test')
      expect(await FileSystem.exists(filePath)).toBe(true)

      await FileSystem.removeFile(filePath)
      expect(await FileSystem.exists(filePath)).toBe(false)
    })

    it('应该能够获取文件信息', async () => {
      const filePath = join(testDir, 'test.txt')
      const content = 'Hello, World!'

      await FileSystem.writeFile(filePath, content)
      const info = await FileSystem.getFileInfo(filePath)

      expect(info.name).toBe('test.txt')
      expect(info.size).toBe(content.length)
      expect(info.isFile).toBe(true)
      expect(info.isDirectory).toBe(false)
    })
  })

  describe('目录操作', () => {
    it('应该能够创建目录', async () => {
      const dirPath = join(testDir, 'subdir')

      await FileSystem.createDir(dirPath)
      expect(await FileSystem.exists(dirPath)).toBe(true)

      const info = await FileSystem.getFileInfo(dirPath)
      expect(info.isDirectory).toBe(true)
    })

    it('应该能够递归创建目录', async () => {
      const dirPath = join(testDir, 'level1', 'level2', 'level3')

      await FileSystem.createDir(dirPath, true)
      expect(await FileSystem.exists(dirPath)).toBe(true)
    })

    it('应该能够读取目录内容', async () => {
      // 创建测试文件和目�?      await FileSystem.writeFile(join(testDir, 'file1.txt'), 'content1')
      await FileSystem.writeFile(join(testDir, 'file2.txt'), 'content2')
      await FileSystem.createDir(join(testDir, 'subdir'))

      const entries = await FileSystem.readDir(testDir)

      expect(entries).toHaveLength(3)
      expect(entries.map(e => (typeof e === 'string' ? e : e.name)).sort()).toEqual([
        'file1.txt',
        'file2.txt',
        'subdir',
      ])
    })

    it('应该能够删除目录', async () => {
      const dirPath = join(testDir, 'subdir')

      await FileSystem.createDir(dirPath)
      expect(await FileSystem.exists(dirPath)).toBe(true)

      await FileSystem.removeDir(dirPath)
      expect(await FileSystem.exists(dirPath)).toBe(false)
    })
  })

  describe('路径操作', () => {
    it('应该能够解析相对路径', () => {
      const result = FileSystem.resolvePath('./test', testDir)
      expect(result).toBe(join(testDir, 'test'))
    })

    it('应该能够规范化路�?, () => {
      const result = FileSystem.normalizePath('path//to///file')
      expect(result).toBe(join('path', 'to', 'file'))
    })

    it('应该能够检查路径是否为绝对路径', () => {
      expect(FileSystem.isAbsolutePath('/absolute/path')).toBe(true)
      expect(FileSystem.isAbsolutePath('C:\\absolute\\path')).toBe(true)
      expect(FileSystem.isAbsolutePath('./relative/path')).toBe(false)
      expect(FileSystem.isAbsolutePath('relative/path')).toBe(false)
    })
  })

  describe('文件监听', () => {
    it('应该能够监听文件变化', async () => {
      const filePath = join(testDir, 'watch-test.txt')
      let changeDetected = false

      const watcher = FileSystem.watch(filePath, () => {
        changeDetected = true
      })

      // 等待监听器启�?      await new Promise(resolve => setTimeout(resolve, 100))

      await FileSystem.writeFile(filePath, 'initial content')

      // 等待变化检�?      await new Promise(resolve => setTimeout(resolve, 200))

      watcher.close()
      expect(changeDetected).toBe(true)
    })
  })

  describe('错误处理', () => {
    it('读取不存在的文件应该抛出错误', async () => {
      const filePath = join(testDir, 'nonexistent.txt')

      await expect(FileSystem.readFile(filePath)).rejects.toThrow()
    })

    it('删除不存在的文件应该抛出错误', async () => {
      const filePath = join(testDir, 'nonexistent.txt')

      await expect(FileSystem.removeFile(filePath)).rejects.toThrow()
    })

    it('获取不存在文件的信息应该抛出错误', async () => {
      const filePath = join(testDir, 'nonexistent.txt')

      await expect(FileSystem.getFileInfo(filePath)).rejects.toThrow()
    })
  })

  describe('工具方法', () => {
    it('应该能够获取文件扩展�?, () => {
      expect(FileSystem.getExtension('file.txt')).toBe('.txt')
      expect(FileSystem.getExtension('file.tar.gz')).toBe('.gz')
      expect(FileSystem.getExtension('file')).toBe('')
    })

    it('应该能够获取文件名（不含扩展名）', () => {
      expect(FileSystem.getBasename('file.txt')).toBe('file')
      expect(FileSystem.getBasename('/path/to/file.txt')).toBe('file')
      expect(FileSystem.getBasename('file')).toBe('file')
    })

    it('应该能够检查是否为隐藏文件', () => {
      expect(FileSystem.isHidden('.hidden')).toBe(true)
      expect(FileSystem.isHidden('visible.txt')).toBe(false)
      expect(FileSystem.isHidden('/path/.hidden')).toBe(true)
    })
  })
})


