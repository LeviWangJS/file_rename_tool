const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 检查是否安装了ImageMagick
try {
  execSync('convert -version', { stdio: 'ignore' });
} catch (e) {
  console.error('Error: ImageMagick is not installed. Please install it first.');
  console.error('macOS: brew install imagemagick');
  console.error('Ubuntu/Debian: sudo apt-get install imagemagick');
  console.error('Windows: Download from https://imagemagick.org/script/download.php');
  process.exit(1);
}

const svgPath = path.join(__dirname, 'icon.svg');
const sizes = [
  { name: '32x32.png', size: 32 },
  { name: '128x128.png', size: 128 },
  { name: '128x128@2x.png', size: 256 },
];

// 检查SVG文件是否存在
if (!fs.existsSync(svgPath)) {
  console.error(`Error: SVG file not found at ${svgPath}`);
  process.exit(1);
}

// 生成各种尺寸的PNG图标
for (const { name, size } of sizes) {
  const outputPath = path.join(__dirname, name);
  try {
    execSync(`convert -background none -size ${size}x${size} ${svgPath} ${outputPath}`);
    console.log(`Generated ${name} (${size}x${size})`);
  } catch (e) {
    console.error(`Error generating ${name}: ${e.message}`);
  }
}

// 生成macOS图标 (.icns)
try {
  const icnsPath = path.join(__dirname, 'icon.icns');
  execSync(`convert -background none ${svgPath} -define icon:auto-resize=16,32,64,128,256,512 ${icnsPath}`);
  console.log('Generated icon.icns');
} catch (e) {
  console.error(`Error generating icon.icns: ${e.message}`);
}

// 生成Windows图标 (.ico)
try {
  const icoPath = path.join(__dirname, 'icon.ico');
  execSync(`convert -background none ${svgPath} -define icon:auto-resize=16,32,48,64,128,256 ${icoPath}`);
  console.log('Generated icon.ico');
} catch (e) {
  console.error(`Error generating icon.ico: ${e.message}`);
}

console.log('Icon generation complete.'); 