import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * 获取包的根目录路径
 */
export function getPackageRoot(importMetaUrl: string): string {
  return resolve(fileURLToPath(importMetaUrl), '..')
}

/**
 * 创建开发环境的别名配置
 * 指向源码目录，用于开发时的热更新和调试
 */
export function createDevAliases(packageRoot: string) {
  return {
    '@ldesign/engine': resolve(packageRoot, '../engine/src'),
    '@ldesign/color': resolve(packageRoot, '../color/src'),
    '@ldesign/crypto': resolve(packageRoot, '../crypto/src'),
    '@ldesign/device': resolve(packageRoot, '../device/src'),
    '@ldesign/form': resolve(packageRoot, '../form/src'),
    '@ldesign/http': resolve(packageRoot, '../http/src'),
    '@ldesign/i18n': resolve(packageRoot, '../i18n/src'),
    '@ldesign/router': resolve(packageRoot, '../router/src'),
    '@ldesign/store': resolve(packageRoot, '../store/src'),
    '@ldesign/template': resolve(packageRoot, '../template/src'),
    '@ldesign/watermark': resolve(packageRoot, '../watermark/src'),
  }
}

/**
 * 创建生产环境的别名配置
 * 指向构建后的ES模块，用于生产环境
 */
export function createProdAliases(packageRoot: string) {
  return {
    '@ldesign/engine': resolve(packageRoot, '../engine/es/index.js'),
    '@ldesign/color': resolve(packageRoot, '../color/es/index.js'),
    '@ldesign/crypto': resolve(packageRoot, '../crypto/es/index.js'),
    '@ldesign/device': resolve(packageRoot, '../device/es/index.js'),
    '@ldesign/form': resolve(packageRoot, '../form/es/index.js'),
    '@ldesign/http': resolve(packageRoot, '../http/es/index.js'),
    '@ldesign/i18n': resolve(packageRoot, '../i18n/es/index.js'),
    '@ldesign/router': resolve(packageRoot, '../router/es/index.js'),
    '@ldesign/store': resolve(packageRoot, '../store/es/index.js'),
    '@ldesign/template': resolve(packageRoot, '../template/es/index.js'),
    '@ldesign/watermark': resolve(packageRoot, '../watermark/es/index.js'),
    // Vue子模块
    '@ldesign/template/vue': resolve(packageRoot, '../template/es/vue/index.js'),
    '@ldesign/i18n/vue': resolve(packageRoot, '../i18n/es/vue/index.js'),
    '@ldesign/crypto/vue': resolve(packageRoot, '../crypto/es/vue/index.js'),
  }
}

/**
 * 根据环境自动选择别名配置
 */
export function createAliases(packageRoot: string, isDev = process.env.NODE_ENV === 'development') {
  return isDev ? createDevAliases(packageRoot) : createProdAliases(packageRoot)
}
