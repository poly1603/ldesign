/**
 * @ldesign/router 代码质量检查工具
 *
 * 提供运行时代码质量检查和最佳实践建议
 */

import type { RouteLocationNormalized, RouteRecordRaw } from '../types'

/**
 * 代码质量问题类型
 */
export enum QualityIssueType {
  PERFORMANCE = 'PERFORMANCE',
  SECURITY = 'SECURITY',
  ACCESSIBILITY = 'ACCESSIBILITY',
  MAINTAINABILITY = 'MAINTAINABILITY',
  BEST_PRACTICE = 'BEST_PRACTICE',
}

/**
 * 代码质量问题严重程度
 */
export enum IssueSeverity {
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
}

/**
 * 代码质量问题
 */
export interface QualityIssue {
  id: string
  type: QualityIssueType
  severity: IssueSeverity
  message: string
  description: string
  suggestion: string
  route?: string
  component?: string
  line?: number
  column?: number
  context?: Record<string, any>
}

/**
 * 质量检查规则
 */
export interface QualityRule {
  id: string
  name: string
  type: QualityIssueType
  severity: IssueSeverity
  enabled: boolean
  check: (context: QualityCheckContext) => QualityIssue[]
}

/**
 * 质量检查上下文
 */
export interface QualityCheckContext {
  routes: RouteRecordRaw[]
  currentRoute?: RouteLocationNormalized
  router?: any
  performance?: PerformanceEntry[]
}

/**
 * 代码质量检查器
 */
export class CodeQualityChecker {
  private rules: Map<string, QualityRule> = new Map()
  private issues: QualityIssue[] = []

  constructor() {
    this.setupDefaultRules()
  }

  /**
   * 设置默认检查规则
   */
  private setupDefaultRules(): void {
    // 路由深度检查
    this.addRule({
      id: 'route-depth',
      name: '路由嵌套深度检查',
      type: QualityIssueType.MAINTAINABILITY,
      severity: IssueSeverity.WARNING,
      enabled: true,
      check: (context) => {
        const issues: QualityIssue[] = []
        const maxDepth = 4

        const checkDepth = (routes: RouteRecordRaw[], depth = 0, parentPath = ''): void => {
          for (const route of routes) {
            const currentPath = `${parentPath}${route.path}`

            if (depth > maxDepth) {
              issues.push({
                id: `route-depth-${Date.now()}`,
                type: QualityIssueType.MAINTAINABILITY,
                severity: IssueSeverity.WARNING,
                message: `路由嵌套过深: ${currentPath}`,
                description: `路由嵌套深度为 ${depth}，超过推荐的最大深度 ${maxDepth}`,
                suggestion: '考虑重构路由结构，减少嵌套层级',
                route: currentPath,
              })
            }

            if (route.children) {
              checkDepth(route.children, depth + 1, currentPath)
            }
          }
        }

        checkDepth(context.routes)
        return issues
      },
    })

    // 路由命名检查
    this.addRule({
      id: 'route-naming',
      name: '路由命名规范检查',
      type: QualityIssueType.BEST_PRACTICE,
      severity: IssueSeverity.INFO,
      enabled: true,
      check: (context) => {
        const issues: QualityIssue[] = []
        const namePattern = /^[a-z][a-z0-9-]*$/i

        const checkNaming = (routes: RouteRecordRaw[]): void => {
          for (const route of routes) {
            if (route.name && !namePattern.test(String(route.name))) {
              issues.push({
                id: `route-naming-${Date.now()}`,
                type: QualityIssueType.BEST_PRACTICE,
                severity: IssueSeverity.INFO,
                message: `路由名称不符合规范: ${String(route.name)}`,
                description: '路由名称应该使用 kebab-case 格式',
                suggestion: '使用小写字母、数字和连字符组成路由名称',
                route: route.path,
              })
            }

            if (route.children) {
              checkNaming(route.children)
            }
          }
        }

        checkNaming(context.routes)
        return issues
      },
    })

    // 组件懒加载检查
    this.addRule({
      id: 'lazy-loading',
      name: '组件懒加载检查',
      type: QualityIssueType.PERFORMANCE,
      severity: IssueSeverity.WARNING,
      enabled: true,
      check: (context) => {
        const issues: QualityIssue[] = []

        const checkLazyLoading = (routes: RouteRecordRaw[]): void => {
          for (const route of routes) {
            if (route.component && typeof route.component !== 'function') {
              issues.push({
                id: `lazy-loading-${Date.now()}`,
                type: QualityIssueType.PERFORMANCE,
                severity: IssueSeverity.WARNING,
                message: `组件未使用懒加载: ${route.path}`,
                description: '同步导入的组件会增加初始包大小',
                suggestion: '使用动态导入 () => import() 实现组件懒加载',
                route: route.path,
              })
            }

            if (route.children) {
              checkLazyLoading(route.children)
            }
          }
        }

        checkLazyLoading(context.routes)
        return issues
      },
    })

    // 路由元信息检查
    this.addRule({
      id: 'route-meta',
      name: '路由元信息检查',
      type: QualityIssueType.ACCESSIBILITY,
      severity: IssueSeverity.INFO,
      enabled: true,
      check: (context) => {
        const issues: QualityIssue[] = []

        const checkMeta = (routes: RouteRecordRaw[]): void => {
          for (const route of routes) {
            if (!route.meta?.title) {
              issues.push({
                id: `route-meta-title-${Date.now()}`,
                type: QualityIssueType.ACCESSIBILITY,
                severity: IssueSeverity.INFO,
                message: `路由缺少标题: ${route.path}`,
                description: '路由应该包含 meta.title 用于页面标题和无障碍访问',
                suggestion: '在路由配置中添加 meta: { title: "页面标题" }',
                route: route.path,
              })
            }

            if (route.children) {
              checkMeta(route.children)
            }
          }
        }

        checkMeta(context.routes)
        return issues
      },
    })

    // 路由重复检查
    this.addRule({
      id: 'duplicate-routes',
      name: '重复路由检查',
      type: QualityIssueType.MAINTAINABILITY,
      severity: IssueSeverity.ERROR,
      enabled: true,
      check: (context) => {
        const issues: QualityIssue[] = []
        const pathSet = new Set<string>()
        const nameSet = new Set<string>()

        const checkDuplicates = (routes: RouteRecordRaw[], parentPath = ''): void => {
          for (const route of routes) {
            const fullPath = `${parentPath}${route.path}`

            // 检查路径重复
            if (pathSet.has(fullPath)) {
              issues.push({
                id: `duplicate-path-${Date.now()}`,
                type: QualityIssueType.MAINTAINABILITY,
                severity: IssueSeverity.ERROR,
                message: `重复的路由路径: ${fullPath}`,
                description: '存在相同的路由路径，可能导致路由冲突',
                suggestion: '确保每个路由路径都是唯一的',
                route: fullPath,
              })
            }
            else {
              pathSet.add(fullPath)
            }

            // 检查名称重复
            if (route.name) {
              if (nameSet.has(String(route.name))) {
                issues.push({
                  id: `duplicate-name-${Date.now()}`,
                  type: QualityIssueType.MAINTAINABILITY,
                  severity: IssueSeverity.ERROR,
                  message: `重复的路由名称: ${String(route.name)}`,
                  description: '存在相同的路由名称，可能导致导航错误',
                  suggestion: '确保每个路由名称都是唯一的',
                  route: fullPath,
                })
              }
              else {
                nameSet.add(String(route.name))
              }
            }

            if (route.children) {
              checkDuplicates(route.children, fullPath)
            }
          }
        }

        checkDuplicates(context.routes)
        return issues
      },
    })
  }

