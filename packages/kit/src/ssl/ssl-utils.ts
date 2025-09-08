/**
 * SSL 工具函数
 */

import type { SSLValidationResult } from '../types'
import { SSLManager } from './ssl-manager'

/**
 * SSL 工具类
 */
export class SSLUtils {
  /**
   * 快速生成自签名证书
   */
  static async generateQuickCertificate(options: {
    commonName: string
    organization?: string
    validityDays?: number
    keySize?: number
  }): Promise<{
      certificate: string
      privateKey: string
      publicKey: string
    }> {
    const sslManager = new SSLManager({
      commonName: 'localhost',
      keySize: options.keySize || 2048,
      validityDays: options.validityDays || 365,
    })

    const keyPair = await sslManager.generateKeyPair()
    const certificate = await sslManager.generateSelfSignedCertificate(keyPair, {
      commonName: options.commonName,
      organization: options.organization || 'Self-Signed',
    })

    return {
      certificate,
      privateKey: keyPair.privateKey,
      publicKey: keyPair.publicKey,
    }
  }

  /**
   * 验证域名是否匹配证书
   */
  static validateDomainMatch(certificate: string, domain: string): boolean {
    try {
      const sslManager = new SSLManager()
      const certInfo = sslManager.parseCertificate(certificate)

      // 检查 CN
      if (certInfo.subject.commonName === domain) {
        return true
      }

      // 检查 SAN (Subject Alternative Names)
      const sanExtension = certInfo.extensions.find(
        ext => typeof ext === 'string' && ext.includes('DNS:'),
      )

      if (sanExtension && typeof sanExtension === 'string') {
        const domains
          = sanExtension.match(/DNS:([^,\s]+)/g)?.map(match => match.replace('DNS:', '')) || []

        return domains.some((sanDomain) => {
          // 支持通配符匹配
          if (sanDomain.startsWith('*.')) {
            const baseDomain = sanDomain.substring(2)
            return domain.endsWith(baseDomain) && domain !== baseDomain
          }
          return sanDomain === domain
        })
      }

      return false
    }
    catch {
      return false
    }
  }

