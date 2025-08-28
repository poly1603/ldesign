<template>
  <div class="not-found">
    <div class="error-content">
      <h1>404</h1>
      <h2>{{ $t('notFound.title') }}</h2>
      <p>{{ $t('notFound.message') }}</p>

      <div class="actions">
        <button
          class="btn-primary"
          @click="goHome"
        >
          {{ $t('notFound.goHome') }}
        </button>
        <button
          class="btn-secondary"
          @click="goBack"
        >
          {{ $t('notFound.goBack') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const goHome = () => {
  window.location.href = '/'
}

const goBack = () => {
  window.history.back()
}
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  background: var(--color-background, #f8fafc);
  padding: var(--size-4xl, 2rem);
  font-size: var(--size-base, 1rem);
  color: var(--color-text, #1a202c);
  transition: all 0.3s ease;
}

.error-content {
  background: var(--color-surface, white);
  padding: var(--size-6xl, 3rem);
  border-radius: var(--size-lg, 12px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-border, #e2e8f0);
  max-width: 500px;
  width: 100%;
}

.error-content h1 {
  font-size: var(--size-8xl, 6rem);
  margin: 0;
  color: var(--color-error, #dc2626);
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(220, 38, 38, 0.1);
}

.error-content h2 {
  font-size: var(--size-3xl, 2rem);
  margin: var(--size-lg, 1rem) 0;
  color: var(--color-text, #1a202c);
  font-weight: 600;
}

.error-content p {
  font-size: var(--size-lg, 1.1rem);
  color: var(--color-text-secondary, #4a5568);
  margin-bottom: var(--size-4xl, 2rem);
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: var(--size-lg, 1rem);
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
  padding: var(--size-sm, 0.75rem) var(--size-2xl, 1.5rem);
  border: none;
  border-radius: var(--size-sm, 4px);
  cursor: pointer;
  font-size: var(--size-base, 1rem);
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 120px;
}

.btn-primary {
  background: var(--color-primary, #3b82f6);
  color: white;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
  background: var(--color-primary-dark, #2563eb);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: var(--color-muted, #f7fafc);
  color: var(--color-text-secondary, #4a5568);
  border: 1px solid var(--color-border, #e2e8f0);
}

.btn-secondary:hover {
  background: var(--color-surface, white);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .not-found {
    padding: var(--size-lg, 1rem);
  }

  .error-content {
    padding: var(--size-4xl, 2rem);
  }

  .error-content h1 {
    font-size: var(--size-6xl, 4rem);
  }

  .error-content h2 {
    font-size: var(--size-2xl, 1.5rem);
  }

  .error-content p {
    font-size: var(--size-base, 1rem);
    margin-bottom: var(--size-2xl, 1.5rem);
  }

  .actions {
    flex-direction: column;
    gap: var(--size-sm, 0.5rem);
  }

  .btn-primary, .btn-secondary {
    width: 100%;
    padding: var(--size-sm, 0.75rem) var(--size-lg, 1rem);
  }
}
</style>
