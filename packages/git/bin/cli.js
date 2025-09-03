#!/usr/bin/env node
import simpleGit, { simpleGit as simpleGit$1 } from 'simple-git';
import { EventEmitter } from 'events';

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
        const diffOptions = ["--stat"];
        if (fromCommit && toCommit) {
          diffOptions.unshift(`${fromCommit}..${toCommit}`);
        } else if (fromCommit) {
          diffOptions.unshift(fromCommit);
        }
        const statsResult = await this.git.diff(diffOptions);
        return {
          fromCommit,
          toCommit,
          stats: statsResult
        };
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

// src/cli.ts
function showHelp() {
  console.log(`
@ldesign/git CLI \u5DE5\u5177

\u7528\u6CD5:
  ldesign-git <command> [options]

\u547D\u4EE4:
  init [--bare]                    \u521D\u59CB\u5316 Git \u4ED3\u5E93
  status                          \u663E\u793A\u4ED3\u5E93\u72B6\u6001
  add <files...>                  \u6DFB\u52A0\u6587\u4EF6\u5230\u6682\u5B58\u533A
  commit <message> [files...]     \u63D0\u4EA4\u66F4\u6539
  push [remote] [branch]          \u63A8\u9001\u5230\u8FDC\u7A0B\u4ED3\u5E93
  pull [remote] [branch]          \u4ECE\u8FDC\u7A0B\u4ED3\u5E93\u62C9\u53D6
  log [--max-count=<n>]           \u663E\u793A\u63D0\u4EA4\u65E5\u5FD7
  
  branch list [--remote]          \u5217\u51FA\u5206\u652F
  branch create <name> [start]    \u521B\u5EFA\u5206\u652F
  branch checkout <name>          \u5207\u6362\u5206\u652F
  branch delete <name> [--force]  \u5220\u9664\u5206\u652F
  branch current                  \u663E\u793A\u5F53\u524D\u5206\u652F
  
  remote list                     \u5217\u51FA\u8FDC\u7A0B\u4ED3\u5E93
  remote add <name> <url>         \u6DFB\u52A0\u8FDC\u7A0B\u4ED3\u5E93
  remote remove <name>            \u5220\u9664\u8FDC\u7A0B\u4ED3\u5E93

  clone <url> [dir]               \u514B\u9686\u4ED3\u5E93

  \u667A\u80FD\u540C\u6B65\u547D\u4EE4:
  sync-commit <message> [files...] \u667A\u80FD\u540C\u6B65\u63D0\u4EA4\uFF08\u81EA\u52A8\u5904\u7406\u51B2\u7A81\uFF09
  rollback [stash-id]              \u56DE\u6EDA\u667A\u80FD\u540C\u6B65\u64CD\u4F5C
  resolve [--ours|--theirs]        \u89E3\u51B3\u5408\u5E76\u51B2\u7A81
  
\u9009\u9879:
  --help, -h                      \u663E\u793A\u5E2E\u52A9\u4FE1\u606F
  --version, -v                   \u663E\u793A\u7248\u672C\u4FE1\u606F
  --cwd <path>                    \u6307\u5B9A\u5DE5\u4F5C\u76EE\u5F55

\u793A\u4F8B:
  ldesign-git init
  ldesign-git add .
  ldesign-git commit "Initial commit"
  ldesign-git branch create feature/new-feature
  ldesign-git push origin main

  \u667A\u80FD\u540C\u6B65\u793A\u4F8B:
  ldesign-git sync-commit "Add new feature"
  ldesign-git sync-commit "Fix bug" src/main.js
  ldesign-git resolve --ours
  ldesign-git rollback
`);
}
function showVersion() {
  console.log(`@ldesign/git v0.1.0`);
}
function parseArgs(args) {
  const options = {};
  const positionalArgs = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const [key, value] = arg.slice(2).split("=");
      if (value !== void 0) {
        options[key] = value;
      } else if (i + 1 < args.length && !args[i + 1].startsWith("-")) {
        options[key] = args[++i];
      } else {
        options[key] = true;
      }
    } else if (arg.startsWith("-")) {
      const flags = arg.slice(1);
      for (const flag of flags) {
        options[flag] = true;
      }
    } else {
      positionalArgs.push(arg);
    }
  }
  const [command, subcommand, ...restArgs] = positionalArgs;
  return {
    command: command || "help",
    subcommand,
    args: restArgs,
    options
  };
}
function formatResult(result) {
  if (result.success) {
    if (result.data) {
      if (Array.isArray(result.data)) {
        result.data.forEach((item) => {
          if (typeof item === "object") {
            console.log(JSON.stringify(item, null, 2));
          } else {
            console.log(item);
          }
        });
      } else if (typeof result.data === "object") {
        console.log(JSON.stringify(result.data, null, 2));
      } else {
        console.log(result.data);
      }
    } else {
      console.log("\u2705 \u64CD\u4F5C\u6210\u529F");
    }
  } else {
    console.error("\u274C \u64CD\u4F5C\u5931\u8D25:", result.error);
    process.exit(1);
  }
}
async function main() {
  const args = process.argv.slice(2);
  const { command, subcommand, args: cmdArgs, options } = parseArgs(args);
  if (options.help || options.h || command === "help") {
    showHelp();
    return;
  }
  if (options.version || options.v || command === "version") {
    showVersion();
    return;
  }
  const cwd = options.cwd || process.cwd();
  const git = Git.create(cwd);
  try {
    switch (command) {
      case "init":
        {
          const result = await git.init(options.bare);
          formatResult(result);
        }
        break;
      case "status":
        {
          const result = await git.getStatus();
          formatResult(result);
        }
        break;
      case "add":
        {
          if (cmdArgs.length === 0) {
            console.error("\u274C \u8BF7\u6307\u5B9A\u8981\u6DFB\u52A0\u7684\u6587\u4EF6");
            process.exit(1);
          }
          const result = await git.add(cmdArgs);
          formatResult(result);
        }
        break;
      case "commit":
        {
          if (cmdArgs.length === 0) {
            console.error("\u274C \u8BF7\u63D0\u4F9B\u63D0\u4EA4\u6D88\u606F");
            process.exit(1);
          }
          const [message, ...files] = cmdArgs;
          const result = await git.commit(message, files.length > 0 ? files : void 0);
          formatResult(result);
        }
        break;
      case "push":
        {
          const [remote, branch] = cmdArgs;
          const result = await git.push(remote, branch);
          formatResult(result);
        }
        break;
      case "pull":
        {
          const [remote, branch] = cmdArgs;
          const result = await git.pull(remote, branch);
          formatResult(result);
        }
        break;
      case "log":
        {
          const maxCount = options["max-count"] ? parseInt(options["max-count"]) : void 0;
          const result = await git.getLog(maxCount);
          formatResult(result);
        }
        break;
      case "branch":
        {
          switch (subcommand) {
            case "list":
              {
                const result = await git.listBranches(options.remote);
                formatResult(result);
              }
              break;
            case "create":
              {
                if (cmdArgs.length === 0) {
                  console.error("\u274C \u8BF7\u6307\u5B9A\u5206\u652F\u540D\u79F0");
                  process.exit(1);
                }
                const [name, start] = cmdArgs;
                const result = await git.branch.create(name, start);
                formatResult(result);
              }
              break;
            case "checkout":
              {
                if (cmdArgs.length === 0) {
                  console.error("\u274C \u8BF7\u6307\u5B9A\u5206\u652F\u540D\u79F0");
                  process.exit(1);
                }
                const result = await git.checkoutBranch(cmdArgs[0]);
                formatResult(result);
              }
              break;
            case "delete":
              {
                if (cmdArgs.length === 0) {
                  console.error("\u274C \u8BF7\u6307\u5B9A\u5206\u652F\u540D\u79F0");
                  process.exit(1);
                }
                const result = await git.branch.delete(cmdArgs[0], options.force);
                formatResult(result);
              }
              break;
            case "current":
              {
                const result = await git.branch.current();
                formatResult(result);
              }
              break;
            default:
              console.error("\u274C \u672A\u77E5\u7684\u5206\u652F\u547D\u4EE4:", subcommand);
              process.exit(1);
          }
        }
        break;
      case "remote":
        {
          switch (subcommand) {
            case "list":
              {
                const result = await git.listRemotes();
                formatResult(result);
              }
              break;
            case "add":
              {
                if (cmdArgs.length < 2) {
                  console.error("\u274C \u8BF7\u6307\u5B9A\u8FDC\u7A0B\u4ED3\u5E93\u540D\u79F0\u548C URL");
                  process.exit(1);
                }
                const [name, url] = cmdArgs;
                const result = await git.addRemote(name, url);
                formatResult(result);
              }
              break;
            case "remove":
              {
                if (cmdArgs.length === 0) {
                  console.error("\u274C \u8BF7\u6307\u5B9A\u8FDC\u7A0B\u4ED3\u5E93\u540D\u79F0");
                  process.exit(1);
                }
                const result = await git.remote.remove(cmdArgs[0]);
                formatResult(result);
              }
              break;
            default:
              console.error("\u274C \u672A\u77E5\u7684\u8FDC\u7A0B\u4ED3\u5E93\u547D\u4EE4:", subcommand);
              process.exit(1);
          }
        }
        break;
      case "clone":
        {
          if (cmdArgs.length === 0) {
            console.error("\u274C \u8BF7\u6307\u5B9A\u4ED3\u5E93 URL");
            process.exit(1);
          }
          const [url, dir] = cmdArgs;
          const result = await git.clone(url, dir);
          formatResult(result);
        }
        break;
      case "sync-commit":
        {
          if (cmdArgs.length === 0) {
            console.error("\u274C \u8BF7\u6307\u5B9A\u63D0\u4EA4\u6D88\u606F");
            process.exit(1);
          }
          const [message, ...files] = cmdArgs;
          const options2 = {
            showProgress: true,
            autoResolveConflicts: args.includes("--auto-resolve"),
            conflictStrategy: args.includes("--ours") ? "ours" : args.includes("--theirs") ? "theirs" : "manual",
            confirmBeforeAction: !args.includes("--no-confirm")
          };
          console.log("\u{1F680} \u5F00\u59CB\u667A\u80FD\u540C\u6B65\u63D0\u4EA4...");
          const result = await git.syncCommit(message, files.length > 0 ? files : void 0, options2);
          if (result.success) {
            console.log("\n\u2705 \u667A\u80FD\u540C\u6B65\u63D0\u4EA4\u6210\u529F!");
            console.log(`\u{1F4DD} ${result.message}`);
            if (result.steps.length > 0) {
              console.log("\n\u6267\u884C\u6B65\u9AA4:");
              result.steps.forEach((step) => console.log(`  ${step}`));
            }
          } else {
            console.error("\n\u274C \u667A\u80FD\u540C\u6B65\u63D0\u4EA4\u5931\u8D25!");
            console.error(`\u{1F4DD} ${result.message}`);
            if (result.error) {
              console.error(`\u{1F50D} \u9519\u8BEF\u8BE6\u60C5: ${result.error}`);
            }
            if (result.conflicts && !result.conflicts.resolved) {
              console.log("\n\u{1F500} \u68C0\u6D4B\u5230\u5408\u5E76\u51B2\u7A81:");
              const resolver = new ConflictResolver(git);
              const suggestions = resolver.getResolutionSuggestions(result.conflicts.conflictFiles);
              suggestions.forEach((suggestion) => console.log(suggestion));
            }
            if (result.rollbackAvailable) {
              console.log("\n\u{1F4A1} \u53EF\u4EE5\u4F7F\u7528\u4EE5\u4E0B\u547D\u4EE4\u56DE\u6EDA:");
              console.log(`   ldesign-git rollback ${result.stashId || ""}`);
            }
            process.exit(1);
          }
        }
        break;
      case "rollback":
        {
          const stashId = cmdArgs[0];
          console.log("\u21A9\uFE0F \u5F00\u59CB\u56DE\u6EDA\u64CD\u4F5C...");
          const result = await git.rollbackSync(stashId);
          if (result.success) {
            console.log("\n\u2705 \u56DE\u6EDA\u6210\u529F!");
            console.log(`\u{1F4DD} ${result.message}`);
            if (result.steps.length > 0) {
              console.log("\n\u6267\u884C\u6B65\u9AA4:");
              result.steps.forEach((step) => console.log(`  ${step}`));
            }
          } else {
            console.error("\n\u274C \u56DE\u6EDA\u5931\u8D25!");
            console.error(`\u{1F4DD} ${result.message}`);
            if (result.error) {
              console.error(`\u{1F50D} \u9519\u8BEF\u8BE6\u60C5: ${result.error}`);
            }
            process.exit(1);
          }
        }
        break;
      case "resolve":
        {
          const resolver = new ConflictResolver(git);
          const hasConflicts = await resolver.hasConflicts();
          if (!hasConflicts) {
            console.log("\u2705 \u6CA1\u6709\u68C0\u6D4B\u5230\u5408\u5E76\u51B2\u7A81");
            break;
          }
          const conflictFiles = await resolver.getConflictFiles();
          if (!conflictFiles.success || !conflictFiles.data) {
            console.error("\u274C \u65E0\u6CD5\u83B7\u53D6\u51B2\u7A81\u6587\u4EF6\u4FE1\u606F");
            process.exit(1);
          }
          console.log("\u{1F500} \u68C0\u6D4B\u5230\u4EE5\u4E0B\u51B2\u7A81\u6587\u4EF6:");
          conflictFiles.data.forEach((file) => {
            console.log(`  - ${file.path} (${file.status})`);
          });
          let strategy = "manual";
          if (args.includes("--ours")) {
            strategy = "ours";
          } else if (args.includes("--theirs")) {
            strategy = "theirs";
          }
          if (strategy !== "manual") {
            console.log(`
\u{1F527} \u4F7F\u7528\u7B56\u7565 "${strategy}" \u81EA\u52A8\u89E3\u51B3\u51B2\u7A81...`);
            const result = await resolver.resolveConflicts({
              strategy,
              autoResolve: true
            });
            if (result.resolved) {
              console.log("\u2705 \u51B2\u7A81\u5DF2\u81EA\u52A8\u89E3\u51B3!");
              console.log("\u{1F4A1} \u8BF7\u8FD0\u884C git commit \u5B8C\u6210\u5408\u5E76");
            } else {
              console.error("\u274C \u81EA\u52A8\u89E3\u51B3\u51B2\u7A81\u5931\u8D25");
              console.log("\u{1F4A1} \u8BF7\u624B\u52A8\u89E3\u51B3\u5269\u4F59\u51B2\u7A81:");
              result.unresolvedFiles.forEach((file) => {
                console.log(`  - ${file}`);
              });
            }
          } else {
            const suggestions = resolver.getResolutionSuggestions(conflictFiles.data);
            console.log("\n\u{1F4A1} \u89E3\u51B3\u5EFA\u8BAE:");
            suggestions.forEach((suggestion) => console.log(suggestion));
          }
        }
        break;
      default:
        console.error("\u274C \u672A\u77E5\u547D\u4EE4:", command);
        console.log("\u4F7F\u7528 --help \u67E5\u770B\u53EF\u7528\u547D\u4EE4");
        process.exit(1);
    }
  } catch (error) {
    if (error instanceof GitError) {
      console.error("\u274C Git \u9519\u8BEF:", error.getFormattedMessage());
    } else {
      console.error("\u274C \u672A\u77E5\u9519\u8BEF:", error);
    }
    process.exit(1);
  }
}
main().catch((error) => {
  console.error("\u274C \u7A0B\u5E8F\u5F02\u5E38:", error);
  process.exit(1);
});
