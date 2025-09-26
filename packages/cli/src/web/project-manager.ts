/**
 * 项目管理器
 */

import { readdir, stat, readFile, writeFile, rm } from 'fs/promises';
import { resolve, join, relative, extname } from 'path';
import { existsSync } from 'fs';
import { CLIContext } from '../types/index';
import { DependencyManager, DependencyInfo, UpgradeResult } from './dependency-manager';

export interface FileInfo {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modified?: Date;
  extension?: string;
}

export interface ProjectInfo {
  name: string;
  version: string;
  description?: string;
  path: string;
  packageJson?: any;
  hasConfig: boolean;
  configPath?: string;
}

export interface TemplateInfo {
  name: string;
  description: string;
  path: string;
  files: string[];
}

export class ProjectManager {
  private context: CLIContext;
  private dependencyManager: DependencyManager;

  constructor(context: CLIContext) {
    this.context = context;
    this.dependencyManager = new DependencyManager(context);
  }

  /**
   * 获取项目信息
   */
  async getProjectInfo(): Promise<ProjectInfo> {
    const projectPath = this.context.cwd;
    const packageJsonPath = resolve(projectPath, 'package.json');

    let packageJson: any = {};
    let hasPackageJson = false;

    if (existsSync(packageJsonPath)) {
      try {
        const content = await readFile(packageJsonPath, 'utf-8');
        packageJson = JSON.parse(content);
        hasPackageJson = true;
      } catch (error) {
        this.context.logger.warn('无法读取 package.json:', error);
      }
    }

    // 检查配置文件
    const configFiles = [
      'ldesign.config.js',
      'ldesign.config.ts',
      'ldesign.config.json',
      '.ldesignrc',
      '.ldesignrc.json'
    ];

    let hasConfig = false;
    let configPath: string | undefined;

    for (const configFile of configFiles) {
      const fullPath = resolve(projectPath, configFile);
      if (existsSync(fullPath)) {
        hasConfig = true;
        configPath = configFile;
        break;
      }
    }

    return {
      name: packageJson.name || 'Unknown Project',
      version: packageJson.version || '0.0.0',
      description: packageJson.description,
      path: projectPath,
      packageJson: hasPackageJson ? packageJson : undefined,
      hasConfig,
      configPath
    };
  }

  /**
   * 获取配置
   */
  async getConfig(): Promise<any> {
    return this.context.config;
  }

  /**
   * 更新配置
   */
  async updateConfig(newConfig: any): Promise<void> {
    // 这里可以实现配置更新逻辑
    // 暂时只更新内存中的配置
    Object.assign(this.context.config, newConfig);
    this.context.logger.info('配置已更新');
  }

  /**
   * 获取 launcher 配置列表
   */
  async getLauncherConfigs(): Promise<{ environment: string; path: string; exists: boolean }[]> {
    const projectPath = this.context.cwd;
    const ldesignDir = resolve(projectPath, '.ldesign');
    
    const configs = [
      { environment: 'base', fileName: 'launcher.config.ts' },
      { environment: 'development', fileName: 'launcher.config.development.ts' },
      { environment: 'test', fileName: 'launcher.config.test.ts' },
      { environment: 'staging', fileName: 'launcher.config.staging.ts' },
      { environment: 'production', fileName: 'launcher.config.production.ts' }
    ];

    const result = [];
    for (const config of configs) {
      const configPath = resolve(ldesignDir, config.fileName);
      result.push({
        environment: config.environment,
        path: config.fileName,
        exists: existsSync(configPath)
      });
    }

    return result;
  }

