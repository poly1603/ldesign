"use strict";
/**
 * 适配器工厂
 *
 * 负责创建和管理不同的打包器适配器
 *
 * @author LDesign Team
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BundlerAdapterFactory = void 0;
const errors_1 = require("../../constants/errors");
const error_handler_1 = require("../../utils/error-handler");
/**
 * 基础适配器实现（临时）
 */
class BaseAdapter {
    constructor(name) {
        this.version = '1.0.0';
        this.available = true;
        this.name = name;
    }
    async build(_config) {
        // 临时实现，返回模拟结果
        return {
            success: true,
            outputs: [],
            duration: 1000,
            stats: {
                totalSize: 0,
                gzipSize: 0,
                files: [],
                chunks: [],
                assets: [],
                modules: [],
                dependencies: [],
                warnings: [],
                errors: []
            },
            warnings: [],
            errors: []
        };
    }
    async watch(_config) {
        // 临时实现
        const mockWatcher = {
            patterns: ['src/**/*'],
            watching: true,
            close: async () => { },
            on: () => { },
            off: () => { },
            emit: () => { }
        };
        return mockWatcher;
    }
    async transformConfig(config) {
        return config;
    }
    async transformPlugins(plugins) {
        return plugins;
    }
    supportsFeature(_feature) {
        return true;
    }
    getFeatureSupport() {
        return {};
    }
    getPerformanceMetrics() {
        return {
            buildTime: 0,
            memoryUsage: {
                heapUsed: 0,
                heapTotal: 0,
                external: 0,
                rss: 0,
                peak: 0,
                trend: []
            },
            cacheStats: {
                hits: 0,
                misses: 0,
                hitRate: 0,
                size: 0,
                entries: 0,
                timeSaved: 0
            },
            fileStats: {
                totalFiles: 0,
                filesByType: {},
                averageProcessingTime: 0,
                slowestFiles: [],
                processingRate: 0
            },
            pluginPerformance: [],
            systemResources: {
                cpuUsage: 0,
                availableMemory: 0,
                diskUsage: {
                    total: 0,
                    used: 0,
                    available: 0,
                    usagePercent: 0
                }
            }
        };
    }
    async dispose() {
        // 清理资源
    }
}
/**
 * 适配器工厂类
 */
class BundlerAdapterFactory {
    /**
     * 注册适配器
     */
    static register(bundler, adapterClass) {
        this.adapters.set(bundler, adapterClass);
    }
    /**
     * 创建适配器实例
     */
    static create(bundler, options = {}) {
        // 检查是否已有实例
        const instanceKey = `${bundler}-${JSON.stringify(options)}`;
        const existingInstance = this.instances.get(instanceKey);
        if (existingInstance) {
            return existingInstance;
        }
        // 获取适配器类
        const AdapterClass = this.adapters.get(bundler);
        if (!AdapterClass) {
            // 如果没有注册的适配器，使用基础适配器
            const adapter = new BaseAdapter(bundler);
            this.instances.set(instanceKey, adapter);
            return adapter;
        }
        try {
            // 创建新实例
            const adapter = new AdapterClass(options);
            // 检查适配器是否可用
            if (!adapter.available) {
                throw new error_handler_1.BuilderError(errors_1.ErrorCode.ADAPTER_NOT_AVAILABLE, `适配器 ${bundler} 不可用`);
            }
            this.instances.set(instanceKey, adapter);
            return adapter;
        }
        catch (error) {
            throw new error_handler_1.BuilderError(errors_1.ErrorCode.ADAPTER_INIT_ERROR, `创建适配器 ${bundler} 失败`, { cause: error });
        }
    }
    /**
     * 获取可用的适配器列表
     */
    static getAvailableAdapters() {
        const available = [];
        for (const bundler of ['rollup', 'rolldown']) {
            try {
                const adapter = this.create(bundler);
                if (adapter.available) {
                    available.push(bundler);
                }
            }
            catch {
                // 忽略不可用的适配器
            }
        }
        return available;
    }
    /**
     * 检查适配器是否可用
     */
    static isAvailable(bundler) {
        try {
            const adapter = this.create(bundler);
            return adapter.available;
        }
        catch {
            return false;
        }
    }
    /**
     * 清理所有实例
     */
    static async dispose() {
        const disposePromises = Array.from(this.instances.values()).map(adapter => adapter.dispose());
        await Promise.all(disposePromises);
        this.instances.clear();
    }
    /**
     * 获取适配器信息
     */
    static getAdapterInfo(bundler) {
        try {
            const adapter = this.create(bundler);
            return {
                name: adapter.name,
                version: adapter.version,
                available: adapter.available
            };
        }
        catch {
            return {
                name: bundler,
                version: 'unknown',
                available: false
            };
        }
    }
}
exports.BundlerAdapterFactory = BundlerAdapterFactory;
BundlerAdapterFactory.adapters = new Map();
BundlerAdapterFactory.instances = new Map();
// 导入真实的适配器
const RollupAdapter_1 = require("../rollup/RollupAdapter");
const RolldownAdapter_1 = require("../rolldown/RolldownAdapter");
// 注册真实的适配器
BundlerAdapterFactory.register('rollup', RollupAdapter_1.RollupAdapter);
BundlerAdapterFactory.register('rolldown', RolldownAdapter_1.RolldownAdapter);
