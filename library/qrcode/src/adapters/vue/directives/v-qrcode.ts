import { Directive, DirectiveBinding } from 'vue';
import type { QRCodeConfig, QRCodeInstance } from '../../../types/index';
import { createQRCode } from '../../../index';

interface QRCodeDirectiveBinding extends DirectiveBinding {
  value: string | QRCodeConfig;
  modifiers: {
    canvas?: boolean;
    svg?: boolean;
    small?: boolean;
    medium?: boolean;
    large?: boolean;
    dark?: boolean;
    light?: boolean;
    auto?: boolean;
    animated?: boolean;
    download?: boolean;
  };
  arg?: string;
}

interface QRCodeElement extends HTMLElement {
  __qrInstance?: QRCodeInstance;
  __qrConfig?: QRCodeConfig;
  __qrClickHandler?: () => void;
  __qrObserver?: MutationObserver;
}

/**
 * Vue directive for QR code generation
 * Usage: v-qrcode="content" or v-qrcode="config"
 * Modifiers: v-qrcode.svg, v-qrcode.large.dark
 * Argument: v-qrcode:id for setting a specific ID
 */
export const vQRCode: Directive<QRCodeElement, string | QRCodeConfig> = {
  mounted(el: QRCodeElement, binding: QRCodeDirectiveBinding, vnode, prevVNode) {
    const generateFromDirective = () => {
      // Clear previous content
      el.innerHTML = '';
      
      // Determine config from binding
      let config: QRCodeConfig;
      
      if (typeof binding.value === 'string') {
        // Simple string content
        const size = binding.modifiers.small ? 100 : 
                    binding.modifiers.large ? 300 : 200;
        
        let fgColor = '#000000';
        let bgColor = '#ffffff';
        
        if (binding.modifiers.dark) {
          fgColor = '#ffffff';
          bgColor = '#000000';
        } else if (binding.modifiers.light) {
          fgColor = '#000000';
          bgColor = '#ffffff';
        } else if (binding.modifiers.auto) {
          // Auto-detect theme
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (isDark) {
            fgColor = '#ffffff';
            bgColor = '#000000';
          }
        }
        
        config = {
          content: binding.value,
          renderType: binding.modifiers.svg ? 'svg' : 'canvas',
          style: {
            size,
            fgColor,
            bgColor,
          },
        };
      } else {
        // Full config object
        config = binding.value;
        
        // Apply modifiers
        if (binding.modifiers.svg) {
          config.renderType = 'svg';
        }
        if (!config.style) {
          config.style = {};
        }
        if (binding.modifiers.small) {
          config.style.size = 100;
        } else if (binding.modifiers.medium) {
          config.style.size = 200;
        } else if (binding.modifiers.large) {
          config.style.size = 300;
        }
        if (binding.modifiers.dark) {
          config.style.fgColor = '#ffffff';
          config.style.bgColor = '#000000';
        } else if (binding.modifiers.auto) {
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (isDark) {
            config.style.fgColor = '#ffffff';
            config.style.bgColor = '#000000';
          }
        }
      }
      
      // Store config for comparison
      el.__qrConfig = config;
      
      // Add ID if specified
      if (binding.arg) {
        el.id = binding.arg;
      }
      
      // Add animation class if needed
      if (binding.modifiers.animated) {
        el.classList.add('qrcode-animated');
      }
      
      // Create QR code
      try {
        const instance = createQRCode({
          ...config,
          container: el,
        });
        
        // Store instance on element
        el.__qrInstance = instance;
        
        // Add download functionality if modifier is present
        if (binding.modifiers.download) {
          el.style.cursor = 'pointer';
          el.title = 'Click to download QR code';
          
          el.__qrClickHandler = () => {
            if (el.__qrInstance) {
              const fileName = typeof binding.value === 'object' && binding.value.downloadFileName
                ? binding.value.downloadFileName
                : 'qrcode';
              el.__qrInstance.download({ fileName });
            }
          };
          
          el.addEventListener('click', el.__qrClickHandler);
        }
        
        // Dispatch custom event
        el.dispatchEvent(new CustomEvent('qrcode:ready', {
          detail: { instance },
        }));
      } catch (error) {
        console.error('Failed to create QR code via directive:', error);
        el.innerHTML = `<span style="color: red;">QR Code Error</span>`;
        
        // Dispatch error event
        el.dispatchEvent(new CustomEvent('qrcode:error', {
          detail: { error },
        }));
      }
    };
    
    // Generate QR code
    generateFromDirective();
    
    // Setup auto-theme if modifier is present
    if (binding.modifiers.auto) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const themeChangeHandler = () => {
        generateFromDirective();
      };
      
      mediaQuery.addEventListener('change', themeChangeHandler);
      
      // Store for cleanup
      (el as any).__themeChangeHandler = themeChangeHandler;
      (el as any).__mediaQuery = mediaQuery;
    }
  },
  
  updated(el: QRCodeElement, binding: QRCodeDirectiveBinding) {
    // Check if value has actually changed
    const hasChanged = typeof binding.value === 'string'
      ? binding.value !== binding.oldValue
      : JSON.stringify(binding.value) !== JSON.stringify(el.__qrConfig);
    
    if (!hasChanged) {
      return;
    }
    
    // Clean up existing instance
    if (el.__qrInstance) {
      el.__qrInstance.destroy();
    }
    
    // Remove click handler if it exists
    if (el.__qrClickHandler) {
      el.removeEventListener('click', el.__qrClickHandler);
    }
    
    // Regenerate
    vQRCode.mounted!(el, binding, null as any, null as any);
  },
  
  unmounted(el: QRCodeElement) {
    // Clean up
    if (el.__qrInstance) {
      el.__qrInstance.destroy();
      delete el.__qrInstance;
    }
    
    if (el.__qrClickHandler) {
      el.removeEventListener('click', el.__qrClickHandler);
      delete el.__qrClickHandler;
    }
    
    // Clean up theme change listener
    const themeChangeHandler = (el as any).__themeChangeHandler;
    const mediaQuery = (el as any).__mediaQuery;
    if (themeChangeHandler && mediaQuery) {
      mediaQuery.removeEventListener('change', themeChangeHandler);
      delete (el as any).__themeChangeHandler;
      delete (el as any).__mediaQuery;
    }
    
    delete el.__qrConfig;
  },
};

