import { Encrypt, Decrypt, Hash, HMAC, KeyGenerator, DigitalSignature } from './crypto.js';
import { CryptoManager } from './manager.js';
export { CryptoConfig } from './manager.js';
export { BatchOperation, BatchResult, CacheStats, MemoryPoolConfig, PerformanceMetrics, PerformanceOptimizer } from './performance.js';
export { AESOptions, BlowfishOptions, DESOptions, DecryptResult, EncodingType, EncryptResult, HMACAlgorithm, HashAlgorithm, HashOptions, HashResult, KeyGenerationOptions, RSAKeyPair, RSAOptions, TripleDESOptions } from '../types/index.js';
export { aes } from '../algorithms/aes.js';
export { des } from '../algorithms/des.js';
export { des3, tripledes } from '../algorithms/tripledes.js';
export { blowfish } from '../algorithms/blowfish.js';
export { rsa } from '../algorithms/rsa.js';
export { base64, encoding, hex } from '../algorithms/encoding.js';

/**
 * 核心模块导出
 *
 * 提供统一的核心功能访问接口，包括：
 * - 核心功能类和实例
 * - 管理器和性能优化工具
 * - 类型定义
 */

declare const encrypt: Encrypt;
declare const decrypt: Decrypt;
declare const hash: Hash;
declare const hmac: HMAC;
declare const keyGenerator: KeyGenerator;
declare const digitalSignature: DigitalSignature;
declare const cryptoManager: CryptoManager;

export { CryptoManager, Decrypt, DigitalSignature, Encrypt, HMAC, Hash, KeyGenerator, cryptoManager, decrypt, digitalSignature, encrypt, hash, hmac, keyGenerator };
