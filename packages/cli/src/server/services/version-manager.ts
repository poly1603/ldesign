/**
 * 版本管理服务
 * 用于管理项目 package.json 的版本号
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { logger } from '../../utils/logger.js'

const versionLogger = logger.withPrefix('version-manager')

export type VersionBumpType = 'none' | 'patch' | 'minor' | 'major'

export interface PackageInfo {
  name: string
  version: string
  description?: string
  type?: string
  private?: boolean
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  scripts?: Record<string, string>
}

/**
 * 读取项目 package.json
 */
export function readPackageJson(projectPath: string): PackageInfo | null {
  try {
    const packagePath = join(projectPath, 'package.json')
    
    if (!existsSync(packagePath)) {
      versionLogger.error(`package.json 不存在: ${packagePath}`)
      return null
    }

    const content = readFileSync(packagePath, 'utf-8')
    const packageJson = JSON.parse(content)
    
    return packageJson
  } catch (error) {
    versionLogger.error('读取 package.json 失败:', error)
    return null
  }
}

/**
 * 写入项目 package.json
 */
export function writePackageJson(projectPath: string, packageJson: PackageInfo): boolean {
  try {
    const packagePath = join(projectPath, 'package.json')
    const content = JSON.stringify(packageJson, null, 2) + '\n'
    
    writeFileSync(packagePath, content, 'utf-8')
    versionLogger.info(`package.json 已更新: ${packagePath}`)
    
    return true
  } catch (error) {
    versionLogger.error('写入 package.json 失败:', error)
    return false
  }
}

/**
 * 解析版本号
 */
export function parseVersion(version: string): { major: number; minor: number; patch: number } | null {
  try {
    // 移除 v 前缀和可能的其他前缀
    const cleanVersion = version.replace(/^v?/, '')
    
    // 分割版本号
    const parts = cleanVersion.split('.')
    
    if (parts.length < 3) {
      return null
    }
    
    // 提取数字部分（处理 1.0.0-beta 这样的情况）
    const major = parseInt(parts[0])
    const minor = parseInt(parts[1])
    const patch = parseInt(parts[2].split('-')[0])
    
    if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
      return null
    }
    
    return { major, minor, patch }
  } catch (error) {
    versionLogger.error('解析版本号失败:', error)
    return null
  }
}

/**
 * 格式化版本号
 */
export function formatVersion(major: number, minor: number, patch: number): string {
  return `${major}.${minor}.${patch}`
}

/**
 * 升级版本号
 */
export function bumpVersion(currentVersion: string, bumpType: VersionBumpType): string | null {
  if (bumpType === 'none') {
    return currentVersion
  }

  const parsed = parseVersion(currentVersion)
  
  if (!parsed) {
    versionLogger.error(`无法解析版本号: ${currentVersion}`)
    return null
  }

  let { major, minor, patch } = parsed

  switch (bumpType) {
    case 'major':
      major += 1
      minor = 0
      patch = 0
      break
    case 'minor':
      minor += 1
      patch = 0
      break
    case 'patch':
      patch += 1
      break
    default:
      versionLogger.error(`不支持的版本升级类型: ${bumpType}`)
      return null
  }

  const newVersion = formatVersion(major, minor, patch)
  versionLogger.info(`版本升级: ${currentVersion} -> ${newVersion} (${bumpType})`)
  
  return newVersion
}

/**
 * 更新项目版本号
 */
export function updateProjectVersion(
  projectPath: string,
  bumpType: VersionBumpType
): { success: boolean; oldVersion?: string; newVersion?: string; message: string } {
  try {
    // 读取 package.json
    const packageJson = readPackageJson(projectPath)
    
    if (!packageJson) {
      return {
        success: false,
        message: '无法读取 package.json'
      }
    }

    const oldVersion = packageJson.version
    
    if (!oldVersion) {
      return {
        success: false,
        message: 'package.json 中没有版本号'
      }
    }

    // 如果不升级版本，直接返回成功
    if (bumpType === 'none') {
      return {
        success: true,
        oldVersion,
        newVersion: oldVersion,
        message: '保持当前版本不变'
      }
    }

    // 计算新版本号
    const newVersion = bumpVersion(oldVersion, bumpType)
    
    if (!newVersion) {
      return {
        success: false,
        oldVersion,
        message: '计算新版本号失败'
      }
    }

    // 更新版本号
    packageJson.version = newVersion

    // 写入文件
    const writeSuccess = writePackageJson(projectPath, packageJson)
    
    if (!writeSuccess) {
      return {
        success: false,
        oldVersion,
        newVersion,
        message: '写入 package.json 失败'
      }
    }

    return {
      success: true,
      oldVersion,
      newVersion,
      message: `版本已更新: ${oldVersion} -> ${newVersion}`
    }
  } catch (error) {
    versionLogger.error('更新版本号失败:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '更新版本号失败'
    }
  }
}

/**
 * 获取包信息
 */
export function getPackageInfo(projectPath: string): {
  success: boolean
  data?: PackageInfo
  message?: string
} {
  try {
    const packageJson = readPackageJson(projectPath)
    
    if (!packageJson) {
      return {
        success: false,
        message: '无法读取 package.json'
      }
    }

    return {
      success: true,
      data: packageJson
    }
  } catch (error) {
    versionLogger.error('获取包信息失败:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '获取包信息失败'
    }
  }
}

/**
 * 检查是否为库项目
 */
export function isLibraryProject(projectPath: string): boolean {
  try {
    const packageJson = readPackageJson(projectPath)
    
    if (!packageJson) {
      return false
    }

    // 检查是否为私有包（通常应用项目会设置为 true）
    if (packageJson.private === true) {
      return false
    }

    // 检查是否有 main、module、exports 等库相关字段
    const hasLibraryFields = !!(
      packageJson['main' as keyof PackageInfo] ||
      packageJson['module' as keyof PackageInfo] ||
      packageJson['exports' as keyof PackageInfo] ||
      packageJson['types' as keyof PackageInfo] ||
      packageJson['typings' as keyof PackageInfo]
    )

    return hasLibraryFields
  } catch (error) {
    versionLogger.error('检查库项目失败:', error)
    return false
  }
}

/**
 * 预览版本升级（不实际修改文件）
 */
export function previewVersionBump(
  currentVersion: string,
  bumpType: VersionBumpType
): {
  currentVersion: string
  newVersion: string
  bumpType: VersionBumpType
  description: string
} | null {
  if (bumpType === 'none') {
    return {
      currentVersion,
      newVersion: currentVersion,
      bumpType,
      description: '保持当前版本不变'
    }
  }

  const newVersion = bumpVersion(currentVersion, bumpType)
  
  if (!newVersion) {
    return null
  }

  const descriptions: Record<VersionBumpType, string> = {
    none: '保持当前版本不变',
    patch: '修复 bug 或小改动（x.x.+1）',
    minor: '新增功能但向后兼容（x.+1.0）',
    major: '重大更新或不兼容改动（+1.0.0）'
  }

  return {
    currentVersion,
    newVersion,
    bumpType,
    description: descriptions[bumpType]
  }
}