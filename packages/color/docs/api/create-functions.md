# 创建函数

便捷函数集合，快速创建主题管理器：

```ts
import {
  createThemeManager,
  createThemeManagerWithPresets,
  createSimpleThemeManager,
  createCustomThemeManager,
} from '@ldesign/color'
```

- createThemeManager(options?): ThemeManagerInstance
- createThemeManagerWithPresets(options?): Promise<ThemeManagerInstance>
- createSimpleThemeManager(options?): Promise<ThemeManagerInstance>
- createCustomThemeManager(primaryColor, options?): Promise<ThemeManagerInstance>

