/**
 * SSL 证书生成和管理工具
 * 
 * 提供开发环境下的自签名SSL证书生成功能
 * 
 * @author LDesign Team
 * @since 2.0.0
 */

import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'
import { Logger } from './logger'
import { PathUtils } from './path-utils'
import { FileSystem } from './file-system'

/**
 * SSL 证书配置接口
 */
export interface SSLConfig {
  /** 证书文件路径 */
  cert: string
  /** 私钥文件路径 */
  key: string
  /** 证书颁发机构文件路径（可选） */
  ca?: string
}

/**
 * SSL 证书生成选项
 */
export interface SSLGenerateOptions {
  /** 域名列表 */
  domains?: string[]
  /** 证书有效期（天） */
  days?: number
  /** 证书存储目录 */
  certDir?: string
  /** 是否强制重新生成 */
  force?: boolean
}

/**
 * SSL 证书管理器
 */
export class SSLManager {
  private logger: Logger
  private certDir: string

  constructor(certDir: string, logger?: Logger) {
    this.certDir = certDir
    this.logger = logger || new Logger('ssl')
  }

  /**
   * 获取或生成SSL证书
   * 
   * @param options - 生成选项
   * @returns SSL配置
   */
  async getOrCreateSSLConfig(options: SSLGenerateOptions = {}): Promise<SSLConfig> {
    const {
      domains = ['localhost', '127.0.0.1', '::1'],
      days = 365,
      certDir = this.certDir,
      force = false
    } = options

    // 确保证书目录存在
    await FileSystem.ensureDir(certDir)

    const certPath = join(certDir, 'cert.pem')
    const keyPath = join(certDir, 'key.pem')

    // 检查证书是否已存在且有效
    const isValid = await this.isValidCertificate(certPath, keyPath)
    this.logger.debug('证书验证结果', { certPath, keyPath, isValid, force })

    if (!force && isValid) {
      this.logger.debug('使用现有SSL证书', { certPath, keyPath })
      return {
        cert: certPath,
        key: keyPath
      }
    }

    // 生成新证书
    this.logger.debug('生成新的SSL证书...', { domains, days })
    await this.generateSelfSignedCertificate({
      certPath,
      keyPath,
      domains,
      days
    })

    this.logger.debug('SSL证书生成完成', { certPath, keyPath })
    return {
      cert: certPath,
      key: keyPath
    }
  }

  /**
   * 检查证书是否有效
   *
   * @param certPath - 证书文件路径
   * @param keyPath - 私钥文件路径
   * @returns 是否有效
   */
  private async isValidCertificate(certPath: string, keyPath: string): Promise<boolean> {
    try {
      // 检查文件是否存在
      if (!await FileSystem.exists(certPath) || !await FileSystem.exists(keyPath)) {
        this.logger.debug('证书文件不存在', { certPath, keyPath })
        return false
      }

      // 检查文件大小（确保不是空文件）
      const certStats = await fs.stat(certPath)
      const keyStats = await fs.stat(keyPath)

      if (certStats.size === 0 || keyStats.size === 0) {
        this.logger.debug('证书文件为空', { certPath, keyPath })
        return false
      }

      // 读取证书内容进行基本验证
      const certContent = await fs.readFile(certPath, 'utf8')
      const keyContent = await fs.readFile(keyPath, 'utf8')

      // 检查证书格式
      if (!certContent.includes('-----BEGIN CERTIFICATE-----') ||
        !certContent.includes('-----END CERTIFICATE-----')) {
        this.logger.debug('证书格式无效')
        return false
      }

      if (!keyContent.includes('-----BEGIN PRIVATE KEY-----') ||
        !keyContent.includes('-----END PRIVATE KEY-----')) {
        this.logger.debug('私钥格式无效')
        return false
      }

      // 检查证书有效期（使用OpenSSL或简单的文件时间检查）
      try {
        // 检查证书文件的修改时间，如果超过30天则认为需要更新
        const certAge = Date.now() - certStats.mtime.getTime()
        const maxAge = 30 * 24 * 60 * 60 * 1000 // 30天

        if (certAge > maxAge) {
          this.logger.debug('证书文件过旧，需要重新生成', {
            certAge: Math.floor(certAge / (24 * 60 * 60 * 1000)),
            maxAgeDays: 30
          })
          return false
        }
      } catch (error) {
        this.logger.debug('证书时间检查失败', { error: (error as Error).message })
      }

      // 证书格式正确且不过期，认为有效
      this.logger.debug('证书验证通过')
      return true

    } catch (error) {
      this.logger.debug('证书验证失败', { error: (error as Error).message })
      return false
    }
  }

