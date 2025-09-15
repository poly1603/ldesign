import { describe, it, expect, beforeEach } from 'vitest'
import { ThemeManager } from '../src/core/theme-manager'
import { defaultTheme } from '../src/themes/presets'

// 基础高对比度测试

describe('High Contrast Overrides', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = ''
  })

  it('启用后应注入覆盖样式，禁用后应移除', async () => {
    const tm = new ThemeManager({ themes: [defaultTheme], cssPrefix: '--color', idleProcessing: false, autoDetect: false })
    await tm.init()

    // 初始未启用
    expect(tm.isHighContrastEnabled()).toBe(false)
    expect(document.getElementById('ldesign-theme-variables-contrast')).toBeFalsy()

    // 启用
    tm.enableHighContrast(true, { level: 'AA', textSize: 'normal' })
    const styleEl = document.getElementById('ldesign-theme-variables-contrast') as HTMLStyleElement
    expect(tm.isHighContrastEnabled()).toBe(true)
    expect(styleEl).toBeTruthy()
    expect(styleEl.textContent || '').toContain('High Contrast Overrides')

    // 禁用
    tm.enableHighContrast(false)
    expect(tm.isHighContrastEnabled()).toBe(false)
    expect(document.getElementById('ldesign-theme-variables-contrast')).toBeFalsy()
  })
})
