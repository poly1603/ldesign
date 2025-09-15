# 类型定义（Types）

本页总结库中常用的类型定义，源自 `src/types/index.ts`。

## 加密与编码基础类型

- EncryptionAlgorithm: 'AES' | 'RSA' | 'DES' | '3DES' | 'Blowfish'
- AESMode: 'CBC' | 'ECB' | 'CFB' | 'OFB' | 'CTR' | 'GCM'
- AESKeySize: 128 | 192 | 256
- EncodingType: 'base64' | 'hex' | 'utf8'

## 哈希与 HMAC

- HashAlgorithm: 'MD5' | 'SHA1' | 'SHA224' | 'SHA256' | 'SHA384' | 'SHA512'
- HMACAlgorithm: 'HMAC-MD5' | 'HMAC-SHA1' | 'HMAC-SHA256' | 'HMAC-SHA384' | 'HMAC-SHA512'

## 结果类型

- EncryptResult: { success, data?, algorithm, mode?, iv?, salt?, keySize?, error? }
- DecryptResult: { success, data?, algorithm, mode?, error? }
- HashResult: { success, hash, algorithm, encoding, error? }

## 选项类型（部分）

- AESOptions: { mode?, keySize?, iv?, padding? }
- RSAOptions: { keyFormat?, keySize?, padding? }
- DESOptions / TripleDESOptions / BlowfishOptions
- HashOptions / HMACOptions

## 接口

- IEncryptor: encrypt()/decrypt()
- IHasher: hash()/verify()
- IHMACer: hmac()/verify()
- IEncoder: encode()/decode()
- IKeyGenerator: 生成密钥、随机字节/盐/IV

```ts path=null start=null
import type { EncryptResult, AESOptions, HashAlgorithm } from '@ldesign/crypto'

function doSomething(data: string, key: string): EncryptResult {
  // ...
  return { success: true, data: '...', algorithm: 'AES' }
}
```
