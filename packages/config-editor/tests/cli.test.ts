/**
 * CLI 测试用例
 * 
 * 测试命令行工具的基本功能
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { describe, it, expect } from 'vitest'
import { spawn } from 'child_process'
import { join } from 'path'

describe('CLI 工具', () => {
  const cliPath = join(__dirname, '../src/cli.ts')

  it('应该显示帮助信息', (done) => {
    const child = spawn('tsx', [cliPath, '--help'], {
      stdio: 'pipe'
    })

    let output = ''
    child.stdout.on('data', (data) => {
      output += data.toString()
    })

    child.on('close', (code) => {
      expect(code).toBe(0)
      expect(output).toContain('LDesign 可视化配置编辑器')
      expect(output).toContain('start')
      expect(output).toContain('dev')
      done()
    })
  }, 10000)

  it('应该显示版本信息', (done) => {
    const child = spawn('tsx', [cliPath, '--version'], {
      stdio: 'pipe'
    })

    let output = ''
    child.stdout.on('data', (data) => {
      output += data.toString()
    })

    child.on('close', (code) => {
      expect(code).toBe(0)
      expect(output).toContain('1.0.0')
      done()
    })
  }, 10000)

  it('应该能够解析 start 命令参数', (done) => {
    const child = spawn('tsx', [cliPath, 'start', '--help'], {
      stdio: 'pipe'
    })

    let output = ''
    child.stdout.on('data', (data) => {
      output += data.toString()
    })

    child.on('close', (code) => {
      expect(code).toBe(0)
      expect(output).toContain('启动可视化配置编辑器界面')
      expect(output).toContain('--port')
      expect(output).toContain('--host')
      done()
    })
  }, 10000)
})
