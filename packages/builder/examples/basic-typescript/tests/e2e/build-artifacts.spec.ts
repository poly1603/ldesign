/**
 * E2E 测试 - 构建产物验证
 * 测试构建后的产物是否能正常工作
 */

import { test, expect } from '@playwright/test'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

test.describe('Build Artifacts Validation', () => {
  const projectRoot = process.cwd()

  test('构建产物文件应该存在', async () => {
    const expectedFiles = [
      'es/index.js',
      'es/index.d.ts',
      'lib/index.cjs',
      'lib/index.d.ts',
      'dist/index.umd.js',
      'dist/index.d.ts'
    ]

    for (const file of expectedFiles) {
      const filePath = join(projectRoot, file)
      expect(existsSync(filePath), `文件 ${file} 应该存在`).toBe(true)
    }
  })

  test('ESM 产物应该包含正确的导出', async () => {
    const esmPath = join(projectRoot, 'es/index.js')
    const content = readFileSync(esmPath, 'utf-8')

    // 检查导出语句
    expect(content).toContain('export')
    expect(content).toContain('createUser')
    expect(content).toContain('validateEmail')
    expect(content).toContain('formatUser')
    expect(content).toContain('DEFAULT_OPTIONS')
    expect(content).toContain('VERSION')
    expect(content).toContain('LIBRARY_NAME')
  })

  test('CommonJS 产物应该包含正确的导出', async () => {
    const cjsPath = join(projectRoot, 'lib/index.cjs')
    const content = readFileSync(cjsPath, 'utf-8')

    // 检查导出语句
    expect(content).toContain('exports.')
    expect(content).toContain('createUser')
    expect(content).toContain('validateEmail')
    expect(content).toContain('formatUser')
  })

  test('TypeScript 声明文件应该包含正确的类型', async () => {
    const dtsPath = join(projectRoot, 'es/index.d.ts')
    const content = readFileSync(dtsPath, 'utf-8')

    // 检查类型定义
    expect(content).toContain('export interface User')
    expect(content).toContain('export interface Options')
    expect(content).toContain('export declare function createUser')
    expect(content).toContain('export declare function validateEmail')
    expect(content).toContain('export declare function formatUser')
    expect(content).toContain('export declare const DEFAULT_OPTIONS')
    expect(content).toContain('export declare const VERSION')
    expect(content).toContain('export declare const LIBRARY_NAME')
  })

  test('UMD 产物应该定义全局变量', async () => {
    const umdPath = join(projectRoot, 'dist/index.umd.js')
    const content = readFileSync(umdPath, 'utf-8')

    // 检查 UMD 模式定义
    expect(content).toContain('BasicTypescript')
    expect(content).toMatch(/typeof exports.*object/)
  })

  test('Source Maps 应该存在且有效', async () => {
    const sourceMapFiles = [
      'es/index.js.map',
      'lib/index.cjs.map',
      'dist/index.umd.js.map'
    ]

    for (const file of sourceMapFiles) {
      const filePath = join(projectRoot, file)
      expect(existsSync(filePath), `Source map ${file} 应该存在`).toBe(true)

      const content = readFileSync(filePath, 'utf-8')
      const sourceMap = JSON.parse(content)

      // 验证 source map 结构
      expect(sourceMap).toHaveProperty('version')
      expect(sourceMap).toHaveProperty('sources')
      expect(sourceMap).toHaveProperty('mappings')
      expect(sourceMap.sources.length).toBeGreaterThan(0)
    }
  })

  test('package.json 导出配置应该正确', async () => {
    const packagePath = join(projectRoot, 'package.json')
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'))

    // 检查主要字段
    expect(packageJson.main).toBe('lib/index.cjs')
    expect(packageJson.module).toBe('es/index.js')
    expect(packageJson.types).toBe('es/index.d.ts')

    // 检查 exports 字段
    expect(packageJson.exports).toBeDefined()
    expect(packageJson.exports['.']).toBeDefined()
    expect(packageJson.exports['.'].import).toBe('./es/index.js')
    expect(packageJson.exports['.'].require).toBe('./lib/index.cjs')
    expect(packageJson.exports['.'].types).toBe('./es/index.d.ts')
  })
})

test.describe('Runtime Functionality Tests', () => {
  test('在浏览器环境中测试 ESM 产物', async ({ page }) => {
    // 创建一个测试页面
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>ESM Test</title>
      </head>
      <body>
        <div id="output"></div>
        <script type="module">
          import { createUser, validateEmail, formatUser, VERSION, LIBRARY_NAME, DEFAULT_OPTIONS } from '/es/index.js';
          
          const output = document.getElementById('output');
          const results = [];
          
          try {
            // 测试 createUser
            const user = createUser('测试用户', 'test@example.com', 25);
            results.push('createUser: ' + JSON.stringify(user));
            
            // 测试 validateEmail
            const isValid = validateEmail('test@example.com');
            results.push('validateEmail: ' + isValid);
            
            // 测试 formatUser
            const formatted = formatUser(user);
            results.push('formatUser: ' + formatted);
            
            // 测试常量
            results.push('VERSION: ' + VERSION);
            results.push('LIBRARY_NAME: ' + LIBRARY_NAME);
            results.push('DEFAULT_OPTIONS: ' + JSON.stringify(DEFAULT_OPTIONS));
            
            output.innerHTML = results.join('<br>');
          } catch (error) {
            output.innerHTML = 'Error: ' + error.message;
          }
        </script>
      </body>
      </html>
    `)

    // 等待脚本执行
    await page.waitForTimeout(1000)

    // 检查输出
    const output = await page.locator('#output').textContent()
    expect(output).toContain('createUser:')
    expect(output).toContain('测试用户')
    expect(output).toContain('validateEmail: true')
    expect(output).toContain('formatUser:')
    expect(output).toContain('VERSION: 1.0.0')
    expect(output).toContain('LIBRARY_NAME: basic-typescript-example')
    expect(output).toContain('DEFAULT_OPTIONS:')
    expect(output).not.toContain('Error:')
  })

  test('在浏览器环境中测试 UMD 产物', async ({ page }) => {
    // 创建一个测试页面
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>UMD Test</title>
      </head>
      <body>
        <div id="output"></div>
        <script src="/dist/index.umd.js"></script>
        <script>
          const output = document.getElementById('output');
          const results = [];
          
          try {
            // 测试全局变量
            if (typeof BasicTypescript === 'undefined') {
              throw new Error('BasicTypescript global variable not found');
            }
            
            // 测试 createUser
            const user = BasicTypescript.createUser('UMD测试用户', 'umd@example.com', 30);
            results.push('createUser: ' + JSON.stringify(user));
            
            // 测试 validateEmail
            const isValid = BasicTypescript.validateEmail('umd@example.com');
            results.push('validateEmail: ' + isValid);
            
            // 测试 formatUser
            const formatted = BasicTypescript.formatUser(user);
            results.push('formatUser: ' + formatted);
            
            output.innerHTML = results.join('<br>');
          } catch (error) {
            output.innerHTML = 'Error: ' + error.message;
          }
        </script>
      </body>
      </html>
    `)

    // 等待脚本执行
    await page.waitForTimeout(1000)

    // 检查输出
    const output = await page.locator('#output').textContent()
    expect(output).toContain('createUser:')
    expect(output).toContain('UMD测试用户')
    expect(output).toContain('validateEmail: true')
    expect(output).toContain('formatUser:')
    expect(output).not.toContain('Error:')
  })
})
