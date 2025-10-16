/**
 * FNM (Fast Node Manager) 路由
 * 提供 fnm 相关的 API 接口
 */

import { Router } from 'express'
import type { IRouter } from 'express'
import { execSync, spawn, ChildProcess } from 'child_process'
import { resolve, join, dirname } from 'path'
import https from 'https'
import { createWriteStream, existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { logger } from '../../utils/logger.js'
import { connectionManager } from '../websocket.js'
import { cacheManager } from '../utils/cache.js'

const fnmLogger = logger.withPrefix('FNM')
export const fnmRouter: IRouter = Router()

// 存储活跃的安装进程
const activeInstallProcesses = new Map<string, ChildProcess>()

// Node 版本类型定义
interface NodeVersion {
  version: string
  lts: string | null
  isLTS: boolean
  isCurrent: boolean
  majorVersion: number
  status: string
  maintenanceStatus: string
  releaseDate: string | null
  npm: string | null
  v8: string | null
  modules: string | null
  features: {
    esm: boolean
    corepack: boolean
    testRunner: boolean
    fetch: boolean
    webStreams: boolean
    watchMode: boolean
  }
}

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
 * 手动清理缓存
 */
fnmRouter.post('/clear-cache', (_req, res) => {
  try {
    // 清理 Node 版本缓存
    cacheManager.delete('node-versions:all')
    cacheManager.delete('node-versions:lts')
    
    // 清理 Node 官方数据缓存
    nodeOfficialData = null
    nodeOfficialDataTimestamp = 0
    
    fnmLogger.info('[缓存清理] Node 版本缓存和官方数据缓存已清理')
    
    res.json({
      success: true,
      data: {
        message: '缓存已清理，下次查询将重新获取最新版本列表和官方数据'
      }
    })
  } catch (error) {
    fnmLogger.error('清理缓存失败:', error)
    res.status(500).json({
      success: false,
      message: '清理缓存失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

// Node.js 官方版本信息缓存
let nodeOfficialData: any[] | null = null
let nodeOfficialDataTimestamp = 0
const NODE_DATA_CACHE_DURATION = 30 * 60 * 1000 // 30分钟

/**
 * 获取 Node.js 官方版本详细信息
 */
async function fetchNodeOfficialData(): Promise<any[]> {
  const now = Date.now()
  
  // 检查缓存
  if (nodeOfficialData && (now - nodeOfficialDataTimestamp) < NODE_DATA_CACHE_DURATION) {
    fnmLogger.info('[Node官方数据] 使用缓存')
    return nodeOfficialData
  }
  
  try {
    fnmLogger.info('[Node官方数据] 开始获取...')
    const https = require('https')
    
    return new Promise((resolve, reject) => {
      const req = https.get('https://nodejs.org/dist/index.json', (res: any) => {
        let data = ''
        
        res.on('data', (chunk: any) => {
          data += chunk
        })
        
        res.on('end', () => {
          try {
            const versions = JSON.parse(data)
            nodeOfficialData = versions
            nodeOfficialDataTimestamp = now
            fnmLogger.info(`[Node官方数据] 成功获取 ${versions.length} 个版本`)
            resolve(versions)
          } catch (err) {
            fnmLogger.error('[Node官方数据] 解析失败:', err)
            resolve([])
          }
        })
      })
      
      req.on('error', (err: any) => {
        fnmLogger.error('[Node官方数据] 获取失败:', err)
        resolve([])
      })
      
      req.setTimeout(10000, () => {
        req.destroy()
        fnmLogger.warn('[Node官方数据] 请求超时')
        resolve([])
      })
    })
  } catch (error) {
    fnmLogger.error('[Node官方数据] 异常:', error)
    return []
  }
}

/**
 * 获取可用的远程 Node 版本列表
 * 添加了缓存机制，减少 fnm list-remote 调用次数
 */
fnmRouter.get('/available-versions', async (req, res) => {
  try {
    const { filter, lts, page = '1', pageSize = '10' } = req.query
    
    // 构建缓存键（基于 LTS 筛选）
    const cacheKey = `node-versions:${lts === 'true' ? 'lts' : 'all'}`
    
    fnmLogger.info(`[获取可用版本] filter=${filter}, lts=${lts}, page=${page}, pageSize=${pageSize}`)
    
    // 先尝试从缓存获取版本列表
    let allVersions = cacheManager.get<NodeVersion[]>(cacheKey)
    
    if (!allVersions) {
      fnmLogger.info(`[缓存未命中] 执行 fnm list-remote 命令`)
      
      // 获取 Node 官方详细数据
      const officialData = await fetchNodeOfficialData()
      const officialDataMap = new Map()
      officialData.forEach((item: any) => {
        const version = item.version.replace(/^v/, '')
        officialDataMap.set(version, {
          date: item.date,
          npm: item.npm,
          v8: item.v8,
          modules: item.modules,
          lts: item.lts || null
        })
      })
      
      // 构建命令参数
      const args = ['list-remote', '--sort=desc']
      
      if (lts === 'true') {
        args.push('--lts')
      }
      
      // 使用国内镜像
      args.push('--node-dist-mirror=https://npmmirror.com/mirrors/node')
      
      // 执行命令
      const output = executeCommand(`fnm ${args.join(' ')}`, true)
      
      if (!output) {
        return res.json({
          success: true,
          data: {
            versions: [],
            total: 0,
            page: parseInt(page as string),
            pageSize: parseInt(pageSize as string),
            totalPages: 0
          }
        })
      }
      
      // 解析版本列表
      allVersions = output.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && line.match(/^v?\d+\.\d+\.\d+/))
        .map(line => {
          // 移除 'v' 前缀和可能的 LTS 标记
          const match = line.match(/v?(\d+\.\d+\.\d+)(\s+\((.+)\))?/)
          if (match) {
            const version = match[1]
            const ltsName = match[3] || null
            const majorVersion = parseInt(version.split('.')[0])
            
            // 从官方数据获取详细信息
            const officialInfo = officialDataMap.get(version) || {}
            
            // 根据主版本号推断状态
            const isEven = majorVersion % 2 === 0
            const isCurrent = majorVersion >= 23 // 最新的非-LTS 版本
            
            // 计算维护状态
            let maintenanceStatus = 'Unknown'
            if (officialInfo.lts) {
              // LTS 版本根据时间判断
              if (officialInfo.date) {
                const releaseDate = new Date(officialInfo.date)
                const now = new Date()
                const monthsDiff = (now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
                
                if (monthsDiff < 6) {
                  maintenanceStatus = 'Active'
                } else if (monthsDiff < 30) {
                  maintenanceStatus = 'Maintenance'
                } else {
                  maintenanceStatus = 'EOL'
                }
              } else {
                maintenanceStatus = 'Active'
              }
            } else if (isCurrent) {
              maintenanceStatus = 'Current'
            } else {
              maintenanceStatus = 'Maintenance'
            }
            
            return {
              version: version,
              lts: ltsName,
              isLTS: !!ltsName,
              isCurrent: !ltsName && isCurrent,
              majorVersion: majorVersion,
              // 根据 Node.js 版本生命周期推断状态
              status: ltsName ? 'LTS' : (isCurrent ? 'Current' : 'Maintenance'),
              maintenanceStatus,
              // 根据主版本号估算特性
              features: {
                esm: majorVersion >= 12,
                corepack: majorVersion >= 16,
                testRunner: majorVersion >= 18,
                fetch: majorVersion >= 18, // Fetch API
                webStreams: majorVersion >= 16, // Web Streams
                watchMode: majorVersion >= 18 // Watch mode
              },
              // 官方数据
              releaseDate: officialInfo.date || null,
              npm: officialInfo.npm || null,
              v8: officialInfo.v8 || null,
              modules: officialInfo.modules || null
            }
          }
          return null
        })
        .filter(Boolean) as NodeVersion[]
      
      // 缓存结果（30分钟有效期）
      cacheManager.set(cacheKey, allVersions, 30 * 60 * 1000)
      fnmLogger.info(`[缓存已更新] 共 ${allVersions.length} 个版本，有效期 30 分钟`)
    } else {
      fnmLogger.info(`[缓存命中] 共 ${allVersions.length} 个版本`)
      
      // 检查缓存数据是否完整（有 npm 和 releaseDate 字段）
      const hasMissingData = allVersions.some(v => !v.npm || !v.releaseDate)
      
      if (hasMissingData) {
        fnmLogger.info(`[缓存数据不完整] 需要从官方数据增强`)
        
        // 获取 Node 官方详细数据
        const officialData = await fetchNodeOfficialData()
        const officialDataMap = new Map()
        officialData.forEach((item: any) => {
          const version = item.version.replace(/^v/, '')
          officialDataMap.set(version, {
            date: item.date,
            npm: item.npm,
            v8: item.v8,
            modules: item.modules,
            lts: item.lts || null
          })
        })
        
        // 缓存命中时，也需要用官方数据增强版本信息（如果缓存数据不包含这些字段）
        allVersions = allVersions.map(v => {
          // 如果缓存数据已经包含 npm 和 releaseDate，则不需要重新增强
          if (v.npm && v.releaseDate) {
            return v
          }
          
          // 否则从官方数据增强
          const officialInfo = officialDataMap.get(v.version) || {}
          const majorVersion = v.majorVersion || parseInt(v.version.split('.')[0])
          
          // 计算维护状态
          let maintenanceStatus = v.maintenanceStatus || 'Unknown'
          if (!v.maintenanceStatus) {
            if (officialInfo.lts || v.isLTS) {
              if (officialInfo.date) {
                const releaseDate = new Date(officialInfo.date)
                const now = new Date()
                const monthsDiff = (now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
                
                if (monthsDiff < 6) {
                  maintenanceStatus = 'Active'
                } else if (monthsDiff < 30) {
                  maintenanceStatus = 'Maintenance'
                } else {
                  maintenanceStatus = 'EOL'
                }
              } else {
                maintenanceStatus = 'Active'
              }
            } else if (v.isCurrent) {
              maintenanceStatus = 'Current'
            } else {
              maintenanceStatus = 'Maintenance'
            }
          }
          
          return {
            ...v,
            maintenanceStatus,
            releaseDate: officialInfo.date || null,
            npm: officialInfo.npm || null,
            v8: officialInfo.v8 || null,
            modules: officialInfo.modules || null,
            features: v.features || {
              esm: majorVersion >= 12,
              corepack: majorVersion >= 16,
              testRunner: majorVersion >= 18,
              fetch: majorVersion >= 18,
              webStreams: majorVersion >= 16,
              watchMode: majorVersion >= 18
            }
          }
        })
        
        // 更新缓存（如果数据被增强了）
        cacheManager.set(cacheKey, allVersions, 30 * 60 * 1000)
      }
    }
    
    // 应用搜索过滤器
    let filteredVersions = allVersions
    if (filter) {
      const filterStr = (filter as string).toLowerCase().trim()
      fnmLogger.info(`[搜索过滤] 开始过滤，关键词: "${filterStr}", 总版本数: ${allVersions.length}`)
      
      filteredVersions = allVersions.filter(v => {
        if (!v) return false
        const version = v.version.toLowerCase()
        // 支持精确匹配主版本号（如 "18" 匹配 "18.x.x"）
        // 或部分匹配（如 "20.11" 匹配 "20.11.x"）
        return version.startsWith(filterStr) || version.includes(filterStr)
      })
      
      fnmLogger.info(`[搜索结果] 关键词 "${filter}" 匹配 ${filteredVersions.length} 个版本`)
      
      // 输出前3个匹配结果
      if (filteredVersions.length > 0 && filteredVersions.length <= 10) {
        fnmLogger.info(`[匹配版本] ${filteredVersions.map(v => v.version).join(', ')}`)
      } else if (filteredVersions.length > 10) {
        fnmLogger.info(`[部分匹配版本] ${filteredVersions.slice(0, 5).map(v => v.version).join(', ')} ...`)
      }
    }
    
    const total = filteredVersions.length
    const currentPage = parseInt(page as string)
    const currentPageSize = parseInt(pageSize as string)
    const totalPages = Math.ceil(total / currentPageSize)
    
    // 分页
    const start = (currentPage - 1) * currentPageSize
    const end = start + currentPageSize
    const paginatedVersions = filteredVersions.slice(start, end)
    
    fnmLogger.info(`[返回结果] 第 ${currentPage}/${totalPages} 页，共 ${total} 个版本`)
    
    res.json({
      success: true,
      data: {
        versions: paginatedVersions,
        total,
        page: currentPage,
        pageSize: currentPageSize,
        totalPages,
        cached: allVersions === cacheManager.get(cacheKey) // 标记是否来自缓存
      }
    })
  } catch (error) {
    fnmLogger.error('获取可用版本列表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取可用版本列表失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 获取 Node 版本列表（已安装）
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

