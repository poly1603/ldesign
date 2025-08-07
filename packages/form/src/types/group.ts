// 分组相关类型定义

import type { FormItemConfig } from './field'
import type { ThemeConfig } from './theme'

/**
 * 表单分组配置
 */
export interface FormGroupConfig {
  /** 分组名称 */
  name: string

  /** 分组标题 */
  title?: string

  /** 分组描述 */
  description?: string

  /** 是否可折叠 */
  collapsible?: boolean

  /** 默认是否折叠 */
  collapsed?: boolean

  /** 分组内的字段配置 */
  fields: FormItemConfig[]

  /** 分组图标 */
  icon?: string

  /** 分组顺序 */
  order?: number

  /** 分组样式配置 */
  style?: GroupStyleConfig

  /** 分组主题配置 */
  theme?: Partial<ThemeConfig>

  /** 分组布局配置 */
  layout?: GroupLayoutConfig

  /** 分组验证配置 */
  validation?: GroupValidationConfig

  /** 分组条件显示 */
  condition?: GroupConditionConfig

  /** 自定义CSS类名 */
  className?: string

  /** 分组扩展属性 */
  extra?: Record<string, any>
}

/**
 * 分组样式配置
 */
export interface GroupStyleConfig {
  /** 分组背景色 */
  background?: string

  /** 分组边框 */
  border?: string

  /** 分组圆角 */
  borderRadius?: string

  /** 分组内边距 */
  padding?: string

  /** 分组外边距 */
  margin?: string

  /** 分组阴影 */
  boxShadow?: string

  /** 标题样式 */
  title?: GroupTitleStyleConfig

  /** 内容样式 */
  content?: GroupContentStyleConfig
}

/**
 * 分组标题样式配置
 */
export interface GroupTitleStyleConfig {
  /** 标题背景色 */
  background?: string

  /** 标题颜色 */
  color?: string

  /** 标题字体大小 */
  fontSize?: string

  /** 标题字体粗细 */
  fontWeight?: number

  /** 标题内边距 */
  padding?: string

  /** 标题边框 */
  border?: string

  /** 标题高度 */
  height?: string

  /** 标题对齐方式 */
  textAlign?: 'left' | 'center' | 'right'
}

/**
 * 分组内容样式配置
 */
export interface GroupContentStyleConfig {
  /** 内容背景色 */
  background?: string

  /** 内容内边距 */
  padding?: string

  /** 内容边框 */
  border?: string

  /** 内容最大高度 */
  maxHeight?: string

  /** 内容溢出处理 */
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto'
}

/**
 * 分组布局配置
 */
export interface GroupLayoutConfig {
  /** 分组列数 */
  columns?: number

  /** 分组最小列宽 */
  minColumnWidth?: number

  /** 分组水平间距 */
  horizontalGap?: number

  /** 分组垂直间距 */
  verticalGap?: number

  /** 分组标题位置 */
  titlePosition?: GroupTitlePosition

  /** 分组展开动画 */
  animation?: GroupAnimationConfig
}

/**
 * 分组标题位置
 */
export type GroupTitlePosition = 'top' | 'left' | 'right'

/**
 * 分组动画配置
 */
export interface GroupAnimationConfig {
  /** 动画持续时间 */
  duration?: number

  /** 动画缓动函数 */
  easing?: string

  /** 是否启用动画 */
  enabled?: boolean

  /** 动画类型 */
  type?: GroupAnimationType
}

/**
 * 分组动画类型
 */
export type GroupAnimationType = 'slide' | 'fade' | 'scale' | 'none'

/**
 * 分组验证配置
 */
export interface GroupValidationConfig {
  /** 是否独立验证 */
  independent?: boolean

  /** 验证顺序 */
  order?: number

  /** 验证条件 */
  condition?: (
    groupData: Record<string, any>,
    formData: Record<string, any>
  ) => boolean

  /** 自定义验证函数 */
  validator?: (
    groupData: Record<string, any>,
    formData: Record<string, any>
  ) => Promise<boolean | string>
}

/**
 * 分组条件配置
 */
export interface GroupConditionConfig {
  /** 依赖的字段名 */
  dependsOn: string | string[]

  /** 条件判断函数 */
  condition: (values: Record<string, any>) => boolean

  /** 动态配置函数 */
  render?: (values: Record<string, any>) => Partial<FormGroupConfig>
}

/**
 * 分组状态
 */
export interface GroupState {
  /** 分组名称 */
  name: string

  /** 是否展开 */
  expanded: boolean

  /** 是否可见 */
  visible: boolean

  /** 分组数据 */
  data: Record<string, any>

  /** 分组错误 */
  errors: Record<string, string[]>

  /** 是否有效 */
  valid: boolean

  /** 是否正在验证 */
  validating: boolean

  /** 是否已修改 */
  dirty: boolean

  /** 字段状态 */
  fieldStates: Record<string, any>
}

/**
 * 分组管理器接口
 */
export interface GroupManager {
  /** 添加分组 */
  addGroup(group: FormGroupConfig): void

  /** 移除分组 */
  removeGroup(name: string): void

  /** 获取分组 */
  getGroup(name: string): FormGroupConfig | undefined

  /** 获取所有分组 */
  getAllGroups(): FormGroupConfig[]

  /** 展开分组 */
  expandGroup(name: string): void

  /** 收起分组 */
  collapseGroup(name: string): void

  /** 切换分组展开状态 */
  toggleGroup(name: string): void

  /** 获取分组状态 */
  getGroupState(name: string): GroupState | undefined

  /** 设置分组状态 */
  setGroupState(name: string, state: Partial<GroupState>): void

  /** 验证分组 */
  validateGroup(name: string): Promise<boolean>

  /** 获取分组数据 */
  getGroupData(name: string): Record<string, any>

  /** 设置分组数据 */
  setGroupData(name: string, data: Record<string, any>): void

  /** 重置分组 */
  resetGroup(name: string): void

  /** 清空所有分组 */
  clear(): void
}

/**
 * 分组事件
 */
export interface GroupEvents {
  /** 分组展开事件 */
  expand: (name: string) => void

  /** 分组收起事件 */
  collapse: (name: string) => void

  /** 分组数据变化事件 */
  dataChange: (name: string, data: Record<string, any>) => void

  /** 分组验证事件 */
  validate: (name: string, result: boolean) => void

  /** 分组状态变化事件 */
  stateChange: (name: string, state: GroupState) => void

  /** 分组添加事件 */
  add: (group: FormGroupConfig) => void

  /** 分组移除事件 */
  remove: (name: string) => void
}
