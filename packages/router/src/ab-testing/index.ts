/**
 * 路由 A/B 测试功能
 * 支持路由变体、用户分组、数据分析等
 */

import type { RouteLocationRaw, Router, RouteRecord } from '../types'
import { nanoid } from 'nanoid'
import { computed, inject } from 'vue'

export interface ABTestVariant {
  id: string
  name: string
  weight: number // 流量权重 0-100
  route: RouteLocationRaw
  component?: any
  props?: Record<string, any>
  meta?: Record<string, any>
}

export interface ABTestExperiment {
  id: string
  name: string
  description?: string
  startDate?: Date
  endDate?: Date
  status: 'draft' | 'running' | 'paused' | 'completed'
  targetRoute: string // 原始路由路径
  variants: ABTestVariant[]
  targeting?: TargetingRule
  goals?: ExperimentGoal[]
  sampleSize?: number // 采样率 0-100
}

export interface TargetingRule {
  include?: UserSegment[]
  exclude?: UserSegment[]
  customRules?: Array<(user: any) => boolean>
}

export interface UserSegment {
  type: 'new' | 'returning' | 'location' | 'device' | 'custom'
  value?: any
  operator?: 'equals' | 'contains' | 'starts' | 'ends' | 'regex'
}

export interface ExperimentGoal {
  id: string
  name: string
  type: 'pageview' | 'click' | 'conversion' | 'custom'
  target?: string
  value?: number
}

export interface ABTestResult {
  experimentId: string
  variantId: string
  userId: string
  timestamp: Date
  goals: GoalResult[]
}

export interface GoalResult {
  goalId: string
  achieved: boolean
  value?: number
  timestamp: Date
}

export interface VariantStats {
  variantId: string
  impressions: number
  conversions: number
  conversionRate: number
  avgValue?: number
  confidence?: number
}

/**
 * A/B 测试管理器
 */
export class ABTestManager {
  private experiments = new Map<string, ABTestExperiment>()
  private userVariants = new Map<string, Map<string, string>>() // userId -> experimentId -> variantId
  private results = new Map<string, ABTestResult[]>()
  private router: Router | null = null
  private userId: string
  private storage: Storage
  private analytics: AnalyticsAdapter | null = null

  constructor(options: {
    userId?: string
    storage?: Storage
    analytics?: AnalyticsAdapter
  } = {}) {
    this.userId = options.userId || this.generateUserId()
    this.storage = options.storage || localStorage
    this.analytics = options.analytics || null
    
    this.loadExperiments()
    this.loadUserVariants()
  }

  /**
   * 初始化路由集成
   */
  initRouter(router: Router) {
    this.router = router
    this.setupRouterIntegration()
  }

  /**
   * 设置路由集成
   */
  private setupRouterIntegration() {
    if (!this.router) return

    // 添加导航守卫
    this.router.beforeEach((to, _from, next) => {
      const experiment = this.getExperimentForRoute(to.path)
      
      if (experiment && experiment.status === 'running') {
        const variant = this.selectVariant(experiment)
        
        if (variant && variant.route !== to.path) {
          // 记录展示
          this.recordImpression(experiment.id, variant.id)
          
          // 重定向到变体路由
          next(variant.route)
        } else {
          next()
        }
      } else {
        next()
      }
    })
  }

  /**
   * 创建实验
   */
  createExperiment(config: Omit<ABTestExperiment, 'id'>): ABTestExperiment {
    const experiment: ABTestExperiment = {
      ...config,
      id: nanoid(),
      status: config.status || 'draft'
    }

    // 验证权重总和
    const totalWeight = experiment.variants.reduce((sum, v) => sum + v.weight, 0)
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new Error('Variant weights must sum to 100')
    }

    this.experiments.set(experiment.id, experiment)
    this.saveExperiments()

    // 如果实验正在运行，设置路由
    if (experiment.status === 'running' && this.router) {
      this.setupExperimentRoutes(experiment)
    }

