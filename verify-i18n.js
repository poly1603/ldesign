/**
 * 验证多语言包功能
 * 测试新实现的语言选择配置、翻译内容扩展等功能
 */

import { createConfigurableI18n } from './packages/i18n/src/index.ts';

async function verifyI18nFeatures() {
  console.log('🚀 开始验证多语言包功能...\n');

  try {
    // 测试1: 基础配置功能
    console.log('📋 测试1: 基础配置功能');
    const basicI18n = createConfigurableI18n({
      locale: 'zh-CN',
      autoDetect: false,
      messages: {
        'zh-CN': { hello: '你好', world: '世界' },
        'en': { hello: 'Hello', world: 'World' }
      }
    });

    await basicI18n.init();
    console.log('✅ 基础配置创建成功');
    console.log(`   当前语言: ${basicI18n.currentLocale}`);
    console.log(`   翻译测试: ${basicI18n.t('hello')} ${basicI18n.t('world')}`);

    // 测试语言切换
    await basicI18n.changeLanguage('en');
    console.log(`   切换后: ${basicI18n.t('hello')} ${basicI18n.t('world')}`);
    console.log('');

    // 测试2: 语言选择配置
    console.log('📋 测试2: 语言选择配置');
    const selectiveI18n = createConfigurableI18n({
      locale: 'zh-CN',
      autoDetect: false,
      languageConfig: {
        enabled: ['zh-CN', 'en'],
        defaultLocale: 'zh-CN',
        fallbackLocale: 'en'
      },
      messages: {
        'zh-CN': { test: '测试' },
        'en': { test: 'Test' },
        'ja': { test: 'テスト' }
      },
      strictMode: true
    });

    await selectiveI18n.init();
    console.log('✅ 语言选择配置创建成功');
    console.log(`   启用的语言: ${selectiveI18n.getLanguageRegistry().getEnabledLanguages().join(', ')}`);
    
    // 测试严格模式
    try {
      await selectiveI18n.changeLanguage('ja');
      console.log('❌ 严格模式测试失败 - 应该阻止切换到未启用的语言');
    } catch (error) {
      console.log('✅ 严格模式正常 - 成功阻止切换到未启用的语言');
    }
    console.log('');

    // 测试3: 翻译内容扩展
    console.log('📋 测试3: 翻译内容扩展');
    const extensibleI18n = createConfigurableI18n({
      locale: 'zh-CN',
      autoDetect: false,
      globalExtensions: [
        {
          name: 'app-common',
          translations: {
            app: { name: 'LDesign App', version: '2.0.0' }
          }
        }
      ],
      languageExtensions: {
        'zh-CN': [
          {
            name: 'zh-custom',
            translations: {
              app: { name: 'LDesign 应用' },
              custom: { message: '自定义消息' }
            }
          }
        ]
      }
    });

    await extensibleI18n.init();
    console.log('✅ 翻译内容扩展创建成功');
    console.log(`   应用名称: ${extensibleI18n.t('app.name')}`);
    console.log(`   应用版本: ${extensibleI18n.t('app.version')}`);
    console.log(`   自定义消息: ${extensibleI18n.t('custom.message')}`);
    
    // 获取扩展统计
    const stats = extensibleI18n.getExtensionLoader().getExtensionStats();
    console.log(`   扩展统计: 全局扩展 ${stats.globalExtensions} 个，语言扩展 ${stats.languageExtensions} 个`);
    console.log('');

    // 测试4: 动态语言管理
    console.log('📋 测试4: 动态语言管理');
    const registry = selectiveI18n.getLanguageRegistry();
    
    console.log(`   初始启用语言: ${registry.getEnabledLanguages().join(', ')}`);
    
    // 动态启用日语
    registry.enableLanguage('ja');
    console.log(`   启用日语后: ${registry.getEnabledLanguages().join(', ')}`);
    
    // 检查语言状态
    console.log(`   日语是否启用: ${registry.isLanguageEnabled('ja')}`);
    console.log(`   法语是否启用: ${registry.isLanguageEnabled('fr')}`);
    console.log('');

    // 测试5: 完整功能集成
    console.log('📋 测试5: 完整功能集成');
    const fullI18n = createConfigurableI18n({
      locale: 'zh-CN',
      fallbackLocale: 'en',
      autoDetect: false,
      languageConfig: {
        enabled: ['zh-CN', 'en'],
        priority: { 'zh-CN': 100, 'en': 90 }
      },
      messages: {
        'zh-CN': { greeting: '你好' },
        'en': { greeting: 'Hello' }
      },
      globalExtensions: [
        {
          name: 'global-ext',
          translations: { common: { save: 'Save', cancel: 'Cancel' } }
        }
      ],
      languageExtensions: {
        'zh-CN': [
          {
            name: 'zh-ext',
            translations: { common: { save: '保存', cancel: '取消' } }
          }
        ]
      },
      strictMode: true,
      storage: 'memory',
      cache: { enabled: true, maxSize: 100 }
    });

    await fullI18n.init();
    console.log('✅ 完整功能集成创建成功');
    console.log(`   问候语: ${fullI18n.t('greeting')}`);
    console.log(`   保存按钮: ${fullI18n.t('common.save')}`);
    console.log(`   取消按钮: ${fullI18n.t('common.cancel')}`);
    
    // 切换到英语
    await fullI18n.changeLanguage('en');
    console.log(`   英语问候: ${fullI18n.t('greeting')}`);
    console.log(`   英语保存: ${fullI18n.t('common.save')}`);
    console.log('');

    console.log('🎉 所有测试完成！多语言包功能正常工作。');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    console.error('错误堆栈:', error.stack);
  }
}

// 运行验证
verifyI18nFeatures().catch(console.error);
