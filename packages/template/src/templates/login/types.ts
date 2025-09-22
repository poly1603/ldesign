/**
 * 登录模板统一类型定义
 * 所有登录模板都应该使用这个统一的Props接口
 */

/**
 * 调试信息接口
 */
export interface DebugInfo {
  /** 设备类型 */
  deviceType?: string
  /** 模板名称 */
  templateName?: string
  /** 是否响应式 */
  isResponsive?: boolean
  /** 屏幕宽度 */
  screenWidth?: number
  /** 渲染模式 */
  renderMode?: string
}

/**
 * 登录模板统一Props接口
 * 所有登录模板都应该实现这个接口
 */
export interface LoginTemplateProps {
  /** 登录标题 */
  title?: string
  /** 登录副标题 */
  subtitle?: string
  /** Logo图片URL */
  logoUrl?: string
  
  /** 主要颜色 */
  primaryColor?: string
  /** 次要颜色 */
  secondaryColor?: string
  /** 背景图片URL */
  backgroundImage?: string
  
  /** 是否显示记住密码选项 */
  showRemember?: boolean
  /** 是否显示注册链接 */
  showRegister?: boolean
  /** 是否显示忘记密码链接 */
  showForgot?: boolean
  
  /** 是否启用动画效果 */
  enableAnimations?: boolean
  
  /** 调试信息 */
  debugInfo?: DebugInfo
}

/**
 * 登录模板默认Props值
 */
export const defaultLoginProps: Required<LoginTemplateProps> = {
  title: '用户登录',
  subtitle: '欢迎回来，请登录您的账户',
  logoUrl: '',
  primaryColor: 'var(--ldesign-brand-color)',
  secondaryColor: 'var(--ldesign-brand-color-6)',
  backgroundImage: '',
  showRemember: true,
  showRegister: true,
  showForgot: true,
  enableAnimations: true,
  debugInfo: {
    deviceType: 'unknown',
    templateName: 'unknown',
    isResponsive: true,
    screenWidth: 0,
    renderMode: 'normal',
  },
}

/**
 * 登录面板容器样式配置
 */
export interface LoginPanelConfig {
  /** 面板宽度 */
  width: string
  /** 面板最大宽度 */
  maxWidth: string
  /** 面板高度 */
  height: string
  /** 面板最小高度 */
  minHeight: string
  /** 面板内边距 */
  padding: string
  /** 面板圆角 */
  borderRadius: string
  /** 面板背景色 */
  backgroundColor: string
  /** 面板阴影 */
  boxShadow: string
}

/**
 * 不同设备的登录面板配置
 */
export const loginPanelConfigs: Record<string, LoginPanelConfig> = {
  desktop: {
    width: '400px',
    maxWidth: '90vw',
    height: 'auto',
    minHeight: '500px',
    padding: 'var(--ls-padding-xl)',
    borderRadius: 'var(--ls-border-radius-lg)',
    backgroundColor: 'var(--ldesign-bg-color-container)',
    boxShadow: 'var(--ldesign-shadow-3)',
  },
  mobile: {
    width: '100%',
    maxWidth: '400px',
    height: 'auto',
    minHeight: '400px',
    padding: 'var(--ls-padding-lg)',
    borderRadius: 'var(--ls-border-radius-base)',
    backgroundColor: 'var(--ldesign-bg-color-container)',
    boxShadow: 'var(--ldesign-shadow-2)',
  },
  tablet: {
    width: '450px',
    maxWidth: '80vw',
    height: 'auto',
    minHeight: '450px',
    padding: 'var(--ls-padding-xl)',
    borderRadius: 'var(--ls-border-radius-lg)',
    backgroundColor: 'var(--ldesign-bg-color-container)',
    boxShadow: 'var(--ldesign-shadow-3)',
  },
}
