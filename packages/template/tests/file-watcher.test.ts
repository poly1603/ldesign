/**
 * 文件监听器测试
 */

import type {
  FileWatcherCallbacks,
  FileWatcherOptions,
} from '../src/utils/file-watcher'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createFileWatcher,
  FileWatcher,
  getFileWatcher,
  resetFileWatcher,
} from '../src/utils/file-watcher'

// 模拟 chokidar
const mockChokidar = {
  watch: vi.fn(),
  close: vi.fn(),
  on: vi.fn(),
  add: vi.fn(),
  unwatch: vi.fn(),
}

// 模拟 fs.watch
const mockFsWatch = {
  close: vi.fn(),
  on: vi.fn(),
}

const mockFs = {
  watch: vi.fn(() => mockFsWatch),
  existsSync: vi.fn(),
  statSync: vi.fn(),
  promises: {
    stat: vi.fn(),
  },
}

// 模拟路径操作
const mockPath = {
  join: vi.fn((...args) => args.join('/')),
  resolve: vi.fn((...args) => `/${args.join('/')}`),
  dirname: vi.fn(p => p.split('/').slice(0, -1).join('/')),
  basename: vi.fn(p => p.split('/').pop()),
  extname: vi.fn((p) => {
    const parts = p.split('.')
    return parts.length > 1 ? `.${parts.pop()}` : ''
  }),
}

// 设置模拟
vi.mock('chokidar', () => ({
  default: {
    watch: mockChokidar.watch.mockReturnValue(mockChokidar),
  },
}))

vi.mock('fs', () => mockFs)
vi.mock('node:fs', () => mockFs)
vi.mock('path', () => mockPath)
vi.mock('node:path', () => mockPath)

