/**
 * @ldesign/color Engine 插件
 * 
 * 提供与 @ldesign/engine 的集成，包括：
 * - 主题管理器的全局状态管理
 * - Vue 应用集成
 * - 响应式主题切换
 * - 全局属性注册
 */

import type { ThemeManagerInstance, ThemeManagerOptions, ThemeConfig, ColorMode } from '../../core/types'
import { presetThemes } from '../../themes/presets'
import { ThemeManager } from '../../core/theme-manager'

/**
 * Color Engine 插件选项
 */
export interface ColorEnginePluginOptions extends ThemeManagerOptions {
  /** 插件名称 */
  name?: string
  /** 插件版本 */
  version?: string
  /** 自定义主题配置 */
  customThemes?: ThemeConfig[]
  /** 是否启用深度合并 */
  enableDeepMerge?: boolean
}

/**
 * 深度合并两个对象
 * @param target 目标对象
 * @param source 源对象
 * @returns 合并后的对象
 */
function deepMerge(target: any, source: any): any {
  if (typeof target !== 'object' || target === null) {
    return source
  }
  if (typeof source !== 'object' || source === null) {
    return target
  }

  const result = { ...target }

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        result[key] = deepMerge(target[key], source[key])
      } else {
        result[key] = source[key]
      }
    }
  }

  return result
}

/**
 * 创建 ThemeManager 实例
 * @param options ThemeManager 配置选项
 * @param customThemes 自定义主题配置
 * @returns ThemeManager 实例
 */
export async function createThemeManagerInstance(
  options?: ThemeManagerOptions,
  customThemes?: ThemeConfig[],
): Promise<ThemeManagerInstance> {
  let themes = [...presetThemes]

  // 如果有自定义主题，进行深度合并
  if (customThemes && customThemes.length > 0) {
    console.log('[Color Plugin] Merging custom themes with builtin themes')

    customThemes.forEach((customTheme) => {
      const existingThemeIndex = themes.findIndex(theme => theme.name === customTheme.name)

      if (existingThemeIndex >= 0) {
        // 深度合并自定义主题与内置主题
        const mergedTheme = deepMerge(themes[existingThemeIndex], customTheme)
        themes[existingThemeIndex] = mergedTheme

        console.log(`[Color Plugin] Merged theme: ${customTheme.name}`, {
          builtinKeys: Object.keys(themes[existingThemeIndex]),
          customKeys: Object.keys(customTheme),
          mergedKeys: Object.keys(mergedTheme),
        })
      } else {
        // 如果没有内置主题，直接添加自定义主题
        themes.push(customTheme)

        console.log(`[Color Plugin] Added custom theme: ${customTheme.name}`, {
          customKeys: Object.keys(customTheme),
        })
      }
    })
  }

  const themeManager = new ThemeManager({
    themes,
    defaultTheme: 'default',
    ...options,
  })

  await themeManager.init()
  return themeManager
}

/**
 * Engine 插件接口
 */
interface Plugin {
  name: string
  version: string
  dependencies?: string[]
  install: (context: any) => Promise<void>
  uninstall?: (context: any) => Promise<void>
}

/**
 * Engine 插件上下文
 */
export interface EnginePluginContext {
  engine: any
  logger: any
  config: any
}

/**
 * 创建 Color Engine 插件
 * @param options 插件配置选项
 * @returns Engine 插件
 */
