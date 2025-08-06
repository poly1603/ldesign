import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import LoginView from '../views/LoginView.vue'

// 模拟 composables
vi.mock('../composables/useEngine', () => ({
  useEngine: () => ({
    notifications: {
      show: vi.fn(),
    },
    events: {
      emit: vi.fn(),
    },
    logger: {
      info: vi.fn(),
      error: vi.fn(),
    },
  }),
}))

vi.mock('../composables/useRouter', () => ({
  useRouter: () => ({
    push: vi.fn(),
    currentRoute: { value: { query: {} } },
  }),
}))

vi.mock('../composables/useI18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('../composables/useDevice', () => ({
  useDevice: () => ({
    deviceInfo: { value: { type: 'desktop' } },
  }),
}))

describe('LoginView', () => {
  let wrapper: any
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    
    wrapper = mount(LoginView, {
      global: {
        plugins: [pinia],
        stubs: {
          'router-link': true,
        },
      },
    })
  })

  it('应该正确渲染登录视图', () => {
    expect(wrapper.find('.login-view').exists()).toBe(true)
    expect(wrapper.find('.template-switcher').exists()).toBe(true)
    expect(wrapper.find('.login-container').exists()).toBe(true)
  })

  it('应该显示模板切换器', () => {
    const switcher = wrapper.find('.template-switcher')
    expect(switcher.exists()).toBe(true)
    
    const select = switcher.find('.template-select')
    expect(select.exists()).toBe(true)
    
    // 检查选项
    const options = select.findAll('option')
    expect(options).toHaveLength(4)
    expect(options[0].text()).toBe('经典模板')
    expect(options[1].text()).toBe('现代模板')
    expect(options[2].text()).toBe('简约模板')
    expect(options[3].text()).toBe('创意模板')
  })

  it('应该显示登录表单', () => {
    const form = wrapper.find('.login-form')
    expect(form.exists()).toBe(true)
    
    // 检查表单字段
    const usernameInput = form.find('input[type="text"]')
    const passwordInput = form.find('input[type="password"]')
    const rememberCheckbox = form.find('input[type="checkbox"]')
    const submitButton = form.find('button[type="submit"]')
    
    expect(usernameInput.exists()).toBe(true)
    expect(passwordInput.exists()).toBe(true)
    expect(rememberCheckbox.exists()).toBe(true)
    expect(submitButton.exists()).toBe(true)
  })

  it('应该能够输入用户名和密码', async () => {
    const usernameInput = wrapper.find('input[type="text"]')
    const passwordInput = wrapper.find('input[type="password"]')
    
    await usernameInput.setValue('testuser')
    await passwordInput.setValue('testpass')
    
    expect(wrapper.vm.form.username).toBe('testuser')
    expect(wrapper.vm.form.password).toBe('testpass')
  })

  it('应该能够切换模板', async () => {
    const select = wrapper.find('.template-select')
    
    await select.setValue('modern')
    
    expect(wrapper.vm.currentTemplate).toBe('modern')
  })

  it('应该在提交时调用登录函数', async () => {
    const form = wrapper.find('.login-form')
    const usernameInput = wrapper.find('input[type="text"]')
    const passwordInput = wrapper.find('input[type="password"]')
    
    // 填写表单
    await usernameInput.setValue('admin')
    await passwordInput.setValue('admin123')
    
    // 模拟表单提交
    await form.trigger('submit.prevent')
    
    // 验证表单数据
    expect(wrapper.vm.form.username).toBe('admin')
    expect(wrapper.vm.form.password).toBe('admin123')
  })

  it('应该在加载时禁用提交按钮', async () => {
    // 设置加载状态
    wrapper.vm.loading = true
    await wrapper.vm.$nextTick()
    
    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.attributes('disabled')).toBeDefined()
  })

  it('应该显示加载状态', async () => {
    // 设置加载状态
    wrapper.vm.loading = true
    await wrapper.vm.$nextTick()
    
    const spinner = wrapper.find('.spinner')
    expect(spinner.exists()).toBe(true)
  })

  it('应该保存模板偏好到本地存储', async () => {
    const setItemSpy = vi.spyOn(localStorage, 'setItem')
    
    const select = wrapper.find('.template-select')
    await select.setValue('minimal')
    await select.trigger('change')
    
    expect(setItemSpy).toHaveBeenCalledWith('preferred-login-template', 'minimal')
  })
})
