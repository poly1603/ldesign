import {
  ref,
  reactive,
  computed,
  watch,
  onUnmounted,
  Ref,
  ComputedRef,
} from 'vue';
import type {
  QRCodeConfig,
  QRCodeInstance,
  ErrorCorrectionLevel,
  RenderType,
} from '../../../types/index';
import { createQRCode } from '../../../index';

// ========== useQRCode Composable ==========

export interface UseQRCodeOptions {
  immediate?: boolean;
  animated?: boolean;
  animationType?: 'fade' | 'scale' | 'rotate';
  animationDuration?: number;
  onSuccess?: (instance: QRCodeInstance) => void;
  onError?: (error: Error) => void;
}

export interface UseQRCodeReturn {
  container: Ref<HTMLElement | undefined>;
  qrInstance: Ref<QRCodeInstance | undefined>;
  isReady: Ref<boolean>;
  isGenerating: Ref<boolean>;
  error: Ref<Error | null>;
  config: QRCodeConfig;
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

// ========== useBatchQRCode Composable ==========

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

// ========== useQRCodeFromURL Composable ==========

/**
 * Composable to generate QR code from URL parameters
 */
export function useQRCodeFromURL(paramName: string = 'qr'): ComputedRef<string> {
  const urlContent = ref('');
  
  const updateFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    const value = params.get(paramName);
    if (value) {
      urlContent.value = decodeURIComponent(value);
    }
  };
  
  // Initial update
  updateFromURL();
  
  // Watch for URL changes
  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', updateFromURL);
    onUnmounted(() => {
      window.removeEventListener('popstate', updateFromURL);
    });
  }
  
  return computed(() => urlContent.value);
}

// ========== useQRCodeInput Composable ==========

/**
 * Composable to sync QR code with form input
 */
export function useQRCodeInput(initialValue: string = '') {
  const value = ref(initialValue);
  const debouncedValue = ref(value.value);
  let debounceTimer: NodeJS.Timeout;
  
  watch(value, (newValue) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debouncedValue.value = newValue;
    }, 500);
  });
  
  onUnmounted(() => {
    clearTimeout(debounceTimer);
  });
  
  return {
    value,
    debouncedValue: computed(() => debouncedValue.value),
    modelValue: computed({
      get: () => value.value,
      set: (val) => { value.value = val; },
    }),
  };
}

// ========== useQRCodeTheme Composable ==========

export interface QRCodeTheme {
  light: {
    fgColor: string;
    bgColor: string;
  };
  dark: {
    fgColor: string;
    bgColor: string;
  };
}

/**
 * Composable to handle QR code theming
 */
export function useQRCodeTheme(customTheme?: Partial<QRCodeTheme>) {
  const defaultTheme: QRCodeTheme = {
    light: {
      fgColor: '#000000',
      bgColor: '#ffffff',
    },
    dark: {
      fgColor: '#ffffff',
      bgColor: '#000000',
    },
  };
  
  const theme = reactive<QRCodeTheme>({
    ...defaultTheme,
    ...customTheme,
  });
  
  const isDarkMode = ref(false);
  
  // Check system preference
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    isDarkMode.value = mediaQuery.matches;
    
    const handler = (e: MediaQueryListEvent) => {
      isDarkMode.value = e.matches;
    };
    
    mediaQuery.addEventListener('change', handler);
    onUnmounted(() => {
      mediaQuery.removeEventListener('change', handler);
    });
  }
  
  const currentTheme = computed(() => {
    return isDarkMode.value ? theme.dark : theme.light;
  });
  
  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value;
  };
  
  return {
    theme,
    isDarkMode,
    currentTheme,
    toggleDarkMode,
  };
}

// ========== useQRCodeShare Composable ==========

/**
 * Composable to share QR code
 */
export function useQRCodeShare(qrInstance?: Ref<QRCodeInstance | undefined>) {
  const isSharing = ref(false);
  
  const shareAsImage = async (title: string = 'QR Code', text?: string) => {
    const instance = qrInstance?.value;
    if (!instance) {
      throw new Error('QR code instance not initialized');
    }
    
    isSharing.value = true;
    
    try {
      const dataURL = instance.toDataURL();
      const blob = await (await fetch(dataURL)).blob();
      const file = new File([blob], 'qrcode.png', { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title,
          text,
          files: [file],
        });
      } else {
        // Fallback: Copy to clipboard
        const clipboardItem = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([clipboardItem]);
        alert('QR code copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to share QR code:', error);
      throw error;
    } finally {
      isSharing.value = false;
    }
  };
  
  const shareAsText = async (text: string) => {
    isSharing.value = true;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'QR Code Content',
          text,
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(text);
        alert('QR code content copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to share text:', error);
      throw error;
    } finally {
      isSharing.value = false;
    }
  };
  
  const copyToClipboard = async () => {
    const instance = qrInstance?.value;
    if (!instance) {
      throw new Error('QR code instance not initialized');
    }
    
    const dataURL = instance.toDataURL();
    const blob = await (await fetch(dataURL)).blob();
    const clipboardItem = new ClipboardItem({ 'image/png': blob });
    await navigator.clipboard.write([clipboardItem]);
  };
  
  return {
    shareAsImage,
    shareAsText,
    copyToClipboard,
    isSharing,
    canShare: typeof navigator !== 'undefined' && !!navigator.share,
  };
}

// ========== useQRCodeValidation Composable ==========

/**
 * Composable for QR code content validation
 */
export function useQRCodeValidation() {
  const errors = ref<string[]>([]);
  const warnings = ref<string[]>([]);
  
  const validateContent = (content: string): boolean => {
    errors.value = [];
    warnings.value = [];
    
    // Check if content is empty
    if (!content) {
      errors.value.push('Content is required');
      return false;
    }
    
    // Check content length
    if (content.length > 4296) {
      errors.value.push('Content exceeds maximum length of 4296 characters');
      return false;
    }
    
    // Warnings for large content
    if (content.length > 2000) {
      warnings.value.push('Content is large, consider using higher error correction level');
    }
    
    // Check for special characters that might cause issues
    if (/[\x00-\x1F\x7F-\x9F]/.test(content)) {
      warnings.value.push('Content contains control characters that might not display correctly');
    }
    
    return errors.value.length === 0;
  };
  
  const validateURL = (url: string): boolean => {
    try {
      new URL(url);
      return validateContent(url);
    } catch {
      errors.value.push('Invalid URL format');
      return false;
    }
  };
  
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.value.push('Invalid email format');
      return false;
    }
    return validateContent(`mailto:${email}`);
  };
  
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(phone)) {
      errors.value.push('Invalid phone number format');
      return false;
    }
    return validateContent(`tel:${phone}`);
  };
  
  return {
    errors: computed(() => errors.value),
    warnings: computed(() => warnings.value),
    hasErrors: computed(() => errors.value.length > 0),
    hasWarnings: computed(() => warnings.value.length > 0),
    validateContent,
    validateURL,
    validateEmail,
    validatePhone,
  };
}