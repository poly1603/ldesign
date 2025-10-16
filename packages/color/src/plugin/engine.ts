/**
 * @ldesign/color - Engine Plugin Integration
 * 
 * Color theme plugin for @ldesign/engine with reactive locale support
 */

import type { Engine, Plugin } from '@ldesign/engine'
import type { App } from 'vue'
import { ref, watch } from 'vue'
import { createColorPlugin, type ColorPluginOptions, type ColorPlugin } from './index'

export interface ColorEnginePluginOptions extends ColorPluginOptions {
  /**
   * Whether to sync with engine's locale state
   * @default true
   */
  syncLocale?: boolean
}

/**
 * Create color engine plugin
 * This plugin integrates with @ldesign/engine's state management
 * to support reactive locale changes
 */
export function createColorEnginePlugin(options: ColorEnginePluginOptions = {}): Plugin {
  return {
    name: 'color-engine-plugin',
    version: '1.0.0',

    async install(engine: Engine, app: App) {
      // Create the color plugin instance
      const colorPlugin = createColorPlugin(options)
      
      // Install the color plugin to the app
      colorPlugin.install(app)
      
      // Sync with engine locale state if enabled
      if (options.syncLocale !== false) {
        // Get initial locale from engine state or use default
        const initialLocale = engine.state.get<string>('i18n.locale') || 'zh-CN'
        colorPlugin.setLocale(initialLocale)
        
        // Watch for engine locale changes
        const unwatch = engine.state.watch('i18n.locale', (newLocale: string) => {
          if (newLocale && newLocale !== colorPlugin.currentLocale.value) {
            colorPlugin.setLocale(newLocale)
            engine.logger.debug('Color plugin locale synced with engine', { newLocale })
          }
        })
        
        // Also listen for locale change events
        engine.events.on('i18n:locale-changed', ({ newLocale }: any) => {
          if (newLocale && newLocale !== colorPlugin.currentLocale.value) {
            colorPlugin.setLocale(newLocale)
            engine.logger.debug('Color plugin locale updated from event', { newLocale })
          }
        })
        
        // Store unwatch function for cleanup
        app._context.__colorEngineUnwatch = unwatch
      }
      
      // Provide color plugin through engine context
      engine.state.set('plugins.color', colorPlugin)
      
      // Log successful installation
      engine.logger.info('Color engine plugin installed', {
        syncLocale: options.syncLocale !== false,
        defaultTheme: options.defaultTheme,
        persistence: options.persistence !== false
      })
    }
  }
}

/**
 * Get color plugin from engine
 */
export function useColorFromEngine(engine: Engine): ColorPlugin | undefined {
  return engine.state.get<ColorPlugin>('plugins.color')
}