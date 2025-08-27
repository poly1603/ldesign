/**
 * 表单工具函数测试
 */

import { describe, it, expect } from 'vitest'
import {
  flattenFormFields,
  getFieldPath,
  findFieldByPath,
  getFormFieldNames,
  getRequiredFieldNames,
  getVisibleFieldNames,
  createDefaultFormData,
  validateFormDataIntegrity,
  cleanFormData,
  isFormDataEqual,
  getFormDataChanges,
  resetFormData,
  mergeFormData,
  getFieldDisplayValue
} from '../form-utils'
import type { FormFieldItem, FormFieldConfig, FormGroupConfig } from '../../types'

describe('form-utils', () => {
  const mockFields: FormFieldItem[] = [
    {
      type: 'input',
      name: 'username',
      label: '用户名',
      component: 'input',
      required: true,
      defaultValue: 'default-user'
    },
    {
      type: 'input',
      name: 'email',
      label: '邮箱',
      component: 'input',
      hidden: false
    },
    {
      type: 'group',
      name: 'profile',
      title: '个人信息',
      fields: [
        {
          type: 'input',
          name: 'firstName',
          label: '名',
          component: 'input',
          required: true
        },
        {
          type: 'input',
          name: 'lastName',
          label: '姓',
          component: 'input',
          hidden: (data: any) => !data.showLastName
        }
      ]
    },
    {
      type: 'select',
      name: 'gender',
      label: '性别',
      component: 'select',
      defaultValue: 'male',
      props: {
        options: [
          { label: '男', value: 'male' },
          { label: '女', value: 'female' }
        ]
      }
    }
  ]

  describe('flattenFormFields', () => {
    it('应该正确扁平化表单字段', () => {
      const flattened = flattenFormFields(mockFields)
      
      expect(flattened).toHaveLength(5)
      expect(flattened.map(f => f.name)).toEqual([
        'username',
        'email',
        'profile.firstName',
        'profile.lastName',
        'gender'
      ])
    })

    it('应该处理嵌套分组', () => {
      const nestedFields: FormFieldItem[] = [
        {
          type: 'group',
          name: 'level1',
          title: '一级分组',
          fields: [
            {
              type: 'group',
              name: 'level2',
              title: '二级分组',
              fields: [
                {
                  type: 'input',
                  name: 'nested',
                  label: '嵌套字段',
                  component: 'input'
                }
              ]
            }
          ]
        }
      ]

      const flattened = flattenFormFields(nestedFields)
      expect(flattened[0].name).toBe('level1.level2.nested')
    })

    it('应该忽略actions类型字段', () => {
      const fieldsWithActions: FormFieldItem[] = [
        ...mockFields,
        {
          type: 'actions',
          buttons: [{ type: 'submit', text: '提交' }]
        }
      ]

      const flattened = flattenFormFields(fieldsWithActions)
      expect(flattened).toHaveLength(5) // 不包括actions
    })
  })

  describe('getFieldPath', () => {
    it('应该正确生成字段路径', () => {
      const field: FormFieldConfig = {
        type: 'input',
        name: 'test',
        component: 'input'
      }

      expect(getFieldPath(field)).toBe('test')
      expect(getFieldPath(field, 'parent')).toBe('parent.test')
      expect(getFieldPath(field, 'grand.parent')).toBe('grand.parent.test')
    })
  })

  describe('findFieldByPath', () => {
    it('应该正确查找顶级字段', () => {
      const field = findFieldByPath(mockFields, 'username')
      expect(field).toBeTruthy()
      expect(field?.name).toBe('username')
    })

    it('应该正确查找嵌套字段', () => {
      const field = findFieldByPath(mockFields, 'profile.firstName')
      expect(field).toBeTruthy()
      expect(field?.name).toBe('firstName')
    })

    it('不存在的字段应该返回null', () => {
      const field = findFieldByPath(mockFields, 'nonexistent')
      expect(field).toBeNull()
    })

    it('不存在的嵌套字段应该返回null', () => {
      const field = findFieldByPath(mockFields, 'profile.nonexistent')
      expect(field).toBeNull()
    })
  })

  describe('getFormFieldNames', () => {
    it('应该正确获取所有字段名', () => {
      const fieldNames = getFormFieldNames(mockFields)
      expect(fieldNames).toEqual([
        'username',
        'email',
        'profile.firstName',
        'profile.lastName',
        'gender'
      ])
    })
  })

  describe('getRequiredFieldNames', () => {
    it('应该正确获取必填字段名', () => {
      const requiredFields = getRequiredFieldNames(mockFields)
      expect(requiredFields).toEqual([
        'username',
        'profile.firstName'
      ])
    })

    it('应该处理函数类型的required', () => {
      const fieldsWithFunctionRequired: FormFieldItem[] = [
        {
          type: 'input',
          name: 'conditional',
          component: 'input',
          required: (data: any) => data.needsConditional
        }
      ]

      const requiredFields1 = getRequiredFieldNames(fieldsWithFunctionRequired, {})
      expect(requiredFields1).toEqual([])

      const requiredFields2 = getRequiredFieldNames(fieldsWithFunctionRequired, { needsConditional: true })
      expect(requiredFields2).toEqual(['conditional'])
    })
  })

  describe('getVisibleFieldNames', () => {
    it('应该正确获取可见字段名', () => {
      const visibleFields = getVisibleFieldNames(mockFields, { showLastName: true })
      expect(visibleFields).toEqual([
        'username',
        'email',
        'profile.firstName',
        'profile.lastName',
        'gender'
      ])
    })

    it('应该处理隐藏字段', () => {
      const visibleFields = getVisibleFieldNames(mockFields, { showLastName: false })
      expect(visibleFields).toEqual([
        'username',
        'email',
        'profile.firstName',
        'gender'
      ])
    })
  })

  describe('createDefaultFormData', () => {
    it('应该正确创建默认表单数据', () => {
      const defaultData = createDefaultFormData(mockFields)
      expect(defaultData).toEqual({
        username: 'default-user',
        gender: 'male',
        profile: {
          firstName: undefined,
          lastName: undefined
        }
      })
    })
  })

  describe('validateFormDataIntegrity', () => {
    it('完整数据应该通过验证', () => {
      const formData = {
        username: 'test',
        email: 'test@example.com',
        profile: {
          firstName: 'John',
          lastName: 'Doe'
        },
        gender: 'male'
      }

      const result = validateFormDataIntegrity(mockFields, formData)
      expect(result.valid).toBe(true)
      expect(result.missingFields).toEqual([])
      expect(result.extraFields).toEqual([])
    })

    it('缺少字段应该被检测', () => {
      const formData = {
        username: 'test'
      }

      const result = validateFormDataIntegrity(mockFields, formData)
      expect(result.valid).toBe(false)
      expect(result.missingFields).toContain('email')
      expect(result.missingFields).toContain('profile.firstName')
    })

    it('额外字段应该被检测', () => {
      const formData = {
        username: 'test',
        email: 'test@example.com',
        profile: {
          firstName: 'John',
          lastName: 'Doe'
        },
        gender: 'male',
        extraField: 'extra'
      }

      const result = validateFormDataIntegrity(mockFields, formData)
      expect(result.valid).toBe(false)
      expect(result.extraFields).toContain('extraField')
    })
  })

  describe('cleanFormData', () => {
    it('应该正确清理表单数据', () => {
      const dirtyData = {
        username: 'test',
        email: 'test@example.com',
        profile: {
          firstName: 'John',
          lastName: 'Doe'
        },
        gender: 'male',
        extraField: 'extra',
        anotherExtra: 'another'
      }

      const cleanedData = cleanFormData(mockFields, dirtyData)
      expect(cleanedData).toEqual({
        username: 'test',
        email: 'test@example.com',
        profile: {
          firstName: 'John',
          lastName: 'Doe'
        },
        gender: 'male'
      })
    })
  })

  describe('isFormDataEqual', () => {
    it('相同数据应该返回true', () => {
      const data1 = { username: 'test', profile: { name: 'John' } }
      const data2 = { username: 'test', profile: { name: 'John' } }
      
      expect(isFormDataEqual(data1, data2)).toBe(true)
    })

    it('不同数据应该返回false', () => {
      const data1 = { username: 'test1', profile: { name: 'John' } }
      const data2 = { username: 'test2', profile: { name: 'John' } }
      
      expect(isFormDataEqual(data1, data2)).toBe(false)
    })

    it('应该正确比较数组', () => {
      const data1 = { tags: ['a', 'b', 'c'] }
      const data2 = { tags: ['a', 'b', 'c'] }
      const data3 = { tags: ['a', 'b', 'd'] }
      
      expect(isFormDataEqual(data1, data2)).toBe(true)
      expect(isFormDataEqual(data1, data3)).toBe(false)
    })
  })

  describe('getFormDataChanges', () => {
    it('应该正确检测数据变更', () => {
      const originalData = {
        username: 'old',
        email: 'old@example.com',
        profile: { name: 'Old Name' }
      }

      const currentData = {
        username: 'new',
        email: 'old@example.com',
        profile: { name: 'New Name' },
        newField: 'new value'
      }

      const changes = getFormDataChanges(originalData, currentData)
      expect(changes.changed).toContain('username')
      expect(changes.changed).toContain('profile.name')
      expect(changes.added).toContain('newField')
      expect(changes.removed).toEqual([])
    })

    it('应该正确检测删除的字段', () => {
      const originalData = {
        username: 'test',
        email: 'test@example.com',
        removedField: 'will be removed'
      }

      const currentData = {
        username: 'test',
        email: 'test@example.com'
      }

      const changes = getFormDataChanges(originalData, currentData)
      expect(changes.removed).toContain('removedField')
    })
  })

  describe('resetFormData', () => {
    it('应该正确重置表单数据', () => {
      const currentData = {
        username: 'current',
        email: 'current@example.com',
        extraField: 'extra'
      }

      const resetData = resetFormData(mockFields, currentData)
      expect(resetData).toEqual({
        username: 'default-user',
        gender: 'male'
      })
    })
  })

  describe('mergeFormData', () => {
    it('应该正确合并表单数据', () => {
      const data1 = { username: 'test1', profile: { name: 'Name1' } }
      const data2 = { email: 'test@example.com', profile: { age: 25 } }
      const data3 = { username: 'test3' }

      const merged = mergeFormData(data1, data2, data3)
      expect(merged).toEqual({
        username: 'test3',
        email: 'test@example.com',
        profile: {
          name: 'Name1',
          age: 25
        }
      })
    })
  })

  describe('getFieldDisplayValue', () => {
    it('应该正确获取输入框显示值', () => {
      const field: FormFieldConfig = {
        type: 'input',
        name: 'test',
        component: 'input'
      }

      expect(getFieldDisplayValue(field, 'test value')).toBe('test value')
      expect(getFieldDisplayValue(field, null)).toBe('')
      expect(getFieldDisplayValue(field, undefined)).toBe('')
    })

    it('应该正确获取选择框显示值', () => {
      const field: FormFieldConfig = {
        type: 'select',
        name: 'test',
        component: 'select',
        props: {
          options: [
            { label: '选项1', value: '1' },
            { label: '选项2', value: '2' }
          ]
        }
      }

      expect(getFieldDisplayValue(field, '1')).toBe('选项1')
      expect(getFieldDisplayValue(field, '3')).toBe('3') // 未找到对应选项
    })

    it('应该正确获取多选框显示值', () => {
      const field: FormFieldConfig = {
        type: 'checkbox',
        name: 'test',
        component: 'checkbox',
        props: {
          options: [
            { label: '选项1', value: '1' },
            { label: '选项2', value: '2' },
            { label: '选项3', value: '3' }
          ]
        }
      }

      expect(getFieldDisplayValue(field, ['1', '3'])).toBe('选项1, 选项3')
      expect(getFieldDisplayValue(field, [])).toBe('')
    })

    it('应该正确获取开关显示值', () => {
      const field: FormFieldConfig = {
        type: 'switch',
        name: 'test',
        component: 'switch'
      }

      expect(getFieldDisplayValue(field, true)).toBe('是')
      expect(getFieldDisplayValue(field, false)).toBe('否')
    })

    it('应该使用自定义格式化函数', () => {
      const field: FormFieldConfig = {
        type: 'input',
        name: 'test',
        component: 'input',
        formatter: (value: any) => `格式化: ${value}`
      }

      expect(getFieldDisplayValue(field, 'test')).toBe('格式化: test')
    })
  })
})
