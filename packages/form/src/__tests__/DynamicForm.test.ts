// DynamicForm 组件测试

import type { FormOptions } from '../types/form'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import DynamicForm from '../components/DynamicForm.vue'

describe('dynamicForm', () => {
  let formOptions: FormOptions

  beforeEach(() => {
    formOptions = {
      fields: [
        {
          name: 'username',
          title: '用户名',
          component: 'FormInput',
          required: true,
          rules: [{ type: 'required', message: '用户名不能为空' }],
        },
        {
          name: 'email',
          title: '邮箱',
          component: 'FormInput',
          type: 'email',
          rules: [{ type: 'email', message: '请输入有效的邮箱地址' }],
        },
        {
          name: 'age',
          title: '年龄',
          component: 'FormInput',
          type: 'number',
          rules: [{ type: 'min', params: 18, message: '年龄不能小于18岁' }],
        },
      ],
    }
  })

  describe('基础功能', () => {
    it('应该正确渲染表单', () => {
      const wrapper = mount(DynamicForm, {
        props: {
          options: formOptions,
        },
      })

      expect(wrapper.find('.dynamic-form').exists()).toBe(true)
      expect(wrapper.findAll('.form-item')).toHaveLength(3)
    })

    it('应该支持 v-model 双向绑定', async () => {
      const wrapper = mount(DynamicForm, {
        props: {
          options: formOptions,
          modelValue: { username: 'test' },
        },
      })

      // 检查初始值
      const usernameInput = wrapper.find('input[name="username"]')
      expect(usernameInput.element.value).toBe('test')

      // 修改值
      await usernameInput.setValue('newtest')
      await nextTick()

      // 检查事件是否触发
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      const emittedEvents = wrapper.emitted('update:modelValue') as any[]
      expect(emittedEvents[emittedEvents.length - 1][0]).toEqual(
        expect.objectContaining({ username: 'newtest' })
      )
    })

    it('应该支持禁用状态', () => {
      const wrapper = mount(DynamicForm, {
        props: {
          options: formOptions,
          disabled: true,
        },
      })

      const inputs = wrapper.findAll('input')
      inputs.forEach(input => {
        expect(input.element.disabled).toBe(true)
      })
    })

    it('应该支持只读状态', () => {
      const wrapper = mount(DynamicForm, {
        props: {
          options: formOptions,
          readonly: true,
        },
      })

      const inputs = wrapper.findAll('input')
      inputs.forEach(input => {
        expect(input.element.readOnly).toBe(true)
      })
    })
  })

  describe('表单验证', () => {
    it('应该在提交时验证表单', async () => {
      const wrapper = mount(DynamicForm, {
        props: {
          options: formOptions,
          modelValue: {},
        },
      })

      // 尝试提交空表单
      const submitButton = wrapper.find('button[type="submit"]')
      await submitButton.trigger('click')
      await nextTick()

      // 检查验证错误
      const errorMessages = wrapper.findAll('.form-item__error')
      expect(errorMessages.length).toBeGreaterThan(0)
      expect(errorMessages[0].text()).toContain('用户名不能为空')
    })

    it('应该在字段值改变时验证', async () => {
      const wrapper = mount(DynamicForm, {
        props: {
          options: {
            ...formOptions,
            validation: {
              validateOnChange: true,
            },
          },
          modelValue: {},
        },
      })

      const emailInput = wrapper.find('input[name="email"]')
      await emailInput.setValue('invalid-email')
      await nextTick()

      // 等待验证完成
      await new Promise(resolve => setTimeout(resolve, 100))
      await nextTick()

      const errorMessage = wrapper.find('.form-item__error')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toContain('请输入有效的邮箱地址')
    })

    it('应该显示验证成功状态', async () => {
      const wrapper = mount(DynamicForm, {
        props: {
          options: formOptions,
          modelValue: {
            username: 'testuser',
            email: 'test@example.com',
            age: 25,
          },
        },
      })

      // 触发验证
      const submitButton = wrapper.find('button[type="submit"]')
      await submitButton.trigger('click')
      await nextTick()

      // 检查是否没有错误
      const errorMessages = wrapper.findAll('.form-item__error')
      expect(errorMessages).toHaveLength(0)

      // 检查是否触发了提交事件
      expect(wrapper.emitted('submit')).toBeTruthy()
    })
  })

  describe('布局功能', () => {
    it('应该支持自定义列数', () => {
      const wrapper = mount(DynamicForm, {
        props: {
          options: {
            ...formOptions,
            layout: {
              columns: 2,
            },
          },
        },
      })

      const formGrid = wrapper.find('.dynamic-form__fields')
      expect(formGrid.element.style.gridTemplateColumns).toContain(
        'repeat(2, 1fr)'
      )
    })

    it('应该支持字段跨列', () => {
      const optionsWithSpan = {
        ...formOptions,
        fields: [
          ...formOptions.fields,
          {
            name: 'description',
            title: '描述',
            component: 'FormTextarea',
            span: 2,
          },
        ],
      }

      const wrapper = mount(DynamicForm, {
        props: {
          options: optionsWithSpan,
        },
      })

      const descriptionField = wrapper.find('[data-field="description"]')
      expect(descriptionField.element.style.gridColumn).toContain('span 2')
    })
  })

  describe('事件处理', () => {
    it('应该触发字段变化事件', async () => {
      const wrapper = mount(DynamicForm, {
        props: {
          options: formOptions,
          modelValue: {},
        },
      })

      const usernameInput = wrapper.find('input[name="username"]')
      await usernameInput.setValue('testuser')
      await nextTick()

      expect(wrapper.emitted('fieldChange')).toBeTruthy()
      const fieldChangeEvents = wrapper.emitted('fieldChange') as any[]
      expect(fieldChangeEvents[fieldChangeEvents.length - 1]).toEqual([
        'username',
        'testuser',
      ])
    })

    it('应该触发重置事件', async () => {
      const wrapper = mount(DynamicForm, {
        props: {
          options: formOptions,
          modelValue: { username: 'test' },
        },
      })

      const resetButton = wrapper.find('button[type="reset"]')
      await resetButton.trigger('click')
      await nextTick()

      expect(wrapper.emitted('reset')).toBeTruthy()
    })

    it('应该触发验证事件', async () => {
      const wrapper = mount(DynamicForm, {
        props: {
          options: formOptions,
          modelValue: {},
        },
      })

      const submitButton = wrapper.find('button[type="submit"]')
      await submitButton.trigger('click')
      await nextTick()

      expect(wrapper.emitted('validate')).toBeTruthy()
    })
  })

  describe('条件渲染', () => {
    it('应该支持字段条件显示', async () => {
      const conditionalOptions = {
        fields: [
          {
            name: 'hasAccount',
            title: '是否有账户',
            component: 'FormRadio',
            options: [
              { label: '是', value: true },
              { label: '否', value: false },
            ],
          },
          {
            name: 'accountType',
            title: '账户类型',
            component: 'FormSelect',
            options: [
              { label: '个人', value: 'personal' },
              { label: '企业', value: 'business' },
            ],
            conditionalRender: {
              dependsOn: 'hasAccount',
              condition: (values: any) => values.hasAccount === true,
            },
          },
        ],
      }

      const wrapper = mount(DynamicForm, {
        props: {
          options: conditionalOptions,
          modelValue: { hasAccount: false },
        },
      })

      // 账户类型字段应该隐藏
      expect(wrapper.find('[data-field="accountType"]').exists()).toBe(false)

      // 修改条件字段
      await wrapper.setProps({
        modelValue: { hasAccount: true },
      })
      await nextTick()

      // 账户类型字段应该显示
      expect(wrapper.find('[data-field="accountType"]').exists()).toBe(true)
    })
  })

  describe('主题支持', () => {
    it('应该支持主题切换', () => {
      const wrapper = mount(DynamicForm, {
        props: {
          options: {
            ...formOptions,
            theme: 'dark',
          },
        },
      })

      expect(wrapper.find('.dynamic-form').classes()).toContain(
        'dynamic-form--dark'
      )
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的字段配置', () => {
      const invalidOptions = {
        fields: [
          {
            name: '',
            title: '无效字段',
            component: 'FormInput',
          },
        ],
      }

      expect(() => {
        mount(DynamicForm, {
          props: {
            options: invalidOptions,
          },
        })
      }).not.toThrow()
    })

    it('应该处理不存在的组件类型', () => {
      const invalidComponentOptions = {
        fields: [
          {
            name: 'test',
            title: '测试字段',
            component: 'NonExistentComponent',
          },
        ],
      }

      expect(() => {
        mount(DynamicForm, {
          props: {
            options: invalidComponentOptions,
          },
        })
      }).not.toThrow()
    })
  })
})
