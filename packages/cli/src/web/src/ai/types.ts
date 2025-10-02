/**
 * AI 模块类型定义
 */

/**
 * AI 配置接口
 */
export interface AIConfig {
  /** DeepSeek API 密钥 */
  apiKey: string
  /** API 基础地址 */
  baseUrl?: string
  /** 默认模型 */
  model?: string
  /** 超时时间（毫秒） */
  timeout?: number
  /** 最大重试次数 */
  maxRetries?: number
}

/**
 * 聊天消息接口
 */
export interface ChatMessage {
  /** 角色：system, user, assistant */
  role: 'system' | 'user' | 'assistant'
  /** 消息内容 */
  content: string
}

/**
 * 聊天完成请求参数
 */
export interface ChatCompletionRequest {
  /** 模型名称 */
  model?: string
  /** 消息列表 */
  messages: ChatMessage[]
  /** 温度参数，控制随机性 (0-2) */
  temperature?: number
  /** 最大生成token数 */
  max_tokens?: number
  /** 是否流式返回 */
  stream?: boolean
  /** 停止符 */
  stop?: string[]
}

/**
 * 聊天完成响应
 */
export interface ChatCompletionResponse {
  /** 响应ID */
  id: string
  /** 对象类型 */
  object: string
  /** 创建时间 */
  created: number
  /** 模型名称 */
  model: string
  /** 选择列表 */
  choices: {
    /** 索引 */
    index: number
    /** 消息 */
    message: ChatMessage
    /** 结束原因 */
    finish_reason: string
  }[]
  /** 使用情况 */
  usage: {
    /** 提示token数 */
    prompt_tokens: number
    /** 完成token数 */
    completion_tokens: number
    /** 总token数 */
    total_tokens: number
  }
}

/**
 * 流式响应数据
 */
export interface StreamChunk {
  id: string
  object: string
  created: number
  model: string
  choices: {
    index: number
    delta: {
      role?: string
      content?: string
    }
    finish_reason: string | null
  }[]
}
