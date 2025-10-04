/**
 * Verdaccio 本地 NPM 服务器 API 路由
 */

import { Router } from 'express'
import type { IRouter } from 'express'
import { logger } from '../../utils/logger.js'
import { verdaccioManager } from '../services/verdaccio-manager.js'

const verdaccioLogger = logger.withPrefix('Verdaccio-API')
export const verdaccioRouter: IRouter = Router()

/**
 * 获取 Verdaccio 服务状态
 * GET /api/verdaccio/status
 */
verdaccioRouter.get('/status', (_req, res) => {
  try {
    const status = verdaccioManager.getStatus()
    res.json({
      success: true,
      data: status
    })
  } catch (error) {
    verdaccioLogger.error('获取状态失败:', error)
    res.status(500).json({
      success: false,
      message: '获取状态失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 启动 Verdaccio 服务
 * POST /api/verdaccio/start
 */
verdaccioRouter.post('/start', async (req, res) => {
  try {
    const { port, host } = req.body
    const customConfig: any = {}
    
    if (port) customConfig.port = parseInt(port)
    if (host) customConfig.host = host

    verdaccioLogger.info('收到启动请求', customConfig)
    const result = await verdaccioManager.start(customConfig)
    
    if (result.success) {
      res.json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    verdaccioLogger.error('启动失败:', error)
    res.status(500).json({
      success: false,
      message: '启动失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 停止 Verdaccio 服务
 * POST /api/verdaccio/stop
 */
verdaccioRouter.post('/stop', async (_req, res) => {
  try {
    verdaccioLogger.info('收到停止请求')
    const result = await verdaccioManager.stop()
    
    if (result.success) {
      res.json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    verdaccioLogger.error('停止失败:', error)
    res.status(500).json({
      success: false,
      message: '停止失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 重启 Verdaccio 服务
 * POST /api/verdaccio/restart
 */
verdaccioRouter.post('/restart', async (req, res) => {
  try {
    const { port, host } = req.body
    const customConfig: any = {}
    
    if (port) customConfig.port = parseInt(port)
    if (host) customConfig.host = host

    verdaccioLogger.info('收到重启请求', customConfig)
    const result = await verdaccioManager.restart(customConfig)
    
    if (result.success) {
      res.json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    verdaccioLogger.error('重启失败:', error)
    res.status(500).json({
      success: false,
      message: '重启失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 获取配置
 * GET /api/verdaccio/config
 */
verdaccioRouter.get('/config', (_req, res) => {
  try {
    const config = verdaccioManager.getConfig()
    res.json({
      success: true,
      data: config
    })
  } catch (error) {
    verdaccioLogger.error('获取配置失败:', error)
    res.status(500).json({
      success: false,
      message: '获取配置失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 更新配置
 * PUT /api/verdaccio/config
 */
verdaccioRouter.put('/config', (req, res) => {
  try {
    const { port, host, maxBodySize } = req.body
    const updates: any = {}
    
    if (port !== undefined) updates.port = parseInt(port)
    if (host !== undefined) updates.host = host
    if (maxBodySize !== undefined) updates.maxBodySize = maxBodySize

    verdaccioManager.updateConfig(updates)
    
    res.json({
      success: true,
      message: '配置已更新，需要重启服务才能生效',
      data: verdaccioManager.getConfig()
    })
  } catch (error) {
    verdaccioLogger.error('更新配置失败:', error)
    res.status(500).json({
      success: false,
      message: '更新配置失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 获取配置文件内容
 * GET /api/verdaccio/config-file
 */
verdaccioRouter.get('/config-file', (_req, res) => {
  try {
    const content = verdaccioManager.getConfigFileContent()
    
    if (content === null) {
      return res.status(404).json({
        success: false,
        message: '配置文件不存在'
      })
    }
    
    res.json({
      success: true,
      data: { content }
    })
  } catch (error) {
    verdaccioLogger.error('读取配置文件失败:', error)
    res.status(500).json({
      success: false,
      message: '读取配置文件失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 保存配置文件内容
 * POST /api/verdaccio/config-file
 */
verdaccioRouter.post('/config-file', (req, res) => {
  try {
    const { content } = req.body
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: '配置文件内容不能为空'
      })
    }
    
    const result = verdaccioManager.saveConfigFileContent(content)
    
    if (result.success) {
      res.json({
        ...result,
        message: '配置文件已保存，需要重启服务才能生效'
      })
    } else {
      res.status(500).json(result)
    }
  } catch (error) {
    verdaccioLogger.error('保存配置文件失败:', error)
    res.status(500).json({
      success: false,
      message: '保存配置文件失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 包发布通知回调
 * POST /api/verdaccio/notify
 */
verdaccioRouter.post('/notify', (req, res) => {
  try {
    const { name, version, tag } = req.body
    verdaccioLogger.info(`📦 新包发布通知: ${name}@${version} [${tag}]`)
    
    // 这里可以添加更多逻辑，比如通过 WebSocket 通知前端
    
    res.json({
      success: true,
      message: '通知已接收'
    })
  } catch (error) {
    verdaccioLogger.error('处理通知失败:', error)
    res.status(500).json({
      success: false,
      message: '处理通知失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})
