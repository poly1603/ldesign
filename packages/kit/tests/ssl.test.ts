/**
 * SSL 模块测试
 */


import { vi } from 'vitest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SSLManager, SSLUtils } from '../src/ssl'

// Mock crypto 模块
vi.mock('node:crypto', () => ({
  generateKeyPairSync: vi.fn(),
  createHash: vi.fn(),
  randomBytes: vi.fn(),
}))

describe('sSLManager', () => {
  let sslManager: SSLManager

  beforeEach(() => {
    sslManager = new SSLManager({
      keySize: 2048,
      validityDays: 365,
    })
  })

  describe('密钥对生�?, () => {
    it('应该能够生成 RSA 密钥�?, async () => {
      const { generateKeyPairSync } = await import('node:crypto')
      vi.mocked(generateKeyPairSync).mockReturnValue({
        publicKey: {
          export: () => 'mock-public-key',
        },
        privateKey: {
          export: () => 'mock-private-key',
        },
      } as any)

      const keyPair = await sslManager.generateKeyPair()

      expect(keyPair.publicKey).toBe('mock-public-key')
      expect(keyPair.privateKey).toBe('mock-private-key')
      expect(keyPair.algorithm).toBe('rsa')
      expect(keyPair.keySize).toBe(2048)
    })

    it('应该能够生成不同大小的密�?, async () => {
      const manager4096 = new SSLManager({ keySize: 4096 })
      const { generateKeyPairSync } = await import('node:crypto')

      vi.mocked(generateKeyPairSync).mockReturnValue({
        publicKey: { export: () => 'public-4096' },
        privateKey: { export: () => 'private-4096' },
      } as any)

      const keyPair = await manager4096.generateKeyPair()
      expect(keyPair.keySize).toBe(4096)
    })
  })

  describe('证书生成', () => {
    it('应该能够生成自签名证�?, async () => {
      const mockKeyPair = {
        publicKey: 'mock-public-key',
        privateKey: 'mock-private-key',
        algorithm: 'rsa',
        keySize: 2048,
      }

      const certificateRequest = {
        subject: {
          commonName: 'localhost',
          organization: 'Test Org',
          country: 'US',
        },
      }

      // Mock certificate generation
      vi.spyOn(sslManager, 'generateSelfSignedCertificate').mockResolvedValue(
        '-----BEGIN CERTIFICATE-----\nmock-certificate\n-----END CERTIFICATE-----',
      )

      const certificate = await sslManager.generateSelfSignedCertificate(
        mockKeyPair,
        certificateRequest,
      )

      expect(certificate).toContain('BEGIN CERTIFICATE')
      expect(certificate).toContain('END CERTIFICATE')
    })

    it('应该能够生成 CSR', async () => {
      const mockKeyPair = {
        publicKey: 'mock-public-key',
        privateKey: 'mock-private-key',
        algorithm: 'rsa',
        keySize: 2048,
      }

      const certificateRequest = {
        subject: {
          commonName: 'example.com',
          organization: 'Example Corp',
        },
      }

      // Mock CSR generation
      vi.spyOn(sslManager, 'generateCSR').mockResolvedValue(
        '-----BEGIN CERTIFICATE REQUEST-----\nmock-csr\n-----END CERTIFICATE REQUEST-----',
      )

      const csr = await sslManager.generateCSR(mockKeyPair, certificateRequest)

      expect(csr).toContain('BEGIN CERTIFICATE REQUEST')
      expect(csr).toContain('END CERTIFICATE REQUEST')
    })
  })

  describe('证书验证', () => {
    it('应该能够验证证书', async () => {
      const mockCertificate
        = '-----BEGIN CERTIFICATE-----\nmock-certificate\n-----END CERTIFICATE-----'

      // Mock certificate verification
      vi.spyOn(sslManager, 'verifyCertificate').mockResolvedValue({
        valid: true,
        errors: [],
        warnings: [],
      })

      const result = await sslManager.verifyCertificate(mockCertificate)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该能够检测无效证�?, async () => {
      const invalidCertificate = 'invalid-certificate'

      // Mock invalid certificate verification
      vi.spyOn(sslManager, 'verifyCertificate').mockResolvedValue({
        valid: false,
        errors: ['Invalid certificate format'],
        warnings: [],
      })

      const result = await sslManager.verifyCertificate(invalidCertificate)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid certificate format')
    })
  })

  describe('证书解析', () => {
    it('应该能够解析证书信息', () => {
      const mockCertificate
        = '-----BEGIN CERTIFICATE-----\nmock-certificate\n-----END CERTIFICATE-----'

      // Mock certificate parsing
      vi.spyOn(sslManager, 'parseCertificate').mockReturnValue({
        subject: {
          commonName: 'localhost',
          organization: 'Test Org',
        },
        issuer: {
          commonName: 'Test CA',
          organization: 'Test CA Org',
        },
        serialNumber: '123456789',
        notBefore: '2023-01-01T00:00:00Z',
        notAfter: '2024-01-01T00:00:00Z',
        algorithm: 'sha256WithRSAEncryption',
        publicKey: 'mock-public-key',
        extensions: [],
      })

      const info = sslManager.parseCertificate(mockCertificate)

      expect(info.subject.commonName).toBe('localhost')
      expect(info.issuer.commonName).toBe('Test CA')
      expect(info.algorithm).toBe('sha256WithRSAEncryption')
    })
  })

  describe('指纹生成', () => {
    it('应该能够生成证书指纹', () => {
      const mockCertificate
        = '-----BEGIN CERTIFICATE-----\nmock-certificate\n-----END CERTIFICATE-----'
      const { createHash } = require('node:crypto')

      const mockHash = {
        update: vi.fn().mockReturnThis(),
        digest: vi.fn().mockReturnValue('abcd1234567890'),
      }

      vi.mocked(createHash).mockReturnValue(mockHash)

      const fingerprint = sslManager.generateFingerprint(mockCertificate)

      expect(fingerprint).toBe('abcd1234567890')
      expect(mockHash.update).toHaveBeenCalled()
      expect(mockHash.digest).toHaveBeenCalledWith('hex')
    })
  })
})

