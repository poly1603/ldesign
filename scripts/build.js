#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class MonorepoBuilder {
  constructor() {
    this.rootPath = join(__dirname, '..');
    this.packagesPath = join(this.rootPath, 'packages');
    this.buildResults = [];
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',    // cyan
      success: '\x1b[32m', // green
      error: '\x1b[31m',   // red
      warn: '\x1b[33m'     // yellow
    };
    const reset = '\x1b[0m';
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${colors[type]}[${timestamp}] ${message}${reset}`);
  }

  async discoverPackages() {
    this.log('🔍 正在扫描子包...');
    const packages = [];
    
    try {
      const result = execSync('pnpm list -r --depth=-1 --json', { 
        cwd: this.rootPath,
        encoding: 'utf8'
      });
      
      const data = JSON.parse(result);
      
      for (const pkg of data) {
        if (pkg.path && pkg.path !== this.rootPath) {
          const packageJsonPath = join(pkg.path, 'package.json');
          if (existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
            packages.push({
              name: packageJson.name,
              version: packageJson.version,
              path: pkg.path,
              dependencies: packageJson.dependencies,
              devDependencies: packageJson.devDependencies,
              scripts: packageJson.scripts
            });
          }
        }
      }
    } catch (error) {
      this.log(`扫描包时出错: ${error}`, 'error');
    }

    this.log(`✅ 发现 ${packages.length} 个子包`, 'success');
    return packages;
  }

  async buildPackage(pkg) {
    const startTime = Date.now();
    this.log(`🔨 正在构建 ${pkg.name}...`);

    try {
      if (!pkg.scripts?.build) {
        this.log(`⚠️  ${pkg.name} 没有构建脚本，跳过`, 'warn');
        return {
          package: pkg.name,
          success: true,
          duration: Date.now() - startTime
        };
      }

      execSync('pnpm run build', {
        cwd: pkg.path,
        stdio: 'inherit'
      });

      const duration = Date.now() - startTime;
      this.log(`✅ ${pkg.name} 构建成功 (${duration}ms)`, 'success');
      
      return {
        package: pkg.name,
        success: true,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.log(`❌ ${pkg.name} 构建失败: ${error}`, 'error');
      
      return {
        package: pkg.name,
        success: false,
        duration,
        error: String(error)
      };
    }
  }

  async buildAll() {
    this.log('🚀 开始构建流程...');
    
    const packages = await this.discoverPackages();
    
    if (packages.length === 0) {
      this.log('没有发现任何包，退出构建', 'warn');
      return;
    }

    // 并行构建所有包
    const buildPromises = packages.map(pkg => this.buildPackage(pkg));
    this.buildResults = await Promise.all(buildPromises);
  }

  generateReport() {
    const totalDuration = Date.now() - this.startTime;
    const successCount = this.buildResults.filter(r => r.success).length;
    const failureCount = this.buildResults.filter(r => !r.success).length;

    console.log('\n' + '='.repeat(60));
    console.log('📊 构建报告');
    console.log('='.repeat(60));
    console.log(`总耗时: ${totalDuration}ms`);
    console.log(`成功: ${successCount} 个包`);
    console.log(`失败: ${failureCount} 个包`);
    console.log('');

    if (failureCount > 0) {
      console.log('❌ 失败的包:');
      this.buildResults
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`  - ${r.package}: ${r.error}`);
        });
      console.log('');
    }

    console.log('✅ 成功的包:');
    this.buildResults
      .filter(r => r.success)
      .forEach(r => {
        console.log(`  - ${r.package} (${r.duration}ms)`);
      });

    console.log('='.repeat(60));
  }

  async run() {
    try {
      await this.buildAll();
      this.generateReport();
      
      const hasFailures = this.buildResults.some(r => !r.success);
      if (hasFailures) {
        process.exit(1);
      }
    } catch (error) {
      this.log(`构建过程中发生错误: ${error}`, 'error');
      process.exit(1);
    }
  }
}

// 运行构建器
const builder = new MonorepoBuilder();
builder.run().catch(console.error);