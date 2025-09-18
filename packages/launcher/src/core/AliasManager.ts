/**
 * 路径别名管理器
 *
 * 提供简化的别名配置管理，保持 Vite 原有配置风格
 * 只内置基本的 @ -> src 别名，其他别名由用户在配置中定义
 *
 * @author LDesign Team
 * @since 1.0.0
 */

import path from 'path'

/**
 * 别名配置项 - 符合 Vite 标准
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

  constructor(cwd: string = process.cwd()) {
    this.cwd = cwd
  }

  /**
   * 生成内置的基本别名配置
   * 只包含最基本的 @ -> src 别名
   */
  generateBuiltinAliases(): AliasEntry[] {
    const srcPath = path.resolve(this.cwd, 'src')

    return [
      {
        find: '@',
        replacement: srcPath
      }
    ]
  }

  /**
   * 获取工作目录
   */
  getCwd(): string {
    return this.cwd
  }

  /**
   * 设置工作目录
   */
  setCwd(cwd: string) {
    this.cwd = cwd
  }
}

/**
 * 创建别名管理器实例
 */
export function createAliasManager(cwd?: string): AliasManager {
  return new AliasManager(cwd)
}


