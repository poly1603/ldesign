// Main exports from component modules
export { default as QRCode } from './components/QRCode.vue';

// Export composables
export {
  useQRCode,
  useBatchQRCode,
  useQRCodeFromURL,
  useQRCodeInput,
  useQRCodeTheme,
  useQRCodeShare,
  useQRCodeValidation,
  UseQRCodeOptions,
  UseQRCodeReturn,
  BatchQRCodeItem,
  QRCodeTheme,
} from './composables/useQRCode';

// Export directives
export {
  vQRCode,
  vQRCodeReactive,
  vQRCodeLazy,
} from './directives/v-qrcode';

// Re-export types for convenience
export type {
  QRCodeConfig,
  QRCodeInstance,
  ErrorCorrectionLevel,
  RenderType,
  LogoConfig,
  QRCodeStyle,
  DotStyle,
} from '../../types';

// Import necessary Vue utilities for legacy components and plugin
import {
  defineComponent,
  h,
  ref,
  watch,
  onMounted,
  onUnmounted,
  PropType,
  computed,
  reactive,
  toRefs,
  Directive,
  App,
  Plugin,
  VNode,
} from 'vue';
import type {
  QRCodeConfig,
  QRCodeInstance,
  ErrorCorrectionLevel,
  RenderType,
  LogoConfig,
  QRCodeStyle,
  DotStyle,
} from '../../types';
import { createQRCode } from '../../index';
import { vQRCode } from './directives/v-qrcode';

// ========== Enhanced Component ==========

/**
 * Enhanced Vue QRCode component with more props and features
 */
