/**
 * 网络工具函数
 */

import { networkInterfaces } from 'os'

/**
 * 获取本机IP地址
 */
export function getLocalIpAddress(): string | undefined {
  const interfaces = networkInterfaces()

  for (const name in interfaces) {
    const networkInterface = interfaces[name]
    if (!networkInterface) continue

    for (const config of networkInterface) {
      // 跳过内部地址和IPv6
      if (config.family === 'IPv4' && !config.internal) {
        return config.address
      }
    }
  }

  return undefined
}

/**
 * 获取所有可访问的URL
 */
export function getAccessUrls(host: string, port: number): {
  local: string
  network?: string
  ip?: string
} {
  const localUrl = `http://localhost:${port}`

  // 如果host是0.0.0.0或特定IP,提供网络访问URL
  if (host === '0.0.0.0' || host === '::') {
    const ip = getLocalIpAddress()
    return {
      local: localUrl,
      network: ip ? `http://${ip}:${port}` : undefined,
      ip,
    }
  }

  // 如果host是localhost或127.0.0.1
  if (host === 'localhost' || host === '127.0.0.1') {
    return {
      local: localUrl,
    }
  }

  // 其他情况
  return {
    local: `http://${host}:${port}`,
  }
}


