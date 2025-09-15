import { describe, it, expect, beforeEach } from 'vitest'
import { ThemeManager } from '../src/core/theme-manager'
import { defaultTheme, greenTheme } from '../src/themes/presets'

// 作用域主题（Scoped Theming）测试

describe('Scoped Theming', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = ''
  })

  it('applyThemeTo 应该仅作用于指定容器', async () => {
    const tm = new ThemeManager({ themes: [defaultTheme, greenTheme], cssPrefix: '--color', idleProcessing: false, autoDetect: false })
    await tm.preGenerateTheme('default')

    const box1 = document.createElement('div')
    const box2 = document.createElement('div')
    document.body.appendChild(box1)
    document.body.appendChild(box2)

    await tm.applyThemeTo(box1, 'default', 'light')

    // box1 应该有独立的 style
    const scopeId = box1.getAttribute('data-theme-scope')
    expect(scopeId).toBeTruthy()
    const styleInHead = document.getElementById(`ldesign-theme-variables-${scopeId}`) as HTMLStyleElement
    expect(styleInHead).toBeTruthy()
    expect(styleInHead.textContent).toContain('[data-theme-scope=')

    // box2 不应被影响
    expect(box2.getAttribute('data-theme-scope')).toBeFalsy()
  })

  it('removeThemeFrom 应该移除指定容器的作用域主题', async () => {
    const tm = new ThemeManager({ themes: [defaultTheme], cssPrefix: '--color', idleProcessing: false, autoDetect: false })
    const box = document.createElement('div')
    document.body.appendChild(box)

    await tm.applyThemeTo(box, 'default', 'light')
    const scopeId = box.getAttribute('data-theme-scope')!
    expect(document.getElementById(`ldesign-theme-variables-${scopeId}`)).toBeTruthy()

    tm.removeThemeFrom(box)
    expect(document.getElementById(`ldesign-theme-variables-${scopeId}`)).toBeFalsy()
    expect(box.getAttribute('data-theme-scope')).toBeNull()
  })
})

