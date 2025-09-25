import React, { useState, useEffect } from 'react'
import { Folder, File, Edit, Save, X } from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

interface FileInfo {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  modified?: string
  extension?: string
}

const Files: React.FC = () => {
  const [files, setFiles] = useState<FileInfo[]>([])
  const [currentPath, setCurrentPath] = useState('.')
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadFiles(currentPath)
  }, [currentPath])

  const loadFiles = async (path: string) => {
    try {
      setLoading(true)
      const data = await api.listFiles(path)
      setFiles(data)
    } catch (error) {
      toast.error(`加载文件列表失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleFileClick = async (file: FileInfo) => {
    if (file.type === 'directory') {
      setCurrentPath(file.path)
      setSelectedFile(null)
      setFileContent('')
    } else {
      try {
        setSelectedFile(file.path)
        const data = await api.readFile(file.path)
        setFileContent(data.content || '')
        setIsEditing(false)
      } catch (error) {
        toast.error(`读取文件失败: ${error instanceof Error ? error.message : '未知错误'}`)
      }
    }
  }

  const handleSaveFile = async () => {
    if (!selectedFile) return

    try {
      await api.writeFile(selectedFile, fileContent)
      toast.success('文件保存成功')
      setIsEditing(false)
    } catch (error) {
      toast.error(`保存文件失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  const navigateUp = () => {
    if (currentPath !== '.') {
      const parentPath = currentPath.split('/').slice(0, -1).join('/') || '.'
      setCurrentPath(parentPath)
    }
  }

  const formatFileSize = (size?: number) => {
    if (!size) return '-'
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* 文件浏览器 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">文件浏览器</h2>
          <div className="text-sm text-gray-500">
            当前路径: {currentPath}
          </div>
        </div>

        {/* 导航 */}
        {currentPath !== '.' && (
          <button
            onClick={navigateUp}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <Folder className="h-4 w-4 mr-1" />
            .. (上级目录)
          </button>
        )}

        {/* 文件列表 */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-2">加载中...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              目录为空
            </div>
          ) : (
            files.map((file) => (
              <div
                key={file.path}
                onClick={() => handleFileClick(file)}
                className={`
                  flex items-center justify-between p-3 rounded-lg cursor-pointer
                  hover:bg-gray-50 transition-colors
                  ${selectedFile === file.path ? 'bg-blue-50 border border-blue-200' : 'border border-transparent'}
                `}
              >
                <div className="flex items-center space-x-3">
                  {file.type === 'directory' ? (
                    <Folder className="h-5 w-5 text-blue-500" />
                  ) : (
                    <File className="h-5 w-5 text-gray-500" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">{file.name}</div>
                    {file.type === 'file' && (
                      <div className="text-sm text-gray-500">
                        {formatFileSize(file.size)}
                      </div>
                    )}
                  </div>
                </div>
                
                {file.extension && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {file.extension}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 文件编辑器 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">文件编辑器</h2>
          {selectedFile && (
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveFile}
                    className="flex items-center text-green-600 hover:text-green-800"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    保存
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center text-gray-600 hover:text-gray-800"
                  >
                    <X className="h-4 w-4 mr-1" />
                    取消
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  编辑
                </button>
              )}
            </div>
          )}
        </div>

        {selectedFile ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-500">
              文件: {selectedFile}
            </div>
            
            <textarea
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              readOnly={!isEditing}
              className={`
                w-full h-96 p-4 border rounded-lg font-mono text-sm
                ${isEditing 
                  ? 'border-blue-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
                  : 'border-gray-300 bg-gray-50'
                }
              `}
              placeholder="选择文件以查看内容..."
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-96 text-gray-500">
            <div className="text-center">
              <File className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>选择文件以查看或编辑内容</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Files
