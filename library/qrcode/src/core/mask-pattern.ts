/**
 * QR Code Mask Pattern Implementation
 * Implements the 8 standard QR code mask patterns
 */

/**
 * Mask pattern formulas
 * Returns true if the module at (row, col) should be inverted
 */
export const MASK_PATTERNS = {
  0: (row: number, col: number) => (row + col) % 2 === 0,
  1: (row: number, col: number) => row % 2 === 0,
  2: (row: number, col: number) => col % 3 === 0,
  3: (row: number, col: number) => (row + col) % 3 === 0,
  4: (row: number, col: number) => (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0,
  5: (row: number, col: number) => ((row * col) % 2) + ((row * col) % 3) === 0,
  6: (row: number, col: number) => (((row * col) % 2) + ((row * col) % 3)) % 2 === 0,
  7: (row: number, col: number) => (((row + col) % 2) + ((row * col) % 3)) % 2 === 0,
};

/**
 * Function pattern positions (should not be masked)
 * These include: Finder patterns (eyes), timing patterns, alignment patterns, format info, version info
 */
export class FunctionPatternDetector {
  private moduleCount: number;
  private functionPattern: boolean[][];

  constructor(moduleCount: number) {
    this.moduleCount = moduleCount;
    this.functionPattern = this.createFunctionPattern();
  }

  /**
   * Create a matrix marking all function pattern positions
   */
  private createFunctionPattern(): boolean[][] {
    const pattern: boolean[][] = Array(this.moduleCount)
      .fill(null)
      .map(() => Array(this.moduleCount).fill(false));

    // Mark finder patterns (3 corners, 7x7 each + 1 module separator)
    this.markFinderPattern(pattern, 0, 0);
    this.markFinderPattern(pattern, this.moduleCount - 7, 0);
    this.markFinderPattern(pattern, 0, this.moduleCount - 7);

    // Mark timing patterns (horizontal and vertical lines)
    this.markTimingPatterns(pattern);

    // Mark dark module (always at a specific position)
    if (this.moduleCount >= 21) {
      pattern[this.moduleCount - 8][8] = true;
    }

    // Mark format information areas
    this.markFormatInformation(pattern);

    // Mark alignment patterns (for version 2+)
    if (this.moduleCount >= 25) {
      this.markAlignmentPatterns(pattern);
    }

    // Mark version information (for version 7+)
    if (this.moduleCount >= 45) {
      this.markVersionInformation(pattern);
    }

    return pattern;
  }

  /**
   * Mark a finder pattern (eye) at the given position, including separator
   */
  private markFinderPattern(pattern: boolean[][], startRow: number, startCol: number): void {
    // Mark the 7x7 finder pattern
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        const r = startRow + row;
        const c = startCol + col;
        if (r >= 0 && r < this.moduleCount && c >= 0 && c < this.moduleCount) {
          pattern[r][c] = true;
        }
      }
    }

    // Mark separator (white border around finder pattern)
    for (let i = -1; i <= 7; i++) {
      // Top/bottom separator
      if (startRow === 0) {
        const r = startRow + 7;
        const c = startCol + i;
        if (c >= 0 && c < this.moduleCount && r < this.moduleCount) {
          pattern[r][c] = true;
        }
      }
      if (startRow === this.moduleCount - 7) {
        const r = startRow - 1;
        const c = startCol + i;
        if (c >= 0 && c < this.moduleCount && r >= 0) {
          pattern[r][c] = true;
        }
      }

      // Left/right separator
      if (startCol === 0) {
        const r = startRow + i;
        const c = startCol + 7;
        if (r >= 0 && r < this.moduleCount && c < this.moduleCount) {
          pattern[r][c] = true;
        }
      }
      if (startCol === this.moduleCount - 7) {
        const r = startRow + i;
        const c = startCol - 1;
        if (r >= 0 && r < this.moduleCount && c >= 0) {
          pattern[r][c] = true;
        }
      }
    }
  }

  /**
   * Mark timing patterns (alternating horizontal and vertical lines at row/col 6)
   */
  private markTimingPatterns(pattern: boolean[][]): void {
    for (let i = 8; i < this.moduleCount - 8; i++) {
      pattern[6][i] = true; // Horizontal
      pattern[i][6] = true; // Vertical
    }
  }

  /**
   * Mark format information areas (around finder patterns)
   */
  private markFormatInformation(pattern: boolean[][]): void {
    // Horizontal format info (top-left to top-right finder)
    for (let i = 0; i <= 8; i++) {
      if (i !== 6) {
        pattern[8][i] = true;
        pattern[8][this.moduleCount - 1 - i] = true;
      }
    }

    // Vertical format info (top-left to bottom-left finder)
    for (let i = 0; i <= 8; i++) {
      if (i !== 6) {
        pattern[i][8] = true;
        pattern[this.moduleCount - 1 - i][8] = true;
      }
    }
  }

  /**
   * Mark alignment patterns (for QR version 2+)
   */
  private markAlignmentPatterns(pattern: boolean[][]): void {
    const positions = this.getAlignmentPatternPositions();

    for (const row of positions) {
      for (const col of positions) {
        // Skip if overlaps with finder patterns
        if (this.overlapsWithFinder(row, col)) {
          continue;
        }

        // Mark 5x5 alignment pattern centered at (row, col)
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            const finalRow = row + r;
            const finalCol = col + c;
            if (finalRow >= 0 && finalRow < this.moduleCount && finalCol >= 0 && finalCol < this.moduleCount) {
              pattern[finalRow][finalCol] = true;
            }
          }
        }
      }
    }
  }

  /**
   * Get alignment pattern center positions based on QR version
   */
  private getAlignmentPatternPositions(): number[] {
    // This is a simplified version. Real implementation would use version-specific tables.
    // For now, we'll use a basic calculation
    const version = Math.floor((this.moduleCount - 17) / 4);

    if (version < 2) return [];

    // Simplified: place one alignment pattern in the middle for small versions
    if (version === 2) {
      return [18]; // Version 2 has alignment at (18, 18)
    }

    // For higher versions, calculate positions
    const count = Math.floor(version / 7) + 2;
    const step = Math.floor((this.moduleCount - 13) / (count - 1)) * 2;
    const positions: number[] = [6];

    for (let i = 1; i < count; i++) {
      positions.push(6 + i * step);
    }

    return positions;
  }

  /**
   * Check if a position overlaps with any finder pattern
   */
  private overlapsWithFinder(row: number, col: number): boolean {
    // Check if within 5 modules of any finder pattern center
    const finderCenters = [
      { row: 3, col: 3 }, // Top-left
      { row: 3, col: this.moduleCount - 4 }, // Top-right
      { row: this.moduleCount - 4, col: 3 }, // Bottom-left
    ];

    for (const center of finderCenters) {
      const distance = Math.max(Math.abs(row - center.row), Math.abs(col - center.col));
      if (distance < 5) {
        return true;
      }
    }

    return false;
  }

  /**
   * Mark version information areas (for QR version 7+)
   */
  private markVersionInformation(pattern: boolean[][]): void {
    // Version information is stored in two 3x6 blocks
    // Bottom-left corner (above bottom-left finder)
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 3; col++) {
        pattern[this.moduleCount - 11 + col][row] = true;
      }
    }

    // Top-right corner (left of top-right finder)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 6; col++) {
        pattern[row][this.moduleCount - 11 + col] = true;
      }
    }
  }

  /**
   * Check if a module is part of a function pattern
   */
  isFunctionPattern(row: number, col: number): boolean {
    if (row < 0 || row >= this.moduleCount || col < 0 || col >= this.moduleCount) {
      return false;
    }
    return this.functionPattern[row][col];
  }
}

