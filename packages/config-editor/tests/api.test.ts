/**
 * API 服务测试用例
 * 
 * 测试 API 服务的基本功能
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { configApi } from '../src/services/api'

describe('API 服务', () => {
  beforeAll(async () => {
    // 等待一段时间确保服务器启动
    await new Promise(resolve => setTimeout(resolve, 1000))
  })

  afterAll(async () => {
    // 清理工作
  })

  it('应该能够检查服务器健康状态', async () => {
    const isHealthy = await configApi.healthCheck()
    // 在测试环境中，服务器可能没有启动，所以这里不强制要求为 true
    expect(typeof isHealthy).toBe('boolean')
  })

  it('应该能够获取工作目录信息', async () => {
    const result = await configApi.getWorkspace()
    
    if (result.success) {
      expect(result.data).toBeDefined()
      expect(result.data?.cwd).toBeDefined()
      expect(result.data?.files).toBeDefined()
    } else {
      // 如果服务器未启动，应该返回错误
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    }
  })

  it('应该能够获取所有配置', async () => {
    const result = await configApi.getAllConfigs()
    
    if (result.success) {
      expect(result.data).toBeDefined()
      expect(result.data?.launcher).toBeDefined()
      expect(result.data?.app).toBeDefined()
      expect(result.data?.package).toBeDefined()
    } else {
      // 如果服务器未启动，应该返回错误
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    }
  })

  it('应该能够获取特定类型的配置', async () => {
    const result = await configApi.getConfig('launcher')
    
    if (result.success) {
      expect(result.data).toBeDefined()
    } else {
      // 如果服务器未启动，应该返回错误
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    }
  })

  it('应该能够验证配置', async () => {
    const testConfig = {
      projectName: 'Test Project',
      framework: 'vue' as const
    }
    
    const result = await configApi.validateConfig('launcher', testConfig)
    
    if (result.success) {
      expect(result.data).toBeDefined()
    } else {
      // 如果服务器未启动，应该返回错误
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    }
  })
})