export const QRCode = defineComponent({
  name: 'QRCode',
  props: {
    // Basic props
    content: {
      type: String,
      required: true,
    },
    errorCorrectionLevel: {
      type: String as PropType<ErrorCorrectionLevel>,
      default: 'M',
    },
    renderType: {
      type: String as PropType<RenderType>,
      default: 'canvas',
    },
    size: {
      type: Number,
      default: 200,
    },
    margin: {
      type: Number,
      default: 4,
    },
    
    // Color props
    fgColor: {
      type: String,
      default: '#000000',
    },
    bgColor: {
      type: String,
      default: '#ffffff',
    },
    
    // Style props
    cornerRadius: {
      type: Number,
      default: 0,
    },
    dotStyle: {
      type: String as PropType<DotStyle>,
      default: 'square',
    },
    
    // Advanced style props
    gradient: {
      type: Object,
      default: undefined,
    },
    backgroundGradient: {
      type: Object,
      default: undefined,
    },
    
    // Logo props
    logo: {
      type: Object as PropType<LogoConfig>,
      default: undefined,
    },
    
    // Animation props
    animated: {
      type: Boolean,
      default: false,
    },
    animationDuration: {
      type: Number,
      default: 1000,
    },
    animationType: {
      type: String as PropType<'fade' | 'scale' | 'rotate'>,
      default: 'fade',
    },
    
    // Other props
    typeNumber: {
      type: Number,
      default: undefined,
    },
    invert: {
      type: Boolean,
      default: false,
    },
    rotate: {
      type: Number as PropType<0 | 90 | 180 | 270>,
      default: 0,
    },
    
    // Callback props
    onReady: {
      type: Function as PropType<(instance: QRCodeInstance) => void>,
      default: undefined,
    },
    onError: {
      type: Function as PropType<(error: Error) => void>,
      default: undefined,
    },
    
    // Auto download props
    autoDownload: {
      type: Boolean,
      default: false,
    },
    downloadFileName: {
      type: String,
      default: 'qrcode',
    },
    downloadFormat: {
      type: String as PropType<'png' | 'jpeg' | 'svg'>,
      default: 'png',
    },
  },
  emits: ['ready', 'error', 'click', 'download'],
  setup(props, { emit, expose, slots }) {
    const containerRef = ref<HTMLDivElement>();
    const qrInstance = ref<QRCodeInstance>();
    const isGenerating = ref(false);
    const animationClass = ref('');
    
    // Computed style object
    const styleConfig = computed<QRCodeStyle>(() => ({
      size: props.size,
      margin: props.margin,
      fgColor: props.fgColor,
      bgColor: props.bgColor,
      cornerRadius: props.cornerRadius,
      dotStyle: props.dotStyle,
      gradient: props.gradient,
      backgroundGradient: props.backgroundGradient,
      invert: props.invert,
      rotate: props.rotate,
    }));
    
    // Animation classes
    const getAnimationClass = () => {
      if (!props.animated) return '';
      switch (props.animationType) {
        case 'fade':
          return 'qrcode-fade-in';
        case 'scale':
          return 'qrcode-scale-in';
        case 'rotate':
          return 'qrcode-rotate-in';
        default:
          return '';
      }
    };
    
    const generateQRCode = async () => {
      if (!containerRef.value) return;
      
      try {
        isGenerating.value = true;
        
        // Clean up existing instance
        if (qrInstance.value) {
          qrInstance.value.destroy();
        }
        
        // Reset animation
        if (props.animated) {
          animationClass.value = '';
          await new Promise(resolve => setTimeout(resolve, 10));
          animationClass.value = getAnimationClass();
        }
        
        // Create config
        const config: QRCodeConfig = {
          content: props.content,
          errorCorrectionLevel: props.errorCorrectionLevel,
          renderType: props.renderType,
          typeNumber: props.typeNumber,
          style: styleConfig.value,
          logo: props.logo,
        };
        
        // Create new instance
        qrInstance.value = createQRCode({
          ...config,
          container: containerRef.value,
        });
        
        // Handle callbacks
        if (props.onReady) {
          props.onReady(qrInstance.value);
        }
        emit('ready', qrInstance.value);
        
        // Auto download if enabled
        if (props.autoDownload) {
          setTimeout(() => {
            download();
          }, 500);
        }
      } catch (error) {
        if (props.onError) {
          props.onError(error as Error);
        }
        emit('error', error);
        console.error('Failed to generate QR code:', error);
      } finally {
        isGenerating.value = false;
      }
    };
    
    // Public methods
    const download = (
      fileName?: string,
      format?: 'png' | 'jpeg' | 'svg',
      quality?: number
    ) => {
      if (!qrInstance.value) return;
      
      const actualFileName = fileName || props.downloadFileName;
      const actualFormat = format || props.downloadFormat;
      
      if (actualFormat === 'svg') {
        // Download SVG
        const svgString = qrInstance.value.toSVGString();
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${actualFileName}.svg`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        qrInstance.value.download({
          fileName: actualFileName,
          format: actualFormat as 'png' | 'jpeg',
          quality,
        });
      }
      
      emit('download', { fileName: actualFileName, format: actualFormat });
    };
    
    const refresh = () => {
      generateQRCode();
    };
    
    const getInstance = () => qrInstance.value;
    
    const toDataURL = (format?: 'png' | 'jpeg', quality?: number) => {
      return qrInstance.value?.toDataURL(format, quality);
    };
    
    const toSVGString = () => {
      return qrInstance.value?.toSVGString();
    };
    
    // Handle click event
    const handleClick = (event: MouseEvent) => {
      emit('click', event);
    };
    
    // Watch for prop changes
    watch(
      () => [
        props.content,
        props.errorCorrectionLevel,
        props.renderType,
        props.size,
        props.margin,
        props.fgColor,
        props.bgColor,
        props.cornerRadius,
        props.dotStyle,
        props.gradient,
        props.backgroundGradient,
        props.logo,
        props.typeNumber,
        props.invert,
        props.rotate,
      ],
      () => {
        generateQRCode();
      }
    );
    
    onMounted(() => {
      generateQRCode();
    });
    
    onUnmounted(() => {
      if (qrInstance.value) {
        qrInstance.value.destroy();
      }
    });
    
    // Expose methods
    expose({
      getInstance,
      toDataURL,
      download,
      toSVGString,
      refresh,
      isGenerating,
    });
    
    return () => {
      const containerProps = {
        ref: containerRef,
        class: [
          'qrcode-container',
          animationClass.value,
          {
            'qrcode-generating': isGenerating.value,
          },
        ],
        style: {
          animationDuration: `${props.animationDuration}ms`,
        },
        onClick: handleClick,
      };
      
      return h('div', containerProps, [
        slots.loading && isGenerating.value ? slots.loading() : null,
        slots.overlay && !isGenerating.value ? slots.overlay() : null,
      ]);
    };
  },
});

// ========== Vue Directive ==========

interface QRCodeDirectiveBinding {
  value: string | QRCodeConfig;
  modifiers: {
    canvas?: boolean;
    svg?: boolean;
    small?: boolean;
    medium?: boolean;
    large?: boolean;
    dark?: boolean;
    light?: boolean;
  };
  arg?: string;
}

/**
 * Vue directive for QR code generation
 * Usage: v-qrcode="content" or v-qrcode="config"
 * Modifiers: v-qrcode.svg, v-qrcode.large.dark
 */
export const vQRCode: Directive<HTMLElement, string | QRCodeConfig> = {
  mounted(el: HTMLElement, binding: QRCodeDirectiveBinding) {
    const generateFromDirective = () => {
      // Clear previous content
      el.innerHTML = '';
      
      // Determine config from binding
      let config: QRCodeConfig;
      
      if (typeof binding.value === 'string') {
        // Simple string content
        config = {
          content: binding.value,
          renderType: binding.modifiers.svg ? 'svg' : 'canvas',
          style: {
            size: binding.modifiers.small ? 100 : 
                  binding.modifiers.large ? 300 : 200,
            fgColor: binding.modifiers.dark ? '#ffffff' : '#000000',
            bgColor: binding.modifiers.dark ? '#000000' : '#ffffff',
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
        } else if (binding.modifiers.large) {
          config.style.size = 300;
        }
        if (binding.modifiers.dark) {
          config.style.fgColor = '#ffffff';
          config.style.bgColor = '#000000';
        }
      }
      
      // Create QR code
      try {
        const instance = createQRCode({
          ...config,
          container: el,
        });
        
        // Store instance on element for later access
        (el as any).__qrInstance = instance;
      } catch (error) {
        console.error('Failed to create QR code via directive:', error);
        el.innerHTML = `<span style="color: red;">QR Code Error</span>`;
      }
    };
    
    generateFromDirective();
  },
  
  updated(el: HTMLElement, binding: QRCodeDirectiveBinding) {
    // Regenerate on value change
    const instance = (el as any).__qrInstance as QRCodeInstance | undefined;
    
    if (instance) {
      instance.destroy();
    }
    
    // Regenerate
    vQRCode.mounted!(el, binding, null as any, null as any);
  },
  
  unmounted(el: HTMLElement) {
    // Clean up
    const instance = (el as any).__qrInstance as QRCodeInstance | undefined;
    
    if (instance) {
      instance.destroy();
      delete (el as any).__qrInstance;
    }
  },
};

// ========== Advanced Composable ==========

export interface UseQRCodeOptions {
  immediate?: boolean;
  animated?: boolean;
  animationType?: 'fade' | 'scale' | 'rotate';
  animationDuration?: number;
  onSuccess?: (instance: QRCodeInstance) => void;
  onError?: (error: Error) => void;
}

export interface UseQRCodeReturn {
  container: typeof ref<HTMLElement | undefined>;
  qrInstance: typeof ref<QRCodeInstance | undefined>;
  isReady: typeof ref<boolean>;
  isGenerating: typeof ref<boolean>;
  error: typeof ref<Error | null>;
  config: typeof reactive<QRCodeConfig>;
  generate: (config?: Partial<QRCodeConfig>) => Promise<void>;
  update: (config: Partial<QRCodeConfig>) => Promise<void>;
  refresh: () => Promise<void>;
  toDataURL: (format?: 'png' | 'jpeg', quality?: number) => string;
  toSVGString: () => string;
  download: (fileName?: string, format?: 'png' | 'jpeg' | 'svg', quality?: number) => void;
  destroy: () => void;
  animateIn: () => void;
  animateOut: () => Promise<void>;
}

/**
 * Advanced Vue composable for QR code with animation and state management
 */
export function useQRCode(
  initialConfig?: Partial<QRCodeConfig>,
  options: UseQRCodeOptions = {}
): UseQRCodeReturn {
  const {
    immediate = true,
    animated = false,
    animationType = 'fade',
    animationDuration = 1000,
    onSuccess,
    onError,
  } = options;
  
  // State
  const qrInstance = ref<QRCodeInstance>();
  const container = ref<HTMLElement>();
  const isReady = ref(false);
  const isGenerating = ref(false);
  const error = ref<Error | null>(null);
  
  // Config state
  const config = reactive<QRCodeConfig>({
    content: '',
    errorCorrectionLevel: 'M',
    renderType: 'canvas',
    ...initialConfig,
  });
  
  // Animation state
  const isAnimating = ref(false);
  
  // Generate QR code
  const generate = async (newConfig?: Partial<QRCodeConfig>) => {
    try {
      error.value = null;
      isReady.value = false;
      isGenerating.value = true;
      
      // Update config
      if (newConfig) {
        Object.assign(config, newConfig);
      }
      
      // Validate config
      if (!config.content) {
        throw new Error('QR code content is required');
      }
      
      // Clean up existing instance
      if (qrInstance.value) {
        qrInstance.value.destroy();
      }
      
      // Apply animation
      if (animated && container.value) {
        await animateOut();
      }
      
      // Create new instance
      qrInstance.value = createQRCode({
        ...config,
        container: container.value,
      });
      
      isReady.value = true;
      
      // Apply animation
      if (animated && container.value) {
        animateIn();
      }
      
      // Success callback
      if (onSuccess) {
        onSuccess(qrInstance.value);
      }
    } catch (err) {
      error.value = err as Error;
      if (onError) {
        onError(err as Error);
      }
      console.error('Failed to generate QR code:', err);
    } finally {
      isGenerating.value = false;
    }
  };
  
  // Update existing QR code
  const update = async (newConfig: Partial<QRCodeConfig>) => {
    if (!qrInstance.value) {
      throw new Error('QR code instance not initialized');
    }
    
    // Update config
    Object.assign(config, newConfig);
    
    // Update instance
    await qrInstance.value.update(newConfig);
  };
  
  // Refresh QR code
  const refresh = async () => {
    await generate();
  };
  
  // Export methods
  const toDataURL = (format?: 'png' | 'jpeg', quality?: number): string => {
    if (!qrInstance.value) {
      throw new Error('QR code instance not initialized');
    }
    return qrInstance.value.toDataURL(format, quality);
  };
  
  const toSVGString = (): string => {
    if (!qrInstance.value) {
      throw new Error('QR code instance not initialized');
    }
    return qrInstance.value.toSVGString();
  };
  
  const download = (
    fileName: string = 'qrcode',
    format: 'png' | 'jpeg' | 'svg' = 'png',
    quality?: number
  ) => {
    if (!qrInstance.value) {
      throw new Error('QR code instance not initialized');
    }
    
    if (format === 'svg') {
      const svgString = toSVGString();
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      qrInstance.value.download({ fileName, format, quality });
    }
  };
  
  const destroy = () => {
    if (qrInstance.value) {
      qrInstance.value.destroy();
      qrInstance.value = undefined;
      isReady.value = false;
    }
  };
  
  // Animation methods
  const animateIn = () => {
    if (!container.value) return;
    
    isAnimating.value = true;
    container.value.style.animation = `qrcode-${animationType}-in ${animationDuration}ms ease-in-out`;
    
    setTimeout(() => {
      isAnimating.value = false;
    }, animationDuration);
  };
  
  const animateOut = (): Promise<void> => {
    return new Promise((resolve) => {
      if (!container.value) {
        resolve();
        return;
      }
      
      isAnimating.value = true;
      container.value.style.animation = `qrcode-${animationType}-out ${animationDuration / 2}ms ease-in-out`;
      
      setTimeout(() => {
        isAnimating.value = false;
        resolve();
      }, animationDuration / 2);
    });
  };
  
  // Initialize if immediate
  if (immediate && initialConfig?.content) {
    generate();
  }
  
  // Cleanup on unmount
  onUnmounted(() => {
    destroy();
  });
  
  return {
    container,
    qrInstance,
    isReady,
    isGenerating,
    error,
    config,
    generate,
    update,
    refresh,
    toDataURL,
    toSVGString,
    download,
    destroy,
    animateIn,
    animateOut,
  };
}

// ========== Batch QR Code Composable ==========

export interface BatchQRCodeItem {
  id: string;
  content: string;
  config?: Partial<QRCodeConfig>;
  status?: 'pending' | 'generating' | 'success' | 'error';
  error?: Error;
  dataURL?: string;
}

/**
 * Composable for generating multiple QR codes
 */
export function useBatchQRCode() {
  const items = ref<BatchQRCodeItem[]>([]);
  const isGenerating = ref(false);
  const progress = ref(0);
  
  const addItem = (content: string, config?: Partial<QRCodeConfig>): string => {
    const id = `qr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    items.value.push({
      id,
      content,
      config,
      status: 'pending',
    });
    return id;
  };
  
  const removeItem = (id: string) => {
    const index = items.value.findIndex(item => item.id === id);
    if (index !== -1) {
      items.value.splice(index, 1);
    }
  };
  
  const generateAll = async (defaultConfig?: Partial<QRCodeConfig>) => {
    isGenerating.value = true;
    progress.value = 0;
    
    const total = items.value.length;
    let completed = 0;
    
    for (const item of items.value) {
      item.status = 'generating';
      
      try {
        // Create temporary container
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'fixed';
        tempContainer.style.left = '-9999px';
        document.body.appendChild(tempContainer);
        
        // Generate QR code
        const instance = createQRCode({
          content: item.content,
          ...defaultConfig,
          ...item.config,
          container: tempContainer,
        });
        
        // Get data URL
        item.dataURL = instance.toDataURL();
        item.status = 'success';
        
        // Cleanup
        instance.destroy();
        document.body.removeChild(tempContainer);
      } catch (error) {
        item.status = 'error';
        item.error = error as Error;
      }
      
      completed++;
      progress.value = (completed / total) * 100;
    }
    
    isGenerating.value = false;
  };
  
  const downloadAll = (format: 'png' | 'jpeg' = 'png') => {
    items.value.forEach((item, index) => {
      if (item.dataURL) {
        const a = document.createElement('a');
        a.href = item.dataURL;
        a.download = `qrcode-${index + 1}.${format}`;
        a.click();
      }
    });
  };
  
  const clear = () => {
    items.value = [];
    progress.value = 0;
  };
  
  return {
    items,
    isGenerating,
    progress,
    addItem,
    removeItem,
    generateAll,
    downloadAll,
    clear,
  };
}

// ========== Vue Plugin ==========

export interface QRCodePluginOptions {
  defaultConfig?: Partial<QRCodeConfig>;
  componentName?: string;
  directiveName?: string;
}

/**
 * Vue plugin for global QR code component and directive registration
 */
export const QRCodePlugin: Plugin = {
  install(app: App, options: QRCodePluginOptions = {}) {
    const {
      defaultConfig = {},
      componentName = 'QRCode',
      directiveName = 'qrcode',
    } = options;
    
    // Import components and directives
    const QRCodeComponent = require('./components/QRCode.vue').default;
    
    // Register component
    app.component(componentName, QRCodeComponent);
    
    // Register directive
    app.directive(directiveName, vQRCode);
    
    // Provide default config
    app.provide('qrcode-default-config', defaultConfig);
    
    // Global properties
    app.config.globalProperties.$qrcode = {
      create: createQRCode,
      defaultConfig,
    };
  },
};

// ========== CSS Animations ==========

export const QRCodeAnimations = `
  @keyframes qrcode-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes qrcode-fade-out {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  
  @keyframes qrcode-scale-in {
    from { transform: scale(0); }
    to { transform: scale(1); }
  }
  
  @keyframes qrcode-scale-out {
    from { transform: scale(1); }
    to { transform: scale(0); }
  }
  
  @keyframes qrcode-rotate-in {
    from { 
      transform: rotate(-180deg) scale(0);
      opacity: 0;
    }
    to { 
      transform: rotate(0) scale(1);
      opacity: 1;
    }
  }
  
  @keyframes qrcode-rotate-out {
    from { 
      transform: rotate(0) scale(1);
      opacity: 1;
    }
    to { 
      transform: rotate(180deg) scale(0);
      opacity: 0;
    }
  }
  
  .qrcode-fade-in {
    animation: qrcode-fade-in 1s ease-in-out;
  }
  
  .qrcode-scale-in {
    animation: qrcode-scale-in 0.5s ease-in-out;
  }
  
  .qrcode-rotate-in {
    animation: qrcode-rotate-in 0.8s ease-in-out;
  }
  
  .qrcode-generating {
    position: relative;
    min-height: 100px;
  }
  
  .qrcode-generating::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 30px;
    height: 30px;
    margin: -15px 0 0 -15px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #333;
    border-radius: 50%;
    animation: qrcode-spin 1s linear infinite;
  }
  
  @keyframes qrcode-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Export types
export type { QRCodeConfig, QRCodeInstance, ErrorCorrectionLevel, RenderType, LogoConfig, QRCodeStyle };

// Default export
export default QRCode;