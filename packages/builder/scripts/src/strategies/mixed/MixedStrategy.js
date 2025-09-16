"use strict";
/**
 * 混合策略
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
exports.MixedStrategy = void 0;
const library_1 = require("../../types/library");
class MixedStrategy {
    constructor() {
        this.name = 'mixed';
        this.supportedTypes = [library_1.LibraryType.MIXED];
        this.priority = 5;
    }
    async applyStrategy(config) {
        // 解析入口配置
        const resolvedInput = await this.resolveInputEntries(config);
        const unifiedConfig = {
            input: resolvedInput,
            output: this.buildOutputConfig(config),
            plugins: await this.buildPlugins(config),
            external: config.external || [],
            treeshake: config.performance?.treeshaking !== false,
            onwarn: this.createWarningHandler()
        };
        return unifiedConfig;
    }
    isApplicable(config) {
        return config.libraryType === library_1.LibraryType.MIXED;
    }
    getDefaultConfig() {
        return {
            libraryType: library_1.LibraryType.MIXED,
            output: {
                format: ['esm', 'cjs'],
                sourcemap: true
            },
            typescript: {
                declaration: true
            },
            style: {
                extract: true
            },
            performance: {
                treeshaking: true,
                minify: true
            }
        };
    }
    getRecommendedPlugins(_config) {
        return [];
    }
    validateConfig(_config) {
        return {
            valid: true,
            errors: [],
            warnings: [],
            suggestions: []
        };
    }
    /**
     * 解析入口配置
     * - 若用户未传入 input，则将 src 下所有源文件作为入口（排除测试与声明文件）
     * - 若用户传入 glob 模式的数组，则解析为多入口
     * - 若用户传入单个文件或对象，则直接返回
     */
    async resolveInputEntries(config) {
        // 如果没有提供input，自动扫描src目录
        if (!config.input) {
            return this.autoDiscoverEntries();
        }
        // 如果是字符串数组且包含glob模式，解析为多入口
        if (Array.isArray(config.input)) {
            return this.resolveGlobEntries(config.input);
        }
        // 其他情况直接返回用户配置
        return config.input;
    }
    /**
     * 自动发现入口文件
     */
    async autoDiscoverEntries() {
        const { findFiles } = await Promise.resolve().then(() => __importStar(require('../../utils/file-system')));
        const { relative, extname } = await Promise.resolve().then(() => __importStar(require('path')));
        const files = await findFiles([
            'src/**/*.{ts,tsx,js,jsx,vue,css,less,scss,sass}'
        ], {
            cwd: process.cwd(),
            ignore: ['**/*.d.ts', '**/*.test.*', '**/*.spec.*', '**/__tests__/**']
        });
        if (files.length === 0)
            return 'src/index.ts';
        const entryMap = {};
        for (const abs of files) {
            const rel = relative(process.cwd(), abs);
            const relFromSrc = rel.replace(/^src[\\/]/, '');
            const noExt = relFromSrc.slice(0, relFromSrc.length - extname(relFromSrc).length);
            const key = noExt.replace(/\\/g, '/');
            entryMap[key] = abs;
        }
        return entryMap;
    }
    /**
     * 解析glob模式的入口配置
     */
    async resolveGlobEntries(patterns) {
        const { findFiles } = await Promise.resolve().then(() => __importStar(require('../../utils/file-system')));
        const { relative, extname } = await Promise.resolve().then(() => __importStar(require('path')));
        const files = await findFiles(patterns, {
            cwd: process.cwd(),
            ignore: ['**/*.d.ts', '**/*.test.*', '**/*.spec.*', '**/__tests__/**']
        });
        if (files.length === 0) {
            throw new Error(`No files found matching patterns: ${patterns.join(', ')}`);
        }
        const entryMap = {};
        for (const abs of files) {
            const rel = relative(process.cwd(), abs);
            const relFromSrc = rel.replace(/^src[\\/]/, '');
            const noExt = relFromSrc.slice(0, relFromSrc.length - extname(relFromSrc).length);
            const key = noExt.replace(/\\/g, '/');
            entryMap[key] = abs;
        }
        return entryMap;
    }
    /**
     * 构建输出配置
     */
    buildOutputConfig(config) {
        const outputConfig = config.output || {};
        const formats = Array.isArray(outputConfig.format)
            ? outputConfig.format
            : [outputConfig.format || 'esm'];
        return {
            dir: outputConfig.dir || 'dist',
            format: formats,
            sourcemap: outputConfig.sourcemap !== false,
            exports: 'named'
        };
    }
    /**
     * 构建插件配置
     */
    async buildPlugins(config) {
        const plugins = [];
        try {
            // Node resolve
            const nodeResolve = await Promise.resolve().then(() => __importStar(require('@rollup/plugin-node-resolve')));
            plugins.push(nodeResolve.default({
                preferBuiltins: false,
                browser: true,
                extensions: ['.mjs', '.js', '.json', '.ts', '.tsx', '.vue', '.css', '.less', '.scss']
            }));
            // CommonJS
            const commonjs = await Promise.resolve().then(() => __importStar(require('@rollup/plugin-commonjs')));
            plugins.push(commonjs.default());
            // TypeScript
            const ts = await Promise.resolve().then(() => __importStar(require('@rollup/plugin-typescript')));
            plugins.push({
                name: 'typescript',
                plugin: async () => ts.default({
                    tsconfig: 'tsconfig.json',
                    declaration: config.typescript?.declaration !== false,
                    // declarationDir 将由 RollupAdapter 动态设置
                    target: config.typescript?.target || 'ES2020',
                    module: config.typescript?.module || 'ESNext',
                    strict: config.typescript?.strict !== false,
                    skipLibCheck: true,
                    sourceMap: config.output?.sourcemap !== false
                })
            });
            // PostCSS for styles
            if (config.style?.extract !== false) {
                const postcss = await Promise.resolve().then(() => __importStar(require('rollup-plugin-postcss')));
                plugins.push(postcss.default({
                    extract: true,
                    minimize: config.style?.minimize !== false,
                    sourceMap: config.output?.sourcemap !== false,
                    modules: config.style?.modules || false
                }));
            }
        }
        catch (error) {
            console.error('插件加载失败:', error);
        }
        return plugins;
    }
    /**
     * 创建警告处理器
     */
    createWarningHandler() {
        return (warning) => {
            // 忽略一些常见的无害警告
            if (warning.code === 'THIS_IS_UNDEFINED') {
                return;
            }
            if (warning.code === 'CIRCULAR_DEPENDENCY') {
                return;
            }
            console.warn(`Warning: ${warning.message}`);
        };
    }
}
exports.MixedStrategy = MixedStrategy;
