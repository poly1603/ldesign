"use strict";
/**
 * 默认配置常量
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_WATCH_CONFIG = exports.DEFAULT_PERFORMANCE_CONFIG = exports.DEFAULT_CACHE_CONFIG = exports.DEFAULT_FILE_PATTERNS = exports.DEFAULT_GLOBALS = exports.DEFAULT_EXTERNAL_DEPS = exports.CONFIG_FILE_NAMES = exports.PRESET_CONFIGS = exports.DEFAULT_BUILDER_CONFIG = void 0;
const library_1 = require("../types/library");
/**
 * 默认构建器配置
 */
exports.DEFAULT_BUILDER_CONFIG = {
    // 基础配置
    input: 'src/index.ts', // 保留作为兼容，但优先使用 output 中的配置
    libraryType: library_1.LibraryType.TYPESCRIPT, // 默认为 TypeScript 库
    // 顶层开关：dts 与 sourcemap（可被各格式覆盖）
    dts: true,
    sourcemap: true,
    output: {
        dir: 'dist',
        format: ['esm', 'cjs'],
        fileName: '[name].[format].js',
        sourcemap: true,
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]',
        // ESM 格式默认配置
        esm: {
            dir: 'es',
            format: 'esm',
            preserveStructure: true,
            dts: true,
            // 默认入口：所有源文件
            input: ['src/**/*.ts', 'src/**/*.js', 'src/**/*.vue', 'src/**/*.tsx', 'src/**/*.jsx']
        },
        // CommonJS 格式默认配置
        cjs: {
            dir: 'lib',
            format: 'cjs',
            preserveStructure: true,
            dts: true,
            // 默认入口：所有源文件
            input: ['src/**/*.ts', 'src/**/*.js', 'src/**/*.vue', 'src/**/*.tsx', 'src/**/*.jsx']
        },
        // UMD 格式默认配置
        umd: {
            dir: 'dist',
            format: 'umd',
            minify: true,
            sourcemap: true,
            // UMD 默认单入口
            input: 'src/index.ts'
        }
    },
    // 打包器配置
    bundler: 'rollup',
    // 模式配置
    mode: 'production',
    // 库类型（自动检测）：默认不设置，交由 LibraryDetector 自动识别
    // libraryType: undefined,
    // 输出选项
    bundleless: false,
    minify: false, // 默认不压缩
    clean: true,
    // UMD 构建配置
    umd: {
        enabled: true,
        entry: 'src/index.ts',
        name: 'MyLibrary', // 默认名称，会自动从 package.json 推断
        forceMultiEntry: false,
        fileName: 'index.umd.js',
        globals: {},
        minify: false // 默认不压缩
    },
    // Babel 转换配置
    babel: {
        enabled: false, // 默认不启用
        presets: [],
        plugins: [],
        targets: 'defaults',
        polyfill: false,
        runtime: false,
        configFile: false,
        babelrc: true,
        exclude: /node_modules/,
        include: []
    },
    // Banner 和 Footer 配置
    banner: {
        banner: '',
        footer: '',
        intro: '',
        outro: '',
        copyright: false,
        buildInfo: false
    },
    // 外部依赖
    external: [],
    globals: {},
    // 插件配置
    plugins: [],
    // TypeScript 配置
    typescript: {
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: undefined, // 默认与 output.dir 相同
        isolatedDeclarations: false,
        skipLibCheck: true,
        allowSyntheticDefaultImports: true,
        strict: true,
        target: 'ES2020',
        module: 'ESNext',
        moduleResolution: 'node'
    },
    // Vue 配置（仅作为默认项；实际是否启用由库类型检测与策略决定）
    vue: {
        version: 3,
        onDemand: false,
        compilerOptions: {},
        jsx: {
            enabled: false,
            factory: 'h',
            fragment: 'Fragment'
        },
        template: {
            precompile: true
        }
    },
    // 样式配置
    style: {
        preprocessor: 'auto', // 自动检测
        extract: true,
        minimize: true,
        autoprefixer: true,
        modules: false,
        postcssPlugins: []
    },
    // 性能配置
    performance: {
        bundleAnalyzer: false,
        sizeLimit: undefined,
        treeshaking: true,
        cache: true,
        parallel: true,
        monitoring: false
    },
    // 调试配置
    debug: false,
    // 打包后验证配置
    postBuildValidation: {
        enabled: false,
        testFramework: 'auto',
        testPattern: ['**/*.test.{js,ts}', '**/*.spec.{js,ts}'],
        timeout: 60000,
        failOnError: true,
        environment: {
            tempDir: '.validation-temp',
            keepTempFiles: false,
            env: {},
            packageManager: 'auto',
            installDependencies: true,
            installTimeout: 300000
        },
        reporting: {
            format: 'console',
            outputPath: 'validation-report',
            verbose: false,
            logLevel: 'info',
            includePerformance: true,
            includeCoverage: false
        },
        hooks: {},
        scope: {
            formats: ['esm', 'cjs'],
            fileTypes: ['js', 'ts', 'dts'],
            exclude: ['**/*.d.ts', '**/node_modules/**'],
            include: ['**/*'],
            validateTypes: true,
            validateStyles: false,
            validateSourceMaps: false
        }
    },
    // 环境配置
    env: {
        development: {
            mode: 'development',
            minify: false,
            output: {
                sourcemap: 'inline'
            },
            debug: true
        },
        production: {
            mode: 'production',
            minify: true,
            output: {
                sourcemap: true
            },
            debug: false
        }
    },
    // 缓存配置
    cache: {
        enabled: true,
        dir: 'node_modules/.cache/@ldesign/builder',
        maxAge: 86400000, // 24 hours
        maxSize: 500 * 1024 * 1024 // 500MB
    },
    // 监听配置
    watch: {
        include: ['src/**/*'],
        exclude: ['node_modules/**/*', 'dist/**/*'],
        persistent: true,
        ignoreInitial: true
    },
    // 环境变量
    define: {},
    // 工作目录
    cwd: process.cwd(),
    // 配置文件路径
    configFile: '.ldesign/builder.config.ts',
    // 日志级别
    logLevel: 'info',
    // 库构建选项
    library: {
        bundleless: false,
        preserveModules: false,
        generateTypes: true,
        minify: true,
        sourcemap: true,
        external: [],
        globals: {},
        formats: ['esm', 'cjs'],
        splitting: false
    }
};
/**
 * 预设配置
 */
