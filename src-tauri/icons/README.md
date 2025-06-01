# 图标文件

这个目录存放应用程序的图标文件。

## 生成图标文件

要生成所有必要的图标文件，您需要安装 ImageMagick：

- macOS: `brew install imagemagick`
- Ubuntu/Debian: `sudo apt-get install imagemagick`
- Windows: 从 https://imagemagick.org/script/download.php 下载安装

然后运行生成脚本：

```bash
node generate_icons.js
```

## 使用默认图标

如果您不想生成自定义图标，可以从 Tauri 仓库复制默认图标：

```bash
# 从终端运行 (在src-tauri目录下)
curl -L https://github.com/tauri-apps/tauri/blob/dev/examples/.icons/32x32.png -o icons/32x32.png
curl -L https://github.com/tauri-apps/tauri/blob/dev/examples/.icons/128x128.png -o icons/128x128.png
curl -L https://github.com/tauri-apps/tauri/blob/dev/examples/.icons/128x128@2x.png -o icons/128x128@2x.png
curl -L https://github.com/tauri-apps/tauri/blob/dev/examples/.icons/icon.icns -o icons/icon.icns
curl -L https://github.com/tauri-apps/tauri/blob/dev/examples/.icons/icon.ico -o icons/icon.ico
```

## 需要的图标文件

tauri.conf.json 中指定的所有图标文件：

- 32x32.png
- 128x128.png
- 128x128@2x.png
- icon.icns (macOS)
- icon.ico (Windows) 