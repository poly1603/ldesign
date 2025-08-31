/**
 * useForm Hook 测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { useForm } from '../useForm'

describe('useForm', () => {
  let form: ReturnType<typeof useForm>

  beforeEach(() => {
    form = useForm({
      name: '',
      email: '',
      age: 0,
    })
  })

  it('应该正确初始化表单数据', () => {
    expect(form.values.value).toEqual({
      name: '',
      email: '',
      age: 0,
    })
    expect(form.errors.value).toEqual({})
    expect(form.touched.value).toEqual({})
    expect(form.dirty.value).toBe(false)
    expect(form.valid.value).toBe(true)
  })

  it('应该正确设置字段值', async () => {
    form.setFieldValue('name', 'John')
    await nextTick()

    expect(form.values.value.name).toBe('John')
    expect(form.dirty.value).toBe(true)
    expect(form.touched.value.name).toBe(true)
  })

  it('应该正确设置多个字段值', async () => {
    form.setValues({
      name: 'John',
      email: 'john@example.com',
    })
    await nextTick()

    expect(form.values.value.name).toBe('John')
    expect(form.values.value.email).toBe('john@example.com')
    expect(form.dirty.value).toBe(true)
  })

  it('应该正确设置字段错误', async () => {
    form.setFieldError('name', '姓名不能为空')
    await nextTick()

    expect(form.errors.value.name).toBe('姓名不能为空')
    expect(form.valid.value).toBe(false)
  })

  it('应该正确清除字段错误', async () => {
    form.setFieldError('name', '姓名不能为空')
    await nextTick()
    expect(form.valid.value).toBe(false)

    form.clearFieldError('name')
    await nextTick()
    expect(form.errors.value.name).toBeUndefined()
    expect(form.valid.value).toBe(true)
  })

  it('应该正确重置表单', async () => {
    form.setValues({
      name: 'John',
      email: 'john@example.com',
    })
    form.setFieldError('name', '错误')
    await nextTick()

    form.reset()
    await nextTick()

    expect(form.values.value).toEqual({
      name: '',
      email: '',
      age: 0,
    })
    expect(form.errors.value).toEqual({})
    expect(form.touched.value).toEqual({})
    expect(form.dirty.value).toBe(false)
  })

  it('应该正确验证表单', async () => {
    const formWithValidation = useForm(
      {
        name: '',
        email: '',
      },
      {
        validate: (values) => {
          const errors: Record<string, string> = {}
          if (!values.name) {
            errors.name = '姓名不能为空'
          }
          if (!values.email) {
            errors.email = '邮箱不能为空'
          }
          return errors
        },
      }
    )

    const result = await formWithValidation.validate()
    expect(result).toBe(false)
    expect(formWithValidation.errors.value.name).toBe('姓名不能为空')
    expect(formWithValidation.errors.value.email).toBe('邮箱不能为空')
  })

  it('应该正确处理提交', async () => {
    let submitData: any = null
    const formWithSubmit = useForm(
      {
        name: 'John',
        email: 'john@example.com',
      },
      {
        onSubmit: async (values) => {
          submitData = values
        },
      }
    )

    await formWithSubmit.submit()
    expect(submitData).toEqual({
      name: 'John',
      email: 'john@example.com',
    })
  })

  it('应该正确处理字段级验证', async () => {
    const formWithFieldValidation = useForm(
      {
        name: '',
      },
      {
        fieldValidators: {
          name: (value) => {
            if (!value) return '姓名不能为空'
            if (value.length < 2) return '姓名至少2个字符'
            return true
          },
        },
      }
    )

    await formWithFieldValidation.validateField('name')
    expect(formWithFieldValidation.errors.value.name).toBe('姓名不能为空')

    formWithFieldValidation.setFieldValue('name', 'A')
    await formWithFieldValidation.validateField('name')
    expect(formWithFieldValidation.errors.value.name).toBe('姓名至少2个字符')

    formWithFieldValidation.setFieldValue('name', 'John')
    await formWithFieldValidation.validateField('name')
    expect(formWithFieldValidation.errors.value.name).toBeUndefined()
  })

  it('应该正确计算表单状态', async () => {
    expect(form.isEmpty.value).toBe(true)
    expect(form.hasErrors.value).toBe(false)
    expect(form.isSubmitting.value).toBe(false)

    form.setFieldValue('name', 'John')
    await nextTick()
    expect(form.isEmpty.value).toBe(false)

    form.setFieldError('name', '错误')
    await nextTick()
    expect(form.hasErrors.value).toBe(true)
  })

  it('应该正确处理数组字段', async () => {
    const arrayForm = useForm({
      items: ['item1', 'item2'],
    })

    arrayForm.setFieldValue('items.0', 'new item1')
    await nextTick()
    expect(arrayForm.values.value.items[0]).toBe('new item1')

    arrayForm.setFieldValue('items.2', 'item3')
    await nextTick()
    expect(arrayForm.values.value.items[2]).toBe('item3')
  })

  it('应该正确处理嵌套对象字段', async () => {
    const nestedForm = useForm({
      user: {
        profile: {
          name: '',
          age: 0,
        },
      },
    })

    nestedForm.setFieldValue('user.profile.name', 'John')
    await nextTick()
    expect(nestedForm.values.value.user.profile.name).toBe('John')

    nestedForm.setFieldValue('user.profile.age', 25)
    await nextTick()
    expect(nestedForm.values.value.user.profile.age).toBe(25)
  })
})
