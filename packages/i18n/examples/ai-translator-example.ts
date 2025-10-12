/**
 * AI翻译助手使用示例
 * 
 * 展示如何使用AI功能进行智能翻译、质量评估和自动优化
 * 
 * @author LDesign Team
 * @version 3.0.0
 */

import {
  createI18n,
  createAITranslator,
  AITranslator,
  AIProvider,
  type TranslationSuggestion,
  type QualityReport,
} from '../src'

// ============ 自定义AI提供商示例 ============

/**
 * OpenAI提供商实现示例
 */
class OpenAIProvider implements AIProvider {
  private apiKey: string
  private model: string
  
  constructor(apiKey: string, model = 'gpt-3.5-turbo') {
    this.apiKey = apiKey
    this.model = model
  }
  
  async translate(text: string, from: string, to: string): Promise<string> {
    // 实际实现需要调用OpenAI API
    const prompt = `Translate the following text from ${from} to ${to}: "${text}"`
    
    // 模拟API调用
    console.log(`OpenAI API Call: ${prompt}`)
    
    // 返回模拟结果
    return `[OpenAI Translation of "${text}"]`
  }
  
  async batchTranslate(texts: string[], from: string, to: string): Promise<string[]> {
    return Promise.all(texts.map(text => this.translate(text, from, to)))
  }
  
  async suggest(text: string, context: string, targetLocale: string): Promise<string[]> {
    // 使用GPT生成多个翻译建议
    const prompt = `
      Provide 3 different translation options for "${text}" in ${targetLocale}.
      Context: ${context}
      Format: Return as JSON array of strings.
    `
    
    console.log(`OpenAI Suggestion Request: ${prompt}`)
    
    // 模拟返回多个建议
    return [
      `${text} (formal)`,
      `${text} (casual)`,
      `${text} (professional)`,
    ]
  }
  
  async detectLanguage(text: string): Promise<string> {
    // 使用GPT检测语言
    const prompt = `Detect the language of: "${text}". Return ISO 639-1 code only.`
    
    console.log(`OpenAI Language Detection: ${prompt}`)
    
    // 简单的语言检测逻辑
    if (/[\u4e00-\u9fa5]/.test(text)) return 'zh'
    if (/[а-яА-Я]/.test(text)) return 'ru'
    return 'en'
  }
  
  async evaluateQuality(original: string, translation: string, targetLocale: string): Promise<number> {
    // 使用GPT评估翻译质量
    const prompt = `
      Evaluate the translation quality from 0 to 1:
      Original: "${original}"
      Translation: "${translation}"
      Target Language: ${targetLocale}
    `
    
    console.log(`OpenAI Quality Evaluation: ${prompt}`)
    
    // 返回模拟的质量分数
    return 0.85 + Math.random() * 0.15
  }
}

// ============ 基本使用示例 ============

async function basicUsage() {
  console.log('=== AI翻译基本使用 ===\n')
  
  // 创建AI翻译器（使用内置的Mock提供商）
  const aiTranslator = createAITranslator({
    enableCache: true,
    enableAutoCorrect: true,
    qualityThreshold: 0.8,
  })
  
  // 1. 简单翻译
  const translated = await aiTranslator.translate('Hello World', 'zh', 'en')
  console.log('翻译结果:', translated)
  
  // 2. 批量翻译
  const texts = ['Hello', 'Welcome', 'Thank you']
  const batchResults = await aiTranslator.batchTranslate(texts, 'zh', 'en')
  console.log('批量翻译:', batchResults)
  
  // 3. 获取翻译建议
  const suggestions = await aiTranslator.getSuggestions(
    'Welcome to our application',
    'This is a greeting message',
    'zh'
  )
  console.log('翻译建议:')
  suggestions.forEach((s, i) => {
    console.log(`  ${i + 1}. ${s.text} (置信度: ${s.confidence.toFixed(2)})`)
  })
  
  // 4. 语言检测
  const detectedLang = await aiTranslator.detectLanguage('你好世界')
  console.log('检测到的语言:', detectedLang)
}

// ============ 质量评估示例 ============

