/**
 * @ldesign/i18n v3.0.0 完整使用示例
 * 
 * 展示所有新功能和最佳实践
 */

import {
  createI18n,
  // 统一缓存系统
  TranslationCache,
  createUnifiedCache,
  // 统一性能监控
  UnifiedPerformanceMonitor,
  globalPerformanceMonitor,
  performanceMonitor,
  // 高级功能
  SmartPreloader,
  TranslationSynchronizer,
  TranslationValidator,
  TranslationDiffDetector,
  TranslationQualityAnalyzer,
  // 开发者工具
  I18nDevTools,
  enableDevTools,
  createDashboard,
  // 类型生成器
  TypeScriptGenerator,
  createTypeGenerator,
  // 渐进式加载
  ProgressiveLoader,
  createProgressiveLoader,
  LoadStatus,
  // Locale模板系统
  LocaleTemplateGenerator,
  createLocalePackage,
  type BaseTranslations,
} from '@ldesign/i18n'

/**
 * 1. 初始化高性能缓存系统
 */
const cache = new TranslationCache({
  maxSize: 3000,
  maxMemory: 20 * 1024 * 1024, // 20MB
  strategy: 'hybrid', // 混合策略：结合LRU、LFU和优先级
  autoCleanup: true,
  cleanupInterval: 60000, // 每分钟清理
  enableCompression: true,
  compressionThreshold: 1024, // 超过1KB的内容进行压缩
})

// 监听缓存事件
cache.on('memory-pressure', (event) => {
  console.warn('内存压力警告:', event.stats)
  // 自动优化
  cache.optimize()
})

cache.on('evict', (event) => {
  console.debug(`缓存驱逐: ${event.key}`)
})

/**
 * 2. 配置性能监控
 */
const performanceMonitor = new UnifiedPerformanceMonitor({
  enabled: true,
  sampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 1, // 生产环境1%采样
  enableAdaptiveSampling: true, // 自适应采样率
  slowThreshold: 10, // 10ms以上为慢操作
  memoryCheckInterval: 30000, // 每30秒检查内存
  autoReport: process.env.NODE_ENV === 'development',
})

// 监听性能警告
performanceMonitor.on('alert', (metrics) => {
  console.warn('性能警告:', metrics)
  
  // 获取优化建议
  const suggestions = performanceMonitor.getOptimizationSuggestions()
  console.log('优化建议:', suggestions)
})

performanceMonitor.on('memory-pressure', (metrics) => {
  console.error('内存压力过大:', metrics.memory)
  // 触发紧急清理
  cache.clear()
})

/**
 * 3. 配置智能预加载
 */
const preloader = new SmartPreloader({
  maxConcurrent: 3,
  useWebWorker: true, // 使用Web Worker后台加载
  predictionThreshold: 0.7, // 70%置信度才预加载
})

// 记录用户行为，学习访问模式
window.addEventListener('routechange', (event: any) => {
  preloader.recordTransition(event.detail.from, event.detail.to)
  
  // 预测并预加载下一个可能的路由
  const predictions = preloader.predictNextRoutes(event.detail.to)
  predictions.forEach(route => {
    preloader.preload([`${route}.json`], async (url) => {
      const response = await fetch(url)
      return response.json()
    })
  })
})

/**
 * 4. 配置渐进式加载器
 */
const progressiveLoader = createProgressiveLoader({
  initialLocales: ['zh-CN', 'en'], // 初始加载中英文
  initialNamespaces: ['common', 'ui'], // 初始加载通用和UI命名空间
  enableCodeSplitting: true, // 启用代码分割
  enableLazyLoading: true, // 启用懒加载
  enablePrefetch: true, // 启用预取
  prefetchStrategy: 'idle', // 空闲时预取
  maxConcurrent: 5, // 最多5个并发加载
  cacheStrategy: 'indexedDB', // 使用IndexedDB缓存
  enableCompression: true, // 启用压缩传输
})

// 监听加载状态
progressiveLoader.on('resource-loaded', (resource) => {
  console.log(`资源已加载: ${resource.id} 耗时: ${resource.loadTime}ms`)
})

/**
 * 5. 配置实时同步器
 */
const synchronizer = new TranslationSynchronizer('i18n-sync-channel')

// 监听其他标签页的语言变更
synchronizer.on('language-change', ({ locale }) => {
  console.log(`检测到语言切换: ${locale}`)
  i18n.changeLanguage(locale)
})

// 监听翻译更新
synchronizer.on('translation-update', ({ updates }) => {
  console.log('收到翻译更新:', updates)
  i18n.addResources(updates)
})

/**
 * 6. 配置翻译验证器
 */
const validator = new TranslationValidator()

