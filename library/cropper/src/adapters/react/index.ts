/**
 * @ldesign/cropper React 适配器
 * 
 * 提供React框架的完整集成支持
 */

import React, { 
  useRef, 
  useEffect, 
  useState, 
  useCallback, 
  forwardRef, 
  useImperativeHandle,
  createContext,
  useContext,
  useMemo
} from 'react';
import { Cropper } from '../../core/Cropper';
import type { 
  ReactAdapter, 
  ReactCropperProps, 
  ReactCropperHook,
  AdapterConfig 
} from '../../types/adapters';
import type { CropperConfig } from '../../types/config';
import type { CropperEvent } from '../../types/events';
import { generateId } from '../../utils/common';

// ============================================================================
// React 适配器实现
// ============================================================================

/**
 * React 适配器类
 */
export class ReactCropperAdapter implements ReactAdapter {
  public readonly framework = 'react' as const;
  public readonly version = '1.0.0';
  public initialized = false;
  
  private config: AdapterConfig;
  private globalConfig: Partial<CropperConfig> = {};

  constructor(config: AdapterConfig = { framework: 'react' }) {
    this.config = {
      componentName: 'LCropper',
      development: false,
      debug: false,
      ...config
    };
  }

  // ============================================================================
  // 适配器生命周期
  // ============================================================================

  /**
   * 初始化适配器
   */
  initialize(): void {
    if (this.initialized) return;
    
    this.globalConfig = this.config.globalConfig || {};
    this.initialized = true;
    
    if (this.config.debug) {
      console.log('[LCropper React] Adapter initialized');
    }
  }

  /**
   * 销毁适配器
   */
  destroy(): void {
    this.initialized = false;
    this.globalConfig = {};
    
    if (this.config.debug) {
      console.log('[LCropper React] Adapter destroyed');
    }
  }

  // ============================================================================
  // 组件适配器接口实现
  // ============================================================================

  /**
   * 创建组件实例
   */
  createComponent(config: ReactCropperProps): any {
    return this.createReactComponent();
  }

  /**
   * 更新组件属性
   */
  updateProps(instance: any, props: Partial<ReactCropperProps>): void {
    // React会自动处理属性更新
    if (this.config.debug) {
      console.log('[LCropper React] Props updated:', props);
    }
  }

  /**
   * 绑定事件
   */
  bindEvents(instance: any, events: Record<string, Function>): void {
    // React事件绑定通过组件属性处理
    if (this.config.debug) {
      console.log('[LCropper React] Events bound:', Object.keys(events));
    }
  }

  /**
   * 解绑事件
   */
  unbindEvents(instance: any): void {
    // React会自动清理事件监听器
    if (this.config.debug) {
      console.log('[LCropper React] Events unbound');
    }
  }

  // ============================================================================
  // React 特定方法
  // ============================================================================

