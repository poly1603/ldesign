/**
 * Vue3 PDF预览器Hooks
 * 提供响应式的PDF预览功能
 */

import { ref, shallowRef, markRaw, reactive, computed, onMounted, onUnmounted, watch, type Ref } from 'vue'
import type {
  PdfInput,
  PdfViewerConfig,
  PdfViewerState,
  PdfDocumentInfo,
  PdfPageInfo,
  SearchOptions,
  SearchResult,
  ZoomMode,
  RotationAngle,
  DownloadOptions,
  PrintOptions,
  IPdfViewer,
} from '../../core/types'
import { PdfViewer } from '../../core/pdf-viewer'

/**
 * PDF预览器Hook选项
 */
export interface UsePdfViewerOptions extends Omit<PdfViewerConfig, 'container'> {
  /** 是否自动加载文档 */
  autoLoad?: boolean
  /** 初始文档 */
  initialDocument?: PdfInput
}

/**
 * PDF预览器Hook返回值
 */
export interface UsePdfViewerReturn {
  // 响应式状态
  state: Ref<PdfViewerState>
  documentInfo: Ref<PdfDocumentInfo | null>
  isLoading: Ref<boolean>
  error: Ref<Error | null>

  // 计算属性
  canGoPrevious: Ref<boolean>
  canGoNext: Ref<boolean>
  progress: Ref<number>

  // 方法
  loadDocument: (input: PdfInput) => Promise<void>
  goToPage: (pageNumber: number) => Promise<void>
  previousPage: () => Promise<void>
  nextPage: () => Promise<void>
  setZoom: (scale: number) => void
  setZoomMode: (mode: ZoomMode) => void
  zoomIn: () => void
  zoomOut: () => void
  rotate: (angle: RotationAngle) => void
  search: (options: SearchOptions) => Promise<SearchResult[]>
  enterFullscreen: () => void
  exitFullscreen: () => void
  download: (options?: DownloadOptions) => void
  print: (options?: PrintOptions) => void
  destroy: () => void

  // 内部实例（高级用法）
  viewer: Ref<IPdfViewer | null>
}

/**
 * PDF预览器Hook
 */
export function usePdfViewer(
  containerRef: Ref<HTMLElement | null>,
  options: UsePdfViewerOptions = {}
): UsePdfViewerReturn {
  // 响应式状态
  const state = ref<PdfViewerState>({
    isDocumentLoaded: false,
    currentPage: 1,
    totalPages: 0,
    currentScale: 1,
    currentZoomMode: 'fit-width',
    currentRotation: 0,
    isLoading: false,
    isFullscreen: false,
    searchState: {
      isSearching: false,
      query: '',
      currentMatch: 0,
      totalMatches: 0,
    },
  })

  const documentInfo = ref<PdfDocumentInfo | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const viewer = shallowRef<IPdfViewer | null>(null)

  // 计算属性
  const canGoPrevious = computed(() =>
    state.value.isDocumentLoaded && state.value.currentPage > 1
  )

  const canGoNext = computed(() =>
    state.value.isDocumentLoaded && state.value.currentPage < state.value.totalPages
  )

  const progress = computed(() =>
    state.value.totalPages > 0 ? (state.value.currentPage / state.value.totalPages) * 100 : 0
  )

  // 初始化预览器
  const initViewer = () => {
    if (!containerRef.value || viewer.value) {
      return
    }

    const config: PdfViewerConfig = {
      container: containerRef.value,
      ...options,
    }

    const pdfViewer = markRaw(new PdfViewer(config))

    // 绑定事件
    pdfViewer.on('documentLoaded', (info: PdfDocumentInfo) => {
      documentInfo.value = info
      state.value = pdfViewer.getState()
      isLoading.value = false
      error.value = null
    })

    pdfViewer.on('pageChanged', (pageNumber: number, pageInfo: PdfPageInfo) => {
      state.value = pdfViewer.getState()
    })

    pdfViewer.on('zoomChanged', (scale: number, zoomMode: ZoomMode) => {
      state.value = pdfViewer.getState()
    })

    pdfViewer.on('rotationChanged', (rotation: RotationAngle) => {
      state.value = pdfViewer.getState()
    })

    pdfViewer.on('searchResult', (results: SearchResult[]) => {
      state.value = pdfViewer.getState()
    })

    pdfViewer.on('error', (err: Error) => {
      error.value = err
      isLoading.value = false
    })

    pdfViewer.on('loadProgress', (progress: number) => {
      // 可以添加加载进度处理
    })

    pdfViewer.on('renderComplete', (pageNumber: number) => {
      state.value = pdfViewer.getState()
    })

    viewer.value = pdfViewer
  }

  // 方法实现
  const loadDocument = async (input: PdfInput): Promise<void> => {
    if (!viewer.value) {
      throw new Error('Viewer not initialized')
    }

    try {
      isLoading.value = true
      error.value = null
      await viewer.value.loadDocument(input)
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error')
      throw err
    }
  }

  const goToPage = async (pageNumber: number): Promise<void> => {
    if (!viewer.value) return
    await viewer.value.goToPage(pageNumber)
  }

  const previousPage = async (): Promise<void> => {
    if (!viewer.value) return
    await viewer.value.previousPage()
  }

  const nextPage = async (): Promise<void> => {
    if (!viewer.value) return
    await viewer.value.nextPage()
  }

  const setZoom = (scale: number): void => {
    if (!viewer.value) return
    viewer.value.setZoom(scale)
  }

  const setZoomMode = (mode: ZoomMode): void => {
    if (!viewer.value) return
    viewer.value.setZoomMode(mode)
  }

  const zoomIn = (): void => {
    if (!viewer.value) return
    viewer.value.zoomIn()
  }

  const zoomOut = (): void => {
    if (!viewer.value) return
    viewer.value.zoomOut()
  }

  const rotate = (angle: RotationAngle): void => {
    if (!viewer.value) return
    viewer.value.rotate(angle)
  }

  const search = async (options: SearchOptions): Promise<SearchResult[]> => {
    if (!viewer.value) return []
    return await viewer.value.search(options)
  }

  const enterFullscreen = (): void => {
    if (!viewer.value) return
    viewer.value.enterFullscreen()
  }

  const exitFullscreen = (): void => {
    if (!viewer.value) return
    viewer.value.exitFullscreen()
  }

  const download = (options?: DownloadOptions): void => {
    if (!viewer.value) return
    viewer.value.download(options)
  }

  const print = (options?: PrintOptions): void => {
    if (!viewer.value) return
    viewer.value.print(options)
  }

  const destroy = (): void => {
    if (viewer.value) {
      viewer.value.destroy()
      viewer.value = null
    }
  }

  // 监听容器变化
  watch(containerRef, (newContainer) => {
    if (newContainer && !viewer.value) {
      initViewer()

      // 自动加载初始文档
      if (options.autoLoad && options.initialDocument) {
        loadDocument(options.initialDocument).catch(console.error)
      }
    }
  }, { immediate: true })

  // 组件卸载时清理
  onUnmounted(() => {
    destroy()
  })

  return {
    // 响应式状态
    state,
    documentInfo,
    isLoading,
    error,

    // 计算属性
    canGoPrevious,
    canGoNext,
    progress,

    // 方法
    loadDocument,
    goToPage,
    previousPage,
    nextPage,
    setZoom,
    setZoomMode,
    zoomIn,
    zoomOut,
    rotate,
    search,
    enterFullscreen,
    exitFullscreen,
    download,
    print,
    destroy,

    // 内部实例
    viewer,
  }
}

