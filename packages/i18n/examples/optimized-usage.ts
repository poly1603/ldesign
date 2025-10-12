/**
 * 优化版本使用示例
 * 
 * 展示内存优化、插件系统、实时协作等高级功能
 * 
 * @author LDesign Team
 * @version 3.0.0
 */

import {
  createI18n,
  createMemoryOptimizer,
  createPluginManager,
  createCollaborationManager,
  PerformancePlugin,
  CachePlugin,
  ValidationPlugin,
  createPlugin,
  CollaborationEventType,
  ConflictResolution,
  memoryOptimized,
} from '../src'

// ============ 内存优化使用 ============

async function memoryOptimizedUsage() {
  console.log('=== 内存优化功能 ===\n')
  
  // 创建内存优化器
  const optimizer = createMemoryOptimizer({
    maxMemory: 10, // 10MB限制
    enableAutoGC: true,
    gcInterval: 30000, // 30秒
    enableCompression: true,
    stringIntern: true, // 字符串驻留
  })
  
  // 存储大量翻译数据
  const translations = {
    en: {
      common: { /* 大量翻译... */ }
    },
    zh: {
      common: { /* 大量翻译... */ }
    }
  }
  
  // 使用优化存储
  optimizer.set('translations', translations)
  
  // 检查内存使用
  const usage = optimizer.getMemoryUsage()
  console.log('内存使用情况:')
  console.log(`  已用: ${(usage.used / 1024 / 1024).toFixed(2)}MB`)
  console.log(`  总量: ${(usage.total / 1024 / 1024).toFixed(2)}MB`)
  console.log(`  占比: ${usage.percentage.toFixed(1)}%`)
  
  // 自动优化
  optimizer.optimize()
  console.log('执行内存优化后...')
  
  const stats = optimizer.getStats()
  console.log('优化统计:')
  console.log(`  GC次数: ${stats.gcCount}`)
  console.log(`  压缩次数: ${stats.compressionCount}`)
  console.log(`  驱逐次数: ${stats.evictionCount}`)
}

// ============ 使用内存优化装饰器 ============

class TranslationService {
  @memoryOptimized({ enableCompression: true })
  async loadTranslations(locale: string): Promise<any> {
    // 这个方法的参数和返回值会自动被优化
    const response = await fetch(`/api/translations/${locale}`)
    return response.json()
  }
  
  @memoryOptimized({ cacheLimit: 100 })
  translateBatch(keys: string[]): string[] {
    // 批量翻译，自动内存管理
    return keys.map(key => `Translated: ${key}`)
  }
}

// ============ 插件系统使用 ============

async function pluginSystemUsage() {
  console.log('\n=== 插件系统 ===\n')
  
  const i18n = createI18n({
    locale: 'en',
    messages: {
      en: { hello: 'Hello' },
      zh: { hello: '你好' },
    }
  })
  
  // 创建插件管理器
  const pluginManager = createPluginManager()
  pluginManager.setI18n(i18n)
  
  // 注册内置插件
  await pluginManager.register(new PerformancePlugin())
  await pluginManager.register(new CachePlugin())
  await pluginManager.register(new ValidationPlugin())
  
  // 创建自定义插件
  const customPlugin = createPlugin(
    {
      name: 'custom-logger',
      version: '1.0.0',
      description: 'Custom translation logger',
      priority: 10,
    },
    async (i18n) => {
      console.log('Custom logger plugin installed')
    },
    {
      beforeTranslate: (key: string) => {
        console.log(`Translating: ${key}`)
      },
      afterTranslate: (key: string, result: string) => {
        console.log(`Translated ${key} => ${result}`)
        return result
      },
    }
  )
  
  await pluginManager.register(customPlugin)
  
  // 懒加载插件
  const lazyPlugin = createPlugin(
    {
      name: 'lazy-feature',
      version: '1.0.0',
      lazy: true, // 标记为懒加载
    },
    async () => {
      console.log('Lazy plugin loaded on demand')
    }
  )
  
  await pluginManager.register(lazyPlugin, { lazy: true })
  
  // 按需加载
  console.log('Loading lazy plugin...')
  await pluginManager.load('lazy-feature')
  
  // 获取插件状态
  const status = pluginManager.getStatus()
  console.log('\n插件状态:')
  Object.entries(status).forEach(([name, info]) => {
    console.log(`  ${name}: ${info.status} (${info.loadTime?.toFixed(2)}ms)`)
  })
  
  // 执行带插件的翻译
  const result = await pluginManager.executeHook('beforeTranslate', 'hello', 'en')
  console.log('\n插件钩子结果:', result)
}

