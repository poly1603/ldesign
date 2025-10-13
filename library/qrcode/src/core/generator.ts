import QRCodeLib from 'qrcode-generator';
import type { QRCodeConfig, ErrorCorrectionLevel } from '../types';
import { applyMaskPattern, findBestMaskPattern } from './mask-pattern';

/**
 * QR code data generator with mask pattern support
 */
export class QRCodeGenerator {
  private qr: any;
  private config: QRCodeConfig;
  private customMatrix: boolean[][] | null = null;

  constructor(config: QRCodeConfig) {
    this.config = {
      errorCorrectionLevel: 'M' as ErrorCorrectionLevel,
      maskPattern: -1, // Auto selection by default
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

    // IMPORTANT: The qrcode-generator library already applies the best mask pattern
    // internally when make() is called. Our custom mask pattern implementation
    // was incorrectly re-applying masks, which corrupted the QR code.
    // 
    // For now, we'll disable custom mask patterns to ensure QR codes work correctly.
    // If custom mask patterns are needed in the future, the implementation needs to:
    // 1. Work with the raw data matrix BEFORE the library applies its mask
    // 2. Properly handle all function patterns (timing, alignment, format info, etc.)
    // 3. Recalculate and embed format/version information with the new mask pattern
    
    // Always use the library's built-in mask pattern selection
    this.customMatrix = null;
    
    // Log warning if custom mask pattern was requested
    if (this.config.maskPattern !== undefined && this.config.maskPattern !== null) {
      console.warn(
        'Custom mask patterns are currently disabled to ensure QR code compatibility. ' +
        'The QR code will use the library\'s optimized mask pattern selection.'
      );
    }
  }

  /**
   * Get the original matrix from qrcode-generator before our custom masking
   */
  private getOriginalMatrix(): boolean[][] {
    const moduleCount = this.qr.getModuleCount();
    const matrix: boolean[][] = [];

    for (let row = 0; row < moduleCount; row++) {
      matrix[row] = [];
      for (let col = 0; col < moduleCount; col++) {
        matrix[row][col] = this.qr.isDark(row, col);
      }
    }

    return matrix;
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
   * Uses custom mask pattern if applied
   */
  isDark(row: number, col: number): boolean {
    if (this.customMatrix) {
      return this.customMatrix[row][col];
    }
    return this.qr.isDark(row, col);
  }

  /**
   * Get QR code data as 2D boolean array
   */
  getMatrix(): boolean[][] {
    // If we have a custom matrix (from mask pattern), return it
    if (this.customMatrix) {
      return this.customMatrix.map(row => [...row]);
    }

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

  /**
   * Check if a module is part of a timing pattern
   */
  isTimingPattern(row: number, col: number): boolean {
    // Timing patterns are at row 6 and column 6
    return row === 6 || col === 6;
  }

  /**
   * Get alignment pattern positions for the current QR version
   */
  private getAlignmentPatterns(): Array<{ row: number; col: number }> {
    const moduleCount = this.getModuleCount();

    // Version 1 QR codes (21x21) don't have alignment patterns
    if (moduleCount === 21) {
      return [];
    }

    // Alignment pattern positions based on QR code version
    // This is a simplified version - full implementation would use the official spec
    const positions: number[] = [];

    // Calculate version from module count: version = (moduleCount - 17) / 4
    const version = (moduleCount - 17) / 4;

    if (version >= 2) {
      // For version 2+, there are alignment patterns
      // Simplified calculation - in production, use official position table
      const step = version <= 6 ? 16 + version * 2 : 20 + version * 2;
      const max = moduleCount - 7;

      for (let pos = 6; pos < max; pos += step) {
        positions.push(pos);
      }
      positions.push(max);
    }

    // Generate alignment pattern coordinates (excluding finder pattern areas)
    const alignments: Array<{ row: number; col: number }> = [];
    for (const row of positions) {
      for (const col of positions) {
        // Skip if overlaps with finder patterns
        const isNearFinderPattern =
          (row < 9 && col < 9) ||  // Top-left
          (row < 9 && col > moduleCount - 9) ||  // Top-right
          (row > moduleCount - 9 && col < 9);  // Bottom-left

        if (!isNearFinderPattern) {
          alignments.push({ row, col });
        }
      }
    }

    return alignments;
  }

  /**
   * Check if a module is part of an alignment pattern
   */
  isAlignmentPattern(row: number, col: number): boolean {
    const alignments = this.getAlignmentPatterns();
    return alignments.some(align => {
      // Alignment patterns are 5x5
      return (
        row >= align.row - 2 &&
        row <= align.row + 2 &&
        col >= align.col - 2 &&
        col <= align.col + 2
      );
    });
  }

  /**
   * Check if a module is a function module
   * (finder pattern, timing pattern, or alignment pattern)
   */
  isFunctionModule(row: number, col: number): boolean {
    return (
      this.isInEye(row, col) ||
      this.isTimingPattern(row, col) ||
      this.isAlignmentPattern(row, col)
    );
  }

  /**
   * Check if a module is a data module
   * (not a function module)
   */
  isDataModule(row: number, col: number): boolean {
    return !this.isFunctionModule(row, col);
  }
}
