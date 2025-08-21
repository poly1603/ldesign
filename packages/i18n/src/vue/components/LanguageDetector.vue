<!--
  语言检测组件

  自动检测用户语言偏好并提供切换建议，支持：
  - 浏览器语言检测
  - 地理位置语言推荐
  - 用户偏好记忆
  - 智能语言建议
-->

<template>
  <div v-if="shouldShowSuggestion" class="language-detector" :class="detectorClasses">
    <div class="detector-content">
      <div class="detector-icon">🌐</div>
      <div class="detector-message">
        <div class="detector-title">{{ title }}</div>
        <div class="detector-description">{{ description }}</div>
      </div>
      <div class="detector-actions">
        <button
          class="detector-button detector-button--primary"
          @click="acceptSuggestion"
          :disabled="isChanging"
        >
          {{ acceptText }}
        </button>
        <button
          class="detector-button detector-button--secondary"
          @click="dismissSuggestion"
        >
          {{ dismissText }}
        </button>
      </div>
      <button
        class="detector-close"
        @click="dismissSuggestion"
        :aria-label="closeLabel"
      >
        ×
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useLanguageSwitcher } from '../composables'

interface Props {
  /** 是否启用自动检测 */
  autoDetect?: boolean
  /** 检测模式 */
  mode?: 'banner' | 'toast' | 'modal'
  /** 是否可关闭 */
  dismissible?: boolean
  /** 检测延迟（毫秒） */
  delay?: number
  /** 自定义标题 */
  title?: string
  /** 自定义描述 */
  description?: string
  /** 接受按钮文本 */
  acceptText?: string
  /** 拒绝按钮文本 */
  dismissText?: string
  /** 关闭按钮标签 */
  closeLabel?: string
  /** 存储键名 */
  storageKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  autoDetect: true,
  mode: 'banner',
  dismissible: true,
  delay: 1000,
  title: '语言建议',
  description: '我们检测到您可能更喜欢使用其他语言',
  acceptText: '切换语言',
  dismissText: '保持当前',
  closeLabel: '关闭',
  storageKey: 'language-detector-dismissed',
})

const emit = defineEmits<{
  detected: [suggestedLanguage: string, detectedLanguages: string[]]
  accepted: [language: string]
  dismissed: []
}>()

// 使用语言切换器
const { locale, availableLanguages, switchLanguage, isChanging } = useLanguageSwitcher()

// 状态管理
const isVisible = ref(false)
const isDismissed = ref(false)
const suggestedLanguage = ref<string>('')
const detectedLanguages = ref<string[]>([])

// 是否应该显示建议
const shouldShowSuggestion = computed(() => {
  return props.autoDetect && 
         isVisible.value && 
         !isDismissed.value && 
         suggestedLanguage.value && 
         suggestedLanguage.value !== locale.value
})

// 检测器CSS类
const detectorClasses = computed(() => {
  return [
    `language-detector--${props.mode}`,
    { 'is-dismissible': props.dismissible }
  ]
})

// 建议的语言信息
const suggestedLanguageInfo = computed(() => {
  const languages = availableLanguages.value as any[]
  return languages.find(lang => lang.code === suggestedLanguage.value) || {
    code: suggestedLanguage.value,
    name: suggestedLanguage.value,
    nativeName: suggestedLanguage.value,
  }
})

// 动态标题和描述
const title = computed(() => {
  if (suggestedLanguageInfo.value) {
    return `切换到 ${suggestedLanguageInfo.value.nativeName}？`
  }
  return props.title
})

const description = computed(() => {
  if (suggestedLanguageInfo.value) {
    return `我们检测到您可能更喜欢使用 ${suggestedLanguageInfo.value.nativeName} (${suggestedLanguageInfo.value.name})`
  }
  return props.description
})

// 检测浏览器语言
function detectBrowserLanguages(): string[] {
  const languages: string[] = []
  
  // 获取浏览器语言列表
  if (navigator.languages) {
    languages.push(...navigator.languages)
  } else if (navigator.language) {
    languages.push(navigator.language)
  }
  
  // 标准化语言代码
  return languages.map(lang => {
    // 处理常见的语言代码映射
    const normalized = lang.toLowerCase()
    if (normalized.startsWith('zh-cn') || normalized.startsWith('zh-hans')) {
      return 'zh-CN'
    }
    if (normalized.startsWith('zh-tw') || normalized.startsWith('zh-hant')) {
      return 'zh-TW'
    }
    if (normalized.startsWith('en')) {
      return 'en'
    }
    return lang.split('-')[0] // 取主语言代码
  })
}

