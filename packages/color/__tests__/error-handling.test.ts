import { describe, it, expect } from 'vitest'
import {
  ColorError,
  ValidationError,
  ConversionError,
  validateHexColor,
  validateRgbColor,
  validateHslColor,
  safeColorConversion,
  withErrorRecovery,
  createContextualError,
} from '../src/utils/error-handling'

describe('错误处理系统', () => {
  describe('自定义错误类', () => {
    it('应该创建ColorError', () => {
      const error = new ColorError('测试错误')
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(ColorError)
      expect(error.name).toBe('ColorError')
      expect(error.message).toBe('测试错误')
    })

    it('应该创建ValidationError', () => {
      const error = new ValidationError('验证失败', 'hex')
      expect(error).toBeInstanceOf(ValidationError)
      expect(error.name).toBe('ValidationError')
      expect(error.field).toBe('hex')
    })

    it('应该创建ConversionError', () => {
      const error = new ConversionError('转换失败', 'hex', 'rgb')
      expect(error).toBeInstanceOf(ConversionError)
      expect(error.name).toBe('ConversionError')
      expect(error.from).toBe('hex')
      expect(error.to).toBe('rgb')
    })
  })

  describe('颜色验证函数', () => {
    it('应该验证有效的hex颜色', () => {
      expect(() => validateHexColor('#ff0000')).not.toThrow()
      expect(() => validateHexColor('#000000')).not.toThrow()
      expect(() => validateHexColor('#FFFFFF')).not.toThrow()
    })

    it('应该拒绝无效的hex颜色', () => {
      expect(() => validateHexColor('invalid')).toThrow(ValidationError)
      expect(() => validateHexColor('#gg0000')).toThrow(ValidationError)
      expect(() => validateHexColor('#12345')).toThrow(ValidationError)
    })

    it('应该验证有效的RGB颜色', () => {
      expect(() => validateRgbColor(255, 0, 0)).not.toThrow()
      expect(() => validateRgbColor(0, 255, 0)).not.toThrow()
    })

    it('应该拒绝无效的RGB颜色', () => {
      expect(() => validateRgbColor('invalid' as any, 0, 0)).toThrow(ValidationError)
      expect(() => validateRgbColor(256, 0, 0)).toThrow(ValidationError)
    })

    it('应该验证有效的HSL颜色', () => {
      expect(() => validateHslColor(0, 100, 50)).not.toThrow()
      expect(() => validateHslColor(360, 100, 50)).not.toThrow()
    })

    it('应该拒绝无效的HSL颜色', () => {
      expect(() => validateHslColor('invalid' as any, 100, 50)).toThrow(ValidationError)
      expect(() => validateHslColor(0, 101, 50)).toThrow(ValidationError)
    })
  })

  describe('安全转换函数', () => {
    it('应该安全执行成功的转换', () => {
      const result = safeColorConversion(() => '#ff0000', 'hex', 'hex')
      expect(result).toBe('#ff0000')
    })

    it('应该返回fallback当转换失败时', () => {
      const result = safeColorConversion(() => {
        throw new Error('转换失败')
      }, 'hex', 'rgb', '#000000')
      expect(result).toBe('#000000')
    })

    it('应该抛出错误当没有fallback时', () => {
      expect(() => {
        safeColorConversion(() => {
          throw new Error('转换失败')
        }, 'hex', 'rgb')
      }).toThrow(ConversionError)
    })
  })

  describe('基本功能测试', () => {
    it('应该正确导出错误类', () => {
      expect(ColorError).toBeDefined()
      expect(ValidationError).toBeDefined()
      expect(ConversionError).toBeDefined()
    })

    it('应该正确导出验证函数', () => {
      expect(validateHexColor).toBeDefined()
      expect(validateRgbColor).toBeDefined()
      expect(validateHslColor).toBeDefined()
    })

    it('应该正确导出安全转换函数', () => {
      expect(safeColorConversion).toBeDefined()
    })
  })
})
