#!/usr/bin/env node

/**
 * 快速安装脚本
 * 使用优化的参数加速 pnpm 安装过程
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径（ES 模块中需要手动定义 __dirname）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 LDesign 快速安装工具\n');

// 检查 pnpm 是否安装
try {
  execSync('pnpm --version', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ 错误: 未安装 pnpm');
  console.log('请先安装 pnpm: npm install -g pnpm');
  process.exit(1);
}

// 检查是否存在 pnpm-lock.yaml
const lockFilePath = path.join(process.cwd(), 'pnpm-lock.yaml');
const hasLockFile = fs.existsSync(lockFilePath);

// 构建安装命令
let installCmd = 'pnpm install';

if (hasLockFile) {
  console.log('✅ 检测到 pnpm-lock.yaml，使用 frozen-lockfile 模式');
  installCmd += ' --frozen-lockfile';
} else {
  console.log('⚠️  未检测到 pnpm-lock.yaml，将生成新的 lockfile');
}

// 检查是否跳过可选依赖
const skipOptional = process.argv.includes('--no-optional');
if (skipOptional) {
  console.log('⏭️  跳过可选依赖');
  installCmd += ' --no-optional';
}

// 检查是否只安装生产依赖
const prodOnly = process.argv.includes('--prod');
if (prodOnly) {
  console.log('📦 仅安装生产依赖');
  installCmd += ' --prod';
}

// 检查缓存状态
console.log('\n📊 检查 pnpm 缓存状态...');
try {
  const storeStatus = execSync('pnpm store status', { encoding: 'utf8' });
  console.log(storeStatus);
} catch (error) {
  console.log('⚠️  无法获取缓存状态');
}

// 显示配置信息
console.log('\n⚙️  当前配置:');
console.log(`   Registry: https://registry.npmmirror.com/`);
console.log(`   Network Concurrency: 32`);
console.log(`   Fetch Retries: 5`);

// 执行安装
console.log(`\n🔧 执行命令: ${installCmd}\n`);
console.log('='.repeat(60));

const startTime = Date.now();

try {
  execSync(installCmd, {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(60));
  console.log(`✅ 安装完成！耗时: ${duration} 秒`);
  console.log('\n💡 提示:');
  console.log('   - 使用 "node scripts/fast-install.js --no-optional" 跳过可选依赖');
  console.log('   - 使用 "node scripts/fast-install.js --prod" 仅安装生产依赖');
  console.log('   - 使用 "pnpm store prune" 清理缓存');

} catch (error) {
  console.error('\n❌ 安装失败');
  console.error('错误信息:', error.message);

  console.log('\n🔍 故障排除建议:');
  console.log('   1. 检查网络连接');
  console.log('   2. 清理缓存: pnpm store prune');
  console.log('   3. 删除 node_modules 和 pnpm-lock.yaml 后重试');
  console.log('   4. 查看 INSTALL_OPTIMIZATION.md 了解更多优化方案');

  process.exit(1);
}