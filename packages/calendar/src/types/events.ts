/**
 * 事件相关类型定义
 */

import type { Dayjs } from 'dayjs'
import type { DateInput } from './index'

/**
 * 事件优先级
 */
export type EventPriority = 'low' | 'medium' | 'high'

/**
 * 重复类型
 */
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'

/**
 * 事件状态
 */
export type EventStatus = 'confirmed' | 'tentative' | 'cancelled'

/**
 * 提醒方式
 */
export type ReminderMethod = 'popup' | 'email' | 'sms' | 'notification'

/**
 * 事件类型
 */
export type EventType = 'event' | 'task' | 'reminder' | 'birthday' | 'holiday' | 'meeting' | 'appointment'

/**
 * 重复配置
 */
export interface RepeatConfig {
  /** 重复类型 */
  type: RepeatType
  /** 重复间隔 */
  interval?: number
  /** 重复结束日期 */
  until?: DateInput
  /** 重复次数 */
  count?: number
  /** 每周重复的天数 (0-6, 0为周日) */
  byWeekday?: number[]
  /** 每月重复的日期 */
  byMonthday?: number[]
  /** 每年重复的月份 */
  byMonth?: number[]
  /** 自定义重复规则 */
  customRule?: string
}

/**
 * 提醒配置
 */
export interface ReminderConfig {
  /** 提醒ID */
  id: string
  /** 提前时间（分钟） */
  minutes: number
  /** 提醒方式 */
  method: ReminderMethod
  /** 提醒消息 */
  message?: string
  /** 是否已触发 */
  triggered?: boolean
  /** 触发时间 */
  triggerTime?: Date
}

/**
 * 事件附件
 */
export interface EventAttachment {
  /** 附件ID */
  id: string
  /** 附件名称 */
  name: string
  /** 附件类型 */
  type: string
  /** 附件大小 */
  size: number
  /** 附件URL */
  url: string
  /** 上传时间 */
  uploadTime: Date
}

/**
 * 事件参与者
 */
export interface EventAttendee {
  /** 参与者ID */
  id: string
  /** 参与者姓名 */
  name: string
  /** 参与者邮箱 */
  email: string
  /** 参与状态 */
  status: 'pending' | 'accepted' | 'declined' | 'tentative'
  /** 是否为组织者 */
  isOrganizer?: boolean
  /** 响应时间 */
  responseTime?: Date
}

/**
 * 事件位置
 */
export interface EventLocation {
  /** 位置名称 */
  name: string
  /** 详细地址 */
  address?: string
  /** 经纬度 */
  coordinates?: {
    latitude: number
    longitude: number
  }
  /** 位置类型 */
  type?: 'office' | 'home' | 'restaurant' | 'hotel' | 'other'
}

/**
 * 日历事件接口
 */
export interface CalendarEvent {
  /** 事件ID */
  id: string
  /** 事件标题 */
  title: string
  /** 开始时间 */
  start: DateInput
  /** 结束时间 */
  end?: DateInput
  /** 是否全天事件 */
  allDay?: boolean
  /** 事件描述 */
  description?: string
  /** 事件类型 */
  type?: EventType
  /** 事件颜色 */
  color?: string
  /** 背景颜色 */
  backgroundColor?: string
  /** 边框颜色 */
  borderColor?: string
  /** 文本颜色 */
  textColor?: string
  /** 事件分类 */
  category?: string
  /** 事件标签 */
  tags?: string[]
  /** 事件优先级 */
  priority?: EventPriority
  /** 事件状态 */
  status?: EventStatus
  /** 重复设置 */
  repeat?: RepeatConfig
  /** 提醒设置 */
  reminders?: ReminderConfig[]
  /** 事件位置 */
  location?: EventLocation
  /** 参与者 */
  attendees?: EventAttendee[]
  /** 附件 */
  attachments?: EventAttachment[]
  /** 自定义数据 */
  data?: Record<string, any>
  /** 是否可编辑 */
  editable?: boolean
  /** 是否可拖拽 */
  draggable?: boolean
  /** 是否可调整大小 */
  resizable?: boolean
  /** 是否可删除 */
  deletable?: boolean
  /** 创建时间 */
  createdAt?: Date
  /** 更新时间 */
  updatedAt?: Date
  /** 创建者 */
  createdBy?: string
  /** 更新者 */
  updatedBy?: string
  /** 事件来源 */
  source?: string
  /** 外部ID */
  externalId?: string
  /** 同步状态 */
  syncStatus?: 'synced' | 'pending' | 'error'
  /** 是否私有 */
  private?: boolean
  /** 事件URL */
  url?: string
  /** 时区 */
  timezone?: string
}

/**
 * 事件过滤器
 */
