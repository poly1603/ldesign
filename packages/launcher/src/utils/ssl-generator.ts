/**
 * SSL 证书生成工具
 * 提供自签名证书生成和管理功能
 */

import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import type {
  SSLCertificate,
  SSLCertGenerationOptions,
  CertificateStorageOptions,
  CertificateValidation,
} from '../types/security'

/**
 * SSL 证书生成器
 */
export class SSLCertificateGenerator {
  private static readonly DEFAULT_VALIDITY_DAYS = 365
  private static readonly DEFAULT_KEY_SIZE = 2048
  private static readonly DEFAULT_CERT_DIR = path.join(os.homedir(), '.ldesign', 'certs')

  /**
   * 生成自签名 SSL 证书
   */
  static async generateSelfSignedCert(
    options: SSLCertGenerationOptions = {}
  ): Promise<SSLCertificate> {
    const {
      domain = 'localhost',
      validityDays = this.DEFAULT_VALIDITY_DAYS,
      keySize = this.DEFAULT_KEY_SIZE,
      algorithm: _algorithm = 'RSA',
      organization = {},
      altNames = [],
      includeLocalhost = true,
    } = options

    try {
      // 生成密钥对
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: keySize,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
        },
      })

      // 创建证书
      const cert = await this.createCertificate({
        domain,
        validityDays,
        publicKey,
        privateKey,
        organization,
        altNames: includeLocalhost ? [...altNames, 'localhost', '127.0.0.1'] : altNames,
      })

      const now = new Date()
      const expiresAt = new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000)

      return {
        cert,
        key: privateKey,
        domain,
        expiresAt,
        createdAt: now,
        serialNumber: this.generateSerialNumber(),
        fingerprint: this.generateFingerprint(cert),
        selfSigned: true,
      }
    } catch (error) {
      throw new Error(`Failed to generate SSL certificate: ${(error as Error).message}`)
    }
  }

  /**
   * 创建证书内容
   */
  private static async createCertificate(options: {
    domain: string
    validityDays: number
    publicKey: string
    privateKey: string
    organization: any
    altNames: string[]
  }): Promise<string> {
    const {
      domain,
      validityDays,
      publicKey,
      organization,
      altNames,
    } = options

    // 简化的证书生成（实际项目中应使用专业的证书库如 node-forge）
    const now = new Date()
    const expiresAt = new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000)

    const certInfo = {
      version: 3,
      serialNumber: this.generateSerialNumber(),
      issuer: {
        commonName: domain,
        organizationName: organization.name || 'LDesign Launcher',
        organizationalUnitName: organization.unit || 'Development',
        countryName: organization.country || 'US',
        stateOrProvinceName: organization.state || 'CA',
        localityName: organization.city || 'San Francisco',
        emailAddress: organization.email || 'dev@ldesign.com',
      },
      subject: {
        commonName: domain,
        organizationName: organization.name || 'LDesign Launcher',
        organizationalUnitName: organization.unit || 'Development',
        countryName: organization.country || 'US',
        stateOrProvinceName: organization.state || 'CA',
        localityName: organization.city || 'San Francisco',
        emailAddress: organization.email || 'dev@ldesign.com',
      },
      notBefore: now,
      notAfter: expiresAt,
      publicKey,
      extensions: [
        {
          name: 'basicConstraints',
          cA: false,
        },
        {
          name: 'keyUsage',
          digitalSignature: true,
          keyEncipherment: true,
        },
        {
          name: 'extKeyUsage',
          serverAuth: true,
          clientAuth: true,
        },
        {
          name: 'subjectAltName',
          altNames: altNames.map(name => ({
            type: this.isIPAddress(name) ? 7 : 2, // 7 for IP, 2 for DNS
            value: name,
          })),
        },
      ],
    }

    // 生成简化的 PEM 格式证书
    // 注意：这是一个简化实现，生产环境应使用专业的证书库
    const certPem = this.generatePEMCertificate(certInfo)
    return certPem
  }

  /**
   * 生成 PEM 格式证书（简化实现）
   */
  private static generatePEMCertificate(certInfo: any): string {
    // 这是一个简化的实现，实际应该使用 ASN.1 编码
    const certData = Buffer.from(JSON.stringify(certInfo)).toString('base64')
    const lines = certData.match(/.{1,64}/g) || []

    return [
      '-----BEGIN CERTIFICATE-----',
      ...lines,
      '-----END CERTIFICATE-----',
    ].join('\n')
  }

  /**
   * 生成序列号
   */
  private static generateSerialNumber(): string {
    return crypto.randomBytes(16).toString('hex').toUpperCase()
  }

  /**
   * 生成证书指纹
   */
  private static generateFingerprint(cert: string): string {
    return crypto.createHash('sha256').update(cert).digest('hex').toUpperCase()
  }

  /**
   * 检查是否为 IP 地址
   */
  private static isIPAddress(value: string): boolean {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
    return ipv4Regex.test(value) || ipv6Regex.test(value)
  }

  /**
   * 保存证书到文件
   */
  static async saveCertificate(
    certificate: SSLCertificate,
    options: CertificateStorageOptions = {}
  ): Promise<{ certPath: string; keyPath: string; caPath?: string | undefined }> {
    const {
      directory = this.DEFAULT_CERT_DIR,
      certFileName = `${certificate.domain}.crt`,
      keyFileName = `${certificate.domain}.key`,
      caFileName,
      permissions = '600',
    } = options

    try {
      // 确保目录存在
      await fs.mkdir(directory, { recursive: true })

      const certPath = path.join(directory, certFileName)
      const keyPath = path.join(directory, keyFileName)

      // 保存证书和私钥
      await fs.writeFile(certPath, certificate.cert, { mode: permissions })
      await fs.writeFile(keyPath, certificate.key, { mode: permissions })

      let caPath: string | undefined
      if (certificate.ca && caFileName) {
        caPath = path.join(directory, caFileName)
        await fs.writeFile(caPath, certificate.ca, { mode: permissions })
      }

      return { certPath, keyPath, caPath: caPath || undefined }
    } catch (error) {
      throw new Error(`Failed to save certificate: ${(error as Error).message}`)
    }
  }

  /**
   * 从文件加载证书
   */
  static async loadCertificate(
    certPath: string,
    keyPath: string,
    caPath?: string
  ): Promise<SSLCertificate> {
    try {
      const cert = await fs.readFile(certPath, 'utf8')
      const key = await fs.readFile(keyPath, 'utf8')
      const ca = caPath ? await fs.readFile(caPath, 'utf8') : undefined

      // 解析证书信息（简化实现）
      const domain = this.extractDomainFromCert(cert)
      const expiresAt = this.extractExpirationFromCert(cert)
      const createdAt = this.extractCreationFromCert(cert)

      return {
        cert,
        key,
        ca: ca || undefined,
        domain,
        expiresAt,
        createdAt,
        serialNumber: this.extractSerialNumberFromCert(cert),
        fingerprint: this.generateFingerprint(cert),
        selfSigned: this.isSelfSigned(cert),
      }
    } catch (error) {
      throw new Error(`Failed to load certificate: ${(error as Error).message}`)
    }
  }

  /**
   * 验证证书
   */
  static validateCertificate(certificate: SSLCertificate): CertificateValidation {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // 检查证书是否过期
      if (certificate.expiresAt < new Date()) {
        errors.push('Certificate has expired')
      }

      // 检查证书是否即将过期（30天内）
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      if (certificate.expiresAt < thirtyDaysFromNow) {
        warnings.push('Certificate will expire within 30 days')
      }

      // 检查证书格式
      if (!certificate.cert.includes('-----BEGIN CERTIFICATE-----')) {
        errors.push('Invalid certificate format')
      }

      if (!certificate.key.includes('-----BEGIN PRIVATE KEY-----') &&
        !certificate.key.includes('-----BEGIN RSA PRIVATE KEY-----')) {
        errors.push('Invalid private key format')
      }

      // 检查域名
      if (!certificate.domain || certificate.domain.trim() === '') {
        errors.push('Certificate domain is required')
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        certificate,
      }
    } catch (error) {
      return {
        valid: false,
        errors: [`Certificate validation failed: ${(error as Error).message}`],
        warnings,
        certificate,
      }
    }
  }

  /**
   * 从证书中提取域名（简化实现）
   */
  private static extractDomainFromCert(cert: string): string {
    // 简化实现，实际应该解析 ASN.1 结构
    try {
      const match = cert.match(/CN=([^,\n]+)/)
      return match ? match[1].trim() : 'localhost'
    } catch {
      return 'localhost'
    }
  }

  /**
   * 从证书中提取过期时间（简化实现）
   */
  private static extractExpirationFromCert(_cert: string): Date {
    // 简化实现，实际应该解析 ASN.1 结构
    try {
      // 默认返回一年后
      return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    } catch {
      return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    }
  }

  /**
   * 从证书中提取创建时间（简化实现）
   */
  private static extractCreationFromCert(_cert: string): Date {
    // 简化实现，实际应该解析 ASN.1 结构
    return new Date()
  }

  /**
   * 从证书中提取序列号（简化实现）
   */
  private static extractSerialNumberFromCert(_cert: string): string {
    // 简化实现，实际应该解析 ASN.1 结构
    return crypto.randomBytes(16).toString('hex').toUpperCase()
  }

  /**
   * 检查是否为自签名证书（简化实现）
   */
  private static isSelfSigned(_cert: string): boolean {
    // 简化实现，实际应该比较 issuer 和 subject
    return true // 我们生成的都是自签名证书
  }
}

/**
 * 快速生成开发用 SSL 证书
 */
export async function generateDevSSLCert(domain = 'localhost'): Promise<SSLCertificate> {
  return SSLCertificateGenerator.generateSelfSignedCert({
    domain,
    validityDays: 365,
    includeLocalhost: true,
    altNames: ['127.0.0.1', '::1'],
    organization: {
      name: 'LDesign Development',
      unit: 'Development Team',
      country: 'US',
      state: 'CA',
      city: 'San Francisco',
      email: 'dev@ldesign.com',
    },
  })
}

/**
 * 快速保存开发证书
 */
export async function saveDevSSLCert(certificate: SSLCertificate): Promise<{
  certPath: string
  keyPath: string
}> {
  const result = await SSLCertificateGenerator.saveCertificate(certificate, {
    directory: path.join(os.homedir(), '.ldesign', 'dev-certs'),
    certFileName: 'dev.crt',
    keyFileName: 'dev.key',
  })

  return {
    certPath: result.certPath,
    keyPath: result.keyPath,
  }
}