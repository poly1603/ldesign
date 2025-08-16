import { digitalSignature, hash, keyGenerator } from '@ldesign/crypto'
import React, { useCallback, useState } from 'react'

interface SignedDocument {
  id: string
  content: string
  signature: string
  publicKey: string
  timestamp: Date
  hash: string
}

export const DigitalSignature: React.FC = () => {
  const [keyPair, setKeyPair] = useState<{
    publicKey: string
    privateKey: string
  } | null>(null)
  const [documentContent, setDocumentContent] = useState('')
  const [signedDocuments, setSignedDocuments] = useState<SignedDocument[]>([])
  const [verificationContent, setVerificationContent] = useState('')
  const [verificationSignature, setVerificationSignature] = useState('')
  const [verificationPublicKey, setVerificationPublicKey] = useState('')
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean
    message: string
  } | null>(null)

  // 生成 RSA 密钥对
  const generateKeyPair = useCallback(() => {
    try {
      const newKeyPair = keyGenerator.generateRSAKeyPair(2048)
      setKeyPair(newKeyPair)
      setVerificationResult(null)
    }
    catch (error) {
      alert(`密钥生成失败: ${(error as Error).message}`)
    }
  }, [])

  // 签名文档
  const signDocument = useCallback(() => {
    if (!keyPair) {
      alert('请先生成密钥对')
      return
    }

    if (!documentContent.trim()) {
      alert('请输入要签名的文档内容')
      return
    }

    try {
      // 计算文档哈希
      const documentHash = hash.sha256(documentContent)

      // 创建数字签名
      const signature = digitalSignature.sign(
        documentContent,
        keyPair.privateKey,
      )

      const signedDoc: SignedDocument = {
        id: Date.now().toString(),
        content: documentContent,
        signature,
        publicKey: keyPair.publicKey,
        timestamp: new Date(),
        hash: documentHash,
      }

      setSignedDocuments(prev => [...prev, signedDoc])
      setDocumentContent('')
    }
    catch (error) {
      alert(`签名失败: ${(error as Error).message}`)
    }
  }, [keyPair, documentContent])

  // 验证签名
  const verifySignature = useCallback(() => {
    if (
      !verificationContent.trim()
      || !verificationSignature.trim()
      || !verificationPublicKey.trim()
    ) {
      alert('请填写完整的验证信息')
      return
    }

    try {
      const isValid = digitalSignature.verify(
        verificationContent,
        verificationSignature,
        verificationPublicKey,
      )

      setVerificationResult({
        isValid,
        message: isValid
          ? '✅ 签名验证成功！文档未被篡改，签名有效。'
          : '❌ 签名验证失败！文档可能已被篡改或签名无效。',
      })
    }
    catch (error) {
      setVerificationResult({
        isValid: false,
        message: `❌ 验证过程出错: ${(error as Error).message}`,
      })
    }
  }, [verificationContent, verificationSignature, verificationPublicKey])

  // 快速验证已签名文档
  const quickVerify = useCallback((doc: SignedDocument) => {
    try {
      const isValid = digitalSignature.verify(
        doc.content,
        doc.signature,
        doc.publicKey,
      )

      // 同时验证文档哈希
      const currentHash = hash.sha256(doc.content)
      const hashValid = currentHash === doc.hash

      if (isValid && hashValid) {
        alert('✅ 文档验证成功！签名有效且内容未被篡改。')
      }
      else if (isValid && !hashValid) {
        alert('⚠️ 签名有效但文档哈希不匹配，内容可能已被修改。')
      }
      else {
        alert('❌ 签名验证失败！')
      }
    }
    catch (error) {
      alert(`验证失败: ${(error as Error).message}`)
    }
  }, [])

  // 导出签名文档
  const exportSignedDocument = useCallback((doc: SignedDocument) => {
    const exportData = {
      document: {
        content: doc.content,
        hash: doc.hash,
        timestamp: doc.timestamp.toISOString(),
      },
      signature: doc.signature,
      publicKey: doc.publicKey,
      metadata: {
        version: '1.0',
        algorithm: 'RSA-SHA256',
        exportedAt: new Date().toISOString(),
      },
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `signed_document_${doc.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  // 删除签名文档
  const deleteSignedDocument = useCallback((id: string) => {
    if (confirm('确定要删除这个签名文档吗？')) {
      setSignedDocuments(prev => prev.filter(doc => doc.id !== id))
    }
  }, [])

  // 复制到剪贴板
  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert(`${label} 已复制到剪贴板`)
    }
    catch (error) {
      alert('复制失败，请手动复制')
    }
  }, [])

  return (
    <div className="digital-signature">
      <h2>✍️ 数字签名工具</h2>

      {/* 密钥管理部分 */}
      <div className="key-management-section">
        <h3>密钥管理</h3>
        {!keyPair
          ? (
              <div className="no-keys">
                <p>还没有生成密钥对</p>
                <button onClick={generateKeyPair} className="btn-primary">
                  生成 RSA 密钥对 (2048位)
                </button>
              </div>
            )
          : (
              <div className="key-display">
                <div className="key-item">
                  <h4>公钥 (用于验证签名):</h4>
                  <textarea
                    value={keyPair.publicKey}
                    readOnly
                    className="key-textarea"
                    rows={4}
                  />
                  <button
                    onClick={() => copyToClipboard(keyPair.publicKey, '公钥')}
                    className="btn-copy"
                  >
                    📋 复制公钥
                  </button>
                </div>

                <div className="key-item">
                  <h4>私钥 (用于创建签名):</h4>
                  <textarea
                    value={keyPair.privateKey}
                    readOnly
                    className="key-textarea private-key"
                    rows={4}
                  />
                  <button
                    onClick={() => copyToClipboard(keyPair.privateKey, '私钥')}
                    className="btn-copy"
                  >
                    📋 复制私钥
                  </button>
                  <p className="warning">⚠️ 私钥非常重要，请妥善保管！</p>
                </div>

                <button onClick={generateKeyPair} className="btn-secondary">
                  重新生成密钥对
                </button>
              </div>
            )}
      </div>

      {/* 文档签名部分 */}
      <div className="document-signing-section">
        <h3>文档签名</h3>
        <div className="signing-form">
          <textarea
            placeholder="输入要签名的文档内容..."
            value={documentContent}
            onChange={e => setDocumentContent(e.target.value)}
            className="document-textarea"
            rows={6}
          />
          <button
            onClick={signDocument}
            disabled={!keyPair || !documentContent.trim()}
            className="btn-primary"
          >
            🖊️ 创建数字签名
          </button>
        </div>
      </div>

      {/* 签名验证部分 */}
      <div className="signature-verification-section">
        <h3>签名验证</h3>
        <div className="verification-form">
          <div className="form-group">
            <label>文档内容:</label>
            <textarea
              placeholder="输入要验证的文档内容..."
              value={verificationContent}
              onChange={e => setVerificationContent(e.target.value)}
              className="document-textarea"
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>数字签名:</label>
            <textarea
              placeholder="输入数字签名..."
              value={verificationSignature}
              onChange={e => setVerificationSignature(e.target.value)}
              className="signature-textarea"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>公钥:</label>
            <textarea
              placeholder="输入用于验证的公钥..."
              value={verificationPublicKey}
              onChange={e => setVerificationPublicKey(e.target.value)}
              className="key-textarea"
              rows={3}
            />
          </div>

          <button
            onClick={verifySignature}
            disabled={
              !verificationContent.trim()
              || !verificationSignature.trim()
              || !verificationPublicKey.trim()
            }
            className="btn-verify"
          >
            🔍 验证签名
          </button>

          {verificationResult && (
            <div
              className={`verification-result ${
                verificationResult.isValid ? 'valid' : 'invalid'
              }`}
            >
              <p>{verificationResult.message}</p>
            </div>
          )}
        </div>
      </div>

      {/* 已签名文档列表 */}
      <div className="signed-documents-section">
        <h3>
          已签名文档 (
          {signedDocuments.length}
          )
        </h3>

        {signedDocuments.length === 0
          ? (
              <div className="empty-state">
                <p>还没有签名任何文档</p>
                <div className="info-box">
                  <h4>数字签名的作用:</h4>
                  <ul>
                    <li>验证文档的真实性和完整性</li>
                    <li>确认文档的签名者身份</li>
                    <li>防止文档被篡改</li>
                    <li>提供法律效力的电子签名</li>
                  </ul>
                </div>
              </div>
            )
          : (
              <div className="documents-grid">
                {signedDocuments.map(doc => (
                  <div key={doc.id} className="document-card">
                    <div className="document-header">
                      <h4>
                        📄 文档 #
                        {doc.id}
                      </h4>
                      <button
                        onClick={() => deleteSignedDocument(doc.id)}
                        className="btn-delete"
                        title="删除"
                      >
                        🗑️
                      </button>
                    </div>

                    <div className="document-content">
                      <div className="content-preview">
                        <strong>内容预览:</strong>
                        <p className="content-text">
                          {doc.content.length > 100
                            ? `${doc.content.substring(0, 100)}...`
                            : doc.content}
                        </p>
                      </div>

                      <div className="document-info">
                        <p>
                          <strong>签名时间:</strong>
                          {' '}
                          {doc.timestamp.toLocaleString()}
                        </p>
                        <p>
                          <strong>文档哈希:</strong>
                          <code className="hash-display">
                            {doc.hash.substring(0, 16)}
                            ...
                          </code>
                        </p>
                      </div>
                    </div>

                    <div className="document-actions">
                      <button
                        onClick={() => quickVerify(doc)}
                        className="btn-verify-quick"
                      >
                        ✅ 快速验证
                      </button>
                      <button
                        onClick={() => exportSignedDocument(doc)}
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
        <h4>🔒 技术说明:</h4>
        <ul>
          <li>
            <strong>RSA-2048:</strong>
            {' '}
            使用2048位RSA密钥，提供高强度安全保护
          </li>
          <li>
            <strong>SHA-256:</strong>
            {' '}
            使用SHA-256哈希算法确保文档完整性
          </li>
          <li>
            <strong>数字签名:</strong>
            {' '}
            基于公钥密码学的不可否认性保证
          </li>
          <li>
            <strong>完整性验证:</strong>
            {' '}
            任何文档修改都会导致验证失败
          </li>
        </ul>
      </div>
    </div>
  )
}
