# React 集成指南

本指南详细介绍如何在 React 项目中集成和使用 @ldesign/crypto。

## 安装

```bash
npm install @ldesign/crypto
# 或
yarn add @ldesign/crypto
# 或
pnpm add @ldesign/crypto
```

## 基础集成

### 1. 基本使用

```tsx
import React, { useState } from 'react'
import { aes, hash } from '@ldesign/crypto'

const BasicCryptoComponent: React.FC = () => {
  const [plaintext, setPlaintext] = useState('Hello, React!')
  const [secretKey, setSecretKey] = useState('my-secret-key')
  const [encrypted, setEncrypted] = useState('')
  const [decrypted, setDecrypted] = useState('')

  const handleEncrypt = () => {
    try {
      const result = aes.encrypt(plaintext, secretKey, { keySize: 256 })
      if (result.success) {
        setEncrypted(result.data!)
      } else {
        alert('加密失败: ' + result.error)
      }
    } catch (error) {
      alert('加密错误: ' + (error as Error).message)
    }
  }

  const handleDecrypt = () => {
    try {
      const result = aes.decrypt(encrypted, secretKey, { keySize: 256 })
      if (result.success) {
        setDecrypted(result.data!)
      } else {
        alert('解密失败: ' + result.error)
      }
    } catch (error) {
      alert('解密错误: ' + (error as Error).message)
    }
  }

  return (
    <div className='crypto-demo'>
      <h2>React 加密演示</h2>

      <div className='form-section'>
        <input
          value={plaintext}
          onChange={e => setPlaintext(e.target.value)}
          placeholder='输入要加密的文本'
        />
        <input
          value={secretKey}
          onChange={e => setSecretKey(e.target.value)}
          placeholder='输入密钥'
          type='password'
        />

        <div className='button-group'>
          <button onClick={handleEncrypt}>🔒 加密</button>
          <button onClick={handleDecrypt} disabled={!encrypted}>
            🔓 解密
          </button>
        </div>
      </div>

      {encrypted && (
        <div className='result-section'>
          <h3>加密结果:</h3>
          <pre>{encrypted}</pre>
        </div>
      )}

      {decrypted && (
        <div className='result-section'>
          <h3>解密结果:</h3>
          <p>{decrypted}</p>
        </div>
      )}
    </div>
  )
}

export default BasicCryptoComponent
```

### 2. 自定义 Hook

```tsx
import { useState, useCallback, useRef } from 'react'
import { aes, hash, rsa, keyGenerator } from '@ldesign/crypto'

interface CryptoState {
  isProcessing: boolean
  lastError: string | null
  lastResult: any
}

export const useCrypto = () => {
  const [state, setState] = useState<CryptoState>({
    isProcessing: false,
    lastError: null,
    lastResult: null,
  })

  const setProcessing = useCallback((processing: boolean) => {
    setState(prev => ({ ...prev, isProcessing: processing }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, lastError: error }))
  }, [])

  const setResult = useCallback((result: any) => {
    setState(prev => ({ ...prev, lastResult: result }))
  }, [])

  // AES 加密
  const encryptAES = useCallback(
    async (data: string, key: string, options?: any): Promise<string> => {
      setProcessing(true)
      setError(null)

      try {
        const result = aes.encrypt(data, key, options)
        if (result.success && result.data) {
          setResult(result)
          return result.data
        } else {
          throw new Error(result.error || '加密失败')
        }
      } catch (error) {
        const errorMessage = (error as Error).message
        setError(errorMessage)
        throw error
      } finally {
        setProcessing(false)
      }
    },
    [setProcessing, setError, setResult]
  )

  // AES 解密
  const decryptAES = useCallback(
    async (encryptedData: string, key: string, options?: any): Promise<string> => {
      setProcessing(true)
      setError(null)

      try {
        const result = aes.decrypt(encryptedData, key, options)
        if (result.success && result.data) {
          setResult(result)
          return result.data
        } else {
          throw new Error(result.error || '解密失败')
        }
      } catch (error) {
        const errorMessage = (error as Error).message
        setError(errorMessage)
        throw error
      } finally {
        setProcessing(false)
      }
    },
    [setProcessing, setError, setResult]
  )

  // 生成 RSA 密钥对
  const generateRSAKeyPair = useCallback(
    async (keySize: number = 2048) => {
      setProcessing(true)
      setError(null)

      try {
        const keyPair = keyGenerator.generateRSAKeyPair(keySize)
        setResult(keyPair)
        return keyPair
      } catch (error) {
        const errorMessage = (error as Error).message
        setError(errorMessage)
        throw error
      } finally {
        setProcessing(false)
      }
    },
    [setProcessing, setError, setResult]
  )

  // 哈希计算
  const calculateHash = useCallback(
    async (
      data: string,
      algorithm: 'md5' | 'sha1' | 'sha256' | 'sha512' = 'sha256'
    ): Promise<string> => {
      setProcessing(true)
      setError(null)

      try {
        const result = hash[algorithm](data)
        setResult(result)
        return result
      } catch (error) {
        const errorMessage = (error as Error).message
        setError(errorMessage)
        throw error
      } finally {
        setProcessing(false)
      }
    },
    [setProcessing, setError, setResult]
  )

  // 清除错误
  const clearError = useCallback(() => {
    setError(null)
  }, [setError])

  // 重置状态
  const reset = useCallback(() => {
    setState({
      isProcessing: false,
      lastError: null,
      lastResult: null,
    })
  }, [])

  return {
    // 状态
    isProcessing: state.isProcessing,
    lastError: state.lastError,
    lastResult: state.lastResult,

    // AES 方法
    encryptAES,
    decryptAES,

    // RSA 方法
    generateRSAKeyPair,

    // 哈希方法
    calculateHash,

    // 工具方法
    clearError,
    reset,
  }
}
```

