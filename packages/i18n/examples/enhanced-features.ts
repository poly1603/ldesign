/**
 * @ldesign/i18n 增强功能使用示例
 * 
 * 本示例展示了 i18n 库的所有增强功能：
 * - 高性能缓存系统
 * - 增强的多元化支持
 * - 强大的格式化功能
 * - 懒加载和按需加载
 */

import { 
  I18n, 
  StaticLoader,
  TranslationCache,
  PluralizationEngine,
  FormatterEngine,
  PluralCategory,
  PluralUtils
} from '../src'

// 创建示例语言包
const enhancedEnPackage = {
  info: {
    name: 'English',
    nativeName: 'English',
    code: 'en',
    direction: 'ltr' as const,
    dateFormat: 'MM/DD/YYYY',
  },
  translations: {
    common: {
      welcome: 'Welcome, {{name}}!',
      // ICU 格式的多元化
      items: '{count, plural, =0{no items} =1{one item} other{# items}}',
      // 新格式的多元化
      messages: 'zero:No messages|one:One message|other:{{count}} messages',
      fileSize: 'File size: {{size, fileSize}}',
      duration: 'Duration: {{time, duration}}',
      price: 'Price: {{amount, currency}}',
      percentage: 'Progress: {{value, percent}}',
      lastSeen: 'Last seen {{date, relativeTime}}',
      tags: 'Tags: {{items, list}}',
    },
    advanced: {
      // 复杂的多元化示例
      notifications: '{count, plural, =0{zero:No notifications} =1{one:You have one notification} other{many:You have {{count}} notifications}}',
      // 带格式化的文本
      report: 'Report generated on {{date, date, full}} with {{fileCount}} files totaling {{totalSize, fileSize}}',
    }
  },
}

async function demonstrateEnhancedFeatures() {
  console.log('🚀 @ldesign/i18n 增强功能演示\n')

  // 1. 创建 I18n 实例
  const i18n = new I18n({
    defaultLocale: 'en',
    cache: {
      enabled: true,
      maxSize: 1000,
      defaultTTL: 300000, // 5分钟
    }
  })

  // 设置加载器
  const loader = new StaticLoader()
  loader.registerPackage('en', enhancedEnPackage)
  i18n.setLoader(loader)

  await i18n.init()

  console.log('✅ I18n 实例初始化完成\n')

  // 2. 演示增强的缓存功能
  console.log('📦 缓存功能演示:')
  
  // 第一次翻译（会被缓存）
  const start1 = performance.now()
  const result1 = i18n.t('common.welcome', { name: 'Alice' })
  const time1 = performance.now() - start1
  
  // 第二次翻译（从缓存获取）
  const start2 = performance.now()
  const result2 = i18n.t('common.welcome', { name: 'Alice' })
  const time2 = performance.now() - start2
  
  console.log(`  首次翻译: ${result1} (${time1.toFixed(3)}ms)`)
  console.log(`  缓存翻译: ${result2} (${time2.toFixed(3)}ms)`)
  console.log(`  性能提升: ${((time1 - time2) / time1 * 100).toFixed(1)}%`)
  
  // 显示缓存统计
  const cacheStats = i18n.getCacheStats()
  console.log(`  缓存统计: 大小=${cacheStats.size}, 命中率=${(cacheStats.hitRate * 100).toFixed(1)}%\n`)

  // 3. 演示增强的多元化功能
  console.log('🔢 多元化功能演示:')
  
  // ICU 格式多元化
  console.log('  ICU 格式:')
  console.log(`    0 items: ${i18n.t('common.items', { count: 0 })}`)
  console.log(`    1 item:  ${i18n.t('common.items', { count: 1 })}`)
  console.log(`    5 items: ${i18n.t('common.items', { count: 5 })}`)
  
  // 新格式多元化
  console.log('  新格式:')
  console.log(`    0 messages: ${i18n.t('common.messages', { count: 0 })}`)
  console.log(`    1 message:  ${i18n.t('common.messages', { count: 1 })}`)
  console.log(`    3 messages: ${i18n.t('common.messages', { count: 3 })}\n`)

  // 4. 演示格式化功能
  console.log('🎨 格式化功能演示:')
  
  // 日期格式化
  const now = new Date()
  console.log(`  当前日期: ${i18n.formatDate(now)}`)
  console.log(`  完整日期: ${i18n.formatDate(now, { dateStyle: 'full' })}`)
  console.log(`  相对时间: ${i18n.formatRelativeTime(new Date(Date.now() - 3600000))}`) // 1小时前
  
  // 数字格式化
  console.log(`  大数字: ${i18n.formatNumber(1234567.89)}`)
  console.log(`  紧凑格式: ${i18n.formatNumber(1234567, { compact: true })}`)
  
  // 货币格式化
  console.log(`  美元: ${i18n.formatCurrency(1234.56, 'USD')}`)
  console.log(`  欧元: ${i18n.formatCurrency(1234.56, 'EUR')}`)
  
  // 百分比格式化
  console.log(`  百分比: ${i18n.formatPercent(0.1234)}`)
  
  // 列表格式化
  console.log(`  列表: ${i18n.formatList(['Apple', 'Banana', 'Orange'])}`)
  
  // 自定义格式化器
  console.log(`  文件大小: ${i18n.format('fileSize', 1024 * 1024 * 2.5)}`)
  console.log(`  持续时间: ${i18n.format('duration', 3661)}\n`)

  // 5. 演示带格式化的翻译
  console.log('🔗 集成格式化的翻译:')
  
  // 注意：这需要在翻译文本中使用格式化器
  // 由于当前实现还不支持在翻译文本中直接使用格式化器，
  // 我们展示如何手动组合翻译和格式化
  const fileCount = 42
  const totalSize = 1024 * 1024 * 156.7
  const reportDate = new Date()
  
  console.log(`  报告: Report generated on ${i18n.formatDate(reportDate, { dateStyle: 'full' })} with ${fileCount} files totaling ${i18n.format('fileSize', totalSize)}`)

  // 6. 演示性能监控
  console.log('📊 性能监控:')
  
  // 执行一些翻译操作
  for (let i = 0; i < 100; i++) {
    i18n.t('common.welcome', { name: `User${i}` })
  }
  
  // 获取性能报告
  const perfReport = i18n.getPerformanceReport()
  console.log(`  总翻译次数: ${perfReport.totalTranslations}`)
  console.log(`  平均翻译时间: ${perfReport.averageTranslationTime.toFixed(3)}ms`)
  console.log(`  缓存命中率: ${(perfReport.cacheHitRate * 100).toFixed(1)}%`)
  
  // 获取优化建议
  const suggestions = i18n.getOptimizationSuggestions()
  if (suggestions.length > 0) {
    console.log('  优化建议:')
    suggestions.forEach(suggestion => {
      console.log(`    - ${suggestion}`)
    })
  }

  console.log('\n🎉 演示完成！')
}

