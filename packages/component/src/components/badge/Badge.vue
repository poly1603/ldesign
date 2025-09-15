<template>
  <div
    ref="badgeRef"
    :class="badgeClass"
  >
    <!-- 子内容 -->
    <slot />

    <!-- 徽标 -->
    <transition name="ld-badge-zoom">
      <sup
        v-if="!hidden && (showBadge || dot)"
        :class="supClass"
        :style="supStyle"
      >
        <slot name="count" :count="displayValue">
          {{ dot ? '' : displayValue }}
        </slot>
      </sup>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useSlots } from 'vue'
import { badgeProps, badgeEmits } from './types'

defineOptions({
  name: 'LBadge'
})

const props = defineProps(badgeProps)
const emit = defineEmits(badgeEmits)

// 模板引用
const badgeRef = ref<HTMLElement>()

// 计算属性
const badgeClass = computed(() => [
  'ld-badge'
])

const supClass = computed(() => [
  'ld-badge__sup',
  `ld-badge__sup--${props.type}`,
  `ld-badge__sup--${props.size}`,
  {
    'ld-badge__sup--dot': props.dot,
    'ld-badge__sup--fixed': hasSlot.value
  }
])

const supStyle = computed(() => {
  const style: Record<string, string> = {}

  if (props.offset && hasSlot.value) {
    const [x, y] = props.offset
    style.transform = `translate(${x}px, ${y}px)`
  }

  return style
})

// 是否有默认插槽
const slots = useSlots()
const hasSlot = computed(() => {
  return !!slots.default
})

// 显示的值
const displayValue = computed(() => {
  if (props.dot) return ''

  const value = props.value
  if (value === undefined || value === null) return ''

  const numValue = Number(value)
  if (isNaN(numValue)) return String(value)

  if (numValue === 0 && !props.showZero) return ''

  if (numValue > props.max) {
    return `${props.max}+`
  }

  return String(numValue)
})

// 是否显示徽标
const showBadge = computed(() => {
  if (props.dot) return true

  const value = props.value
  if (value === undefined || value === null) return false

  const numValue = Number(value)
  if (isNaN(numValue)) return !!String(value)

  if (numValue === 0) return props.showZero

  return true
})

// 暴露实例方法
defineExpose({
  $el: badgeRef
})
</script>

<style lang="less">
@import './badge.less';
</style>