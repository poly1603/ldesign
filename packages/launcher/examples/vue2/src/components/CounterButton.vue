<template>
  <div class="counter-container">
    <h3 class="counter-title">交互式计数器</h3>
    <div class="counter-display">
      <span class="counter-value">{{ count }}</span>
      <span class="counter-label">次点击</span>
    </div>
    <div class="counter-buttons">
      <button 
        @click="decrement" 
        :disabled="count <= 0"
        class="counter-btn counter-btn--danger"
      >
        ➖ 减少
      </button>
      <button @click="increment" class="counter-btn counter-btn--primary">
        ➕ 增加
      </button>
      <button @click="reset" class="counter-btn counter-btn--secondary">
        🔄 重置
      </button>
    </div>
    <p class="counter-desc">
      这是一个使用 Vue 2 Composition API 构建的响应式计数器组件
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api';

export default defineComponent({
  name: 'CounterButton',
  setup() {
    const count = ref(0);

    const increment = () => {
      count.value++;
    };

    const decrement = () => {
      if (count.value > 0) {
        count.value--;
      }
    };

    const reset = () => {
      count.value = 0;
    };

    return {
      count,
      increment,
      decrement,
      reset,
    };
  },
});
</script>

<style lang="scss" scoped>
.counter-container {
  background: var(--card-background);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px -1px var(--shadow-color);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px -5px var(--shadow-color);
  }
}

.counter-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
}

.counter-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--background-color);
  border-radius: 8px;
  border: 2px solid var(--primary-color);
}

.counter-value {
  font-size: 3rem;
  font-weight: 800;
  color: var(--primary-color);
  line-height: 1;
  margin-bottom: 0.25rem;
}

.counter-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.counter-buttons {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.counter-btn {
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--primary {
    background: var(--primary-color);
    color: white;

    &:hover:not(:disabled) {
      background: var(--primary-color-hover);
    }
  }

  &--danger {
    background: var(--danger-color);
    color: white;

    &:hover:not(:disabled) {
      background: var(--danger-color-hover);
    }
  }

  &--secondary {
    background: var(--secondary-color);
    color: white;

    &:hover:not(:disabled) {
      background: var(--secondary-color-hover);
    }
  }

  @media (max-width: 480px) {
    min-width: 80px;
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
}

.counter-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}
</style>
