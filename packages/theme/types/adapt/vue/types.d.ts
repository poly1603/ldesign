import { Ref, ComputedRef, InjectionKey } from 'vue'
import {
  ThemeManagerInstance,
  ThemeConfig,
  DecorationConfig,
  AnimationConfig,
  ThemeEventType,
  ThemeEventListener,
} from '../../core/types.js'

/**
 * @ldesign/theme - Vue 适配类型定义
 *
 * 定义 Vue 集成相关的类型
 */

/**
 * Vue 主题提供者属性
 */
interface VueThemeProviderProps {
  theme?: string
  themes?: ThemeConfig[]
  autoActivate?: boolean
  debug?: boolean
}
/**
 * Vue 主题上下文
 */
interface VueThemeContext {
  themeManager: ThemeManagerInstance
  currentTheme: Ref<string | undefined>
  availableThemes: ComputedRef<string[]>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}
/**
 * Vue 主题上下文注入键
 */
declare const VueThemeContextKey: InjectionKey<VueThemeContext>
/**
 * useTheme 组合式函数返回类型
 */
interface UseThemeReturn {
  currentTheme: Ref<string | undefined>
  availableThemes: ComputedRef<string[]>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
  setTheme: (name: string) => Promise<void>
  getTheme: (name: string) => ThemeConfig | undefined
  addTheme: (theme: ThemeConfig) => void
  removeTheme: (name: string) => void
  on: (event: ThemeEventType, listener: ThemeEventListener) => void
  off: (event: ThemeEventType, listener: ThemeEventListener) => void
}
/**
 * useThemeDecorations 组合式函数返回类型
 */
interface UseThemeDecorationsReturn {
  decorations: Ref<DecorationConfig[]>
  addDecoration: (decoration: DecorationConfig) => void
  removeDecoration: (id: string) => void
  updateDecoration: (id: string, updates: Partial<DecorationConfig>) => void
  clearDecorations: () => void
  isDecorationVisible: (id: string) => ComputedRef<boolean>
  getDecoration: (id: string) => ComputedRef<DecorationConfig | undefined>
}
/**
 * useThemeAnimations 组合式函数返回类型
 */
interface UseThemeAnimationsReturn {
  animations: Ref<AnimationConfig[]>
  startAnimation: (name: string) => void
  stopAnimation: (name: string) => void
  pauseAnimation: (name: string) => void
  resumeAnimation: (name: string) => void
  isAnimationRunning: (name: string) => ComputedRef<boolean>
  getAnimation: (name: string) => ComputedRef<AnimationConfig | undefined>
}
/**
 * 主题组件基础属性
 */
interface ThemeComponentProps {
  theme?: string
  decoration?: string | DecorationConfig
  animation?: string | AnimationConfig
  disabled?: boolean
  class?: string | string[] | Record<string, boolean>
  style?: string | Record<string, any>
}
/**
 * 主题按钮组件属性
 */
interface ThemeButtonProps extends ThemeComponentProps {
  type?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  icon?: string
  iconPosition?: 'left' | 'right'
  block?: boolean
  round?: boolean
  circle?: boolean
  ghost?: boolean
}
/**
 * 主题卡片组件属性
 */
interface ThemeCardProps extends ThemeComponentProps {
  title?: string
  subtitle?: string
  cover?: string
  hoverable?: boolean
  bordered?: boolean
  shadow?: 'never' | 'hover' | 'always'
  bodyStyle?: Record<string, any>
  headStyle?: Record<string, any>
}
/**
 * 主题容器组件属性
 */
interface ThemeContainerProps extends ThemeComponentProps {
  fluid?: boolean
  centered?: boolean
  maxWidth?: string | number
  padding?: string | number
  margin?: string | number
}
/**
 * 主题装饰组件属性
 */
interface ThemeDecorationProps {
  decoration: string | DecorationConfig
  visible?: boolean
  interactive?: boolean
  zIndex?: number
  container?: string | HTMLElement
}
/**
 * 主题动画组件属性
 */
interface ThemeAnimationProps {
  animation: string | AnimationConfig
  autoplay?: boolean
  loop?: boolean
  duration?: number
  delay?: number
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
}
/**
 * 主题选择器组件属性
 */
interface ThemeSelectorProps {
  themes?: string[]
  value?: string
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  filterable?: boolean
  size?: 'small' | 'medium' | 'large'
  placement?: 'top' | 'bottom' | 'left' | 'right'
}
/**
 * 主题切换器组件属性
 */
interface ThemeToggleProps {
  themes?: [string, string]
  value?: string
  size?: 'small' | 'medium' | 'large'
  showLabel?: boolean
  disabled?: boolean
  loading?: boolean
}
/**
 * 主题预览组件属性
 */
interface ThemePreviewProps {
  theme: string | ThemeConfig
  width?: string | number
  height?: string | number
  interactive?: boolean
  showInfo?: boolean
  showControls?: boolean
}
/**
 * Vue 指令绑定值类型
 */
interface VueDirectiveBinding<T = any> {
  value: T
  oldValue: T
  arg?: string
  modifiers: Record<string, boolean>
  instance: any
  dir: any
}
/**
 * v-theme-decoration 指令绑定值
 */
interface VThemeDecorationBinding {
  decoration: string | DecorationConfig
  visible?: boolean
  interactive?: boolean
  container?: string | HTMLElement
}
/**
 * v-theme-animation 指令绑定值
 */
interface VThemeAnimationBinding {
  animation: string | AnimationConfig
  autoplay?: boolean
  trigger?: 'hover' | 'click' | 'visible' | 'manual'
  once?: boolean
}
/**
 * Vue 插件选项
 */
interface VueThemePluginOptions {
  themes?: ThemeConfig[]
  defaultTheme?: string
  autoActivate?: boolean
  globalProperties?: boolean
  components?: boolean
  directives?: boolean
  debug?: boolean
}
/**
 * Vue 全局属性
 */
interface VueThemeGlobalProperties {
  $theme: ThemeManagerInstance
  $setTheme: (name: string) => Promise<void>
  $getCurrentTheme: () => string | undefined
  $getAvailableThemes: () => string[]
}
/**
 * Vue 组件实例类型扩展
 */
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties extends VueThemeGlobalProperties {}
}
/**
 * Vue 组件选项类型扩展
 */
declare module '@vue/runtime-core' {
  interface ComponentCustomOptions {
    theme?: string | ThemeConfig
    decorations?: DecorationConfig[]
    animations?: AnimationConfig[]
  }
}
/**
 * Vue 应用配置类型扩展
 */
declare module '@vue/runtime-core' {
  interface AppConfig {
    theme?: VueThemePluginOptions
  }
}

export {
  AnimationConfig,
  DecorationConfig,
  ThemeConfig,
  ThemeEventListener,
  ThemeEventType,
  ThemeManagerInstance,
  VueThemeContextKey,
}
export type {
  ThemeAnimationProps,
  ThemeButtonProps,
  ThemeCardProps,
  ThemeComponentProps,
  ThemeContainerProps,
  ThemeDecorationProps,
  ThemePreviewProps,
  ThemeSelectorProps,
  ThemeToggleProps,
  UseThemeAnimationsReturn,
  UseThemeDecorationsReturn,
  UseThemeReturn,
  VThemeAnimationBinding,
  VThemeDecorationBinding,
  VueDirectiveBinding,
  VueThemeContext,
  VueThemeGlobalProperties,
  VueThemePluginOptions,
  VueThemeProviderProps,
}
