/**
 * @file 高级功能系统测试
 * @description 测试历史管理和批量处理功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { 
  HistoryManager, 
  BatchProcessor,
  AdvancedSystem 
} from '@/advanced'

// Mock HTMLImageElement
class MockImage {
  naturalWidth = 1920
  naturalHeight = 1080
  src = ''
  onload: (() => void) | null = null
  onerror: (() => void) | null = null

  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload()
    }, 10)
  }
}

// Mock HTMLCanvasElement
class MockCanvas {
  width = 0
  height = 0
  
  getContext() {
    return {
      drawImage: vi.fn(),
      getImageData: vi.fn(() => new ImageData(100, 100))
    }
  }
  
  toBlob(callback: (blob: Blob | null) => void) {
    setTimeout(() => {
      callback(new Blob(['mock'], { type: 'image/png' }))
    }, 10)
  }
}

// Mock File
class MockFile extends Blob {
  name: string
  lastModified: number
  
  constructor(name: string) {
    super(['mock file content'], { type: 'image/png' })
    this.name = name
    this.lastModified = Date.now()
  }
}

// Mock FileReader
class MockFileReader {
  onload: ((event: any) => void) | null = null
  onerror: (() => void) | null = null
  result: string | null = null
  
  readAsDataURL(file: Blob) {
    setTimeout(() => {
      this.result = 'data:image/png;base64,mock'
      if (this.onload) {
        this.onload({ target: { result: this.result } })
      }
    }, 10)
  }
}

// 设置全局mocks
global.HTMLImageElement = MockImage as any
global.HTMLCanvasElement = MockCanvas as any
global.File = MockFile as any
global.FileReader = MockFileReader as any
global.ImageData = class MockImageData {
  data: Uint8ClampedArray
  width: number
  height: number
  
  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.data = new Uint8ClampedArray(width * height * 4)
  }
} as any

describe('高级功能系统', () => {
  describe('HistoryManager', () => {
    let historyManager: HistoryManager

    beforeEach(() => {
      historyManager = new HistoryManager()
    })

    afterEach(() => {
      historyManager.destroy()
    })

    it('应该能够创建历史管理器', () => {
      expect(historyManager).toBeInstanceOf(HistoryManager)
    })

    it('应该能够添加历史记录', () => {
      historyManager.addHistory('crop', '裁剪图片', { x: 0, y: 0 }, { x: 10, y: 10 })
      
      const state = historyManager.getState()
      expect(state.totalCount).toBe(1)
      expect(state.canUndo).toBe(true)
      expect(state.canRedo).toBe(false)
    })

    it('应该能够撤销操作', async () => {
      historyManager.addHistory('crop', '裁剪图片', { x: 0, y: 0 }, { x: 10, y: 10 })
      
      // 模拟撤销执行
      setTimeout(() => {
        historyManager.emit('undoExecuted')
      }, 5)
      
      const item = await historyManager.undo()
      
      expect(item).toBeTruthy()
      expect(item?.type).toBe('crop')
      expect(historyManager.canUndo()).toBe(false)
      expect(historyManager.canRedo()).toBe(true)
    })

    it('应该能够重做操作', async () => {
      historyManager.addHistory('crop', '裁剪图片', { x: 0, y: 0 }, { x: 10, y: 10 })
      
      // 先撤销
      setTimeout(() => {
        historyManager.emit('undoExecuted')
      }, 5)
      await historyManager.undo()
      
      // 再重做
      setTimeout(() => {
        historyManager.emit('redoExecuted')
      }, 5)
      const item = await historyManager.redo()
      
      expect(item).toBeTruthy()
      expect(item?.type).toBe('crop')
      expect(historyManager.canUndo()).toBe(true)
      expect(historyManager.canRedo()).toBe(false)
    })

    it('应该能够获取历史状态', () => {
      const state = historyManager.getState()
      
      expect(state).toHaveProperty('currentIndex')
      expect(state).toHaveProperty('totalCount')
      expect(state).toHaveProperty('canUndo')
      expect(state).toHaveProperty('canRedo')
      expect(typeof state.currentIndex).toBe('number')
    })

    it('应该能够获取历史记录列表', () => {
      historyManager.addHistory('crop', '裁剪图片', {}, {})
      historyManager.addHistory('rotate', '旋转图片', {}, {})
      
      const history = historyManager.getHistory()
      expect(history).toHaveLength(2)
      expect(history[0].type).toBe('crop')
      expect(history[1].type).toBe('rotate')
    })

    it('应该能够跳转到指定历史记录', async () => {
      historyManager.addHistory('crop', '裁剪图片', {}, {})
      historyManager.addHistory('rotate', '旋转图片', {}, {})
      historyManager.addHistory('flip', '翻转图片', {}, {})
      
      // 模拟撤销执行
      let undoCount = 0
      historyManager.on('executeUndo', () => {
        setTimeout(() => {
          undoCount++
          historyManager.emit('undoExecuted')
        }, 5)
      })
      
      await historyManager.jumpTo(0)
      
      expect(historyManager.getState().currentIndex).toBe(0)
    })

    it('应该能够清空历史记录', () => {
      historyManager.addHistory('crop', '裁剪图片', {}, {})
      historyManager.clear()
      
      const state = historyManager.getState()
      expect(state.totalCount).toBe(0)
      expect(state.currentIndex).toBe(-1)
    })

    it('应该能够设置最大历史记录数', () => {
      historyManager.setMaxHistorySize(2)
      
      historyManager.addHistory('crop', '裁剪图片', {}, {})
      historyManager.addHistory('rotate', '旋转图片', {}, {})
      historyManager.addHistory('flip', '翻转图片', {}, {})
      
      const state = historyManager.getState()
      expect(state.totalCount).toBe(2) // 应该只保留最新的2条记录
    })

    it('应该能够获取撤销和重做描述', () => {
      historyManager.addHistory('crop', '裁剪图片', {}, {})
      
      expect(historyManager.getUndoDescription()).toBe('裁剪图片')
      expect(historyManager.getRedoDescription()).toBeNull()
    })

    it('应该能够导出和导入历史记录', () => {
      historyManager.addHistory('crop', '裁剪图片', {}, {})
      
      const exported = historyManager.exportHistory()
      expect(typeof exported).toBe('string')
      
      const newManager = new HistoryManager()
      newManager.importHistory(exported)
      
      expect(newManager.getState().totalCount).toBe(1)
      newManager.destroy()
    })
  })

  describe('BatchProcessor', () => {
    let batchProcessor: BatchProcessor

    beforeEach(() => {
      batchProcessor = new BatchProcessor()
    })

    afterEach(() => {
      batchProcessor.destroy()
    })

    it('应该能够创建批量处理器', () => {
      expect(batchProcessor).toBeInstanceOf(BatchProcessor)
    })

    it('应该能够添加任务', () => {
      const taskId = batchProcessor.addTask({
        source: new MockImage() as any,
        cropData: { x: 0, y: 0, width: 100, height: 100 },
        output: { format: 'image/png' }
      })
      
      expect(typeof taskId).toBe('string')
      expect(batchProcessor.getProgress().total).toBe(1)
    })

    it('应该能够批量添加任务', () => {
      const tasks = [
        {
          source: new MockImage() as any,
          cropData: { x: 0, y: 0, width: 100, height: 100 },
          output: { format: 'image/png' }
        },
        {
          source: new MockImage() as any,
          cropData: { x: 10, y: 10, width: 200, height: 200 },
          output: { format: 'image/jpeg' }
        }
      ]
      
      batchProcessor.addTasks(tasks)
      expect(batchProcessor.getProgress().total).toBe(2)
    })

    it('应该能够获取处理进度', () => {
      batchProcessor.addTask({
        source: new MockImage() as any,
        cropData: { x: 0, y: 0, width: 100, height: 100 },
        output: {}
      })
      
      const progress = batchProcessor.getProgress()
      expect(progress).toHaveProperty('total')
      expect(progress).toHaveProperty('completed')
      expect(progress).toHaveProperty('failed')
      expect(progress).toHaveProperty('percentage')
      expect(progress.total).toBe(1)
    })

    it('应该能够获取任务状态', () => {
      const taskId = batchProcessor.addTask({
        source: new MockImage() as any,
        cropData: { x: 0, y: 0, width: 100, height: 100 },
        output: {}
      })
      
      const task = batchProcessor.getTaskStatus(taskId)
      expect(task).toBeTruthy()
      expect(task?.id).toBe(taskId)
      expect(task?.status).toBe('pending')
    })

    it('应该能够移除任务', () => {
      const taskId = batchProcessor.addTask({
        source: new MockImage() as any,
        cropData: { x: 0, y: 0, width: 100, height: 100 },
        output: {}
      })
      
      const removed = batchProcessor.removeTask(taskId)
      expect(removed).toBe(true)
      expect(batchProcessor.getProgress().total).toBe(0)
    })

    it('应该能够清空任务队列', () => {
      batchProcessor.addTask({
        source: new MockImage() as any,
        cropData: { x: 0, y: 0, width: 100, height: 100 },
        output: {}
      })
      
      batchProcessor.clearTasks()
      expect(batchProcessor.getProgress().total).toBe(0)
    })

    it('应该能够开始批量处理', async () => {
      batchProcessor.addTask({
        source: new MockImage() as any,
        cropData: { x: 0, y: 0, width: 100, height: 100 },
        output: {}
      })
      
      const result = await batchProcessor.startProcessing()
      
      expect(result).toHaveProperty('successful')
      expect(result).toHaveProperty('failed')
      expect(result).toHaveProperty('totalTime')
      expect(Array.isArray(result.successful)).toBe(true)
    })

    it('应该能够停止批量处理', () => {
      batchProcessor.addTask({
        source: new MockImage() as any,
        cropData: { x: 0, y: 0, width: 100, height: 100 },
        output: {}
      })
      
      // 开始处理但立即停止
      batchProcessor.startProcessing()
      batchProcessor.stopProcessing()
      
      expect(batchProcessor['isProcessing']).toBe(false)
    })

    it('应该能够重试失败的任务', () => {
      // 这里只测试方法不会抛出错误
      expect(() => batchProcessor.retryFailedTasks()).not.toThrow()
    })

    it('应该能够导出处理结果', () => {
      const exported = batchProcessor.exportResults()
      expect(typeof exported).toBe('string')
      expect(() => JSON.parse(exported)).not.toThrow()
    })
  })

  describe('AdvancedSystem', () => {
    let advancedSystem: AdvancedSystem

    beforeEach(() => {
      advancedSystem = new AdvancedSystem()
    })

    afterEach(() => {
      advancedSystem.destroy()
    })

    it('应该能够创建高级功能系统', () => {
      expect(advancedSystem).toBeInstanceOf(AdvancedSystem)
      expect(advancedSystem.history).toBeInstanceOf(HistoryManager)
      expect(advancedSystem.batch).toBeInstanceOf(BatchProcessor)
    })

    it('应该能够获取系统状态', () => {
      const status = advancedSystem.getSystemStatus()
      
      expect(status).toHaveProperty('history')
      expect(status).toHaveProperty('batch')
      expect(status.history).toHaveProperty('currentIndex')
      expect(status.batch).toHaveProperty('total')
    })

    it('应该能够处理系统间的联动', () => {
      const historyListener = vi.fn()
      advancedSystem.history.on('historyAdded', historyListener)
      
      // 触发批量处理完成事件
      advancedSystem.batch.emit('processingCompleted', {
        successful: [{ id: 'test' }],
        failed: [],
        totalTime: 1000,
        averageTime: 1000
      })
      
      expect(historyListener).toHaveBeenCalled()
    })
  })
})
