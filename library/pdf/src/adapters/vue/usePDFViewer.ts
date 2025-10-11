import { ref, onMounted, onUnmounted, watch, type Ref } from 'vue'
import { PDFViewer } from '../../core/PDFViewer'
import type { PDFViewerConfig, ZoomType, RotationAngle, SearchResult } from '../../types'
import type { PDFDocumentProxy } from 'pdfjs-dist'

/**
 * PDF查看器组合式API选项
 */
export interface UsePDFViewerOptions extends Omit<PDFViewerConfig, 'container'> {
  /** 是否自动初始化 */
  autoInit?: boolean
}

/**
 * PDF查看器组合式API返回值
 */
export interface UsePDFViewerReturn {
  /** 查看器实例 */
  viewer: Ref<PDFViewer | null>
  /** 当前页码 */
  currentPage: Ref<number>
  /** 总页数 */
  totalPages: Ref<number>
  /** 当前缩放比例 */
  currentZoom: Ref<number>
  /** 是否正在加载 */
  loading: Ref<boolean>
  /** 加载进度 */
  loadingProgress: Ref<{ loaded: number; total: number } | null>
  /** 错误信息 */
  error: Ref<Error | null>
  /** 搜索结果 */
  searchResults: Ref<SearchResult[]>
  /** 初始化查看器 */
  init: (container: HTMLElement) => Promise<void>
  /** 加载文档 */
  loadDocument: (url: string | Uint8Array) => Promise<void>
  /** 跳转到指定页 */
  goToPage: (page: number) => Promise<void>
  /** 下一页 */
  nextPage: () => Promise<void>
  /** 上一页 */
  previousPage: () => Promise<void>
  /** 设置缩放 */
  setZoom: (zoom: ZoomType) => void
  /** 旋转页面 */
  rotate: (angle: RotationAngle) => void
  /** 搜索文本 */
  search: (text: string) => Promise<void>
  /** 下载PDF */
  download: (filename?: string) => void
  /** 打印PDF */
  print: () => void
  /** 销毁查看器 */
  destroy: () => Promise<void>
}

/**
 * PDF查看器组合式API
 * @param options 配置选项
 */
export function usePDFViewer(options: UsePDFViewerOptions = {}): UsePDFViewerReturn {
  const viewer = ref<PDFViewer | null>(null)
  const currentPage = ref(1)
  const totalPages = ref(0)
  const currentZoom = ref(1.0)
  const loading = ref(false)
  const loadingProgress = ref<{ loaded: number; total: number } | null>(null)
  const error = ref<Error | null>(null)
  const searchResults = ref<SearchResult[]>([])

  /**
   * 初始化查看器
   */
  const init = async (container: HTMLElement) => {
    try {
      loading.value = true
      error.value = null

      const config: PDFViewerConfig = {
        ...options,
        container
      }

      viewer.value = new PDFViewer(config)

      // 监听事件
      setupEventListeners()

      loading.value = false
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      loading.value = false
      throw err
    }
  }

  /**
   * 设置事件监听器
   */
  const setupEventListeners = () => {
    if (!viewer.value) return

    viewer.value.on('document-loaded', (doc: PDFDocumentProxy) => {
      totalPages.value = doc.numPages
      currentPage.value = viewer.value!.getCurrentPage()
      currentZoom.value = viewer.value!.getCurrentZoom()
      loading.value = false
    })

    viewer.value.on('document-error', (err: Error) => {
      error.value = err
      loading.value = false
    })

    viewer.value.on('page-changed', (pageNumber: number) => {
      currentPage.value = pageNumber
    })

    viewer.value.on('zoom-changed', (scale: number) => {
      currentZoom.value = scale
    })

    viewer.value.on('loading-progress', (progress) => {
      loadingProgress.value = progress
    })

    viewer.value.on('search-results', (results) => {
      searchResults.value = results
    })
  }

  /**
   * 加载文档
   */
  const loadDocument = async (url: string | Uint8Array) => {
    if (!viewer.value) {
      throw new Error('Viewer not initialized')
    }

    try {
      loading.value = true
      error.value = null
      await viewer.value.loadDocument(url)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      loading.value = false
      throw err
    }
  }

  /**
   * 跳转到指定页
   */
  const goToPage = async (page: number) => {
    if (!viewer.value) {
      throw new Error('Viewer not initialized')
    }
    await viewer.value.goToPage(page)
  }

  /**
   * 下一页
   */
  const nextPage = async () => {
    if (!viewer.value) {
      throw new Error('Viewer not initialized')
    }
    await viewer.value.nextPage()
  }

  /**
   * 上一页
   */
  const previousPage = async () => {
    if (!viewer.value) {
      throw new Error('Viewer not initialized')
    }
    await viewer.value.previousPage()
  }

  /**
   * 设置缩放
   */
  const setZoom = (zoom: ZoomType) => {
    if (!viewer.value) {
      throw new Error('Viewer not initialized')
    }
    viewer.value.setZoom(zoom)
  }

  /**
   * 旋转页面
   */
  const rotate = (angle: RotationAngle) => {
    if (!viewer.value) {
      throw new Error('Viewer not initialized')
    }
    viewer.value.rotate(angle)
  }

  /**
   * 搜索文本
   */
  const search = async (text: string) => {
    if (!viewer.value) {
      throw new Error('Viewer not initialized')
    }
    await viewer.value.search(text)
  }

  /**
   * 下载PDF
   */
  const download = (filename?: string) => {
    if (!viewer.value) {
      throw new Error('Viewer not initialized')
    }
    viewer.value.download(filename)
  }

  /**
   * 打印PDF
   */
  const print = () => {
    if (!viewer.value) {
      throw new Error('Viewer not initialized')
    }
    viewer.value.print()
  }

  /**
   * 销毁查看器
   */
  const destroy = async () => {
    if (viewer.value) {
      await viewer.value.destroy()
      viewer.value = null
    }
  }

  // 组件卸载时销毁查看器
  onUnmounted(() => {
    destroy()
  })

  // 监听URL变化
  if (options.url) {
    watch(() => options.url, (newUrl) => {
      if (newUrl && viewer.value) {
        loadDocument(newUrl)
      }
    })
  }

  return {
    viewer,
    currentPage,
    totalPages,
    currentZoom,
    loading,
    loadingProgress,
    error,
    searchResults,
    init,
    loadDocument,
    goToPage,
    nextPage,
    previousPage,
    setZoom,
    rotate,
    search,
    download,
    print,
    destroy
  }
}
