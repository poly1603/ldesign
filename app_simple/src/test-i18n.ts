/**
 * 测试i18n配置是否正确
 */

import { initI18n, setLocale } from './i18n'
import zhCN from './i18n/locales/zh-CN'
import enUS from './i18n/locales/en-US'

async function testI18n() {
  console.log('🧪 开始测试i18n配置...')
  
  // 初始化i18n
  const i18n = await initI18n()
  
  // 测试中文
  console.log('\n📝 测试中文翻译:')
  await setLocale('zh-CN')
  console.log('- page.about.title:', i18n.t('page.about.title'))
  console.log('- page.login.title:', i18n.t('page.login.title'))
  console.log('- common.home:', i18n.t('common.home'))
  
  // 测试英文
  console.log('\n📝 测试英文翻译:')
  await setLocale('en-US')
  console.log('- page.about.title:', i18n.t('page.about.title'))
  console.log('- page.login.title:', i18n.t('page.login.title'))
  console.log('- common.home:', i18n.t('common.home'))
  
  // 检查语言包结构
  console.log('\n📦 检查语言包结构:')
  console.log('中文语言包键:', Object.keys(zhCN))
  console.log('英文语言包键:', Object.keys(enUS))
  
  // 检查页面翻译
  console.log('\n🌍 检查页面翻译:')
  const pages = ['home', 'about', 'login']
  for (const page of pages) {
    const zhKey = zhCN.page?.[page]
    const enKey = enUS.page?.[page]
    console.log(`- ${page}: 中文=${!!zhKey}, 英文=${!!enKey}`)
  }
  
  console.log('\n✅ i18n测试完成!')
}

// 仅在开发环境下运行
if (import.meta.env.DEV) {
  testI18n().catch(console.error)
}

export { testI18n }