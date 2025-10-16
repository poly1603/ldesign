/**
 * @ldesign/size - Use Size Plugin
 * 
 * Composable for using size plugin in Vue components
 */

import { inject, ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { SizePluginSymbol, type SizePlugin } from './index'
import type { SizeConfig, SizePreset } from '../core/SizeManager'

/**
 * Use size plugin
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useSize } from '@ldesign/size'
 * 
 * const { currentPreset, presets, applyPreset, scale, setScale } = useSize()
 * 
 * // Apply a preset
 * await applyPreset('compact')
 * 
 * // Adjust scale
 * setScale(1.2)
 * </script>
 * ```
 */
export function useSize() {
  const plugin = inject<SizePlugin>(SizePluginSymbol)

  if (!plugin) {
    throw new Error(
      '[Size Plugin] useSize() must be used inside a component with size plugin installed.\n' +
      'Make sure you have called app.use(sizePlugin) before using this composable.'
    )
  }

  // Reactive state
  const currentConfig = ref<SizeConfig>(plugin.getCurrentConfig())
  const presets = ref<SizePreset[]>(plugin.getPresets())

  // Computed properties
  const currentPreset = computed(() => currentConfig.value.presetName || 'custom')
  const baseSize = computed(() => currentConfig.value.baseSize)
  const scale = computed(() => currentConfig.value.scale)
  const isCompact = computed(() => currentConfig.value.presetName === 'compact')
  const isComfortable = computed(() => currentConfig.value.presetName === 'comfortable')
  const isSpacious = computed(() => currentConfig.value.presetName === 'spacious')

  // Methods
  const applyPreset = async (name: string) => {
    await plugin.applyPreset(name)
    currentConfig.value = plugin.getCurrentConfig()
  }

  const setBaseSize = async (size: number) => {
    await plugin.setBaseSize(size)
    currentConfig.value = plugin.getCurrentConfig()
  }

  const setScale = async (scale: number) => {
    await plugin.setScale(scale)
    currentConfig.value = plugin.getCurrentConfig()
  }

  const increaseScale = async (step: number = 0.1) => {
    const newScale = Math.min(2, currentConfig.value.scale + step)
    await setScale(newScale)
  }

  const decreaseScale = async (step: number = 0.1) => {
    const newScale = Math.max(0.5, currentConfig.value.scale - step)
    await setScale(newScale)
  }

  const resetScale = async () => {
    await setScale(1)
  }

  const addCustomPreset = (preset: SizePreset) => {
    plugin.addPreset(preset)
    presets.value = plugin.getPresets()
  }

  const removeCustomPreset = (name: string) => {
    plugin.removePreset(name)
    presets.value = plugin.getPresets()
  }

  // Subscribe to changes
  let unsubscribe: (() => void) | null = null

  onMounted(() => {
    unsubscribe = plugin.onChange((config) => {
      currentConfig.value = config
    })
  })

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  return {
    // State
    currentConfig,
    currentPreset,
    presets,
    baseSize,
    scale,
    isCompact,
    isComfortable,
    isSpacious,

    // Methods
    applyPreset,
    setBaseSize,
    setScale,
    increaseScale,
    decreaseScale,
    resetScale,
    addCustomPreset,
    removeCustomPreset,

    // Plugin instance (for advanced usage)
    plugin
  }
}

/**
 * Use size variables
 * Returns computed CSS variables for use in templates
 */
export function useSizeVars() {
  const { scale, baseSize } = useSize()

  return {
    // Text sizes
    textXs: computed(() => `calc(var(--ld-text-xs) * ${scale.value})`),
    textSm: computed(() => `calc(var(--ld-text-sm) * ${scale.value})`),
    textBase: computed(() => `calc(var(--ld-text-base) * ${scale.value})`),
    textLg: computed(() => `calc(var(--ld-text-lg) * ${scale.value})`),
    textXl: computed(() => `calc(var(--ld-text-xl) * ${scale.value})`),
    text2xl: computed(() => `calc(var(--ld-text-2xl) * ${scale.value})`),
    text3xl: computed(() => `calc(var(--ld-text-3xl) * ${scale.value})`),
    text4xl: computed(() => `calc(var(--ld-text-4xl) * ${scale.value})`),

    // Spacing
    space1: computed(() => `calc(var(--ld-space-1) * ${scale.value})`),
    space2: computed(() => `calc(var(--ld-space-2) * ${scale.value})`),
    space3: computed(() => `calc(var(--ld-space-3) * ${scale.value})`),
    space4: computed(() => `calc(var(--ld-space-4) * ${scale.value})`),
    space5: computed(() => `calc(var(--ld-space-5) * ${scale.value})`),
    space6: computed(() => `calc(var(--ld-space-6) * ${scale.value})`),
    space8: computed(() => `calc(var(--ld-space-8) * ${scale.value})`),
    space10: computed(() => `calc(var(--ld-space-10) * ${scale.value})`),
    space12: computed(() => `calc(var(--ld-space-12) * ${scale.value})`),
    space16: computed(() => `calc(var(--ld-space-16) * ${scale.value})`),
    space20: computed(() => `calc(var(--ld-space-20) * ${scale.value})`),
    space24: computed(() => `calc(var(--ld-space-24) * ${scale.value})`),

    // Border radius
    radiusSm: computed(() => `calc(var(--ld-radius-sm) * ${scale.value})`),
    radiusMd: computed(() => `calc(var(--ld-radius-md) * ${scale.value})`),
    radiusLg: computed(() => `calc(var(--ld-radius-lg) * ${scale.value})`),
    radiusXl: computed(() => `calc(var(--ld-radius-xl) * ${scale.value})`),
    radius2xl: computed(() => `calc(var(--ld-radius-2xl) * ${scale.value})`),
    radiusFull: computed(() => `var(--ld-radius-full)`),

    // Line heights
    lineNone: computed(() => `var(--ld-line-none)`),
    lineTight: computed(() => `var(--ld-line-tight)`),
    lineSnug: computed(() => `var(--ld-line-snug)`),
    lineNormal: computed(() => `var(--ld-line-normal)`),
    lineRelaxed: computed(() => `var(--ld-line-relaxed)`),
    lineLoose: computed(() => `var(--ld-line-loose)`),
  }
}