/**
 * Vue3 PDF预览器组件
 * 提供完整的PDF预览功能
 */

import { defineComponent, ref, onMounted, type PropType } from 'vue'
import type {
  PdfInput,
  ZoomMode,
  RotationAngle,
  SearchOptions,
  DownloadOptions,
  PrintOptions,
} from '../../core/types'
import { usePdfViewer, usePdfSearch } from './hooks'
import './PdfViewer.less'

export default defineComponent({
  name: 'PdfViewer',
  props: {
    /** PDF文档输入 */
    src: {
      type: [String, File, ArrayBuffer, Uint8Array] as PropType<PdfInput>,
      required: true,
    },
    /** 初始缩放比例 */
    initialScale: {
      type: Number,
      default: 1,
    },
    /** 初始页面 */
    initialPage: {
      type: Number,
      default: 1,
    },
    /** 缩放模式 */
    zoomMode: {
      type: String as PropType<ZoomMode>,
      default: 'fit-width',
    },
    /** 是否启用工具栏 */
    enableToolbar: {
      type: Boolean,
      default: true,
    },
    /** 是否启用侧边栏 */
    enableSidebar: {
      type: Boolean,
      default: true,
    },
    /** 是否启用搜索 */
    enableSearch: {
      type: Boolean,
      default: true,
    },
    /** 是否启用缩略图 */
    enableThumbnails: {
      type: Boolean,
      default: true,
    },
    /** 是否启用全屏 */
    enableFullscreen: {
      type: Boolean,
      default: true,
    },
    /** 是否启用下载 */
    enableDownload: {
      type: Boolean,
      default: true,
    },
    /** 是否启用打印 */
    enablePrint: {
      type: Boolean,
      default: true,
    },
    /** 自定义样式 */
    customStyles: {
      type: Object as PropType<Record<string, string>>,
      default: () => ({}),
    },
    /** 本地化配置 */
    locale: {
      type: String,
      default: 'zh-CN',
    },
  },
  emits: [
    'documentLoaded',
    'pageChanged',
    'zoomChanged',
    'rotationChanged',
    'searchResult',
    'error',
    'loadProgress',
    'renderComplete',
  ],
  setup(props, { emit, expose }) {
    const containerRef = ref<HTMLElement>()
    const searchInputRef = ref<HTMLInputElement>()
    const showSidebar = ref(props.enableSidebar)
    const showSearch = ref(false)

    // 使用PDF预览器Hook
    const {
      state,
      documentInfo,
      isLoading,
      error,
      canGoPrevious,
      canGoNext,
      progress,
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
      viewer,
    } = usePdfViewer(containerRef, {
      initialScale: props.initialScale,
      initialPage: props.initialPage,
      zoomMode: props.zoomMode,
      enableToolbar: props.enableToolbar,
      enableSidebar: props.enableSidebar,
      enableSearch: props.enableSearch,
      enableThumbnails: props.enableThumbnails,
      enableFullscreen: props.enableFullscreen,
      enableDownload: props.enableDownload,
      enablePrint: props.enablePrint,
      customStyles: props.customStyles,
      locale: props.locale,
      autoLoad: true,
      initialDocument: props.src,
    })

    // 使用搜索Hook
    const {
      searchQuery,
      searchResults,
      currentMatchIndex,
      isSearching,
      hasResults,
      currentMatch,
      search: performSearch,
      findNext,
      findPrevious,
      clearSearch,
    } = usePdfSearch(viewer)

    // 监听事件并转发
    onMounted(() => {
      if (viewer.value) {
        viewer.value.on('documentLoaded', (info) => emit('documentLoaded', info))
        viewer.value.on('pageChanged', (pageNumber, pageInfo) => emit('pageChanged', pageNumber, pageInfo))
        viewer.value.on('zoomChanged', (scale, zoomMode) => emit('zoomChanged', scale, zoomMode))
        viewer.value.on('rotationChanged', (rotation) => emit('rotationChanged', rotation))
        viewer.value.on('searchResult', (results) => emit('searchResult', results))
        viewer.value.on('error', (err) => emit('error', err))
        viewer.value.on('loadProgress', (progress) => emit('loadProgress', progress))
        viewer.value.on('renderComplete', (pageNumber) => emit('renderComplete', pageNumber))
      }
    })

    // 搜索处理
    const handleSearch = async () => {
      if (searchQuery.value.trim()) {
        await performSearch(searchQuery.value)
      } else {
        clearSearch()
      }
    }

    const handleSearchKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        if (event.shiftKey) {
          findPrevious()
        } else {
          if (hasResults.value) {
            findNext()
          } else {
            handleSearch()
          }
        }
      } else if (event.key === 'Escape') {
        showSearch.value = false
        clearSearch()
      }
    }

    // 页面跳转处理
    const handlePageInput = (event: Event) => {
      const target = event.target as HTMLInputElement
      const pageNumber = parseInt(target.value, 10)
      if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= state.value.totalPages) {
        goToPage(pageNumber)
      }
    }

    // 缩放处理
    const handleZoomChange = (event: Event) => {
      const target = event.target as HTMLSelectElement
      const value = target.value
      
      if (value === 'custom') {
        return
      } else if (['fit-width', 'fit-page', 'auto'].includes(value)) {
        setZoomMode(value as ZoomMode)
      } else {
        const scale = parseFloat(value)
        if (!isNaN(scale)) {
          setZoom(scale)
        }
      }
    }

    // 暴露方法给父组件
    expose({
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
      getState: () => state.value,
      getDocumentInfo: () => documentInfo.value,
    })

    return () => (
      <div class="ldesign-pdf-viewer-wrapper">
        {/* 工具栏 */}
        {props.enableToolbar && (
          <div class="pdf-toolbar">
            <div class="toolbar-group">
              {/* 页面导航 */}
              <button
                class="toolbar-btn"
                disabled={!canGoPrevious.value}
                onClick={previousPage}
                title="上一页"
              >
                ←
              </button>
              <div class="page-info">
                <input
                  type="number"
                  class="page-input"
                  value={state.value.currentPage}
                  min={1}
                  max={state.value.totalPages}
                  onChange={handlePageInput}
                />
                <span class="page-total">/ {state.value.totalPages}</span>
              </div>
              <button
                class="toolbar-btn"
                disabled={!canGoNext.value}
                onClick={nextPage}
                title="下一页"
              >
                →
              </button>
            </div>

            <div class="toolbar-group">
              {/* 缩放控制 */}
              <button class="toolbar-btn" onClick={zoomOut} title="缩小">
                -
              </button>
              <select class="zoom-select" onChange={handleZoomChange}>
                <option value="fit-width">适应宽度</option>
                <option value="fit-page">适应页面</option>
                <option value="auto">自动</option>
                <option value="0.5">50%</option>
                <option value="0.75">75%</option>
                <option value="1">100%</option>
                <option value="1.25">125%</option>
                <option value="1.5">150%</option>
                <option value="2">200%</option>
              </select>
              <button class="toolbar-btn" onClick={zoomIn} title="放大">
                +
              </button>
            </div>

            <div class="toolbar-group">
              {/* 旋转 */}
              <button
                class="toolbar-btn"
                onClick={() => rotate((state.value.currentRotation + 90) % 360 as RotationAngle)}
                title="旋转"
              >
                ↻
              </button>

              {/* 搜索 */}
              {props.enableSearch && (
                <button
                  class={`toolbar-btn ${showSearch.value ? 'active' : ''}`}
                  onClick={() => {
                    showSearch.value = !showSearch.value
                    if (showSearch.value) {
                      setTimeout(() => searchInputRef.value?.focus(), 100)
                    }
                  }}
                  title="搜索"
                >
                  🔍
                </button>
              )}

              {/* 侧边栏 */}
              {props.enableSidebar && (
                <button
                  class={`toolbar-btn ${showSidebar.value ? 'active' : ''}`}
                  onClick={() => showSidebar.value = !showSidebar.value}
                  title="侧边栏"
                >
                  ☰
                </button>
              )}

              {/* 全屏 */}
              {props.enableFullscreen && (
                <button
                  class="toolbar-btn"
                  onClick={state.value.isFullscreen ? exitFullscreen : enterFullscreen}
                  title={state.value.isFullscreen ? '退出全屏' : '全屏'}
                >
                  {state.value.isFullscreen ? '⤓' : '⤢'}
                </button>
              )}

              {/* 下载 */}
              {props.enableDownload && (
                <button
                  class="toolbar-btn"
                  onClick={() => download()}
                  title="下载"
                  disabled={!state.value.isDocumentLoaded}
                >
                  ↓
                </button>
              )}

              {/* 打印 */}
              {props.enablePrint && (
                <button
                  class="toolbar-btn"
                  onClick={() => print()}
                  title="打印"
                  disabled={!state.value.isDocumentLoaded}
                >
                  🖨
                </button>
              )}
            </div>
          </div>
        )}

        {/* 搜索栏 */}
        {showSearch.value && props.enableSearch && (
          <div class="pdf-search-bar">
            <input
              ref={searchInputRef}
              type="text"
              class="search-input"
              placeholder="搜索文档..."
              v-model={searchQuery.value}
              onKeydown={handleSearchKeydown}
            />
            <div class="search-controls">
              <button
                class="search-btn"
                onClick={findPrevious}
                disabled={!hasResults.value}
                title="上一个"
              >
                ↑
              </button>
              <button
                class="search-btn"
                onClick={findNext}
                disabled={!hasResults.value}
                title="下一个"
              >
                ↓
              </button>
              <span class="search-results">
                {hasResults.value ? `${currentMatchIndex.value + 1} / ${searchResults.value.length}` : ''}
              </span>
              <button
                class="search-btn"
                onClick={() => {
                  showSearch.value = false
                  clearSearch()
                }}
                title="关闭"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div class="pdf-content">
          {/* 侧边栏 */}
          {showSidebar.value && props.enableSidebar && (
            <div class="pdf-sidebar">
              <div class="sidebar-content">
                {/* 缩略图区域 */}
                {props.enableThumbnails && (
                  <div class="thumbnails-section">
                    <h3>页面缩略图</h3>
                    <div class="thumbnails-container">
                      {/* TODO: 实现缩略图列表 */}
                      <div class="thumbnail-placeholder">
                        缩略图加载中...
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 主要内容区域 */}
          <div class="pdf-main">
            {/* 加载状态 */}
            {isLoading.value && (
              <div class="pdf-loading">
                <div class="loading-spinner"></div>
                <div class="loading-text">加载中...</div>
              </div>
            )}

            {/* 错误状态 */}
            {error.value && (
              <div class="pdf-error">
                <div class="error-icon">⚠</div>
                <div class="error-message">{error.value.message}</div>
              </div>
            )}

            {/* PDF容器 */}
            <div
              ref={containerRef}
              class="pdf-container"
              style={{
                display: isLoading.value || error.value ? 'none' : 'block',
                ...props.customStyles,
              }}
            />
          </div>
        </div>

        {/* 进度条 */}
        {isLoading.value && (
          <div class="pdf-progress">
            <div class="progress-bar" style={{ width: `${progress.value}%` }} />
          </div>
        )}
      </div>
    )
  },
})
