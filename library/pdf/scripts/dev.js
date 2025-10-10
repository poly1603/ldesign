#!/usr/bin/env node

/**
 * 开发模式启动脚本
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const commands = {
  'vue3': {
    name: 'Vue3 示例',
    cwd: join(rootDir, 'examples/vue3-demo'),
    command: 'pnpm',
    args: ['dev']
  },
  'vanilla': {
    name: '原生JS示例',
    cwd: join(rootDir, 'examples/vanilla-demo'),
    command: 'pnpm',
    args: ['dev']
  },
  'docs': {
    name: '文档站点',
    cwd: rootDir,
    command: 'pnpm',
    args: ['docs:dev']
  }
};

const target = process.argv[2] || 'vue3';

if (!commands[target]) {
  console.error(`❌ 未知的目标: ${target}`);
  console.log('\n可用的目标:');
  Object.keys(commands).forEach(key => {
    console.log(`  - ${key}: ${commands[key].name}`);
  });
  process.exit(1);
}

const config = commands[target];

console.log(`\n🚀 启动 ${config.name}...\n`);

const child = spawn(config.command, config.args, {
  cwd: config.cwd,
  stdio: 'inherit',
  shell: true
});

child.on('error', (error) => {
  console.error(`❌ 启动失败:`, error);
  process.exit(1);
});

child.on('exit', (code) => {
  if (code !== 0) {
    console.error(`\n❌ 进程退出，代码: ${code}`);
  }
  process.exit(code);
});
