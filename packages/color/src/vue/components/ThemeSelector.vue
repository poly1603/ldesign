<!--
  主题选择器组件
  提供预设主题色的选择和切换功能
  支持三种选择样式：select、popup、dialog
  使用 @ldesign/shared 中的通用组件实现
-->

<template>
  <div class="theme-selector" :class="[sizeClass, { 'theme-selector--disabled': disabled }]">
    <!-- 美化的下拉选择形式 -->
    <div v-if="mode === 'select'" class="theme-selector__select-wrapper">
      <LSelect :model-value="selectedTheme" :options="selectOptions" :placeholder="placeholder" :disabled="disabled"
        :size="size" :show-color="showPreview" :show-description="true" :animation="selectAnimation"
        @update:model-value="selectTheme" />
    </div>

    <!-- 弹出层形式 -->
    <div v-else-if="mode === 'popup'" class="theme-selector__popup-wrapper">
      <LPopup placement="bottom" trigger="click" :animation="popupAnimation" :disabled="disabled">
        <!-- 触发按钮 -->
        <button class="theme-selector__trigger" :class="[`theme-selector__trigger--${size}`]" :disabled="disabled">
          <span class="theme-selector__trigger-icon">🎨</span>
          <span class="theme-selector__trigger-text">{{ buttonText }}</span>
          <span v-if="currentTheme" class="theme-selector__trigger-preview">
            <span class="theme-selector__color-dot" :style="{ backgroundColor: getCurrentThemeColor('primary') }" />
          </span>
        </button>

        <!-- 弹出内容 -->
        <template #content>
          <div class="theme-selector__popup-content">
            <div class="theme-selector__popup-title">{{ popupTitle }}</div>
            <div class="theme-selector__themes-grid theme-selector__themes-grid--compact">
              <div v-for="theme in mergedThemes" :key="theme.name"
                class="theme-selector__theme-card theme-selector__theme-card--compact"
                :class="{ 'theme-selector__theme-card--active': selectedTheme === theme.name }"
                @click="selectTheme(theme.name)">
                <div class="theme-selector__theme-preview">
                  <div class="theme-selector__color-dot"
                    :style="{ backgroundColor: getThemeColor(theme, 'primary') }" />
                  <div class="theme-selector__color-dot"
                    :style="{ backgroundColor: getThemeColor(theme, 'success') }" />
                  <div class="theme-selector__color-dot"
                    :style="{ backgroundColor: getThemeColor(theme, 'warning') }" />
                </div>
                <div class="theme-selector__theme-name">{{ theme.displayName }}</div>
              </div>
            </div>
          </div>
        </template>
      </LPopup>
    </div>

    <!-- 按钮弹窗形式 -->
    <div v-else-if="mode === 'dialog'">
      <!-- 触发按钮 -->
      <button class="theme-selector__trigger" :disabled="disabled" @click="showDialog = true">
        <svg class="theme-selector__icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        {{ buttonText }}
      </button>

      <!-- 对话框 -->
      <LDialog v-model:visible="showDialog" :title="dialogTitle" width="600" :animation="dialogAnimation">
        <!-- 内置主题选择网格 -->
        <div v-if="categorizedThemes.builtin.length > 0" class="theme-selector__themes-section">
          <label class="theme-selector__themes-label">内置主题</label>
          <div class="theme-selector__themes-grid">
            <div v-for="theme in categorizedThemes.builtin" :key="theme.name" class="theme-selector__theme-card"
              :class="{ active: selectedTheme === theme.name }" @click="selectTheme(theme.name)">
              <div class="theme-selector__theme-preview">
                <div class="theme-selector__color-dot" :style="{ backgroundColor: getThemeColor(theme, 'primary') }"
                  :title="`主色: ${getThemeColor(theme, 'primary')}`" />
                <div class="theme-selector__color-dot" :style="{ backgroundColor: getThemeColor(theme, 'success') }"
                  :title="`成功色: ${getThemeColor(theme, 'success')}`" />
                <div class="theme-selector__color-dot" :style="{ backgroundColor: getThemeColor(theme, 'warning') }"
                  :title="`警告色: ${getThemeColor(theme, 'warning')}`" />
                <div class="theme-selector__color-dot" :style="{ backgroundColor: getThemeColor(theme, 'danger') }"
                  :title="`危险色: ${getThemeColor(theme, 'danger')}`" />
              </div>
              <div class="theme-selector__theme-name">{{ theme.displayName }}</div>
              <div class="theme-selector__theme-desc">{{ theme.description }}</div>
            </div>
          </div>
        </div>

        <!-- 自定义主题选择网格 -->
        <div v-if="categorizedThemes.custom.length > 0" class="theme-selector__themes-section">
          <label class="theme-selector__themes-label">自定义主题</label>
          <div class="theme-selector__themes-grid">
            <div v-for="theme in categorizedThemes.custom" :key="theme.name" class="theme-selector__theme-card"
              :class="{ active: selectedTheme === theme.name }" @click="selectTheme(theme.name)">
              <div class="theme-selector__theme-preview">
                <div class="theme-selector__color-dot" :style="{ backgroundColor: getThemeColor(theme, 'primary') }"
                  :title="`主色: ${getThemeColor(theme, 'primary')}`" />
                <div class="theme-selector__color-dot" :style="{ backgroundColor: getThemeColor(theme, 'success') }"
                  :title="`成功色: ${getThemeColor(theme, 'success')}`" />
                <div class="theme-selector__color-dot" :style="{ backgroundColor: getThemeColor(theme, 'warning') }"
                  :title="`警告色: ${getThemeColor(theme, 'warning')}`" />
                <div class="theme-selector__color-dot" :style="{ backgroundColor: getThemeColor(theme, 'danger') }"
                  :title="`危险色: ${getThemeColor(theme, 'danger')}`" />
              </div>
              <div class="theme-selector__theme-name">{{ theme.displayName }}</div>
              <div class="theme-selector__theme-desc">{{ theme.description }}</div>
            </div>
          </div>
        </div>
      </LDialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, inject, onMounted, onUnmounted } from 'vue'
