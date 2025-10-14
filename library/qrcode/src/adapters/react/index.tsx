// Main exports from component modules
export { QRCode, QRCodeProps, QRCodeRef } from './components/QRCode';
export { default } from './components/QRCode';

// Export hooks
export {
  useQRCode,
  useBatchQRCode,
  useQRCodeFromURL,
  useQRCodeInput,
  useQRCodeTheme,
  useQRCodeShare,
  UseQRCodeOptions,
  UseQRCodeReturn,
  BatchQRCodeItem,
  QRCodeTheme,
} from './hooks/useQRCode';

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

// Import necessary React utilities for legacy components
import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
  useCallback,
  useMemo,
  createContext,
  useContext,
  memo,
  ComponentType,
  ReactNode,
  CSSProperties,
} from 'react';
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

// ========== Types ==========

export interface QRCodeProps {
  // Basic props
  content: string;
  errorCorrectionLevel?: ErrorCorrectionLevel;
  renderType?: RenderType;
  size?: number;
  margin?: number;
  
  // Style props
  fgColor?: string;
  bgColor?: string;
  cornerRadius?: number;
  dotStyle?: DotStyle;
  
  // Advanced style props
  gradient?: any;
  backgroundGradient?: any;
  invert?: boolean;
  rotate?: 0 | 90 | 180 | 270;
  
  // Logo props
  logo?: LogoConfig;
  
  // Animation props
  animated?: boolean;
  animationType?: 'fade' | 'scale' | 'rotate' | 'slide';
  animationDuration?: number;
  animationDelay?: number;
  
  // Auto features
  autoDownload?: boolean;
  downloadFileName?: string;
  downloadFormat?: 'png' | 'jpeg' | 'svg';
  
  // Other props
  typeNumber?: number;
  className?: string;
  style?: CSSProperties;
  containerStyle?: CSSProperties;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode | ((error: Error) => ReactNode);
  
  // Event handlers
  onReady?: (instance: QRCodeInstance) => void;
  onError?: (error: Error) => void;
  onClick?: (event: React.MouseEvent) => void;
  onDownload?: (info: { fileName: string; format: string }) => void;
  onHover?: (hovering: boolean) => void;
}

export interface QRCodeRef {
  getInstance: () => QRCodeInstance | undefined;
  toDataURL: (format?: 'png' | 'jpeg', quality?: number) => string;
  toSVGString: () => string;
  download: (fileName?: string, format?: 'png' | 'jpeg' | 'svg', quality?: number) => void;
  refresh: () => void;
  isLoading: boolean;
}

// ========== Enhanced Component ==========

/**
 * Enhanced React QRCode component with animation and advanced features
 */
