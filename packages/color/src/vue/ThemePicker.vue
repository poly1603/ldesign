<script setup lang="ts">
import type { ColorPlugin } from '../plugin'
import type { PresetTheme } from '../themes/presets'
import { computed, inject, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { getLocale } from '../locales'
import { ColorPluginSymbol } from '../plugin'
import { useTheme } from './useTheme'

interface Props {
  modelValue?: string
  showArrow?: boolean
  showSearch?: boolean
  showCustom?: boolean
  showAddCustomTheme?: boolean
  showRemoveButton?: boolean
  prefix?: string
  storageKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  showArrow: true,
  showSearch: false,
  showCustom: false,
  showAddCustomTheme: false,
  showRemoveButton: true,
  prefix: 'ld'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string, preset?: PresetTheme): void
}>()

// Try to get plugin instance from injection
const pluginInstance = inject<ColorPlugin | undefined>(ColorPluginSymbol, undefined)

// 响应式国际化支持
const appLocale = inject<any>('locale', null)

// 使用响应式 locale - 优先使用插件的 locale
const currentLocale = computed(() => {
  // 优先使用插件的当前语言
  if (pluginInstance?.currentLocale?.value) {
    return pluginInstance.currentLocale.value
  }
  // 其次使用注入的 app locale
  if (appLocale && appLocale.value) {
    return appLocale.value
  }
  // 默认中文
  return 'zh-CN'
})

// 响应式的翻译函数
const locale = computed(() => getLocale(currentLocale.value))

const t = (key: string, fallback?: string): string => {
  const keys = key.split('.')
  let value: any = locale.value
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k]
    } else {
      return fallback || key
    }
  }
  
  return typeof value === 'string' ? value : (fallback || key)
}

const pickerRef = ref<HTMLElement>()
const isOpen = ref(false)
const searchQuery = ref('')
const customColor = ref('#1890ff')
const newThemeName = ref('')
const newThemeColor = ref('#1890ff')
const dropdownStyle = ref({})
// Local selected theme name for immediate UI update
const selectedThemeName = ref<string>('')

const { 
  // currentTheme,
  presets: defaultPresets,
  primaryColor,
  themeName,
  applyTheme,
  applyPresetTheme,
  restoreTheme
} = useTheme({
  prefix: props.prefix,
  storageKey: props.storageKey
})

// Use plugin's presets if available (includes custom themes), otherwise fallback to default
const presets = computed(() => {
  if (pluginInstance) {
    return pluginInstance.getSortedPresets()
  }
  return defaultPresets.value
})

// 当前主题色
const currentThemeColor = computed(() => {
  return props.modelValue || primaryColor.value || '#1890ff'
})

// 图标颜色（根据背景亮度自适应）
const currentColor = computed(() => {
  // 获取主题色的 RGB 值
  const color = currentThemeColor.value
  const r = Number.parseInt(color.slice(1, 3), 16)
  const g = Number.parseInt(color.slice(3, 5), 16)
  const b = Number.parseInt(color.slice(5, 7), 16)
  
  // 计算亮度
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  
  // 如果主题色偏暗，使用主题色；如果偏亮，使用深色
  return brightness > 128 ? '#595959' : color
})

// 当前标签
const currentLabel = computed(() => {
  const name = selectedThemeName.value || themeName.value
  const preset = presets.value.find(p => p.name === name)
  if (preset) {
    // Use i18n for preset labels
    const i18nKey = `theme.presets.${preset.name}`
    return t(i18nKey, preset.label)
  }
  return t('theme.title', 'Theme Color')
})

// Active theme name (use local selected first, fallback to themeName)
const activeThemeName = computed(() => selectedThemeName.value || themeName.value)

// Build visible presets (prepend current custom color if not in presets)
const visiblePresets = computed(() => {
  const list: PresetTheme[] = [...presets.value]
  const inPresets = list.some(p => p.color.toLowerCase() === (currentThemeColor.value || '').toLowerCase())
  if (!inPresets && currentThemeColor.value) {
    // Show current custom color as a temporary preset
            list.unshift({ 
      name: 'custom-current', 
      label: t('theme.custom', 'Current Color'), 
      color: currentThemeColor.value, 
      custom: true 
    })
  }
  return list
})

// 过滤的预设（按 order 排序）
const filteredPresets = computed(() => {
  let filtered = visiblePresets.value
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(preset => 
      preset.label.toLowerCase().includes(query) ||
      preset.name.toLowerCase().includes(query) ||
      preset.color.toLowerCase().includes(query)
    )
  }
  
  // 按 order 排序
  return [...filtered].sort((a, b) => {
    const orderA = a.order ?? 9999
    const orderB = b.order ?? 9999
    return orderA - orderB
  })
})

