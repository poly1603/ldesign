"use strict";
/**
 * 缓存相关工具函数
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rollupCache = exports.tsCache = exports.buildCache = exports.RollupCache = exports.TypeScriptCache = exports.BuildCache = void 0;
exports.cached = cached;
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
/**
 * 构建缓存管理器
 */
class BuildCache {
    constructor(options = {}) {
        this.memoryCache = new Map();
        this.initialized = false;
        const defaultCacheDir = path_1.default.join(process.cwd(), 'node_modules', '.cache', '@ldesign', 'builder');
        this.cacheDir = options.cacheDir || defaultCacheDir;
        this.ttl = options.ttl || 24 * 60 * 60 * 1000; // 默认24小时
        this.namespace = options.namespace || 'default';
        this.maxSize = options.maxSize;
    }
    /**
     * 初始化缓存目录
     */
    async ensureCacheDir() {
        if (!this.initialized) {
            await fs_1.promises.mkdir(this.cacheDir, { recursive: true });
            this.initialized = true;
        }
    }
    /**
     * 生成缓存键的哈希值
     */
    generateHash(key) {
        return (0, crypto_1.createHash)('md5').update(`${this.namespace}:${key}`).digest('hex');
    }
    /**
     * 获取缓存文件路径
     */
    getCachePath(key) {
        const hash = this.generateHash(key);
        return path_1.default.join(this.cacheDir, `${hash}.json`);
    }
    /**
     * 设置缓存
     */
    async set(key, value, _options) {
        await this.ensureCacheDir();
        const entry = {
            key,
            value,
            timestamp: Date.now(),
            hash: this.generateHash(key)
        };
        // 更新内存缓存
        this.memoryCache.set(key, entry);
        // 写入文件缓存
        const cachePath = this.getCachePath(key);
        try {
            await fs_1.promises.writeFile(cachePath, JSON.stringify(entry, null, 2));
            // 写入后进行体积检查与清理
            if (this.maxSize && this.maxSize > 0) {
                await this.enforceMaxSize();
            }
        }
        catch (error) {
            // 缓存写入失败不应该中断构建
            console.warn(`Cache write failed for key: ${key}`, error);
        }
    }
    /**
     * 获取缓存
     */
    async get(key) {
        // 先检查内存缓存
        const memoryEntry = this.memoryCache.get(key);
        if (memoryEntry && this.isValid(memoryEntry)) {
            return memoryEntry.value;
        }
        // 检查文件缓存
        const cachePath = this.getCachePath(key);
        try {
            const content = await fs_1.promises.readFile(cachePath, 'utf-8');
            const entry = JSON.parse(content);
            if (this.isValid(entry)) {
                // 更新内存缓存
                this.memoryCache.set(key, entry);
                return entry.value;
            }
        }
        catch {
            // 缓存不存在或读取失败
        }
        return null;
    }
    /** 获取缓存目录 */
    getDirectory() { return this.cacheDir; }
    /** 获取 TTL */
    getTTL() { return this.ttl; }
    /** 获取最大体积限制 */
    getMaxSize() { return this.maxSize; }
    /**
     * 检查缓存是否有效
     */
    isValid(entry) {
        const now = Date.now();
        return now - entry.timestamp < this.ttl;
    }
    /**
     * 若设置了 maxSize，则在超过阈值时按旧到新淘汰文件
     */
    async enforceMaxSize() {
        if (!this.maxSize || this.maxSize <= 0)
            return;
        try {
            const files = await fs_1.promises.readdir(this.cacheDir);
            // 收集 {file, size, timestamp}
            const entries = [];
            let total = 0;
            for (const f of files) {
                const full = path_1.default.join(this.cacheDir, f);
                const stat = await fs_1.promises.stat(full);
                total += stat.size;
                try {
                    const content = await fs_1.promises.readFile(full, 'utf-8');
                    const parsed = JSON.parse(content);
                    entries.push({ file: full, size: stat.size, timestamp: parsed.timestamp || 0 });
                }
                catch {
                    entries.push({ file: full, size: stat.size, timestamp: 0 });
                }
            }
            if (total <= this.maxSize)
                return;
            // 按 timestamp 升序（旧的优先删除）
            entries.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
            for (const e of entries) {
                if (total <= this.maxSize)
                    break;
                try {
                    await fs_1.promises.unlink(e.file);
                    total -= e.size;
                }
                catch {
                    // ignore
                }
            }
        }
        catch {
            // ignore
        }
    }
    /**
     * 删除缓存
     */
    async delete(key) {
        this.memoryCache.delete(key);
        const cachePath = this.getCachePath(key);
        try {
            await fs_1.promises.unlink(cachePath);
        }
        catch {
            // 文件可能不存在
        }
    }
    /**
     * 清空所有缓存
     */
    async clear() {
        this.memoryCache.clear();
        try {
            const files = await fs_1.promises.readdir(this.cacheDir);
            await Promise.all(files.map(file => fs_1.promises.unlink(path_1.default.join(this.cacheDir, file))));
        }
        catch {
            // 目录可能不存在
        }
    }
    /**
     * 获取缓存统计信息
     */
    async getStats() {
        let fileEntries = 0;
        let totalSize = 0;
        try {
            const files = await fs_1.promises.readdir(this.cacheDir);
            fileEntries = files.length;
            for (const file of files) {
                const stat = await fs_1.promises.stat(path_1.default.join(this.cacheDir, file));
                totalSize += stat.size;
            }
        }
        catch {
            // 目录可能不存在
        }
        return {
            memoryEntries: this.memoryCache.size,
            fileEntries,
            totalSize
        };
    }
}
exports.BuildCache = BuildCache;
/**
 * TypeScript 编译缓存
 */
