/**
 * 多平台构建脚本
 * 根据当前运行的操作系统执行相应的构建任务
 */

import { execSync } from 'child_process';
import { platform } from 'os';
import { existsSync, mkdirSync } from 'fs';
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

// 确定当前运行的操作系统
const currentOS = platform();
console.log(`当前操作系统: ${currentOS}`);

/**
 * 执行命令并显示输出
 */
function runCommand(command, description) {
  console.log(`\n📌 ${description}...`);
  console.log(`执行命令: ${command}\n`);
  
  try {
    execSync(command, { stdio: 'inherit', cwd: rootDir });
    console.log(`\n✅ ${description}完成!`);
    return true;
  } catch (error) {
    console.error(`\n❌ ${description}失败: ${error.message}`);
    return false;
  }
}

// 根据操作系统执行对应的构建任务
switch (currentOS) {
  case 'darwin': // macOS
    console.log('🍎 在macOS上构建多平台版本');
    
    // 构建macOS ARM64版本
    runCommand('npm run build:macos-arm', 'macOS ARM64构建');
    
    // 构建macOS Intel版本
    runCommand('npm run build:macos-intel', 'macOS Intel构建');
    
    // 收集构建产物
    runCommand('node scripts/collect-builds.js', '收集构建产物');
    
    console.log('\n📢 注意: 在macOS上无法构建Windows版本，Windows构建需要在Windows系统上执行');
    break;
    
  case 'win32': // Windows
    console.log('🪟 在Windows上构建');
    
    // 构建Windows版本
    runCommand('npm run build:windows', 'Windows构建');
    
    // 收集构建产物
    runCommand('node scripts/collect-builds.js', '收集构建产物');
    
    console.log('\n📢 注意: 在Windows上无法构建macOS版本，macOS构建需要在macOS系统上执行');
    break;
    
  case 'linux': // Linux
    console.log('🐧 在Linux上构建');
    console.log('⚠️ 目前此脚本不支持在Linux上构建，请使用macOS或Windows进行构建');
    break;
    
  default:
    console.error('❌ 不支持的操作系统');
}

console.log('\n📋 构建过程完成!');
console.log(`📂 构建产物已保存在: ${distDir}`);
console.log('可以使用 npm run collect-builds 来收集所有可用的构建产物'); 