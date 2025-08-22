import { aes, hash } from '@ldesign/crypto'
import React, { useCallback, useState } from 'react'
import './styles.css'

interface PasswordEntry {
  id: string
  website: string
  username: string
  encryptedPassword: string
  iv: string
  createdAt: Date
}

export const PasswordManager: React.FC = () => {
  const [masterPassword, setMasterPassword] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [passwords, setPasswords] = useState<PasswordEntry[]>([])
  const [newEntry, setNewEntry] = useState({
    website: '',
    username: '',
    password: '',
  })
  const [showPasswords, setShowPasswords] = useState<
    Record<string, string | boolean>
  >({})

  // 生成主密钥（基于主密码的哈希）
  const generateMasterKey = useCallback((password: string) => {
    return hash.sha256(`${password}salt_for_password_manager`)
  }, [])

  // 解锁密码管理器
  const unlock = useCallback(() => {
    if (masterPassword.length < 6) {
      alert('主密码至少需要6位字符')
      return
    }
    setIsUnlocked(true)
    // 在实际应用中，这里应该验证主密码
  }, [masterPassword])

  // 锁定密码管理器
  const lock = useCallback(() => {
    setIsUnlocked(false)
    setMasterPassword('')
    setPasswords([])
    setShowPasswords({})
  }, [])

  // 添加新密码
  const addPassword = useCallback(() => {
    if (!newEntry.website || !newEntry.username || !newEntry.password) {
      alert('请填写完整信息')
      return
    }

    try {
      const masterKey = generateMasterKey(masterPassword)
      const encrypted = aes.encrypt(newEntry.password, masterKey, {
        keySize: 256,
        mode: 'CBC',
      })

      if (encrypted.success && encrypted.data) {
        const entry: PasswordEntry = {
          id: Date.now().toString(),
          website: newEntry.website,
          username: newEntry.username,
          encryptedPassword: encrypted.data,
          iv: encrypted.iv || '',
          createdAt: new Date(),
        }

        setPasswords(prev => [...prev, entry])
        setNewEntry({ website: '', username: '', password: '' })
      }
      else {
        alert(`加密失败: ${encrypted.error}`)
      }
    }
    catch (error) {
      alert(`添加密码失败: ${(error as Error).message}`)
    }
  }, [newEntry, masterPassword, generateMasterKey])

  // 解密并显示密码
  const togglePasswordVisibility = useCallback(
    (entry: PasswordEntry) => {
      const entryId = entry.id

      if (showPasswords[entryId]) {
        // 隐藏密码
        setShowPasswords(prev => ({ ...prev, [entryId]: false }))
      }
      else {
        // 显示密码
        try {
          const masterKey = generateMasterKey(masterPassword)
          const decrypted = aes.decrypt(entry.encryptedPassword, masterKey, {
            keySize: 256,
            mode: 'CBC',
          })

          if (decrypted.success && decrypted.data) {
            setShowPasswords(prev => ({
              ...prev,
              [entryId]: decrypted.data as string,
            }))
          }
          else {
            alert(`解密失败: ${decrypted.error || '未知错误'}`)
          }
        }
        catch (error) {
          alert(`解密错误: ${(error as Error).message}`)
        }
      }
    },
    [masterPassword, generateMasterKey, showPasswords],
  )

  // 生成强密码
  const generateStrongPassword = useCallback(() => {
    const chars
      = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewEntry(prev => ({ ...prev, password }))
  }, [])

  // 删除密码条目
  const deletePassword = useCallback((id: string) => {
    if (confirm('确定要删除这个密码吗？')) {
      setPasswords(prev => prev.filter(p => p.id !== id))
      setShowPasswords((prev) => {
        const newState = { ...prev }
        delete newState[id]
        return newState
      })
    }
  }, [])

  if (!isUnlocked) {
    return (
      <div className="password-manager">
        <div className="unlock-screen">
          <h2>🔐 密码管理器</h2>
          <p>请输入主密码来解锁您的密码库</p>
          <div className="form-group">
            <input
              type="password"
              placeholder="主密码"
              value={masterPassword}
              onChange={e => setMasterPassword(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && unlock()}
            />
          </div>
          <button onClick={unlock} className="btn-primary">
            解锁
          </button>
          <div className="security-note">
            <p>⚠️ 安全提示：</p>
            <ul>
              <li>主密码用于加密您的所有密码</li>
              <li>请使用强密码并妥善保管</li>
              <li>此演示仅用于展示加密功能</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="password-manager">
      <div className="header">
        <h2>🔐 密码管理器</h2>
        <button onClick={lock} className="btn-secondary">
          锁定
        </button>
      </div>

      <div className="add-password-section">
        <h3>添加新密码</h3>
        <div className="form-row">
          <input
            type="text"
            placeholder="网站/应用名称"
            value={newEntry.website}
            onChange={e =>
              setNewEntry(prev => ({ ...prev, website: e.target.value }))}
          />
          <input
            type="text"
            placeholder="用户名/邮箱"
            value={newEntry.username}
            onChange={e =>
              setNewEntry(prev => ({ ...prev, username: e.target.value }))}
          />
        </div>
        <div className="form-row">
          <input
            type="text"
            placeholder="密码"
            value={newEntry.password}
            onChange={e =>
              setNewEntry(prev => ({ ...prev, password: e.target.value }))}
          />
          <button onClick={generateStrongPassword} className="btn-generate">
            生成强密码
          </button>
        </div>
        <button onClick={addPassword} className="btn-primary">
          添加密码
        </button>
      </div>

      <div className="passwords-list">
        <h3>
          已保存的密码 (
          {passwords.length}
          )
        </h3>
        {passwords.length === 0
          ? (
              <p className="empty-state">还没有保存任何密码</p>
            )
          : (
              <div className="passwords-grid">
                {passwords.map(entry => (
                  <div key={entry.id} className="password-card">
                    <div className="card-header">
                      <h4>{entry.website}</h4>
                      <button
                        onClick={() => deletePassword(entry.id)}
                        className="btn-delete"
                        title="删除"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="card-content">
                      <p>
                        <strong>用户名:</strong>
                        {' '}
                        {entry.username}
                      </p>
                      <div className="password-row">
                        <strong>密码:</strong>
                        <span className="password-display">
                          {showPasswords[entry.id]
                            ? showPasswords[entry.id]
                            : '••••••••'}
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(entry)}
                          className="btn-toggle"
                        >
                          {showPasswords[entry.id] ? '🙈' : '👁️'}
                        </button>
                      </div>
                      <p className="created-date">
                        创建时间:
                        {' '}
                        {entry.createdAt.toLocaleString()}
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
