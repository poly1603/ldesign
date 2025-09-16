"use strict";
/**
 * 文件系统操作工具
 *
 * TODO: 后期可以移到 @ldesign/kit 中统一管理
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findFiles = exports.createTempDir = exports.createTempFile = exports.isNewer = exports.getModifiedTime = exports.isDirectory = exports.isFile = exports.getDirSize = exports.getFileSize = exports.findDirs = exports.readDirRecursive = exports.readDir = exports.stat = exports.emptyDir = exports.removeDir = exports.ensureDir = exports.removeFile = exports.copyFile = exports.writeFile = exports.readFile = exports.existsSync = exports.exists = exports.FileSystem = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const fast_glob_1 = __importDefault(require("fast-glob"));
/**
 * 文件系统工具类
 */
class FileSystem {
    /**
     * 检查文件或目录是否存在
     */
    static async exists(filePath) {
        try {
            await fs_1.promises.access(filePath);
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
            // 使用显式导入而不是 require
            const { accessSync } = require('fs');
            accessSync(filePath);
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
        return fs_1.promises.readFile(filePath, encoding);
    }
    /**
     * 写入文件内容
     */
    static async writeFile(filePath, content, encoding = 'utf8') {
        // 确保目录存在
        await this.ensureDir(path_1.default.dirname(filePath));
        return fs_1.promises.writeFile(filePath, content, encoding);
    }
    /**
     * 复制文件
     */
    static async copyFile(src, dest) {
        // 确保目标目录存在
        await this.ensureDir(path_1.default.dirname(dest));
        return fs_1.promises.copyFile(src, dest);
    }
    /**
     * 删除文件
     */
    static async removeFile(filePath) {
        if (await this.exists(filePath)) {
            return fs_1.promises.unlink(filePath);
        }
    }
    /**
     * 创建目录
     */
    static async ensureDir(dirPath) {
        try {
            await fs_1.promises.mkdir(dirPath, { recursive: true });
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
            return fs_1.promises.rmdir(dirPath, { recursive: true });
        }
    }
    /**
     * 清空目录
     */
    static async emptyDir(dirPath) {
        if (await this.exists(dirPath)) {
            const files = await fs_1.promises.readdir(dirPath);
            await Promise.all(files.map(async (file) => {
                const filePath = path_1.default.join(dirPath, file);
                const stat = await fs_1.promises.stat(filePath);
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
        const stats = await fs_1.promises.stat(filePath);
        const ext = path_1.default.extname(filePath);
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
        return fs_1.promises.readdir(dirPath);
    }
    /**
     * 递归读取目录内容
     */
    static async readDirRecursive(dirPath) {
        const files = [];
        const traverse = async (currentPath) => {
            const items = await fs_1.promises.readdir(currentPath);
            for (const item of items) {
                const itemPath = path_1.default.join(currentPath, item);
                const stat = await fs_1.promises.stat(itemPath);
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
        return (0, fast_glob_1.default)(pattern, {
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
        const stats = await fs_1.promises.stat(filePath);
        return stats.size;
    }
    /**
     * 获取目录大小
     */
    static async getDirSize(dirPath) {
        let totalSize = 0;
        const traverse = async (currentPath) => {
            const items = await fs_1.promises.readdir(currentPath);
            for (const item of items) {
                const itemPath = path_1.default.join(currentPath, item);
                const stat = await fs_1.promises.stat(itemPath);
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
            const stats = await fs_1.promises.stat(filePath);
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
            const stats = await fs_1.promises.stat(dirPath);
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
        const stats = await fs_1.promises.stat(filePath);
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
        return path_1.default.join(tempDir, fileName);
    }
    /**
     * 创建临时目录
     */
    static async createTempDir(prefix = 'temp') {
        const tempDir = require('os').tmpdir();
        const dirName = `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const tempDirPath = path_1.default.join(tempDir, dirName);
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
exports.FileSystem = FileSystem;
// 导出便捷函数
exports.exists = FileSystem.exists, exports.existsSync = FileSystem.existsSync, exports.readFile = FileSystem.readFile, exports.writeFile = FileSystem.writeFile, exports.copyFile = FileSystem.copyFile, exports.removeFile = FileSystem.removeFile, exports.ensureDir = FileSystem.ensureDir, exports.removeDir = FileSystem.removeDir, exports.emptyDir = FileSystem.emptyDir, exports.stat = FileSystem.stat, exports.readDir = FileSystem.readDir, exports.readDirRecursive = FileSystem.readDirRecursive, exports.findDirs = FileSystem.findDirs, exports.getFileSize = FileSystem.getFileSize, exports.getDirSize = FileSystem.getDirSize, exports.isFile = FileSystem.isFile, exports.isDirectory = FileSystem.isDirectory, exports.getModifiedTime = FileSystem.getModifiedTime, exports.isNewer = FileSystem.isNewer, exports.createTempFile = FileSystem.createTempFile, exports.createTempDir = FileSystem.createTempDir;
// 单独导出 findFiles 以保持正确的 this 上下文
exports.findFiles = FileSystem.findFiles.bind(FileSystem);
