"use strict";
/**
 * Banner 生成器
 *
 * 为打包产物生成标识 banner
 *
 * @author LDesign Team
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannerGenerator = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class BannerGenerator {
    /**
     * 生成 banner 字符串
     */
    static generate(options) {
        const style = options.style ?? 'default';
        switch (style) {
            case 'compact':
                return this.generateCompactBanner(options);
            case 'detailed':
                return this.generateDetailedBanner(options);
            default:
                return this.generateDefaultBanner(options);
        }
    }
    /**
     * 生成默认样式的 banner
     */
    static generateDefaultBanner(options) {
        const { bundler, bundlerVersion, projectName, projectVersion, buildTime = new Date(), buildMode = 'production', minified = false } = options;
        const lines = [
            `Built with ${bundler}${bundlerVersion ? ` v${bundlerVersion}` : ''}`,
            `Build time: ${buildTime.toISOString()}`,
            `Build mode: ${buildMode}`,
            `Minified: ${minified ? 'Yes' : 'No'}`
        ];
        if (projectName) {
            lines.unshift(`${projectName}${projectVersion ? ` v${projectVersion}` : ''}`);
        }
        const maxLength = Math.max(...lines.map(line => line.length));
        const border = '*'.repeat(maxLength + 4);
        return [
            `/*!`,
            ` * ${border}`,
            ...lines.map(line => ` * ${line.padEnd(maxLength)} *`),
            ` * ${border}`,
            ` */`
        ].join('\n');
    }
    /**
     * 生成紧凑样式的 banner
     */
    static generateCompactBanner(options) {
        const { bundler, bundlerVersion, projectName, projectVersion, buildTime = new Date() } = options;
        const parts = [];
        if (projectName) {
            parts.push(`${projectName}${projectVersion ? ` v${projectVersion}` : ''}`);
        }
        parts.push(`Built with ${bundler}${bundlerVersion ? ` v${bundlerVersion}` : ''}`);
        parts.push(buildTime.toISOString().split('T')[0]);
        return `/*! ${parts.join(' | ')} */`;
    }
    /**
     * 生成详细样式的 banner
     */
    static generateDetailedBanner(options) {
        const { bundler, bundlerVersion, projectName, projectVersion, projectDescription, projectAuthor, projectLicense, buildTime = new Date(), buildMode = 'production', minified = false, customInfo = {} } = options;
        const lines = [];
        // 项目信息
        if (projectName) {
            lines.push(`Project: ${projectName}${projectVersion ? ` v${projectVersion}` : ''}`);
        }
        if (projectDescription) {
            lines.push(`Description: ${projectDescription}`);
        }
        if (projectAuthor) {
            lines.push(`Author: ${projectAuthor}`);
        }
        if (projectLicense) {
            lines.push(`License: ${projectLicense}`);
        }
        if (lines.length > 0) {
            lines.push('');
        }
        // 构建信息
        lines.push(`Built with: ${bundler}${bundlerVersion ? ` v${bundlerVersion}` : ''}`);
        lines.push(`Build time: ${buildTime.toISOString()}`);
        lines.push(`Build mode: ${buildMode}`);
        lines.push(`Minified: ${minified ? 'Yes' : 'No'}`);
        // 自定义信息
        if (Object.keys(customInfo).length > 0) {
            lines.push('');
            Object.entries(customInfo).forEach(([key, value]) => {
                lines.push(`${key}: ${value}`);
            });
        }
        const maxLength = Math.max(...lines.map(line => line.length));
        const border = '='.repeat(maxLength + 4);
        return [
            `/*!`,
            ` * ${border}`,
            ...lines.map(line => line ? ` * ${line.padEnd(maxLength)} *` : ` * ${' '.repeat(maxLength)} *`),
            ` * ${border}`,
            ` */`
        ].join('\n');
    }
    /**
     * 从 package.json 获取项目信息
     */
    static async getProjectInfo(packageJsonPath) {
        try {
            const pkgPath = packageJsonPath || path_1.default.resolve(process.cwd(), 'package.json');
            const packageJson = JSON.parse(await fs_1.default.promises.readFile(pkgPath, 'utf-8'));
            return {
                projectName: packageJson.name,
                projectVersion: packageJson.version,
                projectDescription: packageJson.description,
                projectAuthor: typeof packageJson.author === 'string'
                    ? packageJson.author
                    : packageJson.author?.name,
                projectLicense: packageJson.license
            };
        }
        catch (error) {
            return {};
        }
    }
    /**
     * 获取打包工具版本
     */
    static async getBundlerVersion(bundler) {
        try {
            const packagePath = path_1.default.resolve(process.cwd(), 'node_modules', bundler, 'package.json');
            const packageJson = JSON.parse(await fs_1.default.promises.readFile(packagePath, 'utf-8'));
            return packageJson.version;
        }
        catch (error) {
            return undefined;
        }
    }
    /**
     * 创建 Rollup banner 函数
     */
    static createRollupBanner(options = {}) {
        return async () => {
            const projectInfo = await this.getProjectInfo();
            const bundlerVersion = await this.getBundlerVersion('rollup');
            const bannerOptions = {
                bundler: 'Rollup',
                bundlerVersion,
                buildTime: new Date(),
                ...projectInfo,
                ...options
            };
            return this.generate(bannerOptions);
        };
    }
    /**
     * 创建 Rolldown banner 函数
     */
    static createRolldownBanner(options = {}) {
        return async () => {
            const projectInfo = await this.getProjectInfo();
            const bundlerVersion = await this.getBundlerVersion('rolldown');
            const bannerOptions = {
                bundler: 'Rolldown',
                bundlerVersion,
                buildTime: new Date(),
                ...projectInfo,
                ...options
            };
            return this.generate(bannerOptions);
        };
    }
    /**
     * 创建通用 banner 函数
     */
    static createBanner(bundler, options = {}) {
        return async () => {
            const projectInfo = await this.getProjectInfo();
            const bundlerVersion = await this.getBundlerVersion(bundler);
            const bannerOptions = {
                bundler: bundler.charAt(0).toUpperCase() + bundler.slice(1),
                bundlerVersion,
                buildTime: new Date(),
                ...projectInfo,
                ...options
            };
            return this.generate(bannerOptions);
        };
    }
}
exports.BannerGenerator = BannerGenerator;
