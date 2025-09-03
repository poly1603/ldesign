#!/usr/bin/env node
import simpleGit from 'simple-git';

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
  /**
   * 构造函数
   * @param baseDir 仓库路径
   * @param options 配置选项
   */
  constructor(baseDir, options) {
    this.repository = new GitRepository(baseDir, options);
    const git = this.repository.git;
    const repoBaseDir = this.repository.getBaseDir();
    this.branch = new GitBranch(git, repoBaseDir);
    this.status = new GitStatus(git, repoBaseDir);
    this.remote = new GitRemote(git, repoBaseDir);
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
