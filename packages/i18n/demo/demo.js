/**
 * @ldesign/i18n 功能演示
 */

// 导入库
import { I18n, formatNumber, formatCurrency, formatDate } from '../esm/index.js'

// 语言包数据
const messages = {
  'zh-CN': {
    hello: '你好',
    welcome: '欢迎 {name}！',
    user: {
      profile: {
        name: '用户姓名',
        email: '邮箱地址'
      }
    },
    item: '个项目 | 个项目',
    nav: {
      home: '首页',
      about: '关于我们'
    }
  },
  'en': {
    hello: 'Hello',
    welcome: 'Welcome {name}!',
    user: {
      profile: {
        name: 'User Name',
        email: 'Email Address'
      }
    },
    item: 'item | items',
    nav: {
      home: 'Home',
      about: 'About Us'
    }
  },
  'ja': {
    hello: 'こんにちは',
    welcome: 'ようこそ {name}！',
    user: {
      profile: {
        name: 'ユーザー名',
        email: 'メールアドレス'
      }
    },
    item: 'アイテム | アイテム',
    nav: {
      home: 'ホーム',
      about: '私たちについて'
    }
  }
}

// 创建 I18n 实例
const i18n = new I18n({
  defaultLocale: 'zh-CN',
  fallbackLocale: 'en',
  messages,
  cache: {
    enabled: true,
    maxSize: 1000,
    defaultTTL: 60 * 60 * 1000
  },
  onLanguageChanged: (locale) => {
    console.log('语言已切换到:', locale)
    updateDemo()
  }
})

// 翻译计数器
let translationCount = 0

// 重写 t 方法来统计翻译次数
const originalT = i18n.t.bind(i18n)
i18n.t = function(key, params) {
  translationCount++
  return originalT(key, params)
}

// 更新演示内容
function updateDemo() {
  try {
    // 基础翻译
    document.getElementById('simple-translation').textContent = i18n.t('hello')
    document.getElementById('param-translation').textContent = i18n.t('welcome', { name: '张三' })
    document.getElementById('nested-translation').textContent = i18n.t('user.profile.name')

    // 高级功能
    const item1 = i18n.t('item', { count: 1 })
    const item5 = i18n.t('item', { count: 5 })
    document.getElementById('pluralization').textContent = `1 ${item1} / 5 ${item5}`

    // 批量翻译
    const batchResult = i18n.translateBatch(['hello', 'welcome'], { name: 'Batch' })
    document.getElementById('batch-translation').textContent = 
      `${batchResult.translations.hello}, ${batchResult.translations.welcome}`

    // 键存在性检查
    const exists1 = i18n.exists('hello')
    const exists2 = i18n.exists('nonexistent')
    document.getElementById('key-exists').textContent = `hello: ${exists1}, nonexistent: ${exists2}`

    // 格式化功能
    const currentLocale = i18n.getCurrentLanguage()
    
    // 数字格式化
    document.getElementById('number-format').textContent = formatNumber(1234.56, currentLocale)
    
    // 货币格式化
    const currencyMap = {
      'zh-CN': 'CNY',
      'en': 'USD',
      'ja': 'JPY'
    }
    document.getElementById('currency-format').textContent = 
      formatCurrency(1234.56, { locale: currentLocale, currency: currencyMap[currentLocale] || 'USD' })
    
    // 日期格式化
    document.getElementById('date-format').textContent = formatDate(new Date(), currentLocale)

    // 更新统计信息
    updateStats()

    // 更新状态信息
    updateStatus()

  } catch (error) {
    console.error('更新演示内容时出错:', error)
    showError('更新演示内容时出错: ' + error.message)
  }
}

// 更新统计信息
function updateStats() {
  document.getElementById('current-language').textContent = i18n.getCurrentLanguage()
  document.getElementById('available-languages').textContent = i18n.getAvailableLanguages().length
  document.getElementById('translation-count').textContent = translationCount
  document.getElementById('cache-status').textContent = '已启用'
}

// 更新状态信息
function updateStatus() {
  const statusDiv = document.getElementById('status-info')
  const currentLang = i18n.getCurrentLanguage()
  const availableLangs = i18n.getAvailableLanguages()
  
  statusDiv.innerHTML = `
    <div class="success">
      <strong>✅ I18n 状态正常</strong><br>
      当前语言: ${currentLang}<br>
      可用语言: ${availableLangs.join(', ')}<br>
      翻译次数: ${translationCount}<br>
      缓存状态: 已启用
    </div>
  `
}

// 显示错误信息
function showError(message) {
  const statusDiv = document.getElementById('status-info')
  statusDiv.innerHTML = `<div class="error"><strong>❌ 错误:</strong> ${message}</div>`
}

// 显示成功信息
function showSuccess(message) {
  const statusDiv = document.getElementById('status-info')
  statusDiv.innerHTML = `<div class="success"><strong>✅ 成功:</strong> ${message}</div>`
}

// 语言切换处理
function handleLanguageChange(event) {
  const newLocale = event.target.value
  i18n.changeLanguage(newLocale).then(() => {
    showSuccess(`语言已切换到: ${newLocale}`)
    updateDemo()
  }).catch(error => {
    showError(`语言切换失败: ${error.message}`)
  })
}

// 初始化应用
async function initApp() {
  try {
    console.log('🚀 开始初始化 @ldesign/i18n...')
    
    // 初始化 I18n
    await i18n.init()
    console.log('✅ I18n 初始化成功')
    
    // 隐藏加载提示
    document.getElementById('loading').style.display = 'none'
    
    // 显示内容
    document.getElementById('content').style.display = 'block'
    
    // 设置语言选择器
    const languageSelect = document.getElementById('languageSelect')
    languageSelect.value = i18n.getCurrentLanguage()
    languageSelect.addEventListener('change', handleLanguageChange)
    
    // 更新演示内容
    updateDemo()
    
    showSuccess('I18n 初始化完成，所有功能正常工作！')
    
    console.log('🎉 演示应用启动成功！')
    
  } catch (error) {
    console.error('❌ 初始化失败:', error)
    document.getElementById('loading').innerHTML = `
      <div class="error">
        <strong>初始化失败:</strong> ${error.message}
      </div>
    `
  }
}

// 启动应用
initApp()

// 导出到全局作用域供调试使用
window.i18n = i18n
window.updateDemo = updateDemo

console.log('📚 @ldesign/i18n 演示应用已加载')
console.log('💡 提示: 可以在控制台中使用 window.i18n 来调试 I18n 实例')
console.log('💡 提示: 可以在控制台中使用 window.updateDemo() 来手动更新演示内容')
