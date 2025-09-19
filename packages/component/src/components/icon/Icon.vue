<!--
  Icon 图标组件
  基于内置SVG图标，支持多种样式和交互
-->

<template>
  <svg ref="iconRef" :class="iconClasses" :style="iconStyles" :width="iconSize" :height="iconSize" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
    @click="handleClick">
    <path :d="iconPath" />
  </svg>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { iconProps } from './types'
import type { IconProps, IconEmits } from './types'

/**
 * 组件名称
 */
defineOptions({
  name: 'LIcon'
})

/**
 * 组件属性
 */
const props = defineProps(iconProps)

/**
 * 组件事件
 */
const emit = defineEmits(['click'])

/**
 * 图标元素引用
 */
const iconRef = ref<HTMLElement>()

/**
 * 内置图标SVG路径
 */
const iconPaths: Record<string, string> = {
  'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  'star': 'm12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z',
  'heart': 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7 7-7Z',
  'settings': 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z M12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6z',
  'home': 'm3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  'search': 'm21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z',
  'close': 'm18 6-12 12M6 6l12 12',
  'check': 'M20 6 9 17l-5-5',
  'arrow-left': 'm12 19-7-7 7-7M5 12h14',
  'arrow-right': 'm5 12 7-7 7 7M12 5v14',
  'arrow-up': 'm18 15-6-6-6 6',
  'arrow-down': 'm6 9 6 6 6-6',
  'plus': 'M5 12h14M12 5v14',
  'minus': 'M5 12h14',
  'edit': 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  'delete': 'm3 6 2 18h14l2-18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6',
  'info': 'M12 16v-4M12 8h.01',
  'warning': 'M12 9v4M12 17h.01',
  'error': 'M12 9v4M12 17h.01',
  'success': 'M20 6 9 17l-5-5'
}

/**
 * 获取图标路径
 */
const iconPath = computed(() => {
  if (typeof props.name === 'string') {
    return iconPaths[props.name] || iconPaths['info']
  }
  return iconPaths['info']
})

/**
 * 计算图标尺寸
 */
const iconSize = computed(() => {
  if (typeof props.size === 'number') {
    return props.size
  }

  const sizeMap = {
    small: 16,
    medium: 20,
    large: 24
  }
  return sizeMap[props.size] || 20
})

/**
 * 图标类名
 */
const iconClasses = computed(() => {
  const classes = ['l-icon']

  // 尺寸类名
  if (typeof props.size === 'string') {
    classes.push(`l-icon--${props.size}`)
  } else {
    classes.push('l-icon--custom-size')
  }

  // 旋转动画
  if (props.spin) {
    classes.push('l-icon--spin')
  }

  // 自定义类名
  if (props.class) {
    classes.push(props.class)
  }

  return classes
})

/**
 * 图标样式
 */
const iconStyles = computed(() => {
  const styles: Record<string, any> = {}

  // 颜色
  if (props.color) {
    styles.color = props.color
  }

  // 旋转角度
  if (props.rotate && !props.spin) {
    styles.transform = `rotate(${props.rotate}deg)`
  }

  // 合并自定义样式
  if (props.style) {
    if (typeof props.style === 'string') {
      // 处理字符串样式
      const customStyles = props.style.split(';').reduce((acc, style) => {
        const [key, value] = style.split(':').map(s => s.trim())
        if (key && value) {
          acc[key] = value
        }
        return acc
      }, {} as Record<string, string>)
      Object.assign(styles, customStyles)
    } else {
      Object.assign(styles, props.style)
    }
  }

  return styles
})

/**
 * 点击事件处理
 */
const handleClick = (event: MouseEvent) => {
  emit('click', event)
}

/**
 * 获取图标元素
 */
const getElement = () => {
  return iconRef.value || null
}

/**
 * 暴露组件实例方法
 */
defineExpose({
  getElement
})
</script>

<style lang="less">
@import './icon.less';
</style>
