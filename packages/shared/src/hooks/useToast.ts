/**
 * 消息提示管理 Hook
 * 
 * @description
 * 提供全局消息提示功能，支持多种类型、自动关闭、手动关闭、位置配置等功能。
 * 适用于成功提示、错误提示、警告提示、信息提示等场景。
 */

import { reactive, computed, ref, toRefs, nextTick, type Ref } from 'vue'

/**
 * 消息类型
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading'

/**
 * 消息位置
 */
export type ToastPosition = 
  | 'top-left' 
  | 'top-center' 
  | 'top-right'
  | 'bottom-left' 
  | 'bottom-center' 
  | 'bottom-right'
  | 'center'

/**
 * 消息配置
 */
export interface ToastConfig {
  /** 消息类型 */
  type?: ToastType
  /** 消息标题 */
  title?: string
  /** 消息内容 */
  message: string
  /** 持续时间（毫秒），0 表示不自动关闭 */
  duration?: number
  /** 是否可关闭 */
  closable?: boolean
  /** 是否显示图标 */
  showIcon?: boolean
  /** 自定义图标 */
  icon?: string
  /** 位置 */
  position?: ToastPosition
  /** 自定义类名 */
  className?: string
  /** 点击回调 */
  onClick?: () => void
  /** 关闭回调 */
  onClose?: () => void
}

/**
 * 消息项
 */
export interface ToastItem extends Required<Omit<ToastConfig, 'onClick' | 'onClose'>> {
  /** 唯一 ID */
  id: string
  /** 创建时间 */
  createdAt: number
  /** 是否可见 */
  visible: boolean
  /** 是否正在关闭 */
  closing: boolean
  /** 点击回调 */
  onClick?: () => void
  /** 关闭回调 */
  onClose?: () => void
}

/**
 * 全局配置
 */
export interface ToastGlobalConfig {
  /** 默认持续时间 */
  defaultDuration?: number
  /** 默认位置 */
  defaultPosition?: ToastPosition
  /** 最大显示数量 */
  maxCount?: number
  /** 是否显示图标 */
  showIcon?: boolean
  /** 动画持续时间 */
  animationDuration?: number
}

// 全局状态
const toasts = reactive<ToastItem[]>([])
const globalConfig = reactive<ToastGlobalConfig>({
  defaultDuration: 3000,
  defaultPosition: 'top-right',
  maxCount: 5,
  showIcon: true,
  animationDuration: 300,
})

// 计数器
let toastIdCounter = 0

/**
 * 生成唯一 ID
 */
const generateId = (): string => {
  return `toast_${++toastIdCounter}_${Date.now()}`
}

/**
 * 默认图标映射
 */
const defaultIcons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
  loading: '⟳',
}

/**
 * 消息提示 Hook
 * 
 * @returns 消息状态和操作方法
 * 
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const { 
 *       toasts, 
 *       show, 
 *       success, 
 *       error, 
 *       warning, 
 *       info, 
 *       loading,
 *       close, 
 *       clear,
 *       config 
 *     } = useToast()
 *     
 *     const handleSuccess = () => {
 *       success('操作成功！')
 *     }
 *     
 *     const handleError = () => {
 *       error('操作失败，请重试')
 *     }
 *     
 *     const handleCustom = () => {
 *       show({
 *         type: 'info',
 *         title: '自定义消息',
 *         message: '这是一个自定义消息',
 *         duration: 5000,
 *         position: 'bottom-center'
 *       })
 *     }
 *     
 *     return {
 *       toasts,
 *       handleSuccess,
 *       handleError,
 *       handleCustom
 *     }
 *   }
 * })
 * ```
 * 
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <button @click="success('成功消息')">成功</button>
 *     <button @click="error('错误消息')">错误</button>
 *     <button @click="warning('警告消息')">警告</button>
 *     
 *     <!-- 消息容器 -->
 *     <Teleport to="body">
 *       <div 
 *         v-for="position in positions" 
 *         :key="position"
 *         :class="`toast-container toast-${position}`"
 *       >
 *         <TransitionGroup name="toast" tag="div">
 *           <div
 *             v-for="toast in getToastsByPosition(position)"
 *             :key="toast.id"
 *             :class="[
 *               'toast-item',
 *               `toast-${toast.type}`,
 *               toast.className
 *             ]"
 *             @click="toast.onClick?.()"
 *           >
 *             <div v-if="toast.showIcon" class="toast-icon">
 *               {{ toast.icon }}
 *             </div>
 *             <div class="toast-content">
 *               <div v-if="toast.title" class="toast-title">
 *                 {{ toast.title }}
 *               </div>
 *               <div class="toast-message">
 *                 {{ toast.message }}
 *               </div>
 *             </div>
 *             <button 
 *               v-if="toast.closable"
 *               class="toast-close"
 *               @click.stop="close(toast.id)"
 *             >
 *               ×
 *             </button>
 *           </div>
 *         </TransitionGroup>
 *       </div>
 *     </Teleport>
 *   </div>
 * </template>
 * ```
 */