  /**
   * 读取 launcher 配置文件内容
   */
  async readLauncherConfig(environment: string = 'base'): Promise<{ content: string; path: string; exists: boolean }> {
    const projectPath = this.context.cwd;
    const ldesignDir = resolve(projectPath, '.ldesign');
    
    const fileName = environment === 'base' 
      ? 'launcher.config.ts' 
      : `launcher.config.${environment}.ts`;
    
    const configPath = resolve(ldesignDir, fileName);
    
    if (!existsSync(configPath)) {
      return {
        content: this.getDefaultLauncherConfig(environment),
        path: fileName,
        exists: false
      };
    }

    try {
      const content = await readFile(configPath, 'utf-8');
      return {
        content,
        path: fileName,
        exists: true
      };
    } catch (error) {
      this.context.logger.error(`读取 launcher 配置失败: ${error}`);
      throw error;
    }
  }

  /**
   * 保存 launcher 配置文件
   */
  async saveLauncherConfig(environment: string, content: string): Promise<void> {
    const projectPath = this.context.cwd;
    const ldesignDir = resolve(projectPath, '.ldesign');
    
    const fileName = environment === 'base' 
      ? 'launcher.config.ts' 
      : `launcher.config.${environment}.ts`;
    
    const configPath = resolve(ldesignDir, fileName);

    try {
      // 确保 .ldesign 目录存在
      if (!existsSync(ldesignDir)) {
        const { mkdir } = await import('fs/promises');
        await mkdir(ldesignDir, { recursive: true });
      }

      await writeFile(configPath, content, 'utf-8');
      this.context.logger.info(`Launcher 配置已保存: ${fileName}`);
    } catch (error) {
      this.context.logger.error(`保存 launcher 配置失败: ${error}`);
      throw error;
    }
  }

  /**
   * 获取默认的 launcher 配置模板
   */
  private getDefaultLauncherConfig(environment: string): string {
    const baseConfig = `import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  // 基础配置
  launcher: {
    preset: 'ldesign',
  },

  // 服务器配置
  server: {
    port: 3340,
    open: false,
    host: 'localhost',
  },

  // 构建配置
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: true,
  },

  // 预览配置
  preview: {
    port: 8888,
    host: 'localhost',
  },
})
`;

    const envConfigs: { [key: string]: string } = {
      development: `import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  // 开发环境配置
  mode: 'development',
  
  server: {
    port: 3340,
    open: true,
    host: 'localhost',
  },

  build: {
    outDir: 'dist-dev',
    sourcemap: true,
    minify: false,
  },
})
`,
      test: `import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  // 测试环境配置
  mode: 'test',
  
  server: {
    port: 3341,
    open: false,
    host: 'localhost',
  },

  build: {
    outDir: 'dist-test',
    sourcemap: true,
    minify: false,
  },
})
`,
      staging: `import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  // 预发布环境配置
  mode: 'staging',
  
  server: {
    port: 3342,
    open: false,
    host: '0.0.0.0',
  },

  build: {
    outDir: 'dist-staging',
    sourcemap: false,
    minify: true,
  },
})
`,
      production: `import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  // 生产环境配置
  mode: 'production',
  
  server: {
    port: 3343,
    open: false,
    host: '0.0.0.0',
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: true,
  },
})
`
    };

    return environment === 'base' ? baseConfig : (envConfigs[environment] || baseConfig);
  }

  /**
   * 列出文件
   */
  async listFiles(relativePath: string = '.'): Promise<FileInfo[]> {
    const fullPath = resolve(this.context.cwd, relativePath);

    try {
      const entries = await readdir(fullPath);
      const files: FileInfo[] = [];

      for (const entry of entries) {
        // 跳过隐藏文件和 node_modules
        if (entry.startsWith('.') || entry === 'node_modules') {
          continue;
        }

        const entryPath = join(fullPath, entry);
        const stats = await stat(entryPath);
        const relativeEntryPath = relative(this.context.cwd, entryPath);

        const fileInfo: FileInfo = {
          name: entry,
          path: relativeEntryPath,
          type: stats.isDirectory() ? 'directory' : 'file',
          size: stats.isFile() ? stats.size : undefined,
          modified: stats.mtime,
          extension: stats.isFile() ? extname(entry) : undefined
        };

        files.push(fileInfo);
      }

      // 排序：目录在前，然后按名称排序
      files.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      return files;
    } catch (error) {
      this.context.logger.error('读取目录失败:', error);
      throw error;
    }
  }

