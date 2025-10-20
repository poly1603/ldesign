/**
 * Vue 3 plugin for @ldesign/grid
 */

import type { App, Plugin } from 'vue'
import type { GridManagerConfig } from '../../types'
import { GridManager } from '../../core/GridManager'

// Components
import GridStack from './components/GridStack.vue'
import GridItem from './components/GridItem.vue'
import GridDragSource from './components/GridDragSource.vue'

// Directives
import { vGridItem } from './directives/v-grid-item'
import { vDragSource } from './directives/v-drag-source'

export interface GridPluginOptions {
  /** Grid manager configuration */
  managerConfig?: GridManagerConfig
  /** Component name prefix */
  componentPrefix?: string
  /** Install directives */
  directives?: boolean
}

export const GridPlugin: Plugin = {
  install(app: App, options: GridPluginOptions = {}) {
    const {
      managerConfig,
      componentPrefix = 'Grid',
      directives = true
    } = options

    // Initialize GridManager with config
    if (managerConfig) {
      GridManager.getInstance(managerConfig)
    }

    // Register components
    app.component(`${componentPrefix}Stack`, GridStack)
    app.component(`${componentPrefix}Item`, GridItem)
    app.component(`${componentPrefix}DragSource`, GridDragSource)

    // Register directives
    if (directives) {
      app.directive('grid-item', vGridItem)
      app.directive('drag-source', vDragSource)
    }

    // Provide GridManager globally
    app.provide('grid-manager', GridManager.getInstance())

    // Add global properties
    app.config.globalProperties.$grid = {
      manager: GridManager.getInstance(),
      create: (container: HTMLElement, options: any) => {
        return GridManager.getInstance().create(container, options)
      }
    }
  }
}

// Export default
export default GridPlugin













