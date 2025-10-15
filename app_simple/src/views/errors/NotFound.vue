<template>
  <div class="error-page">
    <div class="error-content">
      <h1 class="error-code">404</h1>
      <h2 class="error-title">{{ t('errors.404.title') }}</h2>
      <p class="error-message">{{ t('errors.404.message') }}</p>
      <div class="error-actions">
        <button @click="goHome" class="btn btn-primary">
          {{ t('errors.404.action') }}
        </button>
        <button @click="goBack" class="btn btn-secondary">
          {{ t('errors.404.back') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from '@ldesign/router'
import { useI18n } from '@/i18n'

const router = useRouter()
const { t } = useI18n()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--ld-color-primary-400, #667eea) 0%, var(--ld-color-primary-600, #764ba2) 100%);
}

.error-content {
  text-align: center;
  padding: 40px;
  background: var(--ld-color-gray-50, white);
  border-radius: 16px;
  box-shadow: 0 20px 60px var(--ld-color-gray-300, rgba(0, 0, 0, 0.1));
  max-width: 500px;
  width: 90%;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  margin: 0;
  background: linear-gradient(135deg, var(--ld-color-primary-500) 0%, var(--ld-color-primary-700) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
}

.error-title {
  font-size: 28px;
  color: var(--ld-color-gray-800);
  margin: 20px 0;
}

.error-message {
  font-size: 16px;
  color: var(--ld-color-gray-600, #666);
  margin: 20px 0 30px;
}

.error-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.btn {
  padding: 12px 24px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.btn-primary {
  background: linear-gradient(135deg, var(--ld-color-primary-500) 0%, var(--ld-color-primary-700) 100%);
  color: var(--ld-color-gray-50, white);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px var(--ld-color-primary-300, rgba(102, 126, 234, 0.3));
}

.btn-secondary {
  background: var(--ld-color-gray-100);
  color: var(--ld-color-gray-800);
}

.btn-secondary:hover {
  background: var(--ld-color-gray-200);
}
</style>