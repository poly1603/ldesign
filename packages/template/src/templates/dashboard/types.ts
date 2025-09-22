/**
 * Dashboard模板统一类型定义
 */

/**
 * Dashboard模板Props接口
 */
export interface DashboardTemplateProps {
  /** 应用标题 */
  title?: string
  /** Logo图片URL */
  logoUrl?: string
  
  /** 主要颜色 */
  primaryColor?: string
  /** 次要颜色 */
  secondaryColor?: string
  
  /** 是否显示侧边栏 */
  showSidebar?: boolean
  /** 是否可折叠侧边栏 */
  collapsibleSidebar?: boolean
  /** 侧边栏默认是否折叠 */
  sidebarCollapsed?: boolean
  
  /** 是否显示面包屑 */
  showBreadcrumb?: boolean
  /** 是否显示用户信息 */
  showUserInfo?: boolean
  /** 是否显示通知 */
  showNotifications?: boolean
  
  /** 是否启用动画效果 */
  enableAnimations?: boolean
  
  /** 用户信息 */
  userInfo?: {
    name?: string
    avatar?: string
    role?: string
  }
}

/**
 * Dashboard模板默认Props值
 */
export const defaultDashboardProps: Required<DashboardTemplateProps> = {
  title: '管理后台',
  logoUrl: '',
  primaryColor: 'var(--ldesign-brand-color)',
  secondaryColor: 'var(--ldesign-brand-color-6)',
  showSidebar: true,
  collapsibleSidebar: true,
  sidebarCollapsed: false,
  showBreadcrumb: true,
  showUserInfo: true,
  showNotifications: true,
  enableAnimations: true,
  userInfo: {
    name: '用户',
    avatar: '',
    role: '管理员',
  },
}

/**
 * Dashboard布局配置
 */
export interface DashboardLayoutConfig {
  /** 头部高度 */
  headerHeight: string
  /** 侧边栏宽度 */
  sidebarWidth: string
  /** 侧边栏折叠宽度 */
  sidebarCollapsedWidth: string
  /** 底部高度 */
  footerHeight: string
  /** 内容区域内边距 */
  contentPadding: string
}

/**
 * 默认布局配置
 */
export const defaultLayoutConfig: DashboardLayoutConfig = {
  headerHeight: '64px',
  sidebarWidth: '240px',
  sidebarCollapsedWidth: '64px',
  footerHeight: '48px',
  contentPadding: 'var(--ls-padding-lg)',
}
