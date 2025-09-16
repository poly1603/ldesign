"use strict";
/**
 * 性能优化工具函数
 *
 * 提供各种性能优化相关的实用工具
 *
 * @author LDesign Team
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchProcessor = exports.MemoryMonitor = void 0;
exports.debounce = debounce;
exports.throttle = throttle;
exports.memoize = memoize;
exports.memoizeAsync = memoizeAsync;
exports.formatBytes = formatBytes;
exports.formatDuration = formatDuration;
/**
 * 防抖函数
 */
function debounce(func, wait, immediate = false) {
    let timeout = null;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate)
                func(...args);
        };
        const callNow = immediate && !timeout;
        if (timeout)
            clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow)
            func(...args);
    };
}
/**
 * 节流函数
 */
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
/**
 * 内存使用监控
 */
class MemoryMonitor {
    constructor(maxSamples = 100) {
        this.samples = [];
        this.maxSamples = maxSamples;
    }
    /**
     * 记录当前内存使用情况
     */
    sample() {
        const usage = process.memoryUsage();
        const timestamp = Date.now();
        this.samples.push({ timestamp, usage });
        // 限制样本数量
        if (this.samples.length > this.maxSamples) {
            this.samples.shift();
        }
        return usage;
    }
    /**
     * 获取内存使用趋势
     */
    getTrend() {
        if (this.samples.length === 0) {
            const current = process.memoryUsage();
            return {
                current,
                peak: current,
                average: current,
                trend: 'stable'
            };
        }
        const current = this.samples[this.samples.length - 1].usage;
        const peak = this.samples.reduce((max, sample) => ({
            rss: Math.max(max.rss, sample.usage.rss),
            heapTotal: Math.max(max.heapTotal, sample.usage.heapTotal),
            heapUsed: Math.max(max.heapUsed, sample.usage.heapUsed),
            external: Math.max(max.external, sample.usage.external),
            arrayBuffers: Math.max(max.arrayBuffers || 0, sample.usage.arrayBuffers || 0)
        }), { rss: 0, heapTotal: 0, heapUsed: 0, external: 0, arrayBuffers: 0 });
        const average = this.samples.reduce((sum, sample) => ({
            rss: sum.rss + sample.usage.rss,
            heapTotal: sum.heapTotal + sample.usage.heapTotal,
            heapUsed: sum.heapUsed + sample.usage.heapUsed,
            external: sum.external + sample.usage.external,
            arrayBuffers: (sum.arrayBuffers || 0) + (sample.usage.arrayBuffers || 0)
        }), { rss: 0, heapTotal: 0, heapUsed: 0, external: 0, arrayBuffers: 0 });
        const count = this.samples.length;
        const avgUsage = {
            rss: Math.round(average.rss / count),
            heapTotal: Math.round(average.heapTotal / count),
            heapUsed: Math.round(average.heapUsed / count),
            external: Math.round(average.external / count),
            arrayBuffers: Math.round((average.arrayBuffers || 0) / count)
        };
        // 计算趋势
        let trend = 'stable';
        if (this.samples.length >= 3) {
            const recent = this.samples.slice(-3);
            const firstHeap = recent[0].usage.heapUsed;
            const lastHeap = recent[recent.length - 1].usage.heapUsed;
            const diff = lastHeap - firstHeap;
            const threshold = firstHeap * 0.1; // 10% 变化阈值
            if (diff > threshold) {
                trend = 'increasing';
            }
            else if (diff < -threshold) {
                trend = 'decreasing';
            }
        }
        return { current, peak, average: avgUsage, trend };
    }
    /**
     * 清除所有样本
     */
    clear() {
        this.samples = [];
    }
}
exports.MemoryMonitor = MemoryMonitor;
/**
 * 批处理工具
 */
class BatchProcessor {
    constructor(batchSize, processor) {
        this.batchSize = batchSize;
        this.processor = processor;
    }
    /**
     * 处理数据批次
     */
    async process(items) {
        const results = [];
        for (let i = 0; i < items.length; i += this.batchSize) {
            const batch = items.slice(i, i + this.batchSize);
            const batchResults = await this.processor(batch);
            results.push(...batchResults);
        }
        return results;
    }
    /**
     * 并行处理数据批次
     */
    async processParallel(items, maxConcurrency = 3) {
        const batches = [];
        for (let i = 0; i < items.length; i += this.batchSize) {
            batches.push(items.slice(i, i + this.batchSize));
        }
        const results = [];
        for (let i = 0; i < batches.length; i += maxConcurrency) {
            const concurrentBatches = batches.slice(i, i + maxConcurrency);
            const promises = concurrentBatches.map(batch => this.processor(batch));
            const batchResults = await Promise.all(promises);
            results.push(...batchResults.flat());
        }
        return results;
    }
}
exports.BatchProcessor = BatchProcessor;
/**
 * 缓存装饰器
 */
function memoize(fn, keyGenerator) {
    const cache = new Map();
    return (...args) => {
        const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
}
/**
 * 异步缓存装饰器
 */
function memoizeAsync(fn, keyGenerator, ttl) {
    const cache = new Map();
    return async (...args) => {
        const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
        const now = Date.now();
        if (cache.has(key)) {
            const cached = cache.get(key);
            if (!ttl || (now - cached.timestamp) < ttl) {
                return cached.value;
            }
        }
        const result = await fn(...args);
        cache.set(key, { value: result, timestamp: now });
        return result;
    };
}
/**
 * 格式化字节大小
 */
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
/**
 * 格式化持续时间
 */
function formatDuration(ms) {
    if (ms < 1000)
        return `${ms}ms`;
    if (ms < 60000)
        return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000)
        return `${(ms / 60000).toFixed(1)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
}
