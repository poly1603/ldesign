"use strict";
/**
 * @ldesign/builder - 工具函数统一导出
 *
 * 提供所有工具函数的统一导出
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
exports.BuildCacheManager = exports.CodeSplittingOptimizer = exports.BuildPerformanceAnalyzer = exports.DependencyAnalyzer = exports.formatDuration = exports.formatBytes = exports.throttle = exports.debounce = exports.MemoryMonitor = exports.CodeQualityAnalyzer = void 0;
// 配置相关工具
__exportStar(require("./config"), exports);
// 通用工具函数 (复用 launcher 的实现)
__exportStar(require("./file-system"), exports);
__exportStar(require("./path-utils"), exports);
__exportStar(require("./logger"), exports);
__exportStar(require("./error-handler"), exports);
// 其他工具函数
__exportStar(require("./format-utils"), exports);
__exportStar(require("./banner-generator"), exports);
__exportStar(require("./minify-processor"), exports);
// 高级功能模块 - 使用命名导出避免类型冲突
var code_quality_analyzer_1 = require("./code-quality-analyzer");
Object.defineProperty(exports, "CodeQualityAnalyzer", { enumerable: true, get: function () { return code_quality_analyzer_1.CodeQualityAnalyzer; } });
var performance_utils_1 = require("./performance-utils");
Object.defineProperty(exports, "MemoryMonitor", { enumerable: true, get: function () { return performance_utils_1.MemoryMonitor; } });
Object.defineProperty(exports, "debounce", { enumerable: true, get: function () { return performance_utils_1.debounce; } });
Object.defineProperty(exports, "throttle", { enumerable: true, get: function () { return performance_utils_1.throttle; } });
Object.defineProperty(exports, "formatBytes", { enumerable: true, get: function () { return performance_utils_1.formatBytes; } });
Object.defineProperty(exports, "formatDuration", { enumerable: true, get: function () { return performance_utils_1.formatDuration; } });
var dependency_analyzer_1 = require("./dependency-analyzer");
Object.defineProperty(exports, "DependencyAnalyzer", { enumerable: true, get: function () { return dependency_analyzer_1.DependencyAnalyzer; } });
var build_performance_analyzer_1 = require("./build-performance-analyzer");
Object.defineProperty(exports, "BuildPerformanceAnalyzer", { enumerable: true, get: function () { return build_performance_analyzer_1.BuildPerformanceAnalyzer; } });
var code_splitting_optimizer_1 = require("./code-splitting-optimizer");
Object.defineProperty(exports, "CodeSplittingOptimizer", { enumerable: true, get: function () { return code_splitting_optimizer_1.CodeSplittingOptimizer; } });
var build_cache_manager_1 = require("./build-cache-manager");
Object.defineProperty(exports, "BuildCacheManager", { enumerable: true, get: function () { return build_cache_manager_1.BuildCacheManager; } });
// 基础工具模块
__exportStar(require("./glob"), exports);
__exportStar(require("./factory"), exports);
__exportStar(require("./cache"), exports);
// 注意：detection.ts, performance.ts, validation.ts 暂时为空，不导出
