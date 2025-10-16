/**
 * 剪贴板操作 Hook
 * 
 * @description
 * 提供剪贴板读写功能，支持文本、图片等多种格式，
 * 兼容现代浏览器的 Clipboard API 和传统的 execCommand 方法。
 */

import { ref, computed, type Ref } from 'vue'

/**
 * 剪贴板状态
 */
export interface ClipboardState {
  /** 是否支持剪贴板 API */
  isSupported: boolean
  /** 剪贴板内容 */
  text: string
  /** 是否正在复制 */
  copying: boolean
  /** 是否正在读取 */
  reading: boolean
  /** 最后一次操作是否成功 */
  lastSuccess: boolean
  /** 最后一次错误信息 */
  lastError: string
}

/**
 * 剪贴板配置
 */
export interface ClipboardConfig {
  /** 是否在复制成功后显示提示 */
  showSuccessMessage?: boolean
  /** 成功提示消息 */
  successMessage?: string
  /** 是否在复制失败后显示错误 */
  showErrorMessage?: boolean
  /** 错误提示消息 */
  errorMessage?: string
  /** 复制成功后的回调 */
  onSuccess?: (text: string) => void
  /** 复制失败后的回调 */
  onError?: (error: Error) => void
}

/**
 * 检查是否支持剪贴板 API
 */
const isClipboardSupported = (): boolean => {
  return (
    typeof navigator !== 'undefined' &&
    'clipboard' in navigator &&
    typeof navigator.clipboard.writeText === 'function'
  )
}

/**
 * 检查是否支持读取剪贴板
 */
const isClipboardReadSupported = (): boolean => {
  return (
    isClipboardSupported() &&
    typeof navigator.clipboard.readText === 'function'
  )
}

/**
 * 使用传统方法复制文本
 */
const copyTextLegacy = (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    
    try {
      textArea.focus()
      textArea.select()
      
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      if (successful) {
        resolve()
      } else {
        reject(new Error('复制失败'))
      }
    } catch (error) {
      document.body.removeChild(textArea)
      reject(error)
    }
  })
}

/**
 * 剪贴板 Hook
 * 
 * @param config - 配置选项
 * @returns 剪贴板状态和操作方法
 * 
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const { state, copy, read, copyToClipboard } = useClipboard({
 *       showSuccessMessage: true,
 *       successMessage: '复制成功！',
 *       onSuccess: (text) => {
 *          *       }
 *     })
 *     
 *     const textToCopy = ref('Hello, World!')
 *     
 *     const handleCopy = async () => {
 *       await copy(textToCopy.value)
 *     }
 *     
 *     const handleRead = async () => {
 *       const text = await read()
 *        *     }
 *     
 *     return {
 *       state,
 *       textToCopy,
 *       handleCopy,
 *       handleRead,
 *       copyToClipboard
 *     }
 *   }
 * })
 * ```
 * 
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <input v-model="textToCopy" placeholder="输入要复制的文本" />
 *     <button 
 *       @click="copy(textToCopy)"
 *       :disabled="state.copying"
 *     >
 *       {{ state.copying ? '复制中...' : '复制' }}
 *     </button>
 *     
 *     <button 
 *       @click="read()"
 *       :disabled="state.reading || !state.isSupported"
 *     >
 *       {{ state.reading ? '读取中...' : '读取剪贴板' }}
 *     </button>
 *     
 *     <p v-if="state.text">剪贴板内容: {{ state.text }}</p>
 *     <p v-if="state.lastError" class="error">{{ state.lastError }}</p>
 *   </div>
 * </template>
 * ```
 */
