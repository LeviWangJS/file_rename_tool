# 项目结构说明

本文档介绍了图片批量重命名工具的项目结构。

## 目录结构

```
file_rename_tool/
├── .github/workflows/       # GitHub Actions工作流配置
│   └── release.yml          # 发布工作流
├── public/                  # 公共资源
├── release-builds/          # 构建输出目录
├── src/                     # 前端源代码
│   ├── App.css              # 应用样式
│   ├── App.jsx              # 主应用组件
│   ├── assets/              # 前端资源
│   ├── components/          # UI组件
│   ├── main.jsx             # 应用入口
│   └── styles/              # 样式文件
├── src-tauri/               # Tauri/Rust后端
│   ├── Cargo.toml           # Rust依赖配置
│   ├── build.rs             # Tauri构建脚本
│   ├── icons/               # 应用图标
│   ├── src/                 # Rust源代码
│   │   └── main.rs          # 后端主入口
│   └── tauri.conf.json      # Tauri配置
├── .gitignore               # Git忽略文件
├── LICENSE                  # MIT许可证
├── README.md                # 项目说明
├── STRUCTURE.md             # 本文档
├── index.html               # HTML入口
├── package.json             # NPM配置
└── vite.config.js           # Vite配置
```

## 关键文件说明

### 前端

- **src/App.jsx**: 前端主界面，包含文件选择、重命名选项和结果展示
- **src/components/**: 包含各种UI组件，如文件选择器、选项表单等
- **src/styles/**: 存放全局样式和主题定义

### 后端

- **src-tauri/src/main.rs**: Rust后端代码，实现文件重命名核心逻辑
- **src-tauri/Cargo.toml**: 定义Rust依赖和构建配置
- **src-tauri/tauri.conf.json**: Tauri应用配置，包括应用名称、权限等

### 构建和部署

- **.github/workflows/release.yml**: GitHub Actions配置，自动构建多平台安装包
- **package.json**: 定义NPM脚本、依赖和项目元数据 