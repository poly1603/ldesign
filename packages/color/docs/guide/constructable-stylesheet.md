# Constructable Stylesheet 与性能

@ldesign/color 的 CSS 注入器在支持的环境下可选择使用 Constructable Stylesheet（document.adoptedStyleSheets），提升注入性能并减少 DOM 变更。

## 启用方式
- 全局（通过 ThemeManager）：
```ts
const tm = new ThemeManager({
  themes: [/* ... */],
  cssPrefix: '--color',
  useConstructableCss: true,
})
```

- 作用域主题会继承该配置：
```ts
const panel = document.querySelector('#panel')!
await tm.applyThemeTo(panel, 'default', 'light')
```

## 行为与回退
- 若环境支持，将使用 CSSStyleSheet#replaceSync/replace 写入规则，并通过 adoptedStyleSheets 进行挂载。
- 若不支持，则自动回退至 <style> 标签方式，兼容性不受影响。

## 差量更新与稳定性
- 注入器默认具备最小差量更新：当生成的 CSS 文本未变化时跳过写入，减少 CSSOM 震荡。
- 推荐配合主题缓存与预生成，进一步降低首屏与切换开销。

## 注意事项
- SSR 内联 CSS 与 Constructable 路径可正常协同：SSR 负责首屏，客户端接管后继续使用 Constructable 替换/更新。
- 某些老旧环境不支持 adoptedStyleSheets，请保持 useConstructableCss 可配置。
