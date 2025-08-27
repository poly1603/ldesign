/**
 * Vue指令入口文件
 * 
 * 导出所有自定义指令
 */

import type { App, Directive } from 'vue'

/**
 * 自动聚焦指令
 * 用法: v-auto-focus
 */
export const vAutoFocus: Directive = {
  mounted(el: HTMLElement) {
    // 延迟聚焦，确保DOM已渲染
    setTimeout(() => {
      if (el.focus) {
        el.focus()
      } else {
        // 如果元素本身不能聚焦，查找第一个可聚焦的子元素
        const focusableElement = el.querySelector(
          'input, textarea, select, button, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement
        
        if (focusableElement) {
          focusableElement.focus()
        }
      }
    }, 100)
  }
}

/**
 * 点击外部指令
 * 用法: v-click-outside="handler"
 */
export const vClickOutside: Directive = {
  mounted(el: any, binding) {
    el._clickOutsideHandler = (event: Event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el._clickOutsideHandler)
  },
  unmounted(el: any) {
    document.removeEventListener('click', el._clickOutsideHandler)
    delete el._clickOutsideHandler
  }
}

/**
 * 防抖指令
 * 用法: v-debounce:300="handler" 或 v-debounce="{ handler, delay: 300 }"
 */
export const vDebounce: Directive = {
  mounted(el: any, binding) {
    let timer: NodeJS.Timeout | null = null
    
    const delay = binding.arg ? parseInt(binding.arg) : 300
    const handler = typeof binding.value === 'function' 
      ? binding.value 
      : binding.value.handler
    const actualDelay = binding.value.delay || delay
    
    el._debounceHandler = (event: Event) => {
      if (timer) {
        clearTimeout(timer)
      }
      
      timer = setTimeout(() => {
        handler(event)
      }, actualDelay)
    }
    
    el.addEventListener('input', el._debounceHandler)
  },
  unmounted(el: any) {
    el.removeEventListener('input', el._debounceHandler)
    delete el._debounceHandler
  }
}

/**
 * 节流指令
 * 用法: v-throttle:300="handler" 或 v-throttle="{ handler, delay: 300 }"
 */
export const vThrottle: Directive = {
  mounted(el: any, binding) {
    let lastCall = 0
    
    const delay = binding.arg ? parseInt(binding.arg) : 300
    const handler = typeof binding.value === 'function' 
      ? binding.value 
      : binding.value.handler
    const actualDelay = binding.value.delay || delay
    
    el._throttleHandler = (event: Event) => {
      const now = Date.now()
      if (now - lastCall >= actualDelay) {
        lastCall = now
        handler(event)
      }
    }
    
    el.addEventListener('input', el._throttleHandler)
  },
  unmounted(el: any) {
    el.removeEventListener('input', el._throttleHandler)
    delete el._throttleHandler
  }
}

/**
 * 拖拽指令
 * 用法: v-draggable="{ onDragStart, onDragEnd }"
 */
export const vDraggable: Directive = {
  mounted(el: HTMLElement, binding) {
    el.draggable = true
    
    const { onDragStart, onDragEnd, onDrag } = binding.value || {}
    
    el._dragStartHandler = (event: DragEvent) => {
      if (onDragStart) {
        onDragStart(event, el)
      }
    }
    
    el._dragHandler = (event: DragEvent) => {
      if (onDrag) {
        onDrag(event, el)
      }
    }
    
    el._dragEndHandler = (event: DragEvent) => {
      if (onDragEnd) {
        onDragEnd(event, el)
      }
    }
    
    el.addEventListener('dragstart', el._dragStartHandler)
    el.addEventListener('drag', el._dragHandler)
    el.addEventListener('dragend', el._dragEndHandler)
  },
  unmounted(el: any) {
    el.removeEventListener('dragstart', el._dragStartHandler)
    el.removeEventListener('drag', el._dragHandler)
    el.removeEventListener('dragend', el._dragEndHandler)
    delete el._dragStartHandler
    delete el._dragHandler
    delete el._dragEndHandler
  }
}

/**
 * 拖拽放置指令
 * 用法: v-droppable="{ onDrop, onDragOver, onDragLeave }"
 */
export const vDroppable: Directive = {
  mounted(el: HTMLElement, binding) {
    const { onDrop, onDragOver, onDragEnter, onDragLeave } = binding.value || {}
    
    el._dragOverHandler = (event: DragEvent) => {
      event.preventDefault()
      if (onDragOver) {
        onDragOver(event, el)
      }
    }
    
    el._dragEnterHandler = (event: DragEvent) => {
      event.preventDefault()
      if (onDragEnter) {
        onDragEnter(event, el)
      }
    }
    
    el._dragLeaveHandler = (event: DragEvent) => {
      if (onDragLeave) {
        onDragLeave(event, el)
      }
    }
    
    el._dropHandler = (event: DragEvent) => {
      event.preventDefault()
      if (onDrop) {
        onDrop(event, el)
      }
    }
    
    el.addEventListener('dragover', el._dragOverHandler)
    el.addEventListener('dragenter', el._dragEnterHandler)
    el.addEventListener('dragleave', el._dragLeaveHandler)
    el.addEventListener('drop', el._dropHandler)
  },
  unmounted(el: any) {
    el.removeEventListener('dragover', el._dragOverHandler)
    el.removeEventListener('dragenter', el._dragEnterHandler)
    el.removeEventListener('dragleave', el._dragLeaveHandler)
    el.removeEventListener('drop', el._dropHandler)
    delete el._dragOverHandler
    delete el._dragEnterHandler
    delete el._dragLeaveHandler
    delete el._dropHandler
  }
}

/**
 * 无限滚动指令
 * 用法: v-infinite-scroll="loadMore"
 */
export const vInfiniteScroll: Directive = {
  mounted(el: HTMLElement, binding) {
    const handler = binding.value
    const threshold = 100 // 距离底部100px时触发
    
    el._scrollHandler = () => {
      const { scrollTop, scrollHeight, clientHeight } = el
      if (scrollTop + clientHeight >= scrollHeight - threshold) {
        handler()
      }
    }
    
    el.addEventListener('scroll', el._scrollHandler)
  },
  unmounted(el: any) {
    el.removeEventListener('scroll', el._scrollHandler)
    delete el._scrollHandler
  }
}

/**
 * 复制到剪贴板指令
 * 用法: v-copy="text"
 */
export const vCopy: Directive = {
  mounted(el: HTMLElement, binding) {
    el._copyHandler = async () => {
      try {
        await navigator.clipboard.writeText(binding.value)
        // 可以触发一个成功事件
        el.dispatchEvent(new CustomEvent('copy-success', { detail: binding.value }))
      } catch (error) {
        // 可以触发一个失败事件
        el.dispatchEvent(new CustomEvent('copy-error', { detail: error }))
      }
    }
    
    el.addEventListener('click', el._copyHandler)
  },
  updated(el: any, binding) {
    // 更新要复制的文本
    el._copyText = binding.value
  },
  unmounted(el: any) {
    el.removeEventListener('click', el._copyHandler)
    delete el._copyHandler
  }
}

/**
 * 所有指令
 */
export const directives = {
  'auto-focus': vAutoFocus,
  'click-outside': vClickOutside,
  'debounce': vDebounce,
  'throttle': vThrottle,
  'draggable': vDraggable,
  'droppable': vDroppable,
  'infinite-scroll': vInfiniteScroll,
  'copy': vCopy
}

/**
 * 安装所有指令
 */
export function installDirectives(app: App) {
  Object.entries(directives).forEach(([name, directive]) => {
    app.directive(name, directive)
  })
}

/**
 * 默认导出
 */
export default {
  install: installDirectives
}
