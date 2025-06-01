import './style.css';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

document.addEventListener('DOMContentLoaded', () => {
  // 创建应用结构
  const appDiv = document.getElementById('app');
  appDiv.innerHTML = `
    <div class="container">
      <header>
        <h1>图片批量重命名工具</h1>
        <div class="subtitle">简单、高效的图片重命名工具</div>
      </header>
      
      <div class="section">
        <h2 class="section-title">第一步：选择图片文件</h2>
        <div class="file-selection">
          <div class="button-group">
            <button id="selectFolderBtn">选择文件夹</button>
            <button id="selectFilesBtn">选择图片文件</button>
          </div>
          <div class="selected-path" id="selectedPath">未选择任何文件或文件夹</div>
          <div class="file-list" id="fileList" style="display: none;"></div>
        </div>
      </div>
      
      <div class="section">
        <h2 class="section-title">第二步：设置命名选项</h2>
        <div class="form-row">
          <label for="prefixInput">文件名前缀:</label>
          <input type="text" id="prefixInput" value="img" placeholder="例如：img">
        </div>
        <div class="form-row">
          <label for="startNumberInput">起始序号:</label>
          <input type="number" id="startNumberInput" value="1" min="1">
        </div>
        <div class="form-row">
          <label></label>
          <div>
            <input type="checkbox" id="renameFolderCheckbox" checked>
            <label for="renameFolderCheckbox">完成后重命名包含文件夹</label>
          </div>
        </div>
        <div class="preview" id="previewBox">
          命名预览: img_1_240601_123456.jpg
        </div>
      </div>
      
      <div class="section">
        <h2 class="section-title">第三步：开始重命名</h2>
        <button id="startBtn" class="btn-success" disabled>开始重命名</button>
        <div class="progress" id="progressContainer" style="display: none; margin-top: 15px;">
          <div class="progress-bar" id="progressBar"></div>
        </div>
        <div id="statusContainer" style="display: none;"></div>
      </div>
      
      <footer>
        <p>© 2023-2025 图片批量重命名工具 - Tauri版本</p>
      </footer>
    </div>
  `;

  // 获取DOM元素
  const selectFolderBtn = document.getElementById('selectFolderBtn');
  const selectFilesBtn = document.getElementById('selectFilesBtn');
  const selectedPath = document.getElementById('selectedPath');
  const fileList = document.getElementById('fileList');
  const prefixInput = document.getElementById('prefixInput');
  const startNumberInput = document.getElementById('startNumberInput');
  const renameFolderCheckbox = document.getElementById('renameFolderCheckbox');
  const previewBox = document.getElementById('previewBox');
  const startBtn = document.getElementById('startBtn');
  const progressContainer = document.getElementById('progressContainer');
  const progressBar = document.getElementById('progressBar');
  const statusContainer = document.getElementById('statusContainer');

  // 应用状态
  let state = {
    selectedFolder: null,
    selectedFiles: [],
    prefix: 'img',
    startNumber: 1,
    renameFolder: true,
    processing: false
  };

  // 初始化应用
  async function initialize() {
    try {
      // 获取上次使用的序号
      const lastNumber = await invoke('get_last_number');
      startNumberInput.value = lastNumber;
      state.startNumber = lastNumber;
      
      // 获取上次使用的前缀
      const lastPrefix = await invoke('get_last_prefix');
      prefixInput.value = lastPrefix;
      state.prefix = lastPrefix;
      
      updatePreview();
    } catch (error) {
      console.error('初始化时出错:', error);
    }
  }

  // 事件监听
  selectFolderBtn.addEventListener('click', async () => {
    try {
      console.log("选择文件夹按钮被点击");
      // 打开文件夹选择对话框
      const selected = await open({
        directory: true,
        multiple: false,
        title: '选择图片文件夹'
      });

      console.log("选择结果:", selected);

      if (!selected) {
        // 用户取消了选择
        console.log("用户取消了选择");
        return;
      }

      const folderPath = selected;
      state.selectedFolder = folderPath;
      state.selectedFiles = [];

      selectedPath.textContent = `已选择文件夹: ${folderPath}`;
      console.log("选择的文件夹路径:", folderPath);

      // 获取文件夹中的图片文件
      try {
        const files = await invoke('get_image_files', { folderPath });
        state.selectedFiles = files;
        console.log("获取到的图片文件:", files);

        // 显示文件列表
        displayFileList(files);

        // 启用开始按钮
        startBtn.disabled = files.length === 0;

        // 如果没有找到图片文件
        if (files.length === 0) {
          alert('所选文件夹中没有找到图片文件');
        }
      } catch (error) {
        console.error('获取图片文件时出错:', error);
        alert(`获取图片文件时出错: ${error}`);
        resetFileSelection();
      }
    } catch (error) {
      console.error('选择文件夹时出错:', error);
      alert(`选择文件夹时出错: ${error}`);
    }
  });

  selectFilesBtn.addEventListener('click', async () => {
    try {
      console.log("选择文件按钮被点击");
      // 打开文件选择对话框
      const selected = await open({
        multiple: true,
        filters: [{
          name: '图片文件',
          extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp']
        }],
        title: '选择图片文件'
      });

      console.log("选择结果:", selected);

      if (!selected) {
        // 用户取消了选择
        console.log("用户取消了选择");
        return;
      }

      // 确保选择的是一个数组
      const filePaths = Array.isArray(selected) ? selected : [selected];
      console.log("文件路径:", filePaths);

      state.selectedFolder = null;
      state.selectedFiles = filePaths;

      if (filePaths.length === 1) {
        // 使用 JavaScript 内置方法获取文件名
        const fileName = filePaths[0].split('/').pop().split('\\').pop();
        selectedPath.textContent = `已选择文件: ${fileName}`;
      } else {
        selectedPath.textContent = `已选择 ${filePaths.length} 个文件`;
      }

      // 显示文件列表
      displayFileList(filePaths);

      // 启用开始按钮
      startBtn.disabled = filePaths.length === 0;
    } catch (error) {
      console.error('选择文件时出错:', error);
      alert(`选择文件时出错: ${error}`);
    }
  });

  prefixInput.addEventListener('input', () => {
    state.prefix = prefixInput.value;
    updatePreview();
  });

  startNumberInput.addEventListener('input', () => {
    state.startNumber = parseInt(startNumberInput.value, 10) || 1;
    updatePreview();
  });

  renameFolderCheckbox.addEventListener('change', () => {
    state.renameFolder = renameFolderCheckbox.checked;
  });

  startBtn.addEventListener('click', async () => {
    if (state.processing) return;

    if (!state.selectedFiles.length) {
      alert('请先选择文件夹或图片文件');
      return;
    }

    try {
      state.processing = true;
      startBtn.disabled = true;
      startBtn.textContent = '处理中...';
      progressContainer.style.display = 'block';
      progressBar.style.width = '0%';
      statusContainer.style.display = 'none';

      // 准备参数
      const options = {
        files: state.selectedFiles,
        prefix: state.prefix,
        start_number: state.startNumber,
        rename_folder: state.renameFolder
      };

      // 先显示进度条动画
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 5;
        if (progress > 95) {
          clearInterval(progressInterval);
        } else {
          progressBar.style.width = `${progress}%`;
        }
      }, 100);

      // 重命名文件
      const results = await invoke('rename_files', { options });

      // 完成进度条
      clearInterval(progressInterval);
      progressBar.style.width = '100%';

      // 显示结果
      setTimeout(() => {
        displayResults(results);

        // 重置状态
        state.processing = false;
        startBtn.disabled = false;
        startBtn.textContent = '开始重命名';
      }, 500);
    } catch (error) {
      console.error('重命名时出错:', error);
      alert(`操作失败: ${error}`);

      state.processing = false;
      startBtn.disabled = false;
      startBtn.textContent = '开始重命名';
      progressContainer.style.display = 'none';
    }
  });

  // 辅助函数
  function updatePreview() {
    const today = new Date();
    const year = today.getFullYear().toString().slice(2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}${month}${day}`;
    const randomString = Math.floor(100000 + Math.random() * 900000).toString();

    previewBox.textContent = `命名预览: ${state.prefix}_${state.startNumber}_${formattedDate}_${randomString}.jpg`;
  }

  async function displayFileList(files) {
    if (!files || files.length === 0) {
      fileList.style.display = 'none';
      return;
    }

    fileList.innerHTML = '';
    fileList.style.display = 'block';

    const maxDisplay = 100; // 最多显示的文件数量
    const displayCount = Math.min(files.length, maxDisplay);

    for (let i = 0; i < displayCount; i++) {
      const filePath = files[i];
      // 使用 JavaScript 内置方法获取文件名
      const fileName = filePath.split('/').pop().split('\\').pop();

      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      fileItem.textContent = fileName;

      fileList.appendChild(fileItem);
    }

    if (files.length > maxDisplay) {
      const moreItem = document.createElement('div');
      moreItem.className = 'file-item';
      moreItem.textContent = `...以及其他 ${files.length - maxDisplay} 个文件`;
      fileList.appendChild(moreItem);
    }
  }

  function displayResults(results) {
    statusContainer.innerHTML = '';
    statusContainer.style.display = 'block';
    progressContainer.style.display = 'none';

    // 成功重命名的文件
    if (results.success && results.success.length > 0) {
      const successDiv = document.createElement('div');
      successDiv.className = 'status success';

      const successTitle = document.createElement('div');
      successTitle.className = 'status-title';
      successTitle.textContent = `成功重命名 ${results.success.length} 个文件`;
      successDiv.appendChild(successTitle);

      const maxDisplay = 10; // 最多显示的结果数量
      const displayCount = Math.min(results.success.length, maxDisplay);

      const successList = document.createElement('ul');
      successList.className = 'status-list';

      for (let i = 0; i < displayCount; i++) {
        const item = results.success[i];
        const listItem = document.createElement('li');
        listItem.className = 'status-item';
        listItem.textContent = `${item.original} → ${item.new}`;
        successList.appendChild(listItem);
      }

      if (results.success.length > maxDisplay) {
        const moreItem = document.createElement('li');
        moreItem.className = 'status-item';
        moreItem.textContent = `...以及其他 ${results.success.length - maxDisplay} 个文件`;
        successList.appendChild(moreItem);
      }

      successDiv.appendChild(successList);
      statusContainer.appendChild(successDiv);
    }

    // 重命名失败的文件
    if (results.error && results.error.length > 0) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'status error';

      const errorTitle = document.createElement('div');
      errorTitle.className = 'status-title';
      errorTitle.textContent = `${results.error.length} 个文件重命名失败`;
      errorDiv.appendChild(errorTitle);

      const errorList = document.createElement('ul');
      errorList.className = 'status-list';

      for (let i = 0; i < results.error.length; i++) {
        const item = results.error[i];
        const listItem = document.createElement('li');
        listItem.className = 'status-item';
        listItem.textContent = `${item.file}: ${item.error}`;
        errorList.appendChild(listItem);
      }

      errorDiv.appendChild(errorList);
      statusContainer.appendChild(errorDiv);
    }

    // 文件夹重命名结果
    if (results.folder_renamed) {
      const folderDiv = document.createElement('div');
      folderDiv.className = 'status success';

      const folderTitle = document.createElement('div');
      folderTitle.className = 'status-title';
      folderTitle.textContent = '文件夹重命名成功';
      folderDiv.appendChild(folderTitle);

      const folderInfo = document.createElement('p');
      folderInfo.textContent = `${results.folder_renamed.original} → ${results.folder_renamed.new}`;
      folderDiv.appendChild(folderInfo);

      statusContainer.appendChild(folderDiv);
    } else if (results.folder_rename_error) {
      const folderErrorDiv = document.createElement('div');
      folderErrorDiv.className = 'status error';

      const folderErrorTitle = document.createElement('div');
      folderErrorTitle.className = 'status-title';
      folderErrorTitle.textContent = '文件夹重命名失败';
      folderErrorDiv.appendChild(folderErrorTitle);

      const folderErrorInfo = document.createElement('p');
      folderErrorInfo.textContent = results.folder_rename_error;
      folderErrorDiv.appendChild(folderErrorInfo);

      statusContainer.appendChild(folderErrorDiv);
    }

    // 重置文件选择
    resetFileSelection();
  }

  function resetFileSelection() {
    state.selectedFolder = null;
    state.selectedFiles = [];
    selectedPath.textContent = '未选择任何文件或文件夹';
    fileList.style.display = 'none';
    startBtn.disabled = true;
  }

  // 启动应用
  initialize();
  updatePreview();
}); 