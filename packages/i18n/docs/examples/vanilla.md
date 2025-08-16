# Vanilla JavaScript 示例

本页面展示如何在原生 JavaScript 项目中使用 @ldesign/i18n。

## 在线演示

你可以在 [这里](../../examples/vanilla/) 查看完整的在线演示。

## 基础设置

### HTML 结构

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>@ldesign/i18n - Vanilla JavaScript Example</title>
  </head>
  <body>
    <div id="app">
      <header>
        <h1>多语言示例</h1>
        <div id="current-language">Loading...</div>
      </header>

      <div class="controls">
        <button id="btn-en" onclick="changeLanguage('en')">English</button>
        <button id="btn-zh-cn" onclick="changeLanguage('zh-CN')">中文</button>
        <button id="btn-ja" onclick="changeLanguage('ja')">日本語</button>
      </div>

      <div class="content">
        <div class="section">
          <h3>基础翻译</h3>
          <div class="example">
            <span id="text-ok">-</span>
            <span id="text-cancel">-</span>
          </div>
        </div>

        <div class="section">
          <h3>插值翻译</h3>
          <div class="example">
            <div id="text-welcome">-</div>
            <div id="text-page-info">-</div>
          </div>
        </div>
      </div>
    </div>

    <script type="module" src="./main.js"></script>
  </body>
</html>
```

### JavaScript 实现

```javascript
// main.js
import { createI18nWithBuiltinLocales } from '@ldesign/i18n'

let i18n = null

// 初始化 I18n
async function initI18n() {
  try {
    i18n = await createI18nWithBuiltinLocales({
      defaultLocale: 'en',
      fallbackLocale: 'en',
      autoDetect: true,
      storage: 'localStorage',
      cache: {
        enabled: true,
        maxSize: 1000,
      },
    })

    // 监听语言变更事件
    i18n.on('languageChanged', locale => {
      console.log('Language changed to:', locale)
      updateUI()
      updatePageLanguage(locale)
    })

    // 监听加载错误
    i18n.on('loadError', (locale, error) => {
      console.error(`Failed to load language '${locale}':`, error)
      showError(`语言包加载失败: ${error.message}`)
    })

    // 初始更新 UI
    updateUI()

    console.log('I18n initialized successfully')
  } catch (error) {
    console.error('Failed to initialize I18n:', error)
    showError(`初始化失败: ${error.message}`)
  }
}

// 更新 UI
function updateUI() {
  if (!i18n) return

  try {
    const currentLang = i18n.getCurrentLanguage()
    const langInfo = i18n.getCurrentLanguageInfo()

    // 更新当前语言显示
    document.getElementById('current-language').textContent = `当前语言: ${
      langInfo?.nativeName || currentLang
    } (${currentLang})`

    // 更新按钮状态
    document.querySelectorAll('.controls button').forEach(btn => {
      btn.classList.remove('active')
    })
    const activeBtn = document.getElementById(`btn-${currentLang.toLowerCase()}`)
    if (activeBtn) activeBtn.classList.add('active')

    // 基础翻译
    document.getElementById('text-ok').textContent = i18n.t('common.ok')
    document.getElementById('text-cancel').textContent = i18n.t('common.cancel')

    // 插值翻译
    document.getElementById('text-welcome').textContent = i18n.t('common.welcome', {
      name: 'JavaScript',
    })
    document.getElementById('text-page-info').textContent = i18n.t('common.pageOf', {
      current: 1,
      total: 10,
    })
  } catch (error) {
    console.error('Error updating UI:', error)
    showError(`UI 更新失败: ${error.message}`)
  }
}

// 切换语言
window.changeLanguage = async function (locale) {
  if (!i18n) return

  try {
    await i18n.changeLanguage(locale)
  } catch (error) {
    console.error('Failed to change language:', error)
    showError(`语言切换失败: ${error.message}`)
  }
}

// 更新页面语言属性
function updatePageLanguage(locale) {
  document.documentElement.lang = locale

  // 更新页面标题
  const titles = {
    en: '@ldesign/i18n - Vanilla JavaScript Example',
    'zh-CN': '@ldesign/i18n - 原生 JavaScript 示例',
    ja: '@ldesign/i18n - Vanilla JavaScript サンプル',
  }
  document.title = titles[locale] || titles.en
}

// 显示错误
function showError(message) {
  const errorDiv = document.createElement('div')
  errorDiv.className = 'error'
  errorDiv.textContent = message
  document.body.appendChild(errorDiv)

  // 5秒后自动移除
  setTimeout(() => {
    errorDiv.remove()
  }, 5000)
}

