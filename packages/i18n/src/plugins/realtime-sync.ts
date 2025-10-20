/**
 * Real-time Translation Synchronization
 * WebSocket-based real-time sync for collaborative translation editing
 */

import { EventEmitter } from 'node:events';

interface SyncConfig {
  url: string;
  autoReconnect: boolean;
  reconnectDelay: number;
  heartbeatInterval: number;
  maxReconnectAttempts: number;
  enableOfflineQueue: boolean;
  conflictResolution: 'latest' | 'merge' | 'manual';
}

interface TranslationUpdate {
  id: string;
  locale: string;
  key: string;
  value: string;
  oldValue?: string;
  timestamp: number;
  userId: string;
  userName?: string;
  version: number;
  checksum?: string;
}

interface SyncState {
  connected: boolean;
  syncing: boolean;
  lastSync: number;
  pendingUpdates: number;
  conflicts: number;
  peers: Map<string, PeerInfo>;
}

interface PeerInfo {
  id: string;
  name: string;
  locale?: string;
  activeKeys: Set<string>;
  lastSeen: number;
  cursor?: CursorPosition;
}

interface CursorPosition {
  key: string;
  position: number;
  selection?: { start: number; end: number };
}

interface Conflict {
  key: string;
  locale: string;
  local: TranslationUpdate;
  remote: TranslationUpdate;
  resolution?: 'local' | 'remote' | 'merged';
  mergedValue?: string;
}

interface OperationalTransform {
  type: 'insert' | 'delete' | 'replace';
  position: number;
  content?: string;
  length?: number;
  version: number;
}

export class RealtimeSync extends EventEmitter {
  private config: SyncConfig;
  private ws: WebSocket | null = null;
  private state: SyncState;
  private reconnectAttempts: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private offlineQueue: TranslationUpdate[] = [];
  private versionMap: Map<string, number> = new Map();
  private conflictQueue: Conflict[] = [];
  private transformQueue: Map<string, OperationalTransform[]> = new Map();
  private localUserId: string;
  private localUserName: string;
  private maxQueueSize: number = 1000; // Prevent unbounded queue growth
  private maxTransformQueueSize: number = 100; // Limit transform queue per key

  constructor(config: Partial<SyncConfig> = {}) {
    super();
    
    this.config = {
      url: config.url || 'ws://localhost:8080/sync',
      autoReconnect: config.autoReconnect !== false,
      reconnectDelay: config.reconnectDelay || 1000,
      heartbeatInterval: config.heartbeatInterval || 30000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      enableOfflineQueue: config.enableOfflineQueue !== false,
      conflictResolution: config.conflictResolution || 'merge'
    };

    this.state = {
      connected: false,
      syncing: false,
      lastSync: 0,
      pendingUpdates: 0,
      conflicts: 0,
      peers: new Map()
    };

    this.localUserId = this.generateUserId();
    this.localUserName = 'User';
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.state.connected) {
        resolve();
        return;
      }

      try {
        this.ws = new WebSocket(this.config?.url);
        
        this.ws.onopen = () => {
          this.handleConnect();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          this.handleError(error);
          reject(error);
        };

        this.ws.onclose = () => {
          this.handleDisconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.config) {
      this.config.autoReconnect = false;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.state.connected = false;
    this.emit('disconnect');
  }

  private handleConnect(): void {
    this.state.connected = true;
    this.reconnectAttempts = 0;
    
    // Send identification
    this.send('identify', {
      userId: this.localUserId,
      userName: this.localUserName,
      timestamp: Date.now()
    });

    // Start heartbeat
    this.startHeartbeat();

    // Process offline queue
    if (this.config?.enableOfflineQueue && this.offlineQueue.length > 0) {
      this.flushOfflineQueue();
    }

    this.emit('connect');
  }

  private handleDisconnect(): void {
    this.state.connected = false;
    this.state.peers.clear();

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.config?.autoReconnect && this.reconnectAttempts < this.config?.maxReconnectAttempts) {
      this.scheduleReconnect();
    }

    this.emit('disconnect');
  }

