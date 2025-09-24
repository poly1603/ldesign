/**
 * 用户状态管理器
 * 
 * 管理协作用户的在线状态、光标位置、选择状态等
 */

import type {
  User,
  UserPresence,
  UserPresenceManager as IUserPresenceManager
} from './types'
import { EventEmitter } from 'events'

/**
 * 用户状态管理器类
 */
export class UserPresenceManager extends EventEmitter implements IUserPresenceManager {
  private presences: Map<string, UserPresence> = new Map()
  private isTracking: boolean = false
  private trackingInterval?: number
  private presenceTimeout: number = 30000 // 30秒无活动视为离线
  private currentUser?: User

  /**
   * 设置当前用户
   */
  setCurrentUser(user: User): void {
    this.currentUser = user
    this.updatePresence({
      user,
      activity: 'active',
      lastActivity: Date.now()
    })
  }

  /**
   * 更新用户状态
   */
  updatePresence(presence: Partial<UserPresence>): void {
    if (!presence.user?.id) {
      return
    }

    const userId = presence.user.id
    const existingPresence = this.presences.get(userId)
    
    const updatedPresence: UserPresence = {
      user: presence.user,
      cursor: presence.cursor || existingPresence?.cursor,
      selection: presence.selection || existingPresence?.selection,
      viewport: presence.viewport || existingPresence?.viewport,
      activity: presence.activity || existingPresence?.activity || 'active',
      lastActivity: presence.lastActivity || Date.now()
    }

    this.presences.set(userId, updatedPresence)
    this.emit('presence:updated', updatedPresence)
  }

  /**
   * 获取用户状态
   */
  getUserPresence(userId: string): UserPresence | null {
    return this.presences.get(userId) || null
  }

  /**
   * 获取所有用户状态
   */
  getAllPresences(): UserPresence[] {
    return Array.from(this.presences.values())
  }

  /**
   * 获取在线用户
   */
  getOnlineUsers(): UserPresence[] {
    const now = Date.now()
    return this.getAllPresences().filter(presence => {
      return now - presence.lastActivity < this.presenceTimeout
    })
  }

  /**
   * 更新光标位置
   */
  updateCursor(userId: string, cursor: { x: number; y: number; visible: boolean }): void {
    const presence = this.presences.get(userId)
    if (presence) {
      this.updatePresence({
        ...presence,
        cursor,
        lastActivity: Date.now()
      })
    }
  }

  /**
   * 更新选择状态
   */
  updateSelection(userId: string, selection: { nodeIds: string[]; edgeIds: string[] }): void {
    const presence = this.presences.get(userId)
    if (presence) {
      this.updatePresence({
        ...presence,
        selection,
        lastActivity: Date.now()
      })
    }
  }

  /**
   * 更新视口状态
   */
  updateViewport(userId: string, viewport: { x: number; y: number; scale: number }): void {
    const presence = this.presences.get(userId)
    if (presence) {
      this.updatePresence({
        ...presence,
        viewport,
        lastActivity: Date.now()
      })
    }
  }

  /**
   * 设置用户活动状态
   */
  setUserActivity(userId: string, activity: UserPresence['activity']): void {
    const presence = this.presences.get(userId)
    if (presence) {
      this.updatePresence({
        ...presence,
        activity,
        lastActivity: Date.now()
      })
    }
  }

  /**
   * 移除用户状态
   */
  removeUserPresence(userId: string): void {
    const presence = this.presences.get(userId)
    if (presence) {
      this.presences.delete(userId)
      this.emit('presence:removed', presence)
    }
  }

  /**
   * 开始状态跟踪
   */
  startTracking(): void {
    if (this.isTracking) {
      return
    }

    this.isTracking = true
    
    // 定期检查用户活动状态
    this.trackingInterval = window.setInterval(() => {
      this.checkUserActivity()
    }, 5000) // 每5秒检查一次

    // 监听鼠标和键盘活动
    this.setupActivityListeners()
  }

  /**
   * 停止状态跟踪
   */
  stopTracking(): void {
    if (!this.isTracking) {
      return
    }

    this.isTracking = false
    
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval)
      this.trackingInterval = undefined
    }

    this.removeActivityListeners()
  }

  /**
   * 检查用户活动状态
   */
  private checkUserActivity(): void {
    const now = Date.now()
    
    this.presences.forEach((presence, userId) => {
      const timeSinceLastActivity = now - presence.lastActivity
      
      let newActivity: UserPresence['activity'] = presence.activity
      
      if (timeSinceLastActivity > this.presenceTimeout) {
        newActivity = 'away'
      } else if (timeSinceLastActivity > 60000) { // 1分钟
        newActivity = 'idle'
      } else {
        newActivity = 'active'
      }

      if (newActivity !== presence.activity) {
        this.updatePresence({
          ...presence,
          activity: newActivity
        })
      }
    })
  }

  /**
   * 设置活动监听器
   */
  private setupActivityListeners(): void {
    // 鼠标移动
    document.addEventListener('mousemove', this.handleUserActivity)
    
    // 键盘活动
    document.addEventListener('keydown', this.handleUserActivity)
    document.addEventListener('keyup', this.handleUserActivity)
    
    // 鼠标点击
    document.addEventListener('click', this.handleUserActivity)
    
    // 滚动
    document.addEventListener('scroll', this.handleUserActivity)
    
    // 窗口焦点
    window.addEventListener('focus', this.handleWindowFocus)
    window.addEventListener('blur', this.handleWindowBlur)
  }

  /**
   * 移除活动监听器
   */
  private removeActivityListeners(): void {
    document.removeEventListener('mousemove', this.handleUserActivity)
    document.removeEventListener('keydown', this.handleUserActivity)
    document.removeEventListener('keyup', this.handleUserActivity)
    document.removeEventListener('click', this.handleUserActivity)
    document.removeEventListener('scroll', this.handleUserActivity)
    window.removeEventListener('focus', this.handleWindowFocus)
    window.removeEventListener('blur', this.handleWindowBlur)
  }

  /**
   * 处理用户活动
   */
  private handleUserActivity = (): void => {
    if (this.currentUser) {
      this.setUserActivity(this.currentUser.id, 'active')
    }
  }

  /**
   * 处理窗口获得焦点
   */
  private handleWindowFocus = (): void => {
    if (this.currentUser) {
      this.setUserActivity(this.currentUser.id, 'active')
    }
  }

  /**
   * 处理窗口失去焦点
   */
  private handleWindowBlur = (): void => {
    if (this.currentUser) {
      this.setUserActivity(this.currentUser.id, 'idle')
    }
  }

  /**
   * 获取用户状态统计
   */
  getPresenceStats(): {
    totalUsers: number
    activeUsers: number
    idleUsers: number
    awayUsers: number
  } {
    const presences = this.getAllPresences()
    
    return {
      totalUsers: presences.length,
      activeUsers: presences.filter(p => p.activity === 'active').length,
      idleUsers: presences.filter(p => p.activity === 'idle').length,
      awayUsers: presences.filter(p => p.activity === 'away').length
    }
  }

  /**
   * 清理过期的用户状态
   */
  cleanupExpiredPresences(): void {
    const now = Date.now()
    const expiredUsers: string[] = []
    
    this.presences.forEach((presence, userId) => {
      if (now - presence.lastActivity > this.presenceTimeout * 2) {
        expiredUsers.push(userId)
      }
    })
    
    expiredUsers.forEach(userId => {
      this.removeUserPresence(userId)
    })
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.stopTracking()
    this.presences.clear()
    this.removeAllListeners()
  }
}
