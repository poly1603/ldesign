/**
 * PDF控制面板组件
 * 提供页面导航、缩放控制等功能
 */

import type { PdfControlsProps } from '../types'
import React, { useState } from 'react'
import './PdfControls.css'

/**
 * PDF控制面板组件
 */
export const PdfControls: React.FC<PdfControlsProps> = ({
  currentPage,
  totalPages,
  zoomLevel,
  onPreviousPage,
  onNextPage,
  onGoToPage,
  onZoomIn,
  onZoomOut,
  onSetZoom,
  onFitWidth,
  className = '',
  disabled = false,
}) => {
  const [pageInput, setPageInput] = useState('')
  const [zoomInput, setZoomInput] = useState('')

  // 处理页面跳转
  const handleGoToPage = () => {
    const page = Number.parseInt(pageInput, 10)
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onGoToPage(page)
      setPageInput('')
    }
  }

  // 处理缩放设置
  const handleSetZoom = () => {
    const zoom = Number.parseFloat(zoomInput) / 100
    if (!isNaN(zoom) && zoom >= 0.25 && zoom <= 3.0) {
      onSetZoom(zoom)
      setZoomInput('')
    }
  }

  // 预设缩放级别
  const presetZooms = [25, 50, 75, 100, 125, 150, 200]

  return (
    <div className={`pdf-controls ${className}`}>
      {/* 页面导航控制 */}
      <div className="pdf-controls__section">
        <div className="pdf-controls__group">
          <button
            onClick={onPreviousPage}
            disabled={disabled || currentPage <= 1}
            className="pdf-controls__button pdf-controls__button--nav"
            title="上一页 (←)"
          >
            ←
          </button>

          <div className="pdf-controls__page-info">
            <span className="pdf-controls__current-page">
              {currentPage}
            </span>
            <span className="pdf-controls__separator">/</span>
            <span className="pdf-controls__total-pages">
              {totalPages}
            </span>
          </div>

          <button
            onClick={onNextPage}
            disabled={disabled || currentPage >= totalPages}
            className="pdf-controls__button pdf-controls__button--nav"
            title="下一页 (→)"
          >
            →
          </button>
        </div>

        {/* 页面跳转 */}
        <div className="pdf-controls__group">
          <input
            type="number"
            min="1"
            max={totalPages}
            value={pageInput}
            onChange={e => setPageInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleGoToPage()
              }
            }}
            placeholder="页码"
            className="pdf-controls__input pdf-controls__page-input"
            disabled={disabled}
          />
          <button
            onClick={handleGoToPage}
            disabled={disabled || !pageInput.trim()}
            className="pdf-controls__button pdf-controls__button--action"
            title="跳转到指定页面"
          >
            跳转
          </button>
        </div>
      </div>

      {/* 缩放控制 */}
      <div className="pdf-controls__section">
        <div className="pdf-controls__group">
          <button
            onClick={onZoomOut}
            disabled={disabled || zoomLevel <= 0.25}
            className="pdf-controls__button pdf-controls__button--zoom"
            title="缩小 (Ctrl + -)"
          >
            −
          </button>

          <div className="pdf-controls__zoom-info">
            {Math.round(zoomLevel * 100)}
            %
          </div>

          <button
            onClick={onZoomIn}
            disabled={disabled || zoomLevel >= 3.0}
            className="pdf-controls__button pdf-controls__button--zoom"
            title="放大 (Ctrl + +)"
          >
            +
          </button>
        </div>

        {/* 预设缩放 */}
        <div className="pdf-controls__group">
          <select
            value={Math.round(zoomLevel * 100)}
            onChange={(e) => {
              const zoom = Number.parseInt(e.target.value, 10) / 100
              onSetZoom(zoom)
            }}
            className="pdf-controls__select pdf-controls__zoom-select"
            disabled={disabled}
          >
            {presetZooms.map(zoom => (
              <option key={zoom} value={zoom}>
                {zoom}
                %
              </option>
            ))}
          </select>
        </div>

        {/* 自定义缩放 */}
        <div className="pdf-controls__group">
          <input
            type="number"
            min="25"
            max="300"
            step="25"
            value={zoomInput}
            onChange={e => setZoomInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSetZoom()
              }
            }}
            placeholder="缩放%"
            className="pdf-controls__input pdf-controls__zoom-input"
            disabled={disabled}
          />
          <button
            onClick={handleSetZoom}
            disabled={disabled || !zoomInput.trim()}
            className="pdf-controls__button pdf-controls__button--action"
            title="设置自定义缩放"
          >
            设置
          </button>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="pdf-controls__section">
        <div className="pdf-controls__group">
          <button
            onClick={onFitWidth}
            disabled={disabled}
            className="pdf-controls__button pdf-controls__button--fit"
            title="适应宽度 (Ctrl + F)"
          >
            适应宽度
          </button>

          <button
            onClick={() => onSetZoom(1.0)}
            disabled={disabled}
            className="pdf-controls__button pdf-controls__button--fit"
            title="实际大小 (Ctrl + 0)"
          >
            实际大小
          </button>
        </div>
      </div>

      {/* 键盘快捷键提示 */}
      <div className="pdf-controls__shortcuts">
        <details className="pdf-controls__shortcuts-details">
          <summary className="pdf-controls__shortcuts-summary">
            快捷键
          </summary>
          <div className="pdf-controls__shortcuts-content">
            <div className="pdf-controls__shortcut">
              <kbd>←</kbd>
              {' '}
              /
              <kbd>PageUp</kbd>
              {' '}
              - 上一页
            </div>
            <div className="pdf-controls__shortcut">
              <kbd>→</kbd>
              {' '}
              /
              <kbd>PageDown</kbd>
              {' '}
              - 下一页
            </div>
            <div className="pdf-controls__shortcut">
              <kbd>Ctrl</kbd>
              {' '}
              +
              <kbd>+</kbd>
              {' '}
              - 放大
            </div>
            <div className="pdf-controls__shortcut">
              <kbd>Ctrl</kbd>
              {' '}
              +
              <kbd>-</kbd>
              {' '}
              - 缩小
            </div>
            <div className="pdf-controls__shortcut">
              <kbd>Ctrl</kbd>
              {' '}
              +
              <kbd>0</kbd>
              {' '}
              - 实际大小
            </div>
            <div className="pdf-controls__shortcut">
              <kbd>Ctrl</kbd>
              {' '}
              +
              <kbd>F</kbd>
              {' '}
              - 适应宽度
            </div>
          </div>
        </details>
      </div>
    </div>
  )
}

export default PdfControls