export function useToast() {
  /**
   * 显示消息
   */
  const show = (config: ToastConfig): string => {
    const id = generateId()
    
    const toast: ToastItem = {
      id,
      type: config.type || 'info',
      title: config.title || '',
      message: config.message,
      duration: config.duration ?? globalConfig.defaultDuration!,
      closable: config.closable ?? true,
      showIcon: config.showIcon ?? globalConfig.showIcon!,
      icon: config.icon || defaultIcons[config.type || 'info'],
      position: config.position || globalConfig.defaultPosition!,
      className: config.className || '',
      createdAt: Date.now(),
      visible: false,
      closing: false,
      onClick: config.onClick,
      onClose: config.onClose,
    }

    // 检查最大数量限制
    if (toasts.length >= globalConfig.maxCount!) {
      // 移除最旧的消息
      const oldestToast = toasts[0]
      close(oldestToast.id)
    }

    // 添加到列表
    toasts.push(toast)

    // 下一帧显示（用于动画）
    nextTick(() => {
      toast.visible = true
    })

    // 自动关闭
    if (toast.duration > 0) {
      setTimeout(() => {
        close(id)
      }, toast.duration)
    }

    return id
  }

  /**
   * 成功消息
   */
  const success = (message: string, config?: Omit<ToastConfig, 'message' | 'type'>): string => {
    return show({ ...config, message, type: 'success' })
  }

  /**
   * 错误消息
   */
  const error = (message: string, config?: Omit<ToastConfig, 'message' | 'type'>): string => {
    return show({ ...config, message, type: 'error' })
  }

  /**
   * 警告消息
   */
  const warning = (message: string, config?: Omit<ToastConfig, 'message' | 'type'>): string => {
    return show({ ...config, message, type: 'warning' })
  }

  /**
   * 信息消息
   */
  const info = (message: string, config?: Omit<ToastConfig, 'message' | 'type'>): string => {
    return show({ ...config, message, type: 'info' })
  }

  /**
   * 加载消息
   */
  const loading = (message: string, config?: Omit<ToastConfig, 'message' | 'type'>): string => {
    return show({ 
      ...config, 
      message, 
      type: 'loading',
      duration: 0, // 加载消息默认不自动关闭
      closable: false,
    })
  }

  /**
   * 关闭指定消息
   */
  const close = (id: string): void => {
    const index = toasts.findIndex(toast => toast.id === id)
    if (index === -1) return

    const toast = toasts[index]
    toast.closing = true

    // 执行关闭回调
    toast.onClose?.()

    // 等待动画完成后移除
    setTimeout(() => {
      const currentIndex = toasts.findIndex(t => t.id === id)
      if (currentIndex > -1) {
        toasts.splice(currentIndex, 1)
      }
    }, globalConfig.animationDuration)
  }

  /**
   * 关闭所有消息
   */
  const clear = (): void => {
    toasts.forEach(toast => {
      toast.closing = true
      toast.onClose?.()
    })

    setTimeout(() => {
      toasts.splice(0)
    }, globalConfig.animationDuration)
  }

  /**
   * 更新全局配置
   */
  const config = (newConfig: Partial<ToastGlobalConfig>): void => {
    Object.assign(globalConfig, newConfig)
  }

  /**
   * 根据位置获取消息列表
   */
  const getToastsByPosition = (position: ToastPosition) => {
    return toasts.filter(toast => toast.position === position)
  }

  /**
   * 获取所有使用的位置
   */
  const positions = computed(() => {
    const usedPositions = new Set(toasts.map(toast => toast.position))
    return Array.from(usedPositions)
  })

  /**
   * 检查是否有指定类型的消息
   */
  const hasType = (type: ToastType): boolean => {
    return toasts.some(toast => toast.type === type && toast.visible)
  }

  /**
   * 获取指定类型的消息数量
   */
  const getCountByType = (type: ToastType): number => {
    return toasts.filter(toast => toast.type === type && toast.visible).length
  }

  return {
    // 状态
    toasts: toRefs(reactive({ items: toasts })).items as unknown as Ref<ToastItem[]>,
    positions,
    
    // 方法
    show,
    success,
    error,
    warning,
    info,
    loading,
    close,
    clear,
    config,
    
    // 工具方法
    getToastsByPosition,
    hasType,
    getCountByType,
  }
}

/**
 * 简化的消息提示函数
 * 
 * @description
 * 提供全局的消息提示函数，可以在任何地方调用
 */
export const toast = {
  show: (config: ToastConfig) => {
    const { show } = useToast()
    return show(config)
  },
  
  success: (message: string, config?: Omit<ToastConfig, 'message' | 'type'>) => {
    const { success } = useToast()
    return success(message, config)
  },
  
  error: (message: string, config?: Omit<ToastConfig, 'message' | 'type'>) => {
    const { error } = useToast()
    return error(message, config)
  },
  
  warning: (message: string, config?: Omit<ToastConfig, 'message' | 'type'>) => {
    const { warning } = useToast()
    return warning(message, config)
  },
  
  info: (message: string, config?: Omit<ToastConfig, 'message' | 'type'>) => {
    const { info } = useToast()
    return info(message, config)
  },
  
  loading: (message: string, config?: Omit<ToastConfig, 'message' | 'type'>) => {
    const { loading } = useToast()
    return loading(message, config)
  },
  
  close: (id: string) => {
    const { close } = useToast()
    return close(id)
  },
  
  clear: () => {
    const { clear } = useToast()
    return clear()
  },
}
