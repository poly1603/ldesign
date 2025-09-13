/**
 * 性能测试
 * 测试编辑器的性能表现，包括渲染速度、内存使用、响应时间等
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { FlowchartEditor } from '../core/FlowchartEditor'
import { InteractionOptimizer } from '../performance/InteractionOptimizer'
import { PerformanceMonitor } from '../performance/PerformanceMonitor'
import { MemoryOptimizer } from '../performance/MemoryOptimizer'
import type { FlowchartEditorConfig, FlowchartData } from '../types'

// 性能测试辅助工具
class PerformanceTestHelper {
  private startTime: number = 0
  private endTime: number = 0
  private memoryBefore: number = 0
  private memoryAfter: number = 0

  startMeasurement(): void {
    this.memoryBefore = this.getMemoryUsage()
    this.startTime = performance.now()
  }

  endMeasurement(): {
    duration: number
    memoryDelta: number
  } {
    this.endTime = performance.now()
    this.memoryAfter = this.getMemoryUsage()
    
    return {
      duration: this.endTime - this.startTime,
      memoryDelta: this.memoryAfter - this.memoryBefore
    }
  }

  private getMemoryUsage(): number {
    // @ts-ignore - performance.memory可能不在所有环境中可用
    return performance.memory?.usedJSHeapSize || 0
  }

  static generateLargeDataset(nodeCount: number, edgeCount: number): FlowchartData {
    const nodes = Array.from({ length: nodeCount }, (_, i) => ({
      id: `node-${i}`,
      type: 'process' as const,
      x: (i % 20) * 150,
      y: Math.floor(i / 20) * 100,
      text: `节点 ${i}`,
      properties: {
        description: `这是第${i}个节点的详细描述`,
        priority: i % 5,
        category: ['important', 'normal', 'low'][i % 3],
        data: Array.from({ length: 10 }, (_, j) => `data-${j}`)
      }
    }))

    const edges = Array.from({ length: edgeCount }, (_, i) => {
      const sourceIndex = Math.floor(Math.random() * nodeCount)
      const targetIndex = Math.floor(Math.random() * nodeCount)
      return {
        id: `edge-${i}`,
        type: 'sequence-edge' as const,
        sourceNodeId: `node-${sourceIndex}`,
        targetNodeId: `node-${targetIndex}`,
        text: `连线 ${i}`,
        properties: {
          condition: `condition-${i}`,
          priority: i % 3
        }
      }
    })

    return { nodes, edges }
  }

  static async measureAsync<T>(operation: () => Promise<T>): Promise<{
    result: T
    duration: number
  }> {
    const startTime = performance.now()
    const result = await operation()
    const endTime = performance.now()
    
    return {
      result,
      duration: endTime - startTime
    }
  }

  static measureFrameRate(operation: () => void, duration: number = 1000): Promise<number> {
    return new Promise(resolve => {
      let frameCount = 0
      const startTime = performance.now()
      
      const measureFrame = () => {
        frameCount++
        operation()
        
        if (performance.now() - startTime < duration) {
          requestAnimationFrame(measureFrame)
        } else {
          const actualDuration = performance.now() - startTime
          const fps = (frameCount * 1000) / actualDuration
          resolve(fps)
        }
      }
      
      requestAnimationFrame(measureFrame)
    })
  }
}

describe('性能测试', () => {
  let container: HTMLElement
  let editor: FlowchartEditor
  let performanceHelper: PerformanceTestHelper

  beforeEach(() => {
    container = document.createElement('div')
    container.style.width = '1200px'
    container.style.height = '800px'
    document.body.appendChild(container)
    
    performanceHelper = new PerformanceTestHelper()

    // Mock WebSocket和其他可能影响性能测试的API
    global.WebSocket = vi.fn().mockImplementation(() => ({
      close: vi.fn(),
      send: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      readyState: 1
    })) as any

    // Mock requestAnimationFrame
    vi.stubGlobal('requestAnimationFrame', (callback: () => void) => {
      setTimeout(callback, 16) // 模拟60fps
      return 1
    })
  })

  afterEach(() => {
    if (editor) {
      editor.destroy()
    }
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }
    vi.restoreAllMocks()
  })

  describe('初始化性能', () => {
    it('编辑器初始化应该在合理时间内完成', () => {
      performanceHelper.startMeasurement()
      
      editor = new FlowchartEditor({ 
        container,
        performance: { enabled: true }
      })
      
      const metrics = performanceHelper.endMeasurement()
      
      // 编辑器初始化应该在100ms内完成
      expect(metrics.duration).toBeLessThan(100)
      console.log(`编辑器初始化耗时: ${metrics.duration.toFixed(2)}ms`)
    })

    it('应该能够快速创建多个编辑器实例', () => {
      const containers = Array.from({ length: 10 }, () => {
        const div = document.createElement('div')
        div.style.width = '400px'
        div.style.height = '300px'
        document.body.appendChild(div)
        return div
      })

      performanceHelper.startMeasurement()
      
      const editors = containers.map(container => 
        new FlowchartEditor({ container })
      )
      
      const metrics = performanceHelper.endMeasurement()
      
      editors.forEach(editor => editor.destroy())
      containers.forEach(container => container.remove())
      
      // 创建10个实例应该在500ms内完成
      expect(metrics.duration).toBeLessThan(500)
      console.log(`创建10个编辑器实例耗时: ${metrics.duration.toFixed(2)}ms`)
    })
  })

  describe('渲染性能', () => {
    beforeEach(() => {
      editor = new FlowchartEditor({ 
        container,
        performance: { enabled: true }
      })
    })

    it('小规模数据渲染性能', () => {
      const smallData = PerformanceTestHelper.generateLargeDataset(10, 15)
      
      performanceHelper.startMeasurement()
      editor.render(smallData)
      const metrics = performanceHelper.endMeasurement()
      
      // 小规模数据应该在50ms内完成渲染
      expect(metrics.duration).toBeLessThan(50)
      console.log(`10节点15连线渲染耗时: ${metrics.duration.toFixed(2)}ms`)
    })

    it('中等规模数据渲染性能', () => {
      const mediumData = PerformanceTestHelper.generateLargeDataset(100, 150)
      
      performanceHelper.startMeasurement()
      editor.render(mediumData)
      const metrics = performanceHelper.endMeasurement()
      
      // 中等规模数据应该在200ms内完成渲染
      expect(metrics.duration).toBeLessThan(200)
      console.log(`100节点150连线渲染耗时: ${metrics.duration.toFixed(2)}ms`)
    })

    it('大规模数据渲染性能', () => {
      const largeData = PerformanceTestHelper.generateLargeDataset(500, 750)
      
      performanceHelper.startMeasurement()
      editor.render(largeData)
      const metrics = performanceHelper.endMeasurement()
      
      // 大规模数据应该在1秒内完成渲染
      expect(metrics.duration).toBeLessThan(1000)
      console.log(`500节点750连线渲染耗时: ${metrics.duration.toFixed(2)}ms`)
    })

    it('重复渲染性能', () => {
      const testData = PerformanceTestHelper.generateLargeDataset(50, 75)
      const renderTimes: number[] = []
      
      // 预热
      editor.render(testData)
      
      for (let i = 0; i < 10; i++) {
        performanceHelper.startMeasurement()
        editor.render(testData)
        const metrics = performanceHelper.endMeasurement()
        renderTimes.push(metrics.duration)
      }
      
      const avgRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length
      const maxRenderTime = Math.max(...renderTimes)
      
      // 平均渲染时间应该稳定
      expect(avgRenderTime).toBeLessThan(100)
      expect(maxRenderTime).toBeLessThan(200)
      
      console.log(`平均渲染时间: ${avgRenderTime.toFixed(2)}ms, 最大: ${maxRenderTime.toFixed(2)}ms`)
    })
  })

  describe('交互性能', () => {
    beforeEach(() => {
      editor = new FlowchartEditor({ 
        container,
        performance: { enabled: true }
      })
      
      // 渲染测试数据
      const testData = PerformanceTestHelper.generateLargeDataset(100, 150)
      editor.render(testData)
    })

    it('节点添加性能', () => {
      const addTimes: number[] = []
      
      for (let i = 0; i < 100; i++) {
        performanceHelper.startMeasurement()
        
        editor.addNode({
          type: 'process',
          x: Math.random() * 800,
          y: Math.random() * 600,
          text: `性能测试节点 ${i}`
        })
        
        const metrics = performanceHelper.endMeasurement()
        addTimes.push(metrics.duration)
      }
      
      const avgAddTime = addTimes.reduce((a, b) => a + b, 0) / addTimes.length
      
      // 单次节点添加应该在10ms内完成
      expect(avgAddTime).toBeLessThan(10)
      console.log(`平均节点添加耗时: ${avgAddTime.toFixed(2)}ms`)
    })

    it('节点更新性能', () => {
      const nodeId = editor.addNode({
        type: 'process',
        x: 100,
        y: 100,
        text: '测试节点'
      })
      
      const updateTimes: number[] = []
      
      for (let i = 0; i < 100; i++) {
        performanceHelper.startMeasurement()
        
        editor.updateNode(nodeId, {
          text: `更新文本 ${i}`,
          x: 100 + i,
          y: 100 + i
        })
        
        const metrics = performanceHelper.endMeasurement()
        updateTimes.push(metrics.duration)
      }
      
      const avgUpdateTime = updateTimes.reduce((a, b) => a + b, 0) / updateTimes.length
      
      // 单次节点更新应该在5ms内完成
      expect(avgUpdateTime).toBeLessThan(5)
      console.log(`平均节点更新耗时: ${avgUpdateTime.toFixed(2)}ms`)
    })

    it('缩放操作性能', async () => {
      const zoomOperations = [1.5, 2.0, 0.8, 0.5, 1.0]
      const zoomTimes: number[] = []
      
      for (const scale of zoomOperations) {
        performanceHelper.startMeasurement()
        editor.zoomTo(scale)
        // 等待缩放动画完成
        await new Promise(resolve => setTimeout(resolve, 100))
        const metrics = performanceHelper.endMeasurement()
        zoomTimes.push(metrics.duration)
      }
      
      const avgZoomTime = zoomTimes.reduce((a, b) => a + b, 0) / zoomTimes.length
      
      // 缩放操作应该在150ms内完成（包括动画）
      expect(avgZoomTime).toBeLessThan(150)
      console.log(`平均缩放操作耗时: ${avgZoomTime.toFixed(2)}ms`)
    })
  })

  describe('内存性能', () => {
    it('内存使用应该保持稳定', () => {
      const memoryReadings: number[] = []
      
      // 创建编辑器并渲染数据
      editor = new FlowchartEditor({ container })
      const testData = PerformanceTestHelper.generateLargeDataset(200, 300)
      editor.render(testData)
      
      // 记录初始内存使用
      const initialMemory = performanceHelper['getMemoryUsage']()
      memoryReadings.push(initialMemory)
      
      // 执行多次操作并监控内存
      for (let i = 0; i < 50; i++) {
        // 添加和删除节点
        const nodeId = editor.addNode({
          type: 'process',
          x: Math.random() * 800,
          y: Math.random() * 600,
          text: `临时节点 ${i}`
        })
        
        editor.deleteNode(nodeId)
        
        // 记录内存使用
        memoryReadings.push(performanceHelper['getMemoryUsage']())
      }
      
      // 强制垃圾回收（如果可用）
      if (global.gc) {
        global.gc()
      }
      
      const finalMemory = performanceHelper['getMemoryUsage']()
      const memoryGrowth = finalMemory - initialMemory
      
      // 内存增长应该小于5MB
      expect(memoryGrowth).toBeLessThan(5 * 1024 * 1024)
      console.log(`内存增长: ${(memoryGrowth / 1024 / 1024).toFixed(2)}MB`)
    })

    it('大量数据加载后内存清理', () => {
      editor = new FlowchartEditor({ container })
      
      const initialMemory = performanceHelper['getMemoryUsage']()
      
      // 加载大量数据
      const largeData = PerformanceTestHelper.generateLargeDataset(1000, 1500)
      editor.render(largeData)
      
      const afterLoadMemory = performanceHelper['getMemoryUsage']()
      
      // 清空数据
      editor.clearData()
      
      // 强制垃圾回收
      if (global.gc) {
        global.gc()
      }
      
      setTimeout(() => {
        const afterClearMemory = performanceHelper['getMemoryUsage']()
        const memoryReclaimed = afterLoadMemory - afterClearMemory
        
        // 应该回收至少50%的内存
        const memoryUsed = afterLoadMemory - initialMemory
        expect(memoryReclaimed).toBeGreaterThan(memoryUsed * 0.5)
        
        console.log(`内存回收: ${(memoryReclaimed / 1024 / 1024).toFixed(2)}MB`)
      }, 100)
    })
  })

  describe('性能优化器测试', () => {
    it('InteractionOptimizer性能测试', () => {
      const optimizer = new InteractionOptimizer({
        enabled: true,
        throttleInterval: 16,
        debounceDelay: 50
      })
      
      const mockHandler = vi.fn()
      const optimizedHandler = optimizer.optimizeDragHandler(mockHandler)
      
      performanceHelper.startMeasurement()
      
      // 模拟大量拖拽事件
      for (let i = 0; i < 1000; i++) {
        const mockEvent = new MouseEvent('mousemove', {
          clientX: i,
          clientY: i
        })
        optimizedHandler(mockEvent)
      }
      
      const metrics = performanceHelper.endMeasurement()
      
      // 优化后的处理器应该显著减少实际调用次数
      expect(mockHandler.mock.calls.length).toBeLessThan(100)
      console.log(`优化后处理器调用次数: ${mockHandler.mock.calls.length}`)
    })

    it('MemoryOptimizer性能测试', () => {
      const memoryOptimizer = new MemoryOptimizer({
        enabled: true,
        maxPoolSize: 1000
      })
      
      performanceHelper.startMeasurement()
      
      // 模拟对象池使用
      const objects = []
      for (let i = 0; i < 1000; i++) {
        objects.push(memoryOptimizer.getFromPool('test-object', () => ({
          id: i,
          data: `data-${i}`
        })))
      }
      
      // 回收对象
      objects.forEach(obj => {
        memoryOptimizer.returnToPool('test-object', obj)
      })
      
      const metrics = performanceHelper.endMeasurement()
      
      expect(metrics.duration).toBeLessThan(50)
      console.log(`对象池操作耗时: ${metrics.duration.toFixed(2)}ms`)
    })

    it('PerformanceMonitor准确性测试', () => {
      const monitor = new PerformanceMonitor({
        enabled: true,
        sampleInterval: 100
      })
      
      monitor.start()
      
      // 模拟一些计算密集型操作
      const startTime = performance.now()
      let sum = 0
      for (let i = 0; i < 1000000; i++) {
        sum += Math.sqrt(i)
      }
      const actualDuration = performance.now() - startTime
      
      setTimeout(() => {
        const report = monitor.getPerformanceReport()
        monitor.stop()
        
        // 性能监控器应该能够捕获到性能数据
        expect(report.samples.length).toBeGreaterThan(0)
        console.log(`监控到 ${report.samples.length} 个性能样本`)
        
        if (report.samples.length > 0) {
          const avgCpuUsage = report.samples.reduce((sum, sample) => 
            sum + sample.cpuUsage, 0) / report.samples.length
          console.log(`平均CPU使用率: ${avgCpuUsage.toFixed(2)}%`)
        }
      }, 200)
    })
  })

  describe('帧率性能测试', () => {
    it('动画帧率应该保持稳定', async () => {
      editor = new FlowchartEditor({ 
        container,
        performance: { enabled: true }
      })
      
      const testData = PerformanceTestHelper.generateLargeDataset(100, 150)
      editor.render(testData)
      
      // 测试拖拽操作的帧率
      const fps = await PerformanceTestHelper.measureFrameRate(() => {
        // 模拟拖拽操作
        const randomNodeId = `node-${Math.floor(Math.random() * 100)}`
        editor.updateNode(randomNodeId, {
          x: Math.random() * 800,
          y: Math.random() * 600
        })
      }, 1000)
      
      // 帧率应该保持在30fps以上
      expect(fps).toBeGreaterThan(30)
      console.log(`平均帧率: ${fps.toFixed(2)} FPS`)
    })
  })

  describe('压力测试', () => {
    it('极限数据量处理', () => {
      editor = new FlowchartEditor({ container })
      
      // 生成极大量数据
      const extremeData = PerformanceTestHelper.generateLargeDataset(2000, 3000)
      
      performanceHelper.startMeasurement()
      
      expect(() => {
        editor.render(extremeData)
      }).not.toThrow()
      
      const metrics = performanceHelper.endMeasurement()
      
      // 极限数据应该在5秒内完成渲染
      expect(metrics.duration).toBeLessThan(5000)
      console.log(`极限数据渲染耗时: ${metrics.duration.toFixed(2)}ms`)
    })

    it('高频操作压力测试', async () => {
      editor = new FlowchartEditor({ 
        container,
        performance: { enabled: true }
      })
      
      // 初始化一些数据
      const baseData = PerformanceTestHelper.generateLargeDataset(50, 75)
      editor.render(baseData)
      
      const operationTimes: number[] = []
      
      // 执行1000次随机操作
      for (let i = 0; i < 1000; i++) {
        performanceHelper.startMeasurement()
        
        const operation = Math.floor(Math.random() * 3)
        switch (operation) {
          case 0: // 添加节点
            editor.addNode({
              type: 'process',
              x: Math.random() * 800,
              y: Math.random() * 600,
              text: `压力测试节点 ${i}`
            })
            break
            
          case 1: // 更新节点
            const nodeId = `node-${Math.floor(Math.random() * 50)}`
            editor.updateNode(nodeId, {
              text: `更新 ${i}`,
              x: Math.random() * 800,
              y: Math.random() * 600
            })
            break
            
          case 2: // 缩放
            editor.zoomTo(0.5 + Math.random() * 1.5)
            break
        }
        
        const metrics = performanceHelper.endMeasurement()
        operationTimes.push(metrics.duration)
        
        // 每100次操作后短暂休息，避免阻塞
        if (i % 100 === 0) {
          await new Promise(resolve => setTimeout(resolve, 10))
        }
      }
      
      const avgOperationTime = operationTimes.reduce((a, b) => a + b, 0) / operationTimes.length
      const maxOperationTime = Math.max(...operationTimes)
      
      // 平均操作时间应该保持在合理范围
      expect(avgOperationTime).toBeLessThan(50)
      expect(maxOperationTime).toBeLessThan(200)
      
      console.log(`1000次随机操作 - 平均: ${avgOperationTime.toFixed(2)}ms, 最大: ${maxOperationTime.toFixed(2)}ms`)
    })
  })
})
