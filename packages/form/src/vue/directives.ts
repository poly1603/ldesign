/**
 * @fileoverview Vue 3 directives for form system
 * @author LDesign Team
 */

import type { Directive, DirectiveBinding } from 'vue'
import type { FormValidateDirectiveValue, FormFocusDirectiveValue } from '../types'

/**
 * v-form-validate directive
 * Automatically validates form fields
 */
export const vFormValidate: Directive<HTMLElement, FormValidateDirectiveValue> = {
  mounted(el, binding) {
    const { value } = binding
    if (!value) return

    const { rules = [], trigger = 'blur', errorPlacement = 'bottom' } = value

    // Store original styles
    const originalBorder = el.style.border
    const originalBoxShadow = el.style.boxShadow

    // Validation function
    const validate = async () => {
      // This would integrate with the validation engine
      // For now, just a placeholder
      console.log('Validating field with rules:', rules)

      // Add error styles (example)
      if (Math.random() > 0.7) { // Simulate validation failure
        el.style.border = '1px solid #ff4d4f'
        el.style.boxShadow = '0 0 0 2px rgba(255, 77, 79, 0.2)'

        // Show error message
        showErrorMessage(el, '验证失败', errorPlacement)
      } else {
        // Reset styles
        el.style.border = originalBorder
        el.style.boxShadow = originalBoxShadow

        // Hide error message
        hideErrorMessage(el)
      }
    }

    // Add event listeners based on trigger
    if (trigger === 'change' || trigger === 'input') {
      el.addEventListener('input', validate)
    } else if (trigger === 'blur') {
      el.addEventListener('blur', validate)
    }

    // Store cleanup function
    (el as any).__formValidateCleanup = () => {
      el.removeEventListener('input', validate)
      el.removeEventListener('blur', validate)
      hideErrorMessage(el)
    }
  },

  unmounted(el) {
    const cleanup = (el as any).__formValidateCleanup
    if (cleanup) {
      cleanup()
      delete (el as any).__formValidateCleanup
    }
  },
}

/**
 * v-form-focus directive
 * Automatically focuses form fields
 */
export const vFormFocus: Directive<HTMLElement, FormFocusDirectiveValue> = {
  mounted(el, binding) {
    const { value } = binding
    if (!value) return

    const { auto = false, delay = 0, select = false } = value

    if (auto) {
      const focusElement = () => {
        if (el.focus) {
          el.focus()
          if (select && (el as HTMLInputElement).select) {
            (el as HTMLInputElement).select()
          }
        }
      }

      if (delay > 0) {
        setTimeout(focusElement, delay)
      } else {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(focusElement)
      }
    }
  },
}

/**
 * Show error message
 */
function showErrorMessage(
  el: HTMLElement,
  message: string,
  placement: 'bottom' | 'right' | 'tooltip'
) {
  // Remove existing error message
  hideErrorMessage(el)

  const errorElement = document.createElement('div')
  errorElement.className = 'ldesign-form-error'
  errorElement.textContent = message
  errorElement.style.cssText = `
    color: #ff4d4f;
    font-size: 12px;
    line-height: 1.4;
    margin-top: 4px;
    position: absolute;
    z-index: 1000;
  `

  if (placement === 'bottom') {
    errorElement.style.top = '100%'
    errorElement.style.left = '0'
  } else if (placement === 'right') {
    errorElement.style.top = '0'
    errorElement.style.left = '100%'
    errorElement.style.marginLeft = '8px'
  } else if (placement === 'tooltip') {
    errorElement.style.background = '#fff'
    errorElement.style.border = '1px solid #d9d9d9'
    errorElement.style.borderRadius = '4px'
    errorElement.style.padding = '4px 8px'
    errorElement.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)'
    errorElement.style.top = '-100%'
    errorElement.style.left = '0'
    errorElement.style.marginTop = '-8px'
  }

  // Make parent relatively positioned if needed
  const parentStyle = getComputedStyle(el.parentElement!)
  if (parentStyle.position === 'static') {
    el.parentElement!.style.position = 'relative'
  }

  el.parentElement!.appendChild(errorElement)

    // Store reference for cleanup
    (el as any).__formErrorElement = errorElement
}

/**
 * Hide error message
 */
function hideErrorMessage(el: HTMLElement) {
  const errorElement = (el as any).__formErrorElement
  if (errorElement && errorElement.parentElement) {
    errorElement.parentElement.removeChild(errorElement)
    delete (el as any).__formErrorElement
  }
}

/**
 * Export all directives
 */
export const directives = {
  'form-validate': vFormValidate,
  'form-focus': vFormFocus,
}