/**
 * Web Components 示例主文件
 */

import { createI18n } from '../../esm/index.js'
import { initI18nComponents } from '../../esm/web-components/index.js'

// 添加示例翻译数据
async function addExampleTranslations(i18n) {
  const translations = {
    'en': {
      common: {
        ok: 'OK',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        loading: 'Loading...',
        online: 'Online',
        offline: 'Offline',
        searchPlaceholder: 'Search...',
        pageOf: 'Page {{current}} of {{total}}',
        showingItems: 'Showing {{start}} to {{end}} of {{total}} items',
      },
      validation: {
        username: {
          required: 'Username is required',
        },
        email: {
          invalid: 'Email address',
        },
      },
      date: {
        duration: {
          minutes: '{{count}} minute',
          minutes_plural: '{{count}} minutes',
        },
      },
    },
    'zh-CN': {
      common: {
        ok: '确定',
        cancel: '取消',
        save: '保存',
        delete: '删除',
        edit: '编辑',
        loading: '加载中...',
        online: '在线',
        offline: '离线',
        searchPlaceholder: '搜索...',
        pageOf: '第 {{current}} 页，共 {{total}} 页',
        showingItems: '显示第 {{start}} 到 {{end}} 条，共 {{total}} 条',
      },
      validation: {
        username: {
          required: '用户名必填',
        },
        email: {
          invalid: '邮箱地址',
        },
      },
      date: {
        duration: {
          minutes: '{{count}} 分钟',
        },
      },
    },
    'ja': {
      common: {
        ok: 'OK',
        cancel: 'キャンセル',
        save: '保存',
        delete: '削除',
        edit: '編集',
        loading: '読み込み中...',
        online: 'オンライン',
        offline: 'オフライン',
        searchPlaceholder: '検索...',
        pageOf: '{{current}} / {{total}} ページ',
        showingItems: '{{start}} - {{end}} / {{total}} 件',
      },
      validation: {
        username: {
          required: 'ユーザー名は必須です',
        },
        email: {
          invalid: 'メールアドレス',
        },
      },
      date: {
        duration: {
          minutes: '{{count}} 分',
        },
      },
    },
  }

  // 为每种语言添加翻译数据
  for (const [locale, data] of Object.entries(translations)) {
    try {
      // 创建语言包数据
      const packageData = {
        info: {
          locale,
          name: locale === 'en' ? 'English' : locale === 'zh-CN' ? '中文' : '日本語',
          flag: locale === 'en' ? '🇺🇸' : locale === 'zh-CN' ? '🇨🇳' : '🇯🇵',
          direction: 'ltr'
        },
        translations: data
      }

      // 注册语言包
      i18n.loader.registerPackage(locale, packageData)
      console.log(`✅ Added translations for ${locale}`)
    } catch (error) {
      console.error(`❌ Failed to add translations for ${locale}:`, error)
    }
  }

  console.log('✅ Example translations added successfully')

  // 强制重新加载当前语言以应用新的翻译
  const currentLanguage = i18n.getCurrentLanguage()
  await i18n.changeLanguage(currentLanguage)
}

// 初始化应用
async function initApp() {
  try {
    console.log('🚀 Initializing Web Components example...')

    // 创建 I18n 实例
    const i18n = await createI18n({
      defaultLocale: 'en',
      fallbackLocale: 'en',
      autoDetect: true,
      storage: 'localStorage',
      storageKey: 'i18n-wc-locale',
    })

    console.log('✅ I18n instance created successfully')

    // 添加示例翻译数据
    await addExampleTranslations(i18n)

    // 初始化 Web Components
    initI18nComponents(i18n, {
      debug: true,
    })

    console.log('✅ Web Components initialized successfully')

    // 设置事件监听器
    setupEventListeners()

    console.log('✅ Event listeners setup complete')
    console.log('🎉 Web Components example ready!')

  } catch (error) {
    console.error('❌ Failed to initialize Web Components example:', error)
  }
}

