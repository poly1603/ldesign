/**
 * 表单布局 Hook
 * 提供响应式布局和虚拟滚动功能
 */

import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import type { Ref, ComputedRef } from 'vue'

export interface LayoutBreakpoint {
  xs: number  // < 576px
  sm: number  // >= 576px
  md: number  // >= 768px
  lg: number  // >= 992px
  xl: number  // >= 1200px
  xxl: number // >= 1600px
}

export interface FormLayoutConfig {
  labelCol?: number | Partial<LayoutBreakpoint>
  wrapperCol?: number | Partial<LayoutBreakpoint>
  gutter?: number | [number, number]
  layout?: 'horizontal' | 'vertical' | 'inline'
  size?: 'small' | 'medium' | 'large'
  colon?: boolean
  requiredMark?: boolean
}

export interface VirtualScrollConfig {
  enabled: boolean
  itemHeight: number
  bufferSize?: number
  threshold?: number
}

export interface FormLayoutReturn {
  // 响应式布局
  currentBreakpoint: Ref<keyof LayoutBreakpoint>
  screenWidth: Ref<number>
  labelColClass: ComputedRef<string>
  wrapperColClass: ComputedRef<string>
  formClass: ComputedRef<string>
  
  // 虚拟滚动
  virtualScrollEnabled: Ref<boolean>
  visibleItems: ComputedRef<any[]>
  scrollTop: Ref<number>
  containerHeight: Ref<number>
  totalHeight: ComputedRef<number>
  
  // 方法
  updateLayout: () => void
  scrollToField: (fieldName: string) => void
  getFieldPosition: (fieldName: string) => number
}

/**
 * 表单布局 Hook
 */
export function useFormLayout(
  config: Ref<FormLayoutConfig>,
  virtualConfig?: Ref<VirtualScrollConfig>,
  items?: Ref<any[]>
): FormLayoutReturn {
  const screenWidth = ref(window.innerWidth)
  const scrollTop = ref(0)
  const containerHeight = ref(0)
  const containerRef = ref<HTMLElement>()

  // 断点定义
  const breakpoints: LayoutBreakpoint = {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1600
  }

  // 当前断点
  const currentBreakpoint = computed<keyof LayoutBreakpoint>(() => {
    const width = screenWidth.value
    if (width >= breakpoints.xxl) return 'xxl'
    if (width >= breakpoints.xl) return 'xl'
    if (width >= breakpoints.lg) return 'lg'
    if (width >= breakpoints.md) return 'md'
    if (width >= breakpoints.sm) return 'sm'
    return 'xs'
  })

  // 获取响应式列配置
  const getColConfig = (colConfig: number | Partial<LayoutBreakpoint> | undefined, defaultValue: number) => {
    if (typeof colConfig === 'number') {
      return colConfig
    }
    if (colConfig && typeof colConfig === 'object') {
      const bp = currentBreakpoint.value
      return colConfig[bp] ?? colConfig.lg ?? colConfig.md ?? colConfig.sm ?? colConfig.xs ?? defaultValue
    }
    return defaultValue
  }

  // 标签列样式类
  const labelColClass = computed(() => {
    const span = getColConfig(config.value.labelCol, 6)
    return `l-col-${span}`
  })

  // 包装列样式类
  const wrapperColClass = computed(() => {
    const span = getColConfig(config.value.wrapperCol, 18)
    return `l-col-${span}`
  })

  // 表单样式类
  const formClass = computed(() => {
    const classes = ['l-form']
    
    if (config.value.layout) {
      classes.push(`l-form--${config.value.layout}`)
    }
    
    if (config.value.size) {
      classes.push(`l-form--${config.value.size}`)
    }
    
    if (config.value.colon) {
      classes.push('l-form--colon')
    }
    
    if (config.value.requiredMark) {
      classes.push('l-form--required-mark')
    }
    
    return classes.join(' ')
  })

  // 虚拟滚动相关
  const virtualScrollEnabled = computed(() => {
    return virtualConfig?.value?.enabled && items?.value && items.value.length > (virtualConfig.value.threshold || 100)
  })

  const totalHeight = computed(() => {
    if (!virtualScrollEnabled.value || !items?.value || !virtualConfig?.value) {
      return 0
    }
    return items.value.length * virtualConfig.value.itemHeight
  })

  const visibleItems = computed(() => {
    if (!virtualScrollEnabled.value || !items?.value || !virtualConfig?.value) {
      return items?.value || []
    }

    const { itemHeight, bufferSize = 5 } = virtualConfig.value
    const containerH = containerHeight.value
    const scrollT = scrollTop.value

    const startIndex = Math.max(0, Math.floor(scrollT / itemHeight) - bufferSize)
    const endIndex = Math.min(
      items.value.length - 1,
      Math.ceil((scrollT + containerH) / itemHeight) + bufferSize
    )

    const visibleList = []
    for (let i = startIndex; i <= endIndex; i++) {
      visibleList.push({
        ...items.value[i],
        _virtualIndex: i,
        _virtualTop: i * itemHeight
      })
    }

    return visibleList
  })

  // 更新布局
  const updateLayout = () => {
    screenWidth.value = window.innerWidth
    if (containerRef.value) {
      containerHeight.value = containerRef.value.clientHeight
    }
  }

  // 滚动到指定字段
  const scrollToField = async (fieldName: string) => {
    await nextTick()
    
    if (virtualScrollEnabled.value && items?.value && virtualConfig?.value) {
      // 虚拟滚动模式
      const index = items.value.findIndex(item => item.name === fieldName)
      if (index !== -1) {
        const targetScrollTop = index * virtualConfig.value.itemHeight
        scrollTop.value = targetScrollTop
        
        if (containerRef.value) {
          containerRef.value.scrollTop = targetScrollTop
        }
      }
    } else {
      // 普通模式
      const element = document.querySelector(`[data-field="${fieldName}"]`) as HTMLElement
      if (element && containerRef.value) {
        const containerRect = containerRef.value.getBoundingClientRect()
        const elementRect = element.getBoundingClientRect()
        const scrollOffset = elementRect.top - containerRect.top + containerRef.value.scrollTop
        
        containerRef.value.scrollTo({
          top: scrollOffset - 20, // 留一些边距
          behavior: 'smooth'
        })
      }
    }
  }

  // 获取字段位置
  const getFieldPosition = (fieldName: string): number => {
    if (virtualScrollEnabled.value && items?.value && virtualConfig?.value) {
      const index = items.value.findIndex(item => item.name === fieldName)
      return index !== -1 ? index * virtualConfig.value.itemHeight : 0
    }
    
    const element = document.querySelector(`[data-field="${fieldName}"]`) as HTMLElement
    if (element && containerRef.value) {
      const containerRect = containerRef.value.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()
      return elementRect.top - containerRect.top + containerRef.value.scrollTop
    }
    
    return 0
  }

  // 处理滚动事件
  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement
    scrollTop.value = target.scrollTop
  }

  // 处理窗口大小变化
  const handleResize = () => {
    updateLayout()
  }

  // 生命周期
  onMounted(() => {
    updateLayout()
    window.addEventListener('resize', handleResize)
    
    if (containerRef.value) {
      containerRef.value.addEventListener('scroll', handleScroll, { passive: true })
    }
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    
    if (containerRef.value) {
      containerRef.value.removeEventListener('scroll', handleScroll)
    }
  })

  return {
    currentBreakpoint,
    screenWidth,
    labelColClass,
    wrapperColClass,
    formClass,
    virtualScrollEnabled,
    visibleItems,
    scrollTop,
    containerHeight,
    totalHeight,
    updateLayout,
    scrollToField,
    getFieldPosition
  }
}