// 演示多元化引擎的独立使用
function demonstratePluralizationEngine() {
  console.log('\n🔧 多元化引擎独立使用演示:')
  
  const engine = new PluralizationEngine()
  
  // 测试不同语言的多元化规则
  const testCounts = [0, 1, 2, 3, 5, 11, 21, 101]
  const locales = ['en', 'ru', 'ar', 'zh-CN']
  
  locales.forEach(locale => {
    console.log(`\n  ${locale} 语言的多元化规则:`)
    testCounts.forEach(count => {
      const category = engine.getCategory(locale, count)
      console.log(`    ${count} -> ${category}`)
    })
  })
  
  // 演示多元化工具函数
  console.log('\n  多元化工具函数演示:')
  
  const pluralString = 'zero:没有项目|one:一个项目|other:{{count}}个项目'
  const pluralObject = PluralUtils.parsePluralString(pluralString)
  console.log(`  解析结果:`, pluralObject)
  
  const formatted = PluralUtils.formatPluralText(
    pluralObject,
    PluralCategory.OTHER,
    5,
    { count: 5 }
  )
  console.log(`  格式化结果: ${formatted}`)
}

// 演示格式化引擎的独立使用
function demonstrateFormatterEngine() {
  console.log('\n🎨 格式化引擎独立使用演示:')
  
  const formatter = new FormatterEngine({
    defaultLocale: 'en',
    currency: 'USD',
  })
  
  // 注册自定义格式化器
  formatter.registerFormatter('temperature', (celsius: number, locale: string) => {
    const fahrenheit = (celsius * 9/5) + 32
    return `${celsius}°C (${fahrenheit.toFixed(1)}°F)`
  })
  
  formatter.registerFormatter('distance', (meters: number, locale: string) => {
    if (meters < 1000) {
      return `${meters}m`
    } else {
      return `${(meters / 1000).toFixed(1)}km`
    }
  })
  
  console.log('  自定义格式化器:')
  console.log(`    温度: ${formatter.format('temperature', 25)}`)
  console.log(`    距离: ${formatter.format('distance', 1500)}`)
  console.log(`    文件大小: ${formatter.format('fileSize', 1024 * 1024 * 3.7)}`)
  
  // 演示不同语言的格式化
  console.log('\n  多语言格式化:')
  const amount = 1234.56
  const date = new Date()
  
  const locales = ['en', 'de', 'fr', 'ja']
  locales.forEach(locale => {
    console.log(`    ${locale}: ${formatter.formatCurrency(amount, locale, 'EUR')} | ${formatter.formatDate(date, locale, { dateStyle: 'medium' })}`)
  })
}

// 演示缓存系统的独立使用
function demonstrateCacheSystem() {
  console.log('\n💾 缓存系统独立使用演示:')
  
  const cache = new TranslationCache({
    maxSize: 5,
    ttl: 1000, // 1秒
    strategy: 'lru',
  })
  
  // 添加一些缓存项
  console.log('  添加缓存项:')
  for (let i = 1; i <= 7; i++) {
    const key = `key${i}`
    const value = `value${i}`
    cache.set(key, value)
    console.log(`    设置 ${key} = ${value}`)
  }
  
  // 显示缓存状态
  const stats = cache.getStats()
  console.log(`\n  缓存统计: 大小=${stats.size}/${stats.maxSize}, 驱逐次数=${stats.evictionCount}`)
  
  // 测试缓存获取
  console.log('\n  缓存获取测试:')
  for (let i = 1; i <= 7; i++) {
    const key = `key${i}`
    const value = cache.get(key)
    console.log(`    获取 ${key} = ${value || 'undefined'}`)
  }
  
  // 等待 TTL 过期
  console.log('\n  等待 TTL 过期...')
  setTimeout(() => {
    console.log('  TTL 过期后的缓存获取:')
    const value = cache.get('key6')
    console.log(`    获取 key6 = ${value || 'undefined (已过期)'}`)
  }, 1100)
}

// 运行所有演示
async function runAllDemonstrations() {
  await demonstrateEnhancedFeatures()
  demonstratePluralizationEngine()
  demonstrateFormatterEngine()
  demonstrateCacheSystem()
}

// 如果直接运行此文件
if (require.main === module) {
  runAllDemonstrations().catch(console.error)
}

export {
  demonstrateEnhancedFeatures,
  demonstratePluralizationEngine,
  demonstrateFormatterEngine,
  demonstrateCacheSystem,
  runAllDemonstrations,
}