export interface EventFilter {
  /** 开始日期 */
  startDate?: DateInput
  /** 结束日期 */
  endDate?: DateInput
  /** 事件类型 */
  types?: EventType[]
  /** 事件分类 */
  categories?: string[]
  /** 事件标签 */
  tags?: string[]
  /** 事件优先级 */
  priorities?: EventPriority[]
  /** 事件状态 */
  statuses?: EventStatus[]
  /** 搜索关键词 */
  keyword?: string
  /** 是否包含全天事件 */
  includeAllDay?: boolean
  /** 是否包含重复事件 */
  includeRecurring?: boolean
  /** 创建者 */
  createdBy?: string
  /** 是否私有 */
  private?: boolean
}

/**
 * 事件排序选项
 */
export interface EventSortOptions {
  /** 排序字段 */
  field: 'start' | 'end' | 'title' | 'priority' | 'createdAt' | 'updatedAt'
  /** 排序方向 */
  direction: 'asc' | 'desc'
}

/**
 * 事件统计信息
 */
export interface EventStatistics {
  /** 总事件数 */
  total: number
  /** 按类型统计 */
  byType: Record<EventType, number>
  /** 按分类统计 */
  byCategory: Record<string, number>
  /** 按优先级统计 */
  byPriority: Record<EventPriority, number>
  /** 按状态统计 */
  byStatus: Record<EventStatus, number>
  /** 全天事件数 */
  allDayEvents: number
  /** 重复事件数 */
  recurringEvents: number
  /** 有提醒的事件数 */
  eventsWithReminders: number
  /** 有参与者的事件数 */
  eventsWithAttendees: number
  /** 有附件的事件数 */
  eventsWithAttachments: number
}

/**
 * 事件冲突信息
 */
export interface EventConflict {
  /** 冲突的事件 */
  events: CalendarEvent[]
  /** 冲突类型 */
  type: 'time_overlap' | 'resource_conflict' | 'location_conflict'
  /** 冲突描述 */
  description: string
  /** 冲突严重程度 */
  severity: 'low' | 'medium' | 'high'
  /** 建议解决方案 */
  suggestions?: string[]
}

/**
 * 事件模板
 */
export interface EventTemplate {
  /** 模板ID */
  id: string
  /** 模板名称 */
  name: string
  /** 模板描述 */
  description?: string
  /** 模板分类 */
  category: string
  /** 事件模板数据 */
  template: Partial<CalendarEvent>
  /** 是否为系统模板 */
  isSystem?: boolean
  /** 使用次数 */
  usageCount?: number
  /** 创建时间 */
  createdAt: Date
  /** 更新时间 */
  updatedAt: Date
}

/**
 * 事件导入/导出格式
 */
export type EventFormat = 'json' | 'ical' | 'csv' | 'excel'

/**
 * 事件导入选项
 */
export interface EventImportOptions {
  /** 导入格式 */
  format: EventFormat
  /** 是否覆盖现有事件 */
  overwrite?: boolean
  /** 是否跳过重复事件 */
  skipDuplicates?: boolean
  /** 时区转换 */
  timezone?: string
  /** 字段映射 */
  fieldMapping?: Record<string, string>
  /** 默认值 */
  defaults?: Partial<CalendarEvent>
}

/**
 * 事件导出选项
 */
export interface EventExportOptions {
  /** 导出格式 */
  format: EventFormat
  /** 导出范围 */
  dateRange?: {
    start: DateInput
    end: DateInput
  }
  /** 事件过滤器 */
  filter?: EventFilter
  /** 包含的字段 */
  fields?: (keyof CalendarEvent)[]
  /** 时区转换 */
  timezone?: string
  /** 文件名 */
  filename?: string
}

/**
 * 事件批量操作
 */
export interface EventBatchOperation {
  /** 操作类型 */
  type: 'create' | 'update' | 'delete' | 'move' | 'copy'
  /** 事件ID列表 */
  eventIds?: string[]
  /** 事件数据 */
  events?: Partial<CalendarEvent>[]
  /** 更新数据 */
  updates?: Partial<CalendarEvent>
  /** 目标日期（移动操作） */
  targetDate?: DateInput
  /** 操作选项 */
  options?: {
    /** 是否跳过错误 */
    skipErrors?: boolean
    /** 是否发送通知 */
    sendNotifications?: boolean
    /** 批量大小 */
    batchSize?: number
  }
}

/**
 * 事件同步配置
 */
export interface EventSyncConfig {
  /** 同步源 */
  source: 'google' | 'outlook' | 'apple' | 'caldav' | 'exchange' | 'custom'
  /** 同步方向 */
  direction: 'import' | 'export' | 'bidirectional'
  /** 同步间隔（分钟） */
  interval: number
  /** 是否自动同步 */
  autoSync: boolean
  /** 同步范围 */
  dateRange?: {
    start: DateInput
    end: DateInput
  }
  /** 过滤器 */
  filter?: EventFilter
  /** 认证信息 */
  credentials?: Record<string, any>
  /** 最后同步时间 */
  lastSyncTime?: Date
  /** 同步状态 */
  status: 'idle' | 'syncing' | 'error' | 'success'
  /** 错误信息 */
  error?: string
}
