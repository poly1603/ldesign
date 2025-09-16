"use strict";
/**
 * 构建缓存管理器
 *
 * 提供高级缓存管理功能，包括智能缓存策略、缓存分析和优化
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildCacheManager = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("node:path"));
const crypto = __importStar(require("node:crypto"));
const logger_1 = require("./logger");
/**
 * 构建缓存管理器
 */
class BuildCacheManager {
    constructor(config, logger) {
        this.cache = new Map();
        this.stats = {
            hits: 0,
            misses: 0,
            evictions: 0
        };
        this.dependencyTracker = {
            fileHashes: new Map(),
            dependencyGraph: new Map()
        };
        const defaultConfig = {
            cacheDir: path.join(process.cwd(), '.cache'),
            maxSize: 100 * 1024 * 1024, // 100MB
            maxEntries: 1000,
            strategy: 'lru',
            compression: false,
            encryption: false,
            cleanupInterval: 60 * 60 // 1 hour
        };
        this.config = { ...defaultConfig, ...config };
        this.logger = logger || new logger_1.Logger({ level: 'info' });
        this.startCleanupTimer();
    }
    /**
     * 初始化缓存
     */
    async initialize() {
        try {
            await fs.ensureDir(this.config.cacheDir);
            await this.loadCacheIndex();
            this.logger.info(`缓存管理器初始化完成，缓存目录: ${this.config.cacheDir}`);
        }
        catch (error) {
            this.logger.error('缓存初始化失败:', error);
            throw error;
        }
    }
    /**
     * 获取缓存
     */
    async get(key, dependencies) {
        const startTime = Date.now();
        try {
            let entry = this.cache.get(key);
            // 如果内存中没有，尝试从磁盘加载
            if (!entry) {
                entry = await this.loadFromDisk(key);
                if (!entry) {
                    this.stats.misses++;
                    return null;
                }
                // 加载到内存中
                this.cache.set(key, entry);
            }
            // 检查TTL
            if (entry.metadata.ttl && this.isExpired(entry)) {
                await this.delete(key);
                this.stats.misses++;
                return null;
            }
            // 检查依赖是否变更
            if (dependencies && await this.hasDependencyChanged(key, dependencies)) {
                await this.delete(key);
                this.stats.misses++;
                return null;
            }
            // 更新访问信息
            entry.metadata.lastAccessed = new Date();
            entry.metadata.accessCount++;
            this.stats.hits++;
            this.logger.debug(`缓存命中: ${key}, 耗时: ${Date.now() - startTime}ms`);
            return entry.data;
        }
        catch (error) {
            this.logger.error(`获取缓存失败: ${key}`, error);
            this.stats.misses++;
            return null;
        }
    }
    /**
     * 设置缓存
     */
    async set(key, data, options = {}) {
        const startTime = Date.now();
        try {
            const serializedData = JSON.stringify(data);
            const hash = this.generateHash(serializedData);
            const size = Buffer.byteLength(serializedData, 'utf8');
            // 检查是否需要清理空间
            await this.ensureSpace(size);
            const entry = {
                key,
                hash,
                data,
                metadata: {
                    size,
                    createdAt: new Date(),
                    lastAccessed: new Date(),
                    accessCount: 0,
                    tags: options.tags || [],
                    dependencies: options.dependencies || [],
                    ttl: options.ttl || this.config.defaultTtl
                }
            };
            this.cache.set(key, entry);
            // 更新依赖跟踪
            if (options.dependencies) {
                await this.updateDependencyTracking(key, options.dependencies);
            }
            // 持久化到磁盘
            await this.persistEntry(entry);
            const executionTime = Date.now() - startTime;
            this.logger.debug(`缓存设置成功: ${key}, 大小: ${size} bytes, 耗时: ${executionTime}ms`);
            return {
                success: true,
                key,
                size,
                executionTime
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.logger.error(`设置缓存失败: ${key}`, error);
            // 对于某些错误，抛出异常而不是返回错误结果
            if (error instanceof Error && error.message.includes('Permission denied')) {
                throw error;
            }
            return {
                success: false,
                key,
                error: error instanceof Error ? error.message : String(error),
                executionTime
            };
        }
    }
    /**
     * 检查缓存是否存在
     */
    async has(key) {
        if (this.cache.has(key)) {
            return true;
        }
        // 检查磁盘文件
        const filePath = this.getCacheFilePath(key);
        return await fs.pathExists(filePath);
    }
    /**
     * 删除缓存
     */
    async delete(key) {
        try {
            let deleted = false;
            // 从内存中删除
            if (this.cache.has(key)) {
                this.cache.delete(key);
                deleted = true;
            }
            // 删除磁盘文件
            const filePath = this.getCacheFilePath(key);
            try {
                if (await fs.pathExists(filePath)) {
                    await fs.remove(filePath);
                    deleted = true;
                }
            }
            catch {
                // 文件可能不存在，忽略错误
            }
            if (deleted) {
                this.logger.debug(`缓存删除成功: ${key}`);
            }
            return deleted;
        }
        catch (error) {
            this.logger.error(`删除缓存失败: ${key}`, error);
            return false;
        }
    }
    /**
     * 设置缓存（带依赖跟踪）
     */
    async setWithDependencies(key, data, dependencies, options) {
        const result = await this.set(key, data, options);
        if (result.success) {
            await this.updateDependencyTracking(key, dependencies);
        }
        return result;
    }
    /**
     * 清空缓存
     */
    async clear(tags) {
        let deletedCount = 0;
        try {
            if (tags && tags.length > 0) {
                // 按标签清理
                for (const [key, entry] of this.cache) {
                    if (entry.metadata.tags.some(tag => tags.includes(tag))) {
                        await this.delete(key);
                        deletedCount++;
                    }
                }
            }
            else {
                // 清空所有缓存
                deletedCount = this.cache.size;
                this.cache.clear();
                // 清空缓存目录
                await fs.emptyDir(this.config.cacheDir);
            }
            this.logger.info(`清理缓存完成，删除 ${deletedCount} 个条目`);
            return deletedCount;
        }
        catch (error) {
            this.logger.error('清理缓存失败:', error);
            return deletedCount;
        }
    }
    /**
     * 获取缓存大小
     */
    async getSize() {
        try {
            let totalSize = 0;
            // 计算内存中的缓存大小
            const memorySize = Array.from(this.cache.values())
                .reduce((sum, entry) => sum + entry.metadata.size, 0);
            // 如果有内存缓存，直接返回
            if (memorySize > 0) {
                return memorySize;
            }
            // 否则扫描磁盘文件
            if (await fs.pathExists(this.config.cacheDir)) {
                const files = await fs.readdir(this.config.cacheDir);
                const cacheFiles = files.filter(file => file.endsWith('.cache'));
                for (const file of cacheFiles) {
                    try {
                        const filePath = path.join(this.config.cacheDir, file);
                        const stats = await fs.stat(filePath);
                        totalSize += stats.size;
                    }
                    catch {
                        // 忽略无法访问的文件
                    }
                }
            }
            return totalSize;
        }
        catch (error) {
            this.logger.error('获取缓存大小失败:', error);
            return 0;
        }
    }
    /**
     * 获取缓存统计
     */
    getStats() {
        const entries = Array.from(this.cache.values());
        const totalEntries = entries.length;
        const totalSize = entries.reduce((sum, entry) => sum + entry.metadata.size, 0);
        const totalOperations = this.stats.hits + this.stats.misses;
        const hitRate = totalOperations > 0 ? this.stats.hits / totalOperations : 0;
        const missRate = totalOperations > 0 ? this.stats.misses / totalOperations : 0;
        const sizeDistribution = {
            small: 0,
            medium: 0,
            large: 0,
            huge: 0
        };
        const tagDistribution = {};
        let oldestEntry = new Date();
        let newestEntry = new Date(0);
        let totalAccessCount = 0;
        for (const entry of entries) {
            // 大小分布
            if (entry.metadata.size < 1024) {
                sizeDistribution.small++;
            }
            else if (entry.metadata.size < 100 * 1024) {
                sizeDistribution.medium++;
            }
            else if (entry.metadata.size < 1024 * 1024) {
                sizeDistribution.large++;
            }
            else {
                sizeDistribution.huge++;
            }
            // 标签分布
            for (const tag of entry.metadata.tags) {
                tagDistribution[tag] = (tagDistribution[tag] || 0) + 1;
            }
            // 时间统计
            if (entry.metadata.createdAt < oldestEntry) {
                oldestEntry = entry.metadata.createdAt;
            }
            if (entry.metadata.createdAt > newestEntry) {
                newestEntry = entry.metadata.createdAt;
            }
            totalAccessCount += entry.metadata.accessCount;
        }
        return {
            totalEntries,
            entryCount: totalEntries, // 为了兼容测试
            totalSize,
            hitRate,
            missRate,
            evictionCount: this.stats.evictions,
            oldestEntry,
            newestEntry,
            averageAccessCount: totalEntries > 0 ? totalAccessCount / totalEntries : 0,
            sizeDistribution,
            tagDistribution
        };
    }
    /**
     * 清理缓存
     */
    async cleanup() {
        const expiredCount = await this.cleanupExpired();
        const unusedCount = await this.cleanupUnused();
        return expiredCount + unusedCount;
    }
    /**
     * 优化缓存
     */
    async optimize() {
        const beforeStats = this.getStats();
        const optimizations = [];
        try {
            // 清理过期条目
            const expiredCount = await this.cleanupExpired();
            if (expiredCount > 0) {
                optimizations.push(`清理了 ${expiredCount} 个过期条目`);
            }
            // 清理未使用的条目
            const unusedCount = await this.cleanupUnused();
            if (unusedCount > 0) {
                optimizations.push(`清理了 ${unusedCount} 个未使用条目`);
            }
            // 压缩大文件
            const compressedCount = await this.compressLargeEntries();
            if (compressedCount > 0) {
                optimizations.push(`压缩了 ${compressedCount} 个大文件`);
            }
            const afterStats = this.getStats();
            this.logger.info(`缓存优化完成: ${optimizations.join(', ')}`);
            return {
                beforeStats,
                afterStats,
                optimizations
            };
        }
        catch (error) {
            this.logger.error('缓存优化失败:', error);
            throw error;
        }
    }
    /**
     * 生成哈希
     */
    generateHash(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }
    /**
     * 检查是否过期
     */
    isExpired(entry) {
        if (!entry.metadata.ttl) {
            return false;
        }
        const now = Date.now();
        const createdAt = entry.metadata.createdAt.getTime();
        const ttlMs = entry.metadata.ttl * 1000;
        return now - createdAt > ttlMs;
    }
    /**
     * 检查依赖是否变更
     */
    async hasDependencyChanged(_key, dependencies) {
        for (const dep of dependencies) {
            try {
                const stats = await fs.stat(dep);
                const currentHash = this.generateHash(stats.mtime.toISOString() + stats.size);
                const cachedHash = this.dependencyTracker.fileHashes.get(dep);
                if (cachedHash !== currentHash) {
                    return true;
                }
            }
            catch {
                // 文件不存在或无法访问，认为已变更
                return true;
            }
        }
        return false;
    }
    /**
     * 更新依赖跟踪
     */
    async updateDependencyTracking(key, dependencies) {
        for (const dep of dependencies) {
            try {
                const stats = await fs.stat(dep);
                const hash = this.generateHash(stats.mtime.toISOString() + stats.size);
                this.dependencyTracker.fileHashes.set(dep, hash);
                if (!this.dependencyTracker.dependencyGraph.has(key)) {
                    this.dependencyTracker.dependencyGraph.set(key, new Set());
                }
                this.dependencyTracker.dependencyGraph.get(key).add(dep);
            }
            catch {
                // 忽略无法访问的文件
            }
        }
    }
    /**
     * 确保有足够空间
     */
    async ensureSpace(requiredSize) {
        const currentSize = Array.from(this.cache.values())
            .reduce((sum, entry) => sum + entry.metadata.size, 0);
        if (currentSize + requiredSize <= this.config.maxSize &&
            this.cache.size < this.config.maxEntries) {
            return;
        }
        // 根据策略清理缓存
        await this.evictEntries(requiredSize);
    }
    /**
     * 驱逐条目
     */
    async evictEntries(requiredSize) {
        const entries = Array.from(this.cache.values());
        let freedSize = 0;
        // 根据策略排序
        const sortedEntries = this.sortEntriesForEviction(entries);
        for (const entry of sortedEntries) {
            if (freedSize >= requiredSize && this.cache.size < this.config.maxEntries) {
                break;
            }
            await this.delete(entry.key);
            freedSize += entry.metadata.size;
            this.stats.evictions++;
        }
    }
    /**
     * 根据策略排序条目
     */
    sortEntriesForEviction(entries) {
        switch (this.config.strategy) {
            case 'lru':
                return entries.sort((a, b) => a.metadata.lastAccessed.getTime() - b.metadata.lastAccessed.getTime());
            case 'lfu':
                return entries.sort((a, b) => a.metadata.accessCount - b.metadata.accessCount);
            case 'size-based':
                return entries.sort((a, b) => b.metadata.size - a.metadata.size);
            case 'ttl':
                return entries.sort((a, b) => a.metadata.createdAt.getTime() - b.metadata.createdAt.getTime());
            default:
                return entries;
        }
    }
    /**
     * 获取缓存文件路径
     */
    getCacheFilePath(key) {
        const hash = this.generateHash(key);
        return path.join(this.config.cacheDir, `${hash}.cache`);
    }
    /**
     * 从磁盘加载缓存条目
     */
    async loadFromDisk(key) {
        try {
            const filePath = this.getCacheFilePath(key);
            if (!(await fs.pathExists(filePath))) {
                return null;
            }
            const stats = await fs.stat(filePath);
            const data = await fs.readFile(filePath, 'utf8');
            const entry = JSON.parse(data);
            // 恢复日期对象
            entry.metadata.createdAt = new Date(entry.metadata.createdAt);
            entry.metadata.lastAccessed = new Date(entry.metadata.lastAccessed);
            if (entry.metadata.expiresAt) {
                entry.metadata.expiresAt = new Date(entry.metadata.expiresAt);
            }
            // 更新文件大小
            entry.metadata.size = stats.size;
            return entry;
        }
        catch (error) {
            this.logger.debug(`从磁盘加载缓存失败: ${key}`, error);
            return null;
        }
    }
    /**
     * 持久化条目
     */
    async persistEntry(entry) {
        const filePath = this.getCacheFilePath(entry.key);
        // 确保目录存在
        await fs.ensureDir(path.dirname(filePath));
        const data = JSON.stringify(entry);
        await fs.writeFile(filePath, data, 'utf8');
    }
    /**
     * 加载缓存索引
     */
    async loadCacheIndex() {
        try {
            const files = await fs.readdir(this.config.cacheDir);
            const cacheFiles = files.filter(file => file.endsWith('.cache'));
            for (const file of cacheFiles) {
                try {
                    const filePath = path.join(this.config.cacheDir, file);
                    const content = await fs.readFile(filePath, 'utf8');
                    const entry = JSON.parse(content);
                    // 恢复日期对象
                    entry.metadata.createdAt = new Date(entry.metadata.createdAt);
                    entry.metadata.lastAccessed = new Date(entry.metadata.lastAccessed);
                    this.cache.set(entry.key, entry);
                }
                catch (error) {
                    this.logger.warn(`加载缓存文件失败: ${file}`, error);
                }
            }
            this.logger.info(`加载了 ${this.cache.size} 个缓存条目`);
        }
        catch (error) {
            this.logger.warn('加载缓存索引失败:', error);
        }
    }
    /**
     * 清理过期条目
     */
    async cleanupExpired() {
        let count = 0;
        for (const [key, entry] of this.cache) {
            if (this.isExpired(entry)) {
                await this.delete(key);
                count++;
            }
        }
        return count;
    }
    /**
     * 清理未使用条目
     */
    async cleanupUnused() {
        let count = 0;
        const threshold = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7天
        for (const [key, entry] of this.cache) {
            if (entry.metadata.lastAccessed.getTime() < threshold &&
                entry.metadata.accessCount === 0) {
                await this.delete(key);
                count++;
            }
        }
        return count;
    }
    /**
     * 压缩大条目
     */
    async compressLargeEntries() {
        // 简化实现，实际可以使用 zlib 压缩
        return 0;
    }
    /**
     * 启动清理定时器
     */
    startCleanupTimer() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        this.cleanupTimer = setInterval(async () => {
            try {
                await this.cleanupExpired();
            }
            catch (error) {
                this.logger.error('定时清理失败:', error);
            }
        }, this.config.cleanupInterval * 1000);
    }
    /**
     * 销毁缓存管理器
     */
    async destroy() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        // 保存当前状态
        const stats = this.getStats();
        this.logger.info(`缓存管理器销毁，最终统计: ${stats.totalEntries} 条目, ${Math.round(stats.totalSize / 1024)} KB`);
    }
}
exports.BuildCacheManager = BuildCacheManager;
