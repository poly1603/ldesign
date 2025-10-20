/**
 * 错误分析器模块
 * 
 * 提供错误模式分析和建议生成功能
 */

import type { HttpError } from '../types'

/**
 * 错误模式类型
 */
export type ErrorPatternType = 
  | 'network_errors'
  | 'timeout_errors'
  | 'auth_errors'
  | 'server_errors'
  | 'client_errors'
  | 'rate_limit_errors'
  | 'permission_errors'

/**
 * 错误模式分析结果
 */
export interface ErrorPattern {
  type: string
  count: number
  percentage: number
  description: string
}

/**
 * 错误分析结果
 */
export interface ErrorAnalysisResult {
  patterns: ErrorPattern[]
  recommendations: string[]
  summary: {
    totalErrors: number
    uniqueEndpoints: number
    timeRange: { start: number; end: number }
    mostFrequentError?: { type: string; count: number }
  }
}

/**
 * 错误分析器
 */
export class ErrorAnalyzer {
  private static readonly patternDescriptions: Record<string, string> = {
    network_errors: '网络连接问题，可能是网络不稳定或服务器不可达',
    timeout_errors: '请求超时，可能是网络延迟高或服务器响应慢',
    auth_errors: '认证失败，可能是令牌过期或权限不足',
    server_errors: '服务器内部错误，可能是服务器故障或过载',
    client_errors: '客户端请求错误，可能是参数错误或请求格式不正确',
    rate_limit_errors: '请求频率超限，需要降低请求频率',
    permission_errors: '权限不足，需要检查用户权限配置',
  }

