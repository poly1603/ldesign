<template>
  <label
    :class="radioClasses"
    @click="handleClick"
  >
    <span class="ld-radio__input">
      <input
        ref="inputRef"
        type="radio"
        :name="name"
        :checked="isChecked"
        :disabled="disabled"
        :value="value"
        class="ld-radio__original"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <span class="ld-radio__inner">
        <span
          v-if="isChecked"
          class="ld-radio__dot"
        />
      </span>
    </span>
    <span v-if="label || $slots.default" class="ld-radio__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { radioProps, radioEmits } from './types'

defineOptions({
  name: 'LRadio'
})

const props = defineProps(radioProps)
const emit = defineEmits(radioEmits)

const inputRef = ref<HTMLInputElement>()

const isChecked = computed(() => {
  return props.modelValue === props.value
})

const radioClasses = computed(() => {
  return [
    'ld-radio',
    `ld-radio--${props.size}`,
    {
      'ld-radio--checked': isChecked.value,
      'ld-radio--disabled': props.disabled
    }
  ]
})

const handleClick = (event: MouseEvent) => {
  if (props.disabled) {
    event.preventDefault()
    return
  }
}

const handleChange = (event: Event) => {
  if (props.disabled) return

  emit('update:modelValue', props.value)
  emit('change', props.value, event)
}

const handleFocus = () => {
  // 焦点处理逻辑
}

const handleBlur = () => {
  // 失焦处理逻辑
}

const focus = () => {
  inputRef.value?.focus()
}

const blur = () => {
  inputRef.value?.blur()
}

defineExpose({
  $el: inputRef,
  focus,
  blur
})
</script>

<style lang="less">
@import './radio.less';
</style>