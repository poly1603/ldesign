<template>
  <div
    :class="[
      'l-form-radio-group',
      `l-form-radio-group--${size}`,
      `l-form-radio-group--${direction}`,
      {
        'l-form-radio-group--disabled': disabled,
        'l-form-radio-group--readonly': readonly,
        'l-form-radio-group--error': hasError
      }
    ]"
  >
    <label
      v-for="option in options"
      :key="option.value"
      :class="[
        'l-form-radio',
        {
          'l-form-radio--checked': isChecked(option.value),
          'l-form-radio--disabled': disabled || option.disabled,
          'l-form-radio--readonly': readonly
        }
      ]"
    >
      <input
        :id="`${id}_${option.value}`"
        type="radio"
        :name="name"
        :value="option.value"
        :checked="isChecked(option.value)"
        :disabled="disabled || option.disabled"
        :readonly="readonly"
        class="l-form-radio__input"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      
      <span class="l-form-radio__indicator">
        <span class="l-form-radio__indicator-inner"></span>
      </span>
      
      <span class="l-form-radio__label">
        {{ option.label }}
      </span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SizeType, OptionItem } from '../../../types'

// 组件属性
interface Props {
  id?: string
  name?: string
  value?: any
  options?: OptionItem[]
  disabled?: boolean
  readonly?: boolean
  size?: SizeType
  hasError?: boolean
  direction?: 'horizontal' | 'vertical'
}

// 组件事件
interface Emits {
  (e: 'update:value', value: any): void
  (e: 'change', value: any, option: OptionItem): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  id: 'radio',
  name: 'radio',
  value: undefined,
  options: () => [],
  disabled: false,
  readonly: false,
  size: 'medium',
  hasError: false,
  direction: 'horizontal'
})

const emit = defineEmits<Emits>()

// 计算属性
const isChecked = (value: any) => {
  return props.value === value
}

// 方法
const handleChange = (event: Event) => {
  if (props.disabled || props.readonly) return
  
  const target = event.target as HTMLInputElement
  const value = target.value
  const option = props.options.find(opt => opt.value === value)
  
  emit('update:value', value)
  if (option) {
    emit('change', value, option)
  }
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}
</script>

<style lang="less">
.l-form-radio-group {
  display: flex;
  gap: 16px;
  
  &--vertical {
    flex-direction: column;
    gap: 8px;
  }
  
  &--horizontal {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  &--small {
    gap: 12px;
    
    &.l-form-radio-group--vertical {
      gap: 6px;
    }
  }
  
  &--large {
    gap: 20px;
    
    &.l-form-radio-group--vertical {
      gap: 12px;
    }
  }
}

.l-form-radio {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  position: relative;
  
  &__input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    
    &:focus + .l-form-radio__indicator {
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
  }
  
  &__indicator {
    position: relative;
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 1px solid var(--border-color, #d9d9d9);
    border-radius: 50%;
    background-color: var(--background-color, #ffffff);
    transition: all 0.2s ease-in-out;
    margin-right: 8px;
    
    &-inner {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0);
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--primary-color, #1890ff);
      transition: transform 0.2s ease-in-out;
    }
  }
  
  &__label {
    color: var(--text-color-primary, #262626);
    font-size: 14px;
    line-height: 1.5;
  }
  
  // 状态样式
  &:hover:not(&--disabled):not(&--readonly) {
    .l-form-radio__indicator {
      border-color: var(--primary-color, #1890ff);
    }
  }
  
  &--checked {
    .l-form-radio__indicator {
      border-color: var(--primary-color, #1890ff);
      background-color: var(--primary-color, #1890ff);
      
      &-inner {
        transform: translate(-50%, -50%) scale(1);
        background-color: var(--background-color, #ffffff);
      }
    }
    
    .l-form-radio__label {
      color: var(--primary-color, #1890ff);
    }
  }
  
  &--disabled {
    cursor: not-allowed;
    
    .l-form-radio__indicator {
      background-color: var(--background-color-disabled, #f5f5f5);
      border-color: var(--border-color-light, #f0f0f0);
    }
    
    .l-form-radio__label {
      color: var(--text-color-disabled, #bfbfbf);
    }
    
    &.l-form-radio--checked {
      .l-form-radio__indicator {
        background-color: var(--background-color-disabled, #f5f5f5);
        border-color: var(--border-color-light, #f0f0f0);
        
        &-inner {
          background-color: var(--text-color-disabled, #bfbfbf);
        }
      }
      
      .l-form-radio__label {
        color: var(--text-color-disabled, #bfbfbf);
      }
    }
  }
  
  &--readonly {
    cursor: default;
  }
  
  // 尺寸样式
  .l-form-radio-group--small & {
    .l-form-radio__indicator {
      width: 14px;
      height: 14px;
      margin-right: 6px;
      
      &-inner {
        width: 6px;
        height: 6px;
      }
    }
    
    .l-form-radio__label {
      font-size: 12px;
    }
  }
  
  .l-form-radio-group--large & {
    .l-form-radio__indicator {
      width: 18px;
      height: 18px;
      margin-right: 10px;
      
      &-inner {
        width: 10px;
        height: 10px;
      }
    }
    
    .l-form-radio__label {
      font-size: 16px;
    }
  }
}

// 错误状态
.l-form-radio-group--error {
  .l-form-radio__indicator {
    border-color: var(--error-color, #ff4d4f);
  }
  
  .l-form-radio--checked .l-form-radio__indicator {
    background-color: var(--error-color, #ff4d4f);
    border-color: var(--error-color, #ff4d4f);
  }
}
</style>
