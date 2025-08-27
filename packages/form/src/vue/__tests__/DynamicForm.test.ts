/**
 * DynamicForm 组件测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import DynamicForm from '../components/DynamicForm.vue'
import type { FormConfig } from '../../types'

describe('DynamicForm', () => {
  let wrapper: VueWrapper
  let mockConfig: FormConfig

  beforeEach(() => {
    mockConfig = {
      fields: [
        {
          type: 'input',
          name: 'username',
          label: '用户名',
          component: 'input',
          required: true,
          rules: [
            { type: 'required', message: '用户名不能为空' }
          ]
        },
        {
          type: 'input',
          name: 'email',
          label: '邮箱',
          component: 'input',
          rules: [
            { type: 'email', message: '请输入有效的邮箱地址' }
          ]
        },
        {
          type: 'actions',
          buttons: [
            { type: 'submit', text: '提交' },
            { type: 'reset', text: '重置' }
          ]
        }
      ],
      layout: {
        type: 'grid',
        columns: 2,
        gap: 16
      }
    }
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('组件渲染', () => {
    it('应该正确渲染表单', () => {
      wrapper = mount(DynamicForm, {
        props: {
          config: mockConfig
        }
      })

      expect(wrapper.find('.l-dynamic-form').exists()).toBe(true)
      expect(wrapper.find('.l-dynamic-form__fields').exists()).toBe(true)
    })

    it('应该渲染所有字段', () => {
      wrapper = mount(DynamicForm, {
        props: {
          config: mockConfig
        }
      })

      const fields = wrapper.findAll('.l-form-field')
      expect(fields).toHaveLength(2) // 不包括actions
    })

    it('应该渲染操作按钮', () => {
      wrapper = mount(DynamicForm, {
        props: {
          config: mockConfig
        }
      })

      const actions = wrapper.find('.l-form-actions')
      expect(actions.exists()).toBe(true)
      
      const buttons = actions.findAll('button')
      expect(buttons).toHaveLength(2)
      expect(buttons[0].text()).toBe('提交')
      expect(buttons[1].text()).toBe('重置')
    })

    it('应该应用正确的布局样式', () => {
      wrapper = mount(DynamicForm, {
        props: {
          config: mockConfig
        }
      })

      const fieldsContainer = wrapper.find('.l-dynamic-form__fields')
      const style = fieldsContainer.attributes('style')
      
      expect(style).toContain('grid-template-columns: repeat(2, 1fr)')
      expect(style).toContain('gap: 16px')
    })
  })

  describe('表单数据', () => {
    it('应该正确设置初始数据', () => {
      const initialData = {
        username: 'testuser',
        email: 'test@example.com'
      }

      wrapper = mount(DynamicForm, {
        props: {
          config: mockConfig,
          modelValue: initialData
        }
      })

      const usernameInput = wrapper.find('input[name="username"]')
      const emailInput = wrapper.find('input[name="email"]')
      
      expect(usernameInput.element.value).toBe('testuser')
      expect(emailInput.element.value).toBe('test@example.com')
    })

    it('应该正确更新表单数据', async () => {
      wrapper = mount(DynamicForm, {
        props: {
          config: mockConfig,
          modelValue: {}
        }
      })

      const usernameInput = wrapper.find('input[name="username"]')
      await usernameInput.setValue('newuser')

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
      expect(emitted![emitted!.length - 1][0]).toEqual(
        expect.objectContaining({ username: 'newuser' })
      )
    })

    it('应该响应外部数据变化', async () => {
      wrapper = mount(DynamicForm, {
        props: {
          config: mockConfig,
          modelValue: { username: 'initial' }
        }
      })

      await wrapper.setProps({
        modelValue: { username: 'updated', email: 'new@example.com' }
      })

      const usernameInput = wrapper.find('input[name="username"]')
      const emailInput = wrapper.find('input[name="email"]')
      
      expect(usernameInput.element.value).toBe('updated')
      expect(emailInput.element.value).toBe('new@example.com')
    })
  })

  describe('表单验证', () => {
    it('应该在提交时验证表单', async () => {
      wrapper = mount(DynamicForm, {
        props: {
          config: mockConfig,
          modelValue: { username: '', email: 'invalid-email' }
        }
      })

      const submitButton = wrapper.find('button[type="submit"]')
      await submitButton.trigger('click')

      // 验证应该失败，不应该触发submit事件
      const submitEmitted = wrapper.emitted('submit')
      expect(submitEmitted).toBeFalsy()

      // 应该显示错误信息
      await wrapper.vm.$nextTick()
      const errorMessages = wrapper.findAll('.l-form-field__error')
      expect(errorMessages.length).toBeGreaterThan(0)
    })

    it('有效数据应该成功提交', async () => {
      wrapper = mount(DynamicForm, {
        props: {
          config: mockConfig,
          modelValue: { username: 'testuser', email: 'test@example.com' }
        }
      })

      const submitButton = wrapper.find('button[type="submit"]')
      await submitButton.trigger('click')

      // 应该触发submit事件
      const submitEmitted = wrapper.emitted('submit')
      expect(submitEmitted).toBeTruthy()
      expect(submitEmitted![0][0]).toEqual({
        username: 'testuser',
        email: 'test@example.com'
      })
    })

    it('应该在字段变化时进行验证', async () => {
      wrapper = mount(DynamicForm, {
        props: {
          config: mockConfig,
          modelValue: {},
          validateOnChange: true
        }
      })

      const usernameInput = wrapper.find('input[name="username"]')
      await usernameInput.setValue('')
      await usernameInput.trigger('blur')

      // 应该显示必填错误
      await wrapper.vm.$nextTick()
      const errorMessage = wrapper.find('.l-form-field__error')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toContain('用户名不能为空')
    })
  })

  describe('表单操作', () => {
    it('应该正确重置表单', async () => {
      wrapper = mount(DynamicForm, {
        props: {
          config: mockConfig,
          modelValue: { username: 'testuser', email: 'test@example.com' }
        }
      })

      const resetButton = wrapper.find('button[type="reset"]')
      await resetButton.trigger('click')

      // 应该触发reset事件
      const resetEmitted = wrapper.emitted('reset')
      expect(resetEmitted).toBeTruthy()

      // 表单数据应该被清空
      const updateEmitted = wrapper.emitted('update:modelValue')
      const lastUpdate = updateEmitted![updateEmitted!.length - 1][0]
      expect(lastUpdate).toEqual({})
    })

    it('应该正确处理自定义按钮点击', async () => {
      const configWithCustomButton = {
        ...mockConfig,
        fields: [
          ...mockConfig.fields.slice(0, -1), // 移除原有的actions
          {
            type: 'actions',
            buttons: [
              { type: 'custom', text: '自定义', action: 'custom-action' }
            ]
          }
        ]
      }

      wrapper = mount(DynamicForm, {
        props: {
          config: configWithCustomButton,
          modelValue: {}
        }
      })

      const customButton = wrapper.find('button')
      await customButton.trigger('click')

      // 应该触发action事件
      const actionEmitted = wrapper.emitted('action')
      expect(actionEmitted).toBeTruthy()
      expect(actionEmitted![0][0]).toBe('custom-action')
    })
  })

  describe('响应式布局', () => {
    it('应该根据容器宽度调整布局', async () => {
      wrapper = mount(DynamicForm, {
        props: {
          config: {
            ...mockConfig,
            layout: {
              type: 'grid',
              responsive: {
                enabled: true,
                breakpoints: {
                  xs: { value: 0, name: 'xs', columns: 1 },
                  md: { value: 768, name: 'md', columns: 2 }
                }
              }
            }
          }
        }
      })

      // 模拟容器宽度变化
      const formElement = wrapper.find('.l-dynamic-form')
      Object.defineProperty(formElement.element, 'offsetWidth', {
        value: 500,
        writable: true
      })

      // 触发resize事件
      window.dispatchEvent(new Event('resize'))
      await wrapper.vm.$nextTick()

      // 应该使用小屏幕布局（1列）
      const fieldsContainer = wrapper.find('.l-dynamic-form__fields')
      const style = fieldsContainer.attributes('style')
      expect(style).toContain('grid-template-columns: repeat(1, 1fr)')
    })
  })

  describe('事件处理', () => {
    it('应该正确触发字段变化事件', async () => {
      wrapper = mount(DynamicForm, {
        props: {
          config: mockConfig,
          modelValue: {}
        }
      })

      const usernameInput = wrapper.find('input[name="username"]')
      await usernameInput.setValue('testuser')

      // 应该触发field-change事件
      const fieldChangeEmitted = wrapper.emitted('field-change')
      expect(fieldChangeEmitted).toBeTruthy()
      expect(fieldChangeEmitted![0][0]).toEqual({
        field: 'username',
        value: 'testuser',
        oldValue: ''
      })
    })

    it('应该正确触发验证事件', async () => {
      wrapper = mount(DynamicForm, {
        props: {
          config: mockConfig,
          modelValue: { username: '', email: 'invalid' }
        }
      })

      const submitButton = wrapper.find('button[type="submit"]')
      await submitButton.trigger('click')

      // 应该触发validation事件
      const validationEmitted = wrapper.emitted('validation')
      expect(validationEmitted).toBeTruthy()
      expect(validationEmitted![0][0]).toEqual(
        expect.objectContaining({
          valid: false,
          fields: expect.any(Object)
        })
      )
    })
  })

  describe('插槽支持', () => {
    it('应该正确渲染字段插槽', () => {
      wrapper = mount(DynamicForm, {
        props: {
          config: mockConfig,
          modelValue: {}
        },
        slots: {
          'field-username': '<div class="custom-username">自定义用户名字段</div>'
        }
      })

      const customField = wrapper.find('.custom-username')
      expect(customField.exists()).toBe(true)
      expect(customField.text()).toBe('自定义用户名字段')
    })

    it('应该正确渲染操作插槽', () => {
      wrapper = mount(DynamicForm, {
        props: {
          config: mockConfig,
          modelValue: {}
        },
        slots: {
          actions: '<div class="custom-actions">自定义操作</div>'
        }
      })

      const customActions = wrapper.find('.custom-actions')
      expect(customActions.exists()).toBe(true)
      expect(customActions.text()).toBe('自定义操作')
    })
  })

  describe('加载状态', () => {
    it('应该正确显示加载状态', () => {
      wrapper = mount(DynamicForm, {
        props: {
          config: mockConfig,
          modelValue: {},
          loading: true
        }
      })

      const loadingElement = wrapper.find('.l-dynamic-form--loading')
      expect(loadingElement.exists()).toBe(true)

      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.attributes('disabled')).toBeDefined()
    })

    it('应该在提交时显示加载状态', async () => {
      wrapper = mount(DynamicForm, {
        props: {
          config: mockConfig,
          modelValue: { username: 'test', email: 'test@example.com' }
        }
      })

      const submitButton = wrapper.find('button[type="submit"]')
      await submitButton.trigger('click')

      // 提交期间应该显示加载状态
      expect(wrapper.find('.l-dynamic-form--submitting').exists()).toBe(true)
      expect(submitButton.attributes('disabled')).toBeDefined()
    })
  })
})
