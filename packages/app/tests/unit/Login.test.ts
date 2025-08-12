import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Login from '../../src/views/Login'

// Mock dependencies
vi.mock('@ldesign/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock('@ldesign/engine', () => ({
  // Mock engine types
}))

// Mock getCurrentInstance
const mockEngine = {
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  notifications: {
    show: vi.fn(),
  },
}

vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    getCurrentInstance: () => ({
      appContext: {
        config: {
          globalProperties: {
            $engine: mockEngine,
          },
        },
      },
    }),
  }
})

describe('login 组件', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该正确渲染', () => {
    const wrapper = mount(Login)

    expect(wrapper.find('h1').text()).toContain('LDesign 登录')
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('应该显示提示信息', () => {
    const wrapper = mount(Login)

    expect(wrapper.text()).toContain('演示账号：admin / admin')
    expect(wrapper.text()).toContain('集成 @ldesign/template')
    expect(wrapper.text()).toContain('Engine 通知、日志、路由跳转')
  })

  it('应该处理用户输入', async () => {
    const wrapper = mount(Login)

    const usernameInput = wrapper.find('input[type="text"]')
    const passwordInput = wrapper.find('input[type="password"]')

    await usernameInput.setValue('testuser')
    await passwordInput.setValue('testpass')

    expect((usernameInput.element as HTMLInputElement).value).toBe('testuser')
    expect((passwordInput.element as HTMLInputElement).value).toBe('testpass')
  })

  it('应该在表单提交时调用登录处理函数', async () => {
    const wrapper = mount(Login)

    const usernameInput = wrapper.find('input[type="text"]')
    const passwordInput = wrapper.find('input[type="password"]')
    const form = wrapper.find('form')

    await usernameInput.setValue('admin')
    await passwordInput.setValue('admin')
    await form.trigger('submit')

    expect(mockEngine.logger.info).toHaveBeenCalledWith('用户尝试登录: admin')
  })

  it('应该在空输入时显示错误通知', async () => {
    const wrapper = mount(Login)

    const form = wrapper.find('form')
    await form.trigger('submit')

    expect(mockEngine.notifications.show).toHaveBeenCalledWith({
      type: 'error',
      title: '登录失败',
      message: '请输入用户名和密码',
      duration: 3000,
    })
  })

  it('应该在成功登录时显示成功通知', async () => {
    const wrapper = mount(Login)

    const usernameInput = wrapper.find('input[type="text"]')
    const passwordInput = wrapper.find('input[type="password"]')
    const form = wrapper.find('form')

    await usernameInput.setValue('admin')
    await passwordInput.setValue('admin')
    await form.trigger('submit')

    // 等待异步操作完成
    await new Promise(resolve => setTimeout(resolve, 1100))

    expect(mockEngine.notifications.show).toHaveBeenCalledWith({
      type: 'success',
      title: '登录成功',
      message: '欢迎回来，admin！',
      duration: 3000,
    })
  })

  it('应该在错误凭据时显示错误通知', async () => {
    const wrapper = mount(Login)

    const usernameInput = wrapper.find('input[type="text"]')
    const passwordInput = wrapper.find('input[type="password"]')
    const form = wrapper.find('form')

    await usernameInput.setValue('wrong')
    await passwordInput.setValue('credentials')
    await form.trigger('submit')

    // 等待异步操作完成
    await new Promise(resolve => setTimeout(resolve, 1100))

    expect(mockEngine.notifications.show).toHaveBeenCalledWith({
      type: 'error',
      title: '登录失败',
      message: '用户名或密码错误',
      duration: 3000,
    })
  })
})