import { presetThemes } from '../../themes/presets'
import type { ThemeConfig } from '../../core/types'
import { globalThemeApplier } from '../../utils/css-variables'
import { LSelect, LPopup, LDialog } from '@ldesign/shared'

// Props
interface Props {
  mode?: 'select' | 'popup' | 'dialog'
  size?: 'small' | 'medium' | 'large'
  showPreview?: boolean
  disabled?: boolean
  placeholder?: string
  buttonText?: string
  dialogTitle?: string
  popupTitle?: string
  popupPlacement?: 'top' | 'bottom' | 'left' | 'right'
  popupTrigger?: 'click' | 'hover'
  popupMaxWidth?: string | number
  selectAnimation?: 'fade' | 'slide' | 'zoom' | 'bounce'
  popupAnimation?: 'fade' | 'slide' | 'zoom' | 'bounce'
  customThemes?: ThemeConfig[]
  disabledBuiltinThemes?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'select',
  size: 'medium',
  showPreview: true,
  disabled: false,
  placeholder: '选择主题',
  buttonText: '主题设置',
  dialogTitle: '选择主题',
  popupTitle: '选择主题',
  popupPlacement: 'bottom',
  popupTrigger: 'click',
  popupMaxWidth: 300,
  selectAnimation: 'fade',
  popupAnimation: 'fade',
  customThemes: () => [],
  disabledBuiltinThemes: () => []
})

// Emits
const emit = defineEmits<{
  themeChange: [theme: string, mode: 'light' | 'dark']
  modeChange: [mode: 'light' | 'dark']
}>()

// 获取主题管理器
const themeManager = inject<any>('themeManager', null)

// 检查主题管理器是否可用
if (!themeManager) {
  console.warn('[ThemeSelector] themeManager 未找到，某些功能可能无法正常工作')
}

// 响应式数据
const selectedTheme = ref('blue')
const currentMode = ref<'light' | 'dark'>('light')
const showDialog = ref(false)
const showPopup = ref(false)
const showSelectDropdown = ref(false)

