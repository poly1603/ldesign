/**
 * Color 插件配置
 */
import type { Ref } from 'vue'

export const createColorConfig = (localeRef: Ref<string>) => ({
  locale: localeRef,
  prefix: 'ld',
  storageKey: 'ldesign-theme',
  persistence: true,
  presets: 'all' as const,
  autoApply: true,
  defaultTheme: 'blue',
  includeSemantics: true,
  includeGrays: true,
  customThemes: [
    {
      name: 'sunset',
      label: 'Sunset Orange',
      color: '#ff6b35',
      custom: true,
      order: 100
    },
    {
      name: 'forest',
      label: 'Forest Green',
      color: '#2d6a4f',
      custom: true,
      order: 101
    },
    {
      name: 'midnight',
      label: 'Midnight Blue',
      color: '#1a1b41',
      custom: true,
      order: 102
    },
    {
      name: 'lavender',
      label: 'Lavender Dream',
      color: '#9b59b6',
      custom: true,
      order: 103
    },
    {
      name: 'coral',
      label: 'Coral Reef',
      color: '#ff7f50',
      custom: true,
      order: 104
    }
  ],
  hooks: {
    afterChange: (theme: any) => {
      if (import.meta.env.DEV) {
        console.log('[theme] changed ->', theme.themeName || theme.primaryColor)
      }
    }
  }
})