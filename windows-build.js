// Windows专用构建脚本
import { execSync } from 'child_process';
import { platform } from 'os';

// 检查当前平台
if (platform() !== 'win32') {
  console.error('错误: 此脚本只能在Windows平台上运行!');
  process.exit(1);
}

// 设置环境变量以跳过MSI构建
process.env.TAURI_WINDOWS_NSIS_ONLY = 'true';
process.env.TAURI_WINDOWS_SKIP_SIGNING = 'true';

try {
  console.log('开始Windows构建 (仅NSIS)...');
  // 执行Tauri构建命令，明确指定只构建NSIS格式
  execSync('npx tauri build --target nsis --config src-tauri/tauri.windows.conf.json', { 
    stdio: 'inherit',
    env: { 
      ...process.env,
      TAURI_WINDOWS_NSIS_ONLY: 'true',
      TAURI_WINDOWS_SKIP_SIGNING: 'true'
    } 
  });
  console.log('Windows构建完成!');
} catch (error) {
  console.error('构建失败:', error);
  process.exit(1);
} 