/**
 * FileSystem 测试
 */

import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { FileSystem } from '../../src/filesystem/filesystem'

describe('fileSystem', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = global.testUtils.createTempDir()
  })

  afterEach(() => {
    global.testUtils.cleanupTempDir(tempDir)
  })

  describe('exists', () => {
    it('应该检测文件是否存�?, async () => {
      const filePath = join(tempDir, 'test.txt')

      expect(await FileSystem.exists(filePath)).toBe(false)

      await fs.writeFile(filePath, 'test content')
      expect(await FileSystem.exists(filePath)).toBe(true)
    })

    it('应该检测目录是否存�?, async () => {
      const dirPath = join(tempDir, 'testdir')

      expect(await FileSystem.exists(dirPath)).toBe(false)

      await fs.mkdir(dirPath)
      expect(await FileSystem.exists(dirPath)).toBe(true)
    })
  })

  describe('readFile', () => {
    it('应该读取文件内容', async () => {
      const filePath = join(tempDir, 'test.txt')
      const content = 'Hello, World!'

      await fs.writeFile(filePath, content)

      const result = await FileSystem.readFile(filePath)
      expect(result).toBe(content)
    })

    it('应该读取JSON文件', async () => {
      const filePath = join(tempDir, 'test.json')
      const data = { name: 'test', value: 123 }

      await fs.writeFile(filePath, JSON.stringify(data))

      const result = await FileSystem.readFile(filePath, 'json')
      expect(result).toEqual(data)
    })

    it('应该处理不存在的文件', async () => {
      const filePath = join(tempDir, 'nonexistent.txt')

      await expect(FileSystem.readFile(filePath)).rejects.toThrow()
    })
  })

  describe('writeFile', () => {
    it('应该写入文件内容', async () => {
      const filePath = join(tempDir, 'test.txt')
      const content = 'Hello, World!'

      await FileSystem.writeFile(filePath, content)

      const result = await fs.readFile(filePath, 'utf8')
      expect(result).toBe(content)
    })

    it('应该写入JSON文件', async () => {
      const filePath = join(tempDir, 'test.json')
      const data = { name: 'test', value: 123 }

      await FileSystem.writeFile(filePath, data, 'json')

      const result = JSON.parse(await fs.readFile(filePath, 'utf8'))
      expect(result).toEqual(data)
    })

    it('应该创建不存在的目录', async () => {
      const filePath = join(tempDir, 'nested', 'dir', 'test.txt')
      const content = 'test'

      await FileSystem.writeFile(filePath, content)

      expect(await FileSystem.exists(filePath)).toBe(true)
      const result = await fs.readFile(filePath, 'utf8')
      expect(result).toBe(content)
    })
  })

  describe('appendFile', () => {
    it('应该追加文件内容', async () => {
      const filePath = join(tempDir, 'test.txt')

      await FileSystem.writeFile(filePath, 'Hello')
      await FileSystem.appendFile(filePath, ', World!')

      const result = await fs.readFile(filePath, 'utf8')
      expect(result).toBe('Hello, World!')
    })

    it('应该创建新文件如果不存在', async () => {
      const filePath = join(tempDir, 'new.txt')
      const content = 'New content'

      await FileSystem.appendFile(filePath, content)

      const result = await fs.readFile(filePath, 'utf8')
      expect(result).toBe(content)
    })
  })

  describe('deleteFile', () => {
    it('应该删除文件', async () => {
      const filePath = join(tempDir, 'test.txt')

      await fs.writeFile(filePath, 'test')
      expect(await FileSystem.exists(filePath)).toBe(true)

      await FileSystem.deleteFile(filePath)
      expect(await FileSystem.exists(filePath)).toBe(false)
    })

    it('应该处理不存在的文件', async () => {
      const filePath = join(tempDir, 'nonexistent.txt')

      await expect(FileSystem.deleteFile(filePath)).rejects.toThrow()
    })
  })

  describe('copy', () => {
    it('应该复制文件', async () => {
      const srcPath = join(tempDir, 'source.txt')
      const destPath = join(tempDir, 'destination.txt')
      const content = 'test content'

      await fs.writeFile(srcPath, content)

      await FileSystem.copy(srcPath, destPath)

      expect(await FileSystem.exists(destPath)).toBe(true)
      const result = await fs.readFile(destPath, 'utf8')
      expect(result).toBe(content)
    })

    it('应该复制目录', async () => {
      const srcDir = join(tempDir, 'source')
      const destDir = join(tempDir, 'destination')
      const filePath = join(srcDir, 'test.txt')
      const content = 'test content'

      await fs.mkdir(srcDir)
      await fs.writeFile(filePath, content)

      await FileSystem.copy(srcDir, destDir)

      expect(await FileSystem.exists(destDir)).toBe(true)
      expect(await FileSystem.exists(join(destDir, 'test.txt'))).toBe(true)

      const result = await fs.readFile(join(destDir, 'test.txt'), 'utf8')
      expect(result).toBe(content)
    })

    it('应该处理嵌套目录', async () => {
      const srcDir = join(tempDir, 'source')
      const nestedDir = join(srcDir, 'nested')
      const destDir = join(tempDir, 'destination')

      await fs.mkdir(srcDir)
      await fs.mkdir(nestedDir)
      await fs.writeFile(join(nestedDir, 'nested.txt'), 'nested content')

      await FileSystem.copy(srcDir, destDir)

      expect(await FileSystem.exists(join(destDir, 'nested', 'nested.txt'))).toBe(true)
    })
  })

  describe('move', () => {
    it('应该移动文件', async () => {
      const srcPath = join(tempDir, 'source.txt')
      const destPath = join(tempDir, 'destination.txt')
      const content = 'test content'

      await fs.writeFile(srcPath, content)

      await FileSystem.move(srcPath, destPath)

      expect(await FileSystem.exists(srcPath)).toBe(false)
      expect(await FileSystem.exists(destPath)).toBe(true)

      const result = await fs.readFile(destPath, 'utf8')
      expect(result).toBe(content)
    })

    it('应该移动目录', async () => {
      const srcDir = join(tempDir, 'source')
      const destDir = join(tempDir, 'destination')
      const filePath = join(srcDir, 'test.txt')

      await fs.mkdir(srcDir)
      await fs.writeFile(filePath, 'test')

      await FileSystem.move(srcDir, destDir)

      expect(await FileSystem.exists(srcDir)).toBe(false)
      expect(await FileSystem.exists(destDir)).toBe(true)
      expect(await FileSystem.exists(join(destDir, 'test.txt'))).toBe(true)
    })
  })

  describe('ensureDir', () => {
    it('应该创建目录', async () => {
      const dirPath = join(tempDir, 'newdir')

      await FileSystem.ensureDir(dirPath)

      expect(await FileSystem.exists(dirPath)).toBe(true)
      const stats = await fs.stat(dirPath)
      expect(stats.isDirectory()).toBe(true)
    })

    it('应该创建嵌套目录', async () => {
      const dirPath = join(tempDir, 'nested', 'deep', 'directory')

      await FileSystem.ensureDir(dirPath)

      expect(await FileSystem.exists(dirPath)).toBe(true)
    })

    it('应该不影响已存在的目�?, async () => {
      const dirPath = join(tempDir, 'existing')

      await fs.mkdir(dirPath)
      const statsBefore = await fs.stat(dirPath)

      await FileSystem.ensureDir(dirPath)

      const statsAfter = await fs.stat(dirPath)
      expect(statsAfter.mtime).toEqual(statsBefore.mtime)
    })
  })

  describe('removeDir', () => {
    it('应该删除空目�?, async () => {
      const dirPath = join(tempDir, 'emptydir')

      await fs.mkdir(dirPath)
      expect(await FileSystem.exists(dirPath)).toBe(true)

      await FileSystem.removeDir(dirPath)
      expect(await FileSystem.exists(dirPath)).toBe(false)
    })

    it('应该删除包含文件的目�?, async () => {
      const dirPath = join(tempDir, 'fulldir')
      const filePath = join(dirPath, 'test.txt')

      await fs.mkdir(dirPath)
      await fs.writeFile(filePath, 'test')

      await FileSystem.removeDir(dirPath)
      expect(await FileSystem.exists(dirPath)).toBe(false)
    })

    it('应该删除嵌套目录', async () => {
      const dirPath = join(tempDir, 'parent')
      const nestedPath = join(dirPath, 'nested')

      await fs.mkdir(dirPath)
      await fs.mkdir(nestedPath)
      await fs.writeFile(join(nestedPath, 'file.txt'), 'test')

      await FileSystem.removeDir(dirPath)
      expect(await FileSystem.exists(dirPath)).toBe(false)
    })
  })

  describe('readDir', () => {
    it('应该读取目录内容', async () => {
      const dirPath = join(tempDir, 'testdir')

      await fs.mkdir(dirPath)
      await fs.writeFile(join(dirPath, 'file1.txt'), 'content1')
      await fs.writeFile(join(dirPath, 'file2.txt'), 'content2')
      await fs.mkdir(join(dirPath, 'subdir'))

      const entries = await FileSystem.readDir(dirPath)

      expect(entries).toHaveLength(3)
      expect(entries.map(e => e.name).sort()).toEqual(['file1.txt', 'file2.txt', 'subdir'])
    })

    it('应该递归读取目录', async () => {
      const dirPath = join(tempDir, 'testdir')
      const subDirPath = join(dirPath, 'subdir')

      await fs.mkdir(dirPath)
      await fs.mkdir(subDirPath)
      await fs.writeFile(join(dirPath, 'file1.txt'), 'content1')
      await fs.writeFile(join(subDirPath, 'file2.txt'), 'content2')

      const entries = await FileSystem.readDir(dirPath, { recursive: true })

      expect(entries).toHaveLength(3) // file1.txt, subdir, file2.txt
      const names = entries.map(e => e.name)
      expect(names).toContain('file1.txt')
      expect(names).toContain('subdir')
      expect(names).toContain('file2.txt')
    })

    it('应该过滤文件类型', async () => {
      const dirPath = join(tempDir, 'testdir')

      await fs.mkdir(dirPath)
      await fs.writeFile(join(dirPath, 'file.txt'), 'content')
      await fs.mkdir(join(dirPath, 'subdir'))

      const files = await FileSystem.readDir(dirPath, { filter: 'files' })
      const dirs = await FileSystem.readDir(dirPath, { filter: 'directories' })

      expect(files).toHaveLength(1)
      expect(files[0].name).toBe('file.txt')
      expect(dirs).toHaveLength(1)
      expect(dirs[0].name).toBe('subdir')
    })
  })

  describe('stat', () => {
    it('应该获取文件统计信息', async () => {
      const filePath = join(tempDir, 'test.txt')
      const content = 'test content'

      await fs.writeFile(filePath, content)

      const stats = await FileSystem.stat(filePath)

      expect(stats.isFile).toBe(true)
      expect(stats.isDirectory).toBe(false)
      expect(stats.size).toBe(content.length)
      expect(stats.path).toBe(filePath)
      expect(stats.createdAt).toBeInstanceOf(Date)
      expect(stats.modifiedAt).toBeInstanceOf(Date)
    })

    it('应该获取目录统计信息', async () => {
      const dirPath = join(tempDir, 'testdir')

      await fs.mkdir(dirPath)

      const stats = await FileSystem.stat(dirPath)

      expect(stats.isFile).toBe(false)
      expect(stats.isDirectory).toBe(true)
      expect(stats.path).toBe(dirPath)
    })
  })

  describe('glob', () => {
    beforeEach(async () => {
      // 创建测试文件结构
      await fs.mkdir(join(tempDir, 'src'))
      await fs.mkdir(join(tempDir, 'src', 'components'))
      await fs.mkdir(join(tempDir, 'tests'))

      await fs.writeFile(join(tempDir, 'src', 'index.ts'), 'export {}')
      await fs.writeFile(join(tempDir, 'src', 'utils.ts'), 'export {}')
      await fs.writeFile(join(tempDir, 'src', 'components', 'Button.tsx'), 'export {}')
      await fs.writeFile(join(tempDir, 'tests', 'index.test.ts'), 'test')
      await fs.writeFile(join(tempDir, 'README.md'), '# Test')
    })

    it('应该匹配简单模�?, async () => {
      const files = await FileSystem.glob('*.md', { cwd: tempDir })

      expect(files).toHaveLength(1)
      expect(files[0]).toMatch(/README\.md$/)
    })

    it('应该匹配嵌套文件', async () => {
      const files = await FileSystem.glob('src/**/*.ts', { cwd: tempDir })

      expect(files).toHaveLength(2)
      expect(files.some(f => f.includes('index.ts'))).toBe(true)
      expect(files.some(f => f.includes('utils.ts'))).toBe(true)
    })

    it('应该匹配多种扩展�?, async () => {
      const files = await FileSystem.glob('src/**/*.{ts,tsx}', { cwd: tempDir })

      expect(files).toHaveLength(3)
      expect(files.some(f => f.includes('Button.tsx'))).toBe(true)
    })

    it('应该排除文件', async () => {
      const files = await FileSystem.glob('**/*', {
        cwd: tempDir,
        ignore: ['tests/**'],
      })

      expect(files.some(f => f.includes('test'))).toBe(false)
    })
  })
})


