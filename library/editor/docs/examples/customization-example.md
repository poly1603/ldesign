# 定制化示例

本文档提供了详细的代码示例，展示如何定制编辑器的各个方面。

## 示例 1: 基础配置

这是最简单的配置方式：

```typescript
import { Editor, getConfigManager } from '@ldesign/editor'
import '@ldesign/editor/dist/editor.css'

// 初始化配置
const config = getConfigManager({
  icons: { defaultSet: 'lucide' },
  theme: { defaultTheme: 'light' },
  i18n: { defaultLocale: 'zh-CN' }
})

// 创建编辑器
const editor = new Editor({
  element: document.getElementById('editor'),
  content: '<p>开始编辑...</p>'
})
```

## 示例 2: 深色主题配置

```typescript
import { getConfigManager } from '@ldesign/editor'

const config = getConfigManager({
  theme: {
    defaultTheme: 'dark',
    followSystem: false  // 不跟随系统主题
  }
})

// 稍后可以手动切换
config.setTheme('high-contrast')
```

## 示例 3: 自定义主题

```typescript
import { getThemeManager, Theme } from '@ldesign/editor'

// 创建自定义主题
const oceanTheme: Theme = {
  name: 'ocean',
  isDark: false,
  colors: {
    primary: '#0ea5e9',
    primaryHover: '#0284c7',
    primaryActive: '#0369a1',
    secondary: '#06b6d4',
    success: '#14b8a6',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textDisabled: '#94a3b8',
    textInverse: '#ffffff',
    
    background: '#f8fafc',
    backgroundPaper: '#ffffff',
    backgroundOverlay: 'rgba(15, 23, 42, 0.5)',
    
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderDark: '#cbd5e1',
    
    toolbarBackground: '#ffffff',
    toolbarText: '#334155',
    toolbarButtonHover: '#f1f5f9',
    toolbarButtonActive: '#e2e8f0',
    
    editorBackground: '#ffffff',
    editorText: '#0f172a',
    editorCursor: '#0ea5e9',
    editorSelection: 'rgba(14, 165, 233, 0.2)',
    editorPlaceholder: '#94a3b8',
    
    codeBackground: '#f1f5f9',
    codeText: '#0f172a',
    codeBorder: '#e2e8f0',
    
    link: '#0ea5e9',
    linkHover: '#0284c7',
    linkVisited: '#7c3aed',
    
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowLight: 'rgba(0, 0, 0, 0.05)',
    shadowDark: 'rgba(0, 0, 0, 0.15)'
  },
  fonts: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontFamilyMonospace: 'Consolas, Monaco, "Courier New", monospace',
    fontSizeXs: '12px',
    fontSizeSm: '14px',
    fontSizeMd: '16px',
    fontSizeLg: '18px',
    fontSizeXl: '20px',
    fontSize2xl: '24px',
    fontSize3xl: '30px',
    fontWeightLight: 300,
    fontWeightNormal: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    lineHeightTight: 1.25,
    lineHeightNormal: 1.5,
    lineHeightRelaxed: 1.75
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px'
  },
  borders: {
    radiusNone: '0',
    radiusSm: '2px',
    radiusMd: '6px',
    radiusLg: '12px',
    radiusFull: '9999px',
    widthThin: '1px',
    widthNormal: '2px',
    widthThick: '4px'
  }
}

// 添加并使用自定义主题
const themeManager = getThemeManager()
themeManager.addCustomTheme(oceanTheme)
themeManager.setTheme('ocean')
```

## 示例 4: 自定义图标集

```typescript
import { 
  getIconManager, 
  IconSet, 
  IconDefinition, 
  IconCategory 
} from '@ldesign/editor'

// 创建自定义图标集
class CustomIconSet implements IconSet {
  name = 'custom' as const
  displayName = 'Custom Icons'
  version = '1.0.0'
  icons = new Map<string, IconDefinition>()
  
  constructor() {
    // 添加自定义图标
    this.icons.set('rocket', {
      name: 'rocket',
      svg: '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>',
      viewBox: '0 0 24 24',
      category: IconCategory.OTHER,
      tags: ['rocket', 'launch', 'space']
    })
    
    this.icons.set('star-filled', {
      name: 'star-filled',
      svg: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
      viewBox: '0 0 24 24',
      category: IconCategory.OTHER,
      tags: ['star', 'favorite', 'rating']
    })
  }
  
  getIcon(name: string): IconDefinition | null {
    return this.icons.get(name) || null
  }
  
  getAllIcons(): IconDefinition[] {
    return Array.from(this.icons.values())
  }
  
  getIconsByCategory(category: IconCategory): IconDefinition[] {
    return this.getAllIcons().filter(icon => icon.category === category)
  }
  
  searchIcons(query: string): IconDefinition[] {
    const lowerQuery = query.toLowerCase()
    return this.getAllIcons().filter(icon => 
      icon.name.toLowerCase().includes(lowerQuery) ||
      icon.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }
}

// 注册并使用自定义图标集
const iconManager = getIconManager()
iconManager.registerIconSet(new CustomIconSet())
iconManager.setDefaultIconSet('custom')
```

