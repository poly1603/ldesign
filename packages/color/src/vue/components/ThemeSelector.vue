<!--
  主题选择器组件
  提供预设主题色的选择和切换功能
  支持内置主题与用户自定义主题的合并策略
  支持禁用列表配置
-->

<template>
  <div class="theme-selector" :class="[sizeClass, { 'theme-selector--disabled': disabled }]">
    <!-- 下拉选择形式 -->
    <div v-if="mode === 'select'" class="theme-selector__select-wrapper">
      <select v-model="selectedTheme" class="theme-selector__select" :disabled="disabled" @change="handleThemeChange">
        <option value="" disabled>{{ placeholder }}</option>
        <optgroup v-if="categorizedThemes.builtin.length > 0" label="内置主题">
          <option v-for="theme in categorizedThemes.builtin" :key="theme.name" :value="theme.name">
            {{ theme.displayName }}
          </option>
        </optgroup>
        <optgroup v-if="categorizedThemes.custom.length > 0" label="自定义主题">
          <option v-for="theme in categorizedThemes.custom" :key="theme.name" :value="theme.name">
            {{ theme.displayName }}
          </option>
        </optgroup>
      </select>

      <!-- 主题预览 -->
      <div v-if="showPreview && currentTheme" class="theme-selector__preview">
        <div 
          class="theme-selector__color-dot" 
          :style="{ backgroundColor: getCurrentThemeColor('primary') }"
          :title="`主色: ${getCurrentThemeColor('primary')}`" 
        />
        <div 
          class="theme-selector__color-dot" 
          :style="{ backgroundColor: getCurrentThemeColor('success') }"
          :title="`成功色: ${getCurrentThemeColor('success')}`" 
        />
        <div 
          class="theme-selector__color-dot" 
          :style="{ backgroundColor: getCurrentThemeColor('warning') }"
          :title="`警告色: ${getCurrentThemeColor('warning')}`" 
        />
      </div>
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
      <div v-if="showDialog" class="theme-selector__overlay" @click="handleOverlayClick">
        <div class="theme-selector__dialog" @click.stop>
          <!-- 对话框头部 -->
          <div class="theme-selector__header">
            <h3>{{ dialogTitle }}</h3>
            <button class="theme-selector__close" @click="showDialog = false">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
          </div>

          <!-- 内置主题选择网格 -->
          <div v-if="categorizedThemes.builtin.length > 0" class="theme-selector__themes-section">
            <label class="theme-selector__themes-label">内置主题</label>
            <div class="theme-selector__themes-grid">
              <div 
                v-for="theme in categorizedThemes.builtin" 
                :key="theme.name" 
                class="theme-selector__theme-card"
                :class="{ active: selectedTheme === theme.name }" 
                @click="selectTheme(theme.name)"
              >
                <div class="theme-selector__theme-preview">
                  <div 
                    class="theme-selector__color-dot" 
                    :style="{ backgroundColor: getThemeColor(theme, 'primary') }"
                    :title="`主色: ${getThemeColor(theme, 'primary')}`" 
                  />
                  <div 
                    class="theme-selector__color-dot" 
                    :style="{ backgroundColor: getThemeColor(theme, 'success') }"
                    :title="`成功色: ${getThemeColor(theme, 'success')}`" 
                  />
                  <div 
                    class="theme-selector__color-dot" 
                    :style="{ backgroundColor: getThemeColor(theme, 'warning') }"
                    :title="`警告色: ${getThemeColor(theme, 'warning')}`" 
                  />
                  <div 
                    class="theme-selector__color-dot" 
                    :style="{ backgroundColor: getThemeColor(theme, 'danger') }"
                    :title="`危险色: ${getThemeColor(theme, 'danger')}`" 
                  />
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
              <div 
                v-for="theme in categorizedThemes.custom" 
                :key="theme.name" 
                class="theme-selector__theme-card"
                :class="{ active: selectedTheme === theme.name }" 
                @click="selectTheme(theme.name)"
              >
                <div class="theme-selector__theme-preview">
                  <div 
                    class="theme-selector__color-dot" 
                    :style="{ backgroundColor: getThemeColor(theme, 'primary') }"
                    :title="`主色: ${getThemeColor(theme, 'primary')}`" 
                  />
                  <div 
                    class="theme-selector__color-dot" 
                    :style="{ backgroundColor: getThemeColor(theme, 'success') }"
                    :title="`成功色: ${getThemeColor(theme, 'success')}`" 
                  />
                  <div 
                    class="theme-selector__color-dot" 
                    :style="{ backgroundColor: getThemeColor(theme, 'warning') }"
                    :title="`警告色: ${getThemeColor(theme, 'warning')}`" 
                  />
                  <div 
                    class="theme-selector__color-dot" 
                    :style="{ backgroundColor: getThemeColor(theme, 'danger') }"
                    :title="`危险色: ${getThemeColor(theme, 'danger')}`" 
                  />
                </div>
                <div class="theme-selector__theme-name">{{ theme.displayName }}</div>
                <div class="theme-selector__theme-desc">{{ theme.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, inject, onMounted } from 'vue'
import { presetThemes, type ThemeConfig } from '../../themes/presets'

// Props
interface Props {
  mode?: 'select' | 'dialog'
  size?: 'small' | 'medium' | 'large'
  showPreview?: boolean
  disabled?: boolean
  placeholder?: string
  buttonText?: string
  dialogTitle?: string
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

// 方法
const handleThemeChange = () => {
  // 通知主题管理器，让它处理存储
  if (themeManager && typeof themeManager.setTheme === 'function') {
    themeManager.setTheme(selectedTheme.value, currentMode.value)
  } else {
    // 如果没有主题管理器，使用本地逻辑
    applyTheme(selectedTheme.value, currentMode.value)
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

const handleOverlayClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    showDialog.value = false
  }
}

const applyTheme = (theme: string, mode: 'light' | 'dark') => {
  const themeData = mergedThemes.value.find(t => t.name === theme)
  if (!themeData) return

  const root = document.documentElement
  
  // 获取主题颜色，优先使用 colors 对象，其次使用 light/dark 模式颜色
  const getColor = (colorKey: string) => {
    if (themeData.colors?.[colorKey]) {
      return themeData.colors[colorKey]
    }
    
    // 对于预设主题，使用对应模式下的 primary 颜色
    const modeColors = themeData[mode] || themeData.light || themeData.dark
    if (colorKey === 'primary' && modeColors?.primary) {
      return modeColors.primary
    }
    
    return null
  }

  // 设置主题色变量
  const primaryColor = getColor('primary')
  if (primaryColor) {
    root.style.setProperty('--color-primary', primaryColor)
    // 如果没有其他颜色定义，基于主色生成
    root.style.setProperty('--color-secondary', getColor('secondary') || '#52c41a')
    root.style.setProperty('--color-success', getColor('success') || '#52c41a')
    root.style.setProperty('--color-warning', getColor('warning') || '#faad14')
    root.style.setProperty('--color-danger', getColor('danger') || '#ff4d4f')
  }

  // 设置模式相关变量
  if (mode === 'dark') {
    root.style.setProperty('--color-bg', '#1a1a1a')
    root.style.setProperty('--color-surface', '#2a2a2a')
    root.style.setProperty('--color-text', '#ffffff')
    root.style.setProperty('--color-border', '#404040')
  } else {
    root.style.setProperty('--color-bg', '#ffffff')
    root.style.setProperty('--color-surface', '#f8f9fa')
    root.style.setProperty('--color-text', '#333333')
    root.style.setProperty('--color-border', '#e0e0e0')
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
      applyTheme(selectedTheme.value, currentMode.value)
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
    applyTheme(selectedTheme.value, currentMode.value)
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
</script>
