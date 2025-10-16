/**
 * @ldesign/size - Engine Plugin Integration
 * 
 * Size system plugin for @ldesign/engine with reactive locale support
 */

import type { Engine, Plugin } from '@ldesign/engine'
import type { App } from 'vue'
import { ref, watch } from 'vue'
import { createSizePlugin, type SizePluginOptions, type SizePlugin } from './index'

export interface SizeEnginePluginOptions extends SizePluginOptions {
  /**
   * Whether to sync with engine's locale state
   * @default true
   */
  syncLocale?: boolean
}

/**
 * Create size engine plugin
 * This plugin integrates with @ldesign/engine's state management
 * to support reactive locale changes
 */
export function createSizeEnginePlugin(options: SizeEnginePluginOptions = {}): Plugin {
  return {
    name: 'size-engine-plugin',
    version: '1.0.0',

    async install(engine: Engine, app: App) {
      // Create the size plugin instance
      const sizePlugin = createSizePlugin(options)
      
      // Install the size plugin to the app
      sizePlugin.install(app)
      
      // Sync with engine locale state if enabled
      if (options.syncLocale !== false) {
        // Get initial locale from engine state or use default
        const initialLocale = engine.state.get<string>('i18n.locale') || 'zh-CN'
        sizePlugin.setLocale(initialLocale)
        
        // Watch for engine locale changes
        const unwatch = engine.state.watch('i18n.locale', (newLocale: string) => {
          if (newLocale && newLocale !== sizePlugin.currentLocale.value) {
            sizePlugin.setLocale(newLocale)
            engine.logger.debug('Size plugin locale synced with engine', { newLocale })
          }
        })
        
        // Also listen for locale change events
        engine.events.on('i18n:locale-changed', ({ newLocale }: any) => {
          if (newLocale && newLocale !== sizePlugin.currentLocale.value) {
            sizePlugin.setLocale(newLocale)
            engine.logger.debug('Size plugin locale updated from event', { newLocale })
          }
        })
        
        // Store unwatch function for cleanup
        app._context.__sizeEngineUnwatch = unwatch
      }
      
      // Provide size plugin through engine context
      engine.state.set('plugins.size', sizePlugin)
      
      // Log successful installation
      engine.logger.info('Size engine plugin installed', {
        syncLocale: options.syncLocale !== false,
        defaultSize: options.defaultSize,
        persistence: options.persistence !== false
      })
    }
  }
}

/**
 * Get size plugin from engine
 */
export function useSizeFromEngine(engine: Engine): SizePlugin | undefined {
  return engine.state.get<SizePlugin>('plugins.size')
}