// ============ 实时协作功能 ============

async function collaborationUsage() {
  console.log('\n=== 实时协作 ===\n')
  
  const i18n = createI18n({
    locale: 'en',
    messages: {
      en: { welcome: 'Welcome' },
      zh: { welcome: '欢迎' },
    }
  })
  
  // 创建协作管理器
  const collaboration = createCollaborationManager({
    serverUrl: 'ws://localhost:3001',
    roomId: 'translation-room-1',
    userName: 'Developer 1',
    conflictResolution: ConflictResolution.MERGE,
    enablePresence: true,
    enableHistory: true,
  })
  
  collaboration.setI18n(i18n)
  
  // 监听协作事件
  collaboration.on(CollaborationEventType.USER_JOIN, (event) => {
    console.log(`用户加入: ${event.data.name}`)
  })
  
  collaboration.on(CollaborationEventType.TRANSLATION_UPDATE, (event) => {
    console.log(`翻译更新: ${event.data.key} = ${event.data.newValue}`)
  })
  
  collaboration.on(CollaborationEventType.CONFLICT_DETECTED, (event) => {
    console.log('检测到冲突:', event.data)
  })
  
  try {
    // 连接到协作服务器
    await collaboration.connect()
    console.log('已连接到协作服务器')
    
    // 发送翻译更新
    collaboration.updateTranslation('welcome', 'zh', '欢迎光临')
    
    // 更新光标位置（用于实时显示其他用户正在编辑的位置）
    collaboration.updateCursor('welcome', 5)
    
    // 更新选区
    collaboration.updateSelection('welcome', 0, 5)
    
    // 获取在线用户
    const onlineUsers = collaboration.getOnlineUsers()
    console.log('\n在线用户:')
    onlineUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.color})`)
    })
    
    // 获取历史记录
    const history = collaboration.getHistory()
    console.log('\n最近的变更:')
    history.slice(-5).forEach(change => {
      console.log(`  ${change.key}: ${change.oldValue} -> ${change.newValue}`)
    })
    
  } catch (error) {
    console.error('协作连接失败:', error)
  }
}

// ============ 组合使用示例 ============

async function integratedUsage() {
  console.log('\n=== 综合使用示例 ===\n')
  
  // 创建优化的i18n实例
  const i18n = createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages: {},
  })
  
  // 1. 设置内存优化
  const optimizer = createMemoryOptimizer({
    maxMemory: 20,
    enableCompression: true,
    cacheLimit: 200,
  })
  
  // 2. 设置插件系统
  const pluginManager = createPluginManager()
  pluginManager.setI18n(i18n)
  
  // 性能监控插件
  const perfPlugin = new PerformancePlugin()
  await pluginManager.register(perfPlugin)
  
  // 缓存插件（使用内存优化器）
  const cachePlugin = createPlugin(
    {
      name: 'optimized-cache',
      version: '1.0.0',
      priority: 1,
    },
    async () => {
      console.log('优化缓存插件已启用')
    },
    {
      beforeTranslate: (key: string, locale: string) => {
        // 使用内存优化器作为缓存
        const cacheKey = `${locale}:${key}`
        return optimizer.get(cacheKey)
      },
      afterTranslate: (key: string, result: string) => {
        const locale = i18n.locale
        const cacheKey = `${locale}:${key}`
        optimizer.set(cacheKey, result)
        return result
      },
    }
  )
  
  await pluginManager.register(cachePlugin)
  
  // 3. 设置协作（如果需要）
  const collaboration = createCollaborationManager({
    roomId: 'optimized-room',
    enablePresence: false, // 减少内存使用
    maxHistorySize: 50, // 限制历史大小
  })
  
  collaboration.setI18n(i18n)
  
  // 4. 使用优化的翻译服务
  const service = new TranslationService()
  
  // 加载翻译（自动压缩和缓存）
  console.log('加载翻译数据...')
  // const translations = await service.loadTranslations('en')
  
  // 批量翻译（内存优化）
  const keys = Array.from({ length: 100 }, (_, i) => `key_${i}`)
  const results = service.translateBatch(keys)
  console.log(`批量翻译 ${results.length} 个键`)
  
  // 获取性能指标
  const metrics = (perfPlugin as any).getMetrics()
  console.log('\n性能指标:')
  Object.entries(metrics).slice(0, 5).forEach(([key, stats]: [string, any]) => {
    console.log(`  ${key}: 平均${stats.avg.toFixed(2)}ms`)
  })
  
  // 获取内存状态
  const memStatus = optimizer.getMemoryUsage()
  console.log('\n内存状态:')
  console.log(`  缓存项: ${memStatus.details.objects}`)
  console.log(`  字符串池: ${memStatus.details.strings}`)
  console.log(`  使用率: ${memStatus.percentage.toFixed(1)}%`)
  
  // 清理资源
  console.log('\n清理资源...')
  collaboration.disconnect()
  optimizer.clear()
  console.log('资源已清理')
}

// ============ 性能对比测试 ============

async function performanceComparison() {
  console.log('\n=== 性能对比测试 ===\n')
  
  const testData = Array.from({ length: 1000 }, (_, i) => ({
    key: `test_key_${i}`,
    value: `This is test value ${i} with some repeated content...`.repeat(10),
  }))
  
  // 未优化版本
  console.time('未优化存储')
  const normalCache = new Map()
  testData.forEach(item => {
    normalCache.set(item.key, item.value)
  })
  console.timeEnd('未优化存储')
  
  // 优化版本
  console.time('优化存储')
  const optimizer = createMemoryOptimizer({
    enableCompression: true,
    stringIntern: true,
  })
  testData.forEach(item => {
    optimizer.set(item.key, item.value)
  })
  console.timeEnd('优化存储')
  
  // 内存对比
  const normalSize = JSON.stringify([...normalCache.entries()]).length
  const optimizedSize = optimizer.getMemoryUsage().used
  
  console.log('\n内存使用对比:')
  console.log(`  普通存储: ${(normalSize / 1024).toFixed(2)}KB`)
  console.log(`  优化存储: ${(optimizedSize / 1024).toFixed(2)}KB`)
  console.log(`  节省: ${((1 - optimizedSize / normalSize) * 100).toFixed(1)}%`)
  
  // 访问性能
  const testKeys = Array.from({ length: 100 }, (_, i) => `test_key_${i * 10}`)
  
  console.time('未优化读取')
  testKeys.forEach(key => normalCache.get(key))
  console.timeEnd('未优化读取')
  
  console.time('优化读取')
  testKeys.forEach(key => optimizer.get(key))
  console.timeEnd('优化读取')
}

// ============ 主函数 ============

async function main() {
  console.log('╔═══════════════════════════════════════╗')
  console.log('║     优化版本功能演示                  ║')
  console.log('╚═══════════════════════════════════════╝\n')
  
  try {
    await memoryOptimizedUsage()
    await pluginSystemUsage()
    // await collaborationUsage() // 需要WebSocket服务器
    await integratedUsage()
    await performanceComparison()
    
    console.log('\n✅ 所有演示完成！')
    console.log('\n📊 总结:')
    console.log('  - 内存优化器可显著减少内存占用')
    console.log('  - 插件系统支持灵活扩展功能')
    console.log('  - 协作功能支持实时多人编辑')
    console.log('  - 综合使用可获得最佳性能')
    
  } catch (error) {
    console.error('❌ 演示出错:', error)
  }
}

// 运行示例
if (require.main === module) {
  main()
}

export {
  memoryOptimizedUsage,
  pluginSystemUsage,
  collaborationUsage,
  integratedUsage,
  performanceComparison,
}