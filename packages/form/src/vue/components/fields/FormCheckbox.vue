<template>
  <div
    :class="[
      'l-form-checkbox-group',
      `l-form-checkbox-group--${size}`,
      `l-form-checkbox-group--${direction}`,
      {
        'l-form-checkbox-group--disabled': disabled,
        'l-form-checkbox-group--readonly': readonly,
        'l-form-checkbox-group--error': hasError
      }
    ]"
  >
    <!-- 单个复选框 -->
    <label
      v-if="!options || options.length === 0"
      :class="[
        'l-form-checkbox',
        {
          'l-form-checkbox--checked': isChecked,
          'l-form-checkbox--indeterminate': indeterminate,
          'l-form-checkbox--disabled': disabled,
          'l-form-checkbox--readonly': readonly
        }
      ]"
    >
      <input
        :id="id"
        type="checkbox"
        :checked="isChecked"
        :disabled="disabled"
        :readonly="readonly"
        class="l-form-checkbox__input"
        @change="handleSingleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      
      <span class="l-form-checkbox__indicator">
        <i
          v-if="indeterminate"
          class="l-form-checkbox__indicator-indeterminate"
        ></i>
        <i
          v-else-if="isChecked"
          class="l-form-checkbox__indicator-check"
        ></i>
      </span>
      
      <span v-if="label" class="l-form-checkbox__label">
        {{ label }}
      </span>
    </label>
    
    <!-- 复选框组 -->
    <template v-else>
      <label
        v-for="option in options"
        :key="option.value"
        :class="[
          'l-form-checkbox',
          {
            'l-form-checkbox--checked': isOptionChecked(option.value),
            'l-form-checkbox--disabled': disabled || option.disabled,
            'l-form-checkbox--readonly': readonly
          }
        ]"
      >
        <input
          :id="`${id}_${option.value}`"
          type="checkbox"
          :value="option.value"
          :checked="isOptionChecked(option.value)"
          :disabled="disabled || option.disabled"
          :readonly="readonly"
          class="l-form-checkbox__input"
          @change="handleGroupChange"
          @focus="handleFocus"
          @blur="handleBlur"
        />
        
        <span class="l-form-checkbox__indicator">
          <i
            v-if="isOptionChecked(option.value)"
            class="l-form-checkbox__indicator-check"
          ></i>
        </span>
        
        <span class="l-form-checkbox__label">
          {{ option.label }}
        </span>
      </label>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SizeType, OptionItem } from '../../../types'

// 组件属性
interface Props {
  id?: string
  value?: any
  label?: string
  options?: OptionItem[]
  disabled?: boolean
  readonly?: boolean
  size?: SizeType
  hasError?: boolean
  direction?: 'horizontal' | 'vertical'
  indeterminate?: boolean
}

// 组件事件
interface Emits {
  (e: 'update:value', value: any): void
  (e: 'change', value: any, option?: OptionItem | OptionItem[]): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  id: 'checkbox',
  value: undefined,
  label: '',
  options: () => [],
  disabled: false,
  readonly: false,
  size: 'medium',
  hasError: false,
  direction: 'horizontal',
  indeterminate: false
})

const emit = defineEmits<Emits>()

// 计算属性
const isChecked = computed(() => {
  if (props.options && props.options.length > 0) {
    // 复选框组模式
    return false
  }
  // 单个复选框模式
  return !!props.value
})

const isOptionChecked = (value: any) => {
  if (!Array.isArray(props.value)) {
    return props.value === value
  }
  return props.value.includes(value)
}

// 方法
const handleSingleChange = (event: Event) => {
  if (props.disabled || props.readonly) return
  
  const target = event.target as HTMLInputElement
  const checked = target.checked
  
  emit('update:value', checked)
  emit('change', checked)
}