// 更新下拉框位置（防止溢出屏幕，优先正下方）
const updateDropdownPosition = () => {
  if (!pickerRef.value) return
  
  const rect = pickerRef.value.getBoundingClientRect()
  const dropdownHeight = 360
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const desiredWidth = 296
  const margin = 16
  
  const spaceBelow = viewportHeight - rect.bottom - margin
  const spaceAbove = rect.top - margin
  
  // 优先正下方，空间不足时考虑上方
  let top = rect.bottom + margin
  if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
    top = rect.top - dropdownHeight - margin
  }
  // 确保不超出视口
  top = Math.max(margin, Math.min(top, viewportHeight - dropdownHeight - margin))
  
  // 计算左侧位置（居中对齐触发按钮）
  let left = rect.left + rect.width / 2 - desiredWidth / 2
  
  // 关键：确保左侧和右侧都不超出视口
  if (left < margin) {
    left = margin
  } else if (left + desiredWidth > viewportWidth - margin) {
    left = viewportWidth - desiredWidth - margin
  }
  
  dropdownStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    width: `${desiredWidth}px`,
    maxWidth: `calc(100vw - ${margin * 2}px)`,
    zIndex: 9999
  }
}

// 切换下拉框
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => updateDropdownPosition())
  }
}

// 选择预设
const selectPreset = async (preset: PresetTheme) => {
  try {
    // Immediately update UI with local state
    selectedThemeName.value = preset.name
    
    // Use plugin's method if available, otherwise use local method
    if (pluginInstance) {
      await pluginInstance.applyPresetTheme(preset.name)
    } else {
      await applyPresetTheme(preset.name)
    }
    emit('update:modelValue', preset.color)
    emit('change', preset.color, preset)
  } catch (error) {
    console.error('[ThemePicker] Failed to apply preset theme:', error)
    // Revert on error
    selectedThemeName.value = themeName.value
  }
  isOpen.value = false
}

// 处理自定义颜色
const handleCustomColor = async () => {
  if (customColor.value) {
    try {
      // Use plugin's method if available, otherwise use local method
      if (pluginInstance) {
        await pluginInstance.applyTheme(customColor.value)
      } else {
        await applyTheme(customColor.value)
      }
      emit('update:modelValue', customColor.value)
      emit('change', customColor.value)
    } catch (error) {
      console.error('[ThemePicker] Failed to apply custom color:', error)
    }
    isOpen.value = false
  }
}

// 添加自定义主题
const handleAddCustomTheme = async () => {
  if (!newThemeName.value || !newThemeColor.value) return

  const themeName = newThemeName.value
  const themeColor = newThemeColor.value

  try {
    if (pluginInstance && typeof pluginInstance.addCustomTheme === 'function') {
      pluginInstance.addCustomTheme({
        name: themeName,
        label: themeName,
        color: themeColor,
        custom: true
      })

      // Reset inputs
      newThemeName.value = ''
      newThemeColor.value = '#1890ff'

      // Apply the new theme
      await selectPreset({ name: themeName, label: themeName, color: themeColor, custom: true })
    } else {
      console.warn('[ThemePicker] Color plugin not found. Cannot add custom theme.')
    }
  } catch (error) {
    console.error('[ThemePicker] Failed to add custom theme:', error)
    console.error('[ThemePicker] Failed to add custom theme:', error instanceof Error ? error.message : 'Failed to add theme')
  }
}

// 删除自定义主题
const handleRemoveCustomTheme = async (name: string) => {
  // Use custom confirmation dialog in production
  // For now, skip confirmation in development
  const shouldRemove = true // Replace with custom dialog
  if (!shouldRemove) {
    return
  }

  try {
    if (pluginInstance && typeof pluginInstance.removeCustomTheme === 'function') {
      pluginInstance.removeCustomTheme(name)

      // If current theme was removed, switch to default
      if (themeName.value === name) {
        if (pluginInstance.applyPresetTheme) {
          await pluginInstance.applyPresetTheme('blue')
        } else {
          await applyPresetTheme('blue')
        }
      }
    } else {
      console.warn('[ThemePicker] Color plugin not found. Cannot remove custom theme.')
    }
  } catch (error) {
    console.error('[ThemePicker] Failed to remove custom theme:', error)
    console.error('[ThemePicker] Failed to remove theme:', error instanceof Error ? error.message : 'Failed to remove theme')
  }
}

// 点击外部关闭
const handleClickOutside = (event: MouseEvent) => {
  if (!pickerRef.value?.contains(event.target as Node)) {
    isOpen.value = false
  }
}

// 监听窗口调整
const handleResize = () => {
  if (isOpen.value) {
    updateDropdownPosition()
  }
}