### 3. 使用自定义 Hook

```tsx
import React, { useState } from 'react'
import { useCrypto } from './hooks/useCrypto'

const AdvancedCryptoComponent: React.FC = () => {
  const {
    isProcessing,
    lastError,
    encryptAES,
    decryptAES,
    generateRSAKeyPair,
    calculateHash,
    clearError,
  } = useCrypto()

  const [inputData, setInputData] = useState('Hello, Advanced React!')
  const [inputKey, setInputKey] = useState('my-secret-key')
  const [encryptedResult, setEncryptedResult] = useState('')
  const [decryptedResult, setDecryptedResult] = useState('')
  const [hashResult, setHashResult] = useState('')
  const [rsaKeyPair, setRsaKeyPair] = useState<any>(null)

  const handleEncrypt = async () => {
    try {
      const result = await encryptAES(inputData, inputKey, { keySize: 256 })
      setEncryptedResult(result)
      setDecryptedResult('') // 清空解密结果
    } catch (error) {
      console.error('加密失败:', error)
    }
  }

  const handleDecrypt = async () => {
    try {
      const result = await decryptAES(encryptedResult, inputKey, { keySize: 256 })
      setDecryptedResult(result)
    } catch (error) {
      console.error('解密失败:', error)
    }
  }

  const handleGenerateKeys = async () => {
    try {
      const keyPair = await generateRSAKeyPair(2048)
      setRsaKeyPair(keyPair)
    } catch (error) {
      console.error('密钥生成失败:', error)
    }
  }

  const handleCalculateHash = async () => {
    try {
      const result = await calculateHash(inputData, 'sha256')
      setHashResult(result)
    } catch (error) {
      console.error('哈希计算失败:', error)
    }
  }

  return (
    <div className='advanced-crypto-demo'>
      <h2>高级 React 加密演示</h2>

      {/* 错误显示 */}
      {lastError && (
        <div className='error-message'>
          ❌ {lastError}
          <button onClick={clearError}>清除</button>
        </div>
      )}

      {/* 输入区域 */}
      <div className='input-section'>
        <textarea
          value={inputData}
          onChange={e => setInputData(e.target.value)}
          placeholder='输入数据'
          rows={4}
        />
        <input
          value={inputKey}
          onChange={e => setInputKey(e.target.value)}
          placeholder='输入密钥'
          type='password'
        />
      </div>

      {/* 操作按钮 */}
      <div className='button-group'>
        <button onClick={handleEncrypt} disabled={isProcessing}>
          {isProcessing ? '加密中...' : '🔒 AES 加密'}
        </button>
        <button onClick={handleDecrypt} disabled={isProcessing || !encryptedResult}>
          {isProcessing ? '解密中...' : '🔓 AES 解密'}
        </button>
        <button onClick={handleGenerateKeys} disabled={isProcessing}>
          {isProcessing ? '生成中...' : '🔑 生成 RSA 密钥'}
        </button>
        <button onClick={handleCalculateHash} disabled={isProcessing}>
          {isProcessing ? '计算中...' : '🔍 计算哈希'}
        </button>
      </div>

      {/* 结果显示 */}
      {encryptedResult && (
        <div className='result-section'>
          <h3>🔒 加密结果:</h3>
          <pre>{encryptedResult}</pre>
        </div>
      )}

      {decryptedResult && (
        <div className='result-section success'>
          <h3>🔓 解密结果:</h3>
          <p>{decryptedResult}</p>
        </div>
      )}

      {hashResult && (
        <div className='result-section'>
          <h3>🔍 SHA-256 哈希:</h3>
          <code>{hashResult}</code>
        </div>
      )}

      {rsaKeyPair && (
        <div className='key-section'>
          <h3>🔑 RSA 密钥对:</h3>
          <div className='key-item'>
            <h4>公钥:</h4>
            <textarea value={rsaKeyPair.publicKey} readOnly rows={4} />
          </div>
          <div className='key-item'>
            <h4>私钥:</h4>
            <textarea value={rsaKeyPair.privateKey} readOnly rows={4} />
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedCryptoComponent
```

