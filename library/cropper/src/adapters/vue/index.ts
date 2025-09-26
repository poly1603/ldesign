/**
 * @ldesign/cropper Vue 3 适配器
 * 
 * 提供Vue 3框架的完整集成支持
 */

import { ref, onMounted, onUnmounted, watch, nextTick, defineComponent, h } from 'vue';
import { Cropper } from '../../core/Cropper';
import type { 
  VueAdapter, 
  VueCropperProps, 
  VueCropperEvents, 
  VueCropperComposable,
  AdapterConfig 
} from '../../types/adapters';
import type { CropperConfig } from '../../types/config';
import type { CropperEvent } from '../../types/events';
import { generateId } from '../../utils/common';

// ============================================================================
// Vue 3 适配器实现
// ============================================================================

/**
 * Vue 3 适配器类
 */
export class Vue3Adapter implements VueAdapter {
  public readonly framework = 'vue' as const;
  public readonly version = '1.0.0';
  public initialized = false;
  
  private config: AdapterConfig;
  private globalConfig: Partial<CropperConfig> = {};

  constructor(config: AdapterConfig = { framework: 'vue' }) {
    this.config = {
      componentName: 'LCropper',
      directiveName: 'cropper',
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
      console.log('[LCropper Vue3] Adapter initialized');
    }
  }

  /**
   * 销毁适配器
   */
  destroy(): void {
    this.initialized = false;
    this.globalConfig = {};
    
    if (this.config.debug) {
      console.log('[LCropper Vue3] Adapter destroyed');
    }
  }

  // ============================================================================
  // 组件适配器接口实现
  // ============================================================================

  /**
   * 创建组件实例
   */
  createComponent(config: VueCropperProps): any {
    return this.createVueComponent();
  }

  /**
   * 更新组件属性
   */
  updateProps(instance: any, props: Partial<VueCropperProps>): void {
    // Vue 3 响应式系统会自动处理属性更新
    if (this.config.debug) {
      console.log('[LCropper Vue3] Props updated:', props);
    }
  }

  /**
   * 绑定事件
   */
  bindEvents(instance: any, events: Record<string, Function>): void {
    // Vue 3 事件绑定通过组件属性处理
    if (this.config.debug) {
      console.log('[LCropper Vue3] Events bound:', Object.keys(events));
    }
  }

  /**
   * 解绑事件
   */
  unbindEvents(instance: any): void {
    // Vue 3 会自动清理事件监听器
    if (this.config.debug) {
      console.log('[LCropper Vue3] Events unbound');
    }
  }

  // ============================================================================
  // Vue 特定方法
  // ============================================================================

  /**
   * 安装Vue插件
   */
  install(app: any, options: AdapterConfig = {}): void {
    // 合并配置
    this.config = { ...this.config, ...options };
    
    // 初始化适配器
    this.initialize();
    
    // 注册全局组件
    app.component(this.config.componentName!, this.createVueComponent());
    
    // 注册全局指令
    app.directive(this.config.directiveName!, this.createDirective());
    
    // 提供全局配置
    app.provide('lcropper-config', this.globalConfig);
    
    if (this.config.debug) {
      console.log('[LCropper Vue3] Plugin installed');
    }
  }

  /**
   * 创建组合式API
   */
  createComposable(): (props?: VueCropperProps) => VueCropperComposable {
    return (props: VueCropperProps = {}) => {
      return useCropper(props, this.globalConfig);
    };
  }

