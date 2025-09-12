/**
 * @file React 适配器
 * @description React 框架的裁剪器适配器
 */

import { BaseAdapter, type AdapterOptions, AdapterState } from './base-adapter'

/**
 * React 适配器配置
 */
export interface ReactAdapterOptions extends AdapterOptions {
  /** React 组件的 ref */
  ref?: React.RefObject<HTMLElement>
}

/**
 * React 适配器类
 */
export class ReactAdapter extends BaseAdapter {
  /** React 适配器配置 */
  protected options: ReactAdapterOptions

  /** 默认配置 */
  protected static readonly DEFAULT_REACT_OPTIONS: ReactAdapterOptions = {
    ...BaseAdapter.DEFAULT_OPTIONS,
  }

  /**
   * 构造函数
   * @param container 容器元素或选择器
   * @param options React 适配器配置
   */
  constructor(container: HTMLElement | string, options: Partial<ReactAdapterOptions> = {}) {
    const mergedOptions = { ...ReactAdapter.DEFAULT_REACT_OPTIONS, ...options }
    super(container, mergedOptions)
    this.options = mergedOptions
  }

  /**
   * 框架特定的初始化
   */
  protected async onInit(): Promise<void> {
    // React 特定的初始化逻辑
    // 通常不需要特殊处理，因为 React 组件会处理生命周期
  }

  /**
   * 框架特定的销毁
   */
  protected onDestroy(): void {
    // React 特定的清理逻辑
    // 通常不需要特殊处理，因为 React 组件会处理清理
  }
}

/**
 * React Hook 类型定义
 */
export interface UseCropperOptions extends Partial<ReactAdapterOptions> {
  /** 是否自动初始化 */
  autoInit?: boolean
  /** 依赖数组 */
  deps?: React.DependencyList
}

/**
 * React Hook 返回值类型
 */
export interface UseCropperReturn {
  /** 适配器实例 */
  adapter: ReactAdapter | null
  /** 容器 ref */
  containerRef: React.RefObject<HTMLDivElement>
  /** 是否已准备就绪 */
  isReady: boolean
  /** 适配器状态 */
  state: AdapterState
  /** 错误信息 */
  error: Error | null
  /** 初始化函数 */
  init: () => Promise<void>
  /** 销毁函数 */
  destroy: () => void
  /** 加载图片 */
  loadImage: (source: string | File | HTMLImageElement) => Promise<void>
  /** 获取裁剪数据 */
  getCropData: () => any
  /** 设置裁剪数据 */
  setCropData: (data: any) => void
  /** 获取裁剪后的Canvas */
  getCroppedCanvas: (options?: any) => HTMLCanvasElement | null
  /** 获取裁剪后的Data URL */
  getCroppedDataURL: (format?: string, quality?: number) => string | null
  /** 获取裁剪后的Blob */
  getCroppedBlob: (format?: string, quality?: number) => Promise<Blob | null>
  /** 缩放 */
  zoom: (ratio: number) => void
  /** 旋转 */
  rotate: (degree: number) => void
  /** 翻转 */
  flip: (horizontal?: boolean, vertical?: boolean) => void
  /** 重置 */
  reset: () => void
}

/**
 * React Hook 实现（需要在实际使用时导入 React）
 * 这里提供类型定义和实现逻辑，实际使用时需要配合 React
 */
export function createUseCropper() {
  // 这个函数返回实际的 Hook 实现
  // 需要在有 React 环境的地方调用
  
  return function useCropper(options: UseCropperOptions = {}): UseCropperReturn {
    // 这里需要实际的 React hooks
    // 由于我们在纯 TypeScript 环境中，这里只提供接口定义
    
    throw new Error('useCropper hook must be used in a React environment')
  }
}

/**
 * React 组件 Props 类型
 */
export interface CropperComponentProps extends Partial<ReactAdapterOptions> {
  /** 图片源 */
  src?: string | File | HTMLImageElement
  /** 类名 */
  className?: string
  /** 样式 */
  style?: React.CSSProperties
  /** 准备就绪回调 */
  onReady?: (adapter: ReactAdapter) => void
  /** 裁剪开始回调 */
  onCropStart?: (data: any) => void
  /** 裁剪移动回调 */
  onCropMove?: (data: any) => void
  /** 裁剪结束回调 */
  onCropEnd?: (data: any) => void
  /** 缩放回调 */
  onZoom?: (data: any) => void
  /** 错误回调 */
  onError?: (error: Error) => void
  /** 子元素 */
  children?: React.ReactNode
}

/**
 * React 组件实现工厂函数
 * 返回实际的 React 组件实现
 */
export function createCropperComponent() {
  // 这个函数返回实际的 React 组件
  // 需要在有 React 环境的地方调用
  
  return function CropperComponent(props: CropperComponentProps): JSX.Element {
    // 这里需要实际的 React 实现
    // 由于我们在纯 TypeScript 环境中，这里只提供接口定义
    
    throw new Error('CropperComponent must be used in a React environment')
  }
}

/**
 * React 高阶组件类型
 */
export interface WithCropperProps {
  /** 裁剪器实例 */
  cropper: ReactAdapter | null
}

/**
 * React 高阶组件工厂函数
 */
export function createWithCropper() {
  return function withCropper<P extends object>(
    WrappedComponent: React.ComponentType<P & WithCropperProps>
  ): React.ComponentType<P & Partial<ReactAdapterOptions>> {
    // 这里需要实际的 React 实现
    throw new Error('withCropper HOC must be used in a React environment')
  }
}

/**
 * React Context 类型
 */
export interface CropperContextValue {
  /** 适配器实例 */
  adapter: ReactAdapter | null
  /** 创建新的适配器实例 */
  createAdapter: (container: HTMLElement, options?: Partial<ReactAdapterOptions>) => Promise<ReactAdapter>
  /** 销毁适配器实例 */
  destroyAdapter: (adapter: ReactAdapter) => void
}

/**
 * React Context 工厂函数
 */
export function createCropperContext() {
  // 这里需要实际的 React Context 实现
  throw new Error('CropperContext must be used in a React environment')
}

/**
 * 默认导出
 */
export default ReactAdapter

/**
 * 使用示例（注释形式，实际使用时需要在 React 环境中）
 */

/*
// Hook 使用示例
function MyCropperComponent() {
  const {
    containerRef,
    isReady,
    loadImage,
    getCroppedDataURL,
    error
  } = useCropper({
    aspectRatio: 16 / 9,
    quality: 0.8
  })

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      await loadImage(file)
    }
  }

  const handleCrop = () => {
    const dataURL = getCroppedDataURL()
    console.log('Cropped image:', dataURL)
  }

  return (
    <div>
      <div ref={containerRef} style={{ width: 400, height: 300 }} />
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleCrop} disabled={!isReady}>
        Crop Image
      </button>
      {error && <div>Error: {error.message}</div>}
    </div>
  )
}

// 组件使用示例
function App() {
  const handleCropEnd = (data: any) => {
    console.log('Crop ended:', data)
  }

  return (
    <CropperComponent
      src="/path/to/image.jpg"
      aspectRatio={1}
      onCropEnd={handleCropEnd}
      style={{ width: 400, height: 300 }}
    />
  )
}
*/
