/**
 * Volta 版本管理器路由
 * 提供 Volta 相关的 API 接口
 */

import { Router } from 'express'
import type { IRouter } from 'express'
import { execSync, spawn } from 'child_process'
import https from 'https'
import { logger } from '../../utils/logger.js'
import { connectionManager } from '../websocket.js'

const voltaLogger = logger.withPrefix('Volta')
export const voltaRouter: IRouter = Router()

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
function executeCommandAsync(
  command: string, 
  args: string[], 
  onProgress?: (data: string) => void
): Promise<{ success: boolean, output: string, error?: string }> {
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
 * 检测 Volta 安装状态
 */
voltaRouter.get('/status', (_req, res) => {
  try {
    // 检查 volta 是否安装
    const voltaVersion = executeCommand('volta --version')
    const isInstalled = voltaVersion !== null

    res.json({
      success: true,
      data: {
        installed: isInstalled,
        version: voltaVersion,
        platform: process.platform
      }
    })
  } catch (error) {
    voltaLogger.error('检测 Volta 状态失败:', error)
    res.status(500).json({
      success: false,
      message: '检测 Volta 状态失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 安装 Volta
 */
voltaRouter.post('/install', async (_req, res) => {
  try {
    const platform = process.platform

    connectionManager.broadcast({
      type: 'volta-install-start',
      data: { message: '开始安装 Volta...', platform }
    })

    if (platform === 'win32') {
      // Windows 平台 - 使用安装脚本
      voltaLogger.info('正在安装 Volta (Windows)...')
      
      connectionManager.broadcast({
        type: 'volta-install-progress',
        data: { message: '正在下载 Volta 安装程序...', progress: 30 }
      })

      // 使用 PowerShell 下载并执行安装脚本
      const installScript = 'iex (iwr https://get.volta.sh).Content'
      
      const result = await executeCommandAsync('powershell', ['-Command', installScript], (data) => {
        const message = data.trim()
        if (message) {
          connectionManager.broadcast({
            type: 'volta-install-progress',
            data: { message, progress: 60 }
          })
        }
      })

      if (result.success || result.output.includes('Volta') || result.output.includes('successfully')) {
        res.json({
          success: true,
          data: {
            message: 'Volta 安装完成！',
            instructions: [
              '✓ Volta 已成功安装',
              '✓ 环境变量已自动配置',
              '→ 请重启终端或 IDE 以使环境变量生效',
              '→ 运行 volta --version 验证安装',
              '→ 使用 volta install node 安装 Node.js'
            ]
          }
        })

        connectionManager.broadcast({
          type: 'volta-install-complete',
          data: { message: 'Volta 安装完成！请重启终端', success: true }
        })
      } else {
        throw new Error(result.error || '安装失败')
      }
    } else if (platform === 'darwin' || platform === 'linux') {
      // macOS/Linux 平台 - 使用安装脚本
      voltaLogger.info('正在安装 Volta (Unix)...')
      
      connectionManager.broadcast({
        type: 'volta-install-progress',
        data: { message: '正在下载并安装 Volta...', progress: 50 }
      })

      const installScript = 'curl https://get.volta.sh | bash'

      const result = await executeCommandAsync('bash', ['-c', installScript], (data) => {
        connectionManager.broadcast({
          type: 'volta-install-progress',
          data: { message: data.trim(), progress: 75 }
        })
      })

      if (result.success) {
        res.json({
          success: true,
          data: {
            message: 'Volta 安装完成！',
            instructions: [
              '✓ Volta 已成功安装',
              '→ 请重启终端或运行以下命令:',
              '   source ~/.bashrc (或 ~/.zshrc)',
              '→ 运行 volta --version 验证安装',
              '→ 刷新页面查看 Volta 状态'
            ]
          }
        })

        connectionManager.broadcast({
          type: 'volta-install-complete',
          data: { message: 'Volta 安装完成！请重启终端', success: true }
        })
      } else {
        throw new Error(result.error || '安装失败')
      }
    } else {
      throw new Error(`不支持的平台: ${platform}`)
    }
  } catch (error) {
    voltaLogger.error('Volta 安装失败:', error)

    connectionManager.broadcast({
      type: 'volta-install-error',
      data: { message: error instanceof Error ? error.message : '安装失败' }
    })

    res.status(500).json({
      success: false,
      message: 'Volta 安装失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 验证 Volta 安装
 */
voltaRouter.post('/verify', async (_req, res) => {
  try {
    // 检查 volta 命令是否可用
    const voltaVersion = executeCommand('volta --version')
    
    if (!voltaVersion) {
      return res.json({
        success: false,
        data: {
          installed: false,
          message: 'Volta 未正确安装或不在 PATH 中'
        }
      })
    }

    // 检查 volta 是否能正常执行
    const voltaList = executeCommand('volta list')
    
    res.json({
      success: true,
      data: {
        installed: true,
        version: voltaVersion,
        working: voltaList !== null,
        message: `Volta ${voltaVersion} 运行正常`
      }
    })
  } catch (error) {
    voltaLogger.error('验证 Volta 失败:', error)
    res.status(500).json({
      success: false,
      message: '验证 Volta 失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 获取 Node 版本列表
 */
voltaRouter.get('/versions', (_req, res) => {
  try {
    // 获取已安装的版本
    const listOutput = executeCommand('volta list node')

    // 解析已安装版本和当前版本
    const installed: string[] = []
    let current: string | null = null

    if (listOutput) {
      const lines = listOutput.split('\n')
      for (const line of lines) {
        // Volta 输出格式: ⚡️ default: v20.11.0
        const defaultMatch = line.match(/default:\s+v?([\d.]+)/)
        if (defaultMatch) {
          current = defaultMatch[1]
        }

        // 匹配所有版本号
        const versionMatch = line.match(/v?([\d.]+)/)
        if (versionMatch && !installed.includes(versionMatch[1])) {
          installed.push(versionMatch[1])
        }
      }
    }

    res.json({
      success: true,
      data: {
        installed,
        current
      }
    })
  } catch (error) {
    voltaLogger.error('获取版本列表失败:', error)
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
voltaRouter.post('/install-node', async (req, res) => {
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

    voltaLogger.info(`开始安装 Node.js ${version}`)

    const result = await executeCommandAsync('volta', ['install', `node@${version}`], (data) => {
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
    voltaLogger.error('安装 Node 版本失败:', error)

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
 * 获取推荐的 Node 版本列表
 */
voltaRouter.get('/recommended-versions', (_req, res) => {
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
    voltaLogger.error('获取推荐版本失败:', error)
    res.status(500).json({
      success: false,
      message: '获取推荐版本失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 卸载 Volta
 */
voltaRouter.post('/uninstall', async (_req, res) => {
  try {
    const platform = process.platform

    connectionManager.broadcast({
      type: 'volta-uninstall-start',
      data: { message: '开始卸载 Volta...' }
    })

    if (platform === 'win32') {
      // Windows: 删除 Volta 目录和环境变量
      const result = await executeCommandAsync('powershell', [
        '-Command',
        'Remove-Item -Recurse -Force $env:VOLTA_HOME; ' +
        '[Environment]::SetEnvironmentVariable("VOLTA_HOME", $null, "User"); ' +
        '[Environment]::SetEnvironmentVariable("PATH", ' +
        '([Environment]::GetEnvironmentVariable("PATH", "User") -replace ";?[^;]*Volta[^;]*", ""), "User")'
      ])

      if (result.success) {
        res.json({
          success: true,
          data: { message: 'Volta 已成功卸载，请重启终端' }
        })

        connectionManager.broadcast({
          type: 'volta-uninstall-complete',
          data: { message: 'Volta 已卸载', success: true }
        })
      } else {
        throw new Error(result.error || '卸载失败')
      }
    } else {
      // Unix: 删除 Volta 目录
      const result = await executeCommandAsync('bash', [
        '-c',
        'rm -rf ~/.volta'
      ])

      if (result.success) {
        res.json({
          success: true,
          data: { 
            message: 'Volta 已成功卸载',
            instructions: [
              '✓ Volta 文件已删除',
              '→ 请手动从 ~/.bashrc 或 ~/.zshrc 中删除 Volta 配置',
              '→ 重启终端以使更改生效'
            ]
          }
        })

        connectionManager.broadcast({
          type: 'volta-uninstall-complete',
          data: { message: 'Volta 已卸载', success: true }
        })
      } else {
        throw new Error(result.error || '卸载失败')
      }
    }
  } catch (error) {
    voltaLogger.error('Volta 卸载失败:', error)

    connectionManager.broadcast({
      type: 'volta-uninstall-error',
      data: { message: error instanceof Error ? error.message : '卸载失败' }
    })

    res.status(500).json({
      success: false,
      message: 'Volta 卸载失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})