## Context Provider 模式

### 1. 创建 Crypto Context

```tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { cryptoManager } from '@ldesign/crypto'

interface CryptoState {
  isInitialized: boolean
  defaultAlgorithm: string
  cache: Map<string, any>
  settings: {
    enableCache: boolean
    maxCacheSize: number
    autoGenerateIV: boolean
  }
}

type CryptoAction =
  | { type: 'INITIALIZE'; payload: any }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<CryptoState['settings']> }
  | { type: 'CLEAR_CACHE' }
  | { type: 'ADD_TO_CACHE'; payload: { key: string; value: any } }

const initialState: CryptoState = {
  isInitialized: false,
  defaultAlgorithm: 'AES',
  cache: new Map(),
  settings: {
    enableCache: true,
    maxCacheSize: 1000,
    autoGenerateIV: true,
  },
}

const cryptoReducer = (state: CryptoState, action: CryptoAction): CryptoState => {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        isInitialized: true,
        ...action.payload,
      }
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      }
    case 'CLEAR_CACHE':
      return {
        ...state,
        cache: new Map(),
      }
    case 'ADD_TO_CACHE':
      const newCache = new Map(state.cache)
      newCache.set(action.payload.key, action.payload.value)

      // 限制缓存大小
      if (newCache.size > state.settings.maxCacheSize) {
        const firstKey = newCache.keys().next().value
        newCache.delete(firstKey)
      }

      return {
        ...state,
        cache: newCache,
      }
    default:
      return state
  }
}

interface CryptoContextType {
  state: CryptoState
  dispatch: React.Dispatch<CryptoAction>
  cryptoManager: typeof cryptoManager
}

const CryptoContext = createContext<CryptoContextType | undefined>(undefined)

export const CryptoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cryptoReducer, initialState)

  // 初始化加密管理器
  React.useEffect(() => {
    cryptoManager.configure({
      enableCache: state.settings.enableCache,
      maxCacheSize: state.settings.maxCacheSize,
      autoGenerateIV: state.settings.autoGenerateIV,
    })

    dispatch({ type: 'INITIALIZE', payload: {} })
  }, [state.settings])

  const value = {
    state,
    dispatch,
    cryptoManager,
  }

  return <CryptoContext.Provider value={value}>{children}</CryptoContext.Provider>
}

export const useCryptoContext = () => {
  const context = useContext(CryptoContext)
  if (context === undefined) {
    throw new Error('useCryptoContext must be used within a CryptoProvider')
  }
  return context
}
```

### 2. 使用 Context

```tsx
import React from 'react'
import { CryptoProvider } from './context/CryptoContext'
import CryptoApp from './components/CryptoApp'

const App: React.FC = () => {
  return (
    <CryptoProvider>
      <div className='app'>
        <header>
          <h1>🔐 React Crypto App</h1>
        </header>
        <main>
          <CryptoApp />
        </main>
      </div>
    </CryptoProvider>
  )
}

export default App
```

````tsx
import React, { useState } from 'react'
import { useCryptoContext } from '../context/CryptoContext'

const CryptoApp: React.FC = () => {
  const { state, dispatch, cryptoManager } = useCryptoContext()
  const [data, setData] = useState('')
  const [key, setKey] = useState('')

  const handleEncrypt = async () => {
    try {
      const result = await cryptoManager.encryptData(data, key, state.defaultAlgorithm)

      if (state.settings.enableCache) {
        dispatch({
          type: 'ADD_TO_CACHE',
          payload: {
            key: `${data}_${key}`,
            value: result
          }
        })
      }

      console.log('加密结果:', result)
    } catch (error) {
      console.error('加密失败:', error)
    }
  }

  const updateSettings = (newSettings: any) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings })
  }

  const clearCache = () => {
    dispatch({ type: 'CLEAR_CACHE' })
  }

  return (
    <div className="crypto-app">
      <div className="settings-section">
        <h3>设置</h3>
        <label>
          <input
            type="checkbox"
            checked={state.settings.enableCache}
            onChange={(e) => updateSettings({ enableCache: e.target.checked })}
          />
          启用缓存
        </label>
        <button onClick={clearCache}>清除缓存</button>
        <p>缓存项数: {state.cache.size}</p>
      </div>

      <div className="crypto-section">
        <input
          value={data}
          onChange={(e) => setData(e.target.value)}
          placeholder="输入数据"
        />
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="输入密钥"
          type="password"
        />
        <button onClick={handleEncrypt}>加密</button>
      </div>
    </div>
  )
}

export default CryptoApp

## 高级组件示例

### 1. 密码管理器组件

