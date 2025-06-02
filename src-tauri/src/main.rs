// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use chrono::Local;
use rand::{distributions::Alphanumeric, Rng};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use dirs::home_dir;

// 支持的图片扩展名
const IMAGE_EXTENSIONS: [&str; 7] = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp"];
// 最大文件名长度
const MAX_FILENAME_LENGTH: usize = 22;
// 最大前缀长度
const MAX_PREFIX_LENGTH: usize = 4;

// 重命名参数
#[derive(Debug, Deserialize)]
struct RenameOptions {
    files: Vec<String>,
    prefix: String,
    start_number: u32,
    rename_folder: bool,
}

// 重命名结果
#[derive(Debug, Serialize)]
struct RenameResult {
    success: Vec<FileRename>,
    error: Vec<FileError>,
    folder_renamed: Option<FolderRename>,
    folder_rename_error: Option<String>,
}

// 成功重命名的文件信息
#[derive(Debug, Serialize)]
struct FileRename {
    original: String,
    new: String,
}

// 重命名失败的文件信息
#[derive(Debug, Serialize)]
struct FileError {
    file: String,
    error: String,
}

// 文件夹重命名信息
#[derive(Debug, Serialize)]
struct FolderRename {
    original: String,
    new: String,
}

// 配置文件
#[derive(Debug, Serialize, Deserialize)]
struct Config {
    last_number: u32,
    last_prefix: String,
}

// 命令：获取上次使用的序号
#[tauri::command]
fn get_last_number() -> Result<u32, String> {
    // 配置文件路径
    let config_path = match get_config_path() {
        Some(path) => path,
        None => return Err("无法获取配置文件路径".to_string()),
    };

    // 尝试读取配置文件
    if let Ok(content) = fs::read_to_string(&config_path) {
        if let Ok(config) = serde_json::from_str::<Config>(&content) {
            return Ok(config.last_number);
        }
    }

    // 如果配置文件不存在或无法解析，创建默认配置
    let config = Config { 
        last_number: 1,
        last_prefix: "img".to_string()
    };
    if let Ok(content) = serde_json::to_string_pretty(&config) {
        let _ = fs::write(&config_path, content);
    }

    Ok(1)
}

// 命令：获取上次使用的前缀
#[tauri::command]
fn get_last_prefix() -> Result<String, String> {
    // 配置文件路径
    let config_path = match get_config_path() {
        Some(path) => path,
        None => return Err("无法获取配置文件路径".to_string()),
    };

    // 尝试读取配置文件
    if let Ok(content) = fs::read_to_string(&config_path) {
        if let Ok(config) = serde_json::from_str::<Config>(&content) {
            return Ok(config.last_prefix);
        }
    }

    // 如果配置文件不存在或无法解析，返回默认前缀
    Ok("img".to_string())
}

// 命令：获取图片文件
#[tauri::command]
fn get_image_files(folder_path: String) -> Result<Vec<String>, String> {
    let path = Path::new(&folder_path);
    if !path.exists() || !path.is_dir() {
        return Err(format!("文件夹 '{}' 不存在", folder_path));
    }

    let mut image_files = Vec::new();
    collect_image_files(path, &mut image_files)?;

    Ok(image_files)
}

