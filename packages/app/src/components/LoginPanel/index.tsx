/**
 * LoginPanel 组件
 *
 * 现代化的登录面板组件，支持双登录模式、主题切换和优雅的交互动画
 */

import type {
  CountdownState,
  LoginData,
  LoginMode,
  LoginPanelEvents,
  LoginPanelProps,
  PhoneLoginData,
  ThemeConfig,
  UsernameLoginData,
  ValidationErrors,
} from './types'
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  watch,
} from 'vue'
import './styles.less'

// ============ 默认配置 ============

const defaultTheme: ThemeConfig = {
  mode: 'light',
  effect: 'normal',
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
  },
  borderRadius: '12px',
  boxShadow:
    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
}

// ============ 工具函数 ============

/** 生成随机验证码图片 URL */
function generateCaptchaUrl(): string {
  const timestamp = Date.now()
  const randomCode = Math.random().toString(36).substr(2, 4).toUpperCase()
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="80" height="36" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="36" fill="#f3f4f6"/>
      <text x="40" y="22" text-anchor="middle" font-family="Arial" font-size="14" fill="#374151">
        ${randomCode}
      </text>
      <!-- timestamp: ${timestamp} -->
    </svg>
  `)}`
}

/** 验证手机号格式 */
function validatePhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone)
}

/** 验证用户名格式 */
function validateUsername(username: string): boolean {
  return username.length >= 3 && username.length <= 20
}

/** 验证密码格式 */
function validatePassword(password: string): boolean {
  return password.length >= 6
}

// ============ 组件定义 ============

