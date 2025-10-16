/**
 * @ldesign/typescript-utils-example
 * 
 * TypeScript 工具库示例
 * 展示如何使用 @ldesign/builder 打包 TypeScript 工具库
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

// 导出数学工具模块
export * as math from './math'
export * from './math'

// 导出字符串工具模块
export * as string from './string'
export * from './string'

// 导出日期工具模块
export * as date from './date'
export * from './date'

/**
 * 工具库版本信息
 */
export const VERSION = '1.0.0'

/**
 * 工具库信息
 */
export const LIBRARY_INFO = {
  name: '@ldesign/typescript-utils-example',
  version: VERSION,
  description: 'TypeScript 工具库示例 - 展示如何使用 @ldesign/builder 打包 TypeScript 工具库',
  author: 'LDesign Team',
  license: 'MIT',
  repository: 'https://github.com/ldesign/ldesign',
  homepage: 'https://ldesign.dev'
} as const

/**
 * 获取库信息
 * @returns 库信息对象
 * @example
 * ```typescript
 * import { getLibraryInfo } from '@ldesign/typescript-utils-example'
 * 
 * const info = getLibraryInfo()
 *  // '@ldesign/typescript-utils-example'
 * ```
 */
export function getLibraryInfo() {
  return LIBRARY_INFO
}

/**
 * 打印库信息到控制台
 * @example
 * ```typescript
 * import { printLibraryInfo } from '@ldesign/typescript-utils-example'
 * 
 * printLibraryInfo()
 * // 输出库的详细信息
 * ```
 */
export function printLibraryInfo(): void {
  } │
│ Version:     ${LIBRARY_INFO.version.padEnd(43)} │
│ Description: ${LIBRARY_INFO.description.slice(0, 43).padEnd(43)} │
│ Author:      ${LIBRARY_INFO.author.padEnd(43)} │
│ License:     ${LIBRARY_INFO.license.padEnd(43)} │
╰─────────────────────────────────────────────────────────────╯
  `)
}

// 导入所有模块用于默认导出
import * as mathModule from './math'
import * as stringModule from './string'
import * as dateModule from './date'

/**
 * 默认导出：包含所有工具模块的对象
 */
export default {
  // 模块
  math: mathModule,
  string: stringModule,
  date: dateModule,

  // 信息
  VERSION,
  LIBRARY_INFO,
  getLibraryInfo,
  printLibraryInfo
}
