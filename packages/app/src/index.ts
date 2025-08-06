// ============ 主要导出 ============
export { default as App } from './App.vue'

// ============ 组件导出 ============
export { default as LNotificationContainer } from './components/LNotificationContainer.vue'
export { default as LGlobalLoading } from './components/LGlobalLoading.vue'
export { default as LErrorBoundary } from './components/LErrorBoundary.vue'

// 重新导出LDesign水印组件
export { Watermark } from '@ldesign/watermark/vue'

// ============ 视图导出 ============
export { default as LoginView } from './views/LoginView.vue'
export { default as RegisterView } from './views/RegisterView.vue'
export { default as DashboardView } from './views/DashboardView.vue'

// ============ 模板导出 ============
export * from './templates'

// ============ 状态管理导出 ============
export * from './stores'

// ============ 工具函数导出 ============
export * from './utils'

// ============ Composables导出 ============
export * from './composables'

// ============ 路由导出 ============
export * from './router'

// ============ 国际化导出 ============
export * from './i18n'

// ============ LDesign包重新导出 ============
// 重新导出LDesign包的组合式API，方便使用
export {
  useEngine,
  useEngineConfig,
  useEnginePlugins,
  useEngineMiddleware,
  useEngineEvents,
  useEngineState,
  useEngineLogger,
  useEngineNotifications,
  useEngineErrors
} from '@ldesign/engine/vue'

export {
  useRouter,
  useRoute
} from '@ldesign/router'

export {
  useI18n,
  useLocale
} from '@ldesign/i18n/vue'

export {
  useTemplate,
  useTemplateManager
} from '@ldesign/template'

export {
  useWatermark,
  useSimpleWatermark
} from '@ldesign/watermark/vue'

export {
  useDevice,
  useDeviceDetection
} from '@ldesign/device/vue'

export {
  useCrypto
} from '@ldesign/crypto/vue'

export {
  useHttp
} from '@ldesign/http/vue'

// ============ 类型导出 ============
export * from './types'

// ============ 配置导出 ============
export * from './config'

// ============ 创建应用函数 ============
export { createLDesignApp } from './factory'

// ============ 版本信息 ============
export const version = '1.0.0'
