/**
 * 登录模板类型定义
 */

/** 基础登录模板属性 */
export interface LoginTemplateProps {
  /** 标题 */
  title?: string
  /** 副标题 */
  subtitle?: string
  /** Logo URL */
  logo?: string
  /** 是否显示记住我 */
  showRemember?: boolean
  /** 是否显示注册链接 */
  showRegister?: boolean
  /** 是否显示忘记密码 */
  showForgotPassword?: boolean
  /** 登录回调 */
  onLogin?: (data: { username: string; password: string; remember: boolean }) => void | Promise<void>
  /** 注册回调 */
  onRegister?: () => void
  /** 忘记密码回调 */
  onForgotPassword?: () => void
}

/** 桌面端分栏式登录模板属性 */
export interface LoginDesktopSplitProps extends LoginTemplateProps {
  /** 背景图片 URL */
  backgroundImage?: string
  /** 侧边栏标题 */
  sidebarTitle?: string
  /** 侧边栏描述 */
  sidebarDescription?: string
  /** 主题色 */
  themeColor?: string
}

/** 移动端卡片式登录模板属性 */
export interface LoginMobileCardProps extends LoginTemplateProps {
  /** 卡片圆角大小 */
  borderRadius?: 'small' | 'medium' | 'large'
  /** 是否显示顶部背景 */
  showTopBackground?: boolean
  /** 是否紧凑模式 */
  compact?: boolean
}

/** 平板端登录模板属性 */
export interface LoginTabletProps extends LoginTemplateProps {
  /** 布局方向 */
  layout?: 'portrait' | 'landscape'
  /** 是否使用分栏布局 */
  useSplitLayout?: boolean
}
