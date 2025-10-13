/**
 * @ldesign/i18n - Blockchain Translation Validator
 * 基于区块链的翻译验证系统，确保翻译内容的完整性和可追溯性
 */

import type { I18nPlugin, I18nInstance, Locale, Messages } from '../types';
import { createHash } from 'crypto';

/**
 * 翻译区块
 */
export interface TranslationBlock {
  index: number;
  timestamp: number;
  translations: TranslationData[];
  previousHash: string;
  hash: string;
  nonce: number;
  validator?: string;
  signature?: string;
}

/**
 * 翻译数据
 */
export interface TranslationData {
  key: string;
  locale: Locale;
  value: string;
  author: string;
  timestamp: number;
  version: number;
  metadata?: {
    context?: string;
    approved?: boolean;
    approvedBy?: string;
    approvalDate?: number;
    quality?: number;
  };
}

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
  suggestions?: string[];
  trustScore: number;
}

/**
 * 共识机制
 */
export interface ConsensusProtocol {
  type: 'proof-of-work' | 'proof-of-stake' | 'proof-of-authority';
  difficulty?: number;
  validators?: string[];
  minApprovals?: number;
}

/**
 * 智能合约接口
 */
export interface TranslationContract {
  id: string;
  rules: ContractRule[];
  execute(translation: TranslationData): boolean;
}

/**
 * 合约规则
 */
export interface ContractRule {
  type: 'length' | 'format' | 'content' | 'quality' | 'custom';
  condition: (translation: TranslationData) => boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

/**
 * 区块链翻译验证器
 */
export class BlockchainTranslationValidator {
  private chain: TranslationBlock[] = [];
  private pendingTranslations: TranslationData[] = [];
  private contracts: Map<string, TranslationContract> = new Map();
  private consensus: ConsensusProtocol;
  private difficulty = 2;
  private miningReward = 10;
  private validators: Set<string> = new Set();
  
  constructor(consensus?: ConsensusProtocol) {
    this.consensus = consensus || {
      type: 'proof-of-work',
      difficulty: 2
    };
    
    // 创建创世区块
    this.createGenesisBlock();
    
    // 初始化默认合约
    this.initializeDefaultContracts();
  }
  
  /**
   * 创建创世区块
   */
  private createGenesisBlock(): void {
    const genesisBlock: TranslationBlock = {
      index: 0,
      timestamp: Date.now(),
      translations: [],
      previousHash: '0',
      hash: '',
      nonce: 0
    };
    
    genesisBlock.hash = this.calculateHash(genesisBlock);
    this.chain.push(genesisBlock);
  }
  
  /**
   * 初始化默认合约
   */
  private initializeDefaultContracts(): void {
    // 长度验证合约
    this.addContract({
      id: 'length-validator',
      rules: [
        {
          type: 'length',
          condition: (t) => t.value.length > 0 && t.value.length < 1000,
          message: '翻译长度必须在1-1000字符之间',
          severity: 'error'
        }
      ],
      execute: function(translation) {
        return this.rules.every(rule => rule.condition(translation));
      }
    });
    
    // 格式验证合约
    this.addContract({
      id: 'format-validator',
      rules: [
        {
          type: 'format',
          condition: (t) => !t.value.includes('<script>'),
          message: '翻译不能包含脚本标签',
          severity: 'error'
        },
        {
          type: 'format',
          condition: (t) => {
            // 检查插值占位符是否匹配
            const placeholders = t.value.match(/\{[^}]+\}/g) || [];
            return placeholders.every(p => p.match(/\{[\w]+\}/));
          },
          message: '插值占位符格式不正确',
          severity: 'warning'
        }
      ],
      execute: function(translation) {
        return this.rules.every(rule => rule.condition(translation));
      }
    });
    
    // 质量验证合约
    this.addContract({
      id: 'quality-validator',
      rules: [
        {
          type: 'quality',
          condition: (t) => {
            // 检查是否有未翻译的内容
            const hasUntranslated = /^[a-zA-Z0-9\s]+$/.test(t.value) && t.locale !== 'en';
            return !hasUntranslated;
          },
          message: '检测到可能未翻译的内容',
          severity: 'warning'
        },
        {
          type: 'quality',
          condition: (t) => {
            // 检查是否有重复的词
            const words = t.value.split(/\s+/);
            const duplicates = words.filter((word, index) => 
              words.indexOf(word) !== index && word.length > 2
            );
            return duplicates.length === 0;
          },
          message: '检测到重复的词汇',
          severity: 'info'
        }
      ],
      execute: function(translation) {
        return this.rules.filter(rule => rule.severity === 'error')
          .every(rule => rule.condition(translation));
      }
    });
  }
  