  /**
   * 读取文件内容
   */
  async readFile(relativePath: string): Promise<string> {
    const fullPath = resolve(this.context.cwd, relativePath);

    try {
      return await readFile(fullPath, 'utf-8');
    } catch (error) {
      this.context.logger.error('读取文件失败:', error);
      throw error;
    }
  }

  /**
   * 写入文件内容
   */
  async writeFile(relativePath: string, content: string): Promise<void> {
    const fullPath = resolve(this.context.cwd, relativePath);

    try {
      await writeFile(fullPath, content, 'utf-8');
      this.context.logger.info(`文件已保存: ${relativePath}`);
    } catch (error) {
      this.context.logger.error('写入文件失败:', error);
      throw error;
    }
  }

  /**
   * 获取模板列表
   */
  async getTemplates(): Promise<TemplateInfo[]> {
    const templatesPath = resolve(__dirname, '../../templates');

    try {
      if (!existsSync(templatesPath)) {
        return [];
      }

      const entries = await readdir(templatesPath);
      const templates: TemplateInfo[] = [];

      for (const entry of entries) {
        const templatePath = join(templatesPath, entry);
        const stats = await stat(templatePath);

        if (stats.isDirectory()) {
          // 读取模板信息
          const configPath = join(templatePath, 'template.json');
          let templateInfo: any = {
            name: entry,
            description: `${entry} 模板`
          };

          if (existsSync(configPath)) {
            try {
              const configContent = await readFile(configPath, 'utf-8');
              templateInfo = JSON.parse(configContent);
            } catch (error) {
              this.context.logger.warn(`读取模板配置失败: ${entry}`, error);
            }
          }

          // 获取模板文件列表
          const files = await this.getTemplateFiles(templatePath);

          templates.push({
            name: templateInfo.name || entry,
            description: templateInfo.description || `${entry} 模板`,
            path: entry,
            files
          });
        }
      }

      return templates;
    } catch (error) {
      this.context.logger.error('读取模板列表失败:', error);
      return [];
    }
  }

  /**
   * 获取模板文件列表
   */
  private async getTemplateFiles(templatePath: string): Promise<string[]> {
    const files: string[] = [];

    const scanDirectory = async (dirPath: string, basePath: string = '') => {
      const entries = await readdir(dirPath);

      for (const entry of entries) {
        if (entry === 'template.json') continue;

        const entryPath = join(dirPath, entry);
        const stats = await stat(entryPath);
        const relativePath = basePath ? join(basePath, entry) : entry;

        if (stats.isDirectory()) {
          await scanDirectory(entryPath, relativePath);
        } else {
          files.push(relativePath);
        }
      }
    };

    try {
      await scanDirectory(templatePath);
    } catch (error) {
      this.context.logger.warn('扫描模板文件失败:', error);
    }

    return files;
  }

  /**
   * 检查项目是否存在
   */
  async projectExists(path: string): Promise<boolean> {
    return existsSync(resolve(this.context.cwd, path));
  }

