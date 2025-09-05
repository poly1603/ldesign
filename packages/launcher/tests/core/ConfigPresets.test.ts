/**
 * ConfigPresets 单元测试
 * 
 * 测试配置预设系统的各项功能
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  ConfigPresetsManager, 
  configPresets,
  Vue3Preset,
  ReactPreset,
  BasePreset
} from '../../src/core/ConfigPresets'
import type { ProjectPreset, ViteLauncherConfig } from '../../src/types'

describe('ConfigPresets', () => {
  let presetsManager: ConfigPresetsManager

  beforeEach(() => {
    presetsManager = new ConfigPresetsManager()
  })

  describe('ConfigPresetsManager', () => {
    it('应该注册内置预设', () => {
      const allPresets = presetsManager.getAll()
      expect(allPresets.length).toBeGreaterThan(0)
      
      // 检查基本预设
      expect(presetsManager.has('vue3')).toBe(true)
      expect(presetsManager.has('vue3-ts')).toBe(true)
      expect(presetsManager.has('react')).toBe(true)
      expect(presetsManager.has('react-ts')).toBe(true)
      expect(presetsManager.has('svelte')).toBe(true)
      expect(presetsManager.has('vanilla')).toBe(true)
    })

    it('应该能获取预设配置', () => {
      const vue3Config = presetsManager.getConfig('vue3')
      expect(vue3Config).toBeDefined()
      expect(vue3Config?.launcher?.preset).toBe('vue3')
    })

    it('应该能获取预设依赖', () => {
      const vue3Deps = presetsManager.getDependencies('vue3')
      expect(vue3Deps).toBeDefined()
      expect(vue3Deps?.dependencies).toContain('vue')
      expect(vue3Deps?.devDependencies).toContain('@vitejs/plugin-vue')
    })

    it('应该能获取预设脚本', () => {
      const scripts = presetsManager.getScripts('vue3')
      expect(scripts).toBeDefined()
      expect(scripts?.dev).toBe('launcher dev')
      expect(scripts?.build).toBe('launcher build')
    })

    it('应该能注册自定义预设', () => {
      class CustomPreset extends BasePreset {
        readonly name: ProjectPreset = 'custom' as ProjectPreset
        readonly description = 'Custom preset for testing'
        readonly plugins = ['custom-plugin']
        
        getConfig() {
          return { launcher: { preset: 'custom' as ProjectPreset } }
        }
        
        getDependencies() {
          return { dependencies: [], devDependencies: [] }
        }
      }

      const customPreset = new CustomPreset()
      presetsManager.register(customPreset)

      expect(presetsManager.has('custom' as ProjectPreset)).toBe(true)
      expect(presetsManager.get('custom' as ProjectPreset)).toBe(customPreset)
    })

    it('应该能应用预设配置', () => {
      const baseConfig: ViteLauncherConfig = {
        server: { port: 4000 }
      }

      const result = presetsManager.applyPreset(baseConfig, 'vue3')
      
      expect(result.launcher?.preset).toBe('vue3')
      expect(result.server?.port).toBe(4000) // 用户配置应该覆盖预设
    })

    it('应该抛出未知预设错误', () => {
      expect(() => {
        presetsManager.applyPreset({}, 'unknown' as ProjectPreset)
      }).toThrow('未知预设: unknown')
    })
  })

  describe('Vue3Preset', () => {
    let vue3Preset: Vue3Preset

    beforeEach(() => {
      vue3Preset = new Vue3Preset()
    })

    it('应该有正确的基本信息', () => {
      expect(vue3Preset.name).toBe('vue3')
      expect(vue3Preset.description).toContain('Vue 3')
      expect(vue3Preset.plugins).toContain('@vitejs/plugin-vue')
    })

    it('应该生成正确的配置', () => {
      const config = vue3Preset.getConfig()
      
      expect(config.launcher?.preset).toBe('vue3')
      expect(config.plugins).toBeDefined()
      expect(config.server?.port).toBe(3000)
      expect(config.build?.rollupOptions?.output?.manualChunks).toBeDefined()
    })

    it('应该提供正确的依赖', () => {
      const deps = vue3Preset.getDependencies()
      
      expect(deps.dependencies).toContain('vue')
      expect(deps.dependencies).toContain('vue-router')
      expect(deps.devDependencies).toContain('@vitejs/plugin-vue')
      expect(deps.devDependencies).toContain('@vue/tsconfig')
    })

    it('应该提供基本脚本', () => {
      const scripts = vue3Preset.getScripts()
      
      expect(scripts.dev).toBe('launcher dev')
      expect(scripts.build).toBe('launcher build')
      expect(scripts.preview).toBe('launcher preview')
    })
  })

  describe('ReactPreset', () => {
    let reactPreset: ReactPreset

    beforeEach(() => {
      reactPreset = new ReactPreset()
    })

    it('应该有正确的基本信息', () => {
      expect(reactPreset.name).toBe('react')
      expect(reactPreset.description).toContain('React')
      expect(reactPreset.plugins).toContain('@vitejs/plugin-react')
    })

    it('应该生成正确的配置', () => {
      const config = reactPreset.getConfig()
      
      expect(config.launcher?.preset).toBe('react')
      expect(config.launcher?.env?.prefix).toBe('REACT_APP_')
      expect(config.plugins).toBeDefined()
      expect(config.server?.port).toBe(3000)
    })

    it('应该提供正确的依赖', () => {
      const deps = reactPreset.getDependencies()
      
      expect(deps.dependencies).toContain('react')
      expect(deps.dependencies).toContain('react-dom')
      expect(deps.devDependencies).toContain('@vitejs/plugin-react')
    })
  })

  describe('项目类型自动检测', () => {
    it('应该能检测 Vue 3 项目', async () => {
      // Mock fs.readFile
      vi.doMock('fs/promises', () => ({
        readFile: vi.fn().mockResolvedValue(JSON.stringify({
          dependencies: { vue: '^3.0.0' }
        }))
      }))

      const projectType = await presetsManager.detectProjectType()
      expect(projectType).toBe('vue3')
    })

    it('应该能检测 Vue 3 + TypeScript 项目', async () => {
      vi.doMock('fs/promises', () => ({
        readFile: vi.fn().mockResolvedValue(JSON.stringify({
          dependencies: { vue: '^3.0.0' },
          devDependencies: { typescript: '^4.0.0' }
        }))
      }))

      const projectType = await presetsManager.detectProjectType()
      expect(projectType).toBe('vue3-ts')
    })

    it('应该能检测 React 项目', async () => {
      vi.doMock('fs/promises', () => ({
        readFile: vi.fn().mockResolvedValue(JSON.stringify({
          dependencies: { react: '^18.0.0' }
        }))
      }))

      const projectType = await presetsManager.detectProjectType()
      expect(projectType).toBe('react')
    })

    it('应该能检测 React + TypeScript 项目', async () => {
      vi.doMock('fs/promises', () => ({
        readFile: vi.fn().mockResolvedValue(JSON.stringify({
          dependencies: { react: '^18.0.0' },
          devDependencies: { typescript: '^4.0.0' }
        }))
      }))

      const projectType = await presetsManager.detectProjectType()
      expect(projectType).toBe('react-ts')
    })

    it('应该在检测失败时返回 null', async () => {
      vi.doMock('fs/promises', () => ({
        readFile: vi.fn().mockRejectedValue(new Error('File not found'))
      }))

      const projectType = await presetsManager.detectProjectType()
      expect(projectType).toBeNull()
    })
  })

  describe('配置深度合并', () => {
    it('应该正确合并嵌套对象', () => {
      const base: ViteLauncherConfig = {
        server: { port: 3000, host: 'localhost' },
        build: { outDir: 'dist' }
      }

      const override: ViteLauncherConfig = {
        server: { port: 4000, cors: true },
        launcher: { preset: 'vue3' }
      }

      const result = presetsManager['deepMergeConfigs'](base, override)

      expect(result.server?.port).toBe(4000) // 覆盖
      expect(result.server?.host).toBe('localhost') // 保持
      expect(result.server?.cors).toBe(true) // 新增
      expect(result.build?.outDir).toBe('dist') // 保持
      expect(result.launcher?.preset).toBe('vue3') // 新增
    })

    it('应该正确合并数组', () => {
      const base: ViteLauncherConfig = {
        plugins: [{ name: 'plugin1', options: {} }]
      }

      const override: ViteLauncherConfig = {
        plugins: [{ name: 'plugin2', options: {} }]
      }

      const result = presetsManager['deepMergeConfigs'](base, override)

      expect(result.plugins).toHaveLength(2)
      expect(result.plugins?.[0].name).toBe('plugin1')
      expect(result.plugins?.[1].name).toBe('plugin2')
    })
  })
})

describe('全局配置预设实例', () => {
  it('应该导出全局实例', () => {
    expect(configPresets).toBeInstanceOf(ConfigPresetsManager)
    expect(configPresets.has('vue3')).toBe(true)
  })

  it('应该能获取预设列表', () => {
    const allPresets = configPresets.getAll()
    const presetNames = allPresets.map(p => p.name)

    expect(presetNames).toContain('vue3')
    expect(presetNames).toContain('vue3-ts')
    expect(presetNames).toContain('react')
    expect(presetNames).toContain('react-ts')
    expect(presetNames).toContain('svelte')
    expect(presetNames).toContain('vanilla')
  })
})
