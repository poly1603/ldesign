import { defineComponent, ref, onMounted, computed } from 'vue'
import { getSmartBackground, preloadBackground, type BackgroundImage } from '../../../../utils/background'
import { LucideIcons, getIcon } from '../../../../utils/icons'
import { getTheme, applyTheme } from '../../../../utils/theme'
import './index.less'

export default defineComponent({
  name: 'MobileSimpleLoginTemplate',
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
      default: false,
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
    const currentTheme = getTheme('default')

    // 计算背景样式 - 简洁模板使用渐变背景
    const backgroundStyle = computed(() => {
      // 简洁模板优先使用渐变背景以提升性能
      return { background: currentTheme.gradients.background }
    })

    // 获取背景图片（可选，用于高端设备）
    const loadBackground = async () => {
      try {
        backgroundLoading.value = true
        // 简洁模板使用轻量级背景
        backgroundImage.value = {
          url: currentTheme.gradients.background,
          title: 'Simple Gradient'
        }
      } catch (error) {
        console.warn('Failed to load background:', error)
        backgroundImage.value = {
          url: currentTheme.gradients.background,
          title: 'Fallback Gradient'
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
      <div class="mobile-simple-login" style={backgroundStyle.value}>
        {/* 使用传递进来的模板选择器 */}
        {props.templateSelector && <div class="mobile-simple-login__selector">{props.templateSelector()}</div>}

        {/* 简洁装饰元素 */}
        <div class="mobile-simple-login__decoration">
          <div class="mobile-simple-login__circle mobile-simple-login__circle--1"></div>
          <div class="mobile-simple-login__circle mobile-simple-login__circle--2"></div>
          <div class="mobile-simple-login__circle mobile-simple-login__circle--3"></div>
        </div>

        <div class="mobile-simple-login__container">
          <div class="mobile-simple-login__header">
            {props.logo && (
              <div class="mobile-simple-login__logo">
                <img src={props.logo} alt="Logo" />
                <div class="mobile-simple-login__logo-ring"></div>
              </div>
            )}
            <h1 class="mobile-simple-login__title">{props.title}</h1>
            <p class="mobile-simple-login__subtitle">{props.subtitle}</p>
          </div>

          {/* 使用传递进来的 LoginPanel 组件，如果没有则显示默认内容 */}
          <div class="mobile-simple-login__panel">
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
              <div class="mobile-simple-login__default-panel">
                <div class="mobile-simple-login__form">
                  <div class="mobile-simple-login__field">
                    <input type="text" placeholder="手机号" class="mobile-simple-login__input" />
                  </div>
                  <div class="mobile-simple-login__field">
                    <input type="password" placeholder="密码" class="mobile-simple-login__input" />
                  </div>

                  <button class="mobile-simple-login__submit">登录</button>

                  {props.showForgotPassword && (
                    <div class="mobile-simple-login__options">
                      <a href="#" class="mobile-simple-login__forgot">
                        忘记密码？
                      </a>
                    </div>
                  )}

                  {props.showThirdPartyLogin && (
                    <div class="mobile-simple-login__third-party">
                      <div class="mobile-simple-login__divider">
                        <span>快速登录</span>
                      </div>
                      <div class="mobile-simple-login__providers">
                        {props.thirdPartyProviders.map((provider: string) => (
                          <button
                            key={provider}
                            class={`mobile-simple-login__provider mobile-simple-login__provider--${provider}`}
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
    )
  },
})