export function createColorEnginePlugin(
  options: ColorEnginePluginOptions = {}
): Plugin {
  const {
    name = 'color',
    version = '1.0.0',
    customThemes,
    enableDeepMerge = true,
    ...themeManagerOptions
  } = options

  console.log('[Color Plugin] createColorEnginePlugin called with options:', options)

  return {
    name,
    version,
    dependencies: [],

    async install(context) {
      try {
        console.log('[Color Plugin] install method called with context:', context)

        // 从上下文中获取引擎实例
        const engine = context.engine || context
        console.log('[Color Plugin] engine instance:', !!engine)

        // 定义实际的安装逻辑
        const performInstall = async () => {
          engine.logger.info(`[Color Plugin] performInstall called`)

          // 获取 Vue 应用实例
          const vueApp = engine.getApp()
          if (!vueApp) {
            throw new Error(
              'Vue app not found. Make sure the engine has created a Vue app before installing color plugin.',
            )
          }

          engine.logger.info(`[Color Plugin] Vue app found, proceeding with installation`)

          // 记录插件安装开始
          engine.logger.info(`Installing ${name} plugin...`, {
            version,
            enableDeepMerge,
          })

          // 创建 ThemeManager 实例
          const themeManager = await createThemeManagerInstance(themeManagerOptions, customThemes)

          // 注册到 Engine 状态管理
          if (engine.state) {
            engine.state.set('color:instance', themeManager)
            engine.state.set('color:currentTheme', themeManager.getCurrentTheme())
            engine.state.set('color:currentMode', themeManager.getCurrentMode())
          }

          // 创建 Color 适配器
          const colorAdapter = {
            install: (engine: any) => {
              // 在Engine的install阶段执行Vue集成
              const vueApp = engine.getApp()
              if (vueApp) {
                console.log('[Color Plugin] Installing Vue integration via adapter.install')

                // 创建一个简单的响应式状态管理
                let forceUpdateCounter = 0
                const forceUpdateCallbacks: (() => void)[] = []

                // 创建响应式的主题管理器包装器
                const reactiveThemeManager = {
                  // 保留原始实例的所有方法
                  getCurrentTheme: () => themeManager.getCurrentTheme(),
                  getCurrentMode: () => themeManager.getCurrentMode(),
                  getThemeNames: () => themeManager.getThemeNames(),
                  getThemeConfig: (name: string) => themeManager.getThemeConfig(name),
                  getGeneratedTheme: (name: string) => themeManager.getGeneratedTheme(name),
                  registerTheme: (config: any) => themeManager.registerTheme(config),
                  registerThemes: (configs: any[]) => themeManager.registerThemes(configs),
                  preGenerateTheme: (name: string) => themeManager.preGenerateTheme(name),
                  preGenerateAllThemes: () => themeManager.preGenerateAllThemes(),
                  applyTheme: (name: string, mode: ColorMode) => themeManager.applyTheme(name, mode),
                  removeTheme: () => themeManager.removeTheme(),
                  destroy: () => themeManager.destroy(),
                  init: () => themeManager.init(),
                  on: (event: any, callback: Function) => themeManager.on(event, callback),
                  off: (event: any, callback: Function) => themeManager.off(event, callback),
                  emit: (event: any, data: any) => themeManager.emit(event, data),
                  setTheme: async (theme: string, mode?: ColorMode) => {
                    await themeManager.setTheme(theme, mode)
                    console.log('[Color Plugin] Reactive theme changed to:', theme, mode)

                    // 触发所有组件重新渲染
                    forceUpdateCounter++
                    forceUpdateCallbacks.forEach(callback => {
                      try {
                        callback()
                      } catch (error) {
                        console.warn('[Color Plugin] Force update callback error:', error)
                      }
                    })

                    // 通过Engine事件系统通知主题变化
                    engine.events.emit('color:theme-changed', {
                      theme,
                      mode: mode || themeManager.getCurrentMode(),
                      timestamp: Date.now()
                    })
                  },
                  setMode: async (mode: ColorMode) => {
                    await themeManager.setMode(mode)
                    console.log('[Color Plugin] Reactive mode changed to:', mode)

                    // 触发所有组件重新渲染
                    forceUpdateCounter++
                    forceUpdateCallbacks.forEach(callback => {
                      try {
                        callback()
                      } catch (error) {
                        console.warn('[Color Plugin] Force update callback error:', error)
                      }
                    })

                    // 通过Engine事件系统通知模式变化
                    engine.events.emit('color:mode-changed', {
                      mode,
                      timestamp: Date.now()
                    })
                  },
                  toggleMode: async () => {
                    await themeManager.toggleMode()
                    const newMode = themeManager.getCurrentMode()
                    console.log('[Color Plugin] Reactive mode toggled to:', newMode)

                    // 触发所有组件重新渲染
                    forceUpdateCounter++
                    forceUpdateCallbacks.forEach(callback => {
                      try {
                        callback()
                      } catch (error) {
                        console.warn('[Color Plugin] Force update callback error:', error)
                      }
                    })

                    // 通过Engine事件系统通知模式变化
                    engine.events.emit('color:mode-changed', {
                      mode: newMode,
                      timestamp: Date.now()
                    })
                  }
                }

                // 提供主题管理器实例给Vue组件
                vueApp.provide('$themeManager', reactiveThemeManager)

                // 注册全局属性
                vueApp.config.globalProperties.$color = reactiveThemeManager
                vueApp.config.globalProperties.$theme = reactiveThemeManager
                vueApp.config.globalProperties.$themeManager = reactiveThemeManager

                // 添加全局mixin来处理主题变化
                vueApp.mixin({
                  created() {
                    // 注册强制更新回调
                    const forceUpdate = () => {
                      this.$forceUpdate?.()
                    }
                    forceUpdateCallbacks.push(forceUpdate)

                    // 在组件销毁时清理回调
                    this.$once?.('hook:beforeDestroy', () => {
                      const index = forceUpdateCallbacks.indexOf(forceUpdate)
                      if (index > -1) {
                        forceUpdateCallbacks.splice(index, 1)
                      }
                    })
                  }
                })

                // 验证全局属性是否正确注册
                console.log('[Color Plugin] Adapter Vue integration completed:', {
                  '$color': typeof vueApp.config.globalProperties.$color,
                  '$theme': typeof vueApp.config.globalProperties.$theme,
                  '$themeManager': typeof vueApp.config.globalProperties.$themeManager,
                  'reactive': true
                })

                engine.logger.info(`${name} plugin Vue integration installed via adapter`)
              }
            },
            getCurrentTheme: () => themeManager.getCurrentTheme(),
            getCurrentMode: () => themeManager.getCurrentMode(),
            setTheme: (theme: string, mode?: ColorMode) => themeManager.setTheme(theme, mode),
            setMode: (mode: ColorMode) => themeManager.setMode(mode),
            toggleMode: () => themeManager.toggleMode(),
            getInstance: () => themeManager,
          }

          // 设置到引擎
          engine.color = colorAdapter
          console.log('[Color Plugin] colorAdapter set to engine.color:', {
            'adapter': !!colorAdapter,
            'adapter.install': typeof colorAdapter.install,
            'engine.color': !!engine.color,
            'engine.color.install': typeof engine.color?.install
          })

          // 手动调用adapter.install，因为Engine的install方法已经执行过了
          if (typeof colorAdapter.install === 'function') {
            console.log('[Color Plugin] Manually calling adapter.install')
            colorAdapter.install(engine)
          }

          // Vue集成现在通过adapter.install方法在Engine的install阶段执行
          // 这里只需要记录安装完成
          engine.logger.info(`${name} plugin Vue integration will be handled by adapter.install`)

          engine.logger.info(`${name} plugin installed successfully`, {
            currentTheme: themeManager.getCurrentTheme(),
            currentMode: themeManager.getCurrentMode(),
          })

          // 触发插件安装完成事件
          if (engine.events) {
            engine.events.emit(`plugin:${name}:installed`, {
              themeManager,
              currentTheme: themeManager.getCurrentTheme(),
              currentMode: themeManager.getCurrentMode(),
            })
          }
        }

        // 检查 Vue 应用是否已经创建
        const vueApp = engine.getApp()
        if (vueApp) {
          engine.logger.info(`[Color Plugin] Vue app found, installing immediately`)
          await performInstall()
        } else {
          engine.logger.info(`[Color Plugin] Vue app not found, registering event listener`)
          // 如果 Vue 应用还没有创建，监听 app:created 事件
          engine.events.once('app:created', async () => {
            engine.logger.info(`[Color Plugin] app:created event received, installing now`)
            await performInstall()
          })
        }

        engine.logger.info(`${name} plugin registered, waiting for Vue app creation...`)
      } catch (error) {
        console.error(`[Color Plugin] Installation failed:`, error)
        throw error
      }
    },
  }
}

// createThemeManagerInstance 已在上面导出

// 向后兼容的导出
export { createColorEnginePlugin as default }
