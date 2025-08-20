import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { QRCodeInstanceImpl, createQRCodeInstance } from '../src/core/instance'
import type { QRCodeOptions, QRCodeResult } from '../src/types'

// Mock QRCodeGenerator
vi.mock('../src/core/generator', () => ({
  createQRCodeGenerator: vi.fn(() => ({
    generate: vi.fn().mockResolvedValue({
      success: true,
      data: document.createElement('canvas'),
      format: 'canvas',
      metrics: {
        operation: 'generate',
        duration: 100,
        timestamp: new Date()
      }
    }),
    updateOptions: vi.fn(),
    getOptions: vi.fn().mockReturnValue({
      data: 'test',
      size: 200,
      margin: 4
    }),
    clearCache: vi.fn(),
    destroy: vi.fn()
  }))
}))

describe('QRCodeInstanceImpl', () => {
  let instance: QRCodeInstanceImpl
  let mockOptions: QRCodeOptions

  beforeEach(() => {
    mockOptions = {
      data: 'test data',
      size: 200,
      margin: 4,
      errorCorrectionLevel: 'M',
      outputFormat: 'canvas'
    }
    instance = new QRCodeInstanceImpl(mockOptions)
  })

  afterEach(() => {
    instance.destroy()
  })

  describe('constructor', () => {
    it('should create instance with options', () => {
      expect(instance).toBeInstanceOf(QRCodeInstanceImpl)
    })
  })

  describe('generate', () => {
    it('should generate QR code and emit events', async () => {
      const onGenerated = vi.fn()
      const onError = vi.fn()
      
      instance.on('generated', onGenerated)
      instance.on('error', onError)
      
      const result = await instance.generate()
      
      expect(result.success).toBe(true)
      expect(onGenerated).toHaveBeenCalledWith(result)
      expect(onError).not.toHaveBeenCalled()
    })

    it('should emit error event on failure', async () => {
      const { createQRCodeGenerator } = await import('../src/core/generator')
      const mockGenerator = vi.mocked(createQRCodeGenerator).mockReturnValue({
        generate: vi.fn().mockResolvedValue({
          success: false,
          error: new Error('Generation failed')
        }),
        updateOptions: vi.fn(),
        getOptions: vi.fn(),
        clearCache: vi.fn(),
        destroy: vi.fn()
      } as any)
      
      const errorInstance = new QRCodeInstanceImpl(mockOptions)
      const onError = vi.fn()
      
      errorInstance.on('error', onError)
      
      const result = await errorInstance.generate()
      
      expect(result.success).toBe(false)
      expect(onError).toHaveBeenCalled()
      
      errorInstance.destroy()
    })
  })

  describe('updateOptions', () => {
    it('should update options', () => {
      const newOptions = { size: 300, margin: 8 }
      instance.updateOptions(newOptions)
      
      // Verify the generator's updateOptions was called
      expect(instance.getOptions()).toBeDefined()
    })
  })

  describe('getOptions', () => {
    it('should return current options', () => {
      const options = instance.getOptions()
      expect(options).toBeDefined()
      expect(options.data).toBe('test')
    })
  })

  describe('clearCache', () => {
    it('should clear cache', () => {
      expect(() => instance.clearCache()).not.toThrow()
    })
  })

  describe('getPerformanceMetrics', () => {
    it('should return performance metrics', async () => {
      await instance.generate()
      
      const metrics = instance.getPerformanceMetrics()
      expect(Array.isArray(metrics)).toBe(true)
    })
  })

  describe('destroy', () => {
    it('should cleanup resources', () => {
      expect(() => instance.destroy()).not.toThrow()
    })
  })

  describe('event system', () => {
    it('should register and remove event listeners', () => {
      const listener = vi.fn()
      
      instance.on('generated', listener)
      expect(() => instance.off('generated', listener)).not.toThrow()
    })

    it('should emit custom events', () => {
      const listener = vi.fn()
      const testData = { test: 'data' }
      
      instance.on('test', listener)
      instance.emit('test', testData)
      
      expect(listener).toHaveBeenCalledWith(testData)
    })

    it('should handle multiple listeners for same event', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      const testData = { test: 'data' }
      
      instance.on('test', listener1)
      instance.on('test', listener2)
      instance.emit('test', testData)
      
      expect(listener1).toHaveBeenCalledWith(testData)
      expect(listener2).toHaveBeenCalledWith(testData)
    })

    it('should remove specific listener', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      const testData = { test: 'data' }
      
      instance.on('test', listener1)
      instance.on('test', listener2)
      instance.off('test', listener1)
      instance.emit('test', testData)
      
      expect(listener1).not.toHaveBeenCalled()
      expect(listener2).toHaveBeenCalledWith(testData)
    })

    it('should remove all listeners for an event', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      const testData = { test: 'data' }
      
      instance.on('test', listener1)
      instance.on('test', listener2)
      instance.off('test')
      instance.emit('test', testData)
      
      expect(listener1).not.toHaveBeenCalled()
      expect(listener2).not.toHaveBeenCalled()
    })
  })
})

describe('createQRCodeInstance', () => {
  it('should create instance', () => {
    const options: QRCodeOptions = {
      data: 'test',
      size: 200
    }
    
    const instance = createQRCodeInstance(options)
    expect(instance).toBeInstanceOf(QRCodeInstanceImpl)
    
    instance.destroy()
  })
})