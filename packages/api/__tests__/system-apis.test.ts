import type { ApiEngine } from '../src/types'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApiEngine } from '../src/core/api-engine'
import {
  createSystemApiPlugin,
  SYSTEM_API_METHODS,
} from '../src/plugins/system-apis'

describe('systemApiPlugin', () => {
  let apiEngine: ApiEngine

  beforeEach(() => {
    apiEngine = createApiEngine({
      debug: false,
      cache: { enabled: false },
      debounce: { enabled: false },
      deduplication: { enabled: false },
    })
  })

  describe('插件创建', () => {
    it('应该能够创建默认的系统 API 插件', () => {
      const plugin = createSystemApiPlugin()

      expect(plugin.name).toBe('system-apis')
      expect(plugin.version).toBe('1.0.0')
      expect(plugin.apis).toBeDefined()
    })

    it('应该能够使用自定义配置创建插件', () => {
      const plugin = createSystemApiPlugin({
        basePath: '/custom-api',
        enableCache: false,
        endpoints: {
          login: '/custom-login',
        },
      })

      expect(plugin.apis).toBeDefined()

      // login 方法的 config 是一个函数，需要调用后检查
      const loginConfig = (
        plugin.apis!.login.config as (
          params: Record<string, unknown>
        ) => Record<string, unknown>
      )({
        username: 'test',
        password: 'test',
      })
      expect(loginConfig).toEqual({
        method: 'POST',
        url: '/custom-api/custom-login',
        data: { username: 'test', password: 'test' },
      })
    })
  })

  describe('aPI 方法注册', () => {
    it('应该注册所有系统 API 方法', async () => {
      const plugin = createSystemApiPlugin()
      await apiEngine.use(plugin)

      // 检查所有系统 API 方法是否已注册
      Object.values(SYSTEM_API_METHODS).forEach(methodName => {
        expect(apiEngine.getMethod(methodName)).toBeDefined()
      })
    })

    it('应该正确配置 getCaptcha 方法', async () => {
      const plugin = createSystemApiPlugin()
      await apiEngine.use(plugin)

      const method = apiEngine.getMethod(SYSTEM_API_METHODS.GET_CAPTCHA)
      expect(method).toBeDefined()
      expect(method!.config).toEqual({
        method: 'GET',
        url: '/api/auth/captcha',
      })
      expect(method!.cache?.enabled).toBe(false) // 验证码不应该缓存
    })

    it('应该正确配置 login 方法', async () => {
      const plugin = createSystemApiPlugin()
      await apiEngine.use(plugin)

      const method = apiEngine.getMethod(SYSTEM_API_METHODS.LOGIN)
      expect(method).toBeDefined()
      expect(typeof method!.config).toBe('function') // login 方法应该是函数配置
      expect(method!.cache?.enabled).toBe(false) // 登录不应该缓存
    })

    it('应该正确配置 getUserInfo 方法', async () => {
      const plugin = createSystemApiPlugin({ enableCache: true })
      await apiEngine.use(plugin)

      const method = apiEngine.getMethod(SYSTEM_API_METHODS.GET_USER_INFO)
      expect(method).toBeDefined()
      expect(method!.config).toEqual({
        method: 'GET',
        url: '/api/user/info',
      })
      expect(method!.cache?.enabled).toBe(true) // 用户信息应该缓存
    })
  })

  describe('端点配置', () => {
    it('应该使用默认端点', async () => {
      const plugin = createSystemApiPlugin()
      await apiEngine.use(plugin)

      const loginMethod = apiEngine.getMethod(SYSTEM_API_METHODS.LOGIN)
      const loginConfig = (
        loginMethod!.config as (
          params: Record<string, unknown>
        ) => Record<string, unknown>
      )({
        username: 'test',
        password: 'test',
      })

      expect(loginConfig.url).toBe('/api/auth/login')
    })

    it('应该能够自定义端点', async () => {
      const plugin = createSystemApiPlugin({
        basePath: '/v2',
        endpoints: {
          login: '/custom-login',
          getUserInfo: '/custom-user',
        },
      })
      await apiEngine.use(plugin)

      const loginMethod = apiEngine.getMethod(SYSTEM_API_METHODS.LOGIN)
      const loginConfig = (
        loginMethod!.config as (
          params: Record<string, unknown>
        ) => Record<string, unknown>
      )({
        username: 'test',
        password: 'test',
      })
      expect(loginConfig.url).toBe('/v2/custom-login')

      const userInfoMethod = apiEngine.getMethod(
        SYSTEM_API_METHODS.GET_USER_INFO
      )
      expect(userInfoMethod!.config).toEqual({
        method: 'GET',
        url: '/v2/custom-user',
      })
    })
  })

  describe('缓存配置', () => {
    it('应该根据配置启用/禁用缓存', async () => {
      const pluginWithCache = createSystemApiPlugin({
        enableCache: true,
        cacheTtl: 60000,
      })
      await apiEngine.use(pluginWithCache)

      const userInfoMethod = apiEngine.getMethod(
        SYSTEM_API_METHODS.GET_USER_INFO
      )
      expect(userInfoMethod!.cache?.enabled).toBe(true)
      expect(userInfoMethod!.cache?.ttl).toBe(60000)
    })

    it('应该为特定方法禁用缓存', async () => {
      const plugin = createSystemApiPlugin({ enableCache: true })
      await apiEngine.use(plugin)

      // 这些方法应该始终禁用缓存
      const noCacheMethods = [
        SYSTEM_API_METHODS.GET_CAPTCHA,
        SYSTEM_API_METHODS.LOGIN,
        SYSTEM_API_METHODS.LOGOUT,
        SYSTEM_API_METHODS.REFRESH_TOKEN,
        SYSTEM_API_METHODS.CHANGE_PASSWORD,
      ]

      noCacheMethods.forEach(methodName => {
        const method = apiEngine.getMethod(methodName)
        expect(method!.cache?.enabled).toBe(false)
      })
    })
  })

  describe('响应转换', () => {
    it('应该正确转换成功响应', () => {
      const plugin = createSystemApiPlugin()
      const method = plugin.apis!.getUserInfo

      const mockResponse = {
        code: 200,
        message: 'success',
        data: { id: 1, username: 'test' },
      }

      const result = method.transform!(mockResponse)
      expect(result).toEqual({ id: 1, username: 'test' })
    })

    it('应该在响应失败时抛出错误', () => {
      const plugin = createSystemApiPlugin()
      const method = plugin.apis!.getUserInfo

      const mockResponse = {
        code: 400,
        message: 'Bad Request',
        data: null,
      }

      expect(() => method.transform!(mockResponse)).toThrow('Bad Request')
    })

    it('应该在没有错误消息时使用默认消息', () => {
      const plugin = createSystemApiPlugin()
      const method = plugin.apis!.getUserInfo

      const mockResponse = {
        code: 500,
        data: null,
      }

      expect(() => method.transform!(mockResponse)).toThrow(
        'API request failed'
      )
    })
  })

  describe('常量导出', () => {
    it('应该导出所有系统 API 方法名称常量', () => {
      expect(SYSTEM_API_METHODS.GET_CAPTCHA).toBe('getCaptcha')
      expect(SYSTEM_API_METHODS.GET_SESSION).toBe('getSession')
      expect(SYSTEM_API_METHODS.LOGIN).toBe('login')
      expect(SYSTEM_API_METHODS.LOGOUT).toBe('logout')
      expect(SYSTEM_API_METHODS.GET_USER_INFO).toBe('getUserInfo')
      expect(SYSTEM_API_METHODS.GET_MENUS).toBe('getMenus')
      expect(SYSTEM_API_METHODS.REFRESH_TOKEN).toBe('refreshToken')
      expect(SYSTEM_API_METHODS.CHANGE_PASSWORD).toBe('changePassword')
      expect(SYSTEM_API_METHODS.GET_PERMISSIONS).toBe('getPermissions')
    })
  })
})
