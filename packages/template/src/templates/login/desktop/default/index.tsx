import { defineComponent, ref, reactive } from 'vue'
import './index.less'

export default defineComponent({
  name: 'DefaultLoginTemplate',
  props: {
    // 基础属性
    title: {
      type: String,
      default: '登录',
    },
    subtitle: {
      type: String,
      default: '请输入您的账号信息',
    },
    logo: {
      type: String,
      default: '',
    },

    // 状态属性
    isLoading: {
      type: Boolean,
      default: false,
    },
    error: {
      type: String,
      default: null,
    },

    // 表单数据
    username: {
      type: String,
      default: '',
    },
    password: {
      type: String,
      default: '',
    },
    rememberMe: {
      type: Boolean,
      default: false,
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
    showThirdPartyLogin: {
      type: Boolean,
      default: false,
    },

    // 国际化文本
    usernameLabel: {
      type: String,
      default: '用户名',
    },
    passwordLabel: {
      type: String,
      default: '密码',
    },
    rememberMeLabel: {
      type: String,
      default: '记住密码',
    },
    loginButtonText: {
      type: String,
      default: '登录',
    },
    forgotPasswordText: {
      type: String,
      default: '忘记密码？',
    },

    // 第三方登录
    thirdPartyProviders: {
      type: Array,
      default: () => [],
    },

    // 测试账号信息
    testAccount: {
      type: Object,
      default: () => ({
        show: false,
        title: '测试账号',
        username: 'admin',
        password: 'admin',
      }),
    },

    // 语言切换
    languageToggle: {
      type: Object,
      default: () => null,
    },

    // 登录面板组件
    loginPanel: {
      type: Object,
      default: null,
    },
  },
  emits: [
    'login',
    'register',
    'forgot-password',
    'third-party-login',
    'update:username',
    'update:password',
    'update:rememberMe',
  ],
  setup(props: any, { emit }: any) {
    // 本地表单状态
    const formData = reactive({
      username: props.username || '',
      password: props.password || '',
      rememberMe: props.rememberMe || false,
    })

    // 处理登录（来自 LoginPanel 组件）
    const handleLogin = (loginData: any) => {
      emit('login', loginData)
    }

    // 处理表单提交（默认表单）
    const handleSubmit = (e: Event) => {
      e.preventDefault()

      if (!formData.username || !formData.password) {
        return
      }

      emit('login', {
        username: formData.username,
        password: formData.password,
        rememberMe: formData.rememberMe,
      })
    }

    // 处理忘记密码
    const handleForgotPassword = (data?: any) => {
      emit(
        'forgot-password',
        data || {
          username: formData.username,
        }
      )
    }

    // 处理第三方登录
    const handleThirdPartyLogin = (data: any) => {
      emit('third-party-login', data)
    }

    // 处理注册
    const handleRegister = () => {
      emit('register')
    }
    return () => (
      <div class="default-login-template">
        <div class="login-container">
          {/* 如果有 loginPanel 组件，则使用它 */}
          {props.loginPanel ? (
            <props.loginPanel
              title={props.title}
              subtitle={props.subtitle}
              showRememberMe={props.showRememberMe}
              showForgotPassword={props.showForgotPassword}
              showThirdPartyLogin={props.showThirdPartyLogin}
              isLoading={props.isLoading}
              error={props.error}
              onLogin={handleLogin}
              onRegister={handleRegister}
              onForgotPassword={handleForgotPassword}
              onThirdPartyLogin={handleThirdPartyLogin}
            />
          ) : (
            /* 默认的简单登录表单 */
            <div class="login-card">
              <div class="login-header">
                {props.logo && (
                  <div class="logo">
                    <img src={props.logo} alt="Logo" />
                  </div>
                )}
                <h1 class="title">{props.title}</h1>
                <p class="subtitle">{props.subtitle}</p>
              </div>

              {props.error && (
                <div class="error-message">
                  <span class="error-icon">❌</span>
                  <span class="error-text">{props.error}</span>
                </div>
              )}

              <form class="login-form" onSubmit={handleSubmit}>
                <div class="form-group">
                  <label for="username" class="form-label">
                    {props.usernameLabel}
                  </label>
                  <input
                    id="username"
                    type="text"
                    class="form-input"
                    placeholder={props.usernameLabel}
                    v-model={formData.username}
                    required
                    disabled={props.isLoading}
                  />
                </div>

                <div class="form-group">
                  <label for="password" class="form-label">
                    {props.passwordLabel}
                  </label>
                  <input
                    id="password"
                    type="password"
                    class="form-input"
                    placeholder={props.passwordLabel}
                    v-model={formData.password}
                    required
                    disabled={props.isLoading}
                  />
                </div>

                <button
                  type="submit"
                  class={['btn', 'btn-primary', 'btn-lg', { 'btn-loading': props.isLoading }]}
                  disabled={props.isLoading || !formData.username || !formData.password}
                >
                  {props.isLoading ? (
                    <>
                      <span class="loading-spinner"></span>
                      <span>登录中...</span>
                    </>
                  ) : (
                    props.loginButtonText
                  )}
                </button>
              </form>

              <div class="login-footer">
                {props.showForgotPassword && (
                  <a
                    href="#"
                    class="forgot-password"
                    onClick={(e: Event) => {
                      e.preventDefault()
                      handleForgotPassword()
                    }}
                  >
                    {props.forgotPasswordText}
                  </a>
                )}
                <a
                  href="#"
                  class="register-link"
                  onClick={(e: Event) => {
                    e.preventDefault()
                    handleRegister()
                  }}
                >
                  还没有账号？立即注册
                </a>
              </div>

              {props.testAccount?.show && (
                <div class="test-account-info">
                  <h4>{props.testAccount.title}</h4>
                  <p>
                    用户名: <code>{props.testAccount.username}</code>
                  </p>
                  <p>
                    密码: <code>{props.testAccount.password}</code>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  },
})
