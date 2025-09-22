/**
 * aliases 工具函数测试用例
 *
 * 测试别名相关的类型定义和工具函数
 * 支持按阶段配置别名，基本别名（@ -> src, ~ -> 项目根目录）由 launcher 自动配置
 *
 * @author LDesign Team
 * @since 1.0.0
 */

import { describe, it, expect } from 'vitest'
import {
  type AliasEntry,
  type BuildStage,
  createAlias,
  createBasicAliases,
  createDevAlias,
  createBuildAlias,
  createUniversalAlias
} from '../../utils/aliases'

describe('aliases 工具函数', () => {
  describe('AliasEntry 接口', () => {
    it('应该支持字符串 find 属性', () => {
      const alias: AliasEntry = {
        find: '@',
        replacement: './src'
      }

      expect(alias.find).toBe('@')
      expect(alias.replacement).toBe('./src')
    })

    it('应该支持正则表达式 find 属性', () => {
      const alias: AliasEntry = {
        find: /^@components/,
        replacement: './src/components'
      }

      expect(alias.find).toBeInstanceOf(RegExp)
      expect(alias.replacement).toBe('./src/components')
    })

    it('应该支持阶段配置', () => {
      const alias: AliasEntry = {
        find: '@',
        replacement: './src',
        stages: ['dev', 'build']
      }

      expect(alias.stages).toEqual(['dev', 'build'])
    })

    it('应该支持复杂的别名配置', () => {
      const aliases: AliasEntry[] = [
        { find: '@', replacement: './src', stages: ['dev'] },
        { find: '@components', replacement: './src/components', stages: ['dev', 'build'] },
        { find: /^@utils/, replacement: './src/utils', stages: ['build'] },
        { find: /^@ldesign\/(.*)/, replacement: '../packages/$1/src', stages: ['dev', 'build', 'preview'] }
      ]

      expect(aliases).toHaveLength(4)
      expect(aliases[0].find).toBe('@')
      expect(aliases[1].find).toBe('@components')
      expect(aliases[2].find).toBeInstanceOf(RegExp)
      expect(aliases[3].find).toBeInstanceOf(RegExp)
      expect(aliases[0].stages).toEqual(['dev'])
      expect(aliases[3].stages).toEqual(['dev', 'build', 'preview'])
    })
  })

  describe('createAlias 函数', () => {
    it('应该创建基本别名', () => {
      const alias = createAlias('@', './src')

      expect(alias).toEqual({
        find: '@',
        replacement: './src',
        stages: ['dev']
      })
    })

    it('应该支持自定义阶段', () => {
      const alias = createAlias('@', './src', ['dev', 'build'])

      expect(alias.stages).toEqual(['dev', 'build'])
    })

    it('应该支持正则表达式', () => {
      const alias = createAlias(/^@\//, './src/', ['dev'])

      expect(alias.find).toEqual(/^@\//)
      expect(alias.replacement).toBe('./src/')
    })
  })

  describe('createBasicAliases 函数', () => {
    it('应该创建基本项目别名', () => {
      const aliases = createBasicAliases()

      expect(aliases).toHaveLength(2)
      expect(aliases[0]).toEqual({
        find: '@',
        replacement: './src',
        stages: ['dev']
      })
      expect(aliases[1]).toEqual({
        find: '~',
        replacement: './',
        stages: ['dev']
      })
    })

    it('应该支持自定义 src 目录', () => {
      const aliases = createBasicAliases('./source')

      expect(aliases[0].replacement).toBe('./source')
    })

    it('应该支持自定义阶段', () => {
      const aliases = createBasicAliases('./src', ['dev', 'build'])

      aliases.forEach(alias => {
        expect(alias.stages).toEqual(['dev', 'build'])
      })
    })
  })

  describe('createDevAlias 函数', () => {
    it('应该创建开发时别名', () => {
      const alias = createDevAlias('@dev', './dev')

      expect(alias).toEqual({
        find: '@dev',
        replacement: './dev',
        stages: ['dev']
      })
    })
  })

  describe('createBuildAlias 函数', () => {
    it('应该创建构建时别名', () => {
      const alias = createBuildAlias('@build', './build')

      expect(alias).toEqual({
        find: '@build',
        replacement: './build',
        stages: ['build']
      })
    })
  })

  describe('createUniversalAlias 函数', () => {
    it('应该创建全阶段别名', () => {
      const alias = createUniversalAlias('@all', './all')

      expect(alias).toEqual({
        find: '@all',
        replacement: './all',
        stages: ['dev', 'build', 'preview']
      })
    })
  })

  describe('BuildStage 类型', () => {
    it('应该支持所有构建阶段', () => {
      const stages: BuildStage[] = ['dev', 'build', 'preview']

      expect(stages).toContain('dev')
      expect(stages).toContain('build')
      expect(stages).toContain('preview')
    })
  })

  describe('类型兼容性', () => {
    it('应该与 Vite 的 alias 配置兼容', () => {
      // 模拟 Vite 的 alias 配置
      const viteAliasConfig: AliasEntry[] = [
        { find: '@', replacement: './src' },
        { find: '@components', replacement: './src/components' }
      ]

      // 应该能够正常使用
      expect(viteAliasConfig).toHaveLength(2)
      expect(viteAliasConfig[0].find).toBe('@')
      expect(viteAliasConfig[1].find).toBe('@components')
    })

    it('应该支持扩展的阶段配置', () => {
      const extendedAliasConfig: AliasEntry[] = [
        { find: '@', replacement: './src', stages: ['dev'] },
        { find: '@components', replacement: './src/components', stages: ['dev', 'build'] }
      ]

      expect(extendedAliasConfig[0].stages).toEqual(['dev'])
      expect(extendedAliasConfig[1].stages).toEqual(['dev', 'build'])
    })
  })
})
