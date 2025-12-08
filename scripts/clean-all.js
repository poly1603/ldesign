#!/usr/bin/env node

/**
 * 清理脚本
 * 删除所有 node_modules 和 dist 目录
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const OPTIONS = {
  dist: args.includes('--dist'),
  modules: args.includes('--modules'),
  dryRun: args.includes('--dry-run'),
};

// 如果没有指定选项，清理所有
if (!OPTIONS.dist && !OPTIONS.modules) {
  OPTIONS.dist = true;
  OPTIONS.modules = true;
}

const c = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const IGNORE_DIRS = ['.git', '.github', '.vscode', '.husky'];
const targets = [];

function findTargets(dir, depth = 0) {
  if (depth > 5) return; // 限制深度

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (IGNORE_DIRS.includes(entry.name)) continue;

      const fullPath = path.join(dir, entry.name);

      if (OPTIONS.modules && entry.name === 'node_modules') {
        targets.push({ path: fullPath, type: 'modules' });
        continue; // 不递归进入 node_modules
      }

      if (OPTIONS.dist && entry.name === 'dist') {
        targets.push({ path: fullPath, type: 'dist' });
        continue;
      }

      findTargets(fullPath, depth + 1);
    }
  } catch {
    // 忽略权限错误
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
}

function getDirSize(dir) {
  let size = 0;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        size += getDirSize(fullPath);
      } else {
        size += fs.statSync(fullPath).size;
      }
    }
  } catch {
    // 忽略错误
  }
  return size;
}

async function main() {
  console.log(`\n${c.cyan}🧹 清理项目${c.reset}`);

  if (OPTIONS.dryRun) {
    console.log(`${c.yellow}(DRY-RUN 模式)${c.reset}`);
  }

  console.log(`\n扫描目录...`);

  findTargets(ROOT_DIR);

  if (targets.length === 0) {
    console.log(`${c.green}没有需要清理的目录${c.reset}\n`);
    return;
  }

  const modulesCount = targets.filter(t => t.type === 'modules').length;
  const distCount = targets.filter(t => t.type === 'dist').length;

  console.log(`\n找到 ${c.yellow}${targets.length}${c.reset} 个目录:`);
  if (modulesCount > 0) console.log(`  - node_modules: ${modulesCount}`);
  if (distCount > 0) console.log(`  - dist: ${distCount}`);

  let totalSize = 0;
  let deleted = 0;

  console.log(`\n开始清理...\n`);

  for (const target of targets) {
    const relativePath = path.relative(ROOT_DIR, target.path);
    const size = getDirSize(target.path);
    totalSize += size;

    if (OPTIONS.dryRun) {
      console.log(`${c.gray}[DRY-RUN]${c.reset} ${relativePath} (${formatSize(size)})`);
    } else {
      try {
        fs.rmSync(target.path, { recursive: true, force: true });
        console.log(`${c.green}✓${c.reset} ${relativePath} (${formatSize(size)})`);
        deleted++;
      } catch (e) {
        console.log(`${c.red}✗${c.reset} ${relativePath}: ${e.message}`);
      }
    }
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`${c.green}清理完成${c.reset}`);
  console.log(`  删除: ${deleted}/${targets.length} 个目录`);
  console.log(`  释放: ${formatSize(totalSize)}`);
  console.log('');
}

main();
