import type { Engine } from '@ldesign/engine'
import type { App } from 'vue'
import type { Pinia } from 'pinia'

/**
 * 设置状态管理系统
 */
export async function setupStore(engine: Engine, app: App, pinia: Pinia) {
  try {
    // 注册Pinia到引擎状态
    engine.state.set('pinia', pinia)

    // 初始化全局状态
    const { useGlobalState } = await import('./global')
    const globalStore = useGlobalState()

    // 将全局状态注册到引擎状态中
    engine.state.set('global', globalStore)

    // 初始化认证状态
    const { useAuthState } = await import('./auth')
    const authStore = useAuthState()

    // 将认证状态注册到引擎状态中
    engine.state.set('auth', authStore)

    // 监听引擎事件，同步状态
    setupStoreEventListeners(engine, globalStore, authStore)

    engine.logger.info('Store setup completed')
  } catch (error) {
    engine.logger.error('Failed to setup store:', error)
    throw error
  }
}

/**
 * 设置状态管理事件监听器
 */
function setupStoreEventListeners(engine: Engine, globalStore: any, authStore: any) {
  // 监听认证事件
  engine.events.on('auth:login', (authData: any) => {
    authStore.setUser(authData.user)
    authStore.setToken(authData.token)
    globalStore.setUser(authData.user)
  })

  engine.events.on('auth:logout', () => {
    authStore.clearAuth()
    globalStore.clearUser()
  })

  engine.events.on('auth:unauthorized', () => {
    authStore.clearAuth()
    globalStore.clearUser()

    // 重定向到登录页
    const router = engine.state.get('router')
    if (router) {
      router.push('/login')
    }
  })

  // 监听设备变化事件
  engine.events.on('device:change', (deviceData: any) => {
    globalStore.device = deviceData.to
  })

  // 监听主题变化事件
  engine.events.on('theme:change', (themeData: any) => {
    globalStore.theme = { ...globalStore.theme, ...themeData }
  })

  // 监听语言变化事件
  engine.events.on('i18n:locale:change', (localeData: any) => {
    globalStore.setLocale(localeData.locale)
  })
}

// 导出所有状态管理模块
export * from './global'
export * from './auth'
export * from './adapter'
