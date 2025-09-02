<!--
  暗黑模式切换组件
  使用 View Transition API 实现炫酷的切换动画效果
  组件内部完整封装所有事件处理逻辑，外部使用时无需处理任何事件
-->

<template>
  <button
    class="dark-mode-toggle"
    :class="[
      sizeClass,
      {
        'dark-mode-toggle--dark': isDark,
        'dark-mode-toggle--disabled': disabled,
        'dark-mode-toggle--animating': isAnimating
      }
    ]"
    :disabled="disabled"
    :title="isDark ? '切换到亮色模式' : '切换到暗色模式'"
    @click="handleToggle"
  >
    <!-- 太阳图标 (亮色模式) -->
    <svg
      v-show="!isDark"
      class="dark-mode-toggle__icon dark-mode-toggle__sun"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>

    <!-- 月亮图标 (暗色模式) -->
    <svg
      v-show="isDark"
      class="dark-mode-toggle__icon dark-mode-toggle__moon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>

    <!-- 加载动画 -->
    <div v-if="isAnimating" class="dark-mode-toggle__spinner">
      <svg viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="2"
          stroke-dasharray="31.416"
          stroke-dashoffset="31.416"
        />
      </svg>
    </div>
  </button>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted, watch } from 'vue'
import { globalThemeApplier } from '../../utils/css-variables'

// Props
interface Props {
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  autoDetect?: boolean
  storageKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  disabled: false,
  autoDetect: true,
  storageKey: 'ldesign-dark-mode'
})

// Emits
const emit = defineEmits<{
  change: [isDark: boolean]
  beforeChange: [isDark: boolean]
  afterChange: [isDark: boolean]
}>()

// 获取主题管理器（带错误处理）
const themeManager = inject<any>('themeManager', null)

// 响应式数据
const isDark = ref(false)
const isAnimating = ref(false)
const supportsViewTransition = ref(false)

// 计算属性
const sizeClass = computed(() => `dark-mode-toggle--${props.size}`)

// 检查浏览器是否支持 View Transition API
function checkViewTransitionSupport(): boolean {
  return typeof document !== 'undefined' && 'startViewTransition' in document
}

// 获取系统主题偏好
function getSystemTheme(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

// 从存储中读取主题设置
function loadThemeFromStorage(): boolean | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const stored = localStorage.getItem(props.storageKey)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

// 保存主题设置到存储
function saveThemeToStorage(dark: boolean): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(props.storageKey, JSON.stringify(dark))
  } catch (error) {
    console.warn('[DarkModeToggle] 保存主题设置失败:', error)
  }
}

// 应用模式切换到 DOM（只切换data-theme-mode属性，不重新生成CSS）
function applyModeSwitch(dark: boolean): void {
  const mode = dark ? 'dark' : 'light'

  // 使用新的模式切换方法，只切换data-theme-mode属性
  globalThemeApplier.switchMode(mode)

  console.log(`🌓 [DarkModeToggle] 模式已切换: ${mode} (仅切换属性，CSS自动应用)`)

  // 注意：不在这里调用 themeManager.setMode，避免循环调用
  // 主题管理器会在需要时调用这个方法来应用样式
}

// 使用 View Transition API 的模式切换
async function toggleWithTransition(): Promise<void> {
  if (!supportsViewTransition.value) {
    // 降级处理：直接切换
    const newMode = !isDark.value
    isDark.value = newMode
    applyModeSwitch(newMode)
    return
  }

  isAnimating.value = true

  try {
    // 使用 View Transition API
    const transition = (document as any).startViewTransition(() => {
      const newMode = !isDark.value
      isDark.value = newMode
      applyModeSwitch(newMode)
    })

    // 等待动画完成
    await transition.finished
  } catch (error) {
    console.warn('[DarkModeToggle] View Transition 失败，使用降级方案:', error)
    // 降级处理
    const newMode = !isDark.value
    isDark.value = newMode
    applyModeSwitch(newMode)
  } finally {
    isAnimating.value = false
  }
}

