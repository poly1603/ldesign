"use strict";
/**
 * @ldesign/builder - 类型定义统一导出
 *
 * 提供所有公共类型定义的统一导出
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
// 核心类型
__exportStar(require("./builder"), exports);
__exportStar(require("./config"), exports);
__exportStar(require("./adapter"), exports);
__exportStar(require("./strategy"), exports);
__exportStar(require("./plugin"), exports);
__exportStar(require("./library"), exports);
__exportStar(require("./bundler"), exports);
__exportStar(require("./output"), exports);
__exportStar(require("./performance"), exports);
__exportStar(require("./common"), exports);
__exportStar(require("./minify"), exports);
