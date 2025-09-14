/**
 * BaseCaptcha 单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { BaseCaptcha } from '@/core/base-captcha'
import { CaptchaType, CaptchaStatus, type BaseCaptchaConfig } from '@/types'
import { createMockContainer, cleanupMockContainer } from '../setup'

// 创建测试用的具体实现类
class TestCaptcha extends BaseCaptcha {
  public readonly type = CaptchaType.SLIDE_PUZZLE

  async init(): Promise<void> {
    this.setStatus(CaptchaStatus.INITIALIZING)
    
    const container = this.getContainer()
    this.rootElement = this.createRootElement()
    this.rootElement.innerHTML = '<div class="test-content">Test Captcha</div>'
    container.appendChild(this.rootElement)
    
    this.setStatus(CaptchaStatus.READY)
    this.emit('init')
  }

  start(): void {
    this.setStatus(CaptchaStatus.VERIFYING)
    this.startTime = Date.now()
    this.emit('start')
  }

  async verify(data: any): Promise<any> {
    return {
      type: this.type,
      success: true,
      data,
      timestamp: Date.now(),
      duration: Date.now() - this.startTime,
      token: this.generateToken()
    }
  }

  reset(): void {
    super.reset()
    this.emit('reset')
  }
}

describe('BaseCaptcha', () => {
  let container: HTMLElement
  let captcha: TestCaptcha
  let config: BaseCaptchaConfig

  beforeEach(() => {
    container = createMockContainer()
    config = {
      container,
      width: 320,
      height: 180,
      debug: false
    }
  })

  afterEach(() => {
    if (captcha) {
      captcha.destroy()
    }
    cleanupMockContainer(container)
  })

  describe('构造函数和初始化', () => {
    it('应该能够创建实例', () => {
      captcha = new TestCaptcha(config)
      
      expect(captcha).toBeInstanceOf(BaseCaptcha)
      expect(captcha.type).toBe(CaptchaType.SLIDE_PUZZLE)
      expect(captcha.getStatus()).toBe(CaptchaStatus.UNINITIALIZED)
    })

    it('应该能够合并配置', () => {
      const customConfig = {
        ...config,
        disabled: true,
        theme: 'dark'
      }
      
      captcha = new TestCaptcha(customConfig)
      
      expect(captcha['_config'].disabled).toBe(true)
      expect(captcha['_config'].theme).toBe('dark')
    })

    it('应该能够初始化', async () => {
      captcha = new TestCaptcha(config)
      
      await captcha.init()
      
      expect(captcha.getStatus()).toBe(CaptchaStatus.READY)
      expect(container.children.length).toBe(1)
    })

    it('初始化时应该触发事件', async () => {
      const initHandler = vi.fn()
      
      captcha = new TestCaptcha(config)
      captcha.on('init', initHandler)
      
      await captcha.init()
      
      expect(initHandler).toHaveBeenCalled()
    })
  })

  describe('状态管理', () => {
    beforeEach(async () => {
      captcha = new TestCaptcha(config)
      await captcha.init()
    })

    it('应该能够获取当前状态', () => {
      expect(captcha.getStatus()).toBe(CaptchaStatus.READY)
    })

    it('应该能够设置状态', () => {
      captcha['setStatus'](CaptchaStatus.VERIFYING)
      expect(captcha.getStatus()).toBe(CaptchaStatus.VERIFYING)
    })

    it('状态变化时应该触发事件', () => {
      const statusChangeHandler = vi.fn()
      captcha.on('statusChange', statusChangeHandler)
      
      captcha['setStatus'](CaptchaStatus.VERIFYING)
      
      expect(statusChangeHandler).toHaveBeenCalledWith({
        type: 'statusChange',
        data: CaptchaStatus.VERIFYING,
        timestamp: expect.any(Number)
      })
    })

    it('应该能够检查状态', () => {
      expect(captcha.isReady()).toBe(true)
      expect(captcha.isVerifying()).toBe(false)
      expect(captcha.isSuccess()).toBe(false)
      expect(captcha.isFailed()).toBe(false)
      
      captcha['setStatus'](CaptchaStatus.VERIFYING)
      expect(captcha.isVerifying()).toBe(true)
      expect(captcha.isReady()).toBe(false)
    })
  })

  describe('事件处理', () => {
    beforeEach(async () => {
      captcha = new TestCaptcha(config)
      await captcha.init()
    })

    it('应该能够绑定和触发事件', async () => {
      const handler = vi.fn()
      captcha.on('test', handler)
      
      await captcha.emit('test', 'data')
      
      expect(handler).toHaveBeenCalledWith({
        type: 'test',
        data: 'data',
        timestamp: expect.any(Number)
      })
    })

    it('应该能够处理成功事件', () => {
      const successHandler = vi.fn()
      captcha.on('success', successHandler)
      
      const result = { success: true, data: 'test' }
      captcha['handleSuccess'](result)
      
      expect(captcha.getStatus()).toBe(CaptchaStatus.SUCCESS)
      expect(successHandler).toHaveBeenCalled()
    })

    it('应该能够处理失败事件', () => {
      const failHandler = vi.fn()
      captcha.on('fail', failHandler)
      
      captcha['handleFail']('Test error')
      
      expect(captcha.getStatus()).toBe(CaptchaStatus.FAILED)
      expect(failHandler).toHaveBeenCalled()
    })

    it('应该调用配置中的回调函数', () => {
      const onSuccess = vi.fn()
      const onFail = vi.fn()
      const onStatusChange = vi.fn()
      
      const configWithCallbacks = {
        ...config,
        onSuccess,
        onFail,
        onStatusChange
      }
      
      captcha = new TestCaptcha(configWithCallbacks)
      
      captcha['handleSuccess']({ success: true })
      expect(onSuccess).toHaveBeenCalled()
      
      captcha['handleFail']('error')
      expect(onFail).toHaveBeenCalled()
      
      captcha['setStatus'](CaptchaStatus.READY)
      expect(onStatusChange).toHaveBeenCalled()
    })
  })

  describe('DOM 操作', () => {
    beforeEach(async () => {
      captcha = new TestCaptcha(config)
      await captcha.init()
    })

    it('应该能够获取容器元素', () => {
      const containerElement = captcha.getContainer()
      expect(containerElement).toBe(container)
    })

    it('应该能够创建根元素', () => {
      const rootElement = captcha['createRootElement']()
      
      expect(rootElement).toBeInstanceOf(HTMLElement)
      expect(rootElement.classList.contains('ldesign-captcha')).toBe(true)
      expect(rootElement.classList.contains('ldesign-captcha-slide-puzzle')).toBe(true)
    })

    it('应该能够应用主题', () => {
      captcha['applyTheme']()
      
      const rootElement = captcha['rootElement']
      expect(rootElement?.classList.contains('ldesign-captcha-theme-default')).toBe(true)
    })
  })

  describe('工具方法', () => {
    beforeEach(async () => {
      captcha = new TestCaptcha(config)
      await captcha.init()
    })

    it('应该能够生成令牌', () => {
      const token = captcha['generateToken']()
      
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('应该能够重试', () => {
      const retryHandler = vi.fn()
      captcha.on('retry', retryHandler)
      
      captcha.retry()
      
      expect(retryHandler).toHaveBeenCalled()
      expect(captcha.getStatus()).toBe(CaptchaStatus.READY)
    })

    it('应该能够重置', () => {
      const resetHandler = vi.fn()
      captcha.on('reset', resetHandler)
      
      captcha['setStatus'](CaptchaStatus.SUCCESS)
      captcha.reset()
      
      expect(resetHandler).toHaveBeenCalled()
      expect(captcha.getStatus()).toBe(CaptchaStatus.READY)
    })
  })

  describe('生命周期', () => {
    it('应该能够销毁实例', async () => {
      captcha = new TestCaptcha(config)
      await captcha.init()
      
      expect(captcha['destroyed']).toBe(false)
      expect(container.children.length).toBe(1)
      
      captcha.destroy()
      
      expect(captcha['destroyed']).toBe(true)
      expect(container.children.length).toBe(0)
    })

    it('销毁后不应该能够操作', async () => {
      captcha = new TestCaptcha(config)
      await captcha.init()
      captcha.destroy()
      
      expect(() => captcha.start()).toThrow('验证码已销毁')
      expect(() => captcha.reset()).toThrow('验证码已销毁')
      expect(() => captcha.retry()).toThrow('验证码已销毁')
    })
  })

  describe('错误处理', () => {
    it('应该能够处理容器不存在的情况', () => {
      const invalidConfig = { ...config, container: null as any }
      
      expect(() => {
        captcha = new TestCaptcha(invalidConfig)
      }).toThrow('容器元素不能为空')
    })

    it('应该能够处理重复初始化', async () => {
      captcha = new TestCaptcha(config)
      await captcha.init()
      
      // 重复初始化应该不会出错
      await expect(captcha.init()).resolves.not.toThrow()
    })

    it('应该能够处理验证错误', async () => {
      captcha = new TestCaptcha(config)
      await captcha.init()
      
      // 模拟验证错误
      const originalVerify = captcha.verify
      captcha.verify = vi.fn().mockRejectedValue(new Error('Verification failed'))
      
      await expect(captcha.verify({})).rejects.toThrow('Verification failed')
    })
  })

  describe('配置验证', () => {
    it('应该验证必需的配置项', () => {
      expect(() => {
        captcha = new TestCaptcha({} as any)
      }).toThrow('容器元素不能为空')
    })

    it('应该使用默认配置值', () => {
      captcha = new TestCaptcha(config)
      
      expect(captcha['_config'].width).toBe(320)
      expect(captcha['_config'].height).toBe(180)
      expect(captcha['_config'].disabled).toBe(false)
      expect(captcha['_config'].debug).toBe(false)
    })

    it('应该能够覆盖默认配置', () => {
      const customConfig = {
        ...config,
        width: 400,
        height: 250,
        disabled: true,
        debug: true
      }
      
      captcha = new TestCaptcha(customConfig)
      
      expect(captcha['_config'].width).toBe(400)
      expect(captcha['_config'].height).toBe(250)
      expect(captcha['_config'].disabled).toBe(true)
      expect(captcha['_config'].debug).toBe(true)
    })
  })
})
