import type { DefineComponent } from 'vue'
import type { NetworkInfo } from '../../types'

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
  change: [networkInfo: NetworkInfo]
  /** 连接状态变化事件 */
  'connection-change': [online: boolean]
}

declare const NetworkStatusComponent: DefineComponent<NetworkStatusProps, {}, any, {}, {}, {}, {}, NetworkStatusEmits>
export default NetworkStatusComponent