  /**
   * 创建React组件
   */
  createReactComponent(): React.ComponentType<ReactCropperProps> {
    const adapter = this;
    
    return forwardRef<any, ReactCropperProps>((props, ref) => {
      const {
        config = {},
        src,
        disabled = false,
        readonly = false,
        className = '',
        style = {},
        onReady,
        onImageLoad,
        onCropChange,
        onTransform,
        onExport,
        onError,
        children,
        ...restProps
      } = props;

      const containerId = useMemo(() => `lcropper-${generateId()}`, []);
      const containerRef = useRef<HTMLDivElement>(null);
      const cropperRef = useRef<Cropper | null>(null);
      const [ready, setReady] = useState(false);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState<Error | null>(null);

      // 初始化裁剪器
      const initialize = useCallback(async (customConfig?: Partial<CropperConfig>) => {
        if (!containerRef.current) return;
        
        try {
          setLoading(true);
          setError(null);
          
          const finalConfig = {
            ...adapter.globalConfig,
            ...config,
            ...customConfig,
            container: containerRef.current
          };
          
          cropperRef.current = new Cropper(containerRef.current, finalConfig);
          
          // 绑定事件
          cropperRef.current.on('ready', (event: CropperEvent) => {
            setReady(true);
            onReady?.(cropperRef.current!);
          });
          
          cropperRef.current.on('imageLoad', (event: CropperEvent) => {
            onImageLoad?.(event);
          });
          
          cropperRef.current.on('cropChange', (event: CropperEvent) => {
            onCropChange?.(event);
          });
          
          cropperRef.current.on('transform', (event: CropperEvent) => {
            onTransform?.(event);
          });
          
          cropperRef.current.on('export', (event: CropperEvent) => {
            onExport?.(event);
          });
          
          cropperRef.current.on('error', (err: Error) => {
            setError(err);
            onError?.(err);
          });
          
          // 设置图片源
          if (src) {
            await cropperRef.current.setImage(src);
          }
          
        } catch (err) {
          const error = err as Error;
          setError(error);
          onError?.(error);
        } finally {
          setLoading(false);
        }
      }, [config, src, onReady, onImageLoad, onCropChange, onTransform, onExport, onError]);

      // 设置图片源
      const setImage = useCallback(async (newSrc: string | File | HTMLImageElement) => {
        if (!cropperRef.current) return;
        
        try {
          setLoading(true);
          await cropperRef.current.setImage(newSrc);
        } catch (err) {
          const error = err as Error;
          setError(error);
          onError?.(error);
        } finally {
          setLoading(false);
        }
      }, [onError]);

      // 获取裁剪数据
      const getCropData = useCallback(() => {
        return cropperRef.current?.getCropData();
      }, []);

      // 导出图片
      const exportImage = useCallback(async (options?: any) => {
        if (!cropperRef.current) {
          throw new Error('Cropper not initialized');
        }
        return await cropperRef.current.export(options);
      }, []);

      // 重置裁剪器
      const reset = useCallback(() => {
        cropperRef.current?.reset();
      }, []);

      // 销毁裁剪器
      const destroy = useCallback(() => {
        if (cropperRef.current) {
          cropperRef.current.destroy();
          cropperRef.current = null;
          setReady(false);
        }
      }, []);

      // 暴露方法给ref
      useImperativeHandle(ref, () => ({
        cropper: cropperRef.current,
        initialize,
        setImage,
        getCropData,
        exportImage,
        reset,
        destroy
      }), [initialize, setImage, getCropData, exportImage, reset, destroy]);

      // 初始化
      useEffect(() => {
        initialize();
        return () => {
          destroy();
        };
      }, []);

      // 监听src变化
      useEffect(() => {
        if (src && cropperRef.current) {
          setImage(src);
        }
      }, [src, setImage]);

      // 监听disabled变化
      useEffect(() => {
        if (cropperRef.current) {
          cropperRef.current.setEnabled(!disabled);
        }
      }, [disabled]);

      return React.createElement('div', {
        ref: containerRef,
        id: containerId,
        className: [
          'lcropper-container',
          className,
          disabled && 'lcropper-disabled',
          readonly && 'lcropper-readonly',
          loading && 'lcropper-loading'
        ].filter(Boolean).join(' '),
        style,
        ...restProps
      }, children);
    });
  }

