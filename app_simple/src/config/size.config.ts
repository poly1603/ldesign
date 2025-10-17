/**
 * Size 插件配置
 */
import type { Ref } from 'vue'

export const createSizeConfig = (localeRef: Ref<string>) => ({
  locale: localeRef,
  storageKey: 'ldesign-size',
  defaultSize: 'default',
  presets: [
    {
      name: 'extra-compact',
      label: 'Extra Compact',
      description: 'Very high density for maximum content',
      baseSize: 12,
      category: 'high-density'
    },
    {
      name: 'extra-spacious',
      label: 'Extra Spacious',
      description: 'Very low density for enhanced readability',
      baseSize: 20,
      category: 'low-density'
    }
  ]
})