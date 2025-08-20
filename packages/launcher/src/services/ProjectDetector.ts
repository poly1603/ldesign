import { promises as fs } from 'fs';
import path from 'path';
import type { 
  IProjectDetector, 
  ProjectType, 
  FrameworkType, 
  DetectionResult, 
  DetectionReport, 
  DetectionStep,
  CSSPreprocessor 
} from '@/types';
import { ErrorHandler } from './ErrorHandler';

/**
 * 项目类型检测器实现类
 * 通过分析项目文件和依赖来自动识别项目框架类型
 */
export class ProjectDetector implements IProjectDetector {
  private errorHandler: ErrorHandler;

  constructor() {
    this.errorHandler = new ErrorHandler();
  }

  /**
   * 检测项目类型
   * @param projectRoot 项目根目录路径
   * @returns 检测结果
   */
  async detectProjectType(projectRoot: string): Promise<DetectionResult> {
    const report: DetectionReport = {
      detectedFiles: [],
      detectedDependencies: [],
      dependencies: {},
      devDependencies: {},
      confidence: 0,
      steps: [],
      duration: 0
    };

    try {
      // 步骤1: 验证项目根目录
      await this.validateProjectRoot(projectRoot, report);
      
      // 步骤2: 读取package.json
      await this.readPackageJson(projectRoot, report);
      
      // 步骤3: 检测框架特征文件
      await this.detectFrameworkFiles(projectRoot, report);
      
      // 步骤4: 分析依赖
      this.analyzeDependencies(report);
      
      // 步骤5: 确定项目类型
      const projectType = this.determineProjectType(report);
      
      return {
        projectType: projectType,
        framework: this.extractFramework(projectType),
        confidence: report.confidence,
        report
      };
    } catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error, 
        'project type detection'
      );
      
