# Image Tools - 专业的在线图片处理工具

<div align="center">

![Image Tools Logo](./public/logo.svg)

**功能强大的在线图片处理工具，支持多种图片编辑功能，无需下载安装即可使用**

[![Vue 3](https://img.shields.io/badge/Vue-3.5.22-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.7-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Naive UI](https://img.shields.io/badge/Naive%20UI-2.43.1-18A058?style=flat-square)](https://www.naiveui.com/)

</div>

## ✨ 功能特性

### 🎨 圆角处理

- **批量处理**: 支持同时处理多张图片
- **实时预览**: 拖拽调节圆角半径，实时查看效果
- **灵活导出**: 支持单张下载或批量打包下载
- **格式支持**: PNG、JPG、JPEG、WebP 等主流格式

### ✂️ 图片裁剪

- **智能裁剪**: 居中裁剪，保持图片主要内容
- **预设比例**: 1:1、4:3、3:2、16:9 等常用比例
- **自定义尺寸**: 支持自定义宽度和高度
- **实时预览**: 裁剪前后对比预览

### 🔄 格式转换

- **多格式支持**: PNG ↔ JPEG ↔ WebP 互转
- **质量控制**: JPEG/WebP 格式支持质量调节 (10%-100%)
- **背景设置**: PNG 透明转换时可设置背景色
- **批量转换**: 支持多文件同时转换和打包下载

### 🌟 Favicon 生成

- **多尺寸生成**: 自动生成 16x16 到 512x512 等 12 种常用尺寸
- **标准兼容**: 支持浏览器、移动设备、PWA 等各种场景
- **代码生成**: 自动生成完整的 HTML 代码片段
- **ICO 支持**: 可选生成传统 .ico 格式文件
- **Manifest 文件**: 自动生成 PWA manifest.json

## 🚀 技术栈

### 前端框架

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **Vite** - 下一代前端构建工具

### UI 组件库

- **Naive UI** - Vue 3 组件库，提供丰富的 UI 组件
- **Headless UI** - 无样式的可访问 UI 组件
- **Heroicons** - 精美的 SVG 图标库
- **Lucide Vue** - 现代化图标库

### 核心功能库

- **Fabric.js** - 强大的 Canvas 图形处理库
- **HTML2Canvas** - HTML 转 Canvas 截图库
- **File-saver** - 客户端文件保存库
- **JSZip** - JavaScript ZIP 文件处理库

### 开发工具

- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Vitest** - 单元测试框架
- **UnoCSS** - 原子化 CSS 引擎

## 📦 快速开始

### 环境要求

- Node.js >= 20.19.0 或 >= 22.12.0
- npm 或 yarn 或 pnpm

### 安装依赖

```bash
# 使用 npm
npm install

# 使用 yarn
yarn install

# 使用 pnpm
pnpm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 🎯 使用指南

### 圆角处理

1. 点击"选择文件"或直接拖拽图片到上传区域
2. 使用滑块调节圆角半径 (0-50px)
3. 实时预览处理效果
4. 点击"处理图片"生成圆角图片
5. 支持单张下载或批量打包下载

### 图片裁剪

1. 上传需要裁剪的图片
2. 设置目标宽度和高度，或选择预设比例
3. 系统自动进行居中裁剪
4. 预览裁剪效果
5. 下载处理后的图片

### 格式转换

1. 选择需要转换的图片（支持多选）
2. 选择目标格式：PNG、JPEG、WebP
3. 调节质量参数（JPEG/WebP）
4. 设置背景色（PNG 透明转换）
5. 批量转换并下载

### Favicon 生成

1. 上传正方形图片（推荐）
2. 系统自动生成 12 种常用尺寸
3. 设置图标文件路径
4. 选择是否生成 .ico 文件
5. 下载完整的 Favicon 包
6. 复制生成的 HTML 代码到网站

## 🌟 项目特色

### 🎨 现代化设计

- 采用紫色主题色调，界面美观现代
- 响应式设计，支持移动端和桌面端
- 虚线边框设计，功能区域清晰分明

### ⚡ 高性能处理

- 基于 Canvas 的图片处理，性能优异
- 实时预览功能，所见即所得
- 批量处理能力，提高工作效率

### 🔧 用户友好

- 拖拽上传，操作简便
- 详细的文件信息显示
- 智能的错误处理和用户提示

### 📱 跨平台兼容

- 支持所有现代浏览器
- 移动端友好的响应式设计
- PWA 支持，可安装到桌面

## 🏗️ 项目结构

```
image-tools/
├── public/                 # 静态资源
├── src/
│   ├── assets/            # 项目资源文件
│   ├── components/        # 可复用组件
│   │   ├── icons/         # 图标组件
│   │   └── __tests__/     # 组件测试
│   ├── router/            # 路由配置
│   ├── stores/            # 状态管理
│   ├── views/             # 页面组件
│   │   ├── RoundedCornerView.vue    # 圆角处理页面
│   │   ├── CropView.vue             # 图片裁剪页面
│   │   ├── ConvertView.vue          # 格式转换页面
│   │   └── FaviconView.vue          # Favicon生成页面
│   ├── App.vue            # 根组件
│   └── main.ts            # 应用入口
├── index.html             # HTML 模板
├── package.json           # 项目配置
└── vite.config.ts         # Vite 配置
```

## 🎨 设计理念

### 用户体验优先

- 简洁直观的操作界面
- 最少的学习成本
- 快速的处理响应

### 功能完整性

- 覆盖常见的图片处理需求
- 专业级的处理质量
- 灵活的参数配置

### 技术先进性

- 采用最新的前端技术栈
- 模块化的代码组织
- 可扩展的架构设计

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👨‍💻 作者

**逆行时光** - 专注于前端开发和用户体验设计

---

<div align="center">

**如果这个项目对您有帮助，请给它一个 ⭐️**

</div>
