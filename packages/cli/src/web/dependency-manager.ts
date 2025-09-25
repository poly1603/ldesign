/**
 * 依赖管理器
 */

import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { execSync } from 'child_process';
import axios from 'axios';
import semver from 'semver';
import { CLIContext } from '../types/index';

export interface DependencyInfo {
  name: string;
  version: string;
  type: 'dependencies' | 'devDependencies' | 'peerDependencies';
  description?: string;
  homepage?: string;
  latest?: string;
  outdated?: boolean;
  vulnerabilities?: number;
  author?: string;
  license?: string;
  repository?: string;
  keywords?: string[];
  publishedAt?: string;
}

export interface PackageInfo {
  name: string;
  version: string;
  description?: string;
  homepage?: string;
  author?: any;
  license?: string;
  repository?: any;
  keywords?: string[];
  time?: any;
  versions?: any;
  'dist-tags'?: any;
}

export interface UpgradeResult {
  name: string;
  from: string;
  to: string;
  success: boolean;
  error?: string;
}

export class DependencyManager {
  private context: CLIContext;
  private npmRegistryUrl = 'https://registry.npmjs.org';

  constructor(context: CLIContext) {
    this.context = context;
  }

  /**
   * 获取项目依赖列表（包含最新版本信息）
   */
  async getDependencies(): Promise<DependencyInfo[]> {
    try {
      const packageJsonPath = resolve(this.context.cwd, 'package.json');
      if (!existsSync(packageJsonPath)) {
        return [];
      }

      const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
      const dependencies: DependencyInfo[] = [];

      // 收集所有依赖
      const depTypes = [
        { key: 'dependencies', type: 'dependencies' as const },
        { key: 'devDependencies', type: 'devDependencies' as const },
        { key: 'peerDependencies', type: 'peerDependencies' as const }
      ];

      for (const { key, type } of depTypes) {
        if (packageJson[key]) {
          for (const [name, version] of Object.entries(packageJson[key])) {
            // 包含所有依赖，包括 workspace 依赖
            dependencies.push({
              name,
              version: version as string,
              type,
              description: '',
              homepage: '',
              latest: '',
              author: '',
              license: '',
              repository: '',
              keywords: [],
              outdated: false,
              publishedAt: ''
            });
          }
        }
      }

      // 批量获取最新版本信息
      await this.enrichDependenciesWithLatestInfo(dependencies);

      return dependencies;
    } catch (error) {
      this.context.logger.error('获取依赖列表失败:', error);
      throw error;
    }
  }

  /**
   * 丰富依赖信息（添加最新版本、描述等）
   */
  private async enrichDependenciesWithLatestInfo(dependencies: DependencyInfo[]): Promise<void> {
    const batchSize = 10; // 批量处理，避免过多并发请求

    for (let i = 0; i < dependencies.length; i += batchSize) {
      const batch = dependencies.slice(i, i + batchSize);

      // 分离 workspace 依赖和普通依赖
      const workspaceDeps = batch.filter(dep => this.isWorkspaceDependency(dep.version));
      const normalDeps = batch.filter(dep => !this.isWorkspaceDependency(dep.version));

      // 处理 workspace 依赖
      for (const dep of workspaceDeps) {
        await this.enrichWorkspaceDependency(dep);
      }

      // 处理普通依赖
      if (normalDeps.length > 0) {
        const promises = normalDeps.map(dep => this.getPackageInfo(dep.name));

        try {
          const results = await Promise.allSettled(promises);

          results.forEach((result, index) => {
            const dep = normalDeps[index];
            if (result.status === 'fulfilled' && result.value) {
              const packageInfo = result.value;
              dep.description = packageInfo.description;
              dep.homepage = packageInfo.homepage;
              dep.latest = packageInfo['dist-tags']?.latest;
              dep.author = typeof packageInfo.author === 'string'
                ? packageInfo.author
                : packageInfo.author?.name;
              dep.license = packageInfo.license;
              dep.repository = typeof packageInfo.repository === 'string'
                ? packageInfo.repository
                : packageInfo.repository?.url;
              dep.keywords = packageInfo.keywords;

              // 检查是否过时
              if (dep.latest && dep.version) {
                const currentVersion = this.cleanVersion(dep.version);
                try {
                  dep.outdated = semver.lt(currentVersion, dep.latest);
                } catch (error) {
                  // 如果版本比较失败，标记为不过时
                  dep.outdated = false;
                }
              }

              // 获取发布时间
              if (packageInfo.time && dep.latest) {
                dep.publishedAt = packageInfo.time[dep.latest];
              }
            }
          });
        } catch (error) {
          this.context.logger.warn(`批量获取包信息失败:`, error);
        }
      }
    }
  }