onMounted(() => {
  // 恢复主题
  restoreTheme()
  
  // Initialize selected theme name
  selectedThemeName.value = themeName.value
  
  // 监听事件
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleResize)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleResize)
})

// 监听 modelValue 变化
watch(() => props.modelValue, (newValue) => {
  if (newValue && newValue !== primaryColor.value) {
    applyTheme(newValue)
  }
})

// Sync selectedThemeName with themeName when it changes externally
watch(themeName, (newName) => {
  if (newName && newName !== selectedThemeName.value) {
    selectedThemeName.value = newName
  }
})
</script>

<template>
  <div ref="pickerRef" class="ld-theme-picker">
    <button 
      class="ld-theme-picker__trigger"
      :title="currentLabel"
      @click="toggleDropdown"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" :stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="13.5" cy="6.5" r=".5" :fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".5" :fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" :fill="currentColor" />
        <circle cx="6.5" cy="12.5" r=".5" :fill="currentColor" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
      </svg>
    </button>
    
    <Teleport to="body">
      <Transition name="ld-theme-picker-fade">
        <div 
          v-if="isOpen"
          class="ld-theme-picker__dropdown"
          :style="dropdownStyle"
          @click.stop
        >
          <div v-if="showSearch" class="ld-theme-picker__search">
            <input 
              v-model="searchQuery"
              type="text"
              :placeholder="t('theme.searchPlaceholder', 'Search colors...')"
              class="ld-theme-picker__search-input"
            >
          </div>
        
          <div class="ld-theme-picker__content">
            <div v-if="showCustom" class="ld-theme-picker__custom">
              <label class="ld-theme-picker__label">{{ t('theme.customColor', 'Custom Color') }}</label>
              <div class="ld-theme-picker__custom-input">
                <input 
                  v-model="customColor"
                  type="color"
                  class="ld-theme-picker__color-input"
                  @change="handleCustomColor"
                >
                <input 
                  v-model="customColor"
                  type="text"
                  placeholder="#000000"
                  class="ld-theme-picker__hex-input"
                  @keyup.enter="handleCustomColor"
                >
                <button 
                  class="ld-theme-picker__apply-btn"
                  @click="handleCustomColor"
                >
                  {{ t('theme.apply', 'Apply') }}
                </button>
              </div>

              <!-- 添加自定义主题 -->
              <div v-if="showAddCustomTheme" class="ld-theme-picker__add-theme">
                <label class="ld-theme-picker__label">{{ t('theme.addCustomTheme', 'Add Custom Theme') }}</label>
                <div class="ld-theme-picker__add-input">
                  <input 
                    v-model="newThemeName"
                    type="text"
                    :placeholder="t('theme.themeName', 'Theme name')"
                    class="ld-theme-picker__name-input"
                  >
                  <input 
                    v-model="newThemeColor"
                    type="color"
                    class="ld-theme-picker__color-input"
                  >
                  <input 
                    v-model="newThemeColor"
                    type="text"
                    placeholder="#000000"
                    class="ld-theme-picker__hex-input"
                  >
                  <button 
                    class="ld-theme-picker__add-btn"
                    :disabled="!newThemeName || !newThemeColor"
                    @click="handleAddCustomTheme"
                  >
                    {{ t('theme.add', 'Add') }}
                  </button>
                </div>
              </div>
            </div>
          
            <div class="ld-theme-picker__presets">
              <label class="ld-theme-picker__label">
                {{ t('theme.selectThemeColor', 'Select Theme Color') }}
                <span style="font-size: 10px; color: #999; margin-left: 8px;">
                  ({{ currentLocale }})
                </span>
              </label>
              <div class="ld-theme-picker__grid">
                <div
                  v-for="preset in filteredPresets"
                  :key="`${preset.name}-${preset.color}`"
                  class="ld-theme-picker__preset"
                  :class="{ 'is-active': (preset.name === activeThemeName) || (!activeThemeName && preset.custom), 'is-custom': preset.custom }"
                >
                  <span 
                    class="ld-theme-picker__preset-color"
                    :style="{ backgroundColor: preset.color }"
                    :title="preset.label"
                    @click="selectPreset(preset)"
                  >
                    <svg v-if="(preset.name === activeThemeName) || (!activeThemeName && preset.custom)" class="ld-theme-picker__check" width="16" height="16" viewBox="0 0 16 16">
                      <path d="M3 8L6 11L13 4" stroke="white" stroke-width="2" fill="none" />
                    </svg>
                  </span>
                  <span 
                    class="ld-theme-picker__preset-label"
                    @click="selectPreset(preset)"
                  >{{ t(`theme.presets.${preset.name}`, preset.label) }}</span>
                  <!-- 删除按钮（仅自定义主题） -->
                  <button
                    v-if="preset.custom && showRemoveButton"
                    class="ld-theme-picker__remove-btn"
                    :title="t('theme.remove', 'Remove')"
                    @click.stop="handleRemoveCustomTheme(preset.name)"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style>
