import { defineComponent, ref, reactive, onMounted, computed } from 'vue'
import { getSmartBackground, preloadBackground, type BackgroundImage } from '../../../../utils/background'
import { LucideIcons, getIcon } from '../../../../utils/icons'
import { getTheme, applyTheme } from '../../../../utils/theme'
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

    // 新增：LoginPanel 组件实例
    loginPanel: {
      type: Object,
      default: null,
    },
    // 新增：模板选择器组件
    templateSelector: {
      type: Object,
      default: null,
    },

    // 语言切换
    languageToggle: {
      type: Object,
      default: () => null,
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

    // 背景图片状态
    const backgroundImage = ref<BackgroundImage | null>(null)
    const backgroundLoading = ref(true)
    const showPassword = ref(false)

    // 应用主题
    const currentTheme = getTheme('default')

    // 计算属性
    const backgroundStyle = computed(() => {
      if (backgroundImage.value?.url) {
        if (backgroundImage.value.url.startsWith('linear-gradient')) {
          return { background: backgroundImage.value.url }
        } else {
          return {
            backgroundImage: `url(${backgroundImage.value.url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }
        }
      }
      return { background: currentTheme.gradients.primary }
    })

    // 获取背景图片
    const loadBackground = async () => {
      try {
        backgroundLoading.value = true
        const bg = await getSmartBackground({
          width: 1920,
          height: 1080,
          quality: 'high',
          category: 'nature'
        })

        if (bg.url && !bg.url.startsWith('linear-gradient')) {
          await preloadBackground(bg.url)
        }

        backgroundImage.value = bg
      } catch (error) {
        console.warn('Failed to load background:', error)
        backgroundImage.value = {
          url: currentTheme.gradients.primary,
          title: 'Default Gradient'
        }
      } finally {
        backgroundLoading.value = false
      }
    }

    // 组件挂载时加载背景
    onMounted(() => {
      applyTheme('default')
      loadBackground()
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

    // 切换密码显示状态
    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value
    }
    return () => (
      <div class="default-login-template" style={backgroundStyle.value}>
        {/* 自动注入的模板选择器 */}
        {props.templateSelector && (
          <div class="default-login__selector">
            {props.templateSelector()}
          </div>
        )}

        {/* 背景装饰层 */}
        <div class="background-decoration">
          <div class="decoration-circle decoration-circle--1"></div>
          <div class="decoration-circle decoration-circle--2"></div>
          <div class="decoration-circle decoration-circle--3"></div>
          <div class="decoration-grid"></div>
        </div>

        {/* 背景加载指示器 */}
        {backgroundLoading.value && (
          <div class="background-loader">
            <div class="loader-spinner" innerHTML={getIcon('loader', { size: 'lg', className: 'animate-spin' })}></div>
          </div>
        )}

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
                  <div class="error-icon" innerHTML={getIcon('x', { size: 'sm', color: '#dc2626' })}></div>
                  <span class="error-text">{props.error}</span>
                </div>
              )}

              <form class="login-form" onSubmit={handleSubmit}>
                <div class="form-group">
                  <label for="username" class="form-label">
                    <div class="label-content">
                      <div class="label-icon" innerHTML={getIcon('user', { size: 'sm' })}></div>
                      <span>{props.usernameLabel}</span>
                    </div>
                  </label>
                  <div class="input-wrapper">
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
                </div>

                <div class="form-group">
                  <label for="password" class="form-label">
                    <div class="label-content">
                      <div class="label-icon" innerHTML={getIcon('lock', { size: 'sm' })}></div>
                      <span>{props.passwordLabel}</span>
                    </div>
                  </label>
                  <div class="input-wrapper">
                    <input
                      id="password"
                      type={showPassword.value ? 'text' : 'password'}
                      class="form-input"
                      placeholder={props.passwordLabel}
                      v-model={formData.password}
                      required
                      disabled={props.isLoading}
                    />
                    <button
                      type="button"
                      class="password-toggle"
                      onClick={togglePasswordVisibility}
                      disabled={props.isLoading}
                      innerHTML={getIcon(showPassword.value ? 'eyeOff' : 'eye', { size: 'sm' })}
                    ></button>
                  </div>
                </div>

                <button
                  type="submit"
                  class={['btn', 'btn-primary', 'btn-lg', { 'btn-loading': props.isLoading }]}
                  disabled={props.isLoading || !formData.username || !formData.password}
                >
                  {props.isLoading ? (
                    <div class="btn-content">
                      <div class="btn-icon" innerHTML={getIcon('loader', { size: 'sm', className: 'animate-spin' })}></div>
                      <span>登录中...</span>
                    </div>
                  ) : (
                    <div class="btn-content">
                      <span>{props.loginButtonText}</span>
                    </div>
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
                    <div class="link-content">
                      <div class="link-icon" innerHTML={getIcon('shield', { size: 'xs' })}></div>
                      <span>{props.forgotPasswordText}</span>
                    </div>
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
                  <div class="link-content">
                    <div class="link-icon" innerHTML={getIcon('user', { size: 'xs' })}></div>
                    <span>还没有账号？立即注册</span>
                  </div>
                </a>
              </div>

              {props.testAccount?.show && (
                <div class="test-account-info">
                  <div class="test-account-header">
                    <div class="test-account-icon" innerHTML={getIcon('shield', { size: 'sm' })}></div>
                    <h4>{props.testAccount.title}</h4>
                  </div>
                  <div class="test-account-content">
                    <p>
                      <span class="account-label">用户名:</span>
                      <code>{props.testAccount.username}</code>
                    </p>
                    <p>
                      <span class="account-label">密码:</span>
                      <code>{props.testAccount.password}</code>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  },
})