  /**
   * 创建React Hook
   */
  createHook(): (config?: Partial<CropperConfig>) => ReactCropperHook {
    const adapter = this;
    
    return (config: Partial<CropperConfig> = {}) => {
      const containerRef = useRef<HTMLDivElement>(null);
      const cropperRef = useRef<Cropper | null>(null);
      const [ready, setReady] = useState(false);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState<Error | null>(null);

      // 初始化裁剪器
      const initialize = useCallback(async (customConfig?: Partial<CropperConfig>) => {
        if (!containerRef.current) {
          throw new Error('Container element not found');
        }
        
        try {
          setLoading(true);
          setError(null);
          
          const finalConfig = {
            ...adapter.globalConfig,
            ...config,
            ...customConfig,
            container: containerRef.current
          };
          
          cropperRef.current = new Cropper(containerRef.current, finalConfig);
          
          cropperRef.current.on('ready', () => {
            setReady(true);
          });
          
          cropperRef.current.on('error', (err: Error) => {
            setError(err);
          });
          
        } catch (err) {
          setError(err as Error);
          throw err;
        } finally {
          setLoading(false);
        }
      }, [config]);

      // 设置图片源
      const setImage = useCallback(async (src: string | File | HTMLImageElement) => {
        if (!cropperRef.current) {
          throw new Error('Cropper not initialized');
        }
        
        try {
          setLoading(true);
          await cropperRef.current.setImage(src);
        } catch (err) {
          setError(err as Error);
          throw err;
        } finally {
          setLoading(false);
        }
      }, []);

      // 获取裁剪数据
      const getCropData = useCallback(() => {
        return cropperRef.current?.getCropData();
      }, []);

      // 导出图片
      const exportImage = useCallback(async (options?: any) => {
        if (!cropperRef.current) {
          throw new Error('Cropper not initialized');
        }
        return await cropperRef.current.export(options);
      }, []);

      // 重置裁剪器
      const reset = useCallback(() => {
        cropperRef.current?.reset();
      }, []);

      // 销毁裁剪器
      const destroy = useCallback(() => {
        if (cropperRef.current) {
          cropperRef.current.destroy();
          cropperRef.current = null;
          setReady(false);
        }
      }, []);

      // 清理
      useEffect(() => {
        return () => {
          destroy();
        };
      }, [destroy]);

      return {
        cropper: cropperRef.current,
        containerRef,
        ready,
        loading,
        error,
        initialize,
        setImage,
        getCropData,
        exportImage,
        reset,
        destroy
      };
    };
  }

  /**
   * 创建高阶组件
   */
  createHOC(): <P extends object>(Component: React.ComponentType<P>) => React.ComponentType<P & ReactCropperProps> {
    return <P extends object>(Component: React.ComponentType<P>) => {
      return forwardRef<any, P & ReactCropperProps>((props, ref) => {
        const { config, src, onReady, onError, ...componentProps } = props;
        const hook = this.createHook();
        const cropper = hook(config);

        useEffect(() => {
          if (src) {
            cropper.setImage(src).catch(onError);
          }
        }, [src]);

        useEffect(() => {
          if (cropper.ready && onReady) {
            onReady(cropper.cropper!);
          }
        }, [cropper.ready]);

        return React.createElement(Component, {
          ...componentProps as P,
          ref,
          cropper: cropper.cropper,
          containerRef: cropper.containerRef
        });
      });
    };
  }

  /**
   * 创建Context
   */
  createContext(): {
    Provider: React.ComponentType<{ value: Cropper | null; children: React.ReactNode }>;
    Consumer: React.ComponentType<{ children: (cropper: Cropper | null) => React.ReactNode }>;
    useContext: () => Cropper | null;
  } {
    const CropperContext = createContext<Cropper | null>(null);
    
    return {
      Provider: CropperContext.Provider,
      Consumer: CropperContext.Consumer,
      useContext: () => useContext(CropperContext)
    };
  }
}

// ============================================================================
// Hook 导出
// ============================================================================

/**
 * 使用裁剪器的React Hook
 */
export function useCropper(config: Partial<CropperConfig> = {}): ReactCropperHook {
  const adapter = new ReactCropperAdapter();
  const hook = adapter.createHook();
  return hook(config);
}

// ============================================================================
// 组件导出
// ============================================================================

/**
 * React 裁剪器组件
 */
export const LCropper = (() => {
  const adapter = new ReactCropperAdapter();
  return adapter.createReactComponent();
})();

// ============================================================================
// 默认导出
// ============================================================================

/**
 * 创建React适配器实例
 */
export function createReactAdapter(config?: AdapterConfig): ReactCropperAdapter {
  return new ReactCropperAdapter(config);
}

/**
 * 默认适配器实例
 */
export const reactAdapter = createReactAdapter();

/**
 * 默认导出
 */
export default {
  LCropper,
  useCropper,
  createReactAdapter,
  reactAdapter
};
