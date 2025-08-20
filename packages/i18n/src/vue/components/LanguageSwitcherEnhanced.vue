<!--
  增强的语言切换器组件

  功能特性：
  - 多种显示模式（下拉菜单、按钮组、选择框）
  - 自定义样式和主题
  - 加载状态和错误处理
  - 键盘导航支持
  - 无障碍访问
  - 动画效果
-->

<template>
  <div
    class="language-switcher"
    :class="switcherClasses"
    :data-variant="variant"
    :data-size="size"
  >
    <!-- 下拉菜单模式 -->
    <div v-if="variant === 'dropdown'" class="dropdown-container">
      <button

        class="dropdown-trigger"
        :class="{ 'is-open': isOpen, 'is-loading': isChanging }"
        :disabled="disabled || isChanging"
        :aria-expanded="isOpen"
        :aria-haspopup="true"
        :aria-label="t('common.selectLanguage', {}, { defaultValue: 'Select Language' })"
        @click="toggleDropdown"
        @keydown="handleTriggerKeydown"
      >
        <span class="trigger-content">
          <span v-if="showFlag" class="language-flag">{{ currentLanguageFlag }}</span>
          <span class="language-name">{{ currentLanguageDisplay }}</span>
          <span v-if="showCode" class="language-code">({{ locale }})</span>
        </span>

        <span class="dropdown-icon" :class="{ 'is-rotated': isOpen }">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 8L2 4h8L6 8z" />
          </svg>
        </span>

        <span v-if="isChanging" class="loading-indicator">
          <svg class="spinner" width="16" height="16" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="37.7" stroke-dashoffset="37.7">
              <animate attributeName="stroke-dashoffset" dur="1s" values="37.7;0" repeatCount="indefinite" />
            </circle>
          </svg>
        </span>
      </button>

      <Transition name="dropdown">
        <div
          v-if="isOpen"

          class="dropdown-menu"
          role="listbox"
          :aria-label="t('common.availableLanguages', {}, { defaultValue: 'Available Languages' })"
        >
          <button
            v-for="(lang, index) in availableLanguages"
            :key="lang.code"
            class="dropdown-option"
            :class="{ 'is-active': lang.code === locale }"
            role="option"
            :aria-selected="lang.code === locale"
            :data-index="index"
            @click="handleLanguageSelect(lang.code)"
            @keydown="handleOptionKeydown"
          >
            <span v-if="showFlag" class="option-flag">{{ getLanguageFlag(lang.code) }}</span>
            <span class="option-content">
              <span class="option-name">{{ getLanguageDisplay(lang) }}</span>
              <span v-if="showCode" class="option-code">{{ lang.code }}</span>
            </span>
            <span v-if="lang.code === locale" class="check-icon">✓</span>
          </button>
        </div>
      </Transition>
    </div>

    <!-- 按钮组模式 -->
    <div v-else-if="variant === 'buttons'" class="button-group">
      <button
        v-for="lang in availableLanguages"
        :key="lang.code"
        class="language-button"
        :class="{ 'is-active': lang.code === locale }"
        :disabled="disabled || isChanging"
        :aria-label="`${t('common.switchTo', {}, { defaultValue: 'Switch to' })} ${getLanguageDisplay(lang)}`"
        @click="handleLanguageSelect(lang.code)"
      >
        <span v-if="showFlag" class="button-flag">{{ getLanguageFlag(lang.code) }}</span>
        <span class="button-text">{{ getLanguageDisplay(lang) }}</span>
        <span v-if="showCode" class="button-code">{{ lang.code }}</span>
      </button>
    </div>

    <!-- 选择框模式 -->
    <select
      v-else-if="variant === 'select'"
      class="language-select"
      :value="locale"
      :disabled="disabled || isChanging"
      :aria-label="t('common.selectLanguage', {}, { defaultValue: 'Select Language' })"
      @change="handleSelectChange"
    >
      <option
        v-for="lang in availableLanguages"
        :key="lang.code"
        :value="lang.code"
      >
        {{ getLanguageDisplay(lang) }} {{ showCode ? `(${lang.code})` : '' }}
      </option>
    </select>

    <!-- 错误提示 */
    <Transition name="error">
      <div v-if="error" class="error-message">
        <span class="error-icon">⚠️</span>
        <span class="error-text">{{ error }}</span>
        <button class="error-dismiss" @click="clearError">×</button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n, useLanguageSwitcher } from '../composables'

