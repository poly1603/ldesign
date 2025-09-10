/**
 * Encrypted Storage System
 * 
 * Provides secure encrypted storage for files, databases, and cloud storage
 * with support for multiple encryption algorithms and key management.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { Encryption } from './encryption';
import { KeyManager } from './key-manager';
import { CSPRNG } from './csprng';
import { ChaCha20Poly1305 } from './modern-ciphers';

/**
 * Storage types
 */
export enum StorageType {
  FILE = 'file',
  DATABASE = 'database',
  CLOUD = 'cloud',
  MEMORY = 'memory'
}

/**
 * Encryption modes for storage
 */
export enum EncryptionMode {
  AES_256_GCM = 'aes-256-gcm',
  CHACHA20_POLY1305 = 'chacha20-poly1305',
  AES_256_CBC = 'aes-256-cbc',
  HYBRID = 'hybrid'
}

/**
 * Storage metadata
 */
export interface StorageMetadata {
  id: string;
  name: string;
  type: StorageType;
  encryptionMode: EncryptionMode;
  created: Date;
  modified: Date;
  size: number;
  checksum: string;
  keyId?: string;
  iv?: string;
  salt?: string;
  tags?: Record<string, string>;
}

/**
 * Storage options
 */
export interface StorageOptions {
  type?: StorageType;
  encryptionMode?: EncryptionMode;
  keyDerivation?: boolean;
  compression?: boolean;
  chunkSize?: number;
  metadata?: boolean;
}

/**
 * Abstract storage backend
 */
export abstract class StorageBackend {
  protected keyManager: KeyManager;
  protected csprng: CSPRNG;
  
  constructor(keyManager: KeyManager) {
    this.keyManager = keyManager;
    this.csprng = new CSPRNG();
  }
  
  abstract store(id: string, data: Uint8Array, metadata: StorageMetadata): Promise<void>;
  abstract retrieve(id: string): Promise<{ data: Uint8Array; metadata: StorageMetadata }>;
  abstract delete(id: string): Promise<void>;
  abstract exists(id: string): Promise<boolean>;
  abstract list(): Promise<StorageMetadata[]>;
}

/**
 * File storage backend
 */
export class FileStorageBackend extends StorageBackend {
  private basePath: string;
  
  constructor(keyManager: KeyManager, basePath: string) {
    super(keyManager);
    this.basePath = basePath;
  }
  
  async store(id: string, data: Uint8Array, metadata: StorageMetadata): Promise<void> {
    const filePath = path.join(this.basePath, `${id}.enc`);
    const metaPath = path.join(this.basePath, `${id}.meta`);
    
    // Ensure directory exists
    await fs.mkdir(this.basePath, { recursive: true });
    
    // Write encrypted data
    await fs.writeFile(filePath, data);
    
    // Write metadata
    await fs.writeFile(metaPath, JSON.stringify(metadata, null, 2));
  }
  
  async retrieve(id: string): Promise<{ data: Uint8Array; metadata: StorageMetadata }> {
    const filePath = path.join(this.basePath, `${id}.enc`);
    const metaPath = path.join(this.basePath, `${id}.meta`);
    
    // Read encrypted data
    const data = await fs.readFile(filePath);
    
    // Read metadata
    const metaJson = await fs.readFile(metaPath, 'utf-8');
    const metadata = JSON.parse(metaJson);
    
    return { data: new Uint8Array(data), metadata };
  }
  
  async delete(id: string): Promise<void> {
    const filePath = path.join(this.basePath, `${id}.enc`);
    const metaPath = path.join(this.basePath, `${id}.meta`);
    
    await fs.unlink(filePath);
    await fs.unlink(metaPath);
  }
  
  async exists(id: string): Promise<boolean> {
    const filePath = path.join(this.basePath, `${id}.enc`);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
  
  async list(): Promise<StorageMetadata[]> {
    try {
      const files = await fs.readdir(this.basePath);
      const metaFiles = files.filter(f => f.endsWith('.meta'));
      
      const metadata: StorageMetadata[] = [];
      for (const file of metaFiles) {
        const metaPath = path.join(this.basePath, file);
        const metaJson = await fs.readFile(metaPath, 'utf-8');
        metadata.push(JSON.parse(metaJson));
      }
      
      return metadata;
    } catch {
      return [];
    }
  }
}

/**
 * Memory storage backend
 */
export class MemoryStorageBackend extends StorageBackend {
  private storage: Map<string, { data: Uint8Array; metadata: StorageMetadata }>;
  
  constructor(keyManager: KeyManager) {
    super(keyManager);
    this.storage = new Map();
  }
  
  async store(id: string, data: Uint8Array, metadata: StorageMetadata): Promise<void> {
    this.storage.set(id, { data, metadata });
  }
  
