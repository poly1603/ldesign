/**
 * 插件预设配置
 * 
 * 提供常用的插件组合预设，快速配置项目
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { Plugin } from 'vite'
import { createPerformanceOptimizer } from '../core/PerformanceOptimizer'
import { createDevExperience } from '../core/DevExperience'

export interface PresetOptions {
  /** 项目根目录 */
  root?: string
  /** 是否启用性能优化 */
  enableOptimization?: boolean
  /** 是否启用开发体验增强 */
  enableDevExperience?: boolean
  /** 自定义配置 */
  custom?: Record<string, any>
}

/**
 * 预设类型
 */
export type PresetType = 
  | 'react'
  | 'vue'
  | 'vue2'
  | 'svelte'
  | 'solid'
  | 'preact'
  | 'lit'
  | 'vanilla'
  | 'library'
  | 'electron'
  | 'ssr'
  | 'pwa'
  | 'micro-frontend'

/**
 * React 项目预设
 */
export function reactPreset(options: PresetOptions = {}): Plugin[] {
  const plugins: Plugin[] = []
  
  // React 插件
  try {
    // @ts-ignore
    const react = require('@vitejs/plugin-react')
    plugins.push(react({
      fastRefresh: true,
      babel: {
        plugins: [
          ['@babel/plugin-proposal-decorators', { legacy: true }],
          ['@babel/plugin-proposal-class-properties', { loose: true }]
        ]
      }
    }))
  } catch {
    console.warn('请安装 @vitejs/plugin-react')
  }
  
  // 性能优化
  if (options.enableOptimization !== false) {
    plugins.push(createPerformanceOptimizer({
      enableAutoSplitting: true,
      splitStrategy: 'vendor',
      customSplitRules: {
        'react-vendor': (id) => id.includes('react') || id.includes('react-dom'),
        'ui-components': (id) => id.includes('antd') || id.includes('mui')
      }
    }).createVitePlugin())
  }
  
  // 开发体验
  if (options.enableDevExperience !== false) {
    plugins.push(createDevExperience({
      enableErrorOverlay: true,
      enableFastRefresh: true,
      autoOpenBrowser: true
    }).createVitePlugin())
  }
  
  return plugins
}

/**
 * Vue 3 项目预设
 */
export function vuePreset(options: PresetOptions = {}): Plugin[] {
  const plugins: Plugin[] = []

  // 注意：Vue相关插件需要手动安装
  // npm install @vitejs/plugin-vue @vitejs/plugin-vue-jsx
  console.warn('Vue预设需要手动安装依赖: npm install @vitejs/plugin-vue @vitejs/plugin-vue-jsx')
  
  // 自动导入 - 可选依赖
  // 需要手动安装: npm install unplugin-auto-import unplugin-vue-components
  console.warn('自动导入功能需要手动安装依赖: npm install unplugin-auto-import unplugin-vue-components')
  
  // 性能优化
  if (options.enableOptimization !== false) {
    plugins.push(createPerformanceOptimizer({
      enableAutoSplitting: true,
      splitStrategy: 'vendor',
      customSplitRules: {
        'vue-vendor': (id) => id.includes('@vue'),
        'ui-components': (id) => id.includes('element-plus') || id.includes('naive-ui')
      }
    }).createVitePlugin())
  }
  
  // 开发体验
  if (options.enableDevExperience !== false) {
    plugins.push(createDevExperience({
      enableErrorOverlay: true,
      autoOpenBrowser: true
    }).createVitePlugin())
  }
  
  return plugins
}

/**
 * Vue 2 项目预设
 */
export function vue2Preset(options: PresetOptions = {}): Plugin[] {
  const plugins: Plugin[] = []
  
  try {
    // @ts-ignore
    const vue2 = require('@vitejs/plugin-vue2')
    plugins.push(vue2())
  } catch {
    console.warn('请安装 @vitejs/plugin-vue2')
  }
  
  // 兼容性处理
  try {
    // @ts-ignore
    const legacy = require('@vitejs/plugin-legacy')
    plugins.push(legacy({
      targets: ['defaults', 'not IE 11']
    }))
  } catch {
    // 可选
  }
  
  return plugins
}

/**
 * Svelte 项目预设
 */
