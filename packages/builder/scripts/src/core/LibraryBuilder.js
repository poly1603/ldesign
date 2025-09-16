"use strict";
/**
 * 库构建器主控制器类
 *
 * 这是 @ldesign/builder 的核心类，负责协调各个组件完成库的构建工作
 *
 * @author LDesign Team
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LibraryBuilder = void 0;
const events_1 = require("events");
const builder_1 = require("../types/builder");
const ConfigManager_1 = require("./ConfigManager");
const StrategyManager_1 = require("./StrategyManager");
const PluginManager_1 = require("./PluginManager");
const LibraryDetector_1 = require("./LibraryDetector");
const PerformanceMonitor_1 = require("./PerformanceMonitor");
const PostBuildValidator_1 = require("./PostBuildValidator");
const AdapterFactory_1 = require("../adapters/base/AdapterFactory");
const logger_1 = require("../utils/logger");
const error_handler_1 = require("../utils/error-handler");
const errors_1 = require("../constants/errors");
const defaults_1 = require("../constants/defaults");
const glob_1 = require("../utils/glob");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
/**
 * 库构建器主控制器类
 *
 * 采用依赖注入模式，统一管理各种服务组件
 * 继承 EventEmitter，支持事件驱动的构建流程
 */
class LibraryBuilder extends events_1.EventEmitter {
    constructor(options = {}) {
        super();
        /** 当前状态 */
        this.status = builder_1.BuilderStatus.IDLE;
        /** 当前构建统计 */
        this.currentStats = null;
        /** 当前性能指标 */
        this.currentMetrics = null;
        // 初始化各种服务
        this.initializeServices(options);
        // 设置事件监听器
        this.setupEventListeners();
        // 设置错误处理
        this.setupErrorHandling();
        // 初始化配置
        this.config = { ...defaults_1.DEFAULT_BUILDER_CONFIG, ...options.config };
    }
    /**
     * 执行库构建
     *
     * @param config 可选的配置覆盖
     * @returns 构建结果
     */
    async build(config) {
        const buildId = this.generateBuildId();
        try {
            // 设置构建状态
            this.setStatus(builder_1.BuilderStatus.BUILDING);
            // 合并配置
            const mergedConfig = config ? this.mergeConfig(this.config, config) : this.config;
            // 清理输出目录（如果启用）
            if (mergedConfig.clean) {
                await this.cleanOutputDirs(mergedConfig);
            }
            // 根据配置切换打包核心（确保与 CLI/配置一致）
            if (mergedConfig.bundler && mergedConfig.bundler !== this.bundlerAdapter.name) {
                this.setBundler(mergedConfig.bundler);
            }
            // 发出构建开始事件
            this.emit('build:start', {
                config: mergedConfig,
                timestamp: Date.now(),
                buildId
            });
            // 开始性能监控
            this.performanceMonitor.startBuild(buildId);
            // 获取库类型（优先使用配置中指定的类型；否则基于项目根目录自动检测）
            const projectRoot = mergedConfig.cwd || process.cwd();
            let libraryType = mergedConfig.libraryType || await this.detectLibraryType(projectRoot);
            // 确保 libraryType 是正确的枚举值
            if (typeof libraryType === 'string') {
                libraryType = libraryType;
            }
            // 获取构建策略
            const strategy = this.strategyManager.getStrategy(libraryType);
            // 应用策略配置
            const strategyConfig = await strategy.applyStrategy(mergedConfig);
            // 执行构建
            const result = await this.bundlerAdapter.build(strategyConfig);
            // 执行打包后验证（如果启用）
            let validationResult;
            if (mergedConfig.postBuildValidation?.enabled) {
                validationResult = await this.runPostBuildValidation(mergedConfig, result, buildId);
            }
            // 结束性能监控
            const metrics = this.performanceMonitor.endBuild(buildId);
            // 构建成功
            const buildResult = {
                success: true,
                outputs: result.outputs,
                duration: metrics.buildTime,
                stats: result.stats,
                performance: metrics,
                warnings: result.warnings || [],
                errors: [],
                buildId,
                timestamp: Date.now(),
                bundler: this.bundlerAdapter.name,
                mode: mergedConfig.mode || 'production',
                libraryType,
                validation: validationResult
            };
            // 保存统计信息
            this.currentStats = buildResult.stats;
            this.currentMetrics = buildResult.performance;
            // 发出构建结束事件
            this.emit('build:end', {
                result: buildResult,
                duration: buildResult.duration,
                timestamp: Date.now()
            });
            // 重置状态
            this.setStatus(builder_1.BuilderStatus.IDLE);
            return buildResult;
        }
        catch (error) {
            // 处理构建错误
            const buildError = this.handleBuildError(error, buildId);
            // 发出错误事件
            this.emit('build:error', {
                error: buildError,
                phase: 'build',
                timestamp: Date.now()
            });
            // 重置状态
            this.setStatus(builder_1.BuilderStatus.ERROR);
            throw buildError;
        }
    }
    /**
     * 启动监听构建模式
     *
     * @param config 可选的配置覆盖
     * @returns 构建监听器
     */
    async buildWatch(config) {
        try {
            // 设置监听状态
            this.setStatus(builder_1.BuilderStatus.WATCHING);
            // 合并配置
            const mergedConfig = config ? this.mergeConfig(this.config, config) : this.config;
            // 根据配置切换打包核心（确保与 CLI/配置一致）
            if (mergedConfig.bundler && mergedConfig.bundler !== this.bundlerAdapter.name) {
                this.setBundler(mergedConfig.bundler);
            }
            // 获取库类型（优先使用配置中指定的类型；否则基于项目根目录自动检测）
            const projectRoot = mergedConfig.cwd || process.cwd();
            let libraryType = mergedConfig.libraryType || await this.detectLibraryType(projectRoot);
            // 确保 libraryType 是正确的枚举值
            if (typeof libraryType === 'string') {
                libraryType = libraryType;
            }
            // 获取构建策略
            const strategy = this.strategyManager.getStrategy(libraryType);
            // 应用策略配置
            const strategyConfig = await strategy.applyStrategy(mergedConfig);
            // 启动监听
            const watcher = await this.bundlerAdapter.watch(strategyConfig);
            // 发出监听开始事件
            this.emit('watch:start', {
                patterns: watcher.patterns,
                timestamp: Date.now()
            });
            return watcher;
        }
        catch (error) {
            this.setStatus(builder_1.BuilderStatus.ERROR);
            throw this.errorHandler.createError(errors_1.ErrorCode.BUILD_FAILED, '启动监听模式失败', { cause: error });
        }
    }
    /**
     * 合并配置
     */
    mergeConfig(base, override) {
        return this.configManager.mergeConfigs(base, override);
    }
    /**
     * 验证配置
     */
    validateConfig(config) {
        return this.configManager.validateConfig(config);
    }
    /**
     * 加载配置文件
     */
    async loadConfig(configPath) {
        const config = await this.configManager.loadConfig(configPath ? { configFile: configPath } : {});
        this.config = config;
        return config;
    }
    /**
     * 切换打包核心
     */
    setBundler(bundler) {
        try {
            this.bundlerAdapter = AdapterFactory_1.BundlerAdapterFactory.create(bundler, {
                logger: this.logger,
                performanceMonitor: this.performanceMonitor
            });
            this.logger.info(`已切换到 ${bundler} 打包核心`);
        }
        catch (error) {
            throw this.errorHandler.createError(errors_1.ErrorCode.ADAPTER_NOT_AVAILABLE, `切换到 ${bundler} 失败`, { cause: error });
        }
    }
    /**
     * 获取当前打包核心
     */
    getBundler() {
        return this.bundlerAdapter.name;
    }
    /**
     * 设置库类型
     */
    setLibraryType(type) {
        this.config.libraryType = type;
        this.logger.info(`已设置库类型为: ${type}`);
    }
    /**
     * 检测库类型
     * - 传入路径可能为文件路径或子目录，这里做归一化：
     *   1) 若为文件，取其所在目录
     *   2) 自下而上查找最近的 package.json 作为项目根
     *   3) 若未找到，回退到当前工作目录
     */
    async detectLibraryType(projectPath) {
        let base = projectPath;
        try {
            const stat = await fs_1.promises.stat(projectPath).catch(() => null);
            if (stat && stat.isFile()) {
                base = path_1.default.dirname(projectPath);
            }
            // 自下而上查找最近的 package.json
            let current = base;
            let resolvedRoot = '';
            for (let i = 0; i < 10; i++) {
                const pkg = path_1.default.join(current, 'package.json');
                const exists = await fs_1.promises.access(pkg).then(() => true).catch(() => false);
                if (exists) {
                    resolvedRoot = current;
                    break;
                }
                const parent = path_1.default.dirname(current);
                if (parent === current)
                    break;
                current = parent;
            }
            const root = resolvedRoot || (this.config.cwd || process.cwd());
            const result = await this.libraryDetector.detect(root);
            return result.type;
        }
        catch {
            const fallbackRoot = this.config.cwd || process.cwd();
            const result = await this.libraryDetector.detect(fallbackRoot);
            return result.type;
        }
    }
    /**
     * 获取当前状态
     */
    getStatus() {
        return this.status;
    }
    /**
     * 是否正在构建
     */
    isBuilding() {
        return this.status === 'building';
    }
    /**
     * 是否正在监听
     */
    isWatching() {
        return this.status === 'watching';
    }
    /**
     * 初始化
     */
    async initialize() {
        this.setStatus(builder_1.BuilderStatus.INITIALIZING);
        try {
            // 加载配置
            await this.loadConfig();
            // 初始化适配器
            this.setBundler(this.config.bundler || 'rollup');
            this.setStatus(builder_1.BuilderStatus.IDLE);
            this.logger.success('LibraryBuilder 初始化完成');
        }
        catch (error) {
            this.setStatus(builder_1.BuilderStatus.ERROR);
            throw this.errorHandler.createError(errors_1.ErrorCode.BUILD_FAILED, '初始化失败', { cause: error });
        }
    }
    /**
     * 销毁资源
     */
    async dispose() {
        this.setStatus(builder_1.BuilderStatus.DISPOSED);
        // 清理适配器
        if (this.bundlerAdapter) {
            await this.bundlerAdapter.dispose();
        }
        // 清理插件管理器
        if (this.pluginManager) {
            await this.pluginManager.dispose();
        }
        // 清理验证器
        if (this.postBuildValidator) {
            await this.postBuildValidator.dispose();
        }
        // 移除所有事件监听器
        this.removeAllListeners();
        this.logger.info('LibraryBuilder 已销毁');
    }
    /**
     * 获取构建统计信息
     */
    getStats() {
        return this.currentStats;
    }
    /**
     * 获取性能指标
     */
    getPerformanceMetrics() {
        return this.currentMetrics;
    }
    /**
     * 初始化各种服务
     */
    initializeServices(options) {
        // 初始化日志记录器
        this.logger = options.logger || (0, logger_1.createLogger)({
            level: 'info',
            prefix: '@ldesign/builder'
        });
        // 初始化错误处理器
        this.errorHandler = (0, error_handler_1.createErrorHandler)({
            logger: this.logger,
            showSuggestions: true
        });
        // 初始化性能监控器
        this.performanceMonitor = new PerformanceMonitor_1.PerformanceMonitor({
            logger: this.logger
        });
        // 初始化配置管理器
        this.configManager = new ConfigManager_1.ConfigManager({
            logger: this.logger
        });
        // 初始化策略管理器
        this.strategyManager = new StrategyManager_1.StrategyManager({
            autoDetection: true,
            cache: true
        });
        // 初始化插件管理器
        this.pluginManager = new PluginManager_1.PluginManager({
            cache: true,
            hotReload: false
        });
        // 初始化库类型检测器
        this.libraryDetector = new LibraryDetector_1.LibraryDetector({
            logger: this.logger
        });
        // 初始化打包后验证器
        this.postBuildValidator = new PostBuildValidator_1.PostBuildValidator({}, {
            logger: this.logger,
            errorHandler: this.errorHandler
        });
        // 初始化默认适配器
        this.bundlerAdapter = AdapterFactory_1.BundlerAdapterFactory.create('rollup', {
            logger: this.logger,
            performanceMonitor: this.performanceMonitor
        });
    }
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听配置变化
        this.configManager.on('config:change', (config) => {
            this.config = config;
            this.emit('config:change', {
                config,
                oldConfig: this.config,
                timestamp: Date.now()
            });
        });
    }
    /**
     * 设置错误处理
     */
    setupErrorHandling() {
        // 处理未捕获的错误
        this.on('error', (error) => {
            this.errorHandler.handle(error, 'LibraryBuilder');
        });
    }
    /**
     * 设置状态
     */
    setStatus(status) {
        const oldStatus = this.status;
        this.status = status;
        this.emit('status:change', {
            status,
            oldStatus,
            timestamp: Date.now()
        });
    }
    /**
     * 生成构建 ID
     */
    generateBuildId() {
        return `build-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    /**
     * 清理输出目录
     *
     * @param config - 构建配置
     */
    async cleanOutputDirs(config) {
        const dirs = (0, glob_1.getOutputDirs)(config);
        const rootDir = config.root || config.cwd || process.cwd();
        for (const dir of dirs) {
            const fullPath = path_1.default.isAbsolute(dir) ? dir : path_1.default.resolve(rootDir, dir);
            try {
                // 检查目录是否存在
                const exists = await fs_1.promises.access(fullPath).then(() => true).catch(() => false);
                if (exists) {
                    this.logger.info(`清理输出目录: ${fullPath}`);
                    await fs_1.promises.rm(fullPath, { recursive: true, force: true });
                }
            }
            catch (error) {
                this.logger.warn(`清理目录失败: ${fullPath}`, error);
            }
        }
    }
    /**
     * 处理构建错误
     */
    handleBuildError(error, buildId) {
        this.performanceMonitor.recordError(buildId, error);
        if (error instanceof Error) {
            return this.errorHandler.createError(errors_1.ErrorCode.BUILD_FAILED, `构建失败: ${error.message}`, { cause: error });
        }
        return this.errorHandler.createError(errors_1.ErrorCode.BUILD_FAILED, '构建失败: 未知错误');
    }
    /**
     * 运行打包后验证
     */
    async runPostBuildValidation(config, buildResult, buildId) {
        this.logger.info('开始打包后验证...');
        try {
            // 创建验证上下文
            const validationContext = {
                buildContext: {
                    buildId,
                    startTime: Date.now(),
                    config,
                    cwd: process.cwd(),
                    cacheDir: '.cache',
                    tempDir: '.temp',
                    watch: false,
                    env: process.env,
                    logger: this.logger,
                    performanceMonitor: this.performanceMonitor
                },
                buildResult: {
                    success: true,
                    outputs: buildResult.outputs,
                    duration: 0,
                    stats: buildResult.stats,
                    performance: this.currentMetrics || {},
                    warnings: buildResult.warnings || [],
                    errors: [],
                    buildId,
                    timestamp: Date.now(),
                    bundler: this.bundlerAdapter.name,
                    mode: config.mode || 'production',
                    libraryType: config.libraryType
                },
                config: config.postBuildValidation || {},
                tempDir: '',
                startTime: Date.now(),
                validationId: `validation-${buildId}`,
                projectRoot: process.cwd(),
                outputDir: config.output?.dir || 'dist'
            };
            // 更新验证器配置
            if (config.postBuildValidation) {
                this.postBuildValidator.setConfig(config.postBuildValidation);
            }
            // 执行验证
            const validationResult = await this.postBuildValidator.validate(validationContext);
            // 如果验证失败且配置为失败时停止构建
            if (!validationResult.success && config.postBuildValidation?.failOnError) {
                throw this.errorHandler.createError(errors_1.ErrorCode.BUILD_FAILED, '打包后验证失败', {
                    cause: new Error(`验证失败: ${validationResult.errors.length} 个错误`)
                });
            }
            this.logger.success('打包后验证完成');
            return validationResult;
        }
        catch (error) {
            this.logger.error('打包后验证失败:', error);
            throw error;
        }
    }
}
exports.LibraryBuilder = LibraryBuilder;
