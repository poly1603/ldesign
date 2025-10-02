/**
 * 版本比较工具
 */

export type VersionStatus = 'identical' | 'patch' | 'minor' | 'major' | 'unknown'

export interface VersionComparison {
  status: VersionStatus
  color: string
  icon: string
  message: string
}

/**
 * 解析语义化版本号
 */
export function parseVersion(version: string): { major: number; minor: number; patch: number } | null {
  // 移除版本前缀如 ^, ~, >=, 等
  const cleanVersion = version.replace(/^[\^~>=<]+/, '').trim()
  
  // 匹配 x.y.z 格式
  const match = cleanVersion.match(/^(\d+)\.(\d+)\.(\d+)/)
  
  if (!match) {
    return null
  }
  
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10)
  }
}

/**
 * 比较两个版本
 * @param currentVersion 当前版本
 * @param latestVersion 最新版本
 * @returns 版本比较结果
 */
export function compareVersions(currentVersion: string, latestVersion: string): VersionComparison {
  const current = parseVersion(currentVersion)
  const latest = parseVersion(latestVersion)
  
  // 如果无法解析版本，返回未知状态
  if (!current || !latest) {
    return {
      status: 'unknown',
      color: '#666',
      icon: '❓',
      message: '版本格式未知'
    }
  }
  
  // 完全一致 - 绿色
  if (current.major === latest.major && 
      current.minor === latest.minor && 
      current.patch === latest.patch) {
    return {
      status: 'identical',
      color: '#52c41a', // 绿色
      icon: '✓',
      message: '已是最新版本'
    }
  }
  
  // 主版本和次版本一致，补丁版本不同 - 黄色
  if (current.major === latest.major && current.minor === latest.minor) {
    return {
      status: 'patch',
      color: '#faad14', // 黄色
      icon: '↑',
      message: `可升级补丁版本 ${currentVersion} → ${latestVersion}`
    }
  }
  
  // 主版本一致，次版本不同 - 橙色
  if (current.major === latest.major) {
    return {
      status: 'minor',
      color: '#fa8c16', // 橙色
      icon: '⬆',
      message: `可升级次版本 ${currentVersion} → ${latestVersion}`
    }
  }
  
  // 主版本不同 - 红色
  return {
    status: 'major',
    color: '#f5222d', // 红色
    icon: '⚠',
    message: `主版本更新 ${currentVersion} → ${latestVersion}`
  }
}

/**
 * 格式化版本显示
 */
export function formatVersionDisplay(currentVersion: string, latestVersion?: string): {
  display: string
  comparison?: VersionComparison
} {
  if (!latestVersion) {
    return {
      display: currentVersion
    }
  }
  
  const comparison = compareVersions(currentVersion, latestVersion)
  
  return {
    display: `${currentVersion} → ${latestVersion}`,
    comparison
  }
}
