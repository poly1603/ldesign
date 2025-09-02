/**
 * ThemeSelector 组件类型声明
 */

import { DefineComponent } from 'vue'

interface ThemeSelectorProps {
  mode?: 'select' | 'dialog'
  size?: 'small' | 'medium' | 'large'
  showModeToggle?: boolean
  showPreview?: boolean
  disabled?: boolean
  placeholder?: string
  buttonText?: string
  dialogTitle?: string
}

interface ThemeSelectorEmits {
  themeChange: [theme: string, mode: 'light' | 'dark']
  modeChange: [mode: 'light' | 'dark']
}

declare const ThemeSelector: DefineComponent<ThemeSelectorProps, {}, {}, {}, {}, {}, {}, ThemeSelectorEmits>

export default ThemeSelector