/**
 * 组件属性
 */
interface Props {
  /** 显示变体 */
  variant?: 'dropdown' | 'buttons' | 'select'
  /** 尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 是否显示国旗 */
  showFlag?: boolean
  /** 是否显示语言代码 */
  showCode?: boolean
  /** 语言名称显示方式 */
  nameDisplay?: 'native' | 'english' | 'both'
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义主题 */
  theme?: 'light' | 'dark' | 'auto'
  /** 是否启用动画 */
  animated?: boolean
  /** 最大显示语言数量（超出时显示滚动） */
  maxVisible?: number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'dropdown',
  size: 'medium',
  showFlag: true,
  showCode: false,
  nameDisplay: 'native',
  disabled: false,
  theme: 'auto',
  animated: true,
  maxVisible: 10,
})

/**
 * 组件事件
 */
interface Emits {
  (e: 'change', locale: string): void
  (e: 'error', error: string): void
  (e: 'open'): void
  (e: 'close'): void
}

const emit = defineEmits<Emits>()

// 使用组合式API
const { t } = useI18n()
const { locale, availableLanguages, isChanging, switchLanguage } = useLanguageSwitcher()

// 组件状态
const isOpen = ref(false)
const error = ref<string>('')
const triggerRef = ref<HTMLElement>()
const dropdownRef = ref<HTMLElement>()
const focusedIndex = ref(-1)

// 计算属性
const switcherClasses = computed(() => ({
  [`language-switcher--${props.variant}`]: true,
  [`language-switcher--${props.size}`]: true,
  [`language-switcher--${props.theme}`]: true,
  'language-switcher--animated': props.animated,
  'language-switcher--disabled': props.disabled,
  'language-switcher--loading': isChanging.value,
}))

const currentLanguage = computed(() => {
  return availableLanguages.value.find(lang => lang.code === locale.value)
})

const currentLanguageDisplay = computed(() => {
  if (!currentLanguage.value) return locale.value
  return getLanguageDisplay(currentLanguage.value)
})

const currentLanguageFlag = computed(() => {
  return getLanguageFlag(locale.value)
})

// 方法
const getLanguageFlag = (code: string): string => {
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
  }
  return flagMap[code] || '🌐'
}

const getLanguageDisplay = (lang: any): string => {
  switch (props.nameDisplay) {
    case 'english':
      return lang.name || lang.code
    case 'both':
      return `${lang.nativeName || lang.name || lang.code} / ${lang.name || lang.code}`
    case 'native':
    default:
      return lang.nativeName || lang.name || lang.code
  }
}

const toggleDropdown = () => {
  if (props.disabled || isChanging.value) return

  isOpen.value = !isOpen.value

  if (isOpen.value) {
    emit('open')
    nextTick(() => {
      focusedIndex.value = availableLanguages.value.findIndex(lang => lang.code === locale.value)
    })
  }
  else {
    emit('close')
    focusedIndex.value = -1
  }
}

const closeDropdown = () => {
  isOpen.value = false
  focusedIndex.value = -1
  emit('close')
}

const handleLanguageSelect = async (languageCode: string) => {
  if (props.disabled || isChanging.value || languageCode === locale.value) return

  try {
    await switchLanguage(languageCode)
    closeDropdown()
    emit('change', languageCode)
  }
  catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to switch language'
    error.value = errorMessage
    emit('error', errorMessage)
  }
}

const handleSelectChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  handleLanguageSelect(target.value)
}

const clearError = () => {
  error.value = ''
}