    return experiment
  }

  /**
   * 更新实验
   */
  updateExperiment(id: string, updates: Partial<ABTestExperiment>) {
    const experiment = this.experiments.get(id)
    if (!experiment) {
      throw new Error(`Experiment ${id} not found`)
    }

    Object.assign(experiment, updates)
    
    // 如果状态改变
    if (updates.status) {
      if (updates.status === 'running') {
        this.startExperiment(id)
      } else if (updates.status === 'paused' || updates.status === 'completed') {
        this.stopExperiment(id)
      }
    }

    this.saveExperiments()
  }

  /**
   * 删除实验
   */
  deleteExperiment(id: string) {
    const experiment = this.experiments.get(id)
    if (!experiment) return

    // 停止实验
    if (experiment.status === 'running') {
      this.stopExperiment(id)
    }

    this.experiments.delete(id)
    this.saveExperiments()
  }

  /**
   * 启动实验
   */
  startExperiment(id: string) {
    const experiment = this.experiments.get(id)
    if (!experiment) return

    experiment.status = 'running'
    experiment.startDate = new Date()

    if (this.router) {
      this.setupExperimentRoutes(experiment)
    }

    this.saveExperiments()

    // 发送分析事件
    if (this.analytics) {
      this.analytics.track('experiment_started', {
        experimentId: id,
        experimentName: experiment.name
      })
    }
  }

  /**
   * 停止实验
   */
  stopExperiment(id: string) {
    const experiment = this.experiments.get(id)
    if (!experiment) return

    if (experiment.status === 'running') {
      experiment.status = 'paused'
      experiment.endDate = new Date()
    }

    if (this.router) {
      this.removeExperimentRoutes(experiment)
    }

    this.saveExperiments()

    // 发送分析事件
    if (this.analytics) {
      this.analytics.track('experiment_stopped', {
        experimentId: id,
        experimentName: experiment.name
      })
    }
  }

  /**
   * 设置实验路由
   */
  private setupExperimentRoutes(experiment: ABTestExperiment) {
    if (!this.router) return

    const router = this.router
    experiment.variants.forEach(variant => {
      if (variant.component) {
        // 仅当变体路由为字符串或具有 path 时才创建路由
        const routePath = typeof variant.route === 'string'
          ? variant.route
          : (typeof variant.route === 'object' && 'path' in (variant.route as any)
            ? (variant.route as any).path
            : undefined)
        if (!routePath) return
        const route: RouteRecord = {
          path: routePath,
          name: `ab-${experiment.id}-${variant.id}`,
          component: variant.component,
          props: variant.props,
          meta: {
            ...variant.meta,
            abTest: {
              experimentId: experiment.id,
              variantId: variant.id
            }
          }
        }

        router.addRoute(route)
      }
    })
  }

  /**
   * 移除实验路由
   */
  private removeExperimentRoutes(experiment: ABTestExperiment) {
    if (!this.router) return

    const router = this.router
    experiment.variants.forEach(variant => {
      const routeName = `ab-${experiment.id}-${variant.id}`
      router.removeRoute(routeName)
    })
  }

  /**
   * 选择变体
   */
  selectVariant(experiment: ABTestExperiment): ABTestVariant | null {
    // 检查用户是否符合定位规则
    if (!this.matchesTargeting(experiment)) {
      return null
    }

    // 检查采样率
    if (experiment.sampleSize && experiment.sampleSize < 100) {
      const hash = this.hashString(this.userId + experiment.id)
      if (hash % 100 >= experiment.sampleSize) {
        return null
      }
    }

    // 检查用户是否已经分配了变体
    let userVariantMap = this.userVariants.get(this.userId)
    if (!userVariantMap) {
      userVariantMap = new Map()
      this.userVariants.set(this.userId, userVariantMap)
    }

    let variantId = userVariantMap.get(experiment.id)
    
    if (!variantId) {
      // 根据权重分配变体
      variantId = this.assignVariant(experiment)
      userVariantMap.set(experiment.id, variantId)
      this.saveUserVariants()
    }

    return experiment.variants.find(v => v.id === variantId) || null
  }

  /**
   * 分配变体
   */
  private assignVariant(experiment: ABTestExperiment): string {
    const random = Math.random() * 100
    let cumulative = 0

    for (const variant of experiment.variants) {
      cumulative += variant.weight
      if (random <= cumulative) {
        return variant.id
      }
    }

    return experiment.variants[0]?.id || experiment.variants[0]!.id
  }

  /**
   * 检查定位规则
   */
  private matchesTargeting(experiment: ABTestExperiment): boolean {
    if (!experiment.targeting) return true

    const { include, exclude, customRules } = experiment.targeting

    // 检查包含规则
    if (include && include.length > 0) {
      const matches = include.some(segment => this.matchesSegment(segment))
      if (!matches) return false
    }

    // 检查排除规则
    if (exclude && exclude.length > 0) {
      const matches = exclude.some(segment => this.matchesSegment(segment))
      if (matches) return false
    }

    // 检查自定义规则
    if (customRules && customRules.length > 0) {
      const user = this.getCurrentUser()
      const matches = customRules.every(rule => rule(user))
      if (!matches) return false
    }

    return true
  }

  /**
   * 匹配用户分段
   */
  private matchesSegment(segment: UserSegment): boolean {
    switch (segment.type) {
      case 'new':
        return this.isNewUser()
      case 'returning':
        return !this.isNewUser()
      case 'location':
        return this.matchesLocation(segment.value, segment.operator)
      case 'device':
        return this.matchesDevice(segment.value, segment.operator)
      case 'custom':
        return this.matchesCustomSegment(segment.value, segment.operator)
      default:
        return false
    }
  }

  /**
   * 判断是否新用户
   */
  private isNewUser(): boolean {
    const firstVisit = this.storage.getItem('ab_first_visit')
    if (!firstVisit) {
      this.storage.setItem('ab_first_visit', Date.now().toString())
      return true
    }
    
    const daysSinceFirstVisit = (Date.now() - Number.parseInt(firstVisit)) / (1000 * 60 * 60 * 24)
    return daysSinceFirstVisit < 7
  }

  /**
   * 匹配位置
   */
  private matchesLocation(value: any, operator?: string): boolean {
    // 简单实现，实际应该使用地理位置API
    const userLocation = this.getUserLocation()
    if (!userLocation) return false

    switch (operator) {
      case 'equals':
        return userLocation === value
      case 'contains':
        return userLocation.includes(value)
      default:
        return false
    }
  }

  /**
   * 匹配设备
   */
  private matchesDevice(value: any, _operator?: string): boolean {
    const userAgent = navigator.userAgent.toLowerCase()
    
    switch (value) {
      case 'mobile':
        return /mobile|android|iphone|ipad|phone/i.test(userAgent)
      case 'desktop':
        return !/mobile|android|iphone|ipad|phone/i.test(userAgent)
      case 'tablet':
        return /ipad|tablet/i.test(userAgent)
      default:
        return false
    }
  }

  /**
   * 匹配自定义分段
   */
  private matchesCustomSegment(_value: any, _operator?: string): boolean {
    // 实现自定义分段逻辑
    return true
  }

  /**
   * 记录展示
   */
  recordImpression(experimentId: string, variantId: string) {
    const result: ABTestResult = {
      experimentId,
      variantId,
      userId: this.userId,
      timestamp: new Date(),
      goals: []
    }

    if (!this.results.has(experimentId)) {
      this.results.set(experimentId, [])
    }
    
    this.results.get(experimentId)!.push(result)

    // 发送分析事件
    if (this.analytics) {
      this.analytics.track('experiment_impression', {
        experimentId,
        variantId,
        userId: this.userId
      })
    }
  }

  /**
   * 记录转化
   */
  recordConversion(experimentId: string, goalId: string, value?: number) {
    const experiment = this.experiments.get(experimentId)
    if (!experiment) return

    const userVariantMap = this.userVariants.get(this.userId)
    if (!userVariantMap) return

    const variantId = userVariantMap.get(experimentId)
    if (!variantId) return

    const results = this.results.get(experimentId)
    if (!results) return

    const lastResult = results[results.length - 1]
    if (lastResult && lastResult.variantId === variantId) {
      lastResult.goals.push({
        goalId,
        achieved: true,
        value,
        timestamp: new Date()
      })
    }

    // 发送分析事件
    if (this.analytics) {
      this.analytics.track('experiment_conversion', {
        experimentId,
        variantId,
        goalId,
        value,
        userId: this.userId
      })
    }
  }

  /**
   * 获取实验统计
   */
  getExperimentStats(experimentId: string): Map<string, VariantStats> {
    const experiment = this.experiments.get(experimentId)
    if (!experiment) return new Map()

    const results = this.results.get(experimentId) || []
    const stats = new Map<string, VariantStats>()

    // 初始化统计
    experiment.variants.forEach(variant => {
      stats.set(variant.id, {
        variantId: variant.id,
        impressions: 0,
        conversions: 0,
        conversionRate: 0,
        avgValue: 0,
        confidence: 0
      })
    })

    // 计算统计
    results.forEach(result => {
      const variantStats = stats.get(result.variantId)
      if (!variantStats) return

      variantStats.impressions++

      if (result.goals.length > 0) {
        variantStats.conversions++
        
        const totalValue = result.goals.reduce((sum, goal) => sum + (goal.value || 0), 0)
        variantStats.avgValue = 
          ((variantStats.avgValue || 0) * (variantStats.conversions - 1) + totalValue) / 
          variantStats.conversions
      }
    })

    // 计算转化率和置信度
    stats.forEach(variantStats => {
      if (variantStats.impressions > 0) {
        variantStats.conversionRate = variantStats.conversions / variantStats.impressions
        variantStats.confidence = this.calculateConfidence(variantStats, stats)
      }
    })

    return stats
  }

  /**
   * 计算置信度
   */
  private calculateConfidence(
    variant: VariantStats, 
    allStats: Map<string, VariantStats>
  ): number {
    // 简化的置信度计算
    if (variant.impressions < 30) return 0

    const control = Array.from(allStats.values()).find(s => s.variantId !== variant.variantId)
    if (!control || control.impressions < 30) return 0

    // Z-test for proportions
    const p1 = variant.conversionRate
    const p2 = control.conversionRate
    const n1 = variant.impressions
    const n2 = control.impressions
    
    const pooledP = (variant.conversions + control.conversions) / (n1 + n2)
    const se = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2))
    
    if (se === 0) return 0
    
    const z = Math.abs(p1 - p2) / se
    
    // 转换为置信度百分比
    if (z < 1.645) return 0 // < 90%
    if (z < 1.96) return 90  // 90%
    if (z < 2.576) return 95 // 95%
    return 99 // 99%
  }

  /**
   * 获取路由对应的实验
   */
  private getExperimentForRoute(path: string): ABTestExperiment | null {
    for (const experiment of this.experiments.values()) {
      if (experiment.status === 'running' && experiment.targetRoute === path) {
        return experiment
      }
    }
    return null
  }

  /**
   * 生成用户ID
   */
  private generateUserId(): string {
    let userId = this.storage.getItem('ab_user_id')
    if (!userId) {
      userId = nanoid()
      this.storage.setItem('ab_user_id', userId)
    }
    return userId
  }

  /**
   * 获取当前用户
   */
  private getCurrentUser(): any {
    return {
      id: this.userId,
      isNew: this.isNewUser(),
      device: this.getDevice(),
      location: this.getUserLocation()
    }
  }

  /**
   * 获取设备类型
   */
  private getDevice(): string {
    const userAgent = navigator.userAgent.toLowerCase()
    if (/mobile|android|iphone|phone/i.test(userAgent)) return 'mobile'
    if (/ipad|tablet/i.test(userAgent)) return 'tablet'
    return 'desktop'
  }

  /**
   * 获取用户位置
   */
  private getUserLocation(): string | null {
    // 简单实现，实际应该使用地理位置API
    return this.storage.getItem('user_location')
  }

  /**
   * 哈希字符串
   */
  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash)
  }

  /**
   * 保存实验
   */
  private saveExperiments() {
    const data = Array.from(this.experiments.values())
    this.storage.setItem('ab_experiments', JSON.stringify(data))
  }

  /**
   * 加载实验
   */
  private loadExperiments() {
    const data = this.storage.getItem('ab_experiments')
    if (!data) return

    try {
      const experiments = JSON.parse(data)
      experiments.forEach((exp: any) => {
        this.experiments.set(exp.id, exp)
      })
    } catch (error) {
      console.error('Failed to load AB test experiments:', error)
    }
  }

  /**
   * 保存用户变体
   */
  private saveUserVariants() {
    const data: Record<string, Record<string, string>> = {}
    
    this.userVariants.forEach((variants, userId) => {
      data[userId] = Object.fromEntries(variants)
    })
    
    this.storage.setItem('ab_user_variants', JSON.stringify(data))
  }

  /**
   * 加载用户变体
   */
  private loadUserVariants() {
    const data = this.storage.getItem('ab_user_variants')
    if (!data) return

    try {
      const userVariants = JSON.parse(data)
      Object.entries(userVariants).forEach(([userId, variants]) => {
        this.userVariants.set(userId, new Map(Object.entries(variants as Record<string, string>)))
      })
    } catch (error) {
      console.error('Failed to load user variants:', error)
    }
  }

  /**
   * 获取全部实验（只读）
   */
  getExperiments(): ABTestExperiment[] {
    return Array.from(this.experiments.values())
  }

  /**
   * 导出结果
   */
  exportResults(experimentId?: string): any {
    if (experimentId) {
      return {
        experiment: this.experiments.get(experimentId),
        results: this.results.get(experimentId),
        stats: Object.fromEntries(this.getExperimentStats(experimentId))
      }
    }

    const allData: any[] = []
    this.experiments.forEach((exp, id) => {
      allData.push({
        experiment: exp,
        results: this.results.get(id),
        stats: Object.fromEntries(this.getExperimentStats(id))
      })
    })

    return allData
  }
}

