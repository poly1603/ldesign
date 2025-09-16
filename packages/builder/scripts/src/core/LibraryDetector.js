"use strict";
/**
 * 库类型检测器
 *
 * 负责自动检测项目的库类型
 *
 * @author LDesign Team
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LibraryDetector = void 0;
const path_1 = __importDefault(require("path"));
const library_1 = require("../types/library");
const library_types_1 = require("../constants/library-types");
const file_system_1 = require("../utils/file-system");
const logger_1 = require("../utils/logger");
const error_handler_1 = require("../utils/error-handler");
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
        this.logger = options.logger || new logger_1.Logger();
        this.errorHandler = new error_handler_1.ErrorHandler({ logger: this.logger });
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
                svelte: 0,
                solid: 0,
                preact: 0,
                lit: 0,
                angular: 0,
                mixed: 0
            };
            const evidence = {
                typescript: [],
                style: [],
                vue2: [],
                vue3: [],
                react: [],
                svelte: [],
                solid: [],
                preact: [],
                lit: [],
                angular: [],
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
            // 如果检测到 .vue 文件，优先判定为 Vue 项目（根据依赖决定 2/3 版本），以确保无需额外配置也能正确处理 SFC
            try {
                const vueFiles = await (0, file_system_1.findFiles)(['src/**/*.vue', 'lib/**/*.vue', 'components/**/*.vue'], {
                    cwd: projectPath,
                    ignore: ['node_modules/**', 'dist/**', '**/*.test.*', '**/*.spec.*']
                });
                if (vueFiles.length > 0) {
                    // 解析 package.json 以判断 Vue 主版本
                    let vueMajor = 3;
                    try {
                        const pkgPath = path_1.default.join(projectPath, 'package.json');
                        if (await (0, file_system_1.exists)(pkgPath)) {
                            const pkg = JSON.parse(await (0, file_system_1.readFile)(pkgPath, 'utf-8'));
                            const allDeps = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies };
                            const vueVer = allDeps?.vue;
                            if (typeof vueVer === 'string') {
                                // 粗略解析主版本：匹配 ^3, ~3, 3., >=3 等
                                if (/(^|[^\d])2(\D|$)/.test(vueVer))
                                    vueMajor = 2;
                                else if (/(^|[^\d])3(\D|$)/.test(vueVer))
                                    vueMajor = 3;
                            }
                        }
                    }
                    catch { }
                    const forcedType = vueMajor === 2 ? library_1.LibraryType.VUE2 : library_1.LibraryType.VUE3;
                    const forcedEvidence = [
                        ...evidence[forcedType],
                        {
                            type: 'file',
                            description: `检测到 ${vueFiles.length} 个 .vue 文件，优先判定为 ${forcedType}`,
                            weight: 1,
                            source: vueFiles.slice(0, 3).join(', ')
                        }
                    ];
                    const result = {
                        type: forcedType,
                        confidence: 1,
                        evidence: forcedEvidence
                    };
                    this.logger.success(`检测完成: ${forcedType} (置信度: 100.0%)`);
                    return result;
                }
            }
            catch (e) {
                this.logger.debug('Vue 文件快速检测失败，回退到评分机制:', e);
            }
            // 计算最终分数（常规路径）
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
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`项目类型检测失败: ${errorMessage}`);
            this.errorHandler.handle(error instanceof Error ? error : new Error(errorMessage), 'detect');
            // 返回默认结果，但记录错误信息
            return {
                type: library_1.LibraryType.TYPESCRIPT,
                confidence: 0.1, // 降低置信度以反映检测失败
                evidence: [{
                        type: 'error',
                        description: `检测过程中发生错误: ${errorMessage}`,
                        weight: 0.1
                    }]
            };
        }
    }
    /**
     * 检测文件模式
     */
    async detectFilePatterns(projectPath, scores, evidence) {
        for (const [type, pattern] of Object.entries(library_types_1.LIBRARY_TYPE_PATTERNS)) {
            const libraryType = type;
            try {
                const files = await (0, file_system_1.findFiles)([...pattern.files], {
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
            const packageJsonPath = path_1.default.join(projectPath, 'package.json');
            if (await (0, file_system_1.exists)(packageJsonPath)) {
                const packageContent = await (0, file_system_1.readFile)(packageJsonPath, 'utf-8');
                const packageJson = JSON.parse(packageContent);
                const allDeps = {
                    ...packageJson.dependencies,
                    ...packageJson.devDependencies,
                    ...packageJson.peerDependencies
                };
                for (const [type, pattern] of Object.entries(library_types_1.LIBRARY_TYPE_PATTERNS)) {
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
        for (const [type, pattern] of Object.entries(library_types_1.LIBRARY_TYPE_PATTERNS)) {
            const libraryType = type;
            const foundConfigs = [];
            for (const configFile of pattern.configs) {
                const configPath = path_1.default.join(projectPath, configFile);
                if (await (0, file_system_1.exists)(configPath)) {
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
            const packageJsonPath = path_1.default.join(projectPath, 'package.json');
            if (await (0, file_system_1.exists)(packageJsonPath)) {
                const packageContent = await (0, file_system_1.readFile)(packageJsonPath, 'utf-8');
                const packageJson = JSON.parse(packageContent);
                for (const [type, pattern] of Object.entries(library_types_1.LIBRARY_TYPE_PATTERNS)) {
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
        for (const [type, priority] of Object.entries(library_types_1.LIBRARY_TYPE_PRIORITY)) {
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
        let bestType = library_1.LibraryType.TYPESCRIPT;
        let bestScore = 0;
        for (const [type, score] of Object.entries(scores)) {
            if (score > bestScore) {
                bestScore = score;
                bestType = type;
            }
        }
        // 如果最高分数低于阈值，返回默认类型
        if (bestScore < this.options.confidence) {
            return library_1.LibraryType.MIXED;
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
exports.LibraryDetector = LibraryDetector;
