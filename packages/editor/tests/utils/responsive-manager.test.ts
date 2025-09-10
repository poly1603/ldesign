/**
 * 响应式管理器测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ResponsiveManager } from '@/utils/responsive-manager'
import { createMockElement } from '../setup'
import type { DeviceType, BreakpointConfig } from '@/types'

describe('ResponsiveManager', () => {
  let container: HTMLElement
  let responsiveManager: ResponsiveManager

  beforeEach(() => {
    container = createMockElement('div')
    document.body.appendChild(container)
    
    // 模拟容器尺寸
    container.getBoundingClientRect = vi.fn(() => ({
      width: 1024,
      height: 768,
      top: 0,
      left: 0,
      bottom: 768,
      right: 1024,
      x: 0,
      y: 0,
      toJSON: () => {}
    }))
    
    Object.defineProperty(container, 'clientWidth', {
      value: 1024,
      configurable: true
    })
    
    Object.defineProperty(container, 'clientHeight', {
      value: 768,
      configurable: true
    })
  })

  afterEach(() => {
    if (responsiveManager) {
      responsiveManager.destroy()
    }
    document.body.innerHTML = ''
  })

  describe('初始化', () => {
    it('应该能够创建响应式管理器', () => {
      responsiveManager = new ResponsiveManager(container)

      expect(responsiveManager).toBeInstanceOf(ResponsiveManager)
      expect(responsiveManager.getCurrentDevice()).toBe('tablet')
    })

    it('应该能够使用自定义断点', () => {
      const customBreakpoints: BreakpointConfig = {
        mobile: 600,
        tablet: 900,
        desktop: 1200
      }

      responsiveManager = new ResponsiveManager(container, customBreakpoints)
      const breakpoints = responsiveManager.getBreakpoints()

      expect(breakpoints.mobile).toBe(600)
      expect(breakpoints.tablet).toBe(900)
      expect(breakpoints.desktop).toBe(1200)
    })

    it('应该应用初始设备样式', () => {
      responsiveManager = new ResponsiveManager(container)

      expect(container.classList.contains('ldesign-editor-tablet')).toBe(true)
    })
  })

  describe('设备检测', () => {
    it('应该正确检测移动设备', () => {
      // 模拟移动设备尺寸
      Object.defineProperty(container, 'clientWidth', {
        value: 600,
        configurable: true
      })

      responsiveManager = new ResponsiveManager(container)

      expect(responsiveManager.getCurrentDevice()).toBe('mobile')
      expect(responsiveManager.isMobile()).toBe(true)
      expect(responsiveManager.isTablet()).toBe(false)
      expect(responsiveManager.isDesktop()).toBe(false)
    })

    it('应该正确检测平板设备', () => {
      // 模拟平板设备尺寸
      Object.defineProperty(container, 'clientWidth', {
        value: 800,
        configurable: true
      })

      responsiveManager = new ResponsiveManager(container)

      expect(responsiveManager.getCurrentDevice()).toBe('tablet')
      expect(responsiveManager.isMobile()).toBe(false)
      expect(responsiveManager.isTablet()).toBe(true)
      expect(responsiveManager.isDesktop()).toBe(false)
    })

    it('应该正确检测桌面设备', () => {
      // 模拟桌面设备尺寸
      Object.defineProperty(container, 'clientWidth', {
        value: 1200,
        configurable: true
      })

      responsiveManager = new ResponsiveManager(container)

      expect(responsiveManager.getCurrentDevice()).toBe('desktop')
      expect(responsiveManager.isMobile()).toBe(false)
      expect(responsiveManager.isTablet()).toBe(false)
      expect(responsiveManager.isDesktop()).toBe(true)
    })
  })

  describe('断点配置', () => {
    beforeEach(() => {
      responsiveManager = new ResponsiveManager(container)
    })

    it('应该能够更新断点配置', () => {
      const newBreakpoints = {
        mobile: 500,
        tablet: 800
      }

      responsiveManager.updateBreakpoints(newBreakpoints)
      const breakpoints = responsiveManager.getBreakpoints()

      expect(breakpoints.mobile).toBe(500)
      expect(breakpoints.tablet).toBe(800)
      expect(breakpoints.desktop).toBe(1200) // 保持默认值
    })

    it('更新断点后应该重新检测设备', () => {
      const deviceChangeSpy = vi.fn()
      responsiveManager.onDeviceChange(deviceChangeSpy)

      // 更新断点使当前尺寸变为移动设备
      responsiveManager.updateBreakpoints({
        mobile: 1100
      })

      expect(deviceChangeSpy).toHaveBeenCalledWith('mobile', 'tablet')
    })
  })

  describe('设备变更监听', () => {
    beforeEach(() => {
      responsiveManager = new ResponsiveManager(container)
    })

    it('应该能够监听设备变更', () => {
      const listener = vi.fn()
      responsiveManager.onDeviceChange(listener)

      // 模拟设备变更
      Object.defineProperty(container, 'clientWidth', {
        value: 600,
        configurable: true
      })
      responsiveManager.checkDeviceChange()

      expect(listener).toHaveBeenCalledWith('mobile', 'tablet')
    })

    it('应该能够移除设备变更监听器', () => {
      const listener = vi.fn()
      responsiveManager.onDeviceChange(listener)
      responsiveManager.offDeviceChange(listener)

      // 模拟设备变更
      Object.defineProperty(container, 'clientWidth', {
        value: 600,
        configurable: true
      })
      responsiveManager.checkDeviceChange()

      expect(listener).not.toHaveBeenCalled()
    })

    it('监听器错误应该被捕获', () => {
      const errorListener = vi.fn(() => {
        throw new Error('Listener error')
      })
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      responsiveManager.onDeviceChange(errorListener)
      
      Object.defineProperty(container, 'clientWidth', {
        value: 600,
        configurable: true
      })
      responsiveManager.checkDeviceChange()

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('容器尺寸', () => {
    beforeEach(() => {
      responsiveManager = new ResponsiveManager(container)
    })

    it('应该能够获取容器宽度', () => {
      const width = responsiveManager.getContainerWidth()

      expect(width).toBe(1024)
    })

    it('应该能够获取容器高度', () => {
      const height = responsiveManager.getContainerHeight()

      expect(height).toBe(768)
    })
  })

  describe('设备样式配置', () => {
    beforeEach(() => {
      responsiveManager = new ResponsiveManager(container)
    })

    it('应该能够获取设备样式', () => {
      const mobileStyles = responsiveManager.getDeviceStyles('mobile')
      const tabletStyles = responsiveManager.getDeviceStyles('tablet')
      const desktopStyles = responsiveManager.getDeviceStyles('desktop')

      expect(mobileStyles).toHaveProperty('--ldesign-toolbar-height', '44px')
      expect(tabletStyles).toHaveProperty('--ldesign-toolbar-height', '48px')
      expect(desktopStyles).toHaveProperty('--ldesign-toolbar-height', '52px')
    })

    it('应该能够获取设备配置', () => {
      const mobileConfig = responsiveManager.getDeviceConfig('mobile')
      const desktopConfig = responsiveManager.getDeviceConfig('desktop')

      expect(mobileConfig.touchEnabled).toBe(true)
      expect(mobileConfig.keyboardShortcuts).toBe(false)
      
      expect(desktopConfig.touchEnabled).toBe(false)
      expect(desktopConfig.keyboardShortcuts).toBe(true)
    })
  })

  describe('样式应用', () => {
    beforeEach(() => {
      responsiveManager = new ResponsiveManager(container)
    })

    it('应该应用正确的设备类名', () => {
      expect(container.classList.contains('ldesign-editor-tablet')).toBe(true)
      expect(container.classList.contains('ldesign-editor-mobile')).toBe(false)
      expect(container.classList.contains('ldesign-editor-desktop')).toBe(false)
    })

    it('设备变更时应该更新类名', () => {
      Object.defineProperty(container, 'clientWidth', {
        value: 600,
        configurable: true
      })
      responsiveManager.checkDeviceChange()

      expect(container.classList.contains('ldesign-editor-mobile')).toBe(true)
      expect(container.classList.contains('ldesign-editor-tablet')).toBe(false)
    })

    it('应该应用设备特定的CSS变量', () => {
      const setPropertySpy = vi.spyOn(container.style, 'setProperty')
      
      Object.defineProperty(container, 'clientWidth', {
        value: 600,
        configurable: true
      })
      responsiveManager.checkDeviceChange()

      expect(setPropertySpy).toHaveBeenCalledWith(
        '--ldesign-toolbar-height',
        '44px'
      )
      
      setPropertySpy.mockRestore()
    })
  })

  describe('调试信息', () => {
    beforeEach(() => {
      responsiveManager = new ResponsiveManager(container)
    })

    it('应该能够获取调试信息', () => {
      const debugInfo = responsiveManager.getDebugInfo()

      expect(debugInfo).toHaveProperty('currentDevice')
      expect(debugInfo).toHaveProperty('containerWidth')
      expect(debugInfo).toHaveProperty('containerHeight')
      expect(debugInfo).toHaveProperty('breakpoints')
      expect(debugInfo).toHaveProperty('listeners')

      expect(debugInfo.currentDevice).toBe('tablet')
      expect(debugInfo.containerWidth).toBe(1024)
      expect(debugInfo.containerHeight).toBe(768)
    })
  })

  describe('销毁', () => {
    beforeEach(() => {
      responsiveManager = new ResponsiveManager(container)
    })

    it('应该能够销毁响应式管理器', () => {
      const listener = vi.fn()
      responsiveManager.onDeviceChange(listener)
      
      responsiveManager.destroy()

      // 验证监听器已清理
      Object.defineProperty(container, 'clientWidth', {
        value: 600,
        configurable: true
      })
      responsiveManager.checkDeviceChange()
      
      expect(listener).not.toHaveBeenCalled()
    })

    it('销毁时应该移除设备类名', () => {
      responsiveManager.destroy()

      expect(container.classList.contains('ldesign-editor-tablet')).toBe(false)
      expect(container.classList.contains('ldesign-editor-mobile')).toBe(false)
      expect(container.classList.contains('ldesign-editor-desktop')).toBe(false)
    })
  })
})
