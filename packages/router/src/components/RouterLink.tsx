/**
 * @ldesign/router RouterLink 组件
 *
 * 增强的路由链接组件，支持预加载、权限控制、事件追踪等功能
 */

import type { RouteLocationRaw } from '../types'
import type {
  ComponentSize,
  LinkVariant,
  PreloadStrategy,
  RouterLinkSlotProps,
} from './types'
import {
  computed,
  defineComponent,
  h,
  nextTick,
  onMounted,
  onUnmounted,
  type PropType,
  ref,
  type VNode,
} from 'vue'
import { useLink, useRouter } from '../composables'
import {
  DEFAULT_LINK_ACTIVE_CLASS,
  DEFAULT_LINK_EXACT_ACTIVE_CLASS,
} from '../core/constants'

// ==================== RouterLink 组件 ====================

export const RouterLink = defineComponent({
  name: 'RouterLink',
  inheritAttrs: false,

  props: {
    // 核心属性
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
      default: DEFAULT_LINK_ACTIVE_CLASS,
    },
    exactActiveClass: {
      type: String,
      default: DEFAULT_LINK_EXACT_ACTIVE_CLASS,
    },
    custom: {
      type: Boolean,
      default: false,
    },

    // 样式属性
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

    // 链接属性
    external: {
      type: Boolean,
      default: false,
    },
    target: {
      type: String,
      default: undefined,
    },
    rel: {
      type: String,
      default: undefined,
    },

    // 预加载属性
    preload: {
      type: [Boolean, String] as PropType<boolean | PreloadStrategy>,
      default: false,
    },
    preloadDelay: {
      type: Number,
      default: 200,
    },

    // 权限属性
    permission: {
      type: [String, Array] as PropType<string | string[]>,
      default: undefined,
    },

    // 交互属性
    trackClick: {
      type: Boolean,
      default: false,
    },
    confirmBeforeNavigate: {
      type: Boolean,
      default: false,
    },
    confirmMessage: {
      type: String,
      default: '确定要离开当前页面吗？',
    },

    // 图标属性
    icon: {
      type: [String, Object],
      default: undefined,
    },
    iconPosition: {
      type: String as PropType<'left' | 'right'>,
      default: 'left',
    },
  },

  emits: [
    'click',
    'mouseenter',
    'mouseleave',
    'focus',
    'blur',
    'preload',
    'navigate',
  ],

  setup(props, { slots, attrs, emit }) {
    const router = useRouter()

    // 链接功能
    const linkRef = ref<HTMLElement>()
    const isPreloading = ref(false)
    const preloadTimer = ref<number>()

    // 使用 useLink 获取链接相关数据
    const {
      href,
      route,
      isActive,
      isExactActive,
      navigate: originalNavigate,
    } = useLink({
      to: computed(() => props.to),
      replace: props.replace,
    })

    // 计算样式类名
    const linkClasses = computed(() => {
      const classes = ['router-link']

      // 基础样式
      classes.push(`router-link--${props.variant}`)
      classes.push(`router-link--${props.size}`)

      // 状态样式
      if (props.disabled) classes.push('router-link--disabled')
      if (props.loading) classes.push('router-link--loading')
      if (isActive.value) classes.push(props.activeClass)
      if (isExactActive.value) classes.push(props.exactActiveClass)
      if (isPreloading.value) classes.push('router-link--preloading')

      return classes
    })

    // 权限检查
    const hasPermission = computed(() => {
      if (!props.permission) return true

      // 这里应该集成权限系统
      // 暂时返回 true，实际使用时需要实现权限检查逻辑
      return true
    })

    // 是否可以导航
    const canNavigate = computed(() => {
      return !props.disabled && !props.loading && hasPermission.value
    })

    // 预加载功能
    const preloadComponent = async () => {
      if (isPreloading.value || !props.preload) return

      try {
        isPreloading.value = true
        emit('preload', route.value)

        // 预加载路由组件
        const matched = route.value.matched
        for (const record of matched) {
          if (record.components) {
            for (const component of Object.values(record.components)) {
              if (typeof component === 'function') {
                try {
                  await (component as () => Promise<any>)()
                } catch (error) {
                  console.warn('预加载组件失败:', error)
                }
              }
            }
          }
        }
      } catch (error) {
        console.warn('预加载失败:', error)
      } finally {
        isPreloading.value = false
      }
    }

    // 导航功能
    const navigate = async (e?: Event) => {
      if (!canNavigate.value) {
        e?.preventDefault()
        return
      }

      // 确认导航
      if (props.confirmBeforeNavigate) {
        // eslint-disable-next-line no-alert
        const confirmed = window.confirm(props.confirmMessage)
        if (!confirmed) {
          e?.preventDefault()
          return
        }
      }

      // 追踪点击事件
      if (props.trackClick) {
        // 这里应该集成分析系统
        // eslint-disable-next-line no-console
        console.log('路由点击追踪:', {
          to: props.to,
          from: router.currentRoute.value,
          timestamp: Date.now(),
        })
      }

      emit('navigate', route.value)

      try {
        await originalNavigate(e)
      } catch (error) {
        console.error('导航失败:', error)
      }
    }

    // 事件处理
    const handleClick = (e: Event) => {
      emit('click', e)

      if (props.external) {
        return // 外部链接由浏览器处理
      }

      navigate(e)
    }

    const handleMouseEnter = (e: Event) => {
      emit('mouseenter', e)

      if (props.preload === 'hover' || props.preload === true) {
        if (preloadTimer.value) {
          clearTimeout(preloadTimer.value)
        }

        preloadTimer.value = window.setTimeout(() => {
          preloadComponent()
        }, props.preloadDelay)
      }
    }

    const handleMouseLeave = (e: Event) => {
      emit('mouseleave', e)

      if (preloadTimer.value) {
        clearTimeout(preloadTimer.value)
        preloadTimer.value = undefined
      }
    }

    const handleFocus = (e: Event) => {
      emit('focus', e)
    }

    const handleBlur = (e: Event) => {
      emit('blur', e)
    }

    // 可见性预加载
    let intersectionObserver: IntersectionObserver | undefined

    const setupVisibilityPreload = () => {
      if (props.preload !== 'visible' || !linkRef.value) return

      if ('IntersectionObserver' in window) {
        intersectionObserver = new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                preloadComponent()
              }
            })
          },
          { threshold: 0.1 }
        )

        intersectionObserver.observe(linkRef.value)
      }
    }

    // 空闲预加载
    const setupIdlePreload = () => {
      if (props.preload !== 'idle') return

      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          preloadComponent()
        })
      } else {
        setTimeout(() => {
          preloadComponent()
        }, 1000)
      }
    }

    // 生命周期
    onMounted(() => {
      nextTick(() => {
        setupVisibilityPreload()
        setupIdlePreload()
      })
    })

    onUnmounted(() => {
      if (preloadTimer.value) {
        clearTimeout(preloadTimer.value)
      }

      if (intersectionObserver) {
        intersectionObserver.disconnect()
      }
    })

    // 插槽属性
    const slotProps: RouterLinkSlotProps = {
      href: href.value,
      route: route.value,
      navigate,
      isActive: isActive.value,
      isExactActive: isExactActive.value,
      isDisabled: props.disabled,
      isLoading: props.loading,
    }

    // 渲染函数
    return () => {
      // 自定义渲染
      if (props.custom) {
        return slots.default?.(slotProps)
      }

      // 外部链接
      if (props.external) {
        return h(
          'a',
          {
            ref: linkRef,
            href: typeof props.to === 'string' ? props.to : href.value,
            target: props.target || undefined,
            rel: props.rel || undefined,
            class: linkClasses.value,
            onClick: handleClick,
            onMouseenter: handleMouseEnter,
            onMouseleave: handleMouseLeave,
            onFocus: handleFocus,
            onBlur: handleBlur,
            ...attrs,
          },
          renderContent()
        )
      }

      // 内部链接
      return h(
        'a',
        {
          ref: linkRef,
          href: href.value,
          class: linkClasses.value,
          onClick: handleClick,
          onMouseenter: handleMouseEnter,
          onMouseleave: handleMouseLeave,
          onFocus: handleFocus,
          onBlur: handleBlur,
          ...attrs,
        },
        renderContent()
      )
    }

    // 渲染内容
    function renderContent(): VNode[] {
      const content: VNode[] = []

      // 左侧图标
      if (props.icon && props.iconPosition === 'left') {
        content.push(
          h('span', { class: 'router-link__icon router-link__icon--left' }, [
            typeof props.icon === 'string'
              ? h('i', { class: props.icon })
              : h(props.icon as any),
          ])
        )
      }

      // 主要内容
      content.push(
        h('span', { class: 'router-link__content' }, slots.default?.(slotProps))
      )

      // 右侧图标
      if (props.icon && props.iconPosition === 'right') {
        content.push(
          h('span', { class: 'router-link__icon router-link__icon--right' }, [
            typeof props.icon === 'string'
              ? h('i', { class: props.icon })
              : h(props.icon as any),
          ])
        )
      }

      // 加载指示器
      if (props.loading) {
        content.push(
          <span class='router-link__loading'>
            <i class='router-link__spinner' />
          </span>
        )
      }

      return content
    }
  },
})

export default RouterLink
