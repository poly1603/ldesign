/**
 * @file Vue 3 适配器
 * @description Vue 3 框架的裁剪器适配器
 */

import { BaseAdapter, type AdapterOptions, AdapterState } from './base-adapter'
import type { App, Ref, ComponentPublicInstance } from 'vue'

/**
 * Vue 适配器配置
 */
export interface VueAdapterOptions extends AdapterOptions {
  /** Vue 应用实例 */
  app?: App
  /** 是否作为全局组件注册 */
  global?: boolean
  /** 组件名称 */
  componentName?: string
}

/**
 * Vue 适配器类
 */
export class VueAdapter extends BaseAdapter {
  /** Vue 应用实例 */
  private app?: App

  /** Vue 适配器配置 */
  protected override options: VueAdapterOptions

  /** 默认配置 */
  protected static readonly DEFAULT_VUE_OPTIONS: VueAdapterOptions = {
    ...BaseAdapter.DEFAULT_OPTIONS,
    global: false,
    componentName: 'LCropper',
  }

  /**
   * 构造函数
   * @param container 容器元素或选择器
   * @param options Vue 适配器配置
   */
  constructor(container: HTMLElement | string, options: Partial<VueAdapterOptions> = {}) {
    const mergedOptions = { ...VueAdapter.DEFAULT_VUE_OPTIONS, ...options }
    super(container, mergedOptions)
    this.options = mergedOptions
    this.app = options.app
  }

  /**
   * 框架特定的初始化
   */
  protected override async onInit(): Promise<void> {
    // Vue 特定的初始化逻辑
    if (this.app && this.options.global) {
      this.registerGlobalComponent()
    }
  }

  /**
   * 框架特定的销毁
   */
  protected override onDestroy(): void {
    // Vue 特定的清理逻辑
    if (this.app && this.options.global) {
      // 注意：Vue 3 没有直接的取消注册全局组件的方法
      // 这里只是清理引用
      this.app = undefined
    }
  }

  /**
   * 注册全局组件
   */
  private registerGlobalComponent(): void {
    if (!this.app) return

    const adapter = this
    
    this.app.component(this.options.componentName!, {
      name: this.options.componentName,
      props: {
        src: {
          type: [String, File],
          default: null,
        },
        options: {
          type: Object,
          default: () => ({}),
        },
        modelValue: {
          type: Object,
          default: null,
        },
      },
      emits: [
        'update:modelValue',
        'ready',
        'cropstart',
        'cropmove',
        'cropend',
        'zoom',
        'error',
      ],
      template: `
        <div ref="container" class="l-cropper-container"></div>
      `,
      mounted() {
        this.initCropper()
      },
      beforeUnmount() {
        this.destroyCropper()
      },
      watch: {
        src: {
          async handler(newSrc: string | File) {
            if (newSrc && this.cropperInstance) {
              try {
                await this.cropperInstance.setImage(newSrc)
              } catch (error) {
                this.$emit('error', error)
              }
            }
          },
          immediate: false, // 避免在组件未初始化时触发
        },
        modelValue: {
          handler(newValue: any) {
            if (newValue && this.cropperInstance) {
              this.cropperInstance.setCropData(newValue)
            }
          },
          deep: true,
        },
      },
      methods: {
        async initCropper() {
          try {
            const container = this.$refs.container as HTMLElement
            if (!container) {
              throw new Error('Container reference not found')
            }
            
            // 修复：使用正确的裁剪器类型
            const { Cropper } = await import('../cropper')
            this.cropperInstance = new Cropper({
              container,
              ...this.options,
            })
            
            // 设置事件监听器
            this.setupEventListeners()
            
            this.$emit('ready', this.cropperInstance)
            
            // 如果有初始图片，加载它
            if (this.src) {
              await this.cropperInstance.setImage(this.src)
            }
          } catch (error) {
            console.error('Failed to initialize cropper:', error)
            this.$emit('error', error)
          }
        },
        
        destroyCropper() {
          if (this.cropperInstance) {
            this.cropperInstance.destroy()
            this.cropperInstance = null
          }
        },
        
        setupEventListeners() {
          if (!this.cropperInstance) return
          
          // 修复：使用正确的事件名称
          this.cropperInstance.on('cropChange', (data: any) => {
            this.$emit('update:modelValue', data.cropArea)
            this.$emit('cropend', data)
          })
          
          this.cropperInstance.on('ready', (data: any) => {
            this.$emit('ready', data)
          })
          
          this.cropperInstance.on('zoomChange', (data: any) => {
            this.$emit('zoom', data)
          })
          
          this.cropperInstance.on('imageLoaded', (data: any) => {
            this.$emit('imageLoaded', data)
          })
          
          this.cropperInstance.on('imageError', (error: Error) => {
            this.$emit('error', error)
          })
        },
        
        // 公开方法
        getCropData() {
          return this.cropperInstance?.getCropData()
        },
        
        setCropData(data: any) {
          this.cropperInstance?.setCropData(data)
        },
        
        getCroppedCanvas(options?: any) {
          return this.cropperInstance?.getCroppedCanvas(options)
        },
        
        getCroppedDataURL(format?: string, quality?: number) {
          return this.cropperInstance?.getCroppedDataURL(format, quality)
        },
        
        async getCroppedBlob(format?: string, quality?: number) {
          return this.cropperInstance?.getCroppedBlob(format, quality)
        },
        
        zoom(ratio: number) {
          this.cropperInstance?.zoom(ratio)
        },
        
        rotate(degree: number) {
          this.cropperInstance?.rotate(degree)
        },
        
        flip(horizontal?: boolean, vertical?: boolean) {
          this.cropperInstance?.flip(horizontal, vertical)
        },
        
        reset() {
          this.cropperInstance?.reset()
        },
      },
      data() {
        return {
          cropperInstance: null as any, // 修复类型问题
        }
      },
    })
  }