// 合并主题列表（内置主题 + 用户自定义主题）
const mergedThemes = computed(() => {
  // 过滤掉被禁用的内置主题
  const enabledBuiltinThemes = presetThemes.filter(
    theme => !props.disabledBuiltinThemes.includes(theme.name)
  )

  // 合并内置主题和用户自定义主题
  return [...enabledBuiltinThemes, ...props.customThemes]
})

// 分类主题（内置 vs 自定义）
const categorizedThemes = computed(() => {
  const builtin = mergedThemes.value.filter(theme => theme.builtin !== false)
  const custom = mergedThemes.value.filter(theme => theme.builtin === false)

  return { builtin, custom }
})

// 预设主题（保持向后兼容）
const themes = computed(() => mergedThemes.value)

// 计算属性
const sizeClass = computed(() => `theme-selector--${props.size}`)
const isDark = computed(() => currentMode.value === 'dark')
const currentTheme = computed(() => mergedThemes.value.find(t => t.name === selectedTheme.value))

// 为 LSelect 组件准备的选项数据
const selectOptions = computed(() => {
  return mergedThemes.value.map(theme => ({
    value: theme.name,
    label: theme.displayName || theme.name,
    description: theme.description,
    color: getThemeColor(theme, 'primary')
  }))
})

// 方法
const handleThemeChange = () => {
  // 应用主题（不传入模式参数，让applyTheme自动检测当前模式）
  applyTheme(selectedTheme.value)

  // 通知主题管理器，让它处理存储
  if (themeManager && typeof themeManager.setTheme === 'function') {
    themeManager.setTheme(selectedTheme.value, currentMode.value)
  } else {
    // 如果没有主题管理器，使用本地逻辑保存
    saveThemeToStorage(selectedTheme.value, currentMode.value)
  }
  emit('themeChange', selectedTheme.value, currentMode.value)
}

const selectTheme = (themeName: string) => {
  selectedTheme.value = themeName
  handleThemeChange()
  showDialog.value = false
}

const getThemeColor = (theme: ThemeConfig, colorKey: string) => {
  // 优先使用 colors 对象中的颜色
  if (theme.colors?.[colorKey]) {
    return theme.colors[colorKey]
  }

  // 如果没有 colors 对象，使用 light/dark 模式下的 primary 颜色
  const modeColors = theme.light || theme.dark
  if (colorKey === 'primary' && modeColors?.primary) {
    return modeColors.primary
  }

  // 为其他颜色提供默认值
  const defaultColors = {
    primary: modeColors?.primary || '#1890ff',
    secondary: '#52c41a',
    success: '#52c41a',
    warning: '#faad14',
    danger: '#ff4d4f'
  }

  return defaultColors[colorKey as keyof typeof defaultColors] || '#1890ff'
}

const getCurrentThemeColor = (colorKey: string) => {
  if (!currentTheme.value) return '#1890ff'
  return getThemeColor(currentTheme.value, colorKey)
}

const handleModeToggle = () => {
  const newMode = currentMode.value === 'light' ? 'dark' : 'light'
  setMode(newMode)
}

// 新增的方法
const toggleSelectDropdown = () => {
  if (props.disabled) return
  showSelectDropdown.value = !showSelectDropdown.value
}

const togglePopup = () => {
  if (props.disabled) return
  showPopup.value = !showPopup.value
}

const handleOverlayClick = (e: MouseEvent) => {
  const target = e.target as Element
  if (!target.closest('.theme-selector')) {
    showSelectDropdown.value = false
    showPopup.value = false
  }
  // 处理对话框遮罩点击
  if (e.target === e.currentTarget) {
    showDialog.value = false
  }
}

const setMode = (mode: 'light' | 'dark') => {
  currentMode.value = mode
  // 通知主题管理器，让它处理存储
  if (themeManager && typeof themeManager.setTheme === 'function') {
    themeManager.setTheme(selectedTheme.value, mode)
  } else {
    // 如果没有主题管理器，使用本地逻辑
    applyTheme(selectedTheme.value, mode)
    saveThemeToStorage(selectedTheme.value, mode)
  }
  emit('modeChange', mode)
}



