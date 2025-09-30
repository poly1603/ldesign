/**
 * FNM (Fast Node Manager) 路由
 * 提供 fnm 相关的 API 接口
 */

import { Router } from 'express'
import type { IRouter } from 'express'
import { execSync, spawn } from 'child_process'
import os from 'os'
import { resolve } from 'path'
import https from 'https'
import { createWriteStream, existsSync } from 'fs'
import { logger } from '../../utils/logger.js'
import { connectionManager } from '../websocket.js'

const fnmLogger = logger.withPrefix('FNM')
export const fnmRouter: IRouter = Router()

/**
 * 执行命令并返回结果
 */
function executeCommand(command: string): string | null {
  try {
    return execSync(command, { encoding: 'utf-8', timeout: 10000 }).trim()
  } catch (error) {
    return null
  }
}

/**
 * 异步执行命令
 */
function executeCommandAsync(command: string, args: string[], onProgress?: (data: string) => void): Promise<{ success: boolean, output: string, error?: string }> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let output = ''
    let errorOutput = ''

    child.stdout?.on('data', (data) => {
      const text = data.toString()
      output += text
      if (onProgress) {
        onProgress(text)
      }
    })

    child.stderr?.on('data', (data) => {
      const text = data.toString()
      errorOutput += text
      if (onProgress) {
        onProgress(text)
      }
    })

    child.on('close', (code) => {
      resolve({
        success: code === 0,
        output: output.trim(),
        error: code !== 0 ? errorOutput.trim() : undefined
      })
    })

    child.on('error', (error) => {
      resolve({
        success: false,
        output: '',
        error: error.message
      })
    })
  })
}

/**
 * 下载文件
 */
function downloadFile(url: string, dest: string, onProgress?: (progress: number, downloaded: number, total: number) => void): Promise<boolean> {
  return new Promise((resolve) => {
    const file = createWriteStream(dest)
    
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // 处理重定向
        const redirectUrl = response.headers.location
        if (redirectUrl) {
          downloadFile(redirectUrl, dest, onProgress).then(resolve)
        } else {
          resolve(false)
        }
        return
      }

      const totalSize = parseInt(response.headers['content-length'] || '0', 10)
      let downloadedSize = 0

      response.on('data', (chunk) => {
        downloadedSize += chunk.length
        if (onProgress && totalSize > 0) {
          const progress = Math.round((downloadedSize / totalSize) * 100)
          onProgress(progress, downloadedSize, totalSize)
        }
      })

      response.pipe(file)

      file.on('finish', () => {
        file.close()
        resolve(true)
      })
    }).on('error', (err) => {
      fnmLogger.error('下载失败:', err)
      resolve(false)
    })
  })
}

/**
 * 检测 fnm 安装状态
 */
