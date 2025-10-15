/**
 * 仪表板模板类型定义
 */

/** 统计数据项 */
export interface DashboardStat {
  label: string
  value: string | number
  icon?: string
  trend?: 'up' | 'down' | 'neutral'
  change?: string
}

/** 菜单项 */
export interface DashboardMenuItem {
  label: string
  icon?: string
  href?: string
  onClick?: () => void
  active?: boolean
}

/** 基础仪表板模板属性 */
export interface DashboardTemplateProps {
  /** 用户名 */
  userName?: string
  /** 是否显示侧边栏 */
  showSidebar?: boolean
  /** 是否暗黑模式 */
  darkMode?: boolean
  /** 统计数据 */
  stats?: DashboardStat[]
  /** 菜单项 */
  menuItems?: DashboardMenuItem[]
  /** 退出回调 */
  onLogout?: () => void
}

/** 桌面端带侧边栏仪表板模板属性 */
export interface DashboardDesktopSidebarProps extends DashboardTemplateProps {
  /** 侧边栏宽度 */
  sidebarWidth?: 'narrow' | 'normal' | 'wide'
  /** 侧边栏是否可折叠 */
  collapsible?: boolean
  /** 侧边栏默认是否折叠 */
  defaultCollapsed?: boolean
}

/** 移动端仪表板模板属性 */
export interface DashboardMobileProps extends DashboardTemplateProps {
  /** 是否显示底部导航 */
  showBottomNav?: boolean
  /** 底部导航项 */
  bottomNavItems?: DashboardMenuItem[]
}

/** 移动端标签式仪表板模板属性 */
export interface DashboardMobileTabsProps extends DashboardMobileProps {
  /** 标签项 */
  tabs?: Array<{
    label: string
    value: string
    icon?: string
  }>
  /** 当前活跃标签 */
  activeTab?: string
  /** 标签切换回调 */
  onTabChange?: (value: string) => void
}

/** 平板端仪表板模板属性 */
export interface DashboardTabletProps extends DashboardTemplateProps {
  /** 布局模式 */
  layout?: 'portrait' | 'landscape'
  /** 是否使用紧凑布局 */
  compact?: boolean
}

/** 平板端网格布局仪表板模板属性 */
export interface DashboardTabletGridProps extends DashboardTabletProps {
  /** 网格列数 */
  columns?: 2 | 3 | 4
  /** 卡片间距 */
  gap?: 'small' | 'medium' | 'large'
}