  /**
   * 检查证书强度
   */
  static analyzeCertificateStrength(certificate: string): {
    score: number
    issues: string[]
    recommendations: string[]
  } {
    const issues: string[] = []
    const recommendations: string[] = []
    let score = 100

    try {
      const sslManager = new SSLManager()
      const certInfo = sslManager.parseCertificate(certificate)

      // 检查算法强度
      if (certInfo.algorithm === 'md5') {
        issues.push('使用了不安全的 MD5 哈希算法')
        score -= 40
        recommendations.push('升级到 SHA-256 或更强的哈希算法')
      }
      else if (certInfo.algorithm === 'sha1') {
        issues.push('使用了较弱的 SHA-1 哈希算法')
        score -= 20
        recommendations.push('升级到 SHA-256 或更强的哈希算法')
      }

      // 检查密钥长度（从公钥推断）
      const keyLength = this.estimateKeyLength(certInfo.publicKey)
      if (keyLength < 2048) {
        issues.push(`密钥长度过短 (${keyLength} bits)`)
        score -= 30
        recommendations.push('使用至少 2048 位的 RSA 密钥')
      }
      else if (keyLength < 3072) {
        issues.push(`密钥长度较弱 (${keyLength} bits)`)
        score -= 10
        recommendations.push('考虑使用 3072 位或更长的密钥')
      }

      // 检查有效期
      const now = new Date()
      const notAfter = new Date(certInfo.notAfter)
      const validityDays = Math.ceil((notAfter.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (validityDays > 825) {
        // 超过约 2.25 年
        issues.push('证书有效期过长')
        score -= 10
        recommendations.push('使用较短的证书有效期（建议不超过 1 年）')
      }

      // 检查主题信息完整性
      if (!certInfo.subject.commonName) {
        issues.push('缺少通用名称 (CN)')
        score -= 15
      }

      if (!certInfo.subject.organization) {
        issues.push('缺少组织信息')
        score -= 5
        recommendations.push('添加组织信息以提高证书可信度')
      }
    }
    catch {
      issues.push('证书解析失败')
      score = 0
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations,
    }
  }

  /**
   * 比较两个证书
   */
  static compareCertificates(
    cert1: string,
    cert2: string,
  ): {
      identical: boolean
      differences: string[]
    } {
    const differences: string[] = []

    try {
      const sslManager = new SSLManager()
      const info1 = sslManager.parseCertificate(cert1)
      const info2 = sslManager.parseCertificate(cert2)

      // 比较序列号
      if (info1.serialNumber !== info2.serialNumber) {
        differences.push('序列号不同')
      }

      // 比较主题
      if (JSON.stringify(info1.subject) !== JSON.stringify(info2.subject)) {
        differences.push('主题信息不同')
      }

      // 比较颁发者
      if (JSON.stringify(info1.issuer) !== JSON.stringify(info2.issuer)) {
        differences.push('颁发者不同')
      }

      // 比较有效期
      if (info1.notBefore !== info2.notBefore || info1.notAfter !== info2.notAfter) {
        differences.push('有效期不同')
      }

      // 比较公钥
      if (info1.publicKey !== info2.publicKey) {
        differences.push('公钥不同')
      }

      // 比较算法
      if (info1.algorithm !== info2.algorithm) {
        differences.push('签名算法不同')
      }
    }
    catch {
      differences.push('证书解析失败')
    }

    return {
      identical: differences.length === 0,
      differences,
    }
  }

  /**
   * 生成证书摘要信息
   */
  static generateCertificateSummary(certificate: string): {
    fingerprint: string
    subject: string
    issuer: string
    validFrom: string
    validTo: string
    algorithm: string
    keyLength: number
  } | null {
    try {
      const sslManager = new SSLManager()
      const certInfo = sslManager.parseCertificate(certificate)
      const fingerprint = sslManager.generateFingerprint(certificate)

      return {
        fingerprint,
        subject: this.formatSubjectString(certInfo.subject),
        issuer: this.formatSubjectString(certInfo.issuer),
        validFrom: certInfo.notBefore,
        validTo: certInfo.notAfter,
        algorithm: certInfo.algorithm,
        keyLength: this.estimateKeyLength(certInfo.publicKey),
      }
    }
    catch {
      return null
    }
  }

  /**
   * 验证证书链的完整性
   */
  static async validateCertificateChain(certificates: string[]): Promise<SSLValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    if (certificates.length === 0) {
      return {
        valid: false,
        errors: ['证书链为空'],
        warnings: [],
      }
    }

    const sslManager = new SSLManager()

    // 验证每个证书
    for (let i = 0; i < certificates.length; i++) {
      const cert = certificates[i]!
      const result = await sslManager.verifyCertificate(cert)
      if (!result.valid) {
        errors.push(`证书 ${i + 1}: ${result.errors.join(', ')}`)
      }
    }

    // 检查证书链顺序
    for (let i = 0; i < certificates.length - 1; i++) {
      try {
        const current = sslManager.parseCertificate(certificates[i]!)
        const next = sslManager.parseCertificate(certificates[i + 1]!)

        if (this.formatSubjectString(current.issuer) !== this.formatSubjectString(next.subject)) {
          errors.push(`证书链在第 ${i + 1} 和第 ${i + 2} 个证书之间断裂`)
        }
      }
      catch (error) {
        errors.push(`证书链验证失败: ${(error as Error).message}`)
      }
    }

    // 检查根证书
    if (certificates.length > 1) {
      try {
        const rootCert = sslManager.parseCertificate(certificates[certificates.length - 1]!)
        if (
          this.formatSubjectString(rootCert.subject) !== this.formatSubjectString(rootCert.issuer)
        ) {
          warnings.push('最后一个证书不是自签名的根证书')
        }
      }
      catch {
        warnings.push('无法验证根证书')
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * 检查证书是否为自签名
   */
  static isSelfSigned(certificate: string): boolean {
    try {
      const sslManager = new SSLManager()
      const certInfo = sslManager.parseCertificate(certificate)

      return (
        this.formatSubjectString(certInfo.subject) === this.formatSubjectString(certInfo.issuer)
      )
    }
    catch {
      return false
    }
  }

  /**
   * 获取证书的所有域名
   */
  static getCertificateDomains(certificate: string): string[] {
    try {
      const sslManager = new SSLManager()
      const certInfo = sslManager.parseCertificate(certificate)
      const domains: string[] = []

      // 添加 CN
      if (certInfo.subject.commonName) {
        domains.push(certInfo.subject.commonName)
      }

      // 添加 SAN 域名
      const sanExtension = certInfo.extensions.find(
        ext => typeof ext === 'string' && ext.includes('DNS:'),
      )

      if (sanExtension && typeof sanExtension === 'string') {
        const sanDomains
          = sanExtension.match(/DNS:([^,\s]+)/g)?.map(match => match.replace('DNS:', '')) || []

        domains.push(...sanDomains)
      }

      // 去重并返回
      return [...new Set(domains)]
    }
    catch {
      return []
    }
  }

  /**
   * 估算密钥长度
   */
  private static estimateKeyLength(publicKey: string): number {
    // 简化的密钥长度估算
    // 实际项目中应该解析 ASN.1 结构
    const keyContent = publicKey
      .replace('-----BEGIN PUBLIC KEY-----', '')
      .replace('-----END PUBLIC KEY-----', '')
      .replace(/\n/g, '')

    const keyBytes = Buffer.from(keyContent, 'base64').length

    // 粗略估算（实际应该解析 ASN.1）
    if (keyBytes < 200)
      return 1024
    if (keyBytes < 400)
      return 2048
    if (keyBytes < 600)
      return 3072
    return 4096
  }

  /**
   * 格式化主题字符串
   */
  private static formatSubjectString(subject: any): string {
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
}
