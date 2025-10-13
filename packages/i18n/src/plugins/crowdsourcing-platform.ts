/**
 * @ldesign/i18n - Crowdsourcing Platform
 * 翻译众包平台：社区贡献、投票机制、贡献者激励、实时协作
 */

import type { I18nPlugin, I18nInstance, Locale, Messages } from '../types';
import { EventEmitter } from 'events';

/**
 * 贡献者信息
 */
export interface Contributor {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  reputation: number;
  contributions: number;
  joinedAt: Date;
  languages: string[];
  badges: Badge[];
  stats: ContributorStats;
}

/**
 * 贡献者统计
 */
export interface ContributorStats {
  totalTranslations: number;
  acceptedTranslations: number;
  rejectedTranslations: number;
  pendingTranslations: number;
  totalVotes: number;
  helpfulVotes: number;
  accuracyRate: number;
  responseTime: number; // 平均响应时间（毫秒）
  specializations: string[]; // 专业领域
}

/**
 * 徽章系统
 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  earnedAt: Date;
  criteria: string;
}

/**
 * 翻译贡献
 */
export interface TranslationContribution {
  id: string;
  key: string;
  locale: Locale;
  originalText?: string;
  translatedText: string;
  contributorId: string;
  contributorName: string;
  createdAt: Date;
  updatedAt?: Date;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  votes: Vote[];
  comments: Comment[];
  reviewerId?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  confidence: number; // 置信度评分
  context?: string;
  examples?: string[];
  tags?: string[];
}

/**
 * 投票
 */
export interface Vote {
  id: string;
  contributionId: string;
  voterId: string;
  voterName: string;
  type: 'upvote' | 'downvote';
  reason?: string;
  timestamp: Date;
  weight: number; // 投票权重（基于投票者信誉）
}

/**
 * 评论
 */
export interface Comment {
  id: string;
  contributionId: string;
  authorId: string;
  authorName: string;
  text: string;
  timestamp: Date;
  replies?: Comment[];
  reactions?: Reaction[];
  edited?: boolean;
  editedAt?: Date;
}

/**
 * 反应
 */
export interface Reaction {
  userId: string;
  type: '👍' | '👎' | '❤️' | '🎉' | '😕' | '👀';
  timestamp: Date;
}

/**
 * 众包任务
 */
export interface CrowdsourcingTask {
  id: string;
  type: 'translation' | 'review' | 'validation' | 'improvement';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  key: string;
  locale: Locale;
  description: string;
  reward: Reward;
  deadline?: Date;
  assignedTo?: string[];
  completedBy?: string[];
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  estimatedTime: number; // 预计完成时间（分钟）
  requirements?: string[];
}

/**
 * 奖励
 */
export interface Reward {
  type: 'points' | 'badge' | 'credit' | 'recognition';
  amount?: number;
  badgeId?: string;
  description: string;
}

/**
 * 协作会话
 */
export interface CollaborationSession {
  id: string;
  participants: Participant[];
  translationKey: string;
  locale: Locale;
  startTime: Date;
  endTime?: Date;
  changes: Change[];
  chat: ChatMessage[];
  currentVersion: string;
  locked: boolean;
  lockedBy?: string;
}

/**
 * 参与者
 */
export interface Participant {
  id: string;
  name: string;
  role: 'editor' | 'reviewer' | 'viewer';
  cursor?: { line: number; column: number };
  selection?: { start: number; end: number };
  color: string;
  isActive: boolean;
  lastActivity: Date;
}

/**
 * 变更记录
 */
export interface Change {
  id: string;
  authorId: string;
  timestamp: Date;
  type: 'insert' | 'delete' | 'replace';
  position: number;
  content: string;
  previousContent?: string;
}

/**
 * 聊天消息
 */
export interface ChatMessage {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  timestamp: Date;
  type: 'message' | 'system' | 'notification';
}

/**
 * 贡献管理器
 */
export class ContributionManager extends EventEmitter {
  private contributions: Map<string, TranslationContribution> = new Map();
  private contributors: Map<string, Contributor> = new Map();
  private tasks: Map<string, CrowdsourcingTask> = new Map();
  private votingThreshold = 5; // 需要的最小投票数
  private acceptanceThreshold = 0.7; // 接受阈值（70%赞成）
  
