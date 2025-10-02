/**
 * 依赖健康度分析工具 (服务端版本)
 */

export interface DependencyInfo {
  name: string
  version: string
  latestVersion?: string
  isDev: boolean
}

export interface HealthScore {
  score: number           // 总分 0-100
  grade: 'S' | 'A' | 'B' | 'C' | 'D'  // 等级
  color: string           // 颜色
  label: string           // 标签
}

export interface HealthMetrics {
  total: number           // 总依赖数
  upToDate: number       // 最新的
  patchBehind: number    // 补丁版本落后
  minorBehind: number    // 次版本落后
  majorBehind: number    // 主版本落后
  unknown: number        // 未知状态
}

export interface HealthSuggestion {
  type: 'success' | 'info' | 'warning' | 'danger'
  icon: string
  title: string
  description: string
  action?: string
  priority: number  // 优先级 1-5，数字越大越重要
}

export interface DependencyHealth {
  score: HealthScore
  metrics: HealthMetrics
  suggestions: HealthSuggestion[]
  details: {
    production: HealthMetrics
    development: HealthMetrics
  }
}

/**
 * 比较版本（简化版）
 */
function compareVersions(current: string, latest: string): 'identical' | 'patch' | 'minor' | 'major' | 'unknown' {
  try {
    // 清理版本号
    const cleanCurrent = current.replace(/^[^0-9]*/, '').split('-')[0]
    const cleanLatest = latest.replace(/^[^0-9]*/, '').split('-')[0]
    
    const currentParts = cleanCurrent.split('.').map(Number)
    const latestParts = cleanLatest.split('.').map(Number)
    
    // 补齐版本号长度
    while (currentParts.length < 3) currentParts.push(0)
    while (latestParts.length < 3) latestParts.push(0)
    
    const [cMajor, cMinor, cPatch] = currentParts
    const [lMajor, lMinor, lPatch] = latestParts
    
    if (cMajor === lMajor && cMinor === lMinor && cPatch === lPatch) {
      return 'identical'
    }
    
    if (cMajor < lMajor) {
      return 'major'
    }
    
    if (cMinor < lMinor) {
      return 'minor'
    }
    
    if (cPatch < lPatch) {
      return 'patch'
    }
    
    return 'unknown'
  } catch {
    return 'unknown'
  }
}

/**
 * 计算健康度评分
 */
export function calculateHealthScore(metrics: HealthMetrics): HealthScore {
  const { total, upToDate, patchBehind, minorBehind, majorBehind } = metrics
  
  if (total === 0) {
    return {
      score: 100,
      grade: 'S',
      color: '#52c41a',
      label: '暂无依赖'
    }
  }
  
  // 评分规则：
  // - 最新依赖：满分
  // - 补丁版本落后：扣5分
  // - 次版本落后：扣15分
  // - 主版本落后：扣30分
  
  let score = 100
  score -= patchBehind * 5
  score -= minorBehind * 15
  score -= majorBehind * 30
  
  // 确保分数在0-100之间
  score = Math.max(0, Math.min(100, score))
  
  // 根据分数确定等级
  let grade: 'S' | 'A' | 'B' | 'C' | 'D'
  let color: string
  let label: string
  
  if (score >= 95) {
    grade = 'S'
    color = '#52c41a'  // 绿色
    label = '健康'
  } else if (score >= 85) {
    grade = 'A'
    color = '#73d13d'  // 浅绿
    label = '良好'
  } else if (score >= 70) {
    grade = 'B'
    color = '#faad14'  // 黄色
    label = '一般'
  } else if (score >= 50) {
    grade = 'C'
    color = '#fa8c16'  // 橙色
    label = '较差'
  } else {
    grade = 'D'
    color = '#f5222d'  // 红色
    label = '危险'
  }
  
  return { score, grade, color, label }
}

/**
 * 分析依赖健康度
 */
export function analyzeDependencyHealth(dependencies: DependencyInfo[]): DependencyHealth {
  // 分离生产和开发依赖
  const prodDeps = dependencies.filter(d => !d.isDev)
  const devDeps = dependencies.filter(d => d.isDev)
  
  // 计算指标
  const totalMetrics = calculateMetrics(dependencies)
  const prodMetrics = calculateMetrics(prodDeps)
  const devMetrics = calculateMetrics(devDeps)
  
  // 计算总评分
  const score = calculateHealthScore(totalMetrics)
  
  // 生成建议
  const suggestions = generateSuggestions(totalMetrics, prodMetrics, devMetrics)
  
  return {
    score,
    metrics: totalMetrics,
    suggestions,
    details: {
      production: prodMetrics,
      development: devMetrics
    }
  }
}

/**
 * 计算指标
 */
