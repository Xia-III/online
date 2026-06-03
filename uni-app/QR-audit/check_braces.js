const fs = require('fs');
const path = require('path');

// 读取文件内容
const content = fs.readFileSync(path.join(__dirname, 'src', 'pages', 'index', 'index.vue'), 'utf8');

// 提取 JS 部分
const scriptTagStart = '<script>';
const scriptTagEnd = '</script>';

const jsStart = content.indexOf(scriptTagStart) + scriptTagStart.length;
const jsEnd = content.indexOf(scriptTagEnd);
const jsContent = content.substring(jsStart, jsEnd);

// 计算括号数量
let openBraces = 0;
let closeBraces = 0;
for (let i = 0; i < jsContent.length; i++) {
  if (jsContent[i] === '{') openBraces++;
  else if (jsContent[i] === '}') closeBraces++;
}

console.log('Open braces:', openBraces);
console.log('Close braces:', closeBraces);
console.log('Difference:', openBraces - closeBraces);

// 检查括号是否平衡
if (openBraces !== closeBraces) {
  console.log('ERROR: Braces are not balanced!');
  
  // 更详细的检查
  let braceLevel = 0;
  for (let i = 0; i < jsContent.length; i++) {
    if (jsContent[i] === '{') {
      braceLevel++;
    } else if (jsContent[i] === '}') {
      braceLevel--;
      if (braceLevel < 0) {
        console.log(`ERROR: Unmatched closing brace at position ${i}`);
        // 显示上下文
        const start = Math.max(0, i - 50);
        const end = Math.min(jsContent.length, i + 50);
        console.log('Context:', jsContent.substring(start, end));
        break;
      }
    }
  }
  
  if (braceLevel > 0) {
    console.log(`ERROR: ${braceLevel} unmatched opening braces`);
  }
} else {
  console.log('SUCCESS: Braces are balanced');
}