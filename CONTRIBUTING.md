# 贡献指南

感谢您考虑为图片批量重命名工具做出贡献！以下是参与本项目的指南。

## 开发环境设置

1. **克隆仓库**
   ```bash
   git clone https://github.com/您的用户名/file_rename_tool.git
   cd file_rename_tool
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run tauri dev
   ```

## 代码规范

- 请遵循项目现有的代码风格和格式。
- 前端代码使用ESLint和Prettier进行格式检查。
- Rust代码使用`cargo fmt`和`cargo clippy`进行格式化和代码质量检查。

## 提交流程

1. 为您的贡献创建一个新分支：
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. 提交您的更改：
   ```bash
   git commit -m "feat: 添加新功能"
   ```
   请遵循[约定式提交](https://www.conventionalcommits.org/)规范。

3. 推送到您的分支：
   ```bash
   git push origin feature/your-feature-name
   ```

4. 创建Pull Request并描述您的更改。

## Pull Request指南

- 确保PR只解决一个问题或添加一个功能。
- 提供清晰的描述，说明您的更改解决了什么问题。
- 如果适用，包括屏幕截图或动画GIF演示功能。
- 确保所有测试通过。

## 功能请求和Bug报告

- 使用GitHub Issues提交功能请求或Bug报告。
- 对于Bug报告，请提供详细的复现步骤和环境信息。
- 对于功能请求，请描述您希望看到的功能以及它将如何增强应用程序。

## 许可证

通过提交PR，您同意您的贡献将在[MIT许可证](LICENSE)下获得许可。 