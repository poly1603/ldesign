import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
  useCallback,
  useMemo,
  memo,
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
} from '../../../types/index';
import { createQRCode } from '../../../index';

// ========== Component Props ==========

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
  
  // Accessibility
  ariaLabel?: string;
  role?: string;
  tabIndex?: number;
}

export interface QRCodeRef {
  getInstance: () => QRCodeInstance | undefined;
  toDataURL: (format?: 'png' | 'jpeg', quality?: number) => string;
  toSVGString: () => string;
  download: (fileName?: string, format?: 'png' | 'jpeg' | 'svg', quality?: number) => void;
  refresh: () => void;
  isLoading: boolean;
}

// ========== QRCode Component ==========

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
    
    // Accessibility
    ariaLabel = 'QR Code',
    role = 'img',
    tabIndex,
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
      aria-label={ariaLabel}
      role={role}
      tabIndex={tabIndex}
    />
  );
}));

QRCode.displayName = 'QRCode';

export default QRCode;