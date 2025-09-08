#!/usr/bin/env node
import { Command } from 'commander';
import inquirer3 from 'inquirer';
import chalk5 from 'chalk';
import ora4 from 'ora';
import Table from 'cli-table3';
import boxen2 from 'boxen';
import gradient from 'gradient-string';
import figlet from 'figlet';
import simpleGit, { simpleGit as simpleGit$1 } from 'simple-git';
import { EventEmitter } from 'events';
import { exec } from 'child_process';
import { promisify } from 'util';
import Conf from 'conf';
import fuzzy from 'fuzzy';
import { ConsoleLogger, ConsoleTheme, PromptManager, PathUtils, CommandRunner, FileSystem, LoadingSpinner, ProgressBar } from '@ldesign/kit';

// src/errors/GitError.ts
var GitError = class _GitError extends Error {
  /** 错误类型 */
  type;
  /** 错误代码 */
  code;
  /** 原始错误 */
  originalError;
  /** 命令输出 */
  output;
  /** 错误发生时间 */
  timestamp;
  /**
   * 构造函数
   * @param type 错误类型
   * @param message 错误消息
   * @param originalError 原始错误
   * @param output 命令输出
   */
  constructor(type, message, originalError, output) {
    super(message);
    this.name = "GitError";
    this.type = type;
    this.code = type;
    this.originalError = originalError;
    this.output = output;
    this.timestamp = /* @__PURE__ */ new Date();
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, _GitError);
    }
  }
  /**
   * 获取格式化的错误信息
   */
  getFormattedMessage() {
    const parts = [
      `[${this.type}] ${this.message}`
    ];
    if (this.output) {
      parts.push(`Output: ${this.output}`);
    }
    if (this.originalError) {
      parts.push(`Original Error: ${this.originalError.message}`);
    }
    return parts.join("\n");
  }
  /**
   * 转换为 JSON 格式
   */
  toJSON() {
    return {
      name: this.name,
      type: this.type,
      code: this.code,
      message: this.message,
      output: this.output,
      timestamp: this.timestamp.toISOString(),
      originalError: this.originalError ? {
        name: this.originalError.name,
        message: this.originalError.message,
        stack: this.originalError.stack
      } : void 0
    };
  }
  /**
   * 创建仓库不存在错误
   */
  static repositoryNotFound(path, originalError) {
    return new _GitError(
      "REPOSITORY_NOT_FOUND" /* REPOSITORY_NOT_FOUND */,
      `Git repository not found at path: ${path}`,
      originalError
    );
  }
  /**
   * 创建仓库已存在错误
   */
  static repositoryExists(path) {
    return new _GitError(
      "REPOSITORY_EXISTS" /* REPOSITORY_EXISTS */,
      `Git repository already exists at path: ${path}`
    );
  }
  /**
   * 创建分支不存在错误
   */
  static branchNotFound(branchName) {
    return new _GitError(
      "BRANCH_NOT_FOUND" /* BRANCH_NOT_FOUND */,
      `Branch '${branchName}' not found`
    );
  }
  /**
   * 创建分支已存在错误
   */
  static branchExists(branchName) {
    return new _GitError(
      "BRANCH_EXISTS" /* BRANCH_EXISTS */,
      `Branch '${branchName}' already exists`
    );
  }
  /**
   * 创建远程仓库不存在错误
   */
  static remoteNotFound(remoteName) {
    return new _GitError(
      "REMOTE_NOT_FOUND" /* REMOTE_NOT_FOUND */,
      `Remote '${remoteName}' not found`
    );
  }
  /**
   * 创建命令执行失败错误
   */
  static commandFailed(command, output, originalError) {
    return new _GitError(
      "COMMAND_FAILED" /* COMMAND_FAILED */,
      `Git command failed: ${command}`,
      originalError,
      output
    );
  }
  /**
   * 创建网络错误
   */
  static networkError(message, originalError) {
    return new _GitError(
      "NETWORK_ERROR" /* NETWORK_ERROR */,
      `Network error: ${message}`,
      originalError
    );
  }
  /**
   * 创建权限错误
   */
  static permissionDenied(operation, path) {
    const message = path ? `Permission denied for ${operation} at path: ${path}` : `Permission denied for ${operation}`;
    return new _GitError(
      "PERMISSION_DENIED" /* PERMISSION_DENIED */,
      message
    );
  }
  /**
   * 创建合并冲突错误
   */
  static mergeConflict(conflictedFiles) {
    return new _GitError(
      "MERGE_CONFLICT" /* MERGE_CONFLICT */,
      `Merge conflict in files: ${conflictedFiles.join(", ")}`
    );
  }
  /**
   * 创建参数无效错误
   */
  static invalidArgument(argumentName, value) {
    return new _GitError(
      "INVALID_ARGUMENT" /* INVALID_ARGUMENT */,
      `Invalid argument '${argumentName}': ${value}`
    );
  }
  /**
   * 创建操作超时错误
   */
  static timeout(operation, timeoutMs) {
    return new _GitError(
      "TIMEOUT" /* TIMEOUT */,
      `Operation '${operation}' timed out after ${timeoutMs}ms`
    );
  }
  /**
   * 从原始错误创建 GitError
   */
  static fromError(error, type = "UNKNOWN" /* UNKNOWN */) {
    return new _GitError(
      type,
      error.message,
      error
    );
  }
};

// src/utils/validation.ts
function validateRepositoryPath(path) {
  if (!path || typeof path !== "string") {
    throw GitError.invalidArgument("path", path);
  }
  if (path.trim().length === 0) {
    throw GitError.invalidArgument("path", "Path cannot be empty");
  }
}
function validateBranchName(branchName) {
  if (!branchName || typeof branchName !== "string") {
    throw GitError.invalidArgument("branchName", branchName);
  }
  const trimmedName = branchName.trim();
  if (trimmedName.length === 0) {
    throw GitError.invalidArgument("branchName", "Branch name cannot be empty");
  }
  const invalidChars = /[~^:?*[\]\\]/;
  if (invalidChars.test(trimmedName)) {
    throw GitError.invalidArgument("branchName", "Branch name contains invalid characters");
  }
  if (trimmedName.startsWith("-") || trimmedName.endsWith(".")) {
    throw GitError.invalidArgument("branchName", "Branch name cannot start with - or end with .");
  }
  if (trimmedName.includes("..") || trimmedName.includes("@{")) {
    throw GitError.invalidArgument("branchName", "Branch name contains invalid sequences");
  }
}
function validateRemoteName(remoteName) {
  if (!remoteName || typeof remoteName !== "string") {
    throw GitError.invalidArgument("remoteName", remoteName);
  }
  const trimmedName = remoteName.trim();
  if (trimmedName.length === 0) {
    throw GitError.invalidArgument("remoteName", "Remote name cannot be empty");
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmedName)) {
    throw GitError.invalidArgument("remoteName", "Remote name can only contain letters, numbers, underscore and dash");
  }
}
function validateUrl(url) {
  if (!url || typeof url !== "string") {
    throw GitError.invalidArgument("url", url);
  }
  const trimmedUrl = url.trim();
  if (trimmedUrl.length === 0) {
    throw GitError.invalidArgument("url", "URL cannot be empty");
  }
  const urlPattern = /^(https?|git|ssh):\/\/|^git@/;
  if (!urlPattern.test(trimmedUrl)) {
    throw GitError.invalidArgument("url", "Invalid URL format");
  }
}
function validateCommitMessage(message) {
  if (!message || typeof message !== "string") {
    throw GitError.invalidArgument("message", message);
  }
  const trimmedMessage = message.trim();
  if (trimmedMessage.length === 0) {
    throw GitError.invalidArgument("message", "Commit message cannot be empty");
  }
  if (trimmedMessage.length > 72) {
    console.warn("Commit message is longer than 72 characters, consider shortening it");
  }
}
function validateFilePath(filePath) {
  if (!filePath || typeof filePath !== "string") {
    throw GitError.invalidArgument("filePath", filePath);
  }
  const trimmedPath = filePath.trim();
  if (trimmedPath.length === 0) {
    throw GitError.invalidArgument("filePath", "File path cannot be empty");
  }
}

// src/utils/command.ts
async function wrapGitOperation(operation) {
  try {
    const data = await operation();
    return {
      success: true,
      data
    };
  } catch (error) {
    const gitError = error instanceof GitError ? error : GitError.fromError(error);
    return {
      success: false,
      error: gitError.message,
      output: gitError.output
    };
  }
}
function handleSimpleGitError(error, operation) {
  const message = error.message || "Unknown error";
  const output = error.git?.output || error.stdout || error.stderr || "";
  if (message.includes("not a git repository")) {
    return new GitError(
      "REPOSITORY_NOT_FOUND" /* REPOSITORY_NOT_FOUND */,
      "Not a git repository",
      error,
      output
    );
  }
  if (message.includes("already exists")) {
    return new GitError(
      "REPOSITORY_EXISTS" /* REPOSITORY_EXISTS */,
      "Repository already exists",
      error,
      output
    );
  }
  if (message.includes("branch") && message.includes("not found")) {
    return new GitError(
      "BRANCH_NOT_FOUND" /* BRANCH_NOT_FOUND */,
      "Branch not found",
      error,
      output
    );
  }
  if (message.includes("remote") && message.includes("not found")) {
    return new GitError(
      "REMOTE_NOT_FOUND" /* REMOTE_NOT_FOUND */,
      "Remote not found",
      error,
      output
    );
  }
  if (message.includes("merge conflict") || message.includes("CONFLICT")) {
    return new GitError(
      "MERGE_CONFLICT" /* MERGE_CONFLICT */,
      "Merge conflict detected",
      error,
      output
    );
  }
  if (message.includes("permission denied") || message.includes("Permission denied")) {
    return new GitError(
      "PERMISSION_DENIED" /* PERMISSION_DENIED */,
      "Permission denied",
      error,
      output
    );
  }
  if (message.includes("network") || message.includes("connection") || message.includes("timeout")) {
    return new GitError(
      "NETWORK_ERROR" /* NETWORK_ERROR */,
      "Network error",
      error,
      output
    );
  }
  return new GitError(
    "COMMAND_FAILED" /* COMMAND_FAILED */,
    `Git ${operation} failed: ${message}`,
    error,
    output
  );
}
function parseGitStatus(statusOutput) {
  return {
    current: statusOutput.current || null,
    tracking: statusOutput.tracking || null,
    ahead: statusOutput.ahead || 0,
    behind: statusOutput.behind || 0,
    staged: statusOutput.staged || [],
    not_added: statusOutput.not_added || [],
    modified: statusOutput.modified || [],
    deleted: statusOutput.deleted || [],
    renamed: statusOutput.renamed || [],
    conflicted: statusOutput.conflicted || [],
    created: statusOutput.created || []
  };
}
function parseGitBranches(branchOutput) {
  if (!branchOutput) {
    return [];
  }
  let branches = [];
  if (branchOutput.all) {
    branches = branchOutput.all;
  } else if (Array.isArray(branchOutput)) {
    branches = branchOutput;
  } else if (branchOutput.branches) {
    branches = Object.keys(branchOutput.branches);
  }
  return branches.map((branch) => {
    const cleanName = branch.replace(/^\*\s*/, "").replace(/^remotes\//, "").trim();
    return {
      name: cleanName,
      current: branch.includes("*") || branch.startsWith("*"),
      remote: branch.includes("remotes/") || branch.includes("origin/")
    };
  });
}
function formatGitPath(filePath) {
  return filePath.replace(/\\/g, "/");
}
function isValidGitHash(hash) {
  if (!hash || typeof hash !== "string") {
    return false;
  }
  const hashPattern = /^[a-f0-9]{7,64}$/i;
  return hashPattern.test(hash.trim());
}
function isValidGitRef(ref) {
  if (!ref || typeof ref !== "string") {
    return false;
  }
  const trimmedRef = ref.trim();
  if (isValidGitHash(trimmedRef)) {
    return true;
  }
  const invalidChars = /[~^:?*[\]\\]/;
  if (invalidChars.test(trimmedRef)) {
    return false;
  }
  if (trimmedRef.startsWith("-") || trimmedRef.endsWith(".")) {
    return false;
  }
  if (trimmedRef.includes("..") || trimmedRef.includes("@{")) {
    return false;
  }
  return true;
}

// src/core/GitRepository.ts
var GitRepository = class {
  /** Simple Git 实例 */
  git;
  /** 仓库路径 */
  baseDir;
  /** 配置选项 */
  options;
  /** 事件监听器 */
  eventListeners = /* @__PURE__ */ new Map();
  /**
   * 构造函数
   * @param baseDir 仓库路径
   * @param options 配置选项
   */
  constructor(baseDir = process.cwd(), options = {}) {
    validateRepositoryPath(baseDir);
    this.baseDir = baseDir;
    this.options = { ...options };
    const gitOptions = {
      baseDir: this.baseDir,
      binary: this.options.binary || "git",
      maxConcurrentProcesses: this.options.maxConcurrentProcesses || 5,
      timeout: {
        block: this.options.timeout || 3e4
      }
    };
    this.git = simpleGit(gitOptions);
  }
  /**
   * 获取仓库路径
   */
  getBaseDir() {
    return this.baseDir;
  }
  /**
   * 获取配置选项
   */
  getOptions() {
    return { ...this.options };
  }
  /**
   * 添加事件监听器
   * @param event 事件类型
   * @param listener 监听器函数
   */
  on(event, listener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(listener);
  }
  /**
   * 移除事件监听器
   * @param event 事件类型
   * @param listener 监听器函数
   */
  off(event, listener) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  /**
   * 触发事件
   * @param event 事件类型
   * @param data 事件数据
   */
  emit(event, data) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(event, data);
        } catch (error) {
          console.error("Event listener error:", error);
        }
      });
    }
  }
  /**
   * 初始化 Git 仓库
   * @param bare 是否创建裸仓库
   * @returns 操作结果
   */
  async init(bare = false) {
    return wrapGitOperation(async () => {
      try {
        this.emit("init", { baseDir: this.baseDir, bare });
        await this.git.init(bare);
        this.emit("init", { success: true, baseDir: this.baseDir, bare });
      } catch (error) {
        this.emit("error", { operation: "init", error });
        throw handleSimpleGitError(error, "init");
      }
    });
  }
  /**
   * 克隆远程仓库
   * @param repoUrl 仓库 URL
   * @param options 克隆选项
   * @returns 操作结果
   */
  async clone(repoUrl, options = {}) {
    return wrapGitOperation(async () => {
      try {
        validateUrl(repoUrl);
        this.emit("clone", { repoUrl, options });
        const cloneOptions = [];
        if (options.depth) {
          cloneOptions.push("--depth", options.depth.toString());
        }
        if (options.branch) {
          cloneOptions.push("--branch", options.branch);
        }
        if (options.singleBranch) {
          cloneOptions.push("--single-branch");
        }
        if (options.recursive) {
          cloneOptions.push("--recursive");
        }
        const targetDir = options.targetDir || this.baseDir;
        await this.git.clone(repoUrl, targetDir, cloneOptions);
        this.emit("clone", { success: true, repoUrl, targetDir });
      } catch (error) {
        this.emit("error", { operation: "clone", error });
        throw handleSimpleGitError(error, "clone");
      }
    });
  }
  /**
   * 添加文件到暂存区
   * @param files 文件路径数组或单个文件路径
   * @returns 操作结果
   */
  async add(files) {
    return wrapGitOperation(async () => {
      try {
        const fileList = Array.isArray(files) ? files : [files];
        fileList.forEach((file) => {
          if (file !== ".") {
            validateFilePath(file);
          }
        });
        this.emit("add", { files: fileList });
        const formattedFiles = fileList.map(formatGitPath);
        await this.git.add(formattedFiles);
        this.emit("add", { success: true, files: fileList });
      } catch (error) {
        this.emit("error", { operation: "add", error });
        throw handleSimpleGitError(error, "add");
      }
    });
  }
  /**
   * 提交更改
   * @param message 提交消息
   * @param files 可选的文件列表
   * @returns 操作结果
   */
  async commit(message, files) {
    return wrapGitOperation(async () => {
      try {
        validateCommitMessage(message);
        this.emit("commit", { message, files });
        if (files && files.length > 0) {
          await this.add(files);
        }
        const result = await this.git.commit(message);
        const commitInfo = {
          hash: result.commit,
          date: (/* @__PURE__ */ new Date()).toISOString(),
          message,
          author_name: "",
          author_email: "",
          files: files || []
        };
        this.emit("commit", { success: true, commit: commitInfo });
        return commitInfo;
      } catch (error) {
        this.emit("error", { operation: "commit", error });
        throw handleSimpleGitError(error, "commit");
      }
    });
  }
  /**
   * 推送到远程仓库
   * @param options 推送选项
   * @returns 操作结果
   */
  async push(options = {}) {
    return wrapGitOperation(async () => {
      try {
        this.emit("push", { options });
        const remote = options.remote || "origin";
        const branch = options.branch;
        const pushOptions = {};
        if (options.force) {
          pushOptions["--force"] = null;
        }
        if (options.setUpstream) {
          pushOptions["--set-upstream"] = null;
        }
        if (options.tags) {
          pushOptions["--tags"] = null;
        }
        if (branch) {
          await this.git.push(remote, branch, pushOptions);
        } else {
          await this.git.push(remote, pushOptions);
        }
        this.emit("push", { success: true, remote, branch });
      } catch (error) {
        this.emit("error", { operation: "push", error });
        throw handleSimpleGitError(error, "push");
      }
    });
  }
  /**
   * 从远程仓库拉取
   * @param options 拉取选项
   * @returns 操作结果
   */
  async pull(options = {}) {
    return wrapGitOperation(async () => {
      try {
        this.emit("pull", { options });
        const remote = options.remote || "origin";
        const branch = options.branch;
        const pullOptions = {};
        if (options.rebase) {
          pullOptions["--rebase"] = null;
        }
        if (options.force) {
          pullOptions["--force"] = null;
        }
        if (branch) {
          await this.git.pull(remote, branch, pullOptions);
        } else {
          await this.git.pull(remote, pullOptions);
        }
        this.emit("pull", { success: true, remote, branch });
      } catch (error) {
        this.emit("error", { operation: "pull", error });
        throw handleSimpleGitError(error, "pull");
      }
    });
  }
  /**
   * 获取仓库状态
   * @returns 操作结果
   */
  async status() {
    return wrapGitOperation(async () => {
      try {
        this.emit("status");
        const statusResult = await this.git.status();
        const statusInfo = parseGitStatus(statusResult);
        this.emit("status", { success: true, status: statusInfo });
        return statusInfo;
      } catch (error) {
        this.emit("error", { operation: "status", error });
        throw handleSimpleGitError(error, "status");
      }
    });
  }
  /**
   * 获取提交日志
   * @param options 日志选项
   * @returns 操作结果
   */
  async log(options = {}) {
    return wrapGitOperation(async () => {
      try {
        this.emit("log", { options });
        const logOptions = {};
        if (options.maxCount) {
          logOptions.maxCount = options.maxCount;
        }
        if (options.from) {
          logOptions.from = options.from;
        }
        if (options.to) {
          logOptions.to = options.to;
        }
        if (options.file) {
          logOptions.file = options.file;
        }
        const logResult = await this.git.log(logOptions);
        const commits = logResult.all.map((commit) => ({
          hash: commit.hash,
          date: commit.date,
          message: commit.message,
          author_name: commit.author_name,
          author_email: commit.author_email,
          committer_name: commit.author_name,
          committer_email: commit.author_email
        }));
        this.emit("log", { success: true, commits });
        return commits;
      } catch (error) {
        this.emit("error", { operation: "log", error });
        throw handleSimpleGitError(error, "log");
      }
    });
  }
  /**
   * 检查是否为 Git 仓库
   * @returns 是否为 Git 仓库
   */
  async isRepo() {
    try {
      await this.git.checkIsRepo();
      return true;
    } catch {
      return false;
    }
  }
  /**
   * 执行原始 Git 命令
   * @param args Git 命令参数
   * @returns 操作结果
   */
  async executeGitCommand(args) {
    return wrapGitOperation(async () => {
      try {
        const result = await this.git.raw(args);
        return result;
      } catch (error) {
        throw new Error(error?.message || error);
      }
    });
  }
};

// src/core/GitBranch.ts
var GitBranch = class {
  /** Simple Git 实例 */
  git;
  /** 事件监听器 */
  eventListeners = /* @__PURE__ */ new Map();
  /**
   * 构造函数
   * @param git Simple Git 实例
   * @param baseDir 仓库路径
   */
  constructor(git, _baseDir) {
    this.git = git;
  }
  /**
   * 添加事件监听器
   * @param event 事件类型
   * @param listener 监听器函数
   */
  on(event, listener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(listener);
  }
  /**
   * 移除事件监听器
   * @param event 事件类型
   * @param listener 监听器函数
   */
  off(event, listener) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  /**
   * 触发事件
   * @param event 事件类型
   * @param data 事件数据
   */
  emit(event, data) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(event, data);
        } catch (error) {
          console.error("Event listener error:", error);
        }
      });
    }
  }
  /**
   * 创建新分支
   * @param branchName 分支名称
   * @param startPoint 起始点（可选）
   * @returns 操作结果
   */
  async create(branchName, startPoint) {
    return wrapGitOperation(async () => {
      try {
        validateBranchName(branchName);
        this.emit("branch", { action: "create", branchName, startPoint });
        if (startPoint) {
          await this.git.checkoutBranch(branchName, startPoint);
        } else {
          await this.git.checkoutLocalBranch(branchName);
        }
        this.emit("branch", {
          action: "create",
          success: true,
          branchName,
          startPoint
        });
      } catch (error) {
        this.emit("error", { operation: "branch-create", error });
        throw handleSimpleGitError(error, "branch-create");
      }
    });
  }
  /**
   * 切换分支
   * @param branchName 分支名称
   * @returns 操作结果
   */
  async checkout(branchName) {
    return wrapGitOperation(async () => {
      try {
        validateBranchName(branchName);
        this.emit("checkout", { branchName });
        await this.git.checkout(branchName);
        this.emit("checkout", { success: true, branchName });
      } catch (error) {
        this.emit("error", { operation: "checkout", error });
        throw handleSimpleGitError(error, "checkout");
      }
    });
  }
  /**
   * 删除分支
   * @param branchName 分支名称
   * @param force 是否强制删除
   * @returns 操作结果
   */
  async delete(branchName, force = false) {
    return wrapGitOperation(async () => {
      try {
        validateBranchName(branchName);
        this.emit("branch", { action: "delete", branchName, force });
        if (force) {
          await this.git.deleteLocalBranch(branchName, true);
        } else {
          await this.git.deleteLocalBranch(branchName);
        }
        this.emit("branch", {
          action: "delete",
          success: true,
          branchName,
          force
        });
      } catch (error) {
        this.emit("error", { operation: "branch-delete", error });
        throw handleSimpleGitError(error, "branch-delete");
      }
    });
  }
  /**
   * 列出所有分支
   * @param includeRemote 是否包含远程分支
   * @returns 操作结果
   */
  async list(includeRemote = false) {
    return wrapGitOperation(async () => {
      try {
        this.emit("branch", { action: "list", includeRemote });
        const branchResult = includeRemote ? await this.git.branch(["-a"]) : await this.git.branchLocal();
        const branches = parseGitBranches(branchResult);
        this.emit("branch", {
          action: "list",
          success: true,
          branches,
          includeRemote
        });
        return branches;
      } catch (error) {
        this.emit("error", { operation: "branch-list", error });
        throw handleSimpleGitError(error, "branch-list");
      }
    });
  }
  /**
   * 获取当前分支
   * @returns 操作结果
   */
  async current() {
    return wrapGitOperation(async () => {
      try {
        this.emit("branch", { action: "current" });
        const currentBranch = await this.git.revparse(["--abbrev-ref", "HEAD"]);
        this.emit("branch", {
          action: "current",
          success: true,
          currentBranch
        });
        return currentBranch.trim();
      } catch (error) {
        this.emit("error", { operation: "branch-current", error });
        throw handleSimpleGitError(error, "branch-current");
      }
    });
  }
  /**
   * 重命名分支
   * @param oldName 旧分支名
   * @param newName 新分支名
   * @returns 操作结果
   */
  async rename(oldName, newName) {
    return wrapGitOperation(async () => {
      try {
        validateBranchName(oldName);
        validateBranchName(newName);
        this.emit("branch", { action: "rename", oldName, newName });
        await this.git.branch(["-m", oldName, newName]);
        this.emit("branch", {
          action: "rename",
          success: true,
          oldName,
          newName
        });
      } catch (error) {
        this.emit("error", { operation: "branch-rename", error });
        throw handleSimpleGitError(error, "branch-rename");
      }
    });
  }
  /**
   * 合并分支
   * @param branchName 要合并的分支名
   * @param options 合并选项
   * @returns 操作结果
   */
  async merge(branchName, options = {}) {
    return wrapGitOperation(async () => {
      try {
        validateBranchName(branchName);
        this.emit("merge", { branchName, options });
        const mergeOptions = [];
        if (options.noFf) {
          mergeOptions.push("--no-ff");
        }
        if (options.squash) {
          mergeOptions.push("--squash");
        }
        await this.git.merge([branchName, ...mergeOptions]);
        this.emit("merge", {
          success: true,
          branchName,
          options
        });
      } catch (error) {
        this.emit("error", { operation: "merge", error });
        throw handleSimpleGitError(error, "merge");
      }
    });
  }
  /**
   * 检查分支是否存在
   * @param branchName 分支名称
   * @param includeRemote 是否包含远程分支
   * @returns 分支是否存在
   */
  async exists(branchName, includeRemote = false) {
    try {
      const branchesResult = await this.list(includeRemote);
      if (!branchesResult.success || !branchesResult.data) {
        return false;
      }
      return branchesResult.data.some(
        (branch) => branch.name === branchName || branch.name.endsWith(`/${branchName}`)
      );
    } catch {
      return false;
    }
  }
  /**
   * 获取分支的最后提交信息
   * @param branchName 分支名称
   * @returns 操作结果
   */
  async getLastCommit(branchName) {
    return wrapGitOperation(async () => {
      try {
        validateBranchName(branchName);
        const commitHash = await this.git.revparse([branchName]);
        return commitHash.trim();
      } catch (error) {
        throw handleSimpleGitError(error, "branch-last-commit");
      }
    });
  }
  /**
   * 比较两个分支
   * @param baseBranch 基础分支
   * @param compareBranch 比较分支
   * @returns 操作结果
   */
  async compare(baseBranch, compareBranch) {
    return wrapGitOperation(async () => {
      try {
        validateBranchName(baseBranch);
        validateBranchName(compareBranch);
        this.emit("diff", { baseBranch, compareBranch });
        const diffResult = await this.git.diff([`${baseBranch}...${compareBranch}`]);
        this.emit("diff", {
          success: true,
          baseBranch,
          compareBranch,
          diff: diffResult
        });
        return {
          baseBranch,
          compareBranch,
          diff: diffResult,
          hasChanges: diffResult.length > 0
        };
      } catch (error) {
        this.emit("error", { operation: "branch-compare", error });
        throw handleSimpleGitError(error, "branch-compare");
      }
    });
  }
};

// src/core/GitStatus.ts
var GitStatus = class {
  /** Simple Git 实例 */
  git;
  /** 事件监听器 */
  eventListeners = /* @__PURE__ */ new Map();
  /**
   * 构造函数
   * @param git Simple Git 实例
   * @param baseDir 仓库路径
   */
  constructor(git, _baseDir) {
    this.git = git;
  }
  /**
   * 添加事件监听器
   * @param event 事件类型
   * @param listener 监听器函数
   */
  on(event, listener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(listener);
  }
  /**
   * 移除事件监听器
   * @param event 事件类型
   * @param listener 监听器函数
   */
  off(event, listener) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  /**
   * 触发事件
   * @param event 事件类型
   * @param data 事件数据
   */
  emit(event, data) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(event, data);
        } catch (error) {
          console.error("Event listener error:", error);
        }
      });
    }
  }
  /**
   * 获取仓库状态
   * @returns 操作结果
   */
  async getStatus() {
    return wrapGitOperation(async () => {
      try {
        this.emit("status");
        const statusResult = await this.git.status();
        const statusInfo = parseGitStatus(statusResult);
        this.emit("status", { success: true, status: statusInfo });
        return statusInfo;
      } catch (error) {
        this.emit("error", { operation: "status", error });
        throw handleSimpleGitError(error, "status");
      }
    });
  }
  /**
   * 获取提交日志
   * @param options 日志选项
   * @returns 操作结果
   */
  async getLog(options = {}) {
    return wrapGitOperation(async () => {
      try {
        this.emit("log", { options });
        const logOptions = {};
        if (options.maxCount) {
          logOptions.maxCount = options.maxCount;
        }
        if (options.from) {
          if (!isValidGitRef(options.from)) {
            throw GitError.invalidArgument("from", options.from);
          }
          logOptions.from = options.from;
        }
        if (options.to) {
          if (!isValidGitRef(options.to)) {
            throw GitError.invalidArgument("to", options.to);
          }
          logOptions.to = options.to;
        }
        if (options.file) {
          validateFilePath(options.file);
          logOptions.file = options.file;
        }
        if (options.author) {
          logOptions.author = options.author;
        }
        if (options.since) {
          logOptions.since = options.since;
        }
        if (options.until) {
          logOptions.until = options.until;
        }
        const logResult = await this.git.log(logOptions);
        const commits = logResult.all.map((commit) => ({
          hash: commit.hash,
          date: commit.date,
          message: commit.message,
          author_name: commit.author_name,
          author_email: commit.author_email,
          committer_name: commit.author_name,
          committer_email: commit.author_email
        }));
        this.emit("log", { success: true, commits, options });
        return commits;
      } catch (error) {
        this.emit("error", { operation: "log", error });
        throw handleSimpleGitError(error, "log");
      }
    });
  }
  /**
   * 获取文件差异
   * @param file 文件路径（可选）
   * @param cached 是否查看暂存区差异
   * @returns 操作结果
   */
  async getDiff(file, cached = false) {
    return wrapGitOperation(async () => {
      try {
        if (file) {
          validateFilePath(file);
        }
        this.emit("diff", { file, cached });
        const diffOptions = [];
        if (cached) {
          diffOptions.push("--cached");
        }
        if (file) {
          diffOptions.push(file);
        }
        const diffResult = await this.git.diff(diffOptions);
        this.emit("diff", { success: true, file, cached, diff: diffResult });
        return diffResult;
      } catch (error) {
        this.emit("error", { operation: "diff", error });
        throw handleSimpleGitError(error, "diff");
      }
    });
  }
  /**
   * 比较两个提交之间的差异
   * @param fromCommit 起始提交
   * @param toCommit 结束提交
   * @param file 文件路径（可选）
   * @returns 操作结果
   */
  async getDiffBetweenCommits(fromCommit, toCommit, file) {
    return wrapGitOperation(async () => {
      try {
        if (!isValidGitRef(fromCommit)) {
          throw GitError.invalidArgument("fromCommit", fromCommit);
        }
        if (!isValidGitRef(toCommit)) {
          throw GitError.invalidArgument("toCommit", toCommit);
        }
        if (file) {
          validateFilePath(file);
        }
        this.emit("diff", { fromCommit, toCommit, file });
        const diffOptions = [`${fromCommit}..${toCommit}`];
        if (file) {
          diffOptions.push("--", file);
        }
        const diffResult = await this.git.diff(diffOptions);
        this.emit("diff", {
          success: true,
          fromCommit,
          toCommit,
          file,
          diff: diffResult
        });
        return diffResult;
      } catch (error) {
        this.emit("error", { operation: "diff-commits", error });
        throw handleSimpleGitError(error, "diff-commits");
      }
    });
  }
  /**
   * 显示提交详情
   * @param commitHash 提交哈希
   * @returns 操作结果
   */
  async show(commitHash) {
    return wrapGitOperation(async () => {
      try {
        if (!isValidGitHash(commitHash)) {
          throw GitError.invalidArgument("commitHash", commitHash);
        }
        this.emit("show", { commitHash });
        const showResult = await this.git.show([commitHash]);
        this.emit("show", { success: true, commitHash, content: showResult });
        return showResult;
      } catch (error) {
        this.emit("error", { operation: "show", error });
        throw handleSimpleGitError(error, "show");
      }
    });
  }
  /**
   * 获取文件的提交历史
   * @param filePath 文件路径
   * @param maxCount 最大条数
   * @returns 操作结果
   */
  async getFileHistory(filePath, maxCount) {
    return wrapGitOperation(async () => {
      try {
        validateFilePath(filePath);
        this.emit("log", { file: filePath, maxCount });
        const logOptions = {
          file: filePath
        };
        if (maxCount) {
          logOptions.maxCount = maxCount;
        }
        const logResult = await this.git.log(logOptions);
        const commits = logResult.all.map((commit) => ({
          hash: commit.hash,
          date: commit.date,
          message: commit.message,
          author_name: commit.author_name,
          author_email: commit.author_email,
          committer_name: commit.author_name,
          committer_email: commit.author_email,
          files: [filePath]
        }));
        this.emit("log", {
          success: true,
          file: filePath,
          commits,
          maxCount
        });
        return commits;
      } catch (error) {
        this.emit("error", { operation: "file-history", error });
        throw handleSimpleGitError(error, "file-history");
      }
    });
  }
  /**
   * 获取统计信息
   * @param fromCommit 起始提交（可选）
   * @param toCommit 结束提交（可选）
   * @returns 操作结果
   */
  async getStats(fromCommit, toCommit) {
    return wrapGitOperation(async () => {
      try {
        if (fromCommit && !isValidGitRef(fromCommit)) {
          throw GitError.invalidArgument("fromCommit", fromCommit);
        }
        if (toCommit && !isValidGitRef(toCommit)) {
          throw GitError.invalidArgument("toCommit", toCommit);
        }
        const diffArgs = [];
        if (fromCommit && toCommit) {
          diffArgs.push(`${fromCommit}..${toCommit}`);
        } else if (fromCommit) {
          diffArgs.push(fromCommit);
        }
        diffArgs.push("--numstat");
        const numstat = await this.git.diff(diffArgs);
        const files = [];
        let insertions = 0;
        let deletions = 0;
        const lines = numstat.split("\n").filter(Boolean);
        for (const line of lines) {
          const match = line.match(/^(\d+|-)\t(\d+|-)\t(.+)$/);
          if (!match) continue;
          const add = match[1] === "-" ? 0 : parseInt(match[1], 10);
          const del = match[2] === "-" ? 0 : parseInt(match[2], 10);
          const file = match[3];
          files.push({ file, additions: add, deletions: del });
          insertions += add;
          deletions += del;
        }
        const result = {
          fromCommit,
          toCommit,
          files,
          summary: {
            filesChanged: files.length,
            insertions,
            deletions
          },
          raw: numstat
        };
        return result;
      } catch (error) {
        this.emit("error", { operation: "stats", error });
        throw handleSimpleGitError(error, "stats");
      }
    });
  }
  /**
   * 检查工作目录是否干净
   * @returns 工作目录是否干净
   */
  async isClean() {
    try {
      const statusResult = await this.getStatus();
      if (!statusResult.success || !statusResult.data) {
        return false;
      }
      const status = statusResult.data;
      return status.staged.length === 0 && status.not_added.length === 0 && status.modified.length === 0 && status.deleted.length === 0 && status.conflicted.length === 0 && status.created.length === 0;
    } catch {
      return false;
    }
  }
  /**
   * 获取当前 HEAD 指向的提交
   * @returns 操作结果
   */
  async getHead() {
    return wrapGitOperation(async () => {
      try {
        const headCommit = await this.git.revparse(["HEAD"]);
        return headCommit.trim();
      } catch (error) {
        throw handleSimpleGitError(error, "get-head");
      }
    });
  }
};

