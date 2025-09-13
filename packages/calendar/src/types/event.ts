/**
 * 事件相关的类型定义
 */

/**
 * 事件类型
 */
export type EventType = 'event' | 'task' | 'reminder' | 'meeting' | 'holiday' | 'birthday' | 'custom'

/**
 * 事件状态
 */
export type EventStatus = 'confirmed' | 'tentative' | 'cancelled' | 'completed' | 'in-progress'

/**
 * 事件重复类型
 */
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'

/**
 * 事件重复规则
 */
export interface RecurrenceRule {
  /** 重复类型 */
  type: RecurrenceType
  
  /** 重复间隔 */
  interval?: number
  
  /** 重复结束日期 */
  endDate?: Date
  
  /** 重复次数 */
  count?: number
  
  /** 每周重复的天数（0-6，0为周日） */
  weekdays?: number[]
  
  /** 每月重复的日期 */
  monthDays?: number[]
  
  /** 每年重复的月份 */
  months?: number[]
  
  /** 自定义重复规则 */
  customRule?: string
}

/**
 * 事件提醒
 */
export interface EventReminder {
  /** 提醒ID */
  id: string
  
  /** 提醒时间（相对于事件开始时间的分钟数） */
  minutes: number
  
  /** 提醒方式 */
  method: 'popup' | 'email' | 'sms' | 'notification'
  
  /** 提醒消息 */
  message?: string
  
  /** 是否已触发 */
  triggered?: boolean
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
  email?: string
  
  /** 参与状态 */
  status: 'accepted' | 'declined' | 'tentative' | 'needs-action'
  
  /** 是否为组织者 */
  organizer?: boolean
  
  /** 是否为必需参与者 */
  required?: boolean
}

/**
 * 事件附件
 */
export interface EventAttachment {
  /** 附件ID */
  id: string
  
  /** 附件名称 */
  name: string
  
  /** 附件URL */
  url: string
  
  /** 附件类型 */
  type: string
  
  /** 附件大小（字节） */
  size?: number
}

/**
 * 日历事件
 */
export interface CalendarEvent {
  /** 事件唯一标识 */
  id: string
  
  /** 事件标题 */
  title: string
  
  /** 事件描述 */
  description?: string
  
  /** 事件开始时间 */
  start: Date
  
  /** 事件结束时间 */
  end: Date
  
  /** 是否为全天事件 */
  allDay?: boolean
  
  /** 事件类型 */
  type?: EventType
  
  /** 事件状态 */
  status?: EventStatus
  
  /** 事件颜色 */
  color?: string
  
  /** 背景颜色 */
  backgroundColor?: string
  
  /** 边框颜色 */
  borderColor?: string
  
  /** 文本颜色 */
  textColor?: string
  
  /** 事件位置 */
  location?: string
  
  /** 事件URL */
  url?: string
  
  /** 事件分类/标签 */
  categories?: string[]
  
  /** 事件优先级 */
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  
  /** 是否可编辑 */
  editable?: boolean
  
  /** 是否可拖拽 */
  draggable?: boolean
  
  /** 是否可调整大小 */
  resizable?: boolean
  
  /** 重复规则 */
  recurrence?: RecurrenceRule
  
  /** 提醒设置 */
  reminders?: EventReminder[]
  
  /** 参与者列表 */
  attendees?: EventAttendee[]
  
  /** 附件列表 */
  attachments?: EventAttachment[]
  
  /** 创建时间 */
  createdAt?: Date
  
  /** 更新时间 */
  updatedAt?: Date
  
  /** 创建者 */
  createdBy?: string
  
  /** 更新者 */
  updatedBy?: string
  
  /** 自定义数据 */
  customData?: Record<string, any>
  
  /** 自定义样式 */
  customStyle?: Partial<CSSStyleDeclaration>
  
  /** 自定义类名 */
  customClassName?: string
}

/**
 * 事件创建参数
 */
export interface CreateEventParams {
  /** 事件标题 */
  title: string
  
  /** 事件开始时间 */
  start: Date | string
  
  /** 事件结束时间 */
  end?: Date | string
  
  /** 是否为全天事件 */
  allDay?: boolean
  
  /** 事件描述 */
  description?: string
  
  /** 事件类型 */
  type?: EventType
  
  /** 事件颜色 */
  color?: string
  
  /** 事件位置 */
  location?: string
  
  /** 重复规则 */
  recurrence?: RecurrenceRule
  
  /** 提醒设置 */
  reminders?: Omit<EventReminder, 'id' | 'triggered'>[]
  
  /** 自定义数据 */
  customData?: Record<string, any>
}

/**
 * 事件更新参数
 */
export interface UpdateEventParams extends Partial<Omit<CalendarEvent, 'id' | 'createdAt' | 'createdBy'>> {}

/**
 * 事件查询参数
 */
export interface EventQueryParams {
  /** 开始日期 */
  start?: Date
  
  /** 结束日期 */
  end?: Date
  
  /** 事件类型 */
  type?: EventType | EventType[]
  
  /** 事件状态 */
  status?: EventStatus | EventStatus[]
  
  /** 搜索关键词 */
  keyword?: string
  
  /** 分类筛选 */
  categories?: string[]
  
  /** 优先级筛选 */
  priority?: ('low' | 'normal' | 'high' | 'urgent')[]
  
  /** 排序字段 */
  sortBy?: 'start' | 'end' | 'title' | 'createdAt' | 'updatedAt'
  
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc'
  
  /** 分页参数 */
  page?: number
  
  /** 每页数量 */
  pageSize?: number
}

/**
 * 事件查询结果
 */
export interface EventQueryResult {
  /** 事件列表 */
  events: CalendarEvent[]
  
  /** 总数量 */
  total: number
  
  /** 当前页 */
  page: number
  
  /** 每页数量 */
  pageSize: number
  
  /** 总页数 */
  totalPages: number
}

/**
 * 事件操作结果
 */
export interface EventOperationResult {
  /** 是否成功 */
  success: boolean
  
  /** 错误消息 */
  error?: string
  
  /** 操作的事件 */
  event?: CalendarEvent
}

/**
 * 批量事件操作参数
 */
export interface BatchEventOperation {
  /** 操作类型 */
  operation: 'create' | 'update' | 'delete'
  
  /** 事件ID列表（用于更新和删除） */
  eventIds?: string[]
  
  /** 事件数据列表（用于创建和更新） */
  events?: (CreateEventParams | UpdateEventParams)[]
}

/**
 * 批量事件操作结果
 */
export interface BatchEventOperationResult {
  /** 成功的操作数量 */
  successCount: number
  
  /** 失败的操作数量 */
  failureCount: number
  
  /** 操作结果详情 */
  results: EventOperationResult[]
  
  /** 错误列表 */
  errors: string[]
}