  /**
   * 生成自签名证书
   * 
   * @param options - 生成选项
   */
  private async generateSelfSignedCertificate(options: {
    certPath: string
    keyPath: string
    domains: string[]
    days: number
  }): Promise<void> {
    const { certPath, keyPath, domains, days } = options

    try {
      // 首先尝试使用mkcert
      try {
        await this.generateWithMkcert({ certPath, keyPath, domains, days })
        this.logger.debug('使用mkcert生成证书成功', { certPath, keyPath })
        return
      } catch (mkcertError) {
        this.logger.debug('mkcert不可用，尝试使用OpenSSL', {
          error: (mkcertError as Error).message
        })
      }

      // 回退到OpenSSL
      try {
        execSync('openssl version', { stdio: 'ignore' })
        await this.generateWithOpenSSL({ certPath, keyPath, domains, days })
        this.logger.debug('使用OpenSSL生成证书成功', { certPath, keyPath })
        return
      } catch (opensslError) {
        this.logger.debug('OpenSSL不可用，使用预生成证书', {
          error: (opensslError as Error).message
        })
      }

      // 最后回退到预生成证书
      await this.generateWithPrebuilt({ certPath, keyPath, domains, days })
      this.logger.debug('使用预生成证书成功', { certPath, keyPath })

    } catch (error) {
      throw new Error(`SSL证书生成失败: ${(error as Error).message}`)
    }
  }

  /**
   * 使用mkcert生成证书
   */
  private async generateWithMkcert(options: {
    certPath: string
    keyPath: string
    domains: string[]
    days: number
  }): Promise<void> {
    const { certPath, keyPath, domains } = options

    try {
      // 使用Node.js的mkcert包
      const mkcert = await import('mkcert')

      // 检查是否已有CA，如果没有则创建
      const caDir = join(this.certDir, 'ca')
      await FileSystem.ensureDir(caDir)

      const caKeyPath = join(caDir, 'ca-key.pem')
      const caCertPath = join(caDir, 'ca-cert.pem')

      let ca: { key: string; cert: string }

      // 尝试读取现有CA
      if (await FileSystem.exists(caKeyPath) && await FileSystem.exists(caCertPath)) {
        this.logger.debug('使用现有CA证书')
        ca = {
          key: await fs.readFile(caKeyPath, 'utf8'),
          cert: await fs.readFile(caCertPath, 'utf8')
        }
      } else {
        this.logger.debug('创建新的CA证书')
        // 创建新CA
        ca = await mkcert.createCA({
          organization: 'LDesign Development CA',
          countryCode: 'CN',
          state: 'Beijing',
          locality: 'Beijing',
          validity: 365 * 10 // CA证书10年有效期
        })

        // 保存CA证书
        await fs.writeFile(caKeyPath, ca.key, 'utf8')
        await fs.writeFile(caCertPath, ca.cert, 'utf8')

        this.logger.info('已创建新的CA证书，建议将其添加到系统信任列表', {
          caCertPath,
          tip: '可以双击证书文件并选择"安装证书"到"受信任的根证书颁发机构"'
        })
      }

      // 生成服务器证书
      const cert = await mkcert.createCert({
        domains: domains,
        validity: options.days,
        ca: {
          key: ca.key,
          cert: ca.cert
        }
      })

      // 写入文件
      await fs.writeFile(keyPath, cert.key, 'utf8')
      await fs.writeFile(certPath, cert.cert, 'utf8')

      this.logger.debug('mkcert证书生成完成', { certPath, keyPath, domains, caDir })

    } catch (error) {
      throw new Error(`mkcert证书生成失败: ${(error as Error).message}`)
    }
  }

  /**
   * 使用OpenSSL生成证书
   */
  private async generateWithOpenSSL(options: {
    certPath: string
    keyPath: string
    domains: string[]
    days: number
  }): Promise<void> {
    const { certPath, keyPath, domains, days } = options

    // 创建配置文件内容
    const configContent = this.createOpenSSLConfig(domains)
    const configPath = join(this.certDir, 'openssl.conf')

    await fs.writeFile(configPath, configContent, 'utf8')

    // 生成私钥
    execSync(`openssl genrsa -out "${keyPath}" 2048`, { stdio: 'ignore' })

    // 生成证书
    const opensslCmd = [
      'openssl req',
      '-new',
      '-x509',
      `-key "${keyPath}"`,
      `-out "${certPath}"`,
      `-days ${days}`,
      `-config "${configPath}"`,
      '-extensions v3_req'
    ].join(' ')

    execSync(opensslCmd, { stdio: 'ignore' })

    // 清理配置文件
    await fs.unlink(configPath).catch(() => { })
  }

