/**
 * Vue3 PDF预览器组件
 * 提供完整的PDF预览功能
 */

import { defineComponent, ref, onMounted, onBeforeUnmount, watch, nextTick, type PropType } from 'vue'
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
    /** 高度模式：auto（自适应一页）、custom（自定义固定高度可滚动） */
    heightMode: {
      type: String as PropType<'auto' | 'custom'>,
      default: 'auto',
    },
    /** 自定义高度（heightMode=custom 时生效），支持如 '600px' 或 600（px） */
    height: {
      type: [String, Number] as PropType<string | number>,
      default: '',
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
    'visiblePagesChanged',
  ],
  setup(props, { emit, expose }) {
    const containerRef = ref<HTMLElement | null>(null)
    const searchInputRef = ref<HTMLInputElement | null>(null)
    const showSidebar = ref(props.enableSidebar)
    const showSearch = ref(false)
    const thumbnails = ref<Array<{ pageNumber: number; canvas: HTMLCanvasElement }>>([])
    const thumbnailsLoading = ref(false)
    const thumbnailsContainerRef = ref<HTMLElement | null>(null)
    // 控制自动高度模式下的页面切换动画
    const animateNextPage = ref(false)
    // 缩略图生成序列，防止并发导致的乱序
    let thumbnailGenSeq = 0

    // 滚动相关状态
    const isScrolling = ref(false)
    const scrollTimeout = ref<number | null>(null)
    const currentVisiblePages = ref<number[]>([])
    const lastScrollTop = ref(0)

    // 自适应高度相关状态
    const autoHeight = ref<string>('auto')
    const isCalculatingHeight = ref(false)

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
      getDocument,
      getDocumentInfo,
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

    // 生成缩略图
    const generateThumbnails = async () => {
      if (!state.value.isDocumentLoaded) return

      thumbnailsLoading.value = true
      const thisGen = ++thumbnailGenSeq
      const ordered: Array<{ pageNumber: number; canvas: HTMLCanvasElement }> = []

      try {
        const doc = await getDocument()
        if (!doc) return

        for (let pageNum = 1; pageNum <= state.value.totalPages; pageNum++) {
          // 如果有新的生成任务启动，终止旧任务
          if (thisGen !== thumbnailGenSeq) return

          const page = await doc.getPage(pageNum)
          const viewport = page.getViewport({ scale: 0.2 }) // 小尺寸缩略图

          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          if (!context) continue

          canvas.width = viewport.width
          canvas.height = viewport.height

          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise

          // 保证顺序：按页码顺序填充并整体替换
          ordered.push({ pageNumber: pageNum, canvas })
          // 渐进式更新，但保持顺序
          thumbnails.value = ordered.slice()
        }
      } catch (error) {
        console.error('Failed to generate thumbnails:', error)
      } finally {
        if (thisGen === thumbnailGenSeq) {
          thumbnailsLoading.value = false
        }
      }
    }
    // 将当前激活的缩略图滚动到可视区域中间
    // 将当前激活的缩略图滚动到容器顶部（无动画）
    const scrollActiveThumbnailToTop = () => {
      const container = thumbnailsContainerRef.value
      if (!container) return
      const currentPage = state.value.currentPage
      const active = container.querySelector(`.pdf-thumbnail[data-page-number="${currentPage}"]`) as HTMLElement | null
      if (active) {
        const offsetTop = (active as HTMLElement).offsetTop
        container.scrollTop = offsetTop - 8 /* 微调上边距 */
      }
    }

    // 更新缩略图选中状态
    const updateThumbnailActiveState = () => {
      const container = thumbnailsContainerRef.value
      if (!container) return
      const currentPage = state.value.currentPage
      const allThumbnails = container.querySelectorAll('.pdf-thumbnail')
      allThumbnails.forEach((el) => el.classList.remove('active'))
      const active = container.querySelector(`.pdf-thumbnail[data-page-number="${currentPage}"]`)
      if (active) active.classList.add('active')
    }


    // 缩略图点击处理
    let lastThumbClick = false
    const handleThumbnailClick = (pageNumber: number) => {
      lastThumbClick = true;
      if (props.heightMode === 'custom' && viewer.value) {
        // 在多页模式下，滚动到指定页面，并将选中缩略图顶对齐（无动画）
        const scrollPosition = viewer.value.getPageScrollPosition(pageNumber)
        if (containerRef.value) {
          containerRef.value.scrollTo({ top: scrollPosition, behavior: 'smooth' })
        }
        // 先更新选中态再顶对齐
        state.value.currentPage = pageNumber
        updateThumbnailActiveState()
        scrollActiveThumbnailToTop()
      } else {
        // 自适应高度：切页并触发右侧内容动画
        animateNextPage.value = true
        goToPage(pageNumber)
      }
    }

    // 滚动事件处理
    const handleScroll = () => {
      if (!containerRef.value || !viewer.value || props.heightMode !== 'custom') {
        return
      }

      const container = containerRef.value
      const scrollTop = container.scrollTop
      const containerHeight = container.clientHeight

      // 防抖处理
      if (scrollTimeout.value) {
        clearTimeout(scrollTimeout.value)
      }

      isScrolling.value = true
      lastScrollTop.value = scrollTop

      scrollTimeout.value = window.setTimeout(() => {
        isScrolling.value = false

        // 计算当前可见页面
        const visibleInfo = viewer.value!.calculateVisiblePages(scrollTop, containerHeight)

        // 触发虚拟滚动更新（按需渲染/回收）
        viewer.value!.updateVisiblePages(scrollTop, containerHeight)

        if (visibleInfo.currentPage !== state.value.currentPage) {
          // 更新当前页面（不触发重新渲染）
          state.value.currentPage = visibleInfo.currentPage
          emit('pageChanged', visibleInfo.currentPage, {} as any)
        }

        if (JSON.stringify(visibleInfo.visiblePages) !== JSON.stringify(currentVisiblePages.value)) {
          currentVisiblePages.value = visibleInfo.visiblePages
          emit('visiblePagesChanged', visibleInfo.currentPage, visibleInfo.visiblePages)
        }

        // 更新缩略图选中状态并将其顶对齐（固定高度模式）
        updateThumbnailActiveState()
        if (props.heightMode === 'custom') scrollActiveThumbnailToTop()
      }, 150)
    }

    // 设置滚动监听器
    const setupScrollListener = () => {
      if (containerRef.value && props.heightMode === 'custom') {
        containerRef.value.addEventListener('scroll', handleScroll, { passive: true })
      }
    }

    // 移除滚动监听器
    const removeScrollListener = () => {
      if (containerRef.value) {
        containerRef.value.removeEventListener('scroll', handleScroll)
      }
    }

    // 计算自适应高度
    const calculateAutoHeight = async () => {
      if (!viewer.value || !state.value.isDocumentLoaded || props.heightMode !== 'auto') {
        return
      }

      try {
        isCalculatingHeight.value = true

        // 获取当前页面
        const doc = await getDocument()
        if (!doc) return

        const page = await doc.getPage(state.value.currentPage)
        const viewport = page.getViewport({
          scale: state.value.currentScale,
          rotation: state.value.currentRotation
        })

        // 计算容器需要的高度（页面高度 + 内边距）
        const padding = 40 // 上下各20px内边距
        const calculatedHeight = viewport.height + padding

        autoHeight.value = `${calculatedHeight}px`

        // 在自适应高度模式下，设置容器确切高度为“页面高 + 内边距”，避免额外空白
        if (containerRef.value) {
          containerRef.value.style.height = autoHeight.value
          containerRef.value.style.minHeight = 'auto'
          containerRef.value.style.maxHeight = 'none'
          containerRef.value.style.overflow = 'visible'
        }

        // 同步左侧缩略图容器的高度，使其与右侧内容区一致
        if (thumbnailsContainerRef.value) {
          thumbnailsContainerRef.value.style.height = autoHeight.value
          thumbnailsContainerRef.value.style.overflowY = 'auto'
        }
      } catch (error) {
        console.error('Failed to calculate auto height:', error)
      } finally {
        isCalculatingHeight.value = false
      }
    }

    // 重置容器高度
    const resetContainerHeight = () => {
      if (containerRef.value) {
        if (props.heightMode === 'auto') {
          containerRef.value.style.height = 'auto'
          containerRef.value.style.minHeight = autoHeight.value
          containerRef.value.style.maxHeight = 'none'
          containerRef.value.style.overflow = 'visible'
        } else if (props.heightMode === 'custom' && props.height) {
          const height = typeof props.height === 'number' ? `${props.height}px` : props.height
          containerRef.value.style.height = height
          containerRef.value.style.minHeight = 'auto'
          containerRef.value.style.maxHeight = 'none'
          containerRef.value.style.overflow = 'auto'
          // 清除左侧缩略图容器在 auto 模式下设置的固定高度，回归flex布局
          if (thumbnailsContainerRef.value) {
            thumbnailsContainerRef.value.style.height = ''
          }
        } else {
          containerRef.value.style.height = 'auto'
        }
      }
    }

    // 监听viewer变化并设置事件监听器
    watch(viewer, (newViewer) => {
      if (newViewer) {
        newViewer.on('documentLoaded', (info) => {
          emit('documentLoaded', info)

          // 根据高度模式设置渲染模式
          if (props.heightMode === 'auto') {
            newViewer.setHeightMode('auto')
          } else {
            newViewer.setHeightMode('custom', props.height)
          }

          // 文档加载完成后生成缩略图，并将激活缩略图顶对齐（无动画）
          if (props.enableThumbnails) {
            setTimeout(() => {
              generateThumbnails()
              scrollActiveThumbnailToTop()
            }, 100)
          } else {
            setTimeout(() => scrollActiveThumbnailToTop(), 100)
          }

          // 设置滚动监听器和计算高度
          setTimeout(() => {
            setupScrollListener()
            calculateAutoHeight()
          }, 200)
        })
        newViewer.on('pageChanged', (pageNumber, pageInfo) => {
          emit('pageChanged', pageNumber, pageInfo)
          updateThumbnailActiveState()
          // 自适应高度：若由点击触发，不滚动缩略图；否则保持选中项在顶部
          if (props.heightMode === 'auto') {
            if (!lastThumbClick) scrollActiveThumbnailToTop()
            lastThumbClick = false
            setTimeout(() => calculateAutoHeight(), 100)
          } else {
            // 固定高度：始终将选中项顶对齐，避免中间位置错位
            scrollActiveThumbnailToTop()
          }
        })

        // 监听 src 变化，动态重新加载PDF
        watch(() => props.src, (newSrc) => {
          if (newSrc && viewer.value) {
            loadDocument(newSrc as PdfInput)
              .then(() => {
                if (props.enableThumbnails) {
                  setTimeout(() => {
                    generateThumbnails()
                    scrollActiveThumbnailToTop()
                  }, 100)
                }
              })
              .catch((err) => emit('error', err as Error))
          }
        })

        newViewer.on('zoomChanged', (scale, zoomMode) => {
          emit('zoomChanged', scale, zoomMode)
          // 缩放变化时重新计算自适应高度
          if (props.heightMode === 'auto') {
            setTimeout(() => calculateAutoHeight(), 100)
          }
        })
        newViewer.on('rotationChanged', (rotation) => {
          emit('rotationChanged', rotation)
          // 旋转变化时重新计算自适应高度
          if (props.heightMode === 'auto') {
            setTimeout(() => calculateAutoHeight(), 100)
          }
        })
        newViewer.on('searchResult', (results) => emit('searchResult', results))
        newViewer.on('error', (err) => emit('error', err))
        newViewer.on('loadProgress', (progress) => emit('loadProgress', progress))
        newViewer.on('renderComplete', (pageNumber) => {
          emit('renderComplete', pageNumber)
          // 自动高度模式：在缩略图点击后，为右侧内容添加过渡动画
          if (props.heightMode === 'auto' && animateNextPage.value) {
            // 渲染完成后短暂停留，确保动画可见
            setTimeout(() => { animateNextPage.value = false }, 260)
          }
        })

        // 监听新的事件
        newViewer.on('allPagesRendered', (pageInfos) => {
          // 多页渲染完成后设置滚动监听器
          setTimeout(() => {
            setupScrollListener()
          }, 100)
        })

        newViewer.on('visiblePagesChanged', (currentPage, visiblePages) => {
          emit('visiblePagesChanged', currentPage, visiblePages)
        })
      }
    }, { immediate: true })

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

    // 监听高度模式变化
    watch(() => props.heightMode, (newMode, oldMode) => {
      if (newMode !== oldMode && viewer.value) {
        removeScrollListener()

        if (newMode === 'auto') {
          viewer.value.setHeightMode('auto')
        } else {
          viewer.value.setHeightMode('custom', props.height)
        }

        setTimeout(() => {
          setupScrollListener()
          if (newMode === 'auto') {
            calculateAutoHeight()
          } else {
            resetContainerHeight()
          }
        }, 100)
      }
    })

    // 监听自定义高度变化
    watch(() => props.height, (newHeight) => {
      if (props.heightMode === 'custom' && viewer.value) {
        viewer.value.setHeightMode('custom', newHeight)
        resetContainerHeight()
      }
    })

    // 组件销毁时清理
    onBeforeUnmount(() => {
      removeScrollListener()
      if (scrollTimeout.value) {
        clearTimeout(scrollTimeout.value)
      }
    })

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
      // 新增的方法
      getPageRenderInfos: () => viewer.value?.getPageRenderInfos() || [],
      calculateVisiblePages: (scrollTop: number, containerHeight: number) =>
        viewer.value?.calculateVisiblePages(scrollTop, containerHeight) || { currentPage: 1, visiblePages: [] },
      getPageScrollPosition: (pageNumber: number) =>
        viewer.value?.getPageScrollPosition(pageNumber) || 0,
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
                onClick={() => {
                  findPrevious()
                  // 跳转到当前匹配位置
                  setTimeout(() => {
                    if (!containerRef.value || !viewer.value || !currentMatch.value) return
                    if (props.heightMode === 'custom') {
                      const pageTop = viewer.value.getPageScrollPosition(currentMatch.value.pageNumber)
                      const targetTop = Math.max(0, pageTop + currentMatch.value.position.y - 40)
                      containerRef.value.scrollTo({ top: targetTop, behavior: 'smooth' })
                    } else {
                      goToPage(currentMatch.value.pageNumber)
                    }
                  }, 0)
                }}
                disabled={!hasResults.value}
                title="上一个"
              >
                ↑
              </button>
              <button
                class="search-btn"
                onClick={() => {
                  findNext()
                  setTimeout(() => {
                    if (!containerRef.value || !viewer.value || !currentMatch.value) return
                    if (props.heightMode === 'custom') {
                      const pageTop = viewer.value.getPageScrollPosition(currentMatch.value.pageNumber)
                      const targetTop = Math.max(0, pageTop + currentMatch.value.position.y - 40)
                      containerRef.value.scrollTo({ top: targetTop, behavior: 'smooth' })
                    } else {
                      goToPage(currentMatch.value.pageNumber)
                    }
                  }, 0)
                }}
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
                    <div class="thumbnails-container" ref={thumbnailsContainerRef}>
                      {thumbnailsLoading.value ? (
                        <div class="thumbnail-placeholder">
                          缩略图加载中...
                        </div>
                      ) : thumbnails.value.length > 0 ? (
                        [...thumbnails.value].sort((a, b) => a.pageNumber - b.pageNumber).map((thumbnail) => (
                          <div
                            key={thumbnail.pageNumber}
                            class={`pdf-thumbnail ${state.value.currentPage === thumbnail.pageNumber ? 'active' : ''}`}
                            data-page-number={thumbnail.pageNumber}
                            onClick={() => handleThumbnailClick(thumbnail.pageNumber)}
                            title={`第 ${thumbnail.pageNumber} 页`}
                          >
                            <div class="thumbnail-image">
                              {/* 将canvas添加到DOM */}
<div ref={(el) => {
                                const host = el as unknown as HTMLElement | null
                                if (host && !host.querySelector('canvas')) {
                                  host.appendChild(thumbnail.canvas)
                                }
                              }} />
                            </div>
                            <div class="thumbnail-label">
                              {thumbnail.pageNumber}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div class="thumbnail-placeholder">
                          暂无缩略图
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 主要内容区域 */}
          <div class={`pdf-main ${props.heightMode === 'auto' ? 'auto-height-mode' : ''}`}>
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
              class={`pdf-container ${props.heightMode === 'auto' ? 'single-page auto-height' : 'custom-height'} ${props.heightMode === 'auto' && animateNextPage.value ? 'page-animate' : ''}`}
              style={{
                display: isLoading.value || error.value ? 'none' : 'block',
                height: props.heightMode === 'custom' && props.height
                  ? (typeof props.height === 'number' ? `${props.height}px` : props.height)
                  : props.heightMode === 'auto' ? 'auto' : undefined,
                overflow: props.heightMode === 'custom' ? 'auto' : 'visible',
                minHeight: props.heightMode === 'auto' ? autoHeight.value : undefined,
                maxHeight: props.heightMode === 'auto' ? 'none' : undefined,
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
