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
import { useI18n } from '../../i18n'

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
  background: linear-gradient(135deg, var(--color-primary-400) 0%, var(--color-primary-600) 100%);
}

.error-content {
  text-align: center;
  padding: 40px;
  background: var(--color-background);
  border-radius: 16px;
  box-shadow: 0 20px 60px var(--color-gray-300);
  max-width: 500px;
  width: 90%;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  margin: 0;
  background: linear-gradient(135deg, var(--color-primary-default) 0%, var(--color-primary-active) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
}

.error-title {
  font-size: 28px;
  color: var(--color-text-primary);
  margin: 20px 0;
}

.error-message {
  font-size: 16px;
  color: var(--color-text-secondary);
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
  background: linear-gradient(135deg, var(--color-primary-default) 0%, var(--color-primary-active) 100%);
  color: var(--color-gray-50);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px var(--color-primary-300);
}

.btn-secondary {
  background: var(--color-gray-100);
  color: var(--color-text-primary);
}

.btn-secondary:hover {
  background: var(--color-gray-200);
}
</style>