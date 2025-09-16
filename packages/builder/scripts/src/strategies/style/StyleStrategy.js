"use strict";
/**
 * 样式库构建策略
 *
 * 为样式库提供完整的构建策略，包括：
 * - Less/Sass 预处理器支持
 * - CSS 压缩和优化
 * - 自动添加浏览器前缀
 * - CSS 变量和主题支持
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
exports.StyleStrategy = void 0;
const library_1 = require("../../types/library");
/**
 * 样式库构建策略
 */
class StyleStrategy {
    constructor() {
        this.name = 'style';
        this.supportedTypes = [library_1.LibraryType.STYLE];
        this.priority = 8;
    }
    /**
     * 应用样式策略
     */
    async applyStrategy(config) {
        // 解析入口配置
        const resolvedInput = await this.resolveInputEntries(config);
        const unifiedConfig = {
            input: resolvedInput,
            output: this.buildOutputConfig(config),
            plugins: this.buildPlugins(config),
            external: config.external || [],
            treeshake: false, // CSS 不需要 Tree Shaking
            onwarn: this.createWarningHandler()
        };
        return unifiedConfig;
    }
    /**
     * 检查策略是否适用
     */
    isApplicable(config) {
        return config.libraryType === library_1.LibraryType.STYLE;
    }
    /**
     * 获取默认配置
     */
    getDefaultConfig() {
        return {
            libraryType: library_1.LibraryType.STYLE,
            output: {
                format: ['esm'], // 使用 ESM 格式，PostCSS 插件会提取 CSS
                sourcemap: true
            },
            style: {
                extract: true,
                minimize: true,
                autoprefixer: true,
                modules: false,
                preprocessor: {
                    less: {
                        enabled: true,
                        options: {
                            javascriptEnabled: true
                        }
                    },
                    sass: {
                        enabled: false
                    }
                },
                browserslist: [
                    '> 1%',
                    'last 2 versions',
                    'not dead'
                ]
            },
            performance: {
                treeshaking: false,
                minify: true
            }
        };
    }
    /**
     * 获取推荐插件
     */
    getRecommendedPlugins(config) {
        const plugins = [];
        // PostCSS 插件
        plugins.push({
            name: 'postcss',
            options: this.getPostCSSOptions(config)
        });
        // Less 插件
        if (this.shouldUseLess(config)) {
            plugins.push({
                name: 'less',
                options: this.getLessOptions(config)
            });
        }
        // Sass 插件
        if (this.shouldUseSass(config)) {
            plugins.push({
                name: 'sass',
                options: this.getSassOptions(config)
            });
        }
        return plugins;
    }
    /**
     * 验证配置
     */
    validateConfig(config) {
        const errors = [];
        const warnings = [];
        const suggestions = [];
        // 检查入口文件
        if (!config.input) {
            // 入口可选：当未提供时，策略会自动发现入口，不作为硬错误
            warnings.push('未显式指定入口，已启用自动入口发现');
        }
        else if (typeof config.input === 'string') {
            const inputStr = config.input;
            const supportedExtensions = ['.css', '.less', '.scss', '.sass', '.styl'];
            const hasValidExtension = supportedExtensions.some(ext => inputStr.endsWith(ext));
            if (!hasValidExtension) {
                warnings.push('入口文件不是样式文件，建议使用 .css, .less, .scss 等扩展名');
            }
        }
        // 检查输出配置
        if (config.output?.format && !config.output.format.includes('css')) {
            suggestions.push('样式库建议输出 CSS 格式');
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings,
            suggestions
        };
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
            assetFileNames: '[name][extname]' // 确保 CSS 文件使用正确的名称
        };
    }
    /**
     * 构建插件配置
     */
    buildPlugins(config) {
        const plugins = [];
        // PostCSS 插件（用于处理 CSS）
        plugins.push({
            name: 'postcss',
            plugin: async () => {
                const postcss = await Promise.resolve().then(() => __importStar(require('rollup-plugin-postcss')));
                const postCSSPlugins = await this.getPostCSSPlugins(config);
                return postcss.default({
                    extract: true,
                    minimize: config.performance?.minify !== false,
                    sourceMap: config.output?.sourcemap !== false,
                    plugins: postCSSPlugins
                });
            }
        });
        return plugins;
    }
    /**
     * 获取 PostCSS 插件
     */
    async getPostCSSPlugins(config) {
        const plugins = [];
        // Autoprefixer
        if (config.style?.autoprefixer !== false) {
            try {
                const autoprefixer = await Promise.resolve().then(() => __importStar(require('autoprefixer')));
                plugins.push(autoprefixer.default({
                    overrideBrowserslist: config.style?.browserslist || [
                        '> 1%',
                        'last 2 versions',
                        'not dead'
                    ]
                }));
            }
            catch (error) {
                console.warn('Autoprefixer 未安装，跳过自动前缀功能');
            }
        }
        return plugins;
    }
    /**
     * 获取 PostCSS 选项
     */
    async getPostCSSOptions(config) {
        return {
            extract: config.style?.extract !== false,
            minimize: config.style?.minimize !== false,
            sourceMap: config.output?.sourcemap !== false,
            modules: config.style?.modules || false,
            plugins: await this.getPostCSSPlugins(config)
        };
    }
    /**
     * 获取 Less 选项
     */
    getLessOptions(config) {
        const preprocessor = config.style?.preprocessor;
        const lessConfig = typeof preprocessor === 'object' ? preprocessor.less : undefined;
        return {
            javascriptEnabled: lessConfig?.options?.javascriptEnabled !== false,
            modifyVars: lessConfig?.options?.modifyVars || {},
            ...lessConfig?.options
        };
    }
    /**
     * 获取 Sass 选项
     */
    getSassOptions(config) {
        const preprocessor = config.style?.preprocessor;
        const sassConfig = typeof preprocessor === 'object' ? preprocessor.sass : undefined;
        return {
            includePaths: ['node_modules'],
            ...sassConfig?.options
        };
    }
    /**
     * 检查是否应该使用 Less
     */
    shouldUseLess(config) {
        const preprocessor = config.style?.preprocessor;
        if (typeof preprocessor === 'object' && preprocessor.less?.enabled === false) {
            return false;
        }
        // 如果入口文件是 .less，自动启用
        if (typeof config.input === 'string' && config.input.endsWith('.less')) {
            return true;
        }
        return typeof preprocessor === 'object' && preprocessor.less?.enabled === true;
    }
    /**
     * 检查是否应该使用 Sass
     */
    shouldUseSass(config) {
        const preprocessor = config.style?.preprocessor;
        if (typeof preprocessor === 'object' && preprocessor.sass?.enabled === false) {
            return false;
        }
        // 如果入口文件是 .scss 或 .sass，自动启用
        if (typeof config.input === 'string') {
            if (config.input.endsWith('.scss') || config.input.endsWith('.sass')) {
                return true;
            }
        }
        return typeof preprocessor === 'object' && preprocessor.sass?.enabled === true;
    }
    /**
     * 创建警告处理器
     */
    createWarningHandler() {
        return (warning) => {
            // 忽略一些常见的无害警告
            if (warning.code === 'EMPTY_BUNDLE') {
                return;
            }
            console.warn(`Warning: ${warning.message}`);
        };
    }
    /**
     * 解析入口配置
     * - 若用户未传入 input，则将 src 下所有样式文件作为入口
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
            'src/**/*.{css,less,scss,sass,styl}'
        ], {
            cwd: process.cwd(),
            ignore: ['**/*.test.*', '**/*.spec.*', '**/__tests__/**']
        });
        if (files.length === 0)
            return 'src/index.less';
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
            ignore: ['**/*.test.*', '**/*.spec.*', '**/__tests__/**']
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
}
exports.StyleStrategy = StyleStrategy;
