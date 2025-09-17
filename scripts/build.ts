#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface PackageInfo {
  name: string;
  version: string;
  path: string;
  packageJson: any;
  hasPublishScript: boolean;
  dependencies: string[];
  dependents: string[];
}

interface CacheData {
  packages: PackageInfo[];
  dependencyGraph: Record<string, string[]>;
  lastScan: number;
}

interface BuildResult {
  package: string;
  success: boolean;
  error?: string;
  timestamp: number;
}

interface PublishResult {
  package: string;
  success: boolean;
  error?: string;
  timestamp: number;
}

class MonorepoBuilder {
  private rootPath: string;
  private cachePath: string;
  private cacheFile: string;
  private buildResultsFile: string;
  private publishResultsFile: string;
  private originalVersionsFile: string;
  private rl: any;

  constructor() {
    this.rootPath = process.cwd();
    this.cachePath = join(this.rootPath, 'scripts', '.cache');
    this.cacheFile = join(this.cachePath, 'packages.json');
    this.buildResultsFile = join(this.cachePath, 'build-results.json');
    this.publishResultsFile = join(this.cachePath, 'publish-results.json');
    this.originalVersionsFile = join(this.cachePath, 'original-versions.json');
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.ensureCacheDirectory();
  }

  private ensureCacheDirectory(): void {
    if (!existsSync(this.cachePath)) {
      mkdirSync(this.cachePath, { recursive: true });
    }
  }

