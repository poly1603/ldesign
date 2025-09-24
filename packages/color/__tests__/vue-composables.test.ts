/**
 * Vue组合式API测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ref, nextTick } from 'vue'
import { useThemeSelector } from '../src/vue/composables/useThemeSelector'
import { useThemeToggle } from '../src/vue/composables/useThemeToggle'
import { useSystemThemeSync } from '../src/vue/composables/useSystemThemeSync'

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

// Mock window.matchMedia
const mockMatchMedia = vi.fn()

// Mock Vue inject and lifecycle hooks
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    inject: vi.fn(() => null), // 默认返回null，表示没有主题管理器
    onMounted: vi.fn(fn => fn()), // 立即执行onMounted回调
    onUnmounted: vi.fn(), // 不执行onUnmounted回调
  }
})

describe('Vue组合式API', () => {
  beforeEach(() => {
    // 重置所有mock
    vi.clearAllMocks()

    // 设置localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    })

    // 设置matchMedia mock
    Object.defineProperty(window, 'matchMedia', {
      value: mockMatchMedia,
      writable: true,
    })

    // 默认localStorage行为
    mockLocalStorage.getItem.mockReturnValue(null)
    mockLocalStorage.setItem.mockImplementation(() => {})

    // 默认matchMedia行为
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('useThemeSelector', () => {
    it('应该正确初始化', () => {
      const { currentTheme, currentMode, availableThemes, isDark, themeConfigs } =
        useThemeSelector()

      expect(currentTheme.value).toBe('default')
      expect(currentMode.value).toBe('light')
      expect(isDark.value).toBe(false)
      expect(availableThemes.value.length).toBeGreaterThan(0)
      expect(Object.keys(themeConfigs.value).length).toBeGreaterThan(0)
    })

    it('应该支持自定义选项', () => {
      const customThemes = [
        {
          name: 'custom',
          displayName: '自定义主题',
          description: '测试主题',
          builtin: false,
          light: { primary: '#ff0000' },
          dark: { primary: '#ff4444' },
        },
      ]

      const { currentTheme, currentMode, availableThemes } = useThemeSelector({
        customThemes,
        defaultTheme: 'custom',
        defaultMode: 'dark',
      })

      expect(currentTheme.value).toBe('custom')
      expect(currentMode.value).toBe('dark')
      expect(availableThemes.value.some(t => t.name === 'custom')).toBe(true)
    })

    it('应该正确选择主题', async () => {
      const { selectTheme, currentTheme } = useThemeSelector()

      await selectTheme('green')
      expect(currentTheme.value).toBe('green')
    })

    it('应该正确切换模式', async () => {
      const { setMode, toggleMode, currentMode, isDark } = useThemeSelector()

      await setMode('dark')
      expect(currentMode.value).toBe('dark')
      expect(isDark.value).toBe(true)

      await toggleMode()
      expect(currentMode.value).toBe('light')
      expect(isDark.value).toBe(false)
    })

    it('应该获取主题信息', () => {
      const { getThemeConfig, getThemeDisplayName, getThemeDescription } = useThemeSelector()

      const config = getThemeConfig('default')
      expect(config).toBeDefined()
      expect(config?.name).toBe('default')

      const displayName = getThemeDisplayName('default')
      expect(displayName).toBeTruthy()

      const description = getThemeDescription('default')
      expect(description).toBeTruthy()
    })

    it('应该处理存储', async () => {
      const storageKey = 'test-theme-selector'
      const { selectTheme, setMode } = useThemeSelector({
        storageKey,
        autoSave: true,
      })

      await selectTheme('green')
      await setMode('dark')

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        storageKey,
        expect.stringContaining('"theme":"green"')
      )
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        storageKey,
        expect.stringContaining('"mode":"dark"')
      )
    })
  })

  describe('useThemeToggle', () => {
    it('应该正确初始化', () => {
      const { currentMode, isDark, isLight } = useThemeToggle()

      expect(currentMode.value).toBe('light')
      expect(isDark.value).toBe(false)
      expect(isLight.value).toBe(true)
    })

    it('应该支持自定义默认模式', () => {
      const { currentMode, isDark } = useThemeToggle({
        defaultMode: 'dark',
      })

      expect(currentMode.value).toBe('dark')
      expect(isDark.value).toBe(true)
    })

    it('应该正确切换模式', async () => {
      const { toggle, setLight, setDark, currentMode, isDark } = useThemeToggle()

      await toggle()
      expect(currentMode.value).toBe('dark')
      expect(isDark.value).toBe(true)

      await setLight()
      expect(currentMode.value).toBe('light')
      expect(isDark.value).toBe(false)

      await setDark()
      expect(currentMode.value).toBe('dark')
      expect(isDark.value).toBe(true)
    })

    it('应该调用回调函数', async () => {
      const onBeforeToggle = vi.fn()
      const onAfterToggle = vi.fn()

      const { toggle } = useThemeToggle({
        onBeforeToggle,
        onAfterToggle,
      })

      await toggle()

      expect(onBeforeToggle).toHaveBeenCalledWith('dark')
      expect(onAfterToggle).toHaveBeenCalledWith('dark')
    })

    it('应该处理存储', async () => {
      const storageKey = 'test-theme-toggle'
      const { toggle } = useThemeToggle({
        storageKey,
        autoSave: true,
      })

      await toggle()

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        storageKey,
        expect.stringContaining('"mode":"dark"')
      )
    })
  })

  describe('useSystemThemeSync', () => {
    it('应该正确初始化', () => {
      const { systemTheme, isSystemDark, isSystemLight, isSupported, isSyncing } =
        useSystemThemeSync()

      expect(systemTheme.value).toBe('light')
      expect(isSystemDark.value).toBe(false)
      expect(isSystemLight.value).toBe(true)
      expect(isSupported.value).toBe(true)
      expect(isSyncing.value).toBe(false)
    })

    it('应该检测系统主题', () => {
      // Mock暗色模式 - 需要在创建composable之前设置
      mockMatchMedia.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })

      // 重新设置window.matchMedia
      Object.defineProperty(window, 'matchMedia', {
        value: mockMatchMedia,
        writable: true,
      })

      const { systemTheme, isSystemDark } = useSystemThemeSync()

      // 由于onMounted会立即执行，系统主题应该被正确检测
      expect(systemTheme.value).toBe('dark')
      expect(isSystemDark.value).toBe(true)
    })

    it('应该开始和停止同步', () => {
      const mockAddEventListener = vi.fn()
      const mockRemoveEventListener = vi.fn()

      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      })

      const { startSync, stopSync, isSyncing } = useSystemThemeSync()

      startSync()
      expect(isSyncing.value).toBe(true)
      expect(mockAddEventListener).toHaveBeenCalled()

      stopSync()
      expect(isSyncing.value).toBe(false)
      expect(mockRemoveEventListener).toHaveBeenCalled()
    })

    it('应该切换同步状态', () => {
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })

      const { toggleSync, isSyncing } = useSystemThemeSync()

      expect(isSyncing.value).toBe(false)

      toggleSync()
      expect(isSyncing.value).toBe(true)

      toggleSync()
      expect(isSyncing.value).toBe(false)
    })

    it('应该调用同步回调', async () => {
      const onSync = vi.fn()

      mockMatchMedia.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })

      const { syncWithSystem } = useSystemThemeSync({
        onSync,
      })

      await syncWithSystem()
      expect(onSync).toHaveBeenCalledWith('dark')
    })

    it('应该处理错误', async () => {
      const onError = vi.fn()

      // Mock matchMedia抛出错误
      mockMatchMedia.mockImplementation(() => {
        throw new Error('Test error')
      })

      const { syncWithSystem } = useSystemThemeSync({
        onError,
      })

      await syncWithSystem()
      expect(onError).toHaveBeenCalled()
    })

    it('应该自动开始同步', () => {
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })

      const { isSyncing } = useSystemThemeSync({
        autoStart: true,
      })

      // 由于我们mock了onMounted会立即执行，autoStart会立即生效
      expect(isSyncing.value).toBe(true) // 自动开始同步
    })
  })
})
