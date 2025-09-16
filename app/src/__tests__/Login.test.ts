/**
 * Login.vue 重构后的测试
 * 验证重构后的功能完整性
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Login from '../pages/Login.vue'

// Mock router
const mockPush = vi.fn()
vi.mock('@ldesign/router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

// Mock TemplateRenderer
vi.mock('@ldesign/template', () => ({
  TemplateRenderer: {
    name: 'TemplateRenderer',
    props: ['category', 'props'],
    emits: ['template-change', 'load-error', 'load-success'],
    template: `
      <div class="template-renderer-mock">
        <slot name="footer"></slot>
        <slot name="extra"></slot>
        <button @click="$emit('load-success')" data-testid="mock-success">Mock Success</button>
        <button @click="$emit('load-error', new Error('Mock Error'))" data-testid="mock-error">Mock Error</button>
        <button @click="$emit('template-change', 'new-template')" data-testid="mock-change">Mock Change</button>
      </div>
    `
  }
}))

describe('Login.vue 重构测试', () => {
  let wrapper: any

  beforeEach(() => {
    mockPush.mockClear()
    wrapper = mount(Login)
  })

  describe('基本渲染', () => {
    it('应该正确渲染登录页面', () => {
      expect(wrapper.find('.login-page').exists()).toBe(true)
      expect(wrapper.find('.template-renderer-mock').exists()).toBe(true)
    })

    it('应该渲染自定义插槽内容', () => {
      expect(wrapper.text()).toContain('返回首页')
      expect(wrapper.text()).toContain('© 2024 LDesign Demo App')
      expect(wrapper.text()).toContain('使用 @ldesign/template 模板系统')
    })

    it('应该有正确的CSS类名', () => {
      expect(wrapper.find('.login-footer').exists()).toBe(true)
      expect(wrapper.find('.back-link').exists()).toBe(true)
      expect(wrapper.find('.demo-info').exists()).toBe(true)
    })
  })

  describe('TemplateRenderer 集成', () => {
    it('应该传递正确的props给TemplateRenderer', () => {
      const templateRenderer = wrapper.findComponent({ name: 'TemplateRenderer' })
      
      expect(templateRenderer.props('category')).toBe('login')
      expect(templateRenderer.props('props')).toEqual(
        expect.objectContaining({
          title: '用户登录',
          subtitle: '欢迎使用 LDesign Demo 系统',
          formData: expect.any(Object),
          loading: false,
          onSubmit: expect.any(Function),
          onForgot: expect.any(Function),
          onRegister: expect.any(Function),
        })
      )
    })

    it('应该正确处理模板事件', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // 测试模板切换事件
      await wrapper.find('[data-testid="mock-change"]').trigger('click')
      expect(consoleSpy).toHaveBeenCalledWith('模板切换:', 'new-template')
      
      // 测试加载成功事件
      await wrapper.find('[data-testid="mock-success"]').trigger('click')
      expect(consoleSpy).toHaveBeenCalledWith('模板加载成功')
      
      // 测试加载错误事件
      await wrapper.find('[data-testid="mock-error"]').trigger('click')
      expect(consoleErrorSpy).toHaveBeenCalledWith('模板加载失败:', expect.any(Error))
      
      consoleSpy.mockRestore()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('登录功能', () => {
    it('应该有正确的初始表单状态', () => {
      const vm = wrapper.vm
      expect(vm.loginForm).toEqual({
        username: '',
        password: '',
        rememberMe: false
      })
      expect(vm.isLoading).toBe(false)
    })

    it('应该验证必填字段', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
      
      // 调用登录函数（通过props传递给模板）
      const templateRenderer = wrapper.findComponent({ name: 'TemplateRenderer' })
      const onSubmit = templateRenderer.props('props').onSubmit
      
      await onSubmit()
      
      expect(alertSpy).toHaveBeenCalledWith('请输入用户名和密码')
      alertSpy.mockRestore()
    })

    it('应该处理成功登录', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
      
      // 设置表单数据
      wrapper.vm.loginForm.username = 'testuser'
      wrapper.vm.loginForm.password = 'password123'
      
      const templateRenderer = wrapper.findComponent({ name: 'TemplateRenderer' })
      const onSubmit = templateRenderer.props('props').onSubmit
      
      // 执行登录
      const loginPromise = onSubmit()
      
      // 检查加载状态
      expect(wrapper.vm.isLoading).toBe(true)
      
      await loginPromise
      
      // 检查登录完成后的状态
      expect(wrapper.vm.isLoading).toBe(false)
      expect(alertSpy).toHaveBeenCalledWith('登录成功！欢迎 testuser')
      expect(mockPush).toHaveBeenCalledWith('/')
      
      alertSpy.mockRestore()
    })

    it('应该处理忘记密码和注册功能', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
      
      const templateRenderer = wrapper.findComponent({ name: 'TemplateRenderer' })
      const props = templateRenderer.props('props')
      
      // 测试忘记密码
      props.onForgot()
      expect(alertSpy).toHaveBeenCalledWith('忘记密码功能')
      
      // 测试注册
      props.onRegister()
      expect(alertSpy).toHaveBeenCalledWith('注册功能')
      
      alertSpy.mockRestore()
    })
  })

  describe('代码简化验证', () => {
    it('应该比原版本更简洁', () => {
      // 检查组件实例的属性数量（简化后应该更少）
      const vm = wrapper.vm
      const vmKeys = Object.keys(vm).filter(key => !key.startsWith('$') && !key.startsWith('_'))
      
      // 简化后应该只有核心的几个属性
      expect(vmKeys.length).toBeLessThan(10)
      expect(vmKeys).toContain('loginForm')
      expect(vmKeys).toContain('isLoading')
      expect(vmKeys).toContain('loginProps')
    })

    it('应该移除了冗余的调试信息', () => {
      const templateRenderer = wrapper.findComponent({ name: 'TemplateRenderer' })
      const props = templateRenderer.props('props')
      
      // 确认移除了原有的复杂调试信息
      expect(props.debugInfo).toBeUndefined()
      expect(props.showRemember).toBeUndefined()
      expect(props.showRegister).toBeUndefined()
      expect(props.showForgot).toBeUndefined()
      expect(props.primaryColor).toBeUndefined()
    })

    it('应该保持核心功能完整', () => {
      const templateRenderer = wrapper.findComponent({ name: 'TemplateRenderer' })
      const props = templateRenderer.props('props')
      
      // 确认核心功能仍然存在
      expect(props.title).toBe('用户登录')
      expect(props.subtitle).toBe('欢迎使用 LDesign Demo 系统')
      expect(props.formData).toBeDefined()
      expect(props.onSubmit).toBeDefined()
      expect(props.onForgot).toBeDefined()
      expect(props.onRegister).toBeDefined()
    })
  })
})