export function sveltePreset(options: PresetOptions = {}): Plugin[] {
  const plugins: Plugin[] = []

  // Svelte插件需要手动安装
  console.warn('Svelte预设需要手动安装依赖: npm install @sveltejs/vite-plugin-svelte')
  
  // 优化
  if (options.enableOptimization !== false) {
    plugins.push(createPerformanceOptimizer({
      enableAutoSplitting: true,
      splitStrategy: 'modules'
    }).createVitePlugin())
  }
  
  return plugins
}

/**
 * 库开发预设
 */
export function libraryPreset(options: PresetOptions = {}): Plugin[] {
  const plugins: Plugin[] = []
  
  // DTS 生成
  try {
    // @ts-ignore
    const dts = require('vite-plugin-dts')
    plugins.push(dts({
      insertTypesEntry: true,
      skipDiagnostics: false,
      tsConfigFilePath: './tsconfig.json'
    }))
  } catch {
    console.warn('请安装 vite-plugin-dts')
  }
  
  // 外部化依赖
  try {
    // @ts-ignore
    const { externalizeDeps } = require('vite-plugin-externalize-deps')
    plugins.push(externalizeDeps())
  } catch {
    // 可选
  }
  
  // 性能优化（针对库）
  plugins.push(createPerformanceOptimizer({
    enableCompression: true,
    enableTreeShaking: true,
    enableInlining: false // 库不内联资源
  }).createVitePlugin())
  
  return plugins
}

/**
 * Electron 项目预设
 */
export function electronPreset(options: PresetOptions = {}): Plugin[] {
  const plugins: Plugin[] = []

  // Electron插件需要手动安装
  console.warn('Electron预设需要手动安装依赖: npm install vite-plugin-electron')
  
  return plugins
}

/**
 * SSR 项目预设
 */
export function ssrPreset(options: PresetOptions = {}): Plugin[] {
  const plugins: Plugin[] = []
  
  // SSR 特定优化
  plugins.push(createPerformanceOptimizer({
    enableAutoSplitting: true,
    splitStrategy: 'vendor',
    enableCompression: true
  }).createVitePlugin())
  
  return plugins
}

/**
 * PWA 项目预设
 */
export function pwaPreset(options: PresetOptions = {}): Plugin[] {
  const plugins: Plugin[] = []
  
  try {
    // @ts-ignore
    const { VitePWA } = require('vite-plugin-pwa')
    plugins.push(VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'My App',
        short_name: 'MyApp',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }))
  } catch {
    console.warn('请安装 vite-plugin-pwa')
  }
  
  return plugins
}

/**
 * 微前端项目预设
 */
export function microFrontendPreset(options: PresetOptions = {}): Plugin[] {
  const plugins: Plugin[] = []

  // 微前端插件需要手动安装
  console.warn('微前端预设需要手动安装依赖: npm install @originjs/vite-plugin-federation')
  
  return plugins
}

/**
 * 预设管理器
 */
export class PresetManager {
  private presets: Map<PresetType, (options?: PresetOptions) => Plugin[]> = new Map()
  
  constructor() {
    // 注册内置预设
    this.register('react', reactPreset)
    this.register('vue', vuePreset)
    this.register('vue2', vue2Preset)
    this.register('svelte', sveltePreset)
    this.register('library', libraryPreset)
    this.register('electron', electronPreset)
    this.register('ssr', ssrPreset)
    this.register('pwa', pwaPreset)
    this.register('micro-frontend', microFrontendPreset)
  }
  
  /**
   * 注册预设
   */
  register(name: PresetType, preset: (options?: PresetOptions) => Plugin[]): void {
    this.presets.set(name, preset)
  }
  
  /**
   * 获取预设
   */
  get(name: PresetType, options?: PresetOptions): Plugin[] {
    const preset = this.presets.get(name)
    if (!preset) {
      throw new Error(`预设 "${name}" 不存在`)
    }
    return preset(options)
  }
  
  /**
   * 获取所有预设名称
   */
  list(): PresetType[] {
    return Array.from(this.presets.keys())
  }
  
  /**
   * 组合多个预设
   */
  combine(...configs: Array<{ preset: PresetType; options?: PresetOptions }>): Plugin[] {
    const plugins: Plugin[] = []
    
    for (const config of configs) {
      plugins.push(...this.get(config.preset, config.options))
    }
    
    return plugins
  }
}

/**
 * 预设管理器实例
 */
export const presetManager = new PresetManager()

/**
 * 快速创建预设配置
 */
export function definePreset(type: PresetType, options?: PresetOptions): Plugin[] {
  return presetManager.get(type, options)
}