  async retrieve(id: string): Promise<{ data: Uint8Array; metadata: StorageMetadata }> {
    const item = this.storage.get(id);
    if (!item) {
      throw new Error(`Item ${id} not found`);
    }
    return item;
  }
  
  async delete(id: string): Promise<void> {
    this.storage.delete(id);
  }
  
  async exists(id: string): Promise<boolean> {
    return this.storage.has(id);
  }
  
  async list(): Promise<StorageMetadata[]> {
    return Array.from(this.storage.values()).map(item => item.metadata);
  }
}

/**
 * Encrypted storage system
 */
export class EncryptedStorage {
  private backend: StorageBackend;
  private keyManager: KeyManager;
  private encryption: Encryption;
  private csprng: CSPRNG;
  private options: StorageOptions;
  
  constructor(
    backend: StorageBackend,
    keyManager: KeyManager,
    options: StorageOptions = {}
  ) {
    this.backend = backend;
    this.keyManager = keyManager;
    this.encryption = new Encryption();
    this.csprng = new CSPRNG();
    this.options = {
      type: StorageType.FILE,
      encryptionMode: EncryptionMode.AES_256_GCM,
      keyDerivation: true,
      compression: false,
      chunkSize: 1024 * 1024, // 1MB chunks
      metadata: true,
      ...options
    };
  }
  
  /**
   * Store encrypted data
   */
  async store(
    name: string,
    data: Uint8Array | string,
    tags?: Record<string, string>
  ): Promise<string> {
    // Convert string to Uint8Array if needed
    const dataBytes = typeof data === 'string' 
      ? new TextEncoder().encode(data)
      : data;
    
    // Generate unique ID
    const id = this.csprng.generateUUID();
    
    // Compress if enabled
    const processedData = this.options.compression
      ? await this.compress(dataBytes)
      : dataBytes;
    
    // Encrypt data
    const { encrypted, keyId, iv, salt } = await this.encryptData(processedData);
    
    // Calculate checksum
    const checksum = this.calculateChecksum(encrypted);
    
    // Create metadata
    const metadata: StorageMetadata = {
      id,
      name,
      type: this.options.type!,
      encryptionMode: this.options.encryptionMode!,
      created: new Date(),
      modified: new Date(),
      size: dataBytes.length,
      checksum,
      keyId,
      iv: iv ? Buffer.from(iv).toString('base64') : undefined,
      salt: salt ? Buffer.from(salt).toString('base64') : undefined,
      tags
    };
    
    // Store encrypted data and metadata
    await this.backend.store(id, encrypted, metadata);
    
    return id;
  }
  
  /**
   * Retrieve and decrypt data
   */
  async retrieve(id: string): Promise<{ data: Uint8Array; metadata: StorageMetadata }> {
    // Retrieve encrypted data and metadata
    const { data: encrypted, metadata } = await this.backend.retrieve(id);
    
    // Verify checksum
    const checksum = this.calculateChecksum(encrypted);
    if (checksum !== metadata.checksum) {
      throw new Error('Data integrity check failed');
    }
    
    // Decrypt data
    const decrypted = await this.decryptData(encrypted, metadata);
    
    // Decompress if needed
    const data = this.options.compression
      ? await this.decompress(decrypted)
      : decrypted;
    
    return { data, metadata };
  }
  
  /**
   * Update encrypted data
   */
  async update(
    id: string,
    data: Uint8Array | string,
    tags?: Record<string, string>
  ): Promise<void> {
    // Retrieve existing metadata
    const { metadata: oldMetadata } = await this.backend.retrieve(id);
    
    // Convert string to Uint8Array if needed
    const dataBytes = typeof data === 'string'
      ? new TextEncoder().encode(data)
      : data;
    
    // Compress if enabled
    const processedData = this.options.compression
      ? await this.compress(dataBytes)
      : dataBytes;
    
    // Encrypt data with same key
    const { encrypted, iv, salt } = await this.encryptData(
      processedData,
      oldMetadata.keyId
    );
    
    // Calculate new checksum
    const checksum = this.calculateChecksum(encrypted);
    
    // Update metadata
    const metadata: StorageMetadata = {
      ...oldMetadata,
      modified: new Date(),
      size: dataBytes.length,
      checksum,
      iv: iv ? Buffer.from(iv).toString('base64') : undefined,
      salt: salt ? Buffer.from(salt).toString('base64') : undefined,
      tags: tags || oldMetadata.tags
    };
    
    // Store updated data
    await this.backend.store(id, encrypted, metadata);
  }
  
  /**
   * Delete encrypted data
   */
  async delete(id: string): Promise<void> {
    await this.backend.delete(id);
  }
  
  /**
   * Check if data exists
   */
  async exists(id: string): Promise<boolean> {
    return await this.backend.exists(id);
  }
  
