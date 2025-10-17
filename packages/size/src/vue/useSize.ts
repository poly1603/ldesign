import type { SizeScheme } from '../core/SizeManager'
import { inject, onBeforeUnmount, ref } from 'vue'
import { SIZE_MANAGER_KEY } from './plugin'

export function useSize() {
  const manager = inject(SIZE_MANAGER_KEY) as any

  if (!manager) {
    // 静默使用默认值
    return {
      config: ref<SizeScheme>({ baseSize: 14 } as SizeScheme),
      currentPreset: ref<string>('medium'),
      setBaseSize: () => { },
      applyPreset: () => { },
      getPresets: () => [
        { name: 'small', baseSize: 12 },
        { name: 'medium', baseSize: 14 },
        { name: 'large', baseSize: 16 }
      ]
    }
  }

  const actualManager = manager.manager || manager
  const config = ref<SizeScheme>(actualManager?.getConfig?.() || { baseSize: 14 } as SizeScheme)
  const currentPreset = ref<string>(actualManager?.getCurrentPreset?.() || 'medium')

  let unsubscribe: () => void = () => { }

  try {
    const subscribe = actualManager?.subscribe
    if (subscribe && typeof subscribe === 'function') {
      unsubscribe = subscribe((newConfig: SizeScheme) => {
        config.value = newConfig
        currentPreset.value = actualManager?.getCurrentPreset?.() || 'medium'
      })
    }
  } catch (error) {
    // 静默处理，不影响组件功能
  }

  onBeforeUnmount(() => {
    unsubscribe()
  })

  return {
    config,
    currentPreset,
    setBaseSize: (baseSize: number) => {
      try {
        if (actualManager?.setBaseSize) actualManager.setBaseSize(baseSize)
      } catch (error) {
        console.warn('setBaseSize failed:', error)
      }
    },
    applyPreset: (presetName: string) => {
      try {
        if (actualManager?.applyPreset) actualManager.applyPreset(presetName)
      } catch (error) {
        console.warn('applyPreset failed:', error)
      }
    },
    getPresets: () => {
      try {
        if (actualManager?.getPresets) return actualManager.getPresets()
      } catch (error) {
        console.warn('getPresets failed:', error)
      }
      return []
    }
  }
}
