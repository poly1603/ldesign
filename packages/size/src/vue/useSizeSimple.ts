import { inject, ref, onMounted, onBeforeUnmount } from 'vue'
import { SIZE_MANAGER_KEY } from './pluginSimple'
import type { SizeConfig } from '../core/SizeManagerSimple'

export function useSize() {
  const manager = inject(SIZE_MANAGER_KEY)
  
  if (!manager) {
    throw new Error('Size plugin not installed. Please install the size plugin before using useSize.')
  }

  const config = ref<SizeConfig>(manager.getConfig())
  const currentPreset = ref<string>(manager.getCurrentPreset())

  const unsubscribe = manager.subscribe((newConfig) => {
    config.value = newConfig
    currentPreset.value = manager.getCurrentPreset()
  })

  onBeforeUnmount(() => {
    unsubscribe()
  })

  return {
    config,
    currentPreset,
    setBaseSize: (baseSize: number) => manager.setBaseSize(baseSize),
    applyPreset: (presetName: string) => manager.applyPreset(presetName),
    getPresets: () => manager.getPresets()
  }
}
