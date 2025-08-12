import type { EngineImpl } from '@ldesign/engine'
import { useRoute, useRouter } from '@ldesign/router'
import { useDevice } from '@ldesign/device'

import {
  computed,
  defineComponent,
  getCurrentInstance,
  onMounted,
  ref,
} from 'vue'
import './Home.less'

export default defineComponent({
  name: 'Home',
  setup() {
    // 获取 Engine 实例
    const instance = getCurrentInstance()
    const engine = instance?.appContext.config.globalProperties
      .$engine as EngineImpl

    const router = useRouter()
    const route = useRoute()

    // 使用 i18n - 使用全局属性作为备选方案
    const $t = instance?.appContext.config.globalProperties.$t
    const $i18n = instance?.appContext.config.globalProperties.$i18n

    let t: (key: string) => string
    let locale: any
    let availableLanguages: any
    let switchLanguage: any

    if ($t && $i18n) {
      // 使用全局属性
      t = $t
      locale = ref($i18n.getCurrentLanguage())
      availableLanguages = ref($i18n.getAvailableLanguages())
      switchLanguage = async (lang: string) => {
        await $i18n.changeLanguage(lang)
        locale.value = $i18n.getCurrentLanguage()
      }
    } else {
      // 降级处理
      t = (key: string) => {
        const translations: Record<string, string> = {
          'common.home': '首页',
          'common.logout': '退出登录',
          'common.loginSuccess': '登录成功',
          'common.currentLanguage': '当前语言',
          'common.welcome': '欢迎',
        }
        return translations[key] || key
      }
      locale = ref('zh-CN')
      availableLanguages = ref([
        { code: 'zh-CN', name: '中文', nativeName: '中文' },
      ])
      switchLanguage = async () => {}
    }

    // 设备检测
    const { deviceInfo, isMobile, isTablet, isDesktop } = useDevice()
    const deviceType = computed(() => deviceInfo.value?.type || 'unknown')
    const orientation = computed(
      () => deviceInfo.value?.orientation || 'portrait'
    )

    // 用户信息（模拟）
    const userInfo = ref({
      username: 'admin',
      loginTime: new Date().toLocaleString(),
      deviceInfo: '',
    })

    onMounted(() => {
      userInfo.value.deviceInfo = `${deviceType.value} (${orientation.value})`
      engine?.logger.info('首页加载完成', {
        device: deviceType.value,
        orientation: orientation.value,
      })
    })

    const handleLogout = () => {
      if (confirm('确定要退出登录吗？')) {
        router.replace('/login')
        engine?.logger.info('用户退出登录')
      }
    }

    const handleGoToLogin = () => {
      router.push('/login')
      engine?.logger.info('导航到登录页')
    }

    // 语言切换处理
    const handleLanguageChange = async (lang: string) => {
      try {
        await switchLanguage(lang)
        engine?.logger.info('语言切换成功', { language: lang })
      } catch (error) {
        console.error('语言切换失败:', error)
        engine?.logger.error('语言切换失败', { language: lang, error })
      }
    }

    return () => (
      <div class='home-page'>
        <header class='home-header'>
          <div class='home-header__content'>
            <h1 class='home-title'>🏠 {t('common.home')}</h1>
            <div class='header-actions'>
              <select
                class='language-selector'
                value={locale.value}
                onChange={e =>
                  handleLanguageChange((e.target as HTMLSelectElement).value)
                }
              >
                {availableLanguages.value.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName}
                  </option>
                ))}
              </select>
              <button class='logout-btn' onClick={handleLogout}>
                {t('common.logout')}
              </button>
            </div>
          </div>
        </header>

        <main class='home-main'>
          <div class='welcome-card'>
            <h2>{t('common.welcome')}</h2>
            <p>{t('common.loginSuccess')}</p>
            <p>
              {t('common.currentLanguage')}: {locale.value}
            </p>
          </div>

          <div class='info-grid'>
            <div class='info-card'>
              <h3>👤 用户信息</h3>
              <div class='info-item'>
                <span class='label'>用户名:</span>
                <span class='value'>{userInfo.value.username}</span>
              </div>
              <div class='info-item'>
                <span class='label'>登录时间:</span>
                <span class='value'>{userInfo.value.loginTime}</span>
              </div>
              <div class='info-item'>
                <span class='label'>设备信息:</span>
                <span class='value'>{userInfo.value.deviceInfo}</span>
              </div>
            </div>

            <div class='info-card'>
              <h3>📍 路由信息</h3>
              <div class='info-item'>
                <span class='label'>当前路径:</span>
                <span class='value'>{route.value.path}</span>
              </div>
              <div class='info-item'>
                <span class='label'>路由名称:</span>
                <span class='value'>{route.value.name}</span>
              </div>
              <div class='info-item'>
                <span class='label'>页面标题:</span>
                <span class='value'>{route.value.meta?.title}</span>
              </div>
            </div>

            <div class='info-card'>
              <h3>📱 设备检测</h3>
              <div class='device-status'>
                <div class={['device-indicator', { active: isMobile.value }]}>
                  📱 移动设备
                </div>
                <div class={['device-indicator', { active: isTablet.value }]}>
                  📟 平板设备
                </div>
                <div class={['device-indicator', { active: isDesktop.value }]}>
                  🖥️ 桌面设备
                </div>
              </div>
              <div class='info-item'>
                <span class='label'>屏幕方向:</span>
                <span class='value'>{orientation.value}</span>
              </div>
            </div>

            <div class='info-card'>
              <h3>✨ 功能特性</h3>
              <ul class='feature-list'>
                <li>🛣️ 智能路由系统</li>
                <li>🎨 多设备模板适配</li>
                <li>⚙️ 应用引擎集成</li>
                <li>📱 设备类型检测</li>
                <li>🔔 通知系统</li>
                <li>📝 日志记录</li>
              </ul>
            </div>
          </div>

          <div class='action-section'>
            <button class='action-btn primary' onClick={handleGoToLogin}>
              🔑 返回登录页
            </button>
            <button
              class='action-btn secondary'
              onClick={() => window.location.reload()}
            >
              🔄 刷新页面
            </button>
          </div>
        </main>
      </div>
    )
  },
})