const applyTheme = (theme: string, mode?: 'light' | 'dark') => {
  const themeData = mergedThemes.value.find(t => t.name === theme)
  if (!themeData) return

  // 如果没有传入模式，获取当前模式状态
  let currentMode = mode
  if (!currentMode) {
    // 从DOM获取当前模式
    const isDark = document.documentElement.classList.contains('dark')
    const dataThemeMode = document.documentElement.getAttribute('data-theme-mode')

    // 优先使用data-theme-mode属性，其次使用class判断
    if (dataThemeMode === 'dark' || dataThemeMode === 'light') {
      currentMode = dataThemeMode
    } else {
      currentMode = isDark ? 'dark' : 'light'
    }

    console.log(`🔍 [ThemeSelector] 检测到当前模式: ${currentMode}`)
  }

  // 获取主题颜色，优先使用 colors 对象，其次使用 light/dark 模式颜色
  const getColor = (colorKey: string) => {
    if (themeData.colors?.[colorKey]) {
      return themeData.colors[colorKey]
    }

    // 对于预设主题，使用对应模式下的 primary 颜色
    const modeColors = themeData[currentMode] || themeData.light || themeData.dark
    if (colorKey === 'primary' && modeColors?.primary) {
      return modeColors.primary
    }

    return null
  }

  // 获取主色调
  const primaryColor = getColor('primary')
  if (primaryColor) {
    // 使用增强的主题应用器，根据当前模式生成完整的色阶
    // 传入完整的主题配置以便缓存
    const themeConfig = {
      ...themeData,
      name: theme
    }
    globalThemeApplier.applyTheme(primaryColor, currentMode, themeConfig)

    console.log(`🎨 [ThemeSelector] 主题已切换: ${theme} (${currentMode} 模式，主色调: ${primaryColor})`)
  } else {
    console.warn(`[ThemeSelector] 主题 "${theme}" 没有定义主色调`)
  }

  // 注意：不在这里调用 themeManager.setTheme，避免循环调用
  // 主题管理器会在需要时调用这个方法来应用样式
}

// 本地存储键名
const THEME_STORAGE_KEY = 'ldesign-theme-selector'
const MODE_STORAGE_KEY = 'ldesign-theme-mode'

// 从本地存储加载主题设置
const loadThemeFromStorage = () => {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    const savedMode = localStorage.getItem(MODE_STORAGE_KEY) as 'light' | 'dark'

    return {
      theme: savedTheme,
      mode: savedMode || 'light'
    }
  } catch (error) {
    console.warn('[ThemeSelector] 读取本地存储失败:', error)
    return { theme: null, mode: 'light' as const }
  }
}

// 保存主题设置到本地存储
const saveThemeToStorage = (theme: string, mode: 'light' | 'dark') => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
    localStorage.setItem(MODE_STORAGE_KEY, mode)
  } catch (error) {
    console.warn('[ThemeSelector] 保存到本地存储失败:', error)
  }
}

// 初始化
onMounted(() => {
  if (themeManager) {
    try {
      // 优先使用主题管理器的状态
      if (typeof themeManager.getCurrentTheme === 'function') {
        selectedTheme.value = themeManager.getCurrentTheme() || (mergedThemes.value[0]?.name || 'blue')
      }
      if (typeof themeManager.getCurrentMode === 'function') {
        currentMode.value = themeManager.getCurrentMode() || 'light'
      }

      // 让主题管理器应用当前主题（它会处理存储）
      if (typeof themeManager.setTheme === 'function') {
        themeManager.setTheme(selectedTheme.value, currentMode.value)
      }
    } catch (error) {
      console.warn('[ThemeSelector] 主题管理器初始化失败，使用本地存储:', error)
      // 回退到本地存储逻辑
      const { theme: savedTheme, mode: savedMode } = loadThemeFromStorage()
      selectedTheme.value = savedTheme || (mergedThemes.value[0]?.name || 'blue')
      currentMode.value = savedMode
      applyTheme(selectedTheme.value)
    }
  } else {
    // 如果没有主题管理器，使用本地存储的值
    const { theme: savedTheme, mode: savedMode } = loadThemeFromStorage()
    if (savedTheme && mergedThemes.value.find(t => t.name === savedTheme)) {
      selectedTheme.value = savedTheme
    } else if (mergedThemes.value.length > 0) {
      selectedTheme.value = mergedThemes.value[0].name
    }
    currentMode.value = savedMode

    // 应用初始主题
    applyTheme(selectedTheme.value)
  }
})

