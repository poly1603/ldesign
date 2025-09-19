<template>
  <button
    :class="[
      'ld-theme-toggle',
      `ld-theme-toggle--${size}`,
      {
        'ld-theme-toggle--disabled': disabled
      }
    ]"
    :disabled="disabled"
    :title="toggleTitle"
    @click="handleToggle"
  >
    <component
      :is="currentIcon"
      :class="['ld-theme-toggle__icon']"
    />
    <span v-if="showLabel" class="ld-theme-toggle__label">
      {{ currentLabel }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { getThemeManager, type ThemeType, type ThemeChangeListener } from '../../utils/theme'

/**
 * 主题切换组件属性
 */
export interface ThemeToggleProps {
  /** 组件尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 是否禁用 */
  disabled?: boolean
  /** 是否显示文字标签 */
  showLabel?: boolean
  /** 自定义图标映射 */
  icons?: Partial<Record<Exclude<ThemeType, 'auto'>, any>>
  /** 自定义标签映射 */
  labels?: Partial<Record<Exclude<ThemeType, 'auto'>, string>>
}

/**
 * 主题切换组件事件
 */
export interface ThemeToggleEmits {
  /** 主题变更事件 */
  (e: 'change', theme: ThemeType): void
}

// 组件属性
const props = withDefaults(defineProps<ThemeToggleProps>(), {
  size: 'medium',
  disabled: false,
  showLabel: false,
  icons: () => ({}),
  labels: () => ({})
})

// 组件事件
const emit = defineEmits<ThemeToggleEmits>()

// 当前主题
const currentTheme = ref<Exclude<ThemeType, 'auto'>>('light')

// 主题管理器
const themeManager = getThemeManager()

// 默认图标映射（这里使用字符串，实际项目中应该使用图标组件）
const defaultIcons = {
  light: '☀️',
  dark: '🌙',
  'high-contrast': '🔆'
}

// 默认标签映射
const defaultLabels = {
  light: '亮色主题',
  dark: '暗色主题',
  'high-contrast': '高对比度'
}

// 当前图标
const currentIcon = computed(() => {
  return props.icons[currentTheme.value] || defaultIcons[currentTheme.value]
})

// 当前标签
const currentLabel = computed(() => {
  return props.labels[currentTheme.value] || defaultLabels[currentTheme.value]
})

// 切换提示文本
const toggleTitle = computed(() => {
  const nextTheme = getNextTheme()
  const nextLabel = props.labels[nextTheme] || defaultLabels[nextTheme]
  return `切换到${nextLabel}`
})

/**
 * 获取下一个主题
 */
function getNextTheme(): Exclude<ThemeType, 'auto'> {
  switch (currentTheme.value) {
    case 'light':
      return 'dark'
    case 'dark':
      return 'high-contrast'
    case 'high-contrast':
      return 'light'
    default:
      return 'light'
  }
}

/**
 * 处理主题切换
 */
function handleToggle(): void {
  if (props.disabled) return

  const nextTheme = getNextTheme()
  themeManager.setTheme(nextTheme)
  emit('change', nextTheme)
}

/**
 * 主题变更监听器
 */
const themeChangeListener: ThemeChangeListener = (event) => {
  currentTheme.value = themeManager.getResolvedTheme()
}

// 组件挂载
onMounted(() => {
  currentTheme.value = themeManager.getResolvedTheme()
  themeManager.addListener(themeChangeListener)
})

// 组件卸载
onUnmounted(() => {
  themeManager.removeListener(themeChangeListener)
})
</script>

<script lang="ts">
export default {
  name: 'LdThemeToggle'
}
</script>

<style lang="less">
@import '../../styles/variables.less';

.ld-theme-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--ldesign-spacing-xs);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ldesign-border-radius-full);
  background: var(--ldesign-bg-color-component);
  color: var(--ldesign-text-color-primary);
  font-family: var(--ldesign-font-family);
  cursor: pointer;
  transition: all var(--ldesign-transition-base);
  outline: none;
  user-select: none;

  &:hover:not(&--disabled) {
    background: var(--ldesign-bg-color-component-hover);
    border-color: var(--ldesign-border-color-hover);
    transform: translateY(-1px);
  }

  &:active:not(&--disabled) {
    background: var(--ldesign-bg-color-component-active);
    transform: translateY(0);
  }

  &:focus:not(&--disabled) {
    outline: 2px solid var(--ldesign-brand-color-focus);
    outline-offset: 2px;
  }

  // 尺寸变体
  &--small {
    width: 32px;
    height: 32px;
    padding: var(--ldesign-spacing-xs);
    font-size: var(--ldesign-font-size-xs);

    .ld-theme-toggle__icon {
      font-size: 14px;
    }

    &.ld-theme-toggle--with-label {
      width: auto;
      padding: var(--ldesign-spacing-xs) var(--ldesign-spacing-sm);
    }
  }

  &--medium {
    width: 40px;
    height: 40px;
    padding: var(--ldesign-spacing-sm);
    font-size: var(--ldesign-font-size-sm);

    .ld-theme-toggle__icon {
      font-size: 16px;
    }

    &.ld-theme-toggle--with-label {
      width: auto;
      padding: var(--ldesign-spacing-sm) var(--ldesign-spacing-base);
    }
  }

  &--large {
    width: 48px;
    height: 48px;
    padding: var(--ldesign-spacing-base);
    font-size: var(--ldesign-font-size-base);

    .ld-theme-toggle__icon {
      font-size: 18px;
    }

    &.ld-theme-toggle--with-label {
      width: auto;
      padding: var(--ldesign-spacing-base) var(--ldesign-spacing-lg);
    }
  }

  // 禁用状态
  &--disabled {
    cursor: not-allowed;
    opacity: 0.6;

    &:hover {
      background: var(--ldesign-bg-color-component);
      border-color: var(--ldesign-border-color);
      transform: none;
    }
  }

  // 图标
  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform var(--ldesign-transition-base);

    .ld-theme-toggle:hover:not(.ld-theme-toggle--disabled) & {
      transform: rotate(15deg);
    }
  }

  // 标签
  &__label {
    font-weight: var(--ldesign-font-weight-medium);
    white-space: nowrap;
  }

  // 带标签的样式调整
  &--with-label {
    border-radius: var(--ldesign-border-radius-base);
  }
}

// 主题过渡动画
.theme-transition .ld-theme-toggle {
  transition: 
    background-color var(--ldesign-transition-base),
    border-color var(--ldesign-transition-base),
    color var(--ldesign-transition-base);
}

// 暗色主题下的特殊样式
[data-theme="dark"] .ld-theme-toggle {
  &:hover:not(&--disabled) {
    box-shadow: var(--ldesign-shadow-1);
  }
}

// 高对比度主题下的特殊样式
[data-theme="high-contrast"] .ld-theme-toggle {
  border-width: 2px;
  
  &:focus:not(&--disabled) {
    outline-width: 3px;
  }
}
</style>
