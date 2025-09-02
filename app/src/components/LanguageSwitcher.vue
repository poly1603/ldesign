<!--
  语言切换器组件
  
  提供用户友好的语言切换界面
  支持下拉菜单和快速切换按钮两种模式
  
  @author LDesign Team
  @version 1.0.0
-->

<template>
  <div class="language-switcher">
    <!-- 下拉菜单模式 -->
    <div v-if="mode === 'dropdown'" class="dropdown-mode">
      <button
        class="language-button"
        @click="toggleDropdown"
        :aria-expanded="isDropdownOpen"
        aria-haspopup="true"
      >
        <span class="current-language">
          <span class="flag">{{ getCurrentFlag() }}</span>
          <span class="name">{{ getCurrentName() }}</span>
        </span>
        <span class="arrow" :class="{ 'arrow-up': isDropdownOpen }">▼</span>
      </button>
      
      <transition name="dropdown">
        <div v-if="isDropdownOpen" class="dropdown-menu">
          <button
            v-for="locale in supportedLocales"
            :key="locale.code"
            class="dropdown-item"
            :class="{ active: locale.code === currentLocale }"
            @click="switchLanguage(locale.code)"
          >
            <span class="flag">{{ locale.flag }}</span>
            <span class="name">{{ locale.name }}</span>
            <span v-if="locale.code === currentLocale" class="check">✓</span>
          </button>
        </div>
      </transition>
    </div>
    
    <!-- 快速切换模式 -->
    <div v-else-if="mode === 'toggle'" class="toggle-mode">
      <button
        class="toggle-button"
        @click="switchToNext"
        :title="t('language.switch')"
      >
        <span class="flag">{{ getCurrentFlag() }}</span>
        <span class="name">{{ getCurrentName() }}</span>
        <span class="switch-icon">⇄</span>
      </button>
    </div>
    
    <!-- 紧凑模式 -->
    <div v-else-if="mode === 'compact'" class="compact-mode">
      <button
        class="compact-button"
        @click="switchToNext"
        :title="`${t('language.current')}: ${getCurrentName()}`"
      >
        {{ getCurrentFlag() }}
      </button>
    </div>
    
    <!-- 列表模式 -->
    <div v-else-if="mode === 'list'" class="list-mode">
      <div class="language-list">
        <button
          v-for="locale in supportedLocales"
          :key="locale.code"
          class="list-item"
          :class="{ active: locale.code === currentLocale }"
          @click="switchLanguage(locale.code)"
        >
          <span class="flag">{{ locale.flag }}</span>
          <span class="name">{{ locale.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from '@ldesign/i18n'
import { supportedLocales, languageManager } from '../i18n'

// 组件属性
interface Props {
  /** 显示模式 */
  mode?: 'dropdown' | 'toggle' | 'compact' | 'list'
  /** 是否显示语言名称 */
  showName?: boolean
  /** 是否显示旗帜图标 */
  showFlag?: boolean
  /** 自定义样式类名 */
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'dropdown',
  showName: true,
  showFlag: true,
  className: '',
})

// 组件事件
interface Emits {
  (e: 'change', locale: string, oldLocale: string): void
}

const emit = defineEmits<Emits>()

// 使用国际化
const { t } = useI18n()

// 响应式状态
const isDropdownOpen = ref(false)
const currentLocale = ref(languageManager.getLocale())

// 计算属性
const getCurrentName = computed(() => {
  const locale = supportedLocales.find(l => l.code === currentLocale.value)
  return locale?.name || currentLocale.value
})

const getCurrentFlag = computed(() => {
  const locale = supportedLocales.find(l => l.code === currentLocale.value)
  return locale?.flag || '🌐'
})

// 方法
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

const switchLanguage = async (locale: string) => {
  if (locale === currentLocale.value) {
    closeDropdown()
    return
  }

  const oldLocale = currentLocale.value
  
  try {
    // 使用语言管理器切换语言
    languageManager.setLocale(locale)
    currentLocale.value = locale
    
    // 关闭下拉菜单
    closeDropdown()
    
    // 触发事件
    emit('change', locale, oldLocale)
    
    // 显示成功消息（可选）
    console.log(`Language switched from ${oldLocale} to ${locale}`)
  } catch (error) {
    console.error('Failed to switch language:', error)
  }
}

const switchToNext = () => {
  languageManager.switchToNext()
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  const switcher = target.closest('.language-switcher')
  if (!switcher && isDropdownOpen.value) {
    closeDropdown()
  }
}

// 监听语言变化
let unsubscribe: (() => void) | null = null

onMounted(() => {
  // 监听点击外部事件
  document.addEventListener('click', handleClickOutside)
  
  // 监听语言变化
  unsubscribe = languageManager.onLocaleChange((newLocale) => {
    currentLocale.value = newLocale
  })
})

onUnmounted(() => {
  // 清理事件监听
  document.removeEventListener('click', handleClickOutside)
  
  // 取消语言变化监听
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>

<style scoped>
.language-switcher {
  position: relative;
  display: inline-block;
}

/* 下拉菜单模式 */
.dropdown-mode .language-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--color-bg-secondary, #f5f5f5);
  border: 1px solid var(--color-border, #ddd);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-mode .language-button:hover {
  background: var(--color-bg-hover, #e9e9e9);
  border-color: var(--color-primary, #007bff);
}

.current-language {
  display: flex;
  align-items: center;
  gap: 6px;
}

.arrow {
  transition: transform 0.2s ease;
  font-size: 12px;
  color: var(--color-text-secondary, #666);
}

.arrow-up {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-bg, white);
  border: 1px solid var(--color-border, #ddd);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 4px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-align: left;
}

.dropdown-item:hover {
  background: var(--color-bg-hover, #f0f0f0);
}

.dropdown-item.active {
  background: var(--color-primary-light, #e3f2fd);
  color: var(--color-primary, #007bff);
}

.check {
  margin-left: auto;
  color: var(--color-success, #28a745);
  font-weight: bold;
}

/* 快速切换模式 */
.toggle-mode .toggle-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: var(--color-bg-secondary, #f5f5f5);
  border: 1px solid var(--color-border, #ddd);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-mode .toggle-button:hover {
  background: var(--color-bg-hover, #e9e9e9);
  transform: translateY(-1px);
}

.switch-icon {
  font-size: 14px;
  color: var(--color-text-secondary, #666);
}

/* 紧凑模式 */
.compact-mode .compact-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-secondary, #f5f5f5);
  border: 1px solid var(--color-border, #ddd);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;
}

.compact-mode .compact-button:hover {
  background: var(--color-bg-hover, #e9e9e9);
  transform: scale(1.1);
}

/* 列表模式 */
.list-mode .language-list {
  display: flex;
  gap: 4px;
}

.list-mode .list-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: var(--color-bg-secondary, #f5f5f5);
  border: 1px solid var(--color-border, #ddd);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
}

.list-mode .list-item:hover {
  background: var(--color-bg-hover, #e9e9e9);
}

.list-mode .list-item.active {
  background: var(--color-primary, #007bff);
  color: white;
  border-color: var(--color-primary, #007bff);
}

/* 通用样式 */
.flag {
  font-size: 16px;
  line-height: 1;
}

.name {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .dropdown-menu {
    left: auto;
    right: 0;
    min-width: 120px;
  }
  
  .list-mode .language-list {
    flex-direction: column;
  }
}
</style>
