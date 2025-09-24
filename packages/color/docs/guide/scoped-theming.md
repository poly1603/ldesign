# 作用域主题（Scoped Theming）

将主题限制在指定容器内，支持同一页面多主题共存（主题“隔离岛”）。

## 快速上手

```ts
import { ThemeManager } from '@ldesign/color'

const tm = new ThemeManager({
  themes: [
    /* presets/custom */
  ],
  cssPrefix: '--color',
})
const aside = document.querySelector('#aside')!

await tm.applyThemeTo(aside, 'green', 'light')
// aside 将自动获得 data-theme-scope="scope-xxxx"
// 对应的 CSS 注入选择器为 [data-theme-scope="scope-xxxx"]

// 在容器内部切换暗色
aside.setAttribute('data-theme-mode', 'dark')
```

## 清理

```ts
// 移除作用域主题
await tm.removeThemeFrom(aside)
```

## 最佳实践

- 对于需要多主题预览的页面，建议按需创建和销毁作用域样式，避免 head 中残留多余 style。
- 与 SSR 并用时：可在服务端为关键容器内联作用域 CSS（高级场景，可自行拼接选择器），客户端使用 applyThemeTo/hydrate 维护。
