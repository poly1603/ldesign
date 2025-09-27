/**
 * Collaborative Editing Plugin
 * 
 * Enables real-time collaborative editing with operational transformation.
 */

import type { Editor, Command } from '@/types';
import { BasePlugin, BasePluginOptions } from './base-plugin';
import { CollaborativeEngine, ClientState, CollaborativeOperation } from '@/core/collaborative-engine';

/**
 * Collaborative editing options
 */
export interface CollaborativeEditingOptions extends BasePluginOptions {
  clientId?: string;
  clientName?: string;
  clientColor?: string;
  serverUrl?: string;
  reconnectInterval?: number;
  maxRetries?: number;
  enableCursors?: boolean;
  enablePresence?: boolean;
  enableConflictResolution?: boolean;
}

/**
 * Connection state
 */
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * Collaborative editing plugin implementation
 */
export class CollaborativeEditingPlugin extends BasePlugin {
  readonly name = 'collaborative-editing';
  readonly version = '1.0.0';

  protected override options: CollaborativeEditingOptions;
  private engine: CollaborativeEngine;
  private connectionState: ConnectionState = 'disconnected';
  private websocket: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private retryCount = 0;

  constructor(options: CollaborativeEditingOptions = {}) {
    super(options);
    this.options = {
      clientId: this.generateClientId(),
      clientName: 'Anonymous',
      clientColor: this.generateRandomColor(),
      reconnectInterval: 3000,
      maxRetries: 5,
      enableCursors: true,
      enablePresence: true,
      enableConflictResolution: true,
      ...options
    };

    this.engine = new CollaborativeEngine(this.options.clientId!);
    this.setupEngineListeners();
  }

  override readonly commands: Record<string, Command> = {
    connect: {
      name: 'connect',
      canExecute: () => this.connectionState === 'disconnected',
      execute: () => {
        this.connect();
      }
    },

    disconnect: {
      name: 'disconnect',
      canExecute: () => this.connectionState === 'connected',
      execute: () => {
        this.disconnect();
      }
    },

    syncState: {
      name: 'syncState',
      canExecute: () => this.connectionState === 'connected',
      execute: () => {
        this.requestSync();
      }
    }
  };

  override async install(editor: Editor): Promise<void> {
    await super.install(editor);
    
    this.setupEditorListeners(editor);
    
    if (this.options.enableCursors) {
      this.setupCursorTracking(editor);
    }
    
    if (this.options.enablePresence) {
      this.setupPresenceIndicators(editor);
    }
    
    // Auto-connect if server URL is provided
    if (this.options.serverUrl) {
      this.connect();
    }
  }

  protected async onInstall(_editor: Editor): Promise<void> {
    this.logger.info('Installing collaborative editing');
  }

  protected async onUninstall(_editor: Editor): Promise<void> {
    this.logger.info('Uninstalling collaborative editing');
    this.disconnect();
  }

  /**
   * Connect to collaboration server
   */
  connect(): void {
    if (!this.options.serverUrl) {
      this.logger.error('No server URL provided for collaboration');
      return;
    }

    if (this.connectionState === 'connected' || this.connectionState === 'connecting') {
      return;
    }

    this.setConnectionState('connecting');
    
    try {
      this.websocket = new WebSocket(this.options.serverUrl);
      this.setupWebSocketListeners();
    } catch (error) {
      this.logger.error('Failed to create WebSocket connection:', error);
      this.setConnectionState('error');
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from collaboration server
   */
  disconnect(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.setConnectionState('disconnected');
    this.retryCount = 0;
  }

  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Get collaborative engine
   */
  getEngine(): CollaborativeEngine {
    return this.engine;
  }

  /**
   * Get connected clients
   */
  getClients(): ClientState[] {
    return this.engine.getClients();
  }

  /**
   * Setup engine event listeners
   */
  private setupEngineListeners(): void {
    this.engine.on('operation', ({ operation, transformed }) => {
      if (transformed && this.editor) {
        // Apply remote operation to editor
        this.applyOperationToEditor(operation);
      }
    });

    this.engine.on('client-join', ({ client }) => {
      this.logger.info('Client joined:', client.name);
      this.updatePresenceIndicators();
    });

    this.engine.on('client-leave', ({ clientId }) => {
      this.logger.info('Client left:', clientId);
      this.updatePresenceIndicators();
    });

    this.engine.on('client-update', ({ client }) => {
      this.updateClientCursor(client);
    });
  }

  /**
   * Setup editor event listeners
   */
  private setupEditorListeners(editor: Editor): void {
    // Listen for content changes
    editor.on('text-change', ({ delta, source }) => {
      if (source === 'user' && this.connectionState === 'connected') {
        // Convert delta to operations and send to server
        this.sendOperations(delta);
      }
    });

    // Listen for selection changes
    editor.on('selection-change', ({ selection, source }) => {
      if (source === 'user' && this.options.enableCursors && this.connectionState === 'connected') {
        this.sendCursorUpdate(selection);
      }
    });
  }

  /**
   * Setup WebSocket listeners
   */
  private setupWebSocketListeners(): void {
    if (!this.websocket) return;

    this.websocket.onopen = () => {
      this.logger.info('Connected to collaboration server');
      this.setConnectionState('connected');
      this.retryCount = 0;
      
      // Send initial client info
      this.sendMessage({
        type: 'client-join',
        client: {
          id: this.options.clientId!,
          name: this.options.clientName!,
          color: this.options.clientColor!,
          lastSeen: Date.now(),
          isOnline: true
        }
      });
    };

    this.websocket.onclose = () => {
      this.logger.info('Disconnected from collaboration server');
      this.setConnectionState('disconnected');
      this.scheduleReconnect();
    };

    this.websocket.onerror = (error) => {
      this.logger.error('WebSocket error:', error);
      this.setConnectionState('error');
    };

    this.websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleServerMessage(message);
      } catch (error) {
        this.logger.error('Failed to parse server message:', error);
      }
    };
  }

