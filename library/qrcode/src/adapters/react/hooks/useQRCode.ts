import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from 'react';
import type {
  QRCodeConfig,
  QRCodeInstance,
  ErrorCorrectionLevel,
  RenderType,
} from '../../../types/index';
import { createQRCode } from '../../../index';

// ========== useQRCode Hook ==========

export interface UseQRCodeOptions {
  immediate?: boolean;
  animated?: boolean;
  animationType?: 'fade' | 'scale' | 'rotate';
  animationDuration?: number;
  onSuccess?: (instance: QRCodeInstance) => void;
  onError?: (error: Error) => void;
}

export interface UseQRCodeReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  qrInstance: QRCodeInstance | undefined;
  isReady: boolean;
  isGenerating: boolean;
  error: Error | null;
  generate: (config: QRCodeConfig) => Promise<void>;
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
 * Advanced React hook for QR code with animation and state management
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
  const [qrInstance, setQrInstance] = useState<QRCodeInstance>();
  const [isReady, setIsReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [config, setConfig] = useState<QRCodeConfig>({
    content: '',
    errorCorrectionLevel: 'M',
    renderType: 'canvas',
    ...initialConfig,
  } as QRCodeConfig);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<QRCodeInstance>();
  
  // Generate QR code
  const generate = useCallback(async (newConfig: QRCodeConfig) => {
    try {
      setError(null);
      setIsReady(false);
      setIsGenerating(true);
      setConfig(newConfig);
      
      // Validate config
      if (!newConfig.content) {
        throw new Error('QR code content is required');
      }
      
      // Clean up existing instance
      if (instanceRef.current) {
        instanceRef.current.destroy();
      }
      
      // Apply animation out
      if (animated && containerRef.current) {
        await animateOut();
      }
      
      // Create new instance
      const instance = createQRCode({
        ...newConfig,
        container: containerRef.current || undefined,
      });
      
      instanceRef.current = instance;
      setQrInstance(instance);
      setIsReady(true);
      
      // Apply animation in
      if (animated && containerRef.current) {
        animateIn();
      }
      
      // Success callback
      if (onSuccess) {
        onSuccess(instance);
      }
    } catch (err) {
      const error = err as Error;
      setError(error);
      if (onError) {
        onError(error);
      }
      console.error('Failed to generate QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [animated, onSuccess, onError]);
  
  // Update existing QR code
  const update = useCallback(async (newConfig: Partial<QRCodeConfig>) => {
    if (!instanceRef.current) {
      throw new Error('QR code instance not initialized');
    }
    
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    await instanceRef.current.update(newConfig);
  }, [config]);
  
  // Refresh QR code
  const refresh = useCallback(async () => {
    if (config.content) {
      await generate(config);
    }
  }, [config, generate]);
  
  // Export methods
  const toDataURL = useCallback((format?: 'png' | 'jpeg', quality?: number): string => {
    if (!instanceRef.current) {
      throw new Error('QR code instance not initialized');
    }
    return instanceRef.current.toDataURL(format, quality);
  }, []);
  
  const toSVGString = useCallback((): string => {
    if (!instanceRef.current) {
      throw new Error('QR code instance not initialized');
    }
    return instanceRef.current.toSVGString();
  }, []);
  
  const download = useCallback((
    fileName: string = 'qrcode',
    format: 'png' | 'jpeg' | 'svg' = 'png',
    quality?: number
  ) => {
    if (!instanceRef.current) {
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
      instanceRef.current.download({ fileName, format, quality });
    }
  }, [toSVGString]);
  
  const destroy = useCallback(() => {
    if (instanceRef.current) {
      instanceRef.current.destroy();
      instanceRef.current = undefined;
      setQrInstance(undefined);
      setIsReady(false);
    }
  }, []);
  
  // Animation methods
  const animateIn = useCallback(() => {
    if (!containerRef.current) return;
    
    containerRef.current.style.animation = `qrcode-${animationType}-in ${animationDuration}ms ease-in-out`;
  }, [animationType, animationDuration]);
  
  const animateOut = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (!containerRef.current) {
        resolve();
        return;
      }
      
      containerRef.current.style.animation = `qrcode-${animationType}-out ${animationDuration / 2}ms ease-in-out`;
      
      setTimeout(() => {
        resolve();
      }, animationDuration / 2);
    });
  }, [animationType, animationDuration]);
  
  // Initialize if immediate
  useEffect(() => {
    if (immediate && initialConfig?.content) {
      generate(config);
    }
    
    return () => {
      destroy();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  return {
    containerRef,
    qrInstance,
    isReady,
    isGenerating,
    error,
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

// ========== useBatchQRCode Hook ==========

export interface BatchQRCodeItem {
  id: string;
  content: string;
  config?: Partial<QRCodeConfig>;
  status: 'pending' | 'generating' | 'success' | 'error';
  error?: Error;
  dataURL?: string;
}

/**
 * Hook for generating multiple QR codes
 */
export function useBatchQRCode() {
  const [items, setItems] = useState<BatchQRCodeItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const addItem = useCallback((content: string, config?: Partial<QRCodeConfig>): string => {
    const id = `qr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setItems(prev => [...prev, {
      id,
      content,
      config,
      status: 'pending',
    }]);
    return id;
  }, []);
  
  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);
  
  const generateAll = useCallback(async (defaultConfig?: Partial<QRCodeConfig>) => {
    setIsGenerating(true);
    setProgress(0);
    
    const updatedItems = [...items];
    const total = updatedItems.length;
    let completed = 0;
    
    for (let i = 0; i < updatedItems.length; i++) {
      const item = updatedItems[i];
      item.status = 'generating';
      setItems([...updatedItems]);
      
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
      setProgress((completed / total) * 100);
      setItems([...updatedItems]);
    }
    
    setIsGenerating(false);
  }, [items]);
  
  const downloadAll = useCallback((format: 'png' | 'jpeg' = 'png') => {
    items.forEach((item, index) => {
      if (item.dataURL) {
        const a = document.createElement('a');
        a.href = item.dataURL;
        a.download = `qrcode-${index + 1}.${format}`;
        a.click();
      }
    });
  }, [items]);
  
  const clear = useCallback(() => {
    setItems([]);
    setProgress(0);
  }, []);
  
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

// ========== useQRCodeFromURL Hook ==========

/**
 * Hook to generate QR code from URL parameters
 */
export function useQRCodeFromURL(paramName: string = 'qr') {
  const [content, setContent] = useState<string>('');
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const value = params.get(paramName);
    if (value) {
      setContent(decodeURIComponent(value));
    }
  }, [paramName]);
  
  return content;
}

// ========== useQRCodeInput Hook ==========

/**
 * Hook to sync QR code with form input
 */
export function useQRCodeInput(initialValue: string = '') {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [value]);
  
  return {
    value,
    setValue,
    debouncedValue,
    inputProps: {
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setValue(e.target.value);
      },
    },
  };
}

// ========== useQRCodeTheme Hook ==========

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
 * Hook to handle QR code theming
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
  
  const [theme, setTheme] = useState<QRCodeTheme>({
    ...defaultTheme,
    ...customTheme,
  });
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  const currentTheme = useMemo(() => {
    return isDarkMode ? theme.dark : theme.light;
  }, [isDarkMode, theme]);
  
  return {
    theme,
    setTheme,
    isDarkMode,
    currentTheme,
    toggleDarkMode: () => setIsDarkMode(!isDarkMode),
  };
}

// ========== useQRCodeShare Hook ==========

/**
 * Hook to share QR code
 */
export function useQRCodeShare(qrInstance?: QRCodeInstance) {
  const [isSharing, setIsSharing] = useState(false);
  
  const shareAsImage = useCallback(async (title: string = 'QR Code', text?: string) => {
    if (!qrInstance) {
      throw new Error('QR code instance not initialized');
    }
    
    setIsSharing(true);
    
    try {
      const dataURL = qrInstance.toDataURL();
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
      setIsSharing(false);
    }
  }, [qrInstance]);
  
  const shareAsText = useCallback(async (text: string) => {
    setIsSharing(true);
    
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
      setIsSharing(false);
    }
  }, []);
  
  const copyToClipboard = useCallback(async () => {
    if (!qrInstance) {
      throw new Error('QR code instance not initialized');
    }
    
    const dataURL = qrInstance.toDataURL();
    const blob = await (await fetch(dataURL)).blob();
    const clipboardItem = new ClipboardItem({ 'image/png': blob });
    await navigator.clipboard.write([clipboardItem]);
  }, [qrInstance]);
  
  return {
    shareAsImage,
    shareAsText,
    copyToClipboard,
    isSharing,
    canShare: typeof navigator !== 'undefined' && !!navigator.share,
  };
}