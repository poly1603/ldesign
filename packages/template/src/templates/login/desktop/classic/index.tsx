import { defineComponent, ref, onMounted, computed } from 'vue'
import { getSmartBackground, preloadBackground, type BackgroundImage } from '../../../../utils/background'
import { LucideIcons, getIcon } from '../../../../utils/icons'
import { getTheme, applyTheme } from '../../../../utils/theme'
import './index.less'

export default defineComponent({
  name: 'ClassicLoginTemplate',
  props: {
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
      default: '',
    },
    backgroundImage: {
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

    // 应用主题
    const currentTheme = getTheme('classic')

    // 计算背景样式
    const backgroundStyle = computed(() => {
      if (props.backgroundImage) {
        return {
          backgroundImage: `url(${props.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }
      }

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
      if (props.backgroundImage) {
        backgroundLoading.value = false
        return
      }

      try {
        backgroundLoading.value = true
        const bg = await getSmartBackground({
          width: 1920,
          height: 1080,
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
          title: 'Classic Gradient'
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
      <div class="classic-login" style={backgroundStyle.value}>
        {/* 使用传递进来的模板选择器 */}
        {props.templateSelector && <div class="classic-login__selector">{props.templateSelector}</div>}

        {/* 背景遮罩层 */}
        <div class="classic-login__overlay"></div>

        {/* 背景加载指示器 */}
        {backgroundLoading.value && (
          <div class="background-loader">
            <div class="loader-spinner" innerHTML={getIcon('loader', { size: 'lg', className: 'animate-spin' })}></div>
          </div>
        )}

        <div class="classic-login__container">
          <div class="classic-login__left">
            <div class="classic-login__brand">
              {props.logo && (
                <div class="classic-login__logo">
                  <img src={props.logo} alt="Logo" />
                </div>
              )}
              <h1 class="classic-login__title">{props.title}</h1>
              <p class="classic-login__subtitle">{props.subtitle}</p>
            </div>

            <div class="classic-login__features">
              <div class="classic-login__feature">
                <div class="classic-login__feature-icon" innerHTML={getIcon('shield', { size: 'lg' })}></div>
                <div class="classic-login__feature-content">
                  <h3>安全可靠</h3>
                  <p>企业级安全保障，数据加密传输</p>
                </div>
              </div>
              <div class="classic-login__feature">
                <div class="classic-login__feature-icon" innerHTML={getIcon('zap', { size: 'lg' })}></div>
                <div class="classic-login__feature-content">
                  <h3>高效便捷</h3>
                  <p>快速登录，一键访问所有功能</p>
                </div>
              </div>
              <div class="classic-login__feature">
                <div class="classic-login__feature-icon" innerHTML={getIcon('star', { size: 'lg' })}></div>
                <div class="classic-login__feature-content">
                  <h3>专业服务</h3>
                  <p>7x24小时技术支持，专业团队服务</p>
                </div>
              </div>
            </div>

            <div class="classic-login__illustration">
              <div class="classic-login__browser">
                <div class="classic-login__browser-header">
                  <div class="classic-login__browser-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <div class="classic-login__browser-url">
                    <div class="classic-login__url-bar">
                      <div class="classic-login__url-icon" innerHTML={getIcon('shield', { size: 'xs' })}></div>
                      <span>https://secure.example.com</span>
                    </div>
                  </div>
                </div>
                <div class="classic-login__browser-content">
                  <div class="classic-login__chart">
                    <div class="classic-login__chart-bar" style="height: 60%"></div>
                    <div class="classic-login__chart-bar" style="height: 80%"></div>
                    <div class="classic-login__chart-bar" style="height: 40%"></div>
                    <div class="classic-login__chart-bar" style="height: 90%"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="classic-login__right">
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
                  onLogin={handleLogin}
                  onRegister={handleRegister}
                  onForgotPassword={handleForgotPassword}
                  onThirdPartyLogin={handleThirdPartyLogin}
                />
              ) : (
                <div class="classic-login__default-panel">
                  <div class="classic-login__header">
                    <div class="classic-login__header-icon" innerHTML={getIcon('user', { size: 'xl' })}></div>
                    <h1 class="classic-login__panel-title">登录账户</h1>
                    <p class="classic-login__panel-subtitle">请输入您的登录凭据</p>
                  </div>

                  <div class="classic-login__form">
                    <div class="classic-login__field">
                      <div class="classic-login__field-icon" innerHTML={getIcon('user', { size: 'sm' })}></div>
                      <input type="text" placeholder="用户名或邮箱" class="classic-login__input" />
                    </div>
                    <div class="classic-login__field">
                      <div class="classic-login__field-icon" innerHTML={getIcon('lock', { size: 'sm' })}></div>
                      <input type="password" placeholder="密码" class="classic-login__input" />
                    </div>

                    <div class="classic-login__options">
                      {props.showRememberMe && (
                        <label class="classic-login__checkbox">
                          <input type="checkbox" />
                          <div class="classic-login__checkbox-mark"></div>
                          <span>记住密码</span>
                        </label>
                      )}
                      {props.showForgotPassword && (
                        <a href="#" class="classic-login__forgot">
                          <div class="classic-login__forgot-icon" innerHTML={getIcon('shield', { size: 'xs' })}></div>
                          <span>忘记密码？</span>
                        </a>
                      )}
                    </div>

                    <button class="classic-login__submit">
                      <span>立即登录</span>
                      <div class="classic-login__submit-icon" innerHTML={getIcon('check', { size: 'sm' })}></div>
                    </button>

                    {props.showThirdPartyLogin && (
                      <div class="classic-login__third-party">
                        <div class="classic-login__divider">
                          <span>或使用以下方式登录</span>
                        </div>
                        <div class="classic-login__providers">
                          {props.thirdPartyProviders.map((provider: string) => (
                            <button
                              key={provider}
                              class={`classic-login__provider classic-login__provider--${provider}`}
                              onClick={() => handleThirdPartyLogin({ provider })}
                            >
                              <div class="classic-login__provider-icon" innerHTML={getIcon(provider as any, { size: 'sm' })}></div>
                              <span class="classic-login__provider-name">
                                {provider === 'github' && 'GitHub'}
                                {provider === 'google' && 'Google'}
                                {provider === 'wechat' && '微信'}
                              </span>
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
