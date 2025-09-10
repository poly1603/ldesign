<!--
  Icon 图标组件
  基于 Lucide 图标库，支持多种样式和交互
-->

<template>
  <component
    :is="iconComponent"
    ref="iconRef"
    :class="iconClasses"
    :style="iconStyles"
    :size="iconSize"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue'
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
const props = withDefaults(defineProps<IconProps>(), {
  name: 'circle',
  size: 'medium',
  spin: false,
  rotate: 0
})

/**
 * 组件事件
 */
const emit = defineEmits<IconEmits>()

/**
 * 图标元素引用
 */
const iconRef = ref<HTMLElement>()

/**
 * 动态导入 Lucide 图标组件
 */
const iconComponent = computed(() => {
  if (typeof props.name === 'object') {
    // 如果传入的是组件，直接使用
    return props.name
  }

  if (typeof props.name === 'string') {
    try {
      // 将 kebab-case 转换为 PascalCase
      const iconName = props.name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('')

      return defineAsyncComponent(() =>
        import('lucide-vue-next').then(module => {
          const IconComponent = module[iconName]
          if (!IconComponent) {
            console.warn(`Icon "${props.name}" not found in lucide-vue-next`)
            return module.Circle // 默认图标
          }
          return IconComponent
        }).catch(error => {
          console.error('Error loading icon:', error)
          return import('lucide-vue-next').then(m => m.Circle)
        })
      )
    } catch (error) {
      console.error('Error creating icon component:', error)
      return defineAsyncComponent(() => import('lucide-vue-next').then(m => m.Circle))
    }
  }

  // 默认图标
  return defineAsyncComponent(() => import('lucide-vue-next').then(m => m.Circle))
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