  private handleError(error: Event): void {
    console.error('WebSocket error:', error);
    this.emit('error', error);
  }

  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'update':
          this.handleRemoteUpdate(message.data);
          break;
        case 'peer-join':
          this.handlePeerJoin(message.data);
          break;
        case 'peer-leave':
          this.handlePeerLeave(message.data);
          break;
        case 'peer-cursor':
          this.handlePeerCursor(message.data);
          break;
        case 'sync-request':
          this.handleSyncRequest(message.data);
          break;
        case 'sync-response':
          this.handleSyncResponse(message.data);
          break;
        case 'conflict':
          this.handleConflict(message.data);
          break;
        case 'transform':
          this.handleTransform(message.data);
          break;
        case 'heartbeat':
          // Server heartbeat response
          break;
        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  private handleRemoteUpdate(update: TranslationUpdate): void {
    // Check for conflicts
    const localVersion = this.versionMap.get(`${update.locale}:${update.key}`) || 0;
    
    if (update.version <= localVersion) {
      // Potential conflict
      this.detectAndResolveConflict(update);
      return;
    }

    // Apply update
    this.applyUpdate(update);
    
    // Update version
    this.versionMap.set(`${update.locale}:${update.key}`, update.version);
    
    // Emit event for UI update
    this.emit('translation:update', update);
    
    // Update state
    this.state.lastSync = Date.now();
  }

  private handlePeerJoin(peer: PeerInfo): void {
    // Limit peer connections to prevent memory exhaustion
    if (this.state.peers.size >= 100) {
      // Remove oldest peer
      const oldestPeer = Array.from(this.state.peers.entries())
        .sort((a, b) => a[1].lastSeen - b[1].lastSeen)[0];
      if (oldestPeer) {
        this.state.peers.delete(oldestPeer[0]);
      }
    }
    this.state.peers.set(peer.id, peer);
    this.emit('peer:join', peer);
  }

  private handlePeerLeave(peerId: string): void {
    const peer = this.state.peers.get(peerId);
    if (peer) {
      this.state.peers.delete(peerId);
      this.emit('peer:leave', peer);
    }
  }

  private handlePeerCursor(data: { userId: string; cursor: CursorPosition }): void {
    const peer = this.state.peers.get(data.userId);
    if (peer) {
      peer.cursor = data.cursor;
      peer.lastSeen = Date.now();
      this.emit('peer:cursor', { peer, cursor: data.cursor });
    }
  }

  private handleSyncRequest(data: { keys: string[]; locale: string; since?: number }): void {
    // Respond with local translations
    const response = this.gatherLocalTranslations(data.keys, data.locale, data.since);
    this.send('sync-response', response);
  }

  private handleSyncResponse(data: { translations: TranslationUpdate[] }): void {
    // Apply remote translations
    for (const update of data.translations) {
      this.handleRemoteUpdate(update);
    }
  }

  private handleConflict(conflict: Conflict): void {
    this.conflictQueue.push(conflict);
    this.state.conflicts = this.conflictQueue.length;
    
    // Auto-resolve if configured
    if (this.config?.conflictResolution !== 'manual') {
      this.autoResolveConflict(conflict);
    } else {
      this.emit('conflict', conflict);
    }
  }

  private handleTransform(transform: OperationalTransform): void {
    const key = `${transform.version}`;
    let queue = this.transformQueue.get(key) || [];
    
    // Limit queue size to prevent memory leak
    if (queue.length >= this.maxTransformQueueSize) {
      queue = queue.slice(-this.maxTransformQueueSize + 1); // Keep most recent
    }
    queue.push(transform);
    this.transformQueue.set(key, queue);
    
    // Clean up old transform queues
    if (this.transformQueue.size > 50) {
      const sortedKeys = Array.from(this.transformQueue.keys())
        .sort((a, b) => Number.parseInt(a) - Number.parseInt(b));
      const keysToDelete = sortedKeys.slice(0, sortedKeys.length - 50);
      keysToDelete.forEach(k => this.transformQueue.delete(k));
    }
    
    // Apply operational transform
    this.applyTransform(transform);
  }

