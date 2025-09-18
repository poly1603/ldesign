/**
 * aliases 类型定义测试用例
 *
 * 测试别名相关的类型定义
 * 注意：基本别名（@ -> src）现在由 launcher 自动配置
 *
 * @author LDesign Team
 * @since 1.0.0
 */

import { describe, it, expect } from 'vitest'
import type { AliasEntry } from '../../utils/aliases'

describe('aliases 类型定义', () => {
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

    it('应该支持复杂的别名配置', () => {
      const aliases: AliasEntry[] = [
        { find: '@', replacement: './src' },
        { find: '@components', replacement: './src/components' },
        { find: /^@utils/, replacement: './src/utils' },
        { find: /^@ldesign\/(.*)/, replacement: '../packages/$1/src' }
      ]

      expect(aliases).toHaveLength(4)
      expect(aliases[0].find).toBe('@')
      expect(aliases[1].find).toBe('@components')
      expect(aliases[2].find).toBeInstanceOf(RegExp)
      expect(aliases[3].find).toBeInstanceOf(RegExp)
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
  })
})
