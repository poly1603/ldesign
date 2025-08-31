/**
 * 模态框管理 Hook
 * 
 * @description
 * 提供模态框状态管理功能，支持多层模态框、键盘事件、焦点管理等功能。
 * 可用于对话框、抽屉、弹出层等各种模态组件。
 */

import { ref, computed, watch, nextTick, onMounted, onUnmounted, type Ref } from 'vue'

/**
 * 模态框配置
 */
export interface ModalConfig {
  /** 是否可以通过 ESC 键关闭 */
  closeOnEsc?: boolean
  /** 是否可以通过点击遮罩关闭 */
  closeOnOverlay?: boolean
  /** 是否锁定页面滚动 */
  lockScroll?: boolean
  /** 是否自动聚焦 */
  autoFocus?: boolean
  /** 是否在关闭时恢复焦点 */
  restoreFocus?: boolean
  /** 模态框层级 */
  zIndex?: number
  /** 动画持续时间（毫秒） */
  animationDuration?: number
}

/**
 * 模态框状态
 */
export interface ModalState {
  /** 是否可见 */
  visible: boolean
  /** 是否正在打开 */
  opening: boolean
  /** 是否正在关闭 */
  closing: boolean
  /** 是否已完全打开 */
  opened: boolean
  /** 模态框层级 */
  zIndex: number
}

/**
 * 模态框操作方法
 */
export interface ModalActions {
  /** 打开模态框 */
  open: () => Promise<void>
  /** 关闭模态框 */
  close: () => Promise<void>
  /** 切换模态框状态 */
  toggle: () => Promise<void>
}

// 全局模态框管理
let modalStack: Array<{ id: string; close: () => void }> = []
let currentZIndex = 1000

/**
 * 模态框 Hook
 * 
 * @param config - 模态框配置
 * @returns 模态框状态和操作方法
 * 
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const { state, actions } = useModal({
 *       closeOnEsc: true,
 *       closeOnOverlay: true,
 *       lockScroll: true,
 *       autoFocus: true,
 *       restoreFocus: true
 *     })
 *     
 *     const handleOpenModal = () => {
 *       actions.open()
 *     }
 *     
 *     const handleCloseModal = () => {
 *       actions.close()
 *     }
 *     
 *     return {
 *       state,
 *       actions,
 *       handleOpenModal,
 *       handleCloseModal
 *     }
 *   }
 * })
 * ```
 * 
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <button @click="actions.open()">打开模态框</button>
 *     
 *     <Teleport to="body">
 *       <div 
 *         v-if="state.visible"
 *         class="modal-overlay"
 *         :style="{ zIndex: state.zIndex }"
 *         @click="handleOverlayClick"
 *       >
 *         <div 
 *           class="modal-content"
 *           :class="{
 *             'modal-opening': state.opening,
 *             'modal-closing': state.closing
 *           }"
 *           @click.stop
 *         >
 *           <h2>模态框标题</h2>
 *           <p>模态框内容</p>
 *           <button @click="actions.close()">关闭</button>
 *         </div>
 *       </div>
 *     </Teleport>
 *   </div>
 * </template>
 * ```
 */
