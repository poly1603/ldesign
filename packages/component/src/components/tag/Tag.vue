<template>
  <span
    ref="tagRef"
    :class="tagClass"
    :style="tagStyle"
    @click="handleClick"
  >
    <!-- 图标 -->
    <i v-if="icon" :class="`ld-icon-${icon}`" class="ld-tag__icon" />

    <!-- 内容 -->
    <span class="ld-tag__content">
      <slot />
    </span>

    <!-- 关闭按钮 -->
    <i
      v-if="closable"
      class="ld-tag__close"
      @click.stop="handleClose"
    >×</i>
  </span>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { tagProps, tagEmits } from './types'

defineOptions({
  name: 'LTag'
})

const props = defineProps(tagProps)
const emit = defineEmits(tagEmits)

// 模板引用
const tagRef = ref<HTMLElement>()

// 计算属性
const tagClass = computed(() => [
  'ld-tag',
  `ld-tag--${props.type}`,
  `ld-tag--${props.variant}`,
  `ld-tag--${props.size}`,
  {
    'ld-tag--disabled': props.disabled,
    'ld-tag--clickable': props.clickable,
    'ld-tag--checked': props.checked,
    'ld-tag--closable': props.closable
  }
])

const tagStyle = computed(() => {
  const style: Record<string, string> = {}

  if (props.color) {
    if (props.variant === 'filled') {
      style.backgroundColor = props.color
      style.borderColor = props.color
      style.color = '#ffffff'
    } else if (props.variant === 'outlined') {
      style.borderColor = props.color
      style.color = props.color
    } else if (props.variant === 'light') {
      style.backgroundColor = `${props.color}1a`
      style.borderColor = `${props.color}4d`
      style.color = props.color
    }
  }

  return style
})

// 事件处理
const handleClick = (event: MouseEvent) => {
  if (props.disabled) return

  if (props.clickable) {
    emit('update:checked', !props.checked)
  }

  emit('click', event)
}

const handleClose = (event: MouseEvent) => {
  if (props.disabled) return
  emit('close', event)
}

// 暴露实例方法
defineExpose({
  $el: tagRef
})
</script>

<style lang="less">
@import './tag.less';
</style>