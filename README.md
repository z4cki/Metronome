# 节拍器 (Metronome)

一个简单而功能强大的网页版节拍器应用，使用 React 和 TypeScript 构建。

## 功能特点

- 调整速度 (40-240 BPM)
- 支持多种拍号 (2/4, 3/4, 4/4, 5/4, 6/8)
- 点按速度功能 (Tap Tempo)
- 视觉节拍指示器
- 强拍和弱拍的音频区分
- 键盘快捷键支持

## 技术栈

- React
- TypeScript
- Vite
- Web Audio API

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 使用方法

1. 打开应用
2. 使用滑块或 +/- 按钮调整速度
3. 选择所需拍号
4. 点击"开始"按钮启动节拍器
5. 可以使用"点按速度"按钮通过点击来设置速度

## 键盘快捷键

- 空格键: 开始/停止节拍器
- T 键: 点按速度
- 上箭头: 增加速度
- 下箭头: 减少速度

## 技术实现

- 使用 Web Audio API 生成精确的节拍声音
- 使用 React 函数组件和 Hooks
- TypeScript 类型安全
- 响应式设计，适配移动设备

## 运行环境

支持所有现代浏览器，包括:

- Chrome
- Firefox
- Safari
- Edge
