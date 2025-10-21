<template>
  <div class="ldesign-radio-field" :class="fieldClass">
    <div
      v-for="option in options"
      :key="option.value"
      class="ldesign-radio-item"
      :class="{
        'is-disabled': disabled || option.disabled,
        'is-checked': isChecked(option),
        'is-button': buttonStyle
      }"
      @click="handleClick(option)"
    >
      <span class="ldesign-radio-input">
        <span class="ldesign-radio-inner" />
        <input
          type="radio"
          :name="name"
          :value="option.value"
          :checked="isChecked(option)"
          :disabled="disabled || option.disabled"
          class="ldesign-radio-original"
        />
      </span>
      <span class="ldesign-radio-label">{{ option.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface RadioOption {
  label: string
  value: any
  disabled?: boolean
}

interface Props {
  modelValue?: any
  options?: RadioOption[]
  name?: string
  disabled?: boolean
  buttonStyle?: boolean
  direction?: 'horizontal' | 'vertical'
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  disabled: false,
  buttonStyle: false,
  direction: 'horizontal'
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
  'change': [value: any, option: RadioOption]
}>()

const fieldClass = computed(() => ({
  [`is-${props.direction}`]: true,
  'is-button-style': props.buttonStyle
}))

const isChecked = (option: RadioOption) => {
  return props.modelValue === option.value
}

const handleClick = (option: RadioOption) => {
  if (props.disabled || option.disabled) return
  if (isChecked(option)) return // 已选中则不触发

  emit('update:modelValue', option.value)
  emit('change', option.value, option)
}
</script>

<style lang="less" scoped>
.ldesign-radio-field {
  display: flex;
  gap: 12px;

  &.is-horizontal {
    flex-direction: row;
    flex-wrap: wrap;
  }

  &.is-vertical {
    flex-direction: column;
  }

  &.is-button-style {
    gap: 0;

    .ldesign-radio-item {
      border: 1px solid #d9d9d9;
      border-left-width: 0;
      padding: 4px 15px;

      &:first-child {
        border-left-width: 1px;
        border-radius: 4px 0 0 4px;
      }

      &:last-child {
        border-radius: 0 4px 4px 0;
      }

      &:hover:not(.is-disabled) {
        color: #722ED1;
        border-color: #722ED1;
        z-index: 1;
      }

      &.is-checked {
        background-color: #722ED1;
        border-color: #722ED1;
        color: #fff;
        z-index: 2;
      }

      &.is-disabled {
        background-color: #f5f5f5;
        border-color: #d9d9d9;
        color: rgba(0, 0, 0, 0.25);
      }

      .ldesign-radio-input {
        display: none;
      }
    }
  }
}

.ldesign-radio-item {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
  line-height: 1;
  transition: all 0.3s;

  &.is-disabled {
    cursor: not-allowed;
    color: rgba(0, 0, 0, 0.25);
  }
}

.ldesign-radio-input {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  white-space: nowrap;
  vertical-align: sub;
  outline: none;
  cursor: pointer;
}

.ldesign-radio-inner {
  position: relative;
  display: block;
  width: 16px;
  height: 16px;
  background-color: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 50%;
  transition: all 0.3s;

  &::after {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 8px;
    height: 8px;
    background-color: #722ED1;
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.78, 0.14, 0.15, 0.86);
    content: '';
  }

  .ldesign-radio-item:hover:not(.is-disabled) & {
    border-color: #722ED1;
  }

  .ldesign-radio-item.is-checked & {
    border-color: #722ED1;

    &::after {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
  }

  .ldesign-radio-item.is-disabled & {
    background-color: #f5f5f5;
    border-color: #d9d9d9;

    &::after {
      background-color: rgba(0, 0, 0, 0.25);
    }
  }
}

.ldesign-radio-original {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  opacity: 0;
  margin: 0;
  pointer-events: none;
}

.ldesign-radio-label {
  padding: 0 8px 0 0;
  font-size: 14px;
}
</style>