// 查找最佳匹配语言
function findBestMatch(detectedLangs: string[]): string | null {
  const availableCodes = (availableLanguages.value as any[]).map(lang => lang.code)
  
  // 精确匹配
  for (const lang of detectedLangs) {
    if (availableCodes.includes(lang)) {
      return lang
    }
  }
  
  // 主语言匹配
  for (const lang of detectedLangs) {
    const mainLang = lang.split('-')[0]
    const match = availableCodes.find(code => code.startsWith(mainLang))
    if (match) {
      return match
    }
  }
  
  return null
}

// 检查是否已被拒绝
function checkDismissed(): boolean {
  try {
    const dismissed = localStorage.getItem(props.storageKey)
    return dismissed === 'true'
  } catch {
    return false
  }
}

// 保存拒绝状态
function saveDismissed() {
  try {
    localStorage.setItem(props.storageKey, 'true')
  } catch {
    // 忽略存储错误
  }
}

// 执行语言检测
function performDetection() {
  if (!props.autoDetect || checkDismissed()) {
    return
  }
  
  const detected = detectBrowserLanguages()
  detectedLanguages.value = detected
  
  const bestMatch = findBestMatch(detected)
  if (bestMatch && bestMatch !== locale.value) {
    suggestedLanguage.value = bestMatch
    
    setTimeout(() => {
      isVisible.value = true
      emit('detected', bestMatch, detected)
    }, props.delay)
  }
}

// 接受建议
async function acceptSuggestion() {
  if (!suggestedLanguage.value || isChanging.value) {
    return
  }
  
  try {
    await switchLanguage(suggestedLanguage.value)
    emit('accepted', suggestedLanguage.value)
    isVisible.value = false
  } catch (error) {
    console.error('语言切换失败:', error)
  }
}

// 拒绝建议
function dismissSuggestion() {
  isDismissed.value = true
  isVisible.value = false
  saveDismissed()
  emit('dismissed')
}

// 监听语言变化
watch(locale, () => {
  if (locale.value === suggestedLanguage.value) {
    isVisible.value = false
  }
})

// 监听可用语言变化
watch(availableLanguages, () => {
  if (availableLanguages.value.length > 0) {
    performDetection()
  }
}, { immediate: true })

onMounted(() => {
  if (props.autoDetect) {
    performDetection()
  }
})

// 暴露方法给父组件
defineExpose({
  detect: performDetection,
  dismiss: dismissSuggestion,
  accept: acceptSuggestion,
})
</script>

<style scoped>
/* 基础样式 */
.language-detector {
  position: relative;
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}

.language-detector--banner {
  width: 100%;
}

.language-detector--toast {
  position: fixed;
  top: 20px;
  right: 20px;
  max-width: 400px;
  z-index: 1000;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.language-detector--modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 500px;
  z-index: 1000;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.detector-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.detector-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.detector-message {
  flex: 1;
  min-width: 0;
}

.detector-title {
  font-weight: 600;
  color: #0c4a6e;
  margin-bottom: 4px;
}

.detector-description {
  font-size: 14px;
  color: #0369a1;
  line-height: 1.4;
}

.detector-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.detector-button {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.detector-button--primary {
  background: #0ea5e9;
  color: white;
}

.detector-button--primary:hover:not(:disabled) {
  background: #0284c7;
}

.detector-button--secondary {
  background: transparent;
  color: #0369a1;
  border-color: #0ea5e9;
}

.detector-button--secondary:hover {
  background: #e0f2fe;
}

.detector-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.detector-close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #0369a1;
  font-size: 18px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.detector-close:hover {
  background: #e0f2fe;
}

.language-detector.is-dismissible .detector-content {
  padding-right: 32px;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .language-detector--toast {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  .language-detector--modal {
    top: 20px;
    left: 10px;
    right: 10px;
    transform: none;
    max-width: none;
  }
  
  .detector-content {
    flex-direction: column;
    gap: 12px;
  }
  
  .detector-actions {
    width: 100%;
  }
  
  .detector-button {
    flex: 1;
  }
}
</style>