  /**
   * 创建 Vue 组合式 API
   */
  static useVueCropper(
    container: Ref<HTMLElement | undefined>,
    options: Partial<VueAdapterOptions> = {}
  ) {
    // 使用Vue的相应式数据
    const { ref, reactive, computed, onMounted, onUnmounted } = require('vue')
    
    const state = reactive({
      cropper: null as any,
      isReady: false,
      error: null as Error | null,
    })

    const init = async () => {
      if (!container.value) {
        throw new Error('Container element is required')
      }
      
      try {
        // 修复：直接使用Cropper类
        const { Cropper } = await import('../cropper')
        state.cropper = new Cropper({
          container: container.value,
          ...options,
        })
        
        state.isReady = true
        state.error = null
        return state.cropper
      } catch (error) {
        state.error = error as Error
        state.isReady = false
        throw error
      }
    }

    const destroy = () => {
      if (state.cropper) {
        try {
          state.cropper.destroy()
        } catch (error) {
          console.warn('Error destroying cropper:', error)
        } finally {
          state.cropper = null
          state.isReady = false
          state.error = null
        }
      }
    }
    
    // 便捷方法
    const getCropData = () => state.cropper?.getCropData()
    const setCropData = (data: any) => state.cropper?.setCropData(data)
    const getCroppedCanvas = (config?: any) => state.cropper?.getCroppedCanvas(config)
    const getCroppedBlob = (config?: any) => state.cropper?.getCroppedBlob(config)
    const setImage = async (src: string | File) => {
      if (state.cropper) {
        try {
          await state.cropper.setImage(src)
        } catch (error) {
          state.error = error as Error
          throw error
        }
      }
    }
    
    // 自动清理
    onUnmounted(() => {
      destroy()
    })

    return {
      // 状态
      cropper: computed(() => state.cropper),
      isReady: computed(() => state.isReady),
      error: computed(() => state.error),
      
      // 方法
      init,
      destroy,
      getCropData,
      setCropData,
      getCroppedCanvas,
      getCroppedBlob,
      setImage,
      
      // 兼容性
      getCropper: () => state.cropper,
    }
  }

  /**
   * Vue 插件安装函数
   */
  static install(app: App, options: Partial<VueAdapterOptions> = {}) {
    try {
      // 创建一个临时适配器来注册全局组件
      const tempAdapter = new VueAdapter(document.createElement('div'), {
        ...options,
        app,
        global: true,
        autoInit: false,
      })
      
      // 注册全局组件
      tempAdapter.registerGlobalComponent()
      
      // 提供全局属性
      app.config.globalProperties.$cropper = VueAdapter
      
      // 提供依赖注入
      app.provide('cropper', VueAdapter)
      app.provide('useCropper', VueAdapter.useVueCropper)
    } catch (error) {
      console.warn('Failed to install Vue Cropper plugin:', error)
    }
  }
}

/**
 * Vue 3 组合式 API 导出
 */
export const useVueCropper = VueAdapter.useVueCropper

/**
 * Vue 3 插件导出
 */
export const VueCropperPlugin = {
  install: VueAdapter.install,
}

/**
 * 默认导出
 */
export default VueAdapter