function calculateMetrics(dependencies: DependencyInfo[]): HealthMetrics {
  const metrics: HealthMetrics = {
    total: dependencies.length,
    upToDate: 0,
    patchBehind: 0,
    minorBehind: 0,
    majorBehind: 0,
    unknown: 0
  }
  
  dependencies.forEach(dep => {
    if (!dep.latestVersion) {
      metrics.unknown++
      return
    }
    
    const comparison = compareVersions(dep.version, dep.latestVersion)
    
    switch (comparison) {
      case 'identical':
        metrics.upToDate++
        break
      case 'patch':
        metrics.patchBehind++
        break
      case 'minor':
        metrics.minorBehind++
        break
      case 'major':
        metrics.majorBehind++
        break
      default:
        metrics.unknown++
    }
  })
  
  return metrics
}

/**
 * 生成健康建议
 */
function generateSuggestions(
  total: HealthMetrics,
  prod: HealthMetrics,
  dev: HealthMetrics
): HealthSuggestion[] {
  const suggestions: HealthSuggestion[] = []
  
  // 1. 主版本落后 - 最高优先级
  if (total.majorBehind > 0) {
    suggestions.push({
      type: 'danger',
      icon: '⚠️',
      title: `发现 ${total.majorBehind} 个主版本落后的依赖`,
      description: '主版本更新可能包含破坏性更改，建议谨慎升级并充分测试。建议查看更新日志和迁移指南。',
      action: prod.majorBehind > 0 ? '优先处理生产依赖' : '处理开发依赖',
      priority: 5
    })
  }
  
  // 2. 次版本落后
  if (total.minorBehind > 0) {
    const ratio = (total.minorBehind / total.total * 100).toFixed(0)
    suggestions.push({
      type: 'warning',
      icon: '🔄',
      title: `${total.minorBehind} 个依赖有新功能版本 (${ratio}%)`,
      description: '次版本更新通常向下兼容，包含新功能和性能优化。建议尽快升级以获得更好的体验。',
      action: '建议批量升级',
      priority: 4
    })
  }
  
  // 3. 补丁版本落后
  if (total.patchBehind > 0) {
    suggestions.push({
      type: 'info',
      icon: '🔧',
      title: `${total.patchBehind} 个依赖有补丁更新`,
      description: '补丁更新主要包含bug修复和安全补丁，风险较低。建议定期升级以保持稳定性。',
      action: '定期维护',
      priority: 3
    })
  }
  
  // 4. 全部最新 - 表扬
  if (total.upToDate === total.total && total.total > 0) {
    suggestions.push({
      type: 'success',
      icon: '🎉',
      title: '所有依赖都是最新版本！',
      description: '您的项目依赖管理做得很好，继续保持定期检查更新的好习惯。',
      priority: 1
    })
  }
  
  // 5. 生产依赖特别提醒
  if (prod.majorBehind > 0 || prod.minorBehind > 3) {
    suggestions.push({
      type: 'warning',
      icon: '🚨',
      title: '生产依赖需要关注',
      description: `生产依赖中有 ${prod.majorBehind} 个主版本落后，${prod.minorBehind} 个次版本落后。这可能影响应用的性能、安全性和功能。`,
      action: '优先处理',
      priority: 5
    })
  }
  
  // 6. 健康度良好
  const score = calculateHealthScore(total)
  if (score.score >= 90 && total.total > 0) {
    suggestions.push({
      type: 'success',
      icon: '✅',
      title: '依赖健康状况良好',
      description: `您的项目获得了 ${score.grade} 级评价（${score.score}分）。继续保持良好的依赖管理习惯！`,
      priority: 1
    })
  }
  
  // 7. 需要改进
  if (score.score < 60 && total.total > 0) {
    suggestions.push({
      type: 'danger',
      icon: '⚡',
      title: '依赖管理需要改进',
      description: `当前健康度评分为 ${score.score} 分（${score.grade} 级）。建议制定依赖升级计划，逐步改善项目依赖状况。`,
      action: '制定升级计划',
      priority: 5
    })
  }
  
  // 8. 未知状态依赖
  if (total.unknown > 0) {
    suggestions.push({
      type: 'info',
      icon: '❓',
      title: `${total.unknown} 个依赖状态未知`,
      description: '可能是网络问题或包已下架。建议点击"检查更新"重新获取最新版本信息。',
      action: '检查更新',
      priority: 2
    })
  }
  
  // 9. 依赖总数建议
  if (total.total > 50) {
    suggestions.push({
      type: 'info',
      icon: '📦',
      title: '依赖数量较多',
      description: `项目共有 ${total.total} 个依赖（生产 ${prod.total}，开发 ${dev.total}）。考虑定期审查是否所有依赖都是必需的。`,
      priority: 2
    })
  }
  
  // 10. 开发依赖提醒
  if (dev.total > prod.total * 3) {
    suggestions.push({
      type: 'info',
      icon: '🛠️',
      title: '开发依赖较多',
      description: `开发依赖（${dev.total}）是生产依赖（${prod.total}）的3倍以上。确保它们都是必需的工具。`,
      priority: 2
    })
  }
  
  // 按优先级排序
  return suggestions.sort((a, b) => b.priority - a.priority)
}
