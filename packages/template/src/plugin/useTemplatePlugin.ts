/**
 * @ldesign/template - Use Template Plugin
 * 
 * Composable for using template plugin in Vue components
 */

import { inject } from 'vue'
import { type TemplatePlugin, TemplatePluginSymbol } from './createPlugin'

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
export function useTemplatePlugin(): TemplatePlugin | null {
  const plugin = inject<TemplatePlugin>(TemplatePluginSymbol, null)
  
  // 返回 null 而不是抛出错误，让组件可以降级处理
  if (!plugin && import.meta.env.DEV) {
    console.warn(
      '[Template Plugin] useTemplatePlugin() called without plugin installed.\n' +
      'Make sure you have called app.use(templatePlugin) before using this composable.'
    )
  }

  return plugin
}

/**
 * Default export
 */
export default useTemplatePlugin