.ld-theme-picker {
  position: relative;
  display: inline-block;
}

.ld-theme-picker *,
.ld-theme-picker *::before,
.ld-theme-picker *::after {
  box-sizing: border-box;
}

.ld-theme-picker__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ld-theme-picker__trigger svg {
  display: block;
  transition: transform 0.2s;
}

.ld-theme-picker__trigger:hover {
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.ld-theme-picker__trigger:hover svg {
  transform: scale(1.1) rotate(-5deg);
}

.ld-theme-picker__trigger:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.ld-theme-picker__trigger:active svg {
  transform: scale(0.95);
}

.ld-theme-picker__dropdown {
  position: fixed;
  width: 296px;
  max-width: calc(100vw - 32px);
  max-height: 360px;
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  overflow-x: hidden;
  transform-origin: top center;
  box-sizing: border-box;
}

/* Dropdown animations */
.ld-theme-picker-fade-enter-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.ld-theme-picker-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.ld-theme-picker-fade-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(-8px);
}

.ld-theme-picker-fade-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}

.ld-theme-picker__search {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.ld-theme-picker__search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

.ld-theme-picker__search-input:focus {
  border-color: #40a9ff;
}

.ld-theme-picker__content {
  max-height: 360px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #d9d9d9 transparent;
  box-sizing: border-box;
}

.ld-theme-picker__content::-webkit-scrollbar {
  width: 6px;
}

.ld-theme-picker__content::-webkit-scrollbar-track {
  background: transparent;
}

.ld-theme-picker__content::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}

.ld-theme-picker__content::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}

.ld-theme-picker__custom {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.ld-theme-picker__label {
  display: block;
  margin-bottom: 12px;
  font-size: 13px;
  color: #595959;
  font-weight: 500;
}

.ld-theme-picker__custom-input {
  display: flex;
  gap: 8px;
}

.ld-theme-picker__color-input {
  width: 40px;
  height: 32px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
}

.ld-theme-picker__hex-input {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
}

.ld-theme-picker__hex-input:focus {
  border-color: #40a9ff;
}

.ld-theme-picker__apply-btn {
  padding: 6px 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
}

.ld-theme-picker__apply-btn:hover {
  background: #40a9ff;
}

.ld-theme-picker__presets {
  padding: 12px 16px 16px;
  box-sizing: border-box;
  overflow: hidden;
}

.ld-theme-picker__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px 8px;
  align-items: start;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.ld-theme-picker__preset {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 6px 3px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
  min-width: 0;
  overflow: hidden;
}

.ld-theme-picker__preset:hover {
  background: #f7f7f7;
  transform: translateY(-1px);
}

.ld-theme-picker__preset.is-active {
  background: #f0f7ff;
  border-color: transparent;
}

.ld-theme-picker__preset-color {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 2px solid transparent;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
  transition: all 0.2s;
}

.ld-theme-picker__preset:hover .ld-theme-picker__preset-color {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
}

.ld-theme-picker__preset.is-active .ld-theme-picker__preset-color {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.35);
}

.ld-theme-picker__check {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.ld-theme-picker__preset-label {
  font-size: 10.5px;
  color: #595959;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  line-height: 1.2;
  padding: 0 1px;
  word-break: keep-all;
}


/* 添加自定义主题样式 */
.ld-theme-picker__add-theme {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.ld-theme-picker__add-input {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.ld-theme-picker__name-input {
  flex: 1;
  min-width: 120px;
  padding: 6px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
}

.ld-theme-picker__name-input:focus {
  border-color: #40a9ff;
}

.ld-theme-picker__add-btn {
  padding: 6px 12px;
  background: #52c41a;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
}

.ld-theme-picker__add-btn:hover:not(:disabled) {
  background: #73d13d;
}

.ld-theme-picker__add-btn:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

/* 删除按钮样式 */
.ld-theme-picker__preset.is-custom {
  position: relative;
}

.ld-theme-picker__remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  padding: 0;
  background: rgba(255, 77, 79, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ld-theme-picker__preset.is-custom:hover .ld-theme-picker__remove-btn {
  opacity: 1;
}

.ld-theme-picker__remove-btn:hover {
  background: #ff4d4f;
  transform: scale(1.1);
}

/* Responsive design for smaller screens */
@media (max-width: 360px) {
  .ld-theme-picker__dropdown {
    width: calc(100vw - 32px);
  }
  
  .ld-theme-picker__grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .ld-theme-picker__preset {
    padding: 4px;
  }
  
  .ld-theme-picker__preset-color {
    width: 32px;
    height: 32px;
  }
}
</style>