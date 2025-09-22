/**
 * 环境变量管理系统单元测试
 * 
 * 测试环境变量的加载、验证、处理等功能
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  EnvironmentManager,
  EnvFileFinder,
  EnvValidator,
  environmentManager,
  loadEnv,
  getClientEnv,
  generateDefines
} from '../../src/utils/env'
import type { EnvironmentConfig, EnvValidationRule } from '../../src/utils/env'
import { readFile, writeFile, access } from 'fs/promises'

// Mock fs/promises
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  access: vi.fn()
}))

describe('EnvironmentManager', () => {
  let envManager: EnvironmentManager
  const originalEnv = process.env

  beforeEach(() => {
    envManager = new EnvironmentManager()
    // 重置环境变量
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    // 恢复环境变量
    process.env = originalEnv
    vi.clearAllMocks()
  })

  describe('parseEnvFile', () => {
    it('应该正确解析 .env 文件内容', () => {
      const content = `
# 这是注释
API_URL=http://localhost:8080
API_KEY=secret-key
DEBUG=true

# 空行应该被忽略

MULTILINE_VAR="Hello
World"
QUOTED_VAR='single quotes'
UNQUOTED_VAR=no quotes
`

      const result = envManager.parseEnvFile(content)

      expect(result.API_URL).toBe('http://localhost:8080')
      expect(result.API_KEY).toBe('secret-key')
      expect(result.DEBUG).toBe('true')
      expect(result.MULTILINE_VAR).toBe('Hello\nWorld')
      expect(result.QUOTED_VAR).toBe('single quotes')
      expect(result.UNQUOTED_VAR).toBe('no quotes')
    })

    it('应该忽略注释和空行', () => {
      const content = `
# 注释行
  # 缩进的注释

VALID_VAR=value
# 另一个注释
ANOTHER_VAR=another_value
`

      const result = envManager.parseEnvFile(content)

      expect(Object.keys(result)).toEqual(['VALID_VAR', 'ANOTHER_VAR'])
      expect(result.VALID_VAR).toBe('value')
      expect(result.ANOTHER_VAR).toBe('another_value')
    })

    it('应该处理转义字符', () => {
      const content = `
ESCAPED_VAR="Value with \\n newline and \\t tab"
QUOTE_VAR="Value with \\"quotes\\""
BACKSLASH_VAR="Value with \\\\ backslash"
`

      const result = envManager.parseEnvFile(content)

      expect(result.ESCAPED_VAR).toBe('Value with \n newline and \t tab')
      expect(result.QUOTE_VAR).toBe('Value with "quotes"')
      expect(result.BACKSLASH_VAR).toBe('Value with \\ backslash')
    })
  })

  describe('loadEnvFile', () => {
    it('应该成功加载环境变量文件', async () => {
      const envContent = 'TEST_VAR=test_value\nANOTHER_VAR=another_value'
      vi.mocked(readFile).mockResolvedValue(envContent)

      await envManager.loadEnvFile('.env', '/project')

      expect(process.env.TEST_VAR).toBe('test_value')
      expect(process.env.ANOTHER_VAR).toBe('another_value')
    })

    it('应该处理文件不存在的情况', async () => {
      const error = new Error('File not found') as any
      error.code = 'ENOENT'
      vi.mocked(readFile).mockRejectedValue(error)

      // 不应该抛出错误
      await expect(envManager.loadEnvFile('.env', '/project')).resolves.toBeUndefined()
    })

    it('应该处理其他读取错误', async () => {
      const error = new Error('Permission denied')
      vi.mocked(readFile).mockRejectedValue(error)

      // 应该静默处理错误
      await expect(envManager.loadEnvFile('.env', '/project')).resolves.toBeUndefined()
    })
  })

  describe('expandValue', () => {
    beforeEach(() => {
      process.env.BASE_URL = 'http://localhost'
      process.env.PORT = '8080'
      process.env.API_VERSION = 'v1'
    })

    it('应该展开 ${} 格式的环境变量', () => {
      const value = '${BASE_URL}:${PORT}/api/${API_VERSION}'
      const result = envManager.expandValue(value)
      expect(result).toBe('http://localhost:8080/api/v1')
    })

    it('应该展开 $ 格式的环境变量', () => {
      const value = '$BASE_URL:$PORT/api'
      const result = envManager.expandValue(value)
      expect(result).toBe('http://localhost:8080/api')
    })

    it('应该保留未定义的变量', () => {
      const value = '${UNDEFINED_VAR}/api'
      const result = envManager.expandValue(value)
      expect(result).toBe('${UNDEFINED_VAR}/api')
    })

    it('应该处理混合格式', () => {
      const value = '${BASE_URL}:$PORT/api/${API_VERSION}'
      const result = envManager.expandValue(value)
      expect(result).toBe('http://localhost:8080/api/v1')
    })
  })

  describe('loadConfig', () => {
    it('应该加载完整的环境变量配置', async () => {
      const config: EnvironmentConfig = {
        envFile: '.env',
        variables: {
          CUSTOM_VAR: 'custom_value'
        },
        defaults: {
          DEFAULT_VAR: 'default_value'
        },
        required: ['API_KEY']
      }

      // Mock 环境变量文件
      vi.mocked(readFile).mockResolvedValue('API_KEY=secret-key\nLOADED_VAR=loaded_value')
      process.env.API_KEY = 'secret-key'

      await envManager.loadConfig(config)

      expect(process.env.CUSTOM_VAR).toBe('custom_value')
      expect(process.env.DEFAULT_VAR).toBe('default_value')
      expect(process.env.LOADED_VAR).toBe('loaded_value')
    })

    it('应该在缺少必需变量时抛出错误', async () => {
      const config: EnvironmentConfig = {
        required: ['MISSING_VAR']
      }

      await expect(envManager.loadConfig(config)).rejects.toThrow('缺少必需的环境变量: MISSING_VAR')
    })
  })

  describe('getClientEnv', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development'
      process.env.VITE_API_URL = 'http://localhost:8080'
      process.env.VITE_APP_NAME = 'Test App'
      process.env.SECRET_KEY = 'should-not-be-included'
    })

    it('应该返回客户端环境变量', () => {
      const clientEnv = envManager.getClientEnv('VITE_')

      expect(clientEnv.NODE_ENV).toBe('development')
      expect(clientEnv.VITE_API_URL).toBe('http://localhost:8080')
      expect(clientEnv.VITE_APP_NAME).toBe('Test App')
      expect(clientEnv.SECRET_KEY).toBeUndefined()
    })

    it('应该支持自定义前缀', () => {
      process.env.REACT_APP_API_URL = 'http://localhost:3000'
      
      const clientEnv = envManager.getClientEnv('REACT_APP_')

      expect(clientEnv.NODE_ENV).toBe('development')
      expect(clientEnv.REACT_APP_API_URL).toBe('http://localhost:3000')
      expect(clientEnv.VITE_API_URL).toBeUndefined()
    })
  })

  describe('generateDefines', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production'
      process.env.VITE_API_URL = 'https://api.example.com'
    })

    it('应该生成正确的定义对象', () => {
      const defines = envManager.generateDefines('VITE_')

      expect(defines['process.env.NODE_ENV']).toBe('"production"')
      expect(defines['process.env.VITE_API_URL']).toBe('"https://api.example.com"')
    })
  })

  describe('generateEnvFile', () => {
    it('应该生成正确的环境变量文件', async () => {
      const variables = {
        API_URL: 'http://localhost:8080',
        API_KEY: 'secret-key',
        DEBUG: 'true'
      }

      await envManager.generateEnvFile('/path/to/.env', variables, {
        comment: 'Generated environment variables'
      })

      expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
        '/path/to/.env',
        expect.stringContaining('# Generated environment variables'),
        'utf-8'
      )

      const [[, content]] = vi.mocked(writeFile).mock.calls
      expect(content).toContain('API_URL="http://localhost:8080"')
      expect(content).toContain('API_KEY="secret-key"')
      expect(content).toContain('DEBUG="true"')
    })

    it('应该正确转义特殊字符', async () => {
      const variables = {
        MULTILINE: 'Line 1\nLine 2',
        QUOTED: 'Value with "quotes"',
        BACKSLASH: 'Value\\with\\backslash'
      }

      await envManager.generateEnvFile('/path/to/.env', variables)

      const [[, content]] = vi.mocked(writeFile).mock.calls
      expect(content).toContain('MULTILINE="Line 1\\nLine 2"')
      expect(content).toContain('QUOTED="Value with \\"quotes\\""')
      expect(content).toContain('BACKSLASH="Value\\\\with\\\\backslash"')
    })
  })
})

describe('EnvFileFinder', () => {
  let envFinder: EnvFileFinder

  beforeEach(() => {
    envFinder = new EnvFileFinder()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('findEnvFiles', () => {
    it('应该找到存在的环境变量文件', async () => {
      // Mock 文件存在
      vi.mocked(access).mockImplementation((filePath: string) => {
        const fileName = filePath.split('/').pop()
        if (['/.env', '/.env.development'].some(f => filePath.endsWith(f))) {
          return Promise.resolve()
        }
        return Promise.reject(new Error('File not found'))
      })

      const files = await envFinder.findEnvFiles('/project', 'development')

      expect(files).toContain('.env')
      expect(files).toContain('.env.development')
      expect(files).not.toContain('.env.production')
    })

    it('应该包含自定义文件', async () => {
      vi.mocked(access).mockImplementation((filePath: string) => {
        if (filePath.endsWith('/custom.env')) {
          return Promise.resolve()
        }
        return Promise.reject(new Error('File not found'))
      })

      const files = await envFinder.findEnvFiles('/project', 'development', ['custom.env'])

      expect(files).toContain('custom.env')
    })
  })
})

describe('EnvValidator', () => {
  let envValidator: EnvValidator

  beforeEach(() => {
    envValidator = new EnvValidator()
  })

  describe('validate', () => {
    it('应该验证必需的环境变量', () => {
      const variables = { API_KEY: 'secret' }
      const rules: EnvValidationRule[] = [
        { name: 'API_KEY', required: true }
      ]

      const result = envValidator.validate(variables, rules)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该报告缺失的必需变量', () => {
      const variables = {}
      const rules: EnvValidationRule[] = [
        { name: 'API_KEY', required: true }
      ]

      const result = envValidator.validate(variables, rules)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('环境变量 API_KEY 是必需的')
    })

    it('应该验证变量类型', () => {
      const variables = {
        PORT: '3000',
        DEBUG: 'true',
        URL: 'http://localhost',
        EMAIL: 'test@example.com',
        INVALID_NUMBER: 'not-a-number'
      }

      const rules: EnvValidationRule[] = [
        { name: 'PORT', type: 'port' },
        { name: 'DEBUG', type: 'boolean' },
        { name: 'URL', type: 'url' },
        { name: 'EMAIL', type: 'email' },
        { name: 'INVALID_NUMBER', type: 'number' }
      ]

      const result = envValidator.validate(variables, rules)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('环境变量 INVALID_NUMBER 的类型应为 number')
    })

    it('应该验证变量值范围', () => {
      const variables = {
        PORT: '99999', // 超出端口范围
        PERCENTAGE: '150' // 超出百分比范围
      }

      const rules: EnvValidationRule[] = [
        { name: 'PORT', type: 'port' },
        { name: 'PERCENTAGE', type: 'number', min: 0, max: 100 }
      ]

      const result = envValidator.validate(variables, rules)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('环境变量 PORT 的类型应为 port')
      expect(result.errors).toContain('环境变量 PERCENTAGE 应不大于 100')
    })

    it('应该验证枚举值', () => {
      const variables = {
        LOG_LEVEL: 'info',
        INVALID_LEVEL: 'invalid'
      }

      const rules: EnvValidationRule[] = [
        { name: 'LOG_LEVEL', values: ['debug', 'info', 'warn', 'error'] },
        { name: 'INVALID_LEVEL', values: ['debug', 'info', 'warn', 'error'] }
      ]

      const result = envValidator.validate(variables, rules)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('环境变量 INVALID_LEVEL 的值应为: debug, info, warn, error')
    })

    it('应该处理正则表达式验证', () => {
      const variables = {
        VERSION: '1.0.0',
        INVALID_VERSION: 'not-a-version'
      }

      const rules: EnvValidationRule[] = [
        { name: 'VERSION', pattern: /^\d+\.\d+\.\d+$/ },
        { name: 'INVALID_VERSION', pattern: /^\d+\.\d+\.\d+$/ }
      ]

      const result = envValidator.validate(variables, rules)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('环境变量 INVALID_VERSION 的格式不正确')
    })

    it('应该生成废弃警告', () => {
      const variables = {
        OLD_VAR: 'value'
      }

      const rules: EnvValidationRule[] = [
        { name: 'OLD_VAR', deprecated: true, replacement: 'NEW_VAR' }
      ]

      const result = envValidator.validate(variables, rules)

      expect(result.valid).toBe(true)
      expect(result.warnings).toContain('环境变量 OLD_VAR 已废弃，请使用 NEW_VAR')
    })
  })
})

describe('全局函数', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.VITE_API_URL = 'http://test.api'
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('loadEnv 应该正常工作', async () => {
    const config: EnvironmentConfig = {
      variables: { TEST_VAR: 'test_value' }
    }

    vi.mocked(readFile).mockResolvedValue('')

    await loadEnv(config)
    expect(process.env.TEST_VAR).toBe('test_value')
  })

  it('getClientEnv 应该返回客户端环境变量', () => {
    const clientEnv = getClientEnv('VITE_')
    expect(clientEnv.NODE_ENV).toBe('test')
    expect(clientEnv.VITE_API_URL).toBe('http://test.api')
  })

  it('generateDefines 应该生成定义对象', () => {
    const defines = generateDefines('VITE_')
    expect(defines['process.env.NODE_ENV']).toBe('"test"')
    expect(defines['process.env.VITE_API_URL']).toBe('"http://test.api"')
  })
})
