#!/usr/bin/env node

/**
 * Submodule 状态检查脚本
 * 显示所有 submodule 的分支、状态、是否有未提交更改
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// 颜色
const c = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

function exec(cmd, options = {}) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: 'pipe', ...options }).trim();
  } catch {
    return '';
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

function getStatus(submodule) {
  const fullPath = path.join(ROOT_DIR, submodule.path);

  if (!fs.existsSync(fullPath)) {
    return { exists: false, status: '未克隆' };
  }

  const gitDir = path.join(fullPath, '.git');
  if (!fs.existsSync(gitDir)) {
    return { exists: false, status: '非 Git 仓库' };
  }

  // 检查是否为空仓库
  const files = fs.readdirSync(fullPath);
  if (files.length === 1 && files[0] === '.git') {
    return { exists: false, status: '空仓库' };
  }

  const branch = exec('git branch --show-current', { cwd: fullPath }) || 'detached';
  const status = exec('git status --porcelain', { cwd: fullPath });
  const ahead = exec('git rev-list --count @{u}..HEAD 2>/dev/null', { cwd: fullPath }) || '0';
  const behind = exec('git rev-list --count HEAD..@{u} 2>/dev/null', { cwd: fullPath }) || '0';

  return {
    exists: true,
    branch,
    dirty: status.length > 0,
    ahead: parseInt(ahead) || 0,
    behind: parseInt(behind) || 0,
  };
}

function main() {
  console.log(`\n${c.bold}${c.cyan}📊 Submodule 状态检查${c.reset}\n`);

  const submodules = parseGitmodules();

  let clean = 0, dirty = 0, missing = 0, detached = 0;

  console.log(`${'名称'.padEnd(35)} ${'分支'.padEnd(12)} ${'状态'.padEnd(10)} 同步`);
  console.log('─'.repeat(70));

  for (const sub of submodules) {
    const status = getStatus(sub);
    const name = sub.path.length > 33 ? '...' + sub.path.slice(-30) : sub.path;

    if (!status.exists) {
      console.log(`${c.gray}${name.padEnd(35)}${c.reset} ${c.red}${status.status.padEnd(12)}${c.reset}`);
      missing++;
      continue;
    }

    const branchColor = status.branch === sub.branch ? c.green : c.yellow;
    const branchStr = status.branch.slice(0, 10).padEnd(12);

    let statusStr = '';
    if (status.dirty) {
      statusStr = `${c.yellow}有更改${c.reset}`;
      dirty++;
    } else {
      statusStr = `${c.green}干净${c.reset}`;
      clean++;
    }

    if (status.branch === 'detached') {
      detached++;
    }

    let syncStr = '';
    if (status.ahead > 0) syncStr += `${c.green}↑${status.ahead}${c.reset} `;
    if (status.behind > 0) syncStr += `${c.red}↓${status.behind}${c.reset}`;
    if (!syncStr) syncStr = `${c.gray}同步${c.reset}`;

    console.log(`${name.padEnd(35)} ${branchColor}${branchStr}${c.reset} ${statusStr.padEnd(18)} ${syncStr}`);
  }

  console.log('─'.repeat(70));
  console.log(`\n${c.bold}统计:${c.reset}`);
  console.log(`  ${c.green}✓${c.reset} 干净: ${clean}`);
  console.log(`  ${c.yellow}●${c.reset} 有更改: ${dirty}`);
  console.log(`  ${c.red}✗${c.reset} 缺失: ${missing}`);
  if (detached > 0) {
    console.log(`  ${c.yellow}⚠${c.reset} Detached: ${detached}`);
  }
  console.log('');
}

main();
