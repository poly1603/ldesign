"use strict";
/**
 * 配置文件加载器
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configLoader = exports.ConfigLoader = void 0;
exports.findConfigFile = findConfigFile;
exports.loadConfigFile = loadConfigFile;
exports.defineConfig = defineConfig;
exports.defineAsyncConfig = defineAsyncConfig;
const path_1 = __importDefault(require("path"));
const jiti_1 = __importDefault(require("jiti"));
const defaults_1 = require("../../constants/defaults");
const file_system_1 = require("../file-system");
const errors_1 = require("../../constants/errors");
const error_handler_1 = require("../error-handler");
/**
 * 配置文件加载器类
 */
class ConfigLoader {
    /**
     * 查找配置文件
     */
    async findConfigFile(startDir = process.cwd()) {
        for (const fileName of defaults_1.CONFIG_FILE_NAMES) {
            const configPath = path_1.default.resolve(startDir, fileName);
            if (await (0, file_system_1.exists)(configPath)) {
                return configPath;
            }
        }
        return null;
    }
    /**
     * 获取配置文件信息
     */
    async getConfigFileInfo(configPath) {
        const fileExists = await (0, file_system_1.exists)(configPath);
        const ext = path_1.default.extname(configPath);
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
                const stats = await Promise.resolve().then(() => __importStar(require('fs'))).then(fs => fs.promises.stat(configPath));
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
            throw new error_handler_1.BuilderError(errors_1.ErrorCode.CONFIG_NOT_FOUND, `配置文件不存在: ${configPath}`);
        }
        try {
            switch (info.type) {
                case 'ts':
                case 'js':
                    return this.loadJSConfig(configPath);
                case 'json':
                    return this.loadJSONConfig(configPath);
                default:
                    throw new error_handler_1.BuilderError(errors_1.ErrorCode.CONFIG_PARSE_ERROR, `不支持的配置文件格式: ${info.type}`);
            }
        }
        catch (error) {
            if (error instanceof error_handler_1.BuilderError) {
                throw error;
            }
            throw new error_handler_1.BuilderError(errors_1.ErrorCode.CONFIG_PARSE_ERROR, `加载配置文件失败: ${configPath}`, { cause: error });
        }
    }
    /**
     * 加载 JavaScript/TypeScript 配置
     */
    async loadJSConfig(configPath) {
        try {
            // 使用 jiti 动态导入，支持 TypeScript
            const jiti = (0, jiti_1.default)(import.meta.url, {
                interopDefault: true,
                esmResolve: true,
                cache: false // 禁用缓存以支持配置热重载
            });
            const configModule = await jiti(configPath);
            // 处理不同的导出格式
            let config;
            if (typeof configModule === 'function') {
                // 函数式配置
                const env = Object.fromEntries(Object.entries(process.env || {}).map(([k, v]) => [k, v ?? '']));
                config = await configModule({
                    mode: process.env.NODE_ENV || 'production',
                    bundler: process.env.BUILDER_BUNDLER || 'rollup',
                    env
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
            throw new error_handler_1.BuilderError(errors_1.ErrorCode.CONFIG_PARSE_ERROR, `解析 JavaScript/TypeScript 配置文件失败: ${configPath}`, {
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
            const content = await (0, file_system_1.readFile)(configPath, 'utf-8');
            // 特殊处理 package.json
            if (path_1.default.basename(configPath) === 'package.json') {
                const pkg = JSON.parse(content);
                return pkg.builder || {};
            }
            return JSON.parse(content);
        }
        catch (error) {
            throw new error_handler_1.BuilderError(errors_1.ErrorCode.CONFIG_PARSE_ERROR, `解析 JSON 配置文件失败: ${configPath}`, {
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
                if (error instanceof error_handler_1.BuilderError && error.code === errors_1.ErrorCode.CONFIG_NOT_FOUND) {
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
        const chokidar = await Promise.resolve().then(() => __importStar(require('chokidar')));
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
        return defaults_1.CONFIG_FILE_NAMES.map(name => path_1.default.resolve(baseDir, name));
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
        const fileName = path_1.default.basename(configPath);
        const index = defaults_1.CONFIG_FILE_NAMES.indexOf(fileName);
        return index >= 0 ? index : defaults_1.CONFIG_FILE_NAMES.length;
    }
    /**
     * 选择最高优先级的配置文件
     */
    async selectBestConfigFile(baseDir = process.cwd()) {
        const allPaths = this.getAllConfigPaths(baseDir);
        const existingPaths = [];
        for (const configPath of allPaths) {
            if (await (0, file_system_1.exists)(configPath)) {
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
exports.ConfigLoader = ConfigLoader;
/**
 * 默认配置加载器实例
 */
exports.configLoader = new ConfigLoader();
/**
 * 便捷函数：查找配置文件
 */
function findConfigFile(startDir) {
    return exports.configLoader.findConfigFile(startDir);
}
/**
 * 便捷函数：加载配置文件
 */
function loadConfigFile(configPath) {
    return exports.configLoader.loadConfigFile(configPath);
}
/**
 * 便捷函数：定义配置
 *
 * @param config - 构建配置对象或返回配置的函数
 * @returns 配置对象或函数
 *
 * @example
 * // 对象配置
 * export default defineConfig({
 *   input: 'src/index.ts',
 *   output: {
 *     esm: true,
 *     cjs: true,
 *     umd: { name: 'MyLib' }
 *   }
 * })
 *
 * @example
 * // 函数配置
 * export default defineConfig((context) => ({
 *   input: 'src/index.ts',
 *   minify: context.mode === 'production'
 * }))
 */
function defineConfig(config) {
    return config;
}
/**
 * 便捷函数：定义异步配置
 * 用于异步计算配置（例如读取远程/本地元数据后生成配置）
 */
function defineAsyncConfig(config) {
    return config;
}
