/**
 * React Word Viewer 示例
 */

import React, { useState, useRef } from 'react';
import { WordViewerComponent, WordViewerRef } from '../../dist/react.esm.js';
import './App.css';

function App() {
  const viewerRef = useRef<WordViewerRef>(null);
  const [file, setFile] = useState<File | null>(null);
  const [zoom, setZoom] = useState(1.0);
  const [editable, setEditable] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const zoomIn = () => {
    setZoom((prev) => Math.min(3.0, prev + 0.1));
  };

  const zoomOut = () => {
    setZoom((prev) => Math.max(0.5, prev - 0.1));
  };

  const toggleEdit = () => {
    setEditable((prev) => !prev);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const exportPDF = async () => {
    try {
      const viewer = viewerRef.current?.getViewer();
      if (viewer) {
        const blob = await viewer.exportToPDF();
        downloadBlob(blob, 'document.pdf');
        showStatus('PDF 导出成功！', false);
      }
    } catch (error) {
      showStatus('导出失败: ' + (error as Error).message, true);
    }
  };

  const exportHTML = () => {
    try {
      const viewer = viewerRef.current?.getViewer();
      if (viewer) {
        const html = viewer.exportToHTML();
        const blob = new Blob([html], { type: 'text/html' });
        downloadBlob(blob, 'document.html');
        showStatus('HTML 导出成功！', false);
      }
    } catch (error) {
      showStatus('导出失败: ' + (error as Error).message, true);
    }
  };

  const search = () => {
    if (!searchKeyword) return;

    const viewer = viewerRef.current?.getViewer();
    if (viewer) {
      const results = viewer.search(searchKeyword);
      showStatus(`找到 ${results.length} 个结果`, false);
      console.log('搜索结果:', results);
    }
  };

  const handleLoaded = (data: any) => {
    showStatus('文档加载成功！', false);
    console.log('文档已加载', data);
  };

  const handleError = (error: any) => {
    showStatus(`加载错误: ${error.message}`, true);
    console.error('错误', error);
  };

  const handleChanged = () => {
    console.log('文档已修改');
  };

  const handleZoom = (level: number) => {
    console.log('缩放级别:', level);
  };

  const handlePageChange = (pageInfo: any) => {
    console.log('页面变化:', pageInfo);
  };

  const showStatus = (message: string, error: boolean) => {
    setStatusMessage(message);
    setIsError(error);
    setTimeout(() => {
      setStatusMessage('');
    }, 3000);
  };

  const downloadBlob = (blob: Blob, filename: string) => {
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
      </header>

      <div className="toolbar">
        <input
          type="file"
          accept=".docx,.doc"
          onChange={handleFileChange}
        />
        <button onClick={zoomIn}>放大 +</button>
        <button onClick={zoomOut}>缩小 -</button>
        <button onClick={toggleEdit}>
          {editable ? '禁用编辑' : '启用编辑'}
        </button>
        <button onClick={toggleTheme}>
          {theme === 'light' ? '深色主题' : '浅色主题'}
        </button>
        <button onClick={exportPDF}>导出 PDF</button>
        <button onClick={exportHTML}>导出 HTML</button>
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && search()}
          placeholder="搜索..."
          className="search-input"
        />
        <button onClick={search}>搜索</button>
      </div>

      {statusMessage && (
        <div className={`status ${isError ? 'error' : ''}`}>
          {statusMessage}
        </div>
      )}

      <WordViewerComponent
        ref={viewerRef}
        source={file}
        zoom={zoom}
        editable={editable}
        theme={theme}
        onLoaded={handleLoaded}
        onError={handleError}
        onChanged={handleChanged}
        onZoom={handleZoom}
        onPageChange={handlePageChange}
        className="viewer"
      />
    </div>
  );
}

export default App;



