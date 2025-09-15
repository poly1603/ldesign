# ThemeManager

主题管理器核心类，负责主题/模式切换、色阶与 CSS 变量注入、持久化与预生成。

## 构造与初始化

```ts
import { ThemeManager } from '@ldesign/color'

const tm = new ThemeManager({ defaultTheme: 'default', autoDetect: true })
await tm.init()
```

## 常用方法

- getCurrentTheme(): string
- getCurrentMode(): 'light' | 'dark'
- setTheme(theme: string, mode?: 'light'|'dark'): Promise<void>
- setMode(mode: 'light'|'dark'): Promise<void>
- toggleMode(): Promise<void>
- registerTheme(config: ThemeConfig): void
- registerThemes(configs: ThemeConfig[]): void
- getThemeNames(): string[]
- preGenerateTheme(name: string): Promise<void>
- preGenerateAllThemes(): Promise<void>
- applyTheme(name: string, mode: 'light'|'dark'): void
- removeTheme(): void
- destroy(): void

### 新增（SSR 与作用域主题）
- renderThemeCSS(name: string, mode?: 'light'|'dark', options?: { includeComments?: boolean }): Promise<string>
  - 用于 SSR 阶段生成完整 CSS 字符串（包含 light/dark 两段），在服务端内联到 <style id="ldesign-theme-variables"> 中。
- hydrateMountedStyles(idOrSelector?: string): void
  - 客户端接管 SSR 注入的 <style>，避免重复注入与闪烁。
- applyThemeTo(root: Element, theme?: string, mode?: 'light'|'dark'): Promise<void>
  - 将主题限定应用到指定容器，容器将自动获得 data-theme-scope="scope-xxxx"，选择器为 [data-theme-scope="..."]。
- removeThemeFrom(root: Element): void
  - 移除指定容器的作用域主题。

### 新增（性能）
- 通过 ThemeManagerOptions.useConstructableCss 启用 Constructable Stylesheet 注入；CSS 注入器内部具备最小差量更新，重复内容会跳过写入。

详见类型定义与源码注释。