```tsx
import React, { useState, useEffect } from 'react'
import { aes, hash, keyGenerator } from '@ldesign/crypto'

interface PasswordEntry {
  id: string
  website: string
  username: string
  encryptedPassword: string
  iv: string
  createdAt: Date
}

const PasswordManager: React.FC = () => {
  const [masterPassword, setMasterPassword] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [passwords, setPasswords] = useState<PasswordEntry[]>([])
  const [showPasswords, setShowPasswords] = useState<Record<string, string>>({})

  const [newEntry, setNewEntry] = useState({
    website: '',
    username: '',
    password: ''
  })

  // 解锁密码管理器
  const unlockVault = () => {
    if (masterPassword.length < 8) {
      alert('主密码至少需要8个字符')
      return
    }
    setIsUnlocked(true)
    loadPasswords()
  }

  // 加载密码
  const loadPasswords = () => {
    const stored = localStorage.getItem('encrypted_passwords')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setPasswords(parsed)
      } catch (error) {
        console.error('加载密码失败:', error)
      }
    }
  }

  // 添加新密码
  const addPassword = () => {
    if (!newEntry.website || !newEntry.username || !newEntry.password) {
      alert('请填写所有字段')
      return
    }

    try {
      const iv = keyGenerator.generateIV(16)
      const encrypted = aes.encrypt(newEntry.password, masterPassword, {
        keySize: 256,
        mode: 'CBC',
        iv
      })

      if (encrypted.success && encrypted.data) {
        const entry: PasswordEntry = {
          id: Date.now().toString(),
          website: newEntry.website,
          username: newEntry.username,
          encryptedPassword: encrypted.data,
          iv: encrypted.iv!,
          createdAt: new Date()
        }

        const updatedPasswords = [...passwords, entry]
        setPasswords(updatedPasswords)
        localStorage.setItem('encrypted_passwords', JSON.stringify(updatedPasswords))

        // 清空表单
        setNewEntry({ website: '', username: '', password: '' })
      }
    } catch (error) {
      alert('密码加密失败: ' + (error as Error).message)
    }
  }

  // 显示/隐藏密码
  const togglePasswordVisibility = (entryId: string) => {
    if (showPasswords[entryId]) {
      // 隐藏密码
      setShowPasswords(prev => {
        const updated = { ...prev }
        delete updated[entryId]
        return updated
      })
    } else {
      // 解密并显示密码
      const entry = passwords.find(p => p.id === entryId)
      if (entry) {
        try {
          const decrypted = aes.decrypt(entry.encryptedPassword, masterPassword, {
            keySize: 256,
            mode: 'CBC',
            iv: entry.iv
          })

          if (decrypted.success && decrypted.data) {
            setShowPasswords(prev => ({ ...prev, [entryId]: decrypted.data as string }))
          } else {
            alert('解密失败: ' + (decrypted.error || '未知错误'))
          }
        } catch (error) {
          alert('解密错误: ' + (error as Error).message)
        }
      }
    }
  }

  // 删除密码
  const deletePassword = (entryId: string) => {
    if (confirm('确定要删除这个密码吗？')) {
      const updatedPasswords = passwords.filter(p => p.id !== entryId)
      setPasswords(updatedPasswords)
      localStorage.setItem('encrypted_passwords', JSON.stringify(updatedPasswords))

      // 清除显示的密码
      setShowPasswords(prev => {
        const updated = { ...prev }
        delete updated[entryId]
        return updated
      })
    }
  }

  // 锁定密码管理器
  const lockVault = () => {
    setIsUnlocked(false)
    setMasterPassword('')
    setShowPasswords({})
  }

  if (!isUnlocked) {
    return (
      <div className="password-manager unlock-screen">
        <h2>🔐 密码管理器</h2>
        <p>请输入主密码解锁</p>

        <div className="unlock-form">
          <input
            type="password"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            placeholder="主密码"
            onKeyPress={(e) => e.key === 'Enter' && unlockVault()}
          />
          <button onClick={unlockVault}>解锁</button>
        </div>

        <div className="security-note">
          <p>⚠️ 安全提示:</p>
          <ul>
            <li>主密码用于加密您的所有密码</li>
            <li>请使用强密码并妥善保管</li>
            <li>忘记主密码将无法恢复数据</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="password-manager">
      <div className="header">
        <h2>🔐 密码管理器</h2>
        <button onClick={lockVault} className="lock-btn">🔒 锁定</button>
      </div>

      {/* 添加新密码 */}
      <div className="add-password-section">
        <h3>添加新密码</h3>
        <div className="form-grid">
          <input
            value={newEntry.website}
            onChange={(e) => setNewEntry(prev => ({ ...prev, website: e.target.value }))}
            placeholder="网站"
          />
          <input
            value={newEntry.username}
            onChange={(e) => setNewEntry(prev => ({ ...prev, username: e.target.value }))}
            placeholder="用户名"
          />
          <input
            type="password"
            value={newEntry.password}
            onChange={(e) => setNewEntry(prev => ({ ...prev, password: e.target.value }))}
            placeholder="密码"
          />
          <button onClick={addPassword}>➕ 添加</button>
        </div>
      </div>

      {/* 密码列表 */}
      <div className="passwords-list">
        <h3>已保存的密码 ({passwords.length})</h3>

        {passwords.length === 0 ? (
          <div className="empty-state">
            <p>还没有保存任何密码</p>
          </div>
        ) : (
          <div className="passwords-grid">
            {passwords.map(entry => (
              <div key={entry.id} className="password-card">
                <div className="card-header">
                  <h4>{entry.website}</h4>
                  <button
                    onClick={() => deletePassword(entry.id)}
                    className="delete-btn"
                  >
                    🗑️
                  </button>
                </div>

                <div className="card-content">
                  <p><strong>用户名:</strong> {entry.username}</p>
                  <div className="password-row">
                    <strong>密码:</strong>
                    <div className="password-display">
                      {showPasswords[entry.id] || '••••••••'}
                    </div>
                    <button
                      onClick={() => togglePasswordVisibility(entry.id)}
                      className="toggle-btn"
                    >
                      {showPasswords[entry.id] ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <p className="created-date">
                    创建时间: {entry.createdAt.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PasswordManager
````

### 2. 文件加密组件

````tsx
import React, { useState, useRef } from 'react'
import { aes, hash } from '@ldesign/crypto'

interface EncryptedFile {
  name: string
  originalSize: number
  encryptedData: string
  iv: string
  hash: string
  timestamp: Date
}

const FileEncryption: React.FC = () => {
  const [password, setPassword] = useState('')
  const [encryptedFiles, setEncryptedFiles] = useState<EncryptedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 处理文件选择
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    if (!password) {
      alert('请先设置加密密码')
      return
    }

    setIsProcessing(true)
    setProgress(0)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        await encryptFile(file)
        setProgress(((i + 1) / files.length) * 100)
      }
    } catch (error) {
      alert('文件加密失败: ' + (error as Error).message)
    } finally {
      setIsProcessing(false)
      setProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // 加密文件
  const encryptFile = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => {
        try {
          const content = reader.result as string

          // 计算文件哈希
          const fileHash = hash.sha256(content)

          // 加密文件内容
          const encrypted = aes.encrypt(content, password, { keySize: 256 })

          if (encrypted.success && encrypted.data) {
            const encryptedFile: EncryptedFile = {
              name: file.name,
              originalSize: file.size,
              encryptedData: encrypted.data,
              iv: encrypted.iv!,
              hash: fileHash,
              timestamp: new Date()
            }

            setEncryptedFiles(prev => [...prev, encryptedFile])
            resolve()
          } else {
            reject(new Error(encrypted.error || '加密失败'))
          }
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(reader.error)
      reader.readAsText(file)
    })
  }

  // 解密并下载文件
  const decryptAndDownload = (encryptedFile: EncryptedFile) => {
    try {
      const decrypted = aes.decrypt(encryptedFile.encryptedData, password, {
        keySize: 256,
        iv: encryptedFile.iv
      })

      if (decrypted.success && decrypted.data) {
        // 验证文件完整性
        const decryptedHash = hash.sha256(decrypted.data)
        if (decryptedHash !== encryptedFile.hash) {
          alert('⚠️ 文件完整性验证失败！文件可能已被篡改。')
          return
        }

        // 创建下载链接
        const blob = new Blob([decrypted.data], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = encryptedFile.name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        alert('解密失败: ' + (decrypted.error || '未知错误'))
      }
    } catch (error) {
      alert('解密错误: ' + (error as Error).message)
    }
  }

  // 导出加密文件
  const exportEncryptedFile = (encryptedFile: EncryptedFile) => {
    const exportData = {
      ...encryptedFile,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${encryptedFile.name}.encrypted.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 删除加密文件
  const deleteEncryptedFile = (index: number) => {
    if (confirm('确定要删除这个加密文件吗？')) {
      setEncryptedFiles(prev => prev.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="file-encryption">
      <h2>🔐 文件加密工具</h2>

      {/* 加密控制 */}
      <div className="encryption-controls">
        <div className="password-section">
          <label>加密密码:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="输入加密密码"
            className="password-input"
          />
        </div>

        <div className="file-upload-section">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            multiple
            accept=".txt,.json,.csv,.md"
            className="file-input"
            disabled={isProcessing}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing || !password}
            className="upload-btn"
          >
            {isProcessing ? '加密中...' : '📁 选择文件'}
          </button>
        </div>

        {isProcessing && (
          <div className="progress-section">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p>加密进度: {progress.toFixed(1)}%</p>
          </div>
        )}
      </div>

      {/* 加密文件列表 */}
      {encryptedFiles.length > 0 && (
        <div className="encrypted-files-section">
          <h3>加密文件 ({encryptedFiles.length})</h3>

          <div className="files-grid">
            {encryptedFiles.map((file, index) => (
              <div key={index} className="file-card">
                <div className="file-header">
                  <h4>{file.name}</h4>
                  <button
                    onClick={() => deleteEncryptedFile(index)}
                    className="delete-btn"
                  >
                    🗑️
                  </button>
                </div>

                <div className="file-info">
                  <p><strong>原始大小:</strong> {(file.originalSize / 1024).toFixed(2)} KB</p>
                  <p><strong>加密时间:</strong> {file.timestamp.toLocaleString()}</p>
                  <p><strong>文件哈希:</strong></p>
                  <div className="hash-display">{file.hash}</div>
                </div>

                <div className="file-actions">
                  <button
                    onClick={() => decryptAndDownload(file)}
                    className="decrypt-btn"
                  >
                    🔓 解密下载
                  </button>
                  <button
                    onClick={() => exportEncryptedFile(file)}
                    className="export-btn"
                  >
                    💾 导出加密文件
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 使用提示 */}
      <div className="tips">
        <h4>💡 使用提示:</h4>
        <ul>
          <li>支持多文件同时加密</li>
          <li>文件会进行完整性验证</li>
          <li>加密文件可以导出为 JSON 格式</li>
          <li>请妥善保管加密密码</li>
        </ul>
      </div>
    </div>
  )
}

export default FileEncryption

## 性能优化

### 1. 使用 Web Worker

```tsx
// crypto-worker.ts
import { aes, hash } from '@ldesign/crypto'

