import { describe, it, expect, beforeEach } from 'vitest';
import { createQRCode, toDataURL, toSVGString } from '../src/index';

describe('QRCode Core API', () => {
 let container: HTMLDivElement;

 beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
 });

 describe('createQRCode', () => {
  it('should create a QR code instance', () => {
   const qr = createQRCode({
    content: 'https://example.com',
    container,
   });

   expect(qr).toBeDefined();
   expect(qr.getElement()).toBeInstanceOf(HTMLCanvasElement);
  });

  it('should render to canvas by default', () => {
   const qr = createQRCode({
    content: 'test',
    container,
   });

   expect(qr.getElement()).toBeInstanceOf(HTMLCanvasElement);
  });

  it('should render to SVG when specified', () => {
   const qr = createQRCode({
    content: 'test',
    container,
    renderType: 'svg',
   });

   expect(qr.getElement()).toBeInstanceOf(SVGSVGElement);
  });

  it('should apply custom styles', () => {
   const qr = createQRCode({
    content: 'test',
    container,
    style: {
     size: 300,
     fgColor: '#ff0000',
     bgColor: '#00ff00',
    },
   });

   const canvas = qr.getElement() as HTMLCanvasElement;
   expect(canvas.width).toBe(300);
   expect(canvas.height).toBe(300);
  });
 });

 describe('update', () => {
  it('should update QR code content', async () => {
   const qr = createQRCode({
    content: 'initial',
    container,
   });

   await qr.update({ content: 'updated' });
   expect(qr.getElement()).toBeDefined();
  });

  it('should update QR code style', async () => {
   const qr = createQRCode({
    content: 'test',
    container,
    style: { size: 200 },
   });

   await qr.update({
    style: { size: 400 }
   });

   const canvas = qr.getElement() as HTMLCanvasElement;
   expect(canvas.width).toBe(400);
  });
 });

 describe('toDataURL', () => {
  it('should export as PNG data URL', async () => {
   const dataUrl = await toDataURL('test', {}, 'png');

   expect(dataUrl).toMatch(/^data:image\/png/);
  });

  it('should export as JPEG data URL', async () => {
   const dataUrl = await toDataURL('test', {}, 'jpeg');

   expect(dataUrl).toMatch(/^data:image\/jpeg/);
  });
 });

 describe('toSVGString', () => {
  it('should export as SVG string', () => {
   const svgString = toSVGString('test');

   expect(svgString).toContain('<svg');
   expect(svgString).toContain('</svg>');
  });

  it('should include custom styles in SVG', () => {
   const svgString = toSVGString('test', {
    style: {
     fgColor: '#ff0000',
    },
   });

   expect(svgString).toContain('#ff0000');
  });
 });

 describe('destroy', () => {
  it('should remove element from DOM', () => {
   const qr = createQRCode({
    content: 'test',
    container,
   });

   const element = qr.getElement();
   expect(element?.parentNode).toBe(container);

   qr.destroy();
   expect(element?.parentNode).toBeNull();
  });
 });
});
