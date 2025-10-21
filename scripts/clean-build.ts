#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';

// 需要清理的目录
const BUILD_DIRS = ['es', 'lib', 'dist', '.rollup.cache'];

// 获取所有子包路径
function getAllPackages(rootDir: string): string[] {
  const packages: string[] = [];
  const workspaceDirs = ['packages', 'apps', 'tools'];

  for (const dir of workspaceDirs) {
    const fullPath = path.join(rootDir, dir);
    if (!fs.existsSync(fullPath)) continue;

    const subdirs = fs.readdirSync(fullPath, { withFileTypes: true });
    for (const subdir of subdirs) {
      if (subdir.isDirectory()) {
        const packagePath = path.join(fullPath, subdir.name);
        const packageJsonPath = path.join(packagePath, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
          packages.push(packagePath);
        }
      }
    }
  }

  return packages;
}

// 递归删除目录
function removeDir(dirPath: string): boolean {
  if (!fs.existsSync(dirPath)) {
    return false;
  }

  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
    return true;
  } catch (error: any) {
    console.error(`   ⚠️  删除失败: ${error.message}`);
    return false;
  }
}

// 清理单个包
function cleanPackage(packagePath: string): {
  packageName: string;
  cleaned: string[];
} {
  const packageJsonPath = path.join(packagePath, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const packageName = pkg.name || path.basename(packagePath);

  const cleaned: string[] = [];

  for (const dir of BUILD_DIRS) {
    const dirPath = path.join(packagePath, dir);
    if (removeDir(dirPath)) {
      cleaned.push(dir);
    }
  }

  return { packageName, cleaned };
}

// 主函数
async function main() {
  const rootDir = path.resolve(process.cwd());
  console.log('🧹 开始清理构建产物...\n');

  const packages = getAllPackages(rootDir);
  console.log(`📦 找到 ${packages.length} 个子包\n`);

  let totalCleaned = 0;
  const results: { packageName: string; cleaned: string[] }[] = [];

  for (const packagePath of packages) {
    const result = cleanPackage(packagePath);
    results.push(result);

    if (result.cleaned.length > 0) {
      console.log(`✅ ${result.packageName}`);
      console.log(`   清理: ${result.cleaned.join(', ')}`);
      totalCleaned += result.cleaned.length;
    } else {
      console.log(`⏭️  ${result.packageName} (无需清理)`);
    }
  }

  console.log(`\n📊 清理完成:`);
  console.log(`   清理了 ${totalCleaned} 个目录`);
  console.log(`\n💡 可以运行 pnpm build:all 重新构建所有包`);
}

main().catch((error) => {
  console.error('清理失败:', error);
  process.exit(1);
});
