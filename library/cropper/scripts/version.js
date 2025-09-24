#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import semver from 'semver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

/**
 * 执行命令并返回输出
 */
function exec(command, options = {}) {
  try {
    return execSync(command, {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: 'pipe',
      ...options
    }).trim();
  } catch (error) {
    console.error(`命令执行失败: ${command}`);
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
 * 更新package.json版本
 */
function updatePackageVersion(newVersion) {
  const packagePath = join(rootDir, 'package.json');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  packageJson.version = newVersion;
  writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
}

/**
 * 获取Git提交信息
 */
function getCommitsSinceLastTag() {
  try {
    const lastTag = exec('git describe --tags --abbrev=0');
    const commits = exec(`git log ${lastTag}..HEAD --oneline`);
    return commits.split('\n').filter(line => line.trim());
  } catch (error) {
    // 如果没有标签，获取所有提交
    const commits = exec('git log --oneline');
    return commits.split('\n').filter(line => line.trim());
  }
}

/**
 * 分析提交类型
 */
function analyzeCommits(commits) {
  const analysis = {
    breaking: false,
    features: [],
    fixes: [],
    others: []
  };

  commits.forEach(commit => {
    const message = commit.toLowerCase();
    
    if (message.includes('breaking') || message.includes('!:')) {
      analysis.breaking = true;
    } else if (message.startsWith('feat')) {
      analysis.features.push(commit);
    } else if (message.startsWith('fix')) {
      analysis.fixes.push(commit);
    } else {
      analysis.others.push(commit);
    }
  });

  return analysis;
}

/**
 * 建议版本号
 */
function suggestVersion(currentVersion, analysis) {
  if (analysis.breaking) {
    return semver.inc(currentVersion, 'major');
  } else if (analysis.features.length > 0) {
    return semver.inc(currentVersion, 'minor');
  } else if (analysis.fixes.length > 0) {
    return semver.inc(currentVersion, 'patch');
  } else {
    return semver.inc(currentVersion, 'patch');
  }
}

/**
 * 显示版本信息
 */
function showVersionInfo() {
  const currentVersion = getCurrentVersion();
  const commits = getCommitsSinceLastTag();
  const analysis = analyzeCommits(commits);
  const suggestedVersion = suggestVersion(currentVersion, analysis);

  console.log('📋 版本信息');
  console.log('='.repeat(50));
  console.log(`当前版本: ${currentVersion}`);
  console.log(`建议版本: ${suggestedVersion}`);
  console.log('');
  
  console.log('📝 提交分析');
  console.log('-'.repeat(30));
  console.log(`💥 破坏性变更: ${analysis.breaking ? '是' : '否'}`);
  console.log(`✨ 新功能: ${analysis.features.length} 个`);
  console.log(`🐛 修复: ${analysis.fixes.length} 个`);
  console.log(`📦 其他: ${analysis.others.length} 个`);
  console.log('');

  if (commits.length > 0) {
    console.log('📋 最近提交');
    console.log('-'.repeat(30));
    commits.slice(0, 10).forEach(commit => {
      console.log(`  ${commit}`);
    });
    if (commits.length > 10) {
      console.log(`  ... 还有 ${commits.length - 10} 个提交`);
    }
  }
}

/**
 * 更新版本
 */
function updateVersion(versionType) {
  const currentVersion = getCurrentVersion();
  let newVersion;

  if (semver.valid(versionType)) {
    // 如果是有效的版本号
    newVersion = versionType;
  } else {
    // 如果是版本类型 (major, minor, patch)
    newVersion = semver.inc(currentVersion, versionType);
  }

  if (!newVersion) {
    console.error('❌ 无效的版本号或版本类型');
    process.exit(1);
  }

  console.log(`📋 版本更新: ${currentVersion} → ${newVersion}`);
  
  // 更新package.json
  updatePackageVersion(newVersion);
  
  console.log('✅ 版本已更新');
  return newVersion;
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'info':
    case 'show':
      showVersionInfo();
      break;
      
    case 'update':
    case 'bump':
      const versionType = args[1];
      if (!versionType) {
        console.error('❌ 请指定版本类型 (major|minor|patch) 或具体版本号');
        console.log('用法: node scripts/version.js update <type|version>');
        process.exit(1);
      }
      updateVersion(versionType);
      break;
      
    case 'suggest':
      const currentVersion = getCurrentVersion();
      const commits = getCommitsSinceLastTag();
      const analysis = analyzeCommits(commits);
      const suggestedVersion = suggestVersion(currentVersion, analysis);
      console.log(suggestedVersion);
      break;
      
    default:
      console.log('📋 版本管理工具');
      console.log('');
      console.log('用法:');
      console.log('  node scripts/version.js info     - 显示版本信息');
      console.log('  node scripts/version.js update <type|version> - 更新版本');
      console.log('  node scripts/version.js suggest  - 建议版本号');
      console.log('');
      console.log('版本类型:');
      console.log('  major  - 主版本号 (破坏性变更)');
      console.log('  minor  - 次版本号 (新功能)');
      console.log('  patch  - 修订版本号 (修复)');
      console.log('');
      console.log('示例:');
      console.log('  node scripts/version.js update patch');
      console.log('  node scripts/version.js update 1.2.3');
      break;
  }
}

main();