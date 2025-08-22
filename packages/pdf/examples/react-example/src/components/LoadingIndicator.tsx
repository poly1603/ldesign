/**
 * 加载指示器组件
 * 显示PDF文档加载进度和状态
 */

import type { LoadingIndicatorProps } from '../types'
import React from 'react'
import './LoadingIndicator.css'

/**
 * 加载指示器组件
 */
export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  progress = 0,
  message = '正在加载...',
  showProgress = true,
  size = 'medium',
  className = '',
}) => {
  const progressPercentage = Math.max(0, Math.min(100, progress))

  return (
    <div className={`loading-indicator loading-indicator--${size} ${className}`}>
      {/* 加载动画 */}
      <div className="loading-indicator__animation">
        <div className="loading-indicator__spinner">
          <div className="loading-indicator__spinner-circle"></div>
          <div className="loading-indicator__spinner-circle"></div>
          <div className="loading-indicator__spinner-circle"></div>
        </div>
      </div>

      {/* 加载信息 */}
      <div className="loading-indicator__content">
        <div className="loading-indicator__message">
          {message}
        </div>

        {showProgress && (
          <div className="loading-indicator__progress">
            {/* 进度条 */}
            <div className="loading-indicator__progress-bar">
              <div
                className="loading-indicator__progress-fill"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="loading-indicator__progress-shine"></div>
              </div>
            </div>

            {/* 进度文本 */}
            <div className="loading-indicator__progress-text">
              {progressPercentage.toFixed(0)}
              %
            </div>
          </div>
        )}
      </div>

      {/* 加载阶段指示 */}
      <div className="loading-indicator__stages">
        <div className="loading-indicator__stage-list">
          <div className={`loading-indicator__stage ${
            progressPercentage >= 0 ? 'loading-indicator__stage--active' : ''
          } ${
            progressPercentage >= 25 ? 'loading-indicator__stage--completed' : ''
          }`}
          >
            <div className="loading-indicator__stage-icon">📄</div>
            <div className="loading-indicator__stage-text">解析文档</div>
          </div>

          <div className={`loading-indicator__stage ${
            progressPercentage >= 25 ? 'loading-indicator__stage--active' : ''
          } ${
            progressPercentage >= 50 ? 'loading-indicator__stage--completed' : ''
          }`}
          >
            <div className="loading-indicator__stage-icon">🔧</div>
            <div className="loading-indicator__stage-text">初始化引擎</div>
          </div>

          <div className={`loading-indicator__stage ${
            progressPercentage >= 50 ? 'loading-indicator__stage--active' : ''
          } ${
            progressPercentage >= 75 ? 'loading-indicator__stage--completed' : ''
          }`}
          >
            <div className="loading-indicator__stage-icon">🎨</div>
            <div className="loading-indicator__stage-text">渲染页面</div>
          </div>

          <div className={`loading-indicator__stage ${
            progressPercentage >= 75 ? 'loading-indicator__stage--active' : ''
          } ${
            progressPercentage >= 100 ? 'loading-indicator__stage--completed' : ''
          }`}
          >
            <div className="loading-indicator__stage-icon">✅</div>
            <div className="loading-indicator__stage-text">加载完成</div>
          </div>
        </div>
      </div>

      {/* 取消按钮（可选） */}
      {/*
      <div className="loading-indicator__actions">
        <button
          className="loading-indicator__cancel"
          onClick={onCancel}
        >
          取消加载
        </button>
      </div>
      */}
    </div>
  )
}

/**
 * 简化版加载指示器
 */
export const SimpleLoadingIndicator: React.FC<{
  message?: string
  className?: string
}> = ({ message = '加载中...', className = '' }) => {
  return (
    <div className={`simple-loading-indicator ${className}`}>
      <div className="simple-loading-indicator__spinner">
        <div className="simple-loading-indicator__dot"></div>
        <div className="simple-loading-indicator__dot"></div>
        <div className="simple-loading-indicator__dot"></div>
      </div>
      <div className="simple-loading-indicator__message">
        {message}
      </div>
    </div>
  )
}

/**
 * 骨架屏加载指示器
 */
export const SkeletonLoadingIndicator: React.FC<{
  className?: string
}> = ({ className = '' }) => {
  return (
    <div className={`skeleton-loading-indicator ${className}`}>
      <div className="skeleton-loading-indicator__header">
        <div className="skeleton-loading-indicator__line skeleton-loading-indicator__line--title"></div>
        <div className="skeleton-loading-indicator__line skeleton-loading-indicator__line--subtitle"></div>
      </div>

      <div className="skeleton-loading-indicator__content">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className="skeleton-loading-indicator__line"
            style={{
              width: `${Math.random() * 40 + 60}%`,
              animationDelay: `${index * 0.1}s`,
            }}
          >
          </div>
        ))}
      </div>

      <div className="skeleton-loading-indicator__footer">
        <div className="skeleton-loading-indicator__line skeleton-loading-indicator__line--short"></div>
      </div>
    </div>
  )
}

export default LoadingIndicator
