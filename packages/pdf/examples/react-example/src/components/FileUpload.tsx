/**
 * 文件上传组件
 * 提供拖拽上传和文件选择功能
 */

import React, { useRef, useState, useCallback } from 'react';
import { FileUploadProps } from '../types';
import './FileUpload.css';

/**
 * 文件上传组件
 */
export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onError,
  accept = '.pdf',
  maxSize = 50 * 1024 * 1024, // 50MB
  multiple = false,
  disabled = false,
  className = '',
  dragText = '拖拽PDF文件到此处',
  browseText = '或点击选择文件',
  uploadingText = '正在上传...',
  children
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  /**
   * 验证文件
   */
  const validateFile = useCallback((file: File): boolean => {
    // 检查文件类型
    if (accept && !accept.split(',').some(type => {
      const trimmedType = type.trim();
      if (trimmedType.startsWith('.')) {
        return file.name.toLowerCase().endsWith(trimmedType.toLowerCase());
      }
      return file.type.match(new RegExp(trimmedType.replace('*', '.*')));
    })) {
      onError?.(new Error(`不支持的文件类型。支持的类型: ${accept}`));
      return false;
    }

    // 检查文件大小
    if (maxSize && file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      onError?.(new Error(`文件大小超过限制。最大允许: ${maxSizeMB}MB`));
      return false;
    }

    return true;
  }, [accept, maxSize, onError]);

  /**
   * 处理文件选择
   */
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    if (!multiple && fileArray.length > 1) {
      onError?.(new Error('只能选择一个文件'));
      return;
    }

    const validFiles = fileArray.filter(validateFile);
    
    if (validFiles.length === 0) {
      return;
    }

    setIsUploading(true);
    
    try {
      for (const file of validFiles) {
        await onFileSelect(file);
      }
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('文件处理失败'));
    } finally {
      setIsUploading(false);
    }
  }, [multiple, validateFile, onFileSelect, onError]);

  /**
   * 处理文件输入变化
   */
  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // 清空输入值，允许重复选择同一文件
    event.target.value = '';
  }, [handleFiles]);

  /**
   * 处理拖拽进入
   */
  const handleDragEnter = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setDragCounter(prev => prev + 1);
    
    if (event.dataTransfer.items && event.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  /**
   * 处理拖拽离开
   */
  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setDragCounter(prev => {
      const newCounter = prev - 1;
      if (newCounter === 0) {
        setIsDragOver(false);
      }
      return newCounter;
    });
  }, []);

  /**
   * 处理拖拽悬停
   */
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  /**
   * 处理文件放置
   */
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setIsDragOver(false);
    setDragCounter(0);
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  /**
   * 打开文件选择对话框
   */
  const handleClick = useCallback(() => {
    if (!disabled && !isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled, isUploading]);

  /**
   * 格式化文件大小
   */
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const containerClasses = [
    'file-upload',
    isDragOver ? 'file-upload--drag-over' : '',
    isUploading ? 'file-upload--uploading' : '',
    disabled ? 'file-upload--disabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={containerClasses}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInputChange}
        disabled={disabled || isUploading}
        className="file-upload__input"
        aria-label="选择文件"
      />
      
      <div className="file-upload__content">
        {children ? (
          children
        ) : (
          <>
            <div className="file-upload__icon">
              {isUploading ? (
                <div className="file-upload__spinner">
                  <div className="file-upload__spinner-circle"></div>
                </div>
              ) : (
                <svg 
                  className="file-upload__upload-icon" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7,10 12,15 17,10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              )}
            </div>
            
            <div className="file-upload__text">
              <div className="file-upload__primary-text">
                {isUploading ? uploadingText : dragText}
              </div>
              {!isUploading && (
                <div className="file-upload__secondary-text">
                  {browseText}
                </div>
              )}
            </div>
            
            {!isUploading && (
              <div className="file-upload__info">
                <div className="file-upload__accepted-types">
                  支持格式: {accept}
                </div>
                {maxSize && (
                  <div className="file-upload__max-size">
                    最大大小: {formatFileSize(maxSize)}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      
      {isDragOver && (
        <div className="file-upload__overlay">
          <div className="file-upload__overlay-content">
            <div className="file-upload__overlay-icon">📄</div>
            <div className="file-upload__overlay-text">
              释放以上传文件
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 简化版文件上传组件
 */
export const SimpleFileUpload: React.FC<{
  onFileSelect: (file: File) => void;
  className?: string;
}> = ({ onFileSelect, className = '' }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    event.target.value = '';
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`simple-file-upload ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <button 
        onClick={handleClick}
        className="simple-file-upload__button"
      >
        选择PDF文件
      </button>
    </div>
  );
};

export default FileUpload;