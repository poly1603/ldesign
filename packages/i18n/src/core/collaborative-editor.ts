/**
 * @ldesign/i18n - Collaborative Translation Editor
 * 实时协作翻译编辑器：支持多人同时编辑翻译内容
 */

import type { Locale, Messages } from '../types';
import { EventEmitter } from 'events';

/**
 * 协作者信息
 */
export interface Collaborator {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'reviewer' | 'viewer';
  color: string; // 用于标识编辑者的颜色
  status: 'online' | 'away' | 'offline';
  lastActivity: Date;
  permissions: CollaboratorPermissions;
}

/**
 * 协作者权限
 */
export interface CollaboratorPermissions {
  canEdit: boolean;
  canReview: boolean;
  canComment: boolean;
  canApprove: boolean;
  canDelete: boolean;
  canInvite: boolean;
  canExport: boolean;
}

/**
 * 翻译条目
 */
export interface TranslationEntry {
  id: string;
  key: string;
  locale: Locale;
  originalValue: string;
  currentValue: string;
  status: 'draft' | 'reviewing' | 'approved' | 'published';
  metadata: {
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    approvedAt?: Date;
    approvedBy?: string;
    publishedAt?: Date;
    publishedBy?: string;
    description?: string;
    context?: string;
    maxLength?: number;
    tags?: string[];
  };
  history: TranslationHistory[];
  comments: Comment[];
  suggestions: Suggestion[];
  locks?: EditLock[];
}

/**
 * 翻译历史记录
 */
export interface TranslationHistory {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: 'create' | 'edit' | 'approve' | 'reject' | 'publish';
  oldValue?: string;
  newValue: string;
  reason?: string;
}

/**
 * 评论
 */
export interface Comment {
  id: string;
  userId: string;
  userName: string;
  timestamp: Date;
  text: string;
  resolved: boolean;
  replies: Comment[];
  mentions?: string[]; // @提及的用户ID
}

/**
 * 建议
 */
export interface Suggestion {
  id: string;
  userId: string;
  userName: string;
  timestamp: Date;
  value: string;
  reason?: string;
  votes: { userId: string; vote: 'up' | 'down' }[];
  status: 'pending' | 'accepted' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
}

/**
 * 编辑锁
 */
export interface EditLock {
  entryId: string;
  userId: string;
  lockedAt: Date;
  expiresAt: Date;
}

/**
 * 协作事件
 */
export interface CollaborationEvent {
  type: 
    | 'user_joined'
    | 'user_left'
    | 'user_typing'
    | 'entry_locked'
    | 'entry_unlocked'
    | 'entry_updated'
    | 'comment_added'
    | 'suggestion_added'
    | 'status_changed';
  userId: string;
  data: any;
  timestamp: Date;
}

/**
 * 冲突解决策略
 */
export interface ConflictResolution {
  strategy: 'last_write_wins' | 'manual' | 'merge' | 'lock';
  autoResolve: boolean;
  notifyOnConflict: boolean;
}

/**
 * 协作翻译编辑器
 */
export class CollaborativeEditor extends EventEmitter {
  private entries: Map<string, TranslationEntry> = new Map();
  private collaborators: Map<string, Collaborator> = new Map();
  private activeSessions: Map<string, CollaboratorSession> = new Map();
  private editLocks: Map<string, EditLock> = new Map();
  private conflictResolution: ConflictResolution;
  private syncInterval: NodeJS.Timeout | null = null;
  private autoSaveInterval: NodeJS.Timeout | null = null;

  constructor(options?: {
    conflictResolution?: ConflictResolution;
    autoSaveInterval?: number;
    lockTimeout?: number;
  }) {
    super();
    
    this.conflictResolution = options?.conflictResolution || {
      strategy: 'last_write_wins',
      autoResolve: true,
      notifyOnConflict: true
    };

    // 启动自动保存
    if (options?.autoSaveInterval) {
      this.startAutoSave(options.autoSaveInterval);
    }

    // 启动同步
    this.startSync();
  }