  /**
   * List all stored items
   */
  async list(filter?: (metadata: StorageMetadata) => boolean): Promise<StorageMetadata[]> {
    const allItems = await this.backend.list();
    return filter ? allItems.filter(filter) : allItems;
  }
  
  /**
   * Search by tags
   */
  async searchByTags(tags: Record<string, string>): Promise<StorageMetadata[]> {
    const allItems = await this.backend.list();
    return allItems.filter(item => {
      if (!item.tags) return false;
      return Object.entries(tags).every(([key, value]) => item.tags![key] === value);
    });
  }
  
  /**
   * Encrypt data
   */
  private async encryptData(
    data: Uint8Array,
    keyId?: string
  ): Promise<{
    encrypted: Uint8Array;
    keyId: string;
    iv?: Uint8Array;
    salt?: Uint8Array;
  }> {
    // Get or generate encryption key
    const key = keyId
      ? await this.keyManager.getKey(keyId)
      : await this.keyManager.generateKey('aes', 256);
    
    const actualKeyId = keyId || key.id;
    
    switch (this.options.encryptionMode) {
      case EncryptionMode.AES_256_GCM: {
        const iv = this.csprng.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', key.material, iv);
        
        const encrypted = Buffer.concat([
          cipher.update(data),
          cipher.final(),
          cipher.getAuthTag()
        ]);
        
        return {
          encrypted: new Uint8Array(encrypted),
          keyId: actualKeyId,
          iv
        };
      }
      
      case EncryptionMode.CHACHA20_POLY1305: {
        const chacha = new ChaCha20Poly1305();
        const keyBytes = new Uint8Array(32);
        keyBytes.set(key.material.slice(0, 32));
        const nonce = this.csprng.randomBytes(12);
        
        const encrypted = chacha.encrypt(data, keyBytes, nonce);
        
        return {
          encrypted,
          keyId: actualKeyId,
          iv: nonce
        };
      }
      
      case EncryptionMode.AES_256_CBC: {
        const iv = this.csprng.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', key.material, iv);
        
        const encrypted = Buffer.concat([
          cipher.update(data),
          cipher.final()
        ]);
        
        return {
          encrypted: new Uint8Array(encrypted),
          keyId: actualKeyId,
          iv
        };
      }
      
      default:
        throw new Error(`Unsupported encryption mode: ${this.options.encryptionMode}`);
    }
  }
  
  /**
   * Decrypt data
   */
  private async decryptData(
    encrypted: Uint8Array,
    metadata: StorageMetadata
  ): Promise<Uint8Array> {
    // Get decryption key
    const key = await this.keyManager.getKey(metadata.keyId!);
    
    // Decode IV and salt if present
    const iv = metadata.iv
      ? new Uint8Array(Buffer.from(metadata.iv, 'base64'))
      : undefined;
    
    switch (metadata.encryptionMode) {
      case EncryptionMode.AES_256_GCM: {
        if (!iv) throw new Error('IV required for AES-GCM decryption');
        
        const authTag = encrypted.slice(-16);
        const ciphertext = encrypted.slice(0, -16);
        
        const decipher = crypto.createDecipheriv('aes-256-gcm', key.material, iv);
        decipher.setAuthTag(authTag);
        
        const decrypted = Buffer.concat([
          decipher.update(ciphertext),
          decipher.final()
        ]);
        
        return new Uint8Array(decrypted);
      }
      
      case EncryptionMode.CHACHA20_POLY1305: {
        if (!iv) throw new Error('Nonce required for ChaCha20-Poly1305 decryption');
        
        const chacha = new ChaCha20Poly1305();
        const keyBytes = new Uint8Array(32);
        keyBytes.set(key.material.slice(0, 32));
        
        return chacha.decrypt(encrypted, keyBytes, iv);
      }
      
      case EncryptionMode.AES_256_CBC: {
        if (!iv) throw new Error('IV required for AES-CBC decryption');
        
        const decipher = crypto.createDecipheriv('aes-256-cbc', key.material, iv);
        
        const decrypted = Buffer.concat([
          decipher.update(encrypted),
          decipher.final()
        ]);
        
        return new Uint8Array(decrypted);
      }
      
      default:
        throw new Error(`Unsupported encryption mode: ${metadata.encryptionMode}`);
    }
  }
  
  /**
   * Calculate checksum
   */
  private calculateChecksum(data: Uint8Array): string {
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
  }
  
  /**
   * Compress data
   */
  private async compress(data: Uint8Array): Promise<Uint8Array> {
    // Simple RLE compression for demonstration
    // In production, use zlib or similar
    const compressed: number[] = [];
    let i = 0;
    
    while (i < data.length) {
      let count = 1;
      const byte = data[i];
      
      while (i + count < data.length && data[i + count] === byte && count < 255) {
        count++;
      }
      
      if (count > 3) {
        compressed.push(0xFF, count, byte);
        i += count;
      } else {
        compressed.push(byte);
        i++;
      }
    }
    
    return new Uint8Array(compressed);
  }
  
