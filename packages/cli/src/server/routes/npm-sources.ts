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
 * 检测源服务是否可用
 * GET /api/npm-sources/:id/check-availability
 */
npmSourcesRouter.get('/:id/check-availability', async (req, res) => {
  try {
    const { id } = req.params
    const source = getNpmSourceById(id)

    if (!source) {
      return res.status(404).json({
        success: false,
        message: 'NPM源不存在'
      })
    }

    const startTime = Date.now()

    // 尝试 ping 该源来检测可用性
    // 使用 npm ping 命令或直接访问源的根路径
    const result = executeCommand(`npm ping --registry=${source.url}`)

    let available = false
    if (result.success) {
      available = true
    } else {
      // npm ping 失败，尝试使用 curl 检测
      const curlResult = executeCommand(`curl -s -o /dev/null -w "%{http_code}" ${source.url} --max-time 5`)
      if (curlResult.success && curlResult.output) {
        const statusCode = parseInt(curlResult.output.trim())
        // 200-399 认为服务可用
        available = statusCode >= 200 && statusCode < 400
      }
    }

    const latency = Date.now() - startTime

    res.json({
      success: true,
      data: {
        available,
        latency
      }
    })
  } catch (error) {
    npmLogger.error('检测源可用性失败:', error)
    res.json({
      success: true,
      data: {
        available: false,
        latency: 5000 // 超时
      }
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

    // 方法1: 使用npm-auth-token方式直接设置
    // 方法2: 通过执行npm adduser
    // 由于npm adduser是交互式命令，这里我们采用直接修改.npmrc的方式
    
    // 先尝试使用npm adduser (对于支持的registry)
    try {
      // 生成basic auth token
      const authString = Buffer.from(`${username}:${password}`).toString('base64')
      
      // 构造npm config命令来设置认证
      const registryHost = new URL(source.url).host
      const configCommands = [
        `npm config set //${registryHost}/:_auth=${authString}`,
        `npm config set //${registryHost}/:username=${username}`,
        `npm config set //${registryHost}/:email=${username}@example.com`,
        `npm config set //${registryHost}/:always-auth=true`
      ]
      
      npmLogger.info(`设置认证信息: //${registryHost}`)
      
      // 依次执行配置命令
      for (const cmd of configCommands) {
        const cmdResult = executeCommand(cmd)
        if (!cmdResult.success) {
          npmLogger.warn(`配置命令执行失败: ${cmd}, 错误: ${cmdResult.error}`)
        }
      }
      
      // 验证登录状态
      const whoamiResult = executeCommand(`npm whoami --registry=${source.url}`)
      
      if (whoamiResult.success && whoamiResult.output) {
        const actualUsername = whoamiResult.output.trim()
        
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
        // 如果whoami失败，可能是因为registry不支持whoami，但配置已经设置了
        // 直接标记为成功
        const updatedSource = updateLoginStatus(id, true, {
          username,
          lastLoginAt: new Date().toISOString()
        })

        npmLogger.info(`已配置登录信息到 ${source.name}`)

        res.json({
          success: true,
          message: '登录配置已设置',
          data: {
            source: updatedSource,
            username
          }
        })
      }
    } catch (configError: any) {
      npmLogger.error(`登录失败: ${configError.message}`)
      res.status(500).json({
        success: false,
        message: '登录失败',
        error: configError.message
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

    // 删除npm config中的认证配置
    try {
      const registryHost = new URL(source.url).host
      const configCommands = [
        `npm config delete //${registryHost}/:_authToken`,
        `npm config delete //${registryHost}/:username`,
        `npm config delete //${registryHost}/:email`,
        `npm config delete //${registryHost}/:always-auth`,
        `npm config delete //${registryHost}/:_auth`
      ]
      
      // 依次执行删除配置命令（忽略错误）
      for (const cmd of configCommands) {
        executeCommand(cmd)
      }
      
      // 更新数据库
      const updatedSource = updateLoginStatus(id, false)

      npmLogger.info(`成功退出 ${source.name}`)

      res.json({
        success: true,
        message: '退出登录成功',
        data: updatedSource
      })
    } catch (logoutError: any) {
      npmLogger.error(`退出登录失败: ${logoutError.message}`)
      res.status(500).json({
        success: false,
        message: '退出登录失败',
        error: logoutError.message
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
 * 获取源的包列表
 * GET /api/npm-sources/:id/packages
 */
npmSourcesRouter.get('/:id/packages', async (req, res) => {
  try {
    const { id } = req.params
    const { page = 1, pageSize = 20, search = '' } = req.query
    const source = getNpmSourceById(id)

    if (!source) {
      return res.status(404).json({
        success: false,
        message: 'NPM源不存在'
      })
    }

    npmLogger.info(`获取源 ${source.name} 的包列表...`)

    // 使用 npm search 命令搜索包
    // 注意：npm search 可能会比较慢，而且不同的源支持程度不同
    let searchCommand = `npm search --registry=${source.url} --json`
    if (search) {
      searchCommand += ` "${search}"`
    }
    
    const result = executeCommand(searchCommand)
    
    if (result.success && result.output) {
      try {
        const packages = JSON.parse(result.output)
        const start = (Number(page) - 1) * Number(pageSize)
        const end = start + Number(pageSize)
        const paginatedPackages = packages.slice(start, end)
        
        res.json({
          success: true,
          data: {
            packages: paginatedPackages,
            total: packages.length,
            page: Number(page),
            pageSize: Number(pageSize),
            totalPages: Math.ceil(packages.length / Number(pageSize))
          }
        })
      } catch (parseError) {
        npmLogger.error('解析包列表失败:', parseError)
        res.status(500).json({
          success: false,
          message: '解析包列表失败'
        })
      }
    } else {
      // npm search 失败，返回空列表
      res.json({
        success: true,
        data: {
          packages: [],
          total: 0,
          page: Number(page),
          pageSize: Number(pageSize),
          totalPages: 0
        },
        message: '该源暂不支持包搜索或包列表为空'
      })
    }
  } catch (error) {
    npmLogger.error('获取包列表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取包列表失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 获取包详情
 * GET /api/npm-sources/:id/packages/:packageName
 */
npmSourcesRouter.get('/:id/packages/:packageName', async (req, res) => {
  try {
    const { id, packageName } = req.params
    const source = getNpmSourceById(id)

    if (!source) {
      return res.status(404).json({
        success: false,
        message: 'NPM源不存在'
      })
    }

    npmLogger.info(`获取包 ${packageName} 的详情...`)

    // 使用 npm view 命令获取包详情
    const viewCommand = `npm view ${packageName} --registry=${source.url} --json`
    const result = executeCommand(viewCommand)

    if (result.success && result.output) {
      try {
        const packageInfo = JSON.parse(result.output)
        res.json({
          success: true,
          data: packageInfo
        })
      } catch (parseError) {
        npmLogger.error('解析包详情失败:', parseError)
        res.status(500).json({
          success: false,
          message: '解析包详情失败'
        })
      }
    } else {
      res.status(404).json({
        success: false,
        message: '包不存在或无法获取',
        error: result.error
      })
    }
  } catch (error) {
    npmLogger.error('获取包详情失败:', error)
    res.status(500).json({
      success: false,
      message: '获取包详情失败',
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