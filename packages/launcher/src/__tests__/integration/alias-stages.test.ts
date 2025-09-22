/**
 * 别名阶段配置集成测试
 * 
 * 测试别名阶段配置在实际使用中的表现
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ViteLauncher } from '../../core/ViteLauncher'
import { createAlias, createDevAlias, createBuildAlias, createUniversalAlias } from '../../utils/aliases'

describe('别名阶段配置集成测试', () => {
  let launcher: ViteLauncher
  const testCwd = process.cwd()

  beforeEach(() => {
    launcher = new ViteLauncher({
      cwd: testCwd,
      config: {}
    })
  })

  describe('applyAliasConfig 方法', () => {
    it('应该在 dev 阶段正确过滤别名', () => {
      const config = {
        resolve: {
          alias: [
            createDevAlias('@dev-only', './src/dev'),
            createBuildAlias('@build-only', './src/build'),
            createUniversalAlias('@universal', './src/universal')
          ]
        }
      }

      // 使用反射访问私有方法进行测试
      const applyAliasConfig = (launcher as any).applyAliasConfig.bind(launcher)
      const result = applyAliasConfig(config, 'dev')

      const aliases = result.resolve.alias
      const aliasFinds = aliases.map((alias: any) => alias.find)

      // dev 阶段应该包含：内置别名(@, ~) + @dev-only + @universal
      expect(aliasFinds).toContain('@') // 内置别名
      expect(aliasFinds).toContain('~') // 内置别名
      expect(aliasFinds).toContain('@dev-only')
      expect(aliasFinds).toContain('@universal')
      expect(aliasFinds).not.toContain('@build-only')
    })

    it('应该在 build 阶段正确过滤别名', () => {
      const config = {
        resolve: {
          alias: [
            createDevAlias('@dev-only', './src/dev'),
            createBuildAlias('@build-only', './src/build'),
            createUniversalAlias('@universal', './src/universal')
          ]
        }
      }

      const applyAliasConfig = (launcher as any).applyAliasConfig.bind(launcher)
      const result = applyAliasConfig(config, 'build')

      const aliases = result.resolve.alias
      const aliasFinds = aliases.map((alias: any) => alias.find)

      // build 阶段应该包含：内置别名(@, ~) + @build-only + @universal
      expect(aliasFinds).toContain('@') // 内置别名
      expect(aliasFinds).toContain('~') // 内置别名
      expect(aliasFinds).toContain('@build-only')
      expect(aliasFinds).toContain('@universal')
      expect(aliasFinds).not.toContain('@dev-only')
    })

    it('应该在 preview 阶段正确过滤别名', () => {
      const config = {
        resolve: {
          alias: [
            createDevAlias('@dev-only', './src/dev'),
            createBuildAlias('@build-only', './src/build'),
            createUniversalAlias('@universal', './src/universal'),
            createAlias('@preview-custom', './src/preview', ['preview'])
          ]
        }
      }

      const applyAliasConfig = (launcher as any).applyAliasConfig.bind(launcher)
      const result = applyAliasConfig(config, 'preview')

      const aliases = result.resolve.alias
      const aliasFinds = aliases.map((alias: any) => alias.find)

      // preview 阶段应该包含：内置别名(@, ~) + @universal + @preview-custom
      expect(aliasFinds).toContain('@') // 内置别名
      expect(aliasFinds).toContain('~') // 内置别名
      expect(aliasFinds).toContain('@universal')
      expect(aliasFinds).toContain('@preview-custom')
      expect(aliasFinds).not.toContain('@dev-only')
      expect(aliasFinds).not.toContain('@build-only')
    })

    it('应该处理没有 stages 字段的别名（默认为 dev）', () => {
      // 创建一个新的 launcher 实例，确保没有干扰
      const testLauncher = new ViteLauncher({
        cwd: testCwd,
        config: {}
      })

      const config = {
        resolve: {
          alias: [
            { find: '@default', replacement: './src/default' }, // 没有 stages 字段
            createBuildAlias('@build-only', './src/build')
          ]
        }
      }

      const applyAliasConfig = (testLauncher as any).applyAliasConfig.bind(testLauncher)

      // dev 阶段应该包含默认别名
      const devResult = applyAliasConfig(JSON.parse(JSON.stringify(config)), 'dev')
      const devAliases = devResult.resolve.alias.map((alias: any) => alias.find)
      expect(devAliases).toContain('@default')

      // build 阶段不应该包含默认别名，但应该包含 @build-only
      const buildResult = applyAliasConfig(JSON.parse(JSON.stringify(config)), 'build')
      const buildAliases = buildResult.resolve.alias.map((alias: any) => alias.find)

      expect(buildAliases).not.toContain('@default')
      expect(buildAliases).toContain('@build-only')
    })

    it('应该处理对象格式的别名配置', () => {
      const config = {
        resolve: {
          alias: {
            '@object': './src/object'
          }
        }
      }

      const applyAliasConfig = (launcher as any).applyAliasConfig.bind(launcher)
      const result = applyAliasConfig(config, 'dev')

      const aliases = result.resolve.alias
      const aliasFinds = aliases.map((alias: any) => alias.find)

      // 对象格式的别名应该被转换并在 dev 阶段生效
      expect(aliasFinds).toContain('@object')
    })
  })

  describe('内置别名', () => {
    it('应该自动添加内置别名', () => {
      const config = { resolve: { alias: [] } }

      const applyAliasConfig = (launcher as any).applyAliasConfig.bind(launcher)
      const result = applyAliasConfig(config, 'dev')

      const aliases = result.resolve.alias
      const aliasFinds = aliases.map((alias: any) => alias.find)

      expect(aliasFinds).toContain('@')
      expect(aliasFinds).toContain('~')
    })

    it('应该在所有阶段都包含内置别名', () => {
      const config = { resolve: { alias: [] } }
      const applyAliasConfig = (launcher as any).applyAliasConfig.bind(launcher)

      const stages = ['dev', 'build', 'preview'] as const

      stages.forEach(stage => {
        const result = applyAliasConfig(config, stage)
        const aliases = result.resolve.alias
        const aliasFinds = aliases.map((alias: any) => alias.find)

        expect(aliasFinds).toContain('@')
        expect(aliasFinds).toContain('~')
      })
    })
  })
})
