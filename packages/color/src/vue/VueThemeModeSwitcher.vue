<script setup lang="ts">
import { Check, ChevronDown, Monitor, Moon, Sun } from 'lucide-vue-next'
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue'
import { getLocale } from '../locales'

export type ThemeMode = 'light' | 'dark' | 'system'

const props = defineProps<{
  defaultMode?: ThemeMode
  storageKey?: string
}>()

const emit = defineEmits<{
  'update:mode': [mode: ThemeMode]
  'change': [mode: ThemeMode]
}>()

const STORAGE_KEY = props.storageKey || 'ld-theme-mode'
const isOpen = ref(false)
const currentMode = ref<ThemeMode>('system')
const systemPreference = ref<'light' | 'dark'>('light')

// 响应式国际化支持
// 使用标准的 'locale' key
const appLocale = inject<any>('locale', null)

// 调试日志已禁用以保持控制台干净

const currentLocale = computed(() => {
  if (appLocale && appLocale.value) {
    return appLocale.value
  }
  return 'zh-CN'
})

const locale = computed(() => getLocale(currentLocale.value))

// 监听语言变化
watch(currentLocale, (_newLocale) => {
  // 响应式更新，无需日志
})

const modes = computed(() => [
  { value: 'light' as const, label: locale.value.themeMode.light, icon: Sun },
  { value: 'dark' as const, label: locale.value.themeMode.dark, icon: Moon },
  { value: 'system' as const, label: locale.value.themeMode.system, icon: Monitor }
])

const currentModeLabel = computed(() => {
  const mode = modes.value.find(m => m.value === currentMode.value)
  return mode?.label || '主题'
})

const currentIcon = computed(() => {
  const mode = modes.value.find(m => m.value === currentMode.value)
  return mode?.icon || Sun
})

const effectiveTheme = computed(() => {
  if (currentMode.value === 'system') {
    return systemPreference.value
  }
  return currentMode.value
})

// 监听系统主题变化
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

const updateSystemPreference = () => {
  systemPreference.value = mediaQuery.matches ? 'dark' : 'light'
}

const applyTheme = (theme: 'light' | 'dark') => {
  const root = document.documentElement
  
  // 使用 theme-mode 属性，与 theme.css 保持一致
  if (theme === 'dark') {
    root.setAttribute('theme-mode', 'dark')
  } else {
    root.removeAttribute('theme-mode')
  }
  
  // 同时设置 data-theme-mode 以保持兼容性
  root.setAttribute('data-theme-mode', theme)
  
  // 为了兼容其他主题系统，也设置常见的属性
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const changeMode = (mode: ThemeMode) => {
  currentMode.value = mode
  localStorage.setItem(STORAGE_KEY, mode)
  isOpen.value = false
  
  emit('update:mode', mode)
  emit('change', mode)
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.theme-mode-switcher')) {
    isOpen.value = false
  }
}

// 监听主题变化
watch(effectiveTheme, (newTheme) => {
  applyTheme(newTheme)
})

// 监听系统主题变化
watch(systemPreference, () => {
  if (currentMode.value === 'system') {
    applyTheme(systemPreference.value)
  }
})

onMounted(() => {
  // 初始化系统主题偏好
  updateSystemPreference()
  mediaQuery.addEventListener('change', updateSystemPreference)
  
  // 从 localStorage 读取保存的主题模式
  const savedMode = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
  if (savedMode && modes.value.some(m => m.value === savedMode)) {
    currentMode.value = savedMode
  } else if (props.defaultMode) {
    currentMode.value = props.defaultMode
  }
  
  // 应用初始主题
  applyTheme(effectiveTheme.value)
  
  // 添加点击外部关闭下拉菜单的事件监听
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  mediaQuery.removeEventListener('change', updateSystemPreference)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="theme-mode-switcher">
    <button class="theme-mode-button" :title="currentModeLabel" @click="toggleDropdown">
      <component :is="currentIcon" class="theme-icon" />
      <span class="theme-label">{{ currentModeLabel }}</span>
      <ChevronDown class="arrow" :class="{ open: isOpen }" />
    </button>
    <transition name="dropdown">
      <div v-if="isOpen" class="theme-dropdown" @click.stop>
        <button
          v-for="mode in modes"
          :key="mode.value"
          class="theme-option"
          :class="{ active: currentMode === mode.value }"
          @click="changeMode(mode.value)"
        >
          <component :is="mode.icon" class="option-icon" />
          <span class="option-label">{{ mode.label }}</span>
          <Check v-if="currentMode === mode.value" class="check-icon" />
        </button>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.theme-mode-switcher {
  position: relative;
}

.theme-mode-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--ld-bg-color-component, var(--color-background-secondary));
  border: 1px solid var(--ld-component-border, var(--color-border));
  border-radius: 8px;
  color: var(--ld-text-color-primary, var(--color-text-primary));
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.theme-mode-button:hover {
  background: var(--ld-bg-color-component-hover, var(--color-primary-100));
  border-color: var(--ld-brand-color-light, var(--color-primary-200));
}

.theme-icon {
  width: 18px;
  height: 18px;
}

.theme-label {
  white-space: nowrap;
}

.arrow {
  width: 16px;
  height: 16px;
  transition: transform 0.3s;
}

.arrow.open {
  transform: rotate(180deg);
}

.theme-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: var(--ld-bg-color-container, var(--color-background));
  border: 1px solid var(--ld-component-border, var(--color-border));
  border-radius: 8px;
  box-shadow: var(--ld-shadow-2, 0 4px 12px rgba(0, 0, 0, 0.1));
  overflow: hidden;
  z-index: 1000;
  min-width: 160px;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  color: var(--ld-text-color-primary, var(--color-text-primary));
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  text-align: left;
}

.theme-option:hover {
  background: var(--ld-bg-color-component, var(--color-background-secondary));
}

.theme-option.active {
  background: var(--ld-brand-color-light, var(--color-primary-100));
  color: var(--ld-brand-color, var(--color-primary-default));
  font-weight: 600;
}

.option-icon {
  width: 18px;
  height: 18px;
}

.option-label {
  flex: 1;
}

.check-icon {
  width: 16px;
  height: 16px;
  color: var(--ld-brand-color, var(--color-primary-default));
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Dark mode specific styles */
:root[theme-mode="dark"] .theme-mode-button {
  background: var(--ld-bg-color-component);
  border-color: var(--ld-component-border);
}

:root[theme-mode="dark"] .theme-mode-button:hover {
  background: var(--ld-bg-color-component-hover);
  border-color: var(--ld-brand-color-light);
}

:root[theme-mode="dark"] .theme-dropdown {
  background: var(--ld-bg-color-container);
  border-color: var(--ld-component-border);
}

:root[theme-mode="dark"] .theme-option:hover {
  background: var(--ld-bg-color-component);
}

:root[theme-mode="dark"] .theme-option.active {
  background: var(--ld-brand-color-light);
}
</style>