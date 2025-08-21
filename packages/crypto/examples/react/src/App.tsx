// 导入基础演示需要的功能
import { aes, base64, hash, hex } from '@ldesign/crypto'
import { useState } from 'react'

import { DigitalSignature } from './components/DigitalSignature'
import { FileEncryption } from './components/FileEncryption'
// 导入功能组件
import { PasswordManager } from './components/PasswordManager'
import { PerformanceBenchmark } from './components/PerformanceBenchmark'

import './App.css'

type TabType = 'basic' | 'password' | 'file' | 'signature' | 'performance'

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('basic')

  // 基础演示的状态
  const [plaintext, setPlaintext] = useState('Hello, LDesign Crypto!')
  const [key, setKey] = useState('my-secret-key')
  const [encrypted, setEncrypted] = useState('')
  const [decrypted, setDecrypted] = useState('')
  const [hashInput, setHashInput] = useState('Hello, Hash!')
  const [hashResult, setHashResult] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // 基础加密演示
  const handleEncrypt = () => {
    try {
      const result = aes.encrypt(plaintext, key, {
        keySize: 256,
        mode: 'CBC',
      })

      if (result.success && result.data) {
        setEncrypted(result.data)
        setSuccess('AES 加密成功')
        setError('')
      }
      else {
        setError(`加密失败: ${result.error || '未知错误'}`)
        setSuccess('')
      }
    }
    catch (err) {
      setError(`加密错误: ${(err as Error).message}`)
      setSuccess('')
    }
  }

  // 基础解密演示
  const handleDecrypt = () => {
    try {
      const result = aes.decrypt(encrypted, key, {
        keySize: 256,
        mode: 'CBC',
      })

      if (result.success && result.data) {
        setDecrypted(result.data)
        setSuccess('AES 解密成功')
        setError('')
      }
      else {
        setError(`解密失败: ${result.error || '未知错误'}`)
        setSuccess('')
      }
    }
    catch (err) {
      setError(`解密错误: ${(err as Error).message}`)
      setSuccess('')
    }
  }

  // 基础哈希演示
  const handleHash = () => {
    try {
      const result = hash.sha256(hashInput)
      setHashResult(result)
      setSuccess('SHA-256 哈希计算成功')
      setError('')
    }
    catch (err) {
      setError(`哈希计算错误: ${(err as Error).message}`)
      setSuccess('')
    }
  }

  // 渲染标签页内容
  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="basic-demo">
            <h2>🔐 基础加密演示</h2>

            <div className="demo-section">
              <h3>AES 加密/解密</h3>
              <div className="form-group">
                <label>明文:</label>
                <input
                  type="text"
                  value={plaintext}
                  onChange={e => setPlaintext(e.target.value)}
                  placeholder="输入要加密的文本"
                />
              </div>
              <div className="form-group">
                <label>密钥:</label>
                <input
                  type="text"
                  value={key}
                  onChange={e => setKey(e.target.value)}
                  placeholder="输入加密密钥"
                />
              </div>
              <div className="button-group">
                <button onClick={handleEncrypt} className="btn-primary">
                  🔒 加密
                </button>
                <button
                  onClick={handleDecrypt}
                  className="btn-secondary"
                  disabled={!encrypted}
                >
                  🔓 解密
                </button>
              </div>

              {encrypted && (
                <div className="result-section">
                  <h4>加密结果:</h4>
                  <textarea value={encrypted} readOnly rows={3} />
                </div>
              )}

              {decrypted && (
                <div className="result-section">
                  <h4>解密结果:</h4>
                  <p className="decrypted-text">{decrypted}</p>
                </div>
              )}
            </div>

            <div className="demo-section">
              <h3>SHA-256 哈希</h3>
              <div className="form-group">
                <label>输入数据:</label>
                <input
                  type="text"
                  value={hashInput}
                  onChange={e => setHashInput(e.target.value)}
                  placeholder="输入要哈希的数据"
                />
              </div>
              <button onClick={handleHash} className="btn-primary">
                🔍 计算哈希
              </button>

              {hashResult && (
                <div className="result-section">
                  <h4>哈希值:</h4>
                  <code className="hash-result">{hashResult}</code>
                </div>
              )}
            </div>

            <div className="demo-section">
              <h3>快速示例</h3>
              <div className="examples-grid">
                <div className="example-card">
                  <h4>Base64 编码</h4>
                  <code>base64.encode('Hello')</code>
                  <p>
                    →
                    {base64.encode('Hello')}
                  </p>
                </div>
                <div className="example-card">
                  <h4>Hex 编码</h4>
                  <code>hex.encode('World')</code>
                  <p>
                    →
                    {hex.encode('World')}
                  </p>
                </div>
                <div className="example-card">
                  <h4>MD5 哈希</h4>
                  <code>hash.md5('Test')</code>
                  <p>
                    →
                    {hash.md5('Test').substring(0, 16)}
                    ...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      case 'password':
        return <PasswordManager />
      case 'file':
        return <FileEncryption />
      case 'signature':
        return <DigitalSignature />
      case 'performance':
        return <PerformanceBenchmark />
      default:
        return null
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🔐 LDesign Crypto 演示</h1>
        <p>全面的 JavaScript 加密库演示应用</p>
      </header>

      <nav className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          🎯 基础演示
        </button>
        <button
          className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          🔐 密码管理器
        </button>
        <button
          className={`tab-button ${activeTab === 'file' ? 'active' : ''}`}
          onClick={() => setActiveTab('file')}
        >
          📁 文件加密
        </button>
        <button
          className={`tab-button ${activeTab === 'signature' ? 'active' : ''}`}
          onClick={() => setActiveTab('signature')}
        >
          ✍️ 数字签名
        </button>
        <button
          className={`tab-button ${
            activeTab === 'performance' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('performance')}
        >
          ⚡ 性能测试
        </button>
      </nav>

      <main className="app-main">
        {error && (
          <div className="alert alert-error">
            ❌
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            ✅
            {success}
          </div>
        )}

        <div className="tab-content">{renderTabContent()}</div>
      </main>

      <footer className="app-footer">
        <p>
          Powered by
          {' '}
          <strong>@ldesign/crypto</strong>
          {' '}
          -
          <a
            href="https://github.com/ldesign/crypto"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  )
}

export default App