describe('sSLUtils', () => {
  describe('快速证书生�?, () => {
    it('应该能够快速生成自签名证书', async () => {
      // Mock SSLManager methods
      const mockGenerateKeyPair = vi.fn().mockResolvedValue({
        publicKey: 'mock-public-key',
        privateKey: 'mock-private-key',
        algorithm: 'rsa',
        keySize: 2048,
      })

      const mockGenerateCertificate = vi
        .fn()
        .mockResolvedValue(
          '-----BEGIN CERTIFICATE-----\nmock-certificate\n-----END CERTIFICATE-----',
        )

      vi.spyOn(SSLManager.prototype, 'generateKeyPair').mockImplementation(mockGenerateKeyPair)
      vi.spyOn(SSLManager.prototype, 'generateSelfSignedCertificate').mockImplementation(
        mockGenerateCertificate,
      )

      const result = await SSLUtils.generateQuickCertificate({
        commonName: 'localhost',
        organization: 'Test Org',
      })

      expect(result.certificate).toContain('BEGIN CERTIFICATE')
      expect(result.privateKey).toBe('mock-private-key')
      expect(result.publicKey).toBe('mock-public-key')
    })
  })

  describe('域名验证', () => {
    it('应该能够验证域名匹配', () => {
      const mockCertificate
        = '-----BEGIN CERTIFICATE-----\nmock-certificate\n-----END CERTIFICATE-----'

      // Mock certificate parsing
      vi.spyOn(SSLManager.prototype, 'parseCertificate').mockReturnValue({
        subject: {
          commonName: 'example.com',
        },
        issuer: {},
        serialNumber: '123',
        notBefore: '2023-01-01',
        notAfter: '2024-01-01',
        algorithm: 'sha256',
        publicKey: 'key',
        extensions: [],
      })

      const matches = SSLUtils.validateDomainMatch(mockCertificate, 'example.com')
      expect(matches).toBe(true)
    })

    it('应该能够验证通配符域�?, () => {
      const mockCertificate
        = '-----BEGIN CERTIFICATE-----\nmock-certificate\n-----END CERTIFICATE-----'

      // Mock certificate with SAN extension
      vi.spyOn(SSLManager.prototype, 'parseCertificate').mockReturnValue({
        subject: {
          commonName: '*.example.com',
        },
        issuer: {},
        serialNumber: '123',
        notBefore: '2023-01-01',
        notAfter: '2024-01-01',
        algorithm: 'sha256',
        publicKey: 'key',
        extensions: ['DNS:*.example.com,DNS:example.com'],
      })

      const matches = SSLUtils.validateDomainMatch(mockCertificate, 'sub.example.com')
      expect(matches).toBe(true)
    })
  })

  describe('证书强度分析', () => {
    it('应该能够分析证书强度', () => {
      const mockCertificate
        = '-----BEGIN CERTIFICATE-----\nmock-certificate\n-----END CERTIFICATE-----'

      // Mock strong certificate
      vi.spyOn(SSLManager.prototype, 'parseCertificate').mockReturnValue({
        subject: {
          commonName: 'example.com',
          organization: 'Example Corp',
        },
        issuer: {},
        serialNumber: '123',
        notBefore: '2023-01-01',
        notAfter: '2024-01-01',
        algorithm: 'sha256WithRSAEncryption',
        publicKey: 'strong-2048-bit-key',
        extensions: [],
      })

      const analysis = SSLUtils.analyzeCertificateStrength(mockCertificate)

      expect(analysis.score).toBeGreaterThan(80)
      expect(analysis.issues).toHaveLength(0)
    })

    it('应该能够检测弱证书', () => {
      const mockCertificate
        = '-----BEGIN CERTIFICATE-----\nmock-certificate\n-----END CERTIFICATE-----'

      // Mock weak certificate
      vi.spyOn(SSLManager.prototype, 'parseCertificate').mockReturnValue({
        subject: {
          commonName: 'example.com',
        },
        issuer: {},
        serialNumber: '123',
        notBefore: '2023-01-01',
        notAfter: '2026-01-01', // 过长的有效期
        algorithm: 'md5WithRSAEncryption', // 弱算�?        publicKey: 'weak-1024-bit-key',
        extensions: [],
      })

      const analysis = SSLUtils.analyzeCertificateStrength(mockCertificate)

      expect(analysis.score).toBeLessThan(50)
      expect(analysis.issues.length).toBeGreaterThan(0)
      expect(analysis.recommendations.length).toBeGreaterThan(0)
    })
  })

  describe('证书比较', () => {
    it('应该能够比较相同的证�?, () => {
      const cert1 = '-----BEGIN CERTIFICATE-----\ncert1\n-----END CERTIFICATE-----'
      const cert2 = '-----BEGIN CERTIFICATE-----\ncert1\n-----END CERTIFICATE-----'

      // Mock identical certificates
      vi.spyOn(SSLManager.prototype, 'parseCertificate').mockReturnValue({
        subject: { commonName: 'example.com' },
        issuer: { commonName: 'CA' },
        serialNumber: '123',
        notBefore: '2023-01-01',
        notAfter: '2024-01-01',
        algorithm: 'sha256',
        publicKey: 'same-key',
        extensions: [],
      })

      const comparison = SSLUtils.compareCertificates(cert1, cert2)

      expect(comparison.identical).toBe(true)
      expect(comparison.differences).toHaveLength(0)
    })

    it('应该能够检测证书差�?, () => {
      const cert1 = '-----BEGIN CERTIFICATE-----\ncert1\n-----END CERTIFICATE-----'
      const cert2 = '-----BEGIN CERTIFICATE-----\ncert2\n-----END CERTIFICATE-----'

      let callCount = 0
      vi.spyOn(SSLManager.prototype, 'parseCertificate').mockImplementation(() => {
        callCount++
        return {
          subject: { commonName: callCount === 1 ? 'example.com' : 'different.com' },
          issuer: { commonName: 'CA' },
          serialNumber: '123',
          notBefore: '2023-01-01',
          notAfter: '2024-01-01',
          algorithm: 'sha256',
          publicKey: 'key',
          extensions: [],
        }
      })

      const comparison = SSLUtils.compareCertificates(cert1, cert2)

      expect(comparison.identical).toBe(false)
      expect(comparison.differences.length).toBeGreaterThan(0)
    })
  })

  describe('证书摘要', () => {
    it('应该能够生成证书摘要', () => {
      const mockCertificate
        = '-----BEGIN CERTIFICATE-----\nmock-certificate\n-----END CERTIFICATE-----'

      vi.spyOn(SSLManager.prototype, 'parseCertificate').mockReturnValue({
        subject: {
          commonName: 'example.com',
          organization: 'Example Corp',
        },
        issuer: {
          commonName: 'Example CA',
        },
        serialNumber: '123456789',
        notBefore: '2023-01-01T00:00:00Z',
        notAfter: '2024-01-01T00:00:00Z',
        algorithm: 'sha256WithRSAEncryption',
        publicKey: 'mock-public-key',
        extensions: [],
      })

      vi.spyOn(SSLManager.prototype, 'generateFingerprint').mockReturnValue('abcd1234567890')

      const summary = SSLUtils.generateCertificateSummary(mockCertificate)

      expect(summary).not.toBeNull()
      expect(summary!.subject).toBe('CN=example.com, O=Example Corp')
      expect(summary!.issuer).toBe('CN=Example CA')
      expect(summary!.fingerprint).toBe('abcd1234567890')
    })
  })
})



