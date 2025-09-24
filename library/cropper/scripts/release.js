#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

/**
 * 执行命令并返回输出
 */
function exec(command, options = {}) {
  console.log(`🔄 执行: ${command}`);
  try {
    const result = execSync(command, {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: 'inherit',
      ...options
    });
    return result;
  } catch (error) {
    console.error(`❌ 命令执行失败: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

/**
 * 获取当前版本
 */
function getCurrentVersion() {
  const packagePath = join(rootDir, 'package.json');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  return packageJson.version;
}

/**
 * 更新版本号
 */
function updateVersion(newVersion) {
  const packagePath = join(rootDir, 'package.json');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  packageJson.version = newVersion;
  writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`✅ 版本已更新为: ${newVersion}`);
}

/**
 * 检查工作目录是否干净
 */
function checkWorkingDirectory() {
  try {
    const status = execSync('git status --porcelain', { 
      cwd: rootDir, 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    if (status.trim()) {
      console.error('❌ 工作目录不干净，请先提交或暂存更改');
      console.log(status);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 检查Git状态失败');
    process.exit(1);
  }
}

/**
 * 检查当前分支
 */
function checkCurrentBranch() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: 'pipe'
    }).trim();
    
    if (branch !== 'main' && branch !== 'master') {
      console.error(`❌ 当前分支是 ${branch}，请切换到 main 或 master 分支`);
      process.exit(1);
    }
    
    console.log(`✅ 当前分支: ${branch}`);
  } catch (error) {
    console.error('❌ 检查Git分支失败');
    process.exit(1);
  }
}

/**
 * 运行测试
 */
function runTests() {
  console.log('🧪 运行测试...');
  exec('pnpm test');
  console.log('✅ 测试通过');
}

/**
 * 构建项目
 */
function buildProject() {
  console.log('🔨 构建项目...');
  exec('pnpm build');
  console.log('✅ 构建完成');
}

/**
 * 生成变更日志
 */
function generateChangelog() {
  console.log('📝 生成变更日志...');
  try {
    exec('pnpm changeset version');
    console.log('✅ 变更日志已生成');
  } catch (error) {
    console.log('⚠️  没有待发布的变更集');
  }
}

/**
 * 创建Git标签
 */
function createGitTag(version) {
  console.log(`🏷️  创建Git标签: v${version}`);
  exec(`git add .`);
  exec(`git commit -m "chore: release v${version}"`);
  exec(`git tag v${version}`);
  console.log(`✅ Git标签 v${version} 已创建`);
}

/**
 * 推送到远程仓库
 */
function pushToRemote() {
  console.log('📤 推送到远程仓库...');
  exec('git push origin main --tags');
  console.log('✅ 已推送到远程仓库');
}

/**
 * 发布到npm
 */
function publishToNpm() {
  console.log('📦 发布到npm...');
  exec('pnpm changeset publish');
  console.log('✅ 已发布到npm');
}

/**
 * 主发布流程
 */
async function release() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const skipTests = args.includes('--skip-tests');
  const skipBuild = args.includes('--skip-build');
  
  console.log('🚀 开始发布流程...');
  console.log(`📋 选项: ${isDryRun ? '预演模式' : '正式发布'}`);
  
  // 1. 检查工作目录和分支
  checkWorkingDirectory();
  checkCurrentBranch();
  
  // 2. 运行测试
  if (!skipTests) {
    runTests();
  }
  
  // 3. 构建项目
  if (!skipBuild) {
    buildProject();
  }
  
  // 4. 生成变更日志和更新版本
  generateChangelog();
  
  const currentVersion = getCurrentVersion();
  console.log(`📋 当前版本: ${currentVersion}`);
  
  if (isDryRun) {
    console.log('🔍 预演模式 - 不会实际发布');
    exec('pnpm pack --dry-run');
    return;
  }
  
  // 5. 创建Git标签
  createGitTag(currentVersion);
  
  // 6. 推送到远程仓库
  pushToRemote();
  
  // 7. 发布到npm
  publishToNpm();
  
  console.log('🎉 发布完成！');
  console.log(`📦 版本 ${currentVersion} 已成功发布`);
}

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的Promise拒绝:', reason);
  process.exit(1);
});

// 运行发布流程
release().catch((error) => {
  console.error('❌ 发布失败:', error);
  process.exit(1);
});