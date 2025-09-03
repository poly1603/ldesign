/**
 * BuilderUtils 单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { BuilderUtils } from '../../src/builder/builder-utils'
import type { BuildResult, OutputFormat } from '../../src/builder/types'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { glob } from 'glob'

// Mock 文件系统和 glob
vi.mock('fs')
vi.mock('glob')

describe('BuilderUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('项目类型检测', () => {
    it('应该检测 Vue 项目', () => {
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        dependencies: { vue: '^3.0.0' }
      }))
      
      const type = BuilderUtils.detectProjectType('/test/project')
      expect(type).toBe('vue')
    })

    it('应该检测 React 项目', () => {
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        dependencies: { react: '^18.0.0', 'react-dom': '^18.0.0' }
      }))
      
      const type = BuilderUtils.detectProjectType('/test/project')
      expect(type).toBe('react')
    })

    it('应该检测 Angular 项目', () => {
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        dependencies: { '@angular/core': '^15.0.0' }
      }))
      
      const type = BuilderUtils.detectProjectType('/test/project')
      expect(type).toBe('angular')
    })

    it('应该检测库项目', () => {
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        main: 'dist/index.js',
        module: 'dist/index.esm.js'
      }))
      
      const type = BuilderUtils.detectProjectType('/test/project')
      expect(type).toBe('library')
    })

    it('应该检测 Node.js 项目', () => {
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        type: 'module',
        dependencies: { express: '^4.18.0' }
      }))
      
      const type = BuilderUtils.detectProjectType('/test/project')
      expect(type).toBe('node')
    })

    it('应该在没有 package.json 时返回 unknown', () => {
      vi.mocked(existsSync).mockReturnValue(false)
      
      const type = BuilderUtils.detectProjectType('/test/project')
      expect(type).toBe('unknown')
    })

    it('应该在 package.json 解析失败时返回 unknown', () => {
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockImplementation(() => {
        throw new Error('Parse error')
      })
      
      const type = BuilderUtils.detectProjectType('/test/project')
      expect(type).toBe('unknown')
    })
  })

  describe('入口文件查找', () => {
    it('应该找到第一个存在的入口文件', () => {
      vi.mocked(existsSync)
        .mockReturnValueOnce(false) // src/index.ts
        .mockReturnValueOnce(true)  // src/index.js
      
      const entry = BuilderUtils.findEntryFile('/test/project')
      expect(entry).toContain('src/index.js')
    })

    it('应该在没有找到入口文件时返回 null', () => {
      vi.mocked(existsSync).mockReturnValue(false)
      
      const entry = BuilderUtils.findEntryFile('/test/project')
      expect(entry).toBeNull()
    })

    it('应该支持自定义搜索模式', () => {
      vi.mocked(existsSync).mockReturnValue(true)
      
      const entry = BuilderUtils.findEntryFile('/test/project', ['custom/entry.ts'])
      expect(entry).toContain('custom/entry.ts')
    })
  })

  describe('多入口文件查找', () => {
    it('应该找到多个入口文件', () => {
      vi.mocked(glob.sync).mockReturnValue([
        'src/components/index.ts',
        'src/utils/index.ts'
      ])
      
      const entries = BuilderUtils.findMultipleEntries('/test/project')
      
      expect(entries).toEqual({
        components: expect.stringContaining('src/components/index.ts'),
        utils: expect.stringContaining('src/utils/index.ts')
      })
    })

    it('应该支持自定义搜索模式', () => {
      vi.mocked(glob.sync).mockReturnValue(['lib/core/index.ts'])
      
      const entries = BuilderUtils.findMultipleEntries('/test/project', 'lib/*/index.ts')
      
      expect(entries).toEqual({
        core: expect.stringContaining('lib/core/index.ts')
      })
    })
  })

  describe('文件名生成', () => {
    it('应该生成 ES 模块文件名', () => {
      const fileName = BuilderUtils.generateFileName('es', 'index')
      expect(fileName).toBe('index.js')
    })

    it('应该生成 CommonJS 文件名', () => {
      const fileName = BuilderUtils.generateFileName('cjs', 'index')
      expect(fileName).toBe('index.cjs.cjs')
    })

    it('应该生成 UMD 文件名', () => {
      const fileName = BuilderUtils.generateFileName('umd', 'index')
      expect(fileName).toBe('index.umd.umd.js')
    })

    it('应该支持压缩后缀', () => {
      const fileName = BuilderUtils.generateFileName('es', 'index', { minify: true })
      expect(fileName).toBe('index.min.js')
    })

    it('应该支持哈希后缀', () => {
      const fileName = BuilderUtils.generateFileName('es', 'index', { hash: true })
      expect(fileName).toBe('index.[hash].js')
    })

    it('应该支持自定义扩展名', () => {
      const fileName = BuilderUtils.generateFileName('es', 'index', { extension: '.mjs' })
      expect(fileName).toBe('index.mjs')
    })
  })

  describe('构建结果格式化', () => {
    it('应该格式化成功的构建结果', () => {
      const result: BuildResult = {
        success: true,
        duration: 1500,
        outputs: [
          { fileName: 'index.js', size: 1024, format: 'es' },
          { fileName: 'index.cjs', size: 2048, format: 'cjs' }
        ],
        errors: [],
        warnings: []
      }
      
      const formatted = BuilderUtils.formatBuildResult(result)
      
      expect(formatted).toContain('✅ 构建成功 (1500ms)')
      expect(formatted).toContain('📦 输出文件:')
      expect(formatted).toContain('index.js - 1.00 KB')
      expect(formatted).toContain('index.cjs - 2.00 KB')
    })

    it('应该格式化失败的构建结果', () => {
      const result: BuildResult = {
        success: false,
        duration: 500,
        outputs: [],
        errors: ['Syntax error in src/index.ts'],
        warnings: []
      }
      
      const formatted = BuilderUtils.formatBuildResult(result)
      
      expect(formatted).toContain('❌ 构建失败 (500ms)')
      expect(formatted).toContain('🚫 错误信息:')
      expect(formatted).toContain('Syntax error in src/index.ts')
    })

    it('应该显示警告信息', () => {
      const result: BuildResult = {
        success: true,
        duration: 1000,
        outputs: [],
        errors: [],
        warnings: ['Unused variable detected']
      }
      
      const formatted = BuilderUtils.formatBuildResult(result)
      
      expect(formatted).toContain('⚠️ 警告信息:')
      expect(formatted).toContain('Unused variable detected')
    })

    it('应该显示压缩后大小', () => {
      const result: BuildResult = {
        success: true,
        duration: 1000,
        outputs: [
          { 
            fileName: 'index.js', 
            size: 2048, 
            compressedSize: 1024,
            format: 'es' 
          }
        ],
        errors: [],
        warnings: []
      }
      
      const formatted = BuilderUtils.formatBuildResult(result)
      
      expect(formatted).toContain('index.js - 2.00 KB (压缩后: 1.00 KB)')
    })
  })

  describe('文件大小格式化', () => {
    it('应该格式化字节', () => {
      expect(BuilderUtils.formatFileSize(0)).toBe('0 B')
      expect(BuilderUtils.formatFileSize(512)).toBe('512 B')
    })

    it('应该格式化 KB', () => {
      expect(BuilderUtils.formatFileSize(1024)).toBe('1 KB')
      expect(BuilderUtils.formatFileSize(1536)).toBe('1.5 KB')
    })

    it('应该格式化 MB', () => {
      expect(BuilderUtils.formatFileSize(1024 * 1024)).toBe('1 MB')
      expect(BuilderUtils.formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB')
    })

    it('应该格式化 GB', () => {
      expect(BuilderUtils.formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
    })
  })

  describe('依赖检查', () => {
    it('应该检查已安装的依赖', () => {
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        dependencies: { react: '^18.0.0' },
        devDependencies: { typescript: '^5.0.0' }
      }))
      
      const result = BuilderUtils.checkDependencies('/test/project', ['react', 'typescript', 'vue'])
      
      expect(result.installed).toEqual(['react', 'typescript'])
      expect(result.missing).toEqual(['vue'])
    })

    it('应该在没有 package.json 时返回所有依赖为缺失', () => {
      vi.mocked(existsSync).mockReturnValue(false)
      
      const result = BuilderUtils.checkDependencies('/test/project', ['react', 'vue'])
      
      expect(result.installed).toEqual([])
      expect(result.missing).toEqual(['react', 'vue'])
    })
  })

  describe('配置文件操作', () => {
    it('应该创建配置文件', () => {
      const config = { entry: 'src/index.ts', outDir: 'dist' }
      
      BuilderUtils.createConfigFile('/test/project', config)
      
      expect(writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('build.config.js'),
        expect.stringContaining('"entry": "src/index.ts"'),
        'utf-8'
      )
    })

    it('应该支持自定义文件名', () => {
      const config = { entry: 'src/index.ts' }
      
      BuilderUtils.createConfigFile('/test/project', config, 'custom.config.js')
      
      expect(writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('custom.config.js'),
        expect.any(String),
        'utf-8'
      )
    })

    it('应该读取配置文件', () => {
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(
        'export default {"entry": "src/index.ts", "outDir": "dist"}'
      )
      
      const config = BuilderUtils.readConfigFile('/test/project')
      
      expect(config).toEqual({
        entry: 'src/index.ts',
        outDir: 'dist'
      })
    })

    it('应该在配置文件不存在时返回 null', () => {
      vi.mocked(existsSync).mockReturnValue(false)
      
      const config = BuilderUtils.readConfigFile('/test/project')
      
      expect(config).toBeNull()
    })
  })

  describe('推荐配置生成', () => {
    it('应该为 Vue 项目生成推荐配置', () => {
      vi.mocked(existsSync)
        .mockReturnValueOnce(true)  // package.json
        .mockReturnValueOnce(true)  // src/main.ts
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        dependencies: { vue: '^3.0.0' }
      }))
      
      const config = BuilderUtils.getRecommendedConfig('/test/project')
      
      expect(config).toMatchObject({
        entry: 'src/main.ts',
        server: { port: 3000, open: true },
        css: { extract: true }
      })
    })

    it('应该为库项目生成推荐配置', () => {
      vi.mocked(existsSync)
        .mockReturnValueOnce(true)  // package.json
        .mockReturnValueOnce(true)  // src/index.ts
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        main: 'dist/index.js'
      }))
      
      const config = BuilderUtils.getRecommendedConfig('/test/project')
      
      expect(config).toMatchObject({
        lib: {
          entry: 'src/index.ts',
          formats: ['es', 'cjs']
        }
      })
    })
  })

  describe('配置验证', () => {
    it('应该验证有效配置', () => {
      vi.mocked(existsSync).mockReturnValue(true)
      
      const result = BuilderUtils.validateConfig({
        entry: 'src/index.ts',
        outDir: 'dist'
      })
      
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该检测缺少入口文件', () => {
      const result = BuilderUtils.validateConfig({
        outDir: 'dist'
      })
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('缺少入口文件配置 (entry 或 input)')
    })

    it('应该检测缺少输出目录', () => {
      const result = BuilderUtils.validateConfig({
        entry: 'src/index.ts'
      })
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('缺少输出目录配置 (outDir 或 output)')
    })

    it('应该检测入口文件是否存在', () => {
      vi.mocked(existsSync).mockReturnValue(false)
      
      const result = BuilderUtils.validateConfig({
        entry: 'src/nonexistent.ts',
        outDir: 'dist'
      })
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('入口文件不存在: src/nonexistent.ts')
    })
  })
})