  /**
   * 创建Vue组件
   */
  createVueComponent(): any {
    const adapter = this;
    
    return defineComponent({
      name: this.config.componentName,
      props: {
        config: {
          type: Object as () => Partial<CropperConfig>,
          default: () => ({})
        },
        src: {
          type: [String, Object] as () => string | File | HTMLImageElement,
          default: undefined
        },
        disabled: {
          type: Boolean,
          default: false
        },
        readonly: {
          type: Boolean,
          default: false
        },
        class: {
          type: String,
          default: ''
        },
        style: {
          type: Object,
          default: () => ({})
        }
      },
      emits: [
        'ready',
        'imageLoad',
        'cropChange',
        'transform',
        'export',
        'error'
      ],
      setup(props, { emit, expose }) {
        const containerId = `lcropper-${generateId()}`;
        const containerRef = ref<HTMLElement | null>(null);
        const cropper = ref<Cropper | null>(null);
        const ready = ref(false);
        const loading = ref(false);
        const error = ref<Error | null>(null);

        // 初始化裁剪器
        const initialize = async (config?: Partial<CropperConfig>) => {
          if (!containerRef.value) return;
          
          try {
            loading.value = true;
            error.value = null;
            
            const finalConfig = {
              ...adapter.globalConfig,
              ...props.config,
              ...config,
              container: containerRef.value
            };
            
            cropper.value = new Cropper(containerRef.value, finalConfig);
            
            // 绑定事件
            cropper.value.on('ready', (event: CropperEvent) => {
              ready.value = true;
              emit('ready', cropper.value);
            });
            
            cropper.value.on('imageLoad', (event: CropperEvent) => {
              emit('imageLoad', event);
            });
            
            cropper.value.on('cropChange', (event: CropperEvent) => {
              emit('cropChange', event);
            });
            
            cropper.value.on('transform', (event: CropperEvent) => {
              emit('transform', event);
            });
            
            cropper.value.on('export', (event: CropperEvent) => {
              emit('export', event);
            });
            
            cropper.value.on('error', (err: Error) => {
              error.value = err;
              emit('error', err);
            });
            
            // 设置图片源
            if (props.src) {
              await cropper.value.setImage(props.src);
            }
            
          } catch (err) {
            error.value = err as Error;
            emit('error', err);
          } finally {
            loading.value = false;
          }
        };

        // 设置图片源
        const setImage = async (src: string | File | HTMLImageElement) => {
          if (!cropper.value) return;
          
          try {
            loading.value = true;
            await cropper.value.setImage(src);
          } catch (err) {
            error.value = err as Error;
            emit('error', err);
          } finally {
            loading.value = false;
          }
        };

        // 获取裁剪数据
        const getCropData = () => {
          return cropper.value?.getCropData();
        };

        // 导出图片
        const exportImage = async (options?: any) => {
          if (!cropper.value) throw new Error('Cropper not initialized');
          return await cropper.value.export(options);
        };

        // 重置裁剪器
        const reset = () => {
          cropper.value?.reset();
        };

        // 销毁裁剪器
        const destroy = () => {
          if (cropper.value) {
            cropper.value.destroy();
            cropper.value = null;
            ready.value = false;
          }
        };

        // 监听属性变化
        watch(() => props.src, (newSrc) => {
          if (newSrc && cropper.value) {
            setImage(newSrc);
          }
        });

        watch(() => props.disabled, (disabled) => {
          if (cropper.value) {
            cropper.value.setEnabled(!disabled);
          }
        });

        // 生命周期
        onMounted(async () => {
          await nextTick();
          await initialize();
        });

        onUnmounted(() => {
          destroy();
        });

        // 暴露方法给模板引用
        expose({
          cropper,
          initialize,
          setImage,
          getCropData,
          exportImage,
          reset,
          destroy
        });

        return {
          containerId,
          containerRef,
          cropper,
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
      },
      render() {
        return h('div', {
          ref: 'containerRef',
          id: this.containerId,
          class: [
            'lcropper-container',
            this.class,
            {
              'lcropper-disabled': this.disabled,
              'lcropper-readonly': this.readonly,
              'lcropper-loading': this.loading
            }
          ],
          style: this.style
        }, this.$slots.default?.());
      }
    });
  }

  /**
   * 创建指令
   */
  createDirective(): any {
    const adapter = this;
    
    return {
      mounted(el: HTMLElement, binding: any) {
        const config = {
          ...adapter.globalConfig,
          ...binding.value,
          container: el
        };
        
        const cropper = new Cropper(el, config);
        
        // 将实例存储在元素上
        (el as any).__lcropper__ = cropper;
        
        if (adapter.config.debug) {
          console.log('[LCropper Vue3] Directive mounted');
        }
      },
      
      updated(el: HTMLElement, binding: any) {
        const cropper = (el as any).__lcropper__;
        if (cropper && binding.value !== binding.oldValue) {
          cropper.updateConfig(binding.value);
        }
      },
      
      unmounted(el: HTMLElement) {
        const cropper = (el as any).__lcropper__;
        if (cropper) {
          cropper.destroy();
          delete (el as any).__lcropper__;
        }
        
        if (adapter.config.debug) {
          console.log('[LCropper Vue3] Directive unmounted');
        }
      }
    };
  }
}

// ============================================================================
// 组合式API
// ============================================================================

/**
 * 使用裁剪器的组合式API
 */
export function useCropper(
  props: VueCropperProps = {},
  globalConfig: Partial<CropperConfig> = {}
): VueCropperComposable {
  const containerRef = ref<HTMLElement | null>(null);
  const cropper = ref<Cropper | null>(null);
  const ready = ref(false);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  // 初始化裁剪器
  const initialize = async (config?: Partial<CropperConfig>) => {
    if (!containerRef.value) {
      throw new Error('Container element not found');
    }
    
    try {
      loading.value = true;
      error.value = null;
      
      const finalConfig = {
        ...globalConfig,
        ...props.config,
        ...config,
        container: containerRef.value
      };
      
      cropper.value = new Cropper(containerRef.value, finalConfig);
      
      cropper.value.on('ready', () => {
        ready.value = true;
      });
      
      cropper.value.on('error', (err: Error) => {
        error.value = err;
      });
      
      if (props.src) {
        await cropper.value.setImage(props.src);
      }
      
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 设置图片源
  const setImage = async (src: string | File | HTMLImageElement) => {
    if (!cropper.value) {
      throw new Error('Cropper not initialized');
    }
    
    try {
      loading.value = true;
      await cropper.value.setImage(src);
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 获取裁剪数据
  const getCropData = () => {
    return cropper.value?.getCropData();
  };

  // 导出图片
  const exportImage = async (options?: any) => {
    if (!cropper.value) {
      throw new Error('Cropper not initialized');
    }
    return await cropper.value.export(options);
  };

  // 重置裁剪器
  const reset = () => {
    cropper.value?.reset();
  };

  // 销毁裁剪器
  const destroy = () => {
    if (cropper.value) {
      cropper.value.destroy();
      cropper.value = null;
      ready.value = false;
    }
  };

  // 清理
  onUnmounted(() => {
    destroy();
  });

  return {
    cropper,
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
}

// ============================================================================
// 默认导出
// ============================================================================

/**
 * 创建Vue 3适配器实例
 */
export function createVue3Adapter(config?: AdapterConfig): Vue3Adapter {
  return new Vue3Adapter(config);
}

/**
 * 默认适配器实例
 */
export const vueAdapter = createVue3Adapter();

/**
 * Vue 3插件安装函数
 */
export default {
  install(app: any, options?: AdapterConfig) {
    vueAdapter.install(app, options);
  }
};