self.onmessage = function(e) {
  const { type, data, key, options, id } = e.data

  try {
    let result

    switch (type) {
      case 'encrypt':
        result = aes.encrypt(data, key, options)
        break
      case 'decrypt':
        result = aes.decrypt(data, key, options)
        break
      case 'hash':
        result = hash[options.algorithm](data)
        break
      default:
        throw new Error('未知操作类型')
    }

    self.postMessage({ id, success: true, result })
  } catch (error) {
    self.postMessage({
      id,
      success: false,
      error: (error as Error).message
    })
  }
}

// useWebWorkerCrypto.ts
import { useRef, useCallback } from 'react'

interface WorkerOperation {
  id: string
  resolve: (value: any) => void
  reject: (error: Error) => void
}

export const useWebWorkerCrypto = () => {
  const workerRef = useRef<Worker | null>(null)
  const operationsRef = useRef<Map<string, WorkerOperation>>(new Map())

  // 初始化 Worker
  const initWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker('/crypto-worker.js')
      workerRef.current.onmessage = (e) => {
        const { id, success, result, error } = e.data
        const operation = operationsRef.current.get(id)

        if (operation) {
          operationsRef.current.delete(id)

          if (success) {
            operation.resolve(result)
          } else {
            operation.reject(new Error(error))
          }
        }
      }
    }
  }, [])

  // 执行加密操作
  const encryptInWorker = useCallback((data: string, key: string, options?: any): Promise<any> => {
    initWorker()

    const id = Math.random().toString(36)

    return new Promise((resolve, reject) => {
      operationsRef.current.set(id, { id, resolve, reject })

      workerRef.current!.postMessage({
        type: 'encrypt',
        data,
        key,
        options,
        id
      })
    })
  }, [initWorker])

  // 执行解密操作
  const decryptInWorker = useCallback((data: string, key: string, options?: any): Promise<any> => {
    initWorker()

    const id = Math.random().toString(36)

    return new Promise((resolve, reject) => {
      operationsRef.current.set(id, { id, resolve, reject })

      workerRef.current!.postMessage({
        type: 'decrypt',
        data,
        key,
        options,
        id
      })
    })
  }, [initWorker])

  // 清理 Worker
  const cleanup = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
    }
    operationsRef.current.clear()
  }, [])

  return {
    encryptInWorker,
    decryptInWorker,
    cleanup
  }
}
````

