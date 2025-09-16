"use strict";
/**
 * 策略管理器
 *
 * 负责管理不同库类型的构建策略
 *
 * @author LDesign Team
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrategyManager = void 0;
const library_1 = require("../types/library");
const logger_1 = require("../utils/logger");
const error_handler_1 = require("../utils/error-handler");
const errors_1 = require("../constants/errors");
// 导入具体策略实现
const TypeScriptStrategy_1 = require("../strategies/typescript/TypeScriptStrategy");
const StyleStrategy_1 = require("../strategies/style/StyleStrategy");
const Vue3Strategy_1 = require("../strategies/vue3/Vue3Strategy");
const Vue2Strategy_1 = require("../strategies/vue2/Vue2Strategy");
const ReactStrategy_1 = require("../strategies/react/ReactStrategy");
const SvelteStrategy_1 = require("../strategies/svelte/SvelteStrategy");
const SolidStrategy_1 = require("../strategies/solid/SolidStrategy");
const PreactStrategy_1 = require("../strategies/preact/PreactStrategy");
const LitStrategy_1 = require("../strategies/lit/LitStrategy");
const AngularStrategy_1 = require("../strategies/angular/AngularStrategy");
const MixedStrategy_1 = require("../strategies/mixed/MixedStrategy");
/**
 * 策略管理器类
 */
class StrategyManager {
    constructor(_options = {}) {
        this.strategies = new Map();
        this.logger = _options.logger || new logger_1.Logger();
        this.errorHandler = new error_handler_1.ErrorHandler({ logger: this.logger });
        // 注册默认策略
        this.registerDefaultStrategies();
    }
    /**
     * 注册策略
     */
    registerStrategy(strategy) {
        for (const type of strategy.supportedTypes) {
            this.strategies.set(type, strategy);
        }
        this.logger.debug(`注册策略: ${strategy.name}`);
    }
    /**
     * 获取策略
     */
    getStrategy(libraryType) {
        const strategy = this.strategies.get(libraryType);
        if (!strategy) {
            throw new error_handler_1.BuilderError(errors_1.ErrorCode.CONFIG_VALIDATION_ERROR, `未找到库类型 ${libraryType} 的策略`);
        }
        return strategy;
    }
    /**
     * 检测最佳策略
     */
    async detectStrategy(_projectPath) {
        // TODO: 实现策略检测逻辑
        // 这里先返回一个默认结果
        return {
            strategy: library_1.LibraryType.TYPESCRIPT,
            confidence: 0.8,
            evidence: [],
            alternatives: []
        };
    }
    /**
     * 应用策略
     */
    async applyStrategy(libraryType, config) {
        const startTime = Date.now();
        try {
            const strategy = this.getStrategy(libraryType);
            // 验证策略是否适用
            if (!strategy.isApplicable(config)) {
                throw new error_handler_1.BuilderError(errors_1.ErrorCode.CONFIG_VALIDATION_ERROR, `策略 ${strategy.name} 不适用于当前配置`);
            }
            // 应用策略
            const transformedConfig = await strategy.applyStrategy(config);
            const plugins = strategy.getRecommendedPlugins(config);
            const duration = Date.now() - startTime;
            return {
                strategy,
                config: transformedConfig,
                plugins,
                duration,
                warnings: [],
                optimizations: []
            };
        }
        catch (error) {
            this.errorHandler.handle(error, 'applyStrategy');
            throw error;
        }
    }
    /**
     * 获取所有已注册的策略
     */
    getAllStrategies() {
        return Array.from(this.strategies.values());
    }
    /**
     * 获取支持的库类型
     */
    getSupportedTypes() {
        return Array.from(this.strategies.keys());
    }
    /**
     * 注册默认策略
     */
    registerDefaultStrategies() {
        // TypeScript 策略
        this.registerStrategy(new TypeScriptStrategy_1.TypeScriptStrategy());
        // Vue3 策略
        this.registerStrategy(new Vue3Strategy_1.Vue3Strategy());
        // Vue2 策略
        this.registerStrategy(new Vue2Strategy_1.Vue2Strategy());
        // 样式策略
        this.registerStrategy(new StyleStrategy_1.StyleStrategy());
        // React 策略
        this.registerStrategy(new ReactStrategy_1.ReactStrategy());
        // Svelte 策略
        this.registerStrategy(new SvelteStrategy_1.SvelteStrategy());
        // Solid 策略
        this.registerStrategy(new SolidStrategy_1.SolidStrategy());
        // Preact 策略
        this.registerStrategy(new PreactStrategy_1.PreactStrategy());
        // Lit / Web Components 策略
        this.registerStrategy(new LitStrategy_1.LitStrategy());
        // Angular（基础）策略
        this.registerStrategy(new AngularStrategy_1.AngularStrategy());
        // 混合策略
        this.registerStrategy(new MixedStrategy_1.MixedStrategy());
    }
}
exports.StrategyManager = StrategyManager;