/**
 * 分析适配器接口
 */
export interface AnalyticsAdapter {
  track: (event: string, properties?: any) => void
}

/**
 * Google Analytics 适配器
 */
export class GoogleAnalyticsAdapter implements AnalyticsAdapter {
  track(event: string, properties?: any) {
    if (typeof gtag === 'function') {
      gtag('event', event, properties)
    }
  }
}

/**
 * Vue 插件
 */
export const ABTestPlugin = {
  install(app: any, options?: any) {
    const abTest = new ABTestManager(options)
    
    app.config.globalProperties.$abTest = abTest
    app.provide('abTest', abTest)

    // 初始化路由集成
    app.mixin({
      mounted() {
        if (this.$options.name === 'App' && this.$router) {
          abTest.initRouter(this.$router)
        }
      }
    })
  }
}

/**
 * 组合式 API
 */
export function useABTest() {
  const abTest = inject<ABTestManager>('abTest')
  
  if (!abTest) {
    throw new Error('ABTestManager not found')
  }

  const currentExperiments = computed(() => {
    return abTest.getExperiments().filter(exp => exp.status === 'running')
  })

  return {
    createExperiment: abTest.createExperiment.bind(abTest),
    updateExperiment: abTest.updateExperiment.bind(abTest),
    deleteExperiment: abTest.deleteExperiment.bind(abTest),
    startExperiment: abTest.startExperiment.bind(abTest),
    stopExperiment: abTest.stopExperiment.bind(abTest),
    recordConversion: abTest.recordConversion.bind(abTest),
    getExperimentStats: abTest.getExperimentStats.bind(abTest),
    exportResults: abTest.exportResults.bind(abTest),
    currentExperiments
  }
}

// 声明全局类型
declare global {
  function gtag(...args: any[]): void
}
