/**
 * Node.js 下载器
 * @module downloaders/node-downloader
 */

import fs from 'fs-extra'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import { createWriteStream } from 'node:fs'
import fetch from 'node-fetch'
import tar from 'tar'
import extract from 'extract-zip'
import { PathHelper } from '../utils/path-helper'
import type { DownloadProgress, MirrorConfig } from '../types'
import { DownloadError } from '../types'
import { Mirrors } from '../types'

/**
 * Node.js 下载器
 * 
 * 负责从镜像源下载 Node.js 二进制文件
 */
export class NodeDownloader {
  private mirror: string
  private onProgress?: (progress: DownloadProgress) => void

  constructor(
    mirror: string | MirrorConfig = Mirrors.OFFICIAL,
    onProgress?: (progress: DownloadProgress) => void,
  ) {
    if (typeof mirror === 'string') {
      this.mirror = mirror
    }
    else {
      this.mirror = mirror.url
    }

    this.onProgress = onProgress
  }

  /**
   * 下载 Node.js 指定版本
   * 
   * @param version - 版本号
   * @returns 下载文件路径
   * 
   * @throws {DownloadError} 下载失败
   * 
   * @example
   * ```typescript
   * const downloader = new NodeDownloader()
   * const filePath = await downloader.download('20.10.0')
   * console.log('已下载到:', filePath)
   * ```
   */
  async download(version: string): Promise<string> {
    const normalizedVersion = PathHelper.normalizeVersion(version)
    const versionWithV = PathHelper.addVersionPrefix(normalizedVersion)
    
    // 构建下载 URL
    const filename = PathHelper.getNodeFilename(normalizedVersion)
    const extension = PathHelper.getDownloadExtension()
    const downloadFilename = `${filename}${extension}`
    const downloadUrl = `${this.mirror}${versionWithV}/${downloadFilename}`

    // 缓存目录
    const cacheDir = PathHelper.getCacheDir()
    await PathHelper.ensureDir(cacheDir)

    const cachePath = path.join(cacheDir, downloadFilename)

    // 如果已缓存，直接返回
    if (await PathHelper.exists(cachePath)) {
      console.log(`使用缓存文件: ${cachePath}`)
      return cachePath
    }

    console.log(`下载 Node.js ${normalizedVersion} from ${downloadUrl}`)

    try {
      // 下载文件
      const response = await fetch(downloadUrl)

      if (!response.ok) {
        throw new DownloadError(
          `HTTP ${response.status}: ${response.statusText}`,
        )
      }

      const totalSize = Number.parseInt(
        response.headers.get('content-length') || '0',
      )
      let downloadedSize = 0
      const startTime = Date.now()

      // 创建写入流
      const fileStream = createWriteStream(cachePath)

      // 监听进度
      if (response.body) {
        response.body.on('data', (chunk: Buffer) => {
          downloadedSize += chunk.length
          const percent = totalSize > 0 ? (downloadedSize / totalSize) * 100 : 0
          const elapsedTime = (Date.now() - startTime) / 1000
          const speed = elapsedTime > 0 ? downloadedSize / elapsedTime : 0

          if (this.onProgress) {
            this.onProgress({
              downloaded: downloadedSize,
              total: totalSize,
              percent,
              speed,
            })
          }
        })

        // 使用 pipeline 进行流式下载
        await pipeline(response.body, fileStream)
      }

      console.log(`下载完成: ${cachePath}`)
      return cachePath
    }
    catch (error: any) {
      // 删除不完整的文件
      try {
        await fs.remove(cachePath)
      }
      catch {
        // 忽略删除错误
      }

      throw new DownloadError(
        `下载失败: ${error.message}`,
        error,
      )
    }
  }

  /**
   * 解压下载的文件到指定目录
   * 
   * @param archivePath - 压缩文件路径
   * @param targetDir - 目标目录
   * 
   * @throws {InstallError} 解压失败
   * 
   * @example
   * ```typescript
   * await downloader.extract('/path/to/node.tar.gz', '/path/to/install')
   * ```
   */
  async extract(archivePath: string, targetDir: string): Promise<void> {
    await PathHelper.ensureDir(targetDir)

    const isWindows = process.platform === 'win32'

    try {
      if (isWindows) {
        // Windows 使用 zip
        await extract(archivePath, { dir: path.resolve(targetDir) })
        
        // 移动文件到正确位置
        // zip 解压后会有一个目录，需要移动内容到 targetDir
        const files = await fs.readdir(targetDir)
        if (files.length === 1) {
          const extractedDir = path.join(targetDir, files[0])
          const isDir = (await fs.stat(extractedDir)).isDirectory()
          
          if (isDir) {
            // 移动内容到父目录
            const contents = await fs.readdir(extractedDir)
            for (const item of contents) {
              await fs.move(
                path.join(extractedDir, item),
                path.join(targetDir, item),
                { overwrite: true },
              )
            }
            // 删除空目录
            await fs.remove(extractedDir)
          }
        }
      }
      else {
        // Unix/Linux/macOS 使用 tar.gz
        await tar.extract({
          file: archivePath,
          cwd: targetDir,
          strip: 1, // 去除顶层目录
        })
      }

      console.log(`解压完成: ${targetDir}`)
    }
    catch (error: any) {
      throw new Error(`解压失败: ${error.message}`)
    }
  }

  /**
   * 清理缓存
   * 
   * @example
   * ```typescript
   * await downloader.clearCache()
   * ```
   */
  async clearCache(): Promise<void> {
    const cacheDir = PathHelper.getCacheDir()
    if (await PathHelper.exists(cacheDir)) {
      await fs.remove(cacheDir)
      console.log('缓存已清理')
    }
  }

  /**
   * 获取缓存大小
   * 
   * @returns 缓存大小（字节）
   */
  async getCacheSize(): Promise<number> {
    const cacheDir = PathHelper.getCacheDir()
    if (!(await PathHelper.exists(cacheDir))) {
      return 0
    }
    return PathHelper.getDirectorySize(cacheDir)
  }
}


