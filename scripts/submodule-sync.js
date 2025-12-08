#!/usr/bin/env node

/**
 * Submodule 同步脚本
 * 同步 .gitmodules 配置并更新远程 URL
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function exec(cmd) {
  console.log(`  ${c.cyan}$ ${cmd}${c.reset}`);
  try {
    execSync(cmd, { cwd: ROOT_DIR, stdio: 'inherit' });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log(`\n${c.cyan}🔄 同步 Submodule 配置${c.reset}\n`);

  console.log('1. 同步 .gitmodules 到 .git/config...');
  if (!exec('git submodule sync --recursive')) {
    console.log(`${c.red}同步失败${c.reset}`);
    process.exit(1);
  }

  console.log('\n2. 更新 submodule 远程信息...');
  if (!exec('git submodule update --init --recursive')) {
    console.log(`${c.red}更新失败${c.reset}`);
    process.exit(1);
  }

  console.log(`\n${c.green}✓ 同步完成${c.reset}\n`);
}

main();