      return {
        projectType: 'unknown',
        framework: 'vanilla',
        confidence: 0,
        report,
        error: launcherError
      };
    }
  }

  /**
   * 验证项目根目录
   * @param projectRoot 项目根目录路径
   * @param report 检测报告
   */
  private async validateProjectRoot(projectRoot: string, report: DetectionReport): Promise<void> {
    const step: DetectionStep = {
      name: 'validate_project_root',
      description: '验证项目根目录',
      result: 'failed',
      message: '',
      duration: 0,
      success: false
    };

    try {
      const stats = await fs.stat(projectRoot);
      if (!stats.isDirectory()) {
        throw new Error(`路径不是有效的目录: ${projectRoot}`);
      }
      
      step.success = true;
      step.result = 'success';
      step.message = '项目根目录验证成功';
    } catch (error) {
      step.error = (error as Error).message;
      throw error;
    } finally {
      report.steps.push(step);
    }
  }

  /**
   * 读取package.json文件
   * @param projectRoot 项目根目录路径
   * @param report 检测报告
   * @returns package.json内容
   */
  private async readPackageJson(projectRoot: string, report: DetectionReport): Promise<any> {
    const step: DetectionStep = {
      name: 'read_package_json',
      description: '读取package.json文件',
      result: 'failed',
      message: '',
      duration: 0,
      success: false
    };

    try {
      const packageJsonPath = path.join(projectRoot, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);
      
      report.detectedFiles.push('package.json');
      report.dependencies = packageJson.dependencies || {};
      report.devDependencies = packageJson.devDependencies || {};
      
      step.success = true;
      step.result = 'success';
      step.message = `发现 ${Object.keys(report.dependencies).length} 个依赖，${Object.keys(report.devDependencies).length} 个开发依赖`;
      
      return packageJson;
    } catch (error) {
      step.error = (error as Error).message;
      throw new Error(`无法读取package.json: ${(error as Error).message}`);
    } finally {
      report.steps.push(step);
    }
  }

  /**
   * 检测框架特征文件
   * @param projectRoot 项目根目录路径
   * @param report 检测报告
   */
  private async detectFrameworkFiles(projectRoot: string, report: DetectionReport): Promise<void> {
    const step: DetectionStep = {
      name: 'detect_framework_files',
      description: '检测框架特征文件',
      result: 'failed',
      message: '',
      duration: 0,
      success: false
    };

    try {
      const filesToCheck = [
        // Vue 特征文件
        'vue.config.js',
        'vue.config.ts',
        'nuxt.config.js',
        'nuxt.config.ts',
        // React 特征文件
        'next.config.js',
        'next.config.ts',
        'gatsby-config.js',
        'gatsby-config.ts',
        // Vite 配置文件
        'vite.config.js',
        'vite.config.ts',
        'vite.config.mjs',
        // 其他配置文件
        'webpack.config.js',
        'rollup.config.js',
        'tsconfig.json',
        'jsconfig.json'
      ];

      const detectedFiles: string[] = [];
      
      for (const file of filesToCheck) {
        try {
          const filePath = path.join(projectRoot, file);
          await fs.access(filePath);
          detectedFiles.push(file);
        } catch {
          // 文件不存在，继续检查下一个
        }
      }
      
      report.detectedFiles.push(...detectedFiles);
      step.success = true;
      step.result = 'success';
      step.message = `检测到 ${detectedFiles.length} 个特征文件: ${detectedFiles.join(', ')}`;
    } catch (error) {
      step.error = (error as Error).message;
    } finally {
      report.steps.push(step);
    }
  }

  /**
   * 分析依赖
   * @param report 检测报告
   */
  private analyzeDependencies(report: DetectionReport): void {
    const step: DetectionStep = {
      name: 'analyze_dependencies',
      description: '分析项目依赖',
      result: 'failed',
      message: '',
      duration: 0,
      success: false
    };

    try {
      const allDeps = { ...report.dependencies, ...report.devDependencies };
      const frameworks: string[] = [];
      
      // Vue 检测
      if (allDeps.vue) {
        const vueVersion = this.extractVersion(allDeps.vue);
        if (vueVersion && vueVersion.startsWith('2.')) {
          frameworks.push('Vue 2');
        } else {
          frameworks.push('Vue 3');
        }
      }
      
      // React 检测
      if (allDeps.react) {
        frameworks.push('React');
      }
      
      // Lit 检测
      if (allDeps.lit) {
        frameworks.push('Lit');
      }
      
      // Svelte 检测
      if (allDeps.svelte) {
        frameworks.push('Svelte');
      }
      
      // Angular 检测
      if (allDeps['@angular/core']) {
        frameworks.push('Angular');
      }
      
      step.success = true;
      step.result = 'success';
      step.message = frameworks.length > 0 
        ? `检测到框架: ${frameworks.join(', ')}`
        : '未检测到明确的框架依赖';
    } catch (error) {
      step.error = (error as Error).message;
    } finally {
      report.steps.push(step);
    }
  }

  /**
   * 确定项目类型
   * @param report 检测报告
   * @returns 项目类型
   */
  private determineProjectType(report: DetectionReport): ProjectType {
    const allDeps = { ...report.dependencies, ...report.devDependencies };
    const detectedFiles = report.detectedFiles;
    let confidence = 0;

    // Vue 项目检测
    if (allDeps.vue) {
      const vueVersion = this.extractVersion(allDeps.vue);
      confidence += 80;
      
      if (vueVersion && vueVersion.startsWith('2.')) {
        confidence += 10;
        report.confidence = Math.min(confidence, 100);
        return 'vue2';
      } else {
        confidence += 10;
        report.confidence = Math.min(confidence, 100);
        return 'vue3';
      }
    }
    
    // React 项目检测
    if (allDeps.react) {
      confidence += 80;
      
      if (allDeps['next'] || detectedFiles.includes('next.config.js') || detectedFiles.includes('next.config.ts')) {
        confidence += 10;
        report.confidence = Math.min(confidence, 100);
        return 'react-next';
      } else {
        confidence += 10;
        report.confidence = Math.min(confidence, 100);
        return 'react';
      }
    }
    
    // Lit 项目检测
    if (allDeps.lit) {
      confidence += 90;
      report.confidence = Math.min(confidence, 100);
      return 'lit';
    }
    
    // Svelte 项目检测
    if (allDeps.svelte) {
      confidence += 90;
      report.confidence = Math.min(confidence, 100);
      return 'svelte';
    }
    
    // Angular 项目检测
    if (allDeps['@angular/core']) {
      confidence += 90;
      report.confidence = Math.min(confidence, 100);
      return 'angular';
    }
    
    // TypeScript 项目检测
    if (allDeps.typescript || detectedFiles.includes('tsconfig.json')) {
      confidence += 30;
      report.confidence = Math.min(confidence, 100);
      return 'vanilla-ts';
    }
    
    // 默认为 vanilla JavaScript
    confidence += 20;
    report.confidence = Math.min(confidence, 100);
    return 'vanilla';
  }

  /**
   * 从项目类型提取框架类型
   * @param projectType 项目类型
   * @returns 框架类型
   */
  private extractFramework(projectType: ProjectType): FrameworkType {
    switch (projectType) {
      case 'vue2':
        return 'vue2';
      case 'vue3':
        return 'vue3';
      case 'react':
      case 'react-next':
        return 'react';
      case 'lit':
        return 'lit';
      case 'svelte':
      case 'angular':
      case 'vanilla':
      case 'vanilla-ts':
      default:
        return 'vanilla';
    }
  }

  /**
   * 提取版本号
   * @param versionString 版本字符串
   * @returns 清理后的版本号
   */
  private extractVersion(versionString: string): string | null {
    if (!versionString) return null;
    
    // 移除版本前缀符号 (^, ~, >=, 等)
    const cleanVersion = versionString.replace(/^[^\d]*/, '');
    const match = cleanVersion.match(/^(\d+\.\d+\.\d+)/);
    
    return match ? match[1] : null;
  }

  /**
   * 检查是否为 Vite 项目
   * @param projectRoot 项目根目录路径
   * @returns 是否为 Vite 项目
   */
  async isViteProject(projectRoot: string): Promise<boolean> {
    try {
      // 检查 vite.config.* 文件
      const viteConfigFiles = [
        'vite.config.js',
        'vite.config.ts',
        'vite.config.mjs'
      ];
      
      for (const configFile of viteConfigFiles) {
        try {
          const configPath = path.join(projectRoot, configFile);
          await fs.access(configPath);
          return true;
        } catch {
          // 继续检查下一个文件
        }
      }
      
      // 检查 package.json 中的 vite 依赖
      try {
        const packageJsonPath = path.join(projectRoot, 'package.json');
        const content = await fs.readFile(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(content);
        
        const allDeps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies
        };
        
        return !!(allDeps.vite || allDeps['@vitejs/plugin-vue'] || allDeps['@vitejs/plugin-react']);
      } catch {
        return false;
      }
    } catch {
      return false;
    }
  }

  /**
   * 获取推荐的 Vite 插件
   * @param projectType 项目类型
   * @returns 推荐的插件列表
   */
  getRecommendedPlugins(projectType: ProjectType): string[] {
    switch (projectType) {
      case 'vue2':
        return ['@vitejs/plugin-vue2'];
      case 'vue3':
        return ['@vitejs/plugin-vue'];
      case 'react':
      case 'react-next':
        return ['@vitejs/plugin-react'];
      case 'lit':
        return ['@vitejs/plugin-lit'];
      case 'svelte':
        return ['@sveltejs/vite-plugin-svelte'];
      case 'vanilla-ts':
        return ['@vitejs/plugin-typescript'];
      default:
        return [];
    }
  }

  // IProjectDetector 接口方法实现
  async detect(root: string): Promise<DetectionResult> {
    return this.detectProjectType(root);
  }

  async detectFramework(root: string): Promise<FrameworkType> {
    const result = await this.detectProjectType(root);
    return result.framework;
  }

  async detectTypeScript(root: string): Promise<boolean> {
    try {
      const packageJsonPath = path.join(root, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);
      
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };
      
      // 检查 TypeScript 依赖或 tsconfig.json 文件
      if (allDeps.typescript) return true;
      
      try {
        const tsconfigPath = path.join(root, 'tsconfig.json');
        await fs.access(tsconfigPath);
        return true;
      } catch {
        return false;
      }
    } catch {
      return false;
    }
  }

  async detectCSSPreprocessor(root: string): Promise<CSSPreprocessor | undefined> {
    try {
      const packageJsonPath = path.join(root, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);
      
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };
      
      if (allDeps.sass || allDeps.scss) return 'sass';
      if (allDeps.less) return 'less';
      if (allDeps.stylus) return 'stylus';
      
      return undefined;
    } catch {
      return undefined;
    }
  }
}

/**
 * 默认项目检测器实例
 */
export const projectDetector = new ProjectDetector();