  private async question(query: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(query, resolve);
    });
  }

  private log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info'): void {
    const colors = {
      info: '\x1b[36m',    // cyan
      success: '\x1b[32m', // green
      error: '\x1b[31m',   // red
      warn: '\x1b[33m'     // yellow
    };
    const reset = '\x1b[0m';
    console.log(`${colors[type]}[${type.toUpperCase()}]${reset} ${message}`);
  }

  private async scanPackages(): Promise<PackageInfo[]> {
    this.log('扫描项目中的所有子包...');
    const packages: PackageInfo[] = [];
    const packagesDir = join(this.rootPath, 'packages');
    
    if (!existsSync(packagesDir)) {
      this.log('packages目录不存在', 'error');
      return packages;
    }

    const scanDirectory = (dir: string): void => {
      const items = readdirSync(dir);
      
      for (const item of items) {
        const itemPath = join(dir, item);
        const stat = statSync(itemPath);
        
        if (stat.isDirectory()) {
          const packageJsonPath = join(itemPath, 'package.json');
          
          if (existsSync(packageJsonPath)) {
            try {
              const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
              
              // 跳过私有包和示例包
              if (packageJson.private || packageJson.name?.includes('example') || packageJson.name?.includes('demo')) {
                continue;
              }
              
              const dependencies = [
                ...Object.keys(packageJson.dependencies || {}),
                ...Object.keys(packageJson.devDependencies || {}),
                ...Object.keys(packageJson.peerDependencies || {})
              ].filter(dep => dep.startsWith('@ldesign/'));

              const hasPublishScript = !!(packageJson.scripts && packageJson.scripts.publish);
              
              packages.push({
                name: packageJson.name,
                version: packageJson.version,
                path: itemPath,
                packageJson,
                hasPublishScript,
                dependencies,
                dependents: []
              });
              
              this.log(`发现包: ${packageJson.name}@${packageJson.version}`);
            } catch (error) {
              this.log(`解析 ${packageJsonPath} 失败: ${error}`, 'warn');
            }
          } else {
            // 递归扫描子目录
            scanDirectory(itemPath);
          }
        }
      }
    };

    scanDirectory(packagesDir);
    
    // 构建依赖关系图
    this.buildDependencyGraph(packages);
    
    return packages;
  }

  private buildDependencyGraph(packages: PackageInfo[]): void {
    const packageMap = new Map(packages.map(pkg => [pkg.name, pkg]));
    
    for (const pkg of packages) {
      for (const dep of pkg.dependencies) {
        const depPackage = packageMap.get(dep);
        if (depPackage) {
          depPackage.dependents.push(pkg.name);
        }
      }
    }
  }

  private loadCache(): CacheData | null {
    if (!existsSync(this.cacheFile)) {
      return null;
    }
    
    try {
      const cache = JSON.parse(readFileSync(this.cacheFile, 'utf-8'));
      this.log(`从缓存加载了 ${cache.packages.length} 个包`);
      return cache;
    } catch (error) {
      this.log('缓存文件损坏，将重新扫描', 'warn');
      return null;
    }
  }

  private saveCache(packages: PackageInfo[]): void {
    const cache: CacheData = {
      packages,
      dependencyGraph: {},
      lastScan: Date.now()
    };
    
    // 构建依赖关系图
    for (const pkg of packages) {
      cache.dependencyGraph[pkg.name] = pkg.dependents;
    }
    
    writeFileSync(this.cacheFile, JSON.stringify(cache, null, 2));
    this.log('缓存已保存');
  }

  private saveOriginalVersions(packages: PackageInfo[]): void {
    const originalVersions: Record<string, string> = {};
    for (const pkg of packages) {
      originalVersions[pkg.name] = pkg.version;
    }
    writeFileSync(this.originalVersionsFile, JSON.stringify(originalVersions, null, 2));
  }

  private async getPackages(): Promise<PackageInfo[]> {
    let cache = this.loadCache();
    
    if (!cache) {
      const packages = await this.scanPackages();
      this.saveCache(packages);
      return packages;
    }
    
    return cache.packages;
  }

  private async askForVersionUpgrade(): Promise<{ upgrade: boolean; rule?: string }> {
    const answer = await this.question('是否要对所有子包进行版本升级？(y/n): ');
    
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      this.log('请选择版本升级规则:');
      this.log('1. patch (0.0.x)');
      this.log('2. minor (0.x.0)');
      this.log('3. major (x.0.0)');
      
      const ruleAnswer = await this.question('请输入选择 (1/2/3): ');
      const rules = { '1': 'patch', '2': 'minor', '3': 'major' };
      const rule = rules[ruleAnswer as keyof typeof rules];
      
      if (!rule) {
        this.log('无效选择，跳过版本升级', 'warn');
        return { upgrade: false };
      }
      
      return { upgrade: true, rule };
    }
    
    return { upgrade: false };
  }

  private incrementVersion(version: string, rule: string): string {
    const parts = version.split('.').map(Number);
    
    switch (rule) {
      case 'patch':
        parts[2]++;
        break;
      case 'minor':
        parts[1]++;
        parts[2] = 0;
        break;
      case 'major':
        parts[0]++;
        parts[1] = 0;
        parts[2] = 0;
        break;
    }
    
    return parts.join('.');
  }

  private updatePackageVersion(pkg: PackageInfo, newVersion: string): void {
    pkg.packageJson.version = newVersion;
    pkg.version = newVersion;
    writeFileSync(join(pkg.path, 'package.json'), JSON.stringify(pkg.packageJson, null, 2));
    this.log(`更新 ${pkg.name} 版本: ${newVersion}`, 'success');
  }

  private updateDependentVersions(packages: PackageInfo[], updatedPackage: PackageInfo): void {
    for (const dependentName of updatedPackage.dependents) {
      const dependent = packages.find(pkg => pkg.name === dependentName);
      if (dependent) {
        let updated = false;
        
        // 更新 dependencies
        if (dependent.packageJson.dependencies && dependent.packageJson.dependencies[updatedPackage.name]) {
          dependent.packageJson.dependencies[updatedPackage.name] = `workspace:*`;
          updated = true;
        }
        
        // 更新 devDependencies
        if (dependent.packageJson.devDependencies && dependent.packageJson.devDependencies[updatedPackage.name]) {
          dependent.packageJson.devDependencies[updatedPackage.name] = `workspace:*`;
          updated = true;
        }
        
        // 更新 peerDependencies
        if (dependent.packageJson.peerDependencies && dependent.packageJson.peerDependencies[updatedPackage.name]) {
          dependent.packageJson.peerDependencies[updatedPackage.name] = `^${updatedPackage.version}`;
          updated = true;
        }
        
        if (updated) {
          writeFileSync(join(dependent.path, 'package.json'), JSON.stringify(dependent.packageJson, null, 2));
          this.log(`更新 ${dependent.name} 中的 ${updatedPackage.name} 依赖版本`);
        }
      }
    }
  }

  private async buildPackage(pkg: PackageInfo): Promise<BuildResult> {
    this.log(`开始构建 ${pkg.name}...`);
    
    try {
      // 检查是否有build脚本
      if (!pkg.packageJson.scripts || !pkg.packageJson.scripts.build) {
        this.log(`${pkg.name} 没有build脚本，跳过构建`, 'warn');
        return {
          package: pkg.name,
          success: true,
          timestamp: Date.now()
        };
      }
      
      // 执行构建
      execSync('pnpm run build', {
        cwd: pkg.path,
        stdio: 'pipe',
        encoding: 'utf-8'
      });
      
      this.log(`${pkg.name} 构建成功`, 'success');
      return {
        package: pkg.name,
        success: true,
        timestamp: Date.now()
      };
    } catch (error: any) {
      const errorMessage = error.stdout || error.stderr || error.message;
      this.log(`${pkg.name} 构建失败: ${errorMessage}`, 'error');
      
      return {
        package: pkg.name,
        success: false,
        error: errorMessage,
        timestamp: Date.now()
      };
    }
  }

  private async publishPackage(pkg: PackageInfo): Promise<PublishResult> {
    this.log(`开始发布 ${pkg.name}...`);
    
    try {
      if (!pkg.hasPublishScript) {
        this.log(`${pkg.name} 没有publish脚本，跳过发布`, 'warn');
        return {
          package: pkg.name,
          success: true,
          timestamp: Date.now()
        };
      }
      
      // 执行发布
      execSync('pnpm run publish', {
        cwd: pkg.path,
        stdio: 'pipe',
        encoding: 'utf-8'
      });
      
      this.log(`${pkg.name} 发布成功`, 'success');
      return {
        package: pkg.name,
        success: true,
        timestamp: Date.now()
      };
    } catch (error: any) {
      const errorMessage = error.stdout || error.stderr || error.message;
      this.log(`${pkg.name} 发布失败: ${errorMessage}`, 'error');
      
      return {
        package: pkg.name,
        success: false,
        error: errorMessage,
        timestamp: Date.now()
      };
    }
  }

  private saveBuildResults(results: BuildResult[]): void {
    writeFileSync(this.buildResultsFile, JSON.stringify(results, null, 2));
  }

  private savePublishResults(results: PublishResult[]): void {
    writeFileSync(this.publishResultsFile, JSON.stringify(results, null, 2));
  }

  private async restoreVersions(packages: PackageInfo[]): Promise<void> {
    if (!existsSync(this.originalVersionsFile)) {
      return;
    }
    
    try {
      const originalVersions = JSON.parse(readFileSync(this.originalVersionsFile, 'utf-8'));
      
      for (const pkg of packages) {
        if (originalVersions[pkg.name]) {
          this.updatePackageVersion(pkg, originalVersions[pkg.name]);
          this.updateDependentVersions(packages, pkg);
        }
      }
      
      this.log('版本号已恢复到原始状态', 'success');
    } catch (error) {
      this.log('恢复版本号失败', 'error');
    }
  }

  private printFinalReport(buildResults: BuildResult[], publishResults: PublishResult[]): void {
    this.log('\n=== 构建和发布报告 ===', 'info');
    
    const successfulBuilds = buildResults.filter(r => r.success);
    const failedBuilds = buildResults.filter(r => !r.success);
    const successfulPublishes = publishResults.filter(r => r.success);
    const failedPublishes = publishResults.filter(r => !r.success);
    
    this.log(`\n📦 构建结果:`, 'info');
    this.log(`✅ 成功: ${successfulBuilds.length} 个包`, 'success');
    if (successfulBuilds.length > 0) {
      successfulBuilds.forEach(r => this.log(`  - ${r.package}`, 'success'));
    }
    
    this.log(`❌ 失败: ${failedBuilds.length} 个包`, 'error');
    if (failedBuilds.length > 0) {
      failedBuilds.forEach(r => this.log(`  - ${r.package}`, 'error'));
    }
    
    this.log(`\n🚀 发布结果:`, 'info');
    this.log(`✅ 成功: ${successfulPublishes.length} 个包`, 'success');
    if (successfulPublishes.length > 0) {
      successfulPublishes.forEach(r => this.log(`  - ${r.package}`, 'success'));
    }
    
    this.log(`❌ 失败: ${failedPublishes.length} 个包`, 'error');
    if (failedPublishes.length > 0) {
      failedPublishes.forEach(r => this.log(`  - ${r.package}`, 'error'));
    }
  }

  async run(): Promise<void> {
    try {
      this.log('🚀 开始 LDesign Monorepo 构建流程', 'info');
      
      // 1. 获取所有包
      const packages = await this.getPackages();
      if (packages.length === 0) {
        this.log('没有找到任何包', 'warn');
        return;
      }
      
      // 保存原始版本
      this.saveOriginalVersions(packages);
      
      // 2. 询问是否升级版本
      const { upgrade, rule } = await this.askForVersionUpgrade();
      
      if (upgrade && rule) {
        this.log(`开始执行 ${rule} 版本升级...`);
        
        for (const pkg of packages) {
          const newVersion = this.incrementVersion(pkg.version, rule);
          this.updatePackageVersion(pkg, newVersion);
          this.updateDependentVersions(packages, pkg);
        }
        
        // 更新缓存
        this.saveCache(packages);
      }
      
      // 3. 构建所有包
      this.log('\n开始构建所有包...');
      const buildResults: BuildResult[] = [];
      
      for (const pkg of packages) {
        const result = await this.buildPackage(pkg);
        buildResults.push(result);
      }
      
      this.saveBuildResults(buildResults);
      
      // 4. 检查是否有构建失败的包
      const failedBuilds = buildResults.filter(r => !r.success);
      const allBuildsFailed = failedBuilds.length === buildResults.length;
      
      if (allBuildsFailed) {
        this.log('所有包构建都失败，恢复版本号并跳过发布', 'error');
        await this.restoreVersions(packages);
        this.printFinalReport(buildResults, []);
        return;
      }
      
      // 5. 询问是否发布
      const publishAnswer = await this.question('\n所有包构建完成，是否发布到npm？(y/n): ');
      
      if (publishAnswer.toLowerCase() === 'y' || publishAnswer.toLowerCase() === 'yes') {
        this.log('开始发布流程...');
        const publishResults: PublishResult[] = [];
        
        // 只发布构建成功的包
        const successfulBuilds = buildResults.filter(r => r.success);
        const successfulPackages = packages.filter(pkg => 
          successfulBuilds.some(build => build.package === pkg.name)
        );
        
        for (const pkg of successfulPackages) {
          const result = await this.publishPackage(pkg);
          publishResults.push(result);
        }
        
        this.savePublishResults(publishResults);
        this.printFinalReport(buildResults, publishResults);
      } else {
        this.log('跳过发布流程');
        this.printFinalReport(buildResults, []);
      }
      
    } catch (error) {
      this.log(`构建流程出错: ${error}`, 'error');
    } finally {
      this.rl.close();
    }
  }
}

// 运行构建器
const builder = new MonorepoBuilder();
builder.run().catch(console.error);