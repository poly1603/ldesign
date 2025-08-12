import type { EngineImpl } from '@ldesign/engine'
import { useRoute, useRouter } from '@ldesign/router'
import { useDevice } from '@ldesign/device'
import { TemplateSelector } from '@ldesign/template'

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

    // 使用 i18n - 直接使用全局属性
    const $t = instance?.appContext.config.globalProperties.$t
    const $i18n = instance?.appContext.config.globalProperties.$i18n

    if (!$t || !$i18n) {
      throw new Error('i18n 未正确初始化，请检查插件配置')
    }

    const t = $t
    const locale = ref($i18n.getCurrentLanguage())
    const availableLanguages = ref($i18n.getAvailableLanguages())
    const switchLanguage = async (lang: string) => {
      await $i18n.changeLanguage(lang)
      locale.value = $i18n.getCurrentLanguage()
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
            <h1 class='home-title'>🏠 {t('pages.home.title')}</h1>
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
            <h2>{t('pages.home.welcome')}</h2>
            <p>{t('common.loginSuccess')}</p>
            <p>
              {t('common.currentLanguage')}: {locale.value}
            </p>
          </div>

          <div class='info-grid'>
            <div class='info-card'>
              <h3>👤 {t('pages.home.userInfo')}</h3>
              <div class='info-item'>
                <span class='label'>{t('pages.home.username')}:</span>
                <span class='value'>{userInfo.value.username}</span>
              </div>
              <div class='info-item'>
                <span class='label'>{t('pages.home.loginTime')}:</span>
                <span class='value'>{userInfo.value.loginTime}</span>
              </div>
              <div class='info-item'>
                <span class='label'>{t('pages.home.deviceInfo')}:</span>
                <span class='value'>{userInfo.value.deviceInfo}</span>
              </div>
            </div>

            <div class='info-card'>
              <h3>📍 {t('pages.home.routeInfo')}</h3>
              <div class='info-item'>
                <span class='label'>{t('pages.home.currentPath')}:</span>
                <span class='value'>{route.value.path}</span>
              </div>
              <div class='info-item'>
                <span class='label'>{t('pages.home.routeName')}:</span>
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
              🔑 {t('pages.home.goToLogin')}
            </button>
            <button
              class='action-btn secondary'
              onClick={() => window.location.reload()}
            >
              🔄 {t('pages.home.refreshPage')}
            </button>
          </div>
        </main>
      </div>
    )
  },
})
