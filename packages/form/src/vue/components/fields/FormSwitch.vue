<template>
  <label
    :class="[
      'l-form-switch',
      `l-form-switch--${size}`,
      {
        'l-form-switch--checked': isChecked,
        'l-form-switch--disabled': disabled,
        'l-form-switch--readonly': readonly,
        'l-form-switch--loading': loading
      }
    ]"
  >
    <input
      :id="id"
      type="checkbox"
      :checked="isChecked"
      :disabled="disabled || loading"
      :readonly="readonly"
      class="l-form-switch__input"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    
    <span class="l-form-switch__track">
      <span class="l-form-switch__thumb">
        <!-- 加载图标 -->
        <i v-if="loading" class="l-form-switch__loading-icon"></i>
        
        <!-- 自定义图标 -->
        <i v-else-if="checkedIcon && isChecked" :class="checkedIcon"></i>
        <i v-else-if="uncheckedIcon && !isChecked" :class="uncheckedIcon"></i>
      </span>
      
      <!-- 内部文本 -->
      <span v-if="checkedText || uncheckedText" class="l-form-switch__text">
        {{ isChecked ? checkedText : uncheckedText }}
      </span>
    </span>
    
    <!-- 外部标签 -->
    <span v-if="label" class="l-form-switch__label">
      {{ label }}
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SizeType } from '../../../types'

// 组件属性
interface Props {
  id?: string
  value?: boolean
  label?: string
  disabled?: boolean
  readonly?: boolean
  loading?: boolean
  size?: SizeType
  checkedText?: string
  uncheckedText?: string
  checkedIcon?: string
  uncheckedIcon?: string
  checkedValue?: any
  uncheckedValue?: any
}

// 组件事件
interface Emits {
  (e: 'update:value', value: boolean | any): void
  (e: 'change', value: boolean | any, event: Event): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  id: 'switch',
  value: false,
  label: '',
  disabled: false,
  readonly: false,
  loading: false,
  size: 'medium',
  checkedText: '',
  uncheckedText: '',
  checkedIcon: '',
  uncheckedIcon: '',
  checkedValue: true,
  uncheckedValue: false
})

const emit = defineEmits<Emits>()

// 计算属性
const isChecked = computed(() => {
  if (props.checkedValue !== true || props.uncheckedValue !== false) {
    return props.value === props.checkedValue
  }
  return !!props.value
})

// 方法
const handleChange = (event: Event) => {
  if (props.disabled || props.readonly || props.loading) return
  
  const target = event.target as HTMLInputElement
  const checked = target.checked
  
  let newValue: any
  if (props.checkedValue !== true || props.uncheckedValue !== false) {
    newValue = checked ? props.checkedValue : props.uncheckedValue
  } else {
    newValue = checked
  }
  
  emit('update:value', newValue)
  emit('change', newValue, event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}
</script>

<style lang="less">
.l-form-switch {
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
    
    &:focus + .l-form-switch__track {
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
  }
  
  &__track {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 22px;
    background-color: var(--border-color, #d9d9d9);
    border-radius: 11px;
    transition: all 0.2s ease-in-out;
    overflow: hidden;
  }
  
  &__thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 18px;
    height: 18px;
    background-color: var(--background-color, #ffffff);
    border-radius: 50%;
    transition: all 0.2s ease-in-out;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    
    i {
      font-size: 10px;
      color: var(--text-color-secondary, #8c8c8c);
    }
  }
  
  &__text {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    font-size: 12px;
    color: var(--background-color, #ffffff);
    font-weight: 500;
    transition: all 0.2s ease-in-out;
    white-space: nowrap;
  }
  
  &__label {
    margin-left: 8px;
    color: var(--text-color-primary, #262626);
    font-size: 14px;
    line-height: 1.5;
  }
  
  &__loading-icon {
    width: 12px;
    height: 12px;
    border: 1px solid var(--border-color, #d9d9d9);
    border-top-color: var(--primary-color, #1890ff);
    border-radius: 50%;
    animation: l-switch-spin 1s linear infinite;
  }
  
  // 选中状态
  &--checked {
    .l-form-switch__track {
      background-color: var(--primary-color, #1890ff);
    }
    
    .l-form-switch__thumb {
      left: 24px;
      
      i {
        color: var(--primary-color, #1890ff);
      }
    }
    
    .l-form-switch__text {
      left: 6px;
    }
  }
  
  // 未选中状态
  &:not(&--checked) {
    .l-form-switch__text {
      right: 6px;
    }
  }
  
  // 禁用状态
  &--disabled {
    cursor: not-allowed;
    opacity: 0.6;
    
    .l-form-switch__track {
      background-color: var(--background-color-disabled, #f5f5f5);
    }
    
    .l-form-switch__thumb {
      background-color: var(--background-color-light, #fafafa);
    }
    
    .l-form-switch__label {
      color: var(--text-color-disabled, #bfbfbf);
    }
    
    &.l-form-switch--checked {
      .l-form-switch__track {
        background-color: var(--background-color-disabled, #f5f5f5);
      }
    }
  }
  
  // 只读状态
  &--readonly {
    cursor: default;
  }
  
  // 加载状态
  &--loading {
    cursor: not-allowed;
  }
  
  // 尺寸样式
  &--small {
    .l-form-switch__track {
      width: 28px;
      height: 16px;
      border-radius: 8px;
    }
    
    .l-form-switch__thumb {
      width: 12px;
      height: 12px;
      top: 2px;
      left: 2px;
      
      i {
        font-size: 8px;
      }
    }
    
    .l-form-switch__text {
      font-size: 10px;
    }
    
    .l-form-switch__label {
      font-size: 12px;
      margin-left: 6px;
    }
    
    .l-form-switch__loading-icon {
      width: 8px;
      height: 8px;
    }
    
    &.l-form-switch--checked {
      .l-form-switch__thumb {
        left: 14px;
      }
      
      .l-form-switch__text {
        left: 4px;
      }
    }
    
    &:not(.l-form-switch--checked) {
      .l-form-switch__text {
        right: 4px;
      }
    }
  }
  
  &--large {
    .l-form-switch__track {
      width: 56px;
      height: 28px;
      border-radius: 14px;
    }
    
    .l-form-switch__thumb {
      width: 24px;
      height: 24px;
      top: 2px;
      left: 2px;
      
      i {
        font-size: 12px;
      }
    }
    
    .l-form-switch__text {
      font-size: 14px;
    }
    
    .l-form-switch__label {
      font-size: 16px;
      margin-left: 10px;
    }
    
    .l-form-switch__loading-icon {
      width: 16px;
      height: 16px;
    }
    
    &.l-form-switch--checked {
      .l-form-switch__thumb {
        left: 30px;
      }
      
      .l-form-switch__text {
        left: 8px;
      }
    }
    
    &:not(.l-form-switch--checked) {
      .l-form-switch__text {
        right: 8px;
      }
    }
  }
}

// 旋转动画
@keyframes l-switch-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
