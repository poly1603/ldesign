/**
 * 通知管理类型定义
 * 包含通知管理器、通知类型等相关类型
 */

import type {
  NotificationAnimation,
  NotificationPosition,
  NotificationTheme,
  NotificationType,
} from './base'

// 通知管理器接口
export interface NotificationManager {
  show: (notification: NotificationOptions) => string
  hide: (id: string) => void
  hideAll: () => void
  update: (id: string, options: Partial<NotificationOptions>) => void
  get: (id: string) => EngineNotification | undefined
  getAll: () => EngineNotification[]
  clear: () => void
  setDefaultOptions: (options: Partial<NotificationOptions>) => void
  getDefaultOptions: () => Partial<NotificationOptions>
  destroy: () => void
  setPosition: (position: NotificationPosition) => void
  getPosition: () => NotificationPosition
  setTheme: (theme: NotificationTheme) => void
  getTheme: () => NotificationTheme
  setMaxNotifications: (max: number) => void
  getMaxNotifications: () => number
  setDefaultDuration: (duration: number) => void
  getDefaultDuration: () => number
  getStats: () => Record<string, unknown>
}

// 通知进度
export interface NotificationProgress {
  value: number
  max: number
  label?: string
  showText?: boolean
  color?: string
}

// 通知选项
export interface NotificationOptions {
  type?: NotificationType
  title?: string
  content?: string
  message?: string
  position?: NotificationPosition
  duration?: number
  animation?: NotificationAnimation
  theme?: NotificationTheme
  icon?: string
  actions?: NotificationAction[]
  closable?: boolean
  showClose?: boolean
  persistent?: boolean
  group?: string
  priority?: number
  metadata?: Record<string, unknown>
  progress?: NotificationProgress
  allowHTML?: boolean
  onClick?: () => void
  onShow?: () => void
  onClose?: () => void
  style?: Record<string, string>
  className?: string
  maxWidth?: number
  zIndex?: number
}

// 通知实例
export interface EngineNotification {
  id: string
  title: string
  message?: string
  type: NotificationType
  position: NotificationPosition
  duration: number
  animation: NotificationAnimation
  theme: NotificationTheme
  icon?: string
  actions: NotificationAction[]
  closable: boolean
  persistent: boolean
  group?: string
  priority: number
  metadata?: Record<string, unknown>
  timestamp: number
  isVisible: boolean
  isAnimating: boolean
  showProgress?: boolean
  progress?: NotificationProgress
  createdAt?: number
  visible?: boolean
  element?: HTMLElement
  timeoutId?: number
}

// 通知操作
export interface NotificationAction {
  label: string
  action: () => void
  handler?: () => void
  type?: 'primary' | 'secondary' | 'danger'
  style?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  loading?: boolean
}

// 通知组
export interface NotificationGroup {
  id: string
  name: string
  notifications: EngineNotification[]
  maxCount: number
  position: NotificationPosition
  theme: NotificationTheme
  autoCollapse: boolean
  showCount: boolean
}

// 通知模板
export interface NotificationTemplate {
  id: string
  name: string
  options: Partial<NotificationOptions>
  variables: string[]
  description?: string
  category?: string
}

// 通知历史
export interface NotificationHistory {
  notifications: EngineNotification[]
  maxSize: number
  autoCleanup: boolean
  cleanupInterval: number
  export: () => NotificationHistoryExport
  clear: () => void
  search: (query: string) => EngineNotification[]
  filter: (criteria: NotificationFilterCriteria) => EngineNotification[]
}

// 通知历史导出
export interface NotificationHistoryExport {
  notifications: EngineNotification[]
  exportTime: number
  totalCount: number
  format: 'json' | 'csv' | 'html'
}

// 通知过滤器条件
export interface NotificationFilterCriteria {
  type?: NotificationType
  position?: NotificationPosition
  theme?: NotificationTheme
  group?: string
  dateRange?: {
    start: Date
    end: Date
  }
  priority?: number
  hasActions?: boolean
  isPersistent?: boolean
}

// 通知统计
export interface NotificationStats {
  total: number
  byType: Record<NotificationType, number>
  byPosition: Record<NotificationPosition, number>
  byTheme: Record<NotificationTheme, number>
  byGroup: Record<string, number>
  averageDuration: number
  clickRate: number
  dismissRate: number
}

// 通知分析器
export interface NotificationAnalyzer {
  analyze: (notifications: EngineNotification[]) => NotificationAnalysis
  getStats: () => NotificationStats
  identifyTrends: () => NotificationTrend[]
  suggestImprovements: () => string[]
  compare: (
    period1: EngineNotification[],
    period2: EngineNotification[]
  ) => NotificationComparison
}

// 通知分析结果
export interface NotificationAnalysis {
  stats: NotificationStats
  trends: NotificationTrend[]
  patterns: NotificationPattern[]
  recommendations: string[]
  userBehavior: NotificationUserBehavior
}

// 通知趋势
export interface NotificationTrend {
  metric: string
  direction: 'increasing' | 'decreasing' | 'stable'
  change: number
  period: string
  significance: number
}

// 通知模式
export interface NotificationPattern {
  name: string
  description: string
  frequency: number
  impact: 'positive' | 'negative' | 'neutral'
  suggestions: string[]
}

// 通知用户行为
export interface NotificationUserBehavior {
  averageReadTime: number
  actionRate: number
  dismissRate: number
  favoriteTypes: NotificationType[]
  preferredPositions: NotificationPosition[]
  activeHours: number[]
}

// 通知比较结果
export interface NotificationComparison {
  improved: string[]
  degraded: string[]
  unchanged: string[]
  overallChange: number
  insights: string[]
}

// 通知配置
export interface NotificationConfig {
  enabled: boolean
  defaultDuration: number
  maxNotifications: number
  maxGroups: number
  autoHide: boolean
  sound: boolean
  vibration: boolean
  desktop: boolean
  mobile: boolean
  accessibility: boolean
}
