# 图片批量重命名工具

一个简单而高效的跨平台图片批量重命名工具，基于Tauri 2.0构建。

## 功能特点

- 批量重命名图片文件，支持常见格式（JPG, PNG, GIF, BMP, TIFF, WebP等）
- 自定义文件名前缀
- 自定义起始序号
- 文件名包含日期和随机字符串，确保唯一性
- 可选择重命名包含文件夹
- 跨平台支持（Windows, macOS, Linux）
- 轻量级，资源占用少

## 下载安装

### Windows

- 下载最新的 `.msi` 或 `.exe` 安装文件
- 双击安装文件，按照向导完成安装

### macOS

- 下载最新的 `.dmg` 文件
- 双击打开，将应用拖到"应用程序"文件夹即可

### Linux

- 下载适合您发行版的包（`.deb`, `.AppImage` 等）
- 按照您的发行版指南进行安装

## 使用说明

1. 启动应用程序
2. 点击"选择文件夹"或"选择图片文件"按钮
3. 设置文件名前缀和起始序号
4. 如需重命名包含文件夹，请勾选对应选项
5. 点击"开始重命名"按钮
6. 重命名完成后将显示详细结果

## 开发指南

### 环境要求

- Node.js 16+
- Rust 1.70+
- Tauri CLI

### 安装依赖

```bash
# 安装依赖
npm install

# 安装Tauri CLI
npm install -g @tauri-apps/cli
```

### 开发模式

```bash
# 启动开发服务器
npm run tauri dev
```

### 构建生产版本

```bash
# 为当前平台构建
npm run tauri build

# 为特定平台构建（macOS Intel）
npm run tauri build -- --target x86_64-apple-darwin

# 为特定平台构建（macOS Apple Silicon）
npm run tauri build -- --target aarch64-apple-darwin
```

### 使用GitHub Actions进行多平台构建

本项目配置了GitHub Actions工作流，可以在推送标签或手动触发时为所有平台（Windows, macOS, Linux）构建发布包。

1. 在GitHub上创建一个新的release
2. 触发GitHub Actions工作流
3. 构建完成后，发布包将自动上传到release页面

## 许可证

MIT 