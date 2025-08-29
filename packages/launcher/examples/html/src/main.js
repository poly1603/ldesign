// 原生 HTML 项目的主 JavaScript 文件
console.log('Hello from native HTML project!');

// 计数器功能
let count = 0;

// DOM 元素
const countElement = document.getElementById('count');
const increaseButton = document.getElementById('increase');
const decreaseButton = document.getElementById('decrease');

// 更新计数显示
function updateCount() {
  if (countElement) {
    countElement.textContent = count;
  }
}

// 增加计数
function increase() {
  count++;
  updateCount();
  console.log('Count increased to:', count);
}

// 减少计数
function decrease() {
  count--;
  updateCount();
  console.log('Count decreased to:', count);
}

// 添加事件监听器
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing app...');
  
  // 绑定按钮事件
  if (increaseButton) {
    increaseButton.addEventListener('click', increase);
  }
  
  if (decreaseButton) {
    decreaseButton.addEventListener('click', decrease);
  }
  
  // 初始化计数显示
  updateCount();
  
  // 添加一些交互效果
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    button.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.05)';
    });
    
    button.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1)';
    });
  });
  
  console.log('App initialized successfully!');
});

// 导出函数供其他模块使用
export { increase, decrease, updateCount };
