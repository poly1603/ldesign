/**
 * @fileoverview Basic functionality test for the form system
 * @author LDesign Team
 */

import { describe, it, expect } from 'vitest'
import { FormEngine } from '../src/core/FormEngine'
import { ValidationEngine } from '../src/core/ValidationEngine'
import { LayoutCalculator } from '../src/core/LayoutCalculator'

describe('FormEngine', () => {
  it('should create form engine instance', () => {
    const engine = new FormEngine({
      fields: [
        {
          name: 'username',
          title: '用户名',
          component: 'input',
          required: true,
        },
      ],
    })

    expect(engine).toBeDefined()
    expect(engine.getFormData()).toEqual({})
  })

  it('should set and get field values', () => {
    const engine = new FormEngine({
      fields: [
        {
          name: 'username',
          title: '用户名',
          component: 'input',
          defaultValue: 'test',
        },
      ],
    })

    engine.setFieldValue('username', 'john')
    expect(engine.getFieldValue('username')).toBe('john')
  })

  it('should handle form reset', () => {
    const engine = new FormEngine({
      fields: [
        {
          name: 'username',
          title: '用户名',
          component: 'input',
          defaultValue: 'test',
        },
      ],
    })

    engine.setFieldValue('username', 'changed')
    engine.reset()
    expect(engine.getFieldValue('username')).toBe('test')
  })
})

describe('ValidationEngine', () => {
  it('should create validation engine instance', () => {
    const engine = new ValidationEngine()
    expect(engine).toBeDefined()
  })

  it('should validate required field', async () => {
    const engine = new ValidationEngine()
    const result = await engine.validateField(
      'username',
      '',
      [{ validator: 'required' }],
      {}
    )

    expect(result.valid).toBe(false)
    expect(result.message).toBeTruthy()
  })

  it('should validate email field', async () => {
    const engine = new ValidationEngine()
    const result = await engine.validateField(
      'email',
      'invalid-email',
      [{ validator: 'email' }],
      {}
    )

    expect(result.valid).toBe(false)
    expect(result.message).toBeTruthy()
  })
})

describe('LayoutCalculator', () => {
  it('should create layout calculator instance', () => {
    const calculator = new LayoutCalculator()
    expect(calculator).toBeDefined()
  })

  it('should calculate columns based on container width', () => {
    const calculator = new LayoutCalculator({
      minColumnWidth: 300,
      autoCalculate: true,
    })

    const columns = calculator.calculateColumns(900)
    expect(columns).toBeGreaterThan(0)
    expect(columns).toBeLessThanOrEqual(6)
  })

  it('should determine device type', () => {
    const calculator = new LayoutCalculator()

    expect(calculator.getDeviceType(400)).toBe('mobile')
    expect(calculator.getDeviceType(800)).toBe('tablet')
    expect(calculator.getDeviceType(1200)).toBe('desktop')
  })
})