<!--
带验证功能的表单字段组件
-->

<template>
  <div :class="['validation-field', `field-${field.type}`, validationClass]">
    <label v-if="field.label" :class="['field-label', { required: field.required }]">
      {{ field.label }}
      <span v-if="showStatus && validationState.status" :class="['status-indicator', validationState.status]">
        <span v-if="validationState.status === 'valid'">✅</span>
        <span v-else-if="validationState.status === 'invalid'">❌</span>
        <span v-else-if="validationState.status === 'validating'">🔄</span>
      </span>
    </label>

    <!-- 字段输入 -->
    <div class="field-input-wrapper">
      <FormField
        :field="field"
        :value="value"
        @update:value="handleValueChange"
        @change="handleChange"
        @blur="handleBlur"
      />
      
      <!-- 验证状态指示器 -->
      <div v-if="showStatus && validationState.status" class="field-status">
        <div :class="['status-icon', validationState.status]">
          <span v-if="validationState.status === 'valid'">✅</span>
          <span v-else-if="validationState.status === 'invalid'">❌</span>
          <span v-else-if="validationState.status === 'validating'">
            <span class="spinner">🔄</span>
          </span>
        </div>
      </div>
    </div>

    <!-- 验证消息 -->
    <div v-if="validationState.message" :class="['validation-message', validationState.status]">
      {{ validationState.message }}
    </div>

    <!-- 帮助文本 -->
    <div v-if="field.help && !validationState.message" class="field-help">
      {{ field.help }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import FormField from './FormField.vue'

// Props
interface Props {
  field: any
  value?: any
  realTime?: boolean
  showStatus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  realTime: true,
  showStatus: true
})

// Emits
const emit = defineEmits<{
  'update:value': [value: any]
  'validation': [result: { status: string; message?: string; valid: boolean }]
}>()

// 验证状态
const validationState = reactive({
  status: '', // 'valid', 'invalid', 'validating', 'pending'
  message: '',
  valid: true
})

// 验证中的Promise，用于取消过期的异步验证
let validationPromise: Promise<any> | null = null

// 计算验证样式类
const validationClass = computed(() => {
  if (!validationState.status) return ''
  return `validation-${validationState.status}`
})

// 验证规则
const validateField = async (value: any, trigger: string = 'change') => {
  if (!field.rules || field.rules.length === 0) {
    return { valid: true, status: '', message: '' }
  }

  // 重置状态
  validationState.status = 'validating'
  validationState.message = '验证中...'
  validationState.valid = false

  try {
    for (const rule of field.rules) {
      const result = await validateRule(rule, value)
      if (result !== true) {
        validationState.status = 'invalid'
        validationState.message = result
        validationState.valid = false
        return { valid: false, status: 'invalid', message: result }
      }
    }

    validationState.status = 'valid'
    validationState.message = ''
    validationState.valid = true
    return { valid: true, status: 'valid', message: '' }
  } catch (error) {
    validationState.status = 'invalid'
    validationState.message = '验证出错'
    validationState.valid = false
    return { valid: false, status: 'invalid', message: '验证出错' }
  }
}

// 验证单个规则
const validateRule = async (rule: any, value: any): Promise<string | true> => {
  switch (rule.type) {
    case 'required':
      if (value === null || value === undefined || value === '' || 
          (Array.isArray(value) && value.length === 0)) {
        return rule.message || '此字段为必填项'
      }
      return true

    case 'minLength':
      if (value && value.length < rule.value) {
        return rule.message || `最少需要${rule.value}个字符`
      }
      return true

    case 'maxLength':
      if (value && value.length > rule.value) {
        return rule.message || `最多允许${rule.value}个字符`
      }
      return true

    case 'min':
      if (value !== null && value !== undefined && Number(value) < rule.value) {
        return rule.message || `值不能小于${rule.value}`
      }
      return true

    case 'max':
      if (value !== null && value !== undefined && Number(value) > rule.value) {
        return rule.message || `值不能大于${rule.value}`
      }
      return true

    case 'pattern':
      if (value && !rule.value.test(value)) {
        return rule.message || '格式不正确'
      }
      return true

    case 'email':
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return rule.message || '请输入有效的邮箱地址'
      }
      return true

    case 'phone':
      if (value && !/^1[3-9]\d{9}$/.test(value)) {
        return rule.message || '请输入有效的手机号码'
      }
      return true

    case 'custom':
      if (rule.validator) {
        return await rule.validator(value, rule, props.field)
      }
      return true

    case 'async':
      if (rule.validator) {
        // 设置加载状态
        validationState.message = rule.message || '验证中...'
        
        // 创建新的验证Promise
        const currentPromise = rule.validator(value)
        validationPromise = currentPromise
        
        try {
          const result = await currentPromise
          
          // 检查是否是最新的验证请求
          if (validationPromise === currentPromise) {
            return result
          } else {
            // 如果不是最新的请求，忽略结果
            return true
          }
        } catch (error) {
          if (validationPromise === currentPromise) {
            return '验证失败，请重试'
          }
          return true
        }
      }
      return true

    default:
      return true
  }
}

// 处理值变化
const handleValueChange = (newValue: any) => {
  emit('update:value', newValue)
  
  if (props.realTime) {
    nextTick(() => {
      validateAndEmit(newValue, 'input')
    })
  }
}

// 处理变化事件
const handleChange = (newValue: any) => {
  validateAndEmit(newValue, 'change')
}

// 处理失焦事件
const handleBlur = () => {
  validateAndEmit(props.value, 'blur')
}

// 验证并发送事件
const validateAndEmit = async (value: any, trigger: string) => {
  const result = await validateField(value, trigger)
  emit('validation', result)
}

// 获取字段引用
const { field } = props

// 监听值变化（用于密码确认等场景）
watch(() => props.value, (newValue) => {
  if (props.realTime && validationState.status) {
    nextTick(() => {
      validateAndEmit(newValue, 'watch')
    })
  }
})
</script>

<style scoped>
.validation-field {
  margin-bottom: 20px;
  position: relative;
}

.field-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.field-label.required::after {
  content: ' *';
  color: #ff4d4f;
}

.status-indicator {
  font-size: 12px;
  margin-left: 8px;
}

.field-input-wrapper {
  position: relative;
}

.field-status {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.status-icon {
  font-size: 16px;
}

.status-icon.validating .spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.validation-message {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.4;
  min-height: 16px;
}

.validation-message.valid {
  color: #52c41a;
}

.validation-message.invalid {
  color: #ff4d4f;
}

.validation-message.validating {
  color: #1890ff;
}

.field-help {
  margin-top: 4px;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

/* 验证状态样式 */
.validation-valid :deep(.field-input),
.validation-valid :deep(.field-textarea),
.validation-valid :deep(.field-select) {
  border-color: #52c41a;
}

.validation-invalid :deep(.field-input),
.validation-invalid :deep(.field-textarea),
.validation-invalid :deep(.field-select) {
  border-color: #ff4d4f;
}

.validation-validating :deep(.field-input),
.validation-validating :deep(.field-textarea),
.validation-validating :deep(.field-select) {
  border-color: #1890ff;
}
</style>
