/**
 * Vue表单布局系统 - 集成测试
 * 
 * 测试复杂场景和组件之间的集成，包括：
 * - 表单完整流程测试
 * - 响应式布局测试
 * - 嵌套表单测试
 * - 动态字段测试
 * - 联动效果测试
 * 
 * @author ldesign团队
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { mount, VueWrapper } from '@vue/test-utils'

import { useFormLayout } from '../src/composables/useFormLayout'
import FormLayout from '../src/components/FormLayout.vue'
import FormItem from '../src/components/FormItem.vue'
import type { FormLayoutOptions, FormFieldConfig } from '../src/types'

// ==================== 表单完整流程测试 ====================

describe('表单完整流程测试', () => {
  it('应该完成用户注册表单的完整流程', async () => {
    const mockSubmit = vi.fn()
    const mockReset = vi.fn()

    const fields: FormFieldConfig[] = [
      {
        name: 'username',
        label: '用户名',
        type: 'input',
        rules: [
          { required: true, message: '用户名不能为空' },
          { min: 3, message: '用户名至少3个字符' },
          { max: 20, message: '用户名最多20个字符' }
        ]
      },
      {
        name: 'email',
        label: '邮箱',
        type: 'input',
        rules: [
          { required: true, message: '邮箱不能为空' },
          { type: 'email', message: '邮箱格式不正确' }
        ]
      },
      {
        name: 'password',
        label: '密码',
        type: 'input',
        rules: [
          { required: true, message: '密码不能为空' },
          { min: 6, message: '密码至少6个字符' },
          { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: '密码必须包含大小写字母和数字' }
        ]
      },
      {
        name: 'confirmPassword',
        label: '确认密码',
        type: 'input',
        rules: [
          { required: true, message: '请确认密码' },
          {
            validator: (value, formData) => {
              return value === formData.password
            },
            message: '两次密码输入不一致'
          }
        ]
      },
      {
        name: 'age',
        label: '年龄',
        type: 'number',
        rules: [
          { required: true, message: '年龄不能为空' },
          { type: 'number', min: 18, max: 100, message: '年龄必须在18-100之间' }
        ]
      }
    ]

    const wrapper = mount(FormLayout, {
      props: {
        options: { fields },
        modelValue: {}
      }
    })

    // 1. 验证初始状态
    expect(wrapper.find('.fl-form-layout').exists()).toBe(true)
    expect(wrapper.findAllComponents(FormItem)).toHaveLength(5)

    // 2. 模拟用户输入
    const usernameInput = wrapper.find('input[name="username"]')
    const emailInput = wrapper.find('input[name="email"]')
    const passwordInput = wrapper.find('input[name="password"]')
    const confirmPasswordInput = wrapper.find('input[name="confirmPassword"]')
    const ageInput = wrapper.find('input[name="age"]')

    // 输入无效数据
    await usernameInput.setValue('ab') // 太短
    await emailInput.setValue('invalid-email') // 邮箱格式错误
    await passwordInput.setValue('123') // 密码太简单
    await confirmPasswordInput.setValue('456') // 密码不一致
    await ageInput.setValue('15') // 年龄太小

    // 触发验证
    const formLayoutVm = wrapper.vm as any
    const isValid = await formLayoutVm.validate()

    // 3. 验证错误状态
    expect(isValid).toBe(false)
    expect(wrapper.findAll('.fl-form-item-error')).toHaveLength(5)

    // 4. 输入正确数据
    await usernameInput.setValue('testuser')
    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('Password123')
    await confirmPasswordInput.setValue('Password123')
    await ageInput.setValue('25')

    // 再次验证
    const isValidAgain = await formLayoutVm.validate()
    
    // 5. 验证成功状态
    expect(isValidAgain).toBe(true)
    expect(wrapper.findAll('.fl-form-item-error')).toHaveLength(0)

    // 6. 模拟提交
    const submitBtn = wrapper.find('.fl-form-button--primary')
    await submitBtn.trigger('click')

    // 验证提交事件
    expect(wrapper.emitted('submit')).toBeTruthy()
    const submitEvent = wrapper.emitted('submit')![0]
    expect(submitEvent[0]).toMatchObject({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      age: '25'
    })

    // 7. 模拟重置
    const resetBtn = wrapper.find('.fl-form-button--secondary')
    await resetBtn.trigger('click')

    // 验证重置事件
    expect(wrapper.emitted('reset')).toBeTruthy()
  })

  it('应该处理异步验证和提交', async () => {
    const asyncValidator = vi.fn().mockImplementation((value: string) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(value !== 'taken-username')
        }, 100)
      })
    })

    const asyncSubmit = vi.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(resolve, 100)
      })
    })

    const fields: FormFieldConfig[] = [
      {
        name: 'username',
        label: '用户名',
        type: 'input',
        rules: [
          { required: true, message: '用户名不能为空' },
          { validator: asyncValidator, message: '用户名已被占用' }
        ]
      }
    ]

    const wrapper = mount(FormLayout, {
      props: {
        options: { fields },
        modelValue: {},
        onSubmit: asyncSubmit
      }
    })

    const usernameInput = wrapper.find('input[name="username"]')
    const formLayoutVm = wrapper.vm as any

    // 测试异步验证失败
    await usernameInput.setValue('taken-username')
    
    // 验证进行中的状态
    const validationPromise = formLayoutVm.validateField('username')
    expect(wrapper.find('.fl-form-item--validating').exists()).toBe(true)

    const isValid = await validationPromise
    expect(isValid).toBe(false)
    expect(wrapper.find('.fl-form-item-error').text()).toBe('用户名已被占用')

    // 测试异步验证成功
    await usernameInput.setValue('available-username')
    await formLayoutVm.validateField('username')
    
    expect(wrapper.find('.fl-form-item-error').exists()).toBe(false)

    // 测试异步提交
    const submitBtn = wrapper.find('.fl-form-button--primary')
    await submitBtn.trigger('click')

    // 验证提交状态
    expect(wrapper.find('.fl-form-layout--submitting').exists()).toBe(true)

    // 等待异步提交完成
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 150))

    expect(asyncSubmit).toHaveBeenCalled()
  })
})

// ==================== 响应式布局测试 ====================

describe('响应式布局测试', () => {
  beforeEach(() => {
    // 模拟ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation((callback) => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }))
  })

  it('应该根据屏幕尺寸调整布局', async () => {
    const fields = Array.from({ length: 8 }, (_, i) => ({
      name: `field${i}`,
      label: `字段${i}`,
      type: 'input' as const
    }))

    const wrapper = mount(FormLayout, {
      props: {
        options: {
          fields,
          responsive: {
            xs: { columns: 1 },
            sm: { columns: 2 },
            md: { columns: 3 },
            lg: { columns: 4 }
          }
        },
        modelValue: {}
      }
    })

    const formLayoutVm = wrapper.vm as any

    // 模拟不同屏幕尺寸
    const testSizes = [
      { width: 500, expectedColumns: 1, breakpoint: 'xs' },
      { width: 700, expectedColumns: 2, breakpoint: 'sm' },
      { width: 900, expectedColumns: 3, breakpoint: 'md' },
      { width: 1200, expectedColumns: 4, breakpoint: 'lg' }
    ]

    for (const { width, expectedColumns, breakpoint } of testSizes) {
      // 模拟窗口大小变化
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width
      })

      // 触发响应式更新
      formLayoutVm.updateResponsiveLayout()
      await nextTick()

      // 验证布局变化
      expect(formLayoutVm.layoutInfo.columns).toBe(expectedColumns)
      expect(formLayoutVm.layoutInfo.breakpoint).toBe(breakpoint)
      
      const formItems = wrapper.find('.fl-form-items')
      expect(formItems.attributes('style')).toContain(`--fl-columns: ${expectedColumns}`)
    }
  })

  it('应该正确处理字段跨列', () => {
    const fields: FormFieldConfig[] = [
      { name: 'field1', label: '字段1', type: 'input' },
      { name: 'field2', label: '字段2', type: 'input', span: 2 },
      { name: 'field3', label: '字段3', type: 'input' },
      { name: 'field4', label: '字段4', type: 'textarea', span: 4 }
    ]

    const wrapper = mount(FormLayout, {
      props: {
        options: { fields, columns: 4 },
        modelValue: {}
      }
    })

    const formItems = wrapper.findAllComponents(FormItem)
    
    // 验证跨列设置
    expect(formItems[1].props('span')).toBe(2)
    expect(formItems[3].props('span')).toBe(4)
    
    // 验证CSS类
    expect(formItems[1].find('.fl-form-item--span-2').exists()).toBe(true)
    expect(formItems[3].find('.fl-form-item--span-4').exists()).toBe(true)
  })
})

// ==================== 动态字段测试 ====================

describe('动态字段测试', () => {
  it('应该根据条件显示隐藏字段', async () => {
    const fields: FormFieldConfig[] = [
      {
        name: 'userType',
        label: '用户类型',
        type: 'select',
        options: [
          { label: '个人用户', value: 'personal' },
          { label: '企业用户', value: 'business' }
        ]
      },
      {
        name: 'personalName',
        label: '姓名',
        type: 'input',
        show: (data) => data.userType === 'personal'
      },
      {
        name: 'companyName',
        label: '公司名称',
        type: 'input',
        show: (data) => data.userType === 'business'
      },
      {
        name: 'companyCode',
        label: '企业代码',
        type: 'input',
        show: (data) => data.userType === 'business'
      }
    ]

    const wrapper = mount(FormLayout, {
      props: {
        options: { fields },
        modelValue: {}
      }
    })

    // 初始状态，只显示用户类型选择
    expect(wrapper.findAllComponents(FormItem)).toHaveLength(1)

    // 选择个人用户
    const formLayoutVm = wrapper.vm as any
    formLayoutVm.setFieldValue('userType', 'personal')
    await nextTick()

    // 应该显示个人姓名字段
    expect(wrapper.findAllComponents(FormItem)).toHaveLength(2)
    expect(wrapper.find('input[name="personalName"]').exists()).toBe(true)

    // 切换到企业用户
    formLayoutVm.setFieldValue('userType', 'business')
    await nextTick()

    // 应该显示企业相关字段
    expect(wrapper.findAllComponents(FormItem)).toHaveLength(3)
    expect(wrapper.find('input[name="companyName"]').exists()).toBe(true)
    expect(wrapper.find('input[name="companyCode"]').exists()).toBe(true)
    expect(wrapper.find('input[name="personalName"]').exists()).toBe(false)
  })

  it('应该支持动态添加删除字段', async () => {
    const { formData, addField, removeField, visibleFields } = useFormLayout({
      fields: [
        { name: 'name', label: '姓名', type: 'input' }
      ]
    })

    expect(visibleFields.value).toHaveLength(1)

    // 动态添加字段
    addField({
      name: 'email',
      label: '邮箱',
      type: 'input',
      rules: [{ type: 'email', message: '邮箱格式不正确' }]
    })

    expect(visibleFields.value).toHaveLength(2)
    expect(visibleFields.value[1].name).toBe('email')

    // 动态删除字段
    removeField('email')

    expect(visibleFields.value).toHaveLength(1)
    expect(visibleFields.value.find(f => f.name === 'email')).toBeUndefined()
  })
})

// ==================== 字段联动测试 ====================

describe('字段联动测试', () => {
  it('应该实现省市联动', async () => {
    const cityOptions = {
      '北京': ['朝阳区', '海淀区', '东城区'],
      '上海': ['黄浦区', '静安区', '徐汇区'],
      '广东': ['广州市', '深圳市', '珠海市']
    }

    const fields: FormFieldConfig[] = [
      {
        name: 'province',
        label: '省份',
        type: 'select',
        options: Object.keys(cityOptions).map(key => ({ label: key, value: key }))
      },
      {
        name: 'city',
        label: '城市',
        type: 'select',
        options: (data) => {
          const province = data.province
          if (!province || !cityOptions[province]) return []
          return cityOptions[province].map(city => ({ label: city, value: city }))
        },
        disabled: (data) => !data.province
      }
    ]

    const wrapper = mount(FormLayout, {
      props: {
        options: { fields },
        modelValue: {}
      }
    })

    const formLayoutVm = wrapper.vm as any
    
    // 初始状态，城市选择应该被禁用
    expect(wrapper.find('select[name="city"]').attributes('disabled')).toBeDefined()

    // 选择省份
    formLayoutVm.setFieldValue('province', '北京')
    await nextTick()

    // 城市选择应该启用，并有对应选项
    expect(wrapper.find('select[name="city"]').attributes('disabled')).toBeUndefined()
    const cityOptions = wrapper.find('select[name="city"]').findAll('option')
    expect(cityOptions).toHaveLength(4) // 包含空选项
    expect(cityOptions[1].text()).toBe('朝阳区')

    // 切换省份
    formLayoutVm.setFieldValue('province', '上海')
    await nextTick()

    // 城市选项应该更新
    const newCityOptions = wrapper.find('select[name="city"]').findAll('option')
    expect(newCityOptions[1].text()).toBe('黄浦区')
    
    // 之前选择的城市值应该被清空
    expect(formLayoutVm.getFieldValue('city')).toBeFalsy()
  })

  it('应该实现依赖字段验证', async () => {
    const fields: FormFieldConfig[] = [
      {
        name: 'startDate',
        label: '开始日期',
        type: 'date'
      },
      {
        name: 'endDate',
        label: '结束日期',
        type: 'date',
        rules: [
          {
            validator: (value, formData) => {
              if (!value || !formData.startDate) return true
              return new Date(value) > new Date(formData.startDate)
            },
            message: '结束日期必须晚于开始日期'
          }
        ]
      }
    ]

    const { setFieldValue, validateField, errors } = useFormLayout({
      fields
    })

    // 设置无效的日期范围
    setFieldValue('startDate', '2023-12-01')
    setFieldValue('endDate', '2023-11-01')

    const isValid = await validateField('endDate')
    expect(isValid).toBe(false)
    expect(errors.value.endDate).toBe('结束日期必须晚于开始日期')

    // 设置正确的日期范围
    setFieldValue('endDate', '2023-12-15')
    const isValidNow = await validateField('endDate')
    expect(isValidNow).toBe(true)
    expect(errors.value.endDate).toBeFalsy()
  })
})

// ==================== 复杂场景测试 ====================

describe('复杂场景测试', () => {
  it('应该处理嵌套表单数据', async () => {
    const fields: FormFieldConfig[] = [
      { name: 'user.basic.name', label: '姓名', type: 'input' },
      { name: 'user.basic.email', label: '邮箱', type: 'input' },
      { name: 'user.profile.avatar', label: '头像', type: 'input' },
      { name: 'user.profile.bio', label: '个人简介', type: 'textarea' },
      { name: 'settings.theme', label: '主题', type: 'select', options: [
        { label: '亮色', value: 'light' },
        { label: '暗色', value: 'dark' }
      ]},
      { name: 'settings.notifications.email', label: '邮件通知', type: 'checkbox' },
      { name: 'settings.notifications.sms', label: '短信通知', type: 'checkbox' }
    ]

    const { setFieldsValue, getFieldsValue, formData } = useFormLayout({
      fields
    })

    // 设置嵌套数据
    const testData = {
      'user.basic.name': 'John Doe',
      'user.basic.email': 'john@example.com',
      'user.profile.avatar': 'avatar.jpg',
      'user.profile.bio': 'Software Developer',
      'settings.theme': 'dark',
      'settings.notifications.email': true,
      'settings.notifications.sms': false
    }

    setFieldsValue(testData)

    // 验证数据结构
    const allValues = getFieldsValue()
    expect(allValues).toEqual(testData)

    // 验证内部数据结构是嵌套的
    expect(formData.value).toMatchObject({
      user: {
        basic: {
          name: 'John Doe',
          email: 'john@example.com'
        },
        profile: {
          avatar: 'avatar.jpg',
          bio: 'Software Developer'
        }
      },
      settings: {
        theme: 'dark',
        notifications: {
          email: true,
          sms: false
        }
      }
    })
  })

  it('应该支持表单数组', async () => {
    const fields: FormFieldConfig[] = [
      { name: 'users[0].name', label: '用户1姓名', type: 'input' },
      { name: 'users[0].email', label: '用户1邮箱', type: 'input' },
      { name: 'users[1].name', label: '用户2姓名', type: 'input' },
      { name: 'users[1].email', label: '用户2邮箱', type: 'input' },
      { name: 'tags[0]', label: '标签1', type: 'input' },
      { name: 'tags[1]', label: '标签2', type: 'input' }
    ]

    const { setFieldsValue, formData } = useFormLayout({
      fields
    })

    setFieldsValue({
      'users[0].name': 'Alice',
      'users[0].email': 'alice@example.com',
      'users[1].name': 'Bob',
      'users[1].email': 'bob@example.com',
      'tags[0]': 'frontend',
      'tags[1]': 'vue'
    })

    // 验证数组结构
    expect(formData.value).toMatchObject({
      users: [
        { name: 'Alice', email: 'alice@example.com' },
        { name: 'Bob', email: 'bob@example.com' }
      ],
      tags: ['frontend', 'vue']
    })
  })

  it('应该处理大量字段的性能', async () => {
    const fields = Array.from({ length: 1000 }, (_, i) => ({
      name: `field_${i}`,
      label: `字段 ${i}`,
      type: 'input' as const,
      defaultValue: `value_${i}`
    }))

    const startTime = performance.now()

    const { formData, setFieldsValue, validate } = useFormLayout({
      fields
    })

    const initTime = performance.now()

    // 批量设置值
    const values = Object.fromEntries(
      fields.map((field, i) => [field.name, `new_value_${i}`])
    )
    
    setFieldsValue(values)

    const updateTime = performance.now()

    // 验证所有字段
    await validate()

    const validateTime = performance.now()

    // 性能断言
    expect(initTime - startTime).toBeLessThan(100) // 初始化应在100ms内
    expect(updateTime - initTime).toBeLessThan(50)  // 批量更新应在50ms内
    expect(validateTime - updateTime).toBeLessThan(200) // 验证应在200ms内

    // 功能验证
    expect(formData.value.field_0).toBe('new_value_0')
    expect(formData.value.field_999).toBe('new_value_999')
  }, 10000) // 给测试10秒超时时间
})