  /**
   * 提交翻译贡献
   */
  async submitContribution(contribution: Omit<TranslationContribution, 'id' | 'createdAt' | 'status' | 'votes' | 'comments' | 'confidence'>): Promise<TranslationContribution> {
    const id = this.generateId();
    const newContribution: TranslationContribution = {
      ...contribution,
      id,
      createdAt: new Date(),
      status: 'pending',
      votes: [],
      comments: [],
      confidence: this.calculateInitialConfidence(contribution.contributorId)
    };
    
    this.contributions.set(id, newContribution);
    this.updateContributorStats(contribution.contributorId, 'submitted');
    
    // 触发事件
    this.emit('contribution:submitted', newContribution);
    
    // 自动分配审核任务
    this.assignReviewTask(newContribution);
    
    return newContribution;
  }
  
  /**
   * 投票
   */
  async vote(contributionId: string, vote: Omit<Vote, 'id' | 'contributionId' | 'timestamp' | 'weight'>): Promise<void> {
    const contribution = this.contributions.get(contributionId);
    if (!contribution) {
      throw new Error('Contribution not found');
    }
    
    // 检查是否已投票
    const existingVote = contribution.votes.find(v => v.voterId === vote.voterId);
    if (existingVote) {
      // 更新投票
      existingVote.type = vote.type;
      existingVote.reason = vote.reason;
      existingVote.timestamp = new Date();
    } else {
      // 新投票
      const voter = this.contributors.get(vote.voterId);
      const weight = this.calculateVoteWeight(voter);
      
      contribution.votes.push({
        ...vote,
        id: this.generateId(),
        contributionId,
        timestamp: new Date(),
        weight
      });
    }
    
    // 更新置信度
    contribution.confidence = this.calculateConfidence(contribution);
    
    // 检查是否达到投票阈值
    this.checkVotingThreshold(contribution);
    
    // 触发事件
    this.emit('contribution:voted', { contributionId, vote });
  }
  
  /**
   * 添加评论
   */
  async addComment(contributionId: string, comment: Omit<Comment, 'id' | 'contributionId' | 'timestamp'>): Promise<Comment> {
    const contribution = this.contributions.get(contributionId);
    if (!contribution) {
      throw new Error('Contribution not found');
    }
    
    const newComment: Comment = {
      ...comment,
      id: this.generateId(),
      contributionId,
      timestamp: new Date(),
      replies: [],
      reactions: []
    };
    
    contribution.comments.push(newComment);
    
    // 触发事件
    this.emit('contribution:commented', { contributionId, comment: newComment });
    
    return newComment;
  }
  
  /**
   * 计算初始置信度
   */
  private calculateInitialConfidence(contributorId: string): number {
    const contributor = this.contributors.get(contributorId);
    if (!contributor) return 0.5;
    
    // 基于贡献者的历史表现计算
    const { accuracyRate, contributions } = contributor.stats;
    const experienceFactor = Math.min(contributions / 100, 1); // 经验因子
    
    return accuracyRate * 0.7 + experienceFactor * 0.3;
  }
  
  /**
   * 计算投票权重
   */
  private calculateVoteWeight(voter?: Contributor): number {
    if (!voter) return 1;
    
    // 基于声誉和准确率计算权重
    const reputationWeight = Math.min(voter.reputation / 1000, 2); // 最高2倍权重
    const accuracyWeight = voter.stats.accuracyRate;
    
    return reputationWeight * accuracyWeight;
  }
  
  /**
   * 计算置信度
   */
  private calculateConfidence(contribution: TranslationContribution): number {
    if (contribution.votes.length === 0) {
      return contribution.confidence;
    }
    
    const totalWeight = contribution.votes.reduce((sum, v) => sum + v.weight, 0);
    const positiveWeight = contribution.votes
      .filter(v => v.type === 'upvote')
      .reduce((sum, v) => sum + v.weight, 0);
    
    return positiveWeight / totalWeight;
  }
  
  /**
   * 检查投票阈值
   */
  private checkVotingThreshold(contribution: TranslationContribution): void {
    const totalVotes = contribution.votes.reduce((sum, v) => sum + v.weight, 0);
    
    if (totalVotes >= this.votingThreshold) {
      if (contribution.confidence >= this.acceptanceThreshold) {
        this.acceptContribution(contribution);
      } else if (contribution.confidence < 0.3) {
        this.rejectContribution(contribution, '社区投票未通过');
      }
    }
  }
  
