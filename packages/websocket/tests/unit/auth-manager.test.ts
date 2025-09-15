/**
 * 认证管理器单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AuthManager, AuthState } from '../../src/core/auth-manager'
import { AuthType } from '../../src/types'

describe('AuthManager', () => {
  let authManager: AuthManager

  afterEach(() => {
    if (authManager) {
      authManager.destroy()
    }
  })

  describe('无认证策略', () => {
    beforeEach(() => {
      authManager = new AuthManager({
        type: AuthType.NONE,
        autoRefresh: false
      })
    })

    it('应该成功认证', async () => {
      const result = await authManager.authenticate()

      expect(result.success).toBe(true)
      expect(authManager.getState()).toBe(AuthState.AUTHENTICATED)
      expect(authManager.isAuthenticated()).toBe(true)
    })

    it('应该返回空的认证头', () => {
      const headers = authManager.getAuthHeaders()
      expect(headers).toEqual({})
    })
  })

  describe('Token认证策略', () => {
    const testToken = 'test-token-123'

    beforeEach(() => {
      authManager = new AuthManager({
        type: AuthType.TOKEN,
        token: testToken,
        autoRefresh: false
      })
    })

    it('应该成功认证', async () => {
      const result = await authManager.authenticate()

      expect(result.success).toBe(true)
      expect(result.token).toBe(testToken)
      expect(authManager.getState()).toBe(AuthState.AUTHENTICATED)
      expect(authManager.isAuthenticated()).toBe(true)
    })

    it('应该返回正确的认证头', async () => {
      await authManager.authenticate()
      const headers = authManager.getAuthHeaders()

      expect(headers).toEqual({
        'Authorization': `Bearer ${testToken}`
      })
    })

    it('应该在没有Token时认证失败', async () => {
      authManager.destroy()
      authManager = new AuthManager({
        type: AuthType.TOKEN,
        autoRefresh: false
      })

      const result = await authManager.authenticate()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Token认证需要提供token')
      expect(authManager.getState()).toBe(AuthState.FAILED)
    })

    it('应该支持Token过期检查', async () => {
      authManager.destroy()
      authManager = new AuthManager({
        type: AuthType.TOKEN,
        token: testToken,
        tokenExpiry: -1000, // 已过期
        autoRefresh: false
      })

      await authManager.authenticate()
      expect(authManager.isAuthenticated()).toBe(false)
    })
  })

  describe('基础认证策略', () => {
    const username = 'testuser'
    const password = 'testpass'

    beforeEach(() => {
      authManager = new AuthManager({
        type: AuthType.BASIC,
        username,
        password,
        autoRefresh: false
      })
    })

    it('应该成功认证', async () => {
      const result = await authManager.authenticate()

      expect(result.success).toBe(true)
      expect(authManager.getState()).toBe(AuthState.AUTHENTICATED)
      expect(authManager.isAuthenticated()).toBe(true)
    })

    it('应该返回正确的认证头', async () => {
      await authManager.authenticate()
      const headers = authManager.getAuthHeaders()

      const expectedCredentials = btoa(`${username}:${password}`)
      expect(headers).toEqual({
        'Authorization': `Basic ${expectedCredentials}`
      })
    })

    it('应该在缺少用户名或密码时认证失败', async () => {
      authManager.destroy()
      authManager = new AuthManager({
        type: AuthType.BASIC,
        username: 'user',
        autoRefresh: false
      })

      const result = await authManager.authenticate()

      expect(result.success).toBe(false)
      expect(result.error).toBe('基础认证需要提供用户名和密码')
      expect(authManager.getState()).toBe(AuthState.FAILED)
    })
  })

  describe('自定义认证策略', () => {
    const mockAuthData = { 'X-Custom-Token': 'custom-token-123' }

    beforeEach(() => {
      authManager = new AuthManager({
        type: AuthType.CUSTOM,
        customAuth: async () => mockAuthData,
        autoRefresh: false
      })
    })

    it('应该成功认证', async () => {
      const result = await authManager.authenticate()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockAuthData)
      expect(authManager.getState()).toBe(AuthState.AUTHENTICATED)
      expect(authManager.isAuthenticated()).toBe(true)
    })

    it('应该返回正确的认证头', async () => {
      await authManager.authenticate()
      const headers = authManager.getAuthHeaders()

      expect(headers).toEqual(mockAuthData)
    })

    it('应该处理自定义认证函数的错误', async () => {
      authManager.destroy()
      authManager = new AuthManager({
        type: AuthType.CUSTOM,
        customAuth: async () => {
          throw new Error('自定义认证错误')
        },
        autoRefresh: false
      })

      const result = await authManager.authenticate()

      expect(result.success).toBe(false)
      expect(result.error).toBe('自定义认证错误')
      expect(authManager.getState()).toBe(AuthState.FAILED)
    })

    it('应该在没有customAuth函数时认证失败', async () => {
      authManager.destroy()
      authManager = new AuthManager({
        type: AuthType.CUSTOM,
        autoRefresh: false
      })

      const result = await authManager.authenticate()

      expect(result.success).toBe(false)
      expect(result.error).toBe('自定义认证需要提供customAuth函数')
      expect(authManager.getState()).toBe(AuthState.FAILED)
    })
  })

  describe('Token自动刷新', () => {
    const initialToken = 'initial-token'
    const newToken = 'new-token'
    let refreshTokenMock: ReturnType<typeof vi.fn>

    beforeEach(() => {
      refreshTokenMock = vi.fn().mockResolvedValue(newToken)

      authManager = new AuthManager({
        type: AuthType.TOKEN,
        token: initialToken,
        autoRefresh: true,
        tokenExpiry: 3600000, // 1小时
        refreshToken: refreshTokenMock
      })
    })

    it('应该成功刷新Token', async () => {
      await authManager.authenticate()

      const refreshResult = await authManager.refreshToken()

      expect(refreshResult).toBe(true)
      expect(refreshTokenMock).toHaveBeenCalled()
      expect(authManager.getState()).toBe(AuthState.AUTHENTICATED)
    })

    it('应该在刷新Token时触发事件', async () => {
      const tokenRefreshedSpy = vi.fn()
      authManager.on('tokenRefreshed', tokenRefreshedSpy)

      await authManager.authenticate()
      await authManager.refreshToken()

      expect(tokenRefreshedSpy).toHaveBeenCalledWith({
        oldToken: initialToken,
        newToken
      })
    })

    it('应该处理Token刷新失败', async () => {
      const error = new Error('刷新失败')
      refreshTokenMock.mockRejectedValue(error)

      const tokenRefreshFailedSpy = vi.fn()
      authManager.on('tokenRefreshFailed', tokenRefreshFailedSpy)

      await authManager.authenticate()
      const refreshResult = await authManager.refreshToken()

      expect(refreshResult).toBe(false)
      expect(authManager.getState()).toBe(AuthState.EXPIRED)
      expect(tokenRefreshFailedSpy).toHaveBeenCalledWith({ error })
    })

    it('应该防止并发刷新', async () => {
      await authManager.authenticate()

      // 同时调用两次刷新
      const [result1, result2] = await Promise.all([
        authManager.refreshToken(),
        authManager.refreshToken()
      ])

      expect(result1).toBe(true)
      expect(result2).toBe(false) // 第二次调用应该被忽略
      expect(refreshTokenMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('事件处理', () => {
    beforeEach(() => {
      authManager = new AuthManager({
        type: AuthType.TOKEN,
        token: 'test-token',
        autoRefresh: false
      })
    })

    it('应该触发状态变化事件', async () => {
      const stateChangeSpy = vi.fn()
      authManager.on('stateChange', stateChangeSpy)

      await authManager.authenticate()

      expect(stateChangeSpy).toHaveBeenCalledWith({
        from: AuthState.UNAUTHENTICATED,
        to: AuthState.AUTHENTICATING
      })

      expect(stateChangeSpy).toHaveBeenCalledWith({
        from: AuthState.AUTHENTICATING,
        to: AuthState.AUTHENTICATED
      })
    })

    it('应该触发认证成功事件', async () => {
      const authenticatedSpy = vi.fn()
      authManager.on('authenticated', authenticatedSpy)

      await authManager.authenticate()

      expect(authenticatedSpy).toHaveBeenCalledWith({
        type: AuthType.TOKEN,
        token: 'test-token'
      })
    })

    it('应该触发认证失败事件', async () => {
      authManager.destroy()
      authManager = new AuthManager({
        type: AuthType.TOKEN,
        autoRefresh: false
      })

      const authFailedSpy = vi.fn()
      authManager.on('authenticationFailed', authFailedSpy)

      await authManager.authenticate()

      expect(authFailedSpy).toHaveBeenCalledWith({
        error: expect.any(Error),
        type: AuthType.TOKEN
      })
    })
  })

  describe('配置管理', () => {
    beforeEach(() => {
      authManager = new AuthManager({
        type: AuthType.TOKEN,
        token: 'initial-token',
        autoRefresh: false
      })
    })

    it('应该支持更新配置', () => {
      const newToken = 'new-token'

      authManager.updateConfig({
        token: newToken,
        autoRefresh: true
      })

      expect(authManager.getState()).toBe(AuthState.UNAUTHENTICATED)
    })

    it('应该在销毁时清理资源', () => {
      const stateChangeSpy = vi.fn()
      authManager.on('stateChange', stateChangeSpy)

      authManager.destroy()

      expect(authManager.getState()).toBe(AuthState.UNAUTHENTICATED)
      // 事件监听器应该被清除
      expect(authManager.listenerCount('stateChange')).toBe(0)
    })
  })
})
