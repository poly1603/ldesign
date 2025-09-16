"use strict";
/**
 * 构建器相关类型定义
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuilderEvent = exports.BuilderStatus = void 0;
/**
 * 构建器状态枚举
 */
var BuilderStatus;
(function (BuilderStatus) {
    /** 空闲状态 */
    BuilderStatus["IDLE"] = "idle";
    /** 初始化中 */
    BuilderStatus["INITIALIZING"] = "initializing";
    /** 构建中 */
    BuilderStatus["BUILDING"] = "building";
    /** 监听中 */
    BuilderStatus["WATCHING"] = "watching";
    /** 错误状态 */
    BuilderStatus["ERROR"] = "error";
    /** 已销毁 */
    BuilderStatus["DISPOSED"] = "disposed";
})(BuilderStatus || (exports.BuilderStatus = BuilderStatus = {}));
/**
 * 构建器事件枚举
 */
var BuilderEvent;
(function (BuilderEvent) {
    /** 构建开始 */
    BuilderEvent["BUILD_START"] = "build:start";
    /** 构建进度 */
    BuilderEvent["BUILD_PROGRESS"] = "build:progress";
    /** 构建结束 */
    BuilderEvent["BUILD_END"] = "build:end";
    /** 构建错误 */
    BuilderEvent["BUILD_ERROR"] = "build:error";
    /** 监听开始 */
    BuilderEvent["WATCH_START"] = "watch:start";
    /** 监听变化 */
    BuilderEvent["WATCH_CHANGE"] = "watch:change";
    /** 监听结束 */
    BuilderEvent["WATCH_END"] = "watch:end";
    /** 配置变化 */
    BuilderEvent["CONFIG_CHANGE"] = "config:change";
    /** 状态变化 */
    BuilderEvent["STATUS_CHANGE"] = "status:change";
})(BuilderEvent || (exports.BuilderEvent = BuilderEvent = {}));
