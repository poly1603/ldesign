/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 声明 @ldesign/theme 模块（临时）
declare module '@ldesign/theme' {
  export function initializeWidgetSystem(options: any): void
  export function switchTheme(theme: string): Promise<void>
  export function getCurrentTheme(): string
  export function applyWidget(element: HTMLElement, type: string): void
  export const globalWidgetManager: any
  export const globalThemeSwitcher: any
  export const allFestivalThemes: any
  export type SupportedThemeId = 'default' | 'spring-festival' | 'christmas'
}

// 声明 @ldesign/color 模块（临时）
declare module '@ldesign/color' {
  export class ThemeManager {
    constructor(options: any)
    init(): Promise<void>
    setTheme(theme: string): Promise<void>
  }
}
