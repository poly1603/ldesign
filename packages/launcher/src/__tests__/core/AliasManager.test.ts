/**
 * AliasManager 测试用例
 * 
 * 测试简化后的别名管理器功能
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import path from 'path'
import { AliasManager, createAliasManager } from '../../core/AliasManager'

describe('AliasManager', () => {
  let aliasManager: AliasManager
  const testCwd = '/test/project'

  beforeEach(() => {
    aliasManager = new AliasManager(testCwd)
  })

  afterEach(() => {
    // 清理
  })

  describe('构造函数', () => {
    it('应该使用默认工作目录', () => {
      const manager = new AliasManager()
      expect(manager.getCwd()).toBe(process.cwd())
    })

    it('应该使用指定的工作目录', () => {
      const manager = new AliasManager(testCwd)
      expect(manager.getCwd()).toBe(testCwd)
    })
  })

  describe('generateBuiltinAliases', () => {
    it('应该生成基本的 @ -> src 别名', () => {
      const aliases = aliasManager.generateBuiltinAliases()
      
      expect(aliases).toHaveLength(1)
      expect(aliases[0]).toEqual({
        find: '@',
        replacement: path.resolve(testCwd, 'src')
      })
    })

    it('应该使用绝对路径', () => {
      const aliases = aliasManager.generateBuiltinAliases()
      const srcPath = aliases[0].replacement
      
      expect(path.isAbsolute(srcPath)).toBe(true)
      expect(srcPath).toBe(path.resolve(testCwd, 'src'))
    })
  })

  describe('getCwd 和 setCwd', () => {
    it('应该获取当前工作目录', () => {
      expect(aliasManager.getCwd()).toBe(testCwd)
    })

    it('应该设置新的工作目录', () => {
      const newCwd = '/new/project'
      aliasManager.setCwd(newCwd)
      expect(aliasManager.getCwd()).toBe(newCwd)
    })

    it('设置新工作目录后应该影响别名生成', () => {
      const newCwd = '/new/project'
      aliasManager.setCwd(newCwd)
      
      const aliases = aliasManager.generateBuiltinAliases()
      expect(aliases[0].replacement).toBe(path.resolve(newCwd, 'src'))
    })
  })

  describe('createAliasManager 工厂函数', () => {
    it('应该创建 AliasManager 实例', () => {
      const manager = createAliasManager()
      expect(manager).toBeInstanceOf(AliasManager)
    })

    it('应该使用指定的工作目录', () => {
      const manager = createAliasManager(testCwd)
      expect(manager.getCwd()).toBe(testCwd)
    })

    it('应该使用默认工作目录', () => {
      const manager = createAliasManager()
      expect(manager.getCwd()).toBe(process.cwd())
    })
  })

  describe('边界情况', () => {
    it('应该处理空字符串工作目录', () => {
      const manager = new AliasManager('')
      const aliases = manager.generateBuiltinAliases()
      
      expect(aliases).toHaveLength(1)
      expect(aliases[0].find).toBe('@')
      expect(typeof aliases[0].replacement).toBe('string')
    })

    it('应该处理相对路径工作目录', () => {
      const manager = new AliasManager('./test')
      const aliases = manager.generateBuiltinAliases()
      
      expect(aliases).toHaveLength(1)
      expect(path.isAbsolute(aliases[0].replacement)).toBe(true)
    })
  })
})
