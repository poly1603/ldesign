/**
 * NPM 源管理路由
 * 提供 NPM 源的增删改查和登录管理功能
 */

import { Router } from 'express'
import type { IRouter } from 'express'
import { execSync } from 'child_process'
import { logger } from '../../utils/logger.js'
import {
  getAllNpmSources,
  getNpmSourceById,
  addNpmSource,
  updateNpmSource,
  deleteNpmSource,
  updateLoginStatus
} from '../database/adapters.js'

const npmLogger = logger.withPrefix('NPM-Sources')
export const npmSourcesRouter: IRouter = Router()

/**
 * 执行命令并返回结果
 */
function executeCommand(command: string): { success: boolean; output?: string; error?: string } {
  try {
    const output = execSync(command, { encoding: 'utf-8', timeout: 10000 }).trim()
    return { success: true, output }
  } catch (error: any) {
    return { success: false, error: error.message || '命令执行失败' }
  }
}

/**
 * 获取所有 NPM 源
 * GET /api/npm-sources
 */
npmSourcesRouter.get('/', (_req, res) => {
  try {
    const sources = getAllNpmSources()
    res.json({
      success: true,
      data: sources
    })
  } catch (error) {
    npmLogger.error('获取NPM源列表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取NPM源列表失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 根据 ID 获取 NPM 源
 * GET /api/npm-sources/:id
 */
npmSourcesRouter.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    const source = getNpmSourceById(id)

    if (!source) {
      return res.status(404).json({
        success: false,
        message: 'NPM源不存在'
      })
    }

    res.json({
      success: true,
      data: source
    })
  } catch (error) {
    npmLogger.error('获取NPM源详情失败:', error)
    res.status(500).json({
      success: false,
      message: '获取NPM源详情失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 创建新 NPM 源
 * POST /api/npm-sources
 */
npmSourcesRouter.post('/', (req, res) => {
  try {
    const { name, url, type, description } = req.body

    if (!name || !url || !type) {
      return res.status(400).json({
        success: false,
        message: '缺少必要字段: name, url, type'
      })
    }

    // 验证URL格式
    try {
      new URL(url)
    } catch {
      return res.status(400).json({
        success: false,
        message: 'URL格式不正确'
      })
    }

    const newSource = addNpmSource({ name, url, type, description })

    res.json({
      success: true,
      message: 'NPM源创建成功',
      data: newSource
    })
  } catch (error) {
    npmLogger.error('创建NPM源失败:', error)
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '创建NPM源失败'
    })
  }
})

/**
 * 更新 NPM 源
 * PUT /api/npm-sources/:id
 */
npmSourcesRouter.put('/:id', (req, res) => {
  try {
    const { id } = req.params
    const { name, url, type, description } = req.body

    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (url !== undefined) {
      // 验证URL格式
      try {
        new URL(url)
        updates.url = url
      } catch {
        return res.status(400).json({
          success: false,
          message: 'URL格式不正确'
        })
      }
    }
    if (type !== undefined) updates.type = type
    if (description !== undefined) updates.description = description

    const updatedSource = updateNpmSource(id, updates)

    if (!updatedSource) {
      return res.status(404).json({
        success: false,
        message: 'NPM源不存在'
      })
    }

    res.json({
      success: true,
      message: 'NPM源更新成功',
      data: updatedSource
    })
  } catch (error) {
    npmLogger.error('更新NPM源失败:', error)
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '更新NPM源失败'
    })
  }
})

/**
 * 删除 NPM 源
 * DELETE /api/npm-sources/:id
 */
npmSourcesRouter.delete('/:id', (req, res) => {
  try {
    const { id } = req.params
    const success = deleteNpmSource(id)

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'NPM源不存在'
      })
    }

    res.json({
      success: true,
      message: 'NPM源删除成功'
    })
  } catch (error) {
    npmLogger.error('删除NPM源失败:', error)
    res.status(500).json({
      success: false,
      message: '删除NPM源失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 检测源是否登录
 * GET /api/npm-sources/:id/login-status
 */
npmSourcesRouter.get('/:id/login-status', (req, res) => {
  try {
    const { id } = req.params
    const source = getNpmSourceById(id)

    if (!source) {
      return res.status(404).json({
        success: false,
        message: 'NPM源不存在'
      })
    }

    // 尝试从 npm 命令获取真实登录状态
    const result = executeCommand(`npm whoami --registry=${source.url}`)

    if (result.success && result.output) {
      // 如果能获取到用户名，说明已登录
      const username = result.output.trim()
      
      // 更新数据库中的登录状态
      updateLoginStatus(id, true, {
        username,
        lastLoginAt: new Date().toISOString()
      })

      res.json({
        success: true,
        data: {
          isLoggedIn: true,
          username
        }
      })
    } else {
      // 未登录
      updateLoginStatus(id, false)
      
      res.json({
        success: true,
        data: {
          isLoggedIn: false
        }
      })
    }
  } catch (error) {
    npmLogger.error('检测登录状态失败:', error)
    res.status(500).json({
      success: false,
      message: '检测登录状态失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 登录到 NPM 源
 * POST /api/npm-sources/:id/login
 */
npmSourcesRouter.post('/:id/login', async (req, res) => {
  try {
    const { id } = req.params
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '请提供用户名和密码'
      })
    }

    const source = getNpmSourceById(id)
    if (!source) {
      return res.status(404).json({
        success: false,
        message: 'NPM源不存在'
      })
    }

    npmLogger.info(`正在登录到 ${source.name} (${source.url})...`)

    // 使用 npm login 命令登录
    // 注意: 这需要交互式输入，我们使用 npm adduser 的非交互式方式
    const loginCommand = `echo "${username}\n${password}\n" | npm adduser --registry=${source.url}`
    
    const result = executeCommand(loginCommand)

    if (result.success || (result.output && result.output.includes('Logged in'))) {
      // 登录成功，获取用户信息
      const whoamiResult = executeCommand(`npm whoami --registry=${source.url}`)
      const actualUsername = whoamiResult.output?.trim() || username

      // 更新数据库
      const updatedSource = updateLoginStatus(id, true, {
        username: actualUsername,
        lastLoginAt: new Date().toISOString()
      })

      npmLogger.info(`成功登录到 ${source.name}`)

      res.json({
        success: true,
        message: '登录成功',
        data: {
          source: updatedSource,
          username: actualUsername
        }
      })
    } else {
      npmLogger.error(`登录失败: ${result.error}`)
      res.status(401).json({
        success: false,
        message: '登录失败，请检查用户名和密码',
        error: result.error
      })
    }
  } catch (error) {
    npmLogger.error('登录NPM源失败:', error)
    res.status(500).json({
      success: false,
      message: '登录失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 退出登录
 * POST /api/npm-sources/:id/logout
 */
npmSourcesRouter.post('/:id/logout', (req, res) => {
  try {
    const { id } = req.params
    const source = getNpmSourceById(id)

    if (!source) {
      return res.status(404).json({
        success: false,
        message: 'NPM源不存在'
      })
    }

    npmLogger.info(`正在退出 ${source.name} (${source.url})...`)

    // 使用 npm logout 命令退出
    const result = executeCommand(`npm logout --registry=${source.url}`)

    if (result.success || !result.error) {
      // 更新数据库
      const updatedSource = updateLoginStatus(id, false)

      npmLogger.info(`成功退出 ${source.name}`)

      res.json({
        success: true,
        message: '退出登录成功',
        data: updatedSource
      })
    } else {
      npmLogger.error(`退出登录失败: ${result.error}`)
      res.status(500).json({
        success: false,
        message: '退出登录失败',
        error: result.error
      })
    }
  } catch (error) {
    npmLogger.error('退出登录失败:', error)
    res.status(500).json({
      success: false,
      message: '退出登录失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 获取当前使用的 NPM 源
 * GET /api/npm-sources/current
 */
npmSourcesRouter.get('/current/registry', (_req, res) => {
  try {
    const result = executeCommand('npm config get registry')

    if (result.success && result.output) {
      res.json({
        success: true,
        data: {
          registry: result.output
        }
      })
    } else {
      res.status(500).json({
        success: false,
        message: '获取当前源失败',
        error: result.error
      })
    }
  } catch (error) {
    npmLogger.error('获取当前NPM源失败:', error)
    res.status(500).json({
      success: false,
      message: '获取当前NPM源失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 切换到指定的 NPM 源
 * POST /api/npm-sources/:id/switch
 */
npmSourcesRouter.post('/:id/switch', (req, res) => {
  try {
    const { id } = req.params
    const source = getNpmSourceById(id)

    if (!source) {
      return res.status(404).json({
        success: false,
        message: 'NPM源不存在'
      })
    }

    npmLogger.info(`正在切换到 ${source.name} (${source.url})...`)

    const result = executeCommand(`npm config set registry ${source.url}`)

    if (result.success || !result.error) {
      npmLogger.info(`成功切换到 ${source.name}`)

      res.json({
        success: true,
        message: `已切换到 ${source.name}`,
        data: source
      })
    } else {
      npmLogger.error(`切换源失败: ${result.error}`)
      res.status(500).json({
        success: false,
        message: '切换源失败',
        error: result.error
      })
    }
  } catch (error) {
    npmLogger.error('切换NPM源失败:', error)
    res.status(500).json({
      success: false,
      message: '切换NPM源失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})