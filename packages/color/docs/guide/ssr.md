# SSR 指南

本文介绍如何在 SSR（服务端渲染）场景下使用 @ldesign/color，避免 FOUC（样式闪烁）并提升首屏体验。

## 基本思路
- 服务端：使用 renderThemeCSS 生成完整 CSS 字符串，内联到 HTML <head> 中的 <style id="ldesign-theme-variables">。
- 客户端：初始化 ThemeManager 后调用 hydrateMountedStyles 接管已有样式，避免重复注入与闪烁。

## 服务端示例（伪代码）
```ts
import { ThemeManager } from '@ldesign/color'

export async function render() {
  const tm = new ThemeManager({
    themes: [/* 你的主题 */],
    cssPrefix: '--color',
  })
  await tm.preGenerateTheme('default')
  const css = await tm.renderThemeCSS('default', 'light', { includeComments: true })

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style id="ldesign-theme-variables">${css}</style>
  </head>
  <body>
    <div id="app">${/* ssr html */ ''}</div>
    <script type="module" src="/client-entry.js"></script>
  </body>
</html>`
}
```

## 客户端接管（Hydrate）
```ts
import { ThemeManager } from '@ldesign/color'

const tm = new ThemeManager({
  themes: [/* same as server */],
  cssPrefix: '--color',
  useConstructableCss: true, // 可选：提升注入性能
})

tm.hydrateMountedStyles() // 默认接管 id="ldesign-theme-variables"
await tm.init()
```

## 多主题/动态切换
客户端接管后，直接使用 tm.setTheme 或 tm.setMode 即可，无需担心重复注入。

## 注意事项
- 请统一服务端与客户端的主题列表与 cssPrefix，以确保变量一致。
- 对于多路由应用，建议缓存 renderThemeCSS 结果，减少重复生成。
