/**
 * Collaborative Editing Engine
 * 
 * Implements operational transformation (OT) for real-time collaborative editing.
 */

import type { Delta as IDelta, DeltaOperation } from '@/types';
import { Delta } from './delta';
import { EventEmitter } from '@/utils/event-emitter';
import { logger } from '@/utils/logger';

/**
 * Client state for collaborative editing
 */
export interface ClientState {
  id: string;
  name: string;
  color: string;
  cursor?: {
    index: number;
    length: number;
  };
  lastSeen: number;
  isOnline: boolean;
}

/**
 * Collaborative operation with metadata
 */
export interface CollaborativeOperation {
  id: string;
  clientId: string;
  operation: DeltaOperation;
  timestamp: number;
  revision: number;
  dependencies?: string[];
}

/**
 * Collaborative events
 */
interface CollaborativeEvents {
  'operation': {
    operation: CollaborativeOperation;
    transformed: boolean;
  };
  'client-join': {
    client: ClientState;
  };
  'client-leave': {
    clientId: string;
  };
  'client-update': {
    client: ClientState;
  };
  'sync-state': {
    revision: number;
    operations: CollaborativeOperation[];
  };
  'conflict': {
    operation: CollaborativeOperation;
    conflictingOperations: CollaborativeOperation[];
  };
}

/**
 * Operational Transformation utilities
 */
export class OperationalTransform {
  /**
   * Transform operation against another operation
   */
  static transform(op1: DeltaOperation, op2: DeltaOperation, priority: 'left' | 'right' = 'left'): [DeltaOperation, DeltaOperation] {
    // This is a simplified OT implementation
    // In a production system, you would need a more sophisticated algorithm
    
    if (op1.retain && op2.retain) {
      // Both operations are retains
      const minRetain = Math.min(op1.retain, op2.retain);
      return [
        { ...op1, retain: minRetain },
        { ...op2, retain: minRetain }
      ];
    }
    
    if (op1.insert && op2.insert) {
      // Both operations are inserts at the same position
      if (priority === 'left') {
        return [op1, { ...op2, retain: (op2.retain || 0) + (op1.insert as string).length }];
      } else {
        return [{ ...op1, retain: (op1.retain || 0) + (op2.insert as string).length }, op2];
      }
    }
    
    if (op1.delete && op2.delete) {
      // Both operations are deletes
      const minDelete = Math.min(op1.delete, op2.delete);
      return [
        { ...op1, delete: minDelete },
        { ...op2, delete: minDelete }
      ];
    }
    
    if (op1.insert && op2.delete) {
      // Insert vs delete
      return [op1, { ...op2, retain: (op2.retain || 0) + (op1.insert as string).length }];
    }
    
    if (op1.delete && op2.insert) {
      // Delete vs insert
      return [{ ...op1, retain: (op1.retain || 0) + (op2.insert as string).length }, op2];
    }
    
    // Default case - return operations as-is
    return [op1, op2];
  }
  
  /**
   * Transform a delta against another delta
   */
  static transformDelta(delta1: IDelta, delta2: IDelta, priority: 'left' | 'right' = 'left'): [IDelta, IDelta] {
    const ops1 = delta1.ops || [];
    const ops2 = delta2.ops || [];
    
    const result1: DeltaOperation[] = [];
    const result2: DeltaOperation[] = [];
    
    let i = 0, j = 0;
    
    while (i < ops1.length && j < ops2.length) {
      const [transformedOp1, transformedOp2] = this.transform(ops1[i], ops2[j], priority);
      result1.push(transformedOp1);
      result2.push(transformedOp2);
      i++;
      j++;
    }
    
    // Add remaining operations
    while (i < ops1.length) {
      result1.push(ops1[i]);
      i++;
    }
    
    while (j < ops2.length) {
      result2.push(ops2[j]);
      j++;
    }
    
    return [new Delta(result1), new Delta(result2)];
  }
}

/**
 * Collaborative editing engine
 */
export class CollaborativeEngine extends EventEmitter<CollaborativeEvents> {
  private clientId: string;
  private revision: number = 0;
  private pendingOperations: CollaborativeOperation[] = [];
  private acknowledgedOperations: CollaborativeOperation[] = [];
  private clients: Map<string, ClientState> = new Map();
  private operationHistory: CollaborativeOperation[] = [];
  
  constructor(clientId: string) {
    super();
    this.clientId = clientId;
  }
  