  /**
   * 接受贡献
   */
  private acceptContribution(contribution: TranslationContribution): void {
    contribution.status = 'accepted';
    contribution.reviewedAt = new Date();
    
    // 更新贡献者统计
    this.updateContributorStats(contribution.contributorId, 'accepted');
    
    // 奖励贡献者
    this.rewardContributor(contribution.contributorId, {
      type: 'points',
      amount: 100,
      description: '翻译贡献被接受'
    });
    
    // 触发事件
    this.emit('contribution:accepted', contribution);
  }
  
  /**
   * 拒绝贡献
   */
  private rejectContribution(contribution: TranslationContribution, reason: string): void {
    contribution.status = 'rejected';
    contribution.reviewedAt = new Date();
    contribution.rejectionReason = reason;
    
    // 更新贡献者统计
    this.updateContributorStats(contribution.contributorId, 'rejected');
    
    // 触发事件
    this.emit('contribution:rejected', contribution);
  }
  
  /**
   * 更新贡献者统计
   */
  private updateContributorStats(contributorId: string, action: 'submitted' | 'accepted' | 'rejected'): void {
    const contributor = this.contributors.get(contributorId);
    if (!contributor) return;
    
    switch (action) {
      case 'submitted':
        contributor.stats.totalTranslations++;
        contributor.stats.pendingTranslations++;
        break;
      case 'accepted':
        contributor.stats.acceptedTranslations++;
        contributor.stats.pendingTranslations--;
        contributor.reputation += 10;
        break;
      case 'rejected':
        contributor.stats.rejectedTranslations++;
        contributor.stats.pendingTranslations--;
        break;
    }
    
    // 重新计算准确率
    const total = contributor.stats.acceptedTranslations + contributor.stats.rejectedTranslations;
    if (total > 0) {
      contributor.stats.accuracyRate = contributor.stats.acceptedTranslations / total;
    }
  }
  
  /**
   * 奖励贡献者
   */
  private rewardContributor(contributorId: string, reward: Reward): void {
    const contributor = this.contributors.get(contributorId);
    if (!contributor) return;
    
    switch (reward.type) {
      case 'points':
        contributor.reputation += reward.amount || 0;
        break;
      case 'badge':
        if (reward.badgeId) {
          const badge = this.createBadge(reward.badgeId);
          contributor.badges.push(badge);
        }
        break;
    }
    
    this.emit('contributor:rewarded', { contributorId, reward });
  }
  
  /**
   * 创建徽章
   */
  private createBadge(badgeId: string): Badge {
    const badges: Record<string, Omit<Badge, 'id' | 'earnedAt'>> = {
      'first-contribution': {
        name: '首次贡献',
        description: '完成第一次翻译贡献',
        icon: '🌟',
        tier: 'bronze',
        criteria: '完成1次贡献'
      },
      'contributor-10': {
        name: '活跃贡献者',
        description: '完成10次翻译贡献',
        icon: '⭐',
        tier: 'silver',
        criteria: '完成10次贡献'
      },
      'contributor-100': {
        name: '资深贡献者',
        description: '完成100次翻译贡献',
        icon: '🌟',
        tier: 'gold',
        criteria: '完成100次贡献'
      },
      'accuracy-master': {
        name: '精准大师',
        description: '保持95%以上的准确率',
        icon: '🎯',
        tier: 'platinum',
        criteria: '准确率≥95%'
      }
    };
    
    const badgeTemplate = badges[badgeId] || badges['first-contribution'];
    
    return {
      ...badgeTemplate,
      id: badgeId,
      earnedAt: new Date()
    };
  }
  
  /**
   * 分配审核任务
   */
  private assignReviewTask(contribution: TranslationContribution): void {
    const task: CrowdsourcingTask = {
      id: this.generateId(),
      type: 'review',
      priority: 'medium',
      key: contribution.key,
      locale: contribution.locale,
      description: `审核翻译：${contribution.key}`,
      reward: {
        type: 'points',
        amount: 50,
        description: '审核翻译奖励'
      },
      status: 'open',
      difficulty: 'medium',
      estimatedTime: 5
    };
    
    this.tasks.set(task.id, task);
    this.emit('task:created', task);
  }
  
  /**
   * 生成ID
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
  
  /**
   * 获取排行榜
   */
  getLeaderboard(limit = 10): Contributor[] {
    return Array.from(this.contributors.values())
      .sort((a, b) => b.reputation - a.reputation)
      .slice(0, limit);
  }
  
  /**
   * 获取待审核贡献
   */
  getPendingContributions(): TranslationContribution[] {
    return Array.from(this.contributions.values())
      .filter(c => c.status === 'pending');
  }
  