  /**
   * 计算区块哈希
   */
  private calculateHash(block: TranslationBlock): string {
    const data = block.index + block.timestamp + JSON.stringify(block.translations) + 
                 block.previousHash + block.nonce;
    
    // 简化的哈希计算（实际应使用 crypto 库）
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
  
  /**
   * 挖矿（工作量证明）
   */
  private mineBlock(block: TranslationBlock): void {
    const target = Array(this.difficulty + 1).join('0');
    
    while (block.hash.substring(0, this.difficulty) !== target) {
      block.nonce++;
      block.hash = this.calculateHash(block);
    }
    
    console.log(`Block mined: ${block.hash}`);
  }
  
  /**
   * 添加翻译到区块链
   */
  addTranslation(translation: TranslationData): ValidationResult {
    // 验证翻译
    const validation = this.validateTranslation(translation);
    if (!validation.valid) {
      return validation;
    }
    
    // 添加到待处理列表
    this.pendingTranslations.push(translation);
    
    // 如果待处理翻译达到阈值，创建新区块
    if (this.pendingTranslations.length >= 10) {
      this.createNewBlock();
    }
    
    return validation;
  }
  
  /**
   * 创建新区块
   */
  private createNewBlock(): void {
    const previousBlock = this.getLatestBlock();
    const newBlock: TranslationBlock = {
      index: previousBlock.index + 1,
      timestamp: Date.now(),
      translations: [...this.pendingTranslations],
      previousHash: previousBlock.hash,
      hash: '',
      nonce: 0
    };
    
    // 根据共识机制处理区块
    switch (this.consensus.type) {
      case 'proof-of-work':
        this.mineBlock(newBlock);
        break;
      case 'proof-of-stake':
        // 简化的权益证明
        newBlock.validator = this.selectValidator();
        newBlock.hash = this.calculateHash(newBlock);
        break;
      case 'proof-of-authority':
        // 权威证明
        if (this.validators.size > 0) {
          newBlock.validator = Array.from(this.validators)[0];
          newBlock.hash = this.calculateHash(newBlock);
        }
        break;
    }
    
    this.chain.push(newBlock);
    this.pendingTranslations = [];
    
    // 触发区块创建事件
    this.onBlockCreated(newBlock);
  }
  
  /**
   * 获取最新区块
   */
  private getLatestBlock(): TranslationBlock {
    return this.chain[this.chain.length - 1];
  }
  
  /**
   * 验证翻译
   */
  validateTranslation(translation: TranslationData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let trustScore = 100;
    
    // 执行所有合约验证
    for (const contract of this.contracts.values()) {
      for (const rule of contract.rules) {
        if (!rule.condition(translation)) {
          switch (rule.severity) {
            case 'error':
              errors.push(rule.message);
              trustScore -= 30;
              break;
            case 'warning':
              warnings.push(rule.message);
              trustScore -= 10;
              break;
            case 'info':
              suggestions.push(rule.message);
              trustScore -= 5;
              break;
          }
        }
      }
    }
    
    // 检查翻译历史
    const history = this.getTranslationHistory(translation.key, translation.locale);
    if (history.length > 0) {
      const lastVersion = history[history.length - 1];
      if (lastVersion.value === translation.value) {
        warnings.push('翻译内容与上一版本相同');
        trustScore -= 5;
      }
      
      // 计算相似度
      const similarity = this.calculateSimilarity(lastVersion.value, translation.value);
      if (similarity > 0.9 && similarity < 1) {
        suggestions.push('翻译内容与上一版本非常相似，请确认是否有意为之');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      trustScore: Math.max(0, trustScore)
    };
  }
  
  /**
   * 获取翻译历史
   */
  getTranslationHistory(key: string, locale: Locale): TranslationData[] {
    const history: TranslationData[] = [];
    
    for (const block of this.chain) {
      for (const translation of block.translations) {
        if (translation.key === key && translation.locale === locale) {
          history.push(translation);
        }
      }
    }
    
    return history.sort((a, b) => a.version - b.version);
  }
  
  /**
   * 计算文本相似度
   */
  private calculateSimilarity(text1: string, text2: string): number {
    if (text1 === text2) return 1;
    if (text1.length === 0 || text2.length === 0) return 0;
    
    // 简单的 Levenshtein 距离计算
    const matrix: number[][] = [];
    
    for (let i = 0; i <= text2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= text1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= text2.length; i++) {
      for (let j = 1; j <= text1.length; j++) {
        if (text2.charAt(i - 1) === text1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    const distance = matrix[text2.length][text1.length];
    const maxLength = Math.max(text1.length, text2.length);
    return 1 - (distance / maxLength);
  }
  
  /**
   * 验证区块链完整性
   */
  validateChain(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      
      // 验证哈希
      if (currentBlock.hash !== this.calculateHash(currentBlock)) {
        return false;
      }
      
      // 验证链接
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
      
      // 验证工作量证明
      if (this.consensus.type === 'proof-of-work') {
        const target = Array(this.difficulty + 1).join('0');
        if (currentBlock.hash.substring(0, this.difficulty) !== target) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  /**
   * 添加合约
   */
  addContract(contract: TranslationContract): void {
    this.contracts.set(contract.id, contract);
  }
  
  /**
   * 选择验证者（权益证明）
   */
  private selectValidator(): string {
    // 简化的验证者选择逻辑
    const validators = Array.from(this.validators);
    return validators[Math.floor(Math.random() * validators.length)] || 'system';
  }
  
  /**
   * 注册验证者
   */
  registerValidator(validator: string): void {
    this.validators.add(validator);
  }
  
  /**
   * 区块创建事件
   */
  private onBlockCreated(block: TranslationBlock): void {
    console.log(`New block created: #${block.index}`, block);
    
    // 可以在这里添加通知、同步等逻辑
  }
  
  /**
   * 获取链信息
   */
  getChainInfo(): {
    length: number;
    lastBlock: TranslationBlock;
    totalTranslations: number;
    isValid: boolean;
  } {
    const totalTranslations = this.chain.reduce(
      (sum, block) => sum + block.translations.length,
      0
    );
    
    return {
      length: this.chain.length,
      lastBlock: this.getLatestBlock(),
      totalTranslations,
      isValid: this.validateChain()
    };
  }
  
  /**
   * 导出区块链数据
   */
  exportChain(): string {
    return JSON.stringify(this.chain, null, 2);
  }
  
  /**
   * 导入区块链数据
   */
  importChain(data: string): boolean {
    try {
      const importedChain = JSON.parse(data);
      
      // 验证导入的链
      const tempValidator = new BlockchainTranslationValidator(this.consensus);
      tempValidator.chain = importedChain;
      
      if (tempValidator.validateChain()) {
        this.chain = importedChain;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to import chain:', error);
      return false;
    }
  }
}

/**
 * 区块链验证插件
 */
export class BlockchainValidatorPlugin implements I18nPlugin {
  name = 'blockchain-validator';
  version = '1.0.0';
  
  private validator: BlockchainTranslationValidator;
  
  constructor(consensus?: ConsensusProtocol) {
    this.validator = new BlockchainTranslationValidator(consensus);
  }
  
  async install(i18n: I18nInstance): Promise<void> {
    console.log('[BlockchainValidator] Installing blockchain validator...');
    
    // 添加验证方法
    (i18n as any).validateTranslation = (key: string, value: string, locale: Locale) => {
      const translation: TranslationData = {
        key,
        locale,
        value,
        author: 'system',
        timestamp: Date.now(),
        version: 1
      };
      
      return this.validator.addTranslation(translation);
    };
    
    // 添加获取历史方法
    (i18n as any).getTranslationHistory = (key: string, locale: Locale) => {
      return this.validator.getTranslationHistory(key, locale);
    };
    
    // 添加链信息方法
    (i18n as any).getBlockchainInfo = () => {
      return this.validator.getChainInfo();
    };
    
    // 拦截翻译添加操作
    const originalAddMessages = i18n.addMessages;
    if (originalAddMessages) {
      i18n.addMessages = (locale: Locale, messages: Messages) => {
        // 验证所有翻译
        for (const [key, value] of Object.entries(messages)) {
          if (typeof value === 'string') {
            const result = this.validator.addTranslation({
              key,
              locale,
              value,
              author: 'system',
              timestamp: Date.now(),
              version: 1
            });
            
            if (!result.valid) {
              console.warn(`[BlockchainValidator] Invalid translation: ${key}`, result);
            }
          }
        }
        
        // 调用原始方法
        return originalAddMessages.call(i18n, locale, messages);
      };
    }
    
    console.log('[BlockchainValidator] Blockchain validator installed');
  }
  
  async uninstall(i18n: I18nInstance): Promise<void> {
    delete (i18n as any).validateTranslation;
    delete (i18n as any).getTranslationHistory;
    delete (i18n as any).getBlockchainInfo;
    
    console.log('[BlockchainValidator] Blockchain validator uninstalled');
  }
}

export default BlockchainValidatorPlugin;