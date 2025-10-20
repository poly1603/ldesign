#!/usr/bin/env node

/**
 * 测试所有包的打包
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, cwd = rootDir) {
  try {
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    return false;
  }
}

function checkDistFiles(packageName, distPath) {
  const files = [
    'index.esm.js',
    'index.cjs.js',
    'index.umd.js',
    'index.d.ts',
  ];

  const missing = files.filter(file => !existsSync(join(distPath, file)));
  
  if (missing.length > 0) {
    log(`  ❌ 缺少文件: ${missing.join(', ')}`, 'red');
    return false;
  }
  
  log(`  ✅ 所有输出文件存在`, 'green');
  return true;
}

async function testBuild() {
  log('\n========================================', 'cyan');
  log('开始测试所有包的打包', 'cyan');
  log('========================================\n', 'cyan');

  const packages = [
    { name: 'core', path: 'packages/core' },
    { name: 'vue', path: 'packages/vue' },
    { name: 'react', path: 'packages/react' },
    { name: 'lit', path: 'packages/lit' },
  ];

  let successCount = 0;
  let failCount = 0;

  for (const pkg of packages) {
    log(`\n📦 正在构建 @ldesign/excel-viewer-${pkg.name}...`, 'blue');
    
    const pkgPath = join(rootDir, pkg.path);
    const distPath = join(pkgPath, 'dist');

    // 清理旧的构建文件
    log('  清理旧的构建文件...', 'yellow');
    exec(`rimraf dist`, pkgPath);

    // 执行构建
    log('  执行构建...', 'yellow');
    const buildSuccess = exec(`npm run build`, rootDir);

    if (!buildSuccess) {
      log(`  ❌ 构建失败`, 'red');
      failCount++;
      continue;
    }

    // 检查输出文件
    log('  检查输出文件...', 'yellow');
    const filesOk = checkDistFiles(pkg.name, distPath);

    if (filesOk) {
      log(`  ✅ @ldesign/excel-viewer-${pkg.name} 构建成功`, 'green');
      successCount++;
    } else {
      log(`  ❌ @ldesign/excel-viewer-${pkg.name} 构建失败`, 'red');
      failCount++;
    }
  }

  // 总结
  log('\n========================================', 'cyan');
  log('构建测试总结', 'cyan');
  log('========================================\n', 'cyan');
  log(`成功: ${successCount}`, 'green');
  log(`失败: ${failCount}`, 'red');
  log(`总计: ${packages.length}\n`, 'blue');

  if (failCount === 0) {
    log('🎉 所有包构建成功！', 'green');
    process.exit(0);
  } else {
    log('❌ 部分包构建失败', 'red');
    process.exit(1);
  }
}

testBuild();