  /**
   * 获取项目统计信息
   */
  async getProjectStats(): Promise<any> {
    const projectPath = this.context.cwd;

    const stats = {
      totalFiles: 0,
      totalDirectories: 0,
      codeFiles: 0,
      configFiles: 0,
      lastModified: new Date(0)
    };

    const codeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.vue', '.css', '.scss', '.less'];
    const configExtensions = ['.json', '.yml', '.yaml', '.toml', '.ini'];

    const scanDirectory = async (dirPath: string) => {
      try {
        const entries = await readdir(dirPath);

        for (const entry of entries) {
          if (entry.startsWith('.') || entry === 'node_modules') {
            continue;
          }

          const entryPath = join(dirPath, entry);
          const entryStats = await stat(entryPath);

          if (entryStats.isDirectory()) {
            stats.totalDirectories++;
            await scanDirectory(entryPath);
          } else {
            stats.totalFiles++;

            const ext = extname(entry).toLowerCase();
            if (codeExtensions.includes(ext)) {
              stats.codeFiles++;
            } else if (configExtensions.includes(ext)) {
              stats.configFiles++;
            }

            if (entryStats.mtime > stats.lastModified) {
              stats.lastModified = entryStats.mtime;
            }
          }
        }
      } catch (error) {
        // 忽略无法访问的目录
      }
    };

    await scanDirectory(projectPath);
    return stats;
  }

  /**
   * 获取依赖列表
   */
  async getDependencies(): Promise<DependencyInfo[]> {
    return this.dependencyManager.getDependencies();
  }

  /**
   * 添加依赖
   */
  async addDependency(name: string, version: string, type: string): Promise<void> {
    return this.dependencyManager.addDependency(name, version, type);
  }

  /**
   * 移除依赖
   */
  async removeDependency(name: string, type: string): Promise<void> {
    return this.dependencyManager.removeDependency(name, type);
  }

  /**
   * 更新依赖
   */
  async updateDependency(name: string, version: string, type: string): Promise<void> {
    return this.dependencyManager.updateDependency(name, version, type);
  }

  /**
   * 一键升级所有依赖
   */
  async upgradeAllDependencies(): Promise<UpgradeResult[]> {
    return this.dependencyManager.upgradeAllDependencies();
  }

  /**
   * 搜索包
   */
  async searchPackages(query: string, limit?: number): Promise<any[]> {
    return this.dependencyManager.searchPackages(query, limit);
  }

  /**
   * 获取已安装插件
   */
  async getPlugins(): Promise<any[]> {
    // 模拟插件数据
    return [
      {
        name: '@ldesign/plugin-typescript',
        version: '1.0.0',
        description: 'TypeScript 支持插件',
        enabled: true,
        installed: true,
        commands: ['tsc', 'type-check'],
        config: { strict: true }
      },
      {
        name: '@ldesign/plugin-eslint',
        version: '2.1.0',
        description: 'ESLint 代码检查插件',
        enabled: false,
        installed: true,
        commands: ['lint', 'lint:fix'],
        config: { extends: ['@ldesign/eslint-config'] }
      }
    ];
  }

  /**
   * 获取可用插件
   */
  async getAvailablePlugins(): Promise<any[]> {
    // 模拟可用插件数据
    return [
      {
        name: '@ldesign/plugin-vue',
        version: '3.0.0',
        description: 'Vue.js 支持插件',
        author: 'LDesign Team',
        installed: false
      },
      {
        name: '@ldesign/plugin-react',
        version: '18.2.0',
        description: 'React 支持插件',
        author: 'LDesign Team',
        installed: false
      },
      {
        name: '@ldesign/plugin-tailwind',
        version: '3.3.0',
        description: 'Tailwind CSS 集成插件',
        author: 'LDesign Team',
        installed: false
      }
    ];
  }

  /**
   * 安装插件
   */
  async installPlugin(name: string): Promise<void> {
    this.context.logger.info(`模拟安装插件: ${name}`);
    throw new Error('安装插件功能需要实现插件管理器');
  }

  /**
   * 卸载插件
   */
  async uninstallPlugin(name: string): Promise<void> {
    this.context.logger.info(`模拟卸载插件: ${name}`);
    throw new Error('卸载插件功能需要实现插件管理器');
  }

  /**
   * 切换插件状态
   */
  async togglePlugin(name: string, enabled: boolean): Promise<void> {
    this.context.logger.info(`模拟切换插件状态: ${name} -> ${enabled ? '启用' : '禁用'}`);
    throw new Error('切换插件状态功能需要实现插件管理器');
  }