// 设置事件监听器
function setupEventListeners() {
  // 监听语言变化事件
  document.addEventListener('language-changed', (event) => {
    console.log('🌐 Language changed:', event.detail)
    logEvent(`Language changed to: ${event.detail.language}`)
  })

  // 监听语言变化错误事件
  document.addEventListener('language-change-error', (event) => {
    console.error('❌ Language change error:', event.detail)
    logEvent(`Language change error: ${event.detail.error.message}`, 'error')
  })

  // 监听翻译事件
  document.addEventListener('translated', (event) => {
    console.log('📝 Translation:', event.detail)
  })

  // 监听翻译错误事件
  document.addEventListener('translation-error', (event) => {
    console.warn('⚠️ Translation error:', event.detail)
  })

  // 设置按钮点击事件监听器
  const eventButton = document.getElementById('event-button')
  if (eventButton) {
    eventButton.addEventListener('click', (event) => {
      console.log('🔘 Button clicked:', event.detail)
      logEvent(`Button clicked: ${event.detail?.name || 'event-button'}`)
    })
  }

  // 设置输入框事件监听器
  const eventInput = document.getElementById('event-input')
  if (eventInput) {
    eventInput.addEventListener('input', (event) => {
      console.log('⌨️ Input changed:', event.detail)
      logEvent(`Input changed: "${event.detail?.value || ''}"`)
    })

    eventInput.addEventListener('focus', (event) => {
      logEvent('Input focused')
    })

    eventInput.addEventListener('blur', (event) => {
      logEvent('Input blurred')
    })
  }

  // 设置表单提交事件
  const exampleForm = document.getElementById('example-form')
  if (exampleForm) {
    exampleForm.addEventListener('submit', (event) => {
      event.preventDefault()
      logEvent('Form submitted (prevented default)', 'info')
      
      // 获取表单数据
      const formData = new FormData(exampleForm)
      const data = Object.fromEntries(formData.entries())
      console.log('📋 Form data:', data)
      logEvent(`Form data: ${JSON.stringify(data)}`)
    })
  }

  // 监听所有语言选择器的事件
  document.querySelectorAll('i18n-language-switcher').forEach(switcher => {
    switcher.addEventListener('language-changed', (event) => {
      logEvent(`Language switcher: ${event.detail.language}`, 'success')
    })

    switcher.addEventListener('language-change-error', (event) => {
      logEvent(`Language switcher error: ${event.detail.error.message}`, 'error')
    })
  })
}

// 事件日志功能
function logEvent(message, type = 'info') {
  const eventLog = document.getElementById('event-log')
  if (!eventLog) return

  const timestamp = new Date().toLocaleTimeString()
  const colors = {
    info: '#007bff',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
  }

  const color = colors[type] || colors.info
  const icon = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  }[type] || 'ℹ️'

  // 创建新的日志条目
  const logEntry = document.createElement('div')
  logEntry.style.cssText = `
    margin: 0.25rem 0;
    padding: 0.25rem 0;
    border-bottom: 1px solid #e9ecef;
    color: ${color};
  `
  logEntry.innerHTML = `
    <span style="color: #6c757d;">[${timestamp}]</span> 
    ${icon} ${message}
  `

  // 添加到日志容器
  eventLog.appendChild(logEntry)

  // 保持最多20条日志
  const entries = eventLog.querySelectorAll('div')
  if (entries.length > 21) { // +1 for the header
    entries[1].remove() // 移除最旧的条目（跳过标题）
  }

  // 滚动到底部
  eventLog.scrollTop = eventLog.scrollHeight
}

// 演示功能
function demonstrateFeatures() {
  console.log('🎭 Demonstrating Web Components features...')

  // 演示动态参数更新
  setTimeout(() => {
    const pageButtons = document.querySelectorAll('i18n-button[text-key="common.pageOf"]')
    pageButtons.forEach(button => {
      const currentParams = JSON.parse(button.getAttribute('params') || '{}')
      const newParams = {
        current: Math.floor(Math.random() * 10) + 1,
        total: Math.floor(Math.random() * 20) + 10,
      }
      button.setAttribute('params', JSON.stringify(newParams))
      logEvent(`Updated button params: ${JSON.stringify(newParams)}`)
    })
  }, 3000)

  // 演示组件状态切换
  setTimeout(() => {
    const buttons = document.querySelectorAll('i18n-button')
    const randomButton = buttons[Math.floor(Math.random() * buttons.length)]
    if (randomButton) {
      randomButton.setAttribute('loading', 'true')
      logEvent('Set random button to loading state')
      
      setTimeout(() => {
        randomButton.removeAttribute('loading')
        logEvent('Removed loading state from button')
      }, 2000)
    }
  }, 5000)
}

// 错误处理
window.addEventListener('error', (event) => {
  console.error('💥 Global error:', event.error)
  logEvent(`Global error: ${event.error?.message || 'Unknown error'}`, 'error')
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('💥 Unhandled promise rejection:', event.reason)
  logEvent(`Promise rejection: ${event.reason?.message || 'Unknown rejection'}`, 'error')
})

// 启动应用
initApp().then(() => {
  // 延迟演示功能，让用户先看到基本功能
  setTimeout(demonstrateFeatures, 2000)
})

// 导出一些有用的函数到全局作用域，方便调试
window.i18nDemo = {
  logEvent,
  demonstrateFeatures,
}

console.log('📚 Available demo functions: window.i18nDemo.logEvent(), window.i18nDemo.demonstrateFeatures()')
