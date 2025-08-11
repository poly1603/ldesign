/**
 * Rollup 配置模板
 *
 * 这个文件提供了几种常见的 Rollup 配置模板，
 * packages 中的子包可以直接使用这些模板，保持配置简洁。
 */

import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRollupConfig } from './rollup.config.base.js'

/**
 * 获取当前包目录
 */
function getPackageDir(importMetaUrl) {
  return dirname(fileURLToPath(importMetaUrl))
}

/**
 * 基础包配置（ES + CJS）
 * 适用于大多数工具包和库
 */
export function createBasicConfig(importMetaUrl, options = {}) {
  return createRollupConfig({
    packageDir: getPackageDir(importMetaUrl),
    formats: ['es', 'cjs'],
    ...options,
  })
}

/**
 * Vue 包配置（ES + CJS，无 UMD）
 * 适用于 Vue 组件库，避免 UMD 构建的代码分割问题
 */
export function createVueConfig(importMetaUrl, options = {}) {
  return createRollupConfig({
    packageDir: getPackageDir(importMetaUrl),
    vue: true,
    external: ['vue'],
    formats: ['es', 'cjs'],
    ...options,
  })
}

/**
 * 完整包配置（ES + CJS + UMD）
 * 适用于需要在浏览器中直接使用的包
 */
export function createFullConfig(importMetaUrl, options = {}) {
  return createRollupConfig({
    packageDir: getPackageDir(importMetaUrl),
    formats: ['es', 'cjs', 'umd'],
    ...options,
  })
}

/**
 * 工具包配置（仅 ES）
 * 适用于现代项目的工具包，只需要 ES 模块
 */
export function createModernConfig(importMetaUrl, options = {}) {
  return createRollupConfig({
    packageDir: getPackageDir(importMetaUrl),
    formats: ['es'],
    ...options,
  })
}

/**
 * Node.js 包配置（仅 CJS）
 * 适用于 Node.js 专用的包
 */
export function createNodeConfig(importMetaUrl, options = {}) {
  return createRollupConfig({
    packageDir: getPackageDir(importMetaUrl),
    formats: ['cjs'],
    ...options,
  })
}

/**
 * 自定义配置
 * 提供完全的灵活性
 */
export function createCustomConfig(importMetaUrl, options = {}) {
  return createRollupConfig({
    packageDir: getPackageDir(importMetaUrl),
    ...options,
  })
}

// 导出基础配置函数，保持向后兼容
export { createRollupConfig }
