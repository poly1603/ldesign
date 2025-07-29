import type { App, Plugin } from 'vue'
import { Engine, createEngine } from './core/engine'
import type { EngineConfig } from './types'

/**
 * Vue插件选项
 */
export interface VuePluginOptions extends EngineConfig {
  /** 全局属性名称 */
  globalPropertyName?: string
  /** 是否自动启动引擎 */
  autoStart?: boolean
}

/**
 * LDesign引擎Vue插件
 */
const LDesignEnginePlugin: Plugin = {
  install(app: App, options: VuePluginOptions = {}) {
    const {
      globalPropertyName = '$ldesign',
      autoStart = true,
      ...engineConfig
    } = options

    // 创建引擎实例
    const engine = createEngine(engineConfig)
    
    // 设置Vue应用实例
    engine.setApp(app)

    // 注册全局属性
    app.config.globalProperties[globalPropertyName] = engine

    // 提供引擎实例
    app.provide('ldesign-engine', engine)

    // 自动启动引擎
    if (autoStart) {
      engine.start().catch(error => {
        console.error('Failed to start LDesign engine:', error)
      })
    }

    // 在应用卸载时清理引擎
    const originalUnmount = app.unmount
    app.unmount = function() {
      engine.destroy().catch(error => {
        console.error('Failed to destroy LDesign engine:', error)
      })
      return originalUnmount.call(this)
    }
  }
}

export default LDesignEnginePlugin

/**
 * 创建LDesign引擎Vue插件
 */
export function createLDesignPlugin(options?: VuePluginOptions): Plugin {
  return {
    install(app: App) {
      LDesignEnginePlugin.install!(app, options)
    }
  }
}

/**
 * Vue组合式API - 使用引擎
 */
export function useEngine(): Engine {
  const { inject } = require('vue')
  const engine = inject<Engine>('ldesign-engine')
  
  if (!engine) {
    throw new Error('LDesign engine not found. Make sure to install the plugin first.')
  }
  
  return engine
}

/**
 * Vue组合式API - 使用插件
 */
export function usePlugin(name: string) {
  const engine = useEngine()
  const plugin = engine.getPlugin(name)
  
  if (!plugin) {
    throw new Error(`Plugin ${name} not found`)
  }
  
  return plugin
}

/**
 * Vue组合式API - 使用事件总线
 */
export function useEventBus() {
  const engine = useEngine()
  return engine.eventBus
}

/**
 * Vue组合式API - 使用生命周期
 */
export function useLifecycle() {
  const engine = useEngine()
  return engine.lifecycle
}