/**
 * AI 配置管理
 * 使用 localStorage 存储配置信息（包括 API 密钥）
 */

import type { AIConfig } from './types'

const STORAGE_KEY = 'ldesign_cli_ai_config'

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Partial<AIConfig> = {
  baseUrl: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
  timeout: 60000,
  maxRetries: 3
}

/**
 * 获取 AI 配置
 */
export function getAIConfig(): AIConfig | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    
    const config = JSON.parse(stored) as AIConfig
    return {
      ...DEFAULT_CONFIG,
      ...config
    } as AIConfig
  } catch (error) {
    console.error('获取 AI 配置失败:', error)
    return null
  }
}

/**
 * 保存 AI 配置
 */
export function saveAIConfig(config: Partial<AIConfig>): boolean {
  try {
    const currentConfig = getAIConfig() || {}
    const newConfig = {
      ...DEFAULT_CONFIG,
      ...currentConfig,
      ...config
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig))
    
    return true
  } catch (error) {
    console.error('保存 AI 配置失败:', error)
    return false
  }
}

/**
 * 清除 AI 配置
 */
export function clearAIConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    
  } catch (error) {
    console.error('清除 AI 配置失败:', error)
  }
}

/**
 * 检查配置是否完整
 */
export function isConfigValid(config: AIConfig | null): boolean {
  return !!(config && config.apiKey && config.apiKey.trim().length > 0)
}

/**
 * 验证 API 密钥格式
 */
export function validateApiKey(apiKey: string): { valid: boolean; message?: string } {
  if (!apiKey || apiKey.trim().length === 0) {
    return { valid: false, message: 'API 密钥不能为空' }
  }
  
  if (apiKey.length < 20) {
    return { valid: false, message: 'API 密钥长度不足' }
  }
  
  return { valid: true }
}
