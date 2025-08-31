/**
 * 数据验证工具测试
 */

import { describe, it, expect } from 'vitest'
import {
  isValidPhone,
  isValidIdCard,
  isValidBankCard,
  isValidEmail,
  isValidUrl,
  isValidIPv4,
  isValidIPv6,
  isValidLandline,
  isValidZipCode,
  validatePassword,
  isValidSocialCreditCode,
} from '../validate'

describe('validate utils', () => {
  describe('isValidPhone', () => {
    it('应该正确验证有效的手机号', () => {
      expect(isValidPhone('13812345678')).toBe(true)
      expect(isValidPhone('15987654321')).toBe(true)
      expect(isValidPhone('18612345678')).toBe(true)
      expect(isValidPhone('19912345678')).toBe(true)
    })

    it('应该正确验证带分隔符的手机号', () => {
      expect(isValidPhone('138-1234-5678')).toBe(true)
      expect(isValidPhone('138 1234 5678')).toBe(true)
      expect(isValidPhone('138.1234.5678')).toBe(true)
    })

    it('应该拒绝无效的手机号', () => {
      expect(isValidPhone('12345678901')).toBe(false) // 不以1开头
      expect(isValidPhone('10812345678')).toBe(false) // 第二位不是3-9
      expect(isValidPhone('1381234567')).toBe(false) // 长度不够
      expect(isValidPhone('138123456789')).toBe(false) // 长度过长
      expect(isValidPhone('abc12345678')).toBe(false) // 包含字母
    })
  })

  describe('isValidIdCard', () => {
    it('应该正确验证18位身份证号', () => {
      // 这里使用一些测试用的身份证号（非真实）
      expect(isValidIdCard('11010119900307777X')).toBe(false)
      expect(isValidIdCard('110101199003077774')).toBe(true)
    })

    it('应该正确验证15位身份证号', () => {
      expect(isValidIdCard('110101900307777')).toBe(true)
    })

    it('应该拒绝无效的身份证号', () => {
      expect(isValidIdCard('123456789012345678')).toBe(false) // 无效地区码
      expect(isValidIdCard('11010119001307777X')).toBe(false) // 无效日期
      expect(isValidIdCard('1101011990030777')).toBe(false) // 长度错误
      expect(isValidIdCard('11010119900307777Y')).toBe(false) // 无效校验码
    })
  })

  describe('isValidBankCard', () => {
    it('应该正确验证有效的银行卡号', () => {
      expect(isValidBankCard('6222600260001072444')).toBe(true)
      expect(isValidBankCard('4111111111111111')).toBe(true) // Visa测试卡号
    })

    it('应该正确验证带空格的银行卡号', () => {
      expect(isValidBankCard('6222 6002 6000 1072 444')).toBe(true)
      expect(isValidBankCard('4111 1111 1111 1111')).toBe(true)
    })

    it('应该拒绝无效的银行卡号', () => {
      expect(isValidBankCard('1234567890123456')).toBe(false) // Luhn校验失败
      expect(isValidBankCard('123456789012')).toBe(false) // 长度不够
      expect(isValidBankCard('12345678901234567890')).toBe(false) // 长度过长
    })
  })

  describe('isValidEmail', () => {
    it('应该正确验证有效的邮箱地址', () => {
      expect(isValidEmail('user@example.com')).toBe(true)
      expect(isValidEmail('test.email@domain.co.uk')).toBe(true)
      expect(isValidEmail('user+tag@example.org')).toBe(true)
      expect(isValidEmail('123@456.com')).toBe(true)
    })

    it('应该拒绝无效的邮箱地址', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('user@')).toBe(false)
      expect(isValidEmail('user@.com')).toBe(false)
      expect(isValidEmail('user..name@example.com')).toBe(false)
    })
  })

  describe('isValidUrl', () => {
    it('应该正确验证有效的URL', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://localhost:3000')).toBe(true)
      expect(isValidUrl('ftp://files.example.com')).toBe(true)
      expect(isValidUrl('https://sub.domain.com/path?query=value')).toBe(true)
    })

    it('应该拒绝无效的URL', () => {
      expect(isValidUrl('invalid-url')).toBe(false)
      expect(isValidUrl('http://')).toBe(false)
      expect(isValidUrl('://example.com')).toBe(false)
    })
  })

  describe('isValidIPv4', () => {
    it('应该正确验证有效的IPv4地址', () => {
      expect(isValidIPv4('192.168.1.1')).toBe(true)
      expect(isValidIPv4('127.0.0.1')).toBe(true)
      expect(isValidIPv4('255.255.255.255')).toBe(true)
      expect(isValidIPv4('0.0.0.0')).toBe(true)
    })

    it('应该拒绝无效的IPv4地址', () => {
      expect(isValidIPv4('256.1.1.1')).toBe(false)
      expect(isValidIPv4('192.168.1')).toBe(false)
      expect(isValidIPv4('192.168.1.1.1')).toBe(false)
      expect(isValidIPv4('192.168.01.1')).toBe(false) // 前导零
    })
  })

  describe('isValidIPv6', () => {
    it('应该正确验证有效的IPv6地址', () => {
      expect(isValidIPv6('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true)
      expect(isValidIPv6('2001:db8:85a3::8a2e:370:7334')).toBe(true)
      expect(isValidIPv6('::1')).toBe(true)
      expect(isValidIPv6('::')).toBe(true)
    })

    it('应该拒绝无效的IPv6地址', () => {
      expect(isValidIPv6('2001:0db8:85a3::8a2e::7334')).toBe(false) // 多个::
      expect(isValidIPv6('2001:0db8:85a3:0000:0000:8a2e:0370:7334:extra')).toBe(false) // 过长
      expect(isValidIPv6('gggg::1')).toBe(false) // 无效字符
    })
  })

  describe('isValidLandline', () => {
    it('应该正确验证有效的固定电话', () => {
      expect(isValidLandline('010-12345678')).toBe(true)
      expect(isValidLandline('0755-87654321')).toBe(true)
      expect(isValidLandline('400-123-4567')).toBe(true)
      expect(isValidLandline('800-123-4567')).toBe(true)
    })

    it('应该拒绝无效的固定电话', () => {
      expect(isValidLandline('12345678')).toBe(false) // 没有区号
      expect(isValidLandline('010-123')).toBe(false) // 号码太短
      expect(isValidLandline('1010-12345678')).toBe(false) // 区号太长
    })
  })

  describe('isValidZipCode', () => {
    it('应该正确验证有效的邮政编码', () => {
      expect(isValidZipCode('100000')).toBe(true)
      expect(isValidZipCode('518000')).toBe(true)
      expect(isValidZipCode('200000')).toBe(true)
    })

    it('应该拒绝无效的邮政编码', () => {
      expect(isValidZipCode('12345')).toBe(false) // 长度不够
      expect(isValidZipCode('1234567')).toBe(false) // 长度过长
      expect(isValidZipCode('abcdef')).toBe(false) // 包含字母
    })
  })

  describe('validatePassword', () => {
    it('应该正确评估弱密码', () => {
      const result = validatePassword('123456')
      expect(result.level).toBe('weak')
      expect(result.score).toBeLessThanOrEqual(2)
      expect(result.feedback.length).toBeGreaterThan(0)
    })

    it('应该正确评估中等强度密码', () => {
      const result = validatePassword('Password123')
      expect(result.level).toBe('medium') // 这个密码是中等强度
      expect(result.score).toBeGreaterThanOrEqual(3)
    })

    it('应该正确评估强密码', () => {
      const result = validatePassword('MyPassword123!')
      expect(result.level).toBe('strong')
      expect(result.score).toBeGreaterThanOrEqual(4)
      expect(result.feedback).toEqual([])
    })

    it('应该检测常见密码', () => {
      const result = validatePassword('password')
      expect(result.feedback).toContain('不能使用常见密码')
      expect(result.score).toBeLessThanOrEqual(2)
    })

    it('应该支持自定义配置', () => {
      const result = validatePassword('abc', {
        minLength: 3,
        requireUppercase: false,
        requireNumbers: false,
        requireSymbols: false,
      })
      expect(result.level).toBe('strong') // 当禁用特殊字符要求时，这个密码应该是强密码
      expect(result.feedback).toEqual([])
    })
  })

  describe('isValidSocialCreditCode', () => {
    it('应该正确验证有效的统一社会信用代码', () => {
      // 使用一些测试用的代码（非真实）
      expect(isValidSocialCreditCode('91110000000000000E')).toBe(true)
    })

    it('应该拒绝无效的统一社会信用代码', () => {
      expect(isValidSocialCreditCode('12345678901234567890')).toBe(false) // 长度错误
      expect(isValidSocialCreditCode('9111000000000000OA')).toBe(false) // 包含无效字符O
      expect(isValidSocialCreditCode('91110000000000000B')).toBe(false) // 校验码错误
    })
  })
})
