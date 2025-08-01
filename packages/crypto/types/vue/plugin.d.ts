import { Plugin, App } from 'vue';
import { encrypt, decrypt, hash, hmac, keyGenerator, digitalSignature } from '../core/index.js';
import { useCrypto } from './composables/useCrypto.js';
import { useHash } from './composables/useHash.js';
import { useSignature } from './composables/useSignature.js';
import { aes } from '../algorithms/aes.js';
import { rsa } from '../algorithms/rsa.js';
import { encoding, base64, hex } from '../algorithms/encoding.js';

/**
 * 插件选项接口
 */
interface CryptoPluginOptions {
    globalPropertyName?: string;
    registerComposables?: boolean;
    config?: {
        defaultAESKeySize?: 128 | 192 | 256;
        defaultRSAKeySize?: 1024 | 2048 | 3072 | 4096;
        defaultHashAlgorithm?: 'MD5' | 'SHA1' | 'SHA224' | 'SHA256' | 'SHA384' | 'SHA512';
        defaultEncoding?: 'base64' | 'hex' | 'utf8';
    };
}
/**
 * 全局 Crypto 实例接口
 */
interface GlobalCrypto {
    encrypt: typeof encrypt;
    decrypt: typeof decrypt;
    hash: typeof hash;
    hmac: typeof hmac;
    keyGenerator: typeof keyGenerator;
    digitalSignature: typeof digitalSignature;
    aes: typeof aes;
    rsa: typeof rsa;
    encoding: typeof encoding;
    base64: typeof base64;
    hex: typeof hex;
    useCrypto: typeof useCrypto;
    useHash: typeof useHash;
    useSignature: typeof useSignature;
}
/**
 * Vue 3 模块声明扩展
 */
declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $crypto: GlobalCrypto;
    }
    interface GlobalProperties {
        $crypto: GlobalCrypto;
    }
}
/**
 * Crypto 插件
 */
declare const CryptoPlugin: Plugin;
/**
 * 便捷安装函数
 */
declare function installCrypto(app: App, options?: CryptoPluginOptions): void;
/**
 * 创建 Crypto 插件实例
 */
declare function createCryptoPlugin(options?: CryptoPluginOptions): Plugin;

export { CryptoPlugin, createCryptoPlugin, CryptoPlugin as default, installCrypto };
export type { CryptoPluginOptions, GlobalCrypto };
