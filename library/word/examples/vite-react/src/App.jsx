import React, { useState, useRef, useEffect } from 'react';
import { WordViewer } from '@word-viewer/core';
import './App.css';

function App() {
  const viewerContainer = useRef(null);
  const fileInputRef = useRef(null);
  const [viewer, setViewer] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('info');
  const [currentTheme, setCurrentTheme] = useState('light');
  const [currentZoom, setCurrentZoom] = useState(1.0);
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [docInfo, setDocInfo] = useState({
    title: '未加载',
    author: '',
    wordCount: 0,
  });
  const [pageInfo, setPageInfo] = useState({
    current: 0,
    total: 0,
  });

  // 初始化查看器
  useEffect(() => {
    if (viewerContainer.current && !viewer) {
      try {
        const newViewer = new WordViewer(viewerContainer.current, {
          theme: currentTheme,
          editable: false,
          showToolbar: false,
        });

        // 绑定事件
        newViewer.on('loaded', handleLoaded);
        newViewer.on('error', handleError);
        newViewer.on('progress', handleProgress);
        newViewer.on('changed', handleChanged);
        newViewer.on('zoom', handleZoom);

        setViewer(newViewer);
        showStatus('✅ 查看器初始化成功！', 'success');
      } catch (error) {
        showStatus(`❌ 初始化失败: ${error.message}`, 'error');
        console.error('初始化错误', error);
      }
    }

    return () => {
      if (viewer) {
        viewer.destroy();
      }
    };
  }, []);

  // 事件处理函数
  const handleLoaded = (data) => {
    showStatus('✅ 文档加载成功！', 'success');
    updateDocInfo();
    console.log('文档已加载', data);
  };

  const handleError = (error) => {
    showStatus(`❌ 错误: ${error.message}`, 'error');
    console.error('错误', error);
  };

  const handleProgress = (progress) => {
    showStatus(`⏳ 加载中... ${progress.percentage}%`, 'info');
  };

  const handleChanged = () => {
    showStatus('📝 文档已修改', 'info');
    setIsDirty(true);
    console.log('文档已修改');
  };

  const handleZoom = (level) => {
    setCurrentZoom(level);
    showStatus(`🔍 缩放: ${Math.round(level * 100)}%`, 'info');
  };

  // 更新文档信息
  const updateDocInfo = () => {
    if (!viewer) return;

    const info = viewer.getDocumentInfo();
    const pInfo = viewer.getPageInfo();
    const editState = viewer.getEditState();

    if (info) {
      setDocInfo({
        title: info.title || '未知',
        author: info.author || '未知',
        wordCount: info.wordCount || 0,
      });
    }

    setPageInfo({
      current: pInfo.current,
      total: pInfo.total,
    });

    setIsEditing(editState.isEditing);
    setIsDirty(editState.isDirty);
  };

  // 文件选择
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file && viewer) {
      viewer.loadFile(file).catch(error => {
        console.error('加载失败', error);
      });
    }
  };

  // 工具栏功能
  const zoomIn = () => {
    if (viewer) {
      viewer.setZoom(viewer.getZoom() + 0.1);
    }
  };

  const zoomOut = () => {
    if (viewer) {
      viewer.setZoom(viewer.getZoom() - 0.1);
    }
  };

  const toggleEdit = () => {
    if (!viewer) return;

    const state = viewer.getEditState();
    if (state.isEditing) {
      viewer.disableEdit();
      setIsEditing(false);
      showStatus('📖 已切换到查看模式', 'info');
    } else {
      viewer.enableEdit();
      setIsEditing(true);
      showStatus('✏️ 已切换到编辑模式', 'info');
    }
    updateDocInfo();
  };

  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    if (viewer) {
      viewer.updateOptions({ theme: newTheme });
      showStatus(
        `🌓 已切换到${newTheme === 'light' ? '浅色' : '深色'}主题`,
        'info'
      );
    }
  };

  const exportPDF = async () => {
    if (!viewer) return;

    try {
      showStatus('⏳ 正在导出 PDF...', 'info');
      const blob = await viewer.exportToPDF();
      downloadBlob(blob, 'document.pdf');
      showStatus('✅ PDF 导出成功！', 'success');
    } catch (error) {
      showStatus(`❌ 导出失败: ${error.message}`, 'error');
    }
  };

  const exportHTML = () => {
    if (!viewer) return;

    try {
      const html = viewer.exportToHTML();
      const blob = new Blob([html], { type: 'text/html' });
      downloadBlob(blob, 'document.html');
      showStatus('✅ HTML 导出成功！', 'success');
    } catch (error) {
      showStatus(`❌ 导出失败: ${error.message}`, 'error');
    }
  };

  const search = () => {
    if (!searchKeyword || !viewer) return;

    const results = viewer.search(searchKeyword);
    showStatus(`🔍 找到 ${results.length} 个结果`, 'success');
    console.log('搜索结果:', results);
  };

  // 工具函数
  const showStatus = (message, type = 'info') => {
    setStatusMessage(message);
    setStatusType(type);
    setTimeout(() => {
      setStatusMessage('');
    }, 3000);
  };

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>📄 Word Viewer - React 示例</h1>
        <p>使用 React Hooks 的实现</p>
      </header>

      <div className="toolbar">
        <div className="file-input-wrapper">
          <input
            type="file"
            id="fileInput"
            accept=".docx,.doc"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          <label htmlFor="fileInput" className="btn btn-primary">📁 选择文档</label>
        </div>
        <button onClick={zoomIn} className="btn">🔍 放大</button>
        <button onClick={zoomOut} className="btn">🔎 缩小</button>
        <button onClick={toggleEdit} className="btn">
          {isEditing ? '📖 查看模式' : '✏️ 编辑模式'}
        </button>
        <button onClick={toggleTheme} className="btn">
          🌓 {currentTheme === 'light' ? '深色' : '浅色'}主题
        </button>
        <button onClick={exportPDF} className="btn">📥 导出 PDF</button>
        <button onClick={exportHTML} className="btn">📄 导出 HTML</button>
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && search()}
          placeholder="搜索文本..."
          className="search-input"
        />
        <button onClick={search} className="btn">🔍 搜索</button>
      </div>

      {statusMessage && (
        <div className={`status ${statusType} show`}>
          {statusMessage}
        </div>
      )}

      <div className="viewer-wrapper">
        <div ref={viewerContainer} className="viewer-container"></div>
      </div>

      <div className="info-panel">
        <h3>文档信息</h3>
        <div className="info-content">
          <p><strong>标题:</strong> {docInfo.title}</p>
          <p><strong>作者:</strong> {docInfo.author}</p>
          <p><strong>页数:</strong> {pageInfo.total}</p>
          <p><strong>当前页:</strong> {pageInfo.current}</p>
          <p><strong>字数:</strong> {docInfo.wordCount}</p>
          <p><strong>编辑中:</strong> {isEditing ? '是' : '否'}</p>
          <p><strong>已修改:</strong> {isDirty ? '是' : '否'}</p>
          <p><strong>缩放:</strong> {Math.round(currentZoom * 100)}%</p>
        </div>
      </div>
    </div>
  );
}

export default App;

