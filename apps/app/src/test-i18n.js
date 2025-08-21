// 简单的 i18n 功能测试
console.log('🧪 开始测试 i18n 功能...')

// 等待应用完全加载
setTimeout(() => {
  try {
    // 检查全局 $t 函数是否可用
    if (
      window.Vue
      && window.Vue.config
      && window.Vue.config.globalProperties
      && window.Vue.config.globalProperties.$t
    ) {
      console.log('✅ 全局 $t 函数已注册')

      // 测试基础翻译
      const translation = window.Vue.config.globalProperties.$t('common.ok')
      console.log('✅ 基础翻译测试:', translation)
    }
    else {
      console.log('❌ 全局 $t 函数未找到')
    }

    // 检查 engine 是否有 i18n 实例
    if (window.$engine && window.$engine.i18n) {
      console.log('✅ Engine i18n 实例已注册')

      // 测试 i18n 实例方法
      const currentLang = window.$engine.i18n.getCurrentLanguage()
      console.log('✅ 当前语言:', currentLang)

      // 测试性能指标
      const metrics = window.$engine.i18n.getPerformanceMetrics()
      console.log('✅ 性能指标:', metrics)
    }
    else {
      console.log('❌ Engine i18n 实例未找到')
    }

    console.log('🎉 i18n 功能测试完成！')
  }
  catch (error) {
    console.error('❌ i18n 测试失败:', error)
  }
}, 2000) // 等待2秒确保应用完全加载
