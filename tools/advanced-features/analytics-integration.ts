/**
 * 高级分析和监控集成
 * 支持多种分析服务和性能监控工具
 */

import chalk from 'chalk'

export interface AnalyticsConfig {
  /** 分析服务提供商 */
  providers: AnalyticsProvider[]
  /** 是否启用性能监控 */
  enablePerformanceMonitoring: boolean
  /** 是否启用错误追踪 */
  enableErrorTracking: boolean
  /** 是否启用用户行为分析 */
  enableUserBehaviorTracking: boolean
  /** 数据采样率 */
  sampleRate: number
  /** 隐私设置 */
  privacy: PrivacySettings
}

export interface AnalyticsProvider {
  /** 提供商名称 */
  name: string
  /** 提供商类型 */
  type: ProviderType
  /** 配置选项 */
  config: Record<string, any>
  /** 是否启用 */
  enabled: boolean
}

export type ProviderType =
  | 'google-analytics'
  | 'baidu-analytics'
  | 'umami'
  | 'plausible'
  | 'mixpanel'
  | 'amplitude'
  | 'sentry'
  | 'bugsnag'
  | 'rollbar'
  | 'datadog'
  | 'new-relic'
  | 'custom'

export interface PrivacySettings {
  /** 是否遵守 GDPR */
  gdprCompliant: boolean
  /** 是否遵守 CCPA */
  ccpaCompliant: boolean
  /** Cookie 同意 */
  cookieConsent: boolean
  /** 数据匿名化 */
  anonymizeData: boolean
  /** IP 匿名化 */
  anonymizeIP: boolean
}

export interface PerformanceMetrics {
  /** 页面加载时间 */
  pageLoadTime: number
  /** 首次内容绘制 */
  firstContentfulPaint: number
  /** 最大内容绘制 */
  largestContentfulPaint: number
  /** 首次输入延迟 */
  firstInputDelay: number
  /** 累积布局偏移 */
  cumulativeLayoutShift: number
  /** 内存使用 */
  memoryUsage: {
    used: number
    total: number
    limit: number
  }
}

export interface UserEvent {
  /** 事件名称 */
  name: string
  /** 事件类型 */
  type: 'click' | 'view' | 'scroll' | 'form' | 'navigation' | 'custom'
  /** 事件属性 */
  properties: Record<string, any>
  /** 时间戳 */
  timestamp: number
  /** 用户 ID */
  userId?: string
  /** 会话 ID */
  sessionId: string
}

export class AnalyticsIntegration {
  private config: AnalyticsConfig
  private providers: Map<string, any> = new Map()
  private sessionId: string
  private userId?: string

  constructor(config: AnalyticsConfig) {
    this.config = config
    this.sessionId = this.generateSessionId()
    this.initializeProviders()
  }

  /**
   * 初始化分析提供商
   */
  private async initializeProviders(): Promise<void> {
    console.log(chalk.blue('📊 初始化分析服务...'))

    for (const provider of this.config.providers) {
      if (!provider.enabled)
        continue

      try {
        const instance = await this.createProvider(provider)
        this.providers.set(provider.name, instance)
        console.log(chalk.green(`✅ ${provider.name} 初始化成功`))
      }
      catch (error) {
        console.error(chalk.red(`❌ ${provider.name} 初始化失败:`), error)
      }
    }
  }

  /**
   * 创建分析提供商实例
   */
  private async createProvider(provider: AnalyticsProvider): Promise<any> {
    switch (provider.type) {
      case 'google-analytics':
        return this.createGoogleAnalytics(provider.config)
      case 'baidu-analytics':
        return this.createBaiduAnalytics(provider.config)
      case 'umami':
        return this.createUmami(provider.config)
      case 'plausible':
        return this.createPlausible(provider.config)
      case 'mixpanel':
        return this.createMixpanel(provider.config)
      case 'amplitude':
        return this.createAmplitude(provider.config)
      case 'sentry':
        return this.createSentry(provider.config)
      case 'bugsnag':
        return this.createBugsnag(provider.config)
      case 'datadog':
        return this.createDatadog(provider.config)
      case 'new-relic':
        return this.createNewRelic(provider.config)
      case 'custom':
        return this.createCustomProvider(provider.config)
      default:
        throw new Error(`不支持的分析提供商: ${provider.type}`)
    }
  }