// src/core/GitRemote.ts
var GitRemote = class {
  /** Simple Git 实例 */
  git;
  /** 事件监听器 */
  eventListeners = /* @__PURE__ */ new Map();
  /**
   * 构造函数
   * @param git Simple Git 实例
   * @param baseDir 仓库路径
   */
  constructor(git, _baseDir) {
    this.git = git;
  }
  /**
   * 添加事件监听器
   * @param event 事件类型
   * @param listener 监听器函数
   */
  on(event, listener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(listener);
  }
  /**
   * 移除事件监听器
   * @param event 事件类型
   * @param listener 监听器函数
   */
  off(event, listener) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  /**
   * 触发事件
   * @param event 事件类型
   * @param data 事件数据
   */
  emit(event, data) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(event, data);
        } catch (error) {
          console.error("Event listener error:", error);
        }
      });
    }
  }
  /**
   * 添加远程仓库
   * @param name 远程仓库名称
   * @param url 远程仓库 URL
   * @returns 操作结果
   */
  async add(name, url) {
    return wrapGitOperation(async () => {
      try {
        validateRemoteName(name);
        validateUrl(url);
        this.emit("remote", { action: "add", name, url });
        await this.git.addRemote(name, url);
        this.emit("remote", {
          action: "add",
          success: true,
          name,
          url
        });
      } catch (error) {
        this.emit("error", { operation: "remote-add", error });
        throw handleSimpleGitError(error, "remote-add");
      }
    });
  }
  /**
   * 删除远程仓库
   * @param name 远程仓库名称
   * @returns 操作结果
   */
  async remove(name) {
    return wrapGitOperation(async () => {
      try {
        validateRemoteName(name);
        this.emit("remote", { action: "remove", name });
        await this.git.removeRemote(name);
        this.emit("remote", {
          action: "remove",
          success: true,
          name
        });
      } catch (error) {
        this.emit("error", { operation: "remote-remove", error });
        throw handleSimpleGitError(error, "remote-remove");
      }
    });
  }
  /**
   * 列出所有远程仓库
   * @param verbose 是否显示详细信息
   * @returns 操作结果
   */
  async list(verbose = false) {
    return wrapGitOperation(async () => {
      try {
        this.emit("remote", { action: "list", verbose });
        const remotes = verbose ? await this.git.getRemotes(true) : await this.git.getRemotes(false);
        const remoteInfos = remotes.map((remote) => ({
          name: remote.name,
          refs: {
            fetch: remote.refs?.fetch || "",
            push: remote.refs?.push || ""
          }
        }));
        this.emit("remote", {
          action: "list",
          success: true,
          remotes: remoteInfos,
          verbose
        });
        return remoteInfos;
      } catch (error) {
        this.emit("error", { operation: "remote-list", error });
        throw handleSimpleGitError(error, "remote-list");
      }
    });
  }
  /**
   * 获取远程仓库 URL
   * @param name 远程仓库名称
   * @returns 操作结果
   */
  async getUrl(name) {
    return wrapGitOperation(async () => {
      try {
        validateRemoteName(name);
        const remotes = await this.git.getRemotes(true);
        const remote = remotes.find((r) => r.name === name);
        if (!remote) {
          throw GitError.remoteNotFound(name);
        }
        return remote.refs?.fetch || "";
      } catch (error) {
        this.emit("error", { operation: "remote-get-url", error });
        throw handleSimpleGitError(error, "remote-get-url");
      }
    });
  }
  /**
   * 设置远程仓库 URL
   * @param name 远程仓库名称
   * @param url 新的 URL
   * @returns 操作结果
   */
  async setUrl(name, url) {
    return wrapGitOperation(async () => {
      try {
        validateRemoteName(name);
        validateUrl(url);
        this.emit("remote", { action: "set-url", name, url });
        await this.git.remote(["set-url", name, url]);
        this.emit("remote", {
          action: "set-url",
          success: true,
          name,
          url
        });
      } catch (error) {
        this.emit("error", { operation: "remote-set-url", error });
        throw handleSimpleGitError(error, "remote-set-url");
      }
    });
  }
  /**
   * 推送到远程仓库
   * @param options 推送选项
   * @returns 操作结果
   */
  async push(options = {}) {
    return wrapGitOperation(async () => {
      try {
        const remote = options.remote || "origin";
        const branch = options.branch;
        if (options.remote) {
          validateRemoteName(options.remote);
        }
        if (options.branch) {
          validateBranchName(options.branch);
        }
        this.emit("push", { options });
        const pushOptions = {};
        if (options.force) {
          pushOptions["--force"] = null;
        }
        if (options.setUpstream) {
          pushOptions["--set-upstream"] = null;
        }
        if (options.tags) {
          pushOptions["--tags"] = null;
        }
        if (branch) {
          await this.git.push(remote, branch, pushOptions);
        } else {
          await this.git.push(remote, pushOptions);
        }
        this.emit("push", { success: true, remote, branch, options });
      } catch (error) {
        this.emit("error", { operation: "push", error });
        throw handleSimpleGitError(error, "push");
      }
    });
  }
  /**
   * 从远程仓库拉取
   * @param options 拉取选项
   * @returns 操作结果
   */
  async pull(options = {}) {
    return wrapGitOperation(async () => {
      try {
        const remote = options.remote || "origin";
        const branch = options.branch;
        if (options.remote) {
          validateRemoteName(options.remote);
        }
        if (options.branch) {
          validateBranchName(options.branch);
        }
        this.emit("pull", { options });
        const pullOptions = {};
        if (options.rebase) {
          pullOptions["--rebase"] = null;
        }
        if (options.force) {
          pullOptions["--force"] = null;
        }
        if (branch) {
          await this.git.pull(remote, branch, pullOptions);
        } else {
          await this.git.pull(remote, pullOptions);
        }
        this.emit("pull", { success: true, remote, branch, options });
      } catch (error) {
        this.emit("error", { operation: "pull", error });
        throw handleSimpleGitError(error, "pull");
      }
    });
  }
  /**
   * 获取远程分支
   * @param remoteName 远程仓库名称
   * @returns 操作结果
   */
  async fetch(remoteName) {
    return wrapGitOperation(async () => {
      try {
        if (remoteName) {
          validateRemoteName(remoteName);
        }
        this.emit("remote", { action: "fetch", remoteName });
        if (remoteName) {
          await this.git.fetch(remoteName);
        } else {
          await this.git.fetch();
        }
        this.emit("remote", {
          action: "fetch",
          success: true,
          remoteName
        });
      } catch (error) {
        this.emit("error", { operation: "fetch", error });
        throw handleSimpleGitError(error, "fetch");
      }
    });
  }
  /**
   * 检查远程仓库是否存在
   * @param name 远程仓库名称
   * @returns 远程仓库是否存在
   */
  async exists(name) {
    try {
      const remotesResult = await this.list();
      if (!remotesResult.success || !remotesResult.data) {
        return false;
      }
      return remotesResult.data.some((remote) => remote.name === name);
    } catch {
      return false;
    }
  }
  /**
   * 重命名远程仓库
   * @param oldName 旧名称
   * @param newName 新名称
   * @returns 操作结果
   */
  async rename(oldName, newName) {
    return wrapGitOperation(async () => {
      try {
        validateRemoteName(oldName);
        validateRemoteName(newName);
        this.emit("remote", { action: "rename", oldName, newName });
        await this.git.remote(["rename", oldName, newName]);
        this.emit("remote", {
          action: "rename",
          success: true,
          oldName,
          newName
        });
      } catch (error) {
        this.emit("error", { operation: "remote-rename", error });
        throw handleSimpleGitError(error, "remote-rename");
      }
    });
  }
};
var BaseGitOperation = class extends EventEmitter {
  git;
  baseDir;
  options;
  constructor(baseDir, options) {
    super();
    this.baseDir = baseDir || process.cwd();
    this.options = options || {};
    this.git = simpleGit$1({
      baseDir: this.baseDir,
      binary: this.options.binary || "git",
      maxConcurrentProcesses: this.options.maxConcurrentProcesses || 5,
      timeout: {
        block: this.options.timeout || 3e4
      }
    });
  }
  /**
   * 执行 Git 命令
   * @param args - Git 命令参数
   * @returns 操作结果
   */
  async executeGitCommand(args) {
    try {
      const result = await this.git.raw(args);
      return {
        success: true,
        data: result,
        output: result
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || error,
        output: error?.message || error
      };
    }
  }
  /**
   * 获取基础目录
   */
  getBaseDir() {
    return this.baseDir;
  }
  /**
   * 获取配置选项
   */
  getOptions() {
    return { ...this.options };
  }
};

// src/core/GitStash.ts
var GitStash = class extends BaseGitOperation {
  constructor(baseDir, options) {
    super(baseDir, options);
  }
  /**
   * 保存当前工作目录的更改到 stash
   * @param message - stash 消息
   * @param includeUntracked - 是否包含未跟踪的文件
   * @returns 操作结果
   */
  async save(message, includeUntracked = false) {
    try {
      const args = ["stash", "push"];
      if (message) {
        args.push("-m", message);
      }
      if (includeUntracked) {
        args.push("-u");
      }
      const result = await this.executeGitCommand(args);
      if (result.success) {
        const stashList = await this.list();
        const latestStash = stashList.data?.[0];
        this.emit("stash-save", { message, includeUntracked, stash: latestStash });
        return {
          success: true,
          data: latestStash,
          output: result.output
        };
      }
      return result;
    } catch (error) {
      const gitError = new GitError(
        "UNKNOWN" /* UNKNOWN */,
        `Stash \u4FDD\u5B58\u5931\u8D25: ${error?.message || error}`,
        error
      );
      this.emit("error", gitError);
      throw gitError;
    }
  }
  /**
   * 恢复最新的 stash 并删除它
   * @param index - stash 索引，默认为 0（最新）
   * @returns 操作结果
   */
  async pop(index = 0) {
    try {
      const stashRef = index === 0 ? "stash@{0}" : `stash@{${index}}`;
      const result = await this.executeGitCommand(["stash", "pop", stashRef]);
      if (result.success) {
        this.emit("stash-pop", { index });
      }
      return result;
    } catch (error) {
      const gitError = new GitError(
        "UNKNOWN" /* UNKNOWN */,
        `Stash \u6062\u590D\u5931\u8D25: ${error?.message || error}`,
        error
      );
      this.emit("error", gitError);
      throw gitError;
    }
  }
  /**
   * 应用 stash 但不删除它
   * @param index - stash 索引，默认为 0（最新）
   * @returns 操作结果
   */
  async apply(index = 0) {
    try {
      const stashRef = index === 0 ? "stash@{0}" : `stash@{${index}}`;
      const result = await this.executeGitCommand(["stash", "apply", stashRef]);
      if (result.success) {
        this.emit("stash-apply", { index });
      }
      return result;
    } catch (error) {
      const gitError = new GitError(
        "UNKNOWN" /* UNKNOWN */,
        `Stash \u5E94\u7528\u5931\u8D25: ${error?.message || error}`,
        error
      );
      this.emit("error", gitError);
      throw gitError;
    }
  }
  /**
   * 列出所有 stash
   * @returns stash 列表
   */
  async list() {
    try {
      const result = await this.executeGitCommand(["stash", "list", "--pretty=format:%gd|%s|%cr|%H"]);
      if (result.success && result.output) {
        const stashes = result.output.split("\n").filter((line) => line.trim()).map((line, index) => {
          const [ref, message, date, hash] = line.split("|");
          return {
            index,
            message: message || "WIP on branch",
            branch: ref.match(/stash@\{(\d+)\}/)?.[1] || "0",
            hash: hash || "",
            date: date || ""
          };
        });
        return {
          success: true,
          data: stashes,
          output: result.output
        };
      }
      return {
        success: true,
        data: [],
        output: result.output
      };
    } catch (error) {
      const gitError = new GitError(
        "UNKNOWN" /* UNKNOWN */,
        `\u83B7\u53D6 stash \u5217\u8868\u5931\u8D25: ${error?.message || error}`,
        error
      );
      this.emit("error", gitError);
      throw gitError;
    }
  }
  /**
   * 删除指定的 stash
   * @param index - stash 索引
   * @returns 操作结果
   */
  async drop(index = 0) {
    try {
      const stashRef = index === 0 ? "stash@{0}" : `stash@{${index}}`;
      const result = await this.executeGitCommand(["stash", "drop", stashRef]);
      if (result.success) {
        this.emit("stash-drop", { index });
      }
      return result;
    } catch (error) {
      const gitError = new GitError(
        "UNKNOWN" /* UNKNOWN */,
        `\u5220\u9664 stash \u5931\u8D25: ${error?.message || error}`,
        error
      );
      this.emit("error", gitError);
      throw gitError;
    }
  }
  /**
   * 清空所有 stash
   * @returns 操作结果
   */
  async clear() {
    try {
      const result = await this.executeGitCommand(["stash", "clear"]);
      if (result.success) {
        this.emit("stash-clear", {});
      }
      return result;
    } catch (error) {
      const gitError = new GitError(
        "UNKNOWN" /* UNKNOWN */,
        `\u6E05\u7A7A stash \u5931\u8D25: ${error?.message || error}`,
        error
      );
      this.emit("error", gitError);
      throw gitError;
    }
  }
  /**
   * 检查是否有 stash
   * @returns 是否有 stash
   */
  async hasStash() {
    try {
      const stashList = await this.list();
      return stashList.success && (stashList.data?.length || 0) > 0;
    } catch (error) {
      return false;
    }
  }
  /**
   * 显示 stash 的详细信息
   * @param index - stash 索引
   * @returns stash 详细信息
   */
  async show(index = 0) {
    try {
      const stashRef = index === 0 ? "stash@{0}" : `stash@{${index}}`;
      const result = await this.executeGitCommand(["stash", "show", "-p", stashRef]);
      return result;
    } catch (error) {
      const gitError = new GitError(
        "UNKNOWN" /* UNKNOWN */,
        `\u663E\u793A stash \u8BE6\u60C5\u5931\u8D25: ${error?.message || error}`,
        error
      );
      this.emit("error", gitError);
      throw gitError;
    }
  }
};

// src/utils/ConflictResolver.ts
var ConflictResolver = class {
  git;
  constructor(git) {
    this.git = git;
  }
  /**
   * 检测是否存在合并冲突
   * @returns 是否有冲突
   */
  async hasConflicts() {
    try {
      const status = await this.git.getStatus();
      return status.success && (status.data?.conflicted?.length || 0) > 0;
    } catch (error) {
      return false;
    }
  }
  /**
   * 获取冲突文件列表
   * @returns 冲突文件信息
   */
  async getConflictFiles() {
    try {
      const status = await this.git.getStatus();
      if (!status.success || !status.data) {
        return {
          success: false,
          error: "\u65E0\u6CD5\u83B7\u53D6\u4ED3\u5E93\u72B6\u6001"
        };
      }
      const conflictFiles = [];
      for (const file of status.data.conflicted || []) {
        const conflictInfo = await this.analyzeConflictFile(file);
        conflictFiles.push(conflictInfo);
      }
      return {
        success: true,
        data: conflictFiles
      };
    } catch (error) {
      return {
        success: false,
        error: `\u83B7\u53D6\u51B2\u7A81\u6587\u4EF6\u5931\u8D25: ${error?.message || error}`
      };
    }
  }
  /**
   * 分析单个冲突文件
   * @param filePath - 文件路径
   * @returns 冲突文件信息
   */
  async analyzeConflictFile(filePath) {
    try {
      const fs = await import('fs/promises');
      const content = await fs.readFile(filePath, "utf-8");
      const hasConflictMarkers = /^<{7}|^={7}|^>{7}/m.test(content);
      return {
        path: filePath,
        status: "both_modified",
        // 简化处理，实际可以更详细分析
        conflictMarkers: hasConflictMarkers
      };
    } catch (error) {
      return {
        path: filePath,
        status: "both_modified",
        conflictMarkers: false
      };
    }
  }
  /**
   * 自动解决冲突
   * @param options - 解决选项
   * @returns 解决结果
   */
  async resolveConflicts(options = {}) {
    try {
      const conflictFiles = await this.getConflictFiles();
      if (!conflictFiles.success || !conflictFiles.data) {
        return {
          resolved: false,
          conflictFiles: [],
          unresolvedFiles: [],
          strategy: "none",
          message: "\u65E0\u6CD5\u83B7\u53D6\u51B2\u7A81\u6587\u4EF6\u4FE1\u606F"
        };
      }
      if (conflictFiles.data.length === 0) {
        return {
          resolved: true,
          conflictFiles: [],
          unresolvedFiles: [],
          strategy: "none",
          message: "\u6CA1\u6709\u51B2\u7A81\u9700\u8981\u89E3\u51B3"
        };
      }
      const { strategy = "manual", files, autoResolve = false } = options;
      switch (strategy) {
        case "ours":
          await this.resolveWithStrategy("ours", files);
          break;
        case "theirs":
          await this.resolveWithStrategy("theirs", files);
          break;
        case "manual":
          if (!autoResolve) {
            return {
              resolved: false,
              conflictFiles: conflictFiles.data,
              unresolvedFiles: conflictFiles.data.map((f) => f.path),
              strategy: "manual",
              message: "\u9700\u8981\u624B\u52A8\u89E3\u51B3\u51B2\u7A81"
            };
          }
          break;
      }
      const remainingConflicts = await this.getConflictFiles();
      const hasRemaining = remainingConflicts.success && (remainingConflicts.data?.length || 0) > 0;
      return {
        resolved: !hasRemaining,
        conflictFiles: conflictFiles.data,
        unresolvedFiles: hasRemaining ? remainingConflicts.data?.map((f) => f.path) || [] : [],
        strategy,
        message: hasRemaining ? "\u90E8\u5206\u51B2\u7A81\u672A\u89E3\u51B3" : "\u6240\u6709\u51B2\u7A81\u5DF2\u89E3\u51B3"
      };
    } catch (error) {
      return {
        resolved: false,
        conflictFiles: [],
        unresolvedFiles: [],
        strategy: "error",
        message: `\u89E3\u51B3\u51B2\u7A81\u5931\u8D25: ${error?.message || error}`
      };
    }
  }
  /**
   * 使用指定策略解决冲突
   * @param strategy - 解决策略
   * @param files - 指定文件列表
   */
  async resolveWithStrategy(strategy, files) {
    const conflictFiles = await this.getConflictFiles();
    if (!conflictFiles.success || !conflictFiles.data) {
      throw new Error("\u65E0\u6CD5\u83B7\u53D6\u51B2\u7A81\u6587\u4EF6");
    }
    const targetFiles = files || conflictFiles.data.map((f) => f.path);
    for (const file of targetFiles) {
      try {
        if (strategy === "ours") {
          await this.git.repository.executeGitCommand(["checkout", "--ours", file]);
        } else {
          await this.git.repository.executeGitCommand(["checkout", "--theirs", file]);
        }
        await this.git.add(file);
      } catch (error) {
        console.warn(`\u89E3\u51B3\u6587\u4EF6 ${file} \u51B2\u7A81\u5931\u8D25:`, error?.message || error);
      }
    }
  }
  /**
   * 获取冲突解决建议
   * @param conflictFiles - 冲突文件列表
   * @returns 解决建议
   */
  getResolutionSuggestions(conflictFiles) {
    const suggestions = [];
    if (conflictFiles.length === 0) {
      return ["\u6CA1\u6709\u51B2\u7A81\u9700\u8981\u89E3\u51B3"];
    }
    suggestions.push("\u{1F50D} \u68C0\u6D4B\u5230\u4EE5\u4E0B\u51B2\u7A81\u6587\u4EF6:");
    conflictFiles.forEach((file) => {
      suggestions.push(`  - ${file.path} (${file.status})`);
    });
    suggestions.push("");
    suggestions.push("\u{1F4A1} \u89E3\u51B3\u5EFA\u8BAE:");
    suggestions.push("1. \u624B\u52A8\u7F16\u8F91\u51B2\u7A81\u6587\u4EF6\uFF0C\u89E3\u51B3\u51B2\u7A81\u6807\u8BB0 (<<<<<<<, =======, >>>>>>>)");
    suggestions.push("2. \u6216\u4F7F\u7528\u4EE5\u4E0B\u7B56\u7565\u81EA\u52A8\u89E3\u51B3:");
    suggestions.push("   - \u4FDD\u7559\u672C\u5730\u66F4\u6539: ldesign-git resolve --ours");
    suggestions.push("   - \u4FDD\u7559\u8FDC\u7A0B\u66F4\u6539: ldesign-git resolve --theirs");
    suggestions.push("3. \u89E3\u51B3\u540E\u4F7F\u7528: ldesign-git add <\u6587\u4EF6> \u6807\u8BB0\u4E3A\u5DF2\u89E3\u51B3");
    suggestions.push("4. \u6700\u540E\u6267\u884C: ldesign-git commit \u5B8C\u6210\u5408\u5E76");
    return suggestions;
  }
  /**
   * 显示冲突文件的详细信息
   * @param filePath - 文件路径
   * @returns 冲突详情
   */
  async showConflictDetails(filePath) {
    try {
      const fs = await import('fs/promises');
      const content = await fs.readFile(filePath, "utf-8");
      const conflictSections = this.extractConflictSections(content);
      return {
        success: true,
        data: conflictSections,
        output: content
      };
    } catch (error) {
      return {
        success: false,
        error: `\u8BFB\u53D6\u6587\u4EF6\u5931\u8D25: ${error?.message || error}`
      };
    }
  }
  /**
   * 提取冲突部分
   * @param content - 文件内容
   * @returns 冲突部分信息
   */
  extractConflictSections(content) {
    const lines = content.split("\n");
    const conflicts = [];
    let inConflict = false;
    let conflictSection = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith("<<<<<<<")) {
        inConflict = true;
        conflictSection = [line];
      } else if (line.startsWith(">>>>>>>") && inConflict) {
        conflictSection.push(line);
        conflicts.push(`\u51B2\u7A81 ${conflicts.length + 1} (\u884C ${i - conflictSection.length + 2}-${i + 1}):
${conflictSection.join("\n")}`);
        inConflict = false;
        conflictSection = [];
      } else if (inConflict) {
        conflictSection.push(line);
      }
    }
    return conflicts.length > 0 ? conflicts.join("\n\n") : "\u672A\u627E\u5230\u51B2\u7A81\u6807\u8BB0";
  }
  /**
   * 中止合并操作
   * @returns 操作结果
   */
  async abortMerge() {
    try {
      const result = await this.git.repository.executeGitCommand(["merge", "--abort"]);
      return result;
    } catch (error) {
      return {
        success: false,
        error: `\u4E2D\u6B62\u5408\u5E76\u5931\u8D25: ${error?.message || error}`
      };
    }
  }
  /**
   * 继续合并操作
   * @returns 操作结果
   */
  async continueMerge() {
    try {
      const hasConflicts = await this.hasConflicts();
      if (hasConflicts) {
        return {
          success: false,
          error: "\u4ECD\u6709\u672A\u89E3\u51B3\u7684\u51B2\u7A81\uFF0C\u65E0\u6CD5\u7EE7\u7EED\u5408\u5E76"
        };
      }
      const result = await this.git.repository.executeGitCommand(["commit", "--no-edit"]);
      return result;
    } catch (error) {
      return {
        success: false,
        error: `\u7EE7\u7EED\u5408\u5E76\u5931\u8D25: ${error?.message || error}`
      };
    }
  }
};

// src/utils/ProgressIndicator.ts
var ProgressIndicator = class {
  steps = /* @__PURE__ */ new Map();
  options;
  spinnerInterval = null;
  spinnerFrames = ["\u280B", "\u2819", "\u2839", "\u2838", "\u283C", "\u2834", "\u2826", "\u2827", "\u2807", "\u280F"];
  spinnerIndex = 0;
  constructor(options = {}) {
    this.options = {
      showTimestamp: false,
      showDuration: true,
      showSpinner: true,
      clearOnComplete: false,
      ...options
    };
  }
  /**
   * 添加进度步骤
   * @param step - 步骤信息
   */
  addStep(step) {
    this.steps.set(step.id, {
      ...step,
      status: "pending"
    });
  }
  /**
   * 添加多个步骤
   * @param steps - 步骤列表
   */
  addSteps(steps) {
    steps.forEach((step) => this.addStep(step));
  }
  /**
   * 开始执行步骤
   * @param stepId - 步骤ID
   */
  startStep(stepId) {
    const step = this.steps.get(stepId);
    if (!step) {
      throw new Error(`\u6B65\u9AA4 ${stepId} \u4E0D\u5B58\u5728`);
    }
    this.stopSpinner();
    step.status = "running";
    step.startTime = Date.now();
    this.displayStep(step);
    if (this.options.showSpinner) {
      this.startSpinner(step);
    }
  }
  /**
   * 完成步骤
   * @param stepId - 步骤ID
   * @param message - 可选的完成消息
   */
  completeStep(stepId, message) {
    const step = this.steps.get(stepId);
    if (!step) {
      throw new Error(`\u6B65\u9AA4 ${stepId} \u4E0D\u5B58\u5728`);
    }
    this.stopSpinner();
    step.status = "completed";
    step.endTime = Date.now();
    if (message) {
      step.description = message;
    }
    this.displayStep(step, true);
  }
  /**
   * 步骤失败
   * @param stepId - 步骤ID
   * @param error - 错误信息
   */
  failStep(stepId, error) {
    const step = this.steps.get(stepId);
    if (!step) {
      throw new Error(`\u6B65\u9AA4 ${stepId} \u4E0D\u5B58\u5728`);
    }
    this.stopSpinner();
    step.status = "failed";
    step.endTime = Date.now();
    step.error = error;
    this.displayStep(step, true);
  }
  /**
   * 跳过步骤
   * @param stepId - 步骤ID
   * @param reason - 跳过原因
   */
  skipStep(stepId, reason) {
    const step = this.steps.get(stepId);
    if (!step) {
      throw new Error(`\u6B65\u9AA4 ${stepId} \u4E0D\u5B58\u5728`);
    }
    step.status = "skipped";
    step.endTime = Date.now();
    if (reason) {
      step.description = reason;
    }
    this.displayStep(step, true);
  }
  /**
   * 更新当前步骤的描述
   * @param stepId - 步骤ID
   * @param description - 新描述
   */
  updateStep(stepId, description) {
    const step = this.steps.get(stepId);
    if (!step) {
      throw new Error(`\u6B65\u9AA4 ${stepId} \u4E0D\u5B58\u5728`);
    }
    step.description = description;
    if (step.status === "running") {
      this.displayStep(step);
    }
  }
  /**
   * 显示步骤信息
   * @param step - 步骤
   * @param newLine - 是否换行
   */
  displayStep(step, newLine = false) {
    const icon = this.getStatusIcon(step.status);
    const timestamp = this.options.showTimestamp ? `[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] ` : "";
    const duration = this.getDurationText(step);
    let output = `${timestamp}${icon} ${step.name}`;
    if (step.description) {
      output += ` - ${step.description}`;
    }
    if (duration) {
      output += ` ${duration}`;
    }
    if (step.error) {
      output += `
   \u274C ${step.error}`;
    }
    if (newLine || step.status !== "running") {
      console.log(output);
    } else {
      process.stdout.write(`\r${output}`);
    }
  }
  /**
   * 获取状态图标
   * @param status - 状态
   * @returns 图标
   */
  getStatusIcon(status) {
    switch (status) {
      case "pending":
        return "\u23F3";
      case "running":
        return this.options.showSpinner ? this.spinnerFrames[this.spinnerIndex] : "\u{1F504}";
      case "completed":
        return "\u2705";
      case "failed":
        return "\u274C";
      case "skipped":
        return "\u23ED\uFE0F";
      default:
        return "\u2753";
    }
  }
  /**
   * 获取持续时间文本
   * @param step - 步骤
   * @returns 持续时间文本
   */
  getDurationText(step) {
    if (!this.options.showDuration || !step.startTime) {
      return "";
    }
    const endTime = step.endTime || Date.now();
    const duration = endTime - step.startTime;
    if (duration < 1e3) {
      return `(${duration}ms)`;
    } else {
      return `(${(duration / 1e3).toFixed(1)}s)`;
    }
  }
  /**
   * 启动 spinner
   * @param step - 当前步骤
   */
  startSpinner(step) {
    if (!this.options.showSpinner) return;
    this.spinnerInterval = setInterval(() => {
      this.spinnerIndex = (this.spinnerIndex + 1) % this.spinnerFrames.length;
      this.displayStep(step);
    }, 100);
  }
  /**
   * 停止 spinner
   */
  stopSpinner() {
    if (this.spinnerInterval) {
      clearInterval(this.spinnerInterval);
      this.spinnerInterval = null;
    }
  }
  /**
   * 显示总体进度
   */
  showSummary() {
    const steps = Array.from(this.steps.values());
    const completed = steps.filter((s) => s.status === "completed").length;
    const failed = steps.filter((s) => s.status === "failed").length;
    const skipped = steps.filter((s) => s.status === "skipped").length;
    const total = steps.length;
    console.log("\n\u{1F4CA} \u6267\u884C\u603B\u7ED3:");
    console.log(`   \u603B\u6B65\u9AA4: ${total}`);
    console.log(`   \u2705 \u5B8C\u6210: ${completed}`);
    if (failed > 0) {
      console.log(`   \u274C \u5931\u8D25: ${failed}`);
    }
    if (skipped > 0) {
      console.log(`   \u23ED\uFE0F \u8DF3\u8FC7: ${skipped}`);
    }
    const failedSteps = steps.filter((s) => s.status === "failed");
    if (failedSteps.length > 0) {
      console.log("\n\u274C \u5931\u8D25\u6B65\u9AA4\u8BE6\u60C5:");
      failedSteps.forEach((step) => {
        console.log(`   - ${step.name}: ${step.error}`);
      });
    }
    const startTimes = steps.map((s) => s.startTime).filter(Boolean);
    const endTimes = steps.map((s) => s.endTime).filter(Boolean);
    if (startTimes.length > 0 && endTimes.length > 0) {
      const totalDuration = Math.max(...endTimes) - Math.min(...startTimes);
      console.log(`   \u23F1\uFE0F \u603B\u8017\u65F6: ${(totalDuration / 1e3).toFixed(1)}s`);
    }
  }
  /**
   * 清理资源
   */
  cleanup() {
    this.stopSpinner();
    if (this.options.clearOnComplete) {
      console.clear();
    }
  }
  /**
   * 获取所有步骤状态
   * @returns 步骤状态映射
   */
  getStepsStatus() {
    return new Map(this.steps);
  }
  /**
   * 重置所有步骤
   */
  reset() {
    this.stopSpinner();
    this.steps.clear();
  }
  /**
   * 检查是否所有步骤都已完成
   * @returns 是否全部完成
   */
  isAllCompleted() {
    const steps = Array.from(this.steps.values());
    return steps.length > 0 && steps.every(
      (s) => s.status === "completed" || s.status === "skipped"
    );
  }
  /**
   * 检查是否有失败的步骤
   * @returns 是否有失败
   */
  hasFailures() {
    return Array.from(this.steps.values()).some((s) => s.status === "failed");
  }
};

