/**
 * @ldesign/color - Use Color Plugin
 * 
 * Composable for using color plugin in Vue components
 */

import { inject } from 'vue'
import { type ColorPlugin, ColorPluginSymbol } from './index'

/**
 * Use color plugin
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useColorPlugin } from '@ldesign/color/plugin'
 * 
 * const color = useColorPlugin()
 * 
 * // Apply theme
 * await color.applyPresetTheme('blue')
 * 
 * // Get current theme
 * const theme = color.getCurrentTheme()
 * </script>
 * ```
 */
export function useColorPlugin(): ColorPlugin {
  const plugin = inject<ColorPlugin>(ColorPluginSymbol)

  if (!plugin) {
    throw new Error(
      '[Color Plugin] useColorPlugin() must be used inside a component with color plugin installed.\n' +
      'Make sure you have called app.use(colorPlugin) before using this composable.'
    )
  }

  return plugin
}
