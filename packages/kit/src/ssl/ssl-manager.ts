/**
 * SSL 证书管理器
 */

import type { CertificateInfo, CertificateRequest, KeyPair, SSLConfig, SSLOptions } from '../types'
import { createHash, randomBytes } from 'node:crypto'
import { join } from 'node:path'
import { FileSystem } from '../filesystem'

/**
 * SSL 管理器
 */
export class SSLManager {
  private options: Required<SSLOptions>

  constructor(options: Partial<SSLOptions> = {}) {
    this.options = {
      commonName: options.commonName || 'localhost',
      organization: options.organization || '',
      organizationUnit: options.organizationUnit || '',
      country: options.country || '',
      state: options.state || '',
      locality: options.locality || '',
      validityDays: options.validityDays || 365,
      keySize: options.keySize || 2048,
      algorithm: options.algorithm || 'rsa',
      hashAlgorithm: options.hashAlgorithm || 'sha256',
    }
  }

  /**
   * 生成密钥对
   */
  async generateKeyPair(): Promise<KeyPair> {
    const { generateKeyPairSync } = await import('node:crypto')

    const { publicKey, privateKey } = generateKeyPairSync(this.options.algorithm as any, {
      modulusLength: this.options.keySize,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    })

    return {
      publicKey,
      privateKey,
      algorithm: this.options.algorithm,
      keySize: this.options.keySize,
    }
  }

  /**
   * 创建证书签名请求 (CSR)
   */
  async createCertificateRequest(
    keyPair: KeyPair,
    subject: CertificateRequest['subject'],
  ): Promise<string> {
    // 简化的 CSR 生成实现
    // 实际项目中应该使用专业的加密库如 node-forge
    const subjectString = this.formatSubject(subject)
    const timestamp = Date.now()

    // 创建 CSR 的基本结构
    const csrData = {
      subject: subjectString,
      publicKey: keyPair.publicKey,
      timestamp,
      algorithm: keyPair.algorithm,
    }

    // 简化的 PEM 格式 CSR
    const csrContent = Buffer.from(JSON.stringify(csrData)).toString('base64')
    return [
      '-----BEGIN CERTIFICATE REQUEST-----',
      csrContent.match(/.{1,64}/g)?.join('\n') || csrContent,
      '-----END CERTIFICATE REQUEST-----',
    ].join('\n')
  }

  /**
   * 生成自签名证书
   */
  async generateSelfSignedCertificate(
    keyPair: KeyPair,
    subject: CertificateRequest['subject'],
    options: {
      validityDays?: number
      extensions?: string[]
    } = {},
  ): Promise<string> {
    const validityDays = options.validityDays ?? this.options.validityDays
    const now = new Date()
    const notBefore = now
    const notAfter = new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000)

    // 简化的自签名证书生成
    // 实际项目中应该使用专业的加密库
    const certData = {
      version: 3,
      serialNumber: this.generateSerialNumber(),
      issuer: this.formatSubject(subject),
      subject: this.formatSubject(subject),
      notBefore: notBefore.toISOString(),
      notAfter: notAfter.toISOString(),
      publicKey: keyPair.publicKey,
      algorithm: this.options.hashAlgorithm,
      extensions: options.extensions || [],
    }

    // 创建证书签名
    const certContent = this.signCertificate(certData, keyPair.privateKey)

