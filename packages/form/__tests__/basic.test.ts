/**
 * 基础功能测试
 * 
 * 测试基本的导入和实例化功能
 * 
 * @author LDesign Team
 * @since 2.0.0
 */

import { describe, it, expect } from 'vitest'

describe('基础功能测试', () => {
  it('应该能够导入工具函数', async () => {
    const { generateId, deepClone, deepEqual } = await import('../src/utils/helpers')
    
    expect(typeof generateId).toBe('function')
    expect(typeof deepClone).toBe('function')
    expect(typeof deepEqual).toBe('function')
  })

  it('应该能够导入核心类', async () => {
    const { FormCore } = await import('../src/core/form-core')
    const { DataManager } = await import('../src/core/data-manager')
    const { ValidationEngine } = await import('../src/core/validation-engine')
    
    expect(FormCore).toBeDefined()
    expect(DataManager).toBeDefined()
    expect(ValidationEngine).toBeDefined()
  })

  it('应该能够导入适配器', async () => {
    const { VanillaAdapter } = await import('../src/adapters/vanilla-adapter')
    const { BaseAdapter } = await import('../src/adapters/base-adapter')
    
    expect(VanillaAdapter).toBeDefined()
    expect(BaseAdapter).toBeDefined()
  })

  it('应该能够导入验证规则', async () => {
    const { required, email, minLength } = await import('../src/utils/validation-rules')
    
    expect(typeof required).toBe('function')
    expect(typeof email).toBe('function')
    expect(typeof minLength).toBe('function')
  })

  it('应该能够创建基础实例', async () => {
    const { DataManager } = await import('../src/core/data-manager')
    const { ValidationEngine } = await import('../src/core/validation-engine')
    
    const dataManager = new DataManager({ test: 'value' })
    expect(dataManager).toBeInstanceOf(DataManager)
    
    const validationEngine = new ValidationEngine()
    expect(validationEngine).toBeInstanceOf(ValidationEngine)
    
    // 清理
    dataManager.destroy()
    validationEngine.destroy()
  })
})
