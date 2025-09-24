#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

console.log('🚀 准备发布 @ldesign/cropper...');

// 检查工作目录是否干净
function checkWorkingDirectory() {
  console.log('🔍 检查工作目录状态...');
  
  try {
    const status = execSync('git status --porcelain', { 
      cwd: rootDir, 
      encoding: 'utf-8' 
    }).trim();
    
    if (status) {
      console.error('❌ 工作目录不干净，请先提交或暂存更改:');
      console.error(status);
      process.exit(1);
    }
    
    console.log('✅ 工作目录干净');
  } catch (error) {
    console.warn('⚠️ 无法检查 Git 状态，跳过检查');
  }
}

// 检查当前分支
function checkCurrentBranch() {
  console.log('🌿 检查当前分支...');
  
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: rootDir,
      encoding: 'utf-8'
    }).trim();
    
    if (branch !== 'main' && branch !== 'master') {
      console.warn(`⚠️ 当前分支是 '${branch}'，建议在 main/master 分支发布`);
      
      // 询问是否继续
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        rl.question('是否继续发布？(y/N): ', resolve);
      });
      
      rl.close();
      
      if (answer.toLowerCase() !== 'y') {
        console.log('❌ 发布已取消');
        process.exit(1);
      }
    }
    
    console.log(`✅ 当前分支: ${branch}`);
  } catch (error) {
    console.warn('⚠️ 无法检查当前分支');
  }
}

// 运行测试
function runTests() {
  console.log('🧪 运行完整测试套件...');
  
  try {
    execSync('npm run ci:coverage', { cwd: rootDir, stdio: 'inherit' });
    console.log('✅ 所有测试通过');
  } catch (error) {
    console.error('❌ 测试失败，无法发布');
    process.exit(1);
  }
}

// 构建项目
function buildProject() {
  console.log('📦 构建生产版本...');
  
  try {
    execSync('npm run build:prod', { cwd: rootDir, stdio: 'inherit' });
    console.log('✅ 构建完成');
  } catch (error) {
    console.error('❌ 构建失败');
    process.exit(1);
  }
}

// 验证构建结果
function validateBuild() {
  console.log('🔍 验证构建结果...');
  
  const requiredFiles = [
    'dist/index.d.ts',
    'dist/esm/index.js',
    'dist/cjs/index.cjs',
    'dist/index.umd.js',
    'dist/index.css'
  ];
  
  const missingFiles = requiredFiles.filter(file => 
    !existsSync(resolve(rootDir, file))
  );
  
  if (missingFiles.length > 0) {
    console.error('❌ 缺少必要的构建文件:');
    missingFiles.forEach(file => console.error(`  - ${file}`));
    process.exit(1);
  }
  
  console.log('✅ 构建文件验证通过');
}

// 检查包大小
function checkPackageSize() {
  console.log('📊 检查包大小...');
  
  try {
    execSync('npm run size-check', { cwd: rootDir, stdio: 'inherit' });
    console.log('✅ 包大小检查通过');
  } catch (error) {
    console.error('❌ 包大小超出限制');
    process.exit(1);
  }
}

// 生成变更日志
function generateChangelog() {
  console.log('📝 生成变更日志...');
  
  const pkg = JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf-8'));
  const version = pkg.version;
  
  try {
    // 获取上一个版本的标签
    const lastTag = execSync('git describe --tags --abbrev=0', {
      cwd: rootDir,
      encoding: 'utf-8'
    }).trim();
    
    // 获取提交记录
    const commits = execSync(`git log ${lastTag}..HEAD --pretty=format:"%h %s"`, {
      cwd: rootDir,
      encoding: 'utf-8'
    }).trim();
    
    if (commits) {
      const changelogEntry = `
## [${version}] - ${new Date().toISOString().split('T')[0]}

### Changes
${commits.split('\n').map(commit => `- ${commit}`).join('\n')}
`;
      
      // 读取现有的 CHANGELOG.md
      let changelog = '';
      const changelogPath = resolve(rootDir, 'CHANGELOG.md');
      
      if (existsSync(changelogPath)) {
        changelog = readFileSync(changelogPath, 'utf-8');
      } else {
        changelog = '# Changelog\n\nAll notable changes to this project will be documented in this file.\n';
      }
      
      // 插入新的变更记录
      const lines = changelog.split('\n');
      const insertIndex = lines.findIndex(line => line.startsWith('## [')) || 2;
      lines.splice(insertIndex, 0, changelogEntry);
      
      writeFileSync(changelogPath, lines.join('\n'));
      console.log('✅ 变更日志已更新');
    } else {
      console.log('ℹ️ 没有新的提交记录');
    }
  } catch (error) {
    console.warn('⚠️ 无法生成变更日志:', error.message);
  }
}

// 生成文件哈希
function generateFileHashes() {
  console.log('🔐 生成文件哈希...');
  
  const distFiles = [
    'dist/esm/index.js',
    'dist/cjs/index.cjs',
    'dist/index.umd.js',
    'dist/index.css'
  ];
  
  const hashes = {};
  
  distFiles.forEach(file => {
    const filePath = resolve(rootDir, file);
    if (existsSync(filePath)) {
      const content = readFileSync(filePath);
      const hash = createHash('sha256').update(content).digest('hex');
      hashes[file] = hash;
    }
  });
  
  writeFileSync(
    resolve(rootDir, 'dist/file-hashes.json'),
    JSON.stringify(hashes, null, 2)
  );
  
  console.log('✅ 文件哈希已生成');
}

// 创建发布包
function createReleasePackage() {
  console.log('📦 创建发布包...');
  
  try {
    execSync('npm pack --dry-run', { cwd: rootDir, stdio: 'inherit' });
    console.log('✅ 发布包验证通过');
  } catch (error) {
    console.error('❌ 发布包创建失败');
    process.exit(1);
  }
}

// 显示发布信息
function showReleaseInfo() {
  const pkg = JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf-8'));
  
  console.log('\n🎉 发布准备完成！');
  console.log('📋 发布信息:');
  console.log(`  包名: ${pkg.name}`);
  console.log(`  版本: ${pkg.version}`);
  console.log(`  描述: ${pkg.description}`);
  console.log('\n📝 下一步操作:');
  console.log('  1. 检查 CHANGELOG.md');
  console.log('  2. 运行 npm publish 发布到 npm');
  console.log('  3. 创建 Git 标签: git tag v' + pkg.version);
  console.log('  4. 推送标签: git push origin v' + pkg.version);
  console.log('\n或者运行: npm run release');
}

// 主流程
async function prepareRelease() {
  const startTime = Date.now();
  
  try {
    checkWorkingDirectory();
    await checkCurrentBranch();
    runTests();
    buildProject();
    validateBuild();
    checkPackageSize();
    generateChangelog();
    generateFileHashes();
    createReleasePackage();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    showReleaseInfo();
    console.log(`\n⏱️ 总耗时: ${duration}s`);
  } catch (error) {
    console.error('❌ 发布准备失败:', error);
    process.exit(1);
  }
}

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ 未处理的 Promise 拒绝:', reason);
  process.exit(1);
});

// 启动发布准备
prepareRelease();