// 键盘导航
const handleTriggerKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
    case 'ArrowDown':
      event.preventDefault()
      toggleDropdown()
      break
    case 'Escape':
      closeDropdown()
      break
  }
}

const handleOptionKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      const target = event.target as HTMLElement
      const index = parseInt(target.dataset.index || '0')
      handleLanguageSelect(availableLanguages.value[index].code)
      break
    case 'ArrowDown':
      event.preventDefault()
      focusedIndex.value = Math.min(focusedIndex.value + 1, availableLanguages.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      focusedIndex.value = Math.max(focusedIndex.value - 1, 0)
      break
    case 'Escape':
      closeDropdown()
      triggerRef.value?.focus()
      break
  }
}

// 点击外部关闭
const handleClickOutside = (event: Event) => {
  if (!triggerRef.value || !dropdownRef.value) return

  const target = event.target as Node
  if (!triggerRef.value.contains(target) && !dropdownRef.value.contains(target)) {
    closeDropdown()
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 监听语言变化
watch(locale, () => {
  closeDropdown()
})
</script>

<style scoped>
/* 基础样式 */
.language-switcher {
  position: relative;
  display: inline-block;
}

/* 下拉菜单样式 */
.dropdown-container {
  position: relative;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.dropdown-trigger:hover {
  border-color: #007acc;
  box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.1);
}

.dropdown-trigger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.trigger-content {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.dropdown-icon {
  transition: transform 0.2s ease;
}

.dropdown-icon.is-rotated {
  transform: rotate(180deg);
}

.loading-indicator {
  display: flex;
  align-items: center;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 4px;
}

.dropdown-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dropdown-option:hover {
  background: #f5f5f5;
}

.dropdown-option.is-active {
  background: #e3f2fd;
  color: #007acc;
}

.option-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.option-code {
  font-size: 0.8em;
  opacity: 0.7;
}

.check-icon {
  color: #007acc;
  font-weight: bold;
}

/* 按钮组样式 */
.button-group {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.language-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.language-button:hover {
  border-color: #007acc;
  background: #f8f9fa;
}

.language-button.is-active {
  background: #007acc;
  color: white;
  border-color: #007acc;
}

.language-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 选择框样式 */
.language-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  min-width: 150px;
}

.language-select:focus {
  outline: none;
  border-color: #007acc;
  box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.1);
}

/* 错误提示样式 */
.error-message {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #ffebee;
  border: 1px solid #f44336;
  border-radius: 4px;
  padding: 8px 12px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9em;
  z-index: 1001;
}

.error-text {
  flex: 1;
  color: #d32f2f;
}

.error-dismiss {
  background: none;
  border: none;
  color: #d32f2f;
  cursor: pointer;
  font-size: 1.2em;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 尺寸变体 */
.language-switcher--small .dropdown-trigger,
.language-switcher--small .language-button,
.language-switcher--small .language-select {
  padding: 4px 8px;
  font-size: 0.9em;
}

.language-switcher--large .dropdown-trigger,
.language-switcher--large .language-button,
.language-switcher--large .language-select {
  padding: 12px 16px;
  font-size: 1.1em;
}

/* 动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.error-enter-active,
.error-leave-active {
  transition: all 0.3s ease;
}

.error-enter-from,
.error-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* 暗色主题 */
.language-switcher--dark .dropdown-trigger,
.language-switcher--dark .language-button,
.language-switcher--dark .language-select {
  background: #2d2d2d;
  border-color: #555;
  color: white;
}

.language-switcher--dark .dropdown-menu {
  background: #2d2d2d;
  border-color: #555;
}

.language-switcher--dark .dropdown-option:hover {
  background: #404040;
}

.language-switcher--dark .dropdown-option.is-active {
  background: #1976d2;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .button-group {
    flex-direction: column;
  }

  .language-button {
    justify-content: center;
  }

  .dropdown-menu {
    left: -50%;
    right: -50%;
  }
}
</style>
