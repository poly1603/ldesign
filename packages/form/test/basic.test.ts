/**
 * Vue表单布局系统 - 基础功能测试
 * 
 * 测试核心功能的正确性，包括：
 * - Hook功能测试
 * - 数据操作测试
 * - 校验功能测试
 * - 工具函数测试
 * 
 * @author ldesign团队
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'

// 导入要测试的模块
import { useFormLayout } from '../src/composables/useFormLayout'
import FormLayout from '../src/components/FormLayout.vue'
import FormItem from '../src/components/FormItem.vue'

import {
  deepClone,
  deepMerge,
  getValueByPath,
  setValueByPath,
  validateFieldValue,
  isEmpty,
  getCurrentBreakpoint,
  generateClassName,
  filterVisibleFields
} from '../src/utils'

// ==================== 工具函数测试 ====================

describe('工具函数测试', () => {
  describe('deepClone', () => {
    it('应该正确克隆基础类型', () => {
      expect(deepClone(null)).toBe(null)
      expect(deepClone(undefined)).toBe(undefined)
      expect(deepClone(42)).toBe(42)
      expect(deepClone('hello')).toBe('hello')
      expect(deepClone(true)).toBe(true)
    })

    it('应该正确克隆对象', () => {
      const original = { a: 1, b: { c: 2 } }
      const cloned = deepClone(original)
      
      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
      expect(cloned.b).not.toBe(original.b)
    })

    it('应该正确克隆数组', () => {
      const original = [1, [2, 3], { a: 4 }]
      const cloned = deepClone(original)
      
      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
      expect(cloned[1]).not.toBe(original[1])
      expect(cloned[2]).not.toBe(original[2])
    })

    it('应该正确克隆日期对象', () => {
      const date = new Date('2023-01-01')
      const cloned = deepClone(date)
      
      expect(cloned).toEqual(date)
      expect(cloned).not.toBe(date)
      expect(cloned instanceof Date).toBe(true)
    })
  })

  describe('deepMerge', () => {
    it('应该正确合并简单对象', () => {
      const target = { a: 1, b: 2 }
      const source = { b: 3, c: 4 }
      const result = deepMerge(target, source)
      
      expect(result).toEqual({ a: 1, b: 3, c: 4 })
      expect(result).toBe(target) // 应该修改原对象
    })

    it('应该正确合并嵌套对象', () => {
      const target = { a: { x: 1, y: 2 }, b: 3 }
      const source = { a: { y: 4, z: 5 }, c: 6 }
      const result = deepMerge(target, source)
      
      expect(result).toEqual({
        a: { x: 1, y: 4, z: 5 },
        b: 3,
        c: 6
      })
    })

    it('应该处理多个源对象', () => {
      const target = { a: 1 }
      const source1 = { b: 2 }
      const source2 = { c: 3 }
      const result = deepMerge(target, source1, source2)
      
      expect(result).toEqual({ a: 1, b: 2, c: 3 })
    })
  })

  describe('getValueByPath', () => {
    const testObject = {
      a: 1,
      b: {
        c: {
          d: 'hello'
        },
        e: [1, 2, 3]
      }
    }

    it('应该获取简单属性值', () => {
      expect(getValueByPath(testObject, 'a')).toBe(1)
    })

    it('应该获取嵌套属性值', () => {
      expect(getValueByPath(testObject, 'b.c.d')).toBe('hello')
    })

    it('应该处理不存在的路径', () => {
      expect(getValueByPath(testObject, 'b.x.y')).toBe(undefined)
      expect(getValueByPath(testObject, 'b.x.y', 'default')).toBe('default')
    })

    it('应该处理空路径', () => {
      expect(getValueByPath(testObject, '')).toBe(undefined)
      expect(getValueByPath(null, 'a')).toBe(undefined)
    })
  })

  describe('setValueByPath', () => {
    it('应该设置简单属性', () => {
      const obj = { a: 1 }
      setValueByPath(obj, 'b', 2)
      expect(obj).toEqual({ a: 1, b: 2 })
    })

    it('应该设置嵌套属性', () => {
      const obj: any = {}
      setValueByPath(obj, 'a.b.c', 'hello')
      expect(obj).toEqual({ a: { b: { c: 'hello' } } })
    })

    it('应该覆盖现有属性', () => {
      const obj = { a: { b: 1 } }
      setValueByPath(obj, 'a.b', 2)
      expect(obj).toEqual({ a: { b: 2 } })
    })
  })

  describe('validateFieldValue', () => {
    it('应该通过空规则验证', async () => {
      const result = await validateFieldValue('test', [])
      expect(result.valid).toBe(true)
    })

    it('应该验证必填规则', async () => {
      const rules = [{ required: true, message: '此字段为必填项' }]
      
      const failResult = await validateFieldValue('', rules)
      expect(failResult.valid).toBe(false)
      expect(failResult.message).toBe('此字段为必填项')
      
      const passResult = await validateFieldValue('test', rules)
      expect(passResult.valid).toBe(true)
    })

    it('应该验证长度规则', async () => {
      const rules = [
        { min: 3, message: '最小长度为3' },
        { max: 10, message: '最大长度为10' }
      ]
      
      const minFailResult = await validateFieldValue('ab', rules)
      expect(minFailResult.valid).toBe(false)
      expect(minFailResult.message).toBe('最小长度为3')
      
      const maxFailResult = await validateFieldValue('abcdefghijk', rules)
      expect(maxFailResult.valid).toBe(false)
      expect(maxFailResult.message).toBe('最大长度为10')
      
      const passResult = await validateFieldValue('abcde', rules)
      expect(passResult.valid).toBe(true)
    })

    it('应该验证类型规则', async () => {
      const emailRules = [{ type: 'email' as const, message: '请输入正确的邮箱格式' }]
      
      const failResult = await validateFieldValue('invalid-email', emailRules)
      expect(failResult.valid).toBe(false)
      
      const passResult = await validateFieldValue('test@example.com', emailRules)
      expect(passResult.valid).toBe(true)
    })

    it('应该验证正则表达式规则', async () => {
      const rules = [{ pattern: /^\d+$/, message: '只能输入数字' }]
      
      const failResult = await validateFieldValue('abc123', rules)
      expect(failResult.valid).toBe(false)
      
      const passResult = await validateFieldValue('123', rules)
      expect(passResult.valid).toBe(true)
    })

    it('应该验证自定义规则', async () => {
      const rules = [{
        validator: (value: string) => value === 'valid',
        message: '值必须为valid'
      }]
      
      const failResult = await validateFieldValue('invalid', rules)
      expect(failResult.valid).toBe(false)
      
      const passResult = await validateFieldValue('valid', rules)
      expect(passResult.valid).toBe(true)
    })

    it('应该支持异步自定义规则', async () => {
      const rules = [{
        validator: (value: string) => {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(value === 'async-valid')
            }, 10)
          })
        },
        message: '异步验证失败'
      }]
      
      const failResult = await validateFieldValue('invalid', rules)
      expect(failResult.valid).toBe(false)
      
      const passResult = await validateFieldValue('async-valid', rules)
      expect(passResult.valid).toBe(true)
    })
  })

  describe('isEmpty', () => {
    it('应该正确判断空值', () => {
      expect(isEmpty(null)).toBe(true)
      expect(isEmpty(undefined)).toBe(true)
      expect(isEmpty('')).toBe(true)
      expect(isEmpty('   ')).toBe(true)
      expect(isEmpty([])).toBe(true)
      expect(isEmpty({})).toBe(true)
    })

    it('应该正确判断非空值', () => {
      expect(isEmpty('hello')).toBe(false)
      expect(isEmpty(0)).toBe(false)
      expect(isEmpty(false)).toBe(false)
      expect(isEmpty([1])).toBe(false)
      expect(isEmpty({ a: 1 })).toBe(false)
    })
  })

  describe('getCurrentBreakpoint', () => {
    it('应该返回正确的断点', () => {
      expect(getCurrentBreakpoint(500)).toBe('xs')
      expect(getCurrentBreakpoint(700)).toBe('sm')
      expect(getCurrentBreakpoint(900)).toBe('md')
      expect(getCurrentBreakpoint(1100)).toBe('lg')
      expect(getCurrentBreakpoint(1300)).toBe('xl')
    })
  })

  describe('generateClassName', () => {
    it('应该生成正确的类名', () => {
      expect(generateClassName('base')).toBe('base')
      expect(generateClassName('base', 'modifier')).toBe('base modifier')
      expect(generateClassName('base', { active: true, disabled: false }))
        .toBe('base active')
      expect(generateClassName('base', 'modifier', { active: true }))
        .toBe('base modifier active')
    })

    it('应该处理undefined值', () => {
      expect(generateClassName('base', undefined, 'modifier')).toBe('base modifier')
    })
  })

  describe('filterVisibleFields', () => {
    const fields = [
      { name: 'field1', show: true },
      { name: 'field2', show: false },
      { name: 'field3', show: (data: any) => data.showField3 },
      { name: 'field4' } // 没有show属性，默认显示
    ]

    it('应该过滤可见字段', () => {
      const formData = { showField3: true }
      const visible = filterVisibleFields(fields as any, formData)
      
      expect(visible).toHaveLength(3)
      expect(visible.map(f => f.name)).toEqual(['field1', 'field3', 'field4'])
    })

    it('应该处理动态显示条件', () => {
      const formData = { showField3: false }
      const visible = filterVisibleFields(fields as any, formData)
      
      expect(visible).toHaveLength(2)
      expect(visible.map(f => f.name)).toEqual(['field1', 'field4'])
    })
  })
})

// ==================== useFormLayout Hook 测试 ====================

describe('useFormLayout Hook 测试', () => {
  // 模拟窗口对象
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    })

    // 模拟ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation((callback) => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('应该初始化默认配置', () => {
    const { formData, layoutInfo } = useFormLayout({
      fields: [
        { name: 'username', label: '用户名' },
        { name: 'email', label: '邮箱' }
      ]
    })

    expect(formData.value).toEqual({})
    expect(layoutInfo.value.columns).toBe(4) // 默认4列
    expect(layoutInfo.value.isExpanded).toBe(false)
  })

  it('应该正确设置和获取字段值', () => {
    const { setFieldValue, getFieldValue, formData } = useFormLayout({
      fields: [{ name: 'username', label: '用户名' }]
    })

    setFieldValue('username', 'test-user')
    expect(getFieldValue('username')).toBe('test-user')
    expect(formData.value.username).toBe('test-user')
  })

  it('应该正确处理嵌套字段', () => {
    const { setFieldValue, getFieldValue } = useFormLayout({
      fields: [{ name: 'user.profile.name', label: '用户姓名' }]
    })

    setFieldValue('user.profile.name', 'John Doe')
    expect(getFieldValue('user.profile.name')).toBe('John Doe')
  })

  it('应该正确设置多个字段值', () => {
    const { setFieldsValue, getFieldsValue } = useFormLayout({
      fields: [
        { name: 'username', label: '用户名' },
        { name: 'email', label: '邮箱' }
      ]
    })

    setFieldsValue({ username: 'test', email: 'test@example.com' })
    const values = getFieldsValue()
    
    expect(values.username).toBe('test')
    expect(values.email).toBe('test@example.com')
  })

  it('应该正确处理表单校验', async () => {
    const { validate, errors, hasErrors } = useFormLayout({
      fields: [
        {
          name: 'username',
          label: '用户名',
          rules: [{ required: true, message: '用户名不能为空' }]
        }
      ],
      initialValues: { username: '' }
    })

    const result = await validate()
    expect(result).toBe(false)
    expect(hasErrors.value).toBe(true)
    expect(errors.value.username).toBe('用户名不能为空')
  })

  it('应该正确处理单个字段校验', async () => {
    const { setFieldValue, validateField, errors } = useFormLayout({
      fields: [
        {
          name: 'email',
          label: '邮箱',
          rules: [{ type: 'email', message: '邮箱格式不正确' }]
        }
      ]
    })

    setFieldValue('email', 'invalid-email')
    const result = await validateField('email')
    
    expect(result).toBe(false)
    expect(errors.value.email).toBe('邮箱格式不正确')
  })

  it('应该正确处理表单重置', () => {
    const { setFieldValue, reset, formData } = useFormLayout({
      fields: [
        { name: 'username', label: '用户名', defaultValue: 'default' }
      ],
      initialValues: { username: 'initial' }
    })

    setFieldValue('username', 'changed')
    expect(formData.value.username).toBe('changed')

    reset()
    expect(formData.value.username).toBe('initial')
  })

  it('应该正确处理展开收起', async () => {
    const { expand, collapse, isExpanded, isAnimating } = useFormLayout({
      fields: Array.from({ length: 10 }, (_, i) => ({
        name: `field${i}`,
        label: `字段${i}`
      })),
      defaultRows: 2
    })

    expect(isExpanded.value).toBe(false)

    await expand()
    expect(isExpanded.value).toBe(true)

    await collapse()
    expect(isExpanded.value).toBe(false)
  })
})

// ==================== 组件测试 ====================

describe('FormLayout 组件测试', () => {
  it('应该渲染基本表单布局', () => {
    const wrapper = mount(FormLayout, {
      props: {
        modelValue: { username: 'test' }
      },
      slots: {
        default: () => [
          mount(FormItem, {
            props: { name: 'username', label: '用户名' },
            slots: {
              default: () => '<input type="text" />'
            }
          }).html()
        ]
      }
    })

    expect(wrapper.find('.fl-form-layout').exists()).toBe(true)
    expect(wrapper.find('.fl-form-items').exists()).toBe(true)
  })

  it('应该应用正确的CSS类名', () => {
    const wrapper = mount(FormLayout, {
      props: {
        labelPosition: 'top',
        size: 'large',
        className: 'custom-class'
      }
    })

    const formLayout = wrapper.find('.fl-form-layout')
    expect(formLayout.classes()).toContain('fl-form-layout--label-top')
    expect(formLayout.classes()).toContain('fl-form-layout--size-large')
    expect(formLayout.classes()).toContain('custom-class')
  })

  it('应该正确处理Options模式', () => {
    const options = {
      fields: [
        { name: 'username', label: '用户名', type: 'input' as const },
        { name: 'email', label: '邮箱', type: 'input' as const }
      ]
    }

    const wrapper = mount(FormLayout, {
      props: { options }
    })

    expect(wrapper.findAllComponents(FormItem)).toHaveLength(2)
  })

  it('应该触发正确的事件', async () => {
    const wrapper = mount(FormLayout, {
      props: {
        modelValue: {}
      }
    })

    const formLayout = wrapper.vm as any

    // 测试提交事件
    await formLayout.handleSubmit()
    expect(wrapper.emitted('submit')).toBeTruthy()

    // 测试重置事件
    formLayout.handleReset()
    expect(wrapper.emitted('reset')).toBeTruthy()
  })
})

describe('FormItem 组件测试', () => {
  it('应该渲染基本表单项', () => {
    const wrapper = mount(FormItem, {
      props: {
        name: 'username',
        label: '用户名'
      },
      slots: {
        default: () => '<input type="text" />'
      }
    })

    expect(wrapper.find('.fl-form-item').exists()).toBe(true)
    expect(wrapper.find('.fl-form-item-label').exists()).toBe(true)
    expect(wrapper.find('.fl-form-item-control').exists()).toBe(true)
  })

  it('应该显示必填标记', () => {
    const wrapper = mount(FormItem, {
      props: {
        name: 'username',
        label: '用户名',
        required: true
      },
      slots: {
        default: () => '<input type="text" />'
      }
    })

    expect(wrapper.find('.fl-form-item-required').exists()).toBe(true)
  })

  it('应该显示错误信息', () => {
    const wrapper = mount(FormItem, {
      props: {
        name: 'username',
        label: '用户名',
        error: '用户名不能为空'
      },
      slots: {
        default: () => '<input type="text" />'
      }
    })

    expect(wrapper.find('.fl-form-item-error').exists()).toBe(true)
    expect(wrapper.find('.fl-form-item-error').text()).toBe('用户名不能为空')
  })

  it('应该处理跨列布局', () => {
    const wrapper = mount(FormItem, {
      props: {
        name: 'description',
        label: '描述',
        span: 2
      },
      slots: {
        default: () => '<textarea></textarea>'
      }
    })

    expect(wrapper.find('.fl-form-item').classes()).toContain('fl-form-item--span-2')
  })

  it('应该支持自定义标题插槽', () => {
    const wrapper = mount(FormItem, {
      props: {
        name: 'custom',
        label: '自定义'
      },
      slots: {
        label: () => '<span class="custom-label">自定义标题</span>',
        default: () => '<input type="text" />'
      }
    })

    expect(wrapper.find('.custom-label').exists()).toBe(true)
    expect(wrapper.find('.custom-label').text()).toBe('自定义标题')
  })
})
