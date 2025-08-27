/**
 * FormField 组件测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import FormField from '../components/FormField.vue'
import type { FormFieldConfig } from '../../types'

describe('FormField', () => {
  let wrapper: VueWrapper
  let mockFieldConfig: FormFieldConfig

  beforeEach(() => {
    mockFieldConfig = {
      type: 'input',
      name: 'username',
      label: '用户名',
      component: 'input',
      required: true,
      placeholder: '请输入用户名',
      help: '用户名用于登录系统'
    }
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('组件渲染', () => {
    it('应该正确渲染字段', () => {
      wrapper = mount(FormField, {
        props: {
          config: mockFieldConfig,
          value: ''
        }
      })

      expect(wrapper.find('.l-form-field').exists()).toBe(true)
      expect(wrapper.find('.l-form-field__label').text()).toBe('用户名')
      expect(wrapper.find('input').exists()).toBe(true)
    })

    it('应该显示必填标识', () => {
      wrapper = mount(FormField, {
        props: {
          config: mockFieldConfig,
          value: ''
        }
      })

      const requiredMark = wrapper.find('.l-form-field__required')
      expect(requiredMark.exists()).toBe(true)
      expect(requiredMark.text()).toBe('*')
    })

    it('应该显示帮助文本', () => {
      wrapper = mount(FormField, {
        props: {
          config: mockFieldConfig,
          value: '',
          showHelp: true
        }
      })

      const helpText = wrapper.find('.l-form-field__help')
      expect(helpText.exists()).toBe(true)
      expect(helpText.text()).toBe('用户名用于登录系统')
    })

    it('应该正确设置placeholder', () => {
      wrapper = mount(FormField, {
        props: {
          config: mockFieldConfig,
          value: ''
        }
      })

      const input = wrapper.find('input')
      expect(input.attributes('placeholder')).toBe('请输入用户名')
    })

    it('不显示标签时应该隐藏标签', () => {
      wrapper = mount(FormField, {
        props: {
          config: mockFieldConfig,
          value: '',
          showLabel: false
        }
      })

      const label = wrapper.find('.l-form-field__label')
      expect(label.exists()).toBe(false)
    })
  })

  describe('字段类型', () => {
    it('应该正确渲染输入框', () => {
      wrapper = mount(FormField, {
        props: {
          config: {
            ...mockFieldConfig,
            component: 'input'
          },
          value: ''
        }
      })

      expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    })

    it('应该正确渲染文本域', () => {
      wrapper = mount(FormField, {
        props: {
          config: {
            ...mockFieldConfig,
            component: 'textarea'
          },
          value: ''
        }
      })

      expect(wrapper.find('textarea').exists()).toBe(true)
    })

    it('应该正确渲染选择框', () => {
      wrapper = mount(FormField, {
        props: {
          config: {
            ...mockFieldConfig,
            component: 'select',
            props: {
              options: [
                { label: '选项1', value: '1' },
                { label: '选项2', value: '2' }
              ]
            }
          },
          value: ''
        }
      })

      expect(wrapper.find('select').exists()).toBe(true)
      const options = wrapper.findAll('option')
      expect(options).toHaveLength(3) // 包括空选项
    })

    it('应该正确渲染单选框', () => {
      wrapper = mount(FormField, {
        props: {
          config: {
            ...mockFieldConfig,
            component: 'radio',
            props: {
              options: [
                { label: '男', value: 'male' },
                { label: '女', value: 'female' }
              ]
            }
          },
          value: ''
        }
      })

      const radioInputs = wrapper.findAll('input[type="radio"]')
      expect(radioInputs).toHaveLength(2)
    })

    it('应该正确渲染复选框', () => {
      wrapper = mount(FormField, {
        props: {
          config: {
            ...mockFieldConfig,
            component: 'checkbox',
            props: {
              options: [
                { label: '选项1', value: '1' },
                { label: '选项2', value: '2' }
              ]
            }
          },
          value: []
        }
      })

      const checkboxInputs = wrapper.findAll('input[type="checkbox"]')
      expect(checkboxInputs).toHaveLength(2)
    })
  })

  describe('字段值', () => {
    it('应该正确显示字段值', () => {
      wrapper = mount(FormField, {
        props: {
          config: mockFieldConfig,
          value: 'testuser'
        }
      })

      const input = wrapper.find('input')
      expect(input.element.value).toBe('testuser')
    })

    it('应该正确更新字段值', async () => {
      wrapper = mount(FormField, {
        props: {
          config: mockFieldConfig,
          value: ''
        }
      })

      const input = wrapper.find('input')
      await input.setValue('newvalue')

      const emitted = wrapper.emitted('update:value')
      expect(emitted).toBeTruthy()
      expect(emitted![0][0]).toBe('newvalue')
    })

    it('应该响应外部值变化', async () => {
      wrapper = mount(FormField, {
        props: {
          config: mockFieldConfig,
          value: 'initial'
        }
      })

      await wrapper.setProps({ value: 'updated' })

      const input = wrapper.find('input')
      expect(input.element.value).toBe('updated')
    })
  })

  describe('字段状态', () => {
    it('应该正确显示禁用状态', () => {
      wrapper = mount(FormField, {
        props: {
          config: mockFieldConfig,
          value: '',
          disabled: true
        }
      })

      const field = wrapper.find('.l-form-field')
      const input = wrapper.find('input')
      
      expect(field.classes()).toContain('l-form-field--disabled')
      expect(input.attributes('disabled')).toBeDefined()
    })

    it('应该正确显示只读状态', () => {
      wrapper = mount(FormField, {
        props: {
          config: mockFieldConfig,
          value: '',
          readonly: true
        }
      })

      const field = wrapper.find('.l-form-field')
      const input = wrapper.find('input')
      
      expect(field.classes()).toContain('l-form-field--readonly')
      expect(input.attributes('readonly')).toBeDefined()
    })

    it('应该正确显示错误状态', () => {
      wrapper = mount(FormField, {
        props: {
          config: mockFieldConfig,
          value: '',
          hasError: true,
          errors: ['用户名不能为空']
        }
      })

      const field = wrapper.find('.l-form-field')
      const errorMessage = wrapper.find('.l-form-field__error')
      
      expect(field.classes()).toContain('l-form-field--error')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toBe('用户名不能为空')
    })

    it('应该正确显示多个错误信息', () => {
      wrapper = mount(FormField, {
        props: {
          config: mockFieldConfig,
          value: '',
          hasError: true,
          errors: ['用户名不能为空', '用户名格式不正确']
        }
      })

      const errorMessages = wrapper.findAll('.l-form-field__error')
      expect(errorMessages).toHaveLength(2)
      expect(errorMessages[0].text()).toBe('用户名不能为空')
      expect(errorMessages[1].text()).toBe('用户名格式不正确')
    })

    it('应该正确显示隐藏状态', () => {
      wrapper = mount(FormField, {
        props: {
          config: mockFieldConfig,
          value: '',
          hidden: true
        }
      })

      const field = wrapper.find('.l-form-field')
      expect(field.classes()).toContain('l-form-field--hidden')
      expect(field.isVisible()).toBe(false)
    })
  })

  describe('字段尺寸', () => {
    it('应该正确应用小尺寸', () => {
      wrapper = mount(FormField, {
        props: {
          config: mockFieldConfig,
          value: '',
          size: 'small'
        }
      })

      const field = wrapper.find('.l-form-field')
      expect(field.classes()).toContain('l-form-field--small')
    })

    it('应该正确应用大尺寸', () => {
      wrapper = mount(FormField, {
        props: {
          config: mockFieldConfig,
          value: '',
          size: 'large'
        }
      })

      const field = wrapper.find('.l-form-field')
      expect(field.classes()).toContain('l-form-field--large')
    })
  })

  describe('事件处理', () => {
    it('应该正确触发change事件', async () => {
      wrapper = mount(FormField, {
        props: {
          config: mockFieldConfig,
          value: ''
        }
      })

      const input = wrapper.find('input')
      await input.setValue('newvalue')
      await input.trigger('change')

      const changeEmitted = wrapper.emitted('change')
      expect(changeEmitted).toBeTruthy()
      expect(changeEmitted![0][0]).toBe('newvalue')
    })

    it('应该正确触发focus事件', async () => {
      wrapper = mount(FormField, {
        props: {
          config: mockFieldConfig,
          value: ''
        }
      })

      const input = wrapper.find('input')
      await input.trigger('focus')

      const focusEmitted = wrapper.emitted('focus')
      expect(focusEmitted).toBeTruthy()
    })

    it('应该正确触发blur事件', async () => {
      wrapper = mount(FormField, {
        props: {
          config: mockFieldConfig,
          value: ''
        }
      })

      const input = wrapper.find('input')
      await input.trigger('blur')

      const blurEmitted = wrapper.emitted('blur')
      expect(blurEmitted).toBeTruthy()
    })
  })

  describe('自定义属性', () => {
    it('应该正确传递自定义属性', () => {
      wrapper = mount(FormField, {
        props: {
          config: {
            ...mockFieldConfig,
            props: {
              maxlength: 20,
              autocomplete: 'username'
            }
          },
          value: ''
        }
      })

      const input = wrapper.find('input')
      expect(input.attributes('maxlength')).toBe('20')
      expect(input.attributes('autocomplete')).toBe('username')
    })

    it('应该正确应用自定义样式', () => {
      wrapper = mount(FormField, {
        props: {
          config: {
            ...mockFieldConfig,
            style: {
              color: 'red',
              fontSize: '16px'
            }
          },
          value: ''
        }
      })

      const field = wrapper.find('.l-form-field')
      const style = field.attributes('style')
      expect(style).toContain('color: red')
      expect(style).toContain('font-size: 16px')
    })

    it('应该正确应用自定义类名', () => {
      wrapper = mount(FormField, {
        props: {
          config: {
            ...mockFieldConfig,
            className: 'custom-field'
          },
          value: ''
        }
      })

      const field = wrapper.find('.l-form-field')
      expect(field.classes()).toContain('custom-field')
    })
  })

  describe('插槽支持', () => {
    it('应该正确渲染标签插槽', () => {
      wrapper = mount(FormField, {
        props: {
          config: mockFieldConfig,
          value: ''
        },
        slots: {
          label: '<span class="custom-label">自定义标签</span>'
        }
      })

      const customLabel = wrapper.find('.custom-label')
      expect(customLabel.exists()).toBe(true)
      expect(customLabel.text()).toBe('自定义标签')
    })

    it('应该正确渲染帮助插槽', () => {
      wrapper = mount(FormField, {
        props: {
          config: mockFieldConfig,
          value: '',
          showHelp: true
        },
        slots: {
          help: '<span class="custom-help">自定义帮助</span>'
        }
      })

      const customHelp = wrapper.find('.custom-help')
      expect(customHelp.exists()).toBe(true)
      expect(customHelp.text()).toBe('自定义帮助')
    })

    it('应该正确渲染错误插槽', () => {
      wrapper = mount(FormField, {
        props: {
          config: mockFieldConfig,
          value: '',
          hasError: true,
          errors: ['错误信息']
        },
        slots: {
          error: '<span class="custom-error">自定义错误</span>'
        }
      })

      const customError = wrapper.find('.custom-error')
      expect(customError.exists()).toBe(true)
      expect(customError.text()).toBe('自定义错误')
    })
  })
})