export const QRCode = memo(forwardRef<QRCodeRef, QRCodeProps>((props, ref) => {
  const {
    // Basic props
    content,
    errorCorrectionLevel = 'M',
    renderType = 'canvas',
    size = 200,
    margin = 4,
    
    // Style props
    fgColor = '#000000',
    bgColor = '#ffffff',
    cornerRadius = 0,
    dotStyle = 'square',
    gradient,
    backgroundGradient,
    invert = false,
    rotate = 0,
    
    // Logo props
    logo,
    
    // Animation props
    animated = false,
    animationType = 'fade',
    animationDuration = 1000,
    animationDelay = 0,
    
    // Auto features
    autoDownload = false,
    downloadFileName = 'qrcode',
    downloadFormat = 'png',
    
    // Other props
    typeNumber,
    className,
    style,
    containerStyle,
    loadingComponent,
    errorComponent,
    
    // Event handlers
    onReady,
    onError,
    onClick,
    onDownload,
    onHover,
  } = props;
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const qrInstanceRef = useRef<QRCodeInstance>();
  const animationTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Generate QR code
  const generateQRCode = useCallback(async () => {
    if (!containerRef.current) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Clean up existing instance
      if (qrInstanceRef.current) {
        qrInstanceRef.current.destroy();
      }
      
      // Reset animation
      if (animated) {
        setAnimationClass('');
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      // Create config
      const styleConfig: QRCodeStyle = {
        size,
        margin,
        fgColor,
        bgColor,
        cornerRadius,
        dotStyle,
        gradient,
        backgroundGradient,
        invert,
        rotate,
      };
      
      const config: QRCodeConfig = {
        content,
        errorCorrectionLevel,
        renderType,
        typeNumber,
        style: styleConfig,
        logo,
      };
      
      // Create new instance
      qrInstanceRef.current = createQRCode({
        ...config,
        container: containerRef.current,
      });
      
      // Apply animation
      if (animated) {
        animationTimeoutRef.current = setTimeout(() => {
          setAnimationClass(`qrcode-${animationType}-in`);
        }, animationDelay);
      }
      
      setIsLoading(false);
      
      // Success callback
      if (onReady) {
        onReady(qrInstanceRef.current);
      }
      
      // Auto download
      if (autoDownload) {
        setTimeout(() => {
          handleDownload();
        }, 500);
      }
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsLoading(false);
      
      if (onError) {
        onError(error);
      }
      
      console.error('Failed to generate QR code:', error);
    }
  }, [
    content,
    errorCorrectionLevel,
    renderType,
    size,
    margin,
    fgColor,
    bgColor,
    cornerRadius,
    dotStyle,
    gradient,
    backgroundGradient,
    invert,
    rotate,
    logo,
    typeNumber,
    animated,
    animationType,
    animationDelay,
    autoDownload,
    onReady,
    onError,
  ]);
  
  // Download handler
  const handleDownload = useCallback((
    fileName?: string,
    format?: 'png' | 'jpeg' | 'svg',
    quality?: number
  ) => {
    if (!qrInstanceRef.current) return;
    
    const actualFileName = fileName || downloadFileName;
    const actualFormat = format || downloadFormat;
    
    if (actualFormat === 'svg') {
      const svgString = qrInstanceRef.current.toSVGString();
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${actualFileName}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      qrInstanceRef.current.download({
        fileName: actualFileName,
        format: actualFormat as 'png' | 'jpeg',
        quality,
      });
    }
    
    if (onDownload) {
      onDownload({ fileName: actualFileName, format: actualFormat });
    }
  }, [downloadFileName, downloadFormat, onDownload]);
  
  // Refresh handler
  const refresh = useCallback(() => {
    generateQRCode();
  }, [generateQRCode]);
  
  // Mouse event handlers
  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    if (onHover) {
      onHover(true);
    }
  }, [onHover]);
  
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    if (onHover) {
      onHover(false);
    }
  }, [onHover]);
  
  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    getInstance: () => qrInstanceRef.current,
    toDataURL: (format?: 'png' | 'jpeg', quality?: number) => {
      if (!qrInstanceRef.current) {
        throw new Error('QR code instance not initialized');
      }
      return qrInstanceRef.current.toDataURL(format, quality);
    },
    toSVGString: () => {
      if (!qrInstanceRef.current) {
        throw new Error('QR code instance not initialized');
      }
      return qrInstanceRef.current.toSVGString();
    },
    download: handleDownload,
    refresh,
    isLoading,
  }), [handleDownload, refresh, isLoading]);
  
  // Effect for generating QR code
  useEffect(() => {
    generateQRCode();
    
    return () => {
      if (qrInstanceRef.current) {
        qrInstanceRef.current.destroy();
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [generateQRCode]);
  
  // Container class names
  const containerClassName = useMemo(() => {
    const classes = ['qrcode-container'];
    if (className) classes.push(className);
    if (animationClass) classes.push(animationClass);
    if (isLoading) classes.push('qrcode-loading');
    if (error) classes.push('qrcode-error');
    if (isHovering) classes.push('qrcode-hovering');
    return classes.join(' ');
  }, [className, animationClass, isLoading, error, isHovering]);
  
  // Container styles
  const containerStyles = useMemo(() => ({
    ...containerStyle,
    animationDuration: animated ? `${animationDuration}ms` : undefined,
  }), [containerStyle, animated, animationDuration]);
  
  // Render loading component
  if (isLoading && loadingComponent) {
    return (
      <div className={containerClassName} style={containerStyles}>
        {loadingComponent}
      </div>
    );
  }
  
  // Render error component
  if (error && errorComponent) {
    return (
      <div className={containerClassName} style={containerStyles}>
        {typeof errorComponent === 'function' ? errorComponent(error) : errorComponent}
      </div>
    );
  }
  
  return (
    <div
      ref={containerRef}
      className={containerClassName}
      style={{ ...style, ...containerStyles }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
}));

QRCode.displayName = 'QRCode';

// ========== Advanced Hooks ==========

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

// ========== Batch QR Code Hook ==========

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

// ========== QR Code Context ==========

interface QRCodeContextValue {
  defaultConfig?: Partial<QRCodeConfig>;
  theme?: 'light' | 'dark' | 'auto';
}

const QRCodeContext = createContext<QRCodeContextValue>({});

/**
 * QR Code context provider
 */
export const QRCodeProvider: React.FC<{
  children: ReactNode;
  defaultConfig?: Partial<QRCodeConfig>;
  theme?: 'light' | 'dark' | 'auto';
}> = ({ children, defaultConfig, theme = 'light' }) => {
  const value = useMemo(() => ({
    defaultConfig,
    theme,
  }), [defaultConfig, theme]);
  
  return (
    <QRCodeContext.Provider value={value}>
      {children}
    </QRCodeContext.Provider>
  );
};

/**
 * Hook to access QR code context
 */
export function useQRCodeContext() {
  return useContext(QRCodeContext);
}

// ========== Higher Order Component ==========

export interface WithQRCodeProps {
  qrcode?: {
    generate: (content: string, config?: Partial<QRCodeConfig>) => void;
    download: (fileName?: string) => void;
    dataURL?: string;
    isGenerating: boolean;
    error: Error | null;
  };
}

/**
 * Higher order component that provides QR code functionality
 */
export function withQRCode<P extends object>(
  Component: ComponentType<P & WithQRCodeProps>
): ComponentType<Omit<P, keyof WithQRCodeProps>> {
  return memo((props: Omit<P, keyof WithQRCodeProps>) => {
    const [dataURL, setDataURL] = useState<string>();
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const instanceRef = useRef<QRCodeInstance>();
    
    const generate = useCallback((content: string, config?: Partial<QRCodeConfig>) => {
      setIsGenerating(true);
      setError(null);
      
      try {
        // Create temporary container
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'fixed';
        tempContainer.style.left = '-9999px';
        document.body.appendChild(tempContainer);
        
        // Generate QR code
        if (instanceRef.current) {
          instanceRef.current.destroy();
        }
        
        instanceRef.current = createQRCode({
          content,
          ...config,
          container: tempContainer,
        });
        
        // Get data URL
        const url = instanceRef.current.toDataURL();
        setDataURL(url);
        
        // Cleanup container
        document.body.removeChild(tempContainer);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsGenerating(false);
      }
    }, []);
    
    const download = useCallback((fileName: string = 'qrcode') => {
      if (dataURL) {
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = `${fileName}.png`;
        a.click();
      }
    }, [dataURL]);
    
    useEffect(() => {
      return () => {
        if (instanceRef.current) {
          instanceRef.current.destroy();
        }
      };
    }, []);
    
    const qrcodeProps: WithQRCodeProps = {
      qrcode: {
        generate,
        download,
        dataURL,
        isGenerating,
        error,
      },
    };
    
    return <Component {...(props as P)} {...qrcodeProps} />;
  });
}

// ========== Utility Hooks ==========

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

// ========== CSS Styles ==========

export const QRCodeStyles = `
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
  
  @keyframes qrcode-slide-in {
    from { 
      transform: translateY(-20px);
      opacity: 0;
    }
    to { 
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes qrcode-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .qrcode-container {
    display: inline-block;
    position: relative;
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
  
  .qrcode-slide-in {
    animation: qrcode-slide-in 0.6s ease-in-out;
  }
  
  .qrcode-loading {
    min-height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .qrcode-loading::after {
    content: '';
    width: 30px;
    height: 30px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #333;
    border-radius: 50%;
    animation: qrcode-spin 1s linear infinite;
  }
  
  .qrcode-error {
    color: #ff0000;
    padding: 10px;
    border: 1px solid #ffcccc;
    background: #ffeeee;
    border-radius: 4px;
  }
  
  .qrcode-hovering {
    transform: scale(1.05);
    transition: transform 0.3s ease;
  }
`;

// Export types
export type { QRCodeConfig, QRCodeInstance, ErrorCorrectionLevel, RenderType, LogoConfig, QRCodeStyle };

// Default export
export default QRCode;