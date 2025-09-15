import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useWebSocket } from '@ldesign/websocket/react'
import './App.css'

interface Message {
  id: string
  type: 'sent' | 'received' | 'system'
  content: string
  timestamp: number
}

interface Config {
  heartbeat: {
    enabled: boolean
    interval: number
  }
  reconnect: {
    enabled: boolean
    maxAttempts: number
  }
  messageQueue: {
    enabled: boolean
  }
}

const App: React.FC = () => {
  // 状态管理
  const [wsUrl] = useState('ws://echo.websocket.org')
  const [messageText, setMessageText] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [config, setConfig] = useState<Config>({
    heartbeat: {
      enabled: true,
      interval: 30
    },
    reconnect: {
      enabled: true,
      maxAttempts: 5
    },
    messageQueue: {
      enabled: true
    }
  })

  // 统计数据
  const [messagesSent, setMessagesSent] = useState(0)
  const [messagesReceived, setMessagesReceived] = useState(0)
  const [reconnectCount, setReconnectCount] = useState(0)
  const [errorCount, setErrorCount] = useState(0)
  const [connectionStartTime, setConnectionStartTime] = useState<number | null>(null)
  const [latencyHistory, setLatencyHistory] = useState<number[]>([])

  const messageListRef = useRef<HTMLDivElement>(null)

  // 使用 WebSocket Hook
  const { 
    status, 
    lastMessage, 
    send, 
    connect, 
    disconnect,
    updateConfig: updateWSConfig
  } = useWebSocket(wsUrl, {
    autoConnect: false,
    heartbeat: {
      enabled: config.heartbeat.enabled,
      interval: config.heartbeat.interval * 1000
    },
    reconnect: {
      enabled: config.reconnect.enabled,
      maxAttempts: config.reconnect.maxAttempts,
      strategy: 'exponential'
    },
    messageQueue: {
      enabled: config.messageQueue.enabled
    },
    onConnected: () => {
      setConnectionStartTime(Date.now())
      addMessage('system', '连接成功')
    },
    onDisconnected: () => {
      setConnectionStartTime(null)
      addMessage('system', '连接断开')
    },
    onReconnecting: (attempt: number) => {
      setReconnectCount(attempt)
      addMessage('system', `正在重连... (${attempt})`)
    },
    onError: (error: Error) => {
      setErrorCount(prev => prev + 1)
      addMessage('system', `错误: ${error.message}`)
    }
  })

  // 添加消息
  const addMessage = useCallback((type: 'sent' | 'received' | 'system', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: Date.now()
    }
    
    setMessages(prev => [...prev, newMessage])
    
    // 滚动到底部
    setTimeout(() => {
      if (messageListRef.current) {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight
      }
    }, 0)
  }, [])

  // 发送消息
  const sendMessage = useCallback(async () => {
    if (!messageText.trim()) return
    
    try {
      const startTime = Date.now()
      await send(messageText)
      
      // 计算延迟（模拟）
      const latency = Date.now() - startTime
      setLatencyHistory(prev => {
        const newHistory = [...prev, latency]
        return newHistory.length > 10 ? newHistory.slice(1) : newHistory
      })
      
      setMessagesSent(prev => prev + 1)
      addMessage('sent', messageText)
      setMessageText('')
    } catch (error) {
      setErrorCount(prev => prev + 1)
      addMessage('system', `发送失败: ${(error as Error).message}`)
    }
  }, [messageText, send, addMessage])

  // 清空消息
  const clearMessages = useCallback(() => {
    setMessages([])
    setMessagesSent(0)
    setMessagesReceived(0)
  }, [])

  // 导出消息
  const exportMessages = useCallback(() => {
    const data = messages.map(msg => ({
      type: msg.type,
      content: msg.content,
      time: new Date(msg.timestamp).toISOString()
    }))
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `websocket-messages-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [messages])

  // 更新配置
  const handleConfigChange = useCallback((newConfig: Partial<Config>) => {
    const updatedConfig = { ...config, ...newConfig }
    setConfig(updatedConfig)
    
    updateWSConfig({
      heartbeat: {
        enabled: updatedConfig.heartbeat.enabled,
        interval: updatedConfig.heartbeat.interval * 1000
      },
      reconnect: {
        enabled: updatedConfig.reconnect.enabled,
        maxAttempts: updatedConfig.reconnect.maxAttempts
      },
      messageQueue: {
        enabled: updatedConfig.messageQueue.enabled
      }
    })
  }, [config, updateWSConfig])

  // 格式化时间
  const formatTime = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN')
  }, [])

  // 计算属性
  const statusText = {
    connected: '已连接',
    connecting: '连接中...',
    disconnected: '未连接',
    reconnecting: '重连中...'
  }[status] || '未知状态'

  const connectionDuration = connectionStartTime 
    ? (() => {
        const duration = Math.floor((Date.now() - connectionStartTime) / 1000)
        const minutes = Math.floor(duration / 60)
        const seconds = duration % 60
        return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
      })()
    : '0s'

  const averageLatency = latencyHistory.length > 0
    ? Math.round(latencyHistory.reduce((a, b) => a + b, 0) / latencyHistory.length)
    : 0

  const messageRate = connectionStartTime
    ? (() => {
        const duration = (Date.now() - connectionStartTime) / 1000
        return duration > 0 ? Math.round(messagesReceived / duration) : 0
      })()
    : 0

  // 监听最新消息
  useEffect(() => {
    if (lastMessage) {
      setMessagesReceived(prev => prev + 1)
      addMessage('received', lastMessage)
    }
  }, [lastMessage, addMessage])

  return (
    <div className="app">
      <header className="app-header">
        <h1>React WebSocket 示例</h1>
        <div className="connection-status">
          <div className={`status-dot ${status}`}></div>
          <span>{statusText}</span>
        </div>
      </header>

      <main className="app-main">
        <div className="examples-grid">
          {/* 基础连接示例 */}
          <div className="example-card">
            <h3>基础连接</h3>
            <div className="example-content">
              <div className="connection-info">
                <p>URL: {wsUrl}</p>
                <p>状态: {status}</p>
                <p>重连次数: {reconnectCount}</p>
              </div>
              <div className="example-actions">
                <button 
                  onClick={connect} 
                  disabled={status === 'connected' || status === 'connecting'}
                  className="btn btn-primary"
                >
                  连接
                </button>
                <button 
                  onClick={disconnect} 
                  disabled={status !== 'connected'}
                  className="btn btn-secondary"
                >
                  断开
                </button>
              </div>
            </div>
          </div>

          {/* 消息发送示例 */}
          <div className="example-card">
            <h3>消息发送</h3>
            <div className="example-content">
              <div className="message-input-group">
                <input 
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyUp={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="输入消息..."
                  disabled={status !== 'connected'}
                  className="message-input"
                />
                <button 
                  onClick={sendMessage}
                  disabled={status !== 'connected' || !messageText.trim()}
                  className="btn btn-primary"
                >
                  发送
                </button>
              </div>
              <div className="message-stats">
                <p>已发送: {messagesSent}</p>
                <p>已接收: {messagesReceived}</p>
              </div>
            </div>
          </div>

          {/* 消息历史 */}
          <div className="example-card full-width">
            <h3>消息历史</h3>
            <div className="example-content">
              <div className="message-list" ref={messageListRef}>
                {messages.map(message => (
                  <div 
                    key={message.id}
                    className={`message-item ${message.type}`}
                  >
                    <span className="message-time">{formatTime(message.timestamp)}</span>
                    <span className="message-content">{message.content}</span>
                  </div>
                ))}
              </div>
              <div className="message-actions">
                <button onClick={clearMessages} className="btn btn-secondary">
                  清空消息
                </button>
                <button onClick={exportMessages} className="btn btn-secondary">
                  导出消息
                </button>
              </div>
            </div>
          </div>

          {/* 高级配置 */}
          <div className="example-card">
            <h3>高级配置</h3>
            <div className="example-content">
              <div className="config-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={config.heartbeat.enabled}
                    onChange={(e) => handleConfigChange({
                      heartbeat: { ...config.heartbeat, enabled: e.target.checked }
                    })}
                  />
                  启用心跳检测
                </label>
                {config.heartbeat.enabled && (
                  <div className="config-sub">
                    <label>
                      心跳间隔 (秒):
                      <input 
                        type="number" 
                        value={config.heartbeat.interval}
                        onChange={(e) => handleConfigChange({
                          heartbeat: { ...config.heartbeat, interval: Number(e.target.value) }
                        })}
                        min="5"
                        max="300"
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="config-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={config.reconnect.enabled}
                    onChange={(e) => handleConfigChange({
                      reconnect: { ...config.reconnect, enabled: e.target.checked }
                    })}
                  />
                  启用自动重连
                </label>
                {config.reconnect.enabled && (
                  <div className="config-sub">
                    <label>
                      最大重连次数:
                      <input 
                        type="number" 
                        value={config.reconnect.maxAttempts}
                        onChange={(e) => handleConfigChange({
                          reconnect: { ...config.reconnect, maxAttempts: Number(e.target.value) }
                        })}
                        min="1"
                        max="20"
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="config-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={config.messageQueue.enabled}
                    onChange={(e) => handleConfigChange({
                      messageQueue: { ...config.messageQueue, enabled: e.target.checked }
                    })}
                  />
                  启用消息队列
                </label>
              </div>
            </div>
          </div>

          {/* 性能监控 */}
          <div className="example-card">
            <h3>性能监控</h3>
            <div className="example-content">
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">连接时长</span>
                  <span className="stat-value">{connectionDuration}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">平均延迟</span>
                  <span className="stat-value">{averageLatency}ms</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">消息速率</span>
                  <span className="stat-value">{messageRate}/s</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">错误次数</span>
                  <span className="stat-value">{errorCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
