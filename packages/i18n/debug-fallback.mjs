/**
 * 调试降级语言功能
 */

import { I18n } from './esm/core/i18n.js';

console.log('🔍 调试降级语言功能...\n');

const i18n = new I18n({
  defaultLocale: 'zh-CN',
  fallbackLocale: 'en',
  autoDetect: false,
  storage: 'none',
  messages: {
    'zh-CN': { 
      hello: '你好'
      // 注意：missing 键不存在
    },
    'en': {
      hello: 'Hello',
      missing: 'This key only exists in English'
    }
  }
});

console.log('1. I18n 实例创建成功');
console.log('2. 当前语言:', i18n.getCurrentLanguage());
console.log('3. 降级语言:', i18n.options.fallbackLocale);

// 初始化
await i18n.init();
console.log('4. 初始化后当前语言:', i18n.getCurrentLanguage());

// 检查语言包是否正确加载
console.log('5. 检查语言包加载状态:');
console.log('   zh-CN 是否已加载:', i18n.loader.isLoaded('zh-CN'));
console.log('   en 是否已加载:', i18n.loader.isLoaded('en'));

// 尝试手动加载英文语言包
try {
  await i18n.loader.load('en');
  console.log('6. 手动加载英文语言包成功');
} catch (error) {
  console.error('6. 手动加载英文语言包失败:', error.message);
}

// 测试翻译
console.log('7. 测试翻译:');
console.log('   hello (存在于中文):', i18n.t('hello'));
console.log('   missing (仅存在于英文):', i18n.t('missing'));

// 检查 exists 方法
console.log('8. 检查键存在性:');
console.log('   hello 在 zh-CN 中存在:', i18n.exists('hello', 'zh-CN'));
console.log('   missing 在 zh-CN 中存在:', i18n.exists('missing', 'zh-CN'));
console.log('   missing 在 en 中存在:', i18n.exists('missing', 'en'));

console.log('\n🔍 调试完成');