  /**
   * 加入协作会话
   */
  joinSession(collaborator: Collaborator): string {
    const sessionId = this.generateSessionId();
    
    // 添加协作者
    this.collaborators.set(collaborator.id, collaborator);
    
    // 创建会话
    const session: CollaboratorSession = {
      id: sessionId,
      collaboratorId: collaborator.id,
      startTime: new Date(),
      lastActivity: new Date(),
      editingEntries: new Set()
    };
    
    this.activeSessions.set(sessionId, session);
    
    // 广播用户加入事件
    this.broadcast({
      type: 'user_joined',
      userId: collaborator.id,
      data: collaborator,
      timestamp: new Date()
    });
    
    console.log(`👥 ${collaborator.name} joined the collaboration session`);
    
    return sessionId;
  }

  /**
   * 离开协作会话
   */
  leaveSession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;
    
    const collaborator = this.collaborators.get(session.collaboratorId);
    
    // 释放该用户的所有锁
    this.releaseAllLocks(session.collaboratorId);
    
    // 移除会话
    this.activeSessions.delete(sessionId);
    
    // 广播用户离开事件
    this.broadcast({
      type: 'user_left',
      userId: session.collaboratorId,
      data: null,
      timestamp: new Date()
    });
    
    console.log(`👋 ${collaborator?.name || 'User'} left the collaboration session`);
  }

  /**
   * 获取翻译条目
   */
  getEntry(key: string, locale: Locale): TranslationEntry | null {
    const entryId = this.getEntryId(key, locale);
    return this.entries.get(entryId) || null;
  }

  /**
   * 创建或更新翻译条目
   */
  async updateEntry(
    sessionId: string,
    key: string,
    locale: Locale,
    value: string,
    metadata?: Partial<TranslationEntry['metadata']>
  ): Promise<TranslationEntry> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Invalid session');
    }
    
    const collaborator = this.collaborators.get(session.collaboratorId);
    if (!collaborator) {
      throw new Error('Collaborator not found');
    }
    
    // 检查权限
    if (!collaborator.permissions.canEdit) {
      throw new Error('No edit permission');
    }
    
    const entryId = this.getEntryId(key, locale);
    
    // 获取或创建条目
    let entry = this.entries.get(entryId);
    
    if (!entry) {
      // 创建新条目
      entry = this.createEntry(key, locale, value, collaborator.id);
    } else {
      // 检查编辑锁
      const lock = this.editLocks.get(entryId);
      if (lock && lock.userId !== collaborator.id && lock.expiresAt > new Date()) {
        throw new Error(`Entry is locked by another user until ${lock.expiresAt}`);
      }
      
      // 检查冲突
      const conflict = await this.checkConflict(entry, value, collaborator.id);
      if (conflict) {
        const resolved = await this.resolveConflict(entry, value, collaborator.id);
        if (!resolved) {
          throw new Error('Conflict could not be resolved');
        }
      }
      
      // 更新条目
      this.applyUpdate(entry, value, collaborator.id, collaborator.name);
    }
    
    // 更新元数据
    if (metadata) {
      Object.assign(entry.metadata, metadata, {
        updatedAt: new Date(),
        updatedBy: collaborator.id
      });
    }
    
    // 保存条目
    this.entries.set(entryId, entry);
    
    // 广播更新事件
    this.broadcast({
      type: 'entry_updated',
      userId: collaborator.id,
      data: { entry, sessionId },
      timestamp: new Date()
    });
    
    return entry;
  }

  /**
   * 锁定条目进行编辑
   */
  lockEntry(
    sessionId: string,
    key: string,
    locale: Locale,
    duration: number = 60000
  ): EditLock {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Invalid session');
    }
    
    const entryId = this.getEntryId(key, locale);
    const existingLock = this.editLocks.get(entryId);
    
    if (existingLock && existingLock.userId !== session.collaboratorId) {
      if (existingLock.expiresAt > new Date()) {
        throw new Error('Entry is already locked by another user');
      }
    }
    
    const lock: EditLock = {
      entryId,
      userId: session.collaboratorId,
      lockedAt: new Date(),
      expiresAt: new Date(Date.now() + duration)
    };
    
    this.editLocks.set(entryId, lock);
    
    // 广播锁定事件
    this.broadcast({
      type: 'entry_locked',
      userId: session.collaboratorId,
      data: lock,
      timestamp: new Date()
    });
    
    // 自动释放过期锁
    setTimeout(() => {
      if (this.editLocks.get(entryId) === lock) {
        this.unlockEntry(sessionId, key, locale);
      }
    }, duration);
    
    return lock;
  }

  /**
   * 解锁条目
   */
  unlockEntry(sessionId: string, key: string, locale: Locale): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;
    
    const entryId = this.getEntryId(key, locale);
    const lock = this.editLocks.get(entryId);
    
    if (lock && lock.userId === session.collaboratorId) {
      this.editLocks.delete(entryId);
      
      // 广播解锁事件
      this.broadcast({
        type: 'entry_unlocked',
        userId: session.collaboratorId,
        data: { entryId },
        timestamp: new Date()
      });
    }
  }

  /**
   * 添加评论
   */
  addComment(
    sessionId: string,
    key: string,
    locale: Locale,
    text: string,
    mentions?: string[]
  ): Comment {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Invalid session');
    }
    
    const collaborator = this.collaborators.get(session.collaboratorId);
    if (!collaborator || !collaborator.permissions.canComment) {
      throw new Error('No comment permission');
    }
    
    const entryId = this.getEntryId(key, locale);
    const entry = this.entries.get(entryId);
    
    if (!entry) {
      throw new Error('Entry not found');
    }
    
    const comment: Comment = {
      id: this.generateId(),
      userId: collaborator.id,
      userName: collaborator.name,
      timestamp: new Date(),
      text,
      resolved: false,
      replies: [],
      mentions
    };
    
    entry.comments.push(comment);
    
    // 通知被提及的用户
    if (mentions) {
      mentions.forEach(userId => {
        this.notifyUser(userId, {
          type: 'mention',
          from: collaborator.name,
          entry: key,
          comment: text
        });
      });
    }
    
    // 广播评论事件
    this.broadcast({
      type: 'comment_added',
      userId: collaborator.id,
      data: { entryId, comment },
      timestamp: new Date()
    });
    
    return comment;
  }

  /**
   * 添加翻译建议
   */
  addSuggestion(
    sessionId: string,
    key: string,
    locale: Locale,
    value: string,
    reason?: string
  ): Suggestion {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Invalid session');
    }
    
    const collaborator = this.collaborators.get(session.collaboratorId);
    if (!collaborator) {
      throw new Error('Collaborator not found');
    }
    
    const entryId = this.getEntryId(key, locale);
    const entry = this.entries.get(entryId);
    
    if (!entry) {
      throw new Error('Entry not found');
    }
    
    const suggestion: Suggestion = {
      id: this.generateId(),
      userId: collaborator.id,
      userName: collaborator.name,
      timestamp: new Date(),
      value,
      reason,
      votes: [],
      status: 'pending'
    };
    
    entry.suggestions.push(suggestion);
    
    // 广播建议事件
    this.broadcast({
      type: 'suggestion_added',
      userId: collaborator.id,
      data: { entryId, suggestion },
      timestamp: new Date()
    });
    
    return suggestion;
  }

  /**
   * 审批翻译
   */
  approveEntry(
    sessionId: string,
    key: string,
    locale: Locale
  ): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Invalid session');
    }
    
    const collaborator = this.collaborators.get(session.collaboratorId);
    if (!collaborator || !collaborator.permissions.canApprove) {
      throw new Error('No approval permission');
    }
    
    const entryId = this.getEntryId(key, locale);
    const entry = this.entries.get(entryId);
    
    if (!entry) {
      throw new Error('Entry not found');
    }
    
    entry.status = 'approved';
    entry.metadata.approvedAt = new Date();
    entry.metadata.approvedBy = collaborator.id;
    
    // 添加历史记录
    entry.history.push({
      id: this.generateId(),
      timestamp: new Date(),
      userId: collaborator.id,
      userName: collaborator.name,
      action: 'approve',
      newValue: entry.currentValue
    });
    
    // 广播状态变更
    this.broadcast({
      type: 'status_changed',
      userId: collaborator.id,
      data: { entryId, status: 'approved' },
      timestamp: new Date()
    });
  }

  /**
   * 获取协作统计
   */
  getStatistics(): CollaborationStatistics {
    const stats: CollaborationStatistics = {
      totalEntries: this.entries.size,
      totalCollaborators: this.collaborators.size,
      activeSessions: this.activeSessions.size,
      entriesByStatus: new Map(),
      entriesByLocale: new Map(),
      recentActivity: [],
      topContributors: []
    };
    
    // 统计条目状态
    for (const entry of this.entries.values()) {
      const count = stats.entriesByStatus.get(entry.status) || 0;
      stats.entriesByStatus.set(entry.status, count + 1);
      
      const localeCount = stats.entriesByLocale.get(entry.locale) || 0;
      stats.entriesByLocale.set(entry.locale, localeCount + 1);
    }
    
    // 统计贡献者
    const contributions = new Map<string, number>();
    for (const entry of this.entries.values()) {
      for (const history of entry.history) {
        const count = contributions.get(history.userId) || 0;
        contributions.set(history.userId, count + 1);
      }
    }
    
    // 排序贡献者
    stats.topContributors = Array.from(contributions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([userId, count]) => {
        const collaborator = this.collaborators.get(userId);
        return {
          userId,
          name: collaborator?.name || 'Unknown',
          contributions: count
        };
      });
    
    return stats;
  }

  /**
   * 导出翻译
   */
  exportTranslations(locale?: Locale, status?: TranslationEntry['status']): Messages {
    const messages: Messages = {};
    
    for (const entry of this.entries.values()) {
      if (locale && entry.locale !== locale) continue;
      if (status && entry.status !== status) continue;
      
      messages[entry.key] = entry.currentValue;
    }
    
    return messages;
  }

  // ========== 私有方法 ==========

  private createEntry(
    key: string,
    locale: Locale,
    value: string,
    userId: string
  ): TranslationEntry {
    const collaborator = this.collaborators.get(userId);
    
    return {
      id: this.getEntryId(key, locale),
      key,
      locale,
      originalValue: value,
      currentValue: value,
      status: 'draft',
      metadata: {
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId
      },
      history: [{
        id: this.generateId(),
        timestamp: new Date(),
        userId,
        userName: collaborator?.name || 'Unknown',
        action: 'create',
        newValue: value
      }],
      comments: [],
      suggestions: []
    };
  }

  private applyUpdate(
    entry: TranslationEntry,
    value: string,
    userId: string,
    userName: string
  ): void {
    // 添加历史记录
    entry.history.push({
      id: this.generateId(),
      timestamp: new Date(),
      userId,
      userName,
      action: 'edit',
      oldValue: entry.currentValue,
      newValue: value
    });
    
    // 更新值
    entry.currentValue = value;
    entry.metadata.updatedAt = new Date();
    entry.metadata.updatedBy = userId;
    
    // 重置状态为草稿
    if (entry.status === 'approved' || entry.status === 'published') {
      entry.status = 'draft';
    }
  }

  private async checkConflict(
    entry: TranslationEntry,
    newValue: string,
    userId: string
  ): Promise<boolean> {
    // 检查是否有其他用户正在编辑
    const lastUpdate = entry.history[entry.history.length - 1];
    
    if (lastUpdate && lastUpdate.userId !== userId) {
      const timeDiff = Date.now() - lastUpdate.timestamp.getTime();
      
      // 如果最近5秒内有其他人更新，可能存在冲突
      if (timeDiff < 5000) {
        return true;
      }
    }
    
    return false;
  }

  private async resolveConflict(
    entry: TranslationEntry,
    newValue: string,
    userId: string
  ): Promise<boolean> {
    switch (this.conflictResolution.strategy) {
      case 'last_write_wins':
        return true; // 直接覆盖
      
      case 'lock':
        return false; // 拒绝更新
      
      case 'merge':
        // 尝试自动合并
        // 这里可以实现更复杂的合并逻辑
        return this.tryMerge(entry.currentValue, newValue);
      
      case 'manual':
        // 通知用户手动解决
        if (this.conflictResolution.notifyOnConflict) {
          this.notifyUser(userId, {
            type: 'conflict',
            entry: entry.key,
            currentValue: entry.currentValue,
            yourValue: newValue
          });
        }
        return false;
      
      default:
        return false;
    }
  }

  private tryMerge(current: string, incoming: string): boolean {
    // 简单的合并策略示例
    // 实际应用中可能需要更复杂的算法
    if (current === incoming) {
      return true;
    }
    
    // 如果只是大小写不同，使用新值
    if (current.toLowerCase() === incoming.toLowerCase()) {
      return true;
    }
    
    // 其他情况无法自动合并
    return false;
  }

  private broadcast(event: CollaborationEvent): void {
    this.emit('collaboration-event', event);
    
    // 通知所有在线协作者
    for (const session of this.activeSessions.values()) {
      const collaborator = this.collaborators.get(session.collaboratorId);
      if (collaborator && collaborator.status === 'online') {
        // 发送事件到协作者
        this.emit(`event:${session.collaboratorId}`, event);
      }
    }
  }

  private notifyUser(userId: string, notification: any): void {
    this.emit(`notification:${userId}`, notification);
  }

  private releaseAllLocks(userId: string): void {
    const locksToRelease: string[] = [];
    
    for (const [entryId, lock] of this.editLocks) {
      if (lock.userId === userId) {
        locksToRelease.push(entryId);
      }
    }
    
    locksToRelease.forEach(entryId => {
      this.editLocks.delete(entryId);
      
      this.broadcast({
        type: 'entry_unlocked',
        userId,
        data: { entryId },
        timestamp: new Date()
      });
    });
  }

  private startSync(): void {
    // 定期同步数据
    this.syncInterval = setInterval(() => {
      // 清理过期锁
      const now = new Date();
      for (const [entryId, lock] of this.editLocks) {
        if (lock.expiresAt < now) {
          this.editLocks.delete(entryId);
        }
      }
      
      // 更新协作者状态
      for (const session of this.activeSessions.values()) {
        const inactiveTime = Date.now() - session.lastActivity.getTime();
        const collaborator = this.collaborators.get(session.collaboratorId);
        
        if (collaborator) {
          if (inactiveTime > 5 * 60 * 1000) {
            collaborator.status = 'away';
          } else {
            collaborator.status = 'online';
          }
        }
      }
    }, 10000); // 每10秒同步一次
  }

  private startAutoSave(interval: number): void {
    this.autoSaveInterval = setInterval(() => {
      // 触发自动保存事件
      this.emit('auto-save', this.exportTranslations());
    }, interval);
  }

  private getEntryId(key: string, locale: Locale): string {
    return `${locale}:${key}`;
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${this.generateId()}`;
  }

  /**
   * 销毁编辑器
   */
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    
    this.removeAllListeners();
    this.entries.clear();
    this.collaborators.clear();
    this.activeSessions.clear();
    this.editLocks.clear();
  }
}

/**
 * 协作者会话
 */
interface CollaboratorSession {
  id: string;
  collaboratorId: string;
  startTime: Date;
  lastActivity: Date;
  editingEntries: Set<string>;
}

/**
 * 协作统计
 */
export interface CollaborationStatistics {
  totalEntries: number;
  totalCollaborators: number;
  activeSessions: number;
  entriesByStatus: Map<TranslationEntry['status'], number>;
  entriesByLocale: Map<Locale, number>;
  recentActivity: any[];
  topContributors: {
    userId: string;
    name: string;
    contributions: number;
  }[];
}

/**
 * 创建协作编辑器
 */
export function createCollaborativeEditor(options?: {
  conflictResolution?: ConflictResolution;
  autoSaveInterval?: number;
  lockTimeout?: number;
}): CollaborativeEditor {
  return new CollaborativeEditor(options);
}