"use strict";
/**
 * 路径处理工具
 *
 * TODO: 后期可以移到 @ldesign/kit 中统一管理
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHidden = exports.getParents = exports.removeTrailingSlash = exports.ensureTrailingSlash = exports.clean = exports.getProjectRelativePath = exports.findProjectRoot = exports.fromFileURL = exports.toFileURL = exports.matchPattern = exports.getDepth = exports.getCommonParent = exports.isInside = exports.format = exports.parse = exports.addSuffix = exports.replaceExt = exports.toRelative = exports.toAbsolute = exports.isAbsolute = exports.filename = exports.extname = exports.basename = exports.dirname = exports.join = exports.relative = exports.resolve = exports.normalize = exports.PathUtils = void 0;
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
/**
 * 路径工具类
 */
class PathUtils {
    /**
     * 规范化路径（统一使用正斜杠）
     */
    static normalize(filePath) {
        return path_1.default.posix.normalize(filePath.replace(/\\/g, '/'));
    }
    /**
     * 解析绝对路径
     */
    static resolve(...paths) {
        return path_1.default.resolve(...paths);
    }
    /**
     * 获取相对路径
     */
    static relative(from, to) {
        return this.normalize(path_1.default.relative(from, to));
    }
    /**
     * 连接路径
     */
    static join(...paths) {
        return this.normalize(path_1.default.join(...paths));
    }
    /**
     * 获取目录名
     */
    static dirname(filePath) {
        return this.normalize(path_1.default.dirname(filePath));
    }
    /**
     * 获取文件名（包含扩展名）
     */
    static basename(filePath, ext) {
        return path_1.default.basename(filePath, ext);
    }
    /**
     * 获取文件扩展名
     */
    static extname(filePath) {
        return path_1.default.extname(filePath);
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
        return path_1.default.isAbsolute(filePath);
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
        const parsed = path_1.default.parse(filePath);
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
        return this.normalize(path_1.default.format(pathObject));
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
        const parts1 = abs1.split(path_1.default.sep);
        const parts2 = abs2.split(path_1.default.sep);
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
        return commonParts.join(path_1.default.sep) || path_1.default.sep;
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
        return this.normalize((0, url_1.fileURLToPath)(fileURL));
    }
    /**
     * 获取项目根目录
     */
    static findProjectRoot(startPath) {
        let currentPath = startPath || process.cwd();
        while (currentPath !== path_1.default.dirname(currentPath)) {
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
            currentPath = path_1.default.dirname(currentPath);
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
        return path_1.default.sep;
    }
    /**
     * 获取平台特定的路径定界符
     */
    static get delimiter() {
        return path_1.default.delimiter;
    }
}
exports.PathUtils = PathUtils;
// 导出便捷函数
exports.normalize = PathUtils.normalize, exports.resolve = PathUtils.resolve, exports.relative = PathUtils.relative, exports.join = PathUtils.join, exports.dirname = PathUtils.dirname, exports.basename = PathUtils.basename, exports.extname = PathUtils.extname, exports.filename = PathUtils.filename, exports.isAbsolute = PathUtils.isAbsolute, exports.toAbsolute = PathUtils.toAbsolute, exports.toRelative = PathUtils.toRelative, exports.replaceExt = PathUtils.replaceExt, exports.addSuffix = PathUtils.addSuffix, exports.parse = PathUtils.parse, exports.format = PathUtils.format, exports.isInside = PathUtils.isInside, exports.getCommonParent = PathUtils.getCommonParent, exports.getDepth = PathUtils.getDepth, exports.matchPattern = PathUtils.matchPattern, exports.toFileURL = PathUtils.toFileURL, exports.fromFileURL = PathUtils.fromFileURL, exports.findProjectRoot = PathUtils.findProjectRoot, exports.getProjectRelativePath = PathUtils.getProjectRelativePath, exports.clean = PathUtils.clean, exports.ensureTrailingSlash = PathUtils.ensureTrailingSlash, exports.removeTrailingSlash = PathUtils.removeTrailingSlash, exports.getParents = PathUtils.getParents, exports.isHidden = PathUtils.isHidden;
