import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue'
import { type BackgroundImage, getSmartBackground, preloadBackground } from '../../../../utils/background'
import { getIcon } from '../../../../utils/icons'
import { applyTheme, getTheme } from '../../../../utils/theme'
import './index.less'

export default defineComponent({
  name: 'TabletAdaptiveLoginTemplate',
  props: {
    title: {
      type: String,
      default: '用户登录',
    },
    subtitle: {
      type: String,
      default: '请输入您的账户信息',
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
      default: () => ['github', 'google', 'wechat', 'apple'],
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

    // 自适应状态
    const screenWidth = ref(window.innerWidth)
    const screenHeight = ref(window.innerHeight)
    const orientation = ref(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait')
    const layoutMode = ref<'compact' | 'normal' | 'expanded'>('normal')

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
      return { background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})` }
    })

    // 计算布局模式
    const updateLayoutMode = () => {
      const width = screenWidth.value
      const _height = screenHeight.value

      if (width < 768) {
        layoutMode.value = 'compact'
      }
      else if (width > 1200) {
        layoutMode.value = 'expanded'
      }
      else {
        layoutMode.value = 'normal'
      }
    }

    // 处理窗口大小变化
    const handleResize = () => {
      screenWidth.value = window.innerWidth
      screenHeight.value = window.innerHeight
      orientation.value = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
      updateLayoutMode()
    }

    // 获取背景图片
    const loadBackground = async () => {
      try {
        backgroundLoading.value = true
        const bg = await getSmartBackground({
          width: screenWidth.value,
          height: screenHeight.value,
          quality: 'high',
          category: 'tech',
        })

        if (bg.url && !bg.url.startsWith('linear-gradient')) {
          await preloadBackground(bg.url)
        }

        backgroundImage.value = bg
      }
      catch (error) {
        console.warn('Failed to load background:', error)
        backgroundImage.value = {
          url: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
          title: 'Adaptive Gradient',
        }
      }
      finally {
        backgroundLoading.value = false
      }
    }

    // 组件挂载时初始化
    onMounted(() => {
      applyTheme(currentTheme)
      updateLayoutMode()
      loadBackground()
      window.addEventListener('resize', handleResize)
    })

    // 组件卸载时清理
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })

    // 处理登录（来自 LoginPanel 组件）
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

    return () => (
      <div
        class={[
          'tablet-adaptive-login',
          `tablet-adaptive-login--${layoutMode.value}`,
          `tablet-adaptive-login--${orientation.value}`,
        ]}
        style={backgroundStyle.value}
      >
        {/* 使用传递进来的模板选择器 */}
        {props.templateSelector && <div class="tablet-adaptive-login__selector">{props.templateSelector()}</div>}

        {/* 自适应背景装饰 */}
        <div class="tablet-adaptive-login__background">
          <div class="tablet-adaptive-login__mesh"></div>
          <div class="tablet-adaptive-login__dots">
            {Array.from({ length: layoutMode.value === 'expanded' ? 20 : layoutMode.value === 'normal' ? 15 : 10 }).map((_, i) => (
              <div
                key={i}
                class="tablet-adaptive-login__dot"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`,
                }}
              >
              </div>
            ))}
          </div>
        </div>

        {/* 背景加载指示器 */}
        {backgroundLoading.value && (
          <div class="background-loader">
            <div class="loader-spinner" innerHTML={getIcon('loader', { size: 'lg', className: 'animate-spin' })}></div>
          </div>
        )}

        {/* 屏幕信息显示（开发模式） */}
        <div class="tablet-adaptive-login__debug">
          <div class="debug-info">
            <span>
              {screenWidth.value}
              ×
              {screenHeight.value}
            </span>
            <span>{orientation.value}</span>
            <span>{layoutMode.value}</span>
          </div>
        </div>

        <div class="tablet-adaptive-login__container">
          <div class="tablet-adaptive-login__sidebar">
            <div class="tablet-adaptive-login__brand">
              {props.logo && (
                <div class="tablet-adaptive-login__logo">
                  <img src={props.logo} alt="Logo" />
                  <div class="tablet-adaptive-login__logo-pulse"></div>
                </div>
              )}
              <h1 class="tablet-adaptive-login__title">{props.title}</h1>
              <p class="tablet-adaptive-login__subtitle">{props.subtitle}</p>

              {/* 自适应特性展示 */}
              <div class="tablet-adaptive-login__features">
                <div class="tablet-adaptive-login__feature">
                  <div class="tablet-adaptive-login__feature-icon" innerHTML={getIcon('smartphone', { size: 'sm' })}></div>
                  <span>智能适配</span>
                </div>
                <div class="tablet-adaptive-login__feature">
                  <div class="tablet-adaptive-login__feature-icon" innerHTML={getIcon('monitor', { size: 'sm' })}></div>
                  <span>多屏支持</span>
                </div>
                <div class="tablet-adaptive-login__feature">
                  <div class="tablet-adaptive-login__feature-icon" innerHTML={getIcon('zap', { size: 'sm' })}></div>
                  <span>动态布局</span>
                </div>
              </div>
            </div>

            <div class="tablet-adaptive-login__illustration">
              <div class="tablet-adaptive-login__shapes">
                <div class="tablet-adaptive-login__shape tablet-adaptive-login__shape--1"></div>
                <div class="tablet-adaptive-login__shape tablet-adaptive-login__shape--2"></div>
                <div class="tablet-adaptive-login__shape tablet-adaptive-login__shape--3"></div>
              </div>
            </div>
          </div>

          <div class="tablet-adaptive-login__main">
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
                      isLoading={props.isLoading}
                      error={props.error}
                      onLogin={handleLogin}
                      onRegister={handleRegister}
                      onForgotPassword={handleForgotPassword}
                      onThirdPartyLogin={handleThirdPartyLogin}
                    />
                  )
                : (
                    <div class="tablet-adaptive-login__default-panel">
                      <div class="tablet-adaptive-login__header">
                        <h1 class="tablet-adaptive-login__title">{props.title}</h1>
                        <p class="tablet-adaptive-login__subtitle">{props.subtitle}</p>
                      </div>

                      <div class="tablet-adaptive-login__form">
                        <div class="tablet-adaptive-login__field">
                          <input type="text" placeholder="用户名" class="tablet-adaptive-login__input" />
                        </div>
                        <div class="tablet-adaptive-login__field">
                          <input type="password" placeholder="密码" class="tablet-adaptive-login__input" />
                        </div>

                        {props.showRememberMe && (
                          <div class="tablet-adaptive-login__options">
                            <label class="tablet-adaptive-login__checkbox">
                              <input type="checkbox" />
                              <span>记住密码</span>
                            </label>
                            {props.showForgotPassword && (
                              <a href="#" class="tablet-adaptive-login__forgot">
                                忘记密码？
                              </a>
                            )}
                          </div>
                        )}

                        <button class="tablet-adaptive-login__submit">登录</button>

                        {props.showThirdPartyLogin && (
                          <div class="tablet-adaptive-login__third-party">
                            <div class="tablet-adaptive-login__divider">
                              <span>或</span>
                            </div>
                            <div class="tablet-adaptive-login__providers">
                              {props.thirdPartyProviders.map((provider: string) => (
                                <button
                                  key={provider}
                                  class={`tablet-adaptive-login__provider tablet-adaptive-login__provider--${provider}`}
                                >
                                  {provider === 'github' && '🐙'}
                                  {provider === 'google' && '🔍'}
                                  {provider === 'wechat' && '💬'}
                                  {provider === 'apple' && '🍎'}
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