/**
 * PDF搜索Hook
 */
export function usePdfSearch(viewer: Ref<IPdfViewer | null>) {
  const searchQuery = ref('')
  const searchResults = ref<SearchResult[]>([])
  const currentMatchIndex = ref(-1)
  const isSearching = ref(false)
  const searchOptions = reactive<SearchOptions>({
    query: '',
    caseSensitive: false,
    wholeWords: false,
    highlightAll: true,
    findPrevious: false,
  })

  const hasResults = computed(() => searchResults.value.length > 0)
  const currentMatch = computed(() =>
    currentMatchIndex.value >= 0 ? searchResults.value[currentMatchIndex.value] : null
  )

  const search = async (query: string): Promise<void> => {
    if (!viewer.value || !query.trim()) {
      searchResults.value = []
      currentMatchIndex.value = -1
      return
    }

    try {
      isSearching.value = true
      searchOptions.query = query
      searchQuery.value = query

      const results = await viewer.value.search(searchOptions)
      searchResults.value = results
      currentMatchIndex.value = results.length > 0 ? 0 : -1
    }
    catch (error) {
      console.error('Search failed:', error)
      searchResults.value = []
      currentMatchIndex.value = -1
    }
    finally {
      isSearching.value = false
    }
  }

  const findNext = (): void => {
    if (searchResults.value.length === 0) return
    currentMatchIndex.value = (currentMatchIndex.value + 1) % searchResults.value.length
  }

  const findPrevious = (): void => {
    if (searchResults.value.length === 0) return
    currentMatchIndex.value = currentMatchIndex.value <= 0
      ? searchResults.value.length - 1
      : currentMatchIndex.value - 1
  }

  const clearSearch = (): void => {
    searchQuery.value = ''
    searchResults.value = []
    currentMatchIndex.value = -1
    searchOptions.query = ''
  }

  return {
    searchQuery,
    searchResults,
    currentMatchIndex,
    isSearching,
    searchOptions,
    hasResults,
    currentMatch,
    search,
    findNext,
    findPrevious,
    clearSearch,
  }
}

/**
 * PDF缩略图Hook
 */
export function usePdfThumbnails(viewer: Ref<IPdfViewer | null>) {
  const thumbnails = ref<Map<number, HTMLCanvasElement>>(new Map())
  const isGenerating = ref(false)
  const showThumbnails = ref(false)

  const generateThumbnails = async (): Promise<void> => {
    if (!viewer.value || isGenerating.value) return

    try {
      isGenerating.value = true
      // TODO: 实现缩略图生成逻辑
      // 这需要访问内部的文档管理器和缩略图管理器
    }
    catch (error) {
      console.error('Failed to generate thumbnails:', error)
    }
    finally {
      isGenerating.value = false
    }
  }

  const toggleThumbnails = (): void => {
    showThumbnails.value = !showThumbnails.value
    if (showThumbnails.value && thumbnails.value.size === 0) {
      generateThumbnails()
    }
  }

  return {
    thumbnails,
    isGenerating,
    showThumbnails,
    generateThumbnails,
    toggleThumbnails,
  }
}
