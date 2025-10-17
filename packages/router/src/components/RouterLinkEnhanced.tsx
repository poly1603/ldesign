/**
 * @ldesign/router RouterLink 增强版组件
 * 
 * 提供更多功能和更好的性能
 */

import type { RouteLocationRaw } from '../types'
import { 
  computed, 
  defineComponent, 
  h, 
  onMounted, 
  onUnmounted, 
  type PropType, 
  ref,
  Transition 
} from 'vue'
import { useLink, useRoute, useRouter } from '../composables'
import { logger } from '../utils/logger'

// 预加载管理器
class PreloadManager {
  private static preloadCache = new Set<string>()
  private static pendingPreloads = new Map<string, Promise<any>>()
  
  static async preload(route: any, router: any) {
    const key = typeof route === 'string' ? route : JSON.stringify(route)
    
    // 已经预加载过
    if (this.preloadCache.has(key)) {
      return
    }
    
    // 正在预加载中
    if (this.pendingPreloads.has(key)) {
      return this.pendingPreloads.get(key)
    }
    
    const preloadPromise = (async () => {
      try {
        const resolved = router.resolve(route)
        const matched = resolved.matched[resolved.matched.length - 1]
        const component = matched?.components?.default
        
        if (component && typeof component === 'function') {
          await component()
          this.preloadCache.add(key)
        }
      } catch (error) {
        logger.warn('预加载失败:', error)
      } finally {
        this.pendingPreloads.delete(key)
      }
    })()
    
    this.pendingPreloads.set(key, preloadPromise)
    return preloadPromise
  }
  
  static isPreloaded(route: any): boolean {
    const key = typeof route === 'string' ? route : JSON.stringify(route)
    return this.preloadCache.has(key)
  }
}

