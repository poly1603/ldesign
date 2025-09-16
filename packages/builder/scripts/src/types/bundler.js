"use strict";
/**
 * 打包器相关类型定义
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BundlerFeature = exports.BundlerStatus = void 0;
/**
 * 打包器状态
 */
var BundlerStatus;
(function (BundlerStatus) {
    /** 未初始化 */
    BundlerStatus["UNINITIALIZED"] = "uninitialized";
    /** 初始化中 */
    BundlerStatus["INITIALIZING"] = "initializing";
    /** 就绪 */
    BundlerStatus["READY"] = "ready";
    /** 构建中 */
    BundlerStatus["BUILDING"] = "building";
    /** 监听中 */
    BundlerStatus["WATCHING"] = "watching";
    /** 错误状态 */
    BundlerStatus["ERROR"] = "error";
    /** 已销毁 */
    BundlerStatus["DISPOSED"] = "disposed";
})(BundlerStatus || (exports.BundlerStatus = BundlerStatus = {}));
// BundlerFeature 已在 adapter.ts 中定义，这里导入
var adapter_1 = require("./adapter");
Object.defineProperty(exports, "BundlerFeature", { enumerable: true, get: function () { return adapter_1.BundlerFeature; } });