  /**
   * Handle server messages
   */
  private handleServerMessage(message: any): void {
    switch (message.type) {
      case 'operation':
        this.engine.applyRemoteOperation(message.operation);
        break;
      
      case 'client-join':
        this.engine.addClient(message.client);
        break;
      
      case 'client-leave':
        this.engine.removeClient(message.clientId);
        break;
      
      case 'client-update':
        this.engine.updateClient(message.client);
        break;
      
      case 'sync-state':
        this.engine.syncState(message.revision, message.operations);
        break;
      
      case 'operation-ack':
        this.engine.acknowledgeOperation(message.operationId);
        break;
      
      default:
        this.logger.warn('Unknown message type:', message.type);
    }
  }

  /**
   * Send message to server
   */
  private sendMessage(message: any): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    }
  }

  /**
   * Send operations to server
   */
  private sendOperations(delta: any): void {
    const operations = delta.ops || [];
    
    for (const operation of operations) {
      const collaborativeOp = this.engine.applyLocalOperation(operation);
      
      this.sendMessage({
        type: 'operation',
        operation: collaborativeOp
      });
    }
  }

  /**
   * Send cursor update to server
   */
  private sendCursorUpdate(selection: any): void {
    if (selection && selection.range) {
      this.sendMessage({
        type: 'client-update',
        client: {
          id: this.options.clientId!,
          cursor: {
            index: selection.range.index,
            length: selection.range.length
          },
          lastSeen: Date.now()
        }
      });
    }
  }

  /**
   * Apply operation to editor
   */
  private applyOperationToEditor(operation: CollaborativeOperation): void {
    if (!this.editor) return;

    // TODO: Apply delta to editor content
    this.logger.info('Applying operation to editor:', operation);
  }

  /**
   * Setup cursor tracking
   */
  private setupCursorTracking(_editor: Editor): void {
    // TODO: Implement cursor tracking UI
    this.logger.info('Cursor tracking enabled');
  }

  /**
   * Setup presence indicators
   */
  private setupPresenceIndicators(_editor: Editor): void {
    // TODO: Implement presence indicators UI
    this.logger.info('Presence indicators enabled');
  }

  /**
   * Update presence indicators
   */
  private updatePresenceIndicators(): void {
    // TODO: Update presence indicators UI
    this.logger.info('Updating presence indicators');
  }

  /**
   * Update client cursor
   */
  private updateClientCursor(_client: ClientState): void {
    // TODO: Update client cursor UI
    this.logger.info('Updating client cursor');
  }

  /**
   * Set connection state
   */
  private setConnectionState(state: ConnectionState): void {
    this.connectionState = state;
    // TODO: Emit connection state change event
    this.logger.info('Connection state changed:', state);
  }

  /**
   * Schedule reconnection
   */
  private scheduleReconnect(): void {
    if (this.retryCount >= this.options.maxRetries!) {
      this.logger.error('Max reconnection attempts reached');
      return;
    }

    this.retryCount++;
    this.reconnectTimer = window.setTimeout(() => {
      this.logger.info(`Reconnecting... (attempt ${this.retryCount})`);
      this.connect();
    }, this.options.reconnectInterval!);
  }

  /**
   * Request state sync
   */
  private requestSync(): void {
    this.sendMessage({
      type: 'sync-request',
      clientId: this.options.clientId,
      revision: this.engine.getRevision()
    });
  }

  /**
   * Generate random client ID
   */
  private generateClientId(): string {
    return 'client-' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Generate random color
   */
  private generateRandomColor(): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
