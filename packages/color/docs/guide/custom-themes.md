# 自定义主题

## 使用 createCustomThemeManager（推荐）

```ts
import { createCustomThemeManager } from '@ldesign/color'

const manager = await createCustomThemeManager('#ff6b35', {
  themeName: 'brand',
  darkPrimaryColor: '#ff8c69',
})

await manager.setMode('dark')
```

## 注册多主题

```ts
import { createThemeManager } from '@ldesign/color'

const themes = [
  {
    name: 'brand-blue',
    light: { primary: '#0066cc' },
    dark: { primary: '#4d94ff' },
  },
  {
    name: 'brand-green',
    light: { primary: '#00a854' },
    dark: { primary: '#49aa19' },
  },
]

const manager = new ThemeManager({ themes, defaultTheme: 'brand-blue' })
await manager.init()
```
