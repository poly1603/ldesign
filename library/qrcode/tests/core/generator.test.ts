import { describe, it, expect } from 'vitest';
import { QRCodeGenerator } from '../../src/core/generator';
import { ErrorCorrectionLevel } from '../../src/types';

describe('QRCodeGenerator', () => {
 it('should create a QR code generator instance', () => {
  const generator = new QRCodeGenerator({
   content: 'test',
   errorCorrectionLevel: ErrorCorrectionLevel.M,
  });

  expect(generator).toBeDefined();
  expect(generator.getModuleCount()).toBeGreaterThan(0);
 });

 it('should generate correct module count for different content lengths', () => {
  const shortContent = new QRCodeGenerator({ content: 'test' });
  const longContent = new QRCodeGenerator({
   content: 'a'.repeat(100)
  });

  expect(longContent.getModuleCount()).toBeGreaterThan(shortContent.getModuleCount());
 });

 it('should identify eye positions correctly', () => {
  const generator = new QRCodeGenerator({ content: 'test' });
  const eyePositions = generator.getEyePositions();

  expect(eyePositions).toHaveLength(3);
  expect(eyePositions[0]).toEqual({ row: 0, col: 0, size: 7 });
 });

 it('should identify function modules correctly', () => {
  const generator = new QRCodeGenerator({ content: 'test' });

  // Top-left corner should be in eye (function module)
  expect(generator.isFunctionModule(0, 0)).toBe(true);
  expect(generator.isInEye(0, 0)).toBe(true);
 });

 it('should identify timing patterns correctly', () => {
  const generator = new QRCodeGenerator({ content: 'test' });

  // Row 6 and column 6 should be timing patterns
  expect(generator.isTimingPattern(6, 10)).toBe(true);
  expect(generator.isTimingPattern(10, 6)).toBe(true);
 });

 it('should update content correctly', () => {
  const generator = new QRCodeGenerator({ content: 'test' });
  const originalModuleCount = generator.getModuleCount();

  generator.update({ content: 'a'.repeat(100) });
  const newModuleCount = generator.getModuleCount();

  expect(newModuleCount).toBeGreaterThan(originalModuleCount);
 });

 it('should return a valid matrix', () => {
  const generator = new QRCodeGenerator({ content: 'test' });
  const matrix = generator.getMatrix();

  expect(Array.isArray(matrix)).toBe(true);
  expect(matrix.length).toBe(generator.getModuleCount());
  expect(matrix[0].length).toBe(generator.getModuleCount());
 });
});
