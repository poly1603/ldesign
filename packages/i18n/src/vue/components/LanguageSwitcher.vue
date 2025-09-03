<!--
  LanguageSwitcher 语言切换组件
  
  提供语言切换功能的 Vue 组件，自动从 I18n 核心获取可用语言
  
  @example
  <LanguageSwitcher />
  <LanguageSwitcher type="dropdown" />
  <LanguageSwitcher type="tabs" show-flag />
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
      >
        <span v-if="showFlag" class="language-switcher__flag">{{ lang.flag }}</span>
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
      >
        {{ showFlag ? lang.flag : lang.code.toUpperCase() }}
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
      >
        {{ showFlag ? lang.flag + ' ' : '' }}{{ lang.name }}
      </a>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="language-switcher__loading">
      <span class="language-switcher__spinner"></span>
      <span v-if="showLoadingText">{{ loadingText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import type { I18nInjectionKey } from '../types'
import { I18nInjectionKey as InjectionKey } from '../plugin'

/**
 * 语言信息接口
 */
interface LanguageInfo {
  code: string
  name: string
  flag: string
  nativeName?: string
}

/**
 * 切换器类型
 */
type SwitcherType = 'dropdown' | 'tabs' | 'buttons' | 'links'

/**
 * 组件属性定义
 */
interface Props {
  /** 切换器类型 */
  type?: SwitcherType
  /** 是否显示国旗 */
  showFlag?: boolean
  /** 是否显示加载文本 */
  showLoadingText?: boolean
  /** 自定义加载文本 */
  loadingText?: string
  /** 自定义语言列表 */
  languages?: LanguageInfo[]
}

const props = withDefaults(defineProps<Props>(), {
  type: 'dropdown',
  showFlag: false,
  showLoadingText: true,
  loadingText: '切换中...'
})

/**
 * 组件事件定义
 */
interface Emits {
  (e: 'change', locale: string): void
  (e: 'before-change', locale: string): void
  (e: 'after-change', locale: string): void
}

const emit = defineEmits<Emits>()

/**
 * 注入 I18n 实例
 */
const i18n = inject(InjectionKey)
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
const defaultLanguageMap: Record<string, LanguageInfo> = {
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
    await i18n.changeLanguage(locale)
    
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


