<template>
  <label
    :class="checkboxClasses"
    @click="handleClick"
  >
    <span class="ld-checkbox__input">
      <input
        ref="inputRef"
        type="checkbox"
        :name="name"
        :checked="isChecked"
        :disabled="disabled"
        :value="value"
        class="ld-checkbox__original"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <span class="ld-checkbox__inner">
        <l-icon
          v-if="isChecked && !indeterminate"
          name="check"
          class="ld-checkbox__icon"
        />
        <span
          v-else-if="indeterminate"
          class="ld-checkbox__indeterminate"
        />
      </span>
    </span>
    <span v-if="label || $slots.default" class="ld-checkbox__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { checkboxProps, checkboxEmits } from './types'

defineOptions({
  name: 'LCheckbox'
})

const props = defineProps(checkboxProps)
const emit = defineEmits(checkboxEmits)

const inputRef = ref<HTMLInputElement>()

const isChecked = computed(() => {
  return props.modelValue
})

const checkboxClasses = computed(() => {
  return [
    'ld-checkbox',
    `ld-checkbox--${props.size}`,
    {
      'ld-checkbox--checked': isChecked.value,
      'ld-checkbox--disabled': props.disabled,
      'ld-checkbox--indeterminate': props.indeterminate
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

  const target = event.target as HTMLInputElement
  const newValue = target.checked

  emit('update:modelValue', newValue)
  emit('change', newValue, event)
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
@import './checkbox.less';
</style>