  updateTranslation(locale: string, key: string, value: string, oldValue?: string): void {
    const update: TranslationUpdate = {
      id: this.generateUpdateId(),
      locale,
      key,
      value,
      oldValue,
      timestamp: Date.now(),
      userId: this.localUserId,
      userName: this.localUserName,
      version: this.getNextVersion(locale, key),
      checksum: this.calculateChecksum(value)
    };

    if (this.state.connected) {
      this.send('update', update);
      this.versionMap.set(`${locale}:${key}`, update.version);
      
      // Clean up old version map entries
      if (this.versionMap.size > 10000) {
        const entriesToDelete = Array.from(this.versionMap.keys()).slice(0, 1000);
        entriesToDelete.forEach(k => this.versionMap.delete(k));
      }
    } else if (this.config?.enableOfflineQueue) {
      // Limit offline queue size
      if (this.offlineQueue.length >= this.maxQueueSize) {
        this.offlineQueue.shift(); // Remove oldest
      }
      this.offlineQueue.push(update);
      this.state.pendingUpdates = this.offlineQueue.length;
    }

    this.emit('translation:local', update);
  }

  broadcastCursor(key: string, position: number, selection?: { start: number; end: number }): void {
    if (!this.state.connected) return;
    
    const cursor: CursorPosition = {
      key,
      position,
      selection
    };

    this.send('cursor', {
      userId: this.localUserId,
      cursor
    });
  }

  requestSync(keys?: string[], locale?: string, since?: number): void {
    if (!this.state.connected) return;
    
    this.send('sync-request', {
      keys: keys || [],
      locale: locale || '*',
      since: since || 0
    });
  }

  private detectAndResolveConflict(remoteUpdate: TranslationUpdate): void {
    // Get local value (would need to be provided by the i18n system)
    const localValue = this.getLocalTranslation(remoteUpdate.locale, remoteUpdate.key);
    
    if (localValue && localValue !== remoteUpdate.oldValue) {
      const conflict: Conflict = {
        key: remoteUpdate.key,
        locale: remoteUpdate.locale,
        local: {
          ...remoteUpdate,
          value: localValue,
          userId: this.localUserId,
          userName: this.localUserName
        },
        remote: remoteUpdate
      };

      this.handleConflict(conflict);
    } else {
      // No conflict, apply update
      this.applyUpdate(remoteUpdate);
    }
  }

  private autoResolveConflict(conflict: Conflict): void {
    let resolution: 'local' | 'remote' | 'merged' = 'remote';
    let mergedValue: string | undefined;

    switch (this.config?.conflictResolution) {
      case 'latest':
        resolution = conflict.local.timestamp > conflict.remote.timestamp ? 'local' : 'remote';
        break;
      
      case 'merge':
        // Try to merge changes
        mergedValue = this.mergeTranslations(
          conflict.local.value,
          conflict.remote.value,
          conflict.local.oldValue
        );
        if (mergedValue) {
          resolution = 'merged';
        } else {
          // Fallback to latest
          resolution = conflict.local.timestamp > conflict.remote.timestamp ? 'local' : 'remote';
        }
        break;
    }

    conflict.resolution = resolution;
    conflict.mergedValue = mergedValue;

    // Apply resolution
    this.applyConflictResolution(conflict);
    
    // Remove from queue
    this.conflictQueue = this.conflictQueue.filter(c => c !== conflict);
    
    // Limit conflict queue size
    if (this.conflictQueue.length > 100) {
      this.conflictQueue = this.conflictQueue.slice(-100);
    }
    
    this.state.conflicts = this.conflictQueue.length;
    
    this.emit('conflict:resolved', conflict);
  }

  private mergeTranslations(local: string, remote: string, base?: string): string | undefined {
    // Simple merge strategy - could be enhanced with diff algorithms
    if (!base) return undefined;
    
    // If one side didn't change, use the other
    if (local === base) return remote;
    if (remote === base) return local;
    
    // Both changed - try to merge
    // This is a simplified example - real implementation would use
    // proper diff and merge algorithms
    return undefined;
  }

  private applyConflictResolution(conflict: Conflict): void {
    let valueToApply: string;
    
    switch (conflict.resolution) {
      case 'local':
        valueToApply = conflict.local.value;
        break;
      case 'remote':
        valueToApply = conflict.remote.value;
        break;
      case 'merged':
        valueToApply = conflict.mergedValue || conflict.remote.value;
        break;
      default:
        valueToApply = conflict.remote.value;
    }

    // Apply the resolved value
    const update: TranslationUpdate = {
      ...conflict.remote,
      value: valueToApply,
      version: this.getNextVersion(conflict.locale, conflict.key)
    };

    this.applyUpdate(update);
    
    // Broadcast resolution
    if (this.state.connected) {
      this.send('conflict-resolution', {
        conflict,
        resolution: update
      });
    }
  }

