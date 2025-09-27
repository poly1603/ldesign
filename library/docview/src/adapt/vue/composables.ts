import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import { DocumentViewer } from '../../core/document-viewer'
import type { DocumentViewerOptions, DocumentInfo, DocumentContent } from '../../types'

/**
 * 文档查看器 Composable
 */
export function useDocumentViewer(
  container: Ref<HTMLElement | undefined>,
  options?: Partial<DocumentViewerOptions>
) {
  const viewer = ref<DocumentViewer | null>(null)
  const documentInfo = ref<DocumentInfo | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * 初始化查看器
   */
  const initViewer = () => {
    if (!container.value) return

    try {
      viewer.value = new DocumentViewer({
        container: container.value,
        ...options,
        callbacks: {
          onLoad: (info) => {
            documentInfo.value = info
            loading.value = false
            options?.callbacks?.onLoad?.(info)
          },
          onError: (err) => {
            error.value = err
            loading.value = false
            options?.callbacks?.onError?.(err)
          },
          onChange: options?.callbacks?.onChange,
          onSave: options?.callbacks?.onSave
        }
      })
    } catch (err) {
      error.value = err as Error
      loading.value = false
    }
  }

  /**
   * 加载文档
   */
  const loadDocument = async (file: File | string | ArrayBuffer) => {
    if (!viewer.value) return

    loading.value = true
    error.value = null

    try {
      await viewer.value.loadDocument(file)
    } catch (err) {
      error.value = err as Error
      loading.value = false
    }
  }

  /**
   * 获取文档内容
   */
  const getContent = (): DocumentContent | null => {
    return viewer.value?.getContent() || null
  }

  /**
   * 保存文档
   */
  const save = async (): Promise<Blob | null> => {
    if (!viewer.value) return null
    
    try {
      return await viewer.value.save()
    } catch (err) {
      error.value = err as Error
      return null
    }
  }

  /**
   * 设置编辑模式
   */
  const setEditable = (editable: boolean) => {
    viewer.value?.setEditable(editable)
  }

  /**
   * 获取文档信息
   */
  const getDocumentInfo = (): DocumentInfo | null => {
    return viewer.value?.getDocumentInfo() || null
  }

  /**
   * 销毁查看器
   */
  const destroy = () => {
    viewer.value?.destroy()
    viewer.value = null
    documentInfo.value = null
    error.value = null
    loading.value = false
  }

  onMounted(() => {
    initViewer()
  })

  onUnmounted(() => {
    destroy()
  })

  return {
    viewer,
    documentInfo,
    loading,
    error,
    loadDocument,
    getContent,
    save,
    setEditable,
    getDocumentInfo,
    destroy
  }
}
