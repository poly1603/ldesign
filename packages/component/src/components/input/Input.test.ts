/**
 * Input 组件测试
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Input from './Input.vue'
import Icon from '../icon/Icon.vue'

describe('Input', () => {
  const mountInput = (props = {}) => {
    return mount(Input, {
      props,
      global: {
        components: {
          'l-icon': Icon
        }
      }
    })
  }

  it('应该正确渲染', () => {
    const wrapper = mountInput({
      placeholder: 'Please input'
    })

    expect(wrapper.find('.l-input').exists()).toBe(true)
    expect(wrapper.find('input').attributes('placeholder')).toBe('Please input')
  })

  it('应该支持不同尺寸', () => {
    const wrapper = mountInput({
      size: 'large'
    })

    expect(wrapper.find('.l-input--large').exists()).toBe(true)
  })

  it('应该支持不同状态', () => {
    const wrapper = mountInput({
      status: 'error'
    })

    expect(wrapper.find('.l-input--error').exists()).toBe(true)
  })

  it('应该支持禁用状态', () => {
    const wrapper = mountInput({
      disabled: true
    })

    expect(wrapper.find('.l-input--disabled').exists()).toBe(true)
    expect(wrapper.find('input').element.disabled).toBe(true)
  })

  it('应该支持只读状态', () => {
    const wrapper = mountInput({
      readonly: true
    })

    expect(wrapper.find('.l-input--readonly').exists()).toBe(true)
    expect(wrapper.find('input').element.readOnly).toBe(true)
  })

  it('应该支持清空功能', async () => {
    const wrapper = mountInput({
      modelValue: 'test',
      clearable: true
    })

    expect(wrapper.find('.l-input__clear').exists()).toBe(true)

    await wrapper.find('.l-input__clear').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([''])
    expect(wrapper.emitted('clear')).toBeTruthy()
  })

  it('应该支持密码切换', () => {
    const wrapper = mountInput({
      type: 'password',
      showPassword: true
    })

    expect(wrapper.find('.l-input__password').exists()).toBe(true)
    expect(wrapper.find('input').attributes('type')).toBe('password')
  })

  it('应该支持前缀和后缀图标', () => {
    const wrapper = mountInput({
      prefixIcon: '🔍',
      suffixIcon: '⭐'
    })

    expect(wrapper.find('.l-input__prefix').exists()).toBe(true)
    expect(wrapper.find('.l-input__suffix').exists()).toBe(true)
  })

  it('应该支持前置和后置内容', () => {
    const wrapper = mountInput({
      prepend: 'https://',
      append: '.com'
    })

    expect(wrapper.find('.l-input__prepend').exists()).toBe(true)
    expect(wrapper.find('.l-input__append').exists()).toBe(true)
    expect(wrapper.find('.l-input--prepend').exists()).toBe(true)
    expect(wrapper.find('.l-input--append').exists()).toBe(true)
  })

  it('应该支持字数统计', () => {
    const wrapper = mountInput({
      modelValue: 'test',
      maxlength: 10,
      showCount: true
    })

    expect(wrapper.find('.l-input__count').exists()).toBe(true)
    expect(wrapper.find('.l-input__count').text()).toBe('4/10')
  })

  it('应该触发输入事件', async () => {
    const wrapper = mountInput()

    await wrapper.find('input').trigger('input')
    expect(wrapper.emitted('input')).toBeTruthy()
  })

  it('应该触发焦点事件', async () => {
    const wrapper = mountInput()

    await wrapper.find('input').trigger('focus')
    expect(wrapper.emitted('focus')).toBeTruthy()

    await wrapper.find('input').trigger('blur')
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('应该触发回车事件', async () => {
    const wrapper = mountInput()

    await wrapper.find('input').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('enter')).toBeTruthy()
  })

  it('应该暴露实例方法', () => {
    const wrapper = mountInput()

    expect(wrapper.vm.getInputElement).toBeDefined()
    expect(wrapper.vm.focus).toBeDefined()
    expect(wrapper.vm.blur).toBeDefined()
    expect(wrapper.vm.select).toBeDefined()
    expect(wrapper.vm.clear).toBeDefined()
  })
})
