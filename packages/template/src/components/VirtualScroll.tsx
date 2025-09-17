/**
 * 虚拟滚动组件
 * 
 * 用于优化长列表的渲染性能，只渲染可视区域内的元素
 */

import {
  defineComponent,
  ref,
  computed,
  onMounted,
  onUnmounted,
  watch,
  type PropType,
  type VNode,
  type CSSProperties
} from 'vue'

export interface VirtualScrollItem {
  id: string | number
  height?: number
  [key: string]: any
}

export const VirtualScroll = defineComponent({
  name: 'VirtualScroll',
  props: {
    /** 数据列表 */
    items: {
      type: Array as PropType<VirtualScrollItem[]>,
      required: true
    },
    /** 单个项目的高度（固定高度模式） */
    itemHeight: {
      type: Number,
      default: 0
    },
    /** 缓冲区大小（渲染视口外的项目数） */
    buffer: {
      type: Number,
      default: 5
    },
    /** 容器高度 */
    height: {
      type: [Number, String],
      default: 400
    },
    /** 是否启用动态高度 */
    dynamicHeight: {
      type: Boolean,
      default: false
    },
    /** 预加载阈值（距离底部多少像素时触发加载更多） */
    threshold: {
      type: Number,
      default: 100
    },
    /** 是否启用平滑滚动 */
    smoothScroll: {
      type: Boolean,
      default: true
    },
    /** 是否启用滚动条 */
    showScrollbar: {
      type: Boolean,
      default: true
    },
    /** 自定义类名 */
    customClass: {
      type: String,
      default: ''
    }
  },
  emits: ['scroll', 'loadMore', 'itemClick'],
  setup(props, { slots, emit }) {
    // Refs
    const containerRef = ref<HTMLElement>()
    const scrollTop = ref(0)
    const containerHeight = ref(0)
    const itemHeights = ref<Map<string | number, number>>(new Map())
    const visibleRange = ref({ start: 0, end: 0 })
    const isScrolling = ref(false)
    let scrollTimeout: NodeJS.Timeout | null = null
    let scrollRAF: number | null = null

    // 使用偏移缓存，避免为每个可见项 O(n) 计算偏移
    const offsets = ref<Map<string | number, number>>(new Map())

    const recomputeOffsets = () => {
      const map = new Map<string | number, number>()
      let offset = 0
      for (let i = 0; i < props.items.length; i++) {
        const it = props.items[i]
        if (!it) continue
        map.set(it.id, offset)
        const h = itemHeights.value.get(it.id) || props.itemHeight || 50
        offset += h
      }
      offsets.value = map
    }

    const scheduleRecompute = (() => {
      let raf: number | null = null
      return () => {
        if (typeof requestAnimationFrame === 'function') {
          if (raf != null) return
          raf = requestAnimationFrame(() => {
            recomputeOffsets()
            raf = null
          })
        } else {
          // 非浏览器环境降级处理
          recomputeOffsets()
        }
      }
    })()
    
    // 计算总高度
    const totalHeight = computed(() => {
      if (!props.dynamicHeight && props.itemHeight) {
        return props.items.length * props.itemHeight
      }
      
      let height = 0
      props.items.forEach(item => {
        const itemHeight = itemHeights.value.get(item.id) || props.itemHeight || 50
        height += itemHeight
      })
      return height
    })
    
    // 计算可见项目
    const visibleItems = computed(() => {
      const { start, end } = visibleRange.value
      const bufferStart = Math.max(0, start - props.buffer)
      const bufferEnd = Math.min(props.items.length, end + props.buffer)
      
      return props.items.slice(bufferStart, bufferEnd).map((item, index) => ({
        ...item,
        index: bufferStart + index,
        offset: getItemOffset(bufferStart + index)
      }))
    })
    
    // 获取项目偏移量
    const getItemOffset = (index: number): number => {
      if (!props.dynamicHeight && props.itemHeight) {
        return index * props.itemHeight
      }
      const item = props.items[index]
      if (!item) return 0
      return offsets.value.get(item.id) ?? 0
    }
    
    // 更新可见范围
    const updateVisibleRange = () => {
      if (!containerRef.value) return
      
      const scroll = scrollTop.value
      const height = containerHeight.value
      
      if (!props.dynamicHeight && props.itemHeight) {
        // 固定高度模式
        const start = Math.floor(scroll / props.itemHeight)
        const end = Math.ceil((scroll + height) / props.itemHeight)
        visibleRange.value = { start, end }
      } else {
        // 动态高度模式
        let accumulatedHeight = 0
        let start = 0
        let end = props.items.length
        
        for (let i = 0; i < props.items.length; i++) {
          const item = props.items[i]
          const itemHeight = item ? (itemHeights.value.get(item.id) || props.itemHeight || 50) : (props.itemHeight || 50)
          
          if (accumulatedHeight < scroll && !start) {
            start = i
          }
          
          accumulatedHeight += itemHeight
          
          if (accumulatedHeight > scroll + height) {
            end = i + 1
            break
          }
        }
        
        visibleRange.value = { start, end }
      }
      
      // 检查是否需要加载更多
      if (scroll + height >= totalHeight.value - props.threshold) {
        emit('loadMore')
      }
    }
    
    // 处理滚动事件
    const handleScroll = (event: Event) => {
      const target = event.target as HTMLElement
      scrollTop.value = target.scrollTop
      
      // 设置滚动状态
      isScrolling.value = true
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
      scrollTimeout = setTimeout(() => {
        isScrolling.value = false
      }, 150)

      const emitScroll = () => {
        const el = containerRef.value
        emit('scroll', {
          scrollTop: scrollTop.value,
          scrollHeight: el ? el.scrollHeight : 0,
          clientHeight: el ? el.clientHeight : 0
        })
      }
      
      if (typeof requestAnimationFrame === 'function') {
        if (scrollRAF != null) return
        scrollRAF = requestAnimationFrame(() => {
          updateVisibleRange()
          emitScroll()
          scrollRAF = null
        })
      } else {
        updateVisibleRange()
        emitScroll()
      }
    }
    
    // 处理容器大小变化
    const handleResize = () => {
      if (!containerRef.value) return
      containerHeight.value = containerRef.value.clientHeight
      updateVisibleRange()
    }
    
    // 滚动到指定位置
    const scrollTo = (offset: number, smooth = props.smoothScroll) => {
      if (!containerRef.value) return
      
      containerRef.value.scrollTo({
        top: offset,
        behavior: smooth ? 'smooth' : 'auto'
      })
    }
    
    // 滚动到指定索引
    const scrollToIndex = (index: number, smooth = props.smoothScroll) => {
      const offset = getItemOffset(index)
      scrollTo(offset, smooth)
    }
    
    // 滚动到指定元素
    const scrollToItem = (id: string | number, smooth = props.smoothScroll) => {
      const index = props.items.findIndex(item => item.id === id)
      if (index !== -1) {
        scrollToIndex(index, smooth)
      }
    }
    
    // 更新项目高度
    const updateItemHeight = (id: string | number, height: number) => {
      if (itemHeights.value.get(id) !== height) {
        itemHeights.value.set(id, height)
        // 调度重算偏移并更新可见范围
        scheduleRecompute()
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(() => updateVisibleRange())
        } else {
          updateVisibleRange()
        }
      }
    }
    
    // 监听数据变化
    // 当列表长度或引用变化时重算偏移，避免深度监听带来的性能消耗
    watch(() => props.items.length, () => {
      recomputeOffsets()
      updateVisibleRange()
    })
    watch(() => props.items, () => {
      recomputeOffsets()
      updateVisibleRange()
    })
    
    // 监听容器高度变化
    watch(() => props.height, () => {
      handleResize()
    })
    
    // 生命周期
    onMounted(() => {
      handleResize()
      recomputeOffsets()
      window.addEventListener('resize', handleResize)
      
      // 使用 ResizeObserver 监听容器大小变化
      if (containerRef.value && 'ResizeObserver' in window) {
        const resizeObserver = new ResizeObserver(() => {
          handleResize()
          // 容器尺寸变化可能影响布局，调度重算
          scheduleRecompute()
        })
        resizeObserver.observe(containerRef.value)
        
        onUnmounted(() => {
          resizeObserver.disconnect()
        })
      }
    })
    
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
      if (typeof cancelAnimationFrame === 'function' && scrollRAF != null) {
        cancelAnimationFrame(scrollRAF)
        scrollRAF = null
      }
    })
    
    // 暴露方法给父组件
    const exposed = {
      scrollTo,
      scrollToIndex,
      scrollToItem,
      updateItemHeight,
      refresh: updateVisibleRange
    }
    
    return {
      containerRef,
      visibleItems,
      totalHeight,
      isScrolling,
      handleScroll,
      ...exposed
    }
  },
  render() {
    const containerStyle: CSSProperties = {
      height: typeof this.height === 'number' ? `${this.height}px` : this.height,
      overflow: 'auto',
      position: 'relative',
      ...(this.smoothScroll && { scrollBehavior: 'smooth' }),
      ...(!this.showScrollbar && {
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      })
    }
    
    const contentStyle: CSSProperties = {
      height: `${this.totalHeight}px`,
      position: 'relative',
      willChange: this.isScrolling ? 'transform' : 'auto'
    }
    
    const renderItem = (item: any) => {
      const itemStyle: CSSProperties = {
        position: 'absolute',
        top: `${item.offset}px`,
        left: 0,
        right: 0,
        ...(this.dynamicHeight && {
          minHeight: this.itemHeight ? `${this.itemHeight}px` : 'auto'
        })
      }
      
      const itemContent = this.$slots.default?.({
        item: item,
        index: item.index,
        style: itemStyle
      })
      
      return (
        <div
          key={item.id}
          style={itemStyle}
          class="virtual-scroll-item"
          onClick={() => this.$emit('itemClick', item)}
          ref={(el: any) => {
            const elem = el as HTMLElement | null
            if (elem && this.dynamicHeight) {
              const height = elem.offsetHeight
              this.updateItemHeight(item.id, height)
            }
          }}
        >
          {itemContent}
        </div>
      )
    }
    
    return (
      <div
        ref={this.containerRef as any}
        class={['virtual-scroll-container', this.customClass].filter(Boolean).join(' ')}
        style={containerStyle}
        onScroll={this.handleScroll}
      >
        <div class="virtual-scroll-content" style={contentStyle}>
          {this.visibleItems.map(renderItem)}
        </div>
        
        {/* 加载指示器插槽 */}
        {this.$slots.loading && this.isScrolling && (
          <div class="virtual-scroll-loading">
            {this.$slots.loading()}
          </div>
        )}
        
        {/* 空状态插槽 */}
        {this.$slots.empty && this.items.length === 0 && (
          <div class="virtual-scroll-empty">
            {this.$slots.empty()}
          </div>
        )}
      </div>
    )
  }
})

// 导出类型
export type VirtualScrollInstance = InstanceType<typeof VirtualScroll>