// 监听主题变化
watch(() => props.customThemes, () => {
  // 当自定义主题变化时，重新检查当前选中的主题是否仍然有效
  if (selectedTheme.value && !mergedThemes.value.find(t => t.name === selectedTheme.value)) {
    // 如果当前主题不再可用，选择第一个可用主题
    if (mergedThemes.value.length > 0) {
      selectedTheme.value = mergedThemes.value[0].name
      handleThemeChange()
    }
  }
}, { deep: true })

watch(() => props.disabledBuiltinThemes, () => {
  // 当禁用列表变化时，重新检查当前选中的主题是否仍然有效
  if (selectedTheme.value && !mergedThemes.value.find(t => t.name === selectedTheme.value)) {
    // 如果当前主题被禁用，选择第一个可用主题
    if (mergedThemes.value.length > 0) {
      selectedTheme.value = mergedThemes.value[0].name
      handleThemeChange()
    }
  }
}, { deep: true })

// 监听键盘事件
watch(showDialog, (visible) => {
  if (visible) {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        showDialog.value = false
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }
})

// 点击外部关闭下拉框
onMounted(() => {
  document.addEventListener('click', handleOverlayClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOverlayClick)
})
</script>

<style scoped>
.theme-selector {
  display: inline-block;
  position: relative;
}

/* 美化的选择器样式 */
.theme-selector__select-wrapper {
  position: relative;
  width: 100%;
}

.theme-selector__select-enhanced {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 200px;
}

.theme-selector__select-enhanced:hover {
  border-color: #40a9ff;
}

.theme-selector__select-value {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.theme-selector__select-label {
  font-weight: 500;
  color: #262626;
}

.theme-selector__select-desc {
  font-size: 12px;
  color: #8c8c8c;
}

.theme-selector__select-placeholder {
  color: #bfbfbf;
}

.theme-selector__select-arrow {
  font-size: 12px;
  color: #bfbfbf;
  transition: transform 0.2s ease;
}

.theme-selector__select-arrow--open {
  transform: rotate(180deg);
}

.theme-selector__select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  margin-top: 4px;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.theme-selector__select-options {
  max-height: 200px;
  overflow-y: auto;
}

.theme-selector__select-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.theme-selector__select-option:hover {
  background: #f5f5f5;
}

.theme-selector__select-option--selected {
  background: #e6f7ff;
  color: #1890ff;
}

.theme-selector__select-option-content {
  flex: 1;
}

.theme-selector__select-option-label {
  display: block;
  font-weight: 500;
}

.theme-selector__select-option-desc {
  display: block;
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 2px;
}

.theme-selector__select-option-check {
  color: #1890ff;
  font-weight: bold;
}

.theme-selector__color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #d9d9d9;
  flex-shrink: 0;
}

/* 动画效果 */
.theme-selector-dropdown-enter-active,
.theme-selector-dropdown-leave-active {
  transition: all 0.2s ease;
}

.theme-selector-dropdown-enter-from,
.theme-selector-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 尺寸变体 */
.theme-selector--small .theme-selector__select-enhanced {
  padding: 4px 8px;
  font-size: 12px;
}

.theme-selector--large .theme-selector__select-enhanced {
  padding: 12px 16px;
  font-size: 16px;
}

/* 禁用状态 */
.theme-selector--disabled .theme-selector__select-enhanced {
  background: #f5f5f5;
  color: #bfbfbf;
  cursor: not-allowed;
}

.theme-selector--disabled .theme-selector__select-enhanced:hover {
  border-color: #d9d9d9;
}
</style>
