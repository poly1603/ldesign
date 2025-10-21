<template>
  <div class="ldesign-switch-field">
    <button
      type="button"
      role="switch"
      :aria-checked="isChecked"
      class="ldesign-switch"
      :class="switchClass"
      :disabled="disabled || loading"
      @click="handleClick"
    >
      <span class="ldesign-switch-handle">
        <span v-if="loading" class="ldesign-switch-loading">⟳</span>
      </span>
      <span v-if="checkedChildren || uncheckedChildren" class="ldesign-switch-inner">
        {{ isChecked ? checkedChildren : uncheckedChildren }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: boolean
  disabled?: boolean
  loading?: boolean
  checkedChildren?: string
  uncheckedChildren?: string
  checkedValue?: any
  uncheckedValue?: any
  size?: 'small' | 'default'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
  loading: false,
  checkedValue: true,
  uncheckedValue: false,
  size: 'default'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean | any]
  'change': [value: boolean | any]
}>()

const isChecked = computed(() => {
  return props.modelValue === props.checkedValue
})

const switchClass = computed(() => ({
  'is-checked': isChecked.value,
  'is-disabled': props.disabled,
  'is-loading': props.loading,
  [`ldesign-switch--${props.size}`]: true
}))

const handleClick = () => {
  if (props.disabled || props.loading) return

  const newValue = isChecked.value ? props.uncheckedValue : props.checkedValue
  emit('update:modelValue', newValue)
  emit('change', newValue)
}
</script>

<style lang="less" scoped>
.ldesign-switch-field {
  display: inline-block;
}

.ldesign-switch {
  position: relative;
  display: inline-block;
  min-width: 44px;
  height: 22px;
  padding: 0;
  background-color: rgba(0, 0, 0, 0.25);
  border: 0;
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(114, 46, 209, 0.1);
  }

  &:hover:not(.is-disabled):not(.is-loading) {
    background-color: rgba(0, 0, 0, 0.35);
  }

  &.is-checked {
    background-color: #722ED1;

    &:hover:not(.is-disabled):not(.is-loading) {
      background-color: #5c24a8;
    }

    .ldesign-switch-handle {
      left: calc(100% - 18px - 2px);
    }

    .ldesign-switch-inner {
      margin: 0 24px 0 6px;
    }
  }

  &.is-disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &.is-loading {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &--small {
    min-width: 28px;
    height: 16px;

    .ldesign-switch-handle {
      width: 12px;
      height: 12px;
    }

    &.is-checked .ldesign-switch-handle {
      left: calc(100% - 12px - 2px);
    }

    .ldesign-switch-inner {
      font-size: 12px;
      margin: 0 18px 0 5px;
    }

    &.is-checked .ldesign-switch-inner {
      margin: 0 18px 0 5px;
    }
  }
}

.ldesign-switch-handle {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background-color: #fff;
  border-radius: 50%;
  box-shadow: 0 2px 4px 0 rgba(0, 35, 11, 0.2);
  transition: all 0.2s ease-in-out;
}

.ldesign-switch-loading {
  display: inline-block;
  font-size: 12px;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.ldesign-switch-inner {
  display: block;
  margin: 0 6px 0 24px;
  color: #fff;
  font-size: 12px;
  line-height: 22px;
  transition: margin 0.2s;

  .ldesign-switch--small & {
    line-height: 16px;
  }
}
</style>






