/**
 * @fileoverview Vue 3 plugin for form system
 * @author LDesign Team
 */

import type { App, Plugin } from 'vue'
import type { FormPluginOptions } from '../types'

/**
 * Form plugin for Vue 3
 */
export const FormPlugin: Plugin = {
  install(app: App, options: FormPluginOptions = {}) {
    const {
      prefix = 'LDesign',
      defaultOptions = {},
      validators = {},
      components = {},
      theme = {},
      i18n = {},
    } = options

    // Provide global configuration
    app.provide('formOptions', defaultOptions)
    app.provide('formValidators', validators)
    app.provide('formTheme', theme)
    app.provide('formI18n', i18n)

    // Register global components
    Object.entries(components).forEach(([name, component]) => {
      const componentName = name.startsWith(prefix) ? name : `${prefix}${name}`
      app.component(componentName, component)
    })

    // Add global properties
    app.config.globalProperties.$form = {
      defaultOptions,
      validators,
      theme,
      i18n,
    }

    // Add install flag
    app.config.globalProperties.$ldesignForm = true
  },
}

/**
 * Create form plugin with custom options
 */
export function createFormPlugin(options: FormPluginOptions = {}): Plugin {
  return {
    install(app: App) {
      FormPlugin.install!(app, options)
    },
  }
}

/**
 * Plugin version
 */
export const version = '1.0.0'

/**
 * Install function for direct use
 */
export function install(app: App, options: FormPluginOptions = {}) {
  return FormPlugin.install!(app, options)
}