/**
 * Apply a mask pattern to a QR code matrix
 */
export function applyMaskPattern(
  matrix: boolean[][],
  maskPattern: number,
  moduleCount: number
): boolean[][] {
  if (maskPattern < 0 || maskPattern > 7) {
    throw new Error(`Invalid mask pattern: ${maskPattern}. Must be between 0 and 7.`);
  }

  const maskFunction = MASK_PATTERNS[maskPattern as keyof typeof MASK_PATTERNS];
  const detector = new FunctionPatternDetector(moduleCount);
  const maskedMatrix: boolean[][] = [];

  for (let row = 0; row < moduleCount; row++) {
    maskedMatrix[row] = [];
    for (let col = 0; col < moduleCount; col++) {
      // Don't mask function patterns
      if (detector.isFunctionPattern(row, col)) {
        maskedMatrix[row][col] = matrix[row][col];
      } else {
        // Apply mask: XOR with mask pattern
        const shouldInvert = maskFunction(row, col);
        maskedMatrix[row][col] = shouldInvert ? !matrix[row][col] : matrix[row][col];
      }
    }
  }

  return maskedMatrix;
}

/**
 * Evaluate mask pattern quality (penalty score, lower is better)
 * This can be used for automatic mask selection
 */
export function evaluateMaskPattern(matrix: boolean[][]): number {
  const moduleCount = matrix.length;
  let penalty = 0;

  // Rule 1: Adjacent modules in row/column with same color
  // Penalty: (5 + i) for each group of 5+ same-colored modules
  for (let row = 0; row < moduleCount; row++) {
    let count = 1;
    let prevColor = matrix[row][0];

    for (let col = 1; col < moduleCount; col++) {
      if (matrix[row][col] === prevColor) {
        count++;
      } else {
        if (count >= 5) {
          penalty += 3 + (count - 5);
        }
        count = 1;
        prevColor = matrix[row][col];
      }
    }

    if (count >= 5) {
      penalty += 3 + (count - 5);
    }
  }

  // Vertical
  for (let col = 0; col < moduleCount; col++) {
    let count = 1;
    let prevColor = matrix[0][col];

    for (let row = 1; row < moduleCount; row++) {
      if (matrix[row][col] === prevColor) {
        count++;
      } else {
        if (count >= 5) {
          penalty += 3 + (count - 5);
        }
        count = 1;
        prevColor = matrix[row][col];
      }
    }

    if (count >= 5) {
      penalty += 3 + (count - 5);
    }
  }

  // Rule 2: Block of modules in same color (2x2 or larger)
  // Penalty: 3 for each 2x2 block
  for (let row = 0; row < moduleCount - 1; row++) {
    for (let col = 0; col < moduleCount - 1; col++) {
      const color = matrix[row][col];
      if (
        matrix[row][col + 1] === color &&
        matrix[row + 1][col] === color &&
        matrix[row + 1][col + 1] === color
      ) {
        penalty += 3;
      }
    }
  }

  // Rule 3: Patterns similar to finder patterns
  // Penalty: 40 for each occurrence
  const finderPattern = [true, false, true, true, true, false, true];

  // Horizontal
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount - 6; col++) {
      let matches = true;
      for (let i = 0; i < 7; i++) {
        if (matrix[row][col + i] !== finderPattern[i]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        penalty += 40;
      }
    }
  }

  // Vertical
  for (let col = 0; col < moduleCount; col++) {
    for (let row = 0; row < moduleCount - 6; row++) {
      let matches = true;
      for (let i = 0; i < 7; i++) {
        if (matrix[row + i][col] !== finderPattern[i]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        penalty += 40;
      }
    }
  }

  // Rule 4: Balance of dark/light modules
  // Penalty: (k * 10) where k is the rating of deviation from 50%
  let darkCount = 0;
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (matrix[row][col]) {
        darkCount++;
      }
    }
  }

  const totalModules = moduleCount * moduleCount;
  const darkPercent = (darkCount * 100) / totalModules;
  const deviation = Math.abs(darkPercent - 50);
  const k = Math.floor(deviation / 5);
  penalty += k * 10;

  return penalty;
}

/**
 * Find the best mask pattern automatically
 */
export function findBestMaskPattern(matrix: boolean[][], moduleCount: number): number {
  let bestPattern = 0;
  let bestScore = Infinity;

  for (let pattern = 0; pattern < 8; pattern++) {
    const maskedMatrix = applyMaskPattern(matrix, pattern, moduleCount);
    const score = evaluateMaskPattern(maskedMatrix);

    if (score < bestScore) {
      bestScore = score;
      bestPattern = pattern;
    }
  }

  return bestPattern;
}
