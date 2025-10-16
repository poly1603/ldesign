<template>
  <div class="base-input-wrapper">
    <div class="input-container" :class="{ 'has-error': errorMessage, 'is-focused': isFocused }">
      <span v-if="prefixIcon" class="input-prefix">
        <LucideIcon :name="prefixIcon" :size="18" />
      </span>
      <input :type="inputType" :value="modelValue" :placeholder="placeholder" :disabled="disabled"
        :maxlength="maxlength" :autocomplete="autocomplete" @input="handleInput" @focus="handleFocus" @blur="handleBlur"
        @keyup.enter="$emit('enter')" class="input-field" />
      <span v-if="type === 'password'" class="input-suffix" @click="togglePasswordVisibility">
        <LucideIcon :name="passwordVisible ? 'eyeOff' : 'eye'" :size="18" />
      </span>
      <span v-if="suffixIcon && type !== 'password'" class="input-suffix">
        <LucideIcon :name="suffixIcon" :size="18" />
      </span>
      <span v-if="clearable && modelValue" class="input-suffix" @click="handleClear">
        <LucideIcon name="x" :size="16" />
      </span>
    </div>
    <div v-if="errorMessage" class="input-error">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import LucideIcon from './LucideIcon.vue'

interface Props {
  modelValue: string
  type?: string
  placeholder?: string
  disabled?: boolean
  maxlength?: number
  autocomplete?: string
  prefixIcon?: string
  suffixIcon?: string
  clearable?: boolean
  errorMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  autocomplete: 'off',
  clearable: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'enter': []
  'clear': []
}>()

const isFocused = ref(false)
const passwordVisible = ref(false)

const inputType = computed(() => {
  if (props.type === 'password' && passwordVisible.value) {
    return 'text'
  }
  return props.type
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleFocus = () => {
  isFocused.value = true
}

const handleBlur = () => {
  isFocused.value = false
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
}

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value
}
</script>

<style scoped>
.base-input-wrapper {
  width: 100%;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 48px;
  padding: 0 16px;
  background-color: #ffffff;
  border: 1.5px solid #e5e7eb;
  box-sizing: border-box;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.input-container:hover {
  border-color: #d1d5db;
}

.input-container.is-focused {
  background-color: #fff;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.input-container.has-error {
  border-color: #ff4d4f;
  background-color: #fff;
}

.input-container.has-error.is-focused {
  box-shadow: 0 0 0 3px rgba(255, 77, 79, 0.1);
}

.input-field {
  flex: 1;
  height: 100%;
  padding: 0 8px;
  border: none;
  background: transparent;
  font-size: 15px;
  line-height: 1.5;
  color: #1f2937;
  outline: none;
}

.input-field::placeholder {
  color: #9ca3af;
}

/* 移除浏览器自动填充的背景色 */
.input-field:-webkit-autofill,
.input-field:-webkit-autofill:hover,
.input-field:-webkit-autofill:focus,
.input-field:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 50px white inset !important;
  -webkit-text-fill-color: #1f2937 !important;
  transition: background-color 5000s ease-in-out 0s;
}

/* Firefox 自动填充样式 */
.input-field:-moz-autofill,
.input-field:-moz-autofill-preview {
  background-color: transparent !important;
  filter: none;
}

.input-field:disabled {
  color: #999;
  cursor: not-allowed;
}

.input-prefix,
.input-suffix {
  display: flex;
  align-items: center;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.2s;
}

.input-suffix:hover {
  color: #6b7280;
}

.input-error {
  margin-top: 4px;
  color: #ff4d4f;
  font-size: 12px;
  line-height: 1.5;
}
</style>