### 2. 批量处理组件

```tsx
import React, { useState, useCallback } from 'react'
import { aes } from '@ldesign/crypto'

interface BatchItem {
  id: string
  data: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  result?: string
  error?: string
}

const BatchCryptoProcessor: React.FC = () => {
  const [items, setItems] = useState<BatchItem[]>([])
  const [batchKey, setBatchKey] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  // 添加批处理项
  const addBatchItem = useCallback(() => {
    const newItem: BatchItem = {
      id: Date.now().toString(),
      data: '',
      status: 'pending',
    }
    setItems(prev => [...prev, newItem])
  }, [])

  // 更新项数据
  const updateItemData = useCallback((id: string, data: string) => {
    setItems(prev => prev.map(item => (item.id === id ? { ...item, data } : item)))
  }, [])

  // 删除项
  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }, [])

  // 批量加密
  const processBatch = useCallback(async () => {
    if (!batchKey) {
      alert('请输入加密密钥')
      return
    }

    const validItems = items.filter(item => item.data.trim())
    if (validItems.length === 0) {
      alert('请至少添加一个有效的数据项')
      return
    }

    setIsProcessing(true)
    setProgress(0)

    try {
      for (let i = 0; i < validItems.length; i++) {
        const item = validItems[i]

        // 更新状态为处理中
        setItems(prev =>
          prev.map(prevItem =>
            prevItem.id === item.id ? { ...prevItem, status: 'processing' as const } : prevItem
          )
        )

        try {
          // 执行加密
          const result = aes.encrypt(item.data, batchKey, { keySize: 256 })

          if (result.success && result.data) {
            // 更新为完成状态
            setItems(prev =>
              prev.map(prevItem =>
                prevItem.id === item.id
                  ? {
                      ...prevItem,
                      status: 'completed' as const,
                      result: result.data,
                    }
                  : prevItem
              )
            )
          } else {
            throw new Error(result.error || '加密失败')
          }
        } catch (error) {
          // 更新为错误状态
          setItems(prev =>
            prev.map(prevItem =>
              prevItem.id === item.id
                ? {
                    ...prevItem,
                    status: 'error' as const,
                    error: (error as Error).message,
                  }
                : prevItem
            )
          )
        }

        // 更新进度
        setProgress(((i + 1) / validItems.length) * 100)

        // 添加小延迟以显示进度
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    } finally {
      setIsProcessing(false)
    }
  }, [items, batchKey])

  // 导出结果
  const exportResults = useCallback(() => {
    const completedItems = items.filter(item => item.status === 'completed')

    if (completedItems.length === 0) {
      alert('没有完成的加密结果可导出')
      return
    }

    const exportData = {
      timestamp: new Date().toISOString(),
      algorithm: 'AES-256',
      results: completedItems.map(item => ({
        originalData: item.data,
        encryptedData: item.result,
      })),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `batch-encryption-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [items])

  // 清空所有项
  const clearAll = useCallback(() => {
    if (confirm('确定要清空所有项吗？')) {
      setItems([])
      setProgress(0)
    }
  }, [])

  const getStatusIcon = (status: BatchItem['status']) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'processing':
        return '🔄'
      case 'completed':
        return '✅'
      case 'error':
        return '❌'
      default:
        return '❓'
    }
  }

  const completedCount = items.filter(item => item.status === 'completed').length
  const errorCount = items.filter(item => item.status === 'error').length

  return (
    <div className='batch-crypto-processor'>
      <h2>🔄 批量加密处理器</h2>

      {/* 控制面板 */}
      <div className='control-panel'>
        <div className='key-section'>
          <input
            type='password'
            value={batchKey}
            onChange={e => setBatchKey(e.target.value)}
            placeholder='批量加密密钥'
            disabled={isProcessing}
          />
        </div>

        <div className='action-buttons'>
          <button onClick={addBatchItem} disabled={isProcessing}>
            ➕ 添加项
          </button>
          <button onClick={processBatch} disabled={isProcessing || items.length === 0 || !batchKey}>
            {isProcessing ? '处理中...' : '🚀 开始批量加密'}
          </button>
          <button onClick={exportResults} disabled={completedCount === 0}>
            💾 导出结果
          </button>
          <button onClick={clearAll} disabled={isProcessing}>
            🗑️ 清空
          </button>
        </div>

        {/* 进度显示 */}
        {isProcessing && (
          <div className='progress-section'>
            <div className='progress-bar'>
              <div className='progress-fill' style={{ width: `${progress}%` }}></div>
            </div>
            <p>处理进度: {progress.toFixed(1)}%</p>
          </div>
        )}

        {/* 统计信息 */}
        <div className='stats'>
          <span>总计: {items.length}</span>
          <span>完成: {completedCount}</span>
          <span>错误: {errorCount}</span>
        </div>
      </div>

      {/* 批处理项列表 */}
      <div className='batch-items'>
        {items.length === 0 ? (
          <div className='empty-state'>
            <p>点击"添加项"开始批量加密</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className={`batch-item ${item.status}`}>
              <div className='item-header'>
                <span className='status-icon'>{getStatusIcon(item.status)}</span>
                <span className='item-id'>#{item.id.slice(-6)}</span>
                <button
                  onClick={() => removeItem(item.id)}
                  disabled={isProcessing}
                  className='remove-btn'
                >
                  ✕
                </button>
              </div>

              <div className='item-content'>
                <textarea
                  value={item.data}
                  onChange={e => updateItemData(item.id, e.target.value)}
                  placeholder='输入要加密的数据...'
                  disabled={isProcessing}
                  rows={3}
                />

                {item.status === 'completed' && item.result && (
                  <div className='result-section'>
                    <h5>加密结果:</h5>
                    <textarea value={item.result} readOnly rows={2} className='result-textarea' />
                  </div>
                )}

                {item.status === 'error' && item.error && (
                  <div className='error-section'>
                    <p className='error-message'>错误: {item.error}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default BatchCryptoProcessor
```

## 测试

### 1. 单元测试

```tsx
// __tests__/useCrypto.test.ts
import { renderHook, act } from '@testing-library/react'
import { useCrypto } from '../hooks/useCrypto'

describe('useCrypto Hook', () => {
  it('should encrypt and decrypt data correctly', async () => {
    const { result } = renderHook(() => useCrypto())

    const testData = 'Hello, Test!'
    const testKey = 'test-key'

    let encryptedData: string

    // 测试加密
    await act(async () => {
      encryptedData = await result.current.encryptAES(testData, testKey)
    })

    expect(encryptedData).toBeTruthy()
    expect(result.current.isProcessing).toBe(false)
    expect(result.current.lastError).toBeNull()

    // 测试解密
    let decryptedData: string

    await act(async () => {
      decryptedData = await result.current.decryptAES(encryptedData, testKey)
    })

    expect(decryptedData).toBe(testData)
    expect(result.current.isProcessing).toBe(false)
    expect(result.current.lastError).toBeNull()
  })

  it('should handle encryption errors', async () => {
    const { result } = renderHook(() => useCrypto())

    await act(async () => {
      try {
        await result.current.encryptAES('data', '')
      } catch (error) {
        // 预期会抛出错误
      }
    })

    expect(result.current.lastError).toBeTruthy()
    expect(result.current.isProcessing).toBe(false)
  })

  it('should clear errors', async () => {
    const { result } = renderHook(() => useCrypto())

    // 先产生一个错误
    await act(async () => {
      try {
        await result.current.encryptAES('data', '')
      } catch (error) {
        // 忽略错误
      }
    })

    expect(result.current.lastError).toBeTruthy()

    // 清除错误
    act(() => {
      result.current.clearError()
    })

    expect(result.current.lastError).toBeNull()
  })
})
```

### 2. 组件测试

```tsx
// __tests__/PasswordManager.test.tsx
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PasswordManager from '../components/PasswordManager'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock as any

describe('PasswordManager Component', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
  })

  it('should render unlock screen initially', () => {
    render(<PasswordManager />)

    expect(screen.getByText('🔐 密码管理器')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('主密码')).toBeInTheDocument()
    expect(screen.getByText('解锁')).toBeInTheDocument()
  })

  it('should unlock with valid master password', async () => {
    render(<PasswordManager />)

    const passwordInput = screen.getByPlaceholderText('主密码')
    const unlockButton = screen.getByText('解锁')

    fireEvent.change(passwordInput, { target: { value: 'test-master-password' } })
    fireEvent.click(unlockButton)

    await waitFor(() => {
      expect(screen.getByText('添加新密码')).toBeInTheDocument()
    })
  })

  it('should not unlock with short password', () => {
    render(<PasswordManager />)

    const passwordInput = screen.getByPlaceholderText('主密码')
    const unlockButton = screen.getByText('解锁')

    fireEvent.change(passwordInput, { target: { value: '123' } })
    fireEvent.click(unlockButton)

    // 应该显示警告，不会解锁
    expect(screen.queryByText('添加新密码')).not.toBeInTheDocument()
  })

  it('should add new password entry', async () => {
    // 先解锁
    render(<PasswordManager />)

    const passwordInput = screen.getByPlaceholderText('主密码')
    fireEvent.change(passwordInput, { target: { value: 'test-master-password' } })
    fireEvent.click(screen.getByText('解锁'))

    await waitFor(() => {
      expect(screen.getByText('添加新密码')).toBeInTheDocument()
    })

    // 添加新密码
    const websiteInput = screen.getByPlaceholderText('网站')
    const usernameInput = screen.getByPlaceholderText('用户名')
    const newPasswordInput = screen.getByPlaceholderText('密码')
    const addButton = screen.getByText('➕ 添加')

    fireEvent.change(websiteInput, { target: { value: 'example.com' } })
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(newPasswordInput, { target: { value: 'testpass123' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('example.com')).toBeInTheDocument()
      expect(screen.getByText('testuser')).toBeInTheDocument()
    })
  })
})
```

## 最佳实践

### 1. 性能优化

- 使用 Web Worker 处理大量数据加密
- 实现批量处理减少单次操作开销
- 使用 React.memo 优化组件渲染
- 合理使用 useCallback 和 useMemo

### 2. 安全考虑

- 不在组件状态中长期存储敏感数据
- 使用 useEffect 清理函数清除敏感信息
- 实现适当的错误边界
- 验证用户输入

### 3. 用户体验

- 提供加载状态和进度指示
- 实现适当的错误处理和用户反馈
- 支持键盘快捷键
- 响应式设计

### 4. 代码组织

- 使用自定义 Hook 封装加密逻辑
- 实现 Context 进行状态管理
- 分离业务逻辑和 UI 组件
- 编写全面的测试用例

通过这些示例和最佳实践，您可以在 React 应用中安全高效地集成 @ldesign/crypto 库。

```

```