exports.PRESET_CONFIGS = {
    // TypeScript 库预设
    typescript: {
        libraryType: library_1.LibraryType.TYPESCRIPT,
        typescript: {
            declaration: true,
            isolatedDeclarations: true
        },
        output: {
            format: ['esm', 'cjs']
        },
        library: {
            generateTypes: true,
            formats: ['esm', 'cjs']
        }
    },
    // Vue3 组件库预设
    vue3: {
        libraryType: library_1.LibraryType.VUE3,
        vue: {
            version: 3,
            onDemand: true
        },
        external: ['vue'],
        globals: {
            vue: 'Vue'
        },
        library: {
            formats: ['esm', 'cjs', 'umd']
        }
    },
    // Vue2 组件库预设
    vue2: {
        libraryType: library_1.LibraryType.VUE2,
        vue: {
            version: 2,
            onDemand: true
        },
        external: ['vue'],
        globals: {
            vue: 'Vue'
        },
        library: {
            formats: ['esm', 'cjs', 'umd']
        }
    },
    // 样式库预设
    style: {
        libraryType: library_1.LibraryType.STYLE,
        style: {
            extract: true,
            minimize: true
        },
        output: {
            format: ['esm']
        },
        library: {
            formats: ['esm']
        }
    },
    // 混合库预设
    mixed: {
        libraryType: library_1.LibraryType.MIXED,
        typescript: {
            declaration: true
        },
        style: {
            extract: true
        },
        output: {
            format: ['esm', 'cjs']
        },
        library: {
            formats: ['esm', 'cjs']
        }
    }
};
/**
 * 支持的配置文件名称
 */
exports.CONFIG_FILE_NAMES = [
    '.ldesign/builder.config.ts',
    '.ldesign/builder.config.js',
    '.ldesign/builder.config.mjs',
    '.ldesign/builder.config.json',
    'ldesign.config.ts',
    'ldesign.config.js',
    'ldesign.config.mjs',
    'ldesign.config.json',
    'builder.config.ts',
    'builder.config.js',
    'builder.config.mjs',
    'builder.config.json',
    '.builderrc.ts',
    '.builderrc.js',
    '.builderrc.json'
];
/**
 * 默认外部依赖
 */
exports.DEFAULT_EXTERNAL_DEPS = [
    // Node.js 内置模块
    'fs', 'path', 'url', 'util', 'events', 'stream', 'crypto', 'os', 'http', 'https',
    // 常见的前端框架（通常作为外部依赖）
    'react', 'react-dom', 'vue', '@vue/runtime-core', '@vue/runtime-dom',
    'angular', '@angular/core', '@angular/common',
    // 常见的工具库
    'lodash', 'moment', 'dayjs', 'axios'
];
/**
 * 默认全局变量映射
 */
exports.DEFAULT_GLOBALS = {
    'react': 'React',
    'react-dom': 'ReactDOM',
    'vue': 'Vue',
    'lodash': '_',
    'moment': 'moment',
    'dayjs': 'dayjs',
    'axios': 'axios'
};
/**
 * 默认文件名模式
 */
exports.DEFAULT_FILE_PATTERNS = {
    entry: '[name].[format].js',
    chunk: '[name]-[hash].js',
    asset: '[name]-[hash][extname]',
    types: '[name].d.ts'
};
/**
 * 默认缓存配置
 */
exports.DEFAULT_CACHE_CONFIG = {
    enabled: true,
    dir: 'node_modules/.cache/@ldesign/builder',
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    maxSize: 500 * 1024 * 1024, // 500MB
    compress: true,
    version: '1.0.0'
};
/**
 * 默认性能配置
 */
exports.DEFAULT_PERFORMANCE_CONFIG = {
    bundleAnalyzer: false,
    sizeLimit: undefined,
    treeshaking: true,
    cache: true,
    parallel: true,
    memoryLimit: '2GB',
    timeout: 300000, // 5 minutes
    monitoring: false
};
/**
 * 默认监听配置
 */
exports.DEFAULT_WATCH_CONFIG = {
    include: ['src/**/*'],
    exclude: ['node_modules/**/*', 'dist/**/*', '**/*.test.*', '**/*.spec.*'],
    persistent: true,
    ignoreInitial: true,
    followSymlinks: true,
    usePolling: false,
    interval: 100,
    binaryInterval: 300,
    alwaysStat: false,
    depth: 99,
    awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
    }
};
