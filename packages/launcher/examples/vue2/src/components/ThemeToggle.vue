<template>
  <div class="theme-toggle">
    <label class="toggle-switch">
      <input 
        type="checkbox" 
        :checked="isDark" 
        @change="toggleTheme"
        aria-label="切换主题"
      >
      <span class="slider">
        <span class="slider-icon">
          {{ isDark ? '🌙' : '☀️' }}
        </span>
      </span>
    </label>
    <span class="toggle-label">
      {{ isDark ? '深色' : '浅色' }}
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';

export default defineComponent({
  name: 'ThemeToggle',
  props: {
    isDark: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['toggle-theme'],
  setup(props, { emit }) {
    const toggleTheme = () => {
      emit('toggle-theme', !props.isDark);
    };

    return {
      toggleTheme,
    };
  },
});
</script>

<style lang="scss" scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  user-select: none;
}

.toggle-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  min-width: 2.5rem;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 3.5rem;
  height: 2rem;
  cursor: pointer;

  input {
    opacity: 0;
    width: 0;
    height: 0;

    &:checked + .slider {
      background-color: var(--primary-color);

      &:before {
        transform: translateX(1.5rem);
      }
    }

    &:focus + .slider {
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
    }
  }
}

.slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-color);
  border-radius: 2rem;
  transition: all 0.3s ease;

  &:before {
    content: '';
    position: absolute;
    height: 1.5rem;
    width: 1.5rem;
    left: 0.25rem;
    bottom: 0.25rem;
    background-color: white;
    border-radius: 50%;
    transition: transform 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  &:hover {
    &:before {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }
  }
}

.slider-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  pointer-events: none;
  z-index: 2;
  transition: all 0.3s ease;
}

// 暗色模式下的特殊样式
:global(.dark-theme) .toggle-switch {
  .slider-icon {
    color: #fbbf24;
  }
}
</style>