// 初始化
initI18n()
```

## 高级功能示例

### 复数处理

```javascript
// 复数翻译示例
function updateItemCount(count) {
  const text = i18n.t('common.items', { count })
  document.getElementById('item-count').textContent = text
}

// 测试不同数量
updateItemCount(0) // "no items"
updateItemCount(1) // "one item"
updateItemCount(5) // "5 items"
```

### 批量翻译

```javascript
// 批量获取翻译
function updateButtons() {
  const buttonTexts = i18n.batchTranslate([
    'common.save',
    'common.delete',
    'common.edit',
    'common.cancel',
  ])

  // 更新按钮文本
  Object.entries(buttonTexts).forEach(([key, text]) => {
    const buttonId = key.replace('common.', 'btn-')
    const button = document.getElementById(buttonId)
    if (button) button.textContent = text
  })
}
```

### 嵌套键访问

```javascript
// 访问嵌套的翻译键
function updateMenu() {
  document.getElementById('menu-new').textContent = i18n.t('menu.file.new')
  document.getElementById('menu-open').textContent = i18n.t('menu.file.open')
  document.getElementById('menu-save').textContent = i18n.t('menu.file.save')
}
```

### 条件翻译

```javascript
// 根据条件显示不同翻译
function updateStatus(isOnline) {
  const statusKey = isOnline ? 'common.online' : 'common.offline'
  const statusText = i18n.t(statusKey)
  document.getElementById('status').textContent = `状态: ${statusText}`
}
```

### 表单验证

```javascript
// 表单验证消息
function validateForm(formData) {
  const errors = []

  if (!formData.name) {
    errors.push(i18n.t('validation.required'))
  }

  if (formData.email && !isValidEmail(formData.email)) {
    errors.push(i18n.t('validation.email'))
  }

  if (formData.password && formData.password.length < 6) {
    errors.push(i18n.t('validation.passwordMinLength', { min: 6 }))
  }

  return errors
}
```

## 性能优化

### 预加载语言包

```javascript
// 预加载常用语言
async function preloadLanguages() {
  const commonLanguages = ['en', 'zh-CN', 'ja']

  for (const locale of commonLanguages) {
    try {
      await i18n.preloadLanguage(locale)
      console.log(`Preloaded language: ${locale}`)
    } catch (error) {
      console.warn(`Failed to preload language ${locale}:`, error)
    }
  }
}
```

### 缓存管理

```javascript
// 检查缓存状态
function checkCacheStatus() {
  const cacheSize = i18n.cache?.size() || 0
  console.log(`Cache size: ${cacheSize}`)

  // 清理缓存（如果需要）
  if (cacheSize > 500) {
    i18n.cache?.clear()
    console.log('Cache cleared')
  }
}
```

## 错误处理

### 全局错误处理

```javascript
// 设置全局错误处理
i18n.on('loadError', (locale, error) => {
  // 记录错误
  console.error(`Language load error for ${locale}:`, error)

  // 显示用户友好的错误消息
  const errorMessage = i18n.t(
    'errors.languageLoadFailed',
    {
      language: locale,
    },
    {
      defaultValue: `Failed to load language: ${locale}`,
    }
  )

  showNotification(errorMessage, 'error')
})

// 翻译错误处理
function safeTranslate(key, params = {}, fallback = key) {
  try {
    return i18n.t(key, params)
  } catch (error) {
    console.warn(`Translation error for key '${key}':`, error)
    return fallback
  }
}
```

### 网络错误处理

```javascript
// 处理网络相关的加载错误
async function handleLanguageChange(locale) {
  try {
    // 显示加载状态
    showLoading(true)

    await i18n.changeLanguage(locale)

    // 隐藏加载状态
    showLoading(false)
  } catch (error) {
    showLoading(false)

    if (error.message.includes('network')) {
      showError(i18n.t('errors.networkError'))
    } else {
      showError(i18n.t('errors.unknownError'))
    }
  }
}
```

## 完整示例

查看 [examples/vanilla](../../examples/vanilla/) 目录获取完整的可运行示例，包括：

- 完整的 HTML 结构和样式
- 所有功能的实现代码
- 错误处理和用户体验优化
- 性能优化技巧

## 运行示例

```bash
# 进入示例目录
cd examples/vanilla

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

示例将在 http://localhost:3000 启动。