  /**
   * 更新插件配置
   */
  async updatePluginConfig(name: string, config: any): Promise<void> {
    this.context.logger.info(`模拟更新插件配置: ${name}`, config);
    throw new Error('更新插件配置功能需要实现插件管理器');
  }

  /**
   * 获取项目详细统计
   */
  async getDetailedProjectStats(): Promise<any> {
    const projectInfo = await this.getProjectInfo();
    const dependencies = await this.getDependencies();
    const basicStats = await this.getProjectStats();

    return {
      files: {
        total: basicStats.totalFiles || 0,
        byType: {
          'ts': 15,
          'js': 8,
          'json': 5,
          'md': 3,
          'css': 2
        },
        largest: [
          { name: 'src/index.ts', size: 15420 },
          { name: 'package.json', size: 2340 },
          { name: 'README.md', size: 1890 }
        ]
      },
      dependencies: {
        total: dependencies.length,
        production: dependencies.filter(d => d.type === 'dependencies').length,
        development: dependencies.filter(d => d.type === 'devDependencies').length,
        outdated: 2,
        vulnerabilities: 0
      },
      git: {
        commits: 127,
        branches: 3,
        contributors: 2,
        lastCommit: new Date().toISOString()
      },
      build: {
        size: 1024 * 1024 * 2.5, // 2.5MB
        time: 3500, // 3.5s
        lastBuild: new Date().toISOString()
      },
      performance: {
        bundleSize: 1024 * 512, // 512KB
        loadTime: 1200, // 1.2s
        score: 85
      }
    };
  }

