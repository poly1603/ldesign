"use strict";
/**
 * 临时环境管理器
 *
 * 负责创建、管理和清理验证过程中的临时环境
 * 包括临时目录创建、文件复制、依赖替换等功能
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
exports.TemporaryEnvironment = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const os = __importStar(require("os"));
const crypto_1 = require("crypto");
const logger_1 = require("../utils/logger");
const error_handler_1 = require("../utils/error-handler");
const errors_1 = require("../constants/errors");
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
        this.logger = options.logger || new logger_1.Logger({ level: 'info', prefix: 'TemporaryEnvironment' });
        this.errorHandler = options.errorHandler || new error_handler_1.ErrorHandler({ logger: this.logger });
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
            throw this.errorHandler.createError(errors_1.ErrorCode.BUILD_FAILED, '创建临时环境失败', { cause: error });
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
                const sourcePath = path.join(context.outputDir, output.fileName);
                const targetPath = path.join(context.tempDir, output.fileName);
                if (await fs.pathExists(sourcePath)) {
                    await fs.ensureDir(path.dirname(targetPath));
                    await fs.copy(sourcePath, targetPath);
                    this.logger.debug(`复制文件: ${sourcePath} -> ${targetPath}`);
                }
            }
            this.logger.success('构建产物复制完成');
        }
        catch (error) {
            throw this.errorHandler.createError(errors_1.ErrorCode.BUILD_FAILED, '复制构建产物失败', { cause: error });
        }
    }
    /**
     * 清理临时环境
     */
    async cleanup(context) {
        this.logger.info('清理临时环境...');
        try {
            if (context.tempDir && this.tempDirs.has(context.tempDir)) {
                await fs.remove(context.tempDir);
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
                await fs.remove(tempDir);
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
        const tempDirName = `ldesign-builder-validation-${(0, crypto_1.randomUUID)().slice(0, 8)}`;
        // 优先使用配置中指定的临时目录
        const baseTempDir = context.config.environment?.tempDir
            ? path.resolve(context.projectRoot, context.config.environment.tempDir)
            : path.join(os.tmpdir(), 'ldesign-builder');
        const tempDir = path.join(baseTempDir, tempDirName);
        await fs.ensureDir(tempDir);
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
            const sourcePath = path.join(context.projectRoot, file);
            if (await fs.pathExists(sourcePath)) {
                const targetPath = path.join(context.tempDir, file);
                await fs.copy(sourcePath, targetPath);
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
        const glob = await Promise.resolve().then(() => __importStar(require('fast-glob')));
        for (const pattern of testPatterns) {
            const testFiles = await glob.default(pattern, {
                cwd: context.projectRoot,
                absolute: false
            });
            for (const testFile of testFiles) {
                const sourcePath = path.join(context.projectRoot, testFile);
                const targetPath = path.join(context.tempDir, testFile);
                await fs.ensureDir(path.dirname(targetPath));
                await fs.copy(sourcePath, targetPath);
                this.logger.debug(`复制测试文件: ${testFile}`);
            }
        }
    }
    /**
     * 复制源码文件
     */
    async copySourceFiles(context) {
        // 如果测试需要访问源码，复制 src 目录
        const srcDir = path.join(context.projectRoot, 'src');
        if (await fs.pathExists(srcDir)) {
            const targetSrcDir = path.join(context.tempDir, 'src');
            await fs.copy(srcDir, targetSrcDir);
            this.logger.debug('复制源码目录: src');
        }
    }
    /**
     * 更新 package.json 以使用构建产物
     */
    async updatePackageJson(context) {
        const packageJsonPath = path.join(context.tempDir, 'package.json');
        if (!(await fs.pathExists(packageJsonPath))) {
            this.logger.warn('临时环境中未找到 package.json');
            return;
        }
        try {
            const packageJson = await fs.readJson(packageJsonPath);
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
            await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
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
        return fs.pathExists(tempDir);
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
        const items = await fs.readdir(dirPath);
        for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stats = await fs.stat(itemPath);
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
exports.TemporaryEnvironment = TemporaryEnvironment;
