/**
 * PDF查看器React组件
 * 提供完整的PDF查看功能和用户界面
 */

import React, { useRef, useEffect, useState } from 'react';
import { usePdfViewer } from '../hooks/usePdfViewer';
import { PdfViewerProps, SearchResult } from '../types';
import { PdfControls } from './PdfControls';
import { LoadingIndicator } from './LoadingIndicator';
import { ErrorBoundary } from './ErrorBoundary';
import './PdfViewer.css';

/**
 * PDF查看器主组件
 */
export const PdfViewer: React.FC<PdfViewerProps> = ({
  src,
  config = {},
  className = '',
  style = {},
  onPageChange,
  onZoomChange,
  onError,
  onLoadSuccess,
  onLoadStart,
  showControls = true,
  showToolbar = true,
  enableSearch = true,
  enableThumbnails = false,
  theme = 'light'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // 使用PDF查看器Hook
  const {
    state,
    loadPdf,
    nextPage,
    previousPage,
    goToPage,
    zoomIn,
    zoomOut,
    setZoom,
    fitWidth,
    search,
    setConfig,
    reset,
    setContainer
  } = usePdfViewer({
    config,
    onPageChange: (page) => {
      onPageChange?.(page);
    },
    onZoomChange: (zoom) => {
      onZoomChange?.(zoom);
    },
    onError: (error) => {
      onError?.(error);
    }
  });

  // 设置容器引用
  useEffect(() => {
    if (containerRef.current) {
      setContainer(containerRef.current);
    }
  }, [setContainer]);

  // 加载PDF文档
  useEffect(() => {
    if (src) {
      onLoadStart?.();
      loadPdf(src)
        .then(() => {
          onLoadSuccess?.({
            totalPages: state.totalPages,
            source: src
          });
        })
        .catch((error) => {
          console.error('Failed to load PDF:', error);
        });
    }
  }, [src, loadPdf, onLoadStart, onLoadSuccess, state.totalPages]);

  // 搜索处理
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchQuery(query);

    try {
      const results = await search(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // 跳转到搜索结果
  const goToSearchResult = (result: SearchResult) => {
    goToPage(result.pageNumber);
  };

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!state.isDocumentLoaded) return;

      switch (event.key) {
        case 'ArrowLeft':
        case 'PageUp':
          event.preventDefault();
          previousPage();
          break;
        case 'ArrowRight':
        case 'PageDown':
          event.preventDefault();
          nextPage();
          break;
        case '+':
        case '=':
          if (event.ctrlKey) {
            event.preventDefault();
            zoomIn();
          }
          break;
        case '-':
          if (event.ctrlKey) {
            event.preventDefault();
            zoomOut();
          }
          break;
        case '0':
          if (event.ctrlKey) {
            event.preventDefault();
            setZoom(1.0);
          }
          break;
        case 'f':
          if (event.ctrlKey) {
            event.preventDefault();
            fitWidth();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.isDocumentLoaded, previousPage, nextPage, zoomIn, zoomOut, setZoom, fitWidth]);

  return (
    <ErrorBoundary>
      <div 
        className={`pdf-viewer ${theme} ${className}`}
        style={style}
        data-testid="pdf-viewer"
      >
        {/* 工具栏 */}
        {showToolbar && (
          <div className="pdf-viewer__toolbar">
            <div className="pdf-viewer__toolbar-left">
              <h3 className="pdf-viewer__title">
                PDF查看器
                {state.isDocumentLoaded && (
                  <span className="pdf-viewer__page-info">
                    ({state.currentPage} / {state.totalPages})
                  </span>
                )}
              </h3>
            </div>
            
            <div className="pdf-viewer__toolbar-center">
              {enableSearch && state.isDocumentLoaded && (
                <div className="pdf-viewer__search">
                  <input
                    type="text"
                    placeholder="搜索文档..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch(searchQuery);
                      }
                    }}
                    className="pdf-viewer__search-input"
                    disabled={isSearching}
                  />
                  <button
                    onClick={() => handleSearch(searchQuery)}
                    disabled={isSearching || !searchQuery.trim()}
                    className="pdf-viewer__search-button"
                  >
                    {isSearching ? '搜索中...' : '搜索'}
                  </button>
                </div>
              )}
            </div>
            
            <div className="pdf-viewer__toolbar-right">
              <div className="pdf-viewer__zoom-info">
                {Math.round(state.zoomLevel * 100)}%
              </div>
            </div>
          </div>
        )}

        {/* 主要内容区域 */}
        <div className="pdf-viewer__content">
          {/* 侧边栏 - 搜索结果 */}
          {enableSearch && searchResults.length > 0 && (
            <div className="pdf-viewer__sidebar">
              <div className="pdf-viewer__search-results">
                <h4>搜索结果 ({searchResults.length})</h4>
                <div className="pdf-viewer__search-list">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="pdf-viewer__search-item"
                      onClick={() => goToSearchResult(result)}
                    >
                      <div className="pdf-viewer__search-page">
                        第 {result.pageNumber} 页
                      </div>
                      <div className="pdf-viewer__search-text">
                        {result.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PDF显示区域 */}
          <div className="pdf-viewer__main">
            {/* 控制面板 */}
            {showControls && state.isDocumentLoaded && (
              <PdfControls
                currentPage={state.currentPage}
                totalPages={state.totalPages}
                zoomLevel={state.zoomLevel}
                onPreviousPage={previousPage}
                onNextPage={nextPage}
                onGoToPage={goToPage}
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
                onSetZoom={setZoom}
                onFitWidth={fitWidth}
                className="pdf-viewer__controls"
              />
            )}

            {/* PDF容器 */}
            <div className="pdf-viewer__container">
              {state.isLoading && (
                <LoadingIndicator 
                  progress={state.loadProgress}
                  message="正在加载PDF文档..."
                />
              )}
              
              {state.error && (
                <div className="pdf-viewer__error">
                  <div className="pdf-viewer__error-icon">⚠️</div>
                  <div className="pdf-viewer__error-message">
                    <h4>加载失败</h4>
                    <p>{state.error.message}</p>
                    <button 
                      onClick={reset}
                      className="pdf-viewer__error-retry"
                    >
                      重试
                    </button>
                  </div>
                </div>
              )}
              
              {!state.isLoading && !state.error && !state.isDocumentLoaded && (
                <div className="pdf-viewer__placeholder">
                  <div className="pdf-viewer__placeholder-icon">📄</div>
                  <div className="pdf-viewer__placeholder-text">
                    请选择PDF文档
                  </div>
                </div>
              )}
              
              <div 
                ref={containerRef}
                className="pdf-viewer__document"
                style={{
                  display: state.isDocumentLoaded && !state.isLoading ? 'block' : 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* 状态栏 */}
        <div className="pdf-viewer__status">
          <div className="pdf-viewer__status-left">
            {state.isDocumentLoaded && (
              <span>
                第 {state.currentPage} 页，共 {state.totalPages} 页
              </span>
            )}
          </div>
          
          <div className="pdf-viewer__status-right">
            {state.isLoading && (
              <span>加载进度: {state.loadProgress}%</span>
            )}
            {searchResults.length > 0 && (
              <span>找到 {searchResults.length} 个搜索结果</span>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default PdfViewer;