import { computed, defineComponent, onMounted, ref } from 'vue'
import { type BackgroundImage, getSmartBackground, preloadBackground } from '../../../../utils/background'
import { getIcon } from '../../../../utils/icons'
import { applyTheme, getTheme } from '../../../../utils/theme'
import './index.less'

export default defineComponent({
  name: 'ModernLoginTemplate',
  props: {
    title: {
      type: String,
      default: '欢迎登录',
    },
    subtitle: {
      type: String,
      default: '开始您的数字化之旅',
    },
    logo: {
      type: String,
      default: '',
    },
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
      default: true,
    },
    thirdPartyProviders: {
      type: Array as () => string[],
      default: () => ['github', 'google', 'wechat'],
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
  },
  emits: ['login', 'register', 'forgotPassword', 'thirdPartyLogin', 'template-change'],
  setup(props: any, { emit }: any) {
    // 背景图片状态
    const backgroundImage = ref<BackgroundImage | null>(null)
    const backgroundLoading = ref(true)
    const showPassword = ref(false)

    // 应用主题
    const currentTheme = getTheme()

    // 计算背景样式
    const backgroundStyle = computed(() => {
      if (backgroundImage.value?.url) {
        if (backgroundImage.value.url.startsWith('linear-gradient')) {
          return { background: backgroundImage.value.url }
        }
        else {
          return {
            backgroundImage: `url(${backgroundImage.value.url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }
        }
      }
      const primary = currentTheme?.colors?.primary || '#3b82f6'
      const secondary = currentTheme?.colors?.secondary || '#8b5cf6'
      return { background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)` }
    })

    // 获取背景图片
    const loadBackground = async () => {
      try {
        backgroundLoading.value = true
        const bg = await getSmartBackground({
          width: 1920,
          height: 1080,
          quality: 'high',
          category: 'abstract',
        })

        if (bg.url && !bg.url.startsWith('linear-gradient')) {
          await preloadBackground(bg.url)
        }

        backgroundImage.value = bg
      }
      catch (error) {
        console.warn('Failed to load background:', error)
        const primary = currentTheme?.colors?.primary || '#3b82f6'
        const secondary = currentTheme?.colors?.secondary || '#8b5cf6'
        backgroundImage.value = {
          url: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
          title: 'Modern Gradient',
        }
      }
      finally {
        backgroundLoading.value = false
      }
    }

    // 组件挂载时加载背景
    onMounted(() => {
      applyTheme(currentTheme)
      loadBackground()
    })

    // 处理登录
    const handleLogin = (loginData: any) => {
      emit('login', loginData)
    }

    // 处理忘记密码
    const handleForgotPassword = (data?: any) => {
      emit('forgotPassword', data)
    }

    // 处理第三方登录
    const handleThirdPartyLogin = (data: any) => {
      emit('thirdPartyLogin', data)
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
      <div class="modern-login" style={backgroundStyle.value}>
        {/* 使用传递进来的模板选择器 */}
        {props.templateSelector && <div class="modern-login__selector">{props.templateSelector()}</div>}

        {/* 背景装饰层 */}
        <div class="modern-login__background">
          <div class="modern-login__particles">
            {Array.from({ length: 60 }, (_, i) => (
              <div
                key={`particle-${i}`}
                class="modern-login__particle"
                style={{
                  animationDelay: `${Math.random() * 20}s`,
                  left: `${Math.random() * 100}%`,
                  animationDuration: `${15 + Math.random() * 10}s`,
                }}
              >
              </div>
            ))}
          </div>
          <div class="modern-login__gradient-orbs">
            <div class="modern-login__orb modern-login__orb--1"></div>
            <div class="modern-login__orb modern-login__orb--2"></div>
            <div class="modern-login__orb modern-login__orb--3"></div>
          </div>
        </div>

        {/* 背景加载指示器 */}
        {backgroundLoading.value && (
          <div class="background-loader">
            <div class="loader-spinner" innerHTML={getIcon('loader', { size: 'lg', className: 'animate-spin' })}></div>
          </div>
        )}

        <div class="modern-login__container">
          <div class="modern-login__card">
            {/* 使用传递进来的 LoginPanel 组件，如果没有则显示默认内容 */}
            <div class="login-panel-wrapper">
              {props.loginPanel
                ? (
                    <props.loginPanel
                      title={props.title}
                      subtitle={props.subtitle}
                      showRememberMe={props.showRememberMe}
                      showForgotPassword={props.showForgotPassword}
                      showThirdPartyLogin={props.showThirdPartyLogin}
                      thirdPartyProviders={props.thirdPartyProviders}
                      onLogin={handleLogin}
                      onRegister={handleRegister}
                      onForgotPassword={handleForgotPassword}
                      onThirdPartyLogin={handleThirdPartyLogin}
                    />
                  )
                : (
                    <div class="modern-login__default-panel">
                      <div class="modern-login__header">
                        {props.logo && (
                          <div class="modern-login__logo">
                            <img src={props.logo} alt="Logo" />
                            <div class="modern-login__logo-glow"></div>
                          </div>
                        )}
                        <h1 class="modern-login__title">{props.title}</h1>
                        <p class="modern-login__subtitle">{props.subtitle}</p>
                      </div>

                      <div class="modern-login__form">
                        <div class="modern-login__field">
                          <div class="modern-login__field-icon" innerHTML={getIcon('user', { size: 'sm' })}></div>
                          <input type="text" placeholder="用户名或邮箱" class="modern-login__input" />
                          <div class="modern-login__field-border"></div>
                        </div>
                        <div class="modern-login__field">
                          <div class="modern-login__field-icon" innerHTML={getIcon('lock', { size: 'sm' })}></div>
                          <input
                            type={showPassword.value ? 'text' : 'password'}
                            placeholder="密码"
                            class="modern-login__input"
                          />
                          <button
                            type="button"
                            class="modern-login__password-toggle"
                            onClick={togglePasswordVisibility}
                            innerHTML={getIcon(showPassword.value ? 'eyeOff' : 'eye', { size: 'sm' })}
                          >
                          </button>
                          <div class="modern-login__field-border"></div>
                        </div>

                        <div class="modern-login__options">
                          {props.showRememberMe && (
                            <label class="modern-login__checkbox">
                              <input type="checkbox" />
                              <div class="modern-login__checkbox-mark"></div>
                              <span>记住密码</span>
                            </label>
                          )}
                          {props.showForgotPassword && (
                            <a
                              href="#"
                              class="modern-login__forgot"
                              onClick={(e: Event) => {
                                e.preventDefault()
                                handleForgotPassword()
                              }}
                            >
                              <div class="modern-login__forgot-icon" innerHTML={getIcon('shield', { size: 'xs' })}></div>
                              <span>忘记密码？</span>
                            </a>
                          )}
                        </div>

                        <button class="modern-login__submit" onClick={handleLogin}>
                          <span>立即登录</span>
                          <div class="modern-login__submit-icon" innerHTML={getIcon('zap', { size: 'sm' })}></div>
                          <div class="modern-login__submit-glow"></div>
                        </button>

                        {props.showThirdPartyLogin && (
                          <div class="modern-login__third-party">
                            <div class="modern-login__divider">
                              <span>或使用以下方式登录</span>
                            </div>
                            <div class="modern-login__providers">
                              {props.thirdPartyProviders.map((provider: string) => (
                                <button
                                  key={provider}
                                  class={`modern-login__provider modern-login__provider--${provider}`}
                                  onClick={() => handleThirdPartyLogin({ provider })}
                                >
                                  <div class="modern-login__provider-icon" innerHTML={getIcon(provider as any, { size: 'sm' })}></div>
                                  <span class="modern-login__provider-name">
                                    {provider === 'github' && 'GitHub'}
                                    {provider === 'google' && 'Google'}
                                    {provider === 'wechat' && '微信'}
                                  </span>
                                  <div class="modern-login__provider-glow"></div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
            </div>
          </div>
        </div>
      </div>
    )
  },
})
