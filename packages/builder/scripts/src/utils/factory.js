"use strict";
/**
 * 工厂函数 - 便捷创建构建器实例
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBuilder = createBuilder;
exports.createDevBuilder = createDevBuilder;
exports.createProdBuilder = createProdBuilder;
exports.createTypeScriptBuilder = createTypeScriptBuilder;
exports.createVue3Builder = createVue3Builder;
exports.createStyleBuilder = createStyleBuilder;
exports.createQuickBuilder = createQuickBuilder;
exports.createWatchBuilder = createWatchBuilder;
exports.createBuilderFromPackage = createBuilderFromPackage;
exports.createBuilders = createBuilders;
exports.createBuilderPool = createBuilderPool;
const LibraryBuilder_1 = require("../core/LibraryBuilder");
const library_1 = require("../types/library");
const logger_1 = require("./logger");
/**
 * 创建构建器实例的便捷函数
 *
 * @param config 初始配置
 * @param options 构建器选项
 * @returns 构建器实例
 */
function createBuilder(config, options = {}) {
    // 创建默认的日志记录器
    const logger = options.logger || (0, logger_1.createLogger)({
        level: 'info',
        colors: true,
        prefix: '@ldesign/builder'
    });
    // 创建默认的错误处理器（暂时不使用）
    // const errorHandler = createErrorHandler({
    //   logger,
    //   showSuggestions: true
    // })
    // 合并选项
    const builderOptions = {
        config,
        logger,
        autoDetect: true,
        cache: true,
        performance: true,
        ...options
    };
    return new LibraryBuilder_1.LibraryBuilder(builderOptions);
}
/**
 * 创建开发模式构建器
 *
 * @param config 初始配置
 * @param options 构建器选项
 * @returns 构建器实例
 */
function createDevBuilder(config, options = {}) {
    const devConfig = {
        input: 'src/index.ts',
        mode: 'development',
        minify: false,
        output: {
            sourcemap: 'inline'
        },
        debug: true,
        ...config
    };
    return createBuilder(devConfig, options);
}
/**
 * 创建生产模式构建器
 *
 * @param config 初始配置
 * @param options 构建器选项
 * @returns 构建器实例
 */
function createProdBuilder(config, options = {}) {
    const prodConfig = {
        input: 'src/index.ts',
        mode: 'production',
        minify: true,
        clean: true,
        output: {
            sourcemap: true
        },
        debug: false,
        ...config
    };
    return createBuilder(prodConfig, options);
}
/**
 * 创建 TypeScript 库构建器
 *
 * @param config 初始配置
 * @param options 构建器选项
 * @returns 构建器实例
 */
function createTypeScriptBuilder(config, options = {}) {
    const tsConfig = {
        input: 'src/index.ts',
        libraryType: library_1.LibraryType.TYPESCRIPT,
        typescript: {
            declaration: true,
            isolatedDeclarations: true
        },
        output: {
            format: ['esm', 'cjs']
        },
        ...config
    };
    return createBuilder(tsConfig, options);
}
/**
 * 创建 Vue3 组件库构建器
 *
 * @param config 初始配置
 * @param options 构建器选项
 * @returns 构建器实例
 */
function createVue3Builder(config, options = {}) {
    const vueConfig = {
        input: 'src/index.ts',
        libraryType: library_1.LibraryType.VUE3,
        vue: {
            version: 3,
            onDemand: true
        },
        external: ['vue'],
        globals: {
            vue: 'Vue'
        },
        output: {
            format: ['esm', 'cjs', 'umd']
        },
        ...config
    };
    return createBuilder(vueConfig, options);
}
/**
 * 创建样式库构建器
 *
 * @param config 初始配置
 * @param options 构建器选项
 * @returns 构建器实例
 */
function createStyleBuilder(config, options = {}) {
    const styleConfig = {
        input: 'src/index.css',
        libraryType: library_1.LibraryType.STYLE,
        style: {
            extract: true,
            minimize: true,
            autoprefixer: true
        },
        output: {
            format: ['esm']
        },
        ...config
    };
    return createBuilder(styleConfig, options);
}
/**
 * 创建快速构建器（最小配置）
 *
 * @param input 入口文件
 * @param output 输出目录
 * @param options 构建器选项
 * @returns 构建器实例
 */
function createQuickBuilder(input, output, options = {}) {
    const quickConfig = {
        input,
        output: output ? { dir: output } : undefined
    };
    return createBuilder(quickConfig, options);
}
/**
 * 创建监听模式构建器
 *
 * @param config 初始配置
 * @param options 构建器选项
 * @returns 构建器实例
 */
function createWatchBuilder(config, options = {}) {
    const watchConfig = {
        input: 'src/index.ts',
        watch: {
            include: ['src/**/*'],
            exclude: ['node_modules/**/*', 'dist/**/*']
        },
        ...config
    };
    return createBuilder(watchConfig, options);
}
/**
 * 从 package.json 创建构建器
 *
 * @param packageJsonPath package.json 文件路径
 * @param options 构建器选项
 * @returns 构建器实例
 */
async function createBuilderFromPackage(packageJsonPath = './package.json', options = {}) {
    try {
        const { readFile } = await Promise.resolve().then(() => __importStar(require('./file-system')));
        const packageContent = await readFile(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(packageContent);
        // 从 package.json 推断配置
        const config = {
            input: packageJson.source || packageJson.main || 'src/index.ts',
            output: {
                dir: 'dist'
            }
        };
        // 如果有 builder 字段，使用它
        if (packageJson.builder) {
            Object.assign(config, packageJson.builder);
        }
        return createBuilder(config, options);
    }
    catch (error) {
        throw new Error(`从 package.json 创建构建器失败: ${error.message}`);
    }
}
/**
 * 批量创建构建器
 *
 * @param configs 配置数组
 * @param options 构建器选项
 * @returns 构建器实例数组
 */
function createBuilders(configs, options = {}) {
    return configs.map(config => createBuilder(config, options));
}
/**
 * 创建构建器池
 *
 * @param configs 配置数组
 * @param options 构建器选项
 * @returns 构建器池
 */
function createBuilderPool(configs, options = {}) {
    const builders = createBuilders(configs, options);
    return {
        builders,
        async buildAll() {
            return Promise.all(builders.map(builder => builder.build()));
        },
        async disposeAll() {
            await Promise.all(builders.map(builder => builder.dispose()));
        }
    };
}