// 添加自定义验证规则
validator.addRule('companyName', (value) => {
  return typeof value === 'string' && value.includes('LDesign')
})

validator.addRule('maxWords', (value, context) => {
  const words = value.split(' ').length
  return words <= (context?.maxWords || 100)
})

/**
 * 7. 配置开发者工具（仅开发环境）
 */
let devTools: I18nDevTools | null = null

if (process.env.NODE_ENV === 'development') {
  devTools = enableDevTools({
    enabled: true,
    enableConsoleOutput: true,
    enableOverlay: true, // 显示调试覆盖层
    enableChrome: true, // 连接Chrome DevTools扩展
    enableProfiling: true, // 启用性能分析
    enableHotReload: true, // 启用热重载
    highlightMissing: true, // 高亮缺失翻译
    highlightColor: '#ff0000',
    logLevel: 'debug',
  })

  // 创建可视化仪表板
  if (document.getElementById('i18n-dashboard')) {
    const dashboard = createDashboard('i18n-dashboard')
  }
}

/**
 * 8. 生成TypeScript类型定义
 */
if (process.env.NODE_ENV === 'development') {
  const typeGenerator = createTypeGenerator({
    inputDir: './src/locales',
    outputPath: './src/types/i18n.d.ts',
    strict: true, // 严格类型
    includeComments: true,
    generateUnions: true, // 生成联合类型
    generateEnums: true, // 生成枚举
    watch: true, // 监听文件变化
    customTypes: {
      'user.role': "'admin' | 'user' | 'guest'",
      'payment.amount': 'number',
    },
  })

  // 生成类型
  typeGenerator.generate().then(() => {
    console.log('✅ TypeScript类型定义已生成')
  })
}

/**
 * 9. 使用Locale模板系统创建新语言包
 */
const createNewLocale = (locale: string, customTranslations: Partial<BaseTranslations>) => {
  // 注册模板
  LocaleTemplateGenerator.registerTemplate(locale, customTranslations)
  
  // 生成完整语言包
  const fullTranslations = LocaleTemplateGenerator.generate(locale, {
    common: {
      yes: '是',
      no: '否',
      // ... 其他自定义翻译
    },
  })
  
  // 验证完整性
  const validation = LocaleTemplateGenerator.validate(fullTranslations)
  if (!validation.valid) {
    console.warn(`语言包 ${locale} 验证失败:`, validation.missing)
  }
  
  // 生成类型定义
  const types = LocaleTemplateGenerator.generateTypes(fullTranslations)
  console.log('生成的类型定义:', types)
  
  return fullTranslations
}

/**
 * 10. 翻译质量分析
 */
const analyzer = new TranslationQualityAnalyzer()

const analyzeTranslations = async (translations: any) => {
  const analysis = analyzer.analyzeQuality(translations)
  
  console.log(`翻译质量评分: ${analysis.score}/100`)
  
  if (analysis.issues.length > 0) {
    console.warn('发现的问题:')
    analysis.issues.forEach(issue => {
      console.warn(`- [${issue.severity}] ${issue.type}: ${issue.message}`)
    })
  }
  
  if (analysis.suggestions.length > 0) {
    console.log('改进建议:')
    analysis.suggestions.forEach(suggestion => {
      console.log(`- ${suggestion}`)
    })
  }
  
  return analysis
}

/**
 * 11. 翻译差异检测
 */
const diffDetector = new TranslationDiffDetector()

const compareTranslations = (source: any, target: any) => {
  const diff = diffDetector.diff(source, target)
  
  if (diff.missing.length > 0) {
    console.warn(`目标语言缺失 ${diff.missing.length} 个键:`, diff.missing)
  }
  
  if (diff.extra.length > 0) {
    console.warn(`目标语言多余 ${diff.extra.length} 个键:`, diff.extra)
  }
  
  if (diff.different.length > 0) {
    console.log(`发现 ${diff.different.length} 处不同:`)
    diff.different.forEach(item => {
      console.log(`  ${item.key}: "${item.source}" -> "${item.target}"`)
    })
  }
  
  // 生成补丁
  const patches = diffDetector.generatePatch(source, target)
  console.log(`生成了 ${patches.length} 个补丁`)
  
  // 应用补丁
  const fixed = diffDetector.applyPatch(target, patches)
  console.log('已修复的翻译:', fixed)
  
  return { diff, patches, fixed }
}

/**
 * 12. 创建主i18n实例
 */
