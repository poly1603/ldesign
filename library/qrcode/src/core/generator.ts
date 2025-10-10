import QRCodeLib from 'qrcode-generator';
import type { QRCodeConfig, ErrorCorrectionLevel } from '../types';

/**
 * QR code data generator
 */
export class QRCodeGenerator {
  private qr: any;
  private config: QRCodeConfig;

  constructor(config: QRCodeConfig) {
    this.config = {
      errorCorrectionLevel: 'M' as ErrorCorrectionLevel,
      ...config,
    };
    this.generateQRData();
  }

  /**
   * Generate QR code data
   */
  private generateQRData(): void {
    const typeNumber = this.config.typeNumber || 0;
    const errorCorrectionLevel = this.config.errorCorrectionLevel || 'M';

    this.qr = QRCodeLib(typeNumber, errorCorrectionLevel);
    this.qr.addData(this.config.content);
    this.qr.make();
  }

  /**
   * Update configuration and regenerate
   */
  update(config: Partial<QRCodeConfig>): void {
    this.config = { ...this.config, ...config };
    this.generateQRData();
  }

  /**
   * Get module count
   */
  getModuleCount(): number {
    return this.qr.getModuleCount();
  }

  /**
   * Check if a module is dark
   */
  isDark(row: number, col: number): boolean {
    return this.qr.isDark(row, col);
  }

  /**
   * Get QR code data as 2D boolean array
   */
  getMatrix(): boolean[][] {
    const moduleCount = this.getModuleCount();
    const matrix: boolean[][] = [];

    for (let row = 0; row < moduleCount; row++) {
      matrix[row] = [];
      for (let col = 0; col < moduleCount; col++) {
        matrix[row][col] = this.isDark(row, col);
      }
    }

    return matrix;
  }

  /**
   * Get current configuration
   */
  getConfig(): QRCodeConfig {
    return { ...this.config };
  }

  /**
   * Get positions of the three finder patterns (eyes)
   */
  getEyePositions(): Array<{ row: number; col: number; size: number }> {
    const moduleCount = this.getModuleCount();
    return [
      { row: 0, col: 0, size: 7 }, // Top-left
      { row: 0, col: moduleCount - 7, size: 7 }, // Top-right
      { row: moduleCount - 7, col: 0, size: 7 }, // Bottom-left
    ];
  }

  /**
   * Check if a module is part of an eye (finder pattern)
   */
  isInEye(row: number, col: number): boolean {
    const eyes = this.getEyePositions();
    return eyes.some((eye) => {
      return (
        row >= eye.row &&
        row < eye.row + eye.size &&
        col >= eye.col &&
        col < eye.col + eye.size
      );
    });
  }
}