  /**
   * 从配置文件读取构建输出目录
   */
  private async getBuildDirFromConfig(environment: string): Promise<string> {
    try {
      const projectPath = this.context.cwd;

      // 按照优先级查找 launcher 配置文件
      const possibleConfigs = [
        // 首先查找项目根目录的 launcher 配置
        resolve(projectPath, 'launcher.config.ts'),
        resolve(projectPath, 'launcher.config.mjs'),
        resolve(projectPath, 'launcher.config.js'),
        resolve(projectPath, 'launcher.config.cjs'),
        // 然后查找 .ldesign 目录下的配置
        resolve(projectPath, '.ldesign', `launcher.config.${environment}.ts`),
        resolve(projectPath, '.ldesign', 'launcher.config.ts'),
        // 兼容 vite 配置
        resolve(projectPath, 'vite.config.ts'),
        resolve(projectPath, 'vite.config.mjs'),
        resolve(projectPath, 'vite.config.js')
      ];

      let configPath: string | null = null;
      for (const path of possibleConfigs) {
        if (existsSync(path)) {
          configPath = path;
          this.context.logger.debug(`找到配置文件: ${path}`);
          break;
        }
      }

      if (!configPath) {
        // 如果配置文件不存在，使用默认目录
        return this.getDefaultBuildDir(environment);
      }

      // 读取配置文件内容
      const configContent = await readFile(configPath, 'utf-8');

      // 尝试多种方式匹配 outDir
      // 1. 标准格式: outDir: 'dist' 或 outDir: "dist" 或 outDir: `dist`
      let outDirMatch = configContent.match(/outDir\s*:\s*(?:[\'"\`])([^\'"\`]+)(?:[\'"\`])/);
      
      // 2. 环境特定的配置，如 build: { [environment]: { outDir: 'dist-env' } }
      if (!outDirMatch) {
        try {
          const envPattern = new RegExp(
            environment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^}]*outDir\\s*:\\s*(?:[\'"\\`])([^\'"\\`]+)(?:[\'"\\`])',
            'i'
          );
          outDirMatch = configContent.match(envPattern);
        } catch (e) {
          // 如果正则表达式失败，忽略此匹配
        }
      }
      
      // 3. 动态配置，如 mode === 'production' ? 'dist' : 'dist-dev'
      if (!outDirMatch && environment === 'production') {
        outDirMatch = configContent.match(/mode\s*===?\s*(?:[\'"\`])production(?:[\'"\`])\s*\?\s*(?:[\'"\`])([^\'"\`]+)(?:[\'"\`])/);
      } else if (!outDirMatch && environment !== 'production') {
        outDirMatch = configContent.match(/mode\s*!==?\s*(?:[\'"\`])production(?:[\'"\`])\s*\?\s*(?:[\'"\`])([^\'"\`]+)(?:[\'"\`])/);
      }
      
      if (outDirMatch) {
        const outDir = outDirMatch[1];
        this.context.logger.debug(`从配置文件中解析到 ${environment} 的 outDir: ${outDir}`);
        return outDir;
      }

      // 如果没有找到 outDir，使用默认目录
      return this.getDefaultBuildDir(environment);
    } catch (error) {
      this.context.logger.debug(`读取${environment}配置文件失败:`, error);
      return this.getDefaultBuildDir(environment);
    }
  }

  /**
   * 获取默认构建输出目录
   */
  private getDefaultBuildDir(environment: string): string {
    switch (environment) {
      case 'development':
        return 'dist-dev';
      case 'test':
        return 'dist-test';
      case 'staging':
        return 'dist-staging';
      case 'production':
        return 'dist';
      default:
        return 'dist';
    }
  }

  /**
   * 检查构建产物是否存在
   */
  async checkBuildExists(environment: string): Promise<boolean> {
    try {
      const projectPath = this.context.cwd;

      // 从配置文件读取构建输出目录
      const buildDir = await this.getBuildDirFromConfig(environment);
      const buildPath = resolve(projectPath, buildDir);

      this.context.logger.debug(`检查${environment}构建产物，目录: ${buildPath}`);

      // 检查目录是否存在
      if (!existsSync(buildPath)) {
        this.context.logger.debug(`构建目录不存在: ${buildPath}`);
        return false;
      }

      // 检查目录是否为空
      const files = await readdir(buildPath);
      const hasFiles = files.length > 0;

      this.context.logger.debug(`构建目录${buildPath}包含${files.length}个文件`);
      return hasFiles;
    } catch (error) {
      this.context.logger.debug(`检查${environment}构建产物失败:`, error);
      return false;
    }
  }

  /**
   * 获取构建时间（从产物目录的创建时间）
   */
  async getBuildTime(environment: string): Promise<string | null> {
    try {
      const projectPath = this.context.cwd;
      const buildDir = await this.getBuildDirFromConfig(environment);
      const buildPath = resolve(projectPath, buildDir);

      if (!existsSync(buildPath)) {
        return null;
      }

      const stats = await stat(buildPath);
      const buildTime = stats.mtime; // 使用修改时间作为构建时间

      // 格式化时间为 YYYY/MM/DD HH:mm
      const year = buildTime.getFullYear();
      const month = String(buildTime.getMonth() + 1).padStart(2, '0');
      const day = String(buildTime.getDate()).padStart(2, '0');
      const hours = String(buildTime.getHours()).padStart(2, '0');
      const minutes = String(buildTime.getMinutes()).padStart(2, '0');

      return `${year}/${month}/${day} ${hours}:${minutes}`;
    } catch (error) {
      this.context.logger.debug(`获取${environment}构建时间失败:`, error);
      return null;
    }
  }

  /**
   * 清理构建产物目录
   */
  async cleanBuildDir(environment: string): Promise<void> {
    try {
      const projectPath = this.context.cwd;
      const buildDir = await this.getBuildDirFromConfig(environment);
      const buildPath = resolve(projectPath, buildDir);

      if (existsSync(buildPath)) {
        await rm(buildPath, { recursive: true, force: true });
        this.context.logger.debug(`已清理${environment}构建目录: ${buildPath}`);
      }
    } catch (error) {
      this.context.logger.debug(`清理${environment}构建目录失败:`, error);
    }
  }
}
