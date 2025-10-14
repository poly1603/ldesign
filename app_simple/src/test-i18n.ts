/**
 * 开发环境下的 i18n 快速自测脚本（瘦身版）
 */

import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'

async function testI18n() {
  console.log('🧪 开始测试 @ldesign/i18n 配置...')

  // 从 Engine 插件暴露或调试变量获取 i18n 实例
  const i18n = (window as any).__ENGINE__?.api?.i18n || (window as any).__I18N__
  if (!i18n) {
    console.warn('未找到 i18n 实例（需要在应用启动后运行）')
    return
  }

  console.log('✅ i18n 实例获取成功')
  console.log('🌐 可用语言:', i18n.getAvailableLocales?.())
  console.log('📦 初始语言:', i18n.locale)

  // 测试中文
  console.log('\n📝 测试中文翻译:')
  await i18n.setLocale('zh-CN')
  console.log('- 当前语言:', i18n.locale)
  console.log('- about.title:', i18n.t('about.title'))
  console.log('- login.title:', i18n.t('login.title'))
  console.log('- nav.home:', i18n.t('nav.home'))

  // 测试带参数的翻译
  console.log('\n🎉 测试带参数的翻译:')
  console.log('- validation.min:', i18n.t('validation.min', { min: 6 }))
  console.log('- validation.max:', i18n.t('validation.max', { max: 20 }))

  // 测试英文
  console.log('\n📝 测试英文翻译:')
  await i18n.setLocale('en-US')
  console.log('- 当前语言:', i18n.locale)
  console.log('- about.title:', i18n.t('about.title'))
  console.log('- login.title:', i18n.t('login.title'))
  console.log('- nav.home:', i18n.t('nav.home'))

  // 测试缓存性能
  console.log('\n⚡ 测试缓存性能:')
  const startTime = performance.now()
  for (let i = 0; i < 1000; i++) {
    i18n.t('about.title')
  }
  const endTime = performance.now()
  console.log(`- 1000次翻译耗时: ${(endTime - startTime).toFixed(2)}ms`)

  // 检查语言包结构
  console.log('\n📦 检查语言包结构:')
  console.log('中文语言包键:', Object.keys(zhCN))
  console.log('英文语言包键:', Object.keys(enUS))

  // 测试键存在性
  console.log('\n🔍 键存在性检查:')
  console.log('- has("about.title"):', i18n.exists?.('about.title'))
  console.log('- has("non.existent.key"):', i18n.exists?.('non.existent.key'))

  console.log('\n✅ @ldesign/i18n 自测完成!')
}

// 仅在开发环境下运行
if (import.meta.env.DEV) {
  testI18n().catch(console.error)
}

export { testI18n }