  /**
   * 处理 workspace 依赖信息
   */
  private async enrichWorkspaceDependency(dep: DependencyInfo): Promise<void> {
    try {
      // 尝试从本地 workspace 读取包信息
      const workspacePackagePath = resolve(this.context.cwd, '..', 'packages', dep.name.replace('@ldesign/', ''), 'package.json');

      if (existsSync(workspacePackagePath)) {
        const packageContent = await readFile(workspacePackagePath, 'utf-8');
        const packageJson = JSON.parse(packageContent);

        dep.description = packageJson.description || `LDesign ${dep.name.replace('@ldesign/', '')} 包`;
        dep.homepage = packageJson.homepage || 'https://ldesign.github.io';
        dep.latest = packageJson.version || '1.0.0';
        dep.author = typeof packageJson.author === 'string'
          ? packageJson.author
          : packageJson.author?.name || 'LDesign Team';
        dep.license = packageJson.license || 'MIT';
        dep.repository = typeof packageJson.repository === 'string'
          ? packageJson.repository
          : packageJson.repository?.url || 'https://github.com/ldesign/ldesign.git';
        dep.keywords = packageJson.keywords || ['ldesign', 'workspace'];
        dep.outdated = false; // workspace 依赖不会过时
        dep.publishedAt = new Date().toISOString(); // 使用当前时间
      } else {
        // 如果找不到本地包，设置默认信息
        dep.description = `LDesign ${dep.name.replace('@ldesign/', '')} 包`;
        dep.homepage = 'https://ldesign.github.io';
        dep.latest = dep.version.replace('workspace:', '') || '1.0.0';
        dep.author = 'LDesign Team';
        dep.license = 'MIT';
        dep.repository = 'https://github.com/ldesign/ldesign.git';
        dep.keywords = ['ldesign', 'workspace'];
        dep.outdated = false;
        dep.publishedAt = new Date().toISOString();
      }
    } catch (error) {
      this.context.logger.debug(`处理 workspace 依赖失败: ${dep.name}`, error);
      // 设置默认信息
      dep.description = `LDesign ${dep.name.replace('@ldesign/', '')} 包`;
      dep.homepage = 'https://ldesign.github.io';
      dep.latest = '1.0.0';
      dep.author = 'LDesign Team';
      dep.license = 'MIT';
      dep.repository = 'https://github.com/ldesign/ldesign.git';
      dep.keywords = ['ldesign', 'workspace'];
      dep.outdated = false;
      dep.publishedAt = new Date().toISOString();
    }
  }

