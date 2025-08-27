/**
 * Vue Composables 简化测试
 */

import type { SizeMode } from '../../types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp } from 'vue'

// 导入composables
import {
  useGlobalSize,
  useSize,
  useSizeResponsive,
  useSizeSwitcher,
  useSizeWatcher,
} from '../../vue/composables'

// 创建全局的 mock 对象
const mockSizeManager = {
  getCurrentMode: vi.fn(() => 'medium' as SizeMode),
  getConfig: vi.fn(() => ({ fontSize: '14px' })),
  setMode: vi.fn(),
  onSizeChange: vi.fn(() => vi.fn()),
  generateCSSVariables: vi.fn(() => ({ '--size': '14px' })),
  injectCSS: vi.fn(),
  removeCSS: vi.fn(),
  destroy: vi.fn(),
}

// Mock size manager
vi.mock('../../core/size-manager', () => ({
  globalSizeManager: mockSizeManager,
  createSizeManager: vi.fn(() => mockSizeManager),
}))

// Mock utils
vi.mock('../../utils', () => ({
  getNextSizeMode: vi.fn((mode: SizeMode) => {
    const modes: SizeMode[] = ['small', 'medium', 'large']
    const index = modes.indexOf(mode)
    return modes[(index + 1) % modes.length]
  }),
  getPreviousSizeMode: vi.fn((mode: SizeMode) => {
    const modes: SizeMode[] = ['small', 'medium', 'large']
    const index = modes.indexOf(mode)
    return modes[(index - 1 + modes.length) % modes.length]
  }),
  getSizeModeDisplayName: vi.fn((mode: SizeMode) => {
    const names: Partial<Record<SizeMode, string>> = {
      'small': '小',
      'medium': '中',
      'large': '大',
      'extra-large': '超大',
    }
    return names[mode] || mode
  }),
  isValidSizeMode: vi.fn((mode: string): mode is SizeMode =>
    ['small', 'medium', 'large'].includes(mode as SizeMode),
  ),
  getRecommendedSizeMode: vi.fn(() => 'medium' as SizeMode),
  createResponsiveSizeWatcher: vi.fn(() => vi.fn()),
  detectPreferredSizeMode: vi.fn(() => 'large' as SizeMode),
  calculateSizeScale: vi.fn(() => 1.0),
}))

// Mock plugin
vi.mock('../../vue/plugin', () => ({
  VueSizeSymbol: Symbol('VueSize'),
}))

// 创建测试用的Vue应用实例来提供组件上下文
function withVueContext<T>(fn: () => T): T {
  const app = createApp({})
  let result: T

  app.runWithContext(() => {
    result = fn()
  })

  return result!
}

describe('vue Composables', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useSize', () => {
    it('应该返回正确的响应式状态', () => {
      withVueContext(() => {
        const { currentMode, currentConfig, currentModeDisplayName } = useSize()

        expect(currentMode.value).toBe('medium')
        expect(currentConfig.value).toEqual({ fontSize: '14px' })
        expect(currentModeDisplayName.value).toBe('中')
      })
    })

    it('应该提供设置模式的方法', () => {
      withVueContext(() => {
        const { setMode } = useSize()

        setMode('large')
        expect(mockSizeManager.setMode).toHaveBeenCalledWith('large')
      })
    })

    it('应该提供CSS相关的方法', () => {
      withVueContext(() => {
        const { generateCSSVariables, injectCSS, removeCSS } = useSize()

        const variables = generateCSSVariables()
        expect(variables).toEqual({ '--size': '14px' })

        injectCSS()
        expect(mockSizeManager.injectCSS).toHaveBeenCalled()

        removeCSS()
        expect(mockSizeManager.removeCSS).toHaveBeenCalled()
      })
    })
  })

  describe('useGlobalSize', () => {
    it('应该使用全局尺寸管理器', () => {
      withVueContext(() => {
        const result = useGlobalSize()
        expect(result.sizeManager).toBe(mockSizeManager)
      })
    })
  })

  describe('useSizeSwitcher', () => {
    it('应该提供可用模式列表', () => {
      withVueContext(() => {
        const { availableModes } = useSizeSwitcher()
        expect(availableModes).toEqual(['small', 'medium', 'large', 'extra-large'])
      })
    })

    it('应该提供切换到指定模式的方法', () => {
      withVueContext(() => {
        const { switchToMode } = useSizeSwitcher()

        switchToMode('large')
        expect(mockSizeManager.setMode).toHaveBeenCalledWith('large')
      })
    })
  })

  describe('useSizeResponsive', () => {
    it('应该提供响应式状态检查', () => {
      withVueContext(() => {
        const { isSmall, isMedium, isLarge } = useSizeResponsive()

        expect(isSmall.value).toBe(false)
        expect(isMedium.value).toBe(true)
        expect(isLarge.value).toBe(false)
      })
    })

    it('应该提供至少和至多检查方法', () => {
      withVueContext(() => {
        const { isAtLeast, isAtMost } = useSizeResponsive()

        expect(isAtLeast('small')).toBe(true)
        expect(isAtLeast('medium')).toBe(true)
        expect(isAtLeast('large')).toBe(false)

        expect(isAtMost('small')).toBe(false)
        expect(isAtMost('medium')).toBe(true)
        expect(isAtMost('large')).toBe(true)
      })
    })
  })

  describe('useSizeWatcher', () => {
    it('应该设置尺寸变化监听器', () => {
      withVueContext(() => {
        const callback = vi.fn()
        const { unsubscribe } = useSizeWatcher(callback)

        expect(mockSizeManager.onSizeChange).toHaveBeenCalledWith(callback)
        expect(typeof unsubscribe).toBe('function')
      })
    })
  })
})