/**
 * Vue directive for dynamic QR code with reactivity
 * Automatically updates when data changes
 */
export const vQRCodeReactive: Directive<QRCodeElement, any> = {
  mounted(el: QRCodeElement, binding: DirectiveBinding) {
    const createOrUpdateQRCode = () => {
      // Clean up existing instance
      if (el.__qrInstance) {
        el.__qrInstance.destroy();
        el.innerHTML = '';
      }
      
      // Get config from binding value
      const config = typeof binding.value === 'function'
        ? binding.value()
        : binding.value;
      
      if (!config || !config.content) {
        el.innerHTML = '<span style="color: gray;">No QR content</span>';
        return;
      }
      
      try {
        el.__qrInstance = createQRCode({
          ...config,
          container: el,
        });
      } catch (error) {
        console.error('Failed to create reactive QR code:', error);
        el.innerHTML = '<span style="color: red;">QR Error</span>';
      }
    };
    
    // Initial creation
    createOrUpdateQRCode();
    
    // Setup MutationObserver for deep reactivity
    const observer = new MutationObserver(() => {
      createOrUpdateQRCode();
    });
    
    // Observe attribute changes on the element
    observer.observe(el, {
      attributes: true,
      attributeFilter: ['data-qr-content', 'data-qr-size', 'data-qr-color'],
    });
    
    el.__qrObserver = observer;
  },
  
  updated(el: QRCodeElement, binding: DirectiveBinding) {
    // Recreate QR code on update
    vQRCodeReactive.mounted!(el, binding, null as any, null as any);
  },
  
  unmounted(el: QRCodeElement) {
    if (el.__qrInstance) {
      el.__qrInstance.destroy();
      delete el.__qrInstance;
    }
    
    if (el.__qrObserver) {
      el.__qrObserver.disconnect();
      delete el.__qrObserver;
    }
  },
};

/**
 * Vue directive for lazy loading QR codes
 * Only generates QR code when element is in viewport
 */
export const vQRCodeLazy: Directive<QRCodeElement, string | QRCodeConfig> = {
  mounted(el: QRCodeElement, binding: QRCodeDirectiveBinding) {
    let hasGenerated = false;
    
    const generateQRCode = () => {
      if (hasGenerated) return;
      hasGenerated = true;
      
      // Use the regular QR code directive logic
      vQRCode.mounted!(el, binding, null as any, null as any);
    };
    
    // Check if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              generateQRCode();
              observer.unobserve(el);
            }
          });
        },
        {
          rootMargin: '50px', // Start loading 50px before entering viewport
        }
      );
      
      observer.observe(el);
      
      // Store observer for cleanup
      (el as any).__lazyObserver = observer;
      
      // Show placeholder
      el.innerHTML = '<div style="width: 200px; height: 200px; background: #f0f0f0; display: flex; align-items: center; justify-content: center;">Loading...</div>';
    } else {
      // Fallback: generate immediately if IntersectionObserver is not supported
      generateQRCode();
    }
  },
  
  updated(el: QRCodeElement, binding: QRCodeDirectiveBinding) {
    // If already generated, update it
    if (el.__qrInstance) {
      vQRCode.updated!(el, binding, null as any, null as any);
    }
  },
  
  unmounted(el: QRCodeElement) {
    // Clean up observer
    const observer = (el as any).__lazyObserver;
    if (observer) {
      observer.disconnect();
      delete (el as any).__lazyObserver;
    }
    
    // Clean up QR instance
    vQRCode.unmounted!(el, null as any, null as any, null as any);
  },
};

// Export default
export default vQRCode;