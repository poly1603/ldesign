<template>
  <div class="environment-selector">
    <div class="selector-label">
      <Settings2 :size="16" />
      <span>运行环境</span>
    </div>
    <div class="selector-options">
      <button
        v-for="env in environments"
        :key="env.key"
        class="env-option"
        :class="{ active: modelValue === env.key }"
        @click="selectEnvironment(env.key)"
        :title="env.description"
      >
        <component :is="env.icon" :size="16" />
        <span>{{ env.name }}</span>
        <Check v-if="modelValue === env.key" :size="14" class="check-icon" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Settings2, Check, Code, Package, TestTube, Rocket } from 'lucide-vue-next'

/**
 * 环境选择器组件
 * 用于选择项目运行环境（开发、生产、测试、预发布）
 */

// 定义 props
interface Props {
  modelValue: string
}

// 定义 emits
interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 环境配置
const environments = [
  {
    key: 'development',
    name: '开发',
    description: '本地开发环境配置',
    icon: Code
  },
  {
    key: 'production',
    name: '生产',
    description: '生产环境配置',
    icon: Rocket
  },
  {
    key: 'test',
    name: '测试',
    description: '测试环境配置',
    icon: TestTube
  },
  {
    key: 'staging',
    name: '预发布',
    description: '预发布环境配置',
    icon: Package
  }
]

// 选择环境
const selectEnvironment = (key: string) => {
  emit('update:modelValue', key)
}
</script>

<style lang="less" scoped>
.environment-selector {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-sm);

  .selector-label {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-xs);
    font-size: var(--ls-font-size-sm);
    font-weight: 500;
    color: var(--ldesign-text-color-secondary);
  }

  .selector-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: var(--ls-spacing-sm);
  }

  .env-option {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--ls-spacing-xs);
    padding: var(--ls-padding-base);
    background: var(--ldesign-bg-color-component);
    border: 2px solid var(--ldesign-border-color);
    border-radius: var(--ls-border-radius-lg);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: var(--ls-font-size-sm);
    color: var(--ldesign-text-color-secondary);

    svg {
      color: var(--ldesign-text-color-placeholder);
      transition: all 0.2s ease;
    }

    &:hover {
      background: var(--ldesign-bg-color-component-hover);
      border-color: var(--ldesign-brand-color-hover);
      transform: translateY(-2px);
      box-shadow: var(--ldesign-shadow-2);

      svg {
        color: var(--ldesign-brand-color);
      }
    }

    &.active {
      background: var(--ldesign-brand-color-focus);
      border-color: var(--ldesign-brand-color);
      color: var(--ldesign-brand-color);

      svg {
        color: var(--ldesign-brand-color);
      }

      .check-icon {
        position: absolute;
        top: 6px;
        right: 6px;
        color: var(--ldesign-brand-color);
      }
    }

    span {
      font-weight: 500;
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .environment-selector {
    .selector-options {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}
</style>

