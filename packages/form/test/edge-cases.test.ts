/**
 * Vue表单布局系统 - 边界情况和错误处理测试
 * 
 * 测试边界情况和错误处理，包括：
 * - 异常输入处理
 * - 边界值测试
 * - 错误恢复机制
 * - 内存泄漏检测
 * - 兼容性测试
 * 
 * @author ldesign团队
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'

import { useFormLayout } from '../src/composables/useFormLayout'
import FormLayout from '../src/components/FormLayout.vue'
import FormItem from '../src/components/FormItem.vue'
import type { FormFieldConfig } from '../src/types'

// ==================== 异常输入处理测试 ====================

describe('异常输入处理测试', () => {
  it('应该处理空配置', () => {
    // 测试空字段数组
    expect(() => {
      useFormLayout({ fields: [] })
    }).not.toThrow()

    // 测试undefined配置
    expect(() => {
      useFormLayout(undefined as any)
    }).not.toThrow()

    // 测试null配置
    expect(() => {
      useFormLayout(null as any)
    }).not.toThrow()
  })

  it('应该处理无效字段配置', () => {
    const invalidFields = [
      null,
      undefined,
      {},
      { name: null },
      { name: '', label: '空名称' },
      { name: 'valid', label: null },
      { name: 'valid', label: '', type: 'invalid' as any }
    ]

    expect(() => {
      useFormLayout({ fields: invalidFields as any })
    }).not.toThrow()

    // 验证只有有效字段被处理
    const { visibleFields } = useFormLayout({ fields: invalidFields as any })
    expect(visibleFields.value.length).toBeLessThan(invalidFields.length)
  })

  it('应该处理循环引用的对象', () => {
    const circularObj: any = { name: 'test' }
    circularObj.self = circularObj

    const { setFieldValue, getFieldValue } = useFormLayout({
      fields: [{ name: 'circular', label: '循环引用', type: 'input' }]
    })

    // 设置循环引用对象应该不会导致栈溢出
    expect(() => {
      setFieldValue('circular', circularObj)
    }).not.toThrow()

    // 获取值应该能正常工作
    const value = getFieldValue('circular')
    expect(value).toBe(circularObj)
  })

  it('应该处理非常大的表单数据', () => {
    const largeString = 'a'.repeat(100000) // 100KB字符串
    const largeObject = Object.fromEntries(
      Array.from({ length: 10000 }, (_, i) => [`key${i}`, `value${i}`])
    )

    const { setFieldValue, getFieldValue } = useFormLayout({
      fields: [
        { name: 'largeString', label: '大字符串', type: 'textarea' },
        { name: 'largeObject', label: '大对象', type: 'input' }
      ]
    })

    expect(() => {
      setFieldValue('largeString', largeString)
      setFieldValue('largeObject', largeObject)
    }).not.toThrow()

    expect(getFieldValue('largeString')).toBe(largeString)
    expect(getFieldValue('largeObject')).toBe(largeObject)
  })

  it('应该处理特殊字符和路径', () => {
    const specialPaths = [
      'field.with.dots',
      'field[0].array',
      'field["with"]["brackets"]',
      'field[\'with\'][\'quotes\']',
      'field-with-dashes',
      'field_with_underscores',
      'field$with$dollars',
      'field@with@symbols',
      '中文字段名',
      'field with spaces'
    ]

    const { setFieldValue, getFieldValue } = useFormLayout({
      fields: specialPaths.map(path => ({
        name: path,
        label: `字段 ${path}`,
        type: 'input' as const
      }))
    })

    specialPaths.forEach(path => {
      expect(() => {
        setFieldValue(path, `value-for-${path}`)
      }).not.toThrow()

      expect(getFieldValue(path)).toBe(`value-for-${path}`)
    })
  })
})

// ==================== 边界值测试 ====================

describe('边界值测试', () => {
  it('应该处理极端数值', () => {
    const extremeValues = [
      Number.MAX_VALUE,
      Number.MIN_VALUE,
      Number.MAX_SAFE_INTEGER,
      Number.MIN_SAFE_INTEGER,
      Infinity,
      -Infinity,
      NaN
    ]

    const { setFieldValue, getFieldValue } = useFormLayout({
      fields: [{ name: 'number', label: '数字', type: 'number' }]
    })

    extremeValues.forEach(value => {
      setFieldValue('number', value)
      const retrievedValue = getFieldValue('number')
      
      if (Number.isNaN(value)) {
        expect(Number.isNaN(retrievedValue)).toBe(true)
      } else {
        expect(retrievedValue).toBe(value)
      }
    })
  })

  it('应该处理极端日期', () => {
    const extremeDates = [
      new Date(0), // Unix 纪元
      new Date(8640000000000000), // 最大有效日期
      new Date(-8640000000000000), // 最小有效日期
      new Date('invalid'), // 无效日期
      new Date('1000-01-01'),
      new Date('9999-12-31')
    ]

    const { setFieldValue, getFieldValue } = useFormLayout({
      fields: [{ name: 'date', label: '日期', type: 'date' }]
    })

    extremeDates.forEach(date => {
      setFieldValue('date', date)
      const retrievedDate = getFieldValue('date')
      
      if (isNaN(date.getTime())) {
        expect(isNaN(retrievedDate.getTime())).toBe(true)
      } else {
        expect(retrievedDate).toEqual(date)
      }
    })
  })

  it('应该处理极大数组', () => {
    const largeArray = new Array(100000).fill(0).map((_, i) => i)
    
    const { setFieldValue, getFieldValue } = useFormLayout({
      fields: [{ name: 'array', label: '数组', type: 'input' }]
    })

    expect(() => {
      setFieldValue('array', largeArray)
    }).not.toThrow()

    expect(getFieldValue('array')).toEqual(largeArray)
  })

  it('应该处理深层嵌套对象', () => {
    // 创建深层嵌套对象
    let deepObject: any = {}
    let current = deepObject
    for (let i = 0; i < 1000; i++) {
      current.level = i
      current.next = {}
      current = current.next
    }

    const { setFieldValue, getFieldValue } = useFormLayout({
      fields: [{ name: 'deep', label: '深层对象', type: 'input' }]
    })

    expect(() => {
      setFieldValue('deep', deepObject)
    }).not.toThrow()

    expect(getFieldValue('deep')).toEqual(deepObject)
  })
})

// ==================== 错误恢复机制测试 ====================

describe('错误恢复机制测试', () => {
  it('应该从验证错误中恢复', async () => {
    const errorValidator = vi.fn().mockImplementation((value) => {
      if (value === 'error') {
        throw new Error('验证器内部错误')
      }
      return value === 'valid'
    })

    const { setFieldValue, validateField, errors } = useFormLayout({
      fields: [{
        name: 'test',
        label: '测试字段',
        type: 'input',
        rules: [{ validator: errorValidator, message: '验证失败' }]
      }]
    })

    // 触发验证器错误
    setFieldValue('test', 'error')
    const result1 = await validateField('test')

    // 验证错误被捕获
    expect(result1).toBe(false)
    expect(errors.value.test).toBeTruthy()

    // 恢复正常验证
    setFieldValue('test', 'valid')
    const result2 = await validateField('test')

    expect(result2).toBe(true)
    expect(errors.value.test).toBeFalsy()
  })

  it('应该处理异步验证超时', async () => {
    const timeoutValidator = vi.fn().mockImplementation(() => {
      return new Promise(() => {
        // 永不resolve的Promise，模拟超时
      })
    })

    const { setFieldValue, validateField } = useFormLayout({
      fields: [{
        name: 'timeout',
        label: '超时字段',
        type: 'input',
        rules: [{ validator: timeoutValidator, message: '验证超时' }]
      }],
      validationTimeout: 100 // 100ms超时
    })

    setFieldValue('timeout', 'test')
    
    const startTime = Date.now()
    const result = await validateField('timeout')
    const endTime = Date.now()

    // 验证在超时时间内完成
    expect(endTime - startTime).toBeLessThan(200)
    expect(result).toBe(false) // 超时应该返回验证失败
  })

  it('应该从组件销毁中正确清理', () => {
    const wrapper = mount(FormLayout, {
      props: {
        options: {
          fields: [{ name: 'test', label: '测试', type: 'input' }]
        },
        modelValue: {}
      }
    })

    // 模拟一些操作
    const formLayoutVm = wrapper.vm as any
    formLayoutVm.setFieldValue('test', 'value')

    // 销毁组件
    wrapper.unmount()

    // 验证没有内存泄漏或错误
    expect(() => {
      formLayoutVm.setFieldValue('test', 'new-value')
    }).not.toThrow()
  })
})

// ==================== 内存泄漏检测 ====================

describe('内存泄漏检测', () => {
  it('应该正确清理事件监听器', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const wrapper = mount(FormLayout, {
      props: {
        options: {
          fields: [{ name: 'test', label: '测试', type: 'input' }],
          responsive: true
        },
        modelValue: {}
      }
    })

    // 验证添加了事件监听器
    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))

    // 销毁组件
    wrapper.unmount()

    // 验证移除了事件监听器
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))

    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
  })

  it('应该清理定时器', async () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')

    const { expand, collapse } = useFormLayout({
      fields: Array.from({ length: 10 }, (_, i) => ({
        name: `field${i}`,
        label: `字段${i}`,
        type: 'input' as const
      })),
      defaultRows: 2,
      animation: { duration: 100 }
    })

    // 开始动画
    const expandPromise = expand()
    const collapsePromise = collapse() // 立即取消

    await Promise.all([expandPromise, collapsePromise])

    // 验证清理了定时器
    expect(clearTimeoutSpy).toHaveBeenCalled()

    clearTimeoutSpy.mockRestore()
  })

  it('应该释放大型数据结构', () => {
    const largeData = new Array(100000).fill(0).map((_, i) => ({
      id: i,
      data: `item-${i}`,
      nested: { value: i * 2 }
    }))

    const { setFieldValue, reset, formData } = useFormLayout({
      fields: [{ name: 'large', label: '大数据', type: 'input' }]
    })

    setFieldValue('large', largeData)
    expect(formData.value.large).toBe(largeData)

    // 重置应该释放大型数据
    reset()
    expect(formData.value.large).toBeUndefined()
  })
})

// ==================== 兼容性测试 ====================

describe('兼容性测试', () => {
  it('应该处理旧版本浏览器API', () => {
    // 模拟不支持ResizeObserver的环境
    const originalResizeObserver = global.ResizeObserver
    delete (global as any).ResizeObserver

    expect(() => {
      mount(FormLayout, {
        props: {
          options: {
            fields: [{ name: 'test', label: '测试', type: 'input' }],
            responsive: true
          },
          modelValue: {}
        }
      })
    }).not.toThrow()

    // 恢复ResizeObserver
    global.ResizeObserver = originalResizeObserver
  })

  it('应该处理不同的Vue版本API', () => {
    // 测试不同的响应式API使用方式
    const wrapper = mount({
      template: '<form-layout :options="options" v-model="formData" />',
      components: { FormLayout },
      setup() {
        const formData = ref({})
        const options = {
          fields: [
            { name: 'name', label: '姓名', type: 'input' as const },
            { name: 'email', label: '邮箱', type: 'input' as const }
          ]
        }
        return { formData, options }
      }
    })

    expect(wrapper.find('.fl-form-layout').exists()).toBe(true)
  })

  it('应该处理SSR环境', () => {
    // 模拟SSR环境（没有window对象）
    const originalWindow = global.window
    delete (global as any).window

    expect(() => {
      useFormLayout({
        fields: [{ name: 'test', label: '测试', type: 'input' }],
        responsive: true
      })
    }).not.toThrow()

    // 恢复window对象
    global.window = originalWindow
  })

  it('应该处理不同的数据类型', () => {
    const { setFieldValue, getFieldValue } = useFormLayout({
      fields: [{ name: 'mixed', label: '混合类型', type: 'input' }]
    })

    const testValues = [
      null,
      undefined,
      true,
      false,
      0,
      -1,
      1.5,
      '',
      'string',
      [],
      [1, 2, 3],
      {},
      { key: 'value' },
      new Date(),
      /regex/,
      () => 'function',
      Symbol('symbol')
    ]

    testValues.forEach(value => {
      expect(() => {
        setFieldValue('mixed', value)
        const retrieved = getFieldValue('mixed')
        expect(retrieved).toBe(value)
      }).not.toThrow()
    })
  })
})

// ==================== 错误边界测试 ====================

describe('错误边界测试', () => {
  it('应该捕获渲染错误', () => {
    const ErrorComponent = {
      template: '<div>{{ nonExistentProperty.nested.value }}</div>'
    }

    expect(() => {
      mount(FormItem, {
        props: {
          name: 'error',
          label: '错误组件'
        },
        slots: {
          default: () => mount(ErrorComponent).html()
        }
      })
    }).not.toThrow()
  })

  it('应该处理Props类型错误', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // 传入错误类型的props
    expect(() => {
      mount(FormLayout, {
        props: {
          modelValue: 'not-an-object' as any,
          options: 'not-an-options-object' as any,
          columns: 'not-a-number' as any,
          labelWidth: true as any
        }
      })
    }).not.toThrow()

    consoleErrorSpy.mockRestore()
  })

  it('应该处理插槽内容错误', () => {
    expect(() => {
      mount(FormItem, {
        props: {
          name: 'test',
          label: '测试'
        },
        slots: {
          default: () => null,
          label: () => undefined,
          help: () => ({} as any) // 无效的插槽内容
        }
      })
    }).not.toThrow()
  })
})
