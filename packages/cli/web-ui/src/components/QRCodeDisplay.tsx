/**
 * 二维码显示组件
 * 用于在 Web 界面中显示二维码，替换控制台输出的二维码
 */

import React, { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Smartphone, Copy, Check } from 'lucide-react'

interface QRCodeDisplayProps {
  /** 要生成二维码的 URL */
  url: string
  /** 二维码大小 */
  size?: number
  /** 标题 */
  title?: string
  /** 描述 */
  description?: string
  /** 是否显示复制按钮 */
  showCopy?: boolean
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  url,
  size = 200,
  title = '手机扫码访问',
  description = '使用手机扫描二维码快速访问',
  showCopy = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!url || !canvasRef.current) return

    const generateQRCode = async () => {
      try {
        setError(null)
        await QRCode.toCanvas(canvasRef.current!, url, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        })
      } catch (err) {
        console.error('生成二维码失败:', err)
        setError('生成二维码失败')
      }
    }

    generateQRCode()
  }, [url, size])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  if (!url) {
    return null
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
      {/* 标题 */}
      <div className="flex items-center justify-center space-x-2 mb-4">
        <Smartphone className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>

      {/* 描述 */}
      <p className="text-sm text-gray-600 mb-6">{description}</p>

      {/* 二维码 */}
      <div className="flex justify-center mb-6">
        {error ? (
          <div className="flex items-center justify-center w-48 h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <div className="text-red-500 text-sm font-medium">二维码生成失败</div>
              <div className="text-gray-500 text-xs mt-1">{error}</div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <canvas
              ref={canvasRef}
              className="block"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        )}
      </div>

      {/* URL 显示和复制 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500 mb-1">访问地址</p>
            <p className="text-sm font-mono text-gray-900 truncate">{url}</p>
          </div>
          {showCopy && (
            <button
              onClick={handleCopy}
              className="ml-3 flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              title="复制链接"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>复制</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 提示信息 */}
      <div className="mt-4 text-xs text-gray-500">
        <p>• 确保手机和电脑在同一网络下</p>
        <p>• 使用手机浏览器或微信扫一扫功能</p>
      </div>
    </div>
  )
}

export default QRCodeDisplay
