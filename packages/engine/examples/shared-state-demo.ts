/**
 * Plugin Shared State Demo
 * 
 * 这个示例展示如何使用 PluginSharedStateManager 实现插件间的状态共享
 */

import { createEngine } from '../src/core/engine'
import type { Plugin, PluginContext } from '../src/types'
import { watch } from 'vue'

// ===== 示例 1: 基础的状态共享 =====

/**
 * I18n 插件 - 创建公共的 locale 状态
 */
const i18nPlugin: Plugin = {
  name: 'i18n-plugin',
  version: '1.0.0',
  description: 'Internationalization plugin',

  async install(context: PluginContext) {
    const { sharedState, logger } = context

    if (!sharedState) {
      throw new Error('SharedState is required')
    }

    logger?.info('Installing i18n plugin...')

    // 创建公共的 locale 状态
    const localeRef = sharedState.createSharedState(
      'i18n-plugin',
      'locale',
      'zh-CN',
      {
        access: 'public',
        description: 'Current application locale',
        persist: true,
        readonly: false
      }
    )

    // 监听 locale 变化
    watch(localeRef, (newLocale) => {
      logger?.info(`Locale changed to: ${newLocale}`)
    })

    // 监听其他插件的消息
    sharedState.onMessage('i18n-plugin', (message) => {
      if (message.type === 'REQUEST_LOCALE') {
        // 响应请求
        sharedState.sendMessage(
          'i18n-plugin',
          message.from,
          'LOCALE_RESPONSE',
          { locale: localeRef.value }
        )
      }
    })

    logger?.info('i18n plugin installed successfully')
  }
}

/**
 * Theme 插件 - 访问 i18n 的 locale 状态
 */
const themePlugin: Plugin = {
  name: 'theme-plugin',
  version: '1.0.0',
  description: 'Theme management plugin',
  dependencies: ['i18n-plugin'],  // 显式声明依赖

  async install(context: PluginContext) {
    const { sharedState, logger } = context

    if (!sharedState) {
      throw new Error('SharedState is required')
    }

    logger?.info('Installing theme plugin...')

    // 访问 i18n 的 locale 状态
    const localeRef = sharedState.accessSharedState<string>(
      'theme-plugin',
      'i18n-plugin',
      'locale'
    )

    if (!localeRef) {
      throw new Error('Cannot access i18n locale state')
    }

    // 创建 theme 插件自己的状态
    const themeRef = sharedState.createSharedState(
      'theme-plugin',
      'currentTheme',
      'blue',
      {
        access: 'public',
        description: 'Current color theme',
        persist: true
      }
    )

    // 监听 locale 变化，更新主题的国际化
    sharedState.watchSharedState(
      'theme-plugin',
      'i18n-plugin',
      'locale',
      (newLocale) => {
        logger?.info(`Theme plugin: locale changed to ${newLocale}`)
        // 这里可以加载对应语言的主题名称
      }
    )

    // 当主题变化时，广播给其他插件
    watch(themeRef, (newTheme) => {
      sharedState.sendMessage(
        'theme-plugin',
        '*',  // 广播给所有插件
        'THEME_CHANGED',
        { theme: newTheme }
      )
    })

    logger?.info('theme plugin installed successfully')
  }
}

/**
 * Analytics 插件 - 监听其他插件的事件
 */
const analyticsPlugin: Plugin = {
  name: 'analytics-plugin',
  version: '1.0.0',
  description: 'Analytics tracking plugin',
  dependencies: ['i18n-plugin', 'theme-plugin'],

  async install(context: PluginContext) {
    const { sharedState, logger } = context

    if (!sharedState) {
      throw new Error('SharedState is required')
    }

    logger?.info('Installing analytics plugin...')

    // 访问多个插件的状态
    const localeRef = sharedState.accessSharedState<string>(
      'analytics-plugin',
      'i18n-plugin',
      'locale'
    )

    const themeRef = sharedState.accessSharedState<string>(
      'analytics-plugin',
      'theme-plugin',
      'currentTheme'
    )

    // 创建全局计算状态
    const userPreference = sharedState.createGlobalComputed(
      'userPreference',
      () => ({
        locale: localeRef?.value,
        theme: themeRef?.value,
        timestamp: Date.now()
      })
    )

    // 监听所有消息，记录分析数据
    sharedState.onMessage('analytics-plugin', (message) => {
      logger?.info(`[Analytics] ${message.from} -> ${message.to}: ${message.type}`)

      // 这里可以发送到分析服务器
      trackEvent({
        type: message.type,
        from: message.from,
        data: message.data,
        preference: userPreference.value
      })
    })

    logger?.info('analytics plugin installed successfully')
  }
}

