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

// 获取主题管理器
const themeManager = inject<any>('themeManager')

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

// 应用主题到 DOM
function applyTheme(dark: boolean): void {
  const root = document.documentElement
  
  // 设置 data 属性
  root.setAttribute('data-theme-mode', dark ? 'dark' : 'light')
  
  // 设置 CSS 类
  if (dark) {
    root.classList.add('dark')
    root.classList.remove('light')
  } else {
    root.classList.add('light')
    root.classList.remove('dark')
  }
  
  // 设置 CSS 变量（与 ThemeSelector 保持一致）
  if (dark) {
    root.style.setProperty('--color-bg', '#0f0f0f')
    root.style.setProperty('--color-surface', '#1a1a1a')
    root.style.setProperty('--color-surface-variant', '#2a2a2a')
    root.style.setProperty('--color-text', '#ffffff')
    root.style.setProperty('--color-text-secondary', '#a3a3a3')
    root.style.setProperty('--color-border', '#404040')
    root.style.setProperty('--color-shadow', 'rgba(0, 0, 0, 0.5)')
  } else {
    root.style.setProperty('--color-bg', '#ffffff')
    root.style.setProperty('--color-surface', '#f8f9fa')
    root.style.setProperty('--color-surface-variant', '#f1f3f4')
    root.style.setProperty('--color-text', '#1f2937')
    root.style.setProperty('--color-text-secondary', '#6b7280')
    root.style.setProperty('--color-border', '#e5e7eb')
    root.style.setProperty('--color-shadow', 'rgba(0, 0, 0, 0.1)')
  }
  
  // 注意：不在这里调用 themeManager.setMode，避免循环调用
  // 主题管理器会在需要时调用这个方法来应用样式
}

// 使用 View Transition API 的主题切换
async function toggleWithTransition(): Promise<void> {
  if (!supportsViewTransition.value) {
    // 降级处理：直接切换
    const newMode = !isDark.value
    isDark.value = newMode
    applyTheme(newMode)
    return
  }

  isAnimating.value = true
  
  try {
    // 使用 View Transition API
    const transition = (document as any).startViewTransition(() => {
      const newMode = !isDark.value
      isDark.value = newMode
      applyTheme(newMode)
    })
    
    // 等待动画完成
    await transition.finished
  } catch (error) {
    console.warn('[DarkModeToggle] View Transition 失败，使用降级方案:', error)
    // 降级处理
    const newMode = !isDark.value
    isDark.value = newMode
    applyTheme(newMode)
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
    applyTheme(newMode)
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
      applyTheme(newMode)
    })
    
    // 等待动画完成
    await transition.finished
  } catch (error) {
    console.warn('[DarkModeToggle] Circle Transition 失败，使用降级方案:', error)
    // 降级处理
    const newMode = !isDark.value
    isDark.value = newMode
    applyTheme(newMode)
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
      applyTheme(e.matches)
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
  applyTheme(isDark.value)
  
  // 设置系统主题监听
  setupSystemThemeListener()
})

// 注意：不在这里监听 isDark 变化来调用 themeManager.setMode
// 避免循环调用，主题管理器的状态变化会通过其他方式同步到组件
</script>

<style scoped>
.dark-mode-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 8px;
  background: var(--color-surface, #ffffff);
  color: var(--color-text, #1f2937);
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
}

.dark-mode-toggle:hover {
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 2px 8px var(--color-shadow, rgba(0, 0, 0, 0.1));
}

.dark-mode-toggle:active {
  transform: scale(0.98);
}

.dark-mode-toggle--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.dark-mode-toggle--animating {
  pointer-events: none;
}

/* 尺寸变体 */
.dark-mode-toggle--small {
  width: 32px;
  height: 32px;
  padding: 6px;
}

.dark-mode-toggle--medium {
  width: 40px;
  height: 40px;
  padding: 8px;
}

.dark-mode-toggle--large {
  width: 48px;
  height: 48px;
  padding: 10px;
}

/* 图标样式 */
.dark-mode-toggle__icon {
  width: 100%;
  height: 100%;
  transition: all 0.3s ease;
}

.dark-mode-toggle__sun {
  color: #f59e0b;
}

.dark-mode-toggle__moon {
  color: #6366f1;
}

/* 加载动画 */
.dark-mode-toggle__spinner {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface, #ffffff);
}

.dark-mode-toggle__spinner svg {
  width: 60%;
  height: 60%;
  animation: spin 1s linear infinite;
}

.dark-mode-toggle__spinner circle {
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

/* 暗色模式样式 */
.dark-mode-toggle--dark {
  background: var(--color-surface, #1a1a1a);
  border-color: var(--color-border, #404040);
  color: var(--color-text, #ffffff);
}

.dark-mode-toggle--dark:hover {
  border-color: var(--color-primary, #60a5fa);
}

/* 圆形扩散动画 - View Transition API */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.6s;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* 从点击点扩散的圆形动画 */
@media (prefers-reduced-motion: no-preference) {
  ::view-transition-old(root) {
    animation-name: circle-shrink;
    clip-path: circle(var(--max-radius) at var(--click-x) var(--click-y));
  }
  
  ::view-transition-new(root) {
    animation-name: circle-expand;
    clip-path: circle(0 at var(--click-x) var(--click-y));
  }
}

@keyframes circle-expand {
  from {
    clip-path: circle(0 at var(--click-x) var(--click-y));
  }
  to {
    clip-path: circle(var(--max-radius) at var(--click-x) var(--click-y));
  }
}

@keyframes circle-shrink {
  from {
    clip-path: circle(var(--max-radius) at var(--click-x) var(--click-y));
  }
  to {
    clip-path: circle(0 at var(--click-x) var(--click-y));
  }
}

/* 降级动画（不支持 prefers-reduced-motion 或旧浏览器） */
::view-transition-old(root) {
  animation-name: fade-out;
}

::view-transition-new(root) {
  animation-name: fade-in;
}

@keyframes fade-out {
  to {
    opacity: 0;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
}
</style>