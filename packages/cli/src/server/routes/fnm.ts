/**
 * FNM (Fast Node Manager) 路由
 * 提供 fnm 相关的 API 接口
 */

import { Router } from 'express'
import type { IRouter } from 'express'
import { execSync, spawn, ChildProcess } from 'child_process'
import os from 'os'
import { resolve, join, dirname } from 'path'
import https from 'https'
import { createWriteStream, existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { logger } from '../../utils/logger.js'
import { connectionManager } from '../websocket.js'

const fnmLogger = logger.withPrefix('FNM')
export const fnmRouter: IRouter = Router()

// 存储活跃的安装进程
const activeInstallProcesses = new Map<string, ChildProcess>()

/**
 * 配置 PowerShell Profile 以自动加载 FNM 环境
 */
function setupPowerShellProfile(): boolean {
  try {
    const platform = process.platform
    
    if (platform !== 'win32') {
      fnmLogger.info('非 Windows 系统，跳过 PowerShell Profile 配置')
      return true
    }
    
    // 获取 PowerShell Profile 路径
    const profilePathCmd = '$PROFILE'
    const profilePath = execSync(profilePathCmd, { 
      encoding: 'utf-8', 
      shell: 'powershell.exe' 
    }).trim()
    
    fnmLogger.info(`PowerShell Profile 路径: ${profilePath}`)
    
    // FNM 初始化代码
    const fnmInitCode = `
# FNM (Fast Node Manager) 自动配置
# 由 LDesign CLI 自动生成
fnm env --shell powershell | Out-String | Invoke-Expression
`
    
    let profileContent = ''
    let needsUpdate = false
    
    // 检查 Profile 文件是否存在
    if (existsSync(profilePath)) {
      profileContent = readFileSync(profilePath, 'utf-8')
      
      // 检查是否已经包含 FNM 配置
      if (profileContent.includes('fnm env') && profileContent.includes('Invoke-Expression')) {
        fnmLogger.info('PowerShell Profile 已包含 FNM 配置')
        return true
      }
      
      needsUpdate = true
    } else {
      // Profile 不存在，需要创建
      needsUpdate = true
      
      // 确保目录存在
      const profileDir = dirname(profilePath)
      if (!existsSync(profileDir)) {
        mkdirSync(profileDir, { recursive: true })
        fnmLogger.info(`创建 Profile 目录: ${profileDir}`)
      }
    }
    
    if (needsUpdate) {
      // 添加 FNM 配置
      const newContent = profileContent + '\n' + fnmInitCode
      writeFileSync(profilePath, newContent, 'utf-8')
      fnmLogger.info('PowerShell Profile 配置完成')
      
      // 通知用户需要重启 shell
      connectionManager.broadcast({
        type: 'shell-restart-needed',
        data: {
          message: 'PowerShell Profile 已更新，请重启终端以应用更改',
          profilePath
        }
      })
    }
    
    return true
  } catch (error) {
    fnmLogger.error('PowerShell Profile 配置失败:', error)
    return false
  }
}

/**
 * 刷新当前 shell 会话的 FNM 环境（立即生效）
 */
function refreshFnmEnvInCurrentShell(): void {
  try {
    // 尝试刷新当前进程的 PATH
    const fnmEnv = getFnmEnv()
    
    // 更新当前 Node.js 进程的环境变量
    if (fnmEnv.PATH) {
      process.env.PATH = fnmEnv.PATH
      fnmLogger.info('FNM 环境变量已刷新')
    }
    
    if (fnmEnv.FNM_MULTISHELL_PATH) {
      process.env.FNM_MULTISHELL_PATH = fnmEnv.FNM_MULTISHELL_PATH
    }
    
    if (fnmEnv.FNM_VERSION_FILE_STRATEGY) {
      process.env.FNM_VERSION_FILE_STRATEGY = fnmEnv.FNM_VERSION_FILE_STRATEGY
    }
    
    if (fnmEnv.FNM_DIR) {
      process.env.FNM_DIR = fnmEnv.FNM_DIR
    }
    
    if (fnmEnv.FNM_LOGLEVEL) {
      process.env.FNM_LOGLEVEL = fnmEnv.FNM_LOGLEVEL
    }
    
    if (fnmEnv.FNM_NODE_DIST_MIRROR) {
      process.env.FNM_NODE_DIST_MIRROR = fnmEnv.FNM_NODE_DIST_MIRROR
    }
    
    if (fnmEnv.FNM_ARCH) {
      process.env.FNM_ARCH = fnmEnv.FNM_ARCH
    }
  } catch (error) {
    fnmLogger.warn('刷新 FNM 环境变量失败:', error)
  }
}

/**
 * 获取 FNM 环境变量
 */
function getFnmEnv(): Record<string, string> {
  try {
    // 获取 fnm env 输出
    const envOutput = execSync('fnm env --shell powershell', { encoding: 'utf-8' })
    const env: Record<string, string> = {}
    
    // 解析环境变量（PowerShell 格式）
    const lines = envOutput.split('\n')
    for (const line of lines) {
      // 匹配 $env:VAR = "value" 格式（支持多行值）
      const match = line.match(/\$env:(\w+)\s*=\s*"(.+?)"\s*$/)
      if (match) {
        env[match[1]] = match[2]
      }
    }
    
    fnmLogger.debug('FNM 环境变量:', env)
    return env
  } catch (error) {
    fnmLogger.warn('无法获取 FNM 环境变量:', error)
    return {}
  }
}

/**
 * 执行命令并返回结果
 */
function executeCommand(command: string, useFnmEnv: boolean = false): string | null {
  try {
    const options: any = { 
      encoding: 'utf-8', 
      timeout: 10000,
      shell: 'powershell.exe'
    }
    
    // 如果需要 FNM 环境，则添加环境变量
    if (useFnmEnv) {
      const fnmEnv = getFnmEnv()
      options.env = { ...process.env, ...fnmEnv }
    }
    
    return execSync(command, options).trim()
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
  onProgress?: (data: string) => void, 
  useFnmEnv: boolean = false,
  processId?: string,
  timeout: number = 120000, // 默认120秒超时
  useDirectExec: boolean = false // 是否直接执行（不用 shell）
): Promise<{ success: boolean, output: string, error?: string, child?: ChildProcess, timedOut?: boolean }> {
  return new Promise((resolve) => {
    const spawnOptions: any = {
      shell: useDirectExec ? false : 'powershell.exe',
      stdio: ['pipe', 'pipe', 'pipe']
    }
    
    // 如果需要 FNM 环境，则添加环境变量
    if (useFnmEnv) {
      const fnmEnv = getFnmEnv()
      spawnOptions.env = { 
        ...process.env, 
        ...fnmEnv,
        // 强制无缓冲输出
        RUST_LOG: 'info',
        NO_COLOR: '0',
        FORCE_COLOR: '1'
      }
    } else {
      spawnOptions.env = { 
        ...process.env,
        // 强制无缓冲输出
        RUST_LOG: 'info',
        NO_COLOR: '0',
        FORCE_COLOR: '1'
      }
    }
    
    fnmLogger.info(`[执行命令] ${command} ${args.join(' ')}`)
    const child = spawn(command, args, spawnOptions)
    
    // 设置流编码为 UTF-8，立即处理
    if (child.stdout) {
      child.stdout.setEncoding('utf8')
    }
    if (child.stderr) {
      child.stderr.setEncoding('utf8')
    }
    
    // 如果提供了 processId，则存储进程引用
    if (processId) {
      activeInstallProcesses.set(processId, child)
    }

    let output = ''
    let errorOutput = ''
    let resolved = false

    // 设置超时
    const timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true
        fnmLogger.error(`命令超时: ${command} ${args.join(' ')}`)
        child.kill('SIGTERM')
        
        // 清理进程引用
        if (processId) {
          activeInstallProcesses.delete(processId)
        }
        
        resolve({
          success: false,
          output: output.trim(),
          error: `命令执行超时 (${timeout}ms)`,
          child,
          timedOut: true
        })
      }
    }, timeout)

    child.stdout?.on('data', (data) => {
      const text = data.toString()
      output += text
      fnmLogger.info(`[STDOUT] ${text.trim()}`)
      if (onProgress) {
        onProgress(text)
      }
    })

    child.stderr?.on('data', (data) => {
      const text = data.toString()
      errorOutput += text
      fnmLogger.info(`[STDERR] ${text.trim()}`)
      // 不要将 PowerShell 错误信息发送给前端
      if (onProgress && !text.includes('所在位置') && !text.includes('CategoryInfo')) {
        onProgress(text)
      }
    })

    child.on('close', (code) => {
      if (!resolved) {
        resolved = true
        clearTimeout(timeoutId)
        
        // 清理进程引用
        if (processId) {
          activeInstallProcesses.delete(processId)
        }
        
        fnmLogger.info(`[进程退出] 退出码: ${code}, 输出长度: ${output.length}, 错误长度: ${errorOutput.length}`)
        if (output.length === 0 && errorOutput.length === 0) {
          fnmLogger.warn(`[警告] 命令没有任何输出！`)
        }
        
        resolve({
          success: code === 0,
          output: output.trim(),
          error: code !== 0 ? errorOutput.trim() : undefined,
          child
        })
      }
    })

    child.on('error', (error) => {
      if (!resolved) {
        resolved = true
        clearTimeout(timeoutId)
        
        // 清理进程引用
        if (processId) {
          activeInstallProcesses.delete(processId)
        }
        
        fnmLogger.error(`进程错误: ${error.message}`)
        
        resolve({
          success: false,
          output: '',
          error: error.message,
          child
        })
      }
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
      
      // 检查 winget 是否可用
      const wingetCheck = executeCommand('winget --version')
      
      if (!wingetCheck) {
        connectionManager.broadcast({
          type: 'fnm-install-error',
          data: { message: 'winget 不可用，请安装 Windows 应用商店 (Microsoft Store) 或使用手动安装' }
        })
        
        throw new Error(
          'winget 不可用。请确保已安装 Windows 应用商店，' +
          '或从 https://github.com/Schniz/fnm#installation 下载 fnm 手动安装。'
        )
      }
      
      connectionManager.broadcast({
        type: 'fnm-install-progress',
        data: { message: '正在使用 winget 安装 fnm...', progress: 30 }
      })

      // 尝试使用 winget 安装
      const result = await executeCommandAsync('winget', [
        'install', 
        'Schniz.fnm', 
        '--accept-package-agreements',
        '--accept-source-agreements'
      ], (data) => {
        const message = data.trim()
        if (message) {
          connectionManager.broadcast({
            type: 'fnm-install-progress',
            data: { message, progress: 60 }
          })
        }
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
        // 提供详细的错误信息和解决方案
        const errorMessage = result.error || '安装失败'
        fnmLogger.error('winget 安装失败:', errorMessage)
        
        throw new Error(
          `fnm 安装失败: ${errorMessage}\n\n` +
          '请尝试以下解决方案：\n' +
          '1. 以管理员身份运行终端\n' +
          '2. 更新 winget: winget upgrade\n' +
          '3. 手动从 https://github.com/Schniz/fnm/releases 下载安装\n' +
          '4. 或者考虑使用 Volta 代替'
        )
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
    // 获取已安装的版本（使用 FNM 环境）
    const installedOutput = executeCommand('fnm list', true)
    const currentOutput = executeCommand('fnm current', true)

    // 解析已安装版本
    // fnm list 输出格式: "* v20.11.0 default" 或 "v20.11.0"
    const installed = installedOutput
      ? installedOutput.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0 && line !== '* system') // 过滤空行和 system
          .map(line => {
            // 匹配 "* v20.11.0 default" 或 "v20.11.0" 格式
            const match = line.match(/\*?\s*v?(\d+\.\d+\.\d+)/)
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
    const clientId = req.headers['x-client-id'] as string || 'system'

    if (!version) {
      return res.status(400).json({
        success: false,
        message: '请提供要安装的版本号'
      })
    }

    fnmLogger.info(`[API调用] 开始安装 Node.js ${version}, clientId: ${clientId}`)
    
    connectionManager.broadcast({
      type: 'node-install-start',
      data: { message: `开始安装 Node.js ${version}...`, version, clientId }
    })

    // 使用 FNM 环境执行安装，强制显示进度
    const processId = `install-${version}-${Date.now()}`
    fnmLogger.info(`[执行命令] fnm install ${version} --progress=always --log-level=info`)
    
    // 直接输出 FNM 日志
    let currentProgress = 10
    let logCount = 0
    
    try {
      // 直接调用 fnm.exe，不通过 PowerShell，避免缓冲
      // 使用国内镜像加速下载
      const args = [
        'install', 
        version, 
        '--progress=always', 
        '--log-level=info',
        '--node-dist-mirror=https://npmmirror.com/mirrors/node' // 添加阿里云镜像
      ]
      
      fnmLogger.info(`[使用镜像] https://npmmirror.com/mirrors/node`)
      
      const result = await executeCommandAsync(
        'fnm', 
        args, 
        (data) => {
        const message = data.trim()
        if (!message) return
        
        // 过滤 PowerShell 错误信息
        if (message.includes('所在位置') || message.includes('CategoryInfo')) {
          return
        }
        
        logCount++
        fnmLogger.info(`[FNM] ${message}`)
        
        // 根据日志数量估算进度
        if (logCount <= 2) {
          currentProgress = 20
        } else if (logCount <= 5) {
          currentProgress = 40
        } else if (logCount <= 10) {
          currentProgress = 60
        } else if (logCount <= 15) {
          currentProgress = 80
        } else {
          currentProgress = Math.min(90, currentProgress + 2)
        }
        
        // 直接转发 FNM 原始日志
        connectionManager.broadcast({
          type: 'node-install-progress',
          data: { 
            message: message,
            version,
            progress: currentProgress,
            step: message,
            clientId
          }
        })
      }, true, processId, 600000, true) // 10分钟超时，直接执行 fnm.exe

      fnmLogger.info(`[命令执行完成] 退出码: ${result.success ? 0 : '非0'}, 输出长度: ${result.output?.length || 0}, 错误长度: ${result.error?.length || 0}, 超时: ${result.timedOut ? '是' : '否'}`)
      fnmLogger.info(`[命令完整输出] ${result.output || '(空)'}`)
      if (result.error) {
        fnmLogger.error(`[命令错误输出] ${result.error}`)
      }

      // FNM 在已安装时返回非0退出码但实际安装成功，需要检查版本是否已存在
      const isAlreadyInstalled = result.error?.includes('already installed') || result.error?.includes('Version already installed') || result.output?.includes('already installed')
      
      fnmLogger.info(`[安装状态判断] result.success=${result.success}, isAlreadyInstalled=${isAlreadyInstalled}`)
      
      // 检查是否因为超时失败
      if (result.timedOut) {
        fnmLogger.error(`[安装失败] 超时`)
        throw new Error('安装超时，请检查网络连接或稍后重试')
      }
      
      if (result.success || isAlreadyInstalled) {
        fnmLogger.info(`[安装成功] 开始发送完成消息`)
        
        // 发送最终进度 100%
        fnmLogger.info(`[WebSocket消息] 发送 node-install-progress, progress=100`)
        connectionManager.broadcast({
          type: 'node-install-progress',
          data: { 
            message: '安装完成，正在验证...',
            version,
            progress: 100,
            step: '验证安装...',
            clientId
          }
        })

        // 立即发送完成消息
        fnmLogger.info(`[WebSocket消息] 发送 node-install-complete`)
        connectionManager.broadcast({
          type: 'node-install-complete',
          data: {
            message: `Node.js ${version} 安装成功`,
            version,
            success: true,
            clientId
          }
        })

        // 等待 WebSocket 消息发送完成
        await new Promise(resolve => setTimeout(resolve, 300))

        fnmLogger.info(`[HTTP响应] 返回成功响应`)
        res.json({
          success: true,
          data: {
            message: `Node.js ${version} 安装成功`,
            version
          }
        })
      } else {
        fnmLogger.error(`[安装失败] 退出码非0且不是已安装状态`)
        throw new Error(result.error || '安装失败')
      }
    } catch (installError) {
      fnmLogger.error('安装过程出错:', installError)
      throw installError
    }
  } catch (error) {
    fnmLogger.error('安装 Node 版本失败:', error)

    fnmLogger.info(`[WebSocket消息] 发送 node-install-error`)
    connectionManager.broadcast({
      type: 'node-install-error',
      data: { 
        message: error instanceof Error ? error.message : '安装失败',
        version: req.body.version,
        clientId: req.headers['x-client-id'] as string || 'system'
      }
    })
    
    // 同时发送完成消息（失败状态）
    connectionManager.broadcast({
      type: 'node-install-complete',
      data: {
        message: error instanceof Error ? error.message : '安装失败',
        version: req.body.version,
        success: false,
        clientId: req.headers['x-client-id'] as string || 'system'
      }
    })

    res.status(500).json({
      success: false,
      message: '安装 Node 版本失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 删除 Node 版本
 */
fnmRouter.post('/uninstall-node', async (req, res) => {
  try {
    const { version } = req.body

    if (!version) {
      return res.status(400).json({
        success: false,
        message: '请提供要删除的版本号'
      })
    }

    fnmLogger.info(`开始删除 Node.js ${version}`)

    // 使用 FNM 环境执行删除
    const result = await executeCommandAsync('fnm', ['uninstall', version], (data) => {
      const message = data.trim()
      if (message && !message.includes('所在位置') && !message.includes('CategoryInfo')) {
        fnmLogger.info(`FNM output: ${message}`)
      }
    }, true)

    if (result.success) {
      res.json({
        success: true,
        data: {
          message: `Node.js ${version} 删除成功`,
          version
        }
      })
    } else {
      throw new Error(result.error || '删除失败')
    }
  } catch (error) {
    fnmLogger.error('删除 Node 版本失败:', error)
    res.status(500).json({
      success: false,
      message: '删除 Node 版本失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 取消 Node 版本安装
 */
fnmRouter.post('/cancel-install', async (req, res) => {
  try {
    const { version } = req.body

    if (!version) {
      return res.status(400).json({
        success: false,
        message: '请提供要取消安装的版本号'
      })
    }

    const processId = `install-${version}`
    const process = activeInstallProcesses.get(processId)

    if (!process) {
      return res.status(404).json({
        success: false,
        message: '未找到该版本的安装进程'
      })
    }

    // 终止进程
    process.kill('SIGTERM')
    activeInstallProcesses.delete(processId)

    fnmLogger.info(`已取消 Node.js ${version} 的安装`)

    connectionManager.broadcast({
      type: 'node-install-cancelled',
      data: {
        message: `已取消 Node.js ${version} 的安装`,
        version
      }
    })

    res.json({
      success: true,
      data: {
        message: `已取消 Node.js ${version} 的安装`
      }
    })
  } catch (error) {
    fnmLogger.error('取消安装失败:', error)
    res.status(500).json({
      success: false,
      message: '取消安装失败',
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
 * 切换 Node 版本（设置为默认版本）
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

    // Windows 上使用 fnm default 来设置默认版本（fnm use 需要 shell 集成）
    const result = await executeCommandAsync('fnm', ['default', version], (data) => {
      const message = data.trim()
      if (message && !message.includes('所在位置') && !message.includes('CategoryInfo')) {
        connectionManager.broadcast({
          type: 'node-switch-progress',
          data: { message, version }
        })
      }
    }, true)

    if (result.success) {
      // 自动配置 PowerShell Profile
      fnmLogger.info('开始配置 PowerShell Profile...')
      const profileSetup = setupPowerShellProfile()
      
      if (profileSetup) {
        fnmLogger.info('PowerShell Profile 配置成功')
      }
      
      // 刷新当前进程的环境变量
      refreshFnmEnvInCurrentShell()
      
      connectionManager.broadcast({
        type: 'node-switch-complete',
        data: {
          message: `已将 Node.js ${version} 设置为默认版本`,
          version,
          success: true,
          needsRestart: profileSetup
        }
      })

      res.json({
        success: true,
        data: {
          message: `已将 Node.js ${version} 设置为默认版本`,
          version,
          needsRestart: profileSetup
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

