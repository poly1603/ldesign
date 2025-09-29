/**
 * 路径别名管理器
 *
 * 提供简化的别名配置管理，保持 Vite 原有配置风格
 * 支持按阶段配置别名，默认内置 @ -> src 和 ~ -> 项目根目录别名
 *
 * @author LDesign Team
 * @since 1.0.0
 */

import path from 'path'

/**
 * 构建阶段类型
 */
export type BuildStage = 'dev' | 'build' | 'preview'

/**
 * 别名配置项 - 符合 Vite 标准，扩展支持阶段配置
 */
export interface AliasEntry {
  /** 别名匹配规则 */
  find: string | RegExp
  /** 替换路径 */
  replacement: string
  /** 生效阶段，默认只在 dev 阶段生效 */
  stages?: BuildStage[]
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
   * 包含 @ -> src 和 ~ -> 项目根目录别名
   *
   * @param stages - 生效阶段，默认只在 dev 阶段生效
   * @returns 内置别名配置数组
   */
  generateBuiltinAliases(stages: BuildStage[] = ['dev']): AliasEntry[] {
    const srcPath = path.resolve(this.cwd, 'src')
    const rootPath = path.resolve(this.cwd)

    return [
      {
        find: '@',
        replacement: srcPath,
        stages
      },
      {
        find: '~',
        replacement: rootPath,
        stages
      }
    ]
  }

  /**
   * 根据阶段过滤别名配置
   *
   * @param aliases - 原始别名配置数组
   * @param stage - 当前构建阶段
   * @returns 过滤后的别名配置数组
   */
  filterAliasesByStage(aliases: AliasEntry[], stage: BuildStage): AliasEntry[] {
    // 只在 debug 模式下输出详细调试信息
    const isDebug = process.env.NODE_ENV === 'development' && process.argv.includes('--debug')
    if (isDebug) {
      console.log('🔍 别名过滤调试:')
      console.log('  输入别名数量:', aliases.length)
      console.log('  当前阶段:', stage)
    }

    const filtered = aliases.filter(alias => {
      // 如果没有指定 stages，默认只在 dev 阶段生效
      const effectiveStages = alias.stages || ['dev']
      const shouldInclude = effectiveStages.includes(stage)

      if (isDebug && alias.find && typeof alias.find === 'string' && alias.find.startsWith('@ldesign')) {
        console.log(`  别名 ${alias.find}: stages=${JSON.stringify(effectiveStages)}, 包含${stage}=${shouldInclude}`)
      }

      return shouldInclude
    }).map(alias => {
      // 解析相对路径为绝对路径
      const resolvedReplacement = this.resolveAlias(alias.replacement)

      if (isDebug && alias.find && typeof alias.find === 'string' && alias.find.startsWith('@ldesign')) {
        console.log(`  解析路径 ${alias.find}: ${alias.replacement} -> ${resolvedReplacement}`)
      }

      return {
        // 返回标准的 Vite AliasEntry 格式（不包含 stages 字段）
        find: alias.find,
        replacement: resolvedReplacement
      }
    })

    if (isDebug) {
      console.log('  过滤后别名数量:', filtered.length)
      const ldesignFiltered = filtered.filter(a => a.find && typeof a.find === 'string' && a.find.startsWith('@ldesign'))
      console.log('  @ldesign别名数量:', ldesignFiltered.length)
    }

    return filtered
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

  /**
   * 解析别名路径（相对路径转绝对路径）
   *
   * @param aliasPath - 别名路径
   * @returns 解析后的绝对路径
   */
  private resolveAlias(aliasPath: string): string {
    // 如果已经是绝对路径，直接返回
    if (path.isAbsolute(aliasPath)) {
      return aliasPath
    }

    // 解析相对路径为绝对路径（基于当前工作目录）
    return path.resolve(this.cwd, aliasPath)
  }
}

/**
 * 创建别名管理器实例
 */
export function createAliasManager(cwd?: string): AliasManager {
  return new AliasManager(cwd)
}


