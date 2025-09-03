/**
 * SmartBuilder 单元测试
 * 
 * 测试零配置打包器的核心功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { SmartBuilder } from './smart-builder'
import { join } from 'path'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs'
import type { SmartBuilderOptions } from '../types'

// 测试用的临时目录
const TEST_ROOT = join(process.cwd(), '__test-temp__')
const TEST_SRC = join(TEST_ROOT, 'src')
const TEST_DIST = join(TEST_ROOT, 'dist')

describe('SmartBuilder', () => {
  // 每个测试前创建临时目录
  beforeEach(() => {
    if (existsSync(TEST_ROOT)) {
      rmSync(TEST_ROOT, { recursive: true, force: true })
    }
    mkdirSync(TEST_SRC, { recursive: true })
    
    // 创建测试用的 package.json
    const pkgJson = {
      name: '@test/library',
      version: '1.0.0',
      type: 'module',
      dependencies: {
        lodash: '^4.17.21'
      },
      devDependencies: {
        typescript: '^5.0.0'
      }
    }
    writeFileSync(
      join(TEST_ROOT, 'package.json'),
      JSON.stringify(pkgJson, null, 2)
    )
  })

  // 每个测试后清理临时目录
  afterEach(() => {
    if (existsSync(TEST_ROOT)) {
      rmSync(TEST_ROOT, { recursive: true, force: true })
    }
  })

  describe('构造函数', () => {
    it('应该使用默认配置创建实例', () => {
      const builder = new SmartBuilder()
      expect(builder).toBeInstanceOf(SmartBuilder)
    })

    it('应该接受自定义配置', () => {
      const options: SmartBuilderOptions = {
        root: TEST_ROOT,
        src: 'source',
        outDir: 'build',
        formats: ['esm', 'cjs'],
        minify: false,
        sourcemap: false
      }
      const builder = new SmartBuilder(options)
      expect(builder).toBeInstanceOf(SmartBuilder)
    })

    it('应该正确设置根目录', () => {
      const builder = new SmartBuilder({ root: TEST_ROOT })
      const config = builder.getConfig()
      expect(config.root).toBe(TEST_ROOT)
    })
  })

  describe('getProjectInfo', () => {
    it('应该正确分析 TypeScript 项目', async () => {
      // 创建 TypeScript 文件
      writeFileSync(
        join(TEST_SRC, 'index.ts'),
        'export const hello = (name: string): string => `Hello ${name}!`'
      )

      const builder = new SmartBuilder({ root: TEST_ROOT })
      const info = await builder.getProjectInfo()

      expect(info.type).toBe('library')
      expect(info.hasTypeScript).toBe(true)
    })

    it('应该正确识别 Vue 项目', async () => {
      // 更新 package.json 添加 Vue
      const pkgJson = {
        name: '@test/vue-app',
        version: '1.0.0',
        dependencies: {
          vue: '^3.3.0'
        }
      }
      writeFileSync(
        join(TEST_ROOT, 'package.json'),
        JSON.stringify(pkgJson, null, 2)
      )

      // 创建 Vue 文件
      writeFileSync(
        join(TEST_SRC, 'App.vue'),
        '<template><div>Hello Vue</div></template>'
      )

      const builder = new SmartBuilder({ root: TEST_ROOT })
      const info = await builder.getProjectInfo()

      expect(info.type).toBe('vue')
      expect(info.isVue3).toBe(true)
      expect(info.hasVueSFC).toBe(true)
    })

    it('应该正确识别 React 项目', async () => {
      // 更新 package.json 添加 React
      const pkgJson = {
        name: '@test/react-app',
        version: '1.0.0',
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0'
        }
      }
      writeFileSync(
        join(TEST_ROOT, 'package.json'),
        JSON.stringify(pkgJson, null, 2)
      )

      // 创建 React 文件
      writeFileSync(
        join(TEST_SRC, 'App.tsx'),
        'import React from "react"\\nexport const App = () => <div>Hello React</div>'
      )

      const builder = new SmartBuilder({ root: TEST_ROOT })
      const info = await builder.getProjectInfo()

      expect(info.type).toBe('react')
      expect(info.isReact).toBe(true)
      expect(info.hasJsx).toBe(true)
    })
  })

  describe('构建功能', () => {
    it('应该成功构建简单的 JavaScript 库', async () => {
      // 创建简单的 JS 文件
      writeFileSync(
        join(TEST_SRC, 'index.js'),
        `export function add(a, b) {
          return a + b
        }
        
        export function multiply(a, b) {
          return a * b
        }`
      )

      const builder = new SmartBuilder({
        root: TEST_ROOT,
        formats: ['esm'],
        minify: false
      })

      const result = await builder.build()

      expect(result.success).toBe(true)
      expect(result.outputs.length).toBeGreaterThan(0)
      expect(existsSync(TEST_DIST)).toBe(true)
    }, 60000) // 增加超时时间

    it('应该生成多种输出格式', async () => {
      // 创建源文件
      writeFileSync(
        join(TEST_SRC, 'index.js'),
        'export const VERSION = "1.0.0"'
      )

      const builder = new SmartBuilder({
        root: TEST_ROOT,
        formats: ['esm', 'cjs', 'umd'],
        minify: false
      })

      const results = await builder.buildAll()

      expect(results).toHaveLength(3)
      expect(results[0].format).toBe('esm')
      expect(results[1].format).toBe('cjs')
      expect(results[2].format).toBe('umd')
      
      // 检查每种格式是否都成功
      results.forEach(result => {
        expect(result.result.success).toBe(true)
      })
    }, 60000)

    it('应该正确处理外部依赖', async () => {
      // 创建使用外部依赖的文件
      writeFileSync(
        join(TEST_SRC, 'index.js'),
        `import lodash from 'lodash'
        
        export function deepClone(obj) {
          return lodash.cloneDeep(obj)
        }`
      )

      const builder = new SmartBuilder({
        root: TEST_ROOT,
        formats: ['esm'],
        external: ['lodash']
      })

      const result = await builder.build()

      expect(result.success).toBe(true)
      // 输出文件应该保留 import 语句而不是打包 lodash
    }, 60000)
  })

  describe('setCustomConfig', () => {
    it('应该允许覆盖配置', () => {
      const builder = new SmartBuilder({ root: TEST_ROOT })
      
      builder.setCustomConfig({
        minify: false,
        sourcemap: 'inline'
      })

      const config = builder.getConfig()
      expect(config.minify).toBe(false)
      expect(config.sourcemap).toBe('inline')
    })
  })

  describe('addCustomPlugin', () => {
    it('应该允许添加自定义插件', () => {
      const builder = new SmartBuilder({ root: TEST_ROOT })
      const mockPlugin = { name: 'test-plugin' }
      
      // 添加插件不应该抛出错误
      expect(() => {
        builder.addCustomPlugin(mockPlugin)
      }).not.toThrow()
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的源目录', async () => {
      const builder = new SmartBuilder({
        root: TEST_ROOT,
        src: 'non-existent-dir'
      })

      const result = await builder.build()
      
      // 即使源目录不存在，也应该返回结果（可能是空的）
      expect(result).toBeDefined()
    })

    it('应该处理构建错误', async () => {
      // 创建有语法错误的文件
      writeFileSync(
        join(TEST_SRC, 'error.js'),
        'export const { = "syntax error"'
      )

      const builder = new SmartBuilder({
        root: TEST_ROOT,
        formats: ['esm']
      })

      const result = await builder.build()
      
      // 应该返回失败结果而不是抛出异常
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('监听模式', () => {
    it('应该启动监听模式', async () => {
      // 创建源文件
      writeFileSync(
        join(TEST_SRC, 'watch.js'),
        'export const data = "initial"'
      )

      const builder = new SmartBuilder({
        root: TEST_ROOT,
        formats: ['esm']
      })

      // 启动监听（立即停止以避免测试挂起）
      const watchPromise = builder.watch()
      
      // 给监听器一些时间启动
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // 停止监听
      const watcher = (builder as any).watcher
      if (watcher) {
        await watcher.close()
      }

      expect(watchPromise).toBeDefined()
    })
  })
})