  /**
   * 创建 Google Analytics
   */
  private createGoogleAnalytics(config: any) {
    return {
      name: 'Google Analytics',
      track: (event: UserEvent) => {
        if (typeof gtag !== 'undefined') {
          gtag('event', event.name, {
            event_category: event.type,
            event_label: event.properties.label,
            value: event.properties.value,
            custom_map: event.properties,
          })
        }
      },
      trackPageView: (path: string) => {
        if (typeof gtag !== 'undefined') {
          gtag('config', config.measurementId, {
            page_path: path,
            anonymize_ip: this.config.privacy.anonymizeIP,
          })
        }
      },
      trackPerformance: (metrics: PerformanceMetrics) => {
        if (typeof gtag !== 'undefined') {
          gtag('event', 'page_timing', {
            name: 'load',
            value: Math.round(metrics.pageLoadTime),
          })
        }
      },
    }
  }

  /**
   * 创建百度统计
   */
  private createBaiduAnalytics(config: any) {
    return {
      name: 'Baidu Analytics',
      track: (event: UserEvent) => {
        if (typeof _hmt !== 'undefined') {
          _hmt.push([
            '_trackEvent',
            event.type,
            event.name,
            event.properties.label,
          ])
        }
      },
      trackPageView: (path: string) => {
        if (typeof _hmt !== 'undefined') {
          _hmt.push(['_trackPageview', path])
        }
      },
      trackPerformance: (metrics: PerformanceMetrics) => {
        // 百度统计的性能监控
        if (typeof _hmt !== 'undefined') {
          _hmt.push([
            '_trackEvent',
            'performance',
            'page_load',
            '',
            metrics.pageLoadTime,
          ])
        }
      },
    }
  }

  /**
   * 创建 Umami
   */
  private createUmami(config: any) {
    return {
      name: 'Umami',
      track: (event: UserEvent) => {
        if (typeof umami !== 'undefined') {
          umami.track(event.name, event.properties)
        }
      },
      trackPageView: (path: string) => {
        if (typeof umami !== 'undefined') {
          umami.track('pageview', { path })
        }
      },
      trackPerformance: (metrics: PerformanceMetrics) => {
        if (typeof umami !== 'undefined') {
          umami.track('performance', {
            pageLoadTime: metrics.pageLoadTime,
            fcp: metrics.firstContentfulPaint,
            lcp: metrics.largestContentfulPaint,
          })
        }
      },
    }
  }

  /**
   * 创建 Sentry 错误追踪
   */
  private createSentry(config: any) {
    return {
      name: 'Sentry',
      track: (event: UserEvent) => {
        if (typeof Sentry !== 'undefined') {
          Sentry.addBreadcrumb({
            message: event.name,
            category: event.type,
            data: event.properties,
          })
        }
      },
      trackError: (error: Error, context?: any) => {
        if (typeof Sentry !== 'undefined') {
          Sentry.captureException(error, {
            contexts: context,
            user: { id: this.userId },
          })
        }
      },
      trackPerformance: (metrics: PerformanceMetrics) => {
        if (typeof Sentry !== 'undefined') {
          Sentry.addBreadcrumb({
            message: 'Performance Metrics',
            category: 'performance',
            data: metrics,
          })
        }
      },
    }
  }

  /**
   * 创建 Mixpanel
   */
  private createMixpanel(config: any) {
    return {
      name: 'Mixpanel',
      track: (event: UserEvent) => {
        if (typeof mixpanel !== 'undefined') {
          mixpanel.track(event.name, {
            ...event.properties,
            $session_id: this.sessionId,
            $user_id: this.userId,
          })
        }
      },
      trackPageView: (path: string) => {
        if (typeof mixpanel !== 'undefined') {
          mixpanel.track('Page View', { path })
        }
      },
      trackPerformance: (metrics: PerformanceMetrics) => {
        if (typeof mixpanel !== 'undefined') {
          mixpanel.track('Performance', metrics)
        }
      },
    }
  }

