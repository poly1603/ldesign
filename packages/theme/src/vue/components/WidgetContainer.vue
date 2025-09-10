<template>
  <div
    class="ldesign-widget-container"
    :class="containerClass"
    :style="containerStyle"
    ref="containerRef"
  >
    <slot />
    
    <!-- 渲染挂件 -->
    <div
      v-for="widget in visibleWidgets"
      :key="widget.id"
      :class="getWidgetClass(widget)"
      :style="getWidgetStyle(widget)"
      :data-widget-id="widget.id"
      :data-widget-type="widget.type"
      v-html="widget.content"
    />
    
    <!-- 性能监控信息 -->
    <div
      v-if="enablePerformanceMonitoring && showPerformanceInfo"
      class="performance-info"
    >
      <div>挂件数量: {{ visibleWidgets.length }}</div>
      <div>渲染时间: {{ renderTime }}ms</div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @file WidgetContainer 组件
 * @description 挂件容器组件，用于渲染和管理挂件
 */

import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import type { WidgetContainerProps } from '../types'
import type { WidgetConfig } from '../../core/types'
import { useWidgets } from '../composables/useWidgets'
import { useResponsiveWidgets } from '../composables/useResponsiveWidgets'

// 组件属性
const props = withDefaults(defineProps<WidgetContainerProps>(), {
  widgets: () => [],
  enablePerformanceMonitoring: false,
  maxWidgets: 50,
  enableCollisionDetection: false
})

// 组件引用
const containerRef = ref<HTMLElement>()

// 性能监控
const renderTime = ref(0)
const showPerformanceInfo = ref(false)

// 使用组合式函数
const { widgets: managedWidgets } = useWidgets()
const { filterWidgetsByDevice } = useResponsiveWidgets()

// 可见挂件
const visibleWidgets = computed(() => {
  const allWidgets = props.widgets.length > 0 ? props.widgets : managedWidgets.value
  let filtered = filterWidgetsByDevice(allWidgets)
  
  // 过滤可见挂件
  filtered = filtered.filter(widget => widget.visible !== false)
  
  // 限制最大数量
  if (props.maxWidgets && filtered.length > props.maxWidgets) {
    filtered = filtered.slice(0, props.maxWidgets)
  }
  
  return filtered
})

// 获取挂件样式类
const getWidgetClass = (widget: WidgetConfig): string => {
  const classes = [
    'ldesign-widget',
    `ldesign-widget-${widget.type}`,
    `ldesign-widget-${widget.id}`
  ]
  
  if (widget.interactive) {
    classes.push('ldesign-widget-interactive')
  }
  
  if (widget.responsive) {
    classes.push('ldesign-widget-responsive')
  }
  
  return classes.join(' ')
}

// 获取挂件样式
const getWidgetStyle = (widget: WidgetConfig): Record<string, string> => {
  const style: Record<string, string> = {}
  
  if (widget.position) {
    style.position = widget.position.type
    
    if (typeof widget.position.position.x === 'string') {
      style.left = widget.position.position.x
    } else {
      style.left = `${widget.position.position.x}px`
    }
    
    if (typeof widget.position.position.y === 'string') {
      style.top = widget.position.position.y
    } else {
      style.top = `${widget.position.position.y}px`
    }
    
    // 设置锚点
    if (widget.position.anchor) {
      const [vAlign, hAlign] = widget.position.anchor.split('-')
      if (vAlign === 'center') {
        style.top = '50%'
        style.transform = 'translateY(-50%)'
      } else if (vAlign === 'bottom') {
        style.bottom = style.top
        delete style.top
      }
      
      if (hAlign === 'center') {
        style.left = '50%'
        style.transform = style.transform ? 
          `${style.transform} translateX(-50%)` : 
          'translateX(-50%)'
      } else if (hAlign === 'right') {
        style.right = style.left
        delete style.left
      }
    }
  }
  
  if (widget.style) {
    Object.assign(style, widget.style)
  }
  
  return style
}

// 监听挂件变化，进行性能监控
watch(visibleWidgets, async () => {
  if (props.enablePerformanceMonitoring) {
    const startTime = performance.now()
    await nextTick()
    renderTime.value = Math.round(performance.now() - startTime)
  }
}, { immediate: true })

// 切换性能信息显示
const togglePerformanceInfo = () => {
  showPerformanceInfo.value = !showPerformanceInfo.value
}

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  if (props.enablePerformanceMonitoring && event.ctrlKey && event.key === 'p') {
    event.preventDefault()
    togglePerformanceInfo()
  }
}

onMounted(() => {
  if (props.enablePerformanceMonitoring) {
    document.addEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  if (props.enablePerformanceMonitoring) {
    document.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<style scoped>
.ldesign-widget-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.ldesign-widget {
  position: absolute;
  pointer-events: auto;
  transition: all 0.3s ease;
}

.ldesign-widget-interactive {
  cursor: pointer;
}

.ldesign-widget-interactive:hover {
  transform: scale(1.05);
}

.performance-info {
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 9999;
  pointer-events: none;
}

.performance-info div {
  margin: 2px 0;
}
</style>
