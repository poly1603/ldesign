/**
 * 错误边界组件
 * 捕获和处理React组件树中的JavaScript错误
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorBoundaryProps } from '../types';
import './ErrorBoundary.css';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

/**
 * 错误边界组件
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // 更新状态以显示错误UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误信息
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // 调用错误回调
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 发送错误报告（可选）
    this.reportError(error, errorInfo);
  }

  /**
   * 报告错误到监控服务
   */
  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // 这里可以集成错误监控服务，如Sentry、Bugsnag等
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        errorId: this.state.errorId
      };

      // 示例：发送到监控服务
      // sendErrorReport(errorReport);
      
      console.log('Error report:', errorReport);
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  };

  /**
   * 重置错误状态
   */
  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  /**
   * 重新加载页面
   */
  private handleReload = () => {
    window.location.reload();
  };

  /**
   * 复制错误信息
   */
  private handleCopyError = async () => {
    if (!this.state.error) return;

    const errorText = `
错误ID: ${this.state.errorId}
时间: ${new Date().toLocaleString()}
错误信息: ${this.state.error.message}
错误堆栈:
${this.state.error.stack}
组件堆栈:
${this.state.errorInfo?.componentStack}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorText);
      alert('错误信息已复制到剪贴板');
    } catch (err) {
      console.error('Failed to copy error info:', err);
      // 降级方案：创建文本区域并选择
      const textArea = document.createElement('textarea');
      textArea.value = errorText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('错误信息已复制到剪贴板');
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // 自定义错误UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      // 默认错误UI
      return (
        <div className="error-boundary">
          <div className="error-boundary__container">
            <div className="error-boundary__icon">
              ⚠️
            </div>
            
            <div className="error-boundary__content">
              <h2 className="error-boundary__title">
                {this.props.title || '出现了一个错误'}
              </h2>
              
              <p className="error-boundary__message">
                {this.props.message || '很抱歉，应用程序遇到了一个意外错误。请尝试刷新页面或联系技术支持。'}
              </p>

              {this.state.error && (
                <details className="error-boundary__details">
                  <summary className="error-boundary__details-summary">
                    错误详情
                  </summary>
                  <div className="error-boundary__error-info">
                    <div className="error-boundary__error-id">
                      <strong>错误ID:</strong> {this.state.errorId}
                    </div>
                    <div className="error-boundary__error-message">
                      <strong>错误信息:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div className="error-boundary__error-stack">
                        <strong>错误堆栈:</strong>
                        <pre className="error-boundary__stack-trace">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo?.componentStack && (
                      <div className="error-boundary__component-stack">
                        <strong>组件堆栈:</strong>
                        <pre className="error-boundary__stack-trace">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
            
            <div className="error-boundary__actions">
              <button 
                onClick={this.handleReset}
                className="error-boundary__button error-boundary__button--primary"
              >
                重试
              </button>
              
              <button 
                onClick={this.handleReload}
                className="error-boundary__button error-boundary__button--secondary"
              >
                刷新页面
              </button>
              
              {this.state.error && (
                <button 
                  onClick={this.handleCopyError}
                  className="error-boundary__button error-boundary__button--tertiary"
                >
                  复制错误信息
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 高阶组件：为组件添加错误边界
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Hook：在函数组件中使用错误边界
 */
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    
    // 这里可以添加错误报告逻辑
    // 或者抛出错误让上层ErrorBoundary捕获
    throw error;
  };
}

export default ErrorBoundary;