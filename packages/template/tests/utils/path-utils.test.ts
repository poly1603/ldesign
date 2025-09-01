/**
 * 路径工具函数测试
 */

import { describe, expect, it } from 'vitest'
import { pathUtils } from '../../src/utils/path'

describe('pathUtils', () => {
  describe('normalize', () => {
    it('应该规范化路径', () => {
      expect(pathUtils.normalize('/path//to///file')).toBe('/path/to/file')
      expect(pathUtils.normalize('path\\to\\file')).toBe('path/to/file')
      expect(pathUtils.normalize('./path/to/file')).toBe('path/to/file')
      expect(pathUtils.normalize('../path/to/file')).toBe('../path/to/file')
    })

    it('应该处理空路径', () => {
      expect(pathUtils.normalize('')).toBe('.')
      expect(pathUtils.normalize('.')).toBe('.')
      expect(pathUtils.normalize('./')).toBe('.')
    })

    it('应该保留绝对路径', () => {
      expect(pathUtils.normalize('/absolute/path')).toBe('/absolute/path')
      expect(pathUtils.normalize('C:\\Windows\\System32')).toBe('C:/Windows/System32')
    })
  })

  describe('parseTemplatePath', () => {
    it('应该解析标准模板路径', () => {
      const result = pathUtils.parseTemplatePath('templates/login/desktop/default/index.vue')

      expect(result).toEqual({
        category: 'login',
        device: 'desktop',
        templateName: 'default',
        fileName: 'index.vue',
      })
    })

    it('应该解析嵌套模板路径', () => {
      const result = pathUtils.parseTemplatePath('src/templates/auth/login/mobile/modern/component.tsx')

      expect(result).toEqual({
        category: 'auth/login',
        device: 'mobile',
        templateName: 'modern',
        fileName: 'component.tsx',
      })
    })

    it('应该处理无效路径', () => {
      expect(() => pathUtils.parseTemplatePath('invalid/path')).toThrow()
      expect(() => pathUtils.parseTemplatePath('')).toThrow()
      expect(() => pathUtils.parseTemplatePath('templates/only/two/parts')).toThrow()
    })

    it('应该处理不同的文件扩展名', () => {
      const vueResult = pathUtils.parseTemplatePath('templates/login/desktop/default/index.vue')
      const tsxResult = pathUtils.parseTemplatePath('templates/login/desktop/default/index.tsx')
      const jsResult = pathUtils.parseTemplatePath('templates/login/desktop/default/index.js')

      expect(vueResult.fileName).toBe('index.vue')
      expect(tsxResult.fileName).toBe('index.tsx')
      expect(jsResult.fileName).toBe('index.js')
    })
  })

  describe('buildTemplatePath', () => {
    it('应该构建标准模板路径', () => {
      const path = pathUtils.buildTemplatePath('login', 'desktop', 'default', 'index.vue')
      expect(path).toBe('login/desktop/default/index.vue')
    })

    it('应该处理嵌套分类', () => {
      const path = pathUtils.buildTemplatePath('auth/login', 'mobile', 'modern', 'component.tsx')
      expect(path).toBe('auth/login/mobile/modern/component.tsx')
    })

    it('应该处理可选的文件名', () => {
      const pathWithoutFile = pathUtils.buildTemplatePath('login', 'desktop', 'default')
      expect(pathWithoutFile).toBe('login/desktop/default')

      const pathWithFile = pathUtils.buildTemplatePath('login', 'desktop', 'default', 'index.vue')
      expect(pathWithFile).toBe('login/desktop/default/index.vue')
    })

    it('应该验证参数', () => {
      expect(() => pathUtils.buildTemplatePath('', 'desktop', 'default')).toThrow()
      expect(() => pathUtils.buildTemplatePath('login', '', 'default')).toThrow()
      expect(() => pathUtils.buildTemplatePath('login', 'desktop', '')).toThrow()
    })
  })

  describe('isInsideDirectory', () => {
    it('应该检测文件是否在目录内', () => {
      expect(pathUtils.isInsideDirectory('/path/to/file.txt', '/path/to')).toBe(true)
      expect(pathUtils.isInsideDirectory('/path/to/sub/file.txt', '/path/to')).toBe(true)
      expect(pathUtils.isInsideDirectory('/path/to/file.txt', '/path/to/file.txt')).toBe(false)
    })

    it('应该处理相对路径', () => {
      expect(pathUtils.isInsideDirectory('path/to/file.txt', 'path')).toBe(true)
      expect(pathUtils.isInsideDirectory('./path/to/file.txt', './path')).toBe(true)
      expect(pathUtils.isInsideDirectory('../path/to/file.txt', '../path')).toBe(true)
    })

    it('应该处理不在目录内的情况', () => {
      expect(pathUtils.isInsideDirectory('/other/path/file.txt', '/path/to')).toBe(false)
      expect(pathUtils.isInsideDirectory('/path/file.txt', '/path/to')).toBe(false)
      expect(pathUtils.isInsideDirectory('/path', '/path/to')).toBe(false)
    })

    it('应该处理边界情况', () => {
      expect(pathUtils.isInsideDirectory('', '/path')).toBe(false)
      expect(pathUtils.isInsideDirectory('/path/file.txt', '')).toBe(false)
      expect(pathUtils.isInsideDirectory('', '')).toBe(false)
    })
  })

  describe('getRelativePath', () => {
    it('应该计算相对路径', () => {
      expect(pathUtils.getRelativePath('/base/path', '/base/path/to/file.txt')).toBe('to/file.txt')
      expect(pathUtils.getRelativePath('/base', '/base/path/to/file.txt')).toBe('path/to/file.txt')
    })

    it('应该处理相同路径', () => {
      expect(pathUtils.getRelativePath('/same/path', '/same/path')).toBe('.')
    })

    it('应该处理不相关的路径', () => {
      const result = pathUtils.getRelativePath('/base/path', '/other/path/file.txt')
      expect(result).toContain('../')
    })
  })

  describe('joinPaths', () => {
    it('应该连接多个路径段', () => {
      expect(pathUtils.joinPaths('base', 'path', 'to', 'file.txt')).toBe('base/path/to/file.txt')
      expect(pathUtils.joinPaths('/base', 'path', 'to', 'file.txt')).toBe('/base/path/to/file.txt')
    })

    it('应该处理空段', () => {
      expect(pathUtils.joinPaths('base', '', 'path', 'file.txt')).toBe('base/path/file.txt')
      expect(pathUtils.joinPaths('', 'path', 'file.txt')).toBe('path/file.txt')
    })

    it('应该处理单个段', () => {
      expect(pathUtils.joinPaths('single')).toBe('single')
      expect(pathUtils.joinPaths('')).toBe('')
    })

    it('应该处理绝对路径', () => {
      expect(pathUtils.joinPaths('/absolute', 'path')).toBe('/absolute/path')
      expect(pathUtils.joinPaths('relative', '/absolute')).toBe('/absolute')
    })
  })

  describe('getFileExtension', () => {
    it('应该获取文件扩展名', () => {
      expect(pathUtils.getFileExtension('file.txt')).toBe('.txt')
      expect(pathUtils.getFileExtension('component.vue')).toBe('.vue')
      expect(pathUtils.getFileExtension('script.min.js')).toBe('.js')
    })

    it('应该处理无扩展名的文件', () => {
      expect(pathUtils.getFileExtension('filename')).toBe('')
      expect(pathUtils.getFileExtension('path/to/filename')).toBe('')
    })

    it('应该处理隐藏文件', () => {
      expect(pathUtils.getFileExtension('.gitignore')).toBe('')
      expect(pathUtils.getFileExtension('.env.local')).toBe('.local')
    })

    it('应该处理路径', () => {
      expect(pathUtils.getFileExtension('/path/to/file.txt')).toBe('.txt')
      expect(pathUtils.getFileExtension('relative/path/file.vue')).toBe('.vue')
    })
  })

  describe('getFileName', () => {
    it('应该获取文件名', () => {
      expect(pathUtils.getFileName('/path/to/file.txt')).toBe('file.txt')
      expect(pathUtils.getFileName('relative/path/component.vue')).toBe('component.vue')
      expect(pathUtils.getFileName('filename.js')).toBe('filename.js')
    })

    it('应该处理目录路径', () => {
      expect(pathUtils.getFileName('/path/to/directory/')).toBe('')
      expect(pathUtils.getFileName('/path/to/directory')).toBe('directory')
    })

    it('应该处理根路径', () => {
      expect(pathUtils.getFileName('/')).toBe('')
      expect(pathUtils.getFileName('')).toBe('')
    })
  })

  describe('getDirectoryName', () => {
    it('应该获取目录名', () => {
      expect(pathUtils.getDirectoryName('/path/to/file.txt')).toBe('/path/to')
      expect(pathUtils.getDirectoryName('relative/path/file.txt')).toBe('relative/path')
    })

    it('应该处理根目录', () => {
      expect(pathUtils.getDirectoryName('/file.txt')).toBe('/')
      expect(pathUtils.getDirectoryName('file.txt')).toBe('.')
    })

    it('应该处理目录路径', () => {
      expect(pathUtils.getDirectoryName('/path/to/directory/')).toBe('/path/to')
      expect(pathUtils.getDirectoryName('/path/to/directory')).toBe('/path/to')
    })
  })

  describe('isAbsolutePath', () => {
    it('应该识别绝对路径', () => {
      expect(pathUtils.isAbsolutePath('/absolute/path')).toBe(true)
      expect(pathUtils.isAbsolutePath('C:\\Windows\\System32')).toBe(true)
      expect(pathUtils.isAbsolutePath('\\\\server\\share')).toBe(true)
    })

    it('应该识别相对路径', () => {
      expect(pathUtils.isAbsolutePath('relative/path')).toBe(false)
      expect(pathUtils.isAbsolutePath('./relative/path')).toBe(false)
      expect(pathUtils.isAbsolutePath('../relative/path')).toBe(false)
    })

    it('应该处理边界情况', () => {
      expect(pathUtils.isAbsolutePath('')).toBe(false)
      expect(pathUtils.isAbsolutePath('.')).toBe(false)
      expect(pathUtils.isAbsolutePath('..')).toBe(false)
    })
  })

  describe('resolvePath', () => {
    it('应该解析相对路径', () => {
      const basePath = '/base/path'
      expect(pathUtils.resolvePath(basePath, 'relative/file.txt')).toBe('/base/path/relative/file.txt')
      expect(pathUtils.resolvePath(basePath, './relative/file.txt')).toBe('/base/path/relative/file.txt')
    })

    it('应该处理绝对路径', () => {
      const basePath = '/base/path'
      expect(pathUtils.resolvePath(basePath, '/absolute/file.txt')).toBe('/absolute/file.txt')
    })

    it('应该处理上级目录', () => {
      const basePath = '/base/path/sub'
      expect(pathUtils.resolvePath(basePath, '../file.txt')).toBe('/base/path/file.txt')
      expect(pathUtils.resolvePath(basePath, '../../file.txt')).toBe('/base/file.txt')
    })
  })
})