  /**
   * Decompress data
   */
  private async decompress(data: Uint8Array): Promise<Uint8Array> {
    // Simple RLE decompression
    const decompressed: number[] = [];
    let i = 0;
    
    while (i < data.length) {
      if (data[i] === 0xFF && i + 2 < data.length) {
        const count = data[i + 1];
        const byte = data[i + 2];
        for (let j = 0; j < count; j++) {
          decompressed.push(byte);
        }
        i += 3;
      } else {
        decompressed.push(data[i]);
        i++;
      }
    }
    
    return new Uint8Array(decompressed);
  }
}

/**
 * Secure file vault
 */
export class SecureFileVault {
  private storage: EncryptedStorage;
  private keyManager: KeyManager;
  
  constructor(basePath: string, password?: string) {
    this.keyManager = new KeyManager();
    
    // Initialize with password if provided
    if (password) {
      this.keyManager.deriveKeyFromPassword(password, 'vault-master');
    }
    
    const backend = new FileStorageBackend(this.keyManager, basePath);
    this.storage = new EncryptedStorage(backend, this.keyManager);
  }
  
  /**
   * Add file to vault
   */
  async addFile(filePath: string, tags?: Record<string, string>): Promise<string> {
    const data = await fs.readFile(filePath);
    const name = path.basename(filePath);
    return await this.storage.store(name, new Uint8Array(data), tags);
  }
  
  /**
   * Extract file from vault
   */
  async extractFile(id: string, outputPath: string): Promise<void> {
    const { data, metadata } = await this.storage.retrieve(id);
    const filePath = path.join(outputPath, metadata.name);
    await fs.writeFile(filePath, data);
  }
  
  /**
   * List files in vault
   */
  async listFiles(): Promise<StorageMetadata[]> {
    return await this.storage.list();
  }
  
  /**
   * Search files by tags
   */
  async searchFiles(tags: Record<string, string>): Promise<StorageMetadata[]> {
    return await this.storage.searchByTags(tags);
  }
  
  /**
   * Delete file from vault
   */
  async deleteFile(id: string): Promise<void> {
    await this.storage.delete(id);
  }
}

/**
 * Encrypted database storage
 */
export class EncryptedDatabase {
  private storage: EncryptedStorage;
  private collections: Map<string, Set<string>>;
  
  constructor(keyManager: KeyManager) {
    const backend = new MemoryStorageBackend(keyManager);
    this.storage = new EncryptedStorage(backend, keyManager, {
      type: StorageType.DATABASE,
      encryptionMode: EncryptionMode.AES_256_GCM
    });
    this.collections = new Map();
  }
  
  /**
   * Insert document
   */
  async insert(collection: string, document: any): Promise<string> {
    const data = JSON.stringify(document);
    const id = await this.storage.store(
      `${collection}/${Date.now()}`,
      data,
      { collection }
    );
    
    // Track in collection
    if (!this.collections.has(collection)) {
      this.collections.set(collection, new Set());
    }
    this.collections.get(collection)!.add(id);
    
    return id;
  }
  
  /**
   * Find document by ID
   */
  async findById(id: string): Promise<any> {
    const { data } = await this.storage.retrieve(id);
    const json = new TextDecoder().decode(data);
    return JSON.parse(json);
  }
  
  /**
   * Find documents in collection
   */
  async find(collection: string, predicate?: (doc: any) => boolean): Promise<any[]> {
    const ids = this.collections.get(collection);
    if (!ids) return [];
    
    const documents: any[] = [];
    for (const id of ids) {
      try {
        const doc = await this.findById(id);
        if (!predicate || predicate(doc)) {
          documents.push(doc);
        }
      } catch {
        // Document might be deleted
      }
    }
    
    return documents;
  }
  
  /**
   * Update document
   */
  async update(id: string, document: any): Promise<void> {
    const data = JSON.stringify(document);
    await this.storage.update(id, data);
  }
  
  /**
   * Delete document
   */
  async delete(id: string): Promise<void> {
    await this.storage.delete(id);
    
    // Remove from collections
    for (const [, ids] of this.collections) {
      ids.delete(id);
    }
  }
  
  /**
   * List collections
   */
  listCollections(): string[] {
    return Array.from(this.collections.keys());
  }
  
  /**
   * Drop collection
   */
  async dropCollection(collection: string): Promise<void> {
    const ids = this.collections.get(collection);
    if (!ids) return;
    
    for (const id of ids) {
      await this.storage.delete(id);
    }
    
    this.collections.delete(collection);
  }
}

// Export all classes and types
export {
  StorageBackend,
  FileStorageBackend,
  MemoryStorageBackend
};
