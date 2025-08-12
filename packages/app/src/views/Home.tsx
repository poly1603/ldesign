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

    // 设备检测
    const { deviceInfo, orientation, isMobile, isTablet, isDesktop } =
      useDevice()
    const deviceType = computed(() => deviceInfo.value?.type || 'unknown')

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
        router.push('/')
        engine?.logger.info('用户退出登录')
      }
    }

    const handleGoToLogin = () => {
      router.push('/')
      engine?.logger.info('导航到登录页')
    }

    return () => (
      <div class='home-page'>
        <header class='home-header'>
          <div class='home-header__content'>
            <h1 class='home-title'>🏠 LDesign 应用首页</h1>
            <button class='logout-btn' onClick={handleLogout}>
              退出登录
            </button>
          </div>
        </header>

        <main class='home-main'>
          <div class='welcome-card'>
            <h2>欢迎回来！</h2>
            <p>您已成功登录 LDesign 演示应用</p>
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
