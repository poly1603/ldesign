"use strict";
/**
 * @ldesign/builder - 主入口文件
 *
 * 基于 rollup/rolldown 的通用库打包工具
 * 支持多种前端库类型的打包和双打包核心的灵活切换
 *
 * @author LDesign Team
 * @version 1.0.0
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.createBuilder = exports.defineAsyncConfig = exports.defineConfig = exports.MixedStrategy = exports.AngularStrategy = exports.LitStrategy = exports.PreactStrategy = exports.SolidStrategy = exports.SvelteStrategy = exports.ReactStrategy = exports.Vue3Strategy = exports.Vue2Strategy = exports.StyleStrategy = exports.TypeScriptStrategy = exports.RolldownAdapter = exports.RollupAdapter = exports.BundlerAdapterFactory = exports.TemporaryEnvironment = exports.ValidationReporter = exports.TestRunner = exports.PostBuildValidator = exports.PerformanceMonitor = exports.LibraryDetector = exports.PluginManager = exports.StrategyManager = exports.ConfigManager = exports.LibraryBuilder = void 0;
// 核心类导出
var LibraryBuilder_1 = require("./core/LibraryBuilder");
Object.defineProperty(exports, "LibraryBuilder", { enumerable: true, get: function () { return LibraryBuilder_1.LibraryBuilder; } });
var ConfigManager_1 = require("./core/ConfigManager");
Object.defineProperty(exports, "ConfigManager", { enumerable: true, get: function () { return ConfigManager_1.ConfigManager; } });
var StrategyManager_1 = require("./core/StrategyManager");
Object.defineProperty(exports, "StrategyManager", { enumerable: true, get: function () { return StrategyManager_1.StrategyManager; } });
var PluginManager_1 = require("./core/PluginManager");
Object.defineProperty(exports, "PluginManager", { enumerable: true, get: function () { return PluginManager_1.PluginManager; } });
var LibraryDetector_1 = require("./core/LibraryDetector");
Object.defineProperty(exports, "LibraryDetector", { enumerable: true, get: function () { return LibraryDetector_1.LibraryDetector; } });
var PerformanceMonitor_1 = require("./core/PerformanceMonitor");
Object.defineProperty(exports, "PerformanceMonitor", { enumerable: true, get: function () { return PerformanceMonitor_1.PerformanceMonitor; } });
var PostBuildValidator_1 = require("./core/PostBuildValidator");
Object.defineProperty(exports, "PostBuildValidator", { enumerable: true, get: function () { return PostBuildValidator_1.PostBuildValidator; } });
var TestRunner_1 = require("./core/TestRunner");
Object.defineProperty(exports, "TestRunner", { enumerable: true, get: function () { return TestRunner_1.TestRunner; } });
var ValidationReporter_1 = require("./core/ValidationReporter");
Object.defineProperty(exports, "ValidationReporter", { enumerable: true, get: function () { return ValidationReporter_1.ValidationReporter; } });
var TemporaryEnvironment_1 = require("./core/TemporaryEnvironment");
Object.defineProperty(exports, "TemporaryEnvironment", { enumerable: true, get: function () { return TemporaryEnvironment_1.TemporaryEnvironment; } });
// 适配器导出
var AdapterFactory_1 = require("./adapters/base/AdapterFactory");
Object.defineProperty(exports, "BundlerAdapterFactory", { enumerable: true, get: function () { return AdapterFactory_1.BundlerAdapterFactory; } });
var RollupAdapter_1 = require("./adapters/rollup/RollupAdapter");
Object.defineProperty(exports, "RollupAdapter", { enumerable: true, get: function () { return RollupAdapter_1.RollupAdapter; } });
var RolldownAdapter_1 = require("./adapters/rolldown/RolldownAdapter");
Object.defineProperty(exports, "RolldownAdapter", { enumerable: true, get: function () { return RolldownAdapter_1.RolldownAdapter; } });
// 策略导出
var TypeScriptStrategy_1 = require("./strategies/typescript/TypeScriptStrategy");
Object.defineProperty(exports, "TypeScriptStrategy", { enumerable: true, get: function () { return TypeScriptStrategy_1.TypeScriptStrategy; } });
var StyleStrategy_1 = require("./strategies/style/StyleStrategy");
Object.defineProperty(exports, "StyleStrategy", { enumerable: true, get: function () { return StyleStrategy_1.StyleStrategy; } });
var Vue2Strategy_1 = require("./strategies/vue2/Vue2Strategy");
Object.defineProperty(exports, "Vue2Strategy", { enumerable: true, get: function () { return Vue2Strategy_1.Vue2Strategy; } });
var Vue3Strategy_1 = require("./strategies/vue3/Vue3Strategy");
Object.defineProperty(exports, "Vue3Strategy", { enumerable: true, get: function () { return Vue3Strategy_1.Vue3Strategy; } });
var ReactStrategy_1 = require("./strategies/react/ReactStrategy");
Object.defineProperty(exports, "ReactStrategy", { enumerable: true, get: function () { return ReactStrategy_1.ReactStrategy; } });
var SvelteStrategy_1 = require("./strategies/svelte/SvelteStrategy");
Object.defineProperty(exports, "SvelteStrategy", { enumerable: true, get: function () { return SvelteStrategy_1.SvelteStrategy; } });
var SolidStrategy_1 = require("./strategies/solid/SolidStrategy");
Object.defineProperty(exports, "SolidStrategy", { enumerable: true, get: function () { return SolidStrategy_1.SolidStrategy; } });
var PreactStrategy_1 = require("./strategies/preact/PreactStrategy");
Object.defineProperty(exports, "PreactStrategy", { enumerable: true, get: function () { return PreactStrategy_1.PreactStrategy; } });
var LitStrategy_1 = require("./strategies/lit/LitStrategy");
Object.defineProperty(exports, "LitStrategy", { enumerable: true, get: function () { return LitStrategy_1.LitStrategy; } });
var AngularStrategy_1 = require("./strategies/angular/AngularStrategy");
Object.defineProperty(exports, "AngularStrategy", { enumerable: true, get: function () { return AngularStrategy_1.AngularStrategy; } });
var MixedStrategy_1 = require("./strategies/mixed/MixedStrategy");
Object.defineProperty(exports, "MixedStrategy", { enumerable: true, get: function () { return MixedStrategy_1.MixedStrategy; } });
// 插件导出
__exportStar(require("./plugins"), exports);
// 类型定义导出
__exportStar(require("./types"), exports);
// 常量导出
__exportStar(require("./constants"), exports);
// 工具函数导出
__exportStar(require("./utils"), exports);
// 便捷函数
var config_1 = require("./utils/config");
Object.defineProperty(exports, "defineConfig", { enumerable: true, get: function () { return config_1.defineConfig; } });
Object.defineProperty(exports, "defineAsyncConfig", { enumerable: true, get: function () { return config_1.defineAsyncConfig; } });
var factory_1 = require("./utils/factory");
Object.defineProperty(exports, "createBuilder", { enumerable: true, get: function () { return factory_1.createBuilder; } });
// 增强配置导出
__exportStar(require("./config/enhanced-config"), exports);
/**
 * 默认导出 - LibraryBuilder 类
 */
var LibraryBuilder_2 = require("./core/LibraryBuilder");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return LibraryBuilder_2.LibraryBuilder; } });
