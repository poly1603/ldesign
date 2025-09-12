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
  protected options: VueAdapterOptions

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
  protected async onInit(): Promise<void> {
    // Vue 特定的初始化逻辑
    if (this.app && this.options.global) {
      this.registerGlobalComponent()
    }
  }

  /**
   * 框架特定的销毁
   */
  protected onDestroy(): void {
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
          handler(newSrc: string | File) {
            if (newSrc && this.cropperInstance) {
              this.cropperInstance.loadImage(newSrc)
            }
          },
          immediate: true,
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
            this.cropperInstance = new (adapter.constructor as any)(container, {
              ...this.options,
              autoInit: false,
            })
            
            await this.cropperInstance.init(container)
            
            // 设置事件监听器
            this.setupEventListeners()
            
            this.$emit('ready', this.cropperInstance)
            
            // 如果有初始图片，加载它
            if (this.src) {
              await this.cropperInstance.loadImage(this.src)
            }
          } catch (error) {
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
          
          this.cropperInstance.on('cropend', (data: any) => {
            this.$emit('update:modelValue', data)
            this.$emit('cropend', data)
          })
          
          this.cropperInstance.on('cropstart', (data: any) => {
            this.$emit('cropstart', data)
          })
          
          this.cropperInstance.on('cropmove', (data: any) => {
            this.$emit('cropmove', data)
          })
          
          this.cropperInstance.on('zoom', (data: any) => {
            this.$emit('zoom', data)
          })
          
          this.cropperInstance.on('error', (error: Error) => {
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
          cropperInstance: null as VueAdapter | null,
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
    let adapter: VueAdapter | null = null

    const init = async () => {
      if (!container.value) {
        throw new Error('Container element is required')
      }
      
      adapter = new VueAdapter(container.value, {
        ...options,
        autoInit: false,
      })
      
      await adapter.init(container.value)
      return adapter
    }

    const destroy = () => {
      if (adapter) {
        adapter.destroy()
        adapter = null
      }
    }

    return {
      adapter,
      init,
      destroy,
      isReady: () => adapter?.isReady() ?? false,
      getState: () => adapter?.getState() ?? AdapterState.IDLE,
      getCropper: () => adapter?.getCropper(),
    }
  }

  /**
   * Vue 插件安装函数
   */
  static install(app: App, options: Partial<VueAdapterOptions> = {}) {
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