  /**
   * 分析错误模式
   */
  static analyzeErrorPatterns(errors: HttpError[]): ErrorAnalysisResult {
    if (errors.length === 0) {
      return {
        patterns: [],
        recommendations: [],
        summary: {
          totalErrors: 0,
          uniqueEndpoints: 0,
          timeRange: { start: Date.now(), end: Date.now() },
        },
      }
    }

    const patterns: Record<string, number> = {}
    const endpoints = new Set<string>()
    let minTime = Number.MAX_SAFE_INTEGER
    let maxTime = 0
    const total = errors.length

    // 分析错误模式
    errors.forEach((error) => {
      // 记录端点
      if (error.config?.url) {
        endpoints.add(error.config.url)
      }

      // 记录时间范围
      const timestamp = (error as any).timestamp || Date.now()
      minTime = Math.min(minTime, timestamp)
      maxTime = Math.max(maxTime, timestamp)

      // 分类错误
      if (error.isNetworkError) {
        patterns.network_errors = (patterns.network_errors || 0) + 1
      }

      if (error.isTimeoutError) {
        patterns.timeout_errors = (patterns.timeout_errors || 0) + 1
      }

      const status = error.response?.status
      if (status) {
        if (status === 401) {
          patterns.auth_errors = (patterns.auth_errors || 0) + 1
        }
        else if (status === 403) {
          patterns.permission_errors = (patterns.permission_errors || 0) + 1
        }
        else if (status === 429) {
          patterns.rate_limit_errors = (patterns.rate_limit_errors || 0) + 1
        }
        else if (status >= 500) {
          patterns.server_errors = (patterns.server_errors || 0) + 1
        }
        else if (status >= 400 && status < 500) {
          patterns.client_errors = (patterns.client_errors || 0) + 1
        }
      }
    })

    // 转换为分析结果
    const analysisPatterns = Object.entries(patterns).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / total) * 100),
      description: this.getPatternDescription(type),
    }))

    // 按出现次数排序
    analysisPatterns.sort((a, b) => b.count - a.count)

    // 找出最频繁的错误
    const mostFrequentError = analysisPatterns[0]
      ? { type: analysisPatterns[0].type, count: analysisPatterns[0].count }
      : undefined

    // 生成建议
    const recommendations = this.generateRecommendations(patterns, total)

    return {
      patterns: analysisPatterns,
      recommendations,
      summary: {
        totalErrors: total,
        uniqueEndpoints: endpoints.size,
        timeRange: { start: minTime, end: maxTime },
        mostFrequentError,
      },
    }
  }

  /**
   * 获取模式描述
   */
  private static getPatternDescription(type: string): string {
    return this.patternDescriptions[type] || '未知错误模式'
  }

  /**
   * 生成建议
   */
  private static generateRecommendations(
    patterns: Record<string, number>,
    total: number,
  ): string[] {
    const recommendations: string[] = []

    // 网络错误建议
    if (patterns.network_errors > total * 0.3) {
      recommendations.push(
        '检测到大量网络错误，建议：\n' +
        '1. 检查网络连接稳定性\n' +
        '2. 验证服务器地址是否正确\n' +
        '3. 考虑实现离线模式或缓存策略'
      )
    }

    // 超时错误建议
    if (patterns.timeout_errors > total * 0.2) {
      recommendations.push(
        '检测到频繁超时，建议：\n' +
        '1. 增加请求超时时间\n' +
        '2. 优化服务器响应性能\n' +
        '3. 实现请求重试机制'
      )
    }

    // 认证错误建议
    if (patterns.auth_errors > total * 0.2) {
      recommendations.push(
        '检测到认证问题，建议：\n' +
        '1. 实现令牌自动刷新机制\n' +
        '2. 检查令牌有效期设置\n' +
        '3. 优化登录流程'
      )
    }

    // 服务器错误建议
    if (patterns.server_errors > total * 0.3) {
      recommendations.push(
        '检测到服务器问题，建议：\n' +
        '1. 检查服务器日志\n' +
        '2. 监控服务器资源使用\n' +
        '3. 实现服务降级策略'
      )
    }

    // 限流错误建议
    if (patterns.rate_limit_errors > 5) {
      recommendations.push(
        '检测到请求限流，建议：\n' +
        '1. 实现请求队列和节流\n' +
        '2. 使用批量API减少请求数\n' +
        '3. 优化客户端缓存策略'
      )
    }

    // 权限错误建议
    if (patterns.permission_errors > total * 0.1) {
      recommendations.push(
        '检测到权限问题，建议：\n' +
        '1. 检查用户权限配置\n' +
        '2. 验证API访问权限\n' +
        '3. 优化权限错误提示'
      )
    }

    // 客户端错误建议
    if (patterns.client_errors > total * 0.4) {
      recommendations.push(
        '检测到大量客户端错误，建议：\n' +
        '1. 检查请求参数验证\n' +
        '2. 优化表单验证逻辑\n' +
        '3. 改进错误提示信息'
      )
    }

    // 如果没有特定建议，提供通用建议
    if (recommendations.length === 0) {
      recommendations.push(
        '建议实施以下通用优化：\n' +
        '1. 启用请求重试机制\n' +
        '2. 实现错误监控和告警\n' +
        '3. 优化错误处理和用户提示'
      )
    }

    return recommendations
  }

  /**
   * 生成错误报告
   */
  static generateErrorReport(errors: HttpError[]): string {
    const analysis = this.analyzeErrorPatterns(errors)
    
    let report = '# 错误分析报告\n\n'
    
    // 摘要
    report += '## 摘要\n'
    report += `- 总错误数: ${analysis.summary.totalErrors}\n`
    report += `- 影响端点数: ${analysis.summary.uniqueEndpoints}\n`
    
    if (analysis.summary.timeRange) {
      const duration = analysis.summary.timeRange.end - analysis.summary.timeRange.start
      const hours = Math.floor(duration / (1000 * 60 * 60))
      report += `- 时间跨度: ${hours}小时\n`
    }
    
    if (analysis.summary.mostFrequentError) {
      report += `- 最频繁错误: ${analysis.summary.mostFrequentError.type} (${analysis.summary.mostFrequentError.count}次)\n`
    }
    
    report += '\n'
    
    // 错误模式
    if (analysis.patterns.length > 0) {
      report += '## 错误模式\n'
      analysis.patterns.forEach(pattern => {
        report += `- **${pattern.type}** (${pattern.count}次, ${pattern.percentage}%): ${pattern.description}\n`
      })
      report += '\n'
    }
    
    // 建议
    if (analysis.recommendations.length > 0) {
      report += '## 优化建议\n'
      analysis.recommendations.forEach((rec, index) => {
        report += `### ${index + 1}. ${rec}\n`
      })
    }
    
    return report
  }

  /**
   * 预测错误趋势
   */
  static predictErrorTrend(errors: HttpError[]): {
    trend: 'increasing' | 'decreasing' | 'stable'
    rate: number
  } {
    if (errors.length < 2) {
      return { trend: 'stable', rate: 0 }
    }

    // 将错误按时间排序
const sortedErrors = [...errors].sort((a, b) => 
      (((a as any).timestamp) || 0) - (((b as any).timestamp) || 0)
    )

    // 计算前半部分和后半部分的错误率
    const midPoint = Math.floor(sortedErrors.length / 2)
    const firstHalf = sortedErrors.slice(0, midPoint)
    const secondHalf = sortedErrors.slice(midPoint)

    const firstHalfRate = firstHalf.length / (midPoint || 1)
    const secondHalfRate = secondHalf.length / (sortedErrors.length - midPoint)

    const rateChange = secondHalfRate - firstHalfRate

    if (rateChange > 0.2) {
      return { trend: 'increasing', rate: rateChange }
    }
    else if (rateChange < -0.2) {
      return { trend: 'decreasing', rate: Math.abs(rateChange) }
    }
    else {
      return { trend: 'stable', rate: 0 }
    }
  }
}