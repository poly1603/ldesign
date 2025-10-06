/**
 * API 路由
 * 提供后端 API 接口
 */

import { Router } from 'express'
import type { IRouter } from 'express'
import { readFileSync, existsSync, createWriteStream } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync, spawn } from 'child_process'
import os from 'os'
import https from 'https'
import { logger } from '../../utils/logger.js'
import { connectionManager } from '../websocket.js'
import { projectsRouter } from './projects.js'
import { projectToolsRouter } from './project-tools.js'
import { npmSourcesRouter } from './npm-sources.js'
import { verdaccioRouter } from './verdaccio.js'
import { packageManagerRouter } from './package-manager.js'
import { ProcessManager } from '../ProcessManager.js'
import { configManager } from '../config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const apiLogger = logger.withPrefix('API')
export const apiRouter: IRouter = Router()

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
 * 异步执行命令并通过WebSocket发送进度
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
 * 获取操作系统信息
 */
function getOSInfo() {
  const platform = os.platform()
  const arch = os.arch()

  return {
    platform,
    arch,
    isWindows: platform === 'win32',
    isMac: platform === 'darwin',
    isLinux: platform === 'linux'
  }
}

/**
 * 下载文件并报告进度
 */
function downloadFile(url: string, destination: string, onProgress?: (progress: number, downloaded: number, total: number) => void): Promise<boolean> {
  return new Promise((resolve) => {
    const file = createWriteStream(destination)

    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // 处理重定向
        if (response.headers.location) {
          downloadFile(response.headers.location, destination, onProgress).then(resolve)
          return
        }
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

      file.on('error', () => {
        resolve(false)
      })
    }).on('error', () => {
      resolve(false)
    })
  })
}

/**
 * 获取Git信息
 */
function getGitInfo(): Record<string, any> {
  const gitInfo: Record<string, any> = {}

  // 检查是否在Git仓库中
  const isGitRepo = existsSync(resolve(process.cwd(), '.git'))
  gitInfo.isRepository = isGitRepo

  if (isGitRepo) {
    gitInfo.branch = executeCommand('git rev-parse --abbrev-ref HEAD')
    gitInfo.commit = executeCommand('git rev-parse HEAD')
    gitInfo.shortCommit = executeCommand('git rev-parse --short HEAD')
    gitInfo.author = executeCommand('git log -1 --pretty=format:"%an"')
    gitInfo.email = executeCommand('git log -1 --pretty=format:"%ae"')
    gitInfo.message = executeCommand('git log -1 --pretty=format:"%s"')
    gitInfo.date = executeCommand('git log -1 --pretty=format:"%ai"')
    gitInfo.remoteUrl = executeCommand('git config --get remote.origin.url')

    // 获取状态信息
    const status = executeCommand('git status --porcelain')
    gitInfo.hasChanges = status ? status.length > 0 : false
    gitInfo.changedFiles = status ? status.split('\n').filter(line => line.trim()).length : 0
  }

  return gitInfo
}

/**
 * 获取网络信息
 */
function getNetworkInfo(): Record<string, any> {
  const networkInterfaces = os.networkInterfaces()
  const interfaces: any[] = []

  for (const [name, addrs] of Object.entries(networkInterfaces)) {
    if (!addrs) continue

    for (const addr of addrs) {
      // 过滤掉内部地址和IPv6链路本地地址
      if (!addr.internal && !(addr.family === 'IPv6' && addr.address.startsWith('fe80'))) {
        interfaces.push({
          name,
          family: addr.family,
          address: addr.address,
          netmask: addr.netmask,
          mac: addr.mac
        })
      }
    }
  }

  return {
    interfaces,
    hostname: os.hostname()
  }
}

/**
 * 获取显示器信息（Windows）
 */
function getDisplayInfo(): Record<string, any> {
  try {
    if (process.platform === 'win32') {
      // 使用 WMIC 获取显示器信息
      const output = executeCommand('wmic path Win32_VideoController get Name,CurrentHorizontalResolution,CurrentVerticalResolution,CurrentRefreshRate /format:csv')

      if (output) {
        const lines = output.split('\n').filter(line => line.trim() && !line.startsWith('Node'))
        const displays: any[] = []

        for (const line of lines) {
          const parts = line.split(',').map(p => p.trim())
          if (parts.length >= 5) {
            displays.push({
              name: parts[4] || 'Unknown',
              resolution: `${parts[1]}x${parts[2]}`,
              refreshRate: `${parts[3]}Hz`
            })
          }
        }

        return { displays, count: displays.length }
      }
    }

    return { displays: [], count: 0, message: '仅支持 Windows 系统' }
  } catch (error) {
    return { displays: [], count: 0, error: '获取显示器信息失败' }
  }
}

