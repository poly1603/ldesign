/**
 * Git 管理器
 * 提供安全的 Git 操作封装
 */

import { execSync, spawn } from 'child_process';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Git 状态接口
export interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  staged: GitFile[];
  modified: GitFile[];
  untracked: GitFile[];
  conflicted: GitFile[];
  clean: boolean;
}

// Git 文件接口
export interface GitFile {
  path: string;
  status: 'M' | 'A' | 'D' | 'R' | 'C' | 'U' | '??';
  staged: boolean;
  workingTree: boolean;
}

// Git 提交接口
export interface GitCommit {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  email: string;
  date: Date;
  parents: string[];
  refs: string[];
}

// Git 分支接口
export interface GitBranch {
  name: string;
  current: boolean;
  remote?: string;
  ahead?: number;
  behind?: number;
  lastCommit?: string;
}

// Git 远程仓库接口
export interface GitRemote {
  name: string;
  url: string;
  type: 'fetch' | 'push';
}

// Git 标签接口
export interface GitTag {
  name: string;
  hash: string;
  message?: string;
  date?: Date;
  author?: string;
}

// Git 差异接口
export interface GitDiff {
  file: string;
  oldFile?: string;
  newFile?: string;
  hunks: GitDiffHunk[];
  binary: boolean;
  deleted: boolean;
  added: boolean;
  renamed: boolean;
}

export interface GitDiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: GitDiffLine[];
}

export interface GitDiffLine {
  type: 'add' | 'delete' | 'context';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

/**
 * Git 管理器类
 */
export class GitManager {
  private workingDir: string;

  constructor(workingDir: string) {
    this.workingDir = resolve(workingDir);
  }

  /**
   * 检查是否为 Git 仓库
   */
  async isGitRepository(): Promise<boolean> {
    try {
      const gitDir = resolve(this.workingDir, '.git');
      return existsSync(gitDir);
    } catch (error) {
      return false;
    }
  }

  /**
   * 执行 Git 命令
   */
  private async execGit(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      // 验证参数安全性
      const safeArgs = this.validateGitArgs(args);

      const child = spawn('git', safeArgs, {
        cwd: this.workingDir,
        stdio: ['pipe', 'pipe', 'pipe'],
        encoding: 'utf8'
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          reject(new Error(`Git command failed: ${stderr || stdout}`));
        }
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to execute git: ${error.message}`));
      });
    });
  }

  /**
   * 验证 Git 参数安全性
   */
  private validateGitArgs(args: string[]): string[] {
    // 过滤危险的参数
    const dangerousPatterns = [
      /^-+exec/,
      /^-+upload-pack/,
      /^-+receive-pack/,
      /[;&|`$()]/,
      /\.\./
    ];

    return args.filter(arg => {
      return !dangerousPatterns.some(pattern => pattern.test(arg));
    });
  }

