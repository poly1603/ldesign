"use strict";
/**
 * React 策略
 * 使用 esbuild 处理 TS/TSX，postcss 处理样式，rollup 输出 ESM/CJS
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
exports.ReactStrategy = void 0;
const library_1 = require("../../types/library");
const minify_processor_1 = require("../../utils/minify-processor");
class ReactStrategy {
    constructor() {
        this.name = 'react';
        this.supportedTypes = [library_1.LibraryType.REACT];
        this.priority = 10;
    }
    async applyStrategy(config) {
        // 解析入口配置
        const resolvedInput = await this.resolveInputEntries(config);
        return {
            input: resolvedInput,
            output: this.buildOutputConfig(config),
            plugins: await this.buildPlugins(config),
            external: this.mergeExternal(config.external),
            treeshake: config.performance?.treeshaking !== false,
            onwarn: this.createWarningHandler()
        };
    }
    isApplicable(config) {
        return config.libraryType === library_1.LibraryType.REACT;
    }
    getDefaultConfig() {
        return {
            libraryType: library_1.LibraryType.REACT,
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
        plugins.push(nodeResolve.default({ browser: true, extensions: ['.mjs', '.js', '.json', '.ts', '.tsx'] }));
        // CommonJS
        const commonjs = await Promise.resolve().then(() => __importStar(require('@rollup/plugin-commonjs')));
        plugins.push(commonjs.default());
        // TypeScript for DTS only
        const ts = await Promise.resolve().then(() => __importStar(require('@rollup/plugin-typescript')));
        plugins.push({
            name: 'typescript',
            plugin: async () => ts.default({
                tsconfig: 'tsconfig.json',
                declaration: true,
                emitDeclarationOnly: true,
                // declarationDir 将由 RollupAdapter 动态设置
                jsx: 'react-jsx'
            })
        });
        // PostCSS (optional)
        if (config.style?.extract !== false) {
            const postcss = await Promise.resolve().then(() => __importStar(require('rollup-plugin-postcss')));
            plugins.push(postcss.default({ extract: true, minimize: config.style?.minimize !== false }));
        }
        // esbuild for TS/TSX/JSX
        const esbuild = await Promise.resolve().then(() => __importStar(require('rollup-plugin-esbuild')));
        plugins.push(esbuild.default({
            include: /\.(tsx?|jsx?)$/, exclude: [/node_modules/], target: 'es2020',
            jsx: 'automatic', jsxImportSource: 'react', tsconfig: 'tsconfig.json',
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
        return (warning) => { if (warning.code === 'THIS_IS_UNDEFINED' || warning.code === 'CIRCULAR_DEPENDENCY')
            return; console.warn(`Warning: ${warning.message}`); };
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
            'src/**/*.{ts,tsx,js,jsx}'
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
     * 合并 external 配置，确保 React 相关依赖被标记为外部
     */
    mergeExternal(external) {
        const reactPkgs = ['react', 'react-dom'];
        if (!external)
            return reactPkgs;
        if (Array.isArray(external)) {
            return [...external, ...reactPkgs];
        }
        if (typeof external === 'function') {
            return (id, ...args) => reactPkgs.includes(id) || external(id, ...args);
        }
        if (external instanceof RegExp) {
            return (id) => reactPkgs.includes(id) || external.test(id);
        }
        if (typeof external === 'string') {
            return [external, ...reactPkgs];
        }
        if (typeof external === 'object') {
            return [...Object.keys(external), ...reactPkgs];
        }
        return reactPkgs;
    }
}
exports.ReactStrategy = ReactStrategy;
