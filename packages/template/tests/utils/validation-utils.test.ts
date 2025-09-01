/**
 * 验证工具函数测试
 */

import type { TemplateMetadata, TemplateSystemConfig } from '../../src/types'
import { describe, expect, it } from 'vitest'
import { validationUtils } from '../../src/utils/validation'

describe('validationUtils', () => {
  describe('validateTemplateMetadata', () => {
    const validTemplate: TemplateMetadata = {
      name: 'test-template',
      displayName: '测试模板',
      description: '这是一个测试模板',
      version: '1.0.0',
      author: 'Test Author',
      category: 'login',
      device: 'desktop',
      componentPath: '/path/to/component.vue',
      lastModified: Date.now(),
      isBuiltIn: false,
    }

    it('应该验证有效的模板元数据', () => {
      const result = validationUtils.validateTemplateMetadata(validTemplate)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该检测缺失的必需字段', () => {
      const invalidTemplate = {
        ...validTemplate,
        name: '',
        displayName: '',
      }

      const result = validationUtils.validateTemplateMetadata(invalidTemplate)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(error => error.includes('name'))).toBe(true)
      expect(result.errors.some(error => error.includes('displayName'))).toBe(true)
    })

    it('应该验证设备类型', () => {
      const invalidTemplate = {
        ...validTemplate,
        device: 'invalid-device' as any,
      }

      const result = validationUtils.validateTemplateMetadata(invalidTemplate)
      expect(result.valid).toBe(false)
      expect(result.errors.some(error => error.includes('device'))).toBe(true)
    })

    it('应该验证模板分类', () => {
      const invalidTemplate = {
        ...validTemplate,
        category: 'invalid-category' as any,
      }

      const result = validationUtils.validateTemplateMetadata(invalidTemplate)
      expect(result.valid).toBe(false)
      expect(result.errors.some(error => error.includes('category'))).toBe(true)
    })

    it('应该验证版本格式', () => {
      const invalidTemplate = {
        ...validTemplate,
        version: 'invalid-version',
      }

      const result = validationUtils.validateTemplateMetadata(invalidTemplate)
      expect(result.valid).toBe(false)
      expect(result.errors.some(error => error.includes('version'))).toBe(true)
    })

    it('应该验证组件路径', () => {
      const invalidTemplate = {
        ...validTemplate,
        componentPath: '',
      }

      const result = validationUtils.validateTemplateMetadata(invalidTemplate)
      expect(result.valid).toBe(false)
      expect(result.errors.some(error => error.includes('componentPath'))).toBe(true)
    })

    it('应该验证可选字段', () => {
      const templateWithOptionalFields = {
        ...validTemplate,
        tags: ['tag1', 'tag2'],
        metadata: { custom: 'value' },
      }

      const result = validationUtils.validateTemplateMetadata(templateWithOptionalFields)
      expect(result.valid).toBe(true)
    })

    it('应该验证标签数组', () => {
      const invalidTemplate = {
        ...validTemplate,
        tags: 'invalid-tags' as any,
      }

      const result = validationUtils.validateTemplateMetadata(invalidTemplate)
      expect(result.valid).toBe(false)
      expect(result.errors.some(error => error.includes('tags'))).toBe(true)
    })
  })

  describe('validateConfig', () => {
    const validConfig: TemplateSystemConfig = {
      templatesDir: 'src/templates',
      autoScan: true,
      enableHMR: false,
      defaultDevice: 'desktop',
      debug: false,
      scanner: {
        maxDepth: 5,
        includeExtensions: ['.vue', '.js', '.ts'],
        excludePatterns: ['node_modules'],
        enableCache: true,
        watchMode: false,
        debounceDelay: 300,
        batchSize: 10,
      },
      cache: {
        enabled: true,
        strategy: 'lru',
        maxSize: 100,
        ttl: 60000,
      },
      errorHandling: {
        enableReporting: true,
        logLevel: 'error',
      },
    }

    it('应该验证有效的配置', () => {
      const result = validationUtils.validateConfig(validConfig)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该检测无效的模板目录', () => {
      const invalidConfig = {
        ...validConfig,
        templatesDir: '',
      }

      const result = validationUtils.validateConfig(invalidConfig)
      expect(result.valid).toBe(false)
      expect(result.errors.some(error => error.includes('templatesDir'))).toBe(true)
    })

    it('应该验证扫描器配置', () => {
      const invalidConfig = {
        ...validConfig,
        scanner: {
          ...validConfig.scanner,
          maxDepth: -1,
          batchSize: 0,
        },
      }

      const result = validationUtils.validateConfig(invalidConfig)
      expect(result.valid).toBe(false)
      expect(result.errors.some(error => error.includes('maxDepth'))).toBe(true)
      expect(result.errors.some(error => error.includes('batchSize'))).toBe(true)
    })

    it('应该验证缓存配置', () => {
      const invalidConfig = {
        ...validConfig,
        cache: {
          ...validConfig.cache,
          strategy: 'invalid-strategy' as any,
          maxSize: -1,
          ttl: -1000,
        },
      }

      const result = validationUtils.validateConfig(invalidConfig)
      expect(result.valid).toBe(false)
      expect(result.errors.some(error => error.includes('strategy'))).toBe(true)
      expect(result.errors.some(error => error.includes('maxSize'))).toBe(true)
      expect(result.errors.some(error => error.includes('ttl'))).toBe(true)
    })

    it('应该验证错误处理配置', () => {
      const invalidConfig = {
        ...validConfig,
        errorHandling: {
          ...validConfig.errorHandling,
          logLevel: 'invalid-level' as any,
        },
      }

      const result = validationUtils.validateConfig(invalidConfig)
      expect(result.valid).toBe(false)
      expect(result.errors.some(error => error.includes('logLevel'))).toBe(true)
    })

    it('应该提供修复建议', () => {
      const invalidConfig = {
        ...validConfig,
        templatesDir: '',
        scanner: {
          ...validConfig.scanner,
          maxDepth: -1,
        },
      }

      const result = validationUtils.validateConfig(invalidConfig)
      expect(result.fixedConfig).toBeDefined()
      expect(result.fixedConfig!.templatesDir).toBe('src/templates')
      expect(result.fixedConfig!.scanner.maxDepth).toBe(5)
    })
  })

  describe('isValidExtension', () => {
    it('应该验证有效的文件扩展名', () => {
      const validExtensions = ['.vue', '.js', '.ts', '.tsx']

      expect(validationUtils.isValidExtension('.vue', validExtensions)).toBe(true)
      expect(validationUtils.isValidExtension('.js', validExtensions)).toBe(true)
      expect(validationUtils.isValidExtension('.ts', validExtensions)).toBe(true)
      expect(validationUtils.isValidExtension('.tsx', validExtensions)).toBe(true)
    })

    it('应该拒绝无效的文件扩展名', () => {
      const validExtensions = ['.vue', '.js', '.ts']

      expect(validationUtils.isValidExtension('.css', validExtensions)).toBe(false)
      expect(validationUtils.isValidExtension('.html', validExtensions)).toBe(false)
      expect(validationUtils.isValidExtension('.txt', validExtensions)).toBe(false)
    })

    it('应该处理大小写不敏感', () => {
      const validExtensions = ['.vue', '.js', '.ts']

      expect(validationUtils.isValidExtension('.VUE', validExtensions)).toBe(true)
      expect(validationUtils.isValidExtension('.JS', validExtensions)).toBe(true)
      expect(validationUtils.isValidExtension('.TS', validExtensions)).toBe(true)
    })

    it('应该处理没有点的扩展名', () => {
      const validExtensions = ['.vue', '.js', '.ts']

      expect(validationUtils.isValidExtension('vue', validExtensions)).toBe(true)
      expect(validationUtils.isValidExtension('js', validExtensions)).toBe(true)
    })
  })

  describe('isValidDeviceType', () => {
    it('应该验证有效的设备类型', () => {
      expect(validationUtils.isValidDeviceType('desktop')).toBe(true)
      expect(validationUtils.isValidDeviceType('tablet')).toBe(true)
      expect(validationUtils.isValidDeviceType('mobile')).toBe(true)
    })

    it('应该拒绝无效的设备类型', () => {
      expect(validationUtils.isValidDeviceType('invalid')).toBe(false)
      expect(validationUtils.isValidDeviceType('laptop')).toBe(false)
      expect(validationUtils.isValidDeviceType('')).toBe(false)
      expect(validationUtils.isValidDeviceType(null as any)).toBe(false)
      expect(validationUtils.isValidDeviceType(undefined as any)).toBe(false)
    })
  })

  describe('isValidTemplateCategory', () => {
    it('应该验证有效的模板分类', () => {
      expect(validationUtils.isValidTemplateCategory('login')).toBe(true)
      expect(validationUtils.isValidTemplateCategory('dashboard')).toBe(true)
      expect(validationUtils.isValidTemplateCategory('user')).toBe(true)
      expect(validationUtils.isValidTemplateCategory('form')).toBe(true)
      expect(validationUtils.isValidTemplateCategory('ecommerce')).toBe(true)
    })

    it('应该拒绝无效的模板分类', () => {
      expect(validationUtils.isValidTemplateCategory('invalid')).toBe(false)
      expect(validationUtils.isValidTemplateCategory('')).toBe(false)
      expect(validationUtils.isValidTemplateCategory(null as any)).toBe(false)
      expect(validationUtils.isValidTemplateCategory(undefined as any)).toBe(false)
    })
  })

  describe('validateVersionFormat', () => {
    it('应该验证有效的版本格式', () => {
      expect(validationUtils.validateVersionFormat('1.0.0')).toBe(true)
      expect(validationUtils.validateVersionFormat('2.1.3')).toBe(true)
      expect(validationUtils.validateVersionFormat('10.20.30')).toBe(true)
      expect(validationUtils.validateVersionFormat('1.0.0-alpha')).toBe(true)
      expect(validationUtils.validateVersionFormat('1.0.0-beta.1')).toBe(true)
    })

    it('应该拒绝无效的版本格式', () => {
      expect(validationUtils.validateVersionFormat('1.0')).toBe(false)
      expect(validationUtils.validateVersionFormat('1')).toBe(false)
      expect(validationUtils.validateVersionFormat('v1.0.0')).toBe(false)
      expect(validationUtils.validateVersionFormat('1.0.0.0')).toBe(false)
      expect(validationUtils.validateVersionFormat('')).toBe(false)
      expect(validationUtils.validateVersionFormat('invalid')).toBe(false)
    })
  })

  describe('validatePath', () => {
    it('应该验证有效的路径', () => {
      expect(validationUtils.validatePath('src/templates')).toBe(true)
      expect(validationUtils.validatePath('/absolute/path')).toBe(true)
      expect(validationUtils.validatePath('./relative/path')).toBe(true)
      expect(validationUtils.validatePath('../parent/path')).toBe(true)
    })

    it('应该拒绝无效的路径', () => {
      expect(validationUtils.validatePath('')).toBe(false)
      expect(validationUtils.validatePath('   ')).toBe(false)
      expect(validationUtils.validatePath('path/with/invalid<>chars')).toBe(false)
      expect(validationUtils.validatePath('path/with/invalid|chars')).toBe(false)
    })

    it('应该处理Windows路径', () => {
      expect(validationUtils.validatePath('C:\\Windows\\System32')).toBe(true)
      expect(validationUtils.validatePath('\\\\server\\share')).toBe(true)
    })
  })

  describe('sanitizeInput', () => {
    it('应该清理用户输入', () => {
      expect(validationUtils.sanitizeInput('  hello world  ')).toBe('hello world')
      expect(validationUtils.sanitizeInput('Hello<script>alert("xss")</script>World')).toBe('HelloWorld')
      expect(validationUtils.sanitizeInput('test\n\r\tstring')).toBe('test string')
    })

    it('应该处理空输入', () => {
      expect(validationUtils.sanitizeInput('')).toBe('')
      expect(validationUtils.sanitizeInput('   ')).toBe('')
      expect(validationUtils.sanitizeInput(null as any)).toBe('')
      expect(validationUtils.sanitizeInput(undefined as any)).toBe('')
    })

    it('应该保留有效字符', () => {
      expect(validationUtils.sanitizeInput('valid-template_name123')).toBe('valid-template_name123')
      expect(validationUtils.sanitizeInput('模板名称')).toBe('模板名称')
    })
  })

  describe('validateEmail', () => {
    it('应该验证有效的邮箱地址', () => {
      expect(validationUtils.validateEmail('test@example.com')).toBe(true)
      expect(validationUtils.validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validationUtils.validateEmail('user+tag@example.org')).toBe(true)
    })

    it('应该拒绝无效的邮箱地址', () => {
      expect(validationUtils.validateEmail('invalid-email')).toBe(false)
      expect(validationUtils.validateEmail('@example.com')).toBe(false)
      expect(validationUtils.validateEmail('user@')).toBe(false)
      expect(validationUtils.validateEmail('')).toBe(false)
    })
  })

  describe('validateUrl', () => {
    it('应该验证有效的URL', () => {
      expect(validationUtils.validateUrl('https://example.com')).toBe(true)
      expect(validationUtils.validateUrl('http://localhost:3000')).toBe(true)
      expect(validationUtils.validateUrl('ftp://files.example.com')).toBe(true)
    })

    it('应该拒绝无效的URL', () => {
      expect(validationUtils.validateUrl('invalid-url')).toBe(false)
      expect(validationUtils.validateUrl('://example.com')).toBe(false)
      expect(validationUtils.validateUrl('')).toBe(false)
    })
  })
})
