/**
 * 路径别名管理器
 * 
 * 负责管理和生成项目的路径别名配置
 * 支持预设别名、自定义别名和启用/禁用控制
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { AliasOptions } from '../types'
import path from 'path'

/**
 * 别名配置项
 */
export interface AliasEntry {
  find: string | RegExp
  replacement: string
}

/**
 * 路径别名管理器
 */
export class AliasManager {
  private cwd: string
  private options: AliasOptions
  private currentStage: 'dev' | 'build' | 'preview' = 'dev'

  constructor(cwd: string = process.cwd(), options: AliasOptions = {}) {
    this.cwd = cwd
    this.options = {
      enabled: true,
      stages: 'all',
      ldesign: true,
      polyfills: true,
      presets: ['ldesign', 'polyfills', 'common'],
      custom: [],
      ...options
    }
  }

  /**
   * 设置当前阶段
   */
  setStage(stage: 'dev' | 'build' | 'preview') {
    this.currentStage = stage
  }

  /**
   * 检查当前阶段是否启用别名
   */
  private isStageEnabled(): boolean {
    if (!this.options.enabled) {
      return false
    }

    const stages = this.options.stages
    if (stages === 'all') {
      return true
    }

    if (Array.isArray(stages)) {
      return stages.includes(this.currentStage)
    }

    return true
  }

  /**
   * 生成别名配置
   */
  generateAliases(): AliasEntry[] {
    if (!this.isStageEnabled()) {
      return []
    }

    const aliases: AliasEntry[] = []

    // 添加预设别名
    if (this.options.presets) {
      for (const preset of this.options.presets) {
        aliases.push(...this.getPresetAliases(preset))
      }
    }

    // 添加自定义别名
    if (this.options.custom) {
      aliases.push(...this.options.custom)
    }

    return aliases
  }

  /**
   * 获取预设别名
   */
  private getPresetAliases(preset: string): AliasEntry[] {
    switch (preset) {
      case 'ldesign':
        return this.getLDesignAliases()
      case 'polyfills':
        return this.getPolyfillAliases()
      case 'common':
        return this.getCommonAliases()
      default:
        return []
    }
  }

  /**
   * 获取 LDesign 包别名
   */
  private getLDesignAliases(): AliasEntry[] {
    if (!this.options.ldesign) {
      return []
    }

    const packagesDir = this.resolvePackagesDir()
    if (!packagesDir) {
      return []
    }

    return [
      // LDesign Vue 子模块别名
      { find: '@ldesign/api/vue', replacement: path.join(packagesDir, 'api/src/vue') },
      { find: '@ldesign/crypto/vue', replacement: path.join(packagesDir, 'crypto/src/vue') },
      { find: '@ldesign/http/vue', replacement: path.join(packagesDir, 'http/src/vue') },
      { find: '@ldesign/size/vue', replacement: path.join(packagesDir, 'size/src/vue') },
      { find: '@ldesign/i18n/vue', replacement: path.join(packagesDir, 'i18n/src/vue') },
      { find: '@ldesign/router/vue', replacement: path.join(packagesDir, 'router/src/vue') },
      { find: '@ldesign/device/vue', replacement: path.join(packagesDir, 'device/src/vue') },
      { find: '@ldesign/color/vue', replacement: path.join(packagesDir, 'color/src/vue') },
      { find: '@ldesign/cache/vue', replacement: path.join(packagesDir, 'cache/src/vue') },
      { find: '@ldesign/engine/vue', replacement: path.join(packagesDir, 'engine/src/vue') },
      { find: '@ldesign/chart/vue', replacement: path.join(packagesDir, 'chart/src/vue') },
      { find: '@ldesign/store/vue', replacement: path.join(packagesDir, 'store/src/vue') },

      // LDesign 主模块别名
      { find: /^@ldesign\/http$/, replacement: path.join(packagesDir, 'http/src/index.ts') },
      { find: '@ldesign/color', replacement: path.join(packagesDir, 'color/src') },
      { find: '@ldesign/cache', replacement: path.join(packagesDir, 'cache/src') }
    ]
  }

  /**
   * 获取 polyfill 别名
   */
  private getPolyfillAliases(): AliasEntry[] {
    if (!this.options.polyfills) {
      return []
    }

    return [
      // Node.js 模块浏览器 polyfill
      { find: /^crypto$/, replacement: 'crypto-js' },
      { find: /^node:crypto$/, replacement: 'crypto-js' },
      { find: /^node:process$/, replacement: 'process/browser' }
    ]
  }

  /**
   * 获取通用别名
   */
  private getCommonAliases(): AliasEntry[] {
    return [
      // 项目根目录别名
      { find: '@', replacement: path.resolve(this.cwd, 'src') }
    ]
  }

  /**
   * 解析 packages 目录路径
   */
  private resolvePackagesDir(): string | null {
    // 尝试从当前目录向上查找 packages 目录
    let currentDir = this.cwd
    const maxDepth = 5 // 最多向上查找 5 层

    for (let i = 0; i < maxDepth; i++) {
      const packagesPath = path.join(currentDir, 'packages')

      try {
        const fs = require('fs')
        if (fs.existsSync(packagesPath) && fs.statSync(packagesPath).isDirectory()) {
          return packagesPath
        }
      } catch {
        // 忽略错误，继续查找
      }

      const parentDir = path.dirname(currentDir)
      if (parentDir === currentDir) {
        // 已经到达根目录
        break
      }
      currentDir = parentDir
    }

    return null
  }

  /**
   * 更新配置
   */
  updateOptions(options: Partial<AliasOptions>) {
    this.options = { ...this.options, ...options }
  }

  /**
   * 启用别名
   */
  enable() {
    this.options.enabled = true
  }

  /**
   * 禁用别名
   */
  disable() {
    this.options.enabled = false
  }

  /**
   * 启用 LDesign 别名
   */
  enableLDesign() {
    this.options.ldesign = true
  }

  /**
   * 禁用 LDesign 别名
   */
  disableLDesign() {
    this.options.ldesign = false
  }

  /**
   * 启用 polyfill 别名
   */
  enablePolyfills() {
    this.options.polyfills = true
  }

  /**
   * 禁用 polyfill 别名
   */
  disablePolyfills() {
    this.options.polyfills = false
  }

  /**
   * 添加自定义别名
   */
  addCustomAlias(alias: AliasEntry) {
    if (!this.options.custom) {
      this.options.custom = []
    }
    this.options.custom.push(alias)
  }

  /**
   * 移除自定义别名
   */
  removeCustomAlias(find: string | RegExp) {
    if (!this.options.custom) {
      return
    }
    this.options.custom = this.options.custom.filter(alias => alias.find !== find)
  }

  /**
   * 清空自定义别名
   */
  clearCustomAliases() {
    this.options.custom = []
  }

  /**
   * 获取当前配置
   */
  getOptions(): AliasOptions {
    return { ...this.options }
  }

  /**
   * 检查别名是否启用
   */
  isEnabled(): boolean {
    return this.isStageEnabled()
  }

  /**
   * 获取当前阶段
   */
  getCurrentStage(): 'dev' | 'build' | 'preview' {
    return this.currentStage
  }

  /**
   * 检查 LDesign 别名是否启用
   */
  isLDesignEnabled(): boolean {
    return this.options.ldesign === true
  }

  /**
   * 检查 polyfill 别名是否启用
   */
  isPolyfillsEnabled(): boolean {
    return this.options.polyfills === true
  }
}

/**
 * 创建别名管理器实例
 */
export function createAliasManager(cwd?: string, options?: AliasOptions): AliasManager {
  return new AliasManager(cwd, options)
}
