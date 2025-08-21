<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface FormRateProps {
  modelValue?: number
  count?: number
  allowHalf?: boolean
  allowClear?: boolean
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  label?: string
  tooltip?: string
  description?: string
  showLabel?: boolean
  showColon?: boolean
  showText?: boolean
  showValue?: boolean
  size?: 'small' | 'medium' | 'large'
  character?: string
  texts?: string[]
  errors?: string[]
}

const props = withDefaults(defineProps<FormRateProps>(), {
  modelValue: 0,
  count: 5,
  allowHalf: false,
  allowClear: true,
  disabled: false,
  readonly: false,
  required: false,
  showLabel: true,
  showColon: false,
  showText: false,
  showValue: false,
  size: 'medium',
  character: '★',
  texts: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  'change': [value: number]
  'hoverChange': [value: number]
}>()

const inputValue = ref<number>(props.modelValue)
const hoverValue = ref<number>(-1)

// 监听外部值变化
watch(
  () => props.modelValue,
  (newValue) => {
    inputValue.value = newValue
  },
  { immediate: true },
)

// 生成星星数组
const stars = computed(() => {
  return Array.from({ length: props.count }, (_, index) => index)
})

// 显示值
const displayValue = computed(() => {
  return `${inputValue.value}/${props.count}`
})

// 评分文本
const rateText = computed(() => {
  if (props.texts.length === 0)
    return ''
  const index = Math.ceil(inputValue.value) - 1
  return props.texts[index] || ''
})

// 样式类
const rateClasses = computed(() => [
  `form-rate--${props.size}`,
  {
    'form-rate--disabled': props.disabled,
    'form-rate--readonly': props.readonly,
    'form-rate--required': props.required,
    'form-rate--error': hasError.value,
  },
])

const labelClasses = computed(() => [`form-rate__label--${props.size}`])

const wrapperClasses = computed(() => [`form-rate__wrapper--${props.size}`])

// 错误状态
const hasError = computed(() => props.errors && props.errors.length > 0)

// 获取星星样式类
function getStarClasses(index: number) {
  const currentValue
    = hoverValue.value >= 0 ? hoverValue.value : inputValue.value
  const isActive = index < currentValue
  const isHalf = props.allowHalf && currentValue - index === 0.5

  return [
    {
      'form-rate__star--active': isActive,
      'form-rate__star--half': isHalf,
      'form-rate__star--disabled': props.disabled,
      'form-rate__star--readonly': props.readonly,
    },
  ]
}

// 获取星星图标
function getStarIcon(index: number) {
  const currentValue
    = hoverValue.value >= 0 ? hoverValue.value : inputValue.value

  if (props.allowHalf && currentValue - index === 0.5) {
    return '☆' // 半星
  }

  return props.character
}

// 事件处理
function handleClick(index: number) {
  if (props.disabled || props.readonly)
    return

  let newValue = index + 1

  // 如果允许清除且点击的是当前值，则清除
  if (props.allowClear && newValue === inputValue.value) {
    newValue = 0
  }

  inputValue.value = newValue
  emit('update:modelValue', newValue)
  emit('change', newValue)
}

function handleMouseEnter(index: number) {
  if (props.disabled || props.readonly)
    return

  hoverValue.value = index + 1
  emit('hoverChange', hoverValue.value)
}

function handleMouseLeave() {
  if (props.disabled || props.readonly)
    return

  hoverValue.value = -1
  emit('hoverChange', inputValue.value)
}
</script>

<template>
  <div class="form-rate" :class="rateClasses">
    <div v-if="showLabel" class="form-rate__label" :class="labelClasses">
      <label class="form-rate__label-text">
        {{ label }}
        <span v-if="required" class="form-rate__required">*</span>
        <span v-if="showColon" class="form-rate__colon">:</span>
      </label>
      <div v-if="tooltip" class="form-rate__tooltip" :title="tooltip">
        ?
      </div>
    </div>

    <div class="form-rate__wrapper" :class="wrapperClasses">
      <div class="form-rate__stars">
        <span
          v-for="(star, index) in stars"
          :key="index"
          class="form-rate__star"
          :class="getStarClasses(index)"
          @click="handleClick(index)"
          @mouseenter="handleMouseEnter(index)"
          @mouseleave="handleMouseLeave"
        >
          {{ getStarIcon(index) }}
        </span>
      </div>

      <div v-if="showText && rateText" class="form-rate__text">
        {{ rateText }}
      </div>

      <div v-if="showValue" class="form-rate__value">
        {{ displayValue }}
      </div>
    </div>

    <div v-if="hasError" class="form-rate__error">
      <div v-for="error in errors" :key="error" class="form-rate__error-text">
        {{ error }}
      </div>
    </div>

    <div v-if="description" class="form-rate__description">
      {{ description }}
    </div>
  </div>
</template>

<style scoped>
.form-rate {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-rate__label {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.form-rate__label-text {
  font-weight: 500;
  color: var(--form-label-color, #333);
  font-size: var(--form-label-font-size, 14px);
}

.form-rate__required {
  color: var(--form-error-color, #ff4d4f);
}

.form-rate__colon {
  margin-left: 2px;
}

.form-rate__tooltip {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--form-info-color, #1890ff);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: help;
}

.form-rate__wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-rate__stars {
  display: flex;
  gap: 4px;
}

.form-rate__star {
  font-size: 20px;
  color: var(--form-border-color, #d9d9d9);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.form-rate__star:hover:not(.form-rate__star--disabled):not(.form-rate__star--readonly) {
  transform: scale(1.1);
}

.form-rate__star--active {
  color: var(--form-warning-color, #faad14);
}

.form-rate__star--half {
  background: linear-gradient(90deg, var(--form-warning-color, #faad14) 50%, var(--form-border-color, #d9d9d9) 50%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-rate__star--disabled,
.form-rate__star--readonly {
  cursor: not-allowed;
}

.form-rate__text {
  font-size: var(--form-font-size, 14px);
  color: var(--form-text-color, #333);
  margin-left: 4px;
}

.form-rate__value {
  font-size: 12px;
  color: var(--form-text-secondary-color, #666);
  margin-left: 4px;
}

.form-rate__error {
  margin-top: 4px;
}

.form-rate__error-text {
  color: var(--form-error-color, #ff4d4f);
  font-size: 12px;
  line-height: 1.4;
}

.form-rate__description {
  color: var(--form-text-secondary-color, #666);
  font-size: 12px;
  line-height: 1.4;
  margin-top: 4px;
}

/* 尺寸变体 */
.form-rate--small .form-rate__star {
  font-size: 16px;
}

.form-rate--small .form-rate__label-text {
  font-size: 12px;
}

.form-rate--small .form-rate__text {
  font-size: 12px;
}

.form-rate--large .form-rate__star {
  font-size: 24px;
}

.form-rate--large .form-rate__label-text {
  font-size: 16px;
}

.form-rate--large .form-rate__text {
  font-size: 16px;
}

/* 禁用状态 */
.form-rate--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-rate--disabled .form-rate__star {
  cursor: not-allowed;
}

/* 只读状态 */
.form-rate--readonly .form-rate__star {
  cursor: default;
}

/* 错误状态 */
.form-rate--error .form-rate__star {
  color: var(--form-error-color, #ff4d4f);
}

.form-rate--error .form-rate__star--active {
  color: var(--form-error-color, #ff4d4f);
}
</style>
