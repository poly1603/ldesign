import type { PropType } from 'vue'
import type {
  Ref,
  RouteLocationNormalized,
  RouteLocationRaw,
  Router,
} from '../types'
import type {
  ComponentEnhancementConfig,
  ComponentSize,
  EnhancedRouterLinkSlotProps,
  LinkVariant,
  PreloadStrategy,
} from './types'
import {
  computed,
  defineComponent,
  h,
  inject,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
} from 'vue'
import { isSameRouteLocation, warn } from '../utils'

// Vue 类型定义
export interface SetupContext {
  attrs: Record<string, unknown>
  slots: Record<string, (...args: unknown[]) => any[]>
  emit: (event: string, ...args: unknown[]) => void
}

/**
 * RouterLink 组件
 * 用于创建导航链接
 */
export const RouterLink = defineComponent({
  name: 'RouterLink',
  inheritAttrs: false,
  props: {
    to: {
      type: [String, Object] as PropType<RouteLocationRaw>,
      required: true,
    },
    replace: {
      type: Boolean,
      default: false,
    },
    activeClass: {
      type: String,
      default: 'router-link-active',
    },
    exactActiveClass: {
      type: String,
      default: 'router-link-exact-active',
    },
    exact: {
      type: Boolean,
      default: false,
    },
    tag: {
      type: String,
      default: 'a',
    },
    event: {
      type: [String, Array] as PropType<string | string[]>,
      default: 'click',
    },
    append: {
      type: Boolean,
      default: false,
    },
    custom: {
      type: Boolean,
      default: false,
    },

    // 增强属性
    transition: {
      type: [String, Object],
      default: undefined,
    },
    preload: {
      type: String as PropType<PreloadStrategy>,
      default: 'none',
    },
    preloadDelay: {
      type: Number,
      default: 200,
    },
    permission: {
      type: [String, Array] as PropType<string | string[]>,
      default: undefined,
    },
    fallbackTo: {
      type: [String, Object] as PropType<RouteLocationRaw>,
      default: undefined,
    },
    variant: {
      type: String as PropType<LinkVariant>,
      default: 'default',
    },
    size: {
      type: String as PropType<ComponentSize>,
      default: 'medium',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    trackEvent: {
      type: String,
      default: undefined,
    },
    trackData: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({}),
    },
    confirmMessage: {
      type: String,
      default: undefined,
    },
    confirmTitle: {
      type: String,
      default: '确认',
    },
    external: {
      type: Boolean,
      default: false,
    },
    target: {
      type: String as PropType<'_blank' | '_self' | '_parent' | '_top'>,
      default: '_self',
    },
    icon: {
      type: String,
      default: undefined,
    },
    iconPosition: {
      type: String as PropType<'left' | 'right'>,
      default: 'left',
    },
    badge: {
      type: [String, Number],
      default: undefined,
    },
    badgeColor: {
      type: String,
      default: undefined,
    },
    badgeVariant: {
      type: String as PropType<'dot' | 'count' | 'text'>,
      default: 'count',
    },
    tooltip: {
      type: String,
      default: undefined,
    },
    tooltipPosition: {
      type: String as PropType<'top' | 'bottom' | 'left' | 'right'>,
      default: 'top',
    },
    shortcut: {
      type: String,
      default: undefined,
    },
    pulse: {
      type: Boolean,
      default: false,
    },
    glow: {
      type: Boolean,
      default: false,
    },
  },

  emits: [
    'before-navigate',
    'navigated',
    'navigate-error',
    'preloaded',
    'preload-error',
    'permission-denied',
    'click',
    'mouseenter',
    'mouseleave',
    'focus',
    'blur',
  ],
  setup(props: any, { slots, attrs, emit }: any) {
    const router = inject('router') as Router
    const currentRoute = inject('route') as Ref<RouteLocationNormalized>
    const config = inject('routerEnhancementConfig') as
      | ComponentEnhancementConfig
      | undefined

    // 状态管理
    const linkRef = ref<HTMLElement>()
    const isPreloading = ref(false)
    const isVisible = ref(false)
    const preloadTimer = ref<number>()
    // const keyboardListener = ref<((e: KeyboardEvent) => void) | null>(null)

    if (!router || !currentRoute) {
      warn('RouterLink must be used within a router context')
      return () => null
    }

    // 权限检查
    const hasPermission = computed(async () => {
      if (!props.permission) return true

      const checker = config?.permissionChecker
      if (checker) {
        return await checker(props.permission)
      }

      return true
    })

    // 路由解析 - 支持外部链接
    const resolvedRoute = computed(() => {
      if (props.external) return null

      try {
        return router.resolve(props.to, currentRoute.value)
      } catch (error) {
        warn(`Failed to resolve route: ${error}`)
        return null
      }
    })

    // 计算 href - 支持外部链接
    const href = computed(() => {
      if (props.external) {
        return typeof props.to === 'string' ? props.to : '#'
      }

      const resolved = resolvedRoute.value
      return resolved ? resolved.href : '#'
    })

    // 计算是否激活
    const isActive = computed(() => {
      const resolved = resolvedRoute.value
      const current = currentRoute.value

      if (!resolved) return false

      if (props.exact) {
        return isSameRouteLocation(resolved, current)
      }

      // 检查路径是否匹配
      return current.path.startsWith(resolved.path)
    })

    // 计算是否精确激活
    const isExactActive = computed(() => {
      const resolved = resolvedRoute.value
      const current = currentRoute.value

      if (!resolved) return false

      return isSameRouteLocation(resolved, current)
    })

    // 样式类 - 添加增强样式
    const classes = computed(() => {
      const classList: string[] = [
        'enhanced-router-link',
        `enhanced-router-link--${props.variant}`,
        `enhanced-router-link--${props.size}`,
      ]

      if (isActive.value) classList.push(props.activeClass)
      if (isExactActive.value) classList.push(props.exactActiveClass)
      if (props.disabled) classList.push('enhanced-router-link--disabled')
      if (props.loading) classList.push('enhanced-router-link--loading')
      if (isPreloading.value) classList.push('enhanced-router-link--preloading')
      if (props.pulse) classList.push('enhanced-router-link--pulse')
      if (props.glow) classList.push('enhanced-router-link--glow')

      return classList
    })

    // 预加载逻辑
    const preloadRoute = async () => {
      if (isPreloading.value || !resolvedRoute.value || props.external) return

      isPreloading.value = true
      emit('preload-start')

      try {
        // 这里可以实现实际的预加载逻辑
        await new Promise(resolve => setTimeout(resolve, 100))
        emit('preloaded', resolvedRoute.value)
      } catch (error) {
        warn(`Preload failed: ${String(error)}`)
        emit('preload-error', error)
      } finally {
        isPreloading.value = false
      }
    }

    // 事件追踪
    const trackNavigation = () => {
      if (props.trackEvent && config?.eventTracker) {
        config.eventTracker(props.trackEvent, {
          to: props.to,
          from: currentRoute.value.path,
          variant: props.variant,
          ...props.trackData,
        })
      }
    }

    // 确认对话框
    const showConfirmDialog = async (): Promise<boolean> => {
      if (!props.confirmMessage) return true

      if (config?.confirmDialog) {
        return await config.confirmDialog(
          props.confirmMessage,
          props.confirmTitle
        )
      }

      // 默认确认对话框
      // eslint-disable-next-line no-alert
      return window.confirm(props.confirmMessage)
    }

    // 增强的导航处理函数
    const navigate = async (e: Event) => {
      if (props.disabled || props.loading) {
        e.preventDefault()
        return
      }

      // 权限检查
      const permitted = await hasPermission.value
      if (!permitted) {
        e.preventDefault()
        emit('permission-denied')

        if (props.fallbackTo) {
          router.push(props.fallbackTo)
        }
        return
      }

      // 确认对话框
      const confirmed = await showConfirmDialog()
      if (!confirmed) {
        e.preventDefault()
        return
      }

      // 外部链接处理
      if (props.external) {
        trackNavigation()

        if (props.target === '_blank') {
          window.open(href.value, '_blank')
          e.preventDefault()
        }
        return
      }

      // 内部导航
      if (!guardEvent(e)) return

      emit('before-navigate', { to: props.to, from: currentRoute.value })
      trackNavigation()

      try {
        const resolved = resolvedRoute.value
        if (resolved) {
          const locationRaw = {
            name: resolved.name,
            path: resolved.path,
            params: resolved.params,
            query: resolved.query,
            hash: resolved.hash,
          }

          if (props.replace) {
            await router.replace(locationRaw)
          } else {
            await router.push(locationRaw)
          }

          emit('navigated', { to: props.to, from: currentRoute.value })
        }
      } catch (error) {
        emit('navigate-error', error)
      }
    }

    // 事件处理
    const handleMouseEnter = () => {
      emit('mouseenter')

      if (props.preload === 'hover') {
        if (preloadTimer.value) {
          clearTimeout(preloadTimer.value)
        }
        preloadTimer.value = window.setTimeout(preloadRoute, props.preloadDelay)
      }
    }

    const handleMouseLeave = () => {
      emit('mouseleave')

      if (preloadTimer.value) {
        clearTimeout(preloadTimer.value)
        preloadTimer.value = undefined as any
      }
    }

    const handleFocus = () => {
      emit('focus')
    }

    const handleBlur = () => {
      emit('blur')
    }

    const handleClick = (event: Event) => {
      emit('click', event)
      navigate(event)
    }

    // 生命周期
    onMounted(() => {
      // 立即预加载
      if (props.preload === 'immediate') {
        nextTick(preloadRoute)
      }

      // 可见时预加载
      if (props.preload === 'visible' && linkRef.value) {
        const observer = new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting && !isVisible.value) {
                isVisible.value = true
                preloadRoute()
              }
            })
          },
          { threshold: 0.1 }
        )
        observer.observe(linkRef.value)
      }
    })

    onUnmounted(() => {
      if (preloadTimer.value) {
        clearTimeout(preloadTimer.value)
      }
    })

    return () => {
      const resolved = resolvedRoute.value

      // 渲染图标
      const renderIcon = () => {
        if (!props.icon) return null
        return h('i', {
          class: ['enhanced-router-link__icon', props.icon],
          'aria-hidden': 'true',
        })
      }

      // 渲染徽章
      const renderBadge = () => {
        if (!props.badge) return null

        const badgeClasses = [
          'enhanced-router-link__badge',
          `enhanced-router-link__badge--${props.badgeVariant}`,
        ]

        const badgeStyle: Record<string, string> = {}
        if (props.badgeColor) {
          badgeStyle.backgroundColor = props.badgeColor
        }

        return h(
          'span',
          {
            class: badgeClasses,
            style: badgeStyle,
          },
          props.badge
        )
      }

      // 渲染加载指示器
      const renderLoading = () => {
        if (!props.loading) return null
        return h('span', {
          class: 'enhanced-router-link__loading',
          'aria-label': '加载中',
        })
      }

      // 渲染内容
      const renderContent = () => {
        const content = []

        if (props.icon && props.iconPosition === 'left') {
          content.push(renderIcon())
        }

        content.push(
          h('span', { class: 'enhanced-router-link__text' }, slots.default?.())
        )

        if (props.icon && props.iconPosition === 'right') {
          content.push(renderIcon())
        }

        if (props.badge) {
          content.push(renderBadge())
        }

        if (props.loading) {
          content.push(renderLoading())
        }

        return content
      }

      // 自定义渲染
      if (props.custom) {
        const slotProps: EnhancedRouterLinkSlotProps = {
          href: href.value,
          route: resolved,
          navigate,
          isActive: isActive.value,
          isExactActive: isExactActive.value,
          isLoading: props.loading,
          isPreloading: isPreloading.value || false,
          hasPermission: true, // 简化处理
          disabled: props.disabled,
        }

        return slots.default?.(slotProps)
      }

      // 创建事件监听器
      const eventListeners: Record<string, (e: Event) => void> = {}
      const events = Array.isArray(props.event) ? props.event : [props.event]

      events.forEach((event: string) => {
        eventListeners[`on${event.charAt(0).toUpperCase() + event.slice(1)}`] =
          handleClick
      })

      // 添加增强事件监听器（只有在不冲突的情况下）
      if (!eventListeners.onMouseenter) {
        eventListeners.onMouseenter = handleMouseEnter
      }
      if (!eventListeners.onMouseleave) {
        eventListeners.onMouseleave = handleMouseLeave
      }
      if (!eventListeners.onFocus) {
        eventListeners.onFocus = handleFocus
      }
      if (!eventListeners.onBlur) {
        eventListeners.onBlur = handleBlur
      }

      // 创建元素属性
      const elementAttrs = {
        ...attrs,
        ...eventListeners,
        ref: linkRef,
        class: [...classes.value, ...(attrs.class ? [attrs.class] : [])],
        href: props.tag === 'a' ? href.value : undefined,
        target: props.external ? props.target : undefined,
        'aria-current': isExactActive.value ? 'page' : undefined,
        'aria-disabled': props.disabled,
        'aria-label': props.tooltip,
        title: props.tooltip,
        tabindex: props.disabled ? -1 : undefined,
      }

      return h(props.tag, elementAttrs, renderContent())
    }
  },
})

/**
 * 检查事件是否应该被处理
 */
function guardEvent(e: Event): boolean {
  // 不要重定向带有修饰键的点击
  if (
    (e as MouseEvent).metaKey ||
    (e as MouseEvent).altKey ||
    (e as MouseEvent).ctrlKey ||
    (e as MouseEvent).shiftKey
  ) {
    return false
  }

  // 不要重定向右键点击
  if (
    (e as MouseEvent).button !== undefined &&
    (e as MouseEvent).button !== 0
  ) {
    return false
  }

  // 不要重定向如果 preventDefault 被调用
  if (e.defaultPrevented) {
    return false
  }

  // 不要重定向如果目标是 _blank
  const target = (e.target as HTMLElement)?.getAttribute?.('target')
  if (target && target !== '_self') {
    return false
  }

  e.preventDefault()
  return true
}

export default RouterLink
