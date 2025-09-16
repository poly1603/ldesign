"use strict";
/**
 * 插件相关类型定义
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginPhase = exports.PluginType = void 0;
/**
 * 插件类型枚举
 */
var PluginType;
(function (PluginType) {
    /** 核心插件 */
    PluginType["CORE"] = "core";
    /** 转换插件 */
    PluginType["TRANSFORM"] = "transform";
    /** 优化插件 */
    PluginType["OPTIMIZATION"] = "optimization";
    /** 工具插件 */
    PluginType["UTILITY"] = "utility";
    /** 开发插件 */
    PluginType["DEVELOPMENT"] = "development";
    /** 自定义插件 */
    PluginType["CUSTOM"] = "custom";
})(PluginType || (exports.PluginType = PluginType = {}));
/**
 * 插件阶段枚举
 */
var PluginPhase;
(function (PluginPhase) {
    /** 构建开始前 */
    PluginPhase["PRE_BUILD"] = "pre-build";
    /** 模块解析 */
    PluginPhase["RESOLVE"] = "resolve";
    /** 模块加载 */
    PluginPhase["LOAD"] = "load";
    /** 代码转换 */
    PluginPhase["TRANSFORM"] = "transform";
    /** 代码生成 */
    PluginPhase["GENERATE"] = "generate";
    /** 构建完成后 */
    PluginPhase["POST_BUILD"] = "post-build";
})(PluginPhase || (exports.PluginPhase = PluginPhase = {}));
