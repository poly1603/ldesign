/**
 * Lit adapter - Main entry point
 */

// Web Components
export { GridStackElement } from './GridStackElement'
export { GridItemElement } from './GridItemElement'
export { GridDragSourceElement } from './GridDragSourceElement'

// Re-export for convenience
import './GridStackElement'
import './GridItemElement'
import './GridDragSourceElement'

/**
 * Register all custom elements
 * This is called automatically when importing this module
 */
export function registerGridElements(): void {
  // Elements are registered via @customElement decorators
  // This function is provided for explicit registration if needed
}













