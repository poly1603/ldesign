/**
 * @ldesign/router RouterLink 组件
 * 
 * 简化版本 - 专注于核心导航功能
 */

import { defineComponent, h, computed, type PropType } from 'vue'
import { useLink } from '../composables'
import type { RouteLocationRaw } from '../types'

export const RouterLink = defineComponent({
  name: 'RouterLink',
  props: {
    to: {
      type: [String, Object] as PropType<RouteLocationRaw>,
      required: true
    },
    replace: {
      type: Boolean,
      default: false
    },
    activeClass: {
      type: String,
      default: 'router-link-active'
    },
    exactActiveClass: {
      type: String,
      default: 'router-link-exact-active'
    },
    custom: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { slots, attrs }) {
    const link = useLink(props)
    
    const classes = computed(() => {
      const result: string[] = []
      
      if (link.isActive.value) {
        result.push(props.activeClass)
      }
      
      if (link.isExactActive.value) {
        result.push(props.exactActiveClass)
      }
      
      return result
    })

    return () => {
      const children = slots.default?.({
        href: link.href.value,
        route: link.route.value,
        navigate: link.navigate,
        isActive: link.isActive.value,
        isExactActive: link.isExactActive.value
      })

      if (props.custom) {
        return children
      }

      return h('a', {
        ...attrs,
        href: link.href.value,
        class: classes.value,
        onClick: (e: Event) => {
          e.preventDefault()
          link.navigate()
        }
      }, children)
    }
  }
})

export default RouterLink
