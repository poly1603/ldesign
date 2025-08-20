import { defineComponent, ref, onMounted, computed, onUnmounted } from 'vue'
import { getSmartBackground, preloadBackground, type BackgroundImage } from '../../../../utils/background'
import { LucideIcons, getIcon } from '../../../../utils/icons'
import { getTheme, applyTheme } from '../../../../utils/theme'
import './index.less'

/**
 * 自适应桌面登录模板
 * 
 * 特性：
 * - 响应式布局，自动适配不同屏幕尺寸
 * - 智能背景加载
 * - 流畅的动画效果
 * - 现代化的毛玻璃设计
 */
export default defineComponent({
  name: 'DesktopAdaptiveLogin',
  props: {
    // 模板选择器组件
    templateSelector: {
      type: Object,
      default: null
    },
    // LoginPanel 组件实例
    loginPanel: {
      type: Object,
      default: null,
    },
    // 自定义配置
    config: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['login', 'register', 'forgotPassword', 'thirdPartyLogin', 'template-change'],
  setup(props: any, { emit }: any) {
    // 响应式状态
    const screenWidth = ref(window.innerWidth)
    const screenHeight = ref(window.innerHeight)
    const backgroundImage = ref<BackgroundImage | null>(null)
    const backgroundLoading = ref(true)

    // 计算屏幕尺寸类别
    const screenSize = computed(() => {
      const width = screenWidth.value
      if (width >= 1400) return 'large'
      if (width >= 1024) return 'medium'
      return 'small'
    })

    // 应用主题
    const currentTheme = getTheme('default')

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

    // 窗口大小变化处理
    const handleResize = () => {
      screenWidth.value = window.innerWidth
      screenHeight.value = window.innerHeight
    }

    // 获取背景图片
    const loadBackground = async () => {
      try {
        backgroundLoading.value = true
        const bg = await getSmartBackground({
          width: screenWidth.value,
          height: screenHeight.value,
          quality: 'high',
          category: 'technology'
        })

        if (bg.url && !bg.url.startsWith('linear-gradient')) {
          await preloadBackground(bg.url)
        }

        backgroundImage.value = bg
      } catch (error) {
        console.warn('Failed to load background:', error)
        backgroundImage.value = {
          url: currentTheme.gradients.primary,
          title: 'Adaptive Gradient'
        }
      } finally {
        backgroundLoading.value = false
      }
    }

    // 组件挂载时初始化
    onMounted(() => {
      applyTheme('default')
      loadBackground()
      window.addEventListener('resize', handleResize)
    })

    // 组件卸载时清理
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })

    // 事件处理函数
    const handleLogin = (loginData: any) => {
      emit('login', loginData)
    }

    const handleForgotPassword = (data?: any) => {
      emit('forgotPassword', data)
    }

    const handleThirdPartyLogin = (data: any) => {
      emit('thirdPartyLogin', data)
    }

    const handleRegister = () => {
      emit('register')
    }

    return () => (
      <div
        class={[
          'desktop-adaptive-login',
          `desktop-adaptive-login--${screenSize.value}`
        ]}
        style={backgroundStyle.value}
      >
        {/* 自动注入的模板选择器 */}
        {props.templateSelector && (
          <div class="desktop-adaptive-login__selector">
            {props.templateSelector()}
          </div>
        )}

        {/* 背景装饰 */}
        <div class="desktop-adaptive-login__background">
          <div class="desktop-adaptive-login__mesh"></div>
          <div class="desktop-adaptive-login__dots">
            {Array.from({ length: screenSize.value === 'large' ? 25 : screenSize.value === 'medium' ? 20 : 15 }).map((_, i) => (
              <div
                key={i}
                class="desktop-adaptive-login__dot"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* 主容器 */}
        <div class="desktop-adaptive-login__container">
          {/* 左侧内容区 */}
          <div class="desktop-adaptive-login__content">
            <h1 class="desktop-adaptive-login__title">
              欢迎回来
            </h1>
            <p class="desktop-adaptive-login__subtitle">
              自适应设计，为您提供最佳的登录体验。无论您使用什么设备，都能享受流畅的操作体验。
            </p>
            <ul class="desktop-adaptive-login__features">
              <li>响应式布局设计</li>
              <li>智能背景适配</li>
              <li>流畅动画效果</li>
              <li>现代化界面风格</li>
              <li>多设备完美支持</li>
            </ul>
          </div>

          {/* 右侧登录表单区 */}
          <div class="desktop-adaptive-login__form-container">
            {/* 使用传递进来的 LoginPanel 组件，如果没有则显示默认内容 */}
            <div class="login-panel-wrapper">
              {props.loginPanel ? (
                <props.loginPanel
                  title="登录您的账户"
                  subtitle="自适应设计，为您提供最佳的登录体验"
                  showRememberMe={true}
                  showForgotPassword={true}
                  showThirdPartyLogin={true}
                  thirdPartyProviders={['github', 'google', 'wechat']}
                  onLogin={handleLogin}
                  onRegister={handleRegister}
                  onForgotPassword={handleForgotPassword}
                  onThirdPartyLogin={handleThirdPartyLogin}
                />
              ) : (
                <div class="login-form-placeholder">
                  <h2 style={{
                    color: 'white',
                    textAlign: 'center',
                    marginBottom: '20px',
                    fontSize: screenSize.value === 'small' ? '1.5rem' : '1.8rem'
                  }}>
                    登录您的账户
                  </h2>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    textAlign: 'center',
                    fontSize: '0.9rem'
                  }}>
                    请使用 LoginPanel 组件来显示登录表单
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
})
