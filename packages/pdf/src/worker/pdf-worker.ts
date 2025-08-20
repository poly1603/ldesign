/**
 * PDF渲染Worker
 * 在Web Worker中执行PDF渲染任务
 */
import type {
  WorkerMessage,
  WorkerResponse,
  RenderOptions,
  RenderResult,
  PdfError
} from '../types'
import { ErrorCode } from '../types'

// Worker全局状态
interface WorkerState {
  workerId?: string
  enableLogging: boolean
  initialized: boolean
  pdfjsLib?: any
}

const state: WorkerState = {
  enableLogging: false,
  initialized: false
}

/**
 * 处理Worker消息
 */
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const message = event.data
  
  try {
    log('Received message:', message)
    
    let response: WorkerResponse
    
    switch (message.type) {
      case 'init':
        response = await handleInit(message)
        break
      case 'render':
        response = await handleRender(message)
        break
      case 'destroy':
        response = await handleDestroy(message)
        break
      default:
        response = {
          id: message.id,
          type: 'error',
          error: `Unknown message type: ${message.type}`
        }
    }
    
    self.postMessage(response)
  } catch (error) {
    const errorResponse: WorkerResponse = {
      id: message.id,
      type: 'error',
      error: error instanceof Error ? error.message : String(error)
    }
    
    self.postMessage(errorResponse)
  }
}

/**
 * 处理初始化消息
 */
async function handleInit(message: WorkerMessage): Promise<WorkerResponse> {
  try {
    const { workerId, options } = message.payload || {}
    
    state.workerId = workerId
    state.enableLogging = options?.enableLogging || false
    
    // 初始化PDF.js库
    await initializePdfJs()
    
    state.initialized = true
    log(`Worker ${workerId} initialized successfully`)
    
    return {
      id: message.id,
      type: 'success',
      data: { workerId, initialized: true }
    }
  } catch (error) {
    return {
      id: message.id,
      type: 'error',
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * 处理渲染消息
 */
async function handleRender(message: WorkerMessage): Promise<WorkerResponse> {
  if (!state.initialized) {
    return {
      id: message.id,
      type: 'error',
      error: 'Worker not initialized'
    }
  }
  
  try {
    const { documentData, pageNumber, options } = message.data || message.payload || {}
    
    if (!documentData || !pageNumber) {
      return {
        id: message.id,
        type: 'error',
        error: 'Missing required parameters: documentData or pageNumber'
      }
    }
    
    const result = await renderPage(documentData, pageNumber, options)
    
    return {
      id: message.id,
      type: 'success',
      data: result
    }
  } catch (error) {
    return {
      id: message.id,
      type: 'error',
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * 处理销毁消息
 */
async function handleDestroy(message: WorkerMessage): Promise<WorkerResponse> {
  try {
    // 清理资源
    state.initialized = false
    state.workerId = undefined as any
    
    log('Worker destroyed')
    
    return {
      id: message.id,
      type: 'success',
      data: { destroyed: true }
    }
  } catch (error) {
    return {
      id: message.id,
      type: 'error',
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * 初始化PDF.js库
 */
async function initializePdfJs(): Promise<void> {
  try {
    // 在实际项目中，这里应该动态导入PDF.js库
    // 由于Worker环境的限制，这里使用模拟实现
    
    // 模拟PDF.js库的加载
    state.pdfjsLib = {
      getDocument: mockGetDocument,
      version: '3.11.174'
    }
    
    log('PDF.js library initialized')
  } catch (error) {
    throw new Error(`Failed to initialize PDF.js: ${error}`)
  }
}

/**
 * 渲染PDF页面
 */
async function renderPage(
  documentData: ArrayBuffer | Uint8Array,
  pageNumber: number,
  options: RenderOptions = {}
): Promise<RenderResult> {
  try {
    log(`Rendering page ${pageNumber}`, options)
    
    // 加载PDF文档
    const loadingTask = state.pdfjsLib.getDocument({
      data: documentData,
      ...options
    })
    
    const pdfDocument = await loadingTask.promise
    
    // 获取页面
    const page = await pdfDocument.getPage(pageNumber)
    
    // 获取页面视口
    const viewport = page.getViewport({
      scale: options.scale || 1.0,
      rotation: options.rotation || 0
    })
    
    // 创建Canvas
    const canvas = new OffscreenCanvas(viewport.width, viewport.height)
    const context = canvas.getContext('2d')
    
    if (!context) {
      throw new Error('Failed to get canvas context')
    }
    
    // 渲染页面
    const renderContext = {
      canvasContext: context,
      viewport,
      background: options.background,
      enableWebGL: options.enableWebGL || false,
      renderTextLayer: options.renderTextLayer || false,
      renderAnnotations: options.renderAnnotations || false
    }
    
    const renderTask = page.render(renderContext)
    await renderTask.promise
    
    // 转换为可传输的格式
    const result: RenderResult = {
      promise: Promise.resolve(),
      cancel: () => {}
    } as RenderResult
    
    log(`Page ${pageNumber} rendered successfully`)
    return result
    
  } catch (error) {
    const pdfError = Object.assign(new Error(`Failed to render page ${pageNumber}: ${error}`), {
      code: ErrorCode.RENDER_ERROR
    }) as PdfError
    pdfError.code = ErrorCode.RENDER_ERROR
    throw pdfError
  }
}

/**
 * 模拟PDF.js的getDocument函数
 * 在实际项目中，这应该是真正的PDF.js实现
 */
function mockGetDocument(_options: any) {
  return {
    promise: Promise.resolve({
      numPages: 10, // 模拟10页文档
      getPage: (pageNum: number) => {
        return Promise.resolve({
          getViewport: (params: any) => ({
            width: 595 * (params.scale || 1),
            height: 842 * (params.scale || 1),
            scale: params.scale || 1,
            rotation: params.rotation || 0
          }),
          render: (renderContext: any) => ({
            promise: Promise.resolve().then(() => {
              // 模拟渲染过程
              const { canvasContext, viewport } = renderContext
              
              // 填充白色背景
              canvasContext.fillStyle = renderContext.background || '#ffffff'
              canvasContext.fillRect(0, 0, viewport.width, viewport.height)
              
              // 绘制一些模拟内容
              canvasContext.fillStyle = '#000000'
              canvasContext.font = '16px Arial'
              canvasContext.fillText(
                `Page ${pageNum} - Rendered in Worker`,
                50,
                50
              )
              
              // 绘制一些形状
              canvasContext.strokeStyle = '#0066cc'
              canvasContext.lineWidth = 2
              canvasContext.strokeRect(50, 100, viewport.width - 100, viewport.height - 200)
              
              log(`Mock rendered page ${pageNum}`)
            })
          })
        })
      }
    })
  }
}

/**
 * 日志输出
 */
function log(message: string, ...args: any[]): void {
  if (state.enableLogging) {
    console.warn(`[PDFWorker:${state.workerId}] ${message}`, ...args)
  }
}

/**
 * 错误处理
 */
self.onerror = (error) => {
  console.error('[PDFWorker] Unhandled error:', error)
}

self.onunhandledrejection = (event) => {
  console.error('[PDFWorker] Unhandled promise rejection:', event.reason)
}