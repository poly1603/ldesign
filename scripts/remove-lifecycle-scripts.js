#!/usr/bin/env node

/**
 * 批量删除所有 package.json 中的生命周期钩子脚本
 * 这些脚本会在 pnpm install 时自动执行,可能导致构建错误
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 需要删除的生命周期脚本
const LIFECYCLE_SCRIPTS = [
  'prepare',
  'prepublish',
  'prepublishOnly',
  'prepack',
  'postpack',
  'preinstall',
  'install',
  'postinstall',
];

let modifiedCount = 0;
let totalRemoved = 0;

/**
 * 递归查找所有 package.json 文件
 */
function findPackageJsonFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // 跳过 node_modules 目录
    if (entry.name === 'node_modules' || entry.name === '.git') {
      continue;
    }

    if (entry.isDirectory()) {
      findPackageJsonFiles(fullPath, files);
    } else if (entry.name === 'package.json') {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * 处理单个 package.json 文件
 */
function processPackageJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const pkg = JSON.parse(content);

    if (!pkg.scripts) {
      return;
    }

    let removed = 0;
    const originalScripts = { ...pkg.scripts };

    // 删除生命周期脚本
    for (const script of LIFECYCLE_SCRIPTS) {
      if (pkg.scripts[script]) {
        delete pkg.scripts[script];
        removed++;
        totalRemoved++;
      }
    }

    if (removed > 0) {
      // 写回文件,保持格式
      const newContent = JSON.stringify(pkg, null, 2) + '\n';
      fs.writeFileSync(filePath, newContent, 'utf8');

      modifiedCount++;
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(`✅ ${relativePath}`);
      console.log(`   删除了 ${removed} 个生命周期脚本:`);
      for (const script of LIFECYCLE_SCRIPTS) {
        if (originalScripts[script]) {
          console.log(`   - ${script}: "${originalScripts[script]}"`);
        }
      }
      console.log();
    }
  } catch (error) {
    console.error(`❌ 处理文件失败: ${filePath}`);
    console.error(`   错误: ${error.message}`);
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🔍 正在搜索所有 package.json 文件...\n');

  const rootDir = path.resolve(__dirname, '..');
  const packageJsonFiles = findPackageJsonFiles(rootDir);

  console.log(`📦 找到 ${packageJsonFiles.length} 个 package.json 文件\n`);
  console.log('🧹 开始清理生命周期脚本...\n');

  for (const file of packageJsonFiles) {
    processPackageJson(file);
  }

  console.log('='.repeat(60));
  console.log(`\n✨ 完成!`);
  console.log(`   修改了 ${modifiedCount} 个文件`);
  console.log(`   总共删除了 ${totalRemoved} 个生命周期脚本\n`);

  if (modifiedCount > 0) {
    console.log('💡 提示:');
    console.log('   现在可以运行 "pnpm install" 来安装依赖');
    console.log('   安装过程将不会触发任何构建或测试脚本\n');
  }
}

main();