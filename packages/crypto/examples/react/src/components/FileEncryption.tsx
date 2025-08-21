import { aes, hash } from '@ldesign/crypto'
import React, { useCallback, useRef, useState } from 'react'

interface EncryptedFile {
  name: string
  originalSize: number
  encryptedData: string
  iv: string
  hash: string
  timestamp: Date
}

export const FileEncryption: React.FC = () => {
  const [password, setPassword] = useState('')
  const [encryptedFiles, setEncryptedFiles] = useState<EncryptedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 读取文件内容
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsText(file)
    })
  }

  // 加密文件
  const encryptFile = useCallback(
    async (file: File) => {
      if (!password) {
        alert('请输入加密密码')
        return
      }

      setIsProcessing(true)
      setProgress(0)

      try {
        // 模拟进度更新
        setProgress(20)

        // 读取文件内容
        const fileContent = await readFileAsText(file)
        setProgress(40)

        // 生成文件哈希
        const fileHash = hash.sha256(fileContent)
        setProgress(60)

        // 加密文件内容
        const encrypted = aes.encrypt(fileContent, password, {
          keySize: 256,
          mode: 'CBC',
        })
        setProgress(80)

        if (encrypted.success && encrypted.data) {
          const encryptedFile: EncryptedFile = {
            name: file.name,
            originalSize: file.size,
            encryptedData: encrypted.data,
            iv: encrypted.iv || '',
            hash: fileHash,
            timestamp: new Date(),
          }

          setEncryptedFiles(prev => [...prev, encryptedFile])
          setProgress(100)

          // 清空文件输入
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        }
        else {
          alert(`加密失败: ${encrypted.error}`)
        }
      }
      catch (error) {
        alert(`文件处理失败: ${(error as Error).message}`)
      }
      finally {
        setIsProcessing(false)
        setTimeout(() => setProgress(0), 1000)
      }
    },
    [password],
  )

  // 解密文件
  const decryptFile = useCallback(
    (encryptedFile: EncryptedFile) => {
      if (!password) {
        alert('请输入解密密码')
        return
      }

      try {
        const decrypted = aes.decrypt(encryptedFile.encryptedData, password, {
          keySize: 256,
          mode: 'CBC',
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
        }
        else {
          alert(`解密失败: ${decrypted.error}`)
        }
      }
      catch (error) {
        alert(`解密错误: ${(error as Error).message}`)
      }
    },
    [password],
  )

  // 导出加密文件
  const exportEncryptedFile = useCallback((encryptedFile: EncryptedFile) => {
    const exportData = {
      ...encryptedFile,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${encryptedFile.name}.encrypted.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  // 删除加密文件
  const deleteEncryptedFile = useCallback((index: number) => {
    if (confirm('确定要删除这个加密文件吗？')) {
      setEncryptedFiles(prev => prev.filter((_, i) => i !== index))
    }
  }, [])

  // 处理文件选择
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        // 检查文件大小（限制为1MB以内，演示用）
        if (file.size > 1024 * 1024) {
          alert('演示版本仅支持1MB以内的文件')
          return
        }

        // 检查文件类型（仅支持文本文件）
        if (!file.type.startsWith('text/') && !file.name.endsWith('.txt')) {
          alert('演示版本仅支持文本文件')
          return
        }

        encryptFile(file)
      }
    },
    [encryptFile],
  )

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0)
      return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
  }

  return (
    <div className="file-encryption">
      <h2>📁 文件加密工具</h2>

      <div className="encryption-controls">
        <div className="password-section">
          <label>加密密码:</label>
          <input
            type="password"
            placeholder="请输入强密码"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="password-input"
          />
        </div>

        <div className="file-upload-section">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            disabled={isProcessing || !password}
            accept=".txt,text/*"
            className="file-input"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing || !password}
            className="btn-upload"
          >
            {isProcessing ? '加密中...' : '选择文件加密'}
          </button>
        </div>

        {isProcessing && (
          <div className="progress-section">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span>
              {progress}
              %
            </span>
          </div>
        )}
      </div>

      <div className="encrypted-files-section">
        <h3>
          加密文件列表 (
          {encryptedFiles.length}
          )
        </h3>

        {encryptedFiles.length === 0
          ? (
              <div className="empty-state">
                <p>还没有加密任何文件</p>
                <div className="tips">
                  <h4>使用提示:</h4>
                  <ul>
                    <li>支持文本文件加密（.txt 等）</li>
                    <li>文件大小限制: 1MB</li>
                    <li>使用 AES-256-CBC 加密</li>
                    <li>包含文件完整性验证</li>
                  </ul>
                </div>
              </div>
            )
          : (
              <div className="files-grid">
                {encryptedFiles.map((file, index) => (
                  <div key={index} className="file-card">
                    <div className="file-header">
                      <h4>
                        📄
                        {file.name}
                      </h4>
                      <button
                        onClick={() => deleteEncryptedFile(index)}
                        className="btn-delete"
                        title="删除"
                      >
                        🗑️
                      </button>
                    </div>

                    <div className="file-info">
                      <p>
                        <strong>原始大小:</strong>
                        {' '}
                        {formatFileSize(file.originalSize)}
                      </p>
                      <p>
                        <strong>加密时间:</strong>
                        {' '}
                        {file.timestamp.toLocaleString()}
                      </p>
                      <p>
                        <strong>文件哈希:</strong>
                        <code className="hash-display">
                          {file.hash.substring(0, 16)}
                          ...
                        </code>
                      </p>
                    </div>

                    <div className="file-actions">
                      <button
                        onClick={() => decryptFile(file)}
                        className="btn-decrypt"
                        disabled={!password}
                      >
                        🔓 解密下载
                      </button>
                      <button
                        onClick={() => exportEncryptedFile(file)}
                        className="btn-export"
                      >
                        💾 导出
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
      </div>

      <div className="security-info">
        <h4>🔒 安全特性:</h4>
        <ul>
          <li>
            <strong>AES-256-CBC 加密:</strong>
            {' '}
            军用级别的加密标准
          </li>
          <li>
            <strong>随机 IV:</strong>
            {' '}
            每次加密使用不同的初始化向量
          </li>
          <li>
            <strong>完整性验证:</strong>
            {' '}
            SHA-256 哈希确保文件未被篡改
          </li>
          <li>
            <strong>密码保护:</strong>
            {' '}
            只有正确密码才能解密文件
          </li>
        </ul>
      </div>
    </div>
  )
}
