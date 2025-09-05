<!--
  LanguageSwitcher 语言切换组件

  提供语言切换功能的 Vue 组件，自动从 I18n 核心获取可用语言
  使用现代化设计和 Lucide 图标

  @example
  <LanguageSwitcher />
  <LanguageSwitcher type="dropdown" />
  <LanguageSwitcher type="tabs" show-flag />
  <LanguageSwitcher type="buttons" :use-icons="true" />
-->

<template>
  <div class="language-switcher" :class="`language-switcher--${type}`">
    <!-- 下拉选择器模式 -->
    <select
      v-if="type === 'dropdown'"
      :value="currentLocale"
      @change="handleLanguageChange"
      class="language-switcher__select"
      :disabled="loading"
    >
      <option
        v-for="lang in availableLanguages"
        :key="lang.code"
        :value="lang.code"
      >
        {{ showFlag ? lang.flag + ' ' : '' }}{{ lang.name }}
      </option>
    </select>

    <!-- 标签页模式 -->
    <div v-else-if="type === 'tabs'" class="language-switcher__tabs">
      <button
        v-for="lang in availableLanguages"
        :key="lang.code"
        @click="switchLanguage(lang.code)"
        :class="[
          'language-switcher__tab',
          { 'language-switcher__tab--active': currentLocale === lang.code }
        ]"
        :disabled="loading"
        :title="lang.name"
      >
        <component
          v-if="useIcons"
          :is="getLanguageIcon(lang.code)"
          class="language-switcher__icon"
        />
        <span v-else-if="showFlag" class="language-switcher__flag">{{ lang.flag }}</span>
        <span class="language-switcher__name">{{ lang.name }}</span>
      </button>
    </div>

    <!-- 按钮组模式 -->
    <div v-else-if="type === 'buttons'" class="language-switcher__buttons">
      <button
        v-for="lang in availableLanguages"
        :key="lang.code"
        @click="switchLanguage(lang.code)"
        :class="[
          'language-switcher__button',
          { 'language-switcher__button--active': currentLocale === lang.code }
        ]"
        :disabled="loading"
        :title="lang.name"
      >
        <component
          v-if="useIcons"
          :is="getLanguageIcon(lang.code)"
          class="language-switcher__icon"
        />
        <span v-else-if="showFlag" class="language-switcher__flag">{{ lang.flag }}</span>
        <span v-else class="language-switcher__text">{{ lang.code.toUpperCase() }}</span>
      </button>
    </div>

    <!-- 简单链接模式 -->
    <div v-else class="language-switcher__links">
      <a
        v-for="lang in availableLanguages"
        :key="lang.code"
        @click.prevent="switchLanguage(lang.code)"
        :class="[
          'language-switcher__link',
          { 'language-switcher__link--active': currentLocale === lang.code }
        ]"
        href="#"
        :title="lang.name"
      >
        <component
          v-if="useIcons"
          :is="getLanguageIcon(lang.code)"
          class="language-switcher__icon"
        />
        <span v-else-if="showFlag" class="language-switcher__flag">{{ lang.flag }}</span>
        <span class="language-switcher__name">{{ lang.name }}</span>
      </a>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="language-switcher__loading">
      <Loader2 class="language-switcher__spinner" />
      <span v-if="showLoadingText">{{ loadingText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { I18nInjectionKey as InjectionKey } from '../plugin'
import { Globe, Languages, Loader2 } from 'lucide-vue-next'

/**
 * 切换器类型
 */
type SwitcherType = 'dropdown' | 'tabs' | 'buttons' | 'links'

// 使用内联类型定义以避免私有 Props 名称泄漏
const props = withDefaults(defineProps<{
  /** 切换器类型 */
  type?: SwitcherType
  /** 是否显示国旗 */
  showFlag?: boolean
  /** 是否使用图标替代国旗 */
  useIcons?: boolean
  /** 是否显示加载文本 */
  showLoadingText?: boolean
  /** 自定义加载文本 */
  loadingText?: string
  /** 自定义语言列表 */
  languages?: Array<{ code: string; name: string; flag: string; nativeName?: string }>
}>(), {
  type: 'dropdown',
  showFlag: false,
  useIcons: true,
  showLoadingText: true,
  loadingText: '切换中...'
})

// 使用内联类型定义以避免私有 Emits 名称泄漏
const emit = defineEmits<{
  (e: 'change', locale: string): void
  (e: 'before-change', locale: string): void
  (e: 'after-change', locale: string): void
}>()

/**
 * 注入 I18n 实例
 */
const i18n = inject(InjectionKey)!
if (!i18n) {
  throw new Error('LanguageSwitcher 组件必须在安装了 I18n 插件的 Vue 应用中使用')
}

/**
 * 响应式状态
 */
const loading = ref(false)

/**
 * 当前语言
 */
const currentLocale = computed(() => i18n.getCurrentLanguage())

/**
 * 默认语言信息映射
 */
const defaultLanguageMap: Record<string, { code: string; name: string; flag: string; nativeName?: string }> = {
  'zh-CN': { code: 'zh-CN', name: '简体中文', flag: '🇨🇳', nativeName: '简体中文' },
  'zh-TW': { code: 'zh-TW', name: '繁體中文', flag: '🇹🇼', nativeName: '繁體中文' },
  'en': { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  'en-US': { code: 'en-US', name: 'English (US)', flag: '🇺🇸', nativeName: 'English (US)' },
  'en-GB': { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧', nativeName: 'English (UK)' },
  'ja': { code: 'ja', name: '日本語', flag: '🇯🇵', nativeName: '日本語' },
  'ko': { code: 'ko', name: '한국어', flag: '🇰🇷', nativeName: '한국어' },
  'fr': { code: 'fr', name: 'Français', flag: '🇫🇷', nativeName: 'Français' },
  'de': { code: 'de', name: 'Deutsch', flag: '🇩🇪', nativeName: 'Deutsch' },
  'es': { code: 'es', name: 'Español', flag: '🇪🇸', nativeName: 'Español' },
  'it': { code: 'it', name: 'Italiano', flag: '🇮🇹', nativeName: 'Italiano' },
  'pt': { code: 'pt', name: 'Português', flag: '🇵🇹', nativeName: 'Português' },
  'ru': { code: 'ru', name: 'Русский', flag: '🇷🇺', nativeName: 'Русский' },
  'ar': { code: 'ar', name: 'العربية', flag: '🇸🇦', nativeName: 'العربية' },
  'hi': { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', nativeName: 'हिन्दी' },
  'th': { code: 'th', name: 'ไทย', flag: '🇹🇭', nativeName: 'ไทย' },
  'vi': { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', nativeName: 'Tiếng Việt' }
}

/**
 * 可用语言列表
 */
const availableLanguages = computed(() => {
  if (props.languages) {
    return props.languages
  }

  // 从 I18n 核心获取可用语言
  const availableCodes = i18n.getAvailableLanguages()

  // 确保 availableCodes 是数组
  if (!Array.isArray(availableCodes)) {
    console.warn('getAvailableLanguages() 返回的不是数组:', availableCodes)
    return []
  }

  return availableCodes.map(code => {
    return defaultLanguageMap[code] || {
      code,
      name: code.toUpperCase(),
      flag: '🌐'
    }
  })
})

/**
 * 切换语言
 */
const switchLanguage = async (locale: string) => {
  if (loading.value || locale === currentLocale.value) {
    return
  }

  try {
    loading.value = true
    
    // 触发切换前事件
    emit('before-change', locale)
    
    // 执行语言切换
    const changer = (i18n as any).changeLanguage ?? i18n.setLocale
    await changer(locale)
    
    // 触发切换事件
    emit('change', locale)
    emit('after-change', locale)
    
  } catch (error) {
    console.error('语言切换失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 获取语言对应的图标组件
 */
const getLanguageIcon = (langCode: string) => {
  const iconMap: Record<string, any> = {
    'zh-CN': Languages,
    'zh-TW': Languages,
    'en-US': Globe,
    'en': Globe,
    'ja-JP': Languages,
    'ja': Languages,
    'ko-KR': Languages,
    'ko': Languages,
    'fr': Globe,
    'de': Globe,
    'es': Globe,
    'it': Globe,
    'pt': Globe,
    'ru': Globe,
    'ar': Globe,
    'hi': Globe,
    'th': Globe,
    'vi': Globe
  }

  return iconMap[langCode] || Globe
}

/**
 * 处理下拉选择器变化
 */
const handleLanguageChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  switchLanguage(target.value)
}
</script>

<script lang="ts">
/**
 * 组件名称
 */
export default {
  name: 'LanguageSwitcher',
  inheritAttrs: false
}
</script>

<style lang="less">
@import './LanguageSwitcher.less';
</style>