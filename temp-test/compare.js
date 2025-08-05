const { generate } = require('@arco-design/color');

// Arco Design官方基础颜色
const arcoColors = {
  blue: '#165DFF',
  green: '#00B42A', 
  red: '#F53F3F',
  purple: '#722ED1',
  orange: '#FF7D00'
};

console.log('=== Arco Design官方色阶对比 ===\n');

Object.entries(arcoColors).forEach(([name, color]) => {
  console.log(`${name.toUpperCase()} (${color}):`);
  
  // 生成10级色阶
  const palette = generate(color, { list: true });
  
  palette.forEach((hex, index) => {
    console.log(`  ${name}-${index + 1}: ${hex}`);
  });
  
  console.log('');
});

// 测试我们的算法实现
console.log('=== 我们的算法测试 ===\n');

// 简化版的HSL到HSV转换
function hslToHsv(h, s, l) {
  s = s / 100;
  l = l / 100;
  
  const v = l + s * Math.min(l, 1 - l);
  const newS = v === 0 ? 0 : 2 * (1 - l / v);
  
  return {
    h: h,
    s: newS * 100,
    v: v * 100
  };
}

// 简化版的HSV到HSL转换
function hsvToHsl(h, s, v) {
  s = s / 100;
  v = v / 100;
  
  const l = v * (1 - s / 2);
  const newS = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
  
  return {
    h: h,
    s: newS * 100,
    l: l * 100
  };
}

// 简化版的hex转HSL
function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  let h = 0;
  if (diff !== 0) {
    if (max === r) h = ((g - b) / diff) % 6;
    else if (max === g) h = (b - r) / diff + 2;
    else h = (r - g) / diff + 4;
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  
  const l = (max + min) / 2;
  const s = diff === 0 ? 0 : diff / (1 - Math.abs(2 * l - 1));
  
  return {
    h: h,
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

// 简化版的HSL转hex
function hslToHex(h, s, l) {
  h = h / 360;
  s = s / 100;
  l = l / 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h * 6) % 2 - 1));
  const m = l - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (0 <= h && h < 1/6) {
    r = c; g = x; b = 0;
  } else if (1/6 <= h && h < 2/6) {
    r = x; g = c; b = 0;
  } else if (2/6 <= h && h < 3/6) {
    r = 0; g = c; b = x;
  } else if (3/6 <= h && h < 4/6) {
    r = 0; g = x; b = c;
  } else if (4/6 <= h && h < 5/6) {
    r = x; g = 0; b = c;
  } else if (5/6 <= h && h < 1) {
    r = c; g = 0; b = x;
  }
  
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// 我们的算法实现
function ourAlgorithm(baseColor) {
  const baseHsl = hexToHsl(baseColor);
  const baseHsv = hslToHsv(baseHsl.h, baseHsl.s, baseHsl.l);
  
  const colors = [];
  const hueStep = 2;
  const maxSaturationStep = 100;
  const minSaturationStep = 9;
  const maxValue = 100;
  const minValue = 30;
  
  for (let i = 1; i <= 10; i++) {
    const isLight = i < 6;
    const index = isLight ? 6 - i : i - 6;
    
    let resultHsv;
    if (i === 6) {
      resultHsv = baseHsv;
    } else {
      // 色相调整
      let newHue;
      if (baseHsv.h >= 60 && baseHsv.h <= 240) {
        newHue = isLight ? baseHsv.h - hueStep * index : baseHsv.h + hueStep * index;
      } else {
        newHue = isLight ? baseHsv.h + hueStep * index : baseHsv.h - hueStep * index;
      }
      if (newHue < 0) newHue += 360;
      else if (newHue >= 360) newHue -= 360;
      
      // 饱和度调整
      let newSaturation;
      if (isLight) {
        newSaturation = baseHsv.s <= minSaturationStep ? baseHsv.s : baseHsv.s - ((baseHsv.s - minSaturationStep) / 5) * index;
      } else {
        newSaturation = baseHsv.s + ((maxSaturationStep - baseHsv.s) / 4) * index;
      }
      
      // 明度调整
      const newValue = isLight ? baseHsv.v + ((maxValue - baseHsv.v) / 5) * index : (baseHsv.v <= minValue ? baseHsv.v : baseHsv.v - ((baseHsv.v - minValue) / 4) * index);
      
      resultHsv = { h: Math.round(newHue), s: newSaturation, v: newValue };
    }
    
    const resultHsl = hsvToHsl(resultHsv.h, resultHsv.s, resultHsv.v);
    colors.push(hslToHex(resultHsl.h, Math.max(0, Math.min(100, resultHsl.s)), Math.max(0, Math.min(100, resultHsl.l))));
  }
  
  return colors;
}

// 测试蓝色
console.log('BLUE (#165DFF) - 我们的算法:');
const ourBlue = ourAlgorithm('#165DFF');
ourBlue.forEach((hex, index) => {
  console.log(`  blue-${index + 1}: ${hex}`);
});

console.log('\n=== 对比结果 ===');
const officialBlue = generate('#165DFF', { list: true });
console.log('官方 vs 我们的算法:');
officialBlue.forEach((official, index) => {
  const ours = ourBlue[index];
  const match = official.toLowerCase() === ours.toLowerCase() ? '✅' : '❌';
  console.log(`  ${index + 1}: ${official} vs ${ours} ${match}`);
});
