<template>
  <button
    :class="switchClasses"
    :disabled="disabled"
    type="button"
    role="switch"
    :aria-checked="isChecked"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <span class="ld-switch__track">
      <span class="ld-switch__thumb" />
      <span v-if="checkedText || uncheckedText" class="ld-switch__text">
        {{ isChecked ? checkedText : uncheckedText }}
      </span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { switchProps, switchEmits } from './types'

defineOptions({
  name: 'LSwitch'
})

const props = defineProps(switchProps)
const emit = defineEmits(switchEmits)

const isChecked = computed(() => {
  return props.modelValue
})

const switchClasses = computed(() => {
  return [
    'ld-switch',
    `ld-switch--${props.size}`,
    {
      'ld-switch--checked': isChecked.value,
      'ld-switch--disabled': props.disabled,
      'ld-switch--loading': props.loading
    }
  ]
})

const handleClick = () => {
  if (props.disabled || props.loading) return

  const newValue = !props.modelValue
  emit('update:modelValue', newValue)
  emit('change', newValue)
}

const handleFocus = () => {
  // 焦点处理逻辑
}

const handleBlur = () => {
  // 失焦处理逻辑
}
</script>

<style lang="less">
@import './switch.less';
</style>