## 示例 5: 添加设置按钮

```typescript
import { 
  Editor, 
  showSettingsPanel, 
  createIconButton 
} from '@ldesign/editor'

const editor = new Editor({
  element: document.getElementById('editor')
})

// 创建设置按钮
const settingsButton = createIconButton('settings', {
  title: '编辑器设置',
  onClick: () => {
    showSettingsPanel({
      width: '800px',
      onSave: (config) => {
        // 保存配置到本地存储
        localStorage.setItem('editor-settings', JSON.stringify(config))
        console.log('设置已保存')
      }
    })
  }
})

// 将按钮添加到工具栏或页面中
document.querySelector('.toolbar')?.appendChild(settingsButton)
```

## 示例 6: 多语言支持

```typescript
import { getI18n, LocaleMessages } from '@ldesign/editor'

const i18n = getI18n()

// 添加法语支持
const frenchMessages: LocaleMessages = {
  editor: {
    toolbar: {
      bold: 'Gras',
      italic: 'Italique',
      underline: 'Souligné',
      strikethrough: 'Barré',
      heading: 'Titre',
      paragraph: 'Paragraphe',
      blockquote: 'Citation',
      codeBlock: 'Bloc de code',
      bulletList: 'Liste à puces',
      orderedList: 'Liste numérotée',
      link: 'Lien',
      image: 'Image',
      table: 'Tableau'
    },
    dialog: {
      confirm: 'Confirmer',
      cancel: 'Annuler',
      save: 'Enregistrer'
    }
  }
}

i18n.addMessages('fr-FR', frenchMessages)

// 切换语言
await i18n.setLocale('fr-FR')

// 使用翻译
const boldLabel = i18n.t('editor.toolbar.bold')  // "Gras"
```

## 示例 7: 响应式主题切换

```typescript
import { getThemeManager } from '@ldesign/editor'

const themeManager = getThemeManager()

// 创建主题切换器
function createThemeSwitcher() {
  const container = document.createElement('div')
  container.className = 'theme-switcher'
  
  const themes = ['light', 'dark', 'high-contrast']
  
  themes.forEach(theme => {
    const button = document.createElement('button')
    button.textContent = theme
    button.onclick = () => {
      themeManager.setTheme(theme)
      updateActiveButton()
    }
    container.appendChild(button)
  })
  
  function updateActiveButton() {
    const currentTheme = themeManager.getCurrentThemeName()
    Array.from(container.children).forEach((btn, index) => {
      btn.classList.toggle('active', themes[index] === currentTheme)
    })
  }
  
  updateActiveButton()
  return container
}

// 添加到页面
document.body.appendChild(createThemeSwitcher())

// 监听系统主题变化
if (window.matchMedia) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', (e) => {
    themeManager.setTheme(e.matches ? 'dark' : 'light')
  })
}
```

## 示例 8: 使用组件工厂创建自定义对话框

```typescript
import { getComponentFactory } from '@ldesign/editor'

const factory = getComponentFactory()

function showCustomDialog() {
  // 创建对话框容器
  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `
  
  // 创建对话框内容
  const dialog = factory.createCard({
    title: '自定义设置',
    className: 'custom-dialog'
  })
  
  dialog.style.cssText = `
    min-width: 400px;
    max-width: 600px;
  `
  
  // 添加表单字段
  const nameInput = factory.createInput({
    placeholder: '输入名称',
    value: ''
  })
  
  const emailInput = factory.createInput({
    type: 'email',
    placeholder: '输入邮箱',
    value: ''
  })
  
  const agreeCheck = factory.createCheckbox('我同意条款和条件', false)
  
  // 创建按钮组
  const buttonGroup = document.createElement('div')
  buttonGroup.style.cssText = `
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 16px;
  `
  
  const cancelBtn = factory.createButton({
    label: '取消',
    type: 'secondary',
    onClick: () => overlay.remove()
  })
  
  const submitBtn = factory.createButton({
    label: '提交',
    type: 'primary',
    onClick: () => {
      console.log('提交表单')
      overlay.remove()
    }
  })
  
  buttonGroup.appendChild(cancelBtn)
  buttonGroup.appendChild(submitBtn)
  
  // 组装对话框
  const content = dialog.querySelector('.card-content')
  if (content) {
    content.appendChild(factory.createFormGroup('名称', nameInput))
    content.appendChild(factory.createFormGroup('邮箱', emailInput))
    content.appendChild(factory.createDivider())
    content.appendChild(agreeCheck)
    content.appendChild(buttonGroup)
  }
  
  overlay.appendChild(dialog)
  document.body.appendChild(overlay)
  
  // 点击遮罩层关闭
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove()
    }
  })
}