export function useModal(config: ModalConfig = {}): {
  state: Ref<ModalState>
  actions: ModalActions
} {
  const {
    closeOnEsc = true,
    closeOnOverlay = true,
    lockScroll = true,
    autoFocus = true,
    restoreFocus = true,
    animationDuration = 300,
  } = config

  // 生成唯一 ID
  const modalId = `modal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // 状态
  const visible = ref(false)
  const opening = ref(false)
  const closing = ref(false)
  const opened = ref(false)
  const zIndex = ref(currentZIndex)
  
  // 焦点管理
  let previousActiveElement: Element | null = null
  let modalElement: HTMLElement | null = null

  /**
   * 锁定页面滚动
   */
  const lockBodyScroll = () => {
    if (!lockScroll) return
    
    const body = document.body
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
    
    body.style.overflow = 'hidden'
    body.style.paddingRight = `${scrollBarWidth}px`
  }

  /**
   * 解锁页面滚动
   */
  const unlockBodyScroll = () => {
    if (!lockScroll) return
    
    const body = document.body
    body.style.overflow = ''
    body.style.paddingRight = ''
  }

  /**
   * 聚焦到模态框
   */
  const focusModal = () => {
    if (!autoFocus) return
    
    nextTick(() => {
      // 查找模态框元素
      modalElement = document.querySelector(`[data-modal-id="${modalId}"]`) as HTMLElement
      
      if (modalElement) {
        // 查找第一个可聚焦元素
        const focusableElements = modalElement.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        
        if (focusableElements.length > 0) {
          (focusableElements[0] as HTMLElement).focus()
        } else {
          modalElement.focus()
        }
      }
    })
  }

  /**
   * 恢复焦点
   */
  const restorePreviousFocus = () => {
    if (!restoreFocus || !previousActiveElement) return
    
    nextTick(() => {
      if (previousActiveElement && typeof (previousActiveElement as HTMLElement).focus === 'function') {
        (previousActiveElement as HTMLElement).focus()
      }
    })
  }

  /**
   * 处理键盘事件
   */
  const handleKeydown = (event: KeyboardEvent) => {
    if (!visible.value) return

    // ESC 键关闭
    if (event.key === 'Escape' && closeOnEsc) {
      event.preventDefault()
      close()
      return
    }

    // Tab 键焦点循环
    if (event.key === 'Tab' && modalElement) {
      const focusableElements = modalElement.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      
      if (focusableElements.length === 0) return
      
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
      
      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }
  }

  /**
   * 打开模态框
   */
  const open = async (): Promise<void> => {
    if (visible.value || opening.value) return

    // 记录当前聚焦元素
    previousActiveElement = document.activeElement

    // 设置层级
    zIndex.value = ++currentZIndex

    // 添加到模态框栈
    modalStack.push({
      id: modalId,
      close,
    })

    // 开始打开动画
    opening.value = true
    visible.value = true

    // 锁定滚动
    lockBodyScroll()

    // 聚焦到模态框
    focusModal()

    // 等待动画完成
    await new Promise(resolve => setTimeout(resolve, animationDuration))

    opening.value = false
    opened.value = true
  }

  /**
   * 关闭模态框
   */
  const close = async (): Promise<void> => {
    if (!visible.value || closing.value) return

    // 开始关闭动画
    closing.value = true
    opened.value = false

    // 从模态框栈中移除
    const index = modalStack.findIndex(modal => modal.id === modalId)
    if (index > -1) {
      modalStack.splice(index, 1)
    }

    // 等待动画完成
    await new Promise(resolve => setTimeout(resolve, animationDuration))

    closing.value = false
    visible.value = false

    // 如果是最后一个模态框，解锁滚动
    if (modalStack.length === 0) {
      unlockBodyScroll()
    }

    // 恢复焦点
    restorePreviousFocus()
  }

  /**
   * 切换模态框状态
   */
  const toggle = async (): Promise<void> => {
    if (visible.value) {
      await close()
    } else {
      await open()
    }
  }

  /**
   * 处理遮罩点击
   */
  const handleOverlayClick = () => {
    if (closeOnOverlay) {
      close()
    }
  }

  // 监听键盘事件
  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    
    // 清理模态框栈
    const index = modalStack.findIndex(modal => modal.id === modalId)
    if (index > -1) {
      modalStack.splice(index, 1)
    }
    
    // 如果是最后一个模态框，解锁滚动
    if (modalStack.length === 0) {
      unlockBodyScroll()
    }
  })

  // 计算状态
  const state = computed<ModalState>(() => ({
    visible: visible.value,
    opening: opening.value,
    closing: closing.value,
    opened: opened.value,
    zIndex: zIndex.value,
  }))

  const actions: ModalActions = {
    open,
    close,
    toggle,
  }

  return {
    state: state as Ref<ModalState>,
    actions,
  }
}

/**
 * 模态框管理器 Hook
 * 
 * @description
 * 用于管理多个模态框的全局状态
 * 
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const { 
 *       modals, 
 *       openModal, 
 *       closeModal, 
 *       closeAll,
 *       getTopModal 
 *     } = useModalManager()
 *     
 *     const openConfirmDialog = () => {
 *       openModal('confirm', {
 *         title: '确认删除',
 *         content: '确定要删除这个项目吗？'
 *       })
 *     }
 *     
 *     return {
 *       modals,
 *       openConfirmDialog,
 *       closeModal,
 *       closeAll
 *     }
 *   }
 * })
 * ```
 */
export function useModalManager() {
  const modals = ref<Record<string, any>>({})

  /**
   * 打开指定模态框
   */
  const openModal = (id: string, props?: any) => {
    modals.value[id] = {
      visible: true,
      props: props || {},
      zIndex: ++currentZIndex,
    }
  }

  /**
   * 关闭指定模态框
   */
  const closeModal = (id: string) => {
    if (modals.value[id]) {
      modals.value[id].visible = false
    }
  }

  /**
   * 关闭所有模态框
   */
  const closeAll = () => {
    for (const id in modals.value) {
      modals.value[id].visible = false
    }
  }

  /**
   * 获取顶层模态框
   */
  const getTopModal = () => {
    let topModal = null
    let maxZIndex = 0

    for (const id in modals.value) {
      const modal = modals.value[id]
      if (modal.visible && modal.zIndex > maxZIndex) {
        maxZIndex = modal.zIndex
        topModal = { id, ...modal }
      }
    }

    return topModal
  }

  /**
   * 检查是否有模态框打开
   */
  const hasOpenModals = computed(() => {
    return Object.values(modals.value).some(modal => modal.visible)
  })

  return {
    modals,
    openModal,
    closeModal,
    closeAll,
    getTopModal,
    hasOpenModals,
  }
}
