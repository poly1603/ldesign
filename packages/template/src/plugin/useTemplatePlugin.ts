/**
 * @ldesign/template - Use Template Plugin
 * 
 * Composable for using template plugin in Vue components
 */

import { inject } from 'vue'
import { TemplatePluginSymbol, type TemplatePlugin } from './index'

/**
 * Use template plugin
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useTemplatePlugin } from '@ldesign/template/plugin'
 * 
 * const template = useTemplatePlugin()
 * 
 * // Load template
 * const component = await template.loadTemplate('login', 'desktop', 'default')
 * 
 * // Get default template
 * const defaultTemplate = await template.getDefaultTemplate('login', 'desktop')
 * 
 * // Detect device
 * const device = template.detectDevice()
 * </script>
 * ```
 */
export function useTemplatePlugin(): TemplatePlugin {
  const plugin = inject<TemplatePlugin>(TemplatePluginSymbol)

  if (!plugin) {
    throw new Error(
      '[Template Plugin] useTemplatePlugin() must be used inside a component with template plugin installed.\n' +
      'Make sure you have called app.use(templatePlugin) before using this composable.'
    )
  }

  return plugin
}

/**
 * Default export
 */
export default useTemplatePlugin