export const RouterLinkEnhanced = defineComponent({
  name: 'RouterLinkEnhanced',
  props: {
    // 基础属性
    to: {
      type: [String, Object] as PropType<RouteLocationRaw>,
      required: true,
    },
    replace: {
      type: Boolean,
      default: false,
    },
    
    // 样式类
    activeClass: {
      type: String,
      default: 'router-link-active',
    },
    exactActiveClass: {
      type: String,
      default: 'router-link-exact-active',
    },
    inactiveClass: {
      type: String,
      default: '',
    },
    pendingClass: {
      type: String,
      default: 'router-link-pending',
    },
    
    // 自定义渲染
    custom: {
      type: Boolean,
      default: false,
    },
    tag: {
      type: String,
      default: 'a',
    },
    
    // 预加载配置
    prefetch: {
      type: [Boolean, String] as PropType<boolean | 'hover' | 'visible' | 'immediate' | 'idle'>,
      default: false,
    },
    prefetchDelay: {
      type: Number,
      default: 100,
    },
    prefetchPriority: {
      type: String as PropType<'high' | 'low' | 'auto'>,
      default: 'auto',
    },
    
    // 权限和状态
    permission: {
      type: [String, Array, Function] as PropType<string | string[] | (() => boolean)>,
      default: undefined,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    
    // 外部链接
    external: {
      type: Boolean,
      default: false,
    },
    target: {
      type: String as PropType<'_blank' | '_self' | '_parent' | '_top' | string>,
      default: undefined,
    },
    rel: {
      type: String,
      default: undefined,
    },
    
    // 导航行为
    append: {
      type: Boolean,
      default: false,
    },
    exact: {
      type: Boolean,
      default: false,
    },
    event: {
      type: [String, Array] as PropType<string | string[]>,
      default: 'click',
    },
    
    // 钩子函数
    beforeNavigate: {
      type: Function as PropType<(to: RouteLocationRaw) => boolean | Promise<boolean> | void>,
      default: undefined,
    },
    afterNavigate: {
      type: Function as PropType<(to: RouteLocationRaw) => void>,
      default: undefined,
    },
    
    // 自定义匹配逻辑
    isActiveMatch: {
      type: Function as PropType<(route: any) => boolean>,
      default: undefined,
    },
    isExactActiveMatch: {
      type: Function as PropType<(route: any) => boolean>,
      default: undefined,
    },
    
    // 无障碍
    ariaCurrentValue: {
      type: String as PropType<'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false'>,
      default: 'page',
    },
    ariaLabel: {
      type: String,
      default: undefined,
    },
    
    // 滚动行为
    scrollBehavior: {
      type: [Boolean, Object] as PropType<boolean | ScrollToOptions>,
      default: undefined,
    },
    
    // 动画
    transition: {
      type: [String, Object] as PropType<string | object>,
      default: undefined,
    },
  },
  
  emits: ['click', 'navigate', 'prefetch'],
  
  setup(props, { slots, attrs, emit }) {
    const router = useRouter()
    const currentRoute = useRoute()
    const linkRef = ref<HTMLElement>()
    const isNavigating = ref(false)
    const prefetchTimer = ref<number>()
    
    // 构建目标路由
    const targetLocation = computed(() => {
      if (props.append && typeof props.to === 'string') {
        return currentRoute.value.path + props.to
      }
      return props.to
    })
    
    // 使用基础链接功能
    const link = useLink({
      to: targetLocation,
      replace: props.replace,
    })
    
    // 检查是否为外部链接
    const isExternal = computed(() => {
      if (props.external) return true
      if (typeof targetLocation.value === 'string') {
        return /^(https?:|mailto:|tel:)/.test(targetLocation.value)
      }
      return false
    })
    
    // 权限检查
    const hasPermission = computed(() => {
      if (!props.permission) return true
      
      if (typeof props.permission === 'function') {
        return props.permission()
      }
      
      if (typeof props.permission === 'string') {
        // TODO: 集成权限系统
        return true
      }
      
      if (Array.isArray(props.permission)) {
        // TODO: 检查多个权限
        return true
      }
      
      return true
    })
    
    // 是否可点击
    const isClickable = computed(() => {
      return !props.disabled && !props.loading && hasPermission.value
    })
    
    // 自定义激活状态检查
    const isActive = computed(() => {
      if (props.isActiveMatch) {
        return props.isActiveMatch(link.route.value)
      }
      return props.exact ? link.isExactActive.value : link.isActive.value
    })
    
    const isExactActive = computed(() => {
      if (props.isExactActiveMatch) {
        return props.isExactActiveMatch(link.route.value)
      }
      return link.isExactActive.value
    })
    
    // 计算样式类
    const classes = computed(() => {
      const result: string[] = []
      
      if (props.inactiveClass && !isActive.value) {
        result.push(props.inactiveClass)
      }
      
      if (isActive.value && props.activeClass) {
        result.push(props.activeClass)
      }
      
      if (isExactActive.value && props.exactActiveClass) {
        result.push(props.exactActiveClass)
      }
      
      if (isNavigating.value && props.pendingClass) {
        result.push(props.pendingClass)
      }
      
      if (props.disabled) {
        result.push('router-link-disabled')
      }
      
      if (props.loading) {
        result.push('router-link-loading')
      }
      
      return result
    })
    
    // 预加载功能
    const prefetchRoute = async () => {
      if (isExternal.value || !props.prefetch) return
      
      emit('prefetch', targetLocation.value)
      await PreloadManager.preload(targetLocation.value, router)
    }
    
    // 处理预加载策略
    const setupPrefetch = () => {
      if (!props.prefetch || isExternal.value) return
      
      switch (props.prefetch) {
        case 'immediate':
        case true:
          prefetchRoute()
          break
          
        case 'hover':
          // 鼠标悬停时预加载
          break
          
        case 'visible':
          // 元素可见时预加载
          if (linkRef.value && 'IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
              entries.forEach(entry => {
                if (entry.isIntersecting) {
                  prefetchRoute()
                  observer.disconnect()
                }
              })
            }, {
              rootMargin: '50px'
            })
            observer.observe(linkRef.value)
            
            onUnmounted(() => observer.disconnect())
          }
          break
          
        case 'idle':
          // 空闲时预加载
          if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(() => prefetchRoute())
          } else {
            setTimeout(() => prefetchRoute(), 2000)
          }
          break
      }
    }
    
    // 处理鼠标进入事件
    const handleMouseEnter = () => {
      if (props.prefetch === 'hover' && !PreloadManager.isPreloaded(targetLocation.value)) {
        clearTimeout(prefetchTimer.value)
        prefetchTimer.value = window.setTimeout(() => {
          prefetchRoute()
        }, props.prefetchDelay)
      }
    }
    
    // 处理鼠标离开事件
    const handleMouseLeave = () => {
      clearTimeout(prefetchTimer.value)
    }
    
    // 处理导航
    const handleNavigate = async (e?: Event) => {
      if (e) {
        emit('click', e)
      }
      
      if (!isClickable.value) {
        e?.preventDefault()
        return
      }
      
      if (isExternal.value) {
        // 外部链接直接返回，让浏览器处理
        return
      }
      
      e?.preventDefault()
      
      // 执行导航前钩子
      if (props.beforeNavigate) {
        const result = await props.beforeNavigate(targetLocation.value)
        if (result === false) {
          return
        }
      }
      
      isNavigating.value = true
      
      try {
        await link.navigate()
        
        // 处理滚动
        if (props.scrollBehavior) {
          if (props.scrollBehavior === true) {
            window.scrollTo(0, 0)
          } else {
            window.scrollTo(props.scrollBehavior)
          }
        }
        
        // 执行导航后钩子
        if (props.afterNavigate) {
          props.afterNavigate(targetLocation.value)
        }
        
        emit('navigate', targetLocation.value)
      } finally {
        isNavigating.value = false
      }
    }
    
    // 设置事件监听
    const setupEventListeners = () => {
      const events = Array.isArray(props.event) ? props.event : [props.event]
      const listeners: Record<string, any> = {}
      
      events.forEach(event => {
        if (event === 'click') {
          listeners.onClick = handleNavigate
        } else {
          listeners[`on${event.charAt(0).toUpperCase() + event.slice(1)}`] = handleNavigate
        }
      })
      
      return listeners
    }
    
    // 组件挂载后设置预加载
    onMounted(() => {
      setupPrefetch()
    })
    
    // 清理定时器
    onUnmounted(() => {
      clearTimeout(prefetchTimer.value)
    })
    
    return () => {
      // 无权限时不渲染
      if (!hasPermission.value) {
        return null
      }
      
      const href = isExternal.value 
        ? (typeof targetLocation.value === 'string' ? targetLocation.value : '#')
        : link.href.value
      
      // 准备属性
      const linkProps: any = {
        ...attrs,
        ref: linkRef,
        class: classes.value,
        'aria-current': isExactActive.value ? props.ariaCurrentValue : undefined,
        'aria-label': props.ariaLabel,
        'aria-disabled': props.disabled || undefined,
      }
      
      // 根据链接类型设置属性
      if (isExternal.value) {
        linkProps.href = href
        linkProps.target = props.target || '_blank'
        linkProps.rel = props.rel || (props.target === '_blank' ? 'noopener noreferrer' : undefined)
      } else {
        linkProps.href = isClickable.value ? href : undefined
        linkProps.role = !isClickable.value ? 'link' : undefined
        linkProps.tabindex = !isClickable.value ? -1 : undefined
      }
      
      // 添加事件监听
      if (isClickable.value) {
        Object.assign(linkProps, setupEventListeners())
        linkProps.onMouseenter = handleMouseEnter
        linkProps.onMouseleave = handleMouseLeave
      }
      
      // 自定义渲染
      if (props.custom) {
        return slots.default?.({
          href,
          route: link.route.value,
          navigate: handleNavigate,
          isActive: isActive.value,
          isExactActive: isExactActive.value,
          isNavigating: isNavigating.value,
          isExternal: isExternal.value,
        })
      }
      
      // 渲染内容
      const content = slots.default?.({
        isActive: isActive.value,
        isExactActive: isExactActive.value,
        isNavigating: isNavigating.value,
      }) || href
      
      // 应用过渡动画
      if (props.transition && !isExternal.value) {
        return h(
          Transition,
          typeof props.transition === 'string' 
            ? { name: props.transition }
            : props.transition,
          () => h(props.tag, linkProps, content)
        )
      }
      
      return h(props.tag, linkProps, content)
    }
  },
})

export default RouterLinkEnhanced