const i18n = createI18n({
  // 基础配置
  locale: 'zh-CN',
  fallbackLocale: 'en',
  
  // 使用我们的高性能缓存
  cache: {
    enabled: true,
    provider: cache,
  },
  
  // 性能监控
  performance: {
    enabled: true,
    monitor: performanceMonitor,
  },
  
  // 加载器配置
  loader: {
    type: 'progressive', // 使用渐进式加载
    loader: progressiveLoader,
  },
  
  // 预加载配置
  preload: {
    enabled: true,
    preloader: preloader,
  },
  
  // 同步配置
  sync: {
    enabled: true,
    synchronizer: synchronizer,
  },
  
  // 验证配置
  validation: {
    enabled: true,
    validator: validator,
  },
  
  // 开发工具配置
  devTools: devTools || undefined,
  
  // 错误处理
  missingKeyHandler: (key, locale) => {
    if (devTools) {
      devTools.recordMissingKey(key, locale)
    }
    return `[Missing: ${key}]`
  },
  
  // 格式化配置
  formatters: {
    date: (value: Date, format?: string) => {
      return new Intl.DateTimeFormat(i18n.locale, {
        dateStyle: format as any || 'medium',
      }).format(value)
    },
    
    number: (value: number, format?: string) => {
      return new Intl.NumberFormat(i18n.locale, {
        style: format as any || 'decimal',
      }).format(value)
    },
    
    currency: (value: number, currency = 'USD') => {
      return new Intl.NumberFormat(i18n.locale, {
        style: 'currency',
        currency,
      }).format(value)
    },
  },
})

/**
 * 13. 性能监控装饰器使用示例
 */
class TranslationService {
  @performanceMonitor(globalPerformanceMonitor)
  async translateBatch(keys: string[]): Promise<string[]> {
    return keys.map(key => i18n.t(key))
  }
  
  @performanceMonitor(globalPerformanceMonitor)
  async loadLanguagePack(locale: string): Promise<void> {
    await progressiveLoader.load(`${locale}:common`)
    await progressiveLoader.load(`${locale}:ui`)
  }
}

/**
 * 14. 高级使用示例
 */
const advancedUsage = async () => {
  // 批量翻译优化
  const keys = ['common.welcome', 'common.goodbye', 'ui.button.submit']
  const translations = await cache.getMany(keys)
  
  // 性能追踪
  const { endOperation } = performanceMonitor.startOperation('batch-translation')
  const results = keys.map(key => i18n.t(key))
  endOperation(true)
  
  // 预取下一页面的翻译
  await progressiveLoader.prefetch([
    'en:dashboard',
    'zh-CN:dashboard',
  ])
  
  // 检查加载统计
  const stats = progressiveLoader.getStatistics()
  console.log('加载统计:', stats)
  
  // 生成性能报告
  console.log(performanceMonitor.generateReport())
  
  // 导出调试报告
  if (devTools) {
    const debugReport = devTools.exportDebugReport()
    console.log('调试报告:', debugReport)
  }
}

/**
 * 15. Vue集成示例
 */
import { createApp } from 'vue'
import { I18nPlugin } from '@ldesign/i18n/vue'

const app = createApp({
  // ...
})

app.use(I18nPlugin, {
  i18n,
  globalProperties: true, // 注入$t, $i18n等
  directives: true, // 启用v-t等指令
  components: true, // 注册全局组件
})

/**
 * 16. React集成示例
 */
import React from 'react'
import { I18nProvider, useI18n } from '@ldesign/i18n/react'

const App = () => {
  return (
    <I18nProvider i18n={i18n}>
      <MyComponent />
    </I18nProvider>
  )
}

const MyComponent = () => {
  const { t, locale, changeLanguage } = useI18n()
  
  return (
    <div>
      <h1>{t('welcome.title')}</h1>
      <button onClick={() => changeLanguage('en')}>
        Switch to English
      </button>
    </div>
  )
}

/**
 * 17. 启动应用
 */
const startApp = async () => {
  console.log('🚀 Starting i18n v3.0 application...')
  
  // 初始化
  await i18n.init()
  
  // 分析初始翻译质量
  const initialTranslations = i18n.getResourceBundle('zh-CN', 'common')
  await analyzeTranslations(initialTranslations)
  
  // 启动性能监控
  performanceMonitor.start()
  
  // 执行高级功能
  await advancedUsage()
  
  console.log('✅ Application started successfully!')
}

// 启动
startApp().catch(console.error)

/**
 * 18. 清理和销毁
 */
window.addEventListener('beforeunload', () => {
  // 清理资源
  cache.destroy()
  performanceMonitor.destroy()
  progressiveLoader.destroy()
  synchronizer.destroy()
  preloader.destroy()
  
  if (devTools) {
    devTools.destroy()
  }
  
  console.log('👋 i18n resources cleaned up')
})

export { i18n, cache, performanceMonitor, progressiveLoader }