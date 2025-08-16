/**
 * LoginPanel 组件类型定义
 *
 * 定义登录面板组件的所有接口、类型和配置选项
 */

// ============ 登录模式类型 ============

/** 登录模式枚举 */
export type LoginMode = 'username' | 'phone'

/** 主题模式枚举 */
export type ThemeMode = 'light' | 'dark'

/** 主题效果枚举 */
export type ThemeEffect = 'normal' | 'glass'

// ============ 表单数据类型 ============

/** 用户名登录表单数据 */
export interface UsernameLoginData {
  username: string
  password: string
  captcha: string
  rememberMe: boolean
}

/** 手机号登录表单数据 */
export interface PhoneLoginData {
  phone: string
  captcha: string
  smsCode: string
}

/** 登录数据联合类型 */
export type LoginData = UsernameLoginData | PhoneLoginData

// ============ 验证码相关类型 ============

/** 图片验证码配置 */
export interface CaptchaConfig {
  /** 验证码图片 URL */
  imageUrl: string
  /** 验证码刷新函数 */
  refresh: () => void
  /** 验证码验证函数 */
  validate: (code: string) => boolean
}

/** 短信验证码配置 */
export interface SmsCodeConfig {
  /** 发送短信验证码函数 */
  send: (phone: string, captcha: string) => Promise<boolean>
  /** 验证短信验证码函数 */
  validate: (phone: string, code: string) => boolean
  /** 倒计时时长（秒） */
  countdown: number
}

// ============ 主题配置类型 ============

/** 主题颜色配置 */
export interface ThemeColors {
  /** 主色调 */
  primary: string
  /** 次要色调 */
  secondary: string
  /** 成功色 */
  success: string
  /** 警告色 */
  warning: string
  /** 错误色 */
  error: string
  /** 背景色 */
  background: string
  /** 表面色 */
  surface: string
  /** 文本色 */
  text: string
  /** 次要文本色 */
  textSecondary: string
  /** 边框色 */
  border: string
}

/** 主题配置 */
export interface ThemeConfig {
  /** 主题模式 */
  mode: ThemeMode
  /** 主题效果 */
  effect: ThemeEffect
  /** 颜色配置 */
  colors: ThemeColors
  /** 圆角大小 */
  borderRadius: string
  /** 阴影配置 */
  boxShadow: string
  /** 毛玻璃效果配置 */
  glassEffect?: {
    backdrop: string
    opacity: number
  }
}

// ============ 组件配置类型 ============

/** 第三方登录配置 */
export interface ThirdPartyLoginConfig {
  /** 是否启用第三方登录 */
  enabled: boolean
  /** 支持的第三方平台 */
  providers: Array<{
    name: string
    icon: string
    color: string
  }>
}

/** 登录面板配置 */
export interface LoginPanelConfig {
  /** 标题 */
  title?: string
  /** 副标题 */
  subtitle?: string
  /** Logo URL */
  logo?: string
  /** 默认登录模式 */
  defaultMode?: LoginMode
  /** 是否显示记住我 */
  showRememberMe?: boolean
  /** 是否显示忘记密码 */
  showForgotPassword?: boolean
  /** 是否显示注册链接 */
  showRegisterLink?: boolean
  /** 第三方登录配置 */
  thirdPartyLogin?: ThirdPartyLoginConfig
  /** 主题配置 */
  theme?: Partial<ThemeConfig>
  /** 验证码配置 */
  captcha?: CaptchaConfig
  /** 短信验证码配置 */
  smsCode?: SmsCodeConfig
}

// ============ 组件 Props 类型 ============

/** LoginPanel 组件 Props */
export interface LoginPanelProps extends LoginPanelConfig {
  /** 加载状态 */
  loading?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义样式类名 */
  className?: string
  /** 自定义样式 */
  style?: Record<string, any>
}

// ============ 事件类型 ============

/** 登录事件数据 */
export interface LoginEvent {
  mode: LoginMode
  data: LoginData
}

/** 模式切换事件数据 */
export interface ModeChangeEvent {
  from: LoginMode
  to: LoginMode
}

/** 主题切换事件数据 */
export interface ThemeChangeEvent {
  mode: ThemeMode
  effect: ThemeEffect
}

// ============ 组件事件类型 ============

/** LoginPanel 组件事件 */
export interface LoginPanelEvents {
  /** 登录事件 */
  'login': (event: LoginEvent) => void
  /** 注册事件 */
  'register': () => void
  /** 忘记密码事件 */
  'forgot-password': () => void
  /** 第三方登录事件 */
  'third-party-login': (provider: string) => void
  /** 模式切换事件 */
  'mode-change': (event: ModeChangeEvent) => void
  /** 主题切换事件 */
  'theme-change': (event: ThemeChangeEvent) => void
  /** 验证码刷新事件 */
  'captcha-refresh': () => void
  /** 短信验证码发送事件 */
  'sms-send': (phone: string) => void
}

// ============ 表单验证类型 ============

/** 验证规则 */
export interface ValidationRule {
  required?: boolean
  pattern?: RegExp
  minLength?: number
  maxLength?: number
  validator?: (value: string) => boolean | string
}

/** 字段验证配置 */
export interface FieldValidation {
  username?: ValidationRule
  password?: ValidationRule
  phone?: ValidationRule
  captcha?: ValidationRule
  smsCode?: ValidationRule
}

/** 验证错误信息 */
export interface ValidationErrors {
  username?: string
  password?: string
  phone?: string
  captcha?: string
  smsCode?: string
}

// ============ 组件状态类型 ============

/** 倒计时状态 */
export interface CountdownState {
  /** 是否正在倒计时 */
  counting: boolean
  /** 剩余时间（秒） */
  remaining: number
  /** 倒计时定时器 ID */
  timerId?: number
}

/** 组件内部状态 */
export interface LoginPanelState {
  /** 当前登录模式 */
  currentMode: LoginMode
  /** 当前主题配置 */
  currentTheme: ThemeConfig
  /** 表单数据 */
  formData: {
    username: Partial<UsernameLoginData>
    phone: Partial<PhoneLoginData>
  }
  /** 验证错误 */
  errors: ValidationErrors
  /** 倒计时状态 */
  countdown: CountdownState
  /** 是否正在提交 */
  submitting: boolean
}
