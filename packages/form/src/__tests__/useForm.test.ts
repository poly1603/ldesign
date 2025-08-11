// useForm Hook 测试

import type { FormOptions } from '../types/form'
import { beforeEach, describe, expect, it } from 'vitest'
import { useForm } from '../composables/useForm'

describe('useForm', () => {
  let formOptions: FormOptions

  beforeEach(() => {
    formOptions = {
      fields: [
        {
          name: 'username',
          title: '用户名',
          component: 'FormInput',
          required: true,
          rules: [
            { type: 'required', message: '用户名不能为空' },
            { type: 'minLength', params: 3, message: '用户名至少3个字符' },
          ],
        },
        {
          name: 'email',
          title: '邮箱',
          component: 'FormInput',
          rules: [{ type: 'email', message: '请输入有效的邮箱地址' }],
        },
        {
          name: 'age',
          title: '年龄',
          component: 'FormInput',
          rules: [
            { type: 'number', message: '年龄必须是数字' },
            { type: 'min', params: 18, message: '年龄不能小于18岁' },
          ],
        },
      ],
    }
  })

  it('应该正确初始化表单', () => {
    const form = useForm(formOptions)

    expect(form.formData).toBeDefined()
    expect(form.formState).toBeDefined()
    expect(form.fieldStates).toBeDefined()
    expect(form.getFormData).toBeInstanceOf(Function)
    expect(form.setFormData).toBeInstanceOf(Function)
    expect(form.validate).toBeInstanceOf(Function)
  })

  it('应该正确设置初始数据', () => {
    const initialData = {
      username: 'testuser',
      email: 'test@example.com',
      age: 25,
    }

    const form = useForm({
      ...formOptions,
      initialData,
    })

    expect(form.getFormData()).toEqual(initialData)
    expect(form.getFieldValue('username')).toBe('testuser')
    expect(form.getFieldValue('email')).toBe('test@example.com')
    expect(form.getFieldValue('age')).toBe(25)
  })

  it('应该正确设置字段值', () => {
    const form = useForm(formOptions)

    form.setFieldValue('username', 'newuser')
    expect(form.getFieldValue('username')).toBe('newuser')

    form.setFieldValue('email', 'new@example.com')
    expect(form.getFieldValue('email')).toBe('new@example.com')
  })

  it('应该正确设置表单数据', () => {
    const form = useForm(formOptions)

    const newData = {
      username: 'testuser',
      email: 'test@example.com',
      age: 30,
    }

    form.setFormData(newData)
    expect(form.getFormData()).toEqual(newData)
  })

  it('应该正确验证必填字段', async () => {
    const form = useForm(formOptions)

    // 测试空值验证
    const isValid = await form.validateField('username')
    expect(isValid).toBe(false)
    expect(form.fieldStates.username.errors).toContain('用户名不能为空')
  })

  it('应该正确验证邮箱格式', async () => {
    const form = useForm(formOptions)

    // 测试无效邮箱
    form.setFieldValue('email', 'invalid-email')
    const isValid = await form.validateField('email')
    expect(isValid).toBe(false)
    expect(form.fieldStates.email.errors).toContain('请输入有效的邮箱地址')

    // 测试有效邮箱
    form.setFieldValue('email', 'valid@example.com')
    const isValidEmail = await form.validateField('email')
    expect(isValidEmail).toBe(true)
    expect(form.fieldStates.email.errors).toHaveLength(0)
  })

  it('应该正确验证数字和最小值', async () => {
    const form = useForm(formOptions)

    // 测试非数字
    form.setFieldValue('age', 'not-a-number')
    let isValid = await form.validateField('age')
    expect(isValid).toBe(false)
    expect(form.fieldStates.age.errors).toContain('年龄必须是数字')

    // 测试小于最小值
    form.setFieldValue('age', 15)
    isValid = await form.validateField('age')
    expect(isValid).toBe(false)
    expect(form.fieldStates.age.errors).toContain('年龄不能小于18岁')

    // 测试有效值
    form.setFieldValue('age', 25)
    isValid = await form.validateField('age')
    expect(isValid).toBe(true)
    expect(form.fieldStates.age.errors).toHaveLength(0)
  })

  it('应该正确验证整个表单', async () => {
    const form = useForm(formOptions)

    // 设置无效数据
    form.setFormData({
      username: '', // 必填但为空
      email: 'invalid-email', // 无效邮箱
      age: 15, // 小于最小值
    })

    const isValid = await form.validate()
    expect(isValid).toBe(false)
    expect(form.formState.valid).toBe(false)

    // 设置有效数据
    form.setFormData({
      username: 'testuser',
      email: 'test@example.com',
      age: 25,
    })

    const isValidForm = await form.validate()
    expect(isValidForm).toBe(true)
    expect(form.formState.valid).toBe(true)
  })

  it('应该正确重置表单', () => {
    const initialData = {
      username: 'initial',
      email: 'initial@example.com',
      age: 20,
    }

    const form = useForm({
      ...formOptions,
      initialData,
    })

    // 修改数据
    form.setFormData({
      username: 'modified',
      email: 'modified@example.com',
      age: 30,
    })

    expect(form.getFormData()).not.toEqual(initialData)

    // 重置表单
    form.reset()
    expect(form.getFormData()).toEqual(initialData)
    expect(form.formState.dirty).toBe(false)
  })

  it('应该正确重置单个字段', () => {
    const form = useForm({
      ...formOptions,
      initialData: { username: 'initial' },
    })

    // 修改字段
    form.setFieldValue('username', 'modified')
    expect(form.getFieldValue('username')).toBe('modified')

    // 重置字段
    form.resetField('username')
    expect(form.getFieldValue('username')).toBe('initial')
  })

  it('应该正确清空验证错误', async () => {
    const form = useForm(formOptions)

    // 触发验证错误
    await form.validateField('username')
    expect(form.fieldStates.username.errors.length).toBeGreaterThan(0)

    // 清空验证错误
    form.clearValidation()
    expect(form.fieldStates.username.errors).toHaveLength(0)
    expect(form.formState.valid).toBe(true)
  })

  it('应该正确处理字段状态变化', () => {
    const form = useForm(formOptions)

    // 检查初始状态
    expect(form.fieldStates.username.dirty).toBe(false)
    expect(form.fieldStates.username.touched).toBe(false)

    // 修改字段值
    form.setFieldValue('username', 'test')
    expect(form.fieldStates.username.dirty).toBe(true)
    expect(form.fieldStates.username.touched).toBe(true)
    expect(form.formState.dirty).toBe(true)
  })

  it('应该正确处理事件监听', () => {
    const form = useForm(formOptions)
    let eventTriggered = false

    // 监听事件
    form.on('fieldChange', () => {
      eventTriggered = true
    })

    // 触发事件
    form.setFieldValue('username', 'test')
    expect(eventTriggered).toBe(true)
  })

  it('应该正确销毁表单实例', () => {
    const form = useForm(formOptions)

    // 销毁实例
    expect(() => form.destroy()).not.toThrow()
  })
})
