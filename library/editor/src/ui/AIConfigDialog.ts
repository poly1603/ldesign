/**
 * AI 配置对话框
 * 用于配置 AI 功能设置
 */

import type { AIConfig, AIProvider } from '../ai/types'
import { showUnifiedDialog } from './UnifiedDialog'

/**
 * 显示 AI 配置对话框
 */
export function showAIConfigDialog(
  editor: any,
  currentConfig: AIConfig,
  onSave: (config: AIConfig) => void
): void {
  const dialogContent = `
    <div class="ldesign-ai-config">
      <style>
        .ldesign-ai-config {
          min-width: 500px;
        }
        .ldesign-ai-config-section {
          margin-bottom: 24px;
        }
        .ldesign-ai-config-title {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 12px;
          color: #333;
        }
        .ldesign-ai-config-subtitle {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
          color: #666;
        }
        .ldesign-ai-config-group {
          margin-bottom: 16px;
        }
        .ldesign-ai-config-label {
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
          color: #666;
        }
        .ldesign-ai-config-input,
        .ldesign-ai-config-select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          font-size: 14px;
          transition: border-color 0.3s;
        }
        .ldesign-ai-config-input:focus,
        .ldesign-ai-config-select:focus {
          outline: none;
          border-color: #1890ff;
        }
        .ldesign-ai-config-checkbox {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }
        .ldesign-ai-config-checkbox input {
          margin-right: 8px;
        }
        .ldesign-ai-config-checkbox label {
          font-size: 14px;
          color: #333;
          cursor: pointer;
        }
        .ldesign-ai-config-tabs {
          display: flex;
          border-bottom: 1px solid #e0e0e0;
          margin-bottom: 20px;
        }
        .ldesign-ai-config-tab {
          padding: 10px 20px;
          cursor: pointer;
          border: none;
          background: none;
          font-size: 14px;
          color: #666;
          transition: all 0.3s;
        }
        .ldesign-ai-config-tab.active {
          color: #1890ff;
          border-bottom: 2px solid #1890ff;
        }
        .ldesign-ai-config-tab-content {
          display: none;
        }
        .ldesign-ai-config-tab-content.active {
          display: block;
        }
        .ldesign-ai-config-hint {
          font-size: 12px;
          color: #999;
          margin-top: 4px;
        }
        .ldesign-ai-config-provider-card {
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 16px;
          margin-bottom: 16px;
        }
        .ldesign-ai-config-provider-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .ldesign-ai-config-provider-name {
          font-weight: 500;
          font-size: 15px;
          color: #333;
        }
        .ldesign-ai-config-provider-status {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        .ldesign-ai-config-provider-status.configured {
          background: #f0f9ff;
          color: #1890ff;
        }
        .ldesign-ai-config-provider-status.not-configured {
          background: #fff7e6;
          color: #faad14;
        }
      </style>
      
      <div class="ldesign-ai-config-tabs">
        <button class="ldesign-ai-config-tab active" data-tab="general">常规设置</button>
        <button class="ldesign-ai-config-tab" data-tab="providers">模型配置</button>
        <button class="ldesign-ai-config-tab" data-tab="features">功能开关</button>
        <button class="ldesign-ai-config-tab" data-tab="shortcuts">快捷键</button>
      </div>
      
      <!-- 常规设置 -->
      <div class="ldesign-ai-config-tab-content active" data-content="general">
        <div class="ldesign-ai-config-section">
          <div class="ldesign-ai-config-group">
            <label class="ldesign-ai-config-label">启用 AI 功能</label>
            <div class="ldesign-ai-config-checkbox">
              <input type="checkbox" id="ai-enabled" ${currentConfig.enabled ? 'checked' : ''}>
              <label for="ai-enabled">开启 AI 助手功能</label>
            </div>
          </div>
          
          <div class="ldesign-ai-config-group">
            <label class="ldesign-ai-config-label">默认 AI 提供商</label>
            <select class="ldesign-ai-config-select" id="default-provider">
              <option value="deepseek" ${currentConfig.defaultProvider === 'deepseek' ? 'selected' : ''}>DeepSeek</option>
              <option value="openai" ${currentConfig.defaultProvider === 'openai' ? 'selected' : ''}>OpenAI</option>
              <option value="azure" ${currentConfig.defaultProvider === 'azure' ? 'selected' : ''}>Azure OpenAI</option>
              <option value="anthropic" ${currentConfig.defaultProvider === 'anthropic' ? 'selected' : ''}>Anthropic</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- 模型配置 -->
      <div class="ldesign-ai-config-tab-content" data-content="providers">
        <div class="ldesign-ai-config-section">
          <!-- DeepSeek 配置 -->
          <div class="ldesign-ai-config-provider-card">
            <div class="ldesign-ai-config-provider-header">
              <span class="ldesign-ai-config-provider-name">DeepSeek</span>
              <span class="ldesign-ai-config-provider-status ${currentConfig.providers.deepseek?.apiKey ? 'configured' : 'not-configured'}">
                ${currentConfig.providers.deepseek?.apiKey ? '已配置' : '未配置'}
              </span>
            </div>
            <div class="ldesign-ai-config-group">
              <label class="ldesign-ai-config-label">API 密钥</label>
              <input type="password" class="ldesign-ai-config-input" id="deepseek-api-key" 
                value="${currentConfig.providers.deepseek?.apiKey || ''}"
                placeholder="sk-...">
              <div class="ldesign-ai-config-hint">默认使用内置密钥，你可以设置自己的密钥</div>
            </div>
            <div class="ldesign-ai-config-group">
              <label class="ldesign-ai-config-label">模型</label>
              <input type="text" class="ldesign-ai-config-input" id="deepseek-model"
                value="${currentConfig.providers.deepseek?.model || 'deepseek-chat'}"
                placeholder="deepseek-chat">
            </div>
            <div class="ldesign-ai-config-group">
              <label class="ldesign-ai-config-label">API 端点</label>
              <input type="text" class="ldesign-ai-config-input" id="deepseek-endpoint"
                value="${currentConfig.providers.deepseek?.apiEndpoint || 'https://api.deepseek.com/v1'}"
                placeholder="https://api.deepseek.com/v1">
            </div>
          </div>
          
          <!-- OpenAI 配置 -->
          <div class="ldesign-ai-config-provider-card">
            <div class="ldesign-ai-config-provider-header">
              <span class="ldesign-ai-config-provider-name">OpenAI</span>
              <span class="ldesign-ai-config-provider-status ${currentConfig.providers.openai?.apiKey ? 'configured' : 'not-configured'}">
                ${currentConfig.providers.openai?.apiKey ? '已配置' : '未配置'}
              </span>
            </div>
            <div class="ldesign-ai-config-group">
              <label class="ldesign-ai-config-label">API 密钥</label>
              <input type="password" class="ldesign-ai-config-input" id="openai-api-key"
                value="${currentConfig.providers.openai?.apiKey || ''}"
                placeholder="sk-...">
            </div>
            <div class="ldesign-ai-config-group">
              <label class="ldesign-ai-config-label">模型</label>
              <select class="ldesign-ai-config-select" id="openai-model">
                <option value="gpt-3.5-turbo" ${currentConfig.providers.openai?.model === 'gpt-3.5-turbo' ? 'selected' : ''}>GPT-3.5 Turbo</option>
                <option value="gpt-4" ${currentConfig.providers.openai?.model === 'gpt-4' ? 'selected' : ''}>GPT-4</option>
                <option value="gpt-4-turbo" ${currentConfig.providers.openai?.model === 'gpt-4-turbo' ? 'selected' : ''}>GPT-4 Turbo</option>
              </select>
            </div>
            <div class="ldesign-ai-config-group">
              <label class="ldesign-ai-config-label">API 端点</label>
              <input type="text" class="ldesign-ai-config-input" id="openai-endpoint"
                value="${currentConfig.providers.openai?.apiEndpoint || 'https://api.openai.com/v1'}"
                placeholder="https://api.openai.com/v1">
            </div>
          </div>
        </div>
      </div>
      
      <!-- 功能开关 -->
      <div class="ldesign-ai-config-tab-content" data-content="features">
        <div class="ldesign-ai-config-section">
          <div class="ldesign-ai-config-checkbox">
            <input type="checkbox" id="feature-error-correction" ${currentConfig.features.errorCorrection ? 'checked' : ''}>
            <label for="feature-error-correction">AI 纠错</label>
          </div>
          <div class="ldesign-ai-config-checkbox">
            <input type="checkbox" id="feature-auto-complete" ${currentConfig.features.autoComplete ? 'checked' : ''}>
            <label for="feature-auto-complete">AI 自动补全</label>
          </div>
          <div class="ldesign-ai-config-checkbox">
            <input type="checkbox" id="feature-text-continuation" ${currentConfig.features.textContinuation ? 'checked' : ''}>
            <label for="feature-text-continuation">AI 续写</label>
          </div>
          <div class="ldesign-ai-config-checkbox">
            <input type="checkbox" id="feature-text-rewrite" ${currentConfig.features.textRewrite ? 'checked' : ''}>
            <label for="feature-text-rewrite">AI 重写</label>
          </div>
          <div class="ldesign-ai-config-checkbox">
            <input type="checkbox" id="feature-smart-suggestions" ${currentConfig.features.smartSuggestions ? 'checked' : ''}>
            <label for="feature-smart-suggestions">智能建议</label>
          </div>
        </div>
      </div>
      
      <!-- 快捷键 -->
      <div class="ldesign-ai-config-tab-content" data-content="shortcuts">
        <div class="ldesign-ai-config-section">
          <div class="ldesign-ai-config-group">
            <label class="ldesign-ai-config-label">AI 纠错</label>
            <input type="text" class="ldesign-ai-config-input" id="shortcut-error-correction"
              value="${currentConfig.shortcuts?.errorCorrection || 'Alt+F'}"
              placeholder="Alt+F">
          </div>
          <div class="ldesign-ai-config-group">
            <label class="ldesign-ai-config-label">AI 补全</label>
            <input type="text" class="ldesign-ai-config-input" id="shortcut-auto-complete"
              value="${currentConfig.shortcuts?.autoComplete || 'Ctrl+Space'}"
              placeholder="Ctrl+Space">
          </div>
          <div class="ldesign-ai-config-group">
            <label class="ldesign-ai-config-label">AI 续写</label>
            <input type="text" class="ldesign-ai-config-input" id="shortcut-text-continuation"
              value="${currentConfig.shortcuts?.textContinuation || 'Alt+Enter'}"
              placeholder="Alt+Enter">
          </div>
          <div class="ldesign-ai-config-group">
            <label class="ldesign-ai-config-label">AI 重写</label>
            <input type="text" class="ldesign-ai-config-input" id="shortcut-text-rewrite"
              value="${currentConfig.shortcuts?.textRewrite || 'Alt+R'}"
              placeholder="Alt+R">
          </div>
        </div>
      </div>
    </div>
  `
  
  showUnifiedDialog({
    title: 'AI 设置',
    content: dialogContent,
    width: 600,
    buttons: [
      {
        id: 'cancel',
        label: '取消',
        type: 'secondary',
        closeOnClick: true
      },
      {
        id: 'save',
        label: '保存',
        type: 'primary',
        onClick: () => {
          // 收集配置
          const newConfig: AIConfig = {
        enabled: (document.getElementById('ai-enabled') as HTMLInputElement).checked,
        defaultProvider: (document.getElementById('default-provider') as HTMLSelectElement).value as AIProvider,
        providers: {
          deepseek: {
            provider: 'deepseek',
            model: (document.getElementById('deepseek-model') as HTMLInputElement).value || 'deepseek-chat',
            apiKey: (document.getElementById('deepseek-api-key') as HTMLInputElement).value,
            apiEndpoint: (document.getElementById('deepseek-endpoint') as HTMLInputElement).value || 'https://api.deepseek.com/v1',
            temperature: 0.7,
            maxTokens: 2000,
            stream: false
          },
          openai: {
            provider: 'openai',
            model: (document.getElementById('openai-model') as HTMLSelectElement).value || 'gpt-3.5-turbo',
            apiKey: (document.getElementById('openai-api-key') as HTMLInputElement).value,
            apiEndpoint: (document.getElementById('openai-endpoint') as HTMLInputElement).value || 'https://api.openai.com/v1',
            temperature: 0.7,
            maxTokens: 2000,
            stream: false
          }
        },
        features: {
          errorCorrection: (document.getElementById('feature-error-correction') as HTMLInputElement).checked,
          autoComplete: (document.getElementById('feature-auto-complete') as HTMLInputElement).checked,
          textContinuation: (document.getElementById('feature-text-continuation') as HTMLInputElement).checked,
          textRewrite: (document.getElementById('feature-text-rewrite') as HTMLInputElement).checked,
          smartSuggestions: (document.getElementById('feature-smart-suggestions') as HTMLInputElement).checked
        },
        shortcuts: {
          errorCorrection: (document.getElementById('shortcut-error-correction') as HTMLInputElement).value,
          autoComplete: (document.getElementById('shortcut-auto-complete') as HTMLInputElement).value,
          textContinuation: (document.getElementById('shortcut-text-continuation') as HTMLInputElement).value,
          textRewrite: (document.getElementById('shortcut-text-rewrite') as HTMLInputElement).value
        }
          }
          
          onSave(newConfig)
          return true
        },
        closeOnClick: true
      }
    ],
    onOpen: () => {
      // 添加标签切换功能
      const tabs = document.querySelectorAll('.ldesign-ai-config-tab')
      const contents = document.querySelectorAll('.ldesign-ai-config-tab-content')
      
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const targetTab = tab.getAttribute('data-tab')
          
          // 切换标签状态
          tabs.forEach(t => t.classList.remove('active'))
          tab.classList.add('active')
          
          // 切换内容显示
          contents.forEach(content => {
            if (content.getAttribute('data-content') === targetTab) {
              content.classList.add('active')
            } else {
              content.classList.remove('active')
            }
          })
        })
      })
    }
  })
}