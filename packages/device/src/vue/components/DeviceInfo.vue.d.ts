import type { DefineComponent } from 'vue'
import type { DeviceInfo } from '../../types'

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

declare const DeviceInfoComponent: DefineComponent<DeviceInfoProps, Record<string, never>, any, Record<string, never>, Record<string, never>, Record<string, never>, Record<string, never>, DeviceInfoEmits>
export default DeviceInfoComponent
