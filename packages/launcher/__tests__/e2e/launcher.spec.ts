import { test, expect } from '@playwright/test'
import path from 'node:path'
import fs from 'node:fs/promises'

test.describe('ViteLauncher E2E Tests', () => {
  let launcher: any
  let tempDir: string

  test.beforeEach(async () => {
    // 动态导入以避免版本冲突
    const { ViteLauncher } = await import('../../src/index')
    launcher = new ViteLauncher({
      logLevel: 'silent',
      mode: 'development',
    })
    tempDir = path.join(process.cwd(), 'temp-e2e-test')
  })

  test.afterEach(async () => {
    await launcher.destroy()
    // Clean up temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true })
    } catch {
      // Ignore cleanup errors
    }
  })

  test('应该能够创建和检测项目类型', async () => {
    // 测试项目类型检测功能
    const projectInfo = await launcher.getProjectInfo()

    expect(projectInfo).toBeDefined()
    expect(projectInfo.framework).toBeDefined()
    expect(projectInfo.typescript).toBeDefined()
    expect(projectInfo.dependencies).toBeDefined()
    expect(projectInfo.confidence).toBeGreaterThanOrEqual(0)
    expect(projectInfo.confidence).toBeLessThanOrEqual(1)
  })

  test('应该能够获取配置信息', async () => {
    const config = launcher.getConfig()

    expect(config).toBeDefined()
    expect(config.logLevel).toBe('silent')
    expect(config.mode).toBe('development')
  })

  test('应该能够更新配置', async () => {
    const newConfig = {
      logLevel: 'info' as const,
      mode: 'production' as const,
    }

    launcher.configure(newConfig)
    const updatedConfig = launcher.getConfig()

    expect(updatedConfig.logLevel).toBe('info')
    expect(updatedConfig.mode).toBe('production')
  })

  test('应该能够检测当前项目类型', async () => {
    const projectType = await launcher.getProjectType()

    expect(projectType).toBeDefined()
    expect(typeof projectType).toBe('string')
  })

  test('应该能够处理销毁操作', async () => {
    // 测试销毁操作不会抛出错误
    await expect(launcher.destroy()).resolves.toBeUndefined()

    // 多次调用销毁也不应该抛出错误
    await expect(launcher.destroy()).resolves.toBeUndefined()
  })

  test('应该能够处理错误情况', async () => {
    // 测试无效路径的情况
    const invalidPath = '/invalid/path/that/does/not/exist'

    // getProjectInfo 应该能够处理无效路径
    const projectInfo = await launcher.getProjectInfo(invalidPath)
    expect(projectInfo).toBeDefined()
  })
})