// 使用圆形扩散动画的主题切换
async function toggleWithCircleTransition(clickX: number, clickY: number): Promise<void> {
  if (!supportsViewTransition.value) {
    // 降级处理：直接切换
    const newMode = !isDark.value
    isDark.value = newMode
    applyModeSwitch(newMode)
    return
  }

  try {
    // 计算扩散半径（从点击点到页面最远角的距离）
    const maxRadius = Math.hypot(
      Math.max(clickX, window.innerWidth - clickX),
      Math.max(clickY, window.innerHeight - clickY)
    )

    // 设置CSS变量用于动画
    document.documentElement.style.setProperty('--click-x', `${clickX}px`)
    document.documentElement.style.setProperty('--click-y', `${clickY}px`)
    document.documentElement.style.setProperty('--max-radius', `${maxRadius}px`)

    // 使用 View Transition API
    const transition = (document as any).startViewTransition(() => {
      const newMode = !isDark.value
      isDark.value = newMode
      applyModeSwitch(newMode)
    })
    
    // 等待动画完成
    await transition.finished
  } catch (error) {
    console.warn('[DarkModeToggle] Circle Transition 失败，使用降级方案:', error)
    // 降级处理
    const newMode = !isDark.value
    isDark.value = newMode
    applyModeSwitch(newMode)
  }
}

// 处理切换事件
async function handleToggle(event: MouseEvent): Promise<void> {
  if (props.disabled || isAnimating.value) return
  
  const newMode = !isDark.value
  
  // 触发 beforeChange 事件
  emit('beforeChange', newMode)
  
  isAnimating.value = true
  
  try {
    // 获取点击位置
    const clickX = event.clientX
    const clickY = event.clientY
    
    // 使用圆形扩散动画进行主题切换
    await toggleWithCircleTransition(clickX, clickY)
    
    // 通知主题管理器处理存储和状态同步
    if (themeManager && typeof themeManager.setMode === 'function') {
      try {
        themeManager.setMode(isDark.value ? 'dark' : 'light')
      } catch (error) {
        console.warn('[DarkModeToggle] 主题管理器设置失败:', error)
        // 回退到本地存储
        saveThemeToStorage(isDark.value)
      }
    } else {
      // 如果没有主题管理器，使用本地存储
      saveThemeToStorage(isDark.value)
    }
    
    // 触发事件
    emit('change', isDark.value)
    emit('afterChange', isDark.value)
  } catch (error) {
    console.error('[DarkModeToggle] 切换失败:', error)
  } finally {
    isAnimating.value = false
  }
}

// 监听系统主题变化
function setupSystemThemeListener(): void {
  if (typeof window === 'undefined' || !props.autoDetect) return
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    // 只有在没有用户设置时才跟随系统
    const storedTheme = loadThemeFromStorage()
    if (storedTheme === null) {
      isDark.value = e.matches
      applyModeSwitch(e.matches)
      emit('change', e.matches)
    }
  }
  
  // 现代浏览器
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleSystemThemeChange)
  } else {
    // 兼容旧浏览器
    mediaQuery.addListener(handleSystemThemeChange)
  }
}

// 初始化
onMounted(() => {
  // 检查 View Transition 支持
  supportsViewTransition.value = checkViewTransitionSupport()
  
  // 优先从主题管理器获取状态
  if (themeManager && typeof themeManager.getCurrentMode === 'function') {
    try {
      const currentMode = themeManager.getCurrentMode()
      if (currentMode) {
        isDark.value = currentMode === 'dark'
      } else {
        // 主题管理器没有状态，使用本地逻辑
        const storedTheme = loadThemeFromStorage()
        if (storedTheme !== null) {
          isDark.value = storedTheme
        } else if (props.autoDetect) {
          isDark.value = getSystemTheme()
        }
      }
    } catch (error) {
      console.warn('[DarkModeToggle] 从主题管理器同步状态失败，使用本地存储:', error)
      // 回退到本地存储逻辑
      const storedTheme = loadThemeFromStorage()
      if (storedTheme !== null) {
        isDark.value = storedTheme
      } else if (props.autoDetect) {
        isDark.value = getSystemTheme()
      }
    }
  } else {
    // 没有主题管理器，使用本地存储逻辑
    const storedTheme = loadThemeFromStorage()
    if (storedTheme !== null) {
      isDark.value = storedTheme
    } else if (props.autoDetect) {
      isDark.value = getSystemTheme()
    }
  }
  
  // 应用初始主题
  applyModeSwitch(isDark.value)
  
  // 设置系统主题监听
  setupSystemThemeListener()
})

// 注意：不在这里监听 isDark 变化来调用 themeManager.setMode
// 避免循环调用，主题管理器的状态变化会通过其他方式同步到组件
</script>