#!/usr/bin/env node
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'

interface CliOptions {
  serverPort?: string
  apiPrefix?: string
  webPort?: string
  webHost?: string
}

interface DevTask {
  /** 任务名称，用于日志前缀 */
  name: 'server' | 'web'
  /** 要执行的命令 */
  command: string
  /** 命令参数 */
  args: string[]
  /** 额外的环境变量 */
  env?: Record<string, string>
}

const isWindows = process.platform === 'win32'

const DEFAULT_SERVER_PORT = '3000'
const DEFAULT_WEB_PORT = '5173'
const DEFAULT_API_PREFIX = 'api'
const DEFAULT_WEB_HOST = '0.0.0.0'

function printHelp(): void {
  console.log(`用法: pnpm tools:dev:watch [options]

可用参数：
  --port, --server-port <number>   指定后端服务端口 (默认: ${DEFAULT_SERVER_PORT})
  --api-prefix <prefix>            指定后端 API 前缀 (默认: ${DEFAULT_API_PREFIX})
  --web-port <number>              指定前端开发服务器端口 (默认: ${DEFAULT_WEB_PORT})
  --web-host <host>                指定前端开发服务器 Host (默认: ${DEFAULT_WEB_HOST})
  -h, --help                       查看帮助
`)
}

function parseCliArgs(argv: string[]): CliOptions {
  const options: CliOptions = {}
  let i = 0

  const getValue = (name: string): string => {
    const next = argv[++i]
    if (!next || next.startsWith('-')) {
      console.error(`[dev] 参数 ${name} 需要一个值`)
      process.exit(1)
    }
    return next
  }

  while (i < argv.length) {
    const arg = argv[i]

    switch (arg) {
      case '--port':
      case '--server-port':
        options.serverPort = getValue(arg)
        break
      case '--api-prefix':
        options.apiPrefix = getValue(arg)
        break
      case '--web-port':
        options.webPort = getValue(arg)
        break
      case '--web-host':
        options.webHost = getValue(arg)
        break
      case '--help':
      case '-h':
        printHelp()
        process.exit(0)
      default:
        if (arg.startsWith('-')) {
          console.warn(`[dev] 未识别的参数: ${arg}`)
        }
    }

    i++
  }

  return options
}

const cliOptions = parseCliArgs(process.argv.slice(2))

const serverPort = cliOptions.serverPort
  || process.env.PORT
  || process.env.LDESIGN_SERVER_PORT
  || DEFAULT_SERVER_PORT

const apiPrefix = cliOptions.apiPrefix
  || process.env.API_PREFIX
  || DEFAULT_API_PREFIX

const webPort = cliOptions.webPort
  || process.env.VITE_DEV_SERVER_PORT
  || process.env.VITE_PORT
  || DEFAULT_WEB_PORT

const webHost = cliOptions.webHost
  || process.env.VITE_HOST
  || DEFAULT_WEB_HOST

const apiBaseUrl = process.env.VITE_API_BASE_URL
  || `http://localhost:${serverPort}/${apiPrefix}`

const tasks: DevTask[] = [
  {
    name: 'server',
    command: 'pnpm',
    args: ['--filter', '@ldesign/server', 'start:dev'],
    env: {
      PORT: serverPort,
      API_PREFIX: apiPrefix,
      NODE_ENV: 'development',
    },
  },
  {
    name: 'web',
    command: 'pnpm',
    args: ['--filter', '@ldesign/web', 'dev', '--', '--port', webPort, '--host', webHost],
    env: {
      VITE_API_BASE_URL: apiBaseUrl,
      NODE_ENV: 'development',
    },
  },
]

const runningProcesses = new Map<string, ChildProcessWithoutNullStreams>()

function logPrefix(name: DevTask['name']): string {
  return name === 'server' ? '[server] ' : '[ web ] '
}

function attachStream(
  child: ChildProcessWithoutNullStreams,
  name: DevTask['name'],
): void {
  const prefix = logPrefix(name)

  child.stdout.on('data', (data: Buffer) => {
    data
      .toString()
      .split(/\r?\n/)
      .filter(Boolean)
      .forEach((line) => {
        console.log(`${prefix}${line}`)
      })
  })

  child.stderr.on('data', (data: Buffer) => {
    data
      .toString()
      .split(/\r?\n/)
      .filter(Boolean)
      .forEach((line) => {
        console.error(`${prefix}${line}`)
      })
  })
}

function runTask(task: DevTask): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(task.command, task.args, {
      cwd: process.cwd(),
      shell: isWindows,
      stdio: ['inherit', 'pipe', 'pipe'],
      env: {
        ...process.env,
        ...task.env,
      },
    })

    runningProcesses.set(task.name, child)
    attachStream(child, task.name)

    child.on('close', (code, signal) => {
      runningProcesses.delete(task.name)

      if (signal) {
        console.log(`${logPrefix(task.name)}已收到信号 ${signal}，进程结束`)
        resolve()
        return
      }

      if (code === 0) {
        console.log(`${logPrefix(task.name)}已退出`)
        resolve()
      }
      else {
        reject(new Error(`${task.name} 进程异常退出，代码 ${code}`))
      }
    })

    child.on('error', (error) => {
      runningProcesses.delete(task.name)
      reject(error)
    })
  })
}

function setupCleanup(): void {
  const terminate = () => {
    for (const [name, child] of runningProcesses.entries()) {
      console.log(`${logPrefix(name)}正在退出...`)
      child.kill()
    }
  }

  process.on('SIGINT', () => {
    console.log('\n接收到 SIGINT，正在停止开发服务...')
    terminate()
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    console.log('\n接收到 SIGTERM，正在停止开发服务...')
    terminate()
    process.exit(0)
  })

  process.on('exit', () => {
    terminate()
  })
}

async function main(): Promise<void> {
  console.log('[dev] 正在同时启动 @ldesign/server 与 @ldesign/web 的开发模式...')
  console.log(`  - server: http://localhost:${serverPort}/${apiPrefix}`)
  console.log(`  - web   : http://${webHost === '0.0.0.0' ? 'localhost' : webHost}:${webPort}`)
  console.log(`  - API   : ${apiBaseUrl}\n`)

  setupCleanup()

  try {
    await Promise.all(tasks.map(task => runTask(task)))
  }
  catch (error) {
    console.error('开发脚本异常退出:', error)
    process.exit(1)
  }
}

main()

