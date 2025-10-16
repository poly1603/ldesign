<template>
  <div class="image-captcha-wrapper">
    <BaseInput
      v-model="inputValue"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :error-message="errorMessage"
      prefix-icon="icon-shield"
      @update:model-value="handleInput"
      @enter="$emit('enter')"
    />
    <div class="captcha-image-container" @click="refreshCaptcha">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        alt="验证码"
        class="captcha-image"
        :class="{ loading: isLoading }"
      />
      <div v-else class="captcha-placeholder">
        <span>点击获取验证码</span>
      </div>
      <div v-if="isLoading" class="captcha-loading">
        <span class="loading-spinner"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BaseInput from './BaseInput.vue'

interface Props {
  modelValue: string
  imageUrl?: string
  placeholder?: string
  maxlength?: number
  errorMessage?: string
  autoLoad?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请输入验证码',
  maxlength: 4,
  autoLoad: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'refresh': []
  'enter': []
}>()

const inputValue = ref(props.modelValue)
const isLoading = ref(false)

const handleInput = (value: string) => {
  inputValue.value = value
  emit('update:modelValue', value)
}

const refreshCaptcha = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  emit('refresh')
  
  // 模拟加载延迟
  setTimeout(() => {
    isLoading.value = false
  }, 500)
}

onMounted(() => {
  if (props.autoLoad && !props.imageUrl) {
    refreshCaptcha()
  }
})
</script>

<style scoped>
.image-captcha-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
}

.image-captcha-wrapper :deep(.base-input-wrapper) {
  flex: 1;
  margin-bottom: 0;
}

.captcha-image-container {
  position: relative;
  width: 120px;
  height: 44px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background-color: #f5f5f7;
  transition: all 0.3s;
}

.captcha-image-container:hover {
  opacity: 0.8;
}

.captcha-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s;
}

.captcha-image.loading {
  opacity: 0.5;
}

.captcha-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #999;
  font-size: 12px;
  text-align: center;
}

.captcha-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #1677ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 图标样式 */
:deep(.icon-shield)::before {
  content: '🛡';
}
</style>