class TypeScriptCache extends BuildCache {
    constructor() {
        super({
            namespace: 'typescript',
            ttl: 7 * 24 * 60 * 60 * 1000 // 7天
        });
    }
    /**
     * 生成 TypeScript 文件的缓存键
     */
    async generateFileKey(filePath, content) {
        if (!content) {
            content = await fs_1.promises.readFile(filePath, 'utf-8');
        }
        const hash = (0, crypto_1.createHash)('sha256').update(content).digest('hex');
        return `${filePath}:${hash}`;
    }
    /**
     * 缓存编译结果
     */
    async cacheCompiled(filePath, content, compiled) {
        const key = await this.generateFileKey(filePath, content);
        await this.set(key, compiled);
    }
    /**
     * 获取编译缓存
     */
    async getCompiled(filePath, content) {
        const key = await this.generateFileKey(filePath, content);
        return this.get(key);
    }
}
exports.TypeScriptCache = TypeScriptCache;
/**
 * Rollup 插件缓存
 */
class RollupCache extends BuildCache {
    constructor(options = {}) {
        super({
            namespace: 'rollup',
            ttl: options.ttl ?? 24 * 60 * 60 * 1000, // 24小时
            cacheDir: options.cacheDir,
            maxSize: options.maxSize,
        });
    }
    /**
     * 缓存 Rollup 构建结果
     */
    async cacheBuildResult(config, result) {
        const configHash = (0, crypto_1.createHash)('md5').update(JSON.stringify(config)).digest('hex');
        await this.set(`build:${configHash}`, result);
    }
    /**
     * 获取 Rollup 构建缓存
     */
    async getBuildResult(config) {
        const configHash = (0, crypto_1.createHash)('md5').update(JSON.stringify(config)).digest('hex');
        return this.get(`build:${configHash}`);
    }
}
exports.RollupCache = RollupCache;
/**
 * 创建默认缓存实例
 */
exports.buildCache = new BuildCache();
exports.tsCache = new TypeScriptCache();
exports.rollupCache = new RollupCache();
/**
 * 缓存装饰器
 */
function cached(fn, options) {
    const cache = new BuildCache({ ttl: options?.ttl });
    return (async (...args) => {
        const cacheKey = options?.key ? options.key(...args) : JSON.stringify(args);
        // 尝试从缓存获取
        const cached = await cache.get(cacheKey);
        if (cached !== null) {
            return cached;
        }
        // 执行原函数
        const result = await fn(...args);
        // 缓存结果
        await cache.set(cacheKey, result);
        return result;
    });
}
