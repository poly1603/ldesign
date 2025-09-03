/**
 * 测试环境设置
 */

import { beforeAll, afterAll } from 'vitest'
import { promises as fs } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

// 全局测试配置
export const TEST_CONFIG = {
  // 测试仓库目录
  testRepoDir: join(tmpdir(), 'ldesign-git-test'),
  // 测试超时时间
  timeout: 30000,
  // 测试用户配置
  user: {
    name: 'Test User',
    email: 'test@example.com'
  }
}

/**
 * 清理测试目录
 */
export async function cleanupTestDir(dir: string): Promise<void> {
  try {
    await fs.rm(dir, { recursive: true, force: true })
  } catch (error) {
    // 忽略删除失败的错误
    console.warn(`Failed to cleanup test directory: ${dir}`, error)
  }
}

/**
 * 创建测试目录
 */
export async function createTestDir(dir: string): Promise<void> {
  try {
    await fs.mkdir(dir, { recursive: true })
  } catch (error) {
    console.warn(`Failed to create test directory: ${dir}`, error)
  }
}

/**
 * 生成唯一的测试目录名
 */
export function generateTestDir(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  return join(tmpdir(), `ldesign-git-test-${timestamp}-${random}`)
}

// 全局设置
beforeAll(async () => {
  // 清理可能存在的测试目录
  await cleanupTestDir(TEST_CONFIG.testRepoDir)
})

afterAll(async () => {
  // 清理测试目录
  await cleanupTestDir(TEST_CONFIG.testRepoDir)
})
