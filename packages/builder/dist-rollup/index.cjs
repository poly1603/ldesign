'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var require$$0$2 = require('events');
var path$3 = require('path');
var createJiti = require('jiti');
var require$$0$1 = require('fs');
var fastGlob = require('fast-glob');
var chalk = require('chalk');
var crypto = require('crypto');
var fs$4 = require('fs-extra');
var child_process = require('child_process');
var os = require('os');
var url = require('url');
var require$$2 = require('util');
var require$$1 = require('stream');

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

function _mergeNamespaces(n, m) {
    m.forEach(function (e) {
        e && typeof e !== 'string' && !Array.isArray(e) && Object.keys(e).forEach(function (k) {
            if (k !== 'default' && !(k in n)) {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    });
    return Object.freeze(n);
}

var path__namespace = /*#__PURE__*/_interopNamespaceDefault(path$3);
var fs__namespace = /*#__PURE__*/_interopNamespaceDefault(fs$4);
var os__namespace = /*#__PURE__*/_interopNamespaceDefault(os);

/**
 * 构建器相关类型定义
 */
/**
 * 构建器状态枚举
 */
exports.BuilderStatus = void 0;
(function (BuilderStatus) {
    /** 空闲状态 */
    BuilderStatus["IDLE"] = "idle";
    /** 初始化中 */
    BuilderStatus["INITIALIZING"] = "initializing";
    /** 构建中 */
    BuilderStatus["BUILDING"] = "building";
    /** 监听中 */
    BuilderStatus["WATCHING"] = "watching";
    /** 错误状态 */
    BuilderStatus["ERROR"] = "error";
    /** 已销毁 */
    BuilderStatus["DISPOSED"] = "disposed";
})(exports.BuilderStatus || (exports.BuilderStatus = {}));
/**
 * 构建器事件枚举
 */
exports.BuilderEvent = void 0;
(function (BuilderEvent) {
    /** 构建开始 */
    BuilderEvent["BUILD_START"] = "build:start";
    /** 构建进度 */
    BuilderEvent["BUILD_PROGRESS"] = "build:progress";
    /** 构建结束 */
    BuilderEvent["BUILD_END"] = "build:end";
    /** 构建错误 */
    BuilderEvent["BUILD_ERROR"] = "build:error";
    /** 监听开始 */
    BuilderEvent["WATCH_START"] = "watch:start";
    /** 监听变化 */
    BuilderEvent["WATCH_CHANGE"] = "watch:change";
    /** 监听结束 */
    BuilderEvent["WATCH_END"] = "watch:end";
    /** 配置变化 */
    BuilderEvent["CONFIG_CHANGE"] = "config:change";
    /** 状态变化 */
    BuilderEvent["STATUS_CHANGE"] = "status:change";
})(exports.BuilderEvent || (exports.BuilderEvent = {}));

/**
 * 库类型相关定义
 */
/**
 * 库类型枚举
 */
exports.LibraryType = void 0;
(function (LibraryType) {
    /** TypeScript 库 */
    LibraryType["TYPESCRIPT"] = "typescript";
    /** 样式库 */
    LibraryType["STYLE"] = "style";
    /** Vue2 组件库 */
    LibraryType["VUE2"] = "vue2";
    /** Vue3 组件库 */
    LibraryType["VUE3"] = "vue3";
    /** React 组件库 */
    LibraryType["REACT"] = "react";
    /** 混合库 */
    LibraryType["MIXED"] = "mixed";
})(exports.LibraryType || (exports.LibraryType = {}));

/**
 * 默认配置常量
 */
/**
 * 默认构建器配置
 */
const DEFAULT_BUILDER_CONFIG = {
    // 基础配置
    input: 'src/index.ts',
    output: {
        dir: 'dist',
        format: ['esm', 'cjs'],
        fileName: '[name].[format].js',
        sourcemap: true,
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]'
    },
    // 打包器配置
    bundler: 'rollup',
    // 模式配置
    mode: 'production',
    // 库类型（自动检测）
    libraryType: exports.LibraryType.TYPESCRIPT,
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
    // Vue 配置
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
    configFile: 'ldesign.config.ts',
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
const PRESET_CONFIGS = {
    // TypeScript 库预设
    typescript: {
        libraryType: exports.LibraryType.TYPESCRIPT,
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
        libraryType: exports.LibraryType.VUE3,
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
        libraryType: exports.LibraryType.VUE2,
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
        libraryType: exports.LibraryType.STYLE,
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
        libraryType: exports.LibraryType.MIXED,
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
const CONFIG_FILE_NAMES = [
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
const DEFAULT_EXTERNAL_DEPS = [
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
const DEFAULT_GLOBALS = {
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
const DEFAULT_FILE_PATTERNS = {
    entry: '[name].[format].js',
    chunk: '[name]-[hash].js',
    asset: '[name]-[hash][extname]',
    types: '[name].d.ts'
};
/**
 * 默认缓存配置
 */
const DEFAULT_CACHE_CONFIG = {
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
const DEFAULT_PERFORMANCE_CONFIG = {
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
const DEFAULT_WATCH_CONFIG = {
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

/**
 * 文件系统操作工具
 *
 * TODO: 后期可以移到 @ldesign/kit 中统一管理
 */
/**
 * 文件系统工具类
 */
class FileSystem {
    /**
     * 检查文件或目录是否存在
     */
    static async exists(filePath) {
        try {
            await require$$0$1.promises.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * 同步检查文件或目录是否存在
     */
    static existsSync(filePath) {
        try {
            require('fs').accessSync(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * 读取文件内容
     */
    static async readFile(filePath, encoding = 'utf8') {
        return require$$0$1.promises.readFile(filePath, encoding);
    }
    /**
     * 写入文件内容
     */
    static async writeFile(filePath, content, encoding = 'utf8') {
        // 确保目录存在
        await this.ensureDir(path$3.dirname(filePath));
        return require$$0$1.promises.writeFile(filePath, content, encoding);
    }
    /**
     * 复制文件
     */
    static async copyFile(src, dest) {
        // 确保目标目录存在
        await this.ensureDir(path$3.dirname(dest));
        return require$$0$1.promises.copyFile(src, dest);
    }
    /**
     * 删除文件
     */
    static async removeFile(filePath) {
        if (await this.exists(filePath)) {
            return require$$0$1.promises.unlink(filePath);
        }
    }
    /**
     * 创建目录
     */
    static async ensureDir(dirPath) {
        try {
            await require$$0$1.promises.mkdir(dirPath, { recursive: true });
        }
        catch (error) {
            // 忽略目录已存在的错误
            if (error.code !== 'EEXIST') {
                throw error;
            }
        }
    }
    /**
     * 删除目录
     */
    static async removeDir(dirPath) {
        if (await this.exists(dirPath)) {
            return require$$0$1.promises.rmdir(dirPath, { recursive: true });
        }
    }
    /**
     * 清空目录
     */
    static async emptyDir(dirPath) {
        if (await this.exists(dirPath)) {
            const files = await require$$0$1.promises.readdir(dirPath);
            await Promise.all(files.map(async (file) => {
                const filePath = path$3.join(dirPath, file);
                const stat = await require$$0$1.promises.stat(filePath);
                if (stat.isDirectory()) {
                    await this.removeDir(filePath);
                }
                else {
                    await this.removeFile(filePath);
                }
            }));
        }
    }
    /**
     * 获取文件统计信息
     */
    static async stat(filePath) {
        const stats = await require$$0$1.promises.stat(filePath);
        const ext = path$3.extname(filePath);
        return {
            path: filePath,
            size: stats.size,
            type: stats.isDirectory() ? 'directory' : this.getFileType(ext)
        };
    }
    /**
     * 读取目录内容
     */
    static async readDir(dirPath) {
        return require$$0$1.promises.readdir(dirPath);
    }
    /**
     * 递归读取目录内容
     */
    static async readDirRecursive(dirPath) {
        const files = [];
        const traverse = async (currentPath) => {
            const items = await require$$0$1.promises.readdir(currentPath);
            for (const item of items) {
                const itemPath = path$3.join(currentPath, item);
                const stat = await require$$0$1.promises.stat(itemPath);
                if (stat.isDirectory()) {
                    await traverse(itemPath);
                }
                else {
                    files.push(itemPath);
                }
            }
        };
        await traverse(dirPath);
        return files;
    }
    /**
     * 使用 glob 模式查找文件
     */
    static async glob(pattern, options = {}) {
        return fastGlob(pattern, {
            cwd: options.cwd || process.cwd(),
            ignore: options.ignore || [],
            absolute: options.absolute ?? true,
            onlyFiles: options.onlyFiles ?? true,
            onlyDirectories: options.onlyDirectories ?? false
        });
    }
    /**
     * 查找文件
     */
    static async findFiles(patterns, options = {}) {
        return this.glob(patterns, {
            cwd: options.cwd,
            ignore: options.ignore,
            onlyFiles: true
        });
    }
    /**
     * 查找目录
     */
    static async findDirs(patterns, options = {}) {
        return this.glob(patterns, {
            cwd: options.cwd,
            ignore: options.ignore,
            onlyDirectories: true
        });
    }
    /**
     * 获取文件大小
     */
    static async getFileSize(filePath) {
        const stats = await require$$0$1.promises.stat(filePath);
        return stats.size;
    }
    /**
     * 获取目录大小
     */
    static async getDirSize(dirPath) {
        let totalSize = 0;
        const traverse = async (currentPath) => {
            const items = await require$$0$1.promises.readdir(currentPath);
            for (const item of items) {
                const itemPath = path$3.join(currentPath, item);
                const stat = await require$$0$1.promises.stat(itemPath);
                if (stat.isDirectory()) {
                    await traverse(itemPath);
                }
                else {
                    totalSize += stat.size;
                }
            }
        };
        await traverse(dirPath);
        return totalSize;
    }
    /**
     * 检查路径是否为文件
     */
    static async isFile(filePath) {
        try {
            const stats = await require$$0$1.promises.stat(filePath);
            return stats.isFile();
        }
        catch {
            return false;
        }
    }
    /**
     * 检查路径是否为目录
     */
    static async isDirectory(dirPath) {
        try {
            const stats = await require$$0$1.promises.stat(dirPath);
            return stats.isDirectory();
        }
        catch {
            return false;
        }
    }
    /**
     * 获取文件的修改时间
     */
    static async getModifiedTime(filePath) {
        const stats = await require$$0$1.promises.stat(filePath);
        return stats.mtime;
    }
    /**
     * 比较文件修改时间
     */
    static async isNewer(file1, file2) {
        if (!(await this.exists(file1)))
            return false;
        if (!(await this.exists(file2)))
            return true;
        const time1 = await this.getModifiedTime(file1);
        const time2 = await this.getModifiedTime(file2);
        return time1 > time2;
    }
    /**
     * 创建临时文件
     */
    static async createTempFile(prefix = 'temp', suffix = '.tmp') {
        const tempDir = require('os').tmpdir();
        const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}${suffix}`;
        return path$3.join(tempDir, fileName);
    }
    /**
     * 创建临时目录
     */
    static async createTempDir(prefix = 'temp') {
        const tempDir = require('os').tmpdir();
        const dirName = `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const tempDirPath = path$3.join(tempDir, dirName);
        await this.ensureDir(tempDirPath);
        return tempDirPath;
    }
    /**
     * 获取文件类型
     */
    static getFileType(extension) {
        const typeMap = {
            '.js': 'javascript',
            '.ts': 'typescript',
            '.jsx': 'jsx',
            '.tsx': 'tsx',
            '.vue': 'vue',
            '.css': 'css',
            '.less': 'less',
            '.scss': 'scss',
            '.sass': 'sass',
            '.json': 'json',
            '.md': 'markdown',
            '.html': 'html',
            '.xml': 'xml',
            '.svg': 'svg',
            '.png': 'image',
            '.jpg': 'image',
            '.jpeg': 'image',
            '.gif': 'image',
            '.webp': 'image'
        };
        return typeMap[extension.toLowerCase()] || 'unknown';
    }
}
// 导出便捷函数
const { exists, existsSync, readFile, writeFile, copyFile, removeFile, ensureDir, removeDir, emptyDir, stat: stat$4, readDir, readDirRecursive, findDirs, getFileSize, getDirSize, isFile, isDirectory, getModifiedTime, isNewer, createTempFile, createTempDir } = FileSystem;
// 单独导出 findFiles 以保持正确的 this 上下文
const findFiles = FileSystem.findFiles.bind(FileSystem);

var fileSystem = /*#__PURE__*/Object.freeze({
    __proto__: null,
    FileSystem: FileSystem,
    copyFile: copyFile,
    createTempDir: createTempDir,
    createTempFile: createTempFile,
    emptyDir: emptyDir,
    ensureDir: ensureDir,
    exists: exists,
    existsSync: existsSync,
    findDirs: findDirs,
    findFiles: findFiles,
    getDirSize: getDirSize,
    getFileSize: getFileSize,
    getModifiedTime: getModifiedTime,
    isDirectory: isDirectory,
    isFile: isFile,
    isNewer: isNewer,
    readDir: readDir,
    readDirRecursive: readDirRecursive,
    readFile: readFile,
    removeDir: removeDir,
    removeFile: removeFile,
    stat: stat$4,
    writeFile: writeFile
});

/**
 * 错误码和错误信息常量
 */
/**
 * 错误码枚举
 */
exports.ErrorCode = void 0;
(function (ErrorCode) {
    // 配置相关错误 (1000-1999)
    ErrorCode["CONFIG_NOT_FOUND"] = "E1001";
    ErrorCode["CONFIG_PARSE_ERROR"] = "E1002";
    ErrorCode["CONFIG_VALIDATION_ERROR"] = "E1003";
    ErrorCode["CONFIG_MERGE_ERROR"] = "E1004";
    ErrorCode["CONFIG_TRANSFORM_ERROR"] = "E1005";
    // 构建相关错误 (2000-2999)
    ErrorCode["BUILD_FAILED"] = "E2001";
    ErrorCode["BUILD_TIMEOUT"] = "E2002";
    ErrorCode["BUILD_CANCELLED"] = "E2003";
    ErrorCode["BUILD_OUT_OF_MEMORY"] = "E2004";
    ErrorCode["BUILD_DEPENDENCY_ERROR"] = "E2005";
    // 适配器相关错误 (3000-3999)
    ErrorCode["ADAPTER_NOT_FOUND"] = "E3001";
    ErrorCode["ADAPTER_INIT_ERROR"] = "E3002";
    ErrorCode["ADAPTER_NOT_AVAILABLE"] = "E3003";
    ErrorCode["ADAPTER_VERSION_MISMATCH"] = "E3004";
    ErrorCode["ADAPTER_CONFIG_ERROR"] = "E3005";
    // 插件相关错误 (4000-4999)
    ErrorCode["PLUGIN_NOT_FOUND"] = "E4001";
    ErrorCode["PLUGIN_LOAD_ERROR"] = "E4002";
    ErrorCode["PLUGIN_INIT_ERROR"] = "E4003";
    ErrorCode["PLUGIN_EXECUTION_ERROR"] = "E4004";
    ErrorCode["PLUGIN_DEPENDENCY_ERROR"] = "E4005";
    // 文件系统相关错误 (5000-5999)
    ErrorCode["FILE_NOT_FOUND"] = "E5001";
    ErrorCode["FILE_READ_ERROR"] = "E5002";
    ErrorCode["FILE_WRITE_ERROR"] = "E5003";
    ErrorCode["DIRECTORY_NOT_FOUND"] = "E5004";
    ErrorCode["PERMISSION_DENIED"] = "E5005";
    // 依赖相关错误 (6000-6999)
    ErrorCode["DEPENDENCY_NOT_FOUND"] = "E6001";
    ErrorCode["DEPENDENCY_VERSION_CONFLICT"] = "E6002";
    ErrorCode["DEPENDENCY_INSTALL_ERROR"] = "E6003";
    ErrorCode["DEPENDENCY_RESOLUTION_ERROR"] = "E6004";
    // 网络相关错误 (7000-7999)
    ErrorCode["NETWORK_ERROR"] = "E7001";
    ErrorCode["DOWNLOAD_ERROR"] = "E7002";
    ErrorCode["UPLOAD_ERROR"] = "E7003";
    ErrorCode["TIMEOUT_ERROR"] = "E7004";
    // 系统相关错误 (8000-8999)
    ErrorCode["SYSTEM_ERROR"] = "E8001";
    ErrorCode["PLATFORM_NOT_SUPPORTED"] = "E8002";
    ErrorCode["NODE_VERSION_MISMATCH"] = "E8003";
    ErrorCode["INSUFFICIENT_RESOURCES"] = "E8004";
    // 用户输入错误 (9000-9999)
    ErrorCode["INVALID_INPUT"] = "E9001";
    ErrorCode["INVALID_OPTION"] = "E9002";
    ErrorCode["INVALID_PATH"] = "E9003";
    ErrorCode["INVALID_FORMAT"] = "E9004";
    ErrorCode["MISSING_REQUIRED_OPTION"] = "E9005";
})(exports.ErrorCode || (exports.ErrorCode = {}));
/**
 * 错误信息映射
 */
const ERROR_MESSAGES = {
    // 配置相关错误
    [exports.ErrorCode.CONFIG_NOT_FOUND]: '配置文件未找到',
    [exports.ErrorCode.CONFIG_PARSE_ERROR]: '配置文件解析失败',
    [exports.ErrorCode.CONFIG_VALIDATION_ERROR]: '配置验证失败',
    [exports.ErrorCode.CONFIG_MERGE_ERROR]: '配置合并失败',
    [exports.ErrorCode.CONFIG_TRANSFORM_ERROR]: '配置转换失败',
    // 构建相关错误
    [exports.ErrorCode.BUILD_FAILED]: '构建失败',
    [exports.ErrorCode.BUILD_TIMEOUT]: '构建超时',
    [exports.ErrorCode.BUILD_CANCELLED]: '构建被取消',
    [exports.ErrorCode.BUILD_OUT_OF_MEMORY]: '构建内存不足',
    [exports.ErrorCode.BUILD_DEPENDENCY_ERROR]: '构建依赖错误',
    // 适配器相关错误
    [exports.ErrorCode.ADAPTER_NOT_FOUND]: '适配器未找到',
    [exports.ErrorCode.ADAPTER_INIT_ERROR]: '适配器初始化失败',
    [exports.ErrorCode.ADAPTER_NOT_AVAILABLE]: '适配器不可用',
    [exports.ErrorCode.ADAPTER_VERSION_MISMATCH]: '适配器版本不匹配',
    [exports.ErrorCode.ADAPTER_CONFIG_ERROR]: '适配器配置错误',
    // 插件相关错误
    [exports.ErrorCode.PLUGIN_NOT_FOUND]: '插件未找到',
    [exports.ErrorCode.PLUGIN_LOAD_ERROR]: '插件加载失败',
    [exports.ErrorCode.PLUGIN_INIT_ERROR]: '插件初始化失败',
    [exports.ErrorCode.PLUGIN_EXECUTION_ERROR]: '插件执行失败',
    [exports.ErrorCode.PLUGIN_DEPENDENCY_ERROR]: '插件依赖错误',
    // 文件系统相关错误
    [exports.ErrorCode.FILE_NOT_FOUND]: '文件未找到',
    [exports.ErrorCode.FILE_READ_ERROR]: '文件读取失败',
    [exports.ErrorCode.FILE_WRITE_ERROR]: '文件写入失败',
    [exports.ErrorCode.DIRECTORY_NOT_FOUND]: '目录未找到',
    [exports.ErrorCode.PERMISSION_DENIED]: '权限不足',
    // 依赖相关错误
    [exports.ErrorCode.DEPENDENCY_NOT_FOUND]: '依赖未找到',
    [exports.ErrorCode.DEPENDENCY_VERSION_CONFLICT]: '依赖版本冲突',
    [exports.ErrorCode.DEPENDENCY_INSTALL_ERROR]: '依赖安装失败',
    [exports.ErrorCode.DEPENDENCY_RESOLUTION_ERROR]: '依赖解析失败',
    // 网络相关错误
    [exports.ErrorCode.NETWORK_ERROR]: '网络错误',
    [exports.ErrorCode.DOWNLOAD_ERROR]: '下载失败',
    [exports.ErrorCode.UPLOAD_ERROR]: '上传失败',
    [exports.ErrorCode.TIMEOUT_ERROR]: '网络超时',
    // 系统相关错误
    [exports.ErrorCode.SYSTEM_ERROR]: '系统错误',
    [exports.ErrorCode.PLATFORM_NOT_SUPPORTED]: '平台不支持',
    [exports.ErrorCode.NODE_VERSION_MISMATCH]: 'Node.js 版本不匹配',
    [exports.ErrorCode.INSUFFICIENT_RESOURCES]: '系统资源不足',
    // 用户输入错误
    [exports.ErrorCode.INVALID_INPUT]: '无效输入',
    [exports.ErrorCode.INVALID_OPTION]: '无效选项',
    [exports.ErrorCode.INVALID_PATH]: '无效路径',
    [exports.ErrorCode.INVALID_FORMAT]: '无效格式',
    [exports.ErrorCode.MISSING_REQUIRED_OPTION]: '缺少必需选项'
};
/**
 * 错误建议映射
 */
const ERROR_SUGGESTIONS = {
    // 配置相关错误
    [exports.ErrorCode.CONFIG_NOT_FOUND]: '请在项目根目录创建 builder.config.ts 配置文件',
    [exports.ErrorCode.CONFIG_PARSE_ERROR]: '请检查配置文件语法是否正确',
    [exports.ErrorCode.CONFIG_VALIDATION_ERROR]: '请检查配置项是否符合要求',
    [exports.ErrorCode.CONFIG_MERGE_ERROR]: '请检查配置合并逻辑',
    [exports.ErrorCode.CONFIG_TRANSFORM_ERROR]: '请检查配置转换规则',
    // 构建相关错误
    [exports.ErrorCode.BUILD_FAILED]: '请检查构建日志获取详细错误信息',
    [exports.ErrorCode.BUILD_TIMEOUT]: '请增加构建超时时间或优化构建配置',
    [exports.ErrorCode.BUILD_CANCELLED]: '构建被用户或系统取消',
    [exports.ErrorCode.BUILD_OUT_OF_MEMORY]: '请增加系统内存或优化构建配置',
    [exports.ErrorCode.BUILD_DEPENDENCY_ERROR]: '请检查项目依赖是否正确安装',
    // 适配器相关错误
    [exports.ErrorCode.ADAPTER_NOT_FOUND]: '请安装对应的打包器依赖',
    [exports.ErrorCode.ADAPTER_INIT_ERROR]: '请检查打包器是否正确安装',
    [exports.ErrorCode.ADAPTER_NOT_AVAILABLE]: '请确保打包器依赖已正确安装',
    [exports.ErrorCode.ADAPTER_VERSION_MISMATCH]: '请升级或降级打包器版本',
    [exports.ErrorCode.ADAPTER_CONFIG_ERROR]: '请检查适配器配置是否正确',
    // 插件相关错误
    [exports.ErrorCode.PLUGIN_NOT_FOUND]: '请安装对应的插件依赖',
    [exports.ErrorCode.PLUGIN_LOAD_ERROR]: '请检查插件是否正确安装',
    [exports.ErrorCode.PLUGIN_INIT_ERROR]: '请检查插件配置是否正确',
    [exports.ErrorCode.PLUGIN_EXECUTION_ERROR]: '请检查插件执行环境',
    [exports.ErrorCode.PLUGIN_DEPENDENCY_ERROR]: '请检查插件依赖是否满足',
    // 文件系统相关错误
    [exports.ErrorCode.FILE_NOT_FOUND]: '请检查文件路径是否正确',
    [exports.ErrorCode.FILE_READ_ERROR]: '请检查文件权限和文件完整性',
    [exports.ErrorCode.FILE_WRITE_ERROR]: '请检查目录权限和磁盘空间',
    [exports.ErrorCode.DIRECTORY_NOT_FOUND]: '请检查目录路径是否正确',
    [exports.ErrorCode.PERMISSION_DENIED]: '请检查文件或目录权限',
    // 依赖相关错误
    [exports.ErrorCode.DEPENDENCY_NOT_FOUND]: '请运行 npm install 安装依赖',
    [exports.ErrorCode.DEPENDENCY_VERSION_CONFLICT]: '请解决依赖版本冲突',
    [exports.ErrorCode.DEPENDENCY_INSTALL_ERROR]: '请检查网络连接和包管理器配置',
    [exports.ErrorCode.DEPENDENCY_RESOLUTION_ERROR]: '请检查依赖解析配置',
    // 网络相关错误
    [exports.ErrorCode.NETWORK_ERROR]: '请检查网络连接',
    [exports.ErrorCode.DOWNLOAD_ERROR]: '请检查网络连接和下载地址',
    [exports.ErrorCode.UPLOAD_ERROR]: '请检查网络连接和上传权限',
    [exports.ErrorCode.TIMEOUT_ERROR]: '请检查网络连接或增加超时时间',
    // 系统相关错误
    [exports.ErrorCode.SYSTEM_ERROR]: '请检查系统环境和权限',
    [exports.ErrorCode.PLATFORM_NOT_SUPPORTED]: '请使用支持的操作系统',
    [exports.ErrorCode.NODE_VERSION_MISMATCH]: '请升级 Node.js 到支持的版本',
    [exports.ErrorCode.INSUFFICIENT_RESOURCES]: '请释放系统资源或增加硬件配置',
    // 用户输入错误
    [exports.ErrorCode.INVALID_INPUT]: '请检查输入参数格式',
    [exports.ErrorCode.INVALID_OPTION]: '请使用有效的选项参数',
    [exports.ErrorCode.INVALID_PATH]: '请使用有效的文件或目录路径',
    [exports.ErrorCode.INVALID_FORMAT]: '请使用正确的格式',
    [exports.ErrorCode.MISSING_REQUIRED_OPTION]: '请提供必需的选项参数'
};
/**
 * 错误分类
 */
const ERROR_CATEGORIES = {
    CONFIGURATION: [
        exports.ErrorCode.CONFIG_NOT_FOUND,
        exports.ErrorCode.CONFIG_PARSE_ERROR,
        exports.ErrorCode.CONFIG_VALIDATION_ERROR,
        exports.ErrorCode.CONFIG_MERGE_ERROR,
        exports.ErrorCode.CONFIG_TRANSFORM_ERROR
    ],
    BUILD: [
        exports.ErrorCode.BUILD_FAILED,
        exports.ErrorCode.BUILD_TIMEOUT,
        exports.ErrorCode.BUILD_CANCELLED,
        exports.ErrorCode.BUILD_OUT_OF_MEMORY,
        exports.ErrorCode.BUILD_DEPENDENCY_ERROR
    ],
    ADAPTER: [
        exports.ErrorCode.ADAPTER_NOT_FOUND,
        exports.ErrorCode.ADAPTER_INIT_ERROR,
        exports.ErrorCode.ADAPTER_NOT_AVAILABLE,
        exports.ErrorCode.ADAPTER_VERSION_MISMATCH,
        exports.ErrorCode.ADAPTER_CONFIG_ERROR
    ],
    PLUGIN: [
        exports.ErrorCode.PLUGIN_NOT_FOUND,
        exports.ErrorCode.PLUGIN_LOAD_ERROR,
        exports.ErrorCode.PLUGIN_INIT_ERROR,
        exports.ErrorCode.PLUGIN_EXECUTION_ERROR,
        exports.ErrorCode.PLUGIN_DEPENDENCY_ERROR
    ],
    FILESYSTEM: [
        exports.ErrorCode.FILE_NOT_FOUND,
        exports.ErrorCode.FILE_READ_ERROR,
        exports.ErrorCode.FILE_WRITE_ERROR,
        exports.ErrorCode.DIRECTORY_NOT_FOUND,
        exports.ErrorCode.PERMISSION_DENIED
    ],
    DEPENDENCY: [
        exports.ErrorCode.DEPENDENCY_NOT_FOUND,
        exports.ErrorCode.DEPENDENCY_VERSION_CONFLICT,
        exports.ErrorCode.DEPENDENCY_INSTALL_ERROR,
        exports.ErrorCode.DEPENDENCY_RESOLUTION_ERROR
    ],
    NETWORK: [
        exports.ErrorCode.NETWORK_ERROR,
        exports.ErrorCode.DOWNLOAD_ERROR,
        exports.ErrorCode.UPLOAD_ERROR,
        exports.ErrorCode.TIMEOUT_ERROR
    ],
    SYSTEM: [
        exports.ErrorCode.SYSTEM_ERROR,
        exports.ErrorCode.PLATFORM_NOT_SUPPORTED,
        exports.ErrorCode.NODE_VERSION_MISMATCH,
        exports.ErrorCode.INSUFFICIENT_RESOURCES
    ],
    USER_INPUT: [
        exports.ErrorCode.INVALID_INPUT,
        exports.ErrorCode.INVALID_OPTION,
        exports.ErrorCode.INVALID_PATH,
        exports.ErrorCode.INVALID_FORMAT,
        exports.ErrorCode.MISSING_REQUIRED_OPTION
    ]
};
/**
 * 错误严重程度
 */
const ERROR_SEVERITY = {
    [exports.ErrorCode.CONFIG_NOT_FOUND]: 'high',
    [exports.ErrorCode.CONFIG_PARSE_ERROR]: 'high',
    [exports.ErrorCode.CONFIG_VALIDATION_ERROR]: 'medium',
    [exports.ErrorCode.BUILD_FAILED]: 'high',
    [exports.ErrorCode.BUILD_TIMEOUT]: 'medium',
    [exports.ErrorCode.ADAPTER_NOT_FOUND]: 'high',
    [exports.ErrorCode.PLUGIN_NOT_FOUND]: 'medium',
    [exports.ErrorCode.FILE_NOT_FOUND]: 'medium',
    [exports.ErrorCode.DEPENDENCY_NOT_FOUND]: 'high',
    [exports.ErrorCode.NETWORK_ERROR]: 'low',
    [exports.ErrorCode.SYSTEM_ERROR]: 'high',
    [exports.ErrorCode.INVALID_INPUT]: 'low'
};

/**
 * 错误处理工具
 *
 * TODO: 后期可以移到 @ldesign/kit 中统一管理
 */
/**
 * 构建器错误类
 */
class BuilderError extends Error {
    constructor(code, message, options = {}) {
        const errorMessage = message || ERROR_MESSAGES[code] || '未知错误';
        super(errorMessage);
        this.name = 'BuilderError';
        this.code = code;
        this.suggestion = options.suggestion || ERROR_SUGGESTIONS[code];
        this.details = options.details;
        this.phase = options.phase;
        this.file = options.file;
        if (options.cause) {
            this.cause = options.cause;
        }
        // 保持堆栈跟踪
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, BuilderError);
        }
    }
    /**
     * 获取完整的错误信息
     */
    getFullMessage() {
        let message = `[${this.code}] ${this.message}`;
        if (this.phase) {
            message += ` (阶段: ${this.phase})`;
        }
        if (this.file) {
            message += ` (文件: ${this.file})`;
        }
        if (this.suggestion) {
            message += `\n建议: ${this.suggestion}`;
        }
        return message;
    }
    /**
     * 转换为 JSON 格式
     */
    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            suggestion: this.suggestion,
            details: this.details,
            phase: this.phase,
            file: this.file,
            stack: this.stack
        };
    }
}
/**
 * 错误处理器类
 */
class ErrorHandler {
    constructor(options = {}) {
        this.logger = options.logger;
        this.showStack = options.showStack ?? false;
        this.showSuggestions = options.showSuggestions ?? true;
        this.onError = options.onError;
        this.exitOnError = options.exitOnError ?? false;
        this.exitCode = options.exitCode ?? 1;
    }
    /**
     * 处理错误
     */
    handle(error, context) {
        // 调用错误回调
        if (this.onError) {
            try {
                this.onError(error);
            }
            catch (callbackError) {
                this.logger?.error('错误回调执行失败:', callbackError);
            }
        }
        // 记录错误日志
        this.logError(error, context);
        // 是否退出进程
        if (this.exitOnError) {
            process.exit(this.exitCode);
        }
    }
    /**
     * 处理异步错误
     */
    async handleAsync(error, context) {
        return new Promise((resolve) => {
            this.handle(error, context);
            resolve();
        });
    }
    /**
     * 包装函数以处理错误
     */
    wrap(fn, context) {
        return ((...args) => {
            try {
                const result = fn(...args);
                // 处理 Promise
                if (result && typeof result.catch === 'function') {
                    return result.catch((error) => {
                        this.handle(error, context);
                        throw error;
                    });
                }
                return result;
            }
            catch (error) {
                this.handle(error, context);
                throw error;
            }
        });
    }
    /**
     * 包装异步函数以处理错误
     */
    wrapAsync(fn, context) {
        return (async (...args) => {
            try {
                return await fn(...args);
            }
            catch (error) {
                await this.handleAsync(error, context);
                throw error;
            }
        });
    }
    /**
     * 创建构建器错误
     */
    createError(code, message, options) {
        return new BuilderError(code, message, options);
    }
    /**
     * 抛出构建器错误
     */
    throwError(code, message, options) {
        throw this.createError(code, message, options);
    }
    /**
     * 记录错误日志
     */
    logError(error, context) {
        if (!this.logger) {
            console.error(error);
            return;
        }
        // 构建错误消息
        let message = error.message;
        if (context) {
            message = `${context}: ${message}`;
        }
        // 记录基本错误信息
        this.logger.error(message);
        // 如果是构建器错误，显示额外信息
        if (error instanceof BuilderError) {
            if (error.phase) {
                this.logger.error(`阶段: ${error.phase}`);
            }
            if (error.file) {
                this.logger.error(`文件: ${error.file}`);
            }
            if (error.details) {
                this.logger.debug('错误详情:', error.details);
            }
            if (this.showSuggestions && error.suggestion) {
                this.logger.info(`建议: ${error.suggestion}`);
            }
        }
        // 显示堆栈跟踪
        if (this.showStack && error.stack) {
            this.logger.debug('堆栈跟踪:');
            this.logger.debug(error.stack);
        }
        // 显示原因链
        if (error.cause) {
            this.logger.debug('原因:');
            this.logError(error.cause);
        }
    }
}
/**
 * 默认错误处理器实例
 */
const errorHandler = new ErrorHandler();
/**
 * 创建错误处理器
 */
function createErrorHandler(options = {}) {
    return new ErrorHandler(options);
}
/**
 * 处理未捕获的异常
 */
function setupGlobalErrorHandling(handler = errorHandler) {
    // 处理未捕获的异常
    process.on('uncaughtException', (error) => {
        handler.handle(error, '未捕获的异常');
        process.exit(1);
    });
    // 处理未处理的 Promise 拒绝
    process.on('unhandledRejection', (reason, _promise) => {
        const error = reason instanceof Error ? reason : new Error(String(reason));
        handler.handle(error, '未处理的 Promise 拒绝');
    });
    // 处理警告
    process.on('warning', (warning) => {
        if (handler['logger']) {
            handler['logger'].warn(`Node.js 警告: ${warning.message}`);
        }
    });
}
/**
 * 判断是否为构建器错误
 */
function isBuilderError(error) {
    return error instanceof BuilderError;
}
/**
 * 从错误中提取错误码
 */
function getErrorCode(error) {
    if (isBuilderError(error)) {
        return error.code;
    }
    return undefined;
}
/**
 * 格式化错误信息
 */
function formatError(error, includeStack = false) {
    if (isBuilderError(error)) {
        return error.getFullMessage();
    }
    let message = error.message;
    if (includeStack && error.stack) {
        message += `\n${error.stack}`;
    }
    return message;
}

/**
 * 配置文件加载器
 */
/**
 * 配置文件加载器类
 */
class ConfigLoader {
    /**
     * 查找配置文件
     */
    async findConfigFile(startDir = process.cwd()) {
        for (const fileName of CONFIG_FILE_NAMES) {
            const configPath = path$3.resolve(startDir, fileName);
            if (await exists(configPath)) {
                return configPath;
            }
        }
        return null;
    }
    /**
     * 获取配置文件信息
     */
    async getConfigFileInfo(configPath) {
        const fileExists = await exists(configPath);
        const ext = path$3.extname(configPath);
        let type;
        switch (ext) {
            case '.ts':
                type = 'ts';
                break;
            case '.js':
            case '.mjs':
                type = 'js';
                break;
            case '.json':
                type = 'json';
                break;
            default:
                type = 'js';
        }
        const info = {
            path: configPath,
            type,
            exists: fileExists
        };
        if (fileExists) {
            try {
                const stats = await import('fs').then(fs => fs.promises.stat(configPath));
                info.mtime = stats.mtime;
                info.size = stats.size;
            }
            catch {
                // 忽略获取文件信息失败的错误
            }
        }
        return info;
    }
    /**
     * 加载配置文件
     */
    async loadConfigFile(configPath) {
        const info = await this.getConfigFileInfo(configPath);
        if (!info.exists) {
            throw new BuilderError(exports.ErrorCode.CONFIG_NOT_FOUND, `配置文件不存在: ${configPath}`);
        }
        try {
            switch (info.type) {
                case 'ts':
                case 'js':
                    return this.loadJSConfig(configPath);
                case 'json':
                    return this.loadJSONConfig(configPath);
                default:
                    throw new BuilderError(exports.ErrorCode.CONFIG_PARSE_ERROR, `不支持的配置文件格式: ${info.type}`);
            }
        }
        catch (error) {
            if (error instanceof BuilderError) {
                throw error;
            }
            throw new BuilderError(exports.ErrorCode.CONFIG_PARSE_ERROR, `加载配置文件失败: ${configPath}`, { cause: error });
        }
    }
    /**
     * 加载 JavaScript/TypeScript 配置
     */
    async loadJSConfig(configPath) {
        try {
            // 使用 jiti 动态导入，支持 TypeScript
            const jiti = createJiti((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('index.cjs', document.baseURI).href)), {
                interopDefault: true,
                esmResolve: true,
                cache: false // 禁用缓存以支持配置热重载
            });
            const configModule = await jiti(configPath);
            // 处理不同的导出格式
            let config;
            if (typeof configModule === 'function') {
                // 函数式配置
                config = await configModule({
                    mode: process.env.NODE_ENV || 'production',
                    bundler: process.env.BUILDER_BUNDLER || 'rollup'
                });
            }
            else if (configModule && typeof configModule === 'object') {
                // 对象配置
                config = configModule;
            }
            else {
                throw new Error('配置文件必须导出对象或函数');
            }
            return config;
        }
        catch (error) {
            throw new BuilderError(exports.ErrorCode.CONFIG_PARSE_ERROR, `解析 JavaScript/TypeScript 配置文件失败: ${configPath}`, {
                cause: error,
                suggestion: '请检查配置文件语法是否正确'
            });
        }
    }
    /**
     * 加载 JSON 配置
     */
    async loadJSONConfig(configPath) {
        try {
            const content = await readFile(configPath, 'utf-8');
            // 特殊处理 package.json
            if (path$3.basename(configPath) === 'package.json') {
                const pkg = JSON.parse(content);
                return pkg.builder || {};
            }
            return JSON.parse(content);
        }
        catch (error) {
            throw new BuilderError(exports.ErrorCode.CONFIG_PARSE_ERROR, `解析 JSON 配置文件失败: ${configPath}`, {
                cause: error,
                suggestion: '请检查 JSON 格式是否正确'
            });
        }
    }
    /**
     * 加载多个配置文件并合并
     */
    async loadMultipleConfigs(configPaths) {
        const configs = [];
        for (const configPath of configPaths) {
            try {
                const config = await this.loadConfigFile(configPath);
                configs.push(config);
            }
            catch (error) {
                // 如果是文件不存在，跳过；其他错误抛出
                if (error instanceof BuilderError && error.code === exports.ErrorCode.CONFIG_NOT_FOUND) {
                    continue;
                }
                throw error;
            }
        }
        if (configs.length === 0) {
            return { input: 'src/index.ts' };
        }
        // 合并配置（后面的配置覆盖前面的）
        return configs.reduce((merged, config) => ({
            ...merged,
            ...config
        }), { input: 'src/index.ts' });
    }
    /**
     * 监听配置文件变化
     */
    async watchConfigFile(configPath, callback) {
        const chokidar = await Promise.resolve().then(function () { return index; });
        const watcher = chokidar.watch(configPath, {
            ignoreInitial: true,
            persistent: true
        });
        const handleChange = async () => {
            try {
                const config = await this.loadConfigFile(configPath);
                callback(config);
            }
            catch (error) {
                console.error('重新加载配置文件失败:', error);
            }
        };
        watcher.on('change', handleChange);
        watcher.on('add', handleChange);
        // 返回清理函数
        return () => {
            watcher.close();
        };
    }
    /**
     * 获取所有可能的配置文件路径
     */
    getAllConfigPaths(baseDir = process.cwd()) {
        return CONFIG_FILE_NAMES.map(name => path$3.resolve(baseDir, name));
    }
    /**
     * 检查配置文件是否存在
     */
    async hasConfigFile(baseDir = process.cwd()) {
        const configPath = await this.findConfigFile(baseDir);
        return configPath !== null;
    }
    /**
     * 获取配置文件的优先级
     */
    getConfigFilePriority(configPath) {
        const fileName = path$3.basename(configPath);
        const index = CONFIG_FILE_NAMES.indexOf(fileName);
        return index >= 0 ? index : CONFIG_FILE_NAMES.length;
    }
    /**
     * 选择最高优先级的配置文件
     */
    async selectBestConfigFile(baseDir = process.cwd()) {
        const allPaths = this.getAllConfigPaths(baseDir);
        const existingPaths = [];
        for (const configPath of allPaths) {
            if (await exists(configPath)) {
                existingPaths.push({
                    path: configPath,
                    priority: this.getConfigFilePriority(configPath)
                });
            }
        }
        if (existingPaths.length === 0) {
            return null;
        }
        // 按优先级排序，返回优先级最高的
        existingPaths.sort((a, b) => a.priority - b.priority);
        return existingPaths[0].path;
    }
}
/**
 * 默认配置加载器实例
 */
const configLoader = new ConfigLoader();
/**
 * 便捷函数：定义配置
 */
function defineConfig(config) {
    return config;
}

/**
 * 日志系统工具
 *
 * TODO: 后期可以移到 @ldesign/kit 中统一管理
 */
/**
 * 日志级别枚举
 */
exports.LogLevelEnum = void 0;
(function (LogLevelEnum) {
    LogLevelEnum[LogLevelEnum["SILENT"] = 0] = "SILENT";
    LogLevelEnum[LogLevelEnum["ERROR"] = 1] = "ERROR";
    LogLevelEnum[LogLevelEnum["WARN"] = 2] = "WARN";
    LogLevelEnum[LogLevelEnum["INFO"] = 3] = "INFO";
    LogLevelEnum[LogLevelEnum["DEBUG"] = 4] = "DEBUG";
    LogLevelEnum[LogLevelEnum["VERBOSE"] = 5] = "VERBOSE";
})(exports.LogLevelEnum || (exports.LogLevelEnum = {}));
/**
 * 日志级别映射
 */
const LOG_LEVEL_MAP = {
    silent: exports.LogLevelEnum.SILENT,
    error: exports.LogLevelEnum.ERROR,
    warn: exports.LogLevelEnum.WARN,
    info: exports.LogLevelEnum.INFO,
    debug: exports.LogLevelEnum.DEBUG,
    verbose: exports.LogLevelEnum.VERBOSE
};
/**
 * 日志记录器类
 */
class Logger {
    constructor(options = {}) {
        this.level = LOG_LEVEL_MAP[options.level || 'info'];
        this.colors = options.colors ?? true;
        this.timestamp = options.timestamp ?? false;
        this.prefix = options.prefix || '@ldesign/builder';
        this.silent = options.silent ?? false;
    }
    /**
     * 设置日志级别
     */
    setLevel(level) {
        this.level = LOG_LEVEL_MAP[level];
    }
    /**
     * 获取当前日志级别
     */
    getLevel() {
        const entries = Object.entries(LOG_LEVEL_MAP);
        const entry = entries.find(([, value]) => value === this.level);
        return entry?.[0] || 'info';
    }
    /**
     * 设置静默模式
     */
    setSilent(silent) {
        this.silent = silent;
    }
    /**
     * 错误日志
     */
    error(message, ...args) {
        if (this.shouldLog(exports.LogLevelEnum.ERROR)) {
            this.log('ERROR', message, chalk.red, ...args);
        }
    }
    /**
     * 警告日志
     */
    warn(message, ...args) {
        if (this.shouldLog(exports.LogLevelEnum.WARN)) {
            this.log('WARN', message, chalk.yellow, ...args);
        }
    }
    /**
     * 信息日志
     */
    info(message, ...args) {
        if (this.shouldLog(exports.LogLevelEnum.INFO)) {
            this.log('INFO', message, chalk.blue, ...args);
        }
    }
    /**
     * 调试日志
     */
    debug(message, ...args) {
        if (this.shouldLog(exports.LogLevelEnum.DEBUG)) {
            this.log('DEBUG', message, chalk.gray, ...args);
        }
    }
    /**
     * 详细日志
     */
    verbose(message, ...args) {
        if (this.shouldLog(exports.LogLevelEnum.VERBOSE)) {
            this.log('VERBOSE', message, chalk.gray, ...args);
        }
    }
    /**
     * 成功日志
     */
    success(message, ...args) {
        if (this.shouldLog(exports.LogLevelEnum.INFO)) {
            this.log('SUCCESS', message, chalk.green, ...args);
        }
    }
    /**
     * 开始日志（带缩进）
     */
    start(message, ...args) {
        if (this.shouldLog(exports.LogLevelEnum.INFO)) {
            this.log('START', `▶ ${message}`, chalk.cyan, ...args);
        }
    }
    /**
     * 完成日志（带缩进）
     */
    complete(message, ...args) {
        if (this.shouldLog(exports.LogLevelEnum.INFO)) {
            this.log('COMPLETE', `✓ ${message}`, chalk.green, ...args);
        }
    }
    /**
     * 失败日志（带缩进）
     */
    fail(message, ...args) {
        if (this.shouldLog(exports.LogLevelEnum.ERROR)) {
            this.log('FAIL', `✗ ${message}`, chalk.red, ...args);
        }
    }
    /**
     * 进度日志
     */
    progress(current, total, message) {
        if (this.shouldLog(exports.LogLevelEnum.INFO)) {
            const percent = Math.round((current / total) * 100);
            const progressBar = this.createProgressBar(percent);
            const progressMessage = message ? ` ${message}` : '';
            this.log('PROGRESS', `${progressBar} ${percent}%${progressMessage}`, chalk.cyan);
        }
    }
    /**
     * 表格日志
     */
    table(data) {
        if (this.shouldLog(exports.LogLevelEnum.INFO) && data.length > 0) {
            console.table(data);
        }
    }
    /**
     * 分组开始
     */
    group(label) {
        if (this.shouldLog(exports.LogLevelEnum.INFO)) {
            console.group(this.formatMessage('GROUP', label, chalk.cyan));
        }
    }
    /**
     * 分组结束
     */
    groupEnd() {
        if (this.shouldLog(exports.LogLevelEnum.INFO)) {
            console.groupEnd();
        }
    }
    /**
     * 清屏
     */
    clear() {
        if (!this.silent) {
            console.clear();
        }
    }
    /**
     * 换行
     */
    newLine() {
        if (this.shouldLog(exports.LogLevelEnum.INFO)) {
            console.log();
        }
    }
    /**
     * 分隔线
     */
    divider(char = '-', length = 50) {
        if (this.shouldLog(exports.LogLevelEnum.INFO)) {
            console.log(chalk.gray(char.repeat(length)));
        }
    }
    /**
     * 创建子日志记录器
     */
    child(prefix, options = {}) {
        return new Logger({
            level: this.getLevel(),
            colors: this.colors,
            timestamp: this.timestamp,
            prefix: `${this.prefix}:${prefix}`,
            silent: this.silent,
            ...options
        });
    }
    /**
     * 判断是否应该记录日志
     */
    shouldLog(level) {
        return !this.silent && this.level >= level;
    }
    /**
     * 记录日志
     */
    log(type, message, colorFn, ...args) {
        const formattedMessage = this.formatMessage(type, message, colorFn);
        console.log(formattedMessage, ...args);
    }
    /**
     * 格式化消息
     */
    formatMessage(type, message, colorFn) {
        let formatted = '';
        // 添加时间戳
        if (this.timestamp) {
            const timestamp = new Date().toISOString();
            formatted += chalk.gray(`[${timestamp}] `);
        }
        // 添加前缀
        if (this.prefix) {
            formatted += chalk.gray(`[${this.prefix}] `);
        }
        // 添加类型
        if (this.colors) {
            formatted += colorFn(`[${type}] `);
        }
        else {
            formatted += `[${type}] `;
        }
        // 添加消息
        if (this.colors) {
            formatted += colorFn(message);
        }
        else {
            formatted += message;
        }
        return formatted;
    }
    /**
     * 创建进度条
     */
    createProgressBar(percent, width = 20) {
        const filled = Math.round((percent / 100) * width);
        const empty = width - filled;
        const bar = '█'.repeat(filled) + '░'.repeat(empty);
        return this.colors ? chalk.cyan(bar) : bar;
    }
}
/**
 * 默认日志记录器实例
 */
const logger = new Logger();
/**
 * 创建日志记录器
 */
function createLogger(options = {}) {
    return new Logger(options);
}
/**
 * 设置全局日志级别
 */
function setLogLevel(level) {
    logger.setLevel(level);
}
/**
 * 设置全局静默模式
 */
function setSilent(silent) {
    logger.setSilent(silent);
}

/**
 * 配置管理器
 *
 * 负责配置文件的加载、验证、合并和监听
 *
 * @author LDesign Team
 * @version 1.0.0
 */
/**
 * 配置管理器类
 *
 * 提供配置文件的完整生命周期管理
 */
class ConfigManager extends require$$0$2.EventEmitter {
    constructor(options = {}) {
        super();
        this.options = {
            validateOnLoad: true,
            freezeConfig: false,
            ...options
        };
        this.logger = options.logger || new Logger();
        this.errorHandler = new ErrorHandler({ logger: this.logger });
    }
    /**
     * 加载配置文件
     */
    async loadConfig(options = {}) {
        try {
            const configPath = options.configFile || await this.findConfigFile();
            let config = {};
            if (configPath) {
                this.logger.info(`加载配置文件: ${configPath}`);
                config = await configLoader.loadConfigFile(configPath);
            }
            else {
                this.logger.info('未找到配置文件，使用默认配置');
                config = {};
            }
            // 合并默认配置
            const mergedConfig = this.mergeConfigs(DEFAULT_BUILDER_CONFIG, config);
            // 应用环境特定配置
            if (options.applyEnvConfig && mergedConfig.env) {
                const envConfig = this.getEnvConfig(mergedConfig);
                if (envConfig) {
                    Object.assign(mergedConfig, envConfig);
                }
            }
            // 验证配置
            if (options.validate !== false && this.options.validateOnLoad) {
                const validation = this.validateConfig(mergedConfig);
                if (!validation.valid) {
                    throw new BuilderError(exports.ErrorCode.CONFIG_VALIDATION_ERROR, `配置验证失败: ${validation.errors.join(', ')}`);
                }
            }
            // 冻结配置（如果启用）
            if (this.options.freezeConfig) {
                Object.freeze(mergedConfig);
            }
            this.currentConfig = mergedConfig;
            // 启动配置文件监听
            if (this.options.watch && configPath) {
                await this.startWatching(configPath);
            }
            this.emit('config:loaded', mergedConfig, configPath);
            return mergedConfig;
        }
        catch (error) {
            this.errorHandler.handle(error, 'loadConfig');
            throw error;
        }
    }
    /**
     * 验证配置
     */
    validateConfig(config, _options = {}) {
        const result = {
            valid: true,
            errors: [],
            warnings: []
        };
        try {
            // 基础验证
            if (!config.input) {
                result.errors.push('缺少入口文件配置 (input)');
            }
            // 输出配置验证
            if (config.output) {
                if (!config.output.dir && !config.output.file) {
                    result.errors.push('输出配置必须指定 dir 或 file');
                }
            }
            // 打包器验证
            if (config.bundler && !['rollup', 'rolldown'].includes(config.bundler)) {
                result.errors.push(`不支持的打包器: ${config.bundler}`);
            }
            // 格式验证
            if (config.output?.format) {
                const formats = Array.isArray(config.output.format)
                    ? config.output.format
                    : [config.output.format];
                const validFormats = ['esm', 'cjs', 'umd', 'iife', 'css'];
                for (const format of formats) {
                    if (!validFormats.includes(format)) {
                        result.errors.push(`不支持的输出格式: ${format}`);
                    }
                }
            }
            // 设置验证结果
            result.valid = result.errors.length === 0;
        }
        catch (error) {
            result.valid = false;
            result.errors.push(`配置验证异常: ${error.message}`);
        }
        return result;
    }
    /**
     * 合并配置
     */
    mergeConfigs(base, override, options = {}) {
        const { deep = true, arrayMergeStrategy = 'replace' } = options;
        if (!deep) {
            return { ...base, ...override };
        }
        const result = { ...base };
        for (const [key, value] of Object.entries(override)) {
            if (value === undefined) {
                continue;
            }
            if (!(key in result)) {
                result[key] = value;
                continue;
            }
            const baseValue = result[key];
            if (Array.isArray(value) && Array.isArray(baseValue)) {
                switch (arrayMergeStrategy) {
                    case 'concat':
                        result[key] = [...baseValue, ...value];
                        break;
                    case 'unique':
                        result[key] = [...new Set([...baseValue, ...value])];
                        break;
                    case 'replace':
                    default:
                        result[key] = value;
                        break;
                }
            }
            else if (typeof value === 'object' &&
                value !== null &&
                typeof baseValue === 'object' &&
                baseValue !== null) {
                result[key] = this.mergeConfigs(baseValue, value, options);
            }
            else {
                result[key] = value;
            }
        }
        return result;
    }
    /**
     * 获取当前配置
     */
    getCurrentConfig() {
        return this.currentConfig;
    }
    /**
     * 查找配置文件
     */
    async findConfigFile() {
        return configLoader.findConfigFile();
    }
    /**
     * 获取环境特定配置
     */
    getEnvConfig(config) {
        const env = process.env.NODE_ENV || config.mode || 'production';
        return config.env?.[env];
    }
    /**
     * 启动配置文件监听
     */
    async startWatching(configPath) {
        if (this.configWatcher) {
            this.configWatcher();
        }
        this.configWatcher = await configLoader.watchConfigFile(configPath, (newConfig) => {
            this.logger.info('配置文件已更改，重新加载...');
            try {
                const mergedConfig = this.mergeConfigs(DEFAULT_BUILDER_CONFIG, newConfig);
                this.currentConfig = mergedConfig;
                this.emit('config:change', mergedConfig, configPath);
                this.logger.success('配置重新加载完成');
            }
            catch (error) {
                this.logger.error('配置重新加载失败:', error);
                this.emit('config:error', error);
            }
        });
    }
    /**
     * 停止监听
     */
    async dispose() {
        if (this.configWatcher) {
            this.configWatcher();
            this.configWatcher = undefined;
        }
        this.removeAllListeners();
    }
}

/**
 * TypeScript 策略
 *
 * 为 TypeScript 库提供完整的构建策略，包括：
 * - TypeScript 编译和类型检查
 * - 声明文件生成
 * - 多格式输出支持
 * - Tree Shaking 优化
 *
 * @author LDesign Team
 * @version 1.0.0
 */
/**
 * TypeScript 库构建策略
 */
class TypeScriptStrategy {
    constructor() {
        this.name = 'typescript';
        this.supportedTypes = [exports.LibraryType.TYPESCRIPT];
        this.priority = 10;
    }
    /**
     * 应用 TypeScript 策略
     */
    async applyStrategy(config) {
        const outputConfig = this.buildOutputConfig(config);
        // 计算入口：若用户未指定，则默认将 src 目录下的所有源码文件作为多入口
        const resolvedInput = await this.resolveInputEntries(config);
        const unifiedConfig = {
            input: resolvedInput,
            output: outputConfig,
            plugins: this.buildPlugins(config),
            external: config.external || [],
            treeshake: config.performance?.treeshaking !== false,
            onwarn: this.createWarningHandler()
        };
        return unifiedConfig;
    }
    /**
     * 检查策略是否适用
     */
    isApplicable(config) {
        return config.libraryType === exports.LibraryType.TYPESCRIPT;
    }
    /**
     * 获取默认配置
     */
    getDefaultConfig() {
        return {
            libraryType: exports.LibraryType.TYPESCRIPT,
            output: {
                format: ['esm', 'cjs', 'umd'],
                sourcemap: true
            },
            typescript: {
                declaration: true,
                // declarationDir 将由 RollupAdapter 动态设置
                target: 'ES2020',
                module: 'ESNext',
                strict: true,
                skipLibCheck: true
            },
            performance: {
                treeshaking: true,
                minify: true
            }
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
        const { findFiles } = await Promise.resolve().then(function () { return fileSystem; });
        const { relative, extname } = await import('path');
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
        const { findFiles } = await Promise.resolve().then(function () { return fileSystem; });
        const { relative, extname } = await import('path');
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
     * 获取推荐插件
     */
    getRecommendedPlugins(config) {
        const plugins = [];
        // TypeScript 插件
        plugins.push({
            name: '@rollup/plugin-typescript',
            options: this.getTypeScriptOptions(config)
        });
        // Node 解析插件（优先浏览器分支，避免引入 Node 内置依赖）
        plugins.push({
            name: '@rollup/plugin-node-resolve',
            options: {
                preferBuiltins: false,
                browser: true,
                extensions: ['.mjs', '.js', '.json', '.ts', '.tsx']
            }
        });
        // CommonJS 插件
        plugins.push({
            name: '@rollup/plugin-commonjs',
            options: {}
        });
        // JSON 插件（允许导入 JSON 文件）
        plugins.push({
            name: '@rollup/plugin-json',
            options: {}
        });
        // 代码压缩插件（生产模式）
        if (config.mode === 'production' && config.performance?.minify !== false) {
            plugins.push({
                name: '@rollup/plugin-terser',
                options: {
                    compress: {
                        drop_console: true,
                        drop_debugger: true
                    },
                    format: {
                        comments: false
                    }
                }
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
            errors.push('TypeScript 策略需要指定入口文件');
        }
        else if (typeof config.input === 'string') {
            if (!config.input.endsWith('.ts') && !config.input.endsWith('.tsx')) {
                warnings.push('入口文件不是 TypeScript 文件，建议使用 .ts 或 .tsx 扩展名');
            }
        }
        // 检查输出配置
        if (!config.output?.format) {
            suggestions.push('建议指定输出格式，如 ["esm", "cjs"]');
        }
        // 检查 TypeScript 配置
        if (!config.typescript?.declaration) {
            suggestions.push('建议启用类型声明文件生成 (declaration: true)');
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
        const formats = Array.isArray(outputConfig.format) ? outputConfig.format : ['esm', 'cjs', 'umd'];
        // 
        //  d e f f f f f f f f f f f f f f f f f f f
        return {
            format: formats, //  d e f f f f f f f f f f f f
            sourcemap: outputConfig.sourcemap !== false,
            exports: 'auto',
            name: outputConfig.name,
            globals: outputConfig.globals || {}
        };
    }
    /**
     * 构建插件配置
     */
    buildPlugins(config) {
        const plugins = [];
        // TypeScript 插件
        plugins.push({
            name: 'typescript',
            plugin: async () => {
                const typescript = await import('@rollup/plugin-typescript');
                return typescript.default({
                    ...this.getTypeScriptOptions(config)
                });
            }
        });
        // Node 解析插件（优先浏览器分支）
        plugins.push({
            name: 'node-resolve',
            plugin: async () => {
                const nodeResolve = await import('@rollup/plugin-node-resolve');
                return nodeResolve.nodeResolve({
                    preferBuiltins: false,
                    browser: true,
                    extensions: ['.mjs', '.js', '.json', '.ts', '.tsx']
                });
            }
        });
        // CommonJS 插件
        plugins.push({
            name: 'commonjs',
            plugin: async () => {
                const commonjs = await import('@rollup/plugin-commonjs');
                return commonjs.default();
            }
        });
        // JSON 插件
        plugins.push({
            name: 'json',
            plugin: async () => {
                const json = await import('@rollup/plugin-json');
                return json.default();
            }
        });
        // 代码压缩插件（生产模式）
        if (config.mode === 'production' && config.performance?.minify !== false) {
            plugins.push({
                name: 'terser',
                plugin: async () => {
                    const terser = await import('@rollup/plugin-terser');
                    return terser.default({
                        compress: {
                            drop_console: true,
                            drop_debugger: true
                        },
                        format: {
                            comments: false
                        }
                    });
                }
            });
        }
        return plugins;
    }
    /**
     * 获取 TypeScript 选项
     */
    getTypeScriptOptions(config) {
        const tsConfig = config.typescript || {};
        const options = {
            target: tsConfig.target || 'ES2020',
            module: tsConfig.module || 'ESNext',
            strict: tsConfig.strict !== false,
            skipLibCheck: tsConfig.skipLibCheck !== false,
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            moduleResolution: 'node',
            resolveJsonModule: true,
            isolatedModules: true,
            noEmitOnError: false,
            // 显式覆盖，避免上游 tsconfig 开启导致 TS5096
            allowImportingTsExtensions: false,
            exclude: ['**/*.test.ts', '**/*.spec.ts', 'node_modules/**']
        };
        // 只有在明确启用声明文件时才添加相关选项
        if (tsConfig.declaration === true) {
            options.declaration = true;
            // declarationDir 将由 RollupAdapter 动态设置，这里不设置固定值
            if (tsConfig.declarationDir) {
                options.declarationDir = tsConfig.declarationDir;
            }
            if (tsConfig.declarationMap === true) {
                options.declarationMap = true;
            }
        }
        return options;
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
/**
 * 样式库构建策略
 */
class StyleStrategy {
    constructor() {
        this.name = 'style';
        this.supportedTypes = [exports.LibraryType.STYLE];
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
        return config.libraryType === exports.LibraryType.STYLE;
    }
    /**
     * 获取默认配置
     */
    getDefaultConfig() {
        return {
            libraryType: exports.LibraryType.STYLE,
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
            errors.push('样式策略需要指定入口文件');
        }
        else if (typeof config.input === 'string') {
            const supportedExtensions = ['.css', '.less', '.scss', '.sass', '.styl'];
            const hasValidExtension = supportedExtensions.some(ext => config.input.toString().endsWith(ext));
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
                const postcss = await import('rollup-plugin-postcss');
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
                const autoprefixer = await import('autoprefixer');
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
        const { findFiles } = await Promise.resolve().then(function () { return fileSystem; });
        const { relative, extname } = await import('path');
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
        const { findFiles } = await Promise.resolve().then(function () { return fileSystem; });
        const { relative, extname } = await import('path');
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

/**
 * Vue 3 组件库构建策略
 *
 * 为 Vue 3 组件库提供完整的构建策略，包括：
 * - Vue SFC 单文件组件编译
 * - TypeScript 支持
 * - 样式提取和处理
 * - 组件类型定义生成
 * - 插件式安装支持
 *
 * @author LDesign Team
 * @version 1.0.0
 */
/**
 * Vue 3 组件库构建策略
 */
class Vue3Strategy {
    constructor() {
        this.name = 'vue3';
        this.supportedTypes = [exports.LibraryType.VUE3];
        this.priority = 10;
    }
    /**
     * 应用 Vue 3 策略
     */
    async applyStrategy(config) {
        // 解析入口配置
        const resolvedInput = await this.resolveInputEntries(config);
        const unifiedConfig = {
            input: resolvedInput,
            output: this.buildOutputConfig(config),
            plugins: await this.buildPlugins(config),
            external: this.buildExternals(config),
            treeshake: config.performance?.treeshaking !== false,
            onwarn: this.createWarningHandler()
        };
        return unifiedConfig;
    }
    /**
     * 检查策略是否适用
     */
    isApplicable(config) {
        return config.libraryType === exports.LibraryType.VUE3;
    }
    /**
     * 获取默认配置
     */
    getDefaultConfig() {
        return {
            libraryType: exports.LibraryType.VUE3,
            output: {
                format: ['esm', 'cjs'],
                sourcemap: true
            },
            vue: {
                version: 3,
                jsx: {
                    enabled: true
                },
                template: {
                    precompile: true
                }
            },
            typescript: {
                declaration: true,
                declarationDir: 'dist',
                target: 'ES2020',
                module: 'ESNext',
                strict: true
            },
            style: {
                extract: true,
                minimize: true,
                autoprefixer: true
            },
            performance: {
                treeshaking: true,
                minify: true
            },
            external: ['vue']
        };
    }
    /**
     * 获取推荐插件
     */
    getRecommendedPlugins(config) {
        const plugins = [];
        // Vue SFC 插件
        plugins.push({
            name: 'rollup-plugin-vue',
            options: this.getVueOptions(config)
        });
        // TypeScript 插件
        plugins.push({
            name: '@rollup/plugin-typescript',
            options: this.getTypeScriptOptions(config)
        });
        // Node 解析插件
        plugins.push({
            name: '@rollup/plugin-node-resolve',
            options: {
                preferBuiltins: false,
                browser: true
            }
        });
        // CommonJS 插件
        plugins.push({
            name: '@rollup/plugin-commonjs',
            options: {}
        });
        // 样式处理插件
        if (config.style?.extract !== false) {
            plugins.push({
                name: 'rollup-plugin-postcss',
                options: this.getPostCSSOptions(config)
            });
        }
        // 代码压缩插件（生产模式）
        if (config.mode === 'production' && config.performance?.minify !== false) {
            plugins.push({
                name: '@rollup/plugin-terser',
                options: {
                    compress: {
                        drop_console: true,
                        drop_debugger: true
                    },
                    format: {
                        comments: false
                    }
                }
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
            errors.push('Vue 3 策略需要指定入口文件');
        }
        // 检查 Vue 版本
        if (config.vue?.version && config.vue.version !== 3) {
            warnings.push('当前策略针对 Vue 3 优化，建议使用 Vue 3');
        }
        // 检查外部依赖
        if (Array.isArray(config.external) && !config.external.includes('vue')) {
            suggestions.push('建议将 Vue 添加到外部依赖中以减少包体积');
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
            exports: 'named',
            globals: {
                vue: 'Vue',
                ...outputConfig.globals
            }
        };
    }
    /**
     * 构建插件配置
     */
    async buildPlugins(config) {
        const plugins = [];
        try {
            // Node 解析插件（第一个）
            const nodeResolve = await import('@rollup/plugin-node-resolve');
            plugins.push(nodeResolve.default({
                preferBuiltins: false,
                browser: true,
                extensions: ['.mjs', '.js', '.json', '.ts', '.tsx', '.vue']
            }));
            // Vue SFC 插件（使用 unplugin-vue，兼容 Rollup）
            const { default: VuePlugin } = await import('unplugin-vue/rollup');
            plugins.push(VuePlugin(this.getVueOptions(config)));
            // 先用 TypeScript 插件处理纯 .ts 入口与模块（排除 Vue 虚拟模块）
            const { default: tsPlugin } = await import('@rollup/plugin-typescript');
            plugins.push({
                name: 'typescript',
                plugin: async () => tsPlugin({
                    ...this.getTypeScriptOptions(config),
                    include: ['src/**/*.ts', 'src/**/*.tsx'],
                    exclude: ['**/*.vue', '**/*.vue?*', 'node_modules/**'],
                    // 避免 @rollup/plugin-typescript 在缺失 rollup 顶层 sourcemap 时报错
                    sourceMap: config.output?.sourcemap !== false
                })
            });
            // 再用 Babel 去掉 TS 注解（特别是 Vue 虚拟模块）
            const { default: babel } = await import('@rollup/plugin-babel');
            plugins.push(babel({
                babelrc: false,
                configFile: false,
                babelHelpers: 'bundled',
                extensions: ['.ts', '.tsx', '.js', '.jsx'],
                presets: [
                    ['@babel/preset-typescript', { allowDeclareFields: true }]
                ],
                // 仅处理脚本相关文件与 vue 的 script 虚拟模块
                include: [
                    /\.(ts|tsx|js|jsx)$/,
                    /\?vue&type=script/,
                ],
                exclude: [
                    /\?vue&type=style/,
                    /\?vue&type=template/,
                    /\.(css|less|scss|sass)$/
                ]
            }));
            // 再用 esbuild 做转译与最小化（兼容 Vue 虚拟模块）
            const { default: esbuild } = await import('rollup-plugin-esbuild');
            plugins.push(esbuild({
                include: /\.(ts|tsx|js|jsx)(\?|$)/,
                exclude: [/node_modules/],
                target: 'es2020',
                jsx: 'preserve',
                tsconfig: 'tsconfig.json',
                minify: config.performance?.minify !== false,
                sourceMap: config.output?.sourcemap !== false
            }));
            // CommonJS 插件
            const commonjs = await import('@rollup/plugin-commonjs');
            plugins.push(commonjs.default());
            // 样式处理插件（接收 vue SFC 的 style 虚拟模块）
            const postcss = await import('rollup-plugin-postcss');
            plugins.push(postcss.default({
                ...this.getPostCSSOptions(config),
                include: [
                    /\.(css|less|scss|sass)$/,
                    /\?vue&type=style/
                ]
            }));
        }
        catch (error) {
            console.error('插件加载失败:', error);
        }
        return plugins;
    }
    /**
     * 构建外部依赖配置
     */
    buildExternals(config) {
        let externals = [];
        if (Array.isArray(config.external)) {
            externals = [...config.external];
        }
        else if (typeof config.external === 'function') {
            // 如果是函数，我们只能添加 Vue 作为默认外部依赖
            externals = ['vue'];
        }
        else {
            externals = [];
        }
        // 确保 Vue 是外部依赖
        if (!externals.includes('vue')) {
            externals.push('vue');
        }
        return externals;
    }
    /**
     * 获取 Vue 选项
     */
    getVueOptions(config) {
        const vueConfig = config.vue || {};
        return {
            include: /\.vue$/,
            template: {
                compilerOptions: {
                    isCustomElement: (tag) => tag.startsWith('ld-')
                },
                ...vueConfig.template
            },
            ...vueConfig
        };
    }
    /**
     * 获取 TypeScript 选项
     */
    getTypeScriptOptions(config) {
        const tsConfig = config.typescript || {};
        return {
            target: tsConfig.target || 'ES2020',
            module: tsConfig.module || 'ESNext',
            declaration: tsConfig.declaration !== false,
            // declarationDir 将由 RollupAdapter 动态设置
            strict: tsConfig.strict !== false,
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            skipLibCheck: true,
            moduleResolution: 'node',
            resolveJsonModule: true,
            jsx: 'preserve',
            ...tsConfig
        };
    }
    /**
     * 获取 PostCSS 选项
     */
    getPostCSSOptions(config) {
        return {
            extract: config.style?.extract !== false,
            minimize: config.style?.minimize !== false,
            sourceMap: config.output?.sourcemap !== false,
            modules: config.style?.modules || false
        };
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
        const { findFiles } = await Promise.resolve().then(function () { return fileSystem; });
        const { relative, extname } = await import('path');
        const files = await findFiles([
            'src/**/*.{ts,tsx,js,jsx,vue}'
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
        const { findFiles } = await Promise.resolve().then(function () { return fileSystem; });
        const { relative, extname } = await import('path');
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
}

/**
 * React 策略
 * 使用 esbuild 处理 TS/TSX，postcss 处理样式，rollup 输出 ESM/CJS
 */
class ReactStrategy {
    constructor() {
        this.name = 'react';
        this.supportedTypes = [exports.LibraryType.REACT];
        this.priority = 10;
    }
    async applyStrategy(config) {
        // 解析入口配置
        const resolvedInput = await this.resolveInputEntries(config);
        return {
            input: resolvedInput,
            output: this.buildOutputConfig(config),
            plugins: await this.buildPlugins(config),
            external: [...(config.external || []), 'react', 'react-dom'],
            treeshake: config.performance?.treeshaking !== false,
            onwarn: this.createWarningHandler()
        };
    }
    isApplicable(config) {
        return config.libraryType === exports.LibraryType.REACT;
    }
    getDefaultConfig() {
        return {
            libraryType: exports.LibraryType.REACT,
            output: { format: ['esm', 'cjs'], sourcemap: true },
            performance: { treeshaking: true, minify: true }
        };
    }
    getRecommendedPlugins(_config) { return []; }
    validateConfig(_config) { return { valid: true, errors: [], warnings: [], suggestions: [] }; }
    async buildPlugins(config) {
        const plugins = [];
        // Node resolve
        const nodeResolve = await import('@rollup/plugin-node-resolve');
        plugins.push(nodeResolve.default({ browser: true, extensions: ['.mjs', '.js', '.json', '.ts', '.tsx'] }));
        // CommonJS
        const commonjs = await import('@rollup/plugin-commonjs');
        plugins.push(commonjs.default());
        // TypeScript for DTS only
        const ts = await import('@rollup/plugin-typescript');
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
            const postcss = await import('rollup-plugin-postcss');
            plugins.push(postcss.default({ extract: true, minimize: config.performance?.minify !== false }));
        }
        // esbuild for TS/TSX/JSX
        const esbuild = await import('rollup-plugin-esbuild');
        plugins.push(esbuild.default({
            include: /\.(tsx?|jsx?)$/, exclude: [/node_modules/], target: 'es2020',
            jsx: 'automatic', jsxImportSource: 'react', tsconfig: 'tsconfig.json',
            sourceMap: config.output?.sourcemap !== false, minify: config.performance?.minify !== false
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
        const { findFiles } = await Promise.resolve().then(function () { return fileSystem; });
        const { relative, extname } = await import('path');
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
        const { findFiles } = await Promise.resolve().then(function () { return fileSystem; });
        const { relative, extname } = await import('path');
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
}

/**
 * 混合策略
 */
class MixedStrategy {
    constructor() {
        this.name = 'mixed';
        this.supportedTypes = [exports.LibraryType.MIXED];
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
        return config.libraryType === exports.LibraryType.MIXED;
    }
    getDefaultConfig() {
        return {
            libraryType: exports.LibraryType.MIXED,
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
        const { findFiles } = await Promise.resolve().then(function () { return fileSystem; });
        const { relative, extname } = await import('path');
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
        const { findFiles } = await Promise.resolve().then(function () { return fileSystem; });
        const { relative, extname } = await import('path');
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
            const nodeResolve = await import('@rollup/plugin-node-resolve');
            plugins.push(nodeResolve.default({
                preferBuiltins: false,
                browser: true,
                extensions: ['.mjs', '.js', '.json', '.ts', '.tsx', '.vue', '.css', '.less', '.scss']
            }));
            // CommonJS
            const commonjs = await import('@rollup/plugin-commonjs');
            plugins.push(commonjs.default());
            // TypeScript
            const ts = await import('@rollup/plugin-typescript');
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
                const postcss = await import('rollup-plugin-postcss');
                plugins.push(postcss.default({
                    extract: true,
                    minimize: config.performance?.minify !== false,
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

/**
 * 策略管理器
 *
 * 负责管理不同库类型的构建策略
 *
 * @author LDesign Team
 * @version 1.0.0
 */
/**
 * 基础策略实现（临时）
 */
class BaseStrategy {
    constructor(name, supportedTypes, priority = 1) {
        this.name = name;
        this.supportedTypes = supportedTypes;
        this.priority = priority;
    }
    async applyStrategy(config) {
        // 基础实现，返回原配置
        return config;
    }
    isApplicable(_config) {
        return this.supportedTypes.includes(_config.libraryType);
    }
    getDefaultConfig() {
        return {};
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
}
/**
 * 策略管理器类
 */
class StrategyManager {
    constructor(_options = {}) {
        this.strategies = new Map();
        this.logger = _options.logger || new Logger();
        this.errorHandler = new ErrorHandler({ logger: this.logger });
        // 注册默认策略
        this.registerDefaultStrategies();
    }
    /**
     * 注册策略
     */
    registerStrategy(strategy) {
        for (const type of strategy.supportedTypes) {
            this.strategies.set(type, strategy);
        }
        this.logger.debug(`注册策略: ${strategy.name}`);
    }
    /**
     * 获取策略
     */
    getStrategy(libraryType) {
        const strategy = this.strategies.get(libraryType);
        if (!strategy) {
            throw new BuilderError(exports.ErrorCode.CONFIG_VALIDATION_ERROR, `未找到库类型 ${libraryType} 的策略`);
        }
        return strategy;
    }
    /**
     * 检测最佳策略
     */
    async detectStrategy(_projectPath) {
        // TODO: 实现策略检测逻辑
        // 这里先返回一个默认结果
        return {
            strategy: exports.LibraryType.TYPESCRIPT,
            confidence: 0.8,
            evidence: [],
            alternatives: []
        };
    }
    /**
     * 应用策略
     */
    async applyStrategy(libraryType, config) {
        const startTime = Date.now();
        try {
            const strategy = this.getStrategy(libraryType);
            // 验证策略是否适用
            if (!strategy.isApplicable(config)) {
                throw new BuilderError(exports.ErrorCode.CONFIG_VALIDATION_ERROR, `策略 ${strategy.name} 不适用于当前配置`);
            }
            // 应用策略
            const transformedConfig = await strategy.applyStrategy(config);
            const plugins = strategy.getRecommendedPlugins(config);
            const duration = Date.now() - startTime;
            return {
                strategy,
                config: transformedConfig,
                plugins,
                duration,
                warnings: [],
                optimizations: []
            };
        }
        catch (error) {
            this.errorHandler.handle(error, 'applyStrategy');
            throw error;
        }
    }
    /**
     * 获取所有已注册的策略
     */
    getAllStrategies() {
        return Array.from(this.strategies.values());
    }
    /**
     * 获取支持的库类型
     */
    getSupportedTypes() {
        return Array.from(this.strategies.keys());
    }
    /**
     * 注册默认策略
     */
    registerDefaultStrategies() {
        // TypeScript 策略
        this.registerStrategy(new TypeScriptStrategy());
        // Vue3 策略
        this.registerStrategy(new Vue3Strategy());
        // Vue2 策略
        this.registerStrategy(new BaseStrategy('vue2', [exports.LibraryType.VUE2], 10));
        // 样式策略
        this.registerStrategy(new StyleStrategy());
        // React 策略
        this.registerStrategy(new ReactStrategy());
        // 混合策略
        this.registerStrategy(new MixedStrategy());
    }
}

/**
 * 插件管理器
 *
 * 负责插件的加载、管理和执行
 *
 * @author LDesign Team
 * @version 1.0.0
 */
/**
 * 插件管理器类
 */
class PluginManager extends require$$0$2.EventEmitter {
    constructor(options = {}) {
        super();
        this.plugins = new Map();
        this.performanceStats = new Map();
        this.options = {
            cache: true,
            hotReload: false,
            timeout: 30000,
            maxPlugins: 100,
            whitelist: [],
            blacklist: [],
            ...options
        };
        this.logger = options.logger || new Logger();
    }
    /**
     * 加载插件
     */
    async loadPlugin(plugin) {
        const startTime = Date.now();
        try {
            // 检查插件是否已加载
            if (this.plugins.has(plugin.name)) {
                this.logger.warn(`插件 ${plugin.name} 已存在，将被覆盖`);
            }
            // 检查黑名单
            if (this.options.blacklist?.includes(plugin.name)) {
                throw new BuilderError(exports.ErrorCode.PLUGIN_LOAD_ERROR, `插件 ${plugin.name} 在黑名单中`);
            }
            // 检查白名单
            if (this.options.whitelist?.length && !this.options.whitelist.includes(plugin.name)) {
                throw new BuilderError(exports.ErrorCode.PLUGIN_LOAD_ERROR, `插件 ${plugin.name} 不在白名单中`);
            }
            // 检查插件数量限制
            if (this.plugins.size >= (this.options.maxPlugins || 100)) {
                throw new BuilderError(exports.ErrorCode.PLUGIN_LOAD_ERROR, `插件数量超过限制 (${this.options.maxPlugins})`);
            }
            // 验证插件
            this.validatePlugin(plugin);
            // 初始化插件
            if (plugin.onInit) {
                await plugin.onInit({
                    buildId: 'init',
                    pluginName: plugin.name,
                    cwd: process.cwd(),
                    mode: 'production',
                    platform: 'browser',
                    env: process.env,
                    config: {},
                    cacheDir: '',
                    tempDir: '',
                    logger: this.logger,
                    performanceMonitor: null
                });
            }
            // 注册插件
            this.plugins.set(plugin.name, plugin);
            const loadTime = Date.now() - startTime;
            // 初始化性能统计
            this.performanceStats.set(plugin.name, {
                name: plugin.name,
                totalTime: 0,
                callCount: 0,
                averageTime: 0,
                maxTime: 0,
                hookPerformance: {}
            });
            this.logger.success(`插件 ${plugin.name} 加载成功 (${loadTime}ms)`);
            return {
                plugin,
                loadTime,
                success: true
            };
        }
        catch (error) {
            const loadTime = Date.now() - startTime;
            this.logger.error(`插件 ${plugin.name} 加载失败:`, error);
            return {
                plugin,
                loadTime,
                success: false,
                error: error
            };
        }
    }
    /**
     * 批量加载插件
     */
    async loadPlugins(plugins) {
        const results = [];
        for (const plugin of plugins) {
            const result = await this.loadPlugin(plugin);
            results.push(result);
            // 如果加载失败且不是可选插件，抛出错误
            if (!result.success && !plugin.enabled) {
                throw new BuilderError(exports.ErrorCode.PLUGIN_LOAD_ERROR, `必需插件 ${plugin.name} 加载失败`, { cause: result.error });
            }
        }
        return results;
    }
    /**
     * 获取插件
     */
    getPlugin(name) {
        return this.plugins.get(name);
    }
    /**
     * 获取所有插件
     */
    getAllPlugins() {
        return Array.from(this.plugins.values());
    }
    /**
     * 移除插件
     */
    async removePlugin(name) {
        const plugin = this.plugins.get(name);
        if (!plugin) {
            return false;
        }
        try {
            // 调用插件销毁钩子
            if (plugin.onDestroy) {
                await plugin.onDestroy({
                    buildId: 'destroy',
                    pluginName: plugin.name,
                    cwd: process.cwd(),
                    mode: 'production',
                    platform: 'browser',
                    env: process.env,
                    config: {},
                    cacheDir: '',
                    tempDir: '',
                    logger: this.logger,
                    performanceMonitor: null
                });
            }
            this.plugins.delete(name);
            this.performanceStats.delete(name);
            this.logger.info(`插件 ${name} 已移除`);
            return true;
        }
        catch (error) {
            this.logger.error(`移除插件 ${name} 失败:`, error);
            return false;
        }
    }
    /**
     * 清空所有插件
     */
    async clear() {
        const pluginNames = Array.from(this.plugins.keys());
        for (const name of pluginNames) {
            await this.removePlugin(name);
        }
    }
    /**
     * 获取插件性能统计
     */
    getPerformanceStats(name) {
        if (name) {
            const stats = this.performanceStats.get(name);
            if (!stats) {
                throw new BuilderError(exports.ErrorCode.PLUGIN_NOT_FOUND, `插件 ${name} 不存在`);
            }
            return stats;
        }
        return Array.from(this.performanceStats.values());
    }
    /**
     * 验证插件
     */
    validatePlugin(plugin) {
        if (!plugin.name) {
            throw new BuilderError(exports.ErrorCode.PLUGIN_LOAD_ERROR, '插件必须有名称');
        }
        if (typeof plugin.name !== 'string') {
            throw new BuilderError(exports.ErrorCode.PLUGIN_LOAD_ERROR, '插件名称必须是字符串');
        }
        // 检查插件依赖
        if (plugin.dependencies) {
            for (const dep of plugin.dependencies) {
                if (!this.plugins.has(dep)) {
                    throw new BuilderError(exports.ErrorCode.PLUGIN_DEPENDENCY_ERROR, `插件 ${plugin.name} 依赖的插件 ${dep} 未找到`);
                }
            }
        }
    }
    /**
     * 销毁资源
     */
    async dispose() {
        await this.clear();
        this.removeAllListeners();
    }
}

/**
 * 库类型相关常量
 */
/**
 * 库类型检测模式
 */
const LIBRARY_TYPE_PATTERNS = {
    [exports.LibraryType.TYPESCRIPT]: {
        // TypeScript 库检测模式
        files: [
            'src/**/*.ts',
            'src/**/*.tsx',
            'lib/**/*.ts',
            'lib/**/*.tsx',
            'index.ts',
            'main.ts'
        ],
        dependencies: [
            'typescript',
            '@types/node'
        ],
        configs: [
            'tsconfig.json',
            'tsconfig.build.json'
        ],
        packageJsonFields: [
            'types',
            'typings'
        ],
        weight: 0.8
    },
    [exports.LibraryType.STYLE]: {
        // 样式库检测模式
        files: [
            'src/**/*.css',
            'src/**/*.less',
            'src/**/*.scss',
            'src/**/*.sass',
            'src/**/*.styl',
            'lib/**/*.css',
            'styles/**/*'
        ],
        dependencies: [
            'less',
            'sass',
            'stylus',
            'postcss'
        ],
        configs: [
            'postcss.config.js',
            '.stylelintrc'
        ],
        packageJsonFields: [
            'style',
            'sass',
            'less'
        ],
        weight: 0.9
    },
    [exports.LibraryType.VUE2]: {
        // Vue2 组件库检测模式
        files: [
            'src/**/*.vue',
            'lib/**/*.vue',
            'components/**/*.vue'
        ],
        dependencies: [
            'vue@^2',
            '@vue/composition-api',
            'vue-template-compiler'
        ],
        devDependencies: [
            '@vue/cli-service',
            'vue-loader'
        ],
        configs: [
            'vue.config.js'
        ],
        packageJsonFields: [],
        weight: 0.95
    },
    [exports.LibraryType.VUE3]: {
        // Vue3 组件库检测模式
        files: [
            'src/**/*.vue',
            'lib/**/*.vue',
            'components/**/*.vue'
        ],
        dependencies: [
            'vue@^3',
            '@vue/runtime-core',
            '@vue/runtime-dom'
        ],
        devDependencies: [
            '@vitejs/plugin-vue',
            '@vue/compiler-sfc'
        ],
        configs: [
            'vite.config.ts',
            'vite.config.js'
        ],
        packageJsonFields: [],
        weight: 0.95
    },
    [exports.LibraryType.REACT]: {
        // React 组件库检测模式
        files: [
            'src/**/*.tsx',
            'src/**/*.jsx',
            'lib/**/*.tsx',
            'components/**/*.tsx'
        ],
        dependencies: [
            'react',
            'react-dom'
        ],
        devDependencies: [
            '@vitejs/plugin-react'
        ],
        configs: [
            'vite.config.ts',
            'vite.config.js'
        ],
        packageJsonFields: [],
        weight: 0.95
    },
    [exports.LibraryType.MIXED]: {
        // 混合库检测模式（多种类型混合）
        files: [
            'src/**/*.{ts,tsx,vue,css,less,scss}'
        ],
        dependencies: [],
        configs: [],
        packageJsonFields: [],
        weight: 0.6 // 较低权重，作为兜底选项
    }
};
/**
 * 库类型描述
 */
const LIBRARY_TYPE_DESCRIPTIONS = {
    [exports.LibraryType.TYPESCRIPT]: 'TypeScript 库 - 使用 TypeScript 编写的库，支持类型声明和现代 JavaScript 特性',
    [exports.LibraryType.STYLE]: '样式库 - 包含 CSS、Less、Sass 等样式文件的库',
    [exports.LibraryType.VUE2]: 'Vue2 组件库 - 基于 Vue 2.x 的组件库',
    [exports.LibraryType.VUE3]: 'Vue3 组件库 - 基于 Vue 3.x 的组件库，支持 Composition API',
    [exports.LibraryType.REACT]: 'React 组件库 - 基于 React 18+ 的组件库，支持 JSX/TSX 与 Hooks',
    [exports.LibraryType.MIXED]: '混合库 - 包含多种类型文件的复合库'
};
/**
 * 库类型推荐配置
 */
const LIBRARY_TYPE_RECOMMENDED_CONFIG = {
    [exports.LibraryType.TYPESCRIPT]: {
        output: {
            format: ['esm', 'cjs'],
            sourcemap: true
        },
        typescript: {
            declaration: true,
            isolatedDeclarations: true
        },
        external: [],
        bundleless: false
    },
    [exports.LibraryType.STYLE]: {
        output: {
            format: ['esm'],
            sourcemap: false
        },
        style: {
            extract: true,
            minimize: true,
            autoprefixer: true
        },
        external: [],
        bundleless: true
    },
    [exports.LibraryType.VUE2]: {
        output: {
            format: ['esm', 'cjs', 'umd'],
            sourcemap: true
        },
        vue: {
            version: 2,
            onDemand: true
        },
        external: ['vue'],
        globals: {
            vue: 'Vue'
        },
        bundleless: false
    },
    [exports.LibraryType.VUE3]: {
        output: {
            format: ['esm', 'cjs', 'umd'],
            sourcemap: true
        },
        vue: {
            version: 3,
            onDemand: true
        },
        external: ['vue'],
        globals: {
            vue: 'Vue'
        },
        bundleless: false
    },
    [exports.LibraryType.REACT]: {
        output: {
            format: ['esm', 'cjs'],
            sourcemap: true
        },
        external: ['react', 'react-dom'],
        bundleless: false
    },
    [exports.LibraryType.MIXED]: {
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
        external: [],
        bundleless: false
    }
};
/**
 * 库类型优先级
 */
const LIBRARY_TYPE_PRIORITY = {
    [exports.LibraryType.VUE2]: 10,
    [exports.LibraryType.VUE3]: 10,
    [exports.LibraryType.REACT]: 10,
    [exports.LibraryType.STYLE]: 8,
    [exports.LibraryType.TYPESCRIPT]: 6,
    [exports.LibraryType.MIXED]: 2
};
/**
 * 库类型兼容性
 */
const LIBRARY_TYPE_COMPATIBILITY = {
    [exports.LibraryType.TYPESCRIPT]: {
        rollup: 'excellent',
        rolldown: 'excellent',
        treeshaking: true,
        codeSplitting: true,
        bundleless: true
    },
    [exports.LibraryType.STYLE]: {
        rollup: 'good',
        rolldown: 'good',
        treeshaking: false,
        codeSplitting: false,
        bundleless: true
    },
    [exports.LibraryType.VUE2]: {
        rollup: 'excellent',
        rolldown: 'good',
        treeshaking: true,
        codeSplitting: true,
        bundleless: false
    },
    [exports.LibraryType.VUE3]: {
        rollup: 'excellent',
        rolldown: 'excellent',
        treeshaking: true,
        codeSplitting: true,
        bundleless: false
    },
    [exports.LibraryType.MIXED]: {
        rollup: 'good',
        rolldown: 'good',
        treeshaking: true,
        codeSplitting: true,
        bundleless: false
    }
};
/**
 * 库类型所需插件
 */
const LIBRARY_TYPE_PLUGINS = {
    [exports.LibraryType.TYPESCRIPT]: [
        'typescript',
        'dts'
    ],
    [exports.LibraryType.STYLE]: [
        'postcss',
        'less',
        'sass',
        'stylus'
    ],
    [exports.LibraryType.VUE2]: [
        'vue2',
        'vue-jsx',
        'typescript',
        'postcss'
    ],
    [exports.LibraryType.VUE3]: [
        'vue3',
        'vue-jsx',
        'typescript',
        'postcss'
    ],
    [exports.LibraryType.MIXED]: [
        'typescript',
        'vue3',
        'postcss',
        'dts'
    ]
};
/**
 * 库类型检测权重
 */
const DETECTION_WEIGHTS = {
    // 文件模式权重
    files: 0.4,
    // 依赖权重
    dependencies: 0.3,
    // 配置文件权重
    configs: 0.2,
    // package.json 字段权重
    packageJsonFields: 0.1
};
/**
 * 最小置信度阈值
 */
const MIN_CONFIDENCE_THRESHOLD = 0.6;
/**
 * 库类型检测缓存配置
 */
const DETECTION_CACHE_CONFIG = {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 100
};
/**
 * 库类型特定的文件扩展名
 */
const LIBRARY_TYPE_EXTENSIONS = {
    [exports.LibraryType.TYPESCRIPT]: ['.ts', '.tsx', '.d.ts'],
    [exports.LibraryType.STYLE]: ['.css', '.less', '.scss', '.sass', '.styl'],
    [exports.LibraryType.VUE2]: ['.vue', '.ts', '.tsx', '.js', '.jsx'],
    [exports.LibraryType.VUE3]: ['.vue', '.ts', '.tsx', '.js', '.jsx'],
    [exports.LibraryType.MIXED]: ['.ts', '.tsx', '.vue', '.css', '.less', '.scss', '.sass']
};
/**
 * 库类型排除模式
 */
const LIBRARY_TYPE_EXCLUDE_PATTERNS = {
    common: [
        'node_modules/**',
        'dist/**',
        'build/**',
        '**/*.test.*',
        '**/*.spec.*',
        '**/*.d.ts'
    ],
    [exports.LibraryType.TYPESCRIPT]: [
        '**/*.js',
        '**/*.jsx'
    ],
    [exports.LibraryType.STYLE]: [
        '**/*.ts',
        '**/*.tsx',
        '**/*.js',
        '**/*.jsx',
        '**/*.vue'
    ],
    [exports.LibraryType.VUE2]: [],
    [exports.LibraryType.VUE3]: [],
    [exports.LibraryType.MIXED]: []
};

/**
 * 库类型检测器
 *
 * 负责自动检测项目的库类型
 *
 * @author LDesign Team
 * @version 1.0.0
 */
/**
 * 库类型检测器类
 */
class LibraryDetector {
    constructor(options = {}) {
        this.options = {
            confidence: 0.6,
            cache: true,
            ...options
        };
        this.logger = options.logger || new Logger();
        this.errorHandler = new ErrorHandler({ logger: this.logger });
    }
    /**
     * 检测库类型
     */
    async detect(projectPath) {
        try {
            this.logger.info(`开始检测项目类型: ${projectPath}`);
            const scores = {
                typescript: 0,
                style: 0,
                vue2: 0,
                vue3: 0,
                react: 0,
                mixed: 0
            };
            const evidence = {
                typescript: [],
                style: [],
                vue2: [],
                vue3: [],
                react: [],
                mixed: []
            };
            // 检测文件模式
            await this.detectFilePatterns(projectPath, scores, evidence);
            // 检测依赖
            await this.detectDependencies(projectPath, scores, evidence);
            // 检测配置文件
            await this.detectConfigFiles(projectPath, scores, evidence);
            // 检测 package.json 字段
            await this.detectPackageJsonFields(projectPath, scores, evidence);
            // 计算最终分数
            const finalScores = this.calculateFinalScores(scores);
            // 找到最高分的类型
            const detectedType = this.getBestMatch(finalScores);
            const confidence = finalScores[detectedType];
            const result = {
                type: detectedType,
                confidence,
                evidence: evidence[detectedType]
            };
            this.logger.success(`检测完成: ${detectedType} (置信度: ${(confidence * 100).toFixed(1)}%)`);
            return result;
        }
        catch (error) {
            this.errorHandler.handle(error, 'detect');
            // 返回默认结果
            return {
                type: exports.LibraryType.TYPESCRIPT,
                confidence: 0.5,
                evidence: []
            };
        }
    }
    /**
     * 检测文件模式
     */
    async detectFilePatterns(projectPath, scores, evidence) {
        for (const [type, pattern] of Object.entries(LIBRARY_TYPE_PATTERNS)) {
            const libraryType = type;
            try {
                const files = await findFiles([...pattern.files], {
                    cwd: projectPath,
                    ignore: ['node_modules/**', 'dist/**', '**/*.test.*', '**/*.spec.*']
                });
                if (files.length > 0) {
                    const score = Math.min(files.length * 0.1, 1) * pattern.weight;
                    scores[libraryType] += score;
                    evidence[libraryType].push({
                        type: 'file',
                        description: `找到 ${files.length} 个 ${libraryType} 文件 (模式: ${pattern.files.join(', ')})`,
                        weight: score,
                        source: files.slice(0, 3).join(', ')
                    });
                }
            }
            catch (error) {
                this.logger.debug(`检测 ${libraryType} 文件模式失败:`, error);
            }
        }
    }
    /**
     * 检测依赖
     */
    async detectDependencies(projectPath, scores, evidence) {
        try {
            const packageJsonPath = path$3.join(projectPath, 'package.json');
            if (await exists(packageJsonPath)) {
                const packageContent = await readFile(packageJsonPath, 'utf-8');
                const packageJson = JSON.parse(packageContent);
                const allDeps = {
                    ...packageJson.dependencies,
                    ...packageJson.devDependencies,
                    ...packageJson.peerDependencies
                };
                for (const [type, pattern] of Object.entries(LIBRARY_TYPE_PATTERNS)) {
                    const libraryType = type;
                    const matchedDeps = [];
                    for (const dep of pattern.dependencies) {
                        if (this.matchDependency(dep, allDeps)) {
                            matchedDeps.push(dep);
                        }
                    }
                    if (matchedDeps.length > 0) {
                        const score = (matchedDeps.length / pattern.dependencies.length) * pattern.weight * 0.8;
                        scores[libraryType] += score;
                        evidence[libraryType].push({
                            type: 'dependency',
                            description: `找到相关依赖: ${matchedDeps.join(', ')}`,
                            weight: score,
                            source: 'package.json'
                        });
                    }
                }
            }
        }
        catch (error) {
            this.logger.debug('检测依赖失败:', error);
        }
    }
    /**
     * 检测配置文件
     */
    async detectConfigFiles(projectPath, scores, evidence) {
        for (const [type, pattern] of Object.entries(LIBRARY_TYPE_PATTERNS)) {
            const libraryType = type;
            const foundConfigs = [];
            for (const configFile of pattern.configs) {
                const configPath = path$3.join(projectPath, configFile);
                if (await exists(configPath)) {
                    foundConfigs.push(configFile);
                }
            }
            if (foundConfigs.length > 0) {
                const score = (foundConfigs.length / pattern.configs.length) * pattern.weight * 0.6;
                scores[libraryType] += score;
                evidence[libraryType].push({
                    type: 'config',
                    description: `找到配置文件: ${foundConfigs.join(', ')}`,
                    weight: score,
                    source: foundConfigs.join(', ')
                });
            }
        }
    }
    /**
     * 检测 package.json 字段
     */
    async detectPackageJsonFields(projectPath, scores, evidence) {
        try {
            const packageJsonPath = path$3.join(projectPath, 'package.json');
            if (await exists(packageJsonPath)) {
                const packageContent = await readFile(packageJsonPath, 'utf-8');
                const packageJson = JSON.parse(packageContent);
                for (const [type, pattern] of Object.entries(LIBRARY_TYPE_PATTERNS)) {
                    const libraryType = type;
                    const foundFields = [];
                    for (const field of pattern.packageJsonFields) {
                        if (packageJson[field]) {
                            foundFields.push(field);
                        }
                    }
                    if (foundFields.length > 0) {
                        const score = (foundFields.length / pattern.packageJsonFields.length) * pattern.weight * 0.4;
                        scores[libraryType] += score;
                        evidence[libraryType].push({
                            type: 'config',
                            description: `找到 package.json 字段: ${foundFields.join(', ')}`,
                            weight: score,
                            source: 'package.json'
                        });
                    }
                }
            }
        }
        catch (error) {
            this.logger.debug('检测 package.json 字段失败:', error);
        }
    }
    /**
     * 计算最终分数
     */
    calculateFinalScores(scores) {
        const finalScores = { ...scores };
        // 应用优先级权重
        for (const [type, priority] of Object.entries(LIBRARY_TYPE_PRIORITY)) {
            const libraryType = type;
            finalScores[libraryType] *= (priority / 10);
        }
        // 归一化分数
        const maxScore = Math.max(...Object.values(finalScores));
        if (maxScore > 0) {
            for (const type of Object.keys(finalScores)) {
                finalScores[type] = Math.min(finalScores[type] / maxScore, 1);
            }
        }
        return finalScores;
    }
    /**
     * 获取最佳匹配
     */
    getBestMatch(scores) {
        let bestType = exports.LibraryType.TYPESCRIPT;
        let bestScore = 0;
        for (const [type, score] of Object.entries(scores)) {
            if (score > bestScore) {
                bestScore = score;
                bestType = type;
            }
        }
        // 如果最高分数低于阈值，返回默认类型
        if (bestScore < this.options.confidence) {
            return exports.LibraryType.MIXED;
        }
        return bestType;
    }
    /**
     * 匹配依赖
     */
    matchDependency(pattern, dependencies) {
        // 支持版本范围匹配
        if (pattern.includes('@')) {
            const [name, version] = pattern.split('@');
            return !!(dependencies[name] && dependencies[name].includes(version));
        }
        return !!dependencies[pattern];
    }
}

/**
 * 性能监控器
 *
 * 负责监控构建过程的性能指标
 *
 * @author LDesign Team
 * @version 1.0.0
 */
/**
 * 性能监控器类
 */
class PerformanceMonitor extends require$$0$2.EventEmitter {
    constructor(options = {}) {
        super();
        this.sessions = new Map();
        this.options = {
            enabled: true,
            sampleInterval: 1000,
            maxSamples: 100,
            ...options
        };
        this.logger = options.logger || new Logger();
        this.globalStats = {
            totalBuilds: 0,
            totalTime: 0,
            averageTime: 0,
            cacheStats: {
                hits: 0,
                misses: 0,
                hitRate: 0,
                size: 0,
                entries: 0,
                timeSaved: 0
            }
        };
    }
    /**
     * 开始构建监控
     */
    startBuild(buildId) {
        if (!this.options.enabled)
            return;
        const session = {
            buildId,
            startTime: Date.now(),
            memorySnapshots: [],
            fileStats: {
                totalFiles: 0,
                filesByType: {},
                averageProcessingTime: 0,
                slowestFiles: [],
                processingRate: 0
            },
            errors: []
        };
        this.sessions.set(buildId, session);
        // 开始内存监控
        this.startMemoryMonitoring(buildId);
        this.logger.debug(`开始监控构建: ${buildId}`);
        this.emit('build:start', { buildId, timestamp: session.startTime });
    }
    /**
     * 结束构建监控
     */
    endBuild(buildId) {
        if (!this.options.enabled) {
            return this.createEmptyMetrics();
        }
        const session = this.sessions.get(buildId);
        if (!session) {
            this.logger.warn(`构建会话不存在: ${buildId}`);
            return this.createEmptyMetrics();
        }
        session.endTime = Date.now();
        const buildTime = session.endTime - session.startTime;
        // 更新全局统计
        this.globalStats.totalBuilds++;
        this.globalStats.totalTime += buildTime;
        this.globalStats.averageTime = this.globalStats.totalTime / this.globalStats.totalBuilds;
        // 生成性能指标
        const metrics = this.generateMetrics(session, buildTime);
        this.logger.info(`构建监控完成: ${buildId} (${buildTime}ms)`);
        this.emit('build:end', { buildId, metrics, timestamp: session.endTime });
        // 清理会话
        this.sessions.delete(buildId);
        return metrics;
    }
    /**
     * 记录错误
     */
    recordError(buildId, error) {
        const session = this.sessions.get(buildId);
        if (session) {
            session.errors.push(error);
        }
    }
    /**
     * 记录文件处理
     */
    recordFileProcessing(buildId, filePath, processingTime) {
        const session = this.sessions.get(buildId);
        if (!session)
            return;
        session.fileStats.totalFiles++;
        // 按类型统计
        const ext = this.getFileExtension(filePath);
        session.fileStats.filesByType[ext] = (session.fileStats.filesByType[ext] || 0) + 1;
        // 记录慢文件
        if (session.fileStats.slowestFiles.length < 10) {
            session.fileStats.slowestFiles.push({
                path: filePath,
                processingTime,
                size: 0, // TODO: 获取文件大小
                phases: []
            });
        }
        else {
            // 替换最快的文件
            const slowest = session.fileStats.slowestFiles;
            const minIndex = slowest.findIndex(f => f.processingTime === Math.min(...slowest.map(f => f.processingTime)));
            if (processingTime > slowest[minIndex].processingTime) {
                slowest[minIndex] = {
                    path: filePath,
                    processingTime,
                    size: 0,
                    phases: []
                };
            }
        }
    }
    /**
     * 记录缓存命中
     */
    recordCacheHit(saved, timeSaved = 0) {
        if (saved) {
            this.globalStats.cacheStats.hits++;
            this.globalStats.cacheStats.timeSaved += timeSaved;
        }
        else {
            this.globalStats.cacheStats.misses++;
        }
        const total = this.globalStats.cacheStats.hits + this.globalStats.cacheStats.misses;
        this.globalStats.cacheStats.hitRate = this.globalStats.cacheStats.hits / total;
    }
    /**
     * 获取性能报告
     */
    getPerformanceReport() {
        const timestamp = Date.now();
        return {
            timestamp,
            buildSummary: {
                bundler: 'rollup', // TODO: 从配置获取
                mode: 'production',
                entryCount: 1,
                outputCount: 1,
                totalSize: 0,
                buildTime: this.globalStats.averageTime
            },
            metrics: this.createEmptyMetrics(), // TODO: 实现
            recommendations: [],
            analysis: {
                bottlenecks: [],
                resourceAnalysis: {
                    cpuEfficiency: 0.8,
                    memoryEfficiency: 0.7,
                    ioEfficiency: 0.9,
                    wastePoints: []
                },
                cacheAnalysis: {
                    overallEfficiency: this.globalStats.cacheStats.hitRate,
                    strategyRecommendations: [],
                    configOptimizations: {}
                },
                parallelizationOpportunities: []
            }
        };
    }
    /**
     * 开始内存监控
     */
    startMemoryMonitoring(buildId) {
        const session = this.sessions.get(buildId);
        if (!session)
            return;
        const interval = setInterval(() => {
            if (!this.sessions.has(buildId)) {
                clearInterval(interval);
                return;
            }
            const memoryUsage = this.getCurrentMemoryUsage();
            session.memorySnapshots.push(memoryUsage);
            // 限制快照数量
            if (session.memorySnapshots.length > (this.options.maxSamples || 100)) {
                session.memorySnapshots.shift();
            }
        }, this.options.sampleInterval);
    }
    /**
     * 获取当前内存使用情况
     */
    getCurrentMemoryUsage() {
        const usage = process.memoryUsage();
        return {
            heapUsed: usage.heapUsed,
            heapTotal: usage.heapTotal,
            external: usage.external,
            rss: usage.rss,
            peak: Math.max(usage.heapUsed, usage.heapTotal),
            trend: []
        };
    }
    /**
     * 生成性能指标
     */
    generateMetrics(session, buildTime) {
        const memoryUsage = this.calculateMemoryUsage(session.memorySnapshots);
        return {
            buildTime,
            memoryUsage,
            cacheStats: this.globalStats.cacheStats,
            fileStats: session.fileStats,
            pluginPerformance: [], // TODO: 实现插件性能统计
            systemResources: this.getSystemResources()
        };
    }
    /**
     * 计算内存使用情况
     */
    calculateMemoryUsage(snapshots) {
        if (snapshots.length === 0) {
            return this.getCurrentMemoryUsage();
        }
        const latest = snapshots[snapshots.length - 1];
        const peak = Math.max(...snapshots.map(s => s.heapUsed));
        return {
            ...latest,
            peak,
            trend: snapshots.map((snapshot, index) => ({
                timestamp: Date.now() - (snapshots.length - index) * (this.options.sampleInterval || 1000),
                usage: snapshot.heapUsed,
                phase: 'building'
            }))
        };
    }
    /**
     * 获取系统资源使用情况
     */
    getSystemResources() {
        // TODO: 实现系统资源监控
        return {
            cpuUsage: 0,
            availableMemory: 0,
            diskUsage: {
                total: 0,
                used: 0,
                available: 0,
                usagePercent: 0
            }
        };
    }
    /**
     * 获取文件扩展名
     */
    getFileExtension(filePath) {
        const ext = filePath.split('.').pop();
        return ext ? `.${ext}` : 'unknown';
    }
    /**
     * 创建空的性能指标
     */
    createEmptyMetrics() {
        return {
            buildTime: 0,
            memoryUsage: this.getCurrentMemoryUsage(),
            cacheStats: this.globalStats.cacheStats,
            fileStats: {
                totalFiles: 0,
                filesByType: {},
                averageProcessingTime: 0,
                slowestFiles: [],
                processingRate: 0
            },
            pluginPerformance: [],
            systemResources: this.getSystemResources()
        };
    }
}

/**
 * 测试运行器
 *
 * 负责检测测试框架、安装依赖和运行测试用例
 * 支持多种测试框架的自动检测和运行
 *
 * @author LDesign Team
 * @version 1.0.0
 */
/**
 * 支持的测试框架配置
 */
const TEST_FRAMEWORKS = {
    vitest: {
        configFiles: ['vitest.config.ts', 'vitest.config.js', 'vite.config.ts', 'vite.config.js'],
        command: 'vitest',
        args: ['run', '--reporter=json'],
        dependencies: ['vitest']
    },
    jest: {
        configFiles: ['jest.config.js', 'jest.config.ts', 'jest.config.json'],
        command: 'jest',
        args: ['--json', '--coverage=false'],
        dependencies: ['jest']
    },
    mocha: {
        configFiles: ['.mocharc.json', '.mocharc.js', '.mocharc.yaml'],
        command: 'mocha',
        args: ['--reporter', 'json'],
        dependencies: ['mocha']
    }
};
/**
 * 包管理器配置
 */
const PACKAGE_MANAGERS = {
    npm: {
        installCommand: 'npm',
        installArgs: ['install'],
        runCommand: 'npx'
    },
    yarn: {
        installCommand: 'yarn',
        installArgs: ['install'],
        runCommand: 'yarn'
    },
    pnpm: {
        installCommand: 'pnpm',
        installArgs: ['install'],
        runCommand: 'pnpm'
    }
};
/**
 * 测试运行器实现
 */
class TestRunner {
    /**
     * 构造函数
     */
    constructor(options = {}) {
        this.logger = options.logger || new Logger({ level: 'info', prefix: 'TestRunner' });
        this.errorHandler = options.errorHandler || new ErrorHandler({ logger: this.logger });
    }
    /**
     * 运行测试
     */
    async runTests(context) {
        const startTime = Date.now();
        this.logger.info('开始运行测试...');
        try {
            // 检测测试框架
            const framework = await this.detectFramework(context.projectRoot);
            this.logger.info(`检测到测试框架: ${framework}`);
            // 获取框架配置
            const frameworkConfig = TEST_FRAMEWORKS[framework];
            if (!frameworkConfig) {
                throw new Error(`不支持的测试框架: ${framework}`);
            }
            // 构建测试命令
            const packageManager = await this.detectPackageManager(context.projectRoot);
            const runCommand = PACKAGE_MANAGERS[packageManager].runCommand;
            // 运行测试
            const testOutput = await this.executeTests(context.tempDir, runCommand, frameworkConfig.command, frameworkConfig.args, context.config.timeout || 60000);
            // 解析测试结果
            const result = await this.parseTestOutput(testOutput, framework);
            // 计算性能指标
            const duration = Date.now() - startTime;
            const performance = {
                setupTime: 0,
                executionTime: duration,
                teardownTime: 0,
                peakMemoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
                cpuUsage: 0
            };
            const testResult = {
                success: result.success ?? false,
                totalTests: result.totalTests ?? 0,
                passedTests: result.passedTests ?? 0,
                failedTests: result.failedTests ?? 0,
                skippedTests: result.skippedTests ?? 0,
                output: result.output ?? '',
                errors: result.errors ?? [],
                duration,
                performance
            };
            this.logger.success(`测试运行完成: ${testResult.passedTests}/${testResult.totalTests} 通过`);
            return testResult;
        }
        catch (error) {
            const testError = this.errorHandler.createError(exports.ErrorCode.BUILD_FAILED, '测试运行失败', { cause: error });
            // 返回失败结果
            return {
                success: false,
                totalTests: 0,
                passedTests: 0,
                failedTests: 0,
                skippedTests: 0,
                duration: Date.now() - startTime,
                output: error instanceof Error ? error.message : String(error),
                errors: [{
                        message: testError.message,
                        stack: testError.stack,
                        type: 'runtime'
                    }],
                performance: {
                    setupTime: 0,
                    executionTime: Date.now() - startTime,
                    teardownTime: 0,
                    peakMemoryUsage: 0,
                    cpuUsage: 0
                }
            };
        }
    }
    /**
     * 检测测试框架
     */
    async detectFramework(projectRoot) {
        this.logger.info('检测测试框架...');
        // 检查 package.json 中的依赖
        const packageJsonPath = path__namespace.join(projectRoot, 'package.json');
        if (await fs__namespace.pathExists(packageJsonPath)) {
            const packageJson = await fs__namespace.readJson(packageJsonPath);
            const allDeps = {
                ...packageJson.dependencies,
                ...packageJson.devDependencies
            };
            // 按优先级检测
            if (allDeps.vitest)
                return 'vitest';
            if (allDeps.jest)
                return 'jest';
            if (allDeps.mocha)
                return 'mocha';
        }
        // 检查配置文件
        for (const [framework, config] of Object.entries(TEST_FRAMEWORKS)) {
            for (const configFile of config.configFiles) {
                if (await fs__namespace.pathExists(path__namespace.join(projectRoot, configFile))) {
                    return framework;
                }
            }
        }
        // 默认返回 vitest
        this.logger.warn('未检测到测试框架，使用默认的 vitest');
        return 'vitest';
    }
    /**
     * 安装依赖
     */
    async installDependencies(context) {
        this.logger.info('安装依赖...');
        const packageManager = await this.detectPackageManager(context.projectRoot);
        const pmConfig = PACKAGE_MANAGERS[packageManager];
        try {
            await this.executeCommand(context.tempDir, pmConfig.installCommand, pmConfig.installArgs, context.config.environment?.installTimeout || 300000);
            this.logger.success('依赖安装完成');
        }
        catch (error) {
            throw this.errorHandler.createError(exports.ErrorCode.BUILD_FAILED, '依赖安装失败', { cause: error });
        }
    }
    /**
     * 清理资源
     */
    async dispose() {
        this.logger.info('TestRunner 资源清理完成');
    }
    /**
     * 检测包管理器
     */
    async detectPackageManager(projectRoot) {
        // 检查锁文件
        if (await fs__namespace.pathExists(path__namespace.join(projectRoot, 'pnpm-lock.yaml'))) {
            return 'pnpm';
        }
        if (await fs__namespace.pathExists(path__namespace.join(projectRoot, 'yarn.lock'))) {
            return 'yarn';
        }
        if (await fs__namespace.pathExists(path__namespace.join(projectRoot, 'package-lock.json'))) {
            return 'npm';
        }
        // 默认使用 npm
        return 'npm';
    }
    /**
     * 执行测试命令
     */
    async executeTests(cwd, runCommand, testCommand, args, timeout) {
        return new Promise((resolve, reject) => {
            const fullCommand = [testCommand, ...args];
            const child = child_process.spawn(runCommand, fullCommand, {
                cwd,
                stdio: 'pipe',
                shell: true
            });
            let stdout = '';
            let stderr = '';
            child.stdout?.on('data', (data) => {
                stdout += data.toString();
            });
            child.stderr?.on('data', (data) => {
                stderr += data.toString();
            });
            const timer = setTimeout(() => {
                child.kill('SIGTERM');
                reject(new Error(`测试超时 (${timeout}ms)`));
            }, timeout);
            child.on('close', (code) => {
                clearTimeout(timer);
                if (code === 0) {
                    resolve(stdout);
                }
                else {
                    reject(new Error(`测试失败 (退出码: ${code})\n${stderr}`));
                }
            });
            child.on('error', (error) => {
                clearTimeout(timer);
                reject(error);
            });
        });
    }
    /**
     * 执行命令
     */
    async executeCommand(cwd, command, args, timeout) {
        return new Promise((resolve, reject) => {
            const child = child_process.spawn(command, args, {
                cwd,
                stdio: 'pipe',
                shell: true
            });
            let stdout = '';
            let stderr = '';
            child.stdout?.on('data', (data) => {
                stdout += data.toString();
            });
            child.stderr?.on('data', (data) => {
                stderr += data.toString();
            });
            const timer = setTimeout(() => {
                child.kill('SIGTERM');
                reject(new Error(`命令超时 (${timeout}ms)`));
            }, timeout);
            child.on('close', (code) => {
                clearTimeout(timer);
                if (code === 0) {
                    resolve(stdout);
                }
                else {
                    reject(new Error(`命令失败 (退出码: ${code})\n${stderr}`));
                }
            });
            child.on('error', (error) => {
                clearTimeout(timer);
                reject(error);
            });
        });
    }
    /**
     * 解析测试输出
     */
    async parseTestOutput(output, framework) {
        try {
            // 尝试解析 JSON 输出
            const result = JSON.parse(output);
            // 根据不同框架解析结果
            switch (framework) {
                case 'vitest':
                    return this.parseVitestOutput(result);
                case 'jest':
                    return this.parseJestOutput(result);
                case 'mocha':
                    return this.parseMochaOutput(result);
                default:
                    return this.parseGenericOutput(result);
            }
        }
        catch (error) {
            // 如果无法解析 JSON，返回基本结果
            return {
                success: output.includes('PASS') || output.includes('✓'),
                totalTests: 0,
                passedTests: 0,
                failedTests: 0,
                skippedTests: 0,
                output,
                errors: []
            };
        }
    }
    /**
     * 解析 Vitest 输出
     */
    parseVitestOutput(result) {
        return {
            success: result.success || false,
            totalTests: result.numTotalTests || 0,
            passedTests: result.numPassedTests || 0,
            failedTests: result.numFailedTests || 0,
            skippedTests: result.numPendingTests || 0,
            output: JSON.stringify(result, null, 2),
            errors: this.extractVitestErrors(result)
        };
    }
    /**
     * 解析 Jest 输出
     */
    parseJestOutput(result) {
        return {
            success: result.success || false,
            totalTests: result.numTotalTests || 0,
            passedTests: result.numPassedTests || 0,
            failedTests: result.numFailedTests || 0,
            skippedTests: result.numPendingTests || 0,
            output: JSON.stringify(result, null, 2),
            errors: this.extractJestErrors(result)
        };
    }
    /**
     * 解析 Mocha 输出
     */
    parseMochaOutput(result) {
        const tests = result.tests || [];
        const passed = tests.filter((t) => t.state === 'passed').length;
        const failed = tests.filter((t) => t.state === 'failed').length;
        const pending = tests.filter((t) => t.pending).length;
        return {
            success: failed === 0,
            totalTests: tests.length,
            passedTests: passed,
            failedTests: failed,
            skippedTests: pending,
            output: JSON.stringify(result, null, 2),
            errors: this.extractMochaErrors(result)
        };
    }
    /**
     * 解析通用输出
     */
    parseGenericOutput(result) {
        return {
            success: result.success || false,
            totalTests: result.totalTests || 0,
            passedTests: result.passedTests || 0,
            failedTests: result.failedTests || 0,
            skippedTests: result.skippedTests || 0,
            output: JSON.stringify(result, null, 2),
            errors: []
        };
    }
    /**
     * 提取 Vitest 错误
     */
    extractVitestErrors(result) {
        const errors = [];
        // 简化实现，实际应该解析具体的错误信息
        if (result.testResults) {
            result.testResults.forEach((testResult) => {
                if (testResult.assertionResults) {
                    testResult.assertionResults.forEach((assertion) => {
                        if (assertion.status === 'failed') {
                            errors.push({
                                message: assertion.failureMessages?.[0] || '测试失败',
                                type: 'assertion',
                                file: testResult.name
                            });
                        }
                    });
                }
            });
        }
        return errors;
    }
    /**
     * 提取 Jest 错误
     */
    extractJestErrors(result) {
        const errors = [];
        // 简化实现
        if (result.testResults) {
            result.testResults.forEach((testResult) => {
                if (testResult.message) {
                    errors.push({
                        message: testResult.message,
                        type: 'assertion',
                        file: testResult.name
                    });
                }
            });
        }
        return errors;
    }
    /**
     * 提取 Mocha 错误
     */
    extractMochaErrors(result) {
        const errors = [];
        if (result.failures) {
            result.failures.forEach((failure) => {
                errors.push({
                    message: failure.err?.message || '测试失败',
                    stack: failure.err?.stack,
                    type: 'assertion',
                    file: failure.file
                });
            });
        }
        return errors;
    }
}

/**
 * 验证报告生成器
 *
 * 负责生成和输出验证报告
 * 支持多种格式的报告输出
 *
 * @author LDesign Team
 * @version 1.0.0
 */
/**
 * 验证报告生成器实现
 */
class ValidationReporter {
    /**
     * 构造函数
     */
    constructor(options = {}) {
        this.logger = options.logger || new Logger({ level: 'info', prefix: 'ValidationReporter' });
    }
    /**
     * 生成报告
     */
    async generateReport(result, _config) {
        this.logger.info('生成验证报告...');
        const report = {
            title: `构建验证报告 - ${result.validationId}`,
            summary: this.generateSummary(result),
            details: {
                fileResults: [],
                formatResults: [],
                typeResults: [],
                styleResults: []
            },
            recommendations: this.generateRecommendations(result),
            generatedAt: Date.now(),
            version: '1.0.0'
        };
        return report;
    }
    /**
     * 输出报告
     */
    async outputReport(report, config) {
        this.logger.info(`输出验证报告 (格式: ${config.format})`);
        switch (config.format) {
            case 'console':
                await this.outputConsoleReport(report, config);
                break;
            case 'json':
                await this.outputJsonReport(report, config);
                break;
            case 'html':
                await this.outputHtmlReport(report, config);
                break;
            case 'markdown':
                await this.outputMarkdownReport(report, config);
                break;
            default:
                await this.outputConsoleReport(report, config);
        }
    }
    /**
     * 生成摘要
     */
    generateSummary(result) {
        return {
            status: result.success ? 'passed' : 'failed',
            totalFiles: result.stats.totalFiles,
            passedFiles: result.success ? result.stats.totalFiles : 0,
            failedFiles: result.success ? 0 : result.stats.totalFiles,
            totalTests: result.testResult.totalTests,
            passedTests: result.testResult.passedTests,
            failedTests: result.testResult.failedTests,
            duration: result.duration
        };
    }
    /**
     * 生成建议
     */
    generateRecommendations(result) {
        const recommendations = [];
        // 如果验证失败，添加建议
        if (!result.success) {
            recommendations.push({
                type: 'error',
                title: '验证失败',
                description: '打包后的代码验证失败，请检查构建配置和测试用例',
                solution: '检查构建输出和测试日志，修复相关问题',
                priority: 'high'
            });
        }
        // 如果有错误，添加具体建议
        if (result.errors.length > 0) {
            recommendations.push({
                type: 'error',
                title: '发现错误',
                description: `发现 ${result.errors.length} 个错误`,
                solution: '查看详细错误信息并逐一修复',
                priority: 'high'
            });
        }
        // 如果有警告，添加建议
        if (result.warnings.length > 0) {
            recommendations.push({
                type: 'warning',
                title: '发现警告',
                description: `发现 ${result.warnings.length} 个警告`,
                solution: '查看警告信息并考虑优化',
                priority: 'medium'
            });
        }
        // 性能建议
        if (result.duration > 60000) {
            recommendations.push({
                type: 'optimization',
                title: '验证耗时较长',
                description: `验证耗时 ${Math.round(result.duration / 1000)}s，建议优化`,
                solution: '考虑减少测试用例数量或优化测试性能',
                priority: 'low'
            });
        }
        return recommendations;
    }
    /**
     * 输出控制台报告
     */
    async outputConsoleReport(report, config) {
        const { summary } = report;
        console.log('\n' + '='.repeat(60));
        console.log(`📋 ${report.title}`);
        console.log('='.repeat(60));
        // 状态
        const statusIcon = summary.status === 'passed' ? '✅' : '❌';
        const statusText = summary.status === 'passed' ? '通过' : '失败';
        console.log(`\n${statusIcon} 验证状态: ${statusText}`);
        // 统计信息
        console.log('\n📊 统计信息:');
        console.log(`   总测试数: ${summary.totalTests}`);
        console.log(`   通过测试: ${summary.passedTests}`);
        console.log(`   失败测试: ${summary.failedTests}`);
        console.log(`   验证耗时: ${Math.round(summary.duration / 1000)}s`);
        // 建议
        if (report.recommendations.length > 0) {
            console.log('\n💡 建议:');
            report.recommendations.forEach((rec, index) => {
                const icon = this.getRecommendationIcon(rec.type);
                console.log(`   ${index + 1}. ${icon} ${rec.title}`);
                if (config.verbose) {
                    console.log(`      ${rec.description}`);
                    if (rec.solution) {
                        console.log(`      解决方案: ${rec.solution}`);
                    }
                }
            });
        }
        console.log('\n' + '='.repeat(60) + '\n');
    }
    /**
     * 输出 JSON 报告
     */
    async outputJsonReport(report, config) {
        const outputPath = config.outputPath || 'validation-report.json';
        const reportJson = JSON.stringify(report, null, 2);
        await fs__namespace.ensureDir(path__namespace.dirname(outputPath));
        await fs__namespace.writeFile(outputPath, reportJson, 'utf8');
        this.logger.success(`JSON 报告已保存到: ${outputPath}`);
    }
    /**
     * 输出 HTML 报告
     */
    async outputHtmlReport(report, config) {
        const outputPath = config.outputPath || 'validation-report.html';
        const html = this.generateHtmlReport(report);
        await fs__namespace.ensureDir(path__namespace.dirname(outputPath));
        await fs__namespace.writeFile(outputPath, html, 'utf8');
        this.logger.success(`HTML 报告已保存到: ${outputPath}`);
    }
    /**
     * 输出 Markdown 报告
     */
    async outputMarkdownReport(report, config) {
        const outputPath = config.outputPath || 'validation-report.md';
        const markdown = this.generateMarkdownReport(report);
        await fs__namespace.ensureDir(path__namespace.dirname(outputPath));
        await fs__namespace.writeFile(outputPath, markdown, 'utf8');
        this.logger.success(`Markdown 报告已保存到: ${outputPath}`);
    }
    /**
     * 生成 HTML 报告
     */
    generateHtmlReport(report) {
        const { summary } = report;
        const statusClass = summary.status === 'passed' ? 'success' : 'error';
        return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; }
        .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
        .status { padding: 10px 20px; border-radius: 5px; margin: 20px 0; }
        .success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; color: #007bff; }
        .recommendations { margin-top: 30px; }
        .recommendation { margin: 10px 0; padding: 15px; border-left: 4px solid #007bff; background: #f8f9fa; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${report.title}</h1>
        <p>生成时间: ${new Date(report.generatedAt).toLocaleString()}</p>
    </div>

    <div class="status ${statusClass}">
        <h2>验证状态: ${summary.status === 'passed' ? '✅ 通过' : '❌ 失败'}</h2>
    </div>

    <div class="stats">
        <div class="stat-card">
            <div class="stat-number">${summary.totalTests}</div>
            <div>总测试数</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${summary.passedTests}</div>
            <div>通过测试</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${summary.failedTests}</div>
            <div>失败测试</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${Math.round(summary.duration / 1000)}s</div>
            <div>验证耗时</div>
        </div>
    </div>

    ${report.recommendations.length > 0 ? `
    <div class="recommendations">
        <h2>💡 建议</h2>
        ${report.recommendations.map(rec => `
        <div class="recommendation">
            <h3>${this.getRecommendationIcon(rec.type)} ${rec.title}</h3>
            <p>${rec.description}</p>
            ${rec.solution ? `<p><strong>解决方案:</strong> ${rec.solution}</p>` : ''}
        </div>
        `).join('')}
    </div>
    ` : ''}
</body>
</html>
    `.trim();
    }
    /**
     * 生成 Markdown 报告
     */
    generateMarkdownReport(report) {
        const { summary } = report;
        return `
# ${report.title}

**生成时间:** ${new Date(report.generatedAt).toLocaleString()}

## 验证状态

${summary.status === 'passed' ? '✅ **通过**' : '❌ **失败**'}

## 统计信息

| 项目 | 数量 |
|------|------|
| 总测试数 | ${summary.totalTests} |
| 通过测试 | ${summary.passedTests} |
| 失败测试 | ${summary.failedTests} |
| 验证耗时 | ${Math.round(summary.duration / 1000)}s |

${report.recommendations.length > 0 ? `
## 💡 建议

${report.recommendations.map((rec, index) => `
### ${index + 1}. ${this.getRecommendationIcon(rec.type)} ${rec.title}

${rec.description}

${rec.solution ? `**解决方案:** ${rec.solution}` : ''}
`).join('')}
` : ''}
    `.trim();
    }
    /**
     * 获取建议图标
     */
    getRecommendationIcon(type) {
        switch (type) {
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            case 'optimization': return '⚡';
            default: return '💡';
        }
    }
}

/**
 * 临时环境管理器
 *
 * 负责创建、管理和清理验证过程中的临时环境
 * 包括临时目录创建、文件复制、依赖替换等功能
 *
 * @author LDesign Team
 * @version 1.0.0
 */
/**
 * 临时环境管理器实现
 */
class TemporaryEnvironment {
    /**
     * 构造函数
     */
    constructor(options = {}) {
        /** 创建的临时目录列表 */
        this.tempDirs = new Set();
        this.logger = options.logger || new Logger({ level: 'info', prefix: 'TemporaryEnvironment' });
        this.errorHandler = options.errorHandler || new ErrorHandler({ logger: this.logger });
    }
    /**
     * 创建临时环境
     */
    async create(context) {
        this.logger.info('创建临时验证环境...');
        try {
            // 创建临时目录
            const tempDir = await this.createTempDirectory(context);
            context.tempDir = tempDir;
            this.tempDirs.add(tempDir);
            // 复制项目文件到临时目录
            await this.copyProjectFiles(context);
            // 修改 package.json 以使用构建产物
            await this.updatePackageJson(context);
            this.logger.success(`临时环境创建完成: ${tempDir}`);
        }
        catch (error) {
            throw this.errorHandler.createError(exports.ErrorCode.BUILD_FAILED, '创建临时环境失败', { cause: error });
        }
    }
    /**
     * 复制构建产物到临时环境
     */
    async copyBuildOutputs(context) {
        this.logger.info('复制构建产物到临时环境...');
        try {
            // 复制构建输出文件
            for (const output of context.buildResult.outputs) {
                // 假设输出文件在输出目录中
                const sourcePath = path__namespace.join(context.outputDir, output.fileName);
                const targetPath = path__namespace.join(context.tempDir, output.fileName);
                if (await fs__namespace.pathExists(sourcePath)) {
                    await fs__namespace.ensureDir(path__namespace.dirname(targetPath));
                    await fs__namespace.copy(sourcePath, targetPath);
                    this.logger.debug(`复制文件: ${sourcePath} -> ${targetPath}`);
                }
            }
            this.logger.success('构建产物复制完成');
        }
        catch (error) {
            throw this.errorHandler.createError(exports.ErrorCode.BUILD_FAILED, '复制构建产物失败', { cause: error });
        }
    }
    /**
     * 清理临时环境
     */
    async cleanup(context) {
        this.logger.info('清理临时环境...');
        try {
            if (context.tempDir && this.tempDirs.has(context.tempDir)) {
                await fs__namespace.remove(context.tempDir);
                this.tempDirs.delete(context.tempDir);
                this.logger.success(`临时目录已删除: ${context.tempDir}`);
            }
        }
        catch (error) {
            this.logger.warn(`清理临时目录失败: ${error}`);
        }
    }
    /**
     * 清理所有临时环境
     */
    async dispose() {
        this.logger.info('清理所有临时环境...');
        const cleanupPromises = Array.from(this.tempDirs).map(async (tempDir) => {
            try {
                await fs__namespace.remove(tempDir);
                this.logger.debug(`临时目录已删除: ${tempDir}`);
            }
            catch (error) {
                this.logger.warn(`清理临时目录失败: ${tempDir}, 错误: ${error}`);
            }
        });
        await Promise.all(cleanupPromises);
        this.tempDirs.clear();
        this.logger.success('所有临时环境清理完成');
    }
    /**
     * 创建临时目录
     */
    async createTempDirectory(context) {
        const tempDirName = `ldesign-builder-validation-${crypto.randomUUID().slice(0, 8)}`;
        // 优先使用配置中指定的临时目录
        const baseTempDir = context.config.environment?.tempDir
            ? path__namespace.resolve(context.projectRoot, context.config.environment.tempDir)
            : path__namespace.join(os__namespace.tmpdir(), 'ldesign-builder');
        const tempDir = path__namespace.join(baseTempDir, tempDirName);
        await fs__namespace.ensureDir(tempDir);
        this.logger.debug(`创建临时目录: ${tempDir}`);
        return tempDir;
    }
    /**
     * 复制项目文件到临时目录
     */
    async copyProjectFiles(context) {
        this.logger.info('复制项目文件到临时目录...');
        const filesToCopy = [
            'package.json',
            'package-lock.json',
            'yarn.lock',
            'pnpm-lock.yaml',
            'tsconfig.json',
            'vitest.config.ts',
            'vitest.config.js',
            'jest.config.js',
            'jest.config.ts',
            '.mocharc.json',
            '.mocharc.js'
        ];
        // 复制配置文件
        for (const file of filesToCopy) {
            const sourcePath = path__namespace.join(context.projectRoot, file);
            if (await fs__namespace.pathExists(sourcePath)) {
                const targetPath = path__namespace.join(context.tempDir, file);
                await fs__namespace.copy(sourcePath, targetPath);
                this.logger.debug(`复制配置文件: ${file}`);
            }
        }
        // 复制测试文件
        await this.copyTestFiles(context);
        // 复制源码文件（如果需要）
        await this.copySourceFiles(context);
    }
    /**
     * 复制测试文件
     */
    async copyTestFiles(context) {
        const testPatterns = Array.isArray(context.config.testPattern)
            ? context.config.testPattern
            : [context.config.testPattern || '**/*.test.{js,ts}'];
        const glob = await import('fast-glob');
        for (const pattern of testPatterns) {
            const testFiles = await glob.default(pattern, {
                cwd: context.projectRoot,
                absolute: false
            });
            for (const testFile of testFiles) {
                const sourcePath = path__namespace.join(context.projectRoot, testFile);
                const targetPath = path__namespace.join(context.tempDir, testFile);
                await fs__namespace.ensureDir(path__namespace.dirname(targetPath));
                await fs__namespace.copy(sourcePath, targetPath);
                this.logger.debug(`复制测试文件: ${testFile}`);
            }
        }
    }
    /**
     * 复制源码文件
     */
    async copySourceFiles(context) {
        // 如果测试需要访问源码，复制 src 目录
        const srcDir = path__namespace.join(context.projectRoot, 'src');
        if (await fs__namespace.pathExists(srcDir)) {
            const targetSrcDir = path__namespace.join(context.tempDir, 'src');
            await fs__namespace.copy(srcDir, targetSrcDir);
            this.logger.debug('复制源码目录: src');
        }
    }
    /**
     * 更新 package.json 以使用构建产物
     */
    async updatePackageJson(context) {
        const packageJsonPath = path__namespace.join(context.tempDir, 'package.json');
        if (!(await fs__namespace.pathExists(packageJsonPath))) {
            this.logger.warn('临时环境中未找到 package.json');
            return;
        }
        try {
            const packageJson = await fs__namespace.readJson(packageJsonPath);
            // 更新主入口点指向构建产物
            const outputs = context.buildResult.outputs;
            // 查找主要的输出文件（基于文件名模式）
            const esmOutput = outputs.find(o => o.fileName.includes('.js') && !o.fileName.includes('.cjs'));
            const cjsOutput = outputs.find(o => o.fileName.includes('.cjs'));
            const typesOutput = outputs.find(o => o.fileName.endsWith('.d.ts'));
            // 更新入口点
            if (esmOutput) {
                packageJson.module = esmOutput.fileName;
                packageJson.exports = packageJson.exports || {};
                packageJson.exports['.'] = packageJson.exports['.'] || {};
                packageJson.exports['.'].import = esmOutput.fileName;
            }
            if (cjsOutput) {
                packageJson.main = cjsOutput.fileName;
                packageJson.exports = packageJson.exports || {};
                packageJson.exports['.'] = packageJson.exports['.'] || {};
                packageJson.exports['.'].require = cjsOutput.fileName;
            }
            if (typesOutput) {
                packageJson.types = typesOutput.fileName;
                packageJson.typings = typesOutput.fileName;
            }
            // 保存更新后的 package.json
            await fs__namespace.writeJson(packageJsonPath, packageJson, { spaces: 2 });
            this.logger.success('package.json 已更新为使用构建产物');
        }
        catch (error) {
            this.logger.warn(`更新 package.json 失败: ${error}`);
        }
    }
    /**
     * 获取临时目录列表
     */
    getTempDirectories() {
        return Array.from(this.tempDirs);
    }
    /**
     * 检查临时目录是否存在
     */
    async exists(tempDir) {
        return fs__namespace.pathExists(tempDir);
    }
    /**
     * 获取临时目录大小
     */
    async getSize(tempDir) {
        try {
            const stats = await this.getDirectoryStats(tempDir);
            return stats.size;
        }
        catch (error) {
            return 0;
        }
    }
    /**
     * 获取目录统计信息
     */
    async getDirectoryStats(dirPath) {
        let totalSize = 0;
        let totalFiles = 0;
        const items = await fs__namespace.readdir(dirPath);
        for (const item of items) {
            const itemPath = path__namespace.join(dirPath, item);
            const stats = await fs__namespace.stat(itemPath);
            if (stats.isDirectory()) {
                const subStats = await this.getDirectoryStats(itemPath);
                totalSize += subStats.size;
                totalFiles += subStats.files;
            }
            else {
                totalSize += stats.size;
                totalFiles += 1;
            }
        }
        return { size: totalSize, files: totalFiles };
    }
}

/**
 * 打包后验证器
 *
 * 负责在构建完成后验证打包产物的正确性
 * 通过运行测试用例确保打包前后功能一致性
 *
 * @author LDesign Team
 * @version 1.0.0
 */
/**
 * 默认验证配置
 */
const DEFAULT_VALIDATION_CONFIG = {
    enabled: true,
    testFramework: 'auto',
    testPattern: ['**/*.test.{js,ts}', '**/*.spec.{js,ts}'],
    timeout: 60000,
    failOnError: true,
    environment: {
        tempDir: '.validation-temp',
        keepTempFiles: false,
        env: {},
        nodeVersion: process.version,
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
};
/**
 * 打包后验证器实现
 */
class PostBuildValidator extends require$$0$2.EventEmitter {
    /**
     * 构造函数
     */
    constructor(config = {}, options = {}) {
        super();
        // 合并配置
        this.config = this.mergeConfig(DEFAULT_VALIDATION_CONFIG, config);
        // 初始化依赖
        this.logger = options.logger || new Logger({ level: 'info', prefix: 'PostBuildValidator' });
        this.errorHandler = options.errorHandler || new ErrorHandler({ logger: this.logger });
        // 初始化组件
        this.testRunner = new TestRunner({
            logger: this.logger,
            errorHandler: this.errorHandler
        });
        this.reporter = new ValidationReporter({
            logger: this.logger
        });
        this.tempEnvironment = new TemporaryEnvironment({
            logger: this.logger,
            errorHandler: this.errorHandler
        });
        this.logger.info('PostBuildValidator 初始化完成');
    }
    /**
     * 执行验证
     */
    async validate(context) {
        const validationId = crypto.randomUUID();
        const startTime = Date.now();
        this.logger.info(`开始打包后验证 (ID: ${validationId})`);
        // 发出验证开始事件
        this.emit('validation:start', { context, validationId, startTime });
        try {
            // 执行验证前钩子
            if (this.config.hooks?.beforeValidation) {
                await this.config.hooks.beforeValidation(context);
            }
            // 创建验证统计对象
            const stats = {
                startTime,
                endTime: 0,
                totalDuration: 0,
                setupDuration: 0,
                testDuration: 0,
                reportDuration: 0,
                cleanupDuration: 0,
                totalFiles: 0,
                totalTests: 0,
                peakMemoryUsage: 0
            };
            // 1. 准备验证环境
            const setupStartTime = Date.now();
            await this.setupValidationEnvironment(context);
            stats.setupDuration = Date.now() - setupStartTime;
            // 执行环境准备后钩子
            if (this.config.hooks?.afterEnvironmentSetup) {
                await this.config.hooks.afterEnvironmentSetup(context);
            }
            // 2. 运行测试
            const testStartTime = Date.now();
            const testResult = await this.runValidationTests(context);
            stats.testDuration = Date.now() - testStartTime;
            stats.totalTests = testResult.totalTests;
            // 3. 生成验证结果
            const endTime = Date.now();
            stats.endTime = endTime;
            stats.totalDuration = endTime - startTime;
            const validationResult = {
                success: testResult.success,
                duration: stats.totalDuration,
                testResult,
                report: await this.generateValidationReport(context, testResult, stats),
                errors: [],
                warnings: [],
                stats,
                timestamp: endTime,
                validationId
            };
            // 4. 生成报告
            const reportStartTime = Date.now();
            await this.outputValidationReport(validationResult);
            stats.reportDuration = Date.now() - reportStartTime;
            // 5. 清理环境
            const cleanupStartTime = Date.now();
            await this.cleanupValidationEnvironment(context);
            stats.cleanupDuration = Date.now() - cleanupStartTime;
            // 执行验证完成后钩子
            if (this.config.hooks?.afterValidation) {
                await this.config.hooks.afterValidation(context, validationResult);
            }
            // 发出验证完成事件
            this.emit('validation:complete', { context, result: validationResult });
            this.logger.success(`验证完成 (ID: ${validationId}), 耗时: ${stats.totalDuration}ms`);
            return validationResult;
        }
        catch (error) {
            const validationError = this.errorHandler.createError(exports.ErrorCode.BUILD_FAILED, '验证过程失败', { cause: error });
            // 执行验证失败钩子
            if (this.config.hooks?.onValidationError) {
                await this.config.hooks.onValidationError(context, validationError);
            }
            // 发出验证失败事件
            this.emit('validation:error', { context, error: validationError, validationId });
            // 清理环境
            try {
                await this.cleanupValidationEnvironment(context);
            }
            catch (cleanupError) {
                this.logger.warn('清理验证环境时出错:', cleanupError);
            }
            throw validationError;
        }
    }
    /**
     * 设置配置
     */
    setConfig(config) {
        this.config = this.mergeConfig(this.config, config);
        this.logger.info('验证配置已更新');
    }
    /**
     * 获取配置
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * 清理资源
     */
    async dispose() {
        this.logger.info('正在清理 PostBuildValidator 资源...');
        // 清理组件
        await this.testRunner.dispose();
        await this.tempEnvironment.dispose();
        // 移除所有事件监听器
        this.removeAllListeners();
        this.logger.info('PostBuildValidator 资源清理完成');
    }
    /**
     * 准备验证环境
     */
    async setupValidationEnvironment(context) {
        this.logger.info('准备验证环境...');
        // 创建临时目录
        await this.tempEnvironment.create(context);
        // 复制构建产物到临时环境
        await this.tempEnvironment.copyBuildOutputs(context);
        // 安装依赖（如果需要）
        if (this.config.environment?.installDependencies) {
            await this.testRunner.installDependencies(context);
        }
        this.logger.success('验证环境准备完成');
    }
    /**
     * 运行验证测试
     */
    async runValidationTests(context) {
        this.logger.info('运行验证测试...');
        // 执行测试前钩子
        if (this.config.hooks?.beforeTestRun) {
            await this.config.hooks.beforeTestRun(context);
        }
        // 运行测试
        const testResult = await this.testRunner.runTests(context);
        // 执行测试后钩子
        if (this.config.hooks?.afterTestRun) {
            await this.config.hooks.afterTestRun(context, testResult);
        }
        this.logger.success(`测试运行完成: ${testResult.passedTests}/${testResult.totalTests} 通过`);
        return testResult;
    }
    /**
     * 生成验证报告
     */
    async generateValidationReport(context, testResult, stats) {
        this.logger.info('生成验证报告...');
        const summary = {
            status: testResult.success ? 'passed' : 'failed',
            totalFiles: stats.totalFiles,
            passedFiles: stats.totalFiles, // 简化实现
            failedFiles: 0,
            totalTests: testResult.totalTests,
            passedTests: testResult.passedTests,
            failedTests: testResult.failedTests,
            duration: stats.totalDuration
        };
        const details = {
            fileResults: [],
            formatResults: [],
            typeResults: [],
            styleResults: []
        };
        const report = {
            title: `构建验证报告 - ${context.buildContext.buildId}`,
            summary,
            details,
            recommendations: [],
            generatedAt: Date.now(),
            version: '1.0.0'
        };
        return report;
    }
    /**
     * 输出验证报告
     */
    async outputValidationReport(result) {
        if (this.config.reporting) {
            await this.reporter.outputReport(result.report, this.config.reporting);
        }
    }
    /**
     * 清理验证环境
     */
    async cleanupValidationEnvironment(context) {
        this.logger.info('清理验证环境...');
        if (!this.config.environment?.keepTempFiles) {
            await this.tempEnvironment.cleanup(context);
        }
        this.logger.success('验证环境清理完成');
    }
    /**
     * 合并配置
     */
    mergeConfig(base, override) {
        return {
            ...base,
            ...override,
            environment: {
                ...base.environment,
                ...override.environment
            },
            reporting: {
                ...base.reporting,
                ...override.reporting
            },
            hooks: {
                ...base.hooks,
                ...override.hooks
            },
            scope: {
                ...base.scope,
                ...override.scope
            }
        };
    }
}

/**
 * Rollup 适配器
 *
 * 提供 Rollup 打包器的适配实现
 *
 * @author LDesign Team
 * @version 1.0.0
 */
/**
 * Rollup 适配器类
 */
class RollupAdapter {
    constructor(options = {}) {
        this.name = 'rollup';
        this.logger = options.logger || new Logger();
        this.performanceMonitor = options.performanceMonitor;
        // 初始化时假设可用，在实际使用时再检查
        this.version = 'unknown';
        this.available = true;
        this.logger.debug('Rollup 适配器初始化');
    }
    /**
     * 执行构建
     */
    async build(config) {
        if (!this.available) {
            throw new BuilderError(exports.ErrorCode.ADAPTER_NOT_AVAILABLE, 'Rollup 适配器不可用');
        }
        try {
            const rollup = await this.loadRollup();
            const rollupConfig = await this.transformConfig(config);
            this.logger.info('开始 Rollup 构建...');
            const startTime = Date.now();
            let results = [];
            // 如果有多个配置，分别构建每个配置
            if (this.multiConfigs && this.multiConfigs.length > 1) {
                for (const singleConfig of this.multiConfigs) {
                    // 创建 bundle
                    const bundle = await rollup.rollup(singleConfig);
                    // 生成输出
                    const { output } = await bundle.generate(singleConfig.output);
                    results.push(...output);
                    // 写入文件
                    await bundle.write(singleConfig.output);
                    await bundle.close();
                }
            }
            else {
                // 单配置构建
                const bundle = await rollup.rollup(rollupConfig);
                // 生成输出
                const outputs = Array.isArray(rollupConfig.output)
                    ? rollupConfig.output
                    : [rollupConfig.output];
                for (const outputConfig of outputs) {
                    const { output } = await bundle.generate(outputConfig);
                    results.push(...output);
                }
                // 写入文件
                for (const outputConfig of outputs) {
                    await bundle.write(outputConfig);
                }
                await bundle.close();
            }
            const duration = Date.now() - startTime;
            // 构建结果
            const buildResult = {
                success: true,
                outputs: results.map(chunk => ({
                    fileName: chunk.fileName,
                    size: chunk.type === 'chunk' ? chunk.code.length : chunk.source.length,
                    source: chunk.type === 'chunk' ? chunk.code : chunk.source,
                    type: chunk.type,
                    format: 'esm', // TODO: 从配置获取
                    gzipSize: 0 // TODO: 计算 gzip 大小
                })),
                duration,
                stats: {
                    buildTime: duration,
                    fileCount: results.length,
                    totalSize: {
                        raw: results.reduce((total, chunk) => total + (chunk.type === 'chunk' ? chunk.code.length : chunk.source.length), 0),
                        gzip: 0,
                        brotli: 0,
                        byType: {},
                        byFormat: { esm: 0, cjs: 0, umd: 0, iife: 0, css: 0 },
                        largest: { file: '', size: 0 },
                        fileCount: results.length
                    },
                    byFormat: {
                        esm: {
                            fileCount: results.length,
                            size: {
                                raw: results.reduce((total, chunk) => total + (chunk.type === 'chunk' ? chunk.code.length : chunk.source.length), 0),
                                gzip: 0,
                                brotli: 0,
                                byType: {},
                                byFormat: { esm: 0, cjs: 0, umd: 0, iife: 0, css: 0 },
                                largest: { file: '', size: 0 },
                                fileCount: results.length
                            }
                        },
                        cjs: { fileCount: 0, size: { raw: 0, gzip: 0, brotli: 0, byType: {}, byFormat: { esm: 0, cjs: 0, umd: 0, iife: 0, css: 0 }, largest: { file: '', size: 0 }, fileCount: 0 } },
                        umd: { fileCount: 0, size: { raw: 0, gzip: 0, brotli: 0, byType: {}, byFormat: { esm: 0, cjs: 0, umd: 0, iife: 0, css: 0 }, largest: { file: '', size: 0 }, fileCount: 0 } },
                        iife: { fileCount: 0, size: { raw: 0, gzip: 0, brotli: 0, byType: {}, byFormat: { esm: 0, cjs: 0, umd: 0, iife: 0, css: 0 }, largest: { file: '', size: 0 }, fileCount: 0 } },
                        css: { fileCount: 0, size: { raw: 0, gzip: 0, brotli: 0, byType: {}, byFormat: { esm: 0, cjs: 0, umd: 0, iife: 0, css: 0 }, largest: { file: '', size: 0 }, fileCount: 0 } }
                    },
                    modules: {
                        total: 0,
                        external: 0,
                        internal: 0,
                        largest: {
                            id: '',
                            size: 0,
                            renderedLength: 0,
                            originalLength: 0,
                            isEntry: false,
                            isExternal: false,
                            importedIds: [],
                            dynamicallyImportedIds: [],
                            importers: [],
                            dynamicImporters: []
                        }
                    },
                    dependencies: {
                        total: 0,
                        external: [],
                        bundled: [],
                        circular: []
                    }
                },
                performance: this.getPerformanceMetrics(),
                warnings: [],
                errors: [],
                buildId: `rollup-${Date.now()}`,
                timestamp: Date.now(),
                bundler: 'rollup',
                mode: 'production'
            };
            this.logger.success(`Rollup 构建完成 (${duration}ms)`);
            return buildResult;
        }
        catch (error) {
            throw new BuilderError(exports.ErrorCode.BUILD_FAILED, `Rollup 构建失败: ${error.message}`, { cause: error });
        }
    }
    /**
     * 启动监听模式
     */
    async watch(config) {
        if (!this.available) {
            throw new BuilderError(exports.ErrorCode.ADAPTER_NOT_AVAILABLE, 'Rollup 适配器不可用');
        }
        try {
            const rollup = await this.loadRollup();
            const rollupConfig = await this.transformConfig(config);
            // 添加监听配置
            const watchOptions = config.watch || {};
            const watchConfig = {
                ...rollupConfig,
                watch: {
                    include: watchOptions.include || ['src/**/*'],
                    exclude: watchOptions.exclude || ['node_modules/**/*'],
                    ...(typeof watchOptions === 'object' ? watchOptions : {})
                }
            };
            const watcher = rollup.watch(watchConfig);
            // 创建统一的监听器接口
            const buildWatcher = {
                patterns: watchConfig.watch.include,
                watching: true,
                async close() {
                    await watcher.close();
                },
                on(event, listener) {
                    watcher.on(event, listener);
                    return this;
                },
                off(event, listener) {
                    watcher.off(event, listener);
                    return this;
                },
                emit(_event, ..._args) {
                    return false; // Rollup watcher 不支持 emit
                }
            };
            this.logger.info('Rollup 监听模式已启动');
            return buildWatcher;
        }
        catch (error) {
            throw new BuilderError(exports.ErrorCode.BUILD_FAILED, `启动 Rollup 监听模式失败: ${error.message}`, { cause: error });
        }
    }
    /**
     * 转换配置
     */
    async transformConfig(config) {
        // 转换为 Rollup 配置格式
        const basePlugins = await this.getBasePlugins(config);
        const rollupConfig = {
            input: config.input,
            external: config.external
        };
        // 转换输出配置
        if (config.output) {
            const outputConfig = config.output;
            // 处理多格式输出
            if (Array.isArray(outputConfig.format)) {
                // 检查是否为多入口构建
                const isMultiEntry = this.isMultiEntryBuild(config.input);
                // 处理 UMD 格式的特殊逻辑
                let formats = outputConfig.format;
                let umdConfig = null;
                if (isMultiEntry) {
                    const originalFormats = [...formats];
                    // 检查是否有 UMD 配置且强制启用
                    const hasUMD = formats.includes('umd');
                    const forceUMD = config.umd?.forceMultiEntry || false;
                    const umdEnabled = config.umd?.enabled;
                    this.logger.info(`多入口项目UMD检查: hasUMD=${hasUMD}, forceUMD=${forceUMD}, umdEnabled=${umdEnabled}`);
                    if (hasUMD && forceUMD) {
                        // 保留 UMD 格式，但使用特殊的入口配置
                        umdConfig = await this.createUMDConfig(config);
                        this.logger.info('多入口项目强制启用 UMD 构建');
                    }
                    else if (hasUMD) {
                        // 正常情况下过滤 UMD 格式
                        formats = formats.filter(format => format !== 'umd' && format !== 'iife');
                        // 但如果启用了 UMD 配置，仍然创建 UMD 构建
                        if (config.umd?.enabled !== false) {
                            umdConfig = await this.createUMDConfig(config);
                            this.logger.info('为多入口项目创建独立的 UMD 构建');
                        }
                    }
                    else {
                        // 即使没有在format中指定umd，也检查umd配置
                        if (config.umd?.enabled) {
                            umdConfig = await this.createUMDConfig(config);
                            this.logger.info('根据UMD配置为多入口项目创建 UMD 构建');
                        }
                        formats = formats.filter(format => format !== 'umd' && format !== 'iife');
                    }
                    // 如果过滤了格式，记录警告
                    const filteredFormats = originalFormats.filter(format => !formats.includes(format));
                    if (filteredFormats.length > 0 && !umdConfig) {
                        this.logger.warn(`多入口构建不支持 ${filteredFormats.join(', ')} 格式，已自动过滤`);
                    }
                }
                else {
                    // 单入口项目，检查是否需要创建 UMD 构建
                    if (formats.includes('umd') || config.umd?.enabled) {
                        umdConfig = await this.createUMDConfig(config);
                    }
                }
                // 为多格式输出创建多个配置
                const configs = [];
                for (const format of formats) {
                    const mapped = this.mapFormat(format);
                    const isESM = format === 'esm';
                    const isCJS = format === 'cjs';
                    const dir = isESM ? 'es' : isCJS ? 'lib' : 'dist';
                    const entryFileNames = isESM
                        ? '[name].js'
                        : isCJS
                            ? '[name].cjs'
                            : '[name].umd.js';
                    const chunkFileNames = entryFileNames;
                    // 为每个格式创建独立的插件配置
                    const formatPlugins = await this.transformPluginsForFormat(config.plugins || [], dir);
                    configs.push({
                        input: config.input,
                        external: config.external,
                        plugins: [...basePlugins, ...formatPlugins],
                        output: {
                            dir,
                            format: mapped,
                            name: outputConfig.name,
                            sourcemap: outputConfig.sourcemap,
                            globals: outputConfig.globals,
                            entryFileNames,
                            chunkFileNames,
                            exports: outputConfig.exports ?? 'auto',
                            preserveModules: isESM || isCJS,
                            preserveModulesRoot: (isESM || isCJS) ? 'src' : undefined
                        },
                        treeshake: config.treeshake
                    });
                }
                // 如果有 UMD 配置，添加到配置列表中
                if (umdConfig) {
                    configs.push(umdConfig);
                }
                // 返回第一个配置，但保存所有配置供后续使用
                this.multiConfigs = configs;
                return configs[0];
            }
            else {
                const format = outputConfig.format;
                const mapped = this.mapFormat(format);
                const isESM = format === 'esm';
                const isCJS = format === 'cjs';
                const dir = isESM ? 'es' : isCJS ? 'lib' : 'dist';
                const entryFileNames = isESM
                    ? '[name].js'
                    : isCJS
                        ? '[name].cjs'
                        : '[name].umd.js';
                const chunkFileNames = entryFileNames;
                // 为单格式输出创建插件配置
                const userPlugins = await this.transformPluginsForFormat(config.plugins || [], dir);
                rollupConfig.plugins = [...basePlugins, ...userPlugins];
                rollupConfig.output = {
                    dir,
                    format: mapped,
                    name: outputConfig.name,
                    sourcemap: outputConfig.sourcemap,
                    globals: outputConfig.globals,
                    entryFileNames,
                    chunkFileNames,
                    exports: outputConfig.exports ?? 'auto',
                    preserveModules: isESM || isCJS,
                    preserveModulesRoot: (isESM || isCJS) ? 'src' : undefined
                };
            }
        }
        // 转换其他选项
        if (config.treeshake !== undefined) {
            rollupConfig.treeshake = config.treeshake;
        }
        return rollupConfig;
    }
    /**
     * 转换插件
     */
    async transformPlugins(plugins) {
        const transformedPlugins = [];
        for (const plugin of plugins) {
            try {
                // 如果插件有 plugin 函数，调用它来获取实际插件
                if (plugin.plugin && typeof plugin.plugin === 'function') {
                    const actualPlugin = await plugin.plugin();
                    transformedPlugins.push(actualPlugin);
                }
                // 如果插件有 rollup 特定配置，使用它
                else if (plugin.rollup) {
                    transformedPlugins.push({ ...plugin, ...plugin.rollup });
                }
                // 直接使用插件
                else {
                    transformedPlugins.push(plugin);
                }
            }
            catch (error) {
                this.logger.warn(`插件 ${plugin.name || 'unknown'} 加载失败:`, error.message);
            }
        }
        return transformedPlugins;
    }
    /**
     * 为特定格式转换插件，动态设置TypeScript插件的declarationDir
     */
    async transformPluginsForFormat(plugins, outputDir) {
        const transformedPlugins = [];
        for (const plugin of plugins) {
            try {
                // 如果插件有 plugin 函数，调用它来获取实际插件
                if (plugin.plugin && typeof plugin.plugin === 'function') {
                    // 如果是TypeScript插件，需要特殊处理
                    if (plugin.name === 'typescript') {
                        // 重新创建TypeScript插件，设置正确的declarationDir
                        const typescript = await import('@rollup/plugin-typescript');
                        // 获取原始的TypeScript选项
                        const originalPlugin = await plugin.plugin();
                        let originalOptions = {};
                        // 尝试从原始插件中提取选项
                        if (originalPlugin && typeof originalPlugin === 'object') {
                            // 从插件的内部状态中获取选项（这是一个hack，但是必要的）
                            originalOptions = originalPlugin.options || {};
                        }
                        // 创建新的TypeScript插件，覆盖declarationDir和outDir
                        const newPlugin = typescript.default({
                            ...originalOptions,
                            declaration: true,
                            declarationDir: outputDir,
                            outDir: outputDir
                        });
                        transformedPlugins.push(newPlugin);
                    }
                    else {
                        // 其他插件正常处理
                        const actualPlugin = await plugin.plugin();
                        transformedPlugins.push(actualPlugin);
                    }
                }
                // 如果插件有 rollup 特定配置，使用它
                else if (plugin.rollup) {
                    transformedPlugins.push({ ...plugin, ...plugin.rollup });
                }
                // 直接使用插件
                else {
                    transformedPlugins.push(plugin);
                }
            }
            catch (error) {
                this.logger.warn(`插件 ${plugin.name || 'unknown'} 加载失败:`, error.message);
            }
        }
        return transformedPlugins;
    }
    /**
     * 检查功能支持
     */
    supportsFeature(feature) {
        // Rollup 支持的功能
        const supportedFeatures = [
            'treeshaking',
            'code-splitting',
            'dynamic-import',
            'sourcemap',
            'plugin-system',
            'config-file',
            'cache-support'
        ];
        return supportedFeatures.includes(feature);
    }
    /**
     * 获取功能支持映射
     */
    getFeatureSupport() {
        return {
            treeshaking: true,
            'code-splitting': true,
            'dynamic-import': true,
            'worker-support': false,
            'css-bundling': false,
            'asset-processing': true,
            sourcemap: true,
            minification: false,
            'hot-reload': false,
            'module-federation': false,
            'incremental-build': false,
            'parallel-build': false,
            'cache-support': true,
            'plugin-system': true,
            'config-file': true
        };
    }
    /**
     * 获取性能指标
     */
    getPerformanceMetrics() {
        if (this.performanceMonitor && typeof this.performanceMonitor.getMetrics === 'function') {
            return this.performanceMonitor.getMetrics();
        }
        // 返回默认指标
        return {
            buildTime: 0,
            memoryUsage: {
                heapUsed: process.memoryUsage().heapUsed,
                heapTotal: process.memoryUsage().heapTotal,
                external: process.memoryUsage().external,
                rss: process.memoryUsage().rss,
                peak: 0,
                trend: []
            },
            cacheStats: {
                hits: 0,
                misses: 0,
                hitRate: 0,
                size: 0,
                entries: 0,
                timeSaved: 0
            },
            fileStats: {
                totalFiles: 0,
                filesByType: {},
                averageProcessingTime: 0,
                slowestFiles: [],
                processingRate: 0
            },
            pluginPerformance: [],
            systemResources: {
                cpuUsage: 0,
                availableMemory: 0,
                diskUsage: {
                    total: 0,
                    used: 0,
                    available: 0,
                    usagePercent: 0
                }
            }
        };
    }
    /**
     * 清理资源
     */
    async dispose() {
        // Rollup 适配器没有需要清理的资源
    }
    /**
     * 加载 Rollup
     */
    async loadRollup() {
        try {
            // 使用动态 import 加载 Rollup
            return await import('rollup');
        }
        catch (error) {
            throw new Error('Rollup 未安装，请运行: npm install rollup --save-dev');
        }
    }
    /**
     * 获取基础插件（内置）
     * - node-resolve: 解决第三方包解析，并优先浏览器分支
     * - commonjs: 兼容 CommonJS 包
     * - json: 允许 import JSON（如某些包内的 package.json 或配置 JSON）
     */
    async getBasePlugins(config) {
        try {
            const { nodeResolve } = await import('@rollup/plugin-node-resolve');
            const commonjs = (await import('@rollup/plugin-commonjs')).default;
            const json = (await import('@rollup/plugin-json')).default;
            const resolvePlugin = nodeResolve({
                browser: true,
                preferBuiltins: false,
                extensions: ['.mjs', '.js', '.json', '.ts', '.tsx']
            });
            const commonjsPlugin = commonjs({
                include: /node_modules/,
                ignoreDynamicRequires: false
            });
            const jsonPlugin = json();
            const plugins = [
                resolvePlugin,
                commonjsPlugin,
                jsonPlugin
            ];
            // 添加 Babel 插件（如果启用）
            const babelPlugin = await this.getBabelPlugin(config);
            if (babelPlugin) {
                plugins.push(babelPlugin);
            }
            return plugins;
        }
        catch (error) {
            this.logger.warn('基础插件加载失败，将尝试继续构建', error.message);
            return [];
        }
    }
    /**
     * 获取 Babel 插件
     */
    async getBabelPlugin(config) {
        const babelConfig = config.babel;
        if (!babelConfig?.enabled) {
            return null;
        }
        try {
            const { getBabelOutputPlugin } = await import('@rollup/plugin-babel');
            const babelOptions = {
                babelHelpers: babelConfig.runtime ? 'runtime' : 'bundled',
                exclude: babelConfig.exclude || /node_modules/,
                include: babelConfig.include,
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
                presets: babelConfig.presets || [],
                plugins: babelConfig.plugins || []
            };
            // 添加默认预设（如果没有指定）
            if (babelOptions.presets.length === 0) {
                babelOptions.presets = [
                    ['@babel/preset-env', {
                            targets: babelConfig.targets || 'defaults',
                            useBuiltIns: babelConfig.polyfill === 'usage' ? 'usage' : false,
                            corejs: babelConfig.polyfill ? 3 : false
                        }]
                ];
            }
            // 添加运行时插件（如果启用）
            if (babelConfig.runtime && !babelOptions.plugins.some((p) => (Array.isArray(p) ? p[0] : p).includes('@babel/plugin-transform-runtime'))) {
                babelOptions.plugins.push(['@babel/plugin-transform-runtime', {
                        corejs: false,
                        helpers: true,
                        regenerator: true,
                        useESModules: true
                    }]);
            }
            // 使用配置文件（如果指定）
            if (babelConfig.configFile !== false) {
                babelOptions.configFile = babelConfig.configFile;
            }
            if (babelConfig.babelrc !== false) {
                babelOptions.babelrc = babelConfig.babelrc;
            }
            return getBabelOutputPlugin(babelOptions);
        }
        catch (error) {
            this.logger.warn('Babel 插件加载失败，将跳过 Babel 转换', error.message);
            return null;
        }
    }
    /**
     * 映射输出格式
     */
    mapFormat(format) {
        if (typeof format === 'string') {
            const formatMap = {
                esm: 'es',
                cjs: 'cjs',
                umd: 'umd',
                iife: 'iife'
            };
            return formatMap[format] || format;
        }
        return 'es';
    }
    /**
     * 检查是否为多入口构建
     */
    isMultiEntryBuild(input) {
        // 如果input是数组，则为多入口
        if (Array.isArray(input)) {
            return input.length > 1;
        }
        // 如果input是对象，则为多入口
        if (typeof input === 'object' && input !== null) {
            return Object.keys(input).length > 1;
        }
        // 如果input是字符串且包含glob模式，可能为多入口
        if (typeof input === 'string') {
            // 检查是否包含glob通配符
            return input.includes('*') || input.includes('?') || input.includes('[');
        }
        return false;
    }
    /**
     * 创建 UMD 配置
     */
    async createUMDConfig(config) {
        const umdConfig = config.umd || {};
        const outputConfig = config.output || {};
        // 确定 UMD 入口文件
        let umdEntry = umdConfig.entry || 'src/index.ts';
        // 如果入口文件不存在，尝试其他常见的入口文件
        const fs = await import('fs');
        const path = await import('path');
        const possibleEntries = [
            umdEntry,
            'src/index.ts',
            'src/index.js',
            'src/main.ts',
            'src/main.js',
            'index.ts',
            'index.js'
        ];
        for (const entry of possibleEntries) {
            if (fs.existsSync(path.resolve(process.cwd(), entry))) {
                umdEntry = entry;
                break;
            }
        }
        // 确定 UMD 全局变量名
        let umdName = umdConfig.name || outputConfig.name;
        if (!umdName) {
            // 尝试从 package.json 推断
            try {
                const packageJson = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8'));
                umdName = this.generateUMDName(packageJson.name);
            }
            catch {
                umdName = 'MyLibrary';
            }
        }
        // 创建 UMD 构建配置
        const basePlugins = await this.getBasePlugins(config);
        const userPlugins = await this.transformPluginsForFormat(config.plugins || [], 'dist');
        // 应用 Banner 和 Footer 配置
        const bannerConfig = config.banner || {};
        const banner = await this.resolveBanner(bannerConfig);
        const footer = await this.resolveFooter(bannerConfig);
        this.logger.info(`UMD Banner配置: ${JSON.stringify(bannerConfig)}`);
        this.logger.info(`解析后的Banner: ${banner}`);
        return {
            input: umdEntry,
            external: config.external,
            plugins: [...basePlugins, ...userPlugins],
            output: {
                format: 'umd',
                name: umdName,
                file: `dist/${umdConfig.fileName || 'index.umd.js'}`,
                sourcemap: outputConfig.sourcemap,
                globals: { ...outputConfig.globals, ...umdConfig.globals },
                exports: 'auto',
                banner,
                footer,
                intro: await this.resolveIntro(bannerConfig),
                outro: await this.resolveOutro(bannerConfig)
            },
            treeshake: config.treeshake
        };
    }
    /**
     * 生成 UMD 全局变量名
     */
    generateUMDName(packageName) {
        if (!packageName)
            return 'MyLibrary';
        // 移除作用域前缀 (@scope/package -> package)
        const name = packageName.replace(/^@[^/]+\//, '');
        // 转换为 PascalCase
        return name
            .split(/[-_]/)
            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join('');
    }
    /**
     * 解析 Banner
     */
    async resolveBanner(bannerConfig) {
        const banners = [];
        // 自定义 Banner
        if (typeof bannerConfig.banner === 'function') {
            const customBanner = await bannerConfig.banner();
            if (customBanner)
                banners.push(customBanner);
        }
        else if (typeof bannerConfig.banner === 'string' && bannerConfig.banner) {
            banners.push(bannerConfig.banner);
        }
        // 自动生成版权信息
        if (bannerConfig.copyright) {
            const copyright = this.generateCopyright(bannerConfig.copyright);
            if (copyright)
                banners.push(copyright);
        }
        // 自动生成构建信息
        if (bannerConfig.buildInfo) {
            const buildInfo = this.generateBuildInfo(bannerConfig.buildInfo);
            if (buildInfo)
                banners.push(buildInfo);
        }
        return banners.length > 0 ? banners.join('\n') : undefined;
    }
    /**
     * 解析 Footer
     */
    async resolveFooter(bannerConfig) {
        if (typeof bannerConfig.footer === 'function') {
            return await bannerConfig.footer();
        }
        if (typeof bannerConfig.footer === 'string') {
            return bannerConfig.footer;
        }
        return undefined;
    }
    /**
     * 解析 Intro
     */
    async resolveIntro(bannerConfig) {
        if (typeof bannerConfig.intro === 'function') {
            return await bannerConfig.intro();
        }
        if (typeof bannerConfig.intro === 'string') {
            return bannerConfig.intro;
        }
        return undefined;
    }
    /**
     * 解析 Outro
     */
    async resolveOutro(bannerConfig) {
        if (typeof bannerConfig.outro === 'function') {
            return await bannerConfig.outro();
        }
        if (typeof bannerConfig.outro === 'string') {
            return bannerConfig.outro;
        }
        return undefined;
    }
    /**
     * 生成版权信息
     */
    generateCopyright(copyrightConfig) {
        const config = typeof copyrightConfig === 'object' ? copyrightConfig : {};
        const year = config.year || new Date().getFullYear();
        const owner = config.owner || 'Unknown';
        const license = config.license || 'MIT';
        if (config.template) {
            return config.template
                .replace(/\{year\}/g, year)
                .replace(/\{owner\}/g, owner)
                .replace(/\{license\}/g, license);
        }
        return `/*!\n * Copyright (c) ${year} ${owner}\n * Licensed under ${license}\n */`;
    }
    /**
     * 生成构建信息
     */
    generateBuildInfo(buildInfoConfig) {
        const config = typeof buildInfoConfig === 'object' ? buildInfoConfig : {};
        const parts = [];
        if (config.version !== false) {
            try {
                const fs = require('fs');
                const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
                parts.push(`Version: ${packageJson.version}`);
            }
            catch {
                // 忽略错误
            }
        }
        if (config.buildTime !== false) {
            parts.push(`Built: ${new Date().toISOString()}`);
        }
        if (config.environment !== false) {
            parts.push(`Environment: ${process.env.NODE_ENV || 'development'}`);
        }
        if (config.git !== false) {
            try {
                const { execSync } = require('child_process');
                const commit = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
                parts.push(`Commit: ${commit}`);
            }
            catch {
                // 忽略错误
            }
        }
        if (config.template) {
            return config.template;
        }
        return parts.length > 0 ? `/*!\n * ${parts.join('\n * ')}\n */` : '';
    }
}

/**
 * Rolldown 适配器
 *
 * 提供 Rolldown 打包器的适配实现
 *
 * @author LDesign Team
 * @version 1.0.0
 */
/**
 * Rolldown 适配器类
 */
class RolldownAdapter {
    constructor(options = {}) {
        this.name = 'rolldown';
        this.logger = options.logger || new Logger();
        this.performanceMonitor = options.performanceMonitor;
        // 在 ES 模块环境中，我们无法在构造函数中同步加载 rolldown
        // 所以我们假设它是可用的，并在实际使用时进行检查
        try {
            const rolldown = this.loadRolldown();
            this.version = rolldown.VERSION || 'unknown';
            this.available = true;
            this.logger.debug(`Rolldown 适配器初始化成功 (v${this.version})`);
        }
        catch (error) {
            // 同步加载失败，但这在 ES 模块环境中是预期的
            // 我们将在实际使用时尝试异步加载
            this.version = 'unknown';
            this.available = true; // 假设可用，在使用时验证
            this.logger.debug('Rolldown 同步加载失败，将在使用时异步加载');
        }
    }
    /**
     * 执行构建
     */
    async build(config) {
        if (!this.available) {
            throw new BuilderError(exports.ErrorCode.ADAPTER_NOT_AVAILABLE, 'Rolldown 适配器不可用');
        }
        try {
            // 尝试加载 rolldown，支持异步加载
            const rolldown = await this.ensureRolldownLoaded();
            const rolldownConfig = await this.transformConfig(config);
            this.logger.info('开始 Rolldown 构建...');
            const startTime = Date.now();
            // 执行构建
            const result = await rolldown.build(rolldownConfig);
            const duration = Date.now() - startTime;
            // 构建结果
            const buildResult = {
                success: true,
                outputs: result.outputs || [],
                duration,
                stats: result.stats || {
                    totalSize: 0,
                    gzipSize: 0,
                    files: [],
                    chunks: [],
                    assets: [],
                    modules: [],
                    dependencies: [],
                    warnings: [],
                    errors: []
                },
                performance: this.getPerformanceMetrics(),
                warnings: result.warnings || [],
                errors: [],
                buildId: `rolldown-${Date.now()}`,
                timestamp: Date.now(),
                bundler: 'rolldown',
                mode: 'production'
            };
            this.logger.success(`Rolldown 构建完成 (${duration}ms)`);
            return buildResult;
        }
        catch (error) {
            throw new BuilderError(exports.ErrorCode.BUILD_FAILED, `Rolldown 构建失败: ${error.message}`, { cause: error });
        }
    }
    /**
     * 启动监听模式
     */
    async watch(config) {
        if (!this.available) {
            throw new BuilderError(exports.ErrorCode.ADAPTER_NOT_AVAILABLE, 'Rolldown 适配器不可用');
        }
        try {
            const rolldown = await this.ensureRolldownLoaded();
            const rolldownConfig = await this.transformConfig(config);
            // 启动监听
            const watcher = await rolldown.watch(rolldownConfig);
            // 创建统一的监听器接口
            const watchOptions = config.watch || {};
            const buildWatcher = {
                patterns: (typeof watchOptions === 'object' && watchOptions.include) || ['src/**/*'],
                watching: true,
                async close() {
                    if (watcher && typeof watcher.close === 'function') {
                        await watcher.close();
                    }
                },
                on(event, listener) {
                    if (watcher && typeof watcher.on === 'function') {
                        watcher.on(event, listener);
                    }
                    return this;
                },
                off(event, listener) {
                    if (watcher && typeof watcher.off === 'function') {
                        watcher.off(event, listener);
                    }
                    return this;
                },
                emit(event, ...args) {
                    if (watcher && typeof watcher.emit === 'function') {
                        return watcher.emit(event, ...args);
                    }
                    return false;
                }
            };
            this.logger.info('Rolldown 监听模式已启动');
            return buildWatcher;
        }
        catch (error) {
            throw new BuilderError(exports.ErrorCode.BUILD_FAILED, `启动 Rolldown 监听模式失败: ${error.message}`, { cause: error });
        }
    }
    /**
     * 转换配置
     */
    async transformConfig(config) {
        // 转换为 Rolldown 配置格式
        const rolldownConfig = {
            input: config.input,
            external: config.external,
            plugins: [] // 暂时禁用所有插件来测试基本功能
        };
        // 转换输出配置
        if (config.output) {
            rolldownConfig.output = {
                dir: config.output.dir,
                file: config.output.file,
                // Rolldown 不支持数组格式，只取第一个格式
                format: Array.isArray(config.output.format) ? config.output.format[0] : config.output.format,
                name: config.output.name,
                sourcemap: config.output.sourcemap,
                globals: config.output.globals
            };
        }
        // Rolldown 特有配置
        if (config.platform) {
            rolldownConfig.platform = config.platform;
        }
        // 转换其他选项
        if (config.treeshake !== undefined) {
            rolldownConfig.treeshake = config.treeshake;
        }
        return rolldownConfig;
    }
    /**
     * 转换插件
     */
    async transformPlugins(plugins) {
        const transformedPlugins = [];
        for (const plugin of plugins) {
            try {
                // 如果插件有 plugin 函数，调用它来获取实际插件
                if (plugin.plugin && typeof plugin.plugin === 'function') {
                    const actualPlugin = await plugin.plugin();
                    transformedPlugins.push(actualPlugin);
                }
                // 如果插件有 rolldown 特定配置，使用它
                else if (plugin.rolldown) {
                    transformedPlugins.push({ ...plugin, ...plugin.rolldown });
                }
                // 如果插件有 setup 方法，保持原样
                else if (plugin.setup) {
                    transformedPlugins.push(plugin);
                }
                // 尝试转换 Rollup 插件为 Rolldown 格式
                else {
                    transformedPlugins.push(this.convertRollupPlugin(plugin));
                }
            }
            catch (error) {
                this.logger.warn(`插件 ${plugin.name || 'unknown'} 加载失败:`, error.message);
            }
        }
        return transformedPlugins;
    }
    /**
     * 检查功能支持
     */
    supportsFeature(feature) {
        // Rolldown 支持的功能
        const supportedFeatures = [
            'treeshaking',
            'code-splitting',
            'dynamic-import',
            'sourcemap',
            'minification',
            'plugin-system',
            'config-file',
            'cache-support',
            'parallel-build',
            'incremental-build'
        ];
        return supportedFeatures.includes(feature);
    }
    /**
     * 获取功能支持映射
     */
    getFeatureSupport() {
        return {
            treeshaking: true,
            'code-splitting': true,
            'dynamic-import': true,
            'worker-support': true,
            'css-bundling': true,
            'asset-processing': true,
            sourcemap: true,
            minification: true,
            'hot-reload': false,
            'module-federation': false,
            'incremental-build': true,
            'parallel-build': true,
            'cache-support': true,
            'plugin-system': true,
            'config-file': true
        };
    }
    /**
     * 获取性能指标
     */
    getPerformanceMetrics() {
        if (this.performanceMonitor) {
            return this.performanceMonitor.getPerformanceMetrics();
        }
        // 返回默认指标
        return {
            buildTime: 0,
            memoryUsage: {
                heapUsed: process.memoryUsage().heapUsed,
                heapTotal: process.memoryUsage().heapTotal,
                external: process.memoryUsage().external,
                rss: process.memoryUsage().rss,
                peak: 0,
                trend: []
            },
            cacheStats: {
                hits: 0,
                misses: 0,
                hitRate: 0,
                size: 0,
                entries: 0,
                timeSaved: 0
            },
            fileStats: {
                totalFiles: 0,
                filesByType: {},
                averageProcessingTime: 0,
                slowestFiles: [],
                processingRate: 0
            },
            pluginPerformance: [],
            systemResources: {
                cpuUsage: 0,
                availableMemory: 0,
                diskUsage: {
                    total: 0,
                    used: 0,
                    available: 0,
                    usagePercent: 0
                }
            }
        };
    }
    /**
     * 清理资源
     */
    async dispose() {
        // Rolldown 适配器没有需要清理的资源
    }
    /**
     * 确保 Rolldown 已加载（支持异步）
     */
    async ensureRolldownLoaded() {
        try {
            // 首先尝试同步加载
            return this.loadRolldown();
        }
        catch (error) {
            // 同步加载失败，尝试异步加载
            try {
                this.logger.debug('尝试异步加载 rolldown...');
                const rolldown = await import('rolldown');
                if (rolldown && (rolldown.VERSION || typeof rolldown.build === 'function')) {
                    this.logger.debug(`Rolldown 异步加载成功: ${rolldown.VERSION || 'unknown'}`);
                    return rolldown;
                }
                throw new Error('Rolldown 模块无效');
            }
            catch (asyncError) {
                throw new BuilderError(exports.ErrorCode.ADAPTER_NOT_AVAILABLE, 'Rolldown 未安装或无法加载，请运行: npm install rolldown --save-dev', { cause: asyncError });
            }
        }
    }
    /**
     * 加载 Rolldown（同步方式）
     */
    loadRolldown() {
        try {
            // 方式1: 在 CommonJS 环境中直接使用 require
            if (typeof require !== 'undefined') {
                return require('rolldown');
            }
            // 方式2: 在 ES 模块环境中，尝试使用 createRequire
            // 由于这是一个同步方法，我们不能使用 async import
            // 但我们可以尝试访问全局的 require 函数
            // 检查是否在 Node.js 环境中
            if (typeof process !== 'undefined' && process.versions && process.versions.node) {
                // 尝试通过 globalThis 访问 require
                const globalRequire = globalThis.require;
                if (globalRequire) {
                    return globalRequire('rolldown');
                }
                // 尝试通过 global 访问 require
                const nodeGlobal = global;
                if (nodeGlobal && nodeGlobal.require) {
                    return nodeGlobal.require('rolldown');
                }
            }
            throw new Error('无法在当前环境中加载 rolldown 模块');
        }
        catch (error) {
            throw new Error('Rolldown 未安装，请运行: npm install rolldown --save-dev');
        }
    }
    /**
     * 转换 Rollup 插件为 Rolldown 格式
     */
    convertRollupPlugin(plugin) {
        // 如果插件已经是 Rolldown 格式，直接返回
        if (plugin.setup) {
            return plugin;
        }
        // 尝试转换 Rollup 插件
        return {
            name: plugin.name || 'unknown',
            setup(build) {
                // 转换 Rollup 钩子为 Rolldown 钩子
                if (plugin.resolveId) {
                    build.onResolve({ filter: /.*/ }, plugin.resolveId);
                }
                if (plugin.load) {
                    build.onLoad({ filter: /.*/ }, plugin.load);
                }
                if (plugin.transform) {
                    build.onTransform({ filter: /.*/ }, plugin.transform);
                }
            }
        };
    }
}

/**
 * 适配器工厂
 *
 * 负责创建和管理不同的打包器适配器
 *
 * @author LDesign Team
 * @version 1.0.0
 */
/**
 * 基础适配器实现（临时）
 */
class BaseAdapter {
    constructor(name) {
        this.version = '1.0.0';
        this.available = true;
        this.name = name;
    }
    async build(_config) {
        // 临时实现，返回模拟结果
        return {
            success: true,
            outputs: [],
            duration: 1000,
            stats: {
                totalSize: 0,
                gzipSize: 0,
                files: [],
                chunks: [],
                assets: [],
                modules: [],
                dependencies: [],
                warnings: [],
                errors: []
            },
            warnings: [],
            errors: []
        };
    }
    async watch(_config) {
        // 临时实现
        const mockWatcher = {
            patterns: ['src/**/*'],
            watching: true,
            close: async () => { },
            on: () => { },
            off: () => { },
            emit: () => { }
        };
        return mockWatcher;
    }
    async transformConfig(config) {
        return config;
    }
    async transformPlugins(plugins) {
        return plugins;
    }
    supportsFeature(_feature) {
        return true;
    }
    getFeatureSupport() {
        return {};
    }
    getPerformanceMetrics() {
        return {
            buildTime: 0,
            memoryUsage: {
                heapUsed: 0,
                heapTotal: 0,
                external: 0,
                rss: 0,
                peak: 0,
                trend: []
            },
            cacheStats: {
                hits: 0,
                misses: 0,
                hitRate: 0,
                size: 0,
                entries: 0,
                timeSaved: 0
            },
            fileStats: {
                totalFiles: 0,
                filesByType: {},
                averageProcessingTime: 0,
                slowestFiles: [],
                processingRate: 0
            },
            pluginPerformance: [],
            systemResources: {
                cpuUsage: 0,
                availableMemory: 0,
                diskUsage: {
                    total: 0,
                    used: 0,
                    available: 0,
                    usagePercent: 0
                }
            }
        };
    }
    async dispose() {
        // 清理资源
    }
}
/**
 * 适配器工厂类
 */
class BundlerAdapterFactory {
    /**
     * 注册适配器
     */
    static register(bundler, adapterClass) {
        this.adapters.set(bundler, adapterClass);
    }
    /**
     * 创建适配器实例
     */
    static create(bundler, options = {}) {
        // 检查是否已有实例
        const instanceKey = `${bundler}-${JSON.stringify(options)}`;
        const existingInstance = this.instances.get(instanceKey);
        if (existingInstance) {
            return existingInstance;
        }
        // 获取适配器类
        const AdapterClass = this.adapters.get(bundler);
        if (!AdapterClass) {
            // 如果没有注册的适配器，使用基础适配器
            const adapter = new BaseAdapter(bundler);
            this.instances.set(instanceKey, adapter);
            return adapter;
        }
        try {
            // 创建新实例
            const adapter = new AdapterClass(options);
            // 检查适配器是否可用
            if (!adapter.available) {
                throw new BuilderError(exports.ErrorCode.ADAPTER_NOT_AVAILABLE, `适配器 ${bundler} 不可用`);
            }
            this.instances.set(instanceKey, adapter);
            return adapter;
        }
        catch (error) {
            throw new BuilderError(exports.ErrorCode.ADAPTER_INIT_ERROR, `创建适配器 ${bundler} 失败`, { cause: error });
        }
    }
    /**
     * 获取可用的适配器列表
     */
    static getAvailableAdapters() {
        const available = [];
        for (const bundler of ['rollup', 'rolldown']) {
            try {
                const adapter = this.create(bundler);
                if (adapter.available) {
                    available.push(bundler);
                }
            }
            catch {
                // 忽略不可用的适配器
            }
        }
        return available;
    }
    /**
     * 检查适配器是否可用
     */
    static isAvailable(bundler) {
        try {
            const adapter = this.create(bundler);
            return adapter.available;
        }
        catch {
            return false;
        }
    }
    /**
     * 清理所有实例
     */
    static async dispose() {
        const disposePromises = Array.from(this.instances.values()).map(adapter => adapter.dispose());
        await Promise.all(disposePromises);
        this.instances.clear();
    }
    /**
     * 获取适配器信息
     */
    static getAdapterInfo(bundler) {
        try {
            const adapter = this.create(bundler);
            return {
                name: adapter.name,
                version: adapter.version,
                available: adapter.available
            };
        }
        catch {
            return {
                name: bundler,
                version: 'unknown',
                available: false
            };
        }
    }
}
BundlerAdapterFactory.adapters = new Map();
BundlerAdapterFactory.instances = new Map();
// 注册真实的适配器
BundlerAdapterFactory.register('rollup', RollupAdapter);
BundlerAdapterFactory.register('rolldown', RolldownAdapter);

/**
 * 库构建器主控制器类
 *
 * 这是 @ldesign/builder 的核心类，负责协调各个组件完成库的构建工作
 *
 * @author LDesign Team
 * @version 1.0.0
 */
/**
 * 库构建器主控制器类
 *
 * 采用依赖注入模式，统一管理各种服务组件
 * 继承 EventEmitter，支持事件驱动的构建流程
 */
class LibraryBuilder extends require$$0$2.EventEmitter {
    constructor(options = {}) {
        super();
        /** 当前状态 */
        this.status = exports.BuilderStatus.IDLE;
        /** 当前构建统计 */
        this.currentStats = null;
        /** 当前性能指标 */
        this.currentMetrics = null;
        // 初始化各种服务
        this.initializeServices(options);
        // 设置事件监听器
        this.setupEventListeners();
        // 设置错误处理
        this.setupErrorHandling();
        // 初始化配置
        this.config = { ...DEFAULT_BUILDER_CONFIG, ...options.config };
    }
    /**
     * 执行库构建
     *
     * @param config 可选的配置覆盖
     * @returns 构建结果
     */
    async build(config) {
        const buildId = this.generateBuildId();
        try {
            // 设置构建状态
            this.setStatus(exports.BuilderStatus.BUILDING);
            // 合并配置
            const mergedConfig = config ? this.mergeConfig(this.config, config) : this.config;
            // 发出构建开始事件
            this.emit('build:start', {
                config: mergedConfig,
                timestamp: Date.now(),
                buildId
            });
            // 开始性能监控
            this.performanceMonitor.startBuild(buildId);
            // 获取库类型（优先使用配置中指定的类型）
            let libraryType = mergedConfig.libraryType || await this.detectLibraryType(mergedConfig.input);
            // 确保 libraryType 是正确的枚举值
            if (typeof libraryType === 'string') {
                libraryType = libraryType;
            }
            // 获取构建策略
            const strategy = this.strategyManager.getStrategy(libraryType);
            // 应用策略配置
            const strategyConfig = await strategy.applyStrategy(mergedConfig);
            // 执行构建
            const result = await this.bundlerAdapter.build(strategyConfig);
            // 执行打包后验证（如果启用）
            let validationResult;
            if (mergedConfig.postBuildValidation?.enabled) {
                validationResult = await this.runPostBuildValidation(mergedConfig, result, buildId);
            }
            // 结束性能监控
            const metrics = this.performanceMonitor.endBuild(buildId);
            // 构建成功
            const buildResult = {
                success: true,
                outputs: result.outputs,
                duration: metrics.buildTime,
                stats: result.stats,
                performance: metrics,
                warnings: result.warnings || [],
                errors: [],
                buildId,
                timestamp: Date.now(),
                bundler: this.bundlerAdapter.name,
                mode: mergedConfig.mode || 'production',
                libraryType,
                validation: validationResult
            };
            // 保存统计信息
            this.currentStats = buildResult.stats;
            this.currentMetrics = buildResult.performance;
            // 发出构建结束事件
            this.emit('build:end', {
                result: buildResult,
                duration: buildResult.duration,
                timestamp: Date.now()
            });
            // 重置状态
            this.setStatus(exports.BuilderStatus.IDLE);
            return buildResult;
        }
        catch (error) {
            // 处理构建错误
            const buildError = this.handleBuildError(error, buildId);
            // 发出错误事件
            this.emit('build:error', {
                error: buildError,
                phase: 'build',
                timestamp: Date.now()
            });
            // 重置状态
            this.setStatus(exports.BuilderStatus.ERROR);
            throw buildError;
        }
    }
    /**
     * 启动监听构建模式
     *
     * @param config 可选的配置覆盖
     * @returns 构建监听器
     */
    async buildWatch(config) {
        try {
            // 设置监听状态
            this.setStatus(exports.BuilderStatus.WATCHING);
            // 合并配置
            const mergedConfig = config ? this.mergeConfig(this.config, config) : this.config;
            // 获取库类型（优先使用配置中指定的类型）
            let libraryType = mergedConfig.libraryType || await this.detectLibraryType(mergedConfig.input);
            // 确保 libraryType 是正确的枚举值
            if (typeof libraryType === 'string') {
                libraryType = libraryType;
            }
            // 获取构建策略
            const strategy = this.strategyManager.getStrategy(libraryType);
            // 应用策略配置
            const strategyConfig = await strategy.applyStrategy(mergedConfig);
            // 启动监听
            const watcher = await this.bundlerAdapter.watch(strategyConfig);
            // 发出监听开始事件
            this.emit('watch:start', {
                patterns: watcher.patterns,
                timestamp: Date.now()
            });
            return watcher;
        }
        catch (error) {
            this.setStatus(exports.BuilderStatus.ERROR);
            throw this.errorHandler.createError(exports.ErrorCode.BUILD_FAILED, '启动监听模式失败', { cause: error });
        }
    }
    /**
     * 合并配置
     */
    mergeConfig(base, override) {
        return this.configManager.mergeConfigs(base, override);
    }
    /**
     * 验证配置
     */
    validateConfig(config) {
        return this.configManager.validateConfig(config);
    }
    /**
     * 加载配置文件
     */
    async loadConfig(configPath) {
        const config = await this.configManager.loadConfig(configPath ? { configFile: configPath } : {});
        this.config = config;
        return config;
    }
    /**
     * 切换打包核心
     */
    setBundler(bundler) {
        try {
            this.bundlerAdapter = BundlerAdapterFactory.create(bundler, {
                logger: this.logger,
                performanceMonitor: this.performanceMonitor
            });
            this.logger.info(`已切换到 ${bundler} 打包核心`);
        }
        catch (error) {
            throw this.errorHandler.createError(exports.ErrorCode.ADAPTER_NOT_AVAILABLE, `切换到 ${bundler} 失败`, { cause: error });
        }
    }
    /**
     * 获取当前打包核心
     */
    getBundler() {
        return this.bundlerAdapter.name;
    }
    /**
     * 设置库类型
     */
    setLibraryType(type) {
        this.config.libraryType = type;
        this.logger.info(`已设置库类型为: ${type}`);
    }
    /**
     * 检测库类型
     */
    async detectLibraryType(projectPath) {
        const result = await this.libraryDetector.detect(projectPath);
        return result.type;
    }
    /**
     * 获取当前状态
     */
    getStatus() {
        return this.status;
    }
    /**
     * 是否正在构建
     */
    isBuilding() {
        return this.status === 'building';
    }
    /**
     * 是否正在监听
     */
    isWatching() {
        return this.status === 'watching';
    }
    /**
     * 初始化
     */
    async initialize() {
        this.setStatus(exports.BuilderStatus.INITIALIZING);
        try {
            // 加载配置
            await this.loadConfig();
            // 初始化适配器
            this.setBundler(this.config.bundler || 'rollup');
            this.setStatus(exports.BuilderStatus.IDLE);
            this.logger.success('LibraryBuilder 初始化完成');
        }
        catch (error) {
            this.setStatus(exports.BuilderStatus.ERROR);
            throw this.errorHandler.createError(exports.ErrorCode.BUILD_FAILED, '初始化失败', { cause: error });
        }
    }
    /**
     * 销毁资源
     */
    async dispose() {
        this.setStatus(exports.BuilderStatus.DISPOSED);
        // 清理适配器
        if (this.bundlerAdapter) {
            await this.bundlerAdapter.dispose();
        }
        // 清理插件管理器
        if (this.pluginManager) {
            await this.pluginManager.dispose();
        }
        // 清理验证器
        if (this.postBuildValidator) {
            await this.postBuildValidator.dispose();
        }
        // 移除所有事件监听器
        this.removeAllListeners();
        this.logger.info('LibraryBuilder 已销毁');
    }
    /**
     * 获取构建统计信息
     */
    getStats() {
        return this.currentStats;
    }
    /**
     * 获取性能指标
     */
    getPerformanceMetrics() {
        return this.currentMetrics;
    }
    /**
     * 初始化各种服务
     */
    initializeServices(options) {
        // 初始化日志记录器
        this.logger = options.logger || createLogger({
            level: 'info',
            prefix: '@ldesign/builder'
        });
        // 初始化错误处理器
        this.errorHandler = createErrorHandler({
            logger: this.logger,
            showSuggestions: true
        });
        // 初始化性能监控器
        this.performanceMonitor = new PerformanceMonitor({
            logger: this.logger
        });
        // 初始化配置管理器
        this.configManager = new ConfigManager({
            logger: this.logger
        });
        // 初始化策略管理器
        this.strategyManager = new StrategyManager({
            autoDetection: true,
            cache: true
        });
        // 初始化插件管理器
        this.pluginManager = new PluginManager({
            cache: true,
            hotReload: false
        });
        // 初始化库类型检测器
        this.libraryDetector = new LibraryDetector({
            logger: this.logger
        });
        // 初始化打包后验证器
        this.postBuildValidator = new PostBuildValidator({}, {
            logger: this.logger,
            errorHandler: this.errorHandler
        });
        // 初始化默认适配器
        this.bundlerAdapter = BundlerAdapterFactory.create('rollup', {
            logger: this.logger,
            performanceMonitor: this.performanceMonitor
        });
    }
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听配置变化
        this.configManager.on('config:change', (config) => {
            this.config = config;
            this.emit('config:change', {
                config,
                oldConfig: this.config,
                timestamp: Date.now()
            });
        });
    }
    /**
     * 设置错误处理
     */
    setupErrorHandling() {
        // 处理未捕获的错误
        this.on('error', (error) => {
            this.errorHandler.handle(error, 'LibraryBuilder');
        });
    }
    /**
     * 设置状态
     */
    setStatus(status) {
        const oldStatus = this.status;
        this.status = status;
        this.emit('status:change', {
            status,
            oldStatus,
            timestamp: Date.now()
        });
    }
    /**
     * 生成构建 ID
     */
    generateBuildId() {
        return `build-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    /**
     * 处理构建错误
     */
    handleBuildError(error, buildId) {
        this.performanceMonitor.recordError(buildId, error);
        if (error instanceof Error) {
            return this.errorHandler.createError(exports.ErrorCode.BUILD_FAILED, `构建失败: ${error.message}`, { cause: error });
        }
        return this.errorHandler.createError(exports.ErrorCode.BUILD_FAILED, '构建失败: 未知错误');
    }
    /**
     * 运行打包后验证
     */
    async runPostBuildValidation(config, buildResult, buildId) {
        this.logger.info('开始打包后验证...');
        try {
            // 创建验证上下文
            const validationContext = {
                buildContext: {
                    buildId,
                    startTime: Date.now(),
                    config,
                    cwd: process.cwd(),
                    cacheDir: '.cache',
                    tempDir: '.temp',
                    watch: false,
                    env: process.env,
                    logger: this.logger,
                    performanceMonitor: this.performanceMonitor
                },
                buildResult: {
                    success: true,
                    outputs: buildResult.outputs,
                    duration: 0,
                    stats: buildResult.stats,
                    performance: this.currentMetrics || {},
                    warnings: buildResult.warnings || [],
                    errors: [],
                    buildId,
                    timestamp: Date.now(),
                    bundler: this.bundlerAdapter.name,
                    mode: config.mode || 'production',
                    libraryType: config.libraryType
                },
                config: config.postBuildValidation || {},
                tempDir: '',
                startTime: Date.now(),
                validationId: `validation-${buildId}`,
                projectRoot: process.cwd(),
                outputDir: config.output?.dir || 'dist'
            };
            // 更新验证器配置
            if (config.postBuildValidation) {
                this.postBuildValidator.setConfig(config.postBuildValidation);
            }
            // 执行验证
            const validationResult = await this.postBuildValidator.validate(validationContext);
            // 如果验证失败且配置为失败时停止构建
            if (!validationResult.success && config.postBuildValidation?.failOnError) {
                throw this.errorHandler.createError(exports.ErrorCode.BUILD_FAILED, '打包后验证失败', {
                    cause: new Error(`验证失败: ${validationResult.errors.length} 个错误`)
                });
            }
            this.logger.success('打包后验证完成');
            return validationResult;
        }
        catch (error) {
            this.logger.error('打包后验证失败:', error);
            throw error;
        }
    }
}

/**
 * Vue2 策略
 */
class Vue2Strategy {
    constructor() {
        this.name = 'vue2';
        this.supportedTypes = [exports.LibraryType.VUE2];
        this.priority = 10;
    }
    async applyStrategy(config) {
        return config;
    }
    isApplicable(config) {
        return config.libraryType === exports.LibraryType.VUE2;
    }
    getDefaultConfig() {
        return {};
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
}

/**
 * 适配器相关类型定义
 */
/**
 * 打包器功能枚举
 */
exports.BundlerFeature = void 0;
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
})(exports.BundlerFeature || (exports.BundlerFeature = {}));

/**
 * 插件相关类型定义
 */
/**
 * 插件类型枚举
 */
exports.PluginType = void 0;
(function (PluginType) {
    /** 核心插件 */
    PluginType["CORE"] = "core";
    /** 转换插件 */
    PluginType["TRANSFORM"] = "transform";
    /** 优化插件 */
    PluginType["OPTIMIZATION"] = "optimization";
    /** 工具插件 */
    PluginType["UTILITY"] = "utility";
    /** 开发插件 */
    PluginType["DEVELOPMENT"] = "development";
    /** 自定义插件 */
    PluginType["CUSTOM"] = "custom";
})(exports.PluginType || (exports.PluginType = {}));
/**
 * 插件阶段枚举
 */
exports.PluginPhase = void 0;
(function (PluginPhase) {
    /** 构建开始前 */
    PluginPhase["PRE_BUILD"] = "pre-build";
    /** 模块解析 */
    PluginPhase["RESOLVE"] = "resolve";
    /** 模块加载 */
    PluginPhase["LOAD"] = "load";
    /** 代码转换 */
    PluginPhase["TRANSFORM"] = "transform";
    /** 代码生成 */
    PluginPhase["GENERATE"] = "generate";
    /** 构建完成后 */
    PluginPhase["POST_BUILD"] = "post-build";
})(exports.PluginPhase || (exports.PluginPhase = {}));

/**
 * 打包器相关类型定义
 */
/**
 * 打包器状态
 */
exports.BundlerStatus = void 0;
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
})(exports.BundlerStatus || (exports.BundlerStatus = {}));

/**
 * 输出格式相关常量
 */
/**
 * 支持的输出格式
 */
const OUTPUT_FORMATS = ['esm', 'cjs', 'umd', 'iife'];
/**
 * 格式别名映射
 */
const FORMAT_ALIASES = {
    'es': 'esm',
    'es6': 'esm',
    'module': 'esm',
    'commonjs': 'cjs',
    'common': 'cjs',
    'universal': 'umd',
    'browser': 'iife',
    'global': 'iife'
};
/**
 * 格式描述
 */
const FORMAT_DESCRIPTIONS = {
    esm: 'ES Module - 现代 JavaScript 模块格式，支持 Tree Shaking',
    cjs: 'CommonJS - Node.js 默认模块格式',
    umd: 'Universal Module Definition - 通用模块格式，支持多种环境',
    iife: 'Immediately Invoked Function Expression - 立即执行函数，适用于浏览器',
    css: 'Cascading Style Sheets - 样式表格式'
};
/**
 * 格式文件扩展名
 */
const FORMAT_EXTENSIONS = {
    esm: '.js',
    cjs: '.cjs',
    umd: '.umd.js',
    iife: '.iife.js',
    css: '.css'
};
/**
 * 格式默认文件名模式
 */
const FORMAT_FILE_PATTERNS = {
    esm: '[name].js',
    cjs: '[name].cjs',
    umd: '[name].umd.js',
    iife: '[name].iife.js',
    css: '[name].css'
};
/**
 * 格式兼容性
 */
const FORMAT_COMPATIBILITY = {
    esm: {
        browser: true,
        node: true,
        requiresGlobals: false,
        supportsTreeShaking: true,
        supportsCodeSplitting: true
    },
    cjs: {
        browser: false,
        node: true,
        requiresGlobals: false,
        supportsTreeShaking: false,
        supportsCodeSplitting: false
    },
    umd: {
        browser: true,
        node: true,
        requiresGlobals: true,
        supportsTreeShaking: false,
        supportsCodeSplitting: false
    },
    iife: {
        browser: true,
        node: false,
        requiresGlobals: true,
        supportsTreeShaking: false,
        supportsCodeSplitting: false
    },
    css: {
        browser: true,
        node: false,
        requiresGlobals: false,
        supportsTreeShaking: false,
        supportsCodeSplitting: false
    }
};
/**
 * 格式推荐用途
 */
const FORMAT_USE_CASES = {
    esm: [
        '现代 JavaScript 库',
        '支持 Tree Shaking 的库',
        'Node.js 模块',
        '浏览器原生模块'
    ],
    cjs: [
        'Node.js 库',
        '传统 npm 包',
        '服务端应用',
        '构建工具插件'
    ],
    umd: [
        '通用库',
        '需要多环境支持的库',
        'CDN 分发的库',
        '向后兼容的库'
    ],
    iife: [
        '浏览器脚本',
        '内联脚本',
        '不支持模块的环境',
        '简单的工具脚本'
    ],
    css: [
        '样式库',
        '主题包',
        '组件样式',
        'CSS 框架'
    ]
};
/**
 * 格式优先级（用于自动选择）
 */
const FORMAT_PRIORITY = {
    esm: 4, // 最高优先级
    cjs: 3,
    umd: 2,
    iife: 1,
    css: 5 // CSS 样式库的最高优先级
};
/**
 * 格式组合建议
 */
const FORMAT_COMBINATIONS = {
    // 现代库推荐组合
    modern: ['esm', 'cjs'],
    // 通用库推荐组合
    universal: ['esm', 'cjs', 'umd'],
    // 浏览器库推荐组合
    browser: ['esm', 'umd', 'iife'],
    // Node.js 库推荐组合
    node: ['esm', 'cjs'],
    // 最小组合
    minimal: ['esm'],
    // 完整组合
    complete: ['esm', 'cjs', 'umd', 'iife']
};
/**
 * 根据库类型推荐的格式
 */
const LIBRARY_TYPE_FORMATS = {
    typescript: ['esm', 'cjs'],
    style: ['esm'],
    vue2: ['esm', 'cjs', 'umd'],
    vue3: ['esm', 'cjs', 'umd'],
    mixed: ['esm', 'cjs']
};
/**
 * 格式特定的配置选项
 */
const FORMAT_SPECIFIC_OPTIONS = {
    esm: {
        // ES Module 特定选项
        exports: 'named',
        interop: 'auto',
        strict: true
    },
    cjs: {
        // CommonJS 特定选项
        exports: 'auto',
        interop: 'auto',
        strict: false
    },
    umd: {
        // UMD 特定选项
        exports: 'auto',
        interop: 'auto',
        strict: false,
        // 需要全局变量名
        requiresName: true
    },
    iife: {
        // IIFE 特定选项
        exports: 'none',
        interop: false,
        strict: false,
        // 需要全局变量名
        requiresName: true
    }
};
/**
 * 格式验证规则
 */
const FORMAT_VALIDATION_RULES = {
    esm: {
        // ES Module 验证规则
        allowedExports: ['named', 'default'],
        requiresModernNode: true,
        supportsTopLevelAwait: true
    },
    cjs: {
        // CommonJS 验证规则
        allowedExports: ['auto', 'default', 'named'],
        requiresModernNode: false,
        supportsTopLevelAwait: false
    },
    umd: {
        // UMD 验证规则
        allowedExports: ['auto', 'default'],
        requiresGlobalName: true,
        requiresGlobalsMapping: true
    },
    iife: {
        // IIFE 验证规则
        allowedExports: ['none'],
        requiresGlobalName: true,
        requiresGlobalsMapping: true
    }
};
/**
 * 格式性能特征
 */
const FORMAT_PERFORMANCE = {
    esm: {
        bundleSize: 'small',
        loadTime: 'fast',
        treeShaking: 'excellent',
        caching: 'excellent'
    },
    cjs: {
        bundleSize: 'medium',
        loadTime: 'medium',
        treeShaking: 'none',
        caching: 'good'
    },
    umd: {
        bundleSize: 'large',
        loadTime: 'slow',
        treeShaking: 'none',
        caching: 'fair'
    },
    iife: {
        bundleSize: 'large',
        loadTime: 'slow',
        treeShaking: 'none',
        caching: 'poor'
    }
};

/**
 * 打包器相关常量
 */
/**
 * 支持的打包器列表
 */
const SUPPORTED_BUNDLERS = ['rollup', 'rolldown'];
/**
 * 默认打包器
 */
const DEFAULT_BUNDLER = 'rollup';
/**
 * 打包器信息
 */
const BUNDLER_INFO = {
    rollup: {
        name: 'Rollup',
        description: '成熟稳定的 JavaScript 模块打包器，专注于 ES 模块',
        homepage: 'https://rollupjs.org',
        repository: 'https://github.com/rollup/rollup',
        minNodeVersion: '14.18.0',
        stableVersion: '^4.0.0',
        features: [
            exports.BundlerFeature.TREE_SHAKING,
            exports.BundlerFeature.CODE_SPLITTING,
            exports.BundlerFeature.DYNAMIC_IMPORT,
            exports.BundlerFeature.SOURCEMAP,
            exports.BundlerFeature.PLUGIN_SYSTEM,
            exports.BundlerFeature.CONFIG_FILE,
            exports.BundlerFeature.CACHE_SUPPORT
        ]
    },
    rolldown: {
        name: 'Rolldown',
        description: '基于 Rust 的高性能 JavaScript 打包器，兼容 Rollup API',
        homepage: 'https://rolldown.rs',
        repository: 'https://github.com/rolldown/rolldown',
        minNodeVersion: '16.0.0',
        stableVersion: '^0.1.0',
        features: [
            exports.BundlerFeature.TREE_SHAKING,
            exports.BundlerFeature.CODE_SPLITTING,
            exports.BundlerFeature.DYNAMIC_IMPORT,
            exports.BundlerFeature.SOURCEMAP,
            exports.BundlerFeature.MINIFICATION,
            exports.BundlerFeature.PLUGIN_SYSTEM,
            exports.BundlerFeature.CONFIG_FILE,
            exports.BundlerFeature.CACHE_SUPPORT,
            exports.BundlerFeature.PARALLEL_BUILD,
            exports.BundlerFeature.INCREMENTAL_BUILD
        ]
    }
};
/**
 * 打包器性能特征
 */
const BUNDLER_PERFORMANCE = {
    rollup: {
        buildSpeed: 'medium',
        memoryUsage: 'medium',
        startupTime: 'fast',
        incrementalBuild: 'fair',
        largeProjectSupport: 'good',
        parallelProcessing: 'poor'
    },
    rolldown: {
        buildSpeed: 'very-fast',
        memoryUsage: 'low',
        startupTime: 'fast',
        incrementalBuild: 'excellent',
        largeProjectSupport: 'excellent',
        parallelProcessing: 'excellent'
    }
};
/**
 * 打包器兼容性
 */
const BUNDLER_COMPATIBILITY = {
    rollup: {
        nodeVersion: '>=14.18.0',
        platforms: ['win32', 'darwin', 'linux'],
        architectures: ['x64', 'arm64'],
        pluginCompatibility: {
            rollup: 'full',
            webpack: 'none',
            vite: 'partial'
        },
        configCompatibility: {
            rollup: true,
            webpack: false,
            vite: true
        }
    },
    rolldown: {
        nodeVersion: '>=16.0.0',
        platforms: ['win32', 'darwin', 'linux'],
        architectures: ['x64', 'arm64'],
        pluginCompatibility: {
            rollup: 'partial',
            webpack: 'none',
            vite: 'partial'
        },
        configCompatibility: {
            rollup: true,
            webpack: false,
            vite: false
        }
    }
};
/**
 * 打包器推荐使用场景
 */
const BUNDLER_USE_CASES = {
    rollup: [
        '成熟的库项目',
        '需要稳定性的生产环境',
        '复杂的插件需求',
        '对构建速度要求不高的项目',
        '需要丰富插件生态的项目'
    ],
    rolldown: [
        '大型项目',
        '对构建速度有高要求的项目',
        '需要增量构建的项目',
        '内存敏感的环境',
        '现代化的新项目'
    ]
};
/**
 * 打包器优缺点
 */
const BUNDLER_PROS_CONS = {
    rollup: {
        pros: [
            '成熟稳定，生产环境验证',
            '丰富的插件生态系统',
            '优秀的 Tree Shaking 支持',
            '良好的文档和社区支持',
            '配置简单直观'
        ],
        cons: [
            '构建速度相对较慢',
            '大型项目性能有限',
            '内存使用较高',
            '缺乏内置的并行处理'
        ]
    },
    rolldown: {
        pros: [
            '极快的构建速度',
            '低内存使用',
            '优秀的增量构建',
            '内置并行处理',
            '兼容 Rollup API'
        ],
        cons: [
            '相对较新，生态系统有限',
            '插件兼容性不完整',
            '文档和社区支持有限',
            '可能存在稳定性问题'
        ]
    }
};
/**
 * 打包器选择建议
 */
const BUNDLER_SELECTION_CRITERIA = {
    // 项目规模
    projectSize: {
        small: 'rollup',
        medium: 'rollup',
        large: 'rolldown',
        enterprise: 'rolldown'
    },
    // 构建速度要求
    buildSpeed: {
        low: 'rollup',
        medium: 'rollup',
        high: 'rolldown',
        critical: 'rolldown'
    },
    // 稳定性要求
    stability: {
        low: 'rolldown',
        medium: 'rollup',
        high: 'rollup',
        critical: 'rollup'
    },
    // 插件需求
    pluginNeeds: {
        minimal: 'rolldown',
        moderate: 'rollup',
        extensive: 'rollup',
        custom: 'rollup'
    }
};
/**
 * 打包器迁移难度
 */
const MIGRATION_DIFFICULTY = {
    'rollup-to-rolldown': 'easy',
    'rolldown-to-rollup': 'easy'
};
/**
 * 打包器配置映射
 */
const CONFIG_MAPPING = {
    // Rollup 到 Rolldown 的配置映射
    'rollup-to-rolldown': {
        input: 'input',
        output: 'output',
        external: 'external',
        plugins: 'plugins',
        treeshake: 'treeshake',
        // Rolldown 特有配置
        platform: 'browser' // 默认值
    },
    // Rolldown 到 Rollup 的配置映射
    'rolldown-to-rollup': {
        input: 'input',
        output: 'output',
        external: 'external',
        plugins: 'plugins',
        treeshake: 'treeshake'
        // 忽略 platform 等 Rolldown 特有配置
    }
};
/**
 * 打包器检测命令
 */
const BUNDLER_DETECTION_COMMANDS = {
    rollup: {
        check: 'rollup --version',
        install: 'npm install rollup --save-dev'
    },
    rolldown: {
        check: 'rolldown --version',
        install: 'npm install rolldown --save-dev'
    }
};
/**
 * 打包器默认配置
 */
const BUNDLER_DEFAULT_CONFIG = {
    rollup: {
        treeshake: true,
        output: {
            format: 'esm',
            sourcemap: true
        }
    },
    rolldown: {
        treeshake: true,
        platform: 'browser',
        output: {
            format: 'esm',
            sourcemap: true
        }
    }
};
/**
 * 打包器错误处理
 */
const BUNDLER_ERROR_PATTERNS = {
    rollup: {
        notFound: /Cannot find module 'rollup'/,
        versionMismatch: /Rollup version .* is not supported/,
        configError: /Could not resolve config file/,
        buildError: /Build failed with \d+ error/
    },
    rolldown: {
        notFound: /Cannot find module 'rolldown'/,
        versionMismatch: /Rolldown version .* is not supported/,
        configError: /Could not resolve config file/,
        buildError: /Build failed with \d+ error/
    }
};
/**
 * 打包器性能基准
 */
const PERFORMANCE_BENCHMARKS = {
    // 小型项目 (< 100 文件)
    small: {
        rollup: { buildTime: '2-5s', memoryUsage: '100-200MB' },
        rolldown: { buildTime: '0.5-1s', memoryUsage: '50-100MB' }
    },
    // 中型项目 (100-500 文件)
    medium: {
        rollup: { buildTime: '10-30s', memoryUsage: '300-500MB' },
        rolldown: { buildTime: '2-5s', memoryUsage: '100-200MB' }
    },
    // 大型项目 (> 500 文件)
    large: {
        rollup: { buildTime: '60-180s', memoryUsage: '500MB-1GB' },
        rolldown: { buildTime: '5-15s', memoryUsage: '200-400MB' }
    }
};

/**
 * 文件扩展名相关常量
 */
/**
 * 支持的文件扩展名
 */
const SUPPORTED_EXTENSIONS = {
    // JavaScript 文件
    javascript: ['.js', '.mjs', '.cjs'],
    // TypeScript 文件
    typescript: ['.ts', '.tsx', '.d.ts'],
    // JSX 文件
    jsx: ['.jsx', '.tsx'],
    // Vue 文件
    vue: ['.vue'],
    // 样式文件
    styles: ['.css', '.less', '.scss', '.sass', '.styl', '.stylus'],
    // 配置文件
    config: ['.json', '.js', '.ts', '.mjs'],
    // 资源文件
    assets: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'],
    // 字体文件
    fonts: ['.woff', '.woff2', '.eot', '.ttf', '.otf'],
    // 文档文件
    docs: ['.md', '.mdx', '.txt'],
    // 数据文件
    data: ['.json', '.yaml', '.yml', '.toml', '.xml']
};
/**
 * 文件类型映射
 */
const EXTENSION_TO_TYPE = {
    // JavaScript
    '.js': 'javascript',
    '.mjs': 'javascript',
    '.cjs': 'javascript',
    // TypeScript
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.d.ts': 'typescript-declaration',
    // JSX
    '.jsx': 'jsx',
    // Vue
    '.vue': 'vue',
    // 样式
    '.css': 'css',
    '.less': 'less',
    '.scss': 'scss',
    '.sass': 'sass',
    '.styl': 'stylus',
    '.stylus': 'stylus',
    // 配置
    '.json': 'json',
    // 资源
    '.png': 'image',
    '.jpg': 'image',
    '.jpeg': 'image',
    '.gif': 'image',
    '.svg': 'svg',
    '.webp': 'image',
    '.ico': 'icon',
    // 字体
    '.woff': 'font',
    '.woff2': 'font',
    '.eot': 'font',
    '.ttf': 'font',
    '.otf': 'font',
    // 文档
    '.md': 'markdown',
    '.mdx': 'mdx',
    '.txt': 'text',
    // 数据
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.toml': 'toml',
    '.xml': 'xml'
};
/**
 * 加载器映射
 */
const EXTENSION_TO_LOADER = {
    '.js': 'js',
    '.mjs': 'js',
    '.cjs': 'js',
    '.ts': 'ts',
    '.tsx': 'tsx',
    '.jsx': 'jsx',
    '.vue': 'vue',
    '.css': 'css',
    '.less': 'less',
    '.scss': 'scss',
    '.sass': 'sass',
    '.styl': 'stylus',
    '.stylus': 'stylus',
    '.json': 'json',
    '.png': 'file',
    '.jpg': 'file',
    '.jpeg': 'file',
    '.gif': 'file',
    '.svg': 'svg',
    '.webp': 'file',
    '.ico': 'file',
    '.woff': 'file',
    '.woff2': 'file',
    '.eot': 'file',
    '.ttf': 'file',
    '.otf': 'file',
    '.md': 'text',
    '.txt': 'text'
};
/**
 * 入口文件优先级
 */
const ENTRY_FILE_PRIORITY = [
    'index.ts',
    'index.tsx',
    'index.js',
    'index.jsx',
    'index.vue',
    'main.ts',
    'main.tsx',
    'main.js',
    'main.jsx',
    'src/index.ts',
    'src/index.tsx',
    'src/index.js',
    'src/index.jsx',
    'src/main.ts',
    'src/main.tsx',
    'src/main.js',
    'src/main.jsx',
    'lib/index.ts',
    'lib/index.js'
];
/**
 * 配置文件优先级
 */
const CONFIG_FILE_PRIORITY = [
    'builder.config.ts',
    'builder.config.js',
    'builder.config.mjs',
    'builder.config.json',
    '.builderrc.ts',
    '.builderrc.js',
    '.builderrc.json',
    'package.json'
];
/**
 * TypeScript 配置文件
 */
const TYPESCRIPT_CONFIG_FILES = [
    'tsconfig.json',
    'tsconfig.build.json',
    'tsconfig.lib.json',
    'tsconfig.prod.json'
];
/**
 * 样式配置文件
 */
const STYLE_CONFIG_FILES = [
    'postcss.config.js',
    'postcss.config.ts',
    'postcss.config.json',
    '.postcssrc',
    '.postcssrc.js',
    '.postcssrc.json',
    'tailwind.config.js',
    'tailwind.config.ts',
    '.stylelintrc',
    '.stylelintrc.js',
    '.stylelintrc.json'
];
/**
 * Vue 配置文件
 */
const VUE_CONFIG_FILES = [
    'vue.config.js',
    'vue.config.ts',
    'vite.config.js',
    'vite.config.ts'
];
/**
 * 忽略的文件模式
 */
const IGNORE_PATTERNS = [
    // 依赖目录
    'node_modules/**',
    // 构建输出
    'dist/**',
    'build/**',
    'lib/**',
    'es/**',
    'cjs/**',
    'umd/**',
    // 缓存目录
    '.cache/**',
    '.temp/**',
    '.tmp/**',
    // 测试文件
    '**/*.test.*',
    '**/*.spec.*',
    '**/__tests__/**',
    '**/__mocks__/**',
    'test/**',
    'tests/**',
    // 配置文件
    '*.config.*',
    '.*rc.*',
    // 文档文件
    '*.md',
    'docs/**',
    // 其他
    '.git/**',
    '.svn/**',
    '.hg/**',
    'coverage/**',
    '*.log'
];
/**
 * 包含的文件模式
 */
const INCLUDE_PATTERNS = {
    typescript: [
        'src/**/*.ts',
        'src/**/*.tsx',
        'lib/**/*.ts',
        'lib/**/*.tsx'
    ],
    javascript: [
        'src/**/*.js',
        'src/**/*.jsx',
        'src/**/*.mjs',
        'lib/**/*.js',
        'lib/**/*.jsx'
    ],
    vue: [
        'src/**/*.vue',
        'components/**/*.vue',
        'lib/**/*.vue'
    ],
    styles: [
        'src/**/*.css',
        'src/**/*.less',
        'src/**/*.scss',
        'src/**/*.sass',
        'src/**/*.styl',
        'styles/**/*'
    ],
    assets: [
        'src/assets/**/*',
        'assets/**/*',
        'public/**/*'
    ]
};
/**
 * 文件大小限制
 */
const FILE_SIZE_LIMITS = {
    // 源代码文件
    source: 1024 * 1024, // 1MB
    // 配置文件
    config: 100 * 1024, // 100KB
    // 样式文件
    style: 500 * 1024, // 500KB
    // 资源文件
    asset: 10 * 1024 * 1024, // 10MB
    // 字体文件
    font: 2 * 1024 * 1024, // 2MB
    // 图片文件
    image: 5 * 1024 * 1024 // 5MB
};
/**
 * 文件编码检测
 */
const ENCODING_DETECTION = {
    // 文本文件
    text: ['utf8', 'utf-8', 'ascii'],
    // 二进制文件
    binary: ['binary', 'base64'],
    // 默认编码
    default: 'utf8'
};
/**
 * 文件 MIME 类型
 */
const MIME_TYPES = {
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.ts': 'application/typescript',
    '.tsx': 'application/typescript',
    '.jsx': 'application/javascript',
    '.vue': 'text/x-vue',
    '.css': 'text/css',
    '.less': 'text/less',
    '.scss': 'text/scss',
    '.sass': 'text/sass',
    '.json': 'application/json',
    '.md': 'text/markdown',
    '.html': 'text/html',
    '.xml': 'application/xml',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf'
};

/**
 * 用户消息常量
 */
/**
 * 成功消息
 */
const SUCCESS_MESSAGES = {
    BUILD_COMPLETE: '构建完成',
    BUILD_SUCCESS: '构建成功',
    CONFIG_LOADED: '配置加载成功',
    CONFIG_VALIDATED: '配置验证通过',
    PLUGIN_LOADED: '插件加载成功',
    ADAPTER_INITIALIZED: '适配器初始化成功',
    CACHE_HIT: '缓存命中',
    WATCH_STARTED: '监听模式已启动',
    LIBRARY_DETECTED: '库类型检测成功'
};
/**
 * 信息消息
 */
const INFO_MESSAGES = {
    BUILD_STARTING: '开始构建...',
    CONFIG_LOADING: '正在加载配置...',
    PLUGIN_LOADING: '正在加载插件...',
    ADAPTER_SWITCHING: '正在切换适配器...',
    CACHE_CLEARING: '正在清理缓存...',
    WATCH_CHANGE_DETECTED: '检测到文件变化',
    LIBRARY_DETECTING: '正在检测库类型...',
    PERFORMANCE_ANALYZING: '正在分析性能...'
};
/**
 * 警告消息
 */
const WARNING_MESSAGES = {
    CONFIG_DEPRECATED: '配置项已废弃',
    PLUGIN_DEPRECATED: '插件已废弃',
    LARGE_BUNDLE_SIZE: '打包文件过大',
    SLOW_BUILD_TIME: '构建时间过长',
    MEMORY_USAGE_HIGH: '内存使用过高',
    CACHE_MISS: '缓存未命中',
    DEPENDENCY_OUTDATED: '依赖版本过旧',
    EXPERIMENTAL_FEATURE: '使用了实验性功能'
};
/**
 * 用户消息
 */
const USER_MESSAGES = {
    BUILD_FAILED: '构建失败',
    CONFIG_INVALID: '配置无效',
    PLUGIN_ERROR: '插件错误',
    ADAPTER_ERROR: '适配器错误',
    FILE_NOT_FOUND: '文件未找到',
    DEPENDENCY_MISSING: '依赖缺失',
    NETWORK_ERROR: '网络错误',
    PERMISSION_DENIED: '权限不足',
    OUT_OF_MEMORY: '内存不足',
    TIMEOUT: '操作超时'
};
/**
 * 进度消息
 */
const PROGRESS_MESSAGES = {
    INITIALIZING: '初始化中...',
    LOADING_CONFIG: '加载配置中...',
    DETECTING_LIBRARY: '检测库类型中...',
    LOADING_PLUGINS: '加载插件中...',
    RESOLVING_MODULES: '解析模块中...',
    TRANSFORMING_CODE: '转换代码中...',
    GENERATING_BUNDLE: '生成打包文件中...',
    WRITING_FILES: '写入文件中...',
    OPTIMIZING: '优化中...',
    FINALIZING: '完成中...'
};
/**
 * 帮助消息
 */
const HELP_MESSAGES = {
    USAGE: '使用方法',
    OPTIONS: '选项',
    EXAMPLES: '示例',
    COMMANDS: '命令',
    CONFIG: '配置',
    PLUGINS: '插件',
    TROUBLESHOOTING: '故障排除',
    FAQ: '常见问题'
};
/**
 * 提示消息
 */
const TIP_MESSAGES = {
    PERFORMANCE_OPTIMIZATION: '性能优化提示',
    BUNDLE_SIZE_OPTIMIZATION: '包大小优化提示',
    CACHE_USAGE: '缓存使用提示',
    PLUGIN_RECOMMENDATION: '插件推荐',
    CONFIG_SUGGESTION: '配置建议',
    BEST_PRACTICES: '最佳实践',
    TROUBLESHOOTING_GUIDE: '故障排除指南'
};
/**
 * 状态消息
 */
const STATUS_MESSAGES = {
    IDLE: '空闲',
    INITIALIZING: '初始化中',
    BUILDING: '构建中',
    WATCHING: '监听中',
    ERROR: '错误',
    COMPLETE: '完成',
    CANCELLED: '已取消',
    PAUSED: '已暂停'
};
/**
 * 确认消息
 */
const CONFIRMATION_MESSAGES = {
    OVERWRITE_FILE: '文件已存在，是否覆盖？',
    DELETE_CACHE: '是否清理缓存？',
    SWITCH_BUNDLER: '是否切换打包器？',
    INSTALL_DEPENDENCY: '是否安装依赖？',
    UPDATE_CONFIG: '是否更新配置？',
    CONTINUE_BUILD: '是否继续构建？',
    ABORT_BUILD: '是否中止构建？'
};
/**
 * 格式化消息模板
 */
const MESSAGE_TEMPLATES = {
    BUILD_TIME: '构建时间: {time}ms',
    BUNDLE_SIZE: '打包大小: {size}',
    MEMORY_USAGE: '内存使用: {memory}MB',
    CACHE_HIT_RATE: '缓存命中率: {rate}%',
    FILE_COUNT: '文件数量: {count}',
    PLUGIN_COUNT: '插件数量: {count}',
    ERROR_COUNT: '错误数量: {count}',
    WARNING_COUNT: '警告数量: {count}',
    PROGRESS: '进度: {current}/{total} ({percent}%)',
    VERSION: '版本: {version}'
};
/**
 * 日志级别消息
 */
const LOG_LEVEL_MESSAGES = {
    silent: '静默模式',
    error: '仅显示错误',
    warn: '显示警告和错误',
    info: '显示信息、警告和错误',
    debug: '显示调试信息',
    verbose: '显示详细信息'
};
/**
 * 命令行消息
 */
const CLI_MESSAGES = {
    WELCOME: '欢迎使用 @ldesign/builder',
    VERSION: '版本信息',
    HELP: '帮助信息',
    INVALID_COMMAND: '无效命令',
    MISSING_ARGUMENT: '缺少参数',
    UNKNOWN_OPTION: '未知选项',
    COMMAND_SUCCESS: '命令执行成功',
    COMMAND_FAILED: '命令执行失败'
};
/**
 * 配置消息
 */
const CONFIG_MESSAGES = {
    LOADING: '正在加载配置文件...',
    LOADED: '配置文件加载成功',
    NOT_FOUND: '未找到配置文件，使用默认配置',
    INVALID: '配置文件格式错误',
    VALIDATING: '正在验证配置...',
    VALIDATED: '配置验证通过',
    MERGING: '正在合并配置...',
    MERGED: '配置合并完成',
    WATCHING: '正在监听配置文件变化...',
    CHANGED: '配置文件已更改，重新加载中...'
};
/**
 * 插件消息
 */
const PLUGIN_MESSAGES = {
    LOADING: '正在加载插件: {name}',
    LOADED: '插件加载成功: {name}',
    FAILED: '插件加载失败: {name}',
    INITIALIZING: '正在初始化插件: {name}',
    INITIALIZED: '插件初始化成功: {name}',
    EXECUTING: '正在执行插件: {name}',
    EXECUTED: '插件执行完成: {name}',
    ERROR: '插件执行错误: {name}',
    DISABLED: '插件已禁用: {name}',
    DEPRECATED: '插件已废弃: {name}'
};
/**
 * 适配器消息
 */
const ADAPTER_MESSAGES = {
    DETECTING: '正在检测可用的适配器...',
    DETECTED: '检测到适配器: {name}',
    INITIALIZING: '正在初始化适配器: {name}',
    INITIALIZED: '适配器初始化成功: {name}',
    SWITCHING: '正在切换到适配器: {name}',
    SWITCHED: '适配器切换成功: {name}',
    NOT_AVAILABLE: '适配器不可用: {name}',
    VERSION_MISMATCH: '适配器版本不匹配: {name}',
    CONFIG_ERROR: '适配器配置错误: {name}'
};
/**
 * 性能消息
 */
const PERFORMANCE_MESSAGES = {
    ANALYZING: '正在分析性能...',
    ANALYZED: '性能分析完成',
    SLOW_BUILD: '构建速度较慢，建议优化',
    LARGE_BUNDLE: '打包文件较大，建议优化',
    HIGH_MEMORY: '内存使用较高，建议优化',
    CACHE_EFFECTIVE: '缓存效果良好',
    CACHE_INEFFECTIVE: '缓存效果不佳，建议检查配置',
    OPTIMIZATION_SUGGESTION: '性能优化建议: {suggestion}'
};

/**
 * 路径处理工具
 *
 * TODO: 后期可以移到 @ldesign/kit 中统一管理
 */
/**
 * 路径工具类
 */
class PathUtils {
    /**
     * 规范化路径（统一使用正斜杠）
     */
    static normalize(filePath) {
        return path$3.posix.normalize(filePath.replace(/\\/g, '/'));
    }
    /**
     * 解析绝对路径
     */
    static resolve(...paths) {
        return path$3.resolve(...paths);
    }
    /**
     * 获取相对路径
     */
    static relative(from, to) {
        return this.normalize(path$3.relative(from, to));
    }
    /**
     * 连接路径
     */
    static join(...paths) {
        return this.normalize(path$3.join(...paths));
    }
    /**
     * 获取目录名
     */
    static dirname(filePath) {
        return this.normalize(path$3.dirname(filePath));
    }
    /**
     * 获取文件名（包含扩展名）
     */
    static basename(filePath, ext) {
        return path$3.basename(filePath, ext);
    }
    /**
     * 获取文件扩展名
     */
    static extname(filePath) {
        return path$3.extname(filePath);
    }
    /**
     * 获取文件名（不包含扩展名）
     */
    static filename(filePath) {
        return this.basename(filePath, this.extname(filePath));
    }
    /**
     * 判断路径是否为绝对路径
     */
    static isAbsolute(filePath) {
        return path$3.isAbsolute(filePath);
    }
    /**
     * 转换为绝对路径
     */
    static toAbsolute(filePath, basePath) {
        if (this.isAbsolute(filePath)) {
            return this.normalize(filePath);
        }
        return this.resolve(basePath || process.cwd(), filePath);
    }
    /**
     * 转换为相对路径
     */
    static toRelative(filePath, basePath) {
        const base = basePath || process.cwd();
        if (this.isAbsolute(filePath)) {
            return this.relative(base, filePath);
        }
        return this.normalize(filePath);
    }
    /**
     * 替换文件扩展名
     */
    static replaceExt(filePath, newExt) {
        const dir = this.dirname(filePath);
        const name = this.filename(filePath);
        const ext = newExt.startsWith('.') ? newExt : `.${newExt}`;
        return this.join(dir, `${name}${ext}`);
    }
    /**
     * 添加后缀到文件名
     */
    static addSuffix(filePath, suffix) {
        const dir = this.dirname(filePath);
        const name = this.filename(filePath);
        const ext = this.extname(filePath);
        return this.join(dir, `${name}${suffix}${ext}`);
    }
    /**
     * 获取路径的各个部分
     */
    static parse(filePath) {
        const parsed = path$3.parse(filePath);
        return {
            root: parsed.root,
            dir: this.normalize(parsed.dir),
            base: parsed.base,
            ext: parsed.ext,
            name: parsed.name
        };
    }
    /**
     * 从路径部分构建路径
     */
    static format(pathObject) {
        return this.normalize(path$3.format(pathObject));
    }
    /**
     * 检查路径是否在指定目录内
     */
    static isInside(filePath, dirPath) {
        const relativePath = this.relative(dirPath, filePath);
        return !relativePath.startsWith('../') && !this.isAbsolute(relativePath);
    }
    /**
     * 获取两个路径的公共父目录
     */
    static getCommonParent(path1, path2) {
        const abs1 = this.toAbsolute(path1);
        const abs2 = this.toAbsolute(path2);
        const parts1 = abs1.split(path$3.sep);
        const parts2 = abs2.split(path$3.sep);
        const commonParts = [];
        const minLength = Math.min(parts1.length, parts2.length);
        for (let i = 0; i < minLength; i++) {
            if (parts1[i] === parts2[i]) {
                commonParts.push(parts1[i]);
            }
            else {
                break;
            }
        }
        return commonParts.join(path$3.sep) || path$3.sep;
    }
    /**
     * 获取路径深度
     */
    static getDepth(filePath) {
        const normalized = this.normalize(filePath);
        if (normalized === '/' || normalized === '.') {
            return 0;
        }
        return normalized.split('/').filter(part => part && part !== '.').length;
    }
    /**
     * 匹配路径模式
     */
    static matchPattern(filePath, pattern) {
        // 简单的 glob 模式匹配
        const regexPattern = pattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(this.normalize(filePath));
    }
    /**
     * 获取文件的 URL 路径
     */
    static toFileURL(filePath) {
        const absolutePath = this.toAbsolute(filePath);
        return `file://${absolutePath.replace(/\\/g, '/')}`;
    }
    /**
     * 从文件 URL 获取路径
     */
    static fromFileURL(fileURL) {
        return this.normalize(url.fileURLToPath(fileURL));
    }
    /**
     * 获取项目根目录
     */
    static findProjectRoot(startPath) {
        let currentPath = startPath || process.cwd();
        while (currentPath !== path$3.dirname(currentPath)) {
            // 检查是否存在 package.json
            const packageJsonPath = this.join(currentPath, 'package.json');
            if (require('fs').existsSync(packageJsonPath)) {
                return currentPath;
            }
            // 检查是否存在 .git 目录
            const gitPath = this.join(currentPath, '.git');
            if (require('fs').existsSync(gitPath)) {
                return currentPath;
            }
            currentPath = path$3.dirname(currentPath);
        }
        // 如果没找到，返回起始路径
        return startPath || process.cwd();
    }
    /**
     * 获取相对于项目根目录的路径
     */
    static getProjectRelativePath(filePath, projectRoot) {
        const root = projectRoot || this.findProjectRoot();
        return this.relative(root, filePath);
    }
    /**
     * 清理路径（移除多余的分隔符和相对路径符号）
     */
    static clean(filePath) {
        return this.normalize(filePath)
            .replace(/\/+/g, '/') // 移除多余的斜杠
            .replace(/\/\.\//g, '/') // 移除 ./
            .replace(/\/\.$/, '') // 移除结尾的 /.
            .replace(/^\.\//g, ''); // 移除开头的 ./
    }
    /**
     * 确保路径以指定字符结尾
     */
    static ensureTrailingSlash(dirPath) {
        const normalized = this.normalize(dirPath);
        return normalized.endsWith('/') ? normalized : `${normalized}/`;
    }
    /**
     * 确保路径不以指定字符结尾
     */
    static removeTrailingSlash(dirPath) {
        const normalized = this.normalize(dirPath);
        return normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
    }
    /**
     * 获取路径的所有父目录
     */
    static getParents(filePath) {
        const parents = [];
        let currentPath = this.dirname(filePath);
        while (currentPath !== this.dirname(currentPath)) {
            parents.push(currentPath);
            currentPath = this.dirname(currentPath);
        }
        return parents;
    }
    /**
     * 检查路径是否为隐藏文件或目录
     */
    static isHidden(filePath) {
        const basename = this.basename(filePath);
        return basename.startsWith('.');
    }
    /**
     * 获取平台特定的路径分隔符
     */
    static get sep() {
        return path$3.sep;
    }
    /**
     * 获取平台特定的路径定界符
     */
    static get delimiter() {
        return path$3.delimiter;
    }
}
// 导出便捷函数
const { normalize, resolve, relative, join, dirname, basename, extname, filename, isAbsolute, toAbsolute, toRelative, replaceExt, addSuffix, parse: parse$4, format, isInside, getCommonParent, getDepth, matchPattern, toFileURL, fromFileURL, findProjectRoot, getProjectRelativePath, clean, ensureTrailingSlash, removeTrailingSlash, getParents, isHidden } = PathUtils;

/**
 * 格式化工具函数
 */
/**
 * 格式化文件大小
 */
function formatFileSize(bytes) {
    if (bytes === 0)
        return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
}
/**
 * 格式化持续时间
 */
function formatDuration(ms) {
    if (ms < 1000) {
        return `${ms}ms`;
    }
    const seconds = ms / 1000;
    if (seconds < 60) {
        return `${seconds.toFixed(1)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
}
/**
 * 格式化百分比
 */
function formatPercentage(value, total) {
    if (total === 0)
        return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
}
/**
 * 格式化数字
 */
function formatNumber(num) {
    return num.toLocaleString();
}
/**
 * 格式化内存使用
 */
function formatMemory(bytes) {
    return formatFileSize(bytes);
}
/**
 * 格式化时间戳
 */
function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString();
}
/**
 * 格式化相对时间
 */
function formatRelativeTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    if (diff < 1000) {
        return '刚刚';
    }
    if (diff < 60000) {
        return `${Math.floor(diff / 1000)}秒前`;
    }
    if (diff < 3600000) {
        return `${Math.floor(diff / 60000)}分钟前`;
    }
    if (diff < 86400000) {
        return `${Math.floor(diff / 3600000)}小时前`;
    }
    return `${Math.floor(diff / 86400000)}天前`;
}
/**
 * 格式化路径（缩短显示）
 */
function formatPath(filePath, maxLength = 50) {
    if (filePath.length <= maxLength) {
        return filePath;
    }
    const parts = filePath.split('/');
    if (parts.length <= 2) {
        return filePath;
    }
    // 保留开头和结尾，中间用 ... 替代
    const start = parts[0];
    const end = parts[parts.length - 1];
    return `${start}/.../${end}`;
}
/**
 * 格式化版本号
 */
function formatVersion(version) {
    // 移除前缀 v
    return version.replace(/^v/, '');
}
/**
 * 格式化构建状态
 */
function formatBuildStatus(status) {
    const statusMap = {
        idle: '空闲',
        initializing: '初始化中',
        building: '构建中',
        watching: '监听中',
        error: '错误',
        complete: '完成',
        cancelled: '已取消'
    };
    return statusMap[status] || status;
}
/**
 * 格式化配置对象
 */
function formatConfig(config, indent = 2) {
    try {
        return JSON.stringify(config, null, indent);
    }
    catch {
        return String(config);
    }
}
/**
 * 格式化列表
 */
function formatList(items, separator = ', ') {
    if (items.length === 0)
        return '';
    if (items.length === 1)
        return items[0];
    if (items.length === 2)
        return items.join(' 和 ');
    const last = items[items.length - 1];
    const rest = items.slice(0, -1);
    return `${rest.join(separator)} 和 ${last}`;
}
/**
 * 格式化表格数据
 */
function formatTable(data, columns) {
    if (data.length === 0)
        return '';
    const keys = columns || Object.keys(data[0]);
    const rows = data.map(row => keys.map(key => String(row[key] || '')));
    // 计算每列的最大宽度
    const widths = keys.map((key, i) => Math.max(key.length, ...rows.map(row => row[i].length)));
    // 生成表格
    const header = keys.map((key, i) => key.padEnd(widths[i])).join(' | ');
    const separator = widths.map(width => '-'.repeat(width)).join('-|-');
    const body = rows.map(row => row.map((cell, i) => cell.padEnd(widths[i])).join(' | ')).join('\n');
    return `${header}\n${separator}\n${body}`;
}
/**
 * 格式化进度条
 */
function formatProgressBar(current, total, width = 20, char = '█') {
    const percentage = total > 0 ? current / total : 0;
    const filled = Math.round(percentage * width);
    const empty = width - filled;
    return char.repeat(filled) + '░'.repeat(empty);
}
/**
 * 格式化键值对
 */
function formatKeyValue(obj, separator = ': ', indent = '  ') {
    return Object.entries(obj)
        .map(([key, value]) => `${indent}${key}${separator}${value}`)
        .join('\n');
}
/**
 * 截断文本
 */
function truncateText(text, maxLength, suffix = '...') {
    if (text.length <= maxLength) {
        return text;
    }
    return text.slice(0, maxLength - suffix.length) + suffix;
}
/**
 * 首字母大写
 */
function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
/**
 * 驼峰转短横线
 */
function camelToKebab(text) {
    return text.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
/**
 * 短横线转驼峰
 */
function kebabToCamel(text) {
    return text.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * 工厂函数 - 便捷创建构建器实例
 */
/**
 * 创建构建器实例的便捷函数
 *
 * @param config 初始配置
 * @param options 构建器选项
 * @returns 构建器实例
 */
function createBuilder(config, options = {}) {
    // 创建默认的日志记录器
    const logger = options.logger || createLogger({
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
    return new LibraryBuilder(builderOptions);
}

var chokidar = {};

var utils$7 = {};

const path$2 = path$3;
const WIN_SLASH = '\\\\/';
const WIN_NO_SLASH = `[^${WIN_SLASH}]`;

/**
 * Posix glob regex
 */

const DOT_LITERAL = '\\.';
const PLUS_LITERAL = '\\+';
const QMARK_LITERAL = '\\?';
const SLASH_LITERAL = '\\/';
const ONE_CHAR = '(?=.)';
const QMARK = '[^/]';
const END_ANCHOR = `(?:${SLASH_LITERAL}|$)`;
const START_ANCHOR = `(?:^|${SLASH_LITERAL})`;
const DOTS_SLASH = `${DOT_LITERAL}{1,2}${END_ANCHOR}`;
const NO_DOT = `(?!${DOT_LITERAL})`;
const NO_DOTS = `(?!${START_ANCHOR}${DOTS_SLASH})`;
const NO_DOT_SLASH = `(?!${DOT_LITERAL}{0,1}${END_ANCHOR})`;
const NO_DOTS_SLASH = `(?!${DOTS_SLASH})`;
const QMARK_NO_DOT = `[^.${SLASH_LITERAL}]`;
const STAR$1 = `${QMARK}*?`;

const POSIX_CHARS = {
  DOT_LITERAL,
  PLUS_LITERAL,
  QMARK_LITERAL,
  SLASH_LITERAL,
  ONE_CHAR,
  QMARK,
  END_ANCHOR,
  DOTS_SLASH,
  NO_DOT,
  NO_DOTS,
  NO_DOT_SLASH,
  NO_DOTS_SLASH,
  QMARK_NO_DOT,
  STAR: STAR$1,
  START_ANCHOR
};

/**
 * Windows glob regex
 */

const WINDOWS_CHARS = {
  ...POSIX_CHARS,

  SLASH_LITERAL: `[${WIN_SLASH}]`,
  QMARK: WIN_NO_SLASH,
  STAR: `${WIN_NO_SLASH}*?`,
  DOTS_SLASH: `${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$)`,
  NO_DOT: `(?!${DOT_LITERAL})`,
  NO_DOTS: `(?!(?:^|[${WIN_SLASH}])${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
  NO_DOT_SLASH: `(?!${DOT_LITERAL}{0,1}(?:[${WIN_SLASH}]|$))`,
  NO_DOTS_SLASH: `(?!${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
  QMARK_NO_DOT: `[^.${WIN_SLASH}]`,
  START_ANCHOR: `(?:^|[${WIN_SLASH}])`,
  END_ANCHOR: `(?:[${WIN_SLASH}]|$)`
};

/**
 * POSIX Bracket Regex
 */

const POSIX_REGEX_SOURCE$1 = {
  alnum: 'a-zA-Z0-9',
  alpha: 'a-zA-Z',
  ascii: '\\x00-\\x7F',
  blank: ' \\t',
  cntrl: '\\x00-\\x1F\\x7F',
  digit: '0-9',
  graph: '\\x21-\\x7E',
  lower: 'a-z',
  print: '\\x20-\\x7E ',
  punct: '\\-!"#$%&\'()\\*+,./:;<=>?@[\\]^_`{|}~',
  space: ' \\t\\r\\n\\v\\f',
  upper: 'A-Z',
  word: 'A-Za-z0-9_',
  xdigit: 'A-Fa-f0-9'
};

var constants$4 = {
  MAX_LENGTH: 1024 * 64,
  POSIX_REGEX_SOURCE: POSIX_REGEX_SOURCE$1,

  // regular expressions
  REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g,
  REGEX_NON_SPECIAL_CHARS: /^[^@![\].,$*+?^{}()|\\/]+/,
  REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/,
  REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g,
  REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g,
  REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g,

  // Replace globs with equivalent patterns to reduce parsing time.
  REPLACEMENTS: {
    '***': '*',
    '**/**': '**',
    '**/**/**': '**'
  },

  // Digits
  CHAR_0: 48, /* 0 */
  CHAR_9: 57, /* 9 */

  // Alphabet chars.
  CHAR_UPPERCASE_A: 65, /* A */
  CHAR_LOWERCASE_A: 97, /* a */
  CHAR_UPPERCASE_Z: 90, /* Z */
  CHAR_LOWERCASE_Z: 122, /* z */

  CHAR_LEFT_PARENTHESES: 40, /* ( */
  CHAR_RIGHT_PARENTHESES: 41, /* ) */

  CHAR_ASTERISK: 42, /* * */

  // Non-alphabetic chars.
  CHAR_AMPERSAND: 38, /* & */
  CHAR_AT: 64, /* @ */
  CHAR_BACKWARD_SLASH: 92, /* \ */
  CHAR_CARRIAGE_RETURN: 13, /* \r */
  CHAR_CIRCUMFLEX_ACCENT: 94, /* ^ */
  CHAR_COLON: 58, /* : */
  CHAR_COMMA: 44, /* , */
  CHAR_DOT: 46, /* . */
  CHAR_DOUBLE_QUOTE: 34, /* " */
  CHAR_EQUAL: 61, /* = */
  CHAR_EXCLAMATION_MARK: 33, /* ! */
  CHAR_FORM_FEED: 12, /* \f */
  CHAR_FORWARD_SLASH: 47, /* / */
  CHAR_GRAVE_ACCENT: 96, /* ` */
  CHAR_HASH: 35, /* # */
  CHAR_HYPHEN_MINUS: 45, /* - */
  CHAR_LEFT_ANGLE_BRACKET: 60, /* < */
  CHAR_LEFT_CURLY_BRACE: 123, /* { */
  CHAR_LEFT_SQUARE_BRACKET: 91, /* [ */
  CHAR_LINE_FEED: 10, /* \n */
  CHAR_NO_BREAK_SPACE: 160, /* \u00A0 */
  CHAR_PERCENT: 37, /* % */
  CHAR_PLUS: 43, /* + */
  CHAR_QUESTION_MARK: 63, /* ? */
  CHAR_RIGHT_ANGLE_BRACKET: 62, /* > */
  CHAR_RIGHT_CURLY_BRACE: 125, /* } */
  CHAR_RIGHT_SQUARE_BRACKET: 93, /* ] */
  CHAR_SEMICOLON: 59, /* ; */
  CHAR_SINGLE_QUOTE: 39, /* ' */
  CHAR_SPACE: 32, /*   */
  CHAR_TAB: 9, /* \t */
  CHAR_UNDERSCORE: 95, /* _ */
  CHAR_VERTICAL_LINE: 124, /* | */
  CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279, /* \uFEFF */

  SEP: path$2.sep,

  /**
   * Create EXTGLOB_CHARS
   */

  extglobChars(chars) {
    return {
      '!': { type: 'negate', open: '(?:(?!(?:', close: `))${chars.STAR})` },
      '?': { type: 'qmark', open: '(?:', close: ')?' },
      '+': { type: 'plus', open: '(?:', close: ')+' },
      '*': { type: 'star', open: '(?:', close: ')*' },
      '@': { type: 'at', open: '(?:', close: ')' }
    };
  },

  /**
   * Create GLOB_CHARS
   */

  globChars(win32) {
    return win32 === true ? WINDOWS_CHARS : POSIX_CHARS;
  }
};

(function (exports) {

	const path = path$3;
	const win32 = process.platform === 'win32';
	const {
	  REGEX_BACKSLASH,
	  REGEX_REMOVE_BACKSLASH,
	  REGEX_SPECIAL_CHARS,
	  REGEX_SPECIAL_CHARS_GLOBAL
	} = constants$4;

	exports.isObject = val => val !== null && typeof val === 'object' && !Array.isArray(val);
	exports.hasRegexChars = str => REGEX_SPECIAL_CHARS.test(str);
	exports.isRegexChar = str => str.length === 1 && exports.hasRegexChars(str);
	exports.escapeRegex = str => str.replace(REGEX_SPECIAL_CHARS_GLOBAL, '\\$1');
	exports.toPosixSlashes = str => str.replace(REGEX_BACKSLASH, '/');

	exports.removeBackslashes = str => {
	  return str.replace(REGEX_REMOVE_BACKSLASH, match => {
	    return match === '\\' ? '' : match;
	  });
	};

	exports.supportsLookbehinds = () => {
	  const segs = process.version.slice(1).split('.').map(Number);
	  if (segs.length === 3 && segs[0] >= 9 || (segs[0] === 8 && segs[1] >= 10)) {
	    return true;
	  }
	  return false;
	};

	exports.isWindows = options => {
	  if (options && typeof options.windows === 'boolean') {
	    return options.windows;
	  }
	  return win32 === true || path.sep === '\\';
	};

	exports.escapeLast = (input, char, lastIdx) => {
	  const idx = input.lastIndexOf(char, lastIdx);
	  if (idx === -1) return input;
	  if (input[idx - 1] === '\\') return exports.escapeLast(input, char, idx - 1);
	  return `${input.slice(0, idx)}\\${input.slice(idx)}`;
	};

	exports.removePrefix = (input, state = {}) => {
	  let output = input;
	  if (output.startsWith('./')) {
	    output = output.slice(2);
	    state.prefix = './';
	  }
	  return output;
	};

	exports.wrapOutput = (input, state = {}, options = {}) => {
	  const prepend = options.contains ? '' : '^';
	  const append = options.contains ? '' : '$';

	  let output = `${prepend}(?:${input})${append}`;
	  if (state.negated === true) {
	    output = `(?:^(?!${output}).*$)`;
	  }
	  return output;
	}; 
} (utils$7));

const utils$6 = utils$7;
const {
  CHAR_ASTERISK,             /* * */
  CHAR_AT,                   /* @ */
  CHAR_BACKWARD_SLASH,       /* \ */
  CHAR_COMMA: CHAR_COMMA$1,                /* , */
  CHAR_DOT: CHAR_DOT$1,                  /* . */
  CHAR_EXCLAMATION_MARK,     /* ! */
  CHAR_FORWARD_SLASH,        /* / */
  CHAR_LEFT_CURLY_BRACE: CHAR_LEFT_CURLY_BRACE$1,     /* { */
  CHAR_LEFT_PARENTHESES: CHAR_LEFT_PARENTHESES$1,     /* ( */
  CHAR_LEFT_SQUARE_BRACKET: CHAR_LEFT_SQUARE_BRACKET$1,  /* [ */
  CHAR_PLUS,                 /* + */
  CHAR_QUESTION_MARK,        /* ? */
  CHAR_RIGHT_CURLY_BRACE: CHAR_RIGHT_CURLY_BRACE$1,    /* } */
  CHAR_RIGHT_PARENTHESES: CHAR_RIGHT_PARENTHESES$1,    /* ) */
  CHAR_RIGHT_SQUARE_BRACKET: CHAR_RIGHT_SQUARE_BRACKET$1  /* ] */
} = constants$4;

const isPathSeparator = code => {
  return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
};

const depth = token => {
  if (token.isPrefix !== true) {
    token.depth = token.isGlobstar ? Infinity : 1;
  }
};

/**
 * Quickly scans a glob pattern and returns an object with a handful of
 * useful properties, like `isGlob`, `path` (the leading non-glob, if it exists),
 * `glob` (the actual pattern), `negated` (true if the path starts with `!` but not
 * with `!(`) and `negatedExtglob` (true if the path starts with `!(`).
 *
 * ```js
 * const pm = require('picomatch');
 * console.log(pm.scan('foo/bar/*.js'));
 * { isGlob: true, input: 'foo/bar/*.js', base: 'foo/bar', glob: '*.js' }
 * ```
 * @param {String} `str`
 * @param {Object} `options`
 * @return {Object} Returns an object with tokens and regex source string.
 * @api public
 */

const scan$1 = (input, options) => {
  const opts = options || {};

  const length = input.length - 1;
  const scanToEnd = opts.parts === true || opts.scanToEnd === true;
  const slashes = [];
  const tokens = [];
  const parts = [];

  let str = input;
  let index = -1;
  let start = 0;
  let lastIndex = 0;
  let isBrace = false;
  let isBracket = false;
  let isGlob = false;
  let isExtglob = false;
  let isGlobstar = false;
  let braceEscaped = false;
  let backslashes = false;
  let negated = false;
  let negatedExtglob = false;
  let finished = false;
  let braces = 0;
  let prev;
  let code;
  let token = { value: '', depth: 0, isGlob: false };

  const eos = () => index >= length;
  const peek = () => str.charCodeAt(index + 1);
  const advance = () => {
    prev = code;
    return str.charCodeAt(++index);
  };

  while (index < length) {
    code = advance();
    let next;

    if (code === CHAR_BACKWARD_SLASH) {
      backslashes = token.backslashes = true;
      code = advance();

      if (code === CHAR_LEFT_CURLY_BRACE$1) {
        braceEscaped = true;
      }
      continue;
    }

    if (braceEscaped === true || code === CHAR_LEFT_CURLY_BRACE$1) {
      braces++;

      while (eos() !== true && (code = advance())) {
        if (code === CHAR_BACKWARD_SLASH) {
          backslashes = token.backslashes = true;
          advance();
          continue;
        }

        if (code === CHAR_LEFT_CURLY_BRACE$1) {
          braces++;
          continue;
        }

        if (braceEscaped !== true && code === CHAR_DOT$1 && (code = advance()) === CHAR_DOT$1) {
          isBrace = token.isBrace = true;
          isGlob = token.isGlob = true;
          finished = true;

          if (scanToEnd === true) {
            continue;
          }

          break;
        }

        if (braceEscaped !== true && code === CHAR_COMMA$1) {
          isBrace = token.isBrace = true;
          isGlob = token.isGlob = true;
          finished = true;

          if (scanToEnd === true) {
            continue;
          }

          break;
        }

        if (code === CHAR_RIGHT_CURLY_BRACE$1) {
          braces--;

          if (braces === 0) {
            braceEscaped = false;
            isBrace = token.isBrace = true;
            finished = true;
            break;
          }
        }
      }

      if (scanToEnd === true) {
        continue;
      }

      break;
    }

    if (code === CHAR_FORWARD_SLASH) {
      slashes.push(index);
      tokens.push(token);
      token = { value: '', depth: 0, isGlob: false };

      if (finished === true) continue;
      if (prev === CHAR_DOT$1 && index === (start + 1)) {
        start += 2;
        continue;
      }

      lastIndex = index + 1;
      continue;
    }

    if (opts.noext !== true) {
      const isExtglobChar = code === CHAR_PLUS
        || code === CHAR_AT
        || code === CHAR_ASTERISK
        || code === CHAR_QUESTION_MARK
        || code === CHAR_EXCLAMATION_MARK;

      if (isExtglobChar === true && peek() === CHAR_LEFT_PARENTHESES$1) {
        isGlob = token.isGlob = true;
        isExtglob = token.isExtglob = true;
        finished = true;
        if (code === CHAR_EXCLAMATION_MARK && index === start) {
          negatedExtglob = true;
        }

        if (scanToEnd === true) {
          while (eos() !== true && (code = advance())) {
            if (code === CHAR_BACKWARD_SLASH) {
              backslashes = token.backslashes = true;
              code = advance();
              continue;
            }

            if (code === CHAR_RIGHT_PARENTHESES$1) {
              isGlob = token.isGlob = true;
              finished = true;
              break;
            }
          }
          continue;
        }
        break;
      }
    }

    if (code === CHAR_ASTERISK) {
      if (prev === CHAR_ASTERISK) isGlobstar = token.isGlobstar = true;
      isGlob = token.isGlob = true;
      finished = true;

      if (scanToEnd === true) {
        continue;
      }
      break;
    }

    if (code === CHAR_QUESTION_MARK) {
      isGlob = token.isGlob = true;
      finished = true;

      if (scanToEnd === true) {
        continue;
      }
      break;
    }

    if (code === CHAR_LEFT_SQUARE_BRACKET$1) {
      while (eos() !== true && (next = advance())) {
        if (next === CHAR_BACKWARD_SLASH) {
          backslashes = token.backslashes = true;
          advance();
          continue;
        }

        if (next === CHAR_RIGHT_SQUARE_BRACKET$1) {
          isBracket = token.isBracket = true;
          isGlob = token.isGlob = true;
          finished = true;
          break;
        }
      }

      if (scanToEnd === true) {
        continue;
      }

      break;
    }

    if (opts.nonegate !== true && code === CHAR_EXCLAMATION_MARK && index === start) {
      negated = token.negated = true;
      start++;
      continue;
    }

    if (opts.noparen !== true && code === CHAR_LEFT_PARENTHESES$1) {
      isGlob = token.isGlob = true;

      if (scanToEnd === true) {
        while (eos() !== true && (code = advance())) {
          if (code === CHAR_LEFT_PARENTHESES$1) {
            backslashes = token.backslashes = true;
            code = advance();
            continue;
          }

          if (code === CHAR_RIGHT_PARENTHESES$1) {
            finished = true;
            break;
          }
        }
        continue;
      }
      break;
    }

    if (isGlob === true) {
      finished = true;

      if (scanToEnd === true) {
        continue;
      }

      break;
    }
  }

  if (opts.noext === true) {
    isExtglob = false;
    isGlob = false;
  }

  let base = str;
  let prefix = '';
  let glob = '';

  if (start > 0) {
    prefix = str.slice(0, start);
    str = str.slice(start);
    lastIndex -= start;
  }

  if (base && isGlob === true && lastIndex > 0) {
    base = str.slice(0, lastIndex);
    glob = str.slice(lastIndex);
  } else if (isGlob === true) {
    base = '';
    glob = str;
  } else {
    base = str;
  }

  if (base && base !== '' && base !== '/' && base !== str) {
    if (isPathSeparator(base.charCodeAt(base.length - 1))) {
      base = base.slice(0, -1);
    }
  }

  if (opts.unescape === true) {
    if (glob) glob = utils$6.removeBackslashes(glob);

    if (base && backslashes === true) {
      base = utils$6.removeBackslashes(base);
    }
  }

  const state = {
    prefix,
    input,
    start,
    base,
    glob,
    isBrace,
    isBracket,
    isGlob,
    isExtglob,
    isGlobstar,
    negated,
    negatedExtglob
  };

  if (opts.tokens === true) {
    state.maxDepth = 0;
    if (!isPathSeparator(code)) {
      tokens.push(token);
    }
    state.tokens = tokens;
  }

  if (opts.parts === true || opts.tokens === true) {
    let prevIndex;

    for (let idx = 0; idx < slashes.length; idx++) {
      const n = prevIndex ? prevIndex + 1 : start;
      const i = slashes[idx];
      const value = input.slice(n, i);
      if (opts.tokens) {
        if (idx === 0 && start !== 0) {
          tokens[idx].isPrefix = true;
          tokens[idx].value = prefix;
        } else {
          tokens[idx].value = value;
        }
        depth(tokens[idx]);
        state.maxDepth += tokens[idx].depth;
      }
      if (idx !== 0 || value !== '') {
        parts.push(value);
      }
      prevIndex = i;
    }

    if (prevIndex && prevIndex + 1 < input.length) {
      const value = input.slice(prevIndex + 1);
      parts.push(value);

      if (opts.tokens) {
        tokens[tokens.length - 1].value = value;
        depth(tokens[tokens.length - 1]);
        state.maxDepth += tokens[tokens.length - 1].depth;
      }
    }

    state.slashes = slashes;
    state.parts = parts;
  }

  return state;
};

var scan_1 = scan$1;

const constants$3 = constants$4;
const utils$5 = utils$7;

/**
 * Constants
 */

const {
  MAX_LENGTH: MAX_LENGTH$1,
  POSIX_REGEX_SOURCE,
  REGEX_NON_SPECIAL_CHARS,
  REGEX_SPECIAL_CHARS_BACKREF,
  REPLACEMENTS
} = constants$3;

/**
 * Helpers
 */

const expandRange = (args, options) => {
  if (typeof options.expandRange === 'function') {
    return options.expandRange(...args, options);
  }

  args.sort();
  const value = `[${args.join('-')}]`;

  try {
    /* eslint-disable-next-line no-new */
    new RegExp(value);
  } catch (ex) {
    return args.map(v => utils$5.escapeRegex(v)).join('..');
  }

  return value;
};

/**
 * Create the message for a syntax error
 */

const syntaxError = (type, char) => {
  return `Missing ${type}: "${char}" - use "\\\\${char}" to match literal characters`;
};

/**
 * Parse the given input string.
 * @param {String} input
 * @param {Object} options
 * @return {Object}
 */

const parse$3 = (input, options) => {
  if (typeof input !== 'string') {
    throw new TypeError('Expected a string');
  }

  input = REPLACEMENTS[input] || input;

  const opts = { ...options };
  const max = typeof opts.maxLength === 'number' ? Math.min(MAX_LENGTH$1, opts.maxLength) : MAX_LENGTH$1;

  let len = input.length;
  if (len > max) {
    throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
  }

  const bos = { type: 'bos', value: '', output: opts.prepend || '' };
  const tokens = [bos];

  const capture = opts.capture ? '' : '?:';
  const win32 = utils$5.isWindows(options);

  // create constants based on platform, for windows or posix
  const PLATFORM_CHARS = constants$3.globChars(win32);
  const EXTGLOB_CHARS = constants$3.extglobChars(PLATFORM_CHARS);

  const {
    DOT_LITERAL,
    PLUS_LITERAL,
    SLASH_LITERAL,
    ONE_CHAR,
    DOTS_SLASH,
    NO_DOT,
    NO_DOT_SLASH,
    NO_DOTS_SLASH,
    QMARK,
    QMARK_NO_DOT,
    STAR,
    START_ANCHOR
  } = PLATFORM_CHARS;

  const globstar = opts => {
    return `(${capture}(?:(?!${START_ANCHOR}${opts.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
  };

  const nodot = opts.dot ? '' : NO_DOT;
  const qmarkNoDot = opts.dot ? QMARK : QMARK_NO_DOT;
  let star = opts.bash === true ? globstar(opts) : STAR;

  if (opts.capture) {
    star = `(${star})`;
  }

  // minimatch options support
  if (typeof opts.noext === 'boolean') {
    opts.noextglob = opts.noext;
  }

  const state = {
    input,
    index: -1,
    start: 0,
    dot: opts.dot === true,
    consumed: '',
    output: '',
    prefix: '',
    backtrack: false,
    negated: false,
    brackets: 0,
    braces: 0,
    parens: 0,
    quotes: 0,
    globstar: false,
    tokens
  };

  input = utils$5.removePrefix(input, state);
  len = input.length;

  const extglobs = [];
  const braces = [];
  const stack = [];
  let prev = bos;
  let value;

  /**
   * Tokenizing helpers
   */

  const eos = () => state.index === len - 1;
  const peek = state.peek = (n = 1) => input[state.index + n];
  const advance = state.advance = () => input[++state.index] || '';
  const remaining = () => input.slice(state.index + 1);
  const consume = (value = '', num = 0) => {
    state.consumed += value;
    state.index += num;
  };

  const append = token => {
    state.output += token.output != null ? token.output : token.value;
    consume(token.value);
  };

  const negate = () => {
    let count = 1;

    while (peek() === '!' && (peek(2) !== '(' || peek(3) === '?')) {
      advance();
      state.start++;
      count++;
    }

    if (count % 2 === 0) {
      return false;
    }

    state.negated = true;
    state.start++;
    return true;
  };

  const increment = type => {
    state[type]++;
    stack.push(type);
  };

  const decrement = type => {
    state[type]--;
    stack.pop();
  };

  /**
   * Push tokens onto the tokens array. This helper speeds up
   * tokenizing by 1) helping us avoid backtracking as much as possible,
   * and 2) helping us avoid creating extra tokens when consecutive
   * characters are plain text. This improves performance and simplifies
   * lookbehinds.
   */

  const push = tok => {
    if (prev.type === 'globstar') {
      const isBrace = state.braces > 0 && (tok.type === 'comma' || tok.type === 'brace');
      const isExtglob = tok.extglob === true || (extglobs.length && (tok.type === 'pipe' || tok.type === 'paren'));

      if (tok.type !== 'slash' && tok.type !== 'paren' && !isBrace && !isExtglob) {
        state.output = state.output.slice(0, -prev.output.length);
        prev.type = 'star';
        prev.value = '*';
        prev.output = star;
        state.output += prev.output;
      }
    }

    if (extglobs.length && tok.type !== 'paren') {
      extglobs[extglobs.length - 1].inner += tok.value;
    }

    if (tok.value || tok.output) append(tok);
    if (prev && prev.type === 'text' && tok.type === 'text') {
      prev.value += tok.value;
      prev.output = (prev.output || '') + tok.value;
      return;
    }

    tok.prev = prev;
    tokens.push(tok);
    prev = tok;
  };

  const extglobOpen = (type, value) => {
    const token = { ...EXTGLOB_CHARS[value], conditions: 1, inner: '' };

    token.prev = prev;
    token.parens = state.parens;
    token.output = state.output;
    const output = (opts.capture ? '(' : '') + token.open;

    increment('parens');
    push({ type, value, output: state.output ? '' : ONE_CHAR });
    push({ type: 'paren', extglob: true, value: advance(), output });
    extglobs.push(token);
  };

  const extglobClose = token => {
    let output = token.close + (opts.capture ? ')' : '');
    let rest;

    if (token.type === 'negate') {
      let extglobStar = star;

      if (token.inner && token.inner.length > 1 && token.inner.includes('/')) {
        extglobStar = globstar(opts);
      }

      if (extglobStar !== star || eos() || /^\)+$/.test(remaining())) {
        output = token.close = `)$))${extglobStar}`;
      }

      if (token.inner.includes('*') && (rest = remaining()) && /^\.[^\\/.]+$/.test(rest)) {
        // Any non-magical string (`.ts`) or even nested expression (`.{ts,tsx}`) can follow after the closing parenthesis.
        // In this case, we need to parse the string and use it in the output of the original pattern.
        // Suitable patterns: `/!(*.d).ts`, `/!(*.d).{ts,tsx}`, `**/!(*-dbg).@(js)`.
        //
        // Disabling the `fastpaths` option due to a problem with parsing strings as `.ts` in the pattern like `**/!(*.d).ts`.
        const expression = parse$3(rest, { ...options, fastpaths: false }).output;

        output = token.close = `)${expression})${extglobStar})`;
      }

      if (token.prev.type === 'bos') {
        state.negatedExtglob = true;
      }
    }

    push({ type: 'paren', extglob: true, value, output });
    decrement('parens');
  };

  /**
   * Fast paths
   */

  if (opts.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(input)) {
    let backslashes = false;

    let output = input.replace(REGEX_SPECIAL_CHARS_BACKREF, (m, esc, chars, first, rest, index) => {
      if (first === '\\') {
        backslashes = true;
        return m;
      }

      if (first === '?') {
        if (esc) {
          return esc + first + (rest ? QMARK.repeat(rest.length) : '');
        }
        if (index === 0) {
          return qmarkNoDot + (rest ? QMARK.repeat(rest.length) : '');
        }
        return QMARK.repeat(chars.length);
      }

      if (first === '.') {
        return DOT_LITERAL.repeat(chars.length);
      }

      if (first === '*') {
        if (esc) {
          return esc + first + (rest ? star : '');
        }
        return star;
      }
      return esc ? m : `\\${m}`;
    });

    if (backslashes === true) {
      if (opts.unescape === true) {
        output = output.replace(/\\/g, '');
      } else {
        output = output.replace(/\\+/g, m => {
          return m.length % 2 === 0 ? '\\\\' : (m ? '\\' : '');
        });
      }
    }

    if (output === input && opts.contains === true) {
      state.output = input;
      return state;
    }

    state.output = utils$5.wrapOutput(output, state, options);
    return state;
  }

  /**
   * Tokenize input until we reach end-of-string
   */

  while (!eos()) {
    value = advance();

    if (value === '\u0000') {
      continue;
    }

    /**
     * Escaped characters
     */

    if (value === '\\') {
      const next = peek();

      if (next === '/' && opts.bash !== true) {
        continue;
      }

      if (next === '.' || next === ';') {
        continue;
      }

      if (!next) {
        value += '\\';
        push({ type: 'text', value });
        continue;
      }

      // collapse slashes to reduce potential for exploits
      const match = /^\\+/.exec(remaining());
      let slashes = 0;

      if (match && match[0].length > 2) {
        slashes = match[0].length;
        state.index += slashes;
        if (slashes % 2 !== 0) {
          value += '\\';
        }
      }

      if (opts.unescape === true) {
        value = advance();
      } else {
        value += advance();
      }

      if (state.brackets === 0) {
        push({ type: 'text', value });
        continue;
      }
    }

    /**
     * If we're inside a regex character class, continue
     * until we reach the closing bracket.
     */

    if (state.brackets > 0 && (value !== ']' || prev.value === '[' || prev.value === '[^')) {
      if (opts.posix !== false && value === ':') {
        const inner = prev.value.slice(1);
        if (inner.includes('[')) {
          prev.posix = true;

          if (inner.includes(':')) {
            const idx = prev.value.lastIndexOf('[');
            const pre = prev.value.slice(0, idx);
            const rest = prev.value.slice(idx + 2);
            const posix = POSIX_REGEX_SOURCE[rest];
            if (posix) {
              prev.value = pre + posix;
              state.backtrack = true;
              advance();

              if (!bos.output && tokens.indexOf(prev) === 1) {
                bos.output = ONE_CHAR;
              }
              continue;
            }
          }
        }
      }

      if ((value === '[' && peek() !== ':') || (value === '-' && peek() === ']')) {
        value = `\\${value}`;
      }

      if (value === ']' && (prev.value === '[' || prev.value === '[^')) {
        value = `\\${value}`;
      }

      if (opts.posix === true && value === '!' && prev.value === '[') {
        value = '^';
      }

      prev.value += value;
      append({ value });
      continue;
    }

    /**
     * If we're inside a quoted string, continue
     * until we reach the closing double quote.
     */

    if (state.quotes === 1 && value !== '"') {
      value = utils$5.escapeRegex(value);
      prev.value += value;
      append({ value });
      continue;
    }

    /**
     * Double quotes
     */

    if (value === '"') {
      state.quotes = state.quotes === 1 ? 0 : 1;
      if (opts.keepQuotes === true) {
        push({ type: 'text', value });
      }
      continue;
    }

    /**
     * Parentheses
     */

    if (value === '(') {
      increment('parens');
      push({ type: 'paren', value });
      continue;
    }

    if (value === ')') {
      if (state.parens === 0 && opts.strictBrackets === true) {
        throw new SyntaxError(syntaxError('opening', '('));
      }

      const extglob = extglobs[extglobs.length - 1];
      if (extglob && state.parens === extglob.parens + 1) {
        extglobClose(extglobs.pop());
        continue;
      }

      push({ type: 'paren', value, output: state.parens ? ')' : '\\)' });
      decrement('parens');
      continue;
    }

    /**
     * Square brackets
     */

    if (value === '[') {
      if (opts.nobracket === true || !remaining().includes(']')) {
        if (opts.nobracket !== true && opts.strictBrackets === true) {
          throw new SyntaxError(syntaxError('closing', ']'));
        }

        value = `\\${value}`;
      } else {
        increment('brackets');
      }

      push({ type: 'bracket', value });
      continue;
    }

    if (value === ']') {
      if (opts.nobracket === true || (prev && prev.type === 'bracket' && prev.value.length === 1)) {
        push({ type: 'text', value, output: `\\${value}` });
        continue;
      }

      if (state.brackets === 0) {
        if (opts.strictBrackets === true) {
          throw new SyntaxError(syntaxError('opening', '['));
        }

        push({ type: 'text', value, output: `\\${value}` });
        continue;
      }

      decrement('brackets');

      const prevValue = prev.value.slice(1);
      if (prev.posix !== true && prevValue[0] === '^' && !prevValue.includes('/')) {
        value = `/${value}`;
      }

      prev.value += value;
      append({ value });

      // when literal brackets are explicitly disabled
      // assume we should match with a regex character class
      if (opts.literalBrackets === false || utils$5.hasRegexChars(prevValue)) {
        continue;
      }

      const escaped = utils$5.escapeRegex(prev.value);
      state.output = state.output.slice(0, -prev.value.length);

      // when literal brackets are explicitly enabled
      // assume we should escape the brackets to match literal characters
      if (opts.literalBrackets === true) {
        state.output += escaped;
        prev.value = escaped;
        continue;
      }

      // when the user specifies nothing, try to match both
      prev.value = `(${capture}${escaped}|${prev.value})`;
      state.output += prev.value;
      continue;
    }

    /**
     * Braces
     */

    if (value === '{' && opts.nobrace !== true) {
      increment('braces');

      const open = {
        type: 'brace',
        value,
        output: '(',
        outputIndex: state.output.length,
        tokensIndex: state.tokens.length
      };

      braces.push(open);
      push(open);
      continue;
    }

    if (value === '}') {
      const brace = braces[braces.length - 1];

      if (opts.nobrace === true || !brace) {
        push({ type: 'text', value, output: value });
        continue;
      }

      let output = ')';

      if (brace.dots === true) {
        const arr = tokens.slice();
        const range = [];

        for (let i = arr.length - 1; i >= 0; i--) {
          tokens.pop();
          if (arr[i].type === 'brace') {
            break;
          }
          if (arr[i].type !== 'dots') {
            range.unshift(arr[i].value);
          }
        }

        output = expandRange(range, opts);
        state.backtrack = true;
      }

      if (brace.comma !== true && brace.dots !== true) {
        const out = state.output.slice(0, brace.outputIndex);
        const toks = state.tokens.slice(brace.tokensIndex);
        brace.value = brace.output = '\\{';
        value = output = '\\}';
        state.output = out;
        for (const t of toks) {
          state.output += (t.output || t.value);
        }
      }

      push({ type: 'brace', value, output });
      decrement('braces');
      braces.pop();
      continue;
    }

    /**
     * Pipes
     */

    if (value === '|') {
      if (extglobs.length > 0) {
        extglobs[extglobs.length - 1].conditions++;
      }
      push({ type: 'text', value });
      continue;
    }

    /**
     * Commas
     */

    if (value === ',') {
      let output = value;

      const brace = braces[braces.length - 1];
      if (brace && stack[stack.length - 1] === 'braces') {
        brace.comma = true;
        output = '|';
      }

      push({ type: 'comma', value, output });
      continue;
    }

    /**
     * Slashes
     */

    if (value === '/') {
      // if the beginning of the glob is "./", advance the start
      // to the current index, and don't add the "./" characters
      // to the state. This greatly simplifies lookbehinds when
      // checking for BOS characters like "!" and "." (not "./")
      if (prev.type === 'dot' && state.index === state.start + 1) {
        state.start = state.index + 1;
        state.consumed = '';
        state.output = '';
        tokens.pop();
        prev = bos; // reset "prev" to the first token
        continue;
      }

      push({ type: 'slash', value, output: SLASH_LITERAL });
      continue;
    }

    /**
     * Dots
     */

    if (value === '.') {
      if (state.braces > 0 && prev.type === 'dot') {
        if (prev.value === '.') prev.output = DOT_LITERAL;
        const brace = braces[braces.length - 1];
        prev.type = 'dots';
        prev.output += value;
        prev.value += value;
        brace.dots = true;
        continue;
      }

      if ((state.braces + state.parens) === 0 && prev.type !== 'bos' && prev.type !== 'slash') {
        push({ type: 'text', value, output: DOT_LITERAL });
        continue;
      }

      push({ type: 'dot', value, output: DOT_LITERAL });
      continue;
    }

    /**
     * Question marks
     */

    if (value === '?') {
      const isGroup = prev && prev.value === '(';
      if (!isGroup && opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
        extglobOpen('qmark', value);
        continue;
      }

      if (prev && prev.type === 'paren') {
        const next = peek();
        let output = value;

        if (next === '<' && !utils$5.supportsLookbehinds()) {
          throw new Error('Node.js v10 or higher is required for regex lookbehinds');
        }

        if ((prev.value === '(' && !/[!=<:]/.test(next)) || (next === '<' && !/<([!=]|\w+>)/.test(remaining()))) {
          output = `\\${value}`;
        }

        push({ type: 'text', value, output });
        continue;
      }

      if (opts.dot !== true && (prev.type === 'slash' || prev.type === 'bos')) {
        push({ type: 'qmark', value, output: QMARK_NO_DOT });
        continue;
      }

      push({ type: 'qmark', value, output: QMARK });
      continue;
    }

    /**
     * Exclamation
     */

    if (value === '!') {
      if (opts.noextglob !== true && peek() === '(') {
        if (peek(2) !== '?' || !/[!=<:]/.test(peek(3))) {
          extglobOpen('negate', value);
          continue;
        }
      }

      if (opts.nonegate !== true && state.index === 0) {
        negate();
        continue;
      }
    }

    /**
     * Plus
     */

    if (value === '+') {
      if (opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
        extglobOpen('plus', value);
        continue;
      }

      if ((prev && prev.value === '(') || opts.regex === false) {
        push({ type: 'plus', value, output: PLUS_LITERAL });
        continue;
      }

      if ((prev && (prev.type === 'bracket' || prev.type === 'paren' || prev.type === 'brace')) || state.parens > 0) {
        push({ type: 'plus', value });
        continue;
      }

      push({ type: 'plus', value: PLUS_LITERAL });
      continue;
    }

    /**
     * Plain text
     */

    if (value === '@') {
      if (opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
        push({ type: 'at', extglob: true, value, output: '' });
        continue;
      }

      push({ type: 'text', value });
      continue;
    }

    /**
     * Plain text
     */

    if (value !== '*') {
      if (value === '$' || value === '^') {
        value = `\\${value}`;
      }

      const match = REGEX_NON_SPECIAL_CHARS.exec(remaining());
      if (match) {
        value += match[0];
        state.index += match[0].length;
      }

      push({ type: 'text', value });
      continue;
    }

    /**
     * Stars
     */

    if (prev && (prev.type === 'globstar' || prev.star === true)) {
      prev.type = 'star';
      prev.star = true;
      prev.value += value;
      prev.output = star;
      state.backtrack = true;
      state.globstar = true;
      consume(value);
      continue;
    }

    let rest = remaining();
    if (opts.noextglob !== true && /^\([^?]/.test(rest)) {
      extglobOpen('star', value);
      continue;
    }

    if (prev.type === 'star') {
      if (opts.noglobstar === true) {
        consume(value);
        continue;
      }

      const prior = prev.prev;
      const before = prior.prev;
      const isStart = prior.type === 'slash' || prior.type === 'bos';
      const afterStar = before && (before.type === 'star' || before.type === 'globstar');

      if (opts.bash === true && (!isStart || (rest[0] && rest[0] !== '/'))) {
        push({ type: 'star', value, output: '' });
        continue;
      }

      const isBrace = state.braces > 0 && (prior.type === 'comma' || prior.type === 'brace');
      const isExtglob = extglobs.length && (prior.type === 'pipe' || prior.type === 'paren');
      if (!isStart && prior.type !== 'paren' && !isBrace && !isExtglob) {
        push({ type: 'star', value, output: '' });
        continue;
      }

      // strip consecutive `/**/`
      while (rest.slice(0, 3) === '/**') {
        const after = input[state.index + 4];
        if (after && after !== '/') {
          break;
        }
        rest = rest.slice(3);
        consume('/**', 3);
      }

      if (prior.type === 'bos' && eos()) {
        prev.type = 'globstar';
        prev.value += value;
        prev.output = globstar(opts);
        state.output = prev.output;
        state.globstar = true;
        consume(value);
        continue;
      }

      if (prior.type === 'slash' && prior.prev.type !== 'bos' && !afterStar && eos()) {
        state.output = state.output.slice(0, -(prior.output + prev.output).length);
        prior.output = `(?:${prior.output}`;

        prev.type = 'globstar';
        prev.output = globstar(opts) + (opts.strictSlashes ? ')' : '|$)');
        prev.value += value;
        state.globstar = true;
        state.output += prior.output + prev.output;
        consume(value);
        continue;
      }

      if (prior.type === 'slash' && prior.prev.type !== 'bos' && rest[0] === '/') {
        const end = rest[1] !== void 0 ? '|$' : '';

        state.output = state.output.slice(0, -(prior.output + prev.output).length);
        prior.output = `(?:${prior.output}`;

        prev.type = 'globstar';
        prev.output = `${globstar(opts)}${SLASH_LITERAL}|${SLASH_LITERAL}${end})`;
        prev.value += value;

        state.output += prior.output + prev.output;
        state.globstar = true;

        consume(value + advance());

        push({ type: 'slash', value: '/', output: '' });
        continue;
      }

      if (prior.type === 'bos' && rest[0] === '/') {
        prev.type = 'globstar';
        prev.value += value;
        prev.output = `(?:^|${SLASH_LITERAL}|${globstar(opts)}${SLASH_LITERAL})`;
        state.output = prev.output;
        state.globstar = true;
        consume(value + advance());
        push({ type: 'slash', value: '/', output: '' });
        continue;
      }

      // remove single star from output
      state.output = state.output.slice(0, -prev.output.length);

      // reset previous token to globstar
      prev.type = 'globstar';
      prev.output = globstar(opts);
      prev.value += value;

      // reset output with globstar
      state.output += prev.output;
      state.globstar = true;
      consume(value);
      continue;
    }

    const token = { type: 'star', value, output: star };

    if (opts.bash === true) {
      token.output = '.*?';
      if (prev.type === 'bos' || prev.type === 'slash') {
        token.output = nodot + token.output;
      }
      push(token);
      continue;
    }

    if (prev && (prev.type === 'bracket' || prev.type === 'paren') && opts.regex === true) {
      token.output = value;
      push(token);
      continue;
    }

    if (state.index === state.start || prev.type === 'slash' || prev.type === 'dot') {
      if (prev.type === 'dot') {
        state.output += NO_DOT_SLASH;
        prev.output += NO_DOT_SLASH;

      } else if (opts.dot === true) {
        state.output += NO_DOTS_SLASH;
        prev.output += NO_DOTS_SLASH;

      } else {
        state.output += nodot;
        prev.output += nodot;
      }

      if (peek() !== '*') {
        state.output += ONE_CHAR;
        prev.output += ONE_CHAR;
      }
    }

    push(token);
  }

  while (state.brackets > 0) {
    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', ']'));
    state.output = utils$5.escapeLast(state.output, '[');
    decrement('brackets');
  }

  while (state.parens > 0) {
    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', ')'));
    state.output = utils$5.escapeLast(state.output, '(');
    decrement('parens');
  }

  while (state.braces > 0) {
    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', '}'));
    state.output = utils$5.escapeLast(state.output, '{');
    decrement('braces');
  }

  if (opts.strictSlashes !== true && (prev.type === 'star' || prev.type === 'bracket')) {
    push({ type: 'maybe_slash', value: '', output: `${SLASH_LITERAL}?` });
  }

  // rebuild the output if we had to backtrack at any point
  if (state.backtrack === true) {
    state.output = '';

    for (const token of state.tokens) {
      state.output += token.output != null ? token.output : token.value;

      if (token.suffix) {
        state.output += token.suffix;
      }
    }
  }

  return state;
};

/**
 * Fast paths for creating regular expressions for common glob patterns.
 * This can significantly speed up processing and has very little downside
 * impact when none of the fast paths match.
 */

parse$3.fastpaths = (input, options) => {
  const opts = { ...options };
  const max = typeof opts.maxLength === 'number' ? Math.min(MAX_LENGTH$1, opts.maxLength) : MAX_LENGTH$1;
  const len = input.length;
  if (len > max) {
    throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
  }

  input = REPLACEMENTS[input] || input;
  const win32 = utils$5.isWindows(options);

  // create constants based on platform, for windows or posix
  const {
    DOT_LITERAL,
    SLASH_LITERAL,
    ONE_CHAR,
    DOTS_SLASH,
    NO_DOT,
    NO_DOTS,
    NO_DOTS_SLASH,
    STAR,
    START_ANCHOR
  } = constants$3.globChars(win32);

  const nodot = opts.dot ? NO_DOTS : NO_DOT;
  const slashDot = opts.dot ? NO_DOTS_SLASH : NO_DOT;
  const capture = opts.capture ? '' : '?:';
  const state = { negated: false, prefix: '' };
  let star = opts.bash === true ? '.*?' : STAR;

  if (opts.capture) {
    star = `(${star})`;
  }

  const globstar = opts => {
    if (opts.noglobstar === true) return star;
    return `(${capture}(?:(?!${START_ANCHOR}${opts.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
  };

  const create = str => {
    switch (str) {
      case '*':
        return `${nodot}${ONE_CHAR}${star}`;

      case '.*':
        return `${DOT_LITERAL}${ONE_CHAR}${star}`;

      case '*.*':
        return `${nodot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;

      case '*/*':
        return `${nodot}${star}${SLASH_LITERAL}${ONE_CHAR}${slashDot}${star}`;

      case '**':
        return nodot + globstar(opts);

      case '**/*':
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${ONE_CHAR}${star}`;

      case '**/*.*':
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;

      case '**/.*':
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${DOT_LITERAL}${ONE_CHAR}${star}`;

      default: {
        const match = /^(.*?)\.(\w+)$/.exec(str);
        if (!match) return;

        const source = create(match[1]);
        if (!source) return;

        return source + DOT_LITERAL + match[2];
      }
    }
  };

  const output = utils$5.removePrefix(input, state);
  let source = create(output);

  if (source && opts.strictSlashes !== true) {
    source += `${SLASH_LITERAL}?`;
  }

  return source;
};

var parse_1$1 = parse$3;

const path$1 = path$3;
const scan = scan_1;
const parse$2 = parse_1$1;
const utils$4 = utils$7;
const constants$2 = constants$4;
const isObject$1 = val => val && typeof val === 'object' && !Array.isArray(val);

/**
 * Creates a matcher function from one or more glob patterns. The
 * returned function takes a string to match as its first argument,
 * and returns true if the string is a match. The returned matcher
 * function also takes a boolean as the second argument that, when true,
 * returns an object with additional information.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch(glob[, options]);
 *
 * const isMatch = picomatch('*.!(*a)');
 * console.log(isMatch('a.a')); //=> false
 * console.log(isMatch('a.b')); //=> true
 * ```
 * @name picomatch
 * @param {String|Array} `globs` One or more glob patterns.
 * @param {Object=} `options`
 * @return {Function=} Returns a matcher function.
 * @api public
 */

const picomatch$3 = (glob, options, returnState = false) => {
  if (Array.isArray(glob)) {
    const fns = glob.map(input => picomatch$3(input, options, returnState));
    const arrayMatcher = str => {
      for (const isMatch of fns) {
        const state = isMatch(str);
        if (state) return state;
      }
      return false;
    };
    return arrayMatcher;
  }

  const isState = isObject$1(glob) && glob.tokens && glob.input;

  if (glob === '' || (typeof glob !== 'string' && !isState)) {
    throw new TypeError('Expected pattern to be a non-empty string');
  }

  const opts = options || {};
  const posix = utils$4.isWindows(options);
  const regex = isState
    ? picomatch$3.compileRe(glob, options)
    : picomatch$3.makeRe(glob, options, false, true);

  const state = regex.state;
  delete regex.state;

  let isIgnored = () => false;
  if (opts.ignore) {
    const ignoreOpts = { ...options, ignore: null, onMatch: null, onResult: null };
    isIgnored = picomatch$3(opts.ignore, ignoreOpts, returnState);
  }

  const matcher = (input, returnObject = false) => {
    const { isMatch, match, output } = picomatch$3.test(input, regex, options, { glob, posix });
    const result = { glob, state, regex, posix, input, output, match, isMatch };

    if (typeof opts.onResult === 'function') {
      opts.onResult(result);
    }

    if (isMatch === false) {
      result.isMatch = false;
      return returnObject ? result : false;
    }

    if (isIgnored(input)) {
      if (typeof opts.onIgnore === 'function') {
        opts.onIgnore(result);
      }
      result.isMatch = false;
      return returnObject ? result : false;
    }

    if (typeof opts.onMatch === 'function') {
      opts.onMatch(result);
    }
    return returnObject ? result : true;
  };

  if (returnState) {
    matcher.state = state;
  }

  return matcher;
};

/**
 * Test `input` with the given `regex`. This is used by the main
 * `picomatch()` function to test the input string.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.test(input, regex[, options]);
 *
 * console.log(picomatch.test('foo/bar', /^(?:([^/]*?)\/([^/]*?))$/));
 * // { isMatch: true, match: [ 'foo/', 'foo', 'bar' ], output: 'foo/bar' }
 * ```
 * @param {String} `input` String to test.
 * @param {RegExp} `regex`
 * @return {Object} Returns an object with matching info.
 * @api public
 */

picomatch$3.test = (input, regex, options, { glob, posix } = {}) => {
  if (typeof input !== 'string') {
    throw new TypeError('Expected input to be a string');
  }

  if (input === '') {
    return { isMatch: false, output: '' };
  }

  const opts = options || {};
  const format = opts.format || (posix ? utils$4.toPosixSlashes : null);
  let match = input === glob;
  let output = (match && format) ? format(input) : input;

  if (match === false) {
    output = format ? format(input) : input;
    match = output === glob;
  }

  if (match === false || opts.capture === true) {
    if (opts.matchBase === true || opts.basename === true) {
      match = picomatch$3.matchBase(input, regex, options, posix);
    } else {
      match = regex.exec(output);
    }
  }

  return { isMatch: Boolean(match), match, output };
};

/**
 * Match the basename of a filepath.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.matchBase(input, glob[, options]);
 * console.log(picomatch.matchBase('foo/bar.js', '*.js'); // true
 * ```
 * @param {String} `input` String to test.
 * @param {RegExp|String} `glob` Glob pattern or regex created by [.makeRe](#makeRe).
 * @return {Boolean}
 * @api public
 */

picomatch$3.matchBase = (input, glob, options, posix = utils$4.isWindows(options)) => {
  const regex = glob instanceof RegExp ? glob : picomatch$3.makeRe(glob, options);
  return regex.test(path$1.basename(input));
};

/**
 * Returns true if **any** of the given glob `patterns` match the specified `string`.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.isMatch(string, patterns[, options]);
 *
 * console.log(picomatch.isMatch('a.a', ['b.*', '*.a'])); //=> true
 * console.log(picomatch.isMatch('a.a', 'b.*')); //=> false
 * ```
 * @param {String|Array} str The string to test.
 * @param {String|Array} patterns One or more glob patterns to use for matching.
 * @param {Object} [options] See available [options](#options).
 * @return {Boolean} Returns true if any patterns match `str`
 * @api public
 */

picomatch$3.isMatch = (str, patterns, options) => picomatch$3(patterns, options)(str);

/**
 * Parse a glob pattern to create the source string for a regular
 * expression.
 *
 * ```js
 * const picomatch = require('picomatch');
 * const result = picomatch.parse(pattern[, options]);
 * ```
 * @param {String} `pattern`
 * @param {Object} `options`
 * @return {Object} Returns an object with useful properties and output to be used as a regex source string.
 * @api public
 */

picomatch$3.parse = (pattern, options) => {
  if (Array.isArray(pattern)) return pattern.map(p => picomatch$3.parse(p, options));
  return parse$2(pattern, { ...options, fastpaths: false });
};

/**
 * Scan a glob pattern to separate the pattern into segments.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.scan(input[, options]);
 *
 * const result = picomatch.scan('!./foo/*.js');
 * console.log(result);
 * { prefix: '!./',
 *   input: '!./foo/*.js',
 *   start: 3,
 *   base: 'foo',
 *   glob: '*.js',
 *   isBrace: false,
 *   isBracket: false,
 *   isGlob: true,
 *   isExtglob: false,
 *   isGlobstar: false,
 *   negated: true }
 * ```
 * @param {String} `input` Glob pattern to scan.
 * @param {Object} `options`
 * @return {Object} Returns an object with
 * @api public
 */

picomatch$3.scan = (input, options) => scan(input, options);

/**
 * Compile a regular expression from the `state` object returned by the
 * [parse()](#parse) method.
 *
 * @param {Object} `state`
 * @param {Object} `options`
 * @param {Boolean} `returnOutput` Intended for implementors, this argument allows you to return the raw output from the parser.
 * @param {Boolean} `returnState` Adds the state to a `state` property on the returned regex. Useful for implementors and debugging.
 * @return {RegExp}
 * @api public
 */

picomatch$3.compileRe = (state, options, returnOutput = false, returnState = false) => {
  if (returnOutput === true) {
    return state.output;
  }

  const opts = options || {};
  const prepend = opts.contains ? '' : '^';
  const append = opts.contains ? '' : '$';

  let source = `${prepend}(?:${state.output})${append}`;
  if (state && state.negated === true) {
    source = `^(?!${source}).*$`;
  }

  const regex = picomatch$3.toRegex(source, options);
  if (returnState === true) {
    regex.state = state;
  }

  return regex;
};

/**
 * Create a regular expression from a parsed glob pattern.
 *
 * ```js
 * const picomatch = require('picomatch');
 * const state = picomatch.parse('*.js');
 * // picomatch.compileRe(state[, options]);
 *
 * console.log(picomatch.compileRe(state));
 * //=> /^(?:(?!\.)(?=.)[^/]*?\.js)$/
 * ```
 * @param {String} `state` The object returned from the `.parse` method.
 * @param {Object} `options`
 * @param {Boolean} `returnOutput` Implementors may use this argument to return the compiled output, instead of a regular expression. This is not exposed on the options to prevent end-users from mutating the result.
 * @param {Boolean} `returnState` Implementors may use this argument to return the state from the parsed glob with the returned regular expression.
 * @return {RegExp} Returns a regex created from the given pattern.
 * @api public
 */

picomatch$3.makeRe = (input, options = {}, returnOutput = false, returnState = false) => {
  if (!input || typeof input !== 'string') {
    throw new TypeError('Expected a non-empty string');
  }

  let parsed = { negated: false, fastpaths: true };

  if (options.fastpaths !== false && (input[0] === '.' || input[0] === '*')) {
    parsed.output = parse$2.fastpaths(input, options);
  }

  if (!parsed.output) {
    parsed = parse$2(input, options);
  }

  return picomatch$3.compileRe(parsed, options, returnOutput, returnState);
};

/**
 * Create a regular expression from the given regex source string.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.toRegex(source[, options]);
 *
 * const { output } = picomatch.parse('*.js');
 * console.log(picomatch.toRegex(output));
 * //=> /^(?:(?!\.)(?=.)[^/]*?\.js)$/
 * ```
 * @param {String} `source` Regular expression source string.
 * @param {Object} `options`
 * @return {RegExp}
 * @api public
 */

picomatch$3.toRegex = (source, options) => {
  try {
    const opts = options || {};
    return new RegExp(source, opts.flags || (opts.nocase ? 'i' : ''));
  } catch (err) {
    if (options && options.debug === true) throw err;
    return /$^/;
  }
};

/**
 * Picomatch constants.
 * @return {Object}
 */

picomatch$3.constants = constants$2;

/**
 * Expose "picomatch"
 */

var picomatch_1 = picomatch$3;

var picomatch$2 = picomatch_1;

const fs$3 = require$$0$1;
const { Readable } = require$$1;
const sysPath$3 = path$3;
const { promisify: promisify$3 } = require$$2;
const picomatch$1 = picomatch$2;

const readdir$1 = promisify$3(fs$3.readdir);
const stat$3 = promisify$3(fs$3.stat);
const lstat$2 = promisify$3(fs$3.lstat);
const realpath$1 = promisify$3(fs$3.realpath);

/**
 * @typedef {Object} EntryInfo
 * @property {String} path
 * @property {String} fullPath
 * @property {fs.Stats=} stats
 * @property {fs.Dirent=} dirent
 * @property {String} basename
 */

const BANG$2 = '!';
const RECURSIVE_ERROR_CODE = 'READDIRP_RECURSIVE_ERROR';
const NORMAL_FLOW_ERRORS = new Set(['ENOENT', 'EPERM', 'EACCES', 'ELOOP', RECURSIVE_ERROR_CODE]);
const FILE_TYPE = 'files';
const DIR_TYPE = 'directories';
const FILE_DIR_TYPE = 'files_directories';
const EVERYTHING_TYPE = 'all';
const ALL_TYPES = [FILE_TYPE, DIR_TYPE, FILE_DIR_TYPE, EVERYTHING_TYPE];

const isNormalFlowError = error => NORMAL_FLOW_ERRORS.has(error.code);
const [maj, min] = process.versions.node.split('.').slice(0, 2).map(n => Number.parseInt(n, 10));
const wantBigintFsStats = process.platform === 'win32' && (maj > 10 || (maj === 10 && min >= 5));

const normalizeFilter = filter => {
  if (filter === undefined) return;
  if (typeof filter === 'function') return filter;

  if (typeof filter === 'string') {
    const glob = picomatch$1(filter.trim());
    return entry => glob(entry.basename);
  }

  if (Array.isArray(filter)) {
    const positive = [];
    const negative = [];
    for (const item of filter) {
      const trimmed = item.trim();
      if (trimmed.charAt(0) === BANG$2) {
        negative.push(picomatch$1(trimmed.slice(1)));
      } else {
        positive.push(picomatch$1(trimmed));
      }
    }

    if (negative.length > 0) {
      if (positive.length > 0) {
        return entry =>
          positive.some(f => f(entry.basename)) && !negative.some(f => f(entry.basename));
      }
      return entry => !negative.some(f => f(entry.basename));
    }
    return entry => positive.some(f => f(entry.basename));
  }
};

class ReaddirpStream extends Readable {
  static get defaultOptions() {
    return {
      root: '.',
      /* eslint-disable no-unused-vars */
      fileFilter: (path) => true,
      directoryFilter: (path) => true,
      /* eslint-enable no-unused-vars */
      type: FILE_TYPE,
      lstat: false,
      depth: 2147483648,
      alwaysStat: false
    };
  }

  constructor(options = {}) {
    super({
      objectMode: true,
      autoDestroy: true,
      highWaterMark: options.highWaterMark || 4096
    });
    const opts = { ...ReaddirpStream.defaultOptions, ...options };
    const { root, type } = opts;

    this._fileFilter = normalizeFilter(opts.fileFilter);
    this._directoryFilter = normalizeFilter(opts.directoryFilter);

    const statMethod = opts.lstat ? lstat$2 : stat$3;
    // Use bigint stats if it's windows and stat() supports options (node 10+).
    if (wantBigintFsStats) {
      this._stat = path => statMethod(path, { bigint: true });
    } else {
      this._stat = statMethod;
    }

    this._maxDepth = opts.depth;
    this._wantsDir = [DIR_TYPE, FILE_DIR_TYPE, EVERYTHING_TYPE].includes(type);
    this._wantsFile = [FILE_TYPE, FILE_DIR_TYPE, EVERYTHING_TYPE].includes(type);
    this._wantsEverything = type === EVERYTHING_TYPE;
    this._root = sysPath$3.resolve(root);
    this._isDirent = ('Dirent' in fs$3) && !opts.alwaysStat;
    this._statsProp = this._isDirent ? 'dirent' : 'stats';
    this._rdOptions = { encoding: 'utf8', withFileTypes: this._isDirent };

    // Launch stream with one parent, the root dir.
    this.parents = [this._exploreDir(root, 1)];
    this.reading = false;
    this.parent = undefined;
  }

  async _read(batch) {
    if (this.reading) return;
    this.reading = true;

    try {
      while (!this.destroyed && batch > 0) {
        const { path, depth, files = [] } = this.parent || {};

        if (files.length > 0) {
          const slice = files.splice(0, batch).map(dirent => this._formatEntry(dirent, path));
          for (const entry of await Promise.all(slice)) {
            if (this.destroyed) return;

            const entryType = await this._getEntryType(entry);
            if (entryType === 'directory' && this._directoryFilter(entry)) {
              if (depth <= this._maxDepth) {
                this.parents.push(this._exploreDir(entry.fullPath, depth + 1));
              }

              if (this._wantsDir) {
                this.push(entry);
                batch--;
              }
            } else if ((entryType === 'file' || this._includeAsFile(entry)) && this._fileFilter(entry)) {
              if (this._wantsFile) {
                this.push(entry);
                batch--;
              }
            }
          }
        } else {
          const parent = this.parents.pop();
          if (!parent) {
            this.push(null);
            break;
          }
          this.parent = await parent;
          if (this.destroyed) return;
        }
      }
    } catch (error) {
      this.destroy(error);
    } finally {
      this.reading = false;
    }
  }

  async _exploreDir(path, depth) {
    let files;
    try {
      files = await readdir$1(path, this._rdOptions);
    } catch (error) {
      this._onError(error);
    }
    return { files, depth, path };
  }

  async _formatEntry(dirent, path) {
    let entry;
    try {
      const basename = this._isDirent ? dirent.name : dirent;
      const fullPath = sysPath$3.resolve(sysPath$3.join(path, basename));
      entry = { path: sysPath$3.relative(this._root, fullPath), fullPath, basename };
      entry[this._statsProp] = this._isDirent ? dirent : await this._stat(fullPath);
    } catch (err) {
      this._onError(err);
    }
    return entry;
  }

  _onError(err) {
    if (isNormalFlowError(err) && !this.destroyed) {
      this.emit('warn', err);
    } else {
      this.destroy(err);
    }
  }

  async _getEntryType(entry) {
    // entry may be undefined, because a warning or an error were emitted
    // and the statsProp is undefined
    const stats = entry && entry[this._statsProp];
    if (!stats) {
      return;
    }
    if (stats.isFile()) {
      return 'file';
    }
    if (stats.isDirectory()) {
      return 'directory';
    }
    if (stats && stats.isSymbolicLink()) {
      const full = entry.fullPath;
      try {
        const entryRealPath = await realpath$1(full);
        const entryRealPathStats = await lstat$2(entryRealPath);
        if (entryRealPathStats.isFile()) {
          return 'file';
        }
        if (entryRealPathStats.isDirectory()) {
          const len = entryRealPath.length;
          if (full.startsWith(entryRealPath) && full.substr(len, 1) === sysPath$3.sep) {
            const recursiveError = new Error(
              `Circular symlink detected: "${full}" points to "${entryRealPath}"`
            );
            recursiveError.code = RECURSIVE_ERROR_CODE;
            return this._onError(recursiveError);
          }
          return 'directory';
        }
      } catch (error) {
        this._onError(error);
      }
    }
  }

  _includeAsFile(entry) {
    const stats = entry && entry[this._statsProp];

    return stats && this._wantsEverything && !stats.isDirectory();
  }
}

/**
 * @typedef {Object} ReaddirpArguments
 * @property {Function=} fileFilter
 * @property {Function=} directoryFilter
 * @property {String=} type
 * @property {Number=} depth
 * @property {String=} root
 * @property {Boolean=} lstat
 * @property {Boolean=} bigint
 */

/**
 * Main function which ends up calling readdirRec and reads all files and directories in given root recursively.
 * @param {String} root Root directory
 * @param {ReaddirpArguments=} options Options to specify root (start directory), filters and recursion depth
 */
const readdirp$1 = (root, options = {}) => {
  let type = options.entryType || options.type;
  if (type === 'both') type = FILE_DIR_TYPE; // backwards-compatibility
  if (type) options.type = type;
  if (!root) {
    throw new Error('readdirp: root argument is required. Usage: readdirp(root, options)');
  } else if (typeof root !== 'string') {
    throw new TypeError('readdirp: root argument must be a string. Usage: readdirp(root, options)');
  } else if (type && !ALL_TYPES.includes(type)) {
    throw new Error(`readdirp: Invalid type passed. Use one of ${ALL_TYPES.join(', ')}`);
  }

  options.root = root;
  return new ReaddirpStream(options);
};

const readdirpPromise = (root, options = {}) => {
  return new Promise((resolve, reject) => {
    const files = [];
    readdirp$1(root, options)
      .on('data', entry => files.push(entry))
      .on('end', () => resolve(files))
      .on('error', error => reject(error));
  });
};

readdirp$1.promise = readdirpPromise;
readdirp$1.ReaddirpStream = ReaddirpStream;
readdirp$1.default = readdirp$1;

var readdirp_1 = readdirp$1;

var anymatch$2 = {exports: {}};

/*!
 * normalize-path <https://github.com/jonschlinkert/normalize-path>
 *
 * Copyright (c) 2014-2018, Jon Schlinkert.
 * Released under the MIT License.
 */

var normalizePath$2 = function(path, stripTrailing) {
  if (typeof path !== 'string') {
    throw new TypeError('expected path to be a string');
  }

  if (path === '\\' || path === '/') return '/';

  var len = path.length;
  if (len <= 1) return path;

  // ensure that win32 namespaces has two leading slashes, so that the path is
  // handled properly by the win32 version of path.parse() after being normalized
  // https://msdn.microsoft.com/library/windows/desktop/aa365247(v=vs.85).aspx#namespaces
  var prefix = '';
  if (len > 4 && path[3] === '\\') {
    var ch = path[2];
    if ((ch === '?' || ch === '.') && path.slice(0, 2) === '\\\\') {
      path = path.slice(2);
      prefix = '//';
    }
  }

  var segs = path.split(/[/\\]+/);
  if (stripTrailing !== false && segs[segs.length - 1] === '') {
    segs.pop();
  }
  return prefix + segs.join('/');
};

var anymatch_1 = anymatch$2.exports;

Object.defineProperty(anymatch_1, "__esModule", { value: true });

const picomatch = picomatch$2;
const normalizePath$1 = normalizePath$2;

/**
 * @typedef {(testString: string) => boolean} AnymatchFn
 * @typedef {string|RegExp|AnymatchFn} AnymatchPattern
 * @typedef {AnymatchPattern|AnymatchPattern[]} AnymatchMatcher
 */
const BANG$1 = '!';
const DEFAULT_OPTIONS = {returnIndex: false};
const arrify$1 = (item) => Array.isArray(item) ? item : [item];

/**
 * @param {AnymatchPattern} matcher
 * @param {object} options
 * @returns {AnymatchFn}
 */
const createPattern = (matcher, options) => {
  if (typeof matcher === 'function') {
    return matcher;
  }
  if (typeof matcher === 'string') {
    const glob = picomatch(matcher, options);
    return (string) => matcher === string || glob(string);
  }
  if (matcher instanceof RegExp) {
    return (string) => matcher.test(string);
  }
  return (string) => false;
};

/**
 * @param {Array<Function>} patterns
 * @param {Array<Function>} negPatterns
 * @param {String|Array} args
 * @param {Boolean} returnIndex
 * @returns {boolean|number}
 */
const matchPatterns = (patterns, negPatterns, args, returnIndex) => {
  const isList = Array.isArray(args);
  const _path = isList ? args[0] : args;
  if (!isList && typeof _path !== 'string') {
    throw new TypeError('anymatch: second argument must be a string: got ' +
      Object.prototype.toString.call(_path))
  }
  const path = normalizePath$1(_path, false);

  for (let index = 0; index < negPatterns.length; index++) {
    const nglob = negPatterns[index];
    if (nglob(path)) {
      return returnIndex ? -1 : false;
    }
  }

  const applied = isList && [path].concat(args.slice(1));
  for (let index = 0; index < patterns.length; index++) {
    const pattern = patterns[index];
    if (isList ? pattern(...applied) : pattern(path)) {
      return returnIndex ? index : true;
    }
  }

  return returnIndex ? -1 : false;
};

/**
 * @param {AnymatchMatcher} matchers
 * @param {Array|string} testString
 * @param {object} options
 * @returns {boolean|number|Function}
 */
const anymatch$1 = (matchers, testString, options = DEFAULT_OPTIONS) => {
  if (matchers == null) {
    throw new TypeError('anymatch: specify first argument');
  }
  const opts = typeof options === 'boolean' ? {returnIndex: options} : options;
  const returnIndex = opts.returnIndex || false;

  // Early cache for matchers.
  const mtchers = arrify$1(matchers);
  const negatedGlobs = mtchers
    .filter(item => typeof item === 'string' && item.charAt(0) === BANG$1)
    .map(item => item.slice(1))
    .map(item => picomatch(item, opts));
  const patterns = mtchers
    .filter(item => typeof item !== 'string' || (typeof item === 'string' && item.charAt(0) !== BANG$1))
    .map(matcher => createPattern(matcher, opts));

  if (testString == null) {
    return (testString, ri = false) => {
      const returnIndex = typeof ri === 'boolean' ? ri : false;
      return matchPatterns(patterns, negatedGlobs, testString, returnIndex);
    }
  }

  return matchPatterns(patterns, negatedGlobs, testString, returnIndex);
};

anymatch$1.default = anymatch$1;
anymatch$2.exports = anymatch$1;

var anymatchExports = anymatch$2.exports;

/*!
 * is-extglob <https://github.com/jonschlinkert/is-extglob>
 *
 * Copyright (c) 2014-2016, Jon Schlinkert.
 * Licensed under the MIT License.
 */

var isExtglob$1 = function isExtglob(str) {
  if (typeof str !== 'string' || str === '') {
    return false;
  }

  var match;
  while ((match = /(\\).|([@?!+*]\(.*\))/g.exec(str))) {
    if (match[2]) return true;
    str = str.slice(match.index + match[0].length);
  }

  return false;
};

/*!
 * is-glob <https://github.com/jonschlinkert/is-glob>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

var isExtglob = isExtglob$1;
var chars = { '{': '}', '(': ')', '[': ']'};
var strictCheck = function(str) {
  if (str[0] === '!') {
    return true;
  }
  var index = 0;
  var pipeIndex = -2;
  var closeSquareIndex = -2;
  var closeCurlyIndex = -2;
  var closeParenIndex = -2;
  var backSlashIndex = -2;
  while (index < str.length) {
    if (str[index] === '*') {
      return true;
    }

    if (str[index + 1] === '?' && /[\].+)]/.test(str[index])) {
      return true;
    }

    if (closeSquareIndex !== -1 && str[index] === '[' && str[index + 1] !== ']') {
      if (closeSquareIndex < index) {
        closeSquareIndex = str.indexOf(']', index);
      }
      if (closeSquareIndex > index) {
        if (backSlashIndex === -1 || backSlashIndex > closeSquareIndex) {
          return true;
        }
        backSlashIndex = str.indexOf('\\', index);
        if (backSlashIndex === -1 || backSlashIndex > closeSquareIndex) {
          return true;
        }
      }
    }

    if (closeCurlyIndex !== -1 && str[index] === '{' && str[index + 1] !== '}') {
      closeCurlyIndex = str.indexOf('}', index);
      if (closeCurlyIndex > index) {
        backSlashIndex = str.indexOf('\\', index);
        if (backSlashIndex === -1 || backSlashIndex > closeCurlyIndex) {
          return true;
        }
      }
    }

    if (closeParenIndex !== -1 && str[index] === '(' && str[index + 1] === '?' && /[:!=]/.test(str[index + 2]) && str[index + 3] !== ')') {
      closeParenIndex = str.indexOf(')', index);
      if (closeParenIndex > index) {
        backSlashIndex = str.indexOf('\\', index);
        if (backSlashIndex === -1 || backSlashIndex > closeParenIndex) {
          return true;
        }
      }
    }

    if (pipeIndex !== -1 && str[index] === '(' && str[index + 1] !== '|') {
      if (pipeIndex < index) {
        pipeIndex = str.indexOf('|', index);
      }
      if (pipeIndex !== -1 && str[pipeIndex + 1] !== ')') {
        closeParenIndex = str.indexOf(')', pipeIndex);
        if (closeParenIndex > pipeIndex) {
          backSlashIndex = str.indexOf('\\', pipeIndex);
          if (backSlashIndex === -1 || backSlashIndex > closeParenIndex) {
            return true;
          }
        }
      }
    }

    if (str[index] === '\\') {
      var open = str[index + 1];
      index += 2;
      var close = chars[open];

      if (close) {
        var n = str.indexOf(close, index);
        if (n !== -1) {
          index = n + 1;
        }
      }

      if (str[index] === '!') {
        return true;
      }
    } else {
      index++;
    }
  }
  return false;
};

var relaxedCheck = function(str) {
  if (str[0] === '!') {
    return true;
  }
  var index = 0;
  while (index < str.length) {
    if (/[*?{}()[\]]/.test(str[index])) {
      return true;
    }

    if (str[index] === '\\') {
      var open = str[index + 1];
      index += 2;
      var close = chars[open];

      if (close) {
        var n = str.indexOf(close, index);
        if (n !== -1) {
          index = n + 1;
        }
      }

      if (str[index] === '!') {
        return true;
      }
    } else {
      index++;
    }
  }
  return false;
};

var isGlob$2 = function isGlob(str, options) {
  if (typeof str !== 'string' || str === '') {
    return false;
  }

  if (isExtglob(str)) {
    return true;
  }

  var check = strictCheck;

  // optionally relax check
  if (options && options.strict === false) {
    check = relaxedCheck;
  }

  return check(str);
};

var isGlob$1 = isGlob$2;
var pathPosixDirname = path$3.posix.dirname;
var isWin32 = os.platform() === 'win32';

var slash = '/';
var backslash = /\\/g;
var enclosure = /[\{\[].*[\}\]]$/;
var globby = /(^|[^\\])([\{\[]|\([^\)]+$)/;
var escaped = /\\([\!\*\?\|\[\]\(\)\{\}])/g;

/**
 * @param {string} str
 * @param {Object} opts
 * @param {boolean} [opts.flipBackslashes=true]
 * @returns {string}
 */
var globParent$1 = function globParent(str, opts) {
  var options = Object.assign({ flipBackslashes: true }, opts);

  // flip windows path separators
  if (options.flipBackslashes && isWin32 && str.indexOf(slash) < 0) {
    str = str.replace(backslash, slash);
  }

  // special case for strings ending in enclosure containing path separator
  if (enclosure.test(str)) {
    str += slash;
  }

  // preserves full path in case of trailing path separator
  str += 'a';

  // remove path parts that are globby
  do {
    str = pathPosixDirname(str);
  } while (isGlob$1(str) || globby.test(str));

  // remove escape chars and return result
  return str.replace(escaped, '$1');
};

var utils$3 = {};

(function (exports) {

	exports.isInteger = num => {
	  if (typeof num === 'number') {
	    return Number.isInteger(num);
	  }
	  if (typeof num === 'string' && num.trim() !== '') {
	    return Number.isInteger(Number(num));
	  }
	  return false;
	};

	/**
	 * Find a node of the given type
	 */

	exports.find = (node, type) => node.nodes.find(node => node.type === type);

	/**
	 * Find a node of the given type
	 */

	exports.exceedsLimit = (min, max, step = 1, limit) => {
	  if (limit === false) return false;
	  if (!exports.isInteger(min) || !exports.isInteger(max)) return false;
	  return ((Number(max) - Number(min)) / Number(step)) >= limit;
	};

	/**
	 * Escape the given node with '\\' before node.value
	 */

	exports.escapeNode = (block, n = 0, type) => {
	  const node = block.nodes[n];
	  if (!node) return;

	  if ((type && node.type === type) || node.type === 'open' || node.type === 'close') {
	    if (node.escaped !== true) {
	      node.value = '\\' + node.value;
	      node.escaped = true;
	    }
	  }
	};

	/**
	 * Returns true if the given brace node should be enclosed in literal braces
	 */

	exports.encloseBrace = node => {
	  if (node.type !== 'brace') return false;
	  if ((node.commas >> 0 + node.ranges >> 0) === 0) {
	    node.invalid = true;
	    return true;
	  }
	  return false;
	};

	/**
	 * Returns true if a brace node is invalid.
	 */

	exports.isInvalidBrace = block => {
	  if (block.type !== 'brace') return false;
	  if (block.invalid === true || block.dollar) return true;
	  if ((block.commas >> 0 + block.ranges >> 0) === 0) {
	    block.invalid = true;
	    return true;
	  }
	  if (block.open !== true || block.close !== true) {
	    block.invalid = true;
	    return true;
	  }
	  return false;
	};

	/**
	 * Returns true if a node is an open or close node
	 */

	exports.isOpenOrClose = node => {
	  if (node.type === 'open' || node.type === 'close') {
	    return true;
	  }
	  return node.open === true || node.close === true;
	};

	/**
	 * Reduce an array of text nodes.
	 */

	exports.reduce = nodes => nodes.reduce((acc, node) => {
	  if (node.type === 'text') acc.push(node.value);
	  if (node.type === 'range') node.type = 'text';
	  return acc;
	}, []);

	/**
	 * Flatten an array
	 */

	exports.flatten = (...args) => {
	  const result = [];

	  const flat = arr => {
	    for (let i = 0; i < arr.length; i++) {
	      const ele = arr[i];

	      if (Array.isArray(ele)) {
	        flat(ele);
	        continue;
	      }

	      if (ele !== undefined) {
	        result.push(ele);
	      }
	    }
	    return result;
	  };

	  flat(args);
	  return result;
	}; 
} (utils$3));

const utils$2 = utils$3;

var stringify$4 = (ast, options = {}) => {
  const stringify = (node, parent = {}) => {
    const invalidBlock = options.escapeInvalid && utils$2.isInvalidBrace(parent);
    const invalidNode = node.invalid === true && options.escapeInvalid === true;
    let output = '';

    if (node.value) {
      if ((invalidBlock || invalidNode) && utils$2.isOpenOrClose(node)) {
        return '\\' + node.value;
      }
      return node.value;
    }

    if (node.value) {
      return node.value;
    }

    if (node.nodes) {
      for (const child of node.nodes) {
        output += stringify(child);
      }
    }
    return output;
  };

  return stringify(ast);
};

/*!
 * is-number <https://github.com/jonschlinkert/is-number>
 *
 * Copyright (c) 2014-present, Jon Schlinkert.
 * Released under the MIT License.
 */

var isNumber$2 = function(num) {
  if (typeof num === 'number') {
    return num - num === 0;
  }
  if (typeof num === 'string' && num.trim() !== '') {
    return Number.isFinite ? Number.isFinite(+num) : isFinite(+num);
  }
  return false;
};

/*!
 * to-regex-range <https://github.com/micromatch/to-regex-range>
 *
 * Copyright (c) 2015-present, Jon Schlinkert.
 * Released under the MIT License.
 */

const isNumber$1 = isNumber$2;

const toRegexRange$1 = (min, max, options) => {
  if (isNumber$1(min) === false) {
    throw new TypeError('toRegexRange: expected the first argument to be a number');
  }

  if (max === void 0 || min === max) {
    return String(min);
  }

  if (isNumber$1(max) === false) {
    throw new TypeError('toRegexRange: expected the second argument to be a number.');
  }

  let opts = { relaxZeros: true, ...options };
  if (typeof opts.strictZeros === 'boolean') {
    opts.relaxZeros = opts.strictZeros === false;
  }

  let relax = String(opts.relaxZeros);
  let shorthand = String(opts.shorthand);
  let capture = String(opts.capture);
  let wrap = String(opts.wrap);
  let cacheKey = min + ':' + max + '=' + relax + shorthand + capture + wrap;

  if (toRegexRange$1.cache.hasOwnProperty(cacheKey)) {
    return toRegexRange$1.cache[cacheKey].result;
  }

  let a = Math.min(min, max);
  let b = Math.max(min, max);

  if (Math.abs(a - b) === 1) {
    let result = min + '|' + max;
    if (opts.capture) {
      return `(${result})`;
    }
    if (opts.wrap === false) {
      return result;
    }
    return `(?:${result})`;
  }

  let isPadded = hasPadding(min) || hasPadding(max);
  let state = { min, max, a, b };
  let positives = [];
  let negatives = [];

  if (isPadded) {
    state.isPadded = isPadded;
    state.maxLen = String(state.max).length;
  }

  if (a < 0) {
    let newMin = b < 0 ? Math.abs(b) : 1;
    negatives = splitToPatterns(newMin, Math.abs(a), state, opts);
    a = state.a = 0;
  }

  if (b >= 0) {
    positives = splitToPatterns(a, b, state, opts);
  }

  state.negatives = negatives;
  state.positives = positives;
  state.result = collatePatterns(negatives, positives);

  if (opts.capture === true) {
    state.result = `(${state.result})`;
  } else if (opts.wrap !== false && (positives.length + negatives.length) > 1) {
    state.result = `(?:${state.result})`;
  }

  toRegexRange$1.cache[cacheKey] = state;
  return state.result;
};

function collatePatterns(neg, pos, options) {
  let onlyNegative = filterPatterns(neg, pos, '-', false) || [];
  let onlyPositive = filterPatterns(pos, neg, '', false) || [];
  let intersected = filterPatterns(neg, pos, '-?', true) || [];
  let subpatterns = onlyNegative.concat(intersected).concat(onlyPositive);
  return subpatterns.join('|');
}

function splitToRanges(min, max) {
  let nines = 1;
  let zeros = 1;

  let stop = countNines(min, nines);
  let stops = new Set([max]);

  while (min <= stop && stop <= max) {
    stops.add(stop);
    nines += 1;
    stop = countNines(min, nines);
  }

  stop = countZeros(max + 1, zeros) - 1;

  while (min < stop && stop <= max) {
    stops.add(stop);
    zeros += 1;
    stop = countZeros(max + 1, zeros) - 1;
  }

  stops = [...stops];
  stops.sort(compare);
  return stops;
}

/**
 * Convert a range to a regex pattern
 * @param {Number} `start`
 * @param {Number} `stop`
 * @return {String}
 */

function rangeToPattern(start, stop, options) {
  if (start === stop) {
    return { pattern: start, count: [], digits: 0 };
  }

  let zipped = zip(start, stop);
  let digits = zipped.length;
  let pattern = '';
  let count = 0;

  for (let i = 0; i < digits; i++) {
    let [startDigit, stopDigit] = zipped[i];

    if (startDigit === stopDigit) {
      pattern += startDigit;

    } else if (startDigit !== '0' || stopDigit !== '9') {
      pattern += toCharacterClass(startDigit, stopDigit);

    } else {
      count++;
    }
  }

  if (count) {
    pattern += options.shorthand === true ? '\\d' : '[0-9]';
  }

  return { pattern, count: [count], digits };
}

function splitToPatterns(min, max, tok, options) {
  let ranges = splitToRanges(min, max);
  let tokens = [];
  let start = min;
  let prev;

  for (let i = 0; i < ranges.length; i++) {
    let max = ranges[i];
    let obj = rangeToPattern(String(start), String(max), options);
    let zeros = '';

    if (!tok.isPadded && prev && prev.pattern === obj.pattern) {
      if (prev.count.length > 1) {
        prev.count.pop();
      }

      prev.count.push(obj.count[0]);
      prev.string = prev.pattern + toQuantifier(prev.count);
      start = max + 1;
      continue;
    }

    if (tok.isPadded) {
      zeros = padZeros(max, tok, options);
    }

    obj.string = zeros + obj.pattern + toQuantifier(obj.count);
    tokens.push(obj);
    start = max + 1;
    prev = obj;
  }

  return tokens;
}

function filterPatterns(arr, comparison, prefix, intersection, options) {
  let result = [];

  for (let ele of arr) {
    let { string } = ele;

    // only push if _both_ are negative...
    if (!intersection && !contains(comparison, 'string', string)) {
      result.push(prefix + string);
    }

    // or _both_ are positive
    if (intersection && contains(comparison, 'string', string)) {
      result.push(prefix + string);
    }
  }
  return result;
}

/**
 * Zip strings
 */

function zip(a, b) {
  let arr = [];
  for (let i = 0; i < a.length; i++) arr.push([a[i], b[i]]);
  return arr;
}

function compare(a, b) {
  return a > b ? 1 : b > a ? -1 : 0;
}

function contains(arr, key, val) {
  return arr.some(ele => ele[key] === val);
}

function countNines(min, len) {
  return Number(String(min).slice(0, -len) + '9'.repeat(len));
}

function countZeros(integer, zeros) {
  return integer - (integer % Math.pow(10, zeros));
}

function toQuantifier(digits) {
  let [start = 0, stop = ''] = digits;
  if (stop || start > 1) {
    return `{${start + (stop ? ',' + stop : '')}}`;
  }
  return '';
}

function toCharacterClass(a, b, options) {
  return `[${a}${(b - a === 1) ? '' : '-'}${b}]`;
}

function hasPadding(str) {
  return /^-?(0+)\d/.test(str);
}

function padZeros(value, tok, options) {
  if (!tok.isPadded) {
    return value;
  }

  let diff = Math.abs(tok.maxLen - String(value).length);
  let relax = options.relaxZeros !== false;

  switch (diff) {
    case 0:
      return '';
    case 1:
      return relax ? '0?' : '0';
    case 2:
      return relax ? '0{0,2}' : '00';
    default: {
      return relax ? `0{0,${diff}}` : `0{${diff}}`;
    }
  }
}

/**
 * Cache
 */

toRegexRange$1.cache = {};
toRegexRange$1.clearCache = () => (toRegexRange$1.cache = {});

/**
 * Expose `toRegexRange`
 */

var toRegexRange_1 = toRegexRange$1;

/*!
 * fill-range <https://github.com/jonschlinkert/fill-range>
 *
 * Copyright (c) 2014-present, Jon Schlinkert.
 * Licensed under the MIT License.
 */

const util = require$$2;
const toRegexRange = toRegexRange_1;

const isObject = val => val !== null && typeof val === 'object' && !Array.isArray(val);

const transform = toNumber => {
  return value => toNumber === true ? Number(value) : String(value);
};

const isValidValue = value => {
  return typeof value === 'number' || (typeof value === 'string' && value !== '');
};

const isNumber = num => Number.isInteger(+num);

const zeros = input => {
  let value = `${input}`;
  let index = -1;
  if (value[0] === '-') value = value.slice(1);
  if (value === '0') return false;
  while (value[++index] === '0');
  return index > 0;
};

const stringify$3 = (start, end, options) => {
  if (typeof start === 'string' || typeof end === 'string') {
    return true;
  }
  return options.stringify === true;
};

const pad = (input, maxLength, toNumber) => {
  if (maxLength > 0) {
    let dash = input[0] === '-' ? '-' : '';
    if (dash) input = input.slice(1);
    input = (dash + input.padStart(dash ? maxLength - 1 : maxLength, '0'));
  }
  if (toNumber === false) {
    return String(input);
  }
  return input;
};

const toMaxLen = (input, maxLength) => {
  let negative = input[0] === '-' ? '-' : '';
  if (negative) {
    input = input.slice(1);
    maxLength--;
  }
  while (input.length < maxLength) input = '0' + input;
  return negative ? ('-' + input) : input;
};

const toSequence = (parts, options, maxLen) => {
  parts.negatives.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
  parts.positives.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);

  let prefix = options.capture ? '' : '?:';
  let positives = '';
  let negatives = '';
  let result;

  if (parts.positives.length) {
    positives = parts.positives.map(v => toMaxLen(String(v), maxLen)).join('|');
  }

  if (parts.negatives.length) {
    negatives = `-(${prefix}${parts.negatives.map(v => toMaxLen(String(v), maxLen)).join('|')})`;
  }

  if (positives && negatives) {
    result = `${positives}|${negatives}`;
  } else {
    result = positives || negatives;
  }

  if (options.wrap) {
    return `(${prefix}${result})`;
  }

  return result;
};

const toRange = (a, b, isNumbers, options) => {
  if (isNumbers) {
    return toRegexRange(a, b, { wrap: false, ...options });
  }

  let start = String.fromCharCode(a);
  if (a === b) return start;

  let stop = String.fromCharCode(b);
  return `[${start}-${stop}]`;
};

const toRegex = (start, end, options) => {
  if (Array.isArray(start)) {
    let wrap = options.wrap === true;
    let prefix = options.capture ? '' : '?:';
    return wrap ? `(${prefix}${start.join('|')})` : start.join('|');
  }
  return toRegexRange(start, end, options);
};

const rangeError = (...args) => {
  return new RangeError('Invalid range arguments: ' + util.inspect(...args));
};

const invalidRange = (start, end, options) => {
  if (options.strictRanges === true) throw rangeError([start, end]);
  return [];
};

const invalidStep = (step, options) => {
  if (options.strictRanges === true) {
    throw new TypeError(`Expected step "${step}" to be a number`);
  }
  return [];
};

const fillNumbers = (start, end, step = 1, options = {}) => {
  let a = Number(start);
  let b = Number(end);

  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    if (options.strictRanges === true) throw rangeError([start, end]);
    return [];
  }

  // fix negative zero
  if (a === 0) a = 0;
  if (b === 0) b = 0;

  let descending = a > b;
  let startString = String(start);
  let endString = String(end);
  let stepString = String(step);
  step = Math.max(Math.abs(step), 1);

  let padded = zeros(startString) || zeros(endString) || zeros(stepString);
  let maxLen = padded ? Math.max(startString.length, endString.length, stepString.length) : 0;
  let toNumber = padded === false && stringify$3(start, end, options) === false;
  let format = options.transform || transform(toNumber);

  if (options.toRegex && step === 1) {
    return toRange(toMaxLen(start, maxLen), toMaxLen(end, maxLen), true, options);
  }

  let parts = { negatives: [], positives: [] };
  let push = num => parts[num < 0 ? 'negatives' : 'positives'].push(Math.abs(num));
  let range = [];
  let index = 0;

  while (descending ? a >= b : a <= b) {
    if (options.toRegex === true && step > 1) {
      push(a);
    } else {
      range.push(pad(format(a, index), maxLen, toNumber));
    }
    a = descending ? a - step : a + step;
    index++;
  }

  if (options.toRegex === true) {
    return step > 1
      ? toSequence(parts, options, maxLen)
      : toRegex(range, null, { wrap: false, ...options });
  }

  return range;
};

const fillLetters = (start, end, step = 1, options = {}) => {
  if ((!isNumber(start) && start.length > 1) || (!isNumber(end) && end.length > 1)) {
    return invalidRange(start, end, options);
  }

  let format = options.transform || (val => String.fromCharCode(val));
  let a = `${start}`.charCodeAt(0);
  let b = `${end}`.charCodeAt(0);

  let descending = a > b;
  let min = Math.min(a, b);
  let max = Math.max(a, b);

  if (options.toRegex && step === 1) {
    return toRange(min, max, false, options);
  }

  let range = [];
  let index = 0;

  while (descending ? a >= b : a <= b) {
    range.push(format(a, index));
    a = descending ? a - step : a + step;
    index++;
  }

  if (options.toRegex === true) {
    return toRegex(range, null, { wrap: false, options });
  }

  return range;
};

const fill$2 = (start, end, step, options = {}) => {
  if (end == null && isValidValue(start)) {
    return [start];
  }

  if (!isValidValue(start) || !isValidValue(end)) {
    return invalidRange(start, end, options);
  }

  if (typeof step === 'function') {
    return fill$2(start, end, 1, { transform: step });
  }

  if (isObject(step)) {
    return fill$2(start, end, 0, step);
  }

  let opts = { ...options };
  if (opts.capture === true) opts.wrap = true;
  step = step || opts.step || 1;

  if (!isNumber(step)) {
    if (step != null && !isObject(step)) return invalidStep(step, opts);
    return fill$2(start, end, 1, step);
  }

  if (isNumber(start) && isNumber(end)) {
    return fillNumbers(start, end, step, opts);
  }

  return fillLetters(start, end, Math.max(Math.abs(step), 1), opts);
};

var fillRange = fill$2;

const fill$1 = fillRange;
const utils$1 = utils$3;

const compile$1 = (ast, options = {}) => {
  const walk = (node, parent = {}) => {
    const invalidBlock = utils$1.isInvalidBrace(parent);
    const invalidNode = node.invalid === true && options.escapeInvalid === true;
    const invalid = invalidBlock === true || invalidNode === true;
    const prefix = options.escapeInvalid === true ? '\\' : '';
    let output = '';

    if (node.isOpen === true) {
      return prefix + node.value;
    }

    if (node.isClose === true) {
      console.log('node.isClose', prefix, node.value);
      return prefix + node.value;
    }

    if (node.type === 'open') {
      return invalid ? prefix + node.value : '(';
    }

    if (node.type === 'close') {
      return invalid ? prefix + node.value : ')';
    }

    if (node.type === 'comma') {
      return node.prev.type === 'comma' ? '' : invalid ? node.value : '|';
    }

    if (node.value) {
      return node.value;
    }

    if (node.nodes && node.ranges > 0) {
      const args = utils$1.reduce(node.nodes);
      const range = fill$1(...args, { ...options, wrap: false, toRegex: true, strictZeros: true });

      if (range.length !== 0) {
        return args.length > 1 && range.length > 1 ? `(${range})` : range;
      }
    }

    if (node.nodes) {
      for (const child of node.nodes) {
        output += walk(child, node);
      }
    }

    return output;
  };

  return walk(ast);
};

var compile_1 = compile$1;

const fill = fillRange;
const stringify$2 = stringify$4;
const utils = utils$3;

const append = (queue = '', stash = '', enclose = false) => {
  const result = [];

  queue = [].concat(queue);
  stash = [].concat(stash);

  if (!stash.length) return queue;
  if (!queue.length) {
    return enclose ? utils.flatten(stash).map(ele => `{${ele}}`) : stash;
  }

  for (const item of queue) {
    if (Array.isArray(item)) {
      for (const value of item) {
        result.push(append(value, stash, enclose));
      }
    } else {
      for (let ele of stash) {
        if (enclose === true && typeof ele === 'string') ele = `{${ele}}`;
        result.push(Array.isArray(ele) ? append(item, ele, enclose) : item + ele);
      }
    }
  }
  return utils.flatten(result);
};

const expand$1 = (ast, options = {}) => {
  const rangeLimit = options.rangeLimit === undefined ? 1000 : options.rangeLimit;

  const walk = (node, parent = {}) => {
    node.queue = [];

    let p = parent;
    let q = parent.queue;

    while (p.type !== 'brace' && p.type !== 'root' && p.parent) {
      p = p.parent;
      q = p.queue;
    }

    if (node.invalid || node.dollar) {
      q.push(append(q.pop(), stringify$2(node, options)));
      return;
    }

    if (node.type === 'brace' && node.invalid !== true && node.nodes.length === 2) {
      q.push(append(q.pop(), ['{}']));
      return;
    }

    if (node.nodes && node.ranges > 0) {
      const args = utils.reduce(node.nodes);

      if (utils.exceedsLimit(...args, options.step, rangeLimit)) {
        throw new RangeError('expanded array length exceeds range limit. Use options.rangeLimit to increase or disable the limit.');
      }

      let range = fill(...args, options);
      if (range.length === 0) {
        range = stringify$2(node, options);
      }

      q.push(append(q.pop(), range));
      node.nodes = [];
      return;
    }

    const enclose = utils.encloseBrace(node);
    let queue = node.queue;
    let block = node;

    while (block.type !== 'brace' && block.type !== 'root' && block.parent) {
      block = block.parent;
      queue = block.queue;
    }

    for (let i = 0; i < node.nodes.length; i++) {
      const child = node.nodes[i];

      if (child.type === 'comma' && node.type === 'brace') {
        if (i === 1) queue.push('');
        queue.push('');
        continue;
      }

      if (child.type === 'close') {
        q.push(append(q.pop(), queue, enclose));
        continue;
      }

      if (child.value && child.type !== 'open') {
        queue.push(append(queue.pop(), child.value));
        continue;
      }

      if (child.nodes) {
        walk(child, node);
      }
    }

    return queue;
  };

  return utils.flatten(walk(ast));
};

var expand_1 = expand$1;

var constants$1 = {
  MAX_LENGTH: 10000,

  CHAR_LEFT_PARENTHESES: '(', /* ( */
  CHAR_RIGHT_PARENTHESES: ')', /* ) */

  CHAR_BACKSLASH: '\\', /* \ */
  CHAR_BACKTICK: '`', /* ` */
  CHAR_COMMA: ',', /* , */
  CHAR_DOT: '.', /* . */
  CHAR_DOUBLE_QUOTE: '"', /* " */
  CHAR_LEFT_CURLY_BRACE: '{', /* { */
  CHAR_LEFT_SQUARE_BRACKET: '[', /* [ */
  CHAR_NO_BREAK_SPACE: '\u00A0', /* \u00A0 */
  CHAR_RIGHT_CURLY_BRACE: '}', /* } */
  CHAR_RIGHT_SQUARE_BRACKET: ']', /* ] */
  CHAR_SINGLE_QUOTE: '\'', /* ' */
  CHAR_ZERO_WIDTH_NOBREAK_SPACE: '\uFEFF' /* \uFEFF */
};

const stringify$1 = stringify$4;

/**
 * Constants
 */

const {
  MAX_LENGTH,
  CHAR_BACKSLASH, /* \ */
  CHAR_BACKTICK, /* ` */
  CHAR_COMMA, /* , */
  CHAR_DOT, /* . */
  CHAR_LEFT_PARENTHESES, /* ( */
  CHAR_RIGHT_PARENTHESES, /* ) */
  CHAR_LEFT_CURLY_BRACE, /* { */
  CHAR_RIGHT_CURLY_BRACE, /* } */
  CHAR_LEFT_SQUARE_BRACKET, /* [ */
  CHAR_RIGHT_SQUARE_BRACKET, /* ] */
  CHAR_DOUBLE_QUOTE, /* " */
  CHAR_SINGLE_QUOTE, /* ' */
  CHAR_NO_BREAK_SPACE,
  CHAR_ZERO_WIDTH_NOBREAK_SPACE
} = constants$1;

/**
 * parse
 */

const parse$1 = (input, options = {}) => {
  if (typeof input !== 'string') {
    throw new TypeError('Expected a string');
  }

  const opts = options || {};
  const max = typeof opts.maxLength === 'number' ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
  if (input.length > max) {
    throw new SyntaxError(`Input length (${input.length}), exceeds max characters (${max})`);
  }

  const ast = { type: 'root', input, nodes: [] };
  const stack = [ast];
  let block = ast;
  let prev = ast;
  let brackets = 0;
  const length = input.length;
  let index = 0;
  let depth = 0;
  let value;

  /**
   * Helpers
   */

  const advance = () => input[index++];
  const push = node => {
    if (node.type === 'text' && prev.type === 'dot') {
      prev.type = 'text';
    }

    if (prev && prev.type === 'text' && node.type === 'text') {
      prev.value += node.value;
      return;
    }

    block.nodes.push(node);
    node.parent = block;
    node.prev = prev;
    prev = node;
    return node;
  };

  push({ type: 'bos' });

  while (index < length) {
    block = stack[stack.length - 1];
    value = advance();

    /**
     * Invalid chars
     */

    if (value === CHAR_ZERO_WIDTH_NOBREAK_SPACE || value === CHAR_NO_BREAK_SPACE) {
      continue;
    }

    /**
     * Escaped chars
     */

    if (value === CHAR_BACKSLASH) {
      push({ type: 'text', value: (options.keepEscaping ? value : '') + advance() });
      continue;
    }

    /**
     * Right square bracket (literal): ']'
     */

    if (value === CHAR_RIGHT_SQUARE_BRACKET) {
      push({ type: 'text', value: '\\' + value });
      continue;
    }

    /**
     * Left square bracket: '['
     */

    if (value === CHAR_LEFT_SQUARE_BRACKET) {
      brackets++;

      let next;

      while (index < length && (next = advance())) {
        value += next;

        if (next === CHAR_LEFT_SQUARE_BRACKET) {
          brackets++;
          continue;
        }

        if (next === CHAR_BACKSLASH) {
          value += advance();
          continue;
        }

        if (next === CHAR_RIGHT_SQUARE_BRACKET) {
          brackets--;

          if (brackets === 0) {
            break;
          }
        }
      }

      push({ type: 'text', value });
      continue;
    }

    /**
     * Parentheses
     */

    if (value === CHAR_LEFT_PARENTHESES) {
      block = push({ type: 'paren', nodes: [] });
      stack.push(block);
      push({ type: 'text', value });
      continue;
    }

    if (value === CHAR_RIGHT_PARENTHESES) {
      if (block.type !== 'paren') {
        push({ type: 'text', value });
        continue;
      }
      block = stack.pop();
      push({ type: 'text', value });
      block = stack[stack.length - 1];
      continue;
    }

    /**
     * Quotes: '|"|`
     */

    if (value === CHAR_DOUBLE_QUOTE || value === CHAR_SINGLE_QUOTE || value === CHAR_BACKTICK) {
      const open = value;
      let next;

      if (options.keepQuotes !== true) {
        value = '';
      }

      while (index < length && (next = advance())) {
        if (next === CHAR_BACKSLASH) {
          value += next + advance();
          continue;
        }

        if (next === open) {
          if (options.keepQuotes === true) value += next;
          break;
        }

        value += next;
      }

      push({ type: 'text', value });
      continue;
    }

    /**
     * Left curly brace: '{'
     */

    if (value === CHAR_LEFT_CURLY_BRACE) {
      depth++;

      const dollar = prev.value && prev.value.slice(-1) === '$' || block.dollar === true;
      const brace = {
        type: 'brace',
        open: true,
        close: false,
        dollar,
        depth,
        commas: 0,
        ranges: 0,
        nodes: []
      };

      block = push(brace);
      stack.push(block);
      push({ type: 'open', value });
      continue;
    }

    /**
     * Right curly brace: '}'
     */

    if (value === CHAR_RIGHT_CURLY_BRACE) {
      if (block.type !== 'brace') {
        push({ type: 'text', value });
        continue;
      }

      const type = 'close';
      block = stack.pop();
      block.close = true;

      push({ type, value });
      depth--;

      block = stack[stack.length - 1];
      continue;
    }

    /**
     * Comma: ','
     */

    if (value === CHAR_COMMA && depth > 0) {
      if (block.ranges > 0) {
        block.ranges = 0;
        const open = block.nodes.shift();
        block.nodes = [open, { type: 'text', value: stringify$1(block) }];
      }

      push({ type: 'comma', value });
      block.commas++;
      continue;
    }

    /**
     * Dot: '.'
     */

    if (value === CHAR_DOT && depth > 0 && block.commas === 0) {
      const siblings = block.nodes;

      if (depth === 0 || siblings.length === 0) {
        push({ type: 'text', value });
        continue;
      }

      if (prev.type === 'dot') {
        block.range = [];
        prev.value += value;
        prev.type = 'range';

        if (block.nodes.length !== 3 && block.nodes.length !== 5) {
          block.invalid = true;
          block.ranges = 0;
          prev.type = 'text';
          continue;
        }

        block.ranges++;
        block.args = [];
        continue;
      }

      if (prev.type === 'range') {
        siblings.pop();

        const before = siblings[siblings.length - 1];
        before.value += prev.value + value;
        prev = before;
        block.ranges--;
        continue;
      }

      push({ type: 'dot', value });
      continue;
    }

    /**
     * Text
     */

    push({ type: 'text', value });
  }

  // Mark imbalanced braces and brackets as invalid
  do {
    block = stack.pop();

    if (block.type !== 'root') {
      block.nodes.forEach(node => {
        if (!node.nodes) {
          if (node.type === 'open') node.isOpen = true;
          if (node.type === 'close') node.isClose = true;
          if (!node.nodes) node.type = 'text';
          node.invalid = true;
        }
      });

      // get the location of the block on parent.nodes (block's siblings)
      const parent = stack[stack.length - 1];
      const index = parent.nodes.indexOf(block);
      // replace the (invalid) block with it's nodes
      parent.nodes.splice(index, 1, ...block.nodes);
    }
  } while (stack.length > 0);

  push({ type: 'eos' });
  return ast;
};

var parse_1 = parse$1;

const stringify = stringify$4;
const compile = compile_1;
const expand = expand_1;
const parse = parse_1;

/**
 * Expand the given pattern or create a regex-compatible string.
 *
 * ```js
 * const braces = require('braces');
 * console.log(braces('{a,b,c}', { compile: true })); //=> ['(a|b|c)']
 * console.log(braces('{a,b,c}')); //=> ['a', 'b', 'c']
 * ```
 * @param {String} `str`
 * @param {Object} `options`
 * @return {String}
 * @api public
 */

const braces$1 = (input, options = {}) => {
  let output = [];

  if (Array.isArray(input)) {
    for (const pattern of input) {
      const result = braces$1.create(pattern, options);
      if (Array.isArray(result)) {
        output.push(...result);
      } else {
        output.push(result);
      }
    }
  } else {
    output = [].concat(braces$1.create(input, options));
  }

  if (options && options.expand === true && options.nodupes === true) {
    output = [...new Set(output)];
  }
  return output;
};

/**
 * Parse the given `str` with the given `options`.
 *
 * ```js
 * // braces.parse(pattern, [, options]);
 * const ast = braces.parse('a/{b,c}/d');
 * console.log(ast);
 * ```
 * @param {String} pattern Brace pattern to parse
 * @param {Object} options
 * @return {Object} Returns an AST
 * @api public
 */

braces$1.parse = (input, options = {}) => parse(input, options);

/**
 * Creates a braces string from an AST, or an AST node.
 *
 * ```js
 * const braces = require('braces');
 * let ast = braces.parse('foo/{a,b}/bar');
 * console.log(stringify(ast.nodes[2])); //=> '{a,b}'
 * ```
 * @param {String} `input` Brace pattern or AST.
 * @param {Object} `options`
 * @return {Array} Returns an array of expanded values.
 * @api public
 */

braces$1.stringify = (input, options = {}) => {
  if (typeof input === 'string') {
    return stringify(braces$1.parse(input, options), options);
  }
  return stringify(input, options);
};

/**
 * Compiles a brace pattern into a regex-compatible, optimized string.
 * This method is called by the main [braces](#braces) function by default.
 *
 * ```js
 * const braces = require('braces');
 * console.log(braces.compile('a/{b,c}/d'));
 * //=> ['a/(b|c)/d']
 * ```
 * @param {String} `input` Brace pattern or AST.
 * @param {Object} `options`
 * @return {Array} Returns an array of expanded values.
 * @api public
 */

braces$1.compile = (input, options = {}) => {
  if (typeof input === 'string') {
    input = braces$1.parse(input, options);
  }
  return compile(input, options);
};

/**
 * Expands a brace pattern into an array. This method is called by the
 * main [braces](#braces) function when `options.expand` is true. Before
 * using this method it's recommended that you read the [performance notes](#performance))
 * and advantages of using [.compile](#compile) instead.
 *
 * ```js
 * const braces = require('braces');
 * console.log(braces.expand('a/{b,c}/d'));
 * //=> ['a/b/d', 'a/c/d'];
 * ```
 * @param {String} `pattern` Brace pattern
 * @param {Object} `options`
 * @return {Array} Returns an array of expanded values.
 * @api public
 */

braces$1.expand = (input, options = {}) => {
  if (typeof input === 'string') {
    input = braces$1.parse(input, options);
  }

  let result = expand(input, options);

  // filter out empty strings if specified
  if (options.noempty === true) {
    result = result.filter(Boolean);
  }

  // filter out duplicates if specified
  if (options.nodupes === true) {
    result = [...new Set(result)];
  }

  return result;
};

/**
 * Processes a brace pattern and returns either an expanded array
 * (if `options.expand` is true), a highly optimized regex-compatible string.
 * This method is called by the main [braces](#braces) function.
 *
 * ```js
 * const braces = require('braces');
 * console.log(braces.create('user-{200..300}/project-{a,b,c}-{1..10}'))
 * //=> 'user-(20[0-9]|2[1-9][0-9]|300)/project-(a|b|c)-([1-9]|10)'
 * ```
 * @param {String} `pattern` Brace pattern
 * @param {Object} `options`
 * @return {Array} Returns an array of expanded values.
 * @api public
 */

braces$1.create = (input, options = {}) => {
  if (input === '' || input.length < 3) {
    return [input];
  }

  return options.expand !== true
    ? braces$1.compile(input, options)
    : braces$1.expand(input, options);
};

/**
 * Expose "braces"
 */

var braces_1 = braces$1;

var require$$0 = [
	"3dm",
	"3ds",
	"3g2",
	"3gp",
	"7z",
	"a",
	"aac",
	"adp",
	"afdesign",
	"afphoto",
	"afpub",
	"ai",
	"aif",
	"aiff",
	"alz",
	"ape",
	"apk",
	"appimage",
	"ar",
	"arj",
	"asf",
	"au",
	"avi",
	"bak",
	"baml",
	"bh",
	"bin",
	"bk",
	"bmp",
	"btif",
	"bz2",
	"bzip2",
	"cab",
	"caf",
	"cgm",
	"class",
	"cmx",
	"cpio",
	"cr2",
	"cur",
	"dat",
	"dcm",
	"deb",
	"dex",
	"djvu",
	"dll",
	"dmg",
	"dng",
	"doc",
	"docm",
	"docx",
	"dot",
	"dotm",
	"dra",
	"DS_Store",
	"dsk",
	"dts",
	"dtshd",
	"dvb",
	"dwg",
	"dxf",
	"ecelp4800",
	"ecelp7470",
	"ecelp9600",
	"egg",
	"eol",
	"eot",
	"epub",
	"exe",
	"f4v",
	"fbs",
	"fh",
	"fla",
	"flac",
	"flatpak",
	"fli",
	"flv",
	"fpx",
	"fst",
	"fvt",
	"g3",
	"gh",
	"gif",
	"graffle",
	"gz",
	"gzip",
	"h261",
	"h263",
	"h264",
	"icns",
	"ico",
	"ief",
	"img",
	"ipa",
	"iso",
	"jar",
	"jpeg",
	"jpg",
	"jpgv",
	"jpm",
	"jxr",
	"key",
	"ktx",
	"lha",
	"lib",
	"lvp",
	"lz",
	"lzh",
	"lzma",
	"lzo",
	"m3u",
	"m4a",
	"m4v",
	"mar",
	"mdi",
	"mht",
	"mid",
	"midi",
	"mj2",
	"mka",
	"mkv",
	"mmr",
	"mng",
	"mobi",
	"mov",
	"movie",
	"mp3",
	"mp4",
	"mp4a",
	"mpeg",
	"mpg",
	"mpga",
	"mxu",
	"nef",
	"npx",
	"numbers",
	"nupkg",
	"o",
	"odp",
	"ods",
	"odt",
	"oga",
	"ogg",
	"ogv",
	"otf",
	"ott",
	"pages",
	"pbm",
	"pcx",
	"pdb",
	"pdf",
	"pea",
	"pgm",
	"pic",
	"png",
	"pnm",
	"pot",
	"potm",
	"potx",
	"ppa",
	"ppam",
	"ppm",
	"pps",
	"ppsm",
	"ppsx",
	"ppt",
	"pptm",
	"pptx",
	"psd",
	"pya",
	"pyc",
	"pyo",
	"pyv",
	"qt",
	"rar",
	"ras",
	"raw",
	"resources",
	"rgb",
	"rip",
	"rlc",
	"rmf",
	"rmvb",
	"rpm",
	"rtf",
	"rz",
	"s3m",
	"s7z",
	"scpt",
	"sgi",
	"shar",
	"snap",
	"sil",
	"sketch",
	"slk",
	"smv",
	"snk",
	"so",
	"stl",
	"suo",
	"sub",
	"swf",
	"tar",
	"tbz",
	"tbz2",
	"tga",
	"tgz",
	"thmx",
	"tif",
	"tiff",
	"tlz",
	"ttc",
	"ttf",
	"txz",
	"udf",
	"uvh",
	"uvi",
	"uvm",
	"uvp",
	"uvs",
	"uvu",
	"viv",
	"vob",
	"war",
	"wav",
	"wax",
	"wbmp",
	"wdp",
	"weba",
	"webm",
	"webp",
	"whl",
	"wim",
	"wm",
	"wma",
	"wmv",
	"wmx",
	"woff",
	"woff2",
	"wrm",
	"wvx",
	"xbm",
	"xif",
	"xla",
	"xlam",
	"xls",
	"xlsb",
	"xlsm",
	"xlsx",
	"xlt",
	"xltm",
	"xltx",
	"xm",
	"xmind",
	"xpi",
	"xpm",
	"xwd",
	"xz",
	"z",
	"zip",
	"zipx"
];

var binaryExtensions$1 = require$$0;

const path = path$3;
const binaryExtensions = binaryExtensions$1;

const extensions = new Set(binaryExtensions);

var isBinaryPath$1 = filePath => extensions.has(path.extname(filePath).slice(1).toLowerCase());

var constants = {};

(function (exports) {

	const {sep} = path$3;
	const {platform} = process;
	const os$1 = os;

	exports.EV_ALL = 'all';
	exports.EV_READY = 'ready';
	exports.EV_ADD = 'add';
	exports.EV_CHANGE = 'change';
	exports.EV_ADD_DIR = 'addDir';
	exports.EV_UNLINK = 'unlink';
	exports.EV_UNLINK_DIR = 'unlinkDir';
	exports.EV_RAW = 'raw';
	exports.EV_ERROR = 'error';

	exports.STR_DATA = 'data';
	exports.STR_END = 'end';
	exports.STR_CLOSE = 'close';

	exports.FSEVENT_CREATED = 'created';
	exports.FSEVENT_MODIFIED = 'modified';
	exports.FSEVENT_DELETED = 'deleted';
	exports.FSEVENT_MOVED = 'moved';
	exports.FSEVENT_CLONED = 'cloned';
	exports.FSEVENT_UNKNOWN = 'unknown';
	exports.FSEVENT_FLAG_MUST_SCAN_SUBDIRS = 1;
	exports.FSEVENT_TYPE_FILE = 'file';
	exports.FSEVENT_TYPE_DIRECTORY = 'directory';
	exports.FSEVENT_TYPE_SYMLINK = 'symlink';

	exports.KEY_LISTENERS = 'listeners';
	exports.KEY_ERR = 'errHandlers';
	exports.KEY_RAW = 'rawEmitters';
	exports.HANDLER_KEYS = [exports.KEY_LISTENERS, exports.KEY_ERR, exports.KEY_RAW];

	exports.DOT_SLASH = `.${sep}`;

	exports.BACK_SLASH_RE = /\\/g;
	exports.DOUBLE_SLASH_RE = /\/\//;
	exports.SLASH_OR_BACK_SLASH_RE = /[/\\]/;
	exports.DOT_RE = /\..*\.(sw[px])$|~$|\.subl.*\.tmp/;
	exports.REPLACER_RE = /^\.[/\\]/;

	exports.SLASH = '/';
	exports.SLASH_SLASH = '//';
	exports.BRACE_START = '{';
	exports.BANG = '!';
	exports.ONE_DOT = '.';
	exports.TWO_DOTS = '..';
	exports.STAR = '*';
	exports.GLOBSTAR = '**';
	exports.ROOT_GLOBSTAR = '/**/*';
	exports.SLASH_GLOBSTAR = '/**';
	exports.DIR_SUFFIX = 'Dir';
	exports.ANYMATCH_OPTS = {dot: true};
	exports.STRING_TYPE = 'string';
	exports.FUNCTION_TYPE = 'function';
	exports.EMPTY_STR = '';
	exports.EMPTY_FN = () => {};
	exports.IDENTITY_FN = val => val;

	exports.isWindows = platform === 'win32';
	exports.isMacos = platform === 'darwin';
	exports.isLinux = platform === 'linux';
	exports.isIBMi = os$1.type() === 'OS400'; 
} (constants));

const fs$2 = require$$0$1;
const sysPath$2 = path$3;
const { promisify: promisify$2 } = require$$2;
const isBinaryPath = isBinaryPath$1;
const {
  isWindows: isWindows$1,
  isLinux,
  EMPTY_FN: EMPTY_FN$2,
  EMPTY_STR: EMPTY_STR$1,
  KEY_LISTENERS,
  KEY_ERR,
  KEY_RAW,
  HANDLER_KEYS,
  EV_CHANGE: EV_CHANGE$2,
  EV_ADD: EV_ADD$2,
  EV_ADD_DIR: EV_ADD_DIR$2,
  EV_ERROR: EV_ERROR$2,
  STR_DATA: STR_DATA$1,
  STR_END: STR_END$2,
  BRACE_START: BRACE_START$1,
  STAR
} = constants;

const THROTTLE_MODE_WATCH = 'watch';

const open = promisify$2(fs$2.open);
const stat$2 = promisify$2(fs$2.stat);
const lstat$1 = promisify$2(fs$2.lstat);
const close = promisify$2(fs$2.close);
const fsrealpath = promisify$2(fs$2.realpath);

const statMethods$1 = { lstat: lstat$1, stat: stat$2 };

// TODO: emit errors properly. Example: EMFILE on Macos.
const foreach = (val, fn) => {
  if (val instanceof Set) {
    val.forEach(fn);
  } else {
    fn(val);
  }
};

const addAndConvert = (main, prop, item) => {
  let container = main[prop];
  if (!(container instanceof Set)) {
    main[prop] = container = new Set([container]);
  }
  container.add(item);
};

const clearItem = cont => key => {
  const set = cont[key];
  if (set instanceof Set) {
    set.clear();
  } else {
    delete cont[key];
  }
};

const delFromSet = (main, prop, item) => {
  const container = main[prop];
  if (container instanceof Set) {
    container.delete(item);
  } else if (container === item) {
    delete main[prop];
  }
};

const isEmptySet = (val) => val instanceof Set ? val.size === 0 : !val;

/**
 * @typedef {String} Path
 */

// fs_watch helpers

// object to hold per-process fs_watch instances
// (may be shared across chokidar FSWatcher instances)

/**
 * @typedef {Object} FsWatchContainer
 * @property {Set} listeners
 * @property {Set} errHandlers
 * @property {Set} rawEmitters
 * @property {fs.FSWatcher=} watcher
 * @property {Boolean=} watcherUnusable
 */

/**
 * @type {Map<String,FsWatchContainer>}
 */
const FsWatchInstances = new Map();

/**
 * Instantiates the fs_watch interface
 * @param {String} path to be watched
 * @param {Object} options to be passed to fs_watch
 * @param {Function} listener main event handler
 * @param {Function} errHandler emits info about errors
 * @param {Function} emitRaw emits raw event data
 * @returns {fs.FSWatcher} new fsevents instance
 */
function createFsWatchInstance(path, options, listener, errHandler, emitRaw) {
  const handleEvent = (rawEvent, evPath) => {
    listener(path);
    emitRaw(rawEvent, evPath, {watchedPath: path});

    // emit based on events occurring for files from a directory's watcher in
    // case the file's watcher misses it (and rely on throttling to de-dupe)
    if (evPath && path !== evPath) {
      fsWatchBroadcast(
        sysPath$2.resolve(path, evPath), KEY_LISTENERS, sysPath$2.join(path, evPath)
      );
    }
  };
  try {
    return fs$2.watch(path, options, handleEvent);
  } catch (error) {
    errHandler(error);
  }
}

/**
 * Helper for passing fs_watch event data to a collection of listeners
 * @param {Path} fullPath absolute path bound to fs_watch instance
 * @param {String} type listener type
 * @param {*=} val1 arguments to be passed to listeners
 * @param {*=} val2
 * @param {*=} val3
 */
const fsWatchBroadcast = (fullPath, type, val1, val2, val3) => {
  const cont = FsWatchInstances.get(fullPath);
  if (!cont) return;
  foreach(cont[type], (listener) => {
    listener(val1, val2, val3);
  });
};

/**
 * Instantiates the fs_watch interface or binds listeners
 * to an existing one covering the same file system entry
 * @param {String} path
 * @param {String} fullPath absolute path
 * @param {Object} options to be passed to fs_watch
 * @param {Object} handlers container for event listener functions
 */
const setFsWatchListener = (path, fullPath, options, handlers) => {
  const {listener, errHandler, rawEmitter} = handlers;
  let cont = FsWatchInstances.get(fullPath);

  /** @type {fs.FSWatcher=} */
  let watcher;
  if (!options.persistent) {
    watcher = createFsWatchInstance(
      path, options, listener, errHandler, rawEmitter
    );
    return watcher.close.bind(watcher);
  }
  if (cont) {
    addAndConvert(cont, KEY_LISTENERS, listener);
    addAndConvert(cont, KEY_ERR, errHandler);
    addAndConvert(cont, KEY_RAW, rawEmitter);
  } else {
    watcher = createFsWatchInstance(
      path,
      options,
      fsWatchBroadcast.bind(null, fullPath, KEY_LISTENERS),
      errHandler, // no need to use broadcast here
      fsWatchBroadcast.bind(null, fullPath, KEY_RAW)
    );
    if (!watcher) return;
    watcher.on(EV_ERROR$2, async (error) => {
      const broadcastErr = fsWatchBroadcast.bind(null, fullPath, KEY_ERR);
      cont.watcherUnusable = true; // documented since Node 10.4.1
      // Workaround for https://github.com/joyent/node/issues/4337
      if (isWindows$1 && error.code === 'EPERM') {
        try {
          const fd = await open(path, 'r');
          await close(fd);
          broadcastErr(error);
        } catch (err) {}
      } else {
        broadcastErr(error);
      }
    });
    cont = {
      listeners: listener,
      errHandlers: errHandler,
      rawEmitters: rawEmitter,
      watcher
    };
    FsWatchInstances.set(fullPath, cont);
  }
  // const index = cont.listeners.indexOf(listener);

  // removes this instance's listeners and closes the underlying fs_watch
  // instance if there are no more listeners left
  return () => {
    delFromSet(cont, KEY_LISTENERS, listener);
    delFromSet(cont, KEY_ERR, errHandler);
    delFromSet(cont, KEY_RAW, rawEmitter);
    if (isEmptySet(cont.listeners)) {
      // Check to protect against issue gh-730.
      // if (cont.watcherUnusable) {
      cont.watcher.close();
      // }
      FsWatchInstances.delete(fullPath);
      HANDLER_KEYS.forEach(clearItem(cont));
      cont.watcher = undefined;
      Object.freeze(cont);
    }
  };
};

// fs_watchFile helpers

// object to hold per-process fs_watchFile instances
// (may be shared across chokidar FSWatcher instances)
const FsWatchFileInstances = new Map();

/**
 * Instantiates the fs_watchFile interface or binds listeners
 * to an existing one covering the same file system entry
 * @param {String} path to be watched
 * @param {String} fullPath absolute path
 * @param {Object} options options to be passed to fs_watchFile
 * @param {Object} handlers container for event listener functions
 * @returns {Function} closer
 */
const setFsWatchFileListener = (path, fullPath, options, handlers) => {
  const {listener, rawEmitter} = handlers;
  let cont = FsWatchFileInstances.get(fullPath);

  const copts = cont && cont.options;
  if (copts && (copts.persistent < options.persistent || copts.interval > options.interval)) {
    // "Upgrade" the watcher to persistence or a quicker interval.
    // This creates some unlikely edge case issues if the user mixes
    // settings in a very weird way, but solving for those cases
    // doesn't seem worthwhile for the added complexity.
    cont.listeners;
    cont.rawEmitters;
    fs$2.unwatchFile(fullPath);
    cont = undefined;
  }

  /* eslint-enable no-unused-vars, prefer-destructuring */

  if (cont) {
    addAndConvert(cont, KEY_LISTENERS, listener);
    addAndConvert(cont, KEY_RAW, rawEmitter);
  } else {
    // TODO
    // listeners.add(listener);
    // rawEmitters.add(rawEmitter);
    cont = {
      listeners: listener,
      rawEmitters: rawEmitter,
      options,
      watcher: fs$2.watchFile(fullPath, options, (curr, prev) => {
        foreach(cont.rawEmitters, (rawEmitter) => {
          rawEmitter(EV_CHANGE$2, fullPath, {curr, prev});
        });
        const currmtime = curr.mtimeMs;
        if (curr.size !== prev.size || currmtime > prev.mtimeMs || currmtime === 0) {
          foreach(cont.listeners, (listener) => listener(path, curr));
        }
      })
    };
    FsWatchFileInstances.set(fullPath, cont);
  }
  // const index = cont.listeners.indexOf(listener);

  // Removes this instance's listeners and closes the underlying fs_watchFile
  // instance if there are no more listeners left.
  return () => {
    delFromSet(cont, KEY_LISTENERS, listener);
    delFromSet(cont, KEY_RAW, rawEmitter);
    if (isEmptySet(cont.listeners)) {
      FsWatchFileInstances.delete(fullPath);
      fs$2.unwatchFile(fullPath);
      cont.options = cont.watcher = undefined;
      Object.freeze(cont);
    }
  };
};

/**
 * @mixin
 */
let NodeFsHandler$1 = class NodeFsHandler {

/**
 * @param {import("../index").FSWatcher} fsW
 */
constructor(fsW) {
  this.fsw = fsW;
  this._boundHandleError = (error) => fsW._handleError(error);
}

/**
 * Watch file for changes with fs_watchFile or fs_watch.
 * @param {String} path to file or dir
 * @param {Function} listener on fs change
 * @returns {Function} closer for the watcher instance
 */
_watchWithNodeFs(path, listener) {
  const opts = this.fsw.options;
  const directory = sysPath$2.dirname(path);
  const basename = sysPath$2.basename(path);
  const parent = this.fsw._getWatchedDir(directory);
  parent.add(basename);
  const absolutePath = sysPath$2.resolve(path);
  const options = {persistent: opts.persistent};
  if (!listener) listener = EMPTY_FN$2;

  let closer;
  if (opts.usePolling) {
    options.interval = opts.enableBinaryInterval && isBinaryPath(basename) ?
      opts.binaryInterval : opts.interval;
    closer = setFsWatchFileListener(path, absolutePath, options, {
      listener,
      rawEmitter: this.fsw._emitRaw
    });
  } else {
    closer = setFsWatchListener(path, absolutePath, options, {
      listener,
      errHandler: this._boundHandleError,
      rawEmitter: this.fsw._emitRaw
    });
  }
  return closer;
}

/**
 * Watch a file and emit add event if warranted.
 * @param {Path} file Path
 * @param {fs.Stats} stats result of fs_stat
 * @param {Boolean} initialAdd was the file added at watch instantiation?
 * @returns {Function} closer for the watcher instance
 */
_handleFile(file, stats, initialAdd) {
  if (this.fsw.closed) {
    return;
  }
  const dirname = sysPath$2.dirname(file);
  const basename = sysPath$2.basename(file);
  const parent = this.fsw._getWatchedDir(dirname);
  // stats is always present
  let prevStats = stats;

  // if the file is already being watched, do nothing
  if (parent.has(basename)) return;

  const listener = async (path, newStats) => {
    if (!this.fsw._throttle(THROTTLE_MODE_WATCH, file, 5)) return;
    if (!newStats || newStats.mtimeMs === 0) {
      try {
        const newStats = await stat$2(file);
        if (this.fsw.closed) return;
        // Check that change event was not fired because of changed only accessTime.
        const at = newStats.atimeMs;
        const mt = newStats.mtimeMs;
        if (!at || at <= mt || mt !== prevStats.mtimeMs) {
          this.fsw._emit(EV_CHANGE$2, file, newStats);
        }
        if (isLinux && prevStats.ino !== newStats.ino) {
          this.fsw._closeFile(path);
          prevStats = newStats;
          this.fsw._addPathCloser(path, this._watchWithNodeFs(file, listener));
        } else {
          prevStats = newStats;
        }
      } catch (error) {
        // Fix issues where mtime is null but file is still present
        this.fsw._remove(dirname, basename);
      }
      // add is about to be emitted if file not already tracked in parent
    } else if (parent.has(basename)) {
      // Check that change event was not fired because of changed only accessTime.
      const at = newStats.atimeMs;
      const mt = newStats.mtimeMs;
      if (!at || at <= mt || mt !== prevStats.mtimeMs) {
        this.fsw._emit(EV_CHANGE$2, file, newStats);
      }
      prevStats = newStats;
    }
  };
  // kick off the watcher
  const closer = this._watchWithNodeFs(file, listener);

  // emit an add event if we're supposed to
  if (!(initialAdd && this.fsw.options.ignoreInitial) && this.fsw._isntIgnored(file)) {
    if (!this.fsw._throttle(EV_ADD$2, file, 0)) return;
    this.fsw._emit(EV_ADD$2, file, stats);
  }

  return closer;
}

/**
 * Handle symlinks encountered while reading a dir.
 * @param {Object} entry returned by readdirp
 * @param {String} directory path of dir being read
 * @param {String} path of this item
 * @param {String} item basename of this item
 * @returns {Promise<Boolean>} true if no more processing is needed for this entry.
 */
async _handleSymlink(entry, directory, path, item) {
  if (this.fsw.closed) {
    return;
  }
  const full = entry.fullPath;
  const dir = this.fsw._getWatchedDir(directory);

  if (!this.fsw.options.followSymlinks) {
    // watch symlink directly (don't follow) and detect changes
    this.fsw._incrReadyCount();

    let linkPath;
    try {
      linkPath = await fsrealpath(path);
    } catch (e) {
      this.fsw._emitReady();
      return true;
    }

    if (this.fsw.closed) return;
    if (dir.has(item)) {
      if (this.fsw._symlinkPaths.get(full) !== linkPath) {
        this.fsw._symlinkPaths.set(full, linkPath);
        this.fsw._emit(EV_CHANGE$2, path, entry.stats);
      }
    } else {
      dir.add(item);
      this.fsw._symlinkPaths.set(full, linkPath);
      this.fsw._emit(EV_ADD$2, path, entry.stats);
    }
    this.fsw._emitReady();
    return true;
  }

  // don't follow the same symlink more than once
  if (this.fsw._symlinkPaths.has(full)) {
    return true;
  }

  this.fsw._symlinkPaths.set(full, true);
}

_handleRead(directory, initialAdd, wh, target, dir, depth, throttler) {
  // Normalize the directory name on Windows
  directory = sysPath$2.join(directory, EMPTY_STR$1);

  if (!wh.hasGlob) {
    throttler = this.fsw._throttle('readdir', directory, 1000);
    if (!throttler) return;
  }

  const previous = this.fsw._getWatchedDir(wh.path);
  const current = new Set();

  let stream = this.fsw._readdirp(directory, {
    fileFilter: entry => wh.filterPath(entry),
    directoryFilter: entry => wh.filterDir(entry),
    depth: 0
  }).on(STR_DATA$1, async (entry) => {
    if (this.fsw.closed) {
      stream = undefined;
      return;
    }
    const item = entry.path;
    let path = sysPath$2.join(directory, item);
    current.add(item);

    if (entry.stats.isSymbolicLink() && await this._handleSymlink(entry, directory, path, item)) {
      return;
    }

    if (this.fsw.closed) {
      stream = undefined;
      return;
    }
    // Files that present in current directory snapshot
    // but absent in previous are added to watch list and
    // emit `add` event.
    if (item === target || !target && !previous.has(item)) {
      this.fsw._incrReadyCount();

      // ensure relativeness of path is preserved in case of watcher reuse
      path = sysPath$2.join(dir, sysPath$2.relative(dir, path));

      this._addToNodeFs(path, initialAdd, wh, depth + 1);
    }
  }).on(EV_ERROR$2, this._boundHandleError);

  return new Promise(resolve =>
    stream.once(STR_END$2, () => {
      if (this.fsw.closed) {
        stream = undefined;
        return;
      }
      const wasThrottled = throttler ? throttler.clear() : false;

      resolve();

      // Files that absent in current directory snapshot
      // but present in previous emit `remove` event
      // and are removed from @watched[directory].
      previous.getChildren().filter((item) => {
        return item !== directory &&
          !current.has(item) &&
          // in case of intersecting globs;
          // a path may have been filtered out of this readdir, but
          // shouldn't be removed because it matches a different glob
          (!wh.hasGlob || wh.filterPath({
            fullPath: sysPath$2.resolve(directory, item)
          }));
      }).forEach((item) => {
        this.fsw._remove(directory, item);
      });

      stream = undefined;

      // one more time for any missed in case changes came in extremely quickly
      if (wasThrottled) this._handleRead(directory, false, wh, target, dir, depth, throttler);
    })
  );
}

/**
 * Read directory to add / remove files from `@watched` list and re-read it on change.
 * @param {String} dir fs path
 * @param {fs.Stats} stats
 * @param {Boolean} initialAdd
 * @param {Number} depth relative to user-supplied path
 * @param {String} target child path targeted for watch
 * @param {Object} wh Common watch helpers for this path
 * @param {String} realpath
 * @returns {Promise<Function>} closer for the watcher instance.
 */
async _handleDir(dir, stats, initialAdd, depth, target, wh, realpath) {
  const parentDir = this.fsw._getWatchedDir(sysPath$2.dirname(dir));
  const tracked = parentDir.has(sysPath$2.basename(dir));
  if (!(initialAdd && this.fsw.options.ignoreInitial) && !target && !tracked) {
    if (!wh.hasGlob || wh.globFilter(dir)) this.fsw._emit(EV_ADD_DIR$2, dir, stats);
  }

  // ensure dir is tracked (harmless if redundant)
  parentDir.add(sysPath$2.basename(dir));
  this.fsw._getWatchedDir(dir);
  let throttler;
  let closer;

  const oDepth = this.fsw.options.depth;
  if ((oDepth == null || depth <= oDepth) && !this.fsw._symlinkPaths.has(realpath)) {
    if (!target) {
      await this._handleRead(dir, initialAdd, wh, target, dir, depth, throttler);
      if (this.fsw.closed) return;
    }

    closer = this._watchWithNodeFs(dir, (dirPath, stats) => {
      // if current directory is removed, do nothing
      if (stats && stats.mtimeMs === 0) return;

      this._handleRead(dirPath, false, wh, target, dir, depth, throttler);
    });
  }
  return closer;
}

/**
 * Handle added file, directory, or glob pattern.
 * Delegates call to _handleFile / _handleDir after checks.
 * @param {String} path to file or ir
 * @param {Boolean} initialAdd was the file added at watch instantiation?
 * @param {Object} priorWh depth relative to user-supplied path
 * @param {Number} depth Child path actually targeted for watch
 * @param {String=} target Child path actually targeted for watch
 * @returns {Promise}
 */
async _addToNodeFs(path, initialAdd, priorWh, depth, target) {
  const ready = this.fsw._emitReady;
  if (this.fsw._isIgnored(path) || this.fsw.closed) {
    ready();
    return false;
  }

  const wh = this.fsw._getWatchHelpers(path, depth);
  if (!wh.hasGlob && priorWh) {
    wh.hasGlob = priorWh.hasGlob;
    wh.globFilter = priorWh.globFilter;
    wh.filterPath = entry => priorWh.filterPath(entry);
    wh.filterDir = entry => priorWh.filterDir(entry);
  }

  // evaluate what is at the path we're being asked to watch
  try {
    const stats = await statMethods$1[wh.statMethod](wh.watchPath);
    if (this.fsw.closed) return;
    if (this.fsw._isIgnored(wh.watchPath, stats)) {
      ready();
      return false;
    }

    const follow = this.fsw.options.followSymlinks && !path.includes(STAR) && !path.includes(BRACE_START$1);
    let closer;
    if (stats.isDirectory()) {
      const absPath = sysPath$2.resolve(path);
      const targetPath = follow ? await fsrealpath(path) : path;
      if (this.fsw.closed) return;
      closer = await this._handleDir(wh.watchPath, stats, initialAdd, depth, target, wh, targetPath);
      if (this.fsw.closed) return;
      // preserve this symlink's target path
      if (absPath !== targetPath && targetPath !== undefined) {
        this.fsw._symlinkPaths.set(absPath, targetPath);
      }
    } else if (stats.isSymbolicLink()) {
      const targetPath = follow ? await fsrealpath(path) : path;
      if (this.fsw.closed) return;
      const parent = sysPath$2.dirname(wh.watchPath);
      this.fsw._getWatchedDir(parent).add(wh.watchPath);
      this.fsw._emit(EV_ADD$2, wh.watchPath, stats);
      closer = await this._handleDir(parent, stats, initialAdd, depth, path, wh, targetPath);
      if (this.fsw.closed) return;

      // preserve this symlink's target path
      if (targetPath !== undefined) {
        this.fsw._symlinkPaths.set(sysPath$2.resolve(path), targetPath);
      }
    } else {
      closer = this._handleFile(wh.watchPath, stats, initialAdd);
    }
    ready();

    this.fsw._addPathCloser(path, closer);
    return false;

  } catch (error) {
    if (this.fsw._handleError(error)) {
      ready();
      return path;
    }
  }
}

};

var nodefsHandler = NodeFsHandler$1;

var fseventsHandler = {exports: {}};

const fs$1 = require$$0$1;
const sysPath$1 = path$3;
const { promisify: promisify$1 } = require$$2;

let fsevents;
try {
  fsevents = require('fsevents');
} catch (error) {
  if (process.env.CHOKIDAR_PRINT_FSEVENTS_REQUIRE_ERROR) console.error(error);
}

if (fsevents) {
  // TODO: real check
  const mtch = process.version.match(/v(\d+)\.(\d+)/);
  if (mtch && mtch[1] && mtch[2]) {
    const maj = Number.parseInt(mtch[1], 10);
    const min = Number.parseInt(mtch[2], 10);
    if (maj === 8 && min < 16) {
      fsevents = undefined;
    }
  }
}

const {
  EV_ADD: EV_ADD$1,
  EV_CHANGE: EV_CHANGE$1,
  EV_ADD_DIR: EV_ADD_DIR$1,
  EV_UNLINK: EV_UNLINK$1,
  EV_ERROR: EV_ERROR$1,
  STR_DATA,
  STR_END: STR_END$1,
  FSEVENT_CREATED,
  FSEVENT_MODIFIED,
  FSEVENT_DELETED,
  FSEVENT_MOVED,
  // FSEVENT_CLONED,
  FSEVENT_UNKNOWN,
  FSEVENT_FLAG_MUST_SCAN_SUBDIRS,
  FSEVENT_TYPE_FILE,
  FSEVENT_TYPE_DIRECTORY,
  FSEVENT_TYPE_SYMLINK,

  ROOT_GLOBSTAR,
  DIR_SUFFIX,
  DOT_SLASH,
  FUNCTION_TYPE: FUNCTION_TYPE$1,
  EMPTY_FN: EMPTY_FN$1,
  IDENTITY_FN
} = constants;

const Depth = (value) => isNaN(value) ? {} : {depth: value};

const stat$1 = promisify$1(fs$1.stat);
const lstat = promisify$1(fs$1.lstat);
const realpath = promisify$1(fs$1.realpath);

const statMethods = { stat: stat$1, lstat };

/**
 * @typedef {String} Path
 */

/**
 * @typedef {Object} FsEventsWatchContainer
 * @property {Set<Function>} listeners
 * @property {Function} rawEmitter
 * @property {{stop: Function}} watcher
 */

// fsevents instance helper functions
/**
 * Object to hold per-process fsevents instances (may be shared across chokidar FSWatcher instances)
 * @type {Map<Path,FsEventsWatchContainer>}
 */
const FSEventsWatchers = new Map();

// Threshold of duplicate path prefixes at which to start
// consolidating going forward
const consolidateThreshhold = 10;

const wrongEventFlags = new Set([
  69888, 70400, 71424, 72704, 73472, 131328, 131840, 262912
]);

/**
 * Instantiates the fsevents interface
 * @param {Path} path path to be watched
 * @param {Function} callback called when fsevents is bound and ready
 * @returns {{stop: Function}} new fsevents instance
 */
const createFSEventsInstance = (path, callback) => {
  const stop = fsevents.watch(path, callback);
  return {stop};
};

/**
 * Instantiates the fsevents interface or binds listeners to an existing one covering
 * the same file tree.
 * @param {Path} path           - to be watched
 * @param {Path} realPath       - real path for symlinks
 * @param {Function} listener   - called when fsevents emits events
 * @param {Function} rawEmitter - passes data to listeners of the 'raw' event
 * @returns {Function} closer
 */
function setFSEventsListener(path, realPath, listener, rawEmitter) {
  let watchPath = sysPath$1.extname(realPath) ? sysPath$1.dirname(realPath) : realPath;

  const parentPath = sysPath$1.dirname(watchPath);
  let cont = FSEventsWatchers.get(watchPath);

  // If we've accumulated a substantial number of paths that
  // could have been consolidated by watching one directory
  // above the current one, create a watcher on the parent
  // path instead, so that we do consolidate going forward.
  if (couldConsolidate(parentPath)) {
    watchPath = parentPath;
  }

  const resolvedPath = sysPath$1.resolve(path);
  const hasSymlink = resolvedPath !== realPath;

  const filteredListener = (fullPath, flags, info) => {
    if (hasSymlink) fullPath = fullPath.replace(realPath, resolvedPath);
    if (
      fullPath === resolvedPath ||
      !fullPath.indexOf(resolvedPath + sysPath$1.sep)
    ) listener(fullPath, flags, info);
  };

  // check if there is already a watcher on a parent path
  // modifies `watchPath` to the parent path when it finds a match
  let watchedParent = false;
  for (const watchedPath of FSEventsWatchers.keys()) {
    if (realPath.indexOf(sysPath$1.resolve(watchedPath) + sysPath$1.sep) === 0) {
      watchPath = watchedPath;
      cont = FSEventsWatchers.get(watchPath);
      watchedParent = true;
      break;
    }
  }

  if (cont || watchedParent) {
    cont.listeners.add(filteredListener);
  } else {
    cont = {
      listeners: new Set([filteredListener]),
      rawEmitter,
      watcher: createFSEventsInstance(watchPath, (fullPath, flags) => {
        if (!cont.listeners.size) return;
        if (flags & FSEVENT_FLAG_MUST_SCAN_SUBDIRS) return;
        const info = fsevents.getInfo(fullPath, flags);
        cont.listeners.forEach(list => {
          list(fullPath, flags, info);
        });

        cont.rawEmitter(info.event, fullPath, info);
      })
    };
    FSEventsWatchers.set(watchPath, cont);
  }

  // removes this instance's listeners and closes the underlying fsevents
  // instance if there are no more listeners left
  return () => {
    const lst = cont.listeners;

    lst.delete(filteredListener);
    if (!lst.size) {
      FSEventsWatchers.delete(watchPath);
      if (cont.watcher) return cont.watcher.stop().then(() => {
        cont.rawEmitter = cont.watcher = undefined;
        Object.freeze(cont);
      });
    }
  };
}

// Decide whether or not we should start a new higher-level
// parent watcher
const couldConsolidate = (path) => {
  let count = 0;
  for (const watchPath of FSEventsWatchers.keys()) {
    if (watchPath.indexOf(path) === 0) {
      count++;
      if (count >= consolidateThreshhold) {
        return true;
      }
    }
  }

  return false;
};

// returns boolean indicating whether fsevents can be used
const canUse = () => fsevents && FSEventsWatchers.size < 128;

// determines subdirectory traversal levels from root to path
const calcDepth = (path, root) => {
  let i = 0;
  while (!path.indexOf(root) && (path = sysPath$1.dirname(path)) !== root) i++;
  return i;
};

// returns boolean indicating whether the fsevents' event info has the same type
// as the one returned by fs.stat
const sameTypes = (info, stats) => (
  info.type === FSEVENT_TYPE_DIRECTORY && stats.isDirectory() ||
  info.type === FSEVENT_TYPE_SYMLINK && stats.isSymbolicLink() ||
  info.type === FSEVENT_TYPE_FILE && stats.isFile()
);

/**
 * @mixin
 */
let FsEventsHandler$1 = class FsEventsHandler {

/**
 * @param {import('../index').FSWatcher} fsw
 */
constructor(fsw) {
  this.fsw = fsw;
}
checkIgnored(path, stats) {
  const ipaths = this.fsw._ignoredPaths;
  if (this.fsw._isIgnored(path, stats)) {
    ipaths.add(path);
    if (stats && stats.isDirectory()) {
      ipaths.add(path + ROOT_GLOBSTAR);
    }
    return true;
  }

  ipaths.delete(path);
  ipaths.delete(path + ROOT_GLOBSTAR);
}

addOrChange(path, fullPath, realPath, parent, watchedDir, item, info, opts) {
  const event = watchedDir.has(item) ? EV_CHANGE$1 : EV_ADD$1;
  this.handleEvent(event, path, fullPath, realPath, parent, watchedDir, item, info, opts);
}

async checkExists(path, fullPath, realPath, parent, watchedDir, item, info, opts) {
  try {
    const stats = await stat$1(path);
    if (this.fsw.closed) return;
    if (sameTypes(info, stats)) {
      this.addOrChange(path, fullPath, realPath, parent, watchedDir, item, info, opts);
    } else {
      this.handleEvent(EV_UNLINK$1, path, fullPath, realPath, parent, watchedDir, item, info, opts);
    }
  } catch (error) {
    if (error.code === 'EACCES') {
      this.addOrChange(path, fullPath, realPath, parent, watchedDir, item, info, opts);
    } else {
      this.handleEvent(EV_UNLINK$1, path, fullPath, realPath, parent, watchedDir, item, info, opts);
    }
  }
}

handleEvent(event, path, fullPath, realPath, parent, watchedDir, item, info, opts) {
  if (this.fsw.closed || this.checkIgnored(path)) return;

  if (event === EV_UNLINK$1) {
    const isDirectory = info.type === FSEVENT_TYPE_DIRECTORY;
    // suppress unlink events on never before seen files
    if (isDirectory || watchedDir.has(item)) {
      this.fsw._remove(parent, item, isDirectory);
    }
  } else {
    if (event === EV_ADD$1) {
      // track new directories
      if (info.type === FSEVENT_TYPE_DIRECTORY) this.fsw._getWatchedDir(path);

      if (info.type === FSEVENT_TYPE_SYMLINK && opts.followSymlinks) {
        // push symlinks back to the top of the stack to get handled
        const curDepth = opts.depth === undefined ?
          undefined : calcDepth(fullPath, realPath) + 1;
        return this._addToFsEvents(path, false, true, curDepth);
      }

      // track new paths
      // (other than symlinks being followed, which will be tracked soon)
      this.fsw._getWatchedDir(parent).add(item);
    }
    /**
     * @type {'add'|'addDir'|'unlink'|'unlinkDir'}
     */
    const eventName = info.type === FSEVENT_TYPE_DIRECTORY ? event + DIR_SUFFIX : event;
    this.fsw._emit(eventName, path);
    if (eventName === EV_ADD_DIR$1) this._addToFsEvents(path, false, true);
  }
}

/**
 * Handle symlinks encountered during directory scan
 * @param {String} watchPath  - file/dir path to be watched with fsevents
 * @param {String} realPath   - real path (in case of symlinks)
 * @param {Function} transform  - path transformer
 * @param {Function} globFilter - path filter in case a glob pattern was provided
 * @returns {Function} closer for the watcher instance
*/
_watchWithFsEvents(watchPath, realPath, transform, globFilter) {
  if (this.fsw.closed || this.fsw._isIgnored(watchPath)) return;
  const opts = this.fsw.options;
  const watchCallback = async (fullPath, flags, info) => {
    if (this.fsw.closed) return;
    if (
      opts.depth !== undefined &&
      calcDepth(fullPath, realPath) > opts.depth
    ) return;
    const path = transform(sysPath$1.join(
      watchPath, sysPath$1.relative(watchPath, fullPath)
    ));
    if (globFilter && !globFilter(path)) return;
    // ensure directories are tracked
    const parent = sysPath$1.dirname(path);
    const item = sysPath$1.basename(path);
    const watchedDir = this.fsw._getWatchedDir(
      info.type === FSEVENT_TYPE_DIRECTORY ? path : parent
    );

    // correct for wrong events emitted
    if (wrongEventFlags.has(flags) || info.event === FSEVENT_UNKNOWN) {
      if (typeof opts.ignored === FUNCTION_TYPE$1) {
        let stats;
        try {
          stats = await stat$1(path);
        } catch (error) {}
        if (this.fsw.closed) return;
        if (this.checkIgnored(path, stats)) return;
        if (sameTypes(info, stats)) {
          this.addOrChange(path, fullPath, realPath, parent, watchedDir, item, info, opts);
        } else {
          this.handleEvent(EV_UNLINK$1, path, fullPath, realPath, parent, watchedDir, item, info, opts);
        }
      } else {
        this.checkExists(path, fullPath, realPath, parent, watchedDir, item, info, opts);
      }
    } else {
      switch (info.event) {
      case FSEVENT_CREATED:
      case FSEVENT_MODIFIED:
        return this.addOrChange(path, fullPath, realPath, parent, watchedDir, item, info, opts);
      case FSEVENT_DELETED:
      case FSEVENT_MOVED:
        return this.checkExists(path, fullPath, realPath, parent, watchedDir, item, info, opts);
      }
    }
  };

  const closer = setFSEventsListener(
    watchPath,
    realPath,
    watchCallback,
    this.fsw._emitRaw
  );

  this.fsw._emitReady();
  return closer;
}

/**
 * Handle symlinks encountered during directory scan
 * @param {String} linkPath path to symlink
 * @param {String} fullPath absolute path to the symlink
 * @param {Function} transform pre-existing path transformer
 * @param {Number} curDepth level of subdirectories traversed to where symlink is
 * @returns {Promise<void>}
 */
async _handleFsEventsSymlink(linkPath, fullPath, transform, curDepth) {
  // don't follow the same symlink more than once
  if (this.fsw.closed || this.fsw._symlinkPaths.has(fullPath)) return;

  this.fsw._symlinkPaths.set(fullPath, true);
  this.fsw._incrReadyCount();

  try {
    const linkTarget = await realpath(linkPath);
    if (this.fsw.closed) return;
    if (this.fsw._isIgnored(linkTarget)) {
      return this.fsw._emitReady();
    }

    this.fsw._incrReadyCount();

    // add the linkTarget for watching with a wrapper for transform
    // that causes emitted paths to incorporate the link's path
    this._addToFsEvents(linkTarget || linkPath, (path) => {
      let aliasedPath = linkPath;
      if (linkTarget && linkTarget !== DOT_SLASH) {
        aliasedPath = path.replace(linkTarget, linkPath);
      } else if (path !== DOT_SLASH) {
        aliasedPath = sysPath$1.join(linkPath, path);
      }
      return transform(aliasedPath);
    }, false, curDepth);
  } catch(error) {
    if (this.fsw._handleError(error)) {
      return this.fsw._emitReady();
    }
  }
}

/**
 *
 * @param {Path} newPath
 * @param {fs.Stats} stats
 */
emitAdd(newPath, stats, processPath, opts, forceAdd) {
  const pp = processPath(newPath);
  const isDir = stats.isDirectory();
  const dirObj = this.fsw._getWatchedDir(sysPath$1.dirname(pp));
  const base = sysPath$1.basename(pp);

  // ensure empty dirs get tracked
  if (isDir) this.fsw._getWatchedDir(pp);
  if (dirObj.has(base)) return;
  dirObj.add(base);

  if (!opts.ignoreInitial || forceAdd === true) {
    this.fsw._emit(isDir ? EV_ADD_DIR$1 : EV_ADD$1, pp, stats);
  }
}

initWatch(realPath, path, wh, processPath) {
  if (this.fsw.closed) return;
  const closer = this._watchWithFsEvents(
    wh.watchPath,
    sysPath$1.resolve(realPath || wh.watchPath),
    processPath,
    wh.globFilter
  );
  this.fsw._addPathCloser(path, closer);
}

/**
 * Handle added path with fsevents
 * @param {String} path file/dir path or glob pattern
 * @param {Function|Boolean=} transform converts working path to what the user expects
 * @param {Boolean=} forceAdd ensure add is emitted
 * @param {Number=} priorDepth Level of subdirectories already traversed.
 * @returns {Promise<void>}
 */
async _addToFsEvents(path, transform, forceAdd, priorDepth) {
  if (this.fsw.closed) {
    return;
  }
  const opts = this.fsw.options;
  const processPath = typeof transform === FUNCTION_TYPE$1 ? transform : IDENTITY_FN;

  const wh = this.fsw._getWatchHelpers(path);

  // evaluate what is at the path we're being asked to watch
  try {
    const stats = await statMethods[wh.statMethod](wh.watchPath);
    if (this.fsw.closed) return;
    if (this.fsw._isIgnored(wh.watchPath, stats)) {
      throw null;
    }
    if (stats.isDirectory()) {
      // emit addDir unless this is a glob parent
      if (!wh.globFilter) this.emitAdd(processPath(path), stats, processPath, opts, forceAdd);

      // don't recurse further if it would exceed depth setting
      if (priorDepth && priorDepth > opts.depth) return;

      // scan the contents of the dir
      this.fsw._readdirp(wh.watchPath, {
        fileFilter: entry => wh.filterPath(entry),
        directoryFilter: entry => wh.filterDir(entry),
        ...Depth(opts.depth - (priorDepth || 0))
      }).on(STR_DATA, (entry) => {
        // need to check filterPath on dirs b/c filterDir is less restrictive
        if (this.fsw.closed) {
          return;
        }
        if (entry.stats.isDirectory() && !wh.filterPath(entry)) return;

        const joinedPath = sysPath$1.join(wh.watchPath, entry.path);
        const {fullPath} = entry;

        if (wh.followSymlinks && entry.stats.isSymbolicLink()) {
          // preserve the current depth here since it can't be derived from
          // real paths past the symlink
          const curDepth = opts.depth === undefined ?
            undefined : calcDepth(joinedPath, sysPath$1.resolve(wh.watchPath)) + 1;

          this._handleFsEventsSymlink(joinedPath, fullPath, processPath, curDepth);
        } else {
          this.emitAdd(joinedPath, entry.stats, processPath, opts, forceAdd);
        }
      }).on(EV_ERROR$1, EMPTY_FN$1).on(STR_END$1, () => {
        this.fsw._emitReady();
      });
    } else {
      this.emitAdd(wh.watchPath, stats, processPath, opts, forceAdd);
      this.fsw._emitReady();
    }
  } catch (error) {
    if (!error || this.fsw._handleError(error)) {
      // TODO: Strange thing: "should not choke on an ignored watch path" will be failed without 2 ready calls -__-
      this.fsw._emitReady();
      this.fsw._emitReady();
    }
  }

  if (opts.persistent && forceAdd !== true) {
    if (typeof transform === FUNCTION_TYPE$1) {
      // realpath has already been resolved
      this.initWatch(undefined, path, wh, processPath);
    } else {
      let realPath;
      try {
        realPath = await realpath(wh.watchPath);
      } catch (e) {}
      this.initWatch(realPath, path, wh, processPath);
    }
  }
}

};

fseventsHandler.exports = FsEventsHandler$1;
fseventsHandler.exports.canUse = canUse;

var fseventsHandlerExports = fseventsHandler.exports;

const { EventEmitter } = require$$0$2;
const fs = require$$0$1;
const sysPath = path$3;
const { promisify } = require$$2;
const readdirp = readdirp_1;
const anymatch = anymatchExports.default;
const globParent = globParent$1;
const isGlob = isGlob$2;
const braces = braces_1;
const normalizePath = normalizePath$2;

const NodeFsHandler = nodefsHandler;
const FsEventsHandler = fseventsHandlerExports;
const {
  EV_ALL,
  EV_READY,
  EV_ADD,
  EV_CHANGE,
  EV_UNLINK,
  EV_ADD_DIR,
  EV_UNLINK_DIR,
  EV_RAW,
  EV_ERROR,

  STR_CLOSE,
  STR_END,

  BACK_SLASH_RE,
  DOUBLE_SLASH_RE,
  SLASH_OR_BACK_SLASH_RE,
  DOT_RE,
  REPLACER_RE,

  SLASH,
  SLASH_SLASH,
  BRACE_START,
  BANG,
  ONE_DOT,
  TWO_DOTS,
  GLOBSTAR,
  SLASH_GLOBSTAR,
  ANYMATCH_OPTS,
  STRING_TYPE,
  FUNCTION_TYPE,
  EMPTY_STR,
  EMPTY_FN,

  isWindows,
  isMacos,
  isIBMi
} = constants;

const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

/**
 * @typedef {String} Path
 * @typedef {'all'|'add'|'addDir'|'change'|'unlink'|'unlinkDir'|'raw'|'error'|'ready'} EventName
 * @typedef {'readdir'|'watch'|'add'|'remove'|'change'} ThrottleType
 */

/**
 *
 * @typedef {Object} WatchHelpers
 * @property {Boolean} followSymlinks
 * @property {'stat'|'lstat'} statMethod
 * @property {Path} path
 * @property {Path} watchPath
 * @property {Function} entryPath
 * @property {Boolean} hasGlob
 * @property {Object} globFilter
 * @property {Function} filterPath
 * @property {Function} filterDir
 */

const arrify = (value = []) => Array.isArray(value) ? value : [value];
const flatten = (list, result = []) => {
  list.forEach(item => {
    if (Array.isArray(item)) {
      flatten(item, result);
    } else {
      result.push(item);
    }
  });
  return result;
};

const unifyPaths = (paths_) => {
  /**
   * @type {Array<String>}
   */
  const paths = flatten(arrify(paths_));
  if (!paths.every(p => typeof p === STRING_TYPE)) {
    throw new TypeError(`Non-string provided as watch path: ${paths}`);
  }
  return paths.map(normalizePathToUnix);
};

// If SLASH_SLASH occurs at the beginning of path, it is not replaced
//     because "//StoragePC/DrivePool/Movies" is a valid network path
const toUnix = (string) => {
  let str = string.replace(BACK_SLASH_RE, SLASH);
  let prepend = false;
  if (str.startsWith(SLASH_SLASH)) {
    prepend = true;
  }
  while (str.match(DOUBLE_SLASH_RE)) {
    str = str.replace(DOUBLE_SLASH_RE, SLASH);
  }
  if (prepend) {
    str = SLASH + str;
  }
  return str;
};

// Our version of upath.normalize
// TODO: this is not equal to path-normalize module - investigate why
const normalizePathToUnix = (path) => toUnix(sysPath.normalize(toUnix(path)));

const normalizeIgnored = (cwd = EMPTY_STR) => (path) => {
  if (typeof path !== STRING_TYPE) return path;
  return normalizePathToUnix(sysPath.isAbsolute(path) ? path : sysPath.join(cwd, path));
};

const getAbsolutePath = (path, cwd) => {
  if (sysPath.isAbsolute(path)) {
    return path;
  }
  if (path.startsWith(BANG)) {
    return BANG + sysPath.join(cwd, path.slice(1));
  }
  return sysPath.join(cwd, path);
};

const undef = (opts, key) => opts[key] === undefined;

/**
 * Directory entry.
 * @property {Path} path
 * @property {Set<Path>} items
 */
class DirEntry {
  /**
   * @param {Path} dir
   * @param {Function} removeWatcher
   */
  constructor(dir, removeWatcher) {
    this.path = dir;
    this._removeWatcher = removeWatcher;
    /** @type {Set<Path>} */
    this.items = new Set();
  }

  add(item) {
    const {items} = this;
    if (!items) return;
    if (item !== ONE_DOT && item !== TWO_DOTS) items.add(item);
  }

  async remove(item) {
    const {items} = this;
    if (!items) return;
    items.delete(item);
    if (items.size > 0) return;

    const dir = this.path;
    try {
      await readdir(dir);
    } catch (err) {
      if (this._removeWatcher) {
        this._removeWatcher(sysPath.dirname(dir), sysPath.basename(dir));
      }
    }
  }

  has(item) {
    const {items} = this;
    if (!items) return;
    return items.has(item);
  }

  /**
   * @returns {Array<String>}
   */
  getChildren() {
    const {items} = this;
    if (!items) return;
    return [...items.values()];
  }

  dispose() {
    this.items.clear();
    delete this.path;
    delete this._removeWatcher;
    delete this.items;
    Object.freeze(this);
  }
}

const STAT_METHOD_F = 'stat';
const STAT_METHOD_L = 'lstat';
class WatchHelper {
  constructor(path, watchPath, follow, fsw) {
    this.fsw = fsw;
    this.path = path = path.replace(REPLACER_RE, EMPTY_STR);
    this.watchPath = watchPath;
    this.fullWatchPath = sysPath.resolve(watchPath);
    this.hasGlob = watchPath !== path;
    /** @type {object|boolean} */
    if (path === EMPTY_STR) this.hasGlob = false;
    this.globSymlink = this.hasGlob && follow ? undefined : false;
    this.globFilter = this.hasGlob ? anymatch(path, undefined, ANYMATCH_OPTS) : false;
    this.dirParts = this.getDirParts(path);
    this.dirParts.forEach((parts) => {
      if (parts.length > 1) parts.pop();
    });
    this.followSymlinks = follow;
    this.statMethod = follow ? STAT_METHOD_F : STAT_METHOD_L;
  }

  checkGlobSymlink(entry) {
    // only need to resolve once
    // first entry should always have entry.parentDir === EMPTY_STR
    if (this.globSymlink === undefined) {
      this.globSymlink = entry.fullParentDir === this.fullWatchPath ?
        false : {realPath: entry.fullParentDir, linkPath: this.fullWatchPath};
    }

    if (this.globSymlink) {
      return entry.fullPath.replace(this.globSymlink.realPath, this.globSymlink.linkPath);
    }

    return entry.fullPath;
  }

  entryPath(entry) {
    return sysPath.join(this.watchPath,
      sysPath.relative(this.watchPath, this.checkGlobSymlink(entry))
    );
  }

  filterPath(entry) {
    const {stats} = entry;
    if (stats && stats.isSymbolicLink()) return this.filterDir(entry);
    const resolvedPath = this.entryPath(entry);
    const matchesGlob = this.hasGlob && typeof this.globFilter === FUNCTION_TYPE ?
      this.globFilter(resolvedPath) : true;
    return matchesGlob &&
      this.fsw._isntIgnored(resolvedPath, stats) &&
      this.fsw._hasReadPermissions(stats);
  }

  getDirParts(path) {
    if (!this.hasGlob) return [];
    const parts = [];
    const expandedPath = path.includes(BRACE_START) ? braces.expand(path) : [path];
    expandedPath.forEach((path) => {
      parts.push(sysPath.relative(this.watchPath, path).split(SLASH_OR_BACK_SLASH_RE));
    });
    return parts;
  }

  filterDir(entry) {
    if (this.hasGlob) {
      const entryParts = this.getDirParts(this.checkGlobSymlink(entry));
      let globstar = false;
      this.unmatchedGlob = !this.dirParts.some((parts) => {
        return parts.every((part, i) => {
          if (part === GLOBSTAR) globstar = true;
          return globstar || !entryParts[0][i] || anymatch(part, entryParts[0][i], ANYMATCH_OPTS);
        });
      });
    }
    return !this.unmatchedGlob && this.fsw._isntIgnored(this.entryPath(entry), entry.stats);
  }
}

/**
 * Watches files & directories for changes. Emitted events:
 * `add`, `addDir`, `change`, `unlink`, `unlinkDir`, `all`, `error`
 *
 *     new FSWatcher()
 *       .add(directories)
 *       .on('add', path => log('File', path, 'was added'))
 */
class FSWatcher extends EventEmitter {
// Not indenting methods for history sake; for now.
constructor(_opts) {
  super();

  const opts = {};
  if (_opts) Object.assign(opts, _opts); // for frozen objects

  /** @type {Map<String, DirEntry>} */
  this._watched = new Map();
  /** @type {Map<String, Array>} */
  this._closers = new Map();
  /** @type {Set<String>} */
  this._ignoredPaths = new Set();

  /** @type {Map<ThrottleType, Map>} */
  this._throttled = new Map();

  /** @type {Map<Path, String|Boolean>} */
  this._symlinkPaths = new Map();

  this._streams = new Set();
  this.closed = false;

  // Set up default options.
  if (undef(opts, 'persistent')) opts.persistent = true;
  if (undef(opts, 'ignoreInitial')) opts.ignoreInitial = false;
  if (undef(opts, 'ignorePermissionErrors')) opts.ignorePermissionErrors = false;
  if (undef(opts, 'interval')) opts.interval = 100;
  if (undef(opts, 'binaryInterval')) opts.binaryInterval = 300;
  if (undef(opts, 'disableGlobbing')) opts.disableGlobbing = false;
  opts.enableBinaryInterval = opts.binaryInterval !== opts.interval;

  // Enable fsevents on OS X when polling isn't explicitly enabled.
  if (undef(opts, 'useFsEvents')) opts.useFsEvents = !opts.usePolling;

  // If we can't use fsevents, ensure the options reflect it's disabled.
  const canUseFsEvents = FsEventsHandler.canUse();
  if (!canUseFsEvents) opts.useFsEvents = false;

  // Use polling on Mac if not using fsevents.
  // Other platforms use non-polling fs_watch.
  if (undef(opts, 'usePolling') && !opts.useFsEvents) {
    opts.usePolling = isMacos;
  }

  // Always default to polling on IBM i because fs.watch() is not available on IBM i.
  if(isIBMi) {
    opts.usePolling = true;
  }

  // Global override (useful for end-developers that need to force polling for all
  // instances of chokidar, regardless of usage/dependency depth)
  const envPoll = process.env.CHOKIDAR_USEPOLLING;
  if (envPoll !== undefined) {
    const envLower = envPoll.toLowerCase();

    if (envLower === 'false' || envLower === '0') {
      opts.usePolling = false;
    } else if (envLower === 'true' || envLower === '1') {
      opts.usePolling = true;
    } else {
      opts.usePolling = !!envLower;
    }
  }
  const envInterval = process.env.CHOKIDAR_INTERVAL;
  if (envInterval) {
    opts.interval = Number.parseInt(envInterval, 10);
  }

  // Editor atomic write normalization enabled by default with fs.watch
  if (undef(opts, 'atomic')) opts.atomic = !opts.usePolling && !opts.useFsEvents;
  if (opts.atomic) this._pendingUnlinks = new Map();

  if (undef(opts, 'followSymlinks')) opts.followSymlinks = true;

  if (undef(opts, 'awaitWriteFinish')) opts.awaitWriteFinish = false;
  if (opts.awaitWriteFinish === true) opts.awaitWriteFinish = {};
  const awf = opts.awaitWriteFinish;
  if (awf) {
    if (!awf.stabilityThreshold) awf.stabilityThreshold = 2000;
    if (!awf.pollInterval) awf.pollInterval = 100;
    this._pendingWrites = new Map();
  }
  if (opts.ignored) opts.ignored = arrify(opts.ignored);

  let readyCalls = 0;
  this._emitReady = () => {
    readyCalls++;
    if (readyCalls >= this._readyCount) {
      this._emitReady = EMPTY_FN;
      this._readyEmitted = true;
      // use process.nextTick to allow time for listener to be bound
      process.nextTick(() => this.emit(EV_READY));
    }
  };
  this._emitRaw = (...args) => this.emit(EV_RAW, ...args);
  this._readyEmitted = false;
  this.options = opts;

  // Initialize with proper watcher.
  if (opts.useFsEvents) {
    this._fsEventsHandler = new FsEventsHandler(this);
  } else {
    this._nodeFsHandler = new NodeFsHandler(this);
  }

  // You’re frozen when your heart’s not open.
  Object.freeze(opts);
}

// Public methods

/**
 * Adds paths to be watched on an existing FSWatcher instance
 * @param {Path|Array<Path>} paths_
 * @param {String=} _origAdd private; for handling non-existent paths to be watched
 * @param {Boolean=} _internal private; indicates a non-user add
 * @returns {FSWatcher} for chaining
 */
add(paths_, _origAdd, _internal) {
  const {cwd, disableGlobbing} = this.options;
  this.closed = false;
  let paths = unifyPaths(paths_);
  if (cwd) {
    paths = paths.map((path) => {
      const absPath = getAbsolutePath(path, cwd);

      // Check `path` instead of `absPath` because the cwd portion can't be a glob
      if (disableGlobbing || !isGlob(path)) {
        return absPath;
      }
      return normalizePath(absPath);
    });
  }

  // set aside negated glob strings
  paths = paths.filter((path) => {
    if (path.startsWith(BANG)) {
      this._ignoredPaths.add(path.slice(1));
      return false;
    }

    // if a path is being added that was previously ignored, stop ignoring it
    this._ignoredPaths.delete(path);
    this._ignoredPaths.delete(path + SLASH_GLOBSTAR);

    // reset the cached userIgnored anymatch fn
    // to make ignoredPaths changes effective
    this._userIgnored = undefined;

    return true;
  });

  if (this.options.useFsEvents && this._fsEventsHandler) {
    if (!this._readyCount) this._readyCount = paths.length;
    if (this.options.persistent) this._readyCount += paths.length;
    paths.forEach((path) => this._fsEventsHandler._addToFsEvents(path));
  } else {
    if (!this._readyCount) this._readyCount = 0;
    this._readyCount += paths.length;
    Promise.all(
      paths.map(async path => {
        const res = await this._nodeFsHandler._addToNodeFs(path, !_internal, 0, 0, _origAdd);
        if (res) this._emitReady();
        return res;
      })
    ).then(results => {
      if (this.closed) return;
      results.filter(item => item).forEach(item => {
        this.add(sysPath.dirname(item), sysPath.basename(_origAdd || item));
      });
    });
  }

  return this;
}

/**
 * Close watchers or start ignoring events from specified paths.
 * @param {Path|Array<Path>} paths_ - string or array of strings, file/directory paths and/or globs
 * @returns {FSWatcher} for chaining
*/
unwatch(paths_) {
  if (this.closed) return this;
  const paths = unifyPaths(paths_);
  const {cwd} = this.options;

  paths.forEach((path) => {
    // convert to absolute path unless relative path already matches
    if (!sysPath.isAbsolute(path) && !this._closers.has(path)) {
      if (cwd) path = sysPath.join(cwd, path);
      path = sysPath.resolve(path);
    }

    this._closePath(path);

    this._ignoredPaths.add(path);
    if (this._watched.has(path)) {
      this._ignoredPaths.add(path + SLASH_GLOBSTAR);
    }

    // reset the cached userIgnored anymatch fn
    // to make ignoredPaths changes effective
    this._userIgnored = undefined;
  });

  return this;
}

/**
 * Close watchers and remove all listeners from watched paths.
 * @returns {Promise<void>}.
*/
close() {
  if (this.closed) return this._closePromise;
  this.closed = true;

  // Memory management.
  this.removeAllListeners();
  const closers = [];
  this._closers.forEach(closerList => closerList.forEach(closer => {
    const promise = closer();
    if (promise instanceof Promise) closers.push(promise);
  }));
  this._streams.forEach(stream => stream.destroy());
  this._userIgnored = undefined;
  this._readyCount = 0;
  this._readyEmitted = false;
  this._watched.forEach(dirent => dirent.dispose());
  ['closers', 'watched', 'streams', 'symlinkPaths', 'throttled'].forEach(key => {
    this[`_${key}`].clear();
  });

  this._closePromise = closers.length ? Promise.all(closers).then(() => undefined) : Promise.resolve();
  return this._closePromise;
}

/**
 * Expose list of watched paths
 * @returns {Object} for chaining
*/
getWatched() {
  const watchList = {};
  this._watched.forEach((entry, dir) => {
    const key = this.options.cwd ? sysPath.relative(this.options.cwd, dir) : dir;
    watchList[key || ONE_DOT] = entry.getChildren().sort();
  });
  return watchList;
}

emitWithAll(event, args) {
  this.emit(...args);
  if (event !== EV_ERROR) this.emit(EV_ALL, ...args);
}

// Common helpers
// --------------

/**
 * Normalize and emit events.
 * Calling _emit DOES NOT MEAN emit() would be called!
 * @param {EventName} event Type of event
 * @param {Path} path File or directory path
 * @param {*=} val1 arguments to be passed with event
 * @param {*=} val2
 * @param {*=} val3
 * @returns the error if defined, otherwise the value of the FSWatcher instance's `closed` flag
 */
async _emit(event, path, val1, val2, val3) {
  if (this.closed) return;

  const opts = this.options;
  if (isWindows) path = sysPath.normalize(path);
  if (opts.cwd) path = sysPath.relative(opts.cwd, path);
  /** @type Array<any> */
  const args = [event, path];
  if (val3 !== undefined) args.push(val1, val2, val3);
  else if (val2 !== undefined) args.push(val1, val2);
  else if (val1 !== undefined) args.push(val1);

  const awf = opts.awaitWriteFinish;
  let pw;
  if (awf && (pw = this._pendingWrites.get(path))) {
    pw.lastChange = new Date();
    return this;
  }

  if (opts.atomic) {
    if (event === EV_UNLINK) {
      this._pendingUnlinks.set(path, args);
      setTimeout(() => {
        this._pendingUnlinks.forEach((entry, path) => {
          this.emit(...entry);
          this.emit(EV_ALL, ...entry);
          this._pendingUnlinks.delete(path);
        });
      }, typeof opts.atomic === 'number' ? opts.atomic : 100);
      return this;
    }
    if (event === EV_ADD && this._pendingUnlinks.has(path)) {
      event = args[0] = EV_CHANGE;
      this._pendingUnlinks.delete(path);
    }
  }

  if (awf && (event === EV_ADD || event === EV_CHANGE) && this._readyEmitted) {
    const awfEmit = (err, stats) => {
      if (err) {
        event = args[0] = EV_ERROR;
        args[1] = err;
        this.emitWithAll(event, args);
      } else if (stats) {
        // if stats doesn't exist the file must have been deleted
        if (args.length > 2) {
          args[2] = stats;
        } else {
          args.push(stats);
        }
        this.emitWithAll(event, args);
      }
    };

    this._awaitWriteFinish(path, awf.stabilityThreshold, event, awfEmit);
    return this;
  }

  if (event === EV_CHANGE) {
    const isThrottled = !this._throttle(EV_CHANGE, path, 50);
    if (isThrottled) return this;
  }

  if (opts.alwaysStat && val1 === undefined &&
    (event === EV_ADD || event === EV_ADD_DIR || event === EV_CHANGE)
  ) {
    const fullPath = opts.cwd ? sysPath.join(opts.cwd, path) : path;
    let stats;
    try {
      stats = await stat(fullPath);
    } catch (err) {}
    // Suppress event when fs_stat fails, to avoid sending undefined 'stat'
    if (!stats || this.closed) return;
    args.push(stats);
  }
  this.emitWithAll(event, args);

  return this;
}

/**
 * Common handler for errors
 * @param {Error} error
 * @returns {Error|Boolean} The error if defined, otherwise the value of the FSWatcher instance's `closed` flag
 */
_handleError(error) {
  const code = error && error.code;
  if (error && code !== 'ENOENT' && code !== 'ENOTDIR' &&
    (!this.options.ignorePermissionErrors || (code !== 'EPERM' && code !== 'EACCES'))
  ) {
    this.emit(EV_ERROR, error);
  }
  return error || this.closed;
}

/**
 * Helper utility for throttling
 * @param {ThrottleType} actionType type being throttled
 * @param {Path} path being acted upon
 * @param {Number} timeout duration of time to suppress duplicate actions
 * @returns {Object|false} tracking object or false if action should be suppressed
 */
_throttle(actionType, path, timeout) {
  if (!this._throttled.has(actionType)) {
    this._throttled.set(actionType, new Map());
  }

  /** @type {Map<Path, Object>} */
  const action = this._throttled.get(actionType);
  /** @type {Object} */
  const actionPath = action.get(path);

  if (actionPath) {
    actionPath.count++;
    return false;
  }

  let timeoutObject;
  const clear = () => {
    const item = action.get(path);
    const count = item ? item.count : 0;
    action.delete(path);
    clearTimeout(timeoutObject);
    if (item) clearTimeout(item.timeoutObject);
    return count;
  };
  timeoutObject = setTimeout(clear, timeout);
  const thr = {timeoutObject, clear, count: 0};
  action.set(path, thr);
  return thr;
}

_incrReadyCount() {
  return this._readyCount++;
}

/**
 * Awaits write operation to finish.
 * Polls a newly created file for size variations. When files size does not change for 'threshold' milliseconds calls callback.
 * @param {Path} path being acted upon
 * @param {Number} threshold Time in milliseconds a file size must be fixed before acknowledging write OP is finished
 * @param {EventName} event
 * @param {Function} awfEmit Callback to be called when ready for event to be emitted.
 */
_awaitWriteFinish(path, threshold, event, awfEmit) {
  let timeoutHandler;

  let fullPath = path;
  if (this.options.cwd && !sysPath.isAbsolute(path)) {
    fullPath = sysPath.join(this.options.cwd, path);
  }

  const now = new Date();

  const awaitWriteFinish = (prevStat) => {
    fs.stat(fullPath, (err, curStat) => {
      if (err || !this._pendingWrites.has(path)) {
        if (err && err.code !== 'ENOENT') awfEmit(err);
        return;
      }

      const now = Number(new Date());

      if (prevStat && curStat.size !== prevStat.size) {
        this._pendingWrites.get(path).lastChange = now;
      }
      const pw = this._pendingWrites.get(path);
      const df = now - pw.lastChange;

      if (df >= threshold) {
        this._pendingWrites.delete(path);
        awfEmit(undefined, curStat);
      } else {
        timeoutHandler = setTimeout(
          awaitWriteFinish,
          this.options.awaitWriteFinish.pollInterval,
          curStat
        );
      }
    });
  };

  if (!this._pendingWrites.has(path)) {
    this._pendingWrites.set(path, {
      lastChange: now,
      cancelWait: () => {
        this._pendingWrites.delete(path);
        clearTimeout(timeoutHandler);
        return event;
      }
    });
    timeoutHandler = setTimeout(
      awaitWriteFinish,
      this.options.awaitWriteFinish.pollInterval
    );
  }
}

_getGlobIgnored() {
  return [...this._ignoredPaths.values()];
}

/**
 * Determines whether user has asked to ignore this path.
 * @param {Path} path filepath or dir
 * @param {fs.Stats=} stats result of fs.stat
 * @returns {Boolean}
 */
_isIgnored(path, stats) {
  if (this.options.atomic && DOT_RE.test(path)) return true;
  if (!this._userIgnored) {
    const {cwd} = this.options;
    const ign = this.options.ignored;

    const ignored = ign && ign.map(normalizeIgnored(cwd));
    const paths = arrify(ignored)
      .filter((path) => typeof path === STRING_TYPE && !isGlob(path))
      .map((path) => path + SLASH_GLOBSTAR);
    const list = this._getGlobIgnored().map(normalizeIgnored(cwd)).concat(ignored, paths);
    this._userIgnored = anymatch(list, undefined, ANYMATCH_OPTS);
  }

  return this._userIgnored([path, stats]);
}

_isntIgnored(path, stat) {
  return !this._isIgnored(path, stat);
}

/**
 * Provides a set of common helpers and properties relating to symlink and glob handling.
 * @param {Path} path file, directory, or glob pattern being watched
 * @param {Number=} depth at any depth > 0, this isn't a glob
 * @returns {WatchHelper} object containing helpers for this path
 */
_getWatchHelpers(path, depth) {
  const watchPath = depth || this.options.disableGlobbing || !isGlob(path) ? path : globParent(path);
  const follow = this.options.followSymlinks;

  return new WatchHelper(path, watchPath, follow, this);
}

// Directory helpers
// -----------------

/**
 * Provides directory tracking objects
 * @param {String} directory path of the directory
 * @returns {DirEntry} the directory's tracking object
 */
_getWatchedDir(directory) {
  if (!this._boundRemove) this._boundRemove = this._remove.bind(this);
  const dir = sysPath.resolve(directory);
  if (!this._watched.has(dir)) this._watched.set(dir, new DirEntry(dir, this._boundRemove));
  return this._watched.get(dir);
}

// File helpers
// ------------

/**
 * Check for read permissions.
 * Based on this answer on SO: https://stackoverflow.com/a/11781404/1358405
 * @param {fs.Stats} stats - object, result of fs_stat
 * @returns {Boolean} indicates whether the file can be read
*/
_hasReadPermissions(stats) {
  if (this.options.ignorePermissionErrors) return true;

  // stats.mode may be bigint
  const md = stats && Number.parseInt(stats.mode, 10);
  const st = md & 0o777;
  const it = Number.parseInt(st.toString(8)[0], 10);
  return Boolean(4 & it);
}

/**
 * Handles emitting unlink events for
 * files and directories, and via recursion, for
 * files and directories within directories that are unlinked
 * @param {String} directory within which the following item is located
 * @param {String} item      base path of item/directory
 * @returns {void}
*/
_remove(directory, item, isDirectory) {
  // if what is being deleted is a directory, get that directory's paths
  // for recursive deleting and cleaning of watched object
  // if it is not a directory, nestedDirectoryChildren will be empty array
  const path = sysPath.join(directory, item);
  const fullPath = sysPath.resolve(path);
  isDirectory = isDirectory != null
    ? isDirectory
    : this._watched.has(path) || this._watched.has(fullPath);

  // prevent duplicate handling in case of arriving here nearly simultaneously
  // via multiple paths (such as _handleFile and _handleDir)
  if (!this._throttle('remove', path, 100)) return;

  // if the only watched file is removed, watch for its return
  if (!isDirectory && !this.options.useFsEvents && this._watched.size === 1) {
    this.add(directory, item, true);
  }

  // This will create a new entry in the watched object in either case
  // so we got to do the directory check beforehand
  const wp = this._getWatchedDir(path);
  const nestedDirectoryChildren = wp.getChildren();

  // Recursively remove children directories / files.
  nestedDirectoryChildren.forEach(nested => this._remove(path, nested));

  // Check if item was on the watched list and remove it
  const parent = this._getWatchedDir(directory);
  const wasTracked = parent.has(item);
  parent.remove(item);

  // Fixes issue #1042 -> Relative paths were detected and added as symlinks
  // (https://github.com/paulmillr/chokidar/blob/e1753ddbc9571bdc33b4a4af172d52cb6e611c10/lib/nodefs-handler.js#L612),
  // but never removed from the map in case the path was deleted.
  // This leads to an incorrect state if the path was recreated:
  // https://github.com/paulmillr/chokidar/blob/e1753ddbc9571bdc33b4a4af172d52cb6e611c10/lib/nodefs-handler.js#L553
  if (this._symlinkPaths.has(fullPath)) {
    this._symlinkPaths.delete(fullPath);
  }

  // If we wait for this file to be fully written, cancel the wait.
  let relPath = path;
  if (this.options.cwd) relPath = sysPath.relative(this.options.cwd, path);
  if (this.options.awaitWriteFinish && this._pendingWrites.has(relPath)) {
    const event = this._pendingWrites.get(relPath).cancelWait();
    if (event === EV_ADD) return;
  }

  // The Entry will either be a directory that just got removed
  // or a bogus entry to a file, in either case we have to remove it
  this._watched.delete(path);
  this._watched.delete(fullPath);
  const eventName = isDirectory ? EV_UNLINK_DIR : EV_UNLINK;
  if (wasTracked && !this._isIgnored(path)) this._emit(eventName, path);

  // Avoid conflicts if we later create another file with the same name
  if (!this.options.useFsEvents) {
    this._closePath(path);
  }
}

/**
 * Closes all watchers for a path
 * @param {Path} path
 */
_closePath(path) {
  this._closeFile(path);
  const dir = sysPath.dirname(path);
  this._getWatchedDir(dir).remove(sysPath.basename(path));
}

/**
 * Closes only file-specific watchers
 * @param {Path} path
 */
_closeFile(path) {
  const closers = this._closers.get(path);
  if (!closers) return;
  closers.forEach(closer => closer());
  this._closers.delete(path);
}

/**
 *
 * @param {Path} path
 * @param {Function} closer
 */
_addPathCloser(path, closer) {
  if (!closer) return;
  let list = this._closers.get(path);
  if (!list) {
    list = [];
    this._closers.set(path, list);
  }
  list.push(closer);
}

_readdirp(root, opts) {
  if (this.closed) return;
  const options = {type: EV_ALL, alwaysStat: true, lstat: true, ...opts};
  let stream = readdirp(root, options);
  this._streams.add(stream);
  stream.once(STR_CLOSE, () => {
    stream = undefined;
  });
  stream.once(STR_END, () => {
    if (stream) {
      this._streams.delete(stream);
      stream = undefined;
    }
  });
  return stream;
}

}

// Export FSWatcher class
chokidar.FSWatcher = FSWatcher;

/**
 * Instantiates watcher with paths to be tracked.
 * @param {String|Array<String>} paths file/directory paths and/or globs
 * @param {Object=} options chokidar opts
 * @returns an instance of FSWatcher for chaining.
 */
const watch = (paths, options) => {
  const watcher = new FSWatcher(options);
  watcher.add(paths);
  return watcher;
};

var watch_1 = chokidar.watch = watch;

var index = /*#__PURE__*/_mergeNamespaces({
    __proto__: null,
    default: chokidar,
    watch: watch_1
}, [chokidar]);

exports.ADAPTER_MESSAGES = ADAPTER_MESSAGES;
exports.BUNDLER_COMPATIBILITY = BUNDLER_COMPATIBILITY;
exports.BUNDLER_DEFAULT_CONFIG = BUNDLER_DEFAULT_CONFIG;
exports.BUNDLER_DETECTION_COMMANDS = BUNDLER_DETECTION_COMMANDS;
exports.BUNDLER_ERROR_PATTERNS = BUNDLER_ERROR_PATTERNS;
exports.BUNDLER_INFO = BUNDLER_INFO;
exports.BUNDLER_PERFORMANCE = BUNDLER_PERFORMANCE;
exports.BUNDLER_PROS_CONS = BUNDLER_PROS_CONS;
exports.BUNDLER_SELECTION_CRITERIA = BUNDLER_SELECTION_CRITERIA;
exports.BUNDLER_USE_CASES = BUNDLER_USE_CASES;
exports.BuilderError = BuilderError;
exports.BundlerAdapterFactory = BundlerAdapterFactory;
exports.CLI_MESSAGES = CLI_MESSAGES;
exports.CONFIG_FILE_NAMES = CONFIG_FILE_NAMES;
exports.CONFIG_FILE_PRIORITY = CONFIG_FILE_PRIORITY;
exports.CONFIG_MAPPING = CONFIG_MAPPING;
exports.CONFIG_MESSAGES = CONFIG_MESSAGES;
exports.CONFIRMATION_MESSAGES = CONFIRMATION_MESSAGES;
exports.ConfigManager = ConfigManager;
exports.DEFAULT_BUILDER_CONFIG = DEFAULT_BUILDER_CONFIG;
exports.DEFAULT_BUNDLER = DEFAULT_BUNDLER;
exports.DEFAULT_CACHE_CONFIG = DEFAULT_CACHE_CONFIG;
exports.DEFAULT_EXTERNAL_DEPS = DEFAULT_EXTERNAL_DEPS;
exports.DEFAULT_FILE_PATTERNS = DEFAULT_FILE_PATTERNS;
exports.DEFAULT_GLOBALS = DEFAULT_GLOBALS;
exports.DEFAULT_PERFORMANCE_CONFIG = DEFAULT_PERFORMANCE_CONFIG;
exports.DEFAULT_WATCH_CONFIG = DEFAULT_WATCH_CONFIG;
exports.DETECTION_CACHE_CONFIG = DETECTION_CACHE_CONFIG;
exports.DETECTION_WEIGHTS = DETECTION_WEIGHTS;
exports.ENCODING_DETECTION = ENCODING_DETECTION;
exports.ENTRY_FILE_PRIORITY = ENTRY_FILE_PRIORITY;
exports.ERROR_CATEGORIES = ERROR_CATEGORIES;
exports.ERROR_MESSAGES = ERROR_MESSAGES;
exports.ERROR_SEVERITY = ERROR_SEVERITY;
exports.ERROR_SUGGESTIONS = ERROR_SUGGESTIONS;
exports.EXTENSION_TO_LOADER = EXTENSION_TO_LOADER;
exports.EXTENSION_TO_TYPE = EXTENSION_TO_TYPE;
exports.ErrorHandler = ErrorHandler;
exports.FILE_SIZE_LIMITS = FILE_SIZE_LIMITS;
exports.FORMAT_ALIASES = FORMAT_ALIASES;
exports.FORMAT_COMBINATIONS = FORMAT_COMBINATIONS;
exports.FORMAT_COMPATIBILITY = FORMAT_COMPATIBILITY;
exports.FORMAT_DESCRIPTIONS = FORMAT_DESCRIPTIONS;
exports.FORMAT_EXTENSIONS = FORMAT_EXTENSIONS;
exports.FORMAT_FILE_PATTERNS = FORMAT_FILE_PATTERNS;
exports.FORMAT_PERFORMANCE = FORMAT_PERFORMANCE;
exports.FORMAT_PRIORITY = FORMAT_PRIORITY;
exports.FORMAT_SPECIFIC_OPTIONS = FORMAT_SPECIFIC_OPTIONS;
exports.FORMAT_USE_CASES = FORMAT_USE_CASES;
exports.FORMAT_VALIDATION_RULES = FORMAT_VALIDATION_RULES;
exports.FileSystem = FileSystem;
exports.HELP_MESSAGES = HELP_MESSAGES;
exports.IGNORE_PATTERNS = IGNORE_PATTERNS;
exports.INCLUDE_PATTERNS = INCLUDE_PATTERNS;
exports.INFO_MESSAGES = INFO_MESSAGES;
exports.LIBRARY_TYPE_COMPATIBILITY = LIBRARY_TYPE_COMPATIBILITY;
exports.LIBRARY_TYPE_DESCRIPTIONS = LIBRARY_TYPE_DESCRIPTIONS;
exports.LIBRARY_TYPE_EXCLUDE_PATTERNS = LIBRARY_TYPE_EXCLUDE_PATTERNS;
exports.LIBRARY_TYPE_EXTENSIONS = LIBRARY_TYPE_EXTENSIONS;
exports.LIBRARY_TYPE_FORMATS = LIBRARY_TYPE_FORMATS;
exports.LIBRARY_TYPE_PATTERNS = LIBRARY_TYPE_PATTERNS;
exports.LIBRARY_TYPE_PLUGINS = LIBRARY_TYPE_PLUGINS;
exports.LIBRARY_TYPE_PRIORITY = LIBRARY_TYPE_PRIORITY;
exports.LIBRARY_TYPE_RECOMMENDED_CONFIG = LIBRARY_TYPE_RECOMMENDED_CONFIG;
exports.LOG_LEVEL_MESSAGES = LOG_LEVEL_MESSAGES;
exports.LibraryBuilder = LibraryBuilder;
exports.LibraryDetector = LibraryDetector;
exports.Logger = Logger;
exports.MESSAGE_TEMPLATES = MESSAGE_TEMPLATES;
exports.MIGRATION_DIFFICULTY = MIGRATION_DIFFICULTY;
exports.MIME_TYPES = MIME_TYPES;
exports.MIN_CONFIDENCE_THRESHOLD = MIN_CONFIDENCE_THRESHOLD;
exports.MixedStrategy = MixedStrategy;
exports.OUTPUT_FORMATS = OUTPUT_FORMATS;
exports.PERFORMANCE_BENCHMARKS = PERFORMANCE_BENCHMARKS;
exports.PERFORMANCE_MESSAGES = PERFORMANCE_MESSAGES;
exports.PLUGIN_MESSAGES = PLUGIN_MESSAGES;
exports.PRESET_CONFIGS = PRESET_CONFIGS;
exports.PROGRESS_MESSAGES = PROGRESS_MESSAGES;
exports.PathUtils = PathUtils;
exports.PerformanceMonitor = PerformanceMonitor;
exports.PluginManager = PluginManager;
exports.PostBuildValidator = PostBuildValidator;
exports.RolldownAdapter = RolldownAdapter;
exports.RollupAdapter = RollupAdapter;
exports.STATUS_MESSAGES = STATUS_MESSAGES;
exports.STYLE_CONFIG_FILES = STYLE_CONFIG_FILES;
exports.SUCCESS_MESSAGES = SUCCESS_MESSAGES;
exports.SUPPORTED_BUNDLERS = SUPPORTED_BUNDLERS;
exports.SUPPORTED_EXTENSIONS = SUPPORTED_EXTENSIONS;
exports.StrategyManager = StrategyManager;
exports.StyleStrategy = StyleStrategy;
exports.TIP_MESSAGES = TIP_MESSAGES;
exports.TYPESCRIPT_CONFIG_FILES = TYPESCRIPT_CONFIG_FILES;
exports.TemporaryEnvironment = TemporaryEnvironment;
exports.TestRunner = TestRunner;
exports.TypeScriptStrategy = TypeScriptStrategy;
exports.USER_MESSAGES = USER_MESSAGES;
exports.VUE_CONFIG_FILES = VUE_CONFIG_FILES;
exports.ValidationReporter = ValidationReporter;
exports.Vue2Strategy = Vue2Strategy;
exports.Vue3Strategy = Vue3Strategy;
exports.WARNING_MESSAGES = WARNING_MESSAGES;
exports.addSuffix = addSuffix;
exports.basename = basename;
exports.camelToKebab = camelToKebab;
exports.capitalize = capitalize;
exports.clean = clean;
exports.copyFile = copyFile;
exports.createBuilder = createBuilder;
exports.createErrorHandler = createErrorHandler;
exports.createLogger = createLogger;
exports.createTempDir = createTempDir;
exports.createTempFile = createTempFile;
exports.default = LibraryBuilder;
exports.defineConfig = defineConfig;
exports.dirname = dirname;
exports.emptyDir = emptyDir;
exports.ensureDir = ensureDir;
exports.ensureTrailingSlash = ensureTrailingSlash;
exports.errorHandler = errorHandler;
exports.exists = exists;
exports.existsSync = existsSync;
exports.extname = extname;
exports.filename = filename;
exports.findDirs = findDirs;
exports.findFiles = findFiles;
exports.findProjectRoot = findProjectRoot;
exports.format = format;
exports.formatBuildStatus = formatBuildStatus;
exports.formatConfig = formatConfig;
exports.formatDuration = formatDuration;
exports.formatError = formatError;
exports.formatFileSize = formatFileSize;
exports.formatKeyValue = formatKeyValue;
exports.formatList = formatList;
exports.formatMemory = formatMemory;
exports.formatNumber = formatNumber;
exports.formatPath = formatPath;
exports.formatPercentage = formatPercentage;
exports.formatProgressBar = formatProgressBar;
exports.formatRelativeTime = formatRelativeTime;
exports.formatTable = formatTable;
exports.formatTimestamp = formatTimestamp;
exports.formatVersion = formatVersion;
exports.fromFileURL = fromFileURL;
exports.getCommonParent = getCommonParent;
exports.getDepth = getDepth;
exports.getDirSize = getDirSize;
exports.getErrorCode = getErrorCode;
exports.getFileSize = getFileSize;
exports.getModifiedTime = getModifiedTime;
exports.getParents = getParents;
exports.getProjectRelativePath = getProjectRelativePath;
exports.isAbsolute = isAbsolute;
exports.isBuilderError = isBuilderError;
exports.isDirectory = isDirectory;
exports.isFile = isFile;
exports.isHidden = isHidden;
exports.isInside = isInside;
exports.isNewer = isNewer;
exports.join = join;
exports.kebabToCamel = kebabToCamel;
exports.logger = logger;
exports.matchPattern = matchPattern;
exports.normalize = normalize;
exports.parse = parse$4;
exports.readDir = readDir;
exports.readDirRecursive = readDirRecursive;
exports.readFile = readFile;
exports.relative = relative;
exports.removeDir = removeDir;
exports.removeFile = removeFile;
exports.removeTrailingSlash = removeTrailingSlash;
exports.replaceExt = replaceExt;
exports.resolve = resolve;
exports.setLogLevel = setLogLevel;
exports.setSilent = setSilent;
exports.setupGlobalErrorHandling = setupGlobalErrorHandling;
exports.stat = stat$4;
exports.toAbsolute = toAbsolute;
exports.toFileURL = toFileURL;
exports.toRelative = toRelative;
exports.truncateText = truncateText;
exports.writeFile = writeFile;
//# sourceMappingURL=index.cjs.map
