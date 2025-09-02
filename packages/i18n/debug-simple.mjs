/**
 * 简单调试测试
 */

import { I18n } from './esm/core/i18n.js';

console.log('🔍 调试 I18n 核心问题...\n');

const i18n = new I18n({
  defaultLocale: 'zh-CN',
  messages: {
    'zh-CN': { 
      hello: '你好'
    },
    'en': {
      hello: 'Hello'
    }
  }
});

console.log('1. I18n 实例创建成功');
console.log('2. 当前语言:', i18n.getCurrentLanguage());

// 检查 loader
console.log('3. Loader 类型:', i18n.loader.constructor.name);

// 检查可用语言
console.log('4. 可用语言:', i18n.loader.getAvailableLocales());

// 尝试加载语言包
try {
  console.log('5. 尝试加载 zh-CN 语言包...');
  await i18n.loader.load('zh-CN');
  console.log('   ✅ zh-CN 语言包加载成功');
} catch (error) {
  console.error('   ❌ zh-CN 语言包加载失败:', error.message);
}

// 初始化
try {
  console.log('6. 初始化 I18n...');
  await i18n.init();
  console.log('   ✅ I18n 初始化成功');
  console.log('   当前语言:', i18n.getCurrentLanguage());
} catch (error) {
  console.error('   ❌ I18n 初始化失败:', error.message);
}

// 测试翻译
console.log('7. 测试翻译:');
console.log('   hello:', i18n.t('hello'));

console.log('\n🔍 调试完成');