// 使用
showCustomDialog()
```

## 示例 9: 配置持久化

```typescript
import { getConfigManager } from '@ldesign/editor'

const CONFIG_KEY = 'editor-config'

// 从本地存储加载配置
function loadConfig() {
  try {
    const saved = localStorage.getItem(CONFIG_KEY)
    if (saved) {
      const config = getConfigManager()
      config.importConfig(saved)
      console.log('配置已恢复')
    }
  } catch (error) {
    console.error('加载配置失败:', error)
  }
}

// 保存配置到本地存储
function saveConfig() {
  try {
    const config = getConfigManager()
    const json = config.exportConfig()
    localStorage.setItem(CONFIG_KEY, json)
    console.log('配置已保存')
  } catch (error) {
    console.error('保存配置失败:', error)
  }
}

// 监听配置变化并自动保存
const config = getConfigManager()
config.on('config:changed', () => {
  saveConfig()
})

// 页面加载时恢复配置
window.addEventListener('load', loadConfig)
```

## 示例 10: 完整应用

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>编辑器完整示例</title>
  <link rel="stylesheet" href="path/to/editor.css">
  <style>
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    
    .app-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    
    .app-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      background: var(--editor-color-background-paper);
      border-bottom: 1px solid var(--editor-color-border);
    }
    
    .app-header h1 {
      margin: 0;
      font-size: 20px;
    }
    
    .header-actions {
      display: flex;
      gap: 8px;
    }
    
    .editor-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <div class="app-header">
      <h1>我的编辑器</h1>
      <div class="header-actions"></div>
    </div>
    <div class="editor-wrapper">
      <div id="editor"></div>
    </div>
  </div>
  
  <script type="module">
    import { 
      Editor,
      getConfigManager,
      createIconButton,
      showSettingsPanel
    } from './path/to/editor.js'
    
    // 初始化配置
    const config = getConfigManager({
      icons: { defaultSet: 'lucide' },
      theme: { 
        defaultTheme: 'light',
        followSystem: true 
      },
      i18n: { defaultLocale: 'zh-CN' }
    })
    
    // 创建编辑器
    const editor = new Editor({
      element: document.getElementById('editor'),
      content: '<h1>欢迎使用编辑器</h1><p>开始你的创作...</p>'
    })
    
    // 创建头部按钮
    const headerActions = document.querySelector('.header-actions')
    
    // 主题切换按钮
    const themeBtn = createIconButton('palette', {
      title: '切换主题',
      onClick: () => {
        const currentTheme = config.getThemeManager().getCurrentThemeName()
        const nextTheme = currentTheme === 'light' ? 'dark' : 'light'
        config.setTheme(nextTheme)
      }
    })
    
    // 设置按钮
    const settingsBtn = createIconButton('settings', {
      title: '设置',
      onClick: () => {
        showSettingsPanel({
          onSave: (newConfig) => {
            localStorage.setItem('editor-config', JSON.stringify(newConfig))
          }
        })
      }
    })
    
    // 保存按钮
    const saveBtn = createIconButton('save', {
      title: '保存',
      onClick: () => {
        const content = editor.getContent()
        localStorage.setItem('editor-content', content)
        alert('内容已保存')
      }
    })
    
    headerActions.appendChild(themeBtn)
    headerActions.appendChild(settingsBtn)
    headerActions.appendChild(saveBtn)
    
    // 恢复保存的内容
    const savedContent = localStorage.getItem('editor-content')
    if (savedContent) {
      editor.setContent(savedContent)
    }
    
    // 恢复保存的配置
    const savedConfig = localStorage.getItem('editor-config')
    if (savedConfig) {
      try {
        config.importConfig(savedConfig)
      } catch (error) {
        console.error('恢复配置失败:', error)
      }
    }
  </script>
</body>
</html>
```

## 更多资源

- [定制指南](../guide/customization.md)
- [API 文档](../api/editor.md)
- [主题开发](../guide/theme-development.md)
- [图标使用指南](../guide/icons.md)