fnmRouter.get('/status', (_req, res) => {
  try {
    // 检查 fnm 是否安装
    const fnmVersion = executeCommand('fnm --version')
    const isInstalled = fnmVersion !== null

    res.json({
      success: true,
      data: {
        installed: isInstalled,
        version: fnmVersion,
        platform: process.platform
      }
    })
  } catch (error) {
    fnmLogger.error('检测 fnm 状态失败:', error)
    res.status(500).json({
      success: false,
      message: '检测 fnm 状态失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 安装 fnm
 */
fnmRouter.post('/install', async (_req, res) => {
  try {
    const platform = process.platform

    connectionManager.broadcast({
      type: 'fnm-install-start',
      data: { message: '开始安装 fnm...', platform }
    })

    if (platform === 'win32') {
      // Windows 平台 - 使用 winget 或下载安装
      fnmLogger.info('正在安装 fnm (Windows)...')
      
      connectionManager.broadcast({
        type: 'fnm-install-progress',
        data: { message: '正在使用 winget 安装 fnm...', progress: 30 }
      })

      // 尝试使用 winget 安装
      const result = await executeCommandAsync('winget', ['install', 'Schniz.fnm', '--silent'], (data) => {
        connectionManager.broadcast({
          type: 'fnm-install-progress',
          data: { message: data.trim(), progress: 60 }
        })
      })

      if (result.success) {
        res.json({
          success: true,
          data: {
            message: 'fnm 安装完成！',
            instructions: [
              '✓ fnm 已成功安装',
              '✓ 环境变量已自动配置',
              '→ 请重启终端或 IDE 以使环境变量生效',
              '→ 运行 fnm --version 验证安装',
              '→ 使用 fnm install <version> 安装 Node.js'
            ]
          }
        })

        connectionManager.broadcast({
          type: 'fnm-install-complete',
          data: { message: 'fnm 安装完成！请重启终端', success: true }
        })
      } else {
        throw new Error(result.error || '安装失败')
      }
    } else if (platform === 'darwin' || platform === 'linux') {
      // macOS/Linux 平台 - 使用安装脚本
      fnmLogger.info('正在安装 fnm (Unix)...')
      
      connectionManager.broadcast({
        type: 'fnm-install-progress',
        data: { message: '正在下载并安装 fnm...', progress: 50 }
      })

      const installScript = 'curl -fsSL https://fnm.vercel.app/install | bash'

      const result = await executeCommandAsync('bash', ['-c', installScript], (data) => {
        connectionManager.broadcast({
          type: 'fnm-install-progress',
          data: { message: data.trim(), progress: 75 }
        })
      })

      if (result.success) {
        res.json({
          success: true,
          data: {
            message: 'fnm 安装完成！',
            instructions: [
              '✓ fnm 已成功安装',
              '→ 请重启终端或运行以下命令:',
              '   source ~/.bashrc (或 ~/.zshrc)',
              '→ 运行 fnm --version 验证安装',
              '→ 刷新页面查看 fnm 状态'
            ]
          }
        })

        connectionManager.broadcast({
          type: 'fnm-install-complete',
          data: { message: 'fnm 安装完成！请重启终端', success: true }
        })
      } else {
        throw new Error(result.error || '安装失败')
      }
    } else {
      throw new Error(`不支持的平台: ${platform}`)
    }
  } catch (error) {
    fnmLogger.error('fnm 安装失败:', error)

    connectionManager.broadcast({
      type: 'fnm-install-error',
      data: { message: error instanceof Error ? error.message : '安装失败' }
    })

    res.status(500).json({
      success: false,
      message: 'fnm 安装失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 获取 Node 版本列表
 */
fnmRouter.get('/versions', (_req, res) => {
  try {
    // 获取已安装的版本
    const installedOutput = executeCommand('fnm list')
    const currentOutput = executeCommand('fnm current')

    // 解析已安装版本
    const installed = installedOutput
      ? installedOutput.split('\n')
          .map(line => line.trim())
          .filter(line => line.match(/^v?\d+\.\d+\.\d+/))
          .map(line => {
            const match = line.match(/v?(\d+\.\d+\.\d+)/)
            return match ? match[1] : null
          })
          .filter(Boolean) as string[]
      : []

    // 解析当前版本
    const current = currentOutput?.replace(/^v/, '') || null

    res.json({
      success: true,
      data: {
        installed,
        current
      }
    })
  } catch (error) {
    fnmLogger.error('获取版本列表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取版本列表失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 安装 Node 版本
 */
fnmRouter.post('/install-node', async (req, res) => {
  try {
    const { version } = req.body

    if (!version) {
      return res.status(400).json({
        success: false,
        message: '请提供要安装的版本号'
      })
    }

    connectionManager.broadcast({
      type: 'node-install-start',
      data: { message: `开始安装 Node.js ${version}...`, version }
    })

    fnmLogger.info(`开始安装 Node.js ${version}`)

    const result = await executeCommandAsync('fnm', ['install', version], (data) => {
      connectionManager.broadcast({
        type: 'node-install-progress',
        data: { message: data.trim(), version }
      })
    })

    if (result.success) {
      connectionManager.broadcast({
        type: 'node-install-complete',
        data: {
          message: `Node.js ${version} 安装成功`,
          version,
          success: true
        }
      })

      res.json({
        success: true,
        data: {
          message: `Node.js ${version} 安装成功`,
          version
        }
      })
    } else {
      throw new Error(result.error || '安装失败')
    }
  } catch (error) {
    fnmLogger.error('安装 Node 版本失败:', error)

    connectionManager.broadcast({
      type: 'node-install-error',
      data: { message: error instanceof Error ? error.message : '安装失败' }
    })

    res.status(500).json({
      success: false,
      message: '安装 Node 版本失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 验证 fnm 安装
 */
fnmRouter.post('/verify', async (_req, res) => {
  try {
    // 检查 fnm 命令是否可用
    const fnmVersion = executeCommand('fnm --version')
    
    if (!fnmVersion) {
      return res.json({
        success: false,
        data: {
          installed: false,
          message: 'fnm 未正确安装或不在 PATH 中'
        }
      })
    }

    // 检查 fnm 是否能正常执行
    const fnmEnv = executeCommand('fnm env')
    
    res.json({
      success: true,
      data: {
        installed: true,
        version: fnmVersion,
        working: fnmEnv !== null,
        message: `fnm ${fnmVersion} 运行正常`
      }
    })
  } catch (error) {
    fnmLogger.error('验证 fnm 失败:', error)
    res.status(500).json({
      success: false,
      message: '验证 fnm 失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 获取推荐的 Node 版本列表
 */
fnmRouter.get('/recommended-versions', (_req, res) => {
  try {
    // 推荐的 Node.js 版本（包括 LTS 和最新版）
    const recommendedVersions = [
      {
        version: '20.11.0',
        label: 'Node 20 LTS (Iron)',
        lts: true,
        recommended: true,
        description: '推荐用于生产环境的长期支持版本'
      },
      {
        version: '18.19.0',
        label: 'Node 18 LTS (Hydrogen)',
        lts: true,
        recommended: true,
        description: '稳定的长期支持版本'
      },
      {
        version: '21.6.1',
        label: 'Node 21 (Current)',
        lts: false,
        recommended: false,
        description: '最新特性版本（非 LTS）'
      },
      {
        version: '16.20.2',
        label: 'Node 16 LTS (Gallium)',
        lts: true,
        recommended: false,
        description: '较旧的长期支持版本'
      }
    ]

    res.json({
      success: true,
      data: recommendedVersions
    })
  } catch (error) {
    fnmLogger.error('获取推荐版本失败:', error)
    res.status(500).json({
      success: false,
      message: '获取推荐版本失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 切换 Node 版本
 */
fnmRouter.post('/use', async (req, res) => {
  try {
    const { version } = req.body

    if (!version) {
      return res.status(400).json({
        success: false,
        message: '请提供要切换的版本号'
      })
    }

    connectionManager.broadcast({
      type: 'node-switch-start',
      data: { message: `开始切换到 Node.js ${version}...`, version }
    })

    fnmLogger.info(`开始切换到 Node.js ${version}`)

    const result = await executeCommandAsync('fnm', ['use', version], (data) => {
      connectionManager.broadcast({
        type: 'node-switch-progress',
        data: { message: data.trim(), version }
      })
    })

    if (result.success) {
      connectionManager.broadcast({
        type: 'node-switch-complete',
        data: {
          message: `已切换到 Node.js ${version}`,
          version,
          success: true
        }
      })

      res.json({
        success: true,
        data: {
          message: `已切换到 Node.js ${version}`,
          version
        }
      })
    } else {
      throw new Error(result.error || '切换失败')
    }
  } catch (error) {
    fnmLogger.error('切换 Node 版本失败:', error)

    connectionManager.broadcast({
      type: 'node-switch-error',
      data: { message: error instanceof Error ? error.message : '切换失败' }
    })

    res.status(500).json({
      success: false,
      message: '切换 Node 版本失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

