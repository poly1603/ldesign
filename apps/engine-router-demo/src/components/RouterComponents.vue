<script lang="ts">
/**
 * 简化的Router组件实现
 * 用于演示Engine与Router集成
 */

import { defineComponent, h, inject, ref, computed, onMounted } from 'vue'

// RouterLink组件
export const RouterLink = defineComponent({
  name: 'RouterLink',
  props: {
    to: {
      type: String,
      required: true
    },
    class: {
      type: String,
      default: ''
    }
  },
  setup(props, { slots }) {
    const router = inject('router') as any
    
    const handleClick = (e: Event) => {
      e.preventDefault()
      if (router) {
        router.push(props.to)
        // 简单的路由切换，实际应该有更复杂的逻辑
        window.location.hash = props.to
      }
    }
    
    return () => h('a', {
      href: props.to,
      class: props.class,
      onClick: handleClick
    }, slots.default?.())
  }
})

// RouterView组件
export const RouterView = defineComponent({
  name: 'RouterView',
  setup() {
    const currentPath = ref(window.location.pathname || '/')
    
    // 监听路由变化
    onMounted(() => {
      const updatePath = () => {
        currentPath.value = window.location.pathname || '/'
      }
      
      window.addEventListener('popstate', updatePath)
      window.addEventListener('hashchange', () => {
        currentPath.value = window.location.hash.slice(1) || '/'
      })
    })
    
    const currentComponent = computed(() => {
      // 这里应该根据当前路径匹配组件
      // 简化实现，直接返回一个占位符
      return h('div', { class: 'router-view' }, [
        h('p', `当前路径: ${currentPath.value}`),
        h('p', '这里应该显示匹配的组件内容')
      ])
    })
    
    return () => currentComponent.value
  }
})
</script>
