#!/usr/bin/env node

/**
 * Submodule 更新脚本
 * 拉取所有 submodule 的最新代码
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const OPTIONS = {
  force: args.includes('--force') || args.includes('-f'),
  verbose: args.includes('--verbose') || args.includes('-v'),
};

const c = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function exec(cmd, options = {}) {
  if (OPTIONS.verbose) console.log(`  ${c.cyan}$ ${cmd}${c.reset}`);
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: 'pipe', ...options }).trim();
  } catch (e) {
    if (OPTIONS.verbose) console.log(`  ${c.red}Error: ${e.message}${c.reset}`);
    return null;
  }
}

function parseGitmodules() {
  const content = fs.readFileSync(path.join(ROOT_DIR, '.gitmodules'), 'utf8');
  const submodules = [];
  let current = null;

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    const match = trimmed.match(/^\[submodule\s+"(.+)"\]$/);
    if (match) {
      if (current) submodules.push(current);
      current = { name: match[1], path: '', branch: 'main' };
    } else if (current) {
      const kv = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
      if (kv) {
        if (kv[1] === 'path') current.path = kv[2];
        if (kv[1] === 'branch') current.branch = kv[2];
      }
    }
  }
  if (current) submodules.push(current);
  return submodules;
}

async function main() {
  console.log(`\n${c.cyan}🔄 更新所有 Submodules${c.reset}\n`);

  const submodules = parseGitmodules();
  let updated = 0, skipped = 0, failed = 0;

  for (let i = 0; i < submodules.length; i++) {
    const sub = submodules[i];
    const fullPath = path.join(ROOT_DIR, sub.path);
    const progress = `[${i + 1}/${submodules.length}]`;

    if (!fs.existsSync(fullPath) || !fs.existsSync(path.join(fullPath, '.git'))) {
      console.log(`${c.yellow}${progress} ${sub.path}: 跳过（未初始化）${c.reset}`);
      skipped++;
      continue;
    }

    // 检查是否有未提交的更改
    const status = exec('git status --porcelain', { cwd: fullPath });
    if (status && !OPTIONS.force) {
      console.log(`${c.yellow}${progress} ${sub.path}: 跳过（有未提交更改）${c.reset}`);
      skipped++;
      continue;
    }

    // 拉取更新
    const result = exec(`git pull origin ${sub.branch}`, { cwd: fullPath });
    if (result === null) {
      console.log(`${c.red}${progress} ${sub.path}: 更新失败${c.reset}`);
      failed++;
    } else if (result.includes('Already up to date')) {
      if (OPTIONS.verbose) {
        console.log(`${c.green}${progress} ${sub.path}: 已是最新${c.reset}`);
      }
      updated++;
    } else {
      console.log(`${c.green}${progress} ${sub.path}: 已更新${c.reset}`);
      updated++;
    }
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`${c.green}✓${c.reset} 更新: ${updated}  ${c.yellow}○${c.reset} 跳过: ${skipped}  ${c.red}✗${c.reset} 失败: ${failed}`);
  console.log(`\n💡 使用 --force 强制更新有未提交更改的 submodule\n`);
}

main();