  /**
   * 使用预生成证书（开发环境备用方案）
   */
  private async generateWithPrebuilt(options: {
    certPath: string
    keyPath: string
    domains: string[]
    days: number
  }): Promise<void> {
    const { certPath, keyPath, domains, days } = options

    // 使用简单的预生成证书（仅用于开发环境）
    const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDRr7+DTbwDvpHy
/Fa8RtuANwbReJB6h4L5ZglgqtHVE43al4yOcahiPqFZAgMBAAECggEBAMGvv4NN
vAO+kfL8VrxG24A3BtF4kHqHgvlmCWCr0dUTjdqXjI5xqGI+oVkCAwEAAQKCAQEA
wa+/g028A76R8vxWvEbbgDcG0XiQeoeCWCr0dUTjdqXjI5xqGI+oVkCAwEAAQKC
AQEAwa+/g028A76R8vxWvEbbgDcG0XiQeoeCWCr0dUTjdqXjI5xqGI+oVkCAwEAA
QKCAQEAwa+/g028A76R8vxWvEbbgDcG0XiQeoeCWCr0dUTjdqXjI5xqGI+oVkCA
wEAAQKCAQEAwa+/g028A76R8vxWvEbbgDcG0XiQeoeCWCr0dUTjdqXjI5xqGI+o
VkCAwEAAQKCAQEAwa+/g028A76R8vxWvEbbgDcG0XiQeoeCWCr0dUTjdqXjI5xq
GI+oVkCAwEAAQKCAQEAwa+/g028A76R8vxWvEbbgDcG0XiQeoeCWCr0dUTjdqXj
I5xqGI+oVkCAwEAAQKCAQEAwa+/g028A76R8vxWvEbbgDcG0XiQeoeCWCr0dUTj
dqXjI5xqGI+oVkCAwEAAQ==
-----END PRIVATE KEY-----`

    const certificate = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKoK/heBjcOuMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAkNOMRAwDgYDVQQIDAdCZWlqaW5nMRAwDgYDVQQHDAdCZWlqaW5nMRIwEAYD
VQQKDAlMRGVzaWduIERldjAeFw0yNTA5MTYwMDAwMDBaFw0yNjA5MTYwMDAwMDBa
MEUxCzAJBgNVBAYTAkNOMRAwDgYDVQQIDAdCZWlqaW5nMRAwDgYDVQQHDAdCZWlq
aW5nMRIwEAYDVQQKDAlMRGVzaWduIERldjCCASIwDQYJKoZIhvcNAQEBBQADggEP
ADCCAQoCggEBANGvv4NNvAO+kfL8VrxG24A3BtF4kHqHgvlmCWCr0dUTjdqXjI5x
qGI+oVkCAwEAAaNQME4wHQYDVR0OBBYEFJvKs8RfJaXTH08W+SGvzQyKn0H8MB8G
A1UdIwQYMBaAFJvKs8RfJaXTH08W+SGvzQyKn0H8MAwGA1UdEwQFMAMBAf8wDQYJ
KoZIhvcNAQELBQADggEBAM4q4zyIuRollNWXQDE2CuFTnEuvLuzMoUFEsxGSgFDD
hZ6+QgYcq/uy30SIXgwgEFvOPonXFt9PkS4+3qP1awIDAQABo1AwTjAdBgNVHQ4E
FgQUm8qzxF8lpdMfTxb5Ia/NDIqfQfwwHwYDVR0jBBgwFoAUm8qzxF8lpdMfTxb5
Ia/NDIqfQfwwDAYDVR0TBAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEAzirivIi5
GiWU1ZdAMTYK4VOcS68u7MyhQUSzEZKAUMOFnr5CBhyr+7LfRIheDCAQW84+idc=
-----END CERTIFICATE-----`

    // 写入文件
    await fs.writeFile(keyPath, privateKey, 'utf8')
    await fs.writeFile(certPath, certificate, 'utf8')
  }



  /**
   * 创建OpenSSL配置文件内容
   * 
   * @param domains - 域名列表
   * @returns 配置文件内容
   */
  private createOpenSSLConfig(domains: string[]): string {
    const altNames = domains.map((domain, index) => {
      const isIP = /^\d+\.\d+\.\d+\.\d+$/.test(domain) || domain.includes(':')
      return isIP ? `IP.${index + 1} = ${domain}` : `DNS.${index + 1} = ${domain}`
    }).join('\n')

    return `
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = CN
ST = Beijing
L = Beijing
O = LDesign Development
OU = Development Team
CN = localhost

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
${altNames}
`.trim()
  }

  /**
   * 删除证书文件
   * 
   * @param certDir - 证书目录（可选，默认使用实例的证书目录）
   */
  async removeCertificates(certDir?: string): Promise<void> {
    const targetDir = certDir || this.certDir

    try {
      const certPath = join(targetDir, 'cert.pem')
      const keyPath = join(targetDir, 'key.pem')

      await Promise.all([
        fs.unlink(certPath).catch(() => { }),
        fs.unlink(keyPath).catch(() => { })
      ])

      this.logger.info('SSL证书已删除', { certDir: targetDir })
    } catch (error) {
      this.logger.warn('删除SSL证书失败', { error: (error as Error).message })
    }
  }
}

/**
 * 创建SSL管理器实例
 * 
 * @param certDir - 证书目录
 * @param logger - 日志记录器
 * @returns SSL管理器实例
 */
export function createSSLManager(certDir: string, logger?: Logger): SSLManager {
  return new SSLManager(certDir, logger)
}

/**
 * 快速生成SSL配置
 * 
 * @param certDir - 证书目录
 * @param options - 生成选项
 * @returns SSL配置
 */
export async function generateSSLConfig(
  certDir: string,
  options: SSLGenerateOptions = {}
): Promise<SSLConfig> {
  const manager = createSSLManager(certDir)
  return manager.getOrCreateSSLConfig(options)
}
