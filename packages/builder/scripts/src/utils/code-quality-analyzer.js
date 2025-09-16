"use strict";
/**
 * 代码质量分析器
 *
 * 提供深度的代码质量分析功能
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
exports.CodeQualityAnalyzer = void 0;
const fs = __importStar(require("node:fs"));
const logger_1 = require("./logger");
/**
 * 代码质量分析器
 */
class CodeQualityAnalyzer {
    constructor(logger) {
        this.logger = logger || new logger_1.Logger();
    }
    /**
     * 分析代码质量
     */
    async analyze(filePaths) {
        this.logger.info(`开始分析 ${filePaths.length} 个文件的代码质量...`);
        const issues = [];
        const metrics = {
            complexity: {
                cyclomatic: 0,
                cognitive: 0,
                halstead: {
                    vocabulary: 0,
                    length: 0,
                    difficulty: 0,
                    effort: 0
                }
            },
            maintainability: {
                index: 100,
                techDebt: 0,
                duplications: 0
            },
            reliability: {
                bugProneness: 0
            },
            security: {
                vulnerabilities: 0,
                hotspots: 0
            },
            size: {
                lines: 0,
                statements: 0,
                functions: 0,
                classes: 0,
                files: filePaths.length
            }
        };
        // 分析每个文件
        for (const filePath of filePaths) {
            if (fs.existsSync(filePath)) {
                const fileIssues = await this.analyzeFile(filePath);
                issues.push(...fileIssues);
                // 更新指标
                await this.updateMetrics(filePath, metrics);
            }
        }
        // 计算总体分数和等级
        const score = this.calculateScore(issues, metrics);
        const grade = this.calculateGrade(score);
        const recommendations = this.generateRecommendations(issues, metrics);
        this.logger.info(`代码质量分析完成，总分: ${score}/100 (${grade})`);
        return {
            issues,
            metrics,
            score,
            grade,
            recommendations
        };
    }
    /**
     * 分析单个文件
     */
    async analyzeFile(filePath) {
        const issues = [];
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        // 性能问题检查
        issues.push(...this.checkPerformanceIssues(filePath, content, lines));
        // 安全问题检查
        issues.push(...this.checkSecurityIssues(filePath, content, lines));
        // 可维护性问题检查
        issues.push(...this.checkMaintainabilityIssues(filePath, content, lines));
        // 可靠性问题检查
        issues.push(...this.checkReliabilityIssues(filePath, content, lines));
        return issues;
    }
    /**
     * 检查性能问题
     */
    checkPerformanceIssues(filePath, content, lines) {
        const issues = [];
        // 检查同步文件操作
        const syncFsPattern = /fs\.(readFileSync|writeFileSync|existsSync|statSync)/g;
        let match;
        while ((match = syncFsPattern.exec(content)) !== null) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            issues.push({
                type: 'warning',
                category: 'performance',
                file: filePath,
                line: lineNumber,
                message: `使用同步文件操作 ${match[1]}，可能阻塞事件循环`,
                rule: 'no-sync-fs',
                severity: 6,
                suggestion: `考虑使用异步版本 ${match[1].replace('Sync', '')}`
            });
        }
        // 检查大循环
        lines.forEach((line, index) => {
            if (/for\s*\([^)]*;\s*\w+\s*<\s*\d{4,}/.test(line)) {
                issues.push({
                    type: 'warning',
                    category: 'performance',
                    file: filePath,
                    line: index + 1,
                    message: '检测到大循环，可能影响性能',
                    rule: 'large-loop',
                    severity: 5,
                    suggestion: '考虑使用批处理或异步处理'
                });
            }
        });
        return issues;
    }
    /**
     * 检查安全问题
     */
    checkSecurityIssues(filePath, content, _lines) {
        const issues = [];
        const securityPatterns = [
            { pattern: /eval\s*\(/g, message: '使用 eval() 存在安全风险', severity: 9 },
            { pattern: /Function\s*\(/g, message: '使用 Function 构造函数存在安全风险', severity: 8 },
            { pattern: /innerHTML\s*=/g, message: '使用 innerHTML 可能导致 XSS', severity: 7 },
            { pattern: /document\.write/g, message: '使用 document.write 存在安全风险', severity: 6 },
            { pattern: /process\.env\.\w+/g, message: '直接访问环境变量，注意敏感信息泄露', severity: 4 }
        ];
        securityPatterns.forEach(({ pattern, message, severity }) => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const lineNumber = content.substring(0, match.index).split('\n').length;
                issues.push({
                    type: severity >= 7 ? 'error' : 'warning',
                    category: 'security',
                    file: filePath,
                    line: lineNumber,
                    message,
                    rule: 'security-check',
                    severity
                });
            }
        });
        return issues;
    }
    /**
     * 检查可维护性问题
     */
    checkMaintainabilityIssues(filePath, content, lines) {
        const issues = [];
        // 检查函数长度
        const functionMatches = content.match(/function\s+\w+[^{]*\{[^}]*\}/g) || [];
        functionMatches.forEach(func => {
            const funcLines = func.split('\n').length;
            if (funcLines > 50) {
                issues.push({
                    type: 'warning',
                    category: 'maintainability',
                    file: filePath,
                    message: `函数过长 (${funcLines} 行)，建议拆分`,
                    rule: 'max-function-length',
                    severity: 5,
                    suggestion: '将大函数拆分为多个小函数'
                });
            }
        });
        // 检查重复代码
        const duplicateThreshold = 5;
        const lineGroups = new Map();
        lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (trimmed.length > 10 && !trimmed.startsWith('//') && !trimmed.startsWith('*')) {
                if (!lineGroups.has(trimmed)) {
                    lineGroups.set(trimmed, []);
                }
                lineGroups.get(trimmed).push(index + 1);
            }
        });
        lineGroups.forEach((lineNumbers, line) => {
            if (lineNumbers.length >= duplicateThreshold) {
                issues.push({
                    type: 'info',
                    category: 'maintainability',
                    file: filePath,
                    message: `发现重复代码: "${line.substring(0, 50)}..." (${lineNumbers.length} 次)`,
                    rule: 'no-duplicate-code',
                    severity: 3,
                    suggestion: '考虑提取为函数或常量'
                });
            }
        });
        return issues;
    }
    /**
     * 检查可靠性问题
     */
    checkReliabilityIssues(filePath, content, lines) {
        const issues = [];
        // 检查未处理的 Promise
        const unhandledPromisePattern = /(?:await\s+)?(?:fetch|axios|request)\([^)]*\)(?!\s*\.catch)/g;
        let match;
        while ((match = unhandledPromisePattern.exec(content)) !== null) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            issues.push({
                type: 'warning',
                category: 'reliability',
                file: filePath,
                line: lineNumber,
                message: '异步操作缺少错误处理',
                rule: 'handle-async-errors',
                severity: 6,
                suggestion: '添加 .catch() 或 try-catch 处理错误'
            });
        }
        // 检查空的 catch 块
        lines.forEach((line, index) => {
            if (/catch\s*\([^)]*\)\s*\{\s*\}/.test(line)) {
                issues.push({
                    type: 'warning',
                    category: 'reliability',
                    file: filePath,
                    line: index + 1,
                    message: '空的 catch 块，错误被静默忽略',
                    rule: 'no-empty-catch',
                    severity: 7,
                    suggestion: '添加适当的错误处理逻辑'
                });
            }
        });
        return issues;
    }
    /**
     * 更新指标
     */
    async updateMetrics(filePath, metrics) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        // 更新大小指标
        metrics.size.lines += lines.length;
        metrics.size.statements += (content.match(/;/g) || []).length;
        metrics.size.functions += (content.match(/function\s+\w+/g) || []).length;
        metrics.size.classes += (content.match(/class\s+\w+/g) || []).length;
        // 简单的复杂度计算
        const cyclomaticComplexity = this.calculateCyclomaticComplexity(content);
        metrics.complexity.cyclomatic += cyclomaticComplexity;
    }
    /**
     * 计算圈复杂度
     */
    calculateCyclomaticComplexity(content) {
        const patterns = [
            /if\s*\(/g,
            /else\s+if\s*\(/g,
            /while\s*\(/g,
            /for\s*\(/g,
            /switch\s*\(/g,
            /case\s+/g,
            /catch\s*\(/g,
            /&&/g,
            /\|\|/g
        ];
        let complexity = 1; // 基础复杂度
        patterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
                complexity += matches.length;
            }
        });
        return complexity;
    }
    /**
     * 计算总体分数
     */
    calculateScore(issues, metrics) {
        let score = 100;
        // 根据问题严重程度扣分
        issues.forEach(issue => {
            score -= issue.severity;
        });
        // 根据复杂度扣分
        if (metrics.complexity.cyclomatic > 10) {
            score -= (metrics.complexity.cyclomatic - 10) * 2;
        }
        return Math.max(0, Math.min(100, score));
    }
    /**
     * 计算等级
     */
    calculateGrade(score) {
        if (score >= 90)
            return 'A';
        if (score >= 80)
            return 'B';
        if (score >= 70)
            return 'C';
        if (score >= 60)
            return 'D';
        if (score >= 50)
            return 'E';
        return 'F';
    }
    /**
     * 生成建议
     */
    generateRecommendations(issues, metrics) {
        const recommendations = [];
        // 基于问题类型的建议
        const issuesByCategory = issues.reduce((acc, issue) => {
            if (!acc[issue.category])
                acc[issue.category] = [];
            acc[issue.category].push(issue);
            return acc;
        }, {});
        if (issuesByCategory.performance?.length > 0) {
            recommendations.push('优化性能问题，特别是异步操作和大循环');
        }
        if (issuesByCategory.security?.length > 0) {
            recommendations.push('修复安全漏洞，避免使用危险的函数和方法');
        }
        if (issuesByCategory.maintainability?.length > 0) {
            recommendations.push('改善代码可维护性，减少重复代码和函数长度');
        }
        if (metrics.complexity.cyclomatic > 15) {
            recommendations.push('降低代码复杂度，考虑重构复杂的函数');
        }
        if (recommendations.length === 0) {
            recommendations.push('代码质量良好，继续保持！');
        }
        return recommendations;
    }
}
exports.CodeQualityAnalyzer = CodeQualityAnalyzer;