  private applyUpdate(update: TranslationUpdate): void {
    // This would need to integrate with the actual i18n system
    // to update the translation in memory/storage
    
    this.emit('apply:update', update);
  }

  private applyTransform(transform: OperationalTransform): void {
    // Apply operational transformation
    // This would integrate with the text editing component
    
    this.emit('apply:transform', transform);
  }

  private gatherLocalTranslations(keys: string[], locale: string, since?: number): any {
    // This would need to integrate with the i18n system
    // to get current translations
    
    return {
      translations: [],
      timestamp: Date.now()
    };
  }

  private getLocalTranslation(locale: string, key: string): string | undefined {
    // This would need to integrate with the i18n system
    // Placeholder implementation
    return undefined;
  }

  private flushOfflineQueue(): void {
    const queue = [...this.offlineQueue];
    this.offlineQueue = [];
    this.state.pendingUpdates = 0;

    for (const update of queue) {
      this.send('update', update);
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = Math.min(
      this.config?.reconnectDelay * 2**(this.reconnectAttempts - 1),
      30000
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(console.error);
    }, delay);

    this.emit('reconnecting', { attempt: this.reconnectAttempts, delay });
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.state.connected) {
        this.send('heartbeat', { timestamp: Date.now() });
      }
    }, this.config?.heartbeatInterval);
  }

  private send(type: string, data: any): void {
    if (!this.ws || !this.state.connected) {
      if (this.config?.enableOfflineQueue && type === 'update') {
        this.offlineQueue.push(data);
        this.state.pendingUpdates = this.offlineQueue.length;
      }
      return;
    }

    try {
      this.ws.send(JSON.stringify({ type, data }));
    } catch (error) {
      console.error('Error sending message:', error);
      this.handleError(error as Event);
    }
  }

  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateUpdateId(): string {
    return `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getNextVersion(locale: string, key: string): number {
    const currentVersion = this.versionMap.get(`${locale}:${key}`) || 0;
    return currentVersion + 1;
  }

  private calculateChecksum(value: string): string {
    // Simple checksum - in production would use proper hash
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = ((hash << 5) - hash) + value.charCodeAt(i);
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  // Public API

  getState(): SyncState {
    return { ...this.state };
  }

  getPeers(): PeerInfo[] {
    return Array.from(this.state.peers.values());
  }

  getConflicts(): Conflict[] {
    return [...this.conflictQueue];
  }

  resolveConflict(conflict: Conflict, resolution: 'local' | 'remote' | 'merged', mergedValue?: string): void {
    conflict.resolution = resolution;
    conflict.mergedValue = mergedValue;
    this.applyConflictResolution(conflict);
  }

  setUserInfo(userId: string, userName: string): void {
    this.localUserId = userId;
    this.localUserName = userName;
    
    if (this.state.connected) {
      this.send('identify', {
        userId,
        userName,
        timestamp: Date.now()
      });
    }
  }

  // Collaboration features

  lockTranslation(locale: string, key: string): void {
    if (!this.state.connected) return;
    
    this.send('lock', {
      locale,
      key,
      userId: this.localUserId,
      timestamp: Date.now()
    });
  }

  unlockTranslation(locale: string, key: string): void {
    if (!this.state.connected) return;
    
    this.send('unlock', {
      locale,
      key,
      userId: this.localUserId,
      timestamp: Date.now()
    });
  }

  sendComment(locale: string, key: string, comment: string): void {
    if (!this.state.connected) return;
    
    this.send('comment', {
      locale,
      key,
      comment,
      userId: this.localUserId,
      userName: this.localUserName,
      timestamp: Date.now()
    });
  }

  // Cleanup
  
  destroy(): void {
    this.disconnect();
    this.removeAllListeners();
    
    // Clear all data structures
    this.offlineQueue.length = 0;
    this.offlineQueue = [];
    this.conflictQueue.length = 0;
    this.conflictQueue = [];
    this.transformQueue.clear();
    this.versionMap.clear();
    this.state.peers.clear();
    
    // Clear any remaining references
    this.ws = null;
  }
}

// Export singleton instance
export const realtimeSync = new RealtimeSync();

// Type exports
export type {
  Conflict,
  CursorPosition,
  OperationalTransform,
  PeerInfo,
  SyncConfig,
  SyncState,
  TranslationUpdate
};