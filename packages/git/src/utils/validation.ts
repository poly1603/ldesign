/**
 * Git 操作参数验证工具
 */

import { GitError } from '../errors/index.js'

/**
 * 验证仓库路径是否有效
 * @param path 仓库路径
 */
export function validateRepositoryPath(path: string): void {
  if (!path || typeof path !== 'string') {
    throw GitError.invalidArgument('path', path)
  }

  if (path.trim().length === 0) {
    throw GitError.invalidArgument('path', 'Path cannot be empty')
  }
}

/**
 * 验证分支名称是否有效
 * @param branchName 分支名称
 */
export function validateBranchName(branchName: string): void {
  if (!branchName || typeof branchName !== 'string') {
    throw GitError.invalidArgument('branchName', branchName)
  }

  const trimmedName = branchName.trim()
  if (trimmedName.length === 0) {
    throw GitError.invalidArgument('branchName', 'Branch name cannot be empty')
  }

  // Git 分支名称规则验证
  const invalidChars = /[~^:?*[\]\\]/
  if (invalidChars.test(trimmedName)) {
    throw GitError.invalidArgument('branchName', 'Branch name contains invalid characters')
  }

  if (trimmedName.startsWith('-') || trimmedName.endsWith('.')) {
    throw GitError.invalidArgument('branchName', 'Branch name cannot start with - or end with .')
  }

  if (trimmedName.includes('..') || trimmedName.includes('@{')) {
    throw GitError.invalidArgument('branchName', 'Branch name contains invalid sequences')
  }
}

/**
 * 验证远程仓库名称是否有效
 * @param remoteName 远程仓库名称
 */
export function validateRemoteName(remoteName: string): void {
  if (!remoteName || typeof remoteName !== 'string') {
    throw GitError.invalidArgument('remoteName', remoteName)
  }

  const trimmedName = remoteName.trim()
  if (trimmedName.length === 0) {
    throw GitError.invalidArgument('remoteName', 'Remote name cannot be empty')
  }

  // 远程仓库名称不能包含空格和特殊字符
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmedName)) {
    throw GitError.invalidArgument('remoteName', 'Remote name can only contain letters, numbers, underscore and dash')
  }
}

/**
 * 验证 URL 是否有效
 * @param url URL 地址
 */
export function validateUrl(url: string): void {
  if (!url || typeof url !== 'string') {
    throw GitError.invalidArgument('url', url)
  }

  const trimmedUrl = url.trim()
  if (trimmedUrl.length === 0) {
    throw GitError.invalidArgument('url', 'URL cannot be empty')
  }

  // 简单的 URL 格式验证
  const urlPattern = /^(https?|git|ssh):\/\/|^git@/
  if (!urlPattern.test(trimmedUrl)) {
    throw GitError.invalidArgument('url', 'Invalid URL format')
  }
}

/**
 * 验证提交消息是否有效
 * @param message 提交消息
 */
export function validateCommitMessage(message: string): void {
  if (!message || typeof message !== 'string') {
    throw GitError.invalidArgument('message', message)
  }

  const trimmedMessage = message.trim()
  if (trimmedMessage.length === 0) {
    throw GitError.invalidArgument('message', 'Commit message cannot be empty')
  }

  if (trimmedMessage.length > 72) {
    console.warn('Commit message is longer than 72 characters, consider shortening it')
  }
}

/**
 * 验证标签名称是否有效
 * @param tagName 标签名称
 */
export function validateTagName(tagName: string): void {
  if (!tagName || typeof tagName !== 'string') {
    throw GitError.invalidArgument('tagName', tagName)
  }

  const trimmedName = tagName.trim()
  if (trimmedName.length === 0) {
    throw GitError.invalidArgument('tagName', 'Tag name cannot be empty')
  }

  // Git 标签名称规则验证
  const invalidChars = /[~^:?*[\]\\]/
  if (invalidChars.test(trimmedName)) {
    throw GitError.invalidArgument('tagName', 'Tag name contains invalid characters')
  }

  if (trimmedName.startsWith('-') || trimmedName.endsWith('.')) {
    throw GitError.invalidArgument('tagName', 'Tag name cannot start with - or end with .')
  }
}

/**
 * 验证文件路径是否有效
 * @param filePath 文件路径
 */
export function validateFilePath(filePath: string): void {
  if (!filePath || typeof filePath !== 'string') {
    throw GitError.invalidArgument('filePath', filePath)
  }

  const trimmedPath = filePath.trim()
  if (trimmedPath.length === 0) {
    throw GitError.invalidArgument('filePath', 'File path cannot be empty')
  }
}

/**
 * 验证邮箱地址是否有效
 * @param email 邮箱地址
 */
export function validateEmail(email: string): void {
  if (!email || typeof email !== 'string') {
    throw GitError.invalidArgument('email', email)
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(email.trim())) {
    throw GitError.invalidArgument('email', 'Invalid email format')
  }
}

/**
 * 验证用户名是否有效
 * @param username 用户名
 */
export function validateUsername(username: string): void {
  if (!username || typeof username !== 'string') {
    throw GitError.invalidArgument('username', username)
  }

  const trimmedName = username.trim()
  if (trimmedName.length === 0) {
    throw GitError.invalidArgument('username', 'Username cannot be empty')
  }
}
