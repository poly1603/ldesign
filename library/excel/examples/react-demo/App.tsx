import React, { useRef, useState } from 'react';
import { ExcelViewer } from '@ldesign/excel-viewer-react';
import type { ExcelViewerRef, SearchResult } from '@ldesign/excel-viewer-react';
import './App.css';

function App() {
  const viewerRef = useRef<ExcelViewerRef>(null);
  const [currentFile, setCurrentFile] = useState<File | ArrayBuffer | string>();
  const [status, setStatus] = useState('等待加载文件...');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // 处理文件选择
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCurrentFile(file);
      setStatus('⏳ 正在加载文件...');
    }
  };

  // 加载示例文件
  const loadSampleFile = () => {
    alert('请提供示例文件 URL');
  };

  // 导出为 Excel
  const exportToExcel = () => {
    if (!viewerRef.current) return;
    
    viewerRef.current.downloadFile({
      format: 'xlsx',
      filename: 'export.xlsx',
      includeStyles: true,
      includeFormulas: true,
    });
    setStatus('✅ Excel 文件已下载');
  };

  // 导出为 CSV
  const exportToCSV = () => {
    if (!viewerRef.current) return;
    
    viewerRef.current.downloadFile({
      format: 'csv',
      filename: 'export.csv',
    });
    setStatus('✅ CSV 文件已下载');
  };

  // 导出截图
  const exportScreenshot = () => {
    setStatus('📸 截图功能开发中...');
  };

  // 搜索内容
  const searchContent = () => {
    if (!viewerRef.current || !searchKeyword) {
      alert('请输入搜索关键词');
      return;
    }

    const results = viewerRef.current.search({
      keyword: searchKeyword,
      caseSensitive: false,
      matchWholeWord: false,
    });
    
    setSearchResults(results);
    setStatus(`🔍 找到 ${results.length} 个匹配项`);
  };

  // 加载完成
  const handleLoad = (data: any) => {
    setStatus(`✅ 成功加载 ${data.sheets?.length || 0} 个工作表`);
  };

  // 加载错误
  const handleLoadError = (error: any) => {
    setStatus(`❌ 加载失败: ${error.message}`);
  };

  // 单元格点击
  const handleCellClick = (data: any) => {
    console.log('单元格点击:', data);
  };

  // 单元格变化
  const handleCellChange = (data: any) => {
    console.log('单元格变化:', data);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>📊 Excel Viewer - React 示例</h1>
        <p>功能强大的 Excel 文件预览编辑插件</p>
      </header>

      <div className="container">
        <div className="toolbar">
          <label htmlFor="file-input" className="file-label">
            📁 选择 Excel 文件
            <input
              type="file"
              id="file-input"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>
          
          <button className="btn btn-primary" onClick={loadSampleFile}>
            📄 加载示例文件
          </button>
          <button className="btn btn-secondary" onClick={exportToExcel}>
            💾 导出 Excel
          </button>
          <button className="btn btn-secondary" onClick={exportToCSV}>
            📋 导出 CSV
          </button>
          <button className="btn btn-info" onClick={exportScreenshot}>
            📸 导出截图
          </button>
          
          <div className="search-box">
            <input
              type="text"
              placeholder="搜索内容..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && searchContent()}
            />
            <button className="btn btn-info" onClick={searchContent}>
              🔍 搜索
            </button>
          </div>
        </div>

        <div className="viewer-container">
          <ExcelViewer
            ref={viewerRef}
            file={currentFile}
            showToolbar={true}
            showFormulaBar={true}
            showSheetTabs={true}
            allowEdit={true}
            lang="zh"
            theme="light"
            height="700px"
            onLoad={handleLoad}
            onLoadError={handleLoadError}
            onCellClick={handleCellClick}
            onCellChange={handleCellChange}
          />
        </div>

        <div className="status">{status}</div>

        {searchResults.length > 0 && (
          <div className="search-results">
            <h3>搜索结果 ({searchResults.length} 个匹配项)</h3>
            <ul>
              {searchResults.map((result, index) => (
                <li key={index}>
                  工作表: {result.sheetName} | 
                  位置: 行{result.row + 1}, 列{result.col + 1} | 
                  值: {result.value}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;