    return [
      '-----BEGIN CERTIFICATE-----',
      certContent.match(/.{1,64}/g)?.join('\n') || certContent,
      '-----END CERTIFICATE-----',
    ].join('\n')
  }

  /**
   * 验证证书
   */
  async verifyCertificate(certificate: string): Promise<{
    valid: boolean
    info?: CertificateInfo
    errors: string[]
  }> {
    const errors: string[] = []

    try {
      const certInfo = this.parseCertificate(certificate)

      // 检查证书格式
      if (!certificate.includes('-----BEGIN CERTIFICATE-----')) {
        errors.push('Invalid certificate format')
      }

      // 检查有效期
      const now = new Date()
      if (certInfo.notBefore && new Date(certInfo.notBefore) > now) {
        errors.push('Certificate not yet valid')
      }

      if (certInfo.notAfter && new Date(certInfo.notAfter) < now) {
        errors.push('Certificate has expired')
      }

      return {
        valid: errors.length === 0,
        info: certInfo,
        errors,
      }
    }
    catch (error) {
      errors.push(`Certificate parsing error: ${(error as Error).message}`)
      return {
        valid: false,
        errors,
      }
    }
  }

  /**
   * 解析证书信息
   */
  parseCertificate(certificate: string): CertificateInfo {
    // 简化的证书解析
    // 实际项目中应该使用专业的加密库
    try {
      const content = certificate
        .replace('-----BEGIN CERTIFICATE-----', '')
        .replace('-----END CERTIFICATE-----', '')
        .replace(/\n/g, '')

      const decoded = Buffer.from(content, 'base64').toString()
      const certData = JSON.parse(decoded)

      return {
        subject: this.parseSubject(certData.subject),
        issuer: this.parseSubject(certData.issuer),
        serialNumber: certData.serialNumber,
        notBefore: certData.notBefore,
        notAfter: certData.notAfter,
        algorithm: certData.algorithm,
        publicKey: certData.publicKey,
        extensions: certData.extensions || [],
      }
    }
    catch {
      throw new Error('Invalid certificate format')
    }
  }

  /**
   * 保存证书和密钥到文件
   */
  async saveCertificateFiles(
    certificate: string,
    privateKey: string,
    outputDir: string,
    filename = 'certificate',
  ): Promise<{
      certPath: string
      keyPath: string
    }> {
    await FileSystem.createDir(outputDir, true)

    const certPath = join(outputDir, `${filename}.crt`)
    const keyPath = join(outputDir, `${filename}.key`)

    await FileSystem.writeFile(certPath, certificate)
    await FileSystem.writeFile(keyPath, privateKey)

    return { certPath, keyPath }
  }

  /**
   * 从文件加载证书和密钥
   */
  async loadCertificateFiles(
    certPath: string,
    keyPath: string,
  ): Promise<{
      certificate: string
      privateKey: string
    }> {
    const certificate = await FileSystem.readFile(certPath)
    const privateKey = await FileSystem.readFile(keyPath)

    return { certificate, privateKey }
  }

  /**
   * 创建 HTTPS 配置
   */
  async createHTTPSConfig(
    certPath: string,
    keyPath: string,
    options: {
      passphrase?: string
      ca?: string[]
      requestCert?: boolean
      rejectUnauthorized?: boolean
    } = {},
  ): Promise<SSLConfig> {
    const { certificate, privateKey } = await this.loadCertificateFiles(certPath, keyPath)

    return {
      cert: certificate,
      key: privateKey,
      passphrase: options.passphrase,
      ca: options.ca,
      requestCert: options.requestCert ?? false,
      rejectUnauthorized: options.rejectUnauthorized ?? true,
    }
  }

  /**
   * 验证证书链
   */
  async verifyCertificateChain(certificates: string[]): Promise<{
    valid: boolean
    errors: string[]
  }> {
    const errors: string[] = []

    if (certificates.length === 0) {
      errors.push('Empty certificate chain')
      return { valid: false, errors }
    }

    // 验证每个证书
    for (let i = 0; i < certificates.length; i++) {
      const cert = certificates[i]!
      const result = await this.verifyCertificate(cert)
      if (!result.valid) {
        errors.push(`Certificate ${i + 1}: ${result.errors.join(', ')}`)
      }
    }

    // 验证证书链的连续性
    for (let i = 0; i < certificates.length - 1; i++) {
      const current = this.parseCertificate(certificates[i]!)
      const next = this.parseCertificate(certificates[i + 1]!)

      if (current.issuer !== next.subject) {
        errors.push(`Certificate chain break between certificate ${i + 1} and ${i + 2}`)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * 生成证书指纹
   */
  generateFingerprint(certificate: string, algorithm = 'sha256'): string {
    const content = certificate
      .replace('-----BEGIN CERTIFICATE-----', '')
      .replace('-----END CERTIFICATE-----', '')
      .replace(/\n/g, '')

    const hash = createHash(algorithm)
    hash.update(Buffer.from(content, 'base64'))

    return hash.digest('hex').toUpperCase().match(/.{2}/g)?.join(':') || ''
  }

  /**
   * 检查证书是否即将过期
   */
  checkCertificateExpiry(
    certificate: string,
    warningDays = 30,
  ): {
      isExpiring: boolean
      daysUntilExpiry: number
      expired: boolean
    } {
    const certInfo = this.parseCertificate(certificate)
    const now = new Date()
    const expiryDate = new Date(certInfo.notAfter)

    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    )

    return {
      isExpiring: daysUntilExpiry <= warningDays && daysUntilExpiry > 0,
      daysUntilExpiry,
      expired: daysUntilExpiry <= 0,
    }
  }

  /**
   * 格式化主题信息
   */
  private formatSubject(subject: CertificateRequest['subject']): string {
    const parts: string[] = []

    if (subject.commonName)
      parts.push(`CN=${subject.commonName}`)
    if (subject.organization)
      parts.push(`O=${subject.organization}`)
    if (subject.organizationalUnit)
      parts.push(`OU=${subject.organizationalUnit}`)
    if (subject.locality)
      parts.push(`L=${subject.locality}`)
    if (subject.state)
      parts.push(`ST=${subject.state}`)
    if (subject.country)
      parts.push(`C=${subject.country}`)
    if (subject.emailAddress)
      parts.push(`emailAddress=${subject.emailAddress}`)

    return parts.join(', ')
  }

  /**
   * 解析主题信息
   */
  private parseSubject(subjectString: string): CertificateRequest['subject'] {
    const subject: CertificateRequest['subject'] = {
      commonName: 'localhost', // default value
    }
    const parts = subjectString.split(', ')

    for (const part of parts) {
      const [key, value] = part.split('=', 2)
      switch (key) {
        case 'CN':
          subject.commonName = value ?? subject.commonName
          break
        case 'O':
          subject.organization = value
          break
        case 'OU':
          subject.organizationalUnit = value
          break
        case 'L':
          subject.locality = value
          break
        case 'ST':
          subject.state = value
          break
        case 'C':
          subject.country = value
          break
        case 'emailAddress':
          subject.emailAddress = value
          break
      }
    }

    return subject
  }

  /**
   * 生成序列号
   */
  private generateSerialNumber(): string {
    return randomBytes(16).toString('hex').toUpperCase()
  }

  /**
   * 签名证书
   */
  private signCertificate(certData: any, _privateKey: string): string {
    // 简化的证书签名实现
    const content = JSON.stringify(certData)
    return Buffer.from(content).toString('base64')
  }

  /**
   * 创建 SSL 管理器实例
   */
  static create(options?: SSLOptions): SSLManager {
    return new SSLManager(options)
  }
}