// 命令：重命名文件
#[tauri::command]
fn rename_files(options: RenameOptions) -> Result<RenameResult, String> {
    // 打印输入参数
    println!("接收到的参数: files={}, prefix={}, start_number={}, rename_folder={}", 
        options.files.len(), options.prefix, options.start_number, options.rename_folder);
    
    let mut result = RenameResult {
        success: Vec::new(),
        error: Vec::new(),
        folder_renamed: None,
        folder_rename_error: None,
    };

    if options.files.is_empty() {
        return Err("没有找到可处理的文件".to_string());
    }
    
    // 验证并限制前缀长度
    let prefix = if options.prefix.len() > MAX_PREFIX_LENGTH {
        options.prefix[0..MAX_PREFIX_LENGTH].to_string()
    } else {
        options.prefix.clone()
    };

    // 获取当前日期并格式化为YYMMDD
    let now = Local::now();
    let formatted_date = now.format("%y%m%d").to_string();

    // 获取目标文件夹
    let mut target_folder = None;
    if !options.files.is_empty() {
        target_folder = Path::new(&options.files[0]).parent().map(|p| p.to_path_buf());
    }

    // 记录开始和结束序号
    let mut end_number = options.start_number;

    // 重命名文件
    for (i, file_path_str) in options.files.iter().enumerate() {
        let file_path = Path::new(file_path_str);
        if !file_path.exists() || !file_path.is_file() {
            result.error.push(FileError {
                file: file_path.file_name().unwrap_or_default().to_string_lossy().to_string(),
                error: "文件不存在".to_string(),
            });
            continue;
        }

        let extension = match file_path.extension() {
            Some(ext) => format!(".{}", ext.to_string_lossy()),
            None => "".to_string(),
        };

        if !IMAGE_EXTENSIONS.contains(&extension.to_lowercase().as_str()) {
            result.error.push(FileError {
                file: file_path.file_name().unwrap_or_default().to_string_lossy().to_string(),
                error: "不是支持的图片格式".to_string(),
            });
            continue;
        }

        // 计算已使用的文件名长度
        let current_number = options.start_number + i as u32;
        end_number = current_number;
        
        // 计算固定部分长度: 前缀_编号_日期_ (不包括扩展名)
        let num_str = current_number.to_string();
        let fixed_parts_len = prefix.len() + 1 + num_str.len() + 1 + formatted_date.len() + 1;
        
        // 计算可用于随机字符串的长度 (MAX_FILENAME_LENGTH不包括扩展名)
        let random_str_len = if fixed_parts_len >= MAX_FILENAME_LENGTH {
            // 如果固定部分已经超过最大长度，使用最小随机长度
            2
        } else {
            // 否则，使用剩余空间，但至少为2个字符
            std::cmp::max(2, MAX_FILENAME_LENGTH - fixed_parts_len)
        };
        
        // 生成随机字符串
        let random_string: String = rand::thread_rng()
            .sample_iter(&Alphanumeric)
            .take(random_str_len)
            .map(char::from)
            .collect();

        // 创建新文件名
        let new_file_name = format!(
            "{}_{}_{}_{}{}",
            prefix, current_number, formatted_date, random_string, extension
        );

        let new_file_path = file_path.with_file_name(&new_file_name);

        // 执行重命名
        match fs::rename(file_path, &new_file_path) {
            Ok(_) => {
                result.success.push(FileRename {
                    original: file_path.file_name().unwrap_or_default().to_string_lossy().to_string(),
                    new: new_file_name,
                });
            }
            Err(e) => {
                result.error.push(FileError {
                    file: file_path.file_name().unwrap_or_default().to_string_lossy().to_string(),
                    error: e.to_string(),
                });
            }
        }
    }

    // 如果需要，重命名文件夹
    if options.rename_folder && target_folder.is_some() && !result.success.is_empty() {
        println!("开始重命名文件夹，rename_folder=true, files_success={}", result.success.len());
        let folder = target_folder.unwrap();
        println!("目标文件夹: {}", folder.display());
        
        if let Some(parent_dir) = folder.parent() {
            println!("父目录: {}", parent_dir.display());
            let folder_name = folder.file_name().unwrap_or_default().to_string_lossy();
            println!("原文件夹名: {}", folder_name);
            
            let new_folder_name = format!(
                "{}_{} {}-{} {}张",
                prefix,
                formatted_date, 
                options.start_number, 
                end_number, 
                result.success.len()
            );
            println!("新文件夹名: {}", new_folder_name);
            
            let new_folder_path = parent_dir.join(&new_folder_name);
            println!("新文件夹路径: {}", new_folder_path.display());

            match fs::rename(&folder, &new_folder_path) {
                Ok(_) => {
                    println!("文件夹重命名成功");
                    result.folder_renamed = Some(FolderRename {
                        original: folder_name.to_string(),
                        new: new_folder_name,
                    });
                }
                Err(e) => {
                    println!("文件夹重命名失败: {}", e);
                    result.folder_rename_error = Some(e.to_string());
                }
            }
        } else {
            println!("无法获取父目录");
        }
    } else {
        println!("跳过文件夹重命名: rename_folder={}, has_target_folder={}, success_files={}",
            options.rename_folder, 
            target_folder.is_some(), 
            result.success.len());
    }

    // 保存最后使用的序号到配置文件
    let config = Config {
        last_number: end_number + 1,
        last_prefix: prefix,
    };
    
    if let Some(config_path) = get_config_path() {
        if let Ok(content) = serde_json::to_string_pretty(&config) {
            let _ = fs::write(config_path, content);
        }
    }

    Ok(result)
}

// 辅助函数：获取配置文件路径
fn get_config_path() -> Option<PathBuf> {
    if let Some(app_data_dir) = home_dir() {
        let config_dir = app_data_dir.join(".image_rename_tool");
        if !config_dir.exists() {
            let _ = fs::create_dir_all(&config_dir);
        }
        return Some(config_dir.join("config.json"));
    }
    None
}

// 辅助函数：递归收集图片文件
fn collect_image_files(dir: &Path, result: &mut Vec<String>) -> Result<(), String> {
    if !dir.is_dir() {
        return Err(format!("路径 '{}' 不是文件夹", dir.display()));
    }

    let entries = match fs::read_dir(dir) {
        Ok(entries) => entries,
        Err(e) => return Err(format!("读取文件夹时出错: {}", e)),
    };

    for entry in entries {
        let entry = match entry {
            Ok(entry) => entry,
            Err(e) => {
                println!("读取目录条目时出错: {}", e);
                continue;
            }
        };

        let path = entry.path();
        if path.is_dir() {
            let _ = collect_image_files(&path, result);
        } else if let Some(ext) = path.extension() {
            let extension = format!(".{}", ext.to_string_lossy().to_lowercase());
            if IMAGE_EXTENSIONS.contains(&extension.as_str()) {
                result.push(path.to_string_lossy().to_string());
            }
        }
    }

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            get_last_number,
            get_last_prefix,
            get_image_files,
            rename_files
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
} 