describe('fileWatcher', () => {
  let fileWatcher: FileWatcher
  let mockOptions: FileWatcherOptions
  let mockCallbacks: FileWatcherCallbacks

  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()

    mockOptions = {
      rootDir: 'test/templates',
      includeExtensions: ['.vue', '.js', '.ts'],
      excludePatterns: ['node_modules', '.git'],
      debounceDelay: 300,
      recursive: true,
      maxDepth: 5,
    }

    mockCallbacks = {
      onTemplateChange: vi.fn(),
      onError: vi.fn(),
    }

    // 模拟文件系统
    mockFs.existsSync.mockReturnValue(true)
    mockFs.statSync.mockReturnValue({
      isDirectory: () => true,
      isFile: () => false,
      mtime: new Date(),
      size: 1024,
    })

    mockFs.promises.stat.mockResolvedValue({
      isDirectory: () => true,
      isFile: () => false,
      mtime: new Date(),
      size: 1024,
    })

    fileWatcher = new FileWatcher(mockOptions, mockCallbacks)
  })

  afterEach(() => {
    vi.useRealTimers()
    if (fileWatcher) {
      fileWatcher.destroy()
    }
    resetFileWatcher()
  })

  describe('构造函数', () => {
    it('应该使用默认选项创建监听器', () => {
      const defaultWatcher = new FileWatcher({
        rootDir: 'default/templates',
      })

      const options = defaultWatcher.getOptions()
      expect(options.rootDir).toBe('default/templates')
      expect(options.includeExtensions).toEqual(['.vue', '.js', '.ts', '.css', '.less', '.scss'])
      expect(options.debounceDelay).toBe(300)
      expect(options.recursive).toBe(true)
    })

    it('应该合并自定义选项', () => {
      const options = fileWatcher.getOptions()
      expect(options.rootDir).toBe('test/templates')
      expect(options.includeExtensions).toEqual(['.vue', '.js', '.ts'])
      expect(options.excludePatterns).toEqual(['node_modules', '.git'])
      expect(options.debounceDelay).toBe(300)
    })

    it('应该检测环境并选择监听策略', () => {
      // 在有 chokidar 的环境中应该优先使用 chokidar
      expect(fileWatcher.getWatcherType()).toBe('chokidar')
    })
  })

  describe('文件监听启动', () => {
    it('应该能够启动文件监听', async () => {
      await fileWatcher.startWatching()

      expect(fileWatcher.isWatching()).toBe(true)
      expect(mockChokidar.watch).toHaveBeenCalledWith(
        'test/templates',
        expect.objectContaining({
          ignored: expect.any(Function),
          persistent: true,
          ignoreInitial: true,
        }),
      )
    })

    it('应该处理启动错误', async () => {
      mockChokidar.watch.mockImplementation(() => {
        throw new Error('Watch failed')
      })

      await expect(fileWatcher.startWatching()).rejects.toThrow('Watch failed')
      expect(mockCallbacks.onError).toHaveBeenCalled()
    })

    it('应该防止重复启动', async () => {
      await fileWatcher.startWatching()
      await fileWatcher.startWatching() // 第二次启动

      expect(mockChokidar.watch).toHaveBeenCalledTimes(1)
    })
  })

  describe('文件变化检测', () => {
    beforeEach(async () => {
      await fileWatcher.startWatching()
    })

    it('应该检测文件添加事件', () => {
      const filePath = 'test/templates/login/desktop/default/index.vue'

      // 模拟 chokidar 的 add 事件
      const addHandler = mockChokidar.on.mock.calls.find(
        call => call[0] === 'add',
      )?.[1]

      expect(addHandler).toBeDefined()

      addHandler(filePath)
      vi.advanceTimersByTime(300)

      expect(mockCallbacks.onTemplateChange).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'added',
          path: filePath,
          filename: 'index.vue',
          metadata: expect.objectContaining({
            category: 'login',
            device: 'desktop',
            templateName: 'default',
            fileType: 'component',
          }),
        }),
      )
    })

    it('应该检测文件修改事件', () => {
      const filePath = 'test/templates/dashboard/desktop/overview/config.ts'

      const changeHandler = mockChokidar.on.mock.calls.find(
        call => call[0] === 'change',
      )?.[1]

      expect(changeHandler).toBeDefined()

      changeHandler(filePath)
      vi.advanceTimersByTime(300)

      expect(mockCallbacks.onTemplateChange).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'changed',
          path: filePath,
          filename: 'config.ts',
          metadata: expect.objectContaining({
            category: 'dashboard',
            device: 'desktop',
            templateName: 'overview',
            fileType: 'config',
          }),
        }),
      )
    })

    it('应该检测文件删除事件', () => {
      const filePath = 'test/templates/user/mobile/profile/style.css'

      const unlinkHandler = mockChokidar.on.mock.calls.find(
        call => call[0] === 'unlink',
      )?.[1]

      expect(unlinkHandler).toBeDefined()

      unlinkHandler(filePath)
      vi.advanceTimersByTime(300)

      expect(mockCallbacks.onTemplateChange).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'removed',
          path: filePath,
          filename: 'style.css',
          metadata: expect.objectContaining({
            category: 'user',
            device: 'mobile',
            templateName: 'profile',
            fileType: 'style',
          }),
        }),
      )
    })
  })

  describe('文件过滤', () => {
    beforeEach(async () => {
      await fileWatcher.startWatching()
    })

    it('应该过滤不支持的文件扩展名', () => {
      const txtFilePath = 'test/templates/login/desktop/default/readme.txt'

      const addHandler = mockChokidar.on.mock.calls.find(
        call => call[0] === 'add',
      )?.[1]

      addHandler(txtFilePath)
      vi.advanceTimersByTime(300)

      expect(mockCallbacks.onTemplateChange).not.toHaveBeenCalled()
    })

    it('应该过滤排除模式匹配的文件', () => {
      const nodeModulesFile = 'test/templates/node_modules/package/index.js'

      const addHandler = mockChokidar.on.mock.calls.find(
        call => call[0] === 'add',
      )?.[1]

      addHandler(nodeModulesFile)
      vi.advanceTimersByTime(300)

      expect(mockCallbacks.onTemplateChange).not.toHaveBeenCalled()
    })

    it('应该过滤超过最大深度的文件', () => {
      // 创建深度超过 maxDepth 的文件路径
      const deepPath = 'test/templates/a/b/c/d/e/f/g/file.vue' // 深度 > 5

      const addHandler = mockChokidar.on.mock.calls.find(
        call => call[0] === 'add',
      )?.[1]

      addHandler(deepPath)
      vi.advanceTimersByTime(300)

      expect(mockCallbacks.onTemplateChange).not.toHaveBeenCalled()
    })
  })

  describe('防抖处理', () => {
    beforeEach(async () => {
      await fileWatcher.startWatching()
    })

    it('应该对快速连续的文件变化进行防抖', () => {
      const filePath = 'test/templates/login/desktop/default/index.vue'

      const changeHandler = mockChokidar.on.mock.calls.find(
        call => call[0] === 'change',
      )?.[1]

      // 快速触发多次变化
      changeHandler(filePath)
      changeHandler(filePath)
      changeHandler(filePath)

      // 在防抖时间内不应该触发回调
      vi.advanceTimersByTime(200)
      expect(mockCallbacks.onTemplateChange).not.toHaveBeenCalled()

      // 防抖时间过后应该只触发一次
      vi.advanceTimersByTime(100)
      expect(mockCallbacks.onTemplateChange).toHaveBeenCalledTimes(1)
    })

    it('应该为不同文件分别处理防抖', () => {
      const file1 = 'test/templates/login/desktop/default/index.vue'
      const file2 = 'test/templates/dashboard/desktop/overview/index.vue'

      const changeHandler = mockChokidar.on.mock.calls.find(
        call => call[0] === 'change',
      )?.[1]

      changeHandler(file1)
      changeHandler(file2)

      vi.advanceTimersByTime(300)

      expect(mockCallbacks.onTemplateChange).toHaveBeenCalledTimes(2)
    })
  })

  describe('模板信息提取', () => {
    it('应该正确提取模板信息', () => {
      const testCases = [
        {
          path: 'test/templates/login/desktop/default/index.vue',
          expected: {
            category: 'login',
            device: 'desktop',
            templateName: 'default',
            fileType: 'component',
          },
        },
        {
          path: 'test/templates/dashboard/tablet/overview/config.ts',
          expected: {
            category: 'dashboard',
            device: 'tablet',
            templateName: 'overview',
            fileType: 'config',
          },
        },
        {
          path: 'test/templates/user/mobile/profile/style.less',
          expected: {
            category: 'user',
            device: 'mobile',
            templateName: 'profile',
            fileType: 'style',
          },
        },
        {
          path: 'test/templates/form/desktop/contact/preview.png',
          expected: {
            category: 'form',
            device: 'desktop',
            templateName: 'contact',
            fileType: 'preview',
          },
        },
      ]

      testCases.forEach(({ path, expected }) => {
        const metadata = fileWatcher.extractTemplateInfo(path)
        expect(metadata).toEqual(expected)
      })
    })

    it('应该处理无效路径', () => {
      const invalidPaths = [
        'invalid/path.vue',
        'test/templates/category/index.vue', // 缺少设备类型
        'test/templates/category/device/index.vue', // 缺少模板名称
      ]

      invalidPaths.forEach((path) => {
        const metadata = fileWatcher.extractTemplateInfo(path)
        expect(metadata).toBeNull()
      })
    })
  })

  describe('监听器停止和销毁', () => {
    it('应该能够停止文件监听', async () => {
      await fileWatcher.startWatching()
      expect(fileWatcher.isWatching()).toBe(true)

      await fileWatcher.stopWatching()
      expect(fileWatcher.isWatching()).toBe(false)
      expect(mockChokidar.close).toHaveBeenCalled()
    })

    it('应该能够销毁监听器', async () => {
      await fileWatcher.startWatching()

      fileWatcher.destroy()

      expect(fileWatcher.isWatching()).toBe(false)
      expect(mockChokidar.close).toHaveBeenCalled()
    })

    it('应该处理停止监听时的错误', async () => {
      await fileWatcher.startWatching()

      mockChokidar.close.mockImplementation(() => {
        throw new Error('Close failed')
      })

      await expect(fileWatcher.stopWatching()).rejects.toThrow('Close failed')
    })
  })

  describe('错误处理', () => {
    it('应该处理监听器错误', async () => {
      await fileWatcher.startWatching()

      const errorHandler = mockChokidar.on.mock.calls.find(
        call => call[0] === 'error',
      )?.[1]

      expect(errorHandler).toBeDefined()

      const error = new Error('Watch error')
      errorHandler(error)

      expect(mockCallbacks.onError).toHaveBeenCalledWith(error)
    })

    it('应该处理文件统计错误', async () => {
      mockFs.promises.stat.mockRejectedValue(new Error('Stat failed'))

      await fileWatcher.startWatching()

      const addHandler = mockChokidar.on.mock.calls.find(
        call => call[0] === 'add',
      )?.[1]

      addHandler('test/templates/login/desktop/default/index.vue')
      vi.advanceTimersByTime(300)

      // 应该仍然触发回调，但没有文件大小信息
      expect(mockCallbacks.onTemplateChange).toHaveBeenCalledWith(
        expect.objectContaining({
          size: undefined,
        }),
      )
    })
  })
})

describe('全局文件监听器', () => {
  afterEach(() => {
    resetFileWatcher()
  })

  it('应该返回单例实例', () => {
    const watcher1 = getFileWatcher({ rootDir: 'test1' })
    const watcher2 = getFileWatcher({ rootDir: 'test2' })

    expect(watcher1).toBe(watcher2)
  })

  it('应该能够重置全局实例', () => {
    const watcher1 = getFileWatcher({ rootDir: 'test1' })
    resetFileWatcher()
    const watcher2 = getFileWatcher({ rootDir: 'test2' })

    expect(watcher1).not.toBe(watcher2)
  })

  it('应该使用工厂函数创建实例', () => {
    const watcher = createFileWatcher({ rootDir: 'factory/test' })

    expect(watcher).toBeDefined()
    expect(watcher.getOptions().rootDir).toBe('factory/test')
  })
})