  /**
   * 添加检查规则
   */
  addRule(rule: QualityRule): void {
    this.rules.set(rule.id, rule)
  }

  /**
   * 移除检查规则
   */
  removeRule(ruleId: string): void {
    this.rules.delete(ruleId)
  }

  /**
   * 启用/禁用规则
   */
  toggleRule(ruleId: string, enabled: boolean): void {
    const rule = this.rules.get(ruleId)
    if (rule) {
      rule.enabled = enabled
    }
  }

  /**
   * 执行质量检查
   */
  check(context: QualityCheckContext): QualityIssue[] {
    this.issues = []

    for (const rule of this.rules.values()) {
      if (rule.enabled) {
        try {
          const ruleIssues = rule.check(context)
          this.issues.push(...ruleIssues)
        }
        catch (error) {
          console.error(`质量检查规则执行失败: ${rule.id}`, error)
        }
      }
    }

    return this.issues
  }

  /**
   * 获取问题统计
   */
  getIssueStats() {
    const stats = {
      total: this.issues.length,
      byType: {} as Record<QualityIssueType, number>,
      bySeverity: {} as Record<IssueSeverity, number>,
    }

    for (const issue of this.issues) {
      stats.byType[issue.type] = (stats.byType[issue.type] || 0) + 1
      stats.bySeverity[issue.severity] = (stats.bySeverity[issue.severity] || 0) + 1
    }

    return stats
  }

  /**
   * 生成质量报告
   */
  generateReport(): string {
    const stats = this.getIssueStats()
    let report = '# 代码质量检查报告\n\n'

    report += `## 总览\n`
    report += `- 总问题数: ${stats.total}\n`
    report += `- 错误: ${stats.bySeverity[IssueSeverity.ERROR] || 0}\n`
    report += `- 警告: ${stats.bySeverity[IssueSeverity.WARNING] || 0}\n`
    report += `- 信息: ${stats.bySeverity[IssueSeverity.INFO] || 0}\n\n`

    if (this.issues.length > 0) {
      report += `## 问题详情\n\n`

      for (const issue of this.issues) {
        report += `### ${issue.severity}: ${issue.message}\n`
        report += `- **类型**: ${issue.type}\n`
        report += `- **描述**: ${issue.description}\n`
        report += `- **建议**: ${issue.suggestion}\n`
        if (issue.route) {
          report += `- **路由**: ${issue.route}\n`
        }
        report += '\n'
      }
    }

    return report
  }

  /**
   * 清空问题列表
   */
  clearIssues(): void {
    this.issues = []
  }
}

// 导出单例实例
export const codeQualityChecker = new CodeQualityChecker()