/**
 * 获取设备能力信息
 */
function getDeviceCapabilities(): Record<string, any> {
  const cpus = os.cpus()
  const cpuModel = cpus[0]?.model || 'Unknown'
  const cpuSpeed = cpus[0]?.speed || 0

  return {
    cpu: {
      model: cpuModel,
      cores: cpus.length,
      speed: `${cpuSpeed} MHz`
    },
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem()
    },
    platform: {
      type: os.type(),
      release: os.release(),
      arch: os.arch()
    }
  }
}

/**
 * 获取系统详细信息
 */
function getSystemInfo(): Record<string, any> {
  const memoryUsage = process.memoryUsage()
  const cpuUsage = process.cpuUsage()

  return {
    // Node.js 信息
    node: {
      version: process.version,
      platform: process.platform,
      arch: process.arch,
      execPath: process.execPath,
      pid: process.pid,
      versions: process.versions
    },

    // 系统信息
    system: {
      hostname: os.hostname(),
      type: os.type(),
      release: os.release(),
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      loadAverage: os.loadavg(),
      uptime: Math.floor(os.uptime())
    },

    // 网络信息
    network: getNetworkInfo(),

    // 显示器信息
    display: getDisplayInfo(),

    // 设备能力
    capabilities: getDeviceCapabilities(),

    // 进程内存使用
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100, // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100, // MB
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100, // MB
      external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100, // MB
      arrayBuffers: Math.round(memoryUsage.arrayBuffers / 1024 / 1024 * 100) / 100 // MB
    },

    // CPU 使用
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system
    },

    // 环境变量
    env: {
      nodeEnv: process.env.NODE_ENV || 'development',
      home: process.env.HOME || process.env.USERPROFILE,
      shell: process.env.SHELL || process.env.COMSPEC,
      path: process.env.PATH?.split(process.platform === 'win32' ? ';' : ':').slice(0, 5) // 只显示前5个路径
    }
  }
}

/**
 * 获取系统 Node 版本（不依赖版本管理工具）
 */