/**
 * 虚拟滚动容器组件辅助函数
 */
export function createVirtualScrollContainer() {
  return {
    name: 'VirtualScrollContainer',
    props: {
      items: {
        type: Array,
        required: true
      },
      itemHeight: {
        type: Number,
        required: true
      },
      height: {
        type: [Number, String],
        default: 400
      },
      bufferSize: {
        type: Number,
        default: 5
      }
    },
    setup(props: any, { slots }: any) {
      const containerRef = ref<HTMLElement>()
      const scrollTop = ref(0)
      
      const visibleItems = computed(() => {
        const containerHeight = typeof props.height === 'number' ? props.height : 400
        const startIndex = Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.bufferSize)
        const endIndex = Math.min(
          props.items.length - 1,
          Math.ceil((scrollTop.value + containerHeight) / props.itemHeight) + props.bufferSize
        )
        
        const visible = []
        for (let i = startIndex; i <= endIndex; i++) {
          visible.push({
            ...props.items[i],
            _index: i,
            _top: i * props.itemHeight
          })
        }
        
        return visible
      })
      
      const totalHeight = computed(() => props.items.length * props.itemHeight)
      
      const handleScroll = (event: Event) => {
        const target = event.target as HTMLElement
        scrollTop.value = target.scrollTop
      }
      
      return {
        containerRef,
        visibleItems,
        totalHeight,
        handleScroll
      }
    },
    render() {
      const containerStyle = {
        height: typeof this.height === 'number' ? `${this.height}px` : this.height,
        overflow: 'auto'
      }
      
      const wrapperStyle = {
        height: `${this.totalHeight}px`,
        position: 'relative'
      }
      
      return (
        <div
          ref="containerRef"
          style={containerStyle}
          onScroll={this.handleScroll}
        >
          <div style={wrapperStyle}>
            {this.visibleItems.map((item: any) => (
              <div
                key={item._index}
                style={{
                  position: 'absolute',
                  top: `${item._top}px`,
                  left: 0,
                  right: 0,
                  height: `${this.itemHeight}px`
                }}
              >
                {this.$slots.default?.({ item, index: item._index })}
              </div>
            ))}
          </div>
        </div>
      )
    }
  }
}