  /**
   * 获取任务列表
   */
  getAvailableTasks(): CrowdsourcingTask[] {
    return Array.from(this.tasks.values())
      .filter(t => t.status === 'open');
  }
}

/**
 * 实时协作管理器
 */
export class CollaborationManager extends EventEmitter {
  private sessions: Map<string, CollaborationSession> = new Map();
  private websocket?: WebSocket;
  private currentSession?: CollaborationSession;
  private operationalTransform = new OperationalTransform();
  
  /**
   * 创建协作会话
   */
  createSession(translationKey: string, locale: Locale): CollaborationSession {
    const session: CollaborationSession = {
      id: this.generateId(),
      participants: [],
      translationKey,
      locale,
      startTime: new Date(),
      changes: [],
      chat: [],
      currentVersion: '',
      locked: false
    };
    
    this.sessions.set(session.id, session);
    this.currentSession = session;
    
    // 连接WebSocket
    this.connectWebSocket(session.id);
    
    return session;
  }
  
  /**
   * 加入会话
   */
  joinSession(sessionId: string, participant: Omit<Participant, 'isActive' | 'lastActivity'>): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    
    const newParticipant: Participant = {
      ...participant,
      isActive: true,
      lastActivity: new Date()
    };
    
    session.participants.push(newParticipant);
    
    // 广播新参与者
    this.broadcast({
      type: 'participant:joined',
      participant: newParticipant
    });
    
    this.emit('participant:joined', { sessionId, participant: newParticipant });
  }
  
  /**
   * 应用编辑
   */
  applyEdit(sessionId: string, change: Omit<Change, 'id' | 'timestamp'>): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    if (session.locked && session.lockedBy !== change.authorId) {
      throw new Error('Document is locked by another user');
    }
    
    const newChange: Change = {
      ...change,
      id: this.generateId(),
      timestamp: new Date()
    };
    
    // 应用操作转换
    const transformed = this.operationalTransform.transform(
      newChange,
      session.changes
    );
    
    session.changes.push(transformed);
    session.currentVersion = this.applyChange(session.currentVersion, transformed);
    
    // 广播变更
    this.broadcast({
      type: 'change:applied',
      change: transformed
    });
    
    this.emit('change:applied', { sessionId, change: transformed });
  }
  
  /**
   * 发送聊天消息
   */
  sendMessage(sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    const newMessage: ChatMessage = {
      ...message,
      id: this.generateId(),
      timestamp: new Date()
    };
    
    session.chat.push(newMessage);
    
    // 广播消息
    this.broadcast({
      type: 'message:sent',
      message: newMessage
    });
    
    this.emit('message:sent', { sessionId, message: newMessage });
  }
  
  /**
   * 锁定文档
   */
  lockDocument(sessionId: string, userId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    if (session.locked && session.lockedBy !== userId) {
      throw new Error('Document is already locked');
    }
    
    session.locked = true;
    session.lockedBy = userId;
    
    // 广播锁定状态
    this.broadcast({
      type: 'document:locked',
      lockedBy: userId
    });
    
    this.emit('document:locked', { sessionId, lockedBy: userId });
  }
  
  /**
   * 解锁文档
   */
  unlockDocument(sessionId: string, userId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    if (session.lockedBy !== userId) {
      throw new Error('You cannot unlock this document');
    }
    
    session.locked = false;
    session.lockedBy = undefined;
    
    // 广播解锁状态
    this.broadcast({
      type: 'document:unlocked'
    });
    
    this.emit('document:unlocked', { sessionId });
  }
  
  /**
   * 连接WebSocket
   */
  private connectWebSocket(sessionId: string): void {
    this.websocket = new WebSocket(`wss://collab.example.com/session/${sessionId}`);
    
    this.websocket.onopen = () => {
      console.log('[CollaborationManager] WebSocket connected');
    };
    
    this.websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleWebSocketMessage(message);
    };
    
    this.websocket.onerror = (error) => {
      console.error('[CollaborationManager] WebSocket error:', error);
    };
  }
  
  /**
   * 处理WebSocket消息
   */
  private handleWebSocketMessage(message: any): void {
    switch (message.type) {
      case 'participant:joined':
      case 'participant:left':
      case 'change:applied':
      case 'message:sent':
      case 'document:locked':
      case 'document:unlocked':
        this.emit(message.type, message);
        break;
    }
  }
  
  /**
   * 广播消息
   */
  private broadcast(message: any): void {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    }
  }
  
  /**
   * 应用变更到文本
   */
  private applyChange(text: string, change: Change): string {
    switch (change.type) {
      case 'insert':
        return text.slice(0, change.position) + change.content + text.slice(change.position);
      case 'delete':
        return text.slice(0, change.position) + text.slice(change.position + change.content.length);
      case 'replace':
        return text.slice(0, change.position) + change.content + 
               text.slice(change.position + (change.previousContent?.length || 0));
      default:
        return text;
    }
  }
  
  /**
   * 生成ID
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

/**
 * 操作转换（OT）算法
 */