export function useClipboard(config: ClipboardConfig = {}) {
  const {
    showSuccessMessage = false,
    successMessage = '复制成功',
    showErrorMessage = false,
    errorMessage = '复制失败',
    onSuccess,
    onError,
  } = config

  // 状态
  const text = ref('')
  const copying = ref(false)
  const reading = ref(false)
  const lastSuccess = ref(false)
  const lastError = ref('')

  // 检查支持性
  const isSupported = isClipboardSupported()
  const isReadSupported = isClipboardReadSupported()

  /**
   * 复制文本到剪贴板
   */
  const copy = async (textToCopy: string): Promise<boolean> => {
    if (copying.value) return false

    copying.value = true
    lastError.value = ''
    lastSuccess.value = false

    try {
      if (isSupported) {
        // 使用现代 Clipboard API
        await navigator.clipboard.writeText(textToCopy)
      } else {
        // 使用传统方法
        await copyTextLegacy(textToCopy)
      }

      text.value = textToCopy
      lastSuccess.value = true

      // 执行成功回调
      onSuccess?.(textToCopy)

      // 显示成功消息
      if (showSuccessMessage) {
              }

      return true
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : errorMessage
      lastError.value = errorMsg
      lastSuccess.value = false

      // 执行错误回调
      onError?.(error instanceof Error ? error : new Error(errorMsg))

      // 显示错误消息
      if (showErrorMessage) {
        console.error(errorMsg)
      }

      return false
    } finally {
      copying.value = false
    }
  }

  /**
   * 读取剪贴板内容
   */
  const read = async (): Promise<string> => {
    if (!isReadSupported || reading.value) return ''

    reading.value = true
    lastError.value = ''

    try {
      const clipboardText = await navigator.clipboard.readText()
      text.value = clipboardText
      return clipboardText
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '读取剪贴板失败'
      lastError.value = errorMsg
      onError?.(error instanceof Error ? error : new Error(errorMsg))
      return ''
    } finally {
      reading.value = false
    }
  }

  /**
   * 复制元素的文本内容
   */
  const copyElementText = async (element: HTMLElement): Promise<boolean> => {
    const textContent = element.textContent || element.innerText || ''
    return copy(textContent)
  }

  /**
   * 复制输入框的值
   */
  const copyInputValue = async (input: HTMLInputElement | HTMLTextAreaElement): Promise<boolean> => {
    return copy(input.value)
  }

  /**
   * 复制选中的文本
   */
  const copySelection = async (): Promise<boolean> => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      return false
    }
    
    const selectedText = selection.toString()
    return copy(selectedText)
  }

  // 计算状态
  const state = computed<ClipboardState>(() => ({
    isSupported,
    text: text.value,
    copying: copying.value,
    reading: reading.value,
    lastSuccess: lastSuccess.value,
    lastError: lastError.value,
  }))

  return {
    state,
    copy,
    read,
    copyElementText,
    copyInputValue,
    copySelection,
  }
}

/**
 * 简化的复制函数
 * 
 * @param text - 要复制的文本
 * @param config - 配置选项
 * @returns 是否复制成功
 * 
 * @example
 * ```typescript
 * // 简单复制
 * const success = await copyToClipboard('Hello, World!')
 * 
 * // 带配置的复制
 * const success = await copyToClipboard('Hello, World!', {
 *   onSuccess: () => ,
 *   onError: (error) => console.error('复制失败', error)
 * })
 * ```
 */
export const copyToClipboard = async (
  text: string,
  config?: ClipboardConfig
): Promise<boolean> => {
  const { copy } = useClipboard(config)
  return copy(text)
}

/**
 * 读取剪贴板内容
 * 
 * @returns 剪贴板文本内容
 * 
 * @example
 * ```typescript
 * const clipboardText = await readFromClipboard()
 *  * ```
 */
export const readFromClipboard = async (): Promise<string> => {
  const { read } = useClipboard()
  return read()
}

/**
 * 检查剪贴板支持性
 * 
 * @returns 支持性信息
 * 
 * @example
 * ```typescript
 * const support = checkClipboardSupport()
 *  *  * ```
 */
export const checkClipboardSupport = () => {
  return {
    copy: isClipboardSupported(),
    read: isClipboardReadSupported(),
    legacy: typeof document !== 'undefined' && typeof document.execCommand === 'function',
  }
}

/**
 * 创建复制按钮指令
 * 
 * @description
 * 用于 Vue 指令，可以直接在模板中使用
 * 
 * @example
 * ```vue
 * <template>
 *   <button v-copy="'要复制的文本'">复制</button>
 *   <button v-copy="{ text: '文本', success: '复制成功!' }">复制</button>
 * </template>
 * ```
 */
export const vCopy = {
  mounted(el: HTMLElement, binding: any) {
    const handleClick = async () => {
      let text = ''
      let config: ClipboardConfig = {}

      if (typeof binding.value === 'string') {
        text = binding.value
      } else if (typeof binding.value === 'object') {
        text = binding.value.text || ''
        config = binding.value
      }

      if (text) {
        await copyToClipboard(text, config)
      }
    }

    el.addEventListener('click', handleClick)
    el._copyHandler = handleClick
  },

  updated(el: HTMLElement, binding: any) {
    // 更新时重新绑定
    if (el._copyHandler) {
      el.removeEventListener('click', el._copyHandler)
    }
    
    const handleClick = async () => {
      let text = ''
      let config: ClipboardConfig = {}

      if (typeof binding.value === 'string') {
        text = binding.value
      } else if (typeof binding.value === 'object') {
        text = binding.value.text || ''
        config = binding.value
      }

      if (text) {
        await copyToClipboard(text, config)
      }
    }

    el.addEventListener('click', handleClick)
    el._copyHandler = handleClick
  },

  unmounted(el: HTMLElement) {
    if (el._copyHandler) {
      el.removeEventListener('click', el._copyHandler)
      delete el._copyHandler
    }
  },
}

// 扩展 HTMLElement 类型
declare global {
  interface HTMLElement {
    _copyHandler?: () => void
  }
}
