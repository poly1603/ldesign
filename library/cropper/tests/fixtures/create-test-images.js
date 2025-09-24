const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// 创建测试图片目录
const fixturesDir = __dirname;
if (!fs.existsSync(fixturesDir)) {
  fs.mkdirSync(fixturesDir, { recursive: true });
}

/**
 * 创建测试图片
 * @param {string} filename 文件名
 * @param {number} width 宽度
 * @param {number} height 高度
 * @param {string} pattern 图案类型
 */
function createTestImage(filename, width, height, pattern = 'gradient') {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  switch (pattern) {
    case 'gradient':
      // 渐变图案
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#ff6b6b');
      gradient.addColorStop(0.5, '#4ecdc4');
      gradient.addColorStop(1, '#45b7d1');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      break;

    case 'checkerboard':
      // 棋盘图案
      const squareSize = 50;
      for (let x = 0; x < width; x += squareSize) {
        for (let y = 0; y < height; y += squareSize) {
          const isEven = (Math.floor(x / squareSize) + Math.floor(y / squareSize)) % 2 === 0;
          ctx.fillStyle = isEven ? '#ffffff' : '#000000';
          ctx.fillRect(x, y, squareSize, squareSize);
        }
      }
      break;

    case 'circles':
      // 圆形图案
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, width, height);
      
      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = Math.random() * 50 + 10;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case 'text':
      // 文字图案
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('TEST IMAGE', width / 2, height / 2);
      
      ctx.font = '24px Arial';
      ctx.fillText(`${width} x ${height}`, width / 2, height / 2 + 60);
      break;

    default:
      // 默认纯色
      ctx.fillStyle = '#4ecdc4';
      ctx.fillRect(0, 0, width, height);
  }

  // 添加边框
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, width, height);

  // 保存图片
  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
  const filepath = path.join(fixturesDir, filename);
  fs.writeFileSync(filepath, buffer);
  
  console.log(`Created test image: ${filepath} (${width}x${height})`);
}

/**
 * 创建SVG测试图片
 * @param {string} filename 文件名
 * @param {number} width 宽度
 * @param {number} height 高度
 */
function createSVGTestImage(filename, width, height) {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#4ecdc4;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#45b7d1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad1)" />
      <circle cx="${width/4}" cy="${height/4}" r="50" fill="#ffffff" opacity="0.7" />
      <circle cx="${width*3/4}" cy="${height*3/4}" r="50" fill="#ffffff" opacity="0.7" />
      <text x="${width/2}" y="${height/2}" font-family="Arial" font-size="24" fill="#333" text-anchor="middle" dominant-baseline="middle">
        SVG TEST IMAGE
      </text>
      <text x="${width/2}" y="${height/2 + 40}" font-family="Arial" font-size="16" fill="#333" text-anchor="middle" dominant-baseline="middle">
        ${width} x ${height}
      </text>
    </svg>
  `;

  const filepath = path.join(fixturesDir, filename);
  fs.writeFileSync(filepath, svg);
  
  console.log(`Created SVG test image: ${filepath} (${width}x${height})`);
}

// 创建各种测试图片
console.log('Creating test images...');

// 标准测试图片
createTestImage('test-image.jpg', 800, 600, 'gradient');
createTestImage('test-image-square.jpg', 500, 500, 'checkerboard');
createTestImage('test-image-portrait.jpg', 400, 600, 'circles');
createTestImage('test-image-landscape.jpg', 800, 400, 'text');

// 小尺寸图片
createTestImage('small-image.jpg', 100, 100, 'gradient');

// 大尺寸图片（用于性能测试）
createTestImage('large-image.jpg', 4000, 3000, 'checkerboard');

// 极端宽高比图片
createTestImage('wide-image.jpg', 1200, 200, 'gradient');
createTestImage('tall-image.jpg', 200, 1200, 'gradient');

// PNG格式图片（带透明度）
createTestImage('test-image.png', 600, 400, 'circles');

// SVG图片
createSVGTestImage('test-image.svg', 600, 400);

// 创建损坏的图片文件（用于错误测试）
const corruptedImagePath = path.join(fixturesDir, 'corrupted-image.jpg');
fs.writeFileSync(corruptedImagePath, 'This is not a valid image file');
console.log(`Created corrupted image: ${corruptedImagePath}`);

// 创建空文件
const emptyImagePath = path.join(fixturesDir, 'empty-image.jpg');
fs.writeFileSync(emptyImagePath, '');
console.log(`Created empty image: ${emptyImagePath}`);

console.log('All test images created successfully!');

// 创建图片信息文件
const imageInfo = {
  'test-image.jpg': { width: 800, height: 600, format: 'jpeg', pattern: 'gradient' },
  'test-image-square.jpg': { width: 500, height: 500, format: 'jpeg', pattern: 'checkerboard' },
  'test-image-portrait.jpg': { width: 400, height: 600, format: 'jpeg', pattern: 'circles' },
  'test-image-landscape.jpg': { width: 800, height: 400, format: 'jpeg', pattern: 'text' },
  'small-image.jpg': { width: 100, height: 100, format: 'jpeg', pattern: 'gradient' },
  'large-image.jpg': { width: 4000, height: 3000, format: 'jpeg', pattern: 'checkerboard' },
  'wide-image.jpg': { width: 1200, height: 200, format: 'jpeg', pattern: 'gradient' },
  'tall-image.jpg': { width: 200, height: 1200, format: 'jpeg', pattern: 'gradient' },
  'test-image.png': { width: 600, height: 400, format: 'png', pattern: 'circles' },
  'test-image.svg': { width: 600, height: 400, format: 'svg', pattern: 'gradient' },
  'corrupted-image.jpg': { width: 0, height: 0, format: 'invalid', pattern: 'none' },
  'empty-image.jpg': { width: 0, height: 0, format: 'invalid', pattern: 'none' }
};

const infoPath = path.join(fixturesDir, 'image-info.json');
fs.writeFileSync(infoPath, JSON.stringify(imageInfo, null, 2));
console.log(`Created image info file: ${infoPath}`);