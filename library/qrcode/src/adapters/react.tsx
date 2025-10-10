import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState, useCallback } from 'react';
import type { QRCodeConfig, QRCodeInstance, ErrorCorrectionLevel, RenderType, LogoConfig } from '../types';
import { createQRCode } from '../index';

/**
 * QRCode component props
 */
export interface QRCodeProps {
  content: string;
  errorCorrectionLevel?: ErrorCorrectionLevel;
  renderType?: RenderType;
  size?: number;
  margin?: number;
  fgColor?: string;
  bgColor?: string;
  cornerRadius?: number;
  logo?: LogoConfig;
  typeNumber?: number;
  className?: string;
  style?: React.CSSProperties;
  onReady?: (instance: QRCodeInstance) => void;
  onError?: (error: Error) => void;
}

/**
 * QRCode component ref methods
 */
export interface QRCodeRef {
  getInstance: () => QRCodeInstance | undefined;
  toDataURL: (format?: 'png' | 'jpeg', quality?: number) => string;
  download: (fileName?: string, format?: 'png' | 'jpeg', quality?: number) => void;
  toSVGString: () => string;
}

/**
 * React QRCode component
 */
export const QRCode = forwardRef<QRCodeRef, QRCodeProps>((props, ref) => {
  const {
    content,
    errorCorrectionLevel = 'M',
    renderType = 'canvas',
    size = 200,
    margin = 4,
    fgColor = '#000000',
    bgColor = '#ffffff',
    cornerRadius = 0,
    logo,
    typeNumber,
    className,
    style,
    onReady,
    onError,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const qrInstanceRef = useRef<QRCodeInstance>();

  useEffect(() => {
    if (!containerRef.current) return;

    const generateQRCode = async () => {
      try {
        // Clean up existing instance
        if (qrInstanceRef.current) {
          qrInstanceRef.current.destroy();
        }

        // Create config
        const config: QRCodeConfig = {
          content,
          errorCorrectionLevel,
          renderType,
          typeNumber,
          style: {
            size,
            margin,
            fgColor,
            bgColor,
            cornerRadius,
          },
          logo,
        };

        // Create new instance
        qrInstanceRef.current = createQRCode({
          ...config,
          container: containerRef.current!,
        });

        if (onReady) {
          onReady(qrInstanceRef.current);
        }
      } catch (error) {
        if (onError) {
          onError(error as Error);
        }
        console.error('Failed to generate QR code:', error);
      }
    };

    generateQRCode();

    return () => {
      if (qrInstanceRef.current) {
        qrInstanceRef.current.destroy();
      }
    };
  }, [
    content,
    errorCorrectionLevel,
    renderType,
    size,
    margin,
    fgColor,
    bgColor,
    cornerRadius,
    logo,
    typeNumber,
    onReady,
    onError,
  ]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    getInstance: () => qrInstanceRef.current,
    toDataURL: (format?: 'png' | 'jpeg', quality?: number) => {
      if (!qrInstanceRef.current) {
        throw new Error('QR code instance not initialized');
      }
      return qrInstanceRef.current.toDataURL(format, quality);
    },
    download: (fileName?: string, format?: 'png' | 'jpeg', quality?: number) => {
      if (!qrInstanceRef.current) {
        throw new Error('QR code instance not initialized');
      }
      qrInstanceRef.current.download({ fileName, format, quality });
    },
    toSVGString: () => {
      if (!qrInstanceRef.current) {
        throw new Error('QR code instance not initialized');
      }
      return qrInstanceRef.current.toSVGString();
    },
  }));

  return <div ref={containerRef} className={className} style={style} />;
});

QRCode.displayName = 'QRCode';

/**
 * React hook for QR code
 */
export function useQRCode(initialConfig?: QRCodeConfig) {
  const [qrInstance, setQrInstance] = useState<QRCodeInstance>();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const generate = useCallback(async (config: QRCodeConfig) => {
    try {
      setError(null);
      setIsReady(false);

      if (qrInstance) {
        qrInstance.destroy();
      }

      const instance = createQRCode({
        ...config,
        container: containerRef.current || undefined,
      });

      setQrInstance(instance);
      setIsReady(true);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to generate QR code:', err);
    }
  }, [qrInstance]);

  const update = useCallback(async (config: Partial<QRCodeConfig>) => {
    if (!qrInstance) {
      throw new Error('QR code instance not initialized');
    }
    await qrInstance.update(config);
  }, [qrInstance]);

  const toDataURL = useCallback((format?: 'png' | 'jpeg', quality?: number): string => {
    if (!qrInstance) {
      throw new Error('QR code instance not initialized');
    }
    return qrInstance.toDataURL(format, quality);
  }, [qrInstance]);

  const download = useCallback((fileName?: string, format?: 'png' | 'jpeg', quality?: number) => {
    if (!qrInstance) {
      throw new Error('QR code instance not initialized');
    }
    qrInstance.download({ fileName, format, quality });
  }, [qrInstance]);

  const toSVGString = useCallback((): string => {
    if (!qrInstance) {
      throw new Error('QR code instance not initialized');
    }
    return qrInstance.toSVGString();
  }, [qrInstance]);

  const destroy = useCallback(() => {
    if (qrInstance) {
      qrInstance.destroy();
      setQrInstance(undefined);
      setIsReady(false);
    }
  }, [qrInstance]);

  useEffect(() => {
    if (initialConfig) {
      generate(initialConfig);
    }

    return () => {
      destroy();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    containerRef,
    qrInstance,
    isReady,
    error,
    generate,
    update,
    toDataURL,
    download,
    toSVGString,
    destroy,
  };
}

// Export types
export type { QRCodeConfig, QRCodeInstance, ErrorCorrectionLevel, RenderType, LogoConfig };

// Default export
export default QRCode;
