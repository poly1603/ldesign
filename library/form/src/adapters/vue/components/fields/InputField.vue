<template>
  <div class="ldesign-input-field">
    <div class="ldesign-input-wrapper" :class="wrapperClass">
      <!-- 前缀 -->
      <span v-if="$slots.prefix || prefix" class="ldesign-input-prefix">
        <slot name="prefix">
          <component :is="prefix" v-if="typeof prefix !== 'string'" />
          <span v-else>{{ prefix }}</span>
        </slot>
      </span>

      <!-- 输入框 -->
      <input
        :id="id"
        ref="inputRef"
        v-model="inputValue"
        :type="computedType"
        :name="name"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxLength"
        :class="inputClass"
        @input="handleInput"
        @change="handleChange"
        @blur="handleBlur"
        @focus="handleFocus"
        @keypress="handleKeyPress"
      />

      <!-- 密码可见性切换 -->
      <span
        v-if="type === 'password' && showPasswordToggle"
        class="ldesign-input-suffix ldesign-password-toggle"
        @click="togglePasswordVisibility"
      >
        {{ passwordVisible ? '👁️' : '👁️‍🗨️' }}
      </span>

      <!-- 清空按钮 -->
      <span
        v-if="clearable && inputValue && !disabled && !readonly"
        class="ldesign-input-suffix ldesign-clear-btn"
        @click="handleClear"
      >
        ✕
      </span>

      <!-- 后缀 -->
      <span v-if="$slots.suffix || suffix" class="ldesign-input-suffix">
        <slot name="suffix">
          <component :is="suffix" v-if="typeof suffix !== 'string'" />
          <span v-else>{{ suffix }}</span>
        </slot>
      </span>
    </div>

    <!-- 字符计数 -->
    <div v-if="showCount && maxLength" class="ldesign-input-count">
      {{ inputValue?.length || 0 }} / {{ maxLength }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  id?: string
  name?: string
  modelValue?: string | number
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url'
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  showCount?: boolean
  maxLength?: number
  prefix?: string | any
  suffix?: string | any
  showPasswordToggle?: boolean
  error?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  clearable: false,
  showCount: false,
  showPasswordToggle: true,
  error: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'change': [value: string | number]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
  'clear': []
  'keypress': [event: KeyboardEvent]
}>()

const inputRef = ref<HTMLInputElement>()
const inputValue = ref(props.modelValue || '')
const passwordVisible = ref(false)
const isFocused = ref(false)

// 计算实际类型（密码可见性切换）
const computedType = computed(() => {
  if (props.type === 'password' && passwordVisible.value) {
    return 'text'
  }
  return props.type
})

const wrapperClass = computed(() => ({
  'is-disabled': props.disabled,
  'is-focused': isFocused.value,
  'is-error': props.error,
  'has-prefix': props.prefix || !!useSlots().prefix,
  'has-suffix': props.suffix || !!useSlots().suffix || props.clearable || (props.type === 'password' && props.showPasswordToggle)
}))

const inputClass = computed(() => ({
  'ldesign-input': true
}))

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  inputValue.value = newVal || ''
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value: string | number = target.value

  // 数字类型转换
  if (props.type === 'number' && value !== '') {
    value = Number(value)
  }

  inputValue.value = value
  emit('update:modelValue', value)
}

const handleChange = () => {
  emit('change', inputValue.value)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const handleClear = () => {
  inputValue.value = ''
  emit('update:modelValue', '')
  emit('clear')
  inputRef.value?.focus()
}

const handleKeyPress = (event: KeyboardEvent) => {
  emit('keypress', event)
}

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value
}

// 聚焦方法
const focus = () => {
  inputRef.value?.focus()
}

// 失焦方法
const blur = () => {
  inputRef.value?.blur()
}

defineExpose({
  focus,
  blur,
  inputRef
})
</script>

<script lang="ts">
import { useSlots } from 'vue'
</script>

<style lang="less" scoped>
.ldesign-input-field {
  width: 100%;
}

.ldesign-input-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 100%;
  padding: 4px 11px;
  background-color: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  transition: all 0.3s;

  &:hover:not(.is-disabled) {
    border-color: #722ED1;
  }

  &.is-focused {
    border-color: #722ED1;
    box-shadow: 0 0 0 2px rgba(114, 46, 209, 0.1);
  }

  &.is-error {
    border-color: #ff4d4f;

    &:hover,
    &.is-focused {
      border-color: #ff4d4f;
    }

    &.is-focused {
      box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.1);
    }
  }

  &.is-disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;

    .ldesign-input {
      cursor: not-allowed;
    }
  }

  &.has-prefix {
    .ldesign-input {
      padding-left: 8px;
    }
  }

  &.has-suffix {
    .ldesign-input {
      padding-right: 8px;
    }
  }
}

.ldesign-input {
  flex: 1;
  width: 100%;
  padding: 0;
  font-size: 14px;
  line-height: 1.5715;
  color: rgba(0, 0, 0, 0.85);
  background: transparent;
  border: none;
  outline: none;

  &::placeholder {
    color: #bfbfbf;
  }

  &:disabled {
    color: rgba(0, 0, 0, 0.25);
  }
}

.ldesign-input-prefix,
.ldesign-input-suffix {
  display: inline-flex;
  align-items: center;
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
}

.ldesign-password-toggle,
.ldesign-clear-btn {
  cursor: pointer;
  transition: color 0.3s;

  &:hover {
    color: rgba(0, 0, 0, 0.85);
  }
}

.ldesign-input-count {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  text-align: right;
}
</style>






