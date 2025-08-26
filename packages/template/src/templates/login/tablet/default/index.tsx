import { computed, defineComponent, onMounted, ref } from 'vue'
import { type BackgroundImage, getSmartBackground, preloadBackground } from '../../../../utils/background'
import { getIcon } from '../../../../utils/icons'
import { applyTheme, getTheme } from '../../../../utils/theme'
import './index.less'

export default defineComponent({
  name: 'TabletDefaultLoginTemplate',
  props: {
    title: {
      type: String,
      default: '登录',
    },
    subtitle: {
      type: String,
      default: '欢迎回来',
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
      default: () => ['wechat', 'qq', 'weibo'],
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

    // 获取背景图片
    const loadBackground = async () => {
      try {
        backgroundLoading.value = true
        const bg = await getSmartBackground({
          width: 1366,
          height: 1024,
          quality: 'high',
          category: 'nature',
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
          title: 'Tablet Gradient',
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
      <div class="tablet-default-login" style={backgroundStyle.value}>
        {/* 使用传递进来的模板选择器 */}
        {props.templateSelector && <div class="tablet-default-login__selector">{props.templateSelector()}</div>}

        {/* 背景装饰层 */}
        <div class="tablet-default-login__background">
          <div class="tablet-default-login__grid"></div>
          <div class="tablet-default-login__shapes">
            <div class="tablet-default-login__shape tablet-default-login__shape--1"></div>
            <div class="tablet-default-login__shape tablet-default-login__shape--2"></div>
            <div class="tablet-default-login__shape tablet-default-login__shape--3"></div>
          </div>
        </div>

        {/* 背景加载指示器 */}
        {backgroundLoading.value && (
          <div class="background-loader">
            <div class="loader-spinner" innerHTML={getIcon('loader', { size: 'lg', className: 'animate-spin' })}></div>
          </div>
        )}

        <div class="tablet-default-login__container">
          <div class="tablet-default-login__content">
            <div class="tablet-default-login__header">
              {props.logo && (
                <div class="tablet-default-login__logo">
                  <img src={props.logo} alt="Logo" />
                  <div class="tablet-default-login__logo-glow"></div>
                </div>
              )}
              <h1 class="tablet-default-login__title">{props.title}</h1>
              <p class="tablet-default-login__subtitle">{props.subtitle}</p>
            </div>

            {/* 使用传递进来的 LoginPanel 组件，如果没有则显示默认内容 */}
            <div class="tablet-default-login__panel">
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
                    <div class="tablet-default-login__default-panel">
                      <div class="tablet-default-login__form">
                        <div class="tablet-default-login__field">
                          <input type="text" placeholder="用户名" class="tablet-default-login__input" />
                        </div>
                        <div class="tablet-default-login__field">
                          <input type="password" placeholder="密码" class="tablet-default-login__input" />
                        </div>

                        {props.showRememberMe && (
                          <div class="tablet-default-login__options">
                            <label class="tablet-default-login__checkbox">
                              <input type="checkbox" />
                              <span>记住密码</span>
                            </label>
                            {props.showForgotPassword && (
                              <a href="#" class="tablet-default-login__forgot">
                                忘记密码？
                              </a>
                            )}
                          </div>
                        )}

                        <button class="tablet-default-login__submit">登录</button>

                        {props.showThirdPartyLogin && (
                          <div class="tablet-default-login__third-party">
                            <div class="tablet-default-login__divider">
                              <span>其他登录方式</span>
                            </div>
                            <div class="tablet-default-login__providers">
                              {props.thirdPartyProviders.map((provider: string) => (
                                <button
                                  key={provider}
                                  class={`tablet-default-login__provider tablet-default-login__provider--${provider}`}
                                >
                                  {provider === 'wechat' && '💬'}
                                  {provider === 'qq' && '🐧'}
                                  {provider === 'weibo' && '📱'}
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