  /**
   * 从 npm registry 获取包信息
   */
  private async getPackageInfo(packageName: string): Promise<PackageInfo | null> {
    try {
      const response = await axios.get(`${this.npmRegistryUrl}/${packageName}`, {
        timeout: 5000,
        headers: {
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      this.context.logger.debug(`获取包信息失败: ${packageName}`, error);
      return null;
    }
  }

  /**
   * 清理版本号（移除前缀符号）
   */
  private cleanVersion(version: string): string {
    // 处理 workspace 协议
    if (version.startsWith('workspace:')) {
      return '0.0.0'; // 对于 workspace 依赖，返回默认版本
    }
    return version.replace(/^[\^~>=<]/, '');
  }

  /**
   * 检查是否为 workspace 依赖
   */
  private isWorkspaceDependency(version: string): boolean {
    return version.startsWith('workspace:');
  }

  /**
   * 添加依赖
   */
  async addDependency(name: string, version: string = 'latest', type: string = 'dependencies'): Promise<void> {
    try {
      const flag = type === 'devDependencies' ? '--save-dev' : '--save';
      const versionSpec = version === 'latest' ? name : `${name}@${version}`;

      // 检测包管理器
      const packageManager = this.detectPackageManager();

      let command: string;
      switch (packageManager) {
        case 'pnpm':
          command = `pnpm add ${flag} ${versionSpec}`;
          break;
        case 'yarn':
          command = `yarn add ${flag} ${versionSpec}`;
          break;
        default:
          command = `npm install ${flag} ${versionSpec}`;
      }

      this.context.logger.info(`执行命令: ${command}`);
      execSync(command, {
        cwd: this.context.cwd,
        stdio: 'inherit',
        encoding: 'utf-8'
      });

      this.context.logger.success(`成功添加依赖: ${name}`);
    } catch (error) {
      this.context.logger.error(`添加依赖失败: ${name}`, error);
      throw new Error(`添加依赖失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 移除依赖
   */
  async removeDependency(name: string, type?: string): Promise<void> {
    try {
      // 检查是否为 workspace 依赖（直接读取 package.json）
      const packageJsonPath = resolve(this.context.cwd, 'package.json');
      if (existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
        const allDeps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
          ...packageJson.peerDependencies
        };

        if (allDeps[name] && this.isWorkspaceDependency(allDeps[name])) {
          throw new Error(`无法移除 workspace 依赖: ${name}`);
        }
      }

      const packageManager = this.detectPackageManager();

      let command: string;
      switch (packageManager) {
        case 'pnpm':
          command = `pnpm remove ${name}`;
          break;
        case 'yarn':
          command = `yarn remove ${name}`;
          break;
        default:
          command = `npm uninstall ${name}`;
      }

      this.context.logger.info(`执行命令: ${command}`);
      execSync(command, {
        cwd: this.context.cwd,
        stdio: 'inherit',
        encoding: 'utf-8'
      });

      this.context.logger.success(`成功移除依赖: ${name}`);
    } catch (error) {
      this.context.logger.error(`移除依赖失败: ${name}`, error);
      throw new Error(`移除依赖失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 更新依赖
   */
  async updateDependency(name: string, version: string, type: string): Promise<void> {
    try {
      // 检查是否为 workspace 依赖（直接读取 package.json）
      const packageJsonPath = resolve(this.context.cwd, 'package.json');
      if (existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
        const allDeps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
          ...packageJson.peerDependencies
        };

        if (allDeps[name] && this.isWorkspaceDependency(allDeps[name])) {
          throw new Error(`无法更新 workspace 依赖: ${name}`);
        }
      }

      // 先移除再添加，确保版本正确
      await this.removeDependency(name, type);
      await this.addDependency(name, version, type);

      this.context.logger.success(`成功更新依赖: ${name} -> ${version}`);
    } catch (error) {
      this.context.logger.error(`更新依赖失败: ${name}`, error);
      throw new Error(`更新依赖失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 一键升级所有过时的依赖
   */
  async upgradeAllDependencies(): Promise<UpgradeResult[]> {
    try {
      const dependencies = await this.getDependencies();
      // 过滤掉 workspace 依赖
      const outdatedDeps = dependencies.filter(dep =>
        dep.outdated &&
        dep.latest &&
        !this.isWorkspaceDependency(dep.version)
      );

      const results: UpgradeResult[] = [];

      for (const dep of outdatedDeps) {
        try {
          await this.updateDependency(dep.name, dep.latest!, dep.type);
          results.push({
            name: dep.name,
            from: dep.version,
            to: dep.latest!,
            success: true
          });
        } catch (error) {
          results.push({
            name: dep.name,
            from: dep.version,
            to: dep.latest!,
            success: false,
            error: error instanceof Error ? error.message : '未知错误'
          });
        }
      }

      return results;
    } catch (error) {
      this.context.logger.error('一键升级失败:', error);
      throw error;
    }
  }

  /**
   * 检测项目使用的包管理器
   */
  private detectPackageManager(): 'npm' | 'yarn' | 'pnpm' {
    const projectPath = this.context.cwd;

    // 首先检查当前目录
    if (existsSync(resolve(projectPath, 'pnpm-lock.yaml'))) {
      return 'pnpm';
    }

    if (existsSync(resolve(projectPath, 'yarn.lock'))) {
      return 'yarn';
    }

    // 检查父目录（monorepo 根目录）
    const parentPath = resolve(projectPath, '..');
    if (existsSync(resolve(parentPath, 'pnpm-lock.yaml'))) {
      return 'pnpm';
    }

    if (existsSync(resolve(parentPath, 'yarn.lock'))) {
      return 'yarn';
    }

    return 'npm';
  }

  /**
   * 搜索 npm 包
   */
  async searchPackages(query: string, limit: number = 20): Promise<any[]> {
    try {
      const response = await axios.get(`https://registry.npmjs.org/-/v1/search`, {
        params: {
          text: query,
          size: limit
        },
        timeout: 5000
      });

      return response.data.objects.map((obj: any) => ({
        name: obj.package.name,
        version: obj.package.version,
        description: obj.package.description,
        author: obj.package.author?.name,
        keywords: obj.package.keywords,
        date: obj.package.date,
        score: obj.score.final
      }));
    } catch (error) {
      this.context.logger.error('搜索包失败:', error);
      return [];
    }
  }
}
