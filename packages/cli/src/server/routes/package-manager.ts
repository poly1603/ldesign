/**
 * 私有包管理 API 路由
 * 提供 Verdaccio 私有包的查询、删除等管理功能
 */

import { Router } from 'express'
import type { IRouter } from 'express'
import { logger } from '../../utils/logger.js'
import { verdaccioManager } from '../services/verdaccio-manager.js'

const packageLogger = logger.withPrefix('Package-Manager')
export const packageManagerRouter: IRouter = Router()

/**
 * 获取所有包列表
 * GET /api/packages
 */
packageManagerRouter.get('/', (_req, res) => {
  try {
    const packages = verdaccioManager.getPackages()
    res.json({
      success: true,
      data: packages
    })
  } catch (error) {
    packageLogger.error('获取包列表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取包列表失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 获取包的详细信息
 * GET /api/packages/:name
 */
packageManagerRouter.get('/:name', (req, res) => {
  try {
    const { name } = req.params
    const packageInfo = verdaccioManager.getPackageInfo(name)

    if (!packageInfo) {
      return res.status(404).json({
        success: false,
        message: '包不存在'
      })
    }

    res.json({
      success: true,
      data: packageInfo
    })
  } catch (error) {
    packageLogger.error('获取包详情失败:', error)
    res.status(500).json({
      success: false,
      message: '获取包详情失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 删除包
 * DELETE /api/packages/:name
 */
packageManagerRouter.delete('/:name', (req, res) => {
  try {
    const { name } = req.params
    packageLogger.info(`正在删除包: ${name}`)

    const result = verdaccioManager.deletePackage(name)

    if (result.success) {
      res.json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    packageLogger.error('删除包失败:', error)
    res.status(500).json({
      success: false,
      message: '删除包失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 删除包的特定版本
 * DELETE /api/packages/:name/versions/:version
 */
packageManagerRouter.delete('/:name/versions/:version', (req, res) => {
  try {
    const { name, version } = req.params
    packageLogger.info(`正在删除版本: ${name}@${version}`)

    const result = verdaccioManager.deletePackageVersion(name, version)

    if (result.success) {
      res.json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    packageLogger.error('删除版本失败:', error)
    res.status(500).json({
      success: false,
      message: '删除版本失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 获取包的统计信息
 * GET /api/packages/stats
 */
packageManagerRouter.get('/stats/summary', (_req, res) => {
  try {
    const packages = verdaccioManager.getPackages()
    
    const stats = {
      totalPackages: packages.length,
      totalVersions: packages.reduce((sum, pkg) => sum + pkg.versions.length, 0),
      recentlyUpdated: packages.slice(0, 5).map(pkg => ({
        name: pkg.name,
        version: pkg.latestVersion,
        modified: pkg.modified
      }))
    }

    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    packageLogger.error('获取统计信息失败:', error)
    res.status(500).json({
      success: false,
      message: '获取统计信息失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})
