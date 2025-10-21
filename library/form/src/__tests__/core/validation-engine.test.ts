/**
 * @ldesign/form - ValidationEngine Tests
 * 验证引擎测试
 */

import { describe, it, expect, vi } from 'vitest'
import { ValidationEngine } from '../../core/validation/engine'

describe('ValidationEngine', () => {
  it('应该能够添加和获取验证规则', () => {
    const engine = new ValidationEngine()

    const rules = [
      { type: 'required' as const, message: '必填' }
    ]

    engine.addRules('username', rules)
    expect(engine.getRules('username')).toEqual(rules)
  })

  it('应该能够验证单个字段', async () => {
    const engine = new ValidationEngine()

    engine.addRules('username', [
      { type: 'required', message: '请输入用户名' }
    ])

    const result1 = await engine.validateField('username', '', {})
    expect(result1.valid).toBe(false)
    expect(result1.errors).toContain('请输入用户名')

    const result2 = await engine.validateField('username', 'John', {})
    expect(result2.valid).toBe(true)
    expect(result2.errors).toEqual([])
  })

  it('应该支持自定义验证器', async () => {
    const engine = new ValidationEngine()

    engine.addRules('age', [
      {
        type: 'custom',
        validator: (value) => {
          return value >= 18
        },
        message: '必须年满18岁'
      }
    ])

    const result1 = await engine.validateField('age', 16, {})
    expect(result1.valid).toBe(false)
    expect(result1.errors).toContain('必须年满18岁')

    const result2 = await engine.validateField('age', 20, {})
    expect(result2.valid).toBe(true)
  })

  it('应该支持异步验证', async () => {
    const engine = new ValidationEngine()

    engine.addRules('username', [
      {
        type: 'custom',
        validator: async (value) => {
          await new Promise(resolve => setTimeout(resolve, 10))
          return value !== 'admin'
        },
        message: '用户名已存在'
      }
    ])

    const result1 = await engine.validateField('username', 'admin', {})
    expect(result1.valid).toBe(false)

    const result2 = await engine.validateField('username', 'john', {})
    expect(result2.valid).toBe(true)
  })

  it('应该能够验证多个字段', async () => {
    const engine = new ValidationEngine()

    engine.addRules('username', [
      { type: 'required', message: '请输入用户名' }
    ])

    engine.addRules('email', [
      { type: 'required', message: '请输入邮箱' },
      { type: 'email', message: '邮箱格式不正确' }
    ])

    const result = await engine.validateFields(
      ['username', 'email'],
      { username: '', email: 'invalid' }
    )

    expect(result.valid).toBe(false)
    expect(result.errorCount).toBeGreaterThan(0)
    expect(result.errors.username).toBeDefined()
    expect(result.errors.email).toBeDefined()
  })

  it('应该能够注册自定义验证器', async () => {
    const engine = new ValidationEngine()

    engine.registerValidator('custom-test', (value) => {
      return {
        valid: value === 'test',
        message: '必须是test'
      }
    })

    engine.addRules('field', [
      { type: 'custom-test' as any }
    ])

    const result1 = await engine.validateField('field', 'test', {})
    expect(result1.valid).toBe(true)

    const result2 = await engine.validateField('field', 'other', {})
    expect(result2.valid).toBe(false)
  })

  it('应该能够清空缓存', async () => {
    const engine = new ValidationEngine({ enableCache: true })

    engine.addRules('field', [
      { type: 'required', message: '必填' }
    ])

    await engine.validateField('field', 'test', {})
    engine.clearCache()

    // 缓存清空后应该重新验证
    const result = await engine.validateField('field', 'test', {})
    expect(result.valid).toBe(true)
  })
})



