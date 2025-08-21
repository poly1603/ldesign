<!--
  语言切换按钮组件

  简单的语言切换按钮，支持：
  - 快速切换到指定语言
  - 显示当前语言状态
  - 自定义样式和图标
  - 加载状态显示
-->

<script setup lang="ts">
import { computed } from 'vue'
import { useLanguageSwitcher } from '../composables'

interface Props {
  /** 目标语言代码 */
  targetLanguage: string
  /** 显示名称（如果不提供则自动获取） */
  displayName?: string
  /** 是否显示国旗 */
  showFlag?: boolean
  /** 是否显示语言名称 */
  showName?: boolean
  /** 是否显示语言代码 */
  showCode?: boolean
  /** 是否显示当前语言标记 */
  showCheck?: boolean
  /** 按钮变体 */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  /** 按钮大小 */
  size?: 'small' | 'medium' | 'large'
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义CSS类 */
  class?: string | string[] | Record<string, boolean>
}

const props = withDefaults(defineProps<Props>(), {
  showFlag: true,
  showName: true,
  showCode: false,
  showCheck: true,
  variant: 'secondary',
  size: 'medium',
  disabled: false,
})

const emit = defineEmits<{
  click: [targetLanguage: string]
  languageChanged: [newLanguage: string, oldLanguage: string]
}>()

// 使用语言切换器
const { locale, availableLanguages, switchLanguage, isChanging } = useLanguageSwitcher()

// 是否是当前语言
const isCurrentLanguage = computed(() => {
  return locale.value === props.targetLanguage
})

// 语言信息
const languageInfo = computed(() => {
  const languages = availableLanguages.value as any[]
  return languages.find(lang => lang.code === props.targetLanguage) || {
    code: props.targetLanguage,
    name: props.targetLanguage,
    nativeName: props.targetLanguage,
  }
})

// 显示名称
const displayName = computed(() => {
  return props.displayName || languageInfo.value.nativeName || languageInfo.value.name || props.targetLanguage
})

// 语言国旗
const languageFlag = computed(() => {
  return getLanguageFlag(props.targetLanguage)
})

// 按钮CSS类
const buttonClasses = computed(() => {
  const classes = [
    'language-button',
    `language-button--${props.variant}`,
    `language-button--${props.size}`,
  ]

  if (isCurrentLanguage.value) {
    classes.push('is-current')
  }

  if (isChanging.value) {
    classes.push('is-loading')
  }

  if (props.disabled) {
    classes.push('is-disabled')
  }

  if (props.class) {
    if (typeof props.class === 'string') {
      classes.push(props.class)
    }
    else if (Array.isArray(props.class)) {
      classes.push(...props.class)
    }
    else {
      Object.entries(props.class).forEach(([key, value]) => {
        if (value) {
          classes.push(key)
        }
      })
    }
  }

  return classes
})

// ARIA标签
const ariaLabel = computed(() => {
  if (isCurrentLanguage.value) {
    return `当前语言: ${displayName.value}`
  }
  return `切换到 ${displayName.value}`
})

// 工具提示
const tooltip = computed(() => {
  if (isCurrentLanguage.value) {
    return `当前语言: ${displayName.value} (${props.targetLanguage})`
  }
  return `点击切换到 ${displayName.value} (${props.targetLanguage})`
})

// 获取语言国旗
function getLanguageFlag(code: string): string {
  const flagMap: Record<string, string> = {
    'zh-CN': '🇨🇳',
    'zh-TW': '🇹🇼',
    'en': '🇺🇸',
    'en-US': '🇺🇸',
    'en-GB': '🇬🇧',
    'ja': '🇯🇵',
    'ko': '🇰🇷',
    'fr': '🇫🇷',
    'de': '🇩🇪',
    'es': '🇪🇸',
    'it': '🇮🇹',
    'pt': '🇵🇹',
    'ru': '🇷🇺',
    'ar': '🇸🇦',
    'hi': '🇮🇳',
    'th': '🇹🇭',
    'vi': '🇻🇳',
  }
  return flagMap[code] || '🌐'
}

// 处理点击事件
async function handleClick() {
  if (props.disabled || isChanging.value || isCurrentLanguage.value) {
    return
  }

  const oldLanguage = locale.value

  try {
    emit('click', props.targetLanguage)
    await switchLanguage(props.targetLanguage)
    emit('languageChanged', props.targetLanguage, oldLanguage)
  }
  catch (error) {
    console.error('语言切换失败:', error)
  }
}
</script>

<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || isChanging || isCurrentLanguage"
    :aria-label="ariaLabel"
    :title="tooltip"
    @click="handleClick"
  >
    <span v-if="showFlag" class="language-flag">{{ languageFlag }}</span>
    <span v-if="showName" class="language-name">{{ displayName }}</span>
    <span v-if="showCode" class="language-code">{{ targetLanguage }}</span>

    <span v-if="isChanging" class="loading-indicator">
      <svg class="spinner" width="16" height="16" viewBox="0 0 16 16">
        <circle
          cx="8" cy="8" r="6"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
          stroke-dasharray="37.7"
          stroke-dashoffset="37.7"
        >
          <animate
            attributeName="stroke-dashoffset"
            dur="1s"
            values="37.7;0"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </span>

    <span v-if="isCurrentLanguage && showCheck" class="current-indicator">✓</span>
  </button>
</template>

<style scoped>
/* 基础样式 */
.language-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid transparent;
  border-radius: 6px;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.language-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.language-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* 大小变体 */
.language-button--small {
  padding: 4px 8px;
  font-size: 12px;
  min-height: 28px;
}

.language-button--medium {
  padding: 6px 12px;
  font-size: 14px;
  min-height: 36px;
}

.language-button--large {
  padding: 8px 16px;
  font-size: 16px;
  min-height: 44px;
}

/* 样式变体 */
.language-button--primary {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.language-button--primary:hover:not(:disabled) {
  background: #2563eb;
  border-color: #2563eb;
}

.language-button--secondary {
  background: #f3f4f6;
  border-color: #d1d5db;
  color: #374151;
}

.language-button--secondary:hover:not(:disabled) {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.language-button--outline {
  background: transparent;
  border-color: #d1d5db;
  color: #374151;
}

.language-button--outline:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.language-button--ghost {
  background: transparent;
  border-color: transparent;
  color: #374151;
}

.language-button--ghost:hover:not(:disabled) {
  background: #f3f4f6;
}

/* 状态样式 */
.language-button.is-current {
  background: #dcfce7;
  border-color: #16a34a;
  color: #15803d;
}

.language-button.is-current:hover:not(:disabled) {
  background: #bbf7d0;
}

.language-button.is-loading {
  pointer-events: none;
}

/* 元素样式 */
.language-flag {
  font-size: 1.2em;
  line-height: 1;
}

.language-name {
  white-space: nowrap;
}

.language-code {
  font-size: 0.85em;
  opacity: 0.7;
}

.loading-indicator {
  display: flex;
  align-items: center;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.current-indicator {
  color: #16a34a;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .language-button--large {
    padding: 6px 12px;
    font-size: 14px;
    min-height: 36px;
  }

  .language-button--medium {
    padding: 4px 8px;
    font-size: 12px;
    min-height: 28px;
  }
}
</style>