const handleGroupChange = (event: Event) => {
  if (props.disabled || props.readonly) return
  
  const target = event.target as HTMLInputElement
  const value = target.value
  const checked = target.checked
  
  let newValue: any[]
  
  if (Array.isArray(props.value)) {
    newValue = [...props.value]
  } else {
    newValue = []
  }
  
  if (checked) {
    if (!newValue.includes(value)) {
      newValue.push(value)
    }
  } else {
    const index = newValue.indexOf(value)
    if (index > -1) {
      newValue.splice(index, 1)
    }
  }
  
  emit('update:value', newValue)
  
  const selectedOptions = props.options.filter(opt => newValue.includes(opt.value))
  emit('change', newValue, selectedOptions)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}
</script>

<style lang="less">
.l-form-checkbox-group {
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
    
    &.l-form-checkbox-group--vertical {
      gap: 6px;
    }
  }
  
  &--large {
    gap: 20px;
    
    &.l-form-checkbox-group--vertical {
      gap: 12px;
    }
  }
}

.l-form-checkbox {
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
    
    &:focus + .l-form-checkbox__indicator {
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
  }
  
  &__indicator {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border: 1px solid var(--border-color, #d9d9d9);
    border-radius: 2px;
    background-color: var(--background-color, #ffffff);
    transition: all 0.2s ease-in-out;
    margin-right: 8px;
    
    &-check {
      color: var(--background-color, #ffffff);
      font-size: 12px;
      
      &::before {
        content: '✓';
      }
    }
    
    &-indeterminate {
      width: 8px;
      height: 2px;
      background-color: var(--background-color, #ffffff);
    }
  }
  
  &__label {
    color: var(--text-color-primary, #262626);
    font-size: 14px;
    line-height: 1.5;
  }
  
  // 状态样式
  &:hover:not(&--disabled):not(&--readonly) {
    .l-form-checkbox__indicator {
      border-color: var(--primary-color, #1890ff);
    }
  }
  
  &--checked,
  &--indeterminate {
    .l-form-checkbox__indicator {
      border-color: var(--primary-color, #1890ff);
      background-color: var(--primary-color, #1890ff);
    }
  }
  
  &--disabled {
    cursor: not-allowed;
    
    .l-form-checkbox__indicator {
      background-color: var(--background-color-disabled, #f5f5f5);
      border-color: var(--border-color-light, #f0f0f0);
    }
    
    .l-form-checkbox__label {
      color: var(--text-color-disabled, #bfbfbf);
    }
    
    &.l-form-checkbox--checked,
    &.l-form-checkbox--indeterminate {
      .l-form-checkbox__indicator {
        background-color: var(--background-color-disabled, #f5f5f5);
        border-color: var(--border-color-light, #f0f0f0);
        
        .l-form-checkbox__indicator-check,
        .l-form-checkbox__indicator-indeterminate {
          color: var(--text-color-disabled, #bfbfbf);
          background-color: var(--text-color-disabled, #bfbfbf);
        }
      }
    }
  }
  
  &--readonly {
    cursor: default;
  }
  
  // 尺寸样式
  .l-form-checkbox-group--small & {
    .l-form-checkbox__indicator {
      width: 14px;
      height: 14px;
      margin-right: 6px;
      
      &-check {
        font-size: 10px;
      }
      
      &-indeterminate {
        width: 6px;
        height: 1px;
      }
    }
    
    .l-form-checkbox__label {
      font-size: 12px;
    }
  }
  
  .l-form-checkbox-group--large & {
    .l-form-checkbox__indicator {
      width: 18px;
      height: 18px;
      margin-right: 10px;
      
      &-check {
        font-size: 14px;
      }
      
      &-indeterminate {
        width: 10px;
        height: 3px;
      }
    }
    
    .l-form-checkbox__label {
      font-size: 16px;
    }
  }
}

// 错误状态
.l-form-checkbox-group--error {
  .l-form-checkbox__indicator {
    border-color: var(--error-color, #ff4d4f);
  }
  
  .l-form-checkbox--checked .l-form-checkbox__indicator,
  .l-form-checkbox--indeterminate .l-form-checkbox__indicator {
    background-color: var(--error-color, #ff4d4f);
    border-color: var(--error-color, #ff4d4f);
  }
}
</style>