// 模拟事件跟踪函数
function trackEvent(event: any) {
  console.log('📊 Track Event:', JSON.stringify(event, null, 2))
}

// ===== 示例 2: 状态同步 =====

/**
 * 展示如何在多个插件间同步状态
 */
async function demoStateSynchronization(engine: any) {
  const { sharedState } = engine

  // 创建多个插件的配置状态
  sharedState.createSharedState('plugin-a', 'config', { mode: 'normal' }, { access: 'public' })
  sharedState.createSharedState('plugin-b', 'config', { mode: 'normal' }, { access: 'public' })
  sharedState.createSharedState('plugin-c', 'config', { mode: 'normal' }, { access: 'public' })

  // 同步所有插件的 config.mode
  const unsubscribe = sharedState.synchronize(
    ['plugin-a', 'plugin-b', 'plugin-c'],
    'config.mode',
    {
      bidirectional: true,
      debounce: 300
    }
  )

  // 修改任意一个，其他自动同步
  const configA = sharedState.accessSharedState('demo', 'plugin-a', 'config')
  if (configA) {
    configA.value = { mode: 'compact' }
  }

  // 等待同步
  await new Promise(resolve => setTimeout(resolve, 500))

  // 验证同步
  const configB = sharedState.accessSharedState('demo', 'plugin-b', 'config')
  const configC = sharedState.accessSharedState('demo', 'plugin-c', 'config')

  console.log('Config A:', configA?.value)
  console.log('Config B:', configB?.value)  // 应该是 { mode: 'compact' }
  console.log('Config C:', configC?.value)  // 应该是 { mode: 'compact' }

  // 清理
  unsubscribe()
}

// ===== 示例 3: 状态桥接 =====

/**
 * 展示如何在插件间建立状态桥接，支持数据转换
 */
async function demoStateBridge(engine: any) {
  const { sharedState } = engine

  // 源插件的状态
  sharedState.createSharedState('source-plugin', 'temperature', 25, { access: 'public' })

  // 创建桥接：摄氏度 -> 华氏度
  const unsubscribe = sharedState.createBridge(
    'source-plugin',
    'temperature',
    'target-plugin',
    'temperatureFahrenheit',
    (celsius: number) => celsius * 9 / 5 + 32
  )

  // 修改源状态
  const celsius = sharedState.accessSharedState('demo', 'source-plugin', 'temperature')
  if (celsius) {
    celsius.value = 30
  }

  // 等待桥接
  await new Promise(resolve => setTimeout(resolve, 100))

  // 验证转换
  const targetNamespace = sharedState.getNamespace('target-plugin')
  const fahrenheit = targetNamespace?.get('temperatureFahrenheit')
  console.log('Celsius:', celsius?.value)        // 30
  console.log('Fahrenheit:', fahrenheit)         // 86

  // 清理
  unsubscribe()
}

// ===== 主函数 =====

async function main() {
  console.log('🚀 Plugin Shared State Demo\n')

  // 创建 engine
  const engine = await createEngine({
    config: {
      name: 'Shared State Demo',
      version: '1.0.0',
      debug: true
    }
  })

  console.log('✅ Engine created\n')

  // 注册插件
  await engine.plugins.register(i18nPlugin)
  await engine.plugins.register(themePlugin)
  await engine.plugins.register(analyticsPlugin)

  console.log('\n📊 Plugin Statistics:')
  console.log(JSON.stringify(engine.pluginSharedState.getStats(), null, 2))

  console.log('\n🔗 Dependency Graph:')
  console.log(JSON.stringify(engine.pluginSharedState.getDependencyGraph(), null, 2))

  // 测试状态变化
  console.log('\n🎬 Testing state changes...\n')

  const localeRef = engine.pluginSharedState.accessSharedState(
    'demo',
    'i18n-plugin',
    'locale'
  )

  const themeRef = engine.pluginSharedState.accessSharedState(
    'demo',
    'theme-plugin',
    'currentTheme'
  )

  if (localeRef) {
    console.log('➡️  Changing locale to en-US...')
    localeRef.value = 'en-US'
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  if (themeRef) {
    console.log('➡️  Changing theme to dark...')
    themeRef.value = 'dark'
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  // 演示状态同步
  console.log('\n🔄 Testing state synchronization...\n')
  await demoStateSynchronization(engine)

  // 演示状态桥接
  console.log('\n🌉 Testing state bridge...\n')
  await demoStateBridge(engine)

  // 最终统计
  console.log('\n📊 Final Statistics:')
  console.log(JSON.stringify(engine.pluginSharedState.getStats(), null, 2))

  console.log('\n✅ Demo completed!')
}

// 运行示例
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export {
  i18nPlugin,
  themePlugin,
  analyticsPlugin,
  demoStateSynchronization,
  demoStateBridge
}







