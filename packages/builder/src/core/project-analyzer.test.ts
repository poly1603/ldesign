/**
 * ProjectAnalyzer 单元测试
 * 
 * 测试项目类型分析功能
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ProjectAnalyzer } from './project-analyzer'
import { join } from 'path'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs'

// 测试用的临时目录
const TEST_ROOT = join(process.cwd(), '__test-analyzer__')
const TEST_SRC = join(TEST_ROOT, 'src')

describe('ProjectAnalyzer', () => {
  beforeEach(() => {
    if (existsSync(TEST_ROOT)) {
      rmSync(TEST_ROOT, { recursive: true, force: true })
    }
    mkdirSync(TEST_SRC, { recursive: true })
  })

  afterEach(() => {
    if (existsSync(TEST_ROOT)) {
      rmSync(TEST_ROOT, { recursive: true, force: true })
    }
  })

  describe('analyze', () => {
    it('应该识别纯 JavaScript 库', async () => {
      // 创建基础 package.json
      writeFileSync(
        join(TEST_ROOT, 'package.json'),
        JSON.stringify({
          name: 'test-lib',
          version: '1.0.0'
        })
      )

      // 创建 JS 文件
      writeFileSync(
        join(TEST_SRC, 'index.js'),
        'export default function() {}'
      )

      const analyzer = new ProjectAnalyzer(TEST_ROOT)
      const info = await analyzer.analyze()

      expect(info.type).toBe('library')
      expect(info.hasTypeScript).toBe(false)
      expect(info.isVue2).toBe(false)
      expect(info.isVue3).toBe(false)
      expect(info.isReact).toBe(false)
    })

    it('应该识别 TypeScript 项目', async () => {
      // 创建包含 TypeScript 的 package.json
      writeFileSync(
        join(TEST_ROOT, 'package.json'),
        JSON.stringify({
          name: 'test-ts-lib',
          version: '1.0.0',
          devDependencies: {
            typescript: '^5.0.0'
          }
        })
      )

      // 创建 TS 文件
      writeFileSync(
        join(TEST_SRC, 'index.ts'),
        'export const value: string = "test"'
      )

      const analyzer = new ProjectAnalyzer(TEST_ROOT)
      const info = await analyzer.analyze()

      expect(info.hasTypeScript).toBe(true)
    })

    it('应该识别 Vue 3 项目', async () => {
      // 创建 Vue 3 项目的 package.json
      writeFileSync(
        join(TEST_ROOT, 'package.json'),
        JSON.stringify({
          name: 'vue3-app',
          version: '1.0.0',
          dependencies: {
            vue: '^3.3.4'
          }
        })
      )

      // 创建 Vue 文件
      writeFileSync(
        join(TEST_SRC, 'App.vue'),
        '<template><div>App</div></template>'
      )

      const analyzer = new ProjectAnalyzer(TEST_ROOT)
      const info = await analyzer.analyze()

      expect(info.type).toBe('vue')
      expect(info.isVue3).toBe(true)
      expect(info.isVue2).toBe(false)
      expect(info.hasVueSFC).toBe(true)
    })

    it('应该识别 Vue 2 项目', async () => {
      // 创建 Vue 2 项目的 package.json
      writeFileSync(
        join(TEST_ROOT, 'package.json'),
        JSON.stringify({
          name: 'vue2-app',
          version: '1.0.0',
          dependencies: {
            vue: '^2.7.14'
          }
        })
      )

      const analyzer = new ProjectAnalyzer(TEST_ROOT)
      const info = await analyzer.analyze()

      expect(info.type).toBe('vue')
      expect(info.isVue2).toBe(true)
      expect(info.isVue3).toBe(false)
    })

    it('应该识别 React 项目', async () => {
      // 创建 React 项目的 package.json
      writeFileSync(
        join(TEST_ROOT, 'package.json'),
        JSON.stringify({
          name: 'react-app',
          version: '1.0.0',
          dependencies: {
            react: '^18.2.0',
            'react-dom': '^18.2.0'
          }
        })
      )

      // 创建 JSX 文件
      writeFileSync(
        join(TEST_SRC, 'App.jsx'),
        'export default function App() { return <div>App</div> }'
      )

      const analyzer = new ProjectAnalyzer(TEST_ROOT)
      const info = await analyzer.analyze()

      expect(info.type).toBe('react')
      expect(info.isReact).toBe(true)
      expect(info.hasJsx).toBe(true)
    })

    it('应该识别 Less 样式', async () => {
      writeFileSync(
        join(TEST_ROOT, 'package.json'),
        JSON.stringify({ name: 'test', version: '1.0.0' })
      )

      // 创建 Less 文件
      writeFileSync(
        join(TEST_SRC, 'styles.less'),
        '@primary-color: #1890ff;\n.container { color: @primary-color; }'
      )

      const analyzer = new ProjectAnalyzer(TEST_ROOT)
      const info = await analyzer.analyze()

      expect(info.hasLess).toBe(true)
    })

    it('应该识别 Sass/SCSS 样式', async () => {
      writeFileSync(
        join(TEST_ROOT, 'package.json'),
        JSON.stringify({ name: 'test', version: '1.0.0' })
      )

      // 创建 SCSS 文件
      writeFileSync(
        join(TEST_SRC, 'styles.scss'),
        '$primary: #333;\n.container { color: $primary; }'
      )

      const analyzer = new ProjectAnalyzer(TEST_ROOT)
      const info = await analyzer.analyze()

      expect(info.hasSass).toBe(true)
    })

    it('应该正确提取依赖列表', async () => {
      const deps = {
        lodash: '^4.17.21',
        axios: '^1.4.0'
      }
      
      const devDeps = {
        typescript: '^5.0.0',
        vitest: '^0.34.0'
      }

      writeFileSync(
        join(TEST_ROOT, 'package.json'),
        JSON.stringify({
          name: 'test',
          version: '1.0.0',
          dependencies: deps,
          devDependencies: devDeps
        })
      )

      const analyzer = new ProjectAnalyzer(TEST_ROOT)
      const info = await analyzer.analyze()

      expect(info.deps).toContain('lodash')
      expect(info.deps).toContain('axios')
      expect(info.deps).toContain('typescript')
      expect(info.deps).toContain('vitest')
    })

    it('应该处理没有 package.json 的情况', async () => {
      // 不创建 package.json
      const analyzer = new ProjectAnalyzer(TEST_ROOT)
      const info = await analyzer.analyze()

      expect(info.type).toBe('library')
      expect(info.deps).toEqual([])
    })

    it('应该通过 Vite 插件识别 React', async () => {
      writeFileSync(
        join(TEST_ROOT, 'package.json'),
        JSON.stringify({
          name: 'vite-react-app',
          version: '1.0.0',
          devDependencies: {
            '@vitejs/plugin-react': '^4.0.0'
          }
        })
      )

      const analyzer = new ProjectAnalyzer(TEST_ROOT)
      const info = await analyzer.analyze()

      expect(info.isReact).toBe(true)
      expect(info.type).toBe('react')
    })
  })

  describe('版本比较', () => {
    it('应该正确比较主版本号', async () => {
      const testCases = [
        { version: '3.0.0', expected: true },
        { version: '^3.2.0', expected: true },
        { version: '~3.1.0', expected: true },
        { version: '2.7.14', expected: false },
        { version: '^2.6.0', expected: false }
      ]

      for (const { version, expected } of testCases) {
        writeFileSync(
          join(TEST_ROOT, 'package.json'),
          JSON.stringify({
            name: 'test',
            version: '1.0.0',
            dependencies: {
              vue: version
            }
          })
        )

        const analyzer = new ProjectAnalyzer(TEST_ROOT)
        const info = await analyzer.analyze()

        if (expected) {
          expect(info.isVue3).toBe(true)
          expect(info.isVue2).toBe(false)
        } else {
          expect(info.isVue3).toBe(false)
          expect(info.isVue2).toBe(true)
        }
      }
    })
  })
})
