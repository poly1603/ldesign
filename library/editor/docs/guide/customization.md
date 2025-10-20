# 编辑器定制指南

本指南将帮助您定制编辑器的外观和行为，包括图标、主题和语言设置。

## 目录

- [配置管理](#配置管理)
- [图标系统](#图标系统)
- [主题系统](#主题系统)
- [多语言系统](#多语言系统)
- [UI组件工厂](#ui组件工厂)
- [设置面板](#设置面板)

## 配置管理

配置管理器（ConfigManager）提供了统一的接口来管理编辑器的所有配置。

### 基础用法

```typescript
import { getConfigManager } from '@ldesign/editor'

// 获取配置管理器实例
const configManager = getConfigManager({
  // 图标配置
  icons: {
    defaultSet: 'lucide',
    enableCache: true
  },
  
  // 主题配置
  theme: {
    defaultTheme: 'light',
    followSystem: true
  },
  
  // 多语言配置
  i18n: {
    defaultLocale: 'zh-CN',
    fallbackLocale: 'en-US'
  }
})
```

### API 方法

```typescript
// 获取各个管理器
const iconManager = configManager.getIconManager()
const themeManager = configManager.getThemeManager()
const i18nManager = configManager.getI18nManager()

// 快捷方法
configManager.setIconSet('feather')
configManager.setTheme('dark')
configManager.setLocale('en-US')

// 导出/导入配置
const configJson = configManager.exportConfig()
configManager.importConfig(configJson)

// 重置配置
configManager.reset()
```

## 图标系统

图标管理器支持多种图标集，并允许自定义图标。

### 切换图标集

```typescript
import { getIconManager } from '@ldesign/editor'

const iconManager = getIconManager()

// 切换到 Feather 图标集
iconManager.setDefaultIconSet('feather')

// 切换到 Material 图标集
iconManager.setDefaultIconSet('material')

// 切换回 Lucide 图标集（默认）
iconManager.setDefaultIconSet('lucide')
```

### 渲染图标

```typescript
// 渲染图标为 HTML 字符串
const iconHtml = iconManager.renderIcon('bold', {
  size: 20,
  color: '#333',
  strokeWidth: 2
})

// 创建图标 DOM 元素
const iconElement = iconManager.createIconElement('italic', {
  size: 24,
  spinning: true  // 旋转动画
})
document.body.appendChild(iconElement)
```

### 注册自定义图标

```typescript
// 注册单个图标
iconManager.registerIcon('my-icon', `
  <svg viewBox="0 0 24 24">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
  </svg>
`, 'custom')

// 创建自定义图标集
import { IconSet, IconCategory } from '@ldesign/editor'

class MyIconSet implements IconSet {
  name = 'my-icons' as const
  displayName = 'My Custom Icons'
  icons = new Map()
  
  // 实现必需的方法...
}

iconManager.registerIconSet(new MyIconSet())
```

### 搜索和分类

```typescript
// 搜索图标
const results = iconManager.searchIcons('arrow')

// 按分类获取图标
import { IconCategory } from '@ldesign/editor'
const formatIcons = iconManager.getIconsByCategory(IconCategory.FORMAT)
const mediaIcons = iconManager.getIconsByCategory(IconCategory.MEDIA)
```

## 主题系统

主题管理器支持浅色、深色和高对比度主题，也支持自定义主题。

### 切换主题

```typescript
import { getThemeManager } from '@ldesign/editor'

const themeManager = getThemeManager()

// 切换到深色主题
themeManager.setTheme('dark')

// 切换到高对比度主题
themeManager.setTheme('high-contrast')

// 获取当前主题
const currentTheme = themeManager.getCurrentTheme()
```

### 自动跟随系统主题

```typescript
// 跟随系统主题设置
themeManager.followSystemTheme()

// 或手动检测系统主题
const systemTheme = themeManager.detectSystemTheme() // 'light' | 'dark'
themeManager.setTheme(systemTheme)
```

### 创建自定义主题

```typescript
import { Theme } from '@ldesign/editor'

const myTheme: Theme = {
  name: 'my-theme',
  isDark: false,
  colors: {
    primary: '#ff6b6b',
    primaryHover: '#ff5252',
    primaryActive: '#ff3838',
    // ... 更多颜色
    textPrimary: '#2c3e50',
    textSecondary: '#7f8c8d',
    background: '#ffffff',
    // ... 完整的颜色配置
  },
  fonts: {
    fontFamily: 'Inter, sans-serif',
    fontFamilyMonospace: 'Fira Code, monospace',
    fontSizeMd: '16px',
    // ... 字体配置
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    // ... 间距配置
  },
  borders: {
    radiusMd: '8px',
    widthNormal: '2px',
    // ... 边框配置
  }
}

// 添加自定义主题
themeManager.addCustomTheme(myTheme)

// 使用自定义主题
themeManager.setTheme('my-theme')
```

### 使用主题变量

所有主题变量都自动注入到CSS变量中，可以在样式中直接使用：

```css
.my-component {
  background: var(--editor-color-background);
  color: var(--editor-color-text-primary);
  border: 1px solid var(--editor-color-border);
  border-radius: var(--editor-border-radius-md);
  padding: var(--editor-spacing-md);
  font-family: var(--editor-font-font-family);
}
```

## 多语言系统

多语言管理器支持中文、英文和日文，也支持添加自定义语言。

### 切换语言

```typescript
import { getI18n } from '@ldesign/editor'

const i18n = getI18n()

// 切换到英文
await i18n.setLocale('en-US')

// 切换到日文
await i18n.setLocale('ja-JP')

// 切换回中文
await i18n.setLocale('zh-CN')
```

### 翻译文本

```typescript
// 使用翻译键
const boldText = i18n.t('editor.toolbar.bold')  // '加粗'

// 带参数的翻译
const message = i18n.t('editor.message.saved', { time: '10:30' })

// 使用便捷函数
import { t } from '@ldesign/editor'
const text = t('editor.toolbar.italic')
```

### 添加自定义语言包

```typescript
import { LocaleMessages } from '@ldesign/editor'

const customLocale: LocaleMessages = {
  editor: {
    toolbar: {
      bold: 'Negrita',      // 西班牙语
      italic: 'Cursiva',
      // ... 更多翻译
    },
    // ... 完整的翻译
  }
}

// 添加自定义语言包
i18n.addMessages('es-ES', customLocale)

// 使用自定义语言
await i18n.setLocale('es-ES')
```

### 动态加载语言包

```typescript
// 从远程加载语言包
async function loadRemoteLocale(locale: string) {
  const response = await fetch(`/locales/${locale}.json`)
  const messages = await response.json()
  i18n.addMessages(locale, messages)
  await i18n.setLocale(locale)
}

loadRemoteLocale('fr-FR')
```

## UI组件工厂

组件工厂提供了统一的UI组件创建方法，确保一致的外观和行为。

### 创建按钮

```typescript
import { getComponentFactory, ButtonType } from '@ldesign/editor'

const factory = getComponentFactory()

// 创建主要按钮
const primaryBtn = factory.createButton({
  label: '保存',
  type: 'primary',
  icon: 'save',
  onClick: () => console.log('保存')
})

// 创建图标按钮
const iconBtn = factory.createIconButton('settings', {
  title: '设置',
  type: 'text'
})

// 创建加载状态按钮
const loadingBtn = factory.createButton({
  label: '加载中',
  loading: true,
  disabled: true
})
```

### 创建表单元素

```typescript
// 创建输入框
const input = factory.createInput({
  type: 'text',
  placeholder: '请输入...',
  value: '',
  onChange: (value) => console.log(value)
})

// 创建下拉选择框
const select = factory.createSelect({
  options: [
    { label: '选项1', value: 1 },
    { label: '选项2', value: 2 }
  ],
  placeholder: '请选择',
  onChange: (value) => console.log(value)
})

// 创建复选框
const checkbox = factory.createCheckbox(
  '记住我',
  false,
  (checked) => console.log(checked)
)

// 创建文本域
const textarea = factory.createTextarea({
  placeholder: '请输入内容',
  rows: 5,
  onChange: (value) => console.log(value)
})
```

### 创建布局组件

```typescript
// 创建表单组
const formGroup = factory.createFormGroup('用户名', input)

// 创建卡片
const card = factory.createCard({
  title: '设置',
  content: '这是卡片内容'
})

// 创建分隔线
const divider = factory.createDivider()

// 创建标签
const label = factory.createLabel('邮箱', 'email-input')
```

### 便捷函数

```typescript
import { 
  createButton, 
  createIconButton, 
  createInput, 
  createSelect,
  createCheckbox 
} from '@ldesign/editor'

// 直接使用便捷函数
const btn = createButton({ label: '确定', type: 'primary' })
const icon = createIconButton('close')
const field = createInput({ placeholder: '输入文本' })
```

## 设置面板

设置面板提供了可视化的配置界面，让用户可以方便地调整编辑器设置。

### 显示设置面板

```typescript
import { showSettingsPanel } from '@ldesign/editor'

// 显示设置面板
const panel = showSettingsPanel({
  width: '600px',
  onSave: (config) => {
    console.log('保存的配置:', config)
  },
  onClose: () => {
    console.log('设置面板已关闭')
  }
})
```

### 自定义设置面板

```typescript
import { SettingsPanel } from '@ldesign/editor'

class CustomSettingsPanel extends SettingsPanel {
  // 添加自定义选项卡
  private createCustomTab() {
    const pane = document.createElement('div')
    // 添加自定义设置项
    return pane
  }
}

const customPanel = new CustomSettingsPanel()
customPanel.show()
```

### 设置面板功能

设置面板包含以下功能：

1. **外观选项卡**
   - 主题选择（浅色、深色、高对比度）
   - 主题预览
   - 自动跟随系统主题选项

2. **图标选项卡**
   - 图标集选择（Lucide、Feather、Material）
   - 图标预览

3. **语言选项卡**
   - 语言选择（中文、英文、日文）

4. **高级选项卡**
   - 导出配置
   - 导入配置
   - 重置为默认设置

## 完整示例

这是一个完整的配置示例，展示如何组合使用所有功能：

```typescript
import { 
  Editor,
  getConfigManager,
  showSettingsPanel 
} from '@ldesign/editor'

// 创建编辑器
const editor = new Editor({
  element: document.getElementById('editor')
})

// 配置管理器
const config = getConfigManager({
  icons: {
    defaultSet: 'lucide',
    enableCache: true
  },
  theme: {
    defaultTheme: 'light',
    followSystem: true
  },
  i18n: {
    defaultLocale: 'zh-CN'
  }
})

// 监听配置变化
config.on('config:changed', (data) => {
  console.log('配置已更改:', data)
})

// 添加设置按钮到工具栏
const settingsBtn = createIconButton('settings', {
  title: '设置',
  onClick: () => {
    showSettingsPanel({
      onSave: (newConfig) => {
        console.log('新配置已保存:', newConfig)
        // 可以在这里保存到服务器或本地存储
        localStorage.setItem('editor-config', JSON.stringify(newConfig))
      }
    })
  }
})

// 从本地存储恢复配置
const savedConfig = localStorage.getItem('editor-config')
if (savedConfig) {
  try {
    config.importConfig(savedConfig)
  } catch (error) {
    console.error('恢复配置失败:', error)
  }
}
```

## 最佳实践

1. **使用单例模式**：所有管理器都使用单例模式，确保全局只有一个实例。

2. **监听事件**：通过监听配置变化事件来响应用户的设置更改。

3. **持久化配置**：使用 `exportConfig` 和 `importConfig` 保存和恢复用户配置。

4. **主题变量**：在自定义组件中使用CSS变量，确保与主题系统协调。

5. **国际化**：所有用户可见的文本都应使用 `i18n.t()` 进行翻译。

6. **组件复用**：使用组件工厂创建UI元素，避免重复代码。

## 故障排除

### 主题不生效

确保在 HTML 的 `<head>` 中引入了样式文件：

```html
<link rel="stylesheet" href="path/to/editor.css">
```

### 图标不显示

检查图标名称是否正确，并确保图标集已加载：

```typescript
const availableSets = iconManager.getAvailableIconSets()
console.log('可用的图标集:', availableSets)
```

### 语言切换后未更新

语言切换是异步的，确保使用 `await`：

```typescript
await i18n.setLocale('en-US')
// 然后重新渲染需要更新的组件
```

## 相关资源

- [API 文档](../api/editor.md)
- [插件开发指南](./plugins.md)
- [主题定制示例](../examples/theme-customization.md)
- [图标使用示例](./icons.md)






