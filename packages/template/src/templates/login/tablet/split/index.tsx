import { defineComponent, ref, onMounted, computed } from 'vue'
import { getSmartBackground, preloadBackground, type BackgroundImage } from '../../../../utils/background'
import { LucideIcons, getIcon } from '../../../../utils/icons'
import { getTheme, applyTheme } from '../../../../utils/theme'
import './index.less'

export default defineComponent({
  name: 'TabletSplitLoginTemplate',
  props: {
    title: {
      type: String,
      default: '用户登录',
    },
    subtitle: {
      type: String,
      default: '欢迎使用我们的平台',
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
      default: () => ['github', 'google', 'microsoft', 'apple'],
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

    // 应用主题
    const currentTheme = getTheme('classic')

    // 计算背景样式
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
          width: 1366,
          height: 1024,
          quality: 'high',
          category: 'business'
        })

        if (bg.url && !bg.url.startsWith('linear-gradient')) {
          await preloadBackground(bg.url)
        }

        backgroundImage.value = bg
      } catch (error) {
        console.warn('Failed to load background:', error)
        backgroundImage.value = {
          url: currentTheme.gradients.primary,
          title: 'Split Gradient'
        }
      } finally {
        backgroundLoading.value = false
      }
    }

    // 组件挂载时加载背景
    onMounted(() => {
      applyTheme('classic')
      loadBackground()
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
      <div class="tablet-split-login" style={backgroundStyle.value}>
        {/* 使用传递进来的模板选择器 */}
        {props.templateSelector && <div class="tablet-split-login__selector">{props.templateSelector}</div>}

        {/* 背景装饰层 */}
        <div class="tablet-split-login__background">
          <div class="tablet-split-login__split-line"></div>
          <div class="tablet-split-login__geometric-shapes">
            <div class="tablet-split-login__shape tablet-split-login__shape--triangle"></div>
            <div class="tablet-split-login__shape tablet-split-login__shape--square"></div>
            <div class="tablet-split-login__shape tablet-split-login__shape--circle"></div>
          </div>
        </div>

        {/* 背景加载指示器 */}
        {backgroundLoading.value && (
          <div class="background-loader">
            <div class="loader-spinner" innerHTML={getIcon('loader', { size: 'lg', className: 'animate-spin' })}></div>
          </div>
        )}

        <div class="tablet-split-login__left">
          <div class="tablet-split-login__brand-section">
            <div class="tablet-split-login__brand-content">
              {props.logo && (
                <div class="tablet-split-login__logo">
                  <img src={props.logo} alt="Logo" />
                  <div class="tablet-split-login__logo-frame"></div>
                </div>
              )}
              <h1 class="tablet-split-login__brand-title">{props.title}</h1>
              <p class="tablet-split-login__brand-subtitle">{props.subtitle}</p>

              <div class="tablet-split-login__features">
                <div class="tablet-split-login__feature">
                  <div class="tablet-split-login__feature-icon" innerHTML={getIcon('shield', { size: 'md' })}></div>
                  <div class="tablet-split-login__feature-text">
                    <h3>安全可靠</h3>
                    <p>企业级安全保障</p>
                  </div>
                </div>

                <div class="tablet-split-login__feature">
                  <div class="tablet-split-login__feature-icon" innerHTML={getIcon('zap', { size: 'md' })}></div>
                  <div class="tablet-split-login__feature-text">
                    <h3>高效便捷</h3>
                    <p>快速响应，流畅体验</p>
                  </div>
                </div>

                <div class="tablet-split-login__feature">
                  <div class="tablet-split-login__feature-icon" innerHTML={getIcon('star', { size: 'md' })}></div>
                  <div class="tablet-split-login__feature-text">
                    <h3>专业服务</h3>
                    <p>7x24小时技术支持</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="tablet-split-login__decoration">
              <div class="tablet-split-login__circle tablet-split-login__circle--1"></div>
              <div class="tablet-split-login__circle tablet-split-login__circle--2"></div>
              <div class="tablet-split-login__circle tablet-split-login__circle--3"></div>
            </div>
          </div>
        </div>

        <div class="tablet-split-login__right">
          {/* 使用传递进来的 LoginPanel 组件，如果没有则显示默认内容 */}
          <div class="login-panel-wrapper">
            {props.loginPanel ? (
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
            ) : (
              <div class="tablet-split-login__default-panel">
                <div class="tablet-split-login__header">
                  <h1 class="tablet-split-login__title">{props.title}</h1>
                  <p class="tablet-split-login__subtitle">{props.subtitle}</p>
                </div>

                <div class="tablet-split-login__form">
                  <div class="tablet-split-login__field">
                    <input type="text" placeholder="用户名" class="tablet-split-login__input" />
                  </div>
                  <div class="tablet-split-login__field">
                    <input type="password" placeholder="密码" class="tablet-split-login__input" />
                  </div>

                  {props.showRememberMe && (
                    <div class="tablet-split-login__options">
                      <label class="tablet-split-login__checkbox">
                        <input type="checkbox" />
                        <span>记住密码</span>
                      </label>
                      {props.showForgotPassword && (
                        <a href="#" class="tablet-split-login__forgot">
                          忘记密码？
                        </a>
                      )}
                    </div>
                  )}

                  <button class="tablet-split-login__submit">登录</button>

                  {props.showThirdPartyLogin && (
                    <div class="tablet-split-login__third-party">
                      <div class="tablet-split-login__divider">
                        <span>或</span>
                      </div>
                      <div class="tablet-split-login__providers">
                        {props.thirdPartyProviders.map((provider: string) => (
                          <button
                            key={provider}
                            class={`tablet-split-login__provider tablet-split-login__provider--${provider}`}
                          >
                            {provider === 'github' && '🐙'}
                            {provider === 'google' && '🔍'}
                            {provider === 'microsoft' && '🪟'}
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
    )
  },
})