  /**
   * Get current client ID
   */
  getClientId(): string {
    return this.clientId;
  }
  
  /**
   * Get current revision
   */
  getRevision(): number {
    return this.revision;
  }
  
  /**
   * Get all connected clients
   */
  getClients(): ClientState[] {
    return Array.from(this.clients.values());
  }
  
  /**
   * Get client by ID
   */
  getClient(clientId: string): ClientState | undefined {
    return this.clients.get(clientId);
  }
  
  /**
   * Add a new client
   */
  addClient(client: ClientState): void {
    this.clients.set(client.id, client);
    this.emit('client-join', { client });
    logger.info('Client joined:', client.id);
  }
  
  /**
   * Remove a client
   */
  removeClient(clientId: string): void {
    if (this.clients.delete(clientId)) {
      this.emit('client-leave', { clientId });
      logger.info('Client left:', clientId);
    }
  }
  
  /**
   * Update client state
   */
  updateClient(client: Partial<ClientState> & { id: string }): void {
    const existingClient = this.clients.get(client.id);
    if (existingClient) {
      const updatedClient = { ...existingClient, ...client };
      this.clients.set(client.id, updatedClient);
      this.emit('client-update', { client: updatedClient });
    }
  }
  
  /**
   * Apply local operation
   */
  applyLocalOperation(operation: DeltaOperation): CollaborativeOperation {
    const collaborativeOp: CollaborativeOperation = {
      id: this.generateOperationId(),
      clientId: this.clientId,
      operation,
      timestamp: Date.now(),
      revision: this.revision,
      dependencies: this.getLastOperationIds()
    };
    
    this.pendingOperations.push(collaborativeOp);
    this.operationHistory.push(collaborativeOp);
    this.revision++;
    
    this.emit('operation', {
      operation: collaborativeOp,
      transformed: false
    });
    
    return collaborativeOp;
  }
  
  /**
   * Apply remote operation
   */
  applyRemoteOperation(collaborativeOp: CollaborativeOperation): CollaborativeOperation {
    // Transform against pending operations
    let transformedOp = collaborativeOp;
    
    for (const pendingOp of this.pendingOperations) {
      const [, transformed] = OperationalTransform.transform(
        pendingOp.operation,
        transformedOp.operation,
        pendingOp.clientId < transformedOp.clientId ? 'left' : 'right'
      );
      
      transformedOp = {
        ...transformedOp,
        operation: transformed
      };
    }
    
    this.operationHistory.push(transformedOp);
    this.revision = Math.max(this.revision, collaborativeOp.revision + 1);
    
    this.emit('operation', {
      operation: transformedOp,
      transformed: true
    });
    
    return transformedOp;
  }
  
  /**
   * Acknowledge operation
   */
  acknowledgeOperation(operationId: string): void {
    const index = this.pendingOperations.findIndex(op => op.id === operationId);
    if (index !== -1) {
      const acknowledgedOp = this.pendingOperations.splice(index, 1)[0];
      this.acknowledgedOperations.push(acknowledgedOp);
      logger.info('Operation acknowledged:', operationId);
    }
  }
  
  /**
   * Get pending operations
   */
  getPendingOperations(): CollaborativeOperation[] {
    return [...this.pendingOperations];
  }
  
  /**
   * Get operation history
   */
  getOperationHistory(): CollaborativeOperation[] {
    return [...this.operationHistory];
  }
  
  /**
   * Sync state with server
   */
  syncState(revision: number, operations: CollaborativeOperation[]): void {
    this.revision = revision;
    this.operationHistory = [...operations];
    this.emit('sync-state', { revision, operations });
    logger.info('State synced to revision:', revision);
  }
  
  /**
   * Generate unique operation ID
   */
  private generateOperationId(): string {
    return `${this.clientId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Get last operation IDs for dependencies
   */
  private getLastOperationIds(): string[] {
    const lastOps = this.operationHistory.slice(-3); // Last 3 operations
    return lastOps.map(op => op.id);
  }
  
  /**
   * Cleanup old operations
   */
  cleanup(maxHistorySize = 1000): void {
    if (this.operationHistory.length > maxHistorySize) {
      this.operationHistory = this.operationHistory.slice(-maxHistorySize);
    }
    
    if (this.acknowledgedOperations.length > maxHistorySize) {
      this.acknowledgedOperations = this.acknowledgedOperations.slice(-maxHistorySize);
    }
  }
}
