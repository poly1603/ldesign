import React, { useState, useRef, useCallback } from 'react'
import { LDesignTree, type LDesignTreeRef, type LDesignTreeProps } from '../src/adapters/react'
import type { TreeNodeData } from '../src/types'

// 示例数据
const sampleData: TreeNodeData[] = [
  {
    id: '1',
    label: '根节点 1',
    children: [
      {
        id: '1-1',
        label: '子节点 1-1',
        children: [
          { id: '1-1-1', label: '叶子节点 1-1-1' },
          { id: '1-1-2', label: '叶子节点 1-1-2' },
        ]
      },
      {
        id: '1-2',
        label: '子节点 1-2',
        children: [
          { id: '1-2-1', label: '叶子节点 1-2-1' },
        ]
      }
    ]
  },
  {
    id: '2',
    label: '根节点 2',
    children: [
      { id: '2-1', label: '子节点 2-1' },
      { id: '2-2', label: '子节点 2-2' },
    ]
  },
  {
    id: '3',
    label: '根节点 3',
    children: [
      {
        id: '3-1',
        label: '子节点 3-1',
        children: [
          { id: '3-1-1', label: '叶子节点 3-1-1' },
          { id: '3-1-2', label: '叶子节点 3-1-2' },
          { id: '3-1-3', label: '叶子节点 3-1-3' },
        ]
      }
    ]
  }
]