async function qualityAssessment() {
  console.log('\n=== 翻译质量评估 ===\n')
  
  const aiTranslator = createAITranslator()
  
  // 获取质量报告
  const report = await aiTranslator.getQualityReport(
    'Welcome to our application',
    '欢迎使用我们的应用程序',
    'zh'
  )
  
  console.log('质量报告:')
  console.log(`总分: ${report.score.toFixed(2)}`)
  console.log('\n详细指标:')
  console.log(`  流畅度: ${report.metadata.fluency.toFixed(2)}`)
  console.log(`  准确性: ${report.metadata.accuracy.toFixed(2)}`)
  console.log(`  一致性: ${report.metadata.consistency.toFixed(2)}`)
  console.log(`  语法: ${report.metadata.grammar.toFixed(2)}`)
  
  if (report.issues.length > 0) {
    console.log('\n发现的问题:')
    report.issues.forEach(issue => {
      console.log(`  - [${issue.severity}] ${issue.type}: ${issue.message}`)
    })
  }
  
  if (report.suggestions.length > 0) {
    console.log('\n改进建议:')
    report.suggestions.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s}`)
    })
  }
}

// ============ 与i18n实例集成 ============

async function i18nIntegration() {
  console.log('\n=== AI与i18n集成 ===\n')
  
  // 创建i18n实例
  const i18n = createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages: {
      en: {
        common: {
          welcome: 'Welcome',
          goodbye: 'Goodbye',
          thankyou: 'Thank you',
        },
        errors: {
          notFound: 'Page not found',
          serverError: 'Server error occurred',
        }
      },
      zh: {
        common: {
          welcome: '欢迎',
          // goodbye 和 thankyou 缺失
        },
        // errors 命名空间完全缺失
      }
    }
  })
  
  // 创建AI翻译器并关联i18n实例
  const aiTranslator = createAITranslator()
  aiTranslator.setI18n(i18n)
  
  // 自动翻译缺失的键
  console.log('正在自动翻译缺失的中文翻译...')
  const missingTranslations = await aiTranslator.autoTranslateMissing('en', 'zh')
  console.log('缺失的翻译:', missingTranslations)
  
  // 将翻译添加到i18n
  await i18n.mergeLocaleMessage('zh', missingTranslations)
  
  // 优化现有翻译
  console.log('\n正在优化现有翻译...')
  const optimizations = await aiTranslator.optimizeTranslations('zh')
  
  if (optimizations.length > 0) {
    console.log('优化建议:')
    optimizations.forEach(opt => {
      console.log(`  ${opt.key}:`)
      console.log(`    原文: ${opt.original}`)
      console.log(`    优化: ${opt.optimized}`)
      console.log(`    提升: +${(opt.improvement * 100).toFixed(1)}%`)
    })
  }
}

// ============ 使用自定义AI提供商 ============

async function customProvider() {
  console.log('\n=== 自定义AI提供商 ===\n')
  
  // 使用OpenAI提供商
  const openAIProvider = new OpenAIProvider('your-api-key-here')
  
  const aiTranslator = createAITranslator({
    provider: openAIProvider,
    enableCache: true,
    cacheTimeout: 3600000, // 1小时
    maxSuggestions: 5,
  })
  
  // 使用自定义提供商进行翻译
  const result = await aiTranslator.translate(
    'This is a test message',
    'zh'
  )
  console.log('OpenAI翻译结果:', result)
  
  // 获取多个翻译建议
  const suggestions = await aiTranslator.getSuggestions(
    'Welcome message',
    'Used in app header',
    'zh'
  )
  
  console.log('OpenAI翻译建议:')
  suggestions.forEach((s, i) => {
    console.log(`  选项${i + 1}: ${s.text}`)
  })
}

// ============ 高级功能示例 ============

async function advancedFeatures() {
  console.log('\n=== AI高级功能 ===\n')
  
  const aiTranslator = createAITranslator({
    enableBatchOptimization: true,
    batchSize: 10,
    qualityThreshold: 0.9,
  })
  
  // 1. 上下文感知翻译
  console.log('1. 上下文感知翻译:')
  const contextualTranslation = await aiTranslator.getSuggestions(
    'Bank',
    'Financial institution context',
    'zh'
  )
  console.log('  金融语境:', contextualTranslation[0]?.text)
  
  const riverContext = await aiTranslator.getSuggestions(
    'Bank',
    'River side context',
    'zh'
  )
  console.log('  河流语境:', riverContext[0]?.text)
  
  // 2. 性能优化批量处理
  console.log('\n2. 批量处理优化:')
  const largeTextArray = Array.from({ length: 100 }, (_, i) => `Text ${i + 1}`)
  
  console.time('批量翻译耗时')
  const batchResults = await aiTranslator.batchTranslate(largeTextArray, 'zh')
  console.timeEnd('批量翻译耗时')
  console.log(`  成功翻译 ${batchResults.length} 条文本`)
  
  // 3. 缓存效果演示
  console.log('\n3. 缓存效果:')
  console.time('首次翻译')
  await aiTranslator.translate('Cache test', 'zh')
  console.timeEnd('首次翻译')
  
  console.time('缓存命中')
  await aiTranslator.translate('Cache test', 'zh')
  console.timeEnd('缓存命中')
  
  const cacheStats = aiTranslator.getCacheStats()
  console.log(`  缓存大小: ${cacheStats.size}`)
  console.log(`  内存使用: ${cacheStats.memoryUsage} bytes`)
  
  // 4. 训练自定义模型（示例）
  console.log('\n4. 自定义模型训练:')
  const trainingData = [
    { source: 'Hello', target: '你好', locale: 'zh' },
    { source: 'Thank you', target: '谢谢', locale: 'zh' },
    { source: 'Welcome', target: '欢迎', locale: 'zh' },
  ]
  
  await aiTranslator.trainCustomModel(trainingData)
  console.log('  模型训练完成（模拟）')
}

// ============ 实时翻译优化流程 ============

async function realtimeOptimization() {
  console.log('\n=== 实时翻译优化流程 ===\n')
  
  const aiTranslator = createAITranslator({
    enableAutoCorrect: true,
    qualityThreshold: 0.85,
  })
  
  // 模拟用户输入翻译
  const userTranslation = {
    key: 'welcome.message',
    original: 'Welcome to our platform',
    userInput: '欢迎来到平台', // 用户提供的翻译
  }
  
  console.log('用户输入的翻译:', userTranslation.userInput)
  
  // 评估用户翻译质量
  const quality = await aiTranslator.evaluateQuality(
    userTranslation.original,
    userTranslation.userInput,
    'zh'
  )
  
  console.log(`翻译质量评分: ${(quality * 100).toFixed(1)}%`)
  
  if (quality < 0.85) {
    console.log('质量低于阈值，获取改进建议...')
    
    // 获取AI建议
    const suggestions = await aiTranslator.getSuggestions(
      userTranslation.original,
      'Platform welcome message',
      'zh'
    )
    
    console.log('\nAI改进建议:')
    suggestions.slice(0, 3).forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.text} (置信度: ${(s.confidence * 100).toFixed(1)}%)`)
    })
    
    // 自动选择最佳建议
    if (suggestions[0] && suggestions[0].confidence > quality) {
      console.log(`\n自动采用最佳建议: ${suggestions[0].text}`)
    }
  } else {
    console.log('翻译质量良好，无需优化')
  }
}

// ============ 主函数 ============

async function main() {
  console.log('╔═══════════════════════════════════════╗')
  console.log('║     AI翻译助手功能演示               ║')
  console.log('╚═══════════════════════════════════════╝\n')
  
  try {
    // 运行各个示例
    await basicUsage()
    await qualityAssessment()
    await i18nIntegration()
    await customProvider()
    await advancedFeatures()
    await realtimeOptimization()
    
    console.log('\n✅ 所有示例运行完成！')
  } catch (error) {
    console.error('❌ 示例运行出错:', error)
  }
}

// 运行示例
if (require.main === module) {
  main()
}

export {
  basicUsage,
  qualityAssessment,
  i18nIntegration,
  customProvider,
  advancedFeatures,
  realtimeOptimization,
}