export const LoginPanel = defineComponent({
  name: 'LoginPanel',
  props: {
    // 基础配置
    title: {
      type: String,
      default: '用户登录',
    },
    subtitle: {
      type: String,
      default: '欢迎回来',
    },
    logo: {
      type: String,
      default: undefined,
    },
    defaultMode: {
      type: String as () => LoginMode,
      default: 'username',
    },

    // 功能开关
    showRememberMe: {
      type: Boolean,
      default: true,
    },
    showForgotPassword: {
      type: Boolean,
      default: true,
    },
    showRegisterLink: {
      type: Boolean,
      default: true,
    },

    // 第三方登录
    thirdPartyLogin: {
      type: Object,
      default: () => ({
        enabled: true,
        providers: [
          { name: 'wechat', icon: '🔗', color: '#07c160' },
          { name: 'qq', icon: '🔗', color: '#12b7f5' },
          { name: 'weibo', icon: '🔗', color: '#e6162d' },
        ],
      }),
    },

    // 主题配置
    theme: {
      type: Object,
      default: () => ({}),
    },

    // 状态
    loading: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },

    // 样式
    className: {
      type: String,
      default: '',
    },
    style: {
      type: Object,
      default: () => ({}),
    },
  },

  emits: [
    'login',
    'register',
    'forgot-password',
    'third-party-login',
    'mode-change',
    'theme-change',
    'captcha-refresh',
    'sms-send',
  ] as (keyof LoginPanelEvents)[],

  setup(props: LoginPanelProps, { emit }) {
    // ============ 响应式状态 ============

    /** 当前登录模式 */
    const currentMode = ref<LoginMode>(props.defaultMode || 'username')

    /** 当前主题配置 */
    const currentTheme = reactive<ThemeConfig>({
      ...defaultTheme,
      ...props.theme,
    })

    /** 用户名登录表单数据 */
    const usernameForm = reactive<Partial<UsernameLoginData>>({
      username: '',
      password: '',
      captcha: '',
      rememberMe: false,
    })

    /** 手机号登录表单数据 */
    const phoneForm = reactive<Partial<PhoneLoginData>>({
      phone: '',
      captcha: '',
      smsCode: '',
    })

    /** 验证错误信息 */
    const errors = reactive<ValidationErrors>({})

    /** 验证码图片 URL */
    const captchaUrl = ref<string>(generateCaptchaUrl())

    /** 短信验证码倒计时状态 */
    const countdown = reactive<CountdownState>({
      counting: false,
      remaining: 0,
      timerId: undefined,
    })

    /** 是否正在提交 */
    const submitting = ref(false)

    // ============ 计算属性 ============

    /** Tab 指示器样式 */
    const tabIndicatorStyle = computed(() => {
      const width = 50 // 每个 tab 的宽度百分比
      const left = currentMode.value === 'username' ? 0 : width
      return {
        width: `${width}%`,
        transform: `translateX(${left}%)`,
      }
    })

    /** 当前表单是否有效 */
    const isFormValid = computed(() => {
      if (currentMode.value === 'username') {
        return (
          usernameForm.username &&
          usernameForm.password &&
          usernameForm.captcha &&
          validateUsername(usernameForm.username) &&
          validatePassword(usernameForm.password)
        )
      } else {
        return (
          phoneForm.phone &&
          phoneForm.captcha &&
          phoneForm.smsCode &&
          validatePhone(phoneForm.phone)
        )
      }
    })

    /** 组件样式类名 */
    const componentClasses = computed(() => {
      return ['login-panel', props.className].filter(Boolean).join(' ')
    })

    /** 组件数据属性 */
    const componentDataAttrs = computed(() => ({
      'data-theme': currentTheme.mode,
      'data-effect': currentTheme.effect,
    }))

    // ============ 方法定义 ============

    /** 切换登录模式 */
    const switchMode = (mode: LoginMode) => {
      if (mode === currentMode.value) return

      const from = currentMode.value
      currentMode.value = mode

      // 清除错误信息
      Object.keys(errors).forEach(key => {
        delete errors[key as keyof ValidationErrors]
      })

      emit('mode-change', { from, to: mode })
    }

    // 主题切换功能已移除，通过 props 控制主题

    /** 刷新验证码 */
    const refreshCaptcha = () => {
      captchaUrl.value = generateCaptchaUrl()

      // 清除验证码输入
      if (currentMode.value === 'username') {
        usernameForm.captcha = ''
      } else {
        phoneForm.captcha = ''
      }

      emit('captcha-refresh')
    }

    /** 发送短信验证码 */
    const sendSmsCode = async () => {
      if (!phoneForm.phone || !phoneForm.captcha) {
        errors.phone = phoneForm.phone ? '' : '请输入手机号'
        errors.captcha = phoneForm.captcha ? '' : '请输入图片验证码'
        return
      }

      if (!validatePhone(phoneForm.phone)) {
        errors.phone = '手机号格式不正确'
        return
      }

      // 开始倒计时
      countdown.counting = true
      countdown.remaining = 60

      countdown.timerId = window.setInterval(() => {
        countdown.remaining--
        if (countdown.remaining <= 0) {
          countdown.counting = false
          if (countdown.timerId) {
            clearInterval(countdown.timerId)
            countdown.timerId = undefined
          }
        }
      }, 1000)

      emit('sms-send', phoneForm.phone)
    }

    /** 验证表单 */
    const validateForm = (): boolean => {
      // 清除之前的错误
      Object.keys(errors).forEach(key => {
        delete errors[key as keyof ValidationErrors]
      })

      if (currentMode.value === 'username') {
        if (!usernameForm.username) {
          errors.username = '请输入用户名'
        } else if (!validateUsername(usernameForm.username)) {
          errors.username = '用户名长度应为3-20个字符'
        }

        if (!usernameForm.password) {
          errors.password = '请输入密码'
        } else if (!validatePassword(usernameForm.password)) {
          errors.password = '密码长度至少6个字符'
        }

        if (!usernameForm.captcha) {
          errors.captcha = '请输入验证码'
        }
      } else {
        if (!phoneForm.phone) {
          errors.phone = '请输入手机号'
        } else if (!validatePhone(phoneForm.phone)) {
          errors.phone = '手机号格式不正确'
        }

        if (!phoneForm.captcha) {
          errors.captcha = '请输入图片验证码'
        }

        if (!phoneForm.smsCode) {
          errors.smsCode = '请输入短信验证码'
        }
      }

      return Object.keys(errors).length === 0
    }

    /** 提交登录 */
    const handleLogin = async () => {
      if (!validateForm() || submitting.value || props.loading) return

      submitting.value = true

      try {
        const loginData: LoginData =
          currentMode.value === 'username'
            ? (usernameForm as UsernameLoginData)
            : (phoneForm as PhoneLoginData)

        emit('login', {
          mode: currentMode.value,
          data: loginData,
        })
      } finally {
        submitting.value = false
      }
    }

    /** 处理第三方登录 */
    const handleThirdPartyLogin = (provider: string) => {
      emit('third-party-login', provider)
    }

    /** 处理注册 */
    const handleRegister = () => {
      emit('register')
    }

    /** 处理忘记密码 */
    const handleForgotPassword = () => {
      emit('forgot-password')
    }

    // ============ 生命周期 ============

    onMounted(() => {
      // 初始化验证码
      refreshCaptcha()
    })

    onUnmounted(() => {
      // 清理倒计时定时器
      if (countdown.timerId) {
        clearInterval(countdown.timerId)
      }
    })

    // ============ 监听器 ============

    watch(
      () => props.theme,
      newTheme => {
        Object.assign(currentTheme, defaultTheme, newTheme)
      },
      { deep: true }
    )

    // ============ 渲染函数 ============

    return () => (
      <div
        class={componentClasses.value}
        style={props.style}
        {...componentDataAttrs.value}
      >
        {/* 头部 */}
        {(props.title || props.subtitle || props.logo) && (
          <div class='login-panel__header'>
            {props.logo && (
              <img src={props.logo} alt='Logo' class='login-panel__logo' />
            )}
            {props.title && <h1 class='login-panel__title'>{props.title}</h1>}
            {props.subtitle && (
              <p class='login-panel__subtitle'>{props.subtitle}</p>
            )}
          </div>
        )}

        {/* Tab 切换 */}
        <div class='login-panel__tabs'>
          <button
            class={[
              'login-panel__tab',
              currentMode.value === 'username' && 'login-panel__tab--active',
            ]}
            onClick={() => switchMode('username')}
          >
            用户名登录
          </button>
          <button
            class={[
              'login-panel__tab',
              currentMode.value === 'phone' && 'login-panel__tab--active',
            ]}
            onClick={() => switchMode('phone')}
          >
            手机号登录
          </button>
          <div
            class='login-panel__tab-indicator'
            style={tabIndicatorStyle.value}
          />
        </div>

        {/* 表单内容 */}
        <div class='login-panel__content'>
          <div class='login-panel__form'>
            {/* 用户名登录表单 */}
            <div
              class={[
                'login-panel__form-panel',
                currentMode.value !== 'username' &&
                  'login-panel__form-panel--hidden',
              ]}
            >
              {/* 用户名输入 */}
              <div class='login-panel__field'>
                <label class='login-panel__label'>用户名</label>
                <input
                  type='text'
                  class={[
                    'login-panel__input',
                    errors.username && 'login-panel__input--error',
                  ]}
                  placeholder='请输入用户名'
                  v-model={usernameForm.username}
                  disabled={props.disabled || submitting.value || props.loading}
                />
                {errors.username && (
                  <div class='login-panel__error'>{errors.username}</div>
                )}
              </div>

              {/* 密码输入 */}
              <div class='login-panel__field'>
                <label class='login-panel__label'>密码</label>
                <input
                  type='password'
                  class={[
                    'login-panel__input',
                    errors.password && 'login-panel__input--error',
                  ]}
                  placeholder='请输入密码'
                  v-model={usernameForm.password}
                  disabled={props.disabled || submitting.value || props.loading}
                />
                {errors.password && (
                  <div class='login-panel__error'>{errors.password}</div>
                )}
              </div>

              {/* 图片验证码 */}
              <div class='login-panel__field'>
                <label class='login-panel__label'>验证码</label>
                <div class='login-panel__captcha-group'>
                  <input
                    type='text'
                    class={[
                      'login-panel__input',
                      'login-panel__captcha-input',
                      errors.captcha && 'login-panel__input--error',
                    ]}
                    placeholder='请输入验证码'
                    v-model={usernameForm.captcha}
                    disabled={
                      props.disabled || submitting.value || props.loading
                    }
                  />
                  <img
                    src={captchaUrl.value}
                    alt='验证码'
                    class='login-panel__captcha-image'
                    onClick={refreshCaptcha}
                  />
                </div>
                {errors.captcha && (
                  <div class='login-panel__error'>{errors.captcha}</div>
                )}
              </div>

              {/* 记住我和忘记密码 */}
              <div class='login-panel__options'>
                {props.showRememberMe && (
                  <label class='login-panel__checkbox'>
                    <input
                      type='checkbox'
                      v-model={usernameForm.rememberMe}
                      disabled={
                        props.disabled || submitting.value || props.loading
                      }
                    />
                    记住我
                  </label>
                )}
                {props.showForgotPassword && (
                  <a
                    href='#'
                    class='login-panel__link'
                    onClick={(e: Event) => {
                      e.preventDefault()
                      handleForgotPassword()
                    }}
                  >
                    忘记密码？
                  </a>
                )}
              </div>
            </div>

            {/* 手机号登录表单 */}
            <div
              class={[
                'login-panel__form-panel',
                currentMode.value !== 'phone' &&
                  'login-panel__form-panel--hidden',
              ]}
            >
              {/* 手机号输入 */}
              <div class='login-panel__field'>
                <label class='login-panel__label'>手机号</label>
                <input
                  type='tel'
                  class={[
                    'login-panel__input',
                    errors.phone && 'login-panel__input--error',
                  ]}
                  placeholder='请输入手机号'
                  v-model={phoneForm.phone}
                  disabled={props.disabled || submitting.value || props.loading}
                />
                {errors.phone && (
                  <div class='login-panel__error'>{errors.phone}</div>
                )}
              </div>

              {/* 图片验证码 */}
              <div class='login-panel__field'>
                <label class='login-panel__label'>验证码</label>
                <div class='login-panel__captcha-group'>
                  <input
                    type='text'
                    class={[
                      'login-panel__input',
                      'login-panel__captcha-input',
                      errors.captcha && 'login-panel__input--error',
                    ]}
                    placeholder='请输入验证码'
                    v-model={phoneForm.captcha}
                    disabled={
                      props.disabled || submitting.value || props.loading
                    }
                  />
                  <img
                    src={captchaUrl.value}
                    alt='验证码'
                    class='login-panel__captcha-image'
                    onClick={refreshCaptcha}
                  />
                </div>
                {errors.captcha && (
                  <div class='login-panel__error'>{errors.captcha}</div>
                )}
              </div>

              {/* 短信验证码 */}
              <div class='login-panel__field'>
                <label class='login-panel__label'>短信验证码</label>
                <div class='login-panel__sms-group'>
                  <input
                    type='text'
                    class={[
                      'login-panel__input',
                      'login-panel__sms-input',
                      errors.smsCode && 'login-panel__input--error',
                    ]}
                    placeholder='请输入短信验证码'
                    v-model={phoneForm.smsCode}
                    disabled={
                      props.disabled || submitting.value || props.loading
                    }
                  />
                  <button
                    type='button'
                    class='login-panel__sms-button'
                    onClick={sendSmsCode}
                    disabled={
                      props.disabled ||
                      submitting.value ||
                      props.loading ||
                      countdown.counting
                    }
                  >
                    {countdown.counting
                      ? `${countdown.remaining}s`
                      : '发送验证码'}
                  </button>
                </div>
                {errors.smsCode && (
                  <div class='login-panel__error'>{errors.smsCode}</div>
                )}
              </div>
            </div>

            {/* 登录按钮 */}
            <button
              type='button'
              class={[
                'login-panel__button',
                (submitting.value || props.loading) &&
                  'login-panel__button--loading',
              ]}
              onClick={handleLogin}
              disabled={
                props.disabled ||
                submitting.value ||
                props.loading ||
                !isFormValid.value
              }
            >
              {submitting.value || props.loading ? '' : '登录'}
            </button>

            {/* 第三方登录 */}
            {props.thirdPartyLogin?.enabled &&
              props.thirdPartyLogin.providers.length > 0 && (
                <>
                  <div class='login-panel__divider'>其他登录方式</div>
                  <div class='login-panel__third-party'>
                    {props.thirdPartyLogin.providers.map(provider => (
                      <button
                        key={provider.name}
                        type='button'
                        class='login-panel__third-party-button'
                        style={{ color: provider.color }}
                        onClick={() => handleThirdPartyLogin(provider.name)}
                        disabled={
                          props.disabled || submitting.value || props.loading
                        }
                      >
                        {provider.icon}
                      </button>
                    ))}
                  </div>
                </>
              )}

            {/* 注册链接 */}
            {props.showRegisterLink && (
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <span
                  style={{
                    fontSize: '14px',
                    color: 'var(--lp-text-secondary)',
                  }}
                >
                  还没有账号？
                </span>
                <a
                  href='#'
                  class='login-panel__link'
                  onClick={(e: Event) => {
                    e.preventDefault()
                    handleRegister()
                  }}
                  style={{ marginLeft: '4px' }}
                >
                  立即注册
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  },
})

export default LoginPanel

// ============ 类型导出 ============

export type {
  LoginData,
  LoginMode,
  LoginPanelEvents,
  LoginPanelProps,
  PhoneLoginData,
  ThemeEffect,
  ThemeMode,
  UsernameLoginData,
} from './types'
