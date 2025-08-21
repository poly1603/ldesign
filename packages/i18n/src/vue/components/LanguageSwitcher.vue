<!--
  语言切换器组件

  提供语言切换功能，支持两种UI模式：
  - dropdown: 下拉菜单模式（默认）
  - dialog: 对话框模式
-->

<template>
  <div 
    :class="[
      'language-switcher',
      `language-switcher--${mode}`,
      { 'is-disabled': disabled || isChanging }
    ]"
    @keydown="handleKeydown"
  >
    <!-- 触发按钮 -->
    <button
      class="language-switcher__trigger"
      :class="{ 'is-open': isOpen, 'is-loading': isChanging }"
      :disabled="disabled || isChanging"
      :aria-expanded="isOpen"
      :aria-haspopup="true"
      :aria-label="triggerLabel"
      @click="toggle"
    >
      <span class="trigger-content">
        <span v-if="showFlag" class="language-flag">{{ currentLanguageFlag }}</span>
        <span class="language-name">{{ currentLanguageDisplay }}</span>
        <span v-if="showCode" class="language-code">({{ locale }})</span>
      </span>
      
      <span class="trigger-icon" :class="{ 'is-open': isOpen }">
        <template v-if="mode === 'dialog'">⚙️</template>
        <template v-else>▼</template>
      </span>
      
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
    </button>

    <!-- 下拉菜单模式 -->
    <Transition name="dropdown" v-if="mode === 'dropdown'">
      <div 
        v-if="isOpen" 
        class="language-switcher__dropdown"
        @click.stop
      >
        <button
          v-for="option in languageOptions"
          :key="option.code"
          class="language-option"
          :class="{ 'is-active': option.code === locale }"
          :disabled="disabled || isChanging"
          @click="handleLanguageChange(option.code)"
        >
          <span v-if="showFlag" class="language-flag">{{ option.flag }}</span>
          <span class="language-info">
            <span class="language-native">{{ option.nativeName }}</span>
            <span class="language-english">{{ option.name }}</span>
          </span>
          <span v-if="option.code === locale" class="language-check">✓</span>
        </button>
      </div>
    </Transition>

    <!-- 对话框模式 -->
    <Teleport to="body" v-if="mode === 'dialog'">
      <Transition name="dialog">
        <div 
          v-if="isOpen" 
          class="language-switcher__dialog"
          @click="close"
        >
          <div class="language-switcher__backdrop"></div>
          <div class="language-switcher__modal" @click.stop>
            <div class="language-switcher__header">
              <h3 class="language-switcher__title">{{ dialogTitle }}</h3>
              <button 
                class="language-switcher__close"
                @click="close"
                :aria-label="closeLabel"
              >
                ×
              </button>
            </div>
            <div class="language-switcher__body">
              <button
                v-for="option in languageOptions"
                :key="option.code"
                class="language-option"
                :class="{ 'is-active': option.code === locale }"
                :disabled="disabled || isChanging"
                @click="handleLanguageChange(option.code)"
              >
                <span v-if="showFlag" class="language-flag">{{ option.flag }}</span>
                <span class="language-info">
                  <span class="language-native">{{ option.nativeName }}</span>
                  <span class="language-english">{{ option.name }}</span>
                </span>
                <span v-if="option.code === locale" class="language-check">✓</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useLanguageSwitcher } from '../composables'
import type { LanguageInfo } from '../../core/types'

interface Props {
  /** UI模式：下拉菜单或对话框 */
  mode?: 'dropdown' | 'dialog'
  /** 是否显示国旗图标 */
  showFlag?: boolean
  /** 是否显示语言代码 */
  showCode?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 对话框标题 */
  dialogTitle?: string
  /** 触发按钮标签 */
  triggerLabel?: string
  /** 关闭按钮标签 */
  closeLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'dropdown',
  showFlag: true,
  showCode: false,
  disabled: false,
  dialogTitle: '选择语言',
  triggerLabel: '选择语言',
  closeLabel: '关闭',
})

const emit = defineEmits<{
  languageChanged: [locale: string]
  opened: []
  closed: []
}>()

// 使用语言切换器组合式API
const { locale, availableLanguages, switchLanguage, isChanging } = useLanguageSwitcher()
const isOpen = ref(false)

