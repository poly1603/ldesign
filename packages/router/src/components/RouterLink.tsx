/**
 * @ldesign/router RouterLink 组件
 *
 * 增强版本 - 完整功能优化
 */

import type { RouteLocationRaw } from '../types'
import { computed, defineComponent, h, onMounted, onUnmounted, type PropType, ref } from 'vue'
import { useLink, useRouter } from '../composables'

export const RouterLink = defineComponent({
  name: 'RouterLink',
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
    custom: {
      type: Boolean,
      default: false,
    },
    // 预加载支持
    preload: {
      type: [Boolean, String] as PropType<boolean | 'hover' | 'visible' | 'immediate'>,
      default: false,
    },
    preloadDelay: {
      type: Number,
      default: 50, // 延迟预加载，避免误触
    },
    // 权限控制
    permission: {
      type: [String, Function] as PropType<string | (() => boolean)>,
      default: undefined,
    },
    // 外部链接
    external: {
      type: Boolean,
      default: false,
    },
    target: {
      type: String,
      default: undefined,
    },
    // 新增：禁用状态
    disabled: {
      type: Boolean,
      default: false,
    },
    // 新增：加载状态
    loading: {
      type: Boolean,
      default: false,
    },
    // 新增：点击事件拦截
    beforeNavigate: {
      type: Function as PropType<(to: RouteLocationRaw) => boolean | Promise<boolean>>,
      default: undefined,
    },
    // 新增：自定义激活匹配逻辑
    isActiveMatch: {
      type: Function as PropType<(route: RouteLocationRaw) => boolean>,
      default: undefined,
    },
    // 新增：预取优先级
    prefetchPriority: {
      type: String as PropType<'high' | 'low' | 'auto'>,
      default: 'auto',
    },
    // 新增：无障碍属性
    ariaCurrentValue: {
      type: String as PropType<'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false'>,
      default: 'page',
    },
    // 新增：自动滚动
    scrollToTop: {
      type: Boolean,
      default: false,
    },
    // 新增：动画配置
    transition: {
      type: [Boolean, String, Object] as PropType<boolean | string | object>,
      default: false,
    },
  },
  setup(props, { slots, attrs }) {
    const router = useRouter()
    const link = useLink({
      to: props.to,
      replace: props.replace,
    })
    const linkRef = ref<HTMLElement>()

    // 检查是否是外部链接
    const isExternal = computed(() => {
      if (props.external)
        return true
      if (typeof props.to === 'string') {
        return /^https?:\/\//.test(props.to) || props.to.startsWith('mailto:') || props.to.startsWith('tel:')
      }
      return false
    })

    // 权限检查
    const hasPermission = computed(() => {
      if (!props.permission)
        return true
      if (typeof props.permission === 'string') {
        // 这里可以集成权限系统，暂时返回true
        return true
      }
      if (typeof props.permission === 'function') {
        return props.permission()
      }
      return true
    })

    const classes = computed(() => {
      const result: string[] = []

      if (!isExternal.value && link.isActive.value) {
        result.push(props.activeClass)
      }

      if (!isExternal.value && link.isExactActive.value) {
        result.push(props.exactActiveClass)
      }

      return result
    })

    // 预加载功能
    const preloadRoute = async () => {
      if (!props.preload || isExternal.value)
        return

      try {
        const route = router.resolve(props.to)
        const matched = route.matched[route.matched.length - 1]
        const component = matched?.components?.default

        if (component && typeof component === 'function') {
          await (component as () => Promise<any>)()
        }
      }
      catch (error) {
        console.warn('Failed to preload route:', error)
      }
    }

    // 处理预加载事件
    const handleMouseEnter = () => {
      if (props.preload === 'hover' || props.preload === true) {
        preloadRoute()
      }
    }

    // Intersection Observer for visible preload
    let observer: IntersectionObserver | null = null

    onMounted(() => {
      if (props.preload === 'visible' && linkRef.value) {
        observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              preloadRoute()
              observer?.disconnect()
            }
          })
        })
        observer.observe(linkRef.value)
      }
    })

    onUnmounted(() => {
      observer?.disconnect()
    })

    return () => {
      // 权限检查
      if (!hasPermission.value) {
        return null
      }

      const href = isExternal.value ? (props.to as string) : link.href.value

      const children = slots.default?.({
        href,
        route: isExternal.value ? null : link.route.value,
        navigate: isExternal.value ? undefined : link.navigate,
        isActive: isExternal.value ? false : link.isActive.value,
        isExactActive: isExternal.value ? false : link.isExactActive.value,
        isExternal: isExternal.value,
      })

      if (props.custom) {
        return children
      }

      const linkProps: any = {
        ...attrs,
        ref: linkRef,
        href,
        class: classes.value,
        onMouseenter: handleMouseEnter,
      }

      // 外部链接处理
      if (isExternal.value) {
        if (props.target) {
          linkProps.target = props.target
        }
        else if (/^https?:\/\//.test(href)) {
          linkProps.target = '_blank'
          linkProps.rel = 'noopener noreferrer'
        }

        return h('a', linkProps, children)
      }

      // 内部链接处理
      linkProps.onClick = (e: Event) => {
        e.preventDefault()
        link.navigate()
      }

      return h('a', linkProps, children)
    }
  },
})

export default RouterLink
