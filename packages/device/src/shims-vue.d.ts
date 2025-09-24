/**
 * Vue 3 组件类型声明
 *
 * 为 .vue 文件提供 TypeScript 类型支持
 */

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<Record<string, never>, Record<string, never>, any>
  export default component
}

// 为具体的组件提供更精确的类型定义
declare module './vue/components/DeviceInfo.vue' {
  import type { DefineComponent } from 'vue'
  import type { DeviceInfo } from '../types'

  interface DeviceInfoProps {
    /** 是否显示刷新按钮 */
    showRefresh?: boolean
    /** 是否紧凑模式 */
    compact?: boolean
    /** 是否显示图标 */
    showIcon?: boolean
    /** 自动刷新间隔（毫秒），0表示不自动刷新 */
    autoRefresh?: number
    /** 自定义CSS类名 */
    class?: string
  }

  interface DeviceInfoEmits {
    /** 设备信息更新事件 */
    update: [deviceInfo: DeviceInfo]
    /** 刷新按钮点击事件 */
    refresh: []
    /** 错误事件 */
    error: [error: string]
  }

  const DeviceInfoComponent: DefineComponent<DeviceInfoProps, Record<string, never>, any, Record<string, never>, Record<string, never>, Record<string, never>, Record<string, never>, DeviceInfoEmits>
  export default DeviceInfoComponent
}

declare module './vue/components/NetworkStatus.vue' {
  import type { DefineComponent } from 'vue'
  import type { NetworkInfo } from '../types'

  interface NetworkStatusProps {
    /** 是否显示详细信息 */
    detailed?: boolean
    /** 是否紧凑模式 */
    compact?: boolean
    /** 是否显示图标 */
    showIcon?: boolean
    /** 自定义CSS类名 */
    class?: string
  }

  interface NetworkStatusEmits {
    /** 网络状态变化事件 */
    'change': [networkInfo: NetworkInfo]
    /** 连接状态变化事件 */
    'connection-change': [online: boolean]
  }

  const NetworkStatusComponent: DefineComponent<NetworkStatusProps, Record<string, never>, any, Record<string, never>, Record<string, never>, Record<string, never>, Record<string, never>, NetworkStatusEmits>
  export default NetworkStatusComponent
}
