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
import { AliasManager, createAliasManager, type BuildStage, type AliasEntry } from '../../core/AliasManager'

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
    it('应该生成基本的 @ -> src 和 ~ -> 项目根目录别名', () => {
      const aliases = aliasManager.generateBuiltinAliases()

      expect(aliases).toHaveLength(2)
      expect(aliases[0]).toEqual({
        find: '@',
        replacement: path.resolve(testCwd, 'src'),
        stages: ['dev']
      })
      expect(aliases[1]).toEqual({
        find: '~',
        replacement: path.resolve(testCwd),
        stages: ['dev']
      })
    })

    it('应该支持自定义生效阶段', () => {
      const stages: BuildStage[] = ['dev', 'build']
      const aliases = aliasManager.generateBuiltinAliases(stages)

      expect(aliases).toHaveLength(2)
      expect(aliases[0].stages).toEqual(stages)
      expect(aliases[1].stages).toEqual(stages)
    })

    it('应该使用绝对路径', () => {
      const aliases = aliasManager.generateBuiltinAliases()

      expect(path.isAbsolute(aliases[0].replacement)).toBe(true)
      expect(path.isAbsolute(aliases[1].replacement)).toBe(true)
      expect(aliases[0].replacement).toBe(path.resolve(testCwd, 'src'))
      expect(aliases[1].replacement).toBe(path.resolve(testCwd))
    })

    it('应该支持所有阶段', () => {
      const stages: BuildStage[] = ['dev', 'build', 'preview']
      const aliases = aliasManager.generateBuiltinAliases(stages)

      aliases.forEach(alias => {
        expect(alias.stages).toEqual(stages)
      })
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
      expect(aliases[1].replacement).toBe(path.resolve(newCwd))
    })
  })

  describe('filterAliasesByStage', () => {
    it('应该根据阶段过滤别名', () => {
      const aliases: AliasEntry[] = [
        { find: '@dev', replacement: './dev', stages: ['dev'] },
        { find: '@build', replacement: './build', stages: ['build'] },
        { find: '@all', replacement: './all', stages: ['dev', 'build', 'preview'] },
        { find: '@default', replacement: './default' } // 没有 stages，默认只在 dev 生效
      ]

      const devAliases = aliasManager.filterAliasesByStage(aliases, 'dev')
      expect(devAliases).toHaveLength(3)
      expect(devAliases.map(a => a.find)).toEqual(['@dev', '@all', '@default'])

      const buildAliases = aliasManager.filterAliasesByStage(aliases, 'build')
      expect(buildAliases).toHaveLength(2)
      expect(buildAliases.map(a => a.find)).toEqual(['@build', '@all'])

      const previewAliases = aliasManager.filterAliasesByStage(aliases, 'preview')
      expect(previewAliases).toHaveLength(1)
      expect(previewAliases.map(a => a.find)).toEqual(['@all'])
    })

    it('应该返回标准的 Vite AliasEntry 格式', () => {
      const aliases: AliasEntry[] = [
        { find: '@test', replacement: './test', stages: ['dev'] }
      ]

      const filtered = aliasManager.filterAliasesByStage(aliases, 'dev')
      expect(filtered[0]).toEqual({
        find: '@test',
        replacement: './test'
      })
      expect(filtered[0]).not.toHaveProperty('stages')
    })

    it('应该处理空数组', () => {
      const filtered = aliasManager.filterAliasesByStage([], 'dev')
      expect(filtered).toEqual([])
    })

    it('应该处理没有匹配阶段的情况', () => {
      const aliases: AliasEntry[] = [
        { find: '@build', replacement: './build', stages: ['build'] }
      ]

      const filtered = aliasManager.filterAliasesByStage(aliases, 'dev')
      expect(filtered).toEqual([])
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

      expect(aliases).toHaveLength(2)
      expect(aliases[0].find).toBe('@')
      expect(aliases[1].find).toBe('~')
      expect(typeof aliases[0].replacement).toBe('string')
      expect(typeof aliases[1].replacement).toBe('string')
    })

    it('应该处理相对路径工作目录', () => {
      const manager = new AliasManager('./test')
      const aliases = manager.generateBuiltinAliases()

      expect(aliases).toHaveLength(2)
      expect(path.isAbsolute(aliases[0].replacement)).toBe(true)
      expect(path.isAbsolute(aliases[1].replacement)).toBe(true)
    })

    it('应该处理正则表达式别名', () => {
      const aliases: AliasEntry[] = [
        { find: /^@\//, replacement: './src/', stages: ['dev'] },
        { find: /^~\//, replacement: './', stages: ['build'] }
      ]

      const devAliases = aliasManager.filterAliasesByStage(aliases, 'dev')
      expect(devAliases).toHaveLength(1)
      expect(devAliases[0].find).toEqual(/^@\//)

      const buildAliases = aliasManager.filterAliasesByStage(aliases, 'build')
      expect(buildAliases).toHaveLength(1)
      expect(buildAliases[0].find).toEqual(/^~\//)
    })
  })
})
