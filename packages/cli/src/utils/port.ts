/**
 * 端口工具
 * 提供端口检测和分配功能
 */

import { createServer } from 'net'
import portfinder from 'portfinder'

/**
 * 检查端口是否可用
 */
export function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer()
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true)
      })
      server.close()
    })
    
    server.on('error', () => {
      resolve(false)
    })
  })
}

/**
 * 获取可用端口
 */
export async function getAvailablePort(preferredPort: number = 3000): Promise<number> {
  try {
    // 首先检查首选端口是否可用
    const isPreferredAvailable = await isPortAvailable(preferredPort)
    if (isPreferredAvailable) {
      return preferredPort
    }

    // 如果首选端口不可用，寻找下一个可用端口
    portfinder.basePort = preferredPort
    return await portfinder.getPortPromise()
  } catch (error) {
    // 如果出错，返回一个随机端口
    return await portfinder.getPortPromise()
  }
}

/**
 * 获取多个可用端口
 */
export async function getAvailablePorts(count: number, startPort: number = 3000): Promise<number[]> {
  const ports: number[] = []
  let currentPort = startPort

  for (let i = 0; i < count; i++) {
    const port = await getAvailablePort(currentPort)
    ports.push(port)
    currentPort = port + 1
  }

  return ports
}

/**
 * 端口范围检查
 */
export function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port >= 1 && port <= 65535
}

/**
 * 格式化端口信息
 */
export function formatPortInfo(port: number, host: string = 'localhost'): {
  port: number
  host: string
  url: string
  localUrl: string
} {
  return {
    port,
    host,
    url: `http://${host}:${port}`,
    localUrl: `http://localhost:${port}`
  }
}
