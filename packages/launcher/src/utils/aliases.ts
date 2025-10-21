/**
 * 别名工具函数
 *
 * 提供别名配置相关的类型定义和工具函数
 * 支持按阶段配置别名，基本别名（@ -> src, ~ -> 项目根目录）由 launcher 自动配置
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
 * 创建带阶段配置的别名
 *
 * @param find - 别名匹配规则
 * @param replacement - 替换路径
 * @param stages - 生效阶段，默认只在 dev 阶段生效
 * @returns 别名配置对象
 */
export function createAlias(
  find: string | RegExp,
  replacement: string,
  stages: BuildStage[] = ['dev']
): AliasEntry {
  return {
    find,
    replacement,
    stages
  }
}

/**
 * 创建基本项目别名
 *
 * @param srcDir - src 目录路径，默认为 './src'
 * @param stages - 生效阶段，默认只在 dev 阶段生效
 * @returns 基本别名配置数组
 */
export function createBasicAliases(
  srcDir: string = './src',
  stages: BuildStage[] = ['dev']
): AliasEntry[] {
  return [
    createAlias('@', srcDir, stages),
    createAlias('~', './', stages)
  ]
}

/**
 * 创建开发时别名（只在 dev 阶段生效）
 *
 * @param find - 别名匹配规则
 * @param replacement - 替换路径
 * @returns 开发时别名配置对象
 */
export function createDevAlias(
  find: string | RegExp,
  replacement: string
): AliasEntry {
  return createAlias(find, replacement, ['dev'])
}

/**
 * 创建构建时别名（只在 build 阶段生效）
 *
 * @param find - 别名匹配规则
 * @param replacement - 替换路径
 * @returns 构建时别名配置对象
 */
export function createBuildAlias(
  find: string | RegExp,
  replacement: string
): AliasEntry {
  return createAlias(find, replacement, ['build'])
}

/**
 * 创建全阶段别名（在所有阶段都生效）
 *
 * @param find - 别名匹配规则
 * @param replacement - 替换路径
 * @returns 全阶段别名配置对象
 */
export function createUniversalAlias(
  find: string | RegExp,
  replacement: string
): AliasEntry {
  return createAlias(find, replacement, ['dev', 'build', 'preview'])
}
