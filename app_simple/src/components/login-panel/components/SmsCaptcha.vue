<template>
  <div class="sms-captcha-wrapper">
    <BaseInput v-model="inputValue" :placeholder="placeholder" :maxlength="6" :error-message="errorMessage"
      prefix-icon="icon-message" @update:model-value="handleInput" @enter="$emit('enter')" />
    <button :disabled="isSending || countdown > 0" @click="sendSmsCode" class="sms-button"
      :class="{ disabled: isSending || countdown > 0 }">
      {{ buttonText }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import BaseInput from './BaseInput.vue'

interface Props {
  modelValue: string
  phone: string
  placeholder?: string
  errorMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请输入短信验证码'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'send': [phone: string]
  'enter': []
}>()

const inputValue = ref(props.modelValue)
const isSending = ref(false)
const countdown = ref(0)
let countdownTimer: NodeJS.Timeout | null = null

const buttonText = computed(() => {
  if (countdown.value > 0) {
    return `${countdown.value}秒后重发`
  }
  return isSending.value ? '发送中...' : '获取验证码'
})

const handleInput = (value: string) => {
  inputValue.value = value
  emit('update:modelValue', value)
}

const sendSmsCode = async () => {
  if (!props.phone) {
    return
  }

  if (isSending.value || countdown.value > 0) {
    return
  }

  isSending.value = true

  try {
    emit('send', props.phone)

    // 模拟发送成功后开始倒计时
    setTimeout(() => {
      isSending.value = false
      startCountdown()
    }, 1000)
  } catch (error) {
    isSending.value = false
  }
}

const startCountdown = () => {
  countdown.value = 60

  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      if (countdownTimer) {
        clearInterval(countdownTimer)
        countdownTimer = null
      }
    }
  }, 1000)
}

onBeforeUnmount(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style scoped>
.sms-captcha-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
}

.sms-captcha-wrapper :deep(.base-input-wrapper) {
  flex: 1;
  margin-bottom: 0;
  overflow: hidden;
}

.sms-button {
  min-width: 120px;
  height: 44px;
  padding: 0 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.sms-button:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.sms-button:active:not(.disabled) {
  transform: translateY(0);
}

.sms-button.disabled {
  background: #d9d9d9;
  color: #999;
  cursor: not-allowed;
}

/* 图标样式 */
:deep(.icon-message)::before {
  content: '📱';
}
</style>