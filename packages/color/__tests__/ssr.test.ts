import { describe, it, expect, beforeEach } from 'vitest'
import { ThemeManager } from '../src/core/theme-manager'
import { defaultTheme, greenTheme } from '../src/themes/presets'

// 为 SSR 能力编写基本测试

describe('SSR API', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = ''
  })

  it('renderThemeCSS 应该生成包含 light/dark 两段的 CSS 字符串', async () => {
    const tm = new ThemeManager({
      themes: [defaultTheme, greenTheme],
      cssPrefix: '--color',
      idleProcessing: false,
      autoDetect: false,
    })
    await tm.preGenerateTheme('default')

    const css = await tm.renderThemeCSS('default', 'light', { includeComments: true })
    expect(css).toContain(':root')
    expect(css).toContain(':root[data-theme-mode="dark"]')
    expect(css.length).toBeGreaterThan(100)
  })

  it('hydrateMountedStyles 应该接管已有的 <style id="ldesign-theme-variables">', async () => {
    // 先模拟 SSR 注入的 style
    const style = document.createElement('style')
    style.id = 'ldesign-theme-variables'
    style.textContent = ':root{ --color-primary: #165DFF; }'
    document.head.appendChild(style)

    const tm = new ThemeManager({
      themes: [defaultTheme],
      cssPrefix: '--color',
      idleProcessing: false,
      autoDetect: false,
    })
    tm.hydrateMountedStyles('ldesign-theme-variables')

    // 再执行 removeTheme，应该能移除该样式
    tm.removeTheme()
    expect(document.getElementById('ldesign-theme-variables')).toBeFalsy()
  })
})
