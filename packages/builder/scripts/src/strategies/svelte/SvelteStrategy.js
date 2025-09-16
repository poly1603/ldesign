"use strict";
/**
 * Svelte 策略
 * 使用 @sveltejs/rollup-plugin-svelte + esbuild 处理 TS/JS，postcss 处理样式
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
exports.SvelteStrategy = void 0;
const library_1 = require("../../types/library");
const minify_processor_1 = require("../../utils/minify-processor");
class SvelteStrategy {
    constructor() {
        this.name = 'svelte';
        this.supportedTypes = [library_1.LibraryType.SVELTE];
        this.priority = 9;
    }
    async applyStrategy(config) {
        const input = config.input || 'src/index.ts';
        return {
            input,
            output: this.buildOutputConfig(config),
            plugins: await this.buildPlugins(config),
            external: this.mergeExternal(config.external),
            treeshake: config.performance?.treeshaking !== false,
            onwarn: this.createWarningHandler()
        };
    }
    isApplicable(config) {
        return config.libraryType === library_1.LibraryType.SVELTE;
    }
    getDefaultConfig() {
        return {
            libraryType: library_1.LibraryType.SVELTE,
            output: { format: ['esm', 'cjs'], sourcemap: true },
            performance: { treeshaking: true, minify: true }
        };
    }
    getRecommendedPlugins(_config) { return []; }
    validateConfig(_config) { return { valid: true, errors: [], warnings: [], suggestions: [] }; }
    async buildPlugins(config) {
        const plugins = [];
        // Node resolve
        const nodeResolve = await Promise.resolve().then(() => __importStar(require('@rollup/plugin-node-resolve')));
        plugins.push(nodeResolve.default({ browser: true, extensions: ['.mjs', '.js', '.json', '.ts', '.svelte'] }));
        // CommonJS
        const commonjs = await Promise.resolve().then(() => __importStar(require('@rollup/plugin-commonjs')));
        plugins.push(commonjs.default());
        // Svelte 4 官方插件（已作为构建器依赖提供）
        const sveltePlugin = await Promise.resolve().then(() => __importStar(require('rollup-plugin-svelte')));
        plugins.push(sveltePlugin.default({
            emitCss: true,
            compilerOptions: {
                dev: (config.mode || 'production') === 'development'
            }
        }));
        // 注：为避免 .svelte 类型声明解析问题，此处不启用 @rollup/plugin-typescript
        // PostCSS (optional)
        if (config.style?.extract !== false) {
            const postcss = await Promise.resolve().then(() => __importStar(require('rollup-plugin-postcss')));
            plugins.push(postcss.default({ extract: true, minimize: config.style?.minimize !== false }));
        }
        // esbuild for TS/JS
        const esbuild = await Promise.resolve().then(() => __importStar(require('rollup-plugin-esbuild')));
        plugins.push(esbuild.default({
            include: /\.(ts|js)$/, exclude: [/node_modules/], target: 'es2020',
            sourceMap: config.output?.sourcemap !== false, minify: (0, minify_processor_1.shouldMinify)(config)
        }));
        return plugins;
    }
    buildOutputConfig(config) {
        const out = config.output || {};
        const formats = Array.isArray(out.format) ? out.format : ['esm', 'cjs'];
        return { dir: out.dir || 'dist', format: formats, sourcemap: out.sourcemap !== false, exports: 'auto' };
    }
    createWarningHandler() {
        return (warning) => { void warning; /* 可按需过滤 Svelte 特定警告 */ };
    }
    /**
     * 合并 external 配置，确保 Svelte 相关依赖被标记为外部
     */
    mergeExternal(external) {
        const pkgs = ['svelte'];
        if (!external)
            return pkgs;
        if (Array.isArray(external)) {
            return [...external, ...pkgs];
        }
        if (typeof external === 'function') {
            return (id, ...args) => pkgs.includes(id) || external(id, ...args);
        }
        if (external instanceof RegExp) {
            return (id) => pkgs.includes(id) || external.test(id);
        }
        if (typeof external === 'string') {
            return [external, ...pkgs];
        }
        if (typeof external === 'object') {
            return [...Object.keys(external), ...pkgs];
        }
        return pkgs;
    }
}
exports.SvelteStrategy = SvelteStrategy;
