/**
 * 文档解析模块
 */

import { DocumentInfo } from '../core/types';
import { isSupportedFile, readFileAsArrayBuffer, loadFileFromUrl } from '../utils/file';
import { ERROR_CODES } from '../core/constants';
import type { WordViewer } from '../core/WordViewer';

export class ParserModule {
  private viewer: WordViewer;

  constructor(viewer: WordViewer) {
    this.viewer = viewer;
  }

  /**
   * 解析文件
   */
  async parseFile(file: File): Promise<ArrayBuffer> {
    if (!isSupportedFile(file)) {
      throw new Error(
        `${ERROR_CODES.UNSUPPORTED_FORMAT}: 不支持的文件格式 ${file.type || file.name}`
      );
    }

    try {
      return await readFileAsArrayBuffer(file);
    } catch (error) {
      throw new Error(
        `${ERROR_CODES.PARSE_FAILED}: ${error instanceof Error ? error.message : '解析文件失败'}`
      );
    }
  }

  /**
   * 从 URL 解析文件
   */
  async parseUrl(url: string): Promise<ArrayBuffer> {
    try {
      return await loadFileFromUrl(url);
    } catch (error) {
      throw new Error(
        `${ERROR_CODES.NETWORK_ERROR}: ${error instanceof Error ? error.message : '加载文件失败'}`
      );
    }
  }

  /**
   * 提取文档信息
   */
  async extractDocumentInfo(buffer: ArrayBuffer): Promise<DocumentInfo> {
    try {
      // 这里简化处理，实际应该使用 JSZip 解析 docx 的 core.xml
      // 获取基本信息
      const info: DocumentInfo = {
        title: '未命名文档',
        author: '',
        subject: '',
        keywords: '',
        description: '',
        created: new Date(),
        modified: new Date(),
        pageCount: 1,
        wordCount: 0,
      };

      // 尝试从 buffer 中提取更多信息
      // 这里需要使用 jszip 和 xml 解析器来读取 docx 的元数据
      // 简化实现，实际项目中应该完整解析

      return info;
    } catch (error) {
      console.warn('提取文档信息失败:', error);
      return {
        title: '未命名文档',
        pageCount: 1,
        wordCount: 0,
      };
    }
  }

  /**
   * 验证文档格式
   */
  async validateDocument(buffer: ArrayBuffer): Promise<boolean> {
    try {
      // 检查文件头部签名
      const view = new Uint8Array(buffer.slice(0, 4));
      
      // DOCX 文件是 ZIP 格式，开头是 PK (0x50 0x4B)
      if (view[0] === 0x50 && view[1] === 0x4B) {
        return true;
      }

      // DOC 文件开头是 0xD0 0xCF 0x11 0xE0
      if (
        view[0] === 0xD0 &&
        view[1] === 0xCF &&
        view[2] === 0x11 &&
        view[3] === 0xE0
      ) {
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  }
}