// src/core/SmartSync.ts
var SmartSync = class {
  git;
  stash;
  conflictResolver;
  progress;
  options;
  constructor(git, options = {}) {
    this.git = git;
    this.stash = new GitStash(git.getBaseDir(), git.getOptions());
    this.conflictResolver = new ConflictResolver(git);
    this.progress = new ProgressIndicator({
      showDuration: true,
      showSpinner: true
    });
    this.options = {
      remote: "origin",
      autoResolveConflicts: false,
      conflictStrategy: "manual",
      showProgress: true,
      confirmBeforeAction: false,
      protectedBranches: ["main", "master", "develop"],
      includeUntracked: true,
      ...options
    };
  }
  /**
   * 执行智能同步提交
   * @param commitMessage - 提交消息
   * @param files - 要提交的文件列表
   * @returns 同步结果
   */
  async syncCommit(commitMessage, files) {
    const steps = [];
    let stashCreated = false;
    let stashId;
    try {
      if (this.options.showProgress) {
        this.setupProgressSteps();
      }
      await this.performSafetyChecks();
      steps.push("\u2705 \u5B89\u5168\u68C0\u67E5\u901A\u8FC7");
      const hasChanges = await this.checkWorkingDirectory();
      if (hasChanges) {
        const stashResult = await this.stashLocalChanges();
        if (stashResult.success && stashResult.data) {
          stashCreated = true;
          stashId = stashResult.data.hash;
          steps.push("\u{1F4E6} \u672C\u5730\u66F4\u6539\u5DF2\u6682\u5B58");
        }
      } else {
        this.progress?.skipStep("stash", "\u6CA1\u6709\u672C\u5730\u66F4\u6539\u9700\u8981\u6682\u5B58");
        steps.push("\u2139\uFE0F \u6CA1\u6709\u672C\u5730\u66F4\u6539\u9700\u8981\u6682\u5B58");
      }
      await this.pullRemoteChanges();
      steps.push("\u{1F4E5} \u8FDC\u7A0B\u66F4\u6539\u5DF2\u62C9\u53D6");
      if (stashCreated) {
        const popResult = await this.popStashedChanges();
        if (!popResult.success) {
          const conflicts = await this.handleStashConflicts();
          if (!conflicts.resolved) {
            return {
              success: false,
              message: "\u6062\u590D\u672C\u5730\u66F4\u6539\u65F6\u53D1\u751F\u51B2\u7A81",
              steps,
              conflicts,
              stashCreated,
              stashId,
              rollbackAvailable: true,
              error: "\u9700\u8981\u624B\u52A8\u89E3\u51B3\u51B2\u7A81"
            };
          }
        }
        steps.push("\u{1F4E4} \u672C\u5730\u66F4\u6539\u5DF2\u6062\u590D");
      }
      await this.addFilesToStaging(files);
      steps.push("\u{1F4CB} \u6587\u4EF6\u5DF2\u6DFB\u52A0\u5230\u6682\u5B58\u533A");
      await this.performCommit(commitMessage);
      steps.push("\u{1F4BE} \u63D0\u4EA4\u5DF2\u5B8C\u6210");
      await this.pushToRemote();
      steps.push("\u{1F680} \u66F4\u6539\u5DF2\u63A8\u9001\u5230\u8FDC\u7A0B");
      if (this.options.showProgress) {
        this.progress.showSummary();
        this.progress.cleanup();
      }
      return {
        success: true,
        message: "\u667A\u80FD\u540C\u6B65\u63D0\u4EA4\u5B8C\u6210",
        steps,
        stashCreated,
        stashId,
        rollbackAvailable: false
      };
    } catch (error) {
      if (this.options.showProgress) {
        this.progress.showSummary();
        this.progress.cleanup();
      }
      return {
        success: false,
        message: "\u667A\u80FD\u540C\u6B65\u5931\u8D25",
        steps,
        stashCreated,
        stashId,
        rollbackAvailable: stashCreated,
        error: error?.message || error
      };
    }
  }
  /**
   * 设置进度步骤
   */
  setupProgressSteps() {
    this.progress.addSteps([
      {
        id: "safety-check",
        name: "\u5B89\u5168\u68C0\u67E5",
        description: "\u68C0\u67E5\u4ED3\u5E93\u72B6\u6001\u548C\u5206\u652F\u4FDD\u62A4"
      },
      {
        id: "check-working-dir",
        name: "\u68C0\u67E5\u5DE5\u4F5C\u76EE\u5F55",
        description: "\u68C0\u67E5\u662F\u5426\u6709\u672A\u63D0\u4EA4\u7684\u66F4\u6539"
      },
      {
        id: "stash",
        name: "\u6682\u5B58\u672C\u5730\u66F4\u6539",
        description: "\u4F7F\u7528 git stash \u4FDD\u5B58\u672C\u5730\u66F4\u6539"
      },
      {
        id: "pull",
        name: "\u62C9\u53D6\u8FDC\u7A0B\u66F4\u6539",
        description: "\u4ECE\u8FDC\u7A0B\u4ED3\u5E93\u62C9\u53D6\u6700\u65B0\u4EE3\u7801"
      },
      {
        id: "pop-stash",
        name: "\u6062\u590D\u672C\u5730\u66F4\u6539",
        description: "\u6062\u590D\u4E4B\u524D\u6682\u5B58\u7684\u672C\u5730\u66F4\u6539"
      },
      {
        id: "add-files",
        name: "\u6DFB\u52A0\u6587\u4EF6",
        description: "\u6DFB\u52A0\u6587\u4EF6\u5230\u6682\u5B58\u533A"
      },
      {
        id: "commit",
        name: "\u6267\u884C\u63D0\u4EA4",
        description: "\u63D0\u4EA4\u6682\u5B58\u7684\u66F4\u6539"
      },
      {
        id: "push",
        name: "\u63A8\u9001\u5230\u8FDC\u7A0B",
        description: "\u63A8\u9001\u63D0\u4EA4\u5230\u8FDC\u7A0B\u4ED3\u5E93"
      }
    ]);
  }
  /**
   * 执行安全检查
   */
  async performSafetyChecks() {
    this.progress?.startStep("safety-check");
    try {
      const isRepo = await this.git.isRepo();
      if (!isRepo) {
        throw new Error("\u5F53\u524D\u76EE\u5F55\u4E0D\u662F Git \u4ED3\u5E93");
      }
      const status = await this.git.getStatus();
      const currentBranch = status.data?.current;
      if (currentBranch && this.options.protectedBranches?.includes(currentBranch)) {
        if (this.options.confirmBeforeAction) {
          console.warn(`\u26A0\uFE0F \u8B66\u544A: \u6B63\u5728\u64CD\u4F5C\u53D7\u4FDD\u62A4\u7684\u5206\u652F ${currentBranch}`);
        }
      }
      const remotes = await this.git.listRemotes();
      if (!remotes.success || !remotes.data?.length) {
        throw new Error("\u6CA1\u6709\u914D\u7F6E\u8FDC\u7A0B\u4ED3\u5E93");
      }
      this.progress?.completeStep("safety-check");
    } catch (error) {
      this.progress?.failStep("safety-check", error?.message || error);
      throw error;
    }
  }
  /**
   * 检查工作目录状态
   */
  async checkWorkingDirectory() {
    this.progress?.startStep("check-working-dir");
    try {
      const isClean = await this.git.status.isClean();
      if (isClean) {
        this.progress?.completeStep("check-working-dir", "\u5DE5\u4F5C\u76EE\u5F55\u5E72\u51C0");
        return false;
      } else {
        this.progress?.completeStep("check-working-dir", "\u53D1\u73B0\u672A\u63D0\u4EA4\u7684\u66F4\u6539");
        return true;
      }
    } catch (error) {
      this.progress?.failStep("check-working-dir", error?.message || error);
      throw error;
    }
  }
  /**
   * 暂存本地更改
   */
  async stashLocalChanges() {
    this.progress?.startStep("stash");
    try {
      const stashMessage = `Smart sync stash - ${(/* @__PURE__ */ new Date()).toISOString()}`;
      const result = await this.stash.save(stashMessage, this.options.includeUntracked);
      if (result.success) {
        this.progress?.completeStep("stash", "\u672C\u5730\u66F4\u6539\u5DF2\u6682\u5B58");
      } else {
        this.progress?.failStep("stash", result.error || "\u6682\u5B58\u5931\u8D25");
      }
      return result;
    } catch (error) {
      this.progress?.failStep("stash", error?.message || error);
      throw error;
    }
  }
  /**
   * 拉取远程更改
   */
  async pullRemoteChanges() {
    this.progress?.startStep("pull");
    try {
      const status = await this.git.getStatus();
      const currentBranch = status.data?.current || this.options.branch || "main";
      const result = await this.git.pull(this.options.remote, currentBranch);
      if (result.success) {
        this.progress?.completeStep("pull", "\u8FDC\u7A0B\u66F4\u6539\u5DF2\u62C9\u53D6");
      } else {
        this.progress?.failStep("pull", result.error || "\u62C9\u53D6\u5931\u8D25");
        throw new Error(result.error || "\u62C9\u53D6\u8FDC\u7A0B\u66F4\u6539\u5931\u8D25");
      }
    } catch (error) {
      this.progress?.failStep("pull", error?.message || error);
      throw error;
    }
  }
  /**
   * 恢复暂存的更改
   */
  async popStashedChanges() {
    this.progress?.startStep("pop-stash");
    try {
      const result = await this.stash.pop();
      if (result.success) {
        this.progress?.completeStep("pop-stash", "\u672C\u5730\u66F4\u6539\u5DF2\u6062\u590D");
      } else {
        this.progress?.updateStep("pop-stash", "\u6062\u590D\u65F6\u53D1\u751F\u51B2\u7A81");
      }
      return result;
    } catch (error) {
      this.progress?.failStep("pop-stash", error?.message || error);
      throw error;
    }
  }
  /**
   * 处理 stash 冲突
   */
  async handleStashConflicts() {
    const conflicts = await this.conflictResolver.resolveConflicts({
      strategy: this.options.conflictStrategy,
      autoResolve: this.options.autoResolveConflicts
    });
    if (conflicts.resolved) {
      this.progress?.completeStep("pop-stash", "\u51B2\u7A81\u5DF2\u81EA\u52A8\u89E3\u51B3");
    } else {
      this.progress?.failStep("pop-stash", "\u5B58\u5728\u672A\u89E3\u51B3\u7684\u51B2\u7A81");
    }
    return conflicts;
  }
  /**
   * 添加文件到暂存区
   */
  async addFilesToStaging(files) {
    this.progress?.startStep("add-files");
    try {
      if (files && files.length > 0) {
        await this.git.add(files);
      } else {
        await this.git.add(".");
      }
      this.progress?.completeStep("add-files");
    } catch (error) {
      this.progress?.failStep("add-files", error?.message || error);
      throw error;
    }
  }
  /**
   * 执行提交
   */
  async performCommit(message) {
    this.progress?.startStep("commit");
    try {
      const result = await this.git.commit(message);
      if (result.success) {
        this.progress?.completeStep("commit", `\u63D0\u4EA4: ${result.data?.hash?.substring(0, 8)}`);
      } else {
        this.progress?.failStep("commit", result.error || "\u63D0\u4EA4\u5931\u8D25");
        throw new Error(result.error || "\u63D0\u4EA4\u5931\u8D25");
      }
    } catch (error) {
      this.progress?.failStep("commit", error?.message || error);
      throw error;
    }
  }
  /**
   * 推送到远程
   */
  async pushToRemote() {
    this.progress?.startStep("push");
    try {
      const status = await this.git.getStatus();
      const currentBranch = status.data?.current || this.options.branch || "main";
      const result = await this.git.push(this.options.remote, currentBranch);
      if (result.success) {
        this.progress?.completeStep("push", "\u63A8\u9001\u5B8C\u6210");
      } else {
        this.progress?.failStep("push", result.error || "\u63A8\u9001\u5931\u8D25");
        throw new Error(result.error || "\u63A8\u9001\u5931\u8D25");
      }
    } catch (error) {
      this.progress?.failStep("push", error?.message || error);
      throw error;
    }
  }
  /**
   * 回滚操作
   * @param stashId - stash ID
   * @returns 回滚结果
   */
  async rollback(stashId) {
    try {
      const steps = [];
      await this.git.repository.executeGitCommand(["reset", "--hard", "HEAD~1"]);
      steps.push("\u21A9\uFE0F \u5DF2\u91CD\u7F6E\u5230\u4E0A\u4E00\u4E2A\u63D0\u4EA4");
      if (stashId) {
        const hasStash = await this.stash.hasStash();
        if (hasStash) {
          await this.stash.pop();
          steps.push("\u{1F4E4} \u5DF2\u6062\u590D\u6682\u5B58\u7684\u66F4\u6539");
        }
      }
      return {
        success: true,
        message: "\u56DE\u6EDA\u5B8C\u6210",
        steps,
        rollbackAvailable: false
      };
    } catch (error) {
      return {
        success: false,
        message: "\u56DE\u6EDA\u5931\u8D25",
        steps: [],
        error: error?.message || error
      };
    }
  }
};