  /**
   * 创建自定义提供商
   */
  private createCustomProvider(config: any) {
    return {
      name: 'Custom Provider',
      track: (event: UserEvent) => {
        // 自定义追踪逻辑
        if (config.endpoint) {
          fetch(config.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event),
          }).catch(console.error)
        }
      },
      trackPageView: (path: string) => {
        this.track({
          name: 'page_view',
          type: 'view',
          properties: { path },
          timestamp: Date.now(),
          sessionId: this.sessionId,
        })
      },
      trackPerformance: (metrics: PerformanceMetrics) => {
        this.track({
          name: 'performance_metrics',
          type: 'custom',
          properties: metrics,
          timestamp: Date.now(),
          sessionId: this.sessionId,
        })
      },
    }
  }

  /**
   * 追踪用户事件
   */
  track(event: Partial<UserEvent>): void {
    if (!this.shouldTrack())
      return

    const fullEvent: UserEvent = {
      name: event.name!,
      type: event.type || 'custom',
      properties: event.properties || {},
      timestamp: event.timestamp || Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
    }

    // 发送到所有启用的提供商
    for (const [name, provider] of this.providers) {
      try {
        provider.track(fullEvent)
      }
      catch (error) {
        console.error(chalk.red(`❌ ${name} 追踪失败:`), error)
      }
    }
  }

  /**
   * 追踪页面浏览
   */
  trackPageView(path: string): void {
    if (!this.shouldTrack())
      return

    for (const [name, provider] of this.providers) {
      try {
        if (provider.trackPageView) {
          provider.trackPageView(path)
        }
      }
      catch (error) {
        console.error(chalk.red(`❌ ${name} 页面追踪失败:`), error)
      }
    }
  }

  /**
   * 追踪性能指标
   */
  trackPerformance(metrics: PerformanceMetrics): void {
    if (!this.config.enablePerformanceMonitoring || !this.shouldTrack())
      return

    for (const [name, provider] of this.providers) {
      try {
        if (provider.trackPerformance) {
          provider.trackPerformance(metrics)
        }
      }
      catch (error) {
        console.error(chalk.red(`❌ ${name} 性能追踪失败:`), error)
      }
    }
  }

  /**
   * 追踪错误
   */
  trackError(error: Error, context?: any): void {
    if (!this.config.enableErrorTracking || !this.shouldTrack())
      return

    for (const [name, provider] of this.providers) {
      try {
        if (provider.trackError) {
          provider.trackError(error, context)
        }
      }
      catch (error) {
        console.error(chalk.red(`❌ ${name} 错误追踪失败:`), error)
      }
    }
  }

  /**
   * 设置用户 ID
   */
  setUserId(userId: string): void {
    this.userId = userId

    for (const [name, provider] of this.providers) {
      try {
        if (provider.setUserId) {
          provider.setUserId(userId)
        }
      }
      catch (error) {
        console.error(chalk.red(`❌ ${name} 设置用户ID失败:`), error)
      }
    }
  }

  /**
   * 设置用户属性
   */
  setUserProperties(properties: Record<string, any>): void {
    for (const [name, provider] of this.providers) {
      try {
        if (provider.setUserProperties) {
          provider.setUserProperties(properties)
        }
      }
      catch (error) {
        console.error(chalk.red(`❌ ${name} 设置用户属性失败:`), error)
      }
    }
  }

  /**
   * 检查是否应该追踪
   */
  private shouldTrack(): boolean {
    // 检查采样率
    if (Math.random() > this.config.sampleRate) {
      return false
    }

    // 检查隐私设置
    if (this.config.privacy.cookieConsent && !this.hasCookieConsent()) {
      return false
    }

    return true
  }

  /**
   * 检查 Cookie 同意
   */
  private hasCookieConsent(): boolean {
    if (typeof document !== 'undefined') {
      return document.cookie.includes('analytics_consent=true')
    }
    return false
  }

  /**
   * 生成会话 ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    providers: string[]
    sessionId: string
    userId?: string
    config: AnalyticsConfig
  } {
    return {
      providers: Array.from(this.providers.keys()),
      sessionId: this.sessionId,
      userId: this.userId,
      config: this.config,
    }
  }
}

/**
 * 创建分析集成实例
 */
export function createAnalyticsIntegration(
  config: AnalyticsConfig,
): AnalyticsIntegration {
  return new AnalyticsIntegration(config)
}

/**
 * 默认配置
 */
export const defaultAnalyticsConfig: AnalyticsConfig = {
  providers: [],
  enablePerformanceMonitoring: true,
  enableErrorTracking: true,
  enableUserBehaviorTracking: true,
  sampleRate: 1.0,
  privacy: {
    gdprCompliant: true,
    ccpaCompliant: true,
    cookieConsent: true,
    anonymizeData: true,
    anonymizeIP: true,
  },
}