class OperationalTransform {
  /**
   * 转换操作
   */
  transform(operation: Change, history: Change[]): Change {
    let transformed = { ...operation };
    
    for (const historicalOp of history) {
      transformed = this.transformPair(transformed, historicalOp);
    }
    
    return transformed;
  }
  
  /**
   * 转换操作对
   */
  private transformPair(op1: Change, op2: Change): Change {
    // 简化的OT实现
    if (op2.timestamp > op1.timestamp) {
      return op1;
    }
    
    if (op1.type === 'insert' && op2.type === 'insert') {
      if (op1.position < op2.position) {
        return op1;
      } else {
        return {
          ...op1,
          position: op1.position + op2.content.length
        };
      }
    }
    
    if (op1.type === 'delete' && op2.type === 'insert') {
      if (op1.position < op2.position) {
        return op1;
      } else {
        return {
          ...op1,
          position: op1.position + op2.content.length
        };
      }
    }
    
    // 其他情况的简化处理
    return op1;
  }
}

/**
 * 众包平台插件
 */
export class CrowdsourcingPlatformPlugin implements I18nPlugin {
  name = 'crowdsourcing-platform';
  version = '1.0.0';
  
  private contributionManager: ContributionManager;
  private collaborationManager: CollaborationManager;
  
  constructor() {
    this.contributionManager = new ContributionManager();
    this.collaborationManager = new CollaborationManager();
  }
  
  async install(i18n: I18nInstance): Promise<void> {
    console.log('[CrowdsourcingPlatform] Installing crowdsourcing platform...');
    
    // 添加贡献API
    (i18n as any).contribute = async (key: string, locale: Locale, translation: string, context?: string) => {
      return this.contributionManager.submitContribution({
        key,
        locale,
        translatedText: translation,
        contributorId: 'current-user', // 应该从认证系统获取
        contributorName: 'Current User',
        context
      });
    };
    
    // 添加投票API
    (i18n as any).voteTranslation = async (contributionId: string, type: 'upvote' | 'downvote', reason?: string) => {
      return this.contributionManager.vote(contributionId, {
        voterId: 'current-user',
        voterName: 'Current User',
        type,
        reason
      });
    };
    
    // 添加评论API
    (i18n as any).commentTranslation = async (contributionId: string, text: string) => {
      return this.contributionManager.addComment(contributionId, {
        authorId: 'current-user',
        authorName: 'Current User',
        text
      });
    };
    
    // 添加协作API
    (i18n as any).startCollaboration = (key: string, locale: Locale) => {
      return this.collaborationManager.createSession(key, locale);
    };
    
    // 添加排行榜API
    (i18n as any).getLeaderboard = (limit?: number) => {
      return this.contributionManager.getLeaderboard(limit);
    };
    
    // 添加任务API
    (i18n as any).getAvailableTasks = () => {
      return this.contributionManager.getAvailableTasks();
    };
    
    // 监听贡献接受事件，自动应用到i18n
    this.contributionManager.on('contribution:accepted', (contribution: TranslationContribution) => {
      i18n.addMessages(contribution.locale, {
        [contribution.key]: contribution.translatedText
      });
    });
    
    console.log('[CrowdsourcingPlatform] Crowdsourcing platform installed');
  }
  
  async uninstall(i18n: I18nInstance): Promise<void> {
    delete (i18n as any).contribute;
    delete (i18n as any).voteTranslation;
    delete (i18n as any).commentTranslation;
    delete (i18n as any).startCollaboration;
    delete (i18n as any).getLeaderboard;
    delete (i18n as any).getAvailableTasks;
    
    this.contributionManager.removeAllListeners();
    this.collaborationManager.removeAllListeners();
    
    console.log('[CrowdsourcingPlatform] Crowdsourcing platform uninstalled');
  }
}

export default CrowdsourcingPlatformPlugin;