// src/index.ts
var Git = class _Git {
  /** Git 仓库操作实例 */
  repository;
  /** Git 分支操作实例 */
  branch;
  /** Git 状态查询实例 */
  status;
  /** Git 远程仓库操作实例 */
  remote;
  /** Git stash 操作实例 */
  stash;
  /** 智能同步实例 */
  smartSync;
  /**
   * 构造函数
   * @param baseDir 仓库路径
   * @param options 配置选项
   */
  constructor(baseDir, options) {
    this.repository = new GitRepository(baseDir, options);
    const git = this.repository.git;
    const repoBaseDir = this.repository.getBaseDir();
    const repoOptions = this.repository.getOptions();
    this.branch = new GitBranch(git, repoBaseDir);
    this.status = new GitStatus(git, repoBaseDir);
    this.remote = new GitRemote(git, repoBaseDir);
    this.stash = new GitStash(repoBaseDir, repoOptions);
    this.smartSync = new SmartSync(this);
  }
  /**
   * 创建 Git 实例的静态工厂方法
   * @param baseDir 仓库路径
   * @param options 配置选项
   * @returns Git 实例
   */
  static create(baseDir, options) {
    return new _Git(baseDir, options);
  }
  /**
   * 获取仓库路径
   */
  getBaseDir() {
    return this.repository.getBaseDir();
  }
  /**
   * 获取配置选项
   */
  getOptions() {
    return this.repository.getOptions();
  }
  /**
   * 检查是否为 Git 仓库
   * @returns 是否为 Git 仓库
   */
  async isRepo() {
    return this.repository.isRepo();
  }
  /**
   * 快速初始化仓库
   * @param bare 是否创建裸仓库
   */
  async init(bare) {
    return this.repository.init(bare);
  }
  /**
   * 快速克隆仓库
   * @param repoUrl 仓库 URL
   * @param targetDir 目标目录
   */
  async clone(repoUrl, targetDir) {
    return this.repository.clone(repoUrl, { targetDir });
  }
  /**
   * 快速添加文件
   * @param files 文件路径
   */
  async add(files) {
    return this.repository.add(files);
  }
  /**
   * 快速提交
   * @param message 提交消息
   * @param files 文件列表
   */
  async commit(message, files) {
    return this.repository.commit(message, files);
  }
  /**
   * 快速推送
   * @param remote 远程仓库名称
   * @param branch 分支名称
   */
  async push(remote, branch) {
    return this.repository.push({ remote, branch });
  }
  /**
   * 快速拉取
   * @param remote 远程仓库名称
   * @param branch 分支名称
   */
  async pull(remote, branch) {
    return this.repository.pull({ remote, branch });
  }
  /**
   * 快速获取状态
   */
  async getStatus() {
    return this.status.getStatus();
  }
  /**
   * 快速获取日志
   * @param maxCount 最大条数
   */
  async getLog(maxCount) {
    return this.status.getLog({ maxCount });
  }
  /**
   * 快速创建分支
   * @param branchName 分支名称
   */
  async createBranch(branchName) {
    return this.branch.create(branchName);
  }
  /**
   * 快速切换分支
   * @param branchName 分支名称
   */
  async checkoutBranch(branchName) {
    return this.branch.checkout(branchName);
  }
  /**
   * 快速列出分支
   * @param includeRemote 是否包含远程分支
   */
  async listBranches(includeRemote) {
    return this.branch.list(includeRemote);
  }
  /**
   * 快速添加远程仓库
   * @param name 远程仓库名称
   * @param url 远程仓库 URL
   */
  async addRemote(name, url) {
    return this.remote.add(name, url);
  }
  /**
   * 快速列出远程仓库
   */
  async listRemotes() {
    return this.remote.list(true);
  }
  /**
   * 智能同步提交
   * 自动处理 stash、pull、pop、commit、push 流程
   * @param commitMessage 提交消息
   * @param files 要提交的文件列表
   * @param options 智能同步选项
   */
  async syncCommit(commitMessage, files, options) {
    const smartSync = new SmartSync(this, options);
    return smartSync.syncCommit(commitMessage, files);
  }
  /**
   * 回滚智能同步操作
   * @param stashId stash ID
   */
  async rollbackSync(stashId) {
    return this.smartSync.rollback(stashId);
  }
};
var GitWorkflow = class {
  git;
  config;
  spinner;
  constructor(git) {
    this.git = git;
    this.config = this.loadConfig();
  }
  /**
   * 加载配置
   */
  loadConfig() {
    return {
      type: "gitflow" /* GITFLOW */,
      branches: {
        main: "main",
        develop: "develop",
        feature: "feature/",
        release: "release/",
        hotfix: "hotfix/"
      },
      versionTag: "v"
    };
  }
  /**
   * 处理工作流操作
   */
  async handle(action, options) {
    switch (action) {
      case "init":
        await this.initWorkflow(options.type || "gitflow" /* GITFLOW */);
        break;
      case "feature":
        await this.handleFeature(options);
        break;
      case "release":
        await this.handleRelease(options);
        break;
      case "hotfix":
        await this.handleHotfix(options);
        break;
      case "finish":
        await this.finishCurrent();
        break;
      case "status":
        await this.showWorkflowStatus();
        break;
      default:
        console.error(chalk5.red(`\u672A\u77E5\u7684\u5DE5\u4F5C\u6D41\u64CD\u4F5C: ${action}`));
    }
  }
  /**
   * 初始化工作流
   */
  async initWorkflow(type) {
    console.log(chalk5.cyan(`\u{1F680} \u521D\u59CB\u5316 ${type} \u5DE5\u4F5C\u6D41...`));
    this.spinner = ora4("\u68C0\u67E5\u4ED3\u5E93\u72B6\u6001...").start();
    try {
      const isRepo = await this.git.isRepo();
      if (!isRepo) {
        this.spinner.fail("\u4E0D\u662F Git \u4ED3\u5E93");
        return;
      }
      this.spinner.text = "\u521B\u5EFA\u4E3B\u8981\u5206\u652F...";
      if (type === "gitflow" /* GITFLOW */) {
        await this.initGitFlow();
      } else if (type === "github_flow" /* GITHUB_FLOW */) {
        await this.initGitHubFlow();
      }
      this.spinner.succeed("\u5DE5\u4F5C\u6D41\u521D\u59CB\u5316\u5B8C\u6210!");
      this.showWorkflowInfo(type);
    } catch (error) {
      this.spinner?.fail("\u521D\u59CB\u5316\u5931\u8D25");
      console.error(chalk5.red("\u9519\u8BEF:"), error);
    }
  }
  /**
   * 初始化 GitFlow
   */
  async initGitFlow() {
    const currentBranch = await this.git.branch.current();
    if (currentBranch.data !== this.config.branches.main) {
      const branches = await this.git.listBranches();
      const mainExists = branches.data?.some(
        (b) => b.name === this.config.branches.main
      );
      if (!mainExists) {
        await this.git.branch.create(this.config.branches.main);
      }
      await this.git.checkoutBranch(this.config.branches.main);
    }
    const developExists = await this.git.branch.exists(this.config.branches.develop);
    if (!developExists) {
      await this.git.branch.create(
        this.config.branches.develop,
        this.config.branches.main
      );
    }
    await this.git.checkoutBranch(this.config.branches.develop);
  }
  /**
   * 初始化 GitHub Flow
   */
  async initGitHubFlow() {
    const currentBranch = await this.git.branch.current();
    if (currentBranch.data !== this.config.branches.main) {
      const branches = await this.git.listBranches();
      const mainExists = branches.data?.some(
        (b) => b.name === this.config.branches.main
      );
      if (!mainExists) {
        await this.git.branch.create(this.config.branches.main);
      }
      await this.git.checkoutBranch(this.config.branches.main);
    }
  }
  /**
   * 显示工作流信息
   */
  showWorkflowInfo(type) {
    console.log();
    console.log(chalk5.cyan("\u{1F4CB} \u5DE5\u4F5C\u6D41\u4FE1\u606F:"));
    console.log(chalk5.gray("\u2500".repeat(40)));
    if (type === "gitflow" /* GITFLOW */) {
      console.log(`\u4E3B\u5206\u652F: ${chalk5.green(this.config.branches.main)}`);
      console.log(`\u5F00\u53D1\u5206\u652F: ${chalk5.blue(this.config.branches.develop)}`);
      console.log(`\u529F\u80FD\u5206\u652F\u524D\u7F00: ${chalk5.yellow(this.config.branches.feature)}`);
      console.log(`\u53D1\u5E03\u5206\u652F\u524D\u7F00: ${chalk5.magenta(this.config.branches.release)}`);
      console.log(`\u4FEE\u590D\u5206\u652F\u524D\u7F00: ${chalk5.red(this.config.branches.hotfix)}`);
    } else if (type === "github_flow" /* GITHUB_FLOW */) {
      console.log(`\u4E3B\u5206\u652F: ${chalk5.green(this.config.branches.main)}`);
      console.log(`\u529F\u80FD\u5206\u652F: ${chalk5.yellow("\u4ECE main \u521B\u5EFA\uFF0C\u5408\u5E76\u56DE main")}`);
    }
    console.log(chalk5.gray("\u2500".repeat(40)));
  }
  /**
   * 处理功能分支
   */
  async handleFeature(options) {
    const action = await this.selectFeatureAction();
    switch (action) {
      case "start":
        await this.startFeature(options.name);
        break;
      case "finish":
        await this.finishFeature();
        break;
      case "publish":
        await this.publishFeature();
        break;
      case "pull":
        await this.pullFeature();
        break;
    }
  }
  /**
   * 选择功能分支操作
   */
  async selectFeatureAction() {
    const answer = await inquirer3.prompt([
      {
        type: "list",
        name: "action",
        message: "\u9009\u62E9\u529F\u80FD\u5206\u652F\u64CD\u4F5C:",
        choices: [
          { name: "\u5F00\u59CB\u65B0\u529F\u80FD", value: "start" },
          { name: "\u5B8C\u6210\u529F\u80FD", value: "finish" },
          { name: "\u53D1\u5E03\u529F\u80FD\u5230\u8FDC\u7A0B", value: "publish" },
          { name: "\u4ECE\u8FDC\u7A0B\u62C9\u53D6\u529F\u80FD", value: "pull" }
        ]
      }
    ]);
    return answer.action;
  }
  /**
   * 开始新功能
   */
  async startFeature(name) {
    if (!name) {
      const answer = await inquirer3.prompt([
        {
          type: "input",
          name: "name",
          message: "\u8F93\u5165\u529F\u80FD\u540D\u79F0:",
          validate: (input) => {
            if (!input) return "\u529F\u80FD\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A";
            if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
              return "\u529F\u80FD\u540D\u79F0\u53EA\u80FD\u5305\u542B\u5B57\u6BCD\u3001\u6570\u5B57\u3001\u6A2A\u7EBF\u548C\u4E0B\u5212\u7EBF";
            }
            return true;
          }
        }
      ]);
      name = answer.name;
    }
    const branchName = `${this.config.branches.feature}${name}`;
    this.spinner = ora4(`\u521B\u5EFA\u529F\u80FD\u5206\u652F ${branchName}...`).start();
    try {
      await this.git.checkoutBranch(this.config.branches.develop);
      await this.git.branch.create(branchName);
      await this.git.checkoutBranch(branchName);
      this.spinner.succeed(`\u529F\u80FD\u5206\u652F ${branchName} \u521B\u5EFA\u6210\u529F!`);
      console.log(chalk5.green(`\u2705 \u5DF2\u5207\u6362\u5230\u5206\u652F ${branchName}`));
      console.log(chalk5.gray("\u5F00\u59CB\u5F00\u53D1\u4F60\u7684\u529F\u80FD\u5427\uFF01"));
    } catch (error) {
      this.spinner?.fail("\u521B\u5EFA\u529F\u80FD\u5206\u652F\u5931\u8D25");
      console.error(chalk5.red("\u9519\u8BEF:"), error);
    }
  }
  /**
   * 完成功能
   */
  async finishFeature() {
    const currentBranch = await this.git.branch.current();
    if (!currentBranch.data?.startsWith(this.config.branches.feature)) {
      console.error(chalk5.red("\u5F53\u524D\u4E0D\u5728\u529F\u80FD\u5206\u652F\u4E0A"));
      return;
    }
    const featureName = currentBranch.data.replace(this.config.branches.feature, "");
    const confirm = await inquirer3.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `\u786E\u8BA4\u5B8C\u6210\u529F\u80FD ${featureName} \u5E76\u5408\u5E76\u5230 develop?`,
        default: true
      }
    ]);
    if (!confirm.confirm) {
      console.log(chalk5.yellow("\u5DF2\u53D6\u6D88"));
      return;
    }
    this.spinner = ora4("\u5B8C\u6210\u529F\u80FD\u5206\u652F...").start();
    try {
      this.spinner.text = "\u5207\u6362\u5230 develop \u5206\u652F...";
      await this.git.checkoutBranch(this.config.branches.develop);
      this.spinner.text = "\u5408\u5E76\u529F\u80FD\u5206\u652F...";
      await this.git.branch.merge(currentBranch.data, { noFf: true });
      this.spinner.text = "\u5220\u9664\u529F\u80FD\u5206\u652F...";
      await this.git.branch.delete(currentBranch.data);
      this.spinner.succeed(`\u529F\u80FD ${featureName} \u5B8C\u6210!`);
      console.log(chalk5.green("\u2705 \u529F\u80FD\u5DF2\u5408\u5E76\u5230 develop \u5206\u652F"));
    } catch (error) {
      this.spinner?.fail("\u5B8C\u6210\u529F\u80FD\u5931\u8D25");
      console.error(chalk5.red("\u9519\u8BEF:"), error);
    }
  }
  /**
   * 发布功能到远程
   */
  async publishFeature() {
    const currentBranch = await this.git.branch.current();
    if (!currentBranch.data?.startsWith(this.config.branches.feature)) {
      console.error(chalk5.red("\u5F53\u524D\u4E0D\u5728\u529F\u80FD\u5206\u652F\u4E0A"));
      return;
    }
    this.spinner = ora4("\u53D1\u5E03\u529F\u80FD\u5206\u652F\u5230\u8FDC\u7A0B...").start();
    try {
      await this.git.push("origin", currentBranch.data);
      this.spinner.succeed("\u529F\u80FD\u5206\u652F\u5DF2\u53D1\u5E03!");
    } catch (error) {
      this.spinner?.fail("\u53D1\u5E03\u5931\u8D25");
      console.error(chalk5.red("\u9519\u8BEF:"), error);
    }
  }
  /**
   * 从远程拉取功能
   */
  async pullFeature() {
    const currentBranch = await this.git.branch.current();
    if (!currentBranch.data?.startsWith(this.config.branches.feature)) {
      console.error(chalk5.red("\u5F53\u524D\u4E0D\u5728\u529F\u80FD\u5206\u652F\u4E0A"));
      return;
    }
    this.spinner = ora4("\u4ECE\u8FDC\u7A0B\u62C9\u53D6\u529F\u80FD\u5206\u652F...").start();
    try {
      await this.git.pull("origin", currentBranch.data);
      this.spinner.succeed("\u529F\u80FD\u5206\u652F\u5DF2\u66F4\u65B0!");
    } catch (error) {
      this.spinner?.fail("\u62C9\u53D6\u5931\u8D25");
      console.error(chalk5.red("\u9519\u8BEF:"), error);
    }
  }
  /**
   * 处理发布
   */
  async handleRelease(options) {
    const action = await this.selectReleaseAction();
    switch (action) {
      case "start":
        await this.startRelease(options.version);
        break;
      case "finish":
        await this.finishRelease();
        break;
    }
  }
  /**
   * 选择发布操作
   */
  async selectReleaseAction() {
    const answer = await inquirer3.prompt([
      {
        type: "list",
        name: "action",
        message: "\u9009\u62E9\u53D1\u5E03\u64CD\u4F5C:",
        choices: [
          { name: "\u5F00\u59CB\u65B0\u53D1\u5E03", value: "start" },
          { name: "\u5B8C\u6210\u53D1\u5E03", value: "finish" }
        ]
      }
    ]);
    return answer.action;
  }
  /**
   * 开始发布
   */
  async startRelease(version2) {
    if (!version2) {
      const answer = await inquirer3.prompt([
        {
          type: "input",
          name: "version",
          message: "\u8F93\u5165\u7248\u672C\u53F7 (\u5982 1.0.0):",
          validate: (input) => {
            if (!input) return "\u7248\u672C\u53F7\u4E0D\u80FD\u4E3A\u7A7A";
            if (!/^\d+\.\d+\.\d+$/.test(input)) {
              return "\u7248\u672C\u53F7\u683C\u5F0F\u9519\u8BEF (\u5E94\u4E3A x.y.z)";
            }
            return true;
          }
        }
      ]);
      version2 = answer.version;
    }
    const branchName = `${this.config.branches.release}${version2}`;
    this.spinner = ora4(`\u521B\u5EFA\u53D1\u5E03\u5206\u652F ${branchName}...`).start();
    try {
      await this.git.checkoutBranch(this.config.branches.develop);
      await this.git.branch.create(branchName);
      await this.git.checkoutBranch(branchName);
      this.spinner.succeed(`\u53D1\u5E03\u5206\u652F ${branchName} \u521B\u5EFA\u6210\u529F!`);
      console.log(chalk5.green(`\u2705 \u5DF2\u5207\u6362\u5230\u5206\u652F ${branchName}`));
      console.log(chalk5.gray("\u53EF\u4EE5\u8FDB\u884C\u53D1\u5E03\u524D\u7684\u6700\u540E\u8C03\u6574"));
    } catch (error) {
      this.spinner?.fail("\u521B\u5EFA\u53D1\u5E03\u5206\u652F\u5931\u8D25");
      console.error(chalk5.red("\u9519\u8BEF:"), error);
    }
  }
  /**
   * 完成发布
   */
  async finishRelease() {
    const currentBranch = await this.git.branch.current();
    if (!currentBranch.data?.startsWith(this.config.branches.release)) {
      console.error(chalk5.red("\u5F53\u524D\u4E0D\u5728\u53D1\u5E03\u5206\u652F\u4E0A"));
      return;
    }
    const version2 = currentBranch.data.replace(this.config.branches.release, "");
    const confirm = await inquirer3.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `\u786E\u8BA4\u5B8C\u6210\u53D1\u5E03 ${version2}?`,
        default: true
      }
    ]);
    if (!confirm.confirm) {
      console.log(chalk5.yellow("\u5DF2\u53D6\u6D88"));
      return;
    }
    this.spinner = ora4("\u5B8C\u6210\u53D1\u5E03...").start();
    try {
      this.spinner.text = "\u5408\u5E76\u5230 main \u5206\u652F...";
      await this.git.checkoutBranch(this.config.branches.main);
      await this.git.branch.merge(currentBranch.data, { noFf: true });
      this.spinner.text = "\u521B\u5EFA\u7248\u672C\u6807\u7B7E...";
      const tagName = `${this.config.versionTag}${version2}`;
      await this.createTag(tagName, `Release version ${version2}`);
      this.spinner.text = "\u5408\u5E76\u56DE develop \u5206\u652F...";
      await this.git.checkoutBranch(this.config.branches.develop);
      await this.git.branch.merge(currentBranch.data, { noFf: true });
      this.spinner.text = "\u5220\u9664\u53D1\u5E03\u5206\u652F...";
      await this.git.branch.delete(currentBranch.data);
      this.spinner.succeed(`\u7248\u672C ${version2} \u53D1\u5E03\u5B8C\u6210!`);
      console.log(chalk5.green(`\u2705 \u6807\u7B7E ${tagName} \u5DF2\u521B\u5EFA`));
      console.log(chalk5.green("\u2705 \u66F4\u6539\u5DF2\u5408\u5E76\u5230 main \u548C develop \u5206\u652F"));
    } catch (error) {
      this.spinner?.fail("\u5B8C\u6210\u53D1\u5E03\u5931\u8D25");
      console.error(chalk5.red("\u9519\u8BEF:"), error);
    }
  }
  /**
   * 处理修复
   */
  async handleHotfix(options) {
    const action = await this.selectHotfixAction();
    switch (action) {
      case "start":
        await this.startHotfix(options.name);
        break;
      case "finish":
        await this.finishHotfix();
        break;
    }
  }
  /**
   * 选择修复操作
   */
  async selectHotfixAction() {
    const answer = await inquirer3.prompt([
      {
        type: "list",
        name: "action",
        message: "\u9009\u62E9\u4FEE\u590D\u64CD\u4F5C:",
        choices: [
          { name: "\u5F00\u59CB\u7D27\u6025\u4FEE\u590D", value: "start" },
          { name: "\u5B8C\u6210\u4FEE\u590D", value: "finish" }
        ]
      }
    ]);
    return answer.action;
  }
  /**
   * 开始修复
   */
  async startHotfix(name) {
    if (!name) {
      const answer = await inquirer3.prompt([
        {
          type: "input",
          name: "name",
          message: "\u8F93\u5165\u4FEE\u590D\u540D\u79F0:",
          validate: (input) => {
            if (!input) return "\u4FEE\u590D\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A";
            if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
              return "\u4FEE\u590D\u540D\u79F0\u53EA\u80FD\u5305\u542B\u5B57\u6BCD\u3001\u6570\u5B57\u3001\u6A2A\u7EBF\u548C\u4E0B\u5212\u7EBF";
            }
            return true;
          }
        }
      ]);
      name = answer.name;
    }
    const branchName = `${this.config.branches.hotfix}${name}`;
    this.spinner = ora4(`\u521B\u5EFA\u4FEE\u590D\u5206\u652F ${branchName}...`).start();
    try {
      await this.git.checkoutBranch(this.config.branches.main);
      await this.git.branch.create(branchName);
      await this.git.checkoutBranch(branchName);
      this.spinner.succeed(`\u4FEE\u590D\u5206\u652F ${branchName} \u521B\u5EFA\u6210\u529F!`);
      console.log(chalk5.green(`\u2705 \u5DF2\u5207\u6362\u5230\u5206\u652F ${branchName}`));
      console.log(chalk5.gray("\u5F00\u59CB\u4FEE\u590D\u95EE\u9898\u5427\uFF01"));
    } catch (error) {
      this.spinner?.fail("\u521B\u5EFA\u4FEE\u590D\u5206\u652F\u5931\u8D25");
      console.error(chalk5.red("\u9519\u8BEF:"), error);
    }
  }
  /**
   * 完成修复
   */
  async finishHotfix() {
    const currentBranch = await this.git.branch.current();
    if (!currentBranch.data?.startsWith(this.config.branches.hotfix)) {
      console.error(chalk5.red("\u5F53\u524D\u4E0D\u5728\u4FEE\u590D\u5206\u652F\u4E0A"));
      return;
    }
    const hotfixName = currentBranch.data.replace(this.config.branches.hotfix, "");
    const answers = await inquirer3.prompt([
      {
        type: "input",
        name: "version",
        message: "\u8F93\u5165\u65B0\u7248\u672C\u53F7:",
        validate: (input) => {
          if (!input) return "\u7248\u672C\u53F7\u4E0D\u80FD\u4E3A\u7A7A";
          if (!/^\d+\.\d+\.\d+$/.test(input)) {
            return "\u7248\u672C\u53F7\u683C\u5F0F\u9519\u8BEF (\u5E94\u4E3A x.y.z)";
          }
          return true;
        }
      },
      {
        type: "confirm",
        name: "confirm",
        message: `\u786E\u8BA4\u5B8C\u6210\u4FEE\u590D ${hotfixName}?`,
        default: true
      }
    ]);
    if (!answers.confirm) {
      console.log(chalk5.yellow("\u5DF2\u53D6\u6D88"));
      return;
    }
    this.spinner = ora4("\u5B8C\u6210\u4FEE\u590D...").start();
    try {
      this.spinner.text = "\u5408\u5E76\u5230 main \u5206\u652F...";
      await this.git.checkoutBranch(this.config.branches.main);
      await this.git.branch.merge(currentBranch.data, { noFf: true });
      this.spinner.text = "\u521B\u5EFA\u7248\u672C\u6807\u7B7E...";
      const tagName = `${this.config.versionTag}${answers.version}`;
      await this.createTag(tagName, `Hotfix version ${answers.version}`);
      this.spinner.text = "\u5408\u5E76\u56DE develop \u5206\u652F...";
      await this.git.checkoutBranch(this.config.branches.develop);
      await this.git.branch.merge(currentBranch.data, { noFf: true });
      this.spinner.text = "\u5220\u9664\u4FEE\u590D\u5206\u652F...";
      await this.git.branch.delete(currentBranch.data);
      this.spinner.succeed(`\u4FEE\u590D ${hotfixName} \u5B8C\u6210!`);
      console.log(chalk5.green(`\u2705 \u6807\u7B7E ${tagName} \u5DF2\u521B\u5EFA`));
      console.log(chalk5.green("\u2705 \u4FEE\u590D\u5DF2\u5408\u5E76\u5230 main \u548C develop \u5206\u652F"));
    } catch (error) {
      this.spinner?.fail("\u5B8C\u6210\u4FEE\u590D\u5931\u8D25");
      console.error(chalk5.red("\u9519\u8BEF:"), error);
    }
  }
  /**
   * 完成当前工作流
   */
  async finishCurrent() {
    const currentBranch = await this.git.branch.current();
    if (currentBranch.data?.startsWith(this.config.branches.feature)) {
      await this.finishFeature();
    } else if (currentBranch.data?.startsWith(this.config.branches.release)) {
      await this.finishRelease();
    } else if (currentBranch.data?.startsWith(this.config.branches.hotfix)) {
      await this.finishHotfix();
    } else {
      console.error(chalk5.red("\u5F53\u524D\u4E0D\u5728\u5DE5\u4F5C\u6D41\u5206\u652F\u4E0A"));
    }
  }
  /**
   * 显示工作流状态
   */
  async showWorkflowStatus() {
    console.log(chalk5.cyan("\n\u{1F4CA} \u5DE5\u4F5C\u6D41\u72B6\u6001"));
    console.log(chalk5.gray("\u2500".repeat(50)));
    const branches = await this.git.listBranches();
    const currentBranch = await this.git.branch.current();
    const features = [];
    const releases = [];
    const hotfixes = [];
    branches.data?.forEach((branch) => {
      if (branch.name.startsWith(this.config.branches.feature)) {
        features.push(branch.name);
      } else if (branch.name.startsWith(this.config.branches.release)) {
        releases.push(branch.name);
      } else if (branch.name.startsWith(this.config.branches.hotfix)) {
        hotfixes.push(branch.name);
      }
    });
    console.log(`\u5F53\u524D\u5206\u652F: ${chalk5.yellow(currentBranch.data)}`);
    console.log();
    console.log(chalk5.green("\u4E3B\u8981\u5206\u652F:"));
    console.log(`  main: ${chalk5.green(this.config.branches.main)}`);
    console.log(`  develop: ${chalk5.blue(this.config.branches.develop)}`);
    console.log();
    if (features.length > 0) {
      console.log(chalk5.yellow("\u529F\u80FD\u5206\u652F:"));
      features.forEach((branch) => {
        const name = branch.replace(this.config.branches.feature, "");
        const current = branch === currentBranch.data ? " (\u5F53\u524D)" : "";
        console.log(`  ${name}${chalk5.gray(current)}`);
      });
      console.log();
    }
    if (releases.length > 0) {
      console.log(chalk5.magenta("\u53D1\u5E03\u5206\u652F:"));
      releases.forEach((branch) => {
        const version2 = branch.replace(this.config.branches.release, "");
        const current = branch === currentBranch.data ? " (\u5F53\u524D)" : "";
        console.log(`  ${version2}${chalk5.gray(current)}`);
      });
      console.log();
    }
    if (hotfixes.length > 0) {
      console.log(chalk5.red("\u4FEE\u590D\u5206\u652F:"));
      hotfixes.forEach((branch) => {
        const name = branch.replace(this.config.branches.hotfix, "");
        const current = branch === currentBranch.data ? " (\u5F53\u524D)" : "";
        console.log(`  ${name}${chalk5.gray(current)}`);
      });
      console.log();
    }
    console.log(chalk5.gray("\u2500".repeat(50)));
  }
  /**
   * 创建标签
   */
  async createTag(name, message) {
    const { exec: exec4 } = await import('child_process');
    const { promisify: promisify4 } = await import('util');
    const execAsync4 = promisify4(exec4);
    await execAsync4(`git tag -a ${name} -m "${message}"`);
  }
};
var execAsync = promisify(exec);
var GitAnalyzer = class {
  git;
  spinner;
  constructor(git) {
    this.git = git;
  }
  /**
   * 分析入口
   */
  async analyze(type = "all", options = {}) {
    switch (type) {
      case "commits":
        await this.analyzeCommits(options);
        break;
      case "contributors":
        await this.analyzeContributors(options);
        break;
      case "files":
        await this.analyzeFiles(options);
        break;
      case "branches":
        await this.analyzeBranches(options);
        break;
      case "heatmap":
        await this.generateHeatmap(options);
        break;
      case "trends":
        await this.analyzeTrends(options);
        break;
      case "all":
        await this.generateFullReport(options);
        break;
      default:
        console.error(chalk5.red(`\u672A\u77E5\u7684\u5206\u6790\u7C7B\u578B: ${type}`));
    }
  }
  /**
   * 分析提交统计
   */
  async analyzeCommits(options) {
    this.spinner = ora4("\u5206\u6790\u63D0\u4EA4\u5386\u53F2...").start();
    try {
      const { stdout: totalCommits } = await execAsync("git rev-list --count HEAD");
      const { stdout: authors } = await execAsync("git shortlog -sn --all");
      const { stdout: recentCommits } = await execAsync("git log --oneline -n 20");
      const { stdout: dailyStats } = await execAsync(
        'git log --date=short --pretty=format:"%ad" | sort | uniq -c'
      );
      const { stdout: weeklyActivity } = await execAsync(
        'git log --pretty=format:"%ad" --date=format:"%w" | sort | uniq -c'
      );
      this.spinner.succeed("\u63D0\u4EA4\u5206\u6790\u5B8C\u6210!");
      console.log(boxen2(
        chalk5.cyan("\u{1F4CA} \u63D0\u4EA4\u7EDF\u8BA1\n\n") + `\u603B\u63D0\u4EA4\u6570: ${chalk5.yellow(totalCommits.trim())}
\u8D21\u732E\u8005\u6570: ${chalk5.yellow(authors.split("\n").filter((l) => l).length)}
\u5E73\u5747\u6BCF\u65E5\u63D0\u4EA4: ${chalk5.yellow(this.calculateDailyAverage(dailyStats))}`,
        {
          padding: 1,
          borderStyle: "round",
          borderColor: "cyan"
        }
      ));
      console.log(chalk5.cyan("\n\u{1F4C5} \u6BCF\u5468\u6D3B\u8DC3\u5EA6:"));
      this.displayWeeklyActivity(weeklyActivity);
      console.log(chalk5.cyan("\n\u{1F550} \u6700\u8FD1\u63D0\u4EA4:"));
      console.log(chalk5.gray(recentCommits));
    } catch (error) {
      this.spinner?.fail("\u5206\u6790\u5931\u8D25");
      console.error(chalk5.red("\u9519\u8BEF:"), error);
    }
  }
  /**
   * 分析贡献者
   */
  async analyzeContributors(options) {
    this.spinner = ora4("\u5206\u6790\u8D21\u732E\u8005...").start();
    try {
      const { stdout } = await execAsync(
        'git log --pretty=format:"%aN|%aE|%ad" --date=iso | sort | uniq'
      );
      const contributors = /* @__PURE__ */ new Map();
      const lines = stdout.split("\n").filter((l) => l);
      for (const line of lines) {
        const [name, email] = line.split("|");
        const key = `${name}|${email}`;
        if (!contributors.has(key)) {
          const { stdout: stats } = await execAsync(
            `git log --author="${name}" --pretty=tformat: --numstat | awk '{ add += $1; subs += $2 } END { printf "%s,%s", add, subs }'`
          );
          const [additions, deletions] = stats.split(",").map((s) => parseInt(s) || 0);
          const { stdout: commitCount } = await execAsync(
            `git rev-list --count --author="${name}" HEAD`
          );
          contributors.set(key, {
            name,
            email,
            commits: parseInt(commitCount.trim()),
            additions,
            deletions,
            firstCommit: /* @__PURE__ */ new Date(),
            lastCommit: /* @__PURE__ */ new Date()
          });
        }
      }
      this.spinner.succeed("\u8D21\u732E\u8005\u5206\u6790\u5B8C\u6210!");
      const table = new Table({
        head: [
          chalk5.cyan("\u8D21\u732E\u8005"),
          chalk5.cyan("\u90AE\u7BB1"),
          chalk5.cyan("\u63D0\u4EA4\u6570"),
          chalk5.cyan("\u6DFB\u52A0\u884C\u6570"),
          chalk5.cyan("\u5220\u9664\u884C\u6570"),
          chalk5.cyan("\u51C0\u8D21\u732E")
        ],
        style: {
          head: [],
          border: ["cyan"]
        }
      });
      const sortedContributors = Array.from(contributors.values()).sort((a, b) => b.commits - a.commits).slice(0, options.limit || 10);
      sortedContributors.forEach((contributor) => {
        table.push([
          contributor.name,
          chalk5.gray(contributor.email),
          chalk5.yellow(contributor.commits.toString()),
          chalk5.green("+" + contributor.additions),
          chalk5.red("-" + contributor.deletions),
          chalk5.blue((contributor.additions - contributor.deletions).toString())
        ]);
      });
      console.log("\n" + table.toString());
      this.displayContributorRanking(sortedContributors);
    } catch (error) {
      this.spinner?.fail("\u5206\u6790\u5931\u8D25");
      console.error(chalk5.red("\u9519\u8BEF:"), error);
    }
  }
  /**
   * 分析文件变更
   */
  async analyzeFiles(options) {
    this.spinner = ora4("\u5206\u6790\u6587\u4EF6\u53D8\u66F4...").start();
    try {
      const { stdout } = await execAsync(
        "git log --pretty=format: --name-only | sort | uniq -c | sort -rg | head -20"
      );
      this.spinner.succeed("\u6587\u4EF6\u5206\u6790\u5B8C\u6210!");
      console.log(chalk5.cyan("\n\u{1F525} \u70ED\u70B9\u6587\u4EF6 (\u53D8\u66F4\u9891\u7387\u6700\u9AD8):"));
      const table = new Table({
        head: [
          chalk5.cyan("\u53D8\u66F4\u6B21\u6570"),
          chalk5.cyan("\u6587\u4EF6\u8DEF\u5F84")
        ],
        style: {
          head: [],
          border: ["cyan"]
        }
      });
      const lines = stdout.split("\n").filter((l) => l.trim());
      lines.forEach((line) => {
        const match = line.trim().match(/^(\d+)\s+(.+)$/);
        if (match) {
          const [, count, file] = match;
          const heat = this.getHeatIndicator(parseInt(count));
          table.push([
            heat + " " + chalk5.yellow(count),
            file
          ]);
        }
      });
      console.log(table.toString());
      await this.analyzeFileTypes();
    } catch (error) {
      this.spinner?.fail("\u5206\u6790\u5931\u8D25");
      console.error(chalk5.red("\u9519\u8BEF:"), error);
    }
  }
  /**
   * 分析分支活跃度
   */
  async analyzeBranches(options) {
    this.spinner = ora4("\u5206\u6790\u5206\u652F\u6D3B\u8DC3\u5EA6...").start();
    try {
      const branches = await this.git.listBranches(true);
      if (!branches.success || !branches.data) {
        this.spinner.fail("\u83B7\u53D6\u5206\u652F\u5931\u8D25");
        return;
      }
      this.spinner.succeed("\u5206\u652F\u5206\u6790\u5B8C\u6210!");
      const table = new Table({
        head: [
          chalk5.cyan("\u5206\u652F\u540D"),
          chalk5.cyan("\u6700\u540E\u63D0\u4EA4"),
          chalk5.cyan("\u6D3B\u8DC3\u5EA6"),
          chalk5.cyan("\u72B6\u6001")
        ],
        style: {
          head: [],
          border: ["cyan"]
        }
      });
      for (const branch of branches.data) {
        if (!branch.remote) {
          try {
            const { stdout: lastCommitDate } = await execAsync(
              `git log -1 --format=%cd --date=relative ${branch.name}`
            );
            const { stdout: commitCount } = await execAsync(
              `git rev-list --count ${branch.name}`
            );
            const activity = this.calculateBranchActivity(parseInt(commitCount.trim()));
            const status = branch.current ? chalk5.green("\u5F53\u524D") : chalk5.gray("\u7A7A\u95F2");
            table.push([
              branch.name,
              chalk5.gray(lastCommitDate.trim()),
              activity,
              status
            ]);
          } catch (error) {
          }
        }
      }
      console.log("\n" + table.toString());
    } catch (error) {
      this.spinner?.fail("\u5206\u6790\u5931\u8D25");
      console.error(chalk5.red("\u9519\u8BEF:"), error);
    }
  }
  /**
   * 生成代码热力图
   */
  async generateHeatmap(options) {
    this.spinner = ora4("\u751F\u6210\u4EE3\u7801\u70ED\u529B\u56FE...").start();
    try {
      const { stdout } = await execAsync(
        'git log --pretty=format:"%ad" --date=short --since="30 days ago" | sort | uniq -c'
      );
      this.spinner.succeed("\u70ED\u529B\u56FE\u751F\u6210\u5B8C\u6210!");
      console.log(chalk5.cyan("\n\u{1F4C8} \u6700\u8FD130\u5929\u63D0\u4EA4\u70ED\u529B\u56FE:"));
      console.log(chalk5.gray("\u2550".repeat(60)));
      const lines = stdout.split("\n").filter((l) => l.trim());
      const maxCount = Math.max(...lines.map((l) => {
        const match = l.trim().match(/^(\d+)/);
        return match ? parseInt(match[1]) : 0;
      }));
      lines.forEach((line) => {
        const match = line.trim().match(/^(\d+)\s+(.+)$/);
        if (match) {
          const [, count, date] = match;
          const commits = parseInt(count);
          const barLength = Math.round(commits / maxCount * 40);
          const bar = this.getHeatBar(commits, barLength);
          console.log(
            `${chalk5.cyan(date)} ${bar} ${chalk5.yellow(count)}`
          );
        }
      });
      console.log(chalk5.gray("\u2550".repeat(60)));
    } catch (error) {
      this.spinner?.fail("\u751F\u6210\u5931\u8D25");
      console.error(chalk5.red("\u9519\u8BEF:"), error);
    }
  }
  /**
   * 分析趋势
   */
  async analyzeTrends(options) {
    this.spinner = ora4("\u5206\u6790\u5F00\u53D1\u8D8B\u52BF...").start();
    try {
      const { stdout: monthlyTrend } = await execAsync(
        'git log --pretty=format:"%ad" --date=format:"%Y-%m" | sort | uniq -c'
      );
      const { stdout: codeGrowth } = await execAsync(
        `git log --pretty=tformat: --numstat | awk '{ add += $1; subs += $2 } END { printf "additions: %s, deletions: %s", add, subs }'`
      );
      this.spinner.succeed("\u8D8B\u52BF\u5206\u6790\u5B8C\u6210!");
      console.log(chalk5.cyan("\n\u{1F4C8} \u5F00\u53D1\u8D8B\u52BF\u5206\u6790:"));
      console.log(chalk5.yellow("\n\u6708\u5EA6\u63D0\u4EA4\u8D8B\u52BF:"));
      const monthlyLines = monthlyTrend.split("\n").filter((l) => l.trim()).slice(-12);
      monthlyLines.forEach((line) => {
        const match = line.trim().match(/^(\d+)\s+(.+)$/);
        if (match) {
          const [, count, month] = match;
          const commits = parseInt(count);
          const bar = "\u2588".repeat(Math.min(commits, 50));
          console.log(`${month}: ${chalk5.cyan(bar)} ${chalk5.yellow(count)}`);
        }
      });
      console.log(chalk5.yellow("\n\u4EE3\u7801\u589E\u957F\u7EDF\u8BA1:"));
      console.log(chalk5.gray(codeGrowth));
      this.predictTrend(monthlyLines);
    } catch (error) {
      this.spinner?.fail("\u5206\u6790\u5931\u8D25");
      console.error(chalk5.red("\u9519\u8BEF:"), error);
    }
  }
  /**
   * 生成完整报告
   */
  async generateFullReport(options) {
    console.log(chalk5.cyan("\n" + "=".repeat(60)));
    console.log(chalk5.cyan.bold("             \u{1F4CA} \u4ED3\u5E93\u5206\u6790\u62A5\u544A"));
    console.log(chalk5.cyan("=".repeat(60) + "\n"));
    await this.analyzeCommits(options);
    console.log();
    await this.analyzeContributors({ ...options, limit: 5 });
    console.log();
    await this.analyzeFiles(options);
    console.log();
    await this.analyzeBranches(options);
    console.log();
    await this.generateHeatmap(options);
    console.log();
    await this.analyzeTrends(options);
    console.log(chalk5.cyan("\n" + "=".repeat(60)));
    console.log(chalk5.green.bold("             \u2705 \u62A5\u544A\u751F\u6210\u5B8C\u6210!"));
    console.log(chalk5.cyan("=".repeat(60)));
  }
  /**
   * 辅助方法：计算每日平均提交
   */
  calculateDailyAverage(dailyStats) {
    const lines = dailyStats.split("\n").filter((l) => l.trim());
    if (lines.length === 0) return "0";
    const total = lines.reduce((sum, line) => {
      const match = line.trim().match(/^(\d+)/);
      return sum + (match ? parseInt(match[1]) : 0);
    }, 0);
    return (total / lines.length).toFixed(1);
  }
  /**
   * 辅助方法：显示每周活跃度
   */
  displayWeeklyActivity(weeklyActivity) {
    const days = ["\u65E5", "\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D"];
    const activity = new Array(7).fill(0);
    weeklyActivity.split("\n").forEach((line) => {
      const match = line.trim().match(/^(\d+)\s+(\d)$/);
      if (match) {
        activity[parseInt(match[2])] = parseInt(match[1]);
      }
    });
    const maxActivity = Math.max(...activity);
    days.forEach((day, index) => {
      const count = activity[index];
      const barLength = maxActivity > 0 ? Math.round(count / maxActivity * 20) : 0;
      const bar = "\u2588".repeat(barLength);
      console.log(`\u5468${day}: ${chalk5.cyan(bar.padEnd(20))} ${chalk5.yellow(count)}`);
    });
  }
  /**
   * 辅助方法：显示贡献者排行
   */
  displayContributorRanking(contributors) {
    console.log(chalk5.cyan("\n\u{1F3C6} \u8D21\u732E\u8005\u6392\u884C\u699C:"));
    contributors.slice(0, 3).forEach((contributor, index) => {
      const medal = index === 0 ? "\u{1F947}" : index === 1 ? "\u{1F948}" : "\u{1F949}";
      console.log(
        `${medal} ${contributor.name} - ${chalk5.yellow(contributor.commits)} \u6B21\u63D0\u4EA4, ${chalk5.green("+" + contributor.additions)}/${chalk5.red("-" + contributor.deletions)} \u884C`
      );
    });
  }
  /**
   * 辅助方法：分析文件类型
   */
  async analyzeFileTypes() {
    try {
      const { stdout } = await execAsync(
        'git ls-files | sed "s/.*\\.//" | sort | uniq -c | sort -rn | head -10'
      );
      console.log(chalk5.cyan("\n\u{1F4C1} \u6587\u4EF6\u7C7B\u578B\u5206\u5E03:"));
      const lines = stdout.split("\n").filter((l) => l.trim());
      lines.forEach((line) => {
        const match = line.trim().match(/^(\d+)\s+(.+)$/);
        if (match) {
          const [, count, ext] = match;
          console.log(`  .${ext}: ${chalk5.yellow(count)} \u4E2A\u6587\u4EF6`);
        }
      });
    } catch (error) {
    }
  }
  /**
   * 辅助方法：获取热度指示器
   */
  getHeatIndicator(count) {
    if (count > 100) return "\u{1F525}\u{1F525}\u{1F525}";
    if (count > 50) return "\u{1F525}\u{1F525}";
    if (count > 20) return "\u{1F525}";
    return "\u{1F4DD}";
  }
  /**
   * 辅助方法：计算分支活跃度
   */
  calculateBranchActivity(commitCount) {
    if (commitCount > 100) return chalk5.red("\u{1F525} \u975E\u5E38\u6D3B\u8DC3");
    if (commitCount > 50) return chalk5.yellow("\u26A1 \u6D3B\u8DC3");
    if (commitCount > 10) return chalk5.green("\u2713 \u6B63\u5E38");
    return chalk5.gray("\u{1F4A4} \u4E0D\u6D3B\u8DC3");
  }
  /**
   * 辅助方法：获取热力条
   */
  getHeatBar(count, length) {
    if (count > 10) return chalk5.red("\u2588".repeat(length));
    if (count > 5) return chalk5.yellow("\u2588".repeat(length));
    if (count > 2) return chalk5.green("\u2588".repeat(length));
    return chalk5.gray("\u2588".repeat(length));
  }
  /**
   * 辅助方法：预测趋势
   */
  predictTrend(monthlyData) {
    const counts = monthlyData.map((line) => {
      const match = line.trim().match(/^(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    if (counts.length < 3) return;
    const recent = counts.slice(-3);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const trend = recent[2] - recent[0];
    console.log(chalk5.cyan("\n\u{1F52E} \u8D8B\u52BF\u9884\u6D4B:"));
    if (trend > 0) {
      console.log(chalk5.green(`\u{1F4C8} \u63D0\u4EA4\u6D3B\u8DC3\u5EA6\u5448\u4E0A\u5347\u8D8B\u52BF (+${Math.abs(trend)})`));
    } else if (trend < 0) {
      console.log(chalk5.yellow(`\u{1F4C9} \u63D0\u4EA4\u6D3B\u8DC3\u5EA6\u5448\u4E0B\u964D\u8D8B\u52BF (-${Math.abs(trend)})`));
    } else {
      console.log(chalk5.blue("\u27A1\uFE0F \u63D0\u4EA4\u6D3B\u8DC3\u5EA6\u4FDD\u6301\u7A33\u5B9A"));
    }
    console.log(chalk5.gray(`\u5E73\u5747\u6BCF\u6708\u63D0\u4EA4: ${avg.toFixed(1)} \u6B21`));
  }
};
var ConfigManager = class {
  config;
  defaultConfig = {
    user: {},
    aliases: {
      "st": "status",
      "ci": "commit",
      "co": "checkout",
      "br": "branch",
      "ps": "push",
      "pl": "pull",
      "lg": "log --oneline --graph",
      "last": "log -1",
      "unstage": "reset HEAD --",
      "amend": "commit --amend",
      "undo": "reset --soft HEAD~1"
    },
    defaults: {
      branch: "main",
      remote: "origin",
      editor: "vim"
    },
    workflow: {
      type: "gitflow",
      branches: {
        main: "main",
        develop: "develop",
        feature: "feature/",
        release: "release/",
        hotfix: "hotfix/"
      }
    },
    ui: {
      theme: "default",
      colors: true,
      animations: true,
      icons: true
    },
    features: {
      autoCorrect: true,
      suggestions: true,
      autoUpdate: true,
      analytics: false
    }
  };
  constructor() {
    this.config = new Conf({
      projectName: "ldesign-git",
      projectVersion: "2.0.0",
      defaults: this.defaultConfig,
      schema: {
        user: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" }
          }
        },
        aliases: {
          type: "object",
          additionalProperties: { type: "string" }
        },
        defaults: {
          type: "object",
          properties: {
            branch: { type: "string" },
            remote: { type: "string" },
            editor: { type: "string" }
          }
        },
        workflow: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["gitflow", "github-flow"] },
            branches: {
              type: "object",
              properties: {
                main: { type: "string" },
                develop: { type: "string" },
                feature: { type: "string" },
                release: { type: "string" },
                hotfix: { type: "string" }
              }
            }
          }
        },
        ui: {
          type: "object",
          properties: {
            theme: { type: "string", enum: ["default", "dark", "light"] },
            colors: { type: "boolean" },
            animations: { type: "boolean" },
            icons: { type: "boolean" }
          }
        },
        features: {
          type: "object",
          properties: {
            autoCorrect: { type: "boolean" },
            suggestions: { type: "boolean" },
            autoUpdate: { type: "boolean" },
            analytics: { type: "boolean" }
          }
        }
      }
    });
  }
  /**
   * 获取配置值
   */
  get(key) {
    return this.config.get(key);
  }
  /**
   * 设置配置值
   */
  set(key, value) {
    this.config.set(key, value);
  }
  /**
   * 获取所有配置
   */
  getAll() {
    return this.config.store;
  }
  /**
   * 重置配置
   */
  reset() {
    this.config.clear();
    this.config.store = this.defaultConfig;
  }
  /**
   * 获取配置文件路径
   */
  getConfigPath() {
    return this.config.path;
  }
  /**
   * 获取别名
   */
  getAliases() {
    return this.config.get("aliases") || {};
  }
  /**
   * 设置别名
   */
  setAlias(name, command) {
    const aliases = this.getAliases();
    aliases[name] = command;
    this.config.set("aliases", aliases);
  }
  /**
   * 删除别名
   */
  removeAlias(name) {
    const aliases = this.getAliases();
    delete aliases[name];
    this.config.set("aliases", aliases);
  }
  /**
   * 获取用户信息
   */
  getUser() {
    return this.config.get("user") || {};
  }
  /**
   * 设置用户信息
   */
  setUser(name, email) {
    this.config.set("user", { name, email });
  }
  /**
   * 获取工作流配置
   */
  getWorkflow() {
    return this.config.get("workflow") || this.defaultConfig.workflow;
  }
  /**
   * 设置工作流配置
   */
  setWorkflow(workflow) {
    const current = this.getWorkflow();
    this.config.set("workflow", { ...current, ...workflow });
  }
  /**
   * 获取 UI 配置
   */
  getUI() {
    return this.config.get("ui") || this.defaultConfig.ui;
  }
  /**
   * 设置 UI 配置
   */
  setUI(ui) {
    const current = this.getUI();
    this.config.set("ui", { ...current, ...ui });
  }
  /**
   * 获取功能配置
   */
  getFeatures() {
    return this.config.get("features") || this.defaultConfig.features;
  }
  /**
   * 设置功能配置
   */
  setFeatures(features) {
    const current = this.getFeatures();
    this.config.set("features", { ...current, ...features });
  }
  /**
   * 导出配置
   */
  export() {
    return JSON.stringify(this.config.store, null, 2);
  }
  /**
   * 导入配置
   */
  import(configJson) {
    try {
      const config = JSON.parse(configJson);
      this.config.store = config;
    } catch (error) {
      throw new Error("Invalid configuration JSON");
    }
  }
  /**
   * 加载配置
   */
  load() {
    return this.config.store;
  }
  /**
   * 验证配置
   */
  validate() {
    return true;
  }
};
var GitHooksManager = class {
  git;
  constructor(git) {
    this.git = git;
  }
  async manage(action, options) {
    void this.git;
    console.log(chalk5.cyan(`\u{1FA9D} Git\u94A9\u5B50\u7BA1\u7406 (${action}) \u6B63\u5728\u5F00\u53D1\u4E2D...`));
  }
};
var execAsync2 = promisify(exec);
var BatchOperations = class {
  git;
  spinner;
  constructor(git) {
    this.git = git;
  }
  /**
   * 执行批量操作
   */
  async execute(operation, options) {
    switch (operation) {
      case "cherry-pick":
        await this.batchCherryPick(options);
        break;
      case "revert":
        await this.batchRevert(options);
        break;
      case "branch":
        await this.batchBranch(options);
        break;
      case "tag":
        await this.batchTag(options);
        break;
      case "stash":
        await this.batchStash(options);
        break;
      case "merge":
        await this.batchMerge(options);
        break;
      case "rebase":
        await this.batchRebase(options);
        break;
      default:
        console.error(chalk5.red(`\u672A\u77E5\u7684\u6279\u91CF\u64CD\u4F5C: ${operation}`));
        await this.showAvailableOperations();
    }
  }
  /**
   * 批量 cherry-pick
   */
  async batchCherryPick(options) {
    let commits = options.commits || [];
    if (commits.length === 0) {
      commits = await this.selectCommits("cherry-pick");
      if (commits.length === 0) {
        console.log(chalk5.yellow("\u6CA1\u6709\u9009\u62E9\u4EFB\u4F55\u63D0\u4EA4"));
        return;
      }
    }
    console.log(chalk5.cyan(`
\u{1F352} \u51C6\u5907 cherry-pick ${commits.length} \u4E2A\u63D0\u4EA4`));
    const confirm = await this.confirmOperation(
      `\u786E\u8BA4\u8981 cherry-pick \u8FD9 ${commits.length} \u4E2A\u63D0\u4EA4\u5417\uFF1F`,
      commits
    );
    if (!confirm) {
      console.log(chalk5.yellow("\u64CD\u4F5C\u5DF2\u53D6\u6D88"));
      return;
    }
    const results = await this.performBatchOperation(
      commits,
      async (commit) => {
        try {
          await execAsync2(`git cherry-pick ${commit}`);
          return { success: true };
        } catch (error) {
          if (error.message.includes("conflict")) {
            await execAsync2("git cherry-pick --abort").catch(() => {
            });
            return { success: false, error: "\u5B58\u5728\u51B2\u7A81" };
          }
          return { success: false, error: error.message };
        }
      },
      "Cherry-picking"
    );
    this.displayBatchResults(results, "Cherry-pick");
  }
  /**
   * 批量 revert
   */
  async batchRevert(options) {
    let commits = options.commits || [];
    if (commits.length === 0) {
      commits = await this.selectCommits("revert");
      if (commits.length === 0) {
        console.log(chalk5.yellow("\u6CA1\u6709\u9009\u62E9\u4EFB\u4F55\u63D0\u4EA4"));
        return;
      }
    }
    console.log(chalk5.cyan(`
\u23EA \u51C6\u5907\u56DE\u6EDA ${commits.length} \u4E2A\u63D0\u4EA4`));
    const confirm = await this.confirmOperation(
      `\u786E\u8BA4\u8981\u56DE\u6EDA\u8FD9 ${commits.length} \u4E2A\u63D0\u4EA4\u5417\uFF1F`,
      commits
    );
    if (!confirm) {
      console.log(chalk5.yellow("\u64CD\u4F5C\u5DF2\u53D6\u6D88"));
      return;
    }
    const { singleCommit } = await inquirer3.prompt([
      {
        type: "confirm",
        name: "singleCommit",
        message: "\u662F\u5426\u521B\u5EFA\u5355\u4E2A\u56DE\u6EDA\u63D0\u4EA4\uFF1F",
        default: false
      }
    ]);
    const results = await this.performBatchOperation(
      commits,
      async (commit) => {
        try {
          const flags = singleCommit ? "--no-commit" : "--no-edit";
          await execAsync2(`git revert ${flags} ${commit}`);
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
      "Reverting"
    );
    if (singleCommit && results.successful > 0) {
      try {
        await execAsync2(`git commit -m "Revert ${results.successful} commits"`);
        console.log(chalk5.green("\u2705 \u521B\u5EFA\u4E86\u5408\u5E76\u7684\u56DE\u6EDA\u63D0\u4EA4"));
      } catch (error) {
        console.error(chalk5.red("\u521B\u5EFA\u5408\u5E76\u63D0\u4EA4\u5931\u8D25"), error);
      }
    }
    this.displayBatchResults(results, "Revert");
  }
  /**
   * 批量分支操作
   */
  async batchBranch(options) {
    const { action } = await inquirer3.prompt([
      {
        type: "list",
        name: "action",
        message: "\u9009\u62E9\u6279\u91CF\u5206\u652F\u64CD\u4F5C:",
        choices: [
          { name: "\u521B\u5EFA\u591A\u4E2A\u5206\u652F", value: "create" },
          { name: "\u5220\u9664\u591A\u4E2A\u5206\u652F", value: "delete" },
          { name: "\u91CD\u547D\u540D\u5206\u652F\uFF08\u6279\u91CF\u6DFB\u52A0\u524D\u7F00/\u540E\u7F00\uFF09", value: "rename" },
          { name: "\u6E05\u7406\u5DF2\u5408\u5E76\u5206\u652F", value: "cleanup" }
        ]
      }
    ]);
    switch (action) {
      case "create":
        await this.batchCreateBranches();
        break;
      case "delete":
        await this.batchDeleteBranches(options);
        break;
      case "rename":
        await this.batchRenameBranches();
        break;
      case "cleanup":
        await this.cleanupMergedBranches();
        break;
    }
  }
  /**
   * 批量创建分支
   */
  async batchCreateBranches() {
    const { pattern, count, baseBranch } = await inquirer3.prompt([
      {
        type: "input",
        name: "pattern",
        message: "\u8F93\u5165\u5206\u652F\u540D\u79F0\u6A21\u5F0F (\u4F7F\u7528 {n} \u8868\u793A\u5E8F\u53F7):",
        default: "feature/task-{n}",
        validate: (input) => input.includes("{n}") || "\u6A21\u5F0F\u5FC5\u987B\u5305\u542B {n}"
      },
      {
        type: "number",
        name: "count",
        message: "\u521B\u5EFA\u591A\u5C11\u4E2A\u5206\u652F\uFF1F",
        default: 3,
        validate: (input) => input > 0 && input <= 20 || "\u8BF7\u8F93\u5165 1-20 \u4E4B\u95F4\u7684\u6570\u5B57"
      },
      {
        type: "input",
        name: "baseBranch",
        message: "\u57FA\u4E8E\u54EA\u4E2A\u5206\u652F\u521B\u5EFA\uFF1F",
        default: "develop"
      }
    ]);
    const branches = [];
    for (let i = 1; i <= count; i++) {
      branches.push(pattern.replace("{n}", i.toString()));
    }
    console.log(chalk5.cyan("\n\u5C06\u521B\u5EFA\u4EE5\u4E0B\u5206\u652F:"));
    branches.forEach((branch) => console.log(`  - ${branch}`));
    const confirm = await this.confirmOperation("\u786E\u8BA4\u521B\u5EFA\u8FD9\u4E9B\u5206\u652F\u5417\uFF1F");
    if (!confirm) return;
    try {
      await execAsync2(`git checkout ${baseBranch}`);
    } catch (error) {
      console.error(chalk5.red(`\u65E0\u6CD5\u5207\u6362\u5230\u57FA\u7840\u5206\u652F ${baseBranch}`));
      return;
    }
    const results = await this.performBatchOperation(
      branches,
      async (branch) => {
        try {
          await execAsync2(`git checkout -b ${branch}`);
          await execAsync2(`git checkout ${baseBranch}`);
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
      "Creating branches"
    );
    this.displayBatchResults(results, "Branch creation");
  }
  /**
   * 批量删除分支
   */
  async batchDeleteBranches(options) {
    let branches = options.branches || [];
    if (branches.length === 0) {
      const { stdout } = await execAsync2('git branch --format="%(refname:short)"');
      const allBranches = stdout.split("\n").filter((b) => b.trim());
      const { stdout: currentBranch } = await execAsync2("git branch --show-current");
      const deletableBranches = allBranches.filter(
        (b) => b !== currentBranch.trim() && !["main", "master", "develop"].includes(b)
      );
      if (deletableBranches.length === 0) {
        console.log(chalk5.yellow("\u6CA1\u6709\u53EF\u5220\u9664\u7684\u5206\u652F"));
        return;
      }
      const { selected } = await inquirer3.prompt([
        {
          type: "checkbox",
          name: "selected",
          message: "\u9009\u62E9\u8981\u5220\u9664\u7684\u5206\u652F:",
          choices: deletableBranches,
          validate: (input) => input.length > 0 || "\u8BF7\u81F3\u5C11\u9009\u62E9\u4E00\u4E2A\u5206\u652F"
        }
      ]);
      branches = selected;
    }
    const { force } = await inquirer3.prompt([
      {
        type: "confirm",
        name: "force",
        message: "\u662F\u5426\u5F3A\u5236\u5220\u9664\uFF08\u5373\u4F7F\u672A\u5408\u5E76\uFF09\uFF1F",
        default: false
      }
    ]);
    const results = await this.performBatchOperation(
      branches,
      async (branch) => {
        try {
          const flag = force ? "-D" : "-d";
          await execAsync2(`git branch ${flag} ${branch}`);
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
      "Deleting branches"
    );
    this.displayBatchResults(results, "Branch deletion");
  }
  /**
   * 批量重命名分支
   */
  async batchRenameBranches() {
    const { action, pattern } = await inquirer3.prompt([
      {
        type: "list",
        name: "action",
        message: "\u9009\u62E9\u91CD\u547D\u540D\u64CD\u4F5C:",
        choices: [
          { name: "\u6DFB\u52A0\u524D\u7F00", value: "prefix" },
          { name: "\u6DFB\u52A0\u540E\u7F00", value: "suffix" },
          { name: "\u66FF\u6362\u6A21\u5F0F", value: "replace" }
        ]
      },
      {
        type: "input",
        name: "pattern",
        message: (action2) => {
          switch (action2) {
            case "prefix":
              return "\u8F93\u5165\u8981\u6DFB\u52A0\u7684\u524D\u7F00:";
            case "suffix":
              return "\u8F93\u5165\u8981\u6DFB\u52A0\u7684\u540E\u7F00:";
            case "replace":
              return "\u8F93\u5165\u66FF\u6362\u6A21\u5F0F (\u683C\u5F0F: old/new):";
            default:
              return "\u8F93\u5165\u6A21\u5F0F:";
          }
        }
      }
    ]);
    const branches = await this.git.listBranches();
    if (!branches.success || !branches.data) {
      console.error(chalk5.red("\u83B7\u53D6\u5206\u652F\u5217\u8868\u5931\u8D25"));
      return;
    }
    const renameMap = /* @__PURE__ */ new Map();
    branches.data.filter((b) => !b.current && !["main", "master", "develop"].includes(b.name)).forEach((branch) => {
      let newName = "";
      switch (action) {
        case "prefix":
          newName = pattern + branch.name;
          break;
        case "suffix":
          newName = branch.name + pattern;
          break;
        case "replace":
          const [oldPart, newPart] = pattern.split("/");
          newName = branch.name.replace(oldPart, newPart);
          break;
      }
      if (newName && newName !== branch.name) {
        renameMap.set(branch.name, newName);
      }
    });
    if (renameMap.size === 0) {
      console.log(chalk5.yellow("\u6CA1\u6709\u9700\u8981\u91CD\u547D\u540D\u7684\u5206\u652F"));
      return;
    }
    console.log(chalk5.cyan("\n\u91CD\u547D\u540D\u9884\u89C8:"));
    renameMap.forEach((newName, oldName) => {
      console.log(`  ${oldName} \u2192 ${newName}`);
    });
    const confirm = await this.confirmOperation("\u786E\u8BA4\u91CD\u547D\u540D\u8FD9\u4E9B\u5206\u652F\u5417\uFF1F");
    if (!confirm) return;
    const results = [];
    for (const [oldName, newName] of renameMap) {
      try {
        await execAsync2(`git branch -m ${oldName} ${newName}`);
        results.push({ item: `${oldName} \u2192 ${newName}`, status: "success" });
      } catch (error) {
        results.push({
          item: `${oldName} \u2192 ${newName}`,
          status: "failed",
          error: error.message
        });
      }
    }
    this.displayBatchResults(
      {
        total: results.length,
        successful: results.filter((r) => r.status === "success").length,
        failed: results.filter((r) => r.status === "failed").length,
        skipped: 0,
        results
      },
      "Branch rename"
    );
  }
  /**
   * 清理已合并的分支
   */
  async cleanupMergedBranches() {
    console.log(chalk5.cyan("\u{1F9F9} \u67E5\u627E\u5DF2\u5408\u5E76\u7684\u5206\u652F..."));
    try {
      const { stdout } = await execAsync2("git branch --merged");
      const mergedBranches = stdout.split("\n").map((b) => b.trim().replace("* ", "")).filter((b) => b && !["main", "master", "develop"].includes(b));
      if (mergedBranches.length === 0) {
        console.log(chalk5.green("\u2728 \u6CA1\u6709\u9700\u8981\u6E05\u7406\u7684\u5DF2\u5408\u5E76\u5206\u652F"));
        return;
      }
      console.log(chalk5.yellow(`
\u627E\u5230 ${mergedBranches.length} \u4E2A\u5DF2\u5408\u5E76\u7684\u5206\u652F:`));
      mergedBranches.forEach((branch) => console.log(`  - ${branch}`));
      const { selected } = await inquirer3.prompt([
        {
          type: "checkbox",
          name: "selected",
          message: "\u9009\u62E9\u8981\u5220\u9664\u7684\u5206\u652F:",
          choices: mergedBranches,
          default: mergedBranches
        }
      ]);
      if (selected.length === 0) {
        console.log(chalk5.yellow("\u6CA1\u6709\u9009\u62E9\u4EFB\u4F55\u5206\u652F"));
        return;
      }
      const results = await this.performBatchOperation(
        selected,
        async (branch) => {
          try {
            await execAsync2(`git branch -d ${branch}`);
            return { success: true };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },
        "Cleaning up branches"
      );
      this.displayBatchResults(results, "Branch cleanup");
    } catch (error) {
      console.error(chalk5.red("\u6E05\u7406\u5206\u652F\u5931\u8D25:"), error);
    }
  }
  /**
   * 批量标签操作
   */
  async batchTag(options) {
    const { action } = await inquirer3.prompt([
      {
        type: "list",
        name: "action",
        message: "\u9009\u62E9\u6279\u91CF\u6807\u7B7E\u64CD\u4F5C:",
        choices: [
          { name: "\u521B\u5EFA\u7248\u672C\u6807\u7B7E\u7CFB\u5217", value: "create-series" },
          { name: "\u5220\u9664\u591A\u4E2A\u6807\u7B7E", value: "delete" },
          { name: "\u63A8\u9001\u6240\u6709\u6807\u7B7E", value: "push-all" }
        ]
      }
    ]);
    switch (action) {
      case "create-series":
        await this.createTagSeries();
        break;
      case "delete":
        await this.deleteTags();
        break;
      case "push-all":
        await this.pushAllTags();
        break;
    }
  }
  /**
   * 创建标签系列
   */
  async createTagSeries() {
    const { prefix, startVersion, count } = await inquirer3.prompt([
      {
        type: "input",
        name: "prefix",
        message: "\u6807\u7B7E\u524D\u7F00:",
        default: "v"
      },
      {
        type: "input",
        name: "startVersion",
        message: "\u8D77\u59CB\u7248\u672C:",
        default: "1.0.0",
        validate: (input) => /^\d+\.\d+\.\d+$/.test(input) || "\u8BF7\u8F93\u5165\u6709\u6548\u7684\u7248\u672C\u53F7 (x.y.z)"
      },
      {
        type: "number",
        name: "count",
        message: "\u521B\u5EFA\u591A\u5C11\u4E2A\u6807\u7B7E\uFF1F",
        default: 3
      }
    ]);
    const tags = [];
    let [major, minor, patch] = startVersion.split(".").map(Number);
    for (let i = 0; i < count; i++) {
      tags.push(`${prefix}${major}.${minor}.${patch}`);
      patch++;
    }
    console.log(chalk5.cyan("\n\u5C06\u521B\u5EFA\u4EE5\u4E0B\u6807\u7B7E:"));
    tags.forEach((tag) => console.log(`  - ${tag}`));
    const confirm = await this.confirmOperation("\u786E\u8BA4\u521B\u5EFA\u8FD9\u4E9B\u6807\u7B7E\u5417\uFF1F");
    if (!confirm) return;
    const results = await this.performBatchOperation(
      tags,
      async (tag) => {
        try {
          await execAsync2(`git tag -a ${tag} -m "Release ${tag}"`);
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
      "Creating tags"
    );
    this.displayBatchResults(results, "Tag creation");
    const { push } = await inquirer3.prompt([
      {
        type: "confirm",
        name: "push",
        message: "\u662F\u5426\u63A8\u9001\u8FD9\u4E9B\u6807\u7B7E\u5230\u8FDC\u7A0B\uFF1F",
        default: true
      }
    ]);
    if (push) {
      await this.pushTags(tags);
    }
  }
  /**
   * 删除标签
   */
  async deleteTags() {
    const { stdout } = await execAsync2("git tag");
    const allTags = stdout.split("\n").filter((t) => t.trim());
    if (allTags.length === 0) {
      console.log(chalk5.yellow("\u6CA1\u6709\u6807\u7B7E\u53EF\u5220\u9664"));
      return;
    }
    const { selected } = await inquirer3.prompt([
      {
        type: "checkbox",
        name: "selected",
        message: "\u9009\u62E9\u8981\u5220\u9664\u7684\u6807\u7B7E:",
        choices: allTags
      }
    ]);
    if (selected.length === 0) {
      console.log(chalk5.yellow("\u6CA1\u6709\u9009\u62E9\u4EFB\u4F55\u6807\u7B7E"));
      return;
    }
    const results = await this.performBatchOperation(
      selected,
      async (tag) => {
        try {
          await execAsync2(`git tag -d ${tag}`);
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
      "Deleting tags"
    );
    this.displayBatchResults(results, "Tag deletion");
  }
  /**
   * 推送所有标签
   */
  async pushAllTags() {
    this.spinner = ora4("\u63A8\u9001\u6240\u6709\u6807\u7B7E...").start();
    try {
      await execAsync2("git push --tags");
      this.spinner.succeed("\u6240\u6709\u6807\u7B7E\u5DF2\u63A8\u9001");
    } catch (error) {
      this.spinner.fail("\u63A8\u9001\u5931\u8D25");
      console.error(chalk5.red("\u9519\u8BEF:"), error);
    }
  }
  /**
   * 推送指定标签
   */
  async pushTags(tags) {
    const results = await this.performBatchOperation(
      tags,
      async (tag) => {
        try {
          await execAsync2(`git push origin ${tag}`);
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
      "Pushing tags"
    );
    this.displayBatchResults(results, "Tag push");
  }
  /**
   * 批量 stash 操作
   */
  async batchStash(options) {
    const { action } = await inquirer3.prompt([
      {
        type: "list",
        name: "action",
        message: "\u9009\u62E9\u6279\u91CF stash \u64CD\u4F5C:",
        choices: [
          { name: "\u5E94\u7528\u591A\u4E2A stash", value: "apply" },
          { name: "\u5220\u9664\u591A\u4E2A stash", value: "drop" },
          { name: "\u6E05\u7A7A\u6240\u6709 stash", value: "clear" }
        ]
      }
    ]);
    switch (action) {
      case "apply":
        await this.applyStashes();
        break;
      case "drop":
        await this.dropStashes();
        break;
      case "clear":
        await this.clearStashes();
        break;
    }
  }
  /**
   * 应用多个 stash
   */
  async applyStashes() {
    const { stdout } = await execAsync2("git stash list");
    if (!stdout) {
      console.log(chalk5.yellow("\u6CA1\u6709 stash \u53EF\u5E94\u7528"));
      return;
    }
    const stashes = stdout.split("\n").filter((s) => s).map((s, i) => ({ name: s, value: i }));
    const { selected } = await inquirer3.prompt([
      {
        type: "checkbox",
        name: "selected",
        message: "\u9009\u62E9\u8981\u5E94\u7528\u7684 stash:",
        choices: stashes
      }
    ]);
    if (selected.length === 0) {
      console.log(chalk5.yellow("\u6CA1\u6709\u9009\u62E9\u4EFB\u4F55 stash"));
      return;
    }
    const results = await this.performBatchOperation(
      selected,
      async (index) => {
        try {
          await execAsync2(`git stash apply stash@{${index}}`);
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
      "Applying stashes"
    );
    this.displayBatchResults(results, "Stash apply");
  }
  /**
   * 删除多个 stash
   */
  async dropStashes() {
    const { stdout } = await execAsync2("git stash list");
    if (!stdout) {
      console.log(chalk5.yellow("\u6CA1\u6709 stash \u53EF\u5220\u9664"));
      return;
    }
    const stashes = stdout.split("\n").filter((s) => s).map((s, i) => ({ name: s, value: i }));
    const { selected } = await inquirer3.prompt([
      {
        type: "checkbox",
        name: "selected",
        message: "\u9009\u62E9\u8981\u5220\u9664\u7684 stash:",
        choices: stashes
      }
    ]);
    if (selected.length === 0) {
      console.log(chalk5.yellow("\u6CA1\u6709\u9009\u62E9\u4EFB\u4F55 stash"));
      return;
    }
    selected.sort((a, b) => b - a);
    const results = await this.performBatchOperation(
      selected,
      async (index) => {
        try {
          await execAsync2(`git stash drop stash@{${index}}`);
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
      "Dropping stashes"
    );
    this.displayBatchResults(results, "Stash drop");
  }
  /**
   * 清空所有 stash
   */
  async clearStashes() {
    const confirm = await this.confirmOperation(
      "\u786E\u8BA4\u8981\u6E05\u7A7A\u6240\u6709 stash \u5417\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u6062\u590D\uFF01"
    );
    if (!confirm) return;
    try {
      await execAsync2("git stash clear");
      console.log(chalk5.green("\u2705 \u6240\u6709 stash \u5DF2\u6E05\u7A7A"));
    } catch (error) {
      console.error(chalk5.red("\u6E05\u7A7A stash \u5931\u8D25:"), error);
    }
  }
  /**
   * 批量合并
   */
  async batchMerge(options) {
    const branches = await this.git.listBranches();
    if (!branches.success || !branches.data) {
      console.error(chalk5.red("\u83B7\u53D6\u5206\u652F\u5217\u8868\u5931\u8D25"));
      return;
    }
    const availableBranches = branches.data.filter((b) => !b.current).map((b) => b.name);
    const { selected, strategy } = await inquirer3.prompt([
      {
        type: "checkbox",
        name: "selected",
        message: "\u9009\u62E9\u8981\u5408\u5E76\u7684\u5206\u652F:",
        choices: availableBranches
      },
      {
        type: "list",
        name: "strategy",
        message: "\u9009\u62E9\u5408\u5E76\u7B56\u7565:",
        choices: [
          { name: "\u666E\u901A\u5408\u5E76", value: "normal" },
          { name: "\u5FEB\u8FDB\u5408\u5E76", value: "ff-only" },
          { name: "\u7981\u6B62\u5FEB\u8FDB", value: "no-ff" },
          { name: "Squash \u5408\u5E76", value: "squash" }
        ]
      }
    ]);
    if (selected.length === 0) {
      console.log(chalk5.yellow("\u6CA1\u6709\u9009\u62E9\u4EFB\u4F55\u5206\u652F"));
      return;
    }
    let mergeFlags = "";
    switch (strategy) {
      case "ff-only":
        mergeFlags = "--ff-only";
        break;
      case "no-ff":
        mergeFlags = "--no-ff";
        break;
      case "squash":
        mergeFlags = "--squash";
        break;
    }
    const results = await this.performBatchOperation(
      selected,
      async (branch) => {
        try {
          await execAsync2(`git merge ${mergeFlags} ${branch}`);
          return { success: true };
        } catch (error) {
          if (error.message.includes("conflict")) {
            await execAsync2("git merge --abort").catch(() => {
            });
            return { success: false, error: "\u5B58\u5728\u51B2\u7A81" };
          }
          return { success: false, error: error.message };
        }
      },
      "Merging branches"
    );
    this.displayBatchResults(results, "Branch merge");
  }
  /**
   * 批量变基
   */
  async batchRebase(options) {
    console.log(chalk5.cyan("\u{1F504} \u6279\u91CF\u53D8\u57FA\u529F\u80FD\u6B63\u5728\u5F00\u53D1\u4E2D..."));
  }
  /**
   * 选择提交
   */
  async selectCommits(operation) {
    const { stdout } = await execAsync2("git log --oneline -n 30");
    const commits = stdout.split("\n").filter((c) => c).map((c) => {
      const [hash] = c.split(" ");
      return {
        name: c,
        value: hash,
        short: hash
      };
    });
    const { selected } = await inquirer3.prompt([
      {
        type: "checkbox",
        name: "selected",
        message: `\u9009\u62E9\u8981 ${operation} \u7684\u63D0\u4EA4:`,
        choices: commits,
        validate: (input) => input.length > 0 || "\u8BF7\u81F3\u5C11\u9009\u62E9\u4E00\u4E2A\u63D0\u4EA4"
      }
    ]);
    return selected;
  }
  /**
   * 执行批量操作
   */
  async performBatchOperation(items, operation, progressMessage) {
    const results = [];
    let successful = 0;
    let failed = 0;
    let skipped = 0;
    this.spinner = ora4(`${progressMessage} (0/${items.length})`).start();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      this.spinner.text = `${progressMessage} (${i + 1}/${items.length})`;
      try {
        const result = await operation(item);
        if (result.success) {
          successful++;
          results.push({ item: String(item), status: "success" });
        } else {
          failed++;
          results.push({
            item: String(item),
            status: "failed",
            error: result.error
          });
        }
      } catch (error) {
        failed++;
        results.push({
          item: String(item),
          status: "failed",
          error: error.message
        });
      }
    }
    this.spinner.stop();
    return {
      total: items.length,
      successful,
      failed,
      skipped,
      results
    };
  }
  /**
   * 确认操作
   */
  async confirmOperation(message, items) {
    if (items && items.length > 0) {
      console.log(chalk5.cyan("\n\u5F85\u5904\u7406\u9879\u76EE:"));
      items.slice(0, 10).forEach((item) => console.log(`  - ${item}`));
      if (items.length > 10) {
        console.log(chalk5.gray(`  ... \u8FD8\u6709 ${items.length - 10} \u9879`));
      }
    }
    const { confirm } = await inquirer3.prompt([
      {
        type: "confirm",
        name: "confirm",
        message,
        default: false
      }
    ]);
    return confirm;
  }
  /**
   * 显示批量操作结果
   */
  displayBatchResults(results, operationType) {
    console.log();
    const table = new Table({
      head: [
        chalk5.cyan("\u9879\u76EE"),
        chalk5.cyan("\u72B6\u6001"),
        chalk5.cyan("\u6D88\u606F")
      ],
      style: {
        head: [],
        border: ["gray"]
      }
    });
    results.results.forEach((result) => {
      const status = result.status === "success" ? chalk5.green("\u2705 \u6210\u529F") : result.status === "failed" ? chalk5.red("\u274C \u5931\u8D25") : chalk5.yellow("\u23ED\uFE0F \u8DF3\u8FC7");
      table.push([
        result.item.substring(0, 50),
        status,
        result.error || result.message || ""
      ]);
    });
    if (table.length > 0) {
      console.log(table.toString());
    }
    console.log();
    console.log(chalk5.cyan(`\u{1F4CA} ${operationType} \u7EDF\u8BA1:`));
    console.log(`  \u603B\u8BA1: ${chalk5.yellow(results.total)}`);
    console.log(`  \u6210\u529F: ${chalk5.green(results.successful)}`);
    console.log(`  \u5931\u8D25: ${chalk5.red(results.failed)}`);
    if (results.skipped > 0) {
      console.log(`  \u8DF3\u8FC7: ${chalk5.yellow(results.skipped)}`);
    }
    if (results.failed === 0) {
      console.log(chalk5.green(`
\u2705 ${operationType} \u5B8C\u6210\uFF0C\u6240\u6709\u64CD\u4F5C\u6210\u529F\uFF01`));
    } else if (results.successful === 0) {
      console.log(chalk5.red(`
\u274C ${operationType} \u5931\u8D25\uFF0C\u6240\u6709\u64CD\u4F5C\u90FD\u5931\u8D25\u4E86`));
    } else {
      console.log(chalk5.yellow(
        `
\u26A0\uFE0F ${operationType} \u90E8\u5206\u5B8C\u6210\uFF0C${results.successful} \u4E2A\u6210\u529F\uFF0C${results.failed} \u4E2A\u5931\u8D25`
      ));
    }
  }
  /**
   * 显示可用操作
   */
  async showAvailableOperations() {
    console.log(chalk5.cyan("\n\u53EF\u7528\u7684\u6279\u91CF\u64CD\u4F5C:"));
    console.log("  cherry-pick - \u6279\u91CF cherry-pick \u63D0\u4EA4");
    console.log("  revert      - \u6279\u91CF\u56DE\u6EDA\u63D0\u4EA4");
    console.log("  branch      - \u6279\u91CF\u5206\u652F\u64CD\u4F5C");
    console.log("  tag         - \u6279\u91CF\u6807\u7B7E\u64CD\u4F5C");
    console.log("  stash       - \u6279\u91CF stash \u64CD\u4F5C");
    console.log("  merge       - \u6279\u91CF\u5408\u5E76\u5206\u652F");
    console.log("  rebase      - \u6279\u91CF\u53D8\u57FA\u64CD\u4F5C");
  }
};
var autocompleteRegistered = false;
async function registerAutocompletePrompt() {
  if (autocompleteRegistered) return;
  try {
    const mod = await import('inquirer-autocomplete-prompt');
    inquirer3.registerPrompt("autocomplete", mod.default ?? mod);
    autocompleteRegistered = true;
  } catch (e) {
  }
}
var InteractiveMode = class {
  git;
  running = false;
  spinner;
  constructor(git) {
    this.git = git;
  }
  /**
   * 启动交互式模式
   */
  async start() {
    this.running = true;
    await this.showWelcome();
    while (this.running) {
      try {
        await this.showMainMenu();
      } catch (error) {
        if (error instanceof Error && error.message === "exit") {
          break;
        }
        console.error(chalk5.red("\u9519\u8BEF:"), error);
      }
    }
    this.showGoodbye();
  }
  /**
   * 显示欢迎界面
   */
  async showWelcome() {
    console.clear();
    const logo = figlet.textSync("Git Interactive", {
      font: "Small",
      horizontalLayout: "default"
    });
    console.log(gradient.rainbow(logo));
    console.log();
    const welcomeBox = boxen2(
      chalk5.cyan("\u{1F3AE} \u6B22\u8FCE\u8FDB\u5165 Git \u4EA4\u4E92\u5F0F\u6A21\u5F0F \u{1F3AE}\n\n") + chalk5.gray("\u4F7F\u7528\u65B9\u5411\u952E\u9009\u62E9\uFF0C\u56DE\u8F66\u786E\u8BA4\n") + chalk5.gray("\u8F93\u5165 / \u8FDB\u884C\u641C\u7D22\uFF0CESC \u9000\u51FA"),
      {
        padding: 1,
        borderStyle: "round",
        borderColor: "cyan"
      }
    );
    console.log(welcomeBox);
    console.log();
  }
  /**
   * 显示主菜单
   */
  async showMainMenu() {
    const choices = [
      {
        name: chalk5.green("\u{1F4DD} \u63D0\u4EA4\u7BA1\u7406"),
        value: "commit",
        icon: "\u{1F4DD}"
      },
      {
        name: chalk5.blue("\u{1F33F} \u5206\u652F\u7BA1\u7406"),
        value: "branch",
        icon: "\u{1F33F}"
      },
      {
        name: chalk5.yellow("\u{1F4CA} \u4ED3\u5E93\u72B6\u6001"),
        value: "status",
        icon: "\u{1F4CA}"
      },
      {
        name: chalk5.cyan("\u{1F504} \u540C\u6B65\u64CD\u4F5C"),
        value: "sync",
        icon: "\u{1F504}"
      },
      {
        name: chalk5.magenta("\u{1F4DA} \u5386\u53F2\u8BB0\u5F55"),
        value: "history",
        icon: "\u{1F4DA}"
      },
      {
        name: chalk5.white("\u{1F3F7}\uFE0F \u6807\u7B7E\u7BA1\u7406"),
        value: "tags",
        icon: "\u{1F3F7}\uFE0F"
      },
      {
        name: chalk5.gray("\u{1F4E6} \u50A8\u85CF\u7BA1\u7406"),
        value: "stash",
        icon: "\u{1F4E6}"
      },
      {
        name: chalk5.green("\u{1F527} \u5DE5\u4F5C\u6D41"),
        value: "workflow",
        icon: "\u{1F527}"
      },
      {
        name: chalk5.blue("\u{1F3AF} \u5FEB\u901F\u64CD\u4F5C"),
        value: "quick",
        icon: "\u{1F3AF}"
      },
      {
        name: chalk5.yellow("\u2699\uFE0F \u8BBE\u7F6E"),
        value: "settings",
        icon: "\u2699\uFE0F"
      },
      new inquirer3.Separator(),
      {
        name: chalk5.red("\u{1F6AA} \u9000\u51FA"),
        value: "exit",
        icon: "\u{1F6AA}"
      }
    ];
    const answer = await inquirer3.prompt([
      {
        type: "list",
        name: "action",
        message: "\u8BF7\u9009\u62E9\u64CD\u4F5C:",
        choices,
        pageSize: 15,
        loop: false
      }
    ]);
    switch (answer.action) {
      case "commit":
        await this.handleCommitMenu();
        break;
      case "branch":
        await this.handleBranchMenu();
        break;
      case "status":
        await this.handleStatus();
        break;
      case "sync":
        await this.handleSyncMenu();
        break;
      case "history":
        await this.handleHistoryMenu();
        break;
      case "tags":
        await this.handleTagsMenu();
        break;
      case "stash":
        await this.handleStashMenu();
        break;
      case "workflow":
        await this.handleWorkflowMenu();
        break;
      case "quick":
        await this.handleQuickMenu();
        break;
      case "settings":
        await this.handleSettingsMenu();
        break;
      case "exit":
        this.running = false;
        break;
    }
  }
  /**
   * 处理提交菜单
   */
  async handleCommitMenu() {
    const choices = [
      { name: "\u2728 \u667A\u80FD\u63D0\u4EA4", value: "smart" },
      { name: "\u{1F4DD} \u5E38\u89C4\u63D0\u4EA4", value: "normal" },
      { name: "\u{1F504} \u4FEE\u6539\u6700\u540E\u63D0\u4EA4", value: "amend" },
      { name: "\u{1F4E6} \u6279\u91CF\u63D0\u4EA4", value: "batch" },
      { name: "\u23EA \u8FD4\u56DE", value: "back" }
    ];
    const answer = await inquirer3.prompt([
      {
        type: "list",
        name: "action",
        message: "\u9009\u62E9\u63D0\u4EA4\u64CD\u4F5C:",
        choices
      }
    ]);
    switch (answer.action) {
      case "smart":
        await this.handleSmartCommit();
        break;
      case "normal":
        await this.handleNormalCommit();
        break;
      case "amend":
        await this.handleAmendCommit();
        break;
      case "batch":
        await this.handleBatchCommit();
        break;
      case "back":
        return;
    }
  }
  /**
   * 处理智能提交
   */
  async handleSmartCommit() {
    const status = await this.git.getStatus();
    if (!status.success || status.data?.modified?.length === 0 && status.data?.not_added?.length === 0 && status.data?.deleted?.length === 0) {
      console.log(chalk5.yellow("\u26A0\uFE0F \u6CA1\u6709\u9700\u8981\u63D0\u4EA4\u7684\u66F4\u6539"));
      await this.pause();
      return;
    }
    console.log(chalk5.cyan("\n\u{1F4CB} \u5F85\u63D0\u4EA4\u6587\u4EF6:"));
    this.displayChangedFiles(status.data);
    const filesToCommit = await this.selectFilesToCommit(status.data);
    if (filesToCommit.length === 0) {
      console.log(chalk5.yellow("\u26A0\uFE0F \u6CA1\u6709\u9009\u62E9\u4EFB\u4F55\u6587\u4EF6"));
      await this.pause();
      return;
    }
    const commitInfo = await this.generateCommitMessage();
    const confirm = await inquirer3.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `\u786E\u8BA4\u63D0\u4EA4 ${filesToCommit.length} \u4E2A\u6587\u4EF6?`,
        default: true
      }
    ]);
    if (!confirm.confirm) {
      console.log(chalk5.yellow("\u2716 \u5DF2\u53D6\u6D88\u63D0\u4EA4"));
      await this.pause();
      return;
    }
    this.spinner = ora4("\u6B63\u5728\u63D0\u4EA4...").start();
    try {
      for (const file of filesToCommit) {
        await this.git.add(file);
      }
      const result = await this.git.commit(commitInfo.message);
      if (result.success) {
        this.spinner.succeed("\u63D0\u4EA4\u6210\u529F!");
        console.log(chalk5.green(`\u2705 \u63D0\u4EA4\u54C8\u5E0C: ${result.data?.hash}`));
        const pushAnswer = await inquirer3.prompt([
          {
            type: "confirm",
            name: "push",
            message: "\u662F\u5426\u63A8\u9001\u5230\u8FDC\u7A0B\u4ED3\u5E93?",
            default: false
          }
        ]);
        if (pushAnswer.push) {
          await this.handlePush();
        }
      } else {
        this.spinner.fail("\u63D0\u4EA4\u5931\u8D25");
        console.error(chalk5.red(result.error));
      }
    } catch (error) {
      this.spinner?.fail("\u64CD\u4F5C\u5931\u8D25");
      console.error(chalk5.red("\u9519\u8BEF:"), error);
    }
    await this.pause();
  }
  /**
   * 处理常规提交
   */
  async handleNormalCommit() {
    const answers = await inquirer3.prompt([
      {
        type: "input",
        name: "message",
        message: "\u8F93\u5165\u63D0\u4EA4\u4FE1\u606F:",
        validate: (input) => input.length > 0 || "\u63D0\u4EA4\u4FE1\u606F\u4E0D\u80FD\u4E3A\u7A7A"
      },
      {
        type: "confirm",
        name: "addAll",
        message: "\u662F\u5426\u6DFB\u52A0\u6240\u6709\u66F4\u6539?",
        default: false
      }
    ]);
    this.spinner = ora4("\u6B63\u5728\u63D0\u4EA4...").start();
    try {
      if (answers.addAll) {
        await this.git.add(".");
      }
      const result = await this.git.commit(answers.message);
      if (result.success) {
        this.spinner.succeed("\u63D0\u4EA4\u6210\u529F!");
        console.log(chalk5.green(`\u2705 \u63D0\u4EA4\u54C8\u5E0C: ${result.data?.hash}`));
      } else {
        this.spinner.fail("\u63D0\u4EA4\u5931\u8D25");
        console.error(chalk5.red(result.error));
      }
    } catch (error) {
      this.spinner?.fail("\u64CD\u4F5C\u5931\u8D25");
      console.error(chalk5.red("\u9519\u8BEF:"), error);
    }
    await this.pause();
  }
  /**
   * 处理修改最后提交
   */
  async handleAmendCommit() {
    const answers = await inquirer3.prompt([
      {
        type: "confirm",
        name: "changeMessage",
        message: "\u662F\u5426\u4FEE\u6539\u63D0\u4EA4\u4FE1\u606F?",
        default: false
      },
      {
        type: "input",
        name: "message",
        message: "\u65B0\u7684\u63D0\u4EA4\u4FE1\u606F:",
        when: (answers2) => answers2.changeMessage,
        validate: (input) => input.length > 0 || "\u63D0\u4EA4\u4FE1\u606F\u4E0D\u80FD\u4E3A\u7A7A"
      }
    ]);
    this.spinner = ora4("\u6B63\u5728\u4FEE\u6539\u63D0\u4EA4...").start();
    try {
      let command = "git commit --amend";
      if (answers.changeMessage) {
        command += ` -m "${answers.message}"`;
      } else {
        command += " --no-edit";
      }
      const { exec: exec4 } = await import('child_process');
      const { promisify: promisify4 } = await import('util');
      const execAsync4 = promisify4(exec4);
      await execAsync4(command);
      this.spinner.succeed("\u63D0\u4EA4\u5DF2\u4FEE\u6539!");
    } catch (error) {
      this.spinner?.fail("\u4FEE\u6539\u5931\u8D25");
      console.error(chalk5.red("\u9519\u8BEF:"), error);
    }
    await this.pause();
  }
  /**
   * 处理批量提交
   */
  async handleBatchCommit() {
    console.log(chalk5.cyan("\u{1F4E6} \u6279\u91CF\u63D0\u4EA4\u529F\u80FD\u5F00\u53D1\u4E2D..."));
    await this.pause();
  }
  /**
   * 处理分支菜单
   */
  async handleBranchMenu() {
    const choices = [
      { name: "\u{1F4CB} \u67E5\u770B\u5206\u652F\u5217\u8868", value: "list" },
      { name: "\u2795 \u521B\u5EFA\u65B0\u5206\u652F", value: "create" },
      { name: "\u{1F504} \u5207\u6362\u5206\u652F", value: "checkout" },
      { name: "\u{1F500} \u5408\u5E76\u5206\u652F", value: "merge" },
      { name: "\u274C \u5220\u9664\u5206\u652F", value: "delete" },
      { name: "\u{1F4CA} \u5206\u652F\u5BF9\u6BD4", value: "compare" },
      { name: "\u23EA \u8FD4\u56DE", value: "back" }
    ];
    const answer = await inquirer3.prompt([
      {
        type: "list",
        name: "action",
        message: "\u9009\u62E9\u5206\u652F\u64CD\u4F5C:",
        choices
      }
    ]);
    switch (answer.action) {
      case "list":
        await this.handleBranchList();
        break;
      case "create":
        await this.handleBranchCreate();
        break;
      case "checkout":
        await this.handleBranchCheckout();
        break;
      case "merge":
        await this.handleBranchMerge();
        break;
      case "delete":
        await this.handleBranchDelete();
        break;
      case "compare":
        await this.handleBranchCompare();
        break;
      case "back":
        return;
    }
  }
  /**
   * 处理分支列表
   */
  async handleBranchList() {
    this.spinner = ora4("\u83B7\u53D6\u5206\u652F\u5217\u8868...").start();
    try {
      const branches = await this.git.listBranches(true);
      if (!branches.success || !branches.data) {
        this.spinner.fail("\u83B7\u53D6\u5206\u652F\u5931\u8D25");
        await this.pause();
        return;
      }
      this.spinner.succeed("\u5206\u652F\u5217\u8868\u83B7\u53D6\u6210\u529F");
      const table = new Table({
        head: [
          chalk5.cyan("\u5206\u652F\u540D"),
          chalk5.cyan("\u7C7B\u578B"),
          chalk5.cyan("\u5F53\u524D")
        ],
        style: {
          head: [],
          border: ["cyan"]
        }
      });
      branches.data.forEach((branch) => {
        table.push([
          branch.name,
          branch.remote ? chalk5.blue("\u8FDC\u7A0B") : chalk5.green("\u672C\u5730"),
          branch.current ? chalk5.yellow("\u25CF") : ""
        ]);
      });
      console.log("\n" + table.toString());
    } catch (error) {
      this.spinner?.fail("\u64CD\u4F5C\u5931\u8D25");
      console.error(chalk5.red("\u9519\u8BEF:"), error);
    }
    await this.pause();
  }
  /**
   * 处理创建分支
   */
  async handleBranchCreate() {
    const answers = await inquirer3.prompt([
      {
        type: "input",
        name: "name",
        message: "\u8F93\u5165\u65B0\u5206\u652F\u540D\u79F0:",
        validate: (input) => {
          if (!input) return "\u5206\u652F\u540D\u4E0D\u80FD\u4E3A\u7A7A";
          if (!/^[a-zA-Z0-9/_-]+$/.test(input)) {
            return "\u5206\u652F\u540D\u53EA\u80FD\u5305\u542B\u5B57\u6BCD\u3001\u6570\u5B57\u3001\u4E0B\u5212\u7EBF\u3001\u6A2A\u7EBF\u548C\u659C\u7EBF";
          }
          return true;
        }
      },
      {
        type: "confirm",
        name: "checkout",
        message: "\u662F\u5426\u7ACB\u5373\u5207\u6362\u5230\u65B0\u5206\u652F?",
        default: true
      }
    ]);
    this.spinner = ora4("\u521B\u5EFA\u5206\u652F...").start();
    try {
      const result = await this.git.branch.create(answers.name);
      if (result.success) {
        this.spinner.succeed(`\u5206\u652F ${answers.name} \u521B\u5EFA\u6210\u529F!`);
        if (answers.checkout) {
          await this.git.checkoutBranch(answers.name);
          console.log(chalk5.green(`\u2705 \u5DF2\u5207\u6362\u5230\u5206\u652F ${answers.name}`));
        }
      } else {
        this.spinner.fail("\u521B\u5EFA\u5206\u652F\u5931\u8D25");
        console.error(chalk5.red(result.error));
      }
    } catch (error) {
      this.spinner?.fail("\u64CD\u4F5C\u5931\u8D25");
      console.error(chalk5.red("\u9519\u8BEF:"), error);
    }
    await this.pause();
  }
  /**
   * 处理切换分支
   */
  async handleBranchCheckout() {
    this.spinner = ora4("\u83B7\u53D6\u5206\u652F\u5217\u8868...").start();
    try {
      const branches = await this.git.listBranches();
      if (!branches.success || !branches.data) {
        this.spinner.fail("\u83B7\u53D6\u5206\u652F\u5931\u8D25");
        await this.pause();
        return;
      }
      this.spinner.stop();
      const branchNames = branches.data.filter((b) => !b.current).map((b) => b.name);
      if (branchNames.length === 0) {
        console.log(chalk5.yellow("\u26A0\uFE0F \u6CA1\u6709\u5176\u4ED6\u53EF\u5207\u6362\u7684\u5206\u652F"));
        await this.pause();
        return;
      }
      await registerAutocompletePrompt();
      const answer = await inquirer3.prompt([
        {
          type: "autocomplete",
          name: "branch",
          message: "\u9009\u62E9\u8981\u5207\u6362\u7684\u5206\u652F:",
          source: async (_answersSoFar, input) => {
            if (!input) return branchNames;
            return fuzzy.filter(input, branchNames).map((el) => el.original);
          }
        }
      ]);
      this.spinner = ora4("\u5207\u6362\u5206\u652F...").start();
      const result = await this.git.checkoutBranch(answer.branch);
      if (result.success) {
        this.spinner.succeed(`\u5DF2\u5207\u6362\u5230\u5206\u652F ${answer.branch}`);
      } else {
        this.spinner.fail("\u5207\u6362\u5206\u652F\u5931\u8D25");
        console.error(chalk5.red(result.error));
      }
    } catch (error) {
      this.spinner?.fail("\u64CD\u4F5C\u5931\u8D25");
      console.error(chalk5.red("\u9519\u8BEF:"), error);
    }
    await this.pause();
  }
  /**
   * 处理合并分支
   */
  async handleBranchMerge() {
    console.log(chalk5.cyan("\u{1F500} \u5206\u652F\u5408\u5E76\u529F\u80FD\u5F00\u53D1\u4E2D..."));
    await this.pause();
  }
  /**
   * 处理删除分支
   */
  async handleBranchDelete() {
    console.log(chalk5.cyan("\u274C \u5206\u652F\u5220\u9664\u529F\u80FD\u5F00\u53D1\u4E2D..."));
    await this.pause();
  }
  /**
   * 处理分支对比
   */
  async handleBranchCompare() {
    console.log(chalk5.cyan("\u{1F4CA} \u5206\u652F\u5BF9\u6BD4\u529F\u80FD\u5F00\u53D1\u4E2D..."));
    await this.pause();
  }
  /**
   * 处理状态显示
   */
  async handleStatus() {
    this.spinner = ora4("\u83B7\u53D6\u4ED3\u5E93\u72B6\u6001...").start();
    try {
      const status = await this.git.getStatus();
      if (!status.success) {
        this.spinner.fail("\u83B7\u53D6\u72B6\u6001\u5931\u8D25");
        console.error(chalk5.red(status.error));
        await this.pause();
        return;
      }
      this.spinner.succeed("\u72B6\u6001\u83B7\u53D6\u6210\u529F");
      const branch = await this.git.branch.current();
      if (branch.success) {
        console.log(chalk5.cyan(`
\u{1F4CD} \u5F53\u524D\u5206\u652F: ${branch.data}`));
      }
      this.displayChangedFiles(status.data);
      const stats = {
        staged: status.data?.staged?.length || 0,
        modified: status.data?.modified?.length || 0,
        untracked: status.data?.not_added?.length || 0,
        deleted: status.data?.deleted?.length || 0,
        conflicted: status.data?.conflicted?.length || 0
      };
      const total = Object.values(stats).reduce((a, b) => a + b, 0);
      if (total === 0) {
        console.log(chalk5.green("\n\u2728 \u5DE5\u4F5C\u76EE\u5F55\u5E72\u51C0\uFF0C\u65E0\u5F85\u63D0\u4EA4\u7684\u66F4\u6539"));
      } else {
        const statsBox = boxen2(
          chalk5.cyan("\u{1F4CA} \u7EDF\u8BA1\u4FE1\u606F\n\n") + `\u5DF2\u6682\u5B58: ${chalk5.green(stats.staged)}
\u5DF2\u4FEE\u6539: ${chalk5.yellow(stats.modified)}
\u672A\u8DDF\u8E2A: ${chalk5.gray(stats.untracked)}
\u5DF2\u5220\u9664: ${chalk5.red(stats.deleted)}
\u51B2\u7A81: ${chalk5.red(stats.conflicted)}`,
          {
            padding: 1,
            borderStyle: "round",
            borderColor: "cyan"
          }
        );
        console.log("\n" + statsBox);
      }
    } catch (error) {
      this.spinner?.fail("\u64CD\u4F5C\u5931\u8D25");
      console.error(chalk5.red("\u9519\u8BEF:"), error);
    }
    await this.pause();
  }
  /**
   * 处理同步菜单
   */
  async handleSyncMenu() {
    const choices = [
      { name: "\u2B06\uFE0F \u63A8\u9001\u5230\u8FDC\u7A0B", value: "push" },
      { name: "\u2B07\uFE0F \u4ECE\u8FDC\u7A0B\u62C9\u53D6", value: "pull" },
      { name: "\u{1F504} \u540C\u6B65\uFF08\u62C9\u53D6\u5E76\u63A8\u9001\uFF09", value: "sync" },
      { name: "\u{1F4E5} \u83B7\u53D6\u8FDC\u7A0B\u66F4\u65B0", value: "fetch" },
      { name: "\u23EA \u8FD4\u56DE", value: "back" }
    ];
    const answer = await inquirer3.prompt([
      {
        type: "list",
        name: "action",
        message: "\u9009\u62E9\u540C\u6B65\u64CD\u4F5C:",
        choices
      }
    ]);
    switch (answer.action) {
      case "push":
        await this.handlePush();
        break;
      case "pull":
        await this.handlePull();
        break;
      case "sync":
        await this.handleSync();
        break;
      case "fetch":
        await this.handleFetch();
        break;
      case "back":
        return;
    }
  }
  /**
   * 处理推送
   */
  async handlePush() {
    this.spinner = ora4("\u63A8\u9001\u5230\u8FDC\u7A0B\u4ED3\u5E93...").start();
    try {
      const result = await this.git.push();
      if (result.success) {
        this.spinner.succeed("\u63A8\u9001\u6210\u529F!");
      } else {
        this.spinner.fail("\u63A8\u9001\u5931\u8D25");
        console.error(chalk5.red(result.error));
      }
    } catch (error) {
      this.spinner?.fail("\u64CD\u4F5C\u5931\u8D25");
      console.error(chalk5.red("\u9519\u8BEF:"), error);
    }
    await this.pause();
  }
  /**
   * 处理拉取
   */
  async handlePull() {
    this.spinner = ora4("\u4ECE\u8FDC\u7A0B\u4ED3\u5E93\u62C9\u53D6...").start();
    try {
      const result = await this.git.pull();
      if (result.success) {
        this.spinner.succeed("\u62C9\u53D6\u6210\u529F!");
      } else {
        this.spinner.fail("\u62C9\u53D6\u5931\u8D25");
        console.error(chalk5.red(result.error));
      }
    } catch (error) {
      this.spinner?.fail("\u64CD\u4F5C\u5931\u8D25");
      console.error(chalk5.red("\u9519\u8BEF:"), error);
    }
    await this.pause();
  }
  /**
   * 处理同步
   */
  async handleSync() {
    this.spinner = ora4("\u540C\u6B65\u4ED3\u5E93...").start();
    try {
      this.spinner.text = "\u62C9\u53D6\u8FDC\u7A0B\u66F4\u65B0...";
      const pullResult = await this.git.pull();
      if (!pullResult.success) {
        this.spinner.fail("\u62C9\u53D6\u5931\u8D25");
        console.error(chalk5.red(pullResult.error));
        await this.pause();
        return;
      }
      this.spinner.text = "\u63A8\u9001\u672C\u5730\u66F4\u6539...";
      const pushResult = await this.git.push();
      if (pushResult.success) {
        this.spinner.succeed("\u540C\u6B65\u5B8C\u6210!");
      } else {
        this.spinner.fail("\u63A8\u9001\u5931\u8D25");
        console.error(chalk5.red(pushResult.error));
      }
    } catch (error) {
      this.spinner?.fail("\u64CD\u4F5C\u5931\u8D25");
      console.error(chalk5.red("\u9519\u8BEF:"), error);
    }
    await this.pause();
  }
  /**
   * 处理获取
   */
  async handleFetch() {
    console.log(chalk5.cyan("\u{1F4E5} \u83B7\u53D6\u8FDC\u7A0B\u66F4\u65B0\u529F\u80FD\u5F00\u53D1\u4E2D..."));
    await this.pause();
  }
  /**
   * 处理历史菜单
   */
  async handleHistoryMenu() {
    const choices = [
      { name: "\u{1F4DC} \u67E5\u770B\u63D0\u4EA4\u65E5\u5FD7", value: "log" },
      { name: "\u{1F50D} \u641C\u7D22\u63D0\u4EA4", value: "search" },
      { name: "\u{1F4CA} \u63D0\u4EA4\u7EDF\u8BA1", value: "stats" },
      { name: "\u23EA \u8FD4\u56DE", value: "back" }
    ];
    const answer = await inquirer3.prompt([
      {
        type: "list",
        name: "action",
        message: "\u9009\u62E9\u5386\u53F2\u64CD\u4F5C:",
        choices
      }
    ]);
    switch (answer.action) {
      case "log":
        await this.handleLog();
        break;
      case "search":
        await this.handleSearchCommit();
        break;
      case "stats":
        await this.handleStats();
        break;
      case "back":
        return;
    }
  }
  /**
   * 处理日志显示
   */
  async handleLog() {
    const answer = await inquirer3.prompt([
      {
        type: "number",
        name: "count",
        message: "\u663E\u793A\u6700\u8FD1\u591A\u5C11\u6761\u8BB0\u5F55?",
        default: 10,
        validate: (input) => input > 0 || "\u8BF7\u8F93\u5165\u5927\u4E8E0\u7684\u6570\u5B57"
      }
    ]);
    this.spinner = ora4("\u83B7\u53D6\u63D0\u4EA4\u65E5\u5FD7...").start();
    try {
      const logs = await this.git.getLog(answer.count);
      if (!logs.success || !logs.data) {
        this.spinner.fail("\u83B7\u53D6\u65E5\u5FD7\u5931\u8D25");
        await this.pause();
        return;
      }
      this.spinner.succeed("\u65E5\u5FD7\u83B7\u53D6\u6210\u529F");
      console.log(chalk5.cyan("\n\u{1F4DA} \u63D0\u4EA4\u5386\u53F2:\n"));
      logs.data.forEach((commit, index) => {
        const date = new Date(commit.date).toLocaleString();
        console.log(chalk5.yellow(`${index + 1}. ${commit.hash.substring(0, 7)}`));
        console.log(`   ${chalk5.white(commit.message)}`);
        console.log(`   ${chalk5.gray(`\u4F5C\u8005: ${commit.author_name}`)}`);
        console.log(`   ${chalk5.gray(`\u65F6\u95F4: ${date}`)}
`);
      });
    } catch (error) {
      this.spinner?.fail("\u64CD\u4F5C\u5931\u8D25");
      console.error(chalk5.red("\u9519\u8BEF:"), error);
    }
    await this.pause();
  }
  /**
   * 处理搜索提交
   */
  async handleSearchCommit() {
    console.log(chalk5.cyan("\u{1F50D} \u641C\u7D22\u63D0\u4EA4\u529F\u80FD\u5F00\u53D1\u4E2D..."));
    await this.pause();
  }
  /**
   * 处理统计
   */
  async handleStats() {
    console.log(chalk5.cyan("\u{1F4CA} \u63D0\u4EA4\u7EDF\u8BA1\u529F\u80FD\u5F00\u53D1\u4E2D..."));
    await this.pause();
  }
  /**
   * 处理标签菜单
   */
  async handleTagsMenu() {
    console.log(chalk5.cyan("\u{1F3F7}\uFE0F \u6807\u7B7E\u7BA1\u7406\u529F\u80FD\u5F00\u53D1\u4E2D..."));
    await this.pause();
  }
  /**
   * 处理储藏菜单
   */
  async handleStashMenu() {
    console.log(chalk5.cyan("\u{1F4E6} \u50A8\u85CF\u7BA1\u7406\u529F\u80FD\u5F00\u53D1\u4E2D..."));
    await this.pause();
  }
  /**
   * 处理工作流菜单
   */
  async handleWorkflowMenu() {
    console.log(chalk5.cyan("\u{1F527} \u5DE5\u4F5C\u6D41\u529F\u80FD\u5F00\u53D1\u4E2D..."));
    await this.pause();
  }
  /**
   * 处理快速操作菜单
   */
  async handleQuickMenu() {
    const choices = [
      { name: "\u{1F4BE} \u5FEB\u901F\u4FDD\u5B58\uFF08\u6DFB\u52A0\u6240\u6709\u5E76\u63D0\u4EA4\uFF09", value: "save" },
      { name: "\u{1F504} \u5FEB\u901F\u540C\u6B65\uFF08\u62C9\u53D6\u5E76\u63A8\u9001\uFF09", value: "sync" },
      { name: "\u{1F9F9} \u6E05\u7406\u5DE5\u4F5C\u76EE\u5F55", value: "clean" },
      { name: "\u23EA \u64A4\u9500\u6700\u540E\u4E00\u6B21\u63D0\u4EA4", value: "undo" },
      { name: "\u23EA \u8FD4\u56DE", value: "back" }
    ];
    const answer = await inquirer3.prompt([
      {
        type: "list",
        name: "action",
        message: "\u9009\u62E9\u5FEB\u901F\u64CD\u4F5C:",
        choices
      }
    ]);
    switch (answer.action) {
      case "save":
        await this.handleQuickSave();
        break;
      case "sync":
        await this.handleSync();
        break;
      case "clean":
        await this.handleClean();
        break;
      case "undo":
        await this.handleUndo();
        break;
      case "back":
        return;
    }
  }
  /**
   * 处理快速保存
   */
  async handleQuickSave() {
    this.spinner = ora4("\u5FEB\u901F\u4FDD\u5B58...").start();
    try {
      await this.git.add(".");
      const message = `Quick save at ${(/* @__PURE__ */ new Date()).toLocaleString()}`;
      const result = await this.git.commit(message);
      if (result.success) {
        this.spinner.succeed("\u5FEB\u901F\u4FDD\u5B58\u6210\u529F!");
        console.log(chalk5.green(`\u2705 \u63D0\u4EA4\u54C8\u5E0C: ${result.data?.hash}`));
      } else {
        this.spinner.fail("\u4FDD\u5B58\u5931\u8D25");
        console.error(chalk5.red(result.error));
      }
    } catch (error) {
      this.spinner?.fail("\u64CD\u4F5C\u5931\u8D25");
      console.error(chalk5.red("\u9519\u8BEF:"), error);
    }
    await this.pause();
  }
  /**
   * 处理清理
   */
  async handleClean() {
    const confirm = await inquirer3.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: "\u786E\u8BA4\u8981\u6E05\u7406\u5DE5\u4F5C\u76EE\u5F55\u5417\uFF1F\u8FD9\u5C06\u5220\u9664\u6240\u6709\u672A\u8DDF\u8E2A\u7684\u6587\u4EF6\uFF01",
        default: false
      }
    ]);
    if (!confirm.confirm) {
      console.log(chalk5.yellow("\u2716 \u5DF2\u53D6\u6D88\u6E05\u7406"));
      await this.pause();
      return;
    }
    this.spinner = ora4("\u6E05\u7406\u5DE5\u4F5C\u76EE\u5F55...").start();
    try {
      const { exec: exec4 } = await import('child_process');
      const { promisify: promisify4 } = await import('util');
      const execAsync4 = promisify4(exec4);
      await execAsync4("git clean -fd");
      this.spinner.succeed("\u6E05\u7406\u5B8C\u6210!");
    } catch (error) {
      this.spinner?.fail("\u6E05\u7406\u5931\u8D25");
      console.error(chalk5.red("\u9519\u8BEF:"), error);
    }
    await this.pause();
  }
  /**
   * 处理撤销
   */
  async handleUndo() {
    const answer = await inquirer3.prompt([
      {
        type: "list",
        name: "type",
        message: "\u9009\u62E9\u64A4\u9500\u65B9\u5F0F:",
        choices: [
          { name: "\u8F6F\u64A4\u9500\uFF08\u4FDD\u7559\u66F4\u6539\uFF09", value: "soft" },
          { name: "\u6DF7\u5408\u64A4\u9500\uFF08\u9ED8\u8BA4\uFF09", value: "mixed" },
          { name: "\u786C\u64A4\u9500\uFF08\u4E22\u5F03\u66F4\u6539\uFF09", value: "hard" }
        ]
      }
    ]);
    this.spinner = ora4("\u64A4\u9500\u63D0\u4EA4...").start();
    try {
      const { exec: exec4 } = await import('child_process');
      const { promisify: promisify4 } = await import('util');
      const execAsync4 = promisify4(exec4);
      let command = "git reset ";
      if (answer.type === "soft") {
        command += "--soft HEAD~1";
      } else if (answer.type === "hard") {
        command += "--hard HEAD~1";
      } else {
        command += "HEAD~1";
      }
      await execAsync4(command);
      this.spinner.succeed("\u64A4\u9500\u6210\u529F!");
    } catch (error) {
      this.spinner?.fail("\u64A4\u9500\u5931\u8D25");
      console.error(chalk5.red("\u9519\u8BEF:"), error);
    }
    await this.pause();
  }
  /**
   * 处理设置菜单
   */
  async handleSettingsMenu() {
    console.log(chalk5.cyan("\u2699\uFE0F \u8BBE\u7F6E\u529F\u80FD\u5F00\u53D1\u4E2D..."));
    await this.pause();
  }
  /**
   * 可视化冲突解决
   */
  async resolveConflictsVisual() {
    console.log(chalk5.cyan("\u{1F500} \u53EF\u89C6\u5316\u51B2\u7A81\u89E3\u51B3\u529F\u80FD\u5F00\u53D1\u4E2D..."));
    await this.pause();
  }
  /**
   * 显示更改的文件
   */
  displayChangedFiles(status) {
    const table = new Table({
      head: [
        chalk5.cyan("\u72B6\u6001"),
        chalk5.cyan("\u6587\u4EF6")
      ],
      style: {
        head: [],
        border: ["gray"]
      }
    });
    status?.staged?.forEach((file) => {
      table.push([chalk5.green("\u5DF2\u6682\u5B58"), file]);
    });
    status?.modified?.forEach((file) => {
      table.push([chalk5.yellow("\u5DF2\u4FEE\u6539"), file]);
    });
    status?.not_added?.forEach((file) => {
      table.push([chalk5.gray("\u672A\u8DDF\u8E2A"), file]);
    });
    status?.deleted?.forEach((file) => {
      table.push([chalk5.red("\u5DF2\u5220\u9664"), file]);
    });
    status?.conflicted?.forEach((file) => {
      table.push([chalk5.red("\u51B2\u7A81"), file]);
    });
    if (table.length > 0) {
      console.log("\n" + table.toString());
    }
  }
  /**
   * 选择要提交的文件
   */
  async selectFilesToCommit(status) {
    const files = [];
    status?.modified?.forEach((file) => {
      files.push({ name: `[M] ${file}`, value: file });
    });
    status?.not_added?.forEach((file) => {
      files.push({ name: `[?] ${file}`, value: file });
    });
    status?.deleted?.forEach((file) => {
      files.push({ name: `[D] ${file}`, value: file });
    });
    if (files.length === 0) {
      return [];
    }
    const answer = await inquirer3.prompt([
      {
        type: "checkbox",
        name: "files",
        message: "\u9009\u62E9\u8981\u63D0\u4EA4\u7684\u6587\u4EF6:",
        choices: files,
        validate: (input) => input.length > 0 || "\u8BF7\u81F3\u5C11\u9009\u62E9\u4E00\u4E2A\u6587\u4EF6"
      }
    ]);
    return answer.files;
  }
  /**
   * 生成提交信息
   */
  async generateCommitMessage() {
    const answers = await inquirer3.prompt([
      {
        type: "list",
        name: "type",
        message: "\u9009\u62E9\u63D0\u4EA4\u7C7B\u578B:",
        choices: [
          { name: "\u2728 feat: \u65B0\u529F\u80FD", value: "feat" },
          { name: "\u{1F41B} fix: \u4FEE\u590Dbug", value: "fix" },
          { name: "\u{1F4DD} docs: \u6587\u6863\u66F4\u65B0", value: "docs" },
          { name: "\u{1F484} style: \u4EE3\u7801\u683C\u5F0F", value: "style" },
          { name: "\u267B\uFE0F refactor: \u91CD\u6784", value: "refactor" },
          { name: "\u26A1 perf: \u6027\u80FD\u4F18\u5316", value: "perf" },
          { name: "\u2705 test: \u6D4B\u8BD5", value: "test" },
          { name: "\u{1F527} chore: \u6784\u5EFA/\u5DE5\u5177", value: "chore" }
        ]
      },
      {
        type: "input",
        name: "scope",
        message: "\u5F71\u54CD\u8303\u56F4 (\u53EF\u9009):"
      },
      {
        type: "input",
        name: "subject",
        message: "\u7B80\u77ED\u63CF\u8FF0:",
        validate: (input) => input.length > 0 || "\u8BF7\u8F93\u5165\u63CF\u8FF0"
      },
      {
        type: "input",
        name: "body",
        message: "\u8BE6\u7EC6\u63CF\u8FF0 (\u53EF\u9009):"
      }
    ]);
    let message = answers.type;
    if (answers.scope) {
      message += `(${answers.scope})`;
    }
    message += `: ${answers.subject}`;
    if (answers.body) {
      message += `

${answers.body}`;
    }
    return { message };
  }
  /**
   * 暂停
   */
  async pause() {
    await inquirer3.prompt([
      {
        type: "input",
        name: "continue",
        message: chalk5.gray("\u6309\u56DE\u8F66\u7EE7\u7EED...")
      }
    ]);
  }
  /**
   * 显示告别信息
   */
  showGoodbye() {
    console.clear();
    const goodbyeBox = boxen2(
      chalk5.cyan("\u{1F44B} \u611F\u8C22\u4F7F\u7528 Git \u4EA4\u4E92\u5F0F\u6A21\u5F0F\uFF01\n\n") + chalk5.gray("\u6B22\u8FCE\u4E0B\u6B21\u518D\u6765\uFF01"),
      {
        padding: 1,
        borderStyle: "round",
        borderColor: "cyan"
      }
    );
    console.log(goodbyeBox);
  }
};
var execAsync3 = promisify(exec);
var EnhancedCLI = class {
  program;
  git;
  config;
  interactive;
  workflow;
  analyzer;
  hooksManager;
  batchOps;
  spinner;
  cliConfig;
  constructor() {
    this.program = new Command();
    const cwd = process.cwd();
    this.git = Git.create(cwd);
    this.config = new ConfigManager();
    this.interactive = new InteractiveMode(this.git);
    this.workflow = new GitWorkflow(this.git);
    this.analyzer = new GitAnalyzer(this.git);
    this.hooksManager = new GitHooksManager(this.git);
    this.batchOps = new BatchOperations(this.git);
    this.cliConfig = this.loadConfig();
    this.setupTheme();
    this.setupCommands();
  }
  /**
   * 加载配置
   */
  loadConfig() {
    return {
      theme: {
        primary: "#00bcd4",
        secondary: "#8bc34a",
        success: "#4caf50",
        error: "#f44336",
        warning: "#ff9800",
        info: "#2196f3"
      },
      aliases: {},
      defaults: {},
      features: {
        autoCorrect: true,
        suggestions: true,
        animations: true,
        colors: true,
        icons: true
      }
    };
  }
  /**
   * 设置主题
   */
  setupTheme() {
    if (!this.cliConfig.features.colors) {
      chalk5.level = 0;
    }
  }
  /**
   * 显示 Logo
   */
  async showLogo() {
    if (!this.cliConfig.features.animations) return;
    const logo = figlet.textSync("LDesign Git", {
      font: "Standard",
      horizontalLayout: "default",
      verticalLayout: "default"
    });
    console.log(gradient.rainbow(logo));
    console.log();
  }
  /**
   * 显示欢迎信息
   */
  async showWelcome() {
    await this.showLogo();
    const welcomeBox = boxen2(
      chalk5.cyan("\u{1F680} \u6B22\u8FCE\u4F7F\u7528 LDesign Git \u589E\u5F3A\u7248 CLI \u5DE5\u5177 \u{1F680}\n\n") + chalk5.gray("\u63D0\u4F9B\u4EA4\u4E92\u5F0F\u754C\u9762\u3001\u667A\u80FD\u63D0\u793A\u548C\u4E30\u5BCC\u529F\u80FD\n") + chalk5.gray("\u4F7F\u7528 ") + chalk5.yellow("lgit help") + chalk5.gray(" \u67E5\u770B\u5E2E\u52A9\u4FE1\u606F\n") + chalk5.gray("\u4F7F\u7528 ") + chalk5.yellow("lgit interactive") + chalk5.gray(" \u8FDB\u5165\u4EA4\u4E92\u6A21\u5F0F\n") + chalk5.gray("\u5207\u6362\u5230\u7ECF\u5178\u6A21\u5F0F\uFF1A ") + chalk5.yellow("lgit --classic ...") + chalk5.gray(" \u6216 ") + chalk5.yellow("LGIT_MODE=classic lgit ..."),
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "cyan",
        backgroundColor: "#000000"
      }
    );
    console.log(welcomeBox);
  }
  /**
   * 设置命令
   */
  setupCommands() {
    this.program.name("lgit").description("\u589E\u5F3A\u7248 Git CLI \u5DE5\u5177").version("2.0.0").hook("preAction", async () => {
      if (process.argv.length === 2) {
        await this.showWelcome();
      }
    });
    this.program.command("interactive").alias("i").description("\u8FDB\u5165\u4EA4\u4E92\u5F0F\u6A21\u5F0F").action(async () => {
      await this.handleInteractive();
    });
    this.program.command("status").alias("st").description("\u663E\u793A\u589E\u5F3A\u7248\u4ED3\u5E93\u72B6\u6001").option("-d, --detailed", "\u663E\u793A\u8BE6\u7EC6\u4FE1\u606F").option("-b, --branch", "\u663E\u793A\u5206\u652F\u4FE1\u606F").option("-r, --remote", "\u663E\u793A\u8FDC\u7A0B\u4FE1\u606F").action(async (options) => {
      await this.handleStatus(options);
    });
    this.program.command("smart-commit [message]").alias("sc").description("\u667A\u80FD\u63D0\u4EA4\uFF08\u81EA\u52A8\u751F\u6210\u63D0\u4EA4\u4FE1\u606F\uFF09").option("-t, --type <type>", "\u63D0\u4EA4\u7C7B\u578B").option("-s, --scope <scope>", "\u5F71\u54CD\u8303\u56F4").option("-e, --emoji", "\u6DFB\u52A0 emoji").option("-a, --all", "\u63D0\u4EA4\u6240\u6709\u66F4\u6539").option("-p, --push", "\u63D0\u4EA4\u540E\u81EA\u52A8\u63A8\u9001").action(async (message, options) => {
      await this.handleSmartCommit(message, options);
    });
    this.program.command("workflow <action>").alias("wf").description("Git \u5DE5\u4F5C\u6D41\u7BA1\u7406\uFF08GitFlow, GitHub Flow\uFF09").option("-n, --name <name>", "\u5206\u652F\u540D\u79F0").option("-t, --type <type>", "\u5DE5\u4F5C\u6D41\u7C7B\u578B", "gitflow").action(async (action, options) => {
      await this.handleWorkflow(action, options);
    });
    this.program.command("analyze [type]").alias("an").description("\u4ED3\u5E93\u5206\u6790\uFF08\u7EDF\u8BA1\u3001\u8D21\u732E\u8005\u3001\u70ED\u529B\u56FE\uFF09").option("-s, --since <date>", "\u5F00\u59CB\u65E5\u671F").option("-u, --until <date>", "\u7ED3\u675F\u65E5\u671F").option("-f, --format <format>", "\u8F93\u51FA\u683C\u5F0F", "table").action(async (type, options) => {
      await this.handleAnalyze(type, options);
    });
    this.program.command("batch <operation>").alias("bt").description("\u6279\u91CF\u64CD\u4F5C\uFF08cherry-pick, revert, branch\uFF09").option("-c, --commits <commits...>", "\u63D0\u4EA4\u5217\u8868").option("-b, --branches <branches...>", "\u5206\u652F\u5217\u8868").option("-f, --force", "\u5F3A\u5236\u6267\u884C").action(async (operation, options) => {
      await this.handleBatch(operation, options);
    });
    this.program.command("resolve-conflicts").alias("rc").description("\u667A\u80FD\u51B2\u7A81\u89E3\u51B3\u52A9\u624B").option("-s, --strategy <strategy>", "\u89E3\u51B3\u7B56\u7565", "interactive").option("-v, --visual", "\u53EF\u89C6\u5316\u6A21\u5F0F").action(async (options) => {
      await this.handleResolveConflicts(options);
    });
    this.program.command("hooks <action>").alias("hk").description("Git \u94A9\u5B50\u7BA1\u7406").option("-n, --name <name>", "\u94A9\u5B50\u540D\u79F0").option("-s, --script <script>", "\u94A9\u5B50\u811A\u672C").option("-l, --list", "\u5217\u51FA\u6240\u6709\u94A9\u5B50").action(async (action, options) => {
      await this.handleHooks(action, options);
    });
    this.program.command("config <action> [key] [value]").alias("cf").description("CLI \u914D\u7F6E\u7BA1\u7406").action(async (action, key, value) => {
      await this.handleConfig(action, key, value);
    });
    this.program.command("quick <action>").alias("q").description("\u5FEB\u901F\u64CD\u4F5C\u96C6\u5408").action(async (action) => {
      await this.handleQuick(action);
    });
    this.program.command("undo [steps]").alias("u").description("\u64A4\u9500\u6700\u8FD1\u7684\u64CD\u4F5C").option("-s, --soft", "\u8F6F\u64A4\u9500").option("-h, --hard", "\u786C\u64A4\u9500").action(async (steps, options) => {
      await this.handleUndo(steps, options);
    });
    this.program.command("timemachine").alias("tm").description("\u65F6\u5149\u673A - \u67E5\u770B\u4ED3\u5E93\u5386\u53F2\u53D8\u5316").option("-d, --date <date>", "\u6307\u5B9A\u65E5\u671F").option("-c, --commit <commit>", "\u6307\u5B9A\u63D0\u4EA4").action(async (options) => {
      await this.handleTimeMachine(options);
    });
    this.program.command("tags <action> [name]").alias("tg").description("\u589E\u5F3A\u7248\u6807\u7B7E\u7BA1\u7406").option("-m, --message <message>", "\u6807\u7B7E\u4FE1\u606F").option("-f, --force", "\u5F3A\u5236\u64CD\u4F5C").option("-p, --push", "\u63A8\u9001\u6807\u7B7E").action(async (action, name, options) => {
      await this.handleTags(action, name, options);
    });
    this.program.command("alias <action> [name] [command]").description("\u7BA1\u7406\u547D\u4EE4\u522B\u540D").action(async (action, name, command) => {
      await this.handleAlias(action, name, command);
    });
    this.program.command("doctor").alias("dr").description("\u8BCA\u65AD\u4ED3\u5E93\u95EE\u9898").action(async () => {
      await this.handleDoctor();
    });
  }
  /**
   * 处理交互模式
   */
  async handleInteractive() {
    await this.interactive.start();
  }
  /**
   * 处理状态命令
   */
  async handleStatus(options) {
    this.spinner = ora4("\u83B7\u53D6\u4ED3\u5E93\u72B6\u6001...").start();
    try {
      const status = await this.git.getStatus();
      if (!status.success) {
        this.spinner.fail("\u83B7\u53D6\u72B6\u6001\u5931\u8D25");
        console.error(chalk5.red(status.error));
        return;
      }
      this.spinner.succeed("\u72B6\u6001\u83B7\u53D6\u6210\u529F");
      const table = new Table({
        head: [
          chalk5.cyan("\u7C7B\u578B"),
          chalk5.cyan("\u6587\u4EF6"),
          chalk5.cyan("\u72B6\u6001")
        ],
        style: {
          head: [],
          border: ["cyan"]
        }
      });
      status.data?.staged?.forEach((file) => {
        table.push([
          chalk5.green("\u2713 \u5DF2\u6682\u5B58"),
          file,
          chalk5.green("\u51C6\u5907\u63D0\u4EA4")
        ]);
      });
      status.data?.modified?.forEach((file) => {
        table.push([
          chalk5.yellow("\u270E \u5DF2\u4FEE\u6539"),
          file,
          chalk5.yellow("\u672A\u6682\u5B58")
        ]);
      });
      status.data?.not_added?.forEach((file) => {
        table.push([
          chalk5.gray("? \u672A\u8DDF\u8E2A"),
          file,
          chalk5.gray("\u65B0\u6587\u4EF6")
        ]);
      });
      status.data?.deleted?.forEach((file) => {
        table.push([
          chalk5.red("\u2717 \u5DF2\u5220\u9664"),
          file,
          chalk5.red("\u5F85\u786E\u8BA4")
        ]);
      });
      status.data?.conflicted?.forEach((file) => {
        table.push([
          chalk5.red("\u26A0 \u51B2\u7A81"),
          file,
          chalk5.red("\u9700\u8981\u89E3\u51B3")
        ]);
      });
      if (table.length > 0) {
        console.log("\n" + table.toString());
      } else {
        console.log(chalk5.green("\n\u2728 \u5DE5\u4F5C\u76EE\u5F55\u5E72\u51C0\uFF0C\u65E0\u5F85\u63D0\u4EA4\u7684\u66F4\u6539"));
      }
      if (options.branch || options.detailed) {
        const branchInfo = await this.git.branch.current();
        if (branchInfo.success) {
          console.log(chalk5.cyan(`
\u{1F4CD} \u5F53\u524D\u5206\u652F: ${branchInfo.data}`));
        }
      }
      if (options.remote || options.detailed) {
        const remotes = await this.git.listRemotes();
        if (remotes.success && (remotes.data?.length ?? 0) > 0) {
          console.log(chalk5.cyan("\n\u{1F310} \u8FDC\u7A0B\u4ED3\u5E93:"));
          remotes.data.forEach((remote) => {
            console.log(`  ${chalk5.yellow(remote.name)}: ${remote.refs?.fetch || "N/A"}`);
          });
        }
      }
      if (options.detailed) {
        const stats = {
          staged: status.data?.staged?.length || 0,
          modified: status.data?.modified?.length || 0,
          untracked: status.data?.not_added?.length || 0,
          deleted: status.data?.deleted?.length || 0,
          conflicted: status.data?.conflicted?.length || 0
        };
        const statsBox = boxen2(
          chalk5.cyan("\u{1F4CA} \u7EDF\u8BA1\u4FE1\u606F\n\n") + `\u5DF2\u6682\u5B58: ${chalk5.green(stats.staged)}
\u5DF2\u4FEE\u6539: ${chalk5.yellow(stats.modified)}
\u672A\u8DDF\u8E2A: ${chalk5.gray(stats.untracked)}
\u5DF2\u5220\u9664: ${chalk5.red(stats.deleted)}
\u51B2\u7A81: ${chalk5.red(stats.conflicted)}`,
          {
            padding: 1,
            borderStyle: "round",
            borderColor: "cyan"
          }
        );
        console.log("\n" + statsBox);
      }
    } catch (error) {
      this.spinner?.fail("\u64CD\u4F5C\u5931\u8D25");
      console.error(chalk5.red("\u9519\u8BEF:"), error);
    }
  }
  /**
   * 处理智能提交
   */
  async handleSmartCommit(message, options) {
    try {
      if (!message) {
        const answers = await inquirer3.prompt([
          {
            type: "list",
            name: "type",
            message: "\u9009\u62E9\u63D0\u4EA4\u7C7B\u578B:",
            choices: [
              { name: "\u2728 feat: \u65B0\u529F\u80FD", value: "feat" },
              { name: "\u{1F41B} fix: \u4FEE\u590Dbug", value: "fix" },
              { name: "\u{1F4DD} docs: \u6587\u6863\u66F4\u65B0", value: "docs" },
              { name: "\u{1F484} style: \u4EE3\u7801\u683C\u5F0F", value: "style" },
              { name: "\u267B\uFE0F refactor: \u91CD\u6784", value: "refactor" },
              { name: "\u26A1 perf: \u6027\u80FD\u4F18\u5316", value: "perf" },
              { name: "\u2705 test: \u6D4B\u8BD5", value: "test" },
              { name: "\u{1F527} chore: \u6784\u5EFA/\u5DE5\u5177", value: "chore" }
            ]
          },
          {
            type: "input",
            name: "scope",
            message: "\u5F71\u54CD\u8303\u56F4 (\u53EF\u9009):",
            when: () => !options?.scope
          },
          {
            type: "input",
            name: "subject",
            message: "\u7B80\u77ED\u63CF\u8FF0:",
            validate: (input) => input.length > 0 || "\u8BF7\u8F93\u5165\u63CF\u8FF0"
          },
          {
            type: "editor",
            name: "body",
            message: "\u8BE6\u7EC6\u63CF\u8FF0 (\u53EF\u9009):"
          },
          {
            type: "confirm",
            name: "breaking",
            message: "\u662F\u5426\u5305\u542B\u7834\u574F\u6027\u53D8\u66F4?",
            default: false
          }
        ]);
        const type = answers.type || options?.type;
        const scope = answers.scope || options?.scope;
        const emoji = this.getCommitEmoji(type);
        message = emoji + " " + type;
        if (scope) {
          message += `(${scope})`;
        }
        message += `: ${answers.subject}`;
        if (answers.body) {
          message += `

${answers.body}`;
        }
        if (answers.breaking) {
          message += "\n\nBREAKING CHANGE: ";
        }
      }
      if (options?.all) {
        await this.git.add(".");
      }
      this.spinner = ora4("\u6B63\u5728\u63D0\u4EA4...").start();
      const result = await this.git.commit(message);
      if (result.success) {
        this.spinner.succeed("\u63D0\u4EA4\u6210\u529F!");
        console.log(chalk5.green(`\u2705 \u63D0\u4EA4\u54C8\u5E0C: ${result.data?.hash}`));
        if (options?.push) {
          this.spinner = ora4("\u6B63\u5728\u63A8\u9001...").start();
          const pushResult = await this.git.push();
          if (pushResult.success) {
            this.spinner.succeed("\u63A8\u9001\u6210\u529F!");
          } else {
            this.spinner.fail("\u63A8\u9001\u5931\u8D25");
            console.error(chalk5.red(pushResult.error));
          }
        }
      } else {
        this.spinner.fail("\u63D0\u4EA4\u5931\u8D25");
        console.error(chalk5.red(result.error));
      }
    } catch (error) {
      this.spinner?.fail("\u64CD\u4F5C\u5931\u8D25");
      console.error(chalk5.red("\u9519\u8BEF:"), error);
    }
  }
  /**
   * 获取提交类型对应的 emoji
   */
  getCommitEmoji(type) {
    const emojiMap = {
      feat: "\u2728",
      fix: "\u{1F41B}",
      docs: "\u{1F4DD}",
      style: "\u{1F484}",
      refactor: "\u267B\uFE0F",
      perf: "\u26A1",
      test: "\u2705",
      chore: "\u{1F527}",
      revert: "\u23EA",
      build: "\u{1F4E6}",
      ci: "\u{1F477}",
      wip: "\u{1F6A7}"
    };
    return emojiMap[type] || "\u{1F4DD}";
  }
  /**
   * 处理工作流
   */
  async handleWorkflow(action, options) {
    await this.workflow.handle(action, options);
  }
  /**
   * 处理分析
   */
  async handleAnalyze(type = "all", options) {
    await this.analyzer.analyze(type, options);
  }
  /**
   * 处理批量操作
   */
  async handleBatch(operation, options) {
    await this.batchOps.execute(operation, options);
  }
  /**
   * 处理冲突解决
   */
  async handleResolveConflicts(options) {
    const resolver = new ConflictResolver(this.git);
    if (options.visual) {
      await this.interactive.resolveConflictsVisual();
    } else {
      const result = await resolver.resolveConflicts({
        strategy: options.strategy || "manual",
        autoResolve: options.strategy !== "manual"
      });
      if (result.resolved) {
        console.log(chalk5.green("\u2705 \u6240\u6709\u51B2\u7A81\u5DF2\u89E3\u51B3"));
      } else {
        console.log(chalk5.yellow("\u26A0\uFE0F \u8FD8\u6709\u672A\u89E3\u51B3\u7684\u51B2\u7A81:"));
        result.unresolvedFiles.forEach((file) => {
          console.log(chalk5.red(`  - ${file}`));
        });
      }
    }
  }
  /**
   * 处理钩子管理
   */
  async handleHooks(action, options) {
    await this.hooksManager.manage(action, options);
  }
  /**
   * 处理配置
   */
  async handleConfig(action, key, value) {
    switch (action) {
      case "get":
        if (key) {
          const val = this.config.get(key);
          console.log(val || chalk5.yellow("\u672A\u8BBE\u7F6E"));
        } else {
          console.log(this.config.getAll());
        }
        break;
      case "set":
        if (key && value) {
          this.config.set(key, value);
          console.log(chalk5.green(`\u2705 \u5DF2\u8BBE\u7F6E ${key} = ${value}`));
        } else {
          console.error(chalk5.red("\u8BF7\u63D0\u4F9B\u952E\u548C\u503C"));
        }
        break;
      case "list":
        const all = this.config.getAll();
        console.log(chalk5.cyan("\u5F53\u524D\u914D\u7F6E:"));
        console.log(JSON.stringify(all, null, 2));
        break;
      case "reset":
        this.config.reset();
        console.log(chalk5.green("\u2705 \u914D\u7F6E\u5DF2\u91CD\u7F6E"));
        break;
      default:
        console.error(chalk5.red("\u672A\u77E5\u64CD\u4F5C"));
    }
  }
  /**
   * 处理快速操作
   */
  async handleQuick(action) {
    const quickActions = {
      "save": async () => {
        await this.git.add(".");
        const message = `Quick save at ${(/* @__PURE__ */ new Date()).toLocaleString()}`;
        await this.git.commit(message);
        console.log(chalk5.green("\u2705 \u5FEB\u901F\u4FDD\u5B58\u5B8C\u6210"));
      },
      "sync": async () => {
        await this.git.pull();
        await this.git.push();
        console.log(chalk5.green("\u2705 \u5FEB\u901F\u540C\u6B65\u5B8C\u6210"));
      },
      "clean": async () => {
        await execAsync3("git clean -fd");
        console.log(chalk5.green("\u2705 \u6E05\u7406\u5B8C\u6210"));
      },
      "amend": async () => {
        await execAsync3("git commit --amend --no-edit");
        console.log(chalk5.green("\u2705 \u63D0\u4EA4\u5DF2\u4FEE\u6539"));
      }
    };
    const fn = quickActions[action];
    if (fn) {
      await fn();
    } else {
      console.error(chalk5.red(`\u672A\u77E5\u7684\u5FEB\u901F\u64CD\u4F5C: ${action}`));
      console.log(chalk5.cyan("\u53EF\u7528\u64CD\u4F5C: save, sync, clean, amend"));
    }
  }
  /**
   * 处理撤销
   */
  async handleUndo(steps = "1", options) {
    const numSteps = parseInt(steps);
    if (options.hard) {
      await execAsync3(`git reset --hard HEAD~${numSteps}`);
      console.log(chalk5.green(`\u2705 \u5DF2\u786C\u64A4\u9500 ${numSteps} \u4E2A\u63D0\u4EA4`));
    } else if (options.soft) {
      await execAsync3(`git reset --soft HEAD~${numSteps}`);
      console.log(chalk5.green(`\u2705 \u5DF2\u8F6F\u64A4\u9500 ${numSteps} \u4E2A\u63D0\u4EA4`));
    } else {
      await execAsync3(`git reset HEAD~${numSteps}`);
      console.log(chalk5.green(`\u2705 \u5DF2\u64A4\u9500 ${numSteps} \u4E2A\u63D0\u4EA4`));
    }
  }
  /**
   * 处理时光机
   */
  async handleTimeMachine(options) {
    console.log(chalk5.cyan("\u{1F570}\uFE0F \u65F6\u5149\u673A\u529F\u80FD\u5F00\u53D1\u4E2D..."));
  }
  /**
   * 处理标签
   */
  async handleTags(action, name, options) {
    switch (action) {
      case "list":
        const tags = await execAsync3("git tag -l");
        console.log(chalk5.cyan("\u6807\u7B7E\u5217\u8868:"));
        console.log(tags.stdout);
        break;
      case "create":
        if (!name) {
          console.error(chalk5.red("\u8BF7\u63D0\u4F9B\u6807\u7B7E\u540D\u79F0"));
          return;
        }
        const message = options?.message || `Tag ${name}`;
        await execAsync3(`git tag -a ${name} -m "${message}"`);
        console.log(chalk5.green(`\u2705 \u6807\u7B7E ${name} \u5DF2\u521B\u5EFA`));
        if (options?.push) {
          await execAsync3(`git push origin ${name}`);
          console.log(chalk5.green("\u2705 \u6807\u7B7E\u5DF2\u63A8\u9001"));
        }
        break;
      case "delete":
        if (!name) {
          console.error(chalk5.red("\u8BF7\u63D0\u4F9B\u6807\u7B7E\u540D\u79F0"));
          return;
        }
        await execAsync3(`git tag -d ${name}`);
        console.log(chalk5.green(`\u2705 \u6807\u7B7E ${name} \u5DF2\u5220\u9664`));
        break;
      default:
        console.error(chalk5.red("\u672A\u77E5\u64CD\u4F5C"));
    }
  }
  /**
   * 处理别名
   */
  async handleAlias(action, name, command) {
    switch (action) {
      case "add":
        if (!name || !command) {
          console.error(chalk5.red("\u8BF7\u63D0\u4F9B\u522B\u540D\u548C\u547D\u4EE4"));
          return;
        }
        this.config.setAlias(name, command);
        console.log(chalk5.green(`\u2705 \u522B\u540D ${name} \u5DF2\u6DFB\u52A0`));
        break;
      case "remove":
        if (!name) {
          console.error(chalk5.red("\u8BF7\u63D0\u4F9B\u522B\u540D"));
          return;
        }
        this.config.removeAlias(name);
        console.log(chalk5.green(`\u2705 \u522B\u540D ${name} \u5DF2\u5220\u9664`));
        break;
      case "list":
        const aliases = this.config.getAliases();
        console.log(chalk5.cyan("\u547D\u4EE4\u522B\u540D:"));
        Object.entries(aliases).forEach(([alias, cmd]) => {
          console.log(`  ${chalk5.yellow(alias)} => ${cmd}`);
        });
        break;
      default:
        console.error(chalk5.red("\u672A\u77E5\u64CD\u4F5C"));
    }
  }
  /**
   * 处理诊断
   */
  async handleDoctor() {
    console.log(chalk5.cyan("\u{1F50D} \u5F00\u59CB\u8BCA\u65AD\u4ED3\u5E93..."));
    const checks = [
      {
        name: "Git \u5B89\u88C5",
        check: async () => {
          try {
            await execAsync3("git --version");
            return { ok: true, message: "\u5DF2\u5B89\u88C5" };
          } catch {
            return { ok: false, message: "\u672A\u5B89\u88C5" };
          }
        }
      },
      {
        name: "\u4ED3\u5E93\u72B6\u6001",
        check: async () => {
          const isRepo = await this.git.isRepo();
          return { ok: isRepo, message: isRepo ? "\u6B63\u5E38" : "\u4E0D\u662F Git \u4ED3\u5E93" };
        }
      },
      {
        name: "\u8FDC\u7A0B\u8FDE\u63A5",
        check: async () => {
          try {
            const remotes = await this.git.listRemotes();
            return { ok: remotes.success, message: "\u6B63\u5E38" };
          } catch {
            return { ok: false, message: "\u65E0\u6CD5\u8FDE\u63A5" };
          }
        }
      },
      {
        name: "\u5DE5\u4F5C\u76EE\u5F55",
        check: async () => {
          const status = await this.git.getStatus();
          const clean = status.data?.staged?.length === 0 && status.data?.modified?.length === 0;
          return { ok: true, message: clean ? "\u5E72\u51C0" : "\u6709\u672A\u63D0\u4EA4\u7684\u66F4\u6539" };
        }
      }
    ];
    const results = [];
    for (const check of checks) {
      const spinner = ora4(check.name).start();
      const result = await check.check();
      if (result.ok) {
        spinner.succeed(`${check.name}: ${chalk5.green(result.message)}`);
      } else {
        spinner.fail(`${check.name}: ${chalk5.red(result.message)}`);
      }
      results.push(result);
    }
    const allOk = results.every((r) => r.ok);
    console.log();
    if (allOk) {
      console.log(chalk5.green("\u2705 \u6240\u6709\u68C0\u67E5\u901A\u8FC7\uFF01"));
    } else {
      console.log(chalk5.yellow("\u26A0\uFE0F \u53D1\u73B0\u4E00\u4E9B\u95EE\u9898\uFF0C\u8BF7\u68C0\u67E5\u4E0A\u8FF0\u7EA2\u8272\u9879\u76EE"));
    }
  }
  /**
   * 运行 CLI
   */
  async run() {
    try {
      await this.program.parseAsync(process.argv);
    } catch (error) {
      console.error(chalk5.red("\u9519\u8BEF:"), error);
      process.exit(1);
    }
  }
};
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new EnhancedCLI();
  cli.run();
}
var GitOperations = class _GitOperations {
  commandRunner;
  logger;
  repoPath;
  constructor(repoPath = process.cwd(), logger) {
    this.repoPath = PathUtils.resolve(repoPath);
    this.commandRunner = new CommandRunner();
    this.logger = logger || new ConsoleLogger({ level: "info" });
    this.validateRepository();
  }
  /**
   * 验证是否为有效的 Git 仓库
   */
  async validateRepository() {
    const gitDir = PathUtils.join(this.repoPath, ".git");
    if (!await FileSystem.exists(gitDir)) {
      throw GitError.repositoryNotFound(this.repoPath);
    }
  }
  /**
   * 执行 Git 命令
   */
  async exec(args, options = {}) {
    const command = `git ${args.join(" ")}`;
    if (!options.silent) {
      this.logger.debug(`Executing: ${command}`);
    }
    try {
      const result = await this.commandRunner.run(command, {
        cwd: this.repoPath,
        timeout: 6e4
      });
      if (result.exitCode !== 0) {
        throw new GitError(
          "COMMAND_FAILED" /* COMMAND_FAILED */,
          `Git command failed: ${command}`,
          void 0,
          result.stderr
        );
      }
      return result.stdout.trim();
    } catch (error) {
      if (error instanceof GitError) {
        throw error;
      }
      throw new GitError(
        "COMMAND_FAILED" /* COMMAND_FAILED */,
        `Failed to execute git command: ${command}`,
        error
      );
    }
  }
  /**
   * 获取仓库状态
   */
  async status(options = {}) {
    const args = ["status", "--porcelain=v1"];
    if (!options.short) {
      args.push("-b");
    }
    const output = await this.exec(args);
    const lines = output.split("\n").filter(Boolean);
    const status = {
      branch: "",
      ahead: 0,
      behind: 0,
      staged: [],
      modified: [],
      untracked: [],
      deleted: [],
      renamed: [],
      conflicted: []
    };
    for (const line of lines) {
      if (line.startsWith("##")) {
        const match = line.match(/## (.+?)(?:\.{3}(.+?))?(?:\s+\[(.+?)\])?$/);
        if (match) {
          status.branch = match[1];
          if (match[3]) {
            const ahead = match[3].match(/ahead (\d+)/);
            const behind = match[3].match(/behind (\d+)/);
            if (ahead) status.ahead = parseInt(ahead[1]);
            if (behind) status.behind = parseInt(behind[1]);
          }
        }
      } else {
        const file = line.substring(3);
        const x = line[0];
        const y = line[1];
        if (x === "A" || y === "A") status.staged.push(file);
        if (x === "M" || y === "M") status.modified.push(file);
        if (x === "D" || y === "D") status.deleted.push(file);
        if (x === "R" || y === "R") status.renamed.push(file);
        if (x === "?" && y === "?") status.untracked.push(file);
        if (x === "U" || y === "U") status.conflicted.push(file);
      }
    }
    return status;
  }
  /**
   * 添加文件到暂存区
   */
  async add(files = ".") {
    const fileList = Array.isArray(files) ? files : [files];
    const spinner = new LoadingSpinner({
      text: "Adding files to staging area..."
    });
    spinner.start();
    try {
      await this.exec(["add", ...fileList]);
      spinner.succeed("Files added successfully");
    } catch (error) {
      spinner.fail("Failed to add files");
      throw error;
    }
  }
  /**
   * 提交更改
   */
  async commit(message, options = {}) {
    const args = ["commit"];
    if (options.amend) args.push("--amend");
    if (options.noEdit) args.push("--no-edit");
    if (options.signoff) args.push("--signoff");
    if (options.author) args.push("--author", options.author);
    if (options.date) args.push("--date", options.date);
    if (options.allowEmpty) args.push("--allow-empty");
    if (!options.amend || !options.noEdit) {
      args.push("-m", message);
    }
    const spinner = new LoadingSpinner({
      text: "Committing changes..."
    });
    spinner.start();
    try {
      const output = await this.exec(args);
      const commitHash = output.match(/\[.+? ([a-f0-9]+)\]/)?.[1] || "";
      spinner.succeed(`Committed successfully: ${commitHash}`);
      return commitHash;
    } catch (error) {
      spinner.fail("Failed to commit");
      throw error;
    }
  }
  /**
   * 推送到远程仓库
   */
  async push(options = {}) {
    const args = ["push"];
    if (options.force) args.push("--force");
    if (options.setUpstream) args.push("--set-upstream");
    if (options.tags) args.push("--tags");
    if (options.all) args.push("--all");
    if (options.remote) args.push(options.remote);
    if (options.branch) args.push(options.branch);
    const progressBar = new ProgressBar({
      total: 100,
      format: "Pushing [{bar}] {percentage}% | {value}/{total}"
    });
    try {
      await this.exec(args, { silent: true });
      progressBar.update(100);
      progressBar.stop();
      this.logger.success("Push completed successfully");
    } catch (error) {
      progressBar.stop();
      throw error;
    }
  }
  /**
   * 从远程仓库拉取
   */
  async pull(options = {}) {
    const args = ["pull"];
    if (options.rebase) args.push("--rebase");
    if (options.noCommit) args.push("--no-commit");
    if (options.noFf) args.push("--no-ff");
    if (options.strategy) args.push("--strategy", options.strategy);
    if (options.remote) args.push(options.remote);
    if (options.branch) args.push(options.branch);
    const spinner = new LoadingSpinner({
      text: "Pulling from remote..."
    });
    spinner.start();
    try {
      await this.exec(args);
      spinner.succeed("Pull completed successfully");
    } catch (error) {
      spinner.fail("Failed to pull");
      throw error;
    }
  }
  /**
   * 获取提交日志
   */
  async log(options = {}) {
    const args = ["log", "--format=%H|%an|%ae|%at|%s|%b"];
    if (options.maxCount) args.push("-n", options.maxCount.toString());
    if (options.since) args.push("--since", options.since);
    if (options.until) args.push("--until", options.until);
    if (options.author) args.push("--author", options.author);
    if (options.grep) args.push("--grep", options.grep);
    if (options.reverse) args.push("--reverse");
    if (options.oneline) args.push("--oneline");
    const output = await this.exec(args);
    const commits = [];
    for (const line of output.split("\n").filter(Boolean)) {
      const [hash, author, email, timestamp, subject, body] = line.split("|");
      commits.push({
        hash,
        author,
        email,
        date: new Date(parseInt(timestamp) * 1e3),
        subject,
        body: body || ""
      });
    }
    return commits;
  }
  /**
   * 获取差异
   */
  async diff(options = {}) {
    const args = ["diff"];
    if (options.cached) args.push("--cached");
    if (options.nameOnly) args.push("--name-only");
    if (options.stat) args.push("--stat");
    if (options.numstat) args.push("--numstat");
    if (options.color) args.push("--color");
    if (options.noColor) args.push("--no-color");
    if (options.base) args.push(options.base);
    if (options.head) args.push(options.head);
    if (options.paths) args.push("--", ...options.paths);
    return await this.exec(args);
  }
  /**
   * 创建分支
   */
  async createBranch(name, options = {}) {
    const args = options.checkout ? ["checkout", "-b"] : ["branch"];
    if (options.force) args.push("-f");
    args.push(name);
    if (options.from) args.push(options.from);
    await this.exec(args);
    this.logger.success(`Branch '${name}' created successfully`);
  }
  /**
   * 切换分支
   */
  async checkout(target, options = {}) {
    const args = ["checkout"];
    if (options.create) args.push("-b");
    if (options.force) args.push("-f");
    if (options.track) args.push("--track");
    args.push(target);
    const spinner = new LoadingSpinner({
      text: `Switching to ${target}...`
    });
    spinner.start();
    try {
      await this.exec(args);
      spinner.succeed(`Switched to ${target}`);
    } catch (error) {
      spinner.fail(`Failed to switch to ${target}`);
      throw error;
    }
  }
  /**
   * 合并分支
   */
  async merge(branch, options = {}) {
    const args = ["merge"];
    if (options.noCommit) args.push("--no-commit");
    if (options.noFf) args.push("--no-ff");
    if (options.ffOnly) args.push("--ff-only");
    if (options.squash) args.push("--squash");
    if (options.strategy) args.push("--strategy", options.strategy);
    if (options.message) args.push("-m", options.message);
    args.push(branch);
    const spinner = new LoadingSpinner({
      text: `Merging ${branch}...`
    });
    spinner.start();
    try {
      await this.exec(args);
      spinner.succeed(`Merged ${branch} successfully`);
    } catch (error) {
      spinner.fail(`Failed to merge ${branch}`);
      throw error;
    }
  }
  /**
   * 变基操作
   */
  async rebase(options = {}) {
    const args = ["rebase"];
    if (options.interactive) args.push("-i");
    if (options.continue) args.push("--continue");
    if (options.abort) args.push("--abort");
    if (options.skip) args.push("--skip");
    if (options.onto) args.push(options.onto);
    await this.exec(args);
    this.logger.success("Rebase completed successfully");
  }
  /**
   * 获取所有分支
   */
  async branches(options = {}) {
    const args = ["branch"];
    if (options.all) args.push("-a");
    if (options.remote) args.push("-r");
    if (options.merged) args.push("--merged");
    if (options.noMerged) args.push("--no-merged");
    args.push("-v");
    const output = await this.exec(args);
    const branches = [];
    for (const line of output.split("\n").filter(Boolean)) {
      const current = line.startsWith("*");
      const name = line.substring(2).split(" ")[0];
      const remote = line.includes("remotes/");
      branches.push({
        name: name.replace("remotes/", ""),
        current,
        remote
      });
    }
    return branches;
  }
  /**
   * 删除分支
   */
  async deleteBranch(name, options = {}) {
    if (options.remote) {
      const [remote, branch] = name.includes("/") ? name.split("/") : ["origin", name];
      await this.exec(["push", remote, "--delete", branch]);
    } else {
      const args = ["branch", options.force ? "-D" : "-d", name];
      await this.exec(args);
    }
    this.logger.success(`Branch '${name}' deleted successfully`);
  }
  /**
   * 获取远程仓库列表
   */
  async remotes() {
    const output = await this.exec(["remote", "-v"]);
    const remotes = /* @__PURE__ */ new Map();
    for (const line of output.split("\n").filter(Boolean)) {
      const [name, url, type] = line.split(/\s+/);
      if (!remotes.has(name)) {
        remotes.set(name, { name, fetchUrl: "", pushUrl: "" });
      }
      const remote = remotes.get(name);
      if (type === "(fetch)") {
        remote.fetchUrl = url;
      } else if (type === "(push)") {
        remote.pushUrl = url;
      }
    }
    return Array.from(remotes.values());
  }
  /**
   * 添加远程仓库
   */
  async addRemote(name, url) {
    await this.exec(["remote", "add", name, url]);
    this.logger.success(`Remote '${name}' added successfully`);
  }
  /**
   * 删除远程仓库
   */
  async removeRemote(name) {
    await this.exec(["remote", "remove", name]);
    this.logger.success(`Remote '${name}' removed successfully`);
  }
  /**
   * 获取标签列表
   */
  async tags(pattern) {
    const args = ["tag", "-l"];
    if (pattern) args.push(pattern);
    const output = await this.exec(args);
    return output.split("\n").filter(Boolean);
  }
  /**
   * 创建标签
   */
  async createTag(name, options = {}) {
    const args = ["tag"];
    if (options.annotated || options.message) args.push("-a");
    if (options.message) args.push("-m", options.message);
    if (options.force) args.push("-f");
    if (options.sign) args.push("-s");
    args.push(name);
    await this.exec(args);
    this.logger.success(`Tag '${name}' created successfully`);
  }
  /**
   * 删除标签
   */
  async deleteTag(name, options = {}) {
    await this.exec(["tag", "-d", name]);
    if (options.remote) {
      await this.exec(["push", options.remote, "--delete", name]);
    }
    this.logger.success(`Tag '${name}' deleted successfully`);
  }
  /**
   * 储藏工作区
   */
  async stash(options = {}) {
    const args = ["stash", "push"];
    if (options.message) args.push("-m", options.message);
    if (options.includeUntracked) args.push("-u");
    if (options.keepIndex) args.push("--keep-index");
    await this.exec(args);
    this.logger.success("Changes stashed successfully");
  }
  /**
   * 恢复储藏
   */
  async stashPop(index = 0) {
    await this.exec(["stash", "pop", `stash@{${index}}`]);
    this.logger.success("Stash applied successfully");
  }
  /**
   * 获取储藏列表
   */
  async stashList() {
    const output = await this.exec(["stash", "list"]);
    return output.split("\n").filter(Boolean);
  }
  /**
   * 重置到指定提交
   */
  async reset(options = {}) {
    const args = ["reset"];
    if (options.mode) args.push(`--${options.mode}`);
    if (options.target) args.push(options.target);
    await this.exec(args);
    this.logger.success("Reset completed successfully");
  }
  /**
   * 清理工作区
   */
  async clean(options = {}) {
    const args = ["clean"];
    if (options.force) args.push("-f");
    if (options.directories) args.push("-d");
    if (options.ignored) args.push("-x");
    if (options.dryRun) args.push("-n");
    const output = await this.exec(args);
    if (options.dryRun) {
      this.logger.info("Files that would be removed:\n" + output);
    } else {
      this.logger.success("Working directory cleaned");
    }
  }
  /**
   * 获取配置
   */
  async getConfig(key, options = {}) {
    const args = ["config"];
    if (options.global) args.push("--global");
    if (options.local) args.push("--local");
    if (options.system) args.push("--system");
    args.push("--get", key);
    try {
      return await this.exec(args);
    } catch {
      return "";
    }
  }
  /**
   * 设置配置
   */
  async setConfig(key, value, options = {}) {
    const args = ["config"];
    if (options.global) args.push("--global");
    if (options.local) args.push("--local");
    if (options.system) args.push("--system");
    args.push(key, value);
    await this.exec(args);
    this.logger.success(`Config '${key}' set to '${value}'`);
  }
  /**
   * 克隆仓库
   */
  static async clone(url, destination, options = {}) {
    const commandRunner = new CommandRunner();
    const spinner = new LoadingSpinner({
      text: `Cloning ${url}...`
    });
    spinner.start();
    const args = ["clone"];
    if (options.depth) args.push("--depth", options.depth.toString());
    if (options.branch) args.push("--branch", options.branch);
    if (options.single) args.push("--single-branch");
    if (options.noCheckout) args.push("--no-checkout");
    if (options.bare) args.push("--bare");
    if (options.mirror) args.push("--mirror");
    if (options.recursive) args.push("--recursive");
    args.push(url);
    if (destination) args.push(destination);
    try {
      const result = await commandRunner.run(`git ${args.join(" ")}`, {
        timeout: 3e5
        // 5 minutes for clone
      });
      if (result.exitCode !== 0) {
        throw new GitError(
          "CLONE_FAILED" /* CLONE_FAILED */,
          `Failed to clone repository: ${url}`,
          void 0,
          result.stderr
        );
      }
      spinner.succeed("Repository cloned successfully");
      const repoPath = destination || url.split("/").pop()?.replace(".git", "") || ".";
      return new _GitOperations(repoPath);
    } catch (error) {
      spinner.fail("Failed to clone repository");
      throw error;
    }
  }
  /**
   * 初始化仓库
   */
  static async init(path = ".", options = {}) {
    const commandRunner = new CommandRunner();
    const args = ["init"];
    if (options.bare) args.push("--bare");
    if (options.initialBranch) args.push("--initial-branch", options.initialBranch);
    args.push(path);
    const result = await commandRunner.run(`git ${args.join(" ")}`, {
      cwd: path
    });
    if (result.exitCode !== 0) {
      throw new GitError(
        "COMMAND_FAILED" /* COMMAND_FAILED */,
        `Failed to initialize repository: ${path}`,
        void 0,
        result.stderr
      );
    }
    return new _GitOperations(path);
  }
  /**
   * 获取当前分支名
   */
  async getCurrentBranch() {
    return await this.exec(["rev-parse", "--abbrev-ref", "HEAD"]);
  }
  /**
   * 获取最新提交哈希
   */
  async getLatestCommit() {
    return await this.exec(["rev-parse", "HEAD"]);
  }
  /**
   * 检查是否有未提交的更改
   */
  async hasUncommittedChanges() {
    const status = await this.status();
    return status.staged.length > 0 || status.modified.length > 0 || status.deleted.length > 0 || status.untracked.length > 0;
  }
  /**
   * 获取文件的提交历史
   */
  async fileHistory(filePath, options = {}) {
    const args = ["log", "--format=%H|%an|%ae|%at|%s|%b"];
    if (options.follow) args.push("--follow");
    if (options.maxCount) args.push("-n", options.maxCount.toString());
    args.push("--", filePath);
    const output = await this.exec(args);
    const commits = [];
    for (const line of output.split("\n").filter(Boolean)) {
      const [hash, author, email, timestamp, subject, body] = line.split("|");
      commits.push({
        hash,
        author,
        email,
        date: new Date(parseInt(timestamp) * 1e3),
        subject,
        body: body || ""
      });
    }
    return commits;
  }
  /**
   * 获取两个提交之间的差异文件列表
   */
  async getChangedFiles(from, to = "HEAD") {
    const output = await this.exec(["diff", "--name-only", from, to]);
    return output.split("\n").filter(Boolean);
  }
};
var SmartCommit = class _SmartCommit {
  git;
  logger;
  config;
  promptManager;
  theme;
  static DEFAULT_TYPES = [
    { type: "feat" /* FEAT */, title: "Features", description: "A new feature", emoji: "\u2728" },
    { type: "fix" /* FIX */, title: "Bug Fixes", description: "A bug fix", emoji: "\u{1F41B}" },
    { type: "docs" /* DOCS */, title: "Documentation", description: "Documentation only changes", emoji: "\u{1F4DA}" },
    { type: "style" /* STYLE */, title: "Styles", description: "Changes that do not affect the meaning of the code", emoji: "\u{1F48E}" },
    { type: "refactor" /* REFACTOR */, title: "Code Refactoring", description: "A code change that neither fixes a bug nor adds a feature", emoji: "\u{1F4E6}" },
    { type: "perf" /* PERF */, title: "Performance Improvements", description: "A code change that improves performance", emoji: "\u{1F680}" },
    { type: "test" /* TEST */, title: "Tests", description: "Adding missing tests or correcting existing tests", emoji: "\u{1F6A8}" },
    { type: "build" /* BUILD */, title: "Builds", description: "Changes that affect the build system or external dependencies", emoji: "\u{1F6E0}" },
    { type: "ci" /* CI */, title: "Continuous Integrations", description: "Changes to our CI configuration files and scripts", emoji: "\u2699\uFE0F" },
    { type: "chore" /* CHORE */, title: "Chores", description: "Other changes that don't modify src or test files", emoji: "\u267B\uFE0F" },
    { type: "revert" /* REVERT */, title: "Reverts", description: "Reverts a previous commit", emoji: "\u{1F5D1}" }
  ];
  constructor(git, config = {}, logger) {
    this.git = git;
    this.logger = logger || new ConsoleLogger({ level: "info" });
    this.promptManager = new PromptManager();
    this.theme = new ConsoleTheme();
    this.config = {
      useEmoji: config.useEmoji ?? true,
      useConventional: config.useConventional ?? true,
      customTypes: config.customTypes ?? _SmartCommit.DEFAULT_TYPES,
      autoAnalyze: config.autoAnalyze ?? true,
      autoIssue: config.autoIssue ?? true,
      issueFormat: config.issueFormat ?? /#(\d+)/,
      autoScope: config.autoScope ?? true,
      maxLength: config.maxLength ?? 100,
      validate: config.validate ?? true,
      validationRules: config.validationRules ?? []
    };
  }
  /**
   * 执行智能提交
   */
  async commit(options = {}) {
    const status = await this.git.status();
    if (status.staged.length === 0) {
      throw new GitError("INVALID_ARGUMENT" /* INVALID_ARGUMENT */, "No staged changes to commit");
    }
    let commitMessage;
    if (options.interactive !== false && !options.message) {
      commitMessage = await this.interactiveCommit(status, options);
    } else if (options.message) {
      commitMessage = options.message;
    } else {
      const analysis = await this.analyzeChanges(status);
      commitMessage = this.buildCommitMessage({
        type: options.type || analysis.type,
        scope: options.scope || analysis.scope,
        subject: analysis.suggestedMessage,
        breaking: options.breaking || analysis.breaking,
        issues: options.issues,
        body: options.body,
        footer: options.footer
      });
    }
    if (this.config.validate) {
      this.validateCommitMessage(commitMessage);
    }
    return await this.git.commit(commitMessage);
  }
  /**
   * 交互式提交
   */
  async interactiveCommit(status, options) {
    let analysis;
    if (this.config.autoAnalyze) {
      this.logger.info("Analyzing changes...");
      analysis = await this.analyzeChanges(status);
      this.displayAnalysis(analysis);
    }
    const type = options.type || await this.selectCommitType(analysis?.type);
    let scope;
    if (this.config.autoScope) {
      scope = options.scope || await this.inputScope(analysis?.scope);
    }
    const subject = await this.inputSubject(analysis?.suggestedMessage);
    const breaking = options.breaking ?? await this.confirmBreaking();
    const body = options.body || await this.inputBody();
    const issues = options.issues || await this.inputIssues();
    const footer = options.footer || await this.inputFooter();
    return this.buildCommitMessage({
      type,
      scope,
      subject,
      breaking,
      issues,
      body,
      footer
    });
  }
  /**
   * 分析变更
   */
  async analyzeChanges(status) {
    const diff = await this.git.diff({ cached: true, numstat: true });
    const stats = this.parseDiffStats(diff);
    const fileTypes = this.analyzeFileTypes(status);
    const type = this.inferCommitType(status, fileTypes);
    const scope = this.inferScope(status.staged);
    const breaking = await this.checkBreakingChanges(status);
    const suggestedMessage = this.generateSuggestedMessage(type, status);
    return {
      type,
      scope,
      breaking,
      files: {
        added: status.staged.filter((f) => !status.modified.includes(f)),
        modified: status.modified,
        deleted: status.deleted,
        renamed: status.renamed
      },
      stats,
      suggestedMessage
    };
  }
  /**
   * 解析 diff 统计信息
   */
  parseDiffStats(diff) {
    const lines = diff.split("\n").filter(Boolean);
    let additions = 0;
    let deletions = 0;
    for (const line of lines) {
      const parts = line.split("	");
      if (parts.length >= 3) {
        additions += parseInt(parts[0]) || 0;
        deletions += parseInt(parts[1]) || 0;
      }
    }
    return {
      additions,
      deletions,
      changes: additions + deletions
    };
  }
  /**
   * 分析文件类型分布
   */
  analyzeFileTypes(status) {
    const types = /* @__PURE__ */ new Map();
    const allFiles = [
      ...status.staged,
      ...status.modified,
      ...status.deleted,
      ...status.renamed
    ];
    for (const file of allFiles) {
      const ext = PathUtils.extname(file).toLowerCase();
      types.set(ext, (types.get(ext) || 0) + 1);
    }
    return types;
  }
  /**
   * 推断提交类型
   */
  inferCommitType(status, fileTypes) {
    if (this.hasTestFiles(status.staged)) {
      return "test" /* TEST */;
    }
    if (this.isDocumentationOnly(fileTypes)) {
      return "docs" /* DOCS */;
    }
    if (this.hasConfigFiles(status.staged)) {
      return "build" /* BUILD */;
    }
    if (this.hasStyleFiles(fileTypes)) {
      return "style" /* STYLE */;
    }
    if (status.deleted.length > 0) {
      return "refactor" /* REFACTOR */;
    }
    return "feat" /* FEAT */;
  }
  /**
   * 推断 scope
   */
  inferScope(files) {
    if (files.length === 0) return void 0;
    const dirs = /* @__PURE__ */ new Map();
    for (const file of files) {
      const parts = file.split("/");
      if (parts.length > 1) {
        const dir = parts[0];
        dirs.set(dir, (dirs.get(dir) || 0) + 1);
      }
    }
    if (dirs.size === 0) return void 0;
    let maxCount = 0;
    let scope;
    for (const [dir, count] of dirs) {
      if (count > maxCount) {
        maxCount = count;
        scope = dir;
      }
    }
    return scope;
  }
  /**
   * 检查是否有破坏性变更
   */
  async checkBreakingChanges(status) {
    const apiFiles = status.staged.filter(
      (f) => f.includes("api") || f.includes("interface") || f.includes("public")
    );
    return apiFiles.length > 0;
  }
  /**
   * 生成建议的提交信息
   */
  generateSuggestedMessage(type, status) {
    const fileCount = status.staged.length;
    switch (type) {
      case "feat" /* FEAT */:
        return `add ${fileCount > 1 ? "new features" : "new feature"}`;
      case "fix" /* FIX */:
        return `fix ${fileCount > 1 ? "issues" : "issue"}`;
      case "docs" /* DOCS */:
        return "update documentation";
      case "style" /* STYLE */:
        return "improve code style";
      case "refactor" /* REFACTOR */:
        return "refactor code structure";
      case "test" /* TEST */:
        return `add ${fileCount > 1 ? "tests" : "test"}`;
      case "build" /* BUILD */:
        return "update build configuration";
      case "perf" /* PERF */:
        return "improve performance";
      default:
        return "update code";
    }
  }
  /**
   * 显示分析结果
   */
  displayAnalysis(analysis) {
    console.log(this.theme.header("\n\u{1F4CA} Change Analysis:"));
    console.log(this.theme.info(`  Type: ${analysis.type}`));
    if (analysis.scope) {
      console.log(this.theme.info(`  Scope: ${analysis.scope}`));
    }
    console.log(this.theme.info(`  Files: +${analysis.files.added.length} ~${analysis.files.modified.length} -${analysis.files.deleted.length}`));
    console.log(this.theme.info(`  Changes: +${analysis.stats.additions} -${analysis.stats.deletions}`));
    if (analysis.breaking) {
      console.log(this.theme.warning("  \u26A0\uFE0F  Possible breaking changes detected"));
    }
    console.log();
  }
  /**
   * 选择提交类型
   */
  async selectCommitType(defaultType) {
    const choices = this.config.customTypes.map((t) => ({
      name: `${this.config.useEmoji ? t.emoji + " " : ""}${t.type}: ${t.description}`,
      value: t.type
    }));
    const answer = await this.promptManager.select({
      message: "Select commit type:",
      choices,
      default: defaultType
    });
    return answer;
  }
  /**
   * 输入 scope
   */
  async inputScope(defaultScope) {
    const answer = await this.promptManager.input({
      message: "Enter commit scope (optional):",
      default: defaultScope
    });
    return answer || void 0;
  }
  /**
   * 输入提交主题
   */
  async inputSubject(defaultSubject) {
    const answer = await this.promptManager.input({
      message: "Enter commit subject:",
      default: defaultSubject,
      validate: (input) => {
        if (!input) {
          return "Subject is required";
        }
        if (input.length > this.config.maxLength) {
          return `Subject must be less than ${this.config.maxLength} characters`;
        }
        return true;
      }
    });
    return answer;
  }
  /**
   * 确认是否为破坏性变更
   */
  async confirmBreaking() {
    return await this.promptManager.confirm({
      message: "Is this a breaking change?",
      default: false
    });
  }
  /**
   * 输入详细描述
   */
  async inputBody() {
    const answer = await this.promptManager.editor({
      message: "Enter commit body (optional):"
    });
    return answer || void 0;
  }
  /**
   * 输入相关 issues
   */
  async inputIssues() {
    const answer = await this.promptManager.input({
      message: "Enter related issues (comma separated, optional):"
    });
    if (!answer) return void 0;
    return answer.split(",").map((s) => s.trim()).filter(Boolean);
  }
  /**
   * 输入 footer
   */
  async inputFooter() {
    const answer = await this.promptManager.input({
      message: "Enter commit footer (optional):"
    });
    return answer || void 0;
  }
  /**
   * 构建提交信息
   */
  buildCommitMessage(options) {
    let message = "";
    if (this.config.useEmoji) {
      const typeConfig = this.config.customTypes.find((t) => t.type === options.type);
      if (typeConfig?.emoji) {
        message += typeConfig.emoji + " ";
      }
    }
    if (this.config.useConventional) {
      message += options.type;
      if (options.scope) {
        message += `(${options.scope})`;
      }
      if (options.breaking) {
        message += "!";
      }
      message += ": ";
    }
    message += options.subject;
    if (options.issues && options.issues.length > 0) {
      message += " (" + options.issues.map((i) => `#${i}`).join(", ") + ")";
    }
    if (options.body) {
      message += "\n\n" + options.body;
    }
    if (options.footer) {
      message += "\n\n" + options.footer;
    }
    if (options.breaking && !options.footer) {
      message += "\n\nBREAKING CHANGE: This commit contains breaking changes";
    }
    return message;
  }
  /**
   * 验证提交信息
   */
  validateCommitMessage(message) {
    const firstLine = message.split("\n")[0];
    if (firstLine.length > this.config.maxLength) {
      throw new GitError(
        "INVALID_ARGUMENT" /* INVALID_ARGUMENT */,
        `Commit message first line exceeds ${this.config.maxLength} characters`
      );
    }
    if (this.config.useConventional) {
      const pattern = /^(?:[\w\s]+:\s)?(?:\w+)(?:\([\w\-]+\))?!?:\s.+/;
      if (!pattern.test(firstLine)) {
        throw new GitError(
          "INVALID_ARGUMENT" /* INVALID_ARGUMENT */,
          "Commit message does not follow conventional format"
        );
      }
    }
    for (const rule of this.config.validationRules) {
      const result = rule(message);
      if (result !== true) {
        throw new GitError(
          "INVALID_ARGUMENT" /* INVALID_ARGUMENT */,
          typeof result === "string" ? result : "Commit message validation failed"
        );
      }
    }
  }
  /**
   * 批量提交
   */
  async batchCommit(options = {}) {
    const status = await this.git.status();
    if (status.staged.length === 0) {
      await this.git.add(".");
      const newStatus = await this.git.status();
      if (newStatus.staged.length === 0) {
        throw new GitError(
          "INVALID_ARGUMENT" /* INVALID_ARGUMENT */,
          "No changes to commit"
        );
      }
    }
    const groups = this.groupFiles(status.staged, options.groupBy || "type");
    const commits = [];
    this.logger.info(`Found ${groups.size} groups to commit`);
    for (const [group, files] of groups) {
      await this.git.reset({ mode: "mixed" });
      await this.git.add(files);
      const message = await this.generateGroupCommitMessage(group, files, options.interactive);
      const hash = await this.git.commit(message);
      commits.push(hash);
      this.logger.success(`Committed group '${group}': ${hash}`);
    }
    return commits;
  }
  /**
   * 分组文件
   */
  groupFiles(files, groupBy) {
    const groups = /* @__PURE__ */ new Map();
    for (const file of files) {
      let group;
      switch (groupBy) {
        case "type":
          group = this.getFileType(file);
          break;
        case "scope":
          group = this.getFileScope(file);
          break;
        case "directory":
          group = PathUtils.dirname(file).split("/")[0] || "root";
          break;
        default:
          group = "default";
      }
      if (!groups.has(group)) {
        groups.set(group, []);
      }
      groups.get(group).push(file);
    }
    return groups;
  }
  /**
   * 获取文件类型
   */
  getFileType(file) {
    const ext = PathUtils.extname(file).toLowerCase();
    if (file.includes("test") || file.includes("spec")) {
      return "test";
    }
    if ([".md", ".txt", ".rst"].includes(ext)) {
      return "docs";
    }
    if ([".json", ".yaml", ".yml", ".toml", ".ini"].includes(ext) || file.includes("config")) {
      return "config";
    }
    if ([".css", ".scss", ".less", ".sass", ".styl"].includes(ext)) {
      return "style";
    }
    return "code";
  }
  /**
   * 获取文件 scope
   */
  getFileScope(file) {
    const parts = file.split("/");
    if (parts[0] === "src" && parts.length > 1) {
      return parts[1];
    }
    return parts[0];
  }
  /**
   * 生成分组提交信息
   */
  async generateGroupCommitMessage(group, files, interactive) {
    if (interactive) {
      this.logger.info(`Group: ${group}`);
      this.logger.info(`Files: ${files.join(", ")}`);
      return await this.promptManager.input({
        message: `Enter commit message for group '${group}':`
      });
    }
    const type = this.getGroupCommitType(group);
    const subject = `update ${group} files`;
    return this.buildCommitMessage({
      type,
      scope: group,
      subject
    });
  }
  /**
   * 获取分组的提交类型
   */
  getGroupCommitType(group) {
    switch (group) {
      case "test":
        return "test" /* TEST */;
      case "docs":
        return "docs" /* DOCS */;
      case "config":
        return "build" /* BUILD */;
      case "style":
        return "style" /* STYLE */;
      default:
        return "feat" /* FEAT */;
    }
  }
  /**
   * 辅助方法：检查是否包含测试文件
   */
  hasTestFiles(files) {
    return files.some((f) => f.includes("test") || f.includes("spec"));
  }
  /**
   * 辅助方法：检查是否只有文档文件
   */
  isDocumentationOnly(fileTypes) {
    const docExts = [".md", ".txt", ".rst", ".adoc"];
    const totalFiles = Array.from(fileTypes.values()).reduce((a, b) => a + b, 0);
    const docFiles = docExts.reduce((sum, ext) => sum + (fileTypes.get(ext) || 0), 0);
    return totalFiles > 0 && totalFiles === docFiles;
  }
  /**
   * 辅助方法：检查是否包含配置文件
   */
  hasConfigFiles(files) {
    const configPatterns = ["package.json", "tsconfig", "webpack", "rollup", "vite", ".config."];
    return files.some((f) => configPatterns.some((p) => f.includes(p)));
  }
  /**
   * 辅助方法：检查是否包含样式文件
   */
  hasStyleFiles(fileTypes) {
    const styleExts = [".css", ".scss", ".less", ".sass", ".styl"];
    return styleExts.some((ext) => fileTypes.has(ext));
  }
};

// package.json
var version = "0.1.0";
var GitCLI = class {
  program;
  logger;
  theme;
  promptManager;
  git;
  constructor() {
    this.program = new Command();
    this.logger = new ConsoleLogger({ level: "info" });
    this.theme = new ConsoleTheme();
    this.promptManager = new PromptManager();
    this.setupCommands();
  }
  /**
   * 设置命令
   */
  setupCommands() {
    this.program.name("lgit").description("Enhanced Git CLI with smart features").version(version);
    this.program.command("status").alias("st").description("Show working tree status with enhanced visualization").option("-s, --short", "Show short format").action(async (options) => {
      await this.handleStatus(options);
    });
    this.program.command("commit").alias("ci").description("Smart commit with automatic message generation").option("-m, --message <message>", "Commit message").option("-t, --type <type>", "Commit type (feat, fix, docs, etc.)").option("-s, --scope <scope>", "Commit scope").option("-b, --breaking", "Mark as breaking change").option("-i, --interactive", "Interactive mode", true).option("-a, --all", "Stage all changes before commit").option("--no-verify", "Skip hooks").action(async (options) => {
      await this.handleCommit(options);
    });
    this.program.command("batch-commit").alias("bc").description("Batch commit grouped changes").option("-g, --group-by <type>", "Group by: type, scope, directory", "type").option("-i, --interactive", "Interactive mode for each group").action(async (options) => {
      await this.handleBatchCommit(options);
    });
    this.program.command("sync").description("Smart sync with remote repository").option("-r, --remote <remote>", "Remote name", "origin").option("-b, --branch <branch>", "Branch name").option("--rebase", "Use rebase instead of merge").option("--force", "Force sync").option("--auto-resolve", "Auto resolve conflicts").action(async (options) => {
      await this.handleSync(options);
    });
    this.program.command("branch [name]").alias("br").description("Enhanced branch management").option("-l, --list", "List branches").option("-a, --all", "Show all branches").option("-r, --remote", "Show remote branches").option("-d, --delete <branch>", "Delete branch").option("-D, --force-delete <branch>", "Force delete branch").option("-c, --create", "Create new branch").option("--cleanup", "Clean up merged branches").action(async (name, options) => {
      await this.handleBranch(name, options);
    });
    this.program.command("rebase").alias("rb").description("Interactive rebase with enhanced features").option("-i, --interactive", "Interactive mode").option("-c, --continue", "Continue rebase").option("-a, --abort", "Abort rebase").option("-s, --skip", "Skip current commit").option("--onto <branch>", "Rebase onto branch").action(async (options) => {
      await this.handleRebase(options);
    });
    this.program.command("log").alias("lg").description("Enhanced log visualization").option("-n, --number <count>", "Number of commits to show", "10").option("--graph", "Show graph").option("--oneline", "Show oneline format").option("--since <date>", "Show commits since date").option("--author <author>", "Filter by author").option("--grep <pattern>", "Filter by message pattern").action(async (options) => {
      await this.handleLog(options);
    });
    this.program.command("diff").description("Enhanced diff visualization").option("--cached", "Show staged changes").option("--name-only", "Show only file names").option("--stat", "Show statistics").option("--color", "Show colored output", true).action(async (options) => {
      await this.handleDiff(options);
    });
    this.program.command("stash").description("Enhanced stash management").option("-l, --list", "List stashes").option("-s, --save <message>", "Save stash with message").option("-p, --pop [index]", "Pop stash").option("-a, --apply [index]", "Apply stash").option("-d, --drop [index]", "Drop stash").option("-c, --clear", "Clear all stashes").action(async (options) => {
      await this.handleStash(options);
    });
    this.program.command("tag [name]").description("Enhanced tag management").option("-l, --list [pattern]", "List tags").option("-a, --annotate", "Create annotated tag").option("-m, --message <message>", "Tag message").option("-d, --delete <tag>", "Delete tag").option("-f, --force", "Force create/update tag").action(async (name, options) => {
      await this.handleTag(name, options);
    });
    this.program.command("workflow").alias("wf").description("Manage Git workflows").option("--feature <name>", "Start feature branch").option("--hotfix <name>", "Start hotfix branch").option("--release <version>", "Start release branch").option("--finish", "Finish current workflow").action(async (options) => {
      await this.handleWorkflow(options);
    });
    this.program.command("stats").description("Show repository statistics").option("-a, --author <author>", "Filter by author").option("-s, --since <date>", "Since date").option("-u, --until <date>", "Until date").action(async (options) => {
      await this.handleStats(options);
    });
    this.program.command("config").description("Manage Git configuration").option("-l, --list", "List all config").option("-g, --global", "Use global config").option("-s, --set <key=value>", "Set config value").option("-u, --unset <key>", "Unset config value").action(async (options) => {
      await this.handleConfig(options);
    });
  }
  /**
   * 初始化 Git 操作实例
   */
  async initGit() {
    if (!this.git) {
      this.git = new GitOperations(process.cwd(), this.logger);
    }
    return this.git;
  }
  /**
   * 处理状态命令
   */
  async handleStatus(options) {
    try {
      const git = await this.initGit();
      const status = await git.status({ short: options.short });
      if (options.short) {
        this.displayShortStatus(status);
      } else {
        this.displayFullStatus(status);
      }
    } catch (error) {
      this.handleError(error);
    }
  }
  /**
   * 显示完整状态
   */
  displayFullStatus(status) {
    console.log(this.theme.header("\n\u{1F4CA} Repository Status\n"));
    console.log(chalk5.bold("Branch:"), chalk5.cyan(status.branch));
    if (status.ahead > 0 || status.behind > 0) {
      const ahead = status.ahead > 0 ? chalk5.green(`\u2191${status.ahead}`) : "";
      const behind = status.behind > 0 ? chalk5.red(`\u2193${status.behind}`) : "";
      console.log(chalk5.bold("Remote:"), `${ahead} ${behind}`.trim());
    }
    console.log();
    const table = new Table({
      head: ["Status", "Files", "Count"],
      style: { head: ["cyan"] }
    });
    if (status.staged.length > 0) {
      table.push(["Staged", chalk5.green(status.staged.join(", ")), status.staged.length]);
    }
    if (status.modified.length > 0) {
      table.push(["Modified", chalk5.yellow(status.modified.join(", ")), status.modified.length]);
    }
    if (status.untracked.length > 0) {
      table.push(["Untracked", chalk5.gray(status.untracked.join(", ")), status.untracked.length]);
    }
    if (status.deleted.length > 0) {
      table.push(["Deleted", chalk5.red(status.deleted.join(", ")), status.deleted.length]);
    }
    if (status.renamed.length > 0) {
      table.push(["Renamed", chalk5.blue(status.renamed.join(", ")), status.renamed.length]);
    }
    if (status.conflicted.length > 0) {
      table.push(["Conflicted", chalk5.magenta(status.conflicted.join(", ")), status.conflicted.length]);
    }
    if (table.length > 0) {
      console.log(table.toString());
    } else {
      console.log(chalk5.green("\u2713 Working tree clean"));
    }
  }
  /**
   * 显示简短状态
   */
  displayShortStatus(status) {
    const files = [
      ...status.staged.map((f) => chalk5.green(`A ${f}`)),
      ...status.modified.map((f) => chalk5.yellow(`M ${f}`)),
      ...status.deleted.map((f) => chalk5.red(`D ${f}`)),
      ...status.renamed.map((f) => chalk5.blue(`R ${f}`)),
      ...status.untracked.map((f) => chalk5.gray(`? ${f}`)),
      ...status.conflicted.map((f) => chalk5.magenta(`U ${f}`))
    ];
    files.forEach((file) => console.log(file));
  }
  /**
   * 处理提交命令
   */
  async handleCommit(options) {
    try {
      const git = await this.initGit();
      if (options.all) {
        await git.add(".");
      }
      const smartCommit = new SmartCommit(git, {
        useEmoji: true,
        useConventional: true,
        autoAnalyze: true,
        validate: !options.noVerify
      }, this.logger);
      const hash = await smartCommit.commit({
        message: options.message,
        type: options.type,
        scope: options.scope,
        breaking: options.breaking,
        interactive: options.interactive
      });
      this.logger.success(`\u2705 Commit created: ${chalk5.cyan(hash)}`);
    } catch (error) {
      this.handleError(error);
    }
  }
  /**
   * 处理批量提交命令
   */
  async handleBatchCommit(options) {
    try {
      const git = await this.initGit();
      const smartCommit = new SmartCommit(git, {}, this.logger);
      const commits = await smartCommit.batchCommit({
        groupBy: options.groupBy,
        interactive: options.interactive
      });
      this.logger.success(`\u2705 Created ${commits.length} commits`);
      commits.forEach((hash, index) => {
        console.log(chalk5.gray(`  ${index + 1}. ${hash}`));
      });
    } catch (error) {
      this.handleError(error);
    }
  }
  /**
   * 处理同步命令
   */
  async handleSync(options) {
    try {
      const git = await this.initGit();
      const smartSync = new SmartSync(git, {});
      await smartSync.sync({
        remote: options.remote,
        branch: options.branch,
        rebase: options.rebase,
        force: options.force,
        autoMerge: options.autoResolve
      });
      this.logger.success("\u2705 Sync completed successfully");
    } catch (error) {
      this.handleError(error);
    }
  }
  /**
   * 处理分支命令
   */
  async handleBranch(name, options) {
    try {
      const git = await this.initGit();
      if (options.delete || options.forceDelete) {
        const branch = options.delete || options.forceDelete;
        await git.deleteBranch(branch, { force: !!options.forceDelete });
        return;
      }
      if (options.cleanup) {
        await this.cleanupBranches(git);
        return;
      }
      if (name && options.create) {
        await git.createBranch(name, { checkout: true });
        return;
      }
      const branches = await git.branches({
        all: options.all,
        remote: options.remote
      });
      this.displayBranches(branches);
    } catch (error) {
      this.handleError(error);
    }
  }
  /**
   * 清理已合并的分支
   */
  async cleanupBranches(git) {
    const branches = await git.branches({ merged: true });
    const toDelete = branches.filter(
      (b) => !b.current && !b.remote && b.name !== "main" && b.name !== "master" && b.name !== "develop"
    );
    if (toDelete.length === 0) {
      this.logger.info("No branches to clean up");
      return;
    }
    console.log("Branches to delete:");
    toDelete.forEach((b) => console.log(chalk5.red(`  - ${b.name}`)));
    const confirm = await this.promptManager.confirm({
      message: `Delete ${toDelete.length} branches?`,
      default: false
    });
    if (confirm) {
      for (const branch of toDelete) {
        await git.deleteBranch(branch.name);
      }
      this.logger.success(`Deleted ${toDelete.length} branches`);
    }
  }
  /**
   * 显示分支列表
   */
  displayBranches(branches) {
    console.log(this.theme.header("\n\u{1F33F} Branches\n"));
    const table = new Table({
      head: ["", "Name", "Type"],
      style: { head: ["cyan"] }
    });
    branches.forEach((branch) => {
      const current = branch.current ? chalk5.green("*") : " ";
      const name = branch.current ? chalk5.green(branch.name) : branch.name;
      const type = branch.remote ? chalk5.yellow("remote") : chalk5.blue("local");
      table.push([current, name, type]);
    });
    console.log(table.toString());
  }
  /**
   * 处理变基命令
   */
  async handleRebase(options) {
    try {
      const git = await this.initGit();
      await git.rebase({
        onto: options.onto,
        interactive: options.interactive,
        continue: options.continue,
        abort: options.abort,
        skip: options.skip
      });
      this.logger.success("\u2705 Rebase completed");
    } catch (error) {
      this.handleError(error);
    }
  }
  /**
   * 处理日志命令
   */
  async handleLog(options) {
    try {
      const git = await this.initGit();
      const commits = await git.log({
        maxCount: parseInt(options.number),
        since: options.since,
        author: options.author,
        grep: options.grep,
        oneline: options.oneline
      });
      this.displayCommits(commits, options);
    } catch (error) {
      this.handleError(error);
    }
  }
  /**
   * 显示提交历史
   */
  displayCommits(commits, options) {
    console.log(this.theme.header("\n\u{1F4DC} Commit History\n"));
    if (options.oneline) {
      commits.forEach((commit) => {
        console.log(`${chalk5.yellow(commit.hash.substring(0, 7))} ${commit.subject}`);
      });
    } else {
      commits.forEach((commit) => {
        console.log(chalk5.yellow(`commit ${commit.hash}`));
        console.log(`Author: ${commit.author} <${commit.email}>`);
        console.log(`Date:   ${commit.date}`);
        console.log(`
    ${commit.subject}`);
        if (commit.body) {
          console.log(`
    ${commit.body}`);
        }
        console.log();
      });
    }
  }
  /**
   * 处理差异命令
   */
  async handleDiff(options) {
    try {
      const git = await this.initGit();
      const diff = await git.diff({
        cached: options.cached,
        nameOnly: options.nameOnly,
        stat: options.stat,
        color: options.color
      });
      console.log(diff);
    } catch (error) {
      this.handleError(error);
    }
  }
  /**
   * 处理储藏命令
   */
  async handleStash(options) {
    try {
      const git = await this.initGit();
      if (options.list) {
        const stashes = await git.stashList();
        if (stashes.length === 0) {
          console.log("No stashes found");
        } else {
          console.log(this.theme.header("\n\u{1F4E6} Stashes\n"));
          stashes.forEach((stash) => console.log(stash));
        }
      } else if (options.save) {
        await git.stash({ message: options.save });
      } else if (options.pop !== void 0) {
        const index = typeof options.pop === "string" ? parseInt(options.pop) : 0;
        await git.stashPop(index);
      } else if (options.clear) {
        const stashes = await git.stashList();
        for (let i = stashes.length - 1; i >= 0; i--) {
          await git.exec(["stash", "drop", `stash@{0}`]);
        }
        this.logger.success("All stashes cleared");
      } else {
        await git.stash();
      }
    } catch (error) {
      this.handleError(error);
    }
  }
  /**
   * 处理标签命令
   */
  async handleTag(name, options) {
    try {
      const git = await this.initGit();
      if (options.delete) {
        await git.deleteTag(options.delete);
      } else if (options.list !== void 0) {
        const pattern = typeof options.list === "string" ? options.list : void 0;
        const tags = await git.tags(pattern);
        if (tags.length === 0) {
          console.log("No tags found");
        } else {
          console.log(this.theme.header("\n\u{1F3F7}\uFE0F  Tags\n"));
          tags.forEach((tag) => console.log(tag));
        }
      } else if (name) {
        await git.createTag(name, {
          message: options.message,
          annotated: options.annotated,
          force: options.force
        });
      }
    } catch (error) {
      this.handleError(error);
    }
  }
  /**
   * 处理工作流命令
   */
  async handleWorkflow(options) {
    try {
      const git = await this.initGit();
      const currentBranch = await git.getCurrentBranch();
      if (options.feature) {
        const branchName = `feature/${options.feature}`;
        await git.createBranch(branchName, { checkout: true });
        this.logger.success(`Started feature: ${branchName}`);
      } else if (options.hotfix) {
        const branchName = `hotfix/${options.hotfix}`;
        await git.createBranch(branchName, { from: "main", checkout: true });
        this.logger.success(`Started hotfix: ${branchName}`);
      } else if (options.release) {
        const branchName = `release/${options.release}`;
        await git.createBranch(branchName, { from: "develop", checkout: true });
        this.logger.success(`Started release: ${branchName}`);
      } else if (options.finish) {
        await this.finishWorkflow(git, currentBranch);
      } else {
        console.log("Please specify a workflow action");
      }
    } catch (error) {
      this.handleError(error);
    }
  }
  /**
   * 完成工作流
   */
  async finishWorkflow(git, branch) {
    if (branch.startsWith("feature/")) {
      await git.checkout("develop");
      await git.merge(branch);
      await git.deleteBranch(branch);
      this.logger.success(`Feature ${branch} finished and merged to develop`);
    } else if (branch.startsWith("hotfix/")) {
      await git.checkout("main");
      await git.merge(branch);
      await git.checkout("develop");
      await git.merge(branch);
      await git.deleteBranch(branch);
      this.logger.success(`Hotfix ${branch} finished and merged to main and develop`);
    } else if (branch.startsWith("release/")) {
      await git.checkout("main");
      await git.merge(branch);
      const version2 = branch.split("/")[1];
      await git.createTag(`v${version2}`, { annotated: true, message: `Release version ${version2}` });
      await git.checkout("develop");
      await git.merge(branch);
      await git.deleteBranch(branch);
      this.logger.success(`Release ${branch} finished, tagged, and merged to main and develop`);
    } else {
      throw new GitError("INVALID_ARGUMENT" /* INVALID_ARGUMENT */, "Not in a workflow branch");
    }
  }
  /**
   * 处理统计命令
   */
  async handleStats(options) {
    try {
      const git = await this.initGit();
      const commits = await git.log({
        since: options.since,
        until: options.until,
        author: options.author
      });
      const stats = this.calculateStats(commits);
      this.displayStats(stats);
    } catch (error) {
      this.handleError(error);
    }
  }
  /**
   * 计算统计信息
   */
  calculateStats(commits) {
    const authors = /* @__PURE__ */ new Map();
    const dayOfWeek = new Array(7).fill(0);
    const hourOfDay = new Array(24).fill(0);
    commits.forEach((commit) => {
      const count = authors.get(commit.author) || 0;
      authors.set(commit.author, count + 1);
      const day = commit.date.getDay();
      dayOfWeek[day]++;
      const hour = commit.date.getHours();
      hourOfDay[hour]++;
    });
    return {
      total: commits.length,
      authors: Array.from(authors.entries()).sort((a, b) => b[1] - a[1]),
      dayOfWeek,
      hourOfDay
    };
  }
  /**
   * 显示统计信息
   */
  displayStats(stats) {
    console.log(this.theme.header("\n\u{1F4C8} Repository Statistics\n"));
    console.log(chalk5.bold("Total Commits:"), stats.total);
    console.log();
    if (stats.authors.length > 0) {
      console.log(chalk5.bold("Top Contributors:"));
      const table = new Table({
        head: ["Author", "Commits", "Percentage"],
        style: { head: ["cyan"] }
      });
      stats.authors.slice(0, 10).forEach(([author, count]) => {
        const percentage = (count / stats.total * 100).toFixed(1);
        table.push([author, count, `${percentage}%`]);
      });
      console.log(table.toString());
    }
    console.log("\n" + chalk5.bold("Most Active Day:"));
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const maxDay = Math.max(...stats.dayOfWeek);
    const maxDayIndex = stats.dayOfWeek.indexOf(maxDay);
    console.log(`  ${days[maxDayIndex]} (${maxDay} commits)`);
    console.log("\n" + chalk5.bold("Most Active Hour:"));
    const maxHour = Math.max(...stats.hourOfDay);
    const maxHourIndex = stats.hourOfDay.indexOf(maxHour);
    console.log(`  ${maxHourIndex}:00 (${maxHour} commits)`);
  }
  /**
   * 处理配置命令
   */
  async handleConfig(options) {
    try {
      const git = await this.initGit();
      if (options.list) {
        const output = await git.exec(["config", "--list"]);
        console.log(output);
      } else if (options.set) {
        const [key, value] = options.set.split("=");
        await git.setConfig(key, value, { global: options.global });
      } else if (options.unset) {
        await git.exec(["config", "--unset", options.unset]);
        this.logger.success(`Config '${options.unset}' unset`);
      }
    } catch (error) {
      this.handleError(error);
    }
  }
  /**
   * 处理错误
   */
  handleError(error) {
    if (error instanceof GitError) {
      this.logger.error(`Git Error: ${error.message}`);
    } else {
      this.logger.error(`Error: ${error.message || error}`);
    }
    if (process.env.DEBUG) {
      console.error(error);
    }
    process.exit(1);
  }
  /**
   * 运行 CLI
   */
  run(argv) {
    this.program.parse(argv);
  }
};

// src/cli.ts
async function runUnifiedCLI() {
  const argv = process.argv;
  const args = argv.slice(2);
  const explicitClassic = args.includes("--classic") || args[0] === "classic";
  const envClassic = (process.env.LGIT_MODE || "").toLowerCase() === "classic";
  const mode = explicitClassic || envClassic ? "classic" : "enhanced";
  if (mode === "classic") {
    const filteredArgs = args.filter((a) => a !== "--classic" && a !== "classic");
    const classicArgv = argv.slice(0, 2).concat(filteredArgs);
    const cli2 = new GitCLI();
    cli2.run(classicArgv);
    return;
  }
  const cli = new EnhancedCLI();
  await cli.run();
}
runUnifiedCLI().catch((err) => {
  console.error("CLI error:", err);
  process.exit(1);
});
