"use strict";
/**
 * 适配器相关类型定义
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BundlerFeature = void 0;
/**
 * 打包器功能枚举
 */
var BundlerFeature;
(function (BundlerFeature) {
    BundlerFeature["TREE_SHAKING"] = "treeshaking";
    BundlerFeature["CODE_SPLITTING"] = "code-splitting";
    BundlerFeature["DYNAMIC_IMPORT"] = "dynamic-import";
    BundlerFeature["WORKER_SUPPORT"] = "worker-support";
    BundlerFeature["CSS_BUNDLING"] = "css-bundling";
    BundlerFeature["ASSET_PROCESSING"] = "asset-processing";
    BundlerFeature["SOURCEMAP"] = "sourcemap";
    BundlerFeature["MINIFICATION"] = "minification";
    BundlerFeature["HOT_RELOAD"] = "hot-reload";
    BundlerFeature["MODULE_FEDERATION"] = "module-federation";
    BundlerFeature["INCREMENTAL_BUILD"] = "incremental-build";
    BundlerFeature["PARALLEL_BUILD"] = "parallel-build";
    BundlerFeature["CACHE_SUPPORT"] = "cache-support";
    BundlerFeature["PLUGIN_SYSTEM"] = "plugin-system";
    BundlerFeature["CONFIG_FILE"] = "config-file";
})(BundlerFeature || (exports.BundlerFeature = BundlerFeature = {}));
