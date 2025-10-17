/**
 * AI Integration Tests
 * 
 * 测试 AI 集成模块的核心功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createAIIntegration, type AIProvider } from '../src/ai/ai-integration'
import { createEngine } from '../src'

describe('AI Integration', () => {
  let aiIntegration: ReturnType<typeof createAIIntegration>
  
  beforeEach(() => {
    const engine = createEngine()
    aiIntegration = createAIIntegration(engine)
  })
  
  describe('Provider Management', () => {
    it('should register and use custom AI provider', async () => {
      const mockProvider: AIProvider = {
        name: 'mock',
        request: vi.fn().mockResolvedValue('Mock response'),
        streamRequest: vi.fn().mockResolvedValue({
          stream: (async function* () {
            yield 'Mock'
            yield ' stream'
            yield ' response'
          })()
        })
      }
      
      aiIntegration.registerProvider(mockProvider)
      aiIntegration.setActiveProvider('mock')
      
      const response = await aiIntegration.request('Test prompt')
      expect(response).toBe('Mock response')
      expect(mockProvider.request).toHaveBeenCalledWith('Test prompt', expect.any(Object))
    })
    
    it('should handle streaming requests', async () => {
      const mockProvider: AIProvider = {
        name: 'stream-mock',
        request: vi.fn(),
        streamRequest: vi.fn().mockResolvedValue({
          stream: (async function* () {
            yield 'Chunk 1'
            yield 'Chunk 2'
            yield 'Chunk 3'
          })()
        })
      }
      
      aiIntegration.registerProvider(mockProvider)
      aiIntegration.setActiveProvider('stream-mock')
      
      const result = await aiIntegration.streamRequest('Test prompt')
      const chunks: string[] = []
      
      for await (const chunk of result.stream) {
        chunks.push(chunk)
      }
      
      expect(chunks).toEqual(['Chunk 1', 'Chunk 2', 'Chunk 3'])
    })
  })
  
  describe('Code Analysis', () => {
    it('should analyze code complexity', async () => {
      const code = `
        function complexFunction(a, b, c) {
          if (a > 0) {
            if (b > 0) {
              if (c > 0) {
                return a + b + c;
              }
            }
          }
          return 0;
        }
      `
      
      const analysis = await aiIntegration.analyzeCode(code)
      
      expect(analysis).toHaveProperty('complexity')
      expect(analysis).toHaveProperty('suggestions')
      expect(Array.isArray(analysis.suggestions)).toBe(true)
    })
    
    it('should handle TypeScript code analysis', async () => {
      const tsCode = `
        interface User {
          id: number;
          name: string;
          email: string;
        }
        
        class UserService {
          private users: Map<number, User> = new Map();
          
          getUser(id: number): User | undefined {
            return this.users.get(id);
          }
          
          addUser(user: User): void {
            this.users.set(user.id, user);
          }
        }
      `
      
      const analysis = await aiIntegration.analyzeCode(tsCode, { 
        language: 'typescript' 
      })
      
      expect(analysis).toBeTruthy()
      expect(analysis.language).toBe('typescript')
    })
  })
  
  describe('Error Analysis', () => {
    it('should analyze error and provide solutions', async () => {
      const error = new TypeError('Cannot read property "foo" of undefined')
      error.stack = `TypeError: Cannot read property 'foo' of undefined
        at Object.test (/src/test.js:10:5)
        at processTicksAndRejections (internal/process/task_queues.js:97:5)`
      
      const analysis = await aiIntegration.analyzeError(error)
      
      expect(analysis).toHaveProperty('cause')
      expect(analysis).toHaveProperty('solution')
      expect(analysis).toHaveProperty('preventionTips')
      expect(Array.isArray(analysis.preventionTips)).toBe(true)
    })
  })
  
  describe('Code Generation', () => {
    it('should generate code based on description', async () => {
      const result = await aiIntegration.generateCode({
        description: 'Create a function that sorts an array of numbers',
        language: 'javascript'
      })
      
      expect(result).toHaveProperty('code')
      expect(result).toHaveProperty('explanation')
      expect(typeof result.code).toBe('string')
    })
    
    it('should generate unit tests for code', async () => {
      const code = `
        function add(a, b) {
          return a + b;
        }
      `
      
      const result = await aiIntegration.generateCode({
        description: 'Generate unit tests for the add function',
        language: 'javascript',
        context: { existingCode: code }
      })
      
      expect(result.code).toContain('test')
      expect(result.code).toContain('add')
    })
  })
  
  describe('Security Analysis', () => {
    it('should detect security vulnerabilities', async () => {
      const vulnerableCode = `
        const userInput = req.query.name;
        const query = "SELECT * FROM users WHERE name = '" + userInput + "'";
        db.execute(query);
      `
      
      const analysis = await aiIntegration.analyzeSecurityIssues(vulnerableCode)
      
      expect(analysis).toHaveProperty('vulnerabilities')
      expect(Array.isArray(analysis.vulnerabilities)).toBe(true)
      expect(analysis.vulnerabilities.length).toBeGreaterThan(0)
      
      const sqlInjection = analysis.vulnerabilities.find(
        v => v.type === 'sql-injection'
      )
      expect(sqlInjection).toBeTruthy()
    })
  })
  
  describe('Rate Limiting', () => {
    it('should respect rate limits', async () => {
      // 配置严格的速率限制
      aiIntegration = createAIIntegration(createEngine(), {
        providers: {
          openai: {
            apiKey: 'test-key',
            rateLimits: {
              requestsPerMinute: 2,
              tokensPerMinute: 100
            }
          }
        }
      })
      
      const mockProvider: AIProvider = {
        name: 'test',
        request: vi.fn().mockResolvedValue('Response')
      }
      
      aiIntegration.registerProvider(mockProvider)
      aiIntegration.setActiveProvider('test')
      
      // 快速发送多个请求
      const requests = Array(5).fill(null).map(() => 
        aiIntegration.request('Test')
      )
      
      // 部分请求应该被限流
      const results = await Promise.allSettled(requests)
      const rejected = results.filter(r => r.status === 'rejected')
      
      expect(rejected.length).toBeGreaterThan(0)
    })
  })
})