  /**
   * 获取仓库状态
   */
  async getStatus(): Promise<GitStatus> {
    try {
      const [statusOutput, branchOutput] = await Promise.all([
        this.execGit(['status', '--porcelain=v1', '-b']),
        this.execGit(['rev-list', '--count', '--left-right', '@{upstream}...HEAD']).catch(() => '0\t0')
      ]);

      const lines = statusOutput.split('\n').filter(line => line.trim());
      const branchLine = lines.find(line => line.startsWith('##'));

      // 解析分支信息
      let branch = 'main';
      let ahead = 0;
      let behind = 0;

      if (branchLine) {
        const branchMatch = branchLine.match(/^## ([^.\s]+)/);
        if (branchMatch) {
          branch = branchMatch[1];
        }

        const aheadMatch = branchLine.match(/ahead (\d+)/);
        const behindMatch = branchLine.match(/behind (\d+)/);

        if (aheadMatch) ahead = parseInt(aheadMatch[1]);
        if (behindMatch) behind = parseInt(behindMatch[1]);
      }

      // 解析文件状态
      const staged: GitFile[] = [];
      const modified: GitFile[] = [];
      const untracked: GitFile[] = [];
      const conflicted: GitFile[] = [];

      lines.filter(line => !line.startsWith('##')).forEach(line => {
        if (line.length < 3) return;

        const indexStatus = line[0];
        const workTreeStatus = line[1];
        const filePath = line.substring(3);

        const file: GitFile = {
          path: filePath,
          status: (indexStatus !== ' ' ? indexStatus : workTreeStatus) as GitFile['status'],
          staged: indexStatus !== ' ' && indexStatus !== '?',
          workingTree: workTreeStatus !== ' '
        };

        // 分类文件
        if (indexStatus === 'U' || workTreeStatus === 'U') {
          conflicted.push(file);
        } else if (indexStatus !== ' ' && indexStatus !== '?') {
          staged.push(file);
        } else if (workTreeStatus === '?') {
          untracked.push(file);
        } else if (workTreeStatus !== ' ') {
          modified.push(file);
        }
      });

      return {
        branch,
        ahead,
        behind,
        staged,
        modified,
        untracked,
        conflicted,
        clean: staged.length === 0 && modified.length === 0 && untracked.length === 0 && conflicted.length === 0
      };
    } catch (error) {
      throw new Error(`Failed to get git status: ${error.message}`);
    }
  }

  /**
   * 获取分支列表
   */
  async getBranches(): Promise<GitBranch[]> {
    try {
      const output = await this.execGit(['branch', '-vv']);
      const lines = output.split('\n').filter(line => line.trim());

      return lines.map(line => {
        const current = line.startsWith('*');
        const cleanLine = line.replace(/^\*?\s+/, '');
        const parts = cleanLine.split(/\s+/);

        const name = parts[0];
        const lastCommit = parts[1];

        // 解析远程跟踪信息
        let remote: string | undefined;
        let ahead: number | undefined;
        let behind: number | undefined;

        const remoteMatch = cleanLine.match(/\[([^\]]+)\]/);
        if (remoteMatch) {
          const remoteInfo = remoteMatch[1];
          const remoteNameMatch = remoteInfo.match(/^([^:]+)/);
          if (remoteNameMatch) {
            remote = remoteNameMatch[1];
          }

          const aheadMatch = remoteInfo.match(/ahead (\d+)/);
          const behindMatch = remoteInfo.match(/behind (\d+)/);

          if (aheadMatch) ahead = parseInt(aheadMatch[1]);
          if (behindMatch) behind = parseInt(behindMatch[1]);
        }

        return {
          name,
          current,
          remote,
          ahead,
          behind,
          lastCommit
        };
      });
    } catch (error) {
      throw new Error(`Failed to get branches: ${error.message}`);
    }
  }

  /**
   * 添加文件到暂存区
   */
  async addFiles(files: string[]): Promise<void> {
    try {
      await this.execGit(['add', ...files]);
    } catch (error) {
      throw new Error(`Failed to add files: ${error.message}`);
    }
  }

  /**
   * 提交变更
   */
  async commit(message: string, options?: { amend?: boolean; signoff?: boolean }): Promise<string> {
    try {
      const args = ['commit', '-m', message];

      if (options?.amend) args.push('--amend');
      if (options?.signoff) args.push('--signoff');

      const output = await this.execGit(args);

      // 提取提交哈希
      const hashMatch = output.match(/\[[\w\s]+ ([a-f0-9]+)\]/);
      return hashMatch ? hashMatch[1] : '';
    } catch (error) {
      throw new Error(`Failed to commit: ${error.message}`);
    }
  }

  /**
   * 创建分支
   */
  async createBranch(name: string, startPoint?: string): Promise<void> {
    try {
      const args = ['checkout', '-b', name];
      if (startPoint) args.push(startPoint);

      await this.execGit(args);
    } catch (error) {
      throw new Error(`Failed to create branch: ${error.message}`);
    }
  }

  /**
   * 切换分支
   */
  async checkoutBranch(name: string): Promise<void> {
    try {
      await this.execGit(['checkout', name]);
    } catch (error) {
      throw new Error(`Failed to checkout branch: ${error.message}`);
    }
  }