apiRouter.get('/system/node-version', (_req, res) => {
  try {
    // 直接获取当前运行的 Node.js 版本
    const version = process.version
    
    // 也可以尝试从命令行获取（备用方案）
    let commandVersion = null
    try {
      commandVersion = executeCommand('node --version')
    } catch {
      // 忽略错误
    }

    res.json({
      success: true,
      data: {
        version: version || commandVersion,
        fromProcess: true,
        platform: process.platform,
        arch: process.arch
      }
    })
  } catch (error) {
    apiLogger.error('获取系统 Node 版本失败:', error)
    res.status(500).json({
      success: false,
      message: '获取系统 Node 版本失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 健康检查接口
 */
apiRouter.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'LDesign CLI Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

/**
 * 系统信息接口
 */
apiRouter.get('/info', (_req, res) => {
  try {
    // 读取包信息
    const packagePath = resolve(__dirname, '../../../package.json')
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'))

    // 获取详细系统信息
    const systemInfo = getSystemInfo()
    const gitInfo = getGitInfo()

    res.json({
      success: true,
      data: {
        // 项目信息
        project: {
          name: packageJson.name,
          version: packageJson.version,
          description: packageJson.description,
          author: packageJson.author,
          license: packageJson.license,
          homepage: packageJson.homepage,
          repository: packageJson.repository
        },

        // 系统信息
        ...systemInfo,

        // Git 信息
        git: gitInfo,

        // 时间戳
        timestamp: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    })
  } catch (error) {
    apiLogger.error('获取系统信息失败:', error)
    res.status(500).json({
      success: false,
      message: '获取系统信息失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})





/**
 * 菜单数据接口
 */
apiRouter.get('/menu', (_req, res) => {
  const menuData = [
    {
      id: 'dashboard',
      name: '仪表盘',
      icon: '📊',
      path: '/',
      children: []
    },
    {
      id: 'projects',
      name: '项目管理',
      icon: '📁',
      path: '/projects',
      children: []
    },
    {
      id: 'node',
      name: 'Node 管理',
      icon: '🟢',
      path: '/node',
      children: []
    }
  ]

  res.json({
    success: true,
    data: menuData
  })
})

/**
 * 检测NVM安装状态
 */
apiRouter.get('/node/nvm/status', (_req, res) => {
  try {
    // 检查NVM是否安装
    const nvmVersion = executeCommand('nvm version')
    const isInstalled = nvmVersion !== null

    res.json({
      success: true,
      data: {
        installed: isInstalled,
        version: nvmVersion,
        platform: process.platform
      }
    })
  } catch (error) {
    apiLogger.error('检测NVM状态失败:', error)
    res.status(500).json({
      success: false,
      message: '检测NVM状态失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 一键安装NVM
 */
apiRouter.post('/node/nvm/install', async (_req, res) => {
  try {
    const systemInfo = getOSInfo()

    // 发送开始安装的WebSocket消息
    connectionManager.broadcast({
      type: 'nvm-install-start',
      data: { message: '开始安装 NVM...', platform: systemInfo.platform }
    })

    if (systemInfo.isWindows) {
      // Windows 平台 - 下载并提示用户安装
      const downloadUrl = 'https://github.com/coreybutler/nvm-windows/releases/latest/download/nvm-setup.exe'
      const tempDir = os.tmpdir()
      const installerPath = resolve(tempDir, 'nvm-setup.exe')

      apiLogger.info('正在下载 nvm-windows 安装程序...')
      connectionManager.broadcast({
        type: 'nvm-install-progress',
        data: { message: '正在下载安装程序...', progress: 10 }
      })

      const downloadSuccess = await downloadFile(downloadUrl, installerPath, (progress, downloaded, total) => {
        // 实时报告下载进度
        const progressPercent = Math.min(10 + Math.round(progress * 0.6), 70) // 10% 到 70%
        const downloadedMB = (downloaded / 1024 / 1024).toFixed(1)
        const totalMB = (total / 1024 / 1024).toFixed(1)

        connectionManager.broadcast({
          type: 'nvm-install-progress',
          data: {
            message: `下载中... ${downloadedMB}MB / ${totalMB}MB (${progress}%)`,
            progress: progressPercent
          }
        })
      })

      if (downloadSuccess) {
        // 使用静默安装参数自动完成安装
        try {
          connectionManager.broadcast({
            type: 'nvm-install-progress',
            data: { message: '正在自动安装 NVM...', progress: 75 }
          })

          // 使用 /VERYSILENT 参数进行完全静默安装
          // /SUPPRESSMSGBOXES 抑制所有消息框
          // /NORESTART 安装后不重启
          // /DIR 指定安装目录
          const installDir = resolve(os.homedir(), 'AppData', 'Roaming', 'nvm')
          const installCommand = `"${installerPath}" /VERYSILENT /SUPPRESSMSGBOXES /NORESTART /DIR="${installDir}"`

          apiLogger.info(`执行静默安装: ${installCommand}`)

          // 使用 spawn 执行安装并等待完成
          await new Promise<void>((resolveInstall, rejectInstall) => {
            const child = spawn('cmd.exe', ['/c', installCommand], {
              stdio: 'pipe',
              windowsHide: true
            })

            let output = ''

            child.stdout?.on('data', (data) => {
              const text = data.toString()
              output += text
              apiLogger.info(`安装输出: ${text}`)
            })

            child.stderr?.on('data', (data) => {
              const text = data.toString()
              output += text
              apiLogger.error(`安装错误: ${text}`)
            })

            child.on('close', (code) => {
              if (code === 0) {
                apiLogger.info('NVM 安装完成')
                resolveInstall()
              } else {
                apiLogger.error(`安装失败，退出码: ${code}, 输出: ${output}`)
                rejectInstall(new Error(`安装失败，退出码: ${code}`))
              }
            })

            child.on('error', (error) => {
              apiLogger.error('安装进程错误:', error)
              rejectInstall(error)
            })

            // 设置超时（5分钟）
            setTimeout(() => {
              child.kill()
              rejectInstall(new Error('安装超时'))
            }, 5 * 60 * 1000)
          })

          connectionManager.broadcast({
            type: 'nvm-install-progress',
            data: { message: '安装完成，正在配置环境变量...', progress: 90 }
          })

          // 等待一下让安装程序完成环境变量配置
          await new Promise(resolve => setTimeout(resolve, 2000))

          res.json({
            success: true,
            data: {
              message: 'NVM 安装完成！',
              installPath: installDir,
              instructions: [
                '✓ NVM 已成功安装',
                '✓ 环境变量已自动配置',
                '→ 请重启终端或 IDE 以使环境变量生效',
                '→ 运行 nvm version 验证安装',
                '→ 使用 nvm install <version> 安装 Node.js'
              ]
            }
          })

          connectionManager.broadcast({
            type: 'nvm-install-complete',
            data: { message: 'NVM 安装完成！请重启终端', success: true }
          })
        } catch (error) {
          apiLogger.error('静默安装失败:', error)
          throw new Error(`自动安装失败: ${error instanceof Error ? error.message : '未知错误'}`)
        }
      } else {
        throw new Error('下载安装程序失败')
      }
    } else {
      // macOS/Linux 平台 - 自动安装
      apiLogger.info('正在安装 NVM...')
      connectionManager.broadcast({
        type: 'nvm-install-progress',
        data: { message: '正在下载并安装 NVM...', progress: 50 }
      })

      const installScript = 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash'

      const result = await executeCommandAsync('bash', ['-c', installScript], (data) => {
        connectionManager.broadcast({
          type: 'nvm-install-progress',
          data: { message: data.trim(), progress: 75 }
        })
      })

      if (result.success) {
        res.json({
          success: true,
          data: {
            message: 'NVM 安装完成，请重启终端或重新加载配置',
            instructions: [
              '1. 重启终端，或运行以下命令:',
              '   source ~/.bashrc (或 ~/.zshrc)',
              '2. 运行 nvm --version 验证安装',
              '3. 刷新页面查看 NVM 状态'
            ]
          }
        })

        connectionManager.broadcast({
          type: 'nvm-install-complete',
          data: { message: 'NVM 安装完成！请重启终端', success: true }
        })
      } else {
        throw new Error(result.error || '安装失败')
      }
    }
  } catch (error) {
    apiLogger.error('NVM安装失败:', error)

    connectionManager.broadcast({
      type: 'nvm-install-error',
      data: { message: error instanceof Error ? error.message : '安装失败' }
    })

    res.status(500).json({
      success: false,
      message: 'NVM安装失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 获取Node版本列表
 */
apiRouter.get('/node/versions', (_req, res) => {
  try {
    const systemInfo = getSystemInfo()

    // 获取已安装的版本
    let installedVersions: string | null = null
    let currentVersion: string | null = null

    if (systemInfo.isWindows) {
      // Windows nvm-windows
      installedVersions = executeCommand('nvm list')
      currentVersion = executeCommand('nvm current')
    } else {
      // macOS/Linux nvm
      installedVersions = executeCommand('nvm ls')
      currentVersion = executeCommand('nvm current')
    }

    // 解析已安装版本
    const installed = installedVersions
      ? installedVersions.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.includes('->') && !line.includes('default') && !line.includes('system'))
        .map(line => line.replace(/[*\s]/g, ''))
        .filter(version => version.match(/^v?\d+\.\d+\.\d+$/))
        .map(version => version.startsWith('v') ? version : `v${version}`)
      : []

    // 清理当前版本
    const current = currentVersion
      ? (currentVersion.startsWith('v') ? currentVersion : `v${currentVersion}`)
      : null

    res.json({
      success: true,
      data: {
        installed,
        current,
        available: [] // 可用版本通过单独接口获取
      }
    })
  } catch (error) {
    apiLogger.error('获取Node版本列表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取Node版本列表失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 获取可用的 Node.js 版本列表
 */
apiRouter.get('/node/available', async (_req, res) => {
  try {
    const systemInfo = getOSInfo()
    let availableVersions: any[] = []

    if (systemInfo.isWindows) {
      // Windows nvm-windows
      const availableOutput = executeCommand('nvm list available')
      if (availableOutput) {
        // 解析 nvm-windows 的输出格式
        const lines = availableOutput.split('\n')
        const versionLines = lines.filter(line =>
          line.trim().match(/^\d+\.\d+\.\d+/) &&
          !line.includes('|') &&
          !line.includes('CURRENT')
        )

        availableVersions = versionLines.slice(0, 20).map(line => {
          const version = line.trim().split(/\s+/)[0]
          const isLTS = line.toLowerCase().includes('lts')
          return {
            version: version.startsWith('v') ? version : `v${version}`,
            lts: isLTS,
            latest: false, // 第一个通常是最新的
            date: new Date().toISOString().split('T')[0] // 使用当前日期作为占位符
          }
        })

        // 标记第一个为最新版本
        if (availableVersions.length > 0) {
          availableVersions[0].latest = true
        }
      }
    } else {
      // macOS/Linux nvm
      const availableOutput = executeCommand('nvm ls-remote --lts')
      if (availableOutput) {
        // 解析 nvm 的输出格式
        const lines = availableOutput.split('\n')
        const versionLines = lines.filter(line =>
          line.trim().match(/^v\d+\.\d+\.\d+/) &&
          !line.includes('->') &&
          line.trim().length > 0
        )

        availableVersions = versionLines.slice(-20).reverse().map((line, index) => {
          const parts = line.trim().split(/\s+/)
          const version = parts[0]
          const isLTS = line.includes('(Latest LTS:') || line.includes('(LTS:')

          return {
            version,
            lts: isLTS,
            latest: index === 0, // 第一个是最新的
            date: new Date().toISOString().split('T')[0]
          }
        })
      }
    }

    // 如果无法获取真实版本，使用备用数据
    if (availableVersions.length === 0) {
      availableVersions = [
        { version: 'v20.10.0', lts: true, latest: false, date: '2023-12-01' },
        { version: 'v21.5.0', lts: false, latest: true, date: '2023-12-15' },
        { version: 'v18.19.0', lts: true, latest: false, date: '2023-11-20' },
        { version: 'v19.9.0', lts: false, latest: false, date: '2023-10-15' },
        { version: 'v16.20.2', lts: true, latest: false, date: '2023-09-10' },
        { version: 'v14.21.3', lts: true, latest: false, date: '2023-08-05' }
      ]
    }

    res.json({
      success: true,
      data: availableVersions
    })
  } catch (error) {
    apiLogger.error('获取可用版本列表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取可用版本列表失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 切换Node版本
 */
apiRouter.post('/node/switch', (req, res) => {
  try {
    const { version } = req.body

    if (!version) {
      return res.status(400).json({
        success: false,
        message: '请提供要切换的版本号'
      })
    }

    // 执行版本切换
    const result = executeCommand(`nvm use ${version}`)

    if (result === null) {
      return res.status(500).json({
        success: false,
        message: '版本切换失败，请检查版本号是否正确'
      })
    }

    // 获取切换后的版本
    const newVersion = executeCommand('node --version')

    res.json({
      success: true,
      data: {
        version: newVersion,
        message: `已切换到 Node.js ${newVersion}`
      }
    })
  } catch (error) {
    apiLogger.error('切换Node版本失败:', error)
    res.status(500).json({
      success: false,
      message: '切换Node版本失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 安装Node版本
 */
apiRouter.post('/node/install', async (req, res) => {
  try {
    const { version } = req.body

    if (!version) {
      return res.status(400).json({
        success: false,
        message: '请提供要安装的版本号'
      })
    }

    // 发送开始安装的WebSocket消息
    connectionManager.broadcast({
      type: 'node-install-start',
      data: { message: `开始安装 Node.js ${version}...`, version }
    })

    apiLogger.info(`开始安装 Node.js ${version}`)

    // 执行安装命令
    const result = await executeCommandAsync('nvm', ['install', version], (data) => {
      // 发送安装进度
      connectionManager.broadcast({
        type: 'node-install-progress',
        data: { message: data.trim(), version }
      })
    })

    if (result.success) {
      // 安装成功后自动切换到新版本
      const switchResult = await executeCommandAsync('nvm', ['use', version])

      connectionManager.broadcast({
        type: 'node-install-complete',
        data: {
          message: `Node.js ${version} 安装并切换成功`,
          version,
          switched: switchResult.success
        }
      })

      res.json({
        success: true,
        data: {
          version,
          message: `Node.js ${version} 安装成功${switchResult.success ? '并已切换' : ''}`,
          output: result.output,
          switched: switchResult.success
        }
      })
    } else {
      connectionManager.broadcast({
        type: 'node-install-error',
        data: { message: `Node.js ${version} 安装失败: ${result.error}`, version }
      })

      res.status(500).json({
        success: false,
        message: `Node.js ${version} 安装失败`,
        error: result.error
      })
    }
  } catch (error) {
    apiLogger.error('安装Node版本失败:', error)

    connectionManager.broadcast({
      type: 'node-install-error',
      data: { message: error instanceof Error ? error.message : '安装失败' }
    })

    res.status(500).json({
      success: false,
      message: '安装Node版本失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 切换Node版本
 */
apiRouter.post('/node/switch', async (req, res) => {
  try {
    const { version } = req.body

    if (!version) {
      return res.status(400).json({
        success: false,
        message: '请提供要切换的版本号'
      })
    }

    // 发送开始切换的WebSocket消息
    connectionManager.broadcast({
      type: 'node-switch-start',
      data: { message: `正在切换到 Node.js ${version}...`, version }
    })

    apiLogger.info(`开始切换到 Node.js ${version}`)

    // 执行切换命令
    const result = await executeCommandAsync('nvm', ['use', version], (data) => {
      connectionManager.broadcast({
        type: 'node-switch-progress',
        data: { message: data.trim(), version }
      })
    })

    if (result.success) {
      connectionManager.broadcast({
        type: 'node-switch-complete',
        data: { message: `已切换到 Node.js ${version}`, version }
      })

      res.json({
        success: true,
        data: {
          version,
          message: `已成功切换到 Node.js ${version}`,
          output: result.output
        }
      })
    } else {
      connectionManager.broadcast({
        type: 'node-switch-error',
        data: { message: `切换到 Node.js ${version} 失败: ${result.error}`, version }
      })

      res.status(500).json({
        success: false,
        message: `切换到 Node.js ${version} 失败`,
        error: result.error
      })
    }
  } catch (error) {
    apiLogger.error('切换Node版本失败:', error)

    connectionManager.broadcast({
      type: 'node-switch-error',
      data: { message: error instanceof Error ? error.message : '切换失败' }
    })

    res.status(500).json({
      success: false,
      message: '切换Node版本失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

// ==================== 配置管理 API ====================

/**
 * 获取服务器配置
 */
apiRouter.get('/config', (req, res) => {
  try {
    const runtimeConfig = configManager.getRuntimeConfig()
    
    // 如果运行时配置不存在，返回基础配置
    if (!runtimeConfig) {
      const baseConfig = configManager.getConfig()
      return res.json({
        success: true,
        data: {
          ...baseConfig,
          currentPort: baseConfig.defaultPort,
          currentHost: baseConfig.defaultHost
        }
      })
    }

    res.json({
      success: true,
      data: runtimeConfig
    })
  } catch (error: any) {
    apiLogger.error('获取配置失败:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

/**
 * 更新服务器配置
 */
apiRouter.post('/config', (req, res) => {
  try {
    const { defaultPort, defaultHost, autoOpen, debug } = req.body

    // 验证配置
    const updates: any = {}
    if (defaultPort !== undefined) {
      if (typeof defaultPort !== 'number' || defaultPort < 1 || defaultPort > 65535) {
        return res.status(400).json({
          success: false,
          message: '端口号必须在 1-65535 之间'
        })
      }
      updates.defaultPort = defaultPort
    }
    if (defaultHost !== undefined) {
      if (typeof defaultHost !== 'string') {
        return res.status(400).json({
          success: false,
          message: '主机地址必须是字符串'
        })
      }
      updates.defaultHost = defaultHost
    }
    if (autoOpen !== undefined) {
      if (typeof autoOpen !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'autoOpen 必须是布尔值'
        })
      }
      updates.autoOpen = autoOpen
    }
    if (debug !== undefined) {
      if (typeof debug !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'debug 必须是布尔值'
        })
      }
      updates.debug = debug
    }

    // 保存配置
    configManager.saveConfig(updates)

    // 返回更新后的配置
    const config = configManager.getConfig()
    res.json({
      success: true,
      data: config,
      message: '配置已保存'
    })
  } catch (error: any) {
    apiLogger.error('保存配置失败:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

// 注册项目管理路由
apiRouter.use('/projects', projectsRouter)

// 注册项目工具路由
apiRouter.use(projectToolsRouter)

// 注册 NPM 源管理路由
apiRouter.use('/npm-sources', npmSourcesRouter)

// 注册 Verdaccio 管理路由
apiRouter.use('/verdaccio', verdaccioRouter)

// 注册包管理路由
apiRouter.use('/packages', packageManagerRouter)

// ==================== 进程管理 API ====================

const processManager = ProcessManager.getInstance()

/**
 * 启动项目进程
 * POST /api/process/start
 */
apiRouter.post('/process/start', async (req, res) => {
  try {
    const { projectPath, projectId, action, environment, registry } = req.body

    if (!projectPath || !projectId || !action) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      })
    }

    // 对于 publish 动作，使用 registry 作为 environment
    const finalEnvironment = action === 'publish' && registry ? registry : (environment || 'development')

    // 启动进程
    const processInfo = await processManager.startProcess(
      projectPath,
      projectId,
      action,
      finalEnvironment
    )

    // 监听进程日志并通过 WebSocket 发送
    const processId = processInfo.id
    processManager.on('log', (id: string, message: string, type: string) => {
      if (id === processId) {
        connectionManager.broadcast({
          type: 'process-log',
          data: { processId, message, logType: type, time: Date.now() }
        })
      }
    })

    // 监听进程退出
    processManager.on('exit', (id: string, code: number | null) => {
      if (id === processId) {
        connectionManager.broadcast({
          type: 'process-exit',
          data: { processId, code }
        })
      }
    })

    // 监听进程错误
    processManager.on('error', (id: string, error: any) => {
      if (id === processId) {
        connectionManager.broadcast({
          type: 'process-error',
          data: { processId, error: error instanceof Error ? error.message : String(error) }
        })
      }
    })

    res.json({
      success: true,
      message: '进程启动成功',
      data: {
        processId: processInfo.id,
        status: processInfo.status,
        startTime: processInfo.startTime
      }
    })
  } catch (error) {
    apiLogger.error('启动进程失败:', error)
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '启动进程失败'
    })
  }
})

/**
 * 停止项目进程
 * POST /api/process/stop
 */
apiRouter.post('/process/stop', async (req, res) => {
  try {
    const { processId } = req.body

    if (!processId) {
      return res.status(400).json({
        success: false,
        message: '缺少进程 ID'
      })
    }

    await processManager.stopProcess(processId)

    res.json({
      success: true,
      message: '进程已停止'
    })
  } catch (error) {
    apiLogger.error('停止进程失败:', error)
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '停止进程失败'
    })
  }
})

/**
 * 获取进程状态
 * GET /api/process/status/:processId
 */
apiRouter.get('/process/status/:processId', (req, res) => {
  try {
    const { processId } = req.params
    const processInfo = processManager.getProcess(processId)

    if (!processInfo) {
      return res.status(404).json({
        success: false,
        message: '进程不存在'
      })
    }

    res.json({
      success: true,
      data: {
        id: processInfo.id,
        projectId: processInfo.projectId,
        action: processInfo.action,
        environment: processInfo.environment,
        status: processInfo.status,
        startTime: processInfo.startTime,
        logCount: processInfo.logs.length
      }
    })
  } catch (error) {
    apiLogger.error('获取进程状态失败:', error)
    res.status(500).json({
      success: false,
      message: '获取进程状态失败'
    })
  }
})

/**
 * 获取进程日志
 * GET /api/process/logs/:processId
 */
apiRouter.get('/process/logs/:processId', (req, res) => {
  try {
    const { processId } = req.params
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined

    const logs = processManager.getProcessLogs(processId, limit)

    res.json({
      success: true,
      data: logs
    })
  } catch (error) {
    apiLogger.error('获取进程日志失败:', error)
    res.status(500).json({
      success: false,
      message: '获取进程日志失败'
    })
  }
})

/**
 * 获取项目的所有进程
 * GET /api/process/project/:projectId
 */
apiRouter.get('/process/project/:projectId', (req, res) => {
  try {
    const { projectId } = req.params
    const processes = processManager.getProjectProcesses(projectId)

    res.json({
      success: true,
      data: processes.map(p => ({
        id: p.id,
        action: p.action,
        environment: p.environment,
        status: p.status,
        startTime: p.startTime,
        logCount: p.logs.length
      }))
    })
  } catch (error) {
    apiLogger.error('获取项目进程失败:', error)
    res.status(500).json({
      success: false,
      message: '获取项目进程失败'
    })
  }
})

