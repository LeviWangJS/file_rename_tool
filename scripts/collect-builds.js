/**
 * 构建产物收集脚本
 * 将各平台的构建产物复制到根目录下的dist文件夹中
 */

import { existsSync, mkdirSync, copyFileSync, readdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// 创建dist目录
const distDir = join(rootDir, 'dist');
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// 产物路径配置
const buildPaths = {
  macosArm: {
    dmg: join(rootDir, 'src-tauri/target/release/bundle/dmg/图片批量重命名工具_1.0.0_x64.dmg'),
    app: join(rootDir, 'src-tauri/target/release/bundle/macos/图片批量重命名工具.app')
  },
  macosIntel: {
    dmg: join(rootDir, 'src-tauri/target/x86_64-apple-darwin/release/bundle/dmg/图片批量重命名工具_1.0.0_x64.dmg'),
    app: join(rootDir, 'src-tauri/target/x86_64-apple-darwin/release/bundle/macos/图片批量重命名工具.app')
  },
  windows: {
    exe: join(rootDir, 'src-tauri/target/release/bundle/nsis/图片批量重命名工具_1.0.0_x64-setup.exe')
  }
};

// 输出文件路径配置
const outputPaths = {
  macosArm: {
    dmg: join(distDir, '图片批量重命名工具_1.0.0_macOS_arm64.dmg'),
    app: join(distDir, '图片批量重命名工具_macOS_arm64.app')
  },
  macosIntel: {
    dmg: join(distDir, '图片批量重命名工具_1.0.0_macOS_x64.dmg'),
    app: join(distDir, '图片批量重命名工具_macOS_x64.app')
  },
  windows: {
    exe: join(distDir, '图片批量重命名工具_1.0.0_Windows_x64-setup.exe')
  }
};

/**
 * 复制文件，如果文件不存在则跳过并显示警告
 */
function copyFileIfExists(source, destination) {
  try {
    if (existsSync(source)) {
      // 对于目录（如.app），我们需要使用不同的复制方法
      if (source.endsWith('.app')) {
        console.log(`注意: .app目录无法通过简单复制，请手动复制: ${source}`);
        return false;
      }
      
      copyFileSync(source, destination);
      console.log(`✅ 已复制: ${destination}`);
      return true;
    } else {
      console.warn(`⚠️ 源文件不存在，跳过: ${source}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ 复制失败 (${source} -> ${destination}): ${error.message}`);
    return false;
  }
}

// 复制macOS ARM64构建产物
console.log('📦 收集macOS ARM64构建产物...');
copyFileIfExists(buildPaths.macosArm.dmg, outputPaths.macosArm.dmg);

// 复制macOS Intel构建产物
console.log('📦 收集macOS Intel构建产物...');
copyFileIfExists(buildPaths.macosIntel.dmg, outputPaths.macosIntel.dmg);

// 复制Windows构建产物
console.log('📦 收集Windows构建产物...');
// 尝试查找Windows NSIS安装程序
if (!existsSync(buildPaths.windows.exe)) {
  console.log('🔍 Windows安装程序路径不存在，尝试查找...');
  const nsisDir = join(rootDir, 'src-tauri/target/release/bundle/nsis');
  
  if (existsSync(nsisDir)) {
    const files = readdirSync(nsisDir);
    const setupFile = files.find(file => file.includes('-setup.exe'));
    
    if (setupFile) {
      const foundPath = join(nsisDir, setupFile);
      console.log(`🔍 找到Windows安装程序: ${foundPath}`);
      copyFileIfExists(foundPath, outputPaths.windows.exe);
    } else {
      console.warn('⚠️ 无法找到Windows安装程序');
    }
  } else {
    console.warn('⚠️ Windows NSIS目录不存在');
  }
} else {
  copyFileIfExists(buildPaths.windows.exe, outputPaths.windows.exe);
}

// 总结
console.log('\n📋 构建产物收集完成!');
console.log(`📂 所有文件已复制到: ${distDir}`);
console.log('以下文件可用:');
if (existsSync(outputPaths.macosArm.dmg)) {
  console.log(`- macOS ARM64 DMG: ${outputPaths.macosArm.dmg}`);
}
if (existsSync(outputPaths.macosIntel.dmg)) {
  console.log(`- macOS Intel DMG: ${outputPaths.macosIntel.dmg}`);
}
if (existsSync(outputPaths.windows.exe)) {
  console.log(`- Windows Setup EXE: ${outputPaths.windows.exe}`);
} 