  /**
   * 删除分支
   */
  async deleteBranch(name: string, force = false): Promise<void> {
    try {
      const args = ['branch', force ? '-D' : '-d', name];
      await this.execGit(args);
    } catch (error) {
      throw new Error(`Failed to delete branch: ${error.message}`);
    }
  }

  /**
   * 获取提交历史
   */
  async getCommits(options?: { limit?: number; branch?: string; since?: string }): Promise<GitCommit[]> {
    try {
      const args = [
        'log',
        '--pretty=format:%H|%h|%s|%an|%ae|%ad|%P|%D',
        '--date=iso'
      ];

      if (options?.limit) args.push(`-${options.limit}`);
      if (options?.branch) args.push(options.branch);
      if (options?.since) args.push(`--since=${options.since}`);

      const output = await this.execGit(args);
      if (!output) return [];

      return output.split('\n').map(line => {
        const parts = line.split('|');
        return {
          hash: parts[0],
          shortHash: parts[1],
          message: parts[2],
          author: parts[3],
          email: parts[4],
          date: new Date(parts[5]),
          parents: parts[6] ? parts[6].split(' ') : [],
          refs: parts[7] ? parts[7].split(', ').filter(ref => ref.trim()) : []
        };
      });
    } catch (error) {
      throw new Error(`Failed to get commits: ${error.message}`);
    }
  }

  /**
   * 推送到远程仓库
   */
  async push(remote = 'origin', branch?: string, options?: { force?: boolean; setUpstream?: boolean }): Promise<void> {
    try {
      const args = ['push'];

      if (options?.force) args.push('--force');
      if (options?.setUpstream) args.push('--set-upstream');

      args.push(remote);
      if (branch) args.push(branch);

      await this.execGit(args);
    } catch (error) {
      throw new Error(`Failed to push: ${error.message}`);
    }
  }

  /**
   * 从远程仓库拉取
   */
  async pull(remote = 'origin', branch?: string): Promise<void> {
    try {
      const args = ['pull', remote];
      if (branch) args.push(branch);

      await this.execGit(args);
    } catch (error) {
      throw new Error(`Failed to pull: ${error.message}`);
    }
  }

  /**
   * 获取远程仓库列表
   */
  async getRemotes(): Promise<GitRemote[]> {
    try {
      const output = await this.execGit(['remote', '-v']);
      if (!output) return [];

      const remotes: GitRemote[] = [];
      const lines = output.split('\n');

      lines.forEach(line => {
        const match = line.match(/^(\S+)\s+(\S+)\s+\((\w+)\)$/);
        if (match) {
          remotes.push({
            name: match[1],
            url: match[2],
            type: match[3] as 'fetch' | 'push'
          });
        }
      });

      return remotes;
    } catch (error) {
      throw new Error(`Failed to get remotes: ${error.message}`);
    }
  }

  /**
   * 获取文件差异
   */
  async getDiff(file?: string, staged = false): Promise<string> {
    try {
      const args = ['diff'];

      if (staged) args.push('--cached');
      if (file) args.push('--', file);

      return await this.execGit(args);
    } catch (error) {
      throw new Error(`Failed to get diff: ${error.message}`);
    }
  }

  /**
   * 重置文件
   */
  async resetFiles(files: string[], mode: 'soft' | 'mixed' | 'hard' = 'mixed'): Promise<void> {
    try {
      if (files.length === 0) return;

      await this.execGit(['reset', `--${mode}`, 'HEAD', '--', ...files]);
    } catch (error) {
      throw new Error(`Failed to reset files: ${error.message}`);
    }
  }

  /**
   * 检出文件（撤销工作区修改）
   */
  async checkoutFiles(files: string[]): Promise<void> {
    try {
      if (files.length === 0) return;

      await this.execGit(['checkout', 'HEAD', '--', ...files]);
    } catch (error) {
      throw new Error(`Failed to checkout files: ${error.message}`);
    }
  }
}
