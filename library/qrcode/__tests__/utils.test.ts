import type { QRCodeOptions } from '../src/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  calculateActualSize,
  canvasToDataURL,
  createError,
  downloadFile,
  generateCacheKey,
  getDefaultOptions,
  isNamedColor,
  isValidColor,
  mergeOptions,
  PerformanceMonitor,
  QRCodeError,
  validateQRCodeOptions,
} from '../src/utils'

describe('utils', () => {
  describe('validateQRCodeOptions', () => {
    it('should validate valid options', () => {
      const options: QRCodeOptions = {
        data: 'Hello World',
        size: 200,
        margin: 4,
        errorCorrectionLevel: 'M',
      }

      const result = validateQRCodeOptions(options)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should return errors for invalid options', () => {
      const options: QRCodeOptions = {
        data: '',
        size: -1,
        margin: -1,
        errorCorrectionLevel: 'INVALID' as any,
      }

      const result = validateQRCodeOptions(options)
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should validate color options', () => {
      const options: QRCodeOptions = {
        data: 'test',
        color: {
          foreground: 'invalid-color',
          background: '#ffffff',
        },
      }

      const result = validateQRCodeOptions(options)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(error => error.includes('foreground'))).toBe(true)
    })
  })

  describe('isValidColor', () => {
    it('should validate hex colors', () => {
      expect(isValidColor('#ffffff')).toBe(true)
      expect(isValidColor('#fff')).toBe(true)
      expect(isValidColor('#FF0000')).toBe(true)
      expect(isValidColor('ffffff')).toBe(false)
      expect(isValidColor('#gggggg')).toBe(false)
    })

    it('should validate rgb colors', () => {
      expect(isValidColor('rgb(255, 255, 255)')).toBe(true)
      expect(isValidColor('rgb(0,0,0)')).toBe(true)
      expect(isValidColor('rgb(256, 0, 0)')).toBe(false)
      expect(isValidColor('rgb(-1, 0, 0)')).toBe(false)
    })

    it('should validate rgba colors', () => {
      expect(isValidColor('rgba(255, 255, 255, 1)')).toBe(true)
      expect(isValidColor('rgba(0,0,0,0.5)')).toBe(true)
      expect(isValidColor('rgba(255, 255, 255, 2)')).toBe(false)
    })

    it('should validate named colors', () => {
      expect(isValidColor('red')).toBe(true)
      expect(isValidColor('blue')).toBe(true)
      expect(isValidColor('transparent')).toBe(true)
      expect(isValidColor('invalidcolor')).toBe(false)
    })
  })

  describe('isNamedColor', () => {
    it('should identify named colors', () => {
      expect(isNamedColor('red')).toBe(true)
      expect(isNamedColor('blue')).toBe(true)
      expect(isNamedColor('transparent')).toBe(true)
      expect(isNamedColor('#ffffff')).toBe(false)
      expect(isNamedColor('rgb(255,0,0)')).toBe(false)
    })
  })

  describe('getDefaultOptions', () => {
    it('should return default options', () => {
      const defaults = getDefaultOptions()

      expect(defaults.size).toBe(200)
      expect(defaults.margin).toBe(4)
      expect(defaults.errorCorrectionLevel).toBe('M')
      expect(defaults.outputFormat).toBe('canvas')
      expect(defaults.data).toBe('')
      expect(defaults.performance.enableCache).toBe(true)
    })
  })

  describe('mergeOptions', () => {
    it('should merge options correctly', () => {
      const defaults = getDefaultOptions()
      const custom: Partial<QRCodeOptions> = {
        data: 'Custom Text',
        size: 300,
        color: {
          foreground: '#ff0000',
        },
      }

      const merged = mergeOptions(defaults, custom)

      expect(merged.data).toBe('Custom Text')
      expect(merged.size).toBe(300)
      expect(merged.margin).toBe(4) // from defaults
      expect(merged.color?.foreground).toBe('#ff0000')
      expect(merged.color?.background).toBe('#FFFFFF') // from defaults
    })
  })

  describe('calculateActualSize', () => {
    it('should calculate actual size correctly', () => {
      const result = calculateActualSize(200, 4)
      expect(result).toBe(208) // 200 + 4*2
    })
  })

  describe('generateCacheKey', () => {
    it('should generate consistent cache keys', () => {
      const options1: QRCodeOptions = {
        data: 'test',
        size: 200,
        margin: 4,
      }

      const options2: QRCodeOptions = {
        data: 'test',
        size: 200,
        margin: 4,
      }

      const key1 = generateCacheKey(options1)
      const key2 = generateCacheKey(options2)

      expect(key1).toBe(key2)
    })

    it('should generate different keys for different options', () => {
      const options1: QRCodeOptions = {
        data: 'test1',
        size: 200,
      }

      const options2: QRCodeOptions = {
        data: 'test2',
        size: 200,
      }

      const key1 = generateCacheKey(options1)
      const key2 = generateCacheKey(options2)

      expect(key1).not.toBe(key2)
    })
  })

  describe('performanceMonitor', () => {
    let monitor: PerformanceMonitor

    beforeEach(() => {
      monitor = new PerformanceMonitor()
    })

    it('should start and end measurements', () => {
      const id = monitor.start('test-operation')
      expect(typeof id).toBe('string')

      const result = monitor.end(id)
      expect(result.operation).toBe('test-operation')
      expect(result.duration).toBeGreaterThanOrEqual(0)
      expect(typeof result.timestamp).toBe('number')
    })

    it('should get all metrics', () => {
      const id1 = monitor.start('op1')
      const id2 = monitor.start('op2')

      monitor.end(id1)
      monitor.end(id2)

      const metrics = monitor.getMetrics()
      expect(metrics).toHaveLength(2)
    })

    it('should get metrics by operation', () => {
      const id1 = monitor.start('op1')
      const id2 = monitor.start('op2')
      const id3 = monitor.start('op1')

      monitor.end(id1)
      monitor.end(id2)
      monitor.end(id3)

      const op1Metrics = monitor.getMetrics('op1')
      expect(op1Metrics).toHaveLength(2)

      const op2Metrics = monitor.getMetrics('op2')
      expect(op2Metrics).toHaveLength(1)
    })

    it('should clear metrics', () => {
      const id = monitor.start('test')
      monitor.end(id)

      expect(monitor.getMetrics()).toHaveLength(1)

      monitor.clear()
      expect(monitor.getMetrics()).toHaveLength(0)
    })
  })

  describe('canvasToDataURL', () => {
    it('should convert canvas to data URL', () => {
      const canvas = document.createElement('canvas')
      const result = canvasToDataURL(canvas, 'image/png', 0.9)

      expect(typeof result).toBe('string')
      expect(result.startsWith('data:image/png;base64,')).toBe(true)
    })
  })

  describe('downloadFile', () => {
    it('should create download link', () => {
      // 简化测试，只验证函数不抛出错误
      expect(() => {
        downloadFile('data:image/png;base64,test', 'test.png')
      }).not.toThrow()
    })
  })

  describe('qRCodeError', () => {
    it('should create error with message and code', () => {
      const error = new QRCodeError('Test error', 'TEST_ERROR')

      expect(error.message).toBe('Test error')
      expect(error.code).toBe('TEST_ERROR')
      expect(error.name).toBe('QRCodeError')
      expect(error instanceof Error).toBe(true)
    })
  })

  describe('createError', () => {
    it('should create error with message and code', () => {
      const error = createError('Test error', 'TEST_ERROR')

      expect(error).toBeInstanceOf(QRCodeError)
      expect(error.message).toBe('Test error')
      expect(error.code).toBe('TEST_ERROR')
    })

    it('should create error with default code', () => {
      const error = createError('Test error')

      expect(error.code).toBe('UNKNOWN_ERROR')
    })
  })
})