const ReactExample: React.FC = () => {
  // 状态管理
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['1', '2'])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [dragTreeData, setDragTreeData] = useState<TreeNodeData[]>(
    JSON.parse(JSON.stringify(sampleData))
  )
  const [dropInfo, setDropInfo] = useState('')
  const [loadInfo, setLoadInfo] = useState('')
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'compact' | 'comfortable'>('light')

  // 异步树数据
  const [asyncTreeData] = useState<TreeNodeData[]>([
    {
      id: 'async-1',
      label: '异步节点 1',
      hasChildren: true
    },
    {
      id: 'async-2',
      label: '异步节点 2',
      hasChildren: true
    }
  ])

  // 组件引用
  const basicTreeRef = useRef<LDesignTreeRef>(null)
  const searchTreeRef = useRef<LDesignTreeRef>(null)
  const dragTreeRef = useRef<LDesignTreeRef>(null)
  const asyncTreeRef = useRef<LDesignTreeRef>(null)

  // 事件处理
  const handleSelect = useCallback((keys: string[]) => {
    setSelectedKeys(keys)
    console.log('选择节点:', keys)
  }, [])

  const handleExpand = useCallback((nodeId: string) => {
    setExpandedKeys(prev => [...prev, nodeId])
    console.log('展开节点:', nodeId)
  }, [])

  const handleCollapse = useCallback((nodeId: string) => {
    setExpandedKeys(prev => prev.filter(id => id !== nodeId))
    console.log('收起节点:', nodeId)
  }, [])

  const handleSearch = useCallback((keyword: string, results: any[]) => {
    setSearchResults(results)
    console.log('搜索结果:', keyword, results)
  }, [])

  const handleDrop = useCallback((data: any) => {
    setDropInfo(`节点 "${data.dragNode.label}" 移动到 "${data.dropNode.label}" ${data.position}`)
    console.log('拖拽完成:', data)
  }, [])

  const handleLoad = useCallback((nodeId: string, data: TreeNodeData[]) => {
    setLoadInfo(`节点 "${nodeId}" 加载了 ${data.length} 个子节点`)
    console.log('异步加载完成:', nodeId, data)
  }, [])

  // 异步加载函数
  const loadChildren = useCallback(async (node: any): Promise<TreeNodeData[]> => {
    // 模拟异步请求
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return [
      {
        id: `${node.id}-1`,
        label: `${node.label} - 子节点 1`
      },
      {
        id: `${node.id}-2`,
        label: `${node.label} - 子节点 2`
      },
      {
        id: `${node.id}-3`,
        label: `${node.label} - 子节点 3`
      }
    ]
  }, [])

  // 控制方法
  const expandAll = useCallback(() => {
    basicTreeRef.current?.expandAll()
  }, [])

  const collapseAll = useCallback(() => {
    basicTreeRef.current?.collapseAll()
  }, [])

  const selectAll = useCallback(() => {
    basicTreeRef.current?.selectAll()
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedKeys([])
    basicTreeRef.current?.unselectAll()
  }, [])

  const clearSearch = useCallback(() => {
    setSearchKeyword('')
    setSearchResults([])
  }, [])

  const resetDragTree = useCallback(() => {
    setDragTreeData(JSON.parse(JSON.stringify(sampleData)))
    setDropInfo('')
  }, [])

  return (
    <div className="react-example">
      <div className="header">
        <h1>LDesign Tree - React 示例</h1>
        <p>在React应用中使用树形组件</p>
      </div>

      <div className="content">
        {/* 基础示例 */}
        <div className="demo-section">
          <h2>基础用法</h2>
          <LDesignTree
            ref={basicTreeRef}
            data={sampleData}
            selectedKeys={selectedKeys}
            expandedKeys={expandedKeys}
            selectionMode="multiple"
            showCheckbox={true}
            onSelect={handleSelect}
            onExpand={handleExpand}
            onCollapse={handleCollapse}
          />
          
          <div className="controls">
            <button onClick={expandAll}>展开全部</button>
            <button onClick={collapseAll}>收起全部</button>
            <button onClick={selectAll}>全选</button>
            <button onClick={clearSelection}>清空选择</button>
          </div>
          
          {selectedKeys.length > 0 && (
            <div className="info">
              已选择: {selectedKeys.join(', ')}
            </div>
          )}
        </div>

        {/* 搜索示例 */}
        <div className="demo-section">
          <h2>搜索功能</h2>
          <div className="search-controls">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索节点..."
              className="search-input"
            />
            <button onClick={clearSearch}>清空搜索</button>
          </div>
          
          <LDesignTree
            ref={searchTreeRef}
            data={sampleData}
            searchKeyword={searchKeyword}
            searchable={true}
            onSearch={handleSearch}
          />
          
          {searchResults.length > 0 && (
            <div className="info">
              搜索 "{searchKeyword}" 找到 {searchResults.length} 个结果
            </div>
          )}
        </div>

        {/* 拖拽示例 */}
        <div className="demo-section">
          <h2>拖拽排序</h2>
          <LDesignTree
            ref={dragTreeRef}
            data={dragTreeData}
            draggable={true}
            onDrop={handleDrop}
          />
          
          <div className="controls">
            <button onClick={resetDragTree}>重置数据</button>
          </div>
          
          {dropInfo && (
            <div className="info">
              {dropInfo}
            </div>
          )}
        </div>

        {/* 异步加载示例 */}
        <div className="demo-section">
          <h2>异步加载</h2>
          <LDesignTree
            ref={asyncTreeRef}
            data={asyncTreeData}
            asyncLoad={loadChildren}
            onLoad={handleLoad}
          />
          
          {loadInfo && (
            <div className="info">
              {loadInfo}
            </div>
          )}
        </div>

        {/* 主题切换示例 */}
        <div className="demo-section">
          <h2>主题切换</h2>
          <div className="theme-controls">
            {(['light', 'dark', 'compact', 'comfortable'] as const).map(theme => (
              <label key={theme}>
                <input
                  type="radio"
                  value={theme}
                  checked={currentTheme === theme}
                  onChange={(e) => setCurrentTheme(e.target.value as any)}
                />
                {theme === 'light' ? '浅色主题' : 
                 theme === 'dark' ? '暗色主题' :
                 theme === 'compact' ? '紧凑主题' : '舒适主题'}
              </label>
            ))}
          </div>
          
          <LDesignTree
            data={sampleData}
            theme={currentTheme}
            selectionMode="single"
          />
        </div>
      </div>

      <style>{`
        .react-example {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 8px;
        }

        .demo-section {
          margin-bottom: 40px;
          padding: 20px;
          border: 1px solid #e8e8e8;
          border-radius: 8px;
          background: white;
        }

        .demo-section h2 {
          margin-top: 0;
          color: #333;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 10px;
        }

        .controls {
          margin: 15px 0;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .search-controls {
          margin-bottom: 15px;
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .theme-controls {
          margin-bottom: 15px;
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .theme-controls label {
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
        }

        button {
          padding: 8px 16px;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        button:hover {
          border-color: #40a9ff;
          color: #40a9ff;
        }

        .search-input {
          padding: 8px 12px;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          width: 200px;
        }

        .info {
          margin-top: 15px;
          padding: 12px;
          background: #f6ffed;
          border: 1px solid #b7eb8f;
          border-radius: 4px;
          color: #52c41a;
        }
      `}</style>
    </div>
  )
}

export default ReactExample