// 当前语言信息
const currentLanguage = computed(() => {
  const languages = availableLanguages.value as LanguageInfo[]
  return languages.find((lang) => lang.code === locale.value) || {
    code: locale.value,
    name: locale.value,
    nativeName: locale.value,
    region: '',
    direction: 'ltr',
    dateFormat: 'YYYY-MM-DD',
  }
})

// 当前语言显示名称
const currentLanguageDisplay = computed(() => {
  return currentLanguage.value.nativeName || currentLanguage.value.name || locale.value
})

// 当前语言国旗
const currentLanguageFlag = computed(() => {
  return getLanguageFlag(locale.value)
})

// 语言选项列表
const languageOptions = computed(() => {
  const languages = availableLanguages.value as LanguageInfo[]
  return languages.map((lang) => ({
    code: lang.code,
    name: lang.name,
    nativeName: lang.nativeName,
    flag: getLanguageFlag(lang.code),
  }))
})

// 获取语言对应的国旗图标
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

// 切换语言
async function handleLanguageChange(languageCode: string) {
  if (props.disabled || isChanging.value || languageCode === locale.value) {
    return
  }

  try {
    await switchLanguage(languageCode)
    close()
    emit('languageChanged', languageCode)
    console.warn(`🌐 语言已切换到: ${languageCode}`)
  }
  catch (error) {
    console.error('❌ 语言切换失败:', error)
  }
}

// 切换打开/关闭状态
function toggle() {
  if (props.disabled || isChanging.value) {
    return
  }
  
  if (isOpen.value) {
    close()
  } else {
    open()
  }
}

// 打开
function open() {
  isOpen.value = true
  emit('opened')
}

// 关闭
function close() {
  isOpen.value = false
  emit('closed')
}

// 键盘事件处理
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close()
  }
}

// 点击外部关闭（仅下拉模式）
function handleClickOutside(event: Event) {
  if (props.mode === 'dropdown' && isOpen.value) {
    const target = event.target as Element
    const switcher = document.querySelector('.language-switcher')
    if (switcher && !switcher.contains(target)) {
      close()
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* 基础样式 */
.language-switcher {
  position: relative;
  display: inline-block;
}

.language-switcher.is-disabled {
  opacity: 0.6;
  pointer-events: none;
}

/* 触发按钮 */
.language-switcher__trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.language-switcher__trigger:hover:not(:disabled) {
  border-color: #9ca3af;
  background: #f9fafb;
}

.language-switcher__trigger:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.language-switcher__trigger:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.language-switcher__trigger.is-open {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.trigger-content {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.language-flag {
  font-size: 16px;
  line-height: 1;
}

.language-name {
  font-weight: 500;
}

.language-code {
  font-size: 12px;
  color: #6b7280;
}

.trigger-icon {
  transition: transform 0.2s ease;
  font-size: 12px;
  color: #6b7280;
}

.trigger-icon.is-open {
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

/* 下拉菜单样式 */
.language-switcher__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  margin-top: 4px;
  padding: 4px 0;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  max-height: 300px;
  overflow-y: auto;
}

/* 对话框样式 */
.language-switcher__dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.language-switcher__backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.language-switcher__modal {
  position: relative;
  background: white;
  border-radius: 8px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
}

.language-switcher__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.language-switcher__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.language-switcher__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #6b7280;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.language-switcher__close:hover {
  background: #f3f4f6;
  color: #374151;
}

.language-switcher__body {
  padding: 8px 0;
  max-height: 400px;
  overflow-y: auto;
}

/* 语言选项样式 */
.language-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: #374151;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.language-option:hover:not(:disabled) {
  background: #f3f4f6;
}

.language-option:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.language-option.is-active {
  background: #eff6ff;
  color: #1d4ed8;
}

.language-option.is-active:hover {
  background: #dbeafe;
}

.language-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.language-native {
  font-weight: 500;
  line-height: 1.2;
}

.language-english {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.2;
}

.language-check {
  color: #059669;
  font-weight: 600;
}

/* 过渡动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.dialog-enter-active,
.dialog-leave-active {
  transition: all 0.3s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from .language-switcher__modal,
.dialog-leave-to .language-switcher__modal {
  transform: scale(0.95) translateY(-20px);
}

/* 响应式设计 */
@media (max-width: 640px) {
  .language-switcher__modal {
    margin: 16px;
    max-width: none;
  }

  .language-switcher__dropdown {
    left: -50%;
    right: -50%;
  }
}
</style>
