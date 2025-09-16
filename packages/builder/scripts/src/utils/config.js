"use strict";
/**
 * 配置工具函数
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineAsyncConfig = exports.defineConfig = void 0;
var config_loader_1 = require("./config/config-loader");
Object.defineProperty(exports, "defineConfig", { enumerable: true, get: function () { return config_loader_1.defineConfig; } });
Object.defineProperty(exports, "defineAsyncConfig", { enumerable: true, get: function () { return config_loader_1.defineAsyncConfig; } });
