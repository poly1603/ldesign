"use strict";
/**
 * 智能依赖分析器
 *
 * 提供深度依赖分析、循环依赖检测、未使用依赖识别等功能
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
exports.DependencyAnalyzer = void 0;
const fs = __importStar(require("node:fs/promises"));
const path = __importStar(require("node:path"));
const logger_1 = require("./logger");
/**
 * 智能依赖分析器
 */
class DependencyAnalyzer {
    constructor(logger) {
        this.packageJsonCache = new Map();
        this.logger = logger || new logger_1.Logger({ level: 'info' });
    }
    /**
     * 分析项目依赖
     */
    async analyze(options) {
        this.logger.info('开始分析项目依赖...');
        const packageJsonPath = path.join(options.rootDir, 'package.json');
        const packageJson = await this.loadPackageJson(packageJsonPath);
        if (!packageJson) {
            throw new Error('未找到 package.json 文件');
        }
        // 收集所有依赖信息
        const dependencies = await this.collectDependencies(packageJson, options);
        // 检测循环依赖
        const circularDependencies = await this.detectCircularDependencies(options.rootDir);
        // 检测未使用的依赖
        const unusedDependencies = await this.detectUnusedDependencies(dependencies, options.rootDir);
        // 检测重复依赖
        const duplicateDependencies = await this.detectDuplicateDependencies(options.rootDir);
        // 检测过期依赖
        const outdatedDependencies = options.checkOutdated
            ? await this.detectOutdatedDependencies(dependencies)
            : [];
        // 安全漏洞检查
        const securityIssues = options.checkSecurity
            ? await this.checkSecurityVulnerabilities(dependencies)
            : [];
        // 包大小分析
        const bundleSizeAnalysis = options.analyzeBundleSize
            ? await this.analyzeBundleSize(dependencies, options.rootDir)
            : undefined;
        // 生成摘要
        const summary = {
            total: dependencies.length,
            production: dependencies.filter(d => d.type === 'production').length,
            development: dependencies.filter(d => d.type === 'development').length,
            peer: dependencies.filter(d => d.type === 'peer').length,
            optional: dependencies.filter(d => d.type === 'optional').length
        };
        // 生成建议
        const recommendations = this.generateRecommendations({
            dependencies,
            circularDependencies,
            unusedDependencies,
            duplicateDependencies,
            outdatedDependencies,
            securityIssues,
            bundleSizeAnalysis
        });
        this.logger.info(`依赖分析完成，发现 ${dependencies.length} 个依赖`);
        return {
            dependencies,
            summary,
            circularDependencies,
            unusedDependencies,
            duplicateDependencies,
            outdatedDependencies,
            securityIssues,
            bundleSizeAnalysis,
            recommendations
        };
    }
    /**
     * 加载 package.json
     */
    async loadPackageJson(filePath) {
        if (this.packageJsonCache.has(filePath)) {
            return this.packageJsonCache.get(filePath);
        }
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const packageJson = JSON.parse(content);
            this.packageJsonCache.set(filePath, packageJson);
            return packageJson;
        }
        catch (error) {
            this.logger.warn(`无法读取 package.json: ${filePath}`);
            return null;
        }
    }
    /**
     * 收集依赖信息
     */
    async collectDependencies(packageJson, options) {
        const dependencies = [];
        const allDeps = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies,
            ...packageJson.peerDependencies,
            ...packageJson.optionalDependencies
        };
        for (const [name, version] of Object.entries(allDeps)) {
            if (this.shouldIgnoreDependency(name, options.ignorePatterns)) {
                continue;
            }
            const depInfo = await this.analyzeDependency(name, version, packageJson, options.rootDir);
            if (depInfo) {
                dependencies.push(depInfo);
            }
        }
        return dependencies;
    }
    /**
     * 分析单个依赖
     */
    async analyzeDependency(name, version, rootPackageJson, rootDir) {
        try {
            const nodeModulesPath = path.join(rootDir, 'node_modules', name);
            const depPackageJsonPath = path.join(nodeModulesPath, 'package.json');
            const depPackageJson = await this.loadPackageJson(depPackageJsonPath);
            if (!depPackageJson) {
                return null;
            }
            // 确定依赖类型
            const type = this.getDependencyType(name, rootPackageJson);
            // 计算使用次数和导入路径
            const { usageCount, importPaths } = await this.analyzeUsage(name, rootDir);
            return {
                name,
                version,
                type,
                size: await this.calculatePackageSize(nodeModulesPath),
                license: depPackageJson.license,
                description: depPackageJson.description,
                homepage: depPackageJson.homepage,
                repository: typeof depPackageJson.repository === 'string'
                    ? depPackageJson.repository
                    : depPackageJson.repository?.url,
                usageCount,
                importPaths
            };
        }
        catch (error) {
            this.logger.warn(`分析依赖 ${name} 时出错:`, error);
            return null;
        }
    }
    /**
     * 获取依赖类型
     */
    getDependencyType(name, packageJson) {
        if (packageJson.dependencies?.[name])
            return 'production';
        if (packageJson.devDependencies?.[name])
            return 'development';
        if (packageJson.peerDependencies?.[name])
            return 'peer';
        if (packageJson.optionalDependencies?.[name])
            return 'optional';
        if (packageJson.bundledDependencies?.includes(name))
            return 'bundled';
        return 'production';
    }
    /**
     * 分析依赖使用情况
     */
    async analyzeUsage(_dependencyName, _rootDir) {
        // 这里实现代码扫描逻辑，查找 import/require 语句
        // 简化实现，实际应该扫描所有源文件
        return {
            usageCount: 1,
            importPaths: []
        };
    }
    /**
     * 计算包大小
     */
    async calculatePackageSize(packagePath) {
        try {
            const stats = await fs.stat(packagePath);
            if (stats.isDirectory()) {
                // 递归计算目录大小
                let totalSize = 0;
                const files = await fs.readdir(packagePath);
                for (const file of files) {
                    const filePath = path.join(packagePath, file);
                    const fileStats = await fs.stat(filePath);
                    if (fileStats.isDirectory()) {
                        totalSize += await this.calculatePackageSize(filePath);
                    }
                    else {
                        totalSize += fileStats.size;
                    }
                }
                return totalSize;
            }
            else {
                return stats.size;
            }
        }
        catch {
            return 0;
        }
    }
    /**
     * 检测循环依赖
     */
    async detectCircularDependencies(_rootDir) {
        // 实现循环依赖检测逻辑
        // 这里返回空数组作为占位符
        return [];
    }
    /**
     * 检测未使用的依赖
     */
    async detectUnusedDependencies(dependencies, _rootDir) {
        return dependencies
            .filter(dep => dep.usageCount === 0 && dep.type === 'production')
            .map(dep => dep.name);
    }
    /**
     * 检测重复依赖
     */
    async detectDuplicateDependencies(_rootDir) {
        // 实现重复依赖检测逻辑
        return [];
    }
    /**
     * 检测过期依赖
     */
    async detectOutdatedDependencies(_dependencies) {
        // 实现过期依赖检测逻辑
        return [];
    }
    /**
     * 检查安全漏洞
     */
    async checkSecurityVulnerabilities(_dependencies) {
        // 实现安全漏洞检查逻辑
        return [];
    }
    /**
     * 分析包大小
     */
    async analyzeBundleSize(dependencies, _rootDir) {
        const totalSize = dependencies.reduce((sum, dep) => sum + (dep.size || 0), 0);
        const largestDependencies = dependencies
            .filter(dep => dep.size)
            .sort((a, b) => (b.size || 0) - (a.size || 0))
            .slice(0, 10)
            .map(dep => ({
            name: dep.name,
            size: dep.size || 0,
            percentage: ((dep.size || 0) / totalSize) * 100
        }));
        return {
            totalSize,
            largestDependencies,
            treeShakeable: [],
            nonTreeShakeable: []
        };
    }
    /**
     * 生成建议
     */
    generateRecommendations(analysisResult) {
        const recommendations = [];
        if (analysisResult.unusedDependencies?.length) {
            recommendations.push(`发现 ${analysisResult.unusedDependencies.length} 个未使用的依赖，建议移除以减小包大小`);
        }
        if (analysisResult.circularDependencies?.length) {
            recommendations.push(`发现 ${analysisResult.circularDependencies.length} 个循环依赖，建议重构代码结构`);
        }
        if (analysisResult.securityIssues?.length) {
            const criticalCount = analysisResult.securityIssues.filter(issue => issue.severity === 'critical').length;
            if (criticalCount > 0) {
                recommendations.push(`发现 ${criticalCount} 个严重安全漏洞，建议立即更新相关依赖`);
            }
        }
        if (analysisResult.outdatedDependencies?.length) {
            recommendations.push(`发现 ${analysisResult.outdatedDependencies.length} 个过期依赖，建议更新到最新版本`);
        }
        return recommendations;
    }
    /**
     * 检查是否应该忽略依赖
     */
    shouldIgnoreDependency(name, ignorePatterns) {
        if (!ignorePatterns)
            return false;
        return ignorePatterns.some(pattern => {
            if (pattern.includes('*')) {
                const regex = new RegExp(pattern.replace(/\*/g, '.*'));
                return regex.test(name);
            }
            return name === pattern;
        });
    }
}
exports.DependencyAnalyzer = DependencyAnalyzer;
