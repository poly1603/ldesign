import { ref, onMounted, onBeforeUnmount, watch, Ref } from 'vue'
import { CodeEditor } from '../../core/CodeEditor'
import type { CodeEditorConfig, ICodeEditor } from '../../types'

/**
 * Vue Composable for CodeEditor
 * 提供编辑器实例的响应式管理
 */
export function useCodeEditor(
  containerRef: Ref<HTMLElement | undefined>,
  config?: CodeEditorConfig
) {
  const editorInstance = ref<ICodeEditor | null>(null)
  const isReady = ref(false)
  const value = ref(config?.value || '')

  // 初始化编辑器
  onMounted(() => {
    if (!containerRef.value) return

    const editorConfig: CodeEditorConfig = {
      ...config,
      on: {
        ...config?.on,
        change: (newValue, event) => {
          value.value = newValue
          config?.on?.change?.(newValue, event)
        },
        ready: (editor) => {
          isReady.value = true
          config?.on?.ready?.(editor)
        }
      }
    }

    editorInstance.value = new CodeEditor(containerRef.value, editorConfig)
  })

  // 清理
  onBeforeUnmount(() => {
    editorInstance.value?.dispose()
    editorInstance.value = null
  })

  // 监听 value 变化
  watch(value, (newValue) => {
    if (editorInstance.value && editorInstance.value.getValue() !== newValue) {
      editorInstance.value.setValue(newValue)
    }
  })

  return {
    editorInstance,
    isReady,
    value
  }
}

/**
 * 创建简单的编辑器实例
 */
export function createEditor(
  container: HTMLElement | string,
  config?: CodeEditorConfig
): ICodeEditor {
  const element = typeof container === 'string'
    ? document.querySelector<HTMLElement>(container)
    : container

  if (!element) {
    throw new Error('Container element not found')
  }

  return new CodeEditor(element, config)
}
